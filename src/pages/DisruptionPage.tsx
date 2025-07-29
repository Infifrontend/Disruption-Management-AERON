
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { DisruptionInput } from '../components/DisruptionInput'

export function DisruptionPage() {
  const navigate = useNavigate()
  const { selectedDisruption, setSelectedFlight } = useAppContext()

  const handleSelectFlight = (flight: any) => {
    setSelectedFlight(flight)
    navigate('/recovery')
  }

  return (
    <DisruptionInput 
      disruption={selectedDisruption}
      onSelectFlight={handleSelectFlight}
    />
  )
}
