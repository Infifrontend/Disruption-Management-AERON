'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Checkbox } from './ui/checkbox'
import { Textarea } from './ui/textarea'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { 
  Hotel, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  Phone,
  Car,
  Clock,
  Users,
  Building,
  CreditCard,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Send,
  UserCheck,
  Plane,
  Timer,
  Route,
  Navigation,
  Activity,
  Shield,
  Target,
  Zap,
  Globe,
  Home,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Bell,
  MessageSquare,
  Star,
  Archive,
  RotateCcw,
  Bookmark,
  ArrowUp,
  History,
  Receipt,
  Mail,
  Headphones,
  AlertOctagon,
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react'

export function HOTACManagement() {
  const [activeTab, setActiveTab] = useState('all-records')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [baseAirportFilter, setBaseAirportFilter] = useState('all')
  const [pairingTypeFilter, setPairingTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [expandedRows, setExpandedRows] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Enhanced Mock HOTAC data with comprehensive pairing details
  const hotacRecords = [
    {
      id: 'HOTAC001',
      
      // Basic Flight Information
      flightNumber: 'FZ445',
      dateOfDisruption: '2025-01-11',
      rosteredDate: '2025-01-11 06:30',
      
      // Crew Information
      crewIds: ['CR2401', 'CR2402', 'CR2403', 'CR2404', 'CR2405'],
      crewRoles: ['Captain', 'First Officer', 'Senior Cabin Crew', 'Cabin Crew', 'Cabin Crew'],
      baseAirport: 'DXB',
      
      // Pairing Details
      pairingDetails: {
        pairingId: 'PR-2501-445',
        pairingType: 'International',
        pairingStartDate: '2025-01-11 05:00',
        pairingEndDate: '2025-01-12 20:30',
        totalPairingDuration: '39h 30m',
        numberOfFlights: 2,
        flightSequence: ['FZ445 DXB-BOM', 'FZ446 BOM-DXB'],
        layoverCount: 1,
        homeBaseReturn: true,
        pairingStatus: 'Active',
        creditHours: '8h 15m',
        dutyHours: '12h 45m',
        restPeriods: ['25h 30m BOM Rest'],
        legalCompliance: 'Compliant',
        maxDutyExceeded: false,
        restRequirementsMet: true
      },
      
      // Hotel Information
      hotelName: 'Mumbai Airport Hotel',
      hotelCategory: '4-Star',
      hotelLocation: 'BOM Terminal 2',
      checkInDateTime: '2025-01-11 12:00',
      checkOutDateTime: '2025-01-12 10:00',
      numberOfRooms: 3,
      bookingStatus: 'Confirmed',
      confirmationNumber: 'HTL-BOM-20250111-445',
      
      // Transport Information
      transportProviderName: 'Mumbai Airport Taxi Services',
      pickupLocation: 'BOM Arrivals Hall',
      dropLocation: 'Mumbai Airport Hotel',
      pickupTime: '2025-01-11 11:45',
      estimatedTravelTime: '15 minutes',
      vehiclePlateNumber: 'MH-01-AB-1234',
      driverContactNumber: '+91-98765-43210',
      transportStatus: 'Confirmed',
      
      // Additional Details
      totalCost: 'USD 285',
      specialRequests: 'Vegetarian meals, Early check-in',
      lastUpdated: '2025-01-10 18:30',
      priority: 'Standard',
      operationalNotes: 'Regular schedule accommodation'
    },
    {
      id: 'HOTAC002',
      
      // Basic Flight Information
      flightNumber: 'FZ789',
      dateOfDisruption: '2025-01-11',
      rosteredDate: '2025-01-11 14:20',
      
      // Crew Information
      crewIds: ['CR2406', 'CR2407', 'CR2408', 'CR2409'],
      crewRoles: ['Captain', 'First Officer', 'Senior Cabin Crew', 'Cabin Crew'],
      baseAirport: 'DXB',
      
      // Pairing Details
      pairingDetails: {
        pairingId: 'PR-2501-789',
        pairingType: 'International',
        pairingStartDate: '2025-01-11 13:00',
        pairingEndDate: '2025-01-13 03:00',
        totalPairingDuration: '38h 00m',
        numberOfFlights: 2,
        flightSequence: ['FZ789 DXB-IST', 'FZ790 IST-DXB'],
        layoverCount: 1,
        homeBaseReturn: true,
        pairingStatus: 'Active',
        creditHours: '7h 50m',
        dutyHours: '11h 30m',
        restPeriods: ['25h 45m IST Rest'],
        legalCompliance: 'Compliant',
        maxDutyExceeded: false,
        restRequirementsMet: true
      },
      
      // Hotel Information
      hotelName: 'Istanbul Grand Hotel',
      hotelCategory: '5-Star',
      hotelLocation: 'IST Vicinity - 2.5km',
      checkInDateTime: '2025-01-11 19:00',
      checkOutDateTime: '2025-01-12 18:00',
      numberOfRooms: 2,
      bookingStatus: 'Confirmed',
      confirmationNumber: 'HTL-IST-20250111-789',
      
      // Transport Information
      transportProviderName: 'Istanbul Airport Shuttle',
      pickupLocation: 'IST Arrivals Terminal',
      dropLocation: 'Istanbul Grand Hotel',
      pickupTime: '2025-01-11 18:45',
      estimatedTravelTime: '25 minutes',
      vehiclePlateNumber: 'TR-34-ABC-567',
      driverContactNumber: '+90-532-123-4567',
      transportStatus: 'Confirmed',
      
      // Additional Details
      totalCost: 'USD 440',
      specialRequests: 'Airport shuttle required',
      lastUpdated: '2025-01-10 19:15',
      priority: 'High',
      operationalNotes: 'VIP crew accommodation'
    },
    {
      id: 'HOTAC003',
      
      // Basic Flight Information
      flightNumber: 'FZ567',
      dateOfDisruption: '2025-01-12',
      rosteredDate: '2025-01-12 22:30',
      
      // Crew Information
      crewIds: ['CR2410', 'CR2411', 'CR2412', 'CR2413', 'CR2414'],
      crewRoles: ['Captain', 'First Officer', 'Senior Cabin Crew', 'Cabin Crew', 'Cabin Crew'],
      baseAirport: 'DXB',
      
      // Pairing Details
      pairingDetails: {
        pairingId: 'PR-2501-567',
        pairingType: 'Regional',
        pairingStartDate: '2025-01-12 21:00',
        pairingEndDate: '2025-01-14 08:00',
        totalPairingDuration: '59h 00m',
        numberOfFlights: 2,
        flightSequence: ['FZ567 DXB-KHI', 'FZ568 KHI-DXB'],
        layoverCount: 1,
        homeBaseReturn: true,
        pairingStatus: 'Disrupted',
        creditHours: '6h 30m',
        dutyHours: '10h 15m',
        restPeriods: ['49h 45m KHI Rest'],
        legalCompliance: 'Under Review',
        maxDutyExceeded: true,
        restRequirementsMet: false
      },
      
      // Hotel Information
      hotelName: 'Karachi Airport Hotel',
      hotelCategory: '4-Star',
      hotelLocation: 'KHI Terminal Building',
      checkInDateTime: '2025-01-13 02:00',
      checkOutDateTime: '2025-01-14 01:00',
      numberOfRooms: 3,
      bookingStatus: 'Pending',
      confirmationNumber: 'HTL-KHI-20250113-567',
      
      // Transport Information
      transportProviderName: 'Karachi Airport Transport',
      pickupLocation: 'KHI Arrivals Gate 3',
      dropLocation: 'Karachi Airport Hotel',
      pickupTime: '2025-01-13 01:45',
      estimatedTravelTime: '10 minutes',
      vehiclePlateNumber: 'KHI-2024-789',
      driverContactNumber: '+92-321-987-6543',
      transportStatus: 'Pending',
      
      // Additional Details
      totalCost: 'USD 225',
      specialRequests: 'Late arrival accommodation',
      lastUpdated: '2025-01-10 20:45',
      priority: 'Urgent',
      operationalNotes: 'Disruption recovery - requires immediate attention'
    }
  ]

  const [filteredRecords, setFilteredRecords] = useState(hotacRecords)

  useEffect(() => {
    let filtered = hotacRecords

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.crewIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        record.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.pairingDetails.pairingId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.bookingStatus.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Base airport filter
    if (baseAirportFilter !== 'all') {
      filtered = filtered.filter(record => record.baseAirport === baseAirportFilter)
    }

    // Pairing type filter
    if (pairingTypeFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.pairingDetails.pairingType.toLowerCase() === pairingTypeFilter.toLowerCase()
      )
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(record => 
        record.rosteredDate.startsWith(dateFilter) ||
        (record.dateOfDisruption && record.dateOfDisruption === dateFilter)
      )
    }

    setFilteredRecords(filtered)
  }, [searchTerm, statusFilter, baseAirportFilter, pairingTypeFilter, dateFilter])

  // Action handlers for airline operations
  const handleRebookHotel = (record) => {
    alert(`Initiating hotel rebooking for ${record.flightNumber} - ${record.hotelName}`)
    // Would integrate with hotel booking system
  }

  const handleChangeStatus = (record, newStatus) => {
    alert(`Changing status of ${record.confirmationNumber} from ${record.bookingStatus} to ${newStatus}`)
    // Would update booking status in system
  }

  const handleNotifyHotel = (record) => {
    alert(`Sending notification to ${record.hotelName} about booking ${record.confirmationNumber}`)
    // Would send notification to hotel
  }

  const handleNotifyTransport = (record) => {
    alert(`Sending notification to ${record.transportProviderName} for pickup at ${record.pickupTime}`)
    // Would send notification to transport provider
  }

  const handleNotifyCrew = (record) => {
    alert(`Sending accommodation details to crew members: ${record.crewIds.join(', ')}`)
    // Would send notifications to crew
  }

  const handleGenerateVoucher = (record) => {
    alert(`Generating accommodation voucher for ${record.flightNumber} - ${record.confirmationNumber}`)
    // Would generate voucher document
  }

  const handleCancelBooking = (record) => {
    if (confirm(`Are you sure you want to cancel booking ${record.confirmationNumber}?`)) {
      alert(`Cancelling booking for ${record.flightNumber} at ${record.hotelName}`)
      // Would cancel booking
    }
  }

  const handleEscalateIssue = (record) => {
    alert(`Escalating accommodation issue for ${record.flightNumber} to management`)
    // Would escalate to operations management
  }

  const handleRequestPriority = (record) => {
    alert(`Requesting priority handling for ${record.flightNumber} accommodation`)
    // Would request priority processing
  }

  const handleViewHistory = (record) => {
    alert(`Viewing booking history for ${record.confirmationNumber}`)
    // Would show booking history and changes
  }

  const handleContactSupport = (record) => {
    alert(`Contacting 24/7 HOTAC support for ${record.flightNumber}`)
    // Would initiate support contact
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertOctagon className="h-3 w-3 mr-1" />Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200"><ArrowUp className="h-3 w-3 mr-1" />High</Badge>
      case 'standard':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Standard</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{priority}</Badge>
    }
  }

  const getPairingStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><PlayCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case 'disrupted':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Disrupted</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200"><StopCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>
    }
  }

  const getPairingTypeBadge = (type) => {
    switch (type.toLowerCase()) {
      case 'international':
        return <Badge className="bg-flydubai-blue text-white"><Globe className="h-3 w-3 mr-1" />International</Badge>
      case 'domestic':
        return <Badge className="bg-flydubai-navy text-white"><Home className="h-3 w-3 mr-1" />Domestic</Badge>
      case 'regional':
        return <Badge className="bg-flydubai-orange text-white"><Navigation className="h-3 w-3 mr-1" />Regional</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getComplianceBadge = (compliance, maxDutyExceeded, restMet) => {
    if (compliance === 'N/A') {
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">N/A</Badge>
    }
    
    if (maxDutyExceeded || !restMet) {
      return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Non-Compliant</Badge>
    }
    
    if (compliance === 'Under Review') {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>
    }
    
    return <Badge className="bg-green-100 text-green-700 border-green-200"><Shield className="h-3 w-3 mr-1" />Compliant</Badge>
  }

  const getHotelCategoryBadge = (category) => {
    return (
      <Badge variant="outline" className="border-flydubai-blue text-flydubai-blue">
        {category}
      </Badge>
    )
  }

  const handleSelectRow = (recordId) => {
    setSelectedRows(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRows.length === filteredRecords.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredRecords.map(record => record.id))
    }
  }

  const toggleRowExpansion = (recordId) => {
    setExpandedRows(prev => 
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedRecords = React.useMemo(() => {
    if (!sortConfig.key) return filteredRecords

    return [...filteredRecords].sort((a, b) => {
      let aVal, bVal
      
      // Handle nested pairing details
      if (sortConfig.key.startsWith('pairing.')) {
        const pairingKey = sortConfig.key.replace('pairing.', '')
        aVal = a.pairingDetails[pairingKey]
        bVal = b.pairingDetails[pairingKey]
      } else {
        aVal = a[sortConfig.key]
        bVal = b[sortConfig.key]
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredRecords, sortConfig])

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} for records:`, selectedRows)
  }

  const exportToCSV = () => {
    const headers = [
      'Flight Number', 'Date of Disruption', 'Rostered Flight', 'Crew IDs', 'Crew Roles',
      'Base Airport', 'Pairing ID', 'Pairing Type', 'Pairing Start', 'Pairing End', 
      'Total Duration', 'Number of Flights', 'Flight Sequence', 'Layover Count',
      'Credit Hours', 'Duty Hours', 'Rest Periods', 'Compliance Status',
      'Hotel Name', 'Hotel Category', 'Hotel Location', 'Check-in Date & Time',
      'Check-out Date & Time', 'Number of Rooms', 'Booking Status', 'Confirmation Number',
      'Transport Provider', 'Pickup Location', 'Drop Location', 'Pickup Time',
      'Travel Time', 'Vehicle Plate', 'Driver Contact', 'Transport Status', 'Priority'
    ]
    
    const csvContent = [
      headers.join(','),
      ...sortedRecords.map(record => [
        record.flightNumber,
        record.dateOfDisruption || 'N/A',
        record.rosteredDate,
        record.crewIds.join(';'),
        record.crewRoles.join(';'),
        record.baseAirport,
        record.pairingDetails.pairingId,
        record.pairingDetails.pairingType,
        record.pairingDetails.pairingStartDate,
        record.pairingDetails.pairingEndDate,
        record.pairingDetails.totalPairingDuration,
        record.pairingDetails.numberOfFlights,
        record.pairingDetails.flightSequence.join(';'),
        record.pairingDetails.layoverCount,
        record.pairingDetails.creditHours,
        record.pairingDetails.dutyHours,
        record.pairingDetails.restPeriods.join(';'),
        record.pairingDetails.legalCompliance,
        record.hotelName,
        record.hotelCategory,
        record.hotelLocation,
        record.checkInDateTime,
        record.checkOutDateTime,
        record.numberOfRooms,
        record.bookingStatus,
        record.confirmationNumber,
        record.transportProviderName,
        record.pickupLocation,
        record.dropLocation,
        record.pickupTime,
        record.estimatedTravelTime,
        record.vehiclePlateNumber,
        record.driverContactNumber,
        record.transportStatus,
        record.priority
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HOTAC_Pairing_Records_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">Crew HOTAC & Pairing Management</h2>
          <p className="text-muted-foreground">Hotel, Transport Accommodation & Crew Pairing Records</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-medium text-flydubai-blue">{hotacRecords.length}</p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">{hotacRecords.filter(r => r.bookingStatus === 'Confirmed').length}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-yellow-600">{hotacRecords.filter(r => r.bookingStatus === 'Pending').length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-red-600">{hotacRecords.filter(r => r.priority === 'Urgent').length}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-flydubai-navy">
            <Filter className="h-5 w-5" />
            Search & Filter Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Flight, Crew ID, Pairing..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Base Airport</label>
              <Select value={baseAirportFilter} onValueChange={setBaseAirportFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Airports</SelectItem>
                  <SelectItem value="DXB">DXB - Dubai</SelectItem>
                  <SelectItem value="AUH">AUH - Abu Dhabi</SelectItem>
                  <SelectItem value="SHJ">SHJ - Sharjah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Pairing Type</label>
              <Select value={pairingTypeFilter} onValueChange={setPairingTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="domestic">Domestic</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={exportToCSV}
                className="w-full bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-flydubai-navy">
                {selectedRows.length} record{selectedRows.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleBulkAction('confirm')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Bulk Confirm
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleBulkAction('notify')}
                  className="bg-flydubai-blue hover:bg-flydubai-blue/90 text-white"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Notify All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedRows([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-flydubai-navy">
            <Hotel className="h-5 w-5" />
            HOTAC & Pairing Records ({sortedRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedRows.length === filteredRecords.length && filteredRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('flightNumber')}>
                  Flight Number
                  {sortConfig.key === 'flightNumber' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </TableHead>
                <TableHead>Date/Status</TableHead>
                <TableHead>Crew Details</TableHead>
                <TableHead>Pairing Information</TableHead>
                <TableHead>Duration & Compliance</TableHead>
                <TableHead>Hotel Information</TableHead>
                <TableHead>Accommodation Period</TableHead>
                <TableHead>Transport Details</TableHead>
                <TableHead>Booking Status</TableHead>
                <TableHead className="w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <TableRow className="hover:bg-blue-50">
                    <TableCell>
                      <Checkbox 
                        checked={selectedRows.includes(record.id)}
                        onCheckedChange={() => handleSelectRow(record.id)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(record.id)}
                      >
                        {expandedRows.includes(record.id) ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className="bg-flydubai-blue text-white">
                          {record.flightNumber}
                        </Badge>
                        <Badge variant="outline" className="border-flydubai-orange text-flydubai-orange">
                          {record.baseAirport}
                        </Badge>
                        {getPriorityBadge(record.priority)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {record.dateOfDisruption ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{record.dateOfDisruption}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Scheduled</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {record.rosteredDate.split(' ')[0]}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="h-3 w-3" />
                          <span className="font-medium">{record.crewIds.length} crew</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>{record.crewRoles[0]}</div>
                          <div>+{record.crewRoles.length - 1} others</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="font-medium">{record.pairingDetails.pairingId}</div>
                        {getPairingTypeBadge(record.pairingDetails.pairingType)}
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Route className="h-3 w-3" />
                          <span className="text-xs">{record.pairingDetails.numberOfFlights} flights</span>
                        </div>
                        {getPairingStatusBadge(record.pairingDetails.pairingStatus)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{record.pairingDetails.totalPairingDuration}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <div>Duty: {record.pairingDetails.dutyHours}</div>
                          <div>Credit: {record.pairingDetails.creditHours}</div>
                        </div>
                        {getComplianceBadge(
                          record.pairingDetails.legalCompliance,
                          record.pairingDetails.maxDutyExceeded,
                          record.pairingDetails.restRequirementsMet
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{record.hotelName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {getHotelCategoryBadge(record.hotelCategory)}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{record.hotelLocation}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          <span className="text-xs">{record.numberOfRooms} rooms</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Check-in:</div>
                        <div className="text-xs">{record.checkInDateTime}</div>
                        <div className="text-muted-foreground">Check-out:</div>
                        <div className="text-xs">{record.checkOutDateTime}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{record.transportProviderName}</div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <Car className="h-3 w-3" />
                          <span className="text-xs">{record.vehiclePlateNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusBadge(record.transportStatus)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(record.bookingStatus)}
                        <div className="text-xs font-mono">{record.confirmationNumber}</div>
                        <div className="text-xs text-flydubai-orange font-medium">{record.totalCost}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {/* View Details - Primary Action */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>HOTAC Record Details</DialogTitle>
                              <DialogDescription>
                                View comprehensive details for {record.flightNumber} including pairing information, hotel and transport arrangements.
                              </DialogDescription>
                            </DialogHeader>
                            <DetailedRecordView record={record} />
                          </DialogContent>
                        </Dialog>

                        {/* More Actions Dropdown */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button size="sm" variant="outline" title="More Actions">
                              <MoreHorizontal className="h-3 w-3 mr-1" />
                              More Actions
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2" align="end">
                            <div className="space-y-1">
                              <div className="px-2 py-1 text-sm font-medium text-flydubai-navy border-b border-gray-200 mb-2">
                                Actions for {record.flightNumber}
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleNotifyCrew(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-blue-50 hover:text-flydubai-blue"
                              >
                                <Users className="h-3 w-3 mr-2" />
                                Notify Crew
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleNotifyHotel(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-green-50 hover:text-green-700"
                              >
                                <Hotel className="h-3 w-3 mr-2" />
                                Notify Hotel
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleNotifyTransport(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-orange-50 hover:text-flydubai-orange"
                              >
                                <Car className="h-3 w-3 mr-2" />
                                Notify Transport
                              </Button>

                              {/* Status-specific Actions */}
                              {record.bookingStatus === 'Pending' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleChangeStatus(record, 'Confirmed')}
                                  className="w-full justify-start h-8 px-2 hover:bg-green-50 hover:text-green-700"
                                >
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  Confirm Booking
                                </Button>
                              )}

                              {record.priority === 'Urgent' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleEscalateIssue(record)}
                                  className="w-full justify-start h-8 px-2 hover:bg-red-50 hover:text-red-700"
                                >
                                  <AlertOctagon className="h-3 w-3 mr-2" />
                                  Escalate Issue
                                </Button>
                              )}
                              
                              <div className="border-t border-gray-200 my-1"></div>
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleRebookHotel(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-orange-50 hover:text-flydubai-orange"
                              >
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Rebook Hotel
                              </Button>
                              
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleGenerateVoucher(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-blue-50 hover:text-flydubai-blue"
                              >
                                <Receipt className="h-3 w-3 mr-2" />
                                Generate Voucher
                              </Button>
                              
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewHistory(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-blue-50 hover:text-flydubai-blue"
                              >
                                <History className="h-3 w-3 mr-2" />
                                View History
                              </Button>
                              
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRequestPriority(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-yellow-50 hover:text-yellow-700"
                              >
                                <Star className="h-3 w-3 mr-2" />
                                Request Priority
                              </Button>
                              
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleContactSupport(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-green-50 hover:text-green-700"
                              >
                                <Headphones className="h-3 w-3 mr-2" />
                                Contact Support
                              </Button>
                              
                              <div className="border-t border-gray-200 my-1"></div>
                              
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelBooking(record)}
                                className="w-full justify-start h-8 px-2 hover:bg-red-50 hover:text-red-700"
                              >
                                <XCircle className="h-3 w-3 mr-2" />
                                Cancel Booking
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row Details */}
                  {expandedRows.includes(record.id) && (
                    <TableRow>
                      <TableCell colSpan="12" className="bg-gray-50 p-4">
                        <ExpandedRowDetails record={record} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          
          {sortedRecords.length === 0 && (
            <div className="text-center py-8">
              <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No HOTAC records found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Enhanced Expanded Row Details Component with Pairing Information
function ExpandedRowDetails({ record }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Pairing Details */}
      <div>
        <h4 className="font-medium text-flydubai-navy mb-3">Pairing Details</h4>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded border">
            <div className="flex items-center gap-2 mb-2">
              <Route className="h-4 w-4 text-flydubai-blue" />
              <span className="font-medium">{record.pairingDetails.pairingId}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                {getPairingTypeBadge(record.pairingDetails.pairingType)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getPairingStatusBadge(record.pairingDetails.pairingStatus)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{record.pairingDetails.totalPairingDuration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flights:</span>
                <span>{record.pairingDetails.numberOfFlights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Layovers:</span>
                <span>{record.pairingDetails.layoverCount}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded border">
            <h5 className="font-medium text-sm mb-2">Flight Sequence</h5>
            <div className="space-y-1">
              {record.pairingDetails.flightSequence.map((flight, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  {flight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Duty & Rest Information */}
      <div>
        <h4 className="font-medium text-flydubai-navy mb-3">Duty & Rest Information</h4>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credit Hours:</span>
                <span className="font-medium">{record.pairingDetails.creditHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duty Hours:</span>
                <span className={`font-medium ${record.pairingDetails.maxDutyExceeded ? 'text-red-600' : ''}`}>
                  {record.pairingDetails.dutyHours}
                  {record.pairingDetails.maxDutyExceeded && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pairing Start:</span>
                <span>{record.pairingDetails.pairingStartDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pairing End:</span>
                <span>{record.pairingDetails.pairingEndDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Home Base Return:</span>
                <span>{record.pairingDetails.homeBaseReturn ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded border">
            <h5 className="font-medium text-sm mb-2">Rest Periods</h5>
            <div className="space-y-1">
              {record.pairingDetails.restPeriods.map((rest, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  {rest}
                </div>
              ))}
            </div>
            <div className="mt-2">
              {getComplianceBadge(
                record.pairingDetails.legalCompliance,
                record.pairingDetails.maxDutyExceeded,
                record.pairingDetails.restRequirementsMet
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Crew Information */}
      <div>
        <h4 className="font-medium text-flydubai-navy mb-3">Complete Crew Information</h4>
        <div className="space-y-2">
          {record.crewIds.map((crewId, index) => (
            <div key={crewId} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-flydubai-blue" />
                <span className="font-medium">{crewId}</span>
              </div>
              <Badge variant="outline">{record.crewRoles[index]}</Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-1">Special Requests:</div>
          <div className="text-sm p-2 bg-white rounded border">
            {record.specialRequests || 'None'}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-1">Operational Notes:</div>
          <div className="text-sm p-2 bg-white rounded border">
            {record.operationalNotes || 'None'}
          </div>
        </div>
      </div>
      
      {/* Transport & Cost Details */}
      <div>
        <h4 className="font-medium text-flydubai-navy mb-3">Transport & Cost Information</h4>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded border">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-flydubai-orange" />
              <div>
                <div className="font-medium">{record.transportProviderName}</div>
                <div className="text-sm text-muted-foreground">{record.vehiclePlateNumber}</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup:</span>
                <span>{record.pickupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drop:</span>
                <span>{record.dropLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup Time:</span>
                <span>{record.pickupTime.split(' ')[1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Travel Time:</span>
                <span>{record.estimatedTravelTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <a href={`tel:${record.driverContactNumber}`} className="text-flydubai-blue hover:underline">
                  {record.driverContactNumber}
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Cost:</span>
              <span className="font-semibold text-flydubai-orange">{record.totalCost}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Priority:</span>
              {getPriorityBadge(record.priority)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              <span className="text-sm">{record.lastUpdated}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="bg-flydubai-blue hover:bg-flydubai-blue/90 text-white flex-1">
              <Phone className="h-3 w-3 mr-1" />
              Contact Hotel
            </Button>
            <Button size="sm" className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white flex-1">
              <Send className="h-3 w-3 mr-1" />
              Send Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Detailed Record View Modal Component with Pairing Information
function DetailedRecordView({ record }) {
  return (
    <div className="space-y-6">
      {/* Pairing Overview */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-flydubai-navy">Pairing Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-flydubai-blue">{record.pairingDetails.numberOfFlights}</div>
            <div className="text-sm text-muted-foreground">Total Flights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-flydubai-orange">{record.pairingDetails.totalPairingDuration}</div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-flydubai-navy">{record.pairingDetails.layoverCount}</div>
            <div className="text-sm text-muted-foreground">Layovers</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight & Pairing Information */}
        <div>
          <h4 className="font-medium mb-4 text-flydubai-navy">Flight & Pairing Information</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Flight Number:</span>
                <div className="font-medium">{record.flightNumber}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Base Airport:</span>
                <div className="font-medium">{record.baseAirport}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Pairing ID:</span>
                <div className="font-medium">{record.pairingDetails.pairingId}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Pairing Type:</span>
                <div>{getPairingTypeBadge(record.pairingDetails.pairingType)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Pairing Status:</span>
                <div>{getPairingStatusBadge(record.pairingDetails.pairingStatus)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Home Base Return:</span>
                <div className="font-medium">{record.pairingDetails.homeBaseReturn ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div>
              <span className="text-muted-foreground text-sm">Flight Sequence:</span>
              <div className="mt-2 space-y-2">
                {record.pairingDetails.flightSequence.map((flight, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{flight}</span>
                    <Badge variant="outline">{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-muted-foreground text-sm">Crew Members:</span>
              <div className="mt-2 space-y-2">
                {record.crewIds.map((crewId, index) => (
                  <div key={crewId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{crewId}</span>
                    <Badge variant="outline">{record.crewRoles[index]}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Duty & Compliance Information */}
        <div>
          <h4 className="font-medium mb-4 text-flydubai-navy">Duty & Compliance Information</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Pairing Duration:</span>
                <div className="font-medium text-lg">{record.pairingDetails.totalPairingDuration}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Credit Hours:</span>
                  <div className="font-medium">{record.pairingDetails.creditHours}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Duty Hours:</span>
                  <div className={`font-medium ${record.pairingDetails.maxDutyExceeded ? 'text-red-600' : ''}`}>
                    {record.pairingDetails.dutyHours}
                    {record.pairingDetails.maxDutyExceeded && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Pairing Start:</span>
                  <div className="font-medium">{record.pairingDetails.pairingStartDate}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pairing End:</span>
                  <div className="font-medium">{record.pairingDetails.pairingEndDate}</div>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Legal Compliance:</span>
                <div className="mt-1">
                  {getComplianceBadge(
                    record.pairingDetails.legalCompliance,
                    record.pairingDetails.maxDutyExceeded,
                    record.pairingDetails.restRequirementsMet
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-muted-foreground text-sm">Rest Periods:</span>
              <div className="mt-2 space-y-2">
                {record.pairingDetails.restPeriods.map((rest, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-flydubai-blue" />
                      <span className="text-sm">{rest}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Compliance Warnings */}
            {(record.pairingDetails.maxDutyExceeded || !record.pairingDetails.restRequirementsMet) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Compliance Issues Detected</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {record.pairingDetails.maxDutyExceeded && <li>• Maximum duty time exceeded</li>}
                  {!record.pairingDetails.restRequirementsMet && <li>• Minimum rest requirements not met</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hotel Information */}
      <div>
        <h4 className="font-medium mb-4 text-flydubai-navy">Hotel Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Hotel Name:</span>
              <div className="font-medium">{record.hotelName}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <div>{getHotelCategoryBadge(record.hotelCategory)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Rooms:</span>
                <div className="font-medium">{record.numberOfRooms}</div>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Location:</span>
              <div className="font-medium">{record.hotelLocation}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div>{getStatusBadge(record.bookingStatus)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Confirmation:</span>
                <div className="font-mono text-xs">{record.confirmationNumber}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Check-in:</span>
                <div className="font-medium">{record.checkInDateTime}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Check-out:</span>
                <div className="font-medium">{record.checkOutDateTime}</div>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Cost:</span>
              <div className="font-semibold text-flydubai-orange text-lg">{record.totalCost}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <div className="font-medium">{record.lastUpdated}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transport Information */}
      <div>
        <h4 className="font-medium mb-4 text-flydubai-navy">Transport Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Provider:</span>
              <div className="font-medium">{record.transportProviderName}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Vehicle:</span>
                <div className="font-medium">{record.vehiclePlateNumber}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div>{getStatusBadge(record.transportStatus)}</div>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Driver Contact:</span>
              <div className="font-medium">{record.driverContactNumber}</div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Pickup Location:</span>
              <div className="font-medium">{record.pickupLocation}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Drop Location:</span>
              <div className="font-medium">{record.dropLocation}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Pickup Time:</span>
                <div className="font-medium">{record.pickupTime}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Travel Time:</span>
                <div className="font-medium">{record.estimatedTravelTime}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-flydubai-navy">Additional Information</h4>
        <div className="space-y-3">
          <div>
            <span className="text-muted-foreground text-sm">Special Requests:</span>
            <div className="mt-1 p-2 bg-white rounded border text-sm">
              {record.specialRequests || 'None'}
            </div>
          </div>
          
          <div>
            <span className="text-muted-foreground text-sm">Operational Notes:</span>
            <div className="mt-1 p-2 bg-white rounded border text-sm">
              {record.operationalNotes || 'None'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-lg font-semibold text-flydubai-blue">{record.pairingDetails.creditHours}</div>
              <div className="text-xs text-muted-foreground">Credit Hours</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-lg font-semibold text-flydubai-orange">{record.totalCost}</div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-lg font-semibold text-flydubai-navy">{record.numberOfRooms}</div>
              <div className="text-xs text-muted-foreground">Rooms Booked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions 
function getStatusBadge(status) {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Confirmed</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>
  }
}

function getPriorityBadge(priority) {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertOctagon className="h-3 w-3 mr-1" />Urgent</Badge>
    case 'high':
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200"><ArrowUp className="h-3 w-3 mr-1" />High</Badge>
    case 'standard':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Standard</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{priority}</Badge>
  }
}

function getPairingStatusBadge(status) {
  switch (status.toLowerCase()) {
    case 'active':
      return <Badge className="bg-green-100 text-green-700 border-green-200"><PlayCircle className="h-3 w-3 mr-1" />Active</Badge>
    case 'scheduled':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
    case 'disrupted':
      return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Disrupted</Badge>
    case 'cancelled':
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200"><StopCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
    case 'completed':
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>
  }
}

function getPairingTypeBadge(type) {
  switch (type.toLowerCase()) {
    case 'international':
      return <Badge className="bg-flydubai-blue text-white"><Globe className="h-3 w-3 mr-1" />International</Badge>
    case 'domestic':
      return <Badge className="bg-flydubai-navy text-white"><Home className="h-3 w-3 mr-1" />Domestic</Badge>
    case 'regional':
      return <Badge className="bg-flydubai-orange text-white"><Navigation className="h-3 w-3 mr-1" />Regional</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

function getComplianceBadge(compliance, maxDutyExceeded, restMet) {
  if (compliance === 'N/A') {
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">N/A</Badge>
  }
  
  if (maxDutyExceeded || !restMet) {
    return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Non-Compliant</Badge>
  }
  
  if (compliance === 'Under Review') {
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>
  }
  
  return <Badge className="bg-green-100 text-green-700 border-green-200"><Shield className="h-3 w-3 mr-1" />Compliant</Badge>
}

function getHotelCategoryBadge(category) {
  return (
    <Badge variant="outline" className="border-flydubai-blue text-flydubai-blue">
      {category}
    </Badge>
  )
}