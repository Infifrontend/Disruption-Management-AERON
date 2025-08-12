import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComparisonMatrix } from '../components/ComparisonMatrix'
import { useAppContext } from '../context/AppContext'
import { databaseService } from '../services/databaseService'

export function ComparisonPage() {
  const navigate = useNavigate()
  const { selectedFlight, setSelectedFlight, selectedRecoveryPlan, setSelectedRecoveryPlan, setPassengerServicesContext } = useAppContext()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadFlightFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const flightId = urlParams.get('flightId')

      if (flightId && (!selectedFlight || selectedFlight.id !== parseInt(flightId))) {
        setLoading(true)
        try {
          console.log(`Loading flight details for ID: ${flightId}`)
          const flight = await databaseService.getDisruption(flightId)
          if (flight) {
            // Transform the flight data to match the expected format
            const transformedFlight = {
              ...flight,
              id: flight.id || parseInt(flightId),
              flightNumber: flight.flight_number || flight.flightNumber,
              route: flight.route || `${flight.origin} → ${flight.destination}`,
              scheduledDeparture: flight.scheduled_departure || flight.scheduledDeparture,
              estimatedDeparture: flight.estimated_departure || flight.estimatedDeparture,
              type: flight.disruption_type || flight.type,
              disruptionReason: flight.disruption_reason || flight.disruptionReason,
              severity: flight.severity,
              status: flight.status,
              categorization: flight.categorization || getCategorization(flight.disruption_type || flight.type || 'Technical'),
              priority: flight.severity || 'Medium'
            }
            console.log('Flight loaded successfully:', transformedFlight.flightNumber)
            setSelectedFlight(transformedFlight)
          } else {
            console.warn(`No flight found for ID: ${flightId}`)
          }
        } catch (error) {
          console.error('Error loading flight details:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    // Helper function to get categorization
    const getCategorization = (type) => {
      const categoryMap = {
        Technical: "Aircraft issue (e.g., AOG)",
        Weather: "ATC/weather delay",
        Crew: "Crew issue (e.g., sick report, duty time breach)",
        ATC: "ATC/weather delay",
        Airport: "Airport curfew/ramp congestion",
        Rotation: "Rotation misalignment or maintenance hold"
      }
      return categoryMap[type] || "Aircraft issue (e.g., AOG)"
    }

    loadFlightFromUrl()
  }, [selectedFlight, setSelectedFlight])

  const handleSelectPlan = (plan: any) => {
    console.log("Selected plan:", plan);
    // Set the passenger services context when a plan is selected for execution
    if (plan.fromExecution) {
      setPassengerServicesContext(plan);
    }
    setSelectedRecoveryPlan(plan)
    navigate('/comparison') // Changed to navigate to comparison page itself
  }

  // Get comparison data from context if available
  const comparisonData = selectedRecoveryPlan?.comparisonData || {
    flight: selectedFlight,
    options: [],
    scenarioData: null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flydubai-blue mx-auto mb-4"></div>
          <p>Loading flight details...</p>
        </div>
      </div>
    )
  }

  return (
    <ComparisonMatrix
      selectedFlight={comparisonData.flight || selectedFlight}
      recoveryOptions={comparisonData.options}
      scenarioData={comparisonData.scenarioData}
      onSelectPlan={handleSelectPlan}
    />
  )
}