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
import { useAirlineTheme } from "../hooks/useAirlineTheme";

export function Dashboard() {
  const navigate = useNavigate();
  const { filters, setFilters, screenSettings, theme } = useAppContext(); // Added theme here
  const { airlineConfig } = useAirlineTheme();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: new Date().toISOString().split('T')[0] // Current date as default end date
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // Filter enabled screens based on user role and theme
  const enabledScreens = screenSettings.filter((screen) => {
    const userHasAccess = !screen.restrictedRoles || screen.restrictedRoles.includes(sessionStorage.getItem("userRole") || "");
    const isVisibleInTheme = !screen.theme || screen.theme.includes(theme);
    return screen.enabled && userHasAccess && isVisibleInTheme;
  });


  // Date filter options
  const dateFilterOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "date_range", label: "Date Range" },
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
    if (value === "date_range") {
      setShowDateRangePicker(true);
    } else {
      setShowDateRangePicker(false);
    }
  };

  // Handle custom date range change
  const handleCustomDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      // Convert dates to the format expected by the analytics service
      const formattedRange = `${customDateRange.startDate}_${customDateRange.endDate}`;
      fetchAnalyticsWithCustomRange(formattedRange);
    }
  };

  // Fetch analytics with custom date range
  const fetchAnalyticsWithCustomRange = async (dateRange: string) => {
    try {
      setLoading(true);
      const data = await dashboardAnalytics.getDashboardAnalytics(dateRange);
      console.log("Dashboard analytics loaded for custom range", dateRange, ":", data);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch dashboard analytics for custom range:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleCreateRecoveryPlan = (disruption: any) => {
  //   setSelectedDisruption(disruption);
  //   navigate("/disruption");
  // };

  const navigateToScreen = (screenId: string) => {
    const screen = screenSettings.find((s) => s.id === screenId); // Use screenSettings directly
    if (screen && screen.enabled) {
      // Check for role restrictions before navigating
      const userRole = sessionStorage.getItem("userRole");
      if (!screen.restrictedRoles || screen.restrictedRoles.includes(userRole || "")) {
        navigate(`/${screenId}`);
      } else {
        console.log(`Access denied for screen: ${screenId} due to role restrictions.`);
        // Optionally, show a message to the user or redirect to an "Access Denied" page
      }
    } else {
      console.log(`Screen not found or disabled: ${screenId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-flydubai-navy'}`}>Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time flight operations and recovery analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-flydubai-blue'}`} />
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className={`w-40 ${theme === 'dark' ? 'border-white/30 focus:border-white bg-gray-800 text-white' : 'border-flydubai-blue/30 focus:border-flydubai-blue'}`}>
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

          {showDateRangePicker && (
            <div className={`flex items-center gap-2 p-3 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Start Date</label>
                <Input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => handleCustomDateRangeChange('startDate', e.target.value)}
                  max={customDateRange.endDate || new Date().toISOString().split('T')[0]}
                  className={`w-36 text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>End Date</label>
                <Input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => handleCustomDateRangeChange('endDate', e.target.value)}
                  min={customDateRange.startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-36 text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
              <div className="flex gap-1 pt-4">
                <Button
                  size="sm"
                  onClick={applyCustomDateRange}
                  disabled={!customDateRange.startDate || !customDateRange.endDate}
                  className={`text-xs px-3 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-flydubai-blue hover:bg-blue-700 text-white'}`}
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowDateRangePicker(false);
                    setDateFilter("today");
                  }}
                  className={`text-xs px-3 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      <Alert className={`border-flydubai-orange ${theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50'}`}>
        <AlertTriangle className={`h-4 w-4 ${theme === 'dark' ? 'text-orange-400' : 'text-flydubai-orange'}`} />
        <AlertDescription className={`${theme === 'dark' ? 'text-orange-200' : 'text-orange-800'}`}>
          <strong>Active Disruptions:</strong>{" "}
          {loading
            ? "Loading..."
            : `${analytics?.operationalInsights.activeDisruptions || 0} Flydubai flights currently disrupted`}
          . AERON recovery plans available.
        </AlertDescription>
      </Alert>

      {/* Quick Analytics Banner */}
      <Card className={`bg-gradient-flydubai-light border-blue-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <BarChart3 className={`h-8 w-8 ${theme === 'dark' ? 'text-white' : 'text-flydubai-blue'}`} />
                <div className={`absolute -inset-1 ${theme === 'dark' ? 'bg-white' : 'bg-flydubai-blue'} rounded-lg opacity-10 blur-sm`}></div>
              </div>
              <div>
                <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-flydubai-navy'}`}>
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
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-flydubai-blue'}`}>
                  {loading
                    ? "Loading..."
                    : analytics?.performance.costSavings || "AED 0K"}
                </p>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-flydubai-navy'}`}>
                  {loading
                    ? "Loading..."
                    : analytics?.performance.avgDecisionTime || "0 min"}
                </p>
                <p className="text-xs text-muted-foreground">Avg Decision</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-orange-400' : 'text-flydubai-orange'}`}>
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
                className={`border-flydubai-blue text-flydubai-blue hover:bg-blue-50 ${theme === 'dark' ? 'border-white text-white hover:bg-gray-700' : ''}`}
              >
                View Full Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Impact & Disruption Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`border-orange-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
              <Users className={`h-5 w-5 ${theme === 'dark' ? 'text-orange-400' : 'text-flydubai-orange'}`} />
              Passenger Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className={`bg-red-50 p-4 rounded-lg border ${theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`h-4 w-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-red-200' : 'text-red-900'}`}>
                    Affected Passengers
                  </span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.affectedPassengers?.toLocaleString() ||
                      "0"}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Across all disruptions</p>
              </div>
              <div className={`bg-yellow-50 p-4 rounded-lg border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-900'}`}>
                    High Priority
                  </span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.highPriority?.toLocaleString() ||
                      "0"}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Need immediate attention
                </p>
              </div>
              <div className={`bg-blue-50 p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Plane className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
                    Rebookings
                  </span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.rebookings?.toLocaleString() ||
                      "0"}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Successfully rebooked</p>
              </div>
              <div className={`bg-green-50 p-4 rounded-lg border ${theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'border-green-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-200' : 'text-green-900'}`}>
                    Resolved
                  </span>
                </div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                  {loading
                    ? "Loading..."
                    : analytics?.passengerImpact.resolved?.toLocaleString() ||
                      "0"}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Passengers accommodated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-purple-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
              <MapPin className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              Highly Disrupted Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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

                  const darkColorClasses = {
                    high: {
                      bg: "bg-red-900/20",
                      border: "border-red-700",
                      dot: "bg-red-400",
                      text: "text-red-200",
                      subtext: "text-red-300",
                      value: "text-red-300",
                    },
                    medium: {
                      bg: "bg-orange-900/20",
                      border: "border-orange-700",
                      dot: "bg-orange-400",
                      text: "text-orange-200",
                      subtext: "text-orange-300",
                      value: "text-orange-300",
                    },
                    low: {
                      bg: "bg-yellow-900/20",
                      border: "border-yellow-700",
                      dot: "bg-yellow-400",
                      text: "text-yellow-200",
                      subtext: "text-yellow-300",
                      value: "text-yellow-300",
                    },
                  };

                  const currentBg = theme === 'dark' ? darkColorClasses[station.severity].bg : colorClasses.bg;
                  const currentBorder = theme === 'dark' ? darkColorClasses[station.severity].border : colorClasses.border;
                  const currentDot = theme === 'dark' ? darkColorClasses[station.severity].dot : colorClasses.dot;
                  const currentText = theme === 'dark' ? darkColorClasses[station.severity].text : colorClasses.text;
                  const currentSubtext = theme === 'dark' ? darkColorClasses[station.severity].subtext : colorClasses.subtext;
                  const currentValue = theme === 'dark' ? darkColorClasses[station.severity].value : colorClasses.value;

                  return (
                    <div
                      key={station.code}
                      className={`flex items-center justify-between p-3 rounded-lg border ${currentBg} ${currentBorder}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${currentDot}`}
                        ></div>
                        <div>
                          <p className={`font-semibold ${currentText}`}>
                            {station.name}
                          </p>
                          <p className={`text-xs ${currentSubtext}`}>
                            {station.disruptedFlights} disrupted flights
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${currentValue}`}
                        >
                          {station.passengersAffected.toLocaleString()}
                        </p>
                        <p className={`text-xs ${currentSubtext}`}>
                          passengers affected
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No disrupted stations found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Operational Insights */}
      <Card className={`border-blue-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
            <Activity className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            Key Operational Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border ${theme === 'dark' ? 'from-blue-900/20 to-blue-900/40 border-blue-700' : 'border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
                  Recovery Rate
                </span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.recoveryRate || "0.0%"}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Real-time calculation</p>
            </div>

            <div className={`bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border ${theme === 'dark' ? 'from-green-900/20 to-green-900/40 border-green-700' : 'border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-200' : 'text-green-900'}`}>
                  Avg Resolution
                </span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.avgResolutionTime || "0.0h"}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>Average resolution time</p>
            </div>

            <div className={`bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border ${theme === 'dark' ? 'from-purple-900/20 to-purple-900/40 border-purple-700' : 'border-purple-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Globe className={`h-4 w-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>
                  Network Impact
                </span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.networkImpact || "Low"}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {loading
                  ? "Loading..."
                  : `${analytics?.operationalInsights.activeDisruptions || 0} active disruptions`}
              </p>
            </div>

            <div className={`bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border ${theme === 'dark' ? 'from-orange-900/20 to-orange-900/40 border-orange-700' : 'border-orange-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-4 w-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-orange-200' : 'text-orange-900'}`}>
                  Critical Priority
                </span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-orange-300' : 'text-orange-800'}`}>
                {loading
                  ? "Loading..."
                  : analytics?.operationalInsights.criticalPriority || 0}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                Require immediate action
              </p>
            </div>
          </div>

          <div className={`mt-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Most Disrupted Route
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {loading
                    ? "Loading..."
                    : `${analytics?.operationalInsights.mostDisruptedRoute.route || "N/A"} - ${analytics?.operationalInsights.mostDisruptedRoute.impact || "No data"}`}
                </p>
              </div>
              <Badge
                className={`${
                  loading
                    ? ` ${theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`
                    : analytics?.operationalInsights.mostDisruptedRoute
                          .impact === "High Impact"
                      ? ` ${theme === 'dark' ? 'bg-red-600 text-white border-red-500' : 'bg-red-100 text-red-700 border-red-200'}`
                      : analytics?.operationalInsights.mostDisruptedRoute
                            .impact === "Medium Impact"
                        ? ` ${theme === 'dark' ? 'bg-orange-600 text-white border-orange-500' : 'bg-orange-100 text-orange-700 border-orange-200'}`
                        : ` ${theme === 'dark' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`
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
      <Card className={`border-flydubai-blue/30 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
            <Radar className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-flydubai-blue'}`} />
            Global Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className={`bg-blue-50 border-blue-200 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Plane className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-flydubai-blue'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Flights
                    </p>
                    <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-flydubai-blue'}`}>
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.activeFlights?.toLocaleString() ||
                          "0"}
                    </p>
                    <p className={`text-xs text-green-600 flex items-center gap-1 ${theme === 'dark' ? 'text-green-400' : ''}`}>
                      <TrendingUp className="h-3 w-3" />
                      {loading
                        ? "Loading..."
                        : `${analytics?.networkOverview.dailyChange.activeFlights >= 0 ? "+" : ""}${analytics?.networkOverview.dailyChange.activeFlights || 0} from yesterday`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-orange-50 border-orange-200 ${theme === 'dark' ? 'bg-orange-900/20 border-orange-700' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${theme === 'dark' ? 'text-orange-400' : 'text-flydubai-orange'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Disruptions</p>
                    <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-orange-300' : 'text-flydubai-orange'}`}>
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.disruptions || "0"}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      {loading
                        ? "Loading..."
                        : `${analytics?.operationalInsights.criticalPriority || 0} critical • ${analytics?.passengerImpact.affectedPassengers?.toLocaleString() || "0"} pax affected`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-purple-50 border-purple-200 ${theme === 'dark' ? 'bg-purple-900/20 border-purple-700' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Passengers
                    </p>
                    <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.totalPassengers?.toLocaleString() ||
                          "0"}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      {loading
                        ? "Loading..."
                        : `${analytics?.networkOverview.disruptions && analytics?.networkOverview.totalPassengers ? ((analytics.passengerImpact.affectedPassengers / analytics.networkOverview.totalPassengers) * 100).toFixed(1) : "0.0"}% disrupted today`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-green-50 border-green-200 ${theme === 'dark' ? 'bg-green-900/20 border-green-700' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      OTP Performance
                    </p>
                    <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
                      {loading
                        ? "Loading..."
                        : analytics?.networkOverview.otpPerformance || "0.0%"}
                    </p>
                    <p className={`text-xs text-green-600 flex items-center gap-1 ${theme === 'dark' ? 'text-green-400' : ''}`}>
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
      <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
            <Filter className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-flydubai-blue'}`} />
            Flydubai Network Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                Flight Number
              </label>
              <Input
                placeholder="FZ123"
                value={filters.flightNumber}
                onChange={(e) =>
                  setFilters({ ...filters, flightNumber: e.target.value })
                }
                className={`input-flydubai ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              />
            </div>
            <div>
              <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Station</label>
              <Select
                value={filters.station}
                onValueChange={(value) =>
                  setFilters({ ...filters, station: value })
                }
              >
                <SelectTrigger className={`select-flydubai ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-white' : ''}`}>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
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
              <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Region</label>
              <Select
                value={filters.region}
                onValueChange={(value) =>
                  setFilters({ ...filters, region: value })
                }
              >
                <SelectTrigger className={`select-flydubai ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-white' : ''}`}>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
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
              <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                Date/Time
              </label>
              <Input
                type="datetime-local"
                value={filters.dateTime}
                onChange={(e) =>
                  setFilters({ ...filters, dateTime: e.target.value })
                }
                className={`input-flydubai ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
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
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <AlertCircle className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Active Disruptions
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "recovery") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("recovery")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <Zap className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Recovery Options
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "passengers") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("passengers")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <UserCheck className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Passenger Services
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "flight-tracking") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("flight-tracking")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <Plane className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Flight Tracking
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "fuel-optimization") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("fuel-optimization")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <Fuel className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Fuel Optimization
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "maintenance") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("maintenance")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <Wrench className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Aircraft Maintenance
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "hotac") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("hotac")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <Hotel className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            HOTAC Management
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "pending") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("pending")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <ClockIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Pending Solutions
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "past-logs") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("past-logs")}
            className={`flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-gray-700 hover:text-white border-gray-600' : 'hover:bg-blue-50 hover:text-flydubai-blue border-blue-200'}`}
          >
            <CheckSquare className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : ''}`} />
            Past Recovery Logs
          </Button>
        )}
      </div>
    </div>
  );
}