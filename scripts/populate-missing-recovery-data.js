
import pkg from 'pg'
const { Pool } = pkg

const connectionString = process.env.DATABASE_URL || 'postgresql://0.0.0.0:5432/aeron_settings'

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
})

async function populateMissingRecoveryData() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Populating missing recovery data...')
    
    // Get all disruptions that don't have recovery options
    const disruptionsWithoutOptions = await client.query(`
      SELECT fd.id, fd.flight_number, fd.disruption_type, fd.severity, fd.passengers, fd.aircraft, fd.delay_minutes, fd.disruption_reason
      FROM flight_disruptions fd
      LEFT JOIN recovery_options ro ON fd.id = ro.disruption_id
      WHERE ro.disruption_id IS NULL
      ORDER BY fd.id
    `)
    
    console.log(`Found ${disruptionsWithoutOptions.rows.length} disruptions without recovery options`)
    
    // Import the recovery generator
    const { generateRecoveryOptionsForDisruption } = await import('../server/recovery-generator.js')
    
    let totalOptionsCreated = 0
    let totalStepsCreated = 0
    
    for (const disruption of disruptionsWithoutOptions.rows) {
      console.log(`Generating recovery data for disruption ${disruption.id} - ${disruption.flight_number}`)
      
      try {
        // Generate recovery options and steps
        const { options, steps } = generateRecoveryOptionsForDisruption(disruption)
        
        // Insert recovery options
        for (const option of options) {
          await client.query(`
            INSERT INTO recovery_options (
              disruption_id, title, description, cost, timeline, confidence,
              impact, status, priority, advantages, considerations,
              resource_requirements, cost_breakdown, timeline_details,
              risk_assessment, technical_specs, metrics, rotation_plan
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `, [
            disruption.id, option.title, option.description, option.cost,
            option.timeline, option.confidence, option.impact, option.status,
            option.priority || 1, option.advantages || [],
            option.considerations || [],
            option.resourceRequirements || {},
            option.costBreakdown || {},
            option.timelineDetails || [],
            option.riskAssessment || {},
            option.technicalSpecs || {},
            option.metrics || {},
            option.rotationPlan || {}
          ])
          totalOptionsCreated++
        }
        
        // Insert recovery steps
        for (const step of steps) {
          await client.query(`
            INSERT INTO recovery_steps (
              disruption_id, step_number, title, status, timestamp,
              system, details, step_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            disruption.id, step.step, step.title, step.status,
            step.timestamp, step.system, step.details,
            step.data || {}
          ])
          totalStepsCreated++
        }
        
        console.log(`✅ Created ${options.length} options and ${steps.length} steps for ${disruption.flight_number}`)
        
      } catch (error) {
        console.error(`❌ Error processing disruption ${disruption.id}:`, error.message)
      }
    }
    
    console.log(`✅ Recovery data population completed!`)
    console.log(`📊 Summary:`)
    console.log(`  - Total recovery options created: ${totalOptionsCreated}`)
    console.log(`  - Total recovery steps created: ${totalStepsCreated}`)
    console.log(`  - Disruptions processed: ${disruptionsWithoutOptions.rows.length}`)
    
  } catch (error) {
    console.error('❌ Error populating missing recovery data:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the population if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateMissingRecoveryData()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

export { populateMissingRecoveryData }
