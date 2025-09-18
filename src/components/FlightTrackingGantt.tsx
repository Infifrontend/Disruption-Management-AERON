'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Slider } from './ui/slider'
import { 
  Calendar,
  Filter,
  Search,
  Plane,
  Clock,
  MapPin,
  Users,
  Fuel,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  MoreHorizontal,
  Timer,
  UserCheck,
  Building,
  Gauge,
  Layers,
  Filter as FilterIcon,
  X,
  Hash
} from 'lucide-react'

import { useAirlineTheme } from "../hooks/useAirlineTheme";

// Enhanced mock aircraft data for Flydubai with 25+ aircraft and comprehensive flight schedules
const aircraftFleet = [
  {
    id: 'AC001',
    tailNumber: 'A6-FDX',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'DXB',
    status: 'active',
    utilization: 87,
    nextMaintenance: '2025-01-15',
    age: 8.5,
    crew: 'Crew Alpha',
    gate: 'T2-B12',
    flights: [
      { id: 'FZ215', departure: { time: '08:30', airport: 'DXB' }, arrival: { time: '13:15', airport: 'BOM' }, duration: 4.75, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-BOM', priority: 'high' },
      { id: 'FZ216', departure: { time: '18:15', airport: 'BOM' }, arrival: { time: '21:30', airport: 'DXB' }, duration: 4.25, passengers: 175, status: 'delayed', delay: 45, route: 'BOM-DXB', priority: 'medium' }
    ]
  },
  {
    id: 'AC002',
    tailNumber: 'A6-FDY',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'DEL',
    status: 'active',
    utilization: 92,
    nextMaintenance: '2025-01-20',
    age: 3.2,
    crew: 'Crew Beta',
    gate: 'T3-A15',
    flights: [
      { id: 'FZ001', departure: { time: '10:15', airport: 'DEL' }, arrival: { time: '12:45', airport: 'DXB' }, duration: 3.5, passengers: 185, status: 'on-time', delay: 0, route: 'DEL-DXB', priority: 'high' },
      { id: 'FZ147', departure: { time: '21:30', airport: 'DXB' }, arrival: { time: '03:15+1', airport: 'IST' }, duration: 4.75, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-IST', priority: 'medium' }
    ]
  },
  {
    id: 'AC003',
    tailNumber: 'A6-FDZ',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'KHI',
    status: 'maintenance',
    utilization: 0,
    nextMaintenance: '2025-01-08',
    age: 6.8,
    crew: null,
    gate: 'MNT-01',
    flights: []
  },
  {
    id: 'AC004',
    tailNumber: 'A6-FEA',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'COK',
    status: 'active',
    utilization: 78,
    nextMaintenance: '2025-01-25',
    age: 2.1,
    crew: 'Crew Gamma',
    gate: 'T3-B5',
    flights: [
      { id: 'FZ525', departure: { time: '23:45', airport: 'COK' }, arrival: { time: '02:30+1', airport: 'DXB' }, duration: 3.75, passengers: 175, status: 'boarding', delay: 0, route: 'COK-DXB', priority: 'high' }
    ]
  },
  {
    id: 'AC005',
    tailNumber: 'A6-FEB',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'CMB',
    status: 'active',
    utilization: 94,
    nextMaintenance: '2025-01-12',
    age: 9.3,
    crew: 'Crew Delta',
    gate: 'T1-3',
    flights: [
      { id: 'FZ413', departure: { time: '06:00', airport: 'CMB' }, arrival: { time: '09:30', airport: 'DXB' }, duration: 4.5, passengers: 181, status: 'departed', delay: 15, route: 'CMB-DXB', priority: 'high' }
    ]
  },
  {
    id: 'AC006',
    tailNumber: 'A6-FEC',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'BCN',
    status: 'active',
    utilization: 85,
    nextMaintenance: '2025-01-18',
    age: 1.7,
    crew: 'Crew Echo',
    gate: 'T1-B23',
    flights: [
      { id: 'FZ047', departure: { time: '13:25', airport: 'BCN' }, arrival: { time: '20:15', airport: 'DXB' }, duration: 6.83, passengers: 189, status: 'cancelled', delay: 0, route: 'BCN-DXB', priority: 'low' }
    ]
  },
  {
    id: 'AC007',
    tailNumber: 'A6-FED',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'DXB',
    status: 'active',
    utilization: 91,
    nextMaintenance: '2025-01-22',
    age: 7.2,
    crew: 'Crew Foxtrot',
    gate: 'T2-A15',
    flights: [
      { id: 'FZ125', departure: { time: '02:45', airport: 'DXB' }, arrival: { time: '06:30', airport: 'TBZ' }, duration: 2.75, passengers: 165, status: 'departed', delay: 0, route: 'DXB-TBZ', priority: 'high' },
      { id: 'FZ126', departure: { time: '12:15', airport: 'TBZ' }, arrival: { time: '15:45', airport: 'DXB' }, duration: 2.5, passengers: 179, status: 'on-time', delay: 0, route: 'TBZ-DXB', priority: 'high' }
    ]
  },
  {
    id: 'AC008',
    tailNumber: 'A6-FEE',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'PRG',
    status: 'active',
    utilization: 89,
    nextMaintenance: '2025-01-28',
    age: 2.1,
    crew: 'Crew Golf',
    gate: 'T2-15',
    flights: [
      { id: 'FZ384', departure: { time: '01:25', airport: 'PRG' }, arrival: { time: '07:45', airport: 'DXB' }, duration: 5.33, passengers: 182, status: 'departed', delay: 0, route: 'PRG-DXB', priority: 'medium' },
      { id: 'FZ123', departure: { time: '14:30', airport: 'DXB' }, arrival: { time: '18:45', airport: 'KHI' }, duration: 2.25, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-KHI', priority: 'medium' },
      { id: 'FZ124', departure: { time: '21:15', airport: 'KHI' }, arrival: { time: '23:45', airport: 'DXB' }, duration: 2.5, passengers: 175, status: 'on-time', delay: 0, route: 'KHI-DXB', priority: 'medium' }
    ]
  },
  {
    id: 'AC009',
    tailNumber: 'A6-FEF',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'SLL',
    status: 'active',
    utilization: 82,
    nextMaintenance: '2025-02-05',
    age: 8.6,
    crew: 'Crew Hotel',
    gate: 'T1-5',
    flights: [
      { id: 'FZ149', departure: { time: '09:40', airport: 'SLL' }, arrival: { time: '12:25', airport: 'DXB' }, duration: 1.75, passengers: 165, status: 'on-time', delay: 0, route: 'SLL-DXB', priority: 'medium' },
      { id: 'FZ412', departure: { time: '22:50', airport: 'DXB' }, arrival: { time: '07:15+1', airport: 'BEG' }, duration: 5.42, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-BEG', priority: 'high' }
    ]
  },
  {
    id: 'AC010',
    tailNumber: 'A6-FEG',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'BEG',
    status: 'active',
    utilization: 76,
    nextMaintenance: '2025-01-30',
    age: 1.8,
    crew: 'Crew India',
    gate: 'T2-A5',
    flights: [
      { id: 'FZ235', departure: { time: '16:20', airport: 'BEG' }, arrival: { time: '21:45', airport: 'DXB' }, duration: 4.42, passengers: 175, status: 'on-time', delay: 0, route: 'BEG-DXB', priority: 'high' }
    ]
  },
  {
    id: 'AC011',
    tailNumber: 'A6-FEH',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'SKP',
    status: 'active',
    utilization: 88,
    nextMaintenance: '2025-01-16',
    age: 10.4,
    crew: 'Crew Juliet',
    gate: 'T1-B2',
    flights: [
      { id: 'FZ073', departure: { time: '11:30', airport: 'SKP' }, arrival: { time: '16:15', airport: 'DXB' }, duration: 3.75, passengers: 182, status: 'on-time', delay: 0, route: 'SKP-DXB', priority: 'high' }
    ]
  },
  {
    id: 'AC012',
    tailNumber: 'A6-FEI',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'AUH',
    status: 'active',
    utilization: 71,
    nextMaintenance: '2025-02-10',
    age: 0.9,
    crew: 'Crew Kilo',
    gate: 'T3-12',
    flights: [
      { id: 'FZ927', departure: { time: '06:15', airport: 'AUH' }, arrival: { time: '07:30', airport: 'DXB' }, duration: 1.25, passengers: 155, status: 'on-time', delay: 0, route: 'AUH-DXB', priority: 'medium' },
      { id: 'FZ565', departure: { time: '15:45', airport: 'DXB' }, arrival: { time: '19:20', airport: 'BOM' }, duration: 4.58, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-BOM', priority: 'medium' },
      { id: 'FZ566', departure: { time: '21:10', airport: 'BOM' }, arrival: { time: '23:35', airport: 'DXB' }, duration: 3.42, passengers: 175, status: 'on-time', delay: 0, route: 'BOM-DXB', priority: 'medium' }
    ]
  },
  {
    id: 'AC013',
    tailNumber: 'A6-FEJ',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'IST',
    status: 'active',
    utilization: 79,
    nextMaintenance: '2025-01-19',
    age: 11.7,
    crew: 'Crew Lima',
    gate: 'ISG-15',
    flights: [
      { id: 'FZ185', departure: { time: '14:50', airport: 'IST' }, arrival: { time: '20:25', airport: 'DXB' }, duration: 4.58, passengers: 179, status: 'on-time', delay: 0, route: 'IST-DXB', priority: 'medium' }
    ]
  },
  {
    id: 'AC014',
    tailNumber: 'A6-FEK',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'TBS',
    status: 'active',
    utilization: 93,
    nextMaintenance: '2025-01-14',
    age: 2.9,
    crew: 'Crew Mike',
    gate: 'T2-5',
    flights: [
      { id: 'FZ343', departure: { time: '04:20', airport: 'TBS' }, arrival: { time: '07:25', airport: 'DXB' }, duration: 3.08, passengers: 182, status: 'departed', delay: 0, route: 'TBS-DXB', priority: 'medium' },
      { id: 'FZ505', departure: { time: '10:15', airport: 'DXB' }, arrival: { time: '12:45', airport: 'DOH' }, duration: 1.5, passengers: 165, status: 'on-time', delay: 0, route: 'DXB-DOH', priority: 'medium' },
      { id: 'FZ506', departure: { time: '16:30', airport: 'DOH' }, arrival: { time: '19:15', airport: 'DXB' }, duration: 1.75, passengers: 175, status: 'delayed', delay: 25, route: 'DOH-DXB', priority: 'medium' }
    ]
  },
  {
    id: 'AC015',
    tailNumber: 'A6-FEL',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'KWI',
    status: 'active',
    utilization: 84,
    nextMaintenance: '2025-02-02',
    age: 9.1,
    crew: 'Crew November',
    gate: 'T4-12',
    flights: [
      { id: 'FZ085', departure: { time: '13:40', airport: 'KWI' }, arrival: { time: '16:55', airport: 'DXB' }, duration: 2.25, passengers: 172, status: 'on-time', delay: 0, route: 'KWI-DXB', priority: 'medium' }
    ]
  },
  {
    id: 'AC016',
    tailNumber: 'A6-FEM',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'DAM',
    status: 'active',
    utilization: 77,
    nextMaintenance: '2025-02-08',
    age: 1.4,
    crew: 'Crew Oscar',
    gate: 'T2-8',
    flights: [
      { id: 'FZ261', departure: { time: '07:30', airport: 'DAM' }, arrival: { time: '11:15', airport: 'DXB' }, duration: 2.75, passengers: 165, status: 'on-time', delay: 0, route: 'DAM-DXB', priority: 'high' }
    ]
  },
  {
    id: 'AC017',
    tailNumber: 'A6-FEN',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'BGW',
    status: 'active',
    utilization: 90,
    nextMaintenance: '2025-01-21',
    age: 7.8,
    crew: 'Crew Papa',
    gate: 'T1-12',
    flights: [
      { id: 'FZ053', departure: { time: '15:25', airport: 'BGW' }, arrival: { time: '17:50', airport: 'DXB' }, duration: 1.42, passengers: 175, status: 'on-time', delay: 0, route: 'BGW-DXB', priority: 'high' }
    ]
  },
  {
    id: 'AC018',
    tailNumber: 'A6-FEO',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'EBL',
    status: 'active',
    utilization: 86,
    nextMaintenance: '2025-01-27',
    age: 2.2,
    crew: 'Crew Quebec',
    gate: 'T1-8',
    flights: [
      { id: 'FZ385', departure: { time: '00:30', airport: 'EBL' }, arrival: { time: '02:45', airport: 'DXB' }, duration: 2.25, passengers: 155, status: 'departed', delay: 0, route: 'EBL-DXB', priority: 'medium' },
      { id: 'FZ627', departure: { time: '08:20', airport: 'DXB' }, arrival: { time: '13:15', airport: 'DEL' }, duration: 3.92, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-DEL', priority: 'medium' },
      { id: 'FZ628', departure: { time: '15:45', airport: 'DEL' }, arrival: { time: '18:30', airport: 'DXB' }, duration: 3.75, passengers: 175, status: 'on-time', delay: 0, route: 'DEL-DXB', priority: 'medium' }
    ]
  },
  {
    id: 'AC019',
    tailNumber: 'A6-FEP',
    type: 'B737-800',
    capacity: 189,
    currentLocation: 'ALA',
    status: 'active',
    utilization: 81,
    nextMaintenance: '2025-01-24',
    age: 12.1,
    crew: 'Crew Romeo',
    gate: 'T2-3',
    flights: [
      { id: 'FZ323', departure: { time: '03:15', airport: 'ALA' }, arrival: { time: '06:50', airport: 'DXB' }, duration: 4.58, passengers: 165, status: 'departed', delay: 0, route: 'ALA-DXB', priority: 'high' },
      { id: 'FZ771', departure: { time: '22:35', airport: 'DXB' }, arrival: { time: '04:20+1', airport: 'ALA' }, duration: 4.75, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-ALA', priority: 'high' }
    ]
  },
  {
    id: 'AC020',
    tailNumber: 'A6-FEQ',
    type: 'B737 MAX 8',
    capacity: 195,
    currentLocation: 'CCJ',
    status: 'active',
    utilization: 88,
    nextMaintenance: '2025-02-01',
    age: 1.6,
    crew: 'Crew Sierra',
    gate: 'T1-15',
    flights: [
      { id: 'FZ507', departure: { time: '05:40', airport: 'CCJ' }, arrival: { time: '07:55', airport: 'DXB' }, duration: 2.25, passengers: 175, status: 'departed', delay: 0, route: 'CCJ-DXB', priority: 'medium' },
      { id: 'FZ131', departure: { time: '16:20', airport: 'DXB' }, arrival: { time: '21:35', airport: 'BOM' }, duration: 4.25, passengers: 189, status: 'on-time', delay: 0, route: 'DXB-BOM', priority: 'medium' },
      { id: 'FZ132', departure: { time: '23:15', airport: 'BOM' }, arrival: { time: '02:25+1', airport: 'DXB' }, duration: 4.17, passengers: 165, status: 'on-time', delay: 0, route: 'BOM-DXB', priority: 'medium' }
    ]
  }
]

export function FlightTrackingGantt() {
  const { airlineConfig } = useAirlineTheme();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [timeRange, setTimeRange] = useState('24h') // 24h, 48h, 7d
  const [viewMode, setViewMode] = useState('timeline') // timeline, schedule
  const [zoomLevel, setZoomLevel] = useState(1) // 0.5x to 3x
  const [selectedTailNumbers, setSelectedTailNumbers] = useState([])
  const [showInactive, setShowInactive] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    aircraftType: 'all',
    status: 'all',
    route: 'all',
    search: '',
    flightStatus: 'all',
    delayThreshold: [0],
    crew: 'all',
    departureAirport: 'all',
    arrivalAirport: 'all',
    capacityRange: [150, 200],
    ageRange: [0, 15],
    priority: 'all',
    utilizationRange: [0, 100],
    gate: ''
  })
  const [currentTime, setCurrentTime] = useState(() => {
    const istTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})
    return new Date(istTime)
  })
  const [autoRefresh, setAutoRefresh] = useState(true)

  const ganttRef = useRef(null)
  const timelineRef = useRef(null)

  // Auto-refresh current time - flydubai themed
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Generate time slots for the timeline based on selected time range
  const generateTimeSlots = () => {
    const slots = []

    if (timeRange === '24h') {
      // 24h: 24 slots, each representing 1 hour
      for (let i = 0; i < 24; i++) {
        slots.push({
          hour: i,
          day: 0,
          time: `${i.toString().padStart(2, '0')}:00`,
          label: `${i.toString().padStart(2, '0')}:00 IST`,
          isCurrentHour: i === currentTime.getHours(),
          startHour: i,
          duration: 1
        })
      }
    } else if (timeRange === '48h') {
      // 48h: 24 slots, each representing 2 hours
      for (let i = 0; i < 24; i++) {
        const hour = (i * 2) % 24
        const day = Math.floor((i * 2) / 24)
        slots.push({
          hour,
          day,
          time: `${hour.toString().padStart(2, '0')}:00`,
          label: day === 0 ? `${hour.toString().padStart(2, '0')}:00 IST` : `${hour.toString().padStart(2, '0')}:00+${day}d IST`,
          isCurrentHour: hour === currentTime.getHours() && day === 0,
          startHour: i * 2,
          duration: 2
        })
      }
    } else if (timeRange === '7d') {
      // 7d: 28 slots, each representing 6 hours (7 days * 24 hours / 6 hours per slot = 28 slots)
      for (let i = 0; i < 28; i++) {
        const hourOfWeek = i * 6
        const day = Math.floor(hourOfWeek / 24)
        const hour = hourOfWeek % 24

        slots.push({
          hour,
          day,
          time: `${hour.toString().padStart(2, '0')}:00`,
          label: `D${day + 1} ${hour.toString().padStart(2, '0')}:00 IST`,
          isCurrentHour: day === 0 && Math.floor(currentTime.getHours() / 6) === Math.floor(hour / 6),
          startHour: hourOfWeek,
          duration: 6
        })
      }
    }

    return slots
  }

  const timeSlots = generateTimeSlots()

  // Enhanced filter function
  const filteredAircraft = aircraftFleet.filter(aircraft => {
    // Basic filters
    if (!showInactive && aircraft.status !== 'active') return false
    if (filters.aircraftType !== 'all' && aircraft.type !== filters.aircraftType) return false
    if (filters.status !== 'all' && aircraft.status !== filters.status) return false
    if (filters.search && !aircraft.tailNumber.toLowerCase().includes(filters.search.toLowerCase()) && 
        !aircraft.type.toLowerCase().includes(filters.search.toLowerCase())) return false

    // Route filter
    if (filters.route !== 'all') {
      const hasRoute = aircraft.flights.some(flight => 
        flight.route.includes(filters.route.toUpperCase())
      )
      if (!hasRoute) return false
    }

    // Advanced filters
    if (filters.crew !== 'all' && aircraft.crew !== filters.crew) return false
    if (filters.gate && !aircraft.gate.toLowerCase().includes(filters.gate.toLowerCase())) return false

    // Capacity range filter
    if (aircraft.capacity < filters.capacityRange[0] || aircraft.capacity > filters.capacityRange[1]) return false

    // Age range filter
    if (aircraft.age < filters.ageRange[0] || aircraft.age > filters.ageRange[1]) return false

    // Utilization range filter
    if (aircraft.utilization < filters.utilizationRange[0] || aircraft.utilization > filters.utilizationRange[1]) return false

    // Flight-specific filters
    if (filters.flightStatus !== 'all') {
      const hasMatchingFlight = aircraft.flights.some(flight => flight.status === filters.flightStatus)
      if (!hasMatchingFlight && aircraft.flights.length > 0) return false
    }

    if (filters.delayThreshold[0] > 0) {
      const hasDelayedFlight = aircraft.flights.some(flight => flight.delay >= filters.delayThreshold[0])
      if (!hasDelayedFlight && aircraft.flights.length > 0) return false
    }

    if (filters.departureAirport !== 'all') {
      const hasDepartureAirport = aircraft.flights.some(flight => 
        flight.departure.airport === filters.departureAirport
      )
      if (!hasDepartureAirport && aircraft.flights.length > 0) return false
    }

    if (filters.arrivalAirport !== 'all') {
      const hasArrivalAirport = aircraft.flights.some(flight => 
        flight.arrival.airport === filters.arrivalAirport
      )
      if (!hasArrivalAirport && aircraft.flights.length > 0) return false
    }

    if (filters.priority !== 'all') {
      const hasPriorityFlight = aircraft.flights.some(flight => flight.priority === filters.priority)
      if (!hasPriorityFlight && aircraft.flights.length > 0) return false
    }

    return true
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time': return 'bg-green-500'
      case 'delayed': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      case 'boarding': return 'bg-blue-500'
      case 'departed': return 'bg-purple-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on-time': return <CheckCircle className="h-3 w-3" />
      case 'delayed': return <Clock className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      case 'boarding': return <Users className="h-3 w-3" />
      case 'departed': return <Plane className="h-3 w-3" />
      default: return <AlertTriangle className="h-3 w-3" />
    }
  }

  const getAircraftStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'maintenance': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const calculateFlightPosition = (departureTime, duration) => {
    // Convert time to position percentage based on the time range
    const [hours, minutes] = departureTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes

    let startPos, width, totalTimeInHours

    if (timeRange === '24h') {
      // 24h: Position based on 24-hour timeline
      totalTimeInHours = 24
      startPos = (totalMinutes / (totalTimeInHours * 60)) * 100
      width = (duration / totalTimeInHours) * 100
    } else if (timeRange === '48h') {
      // 48h: Position based on 48-hour timeline
      totalTimeInHours = 48
      startPos = (totalMinutes / (totalTimeInHours * 60)) * 100
      width = (duration / totalTimeInHours) * 100
    } else if (timeRange === '7d') {
      // 7d: Position based on 7-day timeline (168 hours)
      totalTimeInHours = 168
      startPos = (totalMinutes / (totalTimeInHours * 60)) * 100
      width = (duration / totalTimeInHours) * 100
    }

    return { left: `${startPos}%`, width: `${Math.max(width, 1)}%` }
  }

  const handleTailNumberSelection = (tailNumber) => {
    setSelectedTailNumbers(prev => 
      prev.includes(tailNumber) 
        ? prev.filter(tn => tn !== tailNumber)
        : [...prev, tailNumber]
    )
  }

  const resetFilters = () => {
    setFilters({
      aircraftType: 'all',
      status: 'all',
      route: 'all',
      search: '',
      flightStatus: 'all',
      delayThreshold: [0],
      crew: 'all',
      departureAirport: 'all',
      arrivalAirport: 'all',
      capacityRange: [150, 200],
      ageRange: [0, 15],
      priority: 'all',
      utilizationRange: [0, 100],
      gate: ''
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.aircraftType !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.route !== 'all') count++
    if (filters.search) count++
    if (filters.flightStatus !== 'all') count++
    if (filters.delayThreshold[0] > 0) count++
    if (filters.crew !== 'all') count++
    if (filters.departureAirport !== 'all') count++
    if (filters.arrivalAirport !== 'all') count++
    if (filters.capacityRange[0] !== 150 || filters.capacityRange[1] !== 200) count++
    if (filters.ageRange[0] !== 0 || filters.ageRange[1] !== 15) count++
    if (filters.priority !== 'all') count++
    if (filters.utilizationRange[0] !== 0 || filters.utilizationRange[1] !== 100) count++
    if (filters.gate) count++
    return count
  }

  return (
    <div className="space-y-6 h-full overflow-hidden">
      {/* Header - flydubai themed */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">{airlineConfig.displayName} Flight Tracking Gantt</h2>
          <p className="text-muted-foreground">Aircraft schedules by tail number with real-time flight tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={autoRefresh ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}>
            <div className={`w-2 h-2 rounded-full mr-2 ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {autoRefresh ? 'Live Updates' : 'Manual'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Flydubai Fleet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Aircraft</p>
                <p className="text-xl font-semibold">{filteredAircraft.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-semibold">{filteredAircraft.filter(a => a.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-xl font-semibold">{filteredAircraft.filter(a => a.status === 'maintenance').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
                <p className="text-xl font-semibold">
                  {Math.round(filteredAircraft.reduce((sum, a) => sum + a.utilization, 0) / filteredAircraft.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Delayed Flights</p>
                <p className="text-xl font-semibold">
                  {filteredAircraft.reduce((sum, a) => sum + a.flights.filter(f => f.status === 'delayed').length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart - flydubai styled */}
      <Card className="overflow-hidden flex-1 gantt-container">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              {airlineConfig.displayName} Aircraft Schedule by Tail Number
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>On Time</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Delayed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Cancelled</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Boarding</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Departed</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-[500px]">
            {/* Tail Numbers List - flydubai A6-FE* format */}
            <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-green-50 flex-shrink-0 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-3 border-b bg-white flex-shrink-0">
                <h4 className="font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {airlineConfig.displayName} Fleet (A6-FE*)
                </h4>
                <p className="text-sm text-muted-foreground">{filteredAircraft.length} aircraft</p>
              </div>

              {/* Tail Numbers List - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-1 p-1">
                  {filteredAircraft.map((aircraft) => (
                    <div
                      key={aircraft.id}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        selectedTailNumbers.includes(aircraft.tailNumber) 
                          ? 'bg-green-100 border-green-200' 
                          : 'bg-white hover:bg-green-50'
                      } border`}
                      onClick={() => handleTailNumberSelection(aircraft.tailNumber)}
                    >
                      {/* Primary Tail Number Display */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-green-600" />
                          <div className="font-bold text-sm text-green-700">{aircraft.tailNumber}</div>
                        </div>
                        <Badge className={`text-xs px-1 py-0 ${getAircraftStatusColor(aircraft.status)}`}>
                          {aircraft.status}
                        </Badge>
                      </div>

                      {/* Aircraft Details - Compact */}
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Plane className="h-2.5 w-2.5" />
                          <span className="font-medium truncate">{aircraft.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>{aircraft.currentLocation}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" />
                            <span>{aircraft.capacity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Flight Count - Compact */}
                      <div className="mt-1 pt-1 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Flights:</span>
                          <span className="font-semibold text-green-600">{aircraft.flights.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col" ref={ganttRef}>
              <div className="flex-1 overflow-x-auto overflow-y-auto gantt-timeline">
                <div 
                  className="relative h-full" 
                  ref={timelineRef}
                  style={{ 
                    minWidth: `${Math.max(timeSlots.length * 48, 800)}px`,
                    width: 'max-content',
                    minHeight: '400px'
                  }}
                >
                  {/* Time Header */}
                  <div className="flex border-b bg-white sticky top-0 z-10 shadow-sm flex-shrink-0">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 w-12 p-2 text-center text-xs border-r ${
                          slot.isCurrentHour ? 'bg-green-50 text-green-700' : ''
                        }`}
                      >
                        <div className="font-medium whitespace-nowrap">{slot.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Flight Timeline Rows - One per Tail Number */}
                  <div className="space-y-1 p-2 relative min-h-0">
                    {filteredAircraft.map((aircraft) => (
                      <div
                        key={aircraft.id}
                        className={`relative h-16 bg-white rounded border flex-shrink-0 ${
                          selectedTailNumbers.includes(aircraft.tailNumber) ? 'ring-2 ring-green-300' : ''
                        }`}
                        style={{ minWidth: `${Math.max(timeSlots.length * 48, 800)}px` }}
                      >
                        {/* Flight Blocks for this Tail Number */}
                        {aircraft.flights.map((flight, flightIndex) => {
                          const position = calculateFlightPosition(flight.departure.time, flight.duration)
                          return (
                            <div
                              key={flightIndex}
                              className={`absolute top-1 h-14 rounded-md border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-105 ${getStatusColor(flight.status)}`}
                              style={position}
                              title={`${flight.id} - ${aircraft.tailNumber} - ${flight.route} - ${flight.status}`}
                            >
                              <div className="p-1 text-white text-xs overflow-hidden h-full flex flex-col justify-between">
                                <div>
                                  <div className="font-bold flex items-center gap-1 mb-1">
                                    {getStatusIcon(flight.status)}
                                    <span className="truncate font-mono">{flight.id}</span>
                                  </div>
                                  <div className="opacity-90 truncate text-xs">
                                    <span className="font-mono">{aircraft.tailNumber}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="opacity-90 truncate text-xs">
                                    {flight.departure.time} - {flight.arrival.time}
                                  </div>
                                  <div className="opacity-75 truncate text-xs">
                                    {flight.route}
                                  </div>
                                  {flight.delay > 0 && (
                                    <div className="text-yellow-200 truncate text-xs">
                                      +{flight.delay}min
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Empty state for aircraft with no flights */}
                        {aircraft.flights.length === 0 && (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            <div className="text-center">
                              <Hash className="h-4 w-4 mx-auto mb-1 opacity-50" />
                              <div className="font-medium text-xs">{aircraft.tailNumber}</div>
                              <div className="text-xs">
                                {aircraft.status === 'maintenance' ? 'In Maintenance' : 'No Flights'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Current Time Line */}
                    {timeRange === '24h' && (
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-30 pointer-events-none"
                        style={{ 
                          left: `${((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60)) * (timeSlots.length * 48)}px`
                        }}
                      >
                        <div className="absolute -top-6 -left-1 w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="absolute -top-6 -left-8 text-xs text-green-600 font-medium whitespace-nowrap">
                          Now
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Status - flydubai themed */}
      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              Last updated: {currentTime.toLocaleTimeString()} • 
              Tracking {filteredAircraft.filter(a => a.status === 'active').length} active {airlineConfig.displayName} aircraft •
              {getActiveFiltersCount() > 0 && ` ${getActiveFiltersCount()} filters applied`}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentTime(new Date())}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}