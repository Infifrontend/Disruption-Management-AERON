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
  Hotel, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Wifi,
  Car,
  UtensilsCrossed,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Phone
} from 'lucide-react'

const partnerHotels = [
  {
    id: 'HTL001',
    name: 'Airport Plaza Hotel',
    category: 'Premium',
    rating: 4,
    distance: '2 km from airport',
    pricePerNight: 120,
    availableRooms: 25,
    amenities: ['Free WiFi', 'Airport Shuttle', 'Restaurant', 'Gym'],
    agreement: 'Preferred Partner',
    contactInfo: '+1-555-0123',
    address: '123 Airport Blvd, JFK Terminal Area'
  },
  {
    id: 'HTL002',
    name: 'Express Inn & Suites',
    category: 'Standard',
    rating: 3,
    distance: '5 km from airport',
    pricePerNight: 85,
    availableRooms: 18,
    amenities: ['Free WiFi', 'Breakfast', 'Parking'],
    agreement: 'Standard Partner',
    contactInfo: '+1-555-0124',
    address: '456 Hotel Row, Airport District'
  },
  {
    id: 'HTL003',
    name: 'Luxury Airport Resort',
    category: 'Luxury',
    rating: 5,
    distance: '8 km from airport',
    pricePerNight: 200,
    availableRooms: 12,
    amenities: ['Free WiFi', 'Spa', 'Fine Dining', 'Concierge', 'Pool'],
    agreement: 'Premium Partner',
    contactInfo: '+1-555-0125',
    address: '789 Resort Avenue, Premium District'
  }
]

const accommodationRequests = [
  {
    id: 'REQ001',
    passenger: 'John Smith',
    loyaltyTier: 'Gold',
    duration: '1 night',
    specialRequests: ['Non-smoking', 'Ground floor'],
    status: 'Pending',
    estimatedCost: 120
  },
  {
    id: 'REQ002',
    passenger: 'Sarah Johnson',
    loyaltyTier: 'Silver',
    duration: '2 nights',
    specialRequests: ['Accessible room'],
    status: 'Confirmed',
    estimatedCost: 240
  }
]

export function HotelBooking({ selectedPassengers, passengers }) {
  const [selectedHotel, setSelectedHotel] = useState('')
  const [accommodationDuration, setAccommodationDuration] = useState('1')
  const [roomType, setRoomType] = useState('standard')
  const [includeTransfer, setIncludeTransfer] = useState(true)
  const [includeMeals, setIncludeMeals] = useState(false)

  const selectedPassengerData = passengers.filter(p => selectedPassengers.includes(p.id))

  const calculateTotalCost = () => {
    if (!selectedHotel) return 0
    
    const hotel = partnerHotels.find(h => h.id === selectedHotel)
    if (!hotel) return 0

    let basePrice = hotel.pricePerNight
    
    // Adjust price based on room type
    if (roomType === 'deluxe') basePrice *= 1.3
    if (roomType === 'suite') basePrice *= 1.8

    // Add meal costs if included
    if (includeMeals) basePrice += 35

    return basePrice * parseInt(accommodationDuration) * selectedPassengers.length
  }

  const handleBookHotels = () => {
    if (!selectedHotel) {
      alert('Please select a hotel')
      return
    }

    if (selectedPassengers.length === 0) {
      alert('Please select passengers for hotel booking')
      return
    }

    const hotel = partnerHotels.find(h => h.id === selectedHotel)
    const totalCost = calculateTotalCost()
    
    alert(`Booking ${selectedPassengers.length} rooms at ${hotel.name} for ${accommodationDuration} night(s). Total cost: $${totalCost.toFixed(2)}`)
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  const getHotelCategoryColor = (category) => {
    switch (category) {
      case 'Luxury': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Premium': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Standard': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Hotel Booking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Hotel Accommodation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-lg font-semibold text-blue-600">{selectedPassengers.length}</p>
              <p className="text-sm text-blue-700">Passengers Selected</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded border border-green-200">
              <p className="text-lg font-semibold text-green-600">{partnerHotels.length}</p>
              <p className="text-sm text-green-700">Partner Hotels</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded border border-purple-200">
              <p className="text-lg font-semibold text-purple-600">
                {partnerHotels.reduce((sum, hotel) => sum + hotel.availableRooms, 0)}
              </p>
              <p className="text-sm text-purple-700">Available Rooms</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
              <p className="text-lg font-semibold text-orange-600">${calculateTotalCost().toFixed(0)}</p>
              <p className="text-sm text-orange-700">Estimated Cost</p>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Hotel className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Hotel accommodations are automatically provided for passengers with overnight delays exceeding 8 hours.
              All partner hotels offer airline crew rates and guaranteed availability.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Booking Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Accommodation Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hotel">Select Hotel</Label>
                <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose hotel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerHotels.map(hotel => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name} - ${hotel.pricePerNight}/night ({hotel.availableRooms} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (nights)</Label>
                  <Select value={accommodationDuration} onValueChange={setAccommodationDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 night</SelectItem>
                      <SelectItem value="2">2 nights</SelectItem>
                      <SelectItem value="3">3 nights</SelectItem>
                      <SelectItem value="4">4 nights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="roomType">Room Type</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Room</SelectItem>
                      <SelectItem value="deluxe">Deluxe Room (+30%)</SelectItem>
                      <SelectItem value="suite">Suite (+80%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="transfer" 
                    checked={includeTransfer}
                    onCheckedChange={(checked) => setIncludeTransfer(checked === true)}
                  />
                  <Label htmlFor="transfer" className="text-sm">
                    Include airport transfer (complimentary with partner hotels)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="meals" 
                    checked={includeMeals}
                    onCheckedChange={(checked) => setIncludeMeals(checked === true)}
                  />
                  <Label htmlFor="meals" className="text-sm">
                    Include meal allowance (+$35/day per person)
                  </Label>
                </div>
              </div>

              <Button 
                onClick={handleBookHotels} 
                className="w-full"
                disabled={!selectedHotel || selectedPassengers.length === 0}
              >
                Book Hotel Accommodations
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm p-3 bg-muted rounded">
                <div className="flex justify-between">
                  <span>Passengers:</span>
                  <span className="font-medium">{selectedPassengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{accommodationDuration} night(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Type:</span>
                  <span className="font-medium capitalize">{roomType}</span>
                </div>
                {includeMeals && (
                  <div className="flex justify-between">
                    <span>Meals Included:</span>
                    <span className="font-medium">Yes (+$35/day)</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-medium">Total Cost:</span>
                  <span className="font-semibold text-green-600">
                    ${calculateTotalCost().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Hotels */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Hotels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partnerHotels.map(hotel => (
              <div key={hotel.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{hotel.name}</h3>
                      <Badge className={getHotelCategoryColor(hotel.category)}>
                        {hotel.category}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        {hotel.agreement}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {getRatingStars(hotel.rating)}
                      <span className="text-sm text-muted-foreground">({hotel.rating} stars)</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{hotel.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{hotel.contactInfo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">${hotel.pricePerNight}</p>
                    <p className="text-sm text-muted-foreground">per night</p>
                    <p className="text-sm">
                      <span className="font-medium">{hotel.availableRooms}</span> rooms available
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Address</p>
                    <p className="text-sm text-muted-foreground">{hotel.address}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1">
                      {hotel.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Accommodation Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Accommodation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accommodationRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{request.passenger}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.duration} • Special requests: {request.specialRequests.join(', ')}
                    </p>
                  </div>
                  <Badge variant="outline">{request.loyaltyTier}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">${request.estimatedCost}</p>
                    <Badge className={
                      request.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPassengers.length === 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Please select passengers from the Passenger Lookup tab to manage hotel accommodations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}