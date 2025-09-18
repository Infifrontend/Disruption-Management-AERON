"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import {
  Users,
  Clock,
  Plane,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Star,
  CalendarDays,
  Filter,
  Search,
  ArrowRight,
  Hotel,
  UtensilsCrossed,
  Car,
  Luggage,
  Coffee,
  Banknote,
  Copy,
  ExternalLink,
  TrendingDown,
  // FlightIcon as LucidePlane,
  Download,
  UserCheck,
  PhoneCall,
  Mail,
  MessageSquare,
  ThumbsUp,
  CircleCheck,
  Bell,
  Smartphone,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Group,
  Edit,
  Eye,
  Package,
  Route,
  Zap,
  TrendingUp,
  Gauge,
  RefreshCw,
  Target,
  X,
  UserX,
  Wifi,
  Waves,
  Dumbbell,
  Wind,
  Tv,
  Crown,
  Utensils,
  Shield,
  Timer,
  Users2,
  Info,
  Upload,
  ArrowLeft,
  QrCode,
  BellRing,
} from "lucide-react";
import { databaseService } from "../services/databaseService";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { alertService } from "../services/alertService";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { CustomAlertDialog } from "./CustomAlertDialog";
import { useAppContext } from "../context/AppContext";
import { useAirlineTheme } from "../hooks/useAirlineTheme";

export function PassengerRebooking({ context, onClearContext }) {

  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("passenger-service");
  const [crewData, setCrewData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Custom alert state
  const { alertState, showAlert, hideAlert, handleConfirm, handleCancel } =
    useCustomAlert();
  const { reassignedCrewData, setReassignedCrewData } = useAppContext();

  // States for the original PassengerRebooking component
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all-priorities");
  const [selectedStatus, setSelectedStatus] = useState("all-statuses");
  const [showRebookingDialog, setShowRebookingDialog] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [selectedPnrGroup, setSelectedPnrGroup] = useState(null);
  const [selectedPnrs, setSelectedPnrs] = useState(new Set());
  const [expandedPnrs, setExpandedPnrs] = useState(new Set());
  const [groupView, setGroupView] = useState(true);

  // Flight Selection and Additional Services Flow
  const [selectedFlightForServices, setSelectedFlightForServices] =
    useState(null);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState({
    hotel: false,
    mealVoucher: false,
    transport: false,
    specialAssistance: false,
    priorityBaggageHandling: false,
    loungeAccess: false,
  });

  // Cabin Selection State - Track selected cabin for each flight
  const [selectedCabins, setSelectedCabins] = useState({});

  // Additional Services States
  const [showHotelDialog, setShowHotelDialog] = useState(false);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelBookingConfirmed, setHotelBookingConfirmed] = useState(false);
  const [voucherIssued, setVoucherIssued] = useState(false);
  const [transportArranged, setTransportArranged] = useState(false);

  // Enhanced Rebooking States
  const [showFlightDetails, setShowFlightDetails] = useState(null);
  const [selectedRebookingFlight, setSelectedRebookingFlight] = useState(null);

  // Use context passengers if available, otherwise use default passenger data
  const contextPassengers = context?.passengers || [];

  // Get data from navigation state or context - moved up to be available everywhere
  const selectedFlight = context?.selectedFlight || context?.flight;
  const recoveryOption = context?.recoveryOption;
  const fromExecution = context?.fromExecution;

  // Extract preserved selections for easier access
  const preservedSelections = context?.storedSelections; // Renamed for clarity
  const activeContext = context; // Use a distinct name for context
  console.log(context, "Context information");
  // Load reassigned crew data from context if available
  useEffect(() => {
    if (context?.reassignedCrewData && !reassignedCrewData) {
      setReassignedCrewData(context.reassignedCrewData);
    }
  }, [context?.reassignedCrewData, reassignedCrewData, setReassignedCrewData]);

  // State for generated passengers
  const [generatedPassengers, setGeneratedPassengers] = useState([]);

  // State for tracking passenger rebooking status
  const [passengerRebookingStatus, setPassengerRebookingStatus] = useState({});

  // State for tracking confirmed rebookings
  const [confirmedRebookings, setConfirmedRebookings] = useState({});

  // State for loading indicator during submission
  const [isLoading, setIsLoading] = useState(false);

  // State for crew-hotel assignments
  const [crewHotelAssignments, setCrewHotelAssignments] = useState({});
  const [selectedCrewMembers, setSelectedCrewMembers] = useState(new Set());
  const [selectedHotelForCrew, setSelectedHotelForCrew] = useState(null);
  const [selectedCrewForHotel, setSelectedCrewForHotel] = useState([]);
  const { airlineConfig } = useAirlineTheme();

  // State to track PNRs that were selected for approval (prevents auto-clearing)
  const [pnrsForApproval, setPnrsForApproval] = useState(new Set());

  // Enhanced default passenger data with PNR grouping
  const defaultPassengers = [
    {
      id: "PAX-001",
      name: "Ahmed Al-Mansoori",
      pnr: `${airlineConfig.code}8K9L`,
      priority: "VIP",
      status: "Rebooking Required",
      seat: "1A",
      contactInfo: "ahmed.almansoori@email.com",
      specialRequirements: null,
      preferences: {
        seatPreference: "Window",
        mealPreference: "Halal",
        classPreference: "Business",
        loyaltyTier: "Platinum",
      },
      connectedFlights: [
        `${airlineConfig.code}567`,
        `${airlineConfig.code}892`,
      ],
    },
    {
      id: "PAX-002",
      name: "Fatima Al-Mansoori",
      pnr: `${airlineConfig.code}8K9L`, // Same PNR as Ahmed - family booking
      priority: "VIP",
      status: "Rebooking Required",
      seat: "1B",
      contactInfo: "fatima.almansoori@email.com",
      preferences: {
        seatPreference: "Window",
        mealPreference: "Halal",
        classPreference: "Business",
        loyaltyTier: "Platinum",
      },
      connectedFlights: [
        `${airlineConfig.code}567`,
        `${airlineConfig.code}892`,
      ],
    },
    {
      id: "PAX-003",
      name: "Omar Al-Mansoori",
      pnr: `${airlineConfig.code}8K9L`, // Same PNR - child
      priority: "VIP",
      status: "Rebooking Required",
      seat: "1C",
      contactInfo: "ahmed.almansoori@email.com",
      specialRequirements: "Child",
      preferences: {
        seatPreference: "Any",
        mealPreference: "Child Meal",
        classPreference: "Business",
        loyaltyTier: null,
      },
      connectedFlights: [
        `${airlineConfig.code}567`,
        `${airlineConfig.code}892`,
      ],
    },
    {
      id: "PAX-004",
      name: "Sarah Johnson",
      pnr: `${airlineConfig.code}7M2N`,
      priority: "Premium",
      status: "Rebooking Required",
      seat: "3C",
      contactInfo: "sarah.johnson@email.com",
      specialRequirements: "Wheelchair",
      preferences: {
        seatPreference: "Aisle",
        mealPreference: "Vegetarian",
        classPreference: "Economy",
        loyaltyTier: "Gold",
      },
      connectedFlights: [],
    },
    {
      id: "PAX-005",
      name: "John Johnson",
      pnr: `${airlineConfig.code}7M2N`, // Same PNR as Sarah - couple booking
      priority: "Premium",
      status: "Rebooking Required",
      seat: "3D",
      contactInfo: "john.johnson@email.com",
      specialRequirements: null,
      preferences: {
        seatPreference: "Aisle",
        mealPreference: "Standard",
        classPreference: "Economy",
        loyaltyTier: "Gold",
      },
      connectedFlights: [],
    },
    {
      id: "PAX-006",
      name: "Mohammed Al-Zaabi",
      pnr: `${airlineConfig.code}5P8Q`,
      priority: "Standard",
      status: "Accommodation Needed",
      seat: "12F",
      contactInfo: "mohammed.alzaabi@email.com",
      specialRequirements: null,
      preferences: {
        seatPreference: "Window",
        mealPreference: "Standard",
        classPreference: "Economy",
        loyaltyTier: "Silver",
      },
      connectedFlights: [`${airlineConfig.code}445`],
    },
    {
      id: "PAX-007",
      name: "Emma Thompson",
      pnr: `${airlineConfig.code}3R6S`,
      priority: "Premium",
      status: "Alternative Flight",
      seat: "5B",
      contactInfo: "emma.thompson@email.com",
      specialRequirements: "Infant",
      preferences: {
        seatPreference: "Aisle",
        mealPreference: "Standard",
        classPreference: "Premium Economy",
        loyaltyTier: "Gold",
      },
      connectedFlights: [],
    },
    {
      id: "PAX-008",
      name: "Robert Thompson",
      pnr: `${airlineConfig.code}3R6S`, // Same PNR as Emma - family with infant
      priority: "Premium",
      status: "Alternative Flight",
      seat: "5A",
      contactInfo: "robert.thompson@email.com",
      specialRequirements: null,
      preferences: {
        seatPreference: "Window",
        mealPreference: "Standard",
        classPreference: "Premium Economy",
        loyaltyTier: "Gold",
      },
      connectedFlights: [],
    },
    {
      id: "PAX-009",
      name: "Ali Hassan",
      pnr: `${airlineConfig.code}9T4U`,
      priority: "Standard",
      status: "Confirmed",
      seat: "8D",
      contactInfo: "ali.hassan@email.com",
      specialRequirements: "Dietary",
      preferences: {
        seatPreference: "Middle",
        mealPreference: "Halal",
        classPreference: "Economy",
        loyaltyTier: "Bronze",
      },
      connectedFlights: [],
    },
  ];

  // Cabin options with icons and descriptions
  const cabinOptions = [
    {
      key: "business",
      name: "Business",
      icon: Crown,
      description: "Premium service with lie-flat seats",
    },
    {
      key: "premiumEconomy",
      name: "Premium Economy",
      icon: Star,
      description: "Enhanced comfort and service",
    },
    {
      key: "economy",
      name: "Economy",
      icon: Users,
      description: "Standard service and seating",
    },
  ];

  // Additional Services Options
  const additionalServicesOptions = [
    {
      key: "hotel",
      name: "Hotel Accommodation",
      icon: Hotel,
      description: "Overnight stay with meals included",
      estimatedCost: airlineConfig.currency +" 450",
      category: "accommodation",
    },
    {
      key: "mealVoucher",
      name: "Meal Voucher",
      icon: Utensils,
      description: airlineConfig.currency +" 75 dining credit at airport restaurants",
      estimatedCost: airlineConfig.currency +" 75",
      category: "dining",
    },
    {
      key: "transport",
      name: "Ground Transportation",
      icon: Car,
      description: "Airport transfer or taxi service",
      estimatedCost: airlineConfig.currency +" 80",
      category: "transport",
    },
    {
      key: "specialAssistance",
      name: "Special Assistance",
      icon: Shield,
      description: "Wheelchair, elderly, or disability support",
      estimatedCost: "Complimentary",
      category: "assistance",
    },
    {
      key: "priorityBaggageHandling",
      name: "Priority Baggage",
      icon: Package,
      description: "Fast-track baggage processing",
      estimatedCost: airlineConfig.currency +" 25",
      category: "baggage",
    },
    {
      key: "loungeAccess",
      name: "Lounge Access",
      icon: Crown,
      description: `Access to ${airlineConfig.displayName}  Business Lounge`,
      estimatedCost: airlineConfig.currency +" 120",
      category: "comfort",
    },
  ];

  // Enhanced Available Flights with detailed information
  const getAvailableFlights = (passengerOrGroup) => {
    const { airlineConfig } = useAirlineTheme();
    const passengersCount = Array.isArray(passengerOrGroup)
      ? passengerOrGroup.length
      : 1;
    const baseFlights = [
      {
        id: `${airlineConfig.code}567`,
        flightNumber: `${airlineConfig.code}567`,
        airline: airlineConfig.displayName,
        departure: "Tomorrow 08:00",
        arrival: "Tomorrow 12:30",
        route: `DXB → ${context?.flight?.destination || "BOM"}`,
        aircraft: "Boeing 737-800",
        duration: "4h 30m",
        availableSeats: {
          business: { total: 12, available: 8, price: airlineConfig.currency +" 2,400" },
          premiumEconomy: { total: 24, available: 16, price: airlineConfig.currency +" 1,200" },
          economy: { total: 150, available: 89, price: airlineConfig.currency +" 800" },
        },
        suitabilityScore: calculateGroupFlightScore(
          passengerOrGroup,
          `${airlineConfig.code}567`,
        ),
        amenities: ["WiFi", "Meals", "Entertainment", "USB Charging"],
        onTimePerformance: 94,
        cascadeImpact: analyzeGroupCascadeImpact(
          passengerOrGroup,
          `${airlineConfig.code}567`,
        ),
        recommendations: generateGroupRecommendations(
          passengerOrGroup,
          `${airlineConfig.code}567`,
        ),
      },
      {
        id: "EK425",
        flightNumber: "EK425",
        airline: "Emirates (Partner)",
        departure: "Today 16:45",
        arrival: "Today 21:15",
        route: `DXB → ${context?.flight?.destination || "BOM"}`,
        aircraft: "Airbus A380",
        duration: "4h 30m",
        availableSeats: {
          business: { total: 76, available: 12, price: airlineConfig.currency +" 3,800" },
          premiumEconomy: { total: 56, available: 23, price: airlineConfig.currency +" 1,800" },
          economy: { total: 399, available: 156, price: airlineConfig.currency +" 1,200" },
        },
        suitabilityScore: calculateGroupFlightScore(passengerOrGroup, "EK425"),
        amenities: [
          "WiFi",
          "Premium Meals",
          "ICE Entertainment",
          "Lie-flat Seats",
          "Shower Spa",
        ],
        onTimePerformance: 96,
        cascadeImpact: analyzeGroupCascadeImpact(passengerOrGroup, "EK425"),
        recommendations: generateGroupRecommendations(
          passengerOrGroup,
          "EK425",
        ),
      },
      {
        id: `${airlineConfig.code}789`,
        flightNumber: `${airlineConfig.code}789`,
        airline: airlineConfig.displayName,
        departure: "Tomorrow 14:20",
        arrival: "Tomorrow 18:50",
        route: `DXB → ${context?.flight?.destination || "BOM"}`,
        aircraft: "Boeing 737 MAX 8",
        duration: "4h 30m",
        availableSeats: {
          business: { total: 12, available: 4, price: airlineConfig.currency +" 2,600" },
          premiumEconomy: { total: 24, available: 18, price: airlineConfig.currency +" 1,400" },
          economy: { total: 150, available: 67, price: airlineConfig.currency +" 900" },
        },
        suitabilityScore: calculateGroupFlightScore(
          passengerOrGroup,
          `${airlineConfig.code}789`,
        ),
        amenities: ["WiFi", "Meals", "Streaming Entertainment", "USB Charging"],
        onTimePerformance: 91,
        cascadeImpact: analyzeGroupCascadeImpact(
          passengerOrGroup,
          `${airlineConfig.code}789`,
        ),
        recommendations: generateGroupRecommendations(
          passengerOrGroup,
          `${airlineConfig.code}789`,
        ),
      },
      {
        id: "AI131",
        flightNumber: "AI131",
        airline: "Air India (Partner)",
        departure: "Tomorrow 22:30",
        arrival: "Day+1 03:00",
        route: `DXB → ${context?.flight?.destination || "BOM"}`,
        aircraft: "Boeing 787-8",
        duration: "4h 30m",
        availableSeats: {
          business: { total: 18, available: 11, price: airlineConfig.currency +" 2,800" },
          premiumEconomy: { total: 35, available: 28, price: airlineConfig.currency +" 1,500" },
          economy: { total: 211, available: 134, price: airlineConfig.currency +" 950" },
        },
        suitabilityScore: calculateGroupFlightScore(passengerOrGroup, "AI131"),
        amenities: ["WiFi", "Indian Cuisine", "Entertainment", "Extra Legroom"],
        onTimePerformance: 88,
        cascadeImpact: analyzeGroupCascadeImpact(passengerOrGroup, "AI131"),
        recommendations: generateGroupRecommendations(
          passengerOrGroup,
          "AI131",
        ),
      },
    ];

    // Filter flights based on passenger count
    const filteredFlights = baseFlights.map((flight) => {
      const updatedAvailableSeats = {};
      for (const cabin in flight.availableSeats) {
        updatedAvailableSeats[cabin] = {
          ...flight.availableSeats[cabin],
          available: Math.max(
            0,
            flight.availableSeats[cabin].available - passengersCount + 1,
          ), // Adjust available seats if context.flight.passengers is used
        };
      }
      return { ...flight, availableSeats: updatedAvailableSeats };
    });

    // Sort by suitability score (highest first)
    return filteredFlights.sort(
      (a, b) => b.suitabilityScore - a.suitabilityScore,
    );
  };

  // Calculate flight suitability score for groups
  const calculateGroupFlightScore = (passengerOrGroup, flightId) => {
    const passengers = Array.isArray(passengerOrGroup)
      ? passengerOrGroup
      : [passengerOrGroup];
    let totalScore = 0;

    passengers.forEach((passenger) => {
      let score = 70; // Base score

      // Priority adjustments
      if (passenger?.priority === "VIP") score += 15;
      else if (passenger?.priority === "Premium") score += 10;
      else if (passenger?.priority === "Standard") score += 5;

      // Airline preference (flydubai gets bonus)
      if (flightId.startsWith(`${airlineConfig.code}`)) score += 10;

      // Special requirements accommodation
      if (passenger?.specialRequirements) {
        if (flightId === "EK425")
          score += 8; // Emirates has better accessibility
        else score += 5;
      }

      // Loyalty tier bonus
      const loyaltyTier = passenger?.preferences?.loyaltyTier;
      if (loyaltyTier === "Platinum") score += 8;
      else if (loyaltyTier === "Gold") score += 6;
      else if (loyaltyTier === "Silver") score += 4;
      else if (loyaltyTier === "Bronze") score += 2;

      // Group bonus for keeping families together
      if (passengers.length > 1) score += 5;

      totalScore += score;
    });

    // Average score for the group
    const avgScore = totalScore / passengers.length;

    // Group size adjustment
    if (passengers.length > 1) {
      // Slight penalty for large groups on smaller aircraft
      if (
        passengers.length >= 3 &&
        (flightId === `${airlineConfig.code}567` ||
          flightId === `${airlineConfig.code}789`)
      ) {
        return Math.max(avgScore - 3, 0);
      }
    }

    return Math.min(Math.max(avgScore, 0), 100);
  };

  // Analyze cascade impact for groups
  const analyzeGroupCascadeImpact = (passengerOrGroup, flightId) => {
    const passengers = Array.isArray(passengerOrGroup)
      ? passengerOrGroup
      : [passengerOrGroup];
    const allConnectedFlights = [
      ...new Set(passengers.flatMap((p) => p.connectedFlights || [])),
    ];

    if (allConnectedFlights.length === 0) {
      return {
        hasImpact: false,
        affectedFlights: [],
        severity: "none",
        description: "No connecting flights affected for this group",
      };
    }

    const impact = {
      hasImpact: true,
      affectedFlights: allConnectedFlights,
      severity: "medium",
      description: `${allConnectedFlights.length} connecting flight(s) may be affected for ${passengers.length} passenger(s)`,
    };

    // Determine severity based on timing and flight
    if (flightId === "AI131") {
      impact.severity = "high";
      impact.description = `Late arrival may cause missed connections for group of ${passengers.length}`;
    } else if (flightId === "EK425") {
      impact.severity = "low";
      impact.description = `Earlier arrival improves connection reliability for group of ${passengers.length}`;
    }

    return impact;
  };

  // Generate smart recommendations for groups
  const generateGroupRecommendations = (passengerOrGroup, flightId) => {
    const passengers = Array.isArray(passengerOrGroup)
      ? passengerOrGroup
      : [passengerOrGroup];
    const recommendations = [];

    // Group seating recommendations
    recommendations.push({
      type: "seat",
      priority: "high",
      text: `Reserve ${passengers.length} seats together for group`,
      action: "Auto-select adjacent seats for family/group",
    });

    // Special requirements for group
    const specialReqs = passengers
      .filter((p) => p.specialRequirements)
      .map((p) => p.specialRequirements);
    if (specialReqs.length > 0) {
      recommendations.push({
        type: "assistance",
        priority: "high",
        text: `Group assistance required: ${[...new Set(specialReqs)].join(", ")}`,
        action: "Coordinate group assistance services",
      });
    }

    // Meal preferences for group
    const mealPrefs = [
      ...new Set(
        passengers.map((p) => p.preferences?.mealPreference).filter(Boolean),
      ),
    ];
    if (
      mealPrefs.length > 0 &&
      !mealPrefs.every((pref) => pref === "Standard")
    ) {
      recommendations.push({
        type: "meal",
        priority: "medium",
        text: `Special meals for group: ${mealPrefs.join(", ")}`,
        action: "Pre-order all special meals for group",
      });
    }

    // Connection recommendations for group
    const allConnectedFlights = [
      ...new Set(passengers.flatMap((p) => p.connectedFlights || [])),
    ];
    if (allConnectedFlights.length > 0) {
      if (flightId === "AI131") {
        recommendations.push({
          type: "connection",
          priority: "high",
          text: `Rebook all ${allConnectedFlights.length} connecting flights for group`,
          action: "Automatically rebook entire group on next-day connections",
        });
      } else {
        recommendations.push({
          type: "connection",
          priority: "medium",
          text: `Monitor group connections for ${allConnectedFlights.length} flight(s)`,
          action: "Set up group connection alerts",
        });
      }
    }

    // VIP/Premium group services
    const highPriorityPassengers = passengers.filter(
      (p) => p.priority === "VIP" || p.priority === "Premium",
    );
    if (highPriorityPassengers.length > 0) {
      recommendations.push({
        type: "service",
        priority: "high",
        text: `Arrange premium services for ${highPriorityPassengers.length} passenger(s)`,
        action: "Enable group premium services and fast-track",
      });
    }

    return recommendations;
  };

  // Available Hotels Data
  const availableHotels = [
    {
      id: "HTL-001",
      name: "Dubai International Hotel",
      category: "5-Star",
      distance: "0.5 km from DXB",
      pricePerNight: airlineConfig.currency +" 450",
      rating: 4.8,
      amenities: ["Wifi", "Pool", "Gym", "Restaurant", "Airport Shuttle", "AC"],
      availability: "Available",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop",
      description:
        "Luxury hotel directly connected to Dubai International Airport",
    },
    {
      id: "HTL-002",
      name: "Le Meridien Dubai Hotel & Conference Centre",
      category: "5-Star",
      distance: "12 km from DXB",
      pricePerNight: airlineConfig.currency +" 380",
      rating: 4.6,
      amenities: ["Wifi", "Pool", "Gym", "Restaurant", "Spa", "Parking"],
      availability: "Available",
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop",
      description:
        "Elegant hotel with excellent conference facilities and dining options",
    },
    {
      id: "HTL-003",
      name: "Millennium Airport Hotel Dubai",
      category: "4-Star",
      distance: "8 km from DXB",
      pricePerNight: airlineConfig.currency +" 280",
      rating: 4.4,
      amenities: [
        "Wifi",
        "Restaurant",
        "Airport Shuttle",
        "AC",
        "Business Center",
      ],
      availability: "Available",
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop",
      description: "Comfortable business hotel with convenient airport access",
    },
    {
      id: "HTL-004",
      name: "Premier Inn Dubai International Airport",
      category: "3-Star",
      distance: "5 km from DXB",
      pricePerNight: airlineConfig.currency +" 180",
      rating: 4.2,
      amenities: ["Wifi", "Restaurant", "Airport Shuttle", "AC"],
      availability: "Limited",
      image:
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop",
      description:
        "Budget-friendly option with essential amenities and good service",
    },
  ];

  // Generate passengers from context when available
  useEffect(() => {
    let isMounted = true;

    const loadPassengerData = async () => {
      try {
        if (contextPassengers.length === 0 && isMounted) {
          const module = await import("./passenger-data-helpers");
          const flightData = context?.flight || selectedFlight;
          const optionData = context?.recoveryOption || recoveryOption;

          const passengers = module.generateAffectedPassengers(
            flightData,
            optionData,
          );

          if (isMounted) {
            setGeneratedPassengers(passengers);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error generating passengers:", error);
          toast.error("Failed to load passenger data.");
        }
      }
    };

    if (selectedFlight?.id && recoveryOption?.id) {
      loadPassengerData();
    }

    return () => {
      isMounted = false;
    };
  }, [
    selectedFlight?.id,
    recoveryOption?.id,
    contextPassengers.length,
    context?.flight,
    selectedFlight,
    context?.recoveryOption,
    recoveryOption,
  ]);

  const passengers = useMemo(() => {
    const base =
      contextPassengers.length > 0
        ? contextPassengers
        : generatedPassengers.length > 0
          ? generatedPassengers
          : defaultPassengers;

    return base.map((passenger) => {
      const rebookingInfo = confirmedRebookings[passenger.id];
      const statusOverride = passengerRebookingStatus[passenger.id];

      return {
        ...passenger,
        status: statusOverride || passenger.status,
        rebookedFlight: rebookingInfo?.flightNumber,
        rebookedCabin: rebookingInfo?.cabin,
        rebookedSeat: rebookingInfo?.seat,
        rebookingDate: rebookingInfo?.date,
      };
    });
  }, [
    contextPassengers.length,
    generatedPassengers.length,
    passengerRebookingStatus,
    confirmedRebookings,
  ]);

  // Group passengers by PNR
  const passengersByPnr = useMemo(() => {
    const grouped = passengers.reduce((acc, passenger) => {
      if (!acc[passenger.pnr]) {
        acc[passenger.pnr] = [];
      }
      acc[passenger.pnr].push(passenger);
      return acc;
    }, {});
    return grouped;
  }, [passengers]);

  const filteredPassengers = passengers.filter((passenger) => {
    const matchesSearch =
      passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.pnr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      selectedPriority === "all-priorities" ||
      passenger.priority === selectedPriority;
    const matchesStatus =
      selectedStatus === "all-statuses" || passenger.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Filter PNR groups based on search criteria
  const filteredPnrGroups = useMemo(() => {
    const filtered = {};
    Object.entries(passengersByPnr).forEach(([pnr, passengersInGroup]) => {
      const filteredGroupPassengers = (passengersInGroup as any).filter(
        (passenger) => {
          const matchesSearch =
            passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.pnr.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesPriority =
            selectedPriority === "all-priorities" ||
            passenger.priority === selectedPriority;
          const matchesStatus =
            selectedStatus === "all-statuses" ||
            passenger.status === selectedStatus;

          return matchesSearch && matchesPriority && matchesStatus;
        },
      );

      if (filteredGroupPassengers.length > 0) {
        filtered[pnr] = filteredGroupPassengers;
      }
    });
    return filtered;
  }, [
    JSON.stringify(passengersByPnr),
    searchTerm,
    selectedPriority,
    selectedStatus,
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rebooking Required":
        return "bg-red-100 text-red-800 border-red-200";
      case "Accommodation Needed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Alternative Flight":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "VIP":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Premium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Standard":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score) => {
    if (score >= 85) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <Target className="h-4 w-4 text-blue-600" />;
    if (score >= 55) return <Gauge className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getCascadeSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case "seat":
        return <Users className="h-4 w-4" />;
      case "meal":
        return <Utensils className="h-4 w-4" />;
      case "connection":
        return <Route className="h-4 w-4" />;
      case "service":
        return <Star className="h-4 w-4" />;
      case "assistance":
        return <Shield className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "pool":
        return <Waves className="h-4 w-4" />;
      case "gym":
        return <Dumbbell className="h-4 w-4" />;
      case "restaurant":
        return <Utensils className="h-4 w-4" />;
      case "spa":
        return <Coffee className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "airport shuttle":
        return <Car className="h-4 w-4" />;
      case "ac":
        return <Wind className="h-4 w-4" />;
      case "business center":
        return <Tv className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getServiceIcon = (serviceKey) => {
    const service = additionalServicesOptions.find((s) => s.key === serviceKey);
    if (service) {
      const Icon = service.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Shield className="h-4 w-4" />;
  };

  const getReaccommodationType = () => {
    if (!context?.reaccommodationType) return null;

    switch (context.reaccommodationType) {
      case "cancellation":
        return {
          type: "Flight Cancellation",
          icon: X,
          color: "red",
          description:
            "Complete flight cancellation requiring passenger rebooking",
        };
      case "delay":
        return {
          type: "Extended Delay",
          icon: Clock,
          color: "yellow",
          description: "Significant delay requiring accommodation services",
        };
      case "reroute":
        return {
          type: "Route Change",
          icon: MapPin,
          color: "blue",
          description: "Flight diversion or rerouting with ground transport",
        };
      default:
        return {
          type: "Service Required",
          icon: Users,
          color: "gray",
          description: "Passenger service intervention needed",
        };
    }
  };

  const reaccommodationType = getReaccommodationType();

  // Cabin selection handlers
  const handleCabinSelection = (flightId, cabinKey) => {
    setSelectedCabins((prev) => ({
      ...prev,
      [flightId]: cabinKey,
    }));
  };

  const getSelectedCabin = (flightId) => {
    return selectedCabins[flightId] || null;
  };

  const isCabinAvailableForGroup = (flight, cabinKey, groupSize = 1) => {
    const cabin = flight.availableSeats[cabinKey];
    return cabin && cabin.available >= groupSize;
  };

  const handleRebookPassenger = (passenger) => {
    setSelectedPassenger(passenger);
    setSelectedPnrGroup(null);
    setShowRebookingDialog(true);
  };

  const handleRebookPnrGroup = (pnr, passengersInGroup) => {
    setSelectedPnrGroup({ pnr, passengers: passengersInGroup });
    setSelectedPassenger(null);
    setShowRebookingDialog(true);
  };

  const handleHotelBooking = (passengerOrGroup) => {
    if (selectedPnrGroup) {
      setSelectedPassenger(selectedPnrGroup.passengers[0]); // Use first passenger for booking
    } else {
      setSelectedPassenger(passengerOrGroup);
    }
    setShowHotelDialog(true);
  };

  const handleVoucherIssue = (passengerOrGroup) => {
    if (selectedPnrGroup) {
      setSelectedPassenger(selectedPnrGroup.passengers[0]);
    } else {
      setSelectedPassenger(passengerOrGroup);
    }
    setShowVoucherDialog(true);
  };

  const handleTransportArrange = (passengerOrGroup) => {
    if (selectedPnrGroup) {
      setSelectedPassenger(selectedPnrGroup.passengers[0]);
    } else {
      setSelectedPassenger(passengerOrGroup);
    }
    setShowTransportDialog(true);
  };

  const handleFlightSelection = (flight) => {
    const selectedCabin = getSelectedCabin(flight.id);

    if (!selectedCabin) {
      toast.error("Please select a cabin class before proceeding");
      return;
    }

    const flightWithCabin = {
      ...flight,
      selectedCabin: selectedCabin,
      selectedCabinDetails: flight.availableSeats[selectedCabin],
      passengerContext: selectedPnrGroup || selectedPassenger,
    };

    setSelectedFlightForServices(flightWithCabin);
    setShowAdditionalServices(true);

    toast.success(
      `Flight ${flight.flightNumber} selected for ${selectedCabin} class`,
    );
  };

  const handleAdditionalServiceChange = (serviceKey, checked) => {
    setSelectedAdditionalServices((prev) => ({
      ...prev,
      [serviceKey]: checked,
    }));
  };

  const handlePnrSelection = (pnr) => {
    setSelectedPnrs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pnr)) {
        newSet.delete(pnr);
      } else {
        newSet.add(pnr);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const unconfirmedPnrs = Object.keys(filteredPnrGroups).filter(
        (pnr) => !isPnrGroupConfirmed(filteredPnrGroups[pnr]),
      );
      setSelectedPnrs(new Set(unconfirmedPnrs));
    } else {
      setSelectedPnrs(new Set());
    }
  };

  const handleExpandPnr = (pnr) => {
    setExpandedPnrs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pnr)) {
        newSet.delete(pnr);
      } else {
        newSet.add(pnr);
      }
      return newSet;
    });
  };

  const handleBulkRebookSelectedPnrs = () => {
    if (selectedPnrs.size === 0) {
      toast.error("Please select PNR groups to rebook");
      return;
    }

    const selectedPnrGroups = Array.from(selectedPnrs).map((pnr) => ({
      pnr,
      passengers: filteredPnrGroups[pnr as any],
    }));

    setSelectedPnrGroup({
      pnr: `${selectedPnrs.size} groups`,
      passengers: selectedPnrGroups.flatMap((group) => group.passengers),
    });
    setSelectedPassenger(null);
    setShowRebookingDialog(true);
  };

  const handleBackToFlightSelection = () => {
    setShowAdditionalServices(false);
    setSelectedFlightForServices(null);
    setSelectedAdditionalServices({
      hotel: false,
      mealVoucher: false,
      transport: false,
      specialAssistance: false,
      priorityBaggageHandling: false,
      loungeAccess: false,
    });
  };

  const handleSkipAdditionalServices = () => {
    handleSaveChanges();
  };

  const handleSaveChanges = () => {
    if (!selectedFlightForServices) return;

    const passengersToUpdate = selectedPnrGroup
      ? selectedPnrGroup.passengers
      : [selectedPassenger];
    const selectedServices = Object.entries(selectedAdditionalServices)
      .filter(([_, selected]) => selected)
      .map(([service, _]) => service);

    // Update passenger rebooking status
    const newRebookings = {};
    const newStatuses = {};

    passengersToUpdate.forEach((passenger) => {
      newRebookings[passenger.id] = {
        flightNumber: selectedFlightForServices.flightNumber,
        cabin: selectedFlightForServices.selectedCabin,
        seat: `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
        date: new Date().toISOString(),
        services: selectedServices,
      };
      newStatuses[passenger.id] = "Confirmed";
    });

    setConfirmedRebookings((prev) => ({ ...prev, ...newRebookings }));
    setPassengerRebookingStatus((prev) => ({ ...prev, ...newStatuses }));

    // Close dialogs and reset state
    setShowRebookingDialog(false);
    setShowAdditionalServices(false);
    setSelectedFlightForServices(null);
    setSelectedPassenger(null);
    setSelectedPnrGroup(null);
    setSelectedAdditionalServices({
      hotel: false,
      mealVoucher: false,
      transport: false,
      specialAssistance: false,
      priorityBaggageHandling: false,
      loungeAccess: false,
    });

    toast.success(
      `Successfully rebooked ${passengersToUpdate.length} passenger(s)`,
      {
        description: `Flight: ${selectedFlightForServices.flightNumber} (${selectedFlightForServices.selectedCabin})`,
      },
    );
  };

  const confirmHotelBooking = (hotel) => {
    setSelectedHotel(hotel);
    setHotelBookingConfirmed(true);
    toast.success("Hotel booking confirmed", {
      description: `Reservation made at ${hotel.name}`,
    });
  };

  const issueVoucher = (amount, type) => {
    setVoucherIssued(true);
    toast.success(`${type} meal voucher issued`, {
      description: `${airlineConfig.currency} ${selectedPnrGroup ? amount * selectedPnrGroup.passengers.length : amount} credit`,
    });
  };

  const arrangeTransport = (type, description) => {
    setTransportArranged(true);
    toast.success("Transportation arranged", {
      description: description,
    });
  };

  // Function to check if all passengers in a PNR group are confirmed
  const isPnrGroupConfirmed = (groupPassengers) => {
    return groupPassengers.every((p) => {
      // Check both the updated status and the original status
      const currentStatus = passengerRebookingStatus[p.id] || p.status;
      return currentStatus === "Confirmed";
    });
  };

  // Logic to handle crew assignment confirmation
  const handleCrewSelection = (memberIdentifier) => {
    setSelectedCrewMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberIdentifier)) {
        newSet.delete(memberIdentifier);
      } else {
        newSet.add(memberIdentifier);
      }
      return newSet;
    });
  };

  const handleConfirmCrewAssignment = async () => {
    try {
      if (selectedCrewMembers.size === 0) {
        showAlert(
          "Selection Required",
          "Please select at least one crew member before confirming assignment.",
          "error",
        );
        return;
      }

      if (!selectedHotelForCrew) {
        showAlert(
          "Hotel Selection Required",
          "Please select a hotel for crew accommodation before confirming assignment.",
          "error",
        );
        return;
      }

      // Generate a unique assignment ID
      const assignmentId = `CHA-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      // Calculate check-in and check-out dates
      const checkInDate = new Date();
      checkInDate.setHours(checkInDate.getHours() + 2); // 2 hours from now
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1); // Next day

      // Get crew data from multiple sources with proper null checks
      const allCrewData = [
        ...(Array.isArray(selectedFlight?.crew) ? selectedFlight.crew : []),
        ...(Array.isArray(context?.flight?.crew) ? context.flight.crew : []),
        ...(Array.isArray(context?.crewData) ? context.crewData : []),
        ...(Array.isArray(crewData?.crew) ? crewData.crew : []),
        // Add default crew data if no crew data is available
        ...(!crewData?.crew || crewData.crew.length === 0
          ? [
              {
                id: "CR001",
                name: "Capt. Ahmed Al-Mansouri",
                role: "Captain",
                base: "DXB",
                status: "Available",
                contact: "+971-50-1234567",
              },
              {
                id: "CR002",
                name: "F/O Sarah Johnson",
                role: "First Officer",
                base: "DXB",
                status: "Available",
                contact: "+971-50-2345678",
              },
              {
                id: "CR003",
                name: "Fatima Al-Mansouri",
                role: "Senior Cabin Crew",
                base: "DXB",
                status: "Available",
                contact: "+971-50-3456789",
              },
              {
                id: "CR004",
                name: "Ahmed Hassan",
                role: "Cabin Crew",
                base: "DXB",
                status: "Duty Violation",
                contact: "+971-50-4567890",
              },
            ]
          : []),
      ];

      // Prepare crew list from selected members
      const crewList = Array.from(selectedCrewMembers).map((crewName) => {
        const crewMember = allCrewData.find(
          (member) =>
            member.name === crewName ||
            member.employee_id === crewName ||
            member.id === crewName ||
            `${member.name} (${member.role || member.rank || "Crew"})` ===
              crewName,
        );

        return {
          employee_id:
            crewMember?.employee_id ||
            crewMember?.id ||
            `EMP-${Math.random().toString(36).substr(2, 8)}`,
          name:
            crewMember?.name || (crewName as any).split(" (")[0] || crewName,
          rank:
            crewMember?.role ||
            crewMember?.rank ||
            crewMember?.position ||
            "Crew Member",
          base: crewMember?.base || crewMember?.home_base || "DXB",
          contact_number:
            crewMember?.contact ||
            crewMember?.phone ||
            `+971-50-${Math.floor(Math.random() * 9000000) + 1000000}`,
        };
      });

      const assignment = {
        disruption_id:
          selectedFlight?.id ||
          context?.flight?.id ||
          context?.disruption_id ||
          "CREW_DISRUPTION",
        crew_member: crewList,
        hotel_name: selectedHotelForCrew.name,
        hotel_location: `${selectedHotelForCrew.distance} from Airport`,
        check_in_date: checkInDate.toISOString(),
        check_out_date: checkOutDate.toISOString(),
        room_number: `${Math.floor(Math.random() * 3000) + 1000}`,
        special_requests: "Standard crew accommodation",
        assignment_status: "assigned",
        total_cost:
          parseFloat(
            selectedHotelForCrew.pricePerNight.replace(/[^\d.]/g, ""),
          ) * crewList.length,
        booking_reference: assignmentId,
        transport_details: {
          pickup_location: "DXB Terminal 3 Crew Gate",
          pickup_time: new Date(
            checkInDate.getTime() - 30 * 60 * 1000,
          ).toISOString(), // 30 min before check-in
          dropoff_location: "Hotel Lobby",
          dropoff_time: new Date(
            checkOutDate.getTime() + 30 * 60 * 1000,
          ).toISOString(), // 30 min after check-out
          vehicle_type: "Mini Van",
          vendor: "City Crew Transport",
        },
        created_by: "ops_user_01",
      };

      // Store assignment in state
      setCrewHotelAssignments((prev) => ({
        ...prev,
        [assignmentId]: assignment,
      }));

      // Clear selections
      setSelectedCrewMembers(new Set());
      setSelectedHotelForCrew(null);

      showAlert(
        "Assignment Successful",
        `Successfully assigned ${crewList.length} crew members to ${selectedHotelForCrew.name}. Booking reference: ${assignmentId}`,
        "success",
      );
    } catch (error) {
      console.error("Error in handleConfirmCrewAssignment:", error);
      showAlert(
        "Assignment Failed",
        `An error occurred while assigning crew: ${error.message}`,
        "error",
      );
    }
  };

  const handleSendForApproval = async () => {
    const disruptionFlightId = context?.flight?.id || selectedFlight?.id;

    if (!disruptionFlightId) {
      alertService.error(
        "Missing Information",
        "Flight disruption information is missing.",
      );
      return;
    }

    const impactArea = recoveryOption?.impact_area || [];
    const hasPassenger = impactArea.includes("passenger");
    const hasCrew = impactArea.includes("crew");

    // Get all confirmed passengers (those who have been rebooked)
    const confirmedPassengers = passengers.filter((p) => {
      const currentStatus = passengerRebookingStatus[p.id] || p.status;
      return currentStatus === "Confirmed" && confirmedRebookings[p.id];
    });

    // Validate based on impact area - crew-only validation
    if (
      hasCrew &&
      !hasPassenger &&
      Object.keys(crewHotelAssignments).length === 0
    ) {
      alertService.warning(
        "Crew Assignment Required",
        "Crew hotel assignments must be completed before sending for approval.",
      );
      return;
    }

    // Validate passenger-only scenarios
    if (hasPassenger && !hasCrew && confirmedPassengers.length === 0) {
      alertService.warning(
        "No Passengers Processed",
        "At least one passenger must be rebooked and confirmed before sending for approval.",
      );
      return;
    }

    // Validate mixed scenarios (both passenger and crew)
    if (hasPassenger && hasCrew) {
      if (confirmedPassengers.length === 0) {
        alertService.warning(
          "No Passengers Processed",
          "At least one passenger must be rebooked and confirmed before sending for approval.",
        );
        return;
      }

      if (Object.keys(crewHotelAssignments).length === 0) {
        alertService.warning(
          "Crew Assignment Required",
          "Crew hotel assignments are required before sending for approval.",
        );
        return;
      }
    }

    try {
      setIsLoading(true);

      // Update flight recovery status
      const statusSuccess = await databaseService.updateFlightRecoveryStatus(
        disruptionFlightId,
        "services_pending",
      );

      if (statusSuccess) {
        // Prepare passenger rebooking data if applicable
        let passengerRebookingData = [];
        if (hasPassenger && confirmedPassengers.length > 0) {
          passengerRebookingData = confirmedPassengers.map((passenger) => {
            const rebookingInfo = confirmedRebookings[passenger.id];
            return {
              disruption_id: disruptionFlightId,
              pnr: passenger.pnr,
              passenger_id: passenger.id,
              passenger_name: passenger.name,
              original_flight:
                passenger.originalFlight ||
                context?.flight?.flightNumber ||
                selectedFlight?.flight_number ||
                "N/A",
              original_seat: passenger.seat,
              rebooked_flight: rebookingInfo?.flightNumber || "TBD",
              rebooked_cabin: rebookingInfo?.cabin || "Economy",
              rebooked_seat: rebookingInfo?.seat || "TBD",
              rebooking_date: rebookingInfo?.date || new Date().toISOString(),
              additional_services: (rebookingInfo?.services || []).map(
                (service) => ({
                  service_type: service,
                  description: service,
                }),
              ),
              total_passengers_in_pnr:
                filteredPnrGroups[passenger.pnr]?.length || 1,
              rebooking_cost: 0,
              notes: `Approved rebooking for disruption ${disruptionFlightId}`,
            };
          });
        }

        // Prepare crew hotel assignments data if applicable
        let crewHotelAssignmentsData = [];
        if (hasCrew && Object.keys(crewHotelAssignments).length > 0) {
          crewHotelAssignmentsData = Object.values(crewHotelAssignments).map(
            (assignment) => ({
              disruption_id: disruptionFlightId,
              crew_member: (assignment as any).crew_member,
              hotel_name: (assignment as any).hotel_name,
              hotel_location: (assignment as any).hotel_location,
              check_in_date: (assignment as any).check_in_date,
              check_out_date: (assignment as any).check_out_date,
              room_number: (assignment as any).room_number,
              special_requests: (assignment as any).special_requests,
              assignment_status: (assignment as any).assignment_status,
              total_cost: (assignment as any).total_cost,
              transport_details: (assignment as any).transport_details,
              created_by: (assignment as any).created_by,
            }),
          );
        }

        // Build unified payload for addPendingSolution
        const solutionData = {
          disruption_id: disruptionFlightId,
          option_id: recoveryOption?.id || `SERVICES_${Date.now()}`,
          option_title:
            recoveryOption?.title || "Comprehensive Services Recovery",
          estimated_cost:
            typeof recoveryOption?.cost === "string"
              ? recoveryOption.cost
              : recoveryOption?.cost
                ? `${airlineConfig.currency} ${recoveryOption.cost.toLocaleString()}`
                : airlineConfig.currency +" 75,000",
          estimated_delay: recoveryOption?.delay || 0,
          passenger_impact: {
            affected: hasPassenger ? confirmedPassengers.length : 0,
            reaccommodated: hasPassenger ? confirmedPassengers.length : 0,
            compensated: 0,
            missingConnections: hasPassenger
              ? confirmedPassengers.filter(
                  (p) => p.connectedFlights && p.connectedFlights.length > 0,
                ).length
              : 0,
          },
          operational_complexity: recoveryOption?.complexity || "medium",
          resource_requirements: JSON.stringify(
            recoveryOption?.requirements || {},
          ),
          timeline_details: JSON.stringify(
            recoveryOption?.timeline || "3 hours total",
          ),
          approval_status: "pending",
          created_by: "passenger_services",
          notes: `Submitted from passenger services with ${hasPassenger ? confirmedPassengers.length : 0} passengers processed`,
          selected_aircraft: recoveryOption?.selectedAircraft || null,
        };

        // Add optional data only if present
        if (passengerRebookingData.length > 0) {
          (solutionData as any).passenger_rebooking = passengerRebookingData;
        }

        if (crewHotelAssignmentsData.length > 0) {
          (solutionData as any).crew_hotel_assignments =
            crewHotelAssignmentsData;
        }

        // Include reassigned crew data from multiple sources
        console.log(reassignedCrewData, "Context test information");
        console.log(recoveryOption?.fullDetails, "contenneee");
        const finalReassignedCrewData =
          reassignedCrewData ||
          context?.reassignedCrewData ||
          recoveryOption?.fullDetails?.reassigned_crew ||
          null;

        if (finalReassignedCrewData) {
          (solutionData as any).reassigned_crew = finalReassignedCrewData;
        }

        // Ensure crew information is included in full_details for proper storage
        (solutionData as any).full_details = {
          ...((solutionData as any).full_details || {}),
          passenger_rebooking: passengerRebookingData,
          crew_hotel_assignments: crewHotelAssignmentsData,
          reassigned_crew: finalReassignedCrewData,
        };
        const pendingSolutionSuccess =
          await databaseService.addPendingSolution(solutionData);

        if (pendingSolutionSuccess) {
          let successMessage = "Services sent for approval successfully!\n";

          if (hasPassenger && !hasCrew) {
            // Passenger-only scenario
            const uniquePnrs = new Set(confirmedPassengers.map((p) => p.pnr))
              .size;
            successMessage += `${confirmedPassengers.length} passengers across ${uniquePnrs} PNR groups processed.`;
          } else if (hasCrew && !hasPassenger) {
            // Crew-only scenario
            const totalCrewAssigned = Object.values(
              crewHotelAssignments,
            ).reduce(
              (total, assignment) =>
                total + (assignment as any).crew_member.length,
              0,
            );
            successMessage += `${totalCrewAssigned} crew members assigned to ${Object.keys(crewHotelAssignments).length} hotel(s).`;
          } else if (hasPassenger && hasCrew) {
            // Both scenarios
            const uniquePnrs = new Set(confirmedPassengers.map((p) => p.pnr))
              .size;
            const totalCrewAssigned = Object.values(
              crewHotelAssignments,
            ).reduce(
              (total, assignment) =>
                total + (assignment as any).crew_member.length,
              0,
            );
            successMessage += `${confirmedPassengers.length} passengers across ${uniquePnrs} PNR groups processed.\n`;
            successMessage += `${totalCrewAssigned} crew members assigned to ${Object.keys(crewHotelAssignments).length} hotel(s).`;
          }

          alertService.success("Submission Successful", successMessage, () => {
            // Clear selections after successful submission
            setSelectedPnrs(new Set());
            setSelectedPassenger(null);
            setSelectedPnrGroup(null);
            setCrewHotelAssignments({});
            setPnrsForApproval(new Set());
            setSelectedCrewMembers(new Set());
            setSelectedHotelForCrew(null);

            // Navigate to Affected Flights page
            navigate("/disruption");
          });
        } else {
          alertService.error(
            "Submission Failed",
            "Failed to submit services for approval.",
          );
        }
      } else {
        alertService.warning(
          "Status Update Warning",
          "Failed to update flight status.",
        );
      }
    } catch (error) {
      console.error("Error submitting passenger recovery solution:", error);
      alertService.error(
        "Submission Error",
        "An error occurred while submitting the passenger recovery solution. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const totalPassengers =
    context?.flight?.passengers ||
    selectedFlight?.passengers ||
    context?.totalPassengers ||
    passengers.length;
  const rebookingRequired = passengers.filter(
    (p) => p.status === "Rebooking Required",
  ).length;
  const accommodationNeeded = passengers.filter(
    (p) => p.status === "Accommodation Needed",
  ).length;
  const confirmed = passengers.filter((p) => p.status === "Confirmed").length;

  const displayData = groupView
    ? filteredPnrGroups
    : { individual: filteredPassengers };

  const groupSize = selectedPnrGroup ? selectedPnrGroup.passengers.length : 1;

  // Calculate total cost for selected additional services
  const calculateTotalServicesCost = () => {
    let total = 0;
    Object.entries(selectedAdditionalServices).forEach(
      ([serviceKey, selected]) => {
        if (selected) {
          const service = additionalServicesOptions.find(
            (s) => s.key === serviceKey,
          );
          if (service && service.estimatedCost !== "Complimentary") {
            const cost =
              parseInt(service.estimatedCost.replace(/[^\d]/g, "")) || 0;
            total += cost * groupSize;
          }
        }
      },
    );
    return total;
  };

  // Load crew data when crew tab is accessed
  useEffect(() => {
    if (activeTab === "crew-schedule" && recoveryOption?.id && !crewData) {
      loadCrewData();
    }
  }, [activeTab, recoveryOption?.id, crewData]);

  // Track confirmed PNRs for approval but don't auto-clear selectedPnrs
  useEffect(() => {
    const confirmedPnrs = new Set();
    Object.entries(filteredPnrGroups).forEach(([pnr, groupPassengers]) => {
      if (isPnrGroupConfirmed(groupPassengers)) {
        confirmedPnrs.add(pnr);
      }
    });

    // Add confirmed PNRs to approval tracking
    if (confirmedPnrs.size > 0) {
      setPnrsForApproval((prev) => {
        const newSet = new Set([...prev, ...confirmedPnrs]);
        // Only update if there are actually new items
        if (newSet.size !== prev.size) {
          return newSet;
        }
        return prev;
      });
    }
  }, [passengerRebookingStatus, Object.keys(filteredPnrGroups).length]);

  const loadCrewData = async () => {
    setLoading(true);
    try {
      // Mock fetching recovery option which includes crew data
      // In a real app, this would be an API call
      const recoveryOptionData = {
        id: "REC001",
        title: "Crew Disruption - Hotel Accommodation Needed",
        description: "Flight cancellation due to crew unavailability.",
        impact_area: ["crew"],
        crewData: [
          // Mock crew data
          {
            id: "CR1001",
            name: "Capt. Aisha Al-Farsi",
            role: "Captain",
            base: "DXB",
            status: "Available",
            contact: "+971-50-5551212",
            issue: null,
            experience_years: 15,
            location: "DXB",
            score: 85,
            isAutoAssigned: true,
            assignedAt: "2023-10-26T10:00:00Z",
            replacedCrew: "Capt. John Doe",
          },
          {
            id: "CR1002",
            name: "F/O Ben Carter",
            role: "First Officer",
            base: "DXB",
            status: "On Duty",
            contact: "+971-50-5553434",
            issue: null,
            experience_years: 8,
            location: "DXB",
            score: 78,
            isAutoAssigned: false,
            assignedAt: "2023-10-26T11:00:00Z",
            replacedCrew: "F/O Jane Smith",
          },
          {
            id: "CR1003",
            name: "Purser Nadia Ali",
            role: "Purser",
            base: "DXB",
            status: "Available",
            contact: "+971-50-5555656",
            issue: null,
            experience_years: 10,
            location: "DXB",
            score: 92,
            isAutoAssigned: true,
            assignedAt: "2023-10-26T10:30:00Z",
            replacedCrew: "Purser Ali Khan",
          },
          {
            id: "CR1004",
            name: "CBI Ahmed Khan",
            role: "Cabin Crew",
            base: "DXB",
            status: "Available",
            contact: "+971-50-5557878",
            issue: "In transit, requires hotel before next assignment",
            experience_years: 5,
            location: "DXB",
            score: 70,
            isAutoAssigned: false,
            assignedAt: "2023-10-26T12:00:00Z",
            replacedCrew: "CBI Omar Farooq",
          },
          {
            id: "CR1005",
            name: "CBI Layla Hassan",
            role: "Cabin Crew",
            base: "DXB",
            status: "Available",
            contact: "+971-50-5559090",
            issue: null,
            experience_years: 6,
            location: "DXB",
            score: 75,
            isAutoAssigned: true,
            assignedAt: "2023-10-26T11:30:00Z",
            replacedCrew: "CBI Fatima Ahmed",
          },
        ],
        crewConstraints: {
          maxDutyHours: 14,
          minRestPeriod: 10,
          preferredHotels: ["HTL-001", "HTL-003"],
        },
        operationalConstraints: {
          maxHotelCostPerNight: 500,
        },
      };

      setCrewData({
        crew: recoveryOptionData.crewData,
        crewConstraints: recoveryOptionData.crewConstraints || {},
        operationalConstraints: recoveryOptionData.operationalConstraints || {},
      });
    } catch (error) {
      console.error("Error loading crew data:", error);
      setCrewData({
        crew: [],
        crewConstraints: {},
        operationalConstraints: {},
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFlight || !recoveryOption) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Recovery Option Selected
            </h3>
            <p className="text-gray-500">
              Please select a recovery option from the comparison matrix to
              access passenger services.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/comparison")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Comparison
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine if all PNR groups are confirmed
  const allPnrsConfirmed = Object.values(filteredPnrGroups).every((group) =>
    isPnrGroupConfirmed(group),
  );

  // Check if Send for Approval should be enabled - must have selections and all must be confirmed
  // const canSendForApproval =
  //   selectedPnrs.size > 0 &&
  //   Array.from(selectedPnrs).every((pnr) => {
  //     const groupPassengers = filteredPnrGroups[pnr];
  //     return (
  //       groupPassengers &&
  //       groupPassengers.every((p) => {

  //         const currentStatus = passengerRebookingStatus[p.id] || p.status;
  //         return currentStatus === "Confirmed";
  //       })
  //     );
  //   });

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">
            Services
          </h2>
          <p className="text-muted-foreground">
            {context
              ? `Managing ${totalPassengers} passengers affected by ${context.recoveryOption?.title}`
              : "Manage passenger rebooking, accommodations, and special services"}
          </p>
        </div>
        {/* <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="btn-flydubai-primary">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
        </div> */}
      </div>

      {/* Flight Information Display */}
      {(context?.flight || selectedFlight) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Plane className="h-5 w-5" />
              Selected Flight Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">
                  Flight Number
                </div>
                <div className="font-semibold text-blue-900">
                  {context?.flight?.flightNumber ||
                    selectedFlight?.flight_number ||
                    "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">Route</div>
                <div className="font-semibold text-blue-900">
                  {context?.flight?.route ||
                    (selectedFlight &&
                      `${selectedFlight.origin} → ${selectedFlight.destination}`) ||
                    "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">
                  Aircraft
                </div>
                <div className="font-semibold text-blue-900">
                  {context?.flight?.aircraft ||
                    selectedFlight?.aircraft ||
                    "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">
                  Passengers
                </div>
                <div className="font-semibold text-blue-900">
                  {context?.flight?.passengers ||
                    selectedFlight?.passengers ||
                    totalPassengers}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">
                  Scheduled Departure
                </div>
                <div className="font-semibold text-blue-900">
                  {context?.flight?.scheduledDeparture ||
                    selectedFlight?.scheduled_departure ||
                    "TBD"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">Status</div>
                <div className="font-semibold text-blue-900">
                  {context?.flight?.status ||
                    selectedFlight?.status ||
                    "Active"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">
                  Recovery Option
                </div>
                <div className="font-semibold text-blue-900">
                  {context?.recoveryOption?.title ||
                    recoveryOption?.title ||
                    "Standard Recovery"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-blue-600 font-medium">Delay</div>
                <div className="font-semibold text-blue-900">
                  {context?.flight?.delayMinutes ||
                  selectedFlight?.delay_minutes
                    ? `${context?.flight?.delayMinutes || selectedFlight?.delay_minutes} min`
                    : "On time"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Passenger Service and Crew Schedule */}
      {(() => {
        const impactArea = recoveryOption?.impact_area || [];
        const hasPassenger = impactArea.includes("passenger");
        const hasCrew = impactArea.includes("crew");
        const showBothTabs = hasPassenger && hasCrew;
        const showOnlyPassenger = hasPassenger && !hasCrew;
        const showOnlyCrew = hasCrew && !hasPassenger;

        // If neither impact area is specified, show both tabs (default behavior)
        const shouldShowBoth = showBothTabs || (!hasPassenger && !hasCrew);

        if (showOnlyPassenger) {
          return (
            <Tabs value="passenger-service" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="passenger-service">
                  Passenger Service
                </TabsTrigger>
              </TabsList>
              <TabsContent value="passenger-service" className="space-y-6">
                {/* Stats Cards - moved inside passenger service tab */}
                <div className="flex items-center justify-between pt-5">
                  <div>
                    <h2 className="text-2xl font-semibold text-flydubai-navy">
                      {/* Passenger Services */}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button className="btn-flydubai-primary">
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">
                            Confirmed
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {context ? confirmed : "3,247"}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-600 text-sm font-medium">
                            Rebooking Required
                          </p>
                          <p className="text-2xl font-bold text-red-700">
                            {context ? rebookingRequired : "89"}
                          </p>
                        </div>
                        <RefreshCw className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-600 text-sm font-medium">
                            Accommodation
                          </p>
                          <p className="text-2xl font-bold text-yellow-700">
                            {context ? accommodationNeeded : "45"}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">
                            VIP Passengers
                          </p>
                          <p className="text-2xl font-bold text-blue-700">
                            {context
                              ? passengers.filter((p) => p.priority === "VIP")
                                  .length
                              : "12"}
                          </p>
                        </div>
                        <Star className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters and View Toggle */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-flydubai-blue" />
                        {context
                          ? `Filter Affected Passengers (${passengers.length})`
                          : "Passenger Filters"}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={groupView ? "default" : "outline"}
                          size="sm"
                          onClick={() => setGroupView(true)}
                          className={
                            groupView
                              ? "btn-flydubai-primary"
                              : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                          }
                        >
                          <Group className="h-4 w-4 mr-2" />
                          PNR Groups
                        </Button>
                        <Button
                          variant={!groupView ? "default" : "outline"}
                          size="sm"
                          onClick={() => setGroupView(false)}
                          className={
                            !groupView
                              ? "btn-flydubai-primary"
                              : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                          }
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Individual
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Name or PNR"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Priority
                        </label>
                        <Select
                          value={selectedPriority}
                          onValueChange={setSelectedPriority}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-priorities">
                              All Priorities
                            </SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Status
                        </label>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-statuses">
                              All Statuses
                            </SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Rebooking Required">
                              Rebooking Required
                            </SelectItem>
                            <SelectItem value="Accommodation Needed">
                              Accommodation Needed
                            </SelectItem>
                            <SelectItem value="Alternative Flight">
                              Alternative Flight
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          className="w-full border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedPriority("all-priorities");
                            setSelectedStatus("all-statuses");
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Passenger List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-flydubai-navy">
                          {context
                            ? `Affected Passengers - ${context.flight?.flightNumber}`
                            : "Passenger List"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {groupView
                            ? `Showing ${Object.keys(filteredPnrGroups).length} PNR groups with ${Object.values(filteredPnrGroups).flat().length} passengers`
                            : `Showing ${filteredPassengers.length} of ${passengers.length} passengers`}
                        </p>
                      </div>
                      {groupView && (
                        <div className="flex gap-2">
                          {selectedPnrs.size > 0 && (
                            <>
                              <Button
                                size="sm"
                                className="btn-flydubai-primary"
                                onClick={handleBulkRebookSelectedPnrs}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Rebook {selectedPnrs.size} PNR(s)
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                                onClick={() => setSelectedPnrs(new Set())}
                              >
                                Clear Selection
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {groupView ? (
                      // PNR Group View
                      <div className="space-y-4">
                        {/* Select All Header */}
                        {Object.keys(filteredPnrGroups).length > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <Checkbox
                              checked={
                                selectedPnrs.size ===
                                  Object.keys(filteredPnrGroups).filter(
                                    (pnr) =>
                                      !isPnrGroupConfirmed(
                                        filteredPnrGroups[pnr],
                                      ),
                                  ).length && selectedPnrs.size > 0
                              }
                              onCheckedChange={handleSelectAll}
                              disabled={Object.keys(filteredPnrGroups).every(
                                (pnr) =>
                                  isPnrGroupConfirmed(filteredPnrGroups[pnr]),
                              )}
                            />
                            <span className="font-medium text-gray-700">
                              Select All (
                              {Object.keys(filteredPnrGroups).length} PNR
                              groups)
                            </span>
                            {selectedPnrs.size > 0 && (
                              <Badge variant="outline" className="ml-auto">
                                {selectedPnrs.size} selected
                              </Badge>
                            )}
                          </div>
                        )}

                        {Object.entries(filteredPnrGroups).map(
                          ([pnr, groupPassengers]) => (
                            <div
                              key={pnr}
                              className="border rounded-lg bg-white"
                            >
                              <div className="p-4 border-b bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={selectedPnrs.has(pnr)}
                                      onCheckedChange={() =>
                                        handlePnrSelection(pnr)
                                      }
                                      disabled={isPnrGroupConfirmed(
                                        groupPassengers,
                                      )}
                                      className="border-flydubai-blue data-[state=checked]:bg-flydubai-blue disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-flydubai-blue" />
                                        <span className="font-semibold">
                                          PNR: {pnr}
                                        </span>
                                        <Badge
                                          variant="secondary"
                                          className="bg-blue-100 text-blue-800"
                                        >
                                          {(groupPassengers as any).length}{" "}
                                          passenger
                                          {(groupPassengers as any).length > 1
                                            ? "s"
                                            : ""}
                                        </Badge>
                                        {isPnrGroupConfirmed(
                                          groupPassengers,
                                        ) && (
                                          <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Confirmed
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        Group Priority:{" "}
                                        {groupPassengers[0]?.priority ||
                                          "Standard"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleExpandPnr(pnr)}
                                      className="text-flydubai-blue hover:bg-blue-50"
                                    >
                                      {expandedPnrs.has(pnr) ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                      {expandedPnrs.has(pnr)
                                        ? "Collapse"
                                        : "Expand"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleRebookPnrGroup(
                                          pnr,
                                          groupPassengers,
                                        )
                                      }
                                      disabled={isPnrGroupConfirmed(
                                        groupPassengers,
                                      )}
                                      className="btn-flydubai-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      {isPnrGroupConfirmed(groupPassengers)
                                        ? "Rebooking Complete"
                                        : "Rebook Group"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {expandedPnrs.has(pnr) && (
                                <div className="p-4 border-t">
                                  <div className="grid gap-3">
                                    {(groupPassengers as any).map(
                                      (passenger) => (
                                        <div
                                          key={passenger.id}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div>
                                              <div className="font-medium">
                                                {passenger.name}
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {passenger.contactInfo}
                                              </div>
                                            </div>
                                            <Badge
                                              className={getPriorityColor(
                                                passenger.priority,
                                              )}
                                            >
                                              {passenger.priority}
                                            </Badge>
                                            <Badge
                                              className={getStatusColor(
                                                passenger.status,
                                              )}
                                            >
                                              {passenger.status}
                                            </Badge>
                                            <div className="text-sm text-gray-600">
                                              Seat: {passenger.seat}
                                            </div>
                                            {passenger.specialRequirements && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                {passenger.specialRequirements}
                                              </Badge>
                                            )}
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              handleRebookPassenger(passenger)
                                            }
                                            className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                          </Button>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      // Individual Passenger View
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Passenger</TableHead>
                            <TableHead>PNR</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Seat</TableHead>
                            <TableHead>Special Requirements</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPassengers.map((passenger) => (
                            <TableRow
                              key={passenger.id}
                              className="hover:bg-blue-50"
                            >
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {passenger.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {passenger.contactInfo}
                                  </div>
                                  {passenger.rebookedFlight && (
                                    <div className="text-xs text-green-600 mt-1">
                                      Rebooked to: {passenger.rebookedFlight} (
                                      {passenger.rebookedCabin})
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <Badge className="badge-flydubai-outline mb-1">
                                    {passenger.pnr}
                                  </Badge>
                                  {passenger.rebookedFlight && (
                                    <div className="text-xs text-gray-500">
                                      New Seat: {passenger.rebookedSeat}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getPriorityColor(
                                    passenger.priority,
                                  )}
                                >
                                  {passenger.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(passenger.status)}
                                >
                                  {passenger.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{passenger.seat}</TableCell>
                              <TableCell>
                                {passenger.specialRequirements ? (
                                  <Badge variant="outline" className="text-xs">
                                    {passenger.specialRequirements}
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">None</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRebookPassenger(passenger)
                                    }
                                    className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  {passenger.status ===
                                    "Rebooking Required" && (
                                    <Button
                                      size="sm"
                                      className="btn-flydubai-primary text-xs"
                                      onClick={() =>
                                        handleRebookPassenger(passenger)
                                      }
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Rebook
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          );
        }

        if (showOnlyCrew) {
          return (
            <Tabs value="crew-schedule" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="crew-schedule">
                  Crew Schedule Information
                </TabsTrigger>
              </TabsList>
              <TabsContent value="crew-schedule" className="space-y-6">
                {/* Crew Assignment Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-flydubai-blue" />
                      Crew Schedule Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flydubai-blue mr-4"></div>
                        <span>Loading crew information...</span>
                      </div>
                    ) : (
                      <div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Select</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Rank</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              // Get violated crew from reassigned crew data in app context
                              const { reassignedCrewData } = useAppContext();
                              let violatedCrewList = [];

                              if (
                                reassignedCrewData?.reassignedCrew?.length > 0
                              ) {
                                // Filter for violated crew (those who had issues and were replaced)
                                violatedCrewList =
                                  reassignedCrewData.reassignedCrew
                                    .filter(
                                      (crew) =>
                                        crew.replacedCrew &&
                                        (crew.issue ||
                                          crew.status === "Sick" ||
                                          crew.status === "Unavailable"),
                                    )
                                    .map((crew) => ({
                                      name: crew.replacedCrew,
                                      rank: crew.role,
                                      status: crew.issue
                                        ? "Duty Violation"
                                        : crew.status,
                                      issue: crew.issue,
                                    }));
                              }

                              // If no violated crew from context, check if there's crew data from the context
                              if (
                                violatedCrewList.length === 0 &&
                                context?.recoveryOption?.fullDetails
                                  ?.rotationPlan?.crew
                              ) {
                                violatedCrewList =
                                  context.recoveryOption.fullDetails.rotationPlan.crew
                                    .filter(
                                      (crew) =>
                                        crew.status === "Sick" ||
                                        crew.status === "Unavailable" ||
                                        crew.issue,
                                    )
                                    .map((crew) => ({
                                      name: crew.name,
                                      rank: crew.role,
                                      status: crew.issue
                                        ? "Duty Violation"
                                        : crew.status,
                                      issue: crew.issue,
                                    }));
                              }

                              // If still no data, fall back to mock data for demonstration
                              if (violatedCrewList.length === 0) {
                                violatedCrewList = [
                                  {
                                    name: "No violated crew data found",
                                    rank: "-",
                                    status: "No Data",
                                    issue: null,
                                  },
                                ];
                              }

                              return violatedCrewList.map((crew, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 text-flydubai-blue focus:ring-flydubai-blue border-gray-300 rounded"
                                      disabled={crew.status === "No Data"}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedCrewMembers((prev) => {
                                            const newSet = new Set(prev);
                                            newSet.add(crew.name);
                                            return newSet;
                                          });
                                          setSelectedCrewForHotel((prev) => [
                                            ...prev,
                                            crew,
                                          ]);
                                        } else {
                                          setSelectedCrewMembers((prev) => {
                                            const newSet = new Set(prev);
                                            newSet.delete(crew.name);
                                            return newSet;
                                          });
                                          setSelectedCrewForHotel((prev) =>
                                            prev.filter(
                                              (c) => c.name !== crew.name,
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {crew.name}
                                  </TableCell>
                                  <TableCell>{crew.rank}</TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        crew.status === "Available"
                                          ? "bg-green-100 text-green-800 border-green-300"
                                          : crew.status === "Duty Violation"
                                            ? "bg-red-100 text-red-800 border-red-300"
                                            : crew.status === "No Data"
                                              ? "bg-gray-100 text-gray-800 border-gray-300"
                                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                      }
                                    >
                                      {crew.status}
                                    </Badge>
                                    {crew.issue && (
                                      <div className="text-xs text-red-600 mt-1">
                                        {crew.issue}
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ));
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Hotel Selection for Crew */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5 text-flydubai-blue" />
                      Hotel Selection for Crew Accommodation
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Select hotels for crew members based on the disrupted
                      flight's location
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableHotels.slice(0, 4).map((hotel) => (
                        <Card
                          key={hotel.id}
                          className={`hover:shadow-md transition-shadow cursor-pointer border-2 ${
                            selectedHotelForCrew?.id === hotel.id
                              ? "border-flydubai-blue bg-blue-50"
                              : "hover:border-flydubai-blue"
                          }`}
                          onClick={() => setSelectedHotelForCrew(hotel)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <img
                                src={hotel.image}
                                alt={hotel.name}
                                className="w-20 h-14 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-flydubai-navy text-sm">
                                      {hotel.name}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                      {hotel.category} • {hotel.distance}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-flydubai-orange text-sm">
                                      {hotel.pricePerNight}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      per night
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < Math.floor(hotel.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {hotel.rating}
                                  </span>
                                  <Badge
                                    className={
                                      hotel.availability === "Available"
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    }
                                  >
                                    {hotel.availability}
                                  </Badge>
                                </div>

                                <p className="text-xs text-gray-600 mb-3">
                                  {hotel.description}
                                </p>

                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={
                                      selectedHotelForCrew?.id === hotel.id
                                    }
                                    onChange={() =>
                                      setSelectedHotelForCrew(hotel)
                                    }
                                  />
                                  <span className="text-xs font-medium">
                                    Select for crew
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Crew to Hotel Mapping */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-flydubai-blue" />
                        Crew Assignment to Selected Hotels
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">
                          Selected crew members will be assigned to chosen
                          hotels automatically based on:
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1 ml-4">
                          <li>• Crew rank and seniority</li>
                          <li>• Hotel proximity to airport</li>
                          <li>• Room availability</li>
                          <li>• Company policies</li>
                        </ul>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="btn-flydubai-primary"
                          onClick={handleConfirmCrewAssignment}
                          disabled={
                            selectedCrewMembers.size === 0 ||
                            !selectedHotelForCrew
                          }
                        >
                          {selectedCrewMembers.size === 0
                            ? "Select Crew Members"
                            : !selectedHotelForCrew
                              ? "Select Hotel"
                              : `Confirm Assignment (${selectedCrewMembers.size} crew)`}
                        </Button>
                        <Button size="sm" variant="outline">
                          View Assignment Details (
                          {Object.keys(crewHotelAssignments).length})
                        </Button>
                      </div>

                      {/* Current Assignments Display */}
                      {Object.keys(crewHotelAssignments).length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Current Crew-Hotel Assignments (
                            {Object.keys(crewHotelAssignments).length})
                          </h4>
                          <div className="space-y-3">
                            {Object.values(crewHotelAssignments).map(
                              (assignment, index) => (
                                <div
                                  key={index}
                                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <div className="font-medium text-green-800">
                                        {(assignment as any).hotel_name}
                                      </div>
                                      <div className="text-sm text-green-700">
                                        Booking:{" "}
                                        {(assignment as any).booking_reference}
                                      </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">
                                      {(assignment as any).assignment_status}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-green-700">
                                    Crew:{" "}
                                    {(assignment as any).crew_member
                                      .map((c) => c.name)
                                      .join(", ")}
                                  </div>
                                  <div className="text-sm text-green-600 mt-1">
                                    Check-in:{" "}
                                    {new Date(
                                      (assignment as any).check_in_date,
                                    ).toLocaleDateString()}{" "}
                                    | Cost: {airlineConfig.currency} {(assignment as any).total_cost}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          );
        }

        // Show both tabs (default or when both impact areas are present)
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="passenger-service">
                Passenger Service
              </TabsTrigger>
              <TabsTrigger value="crew-schedule">
                Crew Schedule Information
              </TabsTrigger>
            </TabsList>
            <TabsContent value="passenger-service" className="space-y-6">
              {/* Stats Cards - moved inside passenger service tab */}
              <div className="flex items-center justify-between pt-5">
                <div>
                  <h2 className="text-2xl font-semibold text-flydubai-navy">
                    {/* Passenger Services */}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button className="btn-flydubai-primary">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">
                          Confirmed
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {context ? confirmed : "3,247"}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-600 text-sm font-medium">
                          Rebooking Required
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          {context ? rebookingRequired : "89"}
                        </p>
                      </div>
                      <RefreshCw className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">
                          Accommodation
                        </p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {context ? accommodationNeeded : "45"}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">
                          VIP Passengers
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {context
                            ? passengers.filter((p) => p.priority === "VIP")
                                .length
                            : "12"}
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and View Toggle */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-flydubai-blue" />
                      {context
                        ? `Filter Affected Passengers (${passengers.length})`
                        : "Passenger Filters"}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={groupView ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGroupView(true)}
                        className={
                          groupView
                            ? "btn-flydubai-primary"
                            : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                        }
                      >
                        <Group className="h-4 w-4 mr-2" />
                        PNR Groups
                      </Button>
                      <Button
                        variant={!groupView ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGroupView(false)}
                        className={
                          !groupView
                            ? "btn-flydubai-primary"
                            : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                        }
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Individual
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Name or PNR"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Priority
                      </label>
                      <Select
                        value={selectedPriority}
                        onValueChange={setSelectedPriority}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-priorities">
                            All Priorities
                          </SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Status
                      </label>
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-statuses">
                            All Statuses
                          </SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Rebooking Required">
                            Rebooking Required
                          </SelectItem>
                          <SelectItem value="Accommodation Needed">
                            Accommodation Needed
                          </SelectItem>
                          <SelectItem value="Alternative Flight">
                            Alternative Flight
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        className="w-full border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedPriority("all-priorities");
                          setSelectedStatus("all-statuses");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Passenger List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-flydubai-navy">
                        {context
                          ? `Affected Passengers - ${context.flight?.flightNumber}`
                          : "Passenger List"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {groupView
                          ? `Showing ${Object.keys(filteredPnrGroups).length} PNR groups with ${Object.values(filteredPnrGroups).flat().length} passengers`
                          : `Showing ${filteredPassengers.length} of ${passengers.length} passengers`}
                      </p>
                    </div>
                    {groupView && (
                      <div className="flex gap-2">
                        {selectedPnrs.size > 0 && (
                          <>
                            <Button
                              size="sm"
                              className="btn-flydubai-primary"
                              onClick={handleBulkRebookSelectedPnrs}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Rebook {selectedPnrs.size} PNR(s)
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                              onClick={() => setSelectedPnrs(new Set())}
                            >
                              Clear Selection
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {groupView ? (
                    // PNR Group View
                    <div className="space-y-4">
                      {/* Select All Header */}
                      {Object.keys(filteredPnrGroups).length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                          <Checkbox
                            checked={
                              selectedPnrs.size ===
                                Object.keys(filteredPnrGroups).filter(
                                  (pnr) =>
                                    !isPnrGroupConfirmed(
                                      filteredPnrGroups[pnr],
                                    ),
                                ).length && selectedPnrs.size > 0
                            }
                            onCheckedChange={handleSelectAll}
                            disabled={Object.keys(filteredPnrGroups).every(
                              (pnr) =>
                                isPnrGroupConfirmed(filteredPnrGroups[pnr]),
                            )}
                          />
                          <span className="font-medium text-gray-700">
                            Select All ({Object.keys(filteredPnrGroups).length}{" "}
                            PNR groups)
                          </span>
                          {selectedPnrs.size > 0 && (
                            <Badge variant="outline" className="ml-auto">
                              {selectedPnrs.size} selected
                            </Badge>
                          )}
                        </div>
                      )}

                      {Object.entries(filteredPnrGroups).map(
                        ([pnr, groupPassengers]) => (
                          <div key={pnr} className="border rounded-lg bg-white">
                            <div className="p-4 border-b bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={selectedPnrs.has(pnr)}
                                    onCheckedChange={() =>
                                      handlePnrSelection(pnr)
                                    }
                                    disabled={isPnrGroupConfirmed(
                                      groupPassengers,
                                    )}
                                    className="border-flydubai-blue data-[state=checked]:bg-flydubai-blue disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-flydubai-blue" />
                                      <span className="font-semibold">
                                        PNR: {pnr}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800"
                                      >
                                        {(groupPassengers as any).length}{" "}
                                        passenger
                                        {(groupPassengers as any).length > 1
                                          ? "s"
                                          : ""}
                                      </Badge>
                                      {isPnrGroupConfirmed(groupPassengers) && (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Confirmed
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      Group Priority:{" "}
                                      {groupPassengers[0]?.priority ||
                                        "Standard"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleExpandPnr(pnr)}
                                    className="text-flydubai-blue hover:bg-blue-50"
                                  >
                                    {expandedPnrs.has(pnr) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    {expandedPnrs.has(pnr)
                                      ? "Collapse"
                                      : "Expand"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleRebookPnrGroup(pnr, groupPassengers)
                                    }
                                    disabled={isPnrGroupConfirmed(
                                      groupPassengers,
                                    )}
                                    className="btn-flydubai-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    {isPnrGroupConfirmed(groupPassengers)
                                      ? "Rebooking Complete"
                                      : "Rebook Group"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {expandedPnrs.has(pnr) && (
                              <div className="p-4 border-t">
                                <div className="grid gap-3">
                                  {(groupPassengers as any).map((passenger) => (
                                    <div
                                      key={passenger.id}
                                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div>
                                          <div className="font-medium">
                                            {passenger.name}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {passenger.contactInfo}
                                          </div>
                                        </div>
                                        <Badge
                                          className={getPriorityColor(
                                            passenger.priority,
                                          )}
                                        >
                                          {passenger.priority}
                                        </Badge>
                                        <Badge
                                          className={getStatusColor(
                                            passenger.status,
                                          )}
                                        >
                                          {passenger.status}
                                        </Badge>
                                        <div className="text-sm text-gray-600">
                                          Seat: {passenger.seat}
                                        </div>
                                        {passenger.specialRequirements && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {passenger.specialRequirements}
                                          </Badge>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleRebookPassenger(passenger)
                                        }
                                        className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    // Individual Passenger View
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Passenger</TableHead>
                          <TableHead>PNR</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Seat</TableHead>
                          <TableHead>Special Requirements</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPassengers.map((passenger) => (
                          <TableRow
                            key={passenger.id}
                            className="hover:bg-blue-50"
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {passenger.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {passenger.contactInfo}
                                </div>
                                {passenger.rebookedFlight && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Rebooked to: {passenger.rebookedFlight} (
                                    {passenger.rebookedCabin})
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge className="badge-flydubai-outline mb-1">
                                  {passenger.pnr}
                                </Badge>
                                {passenger.rebookedFlight && (
                                  <div className="text-xs text-gray-500">
                                    New Seat: {passenger.rebookedSeat}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getPriorityColor(passenger.priority)}
                              >
                                {passenger.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(passenger.status)}
                              >
                                {passenger.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{passenger.seat}</TableCell>
                            <TableCell>
                              {passenger.specialRequirements ? (
                                <Badge variant="outline" className="text-xs">
                                  {passenger.specialRequirements}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRebookPassenger(passenger)
                                  }
                                  className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                {passenger.status === "Rebooking Required" && (
                                  <Button
                                    size="sm"
                                    className="btn-flydubai-primary text-xs"
                                    onClick={() =>
                                      handleRebookPassenger(passenger)
                                    }
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Rebook
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crew-schedule" className="space-y-6">
              {/* Crew Schedule Information Tab */}
              {/* Crew Assignment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-flydubai-blue" />
                    Crew Schedule Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flydubai-blue mr-4"></div>
                      <span>Loading crew information...</span>
                    </div>
                  ) : (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Select</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            // Get violated crew from reassigned crew data in app context
                            const { reassignedCrewData } = useAppContext();
                            let violatedCrewList = [];

                            if (
                              reassignedCrewData?.reassignedCrew?.length > 0
                            ) {
                              // Filter for violated crew (those who had issues and were replaced)
                              violatedCrewList =
                                reassignedCrewData.reassignedCrew
                                  .filter(
                                    (crew) =>
                                      crew.replacedCrew &&
                                      (crew.issue ||
                                        crew.status === "Sick" ||
                                        crew.status === "Unavailable"),
                                  )
                                  .map((crew) => ({
                                    name: crew.replacedCrew,
                                    rank: crew.role,
                                    status: crew.issue
                                      ? "Duty Violation"
                                      : crew.status,
                                    issue: crew.issue,
                                  }));
                            }

                            // If no violated crew from context, check if there's crew data from the context
                            if (
                              violatedCrewList.length === 0 &&
                              context?.recoveryOption?.fullDetails?.rotationPlan
                                ?.crew
                            ) {
                              violatedCrewList =
                                context.recoveryOption.fullDetails.rotationPlan.crew
                                  .filter(
                                    (crew) =>
                                      crew.status === "Sick" ||
                                      crew.status === "Unavailable" ||
                                      crew.issue,
                                  )
                                  .map((crew) => ({
                                    name: crew.name,
                                    rank: crew.role,
                                    status: crew.issue
                                      ? "Duty Violation"
                                      : crew.status,
                                    issue: crew.issue,
                                  }));
                            }

                            // If still no data, fall back to mock data for demonstration
                            if (violatedCrewList.length === 0) {
                              violatedCrewList = [
                                {
                                  name: "No violated crew data found",
                                  rank: "-",
                                  status: "No Data",
                                  issue: null,
                                },
                              ];
                            }

                            return violatedCrewList.map((crew, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-flydubai-blue focus:ring-flydubai-blue border-gray-300 rounded"
                                    disabled={crew.status === "No Data"}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCrewMembers((prev) => {
                                          const newSet = new Set(prev);
                                          newSet.add(crew.name);
                                          return newSet;
                                        });
                                        setSelectedCrewForHotel((prev) => [
                                          ...prev,
                                          crew,
                                        ]);
                                      } else {
                                        setSelectedCrewMembers((prev) => {
                                          const newSet = new Set(prev);
                                          newSet.delete(crew.name);
                                          return newSet;
                                        });
                                        setSelectedCrewForHotel((prev) =>
                                          prev.filter(
                                            (c) => c.name !== crew.name,
                                          ),
                                        );
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {crew.name}
                                </TableCell>
                                <TableCell>{crew.rank}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      crew.status === "Available"
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : crew.status === "Duty Violation"
                                          ? "bg-red-100 text-red-800 border-red-300"
                                          : crew.status === "No Data"
                                            ? "bg-gray-100 text-gray-800 border-gray-300"
                                            : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                    }
                                  >
                                    {crew.status}
                                  </Badge>
                                  {crew.issue && (
                                    <div className="text-xs text-red-600 mt-1">
                                      {crew.issue}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ));
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hotel Selection for Crew */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-flydubai-blue" />
                    Hotel Selection for Crew Accommodation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select hotels for crew members based on the disrupted
                    flight's location
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableHotels.slice(0, 4).map((hotel) => (
                      <Card
                        key={hotel.id}
                        className={`hover:shadow-md transition-shadow cursor-pointer border-2 ${
                          selectedHotelForCrew?.id === hotel.id
                            ? "border-flydubai-blue bg-blue-50"
                            : "hover:border-flydubai-blue"
                        }`}
                        onClick={() => setSelectedHotelForCrew(hotel)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              className="w-20 h-14 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-flydubai-navy text-sm">
                                    {hotel.name}
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    {hotel.category} • {hotel.distance}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-flydubai-orange text-sm">
                                    {hotel.pricePerNight}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    per night
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < Math.floor(hotel.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {hotel.rating}
                                </span>
                                <Badge
                                  className={
                                    hotel.availability === "Available"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  }
                                >
                                  {hotel.availability}
                                </Badge>
                              </div>

                              <p className="text-xs text-gray-600 mb-3">
                                {hotel.description}
                              </p>

                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={
                                    selectedHotelForCrew?.id === hotel.id
                                  }
                                  onChange={() =>
                                    setSelectedHotelForCrew(hotel)
                                  }
                                />
                                <span className="text-xs font-medium">
                                  Select for crew
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Crew to Hotel Mapping */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-flydubai-blue" />
                      Crew Assignment to Selected Hotels
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Selected crew members will be assigned to chosen hotels
                        automatically based on:
                      </div>
                      <ul className="text-xs text-gray-500 space-y-1 ml-4">
                        <li>• Crew rank and seniority</li>
                        <li>• Hotel proximity to airport</li>
                        <li>• Room availability</li>
                        <li>• Company policies</li>
                      </ul>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="btn-flydubai-primary"
                        onClick={handleConfirmCrewAssignment}
                        disabled={
                          selectedCrewMembers.size === 0 ||
                          !selectedHotelForCrew
                        }
                      >
                        {selectedCrewMembers.size === 0
                          ? "Select Crew Members"
                          : !selectedHotelForCrew
                            ? "Select Hotel"
                            : `Confirm Assignment (${selectedCrewMembers.size} crew)`}
                      </Button>
                      <Button size="sm" variant="outline">
                        View Assignment Details (
                        {Object.keys(crewHotelAssignments).length})
                      </Button>
                    </div>

                    {/* Current Assignments Display */}
                    {Object.keys(crewHotelAssignments).length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Current Crew-Hotel Assignments (
                          {Object.keys(crewHotelAssignments).length})
                        </h4>
                        <div className="space-y-3">
                          {Object.values(crewHotelAssignments).map(
                            (assignment, index) => (
                              <div
                                key={index}
                                className="bg-green-50 border border-green-200 rounded-lg p-3"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <div className="font-medium text-green-800">
                                      {(assignment as any).hotel_name}
                                    </div>
                                    <div className="text-sm text-green-700">
                                      Booking:{" "}
                                      {(assignment as any).booking_reference}
                                    </div>
                                  </div>
                                  <Badge className="bg-green-100 text-green-700">
                                    {(assignment as any).assignment_status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-green-700">
                                  Crew:{" "}
                                  {(assignment as any).crew_member
                                    .map((c) => c.name)
                                    .join(", ")}
                                </div>
                                <div className="text-sm text-green-600 mt-1">
                                  Check-in:{" "}
                                  {new Date(
                                    (assignment as any).check_in_date,
                                  ).toLocaleDateString()}{" "}
                                  | Cost: {airlineConfig.currency} {(assignment as any).total_cost}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Crew HOTAC Tab */}
            <TabsContent value="crew-hotac" className="space-y-6">
              {/* Content for Crew HOTAC tab remains here */}
            </TabsContent>

            {/* Audit & Reports Tab */}
            <TabsContent value="audit" className="space-y-6">
              {/* Content for Audit & Reports tab remains here */}
            </TabsContent>
          </Tabs>
        );
      })()}

      {/* Common Execute Section - Always Visible */}
      {fromExecution && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800 mb-2">
                  Ready to Submit Recovery Option
                </h3>
                <p className="text-sm text-green-700">
                  {(() => {
                    const impactArea = recoveryOption?.impact_area || [];
                    const hasPassenger = impactArea.includes("passenger");
                    const hasCrew = impactArea.includes("crew");

                    if (hasPassenger && hasCrew) {
                      return "Passenger and crew services have been reviewed. Submit for approval to proceed.";
                    } else if (hasPassenger && !hasCrew) {
                      return "Passenger services have been reviewed. Submit for approval to proceed.";
                    } else if (hasCrew && !hasPassenger) {
                      return "Crew assignments have been completed. Submit for approval to proceed.";
                    } else {
                      return activeTab === "passenger-service"
                        ? "Passenger services have been reviewed. Submit for approval to proceed."
                        : "Crew schedule impact has been assessed. Submit for approval to proceed.";
                    }
                  })()}
                </p>
                {(() => {
                  const impactArea = recoveryOption?.impact_area || [];
                  const hasCrew = impactArea.includes("crew");
                  const hasPassenger = impactArea.includes("passenger");

                  if (
                    hasCrew &&
                    !hasPassenger &&
                    Object.keys(crewHotelAssignments).length === 0
                  ) {
                    return (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Complete crew hotel assignments before submitting
                      </p>
                    );
                  } else if (hasPassenger && !hasCrew) {
                    const confirmedPassengers = passengers.filter((p) => {
                      const currentStatus =
                        passengerRebookingStatus[p.id] || p.status;
                      return (
                        currentStatus === "Confirmed" &&
                        confirmedRebookings[p.id]
                      );
                    });

                    if (confirmedPassengers.length === 0) {
                      return (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Complete passenger rebooking before submitting
                        </p>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
              <Button
                className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                onClick={handleSendForApproval}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <BellRing className="h-4 w-4 mr-2" />
                )}
                Send for Approval
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Rebooking Dialog with Additional Services Flow */}
      <Dialog open={showRebookingDialog} onOpenChange={setShowRebookingDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-flydubai-blue" />
              {selectedPnrGroup
                ? selectedPnrs.size > 1
                  ? `Bulk Rebooking - ${selectedPnrs.size} PNR Groups (${
                      Object.values(filteredPnrGroups)
                        .filter(([pnr]) => selectedPnrs.has(pnr))
                        .flat().length
                    } passengers)`
                  : `Group Rebooking - PNR ${selectedPnrGroup.pnr} (${selectedPnrGroup.passengers.length} passengers)`
                : `Passenger Services - ${selectedPassenger?.name}`}
            </DialogTitle>
            <DialogDescription>
              {selectedPnrGroup
                ? selectedPnrs.size > 1
                  ? `Manage rebooking and services for ${selectedPnrs.size} PNR groups: ${selectedPnrs.size > 3 ? Array.from(selectedPnrs).slice(0, 3).join(", ") + "..." : Array.from(selectedPnrs).join(", ")}`
                  : `Manage rebooking and services for PNR: ${selectedPnrGroup.pnr}`
                : `Manage rebooking and services for PNR: ${selectedPassenger?.pnr}`}
            </DialogDescription>
          </DialogHeader>

          {(selectedPassenger || selectedPnrGroup) && (
            <div className="space-y-6">
              {/* Additional Services Step */}
              {showAdditionalServices && selectedFlightForServices ? (
                <div className="space-y-6">
                  {/* Flight Selection Summary */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Flight Selected:{" "}
                        {selectedFlightForServices.flightNumber}
                      </CardTitle>
                      <p className="text-sm text-green-700">
                        {selectedFlightForServices.route} •{" "}
                        {selectedFlightForServices.departure} →{" "}
                        {selectedFlightForServices.arrival}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-green-800">
                            {
                              cabinOptions.find(
                                (c) =>
                                  c.key ===
                                  selectedFlightForServices.selectedCabin,
                              )?.name
                            }
                          </div>
                          <div className="text-sm text-green-600">
                            Cabin Class
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-green-800">
                            {
                              selectedFlightForServices.selectedCabinDetails
                                .price
                            }
                          </div>
                          <div className="text-sm text-green-600">
                            Price per Person
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-green-800">
                            {selectedFlightForServices.suitabilityScore}%
                          </div>
                          <div className="text-sm text-green-600">
                            Suitability Score
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Services Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-flydubai-blue" />
                        Additional Services (Optional)
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Select optional services to enhance your travel
                        experience. All services are optional and can be
                        skipped.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {additionalServicesOptions.map((service) => {
                          const Icon = service.icon;
                          const isSelected =
                            selectedAdditionalServices[service.key];
                          const serviceCost =
                            service.estimatedCost === "Complimentary"
                              ? 0
                              : parseInt(
                                  service.estimatedCost.replace(/[^\d]/g, ""),
                                ) || 0;
                          const totalCost = serviceCost * groupSize;

                          return (
                            <div
                              key={service.key}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "border-flydubai-blue bg-blue-50"
                                  : "border-gray-200 hover:border-flydubai-blue hover:bg-blue-50"
                              }`}
                              onClick={() =>
                                handleAdditionalServiceChange(
                                  service.key,
                                  !isSelected,
                                )
                              }
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                      handleAdditionalServiceChange(
                                        service.key,
                                        checked,
                                      )
                                    }
                                  />
                                  <Icon
                                    className={`h-5 w-5 ${isSelected ? "text-flydubai-blue" : "text-gray-600"}`}
                                  />
                                  <span
                                    className={`font-medium ${isSelected ? "text-flydubai-blue" : "text-gray-900"}`}
                                  >
                                    {service.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-flydubai-orange">
                                    {service.estimatedCost === "Complimentary"
                                      ? "Free"
                                      : groupSize > 1
                                        ? `${airlineConfig.currency} ${totalCost}`
                                        : service.estimatedCost}
                                  </span>
                                  {groupSize > 1 && serviceCost > 0 && (
                                    <div className="text-xs text-gray-500">
                                      ({service.estimatedCost} × {groupSize})
                                    </div>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 mb-2">
                                {service.description}
                              </p>

                              <Badge variant="outline" className="text-xs">
                                {service.category}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Cost Summary */}
                      {calculateTotalServicesCost() > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Total Additional Services Cost:
                            </span>
                            <span className="text-lg font-bold text-flydubai-orange">
                              {airlineConfig.currency} {calculateTotalServicesCost()}
                            </span>
                          </div>
                          {groupSize > 1 && (
                            <p className="text-sm text-gray-600 mt-1">
                              For {groupSize} passenger
                              {groupSize > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons for Additional Services */}
                  <div className="flex justify-between gap-3">
                    <Button
                      variant="outline"
                      onClick={handleBackToFlightSelection}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Flight Selection
                    </Button>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSkipAdditionalServices}
                        className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                      >
                        Skip Services & Proceed
                      </Button>
                      <Button
                        className="btn-flydubai-primary"
                        onClick={handleSaveChanges}
                      >
                        <BellRing className="h-4 w-4 mr-2" />
                        Save Changes & Notify Passengers
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Original Flight Selection Flow */
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">
                      {selectedPnrGroup ? "Group Details" : "Passenger Details"}
                    </TabsTrigger>
                    <TabsTrigger value="rebooking">Smart Rebooking</TabsTrigger>
                    <TabsTrigger value="services">Quick Services</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    {selectedPnrGroup ? (
                      // Group Details View
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Group Information - PNR {selectedPnrGroup.pnr}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4">
                              {selectedPnrGroup.passengers.map(
                                (passenger, index) => (
                                  <div
                                    key={passenger.id}
                                    className="p-4 border rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-medium">
                                        Passenger {index + 1}: {passenger.name}
                                      </h4>
                                      <div className="flex gap-2">
                                        <Badge
                                          className={getPriorityColor(
                                            passenger.priority,
                                          )}
                                        >
                                          {passenger.priority}
                                        </Badge>
                                        <Badge
                                          className={getStatusColor(
                                            passenger.status,
                                          )}
                                        >
                                          {passenger.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <label className="font-medium text-gray-600">
                                          Seat:
                                        </label>
                                        <div>{passenger.seat}</div>
                                      </div>
                                      <div>
                                        <label className="font-medium text-gray-600">
                                          Contact:
                                        </label>
                                        <div className="text-xs">
                                          {passenger.contactInfo}
                                        </div>
                                      </div>
                                      {passenger.specialRequirements && (
                                        <div>
                                          <label className="font-medium text-gray-600">
                                            Special Requirements:
                                          </label>
                                          <Badge
                                            variant="outline"
                                            className="ml-2"
                                          >
                                            {passenger.specialRequirements}
                                          </Badge>
                                        </div>
                                      )}
                                      <div>
                                        <label className="font-medium text-gray-600">
                                          Preferences:
                                        </label>
                                        <div className="text-xs">
                                          {
                                            passenger.preferences
                                              ?.seatPreference
                                          }{" "}
                                          seat,{" "}
                                          {
                                            passenger.preferences
                                              ?.mealPreference
                                          }{" "}
                                          meal
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      // Individual Passenger Details View
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Passenger Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium text-gray-600">
                                  Name:
                                </label>
                                <div>{selectedPassenger.name}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  PNR:
                                </label>
                                <div>{selectedPassenger.pnr}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  Priority:
                                </label>
                                <Badge
                                  className={getPriorityColor(
                                    selectedPassenger.priority,
                                  )}
                                >
                                  {selectedPassenger.priority}
                                </Badge>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  Status:
                                </label>
                                <Badge
                                  className={getStatusColor(
                                    selectedPassenger.status,
                                  )}
                                >
                                  {selectedPassenger.status}
                                </Badge>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  Seat:
                                </label>
                                <div>{selectedPassenger.seat}</div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  Contact:
                                </label>
                                <div className="text-xs">
                                  {selectedPassenger.contactInfo}
                                </div>
                              </div>
                            </div>
                            {selectedPassenger.specialRequirements && (
                              <div>
                                <label className="font-medium text-gray-600">
                                  Special Requirements:
                                </label>
                                <Badge variant="outline" className="ml-2">
                                  {selectedPassenger.specialRequirements}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Passenger Preferences
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="font-medium text-gray-600">
                                  Seat Preference:
                                </label>
                                <div>
                                  {selectedPassenger.preferences
                                    ?.seatPreference || "Not specified"}
                                </div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  Meal Preference:
                                </label>
                                <div>
                                  {selectedPassenger.preferences
                                    ?.mealPreference || "Standard"}
                                </div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  Class Preference:
                                </label>
                                <div>
                                  {selectedPassenger.preferences
                                    ?.classPreference || "Economy"}
                                </div>
                              </div>
                              <div>
                                <label className="font-medium text-gray-600">
                                  Loyalty Tier:
                                </label>
                                <Badge variant="outline">
                                  {selectedPassenger.preferences?.loyaltyTier ||
                                    "None"}
                                </Badge>
                              </div>
                            </div>
                            {selectedPassenger.connectedFlights &&
                              selectedPassenger.connectedFlights.length > 0 && (
                                <div>
                                  <label className="font-medium text-gray-600">
                                    Connected Flights:
                                  </label>
                                  <div className="flex gap-2 mt-1">
                                    {selectedPassenger.connectedFlights.map(
                                      (flight, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {flight}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="rebooking" className="space-y-4">
                    <div className="space-y-4">
                      {getAvailableFlights(
                        selectedPnrGroup?.passengers || selectedPassenger,
                      ).map((flight) => (
                        <Card
                          key={flight.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Flight Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-flydubai-blue rounded-lg">
                                    <Plane className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="font-semibold text-lg text-flydubai-navy">
                                        {flight.flightNumber}
                                      </h3>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {flight.airline}
                                      </Badge>
                                      <div className="flex items-center gap-1">
                                        {getScoreIcon(flight.suitabilityScore)}
                                        <span
                                          className={`font-semibold ${getScoreColor(flight.suitabilityScore)}`}
                                        >
                                          {flight.suitabilityScore}% Match
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {flight.route} • {flight.aircraft}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {flight.departure} → {flight.arrival} (
                                      {flight.duration})
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Timer className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">
                                      {flight.onTimePerformance}% On-time
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Group Seat Requirements */}
                              {selectedPnrGroup && (
                                <Alert className="border-blue-200 bg-blue-50">
                                  <Users2 className="h-4 w-4 text-blue-600" />
                                  <AlertDescription className="text-blue-800">
                                    <strong>Group Seating:</strong>{" "}
                                    {selectedPnrGroup.passengers.length}{" "}
                                    passengers need adjacent seats
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Cabin Selection */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  <Star className="h-4 w-4 text-flydubai-blue" />
                                  Select Cabin Class
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {cabinOptions.map((cabinOption) => {
                                    const cabin =
                                      flight.availableSeats[cabinOption.key];
                                    const isSelected =
                                      getSelectedCabin(flight.id) ===
                                      cabinOption.key;
                                    const isAvailable =
                                      isCabinAvailableForGroup(
                                        flight,
                                        cabinOption.key,
                                        groupSize,
                                      );
                                    const Icon = cabinOption.icon;

                                    return (
                                      <div
                                        key={cabinOption.key}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                          isSelected
                                            ? "border-flydubai-blue bg-blue-50"
                                            : isAvailable
                                              ? "border-gray-200 hover:border-flydubai-blue hover:bg-blue-50"
                                              : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                                        }`}
                                        onClick={() =>
                                          isAvailable &&
                                          handleCabinSelection(
                                            flight.id,
                                            cabinOption.key,
                                          )
                                        }
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <Icon
                                              className={`h-5 w-5 ${isSelected ? "text-flydubai-blue" : "text-gray-600"}`}
                                            />
                                            <span
                                              className={`font-medium ${isSelected ? "text-flydubai-blue" : "text-gray-900"}`}
                                            >
                                              {cabinOption.name}
                                            </span>
                                            {isSelected && (
                                              <CircleCheck className="h-4 w-4 text-flydubai-blue" />
                                            )}
                                          </div>
                                          <span className="font-bold text-flydubai-orange">
                                            {cabin.price}
                                          </span>
                                        </div>

                                        <p className="text-xs text-gray-600 mb-3">
                                          {cabinOption.description}
                                        </p>

                                        <div className="flex items-center gap-2 mb-2">
                                          <Progress
                                            value={
                                              (cabin.available / cabin.total) *
                                              100
                                            }
                                            className="flex-1 h-2"
                                          />
                                          <span className="text-xs text-gray-600">
                                            {cabin.available}/{cabin.total}
                                          </span>
                                        </div>

                                        {!isAvailable && selectedPnrGroup && (
                                          <div className="text-xs text-red-600 mt-1">
                                            Insufficient seats for group of{" "}
                                            {groupSize}
                                          </div>
                                        )}

                                        {isAvailable && (
                                          <div className="text-xs text-green-600 mt-1">
                                            ✓ Available for{" "}
                                            {groupSize > 1
                                              ? `group of ${groupSize}`
                                              : "passenger"}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Selection Required Alert */}
                              {!getSelectedCabin(flight.id) && (
                                <Alert className="border-orange-200 bg-orange-50">
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                  <AlertDescription>
                                    Please select a cabin class before
                                    proceeding with flight selection.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Amenities */}
                              <div className="flex flex-wrap gap-2">
                                {flight.amenities.map((amenity, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1 text-xs bg-blue-50 rounded px-2 py-1"
                                  >
                                    {getAmenityIcon(amenity)}
                                    <span>{amenity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Cascade Impact */}
                              {flight.cascadeImpact.hasImpact && (
                                <Alert
                                  className={`border ${getCascadeSeverityColor(flight.cascadeImpact.severity)}`}
                                >
                                  <Route className="h-4 w-4" />
                                  <AlertDescription>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <strong>Connection Impact:</strong>{" "}
                                        {flight.cascadeImpact.description}
                                        <div className="text-xs mt-1">
                                          Affected flights:{" "}
                                          {flight.cascadeImpact.affectedFlights.join(
                                            ", ",
                                          )}
                                        </div>
                                      </div>
                                      <Badge
                                        className={getCascadeSeverityColor(
                                          flight.cascadeImpact.severity,
                                        )}
                                      >
                                        {flight.cascadeImpact.severity.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Smart Recommendations */}
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-flydubai-blue" />
                                  Smart Recommendations
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {flight.recommendations.map((rec, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs"
                                    >
                                      {getRecommendationIcon(rec.type)}
                                      <div className="flex-1">
                                        <div className="font-medium">
                                          {rec.text}
                                        </div>
                                        <div className="text-gray-600">
                                          {rec.action}
                                        </div>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          rec.priority === "high"
                                            ? "border-red-300 text-red-700"
                                            : rec.priority === "medium"
                                              ? "border-yellow-300 text-yellow-700"
                                              : "border-green-300 text-green-700"
                                        }`}
                                      >
                                        {rec.priority}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Select Flight Button */}
                              <div className="flex justify-end">
                                <Button
                                  className={
                                    getSelectedCabin(flight.id)
                                      ? "btn-flydubai-primary"
                                      : ""
                                  }
                                  variant={
                                    getSelectedCabin(flight.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  disabled={!getSelectedCabin(flight.id)}
                                  onClick={() => handleFlightSelection(flight)}
                                >
                                  {getSelectedCabin(flight.id) ? (
                                    <>
                                      <ArrowRight className="h-4 w-4 mr-2" />
                                      Select Flight (
                                      {
                                        cabinOptions.find(
                                          (c) =>
                                            c.key ===
                                            getSelectedCabin(flight.id),
                                        )?.name
                                      }
                                      )
                                    </>
                                  ) : (
                                    "Select Cabin First"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Quick Services{" "}
                          {selectedPnrGroup &&
                            `(Group of ${selectedPnrGroup.passengers.length})`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">
                                Hotel Accommodation
                              </div>
                              <div className="text-sm text-gray-600">
                                {selectedPnrGroup
                                  ? `Overnight stay for ${selectedPnrGroup.passengers.length} passengers`
                                  : "Overnight stay with meals"}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleHotelBooking(
                                  selectedPnrGroup || selectedPassenger,
                                )
                              }
                            >
                              <Hotel className="h-4 w-4 mr-2" />
                              Book Hotel
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">Meal Voucher</div>
                              <div className="text-sm text-gray-600">
                                {selectedPnrGroup
                                  ? `${airlineConfig.currency} ${50 * selectedPnrGroup.passengers.length} total for group`
                                  : airlineConfig.currency +" 50 dining credit"}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleVoucherIssue(
                                  selectedPnrGroup || selectedPassenger,
                                )
                              }
                            >
                              <Utensils className="h-4 w-4 mr-2" />
                              Issue
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">
                                Ground Transportation
                              </div>
                              <div className="text-sm text-gray-600">
                                {selectedPnrGroup
                                  ? `Group transport for ${selectedPnrGroup.passengers.length} passengers`
                                  : "Airport transfer service"}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleTransportArrange(
                                  selectedPnrGroup || selectedPassenger,
                                )
                              }
                            >
                              <Car className="h-4 w-4 mr-2" />
                              Arrange
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              {/* Footer buttons - only show when not in additional services flow */}
              {!showAdditionalServices && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRebookingDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="btn-flydubai-primary">Save Changes</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hotel Booking Dialog */}
      <Dialog open={showHotelDialog} onOpenChange={setShowHotelDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-flydubai-blue" />
              Hotel Booking - {selectedPassenger?.name}
              {selectedPnrGroup &&
                ` (Group of ${selectedPnrGroup.passengers.length})`}
            </DialogTitle>
            <DialogDescription>
              Book hotel accommodation for passenger PNR:{" "}
              {selectedPassenger?.pnr}
            </DialogDescription>
          </DialogHeader>

          {hotelBookingConfirmed ? (
            <div className="space-y-4">
              <div className="text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Hotel reservation has been made for {selectedPassenger?.name}
                  {selectedPnrGroup &&
                    ` and ${selectedPnrGroup.passengers.length - 1} other passenger(s)`}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-medium text-green-800">
                    {selectedHotel?.name}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Confirmation sent to: {selectedPassenger?.contactInfo}
                  </div>
                  <div className="text-sm text-green-700">
                    Booking Reference: HTL-
                    {Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableHotels.map((hotel) => (
                  <Card
                    key={hotel.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-flydubai-navy">
                                {hotel.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {hotel.category} • {hotel.distance}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-flydubai-orange">
                                {hotel.pricePerNight}
                              </div>
                              <div className="text-xs text-gray-500">
                                per night
                              </div>
                              {selectedPnrGroup && (
                                <div className="text-xs text-gray-500">
                                  x{selectedPnrGroup.passengers.length} rooms
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < Math.floor(hotel.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {hotel.rating}
                            </span>
                            <Badge
                              className={
                                hotel.availability === "Available"
                                  ? "status-success"
                                  : "status-warning"
                              }
                            >
                              {hotel.availability}
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-600 mb-3">
                            {hotel.description}
                          </p>

                          <Button
                            size="sm"
                            className="w-full btn-flydubai-primary"
                            onClick={() => confirmHotelBooking(hotel)}
                            disabled={hotel.availability !== "Available"}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meal Voucher Dialog */}
      <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-flydubai-blue" />
              Issue Meal Voucher
            </DialogTitle>
            <DialogDescription>
              Generate meal voucher for {selectedPassenger?.name}
              {selectedPnrGroup &&
                ` and group (${selectedPnrGroup.passengers.length} passengers)`}
            </DialogDescription>
          </DialogHeader>

          {voucherIssued ? (
            <div className="space-y-4">
              <div className="text-center p-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-700 mb-2">
                  {selectedPnrGroup
                    ? "Group Vouchers Issued!"
                    : "Voucher Issued!"}
                </h3>
                <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-600" />
                  <div className="font-mono text-sm text-center">
                    FDV-
                    {Math.random().toString(36).substring(2, 8).toUpperCase()}
                    {selectedPnrGroup &&
                      `+${selectedPnrGroup.passengers.length - 1}`}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Voucher{selectedPnrGroup ? "s" : ""} sent to{" "}
                  {selectedPassenger?.contactInfo}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                  onClick={() => issueVoucher(50, "Standard")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Standard Meal Voucher</div>
                      <div className="text-sm text-gray-600">
                        Valid at airport restaurants
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      {airlineConfig.currency}{" "}
                      {selectedPnrGroup
                        ? 50 * selectedPnrGroup.passengers.length
                        : 50}
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                  onClick={() => issueVoucher(75, "Premium")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Premium Meal Voucher</div>
                      <div className="text-sm text-gray-600">
                        Includes drinks and snacks
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      {airlineConfig.currency}{" "}
                      {selectedPnrGroup
                        ? 75 * selectedPnrGroup.passengers.length
                        : 75}
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                  onClick={() => issueVoucher(100, "VIP")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">VIP Meal Voucher</div>
                      <div className="text-sm text-gray-600">
                        Premium restaurants & lounges
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      {airlineConfig.currency}{" "}
                      {selectedPnrGroup
                        ? 100 * selectedPnrGroup.passengers.length
                        : 100}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ground Transportation Dialog */}
      <Dialog open={showTransportDialog} onOpenChange={setShowTransportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-flydubai-blue" />
              Arrange Transportation
            </DialogTitle>
            <DialogDescription>
              Book ground transport for {selectedPassenger?.name}
              {selectedPnrGroup &&
                ` and group (${selectedPnrGroup.passengers.length} passengers)`}
            </DialogDescription>
          </DialogHeader>

          {transportArranged ? (
            <div className="space-y-4">
              <div className="text-center p-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-700 mb-2">
                  Transport Arranged!
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-medium text-green-800">
                    Booking Reference
                  </div>
                  <div className="font-mono text-sm text-green-700">
                    TXP-
                    {Math.random().toString(36).substring(2, 8).toUpperCase()}
                  </div>
                  <div className="text-sm text-green-700 mt-2">
                    Details sent to: {selectedPassenger?.contactInfo}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                  onClick={() =>
                    arrangeTransport("taxi", "Standard taxi service")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Airport Taxi</div>
                      <div className="text-sm text-gray-600">
                        {selectedPnrGroup
                          ? `Multiple taxis for ${selectedPnrGroup.passengers.length} passengers`
                          : "Standard taxi service"}
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      {airlineConfig.currency}{" "}
                      {selectedPnrGroup
                        ? 80 * Math.ceil(selectedPnrGroup.passengers.length / 4)
                        : 80}
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                  onClick={() =>
                    arrangeTransport("shuttle", "Shared shuttle service")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Hotel Shuttle</div>
                      <div className="text-sm text-gray-600">
                        {selectedPnrGroup
                          ? `Group shuttle service`
                          : "Shared shuttle service"}
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      {airlineConfig.currency}{" "}
                      {selectedPnrGroup
                        ? 40 * selectedPnrGroup.passengers.length
                        : 40}
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                  onClick={() =>
                    arrangeTransport("premium", "Private car with driver")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Premium Car</div>
                      <div className="text-sm text-gray-600">
                        {selectedPnrGroup
                          ? `Premium vehicles for group`
                          : "Private car with driver"}
                      </div>
                    </div>
                    <div className="font-bold text-flydubai-orange">
                      {airlineConfig.currency}{" "}
                      {selectedPnrGroup
                        ? 150 *
                          Math.ceil(selectedPnrGroup.passengers.length / 3)
                        : 150}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Alert Dialog */}
      <CustomAlertDialog
        isOpen={alertState.isOpen}
        onOpenChange={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        showCancel={alertState.showCancel}
      />
    </div>
  );
}
