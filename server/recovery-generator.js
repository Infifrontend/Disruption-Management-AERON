// Helper functions for disruption type mapping and recovery generation
const mapDisruptionTypeToCategory = (type, reason = "") => {
  const lowerType = type.toLowerCase();
  const lowerReason = reason.toLowerCase();

  if (
    lowerType.includes("technical") ||
    lowerType.includes("maintenance") ||
    lowerReason.includes("maintenance") ||
    lowerReason.includes("aog") ||
    lowerReason.includes("engine") ||
    lowerReason.includes("bird strike")
  ) {
    return "AIRCRAFT_ISSUE";
  }
  if (
    lowerType.includes("crew") ||
    lowerReason.includes("crew") ||
    lowerReason.includes("duty time") ||
    lowerReason.includes("sick")
  ) {
    return "CREW_ISSUE";
  }
  if (
    lowerType.includes("weather") ||
    lowerReason.includes("weather") ||
    lowerReason.includes("atc") ||
    lowerReason.includes("fog") ||
    lowerReason.includes("storm")
  ) {
    return "ATC_WEATHER";
  }
  if (
    lowerType.includes("curfew") ||
    lowerReason.includes("curfew") ||
    lowerReason.includes("congestion") ||
    lowerReason.includes("airport") ||
    lowerReason.includes("runway")
  ) {
    return "CURFEW_CONGESTION";
  }
  if (
    lowerType.includes("rotation") ||
    lowerReason.includes("rotation") ||
    lowerReason.includes("misalignment") ||
    lowerReason.includes("schedule")
  ) {
    return "ROTATION_MAINTENANCE";
  }

  return "AIRCRAFT_ISSUE"; // Default fallback
};

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
        amosRef: `AMOS-2025-${new Date().getMonth().toString().padStart(2, "0")}-${flight.aircraft?.slice(-3)}-001`,
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
    },
  ];

  const options = [
    {
      id: `AIRCRAFT_SWAP_${flight.aircraft?.slice(-3) || "001"}`,
      title: "Aircraft Swap - Immediate",
      description: "Replace with available standby aircraft",
      cost: "$22,800",
      timeline: "1.5-2 hours",
      confidence: 88,
      impact: "Minimal passenger disruption",
      status: "recommended",
      category: "Aircraft Issue",
      priority: 1,
      advantages: [
        "Fastest resolution with minimal delay",
        "Maintains schedule integrity",
        "Low passenger compensation cost",
        "Preserves network connectivity"
      ],
      considerations: [
        "Requires available spare aircraft",
        "Crew briefing and familiarization needed",
        "Gate coordination and positioning",
        "Passenger transfer logistics"
      ],
      resource_requirements: [
        {
          eta: "30 min",
          type: "Aircraft",
          status: "Standby",
          details: "Standby aircraft ready for immediate swap",
          location: "DXB",
          resource: "B737-800",
          availability: "Available"
        }
      ],
      cost_breakdown: [
        {
          amount: "$15,000",
          category: "Delay Costs",
          percentage: 66,
          description: "Passenger compensation and handling"
        },
        {
          amount: "$5,000",
          category: "Aircraft Swap",
          percentage: 22,
          description: "Cost of mobilizing standby aircraft"
        },
        {
          amount: "$2,800",
          category: "Logistics",
          percentage: 12,
          description: "Ground handling and coordination"
        }
      ],
      timeline_details: [
        {
          step: "Aircraft Preparation",
          status: "in-progress",
          details: "Prepare standby aircraft for operation",
          endTime: "09:00",
          duration: "30 min",
          startTime: "08:30"
        },
        {
          step: "Passenger Transfer",
          status: "pending",
          details: "Transfer passengers to new aircraft",
          endTime: "09:30",
          duration: "30 min",
          startTime: "09:00"
        },
        {
          step: "Crew Briefing",
          status: "pending",
          details: "Brief crew on updated schedule",
          endTime: "09:45",
          duration: "15 min",
          startTime: "09:30"
        },
        {
          step: "Departure Clearance",
          status: "pending",
          details: "Obtain clearance for takeoff",
          endTime: "10:00",
          duration: "15 min",
          startTime: "09:45"
        }
      ],
      risk_assessment: [
        {
          risk: "Operational delay",
          impact: "Low",
          riskScore: 2,
          mitigation: "Streamlined ground operations",
          probability: "Low"
        },
        {
          risk: "Passenger dissatisfaction",
          impact: "Low",
          riskScore: 3,
          mitigation: "Proactive communication and refreshments",
          probability: "Medium"
        }
      ],
      technical_specs: {
        weatherMinimums: [
          "Visibility: 1000m minimum",
          "Ceiling: 200ft minimum",
          "Wind: 25kt crosswind limit"
        ],
        alternateAirports: [
          "SHJ - Sharjah (45km)",
          "DWC - Al Maktoum (50km)"
        ],
        fuelConsiderations: [
          "Standard fuel load",
          "Contingency fuel: 1000kg"
        ]
      },
      metrics: {
        costEfficiency: 85,
        timeEfficiency: 90,
        passengerSatisfaction: 85,
        operationalComplexity: 60,
      },
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "A6-FEP",
            type: "B737-800 (189Y)",
            etops: { status: "available", value: "180min" },
            cabinMatch: { status: "exact", value: "Exact" },
            availability: "Available Now",
            assigned: { status: "none", value: "None" },
            turnaround: "40 min",
            maintenance: { status: "current", value: "Current" },
            recommended: true
          }
        ],
        crewData: [
          {
            name: "Capt. Mohammed Al-Blooshi",
            role: "Captain",
            type: "B737 Type Rating",
            status: "Available",
            issue: null
          },
          {
            name: "FO Noor Al-Hosani",
            role: "First Officer",
            type: "B737/MAX Type Rating",
            status: "Available",
            issue: null
          }
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Compatible",
            details: "All gates compatible with B737-800"
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "New departure slot needed"
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits"
          }
        }
      }
    },
    {
      id: `DELAY_REPAIR_${flight.aircraft?.slice(-3) || "002"}`,
      title: "Delay for Repair Completion",
      description: "Wait for hydraulics system repair",
      cost: "$48,960",
      timeline: "4-6 hours",
      confidence: 45,
      impact: "Significant passenger disruption",
      status: "caution",
      category: "Aircraft Issue",
      priority: 1,
      advantages: [
        "Uses original aircraft",
        "No crew changes needed",
        "Maintains aircraft rotation integrity",
        "Lower operational complexity"
      ],
      considerations: [
        "Extended delay period with passenger impact",
        "Risk of repair time overrun",
        "Crew duty time approaching limits",
        "Potential downstream flight disruptions"
      ],
      resource_requirements: [
        {
          eta: "3 hours",
          type: "Maintenance Crew",
          status: "Dispatched",
          details: "Specialized team addressing hydraulics issue",
          location: "DXB",
          resource: "B737 Maintenance Team",
          availability: "Available"
        }
      ],
      cost_breakdown: [
        {
          amount: "$30,000",
          category: "Delay Costs",
          percentage: 61,
          description: "Passenger compensation and accommodation"
        },
        {
          amount: "$15,000",
          category: "Maintenance",
          percentage: 31,
          description: "Hydraulics system repair costs"
        },
        {
          amount: "$3,960",
          category: "Crew Overtime",
          percentage: 8,
          description: "Extended duty compensation"
        }
      ],
      timeline_details: [
        {
          step: "Hydraulics Assessment",
          status: "in-progress",
          details: "Diagnosing hydraulics system issue",
          endTime: "10:00",
          duration: "60 min",
          startTime: "09:00"
        },
        {
          step: "Repair Execution",
          status: "pending",
          details: "Perform hydraulics system repair",
          endTime: "12:30",
          duration: "150 min",
          startTime: "10:00"
        },
        {
          step: "Safety Checks",
          status: "pending",
          details: "Conduct post-repair safety inspections",
          endTime: "13:30",
          duration: "60 min",
          startTime: "12:30"
        },
        {
          step: "Departure Clearance",
          status: "pending",
          details: "Obtain clearance for takeoff",
          endTime: "14:00",
          duration: "30 min",
          startTime: "13:30"
        }
      ],
      risk_assessment: [
        {
          risk: "Extended repair time",
          impact: "High",
          riskScore: 5,
          mitigation: "Deploy additional maintenance resources",
          probability: "High"
        },
        {
          risk: "Passenger dissatisfaction",
          impact: "High",
          riskScore: 6,
          mitigation: "Provide accommodations and compensation",
          probability: "High"
        }
      ],
      technical_specs: {
        weatherMinimums: [
          "Visibility: 1000m minimum",
          "Ceiling: 200ft minimum",
          "Wind: 25kt crosswind limit"
        ],
        alternateAirports: [
          "SHJ - Sharjah (45km)",
          "DWC - Al Maktoum (50km)"
        ],
        fuelConsiderations: [
          "Standard fuel load",
          "Contingency fuel: 1200kg"
        ]
      },
      metrics: {
        costEfficiency: 70,
        timeEfficiency: 60,
        passengerSatisfaction: 50,
        operationalComplexity: 70,
      }
    },
    {
      id: `CANCEL_REBOOK_${flight.flightNumber?.slice(-3) || "003"}`,
      title: "Cancel and Rebook",
      description: "Cancel and rebook on partner airlines",
      cost: "$141,440",
      timeline: "0-1 hours",
      confidence: 75,
      impact: "Complete route cancellation",
      status: "warning",
      category: "Aircraft Issue",
      priority: 1,
      advantages: [
        "Immediate decision eliminates uncertainty",
        "No technical repair risks",
        "Fastest initial response time",
        "Preserves aircraft for other operations"
      ],
      considerations: [
        "Highest passenger impact and compensation",
        "Complete revenue loss for flight",
        "Partner airline capacity dependency",
        "Complex rebooking coordination required"
      ],
      resource_requirements: [
        {
          eta: "Immediate",
          type: "Partner Airlines",
          status: "Available",
          details: "Coordinate with partner airlines for rebooking",
          location: "DXB",
          resource: "Partner Airline Capacity",
          availability: "Available"
        }
      ],
      cost_breakdown: [
        {
          amount: "$100,000",
          category: "Rebooking Costs",
          percentage: 71,
          description: "Cost of rebooking on partner airlines"
        },
        {
          amount: "$30,000",
          category: "Passenger Compensation",
          percentage: 21,
          description: "Compensation for cancellation"
        },
        {
          amount: "$11,440",
          category: "Logistics",
          percentage: 8,
          description: "Coordination and communication costs"
        }
      ],
      timeline_details: [
        {
          step: "Cancellation Notification",
          status: "in-progress",
          details: "Inform passengers of flight cancellation",
          endTime: "09:00",
          duration: "15 min",
          startTime: "08:45"
        },
        {
          step: "Partner Coordination",
          status: "pending",
          details: "Arrange seats with partner airlines",
          endTime: "09:30",
          duration: "30 min",
          startTime: "09:00"
        },
        {
          step: "Passenger Rebooking",
          status: "pending",
          details: "Rebook passengers on new flights",
          endTime: "09:45",
          duration: "15 min",
          startTime: "09:30"
        },
        {
          step: "Final Confirmation",
          status: "pending",
          details: "Confirm rebooking and notify passengers",
          endTime: "10:00",
          duration: "15 min",
          startTime: "09:45"
        }
      ],
      risk_assessment: [
        {
          risk: "Limited partner capacity",
          impact: "High",
          riskScore: 4,
          mitigation: "Engage multiple partner airlines",
          probability: "Medium"
        },
        {
          risk: "Passenger dissatisfaction",
          impact: "High",
          riskScore: 5,
          mitigation: "Offer compensation and priority rebooking",
          probability: "High"
        }
      ],
      technical_specs: {
        weatherMinimums: [
          "Visibility: 1000m minimum",
          "Ceiling: 200ft minimum",
          "Wind: 25kt crosswind limit"
        ],
        alternateAirports: [
          "SHJ - Sharjah (45km)",
          "DWC - Al Maktoum (50km)"
        ],
        fuelConsiderations: [
          "No fuel required",
          "No contingency fuel needed"
        ]
      },
      metrics: {
        costEfficiency: 60,
        timeEfficiency: 95,
        passengerSatisfaction: 40,
        operationalComplexity: 90,
      }
    },
  ];

  return { options, steps };
};

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
    },
  ];

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
      advantages: [
        "Standby crew immediately available",
        "Within all regulatory duty time limits",
      ],
      considerations: [
        "Extended briefing required",
        "Standby crew pay activation costs",
      ],
      metrics: {
        totalCost: 8500,
        otpScore: 92,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 100,
        regulatoryRisk: "Low",
        delayMinutes: 30,
        confidenceScore: 92,
        networkImpact: "Low",
      },
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
      advantages: [
        "Uses original qualified crew",
        "Full regulatory compliance",
      ],
      considerations: [
        "3-hour minimum delay",
        "High passenger compensation liability",
      ],
      metrics: {
        totalCost: 45000,
        otpScore: 65,
        aircraftSwaps: 0,
        crewViolations: 1,
        paxAccommodated: 85,
        regulatoryRisk: "Medium",
        delayMinutes: 180,
        confidenceScore: 65,
        networkImpact: "Medium",
      },
    },
  ];

  return { options, steps };
};

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
    },
  ];

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
      advantages: [
        "Weather forecast shows improvement",
        "All connections protected",
      ],
      considerations: [
        "Dependent on weather improvement",
        "Crew duty time monitoring",
      ],
      metrics: {
        totalCost: 25000,
        otpScore: 80,
        aircraftSwaps: 0,
        crewViolations: 0,
        paxAccommodated: 95,
        regulatoryRisk: "Low",
        delayMinutes: 150,
        confidenceScore: 90,
        networkImpact: "Low",
      },
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
      advantages: [
        "Immediate resolution",
        "Weather exemption from compensation",
      ],
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
        networkImpact: "Low",
      },
    },
  ];

  return { options, steps };
};

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
    },
  ];

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
      advantages: [
        "Arrive before curfew",
        "Zero passenger rebooking",
        "Significant cost savings",
      ],
      considerations: [
        "Other flight delayed by 60 minutes",
        "Quick crew coordination needed",
      ],
      metrics: {
        totalCost: 45000,
        otpScore: 88,
        aircraftSwaps: 1,
        crewViolations: 0,
        paxAccommodated: 100,
        regulatoryRisk: "Low",
        delayMinutes: 45,
        confidenceScore: 92,
        networkImpact: "Medium",
      },
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
        networkImpact: "High",
      },
    },
  ];

  return { options, steps };
};

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
    },
  ];

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
      advantages: [
        "Alternative aircraft immediately available",
        "Zero passenger impact",
      ],
      considerations: [
        "Alternative flight delayed 60 minutes",
        "Crew briefing for aircraft change",
      ],
      metrics: {
        totalCost: 75000,
        otpScore: 85,
        aircraftSwaps: 1,
        crewViolations: 0,
        paxAccommodated: 100,
        regulatoryRisk: "Low",
        delayMinutes: 90,
        confidenceScore: 88,
        networkImpact: "Low",
      },
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
      advantages: [
        "Original aircraft maintained",
        "Maintenance completed properly",
      ],
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
        networkImpact: "High",
      },
    },
  ];

  return { options, steps };
};

// Recovery generator for different disruption types based on category
export function generateRecoveryOptionsForDisruption(disruption, categoryInfo = null) {
  if (!disruption) {
    console.error("No disruption provided to generator");
    return { options: [], steps: [] };
  }

  // Validate required fields and provide fallbacks
  if (!disruption.flight_number && !disruption.flightNumber) {
    console.error("Disruption missing flight_number:", disruption);
    return { options: [], steps: [] };
  }

  // Normalize field names
  const flightNumber = disruption.flight_number || disruption.flightNumber;
  const categoryId = disruption.category_id;
  const categoryCode = categoryInfo?.category_code || mapDisruptionTypeToCategory(
    disruption.disruption_type || disruption.disruptionType || disruption.type || "Technical",
    disruption.disruption_reason || "Unknown"
  );

  // Set defaults for missing fields
  const safeDisruption = {
    ...disruption,
    flight_number: flightNumber,
    category_id: categoryId,
    category_code: categoryCode,
    severity: disruption.severity || "Medium",
    passengers: disruption.passengers || 150,
    aircraft: disruption.aircraft || "Unknown",
    delay_minutes: disruption.delay_minutes || disruption.delay || 0,
    origin: disruption.origin || "DXB",
    destination: disruption.destination || "Unknown",
  };

  console.log(
    `Generating recovery options for flight ${safeDisruption.flight_number}, category: ${categoryCode}`,
  );

  let options = [];
  let steps = [];

  // Generate options based on category code
  switch (categoryCode) {
    case "ATC_WEATHER":
      steps = [
        {
          step: 1,
          title: "Weather Trigger Received",
          status: "completed",
          timestamp: "12:30 PM",
          system: "Weather Monitoring",
          details: `Severe weather alert received for ${safeDisruption.origin} airport`,
          data: { severity: safeDisruption.severity, impact: "High" },
        },
        {
          step: 2,
          title: "Impact Assessment",
          status: "completed",
          timestamp: "12:35 PM",
          system: "AERON System",
          details: "Analyzing weather impact on flight operations",
          data: { expectedDelay: safeDisruption.delay_minutes || 120 },
        },
        {
          step: 3,
          title: "Recovery Options Generation",
          status: "completed",
          timestamp: "12:40 PM",
          system: "Recovery Engine",
          details: "Generating optimal recovery strategies",
          data: { optionsCount: 3 },
        },
        {
          step: 4,
          title: "Resource Availability Check",
          status: "standby",
          timestamp: "12:45 PM",
          system: "Resource Manager",
          details: "Checking aircraft and crew availability",
          data: { resourceStatus: "checking" },
        },
      ];

      options = [
        {
          title: "Weather Delay with Re-routing",
          description:
            "Wait for weather conditions to improve with alternate routing",
          cost: "$12,500",
          timeline: "2-3 hours",
          confidence: 85,
          impact: "Medium delay impact",
          status: "recommended",
          priority: 1,
          advantages: [
            "Maintains original aircraft",
            "Lower cost option",
            "High success probability",
          ],
          considerations: [
            "Weather dependency",
            "Potential for further delays",
            "Passenger accommodation required",
          ],
          resourceRequirements: [
            {
              type: "Aircraft",
              resource: safeDisruption.aircraft || "A6-FDZ",
              availability: "Available",
              status: "On ground",
              location: "DXB",
              eta: "Immediate",
              details: "Original aircraft available",
            },
          ],
          costBreakdown: [
            {
              category: "Delay Costs",
              amount: "$8,500",
              percentage: 68,
              description: "Passenger compensation and handling",
            },
            {
              category: "Fuel & Operations",
              amount: "$2,500",
              percentage: 20,
              description: "Additional fuel for re-routing",
            },
            {
              category: "Crew Overtime",
              amount: "$1,500",
              percentage: 12,
              description: "Extended duty time compensation",
            },
          ],
          timelineDetails: [
            {
              step: "Weather Monitoring",
              duration: "30 min",
              startTime: "12:30",
              endTime: "13:00",
              details: "Continuous weather tracking",
              status: "in-progress",
            },
            {
              step: "Route Planning",
              duration: "45 min",
              startTime: "13:00",
              endTime: "13:45",
              details: "Alternate route calculation",
              status: "pending",
            },
            {
              step: "Passenger Notification",
              duration: "15 min",
              startTime: "13:45",
              endTime: "14:00",
              details: "Inform passengers of delay",
              status: "pending",
            },
            {
              step: "Departure Clearance",
              duration: "30 min",
              startTime: "14:00",
              endTime: "14:30",
              details: "Weather clearance and takeoff",
              status: "pending",
            },
          ],
          riskAssessment: [
            {
              risk: "Weather deterioration",
              probability: "Low",
              impact: "High",
              riskScore: 2,
              mitigation: "Continuous monitoring with backup plans ready",
            },
            {
              risk: "Passenger dissatisfaction",
              probability: "Medium",
              impact: "Medium",
              riskScore: 4,
              mitigation: "Proactive communication and compensation",
            },
          ],
          technicalSpecs: {
            weatherMinimums: [
              "Visibility: 1000m minimum",
              "Ceiling: 200ft minimum",
              "Wind: 25kt crosswind limit",
            ],
            alternateAirports: [
              "SHJ - Sharjah (45km)",
              "AUH - Abu Dhabi (120km)",
            ],
            fuelConsiderations: [
              "Additional 800kg for alternate routing",
              "Weather contingency fuel: 1200kg",
            ],
          },
          metrics: {
            costEfficiency: 92,
            timeEfficiency: 78,
            passengerSatisfaction: 75,
          },
          rotationPlan: {
            nextFlight: "FZ456",
            impact: "Minimal",
            adjustments: "None required",
          },
        },
        {
          title: "Aircraft Swap",
          description: "Switch to available aircraft to avoid weather delays",
          cost: "$18,750",
          timeline: "1-2 hours",
          confidence: 75,
          impact: "Moderate operational complexity",
          status: "caution",
          priority: 2,
          advantages: [
            "Faster departure",
            "Weather avoidance",
            "Network protection",
          ],
          considerations: [
            "Higher operational cost",
            "Aircraft availability dependent",
          ],
          resourceRequirements: [
            {
              type: "Aircraft",
              resource: "A6-FED",
              availability: "Available 14:30",
              status: "Maintenance complete",
              location: "DXB",
              eta: "14:30",
              details: "B737-800 ready for service",
            },
          ],
          costBreakdown: [
            {
              category: "Aircraft Positioning",
              amount: "$12,000",
              percentage: 64,
              description: "Aircraft swap and positioning costs",
            },
            {
              category: "Passenger Handling",
              amount: "$4,250",
              percentage: 23,
              description: "Gate change and boarding",
            },
            {
              category: "Crew Coordination",
              amount: "$2,500",
              percentage: 13,
              description: "Crew briefing and preparation",
            },
          ],
        },
        {
          title: "Flight Cancellation with Rebooking",
          description: `Cancel ${safeDisruption.flight_number} and rebook passengers on next available flights`,
          cost: "$45,200",
          timeline: "4-6 hours",
          confidence: 95,
          impact: "High passenger impact",
          status: "warning",
          priority: 3,
          advantages: [
            "Guaranteed resolution",
            "Network stability",
            "Crew rest compliance",
          ],
          considerations: [
            "High passenger compensation",
            "Reputation impact",
            "Hotel costs",
          ],
          resourceRequirements: [
            {
              type: "Passenger Services",
              resource: "Rebooking Team",
              availability: "Available",
              status: "On standby",
              location: "DXB T2",
              eta: "Immediate",
              details: "6 agents available for rebooking",
            },
          ],
          costBreakdown: [
            {
              category: "EU261 Compensation",
              amount: "$28,200",
              percentage: 62,
              description: "€600 per passenger compensation",
            },
            {
              category: "Hotel & Meals",
              amount: "$12,500",
              percentage: 28,
              description: "Overnight accommodation",
            },
            {
              category: "Rebooking Costs",
              amount: "$4,500",
              percentage: 10,
              description: "Alternative flight arrangements",
            },
          ],
        },
      ];
      break;

    case "AIRCRAFT_ISSUE":
      steps = [
        {
          step: 1,
          title: "Technical Issue Reported",
          status: "completed",
          timestamp: "11:15 AM",
          system: "Maintenance System",
          details:
            "Aircraft technical fault identified during pre-flight check",
          data: { faultCode: "HYD-001", severity: safeDisruption.severity },
        },
        {
          step: 2,
          title: "Maintenance Assessment",
          status: "completed",
          timestamp: "11:30 AM",
          system: "Engineering",
          details: "Technical assessment completed - AOG situation",
          data: { estimatedRepairTime: "4-6 hours" },
        },
        {
          step: 3,
          title: "Alternative Solutions Analysis",
          status: "completed",
          timestamp: "11:45 AM",
          system: "AERON System",
          details: "Analyzing aircraft swap and passenger rebooking options",
          data: { alternativeAircraft: 2, rebookingOptions: 3 },
        },
        {
          step: 4,
          title: "Resource Coordination",
          status: "standby",
          timestamp: "12:00 PM",
          system: "Operations Control",
          details: "Coordinating replacement aircraft and crew",
          data: { status: "in-progress" },
        },
      ];

      options = [
        {
          title: "Aircraft Swap - Immediate",
          description: "Replace with available standby aircraft",
          cost: "$22,800",
          timeline: "1.5-2 hours",
          confidence: 88,
          impact: "Minimal passenger disruption",
          status: "recommended",
          priority: 1,
        },
        {
          title: "Maintenance Repair",
          description: "Complete repairs on original aircraft",
          cost: "$35,400",
          timeline: "4-6 hours",
          confidence: 65,
          impact: "Significant delay impact",
          status: "caution",
          priority: 2,
        },
        {
          title: "Passenger Reaccommodation",
          description: "Distribute passengers across multiple flights",
          cost: "$52,100",
          timeline: "2-8 hours",
          confidence: 90,
          impact: "High passenger service impact",
          status: "warning",
          priority: 3,
        },
      ];
      break;

    case "CREW_ISSUE":
      steps = [
        {
          step: 1,
          title: "Crew Issue Identified",
          status: "completed",
          timestamp: "10:45 AM",
          system: "Crew Management",
          details: "Crew duty time limitation identified",
          data: { crewMember: "Captain", issue: "Duty time breach" },
        },
        {
          step: 2,
          title: "Replacement Crew Search",
          status: "completed",
          timestamp: "11:00 AM",
          system: "Crew Scheduling",
          details: "Searching for qualified replacement crew",
          data: { availableCrew: 2, qualificationMatch: "Type rated" },
        },
        {
          step: 3,
          title: "Crew Positioning",
          status: "standby",
          timestamp: "11:15 AM",
          system: "Ground Operations",
          details: "Arranging crew transportation to aircraft",
          data: { eta: "45 minutes" },
        },
      ];

      options = [
        {
          title: "Standby Crew Activation",
          description: "Deploy qualified standby crew members",
          cost: "$8,500",
          timeline: "45-60 minutes",
          confidence: 92,
          impact: "Minimal operational impact",
          status: "recommended",
          priority: 1,
        },
        {
          title: "Deadhead Crew",
          description: "Position qualified Captain",
          cost: "$25,200",
          timeline: "120 minutes",
          confidence: 85,
          impact: "Moderate schedule delay",
          status: "caution",
          priority: 2,
        },
        {
          title: "Crew Rest Extension",
          description: "Delay flight to comply with duty time regulations",
          cost: "$15,200",
          timeline: "3-4 hours",
          confidence: 78,
          impact: "Moderate delay impact",
          status: "caution",
          priority: 3,
        },
      ];
      break;

    case "CURFEW_CONGESTION":
      steps = [
        {
          step: 1,
          title: "Airport Disruption Notified",
          status: "completed",
          timestamp: "09:15 AM",
          system: "Airport Operations",
          details:
            "Airport infrastructure or operational issue affecting flights",
          data: {
            airport: safeDisruption.origin,
            issue_type: "Runway closure",
          },
        },
      ];

      options = [
        {
          title: "Alternative Airport Routing",
          description:
            "Divert to alternative airport and arrange ground transport",
          cost: "AED 35,000",
          timeline: "4-5 hours",
          confidence: 80,
          impact: `${safeDisruption.passengers} passengers diverted`,
          status: "recommended",
          advantages: ["Avoids airport closure", "Maintains service"],
          considerations: [
            "Ground transport arrangements",
            "Extended travel time",
          ],
          resourceRequirements: {
            alternative_airport: "1",
            buses: "4-5",
            coordination: "Ground handling",
          },
          costBreakdown: {
            diversion: "AED 20,000",
            ground_transport: "AED 15,000",
          },
          timelineDetails: {
            flight_time: "2 hours",
            ground_transport: "2-3 hours",
          },
          riskAssessment: { weather_risk: "Low", logistics_risk: "Medium" },
          technicalSpecs: {
            alternate_airport: "Approved alternate",
            fuel_planning: "Additional 2000kg",
          },
          metrics: {
            total_time: 300,
            cost_per_passenger: Math.round(35000 / safeDisruption.passengers),
          },
          rotationPlan: { aircraft_positioning: "Required back to base" },
        },
      ];
      break;

    case "ROTATION_MAINTENANCE":
      steps = [
        {
          step: 1,
          title: "Maintenance Hold Identified",
          status: "completed",
          timestamp: "11:30 AM",
          system: "Maintenance System",
          details: "Aircraft maintenance extended beyond scheduled window",
          data: { maintenanceType: "Line Check", delay: "3 hours extension" },
        },
        {
          step: 2,
          title: "Alternative Aircraft Search",
          status: "completed",
          timestamp: "11:45 AM",
          system: "Fleet Management",
          details: "Searching for available alternative aircraft",
          data: { availableAircraft: 2, matchingType: true },
        },
        {
          step: 3,
          title: "Rotation Impact Analysis",
          status: "completed",
          timestamp: "12:00 PM",
          system: "AERON System",
          details: "Analyzing downstream rotation effects",
          data: { affectedFlights: 3, cascadeDelay: "90 minutes" },
        },
      ];

      options = [
        {
          title: "Aircraft Rotation Swap",
          description: "Reassign aircraft from another rotation to maintain schedule",
          cost: "AED 75,000",
          timeline: "90 minutes",
          confidence: 88,
          impact: "Minimal network disruption",
          status: "recommended",
          priority: 1,
          category: "Rotation/Maintenance",
          advantages: [
            "Alternative aircraft immediately available",
            "Zero passenger impact on this flight",
            "Maintains original crew assignment",
            "Preserves schedule integrity"
          ],
          considerations: [
            "Alternative flight delayed by 60 minutes",
            "Crew briefing required for aircraft change",
            "Ground coordination needed",
            "Potential cascade effects"
          ],
        },
        {
          title: "Accept Cascade Delays",
          description: "Wait for original aircraft maintenance completion",
          cost: "AED 150,000",
          timeline: "3 hours",
          confidence: 70,
          impact: "Multiple flight delays",
          status: "caution",
          priority: 2,
          category: "Rotation/Maintenance",
          advantages: [
            "Original aircraft maintained in rotation",
            "Maintenance completed properly",
            "No crew changes required"
          ],
          considerations: [
            "3-hour delay cascade to multiple flights",
            "High passenger compensation costs",
            "Network disruption impact"
          ],
        },
      ];
      break;

    default:
      console.log(
        `Handling unknown category: ${categoryCode}, generating comprehensive options`,
      );

      // Generate multiple options for any disruption type
      options = [
        {
          title: "Immediate Recovery Action",
          description: `Address ${safeDisruption.disruption_type} disruption with priority response for ${safeDisruption.flight_number}`,
          cost: "AED 25,000",
          timeline: "60 minutes",
          confidence: 85,
          impact: "Low",
          status: "generated",
          priority: 1,
          advantages: [
            "Quick resolution",
            "Minimal passenger impact",
            "Maintains schedule integrity",
          ],
          considerations: [
            "Requires immediate resource allocation",
            "Higher operational cost",
          ],
          resourceRequirements: [
            "Operations team",
            "Ground crew",
            "Customer service",
          ],
          costBreakdown: {
            operations: 15000,
            crew: 5000,
            passenger_services: 5000,
          },
          timelineDetails: [
            {
              phase: "Assessment",
              duration: "10 min",
              description: "Evaluate situation and options",
            },
            {
              phase: "Resource allocation",
              duration: "20 min",
              description: "Assign teams and equipment",
            },
            {
              phase: "Execution",
              duration: "30 min",
              description: "Implement recovery plan",
            },
          ],
          riskAssessment: {
            operational: "Low",
            financial: "Medium",
            passenger: "Low",
          },
          technicalSpecs: {
            aircraft_required: safeDisruption.aircraft,
            crew_required: 6,
          },
          metrics: {
            passenger_impact_score: 15,
            cost_efficiency: 85,
            time_efficiency: 90,
          },
        },
        {
          title: "Alternative Recovery Approach",
          description: `Secondary recovery option for ${safeDisruption.flight_number} with resource optimization`,
          cost: "AED 18,000",
          timeline: "90 minutes",
          confidence: 80,
          impact: "Medium",
          status: "generated",
          priority: 2,
          advantages: [
            "Cost-effective",
            "Resource efficient",
            "Proven approach",
          ],
          considerations: ["Longer timeline", "May affect downstream flights"],
          resourceRequirements: ["Operations team", "Maintenance crew"],
          costBreakdown: {
            operations: 10000,
            maintenance: 5000,
            logistics: 3000,
          },
          timelineDetails: [
            {
              phase: "Planning",
              duration: "20 min",
              description: "Detailed recovery planning",
            },
            {
              phase: "Preparation",
              duration: "30 min",
              description: "Resource preparation",
            },
            {
              phase: "Implementation",
              duration: "40 min",
              description: "Execute recovery plan",
            },
          ],
          riskAssessment: {
            operational: "Medium",
            financial: "Low",
            passenger: "Medium",
          },
          technicalSpecs: {
            aircraft_required: safeDisruption.aircraft,
            crew_required: 6,
          },
          metrics: {
            passenger_impact_score: 25,
            cost_efficiency: 90,
            time_efficiency: 75,
          },
        },
        {
          title: "Contingency Recovery Plan",
          description: `Backup recovery solution for ${safeDisruption.flight_number} if primary options fail`,
          cost: "AED 35,000",
          timeline: "120 minutes",
          confidence: 95,
          impact: "High",
          status: "generated",
          priority: 3,
          advantages: [
            "Guaranteed solution",
            "Comprehensive coverage",
            "High success rate",
          ],
          considerations: [
            "Higher cost",
            "Extended timeline",
            "Significant resource commitment",
          ],
          resourceRequirements: [
            "Senior operations team",
            "Multiple crew sets",
            "Customer service team",
          ],
          costBreakdown: {
            operations: 20000,
            crew: 10000,
            passenger_services: 5000,
          },
          timelineDetails: [
            {
              phase: "Comprehensive assessment",
              duration: "30 min",
              description: "Full situation analysis",
            },
            {
              phase: "Resource mobilization",
              duration: "45 min",
              description: "Deploy all necessary resources",
            },
            {
              phase: "Recovery execution",
              duration: "45 min",
              description: "Full recovery implementation",
            },
          ],
          riskAssessment: {
            operational: "Low",
            financial: "High",
            passenger: "Low",
          },
          technicalSpecs: {
            aircraft_required: "Backup available",
            crew_required: 12,
          },
          metrics: {
            passenger_impact_score: 40,
            cost_efficiency: 60,
            time_efficiency: 65,
          },
        },
      ];

      steps = [
        {
          step: 1,
          title: "Disruption Assessment",
          status: "pending",
          timestamp: "15 minutes",
          system: "Operations Control Center",
          details: `Comprehensive assessment of ${safeDisruption.disruption_type} disruption affecting ${safeDisruption.flight_number}`,
          data: {
            priority: "High",
            resources_needed: ["Operations team", "Technical team"],
          },
        },
        {
          step: 2,
          title: "Resource Coordination",
          status: "pending",
          timestamp: "25 minutes",
          system: "Resource Management",
          details: `Coordinate required resources including crew, aircraft, and ground services for ${safeDisruption.passengers} passengers`,
          data: {
            passengers: safeDisruption.passengers,
            aircraft: safeDisruption.aircraft,
          },
        },
        {
          step: 3,
          title: "Passenger Communication",
          status: "pending",
          timestamp: "20 minutes",
          system: "Customer Service",
          details: `Notify passengers about disruption and recovery plan for flight ${safeDisruption.flight_number}`,
          data: {
            notification_methods: ["SMS", "Email", "Airport announcements"],
          },
        },
        {
          step: 4,
          title: "Recovery Implementation",
          status: "pending",
          timestamp: "45 minutes",
          system: "Ground Operations",
          details: `Execute selected recovery option with full operational support`,
          data: {
            expected_delay: safeDisruption.delay_minutes,
            recovery_type: disruptionType,
          },
        },
        {
          step: 5,
          title: "Situation Monitoring",
          status: "pending",
          timestamp: "30 minutes",
          system: "Operations Control Center",
          details: `Monitor recovery progress and adjust plan as needed`,
          data: {
            monitoring_frequency: "5 minutes",
            escalation_threshold: "15 minutes",
          },
        },
      ];
      break;
  }

  console.log(
    `Generated ${options.length} options and ${steps.length} steps for disruption type: ${disruptionType}`,
  );
  return { options, steps };
}

// For backward compatibility, also export the steps function
export function generateRecoveryStepsForDisruption(disruption) {
  return generateRecoveryOptionsForDisruption(disruption).steps;
}