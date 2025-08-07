import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Globe, 
  Plane, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Navigation,
  Radar,
  Layers,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react'

export function WorldMap() {
  const [selectedView, setSelectedView] = useState('routes')
  const [isRealtime, setIsRealtime] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [liveData, setLiveData] = useState({
    activeFlights: 89,
    onSchedule: 47,
    delayed: 18,
    disrupted: 3,
  });

  // Simulate real-time data updates
  useEffect(() => {
    let intervalId;
    if (isRealtime) {
      intervalId = setInterval(() => {
        // In a real app, this would fetch data from an API
        const newActiveFlights = Math.floor(Math.random() * 20) + 70;
        const newOnSchedule = Math.floor(Math.random() * 10) + 40;
        const newDelayed = Math.floor(Math.random() * 5) + 15;
        const newDisrupted = Math.floor(Math.random() * 2);

        setLiveData({
          activeFlights: newActiveFlights,
          onSchedule: newOnSchedule,
          delayed: newDelayed,
          disrupted: newDisrupted,
        });
        setLastUpdate(new Date());
      }, 15000); // Update every 15 seconds
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isRealtime]);

  // Helper function to convert lat/lng to SVG coordinates
  const latLngToXY = (lat, lng) => {
    const x = ((lng + 180) / 360) * 1000
    const y = ((90 - lat) / 180) * 500
    return { x, y }
  }

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time': return 'text-green-600'
      case 'delayed': return 'text-flydubai-orange'
      case 'en-route': return 'text-flydubai-blue'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Enhanced sample data for Flydubai network
  const hubs = [
    { id: 'DXB', name: 'Dubai International', lat: 25.2532, lng: 55.3657, type: 'primary', flights: 34 }
  ]

  const destinations = [
    // Middle East & Gulf
    { id: 'DOH', name: 'Doha', lat: 25.2730, lng: 51.6080, flights: 8 },
    { id: 'KWI', name: 'Kuwait City', lat: 29.2267, lng: 47.9690, flights: 6 },
    { id: 'MCT', name: 'Muscat', lat: 23.5933, lng: 58.2844, flights: 5 },
    { id: 'BAH', name: 'Bahrain', lat: 26.2671, lng: 50.6333, flights: 4 },

    // Indian Subcontinent
    { id: 'BOM', name: 'Mumbai', lat: 19.0896, lng: 72.8656, flights: 12 },
    { id: 'DEL', name: 'Delhi', lat: 28.5665, lng: 77.1031, flights: 10 },
    { id: 'BLR', name: 'Bangalore', lat: 13.1986, lng: 77.7066, flights: 8 },
    { id: 'COK', name: 'Kochi', lat: 10.1556, lng: 76.4019, flights: 6 },
    { id: 'KHI', name: 'Karachi', lat: 24.9056, lng: 67.1608, flights: 7 },
    { id: 'CMB', name: 'Colombo', lat: 7.1807, lng: 79.8841, flights: 5 },

    // Europe
    { id: 'IST', name: 'Istanbul', lat: 41.2619, lng: 28.7419, flights: 9 },
    { id: 'PRG', name: 'Prague', lat: 50.1008, lng: 14.2632, flights: 4 },
    { id: 'BCN', name: 'Barcelona', lat: 41.2974, lng: 2.0833, flights: 3 },
    { id: 'BEG', name: 'Belgrade', lat: 44.8184, lng: 20.3090, flights: 4 },
    { id: 'SKP', name: 'Skopje', lat: 41.9614, lng: 21.6214, flights: 3 },

    // Central Asia & Iran
    { id: 'TBZ', name: 'Tabriz', lat: 38.1339, lng: 46.2353, flights: 3 },
    { id: 'KBL', name: 'Kabul', lat: 34.5658, lng: 69.2123, flights: 2 },

    // Africa
    { id: 'SLL', name: 'Salalah', lat: 17.0387, lng: 54.0917, flights: 4 },
    { id: 'KRT', name: 'Khartoum', lat: 15.5894, lng: 32.5732, flights: 2 }
  ]

  // Sample active flights
  const activeFlights = [
    { id: 'FZ215', route: 'DXB-BOM', lat: 22.5, lng: 64.0, status: 'en-route', eta: '14:30', progress: 65 },
    { id: 'FZ561', route: 'DXB-DEL', lat: 26.8, lng: 66.2, status: 'delayed', eta: '16:45', progress: 45 },
    { id: 'FZ789', route: 'DXB-IST', lat: 33.4, lng: 44.3, status: 'en-route', eta: '18:20', progress: 78 },
    { id: 'FZ134', route: 'DXB-KHI', lat: 25.0, lng: 61.5, status: 'on-time', eta: '15:15', progress: 82 },
    { id: 'FZ892', route: 'DXB-COK', lat: 18.2, lng: 68.1, status: 'en-route', eta: '17:10', progress: 55 }
  ]

  // Sample disruptions
  const disruptions = [
    { 
      id: 'D001', 
      location: 'BOM', 
      type: 'weather', 
      severity: 'medium',
      description: 'Heavy monsoon rains affecting operations',
      impact: '2-3 hour delays expected'
    },
    { 
      id: 'D002', 
      location: 'DEL', 
      type: 'technical', 
      severity: 'low',
      description: 'Runway maintenance in progress',
      impact: 'Minor delays, 15-30 minutes'
    },
    { 
      id: 'D003', 
      location: 'KHI', 
      type: 'security', 
      severity: 'high',
      description: 'Security alert at terminal',
      impact: 'All flights temporarily suspended'
    }
  ]

  return (
    <Card className="w-full min-h-[700px] h-[700px] border-flydubai-blue/30 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 relative z-10">
      <CardHeader className="border-b border-flydubai-blue/10 bg-white/80 backdrop-blur-sm px-[24px] py-[12px] relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Globe className="h-6 w-6 text-flydubai-blue" />
              <div className="absolute inset-0 animate-pulse bg-flydubai-blue rounded-full opacity-20"></div>
            </div>
            <div>
              <CardTitle className="text-flydubai-navy">Flydubai Global Network</CardTitle>
              <p className="text-sm text-muted-foreground underline">Real-time flight operations & network monitoring</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Tabs value={selectedView} onValueChange={setSelectedView} className="w-auto pb-8 relative z-30">
              <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 shadow-sm">
                <TabsTrigger 
                  value="routes" 
                  className="data-[state=active]:bg-[#006496] data-[state=active]:text-white text-[#000000] flex items-center justify-center "
                >

                  <span className="text-[14px]  pt-1 pb-1"><Navigation className="flex-shrink-0" />Routes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="flights" 
                  className="data-[state=active]:bg-[#006496] data-[state=active]:text-white text-[#000000] flex items-center justify-center gap-1 whitespace-nowrap"
                >

                  <span className="text-[14px] pt-1 pb-1"><Plane className="flex-shrink-0" />Live Flights</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="status" 
                  className="data-[state=active]:bg-[#006496] data-[state=active]:text-white text-[#000000] text-m flex items-center justify-center gap-1 whitespace-nowrap"
                >

                  <span className="text-[14px] pt-1 pb-1"> <AlertTriangle className="flex-shrink-0" />Disruptions</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsRealtime(!isRealtime)}
                className={`border-flydubai-blue text-flydubai-blue hover:bg-blue-50 text-xs h-8 ${isRealtime ? 'bg-blue-50' : ''}`}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isRealtime ? 'animate-spin' : ''}`} />
                Real-time
              </Button>

              <Select defaultValue="global">
                <SelectTrigger className="w-[120px] h-8 border-flydubai-blue/30 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global View</SelectItem>
                  <SelectItem value="gcc">GCC Region</SelectItem>
                  <SelectItem value="india">Indian Subcontinent</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-full min-h-[620px] relative z-10">
        <div className="h-full min-h-[620px] relative">
          {/* Interactive Map - Full Width */}
          <div className="w-full relative z-10">
            <div 
              className="relative w-full h-full min-h-[620px] rounded-lg border-2 border-flydubai-blue/20 overflow-hidden z-10"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              
              {/* Live Data Summary Bar */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-xl z-30">
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-flydubai-blue rounded-full"></div>
                    <span className="font-medium text-flydubai-blue">{liveData.activeFlights} Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-600">{liveData.onSchedule} On-Time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-flydubai-orange rounded-full"></div>
                    <span className="font-medium text-flydubai-orange">{liveData.delayed} Delayed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-red-600">{liveData.disrupted} Disrupted</span>
                  </div>
                </div>
              </div>
              {/* Overlay gradient for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-700/60 z-10"></div>

              {/* World map SVG overlay */}
              <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full min-h-[620px] z-20">
                <defs>
                  <pattern id="ocean" patternUnits="userSpaceOnUse" width="4" height="4">
                    <rect width="4" height="4" fill="#1e3a8a" opacity="0.1"/>
                    <circle cx="2" cy="2" r="0.5" fill="#3b82f6" opacity="0.3"/>
                  </pattern>
                  <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#10b981', stopOpacity:0.2}} />
                    <stop offset="100%" style={{stopColor:'#059669', stopOpacity:0.1}} />
                  </linearGradient>
                </defs>

                {/* Flight Routes */}
                {selectedView === 'routes' && (
                  <g className="routes">
                    {/* Major routes from DXB hub */}
                    {destinations.map((dest, index) => {
                      const hubCoords = latLngToXY(hubs[0].lat, hubs[0].lng)
                      const destCoords = latLngToXY(dest.lat, dest.lng)
                      return (
                        <g key={`route-${dest.id}`}>
                          <path
                            d={`M${hubCoords.x},${hubCoords.y} Q${(hubCoords.x + destCoords.x) / 2},${Math.min(hubCoords.y, destCoords.y) - 30} ${destCoords.x},${destCoords.y}`}
                            fill="none"
                            stroke="#00A8E6"
                            strokeWidth="2"
                            opacity="0.8"
                            strokeDasharray="5,5"
                          />
                          <circle
                            cx={(hubCoords.x + destCoords.x) / 2}
                            cy={Math.min(hubCoords.y, destCoords.y) - 30}
                            r="2"
                            fill="#00A8E6"
                            opacity="0.8"
                          >
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                          </circle>
                        </g>
                      )
                    })}
                  </g>
                )}

                {/* Active Flight Paths */}
                {selectedView === 'flights' && (
                  <g className="flight-paths">
                    {activeFlights.map((flight) => {
                      const flightCoords = latLngToXY(flight.lat, flight.lng)
                      return (
                        <g key={`flight-path-${flight.id}`}>
                          <circle
                            cx={flightCoords.x}
                            cy={flightCoords.y}
                            r="8"
                            fill={flight.status === 'delayed' ? '#FF6B00' : '#00A8E6'}
                            opacity="0.8"
                          >
                            <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle
                            cx={flightCoords.x}
                            cy={flightCoords.y}
                            r="4"
                            fill="white"
                            opacity="0.9"
                          />
                        </g>
                      )
                    })}
                  </g>
                )}
              </svg>

              {/* Hub Airports */}
              {hubs.map((hub) => {
                const coords = latLngToXY(hub.lat, hub.lng)
                return (
                  <div
                    key={hub.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{ 
                      left: `${(coords.x / 1000) * 100}%`, 
                      top: `${(coords.y / 500) * 100}%` 
                    }}
                  >
                    <div className={`relative`}>
                      <div className={`w-8 h-8 rounded-full border-4 ${hub.type === 'primary' ? 'bg-flydubai-blue border-white' : 'bg-flydubai-navy border-white'} shadow-xl flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs">{hub.id}</span>
                        <div className="absolute inset-0 rounded-full animate-ping bg-flydubai-blue opacity-30"></div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                      <div className="font-semibold text-flydubai-blue">{hub.name} ({hub.id})</div>
                      <div className="text-gray-600">{hub.flights} active flights</div>
                      <div className="text-green-600 text-xs">● Operational</div>
                    </div>
                  </div>
                )
              })}

              {/* Destination Airports */}
              {destinations.map((dest) => {
                const coords = latLngToXY(dest.lat, dest.lng)
                return (
                  <div
                    key={dest.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{ 
                      left: `${(coords.x / 1000) * 100}%`, 
                      top: `${(coords.y / 500) * 100}%` 
                    }}
                  >
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full border-2 bg-white border-flydubai-blue shadow-lg flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-flydubai-blue"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                      <div className="font-semibold text-flydubai-navy">{dest.name} ({dest.id})</div>
                      <div className="text-gray-600">{dest.flights} flights today</div>
                      <div className="text-green-600 text-xs">● Operational</div>
                    </div>
                  </div>
                )
              })}

              {/* Active Flights */}
              {selectedView === 'flights' && activeFlights.map((flight) => {
                const coords = latLngToXY(flight.lat, flight.lng)
                return (
                  <div
                    key={flight.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{ 
                      left: `${(coords.x / 1000) * 100}%`, 
                      top: `${(coords.y / 500) * 100}%` 
                    }}
                  >
                    <div className="relative">
                      <div className={`w-6 h-6 rounded-full ${flight.status === 'delayed' ? 'bg-flydubai-orange' : flight.status === 'en-route' ? 'bg-flydubai-blue' : 'bg-purple-500'} border-2 border-white shadow-lg flex items-center justify-center animate-pulse`}>
                        <Plane className="w-3 h-3 text-white transform rotate-45" />
                      </div>
                      <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-30"></div>
                    </div>
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                      <div className="font-semibold text-flydubai-blue">{flight.id} - {flight.route}</div>
                      <div className="text-gray-600">Status: <span className={getStatusColor(flight.status)}>{flight.status}</span></div>
                      <div className="text-gray-600">ETA: {flight.eta}</div>
                      <div className="text-gray-600">Progress: {flight.progress}%</div>
                    </div>
                  </div>
                )
              })}

              {/* Disruption Indicators */}
              {selectedView === 'status' && disruptions.map((disruption) => {
                const airport = [...hubs, ...destinations].find(a => a.id === disruption.location)
                if (!airport) return null

                const coords = latLngToXY(airport.lat, airport.lng)
                return (
                  <div
                    key={disruption.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                    style={{ 
                      left: `${(coords.x / 1000) * 100}%`, 
                      top: `${(coords.y / 500) * 100}%` 
                    }}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full ${disruption.severity === 'high' ? 'bg-red-500' : disruption.severity === 'medium' ? 'bg-flydubai-orange' : 'bg-yellow-500'} border-4 border-white shadow-xl flex items-center justify-center animate-bounce`}>
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-50"></div>
                    </div>
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-30">
                      <div className="font-semibold text-red-600">{disruption.type.toUpperCase()} ALERT</div>
                      <div className="text-gray-900 font-medium">{airport.name}</div>
                      <div className="text-gray-700">{disruption.description}</div>
                      <div className="text-gray-600">{disruption.impact}</div>
                      <div className={`text-xs font-medium ${disruption.severity === 'high' ? 'text-red-600' : disruption.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'}`}>
                        {disruption.severity.toUpperCase()} SEVERITY
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Enhanced Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 text-xs shadow-xl z-30 max-w-xs">
                <h4 className="font-semibold mb-3 text-flydubai-navy">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-flydubai-blue border-2 border-white shadow-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">FZ</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                    <span className="text-flydubai-navy">Primary Hub (DXB)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-white border-2 border-flydubai-blue shadow-sm flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-flydubai-blue"></div>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                    </div>
                    <span className="text-flydubai-navy">Destinations</span>
                  </div>
                  {selectedView === 'flights' && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-flydubai-blue border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <Plane className="w-2.5 h-2.5 text-white transform rotate-45" />
                      </div>
                      <span className="text-flydubai-navy">Active Flights</span>
                    </div>
                  )}
                  {selectedView === 'routes' && (
                    <div className="flex items-center gap-3">
                      <svg width="20" height="8" className="flex-shrink-0">
                        <path d="M0,4 L20,4" stroke="#00A8E6" strokeWidth="2" strokeDasharray="3,2" opacity="0.6"/>
                      </svg>
                      <span className="text-flydubai-navy">Flight Routes</span>
                    </div>
                  )}
                  {selectedView === 'status' && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-flydubai-navy">Disruptions</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Network Performance Indicator */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 text-xs shadow-xl z-30 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isRealtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="font-semibold text-flydubai-navy">Network Status</span>
                </div>
                <div className="space-y-1">
                  <div className="text-green-600 font-medium">
                    {liveData.disrupted === 0 ? 'Operational' : liveData.disrupted < 5 ? 'Minor Issues' : 'Disruptions'}
                  </div>
                  <div className="text-gray-600">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                  <div className="text-gray-600">
                    {((liveData.onSchedule / liveData.activeFlights) * 100).toFixed(1)}% On-Time Performance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}