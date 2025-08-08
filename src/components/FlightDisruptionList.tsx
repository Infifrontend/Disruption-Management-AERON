"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { databaseService } from "../services/databaseService";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertTriangle,
  Plane,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Filter,
  Search,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Timer,
  Fuel,
  CloudRain,
  Wrench,
  Activity,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Calendar,
  FileText,
  Shield,
  Target,
  Zap,
  BarChart3,
  Send,
  RefreshCw,
  ArrowRight,
  Info,
  Star,
  ThumbsUp,
} from "lucide-react";

export function FlightDisruptionList() {
  const navigate = useNavigate();
  const { setSelectedFlight } = useAppContext();
  const [selectedDisruption, setSelectedDisruption] = useState(null);
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    severity: "all",
    type: "all",
    status: "all",
    airport: "all",
    search: "",
  });
  useEffect(() => {
    const fetchDisruptions = async () => {
      try {
        // Fetch only actual database records
        const data = await databaseService.getAllDisruptions();

        // Filter out records with unknown or incomplete data
        const validDisruptions = data.filter(disruption => {
          // Remove records that are clearly incomplete or unknown
          const hasValidFlightNumber = disruption.flightNumber && 
            !disruption.flightNumber.includes('UNKNOWN-') &&
            disruption.flightNumber.trim() !== '';
          
          const hasValidRoute = disruption.route && 
            disruption.route.trim() !== '' &&
            !disruption.route.includes('UNK');
            
          const hasValidDisruptionReason = disruption.disruptionReason && 
            disruption.disruptionReason.trim() !== '' &&
            disruption.disruptionReason !== 'API sync' &&
            disruption.disruptionReason !== 'Unknown disruption';

          return hasValidFlightNumber && hasValidRoute && hasValidDisruptionReason;
        });

        // Transform database data to component format with all dynamic fields
        const processedData = validDisruptions.map(disruption => ({
          id: disruption.id,
          flightNumber: disruption.flightNumber,
          route: disruption.route,
          origin: disruption.origin,
          destination: disruption.destination,
          originCity: disruption.originCity,
          destinationCity: disruption.destinationCity,
          aircraft: disruption.aircraft,
          scheduledDeparture: disruption.scheduledDeparture,
          estimatedDeparture: disruption.estimatedDeparture,
          delay: disruption.delay || 0,
          passengers: disruption.passengers || 0,
          crew: disruption.crew || 0,
          connectionFlights: disruption.connectionFlights || 0,
          severity: disruption.severity || 'Medium',
          type: disruption.type || 'Unknown',
          status: disruption.status || 'Active',
          disruptionReason: disruption.disruptionReason,
          categorization: disruption.categorization || 'Uncategorized',
          createdAt: disruption.createdAt,
          updatedAt: disruption.updatedAt,
          // Add minimal required properties for UI components
          impact: {
            estimatedCost: 0,
            revenueAtRisk: 0,
            compensationRequired: 0,
            passengers: disruption.passengers || 0,
            connectingFlights: disruption.connectionFlights || 0
          },
          confidence: 85,
          weather: {
            condition: 'Unknown',
            visibility: 'N/A',
            wind: 'N/A',
            temperature: 'N/A'
          },
          aircraftType: disruption.aircraft || 'Unknown',
          terminal: 'T2',
          gate: 'TBD',
          detailedDescription: disruption.disruptionReason,
          maintenance: {
            issueReported: disruption.disruptionReason || 'Under investigation',
            technician: 'Assigned',
            workOrderNumber: 'Pending',
            estimatedRepairTime: 'TBD',
            partsRequired: 'Under assessment',
            status: 'Active'
          },
          predictions: {
            resolutionProbability: 75,
            cascadeRisk: 'Medium',
            networkImpact: 'Medium',
            aiRecommendation: 'Monitor situation and assess recovery options'
          },
          alternatives: [],
          passengerServices: {
            notifications: `${disruption.passengers || 0} passengers affected`,
            vouchers: 0,
            rebooking: 'In progress',
            customerServiceCalls: 0,
            complaints: 0
          },
          crewMembers: []
        }));

        setDisruptions(processedData);
        console.log("Fetched valid disruptions:", processedData.length, "of", data.length, "total records");
      } catch (error) {
        console.error("Error fetching disruptions:", error);
        setDisruptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDisruptions();
    // Refresh every 2 minutes without external API sync
    const interval = setInterval(fetchDisruptions, 120000);
    return () => clearInterval(interval);
  }, []);

  // Use only database data - no mock data
  const dataToFilter = disruptions;
  const filteredDisruptions = dataToFilter.filter((disruption) => {
    return (
      (filters.severity === "all" ||
        disruption.severity.toLowerCase() === filters.severity) &&
      (filters.type === "all" ||
        disruption.type.toLowerCase() === filters.type) &&
      (filters.status === "all" ||
        disruption.status.toLowerCase() === filters.status) &&
      (filters.search === "" ||
        disruption.flightNumber
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        disruption.route.toLowerCase().includes(filters.search.toLowerCase()) ||
        disruption.disruptionReason
          .toLowerCase()
          .includes(filters.search.toLowerCase()))
    );
  });

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-red-100 text-red-700";
      case "Resolving":
        return "bg-yellow-100 text-yellow-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Technical":
        return <Wrench className="h-4 w-4" />;
      case "Weather":
        return <CloudRain className="h-4 w-4" />;
      case "Crew":
        return <Users className="h-4 w-4" />;
      case "ATC":
        return <Activity className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (disruption) => {
    setSelectedDisruption(disruption);
  };

  const handleFlightClick = async (disruption) => {
    try {
      // Set the selected flight in context
      setSelectedFlight(disruption);
      
      // Generate recovery options dynamically based on disruption category
      if (disruption.id) {
        await databaseService.generateRecoveryOptions(disruption.id.toString());
      }
      
      // Navigate to comparison page with flight ID parameter
      navigate(`/comparison?flightId=${disruption.id}`);
    } catch (error) {
      console.error('Error navigating to comparison:', error);
      // Fallback navigation without recovery generation
      setSelectedFlight(disruption);
      navigate(`/comparison?flightId=${disruption.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading flight disruptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Flight Disruption List</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of flight disruptions with AI-powered analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Active Disruptions</p>
                <p className="text-2xl font-semibold text-red-900">
                  {dataToFilter.filter((d) => d.status === "Active").length}
                </p>
                <p className="text-xs text-red-600">Requiring attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600">Affected Passengers</p>
                <p className="text-2xl font-semibold text-orange-900">
                  {dataToFilter
                    .reduce((sum, d) => sum + d.passengers, 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">Total impacted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Estimated Cost Impact</p>
                <p className="text-2xl font-semibold text-blue-900">
                  $
                  {(
                    dataToFilter.reduce(
                      (sum, d) => sum + d.impact.estimatedCost,
                      0,
                    ) / 1000
                  ).toFixed(0)}
                  K
                </p>
                <p className="text-xs text-blue-600">Recovery costs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">AI Confidence</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {dataToFilter.length > 0
                    ? (
                        dataToFilter.reduce((sum, d) => sum + d.confidence, 0) /
                        dataToFilter.length
                      ).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-xs text-purple-600">Prediction accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Flight number, route..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Severity</Label>
              <Select
                value={filters.severity}
                onValueChange={(value) =>
                  setFilters({ ...filters, severity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="crew">Crew</SelectItem>
                  <SelectItem value="atc">ATC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolving">Resolving</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Airport</Label>
              <Select
                value={filters.airport}
                onValueChange={(value) =>
                  setFilters({ ...filters, airport: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Airports</SelectItem>
                  <SelectItem value="jfk">JFK - New York</SelectItem>
                  <SelectItem value="lhr">LHR - London</SelectItem>
                  <SelectItem value="dxb">DXB - Dubai</SelectItem>
                  <SelectItem value="fra">FRA - Frankfurt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disruptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Disruptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Origin → Destination</TableHead>
                <TableHead>Cities</TableHead>
                <TableHead>Aircraft</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Categorization</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Crew</TableHead>
                <TableHead>Connections</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisruptions
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((disruption) => (
                <TableRow 
                  key={disruption.id} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleFlightClick(disruption)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(disruption.type)}
                      <span className="font-mono font-medium">
                        {disruption.flightNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono">
                      {disruption.origin} → {disruption.destination}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{disruption.originCity}</div>
                      <div className="text-muted-foreground">↓</div>
                      <div>{disruption.destinationCity}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {disruption.aircraft}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(disruption.scheduledDeparture).toLocaleString(
                          "en-GB",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          },
                        )}
                      </div>
                      {disruption.estimatedDeparture && (
                        <div className="text-red-600 text-xs">
                          Est:{" "}
                          {new Date(
                            disruption.estimatedDeparture,
                          ).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      <p className="text-sm font-medium truncate">
                        {disruption.disruptionReason}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {disruption.type}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {disruption.categorization}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(disruption.severity)}>
                      {disruption.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(disruption.status)}>
                      {disruption.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {disruption.delay > 0 ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{disruption.delay}m</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        On time
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{disruption.passengers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-500" />
                      <span>{disruption.crew}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {disruption.connectionFlights > 0 ? (
                        <span className="font-medium">
                          {disruption.connectionFlights} connections
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Direct</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(disruption);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredDisruptions.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(filteredDisruptions.length / itemsPerPage)} ({filteredDisruptions.length} total flights)
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.ceil(filteredDisruptions.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(filteredDisruptions.length / itemsPerPage);
                      if (totalPages <= 7) return true;
                      if (page <= 3) return true;
                      if (page >= totalPages - 2) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <PaginationItem>
                              <span className="px-3 py-2">...</span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredDisruptions.length / itemsPerPage), prev + 1))}
                      className={currentPage === Math.ceil(filteredDisruptions.length / itemsPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Disruption Dialog */}
      {selectedDisruption && (
        <Dialog
          open={!!selectedDisruption}
          onOpenChange={() => setSelectedDisruption(null)}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedDisruption.type)}
                Flight {selectedDisruption.flightNumber} Disruption Details
              </DialogTitle>
              <DialogDescription>
                Comprehensive analysis and recovery options for{" "}
                {selectedDisruption.route}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="pt-1 pb-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="technical" className="pt-1 pb-2">
                  Technical
                </TabsTrigger>
                <TabsTrigger value="crew" className="pt-1 pb-2">
                  Crew
                </TabsTrigger>
                <TabsTrigger value="passengers">Passengers</TabsTrigger>
                <TabsTrigger value="options">Recovery Options</TabsTrigger>
                <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Flight Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Flight Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Flight Number
                          </Label>
                          <p className="font-mono font-medium">
                            {selectedDisruption.flightNumber}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Route
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.route}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Aircraft
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.aircraft}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Aircraft Type
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.aircraftType}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Gate
                          </Label>
                          <p className="font-medium">
                            Terminal {selectedDisruption.terminal}, Gate{" "}
                            {selectedDisruption.gate}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Passengers
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.passengers} +{" "}
                            {selectedDisruption.crew} crew
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Disruption Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Severity
                          </Label>
                          <Badge
                            className={getSeverityColor(
                              selectedDisruption.severity,
                            )}
                          >
                            {selectedDisruption.severity}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Status
                          </Label>
                          <Badge
                            className={getStatusColor(
                              selectedDisruption.status,
                            )}
                          >
                            {selectedDisruption.status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Current Delay
                          </Label>
                          <p className="font-medium text-red-600">
                            {selectedDisruption.delay} minutes
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            AI Confidence
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.confidence}%
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Issue Description
                        </Label>
                        <p className="font-medium">
                          {selectedDisruption.disruptionReason}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedDisruption.detailedDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weather and Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CloudRain className="h-5 w-5" />
                        Weather Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Condition
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.weather.condition}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Visibility
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.weather.visibility}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Wind
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.weather.wind}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Temperature
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.weather.temperature}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Schedule Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Scheduled Departure
                          </Label>
                          <p className="font-medium">
                            {new Date(selectedDisruption.scheduledDeparture).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Estimated Departure
                          </Label>
                          <p className="font-medium text-red-600">
                            {new Date(selectedDisruption.estimatedDeparture).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Connecting Flights at Risk
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.impact.connectingFlights}{" "}
                            flights
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Predictions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      AI-Powered Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Resolution Probability
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress
                            value={
                              selectedDisruption.predictions
                                .resolutionProbability
                            }
                            className="flex-1"
                          />
                          <span className="font-medium">
                            {
                              selectedDisruption.predictions
                                .resolutionProbability
                            }
                            %
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Cascade Risk
                        </Label>
                        <Badge
                          className={
                            selectedDisruption.predictions.cascadeRisk ===
                            "High"
                              ? "bg-red-100 text-red-700"
                              : selectedDisruption.predictions.cascadeRisk ===
                                  "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }
                        >
                          {selectedDisruption.predictions.cascadeRisk}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Network Impact
                        </Label>
                        <Badge
                          className={
                            selectedDisruption.predictions.networkImpact ===
                            "High"
                              ? "bg-red-100 text-red-700"
                              : selectedDisruption.predictions
                                      .networkImpact === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }
                        >
                          {selectedDisruption.predictions.networkImpact}
                        </Badge>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        AI Recommendation
                      </Label>
                      <p className="font-medium text-blue-700 mt-1">
                        {selectedDisruption.predictions.aiRecommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Maintenance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Issue Reported
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.maintenance.issueReported}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Assigned Technician
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.maintenance.technician}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Work Order
                          </Label>
                          <p className="font-mono font-medium">
                            {selectedDisruption.maintenance.workOrderNumber}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Estimated Repair Time
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.maintenance.estimatedRepairTime}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Parts Required
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.maintenance.partsRequired}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Status
                          </Label>
                          <Badge
                            className={
                              selectedDisruption.maintenance.status ===
                              "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : selectedDisruption.maintenance.status ===
                                  "Completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {selectedDisruption.maintenance.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crew" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Crew Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(selectedDisruption.crewMembers || []).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {member.role}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>Duty: {member.dutyTime}</span>
                                <span>Rest: {member.restTime}</span>
                                <span>{member.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={
                                member.status === "Available"
                                  ? "bg-green-100 text-green-700"
                                  : member.status === "On Duty"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {member.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="passengers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Passenger Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Notifications Sent
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.passengerServices.notifications}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Vouchers Issued
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.passengerServices.vouchers}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Rebooking Status
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.passengerServices.rebooking}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Customer Service Calls
                          </Label>
                          <p className="font-medium">
                            {
                              selectedDisruption.passengerServices
                                .customerServiceCalls
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Complaints
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.passengerServices.complaints}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Total Passengers
                          </Label>
                          <p className="font-medium">
                            {selectedDisruption.passengers}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="options" className="space-y-6">
                <div className="space-y-4">
                  {(selectedDisruption.alternatives || []).map(
                    (option, index) => (
                      <Card
                        key={index}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              {option.option}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-700">
                                {option.success}% Success Rate
                              </Badge>
                              <Button
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Select Option
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Aircraft
                              </Label>
                              <p className="font-medium">{option.aircraft}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Estimated Cost
                              </Label>
                              <p className="font-medium">
                                ${option.cost.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Additional Delay
                              </Label>
                              <p className="font-medium">
                                {option.delay} minutes
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Success Probability
                              </Label>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={option.success}
                                  className="w-16"
                                />
                                <span className="text-sm font-medium">
                                  {option.success}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </TabsContent>

              <TabsContent value="impact" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Estimated Recovery Cost</span>
                          <span className="font-medium">
                            $
                            {selectedDisruption.impact.estimatedCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue at Risk</span>
                          <span className="font-medium">
                            $
                            {selectedDisruption.impact.revenueAtRisk.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compensation Required</span>
                          <span className="font-medium">
                            $
                            {selectedDisruption.impact.compensationRequired.toLocaleString()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Financial Impact</span>
                          <span>
                            $
                            {(
                              selectedDisruption.impact.estimatedCost +
                              selectedDisruption.impact.compensationRequired
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Operational Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Affected Passengers</span>
                          <span className="font-medium">
                            {selectedDisruption.impact.passengers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connecting Flights</span>
                          <span className="font-medium">
                            {selectedDisruption.impact.connectingFlights}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network Impact</span>
                          <Badge
                            className={
                              selectedDisruption.predictions.networkImpact ===
                              "High"
                                ? "bg-red-100 text-red-700"
                                : selectedDisruption.predictions
                                      .networkImpact === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }
                          >
                            {selectedDisruption.predictions.networkImpact}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Cascade Risk</span>
                          <Badge
                            className={
                              selectedDisruption.predictions.cascadeRisk ===
                              "High"
                                ? "bg-red-100 text-red-700"
                                : selectedDisruption.predictions.cascadeRisk ===
                                    "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }
                          >
                            {selectedDisruption.predictions.cascadeRisk}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedDisruption(null)}
              >
                Close
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              <Button className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Create Recovery Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}