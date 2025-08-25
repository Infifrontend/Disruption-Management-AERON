import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { DisruptionInput } from '../components/DisruptionInput'

export function DisruptionPage() {
  const navigate = useNavigate()
  const { selectedDisruption, setSelectedFlight } = useAppContext()

  const handleNavigateToComparison = (flight:any, recoveryOptions?: any []) => {
    console.log('Navigating to comparison with flight:', flight, 'and options:', recoveryOptions);
    setSelectedFlight(flight);
    // Store recovery options in context for comparison page
    if (recoveryOptions && recoveryOptions.length > 0) {
      sessionStorage.setItem('recoveryOptions', JSON.stringify(recoveryOptions));
    }
    // Use navigate instead of setCurrentPage
    navigate(`/comparison?flightId=${flight.id || flight.flightNumber}`);
  };

  return (
    <DisruptionInput
      disruption={selectedDisruption}
      onSelectFlight={handleNavigateToComparison}
      onNavigateToComparison={handleNavigateToComparison}
    />
  )
}