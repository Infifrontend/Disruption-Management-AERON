// Dashboard Analytics Service for real-time dashboard data
import { databaseService } from "./databaseService";

export interface DashboardAnalytics {
  // Flydubai AERON Performance Today
  performance: {
    costSavings: string;
    avgDecisionTime: string;
    passengersServed: number;
    successRate: string;
    decisionsProcessed: number;
  };

  // Passenger Impact Analysis
  passengerImpact: {
    affectedPassengers: number;
    highPriority: number;
    rebookings: number;
    resolved: number;
  };

  // Highly Disrupted Stations
  disruptedStations: Array<{
    code: string;
    name: string;
    disruptedFlights: number;
    passengersAffected: number;
    severity: "high" | "medium" | "low";
  }>;

  // Key Operational Insights
  operationalInsights: {
    recoveryRate: string;
    avgResolutionTime: string;
    networkImpact: string;
    criticalPriority: number;
    activeDisruptions: number;
    mostDisruptedRoute: {
      route: string;
      impact: string;
    };
  };

  // Global Network Overview
  networkOverview: {
    activeFlights: number;
    disruptions: number;
    totalPassengers: number;
    otpPerformance: string;
    dailyChange: {
      activeFlights: number;
      disruptions: number;
    };
  };
}

class DashboardAnalyticsService {
  private cache: DashboardAnalytics | null = null;
  private cacheTimestamp: number = 0;
  private lastDateFilter: string = "";
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  async getDashboardAnalytics(dateFilter: string = "today"): Promise<DashboardAnalytics> {
    // Create cache key that includes date filter
    const cacheKey = `analytics_${dateFilter}`;
    
    // Return cached data if still valid for this date filter
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION && this.lastDateFilter === dateFilter) {
      return this.cache;
    }

    try {
      // Make single API call to get consolidated dashboard data with date filter
      const url = new URL(`${databaseService.apiBaseUrl}/dashboard-analytics`);
      url.searchParams.append('dateFilter', dateFilter);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Dashboard analytics API error: ${response.status}`);
      }

      const analytics = await response.json();
      console.log("Fetched consolidated dashboard analytics for", dateFilter, ":", analytics);

      // Update cache
      this.cache = analytics;
      this.cacheTimestamp = Date.now();
      this.lastDateFilter = dateFilter;
      console.log("Updated dashboard analytics cache for", dateFilter);
      return analytics;
    } catch (error) {
      console.error("Failed to fetch dashboard analytics:", error);

      // Fallback to individual API calls if consolidated endpoint fails
      try {
        const [allDisruptions, recoveryLogs, pendingSolutions] =
          await Promise.all([
            databaseService.getAllDisruptions(),
            this.getRecoveryLogs(),
            databaseService.getPendingRecoverySolutions(),
          ]);

        console.log("Using fallback individual API calls for dashboard analytics");
        // Calculate analytics from real data
        const analytics = await this.calculateAnalytics(
          allDisruptions,
          recoveryLogs,
          pendingSolutions,
        );

        // Update cache
        this.cache = analytics;
        this.cacheTimestamp = Date.now();
        return analytics;
      } catch (fallbackError) {
        console.error("Fallback dashboard analytics also failed:", fallbackError);
        
        // Return cached data if available, otherwise fallback data
        if (this.cache) {
          return this.cache;
        }

        return this.getFallbackAnalytics();
      }
    }
  }

  private async getRecoveryLogs(): Promise<any[]> {
    try {
      return await databaseService.getPastRecoveryLogs("", "", "", "");
    } catch (error) {
      console.error("Failed to fetch recovery logs:", error);
      return [];
    }
  }

  private async calculateAnalytics(
    disruptions: any[],
    recoveryLogs: any[],
    pendingSolutions: any[],
  ): Promise<DashboardAnalytics> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Use all available data, not just today's data for more meaningful analytics
    const allDisruptions = disruptions || [];
    const allLogs = recoveryLogs || [];

    console.log("Calculating analytics with:", {
      totalDisruptions: allDisruptions.length,
      totalLogs: allLogs.length,
      pendingSolutions: pendingSolutions?.length || 0
    });

    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(
      allDisruptions,
      allLogs,
    );

    // Calculate passenger impact
    const passengerImpact = this.calculatePassengerImpact(
      allDisruptions,
      pendingSolutions || [],
    );

    // Calculate disrupted stations
    const disruptedStations = this.calculateDisruptedStations(allDisruptions);

    // Calculate operational insights
    const operationalInsights = this.calculateOperationalInsights(
      allDisruptions,
      allLogs,
      pendingSolutions || [],
    );

    // Calculate network overview
    const networkOverview = this.calculateNetworkOverview(
      allDisruptions,
      allLogs,
    );

    return {
      performance,
      passengerImpact,
      disruptedStations,
      operationalInsights,
      networkOverview,
    };
  }

  private calculatePerformanceMetrics(disruptions: any[], logs: any[]) {
    console.log("Calculating performance metrics with:", {
      disruptionsCount: disruptions.length,
      logsCount: logs.length
    });

    // Handle disruptions data properly
    const totalPassengers = disruptions.reduce((sum, d) => {
      const passengers = parseInt(d.passengers) || parseInt(d.affected_passengers) || 0;
      return sum + passengers;
    }, 0);

    // Calculate from disruptions if no logs available
    const totalDisruptions = disruptions.length;
    const resolvedDisruptions = disruptions.filter(d => 
      d.status === "Resolved" || 
      d.recovery_status === "completed" || 
      d.recovery_status === "approved"
    ).length;

    // Calculate costs from disruptions
    const totalCost = disruptions.reduce((sum, d) => {
      const delayCost = (parseInt(d.delay_minutes) || 0) * 150; // $150 per delay minute
      const passengerCost = (parseInt(d.passengers) || 0) * 25; // $25 per passenger
      return sum + delayCost + passengerCost;
    }, 0);

    // Calculate average resolution time from delay data
    const avgDelayTime = disruptions.length > 0 
      ? disruptions.reduce((sum, d) => sum + (parseInt(d.delay_minutes) || 120), 0) / disruptions.length
      : 120;

    // Calculate success rate
    const successRate = totalDisruptions > 0 
      ? ((resolvedDisruptions / totalDisruptions) * 100).toFixed(1)
      : "95.0";

    // Use actual recovery logs if available
    const completedRecoveries = logs.filter(log => 
      log.status === "Successful" || 
      log.status === "completed"
    );

    const logSuccessRate = logs.length > 0 
      ? ((completedRecoveries.length / logs.length) * 100).toFixed(1)
      : successRate;

    const logCost = completedRecoveries.reduce(
      (sum, log) => sum + (parseFloat(log.actual_cost) || 0),
      0,
    );

    const finalCost = logCost > 0 ? logCost : totalCost;
    const finalSuccessRate = logs.length > 0 ? logSuccessRate : successRate;

    console.log("Performance metrics calculated:", {
      totalPassengers,
      totalCost: finalCost,
      successRate: finalSuccessRate,
      decisionsProcessed: Math.max(logs.length, totalDisruptions)
    });

    return {
      costSavings: `AED ${Math.round(finalCost / 1000)}K`,
      avgDecisionTime: `${Math.round(avgDelayTime)} min`,
      passengersServed: totalPassengers,
      successRate: `${finalSuccessRate}%`,
      decisionsProcessed: Math.max(logs.length, totalDisruptions),
    };
  }

  private calculatePassengerImpact(
    disruptions: any[],
    pendingSolutions: any[],
  ) {
    const totalPassengers = disruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || parseInt(d.affected_passengers) || 0),
      0,
    );
    const highPriorityDisruptions = disruptions.filter(
      (d) => d.severity === "High" || d.severity === "Critical",
    );
    const highPriorityPassengers = highPriorityDisruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || parseInt(d.affected_passengers) || 0),
      0,
    );

    // Calculate actual rebookings and resolved from disruption recovery status
    const resolvedDisruptions = disruptions.filter(d => 
      d.recovery_status === 'completed' || 
      d.status === 'Resolved' || 
      d.status === 'Completed'
    );
    
    const resolvedPassengers = resolvedDisruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || parseInt(d.affected_passengers) || 0),
      0,
    );

    // Estimate rebookings based on disruption severity and type
    const rebookings = disruptions.reduce((sum, d) => {
      const passengers = parseInt(d.passengers) || parseInt(d.affected_passengers) || 0;
      // Higher rebooking rate for cancelled flights, lower for delays
      const rebookingRate = d.status === 'Cancelled' ? 0.9 : 
                           d.severity === 'High' ? 0.5 : 
                           d.severity === 'Critical' ? 0.8 : 0.2;
      return sum + Math.round(passengers * rebookingRate);
    }, 0);

    return {
      affectedPassengers: totalPassengers,
      highPriority: highPriorityPassengers,
      rebookings: rebookings,
      resolved: resolvedPassengers,
    };
  }

  private calculateDisruptedStations(disruptions: any[]) {
    const stationMap = new Map();

    disruptions.forEach((disruption) => {
      const origin = disruption.origin || "UNK";
      let originCity = disruption.origin_city;
      
      // Use proper city mapping if origin_city is missing, null, or "Unknown"
      if (!originCity || originCity === "Unknown" || originCity === "unknown") {
        originCity = this.getKnownCityName(origin);
      }

      if (!stationMap.has(origin)) {
        stationMap.set(origin, {
          code: origin,
          name: `${origin} - ${originCity}`,
          disruptedFlights: 0,
          passengersAffected: 0,
          severity: "low" as const,
        });
      }

      const station = stationMap.get(origin);
      station.disruptedFlights++;
      station.passengersAffected += parseInt(disruption.passengers) || parseInt(disruption.affected_passengers) || 0;

      // Determine severity based on passengers affected
      if (station.passengersAffected > 500) {
        station.severity = "high";
      } else if (station.passengersAffected > 200) {
        station.severity = "medium";
      }
    });

    console.log("Disrupted stations calculated:", Array.from(stationMap.values()));

    // Return top 3 most affected stations
    return Array.from(stationMap.values())
      .sort((a, b) => b.passengersAffected - a.passengersAffected)
      .slice(0, 3);
  }

  private calculateOperationalInsights(
    disruptions: any[],
    logs: any[],
    pendingSolutions: any[],
  ) {
    // Calculate from disruptions data
    const criticalDisruptions = disruptions.filter(d => 
      d.severity === "Critical" || d.severity === "High"
    ).length;

    const activeDisruptions = disruptions.filter(d => 
      d.status === "Active" || 
      d.status === "Delayed" || 
      (d.recovery_status !== "completed" && d.recovery_status !== "approved")
    ).length;

    // Use logs if available, otherwise calculate from disruptions
    const completedLogs = logs.filter(log => 
      log.status === "Successful" || log.status === "completed"
    );
    
    const resolvedDisruptions = disruptions.filter(d => 
      d.status === "Resolved" || 
      d.recovery_status === "completed" || 
      d.recovery_status === "approved"
    ).length;

    const totalItems = Math.max(logs.length, disruptions.length);
    const successfulItems = Math.max(completedLogs.length, resolvedDisruptions);

    const recoveryRate = totalItems > 0 
      ? ((successfulItems / totalItems) * 100).toFixed(1)
      : "95.0";

    // Calculate average resolution time
    const avgResolutionTime = disruptions.length > 0
      ? disruptions.reduce((sum, d) => {
          const delayMinutes = parseInt(d.delay_minutes) || 120;
          return sum + (delayMinutes / 60); // Convert to hours
        }, 0) / disruptions.length
      : 2.4;

    // Find most disrupted route
    const routeMap = new Map();
    disruptions.forEach((d) => {
      const route = d.route || `${d.origin || 'UNK'} → ${d.destination || 'UNK'}`;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);
    });

    let mostDisruptedRoute = { route: "N/A", impact: "N/A" };
    if (routeMap.size > 0) {
      const maxRoute = Array.from(routeMap.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];
      mostDisruptedRoute = {
        route: maxRoute[0],
        impact: maxRoute[1] > 3 ? "High Impact" : maxRoute[1] > 1 ? "Medium Impact" : "Low Impact",
      };
    }

    console.log("Operational insights calculated:", {
      criticalDisruptions,
      activeDisruptions,
      recoveryRate,
      avgResolutionTime: avgResolutionTime.toFixed(1)
    });

    return {
      recoveryRate: `${recoveryRate}%`,
      avgResolutionTime: `${avgResolutionTime.toFixed(1)}h`,
      networkImpact:
        activeDisruptions > 10
          ? "High"
          : activeDisruptions > 3
            ? "Medium"
            : "Low",
      criticalPriority: criticalDisruptions,
      activeDisruptions,
      mostDisruptedRoute,
    };
  }

  private calculateNetworkOverview(disruptions: any[], logs: any[]) {
    // Calculate more realistic network metrics based on actual data
    const disruptionCount = disruptions.length;
    
    // Use disruption ratio to estimate total network (typically 3-8% of flights have disruptions)
    const estimatedActiveFlights = disruptionCount > 0 
      ? Math.max(Math.round(disruptionCount / 0.05), 100) // Assume 5% disruption rate
      : 150; // Default baseline
    
    const totalPassengers = disruptions.reduce((sum, d) => {
      return sum + (parseInt(d.passengers) || parseInt(d.affected_passengers) || 0);
    }, 0);

    // More realistic network passenger estimate (disrupted passengers typically 2-5% of total)
    const estimatedTotalPassengers = totalPassengers > 0 
      ? Math.max(Math.round(totalPassengers / 0.03), 10000) // Assume 3% of passengers affected
      : 15000; // Default baseline

    // Calculate OTP more accurately
    const significantDelays = disruptions.filter(d => 
      parseInt(d.delay_minutes) > 15 || d.status === 'Cancelled'
    ).length;
    
    const onTimeFlights = Math.max(0, estimatedActiveFlights - significantDelays);
    const otpPerformance = estimatedActiveFlights > 0 
      ? ((onTimeFlights / estimatedActiveFlights) * 100).toFixed(1)
      : "91.5";

    // Better daily change calculation based on severity
    const criticalDisruptions = disruptions.filter(d => 
      d.severity === 'Critical' || d.severity === 'High'
    ).length;
    
    const avgImpact = disruptions.length > 0 
      ? disruptions.reduce((sum, d) => {
          const delayWeight = Math.min(parseInt(d.delay_minutes) || 0, 300) / 300; // Cap at 5 hours
          const severityWeight = d.severity === 'Critical' ? 1.0 : d.severity === 'High' ? 0.7 : 0.3;
          return sum + (delayWeight * severityWeight);
        }, 0) / disruptions.length
      : 0;

    const dailyChange = {
      activeFlights: Math.round((0.9 - avgImpact) * 20), // Impact on flight operations
      disruptions: Math.max(-10, Math.min(10, disruptionCount - 8)), // Compare to baseline of 8
    };

    console.log("Network overview calculated:", {
      estimatedActiveFlights,
      totalPassengers,
      estimatedTotalPassengers,
      otpPerformance,
      disruptionCount: disruptions.length,
      criticalDisruptions
    });

    return {
      activeFlights: estimatedActiveFlights,
      disruptions: disruptions.length,
      totalPassengers: estimatedTotalPassengers,
      otpPerformance: `${otpPerformance}%`,
      dailyChange,
    };
  }

  private parseDuration(duration: string): number {
    // Parse PostgreSQL interval to minutes
    const matches = duration.match(/(\d+):(\d+):(\d+)/);
    if (matches) {
      const [, hours, minutes, seconds] = matches;
      return parseInt(hours) * 60 + parseInt(minutes) + parseInt(seconds) / 60;
    }
    return 0;
  }

  private getKnownCityName(code: string): string {
    const cityMap: Record<string, string> = {
      // UAE
      DXB: "Dubai",
      AUH: "Abu Dhabi", 
      SLL: "Salalah",
      AAN: "Al Ain",
      DWC: "Dubai World Central",
      
      // India/Pakistan
      DEL: "Delhi",
      BOM: "Mumbai",
      KHI: "Karachi",
      COK: "Kochi",
      
      // Nepal
      BKT: "Bhaktalpur",
      KTM: "Kathmandu",
      
      // Middle East
      DOH: "Doha",
      KWI: "Kuwait",
      CAI: "Cairo",
      AMM: "Amman",
      BGW: "Baghdad",
      
      // Europe
      IST: "Istanbul",
      LHR: "London",
      CDG: "Paris",
      FRA: "Frankfurt",
    };
    return cityMap[code] || `${code} Airport`;
  }

  private getFallbackAnalytics(): DashboardAnalytics {
    // Return minimal fallback data when database is unavailable
    return {
      performance: {
        costSavings: "AED 0K",
        avgDecisionTime: "0 min",
        passengersServed: 0,
        successRate: "0.0%",
        decisionsProcessed: 0,
      },
      passengerImpact: {
        affectedPassengers: 0,
        highPriority: 0,
        rebookings: 0,
        resolved: 0,
      },
      disruptedStations: [],
      operationalInsights: {
        recoveryRate: "0.0%",
        avgResolutionTime: "0.0h",
        networkImpact: "Low",
        criticalPriority: 0,
        activeDisruptions: 0,
        mostDisruptedRoute: {
          route: "N/A",
          impact: "N/A",
        },
      },
      networkOverview: {
        activeFlights: 0,
        disruptions: 0,
        totalPassengers: 0,
        otpPerformance: "0.0%",
        dailyChange: {
          activeFlights: 0,
          disruptions: 0,
        },
      },
    };
  }

  // Clear cache to force refresh
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    this.lastDateFilter = "";
  }
}

export const dashboardAnalytics = new DashboardAnalyticsService();
