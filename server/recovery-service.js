import express from 'express'
import cors from 'cors'
import pkg from 'pg'
const { Pool } = pkg
import { generateRecoveryOptionsForDisruption } from './recovery-generator.js'

const app = express()
const port = process.env.RECOVERY_API_PORT || 3002

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))

// PostgreSQL connection (reuse same config as main server)
let connectionString = process.env.DATABASE_URL || 'postgresql://0.0.0.0:5432/aeron_settings'

if (connectionString && connectionString.includes('neon.tech')) {
  try {
    const url = new URL(connectionString)
    const endpointId = url.hostname.split('.')[0]
    const params = new URLSearchParams(url.search)
    params.set('options', `endpoint=${endpointId}`)
    params.set('sslmode', 'require')
    url.search = params.toString()
    connectionString = url.toString()
  } catch (error) {
    console.error('⚠️ Error configuring Neon connection:', error.message)
  }
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
  max: 3,
  min: 1,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
})

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect()
    console.log('✅ Recovery Service: PostgreSQL connected successfully')
    client.release()
  } catch (err) {
    console.log('⚠️ Recovery Service: PostgreSQL connection failed:', err.message)
  }
}

testConnection()

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'healthy',
      service: 'recovery-options-api',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Recovery Service health check failed:', error)
    res.status(500).json({ status: 'unhealthy', error: error.message })
  }
})

// Get flight disruption by flight number or ID
app.get('/flight/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params

    // Try to find by ID first, then by flight number
    let result = await pool.query(
      'SELECT * FROM flight_disruptions WHERE id = $1 OR flight_number = $1 LIMIT 1',
      [identifier]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Flight not found',
        identifier: identifier
      })
    }

    const disruption = result.rows[0]

    // Transform to expected format
    const flight = {
      id: disruption.id?.toString() || disruption.flight_number,
      flightNumber: disruption.flight_number,
      route: disruption.route,
      origin: disruption.origin || 'DXB',
      destination: disruption.destination || 'Unknown',
      originCity: disruption.origin_city || 'Dubai',
      destinationCity: disruption.destination_city || 'Unknown',
      aircraft: disruption.aircraft,
      scheduledDeparture: disruption.scheduled_departure,
      estimatedDeparture: disruption.estimated_departure,
      delay: disruption.delay_minutes || 0,
      passengers: disruption.passengers || 0,
      crew: disruption.crew || 6,
      connectionFlights: disruption.connection_flights || 0,
      severity: disruption.severity,
      type: disruption.disruption_type,
      categorization: disruption.disruption_type, // Add categorization field
      status: disruption.status,
      disruptionReason: disruption.disruption_reason,
      createdAt: disruption.created_at,
      updatedAt: disruption.updated_at
    }

    res.json({ success: true, flight })
  } catch (error) {
    console.error('Error fetching flight:', error)
    res.status(500).json({
      error: 'Failed to fetch flight data',
      details: error.message
    })
  }
})

// Generate recovery options for a specific flight
app.post('/flight/:identifier/recovery-options', async (req, res) => {
  try {
    const { identifier } = req.params
    const { forceRegenerate = false } = req.body

    console.log(`Recovery Service: Generating options for flight ${identifier}`)

    // Get flight data first
    const flightResult = await pool.query(
      'SELECT * FROM flight_disruptions WHERE id = $1 OR flight_number = $1 LIMIT 1',
      [identifier]
    )

    if (flightResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Flight not found',
        identifier: identifier
      })
    }

    const disruption = flightResult.rows[0]
    const disruptionId = disruption.id

    // Check if options already exist (unless force regenerate)
    if (!forceRegenerate) {
      const existingOptions = await pool.query(
        'SELECT COUNT(*) as count FROM recovery_options WHERE disruption_id = $1',
        [disruptionId]
      )

      if (existingOptions.rows[0].count > 0) {
        const optionsResult = await pool.query(
          'SELECT * FROM recovery_options WHERE disruption_id = $1 ORDER BY confidence DESC, priority ASC',
          [disruptionId]
        )

        return res.json({
          success: true,
          flight: {
            id: disruption.id?.toString(),
            flightNumber: disruption.flight_number,
            route: disruption.route,
            disruptionType: disruption.disruption_type
          },
          options: optionsResult.rows,
          fromCache: true,
          message: 'Retrieved existing recovery options'
        })
      }
    }

    // Generate new recovery options
    const { options, steps } = generateRecoveryOptionsForDisruption(disruption)

    // Clear existing data if regenerating
    if (forceRegenerate) {
      await pool.query('DELETE FROM recovery_steps WHERE disruption_id = $1', [disruptionId])
      await pool.query('DELETE FROM recovery_options WHERE disruption_id = $1', [disruptionId])
    }

    // Save recovery steps
    for (const step of steps) {
      // Check if step already exists
      const existingStep = await pool.query(
        'SELECT id FROM recovery_steps WHERE disruption_id = $1 AND step_number = $2',
        [disruptionId, step.step]
      );

      if (existingStep.rows.length === 0) {
        // Insert new step only if it doesn't exist
        await pool.query(`
          INSERT INTO recovery_steps (
            disruption_id, step_number, title, status, timestamp,
            system, details, step_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          disruptionId, step.step, step.title, step.status,
          step.timestamp, step.system, step.details,
          step.data ? JSON.stringify(step.data) : null
        ]);
      }
    }

    // Save recovery options
    const savedOptions = []
    for (let i = 0; i < options.length; i++) {
      const option = options[i]

      // Check if option already exists
      const existingOption = await pool.query(
        'SELECT id FROM recovery_options WHERE disruption_id = $1 AND title = $2',
        [disruptionId, option.title || `Recovery Option ${i + 1}`]
      );

      let result;
      if (existingOption.rows.length > 0) {
        // Update existing option
        result = await pool.query(`
          UPDATE recovery_options SET
            description = $3, cost = $4, timeline = $5, confidence = $6,
            impact = $7, status = $8, updated_at = CURRENT_TIMESTAMP
          WHERE disruption_id = $1 AND title = $2
          RETURNING *
        `, [
          disruptionId,
          option.title || `Recovery Option ${i + 1}`,
          option.description || 'Recovery option details',
          option.cost || 'TBD',
          option.timeline || 'TBD',
          option.confidence || 80,
          option.impact || 'Medium',
          option.status || 'generated'
        ]);
      } else {
        // Insert new option
        result = await pool.query(`
          INSERT INTO recovery_options (
            disruption_id, title, description, cost, timeline,
            confidence, impact, status, priority, advantages, considerations,
            resource_requirements, cost_breakdown, timeline_details,
            risk_assessment, technical_specs, metrics, rotation_plan
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *
        `, [
          disruptionId,
          option.title || `Recovery Option ${i + 1}`,
          option.description || 'Recovery option details',
          option.cost || 'TBD',
          option.timeline || 'TBD',
          option.confidence || 80,
          option.impact || 'Medium',
          option.status || 'generated',
          i + 1, // priority
          option.advantages || [],
          option.considerations || [],
          option.resourceRequirements ? JSON.stringify(option.resourceRequirements) : null,
          option.costBreakdown ? JSON.stringify(option.costBreakdown) : null,
          option.timelineDetails ? JSON.stringify(option.timelineDetails) : null,
          option.riskAssessment ? JSON.stringify(option.riskAssessment) : null,
          option.technicalSpecs ? JSON.stringify(option.technicalSpecs) : null,
          option.metrics ? JSON.stringify(option.metrics) : null,
          option.rotationPlan ? JSON.stringify(option.rotationPlan) : null
        ]);
      }

      savedOptions.push(result.rows[0])
    }

    console.log(`Recovery Service: Generated ${savedOptions.length} options and ${steps.length} steps`)

    res.json({
      success: true,
      flight: {
        id: disruption.id?.toString(),
        flightNumber: disruption.flight_number,
        route: disruption.route,
        disruptionType: disruption.disruption_type
      },
      options: savedOptions,
      steps: steps,
      optionsCount: savedOptions.length,
      stepsCount: steps.length,
      fromCache: false,
      message: `Generated ${savedOptions.length} recovery options successfully`
    })

  } catch (error) {
    console.error('Recovery Service: Error generating options:', error)
    res.status(500).json({
      error: 'Failed to generate recovery options',
      details: error.message
    })
  }
})

// Get existing recovery options for a flight
app.get('/flight/:identifier/recovery-options', async (req, res) => {
  try {
    const { identifier } = req.params

    // Get flight data
    const flightResult = await pool.query(
      'SELECT * FROM flight_disruptions WHERE id = $1 OR flight_number = $1 LIMIT 1',
      [identifier]
    )

    if (flightResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Flight not found',
        identifier: identifier
      })
    }

    const disruption = flightResult.rows[0]
    const disruptionId = disruption.id

    // Get recovery options
    const optionsResult = await pool.query(
      'SELECT * FROM recovery_options WHERE disruption_id = $1 ORDER BY confidence DESC, priority ASC',
      [disruptionId]
    )

    // Get recovery steps
    const stepsResult = await pool.query(
      'SELECT * FROM recovery_steps WHERE disruption_id = $1 ORDER BY step_number ASC',
      [disruptionId]
    )

    res.json({
      success: true,
      flight: {
        id: disruption.id?.toString(),
        flightNumber: disruption.flight_number,
        route: disruption.route,
        disruptionType: disruption.disruption_type
      },
      options: optionsResult.rows,
      steps: stepsResult.rows,
      optionsCount: optionsResult.rows.length,
      stepsCount: stepsResult.rows.length
    })

  } catch (error) {
    console.error('Recovery Service: Error fetching options:', error)
    res.status(500).json({
      error: 'Failed to fetch recovery options',
      details: error.message
    })
  }
})

// Get recovery option details by ID
app.get('/recovery-option/:optionId', async (req, res) => {
  try {
    const { optionId } = req.params

    const result = await pool.query(
      'SELECT * FROM recovery_options WHERE id = $1',
      [optionId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Recovery option not found',
        optionId: optionId
      })
    }

    const option = result.rows[0]

    res.json({
      success: true,
      option: {
        ...option,
        advantages: option.advantages || [],
        considerations: option.considerations || [],
        resourceRequirements: option.resource_requirements || {},
        costBreakdown: option.cost_breakdown || {},
        timelineDetails: option.timeline_details || {},
        riskAssessment: option.risk_assessment || {},
        technicalSpecs: option.technical_specs || {},
        metrics: option.metrics || {},
        rotationPlan: option.rotation_plan || {}
      }
    })

  } catch (error) {
    console.error('Recovery Service: Error fetching option details:', error)
    res.status(500).json({
      error: 'Failed to fetch recovery option details',
      details: error.message
    })
  }
})

// Update recovery option status
app.put('/recovery-option/:optionId/status', async (req, res) => {
  try {
    const { optionId } = req.params
    const { status, notes } = req.body

    const result = await pool.query(`
      UPDATE recovery_options
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, optionId])

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Recovery option not found',
        optionId: optionId
      })
    }

    res.json({
      success: true,
      option: result.rows[0],
      message: `Status updated to ${status}`
    })

  } catch (error) {
    console.error('Recovery Service: Error updating option status:', error)
    res.status(500).json({
      error: 'Failed to update recovery option status',
      details: error.message
    })
  }
})

// Get all active flights with disruptions
app.get('/flights', async (req, res) => {
  try {
    const { status = 'Active' } = req.query

    const result = await pool.query(`
      SELECT id, flight_number, route, origin, destination,
             aircraft, scheduled_departure, delay_minutes,
             passengers, severity, disruption_type, status,
             disruption_reason, created_at
      FROM flight_disruptions
      WHERE status = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [status])

    const flights = result.rows.map(row => ({
      id: row.id?.toString() || row.flight_number,
      flightNumber: row.flight_number,
      route: row.route,
      origin: row.origin,
      destination: row.destination,
      aircraft: row.aircraft,
      scheduledDeparture: row.scheduled_departure,
      delay: row.delay_minutes || 0,
      passengers: row.passengers || 0,
      severity: row.severity,
      type: row.disruption_type,
      status: row.status,
      disruptionReason: row.disruption_reason,
      createdAt: row.created_at
    }))

    res.json({
      success: true,
      flights: flights,
      count: flights.length
    })

  } catch (error) {
    console.error('Recovery Service: Error fetching flights:', error)
    res.status(500).json({
      error: 'Failed to fetch flights',
      details: error.message
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Recovery Service: Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error', service: 'recovery-options-api' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Recovery Options API service running on http://0.0.0.0:${port}`)
  console.log(`🌐 External access: https://${process.env.REPL_SLUG}.${process.env.REPLIT_DEV_DOMAIN}:${port}`)
})

export default app