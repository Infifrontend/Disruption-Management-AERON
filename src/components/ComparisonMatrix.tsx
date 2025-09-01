"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Target,
  Info,
  Download,
  Eye,
  MapPin,
  Clock,
  Plane,
  DollarSign,
  Users,
  Settings,
  Route,
  Building,
  Calendar,
  Activity,
  Star,
  XCircle,
  ArrowRight,
  Zap,
  UserCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { databaseService } from "../services/databaseService";
import { useNavigate } from "react-router-dom";
import { alertService } from "../services/alertService";

interface ComparisonMatrixProps {
  selectedFlight: any;
  recoveryOptions?: any[];
  scenarioData?: any;
  onSelectPlan: (plan: any) => void;
}

export function ComparisonMatrix({
  selectedFlight,
  recoveryOptions = [],
  scenarioData,
  onSelectPlan,
}: ComparisonMatrixProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State for reassigned data, keyed by option ID
  const [reassignedData, setReassignedData] = useState({});

  // Function to update reassigned data state
  const updateReassignedData = (optionId, type, data) => {
    setReassignedData(prevData => ({
      ...prevData,
      [optionId]: {
        ...(prevData[optionId] || {}),
        [type]: data,
      },
    }));
  };


  // Function to check if option requires execution based on impact_area
  const requiresExecution = (option) => {
    // Check if impact_area contains 'passenger' or 'crew'
    if (option.impact_area && Array.isArray(option.impact_area)) {
      return (
        option.impact_area.includes("passenger") ||
        option.impact_area.includes("crew")
      );
    }

    // Fallback to keyword-based logic if impact_area is not available
    const title = option.title?.toLowerCase() || "";
    const description = option.description?.toLowerCase() || "";

    const passengerServiceKeywords = [
      "delay for crew rest completion",
      "delay for repair completion",
      "reroute",
      "cancel due to weather",
      "divert to",
      "overnight delay",
      "accept cascade delays",
      "cancel selected legs",
      "cancel and rebook",
    ];

    return passengerServiceKeywords.some(
      (keyword) => title.includes(keyword) || description.includes(keyword),
    );
  };
  const [dynamicRecoveryOptions, setDynamicRecoveryOptions] = useState([]);
  const [selectedOptionDetails, setSelectedOptionDetails] = useState(null);
  const [rotationPlanDetails, setRotationPlanDetails] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRotationDialog, setShowRotationDialog] = useState(false);
  const [loadingFullDetails, setLoadingFullDetails] = useState(null);
  const [loadingRotationImpact, setLoadingRotationImpact] = useState(null);
  const [executingOption, setExecutingOption] = useState(null);
  const [showExecuteConfirmDialog, setShowExecuteConfirmDialog] =
    useState(false);
  const [optionToConfirm, setOptionToConfirm] = useState(null);
  const [selectedAircraftFlight, setSelectedAircraftFlight] = useState(null);
  const [showCrewSwapDialog, setShowCrewSwapDialog] = useState(false);
  const [selectedCrewForSwap, setSelectedCrewForSwap] = useState(null);
  const [availableCrewForSwap, setAvailableCrewForSwap] = useState([]);

  // Load recovery options from database based on disruption category
  useEffect(() => {
    const loadRecoveryOptions = async () => {
      if (selectedFlight?.id) {
        setLoading(true);
        setDynamicRecoveryOptions([]); // Clear previous options to prevent showing old data
        try {
          let options = [];
          const flightId = selectedFlight.id.toString();
          // Use the correct API endpoint: api/recovery-options/
          try {
            const response = await fetch(`/api/recovery-options/${flightId}`);
            if (response.ok) {
              options = await response.json();
            } else if (response.status === 404) {
              // Generate new options
              await databaseService.generateRecoveryOptions(flightId);

              // Wait a moment and try again
              await new Promise((resolve) => setTimeout(resolve, 2000));
              const retryResponse = await fetch(
                `/api/recovery-options/${flightId}`,
              );
              if (retryResponse.ok) {
                options = await retryResponse.json();
              }
            } else {
              console.error(`API error: ${response.status}`);
            }
          } catch (fetchError) {
            console.error("Error fetching from API:", fetchError);
            // Fallback to database service
            options =
              await databaseService.getDetailedRecoveryOptions(flightId);
          }

          // If still no options, try fallback methods
          if (options.length === 0) {
            // Try by disruption type/category
            if (selectedFlight.categorization || selectedFlight.type) {
              const categoryCode =
                selectedFlight.categorization || selectedFlight.type;
              options =
                await databaseService.getRecoveryOptionsByCategory(
                  categoryCode,
                );
            }
          }
          setDynamicRecoveryOptions(options);
        } catch (error) {
          console.error("Error loading recovery options:", error);
          setDynamicRecoveryOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setDynamicRecoveryOptions([]);
        setLoading(false);
      }
    };

    loadRecoveryOptions();
  }, [selectedFlight]);

  // Use dynamic recovery options from database only when loading is complete
  const comparisonOptions =
    !loading && dynamicRecoveryOptions.length > 0
      ? dynamicRecoveryOptions.map((option, index) => {
          const optionId = String(option.id || "");
          return {
            ...option,
            // Ensure all required fields are present for comparison
            metrics: option.metrics || {
              costEfficiency: 75 + Math.random() * 20,
              timeEfficiency: 70 + Math.random() * 25,
              passengerSatisfaction: 65 + Math.random() * 30,
              operationalComplexity: 50 + Math.random() * 40,
              riskLevel: 20 + Math.random() * 60,
              resourceAvailability: 80 + Math.random() * 20,
            },
            passengerImpact: option.passengerImpact || {
              affected: selectedFlight?.passengers || 167,
              reaccommodated: optionId.includes("CANCEL")
                ? selectedFlight?.passengers || 167
                : optionId.includes("DELAY")
                  ? Math.floor((selectedFlight?.passengers || 167) * 0.3)
                  : 0,
              compensated: optionId.includes("CANCEL")
                ? selectedFlight?.passengers || 167
                : optionId.includes("DELAY")
                  ? Math.floor((selectedFlight?.passengers || 167) * 0.5)
                  : 0,
              missingConnections: optionId.includes("CANCEL")
                ? Math.floor((selectedFlight?.passengers || 167) * 0.8)
                : optionId.includes("DELAY")
                  ? Math.floor((selectedFlight?.passengers || 167) * 0.4)
                  : Math.floor((selectedFlight?.passengers || 167) * 0.1),
            },
            operationalImpact: option.operationalImpact || {
              delayMinutes: parseInt(
                option.timeline?.replace(/[^0-9]/g, "") || "60",
              ),
              downstreamFlights: optionId.includes("CANCEL")
                ? 0
                : optionId.includes("DELAY")
                  ? 3
                  : 2,
              crewChanges: optionId.includes("CREW")
                ? 2
                : optionId.includes("CANCEL")
                  ? 1
                  : 0,
              gateChanges: optionId.includes("AIRCRAFT_SWAP") ? 1 : 0,
            },
            financialBreakdown: option.financialBreakdown || {
              aircraftCost: optionId.includes("AIRCRAFT_SWAP") ? 25000 : 0,
              crewCost:
                parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") * 0.3,
              passengerCost: optionId.includes("CANCEL")
                ? parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") * 0.6
                : parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") *
                  0.2,
              operationalCost:
                parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") * 0.2,
            },
            riskAssessment: option.riskAssessment || {
              technicalRisk:
                option.status === "recommended"
                  ? "Low"
                  : option.status === "caution"
                    ? "Medium"
                    : "High",
              weatherRisk: selectedFlight?.disruptionReason?.includes("Weather")
                ? "Medium"
                : "Low",
              regulatoryRisk: optionId.includes("CANCEL") ? "High" : "Low",
              passengerRisk:
                option.confidence > 80
                  ? "Low"
                  : option.confidence > 60
                    ? "Medium"
                    : "High",
            },
          };
        })
      : [];

  const flight = Array.isArray(selectedFlight)
    ? selectedFlight[0]
    : selectedFlight;
  const getAircraftIssueRecovery = () => ({
    title: "Aircraft Issue Recovery Options",
    options: [
      {
        id: "SWAP_A6FDC",
        title: "Aircraft Swap - A6-FDC",
        description: "Immediate tail swap with available A320",
        cost: "AED 45,000",
        timeline: "75 minutes",
        confidence: 95,
        impact: "Minimal passenger disruption",
        status: "recommended",
        metrics: {
          totalCost: 45000,
          otpScore: 88,
          aircraftSwaps: 1,
          crewViolations: 0,
          paxAccommodated: 98,
          regulatoryRisk: "Low",
          passengerCompensation: 8000,
          delayMinutes: 75,
          confidenceScore: 95,
          networkImpact: "Minimal",
        },
      },
      {
        id: "DELAY_REPAIR",
        title: "Delay for Repair Completion",
        description: "Wait for A6-FDB hydraulics system repair",
        cost: "AED 180,000",
        timeline: "4-6 hours",
        confidence: 45,
        impact: "Significant passenger disruption",
        status: "caution",
        metrics: {
          totalCost: 180000,
          otpScore: 35,
          aircraftSwaps: 0,
          crewViolations: 2,
          paxAccommodated: 75,
          regulatoryRisk: "Medium",
          passengerCompensation: 85000,
          delayMinutes: 300,
          confidenceScore: 45,
          networkImpact: "High",
        },
      },
      {
        id: "CANCEL_REBOOK",
        title: "Cancel and Rebook",
        description: "Cancel FZ445 and rebook on partner airlines",
        cost: "AED 520,000",
        timeline: "Immediate",
        confidence: 75,
        impact: "Complete route cancellation",
        status: "warning",
        metrics: {
          totalCost: 520000,
          otpScore: 0,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 85,
          regulatoryRisk: "Low",
          passengerCompensation: 320000,
          delayMinutes: 0,
          confidenceScore: 75,
          networkImpact: "None",
        },
      },
    ],
  });

  const getCrewIssueRecovery = () => ({
    title: "Crew Issue Recovery Options",
    options: [
      {
        id: "STANDBY_CREW",
        title: "Assign Standby Crew",
        description: "Capt. Mohammed Al-Zaabi from standby roster",
        cost: "AED 8,500",
        timeline: "30 minutes",
        confidence: 92,
        impact: "Minimal operational disruption",
        status: "recommended",
        metrics: {
          totalCost: 8500,
          otpScore: 95,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: "Low",
          passengerCompensation: 2000,
          delayMinutes: 30,
          confidenceScore: 92,
          networkImpact: "None",
        },
      },
      {
        id: "DEADHEAD_CREW",
        title: "Deadhead Crew from AUH",
        description: "Position qualified Captain from Abu Dhabi",
        cost: "AED 25,000",
        timeline: "120 minutes",
        confidence: 85,
        impact: "Moderate schedule delay",
        status: "caution",
        metrics: {
          totalCost: 25000,
          otpScore: 78,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 96,
          regulatoryRisk: "Low",
          passengerCompensation: 12000,
          delayMinutes: 120,
          confidenceScore: 85,
          networkImpact: "Low",
        },
      },
      {
        id: "DELAY_COMPLIANCE",
        title: "Delay for Crew Rest",
        description: "Wait for original crew mandatory rest period",
        cost: "AED 45,000",
        timeline: "3 hours",
        confidence: 65,
        impact: "Major schedule disruption",
        status: "warning",
        metrics: {
          totalCost: 45000,
          otpScore: 45,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 88,
          regulatoryRisk: "Low",
          passengerCompensation: 28000,
          delayMinutes: 180,
          confidenceScore: 65,
          networkImpact: "Medium",
        },
      },
    ],
  });

  const getWeatherDelayRecovery = () => ({
    title: "Weather Delay Recovery Options",
    options: [
      {
        id: "ROUTE_OPTIMIZE",
        title: "Route Optimization",
        description: "Alternative routing to avoid weather",
        cost: "AED 12,000",
        timeline: "45 minutes",
        confidence: 88,
        impact: "Minimal delay with fuel cost",
        status: "recommended",
        metrics: {
          totalCost: 12000,
          otpScore: 92,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: "Low",
          passengerCompensation: 3000,
          delayMinutes: 45,
          confidenceScore: 88,
          networkImpact: "None",
        },
      },
      {
        id: "WEATHER_DELAY",
        title: "Hold for Weather Improvement",
        description: "Wait for favorable weather conditions",
        cost: "AED 35,000",
        timeline: "2-3 hours",
        confidence: 70,
        impact: "Schedule delay with passenger services",
        status: "caution",
        metrics: {
          totalCost: 35000,
          otpScore: 65,
          aircraftSwaps: 0,
          crewViolations: 1,
          paxAccommodated: 95,
          regulatoryRisk: "Medium",
          passengerCompensation: 18000,
          delayMinutes: 150,
          confidenceScore: 70,
          networkImpact: "Low",
        },
      },
      {
        id: "ALTERNATE_AIRPORT",
        title: "Divert to Alternate Airport",
        description: "Land at nearby airport with ground transport",
        cost: "AED 85,000",
        timeline: "Normal flight time",
        confidence: 90,
        impact: "Ground transport arrangement required",
        status: "caution",
        metrics: {
          totalCost: 85000,
          otpScore: 85,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 90,
          regulatoryRisk: "Low",
          passengerCompensation: 35000,
          delayMinutes: 60,
          confidenceScore: 90,
          networkImpact: "Medium",
        },
      },
    ],
  });

  const getCurfewCongestionRecovery = () => ({
    title: "Airport Curfew/Congestion Recovery Options",
    options: [
      {
        id: "PRIORITY_SLOT",
        title: "Request Priority Slot",
        description: "ATC coordination for earlier departure",
        cost: "AED 15,000",
        timeline: "60 minutes",
        confidence: 80,
        impact: "Moderate delay with slot fees",
        status: "recommended",
        metrics: {
          totalCost: 15000,
          otpScore: 85,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: "Low",
          passengerCompensation: 5000,
          delayMinutes: 60,
          confidenceScore: 80,
          networkImpact: "None",
        },
      },
      {
        id: "OVERNIGHT_DELAY",
        title: "Overnight Delay",
        description: "Delay until next available slot",
        cost: "AED 95,000",
        timeline: "Next day",
        confidence: 95,
        impact: "Full passenger accommodation required",
        status: "caution",
        metrics: {
          totalCost: 95000,
          otpScore: 20,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: "Low",
          passengerCompensation: 65000,
          delayMinutes: 720,
          confidenceScore: 95,
          networkImpact: "High",
        },
      },
      {
        id: "REROUTE_HUB",
        title: "Reroute via Alternative Hub",
        description: "Route through different airport hub",
        cost: "AED 45,000",
        timeline: "3 hours",
        confidence: 85,
        impact: "Extended travel time",
        status: "caution",
        metrics: {
          totalCost: 45000,
          otpScore: 70,
          aircraftSwaps: 0,
          crewViolations: 1,
          paxAccommodated: 95,
          regulatoryRisk: "Low",
          passengerCompensation: 22000,
          delayMinutes: 180,
          confidenceScore: 85,
          networkImpact: "Medium",
        },
      },
    ],
  });

  const getRotationMisalignmentRecovery = () => ({
    title: "Rotation/Maintenance Recovery Options",
    options: [
      {
        id: "ROTATION_RESEQUENCE",
        title: "Resequence Rotation",
        description: "Adjust aircraft rotation sequence",
        cost: "AED 18,000",
        timeline: "90 minutes",
        confidence: 88,
        impact: "Minor schedule adjustments",
        status: "recommended",
        metrics: {
          totalCost: 18000,
          otpScore: 90,
          aircraftSwaps: 2,
          crewViolations: 0,
          paxAccommodated: 98,
          regulatoryRisk: "Low",
          passengerCompensation: 6000,
          delayMinutes: 90,
          confidenceScore: 88,
          networkImpact: "Low",
        },
      },
      {
        id: "MAINTENANCE_DEFER",
        title: "Defer Maintenance",
        description: "Postpone non-critical maintenance",
        cost: "AED 8,000",
        timeline: "30 minutes",
        confidence: 75,
        impact: "Minimal operational impact",
        status: "caution",
        metrics: {
          totalCost: 8000,
          otpScore: 95,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: "Medium",
          passengerCompensation: 2000,
          delayMinutes: 30,
          confidenceScore: 75,
          networkImpact: "None",
        },
      },
      {
        id: "ALTERNATIVE_AIRCRAFT",
        title: "Use Alternative Aircraft",
        description: "Swap to maintenance-ready aircraft",
        cost: "AED 35,000",
        timeline: "2 hours",
        confidence: 92,
        impact: "Aircraft swap with passenger transfer",
        status: "recommended",
        metrics: {
          totalCost: 35000,
          otpScore: 82,
          aircraftSwaps: 1,
          crewViolations: 0,
          paxAccommodated: 96,
          regulatoryRisk: "Low",
          passengerCompensation: 15000,
          delayMinutes: 120,
          confidenceScore: 92,
          networkImpact: "Low",
        },
      },
    ],
  });

  const getScenarioData = (categorization) => {
    switch (categorization) {
      case "Aircraft issue (e.g., AOG)":
        return getAircraftIssueRecovery();
      case "Crew issue (e.g., sick report, duty time breach)":
        return getCrewIssueRecovery();
      case "ATC/weather delay":
        return getWeatherDelayRecovery();
      case "Airport curfew/ramp congestion":
        return getCurfewCongestionRecovery();
      case "Rotation misalignment or maintenance hold":
        return getRotationMisalignmentRecovery();
      default:
        return getAircraftIssueRecovery();
    }
  };

  useEffect(() => {
    if (flight && recoveryOptions.length === 0) {
      // Only fetch if no dynamic options are provided
      const data = getScenarioData(flight.categorization);
      // setRecoveryOptions(data.options) // This line should be in the parent component to pass options
    }
  }, [flight, recoveryOptions]); // Added recoveryOptions to dependency array

  if (!flight) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-blue">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-flydubai-blue mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">
              No Recovery Options to Compare
            </h3>
            <p className="text-muted-foreground">
              Please select a flight from the Affected Flights screen and
              generate recovery options first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-blue">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flydubai-blue mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">
              Loading Recovery Options
            </h3>
            <p className="text-muted-foreground">
              Fetching recovery options for {flight.flightNumber} (
              {flight.route})...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state when no options are found
  if (!comparisonOptions || comparisonOptions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-gray-300">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Options Found
            </h3>
            <p className="text-muted-foreground">
              No recovery options are available for {flight.flightNumber} (
              {flight.route}) at this time.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check back later or contact the operations team for
              assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateComparisonData = () => {
    const metrics = [
      { metric: "Total Cost", type: "cost", format: "currency" },
      { metric: "OTP Score", type: "percentage", format: "percentage" },
      { metric: "Aircraft Swaps", type: "number", format: "number" },
      { metric: "Crew Rule Violations", type: "violations", format: "number" },
      { metric: "PAX Accommodated", type: "percentage", format: "percentage" },
      { metric: "Regulatory Risk", type: "risk", format: "text" },
      { metric: "Delay (Minutes)", type: "number", format: "number" },
      { metric: "Confidence Score", type: "percentage", format: "percentage" },
      { metric: "Network Impact", type: "risk", format: "text" },
      { metric: "Passenger Impact", type: "passenger_service", format: "text" },
      { metric: "Crew Impact", type: "crew_impact", format: "text" },
    ];

    return metrics.map((metric) => {
      const row = {
        metric: metric.metric,
        type: metric.type,
        format: metric.format,
      };

      comparisonOptions.forEach((option, index) => {
        const key = `option${String.fromCharCode(65 + index)}`;

        switch (metric.metric) {
          case "Total Cost":
            // Use cost from option or calculate from financial breakdown
            let totalCost: any = 0;

            // Try multiple sources for cost data
            if (option.totalCost) {
              totalCost = option.totalCost;
            } else if (option.metrics?.totalCost) {
              totalCost = option.metrics.totalCost;
            } else if (option.cost) {
              const costString = String(option.cost).replace(/[^0-9]/g, "");
              totalCost = parseInt(costString) || 0;
            } else if (option.financialBreakdown) {
              totalCost = Object.values(option.financialBreakdown).reduce(
                (sum: number, cost) =>
                  sum + (typeof cost === "number" ? cost : 0),
                0,
              );
            }

            // Set minimum reasonable cost if zero or too low
            if (totalCost === 0 || totalCost < 1000) {
              totalCost = 25000; // Default reasonable cost
            }

            row[key] = `AED ${totalCost.toLocaleString()}`;
            break;
          case "OTP Score":
            row[key] =
              `${option.metrics?.otpScore || Math.floor(option.confidence || 85)}%`;
            break;
          case "Aircraft Swaps":
            row[key] = (
              option.metrics?.aircraftSwaps ||
              (option.id && String(option.id).includes("AIRCRAFT") ? 1 : 0)
            ).toString();
            break;
          case "Crew Rule Violations":
            row[key] = (option.metrics?.crewViolations || 0).toString();
            break;
          case "PAX Accommodated":
            row[key] =
              `${option.metrics?.paxAccommodated || Math.floor(100 - ((option.passengerImpact?.missingConnections || 0) / (option.passengerImpact?.affected || 1)) * 100)}%`;
            break;
          case "Regulatory Risk":
            row[key] =
              option.metrics?.regulatoryRisk ||
              option.riskAssessment?.regulatoryRisk ||
              "Low";
            break;
          case "Delay (Minutes)":
            row[key] = (
              option.metrics?.delayMinutes ||
              option.operationalImpact?.delayMinutes ||
              parseInt(option.timeline?.replace(/[^0-9]/g, "") || "60")
            ).toString();
            break;
          case "Confidence Score":
            row[key] =
              `${option.metrics?.confidenceScore || option.confidence || 85}%`;
            break;
          case "Network Impact":
            row[key] = option.metrics?.networkImpact || "Low";
            break;
          case "Passenger Impact":
            // Check impact_area first, then fall back to keyword detection
            if (
              option.impact_area &&
              Array.isArray(option.impact_area) &&
              option.impact_area.includes("passenger")
            ) {
              const passengerCount = flight?.passengers || 175;
              row[key] = `${passengerCount} passengers need Reaccommodate`;
            } else {
              row[key] = "No passenger impact";
            }
            break;
          case "Crew Impact":
            if (
              option.impact_area &&
              Array.isArray(option.impact_area) &&
              option.impact_area.includes("crew")
            ) {
              row[key] = "Yes";
            } else {
              row[key] = "No";
            }
            break;
          default:
            row[key] = "-";
        }
      });

      return row;
    });
  };

  const comparisonData = generateComparisonData();

  const getRiskBadgeStyle = (risk) => {
    switch (risk?.toLowerCase()) {
      case "none":
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "recommended":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "caution":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleViewFullDetails = async (option) => {
    setLoadingFullDetails(option.id);
    try {
      // Use the option data that already contains all the detailed information
      // The API response includes: resource_requirements, cost_breakdown, timeline_details,
      // risk_assessment, technical_specs which are all needed for the details popup
      // The option already contains all the required data from /api/recovery-options/:disruptionId
      const enrichedDetails = {
        ...option,
        // Map the existing data to the expected structure for the details dialog
        costBreakdown: option.cost_breakdown || [],
        timelineDetails: option.timeline_details || [],
        resourceRequirements: option.resource_requirements || [],
        riskAssessment: option.risk_assessment || [],
        technicalSpecs: option.technical_specs || {},
      };

      setSelectedOptionDetails(enrichedDetails);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error processing option details:", error);
      setSelectedOptionDetails(option); // Fallback to option data
      setShowDetailsDialog(true);
    } finally {
      setLoadingFullDetails(null);
    }
  };

  const handleViewRotationImpact = async (option) => {
    setLoadingRotationImpact(option.id);
    try {
      // Store the selected option details for consistent title display
      setSelectedOptionDetails(option);

      // Use the rotation_plan data that's already included in the option from the API

      let rotationPlan = option.rotation_plan;

      // Fetch reassigned data if available
      let optionReassignedData = {};
      try {
        const reassignedResponse = await fetch(
          `/api/recovery-option/${option.id}/reassigned-data`,
        );
        if (reassignedResponse.ok) {
          optionReassignedData = await reassignedResponse.json();
        }
      } catch (error) {
        console.warn(
          "Could not fetch reassigned data for option:",
          option.id,
          error,
        );
      }

      // Transform the API data to match the expected structure for the rotation dialog
      const enrichedRotationPlan = {
        // Aircraft options from API (aircraftOptions array)
        aircraftRotations: rotationPlan?.aircraftOptions?.map((aircraft) => ({
          reg: aircraft.reg || aircraft.aircraft,
          aircraft: aircraft.reg || aircraft.aircraft,
          type: aircraft.type || "B737-800 (189Y)",
          etops: aircraft.etops || { status: "available", value: "ETOPS-180" },
          cabinMatch: aircraft.cabinMatch || { status: "exact" },
          availability: aircraft.availability || "Available",
          assigned: aircraft.assigned || { status: "none" },
          turnaround:
            aircraft.turnaround || aircraft.turnaroundTime || "45 min",
          turnaroundTime:
            aircraft.turnaround || aircraft.turnaroundTime || "45 min",
          maintenance: aircraft.maintenance || { status: "current" },
          recommended:
            aircraft.recommended || aircraft.optionScore?.overall === "92%",
          optionScore: aircraft.optionScore,
          // Add reassigned aircraft information
          reassigned:
            selectedAircraftFlight !== null && selectedAircraftFlight !== 0,
        })) || [
          {
            reg: selectedFlight?.aircraft || "A6-FDB",
            aircraft: selectedFlight?.aircraft || "A6-FDB",
            type: "B737-800 (189Y)",
            etops: { status: "available", value: "ETOPS-180" },
            cabinMatch: { status: "exact" },
            availability: "Available",
            assigned: { status: "none" },
            turnaround: "45 min",
            turnaroundTime: "45 min",
            maintenance: { status: "current" },
            recommended: true,
            reassigned: false,
          },
        ],

        // Impacted flights from API (nextSectors array) - include reassigned flight data
        impactedFlights: (
          optionReassignedData.flights ||
          rotationPlan?.nextSectors ||
          []
        )?.map((sector) => ({
          flight: sector.flight || sector.flightNumber,
          flightNumber: sector.flight || sector.flightNumber,
          departure: sector.departure || sector.departureTime,
          delay: sector.delay,
          passengers: sector.passengers,
          status: sector.status,
          impact: sector.impact,
          reason: sector.reason,
          reassigned: sector.reassigned || false,
          originalDeparture: sector.originalDeparture,
          newDeparture: sector.newDeparture,
        })) || [
          {
            flight: "FZ446",
            flightNumber: "FZ446",
            departure: "16:30",
            delay: "45 min",
            passengers: 156,
            status: "Delayed",
            impact: "Medium Impact",
            reason: "Aircraft swap delay",
            reassigned: false,
          },
        ],

        // Crew data from API - handle both crewData and crew arrays, include reassigned crew info
        crew:
          (rotationPlan?.crewData || rotationPlan?.crew || [])?.map((crew) => ({
            name: crew?.name,
            qualifications: crew?.qualifications,
            role: crew?.role,
            role_code: crew?.role_code,
            status: crew?.status,
            issue: crew?.issue,
            experience_years: crew?.experience_years,
            // Add reassigned crew information
            originalName: crew?.replacedCrew,
            isReassigned:
              !!crew?.replacedCrew || !!crew?.autoAssignedReplacement,
            reassignedAt: crew?.assignedAt,
            isAutoAssigned: crew?.isAutoAssigned,
            // languages: crew?.languages,
            // base: crew?.base,
          })) || [],

        // Include reassigned crew summary
        reassignedCrewSummary: optionReassignedData.crew || [],

        // Operational metrics calculated from API data
        operationalMetrics: {
          totalDelayMinutes: parseInt(
            option.timeline?.replace(/[^0-9]/g, "") || "60",
          ),
          affectedFlights: rotationPlan?.nextSectors?.length || 0,
          estimatedCost: option.cost,
          passengerImpact:
            rotationPlan?.nextSectors?.reduce(
              (total, sector) => total + (sector.passengers || 0),
              0,
            ) ||
            flight?.passengers ||
            0,
        },
        // Cost breakdown from API
        costBreakdown: rotationPlan?.costBreakdown || {},

        // Crew constraints from API
        crewConstraint: rotationPlan?.crewConstraint || {},

        // Operational constraints from API
        operationalConstraints: rotationPlan?.operationalConstraints || {},

        // Recommended option from API
        recommendedOption:
          rotationPlan?.recommendation || rotationPlan?.recommendedOption || {},
      };
      console.log(optionReassignedData, "reass");
      setRotationPlanDetails(enrichedRotationPlan);
      setShowRotationDialog(true);
    } catch (error) {
      console.error("Error processing rotation plan:", error);

      // Ensure selectedOptionDetails is still set even on error
      if (!selectedOptionDetails || selectedOptionDetails.id !== option.id) {
        setSelectedOptionDetails(option);
      }
      // Fallback rotation plan with minimal data
      setRotationPlanDetails({
        aircraftRotations: [
          {
            reg: selectedFlight?.aircraft || "A6-FDB",
            aircraft: selectedFlight?.aircraft || "A6-FDB",
            type: "B737-800 (189Y)",
            etops: { status: "available", value: "ETOPS-180" },
            cabinMatch: { status: "exact" },
            availability: "Available",
            assigned: { status: "none" },
            turnaround: "45 min",
            turnaroundTime: "45 min",
            maintenance: { status: "current" },
            recommended: true,
            reassigned: false,
          },
        ],
        impactedFlights: [],
        crew: [],
        operationalMetrics: {
          totalDelayMinutes: 60,
          affectedFlights: 0,
          estimatedCost: option.cost,
          passengerImpact: flight?.passengers || 0,
        },
        costBreakdown: {},
        crewConstraint: {},
        operationalConstraints: {},
        recommendedOption: {},
      });
      setShowRotationDialog(true);
    } finally {
      setLoadingRotationImpact(null);
    }
  };

  const handleExecuteOption = async (option, letter) => {
    // Store the option and letter for confirmation
    setOptionToConfirm({ option, letter });
    setShowExecuteConfirmDialog(true);
  };

  const confirmExecuteOption = async () => {
    if (!optionToConfirm) return;

    const { option, letter } = optionToConfirm;
    setExecutingOption(option.id);
    setShowExecuteConfirmDialog(false);

    try {
      // Check if option requires execution based on impact_area
      if (requiresExecution(option)) {
        // Create comprehensive passenger services context with all necessary data
        const passengerContext = {
          selectedFlight: flight,
          flight: flight, // Add both for compatibility
          recoveryOption: {
            ...option,
            // Ensure all required fields are included
            optionLetter: letter,
            executionTimestamp: new Date().toISOString(),
            selectedBy: "operations_user",
            // Include all technical and operational details
            fullDetails: {
              costBreakdown: option.cost_breakdown || [],
              timelineDetails: option.timeline_details || [],
              resourceRequirements: option.resource_requirements || [],
              riskAssessment: option.risk_assessment || [],
              technicalSpecs: option.technical_specs || {},
              rotationPlan: option.rotation_plan || {},
            },
          },
          fromExecution: true, // Flag to indicate this came from execution
          executionContext: {
            comparisonData: comparisonOptions,
            flightContext: flight,
            timestamp: new Date().toISOString(),
          },
        };

        // Use the app context to set the passenger services context
        // This ensures the data is available when the page loads
        if (typeof onSelectPlan === "function") {
          onSelectPlan(passengerContext);
        }

        // Navigate to passenger services with option data
        navigate("/passengers", {
          state: passengerContext,
        });
        return;
      }

      // Check if this combination already exists to prevent duplicates
      const existingSolutions =
        await databaseService.getPendingRecoverySolutions();
      const isDuplicate = existingSolutions.some(
        (solution) =>
          solution.disruption_id == selectedFlight?.id &&
          solution.option_id == option.id,
      );

      if (isDuplicate) {
        alertService.warning(
          "Duplicate Solution",
          "This recovery solution is already pending for this flight.",
          () => setExecutingOption(null),
        );
        return;
      }

      // Get full details and rotation impact before executing
      let fullDetails = null;
      let rotationImpact = null;

      // Fetch full details
      // try {
      //   const detailsResponse = await fetch(
      //     `/api/recovery-option-details/${option.id}`,
      //   );
      //   if (detailsResponse.ok) {
      //     fullDetails = await detailsResponse.json();
      //   }
      // } catch (error) {
      //   console.warn("Could not fetch full details:", error);
      // }

      // Fetch rotation impact
      try {
        const rotationResponse = await fetch(
          `/api/recovery-option/${option.id}/rotation-plan`,
        );
        if (rotationResponse.ok) {
          const result = await rotationResponse.json();
          rotationImpact = result.rotationPlan || result;
        }
      } catch (error) {
        console.warn("Could not fetch rotation impact:", error);
      }

      // Submit to pending solutions - Fix disruption ID issue
      const pendingSolution = {
        disruption_id: selectedFlight?.id || flight?.id, // Ensure disruption_id is included
        option_id: option.id,
        option_title: option.title,
        option_description: option.description,
        cost: option.cost,
        timeline: option.timeline,
        confidence: option.confidence,
        impact: option.impact,
        status: "Pending",
        full_details: fullDetails,
        rotation_impact: rotationImpact,
        submitted_by: "operations_user",
        approval_required: true,
      };

      // Use fetch to call the API directly
      const response = await fetch("/api/pending-recovery-solutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pendingSolution),
      });

      if (response.ok) {
        // Update flight status to pending
        await databaseService.updateFlightRecoveryStatus(
          selectedFlight?.id || flight?.id,
          "pending",
        );

        // Show success popup instead of navigating immediately
        alertService.success(
          "Recovery Solution Submitted",
          `Recovery solution "${option.title}" has been sent for approval successfully!\n\nClick OK to return to Affected Flights.`,
          () => navigate("/disruption"),
        );
      } else {
        const errorData = await response.json();
        alertService.error(
          "Submission Failed",
          `Failed to submit recovery solution: ${errorData.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error executing recovery option:", error);
      alertService.error(
        "Execution Error",
        "An error occurred while executing the recovery option.",
      );
    } finally {
      setExecutingOption(null);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Helper function to generate available crew for specific role
  const generateAvailableCrewForRole = (
    targetRole: any,
    excludeName = null,
  ) => {
    console.log("excludeName ", targetRole, excludeName);
    // const crewPools :any ={};
    const roleNormalized = targetRole.toLowerCase();
    console.log(selectedOptionDetails, "selectedOptionDetails");

    // Ensure crew_available is an array before filtering
    const availableCrewList = Array.isArray(
      selectedOptionDetails?.crew_available,
    )
      ? selectedOptionDetails.crew_available
      : [];

    // Group all crew by role
    const crewPools = Object.groupBy(
      availableCrewList,
      (crew: any) => crew?.role_code,
    );
    console.log(crewPools, "crewPools");
    // Normalize role mapping
    let availableCrew: any[] = [];

    console.log(roleNormalized, "normalized");
    // if (roleNormalized.includes("captain") || roleNormalized.includes("capt")) {
    //   availableCrew = crewPools["captain"] ?? [];
    // } else if (
    //   roleNormalized.includes("first officer") ||
    //   roleNormalized.includes("f/o") ||
    //   roleNormalized.includes("fo")
    // ) {
    //   availableCrew = crewPools["first_officer"] ?? [];
    // } else if (
    //   roleNormalized.includes("flight attendant") ||
    //   roleNormalized.includes("cabincrew") ||
    //   roleNormalized.includes("fa")
    // ) {
    //   availableCrew = crewPools["cabin_crew"] ?? [];
    // } else if (
    //   roleNormalized.includes("senior cabin") ||
    //   roleNormalized.includes("senior") ||
    //   roleNormalized.includes("sc")
    // ) {
    //   availableCrew = crewPools["senior_cabin_crew"] ?? [];
    // } else {
    //   // Default to captain pool if role is unclear
    //   availableCrew = crewPools["captain"] ?? [];
    // }
    availableCrew = crewPools[targetRole] ? crewPools[targetRole] : [];
    console.log(availableCrew, "availableCrew");
    // Filter out the current crew member if editing
    if (excludeName) {
      availableCrew = availableCrew.filter((crew) => crew.name !== excludeName);
    }
    console.log(availableCrew, "availableCrew");
    return availableCrew;
  };

  const getConfirmationMessage = (option) => {
    if (!option.impact_area || !Array.isArray(option.impact_area)) {
      return `Are you sure you want to execute "${option.title}"? This action will submit the recovery plan for approval.`;
    }

    const impactAreas = option.impact_area;

    if (impactAreas.includes("passenger") && impactAreas.includes("crew")) {
      return `This recovery option will impact both passengers and crew operations. Executing "${option.title}" will require coordination with Passenger Services and Crew Management teams. Do you want to proceed?`;
    } else if (impactAreas.includes("passenger")) {
      return `This recovery option will impact passenger services. Executing "${option.title}" will redirect you to the Passenger Services page to handle rebooking and accommodations. Do you want to proceed?`;
    } else if (impactAreas.includes("crew")) {
      return `This recovery option will impact crew operations. Executing "${option.title}" will require crew schedule adjustments and may affect duty time regulations. Do you want to proceed?`;
    } else if (impactAreas.includes("aircraft")) {
      return `This recovery option involves aircraft operations. Executing "${option.title}" will initiate aircraft-related procedures including potential maintenance coordination. Do you want to proceed?`;
    } else if (impactAreas.includes("operations")) {
      return `This recovery option will impact operational procedures. Executing "${option.title}" will modify flight operations and may affect network scheduling. Do you want to proceed?`;
    } else {
      return `Are you sure you want to execute "${option.title}"? This action will submit the recovery plan for approval and implementation.`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">
            Recovery Options Comparison
          </h2>
          <p className="text-muted-foreground">
            Comparing {comparisonOptions.length} recovery options for{" "}
            {flight.flightNumber}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              className={`${
                flight.priority === "High"
                  ? "bg-red-100 text-red-700 border-red-200"
                  : flight.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-green-100 text-green-700 border-green-200"
              }`}
            >
              {flight.priority} Priority
            </Badge>
            <Badge
              variant="outline"
              className="text-flydubai-blue border-flydubai-blue"
            >
              {flight.categorization}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Flight Information
          </div>
          <div className="font-medium">
            {selectedFlight?.flightNumber || "N/A"} • {selectedFlight?.origin}-
            {selectedFlight?.destination}
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedFlight?.aircraft || "N/A"} •{" "}
            {selectedFlight?.passengers || 0} passengers
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
          <Button
            variant="outline"
            className="border-flydubai-orange text-flydubai-orange hover:bg-orange-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Charts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisonOptions.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <Card
              key={option.id}
              className={`border-2 ${
                option.status === "recommended"
                  ? "border-green-300 bg-green-50"
                  : option.status === "caution"
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-red-300 bg-red-50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-flydubai-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      {letter}
                    </span>
                    <h3 className="font-semibold text-flydubai-navy">
                      {option.title}
                    </h3>
                  </div>
                  {getStatusIcon(option.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {option.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-medium text-flydubai-orange">
                      {option.cost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span className="font-medium">{option.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.confidence}%</span>
                      <Progress
                        value={option.confidence}
                        className="w-16 h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-flydubai-navy">
            Comprehensive Comparison Matrix
          </CardTitle>
          <p className="text-muted-foreground">
            Side-by-side analysis of all recovery options with key performance
            indicators
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-flydubai-navy">
                    Metric
                  </TableHead>
                  {comparisonOptions.map((option, index) => {
                    const letter = String.fromCharCode(65 + index);
                    return (
                      <TableHead key={option.id} className="text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-flydubai-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                              {letter}
                            </span>
                            <span className="font-semibold">
                              Option {letter}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground font-normal">
                            {option.title}
                          </span>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-blue-50">
                    <TableCell className="font-medium text-flydubai-navy">
                      {row.metric}
                    </TableCell>
                    {comparisonOptions.map((option, optionIndex) => {
                      const letter = String.fromCharCode(65 + optionIndex);
                      const value = row[`option${letter}`];

                      return (
                        <TableCell key={option.id} className="text-center">
                          {row.type === "risk" ? (
                            <Badge className={getRiskBadgeStyle(value)}>
                              {value}
                            </Badge>
                          ) : row.type === "violations" &&
                            parseInt(value) > 0 ? (
                            <span className="text-red-600 font-medium">
                              {value}
                            </span>
                          ) : row.format === "currency" ? (
                            <span className="font-medium">{value}</span>
                          ) : row.format === "percentage" ? (
                            <span className="font-medium">{value}</span>
                          ) : row.type === "passenger_service" ? (
                            <div className="text-xs">
                              {value.includes("need Reaccommodate") ||
                              value.includes("passengers affected") ? (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  {value}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {value}
                                </Badge>
                              )}
                            </div>
                          ) : row.type === "crew_impact" ? (
                            <div className="text-xs">
                              {value === "Yes" ? (
                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  No
                                </Badge>
                              )}
                            </div>
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisonOptions.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <Card key={option.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-flydubai-navy">
                    Option {letter} Details
                  </h3>
                  <span className="bg-flydubai-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    {letter}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewFullDetails(option)}
                    disabled={loadingFullDetails === option.id}
                  >
                    {loadingFullDetails === option.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-flydubai-blue mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewRotationImpact(option)}
                    disabled={loadingRotationImpact === option.id}
                  >
                    {loadingRotationImpact === option.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-flydubai-blue mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Rotation Impact
                      </>
                    )}
                  </Button>

                  <Button
                    className="w-full bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                    onClick={() => handleExecuteOption(option, letter)}
                    disabled={executingOption === option.id}
                  >
                    {executingOption === option.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : requiresExecution(option) ? (
                      "Execute"
                    ) : (
                      "Send for Approval"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-8 w-8 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium mb-3 text-flydubai-navy">
                AERON AI Recommendation Summary
              </h3>
              <div className="space-y-3">
                {/* Best Overall - Highest confidence recommended option */}
                {(() => {
                  const bestOverall = comparisonOptions
                    .filter((opt) => opt.status === "recommended")
                    .sort(
                      (a, b) => (b.confidence || 0) - (a.confidence || 0),
                    )[0];

                  if (bestOverall) {
                    const letter = String.fromCharCode(
                      65 + comparisonOptions.indexOf(bestOverall),
                    );
                    return (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Best Overall
                        </Badge>
                        <span>
                          Option {letter} - {bestOverall.title} (
                          {bestOverall.confidence}% confidence)
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Most Cost-Effective - Lowest cost option */}
                {(() => {
                  const mostCostEffective = comparisonOptions
                    .slice()
                    .sort((a, b) => {
                      const costA = parseInt(
                        a.cost?.replace(/[^0-9]/g, "") || "999999",
                      );
                      const costB = parseInt(
                        b.cost?.replace(/[^0-9]/g, "") || "999999",
                      );
                      return costA - costB;
                    })[0];

                  if (mostCostEffective) {
                    const letter = String.fromCharCode(
                      65 + comparisonOptions.indexOf(mostCostEffective),
                    );
                    return (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Most Cost-Effective
                        </Badge>
                        <span>
                          Option {letter} - {mostCostEffective.title} (
                          {mostCostEffective.cost})
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Fastest Recovery - Shortest timeline option */}
                {(() => {
                  const fastestRecovery = comparisonOptions
                    .slice()
                    .sort((a, b) => {
                      const timeA = parseInt(
                        a.timeline?.replace(/[^0-9]/g, "") || "999",
                      );
                      const timeB = parseInt(
                        b.timeline?.replace(/[^0-9]/g, "") || "999",
                      );
                      return timeA - timeB;
                    })[0];

                  if (fastestRecovery) {
                    const letter = String.fromCharCode(
                      65 + comparisonOptions.indexOf(fastestRecovery),
                    );
                    return (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          Fastest Recovery
                        </Badge>
                        <span>
                          Option {letter} - {fastestRecovery.title} (
                          {fastestRecovery.timeline})
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>AI Analysis:</strong>{" "}
                  {(() => {
                    const recommendedOption = comparisonOptions.find(
                      (opt) => opt.status === "recommended",
                    );
                    const totalOptions = comparisonOptions.length;
                    const avgConfidence = Math.round(
                      comparisonOptions.reduce(
                        (sum, opt) => sum + (opt.confidence || 0),
                        0,
                      ) / totalOptions,
                    );

                    if (recommendedOption) {
                      return `Based on current flight conditions for ${flight?.flightNumber || "this flight"} (${flight?.passengers || 0} passengers), the recommended ${recommendedOption.title.toLowerCase()} provides optimal balance across cost efficiency (${recommendedOption.cost}), recovery time (${recommendedOption.timeline}), and operational impact. System confidence: ${recommendedOption.confidence}% vs ${avgConfidence}% average across ${totalOptions} analyzed options.`;
                    } else {
                      return `Analysis complete for ${totalOptions} recovery options with average confidence of ${avgConfidence}%. No single option meets all optimization criteria - review individual trade-offs between cost, time, and operational complexity.`;
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recovery Option Details Dialog - Full Implementation */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-flydubai-blue" />
              Recovery Option Analysis - {selectedOptionDetails?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedOptionDetails && (
            <div className="space-y-6">
              <Tabs
                defaultValue={
                  selectedOptionDetails?.title === "Aircraft Swap - Immediate"
                    ? "aircraft"
                    : "overview"
                }
                className="w-full"
              >
                <TabsList
                  className={`grid w-full ${
                    selectedOptionDetails?.title === "Aircraft Swap - Immediate"
                      ? "grid-cols-6"
                      : "grid-cols-5"
                  }`}
                >
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  {selectedOptionDetails?.title ===
                    "Aircraft Swap - Immediate" && (
                    <TabsTrigger value="aircraft">
                      Alternate Aircraft Options
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="crew">Crew Availability</TabsTrigger>
                  <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="resources-risks">
                    Resources & Risk Assessment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Recovery Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          {selectedOptionDetails.impact_summary}
                        </p>
                        {/* Considerations */}
                        {selectedOptionDetails.considerations &&
                          Array.isArray(selectedOptionDetails.considerations) &&
                          selectedOptionDetails.considerations.length > 0 && (
                            <div className="p-3 bg-yellow-50 rounded-lg mb-4 border border-yellow-200">
                              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                                Key Considerations
                              </h4>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {selectedOptionDetails.considerations.map(
                                  (consideration, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                      {consideration}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">
                            Flight Context
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Aircraft:</span>{" "}
                              <span className="font-medium ml-1">
                                {flight?.aircraft}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Route:</span>{" "}
                              <span className="font-medium ml-1">
                                {flight?.origin} → {flight?.destination}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Passengers:</span>{" "}
                              <span className="font-medium ml-1">
                                {flight?.passengers}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Disruption:</span>{" "}
                              <span className="font-medium ml-1">
                                {flight?.categorization}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Confidence Score:
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={selectedOptionDetails.confidence}
                              className="w-16 h-2"
                            />
                            <Badge className="bg-green-100 text-green-800">
                              {selectedOptionDetails.confidence}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Cost:
                          </span>
                          <span className="font-semibold text-flydubai-orange">
                            {selectedOptionDetails.cost}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Implementation Time:
                          </span>
                          <span className="font-medium">
                            {selectedOptionDetails.timeline}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Impact Level:
                          </span>
                          <Badge
                            className={getRiskBadgeStyle(
                              selectedOptionDetails.status,
                            )}
                          >
                            {selectedOptionDetails.impact}
                          </Badge>
                        </div>

                        {/* Additional Metrics from API data */}
                        {selectedOptionDetails.metrics && (
                          <>
                            {selectedOptionDetails.metrics.otpScore && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  OTP Score:
                                </span>
                                <span className="font-medium">
                                  {selectedOptionDetails.metrics.otpScore}%
                                </span>
                              </div>
                            )}
                            {selectedOptionDetails.metrics.networkImpact && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Network Impact:
                                </span>
                                <Badge
                                  className={getRiskBadgeStyle(
                                    selectedOptionDetails.metrics.networkImpact,
                                  )}
                                >
                                  {selectedOptionDetails.metrics.networkImpact}
                                </Badge>
                              </div>
                            )}
                            {selectedOptionDetails.metrics.delayMinutes !==
                              undefined && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Expected Delay:
                                </span>
                                <span className="font-medium">
                                  {selectedOptionDetails.metrics.delayMinutes}{" "}
                                  min
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="aircraft" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Plane className="h-4 w-4 text-flydubai-blue" />
                        Available Aircraft Options -{" "}
                        {selectedOptionDetails?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOptionDetails?.rotation_plan?.aircraftOptions
                        ?.length > 0 ? (
                        <div className="space-y-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Aircraft Reg</TableHead>
                                <TableHead>Type/Config</TableHead>
                                <TableHead>ETOPS Capability</TableHead>
                                <TableHead>Cabin Match</TableHead>
                                <TableHead>Availability</TableHead>
                                <TableHead>Assigned Elsewhere</TableHead>
                                <TableHead>Turnaround</TableHead>
                                <TableHead>Maintenance</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedOptionDetails.rotation_plan.aircraftOptions.map(
                                (aircraft, index) => {
                                  const isDefault = index === 0;
                                  const isSelected =
                                    selectedAircraftFlight === index ||
                                    (selectedAircraftFlight === null &&
                                      isDefault);
                                  return (
                                    <TableRow
                                      key={index}
                                      className={`cursor-pointer hover:bg-blue-50 ${
                                        isSelected
                                          ? "bg-blue-100 border-l-4 border-flydubai-blue"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        setSelectedAircraftFlight(index)
                                      }
                                    >
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                          {aircraft.reg || aircraft.aircraft}
                                          {isDefault && (
                                            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                              Default Assigned
                                            </Badge>
                                          )}
                                          {isSelected && !isDefault && (
                                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                              Selected
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {aircraft.type || "B737-800 (189Y)"}
                                      </TableCell>
                                      <TableCell>
                                        {aircraft.etops?.status ===
                                        "available" ? (
                                          <div className="flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                              {aircraft.etops.value || "180min"}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">
                                              Reduced
                                            </span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {aircraft.cabinMatch?.status ===
                                        "exact" ? (
                                          <div className="flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                              Exact
                                            </span>
                                          </div>
                                        ) : aircraft.cabinMatch?.status ===
                                          "similar" ? (
                                          <div className="flex items-center gap-1">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            <span className="text-yellow-600">
                                              Similar
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">
                                              Reduced
                                            </span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <span
                                          className={
                                            aircraft.availability?.includes(
                                              "Available",
                                            )
                                              ? "text-green-600"
                                              : "text-blue-600"
                                          }
                                        >
                                          {aircraft.availability ||
                                            "Available Now"}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        {aircraft.assigned?.status ===
                                        "none" ? (
                                          <div className="flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                              None
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">
                                              {aircraft.assigned?.value ||
                                                "FZ892"}
                                            </span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {aircraft.turnaround ||
                                          aircraft.turnaroundTime ||
                                          "45 min"}
                                      </TableCell>
                                      <TableCell>
                                        {aircraft.maintenance?.status ===
                                        "current" ? (
                                          <div className="flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                              Current
                                            </span>
                                          </div>
                                        ) : aircraft.maintenance?.status ===
                                          "due" ? (
                                          <div className="flex items-center gap-1">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            <span className="text-yellow-600">
                                              Due A-Check
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-red-600">
                                              AOG
                                            </span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          size="sm"
                                          variant={
                                            isSelected ? "default" : "outline"
                                          }
                                          className={
                                            isSelected
                                              ? "bg-flydubai-blue hover:bg-flydubai-blue/90 text-white"
                                              : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                                          }
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAircraftFlight(index);
                                          }}
                                        >
                                          {isSelected
                                            ? "Selected"
                                            : "Change to This"}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                },
                              )}
                            </TableBody>
                          </Table>

                          {/* Selected Aircraft Summary */}
                          {(selectedAircraftFlight !== null ||
                            selectedOptionDetails.rotation_plan.aircraftOptions
                              .length > 0) && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-medium text-blue-800 mb-2">
                                Selected Aircraft Summary
                              </h4>
                              {(() => {
                                const selectedIndex =
                                  selectedAircraftFlight !== null
                                    ? selectedAircraftFlight
                                    : 0;
                                const selectedAircraft =
                                  selectedOptionDetails.rotation_plan
                                    .aircraftOptions[selectedIndex];
                                return (
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-blue-700 font-medium">
                                        Aircraft:
                                      </span>
                                      <p className="text-blue-900">
                                        {selectedAircraft?.reg ||
                                          selectedAircraft?.aircraft}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-blue-700 font-medium">
                                        Type:
                                      </span>
                                      <p className="text-blue-900">
                                        {selectedAircraft?.type ||
                                          "B737-800 (189Y)"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-blue-700 font-medium">
                                        Turnaround Time:
                                      </span>
                                      <p className="text-blue-900">
                                        {selectedAircraft?.turnaround ||
                                          selectedAircraft?.turnaroundTime ||
                                          "45 min"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-blue-700 font-medium">
                                        Availability:
                                      </span>
                                      <p className="text-blue-900">
                                        {selectedAircraft?.availability ||
                                          "Available Now"}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No alternate aircraft options available</p>
                          <p className="text-xs mt-1">
                            Standard aircraft assignment will be maintained
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="crew" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-flydubai-blue" />
                        Crew Availability - {selectedOptionDetails?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOptionDetails?.rotation_plan?.crew?.length > 0 ||
                      selectedOptionDetails?.rotation_plan?.crewData?.length >
                        0 ? (
                        <div className="space-y-6">
                          {/* Crew Table with Column Layout */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="font-semibold text-flydubai-navy">
                                    Current Crew
                                  </TableHead>
                                  <TableHead className="font-semibold text-flydubai-navy">
                                    Assigned Crew
                                  </TableHead>
                                  <TableHead className="font-semibold text-flydubai-navy">
                                    Status
                                  </TableHead>
                                  <TableHead className="font-semibold text-flydubai-navy">
                                    Swap Action
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(
                                  selectedOptionDetails.rotation_plan.crew ||
                                  selectedOptionDetails.rotation_plan
                                    .crewData ||
                                  []
                                ).map((crewMember, index) => {
                                  const isAffected =
                                    crewMember.status === "Sick" ||
                                    crewMember.status === "Unavailable" ||
                                    crewMember.issue;
                                  const hasBeenSwapped =
                                    crewMember.replacedCrew &&
                                    crewMember.assignedAt;

                                  return (
                                    <TableRow
                                      key={index}
                                      className={`hover:bg-gray-50 ${
                                        isAffected
                                          ? "bg-red-50"
                                          : hasBeenSwapped
                                            ? "bg-blue-50"
                                            : "bg-white"
                                      }`}
                                    >
                                      {/* Current Crew Column */}
                                      <TableCell className="p-4">
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                              <h5 className="font-medium text-gray-900">
                                                {hasBeenSwapped
                                                  ? crewMember.replacedCrew
                                                  : crewMember.name}
                                              </h5>
                                              <p className="text-sm text-gray-600">
                                                {crewMember.role}
                                              </p>
                                              {crewMember.location && (
                                                <p className="text-xs text-gray-500">
                                                  Location:{" "}
                                                  {crewMember?.location}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          {isAffected && crewMember?.issue && (
                                            <div className="text-xs text-red-700 font-medium">
                                              Issue: {crewMember?.issue}
                                            </div>
                                          )}
                                        </div>
                                      </TableCell>

                                      {/* Assigned Crew Column */}
                                      <TableCell className="p-4">
                                        {hasBeenSwapped ? (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <h5 className="font-medium text-blue-900">
                                                {crewMember?.name}
                                              </h5>
                                              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                                Changed
                                              </Badge>
                                            </div>
                                            <p className="text-sm text-blue-600">
                                              {crewMember?.role}
                                            </p>
                                            {crewMember.experience && (
                                              <p className="text-xs text-blue-600">
                                                Experience:{" "}
                                                {crewMember?.experience}
                                              </p>
                                            )}
                                            {crewMember.score && (
                                              <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                                                  <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{
                                                      width: `${crewMember?.score}%`,
                                                    }}
                                                  ></div>
                                                </div>
                                                <span className="text-xs font-medium text-blue-600">
                                                  {crewMember?.score}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        ) : isAffected ? (
                                          <div className="space-y-2">
                                            {(() => {
                                              const currentRole =
                                                crewMember?.role_code;
                                              const availableCrew =
                                                Array.isArray(
                                                  selectedOptionDetails?.crew_available,
                                                )
                                                  ? selectedOptionDetails?.crew_available
                                                  : [];

                                              // Filter replacement crew by role and exclude duplicates
                                              const matchingReplacementCrew =
                                                availableCrew.filter(
                                                  (replacementCrew) => {
                                                    const replacementRole =
                                                      replacementCrew?.role_code;
                                                    const currentCrewNames = (
                                                      selectedOptionDetails
                                                        ?.rotation_plan?.crew ||
                                                      selectedOptionDetails
                                                        ?.rotation_plan
                                                        ?.crewData ||
                                                      []
                                                    )
                                                      .map((c) => c?.name)
                                                      .filter(Boolean);

                                                    // Check if roles match and crew is not already in current/assigned crew
                                                    return (
                                                      replacementRole ===
                                                        currentRole &&
                                                      replacementCrew?.name &&
                                                      !currentCrewNames.includes(
                                                        replacementCrew?.name,
                                                      )
                                                    );
                                                  },
                                                );

                                              // Auto-assign first available crew if not already assigned
                                              if (
                                                !crewMember.autoAssignedReplacement &&
                                                matchingReplacementCrew.length >
                                                  0
                                              ) {
                                                const autoAssignedCrew =
                                                  matchingReplacementCrew[0];

                                                // Auto-assign crew member immediately without useEffect
                                                if (
                                                  selectedOptionDetails &&
                                                  selectedOptionDetails.rotation_plan
                                                ) {
                                                  const updatedCrew = [
                                                    ...(selectedOptionDetails
                                                      .rotation_plan.crew ||
                                                      selectedOptionDetails
                                                        .rotation_plan
                                                        .crewData ||
                                                      []),
                                                  ];
                                                  if (
                                                    !updatedCrew[index]
                                                      .autoAssignedReplacement
                                                  ) {
                                                    updatedCrew[index] = {
                                                      ...updatedCrew[index],
                                                      autoAssignedReplacement:
                                                        autoAssignedCrew,
                                                      replacedCrew:
                                                        crewMember.name,
                                                      name: autoAssignedCrew.name,
                                                      assignedAt:
                                                        new Date().toISOString(),
                                                      isAutoAssigned: true,
                                                    };
                                                    // Delay the update to avoid render cycle issues
                                                    setTimeout(() => {
                                                      setSelectedOptionDetails({
                                                        ...selectedOptionDetails,
                                                        rotation_plan: {
                                                          ...selectedOptionDetails.rotation_plan,
                                                          crew: updatedCrew,
                                                          crewData: updatedCrew,
                                                        },
                                                      });
                                                    }, 0);
                                                  }
                                                }
                                              }

                                              // Display assigned replacement crew
                                              const assignedReplacement =
                                                crewMember.autoAssignedReplacement ||
                                                (crewMember.name !==
                                                crewMember.replacedCrew
                                                  ? matchingReplacementCrew.find(
                                                      (crew) =>
                                                        crew.name ===
                                                        crewMember.name,
                                                    )
                                                  : null);

                                              if (
                                                assignedReplacement ||
                                                matchingReplacementCrew.length >
                                                  0
                                              ) {
                                                const displayCrew =
                                                  assignedReplacement ||
                                                  matchingReplacementCrew[0];
                                                return (
                                                  <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <UserCheck className="h-4 w-4 text-green-600" />
                                                      <span className="text-sm text-green-700 font-medium">
                                                        {assignedReplacement
                                                          ? "Assigned Replacement"
                                                          : "Auto-Assigned"}
                                                      </span>
                                                      {crewMember.isAutoAssigned && (
                                                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                                          Auto
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                                                      <div className="text-sm">
                                                        <h5 className="font-medium text-green-800 mb-1">
                                                          {displayCrew.name}
                                                        </h5>
                                                        <p className="text-green-700 text-xs mb-1">
                                                          {displayCrew?.role}
                                                        </p>
                                                        {displayCrew?.experience_years && (
                                                          <p className="text-green-600 text-xs">
                                                            Experience:{" "}
                                                            {
                                                              displayCrew?.experience_years
                                                            }{" "}
                                                            years
                                                          </p>
                                                        )}
                                                        {displayCrew.location && (
                                                          <p className="text-green-600 text-xs">
                                                            Location:{" "}
                                                            {
                                                              displayCrew?.location
                                                            }
                                                          </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                          <Badge className="bg-green-100 text-green-700 text-xs">
                                                            {
                                                              displayCrew?.status
                                                            }
                                                          </Badge>
                                                          {matchingReplacementCrew.length >
                                                            1 && (
                                                            <Badge
                                                              variant="outline"
                                                              className="text-xs"
                                                            >
                                                              +
                                                              {matchingReplacementCrew.length -
                                                                1}{" "}
                                                              more available
                                                            </Badge>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              } else {
                                                return (
                                                  <div className="flex items-center gap-1">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <span className="text-sm text-red-700 font-medium">
                                                      No replacement available
                                                      for {currentRole}
                                                    </span>
                                                  </div>
                                                );
                                              }
                                            })()}
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                              <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">
                                                  {crewMember?.name}
                                                </h5>
                                                <p className="text-sm text-gray-600">
                                                  {crewMember.role}
                                                </p>
                                                {crewMember?.location && (
                                                  <p className="text-xs text-gray-500">
                                                    Location:{" "}
                                                    {crewMember?.location}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                              Same as current crew (no
                                              violations)
                                            </p>
                                          </div>
                                        )}
                                      </TableCell>

                                      {/* Status Column */}
                                      <TableCell className="p-4">
                                        <div className="space-y-2">
                                          {hasBeenSwapped ||
                                          crewMember.isAutoAssigned ? (
                                            <div className="space-y-2">
                                              {/* Previous crew status (if there was an issue) */}
                                              {/* {crewMember.replacedCrew && (
                                                <div className="p-2 bg-red-50 border border-red-200 rounded">
                                                  <div className="text-xs text-red-700 font-medium mb-1">
                                                    Previous:{" "}
                                                    {crewMember.replacedCrew}
                                                  </div>
                                                  <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                                    {crewMember.issue
                                                      ? "Issue Reported"
                                                      : "Unavailable"}
                                                  </Badge>
                                                  {crewMember.issue && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                      {crewMember.issue}
                                                    </div>
                                                  )}
                                                </div>
                                              )} */}

                                              {/* Current assigned crew status */}
                                              <div className="p-2 bg-green-50 border border-green-200 rounded">
                                                {/* <div className="text-xs text-green-700 font-medium mb-1">
                                                  Current: {crewMember.name}
                                                </div> */}
                                                <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                                                  {crewMember.isAutoAssigned
                                                    ? "Auto-Assigned"
                                                    : "Reassigned"}
                                                </Badge>
                                                <div className="text-xs text-green-600 mt-1">
                                                  Assigned at:{" "}
                                                  {new Date(
                                                    crewMember.assignedAt,
                                                  ).toLocaleTimeString()}
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              <Badge
                                                className={`px-3 py-1 ${
                                                  (crewMember?.status ||
                                                    crewMember?.availability) ===
                                                  "Available"
                                                    ? "bg-green-100 text-green-700 border-green-300"
                                                    : (crewMember?.status ||
                                                          crewMember?.availability) ===
                                                          "Sick" ||
                                                        (crewMember?.status ||
                                                          crewMember?.availability) ===
                                                          "Unavailable"
                                                      ? "bg-red-100 text-red-700 border-red-300"
                                                      : (crewMember?.status ||
                                                            crewMember?.availability) ===
                                                            "On Duty" ||
                                                          (crewMember?.status ||
                                                            crewMember?.availability) ===
                                                            "Reassigned"
                                                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                                        : "bg-gray-100 text-gray-700 border-gray-300"
                                                }`}
                                              >
                                                {crewMember.status ||
                                                  crewMember?.availability}
                                              </Badge>

                                              {isAffected && (
                                                <div className="flex items-center gap-1">
                                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                                  <span className="text-xs text-red-600">
                                                    Needs Attention
                                                  </span>
                                                </div>
                                              )}

                                              {crewMember.issue && (
                                                <div className="text-xs text-red-600 bg-red-50 p-1 rounded border">
                                                  {crewMember.issue}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </TableCell>

                                      {/* Swap Action Column */}
                                      <TableCell className="p-4">
                                        <div className="flex flex-col gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className={`${
                                              hasBeenSwapped ||
                                              crewMember.isAutoAssigned
                                                ? "border-flydubai-orange text-flydubai-orange hover:bg-orange-50"
                                                : isAffected
                                                  ? "border-green-500 text-green-700 hover:bg-green-50"
                                                  : "border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                                            }`}
                                            onClick={() => {
                                              setSelectedCrewForSwap({
                                                ...crewMember,
                                                originalIndex: index,
                                                isEditing:
                                                  hasBeenSwapped ||
                                                  crewMember.isAutoAssigned,
                                                isAutoAssigned:
                                                  crewMember.isAutoAssigned,
                                              });
                                              const currentRole =
                                                crewMember?.role_code;
                                              const filteredCrew =
                                                generateAvailableCrewForRole(
                                                  currentRole,
                                                  crewMember?.name,
                                                );
                                              setAvailableCrewForSwap(
                                                filteredCrew,
                                              );
                                              setShowCrewSwapDialog(true);
                                            }}
                                          >
                                            {hasBeenSwapped ||
                                            crewMember.isAutoAssigned ? (
                                              <>
                                                <Settings className="h-4 w-4 mr-2" />
                                                {crewMember.isAutoAssigned
                                                  ? "Change"
                                                  : "Edit"}
                                              </>
                                            ) : isAffected ? (
                                              <>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Assign
                                              </>
                                            ) : (
                                              <>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Swap
                                              </>
                                            )}
                                          </Button>
                                          {(hasBeenSwapped ||
                                            crewMember.isAutoAssigned) && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="border-gray-300 text-gray-600 hover:bg-gray-50"
                                              onClick={() => {
                                                // Revert swap logic
                                                if (
                                                  selectedOptionDetails &&
                                                  selectedOptionDetails?.rotation_plan
                                                ) {
                                                  const updatedCrew = [
                                                    ...(selectedOptionDetails
                                                      .rotation_plan.crew ||
                                                      selectedOptionDetails
                                                        .rotation_plan
                                                        .crewData ||
                                                      []),
                                                  ];
                                                  updatedCrew[index] = {
                                                    ...updatedCrew[index],
                                                    name:
                                                      crewMember.replacedCrew ||
                                                      crewMember.name,
                                                    status:
                                                      crewMember.status ===
                                                        "Sick" ||
                                                      crewMember.status ===
                                                        "Unavailable"
                                                        ? crewMember.status
                                                        : "Available",
                                                    availability:
                                                      crewMember.status ===
                                                        "Sick" ||
                                                      crewMember.status ===
                                                        "Unavailable"
                                                        ? crewMember.status
                                                        : "Available",
                                                    replacedCrew: undefined,
                                                    assignedAt: undefined,
                                                    autoAssignedReplacement:
                                                      undefined,
                                                    isAutoAssigned: undefined,
                                                  };
                                                  setSelectedOptionDetails({
                                                    ...selectedOptionDetails,
                                                    rotation_plan: {
                                                      ...selectedOptionDetails.rotation_plan,
                                                      crew: updatedCrew,
                                                      crewData: updatedCrew,
                                                    },
                                                  });
                                                }
                                              }}
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Revert
                                            </Button>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Summary Section */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <Card className="bg-green-50 border-green-200">
                              <CardContent className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="font-medium text-green-800">
                                    Available
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-green-900">
                                  {
                                    (
                                      selectedOptionDetails.rotation_plan
                                        .crew ||
                                      selectedOptionDetails.rotation_plan
                                        .crewData ||
                                      []
                                    ).filter(
                                      (crew) =>
                                        crew?.status !== "Sick" &&
                                        crew?.status !== "Unavailable" &&
                                        !crew?.issue &&
                                        !crew?.replacedCrew,
                                    ).length
                                  }
                                </div>
                                <p className="text-xs text-green-600">
                                  Crew members ready
                                </p>
                              </CardContent>
                            </Card>

                            <Card className="bg-orange-50 border-orange-200">
                              <CardContent className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <ArrowRight className="h-5 w-5 text-orange-600" />
                                  <span className="font-medium text-orange-800">
                                    Swapped
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-orange-900">
                                  {
                                    (
                                      selectedOptionDetails.rotation_plan
                                        .crew ||
                                      selectedOptionDetails.rotation_plan
                                        .crewData ||
                                      []
                                    ).filter(
                                      (crew) =>
                                        crew.replacedCrew && crew.assignedAt,
                                    ).length
                                  }
                                </div>
                                <p className="text-xs text-orange-600">
                                  Assignments changed
                                </p>
                              </CardContent>
                            </Card>

                            <Card className="bg-red-50 border-red-200">
                              <CardContent className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                  <span className="font-medium text-red-800">
                                    Affected
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-red-900">
                                  {
                                    (
                                      selectedOptionDetails.rotation_plan
                                        .crew ||
                                      selectedOptionDetails.rotation_plan
                                        .crewData ||
                                      []
                                    ).filter(
                                      (crew) =>
                                        crew?.status === "Sick" ||
                                        crew?.status === "Unavailable" ||
                                        crew?.issue,
                                    ).length
                                  }
                                </div>
                                <p className="text-xs text-red-600">
                                  Crew issues reported
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No crew assignments available</p>
                          <p className="text-xs mt-1">
                            Standard crew assignment will be managed
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="costs" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-flydubai-blue" />
                        Cost Breakdown Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOptionDetails.cost_breakdown &&
                      typeof selectedOptionDetails.cost_breakdown ===
                        "object" &&
                      selectedOptionDetails.cost_breakdown.total ? (
                        <div className="space-y-4">
                          {/* Total Cost Summary */}
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">
                              {selectedOptionDetails.cost_breakdown.total
                                .title || "Total Cost Summary"}
                            </h4>
                            <div className="text-2xl font-bold text-blue-900">
                              {selectedOptionDetails.cost_breakdown.total
                                .amount || selectedOptionDetails.cost}
                            </div>
                            {selectedOptionDetails.cost_breakdown.total
                              .description && (
                              <p className="text-sm text-blue-700 mt-2">
                                {
                                  selectedOptionDetails.cost_breakdown.total
                                    .description
                                }
                              </p>
                            )}
                          </div>

                          {/* Cost Breakdown Items */}
                          {selectedOptionDetails.cost_breakdown.breakdown &&
                            Array.isArray(
                              selectedOptionDetails.cost_breakdown.breakdown,
                            ) &&
                            selectedOptionDetails.cost_breakdown.breakdown.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="space-y-3 p-4 border rounded-lg"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                      {item.category ||
                                        `Cost Item ${index + 1}`}
                                    </span>
                                    <span className="font-semibold text-flydubai-orange">
                                      {item.amount}
                                    </span>
                                  </div>
                                  {item.percentage && (
                                    <>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-flydubai-blue h-2 rounded-full transition-all duration-500"
                                          style={{
                                            width: `${item.percentage}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600">
                                          {item.percentage}% of total cost
                                        </span>
                                        <span className="text-blue-600">
                                          {item.description || "Cost component"}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                  {item.description && !item.percentage && (
                                    <p className="text-xs text-gray-600">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                        </div>
                      ) : selectedOptionDetails.cost_breakdown &&
                        Array.isArray(selectedOptionDetails.cost_breakdown) &&
                        selectedOptionDetails.cost_breakdown.length > 0 ? (
                        <div className="space-y-4">
                          {/* Fallback for old array format */}
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">
                              Total Cost Summary
                            </h4>
                            <div className="text-2xl font-bold text-blue-900">
                              {selectedOptionDetails.cost ||
                                `AED ${selectedOptionDetails.cost_breakdown
                                  .reduce(
                                    (total, item) =>
                                      total +
                                      (typeof item.amount === "string"
                                        ? parseInt(
                                            item.amount.replace(/[^0-9]/g, ""),
                                          )
                                        : item.amount),
                                    0,
                                  )
                                  .toLocaleString()}`}
                            </div>
                          </div>

                          {selectedOptionDetails.cost_breakdown.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="space-y-3 p-4 border rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {item.category ||
                                      item.type ||
                                      `Cost Item ${index + 1}`}
                                  </span>
                                  <span className="font-semibold text-flydubai-orange">
                                    {typeof item.amount === "string"
                                      ? item.amount
                                      : `AED ${item.amount?.toLocaleString()}`}
                                  </span>
                                </div>
                                {item.percentage && (
                                  <>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-flydubai-blue h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${item.percentage}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-gray-600">
                                        {item.percentage}% of total cost
                                      </span>
                                      <span className="text-blue-600">
                                        {item.description ||
                                          item.details ||
                                          "Cost component"}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {item.description && !item.percentage && (
                                  <p className="text-xs text-gray-600">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      ) : selectedOptionDetails.costBreakdown &&
                        selectedOptionDetails.costBreakdown.length > 0 ? (
                        <div className="space-y-4">
                          {/* Fallback to costBreakdown */}
                          {selectedOptionDetails.costBreakdown.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="space-y-3 p-4 border rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {item.category}
                                  </span>
                                  <span className="font-semibold text-flydubai-orange">
                                    {item.amount}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-flydubai-blue h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-600">
                                    {item.percentage}% of total cost
                                  </span>
                                  <span className="text-blue-600">
                                    {item.description}
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Detailed cost breakdown not available.</p>
                          <p className="text-xs mt-1">
                            Total estimated cost: {selectedOptionDetails.cost}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-flydubai-blue" />
                        Implementation Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOptionDetails.timelineDetails &&
                      selectedOptionDetails.timelineDetails.length > 0 ? (
                        <div className="space-y-4">
                          {selectedOptionDetails.timelineDetails.map(
                            (step, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-4 p-4 border rounded-lg"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                      step.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : step.status === "in-progress"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  {index <
                                    selectedOptionDetails.timelineDetails
                                      .length -
                                      1 && (
                                    <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-sm">
                                        {step.step}
                                      </h4>
                                      <p className="text-sm text-gray-700">
                                        {step.details}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <Badge
                                        variant="outline"
                                        className="text-xs mb-1"
                                      >
                                        {step.duration}
                                      </Badge>
                                      <div className="text-xs text-gray-500">
                                        {step.startTime} - {step.endTime}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>
                            Timeline details will be generated when recovery
                            plan is activated.
                          </p>
                          <p className="text-xs mt-1">
                            Estimated duration: {selectedOptionDetails.timeline}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources-risks" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4 text-flydubai-blue" />
                          Resource Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOptionDetails.resourceRequirements &&
                        selectedOptionDetails.resourceRequirements.length >
                          0 ? (
                          <div className="space-y-4">
                            {selectedOptionDetails.resourceRequirements.map(
                              (resource, index) => (
                                <div
                                  key={index}
                                  className="p-3 border rounded-lg"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-sm">
                                        {resource.title || resource.type}
                                      </h4>
                                      <p className="text-xs text-gray-600">
                                        {resource.subtitle || resource.resource}
                                      </p>
                                    </div>
                                    <Badge
                                      className={
                                        resource.availability === "Available" ||
                                        resource.availability === "Ready"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {resource.availability}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <div>
                                      <strong>Location:</strong>{" "}
                                      {resource.location}
                                    </div>
                                    <div>
                                      <strong>ETA:</strong> {resource.eta}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <Users className="h-6 w-6 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">
                              Standard resources allocated
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-flydubai-blue" />
                          Risk Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedOptionDetails.riskAssessment &&
                        selectedOptionDetails.riskAssessment.length > 0 ? (
                          <div className="space-y-4">
                            {selectedOptionDetails.riskAssessment.map(
                              (riskItem, index) => (
                                <div
                                  key={index}
                                  className="p-3 border rounded-lg"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-sm">
                                      {riskItem.risk}
                                    </h4>
                                    <Badge
                                      className={getRiskColor(
                                        riskItem.riskImpact ||
                                          riskItem.probability,
                                      )}
                                      variant="outline"
                                    >
                                      {riskItem.riskImpact ||
                                        riskItem.probability}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-700">
                                    <strong>Mitigation:</strong>{" "}
                                    {riskItem.mitigation}
                                  </p>
                                  {riskItem.score && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      Risk Score: {riskItem.score}/10
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">
                              Standard risk procedures apply
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Rotation Plan Dialog - Full Implementation */}
      <Dialog open={showRotationDialog} onOpenChange={setShowRotationDialog}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-6 w-6 text-flydubai-blue" />
              Rotation Impact -{" "}
              {selectedOptionDetails?.title || "Recovery Option"}
            </DialogTitle>
            <div className="text-base text-muted-foreground">
              Disruption Type:{" "}
              {flight?.categorization ===
              "Aircraft technical issue (e.g., AOG, maintenance)"
                ? "AOG"
                : flight?.categorization ===
                    "Weather disruption (e.g., storms, fog)"
                  ? "Weather"
                  : flight?.categorization ===
                      "Crew issue (e.g., sick report, duty time breach)"
                    ? "Crew Issue"
                    : flight?.categorization ===
                        "Air traffic control restrictions"
                      ? "ATC"
                      : "Operational"}
              | Date:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              | Original Aircraft: {flight?.aircraft}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
            <Tabs defaultValue="rotation" className="w-full">
              <TabsList
                className={`grid w-full ${selectedOptionDetails?.impact_area?.includes("crew") ? "grid-cols-3" : "grid-cols-2"} mb-6`}
              >
                <TabsTrigger value="rotation">
                  Rotation & Ops Impact
                </TabsTrigger>
                {selectedOptionDetails?.impact_area?.includes("crew") && (
                  <TabsTrigger value="crew-impact">Crew Impact</TabsTrigger>
                )}
                <TabsTrigger value="cost">Cost & Delay Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="rotation" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5 text-flydubai-blue" />
                        Impacted Flights -{" "}
                        {selectedOptionDetails?.title || "Recovery Option"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rotationPlanDetails?.impactedFlights?.length > 0 ? (
                          rotationPlanDetails.impactedFlights.map(
                            (sector, index) => (
                              <div
                                key={index}
                                className={`p-3 border-l-4 rounded-lg ${
                                  sector.impact === "High Impact" ||
                                  sector.status === "Cancelled"
                                    ? "border-red-500 bg-red-50"
                                    : sector.impact === "Medium Impact" ||
                                        sector.status === "Delayed"
                                      ? "border-yellow-500 bg-yellow-50"
                                      : "border-green-500 bg-green-50"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {sector.flight || sector.flightNumber}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Departure: {sector.departure}
                                      {sector.delay &&
                                        ` (Delayed by ${sector.delay})`}
                                    </p>
                                    {sector.passengers && (
                                      <p className="text-xs text-gray-500">
                                        Passengers: {sector.passengers}
                                      </p>
                                    )}
                                    {sector.reason && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {sector.reason}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {sector.impact && (
                                      <Badge
                                        className={
                                          sector.impact === "High Impact"
                                            ? "bg-red-100 text-red-700"
                                            : sector.impact === "Medium Impact"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-green-100 text-green-700"
                                        }
                                      >
                                        {sector.impact}
                                      </Badge>
                                    )}
                                    {sector.status && (
                                      <Badge
                                        variant="outline"
                                        className={
                                          sector.status === "Cancelled"
                                            ? "border-red-300 text-red-700"
                                            : sector.status === "Delayed"
                                              ? "border-yellow-300 text-yellow-700"
                                              : "border-green-300 text-green-700"
                                        }
                                      >
                                        {sector.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <Route className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No downstream flight impacts identified</p>
                            <p className="text-xs mt-1">
                              This recovery option has minimal network
                              disruption
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-flydubai-blue" />
                        Operational Constraints
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Gate Compatibility
                          </label>
                          <div className="mt-2 p-3 rounded-lg bg-green-50">
                            <p className="text-sm flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              All gates compatible with aircraft type
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Slot Capacity
                          </label>
                          <div className="mt-2 p-3 rounded-lg bg-yellow-50">
                            <p className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              Coordination required for new departure slot
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Passenger Connections
                          </label>
                          <div className="mt-2 p-3 rounded-lg bg-green-50">
                            <p className="text-sm flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              No significant connection issues
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="crew-impact" className="space-y-4">
                {selectedOptionDetails?.impact_area?.includes("crew") && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-flydubai-blue" />
                          Violated Crew Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {(rotationPlanDetails?.crew || [])
                            .filter(
                              (crew) =>
                                crew.status === "Sick" ||
                                crew.status === "Unavailable" ||
                                crew.issue,
                            )
                            .map((violatedCrew, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4 bg-red-50 border-red-200"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                  <div>
                                    <span className="text-sm font-medium text-red-700">
                                      Name:
                                    </span>
                                    <p className="text-red-900">
                                      {violatedCrew.name}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-red-700">
                                      Experience:
                                    </span>
                                    <p className="text-red-900">
                                      {violatedCrew.experience || "8 years"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-red-700">
                                      Location:
                                    </span>
                                    <p className="text-red-900">
                                      {violatedCrew.location || "DXB"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-red-700">
                                      Score:
                                    </span>
                                    <p className="text-red-900">
                                      {violatedCrew.score || "85"}/100
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-red-700">
                                      Status:
                                    </span>
                                    <Badge className="bg-red-100 text-red-800 border-red-300">
                                      {violatedCrew.status ||
                                        violatedCrew.availability}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Affected Pairing Information Accordion */}
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-red-800 mb-3">
                                    Affected Pairing Information
                                  </h4>
                                  <div className="space-y-2">
                                    {/* High Priority Pairing */}
                                    <div className="border border-red-300 rounded-lg">
                                      <div
                                        className="p-3 bg-red-100 cursor-pointer hover:bg-red-150 flex items-center justify-between"
                                        onClick={() => {
                                          const element =
                                            document.getElementById(
                                              `high-${index}`,
                                            );
                                          element.style.display =
                                            element.style.display === "none"
                                              ? "block"
                                              : "none";
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Badge className="bg-red-200 text-red-800 text-xs">
                                            High Priority
                                          </Badge>
                                          <span className="text-sm font-medium text-red-800">
                                            Critical Pairing Impact
                                          </span>
                                        </div>
                                        <span className="text-red-600">▼</span>
                                      </div>
                                      <div
                                        id={`high-${index}`}
                                        className="p-3 border-t border-red-200 bg-white"
                                        style={{ display: "none" }}
                                      >
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Pairing Number:
                                            </span>
                                            <p className="text-gray-900">
                                              FZ-P-001
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Date:
                                            </span>
                                            <p className="text-gray-900">
                                              {new Date().toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Sector:
                                            </span>
                                            <p className="text-gray-900">
                                              DXB → BOM → DXB
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Medium Priority Pairing */}
                                    <div className="border border-yellow-300 rounded-lg">
                                      <div
                                        className="p-3 bg-yellow-100 cursor-pointer hover:bg-yellow-150 flex items-center justify-between"
                                        onClick={() => {
                                          const element =
                                            document.getElementById(
                                              `medium-${index}`,
                                            );
                                          element.style.display =
                                            element.style.display === "none"
                                              ? "block"
                                              : "none";
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Badge className="bg-yellow-200 text-yellow-800 text-xs">
                                            Medium Priority
                                          </Badge>
                                          <span className="text-sm font-medium text-yellow-800">
                                            Moderate Pairing Impact
                                          </span>
                                        </div>
                                        <span className="text-yellow-600">
                                          ▼
                                        </span>
                                      </div>
                                      <div
                                        id={`medium-${index}`}
                                        className="p-3 border-t border-yellow-200 bg-white"
                                        style={{ display: "none" }}
                                      >
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Pairing Number:
                                            </span>
                                            <p className="text-gray-900">
                                              FZ-P-002
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Date:
                                            </span>
                                            <p className="text-gray-900">
                                              {new Date(
                                                Date.now() +
                                                  24 * 60 * 60 * 1000,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Sector:
                                            </span>
                                            <p className="text-gray-900">
                                              DXB → KWI → DXB
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Low Priority Pairing */}
                                    <div className="border border-green-300 rounded-lg">
                                      <div
                                        className="p-3 bg-green-100 cursor-pointer hover:bg-green-150 flex items-center justify-between"
                                        onClick={() => {
                                          const element =
                                            document.getElementById(
                                              `low-${index}`,
                                            );
                                          element.style.display =
                                            element.style.display === "none"
                                              ? "block"
                                              : "none";
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Badge className="bg-green-200 text-green-800 text-xs">
                                            Low Priority
                                          </Badge>
                                          <span className="text-sm font-medium text-green-800">
                                            Minor Pairing Impact
                                          </span>
                                        </div>
                                        <span className="text-green-600">
                                          ▼
                                        </span>
                                      </div>
                                      <div
                                        id={`low-${index}`}
                                        className="p-3 border-t border-green-200 bg-white"
                                        style={{ display: "none" }}
                                      >
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Pairing Number:
                                            </span>
                                            <p className="text-gray-900">
                                              FZ-P-003
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Date:
                                            </span>
                                            <p className="text-gray-900">
                                              {new Date(
                                                Date.now() +
                                                  48 * 60 * 60 * 1000,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">
                                              Sector:
                                            </span>
                                            <p className="text-gray-900">
                                              DXB → MCT → DXB
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {/* Show message if no violated crew */}
                          {!(rotationPlanDetails?.crew || []).some(
                            (crew) =>
                              crew.status === "Sick" ||
                              crew.status === "Unavailable" ||
                              crew.issue,
                          ) && (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No crew violations identified</p>
                              <p className="text-xs mt-1">
                                All crew members are available and compliant
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cost" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-red-600" />
                        <p className="text-sm font-medium text-red-700">
                          Total Estimated Cost
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-red-800">
                        {rotationPlanDetails?.operationalMetrics
                          ?.estimatedCost ||
                          selectedOptionDetails?.cost ||
                          "$34,200"}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {rotationPlanDetails?.costBreakdown?.operations
                          ? "Including operations"
                          : "Total recovery cost"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm font-medium text-yellow-700">
                          {rotationPlanDetails?.costBreakdown?.operations
                            ? "Operations Cost"
                            : "Delay Impact"}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-800">
                        {rotationPlanDetails?.costBreakdown?.operations
                          ? `$${rotationPlanDetails.costBreakdown.operations.toLocaleString()}`
                          : `${rotationPlanDetails?.operationalMetrics?.totalDelayMinutes || 60} min`}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {rotationPlanDetails?.costBreakdown?.operations
                          ? "Direct operations"
                          : "Total delay time"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-700">
                          {rotationPlanDetails?.costBreakdown?.crew
                            ? "Crew Cost"
                            : "Affected Passengers"}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">
                        {rotationPlanDetails?.costBreakdown?.crew
                          ? `$${rotationPlanDetails.costBreakdown.crew.toLocaleString()}`
                          : rotationPlanDetails?.operationalMetrics
                              ?.passengerImpact ||
                            flight?.passengers ||
                            0}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {rotationPlanDetails?.costBreakdown?.crew
                          ? "Crew expenses"
                          : "Total passengers"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <p className="text-sm font-medium text-orange-700">
                          {rotationPlanDetails?.costBreakdown?.maintenance
                            ? "Maintenance Cost"
                            : "Network Impact"}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-orange-800">
                        {rotationPlanDetails?.costBreakdown?.maintenance
                          ? `$${rotationPlanDetails.costBreakdown.maintenance.toLocaleString()}`
                          : rotationPlanDetails?.operationalMetrics
                              ?.affectedFlights || 0}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        {rotationPlanDetails?.costBreakdown?.maintenance
                          ? "Additional maintenance"
                          : "Flights affected"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-flydubai-blue bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-flydubai-blue" />
                      Decision Support Panel - System Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {rotationPlanDetails?.aircraftRotations?.find(
                      (a) => a.recommended,
                    ) ? (
                      <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="font-medium text-green-800">
                            Recommended Option: Aircraft{" "}
                            {
                              rotationPlanDetails.aircraftRotations.find(
                                (a) => a.recommended,
                              )?.aircraft
                            }
                          </p>
                        </div>
                        <p className="text-sm text-green-700">
                          {selectedOptionDetails?.title} provides optimal
                          balance across cost efficiency, delay minimization,
                          and operational impact.{" "}
                          {rotationPlanDetails.operationalMetrics
                            ? `Expected impact: ${rotationPlanDetails.operationalMetrics.totalDelayMinutes} min delay, ${rotationPlanDetails.operationalMetrics.affectedFlights} flights affected.`
                            : "Immediate availability with minimal network disruption."}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4 p-4 bg-blue-100 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          <p className="font-medium text-blue-800">
                            Analysis for: {selectedOptionDetails?.title}
                          </p>
                        </div>
                        <p className="text-sm text-blue-700">
                          Review operational impact and resource requirements
                          before implementation.
                          {rotationPlanDetails?.operationalMetrics &&
                            `Estimated cost: ${rotationPlanDetails.operationalMetrics.estimatedCost}, passengers affected: ${rotationPlanDetails.operationalMetrics.passengerImpact}.`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-between items-center pt-4 border-t flex-shrink-0 mt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                onClick={() => setShowRotationDialog(false)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Alternate Options
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crew Swap Dialog */}
      <Dialog open={showCrewSwapDialog} onOpenChange={setShowCrewSwapDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-flydubai-blue" />
              Swap Crew Member
              {selectedCrewForSwap &&
                ` - ${selectedCrewForSwap.type || selectedCrewForSwap.role || selectedCrewForSwap?.position}`}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Role: {selectedCrewForSwap?.role}
              {selectedCrewForSwap && selectedCrewForSwap.isEditing && (
                <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-300">
                  Editing Assignment
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedCrewForSwap && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  {selectedCrewForSwap.isEditing
                    ? "Current Assignment"
                    : "Assignment to Replace"}
                  {selectedCrewForSwap.isAutoAssigned && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                      Auto-Assigned
                    </Badge>
                  )}
                </h4>

                {selectedCrewForSwap.isAutoAssigned && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="text-sm font-medium text-yellow-800 mb-2">
                      Original Crew (Violated)
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-yellow-700">Name:</span>
                        <div className="font-medium">
                          {selectedCrewForSwap.replacedCrew}
                        </div>
                      </div>
                      <div>
                        <span className="text-yellow-700">Issue:</span>
                        <div className="font-medium text-red-600">
                          {selectedCrewForSwap.issue || "Duty violation"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">
                      {selectedCrewForSwap.isEditing
                        ? "Current Crew:"
                        : "Crew to Replace:"}
                    </span>
                    <div className="font-medium">
                      {selectedCrewForSwap.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Role:</span>
                    <div className="font-medium">
                      {selectedCrewForSwap.role}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <Badge
                      className={
                        selectedCrewForSwap.status === "Available" ||
                        selectedCrewForSwap.status === "Reassigned"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {selectedCrewForSwap.status ||
                        selectedCrewForSwap.availability}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-blue-700">Location:</span>
                    <div className="font-medium">
                      {selectedCrewForSwap.location || "N/A"}
                    </div>
                  </div>
                  {selectedCrewForSwap.experience && (
                    <div>
                      <span className="text-blue-700">Experience:</span>
                      <div className="font-medium">
                        {selectedCrewForSwap.experience}
                      </div>
                    </div>
                  )}
                  {selectedCrewForSwap.score && (
                    <div>
                      <span className="text-blue-700">Performance Score:</span>
                      <div className="font-medium">
                        {selectedCrewForSwap.score}/100
                      </div>
                    </div>
                  )}
                  {selectedCrewForSwap.isAutoAssigned &&
                    selectedCrewForSwap.assignedAt && (
                      <div className="col-span-2">
                        <span className="text-blue-700">Auto-assigned at:</span>
                        <div className="font-medium text-xs">
                          {new Date(
                            selectedCrewForSwap.assignedAt,
                          ).toLocaleString()}
                        </div>
                      </div>
                    )}
                </div>
                {/* {selectedCrewForSwap.qualifications &&
                  Array.isArray(selectedCrewForSwap.qualifications) && (
                    <div className="mt-3">
                      <span className="text-sm text-blue-700 font-medium">
                        Qualifications:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCrewForSwap.qualifications.map(
                          (qual, qIndex) => (
                            <Badge
                              key={qIndex}
                              variant="outline"
                              className="text-xs bg-white"
                            >
                              {qual.name}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )} */}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Available Crew Members ({selectedCrewForSwap.role})
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {availableCrewForSwap.length} matches found
                  </Badge>
                </div>

                {availableCrewForSwap.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableCrewForSwap.map((crew, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 grid grid-cols-5 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {crew?.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {crew?.role}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Experience
                            </span>
                            <p className="text-sm font-medium text-gray-700">
                              {crew?.experience_years}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Location
                            </span>
                            <p className="text-sm font-medium text-gray-700">
                              {crew?.location || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Score</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-flydubai-blue h-2 rounded-full"
                                  style={{ width: `${crew?.score || 90}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-flydubai-blue">
                                {crew?.score || 90}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col gap-1 mb-2">
                              <Badge
                                className={`text-xs w-fit ${
                                  crew?.availability === "Available"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {crew?.status}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                              onClick={() => {
                                // Update the crew assignment in the selected option details
                                if (
                                  selectedOptionDetails &&
                                  selectedOptionDetails.rotation_plan
                                ) {
                                  const updatedCrew = [
                                    ...(selectedOptionDetails.rotation_plan
                                      .crew ||
                                      selectedOptionDetails.rotation_plan
                                        .crewData ||
                                      []),
                                  ];
                                  const originalIndex =
                                    selectedCrewForSwap.originalIndex;
                                  console.log(originalIndex);

                                  // Update the crew member with swap information
                                  updatedCrew[originalIndex] = {
                                    ...updatedCrew[originalIndex],
                                    name: crew.name,
                                    role: crew.role,
                                    qualifications: crew.qualifications,
                                    experience: crew.experience,
                                    score: crew.score,
                                    location: crew.location,
                                    status: "Reassigned",
                                    availability: "Reassigned",
                                    replacedCrew:
                                      selectedCrewForSwap.replacedCrew ||
                                      (selectedCrewForSwap.isAutoAssigned
                                        ? selectedCrewForSwap.replacedCrew
                                        : selectedCrewForSwap.name),
                                    assignedAt: new Date().toISOString(),
                                    isAutoAssigned: false, // Manual assignment
                                    autoAssignedReplacement: undefined,
                                  };
                                  console.log(
                                    updatedCrew[originalIndex],
                                    "Crew map ",
                                  );

                                  setSelectedOptionDetails({
                                    ...selectedOptionDetails,
                                    rotation_plan: {
                                      ...selectedOptionDetails.rotation_plan,
                                      crew: updatedCrew,
                                      crewData: updatedCrew,
                                    },
                                  });
                                  console.log(selectedOptionDetails, "test11");
                                }

                                // Store the assignment update
                                const assignmentUpdate = {
                                  optionId: selectedOptionDetails?.id,
                                  originalCrew: selectedCrewForSwap,
                                  newCrew: crew,
                                  timestamp: new Date().toISOString(),
                                  reason: selectedCrewForSwap.isEditing
                                    ? "Crew assignment edited via interface"
                                    : "Manual crew swap via interface",
                                  isEdit: selectedCrewForSwap.isEditing,
                                };

                                setShowCrewSwapDialog(false);
                                setSelectedCrewForSwap(null);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              {selectedCrewForSwap.isEditing
                                ? "Update"
                                : "Assign"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No available crew found for this role</p>
                    <p className="text-xs mt-1">
                      All qualified crew members are currently assigned
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCrewSwapDialog(false);
                    setSelectedCrewForSwap(null);
                    setAvailableCrewForSwap([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Execute Confirmation Dialog */}
      <Dialog
        open={showExecuteConfirmDialog}
        onOpenChange={setShowExecuteConfirmDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-flydubai-orange" />
              Confirm Recovery Plan Execution
            </DialogTitle>
          </DialogHeader>

          {optionToConfirm && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  {getConfirmationMessage(optionToConfirm.option)}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExecuteConfirmDialog(false);
                    setOptionToConfirm(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={confirmExecuteOption}
                  className="bg-flydubai-orange hover:bg-flydubai-orange/90 text-white"
                  disabled={executingOption === optionToConfirm?.option?.id}
                >
                  {executingOption === optionToConfirm?.option?.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      OK
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}