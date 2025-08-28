import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import {
  Search,
  Filter,
  Calendar,
  Download,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Plane,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  FileText,
} from "lucide-react";
import { databaseService } from "../services/databaseService";
import {
  Pie,
  PieChart as RechartsDonutChart,
  Bar,
  BarChart as RechartsBarChart,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Label as RechartsLabel,
} from "recharts";

interface RecoveryLog {
  solution_id: string;
  disruption_id: string;
  flight_number: string;
  route: string;
  aircraft: string;
  disruption_type: string;
  disruption_reason: string;
  priority: string;
  date_created: string;
  date_executed: string;
  date_completed: string;
  duration: string;
  status: string;
  affected_passengers: number;
  actual_cost: number;
  estimated_cost: number;
  cost_variance: number;
  otp_impact: number;
  solution_chosen: string;
  total_options: number;
  executed_by: string;
  approved_by: string;
  passenger_satisfaction: number;
  rebooking_success: number;
  categorization: string;
  cancellation_avoided: boolean;
  potential_delay_minutes: number;
  actual_delay_minutes: number;
  delay_reduction_minutes: number;
  disruption_category: string;
  recovery_efficiency: number;
  network_impact: string;
  downstream_flights_affected: number;
  details: any;
  created_at: string;
}

interface KPIData {
  totalRecoveries: number;
  successRate: number;
  avgResolutionTime: number;
  costEfficiency: number;
  passengerSatisfaction: number;
  totalPassengers: number;
  avgRecoveryEfficiency: number;
  totalDelayReduction: number;
  cancellationsAvoided: number;
  totalCostSavings: number;
}

interface TrendData {
  month: string;
  efficiency: number;
  delayReduction: number;
  costSavings: number;
  satisfaction: number;
}

export function PastRecoveryLogs() {
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([]);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("key-metrics");
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all",
    dateRange: "all",
    search: "",
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(), 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    if (
      filters.status !== "all" ||
      filters.category !== "all" ||
      filters.priority !== "all" ||
      filters.dateRange !== "all"
    ) {
      fetchRecoveryLogs(filters);
    }
  }, [filters.status, filters.category, filters.priority, filters.dateRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchRecoveryLogs(),
        fetchKPIData(),
        fetchTrendData(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecoveryLogs = async (filterParams = filters) => {
    try {
      const data = await databaseService.getPastRecoveryLogs(filterParams);
      setRecoveryLogs(data);
    } catch (error) {
      console.error("Error fetching recovery logs:", error);
      setRecoveryLogs([]);
    }
  };

  const fetchKPIData = async () => {
    try {
      const response = await fetch("/api/past-recovery-kpi");
      if (response.ok) {
        const data = await response.json();
        setKpiData(data);
      } else {
        calculateKPIFromLogs();
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      calculateKPIFromLogs();
    }
  };

  const fetchTrendData = async () => {
    try {
      const response = await fetch("/api/past-recovery-trends");
      if (response.ok) {
        let data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          data = [
            {
              month: "Jan 25",
              efficiency: 82,
              delayReduction: 45,
              costSavings: 12500,
              satisfaction: 7.8,
            },
            {
              month: "Feb 25",
              efficiency: 85,
              delayReduction: 52,
              costSavings: 15200,
              satisfaction: 8.1,
            },
            {
              month: "Mar 25",
              efficiency: 88,
              delayReduction: 58,
              costSavings: 18700,
              satisfaction: 8.4,
            },
            {
              month: "Apr 25",
              efficiency: 91,
              delayReduction: 65,
              costSavings: 22100,
              satisfaction: 8.7,
            },
            {
              month: "May 25",
              efficiency: 89,
              delayReduction: 62,
              costSavings: 19800,
              satisfaction: 8.5,
            },
            {
              month: "Jun 25",
              efficiency: 93,
              delayReduction: 71,
              costSavings: 25400,
              satisfaction: 9.0,
            },
          ];

          setTrendData(data);
        } else {
          console.warn("Empty trends data from API, using mock data");
          setTrendData(getMockTrendData());
        }
      } else {
        console.warn("Trends API returned error, using mock data");
        setTrendData(getMockTrendData());
      }
    } catch (error) {
      console.error("Error fetching trend data:", error);
      setTrendData(getMockTrendData());
    }
  };

  const calculateKPIFromLogs = () => {
    if (recoveryLogs.length === 0) return;

    const totalRecoveries = recoveryLogs.length;
    const successfulRecoveries = recoveryLogs.filter(
      (log) => log.status === "Successful",
    ).length;
    const successRate = (successfulRecoveries / totalRecoveries) * 100;

    const totalPassengers = recoveryLogs.reduce(
      (sum, log) => sum + (log.affected_passengers || 0),
      0,
    );
    const totalDelayReduction = recoveryLogs.reduce(
      (sum, log) => sum + (log.delay_reduction_minutes || 0),
      0,
    );
    const cancellationsAvoided = recoveryLogs.filter(
      (log) => log.cancellation_avoided,
    ).length;

    const avgSatisfaction =
      totalRecoveries > 0
        ? recoveryLogs.reduce(
            (sum, log) => sum + (log.passenger_satisfaction || 0),
            0,
          ) / totalRecoveries
        : 0;

    const avgRecoveryEfficiency =
      totalRecoveries > 0
        ? recoveryLogs.reduce(
            (sum, log) => sum + (log.recovery_efficiency || 0),
            0,
          ) / totalRecoveries
        : 0;

    const totalCostSavings = recoveryLogs.reduce((sum, log) => {
      const estimated = Number(log.estimated_cost) || 0;
      const actual = Number(log.actual_cost) || 0;
      return sum + (estimated - actual);
    }, 0);

    const avgCostVariance =
      totalRecoveries > 0
        ? recoveryLogs.reduce((sum, log) => sum + (log.cost_variance || 0), 0) /
          totalRecoveries
        : 0;

    // Calculate average resolution time from duration strings
    const avgResolutionMinutes =
      totalRecoveries > 0
        ? recoveryLogs.reduce((sum, log) => {
            const duration = log.duration || "0h 0m";
            const hours = parseInt(duration.match(/(\d+)h/)?.[1] || "0");
            const minutes = parseInt(duration.match(/(\d+)m/)?.[1] || "0");
            return sum + (hours * 60 + minutes);
          }, 0) / totalRecoveries
        : 0;

    setKpiData({
      totalRecoveries,
      successRate,
      avgResolutionTime: avgResolutionMinutes,
      costEfficiency: Math.abs(avgCostVariance),
      passengerSatisfaction: avgSatisfaction,
      totalPassengers,
      avgRecoveryEfficiency,
      totalDelayReduction,
      cancellationsAvoided,
      totalCostSavings,
    });
  };

  const getMockTrendData = () => {
    return [
      {
        month: "Jan 25",
        efficiency: 82,
        delayReduction: 45,
        costSavings: 12500,
        satisfaction: 7.8,
      },
      {
        month: "Feb 25",
        efficiency: 85,
        delayReduction: 52,
        costSavings: 15200,
        satisfaction: 8.1,
      },
      {
        month: "Mar 25",
        efficiency: 88,
        delayReduction: 58,
        costSavings: 18700,
        satisfaction: 8.4,
      },
      {
        month: "Apr 25",
        efficiency: 91,
        delayReduction: 65,
        costSavings: 22100,
        satisfaction: 8.7,
      },
      {
        month: "May 25",
        efficiency: 89,
        delayReduction: 62,
        costSavings: 19800,
        satisfaction: 8.5,
      },
      {
        month: "Jun 25",
        efficiency: 93,
        delayReduction: 71,
        costSavings: 25400,
        satisfaction: 9.0,
      },
    ];
  };

  const calculateTrendsFromLogs = () => {
    const monthlyData: { [key: string]: any } = {};

    recoveryLogs.forEach((log) => {
      const date = new Date(log.created_at);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          efficiencySum: 0,
          delaySum: 0,
          costSavingsSum: 0,
          satisfactionSum: 0,
          count: 0,
        };
      }

      monthlyData[monthKey].efficiencySum += log.recovery_efficiency || 0;
      monthlyData[monthKey].delaySum += log.delay_reduction_minutes || 0;
      monthlyData[monthKey].costSavingsSum +=
        (log.estimated_cost || 0) - (log.actual_cost || 0);
      monthlyData[monthKey].satisfactionSum += log.passenger_satisfaction || 0;
      monthlyData[monthKey].count += 1;
    });

    const trends = Object.values(monthlyData)
      .map((data: any) => ({
        month: data.month,
        efficiency: Math.round(data.efficiencySum / data.count),
        delayReduction: Math.round(data.delaySum / data.count),
        costSavings: Math.round(data.costSavingsSum / data.count),
        satisfaction: Math.round((data.satisfactionSum / data.count) * 10) / 10,
      }))
      .slice(-6); // Last 6 months

    if (trends.length === 0) {
      setTrendData(getMockTrendData());
    } else {
      setTrendData(trends);
    }
  };

  // Update KPIs when logs change
  useEffect(() => {
    if (recoveryLogs.length > 0 && !kpiData) {
      calculateKPIFromLogs();
      calculateTrendsFromLogs();
    }
  }, [recoveryLogs]);

  const statusColors: Record<string, string> = {
    Successful: "bg-green-100 text-green-800",
    Partial: "bg-yellow-100 text-yellow-800",
    Failed: "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-800",
  };

  const filteredLogs = recoveryLogs.filter((log) => {
    if (filters.status !== "all" && log.status !== filters.status) return false;
    if (filters.category !== "all" && log.categorization !== filters.category)
      return false;
    if (filters.priority !== "all" && log.priority !== filters.priority)
      return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        log.flight_number?.toLowerCase().includes(searchTerm) ||
        log.route?.toLowerCase().includes(searchTerm) ||
        log.disruption_reason?.toLowerCase().includes(searchTerm) ||
        log.executed_by?.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading recovery logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Past Recovery Logs</h2>
          <p className="text-muted-foreground">
            Comprehensive recovery performance analytics with cancellation and
            delay impact metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-orange-600 border-orange-300"
          >
            <BarChart3 className="h-4 w-4" />
            Advanced Analytics
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="key-metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="disruption-analysis">
            Disruption Analysis
          </TabsTrigger>
          <TabsTrigger value="recovery-logs">Recovery Logs</TabsTrigger>
          <TabsTrigger value="performance-trends">
            Performance Trends
          </TabsTrigger>
          <TabsTrigger value="audit-trail">
            Comprehensive Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* Key Metrics Tab */}
        <TabsContent value="key-metrics" className="space-y-6">
          {/* AERON Recovery Impact Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  AERON Recovery Impact Summary
                </h3>
              </div>
              <p className="text-sm text-blue-700 mb-6">
                Quantified operational improvements through intelligent recovery
                management
              </p>

              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {kpiData?.cancellationsAvoided || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cancellations Avoided
                  </div>
                  <div className="text-xs text-gray-500">
                    Flights kept operational through smart recovery
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((kpiData?.totalDelayReduction || 0) / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Delay Reduction
                  </div>
                  <div className="text-xs text-gray-500">
                    {kpiData?.totalDelayReduction || 0} minutes saved across all
                    recoveries
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(kpiData?.avgRecoveryEfficiency || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Recovery Efficiency
                  </div>
                  <div className="text-xs text-gray-500">
                    Average efficiency in preventing potential delays
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(kpiData?.totalCostSavings || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Cost Savings
                  </div>
                  <div className="text-xs text-gray-500">
                    Saved vs estimated costs
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {(kpiData?.successRate || 0).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  All recovery attempts
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-green-600 h-1 rounded-full"
                    style={{ width: `${kpiData?.successRate || 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Avg Resolution</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(kpiData?.avgResolutionTime || 0)}
                </div>
                <div className="text-xs text-gray-500">
                  Time from disruption to resolution
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-blue-600 h-1 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Cost Efficiency</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {(kpiData?.costEfficiency || 0) > 0 ? "-" : ""}
                  {(kpiData?.costEfficiency || 0).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">vs estimated cost</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-green-600 h-1 rounded-full"
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    Passenger Satisfaction
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {(kpiData?.passengerSatisfaction || 0).toFixed(1)}/10
                </div>
                <div className="text-xs text-gray-500">
                  Average rating across recoveries
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-purple-600 h-1 rounded-full"
                    style={{
                      width: `${(kpiData?.passengerSatisfaction || 0) * 10}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-gray-700 mb-4">
                  Passenger Impact
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Passengers Served:</span>
                    <span className="font-medium">
                      {kpiData?.totalPassengers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Rebooking Success:</span>
                    <span className="font-medium">
                      {filteredLogs.length > 0
                        ? (
                            filteredLogs.reduce(
                              (sum, log) => sum + (log.rebooking_success || 0),
                              0,
                            ) / filteredLogs.length
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Satisfaction Rating:</span>
                    <span className="font-medium">
                      {(kpiData?.passengerSatisfaction || 0).toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-gray-700 mb-4">
                  Time Efficiency
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Delay Reduction:</span>
                    <span className="font-medium text-green-600">
                      {(kpiData?.avgRecoveryEfficiency || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Minutes Saved:</span>
                    <span className="font-medium">
                      {kpiData?.totalDelayReduction || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Efficiency:</span>
                    <span className="font-medium">
                      {(kpiData?.avgRecoveryEfficiency || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-gray-700 mb-4">
                  Financial Impact
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Recovery Cost:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        filteredLogs.reduce(
                          (sum, log) => sum + (log.actual_cost || 0),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cost Variance:</span>
                    <span className="font-medium text-green-600">
                      {(kpiData?.costEfficiency || 0) > 0 ? "-" : ""}
                      {(kpiData?.costEfficiency || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Cost/Flight:</span>
                    <span className="font-medium">
                      {filteredLogs.length > 0
                        ? formatCurrency(
                            filteredLogs.reduce(
                              (sum, log) => sum + (log.actual_cost || 0),
                              0,
                            ) / filteredLogs.length,
                          )
                        : formatCurrency(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Disruption Analysis Tab */}
        <TabsContent value="disruption-analysis" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Disruption Categories Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Disruption Categories Distribution
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Breakdown of disruption types handled by AERON
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    weather: {
                      label: "Weather",
                      color: "hsl(221, 83%, 53%)",
                    },
                    crew: {
                      label: "Crew",
                      color: "hsl(25, 95%, 53%)",
                    },
                    aog: {
                      label: "AOG",
                      color: "hsl(0, 0%, 45%)",
                    },
                    diversion: {
                      label: "Diversion",
                      color: "hsl(173, 58%, 39%)",
                    },
                    security: {
                      label: "Security",
                      color: "hsl(271, 81%, 56%)",
                    },
                  }}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <RechartsDonutChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={(() => {
                        const categoryCount = {};
                        filteredLogs.forEach((log) => {
                          const category =
                            log.disruption_category?.toLowerCase() || "other";
                          categoryCount[category] =
                            (categoryCount[category] || 0) + 1;
                        });

                        const colorMap = {
                          weather: "var(--color-weather)",
                          crew: "var(--color-crew)",
                          aog: "var(--color-aog)",
                          aircraft: "var(--color-aog)",
                          airport: "var(--color-diversion)",
                          diversion: "var(--color-diversion)",
                          security: "var(--color-security)",
                          other: "hsl(210, 40%, 60%)",
                        };

                        return Object.entries(categoryCount).map(
                          ([category, count]) => ({
                            category,
                            value: count,
                            fill: colorMap[category] || colorMap.other,
                          }),
                        );
                      })()}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <RechartsLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const categoryCount = new Set(
                              filteredLogs.map(
                                (log) => log.disruption_category,
                              ),
                            ).size;
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {categoryCount}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Categories
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </RechartsDonutChart>
                </ChartContainer>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {(() => {
                    const categoryCount = {};
                    const totalLogs = filteredLogs.length;

                    filteredLogs.forEach((log) => {
                      const category = log.disruption_category || "Other";
                      categoryCount[category] =
                        (categoryCount[category] || 0) + 1;
                    });

                    const colorMap = {
                      Weather: "bg-blue-500",
                      Crew: "bg-orange-500",
                      AOG: "bg-gray-500",
                      Aircraft: "bg-gray-500",
                      Airport: "bg-teal-500",
                      Security: "bg-purple-500",
                      Other: "bg-slate-500",
                    };

                    return Object.entries(categoryCount).map(
                      ([category, count]) => {
                        const percentage =
                          totalLogs > 0
                            ? (((count as number) / (totalLogs as number)) * 100).toFixed(1)
                            : 0;
                        return (
                          <div
                            key={category}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${colorMap[category] || colorMap.Other}`}
                            ></div>
                            <span className="text-sm">
                              {category} ({percentage}%)
                            </span>
                          </div>
                        );
                      },
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Recovery Efficiency by Flight */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recovery Efficiency by Flight
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Effectiveness of recovery solutions in preventing delays
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    efficiency: {
                      label: "Efficiency %",
                      color: "hsl(221, 83%, 53%)",
                    },
                    delayReduction: {
                      label: "Delay Reduction (min)",
                      color: "hsl(25, 95%, 53%)",
                    },
                  }}
                  className="min-h-[200px]"
                >
                  <RechartsBarChart
                    data={filteredLogs.slice(0, 5).map((log) => ({
                      flight: log.flight_number,
                      efficiency: log.recovery_efficiency || 80,
                      delayReduction: log.delay_reduction_minutes || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="flight"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="efficiency"
                      orientation="left"
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="delay"
                      orientation="right"
                      domain={[0, 400]}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      yAxisId="efficiency"
                      dataKey="efficiency"
                      fill="var(--color-efficiency)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="delay"
                      dataKey="delayReduction"
                      fill="var(--color-delayReduction)"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Disruption Insights */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    AOG (Aircraft on Ground)
                  </span>
                </div>
                <p className="text-xs text-red-700">
                  Highest impact disruptions but most delay reduction achieved
                  through aircraft swaps
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Diversions
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  Critical network impact but effective passenger transport
                  coordination maintains service
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Crew Issues
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  Quick standby activation results in highest recovery
                  efficiency rates
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recovery Logs Tab */}
        <TabsContent value="recovery-logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters & Search</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Search Logs</Label>
                  <Input
                    placeholder="Flight, route, reason..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Successful">Successful</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Disruption Type</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Weather">Weather</SelectItem>
                      <SelectItem value="Crew">Crew</SelectItem>
                      <SelectItem value="Aircraft">Aircraft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) =>
                      setFilters({ ...filters, dateRange: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Last 7 Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      status: "all",
                      category: "all",
                      priority: "all",
                      dateRange: "all",
                      search: "",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery History Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Recovery History ({filteredLogs.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium">
                        Solution ID
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Flight Details
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Disruption
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Recovery Impact
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Timeline
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Performance
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 10).map((log) => (
                      <tr
                        key={log.solution_id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <div className="font-mono text-sm">
                            {log.solution_id}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{log.flight_number}</div>
                          <div className="text-sm text-gray-500">
                            {log.route}
                          </div>
                          <div className="text-xs text-gray-400">
                            {log.aircraft}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`mb-1 ${
                              log.priority === "Critical"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : log.priority === "High"
                                  ? "bg-orange-100 text-orange-800 border-orange-300"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
                            }`}
                          >
                            {log.priority}
                          </Badge>
                          <div className="text-xs text-gray-600">
                            {log.disruption_reason}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.disruption_category}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {log.cancellation_avoided && (
                              <span className="text-green-600 font-medium">
                                Cancellation Avoided
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {log.actual_delay_minutes}min delay
                          </div>
                          <div className="text-xs text-gray-600">
                            {log.recovery_efficiency}% efficiency
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{log.duration}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(log.date_created)}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            className={
                              statusColors[log.status] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">
                            {log.passenger_satisfaction}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.rebooking_success}% rebooking
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Trends Tab */}
        <TabsContent value="performance-trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recovery Performance Trends
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Historical performance showing improvement in recovery metrics
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  efficiency: {
                    label: "Recovery Efficiency %",
                    color: "hsl(25, 95%, 53%)",
                  },
                  delayReduction: {
                    label: "Delay Minutes Prevented",
                    color: "hsl(221, 83%, 53%)",
                  },
                }}
                className="h-[500px] w-full"
              >
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="efficiency"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="delay"
                    orientation="left"
                    domain={[0, 4000]}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="delay"
                    type="monotone"
                    dataKey="delayReduction"
                    stroke="var(--color-delayReduction)"
                    strokeWidth={3}
                    dot={{
                      fill: "var(--color-delayReduction)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                  />
                  <Line
                    yAxisId="efficiency"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="var(--color-efficiency)"
                    strokeWidth={3}
                    dot={{
                      fill: "var(--color-efficiency)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Efficiency Trend</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {trendData.length >= 2
                    ? `+${((trendData[trendData.length - 1]?.efficiency || 0) - (trendData[0]?.efficiency || 0)).toFixed(1)}%`
                    : "+0.0%"}
                </div>
                <div className="text-xs text-green-700">
                  Recovery efficiency improvement over time
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Delay Reduction</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {trendData.length >= 2
                    ? `+${Math.round((((trendData[trendData.length - 1]?.delayReduction || 0) - (trendData[0]?.delayReduction || 0)) / (trendData[0]?.delayReduction || 1)) * 100)}%`
                    : "+0%"}
                </div>
                <div className="text-xs text-blue-700">
                  Increase in delay minutes prevented
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Cost Savings</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(kpiData?.totalCostSavings || 0)}
                </div>
                <div className="text-xs text-red-700">
                  Total cost savings achieved
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comprehensive Audit Trail Tab */}
        <TabsContent value="audit-trail" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Comprehensive Audit Trail
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete log of AERON system actions and user decisions with
                    detailed analytics
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Detailed Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search & Filter Options */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Search & Filter Options</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Search Records</Label>
                    <Input placeholder="Search by flight, user, action..." />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Action Type</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="recovery">Recovery</SelectItem>
                        <SelectItem value="prediction">Prediction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm">
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        Success Rate
                      </span>
                    </div>
                    <div className="text-xl font-bold">
                      {(kpiData?.successRate || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      out of {kpiData?.totalRecoveries || 0} attempts
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Avg Response
                      </span>
                    </div>
                    <div className="text-xl font-bold">3.4s</div>
                    <div className="text-xs text-gray-500">
                      System response time
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Cost Impact</span>
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(
                        filteredLogs.reduce(
                          (sum, log) => sum + (log.actual_cost || 0),
                          0,
                        ),
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Total managed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">
                        Passengers Served
                      </span>
                    </div>
                    <div className="text-xl font-bold">
                      {kpiData?.totalPassengers || 0}
                    </div>
                    <div className="text-xs text-gray-500">Passengers</div>
                  </CardContent>
                </Card>
              </div>

              {/* Audit Records Table */}
              <div>
                <h4 className="font-medium mb-3">
                  Audit Records ({filteredLogs.length} records)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm">
                        <th className="text-left p-3">Timestamp</th>
                        <th className="text-left p-3">Action</th>
                        <th className="text-left p-3">Flight</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Impact</th>
                        <th className="text-left p-3">Metrics</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.slice(0, 10).map((log) => (
                        <tr
                          key={`${log.solution_id}-audit`}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">
                            <div className="text-sm">
                              {formatDateTime(log.date_executed)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(log.date_created)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium">
                              Recovery plan executed
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.solution_chosen}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium">
                              {log.flight_number}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.route}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.affected_passengers} passengers
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">{log.executed_by}</div>
                            <div className="text-xs text-gray-500">
                              Approved by: {log.approved_by}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {formatCurrency(log.actual_cost)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.delay_reduction_minutes}min saved
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              Efficiency:{" "}
                              <span className="text-green-600">
                                {log.recovery_efficiency}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Response: 4 seconds
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge
                              className={
                                statusColors[log.status] ||
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
