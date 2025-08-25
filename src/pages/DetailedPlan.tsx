
import { useAppContext } from '../context/AppContext'
import { DetailedRecoveryPlan } from '../components/DetailedRecoveryPlan'

export function DetailedPlan() {
  const { selectedRecoveryPlan, selectedFlight } = useAppContext()

  return (
    <DetailedRecoveryPlan 
      plan={selectedRecoveryPlan}
      flight={selectedFlight}
    />
  )
}
