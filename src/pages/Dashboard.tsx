import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useState, useEffect } from "react";
import {
  dashboardAnalytics,
  DashboardAnalytics,
} from "../services/dashboardAnalytics";
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
  Globe,
  TrendingUp,
  MapPin,
  Activity,
  Radar,
  Calendar,
} from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const { filters, setFilters, screenSettings } = useAppContext();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("today");
  
  const enabledScreens = screenSettings.filter((screen) => screen.enabled);

  // Date filter options
  const dateFilterOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
  ];

  // Fetch dashboard analytics with date filter
  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await dashboardAnalytics.getDashboardAnalytics(dateFilter);
      console.log("Dashboard analytics loaded for", dateFilter, ":", data);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch dashboard analytics:", error);
      // Keep any existing data on error to prevent UI breakdown
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch analytics when component mounts or date filter changes
  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter]);

  // Set up periodic refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't show loading state on periodic refreshes to avoid UI flicker
      fetchAnalytics(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [dateFilter]);

  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
  };

  // const handleCreateRecoveryPlan = (disruption: any) => {
  //   setSelectedDisruption(disruption);
  //   navigate("/disruption");
  // };

  const navigateToScreen = (screenId: string) => {
    const screen = enabledScreens.find((s) => s.id === screenId);
    if (screen) {
      navigate(screenId === "dashboard" ? "/" : `/${screenId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-flydubai-navy">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time flight operations and recovery analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-flydubai-blue" />
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-40 border-flydubai-blue/30 focus:border-flydubai-blue">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loading && (
            <div className="text-sm text-muted-foreground">
              Loading analytics...
            </div>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      <Alert className="border-flydubai-orange bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-flydubai-orange" />
        <AlertDescription className="text-orange-800">
          <strong>Active Disruptions:</strong>{" "}
          {loading
            ? "Loading..."
            : `${analytics?.operationalInsights.activeDisruptions || 0} Flydubai flights currently disrupted`}
          . AERON recovery plans available.
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
                  {loading
                    ? "Loading..."
                    : `${analytics?.performance.decisionsProcessed || 0} recovery decisions processed • ${analytics?.performance.successRate || "0.0%"} success rate`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-blue">
                  {loading
                    ? "Loading..."
                    : analytics?.performance.costSavings || "AED 0K"}
                </p>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-navy">
                  {loading
                    ? "Loading..."
                    : analytics?.performance.avgDecisionTime || "0 min"}
                </p>
                <p className="text-xs text-muted-foreground">Avg Decision</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-orange">
                  {loading
                    ? "Loading..."
                    : analytics?.performance.passengersServed?.toLocaleString() ||
                      "0"}
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
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.affectedPassengers?.toLocaleString() ||
                      "0"}
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
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.highPriority?.toLocaleString() ||
                      "0"}
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
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.rebookings?.toLocaleString() ||
                      "0"}
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
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.resolved?.toLocaleString() ||
                      "0"}
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
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading disrupted stations...
                </div>
              ) : analytics?.disruptedStations &&
                analytics.disruptedStations.length > 0 ? (
                analytics.disruptedStations.map((station, index) => {
                  const colorClasses = {
                    high: {
                      bg: "bg-red-50",
                      border: "border-red-200",
                      dot: "bg-red-500",
                      text: "text-red-900",
                      subtext: "text-red-600",
                      value: "text-red-700",
                    },
                    medium: {
                      bg: "bg-orange-50",
                      border: "border-orange-200",
                      dot: "bg-orange-500",
                      text: "text-orange-900",
                      subtext: "text-orange-600",
                      value: "text-orange-700",
                    },
                    low: {
                      bg: "bg-yellow-50",
                      border: "border-yellow-200",
                      dot: "bg-yellow-500",
                      text: "text-yellow-900",
                      subtext: "text-yellow-600",
                      value: "text-yellow-700",
                    },
                  }[station.severity];

                  return (
                    <div
                      key={station.code}
                      className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses.bg} ${colorClasses.border}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${colorClasses.dot}`}
                        ></div>
                        <div>
                          <p className={`font-semibold ${colorClasses.text}`}>
                            {station.name}
                          </p>
                          <p className={`text-xs ${colorClasses.subtext}`}>
                            {station.disruptedFlights} disrupted flights
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${colorClasses.value}`}
                        >
                          {station.passengersAffected.toLocaleString()}
                        </p>
                        <p className={`text-xs ${colorClasses.subtext}`}>
                          passengers affected
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No disrupted stations found
                </div>
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
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.recoveryRate || "0.0%"}
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
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.avgResolutionTime || "0.0h"}
              </p>
              <p className="text-xs text-green-600">Average resolution time</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Network Impact
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.networkImpact || "Low"}
              </p>
              <p className="text-xs text-purple-600">
                {loading
                  ? "Loading..."
                  : `${analytics?.operationalInsights.activeDisruptions || 0} active disruptions`}
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
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.criticalPriority || 0}
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
                  {loading
                    ? "Loading..."
                    : `${analytics?.operationalInsights.mostDisruptedRoute.route || "N/A"} - ${analytics?.operationalInsights.mostDisruptedRoute.impact || "No data"}`}
                </p>
              </div>
              <Badge
                className={`${
                  loading
                    ? "bg-gray-100 text-gray-700 border-gray-200"
                    : analytics?.operationalInsights.mostDisruptedRoute
                          .impact === "High Impact"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : analytics?.operationalInsights.mostDisruptedRoute
                            .impact === "Medium Impact"
                        ? "bg-orange-100 text-orange-700 border-orange-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                }`}
              >
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.mostDisruptedRoute.impact ||
                    "No Impact"}
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
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.activeFlights?.toLocaleString() ||
                          "0"}
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {loading
                        ? "Loading..."
                        : `${analytics?.networkOverview.dailyChange.activeFlights >= 0 ? "+" : ""}${analytics?.networkOverview.dailyChange.activeFlights || 0} from yesterday`}
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
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.disruptions || "0"}
                    </p>
                    <p className="text-xs text-red-600">
                      {loading
                        ? "Loading..."
                        : `${analytics?.operationalInsights.criticalPriority || 0} critical • ${analytics?.passengerImpact.affectedPassengers?.toLocaleString() || "0"} pax affected`}
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
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.totalPassengers?.toLocaleString() ||
                          "0"}
                    </p>
                    <p className="text-xs text-red-600">
                      {loading
                        ? "Loading..."
                        : `${analytics?.networkOverview.disruptions && analytics?.networkOverview.totalPassengers ? ((analytics.passengerImpact.affectedPassengers / analytics.networkOverview.totalPassengers) * 100).toFixed(1) : "0.0"}% disrupted today`}
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
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.otpPerformance || "0.0%"}
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Real-time performance
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
