
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
import { Separator } from './ui/separator'
import { 
  AlertTriangle, 
  Plane, 
  Users, 
  Clock, 
  MapPin, 
  Filter,
  Search,
  Eye,
  RefreshCw,
  Plus,
  FileText
} from 'lucide-react'

interface AffectedFlight {
  id: string
  flight_number: string
  route: string
  aircraft: string
  scheduled_departure: string
  estimated_departure: string | null
  delay_minutes: number
  passengers: number
  crew: number
  severity: string
  disruption_type: string
  status: string
  disruption_reason: string
  created_at: string
  updated_at: string
}

export function AffectedFlightsList() {
  const [flights, setFlights] = useState<AffectedFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    search: ''
  })

  useEffect(() => {
    const fetchAffectedFlights = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await databaseService.getAllDisruptions()
        setFlights(data)
      } catch (error) {
        console.error('Error fetching affected flights:', error)
        setError('Failed to load affected flights. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAffectedFlights()
    // Refresh every 30 seconds
    const interval = setInterval(fetchAffectedFlights, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredFlights = flights.filter(flight => {
    return (
      (filters.severity === 'all' || flight.severity.toLowerCase() === filters.severity) &&
      (filters.type === 'all' || flight.disruption_type.toLowerCase() === filters.type) &&
      (filters.status === 'all' || flight.status.toLowerCase() === filters.status) &&
      (filters.search === '' || 
        flight.flight_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        flight.route.toLowerCase().includes(filters.search.toLowerCase()) ||
        flight.disruption_reason.toLowerCase().includes(filters.search.toLowerCase())
      )
    )
  })

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-red-100 text-red-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2">Loading affected flights...</span>
        </div>
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
            Real-time list of all flights experiencing disruptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Total Affected</p>
                <p className="text-2xl font-semibold text-red-900">{filteredFlights.length}</p>
                <p className="text-xs text-red-600">Flights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600">Total Passengers</p>
                <p className="text-2xl font-semibold text-orange-900">
                  {filteredFlights.reduce((sum, flight) => sum + flight.passengers, 0).toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">Affected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600">Average Delay</p>
                <p className="text-2xl font-semibold text-yellow-900">
                  {filteredFlights.length > 0 
                    ? Math.round(filteredFlights.reduce((sum, flight) => sum + flight.delay_minutes, 0) / filteredFlights.length)
                    : 0
                  } min
                </p>
                <p className="text-xs text-yellow-600">Per flight</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Active Disruptions</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {filteredFlights.filter(f => f.status.toLowerCase() === 'active').length}
                </p>
                <p className="text-xs text-blue-600">Ongoing</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Affected Flights List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFlights.length === 0 ? (
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No affected flights found</h3>
              <p className="text-gray-600">
                {flights.length === 0 
                  ? "There are currently no flight disruptions in the system."
                  : "No flights match the current filter criteria."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Scheduled Departure</TableHead>
                  <TableHead>Estimated Departure</TableHead>
                  <TableHead>Delay</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-medium">{flight.flight_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{flight.route}</TableCell>
                    <TableCell className="font-mono">{flight.aircraft}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(flight.scheduled_departure)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {flight.estimated_departure 
                        ? formatDateTime(flight.estimated_departure)
                        : 'TBD'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className={`font-medium ${flight.delay_minutes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {flight.delay_minutes > 0 ? `+${flight.delay_minutes}m` : 'On Time'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{flight.passengers}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(flight.severity)}>
                        {flight.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(flight.status)}>
                        {flight.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48">
                        <p className="text-sm truncate">{flight.disruption_reason}</p>
                        <p className="text-xs text-muted-foreground capitalize">{flight.disruption_type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
