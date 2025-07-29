
// Settings storage utility for database operations
export interface SettingsData {
  id: string
  category: string
  key: string
  value: any
  type: 'boolean' | 'number' | 'string' | 'object'
  updatedAt: string
  updatedBy: string
}

// Mock database simulation - in production, replace with actual database calls
class SettingsStorage {
  private storage = new Map<string, SettingsData>()

  // Initialize with default settings
  constructor() {
    this.initializeDefaults()
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

    defaults.forEach(setting => this.saveSetting(setting.category, setting.key, setting.value, setting.type))
  }

  saveSetting(category: string, key: string, value: any, type: SettingsData['type'], userId: string = 'system'): void {
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
    this.storage.set(id, setting)
  }

  getSetting(category: string, key: string): SettingsData | null {
    const id = `${category}_${key}`
    return this.storage.get(id) || null
  }

  getSettingsByCategory(category: string): SettingsData[] {
    return Array.from(this.storage.values()).filter(setting => setting.category === category)
  }

  getAllSettings(): SettingsData[] {
    return Array.from(this.storage.values())
  }

  deleteSetting(category: string, key: string): boolean {
    const id = `${category}_${key}`
    return this.storage.delete(id)
  }

  exportSettings(): string {
    const settings = this.getAllSettings()
    return JSON.stringify(settings, null, 2)
  }

  importSettings(settingsJson: string): boolean {
    try {
      const settings: SettingsData[] = JSON.parse(settingsJson)
      settings.forEach(setting => {
        this.storage.set(setting.id, setting)
      })
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  resetToDefaults(): void {
    this.storage.clear()
    this.initializeDefaults()
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
    resetToDefaults: settingsStorage.resetToDefaults.bind(settingsStorage)
  }
}
