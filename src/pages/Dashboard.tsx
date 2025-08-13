import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Alert, AlertDescription } from '../components/ui/alert'
import { WorldMap } from '../components/WorldMap'
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

      {/* Passenger Impact & Disruption Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-flydubai-orange" />
              Passenger Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Affected Passengers</span>
                </div>
                <p className="text-2xl font-bold text-red-700">4,127</p>
                <p className="text-xs text-red-600">Across all disruptions</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">High Priority</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">1,238</p>
                <p className="text-xs text-yellow-600">Need immediate attention</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Rebookings</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">892</p>
                <p className="text-xs text-blue-600">Successfully rebooked</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Resolved</span>
                </div>
                <p className="text-2xl font-bold text-green-700">2,997</p>
                <p className="text-xs text-green-600">Passengers accommodated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Highly Disrupted Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-red-900">DXB - Dubai</p>
                    <p className="text-xs text-red-600">12 disrupted flights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">2,847</p>
                  <p className="text-xs text-red-600">passengers affected</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-orange-900">DEL - Delhi</p>
                    <p className="text-xs text-orange-600">7 disrupted flights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-700">823</p>
                  <p className="text-xs text-orange-600">passengers affected</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-yellow-900">BOM - Mumbai</p>
                    <p className="text-xs text-yellow-600">4 disrupted flights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-700">457</p>
                  <p className="text-xs text-yellow-600">passengers affected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Operational Insights */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Key Operational Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Recovery Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">89.2%</p>
              <p className="text-xs text-blue-600">+4.3% from yesterday</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Avg Resolution</span>
              </div>
              <p className="text-2xl font-bold text-green-800">2.4h</p>
              <p className="text-xs text-green-600">-18 min improvement</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Network Impact</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">Medium</p>
              <p className="text-xs text-purple-600">23 active disruptions</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Critical Priority</span>
              </div>
              <p className="text-2xl font-bold text-orange-800">5</p>
              <p className="text-xs text-orange-600">Require immediate action</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Most Disrupted Route</p>
                <p className="text-sm text-gray-600">DXB → DEL experiencing weather delays</p>
              </div>
              <Badge className="bg-red-100 text-red-700 border-red-200">
                High Impact
              </Badge>
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
                    <p className="text-xs text-red-600">5 critical • 4,127 pax affected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Passengers</p>
                    <p className="text-xl font-semibold text-purple-600">42,158</p>
                    <p className="text-xs text-red-600">9.8% disrupted today</p>
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

      {/* Real-time World Map */}
      <div className="w-full">
        <WorldMap />
      </div>

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