import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { databaseService } from "../services/databaseService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { WorldMap } from "../components/WorldMap";
import {
  AlertTriangle,
  BarChart3,
  Filter,
  AlertCircle,
  Zap,
  UserCheck,
  Plane,
  Fuel,
  Wrench,
  Hotel,
  ClockIcon,
  CheckSquare,
  Users,
  Calendar,
  Globe,
  TrendingUp,
  MapPin,
  Activity,
  Radar,
} from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const { filters, setFilters, screenSettings, setSelectedDisruption } =
    useAppContext();

  const enabledScreens = screenSettings.filter((screen) => screen.enabled);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    kpiData: {
      activeDisruptions: 0,
      affectedPassengers: 0,
      averageDelay: 0,
      recoverySuccessRate: 0,
      onTimePerformance: 0,
      costSavings: 0
    },
    passengerImpact: {
      totalAffected: 0,
      highPriority: 0,
      successfulRebookings: 0,
      resolved: 0,
      pendingAccommodation: 0
    },
    disruptedStations: [],
    operationalInsights: {
      recoveryRate: 0,
      averageResolutionTime: '0h',
      networkImpact: 'Low',
      criticalPriority: 0,
      mostDisruptedRoute: 'N/A',
      routeDisruptionCause: 'N/A'
    },
    flightData: {
      totalFlights: 0,
      activeFlights: 0,
      totalPassengers: 0,
      onTimePerformance: 0
    }
  });

  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        kpiData,
        passengerImpact,
        disruptedStations,
        operationalInsights,
        disruptions,
        pendingSolutions,
        rebookings,
        crewAssignments
      ] = await Promise.all([
        databaseService.getKPIData(),
        databaseService.getPassengerImpactData(),
        databaseService.getHighlyDisruptedStations(),
        databaseService.getOperationalInsights(),
        databaseService.getAllDisruptions(),
        databaseService.getPendingRecoverySolutions(),
        databaseService.getPassengerRebookingsByDisruption(''),
        databaseService.getCrewHotelAssignmentsByDisruption('')
      ]);

      // Calculate real metrics from database data
      const activeDisruptions = disruptions.filter(d => d.status === 'Active' || d.status === 'Delayed').length;
      const totalAffectedPassengers = disruptions.reduce((sum, d) => sum + (d.passengers || 0), 0);
      const avgDelay = disruptions.length > 0 
        ? Math.round(disruptions.reduce((sum, d) => sum + (d.delay || 0), 0) / disruptions.length)
        : 0;
      
      const completedRecoveries = disruptions.filter(d => d.recoveryStatus === 'completed').length;
      const recoverySuccessRate = disruptions.length > 0 
        ? Math.round((completedRecoveries / disruptions.length) * 100 * 10) / 10
        : 0;

      // Calculate passenger impact metrics
      const highPriorityPassengers = disruptions
        .filter(d => d.severity === 'High' || d.severity === 'Critical')
        .reduce((sum, d) => sum + (d.passengers || 0), 0);
      
      const successfulRebookings = rebookings.filter(r => r.status === 'Confirmed').length;
      const resolvedDisruptions = disruptions.filter(d => d.recoveryStatus === 'completed').length;
      const resolvedPassengers = disruptions
        .filter(d => d.recoveryStatus === 'completed')
        .reduce((sum, d) => sum + (d.passengers || 0), 0);

      // Group disruptions by station for disrupted stations data
      const stationStats = {};
      disruptions.forEach(d => {
        const station = d.origin;
        const stationName = d.originCity;
        if (!stationStats[station]) {
          stationStats[station] = {
            station,
            stationName,
            disruptedFlights: 0,
            affectedPassengers: 0,
            severity: 'low',
            primaryCause: 'Unknown'
          };
        }
        stationStats[station].disruptedFlights++;
        stationStats[station].affectedPassengers += d.passengers || 0;
        if (d.severity === 'High' || d.severity === 'Critical') {
          stationStats[station].severity = 'high';
        } else if (d.severity === 'Medium' && stationStats[station].severity === 'low') {
          stationStats[station].severity = 'medium';
        }
        stationStats[station].primaryCause = d.type || 'Unknown';
      });

      const sortedStations = Object.values(stationStats)
        .sort((a, b) => b.affectedPassengers - a.affectedPassengers)
        .slice(0, 5);

      // Calculate operational insights
      const avgResolutionTime = `${Math.round(avgDelay / 60)}h ${avgDelay % 60}m`;
      const criticalCount = disruptions.filter(d => d.severity === 'Critical').length;
      const networkImpact = criticalCount > 10 ? 'High' : criticalCount > 5 ? 'Medium' : 'Low';
      
      // Find most disrupted route
      const routeStats = {};
      disruptions.forEach(d => {
        if (!routeStats[d.route]) {
          routeStats[d.route] = { count: 0, cause: d.disruptionReason };
        }
        routeStats[d.route].count++;
      });
      const mostDisruptedRoute = Object.entries(routeStats)
        .sort(([,a], [,b]) => b.count - a.count)[0];

      setDashboardData({
        kpiData: {
          activeDisruptions,
          affectedPassengers: totalAffectedPassengers,
          averageDelay: avgDelay,
          recoverySuccessRate,
          onTimePerformance: kpiData.onTimePerformance || 87.3,
          costSavings: kpiData.costSavings || 2.8
        },
        passengerImpact: {
          totalAffected: totalAffectedPassengers,
          highPriority: highPriorityPassengers,
          successfulRebookings,
          resolved: resolvedPassengers,
          pendingAccommodation: totalAffectedPassengers - resolvedPassengers
        },
        disruptedStations: sortedStations,
        operationalInsights: {
          recoveryRate: recoverySuccessRate,
          averageResolutionTime: avgResolutionTime,
          networkImpact,
          criticalPriority: criticalCount,
          mostDisruptedRoute: mostDisruptedRoute ? mostDisruptedRoute[0] : 'N/A',
          routeDisruptionCause: mostDisruptedRoute ? mostDisruptedRoute[1].cause : 'N/A'
        },
        flightData: {
          totalFlights: disruptions.length,
          activeFlights: activeDisruptions,
          totalPassengers: totalAffectedPassengers,
          onTimePerformance: kpiData.onTimePerformance || 87.3
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep default mock data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRecoveryPlan = (disruption: any) => {
    setSelectedDisruption(disruption);
    navigate("/disruption");
  };

  const navigateToScreen = (screenId: string) => {
    const screen = enabledScreens.find((s) => s.id === screenId);
    if (screen) {
      navigate(screenId === "dashboard" ? "/" : `/${screenId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <Alert className="border-flydubai-orange bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-flydubai-orange" />
        <AlertDescription className="text-orange-800">
          <strong>Active Disruptions:</strong> {dashboardData.kpiData.activeDisruptions} Flydubai flights affected.
          {dashboardData.disruptedStations.length > 0 && (
            <> Primary concern: {dashboardData.disruptedStations[0]?.stationName || 'Multiple stations'}.</>
          )} AERON recovery plans available.
        </AlertDescription>
      </Alert>

      {/* Quick Analytics Banner */}
      <Card className="bg-gradient-flydubai-light border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <BarChart3 className="h-8 w-8 text-flydubai-blue" />
                <div className="absolute -inset-1 bg-flydubai-blue rounded-lg opacity-10 blur-sm"></div>
              </div>
              <div>
                <h3 className="font-medium text-flydubai-navy">
                  Flydubai AERON Performance Today
                </h3>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.flightData.totalFlights} recovery decisions processed • {dashboardData.operationalInsights.recoveryRate}% success rate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-blue">
                  AED {Math.round(dashboardData.kpiData.costSavings * 100)}K
                </p>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-navy">
                  {dashboardData.operationalInsights.averageResolutionTime}
                </p>
                <p className="text-xs text-muted-foreground">Avg Decision</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-orange">
                  {dashboardData.kpiData.affectedPassengers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Passengers Served
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToScreen("reports")}
                className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
              >
                View Full Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Impact & Disruption Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-flydubai-orange" />
              Passenger Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    Affected Passengers
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {dashboardData.passengerImpact.totalAffected.toLocaleString()}
                </p>
                <p className="text-xs text-red-600">Across all disruptions</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    High Priority
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">
                  {dashboardData.passengerImpact.highPriority.toLocaleString()}
                </p>
                <p className="text-xs text-yellow-600">
                  Need immediate attention
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Rebookings
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {dashboardData.passengerImpact.successfulRebookings.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">Successfully rebooked</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Resolved
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {dashboardData.passengerImpact.resolved.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  Passengers accommodated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Highly Disrupted Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.disruptedStations.length === 0 ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600">No major disruptions at this time</p>
                </div>
              ) : (
                dashboardData.disruptedStations.slice(0, 3).map((station, index) => {
                  const bgColor = station.severity === 'high' ? 'bg-red-50 border-red-200' : 
                                 station.severity === 'medium' ? 'bg-orange-50 border-orange-200' : 
                                 'bg-yellow-50 border-yellow-200';
                  const dotColor = station.severity === 'high' ? 'bg-red-500' : 
                                  station.severity === 'medium' ? 'bg-orange-500' : 
                                  'bg-yellow-500';
                  const textColor = station.severity === 'high' ? 'text-red-900' : 
                                   station.severity === 'medium' ? 'text-orange-900' : 
                                   'text-yellow-900';
                  const subTextColor = station.severity === 'high' ? 'text-red-600' : 
                                      station.severity === 'medium' ? 'text-orange-600' : 
                                      'text-yellow-600';
                  const valueColor = station.severity === 'high' ? 'text-red-700' : 
                                    station.severity === 'medium' ? 'text-orange-700' : 
                                    'text-yellow-700';

                  return (
                    <div key={station.station} className={`flex items-center justify-between p-3 rounded-lg border ${bgColor}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                        <div>
                          <p className={`font-semibold ${textColor}`}>
                            {station.station} - {station.stationName}
                          </p>
                          <p className={`text-xs ${subTextColor}`}>
                            {station.disruptedFlights} disrupted flights
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${valueColor}`}>
                          {station.affectedPassengers.toLocaleString()}
                        </p>
                        <p className={`text-xs ${subTextColor}`}>passengers affected</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Operational Insights */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Key Operational Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Recovery Rate
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {dashboardData.operationalInsights.recoveryRate}%
              </p>
              <p className="text-xs text-blue-600">Real-time calculation</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Avg Resolution
                </span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {dashboardData.operationalInsights.averageResolutionTime}
              </p>
              <p className="text-xs text-green-600">Based on current data</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Network Impact
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {dashboardData.operationalInsights.networkImpact}
              </p>
              <p className="text-xs text-purple-600">
                {dashboardData.kpiData.activeDisruptions} active disruptions
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Critical Priority
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-800">
                {dashboardData.operationalInsights.criticalPriority}
              </p>
              <p className="text-xs text-orange-600">
                Require immediate action
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Most Disrupted Route
                </p>
                <p className="text-sm text-gray-600">
                  {dashboardData.operationalInsights.mostDisruptedRoute !== 'N/A' 
                    ? `${dashboardData.operationalInsights.mostDisruptedRoute} - ${dashboardData.operationalInsights.routeDisruptionCause}`
                    : 'No major route disruptions at this time'
                  }
                </p>
              </div>
              <Badge className={`${
                dashboardData.operationalInsights.networkImpact === 'High' 
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : dashboardData.operationalInsights.networkImpact === 'Medium'
                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : 'bg-green-100 text-green-700 border-green-200'
              }`}>
                {dashboardData.operationalInsights.networkImpact} Impact
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Overview */}
      <Card className="border-flydubai-blue/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-flydubai-blue" />
            Global Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Plane className="h-5 w-5 text-flydubai-blue" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Flights
                    </p>
                    <p className="text-xl font-semibold text-flydubai-blue">
                      {dashboardData.flightData.activeFlights}
                    </p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {loading ? 'Loading...' : 'Real-time data'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-flydubai-orange" />
                  <div>
                    <p className="text-sm text-muted-foreground">Disruptions</p>
                    <p className="text-xl font-semibold text-flydubai-orange">
                      {dashboardData.kpiData.activeDisruptions}
                    </p>
                    <p className="text-xs text-red-600">
                      {dashboardData.operationalInsights.criticalPriority} critical • {dashboardData.kpiData.affectedPassengers.toLocaleString()} pax affected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Passengers
                    </p>
                    <p className="text-xl font-semibold text-purple-600">
                      {dashboardData.flightData.totalPassengers.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600">
                      {dashboardData.flightData.totalPassengers > 0 
                        ? Math.round((dashboardData.kpiData.affectedPassengers / dashboardData.flightData.totalPassengers) * 100 * 10) / 10
                        : 0}% disrupted today
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      OTP Performance
                    </p>
                    <p className="text-xl font-semibold text-green-600">
                      {dashboardData.kpiData.onTimePerformance}%
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Recovery rate: {dashboardData.operationalInsights.recoveryRate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-flydubai-blue" />
            Flydubai Network Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Flight Number
              </label>
              <Input
                placeholder="FZ123"
                value={filters.flightNumber}
                onChange={(e) =>
                  setFilters({ ...filters, flightNumber: e.target.value })
                }
                className="input-flydubai"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Station</label>
              <Select
                value={filters.station}
                onValueChange={(value) =>
                  setFilters({ ...filters, station: value })
                }
              >
                <SelectTrigger className="select-flydubai">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dxb">DXB - Dubai</SelectItem>
                  <SelectItem value="auh">AUH - Abu Dhabi</SelectItem>
                  <SelectItem value="sll">SLL - Salalah</SelectItem>
                  <SelectItem value="khi">KHI - Karachi</SelectItem>
                  <SelectItem value="bom">BOM - Mumbai</SelectItem>
                  <SelectItem value="del">DEL - Delhi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select
                value={filters.region}
                onValueChange={(value) =>
                  setFilters({ ...filters, region: value })
                }
              >
                <SelectTrigger className="select-flydubai">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcc">GCC</SelectItem>
                  <SelectItem value="indian-subcontinent">
                    Indian Subcontinent
                  </SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="middle-east">Middle East</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Date/Time
              </label>
              <Input
                type="datetime-local"
                value={filters.dateTime}
                onChange={(e) =>
                  setFilters({ ...filters, dateTime: e.target.value })
                }
                className="input-flydubai"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time World Map */}
      <div className="w-full">
        <WorldMap />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {enabledScreens.find((s) => s.id === "flight-disruption-list") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("flight-disruption-list")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <AlertCircle className="h-4 w-4" />
            Active Disruptions
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "recovery") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("recovery")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Zap className="h-4 w-4" />
            Recovery Options
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "passengers") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("passengers")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <UserCheck className="h-4 w-4" />
            Passenger Services
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "flight-tracking") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("flight-tracking")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Plane className="h-4 w-4" />
            Flight Tracking
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "fuel-optimization") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("fuel-optimization")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Fuel className="h-4 w-4" />
            Fuel Optimization
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "maintenance") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("maintenance")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Wrench className="h-4 w-4" />
            Aircraft Maintenance
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "hotac") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("hotac")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Hotel className="h-4 w-4" />
            HOTAC Management
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "pending") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("pending")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <ClockIcon className="h-4 w-4" />
            Pending Solutions
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "past-logs") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("past-logs")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <CheckSquare className="h-4 w-4" />
            Past Recovery Logs
          </Button>
        )}
      </div>
    </div>
  );
}
