
import { config } from 'dotenv';
import pkg from 'pg';

config();
const { Pool } = pkg;

const connectionString = process.env.DB_URL || 'postgresql://0.0.0.0:5432/aeron_settings';

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function fixRecoveryArrays() {
  try {
    console.log('🔧 Fixing recovery options array columns...');
    
    // First, check current schema for advantages and considerations columns
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'recovery_options' 
      AND column_name IN ('advantages', 'considerations')
    `);
    
    console.log('Current column types:', columnCheck.rows);
    
    // Clear any malformed records
    await pool.query(`DELETE FROM recovery_options WHERE advantages IS NULL OR considerations IS NULL`);
    console.log('✅ Cleared malformed records');
    
    // Ensure columns are proper array types
    try {
      await pool.query(`ALTER TABLE recovery_options ALTER COLUMN advantages TYPE TEXT[] USING ARRAY[]::TEXT[]`);
      await pool.query(`ALTER TABLE recovery_options ALTER COLUMN considerations TYPE TEXT[] USING ARRAY[]::TEXT[]`);
      console.log('✅ Fixed array column types');
    } catch (error) {
      console.log('ℹ️ Array columns already correct type or update not needed');
    }
    
    console.log('🎉 Recovery options arrays fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing recovery arrays:', error);
  } finally {
    await pool.end();
  }
}

fixRecoveryArrays();
