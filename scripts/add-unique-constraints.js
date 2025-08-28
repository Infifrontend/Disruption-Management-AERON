
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

async function addUniqueConstraints() {
  try {
    console.log('🔧 Adding unique constraints to recovery tables...');
    
    // Add unique constraint for recovery_options
    try {
      await pool.query(`
        ALTER TABLE recovery_options 
        ADD CONSTRAINT recovery_options_disruption_title_unique 
        UNIQUE (disruption_id, title)
      `);
      console.log('✅ Added unique constraint for recovery_options');
    } catch (error) {
      if (error.code === '42P07') {
        console.log('ℹ️ Unique constraint for recovery_options already exists');
      } else {
        console.error('❌ Error adding recovery_options constraint:', error.message);
      }
    }
    
    // Add unique constraint for recovery_steps
    try {
      await pool.query(`
        ALTER TABLE recovery_steps 
        ADD CONSTRAINT recovery_steps_disruption_step_unique 
        UNIQUE (disruption_id, step_number)
      `);
      console.log('✅ Added unique constraint for recovery_steps');
    } catch (error) {
      if (error.code === '42P07') {
        console.log('ℹ️ Unique constraint for recovery_steps already exists');
      } else {
        console.error('❌ Error adding recovery_steps constraint:', error.message);
      }
    }
    
    console.log('🎉 Unique constraints setup completed!');
    
  } catch (error) {
    console.error('💥 Error adding unique constraints:', error);
  } finally {
    await pool.end();
  }
}

addUniqueConstraints();
