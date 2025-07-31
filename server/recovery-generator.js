
// Helper functions for disruption type mapping and recovery generation
const mapDisruptionTypeToCategory = (type, reason) => {
  const lowerType = type.toLowerCase()
  const lowerReason = reason.toLowerCase()
  
  if (lowerType.includes('technical') || lowerReason.includes('maintenance') || lowerReason.includes('aog')) {
    return 'Aircraft issue (e.g., AOG)'
  }
  if (lowerType.includes('crew') || lowerReason.includes('crew') || lowerReason.includes('duty time')) {
    return 'Crew issue (e.g., sick report, duty time breach)'
  }
  if (lowerType.includes('weather') || lowerReason.includes('weather') || lowerReason.includes('atc')) {
    return 'ATC/weather delay'
  }
  if (lowerType.includes('curfew') || lowerReason.includes('curfew') || lowerReason.includes('congestion')) {
    return 'Airport curfew/ramp congestion'
  }
  if (lowerType.includes('rotation') || lowerReason.includes('rotation') || lowerReason.includes('misalignment')) {
    return 'Rotation misalignment or maintenance hold'
  }
  
  return 'Aircraft issue (e.g., AOG)' // Default fallback
}

const generateAircraftIssueRecovery = (flight) => {
  const steps = [
    {
      step: 1,
      title: "Ground Alert Triggered in AMOS",
      status: "completed",
      timestamp: "14:15:00",
      system: "AMOS MRO System",
      details: `Aircraft ${flight.aircraft} grounded - Technical issue detected`,
      data: {
        alertType: "Technical System Failure",
        severity: "Ground Stop Required",
        amosRef: `AMOS-2025-${new Date().getMonth().toString().padStart(2, '0')}-${flight.aircraft?.slice(-3)}-001`,
        location: "DXB Gate A12",
      },
    },
    {
      step: 2,
      title: "Assess Estimated Repair Time",
      status: "completed",
      timestamp: "14:18:00",
      system: "Maintenance Planning",
      details: "ETA from maintenance: 4-6 hours, parts availability checked",
      data: {
        estimatedRepair: "4-6 hours",
        partsAvailable: "Yes - In stock at DXB",
        engineerAssigned: "Lead Technical Specialist",
        completionETA: "20:30 GST",
      },
    },
    {
      step: 3,
      title: "Generate Rotation Impact Tree",
      status: "completed",
      timestamp: "14:20:00",
      system: "AERON Analytics",
      details: "Analyzing downstream flights and network implications",
      data: {
        affectedFlights: 3,
        totalPassengers: flight.passengers || 189,
        revenueImpact: "AED 890K",
        curfewBreaches: "None identified",
        overnightImplications: `${flight.destination} turnaround affected`,
      },
    }
  ]
  
  const options = [
    {
      id: "SWAP_AIRCRAFT",
      title: "Aircraft Swap - Available Alternative",
      description: "Immediate tail swap with available aircraft",
      cost: "AED 45,000",
      timeline: "75 minutes",
      confidence: 95,
      impact: "Minimal passenger disruption",
      status: "recommended",
      advantages: ["Same aircraft type - no passenger impact", "Available immediately", "Maintains 97% of schedule integrity"],
      considerations: ["Crew briefing required for aircraft change", "Passenger transfer time: 30 minutes"],
      metrics: {
        totalCost: 45000,
        otpScore: 88,
        aircraftSwaps: 1,
        crewViolations: 0,
        paxAccommodated: 100,
        regulatoryRisk: "Low",
        delayMinutes: 75,
        confidenceScore: 95,
        networkImpact: "Low"
      }
    },
    {
      id: "DELAY_REPAIR",
      title: "Delay for Repair Completion",
      description: "Wait for aircraft technical issue resolution",
      cost: "AED 180,000",
      timeline: "4-6 hours",
      confidence: 45,
      impact: "Significant passenger disruption",
      status: "caution",
      advantages: ["Original aircraft maintained", "No aircraft swap complexity"],
      considerations: ["Repair ETA uncertain", "Massive passenger accommodation needed"],
      metrics: {
        totalCost: 180000,
        otpScore: 45,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 85,
        regulatoryRisk: "Medium",
        delayMinutes: 360,
        confidenceScore: 45,
        networkImpact: "High"
      }
    },
    {
      id: "CANCEL_REBOOK",
      title: "Cancel and Rebook",
      description: `Cancel ${flight.flightNumber} and rebook on partner airlines`,
      cost: "AED 520,000",
      timeline: "Immediate",
      confidence: 75,
      impact: "Complete route cancellation",
      status: "warning",
      advantages: ["Stops cascade disruption immediately", "Quick passenger rebooking process"],
      considerations: ["Complete revenue loss for sector", "High passenger compensation costs"],
      metrics: {
        totalCost: 520000,
        otpScore: 0,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 75,
        regulatoryRisk: "High",
        delayMinutes: 0,
        confidenceScore: 75,
        networkImpact: "Low"
      }
    }
  ]
  
  return { options, steps }
}

const generateCrewIssueRecovery = (flight) => {
  const steps = [
    {
      step: 1,
      title: "Crew Control Notified via AIMS",
      status: "completed",
      timestamp: "13:45:00",
      system: "AIMS Crew System",
      details: `Crew duty time breach detected for ${flight.flightNumber}`,
      data: {
        flightNumber: flight.flightNumber,
        crewMember: "Capt. Ahmed Al-Rashid",
        reason: "Duty Time Breach - FDP Limit Exceeded",
        currentFDP: "13.5 hours",
        maxFDP: "13.0 hours",
      },
    },
    {
      step: 2,
      title: "System Checks Available Resources",
      status: "completed",
      timestamp: "13:47:00",
      system: "Crew Availability Engine",
      details: "Standby crew, reserve crew, and deadhead options analyzed",
      data: {
        standbyAvailable: "Capt. Mohammed Al-Zaabi (B737 qualified)",
        reserveAvailable: "Capt. Sarah Thompson (B737 qualified)",
        fdpLegality: "All options within FDP limits",
        aircraftType: flight.aircraft || "B737-800",
      },
    }
  ]
  
  const options = [
    {
      id: "STANDBY_CREW",
      title: "Assign Standby Crew",
      description: "Activate standby crew member from roster",
      cost: "AED 8,500",
      timeline: "30 minutes",
      confidence: 92,
      impact: "Minimal operational disruption",
      status: "recommended",
      advantages: ["Standby crew immediately available", "Within all regulatory duty time limits"],
      considerations: ["Extended briefing required", "Standby crew pay activation costs"],
      metrics: {
        totalCost: 8500,
        otpScore: 92,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 100,
        regulatoryRisk: "Low",
        delayMinutes: 30,
        confidenceScore: 92,
        networkImpact: "Low"
      }
    },
    {
      id: "DELAY_COMPLIANCE",
      title: "Delay for Crew Rest Completion",
      description: "Wait for original crew mandatory rest period",
      cost: "AED 45,000",
      timeline: "3 hours",
      confidence: 65,
      impact: "Significant passenger disruption",
      status: "warning",
      advantages: ["Uses original qualified crew", "Full regulatory compliance"],
      considerations: ["3-hour minimum delay", "High passenger compensation liability"],
      metrics: {
        totalCost: 45000,
        otpScore: 65,
        aircraftSwaps: 0,
        crewViolations: 1,
        paxAccommodated: 85,
        regulatoryRisk: "Medium",
        delayMinutes: 180,
        confidenceScore: 65,
        networkImpact: "Medium"
      }
    }
  ]
  
  return { options, steps }
}

const generateWeatherDelayRecovery = (flight) => {
  const steps = [
    {
      step: 1,
      title: "Weather Trigger Received",
      status: "completed",
      timestamp: "12:30:00",
      system: "Weather Monitoring",
      details: `ATC holding all arrivals at ${flight.destination} due to severe weather`,
      data: {
        weatherType: "Thunderstorms + Low Visibility",
        visibility: "800m (Required: 1200m)",
        atcStatus: "All arrivals on hold",
        forecast: "Improvement expected 16:00-17:00",
      },
    }
  ]
  
  const options = [
    {
      id: "DELAY_WEATHER",
      title: "Delay for Weather Clearance",
      description: `Wait for weather improvement at ${flight.destination}`,
      cost: "AED 25,000",
      timeline: "2-3 hours",
      confidence: 90,
      impact: "Managed schedule delay",
      status: "recommended",
      advantages: ["Weather forecast shows improvement", "All connections protected"],
      considerations: ["Dependent on weather improvement", "Crew duty time monitoring"],
      metrics: {
        totalCost: 25000,
        otpScore: 80,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 95,
        regulatoryRisk: "Low",
        delayMinutes: 150,
        confidenceScore: 90,
        networkImpact: "Low"
      }
    },
    {
      id: "CANCEL_WEATHER",
      title: "Cancel Due to Weather",
      description: "Cancel flight and rebook passengers",
      cost: "AED 180,000",
      timeline: "Immediate",
      confidence: 60,
      impact: "Complete sector cancellation",
      status: "warning",
      advantages: ["Immediate resolution", "Weather exemption from compensation"],
      considerations: ["Complete revenue loss", "Customer dissatisfaction"],
      metrics: {
        totalCost: 180000,
        otpScore: 0,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 70,
        regulatoryRisk: "Medium",
        delayMinutes: 0,
        confidenceScore: 60,
        networkImpact: "Low"
      }
    }
  ]
  
  return { options, steps }
}

const generateCurfewCongestionRecovery = (flight) => {
  const steps = [
    {
      step: 1,
      title: "Determine Curfew Parameters",
      status: "completed",
      timestamp: "21:45:00",
      system: "Airport Operations",
      details: `${flight.destination} curfew 23:00-06:00, current ETA 23:15`,
      data: {
        curfewStart: "23:00 local time",
        curfewEnd: "06:00 local time",
        currentETA: "23:15 (15 min past curfew)",
        curfewType: "Noise restriction - strict enforcement",
      },
    }
  ]
  
  const options = [
    {
      id: "SWAP_EARLY",
      title: "Aircraft Swap for Earlier Departure",
      description: "Swap with earlier flight for 22:15 departure",
      cost: "AED 45,000",
      timeline: "45 minutes",
      confidence: 92,
      impact: "Beat curfew timing",
      status: "recommended",
      advantages: ["Arrive before curfew", "Zero passenger rebooking", "Significant cost savings"],
      considerations: ["Other flight delayed by 60 minutes", "Quick crew coordination needed"],
      metrics: {
        totalCost: 45000,
        otpScore: 88,
        aircraftSwaps: 1,
        crewViolations: 0,
        paxAccommodated: 100,
        regulatoryRisk: "Low",
        delayMinutes: 45,
        confidenceScore: 92,
        networkImpact: "Medium"
      }
    },
    {
      id: "OVERNIGHT_DELAY",
      title: "Overnight Delay",
      description: "Delay until 06:00 curfew end",
      cost: "AED 320,000",
      timeline: "7 hours",
      confidence: 65,
      impact: "Overnight accommodation",
      status: "warning",
      advantages: ["Original route maintained", "Crew gets proper rest"],
      considerations: ["High accommodation costs", "7-hour delay impact"],
      metrics: {
        totalCost: 320000,
        otpScore: 20,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 80,
        regulatoryRisk: "High",
        delayMinutes: 420,
        confidenceScore: 65,
        networkImpact: "High"
      }
    }
  ]
  
  return { options, steps }
}

const generateRotationMisalignmentRecovery = (flight) => {
  const steps = [
    {
      step: 1,
      title: "AMOS Maintenance Hold Flag",
      status: "completed",
      timestamp: "11:30:00",
      system: "AMOS Maintenance",
      details: `${flight.aircraft} maintenance extended by 3 hours`,
      data: {
        aircraft: flight.aircraft,
        maintenanceType: "Line Check",
        originalETA: "11:30:00",
        revisedETA: "14:30:00",
        delay: "3 hours extension",
      },
    }
  ]
  
  const options = [
    {
      id: "SWAP_ALTERNATIVE",
      title: "Aircraft Swap with Alternative",
      description: "Assign alternative aircraft to maintain schedule",
      cost: "AED 75,000",
      timeline: "90 minutes",
      confidence: 88,
      impact: "Minimal network disruption",
      status: "recommended",
      advantages: ["Alternative aircraft immediately available", "Zero passenger impact"],
      considerations: ["Alternative flight delayed 60 minutes", "Crew briefing for aircraft change"],
      metrics: {
        totalCost: 75000,
        otpScore: 85,
        aircraftSwaps: 1,
        crewViolations: 0,
        paxAccommodated: 100,
        regulatoryRisk: "Low",
        delayMinutes: 90,
        confidenceScore: 88,
        networkImpact: "Low"
      }
    },
    {
      id: "ACCEPT_DELAYS",
      title: "Accept Cascade Delays",
      description: "Wait for aircraft maintenance completion",
      cost: "AED 150,000",
      timeline: "3 hours",
      confidence: 70,
      impact: "Multiple flight delays",
      status: "caution",
      advantages: ["Original aircraft maintained", "Maintenance completed properly"],
      considerations: ["3-hour delay cascade", "Multiple passengers affected"],
      metrics: {
        totalCost: 150000,
        otpScore: 55,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 85,
        regulatoryRisk: "Medium",
        delayMinutes: 180,
        confidenceScore: 70,
        networkImpact: "High"
      }
    }
  ]
  
  return { options, steps }
}

export function generateRecoveryOptionsForDisruption(disruption) {
  const flight = {
    flightNumber: disruption.flight_number,
    aircraft: disruption.aircraft,
    origin: disruption.origin,
    destination: disruption.destination,
    passengers: disruption.passengers,
    crew: disruption.crew,
    connectionFlights: disruption.connection_flights,
    categorization: mapDisruptionTypeToCategory(disruption.disruption_type, disruption.disruption_reason)
  }
  
  let options = []
  let steps = []
  
  switch (flight.categorization) {
    case 'Aircraft issue (e.g., AOG)':
      ({ options, steps } = generateAircraftIssueRecovery(flight))
      break
    case 'Crew issue (e.g., sick report, duty time breach)':
      ({ options, steps } = generateCrewIssueRecovery(flight))
      break
    case 'ATC/weather delay':
      ({ options, steps } = generateWeatherDelayRecovery(flight))
      break
    case 'Airport curfew/ramp congestion':
      ({ options, steps } = generateCurfewCongestionRecovery(flight))
      break
    case 'Rotation misalignment or maintenance hold':
      ({ options, steps } = generateRotationMisalignmentRecovery(flight))
      break
    default:
      ({ options, steps } = generateAircraftIssueRecovery(flight))
  }
  
  return { options, steps }
}

export function generateRecoveryOptionsForDisruption(disruption) {
  const options = []
  const steps = []

  // Generate recovery steps based on disruption type
  const baseSteps = [
    {
      step: 1,
      title: 'Disruption Analysis',
      status: 'completed',
      timestamp: '2025-01-11 09:15:00',
      system: 'AERON Recovery Engine',
      details: `Analyzed ${disruption.disruption_type} disruption for flight ${disruption.flight_number}`,
      data: {
        disruptionType: disruption.disruption_type,
        severity: disruption.severity,
        delay: disruption.delay_minutes
      }
    },
    {
      step: 2,
      title: 'Resource Assessment',
      status: 'completed',
      timestamp: '2025-01-11 09:16:30',
      system: 'Resource Management',
      details: 'Checked available aircraft, crew, and slots',
      data: {
        aircraftAvailable: 3,
        crewAvailable: 2,
        slotsAvailable: true
      }
    },
    {
      step: 3,
      title: 'Option Generation',
      status: 'in_progress',
      timestamp: '2025-01-11 09:18:00',
      system: 'AERON AI Engine',
      details: 'Generating recovery options based on available resources',
      data: {
        optionsGenerated: 0,
        confidence: 0
      }
    }
  ]

  // Add disruption-specific steps
  if (disruption.disruption_type === 'Weather') {
    steps.push(...baseSteps, {
      step: 4,
      title: 'Weather Monitoring',
      status: 'pending',
      timestamp: '2025-01-11 09:20:00',
      system: 'Weather Service',
      details: 'Monitoring weather conditions for improvement',
      data: {
        weatherCondition: 'Improving',
        estimatedClearance: '2025-01-11 11:00:00'
      }
    })
  } else if (disruption.disruption_type === 'Technical') {
    steps.push(...baseSteps, {
      step: 4,
      title: 'Technical Assessment',
      status: 'pending',
      timestamp: '2025-01-11 09:20:00',
      system: 'Maintenance',
      details: 'Technical team assessing repair requirements',
      data: {
        estimatedRepairTime: 120,
        partsAvailable: true
      }
    })
  }

  // Generate recovery options based on disruption characteristics
  if (disruption.disruption_type === 'Weather' && disruption.delay_minutes > 180) {
    options.push({
      id: 'WR-001',
      title: 'Aircraft Substitution',
      description: 'Replace aircraft with available backup to avoid extended weather delay',
      cost: 'AED 45,000',
      timeline: '90 minutes',
      confidence: 92,
      impact: `${disruption.passengers} passengers affected`,
      status: 'recommended',
      advantages: [
        'Minimizes passenger delay',
        'Maintains schedule integrity',
        'Quick implementation'
      ],
      considerations: [
        'Higher operational cost',
        'Requires crew coordination',
        'Weather conditions must improve'
      ],
      resourceRequirements: {
        aircraft: 'Available backup aircraft',
        crew: 'Current crew (if duty time permits)',
        gates: 'Gate reassignment required'
      },
      costBreakdown: {
        aircraftSwap: 25000,
        crewCosts: 8000,
        groundHandling: 5000,
        passengerServices: 7000
      },
      timelineDetails: {
        preparation: '30 minutes',
        execution: '45 minutes',
        boarding: '15 minutes'
      },
      riskAssessment: {
        weatherRisk: 'Medium',
        operationalRisk: 'Low',
        costRisk: 'Medium'
      }
    })

    options.push({
      id: 'WR-002',
      title: 'Schedule Delay & Passenger Services',
      description: 'Delay flight and provide comprehensive passenger services',
      cost: 'AED 28,000',
      timeline: '4-6 hours',
      confidence: 85,
      impact: `${disruption.passengers} passengers, ${disruption.connection_flights || 0} connections`,
      status: 'alternative',
      advantages: [
        'Lower operational cost',
        'Uses original aircraft',
        'Comprehensive passenger care'
      ],
      considerations: [
        'Extended passenger delay',
        'Potential missed connections',
        'Network impact'
      ]
    })

    if (disruption.delay_minutes > 240) {
      options.push({
        id: 'WR-003',
        title: 'Cancel & Rebook with HOTAC',
        description: 'Cancel flight and rebook passengers on alternative flights with hotel accommodation',
        cost: 'AED 75,000',
        timeline: '24 hours',
        confidence: 95,
        impact: `${disruption.passengers} passengers fully accommodated`,
        status: 'contingency',
        advantages: [
          'Guaranteed passenger accommodation',
          'Minimal aircraft/crew impact',
          'Clear resolution'
        ],
        considerations: [
          'Highest cost option',
          '24-hour passenger impact',
          'Reputation considerations'
        ]
      })
    }
  } else if (disruption.disruption_type === 'Technical') {
    options.push({
      id: 'TR-001',
      title: 'Quick Technical Fix',
      description: 'Perform immediate technical repair if feasible',
      cost: 'AED 15,000',
      timeline: '2 hours',
      confidence: 75,
      impact: `${disruption.passengers} passengers with 2-hour delay`,
      status: 'recommended',
      advantages: [
        'Lowest cost option',
        'Uses original aircraft',
        'Minimal delay'
      ],
      considerations: [
        'Repair success not guaranteed',
        'Potential for extended delay',
        'Safety considerations'
      ]
    })

    options.push({
      id: 'TR-002',
      title: 'Aircraft Substitution',
      description: 'Replace aircraft immediately with available backup',
      cost: 'AED 38,000',
      timeline: '90 minutes',
      confidence: 88,
      impact: `${disruption.passengers} passengers with minimal delay`,
      status: 'alternative',
      advantages: [
        'Reliable solution',
        'Quick implementation',
        'Maintains schedule'
      ],
      considerations: [
        'Higher cost than repair',
        'Backup aircraft availability',
        'Crew coordination needed'
      ]
    })
  } else {
    // Default options for other disruption types
    options.push({
      id: 'GR-001',
      title: 'Standard Recovery Protocol',
      description: 'Apply standard recovery procedures for this disruption type',
      cost: 'AED 25,000',
      timeline: '2 hours',
      confidence: 80,
      impact: `${disruption.passengers} passengers affected`,
      status: 'recommended',
      advantages: [
        'Proven methodology',
        'Balanced cost-benefit',
        'Standard procedures'
      ],
      considerations: [
        'May not be optimal for unique situations',
        'Standard timeline may vary',
        'Resource availability dependent'
      ]
    })
  }

  return { options, steps }
}

export function generateRecoveryStepsForDisruption(disruption) {
  return generateRecoveryOptionsForDisruption(disruption).steps
}
