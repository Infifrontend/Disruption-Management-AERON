
import pkg from 'pg';
const { Pool } = pkg;

// Handle Neon database endpoint ID requirement
let connectionString = process.env.DATABASE_URL;
if (connectionString?.includes('neon.tech') && !connectionString.includes('options=endpoint')) {
  const url = new URL(connectionString);
  const endpointId = url.hostname.split('.')[0];
  url.searchParams.set('options', `endpoint=${endpointId}`);
  connectionString = url.toString();
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

async function addRecoveryStatusColumn() {
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Add recovery_status column to flight_disruptions table
    console.log('📋 Adding recovery_status column to flight_disruptions table...');
    await client.query(`
      ALTER TABLE flight_disruptions 
      ADD COLUMN IF NOT EXISTS recovery_status VARCHAR(50) DEFAULT 'none';
    `);
    console.log('✅ recovery_status column added successfully');

    // Create pending_recovery_solutions table
    console.log('📋 Creating pending_recovery_solutions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_recovery_solutions (
        id SERIAL PRIMARY KEY,
        disruption_id INTEGER REFERENCES flight_disruptions(id),
        option_id VARCHAR(100),
        option_title VARCHAR(255),
        option_description TEXT,
        cost VARCHAR(50),
        timeline VARCHAR(100),
        confidence DECIMAL(5,2),
        impact TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        full_details JSONB,
        rotation_impact JSONB,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_by VARCHAR(100) DEFAULT 'system',
        approval_required VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ pending_recovery_solutions table created successfully');

    // Verify the changes
    console.log('🔍 Verifying table structure...');
    const columnCheck = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'flight_disruptions' AND column_name = 'recovery_status';
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ recovery_status column verified:', columnCheck.rows[0]);
    }

    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'pending_recovery_solutions';
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ pending_recovery_solutions table verified');
    }

    client.release();
    
  } catch (error) {
    console.error('❌ Error adding recovery status column:', error.message);
    console.error('Details:', error);
  } finally {
    await pool.end();
    console.log('🔚 Database connection closed');
  }
}

// Run the function
addRecoveryStatusColumn();
