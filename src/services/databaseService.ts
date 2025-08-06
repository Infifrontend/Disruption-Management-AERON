// Database service for PostgreSQL operations
import { SettingsData } from "../utils/settingsStorage";

export interface CustomRule {
  id: number;
  rule_id: string;
  name: string;
  description: string;
  category: string;
  type: "Hard" | "Soft";
  priority: number;
  overridable: boolean;
  conditions?: string;
  actions?: string;
  status: "Active" | "Inactive" | "Draft";
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
}

export interface CustomParameter {
  id: number;
  parameter_id: string;
  name: string;
  category: string;
  weight: number;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface FlightDisruption {
  id: string;
  flightNumber: string;
  route: string;
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  aircraft: string;
  scheduledDeparture: string;
  estimatedDeparture: string;
  delay: number;
  passengers: number;
  crew: number;
  connectionFlights: number;
  severity: string;
  type: string;
  status: string;
  disruptionReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryOption {
  id: string;
  disruptionId: string;
  title: string;
  description: string;
  cost: string;
  timeline: string;
  confidence: number;
  impact: string;
  status: string;
  createdAt: string;
  details: any;
}

export interface PassengerData {
  id: string;
  name: string;
  pnr: string;
  flightNumber: string;
  seatNumber?: string;
  ticketClass: string;
  loyaltyTier: string;
  specialNeeds?: string;
  contactInfo: any;
  rebookingStatus?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  qualifications: string[];
  dutyTimeRemaining: number;
  baseLocation: string;
  status: string;
  contactInfo: any;
}

export interface Aircraft {
  id: string;
  registration: string;
  type: string;
  status: string;
  location: string;
  maintenanceStatus: string;
  fuelLevel: number;
  nextMaintenance: string;
}

export interface HotelBooking {
  id: string;
  disruptionId: string;
  passengerPnr: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  cost: number;
  status: string;
  createdAt: string;
}

class DatabaseService {
  private baseUrl: string;
  private healthCheckCache: { status: boolean; timestamp: number } | null =
    null;
  private readonly HEALTH_CHECK_CACHE_DURATION = 120000; // 2 minutes instead of 30 seconds
  private isHealthChecking = false;

  // Circuit breaker implementation
  private circuitBreakerOpen = false;
  private circuitBreakerTimeout: NodeJS.Timeout | null = null;
  private failureCount = 0;
  private readonly MAX_FAILURES = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

  constructor() {
    // Use API base URL for database operations
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname === "localhost") {
      this.baseUrl = "http://localhost:3001/api";
    } else {
      // For Replit production, use relative path to avoid CORS issues
      // The proxy should handle routing to the correct API server
      this.baseUrl = "/api";
    }
    console.log("Database service initialized with baseUrl:", this.baseUrl);
  }

  private checkCircuitBreaker(): boolean {
    if (this.circuitBreakerOpen) {
      console.log("Circuit breaker is open, skipping database call");
      return false;
    }
    return true;
  }

  private onDatabaseSuccess() {
    this.failureCount = 0;
    if (this.circuitBreakerOpen) {
      console.log("Circuit breaker closed - database connection restored");
      this.circuitBreakerOpen = false;
      if (this.circuitBreakerTimeout) {
        clearTimeout(this.circuitBreakerTimeout);
        this.circuitBreakerTimeout = null;
      }
    }
  }

  private onDatabaseFailure() {
    this.failureCount++;
    if (this.failureCount >= this.MAX_FAILURES && !this.circuitBreakerOpen) {
      console.log("Circuit breaker opened due to multiple failures");
      this.circuitBreakerOpen = true;
      this.circuitBreakerTimeout = setTimeout(() => {
        console.log("Circuit breaker half-open - attempting to reconnect");
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
      }, this.CIRCUIT_BREAKER_TIMEOUT);
    }
  }

  private isCacheValid(): boolean {
    if (!this.healthCheckCache) return false;
    return (
      Date.now() - this.healthCheckCache.timestamp <
      this.HEALTH_CHECK_CACHE_DURATION
    );
  }

  // Settings operations
  async getAllSettings(): Promise<SettingsData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Transform database format to SettingsData format
      return data.map((setting: any) => ({
        id: `${setting.category}_${setting.key}`,
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type as SettingsData["type"],
        updatedAt: setting.updated_at,
        updatedBy: setting.updated_by,
      }));
    } catch (error) {
      console.error("Failed to fetch settings from database:", error);
      // Return empty array as fallback
      return [];
    }
  }

  async getSetting(
    category: string,
    key: string,
  ): Promise<SettingsData | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/settings/${category}/${key}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const setting = await response.json();

      return {
        id: `${setting.category}_${setting.key}`,
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type as SettingsData["type"],
        updatedAt: setting.updated_at,
        updatedBy: setting.updated_by,
      };
    } catch (error) {
      console.error(`Failed to fetch setting ${category}.${key}:`, error);
      return null;
    }
  }

  async getSettingsByCategory(category: string): Promise<SettingsData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/settings/category/${category}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      return data.map((setting: any) => ({
        id: `${setting.category}_${setting.key}`,
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type as SettingsData["type"],
        updatedAt: setting.updated_at,
        updatedBy: setting.updated_by,
      }));
    } catch (error) {
      console.error(
        `Failed to fetch settings for category ${category}:`,
        error,
      );
      return [];
    }
  }

  async saveSetting(
    category: string,
    key: string,
    value: any,
    type: SettingsData["type"],
    userId: string = "system",
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          key,
          value,
          type,
          updated_by: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Successfully saved setting ${category}.${key} to database`);
      return true;
    } catch (error) {
      console.error(`Failed to save setting ${category}.${key}:`, error);
      return false;
    }
  }

  async deleteSetting(category: string, key: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/settings/${category}/${key}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete setting ${category}.${key}:`, error);
      return false;
    }
  }

  // Custom Rules operations
  async getAllCustomRules(): Promise<CustomRule[]> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch custom rules:", error);
      return [];
    }
  }

  async saveCustomRule(
    rule: Omit<CustomRule, "id" | "created_at" | "updated_at">,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to save custom rule:", error);
      return false;
    }
  }

  async updateCustomRule(
    ruleId: string,
    updates: Partial<CustomRule>,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules/${ruleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to update custom rule ${ruleId}:`, error);
      return false;
    }
  }

  async deleteCustomRule(ruleId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-rules/${ruleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete custom rule ${ruleId}:`, error);
      return false;
    }
  }

  // Custom Parameters operations
  async getAllCustomParameters(): Promise<CustomParameter[]> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-parameters`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch custom parameters:", error);
      return [];
    }
  }

  async saveCustomParameter(
    parameter: Omit<CustomParameter, "id" | "created_at">,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/custom-parameters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameter),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to save custom parameter:", error);
      return false;
    }
  }

  async deleteCustomParameter(parameterId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/custom-parameters/${parameterId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete custom parameter ${parameterId}:`, error);
      return false;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    // Return cached result if valid
    if (this.isCacheValid()) {
      return this.healthCheckCache!.status;
    }

    // Prevent concurrent health checks
    if (this.isHealthChecking) {
      return this.healthCheckCache?.status || false;
    }

    this.isHealthChecking = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Further reduced timeout

      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok and has expected content
      let isHealthy = false;
      if (response.ok) {
        try {
          const data = await response.json();
          isHealthy = data.status === 'healthy' || response.status === 200;
        } catch (jsonError) {
          // If JSON parsing fails but response is ok, consider it healthy
          isHealthy = true;
        }
      }

      // Cache the result
      this.healthCheckCache = {
        status: isHealthy,
        timestamp: Date.now(),
      };

      if (isHealthy) {
        this.onDatabaseSuccess();
      } else {
        console.warn(`Health check failed: ${response.status} ${response.statusText}`);
        this.onDatabaseFailure();
      }

      return isHealthy;
    } catch (error) {
      console.warn("Health check failed:", error.message || "Unknown error");
      this.onDatabaseFailure();

      // Cache the failure result with shorter duration
      this.healthCheckCache = {
        status: false,
        timestamp: Date.now() - (this.HEALTH_CHECK_CACHE_DURATION - 15000), // Cache for only 5s on failure
      };
      return false;
    } finally {
      this.isHealthChecking = false;
    }
  }

  // Utility methods
  async resetToDefaults(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/settings/reset`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to reset settings to defaults:", error);
      return false;
    }
  }

  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getAllSettings();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error("Failed to export settings:", error);
      return "[]";
    }
  }

  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const settings: SettingsData[] = JSON.parse(settingsJson);

      for (const setting of settings) {
        await this.saveSetting(
          setting.category,
          setting.key,
          setting.value,
          setting.type,
          setting.updatedBy,
        );
      }

      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  }

  // Flight Disruptions
  async getAllDisruptions(): Promise<FlightDisruption[]> {
    try {
      console.log('Fetching disruptions from:', `${this.baseUrl}/disruptions`)

      // Check if API server is available first
      const healthCheck = await this.checkApiHealth()
      if (!healthCheck) {
        console.warn('API server not available, returning empty array')
        return []
      }

      const response = await fetch(`${this.baseUrl}/disruptions`)

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`)
        return []
      }

      const data = await response.json()
      console.log('Fetched disruptions:', data)

      // Transform database format to component format
        const transformedFlights = data.map((flight) => {
          // Handle unknown IDs by using flight_number as display value
          const isUnknownId = flight.id && typeof flight.id === 'string' && flight.id.startsWith('UNKNOWN-');
          const displayFlightNumber = isUnknownId 
            ? (flight.flight_number || '-')
            : flight.flight_number;

          return {
            id: flight.id,
            flightNumber: displayFlightNumber,
            route: flight.route,
            origin: flight.origin,
            destination: flight.destination,
            originCity: flight.origin_city,
            destinationCity: flight.destination_city,
            aircraft: flight.aircraft,
            scheduledDeparture: flight.scheduled_departure,
            estimatedDeparture: flight.estimated_departure,
            delay: flight.delay_minutes || 0,
            passengers: flight.passengers || 0,
            crew: flight.crew || 0,
            connectionFlights: flight.connection_flights || 0,
            severity: flight.severity || "Medium",
            type: flight.disruption_type || "Unknown",
            status: isUnknownId && !flight.flight_number ? "Unknown" : flight.status,
            disruptionReason: flight.disruption_reason,
            categorization: flight.categorization || "Uncategorized",
            createdAt: flight.created_at,
            updatedAt: flight.updated_at,
          };
        });

      return Array.isArray(transformedFlights) ? transformedFlights : []
    } catch (error) {
      console.error('Failed to fetch disruptions:', error)
      return []
    }
  }

  async getDisruption(id: string): Promise<FlightDisruption | null> {
    try {
      const response = await fetch(`${this.baseUrl}/disruptions/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch disruption ${id}:`, error);
      return null;
    }
  }

  async saveDisruption(
    disruption: Omit<FlightDisruption, "id" | "createdAt" | "updatedAt"> & {
      crewMembers?: any[];
    },
  ): Promise<boolean> {
    try {
      console.log("Saving disruption to database:", disruption);

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
        disruption_reason: disruption.disruptionReason,
        categorization: disruption.categorization,
        crew_members: disruption.crewMembers || [],
      };

      console.log("Transformed data for database:", dbData);

      const response = await fetch(`${this.baseUrl}/disruptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Successfully saved disruption:", result);
      return true;
    } catch (error) {
      console.error("Failed to save disruption:", error);
      return false;
    }
  }

  // Crew Members specific operations
  async saveCrewMember(crewMember: Omit<CrewMember, "id">): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/crew-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crewMember),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to save crew member:", error);
      return false;
    }
  }

  async getCrewMember(employeeId: string): Promise<CrewMember | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crew-members/${employeeId}`,
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch crew member ${employeeId}:`, error);
      return null;
    }
  }

  async updateCrewMemberStatus(
    employeeId: string,
    status: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crew-members/${employeeId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      return response.ok;
    } catch (error) {
      console.error("Failed to update crew member status:", error);
      return false;
    }
  }

  // Crew Disruption Mapping operations
  async getCrewDisruptionMapping(disruptionId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crew-disruption-mapping/${disruptionId}`,
      );
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch crew disruption mapping:", error);
      return [];
    }
  }

  async saveCrewDisruptionMapping(mapping: {
    disruption_id: string;
    crew_member_id: string;
    disruption_reason?: string;
    resolution_status?: string;
    replacement_crew_id?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/crew-disruption-mapping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapping),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to save crew disruption mapping:", error);
      return false;
    }
  }

  // Recovery Options
  async getRecoveryOptions(disruptionId: string): Promise<RecoveryOption[]> {
    try {
      console.log(`Fetching recovery options for disruption ${disruptionId}`);
      const response = await fetch(
        `${this.baseUrl}/recovery-options/${disruptionId}`,
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.log(
            `No recovery options found for disruption ${disruptionId}`,
          );
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const options = await response.json();
      console.log(
        `Found ${options.length} recovery options for disruption ${disruptionId}`,
      );
      return options;
    } catch (error) {
      console.error("Error fetching recovery options:", error);
      return [];
    }
  }

  // Detailed Recovery Options with Categorization
  async getDetailedRecoveryOptions(disruptionId: string): Promise<any[]> {
    try {
      console.log(`Fetching detailed recovery options for disruption ${disruptionId}`);
      
      // Check circuit breaker
      if (!this.checkCircuitBreaker()) {
        console.log('Circuit breaker open, returning empty array');
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/recovery-options-detailed/${disruptionId}`,
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No detailed recovery options found for disruption ${disruptionId}`);
          this.onDatabaseSuccess(); // 404 is not a failure
          return [];
        }
        console.error(`HTTP error! status: ${response.status}`);
        this.onDatabaseFailure();
        return [];
      }
      
      const options = await response.json();
      console.log(`Found ${options.length} detailed recovery options for disruption ${disruptionId}`);
      this.onDatabaseSuccess();
      return Array.isArray(options) ? options : [];
    } catch (error) {
      console.error("Error fetching detailed recovery options:", error);
      this.onDatabaseFailure();
      return [];
    }
  }

  async getDisruptionCategories(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/disruption-categories`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching disruption categories:", error);
      return [];
    }
  }

  async getRecoveryOptionTemplates(categoryId?: string): Promise<any[]> {
    try {
      const url = categoryId 
        ? `${this.baseUrl}/recovery-option-templates?category_id=${categoryId}`
        : `${this.baseUrl}/recovery-option-templates`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching recovery option templates:", error);
      return [];
    }
  }

  async getDetailedRecoverySteps(disruptionId: string, optionId?: string): Promise<any[]> {
    try {
      console.log(`Fetching detailed recovery steps for disruption ${disruptionId}`);
      
      // Check circuit breaker
      if (!this.checkCircuitBreaker()) {
        console.log('Circuit breaker open, returning empty array');
        return [];
      }

      const url = optionId 
        ? `${this.baseUrl}/recovery-steps-detailed/${disruptionId}?option_id=${optionId}`
        : `${this.baseUrl}/recovery-steps-detailed/${disruptionId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No detailed recovery steps found for disruption ${disruptionId}`);
          this.onDatabaseSuccess(); // 404 is not a failure
          return [];
        }
        console.error(`HTTP error! status: ${response.status}`);
        this.onDatabaseFailure();
        return [];
      }
      
      const steps = await response.json();
      console.log(`Found ${steps.length} detailed recovery steps for disruption ${disruptionId}`);
      this.onDatabaseSuccess();
      return Array.isArray(steps) ? steps : [];
    } catch (error) {
      console.error("Error fetching detailed recovery steps:", error);
      this.onDatabaseFailure();
      return [];
    }
  }

  // Get recovery options by disruption categorization
  async getRecoveryOptionsByCategory(categoryCode: string): Promise<any[]> {
    try {
      console.log(`Fetching recovery options for category: ${categoryCode}`);
      const response = await fetch(`${this.baseUrl}/recovery-options/category/${categoryCode}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No recovery options found for category ${categoryCode}`);
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const options = await response.json();
      console.log(`Found ${options.length} recovery options for category ${categoryCode}`);
      return options;
    } catch (error) {
      console.error("Error fetching recovery options by category:", error);
      return [];
    }
  }

  // Map disruption type to category code
  async mapDisruptionToCategory(disruptionType: string, disruptionReason?: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/map-disruption-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          disruptionType, 
          disruptionReason: disruptionReason || '' 
        }),
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.categoryCode || null;
    } catch (error) {
      console.error("Error mapping disruption to category:", error);
      return null;
    }
  }

  // Generate recovery options for a disruption
  async generateRecoveryOptions(
    disruptionId: string,
  ): Promise<{ optionsCount: number; stepsCount: number }> {
    try {
      console.log(`Generating recovery options for disruption ${disruptionId}`);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `${this.baseUrl}/recovery-options/generate/${disruptionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Generation failed: ${response.status} - ${errorText}`);

        // Return empty results instead of throwing for 404 or server errors
        if (response.status === 404 || response.status >= 500) {
          console.warn("Generation failed, returning empty results");
          return { optionsCount: 0, stepsCount: 0 };
        }

        throw new Error(
          `Failed to generate recovery options: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("Generation successful:", result);
      return {
        optionsCount: result.optionsCount || 0,
        stepsCount: result.stepsCount || 0,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Recovery options generation timed out");
        return { optionsCount: 0, stepsCount: 0 };
      }

      console.error("Error generating recovery options:", error);
      // Return empty results instead of throwing to prevent crashes
      return { optionsCount: 0, stepsCount: 0 };
    }
  }

  // Get recovery steps for a disruption
  async getRecoverySteps(disruptionId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/recovery-steps/${disruptionId}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching recovery steps:", error);
      return [];
    }
  }

  async saveRecoveryOption(
    option: Omit<RecoveryOption, "id" | "createdAt">,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(option),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to save recovery option:", error);
      return false;
    }
  }

  // Passengers
  async getPassengersByFlight(flightNumber: string): Promise<PassengerData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/passengers/flight/${flightNumber}`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch passengers:", error);
      return [];
    }
  }

  async getPassengerByPnr(pnr: string): Promise<PassengerData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/passengers/pnr/${pnr}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch passenger ${pnr}:`, error);
      return null;
    }
  }

  async updatePassengerRebooking(
    pnr: string,
    rebookingData: any,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/passengers/${pnr}/rebooking`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rebookingData),
        },
      );
      return response.ok;
    } catch (error) {
      console.error("Failed to update passenger rebooking:", error);
      return false;
    }
  }

  // Crew Management
  async getAvailableCrew(): Promise<CrewMember[]> {
    try {
      const response = await fetch(`${this.baseUrl}/crew/available`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch available crew:", error);
      return [];
    }
  }

  async getCrewByFlight(flightNumber: string): Promise<CrewMember[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crew/flight/${flightNumber}`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch crew for flight:", error);
      return [];
    }
  }

  // Aircraft Management
  async getAllAircraft(): Promise<Aircraft[]> {
    try {
      const response = await fetch(`${this.baseUrl}/aircraft`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch aircraft:", error);
      return [];
    }
  }

  async getAvailableAircraft(): Promise<Aircraft[]> {
    try {
      const response = await fetch(`${this.baseUrl}/aircraft/available`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch available aircraft:", error);
      return [];
    }
  }

  async updateAircraftStatus(id: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/aircraft/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to update aircraft status:", error);
      return false;
    }
  }

  // Hotel Bookings
  async getHotelBookings(disruptionId?: string): Promise<HotelBooking[]> {
    try {
      const url = disruptionId
        ? `${this.baseUrl}/hotel-bookings/disruption/${disruptionId}`
        : `${this.baseUrl}/hotel-bookings`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch hotel bookings:", error);
      return [];
    }
  }

  async createHotelBooking(
    booking: Omit<HotelBooking, "id" | "createdAt">,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/hotel-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to create hotel booking:", error);
      return false;
    }
  }

  // Analytics and KPIs
  async getKPIData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/kpi`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      return {
        activeDisruptions: 0,
        affectedPassengers: 0,
        averageDelay: 0,
        recoverySuccessRate: 0,
        onTimePerformance: 0,
        costSavings: 0,
      };
    }
  }

  // Sync disruptions from external API - disabled to prevent unknown records
  async syncDisruptionsFromExternalAPI(): Promise<{ inserted: number; updated: number }> {
    try {
      console.log('External API sync disabled to prevent unknown records')
      // Return immediately without syncing to prevent creating unknown records
      return { inserted: 0, updated: 0 }
    } catch (error) {
      console.error('Error in sync function:', error)
      return { inserted: 0, updated: 0 }
    }
  }

  private async checkApiHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        try {
          const data = await response.json();
          return data.status === 'healthy' || response.status === 200;
        } catch (jsonError) {
          // If JSON parsing fails but response is ok, consider it healthy
          return true;
        }
      }

      console.warn(`API health check failed: ${response.status} ${response.statusText}`);
      return false;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('API health check timed out');
      } else {
        console.warn('API health check failed:', error.message || 'Unknown error');
      }
      return false;
    }
  }

  // Bulk update disruptions (alternative method)
  async bulkUpdateDisruptions(
    disruptions: any[],
  ): Promise<{ inserted: number; updated: number; errors: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/disruptions/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disruptions }),
      });

      if (!response.ok) {
        throw new Error(`Bulk update failed: ${response.status}`);
      }

      const result = await response.json();
      this.onDatabaseSuccess();
      return result;
    } catch (error) {
      console.error("Error in bulk update:", error);
      this.onDatabaseFailure();
      return { inserted: 0, updated: 0, errors: 1 };
    }
  }

  // Get detailed rotation plan data for a recovery option
  async getRotationPlanDetails(optionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-option/${optionId}/rotation-plan`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No rotation plan found for option ${optionId}`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.rotationPlan;
    } catch (error) {
      console.error("Error fetching rotation plan details:", error);
      return null;
    }
  }

  // Get detailed cost analysis for a recovery option
  async getCostAnalysisDetails(optionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-option/${optionId}/cost-analysis`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No cost analysis found for option ${optionId}`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.costAnalysis;
    } catch (error) {
      console.error("Error fetching cost analysis details:", error);
      return null;
    }
  }

  // Get detailed timeline for a recovery option
  async getTimelineDetails(optionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-option/${optionId}/timeline`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No timeline details found for option ${optionId}`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.timeline;
    } catch (error) {
      console.error("Error fetching timeline details:", error);
      return null;
    }
  }

  // Get detailed resource requirements for a recovery option
  async getResourceDetails(optionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-option/${optionId}/resources`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No resource details found for option ${optionId}`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.resources;
    } catch (error) {
      console.error("Error fetching resource details:", error);
      return null;
    }
  }

  // Get technical specifications for a recovery option
  async getTechnicalDetails(optionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/recovery-option/${optionId}/technical`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No technical details found for option ${optionId}`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.technical;
    } catch (error) {
      console.error("Error fetching technical details:", error);
      return null;
    }
  }

  // Generate mock external API data for testing - disabled to prevent unknown records
  private generateMockExternalData(): any[] {
    // Return empty array to stop generating mock data that creates unknown records
    console.log('Mock data generation disabled to prevent unknown records');
    return [];
  }
}

// Singleton instance
export const databaseService = new DatabaseService();