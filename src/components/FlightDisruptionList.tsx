'use client'

import React, { useState, useEffect } from 'react'
import { databaseService } from '../services/databaseService'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  AlertTriangle, 
  Plane, 
  Users, 
  Clock, 
  MapPin, 
  DollarSign,
  Filter,
  Search,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Timer,
  Fuel,
  CloudRain,
  Wrench,
  Activity,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Calendar,
  FileText,
  Shield,
  Target,
  Zap,
  BarChart3,
  Send,
  RefreshCw,
  ArrowRight,
  Info,
  Star,
  ThumbsUp
} from 'lucide-react'

export function FlightDisruptionList() {
  const [selectedDisruption, setSelectedDisruption] = useState(null)
  const [disruptions, setDisruptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    airport: 'all',
    search: ''
  })

  useEffect(() => {
    const fetchDisruptions = async () => {
      try {
        const data = await databaseService.getAllDisruptions()
        setDisruptions(data)
      } catch (error) {
        console.error('Error fetching disruptions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDisruptions()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDisruptions, 30000)
    return () => clearInterval(interval)
  }, [])

  // Enhanced mock data with comprehensive disruption information (fallback)
    const mockDisruptions = [
    {
      id: 'DISR-2025-001',
      flightNumber: 'EK123',
      route: 'JFK → DXB',
      aircraft: 'A321-001',
      aircraftType: 'Airbus A321-200',
      scheduledDeparture: '2025-06-06 14:30',
      estimatedDeparture: '2025-06-06 16:45',
      delay: 135,
      passengers: 158,
      crew: 8,
      gate: 'B12',
      terminal: '4',
      severity: 'High',
      type: 'Technical',
      status: 'Active',
      confidence: 94.2,
      disruptionReason: 'Engine warning light - hydraulic system check required',
      detailedDescription: 'Aircraft A321-001 experiencing intermittent hydraulic pressure warning during pre-flight checks. Maintenance team investigating. Passenger boarding suspended pending technical resolution.',
      impact: {
        passengers: 158,
        connectingFlights: 12,
        estimatedCost: 45200,
        revenueAtRisk: 125000,
        compensationRequired: 28000
      },
      weather: {
        condition: 'Clear',
        visibility: '10+ miles',
        wind: '8 knots NE',
        temperature: '72°F'
      },
      crewMembers: [
        {
          id: 'CREW-001',
          name: 'Captain Sarah Johnson',
          role: 'Captain',
          status: 'Available',
          dutyTime: '4h 30m',
          restTime: '10h 15m',
          phone: '+1-555-0123',
          location: 'JFK Crew Lounge'
        },
        {
          id: 'CREW-002',
          name: 'First Officer Mike Chen',
          role: 'First Officer',
          status: 'Available',
          dutyTime: '3h 45m',
          restTime: '11h 30m',
          phone: '+1-555-0124',
          location: 'JFK Crew Lounge'
        },
        {
          id: 'CREW-003',
          name: 'Senior FA Lisa Martinez',
          role: 'Senior Flight Attendant',
          status: 'Available',
          dutyTime: '2h 15m',
          restTime: '12h 45m',
          phone: '+1-555-0125',
          location: 'JFK Terminal 4'
        }
      ],
      maintenance: {
        issueReported: '2025-06-06 13:45',
        technician: 'Maintenance Team Alpha',
        estimatedRepairTime: '90 minutes',
        partsRequired: 'Hydraulic seal kit',
        workOrderNumber: 'WO-2025-HYD-001',
        status: 'In Progress'
      },
      passengerServices: {
        notifications: 'Sent via SMS and email',
        vouchers: '25 meal vouchers issued',
        rebooking: '8 passengers rebooked on EK125',
        customerServiceCalls: 14,
        complaints: 2
      },
      predictions: {
        resolutionProbability: 87,
        cascadeRisk: 'Medium',
        networkImpact: 'Low',
        aiRecommendation: 'Aircraft substitution recommended - A321-007 available in 45 minutes'
      },
      alternatives: [
        {
          option: 'Aircraft Substitution',
          aircraft: 'A321-007',
          cost: 28000,
          delay: 45,
          success: 95,
          description: 'Use backup aircraft A321-007 currently in maintenance bay'
        },
        {
          option: 'Repair and Continue',
          aircraft: 'A321-001',
          cost: 12000,
          delay: 90,
          success: 78,
          description: 'Complete hydraulic system repair on current aircraft'
        },
        {
          option: 'Cancel and Rebook',
          aircraft: 'Various',
          cost: 65000,
          delay: 240,
          success: 100,
          description: 'Cancel flight and rebook passengers on next available flights'
        }
      ]
    },
    {
      id: 'DISR-2025-002',
      flightNumber: 'EK456',
      route: 'LHR → DXB',
      aircraft: 'A330-012',
      aircraftType: 'Airbus A330-300',
      scheduledDeparture: '2025-06-06 11:15',
      estimatedDeparture: '2025-06-06 13:30',
      delay: 195,
      passengers: 295,
      crew: 12,
      gate: 'A15',
      terminal: '2',
      severity: 'Critical',
      type: 'Weather',
      status: 'Active',
      confidence: 89.5,
      disruptionReason: 'Severe thunderstorms at departure airport',
      detailedDescription: 'Heavy thunderstorm activity over London Heathrow causing ground stops. Multiple flights affected. Lightning strikes reported in terminal area. Ground crews suspended for safety.',
      impact: {
        passengers: 295,
        connectingFlights: 23,
        estimatedCost: 78000,
        revenueAtRisk: 245000,
        compensationRequired: 45000
      },
      weather: {
        condition: 'Thunderstorms',
        visibility: '2 miles',
        wind: '25 knots gusting 40',
        temperature: '68°F'
      },
      crewMembers: [
        {
          id: 'CREW-004',
          name: 'Captain David Thompson',
          role: 'Captain',
          status: 'On Duty',
          dutyTime: '6h 15m',
          restTime: '8h 45m',
          phone: '+44-20-555-0987',
          location: 'LHR Crew Rest'
        }
      ],
      maintenance: {
        issueReported: 'N/A - Weather related',
        technician: 'N/A',
        estimatedRepairTime: 'Weather dependent',
        partsRequired: 'None',
        workOrderNumber: 'N/A',
        status: 'Weather Hold'
      },
      passengerServices: {
        notifications: 'Sent via mobile app and PA',
        vouchers: '150 meal vouchers + 80 hotel vouchers',
        rebooking: '45 passengers rebooked on multiple flights',
        customerServiceCalls: 89,
        complaints: 12
      },
      predictions: {
        resolutionProbability: 65,
        cascadeRisk: 'High',
        networkImpact: 'High',
        aiRecommendation: 'Monitor weather patterns - consider delay until 15:00 when storms expected to clear'
      },
      alternatives: [
        {
          option: 'Weather Delay',
          aircraft: 'A330-012',
          cost: 45000,
          delay: 180,
          success: 85,
          description: 'Wait for weather to clear, maintain current aircraft and crew'
        },
        {
          option: 'Route Diversion',
          aircraft: 'A330-012',
          cost: 32000,
          delay: 120,
          success: 70,
          description: 'Divert to Gatwick for departure when weather clears'
        },
        {
          option: 'Next Day Departure',
          aircraft: 'A330-012',
          cost: 125000,
          delay: 1440,
          success: 100,
          description: 'Cancel today, rebook all passengers for tomorrow morning'
        }
      ]
    },
    {
      id: 'DISR-2025-003',
      flightNumber: 'EK789',
      route: 'DXB → SYD',
      aircraft: 'A380-001',
      aircraftType: 'Airbus A380-800',
      scheduledDeparture: '2025-06-06 08:15',
      estimatedDeparture: '2025-06-06 10:30',
      delay: 135,
      passengers: 425,
      crew: 18,
      gate: 'C1',
      terminal: '3',
      severity: 'Medium',
      type: 'Crew',
      status: 'Resolving',
      confidence: 91.8,
      disruptionReason: 'Crew duty time limitation - replacement crew en route',
      detailedDescription: 'Original crew exceeded maximum duty time due to previous flight delay. Reserve crew called in and en route to airport. Expected arrival in 45 minutes.',
      impact: {
        passengers: 425,
        connectingFlights: 35,
        estimatedCost: 52000,
        revenueAtRisk: 180000,
        compensationRequired: 22000
      },
      weather: {
        condition: 'Clear',
        visibility: '10+ miles',
        wind: '12 knots SW',
        temperature: '85°F'
      },
      crewMembers: [
        {
          id: 'CREW-005',
          name: 'Captain Ahmed Al-Mansouri',
          role: 'Captain',
          status: 'Duty Time Exceeded',
          dutyTime: '14h 30m',
          restTime: '6h 15m',
          phone: '+971-4-555-0234',
          location: 'DXB Crew Rest'
        }
      ],
      maintenance: {
        issueReported: 'N/A - Crew related',
        technician: 'N/A',
        estimatedRepairTime: 'N/A',
        partsRequired: 'None',
        workOrderNumber: 'N/A',
        status: 'No Maintenance Required'
      },
      passengerServices: {
        notifications: 'Sent via app and gate announcements',
        vouchers: '200 beverage vouchers issued',
        rebooking: '12 passengers opted for later flights',
        customerServiceCalls: 34,
        complaints: 5
      },
      predictions: {
        resolutionProbability: 95,
        cascadeRisk: 'Low',
        networkImpact: 'Medium',
        aiRecommendation: 'Fresh crew will resolve issue - minimal network impact expected'
      },
      alternatives: [
        {
          option: 'Fresh Crew',
          aircraft: 'A380-001',
          cost: 18000,
          delay: 45,
          success: 98,
          description: 'Use incoming reserve crew, maintain current aircraft'
        },
        {
          option: 'Crew Rest Override',
          aircraft: 'A380-001',
          cost: 8000,
          delay: 15,
          success: 60,
          description: 'Apply for regulatory override - high risk of rejection'
        }
      ]
    }
  ]

  const dataToFilter = disruptions.length > 0 ? disruptions : mockDisruptions
  const filteredDisruptions = dataToFilter.filter(disruption => {
    return (
      (filters.severity === 'all' || disruption.severity.toLowerCase() === filters.severity) &&
      (filters.type === 'all' || disruption.type.toLowerCase() === filters.type) &&
      (filters.status === 'all' || disruption.status.toLowerCase() === filters.status) &&
      (filters.search === '' || 
        disruption.flightNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        disruption.route.toLowerCase().includes(filters.search.toLowerCase()) ||
        disruption.disruptionReason.toLowerCase().includes(filters.search.toLowerCase())
      )
    )
  })

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-700'
      case 'Resolving': return 'bg-yellow-100 text-yellow-700'
      case 'Resolved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Technical': return <Wrench className="h-4 w-4" />
      case 'Weather': return <CloudRain className="h-4 w-4" />
      case 'Crew': return <Users className="h-4 w-4" />
      case 'ATC': return <Activity className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleViewDetails = (disruption) => {
    setSelectedDisruption(disruption)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Flight Disruption List</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of flight disruptions with AI-powered analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Active Disruptions</p>
                <p className="text-2xl font-semibold text-red-900">{dataToFilter.filter(d => d.status === 'Active').length}</p>
                <p className="text-xs text-red-600">Requiring attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600">Affected Passengers</p>
                <p className="text-2xl font-semibold text-orange-900">
                  {dataToFilter.reduce((sum, d) => sum + d.passengers, 0).toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">Total impacted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Estimated Cost Impact</p>
                <p className="text-2xl font-semibold text-blue-900">
                  ${(dataToFilter.reduce((sum, d) => sum + d.impact.estimatedCost, 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-blue-600">Recovery costs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">AI Confidence</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {dataToFilter.length > 0 ? (dataToFilter.reduce((sum, d) => sum + d.confidence, 0) / dataToFilter.length).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-purple-600">Prediction accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Flight number, route..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={filters.severity} onValueChange={(value) => setFilters({...filters, severity: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="crew">Crew</SelectItem>
                  <SelectItem value="atc">ATC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolving">Resolving</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Airport</Label>
              <Select value={filters.airport} onValueChange={(value) => setFilters({...filters, airport: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Airports</SelectItem>
                  <SelectItem value="jfk">JFK - New York</SelectItem>
                  <SelectItem value="lhr">LHR - London</SelectItem>
                  <SelectItem value="dxb">DXB - Dubai</SelectItem>
                  <SelectItem value="fra">FRA - Frankfurt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disruptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Disruptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Aircraft</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>AI Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisruptions.map((disruption) => (
                <TableRow key={disruption.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(disruption.type)}
                      <span className="font-mono font-medium">{disruption.flightNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>{disruption.route}</TableCell>
                  <TableCell className="font-mono">{disruption.aircraft}</TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      <p className="text-sm font-medium truncate">{disruption.disruptionReason}</p>
                      <p className="text-xs text-muted-foreground">Gate {disruption.gate} • Terminal {disruption.terminal}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(disruption.severity)}>
                      {disruption.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(disruption.status)}>
                      {disruption.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{disruption.delay}m</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{disruption.passengers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={disruption.confidence} className="w-16" />
                      <span className="text-sm font-medium">{disruption.confidence}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(disruption)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Disruption Dialog */}
      {selectedDisruption && (
        <Dialog open={!!selectedDisruption} onOpenChange={() => setSelectedDisruption(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedDisruption.type)}
                Flight {selectedDisruption.flightNumber} Disruption Details
              </DialogTitle>
              <DialogDescription>
                Comprehensive analysis and recovery options for {selectedDisruption.route}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="pt-1 pb-2">Overview</TabsTrigger>
                <TabsTrigger value="technical" className="pt-1 pb-2">Technical</TabsTrigger>
                <TabsTrigger value="crew" className="pt-1 pb-2">Crew</TabsTrigger>
                <TabsTrigger value="passengers">Passengers</TabsTrigger>
                <TabsTrigger value="options">Recovery Options</TabsTrigger>
                <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Flight Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Flight Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Flight Number</Label>
                          <p className="font-mono font-medium">{selectedDisruption.flightNumber}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Route</Label>
                          <p className="font-medium">{selectedDisruption.route}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Aircraft</Label>
                          <p className="font-medium">{selectedDisruption.aircraft}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Aircraft Type</Label>
                          <p className="font-medium">{selectedDisruption.aircraftType}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Gate</Label>
                          <p className="font-medium">Terminal {selectedDisruption.terminal}, Gate {selectedDisruption.gate}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Passengers</Label>
                          <p className="font-medium">{selectedDisruption.passengers} + {selectedDisruption.crew} crew</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Disruption Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Severity</Label>
                          <Badge className={getSeverityColor(selectedDisruption.severity)}>
                            {selectedDisruption.severity}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <Badge className={getStatusColor(selectedDisruption.status)}>
                            {selectedDisruption.status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Current Delay</Label>
                          <p className="font-medium text-red-600">{selectedDisruption.delay} minutes</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">AI Confidence</Label>
                          <p className="font-medium">{selectedDisruption.confidence}%</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-xs text-muted-foreground">Issue Description</Label>
                        <p className="font-medium">{selectedDisruption.disruptionReason}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedDisruption.detailedDescription}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weather and Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CloudRain className="h-5 w-5" />
                        Weather Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Condition</Label>
                          <p className="font-medium">{selectedDisruption.weather.condition}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Visibility</Label>
                          <p className="font-medium">{selectedDisruption.weather.visibility}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Wind</Label>
                          <p className="font-medium">{selectedDisruption.weather.wind}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Temperature</Label>
                          <p className="font-medium">{selectedDisruption.weather.temperature}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Schedule Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">Scheduled Departure</Label>
                          <p```text
className="font-medium">{selectedDisruption.scheduledDeparture}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Estimated Departure</Label>
                          <p className="font-medium text-red-600">{selectedDisruption.estimatedDeparture}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Connecting Flights at Risk</Label>
                          <p className="font-medium">{selectedDisruption.impact.connectingFlights} flights</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Predictions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      AI-Powered Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-xs text-muted-foreground">Resolution Probability</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={selectedDisruption.predictions.resolutionProbability} className="flex-1" />
                          <span className="font-medium">{selectedDisruption.predictions.resolutionProbability}%</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Cascade Risk</Label>
                        <Badge className={
                          selectedDisruption.predictions.cascadeRisk === 'High' ? 'bg-red-100 text-red-700' :
                          selectedDisruption.predictions.cascadeRisk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {selectedDisruption.predictions.cascadeRisk}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Network Impact</Label>
                        <Badge className={
                          selectedDisruption.predictions.networkImpact === 'High' ? 'bg-red-100 text-red-700' :
                          selectedDisruption.predictions.networkImpact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {selectedDisruption.predictions.networkImpact}
                        </Badge>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <Label className="text-xs text-muted-foreground">AI Recommendation</Label>
                      <p className="font-medium text-blue-700 mt-1">{selectedDisruption.predictions.aiRecommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Maintenance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Issue Reported</Label>
                          <p className="font-medium">{selectedDisruption.maintenance.issueReported}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Assigned Technician</Label>
                          <p className="font-medium">{selectedDisruption.maintenance.technician}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Work Order</Label>
                          <p className="font-mono font-medium">{selectedDisruption.maintenance.workOrderNumber}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Estimated Repair Time</Label>
                          <p className="font-medium">{selectedDisruption.maintenance.estimatedRepairTime}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Parts Required</Label>
                          <p className="font-medium">{selectedDisruption.maintenance.partsRequired}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <Badge className={
                            selectedDisruption.maintenance.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            selectedDisruption.maintenance.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {selectedDisruption.maintenance.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crew" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Crew Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(selectedDisruption.crewMembers || []).map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>Duty: {member.dutyTime}</span>
                                <span>Rest: {member.restTime}</span>
                                <span>{member.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={
                              member.status === 'Available' ? 'bg-green-100 text-green-700' :
                              member.status === 'On Duty' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {member.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="passengers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Passenger Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Notifications Sent</Label>
                          <p className="font-medium">{selectedDisruption.passengerServices.notifications}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Vouchers Issued</Label>
                          <p className="font-medium">{selectedDisruption.passengerServices.vouchers}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Rebooking Status</Label>
                          <p className="font-medium">{selectedDisruption.passengerServices.rebooking}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Customer Service Calls</Label>
                          <p className="font-medium">{selectedDisruption.passengerServices.customerServiceCalls}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Complaints</Label>
                          <p className="font-medium">{selectedDisruption.passengerServices.complaints}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Total Passengers</Label>
                          <p className="font-medium">{selectedDisruption.passengers}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="options" className="space-y-6">
                <div className="space-y-4">
                  {(selectedDisruption.alternatives || []).map((option, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{option.option}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">
                              {option.success}% Success Rate
                            </Badge>
                            <Button size="sm" className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Select Option
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Aircraft</Label>
                            <p className="font-medium">{option.aircraft}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Estimated Cost</Label>
                            <p className="font-medium">${option.cost.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Additional Delay</Label>
                            <p className="font-medium">{option.delay} minutes</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Success Probability</Label>
                            <div className="flex items-center gap-2">
                              <Progress value={option.success} className="w-16" />
                              <span className="text-sm font-medium">{option.success}%</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="impact" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Estimated Recovery Cost</span>
                          <span className="font-medium">${selectedDisruption.impact.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue at Risk</span>
                          <span className="font-medium">${selectedDisruption.impact.revenueAtRisk.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compensation Required</span>
                          <span className="font-medium">${selectedDisruption.impact.compensationRequired.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Financial Impact</span>
                          <span>${(selectedDisruption.impact.estimatedCost + selectedDisruption.impact.compensationRequired).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Operational Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Affected Passengers</span>
                          <span className="font-medium">{selectedDisruption.impact.passengers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connecting Flights</span>
                          <span className="font-medium">{selectedDisruption.impact.connectingFlights}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network Impact</span>
                          <Badge className={
                            selectedDisruption.predictions.networkImpact === 'High' ? 'bg-red-100 text-red-700' :
                            selectedDisruption.predictions.networkImpact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {selectedDisruption.predictions.networkImpact}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Cascade Risk</span>
                          <Badge className={
                            selectedDisruption.predictions.cascadeRisk === 'High' ? 'bg-red-100 text-red-700' :
                            selectedDisruption.predictions.cascadeRisk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {selectedDisruption.predictions.cascadeRisk}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedDisruption(null)}>
                Close
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              <Button className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Create Recovery Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}