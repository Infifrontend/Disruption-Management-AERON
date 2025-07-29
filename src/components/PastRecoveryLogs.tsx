'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Progress } from './ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Separator } from './ui/separator'
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  BarChart3,
  PieChart,
  Clock,
  DollarSign,
  Users,
  Plane,
  History,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileText,
  Settings,
  CreditCard,
  Zap,
  Star,
  Shield,
  Wrench,
  UserX,
  Timer,
  Target,
  Gauge,
  Activity,
  TrendingLeft,
  Wind,
  Navigation,
  Fuel,
  Building,
  Route,
  Wifi,
  Lightbulb,
  MapPin,
  CloudRain,
  Bell,
  Info,
  PlayCircle,
  RotateCcw,
  Brain,
  Hotel,
  Phone,
  Mail,
  Package,
  Calculator,
  Network,
  GitBranch
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

// Enhanced recovery logs with additional metrics for cancellations avoided and delay reduction
const pastRecoveryLogs = [
  {
    id: 'SOL-2025-001',
    disruptionId: 'DIS-001',
    flightNumber: 'FZ215',
    route: 'DXB → BOM',
    origin: 'DXB',
    destination: 'BOM',
    aircraft: 'B737-800',
    registration: 'A6-FDB',
    disruptionType: 'ATC/weather delay',
    disruptionReason: 'Sandstorm at DXB',
    priority: 'High',
    dateCreated: '2025-01-10 13:45:00',
    dateExecuted: '2025-01-10 14:32:00',
    dateCompleted: '2025-01-10 16:47:00',
    duration: '3h 2m',
    status: 'Successful',
    affectedPassengers: 189,
    actualCost: 118000,
    estimatedCost: 125000,
    costVariance: -5.6,
    otpImpact: -1.8,
    solutionChosen: 'Option B - Delay with passenger services',
    totalOptions: 3,
    executedBy: 'sara.ahmed@flydubai.com',
    approvedBy: 'supervisor@flydubai.com',
    passengerSatisfaction: 8.2,
    rebookingSuccess: 94.5,
    categorization: 'ATC/weather delay',
    // New metrics
    cancellationAvoided: true,
    potentialDelayMinutes: 480, // 8 hours potential delay without intervention
    actualDelayMinutes: 125, // 2h 5m actual delay
    delayReductionMinutes: 355, // 480 - 125 = 355 minutes saved
    disruptionCategory: 'Weather',
    recoveryEfficiency: 92.3, // percentage of potential delay avoided
    networkImpact: 'Medium', // impact on network operations
    downstreamFlightsAffected: 3,
    details: {
      description: 'Weather delay managed with enhanced passenger services',
      passengerRebookings: 8,
      hotelVouchers: 0,
      mealVouchers: 189,
      compensation: 15000,
      connectionsMissed: 8,
      vipPassengers: 4
    },
    actionHistory: [
      {
        timestamp: '2025-01-10 13:45:00',
        action: 'Disruption Detected',
        user: 'system.aeron',
        description: 'Sandstorm alert triggered automatic disruption detection',
        status: 'completed',
        duration: '2 minutes'
      },
      {
        timestamp: '2025-01-10 13:47:00',
        action: 'Initial Assessment',
        user: 'ops.controller@flydubai.com',
        description: 'Weather impact assessed, estimated 2-hour delay',
        status: 'completed',
        duration: '8 minutes'
      },
      {
        timestamp: '2025-01-10 13:55:00',
        action: 'Recovery Options Generated',
        user: 'system.aeron',
        description: '3 recovery options generated using AERON AI',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 14:00:00',
        action: 'Option Selection',
        user: 'sara.ahmed@flydubai.com',
        description: 'Option B selected - 2-hour delay with enhanced passenger services',
        status: 'completed',
        duration: '12 minutes'
      },
      {
        timestamp: '2025-01-10 14:12:00',
        action: 'Supervisor Approval',
        user: 'supervisor@flydubai.com',
        description: 'Recovery plan approved, execution authorized',
        status: 'completed',
        duration: '8 minutes'
      },
      {
        timestamp: '2025-01-10 14:20:00',
        action: 'Passenger Notifications',
        user: 'system.passenger',
        description: 'SMS and email notifications sent to all 189 passengers',
        status: 'completed',
        duration: '3 minutes'
      },
      {
        timestamp: '2025-01-10 14:23:00',
        action: 'Meal Voucher Distribution',
        user: 'ground.services@flydubai.com',
        description: '189 meal vouchers distributed at gate',
        status: 'completed',
        duration: '25 minutes'
      },
      {
        timestamp: '2025-01-10 14:48:00',
        action: 'Connection Passenger Management',
        user: 'transfer.desk@flydubai.com',
        description: '8 connecting passengers rebooked on alternative flights',
        status: 'completed',
        duration: '32 minutes'
      },
      {
        timestamp: '2025-01-10 15:20:00',
        action: 'Aircraft Ready',
        user: 'maintenance@flydubai.com',
        description: 'B737-800 A6-FDB cleared for departure post-weather',
        status: 'completed',
        duration: '15 minutes'
      },
      {
        timestamp: '2025-01-10 16:35:00',
        action: 'Departure Completed',
        user: 'flight.ops@flydubai.com',
        description: 'FZ215 departed DXB at 16:35, 2h 5m delay total',
        status: 'completed',
        duration: '12 minutes'
      },
      {
        timestamp: '2025-01-10 16:47:00',
        action: 'Solution Closed',
        user: 'system.aeron',
        description: 'Recovery solution marked as successful, metrics updated',
        status: 'completed',
        duration: '2 minutes'
      }
    ],
    auditTrail: {
      systemDecisions: 4,
      humanInterventions: 7,
      approvalLevels: 2,
      costAuthorizations: 3,
      complianceChecks: 5,
      totalActions: 11
    }
  },
  {
    id: 'SOL-2025-002',
    disruptionId: 'DIS-002',
    flightNumber: 'FZ181',
    route: 'DXB → COK',
    origin: 'DXB',
    destination: 'COK',
    aircraft: 'B737-800',
    registration: 'A6-FDC',
    disruptionType: 'Crew issue',
    disruptionReason: 'Captain duty time breach',
    priority: 'Medium',
    dateCreated: '2025-01-10 12:30:00',
    dateExecuted: '2025-01-10 13:45:00',
    dateCompleted: '2025-01-10 15:20:00',
    duration: '2h 50m',
    status: 'Successful',
    affectedPassengers: 175,
    actualCost: 45000,
    estimatedCost: 52000,
    costVariance: -13.5,
    otpImpact: -0.5,
    solutionChosen: 'Option A - Standby crew activation',
    totalOptions: 3,
    executedBy: 'crew.manager@flydubai.com',
    approvedBy: 'ops.supervisor@flydubai.com',
    passengerSatisfaction: 8.8,
    rebookingSuccess: 98.5,
    categorization: 'Crew issue (e.g., sick report, duty time breach)',
    // New metrics
    cancellationAvoided: true,
    potentialDelayMinutes: 720, // 12 hours if cancelled and rescheduled next day
    actualDelayMinutes: 29,
    delayReductionMinutes: 691,
    disruptionCategory: 'Crew',
    recoveryEfficiency: 95.9,
    networkImpact: 'Low',
    downstreamFlightsAffected: 1,
    details: {
      description: 'Standby crew activated successfully with minimal delay',
      passengerRebookings: 3,
      hotelVouchers: 0,
      mealVouchers: 175,
      compensation: 8000,
      connectionsMissed: 3,
      vipPassengers: 1
    },
    actionHistory: [
      {
        timestamp: '2025-01-10 12:30:00',
        action: 'Duty Time Alert',
        user: 'system.crew',
        description: 'Captain Al-Rashid duty time breach detected - 13.5/13.0 hours',
        status: 'completed',
        duration: '1 minute'
      },
      {
        timestamp: '2025-01-10 12:31:00',
        action: 'Crew Assessment',
        user: 'crew.manager@flydubai.com',
        description: 'Reviewed duty time logs and standby crew availability',
        status: 'completed',
        duration: '15 minutes'
      },
      {
        timestamp: '2025-01-10 12:46:00',
        action: 'Standby Crew Contact',
        user: 'crew.manager@flydubai.com',
        description: 'Captain Al-Zaabi contacted and confirmed availability',
        status: 'completed',
        duration: '8 minutes'
      },
      {
        timestamp: '2025-01-10 12:54:00',
        action: 'Recovery Options Generated',
        user: 'system.aeron',
        description: '3 crew-specific recovery options generated',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 12:59:00',
        action: 'Standby Activation',
        user: 'crew.manager@flydubai.com',
        description: 'Captain Al-Zaabi activated from standby duty',
        status: 'completed',
        duration: '20 minutes'
      },
      {
        timestamp: '2025-01-10 13:19:00',
        action: 'Crew Briefing',
        user: 'training@flydubai.com',
        description: 'Extended briefing completed for new captain pairing',
        status: 'completed',
        duration: '25 minutes'
      },
      {
        timestamp: '2025-01-10 13:44:00',
        action: 'Passenger Notification',
        user: 'ground.services@flydubai.com',
        description: 'Passengers informed of 30-minute delay for crew change',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 13:49:00',
        action: 'Flight Departure',
        user: 'flight.ops@flydubai.com',
        description: 'FZ181 departed with new crew, 29-minute delay',
        status: 'completed',
        duration: '1 minute'
      },
      {
        timestamp: '2025-01-10 15:20:00',
        action: 'Solution Success',
        user: 'system.aeron',
        description: 'Crew recovery completed successfully, metrics recorded',
        status: 'completed',
        duration: '1 minute'
      }
    ],
    auditTrail: {
      systemDecisions: 3,
      humanInterventions: 6,
      approvalLevels: 1,
      costAuthorizations: 2,
      complianceChecks: 4,
      totalActions: 9
    }
  },
  {
    id: 'SOL-2025-003',
    disruptionId: 'DIS-003',
    flightNumber: 'FZ147',
    route: 'IST → DXB',
    origin: 'IST',
    destination: 'DXB',
    aircraft: 'B737 MAX 8',
    registration: 'A6-FME',
    disruptionType: 'Aircraft Technical',
    disruptionReason: 'Engine maintenance check required',
    priority: 'Medium',
    dateCreated: '2025-01-10 09:15:00',
    dateExecuted: '2025-01-10 10:30:00',
    dateCompleted: '2025-01-10 13:45:00',
    duration: '4h 30m',
    status: 'Successful',
    affectedPassengers: 189,
    actualCost: 95000,
    estimatedCost: 89000,
    costVariance: 6.7,
    otpImpact: -2.3,
    solutionChosen: 'Option C - Aircraft swap with schedule adjustment',
    totalOptions: 4,
    executedBy: 'maintenance@flydubai.com',
    approvedBy: 'director@flydubai.com',
    passengerSatisfaction: 7.8,
    rebookingSuccess: 89.2,
    categorization: 'Aircraft issue (e.g., AOG)',
    // New metrics
    cancellationAvoided: true,
    potentialDelayMinutes: 1440, // 24 hours AOG scenario
    actualDelayMinutes: 130, // 2h 10m actual delay
    delayReductionMinutes: 1310,
    disruptionCategory: 'AOG',
    recoveryEfficiency: 91.0,
    networkImpact: 'High',
    downstreamFlightsAffected: 5,
    details: {
      description: 'Aircraft technical issue resolved with replacement aircraft',
      passengerRebookings: 20,
      hotelVouchers: 0,
      mealVouchers: 189,
      compensation: 28000,
      connectionsMissed: 4,
      vipPassengers: 2
    },
    actionHistory: [
      {
        timestamp: '2025-01-10 09:15:00',
        action: 'Technical Alert',
        user: 'maintenance@flydubai.com',
        description: 'Engine parameter anomaly detected during pre-flight check',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 09:20:00',
        action: 'Engineering Assessment',
        user: 'chief.engineer@flydubai.com',
        description: 'Engine inspection required, aircraft grounded',
        status: 'completed',
        duration: '25 minutes'
      },
      {
        timestamp: '2025-01-10 09:45:00',
        action: 'Alternative Aircraft Search',
        user: 'fleet.manager@flydubai.com',
        description: 'B737 MAX 8 A6-FMF identified as replacement',
        status: 'completed',
        duration: '20 minutes'
      },
      {
        timestamp: '2025-01-10 10:05:00',
        action: 'Recovery Options Generated',
        user: 'system.aeron',
        description: '4 aircraft recovery options generated with cost analysis',
        status: 'completed',
        duration: '8 minutes'
      },
      {
        timestamp: '2025-01-10 10:13:00',
        action: 'Aircraft Swap Decision',
        user: 'ops.manager@flydubai.com',
        description: 'Option C selected - aircraft swap with 2-hour delay',
        status: 'completed',
        duration: '12 minutes'
      },
      {
        timestamp: '2025-01-10 10:25:00',
        action: 'Director Approval',
        user: 'director@flydubai.com',
        description: 'High-cost recovery plan approved by director',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 10:30:00',
        action: 'Replacement Aircraft Preparation',
        user: 'ground.ops@flydubai.com',
        description: 'A6-FMF prepared and positioned at IST gate',
        status: 'completed',
        duration: '45 minutes'
      },
      {
        timestamp: '2025-01-10 11:15:00',
        action: 'Passenger Transfer',
        user: 'ground.services@flydubai.com',
        description: '189 passengers transferred to replacement aircraft',
        status: 'completed',
        duration: '30 minutes'
      },
      {
        timestamp: '2025-01-10 11:45:00',
        action: 'Connection Rebooking',
        user: 'reservations@flydubai.com',
        description: '4 connecting passengers rebooked on later flights',
        status: 'completed',
        duration: '25 minutes'
      },
      {
        timestamp: '2025-01-10 12:10:00',
        action: 'Crew Briefing Update',
        user: 'flight.ops@flydubai.com',
        description: 'Crew briefed on replacement aircraft specifics',
        status: 'completed',
        duration: '15 minutes'
      },
      {
        timestamp: '2025-01-10 12:25:00',
        action: 'Departure Cleared',
        user: 'atc.istanbul',
        description: 'FZ147 cleared for departure on replacement aircraft',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 13:45:00',
        action: 'Recovery Completed',
        user: 'system.aeron',
        description: 'Aircraft swap recovery successfully completed',
        status: 'completed',
        duration: '2 minutes'
      }
    ],
    auditTrail: {
      systemDecisions: 2,
      humanInterventions: 10,
      approvalLevels: 3,
      costAuthorizations: 4,
      complianceChecks: 6,
      totalActions: 12
    }
  },
  {
    id: 'SOL-2025-004',
    disruptionId: 'DIS-004',
    flightNumber: 'FZ533',
    route: 'DXB → DEL',
    origin: 'DXB',
    destination: 'DEL',
    aircraft: 'B737-800',
    registration: 'A6-FDH',
    disruptionType: 'Airport Operations',
    disruptionReason: 'DXB runway closure - emergency landing',
    priority: 'Critical',
    dateCreated: '2025-01-10 08:20:00',
    dateExecuted: '2025-01-10 09:15:00',
    dateCompleted: '2025-01-10 11:30:00',
    duration: '3h 10m',
    status: 'Successful',
    affectedPassengers: 189,
    actualCost: 156000,
    estimatedCost: 142000,
    costVariance: 9.9,
    otpImpact: -3.2,
    solutionChosen: 'Option A - Diversion to AUH with ground transport',
    totalOptions: 3,
    executedBy: 'emergency.ops@flydubai.com',
    approvedBy: 'director@flydubai.com',
    passengerSatisfaction: 7.2,
    rebookingSuccess: 92.1,
    categorization: 'Airport Operations',
    // New metrics
    cancellationAvoided: true,
    potentialDelayMinutes: 960, // 16 hours if cancelled until next day
    actualDelayMinutes: 190, // 3h 10m total delay
    delayReductionMinutes: 770,
    disruptionCategory: 'Diversion',
    recoveryEfficiency: 80.2,
    networkImpact: 'Critical',
    downstreamFlightsAffected: 8,
    details: {
      description: 'Emergency diversion to AUH with ground transport coordination',
      passengerRebookings: 15,
      hotelVouchers: 0,
      mealVouchers: 189,
      compensation: 45000,
      connectionsMissed: 12,
      vipPassengers: 6
    },
    actionHistory: [
      {
        timestamp: '2025-01-10 08:20:00',
        action: 'Emergency Alert',
        user: 'atc.dubai',
        description: 'DXB runway 30L/12R closed due to emergency aircraft landing',
        status: 'completed',
        duration: '2 minutes'
      },
      {
        timestamp: '2025-01-10 08:22:00',
        action: 'Impact Assessment',
        user: 'emergency.ops@flydubai.com',
        description: 'Multiple departures affected, estimated closure 4+ hours',
        status: 'completed',
        duration: '8 minutes'
      },
      {
        timestamp: '2025-01-10 08:30:00',
        action: 'Diversion Options',
        user: 'system.aeron',
        description: 'AUH, SHJ, and DWC evaluated as alternative airports',
        status: 'completed',
        duration: '12 minutes'
      },
      {
        timestamp: '2025-01-10 08:42:00',
        action: 'AUH Coordination',
        user: 'ground.coordinator@flydubai.com',
        description: 'AUH slot secured, ground handling arranged',
        status: 'completed',
        duration: '18 minutes'
      },
      {
        timestamp: '2025-01-10 09:00:00',
        action: 'Ground Transport',
        user: 'transport@flydubai.com',
        description: '4 coaches arranged for AUH-DEL passenger transfer',
        status: 'completed',
        duration: '15 minutes'
      },
      {
        timestamp: '2025-01-10 09:15:00',
        action: 'Diversion Executed',
        user: 'flight.ops@flydubai.com',
        description: 'FZ533 diverted to AUH, passengers informed',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 09:20:00',
        action: 'Passenger Services',
        user: 'customer.service@flydubai.com',
        description: 'Meal vouchers and compensation processing initiated',
        status: 'completed',
        duration: '45 minutes'
      },
      {
        timestamp: '2025-01-10 10:05:00',
        action: 'Ground Transport Departure',
        user: 'transport@flydubai.com',
        description: 'Coaches departed AUH for DEL with 189 passengers',
        status: 'completed',
        duration: '30 minutes'
      },
      {
        timestamp: '2025-01-10 11:30:00',
        action: 'Recovery Complete',
        user: 'system.aeron',
        description: 'All passengers delivered to DEL, recovery closed',
        status: 'completed',
        duration: '5 minutes'
      }
    ],
    auditTrail: {
      systemDecisions: 3,
      humanInterventions: 6,
      approvalLevels: 2,
      costAuthorizations: 3,
      complianceChecks: 4,
      totalActions: 9
    }
  },
  {
    id: 'SOL-2025-005',
    disruptionId: 'DIS-005',
    flightNumber: 'FZ367',
    route: 'BOM → DXB',
    origin: 'BOM',
    destination: 'DXB',
    aircraft: 'B737-800',
    registration: 'A6-FDL',
    disruptionType: 'Security',
    disruptionReason: 'Security screening delay at BOM',
    priority: 'High',
    dateCreated: '2025-01-10 06:45:00',
    dateExecuted: '2025-01-10 07:30:00',
    dateCompleted: '2025-01-10 09:20:00',
    duration: '2h 35m',
    status: 'Successful',
    affectedPassengers: 165,
    actualCost: 32000,
    estimatedCost: 38000,
    costVariance: -15.8,
    otpImpact: -1.2,
    solutionChosen: 'Option B - Extended ground time with services',
    totalOptions: 2,
    executedBy: 'security.liaison@flydubai.com',
    approvedBy: 'ops.manager@flydubai.com',
    passengerSatisfaction: 8.5,
    rebookingSuccess: 97.0,
    categorization: 'Security/Airport Operations',
    // New metrics
    cancellationAvoided: false, // This was not at risk of cancellation
    potentialDelayMinutes: 180, // 3 hours potential delay
    actualDelayMinutes: 75, // 1h 15m actual delay
    delayReductionMinutes: 105,
    disruptionCategory: 'Security',
    recoveryEfficiency: 58.3,
    networkImpact: 'Low',
    downstreamFlightsAffected: 2,
    details: {
      description: 'Security delay managed with passenger comfort measures',
      passengerRebookings: 2,
      hotelVouchers: 0,
      mealVouchers: 165,
      compensation: 8000,
      connectionsMissed: 2,
      vipPassengers: 3
    },
    actionHistory: [
      {
        timestamp: '2025-01-10 06:45:00',
        action: 'Security Alert',
        user: 'security.bom@flydubai.com',
        description: 'Enhanced security screening initiated at BOM',
        status: 'completed',
        duration: '3 minutes'
      },
      {
        timestamp: '2025-01-10 06:48:00',
        action: 'Delay Assessment',
        user: 'ground.manager@flydubai.com',
        description: 'Estimated 90-120 minute additional screening time',
        status: 'completed',
        duration: '15 minutes'
      },
      {
        timestamp: '2025-01-10 07:03:00',
        action: 'Passenger Communication',
        user: 'customer.service@flydubai.com',
        description: 'Proactive passenger notifications sent via SMS/email',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 07:08:00',
        action: 'Comfort Services',
        user: 'ground.services@flydubai.com',
        description: 'Refreshments and seating arranged in terminal',
        status: 'completed',
        duration: '22 minutes'
      },
      {
        timestamp: '2025-01-10 07:30:00',
        action: 'Security Clearance',
        user: 'security.bom@flydubai.com',
        description: 'All passengers cleared, boarding commenced',
        status: 'completed',
        duration: '30 minutes'
      },
      {
        timestamp: '2025-01-10 08:00:00',
        action: 'Departure',
        user: 'flight.ops@flydubai.com',
        description: 'FZ367 departed BOM with 75-minute delay',
        status: 'completed',
        duration: '5 minutes'
      },
      {
        timestamp: '2025-01-10 09:20:00',
        action: 'Recovery Complete',
        user: 'system.aeron',
        description: 'Security delay recovery completed successfully',
        status: 'completed',
        duration: '2 minutes'
      }
    ],
    auditTrail: {
      systemDecisions: 2,
      humanInterventions: 5,
      approvalLevels: 1,
      costAuthorizations: 2,
      complianceChecks: 3,
      totalActions: 7
    }
  }
]

// Comprehensive audit logs data
const auditLogs = [
  {
    id: 'LOG-2025-001',
    timestamp: '2025-01-10 14:32:15',
    action: 'Recovery plan executed',
    user: 'ops.manager@flydubai.com',
    userName: 'Sara Ahmed',
    flight: 'FZ123',
    route: 'DXB → BOM',
    details: 'Option B selected and executed successfully via AERON for DXB-BOM route',
    status: 'Success',
    priority: 'High',
    disruptionType: 'Weather delay',
    impactLevel: 'Medium',
    passengerCount: 167,
    costImpact: 'AED 125,000',
    timeImpact: '2h 15m',
    systemResponse: '4.2 seconds',
    confidence: 94.5,
    successRate: 96.1,
    stakeholdersNotified: ['Ground Operations', 'Customer Service', 'Flight Crew'],
    relatedRecords: ['REC-2025-045', 'DIS-2025-012'],
    recoveryMetrics: {
      passengersSatisfaction: 8.7,
      operationalEfficiency: 92.3,
      costEfficiency: 89.2,
      complianceScore: 100,
      executionTime: '95 minutes',
      alternativesConsidered: 3
    },
    actionHistory: [
      { time: '14:15:30', action: 'Disruption detected', user: 'system.aeron', status: 'completed', description: 'Weather delay alert for DXB-BOM route' },
      { time: '14:16:45', action: 'Recovery options generated', user: 'system.aeron', status: 'completed', description: '3 recovery options created by AERON AI' },
      { time: '14:22:10', action: 'Option evaluation', user: 'ops.manager@flydubai.com', status: 'completed', description: 'Reviewed all 3 options and selected Option B' },
      { time: '14:25:30', action: 'Supervisor approval', user: 'supervisor@flydubai.com', status: 'completed', description: 'Recovery plan approved for execution' },
      { time: '14:32:15', action: 'Plan execution', user: 'system.aeron', status: 'completed', description: 'Recovery plan executed successfully' },
      { time: '14:35:45', action: 'Passenger notifications', user: 'system.passenger', status: 'completed', description: 'SMS/email notifications sent to all passengers' },
      { time: '14:45:20', action: 'Ground services coordination', user: 'ground.ops@flydubai.com', status: 'completed', description: 'Gate changes and ground equipment coordination' },
      { time: '16:47:30', action: 'Recovery completion', user: 'system.aeron', status: 'completed', description: 'Flight departed successfully, recovery logged as successful' }
    ],
    technicalDetails: {
      apiCalls: 47,
      dataProcessed: '2.3 MB',
      algorithmsUsed: ['Weather prediction', 'Cost optimization', 'Passenger impact analysis'],
      systemLoad: '12%',
      responseTime: '4.2s',
      errorRate: '0%'
    },
    complianceChecks: [
      { regulation: 'EU261/2004', status: 'Compliant', details: 'Passenger compensation calculated correctly' },
      { regulation: 'GCAA Regulations', status: 'Compliant', details: 'All operational procedures followed' },
      { regulation: 'IATA Standards', status: 'Compliant', details: 'Recovery plan meets industry standards' }
    ]
  },
  {
    id: 'LOG-2025-002', 
    timestamp: '2025-01-10 14:15:22',
    action: 'Solution override',
    user: 'supervisor@flydubai.com',
    userName: 'Ahmed Al-Mansoori',
    flight: 'FZ456',
    route: 'DXB → KHI',
    details: 'Manual override from Option A to Option C for weather contingency at KHI',
    status: 'Warning',
    priority: 'Critical',
    disruptionType: 'Weather contingency',
    impactLevel: 'High',
    passengerCount: 189,
    costImpact: 'AED 89,500',
    timeImpact: '45 minutes',
    systemResponse: '2.1 seconds',
    confidence: 87.3,
    successRate: 91.8,
    stakeholdersNotified: ['Flight Operations', 'Maintenance', 'Customer Service'],
    relatedRecords: ['REC-2025-046', 'DIS-2025-013'],
    recoveryMetrics: {
      passengersSatisfaction: 7.9,
      operationalEfficiency: 88.1,
      costEfficiency: 93.7,
      complianceScore: 100,
      executionTime: '67 minutes',
      alternativesConsidered: 4
    },
    actionHistory: [
      { time: '14:05:15', action: 'Weather alert received', user: 'system.weather', status: 'completed', description: 'Severe weather forecast for KHI airport' },
      { time: '14:07:30', action: 'AERON analysis initiated', user: 'system.aeron', status: 'completed', description: 'Automated analysis of weather impact' },
      { time: '14:10:45', action: 'Initial recommendation', user: 'system.aeron', status: 'completed', description: 'Option A recommended for 2-hour delay' },
      { time: '14:12:20', action: 'Management review', user: 'ops.manager@flydubai.com', status: 'completed', description: 'Operational team reviewed recommendation' },
      { time: '14:15:22', action: 'Manual override decision', user: 'supervisor@flydubai.com', status: 'completed', description: 'Supervisor overrode to Option C based on latest weather update' },
      { time: '14:18:10', action: 'Override justification', user: 'supervisor@flydubai.com', status: 'completed', description: 'Override justified due to deteriorating weather conditions' },
      { time: '14:22:30', action: 'New plan execution', user: 'system.aeron', status: 'completed', description: 'Option C executed with aircraft diversion to AUH' }
    ],
    technicalDetails: {
      apiCalls: 63,
      dataProcessed: '3.1 MB',
      algorithmsUsed: ['Weather prediction', 'Route optimization', 'Cost analysis'],
      systemLoad: '18%',
      responseTime: '2.1s',
      errorRate: '0%'
    },
    complianceChecks: [
      { regulation: 'EU261/2004', status: 'Compliant', details: 'Override properly documented with justification' },
      { regulation: 'GCAA Regulations', status: 'Compliant', details: 'Weather safety protocols followed' },
      { regulation: 'IATA Standards', status: 'Compliant', details: 'Diversion procedures executed correctly' }
    ]
  },
  {
    id: 'LOG-2025-003',
    timestamp: '2025-01-10 13:45:10',
    action: 'Recovery plan generated',
    user: 'system.aeron',
    userName: 'AERON System',
    flight: 'FZ789',
    route: 'DXB → DEL',
    details: 'AERON auto-generated 4 recovery options for DXB-DEL technical delay',
    status: 'Success',
    priority: 'Medium',
    disruptionType: 'Technical delay',
    impactLevel: 'Medium',
    passengerCount: 175,
    costImpact: 'AED 67,800',
    timeImpact: '1h 30m',
    systemResponse: '3.7 seconds',
    confidence: 92.1,
    successRate: 94.3,
    stakeholdersNotified: ['Maintenance', 'Operations Control', 'Ground Services'],
    relatedRecords: ['REC-2025-047', 'DIS-2025-014'],
    recoveryMetrics: {
      passengersSatisfaction: 8.4,
      operationalEfficiency: 91.7,
      costEfficiency: 87.9,
      complianceScore: 100,
      executionTime: '78 minutes',
      alternativesConsidered: 4
    },
    actionHistory: [
      { time: '13:30:20', action: 'Technical issue detected', user: 'maintenance@flydubai.com', status: 'completed', description: 'Hydraulic system anomaly detected during pre-flight check' },
      { time: '13:32:15', action: 'Maintenance assessment', user: 'tech.engineer@flydubai.com', status: 'completed', description: 'Technical team assessed repair requirements' },
      { time: '13:38:30', action: 'AERON triggered', user: 'system.aeron', status: 'completed', description: 'Automatic recovery analysis initiated' },
      { time: '13:45:10', action: 'Options generated', user: 'system.aeron', status: 'completed', description: '4 recovery options generated with cost-benefit analysis' },
      { time: '13:47:45', action: 'Option ranking', user: 'system.aeron', status: 'completed', description: 'Options ranked by efficiency and passenger impact' },
      { time: '13:50:20', action: 'Recommendations sent', user: 'system.aeron', status: 'completed', description: 'Recovery recommendations sent to operations team' }
    ],
    technicalDetails: {
      apiCalls: 52,
      dataProcessed: '2.8 MB',
      algorithmsUsed: ['Maintenance prediction', 'Aircraft availability', 'Cost optimization'],
      systemLoad: '15%',
      responseTime: '3.7s',
      errorRate: '0%'
    },
    complianceChecks: [
      { regulation: 'EASA Part-145', status: 'Compliant', details: 'Maintenance procedures followed correctly' },
      { regulation: 'GCAA Regulations', status: 'Compliant', details: 'Technical delay handled per regulations' },
      { regulation: 'IATA Standards', status: 'Compliant', details: 'Recovery options meet safety standards' }
    ]
  },
  {
    id: 'LOG-2025-004',
    timestamp: '2025-01-10 13:20:45',
    action: 'Predictive alert triggered',
    user: 'system.aeron',
    userName: 'AERON Prediction Engine',
    flight: 'FZ234',
    route: 'IST → DXB',
    details: 'Weather disruption predicted for IST-DXB route, proactive measures initiated',
    status: 'Success',
    priority: 'Medium',
    disruptionType: 'Weather prediction',
    impactLevel: 'Low',
    passengerCount: 162,
    costImpact: 'AED 23,400',
    timeImpact: '25 minutes',
    systemResponse: '1.8 seconds',
    confidence: 89.7,
    successRate: 97.2,
    stakeholdersNotified: ['Flight Planning', 'Weather Services', 'Operations Control'],
    relatedRecords: ['PRED-2025-089', 'WX-2025-034'],
    recoveryMetrics: {
      passengersSatisfaction: 9.1,
      operationalEfficiency: 96.4,
      costEfficiency: 94.8,
      complianceScore: 100,
      executionTime: '45 minutes',
      alternativesConsidered: 2
    },
    actionHistory: [
      { time: '13:15:30', action: 'Weather data analysis', user: 'system.weather', status: 'completed', description: 'Meteorological data analyzed for IST-DXB route' },
      { time: '13:18:15', action: 'Prediction model execution', user: 'system.aeron', status: 'completed', description: 'AI prediction model identified potential disruption' },
      { time: '13:20:45', action: 'Proactive alert generated', user: 'system.aeron', status: 'completed', description: 'Early warning alert sent to operations team' },
      { time: '13:22:30', action: 'Preventive measures', user: 'flight.planning@flydubai.com', status: 'completed', description: 'Route optimization and fuel planning adjusted' },
      { time: '13:25:10', action: 'Passenger communication', user: 'customer.service@flydubai.com', status: 'completed', description: 'Proactive passenger notifications sent' },
      { time: '13:28:45', action: 'Contingency planning', user: 'ops.control@flydubai.com', status: 'completed', description: 'Backup plans prepared for potential delays' }
    ],
    technicalDetails: {
      apiCalls: 34,
      dataProcessed: '1.9 MB',
      algorithmsUsed: ['Weather prediction', 'ML disruption forecasting', 'Route optimization'],
      systemLoad: '8%',
      responseTime: '1.8s',
      errorRate: '0%'
    },
    complianceChecks: [
      { regulation: 'ICAO Annex 3', status: 'Compliant', details: 'Weather procedures followed correctly' },
      { regulation: 'GCAA Regulations', status: 'Compliant', details: 'Predictive measures properly implemented' },
      { regulation: 'IATA Standards', status: 'Compliant', details: 'Proactive communication standards met' }
    ]
  },
  {
    id: 'LOG-2025-005',
    timestamp: '2025-01-10 12:55:30',
    action: 'HOTAC booking created',
    user: 'ops.agent@flydubai.com',
    userName: 'Fatima Al-Zahra',
    flight: 'FZ445',
    route: 'DXB → BEG',
    details: 'Hotel accommodation booked for passenger Ahmed Al-Mansoori at Dubai International Hotel',
    status: 'Success',
    priority: 'High',
    disruptionType: 'Overnight delay',
    impactLevel: 'Medium',
    passengerCount: 1,
    costImpact: 'AED 450',
    timeImpact: 'Overnight',
    systemResponse: '5.3 seconds',
    confidence: 100,
    successRate: 98.9,
    stakeholdersNotified: ['Hotel Services', 'Customer Service', 'Ground Transportation'],
    relatedRecords: ['HOTAC-2025-123', 'PAX-AL-MANSOORI'],
    recoveryMetrics: {
      passengersSatisfaction: 9.3,
      operationalEfficiency: 97.8,
      costEfficiency: 91.2,
      complianceScore: 100,
      executionTime: '12 minutes',
      alternativesConsidered: 3
    },
    actionHistory: [
      { time: '12:45:15', action: 'Delay confirmation', user: 'ops.control@flydubai.com', status: 'completed', description: 'Overnight delay confirmed for FZ445' },
      { time: '12:47:30', action: 'HOTAC eligibility check', user: 'system.hotac', status: 'completed', description: 'Passenger eligibility verified for hotel accommodation' },
      { time: '12:50:20', action: 'Hotel availability check', user: 'hotel.booking@flydubai.com', status: 'completed', description: 'Room availability confirmed at Dubai International Hotel' },
      { time: '12:52:45', action: 'Passenger contact', user: 'customer.service@flydubai.com', status: 'completed', description: 'Passenger contacted and consent obtained' },
      { time: '12:55:30', action: 'Booking confirmation', user: 'ops.agent@flydubai.com', status: 'completed', description: 'Hotel room booked and confirmation sent' },
      { time: '12:58:10', action: 'Transport arrangement', user: 'ground.transport@flydubai.com', status: 'completed', description: 'Ground transportation arranged to hotel' },
      { time: '13:02:45', action: 'Vouchers issued', user: 'customer.service@flydubai.com', status: 'completed', description: 'Meal and incidental vouchers provided' }
    ],
    technicalDetails: {
      apiCalls: 28,
      dataProcessed: '0.8 MB',
      algorithmsUsed: ['Hotel availability', 'Cost optimization', 'Passenger preferences'],
      systemLoad: '5%',
      responseTime: '5.3s',
      errorRate: '0%'
    },
    complianceChecks: [
      { regulation: 'EU261/2004', status: 'Compliant', details: 'Passenger care obligations fulfilled' },
      { regulation: 'GCAA Regulations', status: 'Compliant', details: 'Hotel accommodation procedures followed' },
      { regulation: 'Flydubai Policy', status: 'Compliant', details: 'HOTAC policy requirements met' }
    ]
  }
]

export function PastRecoveryLogs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [disruptionTypeFilter, setDisruptionTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState('last7days')
  const [selectedLog, setSelectedLog] = useState(null)
  const [activeTab, setActiveTab] = useState('metrics')
  const [selectedFlightHistory, setSelectedFlightHistory] = useState(null)
  
  // Audit Trail specific states
  const [selectedAuditRecord, setSelectedAuditRecord] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [auditSearchTerm, setAuditSearchTerm] = useState('')
  const [auditStatusFilter, setAuditStatusFilter] = useState('all')
  const [auditActionFilter, setAuditActionFilter] = useState('all')

  const filteredLogs = pastRecoveryLogs.filter(log => {
    const matchesSearch = log.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.disruptionReason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || log.status.toLowerCase().includes(statusFilter.toLowerCase())
    const matchesType = disruptionTypeFilter === 'all' || log.categorization === disruptionTypeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.flight.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(auditSearchTerm.toLowerCase())
    
    const matchesStatus = auditStatusFilter === 'all' || log.status.toLowerCase() === auditStatusFilter.toLowerCase()
    const matchesAction = auditActionFilter === 'all' || log.action.toLowerCase().includes(auditActionFilter.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesAction
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Successful': return 'bg-green-100 text-green-700 border-green-200'
      case 'Partial Success': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200'
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

  const getActionStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // Audit Trail specific functions
  const handleViewAuditDetails = (record) => {
    setSelectedAuditRecord(record)
    setShowDetailModal(true)
  }

  const getAuditStatusIcon = (status) => {
    switch (status) {
      case 'Success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'Error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getAuditPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getAuditActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'recovery plan executed': return <PlayCircle className="h-4 w-4 text-green-600" />
      case 'solution override': return <RotateCcw className="h-4 w-4 text-yellow-600" />
      case 'recovery plan generated': return <Zap className="h-4 w-4 text-blue-600" />
      case 'predictive alert triggered': return <Brain className="h-4 w-4 text-purple-600" />
      case 'hotac booking created': return <Hotel className="h-4 w-4 text-indigo-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const calculateEnhancedStats = () => {
    const totalCancellationsAvoided = pastRecoveryLogs.filter(log => log.cancellationAvoided).length
    const totalDelayReductionMinutes = pastRecoveryLogs.reduce((sum, log) => sum + log.delayReductionMinutes, 0)
    const totalPotentialDelayMinutes = pastRecoveryLogs.reduce((sum, log) => sum + log.potentialDelayMinutes, 0)
    const avgRecoveryEfficiency = (pastRecoveryLogs.reduce((sum, log) => sum + log.recoveryEfficiency, 0) / pastRecoveryLogs.length).toFixed(1)
    
    // Disruption category breakdown
    const disruptionCategories = pastRecoveryLogs.reduce((acc, log) => {
      acc[log.disruptionCategory] = (acc[log.disruptionCategory] || 0) + 1
      return acc
    }, {})

    return {
      totalSolutions: pastRecoveryLogs.length,
      successRate: ((pastRecoveryLogs.filter(log => log.status === 'Successful').length / pastRecoveryLogs.length) * 100).toFixed(1),
      avgCostVariance: (pastRecoveryLogs.reduce((sum, log) => sum + log.costVariance, 0) / pastRecoveryLogs.length).toFixed(1),
      totalPassengers: pastRecoveryLogs.reduce((sum, log) => sum + log.affectedPassengers, 0),
      totalCost: pastRecoveryLogs.reduce((sum, log) => sum + log.actualCost, 0),
      avgSatisfaction: (pastRecoveryLogs.reduce((sum, log) => sum + log.passengerSatisfaction, 0) / pastRecoveryLogs.length).toFixed(1),
      avgRebookingSuccess: (pastRecoveryLogs.reduce((sum, log) => sum + log.rebookingSuccess, 0) / pastRecoveryLogs.length).toFixed(1),
      avgDuration: Math.round(pastRecoveryLogs.reduce((sum, log) => {
        const hours = parseInt(log.duration.split('h')[0])
        const minutes = parseInt(log.duration.split('h')[1].split('m')[0])
        return sum + (hours * 60 + minutes)
      }, 0) / pastRecoveryLogs.length),
      totalActions: pastRecoveryLogs.reduce((sum, log) => sum + log.auditTrail.totalActions, 0),
      // Enhanced metrics
      totalCancellationsAvoided,
      totalDelayReductionMinutes,
      totalDelayReductionHours: Math.round(totalDelayReductionMinutes / 60),
      avgRecoveryEfficiency,
      disruptionCategories,
      delayEfficiencyPercentage: ((totalDelayReductionMinutes / totalPotentialDelayMinutes) * 100).toFixed(1)
    }
  }

  const stats = calculateEnhancedStats()

  // Chart data preparation
  const disruptionCategoryData = Object.entries(stats.disruptionCategories).map(([category, count]) => ({
    name: category,
    value: count,
    percentage: ((count / pastRecoveryLogs.length) * 100).toFixed(1)
  }))

  const recoveryEfficiencyData = pastRecoveryLogs.map((log, index) => ({
    name: log.flightNumber,
    efficiency: log.recoveryEfficiency,
    delayReduction: log.delayReductionMinutes,
    cost: log.actualCost / 1000 // Convert to thousands
  }))

  const monthlyTrendsData = [
    { month: 'Oct 24', cancellationsAvoided: 15, delayReduction: 2340, efficiency: 87.2 },
    { month: 'Nov 24', cancellationsAvoided: 18, delayReduction: 2890, efficiency: 89.1 },
    { month: 'Dec 24', cancellationsAvoided: 22, delayReduction: 3450, efficiency: 91.3 },
    { month: 'Jan 25', cancellationsAvoided: 5, delayReduction: 2356, efficiency: 93.2 }
  ]

  const COLORS = ['#0851AD', '#ff8200', '#1A365D', '#006496', '#f0fbff', '#FF6B00']

  const getCategoryIcon = (category) => {
    const icons = {
      'Weather': CloudRain,
      'Crew': Users,
      'AOG': Wrench,
      'Diversion': Route,
      'Security': Shield
    }
    return icons[category] || AlertTriangle
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">Past Recovery Logs</h2>
          <p className="text-muted-foreground">Comprehensive recovery performance analytics with cancellation and delay impact metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" className="border-flydubai-orange text-flydubai-orange hover:bg-orange-50">
            <BarChart3 className="h-4 w-4 mr-2" />
            Advanced Analytics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metrics" className="pb-3">
            Key Metrics
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="pb-3">
            Disruption Analysis
          </TabsTrigger>
          <TabsTrigger value="logs" className="pb-3">
            Recovery Logs
          </TabsTrigger>
          <TabsTrigger value="trends" className="pb-3">
            Performance Trends
          </TabsTrigger>
          <TabsTrigger value="audit-trail" className="pb-3">
            Comprehensive Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Key Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6 mt-3">
          {/* Impact Overview */}
          <Card className="border-flydubai-blue bg-gradient-flydubai-light">
            <CardHeader>
              <CardTitle className="text-flydubai-navy flex items-center gap-2">
                <Target className="h-5 w-5" />
                AERON Recovery Impact Summary
              </CardTitle>
              <p className="text-sm text-blue-700">Quantified operational improvements through intelligent recovery management</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-flydubai-orange mb-2">{stats.totalCancellationsAvoided}</div>
                  <div className="text-sm text-flydubai-navy font-medium">Cancellations Avoided</div>
                  <div className="text-xs text-muted-foreground mt-1">Flights kept operational through smart recovery</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-flydubai-blue mb-2">{stats.totalDelayReductionHours}h</div>
                  <div className="text-sm text-flydubai-navy font-medium">Total Delay Reduction</div>
                  <div className="text-xs text-muted-foreground mt-1">{stats.totalDelayReductionMinutes.toLocaleString()} minutes saved across all recoveries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{stats.avgRecoveryEfficiency}%</div>
                  <div className="text-sm text-flydubai-navy font-medium">Recovery Efficiency</div>
                  <div className="text-xs text-muted-foreground mt-1">Average efficiency in preventing potential delays</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-medium">Success Rate</h4>
                </div>
                <p className="text-2xl font-semibold text-green-600">{stats.successRate}%</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={parseFloat(stats.successRate)} className="flex-1 h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Of all recovery attempts</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium">Avg Resolution</h4>
                </div>
                <p className="text-2xl font-semibold text-blue-600">{Math.floor(stats.avgDuration / 60)}h {stats.avgDuration % 60}m</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={(stats.avgDuration / 300) * 100} className="flex-1 h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Time from detection to resolution</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <h4 className="text-sm font-medium">Cost Efficiency</h4>
                </div>
                <p className={`text-2xl font-semibold ${parseFloat(stats.avgCostVariance) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.avgCostVariance}%
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={Math.abs(parseFloat(stats.avgCostVariance)) * 2} className="flex-1 h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">vs estimated costs</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-medium">Passenger Satisfaction</h4>
                </div>
                <p className="text-2xl font-semibold text-purple-600">{stats.avgSatisfaction}/10</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={parseFloat(stats.avgSatisfaction) * 10} className="flex-1 h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average rating across recoveries</p>
              </CardContent>
            </Card>
          </div>

          {/* Operational Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-flydubai-blue" />
                  Passenger Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Passengers Served:</span>
                  <span className="font-semibold text-flydubai-orange">{stats.totalPassengers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Rebooking Success:</span>
                  <span className="font-semibold text-green-600">{stats.avgRebookingSuccess}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfaction Rating:</span>
                  <span className="font-semibold text-purple-600">{stats.avgSatisfaction}/10</span>
                </div>
                <Alert className="border-blue-200 bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs">
                    <strong>Impact:</strong> {stats.totalCancellationsAvoided} flights kept operational, serving {stats.totalPassengers.toLocaleString()} passengers who would otherwise face major disruptions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Timer className="h-4 w-4 text-flydubai-blue" />
                  Time Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delay Reduction:</span>
                  <span className="font-semibold text-green-600">{stats.delayEfficiencyPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Minutes Saved:</span>
                  <span className="font-semibold text-flydubai-orange">{stats.totalDelayReductionMinutes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Efficiency:</span>
                  <span className="font-semibold text-flydubai-blue">{stats.avgRecoveryEfficiency}%</span>
                </div>
                <Alert className="border-green-200 bg-green-50">
                  <Clock className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-xs">
                    <strong>Time Saved:</strong> {stats.totalDelayReductionHours} hours of delay avoided through intelligent recovery decisions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-flydubai-blue" />
                  Financial Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Recovery Cost:</span>
                  <span className="font-semibold text-flydubai-orange">AED {(stats.totalCost / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost Variance:</span>
                  <span className={`font-semibold ${parseFloat(stats.avgCostVariance) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.avgCostVariance}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Cost/Flight:</span>
                  <span className="font-semibold text-flydubai-blue">AED {Math.round(stats.totalCost / stats.totalSolutions / 1000)}K</span>
                </div>
                <Alert className="border-orange-200 bg-orange-50">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 text-xs">
                    <strong>Efficiency:</strong> Costs under budget by {Math.abs(parseFloat(stats.avgCostVariance))}% on average through optimal recovery selection.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Disruption Analysis Tab */}
        <TabsContent value="visualizations" className="space-y-6 mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disruption Categories Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-flydubai-navy flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Disruption Categories Distribution
                </CardTitle>
                <p className="text-sm text-muted-foreground">Breakdown of disruption types handled by AERON</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={disruptionCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {disruptionCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Category Breakdown */}
                <div className="mt-4 space-y-2">
                  {disruptionCategoryData.map((category, index) => {
                    const Icon = getCategoryIcon(category.name)
                    return (
                      <div key={category.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{category.value}</span>
                          <span className="text-xs text-muted-foreground ml-1">({category.percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recovery Efficiency Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-flydubai-navy flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Recovery Efficiency by Flight
                </CardTitle>
                <p className="text-sm text-muted-foreground">Effectiveness of recovery solutions in preventing delays</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recoveryEfficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        label={{ value: 'Delay Reduction (min)', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip />
                      <Bar 
                        yAxisId="left"
                        dataKey="efficiency" 
                        fill="#0851AD" 
                        name="Recovery Efficiency (%)"
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="delayReduction" 
                        fill="#ff8200" 
                        name="Delay Reduction (minutes)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Disruption Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-flydubai-navy flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Key Disruption Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Alert className="border-red-200 bg-red-50">
                  <Wrench className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>AOG (Aircraft on Ground):</strong> Highest impact disruptions but most delay reduction achieved through aircraft swaps
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <Route className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Diversions:</strong> Critical network impact but effective passenger transport coordination maintains service
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <Users className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Crew Issues:</strong> Quick standby activation results in highest recovery efficiency rates
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Trends Tab */}
        <TabsContent value="trends" className="space-y-6 mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-flydubai-navy flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recovery Performance Trends
              </CardTitle>
              <p className="text-sm text-muted-foreground">Historical performance showing improvement in recovery metrics</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="delayReduction"
                      stackId="1"
                      stroke="#0851AD"
                      fill="#0851AD"
                      fillOpacity={0.6}
                      name="Delay Reduction (minutes)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#ff8200"
                      strokeWidth={3}
                      name="Recovery Efficiency (%)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="cancellationsAvoided"
                      stroke="#1A365D"
                      strokeWidth={2}
                      name="Cancellations Avoided"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-medium">Efficiency Trend</h4>
                </div>
                <p className="text-2xl font-semibold text-green-600">+6.0%</p>
                <p className="text-xs text-muted-foreground">Recovery efficiency improvement over 4 months</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium">Delay Reduction</h4>
                </div>
                <p className="text-2xl font-semibold text-blue-600">+47%</p>
                <p className="text-xs text-muted-foreground">Increase in delay minutes prevented</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <h4 className="text-sm font-medium">Cancellation Prevention</h4>
                </div>
                <p className="text-2xl font-semibold text-orange-600">-67%</p>
                <p className="text-xs text-muted-foreground">Reduction in potential cancellations</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recovery Logs Tab (existing functionality with enhanced filters) */}
        <TabsContent value="logs" className="space-y-6 mt-3">
          {/* Enhanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search Logs</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Flight, route, reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="successful">Successful</SelectItem>
                      <SelectItem value="partial">Partial Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Disruption Type</Label>
                  <Select value={disruptionTypeFilter} onValueChange={setDisruptionTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Aircraft issue (e.g., AOG)">Aircraft Issue</SelectItem>
                      <SelectItem value="Crew issue (e.g., sick report, duty time breach)">Crew Issue</SelectItem>
                      <SelectItem value="ATC/weather delay">ATC/Weather</SelectItem>
                      <SelectItem value="Airport curfew/ramp congestion">Airport/Curfew</SelectItem>
                      <SelectItem value="Rotation misalignment or maintenance hold">Rotation/Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="last90days">Last 90 Days</SelectItem>
                      <SelectItem value="lastyear">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setDisruptionTypeFilter('all')
                      setDateRange('last7days')
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recovery Logs Table with new metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-flydubai-navy">Recovery History ({filteredLogs.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solution ID</TableHead>
                    <TableHead>Flight Details</TableHead>
                    <TableHead>Disruption</TableHead>
                    <TableHead>Recovery Impact</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map(log => (
                    <TableRow key={log.id} className="hover:bg-blue-50">
                      <TableCell className="font-mono text-sm">{log.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-flydubai-blue">{log.flightNumber}</p>
                          <p className="text-sm text-muted-foreground">{log.route}</p>
                          <p className="text-xs text-muted-foreground">{log.aircraft} • {log.registration}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge className={getPriorityColor(log.priority)} variant="outline">
                            {log.priority}
                          </Badge>
                          <p className="text-sm mt-1">{log.disruptionReason}</p>
                          <p className="text-xs text-muted-foreground">{log.disruptionCategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {log.cancellationAvoided && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              Cancellation Avoided
                            </Badge>
                          )}
                          <p className="text-sm font-medium text-green-600">
                            -{log.delayReductionMinutes}min delay
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.recoveryEfficiency}% efficiency
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{log.duration}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.dateCompleted).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)} variant="outline">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm">{log.passengerSatisfaction}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {log.rebookingSuccess}% rebooking
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comprehensive Audit Trail Tab */}
        <TabsContent value="audit-trail" className="space-y-6 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-flydubai-navy">Comprehensive Audit Trail</h2>
              <p className="text-muted-foreground">Complete log of AERON system actions and user decisions with detailed analytics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button className="btn-flydubai-primary">
                <Download className="h-4 w-4 mr-2" />
                Export Detailed Report
              </Button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-flydubai-navy">Search & Filter Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Records</label>
                  <Input
                    placeholder="Search by flight, user, action..."
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    className="input-flydubai"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={auditStatusFilter} onValueChange={setAuditStatusFilter}>
                    <SelectTrigger className="select-flydubai">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Action Type</label>
                  <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
                    <SelectTrigger className="select-flydubai">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="recovery">Recovery Plans</SelectItem>
                      <SelectItem value="override">Overrides</SelectItem>
                      <SelectItem value="predictive">Predictions</SelectItem>
                      <SelectItem value="hotac">HOTAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAuditSearchTerm('')
                      setAuditStatusFilter('all')
                      setAuditActionFilter('all')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-medium">Success Rate</h4>
                </div>
                <p className="text-2xl font-semibold text-green-600">98.9%</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium">Avg Response</h4>
                </div>
                <p className="text-2xl font-semibold text-blue-600">3.4s</p>
                <p className="text-xs text-muted-foreground">System response time</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <h4 className="text-sm font-medium">Cost Impact</h4>
                </div>
                <p className="text-2xl font-semibold text-orange-600">AED 2.8M</p>
                <p className="text-xs text-muted-foreground">Total managed this month</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-medium">Passengers Served</h4>
                </div>
                <p className="text-2xl font-semibold text-purple-600">47,389</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-flydubai-navy">Audit Records ({filteredAuditLogs.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="table-flydubai">
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Flight</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Metrics</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleViewAuditDetails(log)}
                    >
                      <TableCell className="font-mono text-sm">
                        <div>
                          <p>{log.timestamp.split(' ')[1]}</p>
                          <p className="text-xs text-gray-500">{log.timestamp.split(' ')[0]}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAuditActionIcon(log.action)}
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <Badge className={getAuditPriorityColor(log.priority)}>
                              {log.priority}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge className="badge-flydubai mb-1">{log.flight}</Badge>
                          <p className="text-xs text-gray-600">{log.route}</p>
                          <p className="text-xs text-gray-500">{log.passengerCount} passengers</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.userName}</p>
                          <p className="text-xs text-gray-600">{log.user}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-orange-600" />
                            <span className="text-xs">{log.costImpact}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-600" />
                            <span className="text-xs">{log.timeImpact}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Confidence:</span>
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {log.confidence}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Response:</span>
                            <span className="text-xs font-mono">{log.systemResponse}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAuditStatusIcon(log.status)}
                          <Badge 
                            className={
                              log.status === 'Success' ? 'status-success' :
                              log.status === 'Warning' ? 'status-warning' : 'status-error'
                            }
                          >
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewAuditDetails(log)
                          }}
                          className="hover:bg-blue-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detailed Audit Record Modal */}
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-flydubai-blue" />
                      Comprehensive Audit Record - {selectedAuditRecord?.id}
                    </DialogTitle>
                    <DialogDescription>
                      Detailed analysis and timeline for {selectedAuditRecord?.action} on {selectedAuditRecord?.flight}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={selectedAuditRecord ? getAuditPriorityColor(selectedAuditRecord.priority) : ''}>
                      {selectedAuditRecord?.priority} Priority
                    </Badge>
                    <Badge className={
                      selectedAuditRecord?.status === 'Success' ? 'status-success' :
                      selectedAuditRecord?.status === 'Warning' ? 'status-warning' : 'status-error'
                    }>
                      {selectedAuditRecord?.status}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {selectedAuditRecord && (
                <div className="space-y-6">
                  {/* Summary Overview */}
                  <Card className="border-flydubai-blue bg-gradient-flydubai-light">
                    <CardHeader>
                      <CardTitle className="text-flydubai-navy flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Action Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-sm mb-3">Flight Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Flight:</span>
                              <Badge className="badge-flydubai">{selectedAuditRecord.flight}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Route:</span>
                              <span className="font-medium">{selectedAuditRecord.route}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Passengers:</span>
                              <span className="font-medium">{selectedAuditRecord.passengerCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Disruption:</span>
                              <span className="font-medium">{selectedAuditRecord.disruptionType}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-3">Impact Analysis</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cost Impact:</span>
                              <span className="font-medium text-orange-600">{selectedAuditRecord.costImpact}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time Impact:</span>
                              <span className="font-medium text-blue-600">{selectedAuditRecord.timeImpact}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Impact Level:</span>
                              <Badge className={
                                selectedAuditRecord.impactLevel === 'High' ? 'bg-red-100 text-red-800' :
                                selectedAuditRecord.impactLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {selectedAuditRecord.impactLevel}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Success Rate:</span>
                              <span className="font-medium text-green-600">{selectedAuditRecord.successRate}%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-3">Performance Metrics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidence:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={selectedAuditRecord.confidence} className="w-16 h-2" />
                                <span className="font-medium">{selectedAuditRecord.confidence}%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Response Time:</span>
                              <span className="font-medium text-purple-600">{selectedAuditRecord.systemResponse}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">User:</span>
                              <span className="font-medium">{selectedAuditRecord.userName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Executed At:</span>
                              <span className="font-medium">{selectedAuditRecord.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="timeline" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="timeline">Action Timeline</TabsTrigger>
                      <TabsTrigger value="metrics">Recovery Metrics</TabsTrigger>
                      <TabsTrigger value="technical">Technical Details</TabsTrigger>
                      <TabsTrigger value="compliance">Compliance</TabsTrigger>
                      <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                      <TabsTrigger value="related">Related Records</TabsTrigger>
                    </TabsList>

                    <TabsContent value="timeline" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-flydubai-blue" />
                            Complete Action Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedAuditRecord.actionHistory.map((action, index) => (
                              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                                <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 bg-flydubai-blue text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </div>
                                  {index < selectedAuditRecord.actionHistory.length - 1 && (
                                    <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-sm">{action.action}</h4>
                                      <p className="text-xs text-gray-600">{action.description}</p>
                                    </div>
                                    <div className="text-right">
                                      <Badge variant="outline" className="text-xs mb-1">
                                        {action.time}
                                      </Badge>
                                      <p className="text-xs text-gray-500">{action.user}</p>
                                    </div>
                                  </div>
                                  <Badge className={
                                    action.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    action.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-600'
                                  }>
                                    {action.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Recovery Performance</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm">Passenger Satisfaction</span>
                                  <span className="font-medium">{selectedAuditRecord.recoveryMetrics.passengersSatisfaction}/10</span>
                                </div>
                                <Progress value={selectedAuditRecord.recoveryMetrics.passengersSatisfaction * 10} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm">Operational Efficiency</span>
                                  <span className="font-medium">{selectedAuditRecord.recoveryMetrics.operationalEfficiency}%</span>
                                </div>
                                <Progress value={selectedAuditRecord.recoveryMetrics.operationalEfficiency} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm">Cost Efficiency</span>
                                  <span className="font-medium">{selectedAuditRecord.recoveryMetrics.costEfficiency}%</span>
                                </div>
                                <Progress value={selectedAuditRecord.recoveryMetrics.costEfficiency} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm">Compliance Score</span>
                                  <span className="font-medium">{selectedAuditRecord.recoveryMetrics.complianceScore}%</span>
                                </div>
                                <Progress value={selectedAuditRecord.recoveryMetrics.complianceScore} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Execution Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Execution Time:</span>
                                <span className="font-medium">{selectedAuditRecord.recoveryMetrics.executionTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Alternatives Considered:</span>
                                <span className="font-medium">{selectedAuditRecord.recoveryMetrics.alternativesConsidered}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">System Response:</span>
                                <span className="font-medium">{selectedAuditRecord.systemResponse}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Success Rate:</span>
                                <span className="font-medium text-green-600">{selectedAuditRecord.successRate}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="technical" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Package className="h-4 w-4 text-flydubai-blue" />
                              System Performance
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">API Calls Made:</span>
                                <span className="font-medium">{selectedAuditRecord.technicalDetails.apiCalls}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Data Processed:</span>
                                <span className="font-medium">{selectedAuditRecord.technicalDetails.dataProcessed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">System Load:</span>
                                <span className="font-medium">{selectedAuditRecord.technicalDetails.systemLoad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Response Time:</span>
                                <span className="font-medium">{selectedAuditRecord.technicalDetails.responseTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Error Rate:</span>
                                <span className="font-medium text-green-600">{selectedAuditRecord.technicalDetails.errorRate}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Algorithms Used</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedAuditRecord.technicalDetails.algorithmsUsed.map((algorithm, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                  <Calculator className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{algorithm}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="h-4 w-4 text-flydubai-blue" />
                            Regulatory Compliance Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedAuditRecord.complianceChecks.map((check, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-sm">{check.regulation}</h4>
                                  <Badge className={
                                    check.status === 'Compliant' ? 'bg-green-100 text-green-800' :
                                    check.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }>
                                    {check.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600">{check.details}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="stakeholders" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Network className="h-4 w-4 text-flydubai-blue" />
                            Stakeholder Notifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedAuditRecord.stakeholdersNotified.map((stakeholder, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="w-8 h-8 bg-flydubai-blue text-white rounded-full flex items-center justify-center">
                                  <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{stakeholder}</p>
                                  <p className="text-xs text-green-600">Notified ✓</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="related" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-flydubai-blue" />
                            Related Records & References
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-3">Connected Records</h4>
                              <div className="flex gap-2 flex-wrap">
                                {selectedAuditRecord.relatedRecords.map((record, index) => (
                                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-blue-50">
                                    {record}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium text-sm mb-3">Contact Information</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                  <Mail className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <p className="font-medium text-sm">{selectedAuditRecord.user}</p>
                                    <p className="text-xs text-gray-600">Primary Contact</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                  <Phone className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="font-medium text-sm">+971 4 XXX XXXX</p>
                                    <p className="text-xs text-gray-600">Operations Desk</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                      Close
                    </Button>
                    <Button variant="outline" className="border-blue-500 text-blue-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export Record
                    </Button>
                    <Button className="btn-flydubai-primary">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}