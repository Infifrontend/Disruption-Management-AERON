"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  AlertTriangle,
  Plane,
  Users,
  Clock,
  MapPin,
  Filter,
  Search,
  ArrowRight,
  RefreshCw,
  Eye,
  Zap,
  TrendingUp,
  CalendarDays,
  Timer,
  Plus,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Trash2,
  FileText,
} from "lucide-react";
import { databaseService, FlightDisruption } from "../services/databaseService";

// Define interface for disruption categories
interface DisruptionCategory {
  id: string;
  category_name: string;
  description: string;
}

// Transform database flight disruption to the expected format for this component
const transformFlightData = (disruption: FlightDisruption) => {
  // Ensure we have a valid scheduled departure time
  const scheduledDeparture = disruption.scheduledDeparture || new Date().toISOString();

  // Calculate scheduled arrival with proper fallback
  let scheduledArrival;
  if (disruption.estimatedDeparture) {
    scheduledArrival = disruption.estimatedDeparture;
  } else {
    scheduledArrival = addHours(scheduledDeparture, 3);
  }

  // Check if this is an incomplete record
  const isIncomplete = !disruption.flightNumber ||
                      disruption.flightNumber.includes('UNKNOWN-') ||
                      !disruption.scheduledDeparture ||
                      !disruption.origin ||
                      !disruption.destination ||
                      disruption.destination === "UNKNOWN";

  return {
    id: disruption.id,
    flightNumber: disruption.flightNumber || "UNKNOWN",
    origin: disruption.origin || "DXB",
    destination: disruption.destination || "UNKNOWN",
    originCity: disruption.originCity || getLocationName(disruption.origin || "DXB"),
    destinationCity: disruption.destinationCity || getLocationName(disruption.destination || "UNKNOWN"),
    scheduledDeparture: scheduledDeparture,
    scheduledArrival: scheduledArrival,
    currentStatus:
      disruption.status === "Active"
        ? "Delayed"
        : disruption.status === "Cancelled"
          ? "Cancelled"
          : disruption.status === "Diverted"
            ? "Diverted"
            : disruption.status === "Resolving"
              ? "Resolving"
              : "Unknown",
    delay: disruption.delay || 0,
    aircraft: disruption.aircraft || "Unknown",
    gate: disruption.gate || `T2-A${Math.floor(Math.random() * 30) + 1}`, // Generate consistent gate
    passengers: disruption.passengers || 0,
    crew: disruption.crew || 6,
    disruptionType: disruption.type
      ? disruption.type.toLowerCase()
      : "technical",
    categorization: getCategorization(disruption.type || "Technical"),
    disruptionReason: disruption.disruptionReason ||
                     (isIncomplete ? "⚠️ Incomplete information - some data may be missing" : "Information not available"),
    severity: disruption.severity
      ? disruption.severity.toLowerCase()
      : "medium",
    impact: `Flight affected due to ${disruption.disruptionReason || "operational issues"}${isIncomplete ? " (Incomplete data)" : ""}`,
    lastUpdate: getTimeAgo(disruption.updatedAt || disruption.createdAt || new Date().toISOString()),
    priority: disruption.severity || "Medium",
    connectionFlights: disruption.connectionFlights || 0,
    vipPassengers: Math.floor((disruption.passengers || 0) * 0.02) + (disruption.passengers > 0 ? 1 : 0),
    isIncomplete: isIncomplete, // Flag to identify incomplete records
  };
};

// Helper function to get location names for display
const getLocationName = (code: string) => {
  const locations: { [key: string]: string } = {
    DXB: "Dubai",
    BOM: "Mumbai",
    DEL: "Delhi",
    KHI: "Karachi",
    COK: "Kochi",
    IST: "Istanbul",
    AUH: "Abu Dhabi",
    CMB: "Colombo",
    BCN: "Barcelona",
    PRG: "Prague",
    SLL: "Salalah",
  };
  return locations[code] || code;
};

// Fetch disruption categories from database
const fetchDisruptionCategories = async (): Promise<DisruptionCategory[]> => {
  try {
    const categories = await databaseService.getDisruptionCategories();
    return categories || [];
  } catch (error) {
    console.error("Error fetching disruption categories:", error);
    return []; // Return empty array if fetch fails
  }
};

// Updated getCategorization to use fetched categories
let disruptionCategories: DisruptionCategory[] = [];
fetchDisruptionCategories().then(categories => {
  disruptionCategories = categories;
});

const getCategorization = (type: string): string => {
  const categoryMap: { [key: string]: string } = {
    Technical: "Aircraft issue (e.g., AOG)",
    Weather: "ATC/weather delay",
    Crew: "Crew issue (e.g., sick report, duty time breach)",
    ATC: "ATC/weather delay",
  };

  // Check if the provided type maps to a known category name directly
  if (categoryMap[type]) {
    return categoryMap[type];
  }

  // Fallback to searching for a category that might match the type description or name
  const foundCategory = disruptionCategories.find(cat =>
    cat.category_name.toLowerCase().includes(type.toLowerCase()) ||
    cat.description.toLowerCase().includes(type.toLowerCase())
  );

  return foundCategory ? foundCategory.category_name : categoryMap[type] || "Aircraft issue (e.g., AOG)";
};


const addHours = (dateString: string, hours: number) => {
  try {
    if (!dateString) {
      // If no date provided, use current time plus hours
      const date = new Date();
      date.setHours(date.getHours() + hours);
      return date.toISOString();
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If invalid date, use current time plus hours
      console.warn(`Invalid date string: ${dateString}, using current time + ${hours}h`);
      const fallbackDate = new Date();
      fallbackDate.setHours(fallbackDate.getHours() + hours);
      return fallbackDate.toISOString();
    }

    date.setHours(date.getHours() + hours);
    return date.toISOString();
  } catch (error) {
    console.error("Error in addHours:", error, "dateString:", dateString);
    // Fallback to current time plus hours
    const fallbackDate = new Date();
    fallbackDate.setHours(fallbackDate.getHours() + hours);
    return fallbackDate.toISOString();
  }
};

const getTimeAgo = (dateString: string) => {
  if (!dateString) return "Unknown";

  const now = new Date();
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Unknown";
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

export function DisruptionInput({ disruption, onSelectFlight }) {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    origin: "all",
    categorization: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState("priority");
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newDisruption, setNewDisruption] = useState({
    flightNumber: "",
    origin: "",
    destination: "",
    originCity: "",
    destinationCity: "",
    scheduledDeparture: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 16),
    scheduledArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 16),
    currentStatus: "Delayed",
    delay: "",
    aircraft: "",
    gate: "",
    passengers: "",
    crew: 6,
    disruptionType: "technical",
    categorization: disruptionCategories.length > 0 ? disruptionCategories[0]?.category_name : "Aircraft issue (e.g., AOG)",
    disruptionReason: "",
    severity: "medium",
    impact: "",
    priority: "Medium",
    connectionFlights: "",
    vipPassengers: "",
  });



  // Fetch flights from database
  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 120000); // Refresh every 120 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFlights = async () => {
    try {
      setError(null);
      setLoading(true);

      // First sync from external API to get latest data and prevent duplicates
      console.log("Syncing from external API...");
      const syncResult = await databaseService.syncDisruptionsFromExternalAPI();
      console.log('External API sync result:', syncResult);

      // Then fetch all current disruptions from database
      const data = await databaseService.getAllDisruptions();

      // Process all data, including incomplete records with fallbacks
      const processedData = data.map(disruption => {
        // Provide defaults for missing required fields
        if (!disruption) return null;

        return {
          ...disruption,
          flightNumber: disruption.flightNumber || `UNKNOWN-${Date.now()}`,
          scheduledDeparture: disruption.scheduledDeparture || new Date().toISOString(),
          origin: disruption.origin || "DXB",
          destination: disruption.destination || "UNKNOWN",
          originCity: disruption.originCity || disruption.origin || "Dubai",
          destinationCity: disruption.destinationCity || disruption.destination || "Unknown",
          status: disruption.status || "Unknown",
          severity: disruption.severity || "Medium",
          type: disruption.type || "Technical",
          disruptionReason: disruption.disruptionReason || "Information not available",
          passengers: disruption.passengers || 0,
          crew: disruption.crew || 6,
          delay: disruption.delay || 0,
          aircraft: disruption.aircraft || "Unknown",
          connectionFlights: disruption.connectionFlights || 0
        };
      }).filter(disruption => disruption !== null);

      const transformedFlights = processedData.map(transformFlightData);
      setFlights(transformedFlights);

      console.log("Fetched and transformed flights:", transformedFlights.length, "flights");

      // Count incomplete records
      const incompleteCount = data.length - processedData.filter(d =>
        d.flightNumber && d.flightNumber.indexOf('UNKNOWN-') === -1 &&
        d.scheduledDeparture &&
        d.origin && d.origin !== "DXB" &&
        d.destination && d.destination !== "UNKNOWN"
      ).length;

      // Show sync results in success message if any data was synced
      if (syncResult && (syncResult.inserted > 0 || syncResult.updated > 0)) {
        let message = `✅ Data refreshed successfully! ${syncResult.inserted} new disruptions added, ${syncResult.updated} updated.`;
        if (incompleteCount > 0) {
          message += ` Note: ${incompleteCount} records had missing information and were displayed with defaults.`;
        }
        setSuccess(message);
        setTimeout(() => setSuccess(null), 8000);
      }

      // Clear any previous errors if we have any data
      if (transformedFlights.length === 0 && data.length === 0) {
        setError("No flight disruptions found. Add new disruptions using the 'Add Disruption' button.");
      } else if (incompleteCount > 0 && incompleteCount < data.length) {
        setSuccess(`⚠️ ${incompleteCount} disruptions had incomplete information but are shown with default values. All ${transformedFlights.length} disruptions are displayed.`);
        setTimeout(() => setSuccess(null), 6000);
      }
    } catch (error) {
      console.error("Error fetching flights:", error);

      // Check if it's a connectivity issue
      try {
        const isHealthy = await databaseService.healthCheck();
        if (!isHealthy) {
          setError(
            "🔄 Database connection is temporarily unavailable. You can still add new disruptions, and they will be synced when the connection is restored."
          );
        } else {
          setError(
            "⚠️ Failed to load flight data. The database connection is working, but there may be data issues. You can still add new disruptions manually."
          );
        }
      } catch (healthError) {
        setError(
          "🔌 System connectivity issues detected. You can add new disruptions offline, and they will be synced when the connection is restored."
        );
      }

      // Try to load existing data from database as fallback
      try {
        const fallbackData = await databaseService.getAllDisruptions();
        if (fallbackData && fallbackData.length > 0) {
          // Process all fallback data, even if incomplete
          const processedFallbackData = fallbackData.map(disruption => {
            if (!disruption) return null;

            return {
              ...disruption,
              flightNumber: disruption.flightNumber || `FALLBACK-${Date.now()}`,
              scheduledDeparture: disruption.scheduledDeparture || new Date().toISOString(),
              origin: disruption.origin || "DXB",
              destination: disruption.destination || "UNKNOWN",
              status: disruption.status || "Unknown",
              severity: disruption.severity || "Medium",
              type: disruption.type || "Technical",
              disruptionReason: disruption.disruptionReason || "Cached data - may be incomplete",
              passengers: disruption.passengers || 0,
              crew: disruption.crew || 6,
              delay: disruption.delay || 0,
              aircraft: disruption.aircraft || "Unknown",
              connectionFlights: disruption.connectionFlights || 0
            };
          }).filter(disruption => disruption !== null);

          const transformedFlights = processedFallbackData.map(transformFlightData);
          setFlights(transformedFlights);
          console.log("Loaded fallback data:", transformedFlights.length, "flights");

          if (transformedFlights.length > 0) {
            setError("⚠️ Using cached flight data. Some information may be outdated or incomplete. Try refreshing when connection is restored.");
          }
        } else {
          setFlights([]);
        }
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
        setFlights([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "Delayed":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Diverted":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-white";
      case "Low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getDisruptionIcon = (type) => {
    switch (type) {
      case "weather":
        return "🌩️";
      case "technical":
        return "🔧";
      case "crew":
        return "👥";
      case "air_traffic":
        return "✈️";
      case "airport":
        return "🏗️";
      case "rotation":
        return "🔄";
      default:
        return "⚠️";
    }
  };

  const getCategorizationColor = (categorization) => {
    switch (categorization) {
      case "Aircraft issue (e.g., AOG)":
        return "bg-red-100 text-red-700 border-red-200";
      case "Crew issue (e.g., sick report, duty time breach)":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ATC/weather delay":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Airport curfew/ramp congestion":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Rotation misalignment or maintenance hold":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Filter flights based on current filters
  const filteredFlights = flights.filter((flight) => {
    // Status filter
    if (filters.status !== "all" && flight.currentStatus !== filters.status)
      return false;
    
    // Priority filter
    if (filters.priority !== "all" && flight.priority !== filters.priority)
      return false;
    
    // Origin filter
    if (filters.origin !== "all" && flight.origin !== filters.origin)
      return false;
    
    // Categorization filter
    if (
      filters.categorization !== "all" &&
      flight.categorization !== filters.categorization
    )
      return false;
    
    // Search filter - check multiple fields
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase().trim();
      const searchableFields = [
        flight.flightNumber || "",
        flight.originCity || "",
        flight.destinationCity || "",
        flight.disruptionReason || "",
        flight.aircraft || "",
        flight.origin || "",
        flight.destination || ""
      ];
      
      const matchFound = searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
      
      if (!matchFound) return false;
    }
    
    return true;
  });

  // Sort flights
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case "departure":
        return new Date(a.scheduledDeparture) - new Date(b.scheduledDeparture);
      case "passengers":
        return b.passengers - a.passengers;
      case "delay":
        return (b.delay || 0) - (a.delay || 0);
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedFlights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFlights = sortedFlights.slice(startIndex, endIndex);

  // Reset current page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.priority, filters.origin, filters.categorization, filters.search]);

  const handleFlightSelection = (flight) => {
    setSelectedFlight(flight);
  };

  const handleProceedToRecovery = () => {
    if (selectedFlight) {
      onSelectFlight([selectedFlight]);
    }
  };

  const getSelectedFlightImpact = () => {
    if (!selectedFlight) {
      return {
        flights: 0,
        passengers: 0,
        connections: 0,
      };
    }
    return {
      flights: 1,
      passengers: selectedFlight.passengers,
      connections: selectedFlight.connectionFlights,
    };
  };

  const impact = getSelectedFlightImpact();

  // Handle adding new disruption
  const handleAddDisruption = async () => {
    // Validate required fields
    if (
      !newDisruption.flightNumber ||
      !newDisruption.origin ||
      !newDisruption.destination ||
      !newDisruption.passengers ||
      !newDisruption.scheduledDeparture ||
      !newDisruption.aircraft ||
      !newDisruption.disruptionReason
    ) {
      alert(
        "Please fill in all required fields: Flight Number, Origin, Destination, Aircraft, Scheduled Departure, Passengers, and Disruption Reason.",
      );
      return;
    }

    const newFlightData = {
      flightNumber: newDisruption.flightNumber,
      route: `${newDisruption.origin} → ${newDisruption.destination}`,
      origin: newDisruption.origin,
      destination: newDisruption.destination,
      originCity: newDisruption.originCity || getLocationName(newDisruption.origin),
      destinationCity: newDisruption.destinationCity || getLocationName(newDisruption.destination),
      gate: newDisruption.gate,
      connectionFlights: newDisruption.connectionFlights
        ? parseInt(newDisruption.connectionFlights.toString())
        : 0,
      vipPassengers: newDisruption.vipPassengers
        ? parseInt(newDisruption.vipPassengers.toString())
        : 0,
      aircraft: newDisruption.aircraft,
      scheduledDeparture: newDisruption.scheduledDeparture,
      estimatedDeparture:
        newDisruption.scheduledArrival ||
        addHours(newDisruption.scheduledDeparture, 3),
      delay: newDisruption.delay ? parseInt(newDisruption.delay.toString()) : 0,
      passengers: parseInt(newDisruption.passengers.toString()),
      crew: parseInt(newDisruption.crew.toString()),
      severity: newDisruption.priority,
      type:
        newDisruption.disruptionType.charAt(0).toUpperCase() +
        newDisruption.disruptionType.slice(1),
      status:
        newDisruption.currentStatus === "Delayed"
          ? "Active"
          : newDisruption.currentStatus,
      disruptionReason: newDisruption.disruptionReason,
      categorization: newDisruption.categorization || "Manual Entry",
      crew_members: newDisruption.crewMembers || [],
    };

    try {
      console.log('Form data before submission:', {
        connectionFlights: newDisruption.connectionFlights,
        connectionFlightsType: typeof newDisruption.connectionFlights,
        newFlightDataConnectionFlights: newFlightData.connectionFlights
      });

      const result = await databaseService.saveDisruption(newFlightData);

      // Check if the result indicates success
      if (result && (result === true || result.success !== false)) {
        // Clear any existing errors and show success
        setError(null);
        setSuccess("Disruption added successfully!");
        setShowAlert(true);

        // Clear the form
        setNewDisruption({
          flightNumber: "",
          origin: "",
          destination: "",
          originCity: "",
          destinationCity: "",
          scheduledDeparture: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 16),
          scheduledArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 16),
          currentStatus: "Delayed",
          delay: "",
          aircraft: "",
          gate: "",
          passengers: "",
          crew: 6,
          disruptionType: "technical",
          categorization: disruptionCategories.length > 0 ? disruptionCategories[0]?.category_name : "Aircraft issue (e.g., AOG)",
          disruptionReason: "",
          severity: "medium",
          impact: "",
          priority: "Medium",
          connectionFlights: "",
          vipPassengers: "",
        });



        // Close the dialog
        setIsAddDialogOpen(false);

        // Refresh the flights list after a short delay
        setTimeout(() => {
          fetchFlights();
        }, 1000);
      } else {
        setError(
          "Failed to save disruption. Please check your data and try again.",
        );
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error adding disruption:", error);
      setError(
        `❌ An error occurred while adding the disruption: ${error.message || 'Unknown error'}. Please try again or contact support if the issue persists.`,
      );
      setShowAlert(true);
    }
  };

  // Handle input changes for new disruption form
  const handleInputChange = (field, value) => {
    setNewDisruption((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading affected flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Affected Flights Overview</h2>
          <p className="text-muted-foreground">
            Select a single flight to generate AERON recovery options
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            {sortedFlights.length} Flights Affected
          </Badge>
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            {
              sortedFlights.filter(
                (f) => f.priority === "High" || f.priority === "Critical",
              ).length
            }{" "}
            High Priority
          </Badge>
          {selectedFlight && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {selectedFlight.flightNumber} selected
            </Badge>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-flydubai-orange text-flydubai-orange hover:bg-orange-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Disruption
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-flydubai-navy">
                  Add New Flight Disruption
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Flight Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-flydubai-navy">
                    Flight Information
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="flightNumber">Flight Number*</Label>
                      <Input
                        id="flightNumber"
                        placeholder="FZ123"
                        value={newDisruption.flightNumber}
                        onChange={(e) =>
                          handleInputChange("flightNumber", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="aircraft">Aircraft Type*</Label>
                      <Select
                        value={newDisruption.aircraft}
                        onValueChange={(value) =>
                          handleInputChange("aircraft", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select aircraft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B737-800">B737-800</SelectItem>
                          <SelectItem value="B737 MAX 8">B737 MAX 8</SelectItem>
                          <SelectItem value="B737-900ER">B737-900ER</SelectItem>
                          <SelectItem value="A320">A320</SelectItem>
                          <SelectItem value="A321">A321</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="origin">Origin*</Label>
                      <Select
                        value={newDisruption.origin}
                        onValueChange={(value) =>
                          handleInputChange("origin", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DXB">DXB - Dubai</SelectItem>
                          <SelectItem value="AUH">AUH - Abu Dhabi</SelectItem>
                          <SelectItem value="SLL">SLL - Salalah</SelectItem>
                          <SelectItem value="KHI">KHI - Karachi</SelectItem>
                          <SelectItem value="BOM">BOM - Mumbai</SelectItem>
                          <SelectItem value="DEL">DEL - Delhi</SelectItem>
                          <SelectItem value="COK">COK - Kochi</SelectItem>
                          <SelectItem value="CMB">CMB - Colombo</SelectItem>
                          <SelectItem value="IST">IST - Istanbul</SelectItem>
                          <SelectItem value="BCN">BCN - Barcelona</SelectItem>
                          <SelectItem value="PRG">PRG - Prague</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="originCity">Origin City</Label>
                      <Input
                        id="originCity"
                        placeholder="Dubai"
                        value={newDisruption.originCity}
                        onChange={(e) =>
                          handleInputChange("originCity", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="destination">Destination*</Label>
                      <Select
                        value={newDisruption.destination}
                        onValueChange={(value) =>
                          handleInputChange("destination", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DXB">DXB - Dubai</SelectItem>
                          <SelectItem value="AUH">AUH - Abu Dhabi</SelectItem>
                          <SelectItem value="SLL">SLL - Salalah</SelectItem>
                          <SelectItem value="KHI">KHI - Karachi</SelectItem>
                          <SelectItem value="BOM">BOM - Mumbai</SelectItem>
                          <SelectItem value="DEL">DEL - Delhi</SelectItem>
                          <SelectItem value="COK">COK - Kochi</SelectItem>
                          <SelectItem value="CMB">CMB - Colombo</SelectItem>
                          <SelectItem value="IST">IST - Istanbul</SelectItem>
                          <SelectItem value="BCN">BCN - Barcelona</SelectItem>
                          <SelectItem value="PRG">PRG - Prague</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="destinationCity">Destination City</Label>
                      <Input
                        id="destinationCity"
                        placeholder="Mumbai"
                        value={newDisruption.destinationCity}
                        onChange={(e) =>
                          handleInputChange("destinationCity", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="scheduledDeparture">
                        Scheduled Departure*
                      </Label>
                      <Input
                        id="scheduledDeparture"
                        type="datetime-local"
                        value={newDisruption.scheduledDeparture}
                        onChange={(e) =>
                          handleInputChange(
                            "scheduledDeparture",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledArrival">
                        Scheduled Arrival*
                      </Label>
                      <Input
                        id="scheduledArrival"
                        type="datetime-local"
                        value={newDisruption.scheduledArrival}
                        onChange={(e) =>
                          handleInputChange("scheduledArrival", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="gate">Gate</Label>
                      <Input
                        id="gate"
                        placeholder="T2-B12"
                        value={newDisruption.gate}
                        onChange={(e) =>
                          handleInputChange("gate", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="passengers">Passengers*</Label>
                      <Input
                        id="passengers"
                        type="number"
                        placeholder="189"
                        value={newDisruption.passengers}
                        onChange={(e) =>
                          handleInputChange("passengers", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="crew">Crew</Label>
                      <Input
                        id="crew"
                        type="number"
                        value={newDisruption.crew}
                        onChange={(e) =>
                          handleInputChange("crew", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                {/* Disruption Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-flydubai-navy">
                    Disruption Details
                  </h3>

                  <div>
                    <Label htmlFor="currentStatus">Current Status*</Label>
                    <Select
                      value={newDisruption.currentStatus}
                      onValueChange={(value) =>
                        handleInputChange("currentStatus", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Delayed">Delayed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Diverted">Diverted</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="delay">Delay (minutes)</Label>
                      <Input
                        id="delay"
                        type="number"
                        placeholder="120"
                        value={newDisruption.delay}
                        onChange={(e) =>
                          handleInputChange("delay", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority*</Label>
                      <Select
                        value={newDisruption.priority}
                        onValueChange={(value) =>
                          handleInputChange("priority", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="categorization">
                      Disruption Categorization*
                    </Label>
                    <Select
                      value={newDisruption.categorization}
                      onValueChange={(value) =>
                        handleInputChange("categorization", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {disruptionCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.category_name}>
                            {cat.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>



                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="disruptionType">Disruption Type</Label>
                      <Select
                        value={newDisruption.disruptionType}
                        onValueChange={(value) =>
                          handleInputChange("disruptionType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                          <SelectItem value="crew">Crew</SelectItem>
                          <SelectItem value="airport">Airport</SelectItem>
                          <SelectItem value="rotation">Rotation</SelectItem>
                          <SelectItem value="air_traffic">
                            Air Traffic
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="severity">Severity*</Label>
                      <Select
                        value={newDisruption.severity}
                        onValueChange={(value) =>
                          handleInputChange("severity", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="disruptionReason">Disruption Reason*</Label>
                    <Input
                      id="disruptionReason"
                      placeholder="Engine maintenance check required"
                      value={newDisruption.disruptionReason}
                      onChange={(e) =>
                        handleInputChange("disruptionReason", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="impact">Impact Description</Label>
                    <Textarea
                      id="impact"
                      placeholder="Brief description of the impact..."
                      value={newDisruption.impact}
                      onChange={(e) =>
                        handleInputChange("impact", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="connectionFlights">
                        Connection Flights
                      </Label>
                      <Input
                        id="connectionFlights"
                        type="number"
                        min="0"
                        placeholder="8"
                        value={newDisruption.connectionFlights}
                        onChange={(e) =>
                          handleInputChange("connectionFlights", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="vipPassengers">VIP Passengers</Label>
                      <Input
                        id="vipPassengers"
                        type="number"
                        placeholder="4"
                        value={newDisruption.vipPassengers}
                        onChange={(e) =>
                          handleInputChange("vipPassengers", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDisruption}
                  className="bg-flydubai-orange hover:bg-orange-600 text-white"
                  disabled={
                    !newDisruption.flightNumber ||
                    !newDisruption.origin ||
                    !newDisruption.destination ||
                    !newDisruption.passengers ||
                    !newDisruption.scheduledDeparture ||
                    !newDisruption.aircraft ||
                    !newDisruption.disruptionReason
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Disruption
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFlights}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing from API...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
      {/* Context Alert */}
      {disruption && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Disruption Context:</strong> {disruption.title} at{" "}
            {disruption.airport?.toUpperCase()} -{disruption.affectedFlights}{" "}
            flights impacted. Last updated {disruption.lastUpdate}.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 flex items-center justify-between">
            <span>{error}</span>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFlights}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                className="border-flydubai-orange text-flydubai-orange hover:bg-orange-50"
              >
                Add New
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={
            selectedFlight && selectedFlight.priority === "Critical"
              ? "border-red-200 bg-red-50"
              : ""
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Critical Flights
                </p>
                <p className="text-lg font-semibold text-red-600">
                  {
                    sortedFlights.filter((f) => f.priority === "Critical")
                      .length
                  }
                </p>
                {selectedFlight && selectedFlight.priority === "Critical" && (
                  <p className="text-xs text-red-600">
                    Selected flight is critical
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={selectedFlight ? "border-blue-200 bg-blue-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight
                    ? "Selected Flight Passengers"
                    : "Total Passengers"}
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {selectedFlight
                    ? selectedFlight.passengers.toLocaleString()
                    : sortedFlights
                        .reduce((sum, f) => sum + f.passengers, 0)
                        .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={selectedFlight ? "border-green-200 bg-green-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight
                    ? "Selected Flight Connections"
                    : "Total Connections"}
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {selectedFlight
                    ? selectedFlight.connectionFlights
                    : sortedFlights.reduce(
                        (sum, f) => sum + f.connectionFlights,
                        0,
                      )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={
            selectedFlight && selectedFlight.delay
              ? "border-purple-200 bg-purple-50"
              : ""
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight ? "Selected Flight Delay" : "Avg Delay"}
                </p>
                <p className="text-lg font-semibold text-purple-600">
                  {selectedFlight
                    ? selectedFlight.delay
                      ? `${selectedFlight.delay}m`
                      : "0m"
                    : `${Math.round(
                        sortedFlights
                          .filter((f) => f.delay)
                          .reduce((sum, f) => sum + f.delay, 0) /
                          sortedFlights.filter((f) => f.delay).length || 0,
                      )}m`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Sort Flights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* First Row - Search */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Flight, city, reason..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Second Row - Main Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Diverted">Diverted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priority: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Origin</label>
                <Select
                  value={filters.origin}
                  onValueChange={(value) =>
                    setFilters({ ...filters, origin: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All origins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    {Array.from(new Set(flights.map(f => f.origin))).sort().map(origin => (
                      <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Categorization
                </label>
                <Select
                  value={filters.categorization}
                  onValueChange={(value) =>
                    setFilters({ ...filters, categorization: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Array.from(new Set(flights.map(f => f.categorization))).sort().map(cat => (
                      <SelectItem key={cat} value={cat}>
                        <span className="truncate block max-w-[200px]" title={cat}>
                          {cat}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                    <SelectItem value="passengers">Passenger Count</SelectItem>
                    <SelectItem value="delay">Delay Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Items per page:</label>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedFlights.length)} of {sortedFlights.length} flights
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Flight Selection (
              {selectedFlight ? "1 selected" : "None selected"})
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Click a row to select flight
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Categorization</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFlights.map((flight) => (
                  <TableRow
                    key={flight.id}
                    className={`cursor-pointer hover:bg-blue-50 ${selectedFlight?.id === flight.id ? "bg-blue-100 border-blue-200" : ""}`}
                    onClick={() => handleFlightSelection(flight)}
                  >
                    <TableCell>
                      <div className="space-y-1 max-w-[120px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold truncate">
                            {flight.id && typeof flight.id === 'string' && flight.id.startsWith('UNKNOWN-')
                              ? (flight.flightNumber || '-')
                              : flight.flightNumber}
                          </span>
                          {flight.status === "Incomplete" &&
                           !(flight.id && typeof flight.id === 'string' && flight.id.startsWith('UNKNOWN-') && !flight.flightNumber) && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              Incomplete
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate" title={flight.aircraft}>
                          {flight.aircraft}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <span className="font-medium truncate">{flight.origin}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">
                          {flight.destination}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-[140px]" title={`${flight.originCity} → ${flight.destinationCity}`}>
                        {flight.originCity} → {flight.destinationCity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatTime(flight.scheduledDeparture)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(flight.scheduledDeparture)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(flight.currentStatus)}>
                        {flight.currentStatus}
                      </Badge>
                      {flight.delay > 0 && (
                        <div className="text-sm text-red-600 mt-1">
                          +{flight.delay}m
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-[200px]">
                        <Badge
                          className={`${getCategorizationColor(
                            flight.categorization,
                          )} text-xs truncate block max-w-full`}
                          title={flight.categorization}
                        >
                          <span className="truncate">
                            {flight.categorization}
                          </span>
                        </Badge>
                        <div className="text-sm text-muted-foreground truncate" title={flight.disruptionReason}>
                          {flight.disruptionReason}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(flight.priority)}>
                        {flight.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{flight.passengers}</div>
                        <div className="text-sm text-muted-foreground">
                          {flight.connectionFlights > 0
                            ? `${flight.connectionFlights} connections`
                            : "Direct flight"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getDisruptionIcon(flight.disruptionType)}
                        </span>
                        <div>
                          <div
                            className={`text-sm font-medium ${getSeverityColor(flight.severity)}`}
                          >
                            {flight.severity} severity
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {flight.lastUpdate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFlight([flight]);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {sortedFlights.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({sortedFlights.length} total flights)
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* No data state */}
          {sortedFlights.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plane className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No affected flights found
              </h3>
              <p className="text-gray-500 mb-4">
                {flights.length === 0
                  ? "There are currently no flight disruptions in the system. Add a new disruption to get started."
                  : "No flights match your current filter criteria. Try adjusting your filters."}
              </p>
              <div className="flex justify-center gap-2">
                {flights.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={fetchFlights}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                )}
                {filteredFlights.length === 0 && flights.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      status: "all",
                      priority: "all",
                      origin: "all",
                      categorization: "all",
                      search: "",
                    })}
                    className="flex items-center gap-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      

      {/* Selected Flight Summary within Flight Selection Card */}
          {selectedFlight && (
            <div className="mt-4 pt-4 border-t">
              <Card className="border-blue-200 bg-blue-50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Left side - Flight Info */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">
                          Selected Flight
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Plane className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-semibold">
                            {selectedFlight.flightNumber}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600">{selectedFlight.origin}</span>
                          <ArrowRight className="h-3 w-3 text-blue-500" />
                          <span className="text-blue-600">{selectedFlight.destination}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-semibold">
                            {impact.passengers.toLocaleString()}
                          </span>
                          <span className="text-blue-700">passengers</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-semibold">
                            {impact.connections}
                          </span>
                          <span className="text-blue-700">connections</span>
                        </div>
                        
                        <Badge className={getStatusColor(selectedFlight.currentStatus)}>
                          {selectedFlight.currentStatus}
                        </Badge>
                        
                        <Badge className={getPriorityColor(selectedFlight.priority)}>
                          {selectedFlight.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFlight(null)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Selection
                      </Button>
                      <Button
                        onClick={handleProceedToRecovery}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Generate Recovery Options
                      </Button>
                    </div>
                  </div>
                  
                  {/* Additional flight details row */}
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-blue-600">Aircraft:</span>
                        <span className="text-blue-800 font-medium">{selectedFlight.aircraft}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-blue-600">Departure:</span>
                        <span className="text-blue-800 font-medium">
                          {formatTime(selectedFlight.scheduledDeparture)} on {formatDate(selectedFlight.scheduledDeparture)}
                        </span>
                      </div>
                      
                      {selectedFlight.delay > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">+{selectedFlight.delay}m delay</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <span className="text-blue-600">Category:</span>
                        <span className="text-blue-800 font-medium truncate max-w-48" title={selectedFlight.categorization}>
                          {selectedFlight.categorization}
                        </span>
                      </div>
                      
                      {selectedFlight.lastUpdate === "Just now" && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Recently Added
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

      {/* Success/Error Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{success ? "Success" : "Error"}</AlertDialogTitle>
            <AlertDialogDescription>{success || error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowAlert(false);
                setSuccess(null);
                setError(null);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}