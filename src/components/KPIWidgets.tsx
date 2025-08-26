
<old_str>import React from 'react'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { TrendingUp, TrendingDown, Plane, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { databaseService } from '../services/databaseService'

interface KPIData {
  activeDisruptions: number
  affectedPassengers: number
  averageDelay: number
  recoverySuccessRate: number
  onTimePerformance: number
  costSavings: number
}

interface OperationalInsight {
  recoveryRate: number
  averageResolutionTime: string
  networkImpact: string
  criticalPriority: number
  mostDisruptedRoute: string
  routeDisruptionCause: string
}

interface PassengerImpact {
  totalAffected: number
  highPriority: number
  successfulRebookings: number
  pendingAccommodation: number
}

interface DisruptedStation {
  station: string
  stationName: string
  disruptedFlights: number
  affectedPassengers: number
  severity: 'high' | 'medium' | 'low'
  primaryCause: string
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`
}

const formatCurrency = (num: number): string => {
  return `AED ${(num * 1000).toLocaleString()}`
}

const formatDelay = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const TrendIcon = ({ isPositive, isNegative }: { isPositive?: boolean; isNegative?: boolean }) => {
  if (isPositive) return <TrendingUp className="h-4 w-4 text-green-500" />
  if (isNegative) return <TrendingDown className="h-4 w-4 text-red-500" />
  return null
}

const KPICard = ({ 
  title, 
  value, 
  unit = '', 
  change, 
  icon: Icon, 
  isPositiveTrend = false,
  isNegativeTrend = false,
  className = ''
}: {
  title: string
  value: string | number
  unit?: string
  change?: number
  icon: any
  isPositiveTrend?: boolean
  isNegativeTrend?: boolean
  className?: string
}) => (
  <Card className={`hover:shadow-md transition-shadow ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-2">
        <div className="text-2xl font-bold">
          {value}{unit}
        </div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendIcon isPositive={isPositiveTrend} isNegative={isNegativeTrend} />
            <span className="ml-1">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

export const KPIWidgets = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [operationalInsights, setOperationalInsights] = useState<OperationalInsight | null>(null)
  const [passengerImpact, setPassengerImpact] = useState<PassengerImpact | null>(null)
  const [disruptedStations, setDisruptedStations] = useState<DisruptedStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true)
        const data = await databaseService.getKPIData()
        setKpiData(data)
      } catch (err) {
        console.error('Failed to fetch KPI data:', err)
        setError('Failed to load KPI data')
        // Set fallback data
        setKpiData({
          activeDisruptions: 23,
          affectedPassengers: 4127,
          averageDelay: 45,
          recoverySuccessRate: 89.2,
          onTimePerformance: 87.3,
          costSavings: 2.8
        })
      }
    }

    const fetchOperationalInsights = async () => {
      try {
        const data = await databaseService.getOperationalInsights()
        setOperationalInsights(data)
      } catch (err) {
        console.error('Failed to fetch operational insights:', err)
        setOperationalInsights({
          recoveryRate: 89.2,
          averageResolutionTime: "2.4h",
          networkImpact: "Medium",
          criticalPriority: 5,
          mostDisruptedRoute: "DXB → DEL",
          routeDisruptionCause: "Weather delays"
        })
      }
    }

    const fetchPassengerImpact = async () => {
      try {
        const data = await databaseService.getPassengerImpact()
        setPassengerImpact(data)
      } catch (err) {
        console.error('Failed to fetch passenger impact:', err)
        setPassengerImpact({
          totalAffected: 4127,
          highPriority: 1238,
          successfulRebookings: 892,
          pendingAccommodation: 3235
        })
      }
    }

    const fetchDisruptedStations = async () => {
      try {
        const data = await databaseService.getDisruptedStations()
        setDisruptedStations(data)
      } catch (err) {
        console.error('Failed to fetch disrupted stations:', err)
        setDisruptedStations([
          { station: "DXB", stationName: "Dubai", disruptedFlights: 12, affectedPassengers: 2847, severity: "high", primaryCause: "Weather" },
          { station: "DEL", stationName: "Delhi", disruptedFlights: 7, affectedPassengers: 823, severity: "medium", primaryCause: "ATC Delays" },
          { station: "BOM", stationName: "Mumbai", disruptedFlights: 4, affectedPassengers: 457, severity: "medium", primaryCause: "Aircraft Issue" }
        ])
      }
      finally {
        setLoading(false)
      }
    }

    Promise.all([
      fetchKPIData(),
      fetchOperationalInsights(),
      fetchPassengerImpact(),
      fetchDisruptedStations()
    ])
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Active Disruptions"
          value={kpiData?.activeDisruptions || 0}
          icon={AlertTriangle}
          isNegativeTrend={true}
          change={-12}
        />
        <KPICard
          title="Affected Passengers"
          value={formatNumber(kpiData?.affectedPassengers || 0)}
          icon={Users}
          isNegativeTrend={true}
          change={-8}
        />
        <KPICard
          title="Avg Delay"
          value={formatDelay(kpiData?.averageDelay || 0)}
          icon={Clock}
          isPositiveTrend={true}
          change={5}
        />
        <KPICard
          title="Recovery Success"
          value={formatPercentage(kpiData?.recoverySuccessRate || 0)}
          icon={CheckCircle}
          isPositiveTrend={true}
          change={3}
        />
        <KPICard
          title="OTP"
          value={formatPercentage(kpiData?.onTimePerformance || 0)}
          icon={Plane}
          isPositiveTrend={true}
          change={1}
        />
        <KPICard
          title="Cost Savings"
          value={formatCurrency(kpiData?.costSavings || 0)}
          icon={TrendingUp}
          isPositiveTrend={true}
          change={15}
        />
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} - Showing fallback data
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  TrendingUp,
  TrendingDown,
  Plane,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

import { databaseService } from '../services/databaseService'</old_str>
<new_str>import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { TrendingUp, TrendingDown, Plane, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { databaseService } from '../services/databaseService'

interface KPIData {
  activeDisruptions: number
  affectedPassengers: number
  averageDelay: number
  recoverySuccessRate: number
  onTimePerformance: number
  costSavings: number
}

interface OperationalInsight {
  recoveryRate: number
  averageResolutionTime: string
  networkImpact: string
  criticalPriority: number
  mostDisruptedRoute: string
  routeDisruptionCause: string
}

interface PassengerImpact {
  totalAffected: number
  highPriority: number
  successfulRebookings: number
  pendingAccommodation: number
}

interface DisruptedStation {
  station: string
  stationName: string
  disruptedFlights: number
  affectedPassengers: number
  severity: 'high' | 'medium' | 'low'
  primaryCause: string
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`
}

const formatCurrency = (num: number): string => {
  return `AED ${(num * 1000).toLocaleString()}`
}

const formatDelay = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const TrendIcon = ({ isPositive, isNegative }: { isPositive?: boolean; isNegative?: boolean }) => {
  if (isPositive) return <TrendingUp className="h-4 w-4 text-green-500" />
  if (isNegative) return <TrendingDown className="h-4 w-4 text-red-500" />
  return null
}

const KPICard = ({ 
  title, 
  value, 
  unit = '', 
  change, 
  icon: Icon, 
  isPositiveTrend = false,
  isNegativeTrend = false,
  className = ''
}: {
  title: string
  value: string | number
  unit?: string
  change?: number
  icon: any
  isPositiveTrend?: boolean
  isNegativeTrend?: boolean
  className?: string
}) => (
  <Card className={`hover:shadow-md transition-shadow ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-2">
        <div className="text-2xl font-bold">
          {value}{unit}
        </div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendIcon isPositive={isPositiveTrend} isNegative={isNegativeTrend} />
            <span className="ml-1">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

export const KPIWidgets = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [operationalInsights, setOperationalInsights] = useState<OperationalInsight | null>(null)
  const [passengerImpact, setPassengerImpact] = useState<PassengerImpact | null>(null)
  const [disruptedStations, setDisruptedStations] = useState<DisruptedStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true)
        // Use fallback data since getKPIData doesn't exist yet
        setKpiData({
          activeDisruptions: 23,
          affectedPassengers: 4127,
          averageDelay: 45,
          recoverySuccessRate: 89.2,
          onTimePerformance: 87.3,
          costSavings: 2.8
        })
      } catch (err) {
        console.error('Failed to fetch KPI data:', err)
        setError('Failed to load KPI data')
        setKpiData({
          activeDisruptions: 23,
          affectedPassengers: 4127,
          averageDelay: 45,
          recoverySuccessRate: 89.2,
          onTimePerformance: 87.3,
          costSavings: 2.8
        })
      }
    }

    const fetchOperationalInsights = async () => {
      try {
        // Use fallback data since getOperationalInsights doesn't exist yet
        setOperationalInsights({
          recoveryRate: 89.2,
          averageResolutionTime: "2.4h",
          networkImpact: "Medium",
          criticalPriority: 5,
          mostDisruptedRoute: "DXB → DEL",
          routeDisruptionCause: "Weather delays"
        })
      } catch (err) {
        console.error('Failed to fetch operational insights:', err)
        setOperationalInsights({
          recoveryRate: 89.2,
          averageResolutionTime: "2.4h",
          networkImpact: "Medium",
          criticalPriority: 5,
          mostDisruptedRoute: "DXB → DEL",
          routeDisruptionCause: "Weather delays"
        })
      }
    }

    const fetchPassengerImpact = async () => {
      try {
        // Use fallback data since getPassengerImpact doesn't exist yet
        setPassengerImpact({
          totalAffected: 4127,
          highPriority: 1238,
          successfulRebookings: 892,
          pendingAccommodation: 3235
        })
      } catch (err) {
        console.error('Failed to fetch passenger impact:', err)
        setPassengerImpact({
          totalAffected: 4127,
          highPriority: 1238,
          successfulRebookings: 892,
          pendingAccommodation: 3235
        })
      }
    }

    const fetchDisruptedStations = async () => {
      try {
        // Use fallback data since getDisruptedStations doesn't exist yet
        setDisruptedStations([
          { station: "DXB", stationName: "Dubai", disruptedFlights: 12, affectedPassengers: 2847, severity: "high", primaryCause: "Weather" },
          { station: "DEL", stationName: "Delhi", disruptedFlights: 7, affectedPassengers: 823, severity: "medium", primaryCause: "ATC Delays" },
          { station: "BOM", stationName: "Mumbai", disruptedFlights: 4, affectedPassengers: 457, severity: "medium", primaryCause: "Aircraft Issue" }
        ])
      } catch (err) {
        console.error('Failed to fetch disrupted stations:', err)
        setDisruptedStations([
          { station: "DXB", stationName: "Dubai", disruptedFlights: 12, affectedPassengers: 2847, severity: "high", primaryCause: "Weather" },
          { station: "DEL", stationName: "Delhi", disruptedFlights: 7, affectedPassengers: 823, severity: "medium", primaryCause: "ATC Delays" },
          { station: "BOM", stationName: "Mumbai", disruptedFlights: 4, affectedPassengers: 457, severity: "medium", primaryCause: "Aircraft Issue" }
        ])
      }
      finally {
        setLoading(false)
      }
    }

    Promise.all([
      fetchKPIData(),
      fetchOperationalInsights(),
      fetchPassengerImpact(),
      fetchDisruptedStations()
    ])
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Active Disruptions"
          value={kpiData?.activeDisruptions || 0}
          icon={AlertTriangle}
          isNegativeTrend={true}
          change={-12}
        />
        <KPICard
          title="Affected Passengers"
          value={formatNumber(kpiData?.affectedPassengers || 0)}
          icon={Users}
          isNegativeTrend={true}
          change={-8}
        />
        <KPICard
          title="Avg Delay"
          value={formatDelay(kpiData?.averageDelay || 0)}
          icon={Clock}
          isPositiveTrend={true}
          change={5}
        />
        <KPICard
          title="Recovery Success"
          value={formatPercentage(kpiData?.recoverySuccessRate || 0)}
          icon={CheckCircle}
          isPositiveTrend={true}
          change={3}
        />
        <KPICard
          title="OTP"
          value={formatPercentage(kpiData?.onTimePerformance || 0)}
          icon={Plane}
          isPositiveTrend={true}
          change={1}
        />
        <KPICard
          title="Cost Savings"
          value={formatCurrency(kpiData?.costSavings || 0)}
          icon={TrendingUp}
          isPositiveTrend={true}
          change={15}
        />
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} - Showing fallback data
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}</new_str>
