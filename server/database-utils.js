
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
  
  // Add the endpoint parameter for Neon
  const url = new URL(connectionString);
  url.searchParams.set('options', `endpoint=${endpointId}`);
  
  return url.toString();
}
