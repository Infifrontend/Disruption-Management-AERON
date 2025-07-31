// Database service for PostgreSQL operations
import { SettingsData } from '../utils/settingsStorage'

export interface CustomRule {
  id: number
  rule_id: string
  name: string
  description: string
  category: string
  type: 'Hard' | 'Soft'
  priority: number
  overridable: boolean
  conditions?: string
  actions?: string
  status: 'Active' | 'Inactive' | 'Draft'
  created_by: string
  created_at: string
  updated_by?: string
  updated_at?: string
}

export interface CustomParameter {
  id: number
  parameter_id: string
  name: string
  category: string
  weight: number
  description?: string
  is_active: boolean
  created_by: string
  created_at: string
}

export interface FlightDisruption {
  id: string
  flightNumber: string
  route: string
  origin: string
  destination: string
  originCity: string
  destinationCity: string
  aircraft: string
  scheduledDeparture: string
  estimatedDeparture: string
  delay: number
  passengers: number
  crew: number
  connectionFlights: number
  severity: string
  type: string
  status: string
  disruptionReason: string
  createdAt: string
  updatedAt: string
}

export interface RecoveryOption {
  id: string
  disruptionId: string
  optionName: string
  description: string
  cost: number
  duration: number
  confidence: number
  passengerImpact: number
  createdAt: string
  details: any
}

export interface PassengerData {
  id: string
  name: string
  pnr: string
  flightNumber: string
  seatNumber?: string
  ticketClass: string
  loyaltyTier: string
  specialNeeds?: string
  contactInfo: any
  rebookingStatus?: string
}

export interface CrewMember {
  id: string
  name: string
  role: string
  qualifications: string[]
  dutyTimeRemaining: number
  baseLocation: string
  status: string
  contactInfo: any
}

export interface Aircraft {
  id: string
  registration: string
  type: string
  status: string
  location: string
  maintenanceStatus: string
  fuelLevel: number
  nextMaintenance: string
}

export interface HotelBooking {
  id: string
  disruptionId: string
  passengerPnr: string
  hotelName: string
  checkIn: string
  checkOut: string
  cost: number
  status: string
  createdAt: string
}

class DatabaseService {
  private baseUrl: string

  constructor() {
    // Use API base URL for database operations - use HTTPS in production to avoid Mixed Content errors
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    const hostname = window.location.hostname

    if (hostname === 'localhost') {
      this.baseUrl = 'http://localhost:3001/api'
    } else {
      // For Replit production, use same protocol as the frontend
      this.baseUrl = `${protocol}//${hostname}:3001/api`
    }
  }

  // Settings operations
  async getAllSettings(): Promise<SettingsData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      // Transform database format to SettingsData format
      return data.map((setting: any) => ({
        id: `${setting.category}_${setting.key}`,
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type as SettingsData['type'],
        updatedAt: setting.updated_at,
        updatedBy: setting.updated_by
      }))
    } catch (error) {
      console.error('Failed to fetch settings from database:', error)
      // Return empty array as fallback
      return []
    }
  }

  async getSetting(category: string, key: string): Promise<SettingsData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/settings/${category}/${key}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const setting = await response.json()

      return {
        id: `${setting.category}_${setting.key}`,
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type as SettingsData['type'],
        updatedAt: setting.updated_at,
        updatedBy: setting.updated_by
      }
    } catch (error) {
      console.error(`Failed to fetch setting ${category}.${key}:`, error)
      return null
    }
  }

  async getSettingsByCategory(category: string): Promise<SettingsData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/settings/category/${category}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      return data.map((setting: any) => ({
        id: `${setting.category}_${setting.key}`,
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type as SettingsData['type'],
        updatedAt: setting.updated_at,
        updatedBy: setting.updated_by
      }))
    } catch (error) {
      console.error(`Failed to fetch settings for category ${category}:`, error)
      return []
    }
  }

  async saveSetting(
    category: string, 
    key: string, 
    value: any, 
    type: SettingsData['type'], 
    userId: string = 'system'
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          key,
          value,
          type,
          updated_by: userId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`Successfully saved setting ${category}.${key} to database`)
      return true
    } catch (error) {
      console.error(`Failed to save setting ${category}.${key}:`, error)
      return false
    }
  }

  async deleteSetting(category: string, key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/settings/${category}/${key}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to delete setting ${category}.${key}:`, error)
      return false
    }
  }

  // Custom Rules operations
  async getAllCustomRules(): Promise<CustomRule[]> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch custom rules:', error)
      return []
    }
  }

  async saveCustomRule(rule: Omit<CustomRule, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rule)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Failed to save custom rule:', error)
      return false
    }
  }

  async updateCustomRule(ruleId: string, updates: Partial<CustomRule>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to update custom rule ${ruleId}:`, error)
      return false
    }
  }

  async deleteCustomRule(ruleId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules/${ruleId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to delete custom rule ${ruleId}:`, error)
      return false
    }
  }

  // Custom Parameters operations
  async getAllCustomParameters(): Promise<CustomParameter[]> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-parameters`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch custom parameters:', error)
      return []
    }
  }

  async saveCustomParameter(parameter: Omit<CustomParameter, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-parameters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameter)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Failed to save custom parameter:', error)
      return false
    }
  }

  async deleteCustomParameter(parameterId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-parameters/${parameterId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error(`Failed to delete custom parameter ${parameterId}:`, error)
      return false
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  // Utility methods
  async resetToDefaults(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/settings/reset`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Failed to reset settings to defaults:', error)
      return false
    }
  }

  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getAllSettings()
      return JSON.stringify(settings, null, 2)
    } catch (error) {
      console.error('Failed to export settings:', error)
      return '[]'
    }
  }

  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const settings: SettingsData[] = JSON.parse(settingsJson)

      for (const setting of settings) {
        await this.saveSetting(
          setting.category, 
          setting.key, 
          setting.value, 
          setting.type, 
          setting.updatedBy
        )
      }

      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  // Flight Disruptions
  async getAllDisruptions(): Promise<FlightDisruption[]> {
    try {
      const response = await fetch(`${this.baseUrl}/disruptions`)
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No disruptions found in database')
          return []
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      if (!Array.isArray(data)) {
        console.error('Invalid response format - expected array')
        return []
      }

      // Transform database format to expected format
      return data.map((disruption: any) => ({
        id: disruption.id?.toString() || disruption.flight_number,
        flightNumber: disruption.flight_number,
        route: disruption.route,
        origin: disruption.origin || 'DXB',
        destination: disruption.destination || 'Unknown',
        originCity: disruption.origin_city || 'Dubai',
        destinationCity: disruption.destination_city || 'Unknown',
        aircraft: disruption.aircraft,
        scheduledDeparture: disruption.scheduled_departure,
        estimatedDeparture: disruption.estimated_departure,
        delay: disruption.delay_minutes || 0,
        passengers: disruption.passengers || 0,
        crew: disruption.crew || 6,
        connectionFlights: disruption.connection_flights || 0,
        severity: disruption.severity,
        type: disruption.disruption_type,
        status: disruption.status,
        disruptionReason: disruption.disruption_reason,
        createdAt: disruption.created_at,
        updatedAt: disruption.updated_at
      }))
    } catch (error) {
      console.error('Failed to fetch disruptions:', error)
      return []
    }
  }

  async getDisruption(id: string): Promise<FlightDisruption | null> {
    try {
      const response = await fetch(`${this.baseUrl}/disruptions/${id}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error(`Failed to fetch disruption ${id}:`, error)
      return null
    }
  }

  async saveDisruption(disruption: Omit<FlightDisruption, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      console.log('Saving disruption to database:', disruption)

      // Transform camelCase to snake_case for database
      const dbData = {
        flight_number: disruption.flightNumber,
        route: disruption.route,
        origin: disruption.origin,
        destination: disruption.destination,
        origin_city: disruption.originCity,
        destination_city: disruption.destinationCity,
        aircraft: disruption.aircraft,
        scheduled_departure: disruption.scheduledDeparture,
        estimated_departure: disruption.estimatedDeparture,
        delay_minutes: disruption.delay,
        passengers: disruption.passengers,
        crew: disruption.crew,
        connection_flights: disruption.connectionFlights || 0,
        severity: disruption.severity,
        disruption_type: disruption.type,
        status: disruption.status,
        disruption_reason: disruption.disruptionReason
      }

      console.log('Transformed data for database:', dbData)

      const response = await fetch(`${this.baseUrl}/disruptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('Successfully saved disruption:', result)
      return true
    } catch (error) {
      console.error('Failed to save disruption:', error)
      return false
    }
  }

  // Recovery Options
  async getRecoveryOptions(disruptionId: string): Promise<RecoveryOption[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-options/${disruptionId}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch recovery options:', error)
      return []
    }
  }

  async saveRecoveryOption(option: Omit<RecoveryOption, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(option)
      })
      return response.ok
    } catch (error) {
      console.error('Failed to save recovery option:', error)
      return false
    }
  }

  // Passengers
  async getPassengersByFlight(flightNumber: string): Promise<PassengerData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/passengers/flight/${flightNumber}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch passengers:', error)
      return []
    }
  }

  async getPassengerByPnr(pnr: string): Promise<PassengerData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/passengers/pnr/${pnr}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error(`Failed to fetch passenger ${pnr}:`, error)
      return null
    }
  }

  async updatePassengerRebooking(pnr: string, rebookingData: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/passengers/${pnr}/rebooking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rebookingData)
      })
      return response.ok
    } catch (error) {
      console.error('Failed to update passenger rebooking:', error)
      return false
    }
  }

  // Crew Management
  async getAvailableCrew(): Promise<CrewMember[]> {
    try {
      const response = await fetch(`${this.baseUrl}/crew/available`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch available crew:', error)
      return []
    }
  }

  async getCrewByFlight(flightNumber: string): Promise<CrewMember[]> {
    try {
      const response = await fetch(`${this.baseUrl}/crew/flight/${flightNumber}`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch crew for flight:', error)
      return []
    }
  }

  // Aircraft Management
  async getAllAircraft(): Promise<Aircraft[]> {
    try {
      const response = await fetch(`${this.baseUrl}/aircraft`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch aircraft:', error)
      return []
    }
  }

  async getAvailableAircraft(): Promise<Aircraft[]> {
    try {
      const response = await fetch(`${this.baseUrl}/aircraft/available`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch available aircraft:', error)
      return []
    }
  }

  async updateAircraftStatus(id: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/aircraft/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      return response.ok
    } catch (error) {
      console.error('Failed to update aircraft status:', error)
      return false
    }
  }

  // Hotel Bookings
  async getHotelBookings(disruptionId?: string): Promise<HotelBooking[]> {
    try {
      const url = disruptionId 
        ? `${this.baseUrl}/hotel-bookings/disruption/${disruptionId}`
        : `${this.baseUrl}/hotel-bookings`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch hotel bookings:', error)
      return []
    }
  }

  async createHotelBooking(booking: Omit<HotelBooking, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/hotel-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      })
      return response.ok
    } catch (error) {
      console.error('Failed to create hotel booking:', error)
      return false
    }
  }

  // Analytics and KPIs
  async getKPIData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/kpi`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching KPI data:', error)
      return {
        activeDisruptions: 0,
        affectedPassengers: 0,
        averageDelay: 0,
        recoverySuccessRate: 0,
        onTimePerformance: 0,
        costSavings: 0
      }
    }
  }

  // Recovery Options methods
  async getRecoveryOptions(disruptionId: string | number) {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-options/${disruptionId}`)
      if (!response.ok) return []
      return await response.json()
    } catch (error) {
      console.error('Error fetching recovery options:', error)
      return []
    }
  }

  async generateRecoveryOptions(disruptionId: string | number) {
    try {
      const response = await fetch(`${this.baseUrl}/generate-recovery-options/${disruptionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating recovery options:', error)
      throw error
    }
  }

  async getRecoverySteps(disruptionId: string | number) {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-steps/${disruptionId}`)
      if (!response.ok) return []
      return await response.json()
    } catch (error) {
      console.error('Error fetching recovery steps:', error)
      return []
    }
  }

  async saveRecoveryOption(recoveryOption: any) {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recoveryOption)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error saving recovery option:', error)
      throw error
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService()