export interface BackendConfig {
  type: 'express' | 'python'
  apiUrl: string
  timeout: number
  isPython: boolean
  isExpress: boolean
  requiresTrailingSlash: boolean
}

class BackendConfigService {
  private config: BackendConfig

  constructor() {
    // Determine backend type based on environment or configuration
    const backendType = this.detectBackendType()

    this.config = {
      type: backendType,
      apiUrl: this.getApiUrl(backendType),
      timeout: backendType === 'python' ? 10000 : 5000, // Python might be slower
      isPython: backendType === 'python',
      isExpress: backendType === 'express',
      requiresTrailingSlash: backendType === 'python' // Django typically requires trailing slashes
    }

    console.log(`🔧 Backend Config: Using ${backendType.toUpperCase()} backend at ${this.config.apiUrl}`)
    console.log(`🔧 Backend Flags: isExpress=${this.config.isExpress}, isPython=${this.config.isPython}`)
    console.log(`🔧 Timeout Config: ${this.config.timeout}ms for ${backendType.toUpperCase()} backend`)
    console.log(`🔧 URL Format: requiresTrailingSlash=${this.config.requiresTrailingSlash}`)
  }

  // Helper method to detect backend type
  private detectBackendType(): 'express' | 'python' {
    const envBackendType = import.meta.env.VITE_BACKEND_TYPE?.toLowerCase();
    if (envBackendType === 'python') {
      return 'python';
    }
    // Default to express if not explicitly python or if env var is missing/invalid
    return 'express';
  }

  // Helper method to get the API URL based on backend type
  private getApiUrl(backendType: 'express' | 'python'): string {
    const expressUrl = import.meta.env.VITE_API_URL || 'http://0.0.0.0:3001/api';
    const pythonUrl = import.meta.env.VITE_PYTHON_API_URL || 'https://de8beaee-b5a0-4c60-90f6-8331e3429086-00-37powysl19y12.sisko.replit.dev/api';

    // Validate Python URL format
    if (backendType === 'python' && pythonUrl.includes('sisko.replit.dev')) {
      console.warn('⚠️ Python backend URL may be unreachable. Consider switching to Express backend.');
    }

    return backendType === 'python' ? pythonUrl : expressUrl;
  }

  getConfig(): BackendConfig {
    return { ...this.config }
  }

  // Method to get the base API URL
  getApiUrlBase(): string {
    return this.config.apiUrl;
  }

  getBackendType(): 'express' | 'python' {
    return this.config.type
  }

  isExpressBackend(): boolean {
    return this.config.isExpress
  }

  isPythonBackend(): boolean {
    return this.config.isPython
  }

  getTimeout(): number {
    return this.config.timeout
  }

  // Format URL with proper trailing slash handling
  formatApiUrl(endpoint: string): string {
    const baseUrl = this.config.apiUrl
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

    if (this.config.requiresTrailingSlash) {
      // Django-style: ensure trailing slash
      const fullUrl = `${baseUrl}/${cleanEndpoint}`
      return fullUrl.endsWith('/') ? fullUrl : `${fullUrl}/`
    } else {
      // Express-style: no trailing slash required
      return `${baseUrl}/${cleanEndpoint}`
    }
  }

  // Method to switch backend at runtime (optional)
  switchBackend(type: 'express' | 'python'): void {
    const expressUrl = import.meta.env.VITE_API_URL || 'http://0.0.0.0:3001/api'
    const pythonUrl = import.meta.env.VITE_PYTHON_API_URL || 'https://de8beaee-b5a0-4c60-90f6-8331e3429086-00-37powysl19y12.sisko.replit.dev/api'
    const expressTimeout = parseInt(import.meta.env.VITE_EXPRESS_TIMEOUT || '2000', 10)
    const pythonTimeout = parseInt(import.meta.env.VITE_PYTHON_TIMEOUT || '8000', 10)

    this.config = {
      type,
      apiUrl: type === 'python' ? pythonUrl : expressUrl,
      isExpress: type === 'express',
      isPython: type === 'python',
      timeout: type === 'python' ? pythonTimeout : expressTimeout,
      requiresTrailingSlash: type === 'python'
    }

    console.log(`🔄 Backend switched to ${type.toUpperCase()} at ${this.config.apiUrl}`)
    console.log(`🔧 Timeout Config: ${this.config.timeout}ms for ${type.toUpperCase()} backend`)
    console.log(`🔧 URL Format: requiresTrailingSlash=${this.config.requiresTrailingSlash}`)
  }
}

// Singleton instance
export const backendConfig = new BackendConfigService()