
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Sample detailed recovery options based on the provided structure
const sampleRecoveryOptions = [
  {
    option_id: "AIRCRAFT_SWAP_001",
    title: "Aircraft Swap",
    description: "Swap the affected aircraft with an available alternative to maintain schedule integrity.",
    timeline: "75 minutes",
    percentage_of_flight_cost: 12,
    confidence: 95,
    impact: "Low",
    status: "recommended",
    cost_analysis: {
      currency: "AED",
      percentageOfFlightCost: 12,
      breakdown: [
        { category: "Aircraft Positioning", percentage: 35 },
        { category: "Ground Handling", percentage: 25 },
        { category: "Passenger Services", percentage: 25 },
        { category: "Administrative Overheads", percentage: 15 }
      ]
    },
    timeline_steps: [
      { step: "Identify Spare Aircraft", duration: "10 min", status: "completed" },
      { step: "Position Spare Aircraft", duration: "15 min", status: "in-progress" },
      { step: "Reassign Crew", duration: "20 min", status: "pending" },
      { step: "Passenger Transfer", duration: "20 min", status: "pending" },
      { step: "Final Checks", duration: "10 min", status: "pending" }
    ],
    resources: [
      { type: "Aircraft", resource: "A6-FEB", availability: "Available" },
      { type: "Gate", resource: "Gate B3", availability: "Confirmed" },
      { type: "Crew", resource: "Standby Crew", availability: "On Standby" }
    ],
    risk_assessment: [
      { risk: "Crew Incompatibility", probability: "Low", impact: "Medium" },
      { risk: "Gate Unavailability", probability: "Low", impact: "Low" }
    ],
    technical_details: {
      replacementAircraftType: "B737-800",
      aircraftStatus: "Serviceable",
      fuelRequirements: "Standard Refuel Required"
    }
  },
  {
    option_id: "DELAY_REPAIR_001",
    title: "Delay for Repair Completion",
    description: "Hold the flight until the technical issue is resolved by maintenance.",
    timeline: "3–4 hours",
    percentage_of_flight_cost: 22,
    confidence: 65,
    impact: "High",
    status: "caution",
    cost_analysis: {
      currency: "AED",
      percentageOfFlightCost: 22,
      breakdown: [
        { category: "Maintenance Labor", percentage: 30 },
        { category: "Parts Replacement", percentage: 25 },
        { category: "Passenger Compensation", percentage: 35 },
        { category: "Operations Disruption", percentage: 10 }
      ]
    },
    timeline_steps: [
      { step: "Diagnostics", duration: "45 min", status: "completed" },
      { step: "Parts Procurement", duration: "60 min", status: "in-progress" },
      { step: "Repair Work", duration: "90 min", status: "pending" },
      { step: "System Testing", duration: "30 min", status: "pending" }
    ],
    resources: [
      { type: "Technicians", resource: "AOG Team", availability: "En Route" },
      { type: "Parts", resource: "Hydraulic Pump", availability: "Available at DXB" }
    ],
    risk_assessment: [
      { risk: "Part Delay", probability: "Medium", impact: "High" },
      { risk: "Crew Duty Expiry", probability: "High", impact: "High" }
    ],
    technical_details: {
      issue: "Hydraulic Leak",
      affectedComponent: "Main Gear Assembly",
      requiredSignOff: "Maintenance Supervisor & Engineering"
    }
  },
  {
    option_id: "CANCEL_REBOOK_001",
    title: "Cancel and Rebook",
    description: "Cancel the flight and rebook affected passengers on alternate flights or partner airlines.",
    timeline: "6–8 hours",
    percentage_of_flight_cost: 38,
    confidence: 90,
    impact: "High",
    status: "last-resort",
    cost_analysis: {
      currency: "AED",
      percentageOfFlightCost: 38,
      breakdown: [
        { category: "Passenger Compensation", percentage: 40 },
        { category: "Hotel & Meals", percentage: 20 },
        { category: "Rebooking/Partner Airline", percentage: 30 },
        { category: "Staff Reassignment", percentage: 10 }
      ]
    },
    timeline_steps: [
      { step: "Notify Passengers", duration: "30 min", status: "pending" },
      { step: "Rebook on Alternatives", duration: "120 min", status: "pending" },
      { step: "Issue Vouchers & Compensation", duration: "60 min", status: "pending" }
    ],
    resources: [
      { type: "Support Staff", resource: "Customer Service Agents", availability: "Ready" },
      { type: "Partner Airlines", resource: "Emirates, Air Arabia", availability: "Standby" },
      { type: "Ground Transport", resource: "Shuttle Service", availability: "On Demand" }
    ],
    risk_assessment: [
      { risk: "Passenger Dissatisfaction", probability: "High", impact: "High" },
      { risk: "Availability on Partner Flights", probability: "Medium", impact: "High" }
    ],
    technical_details: {
      cancelReason: "Aircraft grounded for extended maintenance",
      actionRequired: "Full offload, refund/rebooking processing",
      regulatoryCompliance: "EU261, DGCA"
    }
  }
];

async function populateDetailedRecoveryData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting detailed recovery data population...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if tables exist, if not create them
    await client.query(`
      SELECT * FROM information_schema.tables 
      WHERE table_name IN ('disruption_categories', 'recovery_option_templates', 'recovery_options_detailed')
    `);
    
    // Get all flight disruptions to map recovery data
    const disruptionsResult = await client.query(`
      SELECT id, flight_number, disruption_type, disruption_reason 
      FROM flight_disruptions 
      WHERE status = 'Active'
      ORDER BY id
      LIMIT 5
    `);
    
    const disruptions = disruptionsResult.rows;
    console.log(`📊 Found ${disruptions.length} active disruptions to process`);
    
    if (disruptions.length === 0) {
      console.log('⚠️ No active disruptions found');
      await client.query('ROLLBACK');
      return;
    }
    
    // Helper function to map disruption type to category
    function mapDisruptionTypeToCategory(type, reason) {
      const lowerType = type.toLowerCase();
      const lowerReason = reason.toLowerCase();
      
      if (lowerType.includes('technical') || lowerReason.includes('maintenance') || lowerReason.includes('aog')) {
        return 'AIRCRAFT_ISSUE';
      }
      if (lowerType.includes('crew') || lowerReason.includes('crew') || lowerReason.includes('duty time')) {
        return 'CREW_ISSUE';
      }
      if (lowerType.includes('weather') || lowerReason.includes('weather') || lowerReason.includes('atc')) {
        return 'ATC_WEATHER';
      }
      if (lowerType.includes('curfew') || lowerReason.includes('curfew') || lowerReason.includes('congestion')) {
        return 'CURFEW_CONGESTION';
      }
      if (lowerType.includes('rotation') || lowerReason.includes('rotation') || lowerReason.includes('misalignment')) {
        return 'ROTATION_MAINTENANCE';
      }
      
      return 'AIRCRAFT_ISSUE'; // Default fallback
    }
    
    // Get category IDs
    const categoriesResult = await client.query('SELECT id, category_code FROM disruption_categories');
    const categories = {};
    categoriesResult.rows.forEach(cat => {
      categories[cat.category_code] = cat.id;
    });
    
    // Process each disruption
    for (const disruption of disruptions) {
      const categoryCode = mapDisruptionTypeToCategory(disruption.disruption_type, disruption.disruption_reason);
      const categoryId = categories[categoryCode];
      
      if (!categoryId) {
        console.log(`❌ No category found for: ${categoryCode}`);
        continue;
      }
      
      console.log(`🔄 Processing disruption ${disruption.flight_number} (ID: ${disruption.id}) - Category: ${categoryCode}`);
      
      // Insert detailed recovery options for this disruption
      for (let i = 0; i < sampleRecoveryOptions.length; i++) {
        const option = sampleRecoveryOptions[i];
        const uniqueOptionId = `${option.option_id}_${disruption.id}`;
        
        try {
          await client.query(`
            INSERT INTO recovery_options_detailed (
              option_id, disruption_id, category_id, title, description,
              timeline, percentage_of_flight_cost, confidence, impact, status,
              priority, cost_analysis, timeline_steps, resources,
              risk_assessment, technical_details
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (option_id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              updated_at = CURRENT_TIMESTAMP
          `, [
            uniqueOptionId,
            disruption.id,
            categoryId,
            option.title,
            option.description,
            option.timeline,
            option.percentage_of_flight_cost,
            option.confidence,
            option.impact,
            option.status,
            i + 1, // priority
            JSON.stringify(option.cost_analysis),
            JSON.stringify(option.timeline_steps),
            JSON.stringify(option.resources),
            JSON.stringify(option.risk_assessment),
            JSON.stringify(option.technical_details)
          ]);
          
          // Insert detailed recovery steps
          if (option.timeline_steps && Array.isArray(option.timeline_steps)) {
            for (let stepIndex = 0; stepIndex < option.timeline_steps.length; stepIndex++) {
              const step = option.timeline_steps[stepIndex];
              
              await client.query(`
                INSERT INTO recovery_steps_detailed (
                  disruption_id, option_id, step_number, step_name,
                  duration, status, step_data
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (disruption_id, option_id, step_number) DO UPDATE SET
                  step_name = EXCLUDED.step_name,
                  updated_at = CURRENT_TIMESTAMP
              `, [
                disruption.id,
                uniqueOptionId,
                stepIndex + 1,
                step.step,
                step.duration,
                step.status,
                JSON.stringify({ step: step.step, duration: step.duration, status: step.status })
              ]);
            }
          }
          
        } catch (optionError) {
          console.error(`❌ Error inserting option ${uniqueOptionId}:`, optionError.message);
        }
      }
      
      console.log(`✅ Processed ${sampleRecoveryOptions.length} detailed options for ${disruption.flight_number}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Detailed recovery data population completed successfully!');
    
    // Verify the data
    const optionsCount = await client.query('SELECT COUNT(*) FROM recovery_options_detailed');
    const stepsCount = await client.query('SELECT COUNT(*) FROM recovery_steps_detailed');
    const categoriesCount = await client.query('SELECT COUNT(*) FROM disruption_categories');
    const templatesCount = await client.query('SELECT COUNT(*) FROM recovery_option_templates');
    
    console.log(`📊 Final Summary:`);
    console.log(`  - Disruption categories: ${categoriesCount.rows[0].count}`);
    console.log(`  - Recovery option templates: ${templatesCount.rows[0].count}`);
    console.log(`  - Detailed recovery options: ${optionsCount.rows[0].count}`);
    console.log(`  - Detailed recovery steps: ${stepsCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error populating detailed recovery data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the population script
if (process.argv[1] === new URL(import.meta.url).pathname) {
  populateDetailedRecoveryData()
    .then(() => {
      console.log('🎉 Detailed recovery data population script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { populateDetailedRecoveryData };
