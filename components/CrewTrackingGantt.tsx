'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { 
  Calendar,
  Clock,
  User,
  Users,
  Plane,
  Edit,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  MapPin,
  Timer,
  ArrowRight,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Package,
  Shield,
  Settings,
  FileText,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Coffee,
  Moon,
  Sun,
  Navigation,
  Fuel,
  Wrench
} from 'lucide-react'

export function CrewTrackingGantt({ recoveryOption, flight, onClose }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [editMode, setEditMode] = useState(false)
  const [selectedCrewMember, setSelectedCrewMember] = useState(null)
  const [modifiedPlan, setModifiedPlan] = useState({})
  const [impactAnalysis, setImpactAnalysis] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [viewMode, setViewMode] = useState('crew')
  const [timeScale, setTimeScale] = useState('hour')
  const [showUtilization, setShowUtilization] = useState(true)

  // Generate comprehensive crew tracking data based on recovery option
  const generateCrewTrackingData = () => {
    const currentDate = new Date()
    
    const flightNumber = flight?.flightNumber || 'FZ123'
    const origin = flight?.origin || 'DXB'
    const destination = flight?.destination || 'BOM'
    const aircraft = flight?.aircraft || 'B737-800'
    
    const baseData = {
      'AIRCRAFT_SWAP_A320_001': {
        crews: [
          {
            id: 'CREW_001',
            name: 'Alpha Crew',
            captain: {
              id: 'CAP_001',
              name: 'Captain Ahmed Al-Mahmoud',
              license: 'ATPL-UAE-2018-4521',
              typeRating: ['B737-800', 'A320'],
              totalHours: 12450,
              dutyTime: 3.2,
              maxDutyTime: 13.0,
              restRequired: 12,
              status: 'On Duty',
              location: 'DXB Terminal 2',
              phone: '+971 50 123 4567'
            },
            firstOfficer: {
              id: 'FO_001', 
              name: 'F/O Priya Singh',
              license: 'CPL-UAE-2020-7834',
              typeRating: ['B737-800', 'A320'],
              totalHours: 4200,
              dutyTime: 3.2,
              maxDutyTime: 13.0,
              restRequired: 12,
              status: 'On Duty',
              location: 'DXB Terminal 2',
              phone: '+971 50 234 5678'
            },
            cabinCrew: [
              {
                id: 'CC_001',
                name: 'Sarah Al-Zahra',
                position: 'Senior Flight Attendant',
                languages: ['English', 'Arabic', 'Hindi'],
                dutyTime: 3.2,
                maxDutyTime: 13.0,
                status: 'On Duty',
                specializations: ['Medical', 'VIP Service']
              },
              {
                id: 'CC_002',
                name: 'Ahmed Rashid',
                position: 'Flight Attendant',
                languages: ['English', 'Arabic', 'Urdu'],
                dutyTime: 3.2,
                maxDutyTime: 13.0,
                status: 'On Duty',
                specializations: ['Child Care', 'Disabled Assistance']
              }
            ],
            assignments: [
              {
                id: 'ASSIGN_001',
                type: 'flight',
                flightNumber: flightNumber,
                aircraft: 'A6-FMC (A320)',
                route: `${origin} → ${destination}`,
                scheduledDeparture: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000),
                scheduledArrival: new Date(currentTime.getTime() + 5.5 * 60 * 60 * 1000),
                actualDeparture: null,
                actualArrival: null,
                status: 'Scheduled',
                passengers: flight?.passengers || 167,
                delay: 30,
                gate: 'A15',
                reasons: ['Aircraft Swap - Technical Issue Resolution']
              },
              {
                id: 'ASSIGN_002',
                type: 'positioning',
                description: 'Aircraft Positioning A6-FMC',
                location: 'DXB Terminal 1 → Terminal 2',
                scheduledStart: new Date(currentTime.getTime() + 30 * 60 * 1000),
                scheduledEnd: new Date(currentTime.getTime() + 65 * 60 * 1000),
                status: 'In Progress',
                responsibility: 'Ground Crew + Flight Crew Supervision'
              }
            ],
            utilization: 87.5,
            efficiency: 92.3,
            reliability: 94.8
          }
        ],
        aircraft: [
          {
            id: 'AIRCRAFT_001',
            registration: 'A6-FDU',
            type: 'B737-800',
            status: 'Technical Issue',
            location: 'DXB Gate A15',
            issue: 'Hydraulic System Warning',
            estimatedResolution: new Date(currentTime.getTime() + 6 * 60 * 60 * 1000),
            maintenanceCrew: 'Team Alpha (4 engineers)',
            assignments: [
              {
                id: 'AC_ASSIGN_001',
                flightNumber: flightNumber,
                status: 'Cancelled',
                reason: 'Technical Issue - Hydraulic System',
                scheduledDeparture: new Date(currentTime.getTime() + 45 * 60 * 1000),
                impact: 'High - 167 passengers affected'
              }
            ]
          }
        ],
        disruption: {
          id: 'DISR_001',
          type: 'Aircraft Technical Issue',
          severity: 'High',
          affectedFlights: [flightNumber, 'FZ124', 'FZ567'],
          affectedPassengers: 487,
          estimatedCost: 'AED 67,000',
          recoveryStatus: 'In Progress',
          timeline: {
            reported: new Date(currentTime.getTime() - 90 * 60 * 1000),
            diagnosed: new Date(currentTime.getTime() - 60 * 60 * 1000),
            recoveryStarted: new Date(currentTime.getTime() - 30 * 60 * 1000),
            estimatedResolution: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000)
          }
        }
      }
    }

    return baseData[recoveryOption?.id] || baseData['AIRCRAFT_SWAP_A320_001']
  }

  const crewData = generateCrewTrackingData()

  // Calculate time slots for Gantt display
  const generateTimeSlots = () => {
    const slots = []
    const start = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000)
    const end = new Date(currentTime.getTime() + 22 * 60 * 60 * 1000)
    
    const interval = timeScale === 'hour' ? 60 : timeScale === '30min' ? 30 : 15
    
    for (let time = new Date(start); time <= end; time.setMinutes(time.getMinutes() + interval)) {
      slots.push(new Date(time))
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Helper function to get position on timeline
  const getTimelinePosition = (time) => {
    const start = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000)
    const end = new Date(currentTime.getTime() + 22 * 60 * 60 * 1000)
    const total = end.getTime() - start.getTime()
    const position = (time.getTime() - start.getTime()) / total
    return Math.max(0, Math.min(100, position * 100))
  }

  // Helper function to get duration width
  const getDurationWidth = (startTime, endTime) => {
    const start = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000)
    const end = new Date(currentTime.getTime() + 22 * 60 * 60 * 1000)
    const total = end.getTime() - start.getTime()
    const duration = endTime.getTime() - startTime.getTime()
    return Math.max(0.5, (duration / total) * 100)
  }

  // Get assignment color based on type and status
  const getAssignmentColor = (assignment) => {
    if (assignment.type === 'flight') {
      switch (assignment.status) {
        case 'Scheduled': return 'bg-flydubai-blue'
        case 'In Progress': return 'bg-flydubai-orange'
        case 'Delayed': return 'bg-yellow-500'
        case 'Cancelled': return 'bg-red-500'
        case 'Reassigned': return 'bg-purple-500'
        default: return 'bg-gray-500'
      }
    }
    
    switch (assignment.type) {
      case 'briefing': return 'bg-blue-400'
      case 'positioning': return 'bg-green-500' 
      case 'standby': return 'bg-gray-400'
      case 'rest': return 'bg-red-400'
      case 'transport': return 'bg-orange-400'
      default: return 'bg-gray-500'
    }
  }

  // Handle crew member editing
  const handleCrewEdit = (crewId, field, value) => {
    const newPlan = { ...modifiedPlan }
    if (!newPlan.crewChanges) newPlan.crewChanges = {}
    if (!newPlan.crewChanges[crewId]) newPlan.crewChanges[crewId] = {}
    
    newPlan.crewChanges[crewId][field] = value
    setModifiedPlan(newPlan)

    // Calculate impact
    const impact = calculateImpact(newPlan)
    setImpactAnalysis(impact)
  }

  // Calculate impact of changes
  const calculateImpact = (changes) => {
    const baselineCost = parseInt(recoveryOption?.cost?.replace(/[^\d]/g, '') || '50000')
    const baselineTime = 80

    let newCost = baselineCost
    let newTime = baselineTime
    let risks = []
    let benefits = []

    if (changes.crewChanges && Object.keys(changes.crewChanges).length > 0) {
      newCost += 8500
      newTime += 15
      risks.push('Extended crew briefing required')
      risks.push('Potential delay if standby crew unavailable')
    }

    if (changes.aircraftChanges) {
      newCost += 15000
      newTime += 25
      risks.push('Aircraft availability conflict possible')
      benefits.push('More reliable aircraft assignment')
    }

    if (changes.scheduleChanges) {
      newCost += 5000
      newTime += 10
      benefits.push('Better integration with overall schedule')
    }

    return {
      originalCost: `AED ${baselineCost.toLocaleString()}`,
      newCost: `AED ${newCost.toLocaleString()}`,
      costDifference: newCost - baselineCost,
      originalTime: `${Math.floor(baselineTime / 60)}h ${baselineTime % 60}m`,
      newTime: `${Math.floor(newTime / 60)}h ${newTime % 60}m`,
      timeDifference: newTime - baselineTime,
      risks,
      benefits,
      confidence: Math.max(70, 95 - (risks.length * 5)),
      recommendation: risks.length <= 2 ? 'Recommended' : 'Requires Review'
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getDutyTimeProgress = (current, max) => {
    const currentNum = typeof current === 'string' ? parseFloat(current) : current
    const maxNum = typeof max === 'string' ? parseFloat(max) : max
    return (currentNum / maxNum) * 100
  }

  const getDutyTimeColor = (current, max) => {
    const progress = getDutyTimeProgress(current, max)
    if (progress > 100) return 'bg-red-500'
    if (progress > 90) return 'bg-orange-500'
    if (progress > 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-flydubai-navy">Crew Tracking & What-If Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Recovery Option: {recoveryOption?.title} • Flight: {flight?.flightNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crew">Crew View</SelectItem>
              <SelectItem value="aircraft">Aircraft View</SelectItem>
              <SelectItem value="flights">Flights View</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeScale} onValueChange={setTimeScale}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">1h</SelectItem>
              <SelectItem value="30min">30m</SelectItem>
              <SelectItem value="15min">15m</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className={editMode ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Edit className="h-4 w-4 mr-2" />
            {editMode ? 'View Mode' : 'Edit Mode'}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Disruption Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-flydubai-orange" />
            Disruption Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="font-medium">{crewData.disruption.type}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Affected Flights</span>
              <span className="font-medium">{crewData.disruption.affectedFlights.length} flights</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Passengers</span>
              <span className="font-medium">{crewData.disruption.affectedPassengers}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Est. Cost</span>
              <span className="font-medium">{crewData.disruption.estimatedCost}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Gantt Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-flydubai-blue" />
              {viewMode === 'crew' ? 'Crew' : viewMode === 'aircraft' ? 'Aircraft' : 'Flight'} Timeline
            </CardTitle>
            
            {/* Timeline Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                {formatTime(new Date(currentTime.getTime() - 2 * 60 * 60 * 1000))} - {formatTime(new Date(currentTime.getTime() + 22 * 60 * 60 * 1000))}
              </span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Time Header */}
            <div className="relative">
              <div className="flex">
                <div className="w-64 flex-shrink-0"></div>
                <div className="flex-1 relative">
                  <div className="flex border-b border-gray-200">
                    {timeSlots.filter((_, index) => index % (timeScale === 'hour' ? 1 : timeScale === '30min' ? 2 : 4) === 0).map((slot, index) => (
                      <div key={index} className="flex-1 text-center py-2 text-xs border-r border-gray-100 last:border-r-0">
                        <div className="font-medium">{formatTime(slot)}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Current time indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                    style={{ left: `${getTimelinePosition(currentTime)}%` }}
                  >
                    <div className="absolute -top-1 -left-2 w-4 h-2 bg-red-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Rows */}
            {viewMode === 'crew' && crewData.crews.map((crew, crewIndex) => (
              <div key={crew.id} className="space-y-1">
                {/* Crew Header */}
                <div className="flex">
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{crew.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {crew.captain.name.split(' ').slice(-1)[0]} / {crew.firstOfficer.name.split(' ').slice(-1)[0]}
                        </p>
                      </div>
                      {editMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCrewMember(crew)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 relative h-12 bg-gray-50 border border-gray-200 rounded">
                    {/* Assignments */}
                    {crew.assignments.map((assignment, assignIndex) => {
                      const startPos = getTimelinePosition(assignment.scheduledDeparture || assignment.scheduledStart)
                      const width = getDurationWidth(
                        assignment.scheduledDeparture || assignment.scheduledStart,
                        assignment.scheduledArrival || assignment.scheduledEnd
                      )
                      
                      return (
                        <div
                          key={assignIndex}
                          className={`absolute top-1 bottom-1 rounded text-white text-xs flex items-center justify-center font-medium shadow-sm ${getAssignmentColor(assignment)}`}
                          style={{
                            left: `${startPos}%`,
                            width: `${width}%`,
                            minWidth: '40px'
                          }}
                          title={`${assignment.type}: ${assignment.description || assignment.flightNumber} (${formatTime(assignment.scheduledDeparture || assignment.scheduledStart)} - ${formatTime(assignment.scheduledArrival || assignment.scheduledEnd)})`}
                        >
                          <span className="truncate px-1">
                            {assignment.flightNumber || assignment.type.toUpperCase()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Duty Time Progress */}
                <div className="flex">
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex justify-between text-xs">
                      <span>Duty: {crew.captain.dutyTime}h</span>
                      <span>Max: {crew.captain.maxDutyTime}h</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getDutyTimeColor(crew.captain.dutyTime, crew.captain.maxDutyTime)}`}
                        style={{ width: `${getDutyTimeProgress(crew.captain.dutyTime, crew.captain.maxDutyTime)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Crew Members Details */}
                <div className="ml-4 pl-4 border-l border-gray-200 space-y-2">
                  {/* Captain */}
                  <div className="flex">
                    <div className="w-60 flex-shrink-0 pr-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="text-xs">{crew.captain.name}</span>
                        <Badge variant="outline" className="text-xs">CPT</Badge>
                      </div>
                    </div>
                    <div className="flex-1 relative h-6 bg-blue-50 border border-blue-200 rounded">
                      {crew.assignments.filter(a => a.type === 'flight').map((assignment, index) => {
                        const startPos = getTimelinePosition(assignment.scheduledDeparture)
                        const width = getDurationWidth(assignment.scheduledDeparture, assignment.scheduledArrival)
                        
                        return (
                          <div
                            key={index}
                            className="absolute top-0.5 bottom-0.5 bg-blue-600 text-white text-xs flex items-center justify-center rounded"
                            style={{
                              left: `${startPos}%`,
                              width: `${width}%`,
                              minWidth: '30px'
                            }}
                          >
                            <Plane className="h-3 w-3" />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* First Officer */}
                  <div className="flex">
                    <div className="w-60 flex-shrink-0 pr-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-green-600" />
                        <span className="text-xs">{crew.firstOfficer.name}</span>
                        <Badge variant="outline" className="text-xs">F/O</Badge>
                      </div>
                    </div>
                    <div className="flex-1 relative h-6 bg-green-50 border border-green-200 rounded">
                      {crew.assignments.filter(a => a.type === 'flight').map((assignment, index) => {
                        const startPos = getTimelinePosition(assignment.scheduledDeparture)
                        const width = getDurationWidth(assignment.scheduledDeparture, assignment.scheduledArrival)
                        
                        return (
                          <div
                            key={index}
                            className="absolute top-0.5 bottom-0.5 bg-green-600 text-white text-xs flex items-center justify-center rounded"
                            style={{
                              left: `${startPos}%`,
                              width: `${width}%`,
                              minWidth: '30px'
                            }}
                          >
                            <Plane className="h-3 w-3" />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Cabin Crew */}
                  {crew.cabinCrew.map((cc, ccIndex) => (
                    <div key={cc.id} className="flex">
                      <div className="w-60 flex-shrink-0 pr-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-purple-600" />
                          <span className="text-xs">{cc.name}</span>
                          <Badge variant="outline" className="text-xs">FA</Badge>
                        </div>
                      </div>
                      <div className="flex-1 relative h-6 bg-purple-50 border border-purple-200 rounded">
                        {crew.assignments.filter(a => a.type === 'flight').map((assignment, index) => {
                          const startPos = getTimelinePosition(assignment.scheduledDeparture)
                          const width = getDurationWidth(assignment.scheduledDeparture, assignment.scheduledArrival)
                          
                          return (
                            <div
                              key={index}
                              className="absolute top-0.5 bottom-0.5 bg-purple-600 text-white text-xs flex items-center justify-center rounded"
                              style={{
                                left: `${startPos}%`,
                                width: `${width}%`,
                                minWidth: '30px'
                              }}
                            >
                              <Users className="h-3 w-3" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Aircraft View */}
            {viewMode === 'aircraft' && crewData.aircraft.map((aircraft, index) => (
              <div key={aircraft.id} className="space-y-2">
                <div className="flex">
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{aircraft.registration}</h4>
                        <p className="text-xs text-muted-foreground">{aircraft.type}</p>
                        <Badge className={`text-xs ${
                          aircraft.status.includes('Available') ? 'bg-green-100 text-green-800' :
                          aircraft.status.includes('Technical') ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {aircraft.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative h-12 bg-gray-50 border border-gray-200 rounded">
                    {aircraft.assignments.map((assignment, assignIndex) => {
                      const startPos = getTimelinePosition(assignment.scheduledDeparture)
                      const width = 8
                      
                      return (
                        <div
                          key={assignIndex}
                          className={`absolute top-1 bottom-1 rounded text-white text-xs flex items-center justify-center font-medium shadow-sm ${
                            assignment.status === 'Scheduled' ? 'bg-flydubai-blue' :
                            assignment.status === 'Cancelled' ? 'bg-red-500' :
                            assignment.status === 'Reassigned' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}
                          style={{
                            left: `${startPos}%`,
                            width: `${width}%`,
                            minWidth: '60px'
                          }}
                          title={`${assignment.flightNumber} - ${assignment.status}`}
                        >
                          <span className="truncate px-1">
                            {assignment.flightNumber}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Analysis Panel */}
      {impactAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-flydubai-blue" />
              Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Cost Impact</Label>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Original: {impactAnalysis.originalCost}</span>
                    <span className={`text-sm font-medium ${impactAnalysis.costDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {impactAnalysis.costDifference > 0 ? '+' : ''}AED {impactAnalysis.costDifference.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">New: {impactAnalysis.newCost}</div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Timeline Impact</Label>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Original: {impactAnalysis.originalTime}</span>
                    <span className={`text-sm font-medium ${impactAnalysis.timeDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {impactAnalysis.timeDifference > 0 ? '+' : ''}{impactAnalysis.timeDifference} min
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">New: {impactAnalysis.newTime}</div>
                </div>
              </div>

              {impactAnalysis.risks.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-red-600">Risks</Label>
                  <ul className="text-xs space-y-1 mt-1">
                    {impactAnalysis.risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5"></div>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {impactAnalysis.benefits.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-green-600">Benefits</Label>
                  <ul className="text-xs space-y-1 mt-1">
                    {impactAnalysis.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crew Details Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Crew Assignment - {selectedCrewMember?.name}</DialogTitle>
            <DialogDescription>
              Modify crew assignments and see real-time impact on the recovery plan
            </DialogDescription>
          </DialogHeader>
          
          {selectedCrewMember && (
            <div className="space-y-4">
              <Tabs defaultValue="crew" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="crew">Crew Details</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="crew" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Captain</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Name</Label>
                          <Input defaultValue={selectedCrewMember.captain.name} />
                        </div>
                        <div>
                          <Label>License</Label>
                          <Input defaultValue={selectedCrewMember.captain.license} />
                        </div>
                        <div>
                          <Label>Total Hours</Label>
                          <Input defaultValue={selectedCrewMember.captain.totalHours} />
                        </div>
                        <div>
                          <Label>Duty Time</Label>
                          <Input defaultValue={`${selectedCrewMember.captain.dutyTime}h`} />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input defaultValue={selectedCrewMember.captain.location} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">First Officer</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Name</Label>
                          <Input defaultValue={selectedCrewMember.firstOfficer.name} />
                        </div>
                        <div>
                          <Label>License</Label>
                          <Input defaultValue={selectedCrewMember.firstOfficer.license} />
                        </div>
                        <div>
                          <Label>Total Hours</Label>
                          <Input defaultValue={selectedCrewMember.firstOfficer.totalHours} />
                        </div>
                        <div>
                          <Label>Duty Time</Label>
                          <Input defaultValue={`${selectedCrewMember.firstOfficer.dutyTime}h`} />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input defaultValue={selectedCrewMember.firstOfficer.location} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Cabin Crew</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedCrewMember.cabinCrew.map((cc, index) => (
                          <div key={cc.id} className="space-y-2 p-3 border rounded">
                            <div>
                              <Label>Name</Label>
                              <Input defaultValue={cc.name} />
                            </div>
                            <div>
                              <Label>Position</Label>
                              <Select defaultValue={cc.position}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Senior Flight Attendant">Senior Flight Attendant</SelectItem>
                                  <SelectItem value="Flight Attendant">Flight Attendant</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Languages</Label>
                              <Input defaultValue={cc.languages.join(', ')} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCrewMember.assignments.map((assignment, index) => (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                <Badge>{assignment.type}</Badge>
                              </TableCell>
                              <TableCell>
                                {assignment.flightNumber || assignment.description}
                              </TableCell>
                              <TableCell>
                                {formatTime(assignment.scheduledDeparture || assignment.scheduledStart)} - {formatTime(assignment.scheduledArrival || assignment.scheduledEnd)}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  assignment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                  assignment.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                                  assignment.status === 'Required' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {assignment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="qualifications" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Captain Qualifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Type Ratings</Label>
                          <div className="flex gap-2 mt-1">
                            {selectedCrewMember.captain.typeRating.map(rating => (
                              <Badge key={rating} className="bg-green-100 text-green-800">{rating}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Medical Certificate</Label>
                          <Badge className="bg-green-100 text-green-800">Valid</Badge>
                        </div>
                        <div>
                          <Label>License Expiry</Label>
                          <span className="text-sm">Mar 2025</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">First Officer Qualifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Type Ratings</Label>
                          <div className="flex gap-2 mt-1">
                            {selectedCrewMember.firstOfficer.typeRating.map(rating => (
                              <Badge key={rating} className="bg-green-100 text-green-800">{rating}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label>Medical Certificate</Label>
                          <Badge className="bg-green-100 text-green-800">Valid</Badge>
                        </div>
                        <div>
                          <Label>License Expiry</Label>
                          <span className="text-sm">Jul 2024</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Utilization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-flydubai-blue">{selectedCrewMember.utilization}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-flydubai-blue h-2 rounded-full"
                            style={{ width: `${selectedCrewMember.utilization}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Efficiency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-flydubai-orange">{selectedCrewMember.efficiency}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-flydubai-orange h-2 rounded-full"
                            style={{ width: `${selectedCrewMember.efficiency}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Reliability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-flydubai-navy">{selectedCrewMember.reliability}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-flydubai-navy h-2 rounded-full"
                            style={{ width: `${selectedCrewMember.reliability}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleCrewEdit(selectedCrewMember.id, 'modified', true)
                    setShowEditDialog(false)
                  }}
                  className="btn-flydubai-primary"
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}