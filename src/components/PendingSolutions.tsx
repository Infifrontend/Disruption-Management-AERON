'use client'

import React, { useState, useEffect } from 'react'
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
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true)
      try {
        const data = await databaseService.getPendingSolutions()
        setPlans(data)
      } catch (error) {
        console.error("Failed to fetch pending solutions:", error)
        // Handle error appropriately, e.g., show an error message
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const filteredPlans = plans.filter(plan => {
    const matchesPriority = filters.priority === 'all' || plan.priority.toLowerCase() === filters.priority
    const matchesSubmitter = filters.submitter === 'all' || plan.submittedBy.toLowerCase().includes(filters.submitter.toLowerCase())
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
        aValue = priorityOrder[a.priority] || 0
        bValue = priorityOrder[b.priority] || 0
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
      all: plans.length,
      pending: plans.filter(p => ['Pending Approval', 'Under Review'].includes(p.status)).length,
      approved: plans.filter(p => p.status === 'Approved').length,
      rejected: plans.filter(p => p.status === 'Rejected').length,
      critical: plans.filter(p => p.priority === 'Critical').length
    }
  }

  const tabCounts = getTabCounts()

  const handleApprove = async (planId) => {
    try {
      await databaseService.updateFlightDisruptionStatus(planId, 'Approved');
      setPlans(plans.map(plan => plan.id === planId ? { ...plan, status: 'Approved' } : plan));
    } catch (error) {
      console.error("Failed to approve plan:", error);
    }
  }

  const handleReject = async (planId) => {
    try {
      await databaseService.updateFlightDisruptionStatus(planId, 'Rejected');
      setPlans(plans.map(plan => plan.id === planId ? { ...plan, status: 'Rejected' } : plan));
    } catch (error) {
      console.error("Failed to reject plan:", error);
    }
  }

  const handleExecute = async (plan) => {
    try {
      await databaseService.updateFlightDisruptionStatus(plan.id, 'Pending');
      await databaseService.addPendingSolution({
        ...plan,
        status: 'Pending',
        flightDetails: plan.flightDetails,
        costBreakdown: plan.costBreakdown,
        recoverySteps: plan.recoverySteps,
        assignedCrew: plan.assignedCrew,
      });
      setPlans(plans.map(p => p.id === plan.id ? { ...p, status: 'Pending' } : p));
      setSelectedPlan({ ...plan, status: 'Pending' });
    } catch (error) {
      console.error("Failed to execute plan:", error);
    }
  }

  const handleViewDetails = async (plan) => {
    try {
      const detailedPlan = await databaseService.getFlightDisruptionDetails(plan.id);
      setSelectedPlan(detailedPlan);
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      // Fallback to showing the plan with available data if details fetch fails
      setSelectedPlan(plan);
    }
  }

  const refreshPlans = async () => {
    setLoading(true);
    try {
      const data = await databaseService.getPendingSolutions();
      setPlans(data);
    } catch (error) {
      console.error("Failed to refresh pending solutions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatIST = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pending Recovery Solutions</h2>
          <p className="text-muted-foreground">
            Recovery plans submitted for approval and management review
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshPlans} className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

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
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">Loading Plans...</h3>
                  <p className="text-muted-foreground">
                    Fetching the latest recovery plans from the database.
                  </p>
                </CardContent>
              </Card>
            ) : sortedPlans.length > 0 ? (
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
                              value={Math.min(100, Math.round((Math.round(selectedPlan.estimatedCost / selectedPlan.affectedPassengers) / 287) * 100))} 
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