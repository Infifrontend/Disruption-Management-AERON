'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Plane, 
  DollarSign, 
  AlertTriangle, 
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  MapPin,
  Target,
  Filter,
  Search,
  RefreshCw,
  Download,
  Send,
  FileText,
  Award,
  Timer,
  UserCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Info,
  ChevronRight,
  Star,
  Shield,
  Phone,
  Mail,
  Clock3
} from 'lucide-react'
import { databaseService } from '../services/databaseService'

export function PendingSolutions() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [filters, setFilters] = useState({
    priority: 'all',
    submitter: 'all',
    dateRange: 'all',
    flightNumber: '',
    planId: ''
  })
  const [sortBy, setSortBy] = useState('submitted')
  const [sortOrder, setSortOrder] = useState('desc')

  // Mock data for pending recovery plans with enhanced details
  const pendingPlans = [
    {
      id: 'RP-2025-001',
      title: 'Aircraft Swap & Route Optimization Recovery Plan',
      flightNumber: 'EK123',
      route: 'JFK → DXB',
      aircraft: 'A321-001',
      submittedAt: '2025-06-06 14:25:00',
      submittedBy: 'ops.manager@airline.com',
      submitterName: 'Sarah Mitchell',
      priority: 'High',
      status: 'Pending Approval',
      estimatedCost: 45200,
      estimatedDelay: 87,
      affectedPassengers: 158,
      confidence: 94.2,
      disruptionReason: 'Technical Issue - Engine warning light',
      steps: 6,
      timeline: '2h 15m',
      approvalRequired: 'Operations Manager',
      slaDeadline: '2025-06-06 16:00:00',
      timeRemaining: '1h 35m',
      tags: ['Aircraft Substitution', 'High Cost', 'Passenger Impact'],
      metrics: {
        successProbability: 94.2,
        customerSatisfaction: 78,
        onTimePerformance: 85,
        costEfficiency: 92
      },
      // Enhanced flight details
      flightDetails: {
        aircraftType: 'Airbus A321-200',
        scheduledDeparture: '2025-06-06 14:30',
        scheduledArrival: '2025-06-07 05:15',
        gate: 'B12',
        terminal: '4',
        cargo: '12.5 tons',
        disruptionSeverity: 'High'
      },
      // Cost breakdown
      costBreakdown: {
        aircraftSwap: 28000,
        passengerCompensation: 8500,
        crewCosts: 4200,
        groundHandling: 2800,
        fuelCosts: 1700
      },
      // Recovery steps
      recoverySteps: [
        {
          id: 1,
          action: 'Ground current aircraft (A321-001) at Gate B12',
          duration: '15 mins',
          status: 'pending',
          responsible: 'Ground Crew Team A',
          location: 'Gate B12',
          criticalPath: true,
          estimatedCost: 2800,
          description: 'Safely ground and secure the affected aircraft, coordinate with passengers for disembarkation'
        },
        {
          id: 2,
          action: 'Prepare substitute aircraft (A321-007)',
          duration: '45 mins',
          status: 'pending',
          responsible: 'Maintenance Team',
          location: 'Maintenance Bay 3',
          criticalPath: true,
          estimatedCost: 28000,
          description: 'Complete pre-flight checks, fuel, and prepare substitute aircraft for passenger transfer'
        },
        {
          id: 3,
          action: 'Transfer passengers and cargo',
          duration: '30 mins',
          status: 'pending',
          responsible: 'Ground Services',
          location: 'Gate B15',
          criticalPath: true,
          estimatedCost: 4200,
          description: 'Coordinate passenger transfer, baggage handling, and cargo relocation to new aircraft'
        },
        {
          id: 4,
          action: 'Crew briefing and aircraft familiarization',
          duration: '20 mins',
          status: 'pending',
          responsible: 'Flight Crew',
          location: 'Crew Briefing Room',
          criticalPath: false,
          estimatedCost: 1500,
          description: 'Brief crew on aircraft differences, route changes, and emergency procedures'
        }
      ],
      // Assigned crew
      assignedCrew: [
        {
          id: 'CREW-001',
          name: 'Captain Sarah Johnson',
          role: 'Captain',
          certification: 'A321/A320',
          dutyTime: '4h 30m',
          restTime: '10h 45m',
          status: 'Available',
          phone: '+1-555-0123',
          email: 'sarah.johnson@airline.com',
          location: 'JFK Crew Lounge',
          experience: '15,000 hours'
        },
        {
          id: 'CREW-002',
          name: 'First Officer Mike Chen',
          role: 'First Officer',
          certification: 'A321/A320',
          dutyTime: '3h 15m',
          restTime: '11h 30m',
          status: 'Available',
          phone: '+1-555-0124',
          email: 'mike.chen@airline.com',
          location: 'JFK Crew Lounge',
          experience: '8,500 hours'
        },
        {
          id: 'CREW-003',
          name: 'Senior FA Lisa Martinez',
          role: 'Senior Flight Attendant',
          certification: 'Cabin Crew',
          dutyTime: '2h 45m',
          restTime: '12h 15m',
          status: 'Available',
          phone: '+1-555-0125',
          email: 'lisa.martinez@airline.com',
          location: 'JFK Terminal 4',
          experience: '12 years'
        },
        {
          id: 'CREW-004',
          name: 'FA James Wilson',
          role: 'Flight Attendant',
          certification: 'Cabin Crew',
          dutyTime: '5h 20m',
          restTime: '8h 40m',
          status: 'Near Limit',
          phone: '+1-555-0126',
          email: 'james.wilson@airline.com',
          location: 'JFK Terminal 4',
          experience: '6 years'
        }
      ]
    },
    {
      id: 'RP-2025-002',
      title: 'Weather Delay Crew Optimization Plan',
      flightNumber: 'EK456',
      route: 'LHR → DXB',
      aircraft: 'A330-012',
      submittedAt: '2025-06-06 13:45:30',
      submittedBy: 'crew.scheduler@airline.com',
      submitterName: 'Michael Chen',
      priority: 'Medium',
      status: 'Under Review',
      estimatedCost: 28900,
      estimatedDelay: 145,
      affectedPassengers: 295,
      confidence: 87.5,
      disruptionReason: 'Weather - Thunderstorms at LHR',
      steps: 4,
      timeline: '3h 45m',
      approvalRequired: 'Crew Manager',
      slaDeadline: '2025-06-06 15:30:00',
      timeRemaining: '2h 5m',
      tags: ['Weather', 'Crew Change', 'Extended Delay'],
      metrics: {
        successProbability: 87.5,
        customerSatisfaction: 65,
        onTimePerformance: 72,
        costEfficiency: 88
      },
      flightDetails: {
        aircraftType: 'Airbus A330-300',
        scheduledDeparture: '2025-06-06 11:30',
        scheduledArrival: '2025-06-06 20:45',
        gate: 'A15',
        terminal: '2',
        cargo: '18.2 tons',
        disruptionSeverity: 'Medium'
      },
      costBreakdown: {
        crewChanges: 15000,
        passengerCompensation: 9800,
        hotelAccommodation: 3200,
        mealVouchers: 900
      },
      recoverySteps: [
        {
          id: 1,
          action: 'Replace crew due to duty time limits',
          duration: '60 mins',
          status: 'pending',
          responsible: 'Crew Scheduling',
          location: 'LHR Crew Center',
          criticalPath: true,
          estimatedCost: 15000
        },
        {
          id: 2,
          action: 'Arrange passenger accommodation',
          duration: '45 mins',
          status: 'pending',
          responsible: 'Passenger Services',
          location: 'LHR Terminal 2',
          criticalPath: false,
          estimatedCost: 13900
        }
      ],
      assignedCrew: [
        {
          id: 'CREW-005',
          name: 'Captain David Thompson',
          role: 'Captain',
          certification: 'A330/A340',
          dutyTime: '2h 15m',
          restTime: '14h 30m',
          status: 'Available',
          phone: '+44-20-7946-0958',
          email: 'david.thompson@airline.com',
          location: 'LHR Crew Lounge',
          experience: '18,000 hours'
        }
      ]
    },
    {
      id: 'RP-2025-003',
      title: 'Maintenance Hold Passenger Rebooking',
      flightNumber: 'EK789',
      route: 'DXB → SYD',
      aircraft: 'A380-001',
      submittedAt: '2025-06-06 12:30:15',
      submittedBy: 'maintenance.ops@airline.com',
      submitterName: 'Lisa Rodriguez',
      priority: 'Critical',
      status: 'Pending Approval',
      estimatedCost: 67800,
      estimatedDelay: 240,
      affectedPassengers: 425,
      confidence: 91.8,
      disruptionReason: 'Maintenance - Hydraulic system check required',
      steps: 8,
      timeline: '5h 30m',
      approvalRequired: 'Senior Operations Manager',
      slaDeadline: '2025-06-06 14:00:00',
      timeRemaining: 'OVERDUE',
      tags: ['Maintenance', 'High Impact', 'Wide-body', 'Critical'],
      metrics: {
        successProbability: 91.8,
        customerSatisfaction: 58,
        onTimePerformance: 45,
        costEfficiency: 75
      },
      flightDetails: {
        aircraftType: 'Airbus A380-800',
        scheduledDeparture: '2025-06-06 08:15',
        scheduledArrival: '2025-06-06 22:30',
        gate: 'C1',
        terminal: '3',
        cargo: '28.7 tons',
        disruptionSeverity: 'Critical'
      },
      costBreakdown: {
        passengerRebooking: 42000,
        hotelAccommodation: 18500,
        mealCompensation: 4800,
        alternativeTransport: 2500
      },
      recoverySteps: [
        {
          id: 1,
          action: 'Ground A380 aircraft for hydraulic inspection',
          duration: '120 mins',
          status: 'pending',
          responsible: 'Maintenance Team Alpha',
          location: 'DXB Maintenance Hangar 2',
          criticalPath: true,
          estimatedCost: 35000
        },
        {
          id: 2,
          action: 'Initiate passenger rebooking process',
          duration: '180 mins',
          status: 'pending',
          responsible: 'Passenger Services',
          location: 'DXB Terminal 3',
          criticalPath: true,
          estimatedCost: 32800
        }
      ],
      assignedCrew: [
        {
          id: 'CREW-006',
          name: 'Captain Ahmed Al-Mansouri',
          role: 'Captain',
          certification: 'A380/A350',
          dutyTime: '1h 45m',
          restTime: '16h 20m',
          status: 'Available',
          phone: '+971-4-555-0190',
          email: 'ahmed.almansouri@airline.com',
          location: 'DXB Crew Rest',
          experience: '22,000 hours'
        }
      ]
    },
    {
      id: 'RP-2025-004',
      title: 'ATC Slot Optimization Recovery',
      flightNumber: 'EK101',
      route: 'FRA → DXB',
      aircraft: 'A350-001',
      submittedAt: '2025-06-06 11:15:45',
      submittedBy: 'slot.coordinator@airline.com',
      submitterName: 'David Park',
      priority: 'Low',
      status: 'Approved',
      estimatedCost: 12400,
      estimatedDelay: 65,
      affectedPassengers: 280,
      confidence: 96.1,
      disruptionReason: 'ATC - Flow control restrictions',
      steps: 3,
      timeline: '1h 30m',
      approvalRequired: 'Slot Coordinator',
      slaDeadline: '2025-06-06 13:00:00',
      timeRemaining: 'Completed',
      tags: ['ATC', 'Low Cost', 'Quick Resolution'],
      metrics: {
        successProbability: 96.1,
        customerSatisfaction: 85,
        onTimePerformance: 78,
        costEfficiency: 95
      },
      flightDetails: {
        aircraftType: 'Airbus A350-900',
        scheduledDeparture: '2025-06-06 09:45',
        scheduledArrival: '2025-06-06 17:30',
        gate: 'A8',
        terminal: '1',
        cargo: '15.3 tons',
        disruptionSeverity: 'Low'
      },
      costBreakdown: {
        slotRescheduling: 8000,
        passengerServices: 3200,
        fuelAdjustment: 1200
      },
      recoverySteps: [
        {
          id: 1,
          action: 'Request new ATC slot',
          duration: '30 mins',
          status: 'completed',
          responsible: 'Slot Coordination',
          location: 'FRA Operations',
          criticalPath: true,
          estimatedCost: 8000
        }
      ],
      assignedCrew: [
        {
          id: 'CREW-007',
          name: 'Captain Hans Mueller',
          role: 'Captain',
          certification: 'A350/A330',
          dutyTime: '3h 20m',
          restTime: '12h 40m',
          status: 'Available',
          phone: '+49-69-555-0234',
          email: 'hans.mueller@airline.com',
          location: 'FRA Operations',
          experience: '16,500 hours'
        }
      ]
    },
    {
      id: 'RP-2025-005',
      title: 'Ground Equipment Failure Response',
      flightNumber: 'EK234',
      route: 'SIN → DXB',
      aircraft: 'B777-001',
      submittedAt: '2025-06-06 10:45:20',
      submittedBy: 'ground.ops@airline.com',
      submitterName: 'Jennifer Williams',
      priority: 'Medium',
      status: 'Rejected',
      estimatedCost: 34500,
      estimatedDelay: 120,
      affectedPassengers: 320,
      confidence: 82.3,
      disruptionReason: 'Ground Equipment - Jetbridge malfunction',
      steps: 5,
      timeline: '2h 45m',
      approvalRequired: 'Ground Operations Manager',
      slaDeadline: '2025-06-06 12:30:00',
      timeRemaining: 'Completed',
      tags: ['Ground Equipment', 'Gate Change', 'Moderate Cost'],
      rejectionReason: 'Alternative lower-cost solution identified',
      metrics: {
        successProbability: 82.3,
        customerSatisfaction: 72,
        onTimePerformance: 68,
        costEfficiency: 81
      },
      flightDetails: {
        aircraftType: 'Boeing 777-300ER',
        scheduledDeparture: '2025-06-06 06:20',
        scheduledArrival: '2025-06-06 10:45',
        gate: 'B8',
        terminal: '2',
        cargo: '19.1 tons',
        disruptionSeverity: 'Medium'
      },
      costBreakdown: {
        gateChange: 18000,
        equipmentReplacement: 12000,
        passengerServices: 4500
      },
      recoverySteps: [
        {
          id: 1,
          action: 'Move aircraft to alternative gate',
          duration: '45 mins',
          status: 'rejected',
          responsible: 'Ground Operations',
          location: 'SIN Terminal 2',
          criticalPath: true,
          estimatedCost: 18000
        }
      ],
      assignedCrew: []
    }
  ]

  const filteredPlans = pendingPlans.filter(plan => {
    const matchesPriority = filters.priority === 'all' || plan.priority.toLowerCase() === filters.priority
    const matchesSubmitter = filters.submitter === 'all' || plan.submittedBy.includes(filters.submitter)
    const matchesFlightNumber = !filters.flightNumber || plan.flightNumber.toLowerCase().includes(filters.flightNumber.toLowerCase())
    const matchesPlanId = !filters.planId || plan.id.toLowerCase().includes(filters.planId.toLowerCase())

    const matchesTab = activeTab === 'all' || 
                     (activeTab === 'pending' && ['Pending Approval', 'Under Review'].includes(plan.status)) ||
                     (activeTab === 'approved' && plan.status === 'Approved') ||
                     (activeTab === 'rejected' && plan.status === 'Rejected') ||
                     (activeTab === 'critical' && plan.priority === 'Critical')

    return matchesPriority && matchesSubmitter && matchesFlightNumber && matchesPlanId && matchesTab
  })

  const sortedPlans = filteredPlans.sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case 'submitted':
        aValue = new Date(a.submittedAt)
        bValue = new Date(b.submittedAt)
        break
      case 'priority':
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
        aValue = priorityOrder[a.priority]
        bValue = priorityOrder[b.priority]
        break
      case 'cost':
        aValue = a.estimatedCost
        bValue = b.estimatedCost
        break
      case 'confidence':
        aValue = a.confidence
        bValue = b.confidence
        break
      default:
        aValue = a.submittedAt
        bValue = b.submittedAt
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Under Review': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200'
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200' // Added for Pending status
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTimeRemainingColor = (timeRemaining) => {
    if (timeRemaining === 'OVERDUE') return 'text-red-600 font-semibold'
    if (timeRemaining === 'Completed') return 'text-green-600'
    return 'text-orange-600'
  }

  const getCrewStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700'
      case 'Near Limit': return 'bg-yellow-100 text-yellow-700'
      case 'Unavailable': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTabCounts = () => {
    return {
      all: pendingPlans.length,
      pending: pendingPlans.filter(p => ['Pending Approval', 'Under Review'].includes(p.status)).length,
      approved: pendingPlans.filter(p => p.status === 'Approved').length,
      rejected: pendingPlans.filter(p => p.status === 'Rejected').length,
      critical: pendingPlans.filter(p => p.priority === 'Critical').length
    }
  }

  const tabCounts = getTabCounts()

  const handleApprove = async (planId) => {
    console.log('Approving plan:', planId)
    try {
      await databaseService.updateFlightDisruptionStatus(planId, 'Approved');
      // Optionally refresh data or update UI
    } catch (error) {
      console.error("Failed to approve plan:", error);
    }
  }

  const handleReject = async (planId) => {
    console.log('Rejecting plan:', planId)
    try {
      await databaseService.updateFlightDisruptionStatus(planId, 'Rejected');
      // Optionally refresh data or update UI
    } catch (error) {
      console.error("Failed to reject plan:", error);
    }
  }

  const handleExecute = async (plan) => {
    console.log('Executing plan:', plan.id)
    try {
      // Update status to Pending
      await databaseService.updateFlightDisruptionStatus(plan.id, 'Pending');
      // Add to pending solutions table with all info
      await databaseService.addPendingSolution({
        ...plan,
        status: 'Pending', // Ensure status is updated
        // Add other necessary fields from plan here
        flightDetails: plan.flightDetails,
        costBreakdown: plan.costBreakdown,
        recoverySteps: plan.recoverySteps,
        assignedCrew: plan.assignedCrew,
      });
      // Navigate to Pending Solutions menu (or trigger a state change to show it)
      // For simplicity, we'll just log and assume navigation is handled elsewhere or by a router
      console.log(`Plan ${plan.id} executed and status set to Pending.`);
      // You might want to trigger a refetch of the data or redirect the user.
      // For now, we'll simulate by selecting the plan to show details as if it were pending.
      setSelectedPlan({...plan, status: 'Pending'}); 
    } catch (error) {
      console.error("Failed to execute plan:", error);
    }
  }

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan)
  }

  // Function to format date in IST
  const formatIST = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pending Recovery Solutions</h2>
          <p className="text-muted-foreground">
            Recovery plans submitted for approval and management review
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600">Pending Approval</p>
                <p className="text-2xl font-semibold text-yellow-900">{tabCounts.pending}</p>
                <p className="text-xs text-yellow-600">Awaiting decision</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Critical Priority</p>
                <p className="text-2xl font-semibold text-red-900">{tabCounts.critical}</p>
                <p className="text-xs text-red-600">Immediate attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Approved Today</p>
                <p className="text-2xl font-semibold text-green-900">{tabCounts.approved}</p>
                <p className="text-xs text-green-600">Ready for execution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Avg Response Time</p>
                <p className="text-2xl font-semibold text-blue-900">23m</p>
                <p className="text-xs text-blue-600">Below SLA target</p>
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
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Flight Number</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="EK123"
                  value={filters.flightNumber}
                  onChange={(e) => setFilters({...filters, flightNumber: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Plan ID</Label>
              <Input
                placeholder="RP-2025-001"
                value={filters.planId}
                onChange={(e) => setFilters({...filters, planId: e.target.value})}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Submitter</Label>
              <Select value={filters.submitter} onValueChange={(value) => setFilters({...filters, submitter: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submitters</SelectItem>
                  <SelectItem value="ops.manager">Operations</SelectItem>
                  <SelectItem value="crew.scheduler">Crew</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="ground.ops">Ground Ops</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submission Time</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="cost">Estimated Cost</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-1 whitespace-nowrap">
            <span>All Plans</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">{tabCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1 whitespace-nowrap">
            <span>Pending</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">{tabCounts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="critical" className="flex items-center gap-1 whitespace-nowrap">
            <span>Critical</span>
            <Badge variant="destructive" className="ml-1 flex-shrink-0">{tabCounts.critical}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1 whitespace-nowrap">
            <span>Approved</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">{tabCounts.approved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-1 whitespace-nowrap">
            <span>Rejected</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">{tabCounts.rejected}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {sortedPlans.length > 0 ? (
              sortedPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold">{plan.title}</h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                          <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority} Priority
                          </Badge>
                          {plan.timeRemaining === 'OVERDUE' && (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              OVERDUE
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Flight & Route</Label>
                            <p className="font-medium">{plan.flightNumber} • {plan.route}</p>
                            <p className="text-sm text-muted-foreground">{plan.aircraft}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Submitted</Label>
                            <p className="font-medium">{formatIST(plan.submittedAt)}</p>
                            <p className="text-sm text-muted-foreground">by {plan.submitterName}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Impact</Label>
                            <p className="font-medium">${(plan.estimatedCost / 1000).toFixed(0)}K • {plan.estimatedDelay}m delay</p>
                            <p className="text-sm text-muted-foreground">{plan.affectedPassengers} passengers</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Confidence & Timeline</Label>
                            <p className="font-medium">{plan.confidence}% • {plan.timeline}</p>
                            <p className={`text-sm ${getTimeRemainingColor(plan.timeRemaining)}`}>
                              {plan.timeRemaining}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{plan.steps} steps</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Requires {plan.approvalRequired}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{plan.disruptionReason}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {plan.rejectionReason && (
                          <Alert className="border-red-200 bg-red-50 mb-4">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              <strong>Rejection Reason:</strong> {plan.rejectionReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(plan)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>

                        {['Pending Approval', 'Under Review'].includes(plan.status) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(plan.id)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(plan.id)}
                              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}

                        {plan.status === 'Approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleExecute(plan)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4" />
                            Execute
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Plans Found</h3>
                  <p className="text-muted-foreground">
                    No recovery plans match your current filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Plan Details Dialog - MUCH WIDER */}
      {selectedPlan && (
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recovery Plan Details - {selectedPlan.id}
              </DialogTitle>
              <DialogDescription>
                Comprehensive view of recovery plan for Flight {selectedPlan.flightNumber}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="flight">Flight Details</TabsTrigger>
                <TabsTrigger value="crew">Crew Assignment</TabsTrigger>
                <TabsTrigger value="steps">Recovery Steps</TabsTrigger>
                <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Plan Summary - Enhanced for wider layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Plan Summary</span>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(selectedPlan.status)}>
                            {selectedPlan.status}
                          </Badge>
                          <Badge className={getPriorityColor(selectedPlan.priority)}>
                            {selectedPlan.priority} Priority
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Plan ID:</span>
                          <span className="font-medium font-mono">{selectedPlan.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Title:</span>
                          <span className="font-medium">{selectedPlan.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Submitted:</span>
                          <span className="font-medium">{formatIST(selectedPlan.submittedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>By:</span>
                          <span className="font-medium">{selectedPlan.submitterName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Approval Required:</span>
                          <span className="font-medium">{selectedPlan.approvalRequired}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Impact Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Estimated Cost:</span>
                          <span className="font-medium">${selectedPlan.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Delay:</span>
                          <span className="font-medium">{selectedPlan.estimatedDelay} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Affected Passengers:</span>
                          <span className="font-medium">{selectedPlan.affectedPassengers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timeline:</span>
                          <span className="font-medium">{selectedPlan.timeline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-medium">{selectedPlan.confidence}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Success Rate</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedPlan.metrics.successProbability} className="w-20" />
                            <span className="text-sm font-medium">{selectedPlan.metrics.successProbability}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Customer Satisfaction</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedPlan.metrics.customerSatisfaction} className="w-20" />
                            <span className="text-sm font-medium">{selectedPlan.metrics.customerSatisfaction}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">On-Time Performance</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedPlan.metrics.onTimePerformance} className="w-20" />
                            <span className="text-sm font-medium">{selectedPlan.metrics.onTimePerformance}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Cost Efficiency</span>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedPlan.metrics.costEfficiency} className="w-20" />
                            <span className="text-sm font-medium">{selectedPlan.metrics.costEfficiency}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Disruption Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Disruption Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{selectedPlan.disruptionReason}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flight" className="space-y-6">
                {/* Flight Information - Enhanced for wider layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Flight Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Flight Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Flight Number:</span>
                              <span className="font-medium font-mono">{selectedPlan.flightNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Route:</span>
                              <span className="font-medium">{selectedPlan.route}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Aircraft:</span>
                              <span className="font-medium">{selectedPlan.aircraft}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Aircraft Type:</span>
                              <span className="font-medium">{selectedPlan.flightDetails?.aircraftType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gate:</span>
                              <span className="font-medium">Terminal {selectedPlan.flightDetails?.terminal || 'N/A'}, Gate {selectedPlan.flightDetails?.gate || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Schedule & Capacity</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Scheduled Departure:</span>
                              <span className="font-medium">{selectedPlan.flightDetails?.scheduledDeparture || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Scheduled Arrival:</span>
                              <span className="font-medium">{selectedPlan.flightDetails?.scheduledArrival || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Passengers:</span>
                              <span className="font-medium">{selectedPlan.affectedPassengers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cargo:</span>
                              <span className="font-medium">{selectedPlan.flightDetails?.cargo || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Disruption Severity:</span>
                              <Badge className={
                                selectedPlan.flightDetails?.disruptionSeverity === 'Critical' ? 'bg-red-100 text-red-700' :
                                selectedPlan.flightDetails?.disruptionSeverity === 'High' ? 'bg-orange-100 text-orange-700' :
                                selectedPlan.flightDetails?.disruptionSeverity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }>
                                {selectedPlan.flightDetails?.disruptionSeverity || 'Unknown'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional flight details card for wider layout */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Operational Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Disruption Analysis</h4>
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-800">Primary Issue</span>
                            </div>
                            <p className="text-sm text-red-700">{selectedPlan.disruptionReason}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Timeline Constraints</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>SLA Deadline:</span>
                              <span className="font-medium">{formatIST(selectedPlan.slaDeadline)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time Remaining:</span>
                              <span className={`font-medium ${getTimeRemainingColor(selectedPlan.timeRemaining)}`}>
                                {selectedPlan.timeRemaining}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Recovery Duration:</span>
                              <span className="font-medium">{selectedPlan.timeline}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="crew" className="space-y-6">
                {/* Assigned Crew - Enhanced for wider layout */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Assigned Crew Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPlan.assignedCrew && selectedPlan.assignedCrew.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {selectedPlan.assignedCrew.map((member) => (
                          <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <div className="grid grid-cols-1 gap-1 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock3 className="h-3 w-3" />
                                  Duty: {member.dutyTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  Rest: {member.restTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {member.location}
                                </span>
                                <span>Experience: {member.experience}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <Badge className={getCrewStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Phone className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No crew assignments available for this plan</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="steps" className="space-y-6">
                {/* Recovery Steps - Enhanced for wider layout */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Recovery Steps Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPlan.recoverySteps && selectedPlan.recoverySteps.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPlan.recoverySteps.map((step, index) => (
                          <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                step.criticalPath 
                                  ? 'bg-red-100 text-red-700 border-2 border-red-200' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                  <h4 className="font-medium">{step.action}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{step.description || ''}</p>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {step.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {step.responsible}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {step.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      ${(step.estimatedCost || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {step.criticalPath && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      Critical Path
                                    </Badge>
                                  )}
                                  <Badge className={
                                    step.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                    step.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }>
                                    {step.status === 'pending' ? 'Pending' : step.status || 'Unknown'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recovery steps available for this plan</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="costs" className="space-y-6">
                {/* Cost Breakdown - Enhanced for wider layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Cost Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPlan.costBreakdown && Object.keys(selectedPlan.costBreakdown).length > 0 ? (
                        <div>
                          <div className="grid grid-cols-1 gap-4 mb-6">
                            {Object.entries(selectedPlan.costBreakdown).map(([category, cost]) => (
                              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium capitalize">
                                  {category.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="text-right">
                                  <span className="font-semibold">${(cost || 0).toLocaleString()}</span>
                                  <p className="text-xs text-muted-foreground">
                                    {(((cost || 0) / (selectedPlan.estimatedCost || 1)) * 100).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Estimated Cost:</span>
                            <span className="text-lg font-semibold">${selectedPlan.estimatedCost.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No cost breakdown available for this plan</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cost Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Analysis & Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3">Cost per Passenger</h4>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span>Per Affected Passenger:</span>
                              <span className="font-semibold">
                                ${Math.round(selectedPlan.estimatedCost / selectedPlan.affectedPassengers)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Cost vs Industry Benchmarks</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Industry Average:</span>
                              <span className="text-muted-foreground">$287/passenger</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>This Plan:</span>
                              <span className={
                                Math.round(selectedPlan.estimatedCost / selectedPlan.affectedPassengers) < 287 
                                  ? 'text-green-600 font-medium' 
                                  : 'text-red-600 font-medium'
                              }>
                                ${Math.round(selectedPlan.estimatedCost / selectedPlan.affectedPassengers)}/passenger
                              </span>
                            </div>
                            <Progress 
                              value={(Math.round(selectedPlan.estimatedCost / selectedPlan.affectedPassengers) / 287) * 100} 
                              className="mt-2" 
                            />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">ROI Analysis</h4>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Avoided Cancellation Cost:</span>
                                <span>${(selectedPlan.estimatedCost * 1.4).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Net Savings:</span>
                                <span className="text-green-600 font-medium">
                                  ${(selectedPlan.estimatedCost * 0.4).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                Close
              </Button>
              {['Pending Approval', 'Under Review'].includes(selectedPlan.status) && (
                <>
                  <Button
                    onClick={() => {
                      handleApprove(selectedPlan.id)
                      setSelectedPlan(null)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedPlan.id)
                      setSelectedPlan(null)
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
              {selectedPlan.status === 'Approved' && (
                <Button
                  onClick={() => handleExecute(selectedPlan)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Execute
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}