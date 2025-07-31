import express from 'express'
import cors from 'cors'
import pkg from 'pg'
const { Pool } = pkg

const app = express()
const port = process.env.API_PORT || 3001

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// PostgreSQL connection with fallback and proper Neon handling
let connectionString = process.env.DATABASE_URL || 'postgresql://0.0.0.0:5432/aeron_settings'

// Handle Neon database connection with proper endpoint parameter
if (connectionString && connectionString.includes('neon.tech')) {
  try {
    const url = new URL(connectionString)
    const endpointId = url.hostname.split('.')[0]

    // Add endpoint parameter for Neon compatibility
    const params = new URLSearchParams(url.search)
    params.set('options', `endpoint=${endpointId}`)
    params.set('sslmode', 'require')

    // Reconstruct URL with proper parameters
    url.search = params.toString()
    connectionString = url.toString()

    console.log('🔧 Configured connection for Neon database with endpoint:', endpointId)
  } catch (error) {
    console.error('⚠️ Error configuring Neon connection:', error.message)
  }
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  maxUses: 7500, // Close a connection after it has been used this many times
})

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL connected successfully')
    client.release()
  })
  .catch(err => {
    console.log('⚠️ PostgreSQL connection failed, API will return empty results:', err.message)
  })

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      protocol: req.protocol,
      host: req.get('host')
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    res.status(500).json({ status: 'unhealthy', error: error.message })
  }
})

// Debug endpoint to check connection details
app.get('/api/debug', (req, res) => {
  res.json({
    protocol: req.protocol,
    host: req.get('host'),
    originalUrl: req.originalUrl,
    headers: {
      'x-forwarded-proto': req.get('x-forwarded-proto'),
      'x-forwarded-host': req.get('x-forwarded-host')
    },
    env: {
      REPL_SLUG: process.env.REPL_SLUG,
      REPLIT_DEV_DOMAIN: process.env.REPLIT_DEV_DOMAIN
    }
  })
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
    res.json([]) // Return empty array instead of error to allow fallback
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
    res.status(404).json({ error: 'Setting not found' })
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
    res.json([])
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

// Reset settings endpoint
app.post('/api/settings/reset', async (req, res) => {
  try {
    // Clear existing settings
    await pool.query('DELETE FROM settings')

    // Insert default settings
    const defaults = [
      { category: 'operationalRules', key: 'maxDelayThreshold', value: 180, type: 'number' },
      { category: 'operationalRules', key: 'minConnectionTime', value: 45, type: 'number' },
      { category: 'operationalRules', key: 'maxOverbooking', value: 105, type: 'number' },
      { category: 'operationalRules', key: 'priorityRebookingTime', value: 15, type: 'number' },
      { category: 'operationalRules', key: 'hotacTriggerDelay', value: 240, type: 'number' },
      { category: 'recoveryConstraints', key: 'maxAircraftSwaps', value: 3, type: 'number' },
      { category: 'recoveryConstraints', key: 'crewDutyTimeLimits', value: true, type: 'boolean' },
      { category: 'recoveryConstraints', key: 'maintenanceSlotProtection', value: true, type: 'boolean' },
      { category: 'recoveryConstraints', key: 'slotCoordinationRequired', value: false, type: 'boolean' },
      { category: 'recoveryConstraints', key: 'curfewCompliance', value: true, type: 'boolean' },
      { category: 'automationSettings', key: 'autoApproveThreshold', value: 95, type: 'number' },
      { category: 'automationSettings', key: 'requireManagerApproval', value: false, type: 'boolean' },
      { category: 'automationSettings', key: 'enablePredictiveActions', value: true, type: 'boolean' },
      { category: 'automationSettings', key: 'autoNotifyPassengers', value: true, type: 'boolean' },
      { category: 'automationSettings', key: 'autoBookHotac', value: false, type: 'boolean' },
      { category: 'passengerPrioritization', key: 'loyaltyTier', value: 25, type: 'number' },
      { category: 'passengerPrioritization', key: 'ticketClass', value: 20, type: 'number' },
      { category: 'passengerPrioritization', key: 'specialNeeds', value: 30, type: 'number' },
      { category: 'passengerPrioritization', key: 'groupSize', value: 15, type: 'number' },
      { category: 'passengerPrioritization', key: 'connectionRisk', value: 10, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'costWeight', value: 30, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'timeWeight', value: 25, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'passengerImpactWeight', value: 20, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'operationalComplexityWeight', value: 15, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'reputationWeight', value: 10, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'maintenanceStatus', value: 25, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'fuelEfficiency', value: 20, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'routeSuitability', value: 20, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'passengerCapacity', value: 15, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'availabilityWindow', value: 20, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'dutyTimeRemaining', value: 30, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'qualifications', value: 25, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'baseLocation', value: 20, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'restRequirements', value: 15, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'languageSkills', value: 10, type: 'number' },
      { category: 'flightPrioritization', key: 'airlinePreference', value: 20, type: 'number' },
      { category: 'flightPrioritization', key: 'onTimePerformance', value: 25, type: 'number' },
      { category: 'flightPrioritization', key: 'aircraftType', value: 15, type: 'number' },
      { category: 'flightPrioritization', key: 'departureTime', value: 20, type: 'number' },
      { category: 'flightPrioritization', key: 'connectionBuffer', value: 20, type: 'number' },
      { category: 'flightScoring', key: 'baseScore', value: 70, type: 'number' },
      { category: 'flightScoring', key: 'priorityBonus', value: 15, type: 'number' },
      { category: 'flightScoring', key: 'airlineBonus', value: 10, type: 'number' },
      { category: 'flightScoring', key: 'specialReqBonus', value: 8, type: 'number' },
      { category: 'flightScoring', key: 'loyaltyBonus', value: 8, type: 'number' },
      { category: 'flightScoring', key: 'groupBonus', value: 5, type: 'number' },
      { category: 'passengerScoring', key: 'vipWeight', value: 40, type: 'number' },
      { category: 'passengerScoring', key: 'loyaltyWeight', value: 25, type: 'number' },
      { category: 'passengerScoring', key: 'specialNeedsWeight', value: 20, type: 'number' },
      { category: 'passengerScoring', key: 'revenueWeight', value: 15, type: 'number' },
      { category: 'nlpSettings', key: 'enabled', value: true, type: 'boolean' },
      { category: 'nlpSettings', key: 'language', value: 'english', type: 'string' },
      { category: 'nlpSettings', key: 'confidence', value: 85, type: 'number' },
      { category: 'nlpSettings', key: 'autoApply', value: false, type: 'boolean' },
      { category: 'notificationSettings', key: 'email', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'sms', value: false, type: 'boolean' },
      { category: 'notificationSettings', key: 'push', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'desktop', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'recoveryAlerts', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'passengerUpdates', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'systemAlerts', value: false, type: 'boolean' }
    ]

    for (const setting of defaults) {
      await pool.query(
        'INSERT INTO settings (category, key, value, type, updated_by) VALUES ($1, $2, $3, $4, $5)',
        [setting.category, setting.key, JSON.stringify(setting.value), setting.type, 'system']
      )
    }

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
      SELECT id, flight_number, route, origin, destination, origin_city, destination_city,
             aircraft, scheduled_departure, estimated_departure, delay_minutes, 
             passengers, crew, connection_flights, severity, disruption_type, status, 
             disruption_reason, created_at, updated_at
      FROM flight_disruptions 
      ORDER BY created_at DESC
    `)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching disruptions:', error)
    res.json([])
  }
})

// Save new flight disruption
app.post('/api/disruptions', async (req, res) => {
  try {
    console.log('Received disruption data:', req.body)

    const {
      flight_number, flightNumber, route, origin, destination, origin_city, destination_city, originCity, destinationCity,
      aircraft, scheduled_departure, scheduledDeparture, estimated_departure, estimatedDeparture, 
      delay_minutes, delay, passengers, crew, connection_flights, connectionFlights, severity, disruption_type, disruptionType, type, 
      status, disruption_reason, disruptionReason
    } = req.body

    // Handle both camelCase and snake_case field names with proper fallbacks
    const flightNum = flight_number || flightNumber
    const origin_city_val = origin_city || originCity
    const destination_city_val = destination_city || destinationCity
    const scheduled_dep = scheduled_departure || scheduledDeparture
    const estimated_dep = estimated_departure || estimatedDeparture
    const delay_mins = delay_minutes || delay || 0
    const connection_flights_val = connection_flights || connectionFlights || 0
    const disruption_type_val = disruption_type || disruptionType || type
    const disruption_reason_val = disruption_reason || disruptionReason

    console.log('Processing disruption for flight:', flightNum)

    // Validate required fields
    if (!flightNum || !aircraft || !scheduled_dep || !passengers || !crew) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'flight_number, aircraft, scheduled_departure, passengers, and crew are required' 
      })
    }

    // Use defaults for missing fields
    const safeRoute = route || `${origin || 'UNK'} → ${destination || 'UNK'}`
    const safeOrigin = origin || 'UNK'
    const safeDestination = destination || 'UNK'
    const safeOriginCity = origin_city_val || 'Unknown'
    const safeDestinationCity = destination_city_val || 'Unknown'
    const safeSeverity = severity || 'Medium'
    const safeDisruptionType = disruption_type_val || 'Technical'
    const safeStatus = status || 'Active'
    const safeDisruptionReason = disruption_reason_val || 'No reason provided'

    const result = await pool.query(`
      INSERT INTO flight_disruptions (
        flight_number, route, origin, destination, origin_city, destination_city,
        aircraft, scheduled_departure, estimated_departure, delay_minutes, 
        passengers, crew, connection_flights, severity, disruption_type, status, disruption_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      flightNum, safeRoute, safeOrigin, safeDestination, safeOriginCity, safeDestinationCity,
      aircraft, scheduled_dep, estimated_dep, delay_mins,
      passengers, crew, connection_flights_val, safeSeverity, safeDisruptionType, safeStatus, safeDisruptionReason
    ])

    console.log('Successfully saved disruption:', result.rows[0])
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving disruption:', error.message)
    console.error('Error details:', error)
    res.status(500).json({ 
      error: 'Failed to save disruption', 
      details: error.message,
      code: error.code 
    })
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
    const { rebookingStatus, newFlightNumber, newSeatNumber } = req.body

    const result = await pool.query(`
      UPDATE passengers 
      SET rebooking_status = $1, new_flight_number = $2, new_seat_number = $3, updated_at = CURRENT_TIMESTAMP
      WHERE pnr = $4
      RETURNING *
    `, [rebookingStatus, newFlightNumber, newSeatNumber, pnr])

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
    const result = await pool.query(`
      SELECT * FROM crew_members 
      WHERE status = 'Available'
      ORDER BY role, name
    `)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching available crew:', error)
    res.json([])
  }
})

app.get('/api/crew/flight/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params
    const result = await pool.query(
      'SELECT * FROM crew_members WHERE current_flight = $1',
      [flightNumber]
    )
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching crew for flight:', error)
    res.json([])
  }
})

// Aircraft endpoints
app.get('/api/aircraft', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM aircraft 
      ORDER BY status, registration
    `)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching aircraft:', error)
    res.json([])
  }
})

app.get('/api/aircraft/available', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM aircraft 
      WHERE status = 'Available'
      ORDER BY registration
    `)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching available aircraft:', error)
    res.json([])
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

// Hotel bookings endpoints
app.get('/api/hotel-bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM hotel_bookings 
      ORDER BY created_at DESC
    `)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching hotel bookings:', error)
    res.json([])
  }
})

app.get('/api/hotel-bookings/disruption/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    const result = await pool.query(
      'SELECT * FROM hotel_bookings WHERE disruption_id = $1',
      [disruptionId]
    )
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching hotel bookings for disruption:', error)
    res.json([])
  }
})

app.post('/api/hotel-bookings', async (req, res) => {
  try {
    const { disruptionId, passengerPnr, hotelName, checkIn, checkOut, cost, status, bookingReference } = req.body

    const result = await pool.query(`
      INSERT INTO hotel_bookings 
      (disruption_id, passenger_pnr, hotel_name, check_in, check_out, cost, status, booking_reference)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [disruptionId, passengerPnr, hotelName, checkIn, checkOut, cost, status, bookingReference])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating hotel booking:', error)
    res.status(500).json({ error: error.message })
  }
})

// Analytics endpoints
app.get('/api/analytics/kpi', async (req, res) => {
  try {
    // Get basic KPI data from disruptions
    const disruptionsCount = await pool.query('SELECT COUNT(*) as count FROM flight_disruptions WHERE status = $1', ['Active'])
    const totalPassengers = await pool.query('SELECT SUM(passengers) as total FROM flight_disruptions WHERE status = $1', ['Active'])
    const avgDelay = await pool.query('SELECT AVG(delay_minutes) as avg FROM flight_disruptions WHERE delay_minutes > 0')
    const recoverySuccess = await pool.query('SELECT COUNT(*) as count FROM flight_disruptions WHERE status = $1', ['Resolved'])

    res.json({
      activeDisruptions: disruptionsCount.rows[0]?.count || 0,
      affectedPassengers: totalPassengers.rows[0]?.total || 0,
      averageDelay: Math.round(avgDelay.rows[0]?.avg || 0),
      recoverySuccessRate: 95.8, // Static for now
      onTimePerformance: 87.3,
      costSavings: 2.4
    })
  } catch (error) {
    console.error('Error fetching KPI data:', error)
    res.json({
      activeDisruptions: 0,
      affectedPassengers: 0,
      averageDelay: 0,
      recoverySuccessRate: 0,
      onTimePerformance: 0,
      costSavings: 0
    })
  }
})

app.get('/api/analytics/predictions', async (req, res) => {
  try {
    res.json({
      delayPredictions: [],
      weatherImpact: {},
      demandForecasts: []
    })
  } catch (error) {
    console.error('Error fetching prediction analytics:', error)
    res.json({})
  }
})

// Recovery logs endpoint
app.get('/api/recovery-logs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM recovery_logs 
      ORDER BY date_created DESC
      LIMIT 50
    `)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching recovery logs:', error)
    res.json([])
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

// Recovery Steps endpoints
app.get('/api/recovery-steps/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    console.log(`Fetching recovery steps for disruption ID: ${disruptionId}`)
    
    const result = await pool.query(`
      SELECT * FROM recovery_steps 
      WHERE disruption_id = $1 
      ORDER BY step_number ASC
    `, [disruptionId])
    
    console.log(`Found ${result.rows.length} recovery steps for disruption ${disruptionId}`)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching recovery steps:', error)
    res.status(500).json({ error: error.message, rows: [] })
  }
})

app.post('/api/recovery-steps', async (req, res) => {
  try {
    const {
      disruption_id, step_number, title, status, timestamp,
      system, details, step_data
    } = req.body

    const result = await pool.query(`
      INSERT INTO recovery_steps (
        disruption_id, step_number, title, status, timestamp,
        system, details, step_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      disruption_id, step_number, title, status || 'pending',
      timestamp, system, details,
      step_data ? JSON.stringify(step_data) : null
    ])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving recovery step:', error)
    res.status(500).json({ error: error.message })
  }
})

// Debug endpoint to check recovery steps table
app.get('/api/debug/recovery-steps', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recovery_steps ORDER BY disruption_id, step_number')
    res.json({
      totalSteps: result.rows.length,
      steps: result.rows
    })
  } catch (error) {
    console.error('Error fetching all recovery steps:', error)
    res.status(500).json({ error: error.message })
  }
})

// Generate and save recovery options for a disruption
app.post('/api/generate-recovery-options/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    console.log(`Generating recovery options for disruption ID: ${disruptionId}`)

    // First get the disruption details
    const disruptionResult = await pool.query(
      'SELECT * FROM flight_disruptions WHERE id = $1',
      [disruptionId]
    )

    if (disruptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Disruption not found' })
    }

    const disruption = disruptionResult.rows[0]
    console.log('Found disruption:', disruption.flight_number)

    // Check if recovery steps already exist (not just options)
    const existingSteps = await pool.query(
      'SELECT COUNT(*) as count FROM recovery_steps WHERE disruption_id = $1',
      [disruptionId]
    )

    const existingOptions = await pool.query(
      'SELECT COUNT(*) as count FROM recovery_options WHERE disruption_id = $1',
      [disruptionId]
    )

    if (existingOptions.rows[0].count > 0 && existingSteps.rows[0].count > 0) {
      return res.json({ 
        message: 'Recovery options and steps already exist', 
        exists: true,
        optionsCount: existingOptions.rows[0].count,
        stepsCount: existingSteps.rows[0].count
      })
    }

    // Generate recovery options based on disruption type
    const recoveryGenerator = await import('./recovery-generator.js')
    const { generateRecoveryOptionsForDisruption } = recoveryGenerator

    const { options, steps } = generateRecoveryOptionsForDisruption(disruption)
    console.log(`Generated ${options.length} options and ${steps.length} steps`)

    // Clear existing data if partially generated
    await pool.query('DELETE FROM recovery_steps WHERE disruption_id = $1', [disruptionId])
    await pool.query('DELETE FROM recovery_options WHERE disruption_id = $1', [disruptionId])

    // Save recovery steps first
    for (const step of steps) {
      console.log(`Saving step ${step.step}: ${step.title}`)
      await pool.query(`
        INSERT INTO recovery_steps (
          disruption_id, step_number, title, status, timestamp,
          system, details, step_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        disruptionId, step.step, step.title, step.status,
        step.timestamp, step.system, step.details,
        step.data ? JSON.stringify(step.data) : null
      ])
    }

    // Save recovery options
    for (let i = 0; i < options.length; i++) {
      const option = options[i]
      console.log(`Saving option ${i + 1}: ${option.title}`)
      await pool.query(`
        INSERT INTO recovery_options (
          disruption_id, title, description, cost, timeline,
          confidence, impact, status, priority, advantages, considerations,
          resource_requirements, cost_breakdown, timeline_details,
          risk_assessment, technical_specs, metrics, rotation_plan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        disruptionId, option.title, option.description,
        option.cost, option.timeline, option.confidence, option.impact,
        option.status, i + 1, // priority based on order
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
    }

    console.log('Successfully saved all recovery options and steps')
    res.json({ 
      message: 'Recovery options generated successfully', 
      optionsCount: options.length, 
      stepsCount: steps.length 
    })
  } catch (error) {
    console.error('Error generating recovery options:', error)
    res.status(500).json({ error: error.message })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AERON Settings Database API server running on http://0.0.0.0:${port}`)
  console.log(`🌐 External access: https://${process.env.REPL_SLUG}.${process.env.REPLIT_DEV_DOMAIN}:${port}`)
})