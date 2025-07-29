'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useSettingsStorage } from '../utils/settingsStorage'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { Progress } from './ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Users, 
  MessageSquare, 
  Brain, 
  Globe, 
  Shield, 
  Bell, 
  Palette, 
  Eye, 
  EyeOff, 
  Trash2,
  Plus,
  Star,
  Target,
  Plane,
  Crown,
  Clock,
  DollarSign,
  Route,
  UserCheck,
  Award,
  TrendingUp,
  Gauge,
  Zap,
  Activity,
  BarChart3,
  Info,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings2,
  Sliders,
  Calculator,
  User,
  Package,
  FileText,
  Wrench,
  Users2,
  GitBranch,
  Network,
  Workflow,
  Building,
  MapPin,
  Timer,
  Fuel,
  Wind,
  CloudRain,
  Navigation,
  Calendar,
  BarChart,
  TrendingDown,
  Coffee,
  Wifi,
  Dumbbell,
  Edit,
  AlertTriangle,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export function SettingsPanel({ screenSettings, onScreenSettingsChange }) {
  const [activeTab, setActiveTab] = useState('screens')
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false)
  const settingsStore = useSettingsStorage()

  // Database-backed state
  const [nlpSettings, setNlpSettings] = useState({
    enabled: true,
    language: 'english',
    confidence: 85,
    autoApply: false,
    accuracyEnhancement: 85,
    complianceWeighting: 75
  })

  // Rule Configuration State
  const [ruleConfiguration, setRuleConfiguration] = useState({
    operationalRules: {
      maxDelayThreshold: 180,     // minutes
      minConnectionTime: 45,      // minutes
      maxOverbooking: 105,        // percentage
      priorityRebookingTime: 15,  // minutes
      hotacTriggerDelay: 240      // minutes
    },
    recoveryConstraints: {
      maxAircraftSwaps: 3,
      crewDutyTimeLimits: true,
      maintenanceSlotProtection: true,
      slotCoordinationRequired: false,
      curfewCompliance: true
    },
    automationSettings: {
      autoApproveThreshold: 95,   // confidence percentage
      requireManagerApproval: false,
      enablePredictiveActions: true,
      autoNotifyPassengers: true,
      autoBookHotac: false
    }
  })

  // Custom Rules Management State
  const [customRules, setCustomRules] = useState([
    {
      id: 'RULE-001',
      name: 'Weather Contingency Rule',
      description: 'Automatic HOTAC booking when weather delay exceeds 4 hours',
      category: 'Weather',
      type: 'Hard',
      overridable: false,
      priority: 1,
      conditions: 'Weather delay > 240 minutes',
      actions: 'Auto-book HOTAC, Notify passengers',
      createdBy: 'System',
      createdDate: '2024-01-15',
      status: 'Active'
    },
    {
      id: 'RULE-002',
      name: 'VIP Passenger Priority',
      description: 'VIP passengers get priority rebooking within 15 minutes',
      category: 'Passenger Service',
      type: 'Soft',
      overridable: true,
      priority: 2,
      conditions: 'Passenger.Priority = VIP AND Status = Disrupted',
      actions: 'Priority rebooking queue, Manager notification',
      createdBy: 'ops.manager@flydubai.com',
      createdDate: '2024-02-01',
      status: 'Active'
    },
    {
      id: 'RULE-003',
      name: 'Crew Duty Time Protection',
      description: 'Block crew assignments that exceed regulatory limits',
      category: 'Crew Management',
      type: 'Hard',
      overridable: false,
      priority: 1,
      conditions: 'CrewMember.DutyTime + FlightTime > RegulatorLimit',
      actions: 'Block assignment, Find alternative crew',
      createdBy: 'System',
      createdDate: '2024-01-10',
      status: 'Active'
    },
    {
      id: 'RULE-004',
      name: 'Cost Threshold Override',
      description: 'Recovery options exceeding AED 50,000 require approval',
      category: 'Financial',
      type: 'Soft',
      overridable: true,
      priority: 3,
      conditions: 'RecoveryOption.Cost > 50000 AED',
      actions: 'Manager approval required, Document justification',
      createdBy: 'finance.manager@flydubai.com',
      createdDate: '2024-01-20',
      status: 'Active'
    },
    {
      id: 'RULE-005',
      name: 'Maintenance Slot Protection',
      description: 'Protect scheduled maintenance slots from disruption recovery',
      category: 'Maintenance',
      type: 'Hard',
      overridable: true,
      priority: 2,
      conditions: 'Aircraft.MaintenanceScheduled = True',
      actions: 'Protect slot, Use alternative aircraft',
      createdBy: 'maintenance.manager@flydubai.com',
      createdDate: '2024-01-25',
      status: 'Active'
    }
  ])

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'Operational',
    type: 'Soft',
    overridable: true,
    priority: 3,
    conditions: '',
    actions: ''
  })

  const [showAddRuleForm, setShowAddRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  // Consolidated Recovery Configuration State
  const [recoveryConfiguration, setRecoveryConfiguration] = useState({
    // Recovery Options Ranking
    recoveryOptionsRanking: {
      costWeight: 30,
      timeWeight: 25,
      passengerImpactWeight: 20,
      operationalComplexityWeight: 15,
      reputationWeight: 10,
      customParameters: []
    },
    
    // Aircraft Selection Criteria
    aircraftSelectionCriteria: {
      maintenanceStatus: 25,
      fuelEfficiency: 20,
      routeSuitability: 20,
      passengerCapacity: 15,
      availabilityWindow: 20,
      customParameters: []
    },
    
    // Crew Assignment Criteria
    crewAssignmentCriteria: {
      dutyTimeRemaining: 30,
      qualifications: 25,
      baseLocation: 20,
      restRequirements: 15,
      languageSkills: 10,
      customParameters: []
    }
  })

  // Passenger Priority Configuration State
  const [passengerPriorityConfig, setPassengerPriorityConfig] = useState({
    // Passenger Prioritization Criteria
    passengerPrioritization: {
      loyaltyTier: 25,        // Weight for loyalty status (Platinum, Gold, etc.)
      ticketClass: 20,        // Weight for cabin class (Business, Premium, Economy)
      specialNeeds: 30,       // Weight for special requirements (wheelchair, medical, etc.)
      groupSize: 15,          // Weight for family/group bookings
      connectionRisk: 10      // Weight for missed connection risk
    },
    
    // Flight Prioritization for Passengers
    flightPrioritization: {
      airlinePreference: 20,   // Weight for flydubai vs partner airlines
      onTimePerformance: 25,   // Weight for historical on-time performance
      aircraftType: 15,        // Weight for aircraft comfort/amenities
      departureTime: 20,       // Weight for preferred departure times
      connectionBuffer: 20     // Weight for adequate connection time
    },
    
    // Flight Scoring Algorithm
    flightScoring: {
      baseScore: 70,          // Starting score for all flights
      priorityBonus: 15,      // Bonus for VIP/Premium passengers
      airlineBonus: 10,       // Bonus for flydubai flights
      specialReqBonus: 8,     // Bonus for accommodating special requirements
      loyaltyBonus: 8,        // Bonus based on loyalty tier
      groupBonus: 5           // Bonus for keeping groups together
    },
    
    // Passenger Scoring Algorithm
    passengerScoring: {
      vipWeight: 40,          // Weight for VIP status
      loyaltyWeight: 25,      // Weight for loyalty tier
      specialNeedsWeight: 20, // Weight for special requirements
      revenueWeight: 15       // Weight for ticket revenue/class
    }
  })

  const [customParameters, setCustomParameters] = useState([])
  const [newParameter, setNewParameter] = useState({
    name: '',
    category: 'recoveryOptionsRanking',
    weight: 10,
    description: ''
  })

  // Load settings from database on component mount
  useEffect(() => {
    loadSettingsFromDatabase()
    checkDatabaseConnection()
  }, [])

  const checkDatabaseConnection = async () => {
    const connected = settingsStore.getDatabaseStatus()
    setIsDatabaseConnected(connected)
  }

  const loadSettingsFromDatabase = async () => {
    setIsLoading(true)
    console.log('Loading settings from database...')
    
    try {
      // Initialize fresh state objects
      let newNlpSettings = {
        enabled: true,
        language: 'english',
        confidence: 85,
        autoApply: false,
        accuracyEnhancement: 85,
        complianceWeighting: 75
      }
      let newRuleConfig = { 
        operationalRules: {
          maxDelayThreshold: 180,
          minConnectionTime: 45,
          maxOverbooking: 105,
          priorityRebookingTime: 15,
          hotacTriggerDelay: 240
        },
        recoveryConstraints: {
          maxAircraftSwaps: 3,
          crewDutyTimeLimits: true,
          maintenanceSlotProtection: true,
          slotCoordinationRequired: false,
          curfewCompliance: true
        },
        automationSettings: {
          autoApproveThreshold: 95,
          requireManagerApproval: false,
          enablePredictiveActions: true,
          autoNotifyPassengers: true,
          autoBookHotac: false
        }
      }
      let newRecoveryConfig = {
        recoveryOptionsRanking: {
          costWeight: 30,
          timeWeight: 25,
          passengerImpactWeight: 20,
          operationalComplexityWeight: 15,
          reputationWeight: 10,
          customParameters: []
        },
        aircraftSelectionCriteria: {
          maintenanceStatus: 25,
          fuelEfficiency: 20,
          routeSuitability: 20,
          passengerCapacity: 15,
          availabilityWindow: 20,
          customParameters: []
        },
        crewAssignmentCriteria: {
          dutyTimeRemaining: 30,
          qualifications: 25,
          baseLocation: 20,
          restRequirements: 15,
          languageSkills: 10,
          customParameters: []
        }
      }
      let newPriorityConfig = {
        passengerPrioritization: {
          loyaltyTier: 25,
          ticketClass: 20,
          specialNeeds: 30,
          groupSize: 15,
          connectionRisk: 10
        },
        flightPrioritization: {
          airlinePreference: 20,
          onTimePerformance: 25,
          aircraftType: 15,
          departureTime: 20,
          connectionBuffer: 20
        },
        flightScoring: {
          baseScore: 70,
          priorityBonus: 15,
          airlineBonus: 10,
          specialReqBonus: 8,
          loyaltyBonus: 8,
          groupBonus: 5
        },
        passengerScoring: {
          vipWeight: 40,
          loyaltyWeight: 25,
          specialNeedsWeight: 20,
          revenueWeight: 15
        }
      }
      let newNotificationSettings = { ...notificationSettings }

      // Load all settings from database
      const allSettings = settingsStore.getAllSettings()
      console.log('Retrieved settings from database:', allSettings.length, 'entries')

      // Process settings by category
      allSettings.forEach(setting => {
        try {
          switch (setting.category) {
            case 'nlpSettings':
              if (newNlpSettings.hasOwnProperty(setting.key)) {
                newNlpSettings[setting.key] = setting.value
              }
              break

            case 'operationalRules':
              if (newRuleConfig.operationalRules.hasOwnProperty(setting.key)) {
                newRuleConfig.operationalRules[setting.key] = setting.value
              }
              break

            case 'recoveryConstraints':
              if (newRuleConfig.recoveryConstraints.hasOwnProperty(setting.key)) {
                newRuleConfig.recoveryConstraints[setting.key] = setting.value
              }
              break

            case 'automationSettings':
              if (newRuleConfig.automationSettings.hasOwnProperty(setting.key)) {
                newRuleConfig.automationSettings[setting.key] = setting.value
              }
              break

            case 'recoveryOptionsRanking':
              if (newRecoveryConfig.recoveryOptionsRanking.hasOwnProperty(setting.key)) {
                newRecoveryConfig.recoveryOptionsRanking[setting.key] = setting.value
              }
              break

            case 'aircraftSelectionCriteria':
              if (newRecoveryConfig.aircraftSelectionCriteria.hasOwnProperty(setting.key)) {
                newRecoveryConfig.aircraftSelectionCriteria[setting.key] = setting.value
              }
              break

            case 'crewAssignmentCriteria':
              if (newRecoveryConfig.crewAssignmentCriteria.hasOwnProperty(setting.key)) {
                newRecoveryConfig.crewAssignmentCriteria[setting.key] = setting.value
              }
              break

            case 'passengerPrioritization':
              if (newPriorityConfig.passengerPrioritization.hasOwnProperty(setting.key)) {
                newPriorityConfig.passengerPrioritization[setting.key] = setting.value
              }
              break

            case 'flightPrioritization':
              if (newPriorityConfig.flightPrioritization.hasOwnProperty(setting.key)) {
                newPriorityConfig.flightPrioritization[setting.key] = setting.value
              }
              break

            case 'flightScoring':
              if (newPriorityConfig.flightScoring.hasOwnProperty(setting.key)) {
                newPriorityConfig.flightScoring[setting.key] = setting.value
              }
              break

            case 'passengerScoring':
              if (newPriorityConfig.passengerScoring.hasOwnProperty(setting.key)) {
                newPriorityConfig.passengerScoring[setting.key] = setting.value
              }
              break

            case 'notificationSettings':
              if (newNotificationSettings.hasOwnProperty(setting.key)) {
                newNotificationSettings[setting.key] = setting.value
              }
              break

            default:
              console.log('Unknown setting category:', setting.category)
          }
        } catch (settingError) {
          console.error('Error processing setting:', setting, settingError)
        }
      })

      // Update state with loaded settings
      console.log('Updating component state with loaded settings...')
      setNlpSettings(newNlpSettings)
      setRuleConfiguration(newRuleConfig)
      setRecoveryConfiguration(newRecoveryConfig)
      setPassengerPriorityConfig(newPriorityConfig)
      setNotificationSettings(newNotificationSettings)

      console.log('Settings loaded successfully:', {
        nlp: newNlpSettings,
        rules: newRuleConfig,
        recovery: newRecoveryConfig,
        priority: newPriorityConfig,
        notifications: newNotificationSettings
      })

    } catch (error) {
      console.error('Failed to load settings from database:', error)
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
      setSaveStatus('idle')
    }
  }

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    desktop: true,
    recoveryAlerts: true,
    passengerUpdates: true,
    systemAlerts: false
  })

  const handleScreenToggle = (screenId) => {
    const updatedSettings = screenSettings.map(screen => {
      if (screen.id === screenId && !screen.required) {
        return { ...screen, enabled: !screen.enabled }
      }
      return screen
    })
    onScreenSettingsChange(updatedSettings)
  }

  const handleNlpToggle = (setting) => {
    const newValue = !nlpSettings[setting]
    console.log(`Toggling NLP setting ${setting} from ${nlpSettings[setting]} to ${newValue}`)
    
    setNlpSettings(prev => ({
      ...prev,
      [setting]: newValue
    }))
    
    try {
      settingsStore.saveSetting('nlpSettings', setting, newValue, 'boolean', 'user')
      console.log(`Successfully saved NLP setting ${setting} = ${newValue}`)
      showSaveStatus()
    } catch (error) {
      console.error(`Failed to save NLP setting ${setting}:`, error)
      setSaveStatus('error')
    }
  }

  const handleNlpChange = (setting, value) => {
    console.log(`Changing NLP setting ${setting} to ${value}`)
    
    setNlpSettings(prev => ({
      ...prev,
      [setting]: value
    }))
    
    try {
      settingsStore.saveSetting('nlpSettings', setting, value, typeof value === 'number' ? 'number' : 'string', 'user')
      console.log(`Successfully saved NLP setting ${setting} = ${value}`)
      showSaveStatus()
    } catch (error) {
      console.error(`Failed to save NLP setting ${setting}:`, error)
      setSaveStatus('error')
    }
  }

  const handleNotificationToggle = (setting) => {
    const newValue = !notificationSettings[setting]
    console.log(`Toggling notification setting ${setting} from ${notificationSettings[setting]} to ${newValue}`)
    
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: newValue
    }))
    
    try {
      settingsStore.saveSetting('notificationSettings', setting, newValue, 'boolean', 'user')
      console.log(`Successfully saved notification setting ${setting} = ${newValue}`)
      showSaveStatus()
    } catch (error) {
      console.error(`Failed to save notification setting ${setting}:`, error)
      setSaveStatus('error')
    }
  }

  // Rule Configuration Handlers
  const handleRuleConfigChange = (category, parameter, value) => {
    const actualValue = Array.isArray(value) ? value[0] : value
    console.log(`Changing rule config ${category}.${parameter} to ${actualValue}`)
    
    setRuleConfiguration(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: actualValue
      }
    }))
    
    try {
      settingsStore.saveSetting(category, parameter, actualValue, 'number', 'user')
      console.log(`Successfully saved rule config ${category}.${parameter} = ${actualValue}`)
      showSaveStatus()
    } catch (error) {
      console.error(`Failed to save rule config ${category}.${parameter}:`, error)
      setSaveStatus('error')
    }
  }

  const handleRuleToggle = (category, parameter) => {
    const oldValue = ruleConfiguration[category][parameter]
    const newValue = !oldValue
    console.log(`Toggling rule config ${category}.${parameter} from ${oldValue} to ${newValue}`)
    
    setRuleConfiguration(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: newValue
      }
    }))
    
    try {
      settingsStore.saveSetting(category, parameter, newValue, 'boolean', 'user')
      console.log(`Successfully saved rule config ${category}.${parameter} = ${newValue}`)
      showSaveStatus()
    } catch (error) {
      console.error(`Failed to save rule config ${category}.${parameter}:`, error)
      setSaveStatus('error')
    }
  }

  // Custom Rules Handlers
  const handleAddRule = () => {
    if (newRule.name.trim() && newRule.description.trim()) {
      const rule = {
        id: `RULE-${String(customRules.length + 6).padStart(3, '0')}`,
        ...newRule,
        createdBy: 'user@flydubai.com',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      }
      setCustomRules(prev => [...prev, rule])
      setNewRule({
        name: '',
        description: '',
        category: 'Operational',
        type: 'Soft',
        overridable: true,
        priority: 3,
        conditions: '',
        actions: ''
      })
      setShowAddRuleForm(false)
    }
  }

  const handleEditRule = (rule) => {
    setEditingRule(rule)
    setNewRule(rule)
    setShowAddRuleForm(true)
  }

  const handleUpdateRule = () => {
    if (editingRule && newRule.name.trim() && newRule.description.trim()) {
      setCustomRules(prev => prev.map(rule => 
        rule.id === editingRule.id ? { ...rule, ...newRule } : rule
      ))
      setEditingRule(null)
      setNewRule({
        name: '',
        description: '',
        category: 'Operational',
        type: 'Soft',
        overridable: true,
        priority: 3,
        conditions: '',
        actions: ''
      })
      setShowAddRuleForm(false)
    }
  }

  const handleDeleteRule = (ruleId) => {
    setCustomRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const handleToggleRuleStatus = (ruleId) => {
    setCustomRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'Active' ? 'Inactive' : 'Active' }
        : rule
    ))
  }

  const handleMovePriority = (ruleId, direction) => {
    setCustomRules(prev => {
      const ruleIndex = prev.findIndex(rule => rule.id === ruleId)
      if (ruleIndex === -1) return prev
      
      const newRules = [...prev]
      const rule = newRules[ruleIndex]
      
      if (direction === 'up' && rule.priority > 1) {
        // Find rule with priority - 1 and swap
        const targetRule = newRules.find(r => r.priority === rule.priority - 1)
        if (targetRule) {
          targetRule.priority = rule.priority
          rule.priority = rule.priority - 1
        }
      } else if (direction === 'down') {
        // Find rule with priority + 1 and swap
        const targetRule = newRules.find(r => r.priority === rule.priority + 1)
        if (targetRule) {
          targetRule.priority = rule.priority
          rule.priority = rule.priority + 1
        }
      }
      
      return newRules.sort((a, b) => a.priority - b.priority)
    })
  }

  // Recovery Configuration Handlers
  const handleRecoveryConfigChange = (section, parameter, value) => {
    const actualValue = value[0] // Slider returns array
    console.log(`Changing recovery config ${section}.${parameter} to ${actualValue}`)
    
    setRecoveryConfiguration(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parameter]: actualValue
      }
    }))
    
    try {
      settingsStore.saveSetting(section, parameter, actualValue, 'number', 'user')
      console.log(`Successfully saved recovery config ${section}.${parameter} = ${actualValue}`)
      showSaveStatus()
    } catch (error) {
      console.error(`Failed to save recovery config ${section}.${parameter}:`, error)
      setSaveStatus('error')
    }
  }

  // Passenger Priority Configuration Handlers
  const handlePriorityConfigChange = (category, parameter, value) => {
    const actualValue = value[0] // Slider returns array
    console.log(`Changing priority config ${category}.${parameter} to ${actualValue}`)
    
    setPassengerPriorityConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: actualValue
      }
    }))
    
    try {
      settingsStore.saveSetting(category, parameter, actualValue, 'number', 'user')
      console.log(`Successfully saved priority config ${category}.${parameter} = ${actualValue}`)
      showSaveStatus()
    } catch (error) {
      console.error(`Failed to save priority config ${category}.${parameter}:`, error)
      setSaveStatus('error')
    }
  }

  const handleAddCustomParameter = () => {
    if (newParameter.name.trim()) {
      const parameter = {
        id: `custom_${Date.now()}`,
        ...newParameter,
        isCustom: true
      }
      
      // Add to the appropriate category
      setRecoveryConfiguration(prev => ({
        ...prev,
        [newParameter.category]: {
          ...prev[newParameter.category],
          customParameters: [...prev[newParameter.category].customParameters, parameter]
        }
      }))
      
      setCustomParameters(prev => [...prev, parameter])
      setNewParameter({
        name: '',
        category: 'recoveryOptionsRanking',
        weight: 10,
        description: ''
      })
    }
  }

  const handleRemoveCustomParameter = (id, category) => {
    setRecoveryConfiguration(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        customParameters: prev[category].customParameters.filter(p => p.id !== id)
      }
    }))
    setCustomParameters(prev => prev.filter(p => p.id !== id))
  }

  const showSaveStatus = () => {
    setSaveStatus('saving')
    // Add slight delay to show saving status
    setTimeout(() => {
      setSaveStatus('saved')
      // Verify the setting was actually saved by checking database
      try {
        const allSettings = settingsStore.getAllSettings()
        console.log('Current database contains', allSettings.length, 'settings')
      } catch (error) {
        console.error('Database verification failed:', error)
        setSaveStatus('error')
      }
    }, 300)
    
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  const handleSaveAllSettings = async () => {
    setSaveStatus('saving')
    try {
      // Save all current settings to database
      Object.entries(nlpSettings).forEach(([key, value]) => {
        settingsStore.saveSetting('nlpSettings', key, value, typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string')
      })

      Object.entries(notificationSettings).forEach(([key, value]) => {
        settingsStore.saveSetting('notificationSettings', key, value, 'boolean')
      })

      // Save rule configuration
      Object.entries(ruleConfiguration).forEach(([category, settings]) => {
        Object.entries(settings).forEach(([key, value]) => {
          settingsStore.saveSetting(category, key, value, typeof value === 'boolean' ? 'boolean' : 'number')
        })
      })

      // Save recovery configuration
      Object.entries(recoveryConfiguration).forEach(([category, settings]) => {
        if (typeof settings === 'object' && settings !== null && !Array.isArray(settings)) {
          Object.entries(settings).forEach(([key, value]) => {
            if (key !== 'customParameters') {
              settingsStore.saveSetting(category, key, value, 'number')
            }
          })
        }
      })

      // Save passenger priority configuration
      Object.entries(passengerPriorityConfig).forEach(([category, settings]) => {
        Object.entries(settings).forEach(([key, value]) => {
          settingsStore.saveSetting(category, key, value, 'number')
        })
      })

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleResetAllSettings = () => {
    settingsStore.resetToDefaults()
    loadSettingsFromDatabase()
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
    
    // Reset all configurations to defaults
    setRuleConfiguration({
      operationalRules: {
        maxDelayThreshold: 180,
        minConnectionTime: 45,
        maxOverbooking: 105,
        priorityRebookingTime: 15,
        hotacTriggerDelay: 240
      },
      recoveryConstraints: {
        maxAircraftSwaps: 3,
        crewDutyTimeLimits: true,
        maintenanceSlotProtection: true,
        slotCoordinationRequired: false,
        curfewCompliance: true
      },
      automationSettings: {
        autoApproveThreshold: 95,
        requireManagerApproval: false,
        enablePredictiveActions: true,
        autoNotifyPassengers: true,
        autoBookHotac: false
      }
    })

    setRecoveryConfiguration({
      recoveryOptionsRanking: {
        costWeight: 30,
        timeWeight: 25,
        passengerImpactWeight: 20,
        operationalComplexityWeight: 15,
        reputationWeight: 10,
        customParameters: []
      },
      aircraftSelectionCriteria: {
        maintenanceStatus: 25,
        fuelEfficiency: 20,
        routeSuitability: 20,
        passengerCapacity: 15,
        availabilityWindow: 20,
        customParameters: []
      },
      crewAssignmentCriteria: {
        dutyTimeRemaining: 30,
        qualifications: 25,
        baseLocation: 20,
        restRequirements: 15,
        languageSkills: 10,
        customParameters: []
      }
    })

    setPassengerPriorityConfig({
      passengerPrioritization: {
        loyaltyTier: 25,
        ticketClass: 20,
        specialNeeds: 30,
        groupSize: 15,
        connectionRisk: 10
      },
      flightPrioritization: {
        airlinePreference: 20,
        onTimePerformance: 25,
        aircraftType: 15,
        departureTime: 20,
        connectionBuffer: 20
      },
      flightScoring: {
        baseScore: 70,
        priorityBonus: 15,
        airlineBonus: 10,
        specialReqBonus: 8,
        loyaltyBonus: 8,
        groupBonus: 5
      },
      passengerScoring: {
        vipWeight: 40,
        loyaltyWeight: 25,
        specialNeedsWeight: 20,
        revenueWeight: 15
      }
    })

    setCustomParameters([])
  }

  const calculateTotalWeight = (category, section = null) => {
    let baseWeights = 0
    let customWeights = 0

    if (section) {
      // For recovery configuration sections
      const data = recoveryConfiguration[section]
      if (data) {
        const baseParams = Object.keys(data).filter(key => key !== 'customParameters')
        baseWeights = baseParams.reduce((sum, key) => sum + (data[key] || 0), 0)
        customWeights = data.customParameters?.reduce((sum, p) => sum + p.weight, 0) || 0
      }
    } else {
      // For passenger priority configuration
      const baseParams = Object.values(passengerPriorityConfig[category] || {})
      baseWeights = baseParams.reduce((sum, val) => sum + val, 0)
      customWeights = customParameters
        .filter(p => p.category === category)
        .reduce((sum, p) => sum + p.weight, 0)
    }

    return baseWeights + customWeights
  }

  const getWeightColor = (weight) => {
    if (weight >= 25) return 'text-red-600'
    if (weight >= 15) return 'text-orange-600'
    if (weight >= 10) return 'text-blue-600'
    return 'text-gray-600'
  }

  const getParameterIcon = (param) => {
    const icons = {
      // Recovery Options
      costWeight: DollarSign,
      timeWeight: Clock,
      passengerImpactWeight: Users,
      operationalComplexityWeight: Settings2,
      reputationWeight: Star,
      
      // Aircraft Selection
      maintenanceStatus: Wrench,
      fuelEfficiency: Fuel,
      routeSuitability: Route,
      passengerCapacity: Users2,
      availabilityWindow: Calendar,
      
      // Crew Assignment
      dutyTimeRemaining: Clock,
      qualifications: Award,
      baseLocation: MapPin,
      restRequirements: Coffee,
      languageSkills: Globe,
      
      // Passenger Priority
      loyaltyTier: Crown,
      ticketClass: Star,
      specialNeeds: Shield,
      groupSize: Users,
      connectionRisk: Clock,
      airlinePreference: Plane,
      onTimePerformance: Target,
      aircraftType: Settings2,
      departureTime: Clock,
      connectionBuffer: Route,
      baseScore: Gauge,
      priorityBonus: Award,
      airlineBonus: Plane,
      specialReqBonus: Shield,
      loyaltyBonus: Crown,
      groupBonus: Users,
      vipWeight: Crown,
      loyaltyWeight: Star,
      specialNeedsWeight: Shield,
      revenueWeight: DollarSign
    }
    return icons[param] || Settings
  }

  const getRuleTypeColor = (type) => {
    return type === 'Hard' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getRuleStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRuleCategoryIcon = (category) => {
    const icons = {
      Weather: CloudRain,
      'Passenger Service': Users,
      'Crew Management': Users2,
      Financial: DollarSign,
      Maintenance: Wrench,
      Operational: Settings2,
      Safety: Shield,
      Security: Lock
    }
    return icons[category] || FileText
  }

  const categories = {
    main: { name: 'Main', color: 'text-flydubai-blue' },
    operations: { name: 'Operations', color: 'text-flydubai-blue' },
    prediction: { name: 'Prediction', color: 'text-flydubai-navy' },
    monitoring: { name: 'Monitoring', color: 'text-flydubai-navy' },
    services: { name: 'Services', color: 'text-flydubai-blue' },
    analytics: { name: 'Analytics', color: 'text-flydubai-navy' },
    system: { name: 'System', color: 'text-gray-600' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner-flydubai mx-auto mb-4"></div>
          <p className="text-flydubai-blue">Loading Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">AERON Settings</h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Configure system preferences and operational parameters</p>
            <Badge 
              variant="outline" 
              className={`text-xs ${isDatabaseConnected 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${isDatabaseConnected ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              {isDatabaseConnected ? 'PostgreSQL Connected' : 'Using LocalStorage'}
              {!isDatabaseConnected && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const reconnected = await settingsStore.retryDatabaseConnection()
                    setIsDatabaseConnected(reconnected)
                    if (reconnected) {
                      loadSettingsFromDatabase()
                    }
                  }}
                  className="ml-2 h-4 w-4 p-0"
                  title="Retry database connection"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </Badge>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-flydubai-blue">
                <div className="spinner-flydubai"></div>
                Loading...
              </div>
            )}
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="spinner-flydubai"></div>
                Saving...
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Saved to Database
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                Database Error
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetAllSettings} className="border-orange-300 text-orange-700 hover:bg-orange-50" disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={handleSaveAllSettings} className="btn-flydubai-primary" disabled={isLoading || saveStatus === 'saving'}>
            <Save className="h-4 w-4 mr-2" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="screens">Screen Settings</TabsTrigger>
          <TabsTrigger value="passenger-priority">Passenger Priority</TabsTrigger>
          <TabsTrigger value="rules">Rule Configuration</TabsTrigger>
          <TabsTrigger value="recovery-options">Recovery Options</TabsTrigger>
          <TabsTrigger value="nlp">Natural Language</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Screen Settings */}
        <TabsContent value="screens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-flydubai-blue" />
                Screen Visibility Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control which screens are available in the AERON interface. Required screens cannot be disabled.
              </p>
            </CardHeader>
            <CardContent>
              {Object.entries(categories).map(([categoryKey, category]) => {
                const categoryScreens = screenSettings.filter(screen => screen.category === categoryKey)
                
                if (categoryScreens.length === 0) return null
                
                return (
                  <div key={categoryKey} className="mb-6">
                    <h3 className={`text-sm font-semibold mb-3 ${category.color}`}>
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryScreens.map((screen) => {
                        const Icon = screen.icon
                        return (
                          <div key={screen.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{screen.name}</p>
                                {screen.required && (
                                  <Badge variant="outline" className="text-xs">Required</Badge>
                                )}
                              </div>
                            </div>
                            <Switch
                              checked={screen.enabled}
                              onCheckedChange={() => handleScreenToggle(screen.id)}
                              disabled={screen.required}
                              className="switch-flydubai"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passenger Priority Configuration */}
        <TabsContent value="passenger-priority" className="space-y-6">
          {/* Overview Card */}
          <Card className="border-flydubai-blue bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-blue">
                <UserCheck className="h-5 w-5" />
                Passenger Priority Configuration
              </CardTitle>
              <p className="text-sm text-blue-700">
                Configure how passengers are prioritized and how flights are scored for different passenger types.
                These settings directly impact the rebooking algorithms and recovery decision-making.
              </p>
            </CardHeader>
            <CardContent>
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Configuration Impact:</strong> Changes to these settings will affect all future passenger rebooking operations and flight recommendations.
                  Current active bookings will continue using existing parameters.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Passenger Prioritization Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Users className="h-5 w-5" />
                  Passenger Prioritization Criteria
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure weightage for determining passenger priority order during disruptions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(passengerPriorityConfig.passengerPrioritization).map(([key, value]) => {
                  const Icon = getParameterIcon(key)
                  const labels = {
                    loyaltyTier: 'Loyalty Tier Status',
                    ticketClass: 'Ticket Class (Business/Economy)',
                    specialNeeds: 'Special Requirements',
                    groupSize: 'Family/Group Bookings',
                    connectionRisk: 'Missed Connection Risk'
                  }
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{labels[key]}</Label>
                        </div>
                        <Badge className={`${getWeightColor(value)} bg-transparent border`}>
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) => handlePriorityConfigChange('passengerPrioritization', key, newValue)}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full slider-flydubai"
                      />
                    </div>
                  )
                })}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">Total Weight:</span>
                    <Badge className={calculateTotalWeight('passengerPrioritization') === 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {calculateTotalWeight('passengerPrioritization')}%
                    </Badge>
                  </div>
                  {calculateTotalWeight('passengerPrioritization') !== 100 && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Recommended total: 100%. Current deviation may affect prioritization accuracy.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Flight Prioritization for Passengers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Plane className="h-5 w-5" />
                  Flight Prioritization for Passengers
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how flights are ranked and recommended to different passenger types.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(passengerPriorityConfig.flightPrioritization).map(([key, value]) => {
                  const Icon = getParameterIcon(key)
                  const labels = {
                    airlinePreference: 'Airline Preference (flydubai)',
                    onTimePerformance: 'On-Time Performance History',
                    aircraftType: 'Aircraft Type & Amenities',
                    departureTime: 'Preferred Departure Times',
                    connectionBuffer: 'Connection Buffer Time'
                  }
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{labels[key]}</Label>
                        </div>
                        <Badge className={`${getWeightColor(value)} bg-transparent border`}>
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) => handlePriorityConfigChange('flightPrioritization', key, newValue)}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full slider-flydubai"
                      />
                    </div>
                  )
                })}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">Total Weight:</span>
                    <Badge className={calculateTotalWeight('flightPrioritization') === 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {calculateTotalWeight('flightPrioritization')}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flight Scoring Algorithm */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Calculator className="h-5 w-5" />
                  Flight Scoring Algorithm
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure base scores and bonus points for flight suitability calculations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(passengerPriorityConfig.flightScoring).map(([key, value]) => {
                  const Icon = getParameterIcon(key)
                  const labels = {
                    baseScore: 'Base Score (Starting Point)',
                    priorityBonus: 'VIP/Premium Passenger Bonus',
                    airlineBonus: 'flydubai Flight Bonus',
                    specialReqBonus: 'Special Requirements Bonus',
                    loyaltyBonus: 'Loyalty Tier Bonus',
                    groupBonus: 'Group Booking Bonus'
                  }
                  
                  const maxValue = key === 'baseScore' ? 100 : 20
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{labels[key]}</Label>
                        </div>
                        <Badge className={`${getWeightColor(value)} bg-transparent border`}>
                          {key === 'baseScore' ? value : `+${value}`}
                        </Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) => handlePriorityConfigChange('flightScoring', key, newValue)}
                        max={maxValue}
                        min={key === 'baseScore' ? 50 : 0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )
                })}

                <Alert className="border-blue-200 bg-blue-50">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs">
                    <strong>Scoring Example:</strong> VIP passenger on flydubai flight = {passengerPriorityConfig.flightScoring.baseScore} (base) + {passengerPriorityConfig.flightScoring.priorityBonus} (VIP) + {passengerPriorityConfig.flightScoring.airlineBonus} (flydubai) = {passengerPriorityConfig.flightScoring.baseScore + passengerPriorityConfig.flightScoring.priorityBonus + passengerPriorityConfig.flightScoring.airlineBonus}% match
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Passenger Scoring Algorithm */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Activity className="h-5 w-5" />
                  Passenger Scoring Algorithm
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure weightage for overall passenger importance scoring during recovery operations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(passengerPriorityConfig.passengerScoring).map(([key, value]) => {
                  const Icon = getParameterIcon(key)
                  const labels = {
                    vipWeight: 'VIP Status Impact',
                    loyaltyWeight: 'Loyalty Program Tier',
                    specialNeedsWeight: 'Special Assistance Requirements',
                    revenueWeight: 'Ticket Revenue/Class Value'
                  }
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{labels[key]}</Label>
                        </div>
                        <Badge className={`${getWeightColor(value)} bg-transparent border`}>
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) => handlePriorityConfigChange('passengerScoring', key, newValue)}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )
                })}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">Total Weight:</span>
                    <Badge className={calculateTotalWeight('passengerScoring') === 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {calculateTotalWeight('passengerScoring')}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Rule Configuration */}
        <TabsContent value="rules" className="space-y-6">
          <Card className="border-flydubai-blue bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-blue">
                <FileText className="h-5 w-5" />
                Rule Configuration
              </CardTitle>
              <p className="text-sm text-blue-700">
                Configure operational rules, constraints, automation settings, and custom business rules that govern AERON's decision-making process.
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Settings2 className="h-5 w-5" />
                  Operational Rules
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define thresholds and limits for operational decisions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Max Delay Threshold (minutes)</Label>
                    <Badge className="bg-gray-100 text-gray-800">
                      {ruleConfiguration.operationalRules.maxDelayThreshold}
                    </Badge>
                  </div>
                  <Slider
                    value={[ruleConfiguration.operationalRules.maxDelayThreshold]}
                    onValueChange={(value) => handleRuleConfigChange('operationalRules', 'maxDelayThreshold', value)}
                    max={360}
                    min={60}
                    step={15}
                    className="w-full slider-flydubai"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Min Connection Time (minutes)</Label>
                    <Badge className="bg-gray-100 text-gray-800">
                      {ruleConfiguration.operationalRules.minConnectionTime}
                    </Badge>
                  </div>
                  <Slider
                    value={[ruleConfiguration.operationalRules.minConnectionTime]}
                    onValueChange={(value) => handleRuleConfigChange('operationalRules', 'minConnectionTime', value)}
                    max={120}
                    min={30}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Max Overbooking (%)</Label>
                    <Badge className="bg-gray-100 text-gray-800">
                      {ruleConfiguration.operationalRules.maxOverbooking}%
                    </Badge>
                  </div>
                  <Slider
                    value={[ruleConfiguration.operationalRules.maxOverbooking]}
                    onValueChange={(value) => handleRuleConfigChange('operationalRules', 'maxOverbooking', value)}
                    max={120}
                    min={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Priority Rebooking Time (minutes)</Label>
                    <Badge className="bg-gray-100 text-gray-800">
                      {ruleConfiguration.operationalRules.priorityRebookingTime}
                    </Badge>
                  </div>
                  <Slider
                    value={[ruleConfiguration.operationalRules.priorityRebookingTime]}
                    onValueChange={(value) => handleRuleConfigChange('operationalRules', 'priorityRebookingTime', value)}
                    max={60}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">HOTAC Trigger Delay (minutes)</Label>
                    <Badge className="bg-gray-100 text-gray-800">
                      {ruleConfiguration.operationalRules.hotacTriggerDelay}
                    </Badge>
                  </div>
                  <Slider
                    value={[ruleConfiguration.operationalRules.hotacTriggerDelay]}
                    onValueChange={(value) => handleRuleConfigChange('operationalRules', 'hotacTriggerDelay', value)}
                    max={480}
                    min={120}
                    step={30}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recovery Constraints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Shield className="h-5 w-5" />
                  Recovery Constraints
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set constraints and safety limits for recovery operations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Max Aircraft Swaps</Label>
                    <Badge className="bg-gray-100 text-gray-800">
                      {ruleConfiguration.recoveryConstraints.maxAircraftSwaps}
                    </Badge>
                  </div>
                  <Slider
                    value={[ruleConfiguration.recoveryConstraints.maxAircraftSwaps]}
                    onValueChange={(value) => handleRuleConfigChange('recoveryConstraints', 'maxAircraftSwaps', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Crew Duty Time Limits</Label>
                  <Switch
                    checked={ruleConfiguration.recoveryConstraints.crewDutyTimeLimits}
                    onCheckedChange={() => handleRuleToggle('recoveryConstraints', 'crewDutyTimeLimits')}
                    className="switch-flydubai"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Maintenance Slot Protection</Label>
                  <Switch
                    checked={ruleConfiguration.recoveryConstraints.maintenanceSlotProtection}
                    onCheckedChange={() => handleRuleToggle('recoveryConstraints', 'maintenanceSlotProtection')}
                    className="switch-flydubai"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Slot Coordination Required</Label>
                  <Switch
                    checked={ruleConfiguration.recoveryConstraints.slotCoordinationRequired}
                    onCheckedChange={() => handleRuleToggle('recoveryConstraints', 'slotCoordinationRequired')}
                    className="switch-flydubai"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Curfew Compliance</Label>
                  <Switch
                    checked={ruleConfiguration.recoveryConstraints.curfewCompliance}
                    onCheckedChange={() => handleRuleToggle('recoveryConstraints', 'curfewCompliance')}
                    className="switch-flydubai"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Automation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Zap className="h-5 w-5" />
                  Automation Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure automation behavior and approval thresholds.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Auto-Approve Threshold (%)</Label>
                    <Badge className="bg-gray-100 text-gray-800">
                      {ruleConfiguration.automationSettings.autoApproveThreshold}%
                    </Badge>
                  </div>
                  <Slider
                    value={[ruleConfiguration.automationSettings.autoApproveThreshold]}
                    onValueChange={(value) => handleRuleConfigChange('automationSettings', 'autoApproveThreshold', value)}
                    max={100}
                    min={80}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Require Manager Approval</Label>
                  <Switch
                    checked={ruleConfiguration.automationSettings.requireManagerApproval}
                    onCheckedChange={() => handleRuleToggle('automationSettings', 'requireManagerApproval')}
                    className="switch-flydubai"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Enable Predictive Actions</Label>
                  <Switch
                    checked={ruleConfiguration.automationSettings.enablePredictiveActions}
                    onCheckedChange={() => handleRuleToggle('automationSettings', 'enablePredictiveActions')}
                    className="switch-flydubai"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Auto-Notify Passengers</Label>
                  <Switch
                    checked={ruleConfiguration.automationSettings.autoNotifyPassengers}
                    onCheckedChange={() => handleRuleToggle('automationSettings', 'autoNotifyPassengers')}
                    className="switch-flydubai"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Auto-Book HOTAC</Label>
                  <Switch
                    checked={ruleConfiguration.automationSettings.autoBookHotac}
                    onCheckedChange={() => handleRuleToggle('automationSettings', 'autoBookHotac')}
                    className="switch-flydubai"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Rules Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                    <GitBranch className="h-5 w-5" />
                    Custom Business Rules
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage custom operational rules with hard/soft classification and override permissions.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowAddRuleForm(true)}
                  className="btn-flydubai-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Rule Form */}
              {showAddRuleForm && (
                <Card className="mb-6 border-dashed border-2 border-gray-300">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {editingRule ? 'Edit Rule' : 'Create New Rule'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          placeholder="e.g., Emergency Weather Protocol"
                          value={newRule.name}
                          onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="rule-category">Category</Label>
                        <Select 
                          value={newRule.category} 
                          onValueChange={(value) => setNewRule(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Operational">Operational</SelectItem>
                            <SelectItem value="Weather">Weather</SelectItem>
                            <SelectItem value="Passenger Service">Passenger Service</SelectItem>
                            <SelectItem value="Crew Management">Crew Management</SelectItem>
                            <SelectItem value="Financial">Financial</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Safety">Safety</SelectItem>
                            <SelectItem value="Security">Security</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule-type">Rule Type</Label>
                        <Select 
                          value={newRule.type} 
                          onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hard">Hard Rule (Must be followed)</SelectItem>
                            <SelectItem value="Soft">Soft Rule (Guideline)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule-priority">Priority Level</Label>
                        <Select 
                          value={newRule.priority.toString()} 
                          onValueChange={(value) => setNewRule(prev => ({ ...prev, priority: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Critical</SelectItem>
                            <SelectItem value="2">2 - High</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rule-description">Description</Label>
                      <Textarea
                        id="rule-description"
                        placeholder="Describe what this rule does and when it applies..."
                        value={newRule.description}
                        onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-conditions">Conditions (When)</Label>
                        <Textarea
                          id="rule-conditions"
                          placeholder="e.g., Weather.Severity > High AND Delay > 180 minutes"
                          value={newRule.conditions}
                          onChange={(e) => setNewRule(prev => ({ ...prev, conditions: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule-actions">Actions (Then)</Label>
                        <Textarea
                          id="rule-actions"
                          placeholder="e.g., Trigger HOTAC booking, Send passenger notifications"
                          value={newRule.actions}
                          onChange={(e) => setNewRule(prev => ({ ...prev, actions: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Allow Override</Label>
                        <p className="text-xs text-gray-600">
                          Can this rule be overridden by operators with appropriate permissions?
                        </p>
                      </div>
                      <Switch
                        checked={newRule.overridable}
                        onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, overridable: checked }))}
                        className="switch-flydubai"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddRuleForm(false)
                          setEditingRule(null)
                          setNewRule({
                            name: '',
                            description: '',
                            category: 'Operational',
                            type: 'Soft',
                            overridable: true,
                            priority: 3,
                            conditions: '',
                            actions: ''
                          })
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={editingRule ? handleUpdateRule : handleAddRule}
                        disabled={!newRule.name.trim() || !newRule.description.trim()}
                        className="btn-flydubai-primary"
                      >
                        {editingRule ? 'Update Rule' : 'Create Rule'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rules Table */}
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Override</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customRules
                      .sort((a, b) => a.priority - b.priority)
                      .map((rule) => {
                        const CategoryIcon = getRuleCategoryIcon(rule.category)
                        return (
                          <TableRow key={rule.id} className="hover:bg-blue-50">
                            <TableCell>
                              <div className="flex items-start gap-3">
                                <CategoryIcon className="h-4 w-4 text-flydubai-blue mt-1 flex-shrink-0" />
                                <div>
                                  <div className="font-medium">{rule.name}</div>
                                  <div className="text-sm text-gray-600 max-w-md">
                                    {rule.description}
                                  </div>
                                  {rule.conditions && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      <strong>When:</strong> {rule.conditions}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {rule.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRuleTypeColor(rule.type)}>
                                <div className="flex items-center gap-1">
                                  {rule.type === 'Hard' ? (
                                    <Lock className="h-3 w-3" />
                                  ) : (
                                    <Unlock className="h-3 w-3" />
                                  )}
                                  {rule.type}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={
                                    rule.priority === 1 ? 'priority-critical' :
                                    rule.priority === 2 ? 'priority-high' :
                                    rule.priority === 3 ? 'priority-medium' : 'priority-low'
                                  }
                                >
                                  P{rule.priority}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMovePriority(rule.id, 'up')}
                                    disabled={rule.priority === 1}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMovePriority(rule.id, 'down')}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {rule.overridable ? (
                                  <CheckSquare className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm">
                                  {rule.overridable ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRuleStatusColor(rule.status)}>
                                {rule.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleRuleStatus(rule.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  {rule.status === 'Active' ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <EyeOff className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditRule(rule)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>

                {customRules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No custom rules configured</p>
                    <p className="text-sm">Click "Add Rule" to create your first custom business rule</p>
                  </div>
                )}
              </div>

              {/* Rule Statistics */}
              {customRules.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-flydubai-blue">
                      {customRules.filter(r => r.status === 'Active').length}
                    </div>
                    <div className="text-xs text-gray-600">Active Rules</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {customRules.filter(r => r.type === 'Hard').length}
                    </div>
                    <div className="text-xs text-gray-600">Hard Rules</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {customRules.filter(r => r.type === 'Soft').length}
                    </div>
                    <div className="text-xs text-gray-600">Soft Rules</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {customRules.filter(r => r.overridable).length}
                    </div>
                    <div className="text-xs text-gray-600">Overridable</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consolidated Recovery Options */}
        <TabsContent value="recovery-options" className="space-y-6">
          <Card className="border-flydubai-blue bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-blue">
                <BarChart3 className="h-5 w-5" />
                Recovery Operations Configuration
              </CardTitle>
              <p className="text-sm text-blue-700">
                Configure weightage criteria for recovery options ranking, aircraft selection, and crew assignment during disruptions.
                These settings work together to optimize recovery decision-making.
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recovery Options Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <BarChart3 className="h-5 w-5" />
                  Recovery Options Ranking
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the importance of different factors when evaluating recovery options.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(recoveryConfiguration.recoveryOptionsRanking).filter(([key]) => key !== 'customParameters').map(([key, value]) => {
                  const Icon = getParameterIcon(key)
                  const labels = {
                    costWeight: 'Cost Impact',
                    timeWeight: 'Time to Resolution',
                    passengerImpactWeight: 'Passenger Impact',
                    operationalComplexityWeight: 'Operational Complexity',
                    reputationWeight: 'Brand Reputation Impact'
                  }
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{labels[key]}</Label>
                        </div>
                        <Badge className={`${getWeightColor(value)} bg-transparent border`}>
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) => handleRecoveryConfigChange('recoveryOptionsRanking', key, newValue)}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )
                })}

                {/* Custom Parameters */}
                {recoveryConfiguration.recoveryOptionsRanking.customParameters.map((param) => (
                  <div key={param.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <Label className="text-sm font-medium">{param.name}</Label>
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getWeightColor(param.weight)} bg-transparent border`}>
                          {param.weight}%
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCustomParameter(param.id, 'recoveryOptionsRanking')}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{param.description}</p>
                  </div>
                ))}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">Total Weight:</span>
                    <Badge className={calculateTotalWeight(null, 'recoveryOptionsRanking') === 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {calculateTotalWeight(null, 'recoveryOptionsRanking')}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aircraft Selection Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Plane className="h-5 w-5" />
                  Aircraft Selection Criteria
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the importance of different factors when selecting aircraft for recovery.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(recoveryConfiguration.aircraftSelectionCriteria).filter(([key]) => key !== 'customParameters').map(([key, value]) => {
                  const Icon = getParameterIcon(key)
                  const labels = {
                    maintenanceStatus: 'Maintenance Status',
                    fuelEfficiency: 'Fuel Efficiency',
                    routeSuitability: 'Route Suitability',
                    passengerCapacity: 'Passenger Capacity',
                    availabilityWindow: 'Availability Window'
                  }
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{labels[key]}</Label>
                        </div>
                        <Badge className={`${getWeightColor(value)} bg-transparent border`}>
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) => handleRecoveryConfigChange('aircraftSelectionCriteria', key, newValue)}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )
                })}

                {/* Custom Parameters */}
                {recoveryConfiguration.aircraftSelectionCriteria.customParameters.map((param) => (
                  <div key={param.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <Label className="text-sm font-medium">{param.name}</Label>
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getWeightColor(param.weight)} bg-transparent border`}>
                          {param.weight}%
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCustomParameter(param.id, 'aircraftSelectionCriteria')}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{param.description}</p>
                  </div>
                ))}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">Total Weight:</span>
                    <Badge className={calculateTotalWeight(null, 'aircraftSelectionCriteria') === 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {calculateTotalWeight(null, 'aircraftSelectionCriteria')}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crew Assignment Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Users2 className="h-5 w-5" />
                  Crew Assignment Criteria
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the importance of different factors when assigning crew for recovery flights.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(recoveryConfiguration.crewAssignmentCriteria).filter(([key]) => key !== 'customParameters').map(([key, value]) => {
                  const Icon = getParameterIcon(key)
                  const labels = {
                    dutyTimeRemaining: 'Duty Time Remaining',
                    qualifications: 'Qualifications & Certifications',
                    baseLocation: 'Base Location',
                    restRequirements: 'Rest Requirements',
                    languageSkills: 'Language Skills'
                  }
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{labels[key]}</Label>
                        </div>
                        <Badge className={`${getWeightColor(value)} bg-transparent border`}>
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) => handleRecoveryConfigChange('crewAssignmentCriteria', key, newValue)}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )
                })}

                {/* Custom Parameters */}
                {recoveryConfiguration.crewAssignmentCriteria.customParameters.map((param) => (
                  <div key={param.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <Label className="text-sm font-medium">{param.name}</Label>
                        <Badge variant="outline" className="text-xs">Custom</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getWeightColor(param.weight)} bg-transparent border`}>
                          {param.weight}%
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCustomParameter(param.id, 'crewAssignmentCriteria')}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{param.description}</p>
                  </div>
                ))}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">Total Weight:</span>
                    <Badge className={calculateTotalWeight(null, 'crewAssignmentCriteria') === 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {calculateTotalWeight(null, 'crewAssignmentCriteria')}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Custom Parameter Section */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Plus className="h-5 w-5" />
                Add Custom Parameter
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create custom parameters for recovery options, aircraft selection, or crew assignment.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="param-name">Parameter Name</Label>
                  <Input
                    id="param-name"
                    placeholder="e.g., 'Weather Risk Factor'"
                    value={newParameter.name}
                    onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="param-category">Category</Label>
                  <Select 
                    value={newParameter.category} 
                    onValueChange={(value) => setNewParameter(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recoveryOptionsRanking">Recovery Options Ranking</SelectItem>
                      <SelectItem value="aircraftSelectionCriteria">Aircraft Selection Criteria</SelectItem>
                      <SelectItem value="crewAssignmentCriteria">Crew Assignment Criteria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="param-weight">Weight</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[newParameter.weight]}
                      onValueChange={(value) => setNewParameter(prev => ({ ...prev, weight: value[0] }))}
                      max={50}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <Badge className="bg-gray-100 text-gray-800 min-w-[50px]">
                      {newParameter.weight}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="param-description">Description</Label>
                  <Textarea
                    id="param-description"
                    placeholder="Describe how this parameter affects the selection process..."
                    value={newParameter.description}
                    onChange={(e) => setNewParameter(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleAddCustomParameter}
                  disabled={!newParameter.name.trim()}
                  className="btn-flydubai-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Configuration Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Recovery Configuration Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-green-800 mb-3">Recovery Options Priority</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cost Impact:</span>
                      <span className="font-medium">{recoveryConfiguration.recoveryOptionsRanking.costWeight}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time to Resolution:</span>
                      <span className="font-medium">{recoveryConfiguration.recoveryOptionsRanking.timeWeight}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passenger Impact:</span>
                      <span className="font-medium">{recoveryConfiguration.recoveryOptionsRanking.passengerImpactWeight}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-3">Aircraft Selection Priority</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Maintenance Status:</span>
                      <span className="font-medium">{recoveryConfiguration.aircraftSelectionCriteria.maintenanceStatus}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Efficiency:</span>
                      <span className="font-medium">{recoveryConfiguration.aircraftSelectionCriteria.fuelEfficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route Suitability:</span>
                      <span className="font-medium">{recoveryConfiguration.aircraftSelectionCriteria.routeSuitability}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-3">Crew Assignment Priority</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duty Time Remaining:</span>
                      <span className="font-medium">{recoveryConfiguration.crewAssignmentCriteria.dutyTimeRemaining}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Qualifications:</span>
                      <span className="font-medium">{recoveryConfiguration.crewAssignmentCriteria.qualifications}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Location:</span>
                      <span className="font-medium">{recoveryConfiguration.crewAssignmentCriteria.baseLocation}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Natural Language Processing */}
        <TabsContent value="nlp" className="space-y-6">
          {/* Natural Language & Knowledge Repository Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                <Brain className="h-5 w-5" />
                Natural Language & Knowledge Repository
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enhance AERON's decision-making capability by connecting natural language repository that features various daily recommendations, various documents and policies in the system to enable better context-aware recommendations.
              </p>
            </CardHeader>
          </Card>

          {/* Knowledge Impacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                <TrendingUp className="h-5 w-5" />
                Knowledge Impacts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust knowledge repository-impact accuracy and compliance recommendations accuracy and compliance.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Natural Language Processing Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-flydubai-navy">Natural Language Processing</h3>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Enable NLP</Label>
                      <p className="text-xs text-muted-foreground">Process natural language inputs</p>
                    </div>
                    <Switch
                      checked={nlpSettings.enabled}
                      onCheckedChange={() => handleNlpToggle('enabled')}
                      className="switch-flydubai"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Primary Language</Label>
                    <Select value={nlpSettings.language} onValueChange={(value) => handleNlpChange('language', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="arabic">العربية (Arabic)</SelectItem>
                        <SelectItem value="hindi">हिन्दी (Hindi)</SelectItem>
                        <SelectItem value="urdu">اردو (Urdu)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Confidence Threshold</Label>
                      <Badge className="bg-blue-100 text-blue-800">{nlpSettings.confidence}%</Badge>
                    </div>
                    <Slider
                      value={[nlpSettings.confidence]}
                      onValueChange={(value) => handleNlpChange('confidence', value[0])}
                      max={100}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">MIN: 50%</div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Auto-Apply Recommendations</Label>
                    <p className="text-xs text-muted-foreground">Automatically apply high-confidence results</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">OFF</span>
                      <Switch
                        checked={nlpSettings.autoApply}
                        onCheckedChange={() => handleNlpToggle('autoApply')}
                        className="switch-flydubai"
                      />
                      <span className="text-xs">ON</span>
                    </div>
                  </div>
                </div>

                {/* Repository Status */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-flydubai-navy">Repository Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Document Processing</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-20 h-2" />
                        <span className="text-xs text-gray-600">75%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Add Manual Entry</span>
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        Add Manual Entry
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Upload Documents</span>
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        Upload Documents  
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accuracy and Compliance Settings */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Accuracy Enhancement</Label>
                    <Badge className="bg-gray-100 text-gray-800">{nlpSettings.accuracyEnhancement}%</Badge>
                  </div>
                  <Slider
                    value={[nlpSettings.accuracyEnhancement]}
                    onValueChange={(value) => handleNlpChange('accuracyEnhancement', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full slider-flydubai"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Compliance Weighting</Label>
                    <Badge className="bg-gray-100 text-gray-800">{nlpSettings.complianceWeighting}%</Badge>
                  </div>
                  <Slider
                    value={[nlpSettings.complianceWeighting]}
                    onValueChange={(value) => handleNlpChange('complianceWeighting', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Repository */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                <FileText className="h-5 w-5" />
                Document Repository
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Organize documents and provide operational knowledge, operational procedures, and policies for recovery operations.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Document Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Flexible Operations Manual 2024.pdf</p>
                        <p className="text-xs text-gray-600">Operations • Emergency procedures and protocols</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 text-xs">Processed</Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">Emergency Response Procedures.docx</p>
                        <p className="text-xs text-gray-600">Emergency • Emergency response procedures and escalation protocols</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800 text-xs">Processing</Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">Weather Decision Guidelines.pdf</p>
                        <p className="text-xs text-gray-600">Weather • Weather-related decision making guidelines and protocols</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-800 text-xs">Pending</Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Knowledge Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                <Plus className="h-5 w-5" />
                Manual Knowledge Entry
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add custom operational knowledge that enhances recovery operations recommendations.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="knowledge-title">Title</Label>
                    <Input
                      id="knowledge-title"
                      placeholder="e.g., Special handling for Medical Emergencies"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="knowledge-category">Category</Label>
                    <Select defaultValue="operations">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="weather">Weather</SelectItem>
                        <SelectItem value="passenger">Passenger Service</SelectItem>
                        <SelectItem value="crew">Crew Management</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="knowledge-source">Source</Label>
                  <Textarea
                    id="knowledge-source"
                    placeholder="Provide the specific guidelines or decision criteria that should be considered during recovery operations..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="knowledge-tags">Tags</Label>
                  <Input
                    id="knowledge-tags"
                    placeholder="Add tags like: VIP, Medical, Emergency, Weather..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button className="btn-flydubai-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Natural Language Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                <MessageSquare className="h-5 w-5" />
                Test Natural Language Input
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test natural language inputs are processed using the current knowledge base and settings.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-input">Sample Natural Language Input</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Examples of suggested Inputs:
                  </p>
                  <Textarea
                    id="test-input"
                    placeholder="• Prioritize passengers with connecting flights to minimize missed connections
• Focus on cost-effective solutions that keep families together  
• Apply emergency protocols for medical passengers requiring immediate assistance"
                    rows={4}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Best Input</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Enter a natural language query for ML processing using current knowledge repository variables.
                  </p>
                  <Textarea
                    placeholder="e.g., 'Due to severe weather, prioritize VIP passengers and families with infants for immediate rebooking on the next available flydubai flight to minimize disruption and provide hotel accommodation if delays exceed 4 hours'"
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    Cancel  
                  </Button>
                  <Button className="btn-flydubai-primary">
                    <Settings className="h-4 w-4 mr-2" />
                    Process with Knowledge Repository
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-flydubai-blue" />
                Notification Preferences
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how and when you receive notifications from AERON.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-flydubai-navy">Notification Channels</h3>
                
                {Object.entries({
                  email: 'Email Notifications',
                  sms: 'SMS Alerts',
                  push: 'Push Notifications',
                  desktop: 'Desktop Notifications'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{label}</Label>
                    <Switch
                      checked={notificationSettings[key]}
                      onCheckedChange={() => handleNotificationToggle(key)}
                      className="switch-flydubai"
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-flydubai-navy">Notification Types</h3>
                
                {Object.entries({
                  recoveryAlerts: 'Recovery Plan Alerts',
                  passengerUpdates: 'Passenger Service Updates',
                  systemAlerts: 'System Status Alerts'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{label}</Label>
                    <Switch
                      checked={notificationSettings[key]}
                      onCheckedChange={() => handleNotificationToggle(key)}
                      className="switch-flydubai"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-flydubai-blue" />
                System Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                General system settings and preferences.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-flydubai-navy">Regional Settings</h3>
                  
                  <div>
                    <Label className="text-sm font-medium">Time Zone</Label>
                    <Select defaultValue="gulf-standard">
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gulf-standard">Gulf Standard Time (GST)</SelectItem>
                        <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                        <SelectItem value="local">Local System Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Currency Display</Label>
                    <Select defaultValue="aed">
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aed">AED (Dirham)</SelectItem>
                        <SelectItem value="usd">USD (US Dollar)</SelectItem>
                        <SelectItem value="eur">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-flydubai-navy">Performance Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">High Performance Mode</Label>
                      <p className="text-xs text-muted-foreground">Enhanced processing for critical operations</p>
                    </div>
                    <Switch 
                      checked={false}
                      className="switch-flydubai" 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-Save Settings</Label>
                      <p className="text-xs text-muted-foreground">Automatically save configuration changes</p>
                    </div>
                    <Switch 
                      checked={true}
                      className="switch-flydubai" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}