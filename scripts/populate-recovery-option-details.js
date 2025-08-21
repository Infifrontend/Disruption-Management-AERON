
import pkg from 'pg'
const { Pool } = pkg

// PostgreSQL connection
let connectionString = process.env.DATABASE_URL || 'postgresql://0.0.0.0:5432/aeron_settings'

if (connectionString && connectionString.includes('neon.tech')) {
  try {
    const url = new URL(connectionString)
    const endpointId = url.hostname.split('.')[0]
    const params = new URLSearchParams(url.search)
    params.set('options', `endpoint=${endpointId}`)
    params.set('sslmode', 'require')
    url.search = params.toString()
    connectionString = url.toString()
  } catch (error) {
    console.error('Error configuring Neon connection:', error.message)
  }
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
  min: 1,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
})

// Sample detailed recovery option data
const sampleDetailedData = [
  {
    title: 'Aircraft Swap - Available Alternative',
    rotationPlan: {
      aircraftOptions: [
        {
          reg: 'A6-FED',
          type: 'B737-800 (189Y)',
          etops: { status: 'available', value: '180min' },
          cabinMatch: { status: 'exact', value: 'Exact' },
          availability: 'Available Now',
          assigned: { status: 'none', value: 'None' },
          turnaround: '45 min',
          maintenance: { status: 'current', value: 'Current' },
          recommended: true
        }
      ],
      crewData: [
        {
          name: 'Capt. Ahmed Al-Mansouri',
          role: 'Captain',
          type: 'B737 Type Rating',
          status: 'Available',
          issue: null
        }
      ],
      nextSectors: [
        {
          flight: 'FZ456 DXB-BOM',
          departure: 'Dep: 18:30 → 19:45 (+75min)',
          impact: 'High Impact',
          reason: 'Aircraft swap delay'
        }
      ],
      operationalConstraints: {
        gateCompatibility: { status: 'Compatible', details: 'All gates compatible with B737-800' },
        slotCapacity: { status: 'Coordination Required', details: 'New departure slot needed' },
        curfewViolation: { status: 'No Risk', details: 'Within curfew limits' },
        passengerConnections: { status: 'Minimal Impact', details: 'No significant connection issues' }
      },
      costBreakdown: {
        delayCost: 34200,
        fuelEfficiency: '+2.1%',
        hotelTransport: 840,
        eu261Risk: 'Medium'
      },
      recommendation: {
        aircraft: 'A6-FED',
        reason: 'Optimal balance across cost (92%), delay minimization (88%), crew impact (95%), and fuel efficiency (91%)'
      }
    },
    costAnalysis: {
      costCategories: [
        {
          category: 'Aircraft Positioning Fee',
          amount: 'AED 28,500',
          percentage: 42,
          description: 'Moving A6-FMC from Terminal 1 to gate'
        },
        {
          category: 'Crew Overtime & Allowances',
          amount: 'AED 15,200',
          percentage: 23,
          description: 'Extended duty pay for 6 crew members'
        },
        {
          category: 'Ground Handling Premium',
          amount: 'AED 9,800',
          percentage: 15,
          description: 'Priority baggage/cargo transfer'
        }
      ],
      totalCost: 67500,
      costComparison: {
        vsDelay: 'AED 12,300 savings',
        vsCancellation: 'AED 45,600 savings'
      },
      savingsAnalysis: {
        passengerCompensation: 'AED 23,400 avoided',
        hotelCosts: 'AED 18,900 avoided',
        rebookingFees: 'AED 8,200 avoided'
      }
    },
    timeline: {
      timelineSteps: [
        {
          step: 'Decision Confirmation',
          duration: '5 minutes',
          startTime: '14:30',
          endTime: '14:35',
          details: 'Management approval and resource confirmation',
          status: 'pending'
        },
        {
          step: 'Aircraft Positioning',
          duration: '35 minutes',
          startTime: '14:35',
          endTime: '15:10',
          details: 'Move A6-FMC from Terminal 1 to departure gate',
          status: 'pending'
        }
      ],
      criticalPath: {
        bottleneck: 'Aircraft positioning',
        estimatedDelay: '15 minutes',
        riskFactors: ['Ground traffic', 'Gate availability']
      },
      dependencies: [
        {
          task: 'Crew briefing',
          dependsOn: 'Aircraft positioning',
          bufferTime: '10 minutes'
        }
      ],
      milestones: [
        {
          milestone: 'Aircraft ready',
          targetTime: '15:10',
          criticalForDeparture: true
        }
      ]
    },
    resources: {
      personnelRequirements: [
        {
          role: 'Aircraft Positioning Crew',
          count: 1,
          availability: 'Available',
          location: 'Terminal 1',
          eta: '5 minutes'
        },
        {
          role: 'Ground Handling Supervisor',
          count: 1,
          availability: 'On standby',
          location: 'Operations Center',
          eta: '10 minutes'
        }
      ],
      equipmentRequirements: [
        {
          equipment: 'Aircraft Tug',
          availability: 'Available',
          location: 'Equipment Bay 7',
          reservationStatus: 'Reserved'
        },
        {
          equipment: 'Ground Power Unit',
          availability: 'Available',
          location: 'Terminal 2 Ramp',
          reservationStatus: 'Reserved'
        }
      ],
      facilityRequirements: [
        {
          facility: 'Gate A15',
          availability: 'Available after 15:00',
          capacity: 'B737-800 compatible',
          reservationStatus: 'Reserved'
        }
      ],
      availabilityStatus: {
        overall: 'Good',
        constraints: ['Gate timing', 'Crew coordination'],
        alternatives: 'Gate B12 available as backup'
      }
    },
    technical: {
      aircraftSpecs: {
        type: 'Boeing 737-800',
        configuration: '189Y seats',
        range: '5,765 km',
        fuelCapacity: '26,020 liters',
        mtow: '79,010 kg'
      },
      operationalConstraints: {
        crewRequirements: 'Type rated B737 crew',
        maintenanceStatus: 'A-check current',
        weatherLimitations: 'Cat III capable',
        routeRestrictions: 'ETOPS 180 certified'
      },
      regulatoryRequirements: [
        'GCAA operational approval current',
        'Insurance coverage verified',
        'Crew licenses validated',
        'Aircraft registration active'
      ],
      weatherLimitations: {
        visibility: 'RVR 125m minimum',
        crosswind: '25 knots maximum',
        tailwind: '10 knots maximum',
        turbulence: 'Moderate acceptable'
      }
    }
  }
]

async function populateRecoveryOptionDetails() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting recovery option details population...')
    
    // Check if tables exist
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('rotation_plan_details', 'cost_analysis_details', 'timeline_details', 'resource_details', 'technical_specifications')
    `)
    
    const existingTables = tableCheck.rows.map(row => row.table_name)
    const requiredTables = ['rotation_plan_details', 'cost_analysis_details', 'timeline_details', 'resource_details', 'technical_specifications']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))
    
    if (missingTables.length > 0) {
      console.log('📋 Creating missing tables...')
      
      // Create missing tables based on schema
      const schemaCommands = {
        'rotation_plan_details': `
          CREATE TABLE rotation_plan_details (
            id SERIAL PRIMARY KEY,
            recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
            aircraft_options JSONB DEFAULT '[]',
            crew_data JSONB DEFAULT '[]',
            next_sectors JSONB DEFAULT '[]',
            operational_constraints JSONB DEFAULT '{}',
            cost_breakdown JSONB DEFAULT '{}',
            recommendation JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(recovery_option_id)
          )
        `,
        'cost_analysis_details': `
          CREATE TABLE cost_analysis_details (
            id SERIAL PRIMARY KEY,
            recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
            cost_categories JSONB DEFAULT '[]',
            total_cost DECIMAL(12,2) DEFAULT 0,
            cost_comparison JSONB DEFAULT '{}',
            savings_analysis JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(recovery_option_id)
          )
        `,
        'timeline_details': `
          CREATE TABLE timeline_details (
            id SERIAL PRIMARY KEY,
            recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
            timeline_steps JSONB DEFAULT '[]',
            critical_path JSONB DEFAULT '{}',
            dependencies JSONB DEFAULT '[]',
            milestones JSONB DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(recovery_option_id)
          )
        `,
        'resource_details': `
          CREATE TABLE resource_details (
            id SERIAL PRIMARY KEY,
            recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
            personnel_requirements JSONB DEFAULT '[]',
            equipment_requirements JSONB DEFAULT '[]',
            facility_requirements JSONB DEFAULT '[]',
            availability_status JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(recovery_option_id)
          )
        `,
        'technical_specifications': `
          CREATE TABLE technical_specifications (
            id SERIAL PRIMARY KEY,
            recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
            aircraft_specs JSONB DEFAULT '{}',
            operational_constraints JSONB DEFAULT '{}',
            regulatory_requirements JSONB DEFAULT '[]',
            weather_limitations JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(recovery_option_id)
          )
        `
      }
      
      for (const table of missingTables) {
        if (schemaCommands[table]) {
          await client.query(schemaCommands[table])
          console.log(`✅ Created table: ${table}`)
        }
      }
    }

    // Get all recovery options that need detailed data
    const recoveryOptionsResult = await client.query(`
      SELECT id, title, disruption_id 
      FROM recovery_options 
      ORDER BY id
    `)
    
    console.log(`Found ${recoveryOptionsResult.rows.length} recovery options to populate`)
    
    for (const option of recoveryOptionsResult.rows) {
      console.log(`Processing option: ${option.title} (ID: ${option.id})`)
      
      // Use sample data for now - in production this would be customized per option
      const detailData = sampleDetailedData[0]
      
      try {
        // Insert rotation plan details
        await client.query(`
          INSERT INTO rotation_plan_details (
            recovery_option_id, aircraft_options, crew_data, next_sectors,
            operational_constraints, cost_breakdown, recommendation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            aircraft_options = EXCLUDED.aircraft_options,
            crew_data = EXCLUDED.crew_data,
            next_sectors = EXCLUDED.next_sectors,
            operational_constraints = EXCLUDED.operational_constraints,
            cost_breakdown = EXCLUDED.cost_breakdown,
            recommendation = EXCLUDED.recommendation,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(detailData.rotationPlan.aircraftOptions),
          JSON.stringify(detailData.rotationPlan.crewData),
          JSON.stringify(detailData.rotationPlan.nextSectors),
          JSON.stringify(detailData.rotationPlan.operationalConstraints),
          JSON.stringify(detailData.rotationPlan.costBreakdown),
          JSON.stringify(detailData.rotationPlan.recommendation)
        ])

        // Insert cost analysis details
        await client.query(`
          INSERT INTO cost_analysis_details (
            recovery_option_id, cost_categories, total_cost, cost_comparison, savings_analysis
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            cost_categories = EXCLUDED.cost_categories,
            total_cost = EXCLUDED.total_cost,
            cost_comparison = EXCLUDED.cost_comparison,
            savings_analysis = EXCLUDED.savings_analysis,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(detailData.costAnalysis.costCategories),
          detailData.costAnalysis.totalCost,
          JSON.stringify(detailData.costAnalysis.costComparison),
          JSON.stringify(detailData.costAnalysis.savingsAnalysis)
        ])

        // Insert timeline details
        await client.query(`
          INSERT INTO timeline_details (
            recovery_option_id, timeline_steps, critical_path, dependencies, milestones
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            timeline_steps = EXCLUDED.timeline_steps,
            critical_path = EXCLUDED.critical_path,
            dependencies = EXCLUDED.dependencies,
            milestones = EXCLUDED.milestones,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(detailData.timeline.timelineSteps),
          JSON.stringify(detailData.timeline.criticalPath),
          JSON.stringify(detailData.timeline.dependencies),
          JSON.stringify(detailData.timeline.milestones)
        ])

        // Insert resource details
        await client.query(`
          INSERT INTO resource_details (
            recovery_option_id, personnel_requirements, equipment_requirements,
            facility_requirements, availability_status
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            personnel_requirements = EXCLUDED.personnel_requirements,
            equipment_requirements = EXCLUDED.equipment_requirements,
            facility_requirements = EXCLUDED.facility_requirements,
            availability_status = EXCLUDED.availability_status,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(detailData.resources.personnelRequirements),
          JSON.stringify(detailData.resources.equipmentRequirements),
          JSON.stringify(detailData.resources.facilityRequirements),
          JSON.stringify(detailData.resources.availabilityStatus)
        ])

        // Insert technical specifications
        await client.query(`
          INSERT INTO technical_specifications (
            recovery_option_id, aircraft_specs, operational_constraints,
            regulatory_requirements, weather_limitations
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (recovery_option_id) DO UPDATE SET
            aircraft_specs = EXCLUDED.aircraft_specs,
            operational_constraints = EXCLUDED.operational_constraints,
            regulatory_requirements = EXCLUDED.regulatory_requirements,
            weather_limitations = EXCLUDED.weather_limitations,
            updated_at = CURRENT_TIMESTAMP
        `, [
          option.id,
          JSON.stringify(detailData.technical.aircraftSpecs),
          JSON.stringify(detailData.technical.operationalConstraints),
          JSON.stringify(detailData.technical.regulatoryRequirements),
          JSON.stringify(detailData.technical.weatherLimitations)
        ])

        console.log(`✅ Populated detailed data for option ${option.id}`)
        
      } catch (insertError) {
        console.error(`❌ Error inserting data for option ${option.id}:`, insertError.message)
      }
    }
    
    console.log('✅ Recovery option details population completed successfully')
    
  } catch (error) {
    console.error('❌ Error during population:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the population
populateRecoveryOptionDetails().catch(console.error)
