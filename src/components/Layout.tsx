
import React, { useState, useEffect, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useAppContext } from '../context/AppContext'
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

  // Format date and time
  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    const dateStr = date.toLocaleDateString('en-US', options)
    const timeStr = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
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
        return { icon: BarChart3, title: '89.3% Solution Adoption', subtitle: 'AED 5.2M Cost Savings', color: 'flydubai-blue' }
      case '/flight-tracking':
        return { icon: Calendar, title: '47 Aircraft Active', subtitle: '89 Flights Tracked', color: 'flydubai-blue' }
      case '/disruption':
        return { icon: AlertTriangle, title: '18 Flights Affected', subtitle: '3 High Priority', color: 'flydubai-orange' }
      case '/recovery':
        return { icon: Plane, title: '4 Options Generated', subtitle: '1 Recommended', color: 'flydubai-blue' }
      case '/prediction-dashboard':
        return { icon: Brain, title: '32 Disruptions Predicted', subtitle: '94.1% Accuracy Rate', color: 'flydubai-navy' }
      case '/passengers':
        return { icon: UserCheck, title: '3,247 Passengers Processed', subtitle: '96.8% Self-Service Rate', color: 'flydubai-blue' }
      case '/pending':
        return { icon: ClockIcon, title: '8 Solutions Pending', subtitle: '2 High Priority', color: 'flydubai-orange' }
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
                <p className="text-xs text-blue-200">{timeStr} GST</p>
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
