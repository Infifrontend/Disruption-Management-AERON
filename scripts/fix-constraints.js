
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
