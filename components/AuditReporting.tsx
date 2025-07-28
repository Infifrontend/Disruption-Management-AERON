'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter,
  Clock,
  Users,
  Plane,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  Target,
  Eye,
  FileSpreadsheet,
  Mail,
  Printer,
  Plus,
  Sparkles,
  Send,
  X,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'

// Mock data for comprehensive reporting
const solutionAnalytics = {
  totalDecisions: 148,
  timeRange: 'Last 30 days',
  solutionAdoption: {
    optionA: { suggested: 45, opted: 38, adoptionRate: 84.4 },
    optionB: { suggested: 52, opted: 41, adoptionRate: 78.8 },
    optionC: { suggested: 51, opted: 47, adoptionRate: 92.2 }
  },
  costSavings: {
    totalPotential: 2450000,
    actualRealized: 2180000,
    savingsRate: 88.9
  },
  efficiencyMetrics: {
    averageDecisionTime: '12.3 minutes',
    automationRate: 67.2,
    overrideRate: 15.4,
    successRate: 94.1
  }
}

const detailedReports = [
  {
    id: 'RPT-2025-001',
    title: 'Weekly Solution Comparison Analysis',
    date: '2025-06-06',
    type: 'Solution Comparison',
    status: 'Generated',
    size: '2.4 MB',
    format: 'PDF',
    description: 'Comprehensive analysis of recovery solutions with cost-benefit breakdown'
  },
  {
    id: 'RPT-2025-002',
    title: 'Cost Implication Trends - Q2 2025',
    date: '2025-06-05',
    type: 'Cost Analysis',
    status: 'Scheduled',
    size: '1.8 MB',
    format: 'Excel',
    description: 'Quarterly cost trends and budget impact analysis'
  },
  {
    id: 'RPT-2025-003',
    title: 'Decision Making Patterns Report',
    date: '2025-06-04',
    type: 'Decision Analytics',
    status: 'Generated',
    size: '3.1 MB',
    format: 'PDF',
    description: 'Analysis of decision-making trends and operational efficiency patterns'
  }
]

const costTrends = [
  { period: 'Week 1', suggested: 245000, actual: 220000, savings: 25000 },
  { period: 'Week 2', suggested: 312000, actual: 289000, savings: 23000 },
  { period: 'Week 3', suggested: 198000, actual: 185000, savings: 13000 },
  { period: 'Week 4', suggested: 267000, actual: 241000, savings: 26000 }
]

const decisionPatterns = [
  { 
    pattern: 'Weather Disruptions', 
    frequency: 34, 
    avgCost: 45200, 
    preferredSolution: 'Option A',
    successRate: 91.2,
    trend: 'up'
  },
  { 
    pattern: 'Crew Constraints', 
    frequency: 28, 
    avgCost: 38900, 
    preferredSolution: 'Option B',
    successRate: 87.5,
    trend: 'stable'
  },
  { 
    pattern: 'Aircraft Technical', 
    frequency: 22, 
    avgCost: 52100, 
    preferredSolution: 'Option C',
    successRate: 95.4,
    trend: 'down'
  },
  { 
    pattern: 'Airport Disruptions', 
    frequency: 19, 
    avgCost: 41700, 
    preferredSolution: 'Option A',
    successRate: 89.3,
    trend: 'up'
  }
]

export function AuditReporting() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filterType, setFilterType] = useState('all')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [exportFormat, setExportFormat] = useState('pdf')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [reportDescription, setReportDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState(detailedReports)

  const handleExportReport = (reportId, format) => {
    // Mock export functionality
    alert(`Exporting report ${reportId} as ${format.toUpperCase()}`)
  }

  const handleBulkExport = () => {
    alert(`Exporting analytics dashboard as ${exportFormat.toUpperCase()}`)
  }

  const handleGenerateReport = async () => {
    if (!reportDescription.trim()) return
    
    setIsGenerating(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate a new report based on the description
    const newReport = {
      id: `RPT-2025-${String(generatedReports.length + 1).padStart(3, '0')}`,
      title: generateReportTitle(reportDescription),
      date: new Date().toISOString().split('T')[0],
      type: determineReportType(reportDescription),
      status: 'Generated',
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      format: 'PDF',
      description: reportDescription.trim(),
      generated: true
    }
    
    setGeneratedReports(prev => [newReport, ...prev])
    setReportDescription('')
    setIsGenerating(false)
    setShowGenerateModal(false)
  }

  const generateReportTitle = (description) => {
    // Simple AI-like title generation based on keywords
    const keywords = description.toLowerCase()
    
    if (keywords.includes('cost') && keywords.includes('analysis')) {
      return 'AI-Generated Cost Analysis Report'
    } else if (keywords.includes('passenger') && keywords.includes('satisfaction')) {
      return 'Passenger Satisfaction Analysis Report'
    } else if (keywords.includes('fuel') && keywords.includes('optimization')) {
      return 'Fuel Optimization Performance Report'
    } else if (keywords.includes('maintenance') && keywords.includes('schedule')) {
      return 'Maintenance Scheduling Efficiency Report'
    } else if (keywords.includes('delay') || keywords.includes('disruption')) {
      return 'Delay Impact Analysis Report'
    } else if (keywords.includes('crew') && keywords.includes('utilization')) {
      return 'Crew Utilization Optimization Report'
    } else if (keywords.includes('revenue') || keywords.includes('profit')) {
      return 'Revenue Impact Analysis Report'
    } else if (keywords.includes('seasonal') || keywords.includes('trend')) {
      return 'Seasonal Trends Analysis Report'
    } else {
      return 'Custom Analysis Report'
    }
  }

  const determineReportType = (description) => {
    const keywords = description.toLowerCase()
    
    if (keywords.includes('cost')) return 'Cost Analysis'
    if (keywords.includes('passenger')) return 'Passenger Analytics'
    if (keywords.includes('fuel')) return 'Fuel Analytics'
    if (keywords.includes('maintenance')) return 'Maintenance Analytics'
    if (keywords.includes('crew')) return 'Crew Analytics'
    if (keywords.includes('revenue') || keywords.includes('profit')) return 'Financial Analysis'
    
    return 'Custom Analysis'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reporting & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into recovery decisions and operational efficiency</p>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleBulkExport} className="flex items-center gap-2 btn-flydubai-primary">
            <Download className="h-4 w-4" />
            Export Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Solution Analysis
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Reports
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Decision Trends
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generated Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AnalyticsDashboard analytics={solutionAnalytics} />
        </TabsContent>

        <TabsContent value="solutions">
          <SolutionAnalysisPanel analytics={solutionAnalytics} />
        </TabsContent>

        <TabsContent value="costs">
          <CostReportsPanel trends={costTrends} />
        </TabsContent>

        <TabsContent value="decisions">
          <DecisionTrendsPanel patterns={decisionPatterns} />
        </TabsContent>

        <TabsContent value="reports">
          <GeneratedReportsPanel 
            reports={generatedReports}
            onExport={handleExportReport}
            onGenerateNew={() => setShowGenerateModal(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Generate New Report Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate New Report with AI
            </DialogTitle>
            <DialogDescription>
              Use AI to analyze your operational data and generate custom reports based on your specific requirements and business needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert className="border-purple-200 bg-purple-50">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>AI-Powered Report Generation:</strong> Describe what kind of report you need and our AI will analyze your data to create a comprehensive report tailored to your requirements.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="report-description">Describe your report requirements</Label>
                <Textarea
                  id="report-description"
                  placeholder="Example: Generate a cost analysis report comparing fuel optimization savings across different aircraft types for the last quarter, including seasonal trends and recommendations for winter operations..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="min-h-[120px] mt-2"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">💡 Report Ideas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto p-2 text-left"
                    onClick={() => setReportDescription("Analyze passenger satisfaction scores across different disruption types and recovery solutions, including recommendations to improve customer experience during operational challenges.")}
                  >
                    📊 Passenger satisfaction during disruptions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto p-2 text-left"
                    onClick={() => setReportDescription("Generate a comprehensive cost analysis comparing actual recovery costs vs. predicted costs for the last 6 months, broken down by disruption type and solution choice.")}
                  >
                    💰 Recovery cost analysis
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto p-2 text-left"
                    onClick={() => setReportDescription("Create a fuel optimization report showing savings achieved through AI-recommended route changes, including environmental impact and seasonal variations.")}
                  >
                    ⛽ Fuel optimization impact
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto p-2 text-left"
                    onClick={() => setReportDescription("Analyze crew utilization efficiency and rest time compliance during irregular operations, with recommendations for improving crew scheduling resilience.")}
                  >
                    👥 Crew utilization analysis
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateReport}
                disabled={!reportDescription.trim() || isGenerating}
                className="min-w-[120px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AnalyticsDashboard({ analytics }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-medium">Total Decisions</h4>
            </div>
            <p className="text-2xl font-semibold">{analytics.totalDecisions}</p>
            <p className="text-xs text-muted-foreground">{analytics.timeRange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium">Avg Adoption Rate</h4>
            </div>
            <p className="text-2xl font-semibold">85.1%</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+2.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <h4 className="text-sm font-medium">Cost Savings</h4>
            </div>
            <p className="text-2xl font-semibold">${(analytics.costSavings.actualRealized / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-muted-foreground">{analytics.costSavings.savingsRate}% of potential</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <h4 className="text-sm font-medium">Avg Decision Time</h4>
            </div>
            <p className="text-2xl font-semibold">{analytics.efficiencyMetrics.averageDecisionTime}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">-8% faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solution Opted vs Suggested */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Solution Opted vs Solution Suggested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(analytics.solutionAdoption).map(([key, data]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge className={
                      data.adoptionRate >= 90 ? 'bg-green-100 text-green-700' :
                      data.adoptionRate >= 80 ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }>
                      {data.adoptionRate}% adoption
                    </Badge>
                  </div>
                  <div className="text-right text-sm">
                    <span className="font-medium">{data.opted}</span>
                    <span className="text-muted-foreground"> of {data.suggested} suggested</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Suggested ({data.suggested})</span>
                    <span>Opted ({data.opted})</span>
                  </div>
                  <div className="relative">
                    <Progress value={100} className="h-6 bg-muted" />
                    <div 
                      className="absolute top-0 left-0 h-6 bg-[#006496] rounded-sm transition-all"
                      style={{ width: `${data.adoptionRate}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white mix-blend-difference">
                        {data.adoptionRate}% adopted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operational Efficiency Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Automation Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={analytics.efficiencyMetrics.automationRate} className="w-20 h-2" />
                <span className="text-sm font-medium">{analytics.efficiencyMetrics.automationRate}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Override Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={analytics.efficiencyMetrics.overrideRate} className="w-20 h-2" />
                <span className="text-sm font-medium">{analytics.efficiencyMetrics.overrideRate}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Success Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={analytics.efficiencyMetrics.successRate} className="w-20 h-2" />
                <span className="text-sm font-medium">{analytics.efficiencyMetrics.successRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Generate Cost Analysis Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Create Decision Trends Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Schedule Weekly Summary
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Printer className="h-4 w-4 mr-2" />
              Print Executive Summary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SolutionAnalysisPanel({ analytics }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Solution Effectiveness Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Key Insight:</strong> Option C shows highest adoption rate (92.2%) but represents premium cost solutions. 
                Consider promoting Option A for cost-sensitive scenarios.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.solutionAdoption).map(([key, data]) => (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-semibold mb-1">{data.adoptionRate}%</div>
                      <div className="text-sm text-muted-foreground">Adoption Rate</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Times Suggested</span>
                        <span className="font-medium">{data.suggested}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Times Opted</span>
                        <span className="font-medium">{data.opted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rejection Rate</span>
                        <span className="font-medium">{(100 - data.adoptionRate).toFixed(1)}%</span>
                      </div>
                    </div>

                    <Progress value={data.adoptionRate} className="h-2" />
                    
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Detailed Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Solution Comparison Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Solution</TableHead>
                      <TableHead>Suggested</TableHead>
                      <TableHead>Adopted</TableHead>
                      <TableHead>Adoption Rate</TableHead>
                      <TableHead>Avg Cost Impact</TableHead>
                      <TableHead>Customer Satisfaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Option A - Aircraft Swap</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell>38</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700">84.4%</Badge>
                      </TableCell>
                      <TableCell className="text-green-600">-$12K avg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Progress value={87} className="w-16 h-2" />
                          <span className="text-sm">87%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Option B - Route Optimization</TableCell>
                      <TableCell>52</TableCell>
                      <TableCell>41</TableCell>
                      <TableCell>
                        <Badge className="bg-orange-100 text-orange-700">78.8%</Badge>
                      </TableCell>
                      <TableCell className="text-green-600">-$18K avg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Progress value={82} className="w-16 h-2" />
                          <span className="text-sm">82%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Option C - Premium Recovery</TableCell>
                      <TableCell>51</TableCell>
                      <TableCell>47</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">92.2%</Badge>
                      </TableCell>
                      <TableCell className="text-red-600">+$8K avg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Progress value={96} className="w-16 h-2" />
                          <span className="text-sm">96%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CostReportsPanel({ trends }) {
  const totalSuggested = trends.reduce((sum, week) => sum + week.suggested, 0)
  const totalActual = trends.reduce((sum, week) => sum + week.actual, 0)
  const totalSavings = trends.reduce((sum, week) => sum + week.savings, 0)

  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Suggested Costs</h4>
            <p className="text-2xl font-semibold">${(totalSuggested / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Total system suggestions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Actual Costs</h4>
            <p className="text-2xl font-semibold">${(totalActual / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Total realized costs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Total Savings</h4>
            <p className="text-2xl font-semibold text-green-600">${(totalSavings / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">{((totalSavings / totalSuggested) * 100).toFixed(1)}% reduction</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Avg Savings/Week</h4>
            <p className="text-2xl font-semibold text-green-600">${(totalSavings / trends.length / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Weekly average</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Trends Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Suggested Cost</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Savings Rate</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trends.map((week, index) => {
                const savingsRate = ((week.savings / week.suggested) * 100).toFixed(1)
                return (
                  <TableRow key={week.period}>
                    <TableCell className="font-medium">{week.period}</TableCell>
                    <TableCell>${week.suggested.toLocaleString()}</TableCell>
                    <TableCell>${week.actual.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ${week.savings.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">
                        {savingsRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {index > 0 && trends[index].savings > trends[index - 1].savings ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : index > 0 && trends[index].savings < trends[index - 1].savings ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost Breakdown by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Cost Categories</h4>
              <div className="space-y-3">
                {[
                  { category: 'Crew Costs', amount: 285000, percentage: 32 },
                  { category: 'Charter Flights', amount: 245000, percentage: 28 },
                  { category: 'Passenger Services', amount: 156000, percentage: 18 },
                  { category: 'Fuel Adjustments', amount: 134000, percentage: 15 },
                  { category: 'Other Costs', amount: 62000, percentage: 7 }
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{item.category}</span>
                      <span className="text-sm font-medium">${(item.amount / 1000).toFixed(0)}K ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Export Options</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Detailed Cost Report (Excel)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Cost Summary (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Cost Trends Analysis (CSV)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DecisionTrendsPanel({ patterns }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Decision-Making Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Disruption Pattern</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Avg Cost</TableHead>
                <TableHead>Preferred Solution</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patterns.map((pattern) => (
                <TableRow key={pattern.pattern}>
                  <TableCell className="font-medium">{pattern.pattern}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{pattern.frequency} cases</Badge>
                  </TableCell>
                  <TableCell>${pattern.avgCost.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700">
                      {pattern.preferredSolution}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={pattern.successRate} className="w-16 h-2" />
                      <span className="text-sm">{pattern.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {pattern.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : pattern.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <div className="h-4 w-4 bg-gray-300 rounded-full" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Operational Efficiency Trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Decision Speed Improvement</span>
                  <span className="text-sm font-medium">+23%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Solution Accuracy</span>
                  <span className="text-sm font-medium">94.1%</span>
                </div>
                <Progress value={94.1} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Cost Optimization</span>
                  <span className="text-sm font-medium">88.9%</span>
                </div>
                <Progress value={88.9} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Weather disruptions show 91.2% success rate with Option A solutions
                </AlertDescription>
              </Alert>
              
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Technical issues trend toward premium solutions (Option C)
                </AlertDescription>
              </Alert>
              
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Crew constraint patterns decreasing by 12% this quarter
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GeneratedReportsPanel({ reports, onExport, onGenerateNew }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generated Reports</CardTitle>
            <Button onClick={onGenerateNew} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate New Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{report.title}</h4>
                        {report.generated && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        <Badge className={
                          report.status === 'Generated' ? 'bg-green-100 text-green-700' :
                          report.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }>
                          {report.status}
                        </Badge>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ID: {report.id}</span>
                        <span>Date: {report.date}</span>
                        <span>Size: {report.size}</span>
                        <span>Format: {report.format}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onExport(report.id, 'pdf')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <BarChart3 className="h-6 w-6 mb-1" />
              <span>Solution Comparison Report</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <DollarSign className="h-6 w-6 mb-1" />
              <span>Cost Analysis Report</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <TrendingUp className="h-6 w-6 mb-1" />
              <span>Decision Trends Report</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <CheckCircle className="h-6 w-6 mb-1" />
              <span>Efficiency Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}