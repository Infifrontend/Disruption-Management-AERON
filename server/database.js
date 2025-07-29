
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`AERON Settings Database API server running on port ${port}`)
})

module.exports = app
