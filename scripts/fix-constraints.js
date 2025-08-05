
import { Pool } from 'pg'
import { formatNeonConnectionString } from '../server/database-utils.js'

async function fixConstraints() {
  const connectionString = formatNeonConnectionString(process.env.DATABASE_URL)
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    max: 1,
    connectionTimeoutMillis: 10000,
  })

  try {
    console.log('🔌 Connecting to PostgreSQL database...')
    
    const client = await pool.connect()
    console.log('✅ Database connection successful')

    // Remove duplicates keeping the most recent one
    console.log('🧹 Removing duplicate records...')
    const deleteResult = await client.query(`
      DELETE FROM flight_disruptions 
      WHERE id NOT IN (
          SELECT DISTINCT ON (flight_number, scheduled_departure) id
          FROM flight_disruptions 
          ORDER BY flight_number, scheduled_departure, updated_at DESC
      )
    `)
    console.log(`✅ Removed ${deleteResult.rowCount} duplicate records`)

    // Add the unique constraint
    console.log('🔐 Adding unique constraint...')
    try {
      await client.query(`
        ALTER TABLE flight_disruptions 
        ADD CONSTRAINT unique_flight_schedule 
        UNIQUE (flight_number, scheduled_departure)
      `)
      console.log('✅ Unique constraint added successfully')
    } catch (constraintError) {
      if (constraintError.code === '42P07') {
        console.log('ℹ️ Unique constraint already exists')
      } else {
        throw constraintError
      }
    }

    // Add helpful indexes
    console.log('📊 Adding indexes...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flight_disruptions_lookup 
      ON flight_disruptions (flight_number, scheduled_departure, status)
    `)
    console.log('✅ Indexes added successfully')

    client.release()
    console.log('🎉 Database constraints fixed successfully!')

  } catch (error) {
    console.error('❌ Database constraint fix failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the fix
fixConstraints()
