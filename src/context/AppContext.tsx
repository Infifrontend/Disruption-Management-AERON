import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../services/authService'
import { getAirlineConfig, type AirlineTheme } from '../config/airlineConfig'
import { databaseService } from '../services/databaseService'

interface AppContextType {
  selectedDisruption: any;
  setSelectedDisruption: (disruption: any) => void;
  selectedFlight: any;
  setSelectedFlight: (flight: any) => void;
  selectedRecoveryPlan: any;
  setSelectedRecoveryPlan: (plan: any) => void;
  passengerServicesContext: any;
  setPassengerServicesContext: (context: any) => void;
  reassignedCrewData: any;
  setReassignedCrewData: (data: any) => void;
  crewAssignmentContext: any;
  setCrewAssignmentContext: (context: any) => void;
  filters: any;
  setFilters: (filters: any) => void;
  screenSettings: screenSettings[];
  setScreenSettings: (settings: screenSettings[]) => void;
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  airlineConfig: AirlineTheme;
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
  const [reassignedCrewData, setReassignedCrewData] = useState<any | null>(null)
  const [crewAssignmentContext, setCrewAssignmentContext] = useState<any | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const airlineConfig = getAirlineConfig()
  const [filters, setFilters] = useState({
    flightNumber: "",
    station: "",
    region: "",
    dateTime: "",
  });

  const [screenSettings, setScreenSettings] = useState<screenSettings[]>([]);

  // Load screen settings from API on component mount
  useEffect(() => {
    const loadScreenSettings = async () => {
      try {
        const settings = await databaseService.getScreenSettings();
        if (settings && settings.length > 0) {
          setScreenSettings(settings);
        } else {
          // Fallback to default settings if API fails
          setScreenSettings([
            {
              id: "dashboard",
              name: "Dashboard",
              icon: "TrendingUp",
              category: "main",
              enabled: true,
              required: true,
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
        }
      } catch (error) {
        console.error("Failed to load screen settings:", error);
        // Use minimal fallback settings
        setScreenSettings([
          {
            id: "dashboard",
            name: "Dashboard",
            icon: "TrendingUp",
            category: "main",
            enabled: true,
            required: true,
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
      }
    };

    loadScreenSettings();
  }, []);

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
        reassignedCrewData,
        setReassignedCrewData,
        crewAssignmentContext,
        setCrewAssignmentContext,
        filters,
        setFilters,
        screenSettings,
        setScreenSettings,
        currentUser,
        setCurrentUser,
        airlineConfig,
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