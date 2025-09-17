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
      const data = await databaseService.getPendingRecoverySolutions();

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
          (plan as any).id ||
          `RP-${new Date().getFullYear()}-${String((plan as any).id || Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
        title:
          (plan as any).option_title || (plan as any).title || "Recovery Plan",
        flightNumber: (plan as any).flight_number || "N/A",
        route: (plan as any).route || "N/A",
        aircraft: (plan as any).aircraft || "N/A",
        submittedAt: (plan as any).submitted_at || new Date().toISOString(),
        submittedBy: (plan as any).submitted_by || "system",
        submitterName:
          (plan as any).operations_user ||
          (plan as any).submitted_by ||
          "AERON System",
        priority: (plan as any).severity || "Medium",
        status: (plan as any).status || "Pending Approval",
        estimatedCost: (() => {
          if (typeof (plan as any).estimated_cost === "string") {
            const numericValue = parseInt(
              (plan as any).estimated_cost.replace(/[^0-9]/g, ""),
            );
            return numericValue || 0;
          }
          if (typeof (plan as any).cost === "string") {
            const numericValue = parseInt(
              (plan as any).cost.replace(/[^0-9]/g, ""),
            );
            return numericValue || 0;
          }
          return (plan as any).estimated_cost || (plan as any).cost || 0;
        })(),
        estimatedDelay:
          (plan as any).delay_minutes ||
          parseInt((plan as any).timeline?.replace(/[^0-9]/g, "") || "0") ||
          0,
        affectedPassengers:
          (plan as any).passengers || (plan as any).affected_passengers || 0,
        confidence: (plan as any).confidence || 80,
        disruptionReason: (plan as any).disruption_reason || "N/A",
        timeline: (plan as any).timeline || "TBD",
        approvalRequired:
          (plan as any).approval_required || "Operations Manager",
        slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        timeRemaining: "2h 0m",
        tags: ["AERON Generated"],
        metrics: {
          successProbability: (plan as any).confidence || 80,
          customerSatisfaction: 85,
          onTimePerformance: 90,
          costEfficiency: 75,
        },
        flightDetails: (plan as any).full_details || {},
        costBreakdown:
          (plan as any).cost_analysis?.breakdown ||
          (plan as any).full_details?.costBreakdown ||
          {},
        recoverySteps:
          (plan as any).recovery_steps ||
          (plan as any).full_details?.recoverySteps ||
          [],
        assignedCrew:
          (plan as any).crew_information ||
          (plan as any).full_details?.assignedCrew ||
          [],
        passengerInformation: (plan as any).passenger_information || [],
        operationsUser: (plan as any).operations_user || "Operations Manager",
        costAnalysis: (plan as any).cost_analysis || {},
        disruptionId: (plan as any).disruption_id,
        optionId: (plan as any).option_id,
        impact: (plan as any).impact || "Moderate", // Added for recovery options
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error("Failed to fetch pending solutions:", error);
      // Try to show cached data or empty array
      setPlans([]);

      // You could add a retry mechanism here
      setTimeout(() => {
        if (plans.length === 0) {
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
      ((plan as any).priority &&
        (plan as any).priority.toLowerCase() === filters.priority);
    const matchesSubmitter =
      filters.submitter === "all" ||
      ((plan as any).submittedBy &&
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

    } catch (error) {
      console.error("Failed to approve plan:", error);
      // Refresh data to ensure consistency even on error
      fetchPlans();
    }
  };

  const handleReject = async (planId) => {
    try {

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

      // Fetch recovery options data for the disruption
      let recoveryOptionsData = null;
      let updatedPlan = null;

      // First try to get recovery options from the disruption
      if (plan.disruptionId) {

        const recoveryResponse = await fetch(
          `/api/recovery-options/${plan.disruptionId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (recoveryResponse.ok) {
          recoveryOptionsData = await recoveryResponse.json();
        } else {

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
      } else {
        // Fallback to fetching all solutions and finding the one we need
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

          // Check for passenger information in the selected option - prioritize API data
          if (
            selectedOption.passenger_rebooking ||
            selectedOption.passenger_information ||
            selectedOption.passenger_details ||
            selectedOption.passenger_reaccommodation ||
            selectedOption.impact_area?.includes("passenger")
          ) {
            passengerData =
              selectedOption.passenger_rebooking ||
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

          // Prioritize passenger_rebooking from pending solution data
          if (
            !passengerData &&
            (updatedPlan.passenger_rebooking ||
              updatedPlan.passenger_information ||
              updatedPlan.full_details?.passenger_rebooking)
          ) {
            passengerData =
              updatedPlan.passenger_rebooking ||
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
          // Store flags for conditional display
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
              : typeof passengerData === "object" &&
                Object.keys(passengerData).length > 0)
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
    const [recoveryOptionData, setRecoveryOptionData] = useState(null);

    // Fetch pending solution data when component mounts
    useEffect(() => {
      const fetchDetailedData = async () => {
        if (!plan.id) return;

        setLoadingPendingData(true);
        try {
          // Fetch pending solution data
          const allPendingSolutions =
            await databaseService.getPendingRecoverySolutions();
          const matchingSolution = allPendingSolutions.find(
            (solution) =>
              solution.disruption_id === plan.disruptionId &&
              solution.option_id === plan.optionId,
          );

          if (matchingSolution) {
            // Fetch detailed pending solution data
            const pendingResponse = await fetch(
              `/api/pending-recovery-solutions/${matchingSolution.id}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              },
            );

            if (pendingResponse.ok) {
              const pendingData = await pendingResponse.json();
              setPendingSolutionData(pendingData);
            }
          }

          // Fetch recovery option data from API
          if (plan.disruptionId) {
            const recoveryResponse = await fetch(
              `/api/recovery-options/${plan.disruptionId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              },
            );

            if (recoveryResponse.ok) {
              const recoveryData = await recoveryResponse.json();
              const matchingOption = recoveryData.find(
                (opt) =>
                  opt.id === plan.optionId ||
                  opt.option_id === plan.optionId ||
                  String(opt.id) === String(plan.optionId) ||
                  String(opt.option_id) === String(plan.optionId),
              );

              if (matchingOption) {
                setRecoveryOptionData(matchingOption);

              }
            }
          }
        } catch (error) {
          console.error("Error fetching detailed data:", error);
        } finally {
          setLoadingPendingData(false);
        }
      };

      fetchDetailedData();
    }, [plan.id, plan.disruptionId, plan.optionId]);

    // Extract crew and passenger data
    const crewData =
      pendingSolutionData?.full_details?.crew_hotel_assignments ||
      pendingSolutionData?.crew_hotel_assignments ||
      recoveryOptionData?.crew_hotel_assignments ||
      plan.assignedCrew ||
      [];

    const passengerData =
      pendingSolutionData?.full_details?.passenger_rebooking ||
      pendingSolutionData?.passenger_rebooking ||
      recoveryOptionData?.passenger_rebooking ||
      recoveryOptionData?.passenger_information ||
      recoveryOptionData?.passenger_reaccommodation ||
      plan.passengerInformation ||
      [];

    const hasCrewData =
      crewData &&
      (Array.isArray(crewData)
        ? crewData.length > 0
        : Object.keys(crewData).length > 0);
    const hasPassengerData =
      passengerData &&
      (Array.isArray(passengerData)
        ? passengerData.length > 0
        : Object.keys(passengerData).length > 0);
    return (
      <div className="space-y-6">
        <Tabs value={activeOptionTab} onValueChange={setActiveOptionTab}>
          <TabsList
            className={`grid w-full ${
              plan?.hasCrewData && plan?.hasPassengerData
                ? "grid-cols-5"
                : plan?.hasCrewData || plan?.hasPassengerData
                  ? "grid-cols-4"
                  : "grid-cols-3"
            }`}
          >
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            {plan?.hasCrewData && (
              <TabsTrigger value="crew-hotac">Crew & HOTAC</TabsTrigger>
            )}
            {plan?.hasPassengerData && (
              <TabsTrigger value="passengers">Passengers</TabsTrigger>
            )}
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="rotation-impact">Rotation Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recovery Option Summary
                  {loadingPendingData && (
                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Option Type
                    </Label>
                    <div className="font-medium">
                      {pendingSolutionData?.option_title ||
                        recoveryOptionData?.title ||
                        plan.title}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Estimated Cost
                    </Label>
                    <div className="font-medium text-flydubai-orange">
                      {pendingSolutionData?.cost ||
                        recoveryOptionData?.cost ||
                        `AED ${(plan.estimatedCost || 0).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Timeline
                    </Label>
                    <div className="font-medium">
                      {pendingSolutionData?.timeline ||
                        recoveryOptionData?.timeline ||
                        plan.timeline}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Confidence
                    </Label>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={
                          pendingSolutionData?.confidence ||
                          recoveryOptionData?.confidence ||
                          plan.confidence ||
                          80
                        }
                        className="w-16 h-2"
                      />
                      <span className="font-medium">
                        {pendingSolutionData?.confidence ||
                          recoveryOptionData?.confidence ||
                          plan.confidence ||
                          80}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pendingSolutionData?.option_description ||
                        recoveryOptionData?.description ||
                        plan.flightDetails?.description ||
                        "Recovery option to address the flight disruption with minimal impact to operations and passengers."}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Key Benefits</Label>
                    {recoveryOptionData?.advantages &&
                    Array.isArray(recoveryOptionData.advantages) ? (
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        {recoveryOptionData.advantages.map(
                          (advantage, index) => (
                            <li key={index}>• {advantage}</li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        <li>• Minimizes operational disruption</li>
                        <li>• Reduces passenger impact</li>
                        <li>• Cost-effective solution</li>
                        <li>• Quick implementation</li>
                      </ul>
                    )}
                  </div>

                  {recoveryOptionData?.considerations &&
                    Array.isArray(recoveryOptionData.considerations) && (
                      <div>
                        <Label className="text-sm font-medium">
                          Considerations
                        </Label>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {recoveryOptionData.considerations.map(
                            (consideration, index) => (
                              <li key={index}>• {consideration}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
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
                  {loadingPendingData && (
                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    // Try to get timeline from API data first
                    const timelineSteps =
                      recoveryOptionData?.timeline_details?.timelineSteps ||
                      pendingSolutionData?.timeline_details ||
                      plan.recoverySteps;

                    const defaultSteps = [
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
                        details: "Required resources identified and allocated",
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
                    ];

                    const steps =
                      timelineSteps && timelineSteps.length > 0
                        ? timelineSteps
                        : defaultSteps;

                    return steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-3 border rounded-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-flydubai-blue text-white text-sm font-medium">
                          {step.step || index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {step.title || step.action}
                            </h4>
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
                            {step.details || step.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {step.timestamp || step.duration || "TBD"}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passengers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Passenger Reaccommodation
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
                    {/* Passenger Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {(Array.isArray(passengerData)
                            ? passengerData.length
                            : 0) ||
                            pendingSolutionData?.full_details?.passenger_impact
                              ?.affected ||
                            plan.affectedPassengers ||
                            0}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Passengers
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {pendingSolutionData?.full_details?.passenger_impact
                            ?.reaccommodated ||
                            (Array.isArray(passengerData)
                              ? passengerData.filter(
                                  (p) => p.rebooking_status === "confirmed",
                                ).length
                              : 0) ||
                            Math.floor(
                              ((Array.isArray(passengerData)
                                ? passengerData.length
                                : 0) ||
                                plan.affectedPassengers ||
                                167) * 0.85,
                            )}
                        </div>
                        <div className="text-sm text-green-700">Rebooked</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {Array.isArray(passengerData)
                            ? passengerData.filter((p) =>
                                p.additional_services?.includes(
                                  "accommodation",
                                ),
                              ).length
                            : 0}
                        </div>
                        <div className="text-sm text-yellow-700">
                          Accommodation
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {pendingSolutionData?.full_details?.passenger_impact
                            ?.compensated ||
                            (Array.isArray(passengerData)
                              ? passengerData.filter(
                                  (p) => p.rebooking_cost > 0,
                                ).length
                              : 0) ||
                            Math.floor(
                              ((Array.isArray(passengerData)
                                ? passengerData.length
                                : 0) ||
                                plan.affectedPassengers ||
                                167) * 0.03,
                            )}
                        </div>
                        <div className="text-sm text-orange-700">
                          Compensation
                        </div>
                      </div>
                    </div>

                    {/* PNR Grouped Passenger Details */}
                    <div>
                      <h4 className="font-medium mb-3">
                        Passenger Rebookings by PNR
                      </h4>
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {(() => {
                          const rawPassengerData =
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.full_details?.passenger_rebooking ||
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.passenger_rebooking ||
                            [];

                          // Ensure currentPassengerData is always an array
                          const currentPassengerData = Array.isArray(rawPassengerData)
                            ? rawPassengerData
                            : [];

                          if (
                            !currentPassengerData ||
                            currentPassengerData.length === 0
                          ) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                No passenger rebooking data available
                              </div>
                            );
                          }

                          // Group passengers by PNR
                          const passengersByPnr = currentPassengerData.reduce(
                            (acc, passenger) => {
                              const pnr = passenger.pnr || "Unknown";
                              if (!acc[pnr]) {
                                acc[pnr] = [];
                              }
                              acc[pnr].push(passenger);
                              return acc;
                            },
                            {},
                          );

                          return Object.entries(passengersByPnr)
                            .slice(0, 8)
                            .map(([pnr, passengers], groupIndex) => (
                              <Card
                                key={groupIndex}
                                className="border border-gray-200"
                              >
                                <div className="p-3 bg-gray-50 border-b">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-gray-900">
                                        PNR: {pnr}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800"
                                      >
                                        {(passengers as any).length} passenger
                                        {(passengers as any).length > 1
                                          ? "s"
                                          : ""}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Group Booking
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3 space-y-3">
                                  {(passengers as any).map(
                                    (passenger, passengerIndex) => (
                                      <div
                                        key={passengerIndex}
                                        className="border-l-2 border-blue-200 pl-3"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="font-medium text-gray-900">
                                            {passenger.passenger_name ||
                                              `Passenger ${passengerIndex + 1}`}
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
                                              "Unknown"}
                                          </Badge>
                                        </div>
                                        <div className="text-sm space-y-1">
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
                                              {passenger.rebooked_flight ||
                                                "TBD"}
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
                                                : "N/A"}
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
                                            passenger.additional_services
                                              .length > 0 && (
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                  Services:
                                                </span>
                                                <span className="text-xs">
                                                  {passenger.additional_services.map(
                                                    (service, serviceIndex) => (
                                                      <Badge
                                                        key={serviceIndex}
                                                        variant="outline"
                                                        className="mr-1 text-xs"
                                                      >
                                                        {service.service_type ||
                                                          service}
                                                      </Badge>
                                                    ),
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                          {passenger.notes && (
                                            <div className="text-xs text-muted-foreground mt-2">
                                              Notes: {passenger.notes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </Card>
                            ));
                        })()}
                        {(() => {
                          const rawPassengerData =
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.full_details?.passenger_rebooking ||
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.passenger_rebooking ||
                            [];

                          const groupCount = Array.isArray(rawPassengerData)
                            ? Object.keys(
                                rawPassengerData.reduce(
                                  (acc, passenger) => {
                                    const pnr = passenger.pnr || "UNKNOWN";
                                    if (!acc[pnr]) acc[pnr] = [];
                                    acc[pnr].push(passenger);
                                    return acc;
                                  },
                                  {},
                                ),
                              ).length
                            : 0;

                          return (
                            groupCount > 8 && (
                              <div className="text-center text-sm text-muted-foreground p-2">
                                ... and {groupCount - 8} more PNR groups
                              </div>
                            )
                          );
                        })()}
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
                  {loadingPendingData && (
                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                  )}
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
                            Aircraft Requirements
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {selectedOptionForDetails?.matchingOption
                            ?.resource_requirements?.aircraft ? (
                            Object.entries(
                              selectedOptionForDetails.matchingOption
                                .resource_requirements.aircraft,
                            ).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}:
                                </span>
                                <span>{(value as any)}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Registration:
                                </span>
                                <span>A6-FEB</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Type:
                                </span>
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
                            </>
                          )}
                        </div>
                      </Card>

                      <Card className="p-4 bg-orange-50 border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">Ground Resources</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {selectedOptionForDetails?.matchingOption
                            ?.resource_requirements?.ground ? (
                            Object.entries(
                              selectedOptionForDetails.matchingOption
                                .resource_requirements.ground,
                            ).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}:
                                </span>
                                <span>{(value as any)}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Terminal:
                                </span>
                                <span>Terminal 2</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Gate:
                                </span>
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
                            </>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Operational Resources */}
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Operational Support</h4>
                    <div className="space-y-3">
                      {selectedOptionForDetails?.matchingOption
                        ?.resource_requirements?.personnel
                        ? selectedOptionForDetails.matchingOption.resource_requirements.personnel.map(
                            (resource, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="font-medium">
                                    {resource.role ||
                                      resource.type ||
                                      `Resource ${index + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <Badge variant="outline">
                                    {resource.status ||
                                      resource.availability ||
                                      "Available"}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    Count:{" "}
                                    {resource.count || resource.quantity || 1}
                                  </span>
                                  {resource.cost && (
                                    <span className="font-medium text-flydubai-orange">
                                      {resource.cost}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ),
                          )
                        : [
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
                                <Badge variant="outline">
                                  {resource.status}
                                </Badge>
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
                        {(() => {
                          const costBreakdown =
                            selectedOptionForDetails?.matchingOption
                              ?.cost_breakdown ||
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.cost_analysis?.breakdown ||
                            selectedPlan.costBreakdown;

                          const costTotal =
                            selectedOptionForDetails?.matchingOption
                              ?.cost_breakdown?.total ||
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.cost_analysis?.total;

                          if (
                            costBreakdown &&
                            Object.keys(costBreakdown).length > 0
                          ) {
                            return (
                              <div className="space-y-4">
                                {/* Display total if available */}
                                {costTotal && (
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-blue-800">
                                        {costTotal.title || "Total Cost"}:
                                      </span>
                                      <span className="text-lg font-semibold text-blue-900">
                                        {costTotal.amount ||
                                          `AED ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </span>
                                    </div>
                                    {costTotal.description && (
                                      <p className="text-sm text-blue-700 mt-1">
                                        {costTotal.description}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Display breakdown items */}
                                <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900">
                                    Cost Breakdown:
                                  </h4>
                                  {Array.isArray(costBreakdown)
                                    ? costBreakdown.map((item, index) => (
                                        <div
                                          key={index}
                                          className="space-y-2 p-3 border rounded-lg"
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
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                              <div
                                                className="bg-flydubai-blue h-2 rounded-full transition-all duration-500"
                                                style={{
                                                  width: `${item.percentage}%`,
                                                }}
                                              ></div>
                                            </div>
                                          )}
                                          <div className="flex justify-between items-center text-xs">
                                            {item.percentage && (
                                              <span className="text-gray-600">
                                                {item.percentage}% of total cost
                                              </span>
                                            )}
                                            {item.description && (
                                              <span className="text-blue-600">
                                                {item.description}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    : Object.entries(costBreakdown).map(
                                        ([key, value]) => (
                                          <div
                                            key={key}
                                            className="space-y-2 p-3 border rounded-lg"
                                          >
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium capitalize">
                                                {key.replace(/([A-Z])/g, " $1")}
                                              </span>
                                              <span className="font-semibold text-flydubai-orange">
                                                {typeof value === "object" &&
                                                value &&
                                                typeof (value as any).amount === "number"
                                                  ? `AED ${(value as any).amount.toLocaleString()}`
                                                  : typeof value === "number"
                                                    ? `AED ${value.toLocaleString()}`
                                                    : typeof value === "string" &&
                                                        !value.includes(
                                                          "[object",
                                                        )
                                                      ? value
                                                      : "N/A"}
                                              </span>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                </div>
                              </div>
                            );
                          } else if (
                            selectedPlan.costBreakdown &&
                            Object.keys(selectedPlan.costBreakdown).length > 0
                          ) {
                            // Fallback to old format
                            return (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {Object.entries(selectedPlan.costBreakdown).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      <span className="text-gray-600 capitalize">
                                        {key.replace(/([A-Z])/g, " $1")}:
                                      </span>
                                      <div className="font-medium">
                                        {typeof value === "object" &&
                                        value &&
                                        (value as any).amount
                                          ? (value as any).amount
                                          : typeof value === "number"
                                            ? `AED ${value.toLocaleString()}`
                                            : typeof value === "string" &&
                                                !value.includes("[object")
                                              ? value
                                              : `AED ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            );
                          } else {
                            // Default breakdown when no data available
                            return (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Direct Costs:
                                  </span>
                                  <div className="font-medium">
                                    AED{" "}
                                    {(
                                      (selectedPlan.estimatedCost || 50000) *
                                      0.6
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Indirect Costs:
                                  </span>
                                  <div className="font-medium">
                                    AED{" "}
                                    {(
                                      (selectedPlan.estimatedCost || 50000) *
                                      0.4
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Passenger Compensation:
                                  </span>
                                  <div className="font-medium">
                                    AED{" "}
                                    {(
                                      (selectedPlan.estimatedCost || 50000) *
                                      0.3
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Operational Costs:
                                  </span>
                                  <div className="font-medium">
                                    AED{" "}
                                    {(
                                      (selectedPlan.estimatedCost || 50000) *
                                      0.7
                                    ).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </Card>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Operational Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">
                                Schedule Impact
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              {selectedPlan.estimatedDelay || 0} minute delay
                              expected
                            </p>
                          </div>

                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-800">
                                Passenger Impact
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              {selectedPlan.affectedPassengers || "N/A"}{" "}
                              passengers affected
                            </p>
                          </div>

                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800">
                                Success Probability
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              {selectedPlan.confidence || 80}% confidence in
                              successful resolution
                            </p>
                          </div>

                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-800">
                                Network Impact
                              </span>
                            </div>
                            <p className="text-sm text-purple-700">
                              {selectedPlan.rotationImpact?.networkImpact ||
                                selectedPlan.matchingOption?.rotation_plan
                                  ?.networkImpact ||
                                "Assessment pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="rotation-impact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Impacted Flights - Cancel and Rebook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Alternate Aircraft Choices Impact */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Plane className="h-4 w-4 text-blue-600" />
                          Alternate Aircraft Choices Impact
                        </h4>
                        <div className="space-y-4">
                          {(() => {
                            // Get rotation impact data from API or generate default data
                            const rotationData =
                              selectedOptionForDetails?.matchingOption
                                ?.rotation_plan ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.rotation_impact ||
                              selectedOptionForDetails?.recoveryOptionData?.rotation_plan ||
                              (pendingSolutionData && pendingSolutionData.rotation_impact) ||
                              {};

                            const aircraftOptions = rotationData?.aircraftOptions ||
                              rotationData?.aircraft_options ||
                              rotationData?.alternate_aircraft ||
                              [];

                            if (!aircraftOptions || aircraftOptions.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No alternate aircraft impact data available</p>
                                </div>
                              );
                            }

                            return aircraftOptions.map((aircraft, index) => (
                              <Card key={index} className="border border-blue-200 bg-blue-50">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Plane className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-blue-800">
                                        {aircraft.reg || aircraft.registration || `Aircraft ${index + 1}`}
                                      </span>
                                      <Badge className="bg-blue-100 text-blue-700">
                                        {aircraft.type || aircraft.aircraft_type || 'Type N/A'}
                                      </Badge>
                                    </div>
                                    <Badge
                                      className={
                                        aircraft.availability === 'Available' || aircraft.status === 'available'
                                          ? 'bg-green-100 text-green-700'
                                          : aircraft.availability === 'Limited' || aircraft.status === 'limited'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                      }
                                    >
                                      {aircraft.availability || aircraft.status || 'Unknown'}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <Label className="text-xs text-blue-600">ETOPS Status</Label>
                                      <p className="font-medium">{aircraft.etops?.value || aircraft.etops_status || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-blue-600">Cabin Match</Label>
                                      <p className="font-medium">{aircraft.cabinMatch?.value || aircraft.cabin_match || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-blue-600">Turnaround Time</Label>
                                      <p className="font-medium">{aircraft.turnaround || aircraft.turnaround_time || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-blue-600">Maintenance Status</Label>
                                      <p className="font-medium">{aircraft.maintenance?.value || aircraft.maintenance_status || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {aircraft.option_score && (
                                    <div className="mt-3 p-3 bg-white rounded border">
                                      <Label className="text-xs text-gray-600 mb-2 block">Impact Scores</Label>
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                        <div className="text-center">
                                          <div className="font-medium text-green-600">{aircraft.option_score.cost_score || 'N/A'}</div>
                                          <div className="text-gray-500">Cost</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-blue-600">{aircraft.option_score.delay_score || 'N/A'}</div>
                                          <div className="text-gray-500">Delay</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-purple-600">{aircraft.option_score.crew_impact || 'N/A'}</div>
                                          <div className="text-gray-500">Crew</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-orange-600">{aircraft.option_score.fuel_score || 'N/A'}</div>
                                          <div className="text-gray-500">Fuel</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-flydubai-orange">{aircraft.option_score.overall || 'N/A'}</div>
                                          <div className="text-gray-500">Overall</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Crew Reassignment Impact */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          Crew Reassignment Impact
                        </h4>
                        <div className="space-y-4">
                          {(() => {
                            const rotationData =
                              selectedOptionForDetails?.matchingOption
                                ?.rotation_plan ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.rotation_impact ||
                              selectedOptionForDetails?.recoveryOptionData?.rotation_plan ||
                              (pendingSolutionData && pendingSolutionData.rotation_impact) ||
                              {};

                            const crewImpact = rotationData?.crew ||
                              rotationData?.crew_impact ||
                              rotationData?.crew_reassignments ||
                              [];

                            const reassignedCrewData =
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.reassigned_crew ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.full_details?.reassigned_crew ||
                              (pendingSolutionData && pendingSolutionData.reassigned_crew) ||
                              null;

                            // Combine crew impact and reassigned crew data
                            const allCrewData = [];

                            // Add crew impact data
                            if (Array.isArray(crewImpact)) {
                              allCrewData.push(...crewImpact);
                            }

                            // Add reassigned crew data
                            if (reassignedCrewData && reassignedCrewData.reassignedCrew) {
                              allCrewData.push(...reassignedCrewData.reassignedCrew.map(crew => ({
                                ...crew,
                                isReassigned: true,
                                reassignmentSource: 'Service Page'
                              })));
                            }

                            if (allCrewData.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No crew reassignment impact data available</p>
                                </div>
                              );
                            }

                            return allCrewData.map((crewMember, index) => (
                              <Card key={index} className="border border-purple-200 bg-purple-50">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="h-4 w-4 text-purple-600" />
                                      <span className="font-semibold text-purple-800">
                                        {crewMember.name || `Crew Member ${index + 1}`}
                                      </span>
                                      <Badge className="bg-purple-100 text-purple-700">
                                        {crewMember.role || crewMember.role_code || 'Role N/A'}
                                      </Badge>
                                      {crewMember.isReassigned && (
                                        <Badge className="bg-orange-100 text-orange-700">
                                          Reassigned
                                        </Badge>
                                      )}
                                    </div>
                                    <Badge
                                      className={
                                        crewMember.status === 'Available'
                                          ? 'bg-green-100 text-green-700'
                                          : crewMember.status === 'Limited' || crewMember.status === 'Near Limit'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                      }
                                    >
                                      {crewMember.status || 'Unknown'}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <Label className="text-xs text-purple-600">Base Location</Label>
                                      <p className="font-medium">{crewMember.base || crewMember.base_location || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-purple-600">Experience</Label>
                                      <p className="font-medium">{crewMember.experience_years || crewMember.experience || 'N/A'} years</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-purple-600">Duty Time Remaining</Label>
                                      <p className="font-medium">{crewMember.duty_time_remaining || crewMember.dutyTimeRemaining || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-purple-600">Last Flight</Label>
                                      <p className="font-medium">{crewMember.last_flight_days || crewMember.lastFlight || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {/* Qualifications */}
                                  {crewMember.qualifications && crewMember.qualifications.length > 0 && (
                                    <div className="mt-3">
                                      <Label className="text-xs text-purple-600 mb-2 block">Qualifications</Label>
                                      <div className="flex flex-wrap gap-1">
                                        {crewMember.qualifications.map((qual, qualIndex) => (
                                          <Badge key={qualIndex} variant="outline" className="text-xs">
                                            {typeof qual === 'object' ? qual.name || qual.code : qual}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rotation Impact for this crew member */}
                                  {crewMember.rotation_impact && crewMember.rotation_impact.length > 0 && (
                                    <div className="mt-3 p-3 bg-white rounded border">
                                      <Label className="text-xs text-gray-600 mb-2 block">Rotation Impact</Label>
                                      <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {crewMember.rotation_impact.map((impact, impactIndex) => (
                                          <div key={impactIndex} className="text-xs p-2 bg-gray-50 rounded">
                                            <div className="flex justify-between items-center">
                                              <span className="font-medium">
                                                {impact.flightNumber || 'Flight N/A'}
                                              </span>
                                              <Badge
                                                className={
                                                  impact.impact === 'Low Impact' || impact.impact === 'Minimal'
                                                    ? 'bg-green-100 text-green-600 text-xs'
                                                    : impact.impact === 'Medium Impact' || impact.impact === 'Moderate'
                                                      ? 'bg-yellow-100 text-yellow-600 text-xs'
                                                      : 'bg-red-100 text-red-600 text-xs'
                                                }
                                              >
                                                {impact.impact || 'Unknown Impact'}
                                              </Badge>
                                            </div>
                                            <p className="text-gray-600 mt-1">
                                              {impact.reason || 'No details available'}
                                            </p>
                                            {impact.delay && impact.delay !== 'On Time' && (
                                              <p className="text-orange-600 font-medium">
                                                Delay: {impact.delay}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Reassignment details */}
                                  {crewMember.isReassigned && (
                                    <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                                      <Label className="text-xs text-orange-700 mb-1 block">Reassignment Details</Label>
                                      <div className="text-xs text-orange-800">
                                        {crewMember.replacedCrew && (
                                          <p>Replaced: {crewMember.replacedCrew.name} ({crewMember.replacedCrew.reason})</p>
                                        )}
                                        {crewMember.assignedAt && (
                                          <p>Assigned: {new Date(crewMember.assignedAt).toLocaleString()}</p>
                                        )}
                                        {crewMember.reassignmentSource && (
                                          <p>Source: {crewMember.reassignmentSource}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Summary Impact Metrics */}
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-flydubai-orange" />
                          Overall Rotation Impact Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {(() => {
                            const rotationData =
                              selectedOptionForDetails?.matchingOption
                                ?.rotation_plan ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.rotation_impact ||
                              selectedOptionForDetails?.recoveryOptionData?.rotation_plan ||
                              (pendingSolutionData && pendingSolutionData.rotation_impact) ||
                              {};

                            const metrics = rotationData?.metrics || rotationData?.impact_metrics || {};

                            return (
                              <>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {metrics.aircraftSwaps || metrics.aircraft_swaps || rotationData.aircraftOptions?.length || 0}
                                  </div>
                                  <div className="text-sm text-blue-700">Aircraft Options</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {metrics.crewViolations || metrics.crew_violations || rotationData.crew?.length || 0}
                                  </div>
                                  <div className="text-sm text-purple-700">Crew Changes</div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                  <div className="text-2xl font-bold text-orange-600">
                                    {metrics.networkImpact || metrics.network_impact || 'Low'}
                                  </div>
                                  <div className="text-sm text-orange-700">Network Impact</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600">
                                    {metrics.overallScore || metrics.overall_score || selectedPlan?.confidence || '85'}%
                                  </div>
                                  <div className="text-sm text-green-700">Success Rate</div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                Close
              </Button>
              {selectedPlan &&
                selectedPlan.status &&
                ["Pending Approval", "Under Review", "Pending"].includes(
                  selectedPlan.status,
                ) && (
                  <>
                    <Button
                      onClick={async () => {
                        if (selectedPlan && selectedPlan.id) {
                          await handleApprove(selectedPlan.id);
                          setSelectedPlan(null);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (selectedPlan && selectedPlan.id) {
                          await handleReject(selectedPlan.id);
                          setSelectedPlan(null);
                        }
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={showDetailedOptionAnalysis}
        onOpenChange={setShowDetailedOptionAnalysis}
      >
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detailed Recovery Option Analysis
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of {selectedOptionForDetails?.title} •{" "}
              {selectedOptionForDetails?.id || "A321-007"} for{" "}
              {selectedOptionForDetails?.flightNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOptionForDetails && (
            <Tabs defaultValue="option-details" className="w-full">
              <TabsList
                className={`grid w-full ${
                  selectedPlan?.hasCrewData && selectedPlan?.hasPassengerData
                    ? "grid-cols-5"
                    : selectedPlan?.hasCrewData ||
                        selectedPlan?.hasPassengerData
                      ? "grid-cols-4"
                      : "grid-cols-4"
                }`}
              >
                <TabsTrigger value="option-details">Option Details</TabsTrigger>
                {Object.keys(
                  selectedOptionForDetails?.pending_recovery_solutions ?? {},
                ).length > 0 &&
                  selectedOptionForDetails?.pending_recovery_solutions
                    ?.full_details?.crew_hotel_assignments && (
                    <TabsTrigger value="crew-hotac">Crew & HOTAC</TabsTrigger>
                  )}

                {Object.keys(
                  selectedOptionForDetails?.pending_recovery_solutions ?? {},
                ).length > 0 &&
                  selectedOptionForDetails?.pending_recovery_solutions
                    ?.full_details?.passenger_rebooking && (
                    <TabsTrigger value="passenger-reaccommodation">
                      Passenger Re-accommodation
                    </TabsTrigger>
                  )}
                <TabsTrigger value="rotation-impact">
                  Rotation Impact
                </TabsTrigger>
              </TabsList>

              <TabsContent value="option-details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Option Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">
                            {selectedOptionForDetails.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedOptionForDetails.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Total Cost:
                              </span>
                              <span className="font-medium text-flydubai-orange">
                                {selectedOptionForDetails.cost}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Timeline:
                              </span>
                              <span className="font-medium">
                                {selectedOptionForDetails.timeline}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Confidence:
                              </span>
                              <span className="font-medium">
                                {selectedOptionForDetails.confidence}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Impact:
                              </span>
                              <span className="font-medium">
                                {selectedOptionForDetails.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">
                            Key Performance Indicators
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Success Rate</span>
                                <span>
                                  {selectedOptionForDetails.confidence}%
                                </span>
                              </div>
                              <Progress
                                value={selectedOptionForDetails.confidence}
                                className="h-2"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Customer Satisfaction</span>
                                <span>88%</span>
                              </div>
                              <Progress value={88} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Operational Risk</span>
                                <span className="text-green-600">Low</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Easy
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Operational Risk</span>
                                <span className="text-red-600">High</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Easy
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="crew-hotac" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Crew & HOTAC Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Get crew data from selected option details
                      const crewData =
                        selectedOptionForDetails?.pending_recovery_solutions
                          ?.full_details?.crew_hotel_assignments;
                      const hasCrewData =
                        crewData && Object.keys(crewData).length > 0;
                      if (!hasCrewData) {
                        return (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800">
                                No crew changes required.
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              Current crew certified for{" "}
                              {selectedOptionForDetails?.id || "A321-007"}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          {crewData.map((assignment, index) => (
                            <div key={index} className="space-y-6">
                              {/* Hotel Overview */}
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-lg font-semibold">
                                  {assignment.hotel_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {assignment.hotel_location}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Room: {assignment.room_number}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Booking Ref: {assignment.booking_reference}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Status: {assignment.assignment_status}
                                </p>
                              </div>

                              {/* Crew Members Table */}
                              <div>
                                <h4 className="font-medium mb-3">
                                  Crew Assignment Details
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse border border-gray-200 text-sm">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="border border-gray-200 p-3 text-left">
                                          Name
                                        </th>
                                        <th className="border border-gray-200 p-3 text-left">
                                          Rank
                                        </th>
                                        <th className="border border-gray-200 p-3 text-left">
                                          Base
                                        </th>
                                        <th className="border border-gray-200 p-3 text-left">
                                          Employee ID
                                        </th>
                                        <th className="border border-gray-200 p-3 text-left">
                                          Contact
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {assignment.crew_member.map(
                                        (crew, crewIndex) => (
                                          <tr
                                            key={crewIndex}
                                            className={
                                              crewIndex % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                            }
                                          >
                                            <td className="border border-gray-200 p-3">
                                              {crew.name}
                                            </td>
                                            <td className="border border-gray-200 p-3">
                                              {crew.rank}
                                            </td>
                                            <td className="border border-gray-200 p-3">
                                              {crew.base}
                                            </td>
                                            <td className="border border-gray-200 p-3">
                                              {crew.employee_id}
                                            </td>
                                            <td className="border border-gray-200 p-3">
                                              {crew.contact_number}
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Transport Info */}
                              {assignment.transport_details && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <h4 className="font-medium mb-2">
                                    Transport Details
                                  </h4>
                                  <p className="text-sm">
                                    Vendor:{" "}
                                    {assignment.transport_details.vendor}
                                  </p>
                                  <p className="text-sm">
                                    Pickup:{" "}
                                    {
                                      assignment.transport_details
                                        .pickup_location
                                    }{" "}
                                    at{" "}
                                    {new Date(
                                      assignment.transport_details.pickup_time,
                                    ).toLocaleString()}
                                  </p>
                                  <p className="text-sm">
                                    Dropoff:{" "}
                                    {
                                      assignment.transport_details
                                        .dropoff_location
                                    }{" "}
                                    at{" "}
                                    {new Date(
                                      assignment.transport_details.dropoff_time,
                                    ).toLocaleString()}
                                  </p>
                                  <p className="text-sm">
                                    Vehicle:{" "}
                                    {assignment.transport_details.vehicle_type}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="passenger-reaccommodation"
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Passenger Re-accommodation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                          {
                            selectedOptionForDetails
                              ?.pending_recovery_solutions?.full_details
                              ?.passenger_impact?.affected
                          }
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {
                            selectedOptionForDetails
                              ?.pending_recovery_solutions?.full_details
                              ?.passenger_impact?.reaccommodated
                          }
                        </div>
                        <div className="text-sm text-green-700">
                          Same Flight
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">0</div>
                        <div className="text-sm text-red-700">
                          Other Flights
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">
                          Accommodation Breakdown
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Meal Vouchers:</span>
                            <span className="font-medium">0 passengers</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Hotel Accommodation:
                            </span>
                            <span className="font-medium">0 passengers</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Compensation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">
                              AED{" "}
                              {
                                selectedOptionForDetails
                                  ?.pending_recovery_solutions?.full_details
                                  ?.passenger_impact?.affected
                              }{" "}
                              per passenger (AED261):
                            </span>
                            <span className="font-medium">
                              AED{" "}
                              {
                                selectedOptionForDetails
                                  .pending_recovery_solutions?.full_details
                                  ?.passenger_impact?.affected
                              }{" "}
                              per passenger (AED261):
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Re-accommodation Details:
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        All passengers accommodated on same aircraft with 65min
                        delay.
                      </p>
                    </div>

                    {/* PNR Grouped Passenger Details */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">
                        Passenger Rebookings by PNR
                      </h4>
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {(() => {
                          const rawPassengerData =
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.full_details?.passenger_rebooking ||
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.passenger_rebooking ||
                            [];

                          // Ensure currentPassengerData is always an array
                          const currentPassengerData = Array.isArray(rawPassengerData)
                            ? rawPassengerData
                            : [];

                          if (
                            !currentPassengerData ||
                            currentPassengerData.length === 0
                          ) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                No passenger rebooking data available
                              </div>
                            );
                          }

                          // Group passengers by PNR
                          const passengersByPnr = currentPassengerData.reduce(
                            (acc, passenger) => {
                              const pnr = passenger.pnr || "Unknown";
                              if (!acc[pnr]) {
                                acc[pnr] = [];
                              }
                              acc[pnr].push(passenger);
                              return acc;
                            },
                            {},
                          );

                          return Object.entries(passengersByPnr)
                            .slice(0, 8)
                            .map(([pnr, passengers], groupIndex) => (
                              <Card
                                key={groupIndex}
                                className="border border-gray-200"
                              >
                                <div className="p-3 bg-gray-50 border-b">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-gray-900">
                                        PNR: {pnr}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800"
                                      >
                                        {(passengers as any).length} passenger
                                        {(passengers as any).length > 1
                                          ? "s"
                                          : ""}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Group Booking
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3 space-y-3">
                                  {(passengers as any).map(
                                    (passenger, passengerIndex) => (
                                      <div
                                        key={passengerIndex}
                                        className="border-l-2 border-blue-200 pl-3"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="font-medium text-gray-900">
                                            {passenger.passenger_name ||
                                              `Passenger ${passengerIndex + 1}`}
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
                                              "Unknown"}
                                          </Badge>
                                        </div>
                                        <div className="text-sm space-y-1">
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
                                              {passenger.rebooked_flight ||
                                                "TBD"}
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
                                                : "N/A"}
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
                                            passenger.additional_services
                                              .length > 0 && (
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                  Services:
                                                </span>
                                                <span className="text-xs">
                                                  {passenger.additional_services.map(
                                                    (service, serviceIndex) => (
                                                      <Badge
                                                        key={serviceIndex}
                                                        variant="outline"
                                                        className="mr-1 text-xs"
                                                      >
                                                        {service.service_type ||
                                                          service}
                                                      </Badge>
                                                    ),
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                          {passenger.notes && (
                                            <div className="text-xs text-muted-foreground mt-2">
                                              Notes: {passenger.notes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </Card>
                            ));
                        })()}
                        {(() => {
                          const rawPassengerData =
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.full_details?.passenger_rebooking ||
                            selectedOptionForDetails?.pending_recovery_solutions
                              ?.passenger_rebooking ||
                            [];

                          const groupCount = Array.isArray(rawPassengerData)
                            ? Object.keys(
                                rawPassengerData.reduce(
                                  (acc, passenger) => {
                                    const pnr = passenger.pnr || "UNKNOWN";
                                    if (!acc[pnr]) acc[pnr] = [];
                                    acc[pnr].push(passenger);
                                    return acc;
                                  },
                                  {},
                                ),
                              ).length
                            : 0;

                          return (
                            groupCount > 8 && (
                              <div className="text-center text-sm text-muted-foreground p-2">
                                ... and {groupCount - 8} more PNR groups
                              </div>
                            )
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rotation-impact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Rotation Impact Analysis
                      {loadingPendingData && (
                        <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Alternate Aircraft Choices Impact */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Plane className="h-4 w-4 text-blue-600" />
                          Alternate Aircraft Choices Impact
                        </h4>
                        <div className="space-y-4">
                          {(() => {
                            // Get rotation impact data from API or generate default data
                            const rotationData =
                              selectedOptionForDetails?.matchingOption
                                ?.rotation_plan ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.rotation_impact ||
                              selectedOptionForDetails?.recoveryOptionData?.rotation_plan ||
                              (pendingSolutionData && pendingSolutionData.rotation_impact) ||
                              {};

                            const aircraftOptions = rotationData?.aircraftOptions ||
                              rotationData?.aircraft_options ||
                              rotationData?.alternate_aircraft ||
                              [];

                            if (!aircraftOptions || aircraftOptions.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No alternate aircraft impact data available</p>
                                </div>
                              );
                            }

                            return aircraftOptions.map((aircraft, index) => (
                              <Card key={index} className="border border-blue-200 bg-blue-50">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Plane className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-blue-800">
                                        {aircraft.reg || aircraft.registration || `Aircraft ${index + 1}`}
                                      </span>
                                      <Badge className="bg-blue-100 text-blue-700">
                                        {aircraft.type || aircraft.aircraft_type || 'Type N/A'}
                                      </Badge>
                                    </div>
                                    <Badge
                                      className={
                                        aircraft.availability === 'Available' || aircraft.status === 'available'
                                          ? 'bg-green-100 text-green-700'
                                          : aircraft.availability === 'Limited' || aircraft.status === 'limited'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                      }
                                    >
                                      {aircraft.availability || aircraft.status || 'Unknown'}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <Label className="text-xs text-blue-600">ETOPS Status</Label>
                                      <p className="font-medium">{aircraft.etops?.value || aircraft.etops_status || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-blue-600">Cabin Match</Label>
                                      <p className="font-medium">{aircraft.cabinMatch?.value || aircraft.cabin_match || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-blue-600">Turnaround Time</Label>
                                      <p className="font-medium">{aircraft.turnaround || aircraft.turnaround_time || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-blue-600">Maintenance Status</Label>
                                      <p className="font-medium">{aircraft.maintenance?.value || aircraft.maintenance_status || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {aircraft.option_score && (
                                    <div className="mt-3 p-3 bg-white rounded border">
                                      <Label className="text-xs text-gray-600 mb-2 block">Impact Scores</Label>
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                        <div className="text-center">
                                          <div className="font-medium text-green-600">{aircraft.option_score.cost_score || 'N/A'}</div>
                                          <div className="text-gray-500">Cost</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-blue-600">{aircraft.option_score.delay_score || 'N/A'}</div>
                                          <div className="text-gray-500">Delay</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-purple-600">{aircraft.option_score.crew_impact || 'N/A'}</div>
                                          <div className="text-gray-500">Crew</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-orange-600">{aircraft.option_score.fuel_score || 'N/A'}</div>
                                          <div className="text-gray-500">Fuel</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="font-medium text-flydubai-orange">{aircraft.option_score.overall || 'N/A'}</div>
                                          <div className="text-gray-500">Overall</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Crew Reassignment Impact */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          Crew Reassignment Impact
                        </h4>
                        <div className="space-y-4">
                          {(() => {
                            const rotationData =
                              selectedOptionForDetails?.matchingOption
                                ?.rotation_plan ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.rotation_impact ||
                              selectedOptionForDetails?.recoveryOptionData?.rotation_plan ||
                              (pendingSolutionData && pendingSolutionData.rotation_impact) ||
                              {};

                            const crewImpact = rotationData?.crew ||
                              rotationData?.crew_impact ||
                              rotationData?.crew_reassignments ||
                              [];

                            const reassignedCrewData =
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.reassigned_crew ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.full_details?.reassigned_crew ||
                              (pendingSolutionData && pendingSolutionData.reassigned_crew) ||
                              null;

                            // Combine crew impact and reassigned crew data
                            const allCrewData = [];

                            // Add crew impact data
                            if (Array.isArray(crewImpact)) {
                              allCrewData.push(...crewImpact);
                            }

                            // Add reassigned crew data
                            if (reassignedCrewData && reassignedCrewData.reassignedCrew) {
                              allCrewData.push(...reassignedCrewData.reassignedCrew.map(crew => ({
                                ...crew,
                                isReassigned: true,
                                reassignmentSource: 'Service Page'
                              })));
                            }

                            if (allCrewData.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No crew reassignment impact data available</p>
                                </div>
                              );
                            }

                            return allCrewData.map((crewMember, index) => (
                              <Card key={index} className="border border-purple-200 bg-purple-50">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="h-4 w-4 text-purple-600" />
                                      <span className="font-semibold text-purple-800">
                                        {crewMember.name || `Crew Member ${index + 1}`}
                                      </span>
                                      <Badge className="bg-purple-100 text-purple-700">
                                        {crewMember.role || crewMember.role_code || 'Role N/A'}
                                      </Badge>
                                      {crewMember.isReassigned && (
                                        <Badge className="bg-orange-100 text-orange-700">
                                          Reassigned
                                        </Badge>
                                      )}
                                    </div>
                                    <Badge
                                      className={
                                        crewMember.status === 'Available'
                                          ? 'bg-green-100 text-green-700'
                                          : crewMember.status === 'Limited' || crewMember.status === 'Near Limit'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                      }
                                    >
                                      {crewMember.status || 'Unknown'}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <Label className="text-xs text-purple-600">Base Location</Label>
                                      <p className="font-medium">{crewMember.base || crewMember.base_location || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-purple-600">Experience</Label>
                                      <p className="font-medium">{crewMember.experience_years || crewMember.experience || 'N/A'} years</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-purple-600">Duty Time Remaining</Label>
                                      <p className="font-medium">{crewMember.duty_time_remaining || crewMember.dutyTimeRemaining || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-purple-600">Last Flight</Label>
                                      <p className="font-medium">{crewMember.last_flight_days || crewMember.lastFlight || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {/* Qualifications */}
                                  {crewMember.qualifications && crewMember.qualifications.length > 0 && (
                                    <div className="mt-3">
                                      <Label className="text-xs text-purple-600 mb-2 block">Qualifications</Label>
                                      <div className="flex flex-wrap gap-1">
                                        {crewMember.qualifications.map((qual, qualIndex) => (
                                          <Badge key={qualIndex} variant="outline" className="text-xs">
                                            {typeof qual === 'object' ? qual.name || qual.code : qual}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Rotation Impact for this crew member */}
                                  {crewMember.rotation_impact && crewMember.rotation_impact.length > 0 && (
                                    <div className="mt-3 p-3 bg-white rounded border">
                                      <Label className="text-xs text-gray-600 mb-2 block">Rotation Impact</Label>
                                      <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {crewMember.rotation_impact.map((impact, impactIndex) => (
                                          <div key={impactIndex} className="text-xs p-2 bg-gray-50 rounded">
                                            <div className="flex justify-between items-center">
                                              <span className="font-medium">
                                                {impact.flightNumber || 'Flight N/A'}
                                              </span>
                                              <Badge
                                                className={
                                                  impact.impact === 'Low Impact' || impact.impact === 'Minimal'
                                                    ? 'bg-green-100 text-green-600 text-xs'
                                                    : impact.impact === 'Medium Impact' || impact.impact === 'Moderate'
                                                      ? 'bg-yellow-100 text-yellow-600 text-xs'
                                                      : 'bg-red-100 text-red-600 text-xs'
                                                }
                                              >
                                                {impact.impact || 'Unknown Impact'}
                                              </Badge>
                                            </div>
                                            <p className="text-gray-600 mt-1">
                                              {impact.reason || 'No details available'}
                                            </p>
                                            {impact.delay && impact.delay !== 'On Time' && (
                                              <p className="text-orange-600 font-medium">
                                                Delay: {impact.delay}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Reassignment details */}
                                  {crewMember.isReassigned && (
                                    <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                                      <Label className="text-xs text-orange-700 mb-1 block">Reassignment Details</Label>
                                      <div className="text-xs text-orange-800">
                                        {crewMember.replacedCrew && (
                                          <p>Replaced: {crewMember.replacedCrew.name} ({crewMember.replacedCrew.reason})</p>
                                        )}
                                        {crewMember.assignedAt && (
                                          <p>Assigned: {new Date(crewMember.assignedAt).toLocaleString()}</p>
                                        )}
                                        {crewMember.reassignmentSource && (
                                          <p>Source: {crewMember.reassignmentSource}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Summary Impact Metrics */}
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-flydubai-orange" />
                          Overall Rotation Impact Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {(() => {
                            const rotationData =
                              selectedOptionForDetails?.matchingOption
                                ?.rotation_plan ||
                              selectedOptionForDetails?.pending_recovery_solutions
                                ?.rotation_impact ||
                              selectedOptionForDetails?.recoveryOptionData?.rotation_plan ||
                              (pendingSolutionData && pendingSolutionData.rotation_impact) ||
                              {};

                            const metrics = rotationData?.metrics || rotationData?.impact_metrics || {};

                            return (
                              <>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {metrics.aircraftSwaps || metrics.aircraft_swaps || rotationData.aircraftOptions?.length || 0}
                                  </div>
                                  <div className="text-sm text-blue-700">Aircraft Options</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {metrics.crewViolations || metrics.crew_violations || rotationData.crew?.length || 0}
                                  </div>
                                  <div className="text-sm text-purple-700">Crew Changes</div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                  <div className="text-2xl font-bold text-orange-600">
                                    {metrics.networkImpact || metrics.network_impact || 'Low'}
                                  </div>
                                  <div className="text-sm text-orange-700">Network Impact</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600">
                                    {metrics.overallScore || metrics.overall_score || selectedPlan?.confidence || '85'}%
                                  </div>
                                  <div className="text-sm text-green-700">Success Rate</div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>
              Close
            </Button>
            {selectedPlan &&
              selectedPlan.status &&
              ["Pending Approval", "Under Review", "Pending"].includes(
                selectedPlan.status,
              ) && (
                <>
                  <Button
                    onClick={async () => {
                      if (selectedPlan && selectedPlan.id) {
                        await handleApprove(selectedPlan.id);
                        setSelectedPlan(null);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (selectedPlan && selectedPlan.id) {
                        await handleReject(selectedPlan.id);
                        setSelectedPlan(null);
                      }
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}