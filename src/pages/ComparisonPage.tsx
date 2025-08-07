
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { ComparisonMatrix } from '../components/ComparisonMatrix'

export function ComparisonPage() {
  const navigate = useNavigate()
  const { selectedFlight, selectedRecoveryPlan, setSelectedRecoveryPlan } = useAppContext()

  const handleSelectPlan = (plan: any) => {
    setSelectedRecoveryPlan(plan)
    navigate('/pending')
  }

  // Get comparison data from context if available
  const comparisonData = selectedRecoveryPlan?.comparisonData || {
    flight: selectedFlight,
    options: [],
    scenarioData: null
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
