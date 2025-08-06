
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false
});

// Sample detailed data templates
const sampleRotationPlanData = {
  "AIRCRAFT_SWAP": {
    aircraftOptions: [
      {
        reg: "A6-FED",
        type: "B737-800 (189Y)",
        etops: { status: "available", value: "180min" },
        cabinMatch: { status: "exact", value: "Exact" },
        availability: "Available Now",
        assigned: { status: "none", value: "None" },
        turnaround: "45 min",
        maintenance: { status: "current", value: "Current" },
        recommended: true
      },
      {
        reg: "A6-FEL",
        type: "B737-MAX8 (189Y)",
        etops: { status: "available", value: "180min" },
        cabinMatch: { status: "similar", value: "Similar" },
        availability: "Available 14:30",
        assigned: { status: "assigned", value: "FZ892" },
        turnaround: "60 min",
        maintenance: { status: "current", value: "Current" },
        recommended: false
      }
    ],
    crewData: [
      {
        name: "Capt. Ahmed Al-Mansouri",
        role: "Captain",
        type: "B737 Type Rating",
        status: "Available",
        issue: null
      },
      {
        name: "FO Sarah Johnson",
        role: "First Officer",
        type: "B737/MAX Type Rating",
        status: "Available",
        issue: null
      }
    ],
    nextSectors: [
      {
        flight: "FZ456 DXB-BOM",
        departure: "Dep: 18:30 → 19:45 (+75min)",
        impact: "High Impact",
        reason: "Aircraft swap delay"
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
      },
      passengerConnections: {
        status: "Minimal Impact",
        details: "No significant connection issues"
      }
    },
    costBreakdown: {
      delayCost: 34200,
      fuelEfficiency: "+2.1%",
      hotelTransport: 840,
      eu261Risk: "Medium"
    },
    recommendation: {
      aircraft: "A6-FED",
      reason: "Optimal balance across cost (92%), delay minimization (88%), crew impact (95%), and fuel efficiency (91%). Immediate availability with exact cabin configuration match."
    }
  },
  "DELAY_REPAIR": {
    aircraftOptions: [
      {
        reg: "A6-FDZ",
        type: "B737-800 (189Y)",
        etops: { status: "available", value: "180min" },
        cabinMatch: { status: "exact", value: "Exact" },
        availability: "Delayed 4-6h",
        assigned: { status: "none", value: "None" },
        turnaround: "30 min",
        maintenance: { status: "aog", value: "Under Maintenance" },
        recommended: true
      }
    ],
    crewData: [
      {
        name: "Capt. Ahmed Al-Mansouri",
        role: "Captain",
        type: "B737 Type Rating",
        status: "Available",
        issue: null
      }
    ],
    nextSectors: [
      {
        flight: "FZ456 DXB-BOM",
        departure: "Dep: 18:30 → 22:30 (+4h)",
        impact: "Medium Impact",
        reason: "Direct delay impact"
      }
    ],
    operationalConstraints: {
      gateCompatibility: {
        status: "Original Gate",
        details: "Same gate assignment maintained"
      },
      slotCapacity: {
        status: "Coordination Required",
        details: "Destination slot coordination required"
      },
      curfewViolation: {
        status: "Risk",
        details: "Arrival may violate 23:00 curfew"
      },
      passengerConnections: {
        status: "Affected",
        details: "47 passengers miss onward connections"
      }
    },
    costBreakdown: {
      delayCost: 67200,
      fuelEfficiency: "+0.8%",
      hotelTransport: 8450,
      eu261Risk: "High"
    },
    recommendation: {
      aircraft: "A6-FDZ",
      reason: "Manageable delay impact with 85% confidence. Maintains operational continuity with minimal crew changes."
    }
  }
};

const sampleCostAnalysisData = {
  "AIRCRAFT_SWAP": {
    costCategories: [
      {
        category: "Aircraft Positioning",
        amount: "AED 12,000",
        percentage: 64,
        description: "Aircraft swap and positioning costs",
        breakdown: [
          { item: "Fuel for positioning", cost: "AED 4,500" },
          { item: "Crew positioning", cost: "AED 3,200" },
          { item: "Ground handling", cost: "AED 4,300" }
        ]
      },
      {
        category: "Passenger Handling",
        amount: "AED 4,250",
        percentage: 23,
        description: "Gate change and boarding",
        breakdown: [
          { item: "Gate change coordination", cost: "AED 1,800" },
          { item: "Passenger notifications", cost: "AED 1,200" },
          { item: "Additional boarding time", cost: "AED 1,250" }
        ]
      }
    ],
    totalCost: 18750,
    costComparison: {
      vsDelay: { difference: "-AED 15,000", percentage: "-44%" },
      vsCancellation: { difference: "-AED 31,250", percentage: "-62%" }
    },
    savingsAnalysis: {
      passengerCompensation: "AED 8,400 saved",
      hotelCosts: "AED 12,500 saved",
      revenueProtection: "AED 45,000 protected"
    }
  }
};

const sampleTimelineData = {
  "AIRCRAFT_SWAP": {
    timelineSteps: [
      {
        step: "Aircraft Identification",
        duration: "15 min",
        startTime: "14:00",
        endTime: "14:15",
        details: "Identify and confirm alternative aircraft availability",
        status: "completed",
        dependencies: ["Maintenance clearance", "Crew availability"],
        criticalPath: true
      },
      {
        step: "Crew Briefing",
        duration: "20 min",
        startTime: "14:15",
        endTime: "14:35",
        details: "Brief crew on aircraft change and specific considerations",
        status: "in-progress",
        dependencies: ["Aircraft confirmation"],
        criticalPath: true
      },
      {
        step: "Passenger Transfer",
        duration: "30 min",
        startTime: "14:35",
        endTime: "15:05",
        details: "Transfer passengers and luggage to new aircraft",
        status: "pending",
        dependencies: ["Gate coordination"],
        criticalPath: false
      }
    ],
    criticalPath: {
      totalDuration: "75 minutes",
      steps: ["Aircraft Identification", "Crew Briefing", "Final Checks"],
      bottlenecks: ["Crew briefing time", "Aircraft positioning"]
    },
    milestones: [
      {
        name: "Aircraft Confirmed",
        time: "14:15",
        status: "completed"
      },
      {
        name: "Crew Ready",
        time: "14:35",
        status: "in-progress"
      }
    ]
  }
};

const sampleResourceData = {
  "AIRCRAFT_SWAP": {
    personnelRequirements: [
      {
        type: "Flight Crew",
        resource: "Captain + First Officer",
        availability: "Available",
        status: "Confirmed",
        location: "DXB Crew Room",
        eta: "Immediate",
        details: "Type-rated crew available for B737-800"
      },
      {
        type: "Ground Crew",
        resource: "Ramp Team (6 persons)",
        availability: "Available",
        status: "Dispatched",
        location: "Gate C15",
        eta: "10 minutes",
        details: "Standard ground handling crew for aircraft positioning"
      }
    ],
    equipmentRequirements: [
      {
        type: "Ground Support",
        resource: "Aircraft Tug",
        availability: "Available",
        status: "En Route",
        location: "Maintenance Hangar",
        eta: "15 minutes",
        details: "Required for aircraft positioning to gate"
      }
    ],
    facilityRequirements: [
      {
        type: "Gate",
        resource: "Gate C15",
        availability: "Reserved",
        status: "Confirmed",
        location: "Terminal 2",
        eta: "Immediate",
        details: "Gate reserved for aircraft swap operation"
      }
    ],
    availabilityStatus: {
      overall: "95% Ready",
      constraints: ["Tug positioning time"],
      riskFactors: ["Weather conditions", "ATC delays"]
    }
  }
};

const sampleTechnicalSpecs = {
  "AIRCRAFT_SWAP": {
    aircraftSpecs: {
      originalAircraft: {
        registration: "A6-FDZ",
        type: "B737-800",
        configuration: "189Y",
        etopsRating: "180min"
      },
      replacementAircraft: {
        registration: "A6-FED",
        type: "B737-800",
        configuration: "189Y",
        etopsRating: "180min"
      },
      compatibility: "100% - Identical aircraft type and configuration"
    },
    operationalConstraints: {
      fuelRequirements: "Standard + 10% contingency",
      crewRequirements: "B737 type rating mandatory",
      maintenanceStatus: "Current - A-Check due in 150 flight hours",
      performanceData: "Identical to original aircraft"
    },
    regulatoryRequirements: [
      "GCAA approval for aircraft change",
      "Crew currency verification",
      "Maintenance log transfer",
      "Weight and balance recalculation"
    ],
    weatherLimitations: {
      minimumVisibility: "1200m",
      maximumCrosswind: "25 knots",
      ceilingMinimum: "200ft",
      operationalConstraints: "Standard Category II approach capability"
    }
  }
};

async function populateDetailedRecoveryData() {
  console.log('🔄 Starting detailed recovery data population...');
  
  try {
    // Get all recovery options
    const recoveryOptionsResult = await pool.query(`
      SELECT id, title, disruption_id
      FROM recovery_options
      ORDER BY id
    `);
    
    console.log(`Found ${recoveryOptionsResult.rows.length} recovery options to populate`);
    
    for (const option of recoveryOptionsResult.rows) {
      console.log(`Processing option: ${option.title} (ID: ${option.id})`);
      
      // Determine data type based on option title
      let dataType = "STANDARD";
      if (option.title.toLowerCase().includes("swap")) {
        dataType = "AIRCRAFT_SWAP";
      } else if (option.title.toLowerCase().includes("delay")) {
        dataType = "DELAY_REPAIR";
      }
      
      // Insert rotation plan details
      if (sampleRotationPlanData[dataType]) {
        await pool.query(`
          INSERT INTO rotation_plan_details (
            recovery_option_id, aircraft_options, crew_data, next_sectors,
            operational_constraints, cost_breakdown, recommendation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT DO NOTHING
        `, [
          option.id,
          JSON.stringify(sampleRotationPlanData[dataType].aircraftOptions),
          JSON.stringify(sampleRotationPlanData[dataType].crewData),
          JSON.stringify(sampleRotationPlanData[dataType].nextSectors),
          JSON.stringify(sampleRotationPlanData[dataType].operationalConstraints),
          JSON.stringify(sampleRotationPlanData[dataType].costBreakdown),
          JSON.stringify(sampleRotationPlanData[dataType].recommendation)
        ]);
      }
      
      // Insert cost analysis details
      if (sampleCostAnalysisData[dataType]) {
        await pool.query(`
          INSERT INTO cost_analysis_details (
            recovery_option_id, cost_categories, total_cost,
            cost_comparison, savings_analysis
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [
          option.id,
          JSON.stringify(sampleCostAnalysisData[dataType].costCategories),
          sampleCostAnalysisData[dataType].totalCost,
          JSON.stringify(sampleCostAnalysisData[dataType].costComparison),
          JSON.stringify(sampleCostAnalysisData[dataType].savingsAnalysis)
        ]);
      }
      
      // Insert timeline details
      if (sampleTimelineData[dataType]) {
        await pool.query(`
          INSERT INTO timeline_details (
            recovery_option_id, timeline_steps, critical_path,
            dependencies, milestones
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [
          option.id,
          JSON.stringify(sampleTimelineData[dataType].timelineSteps),
          JSON.stringify(sampleTimelineData[dataType].criticalPath),
          JSON.stringify([]), // dependencies
          JSON.stringify(sampleTimelineData[dataType].milestones)
        ]);
      }
      
      // Insert resource details
      if (sampleResourceData[dataType]) {
        await pool.query(`
          INSERT INTO resource_details (
            recovery_option_id, personnel_requirements, equipment_requirements,
            facility_requirements, availability_status
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [
          option.id,
          JSON.stringify(sampleResourceData[dataType].personnelRequirements),
          JSON.stringify(sampleResourceData[dataType].equipmentRequirements),
          JSON.stringify(sampleResourceData[dataType].facilityRequirements),
          JSON.stringify(sampleResourceData[dataType].availabilityStatus)
        ]);
      }
      
      // Insert technical specifications
      if (sampleTechnicalSpecs[dataType]) {
        await pool.query(`
          INSERT INTO technical_specifications (
            recovery_option_id, aircraft_specs, operational_constraints,
            regulatory_requirements, weather_limitations
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [
          option.id,
          JSON.stringify(sampleTechnicalSpecs[dataType].aircraftSpecs),
          JSON.stringify(sampleTechnicalSpecs[dataType].operationalConstraints),
          JSON.stringify(sampleTechnicalSpecs[dataType].regulatoryRequirements),
          JSON.stringify(sampleTechnicalSpecs[dataType].weatherLimitations)
        ]);
      }
      
      console.log(`✅ Populated detailed data for option: ${option.title}`);
    }
    
    console.log('🎉 Detailed recovery data population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating detailed recovery data:', error);
  } finally {
    await pool.end();
  }
}

// Run the population
populateDetailedRecoveryData();
