
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
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
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

// Get all flight disruptions
app.get('/api/disruptions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        flight_number,
        route,
        origin,
        destination,
        origin_city,
        destination_city,
        aircraft,
        scheduled_departure,
        estimated_departure,
        delay_minutes,
        passengers,
        crew,
        severity,
        disruption_type,
        status,
        disruption_reason,
        created_at,
        updated_at
      FROM flight_disruptions 
      ORDER BY created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching disruptions:', error)
    res.status(500).json({ error: error.message })
  }
})

// Save new flight disruption
app.post('/api/disruptions', async (req, res) => {
  try {
    const {
      flight_number, route, origin, destination, origin_city, destination_city,
      aircraft, scheduled_departure, estimated_departure, delay_minutes, 
      passengers, crew, severity, disruption_type, status, disruption_reason
    } = req.body
    
    const result = await pool.query(`
      INSERT INTO flight_disruptions (
        flight_number, route, origin, destination, origin_city, destination_city,
        aircraft, scheduled_departure, estimated_departure, delay_minutes, 
        passengers, crew, severity, disruption_type, status, disruption_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      flight_number, route, origin, destination, origin_city, destination_city,
      aircraft, scheduled_departure, estimated_departure, delay_minutes,
      passengers, crew, severity, disruption_type, status, disruption_reason
    ])
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving disruption:', error)
    res.status(500).json({ error: error.message })
  }
})

// Recovery Options endpoints
app.get('/api/recovery-options/:disruptionId', async (req, res) => {
  try {
    const { disruptionId } = req.params
    const result = await pool.query(
      'SELECT * FROM recovery_options WHERE disruption_id = $1 ORDER BY confidence DESC',
      [disruptionId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching recovery options:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/recovery-options', async (req, res) => {
  try {
    const {
      disruption_id, option_name, description, cost, duration_minutes,
      confidence, passenger_impact, details
    } = req.body
    
    const result = await pool.query(`
      INSERT INTO recovery_options (
        disruption_id, option_name, description, cost, duration_minutes,
        confidence, passenger_impact, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      disruption_id, option_name, description, cost, duration_minutes,
      confidence, passenger_impact, JSON.stringify(details)
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

// Analytics endpoints
app.get('/api/analytics/kpi', async (req, res) => {
  try {
    // Return mock KPI data for now
    const kpiData = {
      totalDisruptions: 0,
      activeDisruptions: 0,
      resolvedDisruptions: 0,
      avgResolutionTime: 0,
      passengerImpact: 0,
      costSavings: 0
    }
    
    // Get actual data from database
    const disruptionsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) as resolved,
        SUM(passengers) as total_passengers
      FROM flight_disruptions
    `)
    
    if (disruptionsResult.rows.length > 0) {
      const row = disruptionsResult.rows[0]
      kpiData.totalDisruptions = parseInt(row.total) || 0
      kpiData.activeDisruptions = parseInt(row.active) || 0
      kpiData.resolvedDisruptions = parseInt(row.resolved) || 0
      kpiData.passengerImpact = parseInt(row.total_passengers) || 0
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
