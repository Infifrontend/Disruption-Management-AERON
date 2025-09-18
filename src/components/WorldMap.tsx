import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { dashboardAnalytics } from "../services/dashboardAnalytics";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Globe,
  Plane,
  AlertTriangle,
  Navigation,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

import { useAirlineTheme } from "./../hooks/useAirlineTheme";

export function WorldMap() {
   const { airlineConfig } = useAirlineTheme();
  const [selectedView, setSelectedView] = useState("routes");
  const [isRealtime, setIsRealtime] = useState(true);
  const [_lastUpdate, setLastUpdate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [liveData, setLiveData] = useState({
    activeFlights: 0,
    onSchedule: 0,
    delayed: 0,
    disrupted: 0,
  });
  const [realFlightData, setRealFlightData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real-time data from database
  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);
        const analytics = await dashboardAnalytics.getDashboardAnalytics();
        setRealFlightData(analytics);
        
        // Update live data from real analytics
        setLiveData({
          activeFlights: analytics.networkOverview.activeFlights || 0,
          onSchedule: Math.round((analytics.networkOverview.activeFlights || 0) * (parseFloat(analytics.networkOverview.otpPerformance) / 100) || 0),
          delayed: (analytics.networkOverview.disruptions || 0) - (analytics.operationalInsights.criticalPriority || 0),
          disrupted: analytics.operationalInsights.criticalPriority || 0,
        });
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch flight data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
    
    let intervalId: any;
    if (isRealtime) {
      intervalId = setInterval(fetchFlightData, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRealtime]);

  // Helper function to convert lat/lng to SVG coordinates
  const latLngToXY = (lat:any, lng:any) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  // Helper function for status colors
  const getStatusColor = (status :any) => {
    switch (status) {
      case "on-time":
        return "text-green-600";
      case "delayed":
        return "text-flydubai-orange";
      case "en-route":
        return "text-flydubai-blue";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Zoom control functions
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  // Enhanced sample data for Flydubai network
  const hubs = [
    {
      id: "DXB",
      name: "Dubai International",
      lat: 25.2532,
      lng: 55.3657,
      type: "primary",
      flights: 34,
    },
  ];

  const destinations = [
    // From DXB to Qatar
    { id: "DOH", name: "Doha", lat: 25.273, lng: 51.608, flights: 8 },

    // From DXB to India
    { id: "DEL", name: "Delhi", lat: 28.5665, lng: 77.1031, flights: 10 },

    { id: "BLR", name: "Bangalore", lat: 13.1986, lng: 77.7066, flights: 9 },
    { id: "COK", name: "Kochi", lat: 10.1556, lng: 76.4019, flights: 7 },
    { id: "HYD", name: "Hyderabad", lat: 17.2403, lng: 78.4294, flights: 6 },
    // Europe
    { id: "IST", name: "Istanbul", lat: 41.2619, lng: 28.7419, flights: 9 },
    { id: "PRG", name: "Prague", lat: 50.1008, lng: 14.2632, flights: 4 },
    { id: "BCN", name: "Barcelona", lat: 41.2974, lng: 2.0833, flights: 3 },
    { id: "BEG", name: "Belgrade", lat: 44.8184, lng: 20.309, flights: 4 },
    { id: "SKP", name: "Skopje", lat: 41.9614, lng: 21.6214, flights: 3 },

    // From DXB to UK
    {
      id: "LHR",
      name: "London Heathrow",
      lat: 51.47,
      lng: -0.4543,
      flights: 11,
    },
    {
      id: "LGW",
      name: "London Gatwick",
      lat: 51.1537,
      lng: -0.1821,
      flights: 5,
    },
  ];

  // Sample active flights
  const activeFlights = [
    {
      id: "FZ215",
      route: "DXB-BOM",
      lat: 22.5,
      lng: 64.0,
      status: "en-route",
      eta: "14:30",
      progress: 65,
    },
    {
      id: "FZ561",
      route: "DXB-DEL",
      lat: 26.8,
      lng: 66.2,
      status: "delayed",
      eta: "16:45",
      progress: 45,
    },
    {
      id: "FZ789",
      route: "DXB-IST",
      lat: 33.4,
      lng: 44.3,
      status: "en-route",
      eta: "18:20",
      progress: 78,
    },
    {
      id: "FZ134",
      route: "DXB-KHI",
      lat: 25.0,
      lng: 61.5,
      status: "on-time",
      eta: "15:15",
      progress: 82,
    },
    {
      id: "FZ892",
      route: "DXB-COK",
      lat: 18.2,
      lng: 68.1,
      status: "en-route",
      eta: "17:10",
      progress: 55,
    },
  ];

  // Sample disruptions
  const disruptions = [
    {
      id: "D001",
      location: "BOM",
      type: "weather",
      severity: "medium",
      description: "Heavy monsoon rains affecting operations",
      impact: "2-3 hour delays expected",
    },
    {
      id: "D002",
      location: "DEL",
      type: "technical",
      severity: "low",
      description: "Runway maintenance in progress",
      impact: "Minor delays, 15-30 minutes",
    },
    {
      id: "D003",
      location: "KHI",
      type: "security",
      severity: "high",
      description: "Security alert at terminal",
      impact: "All flights temporarily suspended",
    },
  ];

  return (
    <Card className="w-full min-h-[700px] border-flydubai-blue/30 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 relative z-10">
      <CardHeader className="border-b border-flydubai-blue/10 bg-white/80 backdrop-blur-sm px-6 py-4 relative z-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Globe className="h-6 w-6 text-flydubai-blue" />
                <div className="absolute inset-0 animate-pulse bg-flydubai-blue rounded-full opacity-20"></div>
              </div>
              <div>
                <CardTitle className="text-flydubai-navy">
                  {airlineConfig.displayName} Global Network
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time flight operations & network monitoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-flydubai-blue/30 rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-6 w-6 p-0 hover:bg-blue-50"
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="w-3 h-3 text-flydubai-blue" />
                </Button>
                <span className="text-xs text-flydubai-blue font-medium px-1 min-w-[40px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-6 w-6 p-0 hover:bg-blue-50"
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="w-3 h-3 text-flydubai-blue" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetView}
                  className="h-6 w-6 p-0 hover:bg-blue-50"
                  title="Reset View"
                >
                  <RotateCcw className="w-3 h-3 text-flydubai-blue" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealtime(!isRealtime)}
                className={`border-flydubai-blue text-flydubai-blue hover:bg-blue-50 text-xs h-8 ${isRealtime ? "bg-blue-50" : ""}`}
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${isRealtime ? "animate-spin" : ""}`}
                />
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

          <div className="flex justify-center">
            <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200">
              <button
                onClick={() => setSelectedView("routes")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedView === "routes"
                    ? "bg-[#006496] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <Navigation className="h-4 w-4" />
                Routes
              </button>
              <button
                onClick={() => setSelectedView("flights")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedView === "flights"
                    ? "bg-[#006496] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <Plane className="h-4 w-4" />
                Live Flights
              </button>
              <button
                onClick={() => setSelectedView("status")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedView === "status"
                    ? "bg-[#006496] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                Disruptions
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-full min-h-[620px] relative z-10">
        <div className="h-full min-h-[620px] relative">
          {/* Interactive Map - Full Width */}
          <div className="w-full relative z-10 overflow-hidden">
            <div
              className="relative w-full h-full min-h-[620px] rounded-lg border-2 border-flydubai-blue/20 overflow-hidden cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80)`,
                backgroundSize: `${100 * zoomLevel}%`,
                backgroundPosition: `${50 + panX}% ${50 + panY}%`,
                backgroundRepeat: "no-repeat",
                transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                transformOrigin: "center center",
                transition:
                  "transform 0.2s ease-out, background-size 0.2s ease-out, background-position 0.2s ease-out",
              }}
            >
              {/* Live Data Summary Bar */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-lg z-40">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-flydubai-blue rounded-full"></div>
                    <span className="font-medium text-flydubai-blue">
                      {liveData.activeFlights} Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-600">
                      {liveData.onSchedule} On-Time
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-flydubai-orange rounded-full"></div>
                    <span className="font-medium text-flydubai-orange">
                      {liveData.delayed} Delayed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-red-600">
                      {liveData.disrupted} Disrupted
                    </span>
                  </div>
                </div>
              </div>

              {/* Network Performance Indicator */}
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 text-xs shadow-lg z-40 max-w-[160px]">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isRealtime ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                  ></div>
                  <span className="font-semibold text-flydubai-navy text-xs">
                    Network Status
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-green-600 font-medium text-xs">
                    {liveData.disrupted === 0
                      ? "Operational"
                      : liveData.disrupted < 5
                        ? "Minor Issues"
                        : "Disruptions"}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {(
                      (liveData.onSchedule / liveData.activeFlights) *
                      100
                    ).toFixed(1)}
                    % OTP
                  </div>
                </div>
              </div>
              {/* Overlay gradient for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-700/60 z-10"></div>

              {/* World map SVG overlay */}
              <svg
                viewBox="0 0 1000 500"
                className="absolute inset-0 w-full h-full min-h-[620px] z-20"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease-out",
                }}
              >
                <defs>
                  <pattern
                    id="ocean"
                    patternUnits="userSpaceOnUse"
                    width="4"
                    height="4"
                  >
                    <rect width="4" height="4" fill="#1e3a8a" opacity="0.1" />
                    <circle
                      cx="2"
                      cy="2"
                      r="0.5"
                      fill="#3b82f6"
                      opacity="0.3"
                    />
                  </pattern>
                  <linearGradient
                    id="landGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#10b981", stopOpacity: 0.2 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#059669", stopOpacity: 0.1 }}
                    />
                  </linearGradient>
                </defs>

                {/* Flight Routes */}
                {selectedView === "routes" && (
                  <g className="routes">
                    {/* Major routes from DXB hub */}
                    {destinations.map((dest) => {
                      const hubCoords = latLngToXY(hubs[0].lat, hubs[0].lng);
                      const destCoords = latLngToXY(dest.lat, dest.lng);
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
                            <animate
                              attributeName="opacity"
                              values="0.4;1;0.4"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Active Flight Paths */}
                {selectedView === "flights" && (
                  <g className="flight-paths">
                    {activeFlights.map((flight) => {
                      const flightCoords = latLngToXY(flight.lat, flight.lng);
                      return (
                        <g key={`flight-path-${flight.id}`}>
                          <circle
                            cx={flightCoords.x}
                            cy={flightCoords.y}
                            r="8"
                            fill={
                              flight.status === "delayed"
                                ? "#FF6B00"
                                : "#00A8E6"
                            }
                            opacity="0.8"
                          >
                            <animate
                              attributeName="r"
                              values="6;12;6"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          <circle
                            cx={flightCoords.x}
                            cy={flightCoords.y}
                            r="4"
                            fill="white"
                            opacity="0.9"
                          />
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>

              {/* Hub Airports */}
              {hubs.map((hub) => {
                const coords = latLngToXY(hub.lat, hub.lng);
                return (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-30"
                    style={{
                      left: `${(coords.x / 1000) * 100}%`,
                      top: `${(coords.y / 500) * 100}%`,
                      transform: `translate(-50%, -50%) scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                      transformOrigin: "center center",
                      transition: "transform 0.2s ease-out",
                    }}
                  >
                    <div className={`relative`}>
                      <div
                        className={`w-8 h-8 rounded-full border-4 ${hub.type === "primary" ? "bg-flydubai-blue border-white" : "bg-flydubai-navy border-white"} shadow-xl flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-xs">
                          {hub.id}
                        </span>
                        <div className="absolute inset-0 rounded-full animate-ping bg-flydubai-blue opacity-30"></div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                      <div className="font-semibold text-flydubai-blue">
                        {hub.name} ({hub.id})
                      </div>
                      <div className="text-gray-600">
                        {hub.flights} active flights
                      </div>
                      <div className="text-green-600 text-xs">
                        ● Operational
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Destination Airports */}
              {destinations.map((dest) => {
                const coords = latLngToXY(dest.lat, dest.lng);
                return (
                  <div
                    key={dest.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-30"
                    style={{
                      left: `${(coords.x / 1000) * 100}%`,
                      top: `${(coords.y / 500) * 100}%`,
                      transform: `translate(-50%, -50%) scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                      transformOrigin: "center center",
                      transition: "transform 0.2s ease-out",
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`w-4 h-4 rounded-full border-2 bg-white border-flydubai-blue shadow-lg flex items-center justify-center`}
                      >
                        <div className="w-2 h-2 rounded-full bg-flydubai-blue"></div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                      <div className="font-semibold text-flydubai-navy">
                        {dest.name} ({dest.id})
                      </div>
                      <div className="text-gray-600">
                        {dest.flights} flights today
                      </div>
                      <div className="text-green-600 text-xs">
                        ● Operational
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Active Flights */}
              {selectedView === "flights" &&
                activeFlights.map((flight) => {
                  const coords = latLngToXY(flight.lat, flight.lng);
                  return (
                    <div
                      key={flight.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-30"
                      style={{
                        left: `${(coords.x / 1000) * 100}%`,
                        top: `${(coords.y / 500) * 100}%`,
                        transform: `translate(-50%, -50%) scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                        transformOrigin: "center center",
                        transition: "transform 0.2s ease-out",
                      }}
                    >
                      <div className="relative">
                        <div
                          className={`w-6 h-6 rounded-full ${flight.status === "delayed" ? "bg-flydubai-orange" : flight.status === "en-route" ? "bg-flydubai-blue" : "bg-purple-500"} border-2 border-white shadow-lg flex items-center justify-center animate-pulse`}
                        >
                          <Plane className="w-3 h-3 text-white transform rotate-45" />
                        </div>
                        <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-30"></div>
                      </div>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20">
                        <div className="font-semibold text-flydubai-blue">
                          {flight.id} - {flight.route}
                        </div>
                        <div className="text-gray-600">
                          Status:{" "}
                          <span className={getStatusColor(flight.status)}>
                            {flight.status}
                          </span>
                        </div>
                        <div className="text-gray-600">ETA: {flight.eta}</div>
                        <div className="text-gray-600">
                          Progress: {flight.progress}%
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Disruption Indicators */}
              {selectedView === "status" &&
                disruptions.map((disruption) => {
                  const airport = [...hubs, ...destinations].find(
                    (a) => a.id === disruption.location,
                  );
                  if (!airport) return null;

                  const coords = latLngToXY(airport.lat, airport.lng);
                  return (
                    <div
                      key={disruption.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-40"
                      style={{
                        left: `${(coords.x / 1000) * 100}%`,
                        top: `${(coords.y / 500) * 100}%`,
                        transform: `translate(-50%, -50%) scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                        transformOrigin: "center center",
                        transition: "transform 0.2s ease-out",
                      }}
                    >
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full ${disruption.severity === "high" ? "bg-red-500" : disruption.severity === "medium" ? "bg-flydubai-orange" : "bg-yellow-500"} border-4 border-white shadow-xl flex items-center justify-center animate-bounce`}
                        >
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-50"></div>
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-30">
                        <div className="font-semibold text-red-600">
                          {disruption.type.toUpperCase()} ALERT
                        </div>
                        <div className="text-gray-900 font-medium">
                          {airport.name}
                        </div>
                        <div className="text-gray-700">
                          {disruption.description}
                        </div>
                        <div className="text-gray-600">{disruption.impact}</div>
                        <div
                          className={`text-xs font-medium ${disruption.severity === "high" ? "text-red-600" : disruption.severity === "medium" ? "text-orange-600" : "text-yellow-600"}`}
                        >
                          {disruption.severity.toUpperCase()} SEVERITY
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Enhanced Legend */}
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 text-xs shadow-lg z-40 max-w-[160px]">
                <h4 className="font-semibold mb-1.5 text-flydubai-navy text-xs">
                  Legend
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-flydubai-blue border-2 border-white shadow-sm flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">
                          FZ
                        </span>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-white"></div>
                    </div>
                    <span className="text-flydubai-navy text-xs">
                      Primary Hub
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-flydubai-blue shadow-sm flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-flydubai-blue"></div>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-green-400 rounded-full border border-white"></div>
                    </div>
                    <span className="text-flydubai-navy text-xs">
                      Destinations
                    </span>
                  </div>
                  {selectedView === "flights" && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-flydubai-blue border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <Plane className="w-1.5 h-1.5 text-white transform rotate-45" />
                      </div>
                      <span className="text-flydubai-navy text-xs">
                        Active Flights
                      </span>
                    </div>
                  )}
                  {selectedView === "routes" && (
                    <div className="flex items-center gap-2">
                      <svg width="12" height="4" className="flex-shrink-0">
                        <path
                          d="M0,2 L12,2"
                          stroke="#00A8E6"
                          strokeWidth="1"
                          strokeDasharray="1,1"
                          opacity="0.6"
                        />
                      </svg>
                      <span className="text-flydubai-navy text-xs">
                        Flight Routes
                      </span>
                    </div>
                  )}
                  {selectedView === "status" && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-1.5 h-1.5 text-white" />
                      </div>
                      <span className="text-flydubai-navy text-xs">
                        Disruptions
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}