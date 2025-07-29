
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

class DatabaseService {
  private baseUrl: string

  constructor() {
    // Use Replit's built-in database URL or fallback to localhost
    this.baseUrl = process.env.DATABASE_URL || 'http://localhost:3001/api'
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

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService()
