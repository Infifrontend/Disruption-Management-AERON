
#!/usr/bin/env node

const path = require('path')
const { spawn } = require('child_process')

console.log('🚀 Starting AERON Database Server...')

// Start the database API server
const serverPath = path.join(__dirname, 'database.js')
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.API_PORT || '3001'
  }
})

server.on('error', (error) => {
  console.error('❌ Failed to start database server:', error)
  process.exit(1)
})

server.on('close', (code) => {
  console.log(`🔄 Database server exited with code ${code}`)
  if (code !== 0) {
    process.exit(code)
  }
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down database server...')
  server.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down database server...')
  server.kill('SIGTERM')
})
