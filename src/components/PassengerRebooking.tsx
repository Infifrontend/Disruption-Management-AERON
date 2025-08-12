'use client'

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Users,
  Clock,
  MapPin,
  Plane,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Users2,
  Star,
  Edit,
  Eye,
  Package,
  Filter,
  Search,
  ArrowRight,
  CalendarDays,
  BellRing,
  Hotel,
  Utensils,
  Car,
  QrCode,
  Timer,
  Info,
  Gauge,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Copy,
  ExternalLink,
  Route,
  Zap,
  ThumbsUp,
  CheckSquare,
  Globe,
  ChevronDown,
  ChevronRight,
  Group,
  UserPlus,
  Crown,
  CircleCheck,
  Bell,
  MessageSquare,
  Smartphone
} from 'lucide-react'
import { databaseService } from '../services/databaseService'
import { Progress } from './ui/progress'
import { Checkbox } from './ui/checkbox'
import { toast } from 'sonner'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'

export function PassengerRebooking({ context, onClearContext }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('passenger-service')
  const [crewData, setCrewData] = useState(null)
  const [loading, setLoading] = useState(false)

  // States for the original PassengerRebooking component
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all-priorities')
  const [selectedStatus, setSelectedStatus] = useState('all-statuses')
  const [showRebookingDialog, setShowRebookingDialog] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState(null)
  const [selectedPnrGroup, setSelectedPnrGroup] = useState(null)
  const [selectedPnrs, setSelectedPnrs] = useState(new Set())
  const [expandedPnrs, setExpandedPnrs] = useState(new Set())
  const [groupView, setGroupView] = useState(true)

  // Flight Selection and Additional Services Flow
  const [selectedFlightForServices, setSelectedFlightForServices] = useState(null)
  const [showAdditionalServices, setShowAdditionalServices] = useState(false)
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState({
    hotel: false,
    mealVoucher: false,
    transport: false,
    specialAssistance: false,
    priorityBaggageHandling: false,
    loungeAccess: false
  })

  // Cabin Selection State - Track selected cabin for each flight
  const [selectedCabins, setSelectedCabins] = useState({})

  // Additional Services States
  const [showHotelDialog, setShowHotelDialog] = useState(false)
  const [showVoucherDialog, setShowVoucherDialog] = useState(false)
  const [showTransportDialog, setShowTransportDialog] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [hotelBookingConfirmed, setHotelBookingConfirmed] = useState(false)
  const [voucherIssued, setVoucherIssued] = useState(false)
  const [transportArranged, setTransportArranged] = useState(false)

  // Enhanced Rebooking States
  const [showFlightDetails, setShowFlightDetails] = useState(null)
  const [selectedRebookingFlight, setSelectedRebookingFlight] = useState(null)

  // Use context passengers if available, otherwise use default passenger data
  const contextPassengers = context?.passengers || []

  // Enhanced default passenger data with PNR grouping
  const defaultPassengers = [
    {
      id: 'PAX-001',
      name: 'Ahmed Al-Mansoori',
      pnr: 'FZ8K9L',
      priority: 'VIP',
      status: 'Confirmed',
      seat: '1A',
      contactInfo: 'ahmed.almansoori@email.com',
      specialRequirements: null,
      preferences: {
        seatPreference: 'Window',
        mealPreference: 'Halal',
        classPreference: 'Business',
        loyaltyTier: 'Platinum'
      },
      connectedFlights: ['FZ567', 'FZ892']
    },
    {
      id: 'PAX-002',
      name: 'Fatima Al-Mansoori',
      pnr: 'FZ8K9L', // Same PNR as Ahmed - family booking
      priority: 'VIP',
      status: 'Confirmed',
      seat: '1B',
      contactInfo: 'fatima.almansoori@email.com',
      specialRequirements: null,
      preferences: {
        seatPreference: 'Window',
        mealPreference: 'Halal',
        classPreference: 'Business',
        loyaltyTier: 'Platinum'
      },
      connectedFlights: ['FZ567', 'FZ892']
    },
    {
      id: 'PAX-003',
      name: 'Omar Al-Mansoori',
      pnr: 'FZ8K9L', // Same PNR - child
      priority: 'VIP',
      status: 'Confirmed',
      seat: '1C',
      contactInfo: 'ahmed.almansoori@email.com',
      specialRequirements: 'Child',
      preferences: {
        seatPreference: 'Any',
        mealPreference: 'Child Meal',
        classPreference: 'Business',
        loyaltyTier: null
      },
      connectedFlights: ['FZ567', 'FZ892']
    },
    {
      id: 'PAX-004',
      name: 'Sarah Johnson',
      pnr: 'FZ7M2N',
      priority: 'Premium',
      status: 'Rebooking Required',
      seat: '3C',
      contactInfo: 'sarah.johnson@email.com',
      specialRequirements: 'Wheelchair',
      preferences: {
        seatPreference: 'Aisle',
        mealPreference: 'Vegetarian',
        classPreference: 'Economy',
        loyaltyTier: 'Gold'
      },
      connectedFlights: []
    },
    {
      id: 'PAX-005',
      name: 'John Johnson',
      pnr: 'FZ7M2N', // Same PNR as Sarah - couple booking
      priority: 'Premium',
      status: 'Rebooking Required',
      seat: '3D',
      contactInfo: 'john.johnson@email.com',
      specialRequirements: null,
      preferences: {
        seatPreference: 'Aisle',
        mealPreference: 'Standard',
        classPreference: 'Economy',
        loyaltyTier: 'Gold'
      },
      connectedFlights: []
    },
    {
      id: 'PAX-006',
      name: 'Mohammed Al-Zaabi',
      pnr: 'FZ5P8Q',
      priority: 'Standard',
      status: 'Accommodation Needed',
      seat: '12F',
      contactInfo: 'mohammed.alzaabi@email.com',
      specialRequirements: null,
      preferences: {
        seatPreference: 'Window',
        mealPreference: 'Standard',
        classPreference: 'Economy',
        loyaltyTier: 'Silver'
      },
      connectedFlights: ['FZ445']
    },
    {
      id: 'PAX-007',
      name: 'Emma Thompson',
      pnr: 'FZ3R6S',
      priority: 'Premium',
      status: 'Alternative Flight',
      seat: '5B',
      contactInfo: 'emma.thompson@email.com',
      specialRequirements: 'Infant',
      preferences: {
        seatPreference: 'Aisle',
        mealPreference: 'Standard',
        classPreference: 'Premium Economy',
        loyaltyTier: 'Gold'
      },
      connectedFlights: []
    },
    {
      id: 'PAX-008',
      name: 'Robert Thompson',
      pnr: 'FZ3R6S', // Same PNR as Emma - family with infant
      priority: 'Premium',
      status: 'Alternative Flight',
      seat: '5A',
      contactInfo: 'robert.thompson@email.com',
      specialRequirements: null,
      preferences: {
        seatPreference: 'Window',
        mealPreference: 'Standard',
        classPreference: 'Premium Economy',
        loyaltyTier: 'Gold'
      },
      connectedFlights: []
    },
    {
      id: 'PAX-009',
      name: 'Ali Hassan',
      pnr: 'FZ9T4U',
      priority: 'Standard',
      status: 'Confirmed',
      seat: '8D',
      contactInfo: 'ali.hassan@email.com',
      specialRequirements: 'Dietary',
      preferences: {
        seatPreference: 'Middle',
        mealPreference: 'Halal',
        classPreference: 'Economy',
        loyaltyTier: 'Bronze'
      },
      connectedFlights: []
    }
  ]

  const passengers = contextPassengers.length > 0 ? contextPassengers : defaultPassengers

  // Group passengers by PNR
  const passengersByPnr = useMemo(() => {
    const grouped = passengers.reduce((acc, passenger) => {
      if (!acc[passenger.pnr]) {
        acc[passenger.pnr] = []
      }
      acc[passenger.pnr].push(passenger)
      return acc
    }, {})
    return grouped
  }, [passengers])

  // Cabin options with icons and descriptions
  const cabinOptions = [
    {
      key: 'business',
      name: 'Business',
      icon: Crown,
      description: 'Premium service with lie-flat seats'
    },
    {
      key: 'premiumEconomy',
      name: 'Premium Economy',
      icon: Star,
      description: 'Enhanced comfort and service'
    },
    {
      key: 'economy',
      name: 'Economy',
      icon: Users,
      description: 'Standard service and seating'
    }
  ]

  // Additional Services Options
  const additionalServicesOptions = [
    {
      key: 'hotel',
      name: 'Hotel Accommodation',
      icon: Hotel,
      description: 'Overnight stay with meals included',
      estimatedCost: 'AED 450',
      category: 'accommodation'
    },
    {
      key: 'mealVoucher',
      name: 'Meal Voucher',
      icon: Utensils,
      description: 'AED 75 dining credit at airport restaurants',
      estimatedCost: 'AED 75',
      category: 'dining'
    },
    {
      key: 'transport',
      name: 'Ground Transportation',
      icon: Car,
      description: 'Airport transfer or taxi service',
      estimatedCost: 'AED 80',
      category: 'transport'
    },
    {
      key: 'specialAssistance',
      name: 'Special Assistance',
      icon: Shield,
      description: 'Wheelchair, elderly, or disability support',
      estimatedCost: 'Complimentary',
      category: 'assistance'
    },
    {
      key: 'priorityBaggageHandling',
      name: 'Priority Baggage',
      icon: Package,
      description: 'Fast-track baggage processing',
      estimatedCost: 'AED 25',
      category: 'baggage'
    },
    {
      key: 'loungeAccess',
      name: 'Lounge Access',
      icon: Crown,
      description: 'Access to flydubai Business Lounge',
      estimatedCost: 'AED 120',
      category: 'comfort'
    }
  ]

  // Enhanced Available Flights with detailed information
  const getAvailableFlights = (passengerOrGroup) => {
    const baseFlights = [
      {
        id: 'FZ567',
        flightNumber: 'FZ567',
        airline: 'flydubai',
        departure: 'Tomorrow 08:00',
        arrival: 'Tomorrow 12:30',
        route: `DXB → ${context?.flight?.destination || 'BOM'}`,
        aircraft: 'Boeing 737-800',
        duration: '4h 30m',
        availableSeats: {
          business: { total: 12, available: 8, price: 'AED 2,400' },
          premiumEconomy: { total: 24, available: 16, price: 'AED 1,200' },
          economy: { total: 150, available: 89, price: 'AED 800' }
        },
        suitabilityScore: calculateGroupFlightScore(passengerOrGroup, 'FZ567'),
        amenities: ['WiFi', 'Meals', 'Entertainment', 'USB Charging'],
        onTimePerformance: 94,
        cascadeImpact: analyzeGroupCascadeImpact(passengerOrGroup, 'FZ567'),
        recommendations: generateGroupRecommendations(passengerOrGroup, 'FZ567')
      },
      {
        id: 'EK425',
        flightNumber: 'EK425',
        airline: 'Emirates (Partner)',
        departure: 'Today 16:45',
        arrival: 'Today 21:15',
        route: `DXB → ${context?.flight?.destination || 'BOM'}`,
        aircraft: 'Airbus A380',
        duration: '4h 30m',
        availableSeats: {
          business: { total: 76, available: 12, price: 'AED 3,800' },
          premiumEconomy: { total: 56, available: 23, price: 'AED 1,800' },
          economy: { total: 399, available: 156, price: 'AED 1,200' }
        },
        suitabilityScore: calculateGroupFlightScore(passengerOrGroup, 'EK425'),
        amenities: ['WiFi', 'Premium Meals', 'ICE Entertainment', 'Lie-flat Seats', 'Shower Spa'],
        onTimePerformance: 96,
        cascadeImpact: analyzeGroupCascadeImpact(passengerOrGroup, 'EK425'),
        recommendations: generateGroupRecommendations(passengerOrGroup, 'EK425')
      },
      {
        id: 'FZ789',
        flightNumber: 'FZ789',
        airline: 'flydubai',
        departure: 'Tomorrow 14:20',
        arrival: 'Tomorrow 18:50',
        route: `DXB → ${context?.flight?.destination || 'BOM'}`,
        aircraft: 'Boeing 737 MAX 8',
        duration: '4h 30m',
        availableSeats: {
          business: { total: 12, available: 4, price: 'AED 2,600' },
          premiumEconomy: { total: 24, available: 18, price: 'AED 1,400' },
          economy: { total: 150, available: 67, price: 'AED 900' }
        },
        suitabilityScore: calculateGroupFlightScore(passengerOrGroup, 'FZ789'),
        amenities: ['WiFi', 'Meals', 'Streaming Entertainment', 'USB Charging'],
        onTimePerformance: 91,
        cascadeImpact: analyzeGroupCascadeImpact(passengerOrGroup, 'FZ789'),
        recommendations: generateGroupRecommendations(passengerOrGroup, 'FZ789')
      },
      {
        id: 'AI131',
        flightNumber: 'AI131',
        airline: 'Air India (Partner)',
        departure: 'Tomorrow 22:30',
        arrival: 'Day+1 03:00',
        route: `DXB → ${context?.flight?.destination || 'BOM'}`,
        aircraft: 'Boeing 787-8',
        duration: '4h 30m',
        availableSeats: {
          business: { total: 18, available: 11, price: 'AED 2,800' },
          premiumEconomy: { total: 35, available: 28, price: 'AED 1,500' },
          economy: { total: 211, available: 134, price: 'AED 950' }
        },
        suitabilityScore: calculateGroupFlightScore(passengerOrGroup, 'AI131'),
        amenities: ['WiFi', 'Indian Cuisine', 'Entertainment', 'Extra Legroom'],
        onTimePerformance: 88,
        cascadeImpact: analyzeGroupCascadeImpact(passengerOrGroup, 'AI131'),
        recommendations: generateGroupRecommendations(passengerOrGroup, 'AI131')
      }
    ]

    // Sort by suitability score (highest first)
    return baseFlights.sort((a, b) => b.suitabilityScore - a.suitabilityScore)
  }

  // Calculate flight suitability score for groups
  const calculateGroupFlightScore = (passengerOrGroup, flightId) => {
    const passengers = Array.isArray(passengerOrGroup) ? passengerOrGroup : [passengerOrGroup]
    let totalScore = 0

    passengers.forEach(passenger => {
      let score = 70 // Base score

      // Priority adjustments
      if (passenger?.priority === 'VIP') score += 15
      else if (passenger?.priority === 'Premium') score += 10
      else if (passenger?.priority === 'Standard') score += 5

      // Airline preference (flydubai gets bonus)
      if (flightId.startsWith('FZ')) score += 10

      // Special requirements accommodation
      if (passenger?.specialRequirements) {
        if (flightId === 'EK425') score += 8 // Emirates has better accessibility
        else score += 5
      }

      // Loyalty tier bonus
      const loyaltyTier = passenger?.preferences?.loyaltyTier
      if (loyaltyTier === 'Platinum') score += 8
      else if (loyaltyTier === 'Gold') score += 6
      else if (loyaltyTier === 'Silver') score += 4
      else if (loyaltyTier === 'Bronze') score += 2

      // Group bonus for keeping families together
      if (passengers.length > 1) score += 5

      totalScore += score
    })

    // Average score for the group
    const avgScore = totalScore / passengers.length

    // Group size adjustment
    if (passengers.length > 1) {
      // Slight penalty for large groups on smaller aircraft
      if (passengers.length >= 3 && (flightId === 'FZ567' || flightId === 'FZ789')) {
        return Math.max(avgScore - 3, 0)
      }
    }

    return Math.min(Math.max(avgScore, 0), 100)
  }

  // Analyze cascade impact for groups
  const analyzeGroupCascadeImpact = (passengerOrGroup, flightId) => {
    const passengers = Array.isArray(passengerOrGroup) ? passengerOrGroup : [passengerOrGroup]
    const allConnectedFlights = [...new Set(passengers.flatMap(p => p.connectedFlights || []))]

    if (allConnectedFlights.length === 0) {
      return {
        hasImpact: false,
        affectedFlights: [],
        severity: 'none',
        description: 'No connecting flights affected for this group'
      }
    }

    const impact = {
      hasImpact: true,
      affectedFlights: allConnectedFlights,
      severity: 'medium',
      description: `${allConnectedFlights.length} connecting flight(s) may be affected for ${passengers.length} passenger(s)`
    }

    // Determine severity based on timing and flight
    if (flightId === 'AI131') {
      impact.severity = 'high'
      impact.description = `Late arrival may cause missed connections for group of ${passengers.length}`
    } else if (flightId === 'EK425') {
      impact.severity = 'low'
      impact.description = `Earlier arrival improves connection reliability for group of ${passengers.length}`
    }

    return impact
  }

  // Generate smart recommendations for groups
  const generateGroupRecommendations = (passengerOrGroup, flightId) => {
    const passengers = Array.isArray(passengerOrGroup) ? passengerOrGroup : [passengerOrGroup]
    const recommendations = []

    // Group seating recommendations
    recommendations.push({
      type: 'seat',
      priority: 'high',
      text: `Reserve ${passengers.length} seats together for group`,
      action: 'Auto-select adjacent seats for family/group'
    })

    // Special requirements for group
    const specialReqs = passengers.filter(p => p.specialRequirements).map(p => p.specialRequirements)
    if (specialReqs.length > 0) {
      recommendations.push({
        type: 'assistance',
        priority: 'high',
        text: `Group assistance required: ${[...new Set(specialReqs)].join(', ')}`,
        action: 'Coordinate group assistance services'
      })
    }

    // Meal preferences for group
    const mealPrefs = [...new Set(passengers.map(p => p.preferences?.mealPreference).filter(Boolean))]
    if (mealPrefs.length > 0 && !mealPrefs.every(pref => pref === 'Standard')) {
      recommendations.push({
        type: 'meal',
        priority: 'medium',
        text: `Special meals for group: ${mealPrefs.join(', ')}`,
        action: 'Pre-order all special meals for group'
      })
    }

    // Connection recommendations for group
    const allConnectedFlights = [...new Set(passengers.flatMap(p => p.connectedFlights || []))]
    if (allConnectedFlights.length > 0) {
      if (flightId === 'AI131') {
        recommendations.push({
          type: 'connection',
          priority: 'high',
          text: `Rebook all ${allConnectedFlights.length} connecting flights for group`,
          action: 'Automatically rebook entire group on next-day connections'
        })
      } else {
        recommendations.push({
          type: 'connection',
          priority: 'medium',
          text: `Monitor group connections for ${allConnectedFlights.length} flight(s)`,
          action: 'Set up group connection alerts'
        })
      }
    }

    // VIP/Premium group services
    const highPriorityPassengers = passengers.filter(p => p.priority === 'VIP' || p.priority === 'Premium')
    if (highPriorityPassengers.length > 0) {
      recommendations.push({
        type: 'service',
        priority: 'high',
        text: `Arrange premium services for ${highPriorityPassengers.length} passenger(s)`,
        action: 'Enable group premium services and fast-track'
      })
    }

    return recommendations
  }

  // Available Hotels Data
  const availableHotels = [
    {
      id: 'HTL-001',
      name: 'Dubai International Hotel',
      category: '5-Star',
      distance: '0.5 km from DXB',
      pricePerNight: 'AED 450',
      rating: 4.8,
      amenities: ['Wifi', 'Pool', 'Gym', 'Restaurant', 'Airport Shuttle', 'AC'],
      availability: 'Available',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
      description: 'Luxury hotel directly connected to Dubai International Airport'
    },
    {
      id: 'HTL-002',
      name: 'Le Meridien Dubai Hotel & Conference Centre',
      category: '5-Star',
      distance: '12 km from DXB',
      pricePerNight: 'AED 380',
      rating: 4.6,
      amenities: ['Wifi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Parking'],
      availability: 'Available',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop',
      description: 'Elegant hotel with excellent conference facilities and dining options'
    },
    {
      id: 'HTL-003',
      name: 'Millennium Airport Hotel Dubai',
      category: '4-Star',
      distance: '8 km from DXB',
      pricePerNight: 'AED 280',
      rating: 4.4,
      amenities: ['Wifi', 'Restaurant', 'Airport Shuttle', 'AC', 'Business Center'],
      availability: 'Available',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop',
      description: 'Comfortable business hotel with convenient airport access'
    },
    {
      id: 'HTL-004',
      name: 'Premier Inn Dubai International Airport',
      category: '3-Star',
      distance: '5 km from DXB',
      pricePerNight: 'AED 180',
      rating: 4.2,
      amenities: ['Wifi', 'Restaurant', 'Airport Shuttle', 'AC'],
      availability: 'Limited',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop',
      description: 'Budget-friendly option with essential amenities and good service'
    }
  ]

  const filteredPassengers = passengers.filter(passenger => {
    const matchesSearch = passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         passenger.pnr.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = selectedPriority === 'all-priorities' || passenger.priority === selectedPriority
    const matchesStatus = selectedStatus === 'all-statuses' || passenger.status === selectedStatus

    return matchesSearch && matchesPriority && matchesStatus
  })

  // Filter PNR groups based on search criteria
  const filteredPnrGroups = useMemo(() => {
    const filtered = {}
    Object.entries(passengersByPnr).forEach(([pnr, passengers]) => {
      const filteredGroupPassengers = passengers.filter(passenger => {
        const matchesSearch = passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             passenger.pnr.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPriority = selectedPriority === 'all-priorities' || passenger.priority === selectedPriority
        const matchesStatus = selectedStatus === 'all-statuses' || passenger.status === selectedStatus

        return matchesSearch && matchesPriority && matchesStatus
      })

      if (filteredGroupPassengers.length > 0) {
        filtered[pnr] = filteredGroupPassengers
      }
    })
    return filtered
  }, [passengersByPnr, searchTerm, selectedPriority, selectedStatus])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'Rebooking Required': return 'bg-red-100 text-red-800 border-red-200'
      case 'Accommodation Needed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Alternative Flight': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Premium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Standard': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 55) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score) => {
    if (score >= 85) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 70) return <Target className="h-4 w-4 text-blue-600" />
    if (score >= 55) return <Gauge className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getCascadeSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'seat': return <Users className="h-4 w-4" />
      case 'meal': return <Utensils className="h-4 w-4" />
      case 'connection': return <Route className="h-4 w-4" />
      case 'service': return <Star className="h-4 w-4" />
      case 'assistance': return <Shield className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />
      case 'pool': return <Waves className="h-4 w-4" />
      case 'gym': return <Dumbbell className="h-4 w-4" />
      case 'restaurant': return <Utensils className="h-4 w-4" />
      case 'spa': return <Coffee className="h-4 w-4" />
      case 'parking': return <Car className="h-4 w-4" />
      case 'airport shuttle': return <Car className="h-4 w-4" />
      case 'ac': return <Wind className="h-4 w-4" />
      case 'business center': return <Tv className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getServiceIcon = (serviceKey) => {
    const service = additionalServicesOptions.find(s => s.key === serviceKey)
    if (service) {
      const Icon = service.icon
      return <Icon className="h-4 w-4" />
    }
    return <Shield className="h-4 w-4" />
  }

  const getReaccommodationType = () => {
    if (!context?.reaccommodationType) return null

    switch (context.reaccommodationType) {
      case 'cancellation':
        return {
          type: 'Flight Cancellation',
          icon: X,
          color: 'red',
          description: 'Complete flight cancellation requiring passenger rebooking'
        }
      case 'delay':
        return {
          type: 'Extended Delay',
          icon: Clock,
          color: 'yellow',
          description: 'Significant delay requiring accommodation services'
        }
      case 'reroute':
        return {
          type: 'Route Change',
          icon: MapPin,
          color: 'blue',
          description: 'Flight diversion or rerouting with ground transport'
        }
      default:
        return {
          type: 'Service Required',
          icon: Users,
          color: 'gray',
          description: 'Passenger service intervention needed'
        }
    }
  }

  const reaccommodationType = getReaccommodationType()

  // Cabin selection handlers
  const handleCabinSelection = (flightId, cabinKey) => {
    setSelectedCabins(prev => ({
      ...prev,
      [flightId]: cabinKey
    }))
  }

  const getSelectedCabin = (flightId) => {
    return selectedCabins[flightId] || null
  }

  const isCabinAvailableForGroup = (flight, cabinKey, groupSize = 1) => {
    const cabin = flight.availableSeats[cabinKey]
    return cabin && cabin.available >= groupSize
  }

  const handleRebookPassenger = (passenger) => {
    setSelectedPassenger(passenger)
    setSelectedPnrGroup(null)
    setShowRebookingDialog(true)
  }

  const handleRebookPnrGroup = (pnr, passengers) => {
    setSelectedPnrGroup({ pnr, passengers })
    setSelectedPassenger(null)
    setShowRebookingDialog(true)
  }

  const handleHotelBooking = (passengerOrGroup) => {
    if (selectedPnrGroup) {
      setSelectedPassenger(selectedPnrGroup.passengers[0]) // Use first passenger for booking
    } else {
      setSelectedPassenger(passengerOrGroup)
    }
    setShowHotelDialog(true)
  }

  const handleVoucherIssue = (passengerOrGroup) => {
    if (selectedPnrGroup) {
      setSelectedPassenger(selectedPnrGroup.passengers[0])
    } else {
      setSelectedPassenger(passengerOrGroup)
    }
    setShowVoucherDialog(true)
  }

  const handleTransportArrange = (passengerOrGroup) => {
    if (selectedPnrGroup) {
      setSelectedPassenger(selectedPnrGroup.passengers[0])
    } else {
      setSelectedPassenger(passengerOrGroup)
    }
    setShowTransportDialog(true)
  }

  const handleFlightSelection = (flight) => {
    const selectedCabin = getSelectedCabin(flight.id)

    if (!selectedCabin) {
      toast.error('Please select a cabin class before proceeding')
      return
    }

    const flightWithCabin = {
      ...flight,
      selectedCabin: selectedCabin,
      selectedCabinDetails: flight.availableSeats[selectedCabin],
      passengerContext: selectedPnrGroup || selectedPassenger
    }

    setSelectedFlightForServices(flightWithCabin)
    setShowAdditionalServices(true)

    toast.success(`Flight ${flight.flightNumber} selected for ${selectedCabin} class`)
  }

  const handleAdditionalServiceChange = (serviceKey, checked) => {
    setSelectedAdditionalServices(prev => ({
      ...prev,
      [serviceKey]: checked
    }))
  }

  const handleSaveChanges = () => {
    if (!selectedFlightForServices) {
      toast.error('No flight selected')
      return
    }

    const passengerContext = selectedPnrGroup || selectedPassenger
    const isGroup = selectedPnrGroup !== null
    const passengerCount = isGroup ? selectedPnrGroup.passengers.length : 1
    const passengerNames = isGroup 
      ? selectedPnrGroup.passengers.map(p => p.name).join(', ')
      : selectedPassenger.name

    // Collect selected services
    const selectedServices = Object.entries(selectedAdditionalServices)
      .filter(([key, selected]) => selected)
      .map(([key]) => {
        const service = additionalServicesOptions.find(s => s.key === key)
        return service?.name || key
      })

    // Generate notification messages
    const notifications = []

    // Flight confirmation notification
    const flightNotification = {
      type: 'flight_rebooking',
      passengers: isGroup ? selectedPnrGroup.passengers : [selectedPassenger],
      flight: selectedFlightForServices,
      message: `Your flight has been rebooked to ${selectedFlightForServices.flightNumber} departing ${selectedFlightForServices.departure} in ${selectedFlightForServices.selectedCabin} class.`
    }
    notifications.push(flightNotification)

    // Additional services notifications
    if (selectedServices.length > 0) {
      const servicesNotification = {
        type: 'additional_services',
        passengers: isGroup ? selectedPnrGroup.passengers : [selectedPassenger],
        services: selectedServices,
        message: `Additional services arranged: ${selectedServices.join(', ')}`
      }
      notifications.push(servicesNotification)
    }

    // Send notifications (simulate API calls)
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        if (notification.type === 'flight_rebooking') {
          toast.success(
            `✈️ Flight confirmation sent to ${passengerCount} passenger${passengerCount > 1 ? 's' : ''}`,
            {
              description: `${selectedFlightForServices.flightNumber} rebooking details sent via email and SMS`,
              duration: 4000,
            }
          )
        } else if (notification.type === 'additional_services') {
          toast.success(
            `🎯 Service confirmations sent to ${passengerNames}`,
            {
              description: `Details for ${selectedServices.length} additional service${selectedServices.length > 1 ? 's' : ''} sent`,
              duration: 4000,
            }
          )
        }
      }, index * 1500)
    })

    // Final confirmation
    setTimeout(() => {
      toast.success(
        `🎉 Rebooking Complete!`,
        {
          description: `All ${passengerCount} passenger${passengerCount > 1 ? 's' : ''} successfully processed and notified`,
          duration: 5000,
        }
      )
    }, notifications.length * 1500 + 1000)

    // Reset the flow
    setTimeout(() => {
      setShowAdditionalServices(false)
      setSelectedFlightForServices(null)
      setSelectedAdditionalServices({
        hotel: false,
        mealVoucher: false,
        transport: false,
        specialAssistance: false,
        priorityBaggageHandling: false,
        loungeAccess: false
      })
      setShowRebookingDialog(false)
    }, notifications.length * 1500 + 2000)
  }

  const handleSkipAdditionalServices = () => {
    setShowAdditionalServices(false)
    handleSaveChanges()
  }

  const handleBackToFlightSelection = () => {
    setShowAdditionalServices(false)
    setSelectedFlightForServices(null)
  }

  const handlePnrSelection = (pnr) => {
    const newSelectedPnrs = new Set(selectedPnrs)
    if (newSelectedPnrs.has(pnr)) {
      newSelectedPnrs.delete(pnr)
    } else {
      newSelectedPnrs.add(pnr)
    }
    setSelectedPnrs(newSelectedPnrs)
  }

  const handleExpandPnr = (pnr) => {
    const newExpandedPnrs = new Set(expandedPnrs)
    if (newExpandedPnrs.has(pnr)) {
      newExpandedPnrs.delete(pnr)
    } else {
      newExpandedPnrs.add(pnr)
    }
    setExpandedPnrs(newExpandedPnrs)
  }

  const confirmHotelBooking = (hotel) => {
    setSelectedHotel(hotel)
    setHotelBookingConfirmed(true)
    setTimeout(() => {
      setShowHotelDialog(false)
      setHotelBookingConfirmed(false)
      setSelectedHotel(null)
    }, 3000)
  }

  const issueVoucher = (amount, type) => {
    setVoucherIssued(true)
    setTimeout(() => {
      setShowVoucherDialog(false)
      setVoucherIssued(false)
    }, 2500)
  }

  const arrangeTransport = (transportType, details) => {
    setTransportArranged(true)
    setTimeout(() => {
      setShowTransportDialog(false)
      setTransportArranged(false)
    }, 2500)
  }

  const totalPassengers = context?.totalPassengers || passengers.length
  const rebookingRequired = passengers.filter(p => p.status === 'Rebooking Required').length
  const accommodationNeeded = passengers.filter(p => p.status === 'Accommodation Needed').length
  const confirmed = passengers.filter(p => p.status === 'Confirmed').length

  const displayData = groupView ? filteredPnrGroups : { individual: filteredPassengers }

  const groupSize = selectedPnrGroup ? selectedPnrGroup.passengers.length : 1

  // Calculate total cost for selected additional services
  const calculateTotalServicesCost = () => {
    let total = 0
    Object.entries(selectedAdditionalServices).forEach(([serviceKey, selected]) => {
      if (selected) {
        const service = additionalServicesOptions.find(s => s.key === serviceKey)
        if (service && service.estimatedCost !== 'Complimentary') {
          const cost = parseInt(service.estimatedCost.replace(/[^\d]/g, '')) || 0
          total += cost * groupSize
        }
      }
    })
    return total
  }

  // Get data from navigation state or context
  const stateData = location.state || context
  const selectedFlight = stateData?.selectedFlight
  const recoveryOption = stateData?.recoveryOption
  const fromExecution = stateData?.fromExecution

  // Load crew data when crew tab is accessed
  useEffect(() => {
    if (activeTab === 'crew-schedule' && recoveryOption && !crewData) {
      loadCrewData()
    }
  }, [activeTab, recoveryOption])

  const loadCrewData = async () => {
    setLoading(true)
    try {
      // Try to get rotation plan data which includes crew information
      const rotationResponse = await fetch(
        `/api/recovery-option/${recoveryOption.id}/rotation-plan`
      )

      if (rotationResponse.ok) {
        const result = await rotationResponse.json()
        const rotationPlan = result.rotationPlan || result

        // Extract crew data from rotation plan
        const crew = rotationPlan?.crew || rotationPlan?.crewData || []
        setCrewData({
          crew: crew,
          crewConstraints: rotationPlan?.crewConstraint || {},
          operationalConstraints: rotationPlan?.operationalConstraints || {},
        })
      } else {
        // Fallback crew data
        setCrewData({
          crew: [
            {
              name: 'Captain Al-Zaabi',
              type: 'Captain',
              status: 'Available',
              location: 'Dubai Airport Hotel',
              availability: 'Available',
            },
            {
              name: 'F/O Rahman',
              type: 'First Officer',
              status: 'On Duty',
              location: 'Crew Rest Area Terminal 2',
              availability: 'Available',
            },
            {
              name: 'FA Team Delta (4 members)',
              type: 'Cabin Crew',
              status: 'Available',
              location: 'Crew Lounge Level 3',
              availability: 'Available',
            },
          ],
          crewConstraints: {},
          operationalConstraints: {},
        })
      }
    } catch (error) {
      console.error('Error loading crew data:', error)
      // Set fallback data
      setCrewData({
        crew: [],
        crewConstraints: {},
        operationalConstraints: {},
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteWithPassengerServices = async () => {
    if (!fromExecution || !recoveryOption || !selectedFlight) return

    try {
      // Get full details and rotation impact
      let fullDetails = null
      let rotationImpact = null

      try {
        const detailsResponse = await fetch(
          `/api/recovery-option-details/${recoveryOption.id}`
        )
        if (detailsResponse.ok) {
          fullDetails = await detailsResponse.json()
        }
      } catch (error) {
        console.warn('Could not fetch full details:', error)
      }

      try {
        const rotationResponse = await fetch(
          `/api/recovery-option/${recoveryOption.id}/rotation-plan`
        )
        if (rotationResponse.ok) {
          const result = await rotationResponse.json()
          rotationImpact = result.rotationPlan || result
        }
      } catch (error) {
        console.warn('Could not fetch rotation impact:', error)
      }

      // Submit to pending solutions without updating flight status
      const pendingSolution = {
        disruptionId: selectedFlight.id,
        optionId: recoveryOption.id,
        optionTitle: recoveryOption.title,
        optionDescription: recoveryOption.description,
        cost: recoveryOption.cost,
        timeline: recoveryOption.timeline,
        confidence: recoveryOption.confidence,
        impact: recoveryOption.impact,
        status: 'Pending',
        fullDetails: fullDetails,
        rotationImpact: rotationImpact,
        submittedBy: 'operations_user',
        approvalRequired: 'Operations Manager',
      }

      const success = await databaseService.savePendingRecoverySolution(pendingSolution)

      if (success) {
        // Navigate to pending solutions without updating flight status
        navigate('/pending')
      } else {
        alert('Failed to execute recovery option. Please try again.')
      }
    } catch (error) {
      console.error('Error executing recovery option:', error)
      alert('An error occurred while executing the recovery option.')
    }
  }

  if (!selectedFlight || !recoveryOption) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Recovery Option Selected
            </h3>
            <p className="text-gray-500">
              Please select a recovery option from the comparison matrix to access passenger services.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/comparison')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Comparison
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Context Header - Show when coming from recovery plan */}
      {context && (
        <Card className="border-flydubai-orange bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-flydubai-orange">
                  {reaccommodationType && <reaccommodationType.icon className="h-5 w-5" />}
                  Passenger Re-accommodation Required
                </CardTitle>
                <p className="text-sm text-orange-700 mt-1">
                  Recovery operation triggered by: <strong>{context.recoveryOption?.title}</strong>
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearContext}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Recovery
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Affected Flight Information */}
              <div>
                <h4 className="font-medium text-orange-800 mb-3">Affected Flight Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{context.flight?.flightNumber}</span>
                    <span className="text-orange-700">{context.flight?.origin} → {context.flight?.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-700">{context.flight?.scheduledDeparture || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-700">{totalPassengers} total passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-700">{context.flight?.aircraft || 'Aircraft TBD'}</span>
                  </div>
                </div>
              </div>

              {/* Recovery Option Information */}
              <div>
                <h4 className="font-medium text-orange-800 mb-3">Selected Recovery Option</h4>
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-orange-900">{context.recoveryOption?.title}</div>
                  <div className="text-orange-700">{context.recoveryOption?.description}</div>
                  {reaccommodationType && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-orange-700 font-medium">{reaccommodationType.type}</span>
                    </div>
                  )}
                  <div className="text-xs text-orange-600 mt-1">
                    {reaccommodationType?.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats for this Recovery */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-orange-200">
              <div className="text-center p-3 bg-white rounded border border-orange-200">
                <div className="text-2xl font-bold text-red-600">{rebookingRequired}</div>
                <div className="text-xs text-muted-foreground">Need Rebooking</div>
              </div>
              <div className="text-center p-3 bg-white rounded border border-orange-200">
                <div className="text-2xl font-bold text-yellow-600">{accommodationNeeded}</div>
                <div className="text-xs text-muted-foreground">Need Accommodation</div>
              </div>
              <div className="text-center p-3 bg-white rounded border border-orange-200">
                <div className="text-2xl font-bold text-green-600">{confirmed}</div>
                <div className="text-xs text-muted-foreground">Confirmed</div>
              </div>
              <div className="text-center p-3 bg-white rounded border border-orange-200">
                <div className="text-2xl font-bold text-flydubai-blue">{totalPassengers}</div>
                <div className="text-xs text-muted-foreground">Total Passengers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">
            {context ? 'Recovery Passenger Services' : 'Passenger Services'}
          </h2>
          <p className="text-muted-foreground">
            {context 
              ? `Managing ${totalPassengers} passengers affected by ${context.recoveryOption?.title}`
              : 'Manage passenger rebooking, accommodations, and special services'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="btn-flydubai-primary">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!context && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Confirmed</p>
                  <p className="text-2xl font-bold text-green-700">3,247</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Rebooking Required</p>
                  <p className="text-2xl font-bold text-red-700">89</p>
                </div>
                <RefreshCw className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Accommodation</p>
                  <p className="text-2xl font-bold text-yellow-700">45</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">VIP Passengers</p>
                  <p className="text-2xl font-bold text-blue-700">12</p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-flydubai-blue" />
              {context ? `Filter Affected Passengers (${passengers.length})` : 'Passenger Filters'}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={groupView ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupView(true)}
                className={groupView ? "btn-flydubai-primary" : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"}
              >
                <Group className="h-4 w-4 mr-2" />
                PNR Groups
              </Button>
              <Button
                variant={!groupView ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupView(false)}
                className={!groupView ? "btn-flydubai-primary" : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"}
              >
                <Users className="h-4 w-4 mr-2" />
                Individual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Name or PNR"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priorities">All Priorities</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Rebooking Required">Rebooking Required</SelectItem>
                  <SelectItem value="Accommodation Needed">Accommodation Needed</SelectItem>
                  <SelectItem value="Alternative Flight">Alternative Flight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedPriority('all-priorities')
                  setSelectedStatus('all-statuses')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-flydubai-navy">
                {context 
                  ? `Affected Passengers - ${context.flight?.flightNumber}` 
                  : 'Passenger List'
                }
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {groupView 
                  ? `Showing ${Object.keys(filteredPnrGroups).length} PNR groups with ${Object.values(filteredPnrGroups).flat().length} passengers`
                  : `Showing ${filteredPassengers.length} of ${passengers.length} passengers`
                }
              </p>
            </div>
            {groupView && selectedPnrs.size > 0 && (
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  className="btn-flydubai-primary"
                  onClick={() => {
                    const selectedGroups = Object.entries(filteredPnrGroups)
                      .filter(([pnr]) => selectedPnrs.has(pnr))
                      .map(([pnr, passengers]) => ({ pnr, passengers }))
                    console.log('Bulk rebooking for:', selectedGroups)
                  }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Rebook {selectedPnrs.size} PNR(s)
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                  onClick={() => setSelectedPnrs(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {groupView ? (
            // PNR Group View
            <div className="space-y-4">
              {Object.entries(filteredPnrGroups).map(([pnr, groupPassengers]) => (
                <Card key={pnr} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedPnrs.has(pnr)}
                          onCheckedChange={() => handlePnrSelection(pnr)}
                        />
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-flydubai-blue" />
                          <Badge className="badge-flydubai text-lg px-3 py-1">{pnr}</Badge>
                          <Badge variant="outline" className="text-sm">
                            {groupPassengers.length} passenger{groupPassengers.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExpandPnr(pnr)}
                          className="p-1"
                        >
                          {expandedPnrs.has(pnr) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          Status: {[...new Set(groupPassengers.map(p => p.status))].join(', ')}
                        </div>
                        <Button 
                          size="sm"
                          className="btn-flydubai-primary"
                          onClick={() => handleRebookPnrGroup(pnr, groupPassengers)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Rebook Group
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Group Details */}
                    {expandedPnrs.has(pnr) && (
                      <div className="border-t pt-3">
                        <div className="grid gap-3">
                          {groupPassengers.map((passenger) => (
                            <div key={passenger.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="font-medium">{passenger.name}</div>
                                  <div className="text-sm text-gray-500">{passenger.contactInfo}</div>
                                </div>
                                <Badge className={getPriorityColor(passenger.priority)}>
                                  {passenger.priority}
                                </Badge>
                                <Badge className={getStatusColor(passenger.status)}>
                                  {passenger.status}
                                </Badge>
                                <div className="text-sm text-gray-600">Seat: {passenger.seat}</div>
                                {passenger.specialRequirements && (
                                  <Badge variant="outline" className="text-xs">
                                    {passenger.specialRequirements}
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleRebookPassenger(passenger)}
                                className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Individual Passenger View
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Passenger</TableHead>
                  <TableHead>PNR</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Special Requirements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPassengers.map((passenger) => (
                  <TableRow key={passenger.id} className="hover:bg-blue-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{passenger.name}</div>
                        <div className="text-sm text-gray-500">{passenger.contactInfo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="badge-flydubai-outline">
                        {passenger.pnr}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(passenger.priority)}>
                        {passenger.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(passenger.status)}>
                        {passenger.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{passenger.seat}</TableCell>
                    <TableCell>
                      {passenger.specialRequirements ? (
                        <Badge variant="outline" className="text-xs">
                          {passenger.specialRequirements}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRebookPassenger(passenger)}
                          className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {passenger.status === 'Rebooking Required' && (
                          <Button 
                            size="sm"
                            className="btn-flydubai-primary text-xs"
                            onClick={() => handleRebookPassenger(passenger)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Rebook
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Rebooking Dialog with Additional Services Flow */}
      <Dialog open={showRebookingDialog} onOpenChange={setShowRebookingDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-flydubai-blue" />
              {selectedPnrGroup 
                ? `Group Rebooking - PNR ${selectedPnrGroup.pnr} (${selectedPnrGroup.passengers.length} passengers)`
                : `Passenger Services - ${selectedPassenger?.name}`
              }
            </DialogTitle>
            <DialogDescription>
              {selectedPnrGroup
                ? `Manage rebooking and services for PNR: ${selectedPnrGroup.pnr}`
                : `Manage rebooking and services for PNR: ${selectedPassenger?.pnr}`
              }
            </DialogDescription>
          </DialogHeader>

          {(selectedPassenger || selectedPnrGroup) && (
            <div className="space-y-6">
              {/* Additional Services Step */}
              {showAdditionalServices && selectedFlightForServices ? (
                <div className="space-y-6">
                  {/* Flight Selection Summary */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Flight Selected: {selectedFlightForServices.flightNumber}
                      </CardTitle>
                      <p className="text-sm text-green-700">
                        {selectedFlightForServices.route} • {selectedFlightForServices.departure} → {selectedFlightForServices.arrival}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-green-800">
                            {cabinOptions.find(c => c.key === selectedFlightForServices.selectedCabin)?.name}
                          </div>
                          <div className="text-sm text-green-600">Cabin Class</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-green-800">
                            {selectedFlightForServices.selectedCabinDetails.price}
                          </div>
                          <div className="text-sm text-green-600">Price per Person</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-green-800">
                            {selectedFlightForServices.suitabilityScore}%
                          </div>
                          <div className="text-sm text-green-600">Suitability Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Services Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-flydubai-blue" />
                        Additional Services (Optional)
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Select optional services to enhance your travel experience. All services are optional and can be skipped.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {additionalServicesOptions.map((service) => {
                          const Icon = service.icon
                          const isSelected = selectedAdditionalServices[service.key]
                          const serviceCost = service.estimatedCost === 'Complimentary' ? 0 : 
                            parseInt(service.estimatedCost.replace(/[^\d]/g, '')) || 0
                          const totalCost = serviceCost * groupSize

                          return (
                            <div 
                              key={service.key}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-flydubai-blue bg-blue-50' 
                                  : 'border-gray-200 hover:border-flydubai-blue hover:bg-blue-50'
                              }`}
                              onClick={() => handleAdditionalServiceChange(service.key, !isSelected)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleAdditionalServiceChange(service.key, checked)}
                                  />
                                  <Icon className={`h-5 w-5 ${isSelected ? 'text-flydubai-blue' : 'text-gray-600'}`} />
                                  <span className={`font-medium ${isSelected ? 'text-flydubai-blue' : 'text-gray-900'}`}>
                                    {service.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-flydubai-orange">
                                    {service.estimatedCost === 'Complimentary' ? 'Free' : 
                                      groupSize > 1 ? `AED ${totalCost}` : service.estimatedCost
                                    }
                                  </span>
                                  {groupSize > 1 && serviceCost > 0 && (
                                    <div className="text-xs text-gray-500">
                                      ({service.estimatedCost} × {groupSize})
                                    </div>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 mb-2">{service.description}</p>

                              <Badge variant="outline" className="text-xs">
                                {service.category}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>

                      {/* Total Cost Summary */}
                      {calculateTotalServicesCost() > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total Additional Services Cost:</span>
                            <span className="text-lg font-bold text-flydubai-orange">
                              AED {calculateTotalServicesCost()}
                            </span>
                          </div>
                          {groupSize > 1 && (
                            <p className="text-sm text-gray-600 mt-1">
                              For {groupSize} passenger{groupSize > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons for Additional Services */}
                  <div className="flex justify-between gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleBackToFlightSelection}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Flight Selection
                    </Button>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleSkipAdditionalServices}
                        className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                      >
                        Skip Services & Proceed
                      </Button>
                      <Button 
                        className="btn-flydubai-primary"
                        onClick={handleSaveChanges}
                      >
                        <BellRing className="h-4 w-4 mr-2" />
                        Save Changes & Notify Passengers
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Original Flight Selection Flow */
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">
                      {selectedPnrGroup ? 'Group Details' : 'Passenger Details'}
                    </TabsTrigger>
                    <TabsTrigger value="rebooking">Smart Rebooking</TabsTrigger>
                    <TabsTrigger value="services">Quick Services</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    {selectedPnrGroup ? (
                      // Group Details View
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Group Information - PNR {selectedPnrGroup.pnr}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4">
                              {selectedPnrGroup.passengers.map((passenger, index) => (
                                <div key={passenger.id} className="p-4 border rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium">Passenger {index + 1}: {passenger.name}</h4>
                                    <div className="flex gap-2">
                                      <Badge className={getPriorityColor(passenger.priority)}>
                                        {passenger.priority}
                                      </Badge>
                                      <Badge className={getStatusColor(passenger.status)}>
                                        {passenger.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <label className="font-medium text-gray-600">Seat:</label>
                                      <div>{passenger.seat}</div>
                                    </div>
                                    <div>
                                      <label className="font-medium text-gray-600">Contact:</label>
                                      <div className="text-xs">{passenger.contactInfo}</div>
                                    </div>
                                    {passenger.specialRequirements && (
                                      <div>
                                        <label className="font-medium text-gray-600">Special Requirements:</label>
                                        <Badge variant="outline" className="ml-2">
                                          {passenger.specialRequirements}
                                        </Badge>
                                      </div>
                                    )}
                                    <div>
                                      <label className="font-medium text-gray-600">Preferences:</label>
                                      <div className="text-xs">
                                        {passenger.preferences?.seatPreference} seat, {passenger.preferences?.mealPreference} meal
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      // Individual Passenger Details View
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Passenger Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium text-gray-600">Name:</label>
                                <div>{selectedPassenger.name}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">PNR:</label>
                                <div>{selectedPassenger.pnr}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">Priority:</label>
                                <Badge className={getPriorityColor(selectedPassenger.priority)}>
                                  {selectedPassenger.priority}
                                </Badge>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">Status:</label>
                                <Badge className={getStatusColor(selectedPassenger.status)}>
                                  {selectedPassenger.status}
                                </Badge>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">Seat:</label>
                                <div>{selectedPassenger.seat}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">Contact:</label>
                                <div className="text-xs">{selectedPassenger.contactInfo}</div>
                              </div>
                            </div>
                            {selectedPassenger.specialRequirements && (
                              <div>
                                <label className="font-medium text-gray-600">Special Requirements:</label>
                                <Badge variant="outline" className="ml-2">
                                  {selectedPassenger.specialRequirements}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Passenger Preferences</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium text-gray-600">Seat Preference:</label>
                                <div>{selectedPassenger.preferences?.seatPreference || 'Not specified'}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">Meal Preference:</label>
                                <div>{selectedPassenger.preferences?.mealPreference || 'Standard'}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">Class Preference:</label>
                                <div>{selectedPassenger.preferences?.classPreference || 'Economy'}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">Loyalty Tier:</label>
                                <Badge variant="outline">
                                  {selectedPassenger.preferences?.loyaltyTier || 'None'}
                                </Badge>
                              </div>
                            </div>
                            {selectedPassenger.connectedFlights && selectedPassenger.connectedFlights.length > 0 && (
                              <div>
                                <label className="font-medium text-gray-600">Connected Flights:</label>
                                <div className="flex gap-2 mt-1">
                                  {selectedPassenger.connectedFlights.map((flight, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {flight}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="rebooking" className="space-y-4">
                    <div className="space-y-4">
                      {getAvailableFlights(selectedPnrGroup?.passengers || selectedPassenger).map((flight) => (
                        <Card key={flight.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Flight Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-flydubai-blue rounded-lg">
                                    <Plane className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="font-semibold text-lg text-flydubai-navy">{flight.flightNumber}</h3>
                                      <Badge variant="outline" className="text-xs">
                                        {flight.airline}
                                      </Badge>
                                      <div className="flex items-center gap-1">
                                        {getScoreIcon(flight.suitabilityScore)}
                                        <span className={`font-semibold ${getScoreColor(flight.suitabilityScore)}`}>
                                          {flight.suitabilityScore}% Match
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{flight.route} • {flight.aircraft}</p>
                                    <p className="text-sm text-gray-600">{flight.departure} → {flight.arrival} ({flight.duration})</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Timer className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">
                                      {flight.onTimePerformance}% On-time
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Group Seat Requirements */}
                              {selectedPnrGroup && (
                                <Alert className="border-blue-200 bg-blue-50">
                                  <Users2 className="h-4 w-4 text-blue-600" />
                                  <AlertDescription className="text-blue-800">
                                    <strong>Group Seating:</strong> {selectedPnrGroup.passengers.length} passengers need adjacent seats
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Cabin Selection */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  <Star className="h-4 w-4 text-flydubai-blue" />
                                  Select Cabin Class
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {cabinOptions.map((cabinOption) => {
                                    const cabin = flight.availableSeats[cabinOption.key]
                                    const isSelected = getSelectedCabin(flight.id) === cabinOption.key
                                    const isAvailable = isCabinAvailableForGroup(flight, cabinOption.key, groupSize)
                                    const Icon = cabinOption.icon

                                    return (
                                      <div 
                                        key={cabinOption.key}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                          isSelected 
                                            ? 'border-flydubai-blue bg-blue-50' 
                                            : isAvailable 
                                              ? 'border-gray-200 hover:border-flydubai-blue hover:bg-blue-50' 
                                              : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                        }`}
                                        onClick={() => isAvailable && handleCabinSelection(flight.id, cabinOption.key)}
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <Icon className={`h-5 w-5 ${isSelected ? 'text-flydubai-blue' : 'text-gray-600'}`} />
                                            <span className={`font-medium ${isSelected ? 'text-flydubai-blue' : 'text-gray-900'}`}>
                                              {cabinOption.name}
                                            </span>
                                            {isSelected && (
                                              <CircleCheck className="h-4 w-4 text-flydubai-blue" />
                                            )}
                                          </div>
                                          <span className="font-bold text-flydubai-orange">
                                            {cabin.price}
                                          </span>
                                        </div>

                                        <p className="text-xs text-gray-600 mb-3">{cabinOption.description}</p>

                                        <div className="flex items-center gap-2 mb-2">
                                          <Progress 
                                            value={(cabin.available / cabin.total) * 100} 
                                            className="flex-1 h-2"
                                          />
                                          <span className="text-xs text-gray-600">
                                            {cabin.available}/{cabin.total}
                                          </span>
                                        </div>

                                        {!isAvailable && selectedPnrGroup && (
                                          <div className="text-xs text-red-600 mt-1">
                                            Insufficient seats for group of {groupSize}
                                          </div>
                                        )}

                                        {isAvailable && (
                                          <div className="text-xs text-green-600 mt-1">
                                            ✓ Available for {groupSize > 1 ? `group of ${groupSize}` : 'passenger'}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Selection Required Alert */}
                              {!getSelectedCabin(flight.id) && (
                                <Alert className="border-orange-200 bg-orange-50">
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                  <AlertDescription>
                                    Please select a cabin class before proceeding with flight selection.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Amenities */}
                              <div className="flex flex-wrap gap-2">
                                {flight.amenities.map((amenity, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-xs bg-blue-50 rounded px-2 py-1">
                                    {getAmenityIcon(amenity)}
                                    <span>{amenity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Cascade Impact */}
                              {flight.cascadeImpact.hasImpact && (
                                <Alert className={`border ${getCascadeSeverityColor(flight.cascadeImpact.severity)}`}>
                                  <Route className="h-4 w-4" />
                                  <AlertDescription>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <strong>Connection Impact:</strong> {flight.cascadeImpact.description}
                                        <div className="text-xs mt-1">
                                          Affected flights: {flight.cascadeImpact.affectedFlights.join(', ')}
                                        </div>
                                      </div>
                                      <Badge className={getCascadeSeverityColor(flight.cascadeImpact.severity)}>
                                        {flight.cascadeImpact.severity.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Smart Recommendations */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-flydubai-blue" />
                                  Smart Recommendations
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {flight.recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs">
                                      {getRecommendationIcon(rec.type)}
                                      <div className="flex-1">
                                        <div className="font-medium">{rec.text}</div>
                                        <div className="text-gray-600">{rec.action}</div>
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          rec.priority === 'high' ? 'border-red-300 text-red-700' :
                                          rec.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                          'border-green-300 text-green-700'
                                        }`}
                                      >
                                        {rec.priority}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Select Flight Button */}
                              <div className="flex justify-end">
                                <Button 
                                  className={getSelectedCabin(flight.id) ? "btn-flydubai-primary" : ""}
                                  variant={getSelectedCabin(flight.id) ? "default" : "outline"}
                                  disabled={!getSelectedCabin(flight.id)}
                                  onClick={() => handleFlightSelection(flight)}
                                >
                                  {getSelectedCabin(flight.id) ? (
                                    <>
                                      <ArrowRight className="h-4 w-4 mr-2" />
                                      Select Flight ({cabinOptions.find(c => c.key === getSelectedCabin(flight.id))?.name})
                                    </>
                                  ) : (
                                    'Select Cabin First'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Quick Services {selectedPnrGroup && `(Group of ${selectedPnrGroup.passengers.length})`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Hotel Accommodation</div>
                              <div className="text-sm text-gray-600">
                                {selectedPnrGroup 
                                  ? `Overnight stay for ${selectedPnrGroup.passengers.length} passengers`
                                  : 'Overnight stay with meals'
                                }
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleHotelBooking(selectedPnrGroup || selectedPassenger)}
                            >
                              <Hotel className="h-4 w-4 mr-2" />
                              Book Hotel
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Meal Voucher</div>
                              <div className="text-sm text-gray-600">
                                {selectedPnrGroup 
                                  ? `AED ${50 * selectedPnrGroup.passengers.length} total for group`
                                  : 'AED 50 dining credit'
                                }
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleVoucherIssue(selectedPnrGroup || selectedPassenger)}
                            >
                              <Utensils className="h-4 w-4 mr-2" />
                              Issue
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Ground Transportation</div>
                              <div className="text-sm text-gray-600">
                                {selectedPnrGroup 
                                  ? `Group transport for ${selectedPnrGroup.passengers.length} passengers`
                                  : 'Airport transfer service'
                                }
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleTransportArrange(selectedPnrGroup || selectedPassenger)}
                            >
                              <Car className="h-4 w-4 mr-2" />
                              Arrange
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              {/* Footer buttons - only show when not in additional services flow */}
              {!showAdditionalServices && (
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowRebookingDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="btn-flydubai-primary">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hotel Booking Dialog */}
      <Dialog open={showHotelDialog} onOpenChange={setShowHotelDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-flydubai-blue" />
              Hotel Booking - {selectedPassenger?.name}
              {selectedPnrGroup && ` (Group of ${selectedPnrGroup.passengers.length})`}
            </DialogTitle>
            <DialogDescription>
              Select hotel accommodation for passenger PNR: {selectedPassenger?.pnr}
            </DialogDescription>
          </DialogHeader>

          {hotelBookingConfirmed ? (
            <div className="space-y-4">
              <div className="text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">Booking Confirmed!</h3>
                <p className="text-muted-foreground mb-4">
                  Hotel reservation has been made for {selectedPassenger?.name}
                  {selectedPnrGroup && ` and ${selectedPnrGroup.passengers.length - 1} other passenger(s)`}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-medium text-green-800">{selectedHotel?.name}</div>
                  <div className="text-sm text-green-700 mt-1">
                    Confirmation sent to: {selectedPassenger?.contactInfo}
                  </div>
                  <div className="text-sm text-green-700">
                    Booking Reference: HTL-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableHotels.map((hotel) => (
                  <Card key={hotel.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={hotel.image} 
                          alt={hotel.name}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-flydubai-navy">{hotel.name}</h3>
                              <p className="text-sm text-gray-600">{hotel.category} • {hotel.distance}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-flydubai-orange">{hotel.pricePerNight}</div>
                              <div className="text-xs text-gray-500">per night</div>
                              {selectedPnrGroup && (
                                <div className="text-xs text-gray-500">
                                  x{selectedPnrGroup.passengers.length} rooms
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < Math.floor(hotel.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">{hotel.rating}</span>
                            <Badge 
                              className={hotel.availability === 'Available' ? 'status-success' : 'status-warning'}
                            >
                              {hotel.availability}
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-600 mb-3">{hotel.description}</p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {hotel.amenities.map((amenity, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs bg-gray-100 rounded px-2 py-1">
                                {getAmenityIcon(amenity)}
                                <span>{amenity}</span>
                              </div>
                            ))}
                          </div>

                          <Button 
                            size="sm" 
                            className="w-full btn-flydubai-primary"
                            onClick={() => confirmHotelBooking(hotel)}
                            disabled={hotel.availability !== 'Available'}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meal Voucher Dialog */}
      <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-flydubai-blue" />
              Issue Meal Voucher
            </DialogTitle>
            <DialogDescription>
              Generate meal voucher for {selectedPassenger?.name}
              {selectedPnrGroup && ` and group (${selectedPnrGroup.passengers.length} passengers)`}
            </DialogDescription>
          </DialogHeader>

          {voucherIssued ? (
            <div className="space-y-4">
              <div className="text-center p-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-700 mb-2">
                  {selectedPnrGroup ? 'Group Vouchers Issued!' : 'Voucher Issued!'}
                </h3>
                <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-600" />
                  <div className="font-mono text-sm text-center">
                    FDV-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                    {selectedPnrGroup && `+${selectedPnrGroup.passengers.length - 1}`}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Voucher{selectedPnrGroup ? 's' : ''} sent to {selectedPassenger?.contactInfo}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer" 
                     onClick={() => issueVoucher(50, 'Standard')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Standard Meal Voucher</div>
                      <div className="text-sm text-gray-600">Valid at airport restaurants</div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      AED {selectedPnrGroup ? 50 * selectedPnrGroup.passengers.length : 50}
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                     onClick={() => issueVoucher(75, 'Premium')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Premium Meal Voucher</div>
                      <div className="text-sm text-gray-600">Includes drinks and snacks</div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      AED {selectedPnrGroup ? 75 * selectedPnrGroup.passengers.length : 75}
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                     onClick={() => issueVoucher(100, 'VIP')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">VIP Meal Voucher</div>
                      <div className="text-sm text-gray-600">Premium restaurants & lounges</div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      AED {selectedPnrGroup ? 100 * selectedPnrGroup.passengers.length : 100}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ground Transportation Dialog */}
      <Dialog open={showTransportDialog} onOpenChange={setShowTransportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-flydubai-blue" />
              Arrange Transportation
            </DialogTitle>
            <DialogDescription>
              Book ground transport for {selectedPassenger?.name}
              {selectedPnrGroup && ` and group (${selectedPnrGroup.passengers.length} passengers)`}
            </DialogDescription>
          </DialogHeader>

          {transportArranged ? (
            <div className="space-y-4">
              <div className="text-center p-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-700 mb-2">Transport Arranged!</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-medium text-green-800">Booking Reference</div>
                  <div className="font-mono text-sm text-green-700">
                    TXP-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </div>
                  <div className="text-sm text-green-700 mt-2">
                    Details sent to: {selectedPassenger?.contactInfo}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                     onClick={() => arrangeTransport('taxi', 'Standard taxi service')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Airport Taxi</div>
                      <div className="text-sm text-gray-600">
                        {selectedPnrGroup ? `Multiple taxis for ${selectedPnrGroup.passengers.length} passengers` : 'Standard taxi service'}
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      AED {selectedPnrGroup ? 80 * Math.ceil(selectedPnrGroup.passengers.length / 4) : 80}
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                     onClick={() => arrangeTransport('shuttle', 'Shared shuttle service')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Hotel Shuttle</div>
                      <div className="text-sm text-gray-600">
                        {selectedPnrGroup ? `Group shuttle service` : 'Shared shuttle service'}
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      AED {selectedPnrGroup ? 40 * selectedPnrGroup.passengers.length : 40}
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                     onClick={() => arrangeTransport('premium', 'Private car with driver')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Premium Car</div>
                      <div className="text-sm text-gray-600">
                        {selectedPnrGroup ? `Premium vehicles for group` : 'Private car with driver'}
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      AED {selectedPnrGroup ? 150 * Math.ceil(selectedPnrGroup.passengers.length / 3) : 150}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabs for Passenger Service and Crew Schedule */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="passenger-service">Passenger Service</TabsTrigger>
          <TabsTrigger value="crew-schedule">Crew Schedule Information</TabsTrigger>
        </TabsList>

        <TabsContent value="passenger-service" className="space-y-6">
          {/* Existing Passenger Services Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Affected Passengers Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-flydubai-blue" />
                  Affected Passengers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Passengers:</span>
                    <span className="font-semibold">{selectedFlight.passengers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">VIP Passengers:</span>
                    <span className="font-semibold">{Math.floor(selectedFlight.passengers * 0.08)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Connecting Passengers:</span>
                    <span className="font-semibold">{Math.floor(selectedFlight.passengers * 0.25)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Impact Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Accommodation Required:</span>
                    <Badge variant="outline" className="text-orange-700 border-orange-200">
                      {recoveryOption.timeline?.includes('hour') && parseInt(recoveryOption.timeline) >= 4 ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Meal Vouchers:</span>
                    <Badge variant="outline" className="text-blue-700 border-blue-200">
                      Required
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Compensation:</span>
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      As per EU261
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Required Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Send Notifications
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Arrange Accommodation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Process Compensation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Execute Button for Passenger Services Flow */}
          {fromExecution && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-green-800 mb-2">Ready to Execute Recovery Option</h3>
                    <p className="text-sm text-green-700">
                      Passenger services have been reviewed. Click execute to proceed with the recovery option.
                    </p>
                  </div>
                  <Button
                    className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                    onClick={handleExecuteWithPassengerServices}
                  >
                    Execute Recovery Option
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="crew-schedule" className="space-y-6">
          {/* Crew Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-flydubai-blue" />
                Crew Schedule Information - {recoveryOption.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flydubai-blue mr-4"></div>
                  <span>Loading crew information...</span>
                </div>
              ) : crewData && crewData.crew.length > 0 ? (
                <div className="space-y-6">
                  {/* Crew Status Table */}
                  <div>
                    <h4 className="font-medium mb-4">Crew Assignment Status</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Current Status</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Availability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {crewData.crew.map((member, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.type || member.role || member.position}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  member.status === 'Available'
                                    ? 'bg-green-100 text-green-700'
                                    : member.status === 'On Duty'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{member.location}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  member.availability === 'Available'
                                    ? 'border-green-300 text-green-700'
                                    : 'border-red-300 text-red-700'
                                }
                              >
                                {member.availability}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Duty Time Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Duty Time Constraints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Current Duty Time:</span>
                            <span className="font-medium">3h 45m / 8h 20m</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Rest Requirement:</span>
                            <span className="font-medium">Min 12h after duty</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Next Availability:</span>
                            <span className="font-medium">Tomorrow 08:00</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Operational Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Crew Changes Required:</span>
                            <span className="font-medium">
                              {recoveryOption.id?.includes('CREW') || recoveryOption.title?.toLowerCase().includes('crew') ? '2' : '0'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Briefing Time:</span>
                            <span className="font-medium">45 minutes</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Ready Time:</span>
                            <span className="font-medium">
                              {recoveryOption.timeline || '1 hour'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No specific crew changes required for this recovery option</p>
                  <p className="text-xs mt-1">Standard crew assignment will be maintained</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execute Button for Crew Schedule Flow */}
          {fromExecution && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-green-800 mb-2">Crew Information Reviewed</h3>
                    <p className="text-sm text-green-700">
                      Crew schedule impact has been assessed. Click execute to proceed with the recovery option.
                    </p>
                  </div>
                  <Button
                    className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                    onClick={handleExecuteWithPassengerServices}
                  >
                    Execute Recovery Option
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}