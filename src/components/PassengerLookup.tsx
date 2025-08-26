'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { Checkbox } from './ui/checkbox'
import { 
  Search, 
  Filter, 
  Users, 
  Plane,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  FileText
} from 'lucide-react'

export function PassengerLookup({ 
  passengers, 
  selectedPassengers, 
  onPassengerSelection, 
  onSelectAll, 
  onClearSelection 
}) {
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    passengerType: 'all',
    flightNumber: 'all',
    loyaltyTier: 'all',
    status: 'all',
    specialNeeds: false
  })

  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'

  const updateFilter = (key, value) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }))
  }

  const getFilteredPassengers = () => {
    return passengers.filter(passenger => {
      // Search term filter
      const matchesSearch = !searchFilters.searchTerm || 
        passenger.name.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
        passenger.pnr.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
        passenger.contact.toLowerCase().includes(searchFilters.searchTerm.toLowerCase())

      // Passenger type filter
      const matchesType = searchFilters.passengerType === 'all' || 
        passenger.type.toLowerCase() === searchFilters.passengerType

      // Flight number filter
      const matchesFlight = searchFilters.flightNumber === 'all' || 
        passenger.flight === searchFilters.flightNumber

      // Loyalty tier filter
      const matchesTier = searchFilters.loyaltyTier === 'all' || 
        passenger.loyaltyTier === searchFilters.loyaltyTier

      // Status filter
      const matchesStatus = searchFilters.status === 'all' || 
        passenger.status.toLowerCase().includes(searchFilters.status.toLowerCase())

      // Special needs filter
      const matchesSpecialNeeds = !searchFilters.specialNeeds || 
        passenger.specialNeeds.length > 0

      return matchesSearch && matchesType && matchesFlight && matchesTier && matchesStatus && matchesSpecialNeeds
    })
  }

  const filteredPassengers = getFilteredPassengers()

  const getPassengerTypeColor = (type) => {
    switch (type) {
      case 'Ticketed': return 'bg-green-100 text-green-700 border-green-200'
      case 'Ticketless': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'FIM': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Affected': return 'bg-red-100 text-red-700'
      case 'Pending Rebooking': return 'bg-yellow-100 text-yellow-700'
      case 'On FIM': return 'bg-blue-100 text-blue-700'
      case 'Rebooked': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleBulkAction = (action) => {
    if (selectedPassengers.length === 0) {
      alert('Please select passengers first')
      return
    }

    switch (action) {
      case 'rebook':
        alert(`Initiating bulk rebooking for ${selectedPassengers.length} passengers`)
        break
      case 'vouchers':
        alert(`Issuing meal vouchers to ${selectedPassengers.length} passengers`)
        break
      case 'notify':
        alert(`Sending notifications to ${selectedPassengers.length} passengers`)
        break
      case 'export':
        alert(`Exporting data for ${selectedPassengers.length} passengers`)
        break
    }
  }

  const clearAllFilters = () => {
    setSearchFilters({
      searchTerm: '',
      passengerType: 'all',
      flightNumber: 'all',
      loyaltyTier: 'all',
      status: 'all',
      specialNeeds: false
    })
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Passenger Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <Label htmlFor="search">Search Passengers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, PNR, or email..."
                  value={searchFilters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="type">Passenger Type</Label>
                <Select value={searchFilters.passengerType} onValueChange={(value) => updateFilter('passengerType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ticketed">Ticketed</SelectItem>
                    <SelectItem value="ticketless">Ticketless</SelectItem>
                    <SelectItem value="fim">FIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="flight">Flight</Label>
                <Select value={searchFilters.flightNumber} onValueChange={(value) => updateFilter('flightNumber', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flights</SelectItem>
                    <SelectItem value="EK123">EK123</SelectItem>
                    <SelectItem value="EK456">EK456</SelectItem>
                    <SelectItem value="EK789">EK789</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tier">Loyalty Tier</Label>
                <Select value={searchFilters.loyaltyTier} onValueChange={(value) => updateFilter('loyaltyTier', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={searchFilters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="affected">Affected</SelectItem>
                    <SelectItem value="pending">Pending Rebooking</SelectItem>
                    <SelectItem value="fim">On FIM</SelectItem>
                    <SelectItem value="rebooked">Rebooked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={clearAllFilters} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Special Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="specialNeeds" 
                  checked={searchFilters.specialNeeds}
                  onCheckedChange={(checked) => updateFilter('specialNeeds', checked)}
                />
                <Label htmlFor="specialNeeds" className="text-sm">
                  Show only passengers with special needs
                </Label>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  <strong>{filteredPassengers.length}</strong> passengers found
                </span>
                <span className="text-sm text-muted-foreground">
                  ({selectedPassengers.length} selected)
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={onSelectAll} size="sm" variant="outline">
                  Select All Filtered
                </Button>
                <Button onClick={onClearSelection} size="sm" variant="outline">
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPassengers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions ({selectedPassengers.length} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleBulkAction('rebook')} size="sm">
                <Plane className="h-4 w-4 mr-2" />
                Bulk Rebook
              </Button>
              <Button onClick={() => handleBulkAction('vouchers')} size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Issue Vouchers
              </Button>
              <Button onClick={() => handleBulkAction('notify')} size="sm" variant="outline">
                <UserCheck className="h-4 w-4 mr-2" />
                Send Notifications
              </Button>
              <Button onClick={() => handleBulkAction('export')} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passenger List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Passenger List ({filteredPassengers.length})</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                <Eye className="h-4 w-4 mr-2" />
                {viewMode === 'list' ? 'Grid View' : 'List View'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPassengers.map(passenger => (
              <div key={passenger.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={selectedPassengers.includes(passenger.id)}
                    onCheckedChange={(checked) => onPassengerSelection(passenger.id, checked)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {/* Passenger Info */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{passenger.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {passenger.loyaltyTier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{passenger.contact}</p>
                        <p className="text-xs text-muted-foreground">PNR: {passenger.pnr}</p>
                      </div>

                      {/* Type & Status */}
                      <div>
                        <Badge className={getPassengerTypeColor(passenger.type)}>
                          {passenger.type}
                        </Badge>
                        <Badge className={`${getStatusColor(passenger.status)} mt-1 block w-fit`}>
                          {passenger.status}
                        </Badge>
                      </div>

                      {/* Flight Info */}
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Flight:</span> {passenger.flight}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Seat:</span> {passenger.seat}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Class:</span> {passenger.class}
                        </p>
                      </div>

                      {/* Special Info */}
                      <div>
                        {passenger.specialNeeds.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-orange-600 mb-1">Special Needs:</p>
                            {passenger.specialNeeds.map((need, index) => (
                              <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                                {need}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {passenger.type === 'FIM' && passenger.fimDetails && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-purple-600">FIM Details:</p>
                            <p className="text-xs">Carrier: {passenger.fimDetails.originalCarrier}</p>
                            <p className="text-xs">Agreement: {passenger.fimDetails.agreementCode}</p>
                            <p className="text-xs">Valid: {passenger.fimDetails.validUntil}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Contact
                        </Button>
                        {passenger.type === 'FIM' && (
                          <Button size="sm" variant="outline" className="text-xs">
                            Verify FIM
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPassengers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">No passengers found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or clearing the filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Summary */}
      {Object.values(searchFilters).some(filter => filter && filter !== 'all' && typeof filter === 'string') && (
        <Alert className="border-blue-200 bg-blue-50">
          <Filter className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-medium">Active Filters:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {searchFilters.searchTerm && (
                <Badge variant="outline">Search: "{searchFilters.searchTerm}"</Badge>
              )}
              {searchFilters.passengerType !== 'all' && (
                <Badge variant="outline">Type: {searchFilters.passengerType}</Badge>
              )}
              {searchFilters.flightNumber !== 'all' && (
                <Badge variant="outline">Flight: {searchFilters.flightNumber}</Badge>
              )}
              {searchFilters.loyaltyTier !== 'all' && (
                <Badge variant="outline">Tier: {searchFilters.loyaltyTier}</Badge>
              )}
              {searchFilters.status !== 'all' && (
                <Badge variant="outline">Status: {searchFilters.status}</Badge>
              )}
              {searchFilters.specialNeeds && (
                <Badge variant="outline">Special Needs Only</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}