
// Script to set up airports, airlines, and airline_hubs tables
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const connectionString = process.env.DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ No database connection string found. Set DB_URL or DATABASE_URL environment variable.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function setupAirportsSchema() {
  let client;
  
  try {
    console.log('🚀 Setting up airports, airlines, and airline_hubs schema...');
    
    client = await pool.connect();
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'airports_airlines_schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    // Execute the schema
    await client.query('BEGIN');
    await client.query(schemaSQL);
    await client.query('COMMIT');
    
    console.log('✅ Successfully created airports, airlines, and airline_hubs tables');
    
    // Verify the setup
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('airports', 'airlines', 'airline_hubs')
      ORDER BY table_name
    `);
    
    console.log('📋 Tables created:', tablesResult.rows.map(row => row.table_name).join(', '));
    
    // Check sample data
    const airportsCount = await client.query('SELECT COUNT(*) FROM airports');
    const airlinesCount = await client.query('SELECT COUNT(*) FROM airlines');
    const hubsCount = await client.query('SELECT COUNT(*) FROM airline_hubs');
    
    console.log('📊 Sample data loaded:');
    console.log(`   - ${airportsCount.rows[0].count} airports`);
    console.log(`   - ${airlinesCount.rows[0].count} airlines`);
    console.log(`   - ${hubsCount.rows[0].count} airline hubs`);
    
    console.log('🎉 Schema setup completed successfully!');
    
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError);
      }
    }
    console.error('❌ Error setting up airports schema:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the setup
setupAirportsSchema();
