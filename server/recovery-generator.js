import config from "./config/airlineConfig.js"
// File system imports removed - using embedded data instead
// available crew dummy information
const availableDummyCrew = [
  {
    name: "Capt. James Walker",
    role_code: "CAPT",
    role: "Captain",
    qualifications: [
      {
        code: "B737",
        name: "Boeing 737"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 18,
    base: "LHR",
    languages: [
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}141`,
        origin_code: "LHR",
        destination_code: "DXB",
        origin: "London Heathrow",
        destination: "Dubai",
        departure: "2025-09-10T07:30:00+01:00",
        arrival: "2025-09-10T15:30:00+04:00",
        delay: "On Time",
        passengers: 178,
        status: "On Time",
        impact: "High Impact",
        reason: "Primary PIC — replacement required, flight will be delayed or cancelled without a qualified Captain."
      }
    ]
  },
  {
    name: "Capt. Ravi Sharma",
    role_code: "CAPT",
    role: "Captain",
    qualifications: [
      {
        code: "B737",
        name: "Boeing 737"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 15,
    base: "DEL",
    languages: [
      "English",
      "Hindi"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}431`,
        origin_code: "DEL",
        destination_code: "DXB",
        origin: "Delhi",
        destination: "Dubai",
        departure: "2025-09-10T09:00:00+05:30",
        arrival: "2025-09-10T11:30:00+04:00",
        delay: "15 min",
        passengers: 164,
        status: "Delayed",
        impact: "High Impact",
        reason: "Primary PIC removed — replacement required, departure may be delayed while finding a qualified Captain."
      }
    ]
  },
  {
    name: "Capt. Elena Petrova",
    role_code: "CAPT",
    role: "Captain",
    qualifications: [
      {
        code: "B737",
        name: "Boeing 737"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 13,
    base: "DME",
    languages: [
      "Russian",
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}178`,
        origin_code: "JFK",
        destination_code: "DXB",
        origin: "New York JFK",
        destination: "Dubai",
        departure: "2025-09-10T12:00:00-04:00",
        arrival: "2025-09-11T09:00:00+04:00",
        delay: "30 min",
        passengers: 182,
        status: "Delayed",
        impact: "High Impact",
        reason: "Primary PIC — replacement required, long-haul pairing means downstream duties will also be affected."
      }
    ]
  },
  {
    name: "FO Michael Adams",
    role_code: "FO",
    role: "First officer",
    qualifications: [
      {
        code: "B737M",
        name: "Boeing 737 MAX"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 8,
    base: "JFK",
    languages: [
      "English",
      "Spanish"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}523`,
        origin_code: "DXB",
        destination_code: "DOH",
        origin: "Dubai",
        destination: "Doha",
        departure: "2025-09-10T11:00:00+04:00",
        arrival: "2025-09-10T11:50:00+03:00",
        delay: "On Time",
        passengers: 156,
        status: "On Time",
        impact: "High Impact",
        reason: "Primary FO removed — flight cannot legally depart without a qualified First Officer unless a reserve is available at origin."
      },
      {
        flightNumber: `${config.code || 'FZ'}524`,
        origin_code: "DOH",
        destination_code: "DXB",
        origin: "Doha",
        destination: "Dubai",
        departure: "2025-09-10T13:30:00+03:00",
        arrival: "2025-09-10T15:30:00+04:00",
        delay: "10 min",
        passengers: 149,
        status: "Delayed",
        impact: "Medium Impact",
        reason: "Subsequent leg may be covered by a reserve FO, possible delay if replacement is not available quickly."
      }
    ]
  },
  {
    name: "FO Hannah Lee",
    role_code: "FO",
    role: "First officer",
    qualifications: [
      {
        code: "B737M",
        name: "Boeing 737 MAX"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 6,
    base: "ICN",
    languages: [
      "Korean",
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}821`,
        origin_code: "HND",
        destination_code: "DXB",
        origin: "Tokyo Haneda",
        destination: "Dubai",
        departure: "2025-09-10T14:00:00+09:00",
        arrival: "2025-09-10T21:00:00+04:00",
        delay: "20 min",
        passengers: 172,
        status: "Delayed",
        impact: "High Impact",
        reason: "Primary FO removed — replacement required at origin, long sector increases risk to downstream schedule."
      }
    ]
  },
  {
    name: "FO Ahmed Nasser",
    role_code: "FO",
    role: "First officer",
    qualifications: [
      {
        code: "B737M",
        name: "Boeing 737 MAX"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 7,
    base: "DXB",
    languages: [
      "Arabic",
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}523`,
        origin_code: "DXB",
        destination_code: "DOH",
        origin: "Dubai",
        destination: "Doha",
        departure: "2025-09-10T11:00:00+04:00",
        arrival: "2025-09-10T11:50:00+03:00",
        delay: "On Time",
        passengers: 156,
        status: "On Time",
        impact: "High Impact",
        reason: "Primary FO removed — replacement required at origin, immediate impact to departure."
      },
      {
        flightNumber: `${config.code || 'FZ'}524`,
        origin_code: "DOH",
        destination_code: "DXB",
        origin: "Doha",
        destination: "Dubai",
        departure: "2025-09-10T13:30:00+03:00",
        arrival: "2025-09-10T15:30:00+04:00",
        delay: "10 min",
        passengers: 149,
        status: "Delayed",
        impact: "Medium Impact",
        reason: "Turnaround dependent — may be covered by reserve FO, risk of knock-on delays."
      }
    ]
  },
  {
    name: "SSCC Grace Thompson",
    role_code: "SCC",
    role: "Senior cabin crew",
    qualifications: [
      {
        code: "SCC",
        name: "Senior Cabin Crew"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 12,
    base: "LHR",
    languages: [
      "English",
      "French"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}141`,
        origin_code: "LHR",
        destination_code: "DXB",
        origin: "London Heathrow",
        destination: "Dubai",
        departure: "2025-09-10T07:30:00+01:00",
        arrival: "2025-09-10T15:30:00+04:00",
        delay: "On Time",
        passengers: 178,
        status: "On Time",
        impact: "Medium Impact",
        reason: "Senior cabin crew removal affects service and leadership on board, replacement or reallocation required."
      }
    ]
  },
  {
    name: "SSCC Pedro Alvarez",
    role_code: "SCC",
    role: "Senior cabin crew",
    qualifications: [
      {
        code: "SCC",
        name: "Senior Cabin Crew"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 10,
    base: "MAD",
    languages: [
      "Spanish",
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}144`,
        origin_code: "MAD",
        destination_code: "DXB",
        origin: "Madrid",
        destination: "Dubai",
        departure: "2025-09-10T10:00:00+02:00",
        arrival: "2025-09-10T19:00:00+04:00",
        delay: "On Time",
        passengers: 165,
        status: "On Time",
        impact: "Medium Impact",
        reason: "Senior cabin crew absent — may affect service delivery and compliance, replacement required."
      }
    ]
  },
  {
    name: "SSCC Fatima Noor",
    role_code: "SCC",
    role: "Senior cabin crew",
    qualifications: [
      {
        code: "SCC",
        name: "Senior Cabin Crew"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 9,
    base: "DXB",
    languages: [
      "Arabic",
      "Urdu",
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}523`,
        origin_code: "DXB",
        destination_code: "DOH",
        origin: "Dubai",
        destination: "Doha",
        departure: "2025-09-10T11:00:00+04:00",
        arrival: "2025-09-10T11:50:00+03:00",
        delay: "On Time",
        passengers: 156,
        status: "On Time",
        impact: "Medium Impact",
        reason: "Senior cabin crew absent — service/COMPLIANCE impact, replacement required."
      },
      {
        flightNumber: `${config.code || 'FZ'}524`,
        origin_code: "DOH",
        destination_code: "DXB",
        origin: "Doha",
        destination: "Dubai",
        departure: "2025-09-10T13:30:00+03:00",
        arrival: "2025-09-10T15:30:00+04:00",
        delay: "10 min",
        passengers: 149,
        status: "Delayed",
        impact: "Medium Impact",
        reason: "Turnaround dependent — replacement required to maintain minimum service levels, may cause delay."
      }
    ]
  },
  {
    name: "CC Laura Bennett",
    role_code: "CC",
    role: "Cabin crew",
    qualifications: [
      {
        code: "CC",
        name: "Cabin Crew"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 5,
    base: "SYD",
    languages: [
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}451`,
        origin_code: "SYD",
        destination_code: "DXB",
        origin: "Sydney",
        destination: "Dubai",
        departure: "2025-09-10T09:00:00+10:00",
        arrival: "2025-09-10T17:00:00+04:00",
        delay: "On Time",
        passengers: 172,
        status: "On Time",
        impact: "Medium Impact",
        reason: "Cabin crew removed — replacement required to meet minimum staffing, may cause service disruption or delay."
      }
    ]
  },
  {
    name: "CC Samuel Osei",
    role_code: "CC",
    role: "Cabin crew",
    qualifications: [
      {
        code: "CC",
        name: "Cabin Crew"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 4,
    base: "ACC",
    languages: [
      "English",
      "Twi"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}134`,
        origin_code: "ACC",
        destination_code: "DXB",
        origin: "Accra",
        destination: "Dubai",
        departure: "2025-09-10T08:30:00+00:00",
        arrival: "2025-09-10T18:00:00+04:00",
        delay: "On Time",
        passengers: 161,
        status: "On Time",
        impact: "Medium Impact",
        reason: "Cabin crew removed — replacement or reshuffle needed to meet minimum crew levels, may delay departure."
      }
    ]
  },
  {
    name: "CC Yuki Tanaka",
    role_code: "CC",
    role: "Cabin crew",
    qualifications: [
      {
        code: "CC",
        name: "Cabin Crew"
      }
    ],
    status: "available",
    issue: null,
    experience_years: 3,
    base: "HND",
    languages: [
      "Japanese",
      "English"
    ],
    rotation_impact: [
      {
        flightNumber: `${config.code || 'FZ'}821`,
        origin_code: "HND",
        destination_code: "DXB",
        origin: "Tokyo Haneda",
        destination: "Dubai",
        departure: "2025-09-10T14:00:00+09:00",
        arrival: "2025-09-10T21:00:00+04:00",
        delay: "20 min",
        passengers: 172,
        status: "Delayed",
        impact: "Medium Impact",
        reason: "Cabin crew removed — service/COMPLIANCE impact, replacement required to avoid further delays."
      }
    ]
  }
];

// Embedded aircraft issues recovery data
const getAircraftIssuesRecoveryData = () => {
  return [
    {
      title: "Aircraft Swap - Immediate",
      description: "Replace with available standby aircraft",
      cost: "AED 22,800",
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
        "Preserves network connectivity",
      ],
      considerations: [
        "Requires available spare aircraft",
        "Crew briefing and familiarization needed",
        "Gate coordination and positioning",
        "Passenger transfer logistics",
      ],
      impact_area: ["crew"],
      impact_summary: `Aircraft issue recovery for ${config.code || 'FZ'}147: Technical disruption requiring aircraft substitution with minimal passenger impact through efficient swap procedures.`,
      resource_requirements: [
        {
          title: "Replacement Aircraft",
          subtitle: "Available Aircraft (TBD)",
          availability: "Ready",
          status: "Available",
          location: "Terminal Area",
          eta: "On Stand",
          details:
            "Aircraft selection based on route requirements and availability",
        },
        {
          title: "Flight Crew",
          subtitle: "Qualified Crew Team",
          availability: "Briefed",
          status: "On Duty",
          location: "Crew Room Terminal 2",
          eta: "15 minutes",
          details: "Type-rated crew with current qualifications",
        },
        {
          title: "Cabin Crew",
          subtitle: "Flight Attendants",
          availability: "Ready",
          status: "On Standby",
          location: "Crew Lounge",
          eta: "10 minutes",
          details: "Multi-type qualified cabin crew",
        },
        {
          title: "Ground Equipment",
          subtitle: "Aircraft Support Equipment",
          availability: "Dispatched",
          status: "Confirmed",
          location: "Equipment Bay",
          eta: "5 minutes",
          details: "Tug, GPU, and ground support equipment",
        },
        {
          title: "Ground Handling",
          subtitle: "Premium Ground Service Team",
          availability: "Assigned",
          status: "Available",
          location: "Gate Operations",
          eta: "On Location",
          details: "Specialized team for aircraft swap operations",
        },
      ],
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 15,000",
            category: "Delay Costs",
            percentage: 66,
            description: "Passenger compensation and handling",
          },
          {
            amount: "AED 5,000",
            category: "Aircraft Swap",
            percentage: 22,
            description: "Cost of mobilizing standby aircraft",
          },
          {
            amount: "AED 2,800",
            category: "Logistics",
            percentage: 12,
            description: "Ground handling and coordination",
          },
        ],
        total: {
          amount: "AED 22,800",
          title: "Total Estimated Cost",
          description: "Ground handling and coordination",
        },
      },
      timeline_details: [
        {
          step: "Decision Confirmation",
          status: "completed",
          details: "Management approval and resource confirmation",
          startTime: "23:34",
          endTime: "23:39",
          duration: "5 min",
        },
        {
          step: "Aircraft Positioning",
          status: "in-progress",
          details: "Move replacement aircraft to departure gate",
          startTime: "23:39",
          endTime: "05:39",
          duration: "360 min",
        },
        {
          step: "Crew Briefing & Preparation",
          status: "pending",
          details: "Flight crew briefing for aircraft configuration",
          startTime: "05:39",
          endTime: "18:29",
          duration: "770 min",
        },
        {
          step: "Passenger & Baggage Transfer",
          status: "pending",
          details: "Transfer passengers and priority baggage handling",
          startTime: "18:29",
          endTime: "20:34",
          duration: "125 min",
        },
        {
          step: "Final Checks & Departure",
          status: "pending",
          details: "Pre-flight checks and departure clearance",
          startTime: "20:34",
          endTime: "20:49",
          duration: "15 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Aircraft Availability Conflict",
          risk_impact: "Low",
          mitigation_impact: "Medium",
          score: 3,
          mitigation: "Secondary aircraft options confirmed in standby",
        },
        {
          risk: "Passenger Baggage Transfer Delays",
          risk_impact: "Medium",
          mitigation_impact: "Low",
          score: 2,
          mitigation:
            "Priority baggage team deployed with extended transfer window",
        },
        {
          risk: "Aircraft Type Configuration Differences",
          risk_impact: "Low",
          mitigation_impact: "Low",
          score: 1,
          mitigation:
            "Similar aircraft configurations, passenger seat maps provided",
        },
        {
          risk: "Weather Impact During Transfer",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation: "Weather monitoring active, contingency plans prepared",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Aircraft swap protocol with coordinated ground operations and priority positioning",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "ACARS Real-time Updates",
            "Ground Power Unit",
            "Baggage Transfer System",
            "Passenger Information Display",
            "Aircraft Positioning Coordination",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "EASA Type Certificate",
            "GCAA Operational Approval",
            "Route-specific Weather Capability",
          ],
        },
        weather_capability: {
          title: "Weather capability",
          details: "Route-specific Weather Capability",
        },
        maintenance_status: {
          title: "Maintenance status",
          details:
            "Replacement aircraft maintenance status verified, airworthiness certificate current",
        },
        fuel_requirement: {
          title: "Fuel requirement",
          details:
            "Route-specific fuel planning with regulatory reserves and contingency allowances",
        },
        weather_limitations: {
          title: "Weather limitations",
          details:
            "Standard weather operational limits, current conditions monitored",
        },
        aircraft_specs: {
          title: "Aircraft specs",
          details:
            "Replacement aircraft specifications compatible with route requirements",
        },
        route_approval: {
          title: "Route approval",
          details:
            "Aircraft certified for destination, operational approvals verified",
        },
      },
      crew_available: availableDummyCrew,
      metrics: {
        costEfficiency: 85,
        timeEfficiency: 90,
        passengerSatisfaction: 85,
        recovery_analysis:
          `Aircraft Swap Recovery for ${config.code || 'FZ'}147 (IST→DXB): Replace B737 MAX 8 A6-FDU with available replacement aircraft at IST. The replacement aircraft has been selected based on availability and route certification for IST-DXB. Estimated passenger transfer time: 35-45 minutes. All cargo and baggage will be transferred with priority handling. This solution maintains schedule integrity with minimal passenger disruption. Current disruption: Engine maintenance check.`,
        crewViolations: 1,
        aircraftSwaps: 1,
        networkImpact: "Minimal",
      },
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "A6-FED",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min"
            },
            cabinMatch: {
              status: "exact",
              value: "Exact"
            },
            availability: "Available Now",
            assigned: {
              status: "none",
              value: "None"
            },
            turnaround: "45 min",
            maintenance: {
              status: "current",
              value: "Current"
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%"
            },
            rotation_impact: [
              {
                flightNumber: `${config.code || 'FZ'}141`,
                origin_code: "DXB",
                destination_code: "MCT",
                origin: "Dubai",
                destination: "Muscat",
                departure: "2025-09-10T08:45:00+04:00",
                arrival: "2025-09-10T09:30:00+04:00",
                delay: "10 min",
                passengers: 152,
                status: "On Time",
                impact: "Low Impact",
                reason: "Nominal operations"
              },
              {
                flightNumber: `${config.code || 'FZ'}142`,
                origin_code: "MCT",
                destination_code: "DXB",
                origin: "Muscat",
                destination: "Dubai",
                departure: "2025-09-10T10:15:00+04:00",
                arrival: "2025-09-10T11:05:00+04:00",
                delay: "5 min",
                passengers: 148,
                status: "On Time",
                impact: "Low Impact",
                reason: "Turnaround buffer"
              },
              {
                flightNumber: `${config.code || 'FZ'}737`,
                origin_code: "DXB",
                destination_code: "KWI",
                origin: "Dubai",
                destination: "Kuwait",
                departure: "2025-09-10T12:15:00+04:00",
                arrival: "2025-09-10T13:30:00+04:00",
                delay: "15 min",
                passengers: 170,
                status: "Delayed",
                impact: "Medium Impact",
                reason: "Busy apron slot"
              },
              {
                flightNumber: `${config.code || 'FZ'}738`,
                origin_code: "KWI",
                destination_code: "DXB",
                origin: "Kuwait",
                destination: "Dubai",
                departure: "2025-09-10T14:30:00+04:00",
                arrival: "2025-09-10T15:45:00+04:00",
                delay: "0 min",
                passengers: 165,
                status: "On Time",
                impact: "Low Impact",
                reason: "Smooth turnaround"
              },
              {
                flightNumber: `${config.code || 'FZ'}851`,
                origin_code: "DXB",
                destination_code: "BKK",
                origin: "Dubai",
                destination: "Bangkok",
                departure: "2025-09-10T17:00:00+04:00",
                arrival: "2025-09-11T02:00:00+07:00",
                delay: "25 min",
                passengers: 189,
                status: "Delayed",
                impact: "High Impact",
                reason: "ETOPS briefing delay"
              }
            ]
          },
          {
            reg: "A6-FEL",
            type: "B737-MAX8 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "similar",
              value: "Similar"
            },
            availability: "Available 14:30",
            assigned: {
              status: "assigned",
              value: `${config.code || 'FZ'}892`
            },
            turnaround: "60 min",
            maintenance: {
              status: "current",
              value: "Current"
            },
            option_score: {
              cost_score: "65%",
              delay_score: "55%",
              crew_impact: "60%",
              fuel_score: "75%",
              overall: "64%"
            },
            rotation_impact: [
              {
                flightNumber: `${config.code || 'FZ'}892`,
                origin_code: "DXB",
                destination_code: "IST",
                origin: "Dubai",
                destination: "Istanbul",
                departure: "2025-09-10T15:30:00+04:00",
                arrival: "2025-09-10T19:30:00+03:00",
                delay: "20 min",
                passengers: 178,
                status: "Delayed",
                impact: "Medium Impact",
                reason: "Gate congestion"
              },
              {
                flightNumber: `${config.code || 'FZ'}893`,
                origin_code: "IST",
                destination_code: "DXB",
                origin: "Istanbul",
                destination: "Dubai",
                departure: "2025-09-10T21:00:00+03:00",
                arrival: "2025-09-11T02:00:00+04:00",
                delay: "30 min",
                passengers: 181,
                status: "Delayed",
                impact: "High Impact",
                reason: "Late inbound connection"
              }
            ]
          },
          {
            reg: "A6-FGH",
            type: "B737-800 (164Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "reduced",
              value: "Reduced"
            },
            availability: "Available 16:00",
            assigned: {
              status: "none",
              value: "None"
            },
            turnaround: "50 min",
            maintenance: {
              status: "due",
              value: "Due A-Check"
            },
            option_score: {
              cost_score: "52%",
              delay_score: "38%",
              crew_impact: "55%",
              fuel_score: "61%",
              overall: "52%"
            },
            rotation_impact: [
              {
                flightNumber: `${config.code || 'FZ'}523`,
                origin_code: "DXB",
                destination_code: "DOH",
                origin: "Dubai",
                destination: "Doha",
                departure: "2025-09-10T17:00:00+04:00",
                arrival: "2025-09-10T17:50:00+03:00",
                delay: "10 min",
                passengers: 120,
                status: "On Time",
                impact: "Low Impact",
                reason: "Normal ops"
              },
              {
                flightNumber: `${config.code || 'FZ'}524`,
                origin_code: "DOH",
                destination_code: "DXB",
                origin: "Doha",
                destination: "Dubai",
                departure: "2025-09-10T19:00:00+03:00",
                arrival: "2025-09-10T21:00:00+04:00",
                delay: "40 min",
                passengers: 130,
                status: "Delayed",
                impact: "Medium Impact",
                reason: "Awaiting maintenance clearance"
              }
            ]
          },
          {
            reg: "A6-FIJ",
            type: "B737-MAX8 (189Y)",
            etops: {
              status: "none",
              value: "None"
            },
            cabinMatch: {
              status: "exact",
              value: "Exact"
            },
            availability: "Available 18:00",
            assigned: {
              status: "assigned",
              value: `${config.code || 'FZ'}445`
            },
            turnaround: "75 min",
            maintenance: {
              status: "aog",
              value: "AOG Issue"
            },
            option_score: {
              cost_score: "0%",
              delay_score: "0%",
              crew_impact: "0%",
              fuel_score: "0%",
              overall: "0%"
            },
            rotation_impact: [
              {
                flightNumber: `${config.code || 'FZ'}445`,
                origin_code: "DXB",
                destination_code: "LHE",
                origin: "Dubai",
                destination: "Lahore",
                departure: "2025-09-10T18:30:00+04:00",
                arrival: "2025-09-10T22:45:00+05:00",
                delay: "90 min",
                passengers: 182,
                status: "Cancelled",
                impact: "High Impact",
                reason: "AOG technical issue"
              }
            ]
          }
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [{ code: "B737", name: "Boeing 737 Type Rating" }],
            status: "Duty time exceeded",
            issue: "Crew exceeded allowed maximum duty hours under regulations",
            experience_years: 15,
            base: "DXB",
            languages: ["Arabic", "English"]
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First officer",
            qualifications: [
              { code: "B737M", name: "Boeing 737 MAX Type Rating" },
            ],
            status: "available",
            issue: null,
            experience_years: 7,
            base: "LHR",
            languages: ["English", "French"],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior cabin crew",
            qualifications: [{ code: "SCC", name: "Senior Cabin Crew" }],
            status: "available",
            issue: null,
            experience_years: 12,
            base: "JFK",
            languages: ["English", "Spanish"],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin crew",
            qualifications: [{ code: "CC", name: "Cabin Crew" }],
            status: "available",
            issue: null,
            experience_years: 4,
            base: "MAD",
            languages: ["Spanish", "English"],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: `${config.code || 'FZ'}456 DXB-BOM`,
            departure: "Dep: 18:30 → 19:45 (+75min)",
            impact: "High Impact",
            reason: "Aircraft swap delay",
          },
          {
            flight: `${config.code || 'FZ'}457 BOM-DXB`,
            departure: "Dep: 22:15 → 23:00 (+45min)",
            impact: "Medium Impact",
            reason: "Knock-on delay",
          },
          {
            flight: `${config.code || 'FZ'}890 DXB-DEL`,
            departure: "Dep: 08:30 (Next Day)",
            impact: "Low Impact",
            reason: "Overnight recovery",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Compatible",
            details: "All gates compatible with B737-800",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "New departure slot needed",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "Minimal Impact",
            details: "No significant connection issues",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "AED 34,200",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "+2.1%",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "AED 8,450",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Medium",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft A6-FED",
          summary:
            "Optimal balance across cost (92%), delay minimization (88%), crew impact (95%), and fuel efficiency (91%). Immediate availability with exact cabin configuration match.",
        },
      },
      details: null,
      created_at: "2025-08-09T08:02:00.000Z",
      updated_at: "2025-08-09T08:02:00.000Z",
    },
    {
      id: "DELAY_REPAIR_002",
      title: "Delay for Repair Completion",
      description: "Wait for hydraulics system repair",
      cost: "AED 48,960",
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
        "Lower operational complexity",
      ],
      considerations: [
        "Extended delay period with passenger impact",
        "Risk of repair time overrun",
        "Crew duty time approaching limits",
        "Potential downstream flight disruptions",
      ],
      impact_area: ["passenger"],
      impact_summary: `Aircraft issue recovery for ${config.code || 'FZ'}181: Technical disruption requiring aircraft substitution with minimal passenger impact through efficient swap procedures.`,
      resource_requirements: [
        {
          title: "Accommodation",
          subtitle: "Hotel Rooms",
          availability: "Reserved",
          status: "Confirmed",
          location: "Airport Hotels",
          eta: "Available Now",
          details: "Block booking confirmed for passenger accommodation",
        },
        {
          title: "Transportation",
          subtitle: "Coach Buses",
          availability: "En Route",
          status: "Dispatched",
          location: "Terminal Pickup Point",
          eta: "12 minutes",
          details: "Transport service for passenger transfer",
        },
        {
          title: "Catering",
          subtitle: "Meal Vouchers",
          availability: "Printed",
          status: "Ready",
          location: "Terminal F&B Partners",
          eta: "Available Now",
          details: "Meal allowances for all affected passengers",
        },
        {
          title: "Technical Support",
          subtitle: "Maintenance Team",
          availability: "Responding",
          status: "En Route",
          location: "Maintenance Hangar",
          eta: "25 minutes",
          details: "Specialized engineers and diagnostic equipment",
        },
        {
          title: "Customer Service",
          subtitle: "Service Representatives",
          availability: "Deployed",
          status: "Available",
          location: "Service Desk",
          eta: "On Location",
          details: "Multilingual team for passenger assistance",
        },
      ],
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 30,000",
            category: "Delay Costs",
            percentage: 61,
            description: "Passenger compensation and accommodation",
          },
          {
            amount: "AED 15,000",
            category: "Maintenance",
            percentage: 31,
            description: "Hydraulics system repair costs",
          },
          {
            amount: "AED3,960",
            category: "Crew Overtime",
            percentage: 8,
            description: "Extended crew duty compensation",
          },
        ],
        total: {
          amount: "AED 48,960",
          title: "Total Estimated Cost",
          description: "Maintenance and operational costs",
        },
      },
      timeline_details: [
        {
          step: "Passenger Notification",
          status: "completed",
          details: "SMS/email alerts to all passengers",
          startTime: "23:35",
          endTime: "23:43",
          duration: "8 min",
        },
        {
          step: "Accommodation Booking",
          status: "in-progress",
          details: "Secure hotel rooms and transportation",
          startTime: "23:40",
          endTime: "00:05",
          duration: "25 min",
        },
        {
          step: "Ground Transportation Setup",
          status: "pending",
          details: "Deploy buses for passenger transport",
          startTime: "23:50",
          endTime: "00:25",
          duration: "35 min",
        },
        {
          step: "Issue Resolution Period",
          status: "pending",
          details: "Technical issue resolution and aircraft preparation",
          startTime: "00:05",
          endTime: "03:05",
          duration: "180 min",
        },
        {
          step: "Return & Departure Prep",
          status: "pending",
          details: "Passenger return and boarding preparation",
          startTime: "02:50",
          endTime: "03:35",
          duration: "45 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Accommodation Capacity Issues",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation:
            "Multiple hotel partnerships and overflow arrangements confirmed",
        },
        {
          risk: "Extended Resolution Time",
          risk_impact: "Medium",
          mitigation_impact: "High",
          score: 6,
          mitigation: "Specialist teams on standby, parts inventory verified",
        },
        {
          risk: "Passenger Compensation Claims",
          risk_impact: "High",
          mitigation_impact: "Medium",
          score: 6,
          mitigation:
            "Legal compliance team prepared, compensation budget allocated",
        },
        {
          risk: "Crew Duty Time Limitations",
          risk_impact: "Medium",
          mitigation_impact: "Medium",
          score: 4,
          mitigation: "Fresh crew on standby for next departure",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Comprehensive delay management with passenger care and issue resolution",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "Hotel Booking System",
            "Transport Coordination",
            "Passenger Notification Platform",
            "Maintenance Support Systems",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "EU261 Compliance",
            "UAE Passenger Rights Compliance",
            "IATA Resolution 824",
          ],
        },
        weather_capability: {
          title: "Weather capability",
          details:
            "Weather conditions monitored, improvement timeline assessed",
        },
        maintenance_status: {
          title: "Maintenance status",
          details:
            "Technical teams assigned for issue resolution during delay period",
        },
        fuel_requirement: null,
        weather_limitations: {
          title: "Weather limitations",
          details:
            "Weather conditions monitored, improvement timeline assessed",
        },
        aircraft_specs: null,
        route_approval: null,
        time_framework: {
          title: "Time framework",
          details:
            "4-hour window allows for comprehensive issue resolution and passenger care",
        },
        passenger_care: {
          title: "Passenger care",
          details:
            "Full meal, accommodation, and transport provision per airline policy",
        },
        regulatory_compliance: {
          title: "Regulatory compliance",
          details:
            "Meets all passenger care requirements for delay duration and circumstances",
        },
        weather_minimums: {
          title: "Weather minimums",
          details: [
            "Visibility: 1000m minimum",
            "Ceiling: 200ft minimum",
            "Wind: 25kt crosswind limit",
          ],
        },
        alternate_airports: {
          title: "Alternate airports",
          details: ["SHJ - Sharjah (45km)", "DWC - Al Maktoum (50km)"],
        },
        fuel_considerations: {
          title: "Fuel considerations",
          details: ["Standard fuel load", "Contingency fuel: 1200kg"],
        },
      },
      crew_available: availableDummyCrew,
      metrics: {
        costEfficiency: 70,
        timeEfficiency: 60,
        passengerSatisfaction: 50,
        crewViolations: 0,
        aircraftSwaps: 0,
        networkImpact: "High",
      },
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "B737 MAX 8",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "exact",
              value: "Exact",
            },
            availability: "Delayed 4-6 hours",
            assigned: {
              status: "none",
              value: "None",
            },
            turnaround: "30 min",
            maintenance: {
              status: "current",
              value: "Current",
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%",
            },
          },
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [{ code: "B737", name: "B737 Type Rating" }],
            status: "Available",
            issue: null,
            experience_years: 16,
            base: "DXB",
            languages: ["Arabic", "English"],
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First Officer",
            qualifications: [{ code: "B737M", name: "B737/MAX Type Rating" }],
            status: "Available",
            issue: null,
            experience_years: 6,
            base: "LHR",
            languages: ["English", "French"],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior Cabin Crew",
            qualifications: [{ code: "SCC", name: "Senior Cabin Crew" }],
            status: "Available",
            issue: null,
            experience_years: 11,
            base: "JFK",
            languages: ["English", "Spanish"],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin Crew",
            qualifications: [{ code: "CC", name: "Cabin Crew" }],
            status: "Available",
            issue: null,
            experience_years: 4,
            base: "MAD",
            languages: ["Spanish", "English"],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: `${config.code || 'FZ'}456 DXB-BOM`,
            departure: "Dep: 18:30 → 22:30 (+4-6 hours)",
            impact: "Medium Impact",
            reason: "Direct delay impact",
          },
          {
            flight: `${config.code || 'FZ'}457 BOM-DXB`,
            departure: "Dep: 22:15 (On Time)",
            impact: "Low Impact",
            reason: "Sufficient turnaround",
          },
          {
            flight: `${config.code || 'FZ'}890 DXB-DEL`,
            departure: "Dep: 08:30 (Next Day)",
            impact: "No Impact",
            reason: "Overnight recovery",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Compatible",
            details: "Same gate assignment maintained",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "DXB slot coordination required",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "High Impact",
            details: "52 passengers miss onward connections",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "AED 12,880",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "+0.8%",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "N/A",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Low",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft B737 MAX 8",
          summary:
            "Manageable delay impact with 45% confidence. Maintains operational continuity with minimal crew changes.",
        },
      },
      details: null,
      created_at: "2025-08-09T08:02:00.000Z",
      updated_at: "2025-08-09T08:02:00.000Z",
    },
    {
      id: "CANCEL_REBOOK_003",
      title: "Cancel and Rebook",
      description: "Cancel and rebook on partner airlines",
      cost: "AED 141,440",
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
        "Preserves aircraft for other operations",
      ],
      considerations: [
        "Highest passenger impact and compensation",
        "Complete revenue loss for flight",
        "Partner airline capacity dependency",
        "Complex rebooking coordination required",
      ],
      impact_area: ["passenger", "crew"],
      impact_summary: `Aircraft issue recovery for ${config.code || 'FZ'}147: Technical disruption requiring aircraft substitution with minimal passenger impact through efficient swap procedures.`,
      resource_requirements: [
        {
          title: "Operational Resources",
          subtitle: "Standard operational resources",
          availability: "Available",
          status: "Ready",
          location: "Various locations",
          eta: "As required",
          details: "Standard resource allocation for this recovery type",
        },
        {
          title: "Ground Support",
          subtitle: "Ground handling team",
          availability: "Assigned",
          status: "Available",
          location: "Gate operations",
          eta: "On Location",
          details: "Standard ground support services",
        },
        {
          title: "Customer Service",
          subtitle: "Service representatives",
          availability: "Available",
          status: "Deployed",
          location: "Terminal areas",
          eta: "On Location",
          details: "Customer service support team",
        },
      ],
      crew_available: availableDummyCrew,
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 100,000",
            category: "Rebooking Costs",
            percentage: 71,
            description: "Cost of rebooking on partner airlines",
          },
          {
            amount: "AED 30,000",
            category: "Passenger Compensation",
            percentage: 21,
            description: "Compensation for cancellation",
          },
          {
            amount: "AED 11,440",
            category: "Logistics",
            percentage: 8,
            description: "Coordination and communication costs",
          },
        ],
        total: {
          amount: "AED 141,440",
          title: "Total Estimated Cost",
          description: "Rebooking and compensation costs",
        },
      },
      timeline_details: [
        {
          step: "Implementation Start",
          status: "completed",
          details: "Initial setup and preparation",
          startTime: "23:36",
          endTime: "00:06",
          duration: "30 min",
        },
        {
          step: "Execution Phase 1",
          status: "in-progress",
          details: "Main implementation activities - step 1",
          startTime: "00:06",
          endTime: "00:36",
          duration: "30 min",
        },
        {
          step: "Execution Phase 2",
          status: "pending",
          details: "Main implementation activities - step 2",
          startTime: "00:36",
          endTime: "01:06",
          duration: "30 min",
        },
        {
          step: "Completion & Departure",
          status: "pending",
          details: "Final checks and departure",
          startTime: "01:06",
          endTime: "01:36",
          duration: "30 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Alternative Flight Capacity",
          risk_impact: "High",
          mitigation_impact: "High",
          score: 9,
          mitigation: "Partner airline agreements, multiple rebooking options",
        },
        {
          risk: "Passenger Compensation Costs",
          risk_impact: "High",
          mitigation_impact: "Medium",
          score: 6,
          mitigation:
            "Compensation budget allocated, efficient processing system",
        },
        {
          risk: "Baggage Handling Complexity",
          risk_impact: "Medium",
          mitigation_impact: "Medium",
          score: 4,
          mitigation: "Dedicated baggage team, tracking systems active",
        },
        {
          risk: "Customer Satisfaction Impact",
          risk_impact: "High",
          mitigation_impact: "Medium",
          score: 6,
          mitigation: "Service recovery program, compensation packages",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Standard recovery procedures following approved operational protocols",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "Basic operational systems",
            "Communication platforms",
            "Monitoring systems",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "Standard operational certifications",
            "Regulatory compliance maintained",
          ],
        },
        maintenance_status: {
          title: "Maintenance status",
          details:
            "Current maintenance status verified, technical support available",
        },
        operational_requirements: {
          title: "Operational requirements",
          details:
            "All operational requirements met for safe and compliant implementation",
        },
        regulatory_compliance: {
          title: "Regulatory compliance",
          details:
            "Full compliance with aviation regulations and company procedures",
        },
        resource_availability: {
          title: "Resource availability",
          details: "Required resources confirmed available and allocated",
        },
        system_integration: {
          title: "System integration",
          details: "Integration with existing operational systems verified",
        },
      },
      metrics: {
        crewViolations: 1,
        aircraftSwaps: 0,
        networkImpact: "None",
      },
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "B737 MAX 8",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "exact",
              value: "Exact",
            },
            availability: "Original Aircraft",
            assigned: {
              status: "none",
              value: "None",
            },
            turnaround: "45 min",
            maintenance: {
              status: "current",
              value: "Current",
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%",
            },
          },
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [
              {
                code: "B737",
                name: "B737 Type Rating",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 17,
            base: "DXB",
            languages: ["English", "Arabic"],
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First Officer",
            qualifications: [
              {
                code: "B737M",
                name: "B737/MAX Type Rating",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 7,
            base: "LHR",
            languages: ["English", "French"],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior Cabin Crew",
            qualifications: [
              {
                code: "SCC",
                name: "Senior Cabin Crew Certification",
              },
              {
                code: "SEP",
                name: "Safety & Emergency Procedures",
              },
            ],
            status: "Roster Violation",
            issue: "Assigned duty breaks rostering or regulatory rules",
            experience_years: 12,
            base: "JFK",
            languages: ["English", "Spanish"],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin Crew",
            qualifications: [
              {
                code: "CC",
                name: "Cabin Crew Certification",
              },
              {
                code: "MEDFA",
                name: "Medical First Aid",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 4,
            base: "MAD",
            languages: ["English", "Spanish", "Portuguese"],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: `${config.code || 'FZ'}456 DXB-BOM`,
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Flight cancellation",
          },
          {
            flight: `${config.code || 'FZ'}457 BOM-DXB`,
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Route cancellation",
          },
          {
            flight: `${config.code || 'FZ'}890 DXB-DEL`,
            departure: "Dep: 08:30 (Next Day)",
            impact: "No Impact",
            reason: "Different aircraft",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Compatible",
            details: "Same gate assignment maintained",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "DXB slot coordination required",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "Severe Impact",
            details: "189 passengers need rebooking",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "AED 89,200",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "N/A",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "AED 24,500",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Critical",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft B737 MAX 8",
          summary:
            "Cancellation minimizes further network disruption. Prioritizes passenger re-accommodation and crew availability for alternative flights.",
        },
      },
      details: null,
      created_at: "2025-08-09T08:31:00.000Z",
      updated_at: "2025-08-09T08:31:00.000Z",
    },
  ];
};

// Embedded weather issues recovery data
const getWeatherIssuesRecoveryData = () => {
  return [
    {
      title: "Delay for Weather Clearance",
      description: "Wait for weather improvement at DEL",
      cost: "AED 25,000",
      timeline: "2-3 hours",
      confidence: 90,
      impact: "Managed schedule delay",
      status: "recommended",
      priority: 1,
      advantages: [
        "Weather-appropriate response",
        "Passenger safety prioritized",
        "Regulatory compliance maintained",
      ],
      considerations: [
        "Weather dependency",
        "Potential for further delays",
        "Passenger accommodation required",
      ],
      impact_area: [],
      impact_summary: `Weather delay recovery for DEL: Weather-related operational adjustments with passenger care provisions.`,
      resource_requirements: [
        {
          title: "Terminal Services",
          subtitle: "Passenger Amenities",
          availability: "Available",
          status: "Ready",
          location: "Terminal Lounges",
          eta: "Immediate",
          details: "Lounge access and refreshment services",
        },
        {
          title: "Technical Support",
          subtitle: "Maintenance Team",
          availability: "Available",
          status: "Responding",
          location: "Aircraft Stand",
          eta: "15 minutes",
          details: "Quick resolution team and equipment",
        },
        {
          title: "Customer Service",
          subtitle: "Ground Staff",
          availability: "Available",
          status: "Deployed",
          location: "Gate Area",
          eta: "On Location",
          details: "Customer service team for passenger updates",
        },
        {
          title: "Communication",
          subtitle: "Passenger Information System",
          availability: "Active",
          status: "Broadcasting",
          location: "Terminal Wide",
          eta: "Immediate",
          details: "Real-time updates via displays and announcements",
        },
      ],
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 10,000",
            category: "Delay Coordination",
            percentage: 40,
            description: "Operational delay management",
          },
          {
            amount: "AED 8,750",
            category: "Passenger Services",
            percentage: 35,
            description: "Terminal amenities and refreshments",
          },
          {
            amount: "AED 3,750",
            category: "Crew Overtime",
            percentage: 15,
            description: "Extended crew duty time",
          },
          {
            amount: "AED 2,500",
            category: "Administrative Costs",
            percentage: 10,
            description: "Documentation and notifications",
          },
        ],
        total: {
          amount: "AED 25,000",
          title: "Total Estimated Cost",
          description: "Ground handling and coordination",
        },
      },
      timeline_details: [
        {
          step: "Passenger Notification",
          status: "completed",
          details: "Immediate passenger notification",
          startTime: "23:16",
          endTime: "23:21",
          duration: "5 min",
        },
        {
          step: "Terminal Services Setup",
          status: "completed",
          details: "Arrange terminal amenities and refreshments",
          startTime: "23:21",
          endTime: "23:36",
          duration: "15 min",
        },
        {
          step: "Issue Resolution",
          status: "in-progress",
          details: "Resolve technical or operational issues",
          startTime: "23:36",
          endTime: "01:06",
          duration: "90 min",
        },
        {
          step: "Boarding & Departure",
          status: "pending",
          details: "Complete boarding and departure",
          startTime: "01:06",
          endTime: "01:16",
          duration: "10 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Extended Resolution Time",
          risk_impact: "Medium",
          mitigation_impact: "Medium",
          score: 4,
          mitigation: "Technical teams responding, time buffers included",
        },
        {
          risk: "Passenger Dissatisfaction",
          risk_impact: "Medium",
          mitigation_impact: "Low",
          score: 2,
          mitigation: "Terminal amenities and regular updates provided",
        },
        {
          risk: "Connecting Flight Impacts",
          risk_impact: "High",
          mitigation_impact: "Medium",
          score: 6,
          mitigation: "Rebooking team active, partner airline coordination",
        },
        {
          risk: "Weather Window Closure",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation: "Weather monitoring, alternative plans prepared",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Comprehensive delay management with passenger care and issue resolution",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "Terminal Services System",
            "Passenger Notification Platform",
            "Maintenance Support Systems",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "EU261 Compliance",
            "UAE Passenger Rights Compliance",
            "IATA Resolution 824",
          ],
        },
        maintenance_status: {
          title: "Maintenance status",
          details:
            "Technical teams assigned for issue resolution during delay period",
        },
        time_framework: {
          title: "Time framework",
          details:
            "2-hour window allows for comprehensive issue resolution and passenger care",
        },
        weather_limitations: {
          title: "Weather limitations",
          details:
            "Weather conditions monitored, improvement timeline assessed",
        },
        passenger_care: {
          title: "Passenger care",
          details: "Terminal amenities and refreshment services provided",
        },
        regulatory_compliance: {
          title: "Regulatory compliance",
          details:
            "Meets all passenger care requirements for delay duration and circumstances",
        },
      },
      metrics: {
        crewViolations: 0,
        aircraftSwaps: 0,
        networkImpact: "Low",
      },
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "A6-FED",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "exact",
              value: "Exact",
            },
            availability: "Delayed 2-3 hours",
            assigned: {
              status: "none",
              value: "None",
            },
            turnaround: "30 min",
            maintenance: {
              status: "current",
              value: "Current",
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%",
            },
          },
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [
              {
                code: "B737",
                name: "B737 Type Rating",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 18,
            base: "DXB",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "AR",
                name: "Arabic",
              },
            ],
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First Officer",
            qualifications: [
              {
                code: "B737M",
                name: "B737/MAX Type Rating",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 7,
            base: "LHR",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "FR",
                name: "French",
              },
            ],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior Cabin Crew",
            qualifications: [
              {
                code: "SCC",
                name: "Senior Cabin Crew",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 12,
            base: "JFK",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "ES",
                name: "Spanish",
              },
            ],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin Crew",
            qualifications: [
              {
                code: "CC",
                name: "Cabin Crew",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 5,
            base: "MAD",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "PT",
                name: "Portuguese",
              },
            ],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: `${config.code || 'FZ'}456 DXB-BOM`,
            departure: "Dep: 18:30 → 23:42 (+2-3 hours)",
            impact: "Medium Impact",
            reason: "Direct delay impact",
          },
          {
            flight: `${config.code || 'FZ'}457 BOM-DXB`,
            departure: "Dep: 22:15 (On Time)",
            impact: "Low Impact",
            reason: "Sufficient turnaround",
          },
          {
            flight: `${config.code || 'FZ'}890 DXB-DEL`,
            departure: "Dep: 08:30 (Next Day)",
            impact: "No Impact",
            reason: "Overnight recovery",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Same gate assignment maintained",
            details: "",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "Slot coordination required",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "Significant Impact",
            details: "52 passengers miss onward connections",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "AED 6,440",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "+0.8%",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "N/A",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Low",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft B737-800",
          summary:
            "Manageable delay impact with 90% confidence. Maintains operational continuity with minimal crew changes.",
        },
      },
    },
    {
      title: "Rerouting the aircraft",
      description: "Divert to PNQ with ground transport",
      cost: "AED 45,000",
      timeline: "4 hours total",
      confidence: 75,
      impact: "Extended travel time",
      status: "caution",
      priority: 1,
      advantages: [
        "Weather-appropriate response",
        "Passenger safety prioritized",
        "Regulatory compliance maintained",
      ],
      considerations: [
        "Weather dependency",
        "Potential for further delays",
        "Passenger accommodation required",
      ],
      impact_area: ["passenger"],
      impact_summary: `Weather issue recovery for PNQ: Weather-related operational adjustments with passenger care provisions.`,
      resource_requirements: [
        {
          title: "Operational Resources",
          subtitle: "Standard operational resources",
          availability: "Available",
          status: "Ready",
          location: "Various locations",
          eta: "As required",
          details: "Standard resource allocation for this recovery type",
        },
        {
          title: "Ground Support",
          subtitle: "Ground handling team",
          availability: "Available",
          status: "Assigned",
          location: "Gate operations",
          eta: "On Location",
          details: "Standard ground support services",
        },
        {
          title: "Customer Service",
          subtitle: "Service representatives",
          availability: "Available",
          status: "Deployed",
          location: "Terminal areas",
          eta: "On Location",
          details: "Customer service support team",
        },
      ],
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 26,100",
            category: "Alternative Route Costs",
            percentage: 58,
            description: "Additional fuel and navigation fees",
          },
          {
            amount: "AED 11,700",
            category: "Ground Transportation",
            percentage: 26,
            description: "Passenger transport between airports",
          },
          {
            amount: "AED 4,500",
            category: "Airport Coordination Fees",
            percentage: 10,
            description: "Alternative airport slot and handling",
          },
          {
            amount: "AED 2,700",
            category: "Passenger Services",
            percentage: 6,
            description: "Transit support and refreshments",
          },
        ],
        total: {
          amount: "AED 45,000",
          title: "Total Estimated Cost",
          description: "Rerouting and passenger transfer costs",
        },
      },
      timeline_details: [
        {
          step: "Implementation Start",
          status: "completed",
          details: "Initial setup and preparation",
          startTime: "23:27",
          endTime: "00:15",
          duration: "48 min",
        },
        {
          step: "Execution Phase 1",
          status: "in-progress",
          details: "Main implementation activities - step 1",
          startTime: "00:15",
          endTime: "01:03",
          duration: "48 min",
        },
        {
          step: "Execution Phase 2",
          status: "pending",
          details: "Main implementation activities - step 2",
          startTime: "01:03",
          endTime: "01:51",
          duration: "48 min",
        },
        {
          step: "Execution Phase 3",
          status: "pending",
          details: "Main implementation activities - step 3",
          startTime: "01:51",
          endTime: "02:39",
          duration: "48 min",
        },
        {
          step: "Completion & Departure",
          status: "pending",
          details: "Final checks and departure",
          startTime: "02:39",
          endTime: "03:27",
          duration: "48 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Implementation Complexity",
          risk_impact: "High",
          mitigation_impact: "Medium",
          score: 6,
          mitigation: "Experienced team assigned, procedures well documented",
        },
        {
          risk: "Resource Availability",
          risk_impact: "Medium",
          mitigation_impact: "Medium",
          score: 4,
          mitigation: "Backup resources identified, contingency plans prepared",
        },
        {
          risk: "Timeline Adherence",
          risk_impact: "High",
          mitigation_impact: "Low",
          score: 3,
          mitigation: "Buffer time included, monitoring systems active",
        },
        {
          risk: "Passenger Impact",
          risk_impact: "Medium",
          mitigation_impact: "Medium",
          score: 4,
          mitigation:
            "Communication plan active, service recovery measures prepared",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Standard recovery procedures following approved operational protocols",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "Basic operational systems",
            "Communication platforms",
            "Monitoring systems",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "Standard operational certifications",
            "Regulatory compliance maintained",
          ],
        },
        maintenance_status: {
          title: "Maintenance status",
          details:
            "Current maintenance status verified, technical support available",
        },
        operational_requirements: {
          title: "Operational requirements",
          details:
            "All operational requirements met for safe and compliant implementation",
        },
        regulatory_compliance: {
          title: "Regulatory compliance",
          details:
            "Full compliance with aviation regulations and company procedures",
        },
        resource_availability: {
          title: "Resource availability",
          details: "Required resources confirmed available and allocated",
        },
        system_integration: {
          title: "System integration",
          details: "Integration with existing operational systems verified",
        },
      },
      metrics: {
        crewViolations: 0,
        aircraftSwaps: 0,
        networkImpact: "Low",
      },
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "A6-FED",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "exact",
              value: "Exact",
            },
            availability: "Original Aircraft",
            assigned: {
              status: "none",
              value: "None",
            },
            turnaround: "45 min",
            maintenance: {
              status: "current",
              value: "Current",
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%",
            },
          },
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [
              {
                code: "B737",
                name: "B737 Type Rating",
              },
              {
                code: "CRM",
                name: "Crew Resource Management",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 18,
            base: "DXB",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "AR",
                name: "Arabic",
              },
            ],
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First Officer",
            qualifications: [
              {
                code: "B737M",
                name: "B737/MAX Type Rating",
              },
              {
                code: "ATPL",
                name: "Airline Transport Pilot License",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 7,
            base: "LHR",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "FR",
                name: "French",
              },
            ],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior Cabin Crew",
            qualifications: [
              {
                code: "SCC",
                name: "Senior Cabin Crew Certification",
              },
              {
                code: "MEDFA",
                name: "Medical First Aid",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 12,
            base: "JFK",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "ES",
                name: "Spanish",
              },
            ],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin Crew",
            qualifications: [
              {
                code: "CC",
                name: "Cabin Crew Certification",
              },
              {
                code: "MEDFA",
                name: "Medical First Aid",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 5,
            base: "MAD",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "PT",
                name: "Portuguese",
              },
            ],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: `${config.code || 'FZ'}456 DXB-BOM`,
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Flight cancellation",
          },
          {
            flight: `${config.code || 'FZ'}457 BOM-DXB`,
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Route cancellation",
          },
          {
            flight: `${config.code || 'FZ'}890 DXB-DEL`,
            departure: "Dep: 08:30 (Next Day)",
            impact: "No Impact",
            reason: "Different aircraft",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Same gate assignment maintained",
            details: "",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "Slot coordination required",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "No Significant Impact",
            details: "No significant connection issues",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "AED 5,200",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "+0.3%",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "N/A",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Low",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft B737-800",
          summary:
            "Maintains current operational plan with minimal adjustments required.",
        },
      },
      details: null,
      created_at: "2025-08-09T08:31:00.000Z",
      updated_at: "2025-08-09T08:31:00.000Z",
    },
  ];
};

// Use embedded crew issues recovery data
const getCrewIssuesRecoveryData = () => {
  return [
    {
      title: "Assign Standby Crew",
      description: "Capt. Mohammed Al-Zaabi from standby roster",
      cost: "AED 8,500",
      timeline: "30 minutes",
      confidence: 92,
      impact: "Minimal operational disruption",
      status: "recommended",
      priority: 1,
      advantages: [
        "Qualified crew replacement available",
        "Regulatory compliance maintained",
        "Minimal network disruption",
      ],
      considerations: [
        "Crew coordination required",
        "Extended briefing time",
        "Additional operational costs",
      ],
      impact_area: ["crew"],
      impact_summary: `Crew issue recovery for FZ181: Standard crew replacement procedure with qualified personnel.`,
      resource_requirements: [
        {
          title: "Replacement Captain",
          subtitle: "Standby Captain",
          availability: "Confirmed",
          status: "En Route",
          location: "Crew Hotel/Rest Area",
          eta: "25 minutes",
          details: "Type-rated captain with required flight hours",
        },
        {
          title: "Replacement First Officer",
          subtitle: "Standby First Officer",
          availability: "Confirmed",
          status: "Ready",
          location: "Crew Rest Area",
          eta: "5 minutes",
          details: "Qualified first officer within duty limits",
        },
        {
          title: "Cabin Crew",
          subtitle: "Original/Replacement Cabin Crew",
          availability: "Available",
          status: "Ready",
          location: "Gate Area",
          eta: "On Location",
          details: "Cabin crew assessment and replacement if needed",
        },
        {
          title: "Training Coordinator",
          subtitle: "Training Captain (TRI)",
          availability: "On Call",
          status: "Responding",
          location: "Training Center",
          eta: "15 minutes",
          details: "Extended crew briefing and documentation support",
        },
      ],
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 5,525",
            category: "Standby Crew Activation",
            percentage: 65,
            description: "Call-out pay for replacement crew",
          },
          {
            amount: "AED 1,360",
            category: "Extended Briefing Costs",
            percentage: 16,
            description: "Training coordinator and materials",
          },
          {
            amount: "AED 850",
            category: "Crew Transportation",
            percentage: 10,
            description: "Transport to airport",
          },
          {
            amount: "AED 765",
            category: "Administrative Processing",
            percentage: 9,
            description: "Duty time documentation, roster changes",
          },
        ],
        total: {
          amount: "AED 8,500",
          title: "Total Estimated Cost",
          description: "Ground handling and coordination",
        },
      },
      timeline_details: [
        {
          step: "Standby Crew Activation",
          status: "completed",
          details: "Contact and confirm availability of standby crew",
          startTime: "15:58",
          endTime: "16:06",
          duration: "8 min",
        },
        {
          step: "Crew Transportation",
          status: "in-progress",
          details: "Transport crew to airport",
          startTime: "16:06",
          endTime: "23:36",
          duration: "450 min",
        },
        {
          step: "Extended Safety Briefing",
          status: "pending",
          details: "Route-specific briefing and documentation",
          startTime: "23:28",
          endTime: "09:58",
          duration: "630 min",
        },
        {
          step: "Pre-flight Preparation",
          status: "pending",
          details: "Aircraft checks and passenger boarding prep",
          startTime: "09:58",
          endTime: "17:28",
          duration: "450 min",
        },
        {
          step: "Departure Clearance",
          status: "pending",
          details: "Final clearances and departure",
          startTime: "21:48",
          endTime: "21:58",
          duration: "10 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Standby Crew Unavailable",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation: "Multiple qualified crew members confirmed available",
        },
        {
          risk: "Extended Briefing Time",
          risk_impact: "Medium",
          mitigation_impact: "Low",
          score: 2,
          mitigation: "Pre-briefing materials prepared, time buffers included",
        },
        {
          risk: "Regulatory Compliance Issues",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation: "All crew qualifications verified, documentation current",
        },
        {
          risk: "Crew Coordination Challenges",
          risk_impact: "Low",
          mitigation_impact: "Medium",
          score: 2,
          mitigation: "Training coordinator available, standardized procedures",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Emergency crew replacement with extended briefing and qualification verification",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "Crew Management System",
            "Training Records Database",
            "Duty Time Tracking",
            "Qualification Verification System",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "GCAA Crew Licensing",
            "Flydubai Type Ratings",
            "Current Medical Certificates",
            "Route Qualifications",
          ],
        },
        crew_qualifications: {
          title: "Crew qualifications",
          details:
            "All replacement crew verified current on aircraft type, route qualified",
        },
        duty_time_compliance: {
          title: "Duty time compliance",
          details:
            "Fresh crew well within all regulatory duty time limitations and rest requirements",
        },
        briefing_requirements: {
          title: "Briefing requirements",
          details:
            "Extended briefing for crew pairing, weather, NOTAMs, special procedures, and current conditions",
        },
        backup_resources: {
          title: "Backup resources",
          details:
            "Additional standby crew available if primary replacement unavailable",
        },
        training_status: {
          title: "Training status",
          details:
            "All crew current on recurrent training, emergency procedures, and company standards",
        },
      },
      metrics: {
        costEfficiency: 85,
        timeEfficiency: 80,
        passengerSatisfaction: 75,
        crewViolations: 1,
        aircraftSwaps: 0,
        networkImpact: "None",
      },
      crew_available: availableDummyCrew,
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "A6-FED",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "exact",
              value: "Exact",
            },
            availability: "Original Aircraft",
            assigned: {
              status: "none",
              value: "None",
            },
            turnaround: "45 min",
            maintenance: {
              status: "current",
              value: "Current",
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%",
            },
          },
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [
              {
                code: "B737",
                name: "B737 Type Rating",
              },
            ],
            status: "Duty Time Exceeded",
            issue: "Exceeded maximum allowable duty hours under regulations",
            experience_years: 18,
            base: "DXB",
            languages: ["English", "Arabic"],
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First Officer",
            qualifications: [
              {
                code: "B737M",
                name: "B737 MAX Type Rating",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 7,
            base: "LHR",
            languages: ["English", "French"],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior Cabin Crew",
            qualifications: [
              {
                code: "SCC",
                name: "Senior Cabin Crew Certification",
              },
              {
                code: "SEP",
                name: "Safety & Emergency Procedures",
              },
            ],
            status: "Rest Violation",
            issue: "Insufficient mandatory rest period before next duty",
            experience_years: 11,
            base: "JFK",
            languages: ["English", "Spanish"],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin Crew",
            qualifications: [
              {
                code: "CC",
                name: "Cabin Crew Certification",
              },
              {
                code: "MEDFA",
                name: "Medical First Aid",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 5,
            base: "MAD",
            languages: ["English", "Spanish", "Portuguese"],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: "FZ456 DXB-BOM",
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Flight cancellation",
          },
          {
            flight: "FZ457 BOM-DXB",
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Route cancellation",
          },
          {
            flight: "FZ890 DXB-DEL",
            departure: "Dep: 08:30 (Next Day)",
            impact: "No Impact",
            reason: "Different aircraft",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Same gate assignment maintained",
            details: "",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "Coordination required",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "No Significant Impact",
            details: "No significant connection issues",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "AED 5,200",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "+0.3%",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "N/A",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Low",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft B737-800",
          summary:
            "Maintains current operational plan with minimal adjustments required.",
        },
      },
      details: null,
      created_at: "2025-08-11T10:30:00.000Z",
      updated_at: "2025-08-11T10:30:00.000Z",
    },
    {
      title: "Deadhead Crew",
      description: "Position qualified Captain from Abu Dhabi",
      cost: "AED 25,000",
      timeline: "120 minutes",
      confidence: 85,
      impact: "Moderate schedule delay",
      status: "caution",
      priority: 1,
      advantages: [
        "Qualified crew replacement available",
        "Regulatory compliance maintained",
        "Minimal network disruption",
      ],
      considerations: [
        "Crew coordination required",
        "Extended briefing time",
        "Additional operational costs",
      ],
      impact_area: ["crew"],
      impact_summary: `Crew issue recovery for FZ181: Standard crew replacement procedure with qualified personnel.`,
      resource_requirements: [
        {
          title: "Replacement Captain",
          subtitle: "Standby Captain",
          availability: "Confirmed",
          status: "En Route",
          location: "Crew Hotel/Rest Area",
          eta: "25 minutes",
          details: "Type-rated captain with required flight hours",
        },
        {
          title: "Replacement First Officer",
          subtitle: "Standby First Officer",
          availability: "Confirmed",
          status: "Ready",
          location: "Crew Rest Area",
          eta: "5 minutes",
          details: "Qualified first officer within duty limits",
        },
        {
          title: "Cabin Crew",
          subtitle: "Original/Replacement Cabin Crew",
          availability: "Available",
          status: "Ready",
          location: "Gate Area",
          eta: "On Location",
          details: "Cabin crew assessment and replacement if needed",
        },
        {
          title: "Training Coordinator",
          subtitle: "Training Captain (TRI)",
          availability: "On Call",
          status: "Responding",
          location: "Training Center",
          eta: "15 minutes",
          details: "Extended crew briefing and documentation support",
        },
      ],
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 16,250",
            category: "Standby Crew Activation",
            percentage: 65,
            description: "Call-out pay for replacement crew",
          },
          {
            amount: "AED 4,000",
            category: "Extended Briefing Costs",
            percentage: 16,
            description: "Training coordinator and materials",
          },
          {
            amount: "AED 2,500",
            category: "Crew Transportation",
            percentage: 10,
            description: "Transport to airport",
          },
          {
            amount: "AED 2,250",
            category: "Administrative Processing",
            percentage: 9,
            description: "Duty time documentation, roster changes",
          },
        ],
        total: {
          amount: "AED 25,000",
          title: "Total Estimated Cost",
          description: "Ground handling and coordination",
        },
      },
      timeline_details: [
        {
          step: "Standby Crew Activation",
          status: "completed",
          details: "Contact and confirm availability of standby crew",
          startTime: "16:48",
          endTime: "16:56",
          duration: "8 min",
        },
        {
          step: "Crew Transportation",
          status: "in-progress",
          details: "Transport crew to airport",
          startTime: "16:56",
          endTime: "22:56",
          duration: "1800 min",
        },
        {
          step: "Extended Safety Briefing",
          status: "pending",
          details: "Route-specific briefing and documentation",
          startTime: "22:48",
          endTime: "16:48",
          duration: "2520 min",
        },
        {
          step: "Pre-flight Preparation",
          status: "pending",
          details: "Aircraft checks and passenger boarding prep",
          startTime: "16:48",
          endTime: "22:48",
          duration: "1800 min",
        },
        {
          step: "Departure Clearance",
          status: "pending",
          details: "Final clearances and departure",
          startTime: "16:38",
          endTime: "16:48",
          duration: "10 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Standby Crew Unavailable",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation: "Multiple qualified crew members confirmed available",
        },
        {
          risk: "Extended Briefing Time",
          risk_impact: "Medium",
          mitigation_impact: "Low",
          score: 2,
          mitigation: "Pre-briefing materials prepared, time buffers included",
        },
        {
          risk: "Regulatory Compliance Issues",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation: "All crew qualifications verified, documentation current",
        },
        {
          risk: "Crew Coordination Challenges",
          risk_impact: "Low",
          mitigation_impact: "Medium",
          score: 2,
          mitigation: "Training coordinator available, standardized procedures",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Emergency crew replacement with extended briefing and qualification verification",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "Crew Management System",
            "Training Records Database",
            "Duty Time Tracking",
            "Qualification Verification System",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "GCAA Crew Licensing",
            "Flydubai Type Ratings",
            "Current Medical Certificates",
            "Route Qualifications",
          ],
        },
        crew_qualifications: {
          title: "Crew qualifications",
          details:
            "All replacement crew verified current on aircraft type, route qualified",
        },
        duty_time_compliance: {
          title: "Duty time compliance",
          details:
            "Fresh crew well within all regulatory duty time limitations and rest requirements",
        },
        briefing_requirements: {
          title: "Briefing requirements",
          details:
            "Extended briefing for crew pairing, weather, NOTAMs, special procedures, and current conditions",
        },
        backup_resources: {
          title: "Backup resources",
          details:
            "Additional standby crew available if primary replacement unavailable",
        },
        training_status: {
          title: "Training status",
          details:
            "All crew current on recurrent training, emergency procedures, and company standards",
        },
      },
      metrics: {
        crewViolations: 1,
        aircraftSwaps: 0,
        networkImpact: "Low",
      },
      crew_available: availableDummyCrew,
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "A6-FED",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "exact",
              value: "Exact",
            },
            availability: "Original Aircraft",
            assigned: {
              status: "none",
              value: "None",
            },
            turnaround: "45 min",
            maintenance: {
              status: "current",
              value: "Current",
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%",
            },
          },
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [
              {
                code: "B737",
                name: "B737 Type Rating",
              },
            ],
            status: "Duty Time Exceeded",
            issue: "Exceeded maximum allowable duty hours under regulations",
            experience_years: 18,
            base: "DXB",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "AR",
                name: "Arabic",
              },
            ],
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First Officer",
            qualifications: [
              {
                code: "B737M",
                name: "B737/MAX Type Rating",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 7,
            base: "LHR",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "FR",
                name: "French",
              },
            ],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior Cabin Crew",
            qualifications: [
              {
                code: "SCC",
                name: "Senior Cabin Crew Certification",
              },
              {
                code: "SEP",
                name: "Safety & Emergency Procedures",
              },
            ],
            status: "Rest Violation",
            issue: "Insufficient mandatory rest period before next duty",
            experience_years: 12,
            base: "JFK",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "ES",
                name: "Spanish",
              },
            ],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin Crew",
            qualifications: [
              {
                code: "CC",
                name: "Cabin Crew Certification",
              },
              {
                code: "MEDFA",
                name: "Medical First Aid",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 5,
            base: "MAD",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "PT",
                name: "Portuguese",
              },
            ],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: "FZ456 DXB-BOM",
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Flight cancellation",
          },
          {
            flight: "FZ457 BOM-DXB",
            departure: "Cancelled",
            impact: "High Impact",
            reason: "Route cancellation",
          },
          {
            flight: "FZ890 DXB-DEL",
            departure: "Dep: 08:30 (Next Day)",
            impact: "No Impact",
            reason: "Different aircraft",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Same gate assignment maintained",
            details: "",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "Coordination required",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "No Significant Impact",
            details: "No significant connection issues",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "AED 5,200",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "+0.3%",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "N/A",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Low",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft B737-800",
          summary:
            "Maintains current operational plan with minimal adjustments required.",
        },
      },
      details: null,
      created_at: "2025-08-11T11:00:00.000Z",
      updated_at: "2025-08-11T11:00:00.000Z",
    },
    {
      title: "Delay for Crew Rest Completion",
      description: "Wait for original crew mandatory rest period",
      cost: "AED 45,000",
      timeline: "3 hours",
      confidence: 65,
      impact: "Significant passenger disruption",
      status: "warning",
      priority: 1,
      advantages: [
        "Qualified crew replacement available",
        "Regulatory compliance maintained",
        "Minimal network disruption",
      ],
      considerations: [
        "Crew coordination required",
        "Extended briefing time",
        "Additional operational costs",
      ],
      impact_area: ["crew", "passenger"],
      impact_summary: `Crew issue recovery for FZ181: Standard crew replacement procedure with qualified personnel.`,
      resource_requirements: [
        {
          title: "Terminal Services",
          subtitle: "Passenger Amenities",
          availability: "Available",
          status: "Ready",
          location: "Terminal Lounges",
          eta: "Immediate",
          details: "Lounge access and refreshment services",
        },
        {
          title: "Technical Support",
          subtitle: "Maintenance Team",
          availability: "Available",
          status: "Responding",
          location: "Aircraft Stand",
          eta: "15 minutes",
          details: "Quick resolution team and equipment",
        },
        {
          title: "Customer Service",
          subtitle: "Ground Staff",
          availability: "Available",
          status: "Deployed",
          location: "Gate Area",
          eta: "On Location",
          details: "Customer service team for passenger updates",
        },
        {
          title: "Communication",
          subtitle: "Passenger Information System",
          availability: "Active",
          status: "Broadcasting",
          location: "Terminal Wide",
          eta: "Immediate",
          details: "Real-time updates via displays and announcements",
        },
      ],
      cost_breakdown: {
        breakdown: [
          {
            amount: "AED 18,000",
            category: "Delay Coordination",
            percentage: 40,
            description: "Operational delay management",
          },
          {
            amount: "AED 15,750",
            category: "Passenger Services",
            percentage: 35,
            description: "Terminal amenities and refreshments",
          },
          {
            amount: "AED 6,750",
            category: "Crew Overtime",
            percentage: 15,
            description: "Extended crew duty time",
          },
          {
            amount: "AED 4,500",
            category: "Administrative Costs",
            percentage: 10,
            description: "Documentation and notifications",
          },
        ],
        total: {
          amount: "AED 45,000",
          title: "Total Estimated Cost",
          description: "Ground handling and coordination",
        },
      },
      timeline_details: [
        {
          step: "Passenger Notification",
          status: "completed",
          details: "Immediate passenger notification",
          startTime: "17:05",
          endTime: "17:10",
          duration: "5 min",
        },
        {
          step: "Terminal Services Setup",
          status: "completed",
          details: "Arrange terminal amenities and refreshments",
          startTime: "17:10",
          endTime: "17:25",
          duration: "15 min",
        },
        {
          step: "Issue Resolution",
          status: "in-progress",
          details: "Resolve technical or operational issues",
          startTime: "17:25",
          endTime: "19:55",
          duration: "150 min",
        },
        {
          step: "Boarding & Departure",
          status: "pending",
          details: "Complete boarding and departure",
          startTime: "19:55",
          endTime: "20:05",
          duration: "10 min",
        },
      ],
      risk_assessment: [
        {
          risk: "Extended Resolution Time",
          risk_impact: "Medium",
          mitigation_impact: "Medium",
          score: 4,
          mitigation: "Technical teams responding, time buffers included",
        },
        {
          risk: "Passenger Dissatisfaction",
          risk_impact: "Medium",
          mitigation_impact: "Low",
          score: 2,
          mitigation: "Terminal amenities and regular updates provided",
        },
        {
          risk: "Connecting Flight Impacts",
          risk_impact: "High",
          mitigation_impact: "Medium",
          score: 6,
          mitigation: "Rebooking team active, partner airline coordination",
        },
        {
          risk: "Weather Window Closure",
          risk_impact: "Low",
          mitigation_impact: "High",
          score: 3,
          mitigation: "Weather monitoring, alternative plans prepared",
        },
      ],
      technical_specs: {
        implementation: {
          title: "Implementation",
          details:
            "Comprehensive delay management with passenger care and issue resolution",
        },
        systems_required: {
          title: "Systems required",
          details: [
            "Terminal Services System",
            "Passenger Notification Platform",
            "Maintenance Support Systems",
          ],
        },
        certifications: {
          title: "Certifications",
          details: [
            "EU261 Compliance",
            "UAE Passenger Rights Compliance",
            "IATA Resolution 824",
          ],
        },
        maintenance_status: {
          title: "Maintenance status",
          details:
            "Technical teams assigned for issue resolution during delay period",
        },
        time_framework: {
          title: "Time framework",
          details:
            "3-hour window allows for comprehensive issue resolution and passenger care",
        },
        weather_limitations: {
          title: "Weather limitations",
          details:
            "Weather conditions monitored, improvement timeline assessed",
        },
        passenger_care: {
          title: "Passenger care",
          details: "Terminal amenities and refreshment services provided",
        },
        regulatory_compliance: {
          title: "Regulatory compliance",
          details:
            "Meets all passenger care requirements for delay duration and circumstances",
        },
      },
      metrics: {
        crewViolations: 1,
        aircraftSwaps: 0,
        networkImpact: "Medium",
      },
      rotation_plan: {
        aircraftOptions: [
          {
            reg: "A6-FED",
            type: "B737-800 (189Y)",
            etops: {
              status: "available",
              value: "180min",
            },
            cabinMatch: {
              status: "exact",
              value: "Exact",
            },
            availability: "Delayed 3 hours",
            assigned: {
              status: "none",
              value: "None",
            },
            turnaround: "30 min",
            maintenance: {
              status: "current",
              value: "Current",
            },
            option_score: {
              cost_score: "92%",
              delay_score: "88%",
              crew_impact: "95%",
              fuel_score: "91%",
              overall: "92%",
            },
          },
        ],
        crew: [
          {
            name: "Capt. Ahmed Al-Mansouri",
            role_code: "CAPT",
            role: "Captain",
            qualifications: [
              {
                code: "B737",
                name: "B737 Type Rating",
              },
            ],
            status: "Fatigue Risk",
            issue: "Replacement required due to fatigue limits",
            experience_years: 18,
            base: "DXB",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "AR",
                name: "Arabic",
              },
            ],
          },
          {
            name: "FO Sarah Johnson",
            role_code: "FO",
            role: "First Officer",
            qualifications: [
              {
                code: "B737M",
                name: "B737/MAX Type Rating",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 7,
            base: "LHR",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "FR",
                name: "French",
              },
            ],
          },
          {
            name: "SSCC Lisa Martinez",
            role_code: "SCC",
            role: "Senior Cabin Crew",
            qualifications: [
              {
                code: "SCC",
                name: "Senior Cabin Crew Certification",
              },
              {
                code: "SEP",
                name: "Safety & Emergency Procedures",
              },
            ],
            status: "Approaching Duty Limit",
            issue: "Crew nearing maximum allowed duty period",
            experience_years: 12,
            base: "JFK",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "ES",
                name: "Spanish",
              },
            ],
          },
          {
            name: "CC Maria Santos",
            role_code: "CC",
            role: "Cabin Crew",
            qualifications: [
              {
                code: "CC",
                name: "Cabin Crew Certification",
              },
              {
                code: "MEDFA",
                name: "Medical First Aid",
              },
            ],
            status: "Available",
            issue: null,
            experience_years: 5,
            base: "MAD",
            languages: [
              {
                code: "EN",
                name: "English",
              },
              {
                code: "PT",
                name: "Portuguese",
              },
            ],
          },
        ],
        crew_constraint: {
          duty_time: {
            disruption: "",
            details: "6h 15m of 8h 20m limit",
          },
          rest_requirement: {
            disruption: "Min 12h rest required after duty",
            details: "Next availability: Tomorrow 08:00",
          },
          deadhead: {
            disruption: "2 crew members need positioning to DXB",
            details: "Commercial flights available",
          },
          fatigue_report: {
            disruption: "1 crew member reported fatigue",
            details: "Replacement required",
          },
        },
        nextSectors: [
          {
            flight: "FZ456 DXB-BOM",
            departure: "Dep: 18:30 → 17:11 (+3 hours)",
            impact: "Medium Impact",
            reason: "Direct delay impact",
          },
          {
            flight: "FZ457 BOM-DXB",
            departure: "Dep: 22:15 (On Time)",
            impact: "Low Impact",
            reason: "Sufficient turnaround",
          },
          {
            flight: "FZ890 DXB-DEL",
            departure: "Dep: 08:30 (Next Day)",
            impact: "No Impact",
            reason: "Overnight recovery",
          },
        ],
        operationalConstraints: {
          gateCompatibility: {
            status: "Same gate assignment maintained",
            details: "",
          },
          slotCapacity: {
            status: "Coordination Required",
            details: "COK slot coordination required",
          },
          curfewViolation: {
            status: "No Risk",
            details: "Within curfew limits",
          },
          passengerConnections: {
            status: "High Impact",
            details: "49 passengers miss onward connections",
          },
        },
        costBreakdown: {
          delayCost: {
            metric_value: "$840",
            detail: "Including compensation",
          },
          fuelEfficiency: {
            metric_value: "+0.8%",
            detail: "vs original aircraft",
          },
          hotelTransport: {
            metric_value: "N/A",
            detail: "Crew accommodation",
          },
          eu261Risk: {
            metric_value: "Low",
            detail: "€600 per passenger",
          },
        },
        recommended_option: {
          option: "Aircraft B737-800",
          summary:
            "Manageable delay impact with 65% confidence. Maintains operational continuity with minimal crew changes.",
        },
      },
      crew_available: availableDummyCrew,
      details: null,
      created_at: "2025-08-11T11:30:00.000Z",
      updated_at: "2025-08-11T11:30:00.000Z",
    },
  ];
};

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
  const options = getAircraftIssuesRecoveryData();
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
      details: `Crew duty time breach detected for ${flight.flightNumber || flight.flight_number}`,
      data: {
        flightNumber: flight.flightNumber || flight.flight_number,
        crewMember: "Capt. Mohammed Al-Zaabi",
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
    {
      step: 3,
      title: "Recovery Options Generated",
      status: "completed",
      timestamp: "13:50:00",
      system: "Recovery Engine",
      details: "Crew issue recovery options generated from embedded templates",
      data: {
        optionsGenerated: 3,
        source: "Embedded crew recovery templates",
      },
    },
  ];
  
  const crewIssuesRecoveryData = getCrewIssuesRecoveryData();

  const options = crewIssuesRecoveryData.map((option, index) => ({
    ...option,
    id: `CREW_ISSUE_${index + 1}`,
    title: option.title,
    description: option.description,
    cost: option.cost,
    timeline: option.timeline,
    confidence: option.confidence,
    impact: option.impact,
    status: option.status,
    priority: option.priority || 1,
    category: "Crew Issue",
    advantages: option.advantages || [
      "Qualified crew replacement available",
      "Regulatory compliance maintained",
      "Minimal network disruption",
    ],
    considerations: option.considerations || [
      "Crew coordination required",
      "Extended briefing time",
      "Additional operational costs",
    ],
    impact_area: option.impact_area || ["crew"],
    impact_summary:
      option.impact_summary ||
      `Crew issue recovery for ${flight.flightNumber || flight.flight_number}: Standard crew replacement procedure with qualified personnel.`,
    resourceRequirements: option.resource_requirements || [],
    costBreakdown: option.cost_breakdown || {},
    timelineDetails: option.timeline_details || [],
    riskAssessment: option.risk_assessment || [],
    technicalSpecs: option.technical_specs || {},
    metrics: option.metrics || {
      costEfficiency: 85,
      timeEfficiency: 80,
      passengerSatisfaction: 75,
    },
    rotationPlan: option.rotation_plan || {},
  }));

  return { options, steps };
};

const generateWeatherIssueRecovery = (flight) => {
  const steps = [
    {
      step: 1,
      title: "Weather Alert Received",
      status: "completed",
      timestamp: "12:30:00",
      system: "Weather Monitoring System",
      details: `Severe weather conditions detected affecting ${flight.destination || "destination airport"}`,
      data: {
        flightNumber: flight.flightNumber || flight.flight_number,
        weatherType: "Severe Weather Conditions",
        affectedAirport: flight.destination || "DEL",
        severity: "High Impact",
        forecastImprovement: "2-3 hours",
      },
    },
    {
      step: 2,
      title: "Impact Assessment Completed",
      status: "completed",
      timestamp: "12:35:00",
      system: "Operations Control",
      details:
        "Weather impact on flight operations and passenger connections analyzed",
      data: {
        expectedDelay: "2-4 hours",
        passengerCount: flight.passengers || 189,
        connectingFlights: "52 passengers affected",
        alternativeOptions: "Multiple recovery paths identified",
      },
    },
    {
      step: 3,
      title: "Recovery Options Generated",
      status: "completed",
      timestamp: "12:40:00",
      system: "Recovery Engine",
      details:
        "Weather-specific recovery options generated from embedded templates",
      data: {
        optionsGenerated: 3,
        source: "Embedded weather recovery templates",
      },
    },
  ];

  // Use embedded weather issues recovery data
  const weatherIssuesRecoveryData = getWeatherIssuesRecoveryData();
  console.log(
    `Using ${weatherIssuesRecoveryData.length} weather issue recovery options from embedded data`,
  );

  const options = weatherIssuesRecoveryData.map((option, index) => ({
    ...option,
    id: `WEATHER_ISSUE_${index + 1}`,
    title: option.title,
    description: option.description,
    cost: option.cost,
    timeline: option.timeline,
    confidence: option.confidence,
    impact: option.impact,
    status: option.status,
    priority: option.priority || 1,
    category: "Weather Issue",
    advantages: option.advantages || [
      "Weather-appropriate response",
      "Passenger safety prioritized",
      "Regulatory compliance maintained",
    ],
    considerations: option.considerations || [
      "Weather dependency",
      "Potential for further delays",
      "Passenger accommodation required",
    ],
    impact_area: option.impact_area || ["weather", "schedule"],
    impact_summary:
      option.impact_summary ||
      `Weather delay recovery for ${flight.flightNumber || flight.flight_number}: Weather-related operational adjustments with passenger care provisions.`,
    resourceRequirements: option.resource_requirements || [],
    costBreakdown: option.cost_breakdown || {},
    timelineDetails: option.timeline_details || [],
    riskAssessment: option.risk_assessment || [],
    technicalSpecs: option.technical_specs || {},
    metrics: option.metrics || {
      costEfficiency: 75,
      timeEfficiency: 70,
      passengerSatisfaction: 65,
    },
    rotationPlan: option.rotation_plan || {},
  }));

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
      impact_area: ["curfew", "schedule", "operations"],
      impact_summary: `Curfew/Congestion recovery for ${flight.flightNumber || flight.flight_number}: Operational adjustments to avoid curfew violations and ensure timely departures.`,
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
      impact_area: ["curfew", "passenger", "schedule"],
      impact_summary: `Curfew/Congestion recovery for ${flight.flightNumber || flight.flight_number}: Operational adjustments to avoid curfew violations and ensure timely departures.`,
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
      impact_area: ["rotation", "maintenance", "schedule"],
      impact_summary: `Rotation/Maintenance recovery for ${flight.flightNumber || flight.flight_number}: Aircraft rotation misalignment requiring immediate aircraft swap to maintain schedule integrity.`,
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
      impact_area: ["rotation", "maintenance", "schedule"],
      impact_summary: `Rotation/Maintenance recovery for ${flight.flightNumber || flight.flight_number}: Aircraft rotation misalignment requiring immediate aircraft swap to maintain schedule integrity.`,
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
export function generateRecoveryOptionsForDisruption(
  disruption,
  categoryInfo = null,
) {
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

  // Use category_code from request if available, otherwise map from disruption type
  const categoryCode =
    categoryInfo?.category_code ||
    disruption.category_code ||
    mapDisruptionTypeToCategory(
      disruption.disruption_type ||
      disruption.disruptionType ||
      disruption.type ||
      "Technical",
      disruption.disruption_reason || "Unknown",
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
    case "WEATHER_ISSUE":
      const weatherResult = generateWeatherIssueRecovery(safeDisruption);
      options = weatherResult.options;
      steps = weatherResult.steps;
      break;

    case "AIRCRAFT_ISSUE":
      const aircraftResult = generateAircraftIssueRecovery(safeDisruption);
      options = aircraftResult.options;
      steps = aircraftResult.steps;
      break;

    case "CREW_ISSUE":
      const crewResult = generateCrewIssueRecovery(safeDisruption);
      options = crewResult.options;
      steps = crewResult.steps;
      break;

    case "CURFEW_CONGESTION":
      const curfewResult = generateCurfewCongestionRecovery(safeDisruption);
      options = curfewResult.options;
      steps = curfewResult.steps;
      break;

    case "ROTATION_MAINTENANCE":
      const rotationResult = generateRotationMisalignmentRecovery(
        safeDisruption,
      );
      options = rotationResult.options;
      steps = rotationResult.steps;
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
          impact_area: ["operations", "schedule"],
          impact_summary: `General disruption recovery for ${safeDisruption.flight_number}: Immediate action to mitigate operational and schedule impacts.`,
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
          impact_area: ["operations", "schedule", "resource"],
          impact_summary: `General disruption recovery for ${safeDisruption.flight_number}: Resource-optimized plan to address operational and schedule impacts with a balanced approach.`,
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
          impact_area: ["operations", "schedule", "passenger", "resource"],
          impact_summary: `General disruption recovery for ${safeDisruption.flight_number}: Comprehensive and robust plan to ensure resolution of all operational, schedule, passenger, and resource-related impacts.`,
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
              phase: "Recovery implementation",
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
    `Generated ${options.length} options and ${steps.length} steps for disruption type: ${categoryCode}`,
  );
  return { options, steps };
}

export {
  mapDisruptionTypeToCategory,
  getWeatherIssuesRecoveryData,
  getAircraftIssuesRecoveryData,
  generateAircraftIssueRecovery,
  generateCrewIssueRecovery,
  generateWeatherIssueRecovery,
};