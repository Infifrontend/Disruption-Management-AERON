'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Progress } from './ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Info,
  Download,
  Eye,
  MapPin,
  Clock,
  Plane
} from 'lucide-react'
import { databaseService } from '../services/databaseService'

interface ComparisonMatrixProps {
  selectedFlight: any;
  recoveryOptions?: any[];
  scenarioData?: any;
  onSelectPlan: (plan: any) => void;
}

export function ComparisonMatrix({ selectedFlight, recoveryOptions = [], scenarioData = null, onSelectPlan }) {
  const [comparisonOptions, setComparisonOptions] = useState([])
  const [loading, setLoading] = useState(!selectedFlight)
  const [error, setError] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState(new Set())
  const [showDetailedPlan, setShowDetailedPlan] = useState(false)
  const [detailPlanData, setDetailPlanData] = useState(null)
  const [sortBy, setSortBy] = useState('cost')
  const [showViewRecoveryPopup, setShowViewRecoveryPopup] = useState(false)
  const [showRotationPlanPopup, setShowRotationPlanPopup] = useState(false)
  const [viewRecoveryData, setViewRecoveryData] = useState(null)
  const [rotationPlanData, setRotationPlanData] = useState(null)

  const flight = selectedFlight || {
    flightNumber: 'N/A',
    route: 'N/A → N/A',
    priority: 'Medium',
    categorization: 'Unknown'
  }

  // Load recovery options from database based on disruption category
  useEffect(() => {
    const loadRecoveryOptions = async () => {
      if (selectedFlight?.categorization || selectedFlight?.type) {
        setLoading(true)
        try {
          const categoryCode = selectedFlight.categorization || selectedFlight.type
          const options = await databaseService.getRecoveryOptionsByCategory(categoryCode)

          if (options.length === 0 && selectedFlight.id) {
            // Try to get options by flight ID if category-based lookup fails
            const flightOptions = await databaseService.getDetailedRecoveryOptions(selectedFlight.id)
            setComparisonOptions(flightOptions) // Directly update comparisonOptions
          } else {
            setComparisonOptions(options) // Directly update comparisonOptions
          }
        } catch (error) {
          console.error('Error loading recovery options:', error)
          setError('Failed to load recovery options. Please try again.')
          setComparisonOptions([]) // Clear options on error
        } finally {
          setLoading(false)
        }
      }
    }

    if (selectedFlight) {
      loadRecoveryOptions()
    } else {
      // If no selectedFlight, clear options and set loading to false
      setComparisonOptions([])
      setLoading(false)
    }
  }, [selectedFlight])


  // Generate recovery options when component mounts or flight changes
  useEffect(() => {
    if (selectedFlight) {
      setLoading(false)
      generateRecoveryOptions()
    }
  }, [selectedFlight])

  // Show loading state if no flight data is available
  if (loading || !selectedFlight) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flydubai-blue mx-auto mb-4"></div>
          <p>Loading flight comparison data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-red">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-flydubai-red mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4 border-flydubai-blue text-flydubai-blue" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use dynamic recovery options from database or props, with fallback to static data
  const comparisonOptions = dynamicRecoveryOptions.length > 0 
    ? dynamicRecoveryOptions.map((option, index) => {
    const optionId = String(option.id || '');
    return {
      ...option,
      // Ensure all required fields are present for comparison
      metrics: option.metrics || {
        costEfficiency: 75 + Math.random() * 20,
        timeEfficiency: 70 + Math.random() * 25,
        passengerSatisfaction: 65 + Math.random() * 30,
        operationalComplexity: 50 + Math.random() * 40,
        riskLevel: 20 + Math.random() * 60,
        resourceAvailability: 80 + Math.random() * 20
      },
      passengerImpact: option.passengerImpact || {
        affected: selectedFlight?.passengers || 167,
        reaccommodated: optionId.includes('CANCEL') ? (selectedFlight?.passengers || 167) : 
                       optionId.includes('DELAY') ? Math.floor((selectedFlight?.passengers || 167) * 0.3) : 0,
        compensated: optionId.includes('CANCEL') ? (selectedFlight?.passengers || 167) :
                     optionId.includes('DELAY') ? Math.floor((selectedFlight?.passengers || 167) * 0.5) : 0,
        missingConnections: optionId.includes('CANCEL') ? Math.floor((selectedFlight?.passengers || 167) * 0.8) :
                           optionId.includes('DELAY') ? Math.floor((selectedFlight?.passengers || 167) * 0.4) :
                           Math.floor((selectedFlight?.passengers || 167) * 0.1)
      },
      operationalImpact: option.operationalImpact || {
        delayMinutes: parseInt(option.timeline?.replace(/[^0-9]/g, "") || "60"),
        downstreamFlights: optionId.includes('CANCEL') ? 0 : optionId.includes('DELAY') ? 3 : 2,
        crewChanges: optionId.includes('CREW') ? 2 : optionId.includes('CANCEL') ? 1 : 0,
        gateChanges: optionId.includes('AIRCRAFT_SWAP') ? 1 : 0
      },
      financialBreakdown: option.financialBreakdown || {
        aircraftCost: optionId.includes('AIRCRAFT_SWAP') ? 25000 : 0,
        crewCost: parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") * 0.3,
        passengerCost: optionId.includes('CANCEL') ? parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") * 0.6 : 
                       parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") * 0.2,
        operationalCost: parseInt(option.cost?.replace(/[^0-9]/g, "") || "25000") * 0.2
      },
    riskAssessment: option.riskAssessment || {
        technicalRisk: option.status === "recommended" ? "Low" : option.status === "caution" ? "Medium" : "High",
        weatherRisk: selectedFlight?.disruptionReason?.includes('Weather') ? "Medium" : "Low",
        regulatoryRisk: optionId.includes('CANCEL') ? "High" : "Low",
        passengerRisk: option.confidence > 80 ? "Low" : option.confidence > 60 ? "Medium" : "High"
      }
    };
  }) : [
    // Fallback static data when no dynamic options are available
    {
      id: "option_1",
      title: "Aircraft Swap - Immediate",
      description: "Replace with available aircraft",
      cost: "AED 45,000",
      timeline: "75 minutes",
      confidence: 92,
      impact: "Medium impact",
      status: "recommended",
      category: "Aircraft Substitution",
      advantages: [
        "Immediate aircraft availability",
        "Minimal passenger disruption"
      ],
      considerations: [
        "Higher operational cost",
        "Requires coordination"
      ],
      metrics: {
        costEfficiency: 78,
        timeEfficiency: 95,
        passengerSatisfaction: 88,
        operationalComplexity: 65,
        riskLevel: 25,
        resourceAvailability: 90
      },
      passengerImpact: {
        affected: 167,
        reaccommodated: 0,
        compensated: 0,
        missingConnections: 12
      },
      operationalImpact: {
        delayMinutes: 75,
        downstreamFlights: 2,
        crewChanges: 0,
        gateChanges: 1
      },
      financialBreakdown: {
        aircraftCost: 25000,
        crewCost: 8000,
        passengerCost: 3000,
        operationalCost: 9000
      },
      riskAssessment: {
        technicalRisk: "Low",
        weatherRisk: "None",
        regulatoryRisk: "Low",
        passengerRisk: "Low"
      }
    }
  ];

  const flight = Array.isArray(selectedFlight) ? selectedFlight[0] : selectedFlight

  const getAircraftIssueRecovery = () => ({
    title: 'Aircraft Issue Recovery Options',
    options: [
      {
        id: 'SWAP_A6FDC',
        title: 'Aircraft Swap - A6-FDC',
        description: 'Immediate tail swap with available A320',
        cost: 'AED 45,000',
        timeline: '75 minutes',
        confidence: 95,
        impact: 'Minimal passenger disruption',
        status: 'recommended',
        metrics: {
          totalCost: 45000,
          otpScore: 88,
          aircraftSwaps: 1,
          crewViolations: 0,
          paxAccommodated: 98,
          regulatoryRisk: 'Low',
          passengerCompensation: 8000,
          delayMinutes: 75,
          confidenceScore: 95,
          networkImpact: 'Minimal'
        }
      },
      {
        id: 'DELAY_REPAIR',
        title: 'Delay for Repair Completion',
        description: 'Wait for A6-FDB hydraulics system repair',
        cost: 'AED 180,000',
        timeline: '4-6 hours',
        confidence: 45,
        impact: 'Significant passenger disruption',
        status: 'caution',
        metrics: {
          totalCost: 180000,
          otpScore: 35,
          aircraftSwaps: 0,
          crewViolations: 2,
          paxAccommodated: 75,
          regulatoryRisk: 'Medium',
          passengerCompensation: 85000,
          delayMinutes: 300,
          confidenceScore: 45,
          networkImpact: 'High'
        }
      },
      {
        id: 'CANCEL_REBOOK',
        title: 'Cancel and Rebook',
        description: 'Cancel FZ445 and rebook on partner airlines',
        cost: 'AED 520,000',
        timeline: 'Immediate',
        confidence: 75,
        impact: 'Complete route cancellation',
        status: 'warning',
        metrics: {
          totalCost: 520000,
          otpScore: 0,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 85,
          regulatoryRisk: 'Low',
          passengerCompensation: 320000,
          delayMinutes: 0,
          confidenceScore: 75,
          networkImpact: 'None'
        }
      }
    ]
  })

  const getCrewIssueRecovery = () => ({
    title: 'Crew Issue Recovery Options',
    options: [
      {
        id: 'STANDBY_CREW',
        title: 'Assign Standby Crew',
        description: 'Capt. Mohammed Al-Zaabi from standby roster',
        cost: 'AED 8,500',
        timeline: '30 minutes',
        confidence: 92,
        impact: 'Minimal operational disruption',
        status: 'recommended',
        metrics: {
          totalCost: 8500,
          otpScore: 95,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: 'Low',
          passengerCompensation: 2000,
          delayMinutes: 30,
          confidenceScore: 92,
          networkImpact: 'None'
        }
      },
      {
        id: 'DEADHEAD_CREW',
        title: 'Deadhead Crew from AUH',
        description: 'Position qualified Captain from Abu Dhabi',
        cost: 'AED 25,000',
        timeline: '120 minutes',
        confidence: 85,
        impact: 'Moderate schedule delay',
        status: 'caution',
        metrics: {
          totalCost: 25000,
          otpScore: 78,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 96,
          regulatoryRisk: 'Low',
          passengerCompensation: 12000,
          delayMinutes: 120,
          confidenceScore: 85,
          networkImpact: 'Low'
        }
      },
      {
        id: 'DELAY_COMPLIANCE',
        title: 'Delay for Crew Rest',
        description: 'Wait for original crew mandatory rest period',
        cost: 'AED 45,000',
        timeline: '3 hours',
        confidence: 65,
        impact: 'Major schedule disruption',
        status: 'warning',
        metrics: {
          totalCost: 45000,
          otpScore: 45,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 88,
          regulatoryRisk: 'Low',
          passengerCompensation: 28000,
          delayMinutes: 180,
          confidenceScore: 65,
          networkImpact: 'Medium'
        }
      }
    ]
  })

  const getWeatherDelayRecovery = () => ({
    title: 'Weather Delay Recovery Options',
    options: [
      {
        id: 'ROUTE_OPTIMIZE',
        title: 'Route Optimization',
        description: 'Alternative routing to avoid weather',
        cost: 'AED 12,000',
        timeline: '45 minutes',
        confidence: 88,
        impact: 'Minimal delay with fuel cost',
        status: 'recommended',
        metrics: {
          totalCost: 12000,
          otpScore: 92,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: 'Low',
          passengerCompensation: 3000,
          delayMinutes: 45,
          confidenceScore: 88,
          networkImpact: 'None'
        }
      },
      {
        id: 'WEATHER_DELAY',
        title: 'Hold for Weather Improvement',
        description: 'Wait for favorable weather conditions',
        cost: 'AED 35,000',
        timeline: '2-3 hours',
        confidence: 70,
        impact: 'Schedule delay with passenger services',
        status: 'caution',
        metrics: {
          totalCost: 35000,
          otpScore: 65,
          aircraftSwaps: 0,
          crewViolations: 1,
          paxAccommodated: 95,
          regulatoryRisk: 'Medium',
          passengerCompensation: 18000,
          delayMinutes: 150,
          confidenceScore: 70,
          networkImpact: 'Low'
        }
      },
      {
        id: 'ALTERNATE_AIRPORT',
        title: 'Divert to Alternate Airport',
        description: 'Land at nearby airport with ground transport',
        cost: 'AED 85,000',
        timeline: 'Normal flight time',
        confidence: 90,
        impact: 'Ground transport arrangement required',
        status: 'caution',
        metrics: {
          totalCost: 85000,
          otpScore: 85,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 90,
          regulatoryRisk: 'Low',
          passengerCompensation: 35000,
          delayMinutes: 60,
          confidenceScore: 90,
          networkImpact: 'Medium'
        }
      }
    ]
  })

  const getCurfewCongestionRecovery = () => ({
    title: 'Airport Curfew/Congestion Recovery Options',
    options: [
      {
        id: 'PRIORITY_SLOT',
        title: 'Request Priority Slot',
        description: 'ATC coordination for earlier departure',
        cost: 'AED 15,000',
        timeline: '60 minutes',
        confidence: 80,
        impact: 'Moderate delay with slot fees',
        status: 'recommended',
        metrics: {
          totalCost: 15000,
          otpScore: 85,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: 'Low',
          passengerCompensation: 5000,
          delayMinutes: 60,
          confidenceScore: 80,
          networkImpact: 'None'
        }
      },
      {
        id: 'OVERNIGHT_DELAY',
        title: 'Overnight Delay',
        description: 'Delay until next available slot',
        cost: 'AED 95,000',
        timeline: 'Next day',
        confidence: 95,
        impact: 'Full passenger accommodation required',
        status: 'caution',
        metrics: {
          totalCost: 95000,
          otpScore: 20,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: 'Low',
          passengerCompensation: 65000,
          delayMinutes: 720,
          confidenceScore: 95,
          networkImpact: 'High'
        }
      },
      {
        id: 'REROUTE_HUB',
        title: 'Reroute via Alternative Hub',
        description: 'Route through different airport hub',
        cost: 'AED 45,000',
        timeline: '3 hours',
        confidence: 85,
        impact: 'Extended travel time',
        status: 'caution',
        metrics: {
          totalCost: 45000,
          otpScore: 70,
          aircraftSwaps: 0,
          crewViolations: 1,
          paxAccommodated: 95,
          regulatoryRisk: 'Low',
          passengerCompensation: 22000,
          delayMinutes: 180,
          confidenceScore: 85,
          networkImpact: 'Medium'
        }
      }
    ]
  })

  const getRotationMisalignmentRecovery = () => ({
    title: 'Rotation/Maintenance Recovery Options',
    options: [
      {
        id: 'ROTATION_RESEQUENCE',
        title: 'Resequence Rotation',
        description: 'Adjust aircraft rotation sequence',
        cost: 'AED 18,000',
        timeline: '90 minutes',
        confidence: 88,
        impact: 'Minor schedule adjustments',
        status: 'recommended',
        metrics: {
          totalCost: 18000,
          otpScore: 90,
          aircraftSwaps: 2,
          crewViolations: 0,
          paxAccommodated: 98,
          regulatoryRisk: 'Low',
          passengerCompensation: 6000,
          delayMinutes: 90,
          confidenceScore: 88,
          networkImpact: 'Low'
        }
      },
      {
        id: 'MAINTENANCE_DEFER',
        title: 'Defer Maintenance',
        description: 'Postpone non-critical maintenance',
        cost: 'AED 8,000',
        timeline: '30 minutes',
        confidence: 75,
        impact: 'Minimal operational impact',
        status: 'caution',
        metrics: {
          totalCost: 8000,
          otpScore: 95,
          aircraftSwaps: 0,
          crewViolations: 0,
          paxAccommodated: 100,
          regulatoryRisk: 'Medium',
          passengerCompensation: 2000,
          delayMinutes: 30,
          confidenceScore: 75,
          networkImpact: 'None'
        }
      },
      {
        id: 'ALTERNATIVE_AIRCRAFT',
        title: 'Use Alternative Aircraft',
        description: 'Swap to maintenance-ready aircraft',
        cost: 'AED 35,000',
        timeline: '2 hours',
        confidence: 92,
        impact: 'Aircraft swap with passenger transfer',
        status: 'recommended',
        metrics: {
          totalCost: 35000,
          otpScore: 82,
          aircraftSwaps: 1,
          crewViolations: 0,
          paxAccommodated: 96,
          regulatoryRisk: 'Low',
          passengerCompensation: 15000,
          delayMinutes: 120,
          confidenceScore: 92,
          networkImpact: 'Low'
        }
      }
    ]
  })

  const getScenarioData = (categorization) => {
    switch (categorization) {
      case 'Aircraft issue (e.g., AOG)':
        return getAircraftIssueRecovery()
      case 'Crew issue (e.g., sick report, duty time breach)':
        return getCrewIssueRecovery()
      case 'ATC/weather delay':
        return getWeatherDelayRecovery()
      case 'Airport curfew/ramp congestion':
        return getCurfewCongestionRecovery()
      case 'Rotation misalignment or maintenance hold':
        return getRotationMisalignmentRecovery()
      default:
        return getAircraftIssueRecovery()
    }
  }

  useEffect(() => {
    if (flight && recoveryOptions.length === 0) { // Only fetch if no dynamic options are provided
      const data = getScenarioData(flight.categorization)
      // setRecoveryOptions(data.options) // This line should be in the parent component to pass options
    }
  }, [flight, recoveryOptions]) // Added recoveryOptions to dependency array

  // Generate recovery options when component mounts or flight changes
  const generateRecoveryOptions = () => {
    if (!selectedFlight) {
      setComparisonOptions([]);
      return;
    }
    const category = selectedFlight.categorization || selectedFlight.type || 'Unknown';
    const scenario = getScenarioData(category);
    setComparisonOptions(scenario.options);
  };

  useEffect(() => {
    if (selectedFlight) {
      setLoading(false); // Set loading to false once selectedFlight is available
      generateRecoveryOptions();
    } else {
      setLoading(false); // Ensure loading is false if selectedFlight is initially null/undefined
      setComparisonOptions([]); // Clear options if no flight is selected
    }
  }, [selectedFlight]);

  if (!selectedFlight) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Target className="h-12 w-12 text-flydubai-blue mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-flydubai-navy mb-2">No Flight Selected</h3>
          <p className="text-muted-foreground">
            Please select a flight from the list to view recovery options and compare plans.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flydubai-blue mx-auto mb-4"></div>
          <p>Loading recovery options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-red">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-flydubai-red mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4 border-flydubai-blue text-flydubai-blue" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (comparisonOptions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-orange">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-flydubai-orange mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">No Recovery Options Found</h3>
            <p className="text-muted-foreground">
              No recovery options available for {flight.flightNumber} ({flight.route}) with the current categorization.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const generateComparisonData = () => {
    const metrics = [
      { metric: 'Total Cost', type: 'cost', format: 'currency' },
      { metric: 'OTP Score', type: 'percentage', format: 'percentage' },
      { metric: 'Aircraft Swaps', type: 'number', format: 'number' },
      { metric: 'Crew Rule Violations', type: 'violations', format: 'number' },
      { metric: 'PAX Accommodated', type: 'percentage', format: 'percentage' },
      { metric: 'Regulatory Risk', type: 'risk', format: 'text' },
      { metric: 'Delay (Minutes)', type: 'number', format: 'number' },
      { metric: 'Confidence Score', type: 'percentage', format: 'percentage' },
      { metric: 'Network Impact', type: 'risk', format: 'text' }
    ]

    return metrics.map(metric => {
      const row = { metric: metric.metric, type: metric.type, format: metric.format }

      comparisonOptions.forEach((option, index) => {
        const key = `option${String.fromCharCode(65 + index)}`

        switch (metric.metric) {
          case 'Total Cost':
            // Use cost from option or calculate from financial breakdown
            let totalCost = 0

            // Try multiple sources for cost data
            if (option.totalCost) {
              totalCost = option.totalCost
            } else if (option.metrics?.totalCost) {
              totalCost = option.metrics.totalCost
            } else if (option.cost) {
              const costString = String(option.cost).replace(/[^0-9]/g, "")
              totalCost = parseInt(costString) || 0
            } else if (option.financialBreakdown) {
              totalCost = Object.values(option.financialBreakdown).reduce((sum, cost) => sum + (typeof cost === 'number' ? cost : 0), 0)
            }

            // Set minimum reasonable cost if zero or too low
            if (totalCost === 0 || totalCost < 1000) {
              totalCost = 25000 // Default reasonable cost
            }

            row[key] = `AED ${totalCost.toLocaleString()}`
            break
          case 'OTP Score':
            row[key] = `${option.metrics?.otpScore || Math.floor(option.confidence || 85)}%`
            break
          case 'Aircraft Swaps':
            row[key] = (option.metrics?.aircraftSwaps || (option.id && String(option.id).includes('AIRCRAFT') ? 1 : 0)).toString()
            break
          case 'Crew Rule Violations':
            row[key] = (option.metrics?.crewViolations || 0).toString()
            break
          case 'PAX Accommodated':
            row[key] = `${option.metrics?.paxAccommodated || Math.floor(100 - (option.passengerImpact?.missingConnections || 0) / (option.passengerImpact?.affected || 1) * 100)}%`
            break
          case 'Regulatory Risk':
            row[key] = option.metrics?.regulatoryRisk || option.riskAssessment?.regulatoryRisk || 'Low'
            break
          case 'Delay (Minutes)':
            row[key] = (option.metrics?.delayMinutes || option.operationalImpact?.delayMinutes || parseInt(option.timeline?.replace(/[^0-9]/g, "") || "60")).toString()
            break
          case 'Confidence Score':
            row[key] = `${option.metrics?.confidenceScore || option.confidence || 85}%`
            break
          case 'Network Impact':
            row[key] = option.metrics?.networkImpact || 'Low'
            break
          default:
            row[key] = '-'
        }
      })

      return row
    })
  }

  const comparisonData = generateComparisonData()

  const getRiskBadgeStyle = (risk) => {
    switch (risk.toLowerCase()) {
      case 'none':
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'recommended': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'caution': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const handleViewFullDetails = async (option) => {
    try {
      setLoading(true)
      const details = await databaseService.getRecoveryOptionDetails?.(option.id) || option
      setDetailPlanData(details) // Use setDetailPlanData
      setShowDetailedPlan(true) // Use setShowDetailedPlan
    } catch (error) {
      console.error('Error loading option details:', error)
      // Fallback to option data
      setDetailPlanData(option) // Use setDetailPlanData
      setShowDetailedPlan(true) // Use setShowDetailedPlan
    } finally {
      setLoading(false)
    }
  }

  const handleViewRotationPlan = async (option) => {
    try {
      setLoading(true)
      const rotationPlan = await databaseService.getRotationPlanDetails?.(option.id) || {
        aircraftRotations: [
          { aircraft: selectedFlight?.aircraft || 'A6-FDB', currentFlight: selectedFlight?.flightNumber || 'FZ445', nextFlight: 'FZ446', turnaroundTime: '45 min' },
          { aircraft: 'A6-FDC', currentFlight: 'Available', nextFlight: 'FZ445', turnaroundTime: '30 min' }
        ],
        impactedFlights: [
          { flightNumber: 'FZ446', delay: '45 min', passengers: 156, status: 'Delayed' },
          { flightNumber: 'FZ447', delay: '15 min', passengers: 189, status: 'Delayed' }
        ]
      }
      setRotationPlanData(rotationPlan) // Use setRotationPlanData
      setShowRotationPlanPopup(true) // Use setShowRotationPlanPopup
    } catch (error) {
      console.error('Error loading rotation plan:', error)
      // Fallback rotation plan
      setRotationPlanData({ // Use setRotationPlanData
        aircraftRotations: [
          { aircraft: selectedFlight?.aircraft || 'A6-FDB', currentFlight: selectedFlight?.flightNumber || 'FZ445', nextFlight: 'FZ446', turnaroundTime: '45 min' }
        ],
        impactedFlights: []
      })
      setShowRotationPlanPopup(true) // Use setShowRotationPlanPopup
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">Recovery Options Comparison</h2>
          <p className="text-muted-foreground">
            Comparing {comparisonOptions.length} recovery options for {flight.flightNumber} ({flight.route})
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${flight.priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' : 
                                flight.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                'bg-green-100 text-green-700 border-green-200'}`}>
              {flight.priority} Priority
            </Badge>
            <Badge variant="outline" className="text-flydubai-blue border-flydubai-blue">
              {flight.categorization}
            </Badge>
          </div>
        </div>
        <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Flight Information
            </div>
            <div className="font-medium">
              {selectedFlight?.flightNumber || 'N/A'} • {selectedFlight?.origin}-{selectedFlight?.destination}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedFlight?.aircraft || 'N/A'} • {selectedFlight?.passengers || 0} passengers
            </div>
          </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-flydubai-blue text-flydubai-blue hover:bg-blue-50">
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
          <Button variant="outline" className="border-flydubai-orange text-flydubai-orange hover:bg-orange-50">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Charts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisonOptions.map((option, index) => {
          const letter = String.fromCharCode(65 + index)
          return (
            <Card key={option.id} className={`border-2 ${
              option.status === 'recommended' ? 'border-green-300 bg-green-50' :
              option.status === 'caution' ? 'border-yellow-300 bg-yellow-50' :
              'border-red-300 bg-red-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-flydubai-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                      {letter}
                    </span>
                    <h3 className="font-semibold text-flydubai-navy">{option.title}</h3>
                  </div>
                  {getStatusIcon(option.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-medium text-flydubai-orange">{option.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span className="font-medium">{option.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.confidence}%</span>
                      <Progress value={option.confidence} className="w-16 h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-flydubai-navy">Comprehensive Comparison Matrix</CardTitle>
          <p className="text-muted-foreground">
            Side-by-side analysis of all recovery options with key performance indicators
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-flydubai-navy">Metric</TableHead>
                  {comparisonOptions.map((option, index) => {
                    const letter = String.fromCharCode(65 + index)
                    return (
                      <TableHead key={option.id} className="text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-flydubai-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                              {letter}
                            </span>
                            <span className="font-semibold">Option {letter}</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-normal">
                            {option.title}
                          </span>
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row, index) => (
                  <TableRow key={index} className="hover:bg-blue-50">
                    <TableCell className="font-medium text-flydubai-navy">{row.metric}</TableCell>
                    {comparisonOptions.map((option, optionIndex) => {
                      const letter = String.fromCharCode(65 + optionIndex)
                      const value = row[`option${letter}`]

                      return (
                        <TableCell key={option.id} className="text-center">
                          {row.type === 'risk' ? (
                            <Badge className={getRiskBadgeStyle(value)}>{value}</Badge>
                          ) : row.type === 'violations' && parseInt(value) > 0 ? (
                            <span className="text-red-600 font-medium">{value}</span>
                          ) : row.format === 'currency' ? (
                            <span className="font-medium">{value}</span>
                          ) : row.format === 'percentage' ? (
                            <span className="font-medium">{value}</span>
                          ) : (
                            value
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisonOptions.map((option, index) => {
          const letter = String.fromCharCode(65 + index)
          return (
            <Card key={option.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-flydubai-navy">Option {letter} Details</h3>
                  <span className="bg-flydubai-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    {letter}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewFullDetails(option)}
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewRotationPlan(option)}
                    disabled={loading}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Rotation Impact
                  </Button>

                  <Button 
                    className="w-full bg-flydubai-orange hover:bg-flydubai-orange/90 text-white" 
                    onClick={() => onSelectPlan({ id: option.id, option: letter, data: option })}
                  >
                    Select Option {letter}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-8 w-8 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium mb-3 text-flydubai-navy">AERON AI Recommendation Summary</h3>
              <div className="space-y-3">
                {comparisonOptions.filter(opt => opt.status === 'recommended').map((option) => {
                  const letter = String.fromCharCode(65 + comparisonOptions.indexOf(option))
                  return (
                    <div key={option.id} className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 border-green-200">Best Overall</Badge>
                      <span>Option {letter} - {option.title} ({option.confidence}% confidence)</span>
                    </div>
                  )
                })}

                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Most Cost-Effective</Badge>
                  <span>Option A - Aircraft Swap (AED 45,000)</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">Fastest Recovery</Badge>
                  <span>Option A - Aircraft Swap (75 minutes)</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>AI Analysis:</strong> Based on current flight conditions, passenger load, and network impact, 
                  the recommended option balances operational efficiency with cost control while maintaining regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Option Details Dialog */}
      <Dialog open={showDetailedPlan} onOpenChange={setShowDetailedPlan}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recovery Option Details
            </DialogTitle>
          </DialogHeader>

          {detailPlanData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Option Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{detailPlanData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium text-flydubai-orange">{detailPlanData.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timeline:</span>
                        <span className="font-medium">{detailPlanData.timeline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={detailPlanData.confidence} className="w-16 h-2" />
                          <span className="font-medium">{detailPlanData.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Passenger Impact:</span>
                        <Badge variant="outline">{detailPlanData.impact}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={detailPlanData.status === 'recommended' 
                          ? 'bg-green-100 text-green-800' 
                          : detailPlanData.status === 'caution'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'}>
                          {detailPlanData.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{detailPlanData.description}</p>
                </CardContent>
              </Card>

              {detailPlanData.advantages && (
                <Card>
                  <CardHeader>
                    <CardTitle>Advantages & Considerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-700">Advantages</h4>
                        <ul className="space-y-1">
                          {detailPlanData.advantages.map((advantage, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">• {advantage}</li>
                          ))}
                        </ul>
                      </div>
                      {detailPlanData.considerations && (
                        <div>
                          <h4 className="font-medium mb-2 text-orange-700">Considerations</h4>
                          <ul className="space-y-1">
                            {detailPlanData.considerations.map((consideration, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">• {consideration}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rotation Plan Dialog */}
      <Dialog open={showRotationPlanPopup} onOpenChange={setShowRotationPlanPopup}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Aircraft Rotation Plan
            </DialogTitle>
          </DialogHeader>

          {rotationPlanData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Aircraft Rotations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rotationPlanData.aircraftRotations?.map((rotation, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{rotation.aircraft}</p>
                          <p className="text-sm text-muted-foreground">Current: {rotation.currentFlight}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">→</p>
                          <p className="text-xs text-muted-foreground">{rotation.turnaroundTime}</p>
                        </div>
                        <div>
                          <p className="font-medium">{rotation.nextFlight}</p>
                          <p className="text-sm text-muted-foreground">Next Flight</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {rotationPlanData.impactedFlights?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Impacted Flights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rotationPlanData.impactedFlights.map((flight, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{flight.flightNumber}</p>
                            <p className="text-sm text-muted-foreground">{flight.passengers} passengers</p>
                          </div>
                          <div className="text-right">
                            <Badge className={flight.status === 'Delayed' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                              {flight.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">{flight.delay} delay</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}