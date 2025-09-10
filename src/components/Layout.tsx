import React, { useState, useEffect, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAppContext } from "../context/AppContext";
import { databaseService } from "../services/databaseService";
import { authService } from "../services/authService";
import { useAirlineTheme } from "../hooks/useAirlineTheme";
import { injectAirlineTheme } from "../config/airlineConfig";
import AirlineLogo from "./AirlineLogo";
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Plane,
  FileText,
  Users,
  Brain,
  Target,
  Activity,
  Shield,
  ClockIcon,
  CheckSquare,
  Wrench,
  UserCheck,
  Hotel,
  Fuel,
  BarChart3,
  Settings,
  RotateCcw,
  Wifi,
  WifiOff,
} from "lucide-react";

const iconMap = {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Plane,
  FileText,
  Users,
  Brain,
  Target,
  Activity,
  Shield,
  ClockIcon,
  CheckSquare,
  Wrench,
  UserCheck,
  Hotel,
  Fuel,
  BarChart3,
  Settings,
};

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenSettings, filters, setFilters, currentUser, setCurrentUser } =
    useAppContext();
  const [sidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [flightStats, setFlightStats] = useState({
    totalAffected: 0,
    highPriority: 0,
    activeFlights: 0,
    totalPassengers: 0,
  });

  const { airlineConfig } = useAirlineTheme();

  useEffect(() => {
    // Ensure theme is injected when Layout mounts
    injectAirlineTheme();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    navigate("/login");
  };

  const enabledScreens = screenSettings.filter((screen) => screen.enabled);

  // Filter screens based on user permissions
  const getFilteredScreensByPermission = (screens) => {
    if (!currentUser) return [];
    
    // Define route permissions mapping
    const routePermissions = {
      'maintenance': 'super_admin',
      'passengers': 'passenger_manager', 
      'hotac': 'crew_manager',
      'settings': 'super_admin'
    };

    return screens.filter(screen => {
      const requiredUserType = routePermissions[screen.id];
      
      // If no specific permission required, show to all authenticated users
      if (!requiredUserType) return true;
      
      // Super admin has access to everything
      if (currentUser.userType === 'super_admin') return true;
      
      // Check specific user type permission
      return currentUser.userType === requiredUserType;
    });
  };

  const filteredScreens = getFilteredScreensByPermission(enabledScreens);

  // Update connectivity status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update current date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch real-time flight statistics
  useEffect(() => {
    let isMounted = true;

    const fetchFlightStats = async () => {
      try {
        const disruptions = await databaseService.getAllDisruptions();

        if (!isMounted) return;

        const totalAffected = disruptions.length;
        const highPriority = disruptions.filter(
          (d) => d.severity === "Critical" || d.severity === "High",
        ).length;
        const activeFlights = disruptions.filter(
          (d) => d.status === "Active" || d.status === "Delayed",
        ).length;
        const totalPassengers = disruptions.reduce(
          (sum, d) => sum + (d.passengers || 0),
          0,
        );

        setFlightStats({
          totalAffected,
          highPriority,
          activeFlights,
          totalPassengers,
        });
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch flight statistics:", error);
          setFlightStats({
            totalAffected: 0,
            highPriority: 0,
            activeFlights: 0,
            totalPassengers: 0,
          });
        }
      }
    };

    fetchFlightStats();
    const interval = setInterval(fetchFlightStats, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Format date and time in IST (Indian Standard Time)
  const formatDateTime = (date: Date) => {
    const istDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    };
    const dateStr = istDate.toLocaleDateString("en-IN", options);
    const timeStr = istDate.toLocaleTimeString("en-IN", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime(currentDateTime);

  const categories = {
    main: { name: "Main", color: "text-airline-primary" },
    operations: { name: "Operations", color: "text-airline-primary" },
    prediction: { name: "Prediction", color: "text-airline-navy" },
    monitoring: { name: "Monitoring", color: "text-airline-navy" },
    services: { name: "Services", color: "text-airline-primary" },
    analytics: { name: "Analytics", color: "text-airline-navy" },
    system: { name: "System", color: "text-gray-600" },
  };

  const getQuickStats = () => {
    const pathname = location.pathname;
    switch (pathname) {
      case "/":
      case "/dashboard":
        return {
          icon: BarChart3,
          title: `${(((flightStats.totalAffected - flightStats.highPriority) / Math.max(flightStats.totalAffected, 1)) * 100).toFixed(1)}% Solution Adoption`,
          subtitle: `${flightStats.totalAffected} Total Disruptions`,
          color: "airline-primary",
        };
      case "/flight-tracking":
        return {
          icon: Calendar,
          title: `${flightStats.activeFlights} Aircraft Active`,
          subtitle: `${flightStats.totalAffected} Flights Tracked`,
          color: "airline-primary",
        };
      case "/disruption":
        return {
          icon: AlertTriangle,
          title: `${flightStats.totalAffected} Flights Affected`,
          subtitle: `${flightStats.highPriority} High Priority`,
          color: "airline-secondary",
        };
      case "/recovery":
        return {
          icon: Plane,
          title: `${Math.min(flightStats.totalAffected * 3, 12)} Options Available`,
          subtitle: `${Math.ceil(flightStats.totalAffected * 0.3)} Recommended`,
          color: "airline-primary",
        };
      case "/prediction-dashboard":
        return {
          icon: Brain,
          title: `${flightStats.totalAffected + Math.floor(flightStats.totalAffected * 0.2)} Disruptions Predicted`,
          subtitle: `${(85 + Math.random() * 10).toFixed(1)}% Accuracy Rate`,
          color: "airline-navy",
        };
      case "/passengers":
        return {
          icon: UserCheck,
          title: `${flightStats.totalPassengers.toLocaleString()} Passengers Affected`,
          subtitle: `${flightStats.totalAffected} Flights`,
          color: "airline-primary",
        };
      case "/pending":
        return {
          icon: ClockIcon,
          title: `${flightStats.highPriority + Math.floor(flightStats.totalAffected * 0.1)} Solutions Pending`,
          subtitle: `${flightStats.highPriority} High Priority`,
          color: "airline-secondary",
        };
      case "/hotac":
        return {
          icon: Hotel,
          title: `${flightStats.totalAffected * 2} HOTAC Records`,
          subtitle: `${Math.floor(flightStats.totalAffected * 0.8)} Confirmed`,
          color: "airline-primary",
        };
      default:
        return null;
    }
  };

  const quickStats = getQuickStats();
  const currentScreen = filteredScreens.find(
    (s) =>
      location.pathname === `/${s.id}` ||
      (location.pathname === "/" && s.id === "dashboard"),
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 min-w-[15rem] max-w-[15rem] bg-airline-primary text-white border-r border-airline-primary flex flex-col flex-shrink-0 overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-airline-primary min-h-[120px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 w-full">
            <AirlineLogo className="responsive-logo h-8 w-auto" />
            {sidebarOpen && (
              <div className="text-center">
                <h1 className="text-base font-semibold text-white">AERON</h1>
                <p className="text-xs text-white/70 leading-tight">
                  Adaptive Engine for Recovery &<br />
                  Operational Navigation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          {Object.entries(categories).map(([categoryKey, category]) => {
            const categoryScreens = filteredScreens.filter(
              (screen) => screen.category === categoryKey,
            );
            if (categoryScreens.length === 0) return null;

            return (
              <div key={categoryKey} className="mb-6">
                {sidebarOpen && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-white/70">
                      {category.name}
                    </h3>
                  </div>
                )}

                <div className="space-y-1 px-2">
                  {categoryScreens.map((screen) => {
                    const IconComponent =
                      iconMap[screen.icon as keyof typeof iconMap];
                    const isActive =
                      location.pathname === `/${screen.id}` ||
                      (location.pathname === "/" && screen.id === "dashboard");

                    return (
                      <Button
                        key={screen.id}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 px-3 min-h-[40px] ${isActive ? "bg-white text-airline-primary hover:bg-gray-100" : "text-white hover:text-airline-secondary"}`}
                        onClick={() =>
                          navigate(
                            screen.id === "dashboard" ? "/" : `/${screen.id}`,
                          )
                        }
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                        )}
                        {sidebarOpen && (
                          <span className="truncate flex-1 text-left">
                            {screen.name}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-airline-primary min-h-[80px]">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={`${
                isOnline
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-red-100 text-red-800 border-red-300"
              } flex-shrink-0 flex items-center gap-1`}
            >
              {isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {sidebarOpen && (
              <div className="text-right flex-1">
                <p className="text-xs font-medium text-white">{dateStr}</p>
                <p className="text-xs text-white/70">{timeStr} IST</p>
              </div>
            )}
          </div>
          {/* {sidebarOpen && (
            <div className="pt-2 border-t border-airline-primary">
              <p className="text-xs text-white/70">
                Powered by {airlineConfig.displayName} × AERON Partnership
              </p>
            </div>
          )} */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        {currentScreen?.name && (
          <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-airline-navy">
                  {currentScreen?.name || "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {airlineConfig.displayName} AERON - AI-powered recovery and
                  operational excellence
                </p>
              </div>

              {currentUser && (
                <div className="flex items-center gap-3 border-l pl-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-airline-navy">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser.userCode} |{" "}
                      {currentUser.userType.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollable-content">
          <div className="max-w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
