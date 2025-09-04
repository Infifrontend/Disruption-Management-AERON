// Settings storage utility with PostgreSQL database integration and localStorage fallback
import { databaseService } from "../services/databaseService";

export interface SettingsData {
  id: string;
  category: string;
  key: string;
  value: any;
  type: "boolean" | "number" | "string" | "object";
  displayLabel?: string;
  description?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SettingsFieldConfig {
  key: string;
  displayLabel: string;
  description?: string;
  type: "boolean" | "number" | "string" | "slider" | "select" | "toggle";
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  unit?: string;
  defaultValue?: any;
}

// Settings storage with PostgreSQL database and localStorage fallback
class SettingsStorage {
  private storage = new Map<string, SettingsData>();
  private readonly STORAGE_KEY = "aeron_settings_storage";
  private isDatabaseConnected = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly SAVE_DEBOUNCE_MS = 1000; // 1 second debounce
  private baseUrl = ""; // Assuming baseUrl is set elsewhere, e.g., in an environment config
  private storageKey = "settings_tabs_cache";

  // Initialize with database connection check and defaults
  constructor() {
    // Initialize synchronously first with defaults
    this.loadFromLocalStorage();
    this.initializeDefaults();
    this.saveToLocalStorage();

    // Then try to connect to database asynchronously
    this.initializeStorage();
  }

  private async initializeStorage() {
    // Check database connectivity
    this.isDatabaseConnected = await databaseService.healthCheck();

    if (this.isDatabaseConnected) {
      await this.loadFromDatabase();
    } else {
      console.log("⚠️ Database unavailable - Using localStorage fallback");
      this.loadFromLocalStorage();
      this.initializeDefaults();
      this.saveToLocalStorage();
    }
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const settings = await databaseService.getAllSettings();
      console.log(`Loaded ${settings.length} settings from database`);

      this.storage.clear();
      settings.forEach((setting) => {
        this.storage.set(setting.id, setting);
      });
    } catch (error) {
      console.error("Failed to load settings from database:", error);
      console.log("Falling back to localStorage");
      this.isDatabaseConnected = false;
      this.loadFromLocalStorage();
      this.initializeDefaults();
    }
  }

  private initializeDefaults() {
    const defaults: Omit<SettingsData, "id" | "updatedAt" | "updatedBy">[] = [
      // Rule Configuration defaults
      {
        category: "operationalRules",
        key: "maxDelayThreshold",
        value: 180,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "minConnectionTime",
        value: 45,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "maxOverbooking",
        value: 105,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "priorityRebookingTime",
        value: 15,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "hotacTriggerDelay",
        value: 240,
        type: "number",
      },

      // Recovery Constraints defaults
      {
        category: "recoveryConstraints",
        key: "maxAircraftSwaps",
        value: 3,
        type: "number",
      },
      {
        category: "recoveryConstraints",
        key: "crewDutyTimeLimits",
        value: true,
        type: "boolean",
      },
      {
        category: "recoveryConstraints",
        key: "maintenanceSlotProtection",
        value: true,
        type: "boolean",
      },
      {
        category: "recoveryConstraints",
        key: "slotCoordinationRequired",
        value: false,
        type: "boolean",
      },
      {
        category: "recoveryConstraints",
        key: "curfewCompliance",
        value: true,
        type: "boolean",
      },

      // Automation Settings defaults
      {
        category: "automationSettings",
        key: "autoApproveThreshold",
        value: 95,
        type: "number",
      },
      {
        category: "automationSettings",
        key: "requireManagerApproval",
        value: false,
        type: "boolean",
      },
      {
        category: "automationSettings",
        key: "enablePredictiveActions",
        value: true,
        type: "boolean",
      },
      {
        category: "automationSettings",
        key: "autoNotifyPassengers",
        value: true,
        type: "boolean",
      },
      {
        category: "automationSettings",
        key: "autoBookHotac",
        value: false,
        type: "boolean",
      },

      // Passenger Priority defaults
      {
        category: "passengerPrioritization",
        key: "loyaltyTier",
        value: 25,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "ticketClass",
        value: 20,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "specialNeeds",
        value: 30,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "groupSize",
        value: 15,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "connectionRisk",
        value: 10,
        type: "number",
      },

      // Recovery Options Ranking defaults
      {
        category: "recoveryOptionsRanking",
        key: "costWeight",
        value: 30,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "timeWeight",
        value: 25,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "passengerImpactWeight",
        value: 20,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "operationalComplexityWeight",
        value: 15,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "reputationWeight",
        value: 10,
        type: "number",
      },

      // Aircraft Selection Criteria defaults
      {
        category: "aircraftSelectionCriteria",
        key: "maintenanceStatus",
        value: 25,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "fuelEfficiency",
        value: 20,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "routeSuitability",
        value: 20,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "passengerCapacity",
        value: 15,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "availabilityWindow",
        value: 20,
        type: "number",
      },

      // Crew Assignment Criteria defaults
      {
        category: "crewAssignmentCriteria",
        key: "dutyTimeRemaining",
        value: 30,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "qualifications",
        value: 25,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "baseLocation",
        value: 20,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "restRequirements",
        value: 15,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "languageSkills",
        value: 10,
        type: "number",
      },

      // Flight Prioritization defaults
      {
        category: "flightPrioritization",
        key: "airlinePreference",
        value: 20,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "onTimePerformance",
        value: 25,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "aircraftType",
        value: 15,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "departureTime",
        value: 20,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "connectionBuffer",
        value: 20,
        type: "number",
      },

      // Flight Scoring defaults
      {
        category: "flightScoring",
        key: "baseScore",
        value: 70,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "priorityBonus",
        value: 15,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "airlineBonus",
        value: 10,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "specialReqBonus",
        value: 8,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "loyaltyBonus",
        value: 8,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "groupBonus",
        value: 5,
        type: "number",
      },

      // Passenger Scoring defaults
      {
        category: "passengerScoring",
        key: "vipWeight",
        value: 40,
        type: "number",
      },
      {
        category: "passengerScoring",
        key: "loyaltyWeight",
        value: 25,
        type: "number",
      },
      {
        category: "passengerScoring",
        key: "specialNeedsWeight",
        value: 20,
        type: "number",
      },
      {
        category: "passengerScoring",
        key: "revenueWeight",
        value: 15,
        type: "number",
      },

      // NLP Settings defaults
      { category: "nlpSettings", key: "enabled", value: true, type: "boolean" },
      {
        category: "nlpSettings",
        key: "language",
        value: "english",
        type: "string",
      },
      { category: "nlpSettings", key: "confidence", value: 85, type: "number" },
      {
        category: "nlpSettings",
        key: "autoApply",
        value: false,
        type: "boolean",
      },
      // Document Repository defaults
      {
        category: "nlpSettings",
        key: "documentRepository",
        value: { documents: [] },
        type: "object",
      },

      // Notification Settings defaults
      {
        category: "notificationSettings",
        key: "email",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "sms",
        value: false,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "push",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "desktop",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "recoveryAlerts",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "passengerUpdates",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "systemAlerts",
        value: false,
        type: "boolean",
      },
    ];

    defaults.forEach((setting) => {
      const id = `${setting.category}_${setting.key}`;
      if (!this.storage.has(id)) {
        const settingData: SettingsData = {
          id,
          category: setting.category,
          key: setting.key,
          value: setting.value,
          type: setting.type,
          updatedAt: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
          updatedBy: "system",
        };
        this.storage.set(id, settingData);
      }
    });
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data: SettingsData[] = JSON.parse(stored);
        data.forEach((setting) => {
          this.storage.set(setting.id, setting);
        });
      }
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
    }
  }

  private saveToLocalStorage(settings?: SettingsData[]): void {
    try {
      const settingsToSave = settings || Array.from(this.storage.values());
      const serialized = JSON.stringify(settingsToSave);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      console.log(`Saved ${settingsToSave.length} settings to localStorage`);
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
      throw error;
    }
  }

  async saveSetting(
    category: string,
    key: string,
    value: any,
    type: SettingsData["type"],
    userId: string = "system",
  ): Promise<void> {
    try {
      const id = `${category}_${key}`;
      const setting: SettingsData = {
        id,
        category,
        key,
        value,
        type,
        updatedAt: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        updatedBy: userId,
      };

      console.log("Saving setting:", setting);

      // Try to save to database first
      if (this.isDatabaseConnected) {
        const success = await databaseService.saveSetting(
          category,
          key,
          value,
          type,
          userId,
        );
        if (!success) {
          console.warn("Database save failed, falling back to localStorage");
          this.isDatabaseConnected = false;
        }
      }

      // Always update local storage and memory
      this.storage.set(id, setting);
      this.saveToLocalStorage();

      console.log("Setting saved successfully:", id);
    } catch (error) {
      console.error(
        "Failed to save setting:",
        { category, key, value, type },
        error,
      );
      throw error;
    }
  }

  async getSetting(
    category: string,
    key: string,
  ): Promise<SettingsData | null> {
    const id = `${category}_${key}`;

    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const setting = await databaseService.getSetting(category, key);
        if (setting) {
          this.storage.set(id, setting);
          return setting;
        }
      } catch (error) {
        console.warn("Database read failed, using local storage");
      }
    }

    return this.storage.get(id) || null;
  }

  async getSettingsByCategory(category: string): Promise<SettingsData[]> {
    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const settings = await databaseService.getSettingsByCategory(category);
        if (settings.length > 0) {
          settings.forEach((setting) => {
            this.storage.set(setting.id, setting);
          });
          return settings;
        }
      } catch (error) {
        console.warn("Database read failed, using local storage");
      }
    }

    return Array.from(this.storage.values()).filter(
      (setting) => setting.category === category,
    );
  }

  async getAllSettings(): Promise<SettingsData[]> {
    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const settings = await databaseService.getAllSettings();
        if (settings.length > 0) {
          settings.forEach((setting) => {
            this.storage.set(setting.id, setting);
          });
          return settings;
        }
      } catch (error) {
        console.warn("Database read failed, using local storage");
      }
    }

    return Array.from(this.storage.values());
  }

  // Get tab-wise settings
  async getTabSettings(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/settings/tabs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tabSettings = await response.json();
      console.log("Loaded tab-wise settings:", tabSettings);

      // Store in localStorage for offline access
      localStorage.setItem(this.storageKey, JSON.stringify(tabSettings));
      console.log(
        `Saved ${Object.keys(tabSettings).length} tab categories to localStorage`,
      );

      return tabSettings;
    } catch (error) {
      console.error("Failed to load tab-wise settings:", error);

      // Try to load from localStorage as fallback
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        console.log("Using cached tab settings from localStorage");
        return JSON.parse(cached);
      }

      return this.getDefaultTabSettings();
    }
  }

  async deleteSetting(category: string, key: string): Promise<boolean> {
    const id = `${category}_${key}`;

    // Try database first if connected
    if (this.isDatabaseConnected) {
      try {
        const success = await databaseService.deleteSetting(category, key);
        if (!success) {
          console.warn("Database delete failed");
        }
      } catch (error) {
        console.warn("Database delete failed:", error);
      }
    }

    const result = this.storage.delete(id);
    if (result) {
      this.saveToLocalStorage();
    }
    return result;
  }

  async exportSettings(): Promise<string> {
    const settings = await this.getAllSettings();
    return JSON.stringify(settings, null, 2);
  }

  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const settings: SettingsData[] = JSON.parse(settingsJson);

      if (this.isDatabaseConnected) {
        return await databaseService.importSettings(settingsJson);
      } else {
        settings.forEach((setting) => {
          this.storage.set(setting.id, setting);
        });
        this.saveToLocalStorage();
        return true;
      }
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  }

  async resetToDefaults(): Promise<void> {
    if (this.isDatabaseConnected) {
      try {
        await databaseService.resetToDefaults();
        await this.loadFromDatabase();
        return;
      } catch (error) {
        console.warn("Database reset failed, using local reset");
      }
    }

    this.storage.clear();
    this.initializeDefaults();
    this.saveToLocalStorage();
  }

  // Get database connection status
  getDatabaseStatus(): boolean {
    return this.isDatabaseConnected;
  }

  // Retry database connection
  async retryDatabaseConnection(): Promise<boolean> {
    this.isDatabaseConnected = await databaseService.healthCheck();
    if (this.isDatabaseConnected) {
      await this.loadFromDatabase();
    }
    return this.isDatabaseConnected;
  }

  private debouncedSaveToDatabase(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
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
            setting.updatedBy,
          );
        }
        console.log("Settings saved to database");
      } catch (error) {
        console.error("Failed to save settings to database:", error);
      }
    }, this.SAVE_DEBOUNCE_MS);
  }

  async saveToDatabase(): Promise<void> {
    this.debouncedSaveToDatabase();
  }

  // Batch save settings for specific categories
  async batchSaveByCategory(
    category: string,
    userId: string = "system",
  ): Promise<boolean> {
    try {
      const categorySettings = Array.from(this.storage.values()).filter(
        (setting) => setting.category === category,
      );

      if (this.isDatabaseConnected) {
        const dbSettings = categorySettings.map((setting) => ({
          category: setting.category,
          key: setting.key,
          value: setting.value,
          type: setting.type,
        }));

        const success = await databaseService.batchSaveSettings(
          dbSettings,
          userId,
        );
        if (!success) {
          console.warn("Database batch save failed");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to batch save category settings:", error);
      return false;
    }
  }

  // Batch save settings for multiple categories
  async batchSaveMultipleCategories(
    categories: string[],
    userId: string = "system",
  ): Promise<boolean> {
    try {
      for (const category of categories) {
        const success = await this.batchSaveByCategory(category, userId);
        if (!success) {
          console.warn(`Failed to save category: ${category}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to batch save multiple categories:", error);
      return false;
    }
  }

  // Save settings from state objects directly
  async saveSettingsFromState(
    stateObject: Record<string, any>,
    categoryMapping: Record<string, string>,
    userId: string = "system"
  ): Promise<boolean> {
    try {
      const settingsToSave: Array<{
        category: string;
        key: string;
        value: any;
        type: SettingsData["type"];
      }> = [];

      Object.entries(stateObject).forEach(([stateKey, stateValue]) => {
        const category = categoryMapping[stateKey];
        if (category && stateValue && typeof stateValue === 'object') {
          // Special handling for document repository
          if (stateKey === 'documentRepository') {
            // Save document repository as a single object setting
            settingsToSave.push({
              category,
              key: 'data',
              value: stateValue,
              type: "object",
            });

            // Also batch save the actual documents to the document repository table
            if (stateValue.documents && Array.isArray(stateValue.documents)) {
              databaseService.batchSaveDocuments(stateValue.documents, userId).catch(error => {
                console.error('Failed to save documents to repository:', error);
              });
            }
          } else {
            Object.entries(stateValue).forEach(([key, value]) => {
              let type: SettingsData["type"] = "string";

              if (typeof value === "boolean") {
                type = "boolean";
              } else if (typeof value === "number") {
                type = "number";
              } else if (typeof value === "object") {
                type = "object";
              }

              settingsToSave.push({
                category,
                key,
                value,
                type,
              });
            });
          }
        }
      });

      if (settingsToSave.length > 0) {
        const success = await databaseService.batchSaveSettings(settingsToSave, userId);
        if (success) {
          console.log(`Successfully saved ${settingsToSave.length} settings to database`);
          // Update localStorage cache
          this.saveToLocalStorage(settingsToSave);
        }
        return success;
      }

      return true;
    } catch (error) {
      console.error('Failed to save settings from state:', error);
      return false;
    }
  }

  private getTypeFromValue(value: any): SettingsData["type"] {
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") return "string";
    return "object";
  }

  // Get field configurations for dynamic rendering
  getFieldConfigurations(): Record<string, SettingsFieldConfig[]> {
    return {
      operationalRules: [
        {
          key: "maxDelayThreshold",
          displayLabel: "Max Delay Threshold",
          description:
            "Maximum acceptable delay before triggering recovery (minutes)",
          type: "slider",
          min: 30,
          max: 180,
          step: 15,
          unit: "min",
          defaultValue: 90,
        },
        {
          key: "autoRecoveryEnabled",
          displayLabel: "Auto Recovery",
          description: "Enable automatic recovery for low-impact disruptions",
          type: "toggle",
          defaultValue: true,
        },
        {
          key: "passengerNotificationDelay",
          displayLabel: "Passenger Notification Delay",
          description: "Delay before sending passenger notifications (minutes)",
          type: "slider",
          min: 0,
          max: 60,
          step: 5,
          unit: "min",
          defaultValue: 15,
        },
      ],
      recoveryConstraints: [
        {
          key: "maxCrewDutyTime",
          displayLabel: "Maximum Crew Duty Time",
          description:
            "Maximum allowed crew duty time for recovery flights (hours)",
          type: "slider",
          min: 8,
          max: 16,
          step: 1,
          unit: "hrs",
          defaultValue: 12,
        },
        {
          key: "requireSameAircraftType",
          displayLabel: "Require Same Aircraft Type",
          description: "Require same aircraft type for passenger transfers",
          type: "toggle",
          defaultValue: false,
        },
        {
          key: "maxAircraftChanges",
          displayLabel: "Maximum Aircraft Changes",
          description:
            "Maximum number of aircraft changes allowed per recovery",
          type: "slider",
          min: 1,
          max: 5,
          step: 1,
          defaultValue: 2,
        },
      ],
      automationSettings: [
        {
          key: "autoApprovalThreshold",
          displayLabel: "Auto Approval Threshold",
          description: "Cost threshold for automatic approval (AED)",
          type: "number",
          min: 0,
          max: 100000,
          step: 1000,
          unit: "AED",
          defaultValue: 25000,
        },
        {
          key: "requireManagerApproval",
          displayLabel: "Require Manager Approval",
          description: "Require manager approval for high-cost recoveries",
          type: "toggle",
          defaultValue: true,
        },
        {
          key: "autoExecuteRecovery",
          displayLabel: "Auto Execute Recovery",
          description: "Automatically execute approved recovery plans",
          type: "toggle",
          defaultValue: false,
        },
      ],
    };
  }

  // Placeholder for default tab settings if API fails and no cache is available
  private getDefaultTabSettings(): Record<
    string,
    Record<string, SettingsData[]>
  > {
    return {
      screens: {},
      passengerPriority: {},
      rules: {},
      recoveryOptions: {},
      nlp: {},
      notifications: {},
      system: {},
    };
  }
}

// Singleton instance
export const settingsStorage = new SettingsStorage();
// Export the singleton instance for direct use
export default settingsStorage;

// Hook for React components
export const useSettingsStorage = () => {
  return {
    saveSetting: settingsStorage.saveSetting.bind(settingsStorage),
    getSetting: settingsStorage.getSetting.bind(settingsStorage),
    getSettingsByCategory:
      settingsStorage.getSettingsByCategory.bind(settingsStorage),
    getAllSettings: settingsStorage.getAllSettings.bind(settingsStorage),
    getTabSettings: settingsStorage.getTabSettings.bind(settingsStorage),
    deleteSetting: settingsStorage.deleteSetting.bind(settingsStorage),
    exportSettings: settingsStorage.exportSettings.bind(settingsStorage),
    importSettings: settingsStorage.importSettings.bind(settingsStorage),
    resetToDefaults: settingsStorage.resetToDefaults.bind(settingsStorage),
    getDatabaseStatus: settingsStorage.getDatabaseStatus.bind(settingsStorage),
    retryDatabaseConnection:
      settingsStorage.retryDatabaseConnection.bind(settingsStorage),
    batchSaveByCategory:
      settingsStorage.batchSaveByCategory.bind(settingsStorage),
    batchSaveMultipleCategories:
      settingsStorage.batchSaveMultipleCategories.bind(settingsStorage),
    saveSettingsFromState:
      settingsStorage.saveSettingsFromState.bind(settingsStorage),
    getFieldConfigurations:
      settingsStorage.getFieldConfigurations.bind(settingsStorage),
  };
};