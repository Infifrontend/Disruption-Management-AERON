
import React from 'react'
import { useAppContext } from '../context/AppContext'
import { SettingsPanel } from '../../components/SettingsPanel'

export function SettingsPage() {
  const { screenSettings, setScreenSettings } = useAppContext()

  return (
    <SettingsPanel 
      screenSettings={screenSettings}
      onScreenSettingsChange={setScreenSettings}
    />
  )
}
