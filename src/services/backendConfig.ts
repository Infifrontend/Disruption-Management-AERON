
export interface BackendConfig {
  type: 'express' | 'python'
  apiUrl: string
  isExpress: boolean
  isPython: boolean
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

    // Explicit backend type determination
    const type = backendType.toLowerCase() === 'python' ? 'python' : 'express'
    const isPython = type === 'python'
    const isExpress = type === 'express'
    let apiUrl = isPython ? pythonUrl : expressUrl

    // Validate Python URL format
    if (isPython && pythonUrl.includes('sisko.replit.dev')) {
      console.warn('⚠️ Python backend URL may be unreachable. Consider switching to Express backend.')
    }

    console.log(`🔧 Backend Config: Using ${type.toUpperCase()} backend at ${apiUrl}`)
    console.log(`🔧 Backend Flags: isExpress=${isExpress}, isPython=${isPython}`)

    return {
      type,
      apiUrl,
      isExpress,
      isPython
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

  // Method to switch backend at runtime (optional)
  switchBackend(type: 'express' | 'python'): void {
    const expressUrl = import.meta.env.VITE_API_URL || 'http://0.0.0.0:3001/api'
    const pythonUrl = import.meta.env.VITE_PYTHON_API_URL || 'https://de8beaee-b5a0-4c60-90f6-8331e3429086-00-37powysl19y12.sisko.replit.dev/api'

    this.config = {
      type,
      apiUrl: type === 'python' ? pythonUrl : expressUrl,
      isExpress: type === 'express',
      isPython: type === 'python'
    }

    console.log(`🔄 Backend switched to ${type.toUpperCase()} at ${this.config.apiUrl}`)
  }
}

// Singleton instance
export const backendConfig = new BackendConfigService()
