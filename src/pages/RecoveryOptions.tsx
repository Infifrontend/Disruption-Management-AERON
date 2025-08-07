import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { RecoveryOptionsGenerator } from '../components/RecoveryOptionsGenerator'

export function RecoveryOptions() {
  const navigate = useNavigate()
  const { selectedFlight, setSelectedRecoveryPlan, setPassengerServicesContext } = useAppContext()

  const handleSelectRecoveryPlan = (plan: any) => {
    setSelectedRecoveryPlan(plan)
    navigate('/detailed')
  }

  const handlePassengerServices = (context: any) => {
    setPassengerServicesContext(context)
    navigate('/passengers')
  }

  const handleNavigateToPendingSolutions = () => {
    navigate('/pending')
  }

  const handleCompare = (comparisonData: any) => {
    // Store comparison data in app context
    if (comparisonData) {
      setSelectedRecoveryPlan({
        ...selectedRecoveryPlan,
        comparisonData: comparisonData
      })
    }
    navigate('/comparison')
  }

  return (
    <RecoveryOptionsGenerator
      selectedFlight={selectedFlight}
      onSelectPlan={handleSelectRecoveryPlan}
      onCompare={handleCompare}
      onPassengerServices={handlePassengerServices}
      onNavigateToPendingSolutions={handleNavigateToPendingSolutions}
    />
  )
}