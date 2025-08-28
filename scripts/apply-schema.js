
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';
import { readFileSync } from 'fs';

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DB_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

async function applySchema() {
  console.log('🔄 Applying recovery option details schema...');

  try {
    const schemaSQL = readFileSync('database/recovery_option_details_schema.sql', 'utf8');
    
    await pool.query(schemaSQL);
    
    console.log('✅ Schema applied successfully!');

  } catch (error) {
    console.error('❌ Error applying schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applySchema();
