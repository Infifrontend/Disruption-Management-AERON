
import { URL } from 'url'

export function formatNeonConnectionString(connectionString) {
  if (!connectionString || !connectionString.includes('neon.tech')) {
    return connectionString
  }

  try {
    const url = new URL(connectionString)
    const endpointId = url.hostname.split('.')[0]

    // Add endpoint parameter for Neon compatibility
    const params = new URLSearchParams(url.search)
    params.set('options', `endpoint=${endpointId}`)
    params.set('sslmode', 'require')

    // Reconstruct URL with proper parameters
    url.search = params.toString()
    return url.toString()
  } catch (error) {
    console.error('Error formatting Neon connection string:', error.message)
    return connectionString
  }
}

export function getFormattedDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL
  return formatNeonConnectionString(rawUrl)
}
