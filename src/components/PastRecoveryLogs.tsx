
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart'
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
  FileText
} from 'lucide-react'
import { databaseService } from '../services/databaseService'
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
  Label as RechartsLabel
} from 'recharts'

interface RecoveryLog {
  solution_id: string
  disruption_id: string
  flight_number: string
  route: string
  aircraft: string
  disruption_type: string
  disruption_reason: string
  priority: string
  date_created: string
  date_executed: string
  date_completed: string
  duration: string
  status: string
  affected_passengers: number
  actual_cost: number
  estimated_cost: number
  cost_variance: number
  otp_impact: number
  solution_chosen: string
  total_options: number
  executed_by: string
  approved_by: string
  passenger_satisfaction: number
  rebooking_success: number
  categorization: string
  cancellation_avoided: boolean
  potential_delay_minutes: number
  actual_delay_minutes: number
  delay_reduction_minutes: number
  disruption_category: string
  recovery_efficiency: number
  network_impact: string
  downstream_flights_affected: number
  details: any
  created_at: string
}

export function PastRecoveryLogs() {
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('key-metrics')
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    dateRange: 'all',
    search: ''
  })

  useEffect(() => {
    fetchRecoveryLogs()
    const interval = setInterval(() => fetchRecoveryLogs(), 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  // Refetch data when filters change
  useEffect(() => {
    if (filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.dateRange !== 'all') {
      fetchRecoveryLogs(filters)
    }
  }, [filters.status, filters.category, filters.priority, filters.dateRange])

  const fetchRecoveryLogs = async (filterParams = filters) => {
    try {
      setLoading(true)
      const data = await databaseService.getPastRecoveryLogs(filterParams)
      setRecoveryLogs(data)
    } catch (error) {
      console.error('Error fetching recovery logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    'Successful': 'bg-green-100 text-green-800',
    'Partial': 'bg-yellow-100 text-yellow-800', 
    'Failed': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  }

  const filteredLogs = recoveryLogs.filter(log => {
    if (filters.status !== 'all' && log.status !== filters.status) return false
    if (filters.category !== 'all' && log.categorization !== filters.category) return false
    if (filters.priority !== 'all' && log.priority !== filters.priority) return false
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = 
        log.flight_number?.toLowerCase().includes(searchTerm) ||
        log.route?.toLowerCase().includes(searchTerm) ||
        log.disruption_reason?.toLowerCase().includes(searchTerm) ||
        log.executed_by?.toLowerCase().includes(searchTerm)
      if (!matchesSearch) return false
    }
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDuration = (duration: string | null) => {
    if (!duration) return 'N/A'
    return duration
  }

  const totalLogs = filteredLogs.length
  const successfulLogs = filteredLogs.filter(log => log.status === 'Successful').length
  const totalSavings = filteredLogs.reduce((sum, log) => {
    const estimated = Number(log.estimated_cost) || 0
    const actual = Number(log.actual_cost) || 0
    return sum + (estimated - actual)
  }, 0)
  const avgSatisfaction = totalLogs > 0 
    ? filteredLogs.reduce((sum, log) => sum + (Number(log.passenger_satisfaction) || 0), 0) / totalLogs 
    : 0
  const totalPassengers = filteredLogs.reduce((sum, log) => sum + (Number(log.affected_passengers) || 0), 0)
  const avgRecoveryEfficiency = totalLogs > 0
    ? filteredLogs.reduce((sum, log) => sum + (Number(log.recovery_efficiency) || 0), 0) / totalLogs
    : 0
  const totalDelayReduction = filteredLogs.reduce((sum, log) => sum + (Number(log.delay_reduction_minutes) || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading recovery logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Past Recovery Logs</h2>
          <p className="text-muted-foreground">
            Comprehensive recovery performance analytics with cancellation and delay impact metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2 text-orange-600 border-orange-300">
            <BarChart3 className="h-4 w-4" />
            Advanced Analytics
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="key-metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="disruption-analysis">Disruption Analysis</TabsTrigger>
          <TabsTrigger value="recovery-logs">Recovery Logs</TabsTrigger>
          <TabsTrigger value="performance-trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="audit-trail">Comprehensive Audit Trail</TabsTrigger>
        </TabsList>

        {/* Key Metrics Tab */}
        <TabsContent value="key-metrics" className="space-y-6">
          {/* AERON Recovery Impact Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">AERON Recovery Impact Summary</h3>
              </div>
              <p className="text-sm text-blue-700 mb-6">Quantified operational improvements through intelligent recovery management</p>
              
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{filteredLogs.filter(log => log.cancellation_avoided).length}</div>
                  <div className="text-sm text-gray-600">Cancellations Avoided</div>
                  <div className="text-xs text-gray-500">Flights kept operational through smart recovery</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(totalDelayReduction / 60)}h</div>
                  <div className="text-sm text-gray-600">Total Delay Reduction</div>
                  <div className="text-xs text-gray-500">{totalDelayReduction} minutes saved across all recoveries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{avgRecoveryEfficiency.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Recovery Efficiency</div>
                  <div className="text-xs text-gray-500">Average efficiency in preventing potential delays</div>
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
                <div className="text-2xl font-bold text-green-600">100.0%</div>
                <div className="text-xs text-gray-500">All recovery attempts</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-green-600 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Avg Resolution</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">3h 13m</div>
                <div className="text-xs text-gray-500">Time from disruption to resolution</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-blue-600 h-1 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Cost Efficiency</span>
                </div>
                <div className="text-2xl font-bold text-green-600">-3.7%</div>
                <div className="text-xs text-gray-500">vs estimated cost</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-green-600 h-1 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Passenger Satisfaction</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">8.1/10</div>
                <div className="text-xs text-gray-500">Average rating across recoveries</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div className="bg-purple-600 h-1 rounded-full" style={{ width: '81%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-gray-700 mb-4">Passenger Impact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Passengers Served:</span>
                    <span className="font-medium">891</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Rebooking Success:</span>
                    <span className="font-medium">94.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Satisfaction Rating:</span>
                    <span className="font-medium">8.1/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-gray-700 mb-4">Time Efficiency</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Delay Reduction:</span>
                    <span className="font-medium text-green-600">83.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Minutes Saved:</span>
                    <span className="font-medium">2,231</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Efficiency:</span>
                    <span className="font-medium">83.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium text-gray-700 mb-4">Financial Impact</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Recovery Cost:</span>
                    <span className="font-medium">AED 440K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cost Variance:</span>
                    <span className="font-medium text-green-600">-3.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Cost/Flight:</span>
                    <span className="font-medium">AED 89K</span>
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
                <p className="text-sm text-muted-foreground">Breakdown of disruption types handled by AERON</p>
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
                        const categoryCount = {}
                        filteredLogs.forEach(log => {
                          const category = log.disruption_category?.toLowerCase() || 'other'
                          categoryCount[category] = (categoryCount[category] || 0) + 1
                        })
                        
                        const colorMap = {
                          weather: "var(--color-weather)",
                          crew: "var(--color-crew)", 
                          aog: "var(--color-aog)",
                          aircraft: "var(--color-aog)",
                          airport: "var(--color-diversion)",
                          diversion: "var(--color-diversion)",
                          security: "var(--color-security)",
                          other: "hsl(210, 40%, 60%)"
                        }
                        
                        return Object.entries(categoryCount).map(([category, count]) => ({
                          category,
                          value: count,
                          fill: colorMap[category] || colorMap.other
                        }))
                      })()}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <RechartsLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const categoryCount = new Set(filteredLogs.map(log => log.disruption_category)).size
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
                            )
                          }
                        }}
                      />
                    </Pie>
                  </RechartsDonutChart>
                </ChartContainer>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {(() => {
                    const categoryCount = {}
                    const totalLogs = filteredLogs.length
                    
                    filteredLogs.forEach(log => {
                      const category = log.disruption_category || 'Other'
                      categoryCount[category] = (categoryCount[category] || 0) + 1
                    })
                    
                    const colorMap = {
                      Weather: "bg-blue-500",
                      Crew: "bg-orange-500", 
                      AOG: "bg-gray-500",
                      Aircraft: "bg-gray-500",
                      Airport: "bg-teal-500",
                      Security: "bg-purple-500",
                      Other: "bg-slate-500"
                    }
                    
                    return Object.entries(categoryCount).map(([category, count]) => {
                      const percentage = totalLogs > 0 ? ((count / totalLogs) * 100).toFixed(1) : 0
                      return (
                        <div key={category} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colorMap[category] || colorMap.Other}`}></div>
                          <span className="text-sm">{category} ({percentage}%)</span>
                        </div>
                      )
                    })
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
                <p className="text-sm text-muted-foreground">Effectiveness of recovery solutions in preventing delays</p>
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
                  <RechartsBarChart data={
                    filteredLogs.slice(0, 5).map(log => ({
                      flight: log.flight_number,
                      efficiency: log.recovery_efficiency || 80,
                      delayReduction: log.delay_reduction_minutes || 0
                    }))
                  }>
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
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
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
                  <span className="text-sm font-medium text-red-900">AOG (Aircraft on Ground)</span>
                </div>
                <p className="text-xs text-red-700">Highest impact disruptions but most delay reduction achieved through aircraft swaps</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Diversions</span>
                </div>
                <p className="text-xs text-blue-700">Critical network impact but effective passenger transport coordination maintains service</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Crew Issues</span>
                </div>
                <p className="text-xs text-green-700">Quick standby activation results in highest recovery efficiency rates</p>
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
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
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
                  <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
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
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
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
                  onClick={() => setFilters({
                    status: 'all',
                    category: 'all',
                    priority: 'all',
                    dateRange: 'all',
                    search: ''
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery History (5 records)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium">Solution ID</th>
                      <th className="text-left p-3 text-sm font-medium">Flight Details</th>
                      <th className="text-left p-3 text-sm font-medium">Disruption</th>
                      <th className="text-left p-3 text-sm font-medium">Recovery Impact</th>
                      <th className="text-left p-3 text-sm font-medium">Timeline</th>
                      <th className="text-left p-3 text-sm font-medium">Status</th>
                      <th className="text-left p-3 text-sm font-medium">Performance</th>
                      <th className="text-left p-3 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-sm">SOL-2025-001</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">FZ215</div>
                        <div className="text-sm text-gray-500">DXB → BOM</div>
                        <div className="text-xs text-gray-400">B737-800 • A6-FDB</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="mb-1 bg-orange-100 text-orange-800 border-orange-300">High</Badge>
                        <div className="text-xs text-gray-600">Engine overheating at DXB</div>
                        <div className="text-xs text-gray-500">Weather</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">Cancellation Avoided</span>
                        </div>
                        <div className="text-xs text-gray-600">155min delay</div>
                        <div className="text-xs text-gray-600">92.5% efficiency</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">3h 2m</div>
                        <div className="text-xs text-gray-500">1/10/2025</div>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-800">
                          Successful
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">8.2</div>
                        <div className="text-xs text-gray-500">94.1% rebooking</div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-sm">SOL-2025-002</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">FZ181</div>
                        <div className="text-sm text-gray-500">DXB → COK</div>
                        <div className="text-xs text-gray-400">B737-800 • A6-FDC</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="mb-1 bg-yellow-100 text-yellow-800 border-yellow-300">Medium</Badge>
                        <div className="text-xs text-gray-600">Captain duty time breach</div>
                        <div className="text-xs text-gray-500">Crew</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">Cancellation Avoided</span>
                        </div>
                        <div className="text-xs text-gray-600">69min delay</div>
                        <div className="text-xs text-gray-600">91.9% efficiency</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">2h 56m</div>
                        <div className="text-xs text-gray-500">1/10/2025</div>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-800">
                          Successful
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">8.8</div>
                        <div className="text-xs text-gray-500">97.1% rebooking</div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-sm">SOL-2025-003</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">FZ147</div>
                        <div className="text-sm text-gray-500">BKT → DXB</div>
                        <div className="text-xs text-gray-400">B737 MAX 8 • A6-FHE</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="mb-1 bg-yellow-100 text-yellow-800 border-yellow-300">Medium</Badge>
                        <div className="text-xs text-gray-600">Engine maintenance check required</div>
                        <div className="text-xs text-gray-500">AOG</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">Cancellation Avoided</span>
                        </div>
                        <div className="text-xs text-gray-600">118min delay</div>
                        <div className="text-xs text-gray-600">91% efficiency</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">4h 30m</div>
                        <div className="text-xs text-gray-500">1/10/2025</div>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-800">
                          Successful
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">7.8</div>
                        <div className="text-xs text-gray-500">89.2% rebooking</div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-sm">SOL-2025-004</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">FZ351</div>
                        <div className="text-sm text-gray-500">CAI → SSL</div>
                        <div className="text-xs text-gray-400">B737-800 • A6-FDH</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="mb-1 bg-red-100 text-red-800 border-red-300">Critical</Badge>
                        <div className="text-xs text-gray-600">DXB runway closure - emergency landing</div>
                        <div className="text-xs text-gray-500">Airport</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">Cancellation Avoided</span>
                        </div>
                        <div className="text-xs text-gray-600">770min delay</div>
                        <div className="text-xs text-gray-600">92.5% efficiency</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">3h 10m</div>
                        <div className="text-xs text-gray-500">1/10/2025</div>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-800">
                          Successful
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">7.2</div>
                        <div className="text-xs text-gray-500">86.1% rebooking</div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-sm">SOL-2025-005</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">FZ267</div>
                        <div className="text-sm text-gray-500">KTM → BOM</div>
                        <div className="text-xs text-gray-400">B737-800 • A6-FDL</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="mb-1 bg-orange-100 text-orange-800 border-orange-300">High</Badge>
                        <div className="text-xs text-gray-600">Security screening delay at BOM</div>
                        <div className="text-xs text-gray-500">Security</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">Cancellation Avoided</span>
                        </div>
                        <div className="text-xs text-gray-600">305min delay</div>
                        <div className="text-xs text-gray-600">88.5% efficiency</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">2h 35m</div>
                        <div className="text-xs text-gray-500">1/10/2025</div>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-800">
                          Successful
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">8.5</div>
                        <div className="text-xs text-gray-500">97% rebooking</div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
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
              <p className="text-sm text-muted-foreground">Historical performance showing improvement in recovery metrics</p>
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
                <LineChart data={(() => {
                  const monthlyData = {}
                  filteredLogs.forEach(log => {
                    const date = new Date(log.created_at)
                    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                    if (!monthlyData[monthKey]) {
                      monthlyData[monthKey] = { month: monthKey, efficiencySum: 0, delaySum: 0, count: 0 }
                    }
                    monthlyData[monthKey].efficiencySum += log.recovery_efficiency || 80
                    monthlyData[monthKey].delaySum += log.delay_reduction_minutes || 0
                    monthlyData[monthKey].count += 1
                  })
                  
                  return Object.values(monthlyData).map(data => ({
                    month: data.month,
                    efficiency: Math.round(data.efficiencySum / data.count),
                    delayReduction: Math.round(data.delaySum / data.count)
                  })).slice(-4) // Last 4 months
                })()}
                >
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
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Line 
                    yAxisId="delay"
                    type="monotone"
                    dataKey="delayReduction" 
                    stroke="var(--color-delayReduction)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-delayReduction)", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    yAxisId="efficiency"
                    type="monotone"
                    dataKey="efficiency" 
                    stroke="var(--color-efficiency)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-efficiency)", strokeWidth: 2, r: 4 }}
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
                <div className="text-2xl font-bold text-green-600">+6.0%</div>
                <div className="text-xs text-green-700">Recovery efficiency improvement over 4 months</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Delay Reduction</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">+47%</div>
                <div className="text-xs text-blue-700">Increase in delay minutes prevented</div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Cancellation Prevention</span>
                </div>
                <div className="text-2xl font-bold text-red-600">-67%</div>
                <div className="text-xs text-red-700">Reduction in potential cancellations</div>
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
                  <p className="text-sm text-muted-foreground">Complete log of AERON system actions and user decisions with detailed analytics</p>
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
                  <Button variant="outline" size="sm">Clear Filters</Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Success Rate</span>
                    </div>
                    <div className="text-xl font-bold">98.9%</div>
                    <div className="text-xs text-gray-500">out of 36 days</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Avg Response</span>
                    </div>
                    <div className="text-xl font-bold">3.4s</div>
                    <div className="text-xs text-gray-500">System response time</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Cost Impact</span>
                    </div>
                    <div className="text-xl font-bold">AED 2.8M</div>
                    <div className="text-xs text-gray-500">Total managed this month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Passengers Served</span>
                    </div>
                    <div className="text-xl font-bold">47,389</div>
                    <div className="text-xs text-gray-500">Passengers</div>
                  </CardContent>
                </Card>
              </div>

              {/* Audit Records Table */}
              <div>
                <h4 className="font-medium mb-3">Audit Records (5 records)</h4>
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
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="text-sm">14:32:15</div>
                          <div className="text-xs text-gray-500">2025-01-06</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">Recovery plan executed</div>
                          <div className="text-xs text-gray-500">Option A</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">FZ215</div>
                          <div className="text-xs text-gray-500">DXB → BOM</div>
                          <div className="text-xs text-gray-500">197 passengers</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">Sara Ahmed</div>
                          <div className="text-xs text-gray-500">ops.manager@flydubai.com</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">AED 125,000</div>
                          <div className="text-xs text-gray-500">45.2k Ton</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">Confidence: <span className="text-green-600">94.0%</span></div>
                          <div className="text-xs text-gray-500">Response: 4.2 seconds</div>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-green-100 text-green-800">Success</Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <FileText className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                      {/* Additional rows would follow similar pattern */}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
