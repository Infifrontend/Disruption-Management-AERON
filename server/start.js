import express from 'express'
import cors from 'cors'
import pkg from 'pg'
const { Pool } = pkg

const app = express()
const port = process.env.API_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// PostgreSQL connection with fallback
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/aeron_settings',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AERON Settings Database API server running on http://0.0.0.0:${port}`)
})

export default app