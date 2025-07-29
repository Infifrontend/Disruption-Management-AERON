import React from 'react'
import { useAppContext } from '../context/AppContext'
import { PassengerRebooking } from "../components/PassengerRebooking"

export function PassengerServicesPage() {
  const { passengerServicesContext, setPassengerServicesContext } = useAppContext()

  return (
    <PassengerRebooking 
      context={passengerServicesContext}
      onClearContext={() => setPassengerServicesContext(null)}
    />
  )
}