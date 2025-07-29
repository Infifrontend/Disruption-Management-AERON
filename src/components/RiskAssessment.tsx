'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  CloudRain, 
  Wrench, 
  Radio,
  Users,
  Plane,
  Clock,
  MapPin,
  Thermometer,
  Wind,
  Zap,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

export function RiskAssessment() {
  const [timeframe, setTimeframe] = useState('24h')
  const [riskCategory, setRiskCategory] = useState('all')

  // Mock risk assessment data
  const overallRiskScore = 7.3
  const riskTrend = 'increasing' // increasing, decreasing, stable

  const criticalRiskFactors = [
    {
      id: 1,
      name: 'Severe Weather System',
      category: 'Weather',
      severity: 'Critical',
      probability: 92,
      impact: 'Very High',
      affected: {
        flights: 34,
        passengers: 8947,
        routes: ['JFK-DXB', 'EWR-DXB', 'BOS-DXB']
      },
      timeline: '2-6 hours',
      description: 'Major thunderstorm system approaching Northeast US airports',
      mitigation: 'Pre-positioning aircraft, crew scheduling adjustments',
      trend: 'increasing',
      riskScore: 9.2
    },
    {
      id: 2,
      name: 'Aircraft Maintenance Overrun',
      category: 'Maintenance',
      severity: 'High',
      probability: 78,
      impact: 'High',
      affected: {
        flights: 12,
        passengers: 3456,
        routes: ['LHR-DXB', 'CDG-DXB']
      },
      timeline: '4-8 hours',
      description: 'C-check maintenance on A6-EUA may extend beyond scheduled window',
      mitigation: 'Alternative aircraft assignment, passenger rebooking',
      trend: 'stable',
      riskScore: 8.1
    },
    {
      id: 3,
      name: 'ATC Slot Restrictions',
      category: 'Air Traffic',
      severity: 'Medium',
      probability: 65,
      impact: 'Medium',
      affected: {
        flights: 18,
        passengers: 4523,
        routes: ['FRA-DXB', 'MUC-DXB', 'ZUR-DXB']
      },
      timeline: '6-12 hours',
      description: 'European ATC implementing flow control measures',
      mitigation: 'Route optimization, delay minimization strategies',
      trend: 'decreasing',
      riskScore: 6.4
    },
    {
      id: 4,
      name: 'Crew Duty Time Limits',
      category: 'Crew',
      severity: 'Medium',
      probability: 71,
      impact: 'Medium',
      affected: {
        flights: 8,
        passengers: 2134,
        routes: ['SYD-DXB', 'MEL-DXB']
      },
      timeline: '8-16 hours',
      description: 'Multiple crew members approaching maximum duty time',
      mitigation: 'Reserve crew activation, schedule adjustments',
      trend: 'increasing',
      riskScore: 6.8
    }
  ]

  const riskCategories = [
    {
      category: 'Weather',
      count: 15,
      avgSeverity: 8.2,
      trend: 'increasing',
      topRisk: 'Thunderstorms at JFK',
      affectedFlights: 47
    },
    {
      category: 'Maintenance',
      count: 8,
      avgSeverity: 7.1,
      trend: 'stable',
      topRisk: 'C-check overrun',
      affectedFlights: 23
    },
    {
      category: 'Air Traffic',
      count: 12,
      avgSeverity: 6.4,
      trend: 'decreasing',
      topRisk: 'European flow control',
      affectedFlights: 31
    },
    {
      category: 'Crew',
      count: 6,
      avgSeverity: 6.8,
      trend: 'increasing',
      topRisk: 'Duty time limits',
      affectedFlights: 15
    },
    {
      category: 'Ground Operations',
      count: 4,
      avgSeverity: 5.2,
      trend: 'stable',
      topRisk: 'Ground handling delays',
      affectedFlights: 9
    }
  ]

  const mitigationActions = [
    {
      id: 1,
      action: 'Pre-position Aircraft at Alternate Airports',
      category: 'Weather',
      status: 'In Progress',
      effectiveness: 85,
      costImpact: 45000,
      timeline: '2 hours',
      assignedTo: 'Operations Team A'
    },
    {
      id: 2,
      action: 'Activate Reserve Crew Pool',
      category: 'Crew',
      status: 'Planned',
      effectiveness: 92,
      costImpact: 28000,
      timeline: '4 hours',
      assignedTo: 'Crew Scheduling'
    },
    {
      id: 3,
      action: 'Implement Alternative Routing',
      category: 'Air Traffic',
      status: 'Active',
      effectiveness: 78,
      costImpact: 12000,
      timeline: '1 hour',
      assignedTo: 'Flight Planning'
    },
    {
      id: 4,
      action: 'Expedite Maintenance Procedures',
      category: 'Maintenance',
      status: 'In Progress',
      effectiveness: 65,
      costImpact: 67000,
      timeline: '6 hours',
      assignedTo: 'Maintenance Team'
    }
  ]

  const riskTimeline = [
    { time: '14:00', riskScore: 6.8, events: ['Weather system detected'] },
    { time: '15:00', riskScore: 7.1, events: ['ATC restrictions announced'] },
    { time: '16:00', riskScore: 7.5, events: ['Maintenance issue identified'] },
    { time: '17:00', riskScore: 7.3, events: ['Mitigation actions started'] },
    { time: '18:00', riskScore: 7.3, events: ['Current status'] }
  ]

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Weather': return <CloudRain className="h-5 w-5" />
      case 'Maintenance': return <Wrench className="h-5 w-5" />
      case 'Air Traffic': return <Radio className="h-5 w-5" />
      case 'Crew': return <Users className="h-5 w-5" />
      case 'Ground Operations': return <MapPin className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Planned': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Risk Assessment</h2>
          <p className="text-muted-foreground">Comprehensive risk analysis and mitigation planning for flight operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">Next 6h</SelectItem>
              <SelectItem value="12h">Next 12h</SelectItem>
              <SelectItem value="24h">Next 24h</SelectItem>
              <SelectItem value="48h">Next 48h</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Risk Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>High Risk Alert:</strong> Overall risk score is {overallRiskScore}/10. {criticalRiskFactors.filter(r => r.severity === 'Critical').length} critical risk factors detected requiring immediate attention.
        </AlertDescription>
      </Alert>

      {/* Overall Risk Score */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-200 rounded-lg">
                <Shield className="h-8 w-8 text-red-700" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-red-900">Risk Score: {overallRiskScore}/10</h3>
                <p className="text-red-700">Current operational risk level</p>
                <div className="flex items-center gap-2 mt-1">
                  {getTrendIcon(riskTrend)}
                  <span className="text-sm text-red-600 capitalize">{riskTrend} trend</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-700">{criticalRiskFactors.length}</p>
                  <p className="text-xs text-red-600">Active Risks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-700">{criticalRiskFactors.reduce((sum, r) => sum + r.affected.flights, 0)}</p>
                  <p className="text-xs text-red-600">Flights at Risk</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallRiskScore * 10} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="factors" className="w-full">
        <TabsList className="grid w-full grid-cols-4 pb-1 pt-2 mb-[10px]">
          <TabsTrigger value="factors" className="pb-3 pt-1">Risk Factors</TabsTrigger>
          <TabsTrigger value="categories" className="pb-3 pt-1">Categories</TabsTrigger>
          <TabsTrigger value="mitigation" className="pb-3 pt-1">Mitigation</TabsTrigger>
          <TabsTrigger value="timeline" className="pb-3 pt-1">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="factors" className="space-y-6">
          <div className="space-y-4">
            {criticalRiskFactors.map((risk) => (
              <Card key={risk.id} className="border-l-4 border-l-red-400">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {getCategoryIcon(risk.category)}
                      <div>
                        <h4 className="font-semibold text-lg">{risk.name}</h4>
                        <p className="text-muted-foreground">{risk.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Timeline: {risk.timeline}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(risk.trend)}
                            <span className="text-sm capitalize">{risk.trend}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-red-100 rounded-lg p-3 mb-2">
                        <p className="text-2xl font-semibold text-red-700">{risk.riskScore}</p>
                        <p className="text-xs text-red-600">Risk Score</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3">Risk Metrics</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Probability</span>
                          <div className="flex items-center gap-2">
                            <Progress value={risk.probability} className="w-20" />
                            <span className="font-semibold">{risk.probability}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Impact Level</span>
                          <span className="font-semibold">{risk.impact}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-3">Affected Operations</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Flights</span>
                          <span className="font-semibold">{risk.affected.flights}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Passengers</span>
                          <span className="font-semibold">{risk.affected.passengers.toLocaleString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Routes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {risk.affected.routes.map((route, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {route}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h6 className="font-medium text-blue-900 mb-1">Mitigation Strategy</h6>
                    <p className="text-sm text-blue-800">{risk.mitigation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riskCategories.map((category, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {getCategoryIcon(category.category)}
                    <div>
                      <h4 className="font-semibold">{category.category}</h4>
                      <p className="text-sm text-muted-foreground">{category.count} active risks</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Severity</span>
                      <div className="flex items-center gap-2">
                        <Progress value={category.avgSeverity * 10} className="w-16" />
                        <span className="font-semibold">{category.avgSeverity}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trend</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(category.trend)}
                        <span className="text-sm capitalize">{category.trend}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Affected Flights</span>
                      <span className="font-semibold">{category.affectedFlights}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Top Risk:</p>
                    <p className="text-sm text-muted-foreground">{category.topRisk}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Mitigation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mitigationActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">{action.action}</h5>
                        <p className="text-sm text-muted-foreground">Category: {action.category}</p>
                        <p className="text-sm text-muted-foreground">Assigned to: {action.assignedTo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Effectiveness</p>
                        <p className="font-semibold">{action.effectiveness}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Cost Impact</p>
                        <p className="font-semibold">${(action.costImpact / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Timeline</p>
                        <p className="font-semibold">{action.timeline}</p>
                      </div>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskTimeline.map((entry, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-center min-w-0">
                      <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                      <p className="font-mono text-sm">{entry.time}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">Risk Score: {entry.riskScore}</span>
                        <Progress value={entry.riskScore * 10} className="w-24" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.events.map((event, eventIndex) => (
                          <Badge key={eventIndex} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}