'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Plane, 
  CloudRain, 
  Wrench, 
  Users,
  Target,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Calendar,
  RefreshCw
} from 'lucide-react'

export function DisruptionPredictionDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  // Mock prediction data
  const predictionStats = {
    totalPredictions: 47,
    highRisk: 18,
    mediumRisk: 19,
    lowRisk: 10,
    accuracy: 92.4,
    avgLeadTime: 6.2,
    preventedDisruptions: 23,
    costSavings: 1.2
  }

  const riskFactors = [
    { 
      id: 1, 
      name: 'Weather Conditions', 
      impact: 'High', 
      affected: 28, 
      trend: 'up',
      description: 'Severe thunderstorms predicted at JFK, LGA',
      probability: 87
    },
    { 
      id: 2, 
      name: 'Air Traffic Control', 
      impact: 'Medium', 
      affected: 15, 
      trend: 'stable',
      description: 'ATC delays expected during peak hours',
      probability: 62
    },
    { 
      id: 3, 
      name: 'Aircraft Maintenance', 
      impact: 'High', 
      affected: 12, 
      trend: 'down',
      description: 'Scheduled maintenance may extend beyond window',
      probability: 78
    },
    { 
      id: 4, 
      name: 'Crew Availability', 
      impact: 'Medium', 
      affected: 8, 
      trend: 'up',
      description: 'Crew duty time limits approaching',
      probability: 54
    }
  ]

  const upcomingDisruptions = [
    {
      id: 'PRED-001',
      flightNumber: 'EK215',
      route: 'JFK-DXB',
      scheduledTime: '08:30',
      predictedDelay: 120,
      probability: 87,
      cause: 'Weather',
      passengers: 347,
      status: 'High Risk'
    },
    {
      id: 'PRED-002',
      flightNumber: 'EK147',
      route: 'DXB-SIN',
      scheduledTime: '21:30',
      predictedDelay: 45,
      probability: 72,
      cause: 'ATC',
      passengers: 298,
      status: 'Medium Risk'
    },
    {
      id: 'PRED-003',
      flightNumber: 'EK456',
      route: 'LHR-DXB',
      scheduledTime: '10:15',
      predictedDelay: 90,
      probability: 91,
      cause: 'Maintenance',
      passengers: 412,
      status: 'High Risk'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'High Risk': return 'bg-red-100 text-red-700 border-red-200'
      case 'Medium Risk': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Low Risk': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-red-500" />
      case 'down': return <ArrowDown className="h-3 w-3 text-green-500" />
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Disruption Prediction Dashboard</h2>
          <p className="text-muted-foreground">AI-powered flight disruption forecasting and risk assessment</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Brain className="h-3 w-3 mr-1" />
            AI Model Active
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Predictions
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>High Risk Alert:</strong> 18 flights predicted to be disrupted in the next 24 hours. Weather conditions at JFK are primary concern.
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Brain className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Total Predictions</p>
                <p className="text-2xl font-semibold text-purple-900">{predictionStats.totalPredictions}</p>
                <p className="text-xs text-purple-600">Next 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-red-600">High Risk Flights</p>
                <p className="text-2xl font-semibold text-red-900">{predictionStats.highRisk}</p>
                <p className="text-xs text-red-600">Immediate attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <Target className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-600">Model Accuracy</p>
                <p className="text-2xl font-semibold text-green-900">{predictionStats.accuracy}%</p>
                <p className="text-xs text-green-600">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Avg Lead Time</p>
                <p className="text-2xl font-semibold text-blue-900">{predictionStats.avgLeadTime}h</p>
                <p className="text-xs text-blue-600">Prediction window</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Risk Distribution Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Flight Risk Levels</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">High Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{predictionStats.highRisk}</span>
                    <div className="w-20">
                      <Progress value={(predictionStats.highRisk / predictionStats.totalPredictions) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{predictionStats.mediumRisk}</span>
                    <div className="w-20">
                      <Progress value={(predictionStats.mediumRisk / predictionStats.totalPredictions) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Low Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{predictionStats.lowRisk}</span>
                    <div className="w-20">
                      <Progress value={(predictionStats.lowRisk / predictionStats.totalPredictions) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Impact Metrics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm text-green-600">Prevented Disruptions</p>
                    <p className="text-lg font-semibold text-green-900">{predictionStats.preventedDisruptions}</p>
                  </div>
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm text-blue-600">Cost Savings</p>
                    <p className="text-lg font-semibold text-blue-900">${predictionStats.costSavings}M</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(factor.trend)}
                    <div>
                      <h4 className="font-medium">{factor.name}</h4>
                      <p className="text-sm text-muted-foreground">{factor.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Affected Flights</p>
                    <p className="font-semibold">{factor.affected}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Probability</p>
                    <p className="font-semibold">{factor.probability}%</p>
                  </div>
                  <Badge className={
                    factor.impact === 'High' ? 'bg-red-100 text-red-700' : 
                    factor.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'
                  }>
                    {factor.impact}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming High-Risk Disruptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Upcoming High-Risk Disruptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingDisruptions.map((disruption) => (
              <div key={disruption.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold">{disruption.flightNumber}</span>
                      <span className="text-sm text-muted-foreground">{disruption.route}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Scheduled: {disruption.scheduledTime}</span>
                      <span>Cause: {disruption.cause}</span>
                      <span>{disruption.passengers} passengers</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Predicted Delay</p>
                    <p className="font-semibold text-red-600">{disruption.predictedDelay} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Probability</p>
                    <p className="font-semibold">{disruption.probability}%</p>
                  </div>
                  <Badge className={getStatusColor(disruption.status)}>
                    {disruption.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Showing 3 of 18 high-risk predictions</p>
            <Button variant="outline" size="sm">
              View All Predictions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}