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
        registration: "A6-FED",
        type: "B737-800",
        location: "DXB Gate C15",
        availability: "Available",
        suitability: "100% - Same aircraft type"
      }
    ],
    crewData: [
      {
        role: "Captain",
        name: "Sarah Johnson",
        qualification: "B737 Type Rating",
        availability: "Available"
      }
    ],
    nextSectors: [
      {
        flightNumber: "FZ125",
        route: "DXB-BOM",
        scheduledTime: "14:30",
        impact: "Minimal delay expected"
      }
    ]
  },
  "DELAY_REPAIR": {
    aircraftOptions: [
      {
        registration: "A6-FDB",
        type: "B737-800",
        location: "DXB Maintenance",
        availability: "Under Repair",
        suitability: "Original aircraft"
      }
    ],
    crewData: [
      {
        role: "Maintenance Team",
        name: "Technical Services",
        qualification: "B737 Certified",
        availability: "On Site"
      }
    ],
    nextSectors: []
  },
  "STANDARD": {
    aircraftOptions: [],
    crewData: [],
    nextSectors: []
  }
};

const sampleCostAnalysisData = {
  "AIRCRAFT_SWAP": {
    costCategories: [
      { category: "Aircraft Positioning", amount: 8750, percentage: 35 },
      { category: "Ground Handling", amount: 6250, percentage: 25 },
      { category: "Passenger Services", amount: 6250, percentage: 25 },
      { category: "Administrative", amount: 3750, percentage: 15 }
    ],
    totalCost: 25000,
    costComparison: {
      baseline: 25000,
      alternative: 45000,
      savings: 20000
    }
  },
  "DELAY_REPAIR": {
    costCategories: [
      { category: "Maintenance Labor", amount: 2550, percentage: 30 },
      { category: "Parts", amount: 2125, percentage: 25 },
      { category: "Passenger Compensation", amount: 2975, percentage: 35 },
      { category: "Operations", amount: 850, percentage: 10 }
    ],
    totalCost: 8500,
    costComparison: {
      baseline: 8500,
      alternative: 25000,
      savings: 16500
    }
  }
};

const sampleTimelineData = {
  "AIRCRAFT_SWAP": {
    timelineSteps: [
      { step: "Identify Spare Aircraft", duration: "10 min", status: "completed" },
      { step: "Position Aircraft", duration: "15 min", status: "in-progress" },
      { step: "Crew Reassignment", duration: "20 min", status: "pending" },
      { step: "Passenger Transfer", duration: "20 min", status: "pending" },
      { step: "Final Checks", duration: "10 min", status: "pending" }
    ],
    criticalPath: {
      totalDuration: "75 minutes",
      criticalSteps: ["Position Aircraft", "Passenger Transfer"]
    }
  },
  "DELAY_REPAIR": {
    timelineSteps: [
      { step: "Diagnostics", duration: "45 min", status: "completed" },
      { step: "Parts Procurement", duration: "60 min", status: "in-progress" },
      { step: "Repair Work", duration: "90 min", status: "pending" },
      { step: "Testing", duration: "30 min", status: "pending" }
    ],
    criticalPath: {
      totalDuration: "225 minutes",
      criticalSteps: ["Repair Work", "Testing"]
    }
  }
};

const sampleResourceData = {
  "AIRCRAFT_SWAP": {
    personnelRequirements: [
      { role: "Ground Crew", count: 6, availability: "Available" },
      { role: "Flight Crew", count: 2, availability: "Standby" }
    ],
    equipmentRequirements: [
      { equipment: "Ground Power Unit", availability: "Available" },
      { equipment: "Baggage Loader", availability: "Available" }
    ],
    facilityRequirements: [
      { facility: "Gate B3", availability: "Confirmed" }
    ]
  },
  "DELAY_REPAIR": {
    personnelRequirements: [
      { role: "Maintenance Technician", count: 2, availability: "On Site" }
    ],
    equipmentRequirements: [
      { equipment: "Hydraulic Test Kit", availability: "Available" }
    ],
    facilityRequirements: [
      { facility: "Maintenance Bay", availability: "Occupied" }
    ]
  }
};

const sampleTechnicalSpecs = {
  "AIRCRAFT_SWAP": {
    aircraftSpecs: {
      originalAircraft: "A6-FDB - B737-800",
      replacementAircraft: "A6-FED - B737-800",
      compatibility: "100% - Identical type"
    },
    operationalConstraints: {
      fuelRequirements: "Standard + 10% contingency",
      crewRequirements: "B737 type rating mandatory"
    },
    regulatoryRequirements: [
      "GCAA approval for aircraft change",
      "Crew currency verification"
    ]
  },
  "DELAY_REPAIR": {
    aircraftSpecs: {
      affectedSystem: "Hydraulic System",
      repairComplexity: "Medium"
    },
    operationalConstraints: {
      maintenanceWindow: "4 hours maximum",
      partsAvailability: "In stock at DXB"
    },
    regulatoryRequirements: [
      "Maintenance supervisor sign-off",
      "Engineering approval"
    ]
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
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            aircraft_options = EXCLUDED.aircraft_options,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(sampleRotationPlanData[dataType].aircraftOptions),
          JSON.stringify(sampleRotationPlanData[dataType].crewData),
          JSON.stringify(sampleRotationPlanData[dataType].nextSectors),
          JSON.stringify({}),
          JSON.stringify({}),
          JSON.stringify({})
        ]);
      }

      // Insert cost analysis details
      if (sampleCostAnalysisData[dataType]) {
        await pool.query(`
          INSERT INTO cost_analysis_details (
            recovery_option_id, cost_categories, total_cost, cost_comparison, savings_analysis
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            cost_categories = EXCLUDED.cost_categories,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(sampleCostAnalysisData[dataType].costCategories),
          sampleCostAnalysisData[dataType].totalCost,
          JSON.stringify(sampleCostAnalysisData[dataType].costComparison),
          JSON.stringify({})
        ]);
      }

      // Insert timeline details
      if (sampleTimelineData[dataType]) {
        await pool.query(`
          INSERT INTO timeline_details (
            recovery_option_id, timeline_steps, critical_path, dependencies, milestones
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            timeline_steps = EXCLUDED.timeline_steps,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(sampleTimelineData[dataType].timelineSteps),
          JSON.stringify(sampleTimelineData[dataType].criticalPath),
          JSON.stringify([]),
          JSON.stringify([])
        ]);
      }

      // Insert resource details
      if (sampleResourceData[dataType]) {
        await pool.query(`
          INSERT INTO resource_details (
            recovery_option_id, personnel_requirements, equipment_requirements,
            facility_requirements, availability_status
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            personnel_requirements = EXCLUDED.personnel_requirements,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(sampleResourceData[dataType].personnelRequirements),
          JSON.stringify(sampleResourceData[dataType].equipmentRequirements),
          JSON.stringify(sampleResourceData[dataType].facilityRequirements),
          JSON.stringify({})
        ]);
      }

      // Insert technical specifications
      if (sampleTechnicalSpecs[dataType]) {
        await pool.query(`
          INSERT INTO technical_specifications (
            recovery_option_id, aircraft_specs, operational_constraints,
            regulatory_requirements, weather_limitations
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            aircraft_specs = EXCLUDED.aircraft_specs,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(sampleTechnicalSpecs[dataType].aircraftSpecs),
          JSON.stringify(sampleTechnicalSpecs[dataType].operationalConstraints),
          JSON.stringify(sampleTechnicalSpecs[dataType].regulatoryRequirements),
          JSON.stringify({})
        ]);
      }
    }

    console.log('✅ Detailed recovery data population completed successfully!');

  } catch (error) {
    console.error('❌ Error populating detailed recovery data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the population
populateDetailedRecoveryData();