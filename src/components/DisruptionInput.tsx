'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Alert, AlertDescription } from './ui/alert'
import { Checkbox } from './ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { 
  AlertTriangle, 
  Plane, 
  Users, 
  Clock, 
  MapPin, 
  Filter, 
  Search,
  ArrowRight,
  RefreshCw,
  Eye,
  Zap,
  TrendingUp,
  CalendarDays,
  Timer,
  Plus,
  Save,
  X
} from 'lucide-react'

// Mock flight data affected by disruptions
const affectedFlights = [
  {
    id: 'FL_001',
    flightNumber: 'FZ215',
    origin: 'DXB',
    destination: 'BOM', 
    originCity: 'Dubai',
    destinationCity: 'Mumbai',
    scheduledDeparture: '2025-01-10T15:30:00',
    scheduledArrival: '2025-01-10T20:15:00',
    currentStatus: 'Delayed',
    delay: 120,
    aircraft: 'B737-800',
    gate: 'T2-B12',
    passengers: 189,
    crew: 6,
    disruptionType: 'weather',
    categorization: 'ATC/weather delay',
    disruptionReason: 'Sandstorm at DXB',
    severity: 'high',
    impact: 'Departure delayed due to sandstorm at DXB',
    lastUpdate: '2 mins ago',
    priority: 'High',
    connectionFlights: 8,
    vipPassengers: 4
  },
  {
    id: 'FL_002',
    flightNumber: 'FZ203',
    origin: 'DXB',
    destination: 'DEL',
    originCity: 'Dubai', 
    destinationCity: 'Delhi',
    scheduledDeparture: '2025-01-10T16:45:00',
    scheduledArrival: '2025-01-10T21:20:00',
    currentStatus: 'Cancelled',
    delay: null,
    aircraft: 'B737 MAX 8',
    gate: 'T2-A08',
    passengers: 195,
    crew: 6,
    disruptionType: 'weather',
    categorization: 'ATC/weather delay',
    disruptionReason: 'Dense fog at DEL',
    severity: 'high',
    impact: 'Flight cancelled due to severe fog at DEL',
    lastUpdate: '5 mins ago',
    priority: 'Critical',
    connectionFlights: 5,
    vipPassengers: 3
  },
  {
    id: 'FL_003',
    flightNumber: 'FZ235',
    origin: 'KHI',
    destination: 'DXB',
    originCity: 'Karachi',
    destinationCity: 'Dubai',
    scheduledDeparture: '2025-01-10T08:30:00',
    scheduledArrival: '2025-01-10T11:45:00',
    currentStatus: 'Diverted',
    delay: 180,
    aircraft: 'B737-800',
    gate: 'T2-C15',
    passengers: 181,
    crew: 6,
    disruptionType: 'airport',
    categorization: 'Airport curfew/ramp congestion',
    disruptionReason: 'DXB runway closure',
    severity: 'medium',
    impact: 'Diverted to AUH due to DXB closure',
    lastUpdate: '8 mins ago',
    priority: 'High',
    connectionFlights: 7,
    vipPassengers: 2
  },
  {
    id: 'FL_004',
    flightNumber: 'FZ147',
    origin: 'IST',
    destination: 'DXB',
    originCity: 'Istanbul',
    destinationCity: 'Dubai',
    scheduledDeparture: '2025-01-10T21:15:00',
    scheduledArrival: '2025-01-11T03:30:00',
    currentStatus: 'Delayed',
    delay: 45,
    aircraft: 'B737 MAX 8',
    gate: 'T2-A15',
    passengers: 189,
    crew: 6,
    disruptionType: 'technical',
    categorization: 'Aircraft issue (e.g., AOG)',
    disruptionReason: 'Engine maintenance check',
    severity: 'medium',
    impact: 'Aircraft maintenance check delay',
    lastUpdate: '12 mins ago',
    priority: 'Medium',
    connectionFlights: 4,
    vipPassengers: 2
  },
  {
    id: 'FL_005',
    flightNumber: 'FZ181',
    origin: 'DXB',
    destination: 'COK',
    originCity: 'Dubai',
    destinationCity: 'Kochi',
    scheduledDeparture: '2025-01-10T14:20:00',
    scheduledArrival: '2025-01-10T19:45:00',
    currentStatus: 'Delayed',
    delay: 90,
    aircraft: 'B737-800',
    gate: 'T2-B12',
    passengers: 175,
    crew: 6,
    disruptionType: 'crew',
    categorization: 'Crew issue (e.g., sick report, duty time breach)',
    disruptionReason: 'Crew duty time breach',
    severity: 'medium',
    impact: 'Crew duty time limitation',
    lastUpdate: '15 mins ago',
    priority: 'Medium',
    connectionFlights: 3,
    vipPassengers: 1
  },
  {
    id: 'FL_006',
    flightNumber: 'FZ329',
    origin: 'DXB',
    destination: 'KHI',
    originCity: 'Dubai',
    destinationCity: 'Karachi',
    scheduledDeparture: '2025-01-10T09:15:00',
    scheduledArrival: '2025-01-10T11:30:00',
    currentStatus: 'Delayed',
    delay: 240,
    aircraft: 'B737 MAX 8',
    gate: 'T2-A22',
    passengers: 168,
    crew: 6,
    disruptionType: 'rotation',
    categorization: 'Rotation misalignment or maintenance hold',
    disruptionReason: 'Aircraft late from previous sector',
    severity: 'high',
    impact: 'Aircraft rotation schedule disrupted',
    lastUpdate: '3 mins ago',
    priority: 'High',
    connectionFlights: 6,
    vipPassengers: 3
  }
]

export function DisruptionInput({ disruption, onSelectFlight }) {
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [flights, setFlights] = useState(affectedFlights)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    origin: 'all',
    categorization: 'all',
    search: ''
  })
  const [sortBy, setSortBy] = useState('priority')
  const [view, setView] = useState('table')
  const [newDisruption, setNewDisruption] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    originCity: '',
    destinationCity: '',
    scheduledDeparture: '',
    scheduledArrival: '',
    currentStatus: 'Delayed',
    delay: '',
    aircraft: '',
    gate: '',
    passengers: '',
    crew: 6,
    disruptionType: 'technical',
    categorization: 'Aircraft issue (e.g., AOG)',
    disruptionReason: '',
    severity: 'medium',
    impact: '',
    priority: 'Medium',
    connectionFlights: '',
    vipPassengers: ''
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'Delayed': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Diverted': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white'
      case 'High': return 'bg-orange-500 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getDisruptionIcon = (type) => {
    switch (type) {
      case 'weather': return '🌩️'
      case 'technical': return '🔧'
      case 'crew': return '👥'
      case 'air_traffic': return '✈️'
      case 'airport': return '🏗️'
      case 'rotation': return '🔄'
      default: return '⚠️'
    }
  }

  const getCategorizationColor = (categorization) => {
    switch (categorization) {
      case 'Aircraft issue (e.g., AOG)': return 'bg-red-100 text-red-700 border-red-200'
      case 'Crew issue (e.g., sick report, duty time breach)': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ATC/weather delay': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Airport curfew/ramp congestion': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Rotation misalignment or maintenance hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  // Filter flights based on current filters
  const filteredFlights = flights.filter(flight => {
    if (filters.status !== 'all' && flight.currentStatus !== filters.status) return false
    if (filters.priority !== 'all' && flight.priority !== filters.priority) return false
    if (filters.origin !== 'all' && flight.origin !== filters.origin) return false
    if (filters.categorization !== 'all' && flight.categorization !== filters.categorization) return false
    if (filters.search && !flight.flightNumber.toLowerCase().includes(filters.search.toLowerCase()) && 
        !flight.originCity.toLowerCase().includes(filters.search.toLowerCase()) &&
        !flight.destinationCity.toLowerCase().includes(filters.search.toLowerCase()) &&
        !flight.disruptionReason.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  // Sort flights
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'departure':
        return new Date(a.scheduledDeparture) - new Date(b.scheduledDeparture)
      case 'passengers':
        return b.passengers - a.passengers
      case 'delay':
        return (b.delay || 0) - (a.delay || 0)
      default:
        return 0
    }
  })

  const handleFlightSelection = (flight) => {
    setSelectedFlight(flight)
  }

  const handleProceedToRecovery = () => {
    if (selectedFlight) {
      onSelectFlight([selectedFlight])
    }
  }

  const getSelectedFlightImpact = () => {
    if (!selectedFlight) {
      return {
        flights: 0,
        passengers: 0,
        connections: 0
      }
    }
    return {
      flights: 1,
      passengers: selectedFlight.passengers,
      connections: selectedFlight.connectionFlights
    }
  }

  const impact = getSelectedFlightImpact()

  // Handle adding new disruption
  const handleAddDisruption = () => {
    const newFlight = {
      id: `FL_${String(flights.length + 1).padStart(3, '0')}`,
      ...newDisruption,
      delay: newDisruption.delay ? parseInt(newDisruption.delay) : null,
      passengers: parseInt(newDisruption.passengers),
      crew: parseInt(newDisruption.crew),
      connectionFlights: parseInt(newDisruption.connectionFlights),
      vipPassengers: parseInt(newDisruption.vipPassengers),
      lastUpdate: 'Just now'
    }
    
    setFlights([...flights, newFlight])
    setIsAddDialogOpen(false)
    
    // Reset form
    setNewDisruption({
      flightNumber: '',
      origin: '',
      destination: '',
      originCity: '',
      destinationCity: '',
      scheduledDeparture: '',
      scheduledArrival: '',
      currentStatus: 'Delayed',
      delay: '',
      aircraft: '',
      gate: '',
      passengers: '',
      crew: 6,
      disruptionType: 'technical',
      categorization: 'Aircraft issue (e.g., AOG)',
      disruptionReason: '',
      severity: 'medium',
      impact: '',
      priority: 'Medium',
      connectionFlights: '',
      vipPassengers: ''
    })
  }

  // Handle input changes for new disruption form
  const handleInputChange = (field, value) => {
    setNewDisruption(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Affected Flights Overview</h2>
          <p className="text-muted-foreground">Select a single flight to generate AERON recovery options</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {sortedFlights.length} flights affected
          </Badge>
          {selectedFlight && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {selectedFlight.flightNumber} selected
            </Badge>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-flydubai-orange text-flydubai-orange hover:bg-orange-50">
                <Plus className="h-4 w-4 mr-2" />
                Add Disruption
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-flydubai-navy">Add New Flight Disruption</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Flight Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-flydubai-navy">Flight Information</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="flightNumber">Flight Number*</Label>
                      <Input
                        id="flightNumber"
                        placeholder="FZ123"
                        value={newDisruption.flightNumber}
                        onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="aircraft">Aircraft Type*</Label>
                      <Select value={newDisruption.aircraft} onValueChange={(value) => handleInputChange('aircraft', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aircraft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B737-800">B737-800</SelectItem>
                          <SelectItem value="B737 MAX 8">B737 MAX 8</SelectItem>
                          <SelectItem value="B737-900ER">B737-900ER</SelectItem>
                          <SelectItem value="A320">A320</SelectItem>
                          <SelectItem value="A321">A321</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="origin">Origin*</Label>
                      <Select value={newDisruption.origin} onValueChange={(value) => handleInputChange('origin', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DXB">DXB - Dubai</SelectItem>
                          <SelectItem value="AUH">AUH - Abu Dhabi</SelectItem>
                          <SelectItem value="SLL">SLL - Salalah</SelectItem>
                          <SelectItem value="KHI">KHI - Karachi</SelectItem>
                          <SelectItem value="BOM">BOM - Mumbai</SelectItem>
                          <SelectItem value="DEL">DEL - Delhi</SelectItem>
                          <SelectItem value="COK">COK - Kochi</SelectItem>
                          <SelectItem value="CMB">CMB - Colombo</SelectItem>
                          <SelectItem value="IST">IST - Istanbul</SelectItem>
                          <SelectItem value="BCN">BCN - Barcelona</SelectItem>
                          <SelectItem value="PRG">PRG - Prague</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="originCity">Origin City</Label>
                      <Input
                        id="originCity"
                        placeholder="Dubai"
                        value={newDisruption.originCity}
                        onChange={(e) => handleInputChange('originCity', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="destination">Destination*</Label>
                      <Select value={newDisruption.destination} onValueChange={(value) => handleInputChange('destination', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DXB">DXB - Dubai</SelectItem>
                          <SelectItem value="AUH">AUH - Abu Dhabi</SelectItem>
                          <SelectItem value="SLL">SLL - Salalah</SelectItem>
                          <SelectItem value="KHI">KHI - Karachi</SelectItem>
                          <SelectItem value="BOM">BOM - Mumbai</SelectItem>
                          <SelectItem value="DEL">DEL - Delhi</SelectItem>
                          <SelectItem value="COK">COK - Kochi</SelectItem>
                          <SelectItem value="CMB">CMB - Colombo</SelectItem>
                          <SelectItem value="IST">IST - Istanbul</SelectItem>
                          <SelectItem value="BCN">BCN - Barcelona</SelectItem>
                          <SelectItem value="PRG">PRG - Prague</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="destinationCity">Destination City</Label>
                      <Input
                        id="destinationCity"
                        placeholder="Mumbai"
                        value={newDisruption.destinationCity}
                        onChange={(e) => handleInputChange('destinationCity', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="scheduledDeparture">Scheduled Departure*</Label>
                      <Input
                        id="scheduledDeparture"
                        type="datetime-local"
                        value={newDisruption.scheduledDeparture}
                        onChange={(e) => handleInputChange('scheduledDeparture', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledArrival">Scheduled Arrival*</Label>
                      <Input
                        id="scheduledArrival"
                        type="datetime-local"
                        value={newDisruption.scheduledArrival}
                        onChange={(e) => handleInputChange('scheduledArrival', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="gate">Gate</Label>
                      <Input
                        id="gate"
                        placeholder="T2-B12"
                        value={newDisruption.gate}
                        onChange={(e) => handleInputChange('gate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passengers">Passengers*</Label>
                      <Input
                        id="passengers"
                        type="number"
                        placeholder="189"
                        value={newDisruption.passengers}
                        onChange={(e) => handleInputChange('passengers', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="crew">Crew</Label>
                      <Input
                        id="crew"
                        type="number"
                        value={newDisruption.crew}
                        onChange={(e) => handleInputChange('crew', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Disruption Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-flydubai-navy">Disruption Details</h3>
                  
                  <div>
                    <Label htmlFor="currentStatus">Current Status*</Label>
                    <Select value={newDisruption.currentStatus} onValueChange={(value) => handleInputChange('currentStatus', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Delayed">Delayed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Diverted">Diverted</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="delay">Delay (minutes)</Label>
                      <Input
                        id="delay"
                        type="number"
                        placeholder="120"
                        value={newDisruption.delay}
                        onChange={(e) => handleInputChange('delay', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority*</Label>
                      <Select value={newDisruption.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="categorization">Disruption Categorization*</Label>
                    <Select value={newDisruption.categorization} onValueChange={(value) => handleInputChange('categorization', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aircraft issue (e.g., AOG)">Aircraft issue (e.g., AOG)</SelectItem>
                        <SelectItem value="Crew issue (e.g., sick report, duty time breach)">Crew issue (e.g., sick report, duty time breach)</SelectItem>
                        <SelectItem value="ATC/weather delay">ATC/weather delay</SelectItem>
                        <SelectItem value="Airport curfew/ramp congestion">Airport curfew/ramp congestion</SelectItem>
                        <SelectItem value="Rotation misalignment or maintenance hold">Rotation misalignment or maintenance hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="disruptionType">Disruption Type</Label>
                      <Select value={newDisruption.disruptionType} onValueChange={(value) => handleInputChange('disruptionType', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                          <SelectItem value="crew">Crew</SelectItem>
                          <SelectItem value="airport">Airport</SelectItem>
                          <SelectItem value="rotation">Rotation</SelectItem>
                          <SelectItem value="air_traffic">Air Traffic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="severity">Severity*</Label>
                      <Select value={newDisruption.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="disruptionReason">Disruption Reason*</Label>
                    <Input
                      id="disruptionReason"
                      placeholder="Engine maintenance check required"
                      value={newDisruption.disruptionReason}
                      onChange={(e) => handleInputChange('disruptionReason', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="impact">Impact Description</Label>
                    <Textarea
                      id="impact"
                      placeholder="Brief description of the impact..."
                      value={newDisruption.impact}
                      onChange={(e) => handleInputChange('impact', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="connectionFlights">Connection Flights</Label>
                      <Input
                        id="connectionFlights"
                        type="number"
                        placeholder="8"
                        value={newDisruption.connectionFlights}
                        onChange={(e) => handleInputChange('connectionFlights', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vipPassengers">VIP Passengers</Label>
                      <Input
                        id="vipPassengers"
                        type="number"
                        placeholder="4"
                        value={newDisruption.vipPassengers}
                        onChange={(e) => handleInputChange('vipPassengers', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddDisruption}
                  className="bg-flydubai-orange hover:bg-orange-600 text-white"
                  disabled={!newDisruption.flightNumber || !newDisruption.origin || !newDisruption.destination || !newDisruption.passengers}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Disruption
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Context Alert */}
      {disruption && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Disruption Context:</strong> {disruption.title} at {disruption.airport?.toUpperCase()} - 
            {disruption.affectedFlights} flights impacted. Last updated {disruption.lastUpdate}.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={selectedFlight && selectedFlight.priority === 'Critical' ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Flights</p>
                <p className="text-lg font-semibold text-red-600">
                  {sortedFlights.filter(f => f.priority === 'Critical').length}
                </p>
                {selectedFlight && selectedFlight.priority === 'Critical' && (
                  <p className="text-xs text-red-600">Selected flight is critical</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={selectedFlight ? 'border-blue-200 bg-blue-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight ? 'Selected Flight Passengers' : 'Total Passengers'}
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {selectedFlight ? 
                    selectedFlight.passengers.toLocaleString() : 
                    sortedFlights.reduce((sum, f) => sum + f.passengers, 0).toLocaleString()
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={selectedFlight ? 'border-green-200 bg-green-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight ? 'Selected Flight Connections' : 'Total Connections'}
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {selectedFlight ? 
                    selectedFlight.connectionFlights : 
                    sortedFlights.reduce((sum, f) => sum + f.connectionFlights, 0)
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={selectedFlight && selectedFlight.delay ? 'border-purple-200 bg-purple-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight ? 'Selected Flight Delay' : 'Avg Delay'}
                </p>
                <p className="text-lg font-semibold text-purple-600">
                  {selectedFlight ? 
                    (selectedFlight.delay ? `${selectedFlight.delay}m` : '0m') : 
                    `${Math.round(sortedFlights.filter(f => f.delay).reduce((sum, f) => sum + f.delay, 0) / 
                      sortedFlights.filter(f => f.delay).length || 0)}m`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Sort Flights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input 
                  placeholder="Flight, city, reason..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Diverted">Diverted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Origin</label>
              <Select value={filters.origin} onValueChange={(value) => setFilters({...filters, origin: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All origins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Origins</SelectItem>
                  <SelectItem value="DXB">DXB</SelectItem>
                  <SelectItem value="KHI">KHI</SelectItem>
                  <SelectItem value="IST">IST</SelectItem>
                  <SelectItem value="BOM">BOM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Categorization</label>
              <Select value={filters.categorization} onValueChange={(value) => setFilters({...filters, categorization: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Aircraft issue (e.g., AOG)">Aircraft issue (e.g., AOG)</SelectItem>
                  <SelectItem value="Crew issue (e.g., sick report, duty time breach)">Crew issue (e.g., sick report, duty time breach)</SelectItem>
                  <SelectItem value="ATC/weather delay">ATC/weather delay</SelectItem>
                  <SelectItem value="Airport curfew/ramp congestion">Airport curfew/ramp congestion</SelectItem>
                  <SelectItem value="Rotation misalignment or maintenance hold">Rotation misalignment or maintenance hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="departure">Departure Time</SelectItem>
                  <SelectItem value="passengers">Passenger Count</SelectItem>
                  <SelectItem value="delay">Delay Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flight Selection ({selectedFlight ? '1 selected' : 'None selected'})</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Click a row to select flight</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categorization</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFlights.map((flight) => (
                  <TableRow 
                    key={flight.id} 
                    className={`cursor-pointer hover:bg-blue-50 ${selectedFlight?.id === flight.id ? 'bg-blue-100 border-blue-200' : ''}`}
                    onClick={() => handleFlightSelection(flight)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{flight.flightNumber}</div>
                        <div className="text-sm text-muted-foreground">{flight.aircraft}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{flight.origin}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{flight.destination}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flight.originCity} → {flight.destinationCity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatTime(flight.scheduledDeparture)}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(flight.scheduledDeparture)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(flight.currentStatus)}>
                        {flight.currentStatus}
                      </Badge>
                      {flight.delay && (
                        <div className="text-sm text-red-600 mt-1">+{flight.delay}m</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getCategorizationColor(flight.categorization)}>
                          {flight.categorization}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {flight.disruptionReason}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(flight.priority)}>
                        {flight.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{flight.passengers}</div>
                        <div className="text-sm text-muted-foreground">
                          {flight.connectionFlights} connections
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDisruptionIcon(flight.disruptionType)}</span>
                        <div>
                          <div className={`text-sm font-medium ${getSeverityColor(flight.severity)}`}>
                            {flight.severity} severity
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {flight.lastUpdate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectFlight([flight])
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary and Actions */}
      {selectedFlight && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Selected Flight for Recovery Planning</h4>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">{selectedFlight.flightNumber}</span>
                    <span className="text-blue-700 ml-1">selected</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">{impact.passengers.toLocaleString()}</span>
                    <span className="text-blue-700 ml-1">passengers affected</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">{impact.connections}</span>
                    <span className="text-blue-700 ml-1">connections at risk</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">{selectedFlight.categorization}</span>
                    <span className="text-blue-700 ml-1">disruption type</span>
                  </div>
                  {selectedFlight.lastUpdate === 'Just now' && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Recently Added
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button onClick={handleProceedToRecovery} className="bg-blue-600 hover:bg-blue-700">
                <ArrowRight className="h-4 w-4 mr-2" />
                Generate Recovery Options
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}