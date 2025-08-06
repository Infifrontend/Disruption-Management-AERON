export interface BackendConfig {
  type: 'express' | 'python'
  apiUrl: string
  isExpress: boolean
  isPython: boolean
  timeout: number // Added timeout property
}

class BackendConfigService {
  private config: BackendConfig

  constructor() {
    this.config = this.initializeConfig()
  }

  private initializeConfig(): BackendConfig {
    const backendType = import.meta.env.VITE_BACKEND_TYPE || 'express'
    const expressUrl = import.meta.env.VITE_API_URL || 'http://0.0.0.0:3001/api'
    const pythonUrl = import.meta.env.VITE_PYTHON_API_URL || 'https://de8beaee-b5a0-4c60-90f6-8331e3429086-00-37powysl19y12.sisko.replit.dev/api'

    // Get timeout configurations
    const expressTimeout = parseInt(import.meta.env.VITE_EXPRESS_TIMEOUT || '2000', 10)
    const pythonTimeout = parseInt(import.meta.env.VITE_PYTHON_TIMEOUT || '8000', 10)

    // Explicit backend type determination
    const type = backendType.toLowerCase() === 'python' ? 'python' : 'express'
    const isPython = type === 'python'
    const isExpress = type === 'express'
    let apiUrl = isPython ? pythonUrl : expressUrl
    const timeout = isPython ? pythonTimeout : expressTimeout

    // Validate Python URL format
    if (isPython && pythonUrl.includes('sisko.replit.dev')) {
      console.warn('⚠️ Python backend URL may be unreachable. Consider switching to Express backend.')
    }

    console.log(`🔧 Backend Config: Using ${type.toUpperCase()} backend at ${apiUrl}`)
    console.log(`🔧 Backend Flags: isExpress=${isExpress}, isPython=${isPython}`)
    console.log(`🔧 Timeout Config: ${timeout}ms for ${type.toUpperCase()} backend`)

    return {
      type,
      apiUrl,
      isExpress,
      isPython,
      timeout
    }
  }

  getConfig(): BackendConfig {
    return this.config
  }

  getApiUrl(): string {
    return this.config.apiUrl
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
      timeout: type === 'python' ? pythonTimeout : expressTimeout
    }

    console.log(`🔄 Backend switched to ${type.toUpperCase()} at ${this.config.apiUrl}`)
    console.log(`🔧 Timeout Config: ${this.config.timeout}ms for ${type.toUpperCase()} backend`)
  }
}

// Singleton instance
export const backendConfig = new BackendConfigService()