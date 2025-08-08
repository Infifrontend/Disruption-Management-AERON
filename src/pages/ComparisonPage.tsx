import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComparisonMatrix } from '../components/ComparisonMatrix'
import { useAppContext } from '../context/AppContext'
import { databaseService } from '../services/databaseService'

export function ComparisonPage() {
  const navigate = useNavigate()
  const { selectedFlight, setSelectedFlight, selectedRecoveryPlan, setSelectedRecoveryPlan } = useAppContext()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadFlightFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const flightId = urlParams.get('flightId')

      if (flightId && (!selectedFlight || selectedFlight.id !== parseInt(flightId))) {
        setLoading(true)
        try {
          const flight = await databaseService.getDisruption(flightId)
          if (flight) {
            setSelectedFlight(flight)
          } else {
            console.warn(`Flight with ID ${flightId} not found`)
          }
        } catch (error) {
          console.error('Error loading flight details:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadFlightFromUrl()
  }, [selectedFlight, setSelectedFlight])

  const handleSelectPlan = (plan: any) => {
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