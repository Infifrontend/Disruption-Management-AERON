import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { PassengerRebooking } from "../components/PassengerRebooking"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Plane, Users, Info } from "lucide-react"

export function PassengerServicesPage() {
  const { passengerServicesContext, setPassengerServicesContext } = useAppContext()
  const location = useLocation()
  const [preservedSelections, setPreservedSelections] = useState(null)

  // Handle context from navigation state (when coming from Execute button)
  useEffect(() => {
    if (location.state && location.state.fromExecution) {
      setPassengerServicesContext(location.state)
      
      // Extract and preserve the stored selections
      if (location.state.storedSelections) {
        setPreservedSelections(location.state.storedSelections)
      }
    }
  }, [location.state, setPassengerServicesContext])

  // Use context from app state or navigation state
  const activeContext = passengerServicesContext || location.state
  const recoveryOption = activeContext?.recoveryOption

  return (
    <div className="space-y-6">
      {/* Display preserved selections if available */}
      {preservedSelections && (activeContext?.fromExecution) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              Preserved Selections from Recovery Option
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aircraft Selection Info */}
            {recoveryOption?.selectedAircraft && (
              <div className="flex items-center gap-4 p-3 bg-white rounded border border-blue-200">
                <Plane className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Selected Aircraft</h4>
                  <p className="text-sm text-blue-700">
                    {recoveryOption.selectedAircraft.reg || recoveryOption.selectedAircraft.aircraft} 
                    ({recoveryOption.selectedAircraft.type || 'B737-800'})
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      Turnaround: {recoveryOption.selectedAircraft.turnaround || '45 min'}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {recoveryOption.selectedAircraft.availability || 'Available'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Crew Assignment Info */}
            {recoveryOption?.crewAssignments && recoveryOption.crewAssignments.assignedCrew.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-white rounded border border-blue-200">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Crew Assignments</h4>
                  <p className="text-sm text-blue-700">
                    {recoveryOption.crewAssignments.assignedCrew.length} crew members assigned
                  </p>
                  <div className="flex gap-2 mt-1">
                    {recoveryOption.crewAssignments.crewSwaps.length > 0 && (
                      <Badge className="bg-orange-100 text-orange-700 text-xs">
                        {recoveryOption.crewAssignments.crewSwaps.length} crew swaps
                      </Badge>
                    )}
                    {recoveryOption.crewAssignments.reassignments.length > 0 && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {recoveryOption.crewAssignments.reassignments.length} reassignments
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-blue-600">
              ✓ All selections from the recovery option analysis have been preserved and will be applied to the passenger services.
            </div>
          </CardContent>
        </Card>
      )}

      <PassengerRebooking 
        context={activeContext}
        preservedSelections={preservedSelections}
        onClearContext={() => {
          setPassengerServicesContext(null)
          setPreservedSelections(null)
          // Clear navigation state if it exists
          if (window.history.state) {
            window.history.replaceState(null, '', window.location.pathname)
          }
        }}
      />
    </div>
  )
}