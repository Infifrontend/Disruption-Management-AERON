
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DB_URL
});

// Import recovery scenarios data
const recoveryScenarios = {
  'Aircraft issue (e.g., AOG)': {
    title: "Aircraft Issue Recovery (AOG)",
    description: "A6-FDB hydraulics failure - Ground Stop Required",
    priority: "CRITICAL",
    estimatedTime: "4-6 hours",
    steps: [
      {
        step: 1,
        title: "Ground Alert Triggered in AMOS",
        status: "completed",
        timestamp: "14:15:00",
        system: "AMOS MRO System",
        details: "Hydraulic system warning detected - Aircraft A6-FDB grounded",
        data: {
          alertType: "Hydraulic System Failure",
          severity: "Ground Stop Required",
          amosRef: "AMOS-2025-0110-FDB-001",
          location: "DXB Gate A12"
        }
      },
      {
        step: 2,
        title: "Assess Estimated Repair Time",
        status: "completed",
        timestamp: "14:18:00",
        system: "Maintenance Planning",
        details: "ETA from maintenance: 4-6 hours, parts available",
        data: {
          estimatedRepair: "4-6 hours",
          partsAvailable: "Yes - In stock at DXB",
          engineerAssigned: "Lead Hydraulics Specialist",
          completionETA: "20:30 GST"
        }
      },
      {
        step: 3,
        title: "Generate Rotation Impact Tree",
        status: "completed",
        timestamp: "14:20:00",
        system: "AERON Analytics",
        details: "Analyzing downstream flights and overnight implications",
        data: {
          affectedFlights: 3,
          totalPassengers: 456,
          revenueImpact: "AED 890K",
          curfewBreaches: "None identified",
          overnightImplications: "DEL turnaround affected"
        }
      }
    ],
    options: [
      {
        id: "SWAP_A6FDC",
        title: "Aircraft Swap - A6-FDC",
        description: "Immediate tail swap with available A320",
        cost: "AED 45,000",
        timeline: "75 minutes",
        confidence: 95,
        impact: "Minimal passenger disruption",
        status: "recommended",
        advantages: ["Same aircraft type - no passenger impact", "A6-FDC available immediately", "Maintains 97% of schedule integrity"],
        considerations: ["A6-FDC delayed for its next flight by 60 minutes", "Crew briefing required for aircraft change"]
      },
      {
        id: "DELAY_REPAIR",
        title: "Delay for Repair Completion",
        description: "Wait for A6-FDB hydraulics system repair",
        cost: "AED 180,000",
        timeline: "4-6 hours",
        confidence: 45,
        impact: "Significant passenger disruption",
        status: "caution",
        advantages: ["Original aircraft maintained", "No aircraft swap complexity"],
        considerations: ["Repair ETA uncertain (4-6 hours)", "Massive passenger accommodation needed"]
      }
    ]
  },
  'Crew issue (e.g., sick report, duty time breach)': {
    title: "Crew Issue Recovery",
    description: "Crew duty time breach - Unable to operate",
    priority: "HIGH",
    estimatedTime: "15-30 minutes",
    steps: [
      {
        step: 1,
        title: "Crew Control Notified via AIMS",
        status: "completed",
        timestamp: "13:45:00",
        system: "AIMS Crew System",
        details: "Crew duty time breach detected",
        data: {
          crewMember: "Capt. Ahmed Al-Rashid",
          reason: "Duty Time Breach - FDP Limit Exceeded",
          currentFDP: "13.5 hours",
          maxFDP: "13.0 hours"
        }
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
          fdpLegality: "All options within FDP limits"
        }
      }
    ],
    options: [
      {
        id: "STANDBY_CREW",
        title: "Assign Standby Crew",
        description: "Capt. Mohammed Al-Zaabi from standby roster",
        cost: "AED 8,500",
        timeline: "30 minutes",
        confidence: 92,
        impact: "Minimal operational disruption",
        status: "recommended",
        advantages: ["Standby crew immediately available at DXB", "Within all regulatory duty time limits"],
        considerations: ["Extended briefing required (20 minutes)", "Standby crew pay activation costs"]
      }
    ]
  },
  'ATC/weather delay': {
    title: "Weather Delay Recovery",
    description: "Heavy thunderstorms at DEL - Low visibility 800m",
    priority: "MEDIUM",
    estimatedTime: "2-4 hours",
    steps: [
      {
        step: 1,
        title: "Weather Trigger Received",
        status: "completed",
        timestamp: "12:30:00",
        system: "Weather Monitoring",
        details: "ATC holding all arrivals due to severe weather",
        data: {
          weatherType: "Thunderstorms + Low Visibility",
          visibility: "800m (Required: 1200m)",
          atcStatus: "All arrivals on hold",
          forecast: "Improvement expected 16:00-17:00"
        }
      }
    ],
    options: [
      {
        id: "DELAY_WEATHER",
        title: "Delay for Weather Clearance",
        description: "Wait for weather improvement at DEL",
        cost: "AED 25,000",
        timeline: "2-3 hours",
        confidence: 90,
        impact: "Managed schedule delay",
        status: "recommended",
        advantages: ["Weather forecast shows improvement", "All connections protected"],
        considerations: ["Dependent on weather improvement", "Crew duty time monitoring"]
      }
    ]
  },
  'Airport curfew/ramp congestion': {
    title: "Airport Curfew Recovery",
    description: "BOM curfew breach - ETA 23:15 (15 min past curfew)",
    priority: "HIGH",
    estimatedTime: "45 minutes",
    steps: [
      {
        step: 1,
        title: "Determine Curfew Parameters",
        status: "completed",
        timestamp: "21:45:00",
        system: "Airport Operations",
        details: "BOM curfew 23:00-06:00, current ETA 23:15",
        data: {
          curfewStart: "23:00 local time",
          curfewEnd: "06:00 local time",
          currentETA: "23:15 (15 min past curfew)",
          curfewType: "Noise restriction - strict enforcement"
        }
      }
    ],
    options: [
      {
        id: "SWAP_EARLY",
        title: "Aircraft Swap for Earlier Departure",
        description: "Swap with FZ201 for 22:15 departure",
        cost: "AED 45,000",
        timeline: "45 minutes",
        confidence: 92,
        impact: "Beat curfew timing",
        status: "recommended",
        advantages: ["Arrive before curfew", "Zero passenger rebooking"],
        considerations: ["FZ201 delayed by 60 minutes", "Quick crew coordination needed"]
      }
    ]
  },
  'Rotation misalignment or maintenance hold': {
    title: "Rotation Misalignment Recovery",
    description: "A6-FDJ maintenance overrun - Line check extended 3 hours",
    priority: "MEDIUM",
    estimatedTime: "90 minutes",
    steps: [
      {
        step: 1,
        title: "AMOS Maintenance Hold Flag",
        status: "completed",
        timestamp: "11:30:00",
        system: "AMOS Maintenance",
        details: "A6-FDJ line check extended by 3 hours",
        data: {
          aircraft: "A6-FDJ",
          maintenanceType: "Line Check",
          originalETA: "11:30:00",
          revisedETA: "14:30:00",
          delay: "3 hours extension"
        }
      }
    ],
    options: [
      {
        id: "SWAP_A6FDL",
        title: "Aircraft Swap with A6-FDL",
        description: "Assign A6-FDL to FZ567, A6-FDJ resumes later",
        cost: "AED 75,000",
        timeline: "90 minutes",
        confidence: 88,
        impact: "Minimal network disruption",
        status: "recommended",
        advantages: ["A6-FDL available immediately", "Same A320 type - no complexity"],
        considerations: ["A6-FDL flight FZ405 delayed 60 minutes", "Crew briefing for aircraft change"]
      }
    ]
  }
};

async function populateRecoveryData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting recovery data population...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Truncate tables to avoid conflicts
    console.log('Truncating existing recovery data...');
    await client.query('TRUNCATE TABLE recovery_steps CASCADE');
    await client.query('TRUNCATE TABLE recovery_options CASCADE');
    
    // Get all flight disruptions to map recovery data
    const disruptionsResult = await client.query(`
      SELECT id, flight_number, disruption_type, disruption_reason 
      FROM flight_disruptions 
      ORDER BY id
    `);
    
    const disruptions = disruptionsResult.rows;
    console.log(`Found ${disruptions.length} disruptions to process`);
    
    // Helper function to map disruption type to category
    function mapDisruptionTypeToCategory(type, reason) {
      const lowerType = type.toLowerCase();
      const lowerReason = reason.toLowerCase();
      
      if (lowerType.includes('technical') || lowerReason.includes('maintenance') || lowerReason.includes('aog')) {
        return 'Aircraft issue (e.g., AOG)';
      }
      if (lowerType.includes('crew') || lowerReason.includes('crew') || lowerReason.includes('duty time')) {
        return 'Crew issue (e.g., sick report, duty time breach)';
      }
      if (lowerType.includes('weather') || lowerReason.includes('weather') || lowerReason.includes('atc')) {
        return 'ATC/weather delay';
      }
      if (lowerType.includes('curfew') || lowerReason.includes('curfew') || lowerReason.includes('congestion')) {
        return 'Airport curfew/ramp congestion';
      }
      if (lowerType.includes('rotation') || lowerReason.includes('rotation') || lowerReason.includes('misalignment')) {
        return 'Rotation misalignment or maintenance hold';
      }
      
      return 'Aircraft issue (e.g., AOG)'; // Default fallback
    }
    
    // Process each disruption
    for (const disruption of disruptions) {
      const category = mapDisruptionTypeToCategory(disruption.disruption_type, disruption.disruption_reason);
      const scenarioData = recoveryScenarios[category];
      
      if (!scenarioData) {
        console.log(`No scenario data found for category: ${category}`);
        continue;
      }
      
      console.log(`Processing disruption ${disruption.flight_number} (ID: ${disruption.id}) - Category: ${category}`);
      
      // Insert recovery steps
      for (const step of scenarioData.steps) {
        await client.query(`
          INSERT INTO recovery_steps (
            disruption_id, step_number, title, status, timestamp,
            system, details, step_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          disruption.id,
          step.step,
          step.title,
          step.status,
          step.timestamp,
          step.system,
          step.details,
          JSON.stringify(step.data)
        ]);
      }
      
      // Insert recovery options
      for (let i = 0; i < scenarioData.options.length; i++) {
        const option = scenarioData.options[i];
        
        await client.query(`
          INSERT INTO recovery_options (
            disruption_id, title, description, cost, timeline,
            confidence, impact, status, priority, advantages, considerations,
            resource_requirements, cost_breakdown, timeline_details,
            risk_assessment, technical_specs, metrics, rotation_plan
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `, [
          disruption.id,
          option.title,
          option.description,
          option.cost,
          option.timeline,
          option.confidence,
          option.impact,
          option.status,
          i + 1, // priority based on order
          option.advantages || [],
          option.considerations || [],
          JSON.stringify({}), // resource_requirements
          JSON.stringify({}), // cost_breakdown
          JSON.stringify({}), // timeline_details
          JSON.stringify({}), // risk_assessment
          JSON.stringify({}), // technical_specs
          JSON.stringify({}), // metrics
          JSON.stringify({})  // rotation_plan
        ]);
      }
      
      console.log(`✅ Processed ${scenarioData.steps.length} steps and ${scenarioData.options.length} options for ${disruption.flight_number}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Recovery data population completed successfully!');
    
    // Verify the data
    const stepsCount = await client.query('SELECT COUNT(*) FROM recovery_steps');
    const optionsCount = await client.query('SELECT COUNT(*) FROM recovery_options');
    
    console.log(`📊 Summary:`);
    console.log(`  - Recovery steps inserted: ${stepsCount.rows[0].count}`);
    console.log(`  - Recovery options inserted: ${optionsCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error populating recovery data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the population script
if (process.argv[1] === new URL(import.meta.url).pathname) {
  populateRecoveryData()
    .then(() => {
      console.log('🎉 Recovery data population script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { populateRecoveryData };
