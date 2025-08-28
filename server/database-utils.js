
export function formatNeonConnectionString(connectionString) {
  if (!connectionString) {
    return null;
  }

  // If it's already a Neon connection string with endpoint parameter, return as-is
  if (connectionString.includes('options=endpoint%3D')) {
    return connectionString;
  }

  // Extract the endpoint ID from the host if it's a Neon connection
  const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
  if (!match) {
    return connectionString; // Return original if not a standard format
  }

  const [, username, password, host, database] = match;
  
  // Check if it's a Neon host (contains endpoint ID)
  const endpointMatch = host.match(/^([^.]+)\.([^.]+)\.(.+)$/);
  if (!endpointMatch) {
    return connectionString; // Not a Neon host, return original
  }

  const [, endpointId] = endpointMatch;
  
  try {
    // Add the endpoint parameter for Neon
    const url = new URL(connectionString);
    url.searchParams.set('options', `endpoint=${endpointId}`);
    url.searchParams.set('sslmode', 'require');
    
    return url.toString();
  } catch (error) {
    console.error('Error formatting Neon connection string:', error.message);
    return connectionString;
  }
}

export function getConnectionConfig() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DB_URL;
  
  if (!connectionString) {
    throw new Error('No database connection string provided');
  }

  return {
    connectionString: formatNeonConnectionString(connectionString),
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10)
    }
  };
}

export function isNeonDatabase(connectionString) {
  return connectionString && connectionString.includes('neon.tech');
}
