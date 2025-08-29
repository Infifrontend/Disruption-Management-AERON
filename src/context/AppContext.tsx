import React, { createContext, useContext, useState, ReactNode } from 'react'
import { User } from '../services/authService'

interface AppContextType {
  selectedDisruption: any;
  setSelectedDisruption: (disruption: any) => void;
  selectedFlight: any;
  setSelectedFlight: (flight: any) => void;
  selectedRecoveryPlan: any;
  setSelectedRecoveryPlan: (plan: any) => void;
  passengerServicesContext: any;
  setPassengerServicesContext: (context: any) => void;
  filters: any;
  setFilters: (filters: any) => void;
  screenSettings: screenSettings[];
  setScreenSettings: (settings: screenSettings[]) => void;
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
}

type screenSettings = {
  id: string;
  name: string;
  icon: string;
  category: string;
  enabled: boolean;
  required: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedDisruption, setSelectedDisruption] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedRecoveryPlan, setSelectedRecoveryPlan] = useState<any | null>(null)
  const [passengerServicesContext, setPassengerServicesContext] = useState<any | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [filters, setFilters] = useState({
    flightNumber: "",
    station: "",
    region: "",
    dateTime: "",
  });

  const [screenSettings, setScreenSettings] = useState<screenSettings[]>([
    {
      id: "dashboard",
      name: "Dashboard",
      icon: "TrendingUp",
      category: "main",
      enabled: true,
      required: true,
    },
    {
      id: "flight-tracking",
      name: "Flight Tracking Gantt",
      icon: "Calendar",
      category: "operations",
      enabled: false,
      required: false,
    },
    {
      id: "disruption",
      name: "Affected Flights",
      icon: "AlertTriangle",
      category: "operations",
      enabled: true,
      required: false,
    },
    {
      id: "recovery",
      name: "Recovery Options",
      icon: "Plane",
      category: "operations",
      enabled: false,
      required: false,
    },
    {
      id: "comparison",
      name: "Recovery Options",
      icon: "FileText",
      category: "operations",
      enabled: true,
      required: false,
    },
    {
      id: "detailed",
      name: "Recovery Plan",
      icon: "Users",
      category: "operations",
      enabled: false,
      required: false,
    },
    {
      id: "prediction-dashboard",
      name: "Prediction Dashboard",
      icon: "Brain",
      category: "prediction",
      enabled: false,
      required: false,
    },
    {
      id: "flight-disruption-list",
      name: "Flight Disruption List",
      icon: "Target",
      category: "prediction",
      enabled: false,
      required: false,
    },
    {
      id: "prediction-analytics",
      name: "Prediction Analytics",
      icon: "Activity",
      category: "prediction",
      enabled: false,
      required: false,
    },
    {
      id: "risk-assessment",
      name: "Risk Assessment",
      icon: "Shield",
      category: "prediction",
      enabled: false,
      required: false,
    },
    {
      id: "pending",
      name: "Pending Solutions",
      icon: "ClockIcon",
      category: "monitoring",
      enabled: true,
      required: false,
    },
    {
      id: "past-logs",
      name: "Past Recovery Logs",
      icon: "CheckSquare",
      category: "monitoring",
      enabled: true,
      required: false,
    },
    {
      id: "maintenance",
      name: "Aircraft Maintenance",
      icon: "Wrench",
      category: "monitoring",
      enabled: true,
      required: false,
    },
    {
      id: "passengers",
      name: "Services",
      icon: "UserCheck",
      category: "services",
      enabled: false,
      required: false,
    },
    {
      id: "hotac",
      name: "HOTAC Management",
      icon: "Hotel",
      category: "services",
      enabled: true,
      required: false,
    },
    {
      id: "fuel-optimization",
      name: "Fuel Optimization",
      icon: "Fuel",
      category: "analytics",
      enabled: false,
      required: false,
    },
    {
      id: "reports",
      name: "Reports & Analytics",
      icon: "BarChart3",
      category: "analytics",
      enabled: false,
      required: false,
    },
    {
      id: "settings",
      name: "Settings",
      icon: "Settings",
      category: "system",
      enabled: true,
      required: true,
    },
  ]);

  return (
    <AppContext.Provider
      value={{
        selectedDisruption,
        setSelectedDisruption,
        selectedFlight,
        setSelectedFlight,
        selectedRecoveryPlan,
        setSelectedRecoveryPlan,
        passengerServicesContext,
        setPassengerServicesContext,
        filters,
        setFilters,
        screenSettings,
        setScreenSettings,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}