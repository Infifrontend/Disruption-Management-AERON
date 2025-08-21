
// Simple API URL configuration
export const getApiUrl = (): string => {
  // Get API URL from environment variables
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`;
  }

  // Fallback for local development
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname === "localhost" || hostname === "0.0.0.0") {
    // Development environment - use port from env or default
    const port = import.meta.env.DATABASE_SERVER_PORT || "3001";
    return `http://0.0.0.0:${port}/api`;
  } else {
    // Production environment
    return "/api";
  }
}

export const getTimeout = (): number => {
  return parseInt(import.meta.env.VITE_EXPRESS_TIMEOUT || "5000", 10);
}

export const getBackendStatus = async () => {
  const apiUrl = getApiUrl();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getTimeout());

    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    return {
      apiUrl: apiUrl,
      databaseHealthy: response.ok,
      recoveryHealthy: true, // Not using separate recovery service
      overall: response.ok
    }
  } catch (error) {
    console.error('Error checking backend status:', error)
    return {
      apiUrl: apiUrl,
      databaseHealthy: false,
      recoveryHealthy: false,
      overall: false
    }
  }
}
