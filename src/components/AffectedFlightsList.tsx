import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { 
  Plane, 
  Users, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search,
  RefreshCw,
  FileText,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Alert } from './ui/alert'
import { databaseService, FlightDisruption, PassengerData } from '../services/databaseService'

const FLIGHTS_PER_PAGE = 10;

export function AffectedFlightsList() {
  const [flights, setFlights] = useState<FlightDisruption[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightDisruption | null>(null)
  const [passengers, setPassengers] = useState<PassengerData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPassengers, setLoadingPassengers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    type: 'all',
    origin: 'all',
    destination: 'all',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFlights()
    const interval = setInterval(fetchFlights, 60000) // Refresh every 60 seconds instead of 30
    return () => clearInterval(interval)
  }, [])

  const fetchFlights = async () => {
    try {
      setError(null)
      const data = await databaseService.getAllDisruptions()
      setFlights(data)
      if (data.length === 0) {
        console.log('No flight disruptions found in database')
      }
    } catch (error) {
      console.error('Error fetching flights:', error)
      setError('Failed to load flight data. Please check your connection and try again.')
      setFlights([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPassengers = async (flightNumber: string) => {
    setLoadingPassengers(true)
    try {
      const data = await databaseService.getPassengersByFlight(flightNumber)
      setPassengers(data)
    } catch (error) {
      console.error('Error fetching passengers:', error)
      setPassengers([])
    } finally {
      setLoadingPassengers(false)
    }
  }

  const handleFlightSelect = async (flight: FlightDisruption) => {
    setSelectedFlight(flight)
    await fetchPassengers(flight.flightNumber)
  }

  const filteredFlights = flights.filter(flight => {
    if (filters.status !== 'all' && flight.status !== filters.status) return false
    if (filters.severity !== 'all' && flight.severity !== filters.severity) return false
    if (filters.type !== 'all' && flight.type !== filters.type) return false
    if (filters.origin !== 'all' && flight.origin !== filters.origin) return false
    if (filters.destination !== 'all' && flight.destination !== filters.destination) return false
    if (filters.search && !flight.flightNumber.toLowerCase().includes(filters.search.toLowerCase()) && 
        !flight.route.toLowerCase().includes(filters.search.toLowerCase()) &&
        !flight.originCity.toLowerCase().includes(filters.search.toLowerCase()) &&
        !flight.destinationCity.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const inboundFlights = flights.filter(flight => flight.destination === 'DXB');
  const outboundFlights = flights.filter(flight => flight.origin === 'DXB');

  const startIndex = (currentPage - 1) * FLIGHTS_PER_PAGE;
  const endIndex = startIndex + FLIGHTS_PER_PAGE;
  const paginatedFlights = filteredFlights.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredFlights.length / FLIGHTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-red-100 text-red-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      case 'Cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLoyaltyColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading affected flights...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Affected Flights</h2>
            <p className="text-muted-foreground">
              Monitor and manage flights affected by disruptions
            </p>
          </div>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchFlights} className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Affected Flights</h2>
          <p className="text-muted-foreground">
            Monitor and manage flights affected by disruptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFlights} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border-flydubai-orange text-flydubai-orange hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" />
                Add Disruption
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-flydubai-navy">
                  Add New Flight Disruption
                </DialogTitle>
                <DialogDescription>
                  Add a new flight disruption to the affected flights list
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Please navigate to the Disruption page to add new flight disruptions.
                </p>
                <Button 
                  onClick={() => window.location.href = '/disruption'} 
                  className="mt-4 bg-flydubai-orange hover:bg-orange-600 text-white"
                >
                  Go to Disruption Page
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Flight number or city"
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Select value={filters.origin} onValueChange={(value) => setFilters({...filters, origin: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All origins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Origins</SelectItem>
                  {[...new Set(flights.map(f => f.origin))].sort().map(origin => (
                    <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Select value={filters.destination} onValueChange={(value) => setFilters({...filters, destination: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All destinations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {[...new Set(flights.map(f => f.destination))].sort().map(dest => (
                    <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Diverted">Diverted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={filters.severity} onValueChange={(value) => setFilters({...filters, severity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Weather">Weather</SelectItem>
                  <SelectItem value="Crew">Crew</SelectItem>
                  <SelectItem value="Airport">Airport</SelectItem>
                  <SelectItem value="Rotation">Rotation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({status: 'all', severity: 'all', type: 'all', origin: 'all', destination: 'all', search: ''})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{filteredFlights.length}</p>
                <p className="text-xs text-muted-foreground">Total Flights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {filteredFlights.reduce((sum, flight) => sum + flight.passengers, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Affected Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {filteredFlights.filter(f => f.status === 'Active').length}
                </p>
                <p className="text-xs text-muted-foreground">Active Disruptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {Math.round(filteredFlights.reduce((sum, flight) => sum + flight.delay, 0) / Math.max(filteredFlights.length, 1))}m
                </p>
                <p className="text-xs text-muted-foreground">Avg Delay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flights List */}
      <Card>
        <CardHeader>
          <CardTitle>Affected Flights ({filteredFlights.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inbound" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbound">Inbound</TabsTrigger>
              <TabsTrigger value="outbound">Outbound</TabsTrigger>
            </TabsList>

            <TabsContent value="inbound" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Flights arriving at Dubai International Airport (DXB)
              </div>
              {/* Group flights by route direction */}
              {(() => {
                const groupedFlights = inboundFlights.reduce((groups, flight) => {
                  const routeKey = `${flight.originCity} → ${flight.destinationCity}`
                  if (!groups[routeKey]) {
                    groups[routeKey] = []
                  }
                  groups[routeKey].push(flight)
                  return groups
                }, {} as Record<string, typeof inboundFlights>)

                return Object.entries(groupedFlights).map(([route, routeFlights]) => (
                  <div key={route} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-flydubai-blue" />
                      <h3 className="font-semibold text-lg text-flydubai-blue">{route}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {routeFlights.length} flight{routeFlights.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-3 pl-6 border-l-2 border-gray-100">
                      {routeFlights.map((flight) => (
                        <Card 
                          key={flight.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleFlightSelect(flight)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex flex-col">
                                  <span className="font-mono font-bold text-lg">
                                    {flight.id && typeof flight.id === 'string' && flight.id.startsWith('UNKNOWN-') 
                                      ? (flight.flightNumber || '-')
                                      : flight.flightNumber}
                                  </span>
                                  <span className="text-sm text-muted-foreground">{flight.originCity} ({flight.origin}) → {flight.destinationCity} ({flight.destination})</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{flight.aircraft}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(flight.scheduledDeparture)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm">{flight.passengers}</span>
                                </div>
                                {flight.delay > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm text-orange-600">+{flight.delay}m</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getSeverityColor(flight.severity)}>
                                  {flight.severity}
                                </Badge>
                                <Badge className={getStatusColor(flight.status)}>
                                  {flight.status}
                                </Badge>
                              </div>
                            </div>
                            {flight.disruptionReason && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {flight.disruptionReason}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              })()}

              {inboundFlights.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plane className="h-8 w-8 text-gray-400 transform rotate-180" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inbound flights found</h3>
                  <p className="text-gray-500 mb-4">
                    {flights.length === 0 
                      ? "There are currently no flight disruptions in the system."
                      : "No inbound flights to DXB match your current filter criteria."
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="outbound" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Flights departing from Dubai International Airport (DXB)
              </div>
              {/* Group flights by route direction */}
              {(() => {
                const groupedFlights = outboundFlights.reduce((groups, flight) => {
                  const routeKey = `${flight.originCity} → ${flight.destinationCity}`
                  if (!groups[routeKey]) {
                    groups[routeKey] = []
                  }
                  groups[routeKey].push(flight)
                  return groups
                }, {} as Record<string, typeof outboundFlights>)

                return Object.entries(groupedFlights).slice(startIndex, endIndex).map(([route, routeFlights]) => (
                  <div key={route} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-flydubai-blue" />
                      <h3 className="font-semibold text-lg text-flydubai-blue">{route}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {routeFlights.length} flight{routeFlights.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-3 pl-6 border-l-2 border-gray-100">
                      {routeFlights.map((flight) => (
                        <Card 
                          key={flight.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleFlightSelect(flight)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex flex-col">
                                  <span className="font-mono font-bold text-lg">
                                    {flight.id && typeof flight.id === 'string' && flight.id.startsWith('UNKNOWN-') 
                                      ? (flight.flightNumber || '-')
                                      : flight.flightNumber}
                                  </span>
                                  <span className="text-sm text-muted-foreground">{flight.originCity} ({flight.origin}) → {flight.destinationCity} ({flight.destination})</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{flight.aircraft}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(flight.scheduledDeparture)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm">{flight.passengers}</span>
                                </div>
                                {flight.delay > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm text-orange-600">+{flight.delay}m</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getSeverityColor(flight.severity)}>
                                  {flight.severity}
                                </Badge>
                                <Badge className={getStatusColor(flight.status)}>
                                  {flight.status}
                                </Badge>
                              </div>
                            </div>
                            {flight.disruptionReason && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {flight.disruptionReason}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              })()}

              {outboundFlights.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plane className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No outbound flights found</h3>
                  <p className="text-gray-500 mb-4">
                    {flights.length === 0 
                      ? "There are currently no flight disruptions in the system."
                      : "No outbound flights from DXB match your current filter criteria."
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination Navigation */}
          {filteredFlights.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <Button
                      variant={1 === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(1)}
                      size="sm"
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="text-muted-foreground">...</span>}
                  </>
                )}

                {/* Page numbers around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                  .map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-muted-foreground">...</span>}
                    <Button
                      variant={totalPages === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(totalPages)}
                      size="sm"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flight Details Dialog */}
      {selectedFlight && (
        <Dialog open={!!selectedFlight} onOpenChange={() => setSelectedFlight(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flight {selectedFlight.flightNumber} Details
              </DialogTitle>
              <DialogDescription>
                Comprehensive information for {selectedFlight.route}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="passengers">Passengers ({passengers.length})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Flight Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Flight Number:</span>
                        <span className="font-mono">{selectedFlight.flightNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Route:</span>
                        <span>{selectedFlight.route}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origin:</span>
                        <span>{selectedFlight.originCity} ({selectedFlight.origin})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination:</span>
                        <span>{selectedFlight.destinationCity} ({selectedFlight.destination})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aircraft:</span>
                        <span>{selectedFlight.aircraft}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passengers:</span>
                        <span>{selectedFlight.passengers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Crew:</span>
                        <span>{selectedFlight.crew}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Disruption Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{selectedFlight.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Severity:</span>
                        <Badge className={getSeverityColor(selectedFlight.severity)}>
                          {selectedFlight.severity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedFlight.status)}>
                          {selectedFlight.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delay:</span>
                        <span>{selectedFlight.delay} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scheduled:</span>
                        <span>{formatDateTime(selectedFlight.scheduledDeparture)}</span>
                      </div>
                      {selectedFlight.estimatedDeparture && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated:</span>
                          <span>{formatDateTime(selectedFlight.estimatedDeparture)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {selectedFlight.disruptionReason && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Disruption Reason</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedFlight.disruptionReason}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="passengers" className="space-y-4">
                {loadingPassengers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading passengers...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passengers.map((passenger) => (
                      <Card key={passenger.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <User className="h-8 w-8 text-blue-600" />
                              <div>
                                <p className="font-medium">{passenger.name}</p>
                                <p className="text-sm text-muted-foreground">PNR: {passenger.pnr}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm font-medium">{passenger.seatNumber || 'No seat'}</p>
                                <p className="text-xs text-muted-foreground">{passenger.ticketClass}</p>
                              </div>
                              <Badge className={getLoyaltyColor(passenger.loyaltyTier)}>
                                {passenger.loyaltyTier}
                              </Badge>
                              {passenger.rebookingStatus && (
                                <Badge variant="outline">
                                  {passenger.rebookingStatus}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {passenger.specialNeeds && (
                            <p className="text-sm text-orange-600 mt-2">
                              Special Needs: {passenger.specialNeeds}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {passengers.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No passenger data found</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Flight Created</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(selectedFlight.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Disruption Detected</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedFlight.type} - {selectedFlight.disruptionReason}
                          </p>
                        </div>
                      </div>
                      {selectedFlight.status === 'Resolved' && (
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Disruption Resolved</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(selectedFlight.updatedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}