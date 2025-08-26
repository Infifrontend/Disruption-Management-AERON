"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Plane,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  FileText,
  PlayCircle,
  Settings,
  Target,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Route,
  Timer,
  RefreshCw,
  Car,
  Hotel,
  UserCheck,
  Fuel,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  Play,
  Pause,
  RotateCcw,
  TrendingDown,
  XCircle,
  Info,
  Wrench,
  Wind,
  Navigation,
  Building,
  Star,
  Globe,
  Home,
  Calculator,
  AlertCircle,
  CheckSquare,
  X,
  Plus,
  Minus,
  Search,
  Filter,
} from "lucide-react";

export function DetailedRecoveryPlan({ plan, flight }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [customParameters, setCustomParameters] = useState({});
  const [resourceEditMode, setResourceEditMode] = useState(false);
  const [modifiedResources, setModifiedResources] = useState(null);
  const [violationAnalysis, setViolationAnalysis] = useState(null);
  const [costAnalysis, setCostAnalysis] = useState(null);
  const [resourceSimulationRunning, setResourceSimulationRunning] =
    useState(false);

  // Mock data for resource options
  const availableAircraft = [
    {
      tail: "A6-FDB",
      type: "A320",
      status: "Available",
      location: "Gate A5",
      lastMaintenance: "2025-01-08",
      fuelLevel: "85%",
    },
    {
      tail: "A6-FDC",
      type: "A321",
      status: "Available",
      location: "Hangar 2",
      lastMaintenance: "2025-01-09",
      fuelLevel: "92%",
    },
    {
      tail: "A6-FDD",
      type: "B737-800",
      status: "Available",
      location: "Gate B12",
      lastMaintenance: "2025-01-07",
      fuelLevel: "78%",
    },
    {
      tail: "A6-FDE",
      type: "B737-900",
      status: "In Transit",
      location: "En route from IST",
      lastMaintenance: "2025-01-06",
      fuelLevel: "45%",
    },
    {
      tail: "A6-FDF",
      type: "B737 MAX 8",
      status: "Maintenance",
      location: "Maintenance Bay 1",
      lastMaintenance: "2025-01-05",
      fuelLevel: "15%",
    },
    {
      tail: "A6-FDG",
      type: "A320",
      status: "Available",
      location: "Gate C8",
      lastMaintenance: "2025-01-10",
      fuelLevel: "96%",
    },
  ];

  const availableCrew = [
    {
      id: "CR2401",
      name: "Capt. Ahmed Al-Mansoori",
      role: "Captain",
      status: "Available",
      qualification: "A320/A321",
      dutyHours: "2.5/12",
      location: "Crew Room A",
    },
    {
      id: "CR2402",
      name: "Capt. Sarah Johnson",
      role: "Captain",
      status: "Available",
      qualification: "B737-800/900",
      dutyHours: "0/12",
      location: "Flight Ops",
    },
    {
      id: "CR2403",
      name: "FO Michael Chen",
      role: "First Officer",
      status: "Available",
      qualification: "A320/A321",
      dutyHours: "4.2/12",
      location: "Crew Rest",
    },
    {
      id: "CR2404",
      name: "FO Lisa Thompson",
      role: "First Officer",
      status: "On Duty",
      qualification: "B737 MAX",
      dutyHours: "8.5/12",
      location: "Flight FZ456",
    },
    {
      id: "CR2405",
      name: "Fatima Al-Zahra",
      role: "Senior Cabin Crew",
      status: "Available",
      qualification: "Multi-type",
      dutyHours: "1.8/12",
      location: "Terminal 3",
    },
    {
      id: "CR2406",
      name: "Mohammed Hassan",
      role: "Cabin Crew",
      status: "Available",
      qualification: "Multi-type",
      dutyHours: "3.1/12",
      location: "Crew Lounge",
    },
    {
      id: "CR2407",
      name: "John Williams",
      role: "Cabin Crew",
      status: "Off Duty",
      qualification: "A320/B737",
      dutyHours: "0/12",
      location: "Home Standby",
    },
    {
      id: "CR2408",
      name: "Aisha Mohammed",
      role: "Senior Cabin Crew",
      status: "Available",
      qualification: "Multi-type",
      dutyHours: "2.7/12",
      location: "Training Center",
    },
  ];

  const availableGroundSupport = [
    {
      id: "GS001",
      name: "Baggage Handling Team Alpha",
      type: "Baggage",
      personnel: 4,
      status: "Available",
      location: "Terminal 3",
      equipment: "Baggage Carts (3)",
    },
    {
      id: "GS002",
      name: "Ground Power Unit 5",
      type: "Power",
      personnel: 2,
      status: "Available",
      location: "Gate A12",
      equipment: "GPU-400Hz",
    },
    {
      id: "GS003",
      name: "Aircraft Positioning Crew",
      type: "Positioning",
      personnel: 3,
      status: "Busy",
      location: "Apron B",
      equipment: "Pushback Tug",
    },
    {
      id: "GS004",
      name: "Cargo Loader Team Beta",
      type: "Cargo",
      personnel: 5,
      status: "Available",
      location: "Cargo Terminal",
      equipment: "Hi-Loader (2)",
    },
    {
      id: "GS005",
      name: "Fuel Truck Team",
      type: "Fuel",
      personnel: 2,
      status: "Available",
      location: "Fuel Farm",
      equipment: "Fuel Truck FT-12",
    },
    {
      id: "GS006",
      name: "Catering Service Team",
      type: "Catering",
      personnel: 3,
      status: "Available",
      location: "Catering Facility",
      equipment: "Catering Truck CT-8",
    },
    {
      id: "GS007",
      name: "Maintenance Support",
      type: "Maintenance",
      personnel: 4,
      status: "Available",
      location: "Maintenance Hangar",
      equipment: "Tools & Test Equipment",
    },
  ];

  // Generate dynamic recovery plan data based on the selected option
  const generateRecoveryPlanData = () => {
    if (!plan || !flight) {
      return getDefaultPlanData();
    }

    // Determine plan type from the selected recovery option
    const planType = plan.type || plan.category || "aircraft-swap";
    const disruptionType =
      flight.disruptionCategory || flight.categorization || "aircraft-issue";

    switch (planType) {
      case "aircraft-swap":
      case "aircraft-substitution":
        return getAircraftSwapPlanData(plan, flight, disruptionType);

      case "crew-pairing":
      case "crew-change":
        return getCrewPairingPlanData(plan, flight, disruptionType);

      case "schedule-adjustment":
      case "flight-reschedule":
        return getScheduleAdjustmentPlanData(plan, flight, disruptionType);

      case "passenger-reaccommodation":
        return getPassengerReaccommodationPlanData(
          plan,
          flight,
          disruptionType,
        );

      case "route-optimization":
        return getRouteOptimizationPlanData(plan, flight, disruptionType);

      case "maintenance-recovery":
        return getMaintenanceRecoveryPlanData(plan, flight, disruptionType);

      default:
        return getAircraftSwapPlanData(plan, flight, disruptionType);
    }
  };

  const getAircraftSwapPlanData = (plan, flight, disruptionType) => {
    const aircraftTypes = [
      "A320",
      "A321",
      "B737-800",
      "B737-900",
      "B737 MAX 8",
      "B737 MAX 9",
    ];
    const originalAircraft = flight.aircraftTailNumber || "A6-FDY";
    const replacementAircraft = plan.newAircraft || "A6-FDB";
    const originalType =
      aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
    const replacementType =
      aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];

    return {
      planId: `ARS-${Date.now()}`,
      title: `Aircraft Swap Recovery Plan - ${flight.flightNumber}`,
      type: "Aircraft Swap",
      priority: disruptionType === "aircraft-issue" ? "Critical" : "High",
      status: "Ready for Execution",

      summary: {
        description: `Swap ${originalAircraft} (${originalType}) with ${replacementAircraft} (${replacementType}) for ${flight.flightNumber} ${flight.route}`,
        estimatedDelay: plan.delay || "35 minutes",
        costImpact: plan.cost || "AED 18,500",
        passengerImpact: `${plan.affectedPassengers || 167} passengers affected`,
        probability: plan.successRate || "94.2%",
      },

      timeline: [
        {
          time: "00:00",
          action: "Initiate aircraft swap procedure",
          status: "pending",
          duration: "5 min",
        },
        {
          time: "00:05",
          action: `Position ${replacementAircraft} at Gate ${flight.gate || "A12"}`,
          status: "pending",
          duration: "15 min",
        },
        {
          time: "00:20",
          action: "Transfer baggage and cargo",
          status: "pending",
          duration: "20 min",
        },
        {
          time: "00:40",
          action: "Crew briefing and aircraft inspection",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "00:50",
          action: "Passenger boarding announcement",
          status: "pending",
          duration: "5 min",
        },
        {
          time: "00:55",
          action: "Resume normal boarding process",
          status: "pending",
          duration: "25 min",
        },
        {
          time: "01:20",
          action: "Complete boarding and pushback",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "01:30",
          action: "Departure",
          status: "pending",
          duration: "0 min",
        },
      ],

      resources: {
        aircraft: {
          original: {
            tail: originalAircraft,
            type: originalType,
            status: "AOG - Technical Issue",
          },
          replacement: {
            tail: replacementAircraft,
            type: replacementType,
            status: "Available",
            location: "Maintenance Hangar 2",
          },
        },
        crew: {
          required: [
            {
              role: "Captain",
              id: "CR2401",
              name: "Capt. Ahmed Al-Mansoori",
              status: "Available",
              qualification: `${replacementType} Certified`,
            },
            {
              role: "First Officer",
              id: "CR2403",
              name: "FO Sarah Johnson",
              status: "Available",
              qualification: `${replacementType} Certified`,
            },
            {
              role: "Senior Cabin Crew",
              id: "CR2405",
              name: "Fatima Al-Zahra",
              status: "Available",
              qualification: "Multi-type",
            },
            {
              role: "Cabin Crew",
              id: "CR2406",
              name: "Mohammed Hassan",
              status: "Available",
              qualification: "Multi-type",
            },
          ],
        },
        groundSupport: [
          {
            id: "GS001",
            name: "Baggage Transfer Team",
            type: "Baggage",
            personnel: 4,
          },
          {
            id: "GS003",
            name: "Aircraft Positioning Crew",
            type: "Positioning",
            personnel: 2,
          },
          {
            id: "GS002",
            name: "Ground Power Unit",
            type: "Power",
            personnel: 1,
          },
          {
            id: "GS006",
            name: "Passenger Boarding Bridge",
            type: "Boarding",
            personnel: 1,
          },
          {
            id: "GS004",
            name: "Cargo Loader Equipment",
            type: "Cargo",
            personnel: 3,
          },
        ],
      },

      costs: {
        aircraftSwap: "AED 12,000",
        groundHandling: "AED 3,500",
        passengerCompensation: "AED 2,800",
        fuelAdjustment: "AED 200",
        total: "AED 18,500",
      },

      risks: [
        {
          level: "Medium",
          description: "Further technical issues with replacement aircraft",
          mitigation: "Pre-flight inspection protocol",
          probability: "15%",
        },
        {
          level: "Low",
          description: "Crew duty time limitations",
          mitigation: "Backup crew on standby",
          probability: "8%",
        },
        {
          level: "Medium",
          description: "Baggage transfer delays",
          mitigation: "Additional ground crew allocation",
          probability: "20%",
        },
        {
          level: "Low",
          description: "Passenger dissatisfaction",
          mitigation: "Proactive communication and compensation",
          probability: "12%",
        },
      ],

      kpis: {
        onTimePerformance: "87.3%",
        customerSatisfaction: "91.2%",
        costEfficiency: "94.8%",
        operationalImpact: "Minimal",
      },

      chainReactions: [
        {
          flight: "FZ789",
          impact: "Delayed departure by 15 minutes",
          severity: "Low",
        },
        {
          flight: "FZ234",
          impact: "Aircraft unavailable for next rotation",
          severity: "Medium",
        },
        {
          flight: "FZ567",
          impact: "Crew duty time adjustment required",
          severity: "Low",
        },
      ],
    };
  };

  const getCrewPairingPlanData = (plan, flight, disruptionType) => {
    return {
      planId: `CRP-${Date.now()}`,
      title: `Crew Pairing Recovery Plan - ${flight.flightNumber}`,
      type: "Crew Pairing",
      priority: disruptionType === "crew-issue" ? "Critical" : "High",
      status: "Ready for Execution",

      summary: {
        description: `Assign backup crew for ${flight.flightNumber} ${flight.route} due to ${disruptionType === "crew-issue" ? "crew sick report" : "crew unavailability"}`,
        estimatedDelay: plan.delay || "25 minutes",
        costImpact: plan.cost || "AED 8,200",
        passengerImpact: `${plan.affectedPassengers || 167} passengers affected`,
        probability: plan.successRate || "97.1%",
      },

      timeline: [
        {
          time: "00:00",
          action: "Initiate crew replacement procedure",
          status: "pending",
          duration: "3 min",
        },
        {
          time: "00:03",
          action: "Contact backup crew members",
          status: "pending",
          duration: "7 min",
        },
        {
          time: "00:10",
          action: "Crew transportation to airport",
          status: "pending",
          duration: "20 min",
        },
        {
          time: "00:30",
          action: "Crew briefing and documentation",
          status: "pending",
          duration: "15 min",
        },
        {
          time: "00:45",
          action: "Aircraft preparation and inspection",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "00:55",
          action: "Passenger boarding process",
          status: "pending",
          duration: "25 min",
        },
        {
          time: "01:20",
          action: "Final checks and pushback",
          status: "pending",
          duration: "5 min",
        },
        {
          time: "01:25",
          action: "Departure",
          status: "pending",
          duration: "0 min",
        },
      ],

      resources: {
        aircraft: {
          assigned: {
            tail: "A6-FDX",
            type: "A320",
            status: "Ready",
            location: "Gate A12",
          },
        },
        crew: {
          original: [
            {
              role: "Captain",
              id: "CR2301",
              name: "Capt. Omar Al-Rashid",
              status: "Sick Report",
            },
            {
              role: "First Officer",
              id: "CR2302",
              name: "FO Lisa Thompson",
              status: "Available",
            },
            {
              role: "Senior Cabin Crew",
              id: "CR2303",
              name: "Aisha Mohammed",
              status: "Duty Time Exceeded",
            },
            {
              role: "Cabin Crew",
              id: "CR2304",
              name: "John Williams",
              status: "Available",
            },
          ],
          replacement: [
            {
              role: "Captain",
              id: "CR2401",
              name: "Capt. Ahmed Al-Mansoori",
              status: "On Standby",
              eta: "25 minutes",
            },
            {
              role: "Senior Cabin Crew",
              id: "CR2405",
              name: "Fatima Al-Zahra",
              status: "On Standby",
              eta: "20 minutes",
            },
          ],
        },
        groundSupport: [
          {
            id: "GS001",
            name: "Standard Ground Services",
            type: "Standard",
            personnel: 6,
          },
          {
            id: "GS002",
            name: "Crew Transportation",
            type: "Transport",
            personnel: 2,
          },
        ],
      },

      costs: {
        backupCrewCallout: "AED 4,500",
        transportation: "AED 800",
        additionalAllowances: "AED 2,200",
        operationalOverhead: "AED 700",
        total: "AED 8,200",
      },

      risks: [
        {
          level: "Low",
          description: "Backup crew unavailability",
          mitigation: "Secondary backup crew identified",
          probability: "5%",
        },
        {
          level: "Medium",
          description: "Transportation delays in traffic",
          mitigation: "Police escort if required",
          probability: "18%",
        },
        {
          level: "Low",
          description: "Extended briefing time required",
          mitigation: "Pre-briefing materials provided",
          probability: "10%",
        },
        {
          level: "Low",
          description: "Passenger complaints about delay",
          mitigation: "Proactive communication",
          probability: "15%",
        },
      ],

      kpis: {
        crewAvailability: "98.2%",
        responseTime: "23 minutes",
        regulatoryCompliance: "100%",
        operationalImpact: "Low",
      },

      chainReactions: [
        {
          flight: "FZ456",
          impact: "Backup crew unavailable for next assignment",
          severity: "Low",
        },
        {
          flight: "FZ890",
          impact: "Crew rest period adjustment required",
          severity: "Low",
        },
      ],
    };
  };

  const getScheduleAdjustmentPlanData = (plan, flight, disruptionType) => {
    return {
      planId: `SAP-${Date.now()}`,
      title: `Schedule Adjustment Recovery Plan - ${flight.flightNumber}`,
      type: "Schedule Adjustment",
      priority: disruptionType === "weather" ? "High" : "Medium",
      status: "Ready for Execution",

      summary: {
        description: `Reschedule ${flight.flightNumber} ${flight.route} due to ${disruptionType === "weather" ? "adverse weather conditions" : "operational constraints"}`,
        estimatedDelay: plan.delay || "90 minutes",
        costImpact: plan.cost || "AED 24,700",
        passengerImpact: `${plan.affectedPassengers || 167} passengers affected`,
        probability: plan.successRate || "92.8%",
      },

      timeline: [
        {
          time: "00:00",
          action: "Issue flight delay announcement",
          status: "pending",
          duration: "5 min",
        },
        {
          time: "00:05",
          action: "Reschedule departure slot with ATC",
          status: "pending",
          duration: "20 min",
        },
        {
          time: "00:25",
          action: "Update passenger notifications",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "00:35",
          action: "Coordinate ground services adjustment",
          status: "pending",
          duration: "15 min",
        },
        {
          time: "00:50",
          action: "Manage passenger services in terminal",
          status: "pending",
          duration: "60 min",
        },
        {
          time: "01:50",
          action: "Begin boarding process",
          status: "pending",
          duration: "25 min",
        },
        {
          time: "02:15",
          action: "Complete boarding and pushback",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "02:25",
          action: "Departure",
          status: "pending",
          duration: "0 min",
        },
      ],

      resources: {
        aircraft: {
          assigned: {
            tail: "A6-FDZ",
            type: "B737-800",
            status: "Ready",
            location: "Gate B5",
          },
        },
        crew: {
          assigned: [
            {
              role: "Captain",
              id: "CR2402",
              name: "Capt. Sarah Johnson",
              status: "Available",
            },
            {
              role: "First Officer",
              id: "CR2403",
              name: "FO Michael Chen",
              status: "Available",
            },
            {
              role: "Senior Cabin Crew",
              id: "CR2405",
              name: "Fatima Al-Zahra",
              status: "Available",
            },
            {
              role: "Cabin Crew",
              id: "CR2406",
              name: "Mohammed Hassan",
              status: "Available",
            },
          ],
        },
        groundSupport: [
          {
            id: "GS001",
            name: "Customer Service Team",
            type: "Passenger Services",
            personnel: 6,
          },
          {
            id: "GS006",
            name: "Catering Adjustment",
            type: "Catering",
            personnel: 3,
          },
          {
            id: "GS002",
            name: "Ground Handling Standard",
            type: "Ground Handling",
            personnel: 4,
          },
        ],
      },

      costs: {
        passengerCompensation: "AED 15,000",
        mealVouchers: "AED 4,500",
        additionalGroundTime: "AED 3,200",
        operationalOverhead: "AED 2,000",
        total: "AED 24,700",
      },

      risks: [
        {
          level: "Medium",
          description: "Weather conditions may worsen",
          mitigation: "Continuous monitoring and backup plans",
          probability: "25%",
        },
        {
          level: "Medium",
          description: "ATC slot not available",
          mitigation: "Alternative routing prepared",
          probability: "20%",
        },
        {
          level: "High",
          description: "Passenger misconnections",
          mitigation: "Rebooking and accommodation arrangements",
          probability: "35%",
        },
        {
          level: "Low",
          description: "Crew duty time limitations",
          mitigation: "Backup crew on standby",
          probability: "12%",
        },
      ],

      kpis: {
        passengerRebooking: "96.4%",
        onTimeRecovery: "89.1%",
        customerSatisfaction: "88.7%",
        operationalImpact: "Medium",
      },

      chainReactions: [
        {
          flight: "FZ345",
          impact: "Gate assignment conflict resolved",
          severity: "Low",
        },
        {
          flight: "FZ678",
          impact: "Connecting passengers missed flights",
          severity: "High",
        },
        {
          flight: "FZ901",
          impact: "Aircraft late for next rotation",
          severity: "Medium",
        },
      ],
    };
  };

  const getPassengerReaccommodationPlanData = (
    plan,
    flight,
    disruptionType,
  ) => {
    return {
      planId: `PRP-${Date.now()}`,
      title: `Passenger Reaccommodation Plan - ${flight.flightNumber}`,
      type: "Passenger Reaccommodation",
      priority: "High",
      status: "Ready for Execution",

      summary: {
        description: `Reaccommodate passengers from ${flight.flightNumber} ${flight.route} on alternative flights due to ${disruptionType}`,
        estimatedDelay: "Various (2-8 hours)",
        costImpact: plan.cost || "AED 45,300",
        passengerImpact: `${plan.affectedPassengers || 167} passengers to be reaccommodated`,
        probability: plan.successRate || "89.5%",
      },

      timeline: [
        {
          time: "00:00",
          action: "Initialize passenger reaccommodation system",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "00:10",
          action: "Identify available alternative flights",
          status: "pending",
          duration: "15 min",
        },
        {
          time: "00:25",
          action: "Begin passenger rebooking process",
          status: "pending",
          duration: "45 min",
        },
        {
          time: "01:10",
          action: "Issue meal vouchers and compensation",
          status: "pending",
          duration: "20 min",
        },
        {
          time: "01:30",
          action: "Arrange ground transportation",
          status: "pending",
          duration: "30 min",
        },
        {
          time: "02:00",
          action: "Hotel accommodation for overnight passengers",
          status: "pending",
          duration: "40 min",
        },
        {
          time: "02:40",
          action: "Final passenger notifications",
          status: "pending",
          duration: "15 min",
        },
        {
          time: "02:55",
          action: "Process completion",
          status: "pending",
          duration: "5 min",
        },
      ],

      resources: {
        aircraft: {
          alternatives: [
            {
              tail: "A6-FDA",
              type: "A320",
              flight: "FZ234",
              route: "DXB-BOM",
              departure: "16:45",
              seats: 42,
            },
            {
              tail: "A6-FDB",
              type: "A321",
              flight: "FZ567",
              route: "DXB-BOM",
              departure: "19:30",
              seats: 38,
            },
          ],
        },
        crew: {
          customerService: [
            {
              role: "Customer Service Manager",
              id: "CS001",
              name: "Sarah Al-Mahmoud",
              status: "Available",
            },
            {
              role: "Rebooking Agents",
              id: "CS002-009",
              name: "8 Agents",
              status: "Deployed",
            },
          ],
        },
        groundSupport: [
          {
            id: "GS001",
            name: "Customer Service Counter",
            type: "Passenger Services",
            personnel: 12,
          },
          {
            id: "GS007",
            name: "Accommodation Coordination",
            type: "Hotel Services",
            personnel: 4,
          },
          {
            id: "GS008",
            name: "Transportation Services",
            type: "Transport",
            personnel: 6,
          },
        ],
      },

      costs: {
        alternativeFlightSeats: "AED 28,500",
        hotelAccommodation: "AED 8,900",
        mealCompensation: "AED 5,100",
        transportation: "AED 2,800",
        total: "AED 45,300",
      },

      risks: [
        {
          level: "High",
          description: "Insufficient seats on alternative flights",
          mitigation: "Partner airline coordination",
          probability: "40%",
        },
        {
          level: "Medium",
          description: "Hotel availability constraints",
          mitigation: "Multiple hotel partnerships",
          probability: "22%",
        },
        {
          level: "Medium",
          description: "Passenger dissatisfaction",
          mitigation: "Enhanced compensation packages",
          probability: "30%",
        },
        {
          level: "Low",
          description: "System booking failures",
          mitigation: "Manual processing backup",
          probability: "8%",
        },
      ],

      kpis: {
        rebookingSuccess: "94.8%",
        passengerSatisfaction: "87.3%",
        processingTime: "2.5 hours average",
        operationalImpact: "High",
      },

      chainReactions: [
        {
          flight: "FZ234",
          impact: "Reduced available inventory",
          severity: "Medium",
        },
        {
          flight: "FZ567",
          impact: "Overbooked situation possible",
          severity: "Medium",
        },
        {
          flight: "FZ890",
          impact: "Last-minute capacity changes",
          severity: "Low",
        },
      ],
    };
  };

  const getRouteOptimizationPlanData = (plan, flight, disruptionType) => {
    return {
      planId: `ROP-${Date.now()}`,
      title: `Route Optimization Recovery Plan - ${flight.flightNumber}`,
      type: "Route Optimization",
      priority: "Medium",
      status: "Ready for Execution",

      summary: {
        description: `Optimize flight path for ${flight.flightNumber} ${flight.route} to minimize delay impact due to ${disruptionType}`,
        estimatedDelay: plan.delay || "15 minutes",
        costImpact: plan.cost || "AED 3,800",
        passengerImpact: `${plan.affectedPassengers || 167} passengers minimal impact`,
        probability: plan.successRate || "96.7%",
      },

      timeline: [
        {
          time: "00:00",
          action: "Analyze current weather and airspace",
          status: "pending",
          duration: "5 min",
        },
        {
          time: "00:05",
          action: "Calculate alternative routing options",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "00:15",
          action: "Request ATC clearance for new route",
          status: "pending",
          duration: "8 min",
        },
        {
          time: "00:23",
          action: "Update flight plan and fuel calculations",
          status: "pending",
          duration: "7 min",
        },
        {
          time: "00:30",
          action: "Brief crew on route changes",
          status: "pending",
          duration: "5 min",
        },
        {
          time: "00:35",
          action: "Update passenger arrival information",
          status: "pending",
          duration: "3 min",
        },
        {
          time: "00:38",
          action: "Execute optimized departure",
          status: "pending",
          duration: "2 min",
        },
        {
          time: "00:40",
          action: "Monitor progress and adjust",
          status: "pending",
          duration: "ongoing",
        },
      ],

      resources: {
        aircraft: {
          assigned: {
            tail: "A6-FDW",
            type: "A321",
            status: "Ready",
            location: "Gate A15",
          },
        },
        crew: {
          assigned: [
            {
              role: "Captain",
              id: "CR2401",
              name: "Capt. Ahmed Al-Mansoori",
              status: "Available",
            },
            {
              role: "First Officer",
              id: "CR2403",
              name: "FO Michael Chen",
              status: "Available",
            },
            {
              role: "Senior Cabin Crew",
              id: "CR2405",
              name: "Fatima Al-Zahra",
              status: "Available",
            },
            {
              role: "Cabin Crew",
              id: "CR2406",
              name: "Mohammed Hassan",
              status: "Available",
            },
          ],
        },
        groundSupport: [
          {
            id: "GS002",
            name: "Flight Dispatch",
            type: "Operations",
            personnel: 2,
          },
          { id: "GS005", name: "Fuel Planning", type: "Fuel", personnel: 1 },
          { id: "GS009", name: "ATC Coordination", type: "ATC", personnel: 1 },
        ],
      },

      costs: {
        additionalFuel: "AED 2,400",
        atcCoordination: "AED 600",
        flightPlanAmendment: "AED 300",
        operationalOverhead: "AED 500",
        total: "AED 3,800",
      },

      risks: [
        {
          level: "Low",
          description: "ATC clearance denial",
          mitigation: "Multiple route alternatives prepared",
          probability: "12%",
        },
        {
          level: "Low",
          description: "Weather changes en route",
          mitigation: "Continuous monitoring and adjustment",
          probability: "15%",
        },
        {
          level: "Very Low",
          description: "Fuel calculation errors",
          mitigation: "Triple-check fuel planning",
          probability: "3%",
        },
        {
          level: "Low",
          description: "Crew workload increase",
          mitigation: "Enhanced briefing and support",
          probability: "8%",
        },
      ],

      kpis: {
        fuelEfficiency: "97.2%",
        timeOptimization: "89.4%",
        routeSuccess: "98.8%",
        operationalImpact: "Minimal",
      },

      chainReactions: [
        {
          flight: "FZ123",
          impact: "Improved arrival time reliability",
          severity: "Positive",
        },
        {
          flight: "FZ456",
          impact: "ATC slot optimization available",
          severity: "Positive",
        },
      ],
    };
  };

  const getMaintenanceRecoveryPlanData = (plan, flight, disruptionType) => {
    return {
      planId: `MRP-${Date.now()}`,
      title: `Maintenance Recovery Plan - ${flight.flightNumber}`,
      type: "Maintenance Recovery",
      priority: "Critical",
      status: "Ready for Execution",

      summary: {
        description: `Execute maintenance recovery for ${flight.flightNumber} ${flight.route} following ${disruptionType}`,
        estimatedDelay: plan.delay || "120 minutes",
        costImpact: plan.cost || "AED 35,200",
        passengerImpact: `${plan.affectedPassengers || 167} passengers affected`,
        probability: plan.successRate || "91.3%",
      },

      timeline: [
        {
          time: "00:00",
          action: "Assess maintenance requirements",
          status: "pending",
          duration: "15 min",
        },
        {
          time: "00:15",
          action: "Mobilize maintenance team and equipment",
          status: "pending",
          duration: "20 min",
        },
        {
          time: "00:35",
          action: "Execute maintenance procedures",
          status: "pending",
          duration: "60 min",
        },
        {
          time: "01:35",
          action: "Conduct post-maintenance inspection",
          status: "pending",
          duration: "15 min",
        },
        {
          time: "01:50",
          action: "Update aircraft documentation",
          status: "pending",
          duration: "10 min",
        },
        {
          time: "02:00",
          action: "Release aircraft to operations",
          status: "pending",
          duration: "5 min",
        },
        {
          time: "02:05",
          action: "Resume passenger boarding",
          status: "pending",
          duration: "25 min",
        },
        {
          time: "02:30",
          action: "Departure",
          status: "pending",
          duration: "0 min",
        },
      ],

      resources: {
        aircraft: {
          affected: {
            tail: "A6-FDV",
            type: "B737-800",
            status: "Maintenance Required",
            issue: "Hydraulic system pressure warning",
          },
        },
        crew: {
          maintenance: [
            {
              role: "Licensed Aircraft Engineer",
              id: "MT001",
              name: "Ahmad Khalil",
              status: "Available",
            },
            {
              role: "Hydraulic Specialist",
              id: "MT002",
              name: "James Rodriguez",
              status: "Available",
            },
            {
              role: "QA Inspector",
              id: "MT003",
              name: "Priya Sharma",
              status: "Available",
            },
          ],
          flight: [
            {
              role: "Captain",
              id: "CR2402",
              name: "Capt. Sarah Johnson",
              status: "Standing By",
            },
            {
              role: "First Officer",
              id: "CR2403",
              name: "FO Michael Chen",
              status: "Standing By",
            },
          ],
        },
        groundSupport: [
          {
            id: "GS007",
            name: "Maintenance Team Alpha",
            type: "Maintenance",
            personnel: 5,
          },
          {
            id: "GS010",
            name: "Hydraulic Test Equipment",
            type: "Equipment",
            personnel: 2,
          },
          {
            id: "GS011",
            name: "Spare Parts Logistics",
            type: "Logistics",
            personnel: 2,
          },
        ],
      },

      costs: {
        maintenanceLabor: "AED 18,000",
        spareParts: "AED 12,500",
        passengerCompensation: "AED 3,200",
        operationalDelay: "AED 1,500",
        total: "AED 35,200",
      },

      risks: [
        {
          level: "Medium",
          description: "Additional defects discovered",
          mitigation: "Comprehensive inspection protocol",
          probability: "25%",
        },
        {
          level: "High",
          description: "Spare parts unavailability",
          mitigation: "Spare parts inventory management",
          probability: "15%",
        },
        {
          level: "Medium",
          description: "Extended maintenance time",
          mitigation: "Experienced team allocation",
          probability: "30%",
        },
        {
          level: "Low",
          description: "Regulatory approval delays",
          mitigation: "Pre-coordination with authorities",
          probability: "10%",
        },
      ],

      kpis: {
        maintenanceEfficiency: "94.1%",
        firstTimeQuality: "96.8%",
        safetyCompliance: "100%",
        operationalImpact: "High",
      },

      chainReactions: [
        {
          flight: "FZ789",
          impact: "Aircraft unavailable for next rotation",
          severity: "High",
        },
        {
          flight: "FZ234",
          impact: "Maintenance team occupied",
          severity: "Medium",
        },
        {
          flight: "FZ567",
          impact: "Spare parts inventory impact",
          severity: "Low",
        },
      ],
    };
  };

  const getDefaultPlanData = () => {
    return {
      planId: "DEFAULT-001",
      title: "Default Recovery Plan",
      type: "General Recovery",
      priority: "Medium",
      status: "Template",

      summary: {
        description: "Please select a recovery option to view detailed plan",
        estimatedDelay: "N/A",
        costImpact: "N/A",
        passengerImpact: "N/A",
        probability: "N/A",
      },

      timeline: [],
      resources: {},
      costs: {},
      risks: [],
      kpis: {},
      chainReactions: [],
    };
  };

  const [planData, setPlanData] = useState(generateRecoveryPlanData());
  const [currentTime] = useState(
    new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    }),
  );

  useEffect(() => {
    const newPlanData = generateRecoveryPlanData();
    setPlanData(newPlanData);
    setModifiedResources(newPlanData.resources);
  }, [plan, flight]);

  // Resource modification handlers
  const handleResourceChange = (category, field, value) => {
    setModifiedResources((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleCrewChange = (index, crewId) => {
    const selectedCrew = availableCrew.find((c) => c.id === crewId);
    if (selectedCrew) {
      setModifiedResources((prev) => {
        const updatedCrew = [
          ...(prev.crew?.required || prev.crew?.assigned || []),
        ];
        updatedCrew[index] = {
          ...updatedCrew[index],
          id: selectedCrew.id,
          name: selectedCrew.name,
          status: selectedCrew.status,
          qualification: selectedCrew.qualification,
        };
        return {
          ...prev,
          crew: {
            ...prev.crew,
            required: updatedCrew,
            assigned: updatedCrew,
          },
        };
      });
    }
  };

  const handleGroundSupportChange = (index, supportId) => {
    const selectedSupport = availableGroundSupport.find(
      (gs) => gs.id === supportId,
    );
    if (selectedSupport) {
      setModifiedResources((prev) => {
        const updatedSupport = [...(prev.groundSupport || [])];
        updatedSupport[index] = selectedSupport;
        return {
          ...prev,
          groundSupport: updatedSupport,
        };
      });
    }
  };

  const addGroundSupport = () => {
    setModifiedResources((prev) => ({
      ...prev,
      groundSupport: [
        ...(prev.groundSupport || []),
        availableGroundSupport[0], // Add first available as default
      ],
    }));
  };

  const removeGroundSupport = (index) => {
    setModifiedResources((prev) => {
      const updatedSupport = [...(prev.groundSupport || [])];
      updatedSupport.splice(index, 1);
      return {
        ...prev,
        groundSupport: updatedSupport,
      };
    });
  };

  // Run what-if simulation
  const runResourceSimulation = () => {
    setResourceSimulationRunning(true);

    setTimeout(() => {
      const violations = analyzeViolations();
      const costs = calculateCostImpact();

      setViolationAnalysis(violations);
      setCostAnalysis(costs);
      setResourceSimulationRunning(false);
    }, 2500);
  };

  const analyzeViolations = () => {
    const violations = [];

    // Aircraft violations
    if (modifiedResources?.aircraft?.replacement) {
      const aircraft = availableAircraft.find(
        (a) => a.tail === modifiedResources.aircraft.replacement.tail,
      );
      if (aircraft) {
        if (aircraft.status !== "Available") {
          violations.push({
            type: "Aircraft Availability",
            severity: "Critical",
            description: `Aircraft ${aircraft.tail} is ${aircraft.status}`,
            impact: "Flight cannot operate as planned",
            solution: "Select different aircraft or resolve availability issue",
          });
        }
        if (parseInt(aircraft.fuelLevel) < 70) {
          violations.push({
            type: "Fuel Level",
            severity: "Medium",
            description: `Aircraft ${aircraft.tail} has low fuel level (${aircraft.fuelLevel})`,
            impact: "Additional fuel loading time required (+15 minutes)",
            solution: "Coordinate fuel truck or select different aircraft",
          });
        }
      }
    }

    // Crew violations
    const crew =
      modifiedResources?.crew?.required ||
      modifiedResources?.crew?.assigned ||
      [];
    crew.forEach((member, index) => {
      const crewDetails = availableCrew.find((c) => c.id === member.id);
      if (crewDetails) {
        const dutyHours = parseFloat(crewDetails.dutyHours.split("/")[0]);
        if (dutyHours > 10) {
          violations.push({
            type: "Crew Duty Time",
            severity: "High",
            description: `${crewDetails.name} has ${dutyHours} duty hours`,
            impact: "Potential duty time violation",
            solution: "Select crew member with lower duty hours",
          });
        }
        if (crewDetails.status !== "Available") {
          violations.push({
            type: "Crew Availability",
            severity: "Critical",
            description: `${crewDetails.name} is ${crewDetails.status}`,
            impact: "Crew member not available for assignment",
            solution: "Select available crew member",
          });
        }
      }
    });

    // Ground support violations
    const groundSupport = modifiedResources?.groundSupport || [];
    const requiredTypes = ["Baggage", "Power", "Positioning"];
    requiredTypes.forEach((type) => {
      const hasType = groundSupport.some((gs) => gs.type === type);
      if (!hasType) {
        violations.push({
          type: "Ground Support",
          severity: "Medium",
          description: `Missing required ground support: ${type}`,
          impact: "Operational delays possible",
          solution: `Add ${type} ground support team`,
        });
      }
    });

    // Resource conflict detection
    const busyResources = groundSupport.filter((gs) => {
      const details = availableGroundSupport.find((ags) => ags.id === gs.id);
      return details?.status === "Busy";
    });

    busyResources.forEach((resource) => {
      violations.push({
        type: "Resource Conflict",
        severity: "High",
        description: `${resource.name} is currently busy`,
        impact: "Cannot fulfill assignment, delays expected",
        solution: "Select alternative ground support or wait for availability",
      });
    });

    return violations;
  };

  const calculateCostImpact = () => {
    const baseCosts = parseFloat(
      (planData.costs as any)?.total?.replace(/[^\d.-]/g, "") || "0",
    );
    let additionalCosts = 0;
    let savings = 0;

    // Aircraft cost impact
    if (modifiedResources?.aircraft?.replacement) {
      const aircraft: any = availableAircraft.find(
        (a) => a.tail === modifiedResources.aircraft.replacement.tail,
      );
      if (aircraft) {
        if (parseInt(aircraft.fuelLevel) < 70) {
          additionalCosts += 1200; // Additional fuel costs
        }
        if (aircraft.status === "In Transit") {
          additionalCosts += 3500; // Ferry flight costs
        }
      }
    }

    // Crew cost impact
    const crew =
      modifiedResources?.crew?.required ||
      modifiedResources?.crew?.assigned ||
      [];
    crew.forEach((member) => {
      const crewDetails = availableCrew.find((c) => c.id === member.id);
      if (crewDetails?.status === "Off Duty") {
        additionalCosts += 800; // Callout costs
      }
    });

    // Ground support cost impact
    const groundSupport = modifiedResources?.groundSupport || [];
    const totalPersonnel = groundSupport.reduce(
      (sum, gs) => sum + (gs.personnel || 0),
      0,
    );
    const originalPersonnel = 15; // Baseline
    if (totalPersonnel > originalPersonnel) {
      additionalCosts += (totalPersonnel - originalPersonnel) * 150;
    } else if (totalPersonnel < originalPersonnel) {
      savings += (originalPersonnel - totalPersonnel) * 150;
    }

    const totalCost = baseCosts + additionalCosts - savings;
    const variance = totalCost - baseCosts;
    const aircraft: any = availableAircraft.find(
      (a) => a.tail === modifiedResources.aircraft.replacement.tail,
    );
    return {
      baseCost: baseCosts,
      additionalCosts,
      savings,
      totalCost,
      variance,
      breakdown: {
        aircraft:
          aircraft?.status === "In Transit"
            ? 3500
            : parseInt(aircraft?.fuelLevel || "100") < 70
              ? 1200
              : 0,
        crew:
          crew.filter(
            (m) =>
              availableCrew.find((c) => c.id === m.id)?.status === "Off Duty",
          ).length * 800,
        groundSupport: Math.abs(totalPersonnel - originalPersonnel) * 150,
      },
    };
  };

  const runSimulation = () => {
    setSimulationRunning(true);

    // Simulate analysis time
    setTimeout(() => {
      const simulationData = {
        chainReactionsDetected: Math.floor(Math.random() * 5) + 2,
        riskFactors: Math.floor(Math.random() * 3) + 1,
        recommendedActions: [
          "Monitor connecting flights for potential delays",
          "Prepare backup crew for subsequent rotations",
          "Alert passenger services for potential complaints",
        ],
        optimizationSuggestions: [
          "Consider earlier gate positioning to reduce delay",
          "Implement proactive passenger communication",
          "Coordinate with ground handling for expedited service",
        ],
      };

      setSimulationResults(simulationData);
      setSimulationRunning(false);
    }, 3000);
  };

  const handleParameterChange = (parameter, value) => {
    setCustomParameters((prev) => ({
      ...prev,
      [parameter]: value,
    }));
  };

  if (!planData) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please select a recovery option from the Recovery Options screen to
            view the detailed plan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Plan Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">
            {planData.title}
          </h2>
          <p className="text-muted-foreground">
            {planData.type} • {planData.status} • {planData.planId}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            className={`${
              planData.priority === "Critical"
                ? "bg-red-100 text-red-700 border-red-200"
                : planData.priority === "High"
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
            }`}
          >
            {planData.priority} Priority
          </Badge>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEditMode(!editMode)}
              className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
            >
              {editMode ? (
                <Save className="h-4 w-4 mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              {editMode ? "Save Changes" : "Edit Plan"}
            </Button>

            <Button
              onClick={runSimulation}
              disabled={simulationRunning}
              className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
            >
              {simulationRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {simulationRunning ? "Running Simulation..." : "Run Simulation"}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-flydubai-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Delay</p>
                <p className="font-semibold">
                  {planData.summary.estimatedDelay}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-flydubai-orange" />
              <div>
                <p className="text-sm text-muted-foreground">Cost Impact</p>
                <p className="font-semibold">
                  {costAnalysis
                    ? `AED ${costAnalysis.totalCost.toLocaleString()}`
                    : planData.summary.costImpact}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-flydubai-navy" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Passenger Impact
                </p>
                <p className="font-semibold">
                  {planData.summary.passengerImpact}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Success Probability
                </p>
                <p className="font-semibold">{planData.summary.probability}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="costs">Costs & Impact</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-flydubai-blue" />
                  Plan Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {planData.summary.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Plan Type:</span>
                    <Badge variant="outline">{planData.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className="bg-green-100 text-green-700">
                      {planData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Plan ID:</span>
                    <span className="text-sm font-mono">{planData.planId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-flydubai-orange" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(planData.kpis).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                      <Progress
                        value={parseFloat(value) || Math.random() * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {planData.chainReactions && planData.chainReactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-flydubai-navy" />
                  Chain Reaction Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {planData.chainReactions.map((reaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="bg-flydubai-blue text-white">
                          {reaction.flight}
                        </Badge>
                        <span className="text-sm">{reaction.impact}</span>
                      </div>
                      <Badge
                        className={`${
                          reaction.severity === "High"
                            ? "bg-red-100 text-red-700"
                            : reaction.severity === "Medium"
                              ? "bg-orange-100 text-orange-700"
                              : reaction.severity === "Positive"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {reaction.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-flydubai-blue" />
                Execution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {planData.timeline && planData.timeline.length > 0 ? (
                <div className="space-y-4">
                  {planData.timeline.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : step.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{step.action}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {step.duration}
                            </span>
                            <Badge variant="outline">{step.time}</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status:{" "}
                          <span className="capitalize">{step.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No timeline data available for this plan type.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Resource Edit Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-flydubai-navy">
                Resource Assignment
              </h3>
              <p className="text-sm text-muted-foreground">
                Modify resources and run what-if analysis to detect violations
                and cost impacts
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setResourceEditMode(!resourceEditMode)}
                className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                {resourceEditMode ? "View Mode" : "Edit Resources"}
              </Button>

              {resourceEditMode && (
                <Button
                  onClick={runResourceSimulation}
                  disabled={resourceSimulationRunning}
                  className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                >
                  {resourceSimulationRunning ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  {resourceSimulationRunning
                    ? "Analyzing..."
                    : "Run What-If Analysis"}
                </Button>
              )}
            </div>
          </div>

          {/* Violation and Cost Analysis Results */}
          {violationAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Violations Detected ({violationAnalysis.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {violationAnalysis.length > 0 ? (
                    <div className="space-y-3">
                      {violationAnalysis.map((violation, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {violation.type}
                            </span>
                            <Badge
                              className={`${
                                violation.severity === "Critical"
                                  ? "bg-red-100 text-red-700"
                                  : violation.severity === "High"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {violation.description}
                          </p>
                          <p className="text-sm font-medium text-red-600 mb-2">
                            Impact: {violation.impact}
                          </p>
                          <p className="text-sm text-blue-600">
                            Solution: {violation.solution}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>No violations detected</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-flydubai-orange" />
                    Cost Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {costAnalysis && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Base Cost:</span>
                        <span className="font-semibold">
                          AED {costAnalysis.baseCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Additional Costs:
                        </span>
                        <span className="font-semibold text-red-600">
                          +AED {costAnalysis.additionalCosts.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Savings:</span>
                        <span className="font-semibold text-green-600">
                          -AED {costAnalysis.savings.toLocaleString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Total Cost:</span>
                        <span className="font-bold text-flydubai-orange">
                          AED {costAnalysis.totalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Variance:</span>
                        <span
                          className={`font-semibold ${costAnalysis.variance >= 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {costAnalysis.variance >= 0 ? "+" : ""}AED{" "}
                          {costAnalysis.variance.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Cost Breakdown:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Aircraft:</span>
                            <span>
                              AED{" "}
                              {costAnalysis.breakdown.aircraft.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Crew:</span>
                            <span>
                              AED {costAnalysis.breakdown.crew.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ground Support:</span>
                            <span>
                              AED{" "}
                              {costAnalysis.breakdown.groundSupport.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Aircraft Resources */}
          {(modifiedResources?.aircraft ||
            (planData as any).resources?.aircraft) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-flydubai-blue" />
                  Aircraft Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Replacement Aircraft */}
                  {(modifiedResources?.aircraft?.replacement ||
                    (planData.resources &&
                      "aircraft" in planData.resources &&
                      (planData as any).resources?.aircraft?.replacement)) && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Replacement Aircraft</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Aircraft Selection
                          </label>
                          {resourceEditMode ? (
                            <Select
                              value={
                                modifiedResources?.aircraft?.replacement
                                  ?.tail ||
                                (planData.resources &&
                                  "aircraft" in planData.resources &&
                                  (planData as any).resources?.aircraft
                                    ?.replacement?.tail)
                              }
                              onValueChange={(value) => {
                                const selectedAircraft = availableAircraft.find(
                                  (a) => a.tail === value,
                                );
                                if (selectedAircraft) {
                                  handleResourceChange(
                                    "aircraft",
                                    "replacement",
                                    {
                                      tail: selectedAircraft.tail,
                                      type: selectedAircraft.type,
                                      status: selectedAircraft.status,
                                      location: selectedAircraft.location,
                                    },
                                  );
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableAircraft.map((aircraft) => (
                                  <SelectItem
                                    key={aircraft.tail}
                                    value={aircraft.tail}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {aircraft.tail} ({aircraft.type})
                                      </span>
                                      <Badge
                                        className={`text-xs ${
                                          aircraft.status === "Available"
                                            ? "bg-green-100 text-green-700"
                                            : aircraft.status === "In Transit"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {aircraft.status}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-flydubai-blue text-white">
                                {modifiedResources?.aircraft?.replacement
                                  ?.tail ||
                                  (planData.resources &&
                                    "aircraft" in planData.resources &&
                                    (planData as any).resources?.aircraft
                                      ?.replacement?.tail)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                (
                                {modifiedResources?.aircraft?.replacement
                                  ?.type ||
                                  (planData.resources &&
                                    "aircraft" in planData.resources &&
                                    (planData as any).resources?.aircraft
                                      ?.replacement?.type)}
                                )
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Aircraft Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <div>
                              {modifiedResources?.aircraft?.replacement
                                ?.status ||
                                (planData.resources &&
                                  "aircraft" in planData.resources &&
                                  (planData as any).resources?.aircraft
                                    ?.replacement?.status)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Location:
                            </span>
                            <div>
                              {modifiedResources?.aircraft?.replacement
                                ?.location ||
                                (planData.resources &&
                                  "aircraft" in planData.resources &&
                                  (planData as any).resources?.aircraft
                                    ?.replacement?.location)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assigned Aircraft */}
                  {(modifiedResources?.aircraft?.assigned ||
                    (planData.resources &&
                      "aircraft" in planData.resources &&
                      (planData as any).resources?.aircraft?.assigned)) && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Assigned Aircraft</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Aircraft Selection
                          </label>
                          {resourceEditMode ? (
                            <Select
                              value={
                                modifiedResources?.aircraft?.assigned?.tail ||
                                (planData.resources &&
                                  "aircraft" in planData.resources &&
                                  (planData as any).resources?.aircraft
                                    ?.assigned?.tail)
                              }
                              onValueChange={(value) => {
                                const selectedAircraft = availableAircraft.find(
                                  (a) => a.tail === value,
                                );
                                if (selectedAircraft) {
                                  handleResourceChange("aircraft", "assigned", {
                                    tail: selectedAircraft.tail,
                                    type: selectedAircraft.type,
                                    status: selectedAircraft.status,
                                    location: selectedAircraft.location,
                                  });
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableAircraft.map((aircraft) => (
                                  <SelectItem
                                    key={aircraft.tail}
                                    value={aircraft.tail}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {aircraft.tail} ({aircraft.type})
                                      </span>
                                      <Badge
                                        className={`text-xs ${
                                          aircraft.status === "Available"
                                            ? "bg-green-100 text-green-700"
                                            : aircraft.status === "In Transit"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {aircraft.status}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-flydubai-blue text-white">
                                {modifiedResources?.aircraft?.assigned?.tail ||
                                  (planData.resources &&
                                    "aircraft" in planData.resources &&
                                    (planData as any).resources?.aircraft
                                      ?.assigned?.tail)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                (
                                {modifiedResources?.aircraft?.assigned?.type ||
                                  (planData.resources &&
                                    "aircraft" in planData.resources &&
                                    (planData as any).resources?.aircraft
                                      ?.assigned?.type)}
                                )
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <div>
                              {modifiedResources?.aircraft?.assigned?.status ||
                                (planData.resources &&
                                  "aircraft" in planData.resources &&
                                  (planData as any).resources?.aircraft
                                    ?.assigned?.status)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Location:
                            </span>
                            <div>
                              {modifiedResources?.aircraft?.assigned
                                ?.location ||
                                (planData.resources &&
                                  "aircraft" in planData.resources &&
                                  (planData as any).resources?.aircraft
                                    ?.assigned?.location)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crew Resources */}
          {(modifiedResources?.crew || (planData as any).resources?.crew) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-flydubai-orange" />
                  Crew Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(
                    modifiedResources?.crew?.required ||
                    modifiedResources?.crew?.assigned ||
                    (planData.resources &&
                      "crew" in planData.resources &&
                      (planData as any).resources?.crew?.required) ||
                    (planData.resources &&
                      "crew" in planData.resources &&
                      (planData as any).resources?.crew?.assigned) ||
                    []
                  ).map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Position
                          </label>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Crew Member
                          </label>
                          {resourceEditMode ? (
                            <Select
                              value={member.id}
                              onValueChange={(value) =>
                                handleCrewChange(index, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCrew
                                  .filter(
                                    (crew) =>
                                      crew.role === member.role ||
                                      (member.role.includes("Cabin") &&
                                        crew.role.includes("Cabin")),
                                  )
                                  .map((crew) => (
                                    <SelectItem key={crew.id} value={crew.id}>
                                      <div className="flex flex-col">
                                        <span>{crew.name}</span>
                                        <div className="flex items-center gap-2 text-xs">
                                          <Badge
                                            className={`${
                                              crew.status === "Available"
                                                ? "bg-green-100 text-green-700"
                                                : crew.status === "On Duty"
                                                  ? "bg-yellow-100 text-yellow-700"
                                                  : "bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {crew.status}
                                          </Badge>
                                          <span className="text-muted-foreground">
                                            Duty: {crew.dutyHours}
                                          </span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.qualification}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <Badge
                              className={`ml-2 ${
                                member.status === "Available"
                                  ? "bg-green-100 text-green-700"
                                  : member.status === "On Duty"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {member.status}
                            </Badge>
                          </div>
                          {resourceEditMode && (
                            <div>
                              <span className="text-muted-foreground">
                                Qualification:
                              </span>
                              <div className="text-xs">
                                {member.qualification}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ground Support Resources */}
          {(modifiedResources?.groundSupport ||
            (planData as any).resources?.groundSupport) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-flydubai-navy" />
                  Ground Support Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(
                    modifiedResources?.groundSupport ||
                    (planData as any).resources?.groundSupport ||
                    []
                  ).map((support, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Ground Support
                            </label>
                            {resourceEditMode ? (
                              <Select
                                value={support.id}
                                onValueChange={(value) =>
                                  handleGroundSupportChange(index, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableGroundSupport.map((gs) => (
                                    <SelectItem key={gs.id} value={gs.id}>
                                      <div className="flex flex-col">
                                        <span>{gs.name}</span>
                                        <div className="flex items-center gap-2 text-xs">
                                          <Badge
                                            className={`${
                                              gs.status === "Available"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                          >
                                            {gs.status}
                                          </Badge>
                                          <span className="text-muted-foreground">
                                            {gs.personnel} personnel
                                          </span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="font-medium">{support.name}</div>
                            )}
                          </div>

                          <div>
                            <span className="text-sm text-muted-foreground">
                              Type:
                            </span>
                            <div className="font-medium">{support.type}</div>
                          </div>

                          <div>
                            <span className="text-sm text-muted-foreground">
                              Personnel:
                            </span>
                            <div className="font-medium">
                              {support.personnel || "N/A"}
                            </div>
                          </div>

                          <div>
                            <span className="text-sm text-muted-foreground">
                              Status:
                            </span>
                            <Badge
                              className={`${
                                support.status === "Available"
                                  ? "bg-green-100 text-green-700"
                                  : support.status === "Busy"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {support.status || "Available"}
                            </Badge>
                          </div>
                        </div>

                        {resourceEditMode && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeGroundSupport(index)}
                            className="text-red-600 hover:bg-red-50 ml-4"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {resourceEditMode && (
                    <Button
                      variant="outline"
                      onClick={addGroundSupport}
                      className="w-full border-dashed border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ground Support
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-flydubai-orange" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(planData.costs || {}).map(
                    ([category, amount]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span
                          className={`font-semibold ${category === "total" ? "text-flydubai-orange text-lg" : ""}`}
                        >
                          {amount as any}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-flydubai-blue" />
                  Impact Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Cost vs. Delay Ratio
                      </span>
                      <span className="text-sm font-medium">Optimal</span>
                    </div>
                    <Progress value={85} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Passenger Satisfaction
                      </span>
                      <span className="text-sm font-medium">Good</span>
                    </div>
                    <Progress value={78} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Operational Efficiency
                      </span>
                      <span className="text-sm font-medium">High</span>
                    </div>
                    <Progress value={92} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-flydubai-navy" />
                Risk Analysis & Mitigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {planData.risks && planData.risks.length > 0 ? (
                <div className="space-y-4">
                  {planData.risks.map((risk, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              risk.level === "High"
                                ? "text-red-600"
                                : risk.level === "Medium"
                                  ? "text-orange-600"
                                  : "text-yellow-600"
                            }`}
                          />
                          <Badge
                            className={`${
                              risk.level === "High"
                                ? "bg-red-100 text-red-700"
                                : risk.level === "Medium"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {risk.level} Risk
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">
                          {risk.probability}
                        </span>
                      </div>

                      <h4 className="font-medium mb-2">{risk.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Mitigation:</span>{" "}
                        {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No specific risks identified for this plan type.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-flydubai-orange" />
                Recovery Plan Simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {editMode && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-3">Adjust Parameters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Weather Severity
                        </label>
                        <Select
                          value={(customParameters as any).weather || "normal"}
                          onValueChange={(value) =>
                            handleParameterChange("weather", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Airport Congestion
                        </label>
                        <Select
                          value={(customParameters as any).congestion || "low"}
                          onValueChange={(value) =>
                            handleParameterChange("congestion", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Resource Availability
                        </label>
                        <Select
                          value={
                            (customParameters as any).resources || "optimal"
                          }
                          onValueChange={(value) =>
                            handleParameterChange("resources", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="optimal">Optimal</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                            <SelectItem value="constrained">
                              Constrained
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    onClick={runSimulation}
                    disabled={simulationRunning}
                    className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                  >
                    {simulationRunning ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {simulationRunning
                      ? "Running Simulation..."
                      : "Run Chain Reaction Analysis"}
                  </Button>

                  {simulationRunning && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-flydubai-orange border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-muted-foreground">
                        Analyzing impact scenarios...
                      </span>
                    </div>
                  )}
                </div>

                {simulationResults && (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Simulation completed successfully.{" "}
                        {simulationResults.chainReactionsDetected} chain
                        reactions detected with {simulationResults.riskFactors}{" "}
                        risk factors.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Recommended Actions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {simulationResults.recommendedActions.map(
                              (action, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{action}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Optimization Suggestions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {simulationResults.optimizationSuggestions.map(
                              (suggestion, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{suggestion}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
