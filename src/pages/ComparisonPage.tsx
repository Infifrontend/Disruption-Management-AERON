
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { ComparisonMatrix } from '../components/ComparisonMatrix'

export function ComparisonPage() {
  const navigate = useNavigate()
  const { selectedFlight, setSelectedRecoveryPlan } = useAppContext()

  const handleSelectPlan = (plan: any) => {
    setSelectedRecoveryPlan(plan)
    navigate('/detailed')
  }

  return (
    <ComparisonMatrix 
      selectedFlight={selectedFlight}
      onSelectPlan={handleSelectPlan}
    />
  )
}
