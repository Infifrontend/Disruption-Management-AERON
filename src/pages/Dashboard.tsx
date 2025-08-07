
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  AlertTriangle, BarChart3, Filter, AlertCircle, Zap, UserCheck, 
  Plane, Fuel, Wrench, Hotel, ClockIcon, CheckSquare, Users, Calendar,
  Globe, TrendingUp, MapPin, Activity, Radar
} from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const { filters, setFilters, screenSettings, setSelectedDisruption } = useAppContext()

  const enabledScreens = screenSettings.filter(screen => screen.enabled)

  const handleCreateRecoveryPlan = (disruption: any) => {
    setSelectedDisruption(disruption)
    navigate('/disruption')
  }

  const navigateToScreen = (screenId: string) => {
    const screen = enabledScreens.find(s => s.id === screenId)
    if (screen) {
      navigate(screenId === 'dashboard' ? '/' : `/${screenId}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <Alert className="border-flydubai-orange bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-flydubai-orange" />
        <AlertDescription className="text-orange-800">
          <strong>Active Disruptions:</strong> 18 Flydubai flights affected by sandstorm at DXB. AERON recovery plans available.
        </AlertDescription>
      </Alert>

      {/* Quick Analytics Banner */}
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

      {/* Network Overview */}
      <Card className="border-flydubai-blue/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-flydubai-blue" />
            Global Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Plane className="h-5 w-5 text-flydubai-blue" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Flights</p>
                    <p className="text-xl font-semibold text-flydubai-blue">847</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12 from yesterday
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-flydubai-orange" />
                  <div>
                    <p className="text-sm text-muted-foreground">Disruptions</p>
                    <p className="text-xl font-semibold text-flydubai-orange">23</p>
                    <p className="text-xs text-red-600">5 critical priority</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Passengers</p>
                    <p className="text-xl font-semibold text-purple-600">42,158</p>
                    <p className="text-xs text-blue-600">98.2% satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">OTP Performance</p>
                    <p className="text-xl font-semibold text-green-600">89.2%</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +2.1% this week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
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

      {/* World Map - Matching Reference Design */}
      <Card className="border-flydubai-blue/30 shadow-xl">
        <CardHeader className="border-b border-flydubai-blue/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-flydubai-blue" />
              Global Network Operations
            </CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live Updates
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* World Map Container */}
          <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 border border-gray-200 rounded-lg overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 1000 500"
                className="w-full h-full"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              >
                {/* World Map Silhouette - Simplified version matching reference */}
                <g fill="#C1C9D2" stroke="none">
                  {/* North America */}
                  <path d="M50,80 Q80,60 120,80 L180,70 Q200,90 190,130 L170,150 Q140,140 100,160 L80,140 Q60,120 50,80 Z" />
                  <path d="M60,160 Q90,180 120,170 L140,190 Q120,220 90,210 L70,190 Q50,170 60,160 Z" />
                  
                  {/* South America */}
                  <path d="M140,220 Q160,240 150,300 L160,380 Q140,400 130,380 L120,300 Q130,250 140,220 Z" />
                  
                  {/* Europe */}
                  <path d="M420,60 Q450,50 480,70 L500,80 Q490,110 470,120 L450,110 Q430,90 420,60 Z" />
                  
                  {/* Africa */}
                  <path d="M450,140 Q480,130 500,150 L510,200 Q520,280 500,320 L480,350 Q460,340 450,320 L440,250 Q445,190 450,140 Z" />
                  
                  {/* Asia */}
                  <path d="M520,60 Q580,40 650,60 L720,70 Q780,80 820,100 L850,120 Q840,160 820,180 L780,200 Q720,190 680,200 L620,190 Q560,180 520,160 Q510,120 520,60 Z" />
                  
                  {/* India */}
                  <path d="M620,200 Q650,190 670,220 L680,280 Q670,300 650,290 L630,270 Q620,240 620,200 Z" />
                  
                  {/* Australia */}
                  <path d="M750,320 Q800,310 840,330 L860,350 Q850,380 820,390 L780,380 Q760,360 750,320 Z" />
                  
                  {/* Additional landmasses for completeness */}
                  <path d="M200,40 Q230,30 250,50 L270,60 Q260,80 240,90 L220,80 Q200,60 200,40 Z" />
                  <path d="M300,120 Q320,110 340,130 L350,150 Q340,170 320,180 L300,170 Q290,150 300,120 Z" />
                </g>
              </svg>
            </div>

            {/* Data Points and Statistics Overlays - Matching Reference Style */}
            <div className="absolute inset-0">
              {/* North America Data Point */}
              <div className="absolute" style={{ left: '15%', top: '25%' }}>
                <div className="relative">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold whitespace-nowrap shadow-lg">
                    1,998,764
                  </div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg whitespace-nowrap" style={{ width: '160px' }}>
                    <h4 className="font-semibold text-gray-800 mb-1">Caption</h4>
                    <p className="text-xs text-gray-600 leading-tight">
                      Lorem Ipsum is simply dummy text of the typesetting industry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Europe Data Point */}
              <div className="absolute" style={{ left: '45%', top: '20%' }}>
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold whitespace-nowrap shadow-lg">
                    1,222,442
                  </div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg whitespace-nowrap" style={{ width: '160px' }}>
                    <h4 className="font-semibold text-gray-800 mb-1">Caption</h4>
                    <p className="text-xs text-gray-600 leading-tight">
                      Lorem Ipsum is simply dummy text of the typesetting industry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Asia Data Point */}
              <div className="absolute" style={{ left: '70%', top: '35%' }}>
                <div className="relative">
                  <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded text-sm font-semibold whitespace-nowrap shadow-lg">
                    907,786
                  </div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg whitespace-nowrap" style={{ width: '160px' }}>
                    <h4 className="font-semibold text-gray-800 mb-1">Caption</h4>
                    <p className="text-xs text-gray-600 leading-tight">
                      Lorem Ipsum is simply dummy text of the typesetting industry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Australia Data Point */}
              <div className="absolute" style={{ left: '80%', top: '70%' }}>
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold whitespace-nowrap shadow-lg">
                    867,098
                  </div>
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg whitespace-nowrap" style={{ width: '160px' }}>
                    <h4 className="font-semibold text-gray-800 mb-1">Caption</h4>
                    <p className="text-xs text-gray-600 leading-tight">
                      Lorem Ipsum is simply dummy text of the typesetting industry.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 text-xs shadow-lg">
              <h4 className="font-semibold mb-2 text-flydubai-navy">Network Statistics</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>High Traffic Routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Critical Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Growth Markets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Expanding Networks</span>
                </div>
              </div>
            </div>

            {/* Network Performance Indicator */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 text-xs shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-flydubai-navy">Network Status</span>
              </div>
              <div className="text-green-600 font-medium">Operational</div>
              <div className="text-gray-600">Real-time monitoring active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {enabledScreens.find(s => s.id === 'flight-disruption-list') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('flight-disruption-list')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <AlertCircle className="h-4 w-4" />
            Active Disruptions
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'recovery') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('recovery')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Zap className="h-4 w-4" />
            Recovery Options
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'passengers') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('passengers')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <UserCheck className="h-4 w-4" />
            Passenger Services
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'flight-tracking') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('flight-tracking')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Plane className="h-4 w-4" />
            Flight Tracking
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'fuel-optimization') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('fuel-optimization')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Fuel className="h-4 w-4" />
            Fuel Optimization
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'maintenance') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('maintenance')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Wrench className="h-4 w-4" />
            Aircraft Maintenance
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'hotac') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('hotac')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Hotel className="h-4 w-4" />
            HOTAC Management
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'pending') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('pending')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <ClockIcon className="h-4 w-4" />
            Pending Solutions
          </Button>
        )}

        {enabledScreens.find(s => s.id === 'past-logs') && (
          <Button 
            variant="outline" 
            onClick={() => navigateToScreen('past-logs')}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <CheckSquare className="h-4 w-4" />
            Past Recovery Logs
          </Button>
        )}
      </div>
    </div>
  )
}
