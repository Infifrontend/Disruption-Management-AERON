'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Lightbulb,
  Target,
  Globe,
  Plane,
  CloudRain,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  DollarSign,
  Clock,
  Wind,
  Thermometer,
  Navigation,
  Users,
  Gauge,
  Settings,
  ArrowLeft,
  PlayCircle,
  Sparkles,
  Calculator,
  FileBarChart,
  Save,
  ChevronRight,
  Star,
  X
} from 'lucide-react'

// Mock historical data
const fuelTrendData = [
  { month: 'Jan 2025', consumption: 45200, target: 44000, savings: 1200 },
  { month: 'Feb 2025', consumption: 43800, target: 44000, savings: 200 },
  { month: 'Mar 2025', consumption: 46100, target: 44000, savings: -2100 },
  { month: 'Apr 2025', consumption: 42900, target: 44000, savings: 1100 },
  { month: 'May 2025', consumption: 41750, target: 44000, savings: 2250 },
  { month: 'Jun 2025', consumption: 40980, target: 44000, savings: 3020 }
]

const routeAnalysisData = [
  { route: 'DXB-LHR', distance: 3414, avgFuel: 18200, efficiency: 5.33, potential: 8.2, cost: 24570 },
  { route: 'DXB-JFK', distance: 6840, avgFuel: 36800, efficiency: 5.38, potential: 12.5, cost: 49664 },
  { route: 'DXB-SIN', distance: 3273, avgFuel: 17100, efficiency: 5.22, potential: 6.8, cost: 23085 },
  { route: 'DXB-FRA', distance: 2977, avgFuel: 15850, efficiency: 5.32, potential: 7.1, cost: 21397 },
  { route: 'DXB-SYD', distance: 7487, avgFuel: 41200, efficiency: 5.50, potential: 15.2, cost: 55620 }
]

const aircraftEfficiencyData = [
  { type: 'A380-800', efficiency: 3.2, flights: 156, avgFuel: 85000, utilization: 87 },
  { type: 'B777-300ER', efficiency: 5.1, flights: 243, avgFuel: 42000, utilization: 92 },
  { type: 'A350-900', efficiency: 6.8, flights: 189, avgFuel: 28000, utilization: 89 },
  { type: 'B737-800', efficiency: 7.2, flights: 421, avgFuel: 12000, utilization: 94 }
]

const weatherImpactData = [
  { factor: 'Headwinds', impact: 8.5, frequency: 35, routes: 23 },
  { factor: 'Turbulence', impact: 3.2, frequency: 28, routes: 18 },
  { factor: 'Temperature', impact: 2.8, frequency: 45, routes: 31 },
  { factor: 'Storms', impact: 12.1, frequency: 15, routes: 8 }
]

const aiSuggestions = [
  {
    id: 'OPT-001',
    title: 'Optimize Cruise Altitude for DXB-LHR Route',
    description: 'AI analysis suggests increasing cruise altitude to FL390 during morning departures can reduce fuel consumption by 4.2%',
    impact: 'High',
    savings: '$127K annually',
    implementation: 'Easy',
    priority: 'High',
    confidence: 94,
    details: 'Based on 6 months of weather patterns and traffic analysis, optimal altitude FL390 reduces headwind impact and improves fuel efficiency.',
    actions: ['Update flight planning procedures', 'Coordinate with ATC for preferred altitudes', 'Monitor results for 30 days']
  },
  {
    id: 'OPT-002', 
    title: 'Reduce APU Usage at LHR Terminal 3',
    description: 'Minimize APU runtime by connecting to ground power faster. Current average: 23 minutes, target: 12 minutes',
    impact: 'Medium',
    savings: '$89K annually',
    implementation: 'Medium',
    priority: 'Medium',
    confidence: 87,
    details: 'Ground handling analysis shows 11-minute delay in ground power connection. Coordination improvements can reduce APU fuel burn.',
    actions: ['Improve ground crew coordination', 'Pre-position ground power units', 'Update turnaround procedures']
  },
  {
    id: 'OPT-003',
    title: 'Weight Optimization for A380 Operations',
    description: 'Reduce onboard catering and water loads based on actual consumption patterns. Potential weight reduction: 850kg per flight',
    impact: 'High',
    savings: '$234K annually',
    implementation: 'Hard',
    priority: 'High',
    confidence: 91,
    details: 'Analysis of 3-month catering consumption shows 32% food waste and 28% excess water. Optimized loading reduces weight significantly.',
    actions: ['Review catering load standards', 'Implement consumption tracking', 'Coordinate with catering suppliers']
  },
  {
    id: 'OPT-004',
    title: 'Route Optimization Using Real-time Weather',
    description: 'Implement dynamic routing based on real-time wind patterns. Average fuel savings: 2.8% per long-haul flight',
    impact: 'Medium',
    savings: '$156K annually',
    implementation: 'Medium',
    priority: 'Medium',
    confidence: 89,
    details: 'Integration with advanced weather systems can optimize flight paths dynamically, avoiding adverse weather conditions.',
    actions: ['Upgrade weather data integration', 'Train dispatchers on new tools', 'Monitor route efficiency']
  }
]

const fuelCostBreakdown = [
  { category: 'Jet A1 Base Cost', amount: 1450000, percentage: 68 },
  { category: 'Weather Impact', amount: 187000, percentage: 9 },
  { category: 'Route Inefficiencies', amount: 156000, percentage: 7 },
  { category: 'Aircraft Performance', amount: 134000, percentage: 6 },
  { category: 'APU & Ground Ops', amount: 89000, percentage: 4 },
  { category: 'Other Factors', amount: 124000, percentage: 6 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function FuelOptimization() {
  const [activeTimeRange, setActiveTimeRange] = useState('6m')
  const [selectedRoute, setSelectedRoute] = useState('all')
  const [selectedAircraft, setSelectedAircraft] = useState('all')
  const [selectedRouteForOptimization, setSelectedRouteForOptimization] = useState(null)
  const [showOptimizationScreen, setShowOptimizationScreen] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    route: '',
    aircraftType: ''
  })

  const totalSavings = fuelTrendData.reduce((sum, item) => sum + Math.max(0, item.savings), 0)
  const avgEfficiency = aircraftEfficiencyData.reduce((sum, item) => sum + item.efficiency, 0) / aircraftEfficiencyData.length

  const handleOptimizeRoute = (route) => {
    setSelectedRouteForOptimization(route)
    setShowOptimizationScreen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
              <Fuel className="h-6 w-6 text-white" />
            </div>
            AI-Powered Fuel Optimization
          </h2>
          <p className="text-muted-foreground">Advanced analytics and recommendations for maximum fuel efficiency</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <TrendingDown className="h-3 w-3 mr-1" />
            8.2% Reduction
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <DollarSign className="h-3 w-3 mr-1" />
            $1.45M Saved
          </Badge>
        </div>
      </div>

      {/* AI Insights Alert */}
      <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>AI Recommendation:</strong> Implementing the top 3 optimization suggestions could save an additional $450K annually with 94% confidence.
        </AlertDescription>
      </Alert>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Fuel Savings</p>
                <p className="text-2xl font-semibold text-green-600">{(totalSavings / 1000).toFixed(1)}K gal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Savings (Monthly)</p>
                <p className="text-2xl font-semibold text-blue-600">${(totalSavings * 1.35 / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gauge className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Fleet Efficiency</p>
                <p className="text-2xl font-semibold text-purple-600">{avgEfficiency.toFixed(1)} L/100km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Optimization Score</p>
                <p className="text-2xl font-semibold text-orange-600">87.3/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Route Analysis
          </TabsTrigger>
          <TabsTrigger value="aircraft" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Aircraft Performance
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            Weather Impact
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab 
            fuelTrendData={fuelTrendData}
            fuelCostBreakdown={fuelCostBreakdown}
            activeTimeRange={activeTimeRange}
            setActiveTimeRange={setActiveTimeRange}
          />
        </TabsContent>

        <TabsContent value="routes">
          <RouteAnalysisTab 
            routeAnalysisData={routeAnalysisData}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
            onOptimizeRoute={handleOptimizeRoute}
          />
        </TabsContent>

        <TabsContent value="aircraft">
          <AircraftPerformanceTab 
            aircraftEfficiencyData={aircraftEfficiencyData}
            selectedAircraft={selectedAircraft}
            setSelectedAircraft={setSelectedAircraft}
          />
        </TabsContent>

        <TabsContent value="weather">
          <WeatherImpactTab weatherImpactData={weatherImpactData} />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsTab aiSuggestions={aiSuggestions} />
        </TabsContent>
      </Tabs>

      {/* Route Optimization Full Screen */}
      <Dialog open={showOptimizationScreen} onOpenChange={setShowOptimizationScreen}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 border-0 rounded-none">
          <div className="h-full flex flex-col bg-background">
            {/* Full Screen Header */}
            <div className="flex items-center justify-between p-6 border-b bg-card">
              <div className="flex items-center gap-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold">AI Route Optimization - {selectedRouteForOptimization?.route}</h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced fuel optimization analysis with AI-powered recommendations and simulation modeling
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOptimizationScreen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Full Screen Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedRouteForOptimization && (
                <RouteOptimizationScreen 
                  route={selectedRouteForOptimization}
                  onClose={() => setShowOptimizationScreen(false)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OverviewTab({ fuelTrendData, fuelCostBreakdown, activeTimeRange, setActiveTimeRange }) {
  return (
    <div className="space-y-6">
      {/* Fuel Consumption Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Fuel Consumption Trends
            </CardTitle>
            <div className="flex gap-2">
              {['3m', '6m', '1y'].map((range) => (
                <Button
                  key={range}
                  variant={activeTimeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toLocaleString()} gallons`,
                    name === 'consumption' ? 'Actual Consumption' : 
                    name === 'target' ? 'Target' : 'Savings'
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="consumption" stroke="#8884d8" strokeWidth={3} name="consumption" />
                <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" name="target" />
                <Area type="monotone" dataKey="savings" fill="#00C49F" fillOpacity={0.3} name="savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cost Breakdown */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fuel Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fuelCostBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-semibold">
              <span>Total Monthly Cost</span>
              <span className="text-lg">
                ${fuelCostBreakdown.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Fuel Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Set New Targets
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Analysis
            </Button>
            <Separator />
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700">Monthly Target</p>
              <p className="text-lg font-semibold text-green-600">92.3%</p>
              <p className="text-xs text-green-600">Achievement Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RouteAnalysisTab({ routeAnalysisData, selectedRoute, setSelectedRoute, onOptimizeRoute }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Route Fuel Efficiency Analysis
            </CardTitle>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {routeAnalysisData.map((route) => (
                  <SelectItem key={route.route} value={route.route}>
                    {route.route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Distance (nm)</TableHead>
                  <TableHead>Avg Fuel (gal)</TableHead>
                  <TableHead>Efficiency (L/100km)</TableHead>
                  <TableHead>Savings Potential</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeAnalysisData.map((route) => (
                  <TableRow key={route.route}>
                    <TableCell className="font-mono font-medium">{route.route}</TableCell>
                    <TableCell>{route.distance.toLocaleString()}</TableCell>
                    <TableCell>{route.avgFuel.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{route.efficiency}</span>
                        <Badge className={
                          route.efficiency < 5.3 ? 'bg-green-100 text-green-700' :
                          route.efficiency < 5.5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {route.efficiency < 5.3 ? 'Excellent' :
                           route.efficiency < 5.5 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">{route.potential}%</span>
                      </div>
                    </TableCell>
                    <TableCell>${route.cost.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onOptimizeRoute(route)}
                        className="flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        Optimize
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Route Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Route-Specific Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                DXB-JFK Route Optimization
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Adjust flight path to avoid common headwind zones during winter months
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-600 font-medium">+12.5% Efficiency</span>
                <span className="text-blue-600">$49K Monthly Savings</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Wind className="h-4 w-4 text-green-600" />
                DXB-SYD Wind Optimization
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Utilize jet stream patterns for 8% fuel reduction on eastbound flights
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-600 font-medium">+15.2% Efficiency</span>
                <span className="text-blue-600">$55K Monthly Savings</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RouteOptimizationScreen({ route, onClose }) {
  const [selectedOptimizations, setSelectedOptimizations] = useState([])
  const [showSimulation, setShowSimulation] = useState(false)

  // Generate route-specific optimizations
  const optimizations = [
    {
      id: 'ALT-001',
      title: 'Altitude Optimization',
      description: 'Adjust cruise altitude based on wind patterns and traffic conditions to minimize headwind impact and fuel consumption',
      savings: route.potential * 0.4,
      fuelSaving: route.avgFuel * 0.045,
      confidence: 92,
      implementation: 'Easy',
      timeToImplement: '1 week',
      impact: 'High'
    },
    {
      id: 'ROUTE-001',
      title: 'Route Path Optimization',
      description: 'Use AI-powered route planning to avoid headwinds and optimize flight paths for maximum fuel efficiency',
      savings: route.potential * 0.35,
      fuelSaving: route.avgFuel * 0.038,
      confidence: 87,
      implementation: 'Medium',
      timeToImplement: '2 weeks',
      impact: 'High'
    },
    {
      id: 'SPEED-001',
      title: 'Speed Profile Optimization',
      description: 'Optimize climb, cruise, and descent speeds for fuel efficiency while maintaining schedule integrity',
      savings: route.potential * 0.25,
      fuelSaving: route.avgFuel * 0.028,
      confidence: 89,
      implementation: 'Easy',
      timeToImplement: '3 days',
      impact: 'Medium'
    }
  ]

  const handleOptimizationToggle = (optimizationId) => {
    setSelectedOptimizations(prev => 
      prev.includes(optimizationId) 
        ? prev.filter(id => id !== optimizationId)
        : [...prev, optimizationId]
    )
  }

  const selectedOpts = optimizations.filter(opt => selectedOptimizations.includes(opt.id))
  const totalSavings = selectedOpts.reduce((sum, opt) => sum + opt.savings, 0)
  const totalFuelSaving = selectedOpts.reduce((sum, opt) => sum + opt.fuelSaving, 0)
  const avgConfidence = selectedOpts.length > 0 ? selectedOpts.reduce((sum, opt) => sum + opt.confidence, 0) / selectedOpts.length : 0

  // Mock simulation data
  const simulationData = [
    { month: 'Current', fuel: route.avgFuel, cost: route.cost },
    { month: 'Month 1', fuel: route.avgFuel - (totalFuelSaving * 0.3), cost: route.cost - (totalSavings * 0.3) },
    { month: 'Month 2', fuel: route.avgFuel - (totalFuelSaving * 0.6), cost: route.cost - (totalSavings * 0.6) },
    { month: 'Month 3', fuel: route.avgFuel - totalFuelSaving, cost: route.cost - totalSavings },
    { month: 'Month 4', fuel: route.avgFuel - totalFuelSaving, cost: route.cost - totalSavings },
    { month: 'Month 5', fuel: route.avgFuel - totalFuelSaving, cost: route.cost - totalSavings },
    { month: 'Month 6', fuel: route.avgFuel - totalFuelSaving, cost: route.cost - totalSavings }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Route Information Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-3xl font-bold text-blue-800">Route: {route.route}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-600">
                <div>
                  <span className="font-medium">Distance:</span>
                  <p className="text-lg font-semibold">{route.distance.toLocaleString()} nm</p>
                </div>
                <div>
                  <span className="font-medium">Current Efficiency:</span>
                  <p className="text-lg font-semibold">{route.efficiency} L/100km</p>
                </div>
                <div>
                  <span className="font-medium">Monthly Flights:</span>
                  <p className="text-lg font-semibold">~45</p>
                </div>
                <div>
                  <span className="font-medium">Avg Fuel:</span>
                  <p className="text-lg font-semibold">{route.avgFuel.toLocaleString()} gal</p>
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-sm font-medium text-blue-700">Optimization Potential</p>
              <p className="text-5xl font-bold text-blue-600">{route.potential}%</p>
              <p className="text-sm text-blue-600">Fuel savings opportunity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
        {/* AI Optimization Options */}
        <div className="2xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6" />
                AI Optimization Options
              </CardTitle>
              <p className="text-muted-foreground">Select optimization strategies to implement for this route</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {optimizations.map((opt) => (
                <div key={opt.id} className="border rounded-lg p-6 hover:bg-accent/30 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      id={opt.id}
                      checked={selectedOptimizations.includes(opt.id)}
                      onCheckedChange={() => handleOptimizationToggle(opt.id)}
                      className="mt-2"
                    />
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <label htmlFor={opt.id} className="text-lg font-semibold cursor-pointer">{opt.title}</label>
                          <Badge className={
                            opt.impact === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                            opt.impact === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }>
                            {opt.impact} Impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {opt.implementation} Implementation
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{opt.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Fuel Savings:</span>
                          <p className="font-semibold text-green-600">{opt.fuelSaving.toFixed(0)} gal/flight</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Cost Savings:</span>
                          <p className="font-semibold text-blue-600">${opt.savings.toFixed(0)}/month</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">AI Confidence:</span>
                          <p className="font-semibold">{opt.confidence}%</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Timeline:</span>
                          <p className="font-semibold">{opt.timeToImplement}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Implementation Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Implementation Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-sm font-medium text-green-700">Total Monthly Savings</p>
                  <p className="text-4xl font-bold text-green-600">${totalSavings.toFixed(0)}</p>
                  <p className="text-xs text-green-600 mt-1">{totalFuelSaving.toFixed(0)} gallons saved per flight</p>
                </div>
                
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <p className="text-sm font-medium text-blue-700">Annual Impact</p>
                  <p className="text-4xl font-bold text-blue-600">${(totalSavings * 12).toFixed(0)}</p>
                  <p className="text-xs text-blue-600 mt-1">{(totalFuelSaving * 540).toFixed(0)} gallons annually</p>
                </div>
                
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 text-center">
                  <p className="text-sm font-medium text-purple-700">AI Confidence</p>
                  <p className="text-4xl font-bold text-purple-600">{avgConfidence.toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 mt-1">Recommendation accuracy</p>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-3">
                <Button 
                  className="w-full py-3" 
                  onClick={() => setShowSimulation(true)}
                  disabled={selectedOptimizations.length === 0}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Run Savings Simulation
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full py-3"
                  disabled={selectedOptimizations.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Optimization Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simulation Results */}
      {showSimulation && selectedOptimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileBarChart className="h-6 w-6" />
              6-Month Savings Simulation
            </CardTitle>
            <p className="text-muted-foreground">Projected impact of selected optimization strategies</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Fuel Consumption Projection</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(0)} gal`, 'Fuel per Flight']} />
                      <Line type="monotone" dataKey="fuel" stroke="#8884d8" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Cost Savings Projection</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(0)}`, 'Monthly Cost']} />
                      <Area type="monotone" dataKey="cost" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6" />
            Implementation Timeline
          </CardTitle>
          <p className="text-muted-foreground">Step-by-step implementation plan for selected optimizations</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedOpts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select optimization options above to see implementation timeline</p>
              </div>
            ) : (
              selectedOpts.map((opt, index) => (
                <div key={opt.id} className="flex items-center gap-6 p-6 border rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg truncate">{opt.title}</h4>
                    <p className="text-muted-foreground">Implementation time: {opt.timeToImplement}</p>
                    <p className="text-sm text-muted-foreground mt-1">Confidence: {opt.confidence}%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-green-600 text-lg">${opt.savings.toFixed(0)}/mo</p>
                    <p className="text-xs text-muted-foreground">{opt.fuelSaving.toFixed(0)} gal saved</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button variant="outline" onClick={onClose} className="flex items-center justify-center gap-2 py-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Route Analysis
        </Button>
        <Button 
          className="flex-1 flex items-center justify-center gap-2 py-3"
          disabled={selectedOptimizations.length === 0}
        >
          <Star className="h-4 w-4" />
          Apply Selected Optimizations ({selectedOptimizations.length})
        </Button>
      </div>
    </div>
  )
}

function AircraftPerformanceTab({ aircraftEfficiencyData, selectedAircraft, setSelectedAircraft }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Aircraft Fuel Performance
            </CardTitle>
            <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select aircraft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aircraft Types</SelectItem>
                {aircraftEfficiencyData.map((aircraft) => (
                  <SelectItem key={aircraft.type} value={aircraft.type}>
                    {aircraft.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aircraftEfficiencyData.map((aircraft) => (
              <div key={aircraft.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{aircraft.type}</h4>
                  <Badge className={
                    aircraft.efficiency > 6.5 ? 'bg-green-100 text-green-700' :
                    aircraft.efficiency > 5.0 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {aircraft.efficiency > 6.5 ? 'Excellent' :
                     aircraft.efficiency > 5.0 ? 'Good' : 'Needs Focus'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Efficiency (L/100km)</span>
                    <span className="font-medium">{aircraft.efficiency}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Flights</span>
                    <span className="font-medium">{aircraft.flights}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Fuel per Flight</span>
                    <span className="font-medium">{aircraft.avgFuel.toLocaleString()} gal</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Utilization Rate</span>
                    <span className="font-medium">{aircraft.utilization}%</span>
                  </div>
                  
                  <Progress value={aircraft.utilization} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aircraft Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fuel Efficiency Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aircraftEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} L/100km`, 'Efficiency']} />
                <Bar dataKey="efficiency" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WeatherImpactTab({ weatherImpactData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5" />
            Weather Impact on Fuel Consumption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weatherImpactData.map((factor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    {factor.factor === 'Headwinds' && <Wind className="h-4 w-4 text-blue-600" />}
                    {factor.factor === 'Turbulence' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                    {factor.factor === 'Temperature' && <Thermometer className="h-4 w-4 text-red-600" />}
                    {factor.factor === 'Storms' && <CloudRain className="h-4 w-4 text-gray-600" />}
                    {factor.factor}
                  </h4>
                  <Badge className={
                    factor.impact > 10 ? 'bg-red-100 text-red-700' :
                    factor.impact > 5 ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {factor.impact > 10 ? 'High Impact' :
                     factor.impact > 5 ? 'Medium Impact' : 'Low Impact'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fuel Impact</span>
                    <span className="font-medium text-red-600">+{factor.impact}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Frequency</span>
                    <span className="font-medium">{factor.frequency}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Affected Routes</span>
                    <span className="font-medium">{factor.routes} routes</span>
                  </div>
                  
                  <Progress value={factor.frequency} className="h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Mitigation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weather Mitigation Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Headwind Optimization</h4>
              <p className="text-sm text-blue-700 mb-3">
                Implement dynamic altitude adjustments to minimize headwind impact on fuel consumption
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-600 font-medium">Potential: -35% Impact</span>
                <span className="text-blue-600">Est. Savings: $127K/month</span>
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Turbulence Avoidance</h4>
              <p className="text-sm text-orange-700 mb-3">
                Use real-time weather radar for route adjustments to avoid turbulent areas
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-600 font-medium">Potential: -45% Impact</span>
                <span className="text-blue-600">Est. Savings: $89K/month</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecommendationsTab({ aiSuggestions }) {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'low':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {aiSuggestions.map((suggestion) => (
          <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{suggestion.title}</h3>
                    <Badge className={getImpactColor(suggestion.impact)}>
                      {suggestion.impact} Impact
                    </Badge>
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-green-600">{suggestion.savings}</p>
                  <p className="text-xs text-muted-foreground">Potential Savings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-700">AI Confidence</p>
                  <p className="text-xl font-semibold text-blue-600">{suggestion.confidence}%</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700">Implementation</p>
                  <p className="text-lg font-semibold text-green-600">{suggestion.implementation}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-700">Priority Level</p>
                  <p className="text-lg font-semibold text-purple-600">{suggestion.priority}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedSuggestion(selectedSuggestion === suggestion.id ? null : suggestion.id)}
                >
                  {selectedSuggestion === suggestion.id ? 'Hide Details' : 'View Details'}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Implement
                  </Button>
                </div>
              </div>

              {selectedSuggestion === suggestion.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Implementation Details</h4>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.details}</p>
                  
                  <h5 className="font-medium mb-2">Required Actions:</h5>
                  <ul className="space-y-1">
                    {suggestion.actions.map((action, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Implementation Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-semibold text-green-600">$606K</p>
              <p className="text-sm text-green-700">Total Annual Savings</p>
              <p className="text-xs text-muted-foreground">If all recommendations implemented</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-semibold text-blue-600">14.2%</p>
              <p className="text-sm text-blue-700">Additional Fuel Reduction</p>
              <p className="text-xs text-muted-foreground">Compared to current performance</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-semibold text-purple-600">90.5%</p>
              <p className="text-sm text-purple-700">Average AI Confidence</p>
              <p className="text-xs text-muted-foreground">Across all recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}