
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
import { Plane, Users, Info } from "lucide-react";

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
  console.log("activeContext:", activeContext);
  console.log("recoveryOption:", recoveryOption);
  console.log("reassignedCrewData:", reassignedCrewData);

  // Safety check to ensure we don't render objects directly
  const getSafeStringValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === "object") {
      // Handle specific object types
      if (value.toString && typeof value.toString === "function" && value.toString() !== "[object Object]") {
        return value.toString();
      }
      return "Object data";
    }
    return String(value);
  };

  // Safe render function for complex objects
  const renderSafeValue = (value) => {
    const safeValue = getSafeStringValue(value);
    return <span>{safeValue}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Debug: Display reassigned crew data if available */}
      {reassignedCrewData && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Info className="h-5 w-5" />
              Reassigned Crew Data (Debug Info)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>
                <strong>Flight ID:</strong> {renderSafeValue(reassignedCrewData.flightId)}
              </div>
              <div>
                <strong>Option:</strong> {renderSafeValue(reassignedCrewData.optionTitle)}
              </div>
              <div>
                <strong>Reassignments:</strong> {renderSafeValue(reassignedCrewData.totalReassignments)}
              </div>
              <div>
                <strong>Crew Count:</strong> {renderSafeValue(reassignedCrewData.reassignedCrew?.length || 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display preserved selections if available */}
      {preservedSelections && activeContext?.fromExecution && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              Preserved Selections from Recovery Option
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aircraft Selection Info */}
            {recoveryOption?.selectedAircraft &&
              typeof recoveryOption.selectedAircraft === "object" &&
              recoveryOption.selectedAircraft !== null &&
              !Array.isArray(recoveryOption.selectedAircraft) && (
                <div className="flex items-center gap-4 p-3 bg-white rounded border border-blue-200">
                  <Plane className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Selected Aircraft
                    </h4>
                    <p className="text-sm text-blue-700">
                      {(() => {
                        const aircraft = recoveryOption.selectedAircraft;
                        if (typeof aircraft === 'object' && aircraft !== null) {
                          const reg = getSafeStringValue(aircraft.reg || aircraft.aircraft || "N/A");
                          const type = getSafeStringValue(aircraft.type || "B737-800");
                          return `${reg} (${type})`;
                        }
                        return "N/A";
                      })()}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        Turnaround: {(() => {
                          const aircraft = recoveryOption.selectedAircraft;
                          const turnaround = getSafeStringValue(aircraft?.turnaround || aircraft?.turnaroundTime || "45 min");
                          return turnaround;
                        })()}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {(() => {
                          const aircraft = recoveryOption.selectedAircraft;
                          const availability = getSafeStringValue(aircraft?.availability || "Available");
                          return availability;
                        })()}
                      </Badge>
                      {(() => {
                        const aircraft = recoveryOption.selectedAircraft;
                        const selectedIndex = aircraft?.selectedIndex;
                        return typeof selectedIndex === "number" ? (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            Option {selectedIndex + 1}
                          </Badge>
                        ) : null;
                      })()}
                    </div>
                    {(() => {
                      const aircraft = recoveryOption.selectedAircraft;
                      const timestamp = aircraft?.selectionTimestamp;
                      return timestamp ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {new Date(timestamp).toLocaleString()}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

            {/* Crew Assignment Info */}
            {recoveryOption?.crewAssignments &&
              typeof recoveryOption.crewAssignments === "object" &&
              recoveryOption.crewAssignments !== null &&
              !Array.isArray(recoveryOption.crewAssignments) &&
              recoveryOption.crewAssignments.assignedCrew &&
              Array.isArray(recoveryOption.crewAssignments.assignedCrew) &&
              recoveryOption.crewAssignments.assignedCrew.length > 0 && (
                <div className="flex items-center gap-4 p-3 bg-white rounded border border-blue-200">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">
                      Crew Assignments
                    </h4>
                    <p className="text-sm text-blue-700">
                      {(() => {
                        const crewAssignments = recoveryOption.crewAssignments;
                        if (typeof crewAssignments === 'object' && crewAssignments !== null) {
                          const assignedCrew = Array.isArray(crewAssignments.assignedCrew) ? crewAssignments.assignedCrew : [];
                          return `${assignedCrew.length} crew members assigned`;
                        }
                        return "No crew information available";
                      })()}
                    </p>

                    {/* Display crew names */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(() => {
                        const crewAssignments = recoveryOption.crewAssignments;
                        const assignedCrew = crewAssignments?.assignedCrew || [];
                        return assignedCrew.slice(0, 3).map((crew, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-100 text-blue-700 text-xs"
                          >
                            {getSafeStringValue(crew?.name || "Unknown")} ({getSafeStringValue(crew?.role || crew?.rank || "Crew")})
                          </Badge>
                        ));
                      })()}
                      {(() => {
                        const crewAssignments = recoveryOption.crewAssignments;
                        const assignedCrew = crewAssignments?.assignedCrew || [];
                        return assignedCrew.length > 3 ? (
                          <Badge className="bg-gray-100 text-gray-700 text-xs">
                            +{assignedCrew.length - 3} more
                          </Badge>
                        ) : null;
                      })()}
                    </div>

                    <div className="flex gap-2 mt-2">
                      {(() => {
                        const crewAssignments = recoveryOption.crewAssignments;
                        const crewSwaps = crewAssignments?.crewSwaps || [];
                        return Array.isArray(crewSwaps) && crewSwaps.length > 0 ? (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            {crewSwaps.length} crew swaps
                          </Badge>
                        ) : null;
                      })()}
                      {(() => {
                        const crewAssignments = recoveryOption.crewAssignments;
                        const reassignments = crewAssignments?.reassignments || [];
                        return Array.isArray(reassignments) && reassignments.length > 0 ? (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {reassignments.length} reassignments
                          </Badge>
                        ) : null;
                      })()}
                    </div>

                    {(() => {
                      const crewAssignments = recoveryOption.crewAssignments;
                      const timestamp = crewAssignments?.assignmentTimestamp;
                      return timestamp ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned: {new Date(timestamp).toLocaleString()}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

            <div className="text-xs text-blue-600">
              ✓ All selections from the recovery option analysis have been
              preserved and will be applied to the passenger services.
            </div>
          </CardContent>
        </Card>
      )}

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
