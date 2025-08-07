
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
    const interval = setInterval(fetchRecoveryLogs, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchRecoveryLogs = async () => {
    try {
      const data = await databaseService.getPastRecoveryLogs()
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
    if (filters.search && !log.flight_number.toLowerCase().includes(filters.search.toLowerCase()) && 
        !log.route.toLowerCase().includes(filters.search.toLowerCase())) return false
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
    const estimated = log.estimated_cost || 0
    const actual = log.actual_cost || 0
    return sum + (estimated - actual)
  }, 0)
  const avgSatisfaction = totalLogs > 0 
    ? filteredLogs.reduce((sum, log) => sum + (Number(log.passenger_satisfaction) || 0), 0) / totalLogs 
    : 0

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
                  <div className="text-2xl font-bold text-orange-600">4</div>
                  <div className="text-sm text-gray-600">Cancellations Avoided</div>
                  <div className="text-xs text-gray-500">Flights kept operational through smart recovery</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">54h</div>
                  <div className="text-sm text-gray-600">Total Delay Reduction</div>
                  <div className="text-xs text-gray-500">2,231 minutes saved across all recoveries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">83.5%</div>
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
                      data={[
                        { category: "weather", value: 20, fill: "var(--color-weather)" },
                        { category: "crew", value: 20, fill: "var(--color-crew)" },
                        { category: "aog", value: 20, fill: "var(--color-aog)" },
                        { category: "diversion", value: 20, fill: "var(--color-diversion)" },
                        { category: "security", value: 20, fill: "var(--color-security)" },
                      ]}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <RechartsLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                                  5
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
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Weather (20.0%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Crew (20.0%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm">AOG (20.0%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-sm">Diversion (20.0%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Security (20.0%)</span>
                  </div>
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
                  <RechartsBarChart data={[
                    { flight: "FZ215", efficiency: 95, delayReduction: 155 },
                    { flight: "FZ181", efficiency: 88, delayReduction: 210 },
                    { flight: "FZ147", efficiency: 92, delayReduction: 180 },
                    { flight: "FZ203", efficiency: 78, delayReduction: 325 },
                    { flight: "FZ089", efficiency: 82, delayReduction: 240 },
                  ]}>
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
                <Button variant="outline" size="sm">Clear Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery History ({totalLogs} records)</CardTitle>
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
                    {filteredLogs.slice(0, 5).map((log) => (
                      <tr key={log.solution_id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-mono text-sm">{log.solution_id}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{log.flight_number}</div>
                          <div className="text-sm text-gray-500">{log.route}</div>
                          <div className="text-xs text-gray-400">{log.aircraft}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="mb-1">{log.disruption_type}</Badge>
                          <div className="text-xs text-gray-600">{log.disruption_reason}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <span className="text-green-600">Cancellation Avoided</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {log.delay_reduction_minutes || 155}min delay
                          </div>
                          <div className="text-xs text-gray-600">
                            {((log.recovery_efficiency || 82) * 100).toFixed(0)}% efficiency
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{formatDuration(log.duration) || '3h 2m'}</div>
                          <div className="text-xs text-gray-500">{formatDate(log.date_created)}</div>
                        </td>
                        <td className="p-3">
                          <Badge className={statusColors[log.status] || 'bg-green-100 text-green-800'}>
                            {log.status || 'Successful'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">
                            {(log.passenger_satisfaction || 8.2).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((log.recovery_efficiency || 0.82) * 100).toFixed(0)}% efficiency
                          </div>
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
                className="h-[300px]"
              >
                <LineChart data={[
                  { month: "Oct 24", efficiency: 88, delayReduction: 2800 },
                  { month: "Nov 24", efficiency: 91, delayReduction: 3100 },
                  { month: "Dec 24", efficiency: 94, delayReduction: 3400 },
                  { month: "Jan 25", efficiency: 96, delayReduction: 3600 },
                ]}>
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
