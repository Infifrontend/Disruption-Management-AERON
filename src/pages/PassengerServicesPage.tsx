import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { PassengerRebooking } from "../components/PassengerRebooking";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plane, Users, Info, DollarSign, AlertTriangle } from "lucide-react";

// Helper function to safely get string values, defaulting to "N/A" or provided default
const getSafeStringValue = (value, defaultValue = "N/A") => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  // Attempt to convert other types to string, or use default
  try {
    return String(value);
  } catch (e) {
    return defaultValue;
  }
};

// Helper function to safely render values, handling potential null/undefined
const renderSafeValue = (value, defaultValue = "N/A") => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return String(value);
};


export function PassengerServicesPage() {
  const {
    passengerServicesContext,
    setPassengerServicesContext,
    reassignedCrewData,
  } = useAppContext();
  const location = useLocation();
  const [preservedSelections, setPreservedSelections] = useState(null);

  // Handle context from navigation state (when coming from Execute button)
  useEffect(() => {
    if (location.state && location.state.fromExecution) {
      setPassengerServicesContext(location.state);

      // Extract and preserve the stored selections
      if (location.state.storedSelections) {
        setPreservedSelections(location.state.storedSelections);
      }
    }
  }, [location.state, setPassengerServicesContext]);

  // Use context from app state or navigation state
  const activeContext = passengerServicesContext || location.state;
  const recoveryOption = activeContext?.recoveryOption;
  console.log(activeContext, "recoveryOption");
  console.log(recoveryOption, "recoveryOptionattasdtastd");

  return (
    <div className="space-y-6">
      <PassengerRebooking
        context={activeContext}
        preservedSelections={preservedSelections}
        onClearContext={() => {
          setPassengerServicesContext(null);
          setPreservedSelections(null);
          // Clear navigation state if it exists
          if (window.history.state) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
      />
    </div>
  );
}