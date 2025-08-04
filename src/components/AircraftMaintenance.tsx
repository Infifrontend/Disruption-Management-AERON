'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { 
  Wrench, 
  Plus, 
  Upload, 
  RefreshCw as Sync, 
  Calendar as CalendarIcon, 
  Table as TableIcon,
  Filter,
  Download,
  FileUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plane,
  MapPin,
  User,
  Camera,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  Settings,
  Bell,
  Archive,
  Info
} from 'lucide-react'
import { format } from 'date-fns'

// Mock data
const maintenanceSchedule = [
  {
    id: 'MNT-001',
    tailNumber: 'A6-FDA',
    aircraftType: 'B737-800',
    maintenanceType: 'C-Check',
    startTime: '2025-06-06 22:00',
    endTime: '2025-06-07 06:00',
    location: 'DXB',
    status: 'Scheduled',
    estimatedCost: 125000,
    technicianTeam: 'Team Alpha',
    priority: 'High',
    description: 'Comprehensive inspection and component replacement'
  },
  {
    id: 'MNT-002',
    tailNumber: 'A6-FDB',
    aircraftType: 'A350-900',
    maintenanceType: 'A-Check',
    startTime: '2025-06-07 14:00',
    endTime: '2025-06-07 18:00',
    location: 'LHR',
    status: 'In Progress',
    estimatedCost: 45000,
    technicianTeam: 'Team Bravo',
    priority: 'Medium',
    description: 'Routine inspection and minor adjustments'
  },
  {
    id: 'MNT-003',
    tailNumber: 'A6-FDC',
    aircraftType: 'B777-300ER',
    maintenanceType: 'Engine Overhaul',
    startTime: '2025-06-08 08:00',
    endTime: '2025-06-10 18:00',
    location: 'DXB',
    status: 'Planned',
    estimatedCost: 850000,
    technicianTeam: 'Team Charlie',
    priority: 'Critical',
    description: 'Complete engine teardown and rebuild'
  },
  {
    id: 'MNT-004',
    tailNumber: 'A6-FDD',
    aircraftType: 'A380-800',
    maintenanceType: 'B-Check',
    startTime: '2025-06-09 20:00',
    endTime: '2025-06-10 08:00',
    location: 'JFK',
    status: 'Completed',
    estimatedCost: 85000,
    technicianTeam: 'Team Delta',
    priority: 'Medium',
    description: 'Intermediate inspection and system checks'
  }
]

const unscheduledMaintenance = [
  {
    id: 'UNS-001',
    tailNumber: 'A6-FDE',
    dateTime: '2025-06-06 12:30',
    issueType: 'Hydraulics',
    severity: 'High',
    description: 'Hydraulic pressure loss detected during pre-flight checks',
    reportedBy: 'Capt. John Smith',
    status: 'Under Investigation',
    attachments: ['image1.jpg', 'log_file.pdf'],
    estimatedRepairTime: '4-6 hours',
    partRequired: 'Hydraulic pump assembly'
  },
  {
    id: 'UNS-002',
    tailNumber: 'A6-FDF',
    dateTime: '2025-06-05 18:45',
    issueType: 'Avionics',
    severity: 'Medium',
    description: 'Navigation display flickering intermittently',
    reportedBy: 'F/O Sarah Johnson',
    status: 'Parts Ordered',
    attachments: ['diagnostic_report.pdf'],
    estimatedRepairTime: '2-3 hours',
    partRequired: 'Display unit'
  }
]

const aircraftFleet = [
  { tailNumber: 'A6-FDA', type: 'B737-800' },
  { tailNumber: 'A6-FDB', type: 'A350-900' },
  { tailNumber: 'A6-FDC', type: 'B777-300ER' },
  { tailNumber: 'A6-FDD', type: 'A380-800' },
  { tailNumber: 'A6-FDE', type: 'B737-800' },
  { tailNumber: 'A6-FDF', type: 'A350-900' },
  { tailNumber: 'A6-FDG', type: 'B777-200LR' },
  { tailNumber: 'A6-FDH', type: 'A380-800' }
]

export function AircraftMaintenance() {
  const [activeView, setActiveView] = useState('table')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filters, setFilters] = useState({
    tailNumber: '',
    dateRange: '',
    maintenanceType: '',
    location: ''
  })
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [incidentForm, setIncidentForm] = useState({
    tailNumber: '',
    dateTime: '',
    issueType: '',
    severity: '',
    description: '',
    reportedBy: 'Current User'
  })

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'planned':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in progress':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleSubmitIncident = () => {
    // Logic to submit unscheduled maintenance report
    console.log('Submitting incident:', incidentForm)
    setShowIncidentModal(false)
    setIncidentForm({
      tailNumber: '',
      dateTime: '',
      issueType: '',
      severity: '',
      description: '',
      reportedBy: 'Current User'
    })
  }

  const filteredMaintenanceSchedule = maintenanceSchedule.filter(item => {
    return (
      (!filters.tailNumber || item.tailNumber.toLowerCase().includes(filters.tailNumber.toLowerCase())) &&
      (!filters.maintenanceType || filters.maintenanceType === 'all-types' || item.maintenanceType === filters.maintenanceType) &&
      (!filters.location || filters.location === 'all-locations' || item.location === filters.location)
    )
  })

    // Function to format date in IST
    const formatInIST = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid Date';
        }
    };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              Aircraft Maintenance Operations
            </h2>
            <p className="text-muted-foreground">Comprehensive maintenance scheduling, tracking, and fleet health monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              8 Aircraft Active
            </Badge>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              3 In Maintenance
            </Badge>
          </div>
        </div>

        {/* Alert Banner */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Maintenance Alert:</strong> A6-FDA C-Check scheduled for tonight at 22:00. Ensure all pre-maintenance tasks are completed.
          </AlertDescription>
        </Alert>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plane className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Under Maintenance Today</p>
                  <p className="text-2xl font-semibold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Checks This Week</p>
                  <p className="text-2xl font-semibold">7</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unscheduled Events This Month</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Turnaround Time</p>
                  <p className="text-2xl font-semibold">6.2h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scheduled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Scheduled Maintenance
            </TabsTrigger>
            <TabsTrigger value="unscheduled" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Unscheduled Reports
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Maintenance Timeline
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Fleet Health Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled">
            <ScheduledMaintenanceView 
              activeView={activeView}
              setActiveView={setActiveView}
              filters={filters}
              setFilters={setFilters}
              filteredMaintenanceSchedule={filteredMaintenanceSchedule}
              getStatusColor={getStatusColor}
              setShowUploadModal={setShowUploadModal}
              formatInIST={formatInIST}
            />
          </TabsContent>

          <TabsContent value="unscheduled">
            <UnscheduledMaintenanceReporting 
              unscheduledMaintenance={unscheduledMaintenance}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
              setShowIncidentModal={setShowIncidentModal}
                formatInIST={formatInIST}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <MaintenanceTimeline 
              maintenanceSchedule={maintenanceSchedule}
              unscheduledMaintenance={unscheduledMaintenance}
                formatInIST={formatInIST}
            />
          </TabsContent>

          <TabsContent value="health">
            <FleetHealthSummary formatInIST={formatInIST}/>
          </TabsContent>
        </Tabs>

        {/* Upload Maintenance Plan Modal */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Maintenance Plan
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Upload maintenance schedules in CSV, XML, or JSON format. Download our template for proper formatting.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Select File Format</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                      <SelectItem value="xml">XML (Extensible Markup Language)</SelectItem>
                      <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Upload File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <FileUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download XML Template
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON Template
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button>
                  Upload & Import
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Unscheduled Maintenance Modal */}
        <Dialog open={showIncidentModal} onOpenChange={setShowIncidentModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Unscheduled Maintenance Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Aircraft Tail Number</Label>
                  <Select value={incidentForm.tailNumber} onValueChange={(value) => setIncidentForm({...incidentForm, tailNumber: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aircraft" />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftFleet.map((aircraft) => (
                        <SelectItem key={aircraft.tailNumber} value={aircraft.tailNumber}>
                          {aircraft.tailNumber} - {aircraft.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date & Time of Incident</Label>
                  <Input 
                    type="datetime-local"
                    value={incidentForm.dateTime}
                    onChange={(e) => setIncidentForm({...incidentForm, dateTime: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Issue Type</Label>
                  <Select value={incidentForm.issueType} onValueChange={(value) => setIncidentForm({...incidentForm, issueType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engine">Engine</SelectItem>
                      <SelectItem value="Hydraulics">Hydraulics</SelectItem>
                      <SelectItem value="Avionics">Avionics</SelectItem>
                      <SelectItem value="Landing Gear">Landing Gear</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Cabin">Cabin Systems</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Severity</Label>
                  <Select value={incidentForm.severity} onValueChange={(value) => setIncidentForm({...incidentForm, severity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the issue in detail..."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Attachments</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload photos or log files</p>
                </div>
              </div>

              <div>
                <Label>Reported By</Label>
                <Input 
                  value={incidentForm.reportedBy}
                  onChange={(e) => setIncidentForm({...incidentForm, reportedBy: e.target.value})}
                  disabled
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowIncidentModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitIncident}>
                  Save & Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

function ScheduledMaintenanceView({ 
  activeView, 
  setActiveView, 
  filters, 
  setFilters, 
  filteredMaintenanceSchedule, 
  getStatusColor,
  setShowUploadModal,
    formatInIST
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Scheduled Maintenance View
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={activeView === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('calendar')}
                className="h-8"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Calendar
              </Button>
              <Button
                variant={activeView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('table')}
                className="h-8"
              >
                <TableIcon className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>

            <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Plan
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Sync className="h-4 w-4" />
                  Sync MRO
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Auto-fetch from AMOS or other configured sources
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Aircraft Tail Number</Label>
                <Input 
                  placeholder="A6-FDA"
                  value={filters.tailNumber}
                  onChange={(e) => setFilters({...filters, tailNumber: e.target.value})}
                />
              </div>

              <div>
                <Label>Date Range</Label>
                <Input 
                  type="date"
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                />
              </div>

              <div>
                <Label>Maintenance Type</Label>
                <Select value={filters.maintenanceType} onValueChange={(value) => setFilters({...filters, maintenanceType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="A-Check">A-Check</SelectItem>
                    <SelectItem value="B-Check">B-Check</SelectItem>
                    <SelectItem value="C-Check">C-Check</SelectItem>
                    <SelectItem value="D-Check">D-Check</SelectItem>
                    <SelectItem value="Engine Overhaul">Engine Overhaul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Location</Label>
                <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-locations">All Locations</SelectItem>
                    <SelectItem value="DXB">DXB - Dubai</SelectItem>
                    <SelectItem value="LHR">LHR - London</SelectItem>
                    <SelectItem value="JFK">JFK - New York</SelectItem>
                    <SelectItem value="SIN">SIN - Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table View */}
        {activeView === 'table' && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tail No</TableHead>
                  <TableHead>Aircraft Type</TableHead>
                  <TableHead>Maintenance Type</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenanceSchedule.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium">{item.tailNumber}</TableCell>
                    <TableCell>{item.aircraftType}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {item.maintenanceType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatInIST(item.startTime)}</TableCell>
                    <TableCell className="font-mono text-sm">{formatInIST(item.endTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {item.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Calendar View */}
        {activeView === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="rounded-md border p-4">
                <Calendar
                  mode="single"
                  className="rounded-md"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <h3 className="font-medium">Today's Maintenance Schedule</h3>
                {filteredMaintenanceSchedule.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <span className="font-mono font-medium">{item.tailNumber}</span>
                          <span className="text-sm text-muted-foreground">{item.aircraftType}</span>
                        </div>
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          {item.maintenanceType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📍 {item.location}</span>
                        <span>🕒 {formatInIST(item.startTime)} - {formatInIST(item.endTime)}</span>
                        <span>👥 {item.technicianTeam}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UnscheduledMaintenanceReporting({ unscheduledMaintenance, getSeverityColor, getStatusColor, setShowIncidentModal, formatInIST }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Unscheduled Maintenance Reports
          </CardTitle>
          <Button onClick={() => setShowIncidentModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Incident Report
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {unscheduledMaintenance.map((incident) => (
            <Card key={incident.id} className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <span className="font-mono font-medium">{incident.tailNumber}</span>
                    <Badge variant="outline" className="border-orange-200 text-orange-700">
                      {incident.issueType}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status}
                  </Badge>
                </div>

                <p className="text-sm mb-3">{incident.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Reported:</span>
                    <div>{formatInIST(incident.dateTime)}</div>
                    <div>By: {incident.reportedBy}</div>
                  </div>
                  <div>
                    <span className="font-medium">Estimated Repair Time:</span>
                    <div>{incident.estimatedRepairTime}</div>
                  </div>
                  <div>
                    <span className="font-medium">Part Required:</span>
                    <div>{incident.partRequired}</div>
                  </div>
                </div>

                {incident.attachments && incident.attachments.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-muted-foreground">Attachments:</span>
                    <div className="flex gap-2 mt-1">
                      {incident.attachments.map((file, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          📎 {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MaintenanceTimeline({ maintenanceSchedule, unscheduledMaintenance, formatInIST }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Maintenance Timeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Unscheduled</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {maintenanceSchedule.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="font-mono font-medium">{item.tailNumber}</div>
                  <div className="text-xs text-muted-foreground">{item.aircraftType}</div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={
                      item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      item.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {item.status}
                    </Badge>
                    <span className="font-medium">{item.maintenanceType}</span>
                    <span className="text-sm text-muted-foreground">at {item.location}</span>
                  </div>

                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          item.status === 'Completed' ? 'bg-green-500' :
                          item.status === 'In Progress' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}
                        style={{ 
                          width: item.status === 'Completed' ? '100%' : 
                                 item.status === 'In Progress' ? '60%' : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatInIST(item.startTime)}</span>
                    <span>{formatInIST(item.endTime)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-sm">${(item.estimatedCost / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground">{item.technicianTeam}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FleetHealthSummary({formatInIST}) {
  const healthMetrics = [
    { metric: 'Fleet Availability', value: 94.2, target: 95, unit: '%', trend: 'up' },
    { metric: 'On-Time Completion', value: 87.5, target: 90, unit: '%', trend: 'down' },
    { metric: 'Cost Per Flight Hour', value: 2847, target: 2500, unit: '$', trend: 'up' },
    { metric: 'Mean Time Between Failures', value: 2340, target: 2500, unit: 'hrs', trend: 'stable' }
  ]

  const aircraftHealth = [
    { tailNumber: 'A6-FDA', type: 'B737-800', healthScore: 85, nextCheck: '2025-06-15', hoursToCheck: 127 },
    { tailNumber: 'A6-FDB', type: 'A350-900', healthScore: 92, nextCheck: '2025-06-20', hoursToCheck: 243 },
    { tailNumber: 'A6-FDC', type: 'B777-300ER', healthScore: 78, nextCheck: '2025-06-08', hoursToCheck: 45 },
    { tailNumber: 'A6-FDD', type: 'A380-800', healthScore: 95, nextCheck: '2025-06-25', hoursToCheck: 387 }
  ]

  return (
    <div className="space-y-6">
      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Fleet Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthMetrics.map((metric, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.metric}</span>
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : metric.trend === 'down' ? (
                        <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-semibold">
                      {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Target: {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                    </span>
                  </div>

                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Aircraft Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Individual Aircraft Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aircraftHealth.map((aircraft, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="font-mono font-medium">{aircraft.tailNumber}</div>
                  <div className="text-xs text-muted-foreground">{aircraft.type}</div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium">Health Score</span>
                    <Badge className={
                      aircraft.healthScore >= 90 ? 'bg-green-100 text-green-700' :
                      aircraft.healthScore >= 80 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {aircraft.healthScore}%
                    </Badge>
                  </div>

                  <Progress value={aircraft.healthScore} className="h-2 mb-2" />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Next Check: {aircraft.nextCheck}</span>
                    <span>{aircraft.hoursToCheck} hours remaining</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Maintenance Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-semibold text-blue-700">$1.2M</p>
              <p className="text-sm text-blue-600">This Month</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-semibold text-green-700">$847K</p>
              <p className="text-sm text-green-600">Planned Maintenance</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-semibold text-red-700">$353K</p>
              <p className="text-sm text-red-600">Unscheduled Repairs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}