'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { TrendingUp, TrendingDown, Plane, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

const kpiData = [
  {
    title: 'On-Time Performance',
    value: '87.3%',
    change: '+2.1%',
    trend: 'up',
    target: 90,
    current: 87.3,
    icon: Clock,
    color: 'text-blue-600'
  },
  {
    title: 'Flights Disrupted',
    value: '23',
    change: '+8',
    trend: 'up',
    subtitle: 'Last 24 hours',
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
  {
    title: 'Recovery Plans Active',
    value: '7',
    change: '-2',
    trend: 'down',
    subtitle: 'In progress',
    icon: Plane,
    color: 'text-green-600'
  },
  {
    title: 'Passengers Affected',
    value: '4,127',
    change: '+892',
    trend: 'up',
    subtitle: 'Today',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    title: 'Recovery Success Rate',
    value: '94.2%',
    change: '+1.8%',
    trend: 'up',
    target: 95,
    current: 94.2,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    title: 'Avg Recovery Time',
    value: '2.4h',
    change: '-18min',
    trend: 'down',
    subtitle: 'Per incident',
    icon: Clock,
    color: 'text-blue-600'
  }
]

export function KPIWidgets() {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Key Performance Indicators</h3>
      
      {kpiData.map((kpi, index) => {
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
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function KPIWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xl:gap-4">
      <Card className="kpi-flydubai">
        <CardHeader className="pb-2 xl:pb-3">
          <CardTitle className="text-sm xl:text-base">On-Time Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xl xl:text-2xl font-bold">89.3%</p>
        </CardContent>
      </Card>
      <Card className="kpi-flydubai">
        <CardHeader className="pb-2 xl:pb-3">
          <CardTitle className="text-sm xl:text-base">Active Flights</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xl xl:text-2xl font-bold">47</p>
        </CardContent>
      </Card>
      <Card className="kpi-flydubai">
        <CardHeader className="pb-2 xl:pb-3">
          <CardTitle className="text-sm xl:text-base">Passengers Today</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xl xl:text-2xl font-bold">2,847</p>
        </CardContent>
      </Card>
    </div>
  );
}
