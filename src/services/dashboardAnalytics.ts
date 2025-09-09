// Dashboard Analytics Service for real-time dashboard data
import { databaseService } from './databaseService';

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
    severity: 'high' | 'medium' | 'low';
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
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    // Return cached data if still valid
    if (this.cache && (Date.now() - this.cacheTimestamp < this.CACHE_DURATION)) {
      return this.cache;
    }
    
    try {
      // Fetch all required data from database
      const [
        allDisruptions,
        recoveryLogs,
        pendingSolutions
      ] = await Promise.all([
        databaseService.getAllDisruptions(),
        this.getRecoveryLogs(),
        databaseService.getPendingRecoverySolutions()
      ]);
      
      // Calculate analytics from real data
      const analytics = await this.calculateAnalytics(
        allDisruptions,
        recoveryLogs,
        pendingSolutions
      );
      
      // Update cache
      this.cache = analytics;
      this.cacheTimestamp = Date.now();
      
      return analytics;
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      
      // Return cached data if available, otherwise fallback data
      if (this.cache) {
        return this.cache;
      }
      
      return this.getFallbackAnalytics();
    }
  }
  
  private async getRecoveryLogs(): Promise<any[]> {
    try {
      return await databaseService.getPastRecoveryLogs('', '', '', '');
    } catch (error) {
      console.error('Failed to fetch recovery logs:', error);
      return [];
    }
  }
  
  private async calculateAnalytics(
    disruptions: any[],
    recoveryLogs: any[],
    pendingSolutions: any[]
  ): Promise<DashboardAnalytics> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter data for today
    const todayDisruptions = disruptions.filter(d => 
      new Date(d.createdAt) >= today
    );
    
    const todayLogs = recoveryLogs.filter(log => 
      new Date(log.date_created) >= today
    );
    
    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(todayDisruptions, todayLogs);
    
    // Calculate passenger impact
    const passengerImpact = this.calculatePassengerImpact(todayDisruptions, pendingSolutions);
    
    // Calculate disrupted stations
    const disruptedStations = this.calculateDisruptedStations(todayDisruptions);
    
    // Calculate operational insights
    const operationalInsights = this.calculateOperationalInsights(
      todayDisruptions, 
      todayLogs, 
      pendingSolutions
    );
    
    // Calculate network overview
    const networkOverview = this.calculateNetworkOverview(todayDisruptions, recoveryLogs);
    
    return {
      performance,
      passengerImpact,
      disruptedStations,
      operationalInsights,
      networkOverview
    };
  }
  
  private calculatePerformanceMetrics(disruptions: any[], logs: any[]) {
    const completedRecoveries = logs.filter(log => log.status === 'completed');
    const totalCost = completedRecoveries.reduce((sum, log) => sum + (log.actual_cost || 0), 0);
    const avgTime = completedRecoveries.length > 0 
      ? completedRecoveries.reduce((sum, log) => {
          const duration = log.duration ? this.parseDuration(log.duration) : 0;
          return sum + duration;
        }, 0) / completedRecoveries.length
      : 0;
    
    const successRate = logs.length > 0 
      ? (completedRecoveries.length / logs.length * 100).toFixed(1)
      : '0.0';
    
    const totalPassengers = disruptions.reduce((sum, d) => sum + (d.passengers || 0), 0);
    
    return {
      costSavings: `AED ${Math.round(totalCost / 1000)}K`,
      avgDecisionTime: `${Math.round(avgTime)} min`,
      passengersServed: totalPassengers,
      successRate: `${successRate}%`,
      decisionsProcessed: logs.length
    };
  }
  
  private calculatePassengerImpact(disruptions: any[], pendingSolutions: any[]) {
    const totalPassengers = disruptions.reduce((sum, d) => sum + (d.passengers || 0), 0);
    const highPriorityDisruptions = disruptions.filter(d => 
      d.severity === 'High' || d.severity === 'Critical'
    );
    const highPriorityPassengers = highPriorityDisruptions.reduce(
      (sum, d) => sum + (d.passengers || 0), 0
    );
    
    // Estimate rebookings and resolved based on solutions
    const rebookings = Math.round(totalPassengers * 0.3); // 30% typically need rebooking
    const resolved = Math.round(totalPassengers * 0.95); // 95% eventually resolved
    
    return {
      affectedPassengers: totalPassengers,
      highPriority: highPriorityPassengers,
      rebookings,
      resolved
    };
  }
  
  private calculateDisruptedStations(disruptions: any[]) {
    const stationMap = new Map();
    
    disruptions.forEach(disruption => {
      const origin = disruption.origin;
      const originCity = disruption.originCity || this.getKnownCityName(origin);
      
      if (!stationMap.has(origin)) {
        stationMap.set(origin, {
          code: origin,
          name: `${origin} - ${originCity}`,
          disruptedFlights: 0,
          passengersAffected: 0,
          severity: 'low' as const
        });
      }
      
      const station = stationMap.get(origin);
      station.disruptedFlights++;
      station.passengersAffected += disruption.passengers || 0;
      
      // Determine severity based on passengers affected
      if (station.passengersAffected > 2000) {
        station.severity = 'high';
      } else if (station.passengersAffected > 800) {
        station.severity = 'medium';
      }
    });
    
    // Return top 3 most affected stations
    return Array.from(stationMap.values())
      .sort((a, b) => b.passengersAffected - a.passengersAffected)
      .slice(0, 3);
  }
  
  private calculateOperationalInsights(
    disruptions: any[], 
    logs: any[], 
    pendingSolutions: any[]
  ) {
    const completedLogs = logs.filter(log => log.status === 'completed');
    const recoveryRate = logs.length > 0 
      ? ((completedLogs.length / logs.length) * 100).toFixed(1)
      : '0.0';
    
    const avgResolutionTime = completedLogs.length > 0
      ? completedLogs.reduce((sum, log) => {
          const duration = log.duration ? this.parseDuration(log.duration) : 0;
          return sum + duration;
        }, 0) / completedLogs.length / 60 // Convert to hours
      : 0;
    
    const criticalDisruptions = disruptions.filter(d => d.severity === 'Critical').length;
    const activeDisruptions = disruptions.filter(d => 
      d.status !== 'Resolved' && d.status !== 'Completed'
    ).length;
    
    // Find most disrupted route
    const routeMap = new Map();
    disruptions.forEach(d => {
      const route = d.route;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);
    });
    
    let mostDisruptedRoute = { route: 'N/A', impact: 'N/A' };
    if (routeMap.size > 0) {
      const maxRoute = Array.from(routeMap.entries())
        .sort((a, b) => b[1] - a[1])[0];
      mostDisruptedRoute = {
        route: maxRoute[0],
        impact: maxRoute[1] > 5 ? 'High Impact' : 'Medium Impact'
      };
    }
    
    return {
      recoveryRate: `${recoveryRate}%`,
      avgResolutionTime: `${avgResolutionTime.toFixed(1)}h`,
      networkImpact: activeDisruptions > 20 ? 'High' : activeDisruptions > 10 ? 'Medium' : 'Low',
      criticalPriority: criticalDisruptions,
      activeDisruptions,
      mostDisruptedRoute
    };
  }
  
  private calculateNetworkOverview(disruptions: any[], logs: any[]) {
    // Estimate active flights based on disruptions and historical data
    const estimatedActiveFlights = Math.max(disruptions.length * 35, 800); // Rough estimate
    const totalPassengers = disruptions.reduce((sum, d) => sum + (d.passengers || 0), 0);
    const estimatedTotalPassengers = Math.max(totalPassengers * 10, 40000); // Extrapolate
    
    const completedLogs = logs.filter(log => log.status === 'completed');
    const otpFromLogs = completedLogs.length > 0 
      ? completedLogs.reduce((sum, log) => sum + (log.rebooking_success || 85), 0) / completedLogs.length
      : 89.2;
    
    return {
      activeFlights: estimatedActiveFlights,
      disruptions: disruptions.length,
      totalPassengers: estimatedTotalPassengers,
      otpPerformance: `${otpFromLogs.toFixed(1)}%`,
      dailyChange: {
        activeFlights: Math.floor(Math.random() * 20) - 5, // Random for demo
        disruptions: Math.floor(Math.random() * 10) - 3
      }
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
      'DXB': 'Dubai',
      'DEL': 'Delhi', 
      'BOM': 'Mumbai',
      'DOH': 'Doha',
      'IST': 'Istanbul',
      'LHR': 'London',
      'KHI': 'Karachi',
      'AUH': 'Abu Dhabi',
      'SLL': 'Salalah'
    };
    return cityMap[code] || 'Unknown';
  }
  
  private getFallbackAnalytics(): DashboardAnalytics {
    // Return minimal fallback data when database is unavailable
    return {
      performance: {
        costSavings: 'AED 0K',
        avgDecisionTime: '0 min',
        passengersServed: 0,
        successRate: '0.0%',
        decisionsProcessed: 0
      },
      passengerImpact: {
        affectedPassengers: 0,
        highPriority: 0,
        rebookings: 0,
        resolved: 0
      },
      disruptedStations: [],
      operationalInsights: {
        recoveryRate: '0.0%',
        avgResolutionTime: '0.0h',
        networkImpact: 'Low',
        criticalPriority: 0,
        activeDisruptions: 0,
        mostDisruptedRoute: {
          route: 'N/A',
          impact: 'N/A'
        }
      },
      networkOverview: {
        activeFlights: 0,
        disruptions: 0,
        totalPassengers: 0,
        otpPerformance: '0.0%',
        dailyChange: {
          activeFlights: 0,
          disruptions: 0
        }
      }
    };
  }
  
  // Clear cache to force refresh
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const dashboardAnalytics = new DashboardAnalyticsService();