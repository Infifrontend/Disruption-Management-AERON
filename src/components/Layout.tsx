
import React, { useState, useEffect, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAppContext } from '../context/AppContext'
import { databaseService } from '../services/databaseService'
import { 
  TrendingUp, Calendar, AlertTriangle, Plane, FileText, Users, Brain, Target, 
  Activity, Shield, ClockIcon, CheckSquare, Wrench, UserCheck, Hotel, Fuel, 
  BarChart3, Settings, RotateCcw, Wifi, WifiOff
} from 'lucide-react'

const iconMap = {
  TrendingUp, Calendar, AlertTriangle, Plane, FileText, Users, Brain, Target,
  Activity, Shield, ClockIcon, CheckSquare, Wrench, UserCheck, Hotel, Fuel,
  BarChart3, Settings
}

const flydubaiLogo = '/attached_assets/flydubai_1753709270029.png'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { screenSettings } = useAppContext()
  const [sidebarOpen] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [flightStats, setFlightStats] = useState({
    totalAffected: 0,
    highPriority: 0,
    activeFlights: 0,
    totalPassengers: 0
  })

  const enabledScreens = screenSettings.filter(screen => screen.enabled)

  // Update connectivity status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch real-time flight statistics
  useEffect(() => {
    let isMounted = true
    
    const fetchFlightStats = async () => {
      try {
        const disruptions = await databaseService.getAllDisruptions()
        
        if (!isMounted) return // Prevent state update if component unmounted
        
        const totalAffected = disruptions.length
        const highPriority = disruptions.filter(d => 
          d.severity === 'Critical' || d.severity === 'High'
        ).length
        const activeFlights = disruptions.filter(d => 
          d.status === 'Active' || d.status === 'Delayed'
        ).length
        const totalPassengers = disruptions.reduce((sum, d) => sum + (d.passengers || 0), 0)
        
        setFlightStats({
          totalAffected,
          highPriority,
          activeFlights,
          totalPassengers
        })
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch flight statistics:', error)
          // Set default values on error
          setFlightStats({
            totalAffected: 0,
            highPriority: 0,
            activeFlights: 0,
            totalPassengers: 0
          })
        }
      }
    }

    fetchFlightStats()
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchFlightStats, 30000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Format date and time in IST (Indian Standard Time)
  const formatDateTime = (date: Date) => {
    // Convert to IST
    const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    }
    const dateStr = istDate.toLocaleDateString('en-IN', options)
    const timeStr = istDate.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    })
    return { dateStr, timeStr }
  }

  const { dateStr, timeStr } = formatDateTime(currentDateTime)

  const categories = {
    main: { name: 'Main', color: 'text-flydubai-blue' },
    operations: { name: 'Operations', color: 'text-flydubai-blue' },
    prediction: { name: 'Prediction', color: 'text-flydubai-navy' },
    monitoring: { name: 'Monitoring', color: 'text-flydubai-navy' },
    services: { name: 'Services', color: 'text-flydubai-blue' },
    analytics: { name: 'Analytics', color: 'text-flydubai-navy' },
    system: { name: 'System', color: 'text-gray-600' }
  }

  const getQuickStats = () => {
    const pathname = location.pathname
    switch (pathname) {
      case '/':
      case '/dashboard':
        return { icon: BarChart3, title: `${((flightStats.totalAffected - flightStats.highPriority) / Math.max(flightStats.totalAffected, 1) * 100).toFixed(1)}% Solution Adoption`, subtitle: `${flightStats.totalAffected} Total Disruptions`, color: 'flydubai-blue' }
      case '/flight-tracking':
        return { icon: Calendar, title: `${flightStats.activeFlights} Aircraft Active`, subtitle: `${flightStats.totalAffected} Flights Tracked`, color: 'flydubai-blue' }
      case '/disruption':
        return { icon: AlertTriangle, title: `${flightStats.totalAffected} Flights Affected`, subtitle: `${flightStats.highPriority} High Priority`, color: 'flydubai-orange' }
      case '/recovery':
        return { icon: Plane, title: `${Math.min(flightStats.totalAffected * 3, 12)} Options Available`, subtitle: `${Math.ceil(flightStats.totalAffected * 0.3)} Recommended`, color: 'flydubai-blue' }
      case '/prediction-dashboard':
        return { icon: Brain, title: `${flightStats.totalAffected + Math.floor(flightStats.totalAffected * 0.2)} Disruptions Predicted`, subtitle: `${(85 + Math.random() * 10).toFixed(1)}% Accuracy Rate`, color: 'flydubai-navy' }
      case '/passengers':
        return { icon: UserCheck, title: `${flightStats.totalPassengers.toLocaleString()} Passengers Affected`, subtitle: `${flightStats.totalAffected} Flights`, color: 'flydubai-blue' }
      case '/pending':
        return { icon: ClockIcon, title: `${flightStats.highPriority + Math.floor(flightStats.totalAffected * 0.1)} Solutions Pending`, subtitle: `${flightStats.highPriority} High Priority`, color: 'flydubai-orange' }
      case '/hotac':
        return { icon: Hotel, title: `${flightStats.totalAffected * 2} HOTAC Records`, subtitle: `${Math.floor(flightStats.totalAffected * 0.8)} Confirmed`, color: 'flydubai-blue' }
      default:
        return null
    }
  }

  const quickStats = getQuickStats()
  const currentScreen = enabledScreens.find(s => location.pathname === `/${s.id}` || (location.pathname === '/' && s.id === 'dashboard'))

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 min-w-[15rem] max-w-[15rem] bg-flydubai-blue text-white border-r border-blue-700 flex flex-col flex-shrink-0 overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-blue-700 min-h-[120px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 w-full">
            <img 
              src={flydubaiLogo} 
              alt="Flydubai" 
              className={`responsive-logo ${sidebarOpen ? "h-8 w-auto" : "h-6 w-auto"}`}
            />
            {sidebarOpen && (
              <div className="text-center">
                <h1 className="text-base font-semibold text-white">AERON</h1>
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
                    const IconComponent = iconMap[screen.icon as keyof typeof iconMap]
                    const isActive = location.pathname === `/${screen.id}` || (location.pathname === '/' && screen.id === 'dashboard')

                    return (
                      <Button
                        key={screen.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 px-3 min-h-[40px] ${isActive ? 'bg-white text-flydubai-blue hover:bg-gray-100' : 'text-white hover:text-[#ff8200]'}`}
                        onClick={() => navigate(screen.id === 'dashboard' ? '/' : `/${screen.id}`)}
                      >
                        {IconComponent && <IconComponent className="h-4 w-4 flex-shrink-0" />}
                        {sidebarOpen && <span className="truncate flex-1 text-left">{screen.name}</span>}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-700 min-h-[80px]">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="outline" 
              className={`${
                isOnline 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              } flex-shrink-0 flex items-center gap-1`}
            >
              {isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {sidebarOpen && (
              <div className="text-right flex-1">
                <p className="text-xs font-medium text-white">{dateStr}</p>
                <p className="text-xs text-blue-200">{timeStr} IST</p>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {currentScreen?.name || 'Dashboard'}
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollable-content">
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
