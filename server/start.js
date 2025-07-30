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

// PostgreSQL connection with fallback
let connectionString = process.env.DATABASE_URL || 'postgresql://0.0.0.0:5432/aeron_settings'

// Clean up connection string and handle different formats
if (connectionString) {
  // Remove any malformed parameters
  connectionString = connectionString.split('?')[0]
  
  // Add proper SSL and connection parameters
  const url = new URL(connectionString)
  const params = new URLSearchParams()
  
  // Add SSL for production environments
  if (process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech')) {
    params.set('sslmode', 'require')
  }
  
  // Add endpoint parameter for Neon compatibility
  if (connectionString.includes('neon.tech')) {
    const endpointId = url.hostname.split('.')[0]
    params.set('options', `endpoint=${endpointId}`)
  }
  
  // Reconstruct URL with proper parameters
  if (params.toString()) {
    connectionString += '?' + params.toString()
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
      SELECT id, flight_number, route, aircraft, scheduled_departure, estimated_departure,
             delay_minutes, passengers, crew, severity, disruption_type, status, 
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

// Database initialization endpoint
app.post('/api/init-database', async (req, res) => {
  try {
    console.log('Initializing database tables...')

    // Read and execute schema file
    const fs = require('fs')
    const path = require('path')
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')

    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ error: 'Schema file not found' })
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

    // Execute the schema
    await pool.query(schemaSQL)

    console.log('✅ Database tables initialized successfully')
    res.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    res.status(500).json({ error: `Database initialization failed: ${error.message}` })
  }
})

// Populate sample data endpoint
app.post('/api/populate-sample-data', async (req, res) => {
  try {
    console.log('Populating sample flight disruption data...')

    // Check if data already exists
    const existingData = await pool.query('SELECT COUNT(*) as count FROM flight_disruptions')
    if (existingData.rows[0].count > 0) {
      return res.json({ message: 'Sample data already exists', count: existingData.rows[0].count })
    }

    // Insert sample flight disruptions
    const sampleDisruptions = [
      {
        flight_number: 'FZ215',
        route: 'DXB-BOM',
        aircraft: 'B737-800',
        scheduled_departure: '2025-01-10T15:30:00Z',
        estimated_departure: '2025-01-10T17:30:00Z',
        delay_minutes: 120,
        passengers: 189,
        crew: 6,
        severity: 'High',
        disruption_type: 'Weather',
        status: 'Active',
        disruption_reason: 'Sandstorm at DXB'
      },
      {
        flight_number: 'FZ203',
        route: 'DXB-DEL',
        aircraft: 'B737 MAX 8',
        scheduled_departure: '2025-01-10T16:45:00Z',
        estimated_departure: null,
        delay_minutes: null,
        passengers: 195,
        crew: 6,
        severity: 'Critical',
        disruption_type: 'Weather',
        status: 'Cancelled',
        disruption_reason: 'Dense fog at DEL'
      },
      {
        flight_number: 'FZ235',
        route: 'KHI-DXB',
        aircraft: 'A320-200',
        scheduled_departure: '2025-01-10T14:20:00Z',
        estimated_departure: '2025-01-10T15:50:00Z',
        delay_minutes: 90,
        passengers: 156,
        crew: 5,
        severity: 'Medium',
        disruption_type: 'Technical',
        status: 'Active',
        disruption_reason: 'Aircraft maintenance issue'
      }
    ]

    for (const disruption of sampleDisruptions) {
      await pool.query(`
        INSERT INTO flight_disruptions 
        (flight_number, route, aircraft, scheduled_departure, estimated_departure, 
         delay_minutes, passengers, crew, severity, disruption_type, status, disruption_reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        disruption.flight_number,
        disruption.route,
        disruption.aircraft,
        disruption.scheduled_departure,
        disruption.estimated_departure,
        disruption.delay_minutes,
        disruption.passengers,
        disruption.crew,
        disruption.severity,
        disruption.disruption_type,
        disruption.status,
        disruption.disruption_reason
      ])
    }

    console.log('✅ Sample flight disruption data populated successfully')
    res.json({ message: 'Sample data populated successfully', count: sampleDisruptions.length })
  } catch (error) {
    console.error('❌ Failed to populate sample data:', error.message)
    res.status(500).json({ error: `Failed to populate sample data: ${error.message}` })
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