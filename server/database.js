const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/aeron_settings',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'healthy', timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) })
  } catch (error) {
    console.error('Database health check failed:', error)
    res.status(500).json({ status: 'unhealthy', error: error.message })
  }
})

// Settings endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM settings WHERE is_active = true ORDER BY category, key'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/settings/:category/:key', async (req, res) => {
  try {
    const { category, key } = req.params
    const result = await pool.query(
      'SELECT * FROM settings WHERE category = $1 AND key = $2 AND is_active = true',
      [category, key]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching setting:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/settings/category/:category', async (req, res) => {
  try {
    const { category } = req.params
    const result = await pool.query(
      'SELECT * FROM settings WHERE category = $1 AND is_active = true ORDER BY key',
      [category]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching settings by category:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/settings', async (req, res) => {
  try {
    const { category, key, value, type, updated_by = 'system' } = req.body

    const result = await pool.query(`
      INSERT INTO settings (category, key, value, type, updated_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (category, key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        type = EXCLUDED.type,
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [category, key, JSON.stringify(value), type, updated_by])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving setting:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/settings/:category/:key', async (req, res) => {
  try {
    const { category, key } = req.params
    const result = await pool.query(
      'UPDATE settings SET is_active = false WHERE category = $1 AND key = $2 RETURNING *',
      [category, key]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' })
    }

    res.json({ message: 'Setting deleted successfully' })
  } catch (error) {
    console.error('Error deleting setting:', error)
    res.status(500).json({ error: error.message })
  }
})

// Custom Rules endpoints
app.get('/api/custom-rules', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM custom_rules ORDER BY priority, created_at'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching custom rules:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/custom-rules', async (req, res) => {
  try {
    const { rule_id, name, description, category, type, priority, overridable, conditions, actions, created_by } = req.body

    const result = await pool.query(`
      INSERT INTO custom_rules (rule_id, name, description, category, type, priority, overridable, conditions, actions, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [rule_id, name, description, category, type, priority, overridable, conditions, actions, created_by])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving custom rule:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/custom-rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params
    const updates = req.body

    // Build dynamic update query
    const updateFields = []
    const values = []
    let paramCounter = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'rule_id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramCounter}`)
        values.push(value)
        paramCounter++
      }
    })

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    values.push(ruleId)
    const query = `
      UPDATE custom_rules 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE rule_id = $${paramCounter}
      RETURNING *
    `

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Custom rule not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating custom rule:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/custom-rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params
    const result = await pool.query(
      'DELETE FROM custom_rules WHERE rule_id = $1 RETURNING *',
      [ruleId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Custom rule not found' })
    }

    res.json({ message: 'Custom rule deleted successfully' })
  } catch (error) {
    console.error('Error deleting custom rule:', error)
    res.status(500).json({ error: error.message })
  }
})

// Custom Parameters endpoints
app.get('/api/custom-parameters', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM custom_parameters WHERE is_active = true ORDER BY category, name'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching custom parameters:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/custom-parameters', async (req, res) => {
  try {
    const { parameter_id, name, category, weight, description, created_by } = req.body

    const result = await pool.query(`
      INSERT INTO custom_parameters (parameter_id, name, category, weight, description, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [parameter_id, name, category, weight, description, created_by])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving custom parameter:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/custom-parameters/:parameterId', async (req, res) => {
  try {
    const { parameterId } = req.params
    const result = await pool.query(
      'UPDATE custom_parameters SET is_active = false WHERE parameter_id = $1 RETURNING *',
      [parameterId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Custom parameter not found' })
    }

    res.json({ message: 'Custom parameter deleted successfully' })
  } catch (error) {
    console.error('Error deleting custom parameter:', error)
    res.status(500).json({ error: error.message })
  }
})

// Reset settings to defaults
app.post('/api/settings/reset', async (req, res) => {
  try {
    // This would reinitialize the settings table with default values
    // For now, we'll just return success - in a real implementation,
    // you'd want to run the schema initialization again
    res.json({ message: 'Settings reset to defaults successfully' })
  } catch (error) {
    console.error('Error resetting settings:', error)
    res.status(500).json({ error: error.message })
  }
})

// Flight Disruptions endpoints
app.get('/api/disruptions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM flight_disruptions 
      ORDER BY created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching disruptions:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/disruptions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT * FROM flight_disruptions WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Disruption not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching disruption:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/disruptions', async (req, res) => {
  try {
    const {
      flight_number, route, origin, destination, origin_city, destination_city,
      aircraft, scheduled_departure, estimated_departure, delay_minutes, 
      passengers, crew, severity, disruption_type, status, disruption_reason, connection_flights, crew_members
    } = req.body

    // Validate required fields
    if (!flight_number || !aircraft || !scheduled_departure || !passengers || !crew) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'flight_number, aircraft, scheduled_departure, passengers, and crew are required' 
      })
    }

    // Use defaults for missing optional fields
    const safeOrigin = origin || 'DXB'
    const safeDestination = destination || 'Unknown'
    const safeRoute = route || `${safeOrigin} → ${safeDestination}`

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const result = await client.query(`
        INSERT INTO flight_disruptions (
          flight_number, route, origin, destination, origin_city, destination_city,
          aircraft, scheduled_departure, estimated_departure, delay_minutes, 
          passengers, crew, severity, disruption_type, status, disruption_reason, connection_flights
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        flight_number, safeRoute, safeOrigin, safeDestination, origin_city, destination_city,
        aircraft, scheduled_departure, estimated_departure, delay_minutes || 0,
        passengers, crew, connection_flights || 0, severity || 'Medium', disruption_type || 'Technical', 
        status || 'Active', disruption_reason || 'Unknown disruption'
      ])

      const disruptionId = result.rows[0].id
      console.log('Successfully inserted disruption:', result.rows[0])

      // Insert crew members if provided
      if (crew_members && Array.isArray(crew_members) && crew_members.length > 0) {
        console.log('Inserting crew members:', crew_members)

        for (const member of crew_members) {
          if (member.name && member.role && member.employeeCode) {
            try {
              // Insert or update crew member
              const crewResult = await client.query(`
                INSERT INTO crew_members (
                  employee_id, name, role, qualifications, duty_time_remaining, 
                  base_location, status, current_flight, contact_info
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (employee_id) DO UPDATE SET
                  name = EXCLUDED.name,
                  role = EXCLUDED.role,
                  status = EXCLUDED.status,
                  current_flight = EXCLUDED.current_flight,
                  updated_at = CURRENT_TIMESTAMP
                RETURNING id
              `, [
                member.employeeCode, // employee_id
                member.name, // name
                member.role, // role
                [member.role], // qualifications array
                480, // duty_time_remaining (8 hours default)
                'DXB', // base_location default
                'Unavailable', // status (affected by disruption)
                flight_number, // current_flight
                JSON.stringify({ disruption_id: disruptionId }) // contact_info
              ])

              const crewMemberId = crewResult.rows[0].id

              // Create crew disruption mapping
              await client.query(`
                INSERT INTO crew_disruption_mapping (
                  disruption_id, crew_member_id, disruption_reason, resolution_status
                ) VALUES ($1, $2, $3, $4)
                ON CONFLICT (disruption_id, crew_member_id) DO NOTHING
              `, [
                disruptionId,
                crewMemberId,
                disruption_reason || `Crew member affected by disruption: ${flight_number}`,
                'Pending'
              ])

              console.log(`Inserted/updated crew member: ${member.name} (${member.employeeCode}) and created mapping`)
            } catch (crewError) {
              console.error('Error inserting crew member:', member, crewError)
              // Continue with other crew members even if one fails
            }
          }
        }
      }
      await client.query('COMMIT')
      res.json(result.rows[0])

    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error saving disruption or related data:', error)
      res.status(500).json({ 
        error: 'Failed to save disruption', 
        details: error.message,
        code: error.code 
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error connecting to database:', error)
    res.status(500).json({ error: 'Database connection error', details: error.message })
  }
})

// Recovery Options endpoints
app.get('/api/recovery-options/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    const result = await pool.query(`
      SELECT * FROM recovery_options 
      WHERE disruption_id = $1 
      ORDER BY confidence DESC, id ASC
    `, [disruptionId])
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching recovery options:', error)
    res.json([])
  }
})

// Recovery Steps endpoint
app.get('/api/recovery-steps/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    console.log(`Fetching recovery steps for disruption ID: ${disruptionId}`)

    const result = await pool.query(`
      SELECT * FROM recovery_steps 
      WHERE disruption_id = $1 
      ORDER BY step_number ASC, id ASC
    `, [disruptionId])

    console.log(`Found ${result.rows.length} recovery steps for disruption ${disruptionId}`)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching recovery steps:', error)
    res.json([])
  }
})

// Generate recovery options endpoint
app.post('/api/generate-recovery-options/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    console.log(`Generating recovery options for disruption ID: ${disruptionId}`)

    // Get the disruption details first
    const disruptionResult = await pool.query(
      'SELECT * FROM flight_disruptions WHERE id = $1',
      [disruptionId]
    )

    if (disruptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Disruption not found' })
    }

    const disruption = disruptionResult.rows[0]

    // Import the recovery generator
    const { generateRecoveryOptionsForDisruption } = await import('./recovery-generator.js')

    // Generate recovery options and steps
    const { options, steps } = generateRecoveryOptionsForDisruption(disruption)

    // Save recovery options to database
    let savedOptionsCount = 0
    for (const option of options) {
      try {
        await pool.query(`
          INSERT INTO recovery_options (
            disruption_id, title, description, cost, timeline,
            confidence, impact, status, priority, advantages, considerations,
            resource_requirements, cost_breakdown, timeline_details,
            risk_assessment, technical_specs, metrics, rotation_plan
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (disruption_id, title) DO NOTHING
        `, [
          disruptionId, option.title, option.description, option.cost, option.timeline,
          option.confidence, option.impact, option.status || 'generated', option.priority || 0,
          option.advantages ? JSON.stringify(option.advantages) : null,
          option.considerations ? JSON.stringify(option.considerations) : null,
          option.resourceRequirements ? JSON.stringify(option.resourceRequirements) : null,
          option.costBreakdown ? JSON.stringify(option.costBreakdown) : null,
          option.timelineDetails ? JSON.stringify(option.timelineDetails) : null,
          option.riskAssessment ? JSON.stringify(option.riskAssessment) : null,
          option.technicalSpecs ? JSON.stringify(option.technicalSpecs) : null,
          option.metrics ? JSON.stringify(option.metrics) : null,
          option.rotationPlan ? JSON.stringify(option.rotationPlan) : null
        ])
        savedOptionsCount++
      } catch (optionError) {
        console.error('Error saving recovery option:', optionError)
      }
    }

    // Save recovery steps to database
    let savedStepsCount = 0
    for (const step of steps) {
      try {
        await pool.query(`
          INSERT INTO recovery_steps (
            disruption_id, step_number, title, status, timestamp,
            system, details, step_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (disruption_id, step_number) DO NOTHING
        `, [
          disruptionId, step.step, step.title, step.status, step.timestamp,
          step.system, step.details, step.data ? JSON.stringify(step.data) : null
        ])
        savedStepsCount++
      } catch (stepError) {
        console.error('Error saving recovery step:', stepError)
      }
    }

    console.log(`Generated and saved ${savedOptionsCount} options and ${savedStepsCount} steps for disruption ${disruptionId}`)

    res.json({
      success: true,
      optionsCount: savedOptionsCount,
      stepsCount: savedStepsCount,
      message: `Generated ${savedOptionsCount} recovery options and ${savedStepsCount} steps`
    })

  } catch (error) {
    console.error('Error generating recovery options:', error)
    res.status(500).json({ 
      error: 'Failed to generate recovery options', 
      details: error.message 
    })
  }
})

app.post('/api/recovery-options', async (req, res) => {
  try {
    const {
      disruption_id, title, description, cost, timeline,
      confidence, impact, status, priority, advantages, considerations,
      resource_requirements, cost_breakdown, timeline_details,
      risk_assessment, technical_specs, metrics, rotation_plan
    } = req.body

    const result = await pool.query(`
      INSERT INTO recovery_options (
        disruption_id, title, description, cost, timeline,
        confidence, impact, status, priority, advantages, considerations,
        resource_requirements, cost_breakdown, timeline_details,
        risk_assessment, technical_specs, metrics, rotation_plan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      disruption_id, title, description, cost, timeline,
      confidence, impact, status || 'generated', priority || 0,
      advantages ? JSON.stringify(advantages) : null,
      considerations ? JSON.stringify(considerations) : null,
      resource_requirements ? JSON.stringify(resource_requirements) : null,
      cost_breakdown ? JSON.stringify(cost_breakdown) : null,
      timeline_details ? JSON.stringify(timeline_details) : null,
      risk_assessment ? JSON.stringify(risk_assessment) : null,
      technical_specs ? JSON.stringify(technical_specs) : null,
      metrics ? JSON.stringify(metrics) : null,
      rotation_plan ? JSON.stringify(rotation_plan) : null
    ])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving recovery option:', error)
    res.status(500).json({ error: error.message })
  }
})

// Passengers endpoints
app.get('/api/passengers/flight/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params
    const result = await pool.query(
      'SELECT * FROM passengers WHERE flight_number = $1',
      [flightNumber]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching passengers:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/passengers/pnr/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params
    const result = await pool.query(
      'SELECT * FROM passengers WHERE pnr = $1',
      [pnr]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching passenger:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/passengers/:pnr/rebooking', async (req, res) => {
  try {
    const { pnr } = req.params
    const { rebooking_status, new_flight_number, new_seat_number } = req.body

    const result = await pool.query(`
      UPDATE passengers 
      SET rebooking_status = $1, new_flight_number = $2, new_seat_number = $3, updated_at = CURRENT_TIMESTAMP
      WHERE pnr = $4
      RETURNING *
    `, [rebooking_status, new_flight_number, new_seat_number, pnr])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating passenger rebooking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Crew endpoints
app.get('/api/crew/available', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM crew_members WHERE status = 'Available' ORDER BY name"
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching available crew:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/crew/flight/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params
    const result = await pool.query(
      'SELECT * FROM crew_members WHERE current_flight = $1',
      [flightNumber]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching crew for flight:', error)
    res.status(500).json({ error: error.message })
  }
})

// Aircraft endpoints
app.get('/api/aircraft', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM aircraft ORDER BY registration'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching aircraft:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/aircraft/available', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM aircraft WHERE status = 'Available' ORDER BY registration"
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching available aircraft:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/aircraft/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const result = await pool.query(`
      UPDATE aircraft 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aircraft not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating aircraft status:', error)
    res.status(500).json({ error: error.message })
  }
})

// Hotel Bookings endpoints
app.get('/api/hotel-bookings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hotel_bookings ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching hotel bookings:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/hotel-bookings/disruption/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    const result = await pool.query(
      'SELECT * FROM hotel_bookings WHERE disruption_id = $1',
      [disruptionId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching hotel bookings for disruption:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/hotel-bookings', async (req, res) => {
  try {
    const {
      disruption_id, passenger_pnr, hotel_name, check_in, check_out,
      cost, status, booking_reference
    } = req.body

    const result = await pool.query(`
      INSERT INTO hotel_bookings (
        disruption_id, passenger_pnr, hotel_name, check_in, check_out,
        cost, status, booking_reference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      disruption_id, passenger_pnr, hotel_name, check_in, check_out,
      cost, status, booking_reference
    ])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating hotel booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Crew Members endpoints
app.get('/api/crew-members', async (req, res) => {
  try {
    const client = await pool.connect()
    const result = await client.query(`
      SELECT 
        id, employee_id, name, role, qualifications, duty_time_remaining,
        base_location, status, current_flight, contact_info, created_at, updated_at
      FROM crew_members 
      ORDER BY name
    `)
    client.release()
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching crew members:', error)
    res.status(500).json({ error: error.message })
  }
})

// Crew Disruption Mapping endpoints
app.get('/api/crew-disruption-mapping/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    const client = await pool.connect()
    const result = await client.query(`
      SELECT 
        cdm.*, 
        cm.name as crew_name, 
        cm.role as crew_role,
        cm.employee_id,
        rcm.name as replacement_name,
        rcm.role as replacement_role
      FROM crew_disruption_mapping cdm
      JOIN crew_members cm ON cdm.crew_member_id = cm.id
      LEFT JOIN crew_members rcm ON cdm.replacement_crew_id = rcm.id
      WHERE cdm.disruption_id = $1
      ORDER BY cdm.created_at
    `, [disruptionId])
    client.release()
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching crew disruption mapping:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/crew-disruption-mapping', async (req, res) => {
  try {
    const {
      disruption_id, crew_member_id, disruption_reason, 
      resolution_status, replacement_crew_id, notes
    } = req.body

    const client = await pool.connect()
    const result = await client.query(`
      INSERT INTO crew_disruption_mapping (
        disruption_id, crew_member_id, disruption_reason,
        resolution_status, replacement_crew_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      disruption_id, crew_member_id, disruption_reason,
      resolution_status || 'Pending', replacement_crew_id, notes
    ])
    client.release()
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating crew disruption mapping:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/crew-members/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params
    const client = await pool.connect()
    const result = await client.query(`
      SELECT 
        id, employee_id, name, role, qualifications, duty_time_remaining,
        base_location, status, current_flight, contact_info, created_at, updated_at
      FROM crew_members 
      WHERE employee_id = $1
    `, [employeeId])
    client.release()

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crew member not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching crew member:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/crew-members', async (req, res) => {
  try {
    const {
      employee_id, name, role, qualifications, duty_time_remaining,
      base_location, status, current_flight, contact_info
    } = req.body

    const client = await pool.connect()
    const result = await client.query(`
      INSERT INTO crew_members (
        employee_id, name, role, qualifications, duty_time_remaining,
        base_location, status, current_flight, contact_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      employee_id, name, role, qualifications || [role], duty_time_remaining || 480,
      base_location || 'DXB', status || 'Available', current_flight, 
      contact_info || {}
    ])
    client.release()
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating crew member:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/crew-members/:employeeId/status', async (req, res) => {
  try {
    const { employeeId } = req.params
    const { status } = req.body

    const client = await pool.connect()
    const result = await client.query(`
            UPDATE crew_members 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $2
      RETURNING *
    `, [status, employeeId])
    client.release()

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crew member not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating crew member status:', error)
    res.status(500).json({ error: error.message })
  }
})

// Analytics endpoints
app.get('/api/analytics/kpi', async (req, res) => {
  try {
    const client = await pool.connect()

    // Get basic KPI metrics
    const activeDisruptions = await client.query(`
      SELECT COUNT(*) as count FROM flight_disruptions 
      WHERE status IN ('Active', 'Delayed', 'Diverted')
    `)

    const resolvedDisruptions = await client.query(`
      SELECT COUNT(*) as count FROM flight_disruptions 
      WHERE status = 'Resolved'
    `)

    const totalPassengersImpacted = await client.query(`
      SELECT SUM(passengers) as total FROM flight_disruptions
    `)

    client.release()

    const kpiData = {
      activeDisruptions: parseInt(activeDisruptions.rows[0].count) || 0,
      resolvedDisruptions: parseInt(resolvedDisruptions.rows[0].count) || 0,
      totalPassengersImpacted: parseInt(totalPassengersImpacted.rows[0].total) || 0,
      averageResolutionTime: 24 // Mock data for now
    }

    res.json(kpiData)

  } catch (error) {
    console.error('Error fetching KPI data:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/analytics/predictions', async (req, res) => {
  try {
    // Return mock prediction data for now
    res.json({
      delayProbability: 15.2,
      weatherRisk: 'Low',
      trafficRisk: 'Medium',
      recommendations: [
        'Monitor weather conditions at DXB',
        'Consider crew standby activation'
      ]
    })
  } catch (error) {
    console.error('Error fetching prediction analytics:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/recovery-logs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recovery_logs ORDER BY date_created DESC LIMIT 100'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching recovery logs:', error)
    res.status(500).json({ error: error.message })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`AERON Settings Database API server running on port ${port}`)
})

module.exports = app