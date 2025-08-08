import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
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
  Info,
} from "lucide-react";

export function WorldMap() {
  const [selectedView, setSelectedView] = useState("routes");
  const [isRealtime, setIsRealtime] = useState(true);
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
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
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
    { id: 'IST', name: 'Istanbul', lat: 41.2619, lng: 28.7419, flights: 9 },
    { id: 'PRG', name: 'Prague', lat: 50.1008, lng: 14.2632, flights: 4 },
    { id: 'BCN', name: 'Barcelona', lat: 41.2974, lng: 2.0833, flights: 3 },
    { id: 'BEG', name: 'Belgrade', lat: 44.8184, lng: 20.3090, flights: 4 },
    { id: 'SKP', name: 'Skopje', lat: 41.9614, lng: 21.6214, flights: 3 },

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
    <Card className="w-full min-h-[700px] h-[700px] border-flydubai-blue/30 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 relative z-10">
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
                  Flydubai Global Network
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time flight operations & network monitoring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
            <Tabs
              value={selectedView}
              onValueChange={setSelectedView}
              className="w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 shadow-sm">
                <TabsTrigger
                  value="routes"
                  className="data-[state=active]:bg-[#006496] data-[state=active]:text-white text-[#000000] flex items-center justify-center gap-1"
                >
                  <Navigation className="h-3 w-3" />
                  <span className="text-sm">Routes</span>
                </TabsTrigger>
                <TabsTrigger
                  value="flights"
                  className="data-[state=active]:bg-[#006496] data-[state=active]:text-white text-[#000000] flex items-center justify-center gap-1"
                >
                  <Plane className="h-3 w-3" />
                  <span className="text-sm">Live Flights</span>
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  className="data-[state=active]:bg-[#006496] data-[state=active]:text-white text-[#000000] flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-sm">Disruptions</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-full min-h-[620px] relative z-10">
        <div className="h-full min-h-[620px] relative">
          {/* Interactive Map - Full Width */}
          <div className="w-full relative z-10">
            <div
              className="relative w-full h-full min-h-[620px] rounded-lg border-2 border-flydubai-blue/20 overflow-hidden z-10 bg-[#a8c8d8]"
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
              {/* World map SVG overlay */}
              <svg
                viewBox="0 0 1000 500"
                className="absolute inset-0 w-full h-full min-h-[620px] z-20"
              >
                <defs>
                  <linearGradient
                    id="landGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#f4e5c1", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#e6d2a1", stopOpacity: 1 }}
                    />
                  </linearGradient>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3"/>
                  </filter>
                </defs>

                {/* World Continents */}
                {/* North America */}
                <path
                  d="M50 80 L60 85 L75 75 L85 70 L100 65 L115 70 L130 75 L145 80 L160 85 L175 90 L185 95 L190 105 L185 115 L180 125 L170 135 L155 140 L140 145 L125 150 L110 155 L95 160 L80 165 L70 170 L60 175 L50 180 L45 170 L40 160 L35 150 L30 140 L25 130 L20 120 L15 110 L20 100 L30 90 L40 85 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />
                
                {/* South America */}
                <path
                  d="M80 200 L90 205 L100 210 L110 220 L115 235 L120 250 L125 265 L130 280 L135 295 L140 310 L145 325 L150 340 L155 355 L160 370 L155 380 L150 375 L145 370 L135 365 L125 360 L115 355 L105 350 L95 345 L85 340 L75 335 L70 325 L65 315 L60 305 L55 295 L50 285 L45 275 L40 265 L45 255 L50 245 L55 235 L60 225 L65 215 L70 205 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Europe */}
                <path
                  d="M350 90 L370 85 L385 80 L400 75 L415 70 L430 75 L440 80 L450 85 L460 90 L470 95 L475 105 L470 115 L465 125 L455 135 L445 140 L435 145 L425 150 L415 155 L405 160 L395 155 L385 150 L375 145 L365 140 L355 135 L345 130 L340 120 L335 110 L340 100 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Africa */}
                <path
                  d="M350 170 L370 165 L390 160 L410 155 L430 160 L450 165 L465 170 L480 180 L490 195 L495 210 L500 225 L505 240 L510 255 L515 270 L520 285 L525 300 L530 315 L525 330 L515 340 L500 350 L485 360 L470 365 L455 370 L440 375 L425 380 L410 375 L395 370 L380 365 L365 360 L350 355 L340 345 L330 335 L325 320 L320 305 L315 290 L310 275 L305 260 L300 245 L295 230 L300 215 L305 200 L315 185 L330 175 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Asia */}
                <path
                  d="M480 50 L520 45 L560 40 L600 35 L640 30 L680 35 L720 40 L760 45 L800 50 L835 55 L870 60 L900 65 L920 75 L930 90 L925 105 L915 120 L900 135 L880 150 L860 165 L840 175 L820 185 L800 195 L780 200 L760 205 L740 210 L720 215 L700 220 L680 225 L660 230 L640 235 L620 240 L600 235 L580 230 L560 225 L540 220 L520 215 L500 210 L485 200 L475 185 L470 170 L465 155 L460 140 L455 125 L450 110 L455 95 L465 80 L475 65 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Australia */}
                <path
                  d="M750 320 L780 315 L810 320 L835 325 L860 330 L880 340 L895 355 L900 370 L895 385 L885 395 L870 405 L850 410 L830 415 L810 420 L790 415 L770 410 L755 405 L745 395 L740 380 L735 365 L740 350 L745 335 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Antarctica */}
                <path
                  d="M100 450 L200 445 L300 440 L400 435 L500 430 L600 435 L700 440 L800 445 L900 450 L950 460 L950 480 L900 485 L800 490 L700 495 L600 500 L500 495 L400 490 L300 485 L200 480 L100 475 L50 465 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Greenland */}
                <path
                  d="M280 20 L320 15 L340 20 L350 35 L345 50 L335 65 L320 75 L300 80 L280 85 L265 80 L255 70 L250 55 L255 40 L265 25 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Japan */}
                <path
                  d="M850 140 L860 135 L870 130 L875 140 L880 150 L875 160 L870 170 L860 175 L850 180 L845 170 L840 160 L845 150 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* UK */}
                <path
                  d="M330 75 L340 70 L350 75 L355 85 L350 95 L340 100 L330 95 L325 85 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Madagascar */}
                <path
                  d="M540 310 L550 305 L555 315 L560 325 L565 340 L560 355 L550 365 L540 360 L535 350 L530 340 L535 325 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Indonesia */}
                <path
                  d="M700 250 L720 245 L740 250 L760 255 L780 260 L800 265 L815 275 L810 285 L795 290 L775 285 L755 280 L735 275 L715 270 L695 265 L680 260 L675 250 L685 245 Z"
                  fill="url(#landGradient)"
                  stroke="#d4af37"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />

                {/* Flight Routes */}
                {selectedView === "routes" && (
                  <g className="routes">
                    {/* Major routes from DXB hub */}
                    {destinations.map((dest, index) => {
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
                    key={hub.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{
                      left: `${(coords.x / 1000) * 100}%`,
                      top: `${(coords.y / 500) * 100}%`,
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
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{
                      left: `${(coords.x / 1000) * 100}%`,
                      top: `${(coords.y / 500) * 100}%`,
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
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                      style={{
                        left: `${(coords.x / 1000) * 100}%`,
                        top: `${(coords.y / 500) * 100}%`,
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
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                      style={{
                        left: `${(coords.x / 1000) * 100}%`,
                        top: `${(coords.y / 500) * 100}%`,
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
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 text-xs shadow-lg z-40 max-w-[180px]">
                <h4 className="font-semibold mb-2 text-flydubai-navy text-sm flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  World Map Legend
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
