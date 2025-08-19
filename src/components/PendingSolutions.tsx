"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
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
  DialogTrigger,
} from "./ui/dialog";
import {
  CheckCircle,
  Clock,
  Users,
  Plane,
  DollarSign,
  AlertTriangle,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  MapPin,
  Target,
  Filter,
  Search,
  RefreshCw,
  Download,
  Send,
  FileText,
  Award,
  Timer,
  UserCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Info,
  ChevronRight,
  Star,
  Shield,
  Phone,
  Mail,
  Clock3,
  Lightbulb,
  Hotel,
  Car,
  UtensilsCrossed,
  PhoneCall,
  Package,
  Building,
  Activity,
  Edit,
} from "lucide-react";
import { databaseService } from "../services/databaseService";

export function PendingSolutions() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedOptionForDetails, setSelectedOptionForDetails] =
    useState(null);
  const [showDetailedOptionAnalysis, setShowDetailedOptionAnalysis] =
    useState(false);
  const [filters, setFilters] = useState({
    priority: "all",
    submitter: "all",
    dateRange: "all",
    flightNumber: "",
    planId: "",
  });
  const [sortBy, setSortBy] = useState("submitted");
  const [sortOrder, setSortOrder] = useState("desc");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      console.log("Fetching pending recovery solutions from database...");
      const data = await databaseService.getPendingRecoverySolutions();
      console.log("Fetched pending solutions:", data);

      if (!data || !Array.isArray(data)) {
        console.warn("Invalid data received:", data);
        setPlans([]);
        return;
      }

      // Remove duplicates based on disruption_id and option_id combination
      const uniqueData = data.reduce((acc, plan) => {
        if (!plan) return acc;

        const key = `${plan.disruption_id || "unknown"}-${plan.option_id || "unknown"}`;
        if (!acc.has(key)) {
          acc.set(key, plan);
        } else {
          // Keep the most recent one if duplicates exist
          const existing = acc.get(key);
          const planDate = new Date(plan.submitted_at || plan.created_at || 0);
          const existingDate = new Date(
            existing.submitted_at || existing.created_at || 0,
          );
          if (planDate > existingDate) {
            acc.set(key, plan);
          }
        }
        return acc;
      }, new Map());

      // Transform the database data to match the expected format
      const transformedPlans = Array.from(uniqueData.values()).map((plan) => ({
        id:
          plan.id ||
          `RP-${new Date().getFullYear()}-${String(plan.id || Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
        title: plan.option_title || plan.title || "Recovery Plan",
        flightNumber: plan.flight_number || "N/A",
        route: plan.route || "N/A",
        aircraft: plan.aircraft || "N/A",
        submittedAt: plan.submitted_at || new Date().toISOString(),
        submittedBy: plan.submitted_by || "system",
        submitterName:
          plan.operations_user || plan.submitted_by || "AERON System",
        priority: plan.severity || "Medium",
        status: plan.status || "Pending Approval",
        estimatedCost: (() => {
          if (typeof plan.estimated_cost === "string") {
            const numericValue = parseInt(
              plan.estimated_cost.replace(/[^0-9]/g, ""),
            );
            return numericValue || 0;
          }
          if (typeof plan.cost === "string") {
            const numericValue = parseInt(plan.cost.replace(/[^0-9]/g, ""));
            return numericValue || 0;
          }
          return plan.estimated_cost || plan.cost || 0;
        })(),
        estimatedDelay:
          plan.delay_minutes ||
          parseInt(plan.timeline?.replace(/[^0-9]/g, "") || "0") ||
          0,
        affectedPassengers: plan.passengers || plan.affected_passengers || 0,
        confidence: plan.confidence || 80,
        disruptionReason: plan.disruption_reason || "N/A",
        timeline: plan.timeline || "TBD",
        approvalRequired: plan.approval_required || "Operations Manager",
        slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        timeRemaining: "2h 0m",
        tags: ["AERON Generated"],
        metrics: {
          successProbability: plan.confidence || 80,
          customerSatisfaction: 85,
          onTimePerformance: 90,
          costEfficiency: 75,
        },
        flightDetails: plan.full_details || {},
        costBreakdown:
          plan.cost_analysis?.breakdown ||
          plan.full_details?.costBreakdown ||
          {},
        recoverySteps:
          plan.recovery_steps || plan.full_details?.recoverySteps || [],
        assignedCrew:
          plan.crew_information || plan.full_details?.assignedCrew || [],
        passengerInformation: plan.passenger_information || [],
        operationsUser: plan.operations_user || "Operations Manager",
        costAnalysis: plan.cost_analysis || {},
        disruptionId: plan.disruption_id,
        optionId: plan.option_id,
        impact: plan.impact || "Moderate", // Added for recovery options
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error("Failed to fetch pending solutions:", error);
      // Try to show cached data or empty array
      setPlans([]);

      // You could add a retry mechanism here
      setTimeout(() => {
        if (plans.length === 0) {
          console.log("Retrying to fetch pending solutions...");
          // Could implement a retry mechanism
        }
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    if (!plan) return false;

    const matchesPriority =
      filters.priority === "all" ||
      (plan.priority && plan.priority.toLowerCase() === filters.priority);
    const matchesSubmitter =
      filters.submitter === "all" ||
      (plan.submittedBy &&
        plan.submittedBy
          .toLowerCase()
          .includes(filters.submitter.toLowerCase()));
    const matchesFlightNumber =
      !filters.flightNumber ||
      (plan.flightNumber &&
        plan.flightNumber
          .toLowerCase()
          .includes(filters.flightNumber.toLowerCase()));
    const matchesPlanId =
      !filters.planId ||
      (plan.id && plan.id.toLowerCase().includes(filters.planId.toLowerCase()));

    // Normalize status for consistent comparison
    const normalizedStatus = plan.status
      ? plan.status.trim().toLowerCase()
      : "pending";

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" &&
        ["pending approval", "under review", "pending"].includes(
          normalizedStatus,
        )) ||
      (activeTab === "approved" && normalizedStatus === "approved") ||
      (activeTab === "rejected" && normalizedStatus === "rejected") ||
      (activeTab === "critical" &&
        (plan.priority === "Critical" || plan.priority === "High"));

    return (
      matchesPriority &&
      matchesSubmitter &&
      matchesFlightNumber &&
      matchesPlanId &&
      matchesTab
    );
  });

  const sortedPlans = filteredPlans.sort((a, b) => {
    if (!a || !b) return 0;

    let aValue, bValue;

    switch (sortBy) {
      case "submitted":
        aValue = new Date(a.submittedAt || 0);
        bValue = new Date(b.submittedAt || 0);
        break;
      case "priority":
        const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case "cost":
        aValue = a.estimatedCost || 0;
        bValue = b.estimatedCost || 0;
        break;
      case "confidence":
        aValue = a.confidence || 0;
        bValue = b.confidence || 0;
        break;
      default:
        aValue = a.submittedAt || 0;
        bValue = b.submittedAt || 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Under Review":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200"; // Added for Pending status
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const getTimeRemainingColor = (timeRemaining) => {
    if (timeRemaining === "OVERDUE") return "text-red-600 font-semibold";
    if (timeRemaining === "Completed") return "text-green-600";
    return "text-orange-600";
  };

  const getCrewStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700";
      case "Near Limit":
        return "bg-yellow-100 text-yellow-700";
      case "Unavailable":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTabCounts = () => {
    return {
      all: plans.length,
      pending: plans.filter((p) => {
        if (!p) return false;
        const status = p.status ? p.status.trim().toLowerCase() : "pending";
        return ["pending approval", "under review", "pending"].includes(status);
      }).length,
      approved: plans.filter((p) => {
        if (!p) return false;
        const status = p.status ? p.status.trim().toLowerCase() : "";
        return status === "approved";
      }).length,
      rejected: plans.filter((p) => {
        if (!p) return false;
        const status = p.status ? p.status.trim().toLowerCase() : "";
        return status === "rejected";
      }).length,
      critical: plans.filter((p) => {
        if (!p) return false;
        return p.priority && ["Critical", "High"].includes(p.priority);
      }).length,
    };
  };

  const tabCounts = getTabCounts();

  const handleApprove = async (planId) => {
    try {
      console.log("Approving plan:", planId);

      // Find the plan to get the disruption ID
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        console.error("Plan not found:", planId);
        return;
      }

      // Update the pending solution in the database using the correct endpoint
      const response = await fetch(
        `/api/pending-recovery-solutions/${planId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Approved" }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update pending solution: ${response.status}`,
        );
      }

      // If there's a disruption ID, also update the flight recovery status
      if (plan.disruptionId) {
        await databaseService.updateFlightRecoveryStatus(
          plan.disruptionId,
          "approved",
        );
      }

      // Update local state immediately for better UX
      setPlans((prevPlans) =>
        prevPlans.map((p) =>
          p.id === planId ? { ...p, status: "Approved" } : p,
        ),
      );

      console.log("Plan approved successfully");
    } catch (error) {
      console.error("Failed to approve plan:", error);
      // Refresh data to ensure consistency even on error
      fetchPlans();
    }
  };

  const handleReject = async (planId) => {
    try {
      console.log("Rejecting plan:", planId);

      // Find the plan to get the disruption ID
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        console.error("Plan not found:", planId);
        return;
      }

      // Update the pending solution in the database using the correct endpoint
      const response = await fetch(
        `/api/pending-recovery-solutions/${planId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Rejected" }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update pending solution: ${response.status}`,
        );
      }

      // If there's a disruption ID, also update the flight recovery status
      if (plan.disruptionId) {
        await databaseService.updateFlightRecoveryStatus(
          plan.disruptionId,
          "rejected",
        );
      }

      // Update local state immediately for better UX
      setPlans((prevPlans) =>
        prevPlans.map((p) =>
          p.id === planId ? { ...p, status: "Rejected" } : p,
        ),
      );

      console.log("Plan rejected successfully");
    } catch (error) {
      console.error("Failed to reject plan:", error);
      // Refresh data to ensure consistency even on error
      fetchPlans();
    }
  };

  const handleExecute = async (plan) => {
    try {
      await databaseService.updateFlightDisruptionStatus(plan.id, "Pending");
      await databaseService.addPendingSolution({
        ...plan,
        status: "Pending",
        flightDetails: plan.flightDetails,
        costBreakdown: plan.costBreakdown,
        recoverySteps: plan.recoverySteps,
        assignedCrew: plan.assignedCrew,
      });
      setPlans(
        plans.map((p) => (p.id === plan.id ? { ...p, status: "Pending" } : p)),
      );
      setSelectedPlan({ ...plan, status: "Pending" });
    } catch (error) {
      console.error("Failed to execute plan:", error);
    }
  };

  const handleViewDetails = async (plan) => {
    setLoadingDetails(plan.id);

    try {
      console.log("Fetching detailed view for plan:", plan.id);

      // Fetch recovery options data for the disruption
      let recoveryOptionsData = null;
      let updatedPlan = null;

      // First try to get recovery options from the disruption
      if (plan.disruptionId) {
        console.log(
          `Fetching recovery options for disruption ${plan.disruptionId}`,
        );
        const recoveryResponse = await fetch(
          `/api/recovery-options/${plan.disruptionId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (recoveryResponse.ok) {
          recoveryOptionsData = await recoveryResponse.json();
          console.log("Found recovery options data:", recoveryOptionsData);
        } else {
          console.log(
            "Recovery options fetch failed, status:",
            recoveryResponse.status,
          );
        }
      }

      // Also fetch the most up-to-date data from pending solutions API
      const response = await fetch(
        `/api/pending-recovery-solutions/${plan.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        updatedPlan = await response.json();
        console.log("Found updated plan data from API:", updatedPlan);
      } else {
        // Fallback to fetching all solutions and finding the one we need
        console.log("Direct API call failed, fetching all solutions...");
        const allSolutions =
          await databaseService.getPendingRecoverySolutions();
        updatedPlan = allSolutions.find((s) => s.id === plan.id);
      }

      if (updatedPlan || recoveryOptionsData) {
        // Find the specific recovery option from the options data
        let matchingOption = null;
        if (
          recoveryOptionsData &&
          Array.isArray(recoveryOptionsData) &&
          plan.optionId
        ) {
          matchingOption = recoveryOptionsData.find(
            (opt) =>
              opt.id === plan.optionId || opt.option_id === plan.optionId,
          );
          console.log("Found matching recovery option:", matchingOption);
        }

        // Parse crew and passenger data from the matching option or find selected option
        let crewData = null;
        let passengerData = null;
        let selectedOption = matchingOption;

        // If no matching option found but we have recovery options, find the selected one by option_id
        if (!selectedOption && recoveryOptionsData && plan.optionId) {
          selectedOption = recoveryOptionsData.find(
            (opt) =>
              opt.id === plan.optionId || opt.option_id === plan.optionId,
          );
          console.log("Found selected option by optionId:", selectedOption);
        }

        if (selectedOption) {
          // Check for crew information in the selected option
          if (
            selectedOption.crew_information ||
            selectedOption.crew_details ||
            selectedOption.resource_requirements?.crew ||
            selectedOption.hotac_requirements
          ) {
            crewData =
              selectedOption.crew_information ||
              selectedOption.crew_details ||
              selectedOption.resource_requirements?.crew ||
              selectedOption.hotac_requirements;
          }

          // Check for passenger information in the selected option
          if (
            selectedOption.passenger_information ||
            selectedOption.passenger_details ||
            selectedOption.passenger_reaccommodation ||
            selectedOption.impact_area?.includes("passenger")
          ) {
            passengerData =
              selectedOption.passenger_information ||
              selectedOption.passenger_details ||
              selectedOption.passenger_reaccommodation;
          }
        }

        // Also check updated plan for crew and passenger data
        if (updatedPlan) {
          if (
            !crewData &&
            (updatedPlan.crew_information ||
              updatedPlan.full_details?.assignedCrew)
          ) {
            crewData =
              updatedPlan.crew_information ||
              updatedPlan.full_details?.assignedCrew;
          }

          if (
            !passengerData &&
            (updatedPlan.passenger_information ||
              updatedPlan.full_details?.passenger_rebooking)
          ) {
            passengerData =
              updatedPlan.passenger_information ||
              updatedPlan.full_details?.passenger_rebooking;
          }
        }

        // Ensure we have the correct option_id for matching
        const finalOptionId = updatedPlan?.option_id || plan.optionId;

        // Transform the updated plan data with proper cost formatting
        const transformedPlan = {
          ...plan,
          title: updatedPlan?.option_title || plan.title,
          status: updatedPlan?.status || plan.status,
          flightDetails: updatedPlan?.full_details || plan.flightDetails || {},
          rotationImpact:
            updatedPlan?.rotation_impact || matchingOption?.rotation_plan || {},
          fullDetails: updatedPlan?.full_details || {},
          costBreakdown:
            updatedPlan?.cost_analysis?.breakdown ||
            updatedPlan?.full_details?.costBreakdown ||
            matchingOption?.cost_breakdown ||
            plan.costBreakdown ||
            {},
          recoverySteps:
            updatedPlan?.recovery_steps ||
            updatedPlan?.full_details?.recoverySteps ||
            plan.recoverySteps ||
            [],
          assignedCrew: crewData || [],
          passengerInformation: passengerData || [],
          operationsUser:
            updatedPlan?.operations_user ||
            plan.operationsUser ||
            "Operations Manager",
          costAnalysis:
            updatedPlan?.cost_analysis ||
            matchingOption?.cost_breakdown ||
            plan.costAnalysis ||
            {},
          impact:
            updatedPlan?.impact ||
            matchingOption?.impact ||
            plan.impact ||
            "Moderate",
          confidence:
            updatedPlan?.confidence ||
            matchingOption?.confidence ||
            plan.confidence ||
            80,
          // Store recovery options for the overview tab
          recoveryOptions: recoveryOptionsData || [],
          matchingOption: selectedOption || matchingOption,
          // Store the option_id from the pending solution for matching
          optionId: finalOptionId,
          // Store flags for conditional tab display
          hasCrewData: !!(
            crewData &&
            (Array.isArray(crewData)
              ? crewData.length > 0
              : Object.keys(crewData).length > 0)
          ),
          hasPassengerData: !!(
            passengerData &&
            (Array.isArray(passengerData)
              ? passengerData.length > 0
              : Object.keys(passengerData).length > 0)
          ),
          // Ensure estimatedCost is properly formatted
          estimatedCost: (() => {
            if (updatedPlan?.cost) {
              if (typeof updatedPlan.cost === "string") {
                const numericValue = parseInt(
                  updatedPlan.cost.replace(/[^0-9]/g, ""),
                );
                return numericValue || plan.estimatedCost || 0;
              }
              return updatedPlan.cost;
            }
            return plan.estimatedCost || 0;
          })(),
        };

        console.log(
          "Transformed plan with recovery options:",
          transformedPlan.recoveryOptions?.length || 0,
          "options, crew data:",
          transformedPlan.hasCrewData,
          "passenger data:",
          transformedPlan.hasPassengerData,
          "optionId for matching:",
          transformedPlan.optionId,
        );

        // Debug log recovery options for matching
        if (transformedPlan.recoveryOptions) {
          transformedPlan.recoveryOptions.forEach((opt, idx) => {
            console.log(`Recovery option ${idx}:`, {
              id: opt.id,
              option_id: opt.option_id,
              title: opt.title,
              matches:
                opt.id === transformedPlan.optionId ||
                opt.option_id === transformedPlan.optionId ||
                String(opt.id) === String(transformedPlan.optionId) ||
                String(opt.option_id) === String(transformedPlan.optionId),
            });
          });
        }
        setSelectedPlan(transformedPlan);
      } else {
        console.log("No updated data found, using current plan data");
        setSelectedPlan(plan);
      }
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      // Fallback to showing the plan with available data if API call fails
      setSelectedPlan(plan);
    } finally {
      setLoadingDetails(null);
    }
  };

  const handleViewOptionDetails = (option, plan) => {
    // Create a detailed option object with all necessary data from API
    const detailedOption = {
      ...option,
      id: option.id || option.option_id || `option_${Date.now()}`,
      title: option.title || plan.title,
      description:
        option.description || "Comprehensive recovery option analysis",
      cost:
        option.cost ||
        `AED ${(option.estimated_cost || plan.estimatedCost || 50000).toLocaleString()}`,
      timeline: option.timeline || plan.timeline || "TBD",
      confidence: option.confidence || plan.confidence || 80,
      impact: option.impact || plan.impact || "Medium",
      flightNumber: plan.flightNumber,
      route: plan.route,
      aircraft: plan.aircraft,
      passengers: plan.affectedPassengers,
      disruptionReason: plan.disruptionReason,

      // Include additional API data
      advantages: option.advantages || [],
      considerations: option.considerations || [],
      resourceRequirements: option.resource_requirements || {},
      costBreakdown: option.cost_breakdown || {},
      timelineDetails: option.timeline_details || {},
      riskAssessment: option.risk_assessment || {},
      technicalSpecs: option.technical_specs || {},
      metrics: option.metrics || {},
      rotationPlan: option.rotation_plan || {},
      impactArea: option.impact_area || [],
      impactSummary: option.impact_summary || "",
      priority: option.priority || 1,
      status: option.status || "available",
    };

    console.log("Setting detailed option for view:", detailedOption);
    setSelectedOptionForDetails(detailedOption);
    setShowDetailedOptionAnalysis(true);
  };

  const refreshPlans = async () => {
    await fetchPlans();
  };

  const formatIST = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Component for detailed recovery option view
  const DetailedRecoveryOptionView = ({ plan }) => {
    const [activeOptionTab, setActiveOptionTab] = useState("overview");
    const [pendingSolutionData, setPendingSolutionData] = useState(null);
    const [loadingPendingData, setLoadingPendingData] = useState(false);

    // Fetch pending solution data when component mounts
    useEffect(() => {
      const fetchPendingSolutionData = async () => {
        if (!plan.id) return;

        setLoadingPendingData(true);
        try {
          // Try to find the pending solution by disruption_id and option_id
          const allPendingSolutions =
            await databaseService.getPendingRecoverySolutions();
          const matchingSolution = allPendingSolutions.find(
            (solution) =>
              solution.disruption_id === plan.disruptionId &&
              solution.option_id === plan.optionId,
          );

          if (matchingSolution) {
            // Fetch detailed data for this specific solution
            const response = await fetch(
              `/api/pending-recovery-solutions/${matchingSolution.id}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              },
            );

            if (response.ok) {
              const detailedData = await response.json();
              setPendingSolutionData(detailedData);
              console.log("Loaded pending solution data:", detailedData);
            }
          }
        } catch (error) {
          console.error("Error fetching pending solution data:", error);
        } finally {
          setLoadingPendingData(false);
        }
      };

      fetchPendingSolutionData();
    }, [plan.id, plan.disruptionId, plan.optionId]);

    // Extract crew and passenger data from pending solution with proper path navigation
    const fullDetails = pendingSolutionData?.full_details || {};
    const crewData =
      fullDetails?.crew_hotel_assignments ||
      pendingSolutionData?.crew_hotel_assignments ||
      plan.assignedCrew ||
      [];

    const passengerImpactData = fullDetails?.passenger_impact || {};
    const passengerRebookingData =
      fullDetails?.passenger_rebooking ||
      pendingSolutionData?.passenger_rebooking ||
      plan.passengerInformation ||
      [];

    const hasCrewData =
      crewData &&
      (Array.isArray(crewData)
        ? crewData.length > 0
        : Object.keys(crewData).length > 0);
    const hasPassengerData =
      (passengerRebookingData &&
        (Array.isArray(passengerRebookingData)
          ? passengerRebookingData.length > 0
          : Object.keys(passengerRebookingData).length > 0)) ||
      (passengerImpactData && Object.keys(passengerImpactData).length > 0);

    return (
      <div className="space-y-6">
        <Tabs value={activeOptionTab} onValueChange={setActiveOptionTab}>
          <div className="w-full overflow-x-auto">
            <TabsList
              className={`grid w-full ${
                plan.hasCrewData && plan.hasPassengerData
                  ? "grid-cols-5"
                  : plan.hasCrewData || plan.hasPassengerData
                    ? "grid-cols-4"
                    : "grid-cols-3"
              }`}
            >
              <TabsTrigger
                value="overview"
                className="whitespace-nowrap px-2 text-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="whitespace-nowrap px-2 text-sm"
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="crew-hotac"
                className="whitespace-nowrap px-2 text-sm"
              >
                Crew & HOTAC
              </TabsTrigger>
              <TabsTrigger
                value="passengers"
                className="whitespace-nowrap px-2 text-sm"
              >
                Passenger Re-accommodation
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="whitespace-nowrap px-2 text-sm"
              >
                Resources
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recovery Option Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Option Type
                    </Label>
                    <div className="font-medium">{plan.title}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Estimated Cost
                    </Label>
                    <div className="font-medium text-flydubai-orange">
                      AED {(plan.estimatedCost || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Timeline
                    </Label>
                    <div className="font-medium">{plan.timeline}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Confidence
                    </Label>
                    <div className="flex items-center gap-2">
                      <Progress value={plan.confidence} className="w-16 h-2" />
                      <span className="font-medium">{plan.confidence}%</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.flightDetails?.description ||
                        plan.title ||
                        "Recovery option to address the flight disruption with minimal impact to operations and passengers."}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Key Benefits</Label>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Minimizes operational disruption</li>
                      <li>• Reduces passenger impact</li>
                      <li>• Cost-effective solution</li>
                      <li>• Quick implementation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recovery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(plan.recoverySteps && plan.recoverySteps.length > 0
                    ? plan.recoverySteps
                    : [
                        {
                          step: 1,
                          title: "Initial Assessment",
                          status: "completed",
                          timestamp: new Date().toLocaleTimeString(),
                          details: "Disruption analysis completed",
                        },
                        {
                          step: 2,
                          title: "Resource Allocation",
                          status: "completed",
                          timestamp: new Date(
                            Date.now() + 15 * 60000,
                          ).toLocaleTimeString(),
                          details:
                            "Required resources identified and allocated",
                        },
                        {
                          step: 3,
                          title: "Implementation",
                          status: "in-progress",
                          timestamp: new Date(
                            Date.now() + 30 * 60000,
                          ).toLocaleTimeString(),
                          details: "Recovery plan execution in progress",
                        },
                        {
                          step: 4,
                          title: "Verification",
                          status: "pending",
                          timestamp: new Date(
                            Date.now() + 45 * 60000,
                          ).toLocaleTimeString(),
                          details: "Final verification and confirmation",
                        },
                      ]
                  ).map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 border rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-flydubai-blue text-white text-sm font-medium">
                        {step.step || index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.title}</h4>
                          <Badge
                            className={
                              step.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : step.status === "in-progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }
                          >
                            {step.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.details}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {step.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crew-hotac" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Crew Assignments & HOTAC Changes
                  {loadingPendingData && (
                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasCrewData ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Crew Data Available
                    </h3>
                    <p className="text-muted-foreground">
                      No crew assignments or HOTAC arrangements have been
                      processed for this recovery option.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Crew Assignment Changes */}
                    <div>
                      <h4 className="font-medium mb-3">
                        Crew Assignment Modifications
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Array.isArray(crewData) ? crewData : [crewData]).map(
                          (crew, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">
                                  {crew.crew_name ||
                                    crew.name ||
                                    (crew.crew_member &&
                                    Array.isArray(crew.crew_member)
                                      ? crew.crew_member
                                          .map((c) => c.name)
                                          .join(", ")
                                      : `Crew Member ${index + 1}`)}
                                </div>
                                <Badge
                                  variant={
                                    crew.assignment_status === "assigned" ||
                                    crew.status === "assigned"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {crew.assignment_status ||
                                    crew.status ||
                                    "Assigned"}
                                </Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Hotel:
                                  </span>
                                  <span>{crew.hotel_name || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Location:
                                  </span>
                                  <span>{crew.hotel_location || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Check-in:
                                  </span>
                                  <span>
                                    {crew.check_in_date
                                      ? formatIST(crew.check_in_date)
                                      : "TBD"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Check-out:
                                  </span>
                                  <span>
                                    {crew.check_out_date
                                      ? formatIST(crew.check_out_date)
                                      : "TBD"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Room:
                                  </span>
                                  <span>{crew.room_number || "TBD"}</span>
                                </div>
                                {crew.total_cost && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Cost:
                                    </span>
                                    <span className="font-medium text-flydubai-orange">
                                      AED {crew.total_cost}
                                    </span>
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2">
                                  Reference: {crew.booking_reference || "N/A"}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Transport Details */}
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">
                        Transport Arrangements
                      </h4>
                      <div className="space-y-4">
                        {(Array.isArray(crewData) ? crewData : [crewData]).map(
                          (crew, index) =>
                            crew.transport_details && (
                              <Card
                                key={index}
                                className="bg-green-50 border-green-200"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Car className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-800">
                                      Transport for{" "}
                                      {crew.crew_name || `Crew ${index + 1}`}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Pickup Location:
                                      </span>
                                      <div className="font-medium">
                                        {crew.transport_details
                                          .pickup_location || "N/A"}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Pickup Time:
                                      </span>
                                      <div className="font-medium">
                                        {crew.transport_details.pickup_time
                                          ? formatIST(
                                              crew.transport_details
                                                .pickup_time,
                                            )
                                          : "TBD"}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Vehicle Type:
                                      </span>
                                      <div className="font-medium">
                                        {crew.transport_details.vehicle_type ||
                                          "Standard"}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Vendor:
                                      </span>
                                      <div className="font-medium">
                                        {crew.transport_details.vendor || "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passengers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Passenger Re-accommodation
                  {loadingPendingData && (
                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasPassengerData ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Passenger Data Available
                    </h3>
                    <p className="text-muted-foreground">
                      No passenger reaccommodation details have been processed
                      for this recovery option.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Passenger Impact Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {passengerImpactData.affected ||
                            (Array.isArray(passengerRebookingData)
                              ? passengerRebookingData.length
                              : 0) ||
                            plan.affectedPassengers ||
                            0}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {passengerImpactData.reaccommodated ||
                            (Array.isArray(passengerRebookingData)
                              ? passengerRebookingData.filter(
                                  (p) => p.rebooking_status === "confirmed",
                                ).length
                              : 0) ||
                            Math.floor(
                              (passengerImpactData.affected ||
                                plan.affectedPassengers ||
                                167) * 0.85,
                            )}
                        </div>
                        <div className="text-sm text-green-700">
                          Reaccommodated
                        </div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {(Array.isArray(passengerRebookingData)
                            ? passengerRebookingData.filter(
                                (p) =>
                                  p.additional_services &&
                                  p.additional_services.some(
                                    (s) => s.service_type === "accommodation",
                                  ),
                              ).length
                            : 0) ||
                            Math.floor(
                              (passengerImpactData.affected ||
                                plan.affectedPassengers ||
                                167) * 0.12,
                            )}
                        </div>
                        <div className="text-sm text-yellow-700">
                          Hotel Accommodation
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {passengerImpactData.compensated ||
                            (Array.isArray(passengerRebookingData)
                              ? passengerRebookingData.filter(
                                  (p) => p.rebooking_cost > 0,
                                ).length
                              : 0) ||
                            Math.floor(
                              (passengerImpactData.affected ||
                                plan.affectedPassengers ||
                                167) * 0.03,
                            )}
                        </div>
                        <div className="text-sm text-orange-700">
                          Compensation Required
                        </div>
                      </div>
                    </div>

                    {/* Individual Passenger Details */}
                    {Array.isArray(passengerRebookingData) &&
                      passengerRebookingData.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">
                            Individual Passenger Rebookings
                          </h4>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {passengerRebookingData
                              .slice(0, 10)
                              .map((passenger, index) => (
                                <Card key={index} className="p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">
                                      {passenger.passenger_name ||
                                        `Passenger ${index + 1}`}
                                    </div>
                                    <Badge
                                      className={
                                        passenger.rebooking_status ===
                                        "confirmed"
                                          ? "bg-green-100 text-green-700"
                                          : passenger.rebooking_status ===
                                              "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700"
                                      }
                                    >
                                      {passenger.rebooking_status ||
                                        "Processed"}
                                    </Badge>
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        PNR:
                                      </span>
                                      <span>{passenger.pnr || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Original Flight:
                                      </span>
                                      <span>
                                        {passenger.original_flight ||
                                          plan.flightNumber}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Rebooked Flight:
                                      </span>
                                      <span>
                                        {passenger.rebooked_flight || "TBD"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Cabin:
                                      </span>
                                      <span>
                                        {passenger.rebooked_cabin || "Economy"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Seat Change:
                                      </span>
                                      <span>
                                        {passenger.original_seat &&
                                        passenger.rebooked_seat
                                          ? `${passenger.original_seat} → ${passenger.rebooked_seat}`
                                          : passenger.rebooked_seat || "TBD"}
                                      </span>
                                    </div>
                                    {passenger.rebooking_cost > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Cost:
                                        </span>
                                        <span className="text-flydubai-orange">
                                          AED {passenger.rebooking_cost}
                                        </span>
                                      </div>
                                    )}
                                    {passenger.additional_services &&
                                      passenger.additional_services.length >
                                        0 && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Services:
                                          </span>
                                          <span className="text-xs">
                                            {passenger.additional_services
                                              .map(
                                                (s) =>
                                                  s.service_type ||
                                                  s.description,
                                              )
                                              .join(", ")}
                                          </span>
                                        </div>
                                      )}
                                    {passenger.notes && (
                                      <div className="text-xs text-muted-foreground mt-2">
                                        Notes: {passenger.notes}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            {passengerRebookingData.length > 10 && (
                              <div className="text-center text-sm text-muted-foreground p-2">
                                ... and {passengerRebookingData.length - 10}{" "}
                                more passengers
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Additional Services Summary */}
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">
                        Additional Services Breakdown
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <UtensilsCrossed className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Meal Vouchers</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(passengerRebookingData)
                              ? passengerRebookingData.filter(
                                  (p) =>
                                    p.additional_services &&
                                    p.additional_services.some(
                                      (s) =>
                                        s.service_type === "meal_voucher" ||
                                        s.description
                                          .toLowerCase()
                                          .includes("meal"),
                                    ),
                                ).length
                              : 0}{" "}
                            passengers provided meal vouchers
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Hotel className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              Hotel Accommodation
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(passengerRebookingData)
                              ? passengerRebookingData.filter(
                                  (p) =>
                                    p.additional_services &&
                                    p.additional_services.some(
                                      (s) =>
                                        s.service_type === "accommodation" ||
                                        s.description
                                          .toLowerCase()
                                          .includes("hotel"),
                                    ),
                                ).length
                              : 0}{" "}
                            passengers provided hotel accommodation
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">
                              Ground Transport
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(passengerRebookingData)
                              ? passengerRebookingData.filter(
                                  (p) =>
                                    p.additional_services &&
                                    p.additional_services.some(
                                      (s) =>
                                        s.service_type === "transport" ||
                                        s.description
                                          .toLowerCase()
                                          .includes("transport"),
                                    ),
                                ).length
                              : 0}{" "}
                            passengers provided ground transport
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-red-600" />
                            <span className="font-medium">
                              Total Rebooking Cost
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            AED{" "}
                            {Array.isArray(passengerRebookingData)
                              ? passengerRebookingData
                                  .reduce(
                                    (sum, p) => sum + (p.rebooking_cost || 0),
                                    0,
                                  )
                                  .toLocaleString()
                              : "0"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Resource Requirements & Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Aircraft Resources */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Aircraft & Ground Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">
                            Alternative Aircraft
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Registration:
                            </span>
                            <span>A6-FEB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>B737-800</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <Badge className="bg-green-100 text-green-700">
                              Available
                            </Badge>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 bg-orange-50 border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">Gate Assignment</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Terminal:
                            </span>
                            <span>Terminal 2</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gate:</span>
                            <span>B3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <Badge className="bg-green-100 text-green-700">
                              Confirmed
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Operational Resources */}
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Operational Support</h4>
                    <div className="space-y-3">
                      {[
                        {
                          resource: "Ground Handling Team",
                          status: "Available",
                          eta: "Immediate",
                          cost: "AED 2,500",
                        },
                        {
                          resource: "Baggage Transfer Service",
                          status: "Confirmed",
                          eta: "30 minutes",
                          cost: "AED 1,800",
                        },
                        {
                          resource: "Catering Services",
                          status: "Arranged",
                          eta: "45 minutes",
                          cost: "AED 3,200",
                        },
                        {
                          resource: "Customer Service Agents",
                          status: "Deployed",
                          eta: "Immediate",
                          cost: "AED 1,500",
                        },
                      ].map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">
                              {resource.resource}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">{resource.status}</Badge>
                            <span className="text-muted-foreground">
                              ETA: {resource.eta}
                            </span>
                            <span className="font-medium text-flydubai-orange">
                              {resource.cost}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Cost Breakdown</h4>
                    <Card className="p-4 bg-gray-50">
                      <div className="space-y-2 text-sm">
                        {selectedPlan.costBreakdown &&
                        Object.keys(selectedPlan.costBreakdown).length > 0 ? (
                          Object.entries(selectedPlan.costBreakdown).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}:
                                </span>
                                <span>
                                  AED{" "}
                                  {typeof value === "object" &&
                                  value &&
                                  typeof value.amount === "number"
                                    ? value.amount.toLocaleString()
                                    : typeof value === "number"
                                      ? value.toLocaleString()
                                      : String(value)}
                                </span>
                              </div>
                            ),
                          )
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Direct Costs:</span>
                              <span>
                                AED{" "}
                                {(
                                  (selectedPlan.estimatedCost || 50000) * 0.6
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Indirect Costs:</span>
                              <span>
                                AED{" "}
                                {(
                                  (selectedPlan.estimatedCost || 50000) * 0.4
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Passenger Compensation:</span>
                              <span>
                                AED{" "}
                                {(
                                  (selectedPlan.estimatedCost || 50000) * 0.3
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Operational Costs:</span>
                              <span>
                                AED{" "}
                                {(
                                  (selectedPlan.estimatedCost || 50000) * 0.7
                                ).toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pending Recovery Solutions</h2>
          <p className="text-muted-foreground">
            Recovery plans submitted for approval and management review
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshPlans}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600">Pending Approval</p>
                <p className="text-2xl font-semibold text-yellow-900">
                  {tabCounts.pending}
                </p>
                <p className="text-xs text-yellow-600">Awaiting decision</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Critical Priority</p>
                <p className="text-2xl font-semibold text-red-900">
                  {tabCounts.critical}
                </p>
                <p className="text-xs text-red-600">Immediate attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Approved Today</p>
                <p className="text-2xl font-semibold text-green-900">
                  {tabCounts.approved}
                </p>
                <p className="text-xs text-green-600">Ready for execution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Avg Response Time</p>
                <p className="text-2xl font-semibold text-blue-900">23m</p>
                <p className="text-xs text-blue-600">Below SLA target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Flight Number</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="EK123"
                  value={filters.flightNumber}
                  onChange={(e) =>
                    setFilters({ ...filters, flightNumber: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Plan ID</Label>
              <Input
                placeholder="RP-2025-001"
                value={filters.planId}
                onChange={(e) =>
                  setFilters({ ...filters, planId: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  setFilters({ ...filters, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Submitter</Label>
              <Select
                value={filters.submitter}
                onValueChange={(value) =>
                  setFilters({ ...filters, submitter: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submitters</SelectItem>
                  <SelectItem value="ops.manager">Operations</SelectItem>
                  <SelectItem value="crew.scheduler">Crew</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="ground.ops">Ground Ops</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submission Time</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="cost">Estimated Cost</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Order</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="all"
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <span>All Plans</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">
              {tabCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <span>Pending</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">
              {tabCounts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="critical"
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <span>Critical</span>
            <Badge variant="destructive" className="ml-1 flex-shrink-0">
              {tabCounts.critical}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <span>Approved</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">
              {tabCounts.approved}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <span>Rejected</span>
            <Badge variant="secondary" className="ml-1 flex-shrink-0">
              {tabCounts.rejected}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">
                    Loading Plans...
                  </h3>
                  <p className="text-muted-foreground">
                    Fetching the latest recovery plans from the database.
                  </p>
                </CardContent>
              </Card>
            ) : sortedPlans.length > 0 ? (
              sortedPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold">
                            {plan.title}
                          </h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                          <Badge className={getPriorityColor(plan.priority)}>
                            {plan.priority} Priority
                          </Badge>
                          {plan.timeRemaining === "OVERDUE" && (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              OVERDUE
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Flight & Route
                            </Label>
                            <p className="font-medium">
                              {plan.flightNumber} • {plan.route}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {plan.aircraft}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Submitted
                            </Label>
                            <p className="font-medium">
                              {formatIST(plan.submittedAt)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              by {plan.submitterName}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Impact
                            </Label>
                            <p className="font-medium">
                              AED {(plan.estimatedCost / 1000).toFixed(0)}K •{" "}
                              {plan.estimatedDelay}m delay
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {plan.affectedPassengers} passengers
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Confidence & Timeline
                            </Label>
                            <p className="font-medium">
                              {plan.confidence}% • {plan.timeline}
                            </p>
                            <p
                              className={`text-sm ${getTimeRemainingColor(plan.timeRemaining)}`}
                            ></p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {plan.recoverySteps.length} steps
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Requires {plan.approvalRequired}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {plan.disruptionReason}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {plan.rejectionReason && (
                          <Alert className="border-red-200 bg-red-50 mb-4">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              <strong>Rejection Reason:</strong>{" "}
                              {plan.rejectionReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="flex flex-col justify-center gap-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(plan)}
                          disabled={loadingDetails === plan.id}
                          className="flex items-center gap-2"
                        >
                          {loadingDetails === plan.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          {loadingDetails === plan.id
                            ? "Loading..."
                            : "View Details"}
                        </Button>

                        {[
                          "Pending Approval",
                          "Under Review",
                          "Pending",
                          "pending",
                        ].includes(plan.status) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(plan.id)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(plan.id)}
                              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <ThumbsDown className="h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Plans Found</h3>
                  <p className="text-muted-foreground">
                    No recovery plans match your current filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedPlan && (
        <Dialog
          open={!!selectedPlan}
          onOpenChange={() => setSelectedPlan(null)}
        >
          <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recovery Plan Details
              </DialogTitle>
              <DialogDescription>
                Detailed analysis of recovery options for{" "}
                {selectedPlan.flightNumber} • {selectedPlan.route}
              </DialogDescription>
            </DialogHeader>

            <DetailedRecoveryOptionView plan={selectedPlan} />
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Recovery Option Details Dialog */}
      <Dialog
        open={showDetailedOptionAnalysis}
        onOpenChange={(open) => {
          if (!open) {
            setShowDetailedOptionAnalysis(false);
            setSelectedOptionForDetails(null);
          }
        }}
      >
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-6 w-6 text-flydubai-blue" />
                  Detailed Recovery Option Analysis
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {selectedOptionForDetails?.title} •{" "}
                  {selectedOptionForDetails?.flightNumber} •{" "}
                  {selectedOptionForDetails?.route}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                  Confidence: {selectedOptionForDetails?.confidence || 80}%
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 px-3 py-1">
                  {selectedOptionForDetails?.cost || "TBD"}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList
              className={`grid w-full ${
                selectedPlan?.hasCrewData && selectedPlan?.hasPassengerData
                  ? "grid-cols-5"
                  : selectedPlan?.hasCrewData || selectedPlan?.hasPassengerData
                    ? "grid-cols-4"
                    : "grid-cols-3"
              }`}
            >
              <TabsTrigger value="overview">
                Recovery Options Overview
              </TabsTrigger>
              <TabsTrigger value="flight">Flight Details</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
              {selectedPlan?.hasCrewData && (
                <TabsTrigger value="crew-hotac">Crew & HOTAC</TabsTrigger>
              )}
              {selectedPlan?.hasPassengerData && (
                <TabsTrigger value="passenger-reaccommodation">
                  Passenger Re-accommodation
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recovery Options Overview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Available recovery options for {selectedPlan.flightNumber} •{" "}
                    {selectedPlan.route}
                  </p>
                </CardHeader>
                <CardContent>
                  {selectedPlan.matchingOption && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700">
                          Selected Option
                        </Badge>
                        <h4 className="font-medium text-blue-800">
                          {selectedPlan.matchingOption.title}
                        </h4>
                      </div>
                      <p className="text-sm text-blue-800">
                        {selectedPlan.matchingOption.description ||
                          "Recovery option details"}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-3">
                      {selectedPlan.recoveryOptions &&
                      selectedPlan.recoveryOptions.length > 0 ? (
                        selectedPlan.recoveryOptions.map((option, index) => {
                          // Check if this option is selected by matching option_id from pending solution
                          const isSelected =
                            selectedPlan.optionId &&
                            (option.id === selectedPlan.optionId ||
                              option.option_id === selectedPlan.optionId ||
                              String(option.id) ===
                                String(selectedPlan.optionId) ||
                              String(option.option_id) ===
                                String(selectedPlan.optionId));

                          return (
                            <Card
                              key={option.id || index}
                              className={
                                isSelected
                                  ? "border-orange-200 bg-orange-50"
                                  : "border-gray-200"
                              }
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h5
                                    className={`font-medium ${isSelected ? "text-orange-800" : ""}`}
                                  >
                                    {option.title}
                                  </h5>
                                  <div className="flex gap-2">
                                    {isSelected && (
                                      <Badge className="bg-orange-100 text-orange-700">
                                        Selected
                                      </Badge>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                      onClick={() =>
                                        handleViewOptionDetails(
                                          option,
                                          selectedPlan,
                                        )
                                      }
                                    >
                                      View Option
                                    </Button>
                                  </div>
                                </div>
                                <p
                                  className={`text-sm mb-3 ${isSelected ? "text-orange-700" : "text-gray-600"}`}
                                >
                                  {option.description ||
                                    "Recovery option description"}
                                </p>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Cost:</span>
                                    <div className="font-medium">
                                      {option.cost
                                        ? typeof option.cost === "string"
                                          ? option.cost
                                          : `AED ${option.cost.toLocaleString()}`
                                        : `AED ${(option.estimated_cost || 0).toLocaleString()}`}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Timeline:
                                    </span>
                                    <div className="font-medium">
                                      {option.timeline || "TBD"}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Confidence:
                                    </span>
                                    <div className="font-medium">
                                      {option.confidence || 85}%
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Impact:
                                    </span>
                                    <div className="font-medium">
                                      {option.impact || "Medium"}
                                    </div>
                                  </div>
                                </div>
                                {option.advantages &&
                                  Array.isArray(option.advantages) && (
                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                      <span>
                                        Advantages:{" "}
                                        <strong>
                                          {option.advantages
                                            .slice(0, 2)
                                            .join(", ")}
                                        </strong>
                                      </span>
                                    </div>
                                  )}
                                {isSelected && option.metrics && (
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span>Metrics:</span>
                                    {option.metrics.otpScore && (
                                      <span>
                                        OTP:{" "}
                                        <strong>
                                          {option.metrics.otpScore}%
                                        </strong>
                                      </span>
                                    )}
                                    {option.metrics.networkImpact && (
                                      <span>
                                        Network Impact:{" "}
                                        <strong>
                                          {option.metrics.networkImpact}
                                        </strong>
                                      </span>
                                    )}
                                    {option.metrics.regulatoryRisk && (
                                      <span>
                                        Risk:{" "}
                                        <strong>
                                          {option.metrics.regulatoryRisk}
                                        </strong>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <Card className="border-gray-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-gray-500">
                              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No recovery options available</p>
                              <p className="text-sm">
                                Recovery options may still be generating for
                                this disruption.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flight" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Flight Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Flight Number:</span>
                      <div className="font-medium">
                        {selectedPlan.flightNumber || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Route:</span>
                      <div className="font-medium">
                        {selectedPlan.route || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Aircraft:</span>
                      <div className="font-medium">
                        {selectedPlan.aircraft || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Scheduled Departure:
                      </span>
                      <div className="font-medium">
                        {selectedPlan.flightDetails?.scheduled_departure
                          ? formatIST(
                              selectedPlan.flightDetails.scheduled_departure,
                            )
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Estimated Departure:
                      </span>
                      <div className="font-medium">
                        {selectedPlan.flightDetails?.estimated_departure
                          ? formatIST(
                              selectedPlan.flightDetails.estimated_departure,
                            )
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gate:</span>
                      <div className="font-medium">
                        {selectedPlan.flightDetails?.gate || "TBD"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Terminal:</span>
                      <div className="font-medium">
                        {selectedPlan.flightDetails?.terminal || "TBD"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Delay:</span>
                      <div className="font-medium">
                        {selectedPlan.estimatedDelay || 0} minutes
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Disruption Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Reason:</span>
                      <div className="font-medium text-red-600">
                        {selectedPlan.disruptionReason || "Technical Issue"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Severity:</span>
                      <div className="font-medium">
                        <Badge
                          className={getPriorityColor(
                            selectedPlan.priority || "Medium",
                          )}
                        >
                          {selectedPlan.priority || "Medium"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Affected Passengers:
                      </span>
                      <div className="font-medium">
                        {selectedPlan.affectedPassengers || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Crew:</span>
                      <div className="font-medium">
                        {selectedPlan.flightDetails?.crew ||
                          selectedPlan.assignedCrew?.length ||
                          "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted by:</span>
                      <div className="font-medium">
                        {selectedPlan.submitterName ||
                          selectedPlan.operationsUser ||
                          "System"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted At:</span>
                      <div className="font-medium">
                        {formatIST(selectedPlan.submittedAt)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Status:</span>
                      <div className="font-medium">
                        <Badge className={getStatusColor(selectedPlan.status)}>
                          {selectedPlan.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Plan ID:</span>
                      <div className="font-medium text-blue-600">
                        {selectedPlan.id}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Option Comparison Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-3 text-left">
                            Option
                          </th>
                          <th className="border border-gray-200 p-3 text-left">
                            Cost (AED)
                          </th>
                          <th className="border border-gray-200 p-3 text-left">
                            Timeline
                          </th>
                          <th className="border border-gray-200 p-3 text-left">
                            Confidence
                          </th>
                          <th className="border border-gray-200 p-3 text-left">
                            Impact
                          </th>
                          <th className="border border-gray-200 p-3 text-left">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPlan.recoveryOptions &&
                        selectedPlan.recoveryOptions.length > 0 ? (
                          selectedPlan.recoveryOptions.map((option, index) => {
                            const isSelected =
                              selectedPlan.optionId &&
                              (option.id === selectedPlan.optionId ||
                                option.option_id === selectedPlan.optionId ||
                                String(option.id) ===
                                  String(selectedPlan.optionId) ||
                                String(option.option_id) ===
                                  String(selectedPlan.optionId));

                            return (
                              <tr
                                key={option.id || index}
                                className={isSelected ? "bg-orange-50" : ""}
                              >
                                <td className="border border-gray-200 p-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${isSelected ? "bg-orange-500" : "bg-gray-400"}`}
                                    ></div>
                                    {option.title || `Option ${index + 1}`}
                                  </div>
                                </td>
                                <td className="border border-gray-200 p-3">
                                  {option.cost
                                    ? typeof option.cost === "string"
                                      ? option.cost
                                      : `AED ${option.cost.toLocaleString()}`
                                    : `AED ${(option.estimated_cost || 0).toLocaleString()}`}
                                </td>
                                <td className="border border-gray-200 p-3">
                                  {option.timeline || "TBD"}
                                </td>
                                <td className="border border-gray-200 p-3">
                                  {option.confidence || 85}%
                                </td>
                                <td className="border border-gray-200 p-3">
                                  {option.impact || "Medium"}
                                </td>
                                <td className="border border-gray-200 p-3">
                                  {isSelected ? (
                                    <Badge className="bg-orange-100 text-orange-700">
                                      Selected
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Available</Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="border border-gray-200 p-4 text-center text-gray-500"
                            >
                              No recovery options data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Crew & HOTAC Tab */}
            <TabsContent
              value="crew-hotac"
              className="space-y-6 max-h-[70vh] overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-flydubai-blue" />
                    Crew & HOTAC Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOptionForDetails?.resourceRequirements
                    ?.crew_requirements ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-2">
                            Crew Requirements
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Required Crew:</span>
                              <span className="font-medium">
                                {selectedOptionForDetails.resourceRequirements
                                  .crew_requirements.required_crew ||
                                  "Standard crew"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duty Time Impact:</span>
                              <span className="font-medium">
                                {selectedOptionForDetails.resourceRequirements
                                  .crew_requirements.duty_impact ||
                                  "Within limits"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-medium text-orange-800 mb-2">
                            HOTAC Arrangements
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Hotel Required:</span>
                              <span className="font-medium">
                                {selectedOptionForDetails.resourceRequirements
                                  .crew_requirements.hotel_required
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Transport:</span>
                              <span className="font-medium">
                                {selectedOptionForDetails.resourceRequirements
                                  .crew_requirements.transport || "Standard"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No Crew Changes Required
                      </h3>
                      <p className="text-gray-500">
                        Current crew assignment is suitable for this recovery
                        option.
                      </p>
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Current crew certified for this aircraft type
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Passenger Re-accommodation Tab */}
            <TabsContent
              value="passenger-reaccommodation"
              className="space-y-6 max-h-[70vh] overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-flydubai-blue" />
                    Passenger Re-accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOptionForDetails?.resourceRequirements
                    ?.passenger_requirements ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedOptionForDetails.passengers || 167}
                          </div>
                          <div className="text-sm text-blue-700">
                            Total Passengers
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.floor(
                              (selectedOptionForDetails.passengers || 167) *
                                0.95,
                            )}
                          </div>
                          <div className="text-sm text-green-700">
                            Same Flight
                          </div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {Math.floor(
                              (selectedOptionForDetails.passengers || 167) *
                                0.05,
                            )}
                          </div>
                          <div className="text-sm text-yellow-700">
                            Rebooking Required
                          </div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedOptionForDetails.resourceRequirements
                              .passenger_requirements.compensation_required ||
                              0}
                          </div>
                          <div className="text-sm text-orange-700">
                            Compensation Claims
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Service Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <UtensilsCrossed className="h-4 w-4 text-green-600" />
                              <span className="font-medium">Meal Services</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {selectedOptionForDetails.resourceRequirements
                                .passenger_requirements.meal_vouchers ||
                                "Standard meal service maintained"}
                            </p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Hotel className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Accommodation</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {selectedOptionForDetails.resourceRequirements
                                .passenger_requirements.hotel_accommodation ||
                                "No overnight accommodation required"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Minimal Passenger Impact
                      </h3>
                      <p className="text-gray-500">
                        All passengers can be accommodated on the same flight
                        with minimal disruption.
                      </p>
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedOptionForDetails?.passengers || 167}
                          </div>
                          <div className="text-sm text-green-700">
                            Same Flight
                          </div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            0
                          </div>
                          <div className="text-sm text-blue-700">
                            Rebookings
                          </div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            0
                          </div>
                          <div className="text-sm text-orange-700">
                            Compensation
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="rotation-impact"
              className="space-y-6 max-h-[70vh] overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-flydubai-blue" />
                    Rotation Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-3xl font-bold text-yellow-600">
                        2
                      </div>
                      <div className="text-sm text-yellow-700">
                        Downstream flights
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">75</div>
                      <div className="text-sm text-red-700">
                        Total Delay (min)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        Low
                      </div>
                      <div className="text-sm text-purple-700">
                        Cascade Risk
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Affected Flights</h4>
                    <div className="space-y-3">
                      {(
                        selectedOptionForDetails?.rotationPlan
                          ?.affected_flights || [
                          {
                            flight: "Next rotation",
                            route: "Network continuation",
                            impact: "On-time",
                            delay: 0,
                          },
                        ]
                      ).map((flight, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">{flight.flight}</span>
                            <p className="text-sm text-gray-600">
                              {flight.route || "Network continuation"}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={
                                flight.delay > 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }
                            >
                              {flight.impact}
                            </Badge>
                            {flight.delay > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                +{flight.delay}min
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          Cascade Risk Assessment:
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Low risk of affecting subsequent flights in the
                        rotation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="resources"
              className="space-y-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-flydubai-blue" />
                      Resource Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(
                        selectedOptionForDetails?.resourceRequirements
                          ?.personnel || [
                          {
                            type: "Operations Team",
                            status: "Available",
                            eta: "Immediate",
                          },
                          {
                            type: "Ground Handling",
                            status: "Confirmed",
                            eta: "15 minutes",
                          },
                          {
                            type: "Customer Service",
                            status: "Deployed",
                            eta: "Immediate",
                          },
                        ]
                      ).map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">{resource.type}</span>
                            <p className="text-sm text-gray-600">
                              ETA: {resource.eta}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            {resource.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-flydubai-blue" />
                      Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(
                        selectedOptionForDetails?.costBreakdown || [
                          {
                            category: "Operational Costs",
                            amount: "AED 15,000",
                            percentage: 60,
                          },
                          {
                            category: "Passenger Services",
                            amount: "AED 8,000",
                            percentage: 30,
                          },
                          {
                            category: "Administrative",
                            amount: "AED 2,000",
                            percentage: 10,
                          },
                        ]
                      ).map((cost, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {cost.category}
                            </span>
                            <span className="font-semibold text-flydubai-orange">
                              {cost.amount}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-flydubai-blue h-2 rounded-full transition-all duration-500"
                              style={{ width: `${cost.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}

                      <Separator className="my-4" />
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-semibold">
                          Total Estimated Cost
                        </span>
                        <span className="text-lg font-bold text-flydubai-orange">
                          {selectedOptionForDetails?.cost || "AED 25,000"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
