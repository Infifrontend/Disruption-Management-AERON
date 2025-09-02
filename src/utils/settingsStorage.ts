// Settings storage utility with PostgreSQL database integration and localStorage fallback
import { databaseService } from '../services/databaseService';

export interface SettingsData {
  id: string
  category: string
  key: string
  value: any
  type: 'boolean' | 'number' | 'string' | 'object'
  displayLabel?: string
  description?: string
  updatedAt: string
  updatedBy: string
}

export interface SettingsFieldConfig {
  key: string
  displayLabel: string
  description?: string
  type: 'boolean' | 'number' | 'string' | 'slider' | 'select'
  min?: number
  max?: number
  step?: number
  options?: { value: string | number, label: string }[]
  unit?: string
}

// Settings storage with PostgreSQL database and localStorage fallback
class SettingsStorage {
  private storage = new Map<string, SettingsData>()
  private readonly STORAGE_KEY = 'aeron_settings_storage'
  private isDatabaseConnected = false
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly SAVE_DEBOUNCE_MS = 1000 // 1 second debounce

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
    // Check database connectivity
    this.isDatabaseConnected = await databaseService.healthCheck()

    if (this.isDatabaseConnected) {
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
          updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
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
        updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
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

  // Get tab-wise settings
  async getTabSettings(): Promise<any> {
    try {
      if (this.isDatabaseConnected) {
        return await databaseService.getTabSettings()
      } else {
        // Organize local storage settings by tabs in array format
        const allSettings = Array.from(this.storage.values())
        const tabSettings = {
          screens: {},
          passengerPriority: {},
          rules: {},
          recoveryOptions: {},
          nlp: {},
          notifications: {},
          system: {}
        }

        allSettings.forEach(setting => {
          const category = setting.category
          
          // Create setting object with all required fields
          const settingObject = {
            id: setting.id,
            category: setting.category,
            key: setting.key,
            value: setting.value,
            type: setting.type,
            description: setting.description || '',
            created_at: setting.updatedAt,
            updated_at: setting.updatedAt,
            label: this.getDisplayLabel(setting.key),
            updated_by: setting.updatedBy,
            is_active: true
          }

          if (['passengerPrioritization', 'flightPrioritization', 'flightScoring', 'passengerScoring'].includes(category)) {
            if (!tabSettings.passengerPriority[category]) {
              tabSettings.passengerPriority[category] = []
            }
            tabSettings.passengerPriority[category].push(settingObject)
          } else if (['operationalRules', 'recoveryConstraints', 'automationSettings'].includes(category)) {
            if (!tabSettings.rules[category]) {
              tabSettings.rules[category] = []
            }
            tabSettings.rules[category].push(settingObject)
          } else if (['recoveryOptionsRanking', 'aircraftSelectionCriteria', 'crewAssignmentCriteria'].includes(category)) {
            if (!tabSettings.recoveryOptions[category]) {
              tabSettings.recoveryOptions[category] = []
            }
            tabSettings.recoveryOptions[category].push(settingObject)
          } else if (category === 'nlpSettings') {
            if (!tabSettings.nlp.nlpSettings) {
              tabSettings.nlp.nlpSettings = []
            }
            tabSettings.nlp.nlpSettings.push(settingObject)
          } else if (category === 'notificationSettings') {
            if (!tabSettings.notifications.notificationSettings) {
              tabSettings.notifications.notificationSettings = []
            }
            tabSettings.notifications.notificationSettings.push(settingObject)
          }
        })

        return tabSettings
      }
    } catch (error) {
      console.error('Failed to get tab settings:', error)
      return {
        screens: {},
        passengerPriority: {},
        rules: {},
        recoveryOptions: {},
        nlp: {},
        notifications: {},
        system: {}
      }
    }
  }

  private getDisplayLabel(key: string): string {
    const displayLabels = {
      // Passenger Prioritization
      loyaltyTier: "Loyalty Tier Status",
      ticketClass: "Ticket Class (Business/Economy)",
      specialNeeds: "Special Requirements",
      groupSize: "Family/Group Bookings",
      connectionRisk: "Missed Connection Risk",
      
      // Flight Prioritization
      airlinePreference: "Airline Preference (flydubai)",
      onTimePerformance: "On-Time Performance History",
      aircraftType: "Aircraft Type & Amenities",
      departureTime: "Preferred Departure Times",
      connectionBuffer: "Connection Buffer Time",
      
      // Flight Scoring
      baseScore: "Base Score (Starting Point)",
      priorityBonus: "VIP/Premium Passenger Bonus",
      airlineBonus: "flydubai Flight Bonus",
      specialReqBonus: "Special Requirements Bonus",
      loyaltyBonus: "Loyalty Tier Bonus",
      groupBonus: "Group Booking Bonus",
      
      // Passenger Scoring
      vipWeight: "VIP Status Impact",
      loyaltyWeight: "Loyalty Program Tier",
      specialNeedsWeight: "Special Assistance Requirements",
      revenueWeight: "Ticket Revenue/Class Value",
      
      // Operational Rules
      maxDelayThreshold: "Max Delay Threshold",
      minConnectionTime: "Min Connection Time",
      maxOverbooking: "Max Overbooking",
      priorityRebookingTime: "Priority Rebooking Time",
      hotacTriggerDelay: "HOTAC Trigger Delay",
      
      // Recovery Constraints
      maxAircraftSwaps: "Max Aircraft Swaps",
      crewDutyTimeLimits: "Crew Duty Time Limits",
      maintenanceSlotProtection: "Maintenance Slot Protection",
      slotCoordinationRequired: "Slot Coordination Required",
      curfewCompliance: "Curfew Compliance",
      
      // Automation Settings
      autoApproveThreshold: "Auto-Approve Threshold",
      requireManagerApproval: "Require Manager Approval",
      enablePredictiveActions: "Enable Predictive Actions",
      autoNotifyPassengers: "Auto-Notify Passengers",
      autoBookHotac: "Auto-Book HOTAC",
      
      // Recovery Options Ranking
      costWeight: "Cost Impact",
      timeWeight: "Time to Resolution",
      passengerImpactWeight: "Passenger Impact",
      operationalComplexityWeight: "Operational Complexity",
      reputationWeight: "Brand Reputation Impact",
      
      // Aircraft Selection Criteria
      maintenanceStatus: "Maintenance Status",
      fuelEfficiency: "Fuel Efficiency",
      routeSuitability: "Route Suitability",
      passengerCapacity: "Passenger Capacity",
      availabilityWindow: "Availability Window",
      
      // Crew Assignment Criteria
      dutyTimeRemaining: "Duty Time Remaining",
      qualifications: "Qualifications & Certifications",
      baseLocation: "Base Location",
      restRequirements: "Rest Requirements",
      languageSkills: "Language Skills",
      
      // NLP Settings
      enabled: "Enable NLP",
      language: "Primary Language",
      confidence: "Confidence Threshold",
      autoApply: "Auto-Apply Recommendations",
      
      // Notification Settings
      email: "Email Notifications",
      sms: "SMS Alerts",
      push: "Push Notifications",
      desktop: "Desktop Notifications",
      recoveryAlerts: "Recovery Plan Alerts",
      passengerUpdates: "Passenger Service Updates",
      systemAlerts: "System Status Alerts"
    }

    return displayLabels[key] || key
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

  private debouncedSaveToDatabase(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        // Convert the Map to a plain JavaScript object before saving
        const settingsObject: Record<string, any> = {};
        this.storage.forEach((value, key) => {
          settingsObject[key] = value;
        });

        // Since we don't have saveSettings method in the new databaseService,
        // we'll use the individual saveSetting method for each setting
        const settings = Array.from(this.storage.values());
        for (const setting of settings) {
          await databaseService.saveSetting(
            setting.category,
            setting.key,
            setting.value,
            setting.type,
            setting.updatedBy
          );
        }
        console.log('Settings saved to database')
      } catch (error) {
        console.error('Failed to save settings to database:', error)
      }
    }, this.SAVE_DEBOUNCE_MS)
  }

  async saveToDatabase(): Promise<void> {
    this.debouncedSaveToDatabase()
  }

  // Batch save settings for specific categories
  async batchSaveByCategory(category: string, userId: string = 'system'): Promise<boolean> {
    try {
      const categorySettings = Array.from(this.storage.values()).filter(
        setting => setting.category === category
      )

      if (this.isDatabaseConnected) {
        const dbSettings = categorySettings.map(setting => ({
          category: setting.category,
          key: setting.key,
          value: setting.value,
          type: setting.type
        }))

        const success = await databaseService.batchSaveSettings(dbSettings, userId)
        if (!success) {
          console.warn('Database batch save failed')
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Failed to batch save category settings:', error)
      return false
    }
  }

  // Batch save settings for multiple categories
  async batchSaveMultipleCategories(categories: string[], userId: string = 'system'): Promise<boolean> {
    try {
      for (const category of categories) {
        const success = await this.batchSaveByCategory(category, userId)
        if (!success) {
          console.warn(`Failed to save category: ${category}`)
          return false
        }
      }
      return true
    } catch (error) {
      console.error('Failed to batch save multiple categories:', error)
      return false
    }
  }

  // Save settings from state objects directly
  async saveSettingsFromState(stateObject: any, categoryMapping: Record<string, string>, userId: string = 'system'): Promise<boolean> {
    try {
      const settingsToSave = []

      for (const [stateKey, categoryName] of Object.entries(categoryMapping)) {
        const categoryData = stateObject[stateKey]
        if (categoryData && typeof categoryData === 'object') {
          for (const [key, value] of Object.entries(categoryData)) {
            const setting = {
              category: categoryName,
              key: key,
              value: value,
              type: this.getTypeFromValue(value)
            }
            settingsToSave.push(setting)

            // Also update local storage
            const localSetting: SettingsData = {
              id: `${categoryName}_${key}`,
              category: categoryName,
              key: key,
              value: value,
              type: setting.type,
              updatedAt: new Date().toISOString(),
              updatedBy: userId
            }
            this.storage.set(localSetting.id, localSetting)
          }
        }
      }

      if (this.isDatabaseConnected && settingsToSave.length > 0) {
        const success = await databaseService.batchSaveSettings(settingsToSave, userId)
        if (success) {
          this.saveToLocalStorage()
          return true
        }
      }

      return settingsToSave.length > 0
    } catch (error) {
      console.error('Failed to save settings from state:', error)
      return false
    }
  }

  private getTypeFromValue(value: any): SettingsData['type'] {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    return 'object'
  }

  // Get field configurations for dynamic rendering
  getFieldConfigurations(): Record<string, SettingsFieldConfig[]> {
    return {
      operationalRules: [
        {
          key: 'maxDelayThreshold',
          displayLabel: 'Max Delay Threshold',
          description: 'Maximum acceptable delay before triggering recovery actions',
          type: 'slider',
          min: 60,
          max: 360,
          step: 15,
          unit: 'minutes'
        },
        {
          key: 'minConnectionTime',
          displayLabel: 'Min Connection Time',
          description: 'Minimum time required between connecting flights',
          type: 'slider',
          min: 30,
          max: 120,
          step: 5,
          unit: 'minutes'
        },
        {
          key: 'maxOverbooking',
          displayLabel: 'Max Overbooking',
          description: 'Maximum overbooking percentage allowed',
          type: 'slider',
          min: 100,
          max: 120,
          step: 1,
          unit: '%'
        },
        {
          key: 'priorityRebookingTime',
          displayLabel: 'Priority Rebooking Time',
          description: 'Time limit for priority passenger rebooking',
          type: 'slider',
          min: 5,
          max: 60,
          step: 5,
          unit: 'minutes'
        },
        {
          key: 'hotacTriggerDelay',
          displayLabel: 'HOTAC Trigger Delay',
          description: 'Delay threshold for automatic hotel accommodation',
          type: 'slider',
          min: 120,
          max: 480,
          step: 30,
          unit: 'minutes'
        }
      ],
      recoveryConstraints: [
        {
          key: 'maxAircraftSwaps',
          displayLabel: 'Max Aircraft Swaps',
          description: 'Maximum number of aircraft swaps allowed',
          type: 'slider',
          min: 1,
          max: 10,
          step: 1
        },
        {
          key: 'crewDutyTimeLimits',
          displayLabel: 'Crew Duty Time Limits',
          description: 'Enforce regulatory crew duty time limits',
          type: 'boolean'
        },
        {
          key: 'maintenanceSlotProtection',
          displayLabel: 'Maintenance Slot Protection',
          description: 'Protect scheduled maintenance slots',
          type: 'boolean'
        },
        {
          key: 'slotCoordinationRequired',
          displayLabel: 'Slot Coordination Required',
          description: 'Require slot coordination for changes',
          type: 'boolean'
        },
        {
          key: 'curfewCompliance',
          displayLabel: 'Curfew Compliance',
          description: 'Ensure compliance with airport curfews',
          type: 'boolean'
        }
      ],
      automationSettings: [
        {
          key: 'autoApproveThreshold',
          displayLabel: 'Auto-Approve Threshold',
          description: 'Confidence threshold for automatic approval',
          type: 'slider',
          min: 80,
          max: 100,
          step: 1,
          unit: '%'
        },
        {
          key: 'requireManagerApproval',
          displayLabel: 'Require Manager Approval',
          description: 'Require manager approval for recovery actions',
          type: 'boolean'
        },
        {
          key: 'enablePredictiveActions',
          displayLabel: 'Enable Predictive Actions',
          description: 'Enable AI-powered predictive recovery actions',
          type: 'boolean'
        },
        {
          key: 'autoNotifyPassengers',
          displayLabel: 'Auto-Notify Passengers',
          description: 'Automatically notify passengers of changes',
          type: 'boolean'
        },
        {
          key: 'autoBookHotac',
          displayLabel: 'Auto-Book HOTAC',
          description: 'Automatically book hotel accommodation',
          type: 'boolean'
        }
      ],
      passengerPrioritization: [
        {
          key: 'loyaltyTier',
          displayLabel: 'Loyalty Tier Status',
          description: 'Weight for loyalty status (Platinum, Gold, etc.)',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'ticketClass',
          displayLabel: 'Ticket Class (Business/Economy)',
          description: 'Weight for cabin class',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'specialNeeds',
          displayLabel: 'Special Requirements',
          description: 'Weight for special requirements (wheelchair, medical, etc.)',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'groupSize',
          displayLabel: 'Family/Group Bookings',
          description: 'Weight for family/group bookings',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'connectionRisk',
          displayLabel: 'Missed Connection Risk',
          description: 'Weight for missed connection risk',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        }
      ],
      flightPrioritization: [
        {
          key: 'airlinePreference',
          displayLabel: 'Airline Preference (flydubai)',
          description: 'Weight for flydubai vs partner airlines',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'onTimePerformance',
          displayLabel: 'On-Time Performance History',
          description: 'Weight for historical on-time performance',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'aircraftType',
          displayLabel: 'Aircraft Type & Amenities',
          description: 'Weight for aircraft comfort/amenities',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'departureTime',
          displayLabel: 'Preferred Departure Times',
          description: 'Weight for preferred departure times',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'connectionBuffer',
          displayLabel: 'Connection Buffer Time',
          description: 'Weight for adequate connection time',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        }
      ],
      flightScoring: [
        {
          key: 'baseScore',
          displayLabel: 'Base Score (Starting Point)',
          description: 'Starting score for all flights',
          type: 'slider',
          min: 50,
          max: 100,
          step: 1,
          unit: '%'
        },
        {
          key: 'priorityBonus',
          displayLabel: 'VIP/Premium Passenger Bonus',
          description: 'Bonus points for VIP/Premium passengers',
          type: 'slider',
          min: 0,
          max: 20,
          step: 1,
          unit: '%'
        },
        {
          key: 'airlineBonus',
          displayLabel: 'flydubai Flight Bonus',
          description: 'Bonus points for flydubai flights',
          type: 'slider',
          min: 0,
          max: 20,
          step: 1,
          unit: '%'
        },
        {
          key: 'specialReqBonus',
          displayLabel: 'Special Requirements Bonus',
          description: 'Bonus for accommodating special requirements',
          type: 'slider',
          min: 0,
          max: 20,
          step: 1,
          unit: '%'
        },
        {
          key: 'loyaltyBonus',
          displayLabel: 'Loyalty Tier Bonus',
          description: 'Bonus based on loyalty tier',
          type: 'slider',
          min: 0,
          max: 20,
          step: 1,
          unit: '%'
        },
        {
          key: 'groupBonus',
          displayLabel: 'Group Booking Bonus',
          description: 'Bonus for keeping groups together',
          type: 'slider',
          min: 0,
          max: 20,
          step: 1,
          unit: '%'
        }
      ],
      passengerScoring: [
        {
          key: 'vipWeight',
          displayLabel: 'VIP Status Impact',
          description: 'Weight for VIP status impact',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'loyaltyWeight',
          displayLabel: 'Loyalty Program Tier',
          description: 'Weight for loyalty program tier',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'specialNeedsWeight',
          displayLabel: 'Special Assistance Requirements',
          description: 'Weight for special assistance requirements',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'revenueWeight',
          displayLabel: 'Ticket Revenue/Class Value',
          description: 'Weight for ticket revenue/class value',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        }
      ],
      recoveryOptionsRanking: [
        {
          key: 'costWeight',
          displayLabel: 'Cost Impact',
          description: 'Weight for cost considerations',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'timeWeight',
          displayLabel: 'Time to Resolution',
          description: 'Weight for time to resolution',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'passengerImpactWeight',
          displayLabel: 'Passenger Impact',
          description: 'Weight for passenger impact considerations',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'operationalComplexityWeight',
          displayLabel: 'Operational Complexity',
          description: 'Weight for operational complexity',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'reputationWeight',
          displayLabel: 'Brand Reputation Impact',
          description: 'Weight for brand reputation impact',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        }
      ],
      aircraftSelectionCriteria: [
        {
          key: 'maintenanceStatus',
          displayLabel: 'Maintenance Status',
          description: 'Weight for aircraft maintenance status',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'fuelEfficiency',
          displayLabel: 'Fuel Efficiency',
          description: 'Weight for fuel efficiency considerations',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'routeSuitability',
          displayLabel: 'Route Suitability',
          description: 'Weight for route suitability',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'passengerCapacity',
          displayLabel: 'Passenger Capacity',
          description: 'Weight for passenger capacity',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'availabilityWindow',
          displayLabel: 'Availability Window',
          description: 'Weight for availability window',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        }
      ],
      crewAssignmentCriteria: [
        {
          key: 'dutyTimeRemaining',
          displayLabel: 'Duty Time Remaining',
          description: 'Weight for remaining duty time',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'qualifications',
          displayLabel: 'Qualifications & Certifications',
          description: 'Weight for qualifications and certifications',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'baseLocation',
          displayLabel: 'Base Location',
          description: 'Weight for crew base location',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'restRequirements',
          displayLabel: 'Rest Requirements',
          description: 'Weight for rest requirements',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        },
        {
          key: 'languageSkills',
          displayLabel: 'Language Skills',
          description: 'Weight for language skills',
          type: 'slider',
          min: 0,
          max: 50,
          step: 5,
          unit: '%'
        }
      ],
      nlpSettings: [
        {
          key: 'enabled',
          displayLabel: 'Enable NLP',
          description: 'Process natural language inputs',
          type: 'boolean'
        },
        {
          key: 'language',
          displayLabel: 'Primary Language',
          description: 'Primary language for NLP processing',
          type: 'select',
          options: [
            { value: 'english', label: 'English' },
            { value: 'arabic', label: 'العربية (Arabic)' },
            { value: 'hindi', label: 'हिन्दी (Hindi)' },
            { value: 'urdu', label: 'اردو (Urdu)' }
          ]
        },
        {
          key: 'confidence',
          displayLabel: 'Confidence Threshold',
          description: 'Minimum confidence threshold for NLP results',
          type: 'slider',
          min: 50,
          max: 100,
          step: 5,
          unit: '%'
        },
        {
          key: 'autoApply',
          displayLabel: 'Auto-Apply Recommendations',
          description: 'Automatically apply high-confidence results',
          type: 'boolean'
        }
      ],
      notificationSettings: [
        {
          key: 'email',
          displayLabel: 'Email Notifications',
          description: 'Receive notifications via email',
          type: 'boolean'
        },
        {
          key: 'sms',
          displayLabel: 'SMS Alerts',
          description: 'Receive notifications via SMS',
          type: 'boolean'
        },
        {
          key: 'push',
          displayLabel: 'Push Notifications',
          description: 'Receive push notifications',
          type: 'boolean'
        },
        {
          key: 'desktop',
          displayLabel: 'Desktop Notifications',
          description: 'Receive desktop notifications',
          type: 'boolean'
        },
        {
          key: 'recoveryAlerts',
          displayLabel: 'Recovery Plan Alerts',
          description: 'Receive alerts for recovery plan changes',
          type: 'boolean'
        },
        {
          key: 'passengerUpdates',
          displayLabel: 'Passenger Service Updates',
          description: 'Receive passenger service updates',
          type: 'boolean'
        },
        {
          key: 'systemAlerts',
          displayLabel: 'System Status Alerts',
          description: 'Receive system status alerts',
          type: 'boolean'
        }
      ]
    }
  }
}

// Singleton instance
export const settingsStorage = new SettingsStorage()
// Export the singleton instance for direct use
export default settingsStorage

// Hook for React components
export const useSettingsStorage = () => {
  return {
    saveSetting: settingsStorage.saveSetting.bind(settingsStorage),
    getSetting: settingsStorage.getSetting.bind(settingsStorage),
    getSettingsByCategory: settingsStorage.getSettingsByCategory.bind(settingsStorage),
    getAllSettings: settingsStorage.getAllSettings.bind(settingsStorage),
    getTabSettings: settingsStorage.getTabSettings.bind(settingsStorage),
    deleteSetting: settingsStorage.deleteSetting.bind(settingsStorage),
    exportSettings: settingsStorage.exportSettings.bind(settingsStorage),
    importSettings: settingsStorage.importSettings.bind(settingsStorage),
    resetToDefaults: settingsStorage.resetToDefaults.bind(settingsStorage),
    getDatabaseStatus: settingsStorage.getDatabaseStatus.bind(settingsStorage),
    retryDatabaseConnection: settingsStorage.retryDatabaseConnection.bind(settingsStorage),
    batchSaveByCategory: settingsStorage.batchSaveByCategory.bind(settingsStorage),
    batchSaveMultipleCategories: settingsStorage.batchSaveMultipleCategories.bind(settingsStorage),
    saveSettingsFromState: settingsStorage.saveSettingsFromState.bind(settingsStorage),
    getFieldConfigurations: settingsStorage.getFieldConfigurations.bind(settingsStorage)
  }
}