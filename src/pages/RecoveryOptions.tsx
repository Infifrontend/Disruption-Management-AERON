
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

  return (
    <RecoveryOptionsGenerator 
      selectedFlight={selectedFlight}
      onSelectPlan={handleSelectRecoveryPlan}
      onCompare={() => navigate('/comparison')}
      onPassengerServices={handlePassengerServices}
      onNavigateToPendingSolutions={handleNavigateToPendingSolutions}
    />
  )
}
