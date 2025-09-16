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
                <strong>Flight ID:</strong> {reassignedCrewData.flightId}
              </div>
              <div>
                <strong>Option:</strong> {reassignedCrewData.optionTitle}
              </div>
              <div>
                <strong>Reassignments:</strong>{" "}
                {reassignedCrewData.totalReassignments}
              </div>
              <div>
                <strong>Crew Count:</strong>{" "}
                {reassignedCrewData.reassignedCrew?.length || 0}
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
              !Array.isArray(recoveryOption.crewAssignments) && (
                <div className="space-y-4">
                  {/* Original/Current Crew */}
                  {recoveryOption.crewAssignments.originalCrew &&
                    Array.isArray(recoveryOption.crewAssignments.originalCrew) &&
                    recoveryOption.crewAssignments.originalCrew.length > 0 && (
                      <div className="flex items-center gap-4 p-3 bg-white rounded border border-blue-200">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900">
                            Original Crew Assignment
                          </h4>
                          <p className="text-sm text-blue-700">
                            {recoveryOption.crewAssignments.originalCrew.length} original crew members
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {recoveryOption.crewAssignments.originalCrew.map((crew, index) => (
                              <Badge
                                key={index}
                                className="bg-gray-100 text-gray-700 text-xs"
                              >
                                {getSafeStringValue(crew?.name || "Unknown")} ({getSafeStringValue(crew?.role || crew?.rank || "Crew")})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Reassigned Crew */}
                  {recoveryOption.crewAssignments.reassignedCrew &&
                    Array.isArray(recoveryOption.crewAssignments.reassignedCrew) &&
                    recoveryOption.crewAssignments.reassignedCrew.length > 0 && (
                      <div className="flex items-center gap-4 p-3 bg-white rounded border border-green-200">
                        <Users className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">
                            Reassigned Crew
                          </h4>
                          <p className="text-sm text-green-700">
                            {recoveryOption.crewAssignments.reassignedCrew.length} crew members reassigned
                          </p>
                          <div className="space-y-2 mt-2">
                            {recoveryOption.crewAssignments.reassignedCrew.map((crew, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-green-25 rounded border">
                                <div className="flex items-center gap-3">
                                  <Badge className="bg-green-100 text-green-700">
                                    {getSafeStringValue(crew?.role || crew?.rank || "Crew")}
                                  </Badge>
                                  <span className="font-medium">
                                    {getSafeStringValue(crew?.name || "Unknown")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {crew?.isReplacement && (
                                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                                      Replacement
                                    </Badge>
                                  )}
                                  {crew?.replacedCrew && (
                                    <span className="text-xs text-gray-500">
                                      (replacing: {getSafeStringValue(crew.replacedCrew)})
                                    </span>
                                  )}
                                  {crew?.issue && (
                                    <Badge className="bg-red-100 text-red-700 text-xs">
                                      Issue: {getSafeStringValue(crew.issue)}
                                    </Badge>
                                  )}
                                  <Badge className={`text-xs ${
                                    crew?.status === 'Available' ? 'bg-green-100 text-green-700' :
                                    crew?.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {getSafeStringValue(crew?.status || "Unknown")}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Regular Assigned Crew (fallback if no reassigned crew) */}
                  {(!recoveryOption.crewAssignments.reassignedCrew || recoveryOption.crewAssignments.reassignedCrew.length === 0) &&
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
                            {recoveryOption.crewAssignments.assignedCrew.length} crew members assigned
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {recoveryOption.crewAssignments.assignedCrew.slice(0, 3).map((crew, index) => (
                              <Badge
                                key={index}
                                className="bg-blue-100 text-blue-700 text-xs"
                              >
                                {getSafeStringValue(crew?.name || "Unknown")} ({getSafeStringValue(crew?.role || crew?.rank || "Crew")})
                              </Badge>
                            ))}
                            {recoveryOption.crewAssignments.assignedCrew.length > 3 && (
                              <Badge className="bg-gray-100 text-gray-700 text-xs">
                                +{recoveryOption.crewAssignments.assignedCrew.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Crew Swaps and Reassignments Summary */}
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

                  {/* Rotation Impact */}
                  {recoveryOption.crewAssignments.rotationImpact &&
                    typeof recoveryOption.crewAssignments.rotationImpact === "object" &&
                    Object.keys(recoveryOption.crewAssignments.rotationImpact).length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <h5 className="font-medium text-yellow-900 mb-2">Rotation Impact</h5>
                        <div className="text-sm text-yellow-800">
                          {Object.entries(recoveryOption.crewAssignments.rotationImpact).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                              <span>{getSafeStringValue(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
              )}

         

            <div className="text-xs text-blue-600">
              ✓ All selections from the recovery option analysis have been
              preserved and will be applied to the passenger services.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Reassigned Crew Data Display */}
      {reassignedCrewData && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="h-5 w-5" />
              Reassigned Crew Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded border border-green-200">
                <div className="text-sm">
                  <strong>Flight ID:</strong> {renderSafeValue(reassignedCrewData.flightId)}
                </div>
              </div>
              <div className="p-3 bg-white rounded border border-green-200">
                <div className="text-sm">
                  <strong>Recovery Option:</strong> {renderSafeValue(reassignedCrewData.optionTitle)}
                </div>
              </div>
              <div className="p-3 bg-white rounded border border-green-200">
                <div className="text-sm">
                  <strong>Total Reassignments:</strong> {renderSafeValue(reassignedCrewData.totalReassignments)}
                </div>
              </div>
            </div>

            {/* Detailed Crew List */}
            {reassignedCrewData.reassignedCrew && Array.isArray(reassignedCrewData.reassignedCrew) && (
              <div className="p-3 bg-white rounded border border-green-200">
                <h5 className="font-medium text-green-900 mb-3">Reassigned Crew Members</h5>
                <div className="space-y-2">
                  {reassignedCrewData.reassignedCrew.map((crew, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-25 rounded border">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-700">
                          {getSafeStringValue(crew?.role || crew?.rank || "Crew")}
                        </Badge>
                        <span className="font-medium">
                          {getSafeStringValue(crew?.name || "Unknown")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {crew?.isReplacement && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            Replacement
                          </Badge>
                        )}
                        {crew?.originalCrew && (
                          <span className="text-xs text-gray-500">
                            (was: {getSafeStringValue(crew.originalCrew)})
                          </span>
                        )}
                        <Badge className={`text-xs ${
                          crew?.status === 'Available' ? 'bg-green-100 text-green-700' :
                          crew?.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getSafeStringValue(crew?.status || "Unknown")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reassignment Timeline */}
            {reassignedCrewData.timestamp && (
              <div className="p-3 bg-white rounded border border-green-200">
                <div className="text-xs text-gray-500">
                  <strong>Reassignment Completed:</strong> {new Date(reassignedCrewData.timestamp).toLocaleString()}
                </div>
              </div>
            )}
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