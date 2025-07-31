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

// Recovery generator for different disruption types
function generateRecoveryOptionsForDisruption(disruption) {
  const { disruption_type, severity, delay_minutes, passengers, aircraft } = disruption

  let options = []
  let steps = []

  // Generate recovery steps based on disruption type
  switch (disruption_type?.toLowerCase()) {
    case 'weather':
      steps = [
        {
          step: 1,
          title: 'Weather Trigger Received',
          status: 'completed',
          timestamp: '12:30 PM',
          system: 'Weather Monitoring',
          details: 'Severe weather alert received for departure airport',
          data: { severity: severity, impact: 'High' }
        }
      ]

      options = [
        {
          title: 'Delay for Weather Clearance',
          description: 'Wait for weather conditions to improve before departure',
          cost: 'AED 15,000',
          timeline: '2-4 hours',
          confidence: 85,
          impact: `${passengers} passengers affected`,
          status: 'recommended',
          advantages: ['Lower cost option', 'Maintains original flight plan'],
          considerations: ['Passenger accommodation needed', 'Potential crew duty time issues'],
          resourceRequirements: { crew: 'Current crew', aircraft: aircraft, gates: '1' },
          costBreakdown: { delay: 'AED 8,000', passenger_care: 'AED 7,000' },
          timelineDetails: { waiting_time: '2-4 hours', preparation: '30 minutes' },
          riskAssessment: { weather_risk: 'Medium', operational_risk: 'Low' },
          technicalSpecs: { fuel_burn: 'Minimal', maintenance_impact: 'None' },
          metrics: { cost_per_passenger: Math.round(15000 / passengers) },
          rotationPlan: { next_flight_impact: 'Delayed by same duration' }
        },
        {
          title: 'Cancel and Rebook Passengers',
          description: 'Cancel current flight and rebook passengers on alternative flights',
          cost: 'AED 45,000',
          timeline: '4-6 hours',
          confidence: 95,
          impact: `${passengers} passengers need rebooking`,
          status: 'alternative',
          advantages: ['Eliminates weather risk', 'Better passenger experience'],
          considerations: ['Higher cost', 'Limited seat availability'],
          resourceRequirements: { rebooking_agents: '5', alternative_flights: '3-4' },
          costBreakdown: { compensation: 'AED 30,000', rebooking: 'AED 15,000' },
          timelineDetails: { rebooking_time: '4-6 hours', notification: '1 hour' },
          riskAssessment: { operational_risk: 'Low', customer_satisfaction: 'Medium' },
          technicalSpecs: { systems_required: 'Reservation system, SMS/Email' },
          metrics: { cost_per_passenger: Math.round(45000 / passengers) },
          rotationPlan: { aircraft_freed: 'Available for other routes' }
        }
      ]
      break

    case 'technical':
      steps = [
        {
          step: 1,
          title: 'Technical Issue Identified',
          status: 'completed',
          timestamp: '11:45 AM',
          system: 'Maintenance Control',
          details: 'Aircraft technical issue reported by flight crew',
          data: { issue_type: 'Engine', severity: severity }
        }
      ]

      options = [
        {
          title: 'Aircraft Substitution',
          description: 'Replace current aircraft with available backup aircraft',
          cost: 'AED 25,000',
          timeline: '90-120 minutes',
          confidence: 90,
          impact: `${passengers} passengers delayed`,
          status: 'recommended',
          advantages: ['Quick resolution', 'Maintains route schedule'],
          considerations: ['Backup aircraft availability', 'Crew qualification check'],
          resourceRequirements: { backup_aircraft: '1', ground_crew: '8', fueling: 'Required' },
          costBreakdown: { aircraft_positioning: 'AED 15,000', ground_handling: 'AED 10,000' },
          timelineDetails: { positioning: '60 minutes', passenger_transfer: '30 minutes' },
          riskAssessment: { technical_risk: 'Low', schedule_risk: 'Medium' },
          technicalSpecs: { aircraft_type: 'B737-800', fuel_required: '12,000 kg' },
          metrics: { delay_minutes: 90, cost_per_passenger: Math.round(25000 / passengers) },
          rotationPlan: { original_aircraft: 'Out of service for maintenance' }
        },
        {
          title: 'Maintenance Repair',
          description: 'Repair the technical issue on current aircraft',
          cost: 'AED 8,000',
          timeline: '3-4 hours',
          confidence: 70,
          impact: `${passengers} passengers significantly delayed`,
          status: 'alternative',
          advantages: ['Lower direct cost', 'Aircraft remains in rotation'],
          considerations: ['Extended delay', 'Repair complexity unknown'],
          resourceRequirements: { maintenance_crew: '3', spare_parts: 'TBD', hangar_space: '1' },
          costBreakdown: { labor: 'AED 5,000', parts: 'AED 3,000' },
          timelineDetails: { diagnosis: '60 minutes', repair: '2-3 hours' },
          riskAssessment: { repair_success: 'Medium', passenger_satisfaction: 'Low' },
          technicalSpecs: { maintenance_type: 'Line maintenance', certification: 'Required' },
          metrics: { delay_minutes: 240, cost_per_passenger: Math.round(8000 / passengers) },
          rotationPlan: { downstream_impact: 'Significant delays' }
        }
      ]
      break

    case 'crew':
      steps = [
        {
          step: 1,
          title: 'Crew Issue Reported',
          status: 'completed',
          timestamp: '10:30 AM',
          system: 'Crew Control',
          details: 'Crew duty time or availability issue identified',
          data: { issue_type: 'Duty time', crew_affected: '2' }
        }
      ]

      options = [
        {
          title: 'Standby Crew Activation',
          description: 'Deploy standby crew to operate the flight',
          cost: 'AED 12,000',
          timeline: '60-90 minutes',
          confidence: 85,
          impact: `${passengers} passengers minimal delay`,
          status: 'recommended',
          advantages: ['Quick resolution', 'Minimal passenger impact'],
          considerations: ['Standby crew availability', 'Positioning time'],
          resourceRequirements: { standby_crew: '2-4', transportation: 'Ground transport' },
          costBreakdown: { crew_costs: 'AED 8,000', transportation: 'AED 4,000' },
          timelineDetails: { crew_positioning: '45 minutes', briefing: '15 minutes' },
          riskAssessment: { availability_risk: 'Low', operational_risk: 'Low' },
          technicalSpecs: { crew_qualifications: 'Current on type', rest_requirements: 'Met' },
          metrics: { delay_minutes: 75, cost_per_passenger: Math.round(12000 / passengers) },
          rotationPlan: { original_crew: 'Removed from rotation' }
        }
      ]
      break

    case 'airport':
      steps = [
        {
          step: 1,
          title: 'Airport Disruption Notified',
          status: 'completed',
          timestamp: '09:15 AM',
          system: 'Airport Operations',
          details: 'Airport infrastructure or operational issue affecting flights',
          data: { airport: disruption.origin, issue_type: 'Runway closure' }
        }
      ]

      options = [
        {
          title: 'Alternative Airport Routing',
          description: 'Divert to alternative airport and arrange ground transport',
          cost: 'AED 35,000',
          timeline: '4-5 hours',
          confidence: 80,
          impact: `${passengers} passengers diverted`,
          status: 'recommended',
          advantages: ['Avoids airport closure', 'Maintains service'],
          considerations: ['Ground transport arrangements', 'Extended travel time'],
          resourceRequirements: { alternative_airport: '1', buses: '4-5', coordination: 'Ground handling' },
          costBreakdown: { diversion: 'AED 20,000', ground_transport: 'AED 15,000' },
          timelineDetails: { flight_time: '2 hours', ground_transport: '2-3 hours' },
          riskAssessment: { weather_risk: 'Low', logistics_risk: 'Medium' },
          technicalSpecs: { alternate_airport: 'Approved alternate', fuel_planning: 'Additional 2000kg' },
          metrics: { total_time: 300, cost_per_passenger: Math.round(35000 / passengers) },
          rotationPlan: { aircraft_positioning: 'Required back to base' }
        }
      ]
      break

    default:
      // Generic options for unknown disruption types
      steps = [
        {
          step: 1,
          title: 'Disruption Assessment',
          status: 'completed',
          timestamp: '12:00 PM',
          system: 'Operations Control',
          details: 'General disruption assessment and impact analysis',
          data: { type: disruption_type, severity: severity }
        }
      ]

      options = [
        {
          title: 'Standard Recovery Procedure',
          description: 'Apply standard recovery procedures based on disruption type',
          cost: 'AED 20,000',
          timeline: '2-3 hours',
          confidence: 75,
          impact: `${passengers} passengers affected`,
          status: 'recommended',
          advantages: ['Proven procedure', 'Balanced approach'],
          considerations: ['May not be optimal', 'Generic solution'],
          resourceRequirements: { operations_team: '3', coordination: 'Multiple departments' },
          costBreakdown: { operational: 'AED 15,000', contingency: 'AED 5,000' },
          timelineDetails: { assessment: '30 minutes', execution: '2-2.5 hours' },
          riskAssessment: { success_probability: 'Medium', impact: 'Medium' },
          technicalSpecs: { resources: 'Standard recovery resources' },
          metrics: { estimated_delay: 150, cost_per_passenger: Math.round(20000 / passengers) },
          rotationPlan: { impact_assessment: 'Under review' }
        }
      ]
  }

  return { options, steps }
}

// Export functions
export { generateRecoveryOptionsForDisruption }

// For backward compatibility, also export the steps function
export function generateRecoveryStepsForDisruption(disruption) {
  return generateRecoveryOptionsForDisruption(disruption).steps
}