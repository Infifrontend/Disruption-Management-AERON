
import { Pool } from 'pg'
import { formatNeonConnectionString } from '../server/database-utils.js'

async function fixConstraints() {
  const connectionString = formatNeonConnectionString(process.env.DB_URL)
  
  if (!connectionString) {
    console.error('❌ DB_URL environment variable is not set')
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
    
    // First, get the IDs of duplicate records that need to be deleted
    const duplicateIds = await client.query(`
      SELECT id FROM flight_disruptions 
      WHERE id NOT IN (
          SELECT DISTINCT ON (flight_number, scheduled_departure) id
          FROM flight_disruptions 
          ORDER BY flight_number, scheduled_departure, updated_at DESC
      )
    `)
    
    if (duplicateIds.rows.length > 0) {
      const idsToDelete = duplicateIds.rows.map(row => row.id)
      console.log(`Found ${idsToDelete.length} duplicate records to delete`)
      
      // Delete related records first to avoid foreign key constraint violations
      console.log('🗑️ Deleting related recovery_steps records...')
      const stepsDeleteResult = await client.query(`
        DELETE FROM recovery_steps 
        WHERE disruption_id = ANY($1)
      `, [idsToDelete])
      console.log(`✅ Removed ${stepsDeleteResult.rowCount} related recovery_steps records`)
      
      console.log('🗑️ Deleting related recovery_options records...')
      const optionsDeleteResult = await client.query(`
        DELETE FROM recovery_options 
        WHERE disruption_id = ANY($1)
      `, [idsToDelete])
      console.log(`✅ Removed ${optionsDeleteResult.rowCount} related recovery_options records`)
      
      console.log('🗑️ Deleting related crew_disruption_mapping records...')
      const crewMappingDeleteResult = await client.query(`
        DELETE FROM crew_disruption_mapping 
        WHERE disruption_id = ANY($1)
      `, [idsToDelete])
      console.log(`✅ Removed ${crewMappingDeleteResult.rowCount} related crew_disruption_mapping records`)
      
      console.log('🗑️ Deleting related hotel_bookings records...')
      const hotelDeleteResult = await client.query(`
        DELETE FROM hotel_bookings 
        WHERE disruption_id = ANY($1)
      `, [idsToDelete])
      console.log(`✅ Removed ${hotelDeleteResult.rowCount} related hotel_bookings records`)
      
      // Now delete the duplicate flight_disruptions records
      const deleteResult = await client.query(`
        DELETE FROM flight_disruptions 
        WHERE id = ANY($1)
      `, [idsToDelete])
      console.log(`✅ Removed ${deleteResult.rowCount} duplicate flight_disruptions records`)
    } else {
      console.log('ℹ️ No duplicate records found')
    }

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
import pkg from 'pg'
const { Pool } = pkg

// Database connection
let connectionString = process.env.DB_URL || 'postgresql://0.0.0.0:5432/aeron_settings'

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
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  max: 1,
  connectionTimeoutMillis: 10000,
})

async function fixConstraints() {
  try {
    console.log('🔧 Fixing database constraints...')

    // Add unique constraint to recovery_steps if it doesn't exist
    await pool.query(`
      ALTER TABLE recovery_steps 
      ADD CONSTRAINT IF NOT EXISTS recovery_steps_disruption_step_unique 
      UNIQUE (disruption_id, step_number)
    `)
    
    console.log('✅ Added unique constraint to recovery_steps')

    // Update recovery_options to handle arrays properly
    await pool.query(`
      ALTER TABLE recovery_options 
      ALTER COLUMN advantages TYPE TEXT[] USING 
        CASE 
          WHEN advantages::text ~ '^\\[.*\\]$' THEN 
            (SELECT array_agg(trim(both '"' from value)) 
             FROM json_array_elements_text(advantages::json)) 
          ELSE ARRAY[advantages::text]
        END
    `)
    
    await pool.query(`
      ALTER TABLE recovery_options 
      ALTER COLUMN considerations TYPE TEXT[] USING 
        CASE 
          WHEN considerations::text ~ '^\\[.*\\]$' THEN 
            (SELECT array_agg(trim(both '"' from value)) 
             FROM json_array_elements_text(considerations::json)) 
          ELSE ARRAY[considerations::text]
        END
    `)
    
    console.log('✅ Fixed array columns in recovery_options')
    console.log('🎉 Database constraints fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error fixing constraints:', error)
  } finally {
    await pool.end()
  }
}

fixConstraints()
