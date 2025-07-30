
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

    // Execute schema with error handling for existing objects
    console.log('🚀 Executing database schema...')
    
    // Split schema into individual statements and execute them one by one
    // This allows us to handle errors for existing objects gracefully
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    let successCount = 0
    let skipCount = 0
    
    for (const statement of statements) {
      try {
        await pool.query(statement)
        successCount++
      } catch (error) {
        // Skip errors for objects that already exist
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('relation') && error.message.includes('already exists')) {
          skipCount++
          console.log(`⚠️  Skipped: ${error.message.split(':')[1]?.trim() || 'Object already exists'}`)
        } else {
          // Re-throw other errors
          throw error
        }
      }
    }
    
    console.log(`✅ Database schema processed: ${successCount} executed, ${skipCount} skipped`)

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
