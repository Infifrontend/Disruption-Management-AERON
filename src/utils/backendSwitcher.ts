
// Simple environment variable helper for backend switching
export const getBackendType = (): 'express' | 'python' => {
  const envBackendType = import.meta.env.VITE_BACKEND_TYPE?.toLowerCase();
  return envBackendType === "python" ? "python" : "express";
}

export const getApiUrl = (backendType?: 'express' | 'python'): string => {
  const type = backendType || getBackendType();
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname === "localhost" || hostname === "0.0.0.0") {
    // Development environment
    const port = getBackendPort(type);
    return `http://0.0.0.0:${port}/api`;
  } else {
    // Replit production environment
    return type === "python" ? `${protocol}//${hostname}/api` : "/api";
  }
}

export const getBackendPort = (type: 'express' | 'python'): number => {
  if (type === "python") {
    return parseInt(import.meta.env.PYTHON_API_PORT || "8000", 10);
  }
  return parseInt(import.meta.env.DATABASE_SERVER_PORT || "3001", 10);
}

export const getTimeout = (backendType: 'express' | 'python'): number => {
  if (backendType === "python") {
    return parseInt(import.meta.env.VITE_PYTHON_TIMEOUT || "8000", 10);
  }
  return parseInt(import.meta.env.VITE_EXPRESS_TIMEOUT || "5000", 10);
}

export const getCurrentBackend = () => {
  const type = getBackendType();
  return {
    type,
    apiUrl: getApiUrl(type),
    timeout: getTimeout(type),
    port: getBackendPort(type),
    isPython: type === "python",
    isExpress: type === "express",
    requiresTrailingSlash: type === "python",
  };
}

export const getBackendStatus = async () => {
  const backend = getCurrentBackend();
  
  try {
    // Test database service health by making a direct health check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), backend.timeout);

    const response = await fetch(`${backend.apiUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const databaseHealthy = response.ok;

    // For recovery API health (if using Express)
    let recoveryHealthy = true;
    if (backend.isExpress) {
      try {
        const recoveryPort = import.meta.env.RECOVERY_API_PORT || '3002';
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        let recoveryUrl;
        if (hostname === 'localhost' || hostname === '0.0.0.0') {
          recoveryUrl = `http://0.0.0.0:${recoveryPort}/health`;
        } else {
          recoveryUrl = `${protocol}//${hostname}:${recoveryPort}/health`;
        }

        const recoveryController = new AbortController();
        const recoveryTimeoutId = setTimeout(() => recoveryController.abort(), 3000);

        const recoveryResponse = await fetch(recoveryUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: recoveryController.signal,
        });

        clearTimeout(recoveryTimeoutId);
        recoveryHealthy = recoveryResponse.ok;
      } catch (error) {
        console.warn('Recovery API health check failed:', error);
        recoveryHealthy = false;
      }
    }
    
    return {
      backend: backend.type,
      apiUrl: backend.apiUrl,
      databaseHealthy,
      recoveryHealthy,
      overall: databaseHealthy && recoveryHealthy
    }
  } catch (error) {
    console.error('Error checking backend status:', error)
    return {
      backend: backend.type,
      apiUrl: backend.apiUrl,
      databaseHealthy: false,
      recoveryHealthy: false,
      overall: false
    }
  }
}
