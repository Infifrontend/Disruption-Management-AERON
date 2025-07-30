// Settings storage utility with PostgreSQL database integration and localStorage fallback
import { databaseService } from '../services/databaseService'

export interface SettingsData {
  id: string
  category: string
  key: string
  value: any
  type: 'boolean' | 'number' | 'string' | 'object'
  updatedAt: string
  updatedBy: string
}

export interface ScreenSettings {
  id: string
  name: string
  icon: string
  category: string
  enabled: boolean
  required: boolean
}

// Settings storage with PostgreSQL database and localStorage fallback
class SettingsStorage {
  private storage = new Map<string, SettingsData>()
  private readonly STORAGE_KEY = 'aeron_settings_storage'
  private isDatabaseConnected = false

  // Initialize with database connection check and defaults
  constructor() {
    // Initialize synchronously first with defaults
    this.loadFromLocalStorage()
    this.initializeDefaults()
    this.saveToLocalStorage()

    // Then try to connect to database asynchronously
    this.initializeStorage()
  }

  private async initializeStorage() {
    console.log('Initializing AERON Settings Storage...')

    // Check database connectivity
    this.isDatabaseConnected = await databaseService.healthCheck()

    if (this.isDatabaseConnected) {
      console.log('✅ Database connected - Loading settings from PostgreSQL')
      await this.loadFromDatabase()
    } else {
      console.log('⚠️ Database unavailable - Using localStorage fallback')
      this.loadFromLocalStorage()
      this.initializeDefaults()
      this.saveToLocalStorage()
    }
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const settings = await databaseService.getAllSettings()
      console.log(`Loaded ${settings.length} settings from database`)

      this.storage.clear()
      settings.forEach(setting => {
        this.storage.set(setting.id, setting)
      })
    } catch (error) {
      console.error('Failed to load settings from database:', error)
      console.log('Falling back to localStorage')
      this.isDatabaseConnected = false
      this.loadFromLocalStorage()
      this.initializeDefaults()
    }
  }

  private initializeDefaults() {
    const defaults: Omit<SettingsData, 'id' | 'updatedAt' | 'updatedBy'>[] = [
      // Rule Configuration defaults
      { category: 'operationalRules', key: 'maxDelayThreshold', value: 180, type: 'number' },
      { category: 'operationalRules', key: 'minConnectionTime', value: 45, type: 'number' },
      { category: 'operationalRules', key: 'maxOverbooking', value: 105, type: 'number' },
      { category: 'operationalRules', key: 'priorityRebookingTime', value: 15, type: 'number' },
      { category: 'operationalRules', key: 'hotacTriggerDelay', value: 240, type: 'number' },

      // Recovery Constraints defaults
      { category: 'recoveryConstraints', key: 'maxAircraftSwaps', value: 3, type: 'number' },
      { category: 'recoveryConstraints', key: 'crewDutyTimeLimits', value: true, type: 'boolean' },
      { category: 'recoveryConstraints', key: 'maintenanceSlotProtection', value: true, type: 'boolean' },
      { category: 'recoveryConstraints', key: 'slotCoordinationRequired', value: false, type: 'boolean' },
      { category: 'recoveryConstraints', key: 'curfewCompliance', value: true, type: 'boolean' },

      // Automation Settings defaults
      { category: 'automationSettings', key: 'autoApproveThreshold', value: 95, type: 'number' },
      { category: 'automationSettings', key: 'requireManagerApproval', value: false, type: 'boolean' },
      { category: 'automationSettings', key: 'enablePredictiveActions', value: true, type: 'boolean' },
      { category: 'automationSettings', key: 'autoNotifyPassengers', value: true, type: 'boolean' },
      { category: 'automationSettings', key: 'autoBookHotac', value: false, type: 'boolean' },

      // Passenger Priority defaults
      { category: 'passengerPrioritization', key: 'loyaltyTier', value: 25, type: 'number' },
      { category: 'passengerPrioritization', key: 'ticketClass', value: 20, type: 'number' },
      { category: 'passengerPrioritization', key: 'specialNeeds', value: 30, type: 'number' },
      { category: 'passengerPrioritization', key: 'groupSize', value: 15, type: 'number' },
      { category: 'passengerPrioritization', key: 'connectionRisk', value: 10, type: 'number' },

      // Recovery Options Ranking defaults
      { category: 'recoveryOptionsRanking', key: 'costWeight', value: 30, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'timeWeight', value: 25, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'passengerImpactWeight', value: 20, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'operationalComplexityWeight', value: 15, type: 'number' },
      { category: 'recoveryOptionsRanking', key: 'reputationWeight', value: 10, type: 'number' },

      // Aircraft Selection Criteria defaults
      { category: 'aircraftSelectionCriteria', key: 'maintenanceStatus', value: 25, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'fuelEfficiency', value: 20, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'routeSuitability', value: 20, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'passengerCapacity', value: 15, type: 'number' },
      { category: 'aircraftSelectionCriteria', key: 'availabilityWindow', value: 20, type: 'number' },

      // Crew Assignment Criteria defaults  
      { category: 'crewAssignmentCriteria', key: 'dutyTimeRemaining', value: 30, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'qualifications', value: 25, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'baseLocation', value: 20, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'restRequirements', value: 15, type: 'number' },
      { category: 'crewAssignmentCriteria', key: 'languageSkills', value: 10, type: 'number' },

      // Flight Prioritization defaults
      { category: 'flightPrioritization', key: 'airlinePreference', value: 20, type: 'number' },
      { category: 'flightPrioritization', key: 'onTimePerformance', value: 25, type: 'number' },
      { category: 'flightPrioritization', key: 'aircraftType', value: 15, type: 'number' },
      { category: 'flightPrioritization', key: 'departureTime', value: 20, type: 'number' },
      { category: 'flightPrioritization', key: 'connectionBuffer', value: 20, type: 'number' },

      // Flight Scoring defaults
      { category: 'flightScoring', key: 'baseScore', value: 70, type: 'number' },
      { category: 'flightScoring', key: 'priorityBonus', value: 15, type: 'number' },
      { category: 'flightScoring', key: 'airlineBonus', value: 10, type: 'number' },
      { category: 'flightScoring', key: 'specialReqBonus', value: 8, type: 'number' },
      { category: 'flightScoring', key: 'loyaltyBonus', value: 8, type: 'number' },
      { category: 'flightScoring', key: 'groupBonus', value: 5, type: 'number' },

      // Passenger Scoring defaults
      { category: 'passengerScoring', key: 'vipWeight', value: 40, type: 'number' },
      { category: 'passengerScoring', key: 'loyaltyWeight', value: 25, type: 'number' },
      { category: 'passengerScoring', key: 'specialNeedsWeight', value: 20, type: 'number' },
      { category: 'passengerScoring', key: 'revenueWeight', value: 15, type: 'number' },

      // NLP Settings defaults
      { category: 'nlpSettings', key: 'enabled', value: true, type: 'boolean' },
      { category: 'nlpSettings', key: 'language', value: 'english', type: 'string' },
      { category: 'nlpSettings', key: 'confidence', value: 85, type: 'number' },
      { category: 'nlpSettings', key: 'autoApply', value: false, type: 'boolean' },

      // Notification Settings defaults
      { category: 'notificationSettings', key: 'email', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'sms', value: false, type: 'boolean' },
      { category: 'notificationSettings', key: 'push', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'desktop', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'recoveryAlerts', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'passengerUpdates', value: true, type: 'boolean' },
      { category: 'notificationSettings', key: 'systemAlerts', value: false, type: 'boolean' }
    ]

    defaults.forEach(setting => {
      const id = `${setting.category}_${setting.key}`
      if (!this.storage.has(id)) {
        const settingData: SettingsData = {
          id,
          category: setting.category,
          key: setting.key,
          value: setting.value,
          type: setting.type,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
        this.storage.set(id, settingData)
      }
    })
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data: SettingsData[] = JSON.parse(stored)
        data.forEach(setting => {
          this.storage.set(setting.id, setting)
        })
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    }
  }

  private saveToLocalStorage(): void {
    try {
      const settings = Array.from(this.storage.values())
      const serialized = JSON.stringify(settings)
      localStorage.setItem(this.STORAGE_KEY, serialized)
      console.log(`Saved ${settings.length} settings to localStorage`)
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
      throw error
    }
  }

  async saveSetting(category: string, key: string, value: any, type: SettingsData['type'], userId: string = 'system'): Promise<void> {
    try {
      const id = `${category}_${key}`
      const setting: SettingsData = {
        id,
        category,
        key,
        value,
        type,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      }

      console.log('Saving setting:', setting)

      // Try to save to database first
      if (this.isDatabaseConnected) {
        const success = await databaseService.saveSetting(category, key, value, type, userId)
        if (!success) {
          console.warn('Database save failed, falling back to localStorage')
          this.isDatabaseConnected = false
        }
      }

      // Always update local storage and memory
      this.storage.set(id, setting)
      this.saveToLocalStorage()

      console.log('Setting saved successfully:', id)
    } catch (error) {
      console.error('Failed to save setting:', { category, key, value, type }, error)
      throw error
    }
  }

  async getSetting(category: string, key: string): Promise<SettingsData | null> {
    const id = `${category}_${key}`

    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const setting = await databaseService.getSetting(category, key)
        if (setting) {
          this.storage.set(id, setting)
          return setting
        }
      } catch (error) {
        console.warn('Database read failed, using local storage')
      }
    }

    return this.storage.get(id) || null
  }

  async getSettingsByCategory(category: string): Promise<SettingsData[]> {
    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const settings = await databaseService.getSettingsByCategory(category)
        if (settings.length > 0) {
          settings.forEach(setting => {
            this.storage.set(setting.id, setting)
          })
          return settings
        }
      } catch (error) {
        console.warn('Database read failed, using local storage')
      }
    }

    return Array.from(this.storage.values()).filter(setting => setting.category === category)
  }

  async getAllSettings(): Promise<SettingsData[]> {
    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const settings = await databaseService.getAllSettings()
        if (settings.length > 0) {
          this.storage.clear()
          settings.forEach(setting => {
            this.storage.set(setting.id, setting)
          })
          return settings
        }
      } catch (error) {
        console.warn('Database read failed, using local storage')
      }
    }

    return Array.from(this.storage.values())
  }

  async deleteSetting(category: string, key: string): Promise<boolean> {
    const id = `${category}_${key}`

    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const success = await databaseService.deleteSetting(category, key)
        if (!success) {
          console.warn('Database delete failed')
        }
      } catch (error) {
        console.warn('Database delete failed:', error)
      }
    }

    const result = this.storage.delete(id)
    if (result) {
      this.saveToLocalStorage()
    }
    return result
  }

  async exportSettings(): Promise<string> {
    const settings = await this.getAllSettings()
    return JSON.stringify(settings, null, 2)
  }

  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const settings: SettingsData[] = JSON.parse(settingsJson)

      if (this.isDatabaseConnected) {
        return await databaseService.importSettings(settingsJson)
      } else {
        settings.forEach(setting => {
          this.storage.set(setting.id, setting)
        })
        this.saveToLocalStorage()
        return true
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  async resetToDefaults(): Promise<void> {
    if (this.isDatabaseConnected) {
      try {
        await databaseService.resetToDefaults()
        await this.loadFromDatabase()
        return
      } catch (error) {
        console.warn('Database reset failed, using local reset')
      }
    }

    this.storage.clear()
    this.initializeDefaults()
    this.saveToLocalStorage()
  }

  // Get database connection status
  getDatabaseStatus(): boolean {
    return this.isDatabaseConnected
  }

  // Retry database connection
  async retryDatabaseConnection(): Promise<boolean> {
    this.isDatabaseConnected = await databaseService.healthCheck()
    if (this.isDatabaseConnected) {
      await this.loadFromDatabase()
    }
    return this.isDatabaseConnected
  }

  // Screen Configuration Methods
  async getAllScreenConfigurations(): Promise<ScreenSettings[]> {
    const SCREEN_STORAGE_KEY = 'aeron_screen_configurations'
    
    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const configurations = await databaseService.getAllScreenConfigurations()
        if (configurations.length > 0) {
          // Cache in localStorage for offline access
          const screenSettings = configurations.map(config => ({
            id: config.id,
            name: config.name,
            icon: config.icon,
            category: config.category,
            enabled: config.enabled,
            required: config.required
          }))
          localStorage.setItem(SCREEN_STORAGE_KEY, JSON.stringify(screenSettings))
          return screenSettings
        }
      } catch (error) {
        console.warn('Database read failed for screen configurations, using localStorage')
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(SCREEN_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load screen configurations from localStorage:', error)
    }

    // Return default configurations if nothing is found
    return this.getDefaultScreenConfigurations()
  }

  async updateScreenConfiguration(screenId: string, enabled: boolean, userId: string = 'system'): Promise<boolean> {
    const SCREEN_STORAGE_KEY = 'aeron_screen_configurations'
    
    try {
      // Try database first if connected
      if (this.isDatabaseConnected) {
        const success = await databaseService.updateScreenConfiguration(screenId, enabled, userId)
        if (!success) {
          console.warn('Database update failed for screen configuration, falling back to localStorage')
          this.isDatabaseConnected = false
        }
      }

      // Always update localStorage as backup
      const stored = localStorage.getItem(SCREEN_STORAGE_KEY)
      if (stored) {
        const configurations: ScreenSettings[] = JSON.parse(stored)
        const configIndex = configurations.findIndex(config => config.id === screenId)
        if (configIndex !== -1) {
          configurations[configIndex].enabled = enabled
          localStorage.setItem(SCREEN_STORAGE_KEY, JSON.stringify(configurations))
        }
      }

      console.log(`Screen configuration ${screenId} updated: enabled=${enabled}`)
      return true
    } catch (error) {
      console.error('Failed to update screen configuration:', error)
      return false
    }
  }

  private getDefaultScreenConfigurations(): ScreenSettings[] {
    return [
      { id: 'dashboard', name: 'Dashboard', icon: 'TrendingUp', category: 'main', enabled: true, required: true },
      { id: 'flight-tracking', name: 'Flight Tracking Gantt', icon: 'Calendar', category: 'operations', enabled: true, required: false },
      { id: 'disruption', name: 'Affected Flights', icon: 'AlertTriangle', category: 'operations', enabled: true, required: false },
      { id: 'recovery', name: 'Recovery Options', icon: 'Plane', category: 'operations', enabled: true, required: false },
      { id: 'comparison', name: 'Comparison', icon: 'FileText', category: 'operations', enabled: true, required: false },
      { id: 'detailed', name: 'Recovery Plan', icon: 'Users', category: 'operations', enabled: true, required: false },
      { id: 'prediction-dashboard', name: 'Prediction Dashboard', icon: 'Brain', category: 'prediction', enabled: true, required: false },
      { id: 'flight-disruption-list', name: 'Flight Disruption List', icon: 'Target', category: 'prediction', enabled: true, required: false },
      { id: 'prediction-analytics', name: 'Prediction Analytics', icon: 'Activity', category: 'prediction', enabled: true, required: false },
      { id: 'risk-assessment', name: 'Risk Assessment', icon: 'Shield', category: 'prediction', enabled: true, required: false },
      { id: 'pending', name: 'Pending Solutions', icon: 'ClockIcon', category: 'monitoring', enabled: true, required: false },
      { id: 'passengers', name: 'Passenger Services', icon: 'UserCheck', category: 'services', enabled: true, required: false },
      { id: 'crew-tracking', name: 'Crew Tracking', icon: 'Users2', category: 'services', enabled: true, required: false },
      { id: 'hotac', name: 'HOTAC Management', icon: 'Hotel', category: 'services', enabled: true, required: false },
      { id: 'voucher', name: 'Voucher Management', icon: 'Package', category: 'services', enabled: true, required: false },
      { id: 'flight-rebooking', name: 'Flight Rebooking', icon: 'Plane', category: 'services', enabled: true, required: false },
      { id: 'network-heatmap', name: 'Network Heatmap', icon: 'BarChart3', category: 'analytics', enabled: true, required: false },
      { id: 'fuel-optimization', name: 'Fuel Optimization', icon: 'Fuel', category: 'analytics', enabled: true, required: false },
      { id: 'maintenance', name: 'Aircraft Maintenance', icon: 'Wrench', category: 'analytics', enabled: true, required: false },
      { id: 'past-logs', name: 'Past Recovery Logs', icon: 'FileText', category: 'analytics', enabled: true, required: false },
      { id: 'reports', name: 'Audit & Reporting', icon: 'BarChart', category: 'analytics', enabled: true, required: false },
      { id: 'settings', name: 'Settings', icon: 'Settings', category: 'system', enabled: true, required: true }
    ]
  }
}

// Singleton instance
export const settingsStorage = new SettingsStorage()

// Hook for React components
export const useSettingsStorage = () => {
  return {
    saveSetting: settingsStorage.saveSetting.bind(settingsStorage),
    getSetting: settingsStorage.getSetting.bind(settingsStorage),
    getSettingsByCategory: settingsStorage.getSettingsByCategory.bind(settingsStorage),
    getAllSettings: settingsStorage.getAllSettings.bind(settingsStorage),
    deleteSetting: settingsStorage.deleteSetting.bind(settingsStorage),
    exportSettings: settingsStorage.exportSettings.bind(settingsStorage),
    importSettings: settingsStorage.importSettings.bind(settingsStorage),
    resetToDefaults: settingsStorage.resetToDefaults.bind(settingsStorage),
    getDatabaseStatus: settingsStorage.getDatabaseStatus.bind(settingsStorage),
    retryDatabaseConnection: settingsStorage.retryDatabaseConnection.bind(settingsStorage),
    getAllScreenConfigurations: settingsStorage.getAllScreenConfigurations.bind(settingsStorage),
    updateScreenConfiguration: settingsStorage.updateScreenConfiguration.bind(settingsStorage)
  }
}