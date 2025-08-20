'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { 
  MapPin, 
  Plane, 
  AlertTriangle, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  CloudRain,
  Wind,
  Sun,
  Cloud,
  Navigation,
  Activity,
  Globe,
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  Maximize,
  Filter,
  Search
} from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import worldMapImage from 'figma:asset/f497ef8e5a05ab25bb00d39bb281fadf3e573e35.png'

export function NetworkHeatMap({ onSelectDisruption, filters }) {
  const [selectedAirport, setSelectedAirport] = useState(null)
  const [viewMode, setViewMode] = useState('disruptions') // disruptions, routes, traffic
  const [showRoutes, setShowRoutes] = useState(true)
  const [showWeather, setShowWeather] = useState(true)
  const [animateFlights, setAnimateFlights] = useState(true)
  const [mapLayers, setMapLayers] = useState({
    disruptions: true,
    routes: true,
    weather: true,
    traffic: false
  })

  // Major airports with coordinates (approximate positioning for the map)
  const airports = [
    // North America
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', x: 22, y: 25, status: 'disrupted', flights: 45, delays: 8, passengers: 2150 },
    { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', x: 12, y: 32, status: 'normal', flights: 38, delays: 2, passengers: 1890 },
    { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'USA', x: 20, y: 28, status: 'warning', flights: 42, delays: 5, passengers: 2010 },
    { code: 'YYZ', name: 'Pearson International', city: 'Toronto', country: 'Canada', x: 22, y: 22, status: 'normal', flights: 28, delays: 1, passengers: 1340 },
    
    // Europe
    { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', x: 48, y: 20, status: 'normal', flights: 52, delays: 3, passengers: 2480 },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', x: 50, y: 22, status: 'warning', flights: 41, delays: 4, passengers: 1950 },
    { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', x: 52, y: 21, status: 'normal', flights: 39, delays: 2, passengers: 1860 },
    { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', x: 50, y: 19, status: 'normal', flights: 35, delays: 1, passengers: 1670 },
    { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', x: 53, y: 28, status: 'normal', flights: 29, delays: 2, passengers: 1380 },
    
    // Middle East
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', x: 62, y: 35, status: 'normal', flights: 67, delays: 3, passengers: 3180 },
    { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', x: 60, y: 36, status: 'normal', flights: 44, delays: 1, passengers: 2090 },
    
    // Asia Pacific
    { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', x: 85, y: 32, status: 'warning', flights: 48, delays: 6, passengers: 2280 },
    { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', x: 83, y: 30, status: 'normal', flights: 41, delays: 2, passengers: 1950 },
    { code: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', x: 78, y: 52, status: 'normal', flights: 54, delays: 2, passengers: 2570 },
    { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', x: 80, y: 42, status: 'disrupted', flights: 39, delays: 9, passengers: 1850 },
    { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', x: 76, y: 48, status: 'normal', flights: 36, delays: 3, passengers: 1710 },
    { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India', x: 70, y: 38, status: 'warning', flights: 43, delays: 7, passengers: 2050 },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', x: 68, y: 42, status: 'normal', flights: 37, delays: 4, passengers: 1760 },
    
    // Oceania
    { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', x: 90, y: 70, status: 'normal', flights: 31, delays: 1, passengers: 1470 },
    { code: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'Australia', x: 88, y: 72, status: 'normal', flights: 27, delays: 2, passengers: 1280 },
    
    // Africa
    { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', x: 56, y: 40, status: 'normal', flights: 24, delays: 3, passengers: 1140 },
    { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', x: 58, y: 68, status: 'normal', flights: 22, delays: 1, passengers: 1050 }
  ]

  // Flight routes (showing major connections)
  const routes = [
    { from: 'JFK', to: 'LHR', status: 'active', flights: 12 },
    { from: 'LAX', to: 'NRT', status: 'delayed', flights: 8 },
    { from: 'DXB', to: 'SIN', status: 'active', flights: 15 },
    { from: 'LHR', to: 'DXB', status: 'active', flights: 18 },
    { from: 'FRA', to: 'DEL', status: 'active', flights: 10 },
    { from: 'HKG', to: 'SYD', status: 'disrupted', flights: 6 },
    { from: 'CDG', to: 'JFK', status: 'active', flights: 9 },
    { from: 'SIN', to: 'SYD', status: 'active', flights: 11 },
    { from: 'DOH', to: 'BOM', status: 'active', flights: 7 },
    { from: 'ICN', to: 'LAX', status: 'delayed', flights: 5 }
  ]

  // Weather conditions
  const weatherData = [
    { x: 22, y: 25, type: 'storm', severity: 'high', description: 'Thunderstorms' },
    { x: 80, y: 42, type: 'rain', severity: 'medium', description: 'Heavy Rain' },
    { x: 85, y: 32, type: 'wind', severity: 'medium', description: 'Strong Winds' },
    { x: 50, y: 22, type: 'cloud', severity: 'low', description: 'Overcast' }
  ]

  const getAirport = (code) => airports.find(a => a.code === code)

  const getStatusColor = (status) => {
    switch (status) {
      case 'disrupted': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'normal': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getRouteColor = (status) => {
    switch (status) {
      case 'disrupted': return 'stroke-red-500'
      case 'delayed': return 'stroke-yellow-500'
      case 'active': return 'stroke-green-500'
      default: return 'stroke-gray-400'
    }
  }

  const getWeatherIcon = (type) => {
    switch (type) {
      case 'storm': return CloudRain
      case 'rain': return CloudRain
      case 'wind': return Wind
      case 'cloud': return Cloud
      default: return Sun
    }
  }

  const filteredAirports = airports.filter(airport => {
    if (filters.station && airport.code !== filters.station.toUpperCase()) return false
    if (filters.region) {
      const regionMap = {
        'na': ['USA', 'Canada'],
        'eu': ['UK', 'France', 'Germany', 'Netherlands', 'Italy'],
        'me': ['UAE', 'Qatar'],
        'asia': ['Japan', 'South Korea', 'Singapore', 'Hong Kong', 'Thailand', 'India'],
        'oceania': ['Australia'],
        'africa': ['Egypt', 'South Africa']
      }
      if (!regionMap[filters.region]?.includes(airport.country)) return false
    }
    return true
  })

  const handleAirportClick = (airport) => {
    setSelectedAirport(airport)
    if (airport.status === 'disrupted' || airport.status === 'warning') {
      onSelectDisruption({
        type: 'airport',
        location: airport.code,
        severity: airport.status,
        affectedFlights: airport.delays,
        details: `${airport.delays} delayed flights at ${airport.name}`
      })
    }
  }

  const toggleLayer = (layer) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Network Operations
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disruptions">Disruptions</SelectItem>
                  <SelectItem value="routes">Flight Routes</SelectItem>
                  <SelectItem value="traffic">Traffic Density</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={mapLayers.disruptions ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayer('disruptions')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Disruptions
              </Button>
              <Button
                variant={mapLayers.routes ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayer('routes')}
              >
                <Navigation className="h-4 w-4 mr-1" />
                Routes
              </Button>
              <Button
                variant={mapLayers.weather ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayer('weather')}
              >
                <CloudRain className="h-4 w-4 mr-1" />
                Weather
              </Button>
              <Button
                variant={mapLayers.traffic ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLayer('traffic')}
              >
                <Activity className="h-4 w-4 mr-1" />
                Traffic
              </Button>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Normal
              </Badge>
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                Warning
              </Badge>
              <Badge variant="outline" className="text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                Disrupted
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* World Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 border-2 border-slate-200/50">
            {/* Subtle grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 1px 1px, rgba(100,116,139,0.5) 1px, transparent 0)
                `,
                backgroundSize: '40px 40px'
              }}
            />
            
            {/* World Map Base Layer - Increased width by 20% */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[120%] h-full max-w-[76.8rem] max-h-[550px]">
                <img
                  src={worldMapImage}
                  alt="World Map"
                  className="w-full h-full object-contain opacity-100 drop-shadow-sm"
                  style={{ 
                    filter: 'brightness(1.05) contrast(1.1) saturate(1.1)', 
                    mixBlendMode: 'multiply'
                  }}
                />
                
                {/* SVG Overlay for Interactive Elements */}
                <svg 
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 80"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Flight Routes */}
                  {mapLayers.routes && routes.map((route, index) => {
                    const fromAirport = getAirport(route.from)
                    const toAirport = getAirport(route.to)
                    if (!fromAirport || !toAirport) return null
                    
                    return (
                      <g key={`route-${index}`}>
                        <path
                          d={`M ${fromAirport.x} ${fromAirport.y} Q ${(fromAirport.x + toAirport.x) / 2} ${Math.min(fromAirport.y, toAirport.y) - 5} ${toAirport.x} ${toAirport.y}`}
                          stroke={route.status === 'disrupted' ? '#ef4444' : route.status === 'delayed' ? '#eab308' : '#22c55e'}
                          strokeWidth="0.4"
                          fill="none"
                          opacity="0.85"
                          strokeDasharray={route.status === 'disrupted' ? '2,2' : ''}
                          className="drop-shadow-sm"
                        >
                          {animateFlights && (
                            <animate
                              attributeName="stroke-dashoffset"
                              values="0;4"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          )}
                        </path>
                        
                        {/* Flight indicator */}
                        {animateFlights && (
                          <circle r="0.4" fill="#3b82f6" opacity="0.9" className="drop-shadow-sm">
                            <animateMotion
                              dur="8s"
                              repeatCount="indefinite"
                              rotate="auto"
                            >
                              <mpath href={`#route-path-${index}`} />
                            </animateMotion>
                          </circle>
                        )}
                      </g>
                    )
                  })}
                  
                  {/* Weather Indicators */}
                  {mapLayers.weather && weatherData.map((weather, index) => {
                    const WeatherIcon = getWeatherIcon(weather.type)
                    return (
                      <g key={`weather-${index}`}>
                        <circle
                          cx={weather.x}
                          cy={weather.y}
                          r={weather.severity === 'high' ? '3.5' : weather.severity === 'medium' ? '2.5' : '2'}
                          fill={weather.severity === 'high' ? '#ef4444' : weather.severity === 'medium' ? '#eab308' : '#6b7280'}
                          opacity="0.5"
                          className="drop-shadow-sm"
                        />
                        <foreignObject
                          x={weather.x - 1}
                          y={weather.y - 1}
                          width="2"
                          height="2"
                        >
                          <WeatherIcon className="w-full h-full text-white drop-shadow-md" />
                        </foreignObject>
                      </g>
                    )
                  })}
                  
                  {/* Airport Markers */}
                  {filteredAirports.map((airport) => (
                    <g key={airport.code}>
                      {/* Status Ring */}
                      <circle
                        cx={airport.x}
                        cy={airport.y}
                        r="2.5"
                        fill="none"
                        stroke={airport.status === 'disrupted' ? '#ef4444' : airport.status === 'warning' ? '#eab308' : '#22c55e'}
                        strokeWidth="0.5"
                        opacity="0.95"
                        className="drop-shadow-sm"
                      />
                      
                      {/* Airport Dot */}
                      <circle
                        cx={airport.x}
                        cy={airport.y}
                        r="1.4"
                        fill={airport.status === 'disrupted' ? '#ef4444' : airport.status === 'warning' ? '#eab308' : '#22c55e'}
                        className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
                        onClick={() => handleAirportClick(airport)}
                      />
                      
                      {/* Pulse Animation for Disrupted Airports */}
                      {airport.status === 'disrupted' && (
                        <circle
                          cx={airport.x}
                          cy={airport.y}
                          r="1.4"
                          fill="#ef4444"
                          opacity="0.7"
                        >
                          <animate
                            attributeName="r"
                            values="1.4;4;1.4"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.7;0;0.7"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      
                      {/* Airport Label */}
                      <text
                        x={airport.x}
                        y={airport.y - 3.5}
                        textAnchor="middle"
                        fontSize="1.4"
                        fill="#0f172a"
                        fontWeight="700"
                        className="pointer-events-none drop-shadow-md"
                        style={{ 
                          textShadow: '0 0 4px rgba(255,255,255,1), 0 1px 2px rgba(255,255,255,0.8)',
                          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                        }}
                      >
                        {airport.code}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
            
            {/* Decorative corner elements */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-20"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full opacity-15"></div>
            
            {/* Map border highlight */}
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-blue-200/30 pointer-events-none"></div>
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Flights</p>
                <p className="text-xl font-semibold">847</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Disruptions</p>
                <p className="text-xl font-semibold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Passengers</p>
                <p className="text-xl font-semibold">42,158</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">On-Time Performance</p>
                <p className="text-xl font-semibold">89.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Airport Details */}
      {selectedAirport && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedAirport.name} ({selectedAirport.code})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAirport(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{selectedAirport.city}, {selectedAirport.country}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Flights</p>
                <p className="font-medium">{selectedAirport.flights}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delays</p>
                <p className="font-medium text-orange-600">{selectedAirport.delays}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passengers</p>
                <p className="font-medium">{selectedAirport.passengers.toLocaleString()}</p>
              </div>
            </div>
            
            {selectedAirport.status !== 'normal' && (
              <div className="mt-4">
                <Button onClick={() => onSelectDisruption({
                  type: 'airport',
                  location: selectedAirport.code,
                  severity: selectedAirport.status,
                  affectedFlights: selectedAirport.delays
                })}>
                  View Recovery Options
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real-time Updates */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Real-time data updates every 30 seconds</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs">Live</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}