'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Clock, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react'

export function PredictionAnalytics() {
  const [timeRange, setTimeRange] = useState('7d')
  const [modelType, setModelType] = useState('all')

  // Mock analytics data
  const modelPerformance = {
    accuracy: 92.4,
    precision: 89.7,
    recall: 95.1,
    f1Score: 92.3,
    totalPredictions: 1247,
    correctPredictions: 1152,
    falsePositives: 38,
    falseNegatives: 57
  }

  const trendData = [
    { period: 'Week 1', accuracy: 88.2, predictions: 167, prevented: 23 },
    { period: 'Week 2', accuracy: 90.1, predictions: 189, prevented: 28 },
    { period: 'Week 3', accuracy: 91.7, predictions: 203, prevented: 31 },
    { period: 'Week 4', accuracy: 92.4, predictions: 178, prevented: 27 },
    { period: 'Week 5', accuracy: 93.2, predictions: 221, prevented: 34 },
    { period: 'Week 6', accuracy: 91.8, predictions: 145, prevented: 22 },
    { period: 'Week 7', accuracy: 92.4, predictions: 144, prevented: 21 }
  ]

  const causeAnalysis = [
    { cause: 'Weather', predictions: 456, accuracy: 94.2, impact: 'Very High', trend: 'increasing' },
    { cause: 'Maintenance', predictions: 298, accuracy: 91.7, impact: 'High', trend: 'stable' },
    { cause: 'Air Traffic Control', predictions: 223, accuracy: 89.4, impact: 'Medium', trend: 'decreasing' },
    { cause: 'Crew Issues', predictions: 145, accuracy: 87.8, impact: 'Medium', trend: 'stable' },
    { cause: 'Ground Operations', predictions: 89, accuracy: 85.3, impact: 'Low', trend: 'increasing' },
    { cause: 'Technical Issues', predictions: 67, accuracy: 90.1, impact: 'High', trend: 'stable' }
  ]

  const routePerformance = [
    { route: 'JFK-DXB', predictions: 45, accuracy: 95.6, avgLeadTime: 7.2, costSaved: 245000 },
    { route: 'LHR-DXB', predictions: 38, accuracy: 92.1, avgLeadTime: 6.8, costSaved: 198000 },
    { route: 'LAX-DXB', predictions: 31, accuracy: 89.7, avgLeadTime: 5.9, costSaved: 167000 },
    { route: 'DXB-SIN', predictions: 28, accuracy: 94.3, avgLeadTime: 6.4, costSaved: 145000 },
    { route: 'FRA-DXB', predictions: 24, accuracy: 88.9, avgLeadTime: 5.5, costSaved: 123000 }
  ]

  const timePerformance = [
    { timeSlot: '00:00-06:00', predictions: 89, accuracy: 94.4, avgDelay: 45 },
    { timeSlot: '06:00-12:00', predictions: 198, accuracy: 91.2, avgDelay: 67 },
    { timeSlot: '12:00-18:00', predictions: 234, accuracy: 90.8, avgDelay: 72 },
    { timeSlot: '18:00-24:00', predictions: 156, accuracy: 93.6, avgDelay: 58 }
  ]

  const impactMetrics = {
    totalCostSaved: 2.8,
    disruptionsPrevented: 187,
    passengersProtected: 24589,
    avgResponseTime: 12.3,
    operationalEfficiency: 18.7
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Very High': return 'text-red-600'
      case 'High': return 'text-orange-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIndicator = (trend) => {
    switch (trend) {
      case 'increasing': return '↗️'
      case 'decreasing': return '↘️'
      default: return '➡️'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prediction Analytics</h2>
          <p className="text-muted-foreground">Advanced analytics and performance metrics for disruption prediction models</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
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

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Target className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Model Accuracy</p>
                <p className="text-2xl font-semibold text-blue-900">{modelPerformance.accuracy}%</p>
                <p className="text-xs text-blue-600">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-green-600">Precision Rate</p>
                <p className="text-2xl font-semibold text-green-900">{modelPerformance.precision}%</p>
                <p className="text-xs text-green-600">True positive rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Brain className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-600">F1 Score</p>
                <p className="text-2xl font-semibold text-purple-900">{modelPerformance.f1Score}%</p>
                <p className="text-xs text-purple-600">Balanced metric</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-200 rounded-lg">
                <Activity className="h-5 w-5 text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-orange-600">Total Predictions</p>
                <p className="text-2xl font-semibold text-orange-900">{modelPerformance.totalPredictions.toLocaleString()}</p>
                <p className="text-xs text-orange-600">This period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance" className="pb-3">Performance</TabsTrigger>
          <TabsTrigger value="trends" className="pb-3">Trends</TabsTrigger>
          <TabsTrigger value="causes" className="pb-3">Cause Analysis</TabsTrigger>
          <TabsTrigger value="routes" className="pb-3">Route Performance</TabsTrigger>
          <TabsTrigger value="impact" className="pb-3">Business Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Detailed Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Accuracy</span>
                  <div className="flex items-center gap-2">
                    <Progress value={modelPerformance.accuracy} className="w-20" />
                    <span className="font-semibold">{modelPerformance.accuracy}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Precision</span>
                  <div className="flex items-center gap-2">
                    <Progress value={modelPerformance.precision} className="w-20" />
                    <span className="font-semibold">{modelPerformance.precision}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recall</span>
                  <div className="flex items-center gap-2">
                    <Progress value={modelPerformance.recall} className="w-20" />
                    <span className="font-semibold">{modelPerformance.recall}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">F1 Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={modelPerformance.f1Score} className="w-20" />
                    <span className="font-semibold">{modelPerformance.f1Score}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-semibold text-green-700">{modelPerformance.correctPredictions}</p>
                    <p className="text-sm text-green-600">Correct Predictions</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-2xl font-semibold text-red-700">{modelPerformance.falsePositives + modelPerformance.falseNegatives}</p>
                    <p className="text-sm text-red-600">Incorrect Predictions</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-yellow-700">{modelPerformance.falsePositives}</p>
                    <p className="text-xs text-yellow-600">False Positives</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-semibold text-orange-700">{modelPerformance.falseNegatives}</p>
                    <p className="text-xs text-orange-600">False Negatives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time-based Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Time of Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timePerformance.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{slot.timeSlot}</p>
                        <p className="text-sm text-muted-foreground">{slot.predictions} predictions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="font-semibold">{slot.accuracy}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Avg Delay</p>
                        <p className="font-semibold">{slot.avgDelay} min</p>
                      </div>
                      <Progress value={slot.accuracy} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{week.period}</p>
                      <p className="text-sm text-muted-foreground">{week.predictions} predictions</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="font-semibold">{week.accuracy}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Prevented</p>
                        <p className="font-semibold text-green-600">{week.prevented}</p>
                      </div>
                      <Progress value={week.accuracy} className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Accuracy by Cause</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {causeAnalysis.map((cause, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{cause.cause}</p>
                        <p className="text-sm text-muted-foreground">{cause.predictions} predictions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="font-semibold">{cause.accuracy}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Impact</p>
                        <p className={`font-semibold ${getImpactColor(cause.impact)}`}>{cause.impact}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Trend</p>
                        <p className="font-semibold">{getTrendIndicator(cause.trend)}</p>
                      </div>
                      <Progress value={cause.accuracy} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route-Specific Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routePerformance.map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium font-mono">{route.route}</p>
                      <p className="text-sm text-muted-foreground">{route.predictions} predictions</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="font-semibold">{route.accuracy}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Lead Time</p>
                        <p className="font-semibold">{route.avgLeadTime}h</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Cost Saved</p>
                        <p className="font-semibold text-green-600">${(route.costSaved / 1000).toFixed(0)}K</p>
                      </div>
                      <Progress value={route.accuracy} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <p className="text-3xl font-semibold text-green-700">${impactMetrics.totalCostSaved}M</p>
                <p className="text-sm text-green-600">Total Cost Savings</p>
                <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="text-3xl font-semibold text-blue-700">{impactMetrics.disruptionsPrevented}</p>
                <p className="text-sm text-blue-600">Disruptions Prevented</p>
                <p className="text-xs text-muted-foreground mt-1">Through early intervention</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <p className="text-3xl font-semibold text-purple-700">{impactMetrics.passengersProtected.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Passengers Protected</p>
                <p className="text-xs text-muted-foreground mt-1">From disruptions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Average Response Time</span>
                  <span className="font-semibold">{impactMetrics.avgResponseTime} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Efficiency Improvement</span>
                  <span className="font-semibold text-green-600">+{impactMetrics.operationalEfficiency}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Prevention Rate</span>
                  <span className="font-semibold">{((impactMetrics.disruptionsPrevented / modelPerformance.totalPredictions) * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-semibold text-green-700">487%</p>
                  <p className="text-sm text-green-600">Return on Investment</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="font-semibold">$2.8M</p>
                    <p className="text-xs text-muted-foreground">Benefits</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">$0.58M</p>
                    <p className="text-xs text-muted-foreground">Investment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}