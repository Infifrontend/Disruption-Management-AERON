export interface BackendConfig {
  type: 'express' | 'python'
  apiUrl: string
  timeout: number
  port: number
  isPython: boolean
  isExpress: boolean
  requiresTrailingSlash: boolean
}

class BackendConfigService {
  private config: BackendConfig

  constructor() {
    const backendType = this.detectBackendType()
    const apiUrl = this.buildApiUrl(backendType)
    const timeout = this.getTimeout(backendType)
    const port = this.getBackendPort(backendType)

    this.config = {
      type: backendType,
      apiUrl,
      timeout,
      port,
      isPython: backendType === 'python',
      isExpress: backendType === 'express',
      requiresTrailingSlash: backendType === 'python'
    }

    console.log(`🔧 Backend Config: Using ${backendType.toUpperCase()} backend at ${apiUrl}`)
  }

  private detectBackendType(): 'express' | 'python' {
    const envBackendType = import.meta.env.VITE_BACKEND_TYPE?.toLowerCase()
    return envBackendType === 'python' ? 'python' : 'express'
  }

  private buildApiUrl(backendType: 'express' | 'python'): string {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    if (hostname === 'localhost' || hostname === '0.0.0.0') {
      // Development environment
      const port = this.getBackendPort(backendType)
      return `http://0.0.0.0:${port}/api`
    } else {
      // Replit production environment
      return backendType === 'python' ? `${protocol}//${hostname}/api` : '/api'
    }
  }

  private getTimeout(backendType: 'express' | 'python'): number {
    if (backendType === 'python') {
      return parseInt(import.meta.env.VITE_PYTHON_TIMEOUT || '8000', 10)
    }
    return parseInt(import.meta.env.VITE_EXPRESS_TIMEOUT || '5000', 10)
  }

  private getBackendPort(type: 'express' | 'python'): number {
    if (type === 'python') {
      return parseInt(import.meta.env.PYTHON_API_PORT || '8000', 10)
    }
    return parseInt(import.meta.env.DATABASE_SERVER_PORT || '3001', 10)
  }

  getConfig(): BackendConfig {
    return { ...this.config }
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

  formatApiUrl(endpoint: string): string {
    const baseUrl = this.config.apiUrl
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

    if (this.config.requiresTrailingSlash) {
      const fullUrl = `${baseUrl}/${cleanEndpoint}`
      return fullUrl.endsWith('/') ? fullUrl : `${fullUrl}/`
    }
    return `${baseUrl}/${cleanEndpoint}`
  }

  switchBackend(type: 'express' | 'python'): void {
    this.config = {
      ...this.config,
      type,
      apiUrl: this.buildApiUrl(type),
      timeout: this.getTimeout(type),
      port: this.getBackendPort(type),
      isPython: type === 'python',
      isExpress: type === 'express',
      requiresTrailingSlash: type === 'python'
    }

    console.log(`🔄 Backend switched to ${type.toUpperCase()} at ${this.config.apiUrl}`)
  }
}

// Singleton instance
export const backendConfig = new BackendConfigService()