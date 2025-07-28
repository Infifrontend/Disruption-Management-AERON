
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { WorldMap } from '../../components/WorldMap'
import { 
  AlertTriangle, BarChart3, Filter, AlertCircle, Zap, UserCheck, 
  Plane, Fuel, Wrench, Hotel, ClockIcon, CheckSquare, Users, Calendar
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

      {/* World Map */}
      <div>
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
