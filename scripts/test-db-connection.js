
import pkg from "pg";
const { Pool } = pkg;

async function testDatabaseConnection() {
  const connectionString = process.env.DB_URL;
  
  if (!connectionString) {
    console.error('❌ DB_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔌 Testing database connection...');
  console.log('Connection string:', connectionString.replace(/:[^:]*@/, ':****@'));

  const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    max: 1,
    connectionTimeoutMillis: 15000,
  });

  try {
    // Test basic connection
    console.log('📡 Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connected successfully');
    
    // Test basic query
    console.log('🔍 Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful');
    console.log('📊 Database info:', {
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version.split(' ')[0]
    });
    
    // Test settings table
    console.log('🏗️  Testing settings table...');
    const settingsTest = await client.query('SELECT COUNT(*) as count FROM settings');
    console.log('✅ Settings table accessible:', settingsTest.rows[0].count, 'records');
    
    client.release();
    
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Check your DB_URL and network connectivity');
    } else if (error.code === '57P01') {
      console.log('💡 Database terminated the connection - this is normal for idle connections');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Database server refused the connection - check if database is running');
    }
  } finally {
    await pool.end();
  }
}

testDatabaseConnection().catch(console.error);
