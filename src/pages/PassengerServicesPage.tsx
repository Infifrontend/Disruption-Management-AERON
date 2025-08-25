import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { PassengerRebooking } from "../components/PassengerRebooking"

export function PassengerServicesPage() {
  const { passengerServicesContext, setPassengerServicesContext } = useAppContext()
  const location = useLocation()

  // Handle context from navigation state (when coming from Execute button)
  useEffect(() => {
    if (location.state && location.state.fromExecution) {
      console.log("Received execution context from navigation:", location.state)
      setPassengerServicesContext(location.state)
    }
  }, [location.state, setPassengerServicesContext])

  // Use context from app state or navigation state
  const activeContext = passengerServicesContext || location.state

  return (
    <PassengerRebooking 
      context={activeContext}
      onClearContext={() => {
        setPassengerServicesContext(null)
        // Clear navigation state if it exists
        if (window.history.state) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }}
    />
  )
}