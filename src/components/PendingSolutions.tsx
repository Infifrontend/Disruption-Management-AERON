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
  Calculator,
} from "lucide-react";
import { databaseService } from "../services/databaseService";
import { useAirlineTheme } from "./../hooks/useAirlineTheme";

export function PendingSolutions() {
  const { airlineConfig } = useAirlineTheme();
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
        const safeRecoveryOptionsData = Array.isArray(recoveryOptionsData)
          ? recoveryOptionsData
          : [];

        if (safeRecoveryOptionsData.length > 0 && plan.optionId) {
          matchingOption = safeRecoveryOptionsData.find(
            (opt) =>
              opt.id === plan.optionId || opt.option_id === plan.optionId,
          );
        }

        // Parse crew and passenger data from the matching option or find selected option
        let crewData = null;
        let passengerData = null;
        let selectedOption = matchingOption;

        // If no matching option found but we have recovery options, find the selected one by option_id
        if (
          !selectedOption &&
          safeRecoveryOptionsData.length > 0 &&
          plan.optionId
        ) {
          selectedOption = safeRecoveryOptionsData.find(
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
          recoveryOptions: safeRecoveryOptionsData,
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
        if (
          transformedPlan.recoveryOptions &&
          Array.isArray(transformedPlan.recoveryOptions)
        ) {
          transformedPlan.recoveryOptions.forEach((opt, idx) => {
            console.log(`Recovery option ${idx}:`, {
              id: opt.id,
              option_id: opt.option_id,
              title: opt.title,
              matches:
                opt.id === transformedPlan.optionId ||
                opt.option_id === transformedPlan.optionId ||
                opt.id === parseInt(transformedPlan.optionId) ||
                opt.option_id === parseInt(transformedPlan.optionId),
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
        `${airlineConfig.currency} ${(option.estimated_cost || plan.estimatedCost || 50000).toLocaleString()}`,
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
            <Badge variant="destructive" className="ml-1 flex-shrink-0  text-red-600">
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
                              {airlineConfig.currency}{" "}
                              {(plan.estimatedCost / 1000).toFixed(0)}K •{" "}
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
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
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

            <Tabs defaultValue="overview" className="w-full">
              <TabsList
                className={`grid w-full ${
                  selectedPlan?.hasCrewData && selectedPlan?.hasPassengerData
                    ? "grid-cols-5"
                    : selectedPlan?.hasCrewData ||
                        selectedPlan?.hasPassengerData
                      ? "grid-cols-4"
                      : "grid-cols-3"
                }`}
              >
                <TabsTrigger value="overview">
                  Recovery Options Overview
                </TabsTrigger>
                <TabsTrigger value="flight">Flight Details</TabsTrigger>
                <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
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
                      Available recovery options for {selectedPlan.flightNumber}{" "}
                      • {selectedPlan.route}
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
                                      <span className="text-gray-600">
                                        Cost:
                                      </span>
                                      <div className="font-medium">
                                        {option.cost ||
                                          `${airlineConfig.currency} ${(option.estimated_cost || 0).toLocaleString()}`}
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

              <TabsContent value="flight" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                  selectedPlan.flightDetails
                                    .scheduled_departure,
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
                                  selectedPlan.flightDetails
                                    .estimated_departure,
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
                            <Badge
                              className={getStatusColor(selectedPlan.status)}
                            >
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
                </div>
              </TabsContent>

              <TabsContent value="impact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Impact Analysis
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive impact assessment for recovery options
                    </p>
                  </CardHeader>
                  <CardContent>
                    {selectedPlan.recoveryOptions &&
                    selectedPlan.recoveryOptions.length > 0 ? (
                      <div className="space-y-6">
                        {/* Recovery Options Comparison */}
                        <div>
                          <h4 className="font-medium mb-4">
                            Recovery Options Comparison
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedPlan.recoveryOptions
                              .slice(0, 3)
                              .map((option, index) => {
                                const isSelected =
                                  selectedPlan.optionId &&
                                  (option.id === selectedPlan.optionId ||
                                    option.option_id === selectedPlan.optionId ||
                                    String(option.id) ===
                                      String(selectedPlan.optionId) ||
                                    String(option.option_id) ===
                                      String(selectedPlan.optionId));

                                // Extract cost from option
                                let optionCost = "N/A";
                                if (option.cost) {
                                  if (typeof option.cost === 'string') {
                                    const numericValue = parseInt(option.cost.replace(/[^0-9]/g, ""));
                                    optionCost = `${airlineConfig.currency} ${numericValue.toLocaleString()}`;
                                  } else {
                                    optionCost = `${airlineConfig.currency} ${option.cost.toLocaleString()}`;
                                  }
                                }

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
                                      <div className="flex justify-between items-start mb-3">
                                        <h5
                                          className={`font-medium text-sm ${isSelected ? "text-orange-800" : ""}`}
                                        >
                                          Option {String.fromCharCode(65 + index)}: {option.title}
                                        </h5>
                                        {isSelected && (
                                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                                            Selected
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Cost:
                                          </span>
                                          <span className="font-medium">
                                            {optionCost}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Timeline:
                                          </span>
                                          <span className="font-medium">
                                            {option.timeline || "TBD"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Confidence:
                                          </span>
                                          <span className="font-medium">
                                            {option.confidence || 80}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Impact:
                                          </span>
                                          <span className="font-medium">
                                            {option.impact || "Medium"}
                                          </span>
                                        </div>
                                        {/* Risk Level */}
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Risk:
                                          </span>
                                          <Badge
                                            className={
                                              (option.riskAssessment?.technicalRisk || "Medium") === "Low"
                                                ? "bg-green-100 text-green-700"
                                                : (option.riskAssessment?.technicalRisk || "Medium") === "Medium"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                            }
                                          >
                                            {option.riskAssessment?.technicalRisk || "Medium"}
                                          </Badge>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                          </div>
                        </div>

                        {/* Cost Impact Analysis for Selected Option */}
                        {selectedPlan.matchingOption && (
                          <div>
                            <h4 className="font-medium mb-4">
                              Detailed Cost Analysis - Selected Option
                            </h4>
                            <Card className="border-blue-200 bg-blue-50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-4">
                                  <DollarSign className="h-5 w-5 text-blue-600" />
                                  <h5 className="font-medium text-blue-800">
                                    {selectedPlan.matchingOption.title}
                                  </h5>
                                  <Badge className="bg-blue-100 text-blue-700">
                                    Selected for Execution
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Cost Breakdown */}
                                  <div>
                                    <h6 className="font-medium text-sm mb-3 flex items-center gap-2">
                                      <Calculator className="h-4 w-4" />
                                      Cost Breakdown
                                    </h6>
                                    {selectedPlan.matchingOption.cost_breakdown &&
                                    Array.isArray(
                                      selectedPlan.matchingOption.cost_breakdown,
                                    ) ? (
                                      <div className="space-y-3">
                                        {selectedPlan.matchingOption.cost_breakdown.map(
                                          (item, index) => (
                                            <div
                                              key={index}
                                              className="bg-white rounded-lg p-3 border"
                                            >
                                              <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium">
                                                  {item.category}
                                                </span>
                                                <span className="font-bold text-blue-600">
                                                  {item.amount}
                                                </span>
                                              </div>
                                              <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">
                                                  {item.description}
                                                </span>
                                                <span className="text-blue-600 font-medium">
                                                  {item.percentage}%
                                                </span>
                                              </div>
                                              <Progress
                                                value={item.percentage}
                                                className="h-1 mt-2"
                                              />
                                            </div>
                                          ),
                                        )}
                                        <Separator className="my-3" />
                                        <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
                                          <div className="flex justify-between items-center font-bold text-lg">
                                            <span>Total Cost:</span>
                                            <span className="text-blue-600">
                                              {selectedPlan.matchingOption.cost ||
                                                `${airlineConfig.currency} ${selectedPlan.estimatedCost?.toLocaleString() || "0"}`}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-white rounded-lg p-4 border">
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Total Cost:</span>
                                          <span className="font-bold text-blue-600 text-lg">
                                            {selectedPlan.matchingOption.cost ||
                                              `${airlineConfig.currency} ${selectedPlan.estimatedCost?.toLocaleString() || "0"}`}
                                          </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                          Detailed breakdown not available
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Impact Metrics */}
                                  <div>
                                    <h6 className="font-medium text-sm mb-3 flex items-center gap-2">
                                      <Activity className="h-4 w-4" />
                                      Impact Metrics
                                    </h6>
                                    <div className="space-y-3">
                                      <div className="bg-white rounded-lg p-3 border">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium">
                                            Passengers Affected:
                                          </span>
                                          <span className="font-bold text-orange-600">
                                            {selectedPlan.affectedPassengers || 0}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="bg-white rounded-lg p-3 border">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium">
                                            Delay Time:
                                          </span>
                                          <span className="font-bold text-yellow-600">
                                            {selectedPlan.estimatedDelay || 0} min
                                          </span>
                                        </div>
                                      </div>
                                      <div className="bg-white rounded-lg p-3 border">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium">
                                            Success Probability:
                                          </span>
                                          <span className="font-bold text-green-600">
                                            {selectedPlan.confidence || 80}%
                                          </span>
                                        </div>
                                      </div>
                                      <div className="bg-white rounded-lg p-3 border">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium">
                                            Implementation Time:
                                          </span>
                                          <span className="font-bold text-purple-600">
                                            {selectedPlan.matchingOption.timeline || selectedPlan.timeline || "TBD"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="bg-white rounded-lg p-3 border">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium">
                                            Impact Level:
                                          </span>
                                          <Badge
                                            className={
                                              (selectedPlan.matchingOption.impact || "Medium") === "Low" || (selectedPlan.matchingOption.impact || "Medium") === "Minimal"
                                                ? "bg-green-100 text-green-700"
                                                : (selectedPlan.matchingOption.impact || "Medium") === "Medium" || (selectedPlan.matchingOption.impact || "Medium") === "Moderate"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                            }
                                          >
                                            {selectedPlan.matchingOption.impact || "Medium"}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Details */}
                                {selectedPlan.matchingOption.description && (
                                  <div className="mt-6">
                                    <h6 className="font-medium text-sm mb-2 flex items-center gap-2">
                                      <Info className="h-4 w-4" />
                                      Solution Details
                                    </h6>
                                    <div className="bg-white rounded-lg p-4 border">
                                      <p className="text-sm text-muted-foreground">
                                        {selectedPlan.matchingOption.description}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Comparative Analysis Summary */}
                        <div>
                          <h4 className="font-medium mb-4">
                            Comparative Analysis Summary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-sm">
                                    Time Impact
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {selectedPlan.estimatedDelay || 0}m
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Selected option delay
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="h-4 w-4 text-orange-600" />
                                  <span className="font-medium text-sm">
                                    Passenger Impact
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                  {selectedPlan.affectedPassengers || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Passengers affected
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-sm">
                                    Cost Impact
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                  {airlineConfig.currency}{" "}
                                  {(
                                    selectedPlan.estimatedCost / 1000
                                  ).toFixed(0)}
                                  K
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Total estimated cost
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium text-sm">
                                    Success Rate
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-purple-600">
                                  {selectedPlan.confidence || 80}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Confidence level
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Recovery Options Available
                        </h3>
                        <p className="text-muted-foreground">
                          No recovery options data available for impact
                          analysis.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {selectedPlan?.hasPassengerData && (
                <TabsContent
                  value="passenger-reaccommodation"
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  return passengerData.length;
                                }
                                return selectedPlan?.affectedPassengers || 167;
                              })()}
                            </div>
                            <div className="text-sm text-blue-700">
                              Total Affected
                            </div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const sameFlightCount = passengerData.filter(
                                    (p) =>
                                      p.rebooked_flight === p.original_flight ||
                                      p.rebooking_status === "same_flight" ||
                                      p.status === "same_flight" ||
                                      !p.rebooked_flight ||
                                      p.rebooked_flight ===
                                        selectedPlan.flightNumber,
                                  ).length;
                                  return sameFlightCount;
                                }
                                return selectedPlan?.affectedPassengers || 167;
                              })()}
                            </div>
                            <div className="text-sm text-green-700">
                              Same Flight
                            </div>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-3xl font-bold text-red-600">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const otherFlightCount = passengerData.filter(
                                    (p) =>
                                      p.rebooked_flight &&
                                      p.rebooked_flight !== p.original_flight &&
                                      p.rebooked_flight !==
                                        selectedPlan.flightNumber &&
                                      p.rebooking_status !== "same_flight" &&
                                      p.status !== "same_flight",
                                  ).length;
                                  return otherFlightCount;
                                }
                                return 0;
                              })()}
                            </div>
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
                                <span className="font-medium">
                                  {(() => {
                                    const passengerData =
                                      selectedPlan?.passengerInformation ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_rebooking ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_information ||
                                      [];

                                    if (
                                      Array.isArray(passengerData) &&
                                      passengerData.length > 0
                                    ) {
                                      const mealVoucherCount =
                                        passengerData.filter((p) => {
                                          if (
                                            p.additional_services &&
                                            Array.isArray(p.additional_services)
                                          ) {
                                            return p.additional_services.some(
                                              (s) =>
                                                typeof s === "string"
                                                  ? s
                                                      .toLowerCase()
                                                      .includes("meal")
                                                  : s.service_type
                                                      ?.toLowerCase()
                                                      .includes("meal") ||
                                                    s.type
                                                      ?.toLowerCase()
                                                      .includes("meal"),
                                            );
                                          }
                                          return (
                                            p.services?.includes("meal") ||
                                            p.meal_voucher ||
                                            false
                                          );
                                        }).length;
                                      return `${mealVoucherCount} passengers`;
                                    }

                                    const delayMinutes =
                                      selectedPlan?.estimatedDelay || 0;
                                    if (delayMinutes > 120) {
                                      const affected =
                                        selectedPlan?.affectedPassengers || 167;
                                      return `${affected} passengers`;
                                    }
                                    return "0 passengers";
                                  })()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">
                                  Hotel Accommodation:
                                </span>
                                <span className="font-medium">
                                  {(() => {
                                    const passengerData =
                                      selectedPlan?.passengerInformation ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_rebooking ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_information ||
                                      [];

                                    if (
                                      Array.isArray(passengerData) &&
                                      passengerData.length > 0
                                    ) {
                                      const hotelCount = passengerData.filter(
                                        (p) => {
                                          if (
                                            p.additional_services &&
                                            Array.isArray(p.additional_services)
                                          ) {
                                            return p.additional_services.some(
                                              (s) =>
                                                typeof s === "string"
                                                  ? s
                                                      .toLowerCase()
                                                      .includes("hotel")
                                                  : s.service_type
                                                      ?.toLowerCase()
                                                      .includes("hotel") ||
                                                    s.type
                                                      ?.toLowerCase()
                                                      .includes("hotel") ||
                                                    s.service_type
                                                      ?.toLowerCase()
                                                      .includes("accommodation"),
                                            );
                                          }
                                          return (
                                            p.services?.includes("hotel") ||
                                            p.hotel_accommodation ||
                                            false
                                          );
                                        },
                                      ).length;
                                      return `${hotelCount} passengers`;
                                    }

                                    const delayMinutes =
                                      selectedPlan?.estimatedDelay || 0;
                                    if (delayMinutes > 240) {
                                      const affected =
                                        selectedPlan?.affectedPassengers || 167;
                                      return `${Math.floor(affected * 0.8)} passengers`;
                                    }
                                    return "0 passengers";
                                  })()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Transportation:</span>
                                <span className="font-medium">
                                  {(() => {
                                    const passengerData =
                                      selectedPlan?.passengerInformation ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_rebooking ||
                                      [];

                                    if (
                                      Array.isArray(passengerData) &&
                                      passengerData.length > 0
                                    ) {
                                      const transportCount =
                                        passengerData.filter((p) => {
                                          if (
                                            p.additional_services &&
                                            Array.isArray(p.additional_services)
                                          ) {
                                            return p.additional_services.some(
                                              (s) =>
                                                typeof s === "string"
                                                  ? s
                                                      .toLowerCase()
                                                      .includes("transport")
                                                  : s.service_type
                                                      ?.toLowerCase()
                                                      .includes("transport") ||
                                                    s.type
                                                      ?.toLowerCase()
                                                      .includes("transport"),
                                            );
                                          }
                                          return (
                                            p.services?.includes("transport") ||
                                            p.transportation ||
                                            false
                                          );
                                        }).length;
                                      return `${transportCount} passengers`;
                                    }

                                    const delayMinutes =
                                      selectedPlan?.estimatedDelay || 0;
                                    if (delayMinutes > 240) {
                                      const affected =
                                        selectedPlan?.affectedPassengers || 167;
                                      return `${Math.floor(affected * 0.8)} passengers`;
                                    }
                                    return "0 passengers";
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Compensation</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">
                                  Per passenger avg:
                                </span>
                                <span className="font-medium">
                                  {(() => {
                                    const passengerData =
                                      selectedPlan?.passengerInformation ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_rebooking ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_information ||
                                      [];

                                    if (
                                      Array.isArray(passengerData) &&
                                      passengerData.length > 0
                                    ) {
                                      const totalCost = passengerData.reduce(
                                        (sum, p) =>
                                          sum +
                                          (p.rebooking_cost ||
                                            p.compensation_amount ||
                                            261),
                                        0,
                                      );
                                      const avgCompensation =
                                        totalCost / passengerData.length;
                                      return `${airlineConfig.currency} ${Math.round(avgCompensation)}`;
                                    }
                                    return `${airlineConfig.currency} 261`;
                                  })()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">
                                  Total compensation:
                                </span>
                                <span className="font-medium">
                                  {(() => {
                                    const passengerData =
                                      selectedPlan?.passengerInformation ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_rebooking ||
                                      selectedPlan?.matchingOption
                                        ?.passenger_information ||
                                      [];

                                    if (
                                      Array.isArray(passengerData) &&
                                      passengerData.length > 0
                                    ) {
                                      const totalCompensation =
                                        passengerData.reduce(
                                          (sum, p) =>
                                            sum +
                                            (p.rebooking_cost ||
                                              p.compensation_amount ||
                                              261),
                                          0,
                                        );
                                      return `${airlineConfig.currency} ${totalCompensation.toLocaleString()}`;
                                    }

                                    const affected =
                                      selectedPlan?.affectedPassengers || 167;
                                    return `${airlineConfig.currency} ${(affected * 261).toLocaleString()}`;
                                  })()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Service costs:</span>
                                <span className="font-medium">
                                  {(() => {
                                    const affected =
                                      selectedPlan?.affectedPassengers || 167;
                                    const delayMinutes =
                                      selectedPlan?.estimatedDelay || 0;
                                    let serviceCost = 0;

                                    if (delayMinutes > 120) {
                                      serviceCost += affected * 45; // ${airlineConfig.currency} 45 per meal voucher
                                    }

                                    if (delayMinutes > 240) {
                                      serviceCost +=
                                        Math.floor(affected * 0.8) * 350; // ${airlineConfig.currency} 350 per hotel room
                                    }

                                    return `${airlineConfig.currency} ${serviceCost.toLocaleString()}`;
                                  })()}
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
                            All passengers accommodated on same aircraft with
                            65min delay.
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
                                selectedPlan?.passengerInformation ||
                                selectedPlan?.matchingOption
                                  ?.passenger_rebooking ||
                                selectedPlan?.matchingOption
                                  ?.passenger_information ||
                                [];

                              const currentPassengerData = Array.isArray(
                                rawPassengerData,
                              )
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

                              const passengersByPnr =
                                currentPassengerData.reduce(
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
                                            {(passengers as any).length}{" "}
                                            passenger
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
                                                    selectedPlan.flightNumber}
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
                                                    {airlineConfig.currency}{" "}
                                                    {passenger.rebooking_cost}
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
                                                        (
                                                          service,
                                                          serviceIndex,
                                                        ) => (
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
                                selectedPlan?.passengerInformation ||
                                selectedPlan?.matchingOption
                                  ?.passenger_rebooking ||
                                selectedPlan?.matchingOption
                                  ?.passenger_information ||
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

                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Impact Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(() => {
                            const costBreakdown =
                              selectedPlan.costAnalysis?.breakdown ||
                              selectedPlan.costBreakdown?.breakdown ||
                              selectedPlan.matchingOption?.cost_breakdown
                                ?.breakdown;

                            const costTotal =
                              selectedPlan.costAnalysis?.total ||
                              selectedPlan.costBreakdown?.total ||
                              selectedPlan.matchingOption?.cost_breakdown
                                ?.total;

                            if (
                              costBreakdown &&
                              Array.isArray(costBreakdown) &&
                              costBreakdown.length > 0
                            ) {
                              return (
                                <div className="space-y-4">
                                  {costTotal && (
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium text-blue-800">
                                          {costTotal.title || "Total Cost"}:
                                        </span>
                                        <span className="text-lg font-semibold text-blue-900">
                                          {costTotal.amount ||
                                            `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                        </span>
                                      </div>
                                      {costTotal.description && (
                                        <p className="text-sm text-blue-700 mt-1">
                                          {costTotal.description}
                                        </p>
                                      )}
                                    </div>
                                  )}

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
                                                  {item.percentage}% of total
                                                  cost
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
                                                  {key.replace(
                                                    /([A-Z])/g,
                                                    " $1",
                                                  )}
                                                </span>
                                                <span className="font-semibold text-flydubai-orange">
                                                  {typeof value === "object" &&
                                                  value &&
                                                  typeof (value as any)
                                                    .amount === "number"
                                                    ? `${airlineConfig.currency} ${(value as any).amount.toLocaleString()}`
                                                    : typeof value === "number"
                                                      ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                                      : typeof value ===
                                                            "string" &&
                                                          !value.includes(
                                                            "[object",
                                                          )
                                                        ? value
                                                        : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
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
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(
                                    selectedPlan.costBreakdown,
                                  ).map(([key, value]) => (
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
                                            ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                            : typeof value === "string" &&
                                                !value.includes("[object")
                                              ? value
                                              : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Direct Costs:
                                    </span>
                                    <div className="font-medium">
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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

                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold text-flydubai-orange">
                              {(() => {
                                const costTotal =
                                  selectedPlan.costAnalysis?.total ||
                                  selectedPlan.costBreakdown?.total ||
                                  selectedPlan.matchingOption?.cost_breakdown
                                    ?.total;

                                if (costTotal && costTotal.amount) {
                                  return costTotal.amount;
                                }
                                return `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 50000).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
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
              )}
            </Tabs>
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
                  Object.keys(
                    selectedOptionForDetails?.pending_recovery_solutions
                      ?.full_details?.passenger_rebooking,
                  ).length > 0 && (
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
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              return passengerData.length;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const sameFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight === p.original_flight ||
                                  p.rebooking_status === "same_flight" ||
                                  p.status === "same_flight" ||
                                  !p.rebooked_flight ||
                                  p.rebooked_flight ===
                                    selectedPlan.flightNumber,
                              ).length;
                              return sameFlightCount;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-green-700">
                          Same Flight
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const otherFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight &&
                                  p.rebooked_flight !== p.original_flight &&
                                  p.rebooked_flight !==
                                    selectedPlan.flightNumber &&
                                  p.rebooking_status !== "same_flight" &&
                                  p.status !== "same_flight",
                              ).length;
                              return otherFlightCount;
                            }

                            return 0;
                          })()}
                        </div>
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
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const mealVoucherCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s.toLowerCase().includes("meal")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("meal") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("meal"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("meal") ||
                                        p.meal_voucher ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${mealVoucherCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 120) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${affected} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Hotel Accommodation:
                            </span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const hotelCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("hotel")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.service_type
                                                  ?.toLowerCase()
                                                  .includes("accommodation"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("hotel") ||
                                        p.hotel_accommodation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${hotelCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Transportation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const transportCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("transport")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("transport") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("transport"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("transport") ||
                                        p.transportation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${transportCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Compensation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Per passenger avg:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCost = passengerData.reduce(
                                    (sum, p) =>
                                      sum +
                                      (p.rebooking_cost ||
                                        p.compensation_amount ||
                                        261),
                                    0,
                                  );
                                  const avgCompensation =
                                    totalCost / passengerData.length;
                                  return `${airlineConfig.currency} ${Math.round(avgCompensation)}`;
                                }
                                return `${airlineConfig.currency} 261`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total compensation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCompensation =
                                    passengerData.reduce(
                                      (sum, p) =>
                                        sum +
                                        (p.rebooking_cost ||
                                          p.compensation_amount ||
                                          261),
                                      0,
                                    );
                                  return `${airlineConfig.currency} ${totalCompensation.toLocaleString()}`;
                                }

                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                return `${airlineConfig.currency} ${(affected * 261).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Service costs:</span>
                            <span className="font-medium">
                              {(() => {
                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                let serviceCost = 0;

                                if (delayMinutes > 120) {
                                  serviceCost += affected * 45; // ${airlineConfig.currency} 45 per meal voucher
                                }

                                if (delayMinutes > 240) {
                                  serviceCost +=
                                    Math.floor(affected * 0.8) * 350; // ${airlineConfig.currency} 350 per hotel room
                                }

                                return `${airlineConfig.currency} ${serviceCost.toLocaleString()}`;
                              })()}
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const currentPassengerData = Array.isArray(
                            rawPassengerData,
                          )
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
                                                selectedPlan.flightNumber}
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
                                                {airlineConfig.currency}{" "}
                                                {passenger.rebooking_cost}
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
                                                    (
                                                      service,
                                                      serviceIndex,
                                                    ) => (
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const groupCount = Array.isArray(rawPassengerData)
                            ? Object.keys(
                                rawPassengerData.reduce((acc, passenger) => {
                                  const pnr = passenger.pnr || "UNKNOWN";
                                  if (!acc[pnr]) acc[pnr] = [];
                                  acc[pnr].push(passenger);
                                  return acc;
                                }, {}),
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

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const costBreakdown =
                          selectedPlan.costAnalysis?.breakdown ||
                          selectedPlan.costBreakdown?.breakdown ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.breakdown;

                        const costTotal =
                          selectedPlan.costAnalysis?.total ||
                          selectedPlan.costBreakdown?.total ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.total;

                        if (
                          costBreakdown &&
                          Array.isArray(costBreakdown) &&
                          costBreakdown.length > 0
                        ) {
                          return (
                            <div className="space-y-4">
                              {costTotal && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">
                                      {costTotal.title || "Total Cost"}:
                                    </span>
                                    <span className="text-lg font-semibold text-blue-900">
                                      {costTotal.amount ||
                                        `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                    </span>
                                  </div>
                                  {costTotal.description && (
                                    <p className="text-sm text-blue-700 mt-1">
                                      {costTotal.description}
                                    </p>
                                  )}
                                </div>
                              )}

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
                                              {item.percentage}% of total
                                              cost
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
                                              {key.replace(
                                                /([A-Z])/g,
                                                " $1",
                                              )}
                                            </span>
                                            <span className="font-semibold text-flydubai-orange">
                                              {typeof value === "object" &&
                                              value &&
                                              typeof (value as any)
                                                .amount === "number"
                                                ? `${airlineConfig.currency} ${(value as any).amount.toLocaleString()}`
                                                : typeof value === "number"
                                                  ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                                  : typeof value ===
                                                        "string" &&
                                                      !value.includes(
                                                        "[object",
                                                      )
                                                    ? value
                                                    : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
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
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(
                                    selectedPlan.costBreakdown,
                                  ).map(([key, value]) => (
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
                                            ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                            : typeof value === "string" &&
                                                !value.includes("[object")
                                              ? value
                                              : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Direct Costs:
                                    </span>
                                    <div className="font-medium">
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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

                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold text-flydubai-orange">
                              {(() => {
                                const costTotal =
                                  selectedPlan.costAnalysis?.total ||
                                  selectedPlan.costBreakdown?.total ||
                                  selectedPlan.matchingOption?.cost_breakdown
                                    ?.total;

                                if (costTotal && costTotal.amount) {
                                  return costTotal.amount;
                                }
                                return `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 50000).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
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
              )}
            </Tabs>
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
                  Object.keys(
                    selectedOptionForDetails?.pending_recovery_solutions
                      ?.full_details?.passenger_rebooking,
                  ).length > 0 && (
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
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              return passengerData.length;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const sameFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight === p.original_flight ||
                                  p.rebooking_status === "same_flight" ||
                                  p.status === "same_flight" ||
                                  !p.rebooked_flight ||
                                  p.rebooked_flight ===
                                    selectedPlan.flightNumber,
                              ).length;
                              return sameFlightCount;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-green-700">
                          Same Flight
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const otherFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight &&
                                  p.rebooked_flight !== p.original_flight &&
                                  p.rebooked_flight !==
                                    selectedPlan.flightNumber &&
                                  p.rebooking_status !== "same_flight" &&
                                  p.status !== "same_flight",
                              ).length;
                              return otherFlightCount;
                            }

                            return 0;
                          })()}
                        </div>
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
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const mealVoucherCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s.toLowerCase().includes("meal")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("meal") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("meal"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("meal") ||
                                        p.meal_voucher ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${mealVoucherCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 120) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${affected} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Hotel Accommodation:
                            </span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const hotelCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("hotel")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.service_type
                                                  ?.toLowerCase()
                                                  .includes("accommodation"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("hotel") ||
                                        p.hotel_accommodation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${hotelCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Transportation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const transportCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("transport")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("transport") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("transport"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("transport") ||
                                        p.transportation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${transportCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Compensation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Per passenger avg:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCost = passengerData.reduce(
                                    (sum, p) =>
                                      sum +
                                      (p.rebooking_cost ||
                                        p.compensation_amount ||
                                        261),
                                    0,
                                  );
                                  const avgCompensation =
                                    totalCost / passengerData.length;
                                  return `${airlineConfig.currency} ${Math.round(avgCompensation)}`;
                                }
                                return `${airlineConfig.currency} 261`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total compensation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCompensation =
                                    passengerData.reduce(
                                      (sum, p) =>
                                        sum +
                                        (p.rebooking_cost ||
                                          p.compensation_amount ||
                                          261),
                                      0,
                                    );
                                  return `${airlineConfig.currency} ${totalCompensation.toLocaleString()}`;
                                }

                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                return `${airlineConfig.currency} ${(affected * 261).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Service costs:</span>
                            <span className="font-medium">
                              {(() => {
                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                let serviceCost = 0;

                                if (delayMinutes > 120) {
                                  serviceCost += affected * 45; // ${airlineConfig.currency} 45 per meal voucher
                                }

                                if (delayMinutes > 240) {
                                  serviceCost +=
                                    Math.floor(affected * 0.8) * 350; // ${airlineConfig.currency} 350 per hotel room
                                }

                                return `${airlineConfig.currency} ${serviceCost.toLocaleString()}`;
                              })()}
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const currentPassengerData = Array.isArray(
                            rawPassengerData,
                          )
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
                                                selectedPlan.flightNumber}
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
                                                {airlineConfig.currency}{" "}
                                                {passenger.rebooking_cost}
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
                                                    (
                                                      service,
                                                      serviceIndex,
                                                    ) => (
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const groupCount = Array.isArray(rawPassengerData)
                            ? Object.keys(
                                rawPassengerData.reduce((acc, passenger) => {
                                  const pnr = passenger.pnr || "UNKNOWN";
                                  if (!acc[pnr]) acc[pnr] = [];
                                  acc[pnr].push(passenger);
                                  return acc;
                                }, {}),
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

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const costBreakdown =
                          selectedPlan.costAnalysis?.breakdown ||
                          selectedPlan.costBreakdown?.breakdown ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.breakdown;

                        const costTotal =
                          selectedPlan.costAnalysis?.total ||
                          selectedPlan.costBreakdown?.total ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.total;

                        if (
                          costBreakdown &&
                          Array.isArray(costBreakdown) &&
                          costBreakdown.length > 0
                        ) {
                          return (
                            <div className="space-y-4">
                              {costTotal && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">
                                      {costTotal.title || "Total Cost"}:
                                    </span>
                                    <span className="text-lg font-semibold text-blue-900">
                                      {costTotal.amount ||
                                        `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                    </span>
                                  </div>
                                  {costTotal.description && (
                                    <p className="text-sm text-blue-700 mt-1">
                                      {costTotal.description}
                                    </p>
                                  )}
                                </div>
                              )}

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
                                              {item.percentage}% of total
                                              cost
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
                                              {key.replace(
                                                /([A-Z])/g,
                                                " $1",
                                              )}
                                            </span>
                                            <span className="font-semibold text-flydubai-orange">
                                              {typeof value === "object" &&
                                              value &&
                                              typeof (value as any)
                                                .amount === "number"
                                                ? `${airlineConfig.currency} ${(value as any).amount.toLocaleString()}`
                                                : typeof value === "number"
                                                  ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                                  : typeof value ===
                                                        "string" &&
                                                      !value.includes(
                                                        "[object",
                                                      )
                                                    ? value
                                                    : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
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
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(
                                    selectedPlan.costBreakdown,
                                  ).map(([key, value]) => (
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
                                            ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                            : typeof value === "string" &&
                                                !value.includes("[object")
                                              ? value
                                              : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Direct Costs:
                                    </span>
                                    <div className="font-medium">
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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

                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold text-flydubai-orange">
                              {(() => {
                                const costTotal =
                                  selectedPlan.costAnalysis?.total ||
                                  selectedPlan.costBreakdown?.total ||
                                  selectedPlan.matchingOption?.cost_breakdown
                                    ?.total;

                                if (costTotal && costTotal.amount) {
                                  return costTotal.amount;
                                }
                                return `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 50000).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
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
              )}
            </Tabs>
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
                  Object.keys(
                    selectedOptionForDetails?.pending_recovery_solutions
                      ?.full_details?.passenger_rebooking,
                  ).length > 0 && (
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
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              return passengerData.length;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const sameFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight === p.original_flight ||
                                  p.rebooking_status === "same_flight" ||
                                  p.status === "same_flight" ||
                                  !p.rebooked_flight ||
                                  p.rebooked_flight ===
                                    selectedPlan.flightNumber,
                              ).length;
                              return sameFlightCount;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-green-700">
                          Same Flight
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const otherFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight &&
                                  p.rebooked_flight !== p.original_flight &&
                                  p.rebooked_flight !==
                                    selectedPlan.flightNumber &&
                                  p.rebooking_status !== "same_flight" &&
                                  p.status !== "same_flight",
                              ).length;
                              return otherFlightCount;
                            }

                            return 0;
                          })()}
                        </div>
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
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const mealVoucherCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s.toLowerCase().includes("meal")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("meal") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("meal"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("meal") ||
                                        p.meal_voucher ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${mealVoucherCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 120) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${affected} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Hotel Accommodation:
                            </span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const hotelCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("hotel")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.service_type
                                                  ?.toLowerCase()
                                                  .includes("accommodation"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("hotel") ||
                                        p.hotel_accommodation ||
                                        false
                                      );
                                    },
                                  ).length;
                                         return `${hotelCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Transportation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const transportCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("transport")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("transport") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("transport"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("transport") ||
                                        p.transportation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${transportCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Compensation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Per passenger avg:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCost = passengerData.reduce(
                                    (sum, p) =>
                                      sum +
                                      (p.rebooking_cost ||
                                        p.compensation_amount ||
                                        261),
                                    0,
                                  );
                                  const avgCompensation =
                                    totalCost / passengerData.length;
                                  return `${airlineConfig.currency} ${Math.round(avgCompensation)}`;
                                }
                                return `${airlineConfig.currency} 261`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total compensation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCompensation =
                                    passengerData.reduce(
                                      (sum, p) =>
                                        sum +
                                        (p.rebooking_cost ||
                                          p.compensation_amount ||
                                          261),
                                      0,
                                    );
                                  return `${airlineConfig.currency} ${totalCompensation.toLocaleString()}`;
                                }

                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                return `${airlineConfig.currency} ${(affected * 261).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Service costs:</span>
                            <span className="font-medium">
                              {(() => {
                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                let serviceCost = 0;

                                if (delayMinutes > 120) {
                                  serviceCost += affected * 45; // ${airlineConfig.currency} 45 per meal voucher
                                }

                                if (delayMinutes > 240) {
                                  serviceCost +=
                                    Math.floor(affected * 0.8) * 350; // ${airlineConfig.currency} 350 per hotel room
                                }

                                return `${airlineConfig.currency} ${serviceCost.toLocaleString()}`;
                              })()}
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const currentPassengerData = Array.isArray(
                            rawPassengerData,
                          )
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
                                                selectedPlan.flightNumber}
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
                                                {airlineConfig.currency}{" "}
                                                {passenger.rebooking_cost}
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
                                                    (
                                                      service,
                                                      serviceIndex,
                                                    ) => (
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const groupCount = Array.isArray(rawPassengerData)
                            ? Object.keys(
                                rawPassengerData.reduce((acc, passenger) => {
                                  const pnr = passenger.pnr || "UNKNOWN";
                                  if (!acc[pnr]) acc[pnr] = [];
                                  acc[pnr].push(passenger);
                                  return acc;
                                }, {}),
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

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const costBreakdown =
                          selectedPlan.costAnalysis?.breakdown ||
                          selectedPlan.costBreakdown?.breakdown ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.breakdown;

                        const costTotal =
                          selectedPlan.costAnalysis?.total ||
                          selectedPlan.costBreakdown?.total ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.total;

                        if (
                          costBreakdown &&
                          Array.isArray(costBreakdown) &&
                          costBreakdown.length > 0
                        ) {
                          return (
                            <div className="space-y-4">
                              {costTotal && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">
                                      {costTotal.title || "Total Cost"}:
                                    </span>
                                    <span className="text-lg font-semibold text-blue-900">
                                      {costTotal.amount ||
                                        `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                    </span>
                                  </div>
                                  {costTotal.description && (
                                    <p className="text-sm text-blue-700 mt-1">
                                      {costTotal.description}
                                    </p>
                                  )}
                                </div>
                              )}

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
                                              {item.percentage}% of total
                                              cost
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
                                              {key.replace(
                                                /([A-Z])/g,
                                                " $1",
                                              )}
                                            </span>
                                            <span className="font-semibold text-flydubai-orange">
                                              {typeof value === "object" &&
                                              value &&
                                              typeof (value as any)
                                                .amount === "number"
                                                ? `${airlineConfig.currency} ${(value as any).amount.toLocaleString()}`
                                                : typeof value === "number"
                                                  ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                                  : typeof value ===
                                                        "string" &&
                                                      !value.includes(
                                                        "[object",
                                                      )
                                                    ? value
                                                    : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
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
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(
                                    selectedPlan.costBreakdown,
                                  ).map(([key, value]) => (
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
                                            ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                            : typeof value === "string" &&
                                                !value.includes("[object")
                                              ? value
                                              : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Direct Costs:
                                    </span>
                                    <div className="font-medium">
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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

                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold text-flydubai-orange">
                              {(() => {
                                const costTotal =
                                  selectedPlan.costAnalysis?.total ||
                                  selectedPlan.costBreakdown?.total ||
                                  selectedPlan.matchingOption?.cost_breakdown
                                    ?.total;

                                if (costTotal && costTotal.amount) {
                                  return costTotal.amount;
                                }
                                return `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 50000).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
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
              )}
            </Tabs>
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
                  Object.keys(
                    selectedOptionForDetails?.pending_recovery_solutions
                      ?.full_details?.passenger_rebooking,
                  ).length > 0 && (
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
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              return passengerData.length;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const sameFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight === p.original_flight ||
                                  p.rebooking_status === "same_flight" ||
                                  p.status === "same_flight" ||
                                  !p.rebooked_flight ||
                                  p.rebooked_flight ===
                                    selectedPlan.flightNumber,
                              ).length;
                              return sameFlightCount;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-green-700">
                          Same Flight
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const otherFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight &&
                                  p.rebooked_flight !== p.original_flight &&
                                  p.rebooked_flight !==
                                    selectedPlan.flightNumber &&
                                  p.rebooking_status !== "same_flight" &&
                                  p.status !== "same_flight",
                              ).length;
                              return otherFlightCount;
                            }

                            return 0;
                          })()}
                        </div>
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
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const mealVoucherCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s.toLowerCase().includes("meal")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("meal") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("meal"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("meal") ||
                                        p.meal_voucher ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${mealVoucherCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 120) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${affected} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Hotel Accommodation:
                            </span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const hotelCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("hotel")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.service_type
                                                  ?.toLowerCase()
                                                  .includes("accommodation"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("hotel") ||
                                        p.hotel_accommodation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${hotelCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Transportation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const transportCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("transport")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("transport") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("transport"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("transport") ||
                                        p.transportation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${transportCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Compensation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Per passenger avg:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCost = passengerData.reduce(
                                    (sum, p) =>
                                      sum +
                                      (p.rebooking_cost ||
                                        p.compensation_amount ||
                                        261),
                                    0,
                                  );
                                  const avgCompensation =
                                    totalCost / passengerData.length;
                                  return `${airlineConfig.currency} ${Math.round(avgCompensation)}`;
                                }
                                return `${airlineConfig.currency} 261`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total compensation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCompensation =
                                    passengerData.reduce(
                                      (sum, p) =>
                                        sum +
                                        (p.rebooking_cost ||
                                          p.compensation_amount ||
                                          261),
                                      0,
                                    );
                                  return `${airlineConfig.currency} ${totalCompensation.toLocaleString()}`;
                                }

                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                return `${airlineConfig.currency} ${(affected * 261).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Service costs:</span>
                            <span className="font-medium">
                              {(() => {
                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                let serviceCost = 0;

                                if (delayMinutes > 120) {
                                  serviceCost += affected * 45; // ${airlineConfig.currency} 45 per meal voucher
                                }

                                if (delayMinutes > 240) {
                                  serviceCost +=
                                    Math.floor(affected * 0.8) * 350; // ${airlineConfig.currency} 350 per hotel room
                                }

                                return `${airlineConfig.currency} ${serviceCost.toLocaleString()}`;
                              })()}
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const currentPassengerData = Array.isArray(
                            rawPassengerData,
                          )
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
                                                selectedPlan.flightNumber}
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
                                                {airlineConfig.currency}{" "}
                                                {passenger.rebooking_cost}
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
                                                    (
                                                      service,
                                                      serviceIndex,
                                                    ) => (
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const groupCount = Array.isArray(rawPassengerData)
                            ? Object.keys(
                                rawPassengerData.reduce((acc, passenger) => {
                                  const pnr = passenger.pnr || "UNKNOWN";
                                  if (!acc[pnr]) acc[pnr] = [];
                                  acc[pnr].push(passenger);
                                  return acc;
                                }, {}),
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

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const costBreakdown =
                          selectedPlan.costAnalysis?.breakdown ||
                          selectedPlan.costBreakdown?.breakdown ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.breakdown;

                        const costTotal =
                          selectedPlan.costAnalysis?.total ||
                          selectedPlan.costBreakdown?.total ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.total;

                        if (
                          costBreakdown &&
                          Array.isArray(costBreakdown) &&
                          costBreakdown.length > 0
                        ) {
                          return (
                            <div className="space-y-4">
                              {costTotal && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">
                                      {costTotal.title || "Total Cost"}:
                                    </span>
                                    <span className="text-lg font-semibold text-blue-900">
                                      {costTotal.amount ||
                                        `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                    </span>
                                  </div>
                                  {costTotal.description && (
                                    <p className="text-sm text-blue-700 mt-1">
                                      {costTotal.description}
                                    </p>
                                  )}
                                </div>
                              )}

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
                                              {item.percentage}% of total
                                              cost
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
                                              {key.replace(
                                                /([A-Z])/g,
                                                " $1",
                                              )}
                                            </span>
                                            <span className="font-semibold text-flydubai-orange">
                                              {typeof value === "object" &&
                                              value &&
                                              typeof (value as any)
                                                .amount === "number"
                                                ? `${airlineConfig.currency} ${(value as any).amount.toLocaleString()}`
                                                : typeof value === "number"
                                                  ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                                  : typeof value ===
                                                        "string" &&
                                                      !value.includes(
                                                        "[object",
                                                      )
                                                    ? value
                                                    : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
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
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(
                                    selectedPlan.costBreakdown,
                                  ).map(([key, value]) => (
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
                                            ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                            : typeof value === "string" &&
                                                !value.includes("[object")
                                              ? value
                                              : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Direct Costs:
                                    </span>
                                    <div className="font-medium">
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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

                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold text-flydubai-orange">
                              {(() => {
                                const costTotal =
                                  selectedPlan.costAnalysis?.total ||
                                  selectedPlan.costBreakdown?.total ||
                                  selectedPlan.matchingOption?.cost_breakdown
                                    ?.total;

                                if (costTotal && costTotal.amount) {
                                  return costTotal.amount;
                                }
                                return `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 50000).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
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
              )}
            </Tabs>
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
                  Object.keys(
                    selectedOptionForDetails?.pending_recovery_solutions
                      ?.full_details?.passenger_rebooking,
                  ).length > 0 && (
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
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              return passengerData.length;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const sameFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight === p.original_flight ||
                                  p.rebooking_status === "same_flight" ||
                                  p.status === "same_flight" ||
                                  !p.rebooked_flight ||
                                  p.rebooked_flight ===
                                    selectedPlan.flightNumber,
                              ).length;
                              return sameFlightCount;
                            }

                            return selectedPlan?.affectedPassengers || 167;
                          })()}
                        </div>
                        <div className="text-sm text-green-700">
                          Same Flight
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600">
                          {(() => {
                            const passengerData =
                              selectedPlan?.passengerInformation ||
                              selectedPlan?.matchingOption
                                ?.passenger_rebooking ||
                              selectedPlan?.matchingOption
                                ?.passenger_information ||
                              [];

                            if (
                              Array.isArray(passengerData) &&
                              passengerData.length > 0
                            ) {
                              const otherFlightCount = passengerData.filter(
                                (p) =>
                                  p.rebooked_flight &&
                                  p.rebooked_flight !== p.original_flight &&
                                  p.rebooked_flight !==
                                    selectedPlan.flightNumber &&
                                  p.rebooking_status !== "same_flight" &&
                                  p.status !== "same_flight",
                              ).length;
                              return otherFlightCount;
                            }

                            return 0;
                          })()}
                        </div>
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
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const mealVoucherCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s.toLowerCase().includes("meal")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("meal") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("meal"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("meal") ||
                                        p.meal_voucher ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${mealVoucherCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 120) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${affected} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Hotel Accommodation:
                            </span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const hotelCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("hotel")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("hotel") ||
                                                s.service_type
                                                  ?.toLowerCase()
                                                  .includes("accommodation"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("hotel") ||
                                        p.hotel_accommodation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${hotelCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Transportation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const transportCount = passengerData.filter(
                                    (p) => {
                                      if (
                                        p.additional_services &&
                                        Array.isArray(p.additional_services)
                                      ) {
                                        return p.additional_services.some(
                                          (s) =>
                                            typeof s === "string"
                                              ? s
                                                  .toLowerCase()
                                                  .includes("transport")
                                              : s.service_type
                                                  ?.toLowerCase()
                                                  .includes("transport") ||
                                                s.type
                                                  ?.toLowerCase()
                                                  .includes("transport"),
                                        );
                                      }
                                      return (
                                        p.services?.includes("transport") ||
                                        p.transportation ||
                                        false
                                      );
                                    },
                                  ).length;
                                  return `${transportCount} passengers`;
                                }

                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                if (delayMinutes > 240) {
                                  const affected =
                                    selectedPlan?.affectedPassengers || 167;
                                  return `${Math.floor(affected * 0.8)} passengers`;
                                }
                                return "0 passengers";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Compensation</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Per passenger avg:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCost = passengerData.reduce(
                                    (sum, p) =>
                                      sum +
                                      (p.rebooking_cost ||
                                        p.compensation_amount ||
                                        261),
                                    0,
                                  );
                                  const avgCompensation =
                                    totalCost / passengerData.length;
                                  return `${airlineConfig.currency} ${Math.round(avgCompensation)}`;
                                }
                                return `${airlineConfig.currency} 261`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total compensation:</span>
                            <span className="font-medium">
                              {(() => {
                                const passengerData =
                                  selectedPlan?.passengerInformation ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_rebooking ||
                                  selectedPlan?.matchingOption
                                    ?.passenger_information ||
                                  [];

                                if (
                                  Array.isArray(passengerData) &&
                                  passengerData.length > 0
                                ) {
                                  const totalCompensation =
                                    passengerData.reduce(
                                      (sum, p) =>
                                        sum +
                                        (p.rebooking_cost ||
                                          p.compensation_amount ||
                                          261),
                                      0,
                                    );
                                  return `${airlineConfig.currency} ${totalCompensation.toLocaleString()}`;
                                }

                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                return `${airlineConfig.currency} ${(affected * 261).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Service costs:</span>
                            <span className="font-medium">
                              {(() => {
                                const affected =
                                  selectedPlan?.affectedPassengers || 167;
                                const delayMinutes =
                                  selectedPlan?.estimatedDelay || 0;
                                let serviceCost = 0;

                                if (delayMinutes > 120) {
                                  serviceCost += affected * 45; // ${airlineConfig.currency} 45 per meal voucher
                                }

                                if (delayMinutes > 240) {
                                  serviceCost +=
                                    Math.floor(affected * 0.8) * 350; // ${airlineConfig.currency} 350 per hotel room
                                }

                                return `${airlineConfig.currency} ${serviceCost.toLocaleString()}`;
                              })()}
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const currentPassengerData = Array.isArray(
                            rawPassengerData,
                          )
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
                                                selectedPlan.flightNumber}
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
                                                {airlineConfig.currency}{" "}
                                                {passenger.rebooking_cost}
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
                                                    (
                                                      service,
                                                      serviceIndex,
                                                    ) => (
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
                            selectedPlan?.passengerInformation ||
                            selectedPlan?.matchingOption?.passenger_rebooking ||
                            selectedPlan?.matchingOption
                              ?.passenger_information ||
                            [];

                          const groupCount = Array.isArray(rawPassengerData)
                            ? Object.keys(
                                rawPassengerData.reduce((acc, passenger) => {
                                  const pnr = passenger.pnr || "UNKNOWN";
                                  if (!acc[pnr]) acc[pnr] = [];
                                  acc[pnr].push(passenger);
                                  return acc;
                                }, {}),
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

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const costBreakdown =
                          selectedPlan.costAnalysis?.breakdown ||
                          selectedPlan.costBreakdown?.breakdown ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.breakdown;

                        const costTotal =
                          selectedPlan.costAnalysis?.total ||
                          selectedPlan.costBreakdown?.total ||
                          selectedPlan.matchingOption?.cost_breakdown
                            ?.total;

                        if (
                          costBreakdown &&
                          Array.isArray(costBreakdown) &&
                          costBreakdown.length > 0
                        ) {
                          return (
                            <div className="space-y-4">
                              {costTotal && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">
                                      {costTotal.title || "Total Cost"}:
                                    </span>
                                    <span className="text-lg font-semibold text-blue-900">
                                      {costTotal.amount ||
                                        `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                    </span>
                                  </div>
                                  {costTotal.description && (
                                    <p className="text-sm text-blue-700 mt-1">
                                      {costTotal.description}
                                    </p>
                                  )}
                                </div>
                              )}

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
                                              {item.percentage}% of total
                                              cost
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
                                              {key.replace(
                                                /([A-Z])/g,
                                                " $1",
                                              )}
                                            </span>
                                            <span className="font-semibold text-flydubai-orange">
                                              {typeof value === "object" &&
                                              value &&
                                              typeof (value as any)
                                                .amount === "number"
                                                ? `${airlineConfig.currency} ${(value as any).amount.toLocaleString()}`
                                                : typeof value === "number"
                                                  ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                                  : typeof value ===
                                                        "string" &&
                                                      !value.includes(
                                                        "[object",
                                                      )
                                                    ? value
                                                    : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
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
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(
                                    selectedPlan.costBreakdown,
                                  ).map(([key, value]) => (
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
                                            ? `${airlineConfig.currency} ${value.toLocaleString()}`
                                            : typeof value === "string" &&
                                                !value.includes("[object")
                                              ? value
                                              : `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Direct Costs:
                                    </span>
                                    <div className="font-medium">
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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
                                      {airlineConfig.currency}{" "}
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

                          <Separator />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold text-flydubai-orange">
                              {(() => {
                                const costTotal =
                                  selectedPlan.costAnalysis?.total ||
                                  selectedPlan.costBreakdown?.total ||
                                  selectedPlan.matchingOption?.cost_breakdown
                                    ?.total;

                                if (costTotal && costTotal.amount) {
                                  return costTotal.amount;
                                }
                                return `${airlineConfig.currency} ${(selectedPlan.estimatedCost || 50000).toLocaleString()}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
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
              )}
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}