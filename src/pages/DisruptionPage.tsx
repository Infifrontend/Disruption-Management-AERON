import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { DisruptionInput } from '../components/DisruptionInput'

export function DisruptionPage() {
  const navigate = useNavigate()
  const { selectedDisruption, setSelectedFlight, setCurrentPage } = useAppContext()

  const handleNavigateToComparison = (flight, recoveryOptions = []) => {
    console.log('Navigating to comparison with flight:', flight, 'and options:', recoveryOptions);
    setSelectedFlight(flight);
    // Store recovery options in context for comparison page
    if (recoveryOptions && recoveryOptions.length > 0) {
      // You can store this in app context or pass it via a different mechanism
      sessionStorage.setItem('recoveryOptions', JSON.stringify(recoveryOptions));
    }
    setCurrentPage('comparison');
  };

  return (
    <DisruptionInput
      disruption={selectedDisruption}
      onSelectFlight={handleNavigateToComparison}
      onNavigateToComparison={handleNavigateToComparison}
    />
  )
}