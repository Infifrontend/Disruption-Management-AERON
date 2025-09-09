
#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

// Get database connection string from environment
const connectionString = process.env.DB_URL || process.env.NEON_DATABASE_URL;

if (!connectionString) {
  console.error('❌ No database connection string found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 5,
  min: 1,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
});

async function updateExpiredDisruptions() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating expired flight disruptions...');
    
    const result = await client.query(`
      UPDATE flight_disruptions 
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
      WHERE created_at < NOW() - INTERVAL '24 hours' 
      AND status NOT IN ('expired', 'Resolved', 'Completed', 'Cancelled')
      RETURNING id, flight_number, created_at, status
    `);
    
    const updatedCount = result.rows.length;
    
    if (updatedCount > 0) {
      console.log(`✅ Updated ${updatedCount} flight disruptions to expired status:`);
      result.rows.forEach(row => {
        console.log(`   - Flight ${row.flight_number} (ID: ${row.id})`);
      });
    } else {
      console.log('✅ No disruptions needed to be updated to expired status');
    }
    
    return {
      success: true,
      updated_count: updatedCount,
      updated_flights: result.rows
    };
    
  } catch (error) {
    console.error('❌ Error updating expired disruptions:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Starting expired disruptions update job...');
    console.log(`📅 Current time: ${new Date().toISOString()}`);
    
    const result = await updateExpiredDisruptions();
    
    if (result.success) {
      console.log('✅ Expired disruptions update completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Expired disruptions update failed:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateExpiredDisruptions };
