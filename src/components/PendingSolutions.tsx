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
} from "lucide-react";
import { databaseService } from "../services/databaseService";

export function PendingSolutions() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState(null);
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
  const [showDetailedOptionView, setShowDetailedOptionView] = useState(null); // State to control the new detailed view dialog

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
        estimatedCost:
          typeof plan.cost === "string"
            ? parseInt(plan.cost.replace(/[^0-9]/g, "")) || 0
            : plan.cost || 0,
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
    try {
      console.log("Fetching detailed view for plan:", plan.id);

      // Try to fetch the most up-to-date data from pending solutions
      const allSolutions = await databaseService.getPendingRecoverySolutions();
      const updatedPlan = allSolutions.find((s) => s.id === plan.id);

      if (updatedPlan) {
        console.log("Found updated plan data:", updatedPlan);
        // Transform the updated plan data
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
            {},
          recoverySteps:
            updatedPlan.recovery_steps ||
            updatedPlan.full_details?.recoverySteps ||
            [],
          assignedCrew:
            updatedPlan.crew_information ||
            updatedPlan.full_details?.assignedCrew ||
            [],
          passengerInformation: updatedPlan.passenger_information || [],
          operationsUser: updatedPlan.operations_user || "Operations Manager",
          costAnalysis: updatedPlan.cost_analysis || {},
          impact: updatedPlan.impact || plan.impact || "Moderate", // Ensure impact is available
          confidence: updatedPlan.confidence || plan.confidence || 80, // Ensure confidence is available
        };
        setSelectedPlan(transformedPlan);
      } else {
        console.log("No updated data found, using current plan data");
        setSelectedPlan(plan);
      }
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      // Fallback to showing the plan with available data if details fetch fails
      setSelectedPlan(plan);
    }
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
                    <Label className="text-xs text-muted-foreground">Option Type</Label>
                    <div className="font-medium">{plan.title}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Estimated Cost</Label>
                    <div className="font-medium text-flydubai-orange">
                      AED {(plan.estimatedCost || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Timeline</Label>
                    <div className="font-medium">{plan.timeline}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Confidence</Label>
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
                      {plan.flightDetails?.description || plan.title || "Recovery option to address the flight disruption with minimal impact to operations and passengers."}
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
                  {(plan.recoverySteps && plan.recoverySteps.length > 0 ? plan.recoverySteps : [
                    { step: 1, title: "Initial Assessment", status: "completed", timestamp: new Date().toLocaleTimeString(), details: "Disruption analysis completed" },
                    { step: 2, title: "Resource Allocation", status: "completed", timestamp: new Date(Date.now() + 15*60000).toLocaleTimeString(), details: "Required resources identified and allocated" },
                    { step: 3, title: "Implementation", status: "in-progress", timestamp: new Date(Date.now() + 30*60000).toLocaleTimeString(), details: "Recovery plan execution in progress" },
                    { step: 4, title: "Verification", status: "pending", timestamp: new Date(Date.now() + 45*60000).toLocaleTimeString(), details: "Final verification and confirmation" }
                  ]).map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-flydubai-blue text-white text-sm font-medium">
                        {step.step || index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.title}</h4>
                          <Badge className={
                            step.status === 'completed' ? 'bg-green-100 text-green-700' :
                            step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {step.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.details}</p>
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
                    <h4 className="font-medium mb-3">Crew Assignment Modifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(plan.assignedCrew && plan.assignedCrew.length > 0 ? plan.assignedCrew : [
                        { name: "Capt. Ahmed Al-Mansouri", role: "Captain", status: "Reassigned", change: "Replaced fatigued crew member", dutyTime: "8h 30m" },
                        { name: "F/O Sarah Rahman", role: "First Officer", status: "Original", change: "No change required", dutyTime: "7h 45m" },
                        { name: "SSCC Lisa Martinez", role: "Senior Cabin Crew", status: "Standby Activated", change: "Additional crew for extended duty", dutyTime: "9h 15m" },
                        { name: "CC Maria Santos", role: "Cabin Crew", status: "Original", change: "No change required", dutyTime: "8h 00m" }
                      ]).map((crew, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{crew.name}</div>
                            <Badge variant={crew.status === 'Original' ? 'outline' : 'default'}>
                              {crew.status}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Role:</span>
                              <span>{crew.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duty Time:</span>
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
                            <span className="font-medium text-blue-800">Hotel Accommodation</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Hotel:</span>
                              <div className="font-medium">Mumbai Airport Hotel</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category:</span>
                              <div className="font-medium">4-Star</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Check-in:</span>
                              <div className="font-medium">Today 15:30</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Check-out:</span>
                              <div className="font-medium">Tomorrow 12:00</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rooms:</span>
                              <div className="font-medium">3 rooms reserved</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Cost:</span>
                              <div className="font-medium text-flydubai-orange">AED 1,350</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Car className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-800">Transportation</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <div className="font-medium">Mumbai Airport Taxi</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pickup:</span>
                              <div className="font-medium">BOM Terminal 2</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pickup Time:</span>
                              <div className="font-medium">15:15</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Vehicle:</span>
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
                      <div className="text-2xl font-bold text-blue-600">{plan.affectedPassengers || 167}</div>
                      <div className="text-sm text-blue-700">Total Passengers</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{Math.floor((plan.affectedPassengers || 167) * 0.85)}</div>
                      <div className="text-sm text-green-700">Rebooked</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{Math.floor((plan.affectedPassengers || 167) * 0.12)}</div>
                      <div className="text-sm text-yellow-700">Accommodation</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{Math.floor((plan.affectedPassengers || 167) * 0.03)}</div>
                      <div className="text-sm text-orange-700">Compensation</div>
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
                            <span className="font-medium">FZ567 - Tomorrow 08:00</span>
                          </div>
                          <Badge className="bg-green-100 text-green-700">142 passengers</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Primary rebooking flight - Same route, next day departure
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">EK425 - Today 16:45</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">15 passengers</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Partner airline accommodation - Premium passengers
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hotel className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Hotel Accommodation</span>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">10 passengers</Badge>
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
                    <h4 className="font-medium mb-3">Additional Services Provided</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <UtensilsCrossed className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Meal Vouchers</span>
                        </div>
                        <div className="text-sm text-muted-foreground">AED 75 per passenger - 25 vouchers issued</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Ground Transport</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Taxi services for 10 passengers</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <PhoneCall className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Priority Support</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Dedicated helpline for affected passengers</div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-red-600" />
                          <span className="font-medium">Compensation</span>
                        </div>
                        <div className="text-sm text-muted-foreground">EU261 compliance - AED 600 per eligible passenger</div>
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
                    <h4 className="font-medium mb-3">Aircraft & Ground Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Alternative Aircraft</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Registration:</span>
                            <span>A6-FEB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>B737-800</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className="bg-green-100 text-green-700">Available</Badge>
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
                            <span className="text-muted-foreground">Terminal:</span>
                            <span>Terminal 2</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gate:</span>
                            <span>B3</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
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
                        { resource: "Ground Handling Team", status: "Available", eta: "Immediate", cost: "AED 2,500" },
                        { resource: "Baggage Transfer Service", status: "Confirmed", eta: "30 minutes", cost: "AED 1,800" },
                        { resource: "Catering Services", status: "Arranged", eta: "45 minutes", cost: "AED 3,200" },
                        { resource: "Customer Service Agents", status: "Deployed", eta: "Immediate", cost: "AED 1,500" }
                      ].map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">{resource.resource}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">{resource.status}</Badge>
                            <span className="text-muted-foreground">ETA: {resource.eta}</span>
                            <span className="font-medium text-flydubai-orange">{resource.cost}</span>
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
                          <span className="text-flydubai-orange">AED {(plan.estimatedCost || 44500).toLocaleString()}</span>
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
                          onClick={() => setShowDetailedOptionView(plan)} // Use the new state for detailed view
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
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

      {/* Detailed Recovery Option View Dialog */}
      <Dialog open={!!showDetailedOptionView} onOpenChange={() => setShowDetailedOptionView(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-flydubai-blue" />
              Recovery Option Details - {showDetailedOptionView?.title}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Comprehensive analysis including crew HOTAC changes and passenger reaccommodation details
            </div>
          </DialogHeader>

          {showDetailedOptionView && (
            <DetailedRecoveryOptionView plan={showDetailedOptionView} />
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Dialog for selectedPlan */}
      {selectedPlan && (
        <Dialog
          open={!!selectedPlan}
          onOpenChange={() => setSelectedPlan(null)}
        >
          <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recovery Plan Details - {selectedPlan.id}
              </DialogTitle>
              <DialogDescription>
                Comprehensive view of recovery plan for Flight{" "}
                {selectedPlan.flightNumber}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="flight">Flight Details</TabsTrigger>
                <TabsTrigger value="crew">Crew Assignment</TabsTrigger>
                <TabsTrigger value="steps">Recovery Steps</TabsTrigger>
                <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Recovery Options Comparison */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Target className="h-5 w-5" />
                      Recovery Options Analysis
                    </CardTitle>
                    <p className="text-sm text-blue-700">
                      3 recovery options were evaluated. The selected option is highlighted below.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Option A - Selected */}
                      <Card className="border-2 border-green-400 bg-green-50 relative">
                        <div className="absolute -top-2 left-4">
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            SELECTED
                          </Badge>
                        </div>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-green-800">
                            Option A: {selectedPlan.title}
                          </CardTitle>
                          <Badge className="w-fit bg-green-100 text-green-700 border-green-200">
                            Recommended
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cost:</span>
                              <span className="font-semibold text-green-700">
                                {selectedPlan.cost || selectedPlan.estimatedCost ? 
                                  `AED ${(selectedPlan.estimatedCost || parseInt(selectedPlan.cost?.replace(/[^0-9]/g, '') || '0')).toLocaleString()}` 
                                  : 'TBD'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Timeline:</span>
                              <span className="font-medium">{selectedPlan.timeline}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidence:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={selectedPlan.confidence} className="w-12 h-2" />
                                <span className="font-medium text-green-600">{selectedPlan.confidence}%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Impact:</span>
                              <span className="font-medium">{selectedPlan.impact}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-green-200">
                            <h5 className="text-xs font-medium text-green-800 mb-1">Key Advantages:</h5>
                            <ul className="text-xs text-green-700 space-y-1">
                              <li>• Fastest implementation time</li>
                              <li>• Minimal passenger disruption</li>
                              <li>• High success probability</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Option B - Alternative */}
                      <Card className="border border-gray-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-gray-700">
                            Option B: Delay for Repair
                          </CardTitle>
                          <Badge className="w-fit bg-yellow-100 text-yellow-700 border-yellow-200">
                            Alternative
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cost:</span>
                              <span className="font-semibold text-orange-600">
                                AED {((selectedPlan.estimatedCost || 50000) * 1.8).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Timeline:</span>
                              <span className="font-medium">4-6 hours</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidence:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={65} className="w-12 h-2" />
                                <span className="font-medium">65%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Impact:</span>
                              <span className="font-medium">High</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Considerations:</h5>
                            <ul className="text-xs text-gray-600 space-y-1">
                              <li>• Extended delay duration</li>
                              <li>• Higher compensation costs</li>
                              <li>• Network impact risk</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Option C - Last Resort */}
                      <Card className="border border-gray-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-gray-700">
                            Option C: Cancel & Rebook
                          </CardTitle>
                          <Badge className="w-fit bg-red-100 text-red-700 border-red-200">
                            Last Resort
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cost:</span>
                              <span className="font-semibold text-red-600">
                                AED {((selectedPlan.estimatedCost || 50000) * 3.5).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Timeline:</span>
                              <span className="font-medium">Immediate</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidence:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={85} className="w-12 h-2" />
                                <span className="font-medium">85%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Impact:</span>
                              <span className="font-medium">Severe</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Implications:</h5>
                            <ul className="text-xs text-gray-600 space-y-1">
                              <li>• Complete route cancellation</li>
                              <li>• Maximum compensation</li>
                              <li>• Customer satisfaction risk</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights for Selected Option */}
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Lightbulb className="h-5 w-5" />
                      Key Insights for Selected Option
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Cost Efficiency</span>
                        </div>
                        <div className="text-lg font-bold text-green-700">92%</div>
                        <div className="text-xs text-green-600">vs industry average</div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Time Saved</span>
                        </div>
                        <div className="text-lg font-bold text-blue-700">3.5h</div>
                        <div className="text-xs text-blue-600">vs delay option</div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Passenger Impact</span>
                        </div>
                        <div className="text-lg font-bold text-purple-700">Minimal</div>
                        <div className="text-xs text-purple-600">{selectedPlan.affectedPassengers || 0} affected</div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Success Rate</span>
                        </div>
                        <div className="text-lg font-bold text-orange-700">{selectedPlan.confidence}%</div>
                        <div className="text-xs text-orange-600">historical performance</div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Why This Option Was Selected:</h4>
                      <p className="text-sm text-green-700 leading-relaxed">
                        This recovery option was chosen as it provides the optimal balance between cost efficiency ({((selectedPlan.estimatedCost || 50000) / 1000).toFixed(0)}K AED), 
                        time to resolution ({selectedPlan.timeline}), and passenger satisfaction. The {selectedPlan.confidence}% confidence rating is based on 
                        historical performance of similar recovery scenarios for {selectedPlan.disruptionReason?.toLowerCase() || 'this type of disruption'}.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Recovery Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        {selectedPlan.title}
                      </p>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                          Flight Context
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Aircraft:</span>{" "}
                            <span className="font-medium ml-1">
                              {selectedPlan.aircraft}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Route:</span>{" "}
                            <span className="font-medium ml-1">
                              {selectedPlan.route}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Passengers:</span>{" "}
                            <span className="font-medium ml-1">
                              {selectedPlan.affectedPassengers}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Disruption:</span>{" "}
                            <span className="font-medium ml-1">
                              {selectedPlan.disruptionReason}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="flight" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Flight Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Flight Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Flight Number:</span>
                              <span className="font-medium font-mono">
                                {selectedPlan.flightNumber}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Route:</span>
                              <span className="font-medium">
                                {selectedPlan.route}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Aircraft:</span>
                              <span className="font-medium">
                                {selectedPlan.aircraft}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Aircraft Type:</span>
                              <span className="font-medium">
                                {selectedPlan.flightDetails?.aircraftType ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gate:</span>
                              <span className="font-medium">
                                Terminal{" "}
                                {selectedPlan.flightDetails?.terminal || "N/A"},
                                Gate {selectedPlan.flightDetails?.gate || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">
                            Schedule & Capacity
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Scheduled Departure:</span>
                              <span className="font-medium">
                                {selectedPlan.flightDetails
                                  ?.scheduled_departure ||
                                  selectedPlan.flightDetails
                                    ?.scheduledDeparture ||
                                  formatIST(new Date().toISOString())}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Scheduled Arrival:</span>
                              <span className="font-medium">
                                {selectedPlan.flightDetails
                                  ?.scheduled_arrival ||
                                  selectedPlan.flightDetails
                                    ?.scheduledArrival ||
                                  formatIST(
                                    new Date(
                                      Date.now() + 4 * 60 * 60 * 1000,
                                    ).toISOString(),
                                  )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Passengers:</span>
                              <span className="font-medium">
                                {selectedPlan.affectedPassengers}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cargo:</span>
                              <span className="font-medium">
                                {selectedPlan.flightDetails?.cargo ||
                                  "2.5 tons"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Disruption Severity:</span>
                              <Badge
                                className={
                                  selectedPlan.priority === "Critical"
                                    ? "bg-red-100 text-red-700"
                                    : selectedPlan.priority === "High"
                                      ? "bg-orange-100 text-orange-700"
                                      : selectedPlan.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                }
                              >
                                {selectedPlan.priority || "Medium"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Operational Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Disruption Analysis
                          </h4>
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-800">
                                Primary Issue
                              </span>
                            </div>
                            <p className="text-sm text-red-700">
                              {selectedPlan.disruptionReason}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">
                            Timeline Constraints
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>SLA Deadline:</span>
                              <span className="font-medium">
                                {formatIST(selectedPlan.slaDeadline)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time Remaining:</span>
                              <span
                                className={`font-medium ${getTimeRemainingColor(selectedPlan.timeRemaining)}`}
                              >
                                {selectedPlan.timeRemaining}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Recovery Duration:</span>
                              <span className="font-medium">
                                {selectedPlan.timeline}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="crew" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Assigned Crew Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPlan.assignedCrew &&
                    selectedPlan.assignedCrew.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {selectedPlan.assignedCrew.map((member, index) => {
                          // Handle both object and string formats
                          const crewMember =
                            typeof member === "string"
                              ? {
                                  id: index,
                                  name: member,
                                  role: "Crew Member",
                                  status: "Available",
                                  dutyTime: "8.5 hours",
                                  restTime: "15.5 hours",
                                  location: "DXB",
                                  experience: "Standard",
                                }
                              : member;

                          return (
                            <div
                              key={crewMember.id || index}
                              className="flex items-center gap-4 p-4 border rounded-lg"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">
                                  {crewMember.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {crewMember.role}
                                </p>
                                <div className="grid grid-cols-1 gap-1 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock3 className="h-3 w-3" />
                                    Duty: {crewMember.dutyTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    Rest: {crewMember.restTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {crewMember.location}
                                  </span>
                                  <span>
                                    Experience: {crewMember.experience}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <Badge
                                  className={getCrewStatusColor(
                                    crewMember.status,
                                  )}
                                >
                                  {crewMember.status}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Mail className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* Default crew members when no data available */}
                        {[
                          {
                            id: 1,
                            name: "Capt. Ahmed Al-Mansouri",
                            role: "Captain",
                            status: "Available",
                            dutyTime: "8.5 hours",
                            restTime: "15.5 hours",
                            location: "DXB Terminal 2",
                            experience: "B737, A320 Type Rated",
                          },
                          {
                            id: 2,
                            name: "F/O Sarah Rahman",
                            role: "First Officer",
                            status: "Available",
                            dutyTime: "8.0 hours",
                            restTime: "16.0 hours",
                            location: "DXB Terminal 2",
                            experience: "B737 Type Rated",
                          },
                          {
                            id: 3,
                            name: "SSCC Lisa Martinez",
                            role: "Senior Cabin Crew",
                            status: "Available",
                            dutyTime: "9.0 hours",
                            restTime: "15.0 hours",
                            location: "DXB Terminal 2",
                            experience: "5+ years international",
                          },
                          {
                            id: 4,
                            name: "CC Maria Santos",
                            role: "Cabin Crew",
                            status: "Near Limit",
                            dutyTime: "11.5 hours",
                            restTime: "12.5 hours",
                            location: "DXB Terminal 2",
                            experience: "3+ years regional",
                          },
                        ].map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-4 p-4 border rounded-lg"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {member.role}
                              </p>
                              <div className="grid grid-cols-1 gap-1 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock3 className="h-3 w-3" />
                                  Duty: {member.dutyTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  Rest: {member.restTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {member.location}
                                </span>
                                <span>Experience: {member.experience}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <Badge
                                className={getCrewStatusColor(member.status)}
                              >
                                {member.status}
                              </Badge>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Phone className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="steps" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Recovery Steps Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPlan.recoverySteps &&
                    selectedPlan.recoverySteps.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPlan.recoverySteps.map((step, index) => {
                          // Handle both object and string formats
                          const stepData =
                            typeof step === "string"
                              ? {
                                  id: index,
                                  action: step,
                                  description: "Recovery step",
                                  duration: "15-30 minutes",
                                  responsible: "Operations Team",
                                  location: "Operations Center",
                                  estimatedCost: 1000,
                                  criticalPath: index < 2,
                                  status: "pending",
                                }
                              : step;

                          return (
                            <div
                              key={stepData.id || index}
                              className="flex items-start gap-4 p-4 border rounded-lg"
                            >
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                    stepData.criticalPath
                                      ? "bg-red-100 text-red-700 border-2 border-red-200"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  <div className="lg:col-span-2">
                                    <h4 className="font-medium">
                                      {stepData.action}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {stepData.description ||
                                        "Recovery action step"}
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {stepData.duration}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {stepData.responsible}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {stepData.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />$
                                        {(
                                          stepData.estimatedCost || 0
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {stepData.criticalPath && (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200"
                                      >
                                        Critical Path
                                      </Badge>
                                    )}
                                    <Badge
                                      className={
                                        stepData.status === "completed"
                                          ? "bg-green-100 text-green-700"
                                          : stepData.status === "in-progress"
                                            ? "bg-blue-100 text-blue-700"
                                            : stepData.status === "rejected"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-gray-100 text-gray-700"
                                      }
                                    >
                                      {stepData.status === "pending"
                                        ? "Pending"
                                        : stepData.status || "Pending"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Default recovery steps when no data available */}
                        {[
                          {
                            id: 1,
                            action: "Crew Notification",
                            description:
                              "Notify assigned crew of schedule change via CrewApp",
                            duration: "5 minutes",
                            responsible: "Crew Controller",
                            location: "Operations Center",
                            estimatedCost: 0,
                            criticalPath: true,
                            status: "completed",
                          },
                          {
                            id: 2,
                            action: "Aircraft Preparation",
                            description:
                              "Prepare alternative aircraft and perform pre-flight checks",
                            duration: "45 minutes",
                            responsible: "Ground Crew",
                            location: "Gate A12",
                            estimatedCost: 2500,
                            criticalPath: true,
                            status: "in-progress",
                          },
                          {
                            id: 3,
                            action: "Passenger Communication",
                            description:
                              "Inform passengers of delay and provide updates",
                            duration: "15 minutes",
                            responsible: "Customer Service",
                            location: "Terminal 2",
                            estimatedCost: 500,
                            criticalPath: false,
                            status: "pending",
                          },
                          {
                            id: 4,
                            action: "Baggage Transfer",
                            description:
                              "Transfer baggage to alternative aircraft",
                            duration: "30 minutes",
                            responsible: "Baggage Team",
                            location: "Ramp",
                            estimatedCost: 800,
                            criticalPath: false,
                            status: "pending",
                          },
                        ].map((step, index) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-4 p-4 border rounded-lg"
                          >
                            <div className="flex-shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                  step.criticalPath
                                    ? "bg-red-100 text-red-700 border-2 border-red-200"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                  <h4 className="font-medium">{step.action}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {step.description}
                                  </p>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {step.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {step.responsible}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {step.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />AED                                      {step.estimatedCost.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  {step.criticalPath && (
                                    <Badge
                                      variant="outline"
                                      className="bg-red-50 text-red-700 border-red-200"
                                    >
                                      Critical Path
                                    </Badge>
                                  )}
                                  <Badge
                                    className={
                                      step.status === "completed"
                                        ? "bg-green-100 text-green-700"
                                        : step.status === "in-progress"
                                          ? "bg-blue-100 text-blue-700"
                                          : step.status === "rejected"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-700"
                                    }
                                  >
                                    {step.status === "pending"
                                      ? "Pending"
                                      : step.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="costs" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Cost Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPlan.costBreakdown &&
                      Object.keys(selectedPlan.costBreakdown).length > 0 ? (
                        <div>
                          <div className="space-y-4">
                            <h4 className="font-medium">Cost Breakdown</h4>
                            {selectedPlan.costAnalysis?.cost_breakdown &&
                            Array.isArray(
                              selectedPlan.costAnalysis.cost_breakdown,
                            ) ? (
                              selectedPlan.costAnalysis.cost_breakdown.map(
                                (item: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {typeof item === "object" &&
                                        item !== null
                                          ? item.category ||
                                            item.name ||
                                            `Category ${idx + 1}`
                                          : `Category ${idx + 1}`}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {typeof item === "object" &&
                                        item !== null
                                          ? item.description ||
                                            item.details ||
                                            "N/A"
                                          : "N/A"}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">
                                        {typeof item === "object" &&
                                        item !== null
                                          ? item.amount ||
                                            item.cost ||
                                            item.value ||
                                            "N/A"
                                          : typeof item === "string"
                                            ? item
                                            : "N/A"}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {typeof item === "object" &&
                                        item !== null &&
                                        item.percentage
                                          ? `${item.percentage}%`
                                          : "N/A"}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )
                            ) : (
                              <div className="text-gray-500">
                                No cost breakdown available
                              </div>
                            )}
                          </div>
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Estimated Cost:
                            </span>
                            <span className="text-lg font-semibold">
                              AED{selectedPlan.estimatedCost.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No cost breakdown available for this plan</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Analysis & Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium mb-3">
                            Cost per Passenger
                          </h5>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span>Per Affected Passenger:</span>
                              <span className="font-semibold">
                                {selectedPlan.costAnalysis
                                  ?.cost_per_passenger ||
                                  (selectedPlan.affectedPassengers &&
                                  selectedPlan.estimatedCost
                                    ? `AED ${Math.round(selectedPlan.estimatedCost / selectedPlan.affectedPassengers)}`
                                    : "N/A")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-3">
                            Cost vs Industry Benchmarks
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Industry Average:</span>
                              <span>
                                {typeof selectedPlan.costAnalysis
                                  ?.industry_benchmark === "object"
                                  ? JSON.stringify(
                                      selectedPlan.costAnalysis
                                        .industry_benchmark,
                                    )
                                  : selectedPlan.costAnalysis
                                      ?.industry_benchmark ||
                                    "AED 267/passenger"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>This Plan:</span>
                              <span className="font-semibold">
                                {typeof selectedPlan.costAnalysis
                                  ?.this_plan_cost === "object"
                                  ? selectedPlan.cost || "N/A"
                                  : selectedPlan.costAnalysis?.this_plan_cost ||
                                    selectedPlan.cost ||
                                    "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-3">ROI Analysis</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Avoided Cancellation Cost:</span>
                              <span>
                                {typeof selectedPlan.costAnalysis
                                  ?.avoided_cost === "object"
                                  ? "AED 31,920"
                                  : selectedPlan.costAnalysis?.avoided_cost ||
                                    "AED 31,920"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Net Savings:</span>
                              <span className="font-semibold text-green-600">
                                {typeof selectedPlan.costAnalysis
                                  ?.net_savings === "object"
                                  ? "AED 9,120"
                                  : selectedPlan.costAnalysis?.net_savings ||
                                    "AED 9,120"}
                              </span>
                            </div>
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
    </div>
  );
}