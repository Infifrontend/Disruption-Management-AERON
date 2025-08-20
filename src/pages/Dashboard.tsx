import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { WorldMap } from "../components/WorldMap";
import {
  AlertTriangle,
  BarChart3,
  Filter,
  AlertCircle,
  Zap,
  UserCheck,
  Plane,
  Fuel,
  Wrench,
  Hotel,
  ClockIcon,
  CheckSquare,
  Users,
  Calendar,
  Globe,
  TrendingUp,
  MapPin,
  Activity,
  Radar,
} from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const { filters, setFilters, screenSettings, setSelectedDisruption } =
    useAppContext();
  const [activeTab, setActiveTab] = React.useState("routes");

  const enabledScreens = screenSettings.filter((screen) => screen.enabled);

  const handleCreateRecoveryPlan = (disruption: any) => {
    setSelectedDisruption(disruption);
    navigate("/disruption");
  };

  const navigateToScreen = (screenId: string) => {
    const screen = enabledScreens.find((s) => s.id === screenId);
    if (screen) {
      navigate(screenId === "dashboard" ? "/" : `/${screenId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <Alert className="border-flydubai-orange bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-flydubai-orange" />
        <AlertDescription className="text-orange-800">
          <strong>Active Disruptions:</strong> 18 Flydubai flights affected by
          sandstorm at DXB. AERON recovery plans available.
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
                <h3 className="font-medium text-flydubai-navy">
                  Flydubai AERON Performance Today
                </h3>
                <p className="text-sm text-muted-foreground">
                  8 recovery decisions processed • 96.1% success rate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-blue">
                  AED 312K
                </p>
                <p className="text-xs text-muted-foreground">Cost Savings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-navy">
                  7.8 min
                </p>
                <p className="text-xs text-muted-foreground">Avg Decision</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-flydubai-orange">
                  2,847
                </p>
                <p className="text-xs text-muted-foreground">
                  Passengers Served
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToScreen("reports")}
                className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
              >
                View Full Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Impact & Disruption Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-flydubai-orange" />
              Passenger Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    Affected Passengers
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-700">754</p>
                <p className="text-xs text-red-600">Across all disruptions</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">
                    High Priority
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">400</p>
                <p className="text-xs text-yellow-600">
                  Need immediate attention
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Rebookings
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700">255</p>
                <p className="text-xs text-blue-600">Successfully rebooked</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Resolved
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700">750</p>
                <p className="text-xs text-green-600">
                  Passengers accommodated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Highly Disrupted Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-red-900">DXB - Dubai</p>
                    <p className="text-xs text-red-600">12 disrupted flights</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">2,847</p>
                  <p className="text-xs text-red-600">passengers affected</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-orange-900">DEL - Delhi</p>
                    <p className="text-xs text-orange-600">
                      7 disrupted flights
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-700">823</p>
                  <p className="text-xs text-orange-600">passengers affected</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-yellow-900">
                      BOM - Mumbai
                    </p>
                    <p className="text-xs text-yellow-600">
                      4 disrupted flights
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-700">457</p>
                  <p className="text-xs text-yellow-600">passengers affected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Operational Insights */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Key Operational Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Recovery Rate
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-800">89.2%</p>
              <p className="text-xs text-blue-600">+4.3% from yesterday</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Avg Resolution
                </span>
              </div>
              <p className="text-2xl font-bold text-green-800">2.4h</p>
              <p className="text-xs text-green-600">-18 min improvement</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Network Impact
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-800">Medium</p>
              <p className="text-xs text-purple-600">23 active disruptions</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Critical Priority
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-800">5</p>
              <p className="text-xs text-orange-600">
                Require immediate action
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Most Disrupted Route
                </p>
                <p className="text-sm text-gray-600">
                  DXB → DEL experiencing weather delays
                </p>
              </div>
              <Badge className="bg-red-100 text-red-700 border-red-200">
                High Impact
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Overview with Tabs */}
      <Card className="border-flydubai-blue/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-flydubai-blue" />
            Global Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Plane className="h-5 w-5 text-flydubai-blue" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Flights
                    </p>
                    <p className="text-xl font-semibold text-flydubai-blue">
                      847
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12 from yesterday
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-flydubai-orange" />
                  <div>
                    <p className="text-sm text-muted-foreground">Disruptions</p>
                    <p className="text-xl font-semibold text-flydubai-orange">
                      23
                    </p>
                    <p className="text-xs text-red-600">
                      5 critical • 4,127 pax affected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Passengers
                    </p>
                    <p className="text-xl font-semibold text-purple-600">
                      42,158
                    </p>
                    <p className="text-xs text-red-600">9.8% disrupted today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      OTP Performance
                    </p>
                    <p className="text-xl font-semibold text-green-600">
                      89.2%
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +2.1% this week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Improved Tabbed Interface */}
          <div className="mt-6">
            <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <nav className="-mb-px flex space-x-0">
                <button
                  onClick={() => setActiveTab("routes")}
                  className={`relative min-w-0 flex-1 py-4 px-6 text-sm font-medium text-center border-0 rounded-tl-lg focus:z-10 transition-colors ${
                    activeTab === "routes"
                      ? "bg-flydubai-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Routes
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("liveFlights")}
                  className={`relative min-w-0 flex-1 py-4 px-6 text-sm font-medium text-center border-0 focus:z-10 transition-colors ${
                    activeTab === "liveFlights"
                      ? "bg-flydubai-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plane className="h-4 w-4" />
                    Live Flights
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("disruptions")}
                  className={`relative min-w-0 flex-1 py-4 px-6 text-sm font-medium text-center border-0 rounded-tr-lg focus:z-10 transition-colors ${
                    activeTab === "disruptions"
                      ? "bg-flydubai-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Disruptions
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-6">
              {/* Routes Tab Content */}
              {activeTab === "routes" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-flydubai-navy mb-4">Top Routes Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-900">DXB → BOM</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">On Time</Badge>
                      </div>
                      <div className="text-sm text-blue-700">
                        <p>15 flights today • 92% OTP</p>
                        <p>2,847 passengers</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-900">DXB → DEL</span>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Minor Delays</Badge>
                      </div>
                      <div className="text-sm text-green-700">
                        <p>12 flights today • 87% OTP</p>
                        <p>2,156 passengers</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-900">DXB → KHI</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
                      </div>
                      <div className="text-sm text-purple-700">
                        <p>8 flights today • 98% OTP</p>
                        <p>1,432 passengers</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-orange-900">DXB → MCT</span>
                        <Badge className="bg-red-100 text-red-800 border-red-200">Disrupted</Badge>
                      </div>
                      <div className="text-sm text-orange-700">
                        <p>6 flights today • 65% OTP</p>
                        <p>823 passengers affected</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-indigo-900">DXB → CAI</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">On Time</Badge>
                      </div>
                      <div className="text-sm text-indigo-700">
                        <p>4 flights today • 94% OTP</p>
                        <p>672 passengers</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-pink-900">DXB → AUH</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">On Time</Badge>
                      </div>
                      <div className="text-sm text-pink-700">
                        <p>10 flights today • 96% OTP</p>
                        <p>1,543 passengers</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Flights Tab Content */}
              {activeTab === "liveFlights" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-flydubai-navy mb-4">Live Flight Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-mono font-semibold">FZ-237</span>
                        </div>
                        <div>
                          <p className="font-medium">DXB → BOM</p>
                          <p className="text-sm text-gray-600">Dubai → Mumbai</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 border-green-200 mb-1">On Time</Badge>
                        <p className="text-sm text-gray-600">ETD: 14:30</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-mono font-semibold">FZ-156</span>
                        </div>
                        <div>
                          <p className="font-medium">DXB → DEL</p>
                          <p className="text-sm text-gray-600">Dubai → Delhi</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-1">In Flight</Badge>
                        <p className="text-sm text-gray-600">ETA: 16:45</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="font-mono font-semibold">FZ-565</span>
                        </div>
                        <div>
                          <p className="font-medium">DWC → MCT</p>
                          <p className="text-sm text-gray-600">Al Maktoum → Muscat</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mb-1">Delayed</Badge>
                        <p className="text-sm text-gray-600">ETD: 20:51 (+2h)</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="font-mono font-semibold">FZ-892</span>
                        </div>
                        <div>
                          <p className="font-medium">KHI → DXB</p>
                          <p className="text-sm text-gray-600">Karachi → Dubai</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-1">Boarding</Badge>
                        <p className="text-sm text-gray-600">Gate: A12</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disruptions Tab Content */}
              {activeTab === "disruptions" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-flydubai-navy mb-4">Active Disruptions</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-mono font-semibold">FZ-565</span>
                        </div>
                        <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
                      </div>
                      <div className="ml-8">
                        <p className="font-medium text-red-900">DWC → MCT</p>
                        <p className="text-sm text-red-700">Thunderstorm causing 2h delay</p>
                        <p className="text-xs text-red-600 mt-1">190 passengers affected</p>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <span className="font-mono font-semibold">FZ-676</span>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
                      </div>
                      <div className="ml-8">
                        <p className="font-medium text-orange-900">DXB → MCT</p>
                        <p className="text-sm text-orange-700">Aircraft technical issue</p>
                        <p className="text-xs text-orange-600 mt-1">165 passengers affected</p>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <span className="font-mono font-semibold">FZ-443</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
                      </div>
                      <div className="ml-8">
                        <p className="font-medium text-yellow-900">DXB → BEY</p>
                        <p className="text-sm text-yellow-700">Crew scheduling conflict</p>
                        <p className="text-xs text-yellow-600 mt-1">142 passengers affected</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Quick Actions</p>
                        <p className="text-sm text-gray-600">Manage disruptions efficiently</p>
                      </div>
                      <Button
                        onClick={() => navigateToScreen("flight-disruption-list")}
                        className="bg-flydubai-blue hover:bg-blue-700"
                      >
                        View All Disruptions
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
              <label className="text-sm font-medium mb-2 block">
                Flight Number
              </label>
              <Input
                placeholder="FZ123"
                value={filters.flightNumber}
                onChange={(e) =>
                  setFilters({ ...filters, flightNumber: e.target.value })
                }
                className="input-flydubai"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Station</label>
              <Select
                value={filters.station}
                onValueChange={(value) =>
                  setFilters({ ...filters, station: value })
                }
              >
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
              <Select
                value={filters.region}
                onValueChange={(value) =>
                  setFilters({ ...filters, region: value })
                }
              >
                <SelectTrigger className="select-flydubai">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcc">GCC</SelectItem>
                  <SelectItem value="indian-subcontinent">
                    Indian Subcontinent
                  </SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="middle-east">Middle East</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Date/Time
              </label>
              <Input
                type="datetime-local"
                value={filters.dateTime}
                onChange={(e) =>
                  setFilters({ ...filters, dateTime: e.target.value })
                }
                className="input-flydubai"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time World Map */}
      <div className="w-full">
        <WorldMap />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {enabledScreens.find((s) => s.id === "flight-disruption-list") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("flight-disruption-list")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <AlertCircle className="h-4 w-4" />
            Active Disruptions
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "recovery") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("recovery")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Zap className="h-4 w-4" />
            Recovery Options
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "passengers") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("passengers")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <UserCheck className="h-4 w-4" />
            Passenger Services
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "flight-tracking") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("flight-tracking")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Plane className="h-4 w-4" />
            Flight Tracking
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "fuel-optimization") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("fuel-optimization")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Fuel className="h-4 w-4" />
            Fuel Optimization
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "maintenance") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("maintenance")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Wrench className="h-4 w-4" />
            Aircraft Maintenance
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "hotac") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("hotac")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <Hotel className="h-4 w-4" />
            HOTAC Management
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "pending") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("pending")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <ClockIcon className="h-4 w-4" />
            Pending Solutions
          </Button>
        )}

        {enabledScreens.find((s) => s.id === "past-logs") && (
          <Button
            variant="outline"
            onClick={() => navigateToScreen("past-logs")}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-flydubai-blue border-blue-200"
          >
            <CheckSquare className="h-4 w-4" />
            Past Recovery Logs
          </Button>
        )}
      </div>
    </div>
  );
}
