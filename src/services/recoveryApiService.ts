
import { backendConfig } from "./backendConfig";

// Recovery Options API Client Service
export interface RecoveryApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FlightData {
  id: string
  flightNumber: string
  route: string
  origin: string
  destination: string
  aircraft: string
  scheduledDeparture: string
  delay: number
  passengers: number
  severity: string
  type: string
  categorization: string
  status: string
  disruptionReason: string
}

export interface RecoveryOption {
  id: string
  disruption_id: string
  title: string
  description: string
  cost: string
  timeline: string
  confidence: number
  impact: string
  status: string
  priority: number
  advantages: string[]
  considerations: string[]
  resource_requirements: any
  cost_breakdown: any
  timeline_details: any
  risk_assessment: any
  technical_specs: any
  metrics: any
  rotation_plan: any
  created_at: string
  updated_at: string
}

export interface RecoveryStep {
  id: string
  disruption_id: string
  step_number: number
  title: string
  status: string
  timestamp: string
  system: string
  details: string
  step_data: any
  created_at: string
}

export interface RecoveryOptionsResponse {
  success: boolean
  flight: {
    id: string
    flightNumber: string
    route: string
    disruptionType: string
  }
  options: RecoveryOption[]
  steps?: RecoveryStep[]
  optionsCount: number
  stepsCount: number
  fromCache?: boolean
  message: string
}

class RecoveryApiService {
  private baseUrl: string
  private healthCheckCache: { status: boolean; timestamp: number } | null = null
  private readonly HEALTH_CHECK_CACHE_DURATION = 60000 // 1 minute

  constructor() {
    const config = backendConfig.getConfig()
    
    if (config.isPython) {
      // For Python backend, use the base URL but potentially different port/path for recovery
      this.baseUrl = config.apiUrl.replace('/api', '') // Remove /api suffix for recovery service
    } else {
      // For Express backend, use port 3002
      const hostname = window.location.hostname
      const protocol = window.location.protocol

      if (hostname === 'localhost') {
        this.baseUrl = 'http://localhost:3002'
      } else {
        // For Replit production, construct the correct URL
        this.baseUrl = `${protocol}//${hostname.replace('-00-', '-00-').replace('.replit.dev', '.replit.dev')}:3002`
      }
    }
    
    console.log(`Recovery API service initialized with ${config.type.toUpperCase()} backend:`, this.baseUrl)
  }

  private isCacheValid(): boolean {
    if (!this.healthCheckCache) return false
    return Date.now() - this.healthCheckCache.timestamp < this.HEALTH_CHECK_CACHE_DURATION
  }

  // Health check for recovery service
  async healthCheck(): Promise<boolean> {
    if (this.isCacheValid()) {
      return this.healthCheckCache!.status
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const isHealthy = response.ok

      this.healthCheckCache = {
        status: isHealthy,
        timestamp: Date.now()
      }

      return isHealthy
    } catch (error) {
      console.warn('Recovery API health check failed:', error)
      this.healthCheckCache = {
        status: false,
        timestamp: Date.now()
      }
      return false
    }
  }

  // Get flight data by flight number or ID
  async getFlight(identifier: string): Promise<FlightData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/flight/${identifier}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success ? result.flight : null
    } catch (error) {
      console.error(`Error fetching flight ${identifier}:`, error)
      return null
    }
  }

  // Generate recovery options for a flight
  async generateRecoveryOptions(
    identifier: string, 
    forceRegenerate: boolean = false
  ): Promise<RecoveryOptionsResponse | null> {
    try {
      console.log(`Generating recovery options for flight ${identifier}`)

      const response = await fetch(`${this.baseUrl}/flight/${identifier}/recovery-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRegenerate })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Generation failed: ${response.status} - ${errorText}`)
        throw new Error(`Failed to generate recovery options: ${response.status}`)
      }

      const result = await response.json()
      console.log('Recovery options generated successfully:', result)
      return result
    } catch (error) {
      console.error('Error generating recovery options:', error)
      return null
    }
  }

  // Get existing recovery options for a flight
  async getRecoveryOptions(identifier: string): Promise<RecoveryOptionsResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/flight/${identifier}/recovery-options`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success ? result : null
    } catch (error) {
      console.error(`Error fetching recovery options for ${identifier}:`, error)
      return null
    }
  }

  // Get detailed recovery option by ID
  async getRecoveryOptionDetails(optionId: string): Promise<RecoveryOption | null> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-option/${optionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success ? result.option : null
    } catch (error) {
      console.error(`Error fetching recovery option details ${optionId}:`, error)
      return null
    }
  }

  // Update recovery option status
  async updateRecoveryOptionStatus(
    optionId: string, 
    status: string, 
    notes?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-option/${optionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error(`Error updating recovery option status ${optionId}:`, error)
      return false
    }
  }

  // Get all active flights with disruptions
  async getActiveFlights(status: string = 'Active'): Promise<FlightData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/flights?status=${encodeURIComponent(status)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success ? result.flights : []
    } catch (error) {
      console.error('Error fetching active flights:', error)
      return []
    }
  }

  // Comprehensive recovery generation with fallback
  async getOrGenerateRecoveryOptions(
    identifier: string, 
    forceRegenerate: boolean = false
  ): Promise<RecoveryOptionsResponse | null> {
    try {
      // First check if options already exist (unless forcing regenerate)
      if (!forceRegenerate) {
        const existing = await this.getRecoveryOptions(identifier)
        if (existing && existing.optionsCount > 0) {
          console.log(`Found ${existing.optionsCount} existing recovery options for ${identifier}`)
          return existing
        }
      }

      // Generate new options
      console.log(`Generating new recovery options for ${identifier}`)
      return await this.generateRecoveryOptions(identifier, forceRegenerate)
    } catch (error) {
      console.error('Error in getOrGenerateRecoveryOptions:', error)
      return null
    }
  }
}

// Singleton instance
export const recoveryApiService = new RecoveryApiService()
