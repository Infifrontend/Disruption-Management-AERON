'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Input } from './components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Alert, AlertDescription } from './components/ui/alert'
import { Progress } from './components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Separator } from './components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { AlertTriangle, Plane, Users, Clock, TrendingUp, Settings, FileText, Plus, Filter, BarChart3, Download, UserCheck, ClockIcon, CheckSquare, Menu, X, Zap, Wrench, Fuel, Calendar, Brain, Activity, Shield, Target, Hotel, Eye, DollarSign, Timer, Star, CheckCircle, XCircle, Info, AlertCircle, TrendingDown, RotateCcw, PlayCircle, ArrowRight, Network, GitBranch, Package, Calculator, Route, MapPin, Phone, Mail, Bell } from 'lucide-react'
// Placeholder logo - replace with actual flydubai logo URL
const flydubaiLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDA2NkNDIi8+Cjx0ZXh0IHg9IjUwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Zmx5ZHViYWk8L3RleHQ+Cjwvc3ZnPgo='
import { WorldMap } from './components/WorldMap'
import { KPIWidgets } from './components/KPIWidgets'
import { DisruptionInput } from './components/DisruptionInput'
import { RecoveryOptionsGenerator } from './components/RecoveryOptionsGenerator'
import { ComparisonMatrix } from './components/ComparisonMatrix'
import { DetailedRecoveryPlan } from './components/DetailedRecoveryPlan'
import { SettingsPanel } from './components/SettingsPanel'
import { AuditReporting } from './components/AuditReporting'
import { PassengerRebooking } from './components/PassengerRebooking'
import { PendingSolutions } from './components/PendingSolutions'
import { PastRecoveryLogs } from './components/PastRecoveryLogs'
import { AircraftMaintenance } from './components/AircraftMaintenance'
import { FuelOptimization } from './components/FuelOptimization'
import { FlightTrackingGantt } from './components/FlightTrackingGantt'
import { DisruptionPredictionDashboard } from './components/DisruptionPredictionDashboard'
import { FlightDisruptionList } from './components/FlightDisruptionList'
import { PredictionAnalytics } from './components/PredictionAnalytics'
import { RiskAssessment } from './components/RiskAssessment'
import { HOTACManagement } from './components/HOTACManagement'

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [selectedDisruption, setSelectedDisruption] = useState(null)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [selectedRecoveryPlan, setSelectedRecoveryPlan] = useState(null)
  const [passengerServicesContext, setPassengerServicesContext] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filters, setFilters] = useState({
    flightNumber: '',
    station: '',
    region: '',
    dateTime: ''
  })

  // Screen settings state with default configuration including new prediction screens and HOTAC
  const [screenSettings, setScreenSettings] = useState([
    { id: 'dashboard', name: 'Dashboard', icon: TrendingUp, category: 'main', enabled: true, required: true },
    { id: 'flight-tracking', name: 'Flight Tracking Gantt', icon: Calendar, category: 'operations', enabled: true, required: false },
    { id: 'disruption', name: 'Affected Flights', icon: AlertTriangle, category: 'operations', enabled: true, required: false },
    { id: 'recovery', name: 'Recovery Options', icon: Plane, category: 'operations', enabled: true, required: false },
    { id: 'comparison', name: 'Comparison', icon: FileText, category: 'operations', enabled: true, required: false },
    { id: 'detailed', name: 'Recovery Plan', icon: Users, category: 'operations', enabled: true, required: false },
    { id: 'prediction-dashboard', name: 'Prediction Dashboard', icon: Brain, category: 'prediction', enabled: true, required: false },
    { id: 'flight-disruption-list', name: 'Flight Disruption List', icon: Target, category: 'prediction', enabled: true, required: false },
    { id: 'prediction-analytics', name: 'Prediction Analytics', icon: Activity, category: 'prediction', enabled: true, required: false },
    { id: 'risk-assessment', name: 'Risk Assessment', icon: Shield, category: 'prediction', enabled: true, required: false },
    { id: 'pending', name: 'Pending Solutions', icon: ClockIcon, category: 'monitoring', enabled: true, required: false },
    { id: 'past-logs', name: 'Past Recovery Logs', icon: CheckSquare, category: 'monitoring', enabled: true, required: false },
    { id: 'maintenance', name: 'Aircraft Maintenance', icon: Wrench, category: 'monitoring', enabled: true, required: false },
    { id: 'passengers', name: 'Passenger Services', icon: UserCheck, category: 'services', enabled: true, required: false },
    { id: 'hotac', name: 'HOTAC Management', icon: Hotel, category: 'services', enabled: true, required: false },
    { id: 'fuel-optimization', name: 'Fuel Optimization', icon: Fuel, category: 'analytics', enabled: true, required: false },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3, category: 'analytics', enabled: true, required: false },
    { id: 'settings', name: 'Settings', icon: Settings, category: 'system', enabled: true, required: true }
  ])

  // Filter screens to only show enabled ones
  const enabledScreens = screenSettings.filter(screen => screen.enabled)

  const categories = {
    main: { name: 'Main', color: 'text-flydubai-blue' },
    operations: { name: 'Operations', color: 'text-flydubai-blue' },
    prediction: { name: 'Prediction', color: 'text-flydubai-navy' },
    monitoring: { name: 'Monitoring', color: 'text-flydubai-navy' },
    services: { name: 'Services', color: 'text-flydubai-blue' },
    analytics: { name: 'Analytics', color: 'text-flydubai-navy' },
    system: { name: 'System', color: 'text-gray-600' }
  }

  const handleCreateRecoveryPlan = (disruption) => {
    setSelectedDisruption(disruption)
    setSelectedFlight(null)
    setActiveScreen('disruption')
  }

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight)
    setActiveScreen('recovery')
  }

  const handleSelectRecoveryPlan = (plan) => {
    setSelectedRecoveryPlan(plan)
    setActiveScreen('detailed')
  }

  const handlePassengerServicesNavigation = (context) => {
    setPassengerServicesContext(context)
    setActiveScreen('passengers')
  }

  const handleScreenSettingsChange = (newSettings) => {
    setScreenSettings(newSettings)

    // If the current active screen is disabled, switch to dashboard
    const currentScreen = newSettings.find(s => s.id === activeScreen)
    if (currentScreen && !currentScreen.enabled) {
      setActiveScreen('dashboard')
    }
  }

  // Clear passenger services context when navigating away from passengers screen
  const handleScreenChange = (screenId) => {
    if (screenId !== 'passengers') {
      setPassengerServicesContext(null)
    }
    setActiveScreen(screenId)
  }

  const getQuickStats = () => {
    switch (activeScreen) {
      case 'dashboard':
        return { icon: BarChart3, title: '89.3% Solution Adoption', subtitle: 'AED 5.2M Cost Savings', color: 'flydubai-blue' }
      case 'flight-tracking':
        return { icon: Calendar, title: '47 Aircraft Active', subtitle: '89 Flights Tracked', color: 'flydubai-blue' }
      case 'disruption':
        return { icon: AlertTriangle, title: '18 Flights Affected', subtitle: '3 High Priority', color: 'flydubai-orange' }
      case 'recovery':
        return { icon: Plane, title: '4 Options Generated', subtitle: '1 Recommended', color: 'flydubai-blue' }
      case 'prediction-dashboard':
        return { icon: Brain, title: '32 Disruptions Predicted', subtitle: '94.1% Accuracy Rate', color: 'flydubai-navy' }
      case 'flight-disruption-list':
        return { icon: Target, title: '85 Flights at Risk', subtitle: '12 High Risk', color: 'flydubai-navy' }
      case 'prediction-analytics':
        return { icon: Activity, title: '91% Model Confidence', subtitle: '4.8 hrs Avg Prediction Lead', color: 'flydubai-navy' }
      case 'risk-assessment':
        return { icon: Shield, title: '9 Risk Factors Active', subtitle: '2 Critical Alerts', color: 'flydubai-navy' }
      case 'passengers':
        if (passengerServicesContext) {
          return { 
            icon: UserCheck, 
            title: `${passengerServicesContext.flight?.passengers || 167} Passengers Affected`, 
            subtitle: `Recovery: ${passengerServicesContext.recoveryOption?.title || 'Processing'}`, 
            color: 'flydubai-orange' 
          }
        }
        return { icon: UserCheck, title: '3,247 Passengers Processed', subtitle: '96.8% Self-Service Rate', color: 'flydubai-blue' }
      case 'hotac':
        return { icon: Hotel, title: '47 Active Bookings', subtitle: '94.2% Confirmation Rate', color: 'flydubai-blue' }
      case 'pending':
        return { icon: ClockIcon, title: '8 Solutions Pending', subtitle: '2 High Priority', color: 'flydubai-orange' }
      case 'past-logs':
        return { icon: CheckSquare, title: '189 Solutions + 1,247 Audit Records', subtitle: '96.1% Success Rate + 98.9% System Integrity', color: 'flydubai-blue' }
      case 'maintenance':
        return { icon: Wrench, title: '6 Aircraft in Maintenance', subtitle: '2 A-Checks Scheduled', color: 'flydubai-orange' }
      case 'fuel-optimization':
        return { icon: Fuel, title: '12.1% Fuel Savings', subtitle: 'AED 2.8M Monthly Savings', color: 'flydubai-blue' }
      default:
        return null
    }
  }

  const quickStats = getQuickStats()

    // Use state to track if the app is running on the client-side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine if it's a mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isClient) {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isClient]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 min-w-[16rem] max-w-[16rem] bg-flydubai-blue text-white border-r border-blue-700 flex flex-col flex-shrink-0">
        {/* Sidebar Header - flydubai Branding */}
        <div className="p-4 border-b border-blue-700 min-h-[120px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 w-full">
            {/* flydubai Logo */}
            <img 
              src={flydubaiLogo} 
              alt="Flydubai" 
              className={sidebarOpen ? "h-9 w-auto object-contain" : "h-6 w-auto object-contain"}
            />
            {sidebarOpen && (
              <div className="text-center">
                <h1 className="text-base font-semibold text-white">
                  AERON
                </h1>
                <p className="text-xs text-blue-200 leading-tight">
                  Adaptive Engine for Recovery &<br />Operational Navigation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          {Object.entries(categories).map(([categoryKey, category]) => {
            const categoryScreens = enabledScreens.filter(screen => screen.category === categoryKey)

            // Don't render category if no enabled screens
            if (categoryScreens.length === 0) return null

            return (
              <div key={categoryKey} className="mb-6">
                {sidebarOpen && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-blue-200">
                      {category.name}
                    </h3>
                  </div>
                )}

                <div className="space-y-1 px-2">
                  {categoryScreens.map((screen) => {
                    const Icon = screen.icon
                    const isActive = activeScreen === screen.id

                    return (
                      <Button
                        key={screen.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 px-3 min-h-[40px] ${isActive ? 'bg-white text-flydubai-blue hover:bg-gray-100' : 'text-white hover:text-[#ff8200]'}`}
                        onClick={() => handleScreenChange(screen.id)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {sidebarOpen && <span className="truncate flex-1 text-left">{screen.name}</span>}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sidebar Footer - flydubai Partnership */}
        <div className="p-4 border-t border-blue-700 min-h-[80px]">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex-shrink-0">
              Online
            </Badge>
            {sidebarOpen && (
              <div className="text-right flex-1">
                <p className="text-xs font-medium text-white">Friday, January 10, 2025</p>
                <p className="text-xs text-blue-200">14:32 GST</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="pt-2 border-t border-blue-700">
              <p className="text-xs text-blue-200">
                Powered by Flydubai × AERON Partnership
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {enabledScreens.find(s => s.id === activeScreen)?.name || 'Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Flydubai AERON - AI-powered recovery and operational excellence
              </p>
            </div>

            {quickStats && (
              <div className={`flex items-center gap-3 px-4 py-2 bg-${quickStats.color === 'flydubai-blue' ? 'blue' : quickStats.color === 'flydubai-orange' ? 'orange' : quickStats.color === 'flydubai-navy' ? 'blue' : 'blue'}-50 rounded-lg border border-${quickStats.color === 'flydubai-blue' ? 'blue' : quickStats.color === 'flydubai-orange' ? 'orange' : quickStats.color === 'flydubai-navy' ? 'blue' : 'blue'}-200`}>
                {React.createElement(quickStats.icon, { className: `h-4 w-4 text-${quickStats.color === 'flydubai-blue' ? 'blue' : quickStats.color === 'flydubai-orange' ? 'orange' : quickStats.color === 'flydubai-navy' ? 'blue' : 'blue'}-600` })}
                <div className="text-xs">
                  <p className={`font-medium text-${quickStats.color === 'flydubai-blue' ? 'blue' : quickStats.color === 'flydubai-orange' ? 'orange' : quickStats.color === 'flydubai-navy' ? 'blue' : 'blue'}-700`}>{quickStats.title}</p>
                  <p className={`text-${quickStats.color === 'flydubai-blue' ? 'blue' : quickStats.color === 'flydubai-orange' ? 'orange' : quickStats.color === 'flydubai-navy' ? 'blue' : 'blue'}-600`}>{quickStats.subtitle}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {activeScreen === 'dashboard' && (
            <DashboardScreen 
              filters={filters}
              setFilters={setFilters}
              onCreateRecoveryPlan={handleCreateRecoveryPlan}
              setActiveScreen={handleScreenChange}
              enabledScreens={enabledScreens}
            />
          )}

          {activeScreen === 'flight-tracking' && <FlightTrackingGantt />}

          {activeScreen === 'disruption' && (
            <DisruptionInput 
              disruption={selectedDisruption}
              onSelectFlight={handleSelectFlight}
            />
          )}

          {activeScreen === 'recovery' && (
            <RecoveryOptionsGenerator 
              selectedFlight={selectedFlight}
              onSelectPlan={handleSelectRecoveryPlan}
              onCompare={() => handleScreenChange('comparison')}
              onPassengerServices={handlePassengerServicesNavigation}
            />
          )}

          {activeScreen === 'comparison' && (
            <ComparisonMatrix 
              selectedFlight={selectedFlight}
              onSelectPlan={handleSelectRecoveryPlan}
            />
          )}

          {activeScreen === 'detailed' && (
            <DetailedRecoveryPlan 
              plan={selectedRecoveryPlan}
              flight={selectedFlight}
            />
          )}

          {/* Prediction Screens */}
          {activeScreen === 'prediction-dashboard' && <DisruptionPredictionDashboard />}
          {activeScreen === 'flight-disruption-list' && <FlightDisruptionList />}
          {activeScreen === 'prediction-analytics' && <PredictionAnalytics />}
          {activeScreen === 'risk-assessment' && <RiskAssessment />}

          {activeScreen === 'pending' && <PendingSolutions />}

          {activeScreen === 'past-logs' && <PastRecoveryLogs />}

          {activeScreen === 'maintenance' && <AircraftMaintenance />}

          {activeScreen === 'passengers' && (
            <PassengerRebooking 
              context={passengerServicesContext}
              onClearContext={() => setPassengerServicesContext(null)}
            />
          )}

          {activeScreen === 'hotac' && <HOTACManagement />}

          {activeScreen === 'fuel-optimization' && <FuelOptimization />}

          {activeScreen === 'reports' && <AuditReporting />}

          {activeScreen === 'settings' && (
            <SettingsPanel 
              screenSettings={screenSettings}
              onScreenSettingsChange={handleScreenSettingsChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardScreen({ filters, setFilters, onCreateRecoveryPlan, setActiveScreen, enabledScreens }) {
  // Helper function to check if a screen is enabled before navigating
  const navigateToScreen = (screenId) => {
    const screen = enabledScreens.find(s => s.id === screenId)
    if (screen) {
      setActiveScreen(screenId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner - flydubai specific */}
      <Alert className="border-flydubai-orange bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-flydubai-orange" />
        <AlertDescription className="text-orange-800">
          <strong>Active Disruptions:</strong> 18 Flydubai flights affected by sandstorm at DXB. AERON recovery plans available.
        </AlertDescription>
      </Alert>

      {/* Quick Analytics Banner - flydubai themed */}
      <Card className="bg-gradient-flydubai-light border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <BarChart3 className="h-8 w-8 text-flydubai-blue" />
                <div className="absolute -inset-1 bg-flydubai-blue rounded-lg opacity-10 blur-sm"></div>
              </div>
              <div>
                <h3 className="font-medium text-flydubai-navy">Flydubai AERON Performance Today</h3>
                <p className="text-sm text-muted-foreground">8 recovery decisions processed • 96.1% success rate</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-blue">AED 312K</p>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-navy">7.8 min</p>
                <p className="text-xs text-muted-foreground">Avg Decision</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-orange">2,847</p>
                <p className="text-xs text-muted-foreground">Passengers Served</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateToScreen('reports')} className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50">
                View Full Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters - flydubai destinations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-flydubai-blue" />
            Flydubai Network Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Flight Number</label>
              <Input 
                placeholder="FZ123"
                value={filters.flightNumber}
                onChange={(e) => setFilters({...filters, flightNumber: e.target.value})}
                className="input-flydubai"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Station</label>
              <Select value={filters.station} onValueChange={(value) => setFilters({...filters, station: value})}>
                <SelectTrigger className="select-flydubai">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dxb">DXB - Dubai</SelectItem>
                  <SelectItem value="auh">AUH - Abu Dhabi</SelectItem>
                  <SelectItem value="sll">SLL - Salalah</SelectItem>
                  <SelectItem value="khi">KHI - Karachi</SelectItem>
                  <SelectItem value="bom">BOM - Mumbai</SelectItem>
                  <SelectItem value="del">DEL - Delhi</SelectItem>
                  <SelectItem value="cok">COK - Kochi</SelectItem>
                  <SelectItem value="cmb">CMB - Colombo</SelectItem>
                  <SelectItem value="ist">IST - Istanbul</SelectItem>
                  <SelectItem value="bcn">BCN - Barcelona</SelectItem>
                  <SelectItem value="prg">PRG - Prague</SelectItem>
                  <SelectItem value="tbz">TBZ - Tabriz</SelectItem>
                  <SelectItem value="beg">BEG - Belgrade</SelectItem>
                  <SelectItem value="skp">SKP - Skopje</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={filters.region} onValueChange={(value) => setFilters({...filters, region: value})}>
                <SelectTrigger className="select-flydubai">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcc">GCC</SelectItem>
                  <SelectItem value="indian-subcontinent">Indian Subcontinent</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="middle-east">Middle East</SelectItem>
                  <SelectItem value="central-asia">Central Asia</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date/Time</label>
              <Input 
                type="datetime-local"
                value={filters.dateTime}
                onChange={(e) => setFilters({...filters, dateTime: e.target.value})}
                className="input-flydubai"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* World Map */}
        <div>
          <WorldMap />
        </div>
      </div>

      {/* Action Buttons - flydubai themed */}
      <div className="navigation-menu mb-6">
        {enabledScreens.find(s => s.id === 'disruption-input') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('disruption-input')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Add Disruption
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'flight-disruption-list') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('flight-disruption-list')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Active Disruptions
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'recovery-options') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('recovery-options')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <Zap className="h-4 w-4 flex-shrink-0" />
            Recovery Options
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'passenger-rebooking') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('passenger-rebooking')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <UserCheck className="h-4 w-4 flex-shrink-0" />
            Passenger Rebooking
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'prediction-analytics') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('prediction-analytics')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            Prediction Analytics
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'crew-tracking') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('crew-tracking')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <Users className="h-4 w-4 flex-shrink-0" />
            Crew Tracking
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'flight-tracking') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('flight-tracking')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <Plane className="h-4 w-4 flex-shrink-0" />
            Flight Tracking
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'fuel-optimization') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('fuel-optimization')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <Fuel className="h-4 w-4 flex-shrink-0" />
            Fuel Optimization
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'aircraft-maintenance') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('aircraft-maintenance')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <Wrench className="h-4 w-4 flex-shrink-0" />
            Aircraft Maintenance
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'hotac') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('hotac')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <Hotel className="h-4 w-4 flex-shrink-0" />
            HOTAC Management
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'pending') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('pending')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <ClockIcon className="h-4 w-4 flex-shrink-0" />
            View Pending Solutions
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'past-logs') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('past-logs')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200 min-w-fit whitespace-nowrap"
          >
            <CheckSquare className="h-4 w-4 flex-shrink-0" />
            Past Recovery Logs
          </Button>
        )}
      </div>
    </div>
  )
}