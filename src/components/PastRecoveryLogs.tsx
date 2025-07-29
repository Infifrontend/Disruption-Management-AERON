'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { 
  Search, 
  Filter, 
  Calendar, 
  Download,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Plane,
  RefreshCw
} from 'lucide-react'
import { databaseService } from '../services/databaseService'

interface RecoveryLog {
  solution_id: string
  disruption_id: string
  flight_number: string
  route: string
  aircraft: string
  disruption_type: string
  disruption_reason: string
  priority: string
  date_created: string
  date_executed: string
  date_completed: string
  duration: string
  status: string
  affected_passengers: number
  actual_cost: number
  estimated_cost: number
  cost_variance: number
  otp_impact: number
  solution_chosen: string
  total_options: number
  executed_by: string
  approved_by: string
  passenger_satisfaction: number
  rebooking_success: number
  categorization: string
  cancellation_avoided: boolean
  potential_delay_minutes: number
  actual_delay_minutes: number
  delay_reduction_minutes: number
  disruption_category: string
  recovery_efficiency: number
  network_impact: string
  downstream_flights_affected: number
  details: any
  created_at: string
}

export function PastRecoveryLogs() {
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<RecoveryLog | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    dateRange: 'all',
    search: ''
  })

  useEffect(() => {
    fetchRecoveryLogs()
    const interval = setInterval(fetchRecoveryLogs, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchRecoveryLogs = async () => {
    try {
      const data = await databaseService.getPastRecoveryLogs()
      setRecoveryLogs(data)
    } catch (error) {
      console.error('Error fetching recovery logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    'Successful': 'bg-green-100 text-green-800',
    'Partial': 'bg-yellow-100 text-yellow-800', 
    'Failed': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  }

const filteredLogs = recoveryLogs.filter(log => {
    if (filters.status !== 'all' && log.status !== filters.status) return false
    if (filters.category !== 'all' && log.categorization !== filters.category) return false
    if (filters.priority !== 'all' && log.priority !== filters.priority) return false
    if (filters.search && !log.flight_number.toLowerCase().includes(filters.search.toLowerCase()) && 
        !log.route.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDuration = (duration: string | null) => {
    if (!duration) return 'N/A'
    // Parse PostgreSQL interval format or return as-is
    return duration
  }

const totalLogs = filteredLogs.length
  const successfulLogs = filteredLogs.filter(log => log.status === 'Successful').length
  const totalSavings = filteredLogs.reduce((sum, log) => {
    const estimated = log.estimated_cost || 0
    const actual = log.actual_cost || 0
    return sum + (estimated - actual)
  }, 0)
  const avgSatisfaction = totalLogs > 0 
    ? filteredLogs.reduce((sum, log) => sum + (log.passenger_satisfaction || 0), 0) / totalLogs 
    : 0

if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading recovery logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Past Recovery Logs</h2>
          <p className="text-muted-foreground">
            Historical analysis of recovery solutions and their outcomes ({totalLogs} records)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRecoveryLogs} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalLogs}</p>
                <p className="text-xs text-muted-foreground">Total Solutions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {totalLogs > 0 ? ((successfulLogs / totalLogs) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
                <p className="text-xs text-muted-foreground">Total Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/10</p>
                <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Successful">Successful</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ATC/weather delay">ATC/Weather</SelectItem>
              <SelectItem value="Crew issue (e.g., sick report, duty time breach)">Crew</SelectItem>
              <SelectItem value="Aircraft issue (e.g., AOG)">Aircraft</SelectItem>
              <SelectItem value="Airport curfew/ramp congestion">Airport</SelectItem>
              <SelectItem value="Rotation misalignment or maintenance hold">Rotation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateRange">Date Range</Label>
          <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search flight or route..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Log Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLogs.map((log) => (
              <Card 
                key={log.solution_id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedLog(log)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-lg">{log.flight_number}</span>
                        <span className="text-sm text-muted-foreground">{log.route}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{formatDate(log.date_created)}</span>
                        <span className="text-xs text-muted-foreground">{log.disruption_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[log.status] || 'bg-gray-100 text-gray-800'}>
                        {log.status}
                      </Badge>
                      <Badge variant="outline">
                        {log.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration</span>
                      <p className="font-medium">{formatDuration(log.duration)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost</span>
                      <p className="font-medium">{formatCurrency(log.actual_cost || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passengers</span>
                      <p className="font-medium">{log.affected_passengers}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Satisfaction</span>
                      <p className="font-medium">{(log.passenger_satisfaction || 0).toFixed(1)}/10</p>
                    </div>
                  </div>

                  {log.solution_chosen && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Solution: {log.solution_chosen}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-3xl w-full mx-4">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Solution Details - {selectedLog.solution_id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Flight: {selectedLog.flight_number}</p>
              <p>Route: {selectedLog.route}</p>
              <p>Status: {selectedLog.status}</p>
              <Button onClick={() => setSelectedLog(null)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}