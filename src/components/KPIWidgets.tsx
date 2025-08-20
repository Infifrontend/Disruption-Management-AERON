'use client'

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
  DollarSign
} from 'lucide-react'
import { databaseService } from '../services/databaseService'

interface KPIData {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ComponentType
  color: string
}

const kpiData: KPIData[] = [
  {
    title: 'Active Disruptions',
    value: 5,
    change: '+2 from yesterday',
    trend: 'up' as const,
    icon: AlertTriangle,
    color: 'text-red-500'
  },
  {
    title: 'Affected Passengers',
    value: '2,840',
    change: '-15% from last week',
    trend: 'down' as const,
    icon: Users,
    color: 'text-blue-500'
  },
  {
    title: 'On-Time Performance',
    value: '87.3%',
    change: '+2.1% improvement',
    trend: 'up' as const,
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    title: 'Average Delay',
    value: '23 min',
    change: '-5 min improvement',
    trend: 'down' as const,
    icon: Clock,
    color: 'text-orange-500'
  },
  {
    title: 'Recovery Success Rate',
    value: '94.2%',
    change: '+1.8% this month',
    trend: 'up' as const,
    icon: TrendingUp,
    color: 'text-emerald-500'
  },
  {
    title: 'Cost Savings',
    value: 'AED 125K',
    change: '+12% this quarter',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-green-600'
  }
]

export function KPIWidgets() {
  const [kpiDataState, setKpiDataState] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const data = await databaseService.getKPIData()
        setKpiDataState(data)
      } catch (error) {
        console.error('Error fetching KPI data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchKPIData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Key Performance Indicators</h3>

      {kpiData.map((kpi: KPIData, index: number) => {
        const Icon = kpi.icon
        const isPositiveTrend = kpi.trend === 'up'
        const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown

        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                  <h4 className="text-sm font-medium">{kpi.title}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`h-3 w-3 ${
                    isPositiveTrend ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className={`text-xs ${
                    isPositiveTrend ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-2xl font-semibold">{kpi.value}</span>
                {kpi.subtitle && (
                  <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                )}
              </div>

              {kpi.target && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress to Target</span>
                    <span>{kpi.current}% / {kpi.target}%</span>
                  </div>
                  <Progress
                    value={(kpi.current / kpi.target) * 100}
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium">Network Status</h4>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Performance</p>
              <p className="text-lg font-semibold text-blue-700">Good</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Stable
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function KPIWidgetsOld() {
  const [kpiData, setKpiData] = useState<KPIData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKPIData()
    const interval = setInterval(fetchKPIData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchKPIData = async () => {
    try {
      const data = await databaseService.getKPIData()

      const formattedKpiData: KPIData[] = [
        {
          title: 'Active Disruptions',
          value: data.activeDisruptions?.toString() || '0',
          change: '-3',
          changeType: 'decrease',
          icon: AlertTriangle,
          color: 'text-red-600'
        },
        {
          title: 'Affected Passengers',
          value: data.affectedPassengers?.toLocaleString() || '0',
          change: '+156',
          changeType: 'increase',
          icon: Users,
          color: 'text-blue-600'
        },
        {
          title: 'Average Delay',
          value: `${data.averageDelay || 0}min`,
          change: '-12min',
          changeType: 'decrease',
          icon: Clock,
          color: 'text-orange-600'
        },
        {
          title: 'Recovery Success Rate',
          value: `${data.recoverySuccessRate || 0}%`,
          change: '+2.1%',
          changeType: 'increase',
          icon: CheckCircle,
          color: 'text-green-600'
        },
        {
          title: 'On-Time Performance',
          value: `${data.onTimePerformance || 0}%`,
          change: '+1.4%',
          changeType: 'increase',
          icon: Plane,
          color: 'text-purple-600'
        },
        {
          title: 'Cost Savings',
          value: `AED ${data.costSavings || 0}M`,
          change: '+15%',
          changeType: 'increase',
          icon: DollarSign,
          color: 'text-emerald-600'
        }
      ]

      setKpiData(formattedKpiData)
    } catch (error) {
      console.error('Error fetching KPI data:', error)
      // Keep the existing static data as fallback
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        const TrendIcon = kpi.changeType === 'increase' ? TrendingUp : TrendingDown
        const trendColor = kpi.changeType === 'increase' ? 'text-green-500' : 'text-red-500'

        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                <span className={trendColor}>{kpi.change}</span>
                <span className="text-muted-foreground">from last period</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}