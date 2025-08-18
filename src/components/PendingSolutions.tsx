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
    const matchesPriority =
      filters.priority === "all" ||
      plan.priority.toLowerCase() === filters.priority;
    const matchesSubmitter =
      filters.submitter === "all" ||
      plan.submittedBy.toLowerCase().includes(filters.submitter.toLowerCase());
    const matchesFlightNumber =
      !filters.flightNumber ||
      plan.flightNumber
        .toLowerCase()
        .includes(filters.flightNumber.toLowerCase());
    const matchesPlanId =
      !filters.planId ||
      plan.id.toLowerCase().includes(filters.planId.toLowerCase());

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
    let aValue, bValue;

    switch (sortBy) {
      case "submitted":
        aValue = new Date(a.submittedAt);
        bValue = new Date(b.submittedAt);
        break;
      case "priority":
        const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case "cost":
        aValue = a.estimatedCost;
        bValue = b.estimatedCost;
        break;
      case "confidence":
        aValue = a.confidence;
        bValue = b.confidence;
        break;
      default:
        aValue = a.submittedAt;
        bValue = b.submittedAt;
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
        const status = p.status ? p.status.trim().toLowerCase() : "pending";
        return ["pending approval", "under review", "pending"].includes(status);
      }).length,
      approved: plans.filter((p) => {
        const status = p.status ? p.status.trim().toLowerCase() : "";
        return status === "approved";
      }).length,
      rejected: plans.filter((p) => {
        const status = p.status ? p.status.trim().toLowerCase() : "";
        return status === "rejected";
      }).length,
      critical: plans.filter((p) => ["Critical", "High"].includes(p.priority))
        .length,
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

      // Fetch the most up-to-date data from pending solutions API
      const response = await fetch(
        `/api/pending-recovery-solutions/${plan.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      let updatedPlan = null;

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

      if (updatedPlan) {
        // Transform the updated plan data with proper cost formatting
        const transformedPlan = {
          ...plan,
          title: updatedPlan.option_title || plan.title,
          status: updatedPlan.status || plan.status,
          flightDetails: updatedPlan.full_details || plan.flightDetails || {},
          rotationImpact: updatedPlan.rotation_impact || {},
          fullDetails: updatedPlan.full_details || {},
          costBreakdown:
            updatedPlan.cost_analysis?.breakdown ||
            updatedPlan.full_details?.costBreakdown ||
            plan.costBreakdown ||
            {},
          recoverySteps:
            updatedPlan.recovery_steps ||
            updatedPlan.full_details?.recoverySteps ||
            plan.recoverySteps ||
            [],
          assignedCrew:
            updatedPlan.crew_information ||
            updatedPlan.full_details?.assignedCrew ||
            plan.assignedCrew ||
            [],
          passengerInformation:
            updatedPlan.passenger_information ||
            plan.passengerInformation ||
            [],
          operationsUser:
            updatedPlan.operations_user ||
            plan.operationsUser ||
            "Operations Manager",
          costAnalysis: updatedPlan.cost_analysis || plan.costAnalysis || {},
          impact: updatedPlan.impact || plan.impact || "Moderate",
          confidence: updatedPlan.confidence || plan.confidence || 80,
          // Ensure estimatedCost is properly formatted
          estimatedCost: (() => {
            if (updatedPlan.cost) {
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
          "Transformed plan with cost:",
          transformedPlan.estimatedCost,
        );
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
    // Create a detailed option object with all necessary data
    const detailedOption = {
      ...option,
      id: option.id || `option_${Date.now()}`,
      title: option.title || plan.title,
      description:
        option.description || "Comprehensive recovery option analysis",
      cost:
        option.cost || `AED ${(plan.estimatedCost || 50000).toLocaleString()}`,
      timeline: option.timeline || plan.timeline || "65 min",
      confidence: option.confidence || plan.confidence || 96.8,
      impact: option.impact || plan.impact || "Minimal",
      flightNumber: plan.flightNumber,
      route: plan.route,
      aircraft: plan.aircraft,
      passengers: plan.affectedPassengers,
      disruptionReason: plan.disruptionReason,
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

    return (
      <div className="space-y-6">
        <Tabs value={activeOptionTab} onValueChange={setActiveOptionTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="crew-hotac">Crew & HOTAC</TabsTrigger>
            <TabsTrigger value="passengers">Passengers</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Crew Assignment Changes */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Crew Assignment Modifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(plan.assignedCrew && plan.assignedCrew.length > 0
                        ? plan.assignedCrew
                        : [
                            {
                              name: "Capt. Ahmed Al-Mansouri",
                              role: "Captain",
                              status: "Reassigned",
                              change: "Replaced fatigued crew member",
                              dutyTime: "8h 30m",
                            },
                            {
                              name: "F/O Sarah Rahman",
                              role: "First Officer",
                              status: "Original",
                              change: "No change required",
                              dutyTime: "7h 45m",
                            },
                            {
                              name: "SSCC Lisa Martinez",
                              role: "Senior Cabin Crew",
                              status: "Standby Activated",
                              change: "Additional crew for extended duty",
                              dutyTime: "9h 15m",
                            },
                            {
                              name: "CC Maria Santos",
                              role: "Cabin Crew",
                              status: "Original",
                              change: "No change required",
                              dutyTime: "8h 00m",
                            },
                          ]
                      ).map((crew, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{crew.name}</div>
                            <Badge
                              variant={
                                crew.status === "Original"
                                  ? "outline"
                                  : "default"
                              }
                            >
                              {crew.status}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Role:
                              </span>
                              <span>{crew.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Duty Time:
                              </span>
                              <span>{crew.dutyTime}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Change: {crew.change}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HOTAC Arrangements */}
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">HOTAC Arrangements</h4>
                    <div className="space-y-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Hotel className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">
                              Hotel Accommodation
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Hotel:
                              </span>
                              <div className="font-medium">
                                Mumbai Airport Hotel
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Category:
                              </span>
                              <div className="font-medium">4-Star</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Check-in:
                              </span>
                              <div className="font-medium">Today 15:30</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Check-out:
                              </span>
                              <div className="font-medium">Tomorrow 12:00</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Rooms:
                              </span>
                              <div className="font-medium">
                                3 rooms reserved
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Total Cost:
                              </span>
                              <div className="font-medium text-flydubai-orange">
                                AED 1,350
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Car className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-800">
                              Transportation
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Provider:
                              </span>
                              <div className="font-medium">
                                Mumbai Airport Taxi
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Pickup:
                              </span>
                              <div className="font-medium">BOM Terminal 2</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Pickup Time:
                              </span>
                              <div className="font-medium">15:15</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Vehicle:
                              </span>
                              <div className="font-medium">Premium SUV</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Passenger Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {plan.affectedPassengers || 167}
                      </div>
                      <div className="text-sm text-blue-700">
                        Total Passengers
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.floor((plan.affectedPassengers || 167) * 0.85)}
                      </div>
                      <div className="text-sm text-green-700">Rebooked</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.floor((plan.affectedPassengers || 167) * 0.12)}
                      </div>
                      <div className="text-sm text-yellow-700">
                        Accommodation
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.floor((plan.affectedPassengers || 167) * 0.03)}
                      </div>
                      <div className="text-sm text-orange-700">
                        Compensation
                      </div>
                    </div>
                  </div>

                  {/* Rebooking Details */}
                  <div>
                    <h4 className="font-medium mb-3">Rebooking Arrangements</h4>
                    <div className="space-y-3">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-flydubai-blue" />
                            <span className="font-medium">
                              FZ567 - Tomorrow 08:00
                            </span>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            142 passengers
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Primary rebooking flight - Same route, next day
                          departure
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              EK425 - Today 16:45
                            </span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">
                            15 passengers
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Partner airline accommodation - Premium passengers
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hotel className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">
                              Hotel Accommodation
                            </span>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">
                            10 passengers
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Overnight accommodation with meal vouchers
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Additional Services */}
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">
                      Additional Services Provided
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <UtensilsCrossed className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Meal Vouchers</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          AED 75 per passenger - 25 vouchers issued
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Ground Transport</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Taxi services for 10 passengers
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <PhoneCall className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Priority Support</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Dedicated helpline for affected passengers
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-red-600" />
                          <span className="font-medium">Compensation</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          EU261 compliance - AED 600 per eligible passenger
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                        <div className="flex justify-between">
                          <span>Aircraft & Crew:</span>
                          <span>AED 15,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HOTAC Arrangements:</span>
                          <span>AED 8,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Passenger Services:</span>
                          <span>AED 12,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ground Operations:</span>
                          <span>AED 9,000</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium text-lg">
                          <span>Total Estimated Cost:</span>
                          <span className="text-flydubai-orange">
                            AED {(plan.estimatedCost || 44500).toLocaleString()}
                          </span>
                        </div>
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
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">
                  Recovery Options Overview
                </TabsTrigger>
                <TabsTrigger value="flight">Flight Details</TabsTrigger>
                <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Selected Option
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan.title ||
                        "Maintenance Fix + Gate Optimization/Option C for Immediate Launch/Post approval."}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                      <p className="text-sm text-blue-800">
                        Service will launch Aircraft A307-007 with Crew
                        Lunch/Post approval.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Option Comparison Matrix</h4>
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
                                Delay (min)
                              </th>
                              <th className="border border-gray-200 p-3 text-left">
                                Confidence
                              </th>
                              <th className="border border-gray-200 p-3 text-left">
                                Passenger Impact
                              </th>
                              <th className="border border-gray-200 p-3 text-left">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-200 p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  Option 1
                                </div>
                              </td>
                              <td className="border border-gray-200 p-3">
                                50K
                              </td>
                              <td className="border border-gray-200 p-3">65</td>
                              <td className="border border-gray-200 p-3">
                                96.8%
                              </td>
                              <td className="border border-gray-200 p-3">
                                Minimal
                              </td>
                              <td className="border border-gray-200 p-3">
                                <Badge className="bg-orange-100 text-orange-700">
                                  Recommended
                                </Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-200 p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  Option 2
                                </div>
                              </td>
                              <td className="border border-gray-200 p-3">
                                45K
                              </td>
                              <td className="border border-gray-200 p-3">87</td>
                              <td className="border border-gray-200 p-3">
                                94.2%
                              </td>
                              <td className="border border-gray-200 p-3">
                                Low
                              </td>
                              <td className="border border-gray-200 p-3">
                                <Badge className="bg-orange-100 text-orange-700">
                                  Recommended
                                </Badge>
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-200 p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  Option 3
                                </div>
                              </td>
                              <td className="border border-gray-200 p-3">
                                75K
                              </td>
                              <td className="border border-gray-200 p-3">0</td>
                              <td className="border border-gray-200 p-3">
                                86.1%
                              </td>
                              <td className="border border-gray-200 p-3">
                                High
                              </td>
                              <td className="border border-gray-200 p-3">
                                <Badge variant="outline">Alternative</Badge>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="space-y-3">
                        <Card className="border-orange-200 bg-orange-50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-orange-800">
                                Option 1: Immediate Aircraft Swap • A317-007
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  handleViewOptionDetails(
                                    {
                                      id: "option_1",
                                      title: "Immediate Aircraft Swap",
                                      description:
                                        "Service will launch Aircraft A307-007 with Crew Lunch/Post approval.",
                                      cost: "AED 50K",
                                      timeline: "65 min",
                                      confidence: 96.8,
                                      impact: "Minimal",
                                    },
                                    selectedPlan,
                                  )
                                }
                              >
                                View Option
                              </Button>
                            </div>
                            <p className="text-sm text-orange-700 mb-3">
                              Service will launch Aircraft A307-007 with Crew
                              Lunch/Post approval.
                            </p>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Cost:</span>
                                <div className="font-medium">AED 50K</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Timeline:</span>
                                <div className="font-medium">65 min</div>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Confidence:
                                </span>
                                <div className="font-medium">96.8%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Impact:</span>
                                <div className="font-medium">Minimal</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span>
                                Passenger Impact: <strong>Minimal</strong>
                              </span>
                              <span>
                                Complexity: <strong>Medium</strong>
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-orange-800">
                                Option 2: Maintenance Fix + Gate Optimization
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  handleViewOptionDetails(
                                    {
                                      id: "option_2",
                                      title:
                                        "Maintenance Fix + Gate Optimization",
                                      description:
                                        "Expected maintenance with crew onboard to functional things.",
                                      cost: "AED 45K",
                                      timeline: "87 min",
                                      confidence: 94.2,
                                      impact: "2h 15m",
                                    },
                                    selectedPlan,
                                  )
                                }
                              >
                                View Option
                              </Button>
                            </div>
                            <p className="text-sm text-orange-700 mb-3">
                              Expected maintenance with crew onboard to
                              functional things.
                            </p>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Cost:</span>
                                <div className="font-medium">AED 45K</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Timeline:</span>
                                <div className="font-medium">87 min</div>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Confidence:
                                </span>
                                <div className="font-medium">94.2%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Impact:</span>
                                <div className="font-medium">2h 15m</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span>
                                Passenger Impact: <strong>High</strong>
                              </span>
                              <span>
                                Complexity: <strong>High</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>Key Insight for Selected Option:</span>
                              <span>
                                Success Rate: <strong>94.2%</strong>
                              </span>
                              <span>
                                Customer Satisfaction: <strong>86%</strong>
                              </span>
                              <span>
                                Operational Risk: <strong>Medium</strong>
                              </span>
                              <span>
                                Resource Utilization: <strong>Optimal</strong>
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-700">
                                Option 3: Cancel Flight + Passenger Rebooking
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  handleViewOptionDetails(
                                    {
                                      id: "option_3",
                                      title:
                                        "Cancel Flight + Passenger Rebooking",
                                      description:
                                        "Cancel current flight and reaccommodate passengers on alternative flights.",
                                      cost: "AED 75K",
                                      timeline: "0 min",
                                      confidence: 86.1,
                                      impact: "4h 30m",
                                    },
                                    selectedPlan,
                                  )
                                }
                              >
                                View Option
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Cancel current flight and reaccommodate passengers
                              on alternative flights.
                            </p>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Cost:</span>
                                <div className="font-medium">AED 75K</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Timeline:</span>
                                <div className="font-medium">0 min</div>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Confidence:
                                </span>
                                <div className="font-medium">86.1%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Impact:</span>
                                <div className="font-medium">4h 30m</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span>
                                Passenger Impact: <strong>High</strong>
                              </span>
                              <span>
                                Complexity: <strong>Low</strong>
                              </span>
                            </div>
                          </CardContent>
                        </Card>
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
                            {selectedPlan.flightNumber || "FZ323"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Route:</span>
                          <div className="font-medium">
                            {selectedPlan.route || "DXB → BOM"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Aircraft:</span>
                          <div className="font-medium">
                            {selectedPlan.aircraft || "Boeing 737-800"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Scheduled Departure:
                          </span>
                          <div className="font-medium">2025-01-16 14:30</div>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Scheduled Arrival:
                          </span>
                          <div className="font-medium">2025-01-16 17:45</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Gate:</span>
                          <div className="font-medium">A12</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Terminal:</span>
                          <div className="font-medium">3</div>
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
                            Technical Issue - Engine warning light
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Severity:</span>
                          <div className="font-medium">
                            <Badge className="bg-red-100 text-red-700">
                              High
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Affected Passengers:
                          </span>
                          <div className="font-medium">
                            {selectedPlan.affectedPassengers || "168"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Cargo:</span>
                          <div className="font-medium">8.5 tons</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Submitted by:</span>
                          <div className="font-medium">Sarah Mitchell</div>
                        </div>
                        <div>
                          <span className="text-gray-600">SLA Deadline:</span>
                          <div className="font-medium text-red-600">
                            2025-01-16 16:00:00
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="impact" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Impact Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Direct Costs:</span>
                            <div className="font-medium">
                              AED{" "}
                              {(
                                (selectedPlan.estimatedCost || 50000) * 0.6
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
                                (selectedPlan.estimatedCost || 50000) * 0.4
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
                                (selectedPlan.estimatedCost || 50000) * 0.3
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
                                (selectedPlan.estimatedCost || 50000) * 0.7
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            Total Estimated Cost:
                          </span>
                          <span className="text-lg font-semibold text-flydubai-orange">
                            AED{" "}
                            {(
                              selectedPlan.estimatedCost || 50000
                            ).toLocaleString()}
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
                              {selectedPlan.estimatedDelay || 65} minute delay
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
                              {selectedPlan.affectedPassengers || 168}{" "}
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
                              {selectedPlan.confidence || 85}% confidence in
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
                              Minimal downstream flight disruptions expected
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                Close
              </Button>
              {["Pending Approval", "Under Review", "Pending"].includes(
                selectedPlan.status,
              ) && (
                <>
                  <Button
                    onClick={async () => {
                      await handleApprove(selectedPlan.id);
                      setSelectedPlan(null);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await handleReject(selectedPlan.id);
                      setSelectedPlan(null);
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

      {/* Detailed Recovery Option Analysis Dialog */}
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="option-details">Option Details</TabsTrigger>
                <TabsTrigger value="crew-hotac">Crew & HOTAC</TabsTrigger>
                <TabsTrigger value="passenger-reaccommodation">
                  Passenger Re-accommodation
                </TabsTrigger>
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
                      Crew Changes Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          No crew changes required.
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        Current crew certified for{" "}
                        {selectedOptionForDetails.id || "A321-007"}
                      </p>
                    </div>
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
                          158
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Affected
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          158
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
                              €250 per passenger (EU261):
                            </span>
                            <span className="font-medium">
                              €250 per passenger (EU261)
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rotation-impact" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Aircraft Rotation Impact
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
                        <div className="text-3xl font-bold text-red-600">
                          75
                        </div>
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
                      <h4 className="font-medium">Affected Routes</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">BOM-DXB</span>
                          </div>
                          <Badge variant="outline" className="text-green-700">
                            Impacted
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">DXB-DEL</span>
                          </div>
                          <Badge variant="outline" className="text-green-700">
                            Impacted
                          </Badge>
                        </div>
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
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDetailedOptionAnalysis(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
