
#!/usr/bin/env node

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function initializeSchema() {
  let connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  // Handle Neon database connection with proper endpoint parameter
  if (connectionString.includes('neon.tech')) {
    const url = new URL(connectionString)
    const endpointId = url.hostname.split('.')[0]
    
    // Add endpoint parameter for Neon compatibility
    const params = new URLSearchParams(url.search)
    params.set('options', `endpoint=${endpointId}`)
    params.set('sslmode', 'require')
    
    // Reconstruct URL with proper parameters
    url.search = params.toString()
    connectionString = url.toString()
    
    console.log('🔧 Configured connection for Neon database with endpoint:', endpointId)
  }

  const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString.includes('neon.tech') || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
    max: 1, // Use single connection for schema initialization
    connectionTimeoutMillis: 10000,
  })

  try {
    console.log('🔌 Connecting to PostgreSQL database...')
    
    // Test connection
    const client = await pool.connect()
    console.log('✅ Database connection successful')
    client.release()

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`)
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    console.log('📖 Schema file loaded successfully')

    // Execute schema
    console.log('🚀 Executing database schema...')
    await pool.query(schemaSQL)
    console.log('✅ Database schema initialized successfully')

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('📊 Created tables:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })

    console.log('🎉 Database initialization completed successfully!')

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    
    if (error.message.includes('Endpoint ID')) {
      console.error('💡 Tip: This appears to be a Neon database connection issue.')
      console.error('   The script should automatically handle this, but you may need to check your DATABASE_URL.')
    }
    
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the initialization
initializeSchema()
