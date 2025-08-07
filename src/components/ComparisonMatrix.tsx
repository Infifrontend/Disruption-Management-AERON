'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Progress } from './ui/progress'
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Info,
  Download
} from 'lucide-react'

interface ComparisonMatrixProps {
  selectedFlight: any;
  recoveryOptions?: any[];
  scenarioData?: any;
  onSelectPlan: (plan: any) => void;
}

export function ComparisonMatrix({ selectedFlight, recoveryOptions = [], scenarioData, onSelectPlan }: ComparisonMatrixProps) {
  // Use dynamic recovery options from props, with fallback to static data if none provided
  const comparisonOptions = recoveryOptions.length > 0 ? recoveryOptions.map((option, index) => {
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

  if (!flight) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-blue">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-flydubai-blue mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">No Recovery Options to Compare</h3>
            <p className="text-muted-foreground">
              Please select a flight from the Affected Flights screen and generate recovery options first.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!comparisonOptions || comparisonOptions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-flydubai-orange">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-flydubai-orange mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-flydubai-navy mb-2">Recovery Options Loading</h3>
            <p className="text-muted-foreground">
              Generating recovery options for {flight.flightNumber} ({flight.route})...
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
            const totalCost = option.metrics?.totalCost || 
                            parseInt(option.cost?.replace(/[^0-9]/g, "") || "0") ||
                            (option.financialBreakdown ? 
                              Object.values(option.financialBreakdown).reduce((sum, cost) => sum + (typeof cost === 'number' ? cost : 0), 0) : 0)
            row[key] = `AED ${totalCost.toLocaleString()}`
            break
          case 'OTP Score':
            row[key] = `${option.metrics?.otpScore || Math.floor(option.confidence || 85)}%`
            break
          case 'Aircraft Swaps':
            row[key] = (option.metrics?.aircraftSwaps || (option.id && optionId.includes('AIRCRAFT') ? 1 : 0)).toString()
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
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Details
                  </Button>

                  <Button variant="outline" size="sm" className="w-full">
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
    </div>
  )
}