"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  Plane,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Wrench,
  Target,
  ArrowRight,
  Eye,
  PlayCircle,
  Settings,
  RotateCw,
  AlertCircle,
  Info,
  Timer,
  Building,
  PhoneCall,
  FileText,
  Zap,
  TrendingUp,
  DollarSign,
  Shield,
  Activity,
  CloudRain,
  Wind,
  Navigation,
  Route,
  Gauge,
  CheckSquare,
  XCircle,
  GitBranch,
  Network,
  Workflow,
  RefreshCw,
  Bell,
  Upload,
  Download,
  Share,
  MapPin,
  Car,
  UserX,
  UserCheck,
  BarChart3,
  Calculator,
  TrendingDown,
  Lightbulb,
  History,
  Star,
  ThumbsUp,
  ThumbsDown,
  Package,
  Edit,
  Save,
  RotateCcw,
  Copy,
  Layers,
  Filter,
  Sliders,
  BarChart2,
} from "lucide-react";

// Import helper functions
import {
  generateRecoveryOptionDetails,
  calculateScenarioImpact,
} from "./what-if-simulation-helpers";
import { CrewTrackingGantt } from "./CrewTrackingGantt";
import { databaseService } from "../services/databaseService";
import {
  getDetailedDescription,
  getCostBreakdown,
  getTimelineDetails,
  getResourceRequirements,
  getRiskAssessment,
  getHistoricalData,
  getAlternativeConsiderations,
  getTechnicalSpecs,
  getStakeholderImpact,
  getEditableParameters,
  getWhatIfScenarios,
} from "./recovery-option-helpers";

import {
  requiresPassengerReaccommodation,
  generateAffectedPassengers,
} from "./passenger-data-helpers";
import { generateScheduleImpactAnalysis } from "./schedule-impact-helpers";

export function RecoveryOptionsGenerator({
  selectedFlight,
  onSelectPlan,
  onCompare,
  onPassengerServices,
  onNavigateToPendingSolutions,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showRotationPlan, setShowRotationPlan] = useState(false);
  const [selectedRotationData, setSelectedRotationData] = useState(null);
  const [scheduleImpactData, setScheduleImpactData] = useState(null);
  const [showRecoveryOptionDetails, setShowRecoveryOptionDetails] =
    useState(false);
  const [selectedOptionForDetails, setSelectedOptionForDetails] =
    useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOption, setEditedOption] = useState(null);
  const [showWhatIfSimulation, setShowWhatIfSimulation] = useState(false);
  const [showCrewTrackingGantt, setShowCrewTrackingGantt] = useState(false);
  const [simulationScenarios, setSimulationScenarios] = useState([]);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [showExecuteConfirmation, setShowExecuteConfirmation] = useState(false);
  const [optionToExecute, setOptionToExecute] = useState(null);
  const [useDatabaseData, setUseDatabaseData] = useState(true); // Use database by default
  const [recoveryOptions, setRecoveryOptions] = useState([]);
  const [recoverySteps, setRecoverySteps] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // Handle both array and single flight selection
  const flight = Array.isArray(selectedFlight)
    ? selectedFlight[0]
    : selectedFlight;

  // Fetch recovery options from database
  useEffect(() => {
    const fetchRecoveryOptions = async () => {
      if (!flight) {
        console.log("No flight selected");
        setRecoveryOptions([]);
        setRecoverySteps([]);
        return;
      }

      // Use flight number as ID if no specific ID exists
      const flightId = flight.id || flight.flightNumber || 'unknown';
      console.log("Processing flight:", flight, "with ID:", flightId);

      if (!useDatabaseData) {
        console.log("Database data disabled, using scenario data");
        setRecoveryOptions([]);
        setRecoverySteps([]);
        return;
      }

      setIsLoadingOptions(true);
      setLoadingError(null);

      try {
        console.log(`Fetching recovery options for flight ID: ${flightId}`);
        
        // Check database connectivity first
        const isHealthy = await databaseService.healthCheck();
        if (!isHealthy) {
          throw new Error("Database connection failed");
        }
        
        // First try to get existing options
        let options = await databaseService.getRecoveryOptions(flightId);
        let steps = await databaseService.getRecoverySteps(flightId);

        console.log(`Found ${options.length} existing options and ${steps.length} steps`);

        // If no options exist, generate them
        if (options.length === 0) {
          console.log("No recovery options found, generating new ones...");
          try {
            const result = await databaseService.generateRecoveryOptions(flightId);
            console.log("Generation result:", result);

            if (result.optionsCount > 0) {
              // Wait a moment and fetch the newly generated options
              await new Promise(resolve => setTimeout(resolve, 1000));
              options = await databaseService.getRecoveryOptions(flightId);
              steps = await databaseService.getRecoverySteps(flightId);
              console.log(`After generation: ${options.length} options, ${steps.length} steps`);
            }
          } catch (generateError) {
            console.error("Error generating recovery options:", generateError);
            // Don't throw here, fall back to scenario data
            console.log("Falling back to scenario data due to generation error");
            setUseDatabaseData(false);
            return;
          }
        }

        // Transform database format to component format
        const transformedOptions = options.map((option, index) => ({
          id: option.id || `option_${index + 1}`,
          title: option.title || `Recovery Option ${index + 1}`,
          description: option.description || "Recovery option description",
          cost: option.cost || "TBD",
          timeline: option.timeline || "TBD",
          confidence: option.confidence || 80,
          impact: option.impact || "Medium impact",
          status: option.status === "generated" ? "recommended" : (option.status || "recommended"),
          advantages: Array.isArray(option.advantages) ? option.advantages : 
                     (typeof option.advantages === 'string' ? JSON.parse(option.advantages) : []),
          considerations: Array.isArray(option.considerations) ? option.considerations : 
                         (typeof option.considerations === 'string' ? JSON.parse(option.considerations) : []),
          metrics: option.metrics || {},
          resourceRequirements: option.resource_requirements || [],
          costBreakdown: option.cost_breakdown || [],
          timelineDetails: option.timeline_details || [],
          riskAssessment: option.risk_assessment || [],
          technicalSpecs: option.technical_specs || {},
          rotationPlan: option.rotation_plan || {},
        }));

        const transformedSteps = steps.map((step) => ({
          step: step.step_number,
          title: step.title,
          status: step.status || "pending",
          timestamp: step.timestamp || new Date().toLocaleTimeString(),
          system: step.system || "AERON System",
          details: step.details || "Processing...",
          data: step.step_data || {},
        }));

        console.log("Setting transformed options:", transformedOptions);
        console.log("Setting transformed steps:", transformedSteps);

        setRecoveryOptions(transformedOptions);
        setRecoverySteps(transformedSteps);
        
        if (transformedOptions.length === 0) {
          setLoadingError("No recovery options available for this disruption type");
        }
      } catch (error) {
        console.error("Error fetching recovery options:", error);
        setLoadingError(error.message || "Failed to load recovery options");
        setRecoveryOptions([]);
        setRecoverySteps([]);
        // Automatically fall back to scenario data on database errors
        console.log("Automatically switching to scenario data due to database error");
        setUseDatabaseData(false);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchRecoveryOptions();
  }, [flight, useDatabaseData]);

  // Early return if no flight is selected
  if (!flight) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-blue">
          <CardContent className="p-8 text-center">
            <Plane className="h-12 w-12 text-flydubai-blue mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">
              No Flight Selected
            </h3>
            <p className="text-muted-foreground">
              Please select a flight from the Affected Flights screen to
              generate recovery options.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Removed redundant fallback function

  // Get scenario-specific recovery data with fallback
  let scenarioData;
  try {
    if (useDatabaseData && recoveryOptions.length > 0 && !isLoadingOptions) {
      // Use database data when available
      scenarioData = {
        title: "Database Recovery Options",
        description: "AI-generated flight recovery analysis",
        priority: "High",
        estimatedTime: "1-3 hours",
        icon: Plane,
        steps: recoverySteps,
        options: recoveryOptions,
      };
    } else {
      // Fallback to scenario-based data when database is disabled, failed, or loading
      console.log("Using fallback scenario data for flight categorization:", flight?.categorization);
      
      // Import scenario recovery functions
      const getScenarioDataForFlight = (categorization) => {
        const generateMockOptions = (type) => {
          console.log("Generating mock options for type:", type);
          switch (type) {
            case 'Aircraft technical issue (e.g., AOG, maintenance)':
              return [
                {
                  id: "AIRCRAFT_SWAP_MOCK",
                  title: "Aircraft Swap - Available Alternative",
                  description: "Immediate tail swap with available aircraft",
                  cost: "AED 45,000",
                  timeline: "75 minutes",
                  confidence: 95,
                  impact: "Minimal passenger disruption",
                  status: "recommended",
                  advantages: ["Same aircraft type", "Available immediately"],
                  considerations: ["Crew briefing required"]
                },
                {
                  id: "DELAY_REPAIR_MOCK",
                  title: "Delay for Repair Completion",
                  description: "Wait for aircraft technical issue resolution",
                  cost: "AED 180,000",
                  timeline: "4-6 hours",
                  confidence: 45,
                  impact: "Significant passenger disruption",
                  status: "caution",
                  advantages: ["Original aircraft maintained"],
                  considerations: ["Repair time uncertain"]
                }
              ];
            case 'Crew issue (e.g., sick report, duty time breach)':
              return [
                {
                  id: "STANDBY_CREW_MOCK",
                  title: "Assign Standby Crew",
                  description: "Activate standby crew member from roster",
                  cost: "AED 8,500",
                  timeline: "30 minutes",
                  confidence: 92,
                  impact: "Minimal operational disruption",
                  status: "recommended",
                  advantages: ["Standby crew available", "Within duty limits"],
                  considerations: ["Extended briefing required"]
                }
              ];
            case 'Weather disruption (e.g., storms, fog)':
              return [
                {
                  id: "DELAY_WEATHER_MOCK",
                  title: "Delay for Weather Clearance",
                  description: "Wait for weather improvement",
                  cost: "AED 25,000",
                  timeline: "2-3 hours",
                  confidence: 90,
                  impact: "Managed schedule delay",
                  status: "recommended",
                  advantages: ["Weather forecast shows improvement"],
                  considerations: ["Dependent on weather"]
                }
              ];
            default:
              return [
                {
                  id: "STANDARD_RECOVERY_MOCK",
                  title: "Standard Recovery Protocol",
                  description: "Apply standard operating procedures",
                  cost: "AED 20,000",
                  timeline: "2-3 hours",
                  confidence: 75,
                  impact: "Standard operational impact",
                  status: "recommended",
                  advantages: ["Proven procedure"],
                  considerations: ["Generic solution"]
                }
              ];
          }
        };

        const result = {
          title: "Scenario Recovery Options",
          description: "Template-based recovery analysis",
          priority: "Medium",
          estimatedTime: "2-4 hours",
          icon: Plane,
          steps: [
            {
              step: 1,
              title: "Disruption Assessment",
              status: "completed",
              timestamp: new Date().toLocaleTimeString(),
              system: "AERON System",
              details: "Analyzing disruption impact",
              data: { type: categorization || "Unknown" }
            }
          ],
          options: generateMockOptions(categorization)
        };
        console.log("Generated scenario data:", result);
        return result;
      };

      scenarioData = getScenarioDataForFlight(flight?.categorization || "Unknown disruption");
    }
  } catch (error) {
    console.error("Error getting scenario data:", error);
    // Final fallback
    scenarioData = {
      title: "Recovery Options",
      description: "Flight recovery analysis",
      priority: "Medium",
      estimatedTime: "2-4 hours",
      icon: Plane,
      steps: [],
      options: [],
    };
  }

  // Ensure scenarioData has required properties with fallbacks
  if (!scenarioData || typeof scenarioData !== "object") {
    scenarioData = {
      title: "Recovery Options",
      description: "Flight recovery analysis",
      priority: "Medium",
      estimatedTime: "2-4 hours",
      icon: Plane,
      steps: recoverySteps || [],
      options: recoveryOptions || [],
    };
  }

  // Ensure steps and options are arrays
  if (!Array.isArray(scenarioData.steps)) {
    scenarioData.steps = recoverySteps || [];
  }
  if (!Array.isArray(scenarioData.options)) {
    scenarioData.options = recoveryOptions || [];
  }

  // Handle edit mode changes
  const handleParameterChange = (paramName, newValue) => {
    setEditedOption((prev) => ({
      ...prev,
      editedParameters: {
        ...prev?.editedParameters,
        [paramName]: newValue,
      },
    }));
  };

  // Handle what-if simulation
  const runWhatIfSimulation = (scenario) => {
    const baseOption = selectedOptionForDetails;
    const editedParams = editedOption?.editedParameters || {};
    const result = calculateScenarioImpact(baseOption, scenario, editedParams);

    setActiveSimulation({
      scenario,
      result,
      baseOption,
      editedParams,
    });
  };

  // Save edited recovery option
  const saveEditedOption = () => {
    // In a real implementation, this would save to backend
    console.log("Saving edited recovery option:", editedOption);
    setIsEditMode(false);
    // You could trigger a refresh of the recovery options here
  };

  // UI Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "recommended":
        return "bg-green-100 text-green-800 border-green-200";
      case "caution":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "warning":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "recommended":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "caution":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "completed_with_cautions":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "standby":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRiskColor = (probability) => {
    switch (probability.toLowerCase()) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Event handlers
  const handleExecuteOption = (option) => {
    setOptionToExecute(option);
    setShowExecuteConfirmation(true);
  };

  const confirmExecuteOption = () => {
    setSelectedOption(optionToExecute);
    setIsExecuting(true);
    setShowExecuteConfirmation(false);

    // Add to pending solutions (simulate adding to pending list)
    const pendingEntry = {
      id: `RP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, "0")}`,
      title: optionToExecute.title,
      flightNumber: flight?.flightNumber,
      route: `${flight?.origin} → ${flight?.destination}`,
      aircraft: flight?.aircraft,
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      submittedBy: "aeron.system@flydubai.com",
      submitterName: "AERON System",
      priority: optionToExecute.status === "recommended" ? "High" : "Medium",
      status: "Pending Approval",
      estimatedCost: parseInt(optionToExecute.cost.replace(/[^0-9]/g, "")) || 0,
      estimatedDelay:
        parseInt(optionToExecute.timeline.replace(/[^0-9]/g, "")) || 0,
      affectedPassengers: flight?.passengers || 0,
      confidence: optionToExecute.confidence,
      disruptionReason: flight?.categorization,
      steps: 4,
      timeline: optionToExecute.timeline,
      approvalRequired: "Operations Manager",
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace("T", " ")
        .substring(0, 19), // 2 hours from now
      timeRemaining: "2h 0m",
      tags: [
        optionToExecute.status === "recommended"
          ? "Recommended"
          : "Alternative",
        "AERON Generated",
      ],
      metrics: {
        successProbability: optionToExecute.confidence,
        customerSatisfaction: 85,
        onTimePerformance: 90,
        costEfficiency: 92,
      },
    };

    // In a real implementation, this would make an API call to add the pending solution
    console.log("Added to pending solutions:", pendingEntry);

    // Simulate execution process
    setTimeout(() => {
      setIsExecuting(false);
      onSelectPlan && onSelectPlan({ ...optionToExecute, flight: flight });

      // Navigate to Pending Solutions after execution completes
      setTimeout(() => {
        onNavigateToPendingSolutions && onNavigateToPendingSolutions();
      }, 500);
    }, 2000);
  };

  const handleViewRotationPlan = (option) => {
    setSelectedRotationData(option);
    const scheduleImpact = generateScheduleImpactAnalysis(
      option,
      flight,
      scenarioData,
    );
    setScheduleImpactData(scheduleImpact);
    setShowRotationPlan(true);
  };

  // Generate rotation plan data based on selected recovery option
  const generateRotationPlanData = (option, flight) => {
    if (!option || !flight) {
      console.warn('Missing option or flight data for rotation plan generation');
      return {
        aircraftOptions: [],
        crewData: [],
        nextSectors: [],
        operationalConstraints: {},
        costBreakdown: {},
        recommendation: { aircraft: 'N/A', reason: 'Data unavailable' }
      };
    }

    const isAircraftSwap =
      option.id?.includes("AIRCRAFT_SWAP") ||
      option.id?.includes("SWAP") ||
      option.title?.includes("Aircraft Swap") ||
      option.title?.includes("Swap");
    const isDelayOption =
      option.id?.includes("DELAY") || 
      option.title?.includes("Delay");
    const isCancellation =
      option.id?.includes("CANCEL") || 
      option.title?.includes("Cancel");
    const isCrewIssue = flight?.categorization?.includes("Crew issue") ||
      flight?.disruptionReason?.includes("crew");
    const isMaintenanceIssue =
      flight?.categorization?.includes("technical issue") ||
      flight?.disruptionReason?.includes("maintenance");
    const isWeatherIssue = flight?.categorization?.includes("Weather") ||
      flight?.disruptionReason?.includes("weather");

    // Aircraft options based on recovery option type
    const aircraftOptions = isAircraftSwap
      ? [
          {
            reg: "A6-FED",
            type: "B737-800 (189Y)",
            etops: { status: "available", value: "180min" },
            cabinMatch: { status: "exact", value: "Exact" },
            availability: "Available Now",
            assigned: { status: "none", value: "None" },
            turnaround: "45 min",
            maintenance: { status: "current", value: "Current" },
            recommended: true,
          },
          {
            reg: "A6-FEL",
            type: "B737-MAX8 (189Y)",
            etops: { status: "available", value: "180min" },
            cabinMatch: { status: "similar", value: "Similar" },
            availability: "Available 14:30",
            assigned: { status: "assigned", value: "FZ892" },
            turnaround: "60 min",
            maintenance: { status: "current", value: "Current" },
            recommended: false,
          },
          {
            reg: "A6-FGH",
            type: "B737-800 (164Y)",
            etops: { status: "available", value: "180min" },
            cabinMatch: { status: "reduced", value: "Reduced" },
            availability: "Available 16:00",
            assigned: { status: "none", value: "None" },
            turnaround: "50 min",
            maintenance: { status: "due", value: "Due A-Check" },
            recommended: false,
          },
          {
            reg: "A6-FIJ",
            type: "B737-MAX8 (189Y)",
            etops: { status: "none", value: "None" },
            cabinMatch: { status: "exact", value: "Exact" },
            availability: "Available 18:00",
            assigned: { status: "assigned", value: "FZ445" },
            turnaround: "75 min",
            maintenance: { status: "aog", value: "AOG Issue" },
            recommended: false,
          },
        ]
      : [
          {
            reg: flight?.aircraft || "A6-FDZ",
            type: "B737-800 (189Y)",
            etops: { status: "available", value: "180min" },
            cabinMatch: { status: "exact", value: "Exact" },
            availability: isDelayOption
              ? `Delayed ${option.timeline || "2h"}`
              : "Original Aircraft",
            assigned: { status: "none", value: "None" },
            turnaround: isDelayOption ? "30 min" : "45 min",
            maintenance: isMaintenanceIssue
              ? { status: "aog", value: "Under Maintenance" }
              : { status: "current", value: "Current" },
            recommended: true,
          },
        ];

    // Crew data based on recovery option
    const crewData = isCrewIssue
      ? [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role: "Captain",
            type: "B737 Type Rating",
            status: "Available",
            issue: "Replacement for fatigued crew",
          },
          {
            name: "FO Sarah Johnson",
            role: "First Officer",
            type: "B737/MAX Type Rating",
            status: "Available",
            issue: null,
          },
          {
            name: "SSCC Lisa Martinez",
            role: "Senior Cabin Crew",
            type: "Senior Cabin Crew",
            status: "Duty Limit 6h",
            issue: "Approaching duty limit",
          },
          {
            name: "CC Maria Santos",
            role: "Cabin Crew",
            type: "Cabin Crew",
            status: "Standby",
            issue: "Standby replacement",
          },
        ]
      : [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role: "Captain",
            type: "B737 Type Rating",
            status: "Available",
            issue: null,
          },
          {
            name: "FO Sarah Johnson",
            role: "First Officer",
            type: "B737/MAX Type Rating",
            status: "Available",
            issue: null,
          },
          {
            name: "SSCC Lisa Martinez",
            role: "Senior Cabin Crew",
            type: "Senior Cabin Crew",
            status: isCancellation ? "Reassigned" : "Available",
            issue: isCancellation ? "Reassigned to FZ891" : null,
          },
          {
            name: "CC Maria Santos",
            role: "Cabin Crew",
            type: "Cabin Crew",
            status: "Available",
            issue: null,
          },
        ];

    // Next sectors impact based on recovery option
    const nextSectors = isAircraftSwap
      ? [
          {
            flight: "FZ456 DXB-BOM",
            departure: "Dep: 18:30 → 19:45 (+75min)",
            impact: "High Impact",
            reason: "Aircraft swap delay",
          },
          {
            flight: "FZ457 BOM-DXB",
            departure: "Dep: 22:15 → 23:00 (+45min)",
            impact: "Medium Impact",
            reason: "Knock-on delay",
          },
          {
            flight: "FZ890 DXB-DEL",
            departure: "Dep: 08:30 (Next Day)",
            impact: "Low Impact",
            reason: "Overnight recovery",
          },
        ]
      : isDelayOption
        ? [
            {
              flight: "FZ456 DXB-BOM",
              departure: `Dep: 18:30 → ${new Date(Date.now() + parseInt(option.timeline.replace(/[^0-9]/g, "")) * 60000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} (+${option.timeline})`,
              impact: "Medium Impact",
              reason: "Direct delay impact",
            },
            {
              flight: "FZ457 BOM-DXB",
              departure: "Dep: 22:15 (On Time)",
              impact: "Low Impact",
              reason: "Sufficient turnaround",
            },
            {
              flight: "FZ890 DXB-DEL",
              departure: "Dep: 08:30 (Next Day)",
              impact: "No Impact",
              reason: "Overnight recovery",
            },
          ]
        : [
            {
              flight: "FZ456 DXB-BOM",
              departure: "Cancelled",
              impact: "High Impact",
              reason: "Flight cancellation",
            },
            {
              flight: "FZ457 BOM-DXB",
              departure: "Cancelled",
              impact: "High Impact",
              reason: "Route cancellation",
            },
            {
              flight: "FZ890 DXB-DEL",
              departure: "Dep: 08:30 (Next Day)",
              impact: "No Impact",
              reason: "Different aircraft",
            },
          ];

    // Operational constraints based on recovery option
    const operationalConstraints = {
      gateCompatibility: {
        status: isAircraftSwap ? "Compatible" : "Original Gate",
        details: isAircraftSwap
          ? "All gates compatible with B737-800"
          : "Same gate assignment maintained",
      },
      slotCapacity: {
        status: isDelayOption
          ? "Coordination Required"
          : isAircraftSwap
            ? "Coordination Required"
            : "No Issues",
        details: isDelayOption
          ? `${flight?.destination || "BOM"} slot coordination required`
          : isAircraftSwap
            ? "New departure slot needed"
            : "Original slots maintained",
      },
      curfewViolation: {
        status:
          isDelayOption &&
          parseInt(option.timeline.replace(/[^0-9]/g, "")) > 180
            ? "Risk"
            : "No Risk",
        details:
          isDelayOption &&
          parseInt(option.timeline.replace(/[^0-9]/g, "")) > 180
            ? `${flight?.destination || "BOM"} arrival may violate 23:00 curfew`
            : "Within curfew limits",
      },
      passengerConnections: {
        status: isCancellation
          ? "Major Impact"
          : isDelayOption
            ? "Affected"
            : "Minimal Impact",
        details: isCancellation
          ? `${flight?.passengers || 167} passengers need rebooking`
          : isDelayOption
            ? `${Math.floor((flight?.passengers || 167) * 0.28)} passengers miss onward connections`
            : "No significant connection issues",
      },
    };

    // Cost breakdown based on recovery option
    const costBreakdown = {
      delayCost: isCancellation
        ? 89200
        : isDelayOption
          ? parseInt(option.timeline.replace(/[^0-9]/g, "")) * 280
          : isAircraftSwap
            ? 34200
            : 5200,
      fuelEfficiency: isAircraftSwap
        ? "+2.1%"
        : isDelayOption
          ? "+0.8%"
          : isCancellation
            ? "N/A"
            : "+0.3%",
      hotelTransport: isCancellation
        ? 24500
        : isDelayOption &&
            parseInt(option.timeline.replace(/[^0-9]/g, "")) > 180
          ? 8450
          : isAircraftSwap
            ? 8450
            : 0,
      eu261Risk: isCancellation
        ? "Critical"
        : isDelayOption &&
            parseInt(option.timeline.replace(/[^0-9]/g, "")) > 180
          ? "High"
          : isAircraftSwap
            ? "Medium"
            : "Low",
    };

    // Decision support recommendation
    const recommendation = {
      aircraft: isAircraftSwap ? "A6-FED" : flight?.aircraft || "A6-FDZ",
      reason: isAircraftSwap
        ? "Optimal balance across cost (92%), delay minimization (88%), crew impact (95%), and fuel efficiency (91%). Immediate availability with exact cabin configuration match."
        : isDelayOption
          ? `Manageable delay impact with ${option.confidence}% confidence. Maintains operational continuity with minimal crew changes.`
          : isCancellation
            ? "Cancellation minimizes further network disruption. Prioritizes passenger re-accommodation and crew availability for alternative flights."
            : "Maintains current operational plan with minimal adjustments required.",
    };

    return {
      aircraftOptions,
      crewData,
      nextSectors,
      operationalConstraints,
      costBreakdown,
      recommendation,
    };
  };

  const handleViewRecoveryOption = (option) => {
    const detailedOption = generateRecoveryOptionDetails(option, flight);
    setSelectedOptionForDetails(detailedOption);
    setEditedOption(detailedOption);
    setIsEditMode(false);
    setShowWhatIfSimulation(false);
    setShowCrewTrackingGantt(false);
    setActiveSimulation(null);
    setShowRecoveryOptionDetails(true);
  };

  const handlePassengerServicesNavigation = (option) => {
    const passengers = generateAffectedPassengers(flight, option);
    const context = {
      flight: flight,
      recoveryOption: option,
      passengers: passengers,
      totalPassengers: flight?.passengers || 167,
      reaccommodationType: option.id?.includes("CANCEL")
        ? "cancellation"
        : option.id?.includes("DELAY")
          ? "delay"
          : option.id?.includes("REROUTE") || option.id?.includes("DIVERT")
            ? "reroute"
            : "general",
    };

    onPassengerServices && onPassengerServices(context);
  };

  return (
    <div className="space-y-6">
      {/* Execute Confirmation Dialog */}
      <Dialog
        open={showExecuteConfirmation}
        onOpenChange={setShowExecuteConfirmation}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-flydubai-orange" />
              Confirm Recovery Plan Execution
            </DialogTitle>
            <DialogDescription>
              Please review the recovery plan details before submitting for
              approval and execution.
            </DialogDescription>
          </DialogHeader>

          {optionToExecute && (
            <div className="space-y-6">
              {/* Recovery Plan Summary */}
              <Card className="border-flydubai-blue bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-flydubai-navy">
                    {optionToExecute.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {optionToExecute.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-flydubai-blue" />
                        <span className="text-sm font-medium">Flight:</span>
                        <span className="text-sm">
                          {flight?.flightNumber} ({flight?.origin}-
                          {flight?.destination})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-flydubai-blue" />
                        <span className="text-sm font-medium">
                          Estimated Cost:
                        </span>
                        <span className="text-sm font-semibold text-flydubai-orange">
                          {optionToExecute.cost}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-flydubai-blue" />
                        <span className="text-sm font-medium">Timeline:</span>
                        <span className="text-sm">
                          {optionToExecute.timeline}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-flydubai-blue" />
                        <span className="text-sm font-medium">Passengers:</span>
                        <span className="text-sm">
                          {flight?.passengers || 0} affected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-flydubai-blue" />
                        <span className="text-sm font-medium">Confidence:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {optionToExecute.confidence}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-flydubai-blue" />
                        <span className="text-sm font-medium">Impact:</span>
                        <span className="text-sm">
                          {optionToExecute.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Process Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong> This recovery plan will be
                  submitted to the pending solutions queue for Operations
                  Manager approval. You will receive a confirmation once the
                  plan is approved and execution begins.
                </AlertDescription>
              </Alert>

              {/* Passenger Re-accommodation Warning */}
              {requiresPassengerReaccommodation(optionToExecute) && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Users className="h-4 w-4 text-orange-6000" />
                  <AlertDescription className="text-orange-800">
                    <strong>Passenger Services Required:</strong> This plan
                    requires passenger re-accommodation services. The Passenger
                    Services team will be automatically notified upon approval.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExecuteConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmExecuteOption}
                  className="btn-flydubai-primary"
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm & Submit for Approval
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crew Tracking Gantt Dialog */}
      <Dialog
        open={showCrewTrackingGantt}
        onOpenChange={setShowCrewTrackingGantt}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-flydubai-blue" />
              Crew Tracking & What-If Analysis
            </DialogTitle>
            <DialogDescription>
              Interactive crew tracking Gantt chart with real-time impact
              analysis for recovery plan modifications
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <CrewTrackingGantt
              recoveryOption={selectedOptionForDetails}
              flight={flight}
              onClose={() => setShowCrewTrackingGantt(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <Card className="border-flydubai-blue">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-flydubai-blue rounded-lg">
                {React.createElement(scenarioData.icon, {
                  className: "h-6 w-6 text-white",
                })}
              </div>
              <div>
                <CardTitle className="text-flydubai-navy">
                  {scenarioData.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {scenarioData.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    className={`priority-${scenarioData.priority.toLowerCase()}`}
                  >
                    {scenarioData.priority} PRIORITY
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    Est. Resolution: {scenarioData.estimatedTime}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {flight?.categorization}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${useDatabaseData && recoveryOptions.length > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                  >
                    {useDatabaseData && recoveryOptions.length > 0
                      ? "Database Generated"
                      : "Scenario Template"}
                  </Badge>
                  {isLoadingOptions && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Loading Options...
                    </Badge>
                  )}
                  {loadingError && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-red-50 text-red-700 border-red-200"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Error Loading
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Flight Information
              </div>
              <div className="font-medium">
                {flight?.flightNumber} • {flight?.origin}-{flight?.destination}
              </div>
              <div className="text-sm text-muted-foreground">
                {flight?.aircraft} • {flight?.passengers} passengers
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recovery Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-flydubai-blue" />
            Recovery Steps ({scenarioData.steps.length}-Step Process)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {scenarioData.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-flydubai-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.step}
                  </div>
                  {index < scenarioData.steps.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                  )}{" "}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStepStatusIcon(step.status)}
                    <h4 className="font-medium">{step.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {step.timestamp}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.details}
                  </p>
                  <div className="text-xs text-flydubai-blue">
                    System: {step.system}
                  </div>
                  {step.data && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(step.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                            :
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-flydubai-blue" />
            Recovery Options
            {useDatabaseData && (
              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  checked={useDatabaseData}
                  onCheckedChange={setUseDatabaseData}
                  disabled={isLoadingOptions}
                />
                <span className="text-sm text-muted-foreground">
                  Database Data
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Error loading recovery options:</strong> {loadingError}.
                Falling back to scenario templates.
              </AlertDescription>
            </Alert>
          )}

          {isLoadingOptions ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 text-flydubai-blue animate-spin mr-2" />
                <span className="text-muted-foreground">
                  {useDatabaseData ? "Generating recovery options..." : "Loading scenario data..."}
                </span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : scenarioData.options.length === 0 ? (
            <div className="text-center p-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Recovery Options Available
              </h3>
              <p className="text-muted-foreground mb-4">
                {loadingError || "No recovery options found for this disruption type. This may be due to insufficient data or configuration."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => {
                    setRecoveryOptions([]);
                    setRecoverySteps([]);
                    setLoadingError(null);
                    // Trigger a refresh
                    const currentFlight = flight;
                    setTimeout(() => {
                      if (currentFlight?.id) {
                        console.log("Retrying recovery options fetch...");
                      }
                    }, 100);
                  }}
                  variant="outline"
                  className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                {useDatabaseData && (
                  <Button
                    onClick={() => setUseDatabaseData(false)}
                    variant="outline"
                    className="border-flydubai-orange text-flydubai-orange hover:bg-orange-50"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Use Scenario Data
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {scenarioData.options.map((option, index) => (
                <Card
                  key={option.id}
                  className={`transition-all hover:shadow-md ${selectedOption?.id === option.id ? "border-flydubai-blue bg-blue-50" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          {getStatusIcon(option.status)}
                          <div className="text-xs font-medium mt-1">
                            {option.confidence}%
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-flydubai-navy">
                            {option.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                          <div className="flex items-center gap-6 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{option.cost}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{option.timeline}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span>{option.impact}</span>
                            </div>
                          </div>

                          {/* Passenger Re-accommodation Alert */}
                          {requiresPassengerReaccommodation(option) && (
                            <Alert className="mt-2 border-orange-200 bg-orange-50">
                              <Users className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-orange-800 text-xs">
                                <strong>
                                  Passenger Re-accommodation Required:
                                </strong>{" "}
                                {flight?.passengers || 167} passengers need
                                rebooking or accommodation services.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(option.status)}>
                          {option.status.toUpperCase()}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-flydubai-blue">
                            {option.confidence}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={() => handleExecuteOption(option)}
                        disabled={isExecuting}
                        className={
                          option.status === "recommended"
                            ? "btn-flydubai-primary"
                            : "btn-flydubai-secondary"
                        }
                      >
                        {isExecuting && selectedOption?.id === option.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Executing...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Execute Option
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleViewRecoveryOption(option)}
                        className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Recovery Option
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleViewRotationPlan(option)}
                        className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Rotation Plan
                      </Button>

                      {/* Passenger Services Button - only show when re-accommodation is needed */}
                      {requiresPassengerReaccommodation(option) && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            handlePassengerServicesNavigation(option)
                          }
                          className="border-orange-500 text-orange-700 hover:bg-orange-50"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Passenger Services
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Recovery Option Details Dialog */}
      <Dialog
        open={showRecoveryOptionDetails}
        onOpenChange={setShowRecoveryOptionDetails}
      >
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-flydubai-blue" />
                  Recovery Option Analysis - {selectedOptionForDetails?.title}
                </DialogTitle>
                <DialogDescription>
                  Comprehensive analysis with edit capabilities and crew
                  tracking what-if simulation
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={isEditMode ? "bg-blue-50 border-blue-300" : ""}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditMode ? "View Mode" : "Edit Mode"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCrewTrackingGantt(true)}
                  className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Crew Tracking & What-If
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedOptionForDetails ? (
            <div className="space-y-6">
              {/* Edit Mode Controls */}
              {isEditMode && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-blue-600" />
                      Recovery Option Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedOptionForDetails.editableParameters || [])?.map(
                        (param, index) => (
                          <div key={index} className="space-y-2">
                            <Label className="text-sm font-medium">
                              {param.name}
                            </Label>
                            <p className="text-xs text-gray-600">
                              {param.description}
                            </p>

                            {param.type === "select" && (
                              <Select
                                value={
                                  editedOption?.editedParameters?.[
                                    param.name
                                  ] || param.value
                                }
                                onValueChange={(value) =>
                                  handleParameterChange(param.name, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(param.options || []).map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {param.type === "slider" && (
                              <div className="space-y-2">
                                <Slider
                                  value={[
                                    editedOption?.editedParameters?.[
                                      param.name
                                    ] || param.value,
                                  ]}
                                  onValueChange={(value) =>
                                    handleParameterChange(param.name, value[0])
                                  }
                                  min={param.min}
                                  max={param.max}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="text-xs text-center">
                                  {editedOption?.editedParameters?.[
                                    param.name
                                  ] || param.value}{" "}
                                  {param.unit}
                                </div>
                              </div>
                            )}

                            {param.type === "switch" && (
                              <Switch
                                checked={
                                  editedOption?.editedParameters?.[
                                    param.name
                                  ] || param.value
                                }
                                onCheckedChange={(checked) =>
                                  handleParameterChange(param.name, checked)
                                }
                              />
                            )}

                            <Badge variant="outline" className="text-xs">
                              Affects: {param.impact}
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditMode(false)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={saveEditedOption}
                        className="btn-flydubai-primary"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
                  <TabsTrigger value="technical">Technical Details</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Enhanced Detailed Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Contextual Recovery Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedOptionForDetails.detailedDescription ||
                            "No detailed description available."}
                        </p>

                        {/* Flight-specific details */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">
                            Flight Context
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Aircraft:</span>
                              <span className="font-medium ml-1">
                                {flight?.aircraft} {flight?.registration}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Route:</span>
                              <span className="font-medium ml-1">
                                {flight?.origin} → {flight?.destination}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Passengers:</span>
                              <span className="font-medium ml-1">
                                {flight?.passengers || 167}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Disruption:</span>
                              <span className="font-medium ml-1">
                                {flight?.disruptionReason || "Technical issue"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Key Metrics */}
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
                              value={selectedOptionForDetails.confidence || 0}
                              className="w-16 h-2"
                            />
                            <Badge className="bg-green-100 text-green-800">
                              {selectedOptionForDetails.confidence || 0}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Cost:
                          </span>
                          <span className="font-semibold text-flydubai-orange">
                            {selectedOptionForDetails.cost || "TBD"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Implementation Time:
                          </span>
                          <span className="font-medium">
                            {selectedOptionForDetails.timeline || "TBD"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Impact Level:
                          </span>
                          <Badge
                            className={getStatusColor(
                              selectedOptionForDetails.status,
                            )}
                          >
                            {selectedOptionForDetails.impact}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Success Rate (Historical):
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {
                              selectedOptionForDetails.historicalData
                                .successRate
                            }
                            %
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="costs" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-flydubai-blue" />
                        Detailed Cost Breakdown Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(selectedOptionForDetails.costBreakdown || []).map(
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
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <div>
                          <span className="font-semibold">
                            Total Estimated Cost:
                          </span>
                          <p className="text-xs text-gray-600">
                            Including all operational expenses
                          </p>
                        </div>
                        <span className="text-xl font-bold text-flydubai-orange">
                          {selectedOptionForDetails.cost}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-flydubai-blue" />
                        Detailed Implementation Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(selectedOptionForDetails.timelineDetails || []).map(
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
                                  (
                                    selectedOptionForDetails.timelineDetails ||
                                    []
                                  ).length -
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
                                    <p className="text-xs text-gray-600">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="h-4 w-4 text-flydubai-blue" />
                        Resource Requirements & Availability
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(
                          selectedOptionForDetails.resourceRequirements || []
                        ).map((resource, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-sm">
                                  {resource.type}
                                </h4>
                                <p className="text-sm text-gray-700">
                                  {resource.resource}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  className={
                                    resource.availability === "Available"
                                      ? "bg-green-100 text-green-800"
                                      : resource.availability === "Confirmed"
                                        ? "bg-blue-100 text-blue-800"
                                        : resource.availability === "En Route"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {resource.availability}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {resource.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>
                                <strong>Location:</strong> {resource.location}
                              </div>
                              <div>
                                <strong>ETA:</strong> {resource.eta}
                              </div>
                              <div>
                                <strong>Details:</strong> {resource.details}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risks" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-flydubai-blue" />
                        Risk Assessment & Mitigation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(selectedOptionForDetails.riskAssessment || []).map(
                          (riskItem, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm">
                                  {riskItem.risk}
                                </h4>
                                <div className="flex gap-2">
                                  <Badge
                                    className={getRiskColor(
                                      riskItem.probability,
                                    )}
                                    variant="outline"
                                  >
                                    {riskItem.probability}
                                  </Badge>
                                  <Badge
                                    className={getRiskColor(riskItem.impact)}
                                    variant="outline"
                                  >
                                    {riskItem.impact}
                                  </Badge>
                                  <Badge
                                    className={`${
                                      riskItem.riskScore <= 2
                                        ? "bg-green-100 text-green-800"
                                        : riskItem.riskScore <= 4
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    Score: {riskItem.riskScore}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">
                                <strong>Mitigation:</strong>{" "}
                                {riskItem.mitigation}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="technical" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4 text-flydubai-blue" />
                        Technical Specifications & Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(
                          selectedOptionForDetails.technicalSpecs,
                        ).map(([key, value]) => (
                          <div key={key} className="p-3 border rounded-lg">
                            <h4 className="font-medium text-sm capitalize mb-2">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </h4>
                            {Array.isArray(value) ? (
                              <ul className="text-sm text-gray-700 space-y-1">
                                {(value || []).map((item, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="w-2 h-2 bg-flydubai-blue rounded-full mt-1.5 flex-shrink-0"></div>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-700">{value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-flydubai-blue animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Loading recovery option details...
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Rotation Plan Dialog */}
      <Dialog open={showRotationPlan} onOpenChange={setShowRotationPlan}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-6 w-6 text-flydubai-blue" />
              View Rotation Plan
            </DialogTitle>
            <DialogDescription className="text-base">
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
                      : "Operational"}{" "}
              | Date:{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              | Original Aircraft: {flight?.aircraft}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto dialog-scrollable">
            <Tabs defaultValue="aircraft" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="aircraft">
                  Alternate Aircraft Options
                </TabsTrigger>
                <TabsTrigger value="crew">
                  Crew Availability & Constraints
                </TabsTrigger>
                <TabsTrigger value="rotation">
                  Rotation & Ops Impact
                </TabsTrigger>
                <TabsTrigger value="cost">Cost & Delay Metrics</TabsTrigger>
              </TabsList>

              {/* Tab 1: Alternate Aircraft Options */}
              <TabsContent value="aircraft" className="space-y-4">
                <Card>
                  {" "}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-flydubai-blue" />
                      Available Aircraft Options - {selectedRotationData?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const rotationData = generateRotationPlanData(
                            selectedRotationData,
                            flight,
                          );
                          if (!rotationData || !rotationData.aircraftOptions) {
                            return (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-500">
                                  No aircraft data available
                                </TableCell>
                              </TableRow>
                            );
                          }

                          return rotationData.aircraftOptions.map(
                            (aircraft, index) => (
                              <TableRow
                                key={index}
                                className={
                                  aircraft.recommended
                                    ? "bg-green-50"
                                    : aircraft.maintenance.status === "aog"
                                      ? "bg-red-50"
                                      : aircraft.assigned.status === "assigned"
                                        ? "bg-yellow-50"
                                        : ""
                                }
                              >
                                <TableCell className="font-medium">
                                  {aircraft.reg}
                                </TableCell>
                                <TableCell>{aircraft.type}</TableCell>
                                <TableCell>
                                  {aircraft.etops.status === "available" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />{" "}
                                      {aircraft.etops.value}
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-red-600" />{" "}
                                      {aircraft.etops.value}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {aircraft.cabinMatch.status === "exact" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />{" "}
                                      {aircraft.cabinMatch.value}
                                    </>
                                  ) : aircraft.cabinMatch.status ===
                                      "similar" ||
                                    aircraft.cabinMatch.status === "reduced" ? (
                                    <>
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />{" "}
                                      {aircraft.cabinMatch.value}
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-red-600" />{" "}
                                      {aircraft.cabinMatch.value}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell>{aircraft.availability}</TableCell>
                                <TableCell>
                                  {aircraft.assigned.status === "none" ? (
                                    <>
                                      <XCircle className="h-4 w-4 text-green-600" />{" "}
                                      {aircraft.assigned.value}
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />{" "}
                                      {aircraft.assigned.value}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell>{aircraft.turnaround}</TableCell>
                                <TableCell>
                                  {aircraft.maintenance.status === "current" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />{" "}
                                      {aircraft.maintenance.value}
                                    </>
                                  ) : aircraft.maintenance.status === "due" ? (
                                    <>
                                      <AlertTriangle className="h-4 w-4 text-yellow-600" />{" "}
                                      {aircraft.maintenance.value}
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-red-600" />{" "}
                                      {aircraft.maintenance.value}
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            ),
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Crew Availability & Constraints */}
              <TabsContent value="crew" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-flydubai-blue" />
                        Assigned/Standby Crew - {selectedRotationData?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const rotationData = generateRotationPlanData(
                            selectedRotationData,
                            flight,
                          );
                          if (!rotationData || !rotationData.crewData) {
                            return (
                              <div className="text-center text-gray-500 p-4">
                                No crew data available
                              </div>
                            );
                          }

                          return rotationData.crewData.map((crew, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                crew.status === "Available"
                                  ? "bg-green-50"
                                  : crew.status.includes("Limit")
                                    ? "bg-yellow-50"
                                    : crew.status === "Reassigned"
                                      ? "bg-blue-50"
                                      : "bg-green-50"
                              }`}
                            >
                              <div>
                                <p className="font-medium">{crew.name}</p>
                                <p className="text-sm text-gray-600">
                                  {crew.type}
                                </p>
                                {crew.issue && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    ⚠️ {crew.issue}
                                  </p>
                                )}
                              </div>
                              <Badge
                                className={
                                  crew.status === "Available"
                                    ? "bg-green-100 text-green-700"
                                    : crew.status.includes("Limit")
                                      ? "bg-yellow-100 text-yellow-700"
                                      : crew.status === "Reassigned"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700"
                                }
                              >
                                {crew.status}
                              </Badge>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-flydubai-blue" />
                        Duty Time & Constraints
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Duty Time Remaining
                          </Label>
                          <Progress value={75} className="mt-2" />
                          <p className="text-xs text-gray-600 mt-1">
                            6h 15m of 8h 20m limit
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Rest Requirement
                          </Label>
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm">
                              Min 12h rest required after duty
                            </p>
                            <p className="text-xs text-gray-600">
                              Next availability: Tomorrow 08:00
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Deadhead Needs
                          </Label>
                          <div className="mt-2 p-3 bg-orange-50 rounded-lg">
                            <p className="text-sm">
                              2 crew members need positioning to DXB
                            </p>
                            <p className="text-xs text-gray-600">
                              Commercial flights available
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Fatigue Report Flags
                          </Label>
                          <div className="mt-2 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              1 crew member reported fatigue
                            </p>
                            <p className="text-xs text-gray-600">
                              Replacement required
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 3: Rotation & Ops Impact */}
              <TabsContent value="rotation" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5 text-flydubai-blue" />
                        Next 3 Sectors Impact - {selectedRotationData?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const rotationData = generateRotationPlanData(
                            selectedRotationData,
                            flight,
                          );
                          if (!rotationData) return null;

                          return rotationData.nextSectors.map(
                            (sector, index) => (
                              <div
                                key={index}
                                className={`p-3 border-l-4 rounded-lg ${
                                  sector.impact === "High Impact"
                                    ? "border-red-500 bg-red-50"
                                    : sector.impact === "Medium Impact"
                                      ? "border-yellow-500 bg-yellow-50"
                                      : sector.impact === "Low Impact"
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-500 bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {sector.flight}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {sector.departure}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {sector.reason}
                                    </p>
                                  </div>
                                  <Badge
                                    className={
                                      sector.impact === "High Impact"
                                        ? "bg-red-100 text-red-700"
                                        : sector.impact === "Medium Impact"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : sector.impact === "Low Impact"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                    }
                                  >
                                    {sector.impact}
                                  </Badge>
                                </div>
                              </div>
                            ),
                          );
                        })()}
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
                        {(() => {
                          const rotationData = generateRotationPlanData(
                            selectedRotationData,
                            flight,
                          );
                          if (!rotationData) return null;

                          return Object.entries(
                            rotationData.operationalConstraints,
                          ).map(([key, constraint]) => (
                            <div key={key}>
                              <Label className="text-sm font-medium flex items-center gap-2">
                                {key === "gateCompatibility" && (
                                  <Building className="h-4 w-4" />
                                )}
                                {key === "slotCapacity" && (
                                  <Calendar className="h-4 w-4" />
                                )}
                                {key === "curfewViolation" && (
                                  <Timer className="h-4 w-4" />
                                )}
                                {key === "passengerConnections" && (
                                  <Users className="h-4 w-4" />
                                )}
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </Label>
                              <div
                                className={`mt-2 p-3 rounded-lg ${
                                  constraint.status.includes("Risk") ||
                                  constraint.status.includes("Major")
                                    ? "bg-red-50"
                                    : constraint.status.includes("Required") ||
                                        constraint.status.includes("Affected")
                                      ? "bg-yellow-50"
                                      : "bg-green-50"
                                }`}
                              >
                                <p className="text-sm flex items-center gap-2">
                                  {constraint.status.includes("Risk") ||
                                  constraint.status.includes("Major") ? (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  ) : constraint.status.includes("Required") ||
                                    constraint.status.includes("Affected") ? (
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                  {constraint.details}
                                </p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 4: Cost & Delay Metrics */}
              <TabsContent value="cost" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const rotationData = generateRotationPlanData(
                      selectedRotationData,
                      flight,
                    );
                    if (!rotationData || !rotationData.costBreakdown) return null;

                    return (
                      <>
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <DollarSign className="h-5 w-5 text-red-600" />
                              <p className="text-sm font-medium text-red-700">
                                Estimated Delay Cost
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-red-800">
                              $
                              {(rotationData.costBreakdown.delayCost || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Including compensation
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Activity className="h-5 w-5 text-yellow-600" />
                              <p className="text-sm font-medium text-yellow-700">
                                Fuel Efficiency Diff
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-yellow-800">
                              {rotationData.costBreakdown.fuelEfficiency}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                              vs original aircraft
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Users className="h-5 w-5 text-blue-600" />
                              <p className="text-sm font-medium text-blue-700">
                                Hotel/Transport Cost
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-blue-800">
                              {rotationData.costBreakdown.hotelTransport === 0
                                ? "N/A"
                                : `$${(rotationData.costBreakdown.hotelTransport || 0).toLocaleString()}`}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Crew accommodation
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                              <p className="text-sm font-medium text-orange-700">
                                EU261 Risk
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-orange-800">
                              {rotationData.costBreakdown.eu261Risk}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              €600 per passenger
                            </p>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>

                {/* Decision Support Panel */}
                <Card className="border-flydubai-blue bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-flydubai-blue" />
                      Decision Support Panel - System Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const rotationData = generateRotationPlanData(
                        selectedRotationData,
                        flight,
                      );
                      if (!rotationData) return null;

                      return (
                        <>
                          <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <p className="font-medium text-green-800">
                                Recommended Option: Aircraft{" "}
                                {rotationData.recommendation.aircraft}
                              </p>
                            </div>
                            <p className="text-sm text-green-700">
                              {rotationData.recommendation.reason}
                            </p>
                          </div>

                          <Table className="mb-4">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Option</TableHead>
                                <TableHead>Cost Score</TableHead>
                                <TableHead>Delay Score</TableHead>
                                <TableHead>Crew Impact</TableHead>
                                <TableHead>Fuel Score</TableHead>
                                <TableHead>Overall</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rotationData.aircraftOptions
                                .slice(0, 3)
                                .map((aircraft, index) => {
                                  const costScore = aircraft.recommended
                                    ? 92
                                    : 78 - index * 13;
                                  const delayScore = aircraft.recommended
                                    ? 88
                                    : 72 - index * 17;
                                  const crewScore = aircraft.recommended
                                    ? 95
                                    : 65 - index * 5;
                                  const fuelScore = aircraft.recommended
                                    ? 91
                                    : 89 - index * 14;
                                  const overallScore = Math.round(
                                    (costScore +
                                      delayScore +
                                      crewScore +
                                      fuelScore) /
                                      4,
                                  );

                                  return (
                                    <TableRow
                                      key={index}
                                      className={
                                        aircraft.recommended
                                          ? "bg-green-50"
                                          : ""
                                      }
                                    >
                                      <TableCell className="font-medium">
                                        {aircraft.reg}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            overallScore >= 85
                                              ? "bg-green-100 text-green-700"
                                              : overallScore >= 70
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {costScore}%
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            overallScore >= 85
                                              ? "bg-green-100 text-green-700"
                                              : overallScore >= 70
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {delayScore}%
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            overallScore >= 85
                                              ? "bg-green-100 text-green-700"
                                              : overallScore >= 70
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {crewScore}%
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            overallScore >= 85
                                              ? "bg-green-100 text-green-700"
                                              : overallScore >= 70
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {fuelScore}%
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            overallScore >= 85
                                              ? "bg-green-100 text-green-700"
                                              : overallScore >= 70
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                          }
                                        >
                                          {overallScore}%
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>

                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Operations Comments
                            </Label>
                            <Input
                              placeholder="Add your comments or override reasoning..."
                              className="w-full"
                            />
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50"
                onClick={() => setShowRotationPlan(false)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Alternate Options
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Attach Maintenance Notes
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Refresh suggestions logic
                  console.log(
                    "Refreshing suggestions for:",
                    selectedRotationData,
                  );
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Suggestions
              </Button>
              <Button
                onClick={() => {
                  console.log(
                    "Confirming rotation plan:",
                    selectedRotationData,
                  );
                  setShowRotationPlan(false);
                }}
                className="btn-flydubai-primary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Apply Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}