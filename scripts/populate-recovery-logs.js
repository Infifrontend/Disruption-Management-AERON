
import pkg from "pg";
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/aeron_settings",
  ssl:
    process.env.NODE_ENV === "production" ||
    process.env.DATABASE_URL?.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

async function populateRecoveryLogs() {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    console.log("Creating recovery_logs table if it doesn't exist...");
    
    // Create the recovery_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recovery_logs (
        id SERIAL PRIMARY KEY,
        solution_id VARCHAR(50) UNIQUE NOT NULL,
        disruption_id VARCHAR(50) NOT NULL,
        flight_number VARCHAR(10) NOT NULL,
        route VARCHAR(50) NOT NULL,
        aircraft VARCHAR(50) NOT NULL,
        disruption_type VARCHAR(50) NOT NULL,
        disruption_reason TEXT,
        priority VARCHAR(20) NOT NULL,
        date_created TIMESTAMP WITH TIME ZONE NOT NULL,
        date_executed TIMESTAMP WITH TIME ZONE,
        date_completed TIMESTAMP WITH TIME ZONE,
        duration VARCHAR(20),
        status VARCHAR(20) NOT NULL,
        affected_passengers INTEGER,
        actual_cost DECIMAL(12,2),
        estimated_cost DECIMAL(12,2),
        cost_variance DECIMAL(5,2),
        otp_impact DECIMAL(5,2),
        solution_chosen TEXT,
        total_options INTEGER,
        executed_by VARCHAR(255),
        approved_by VARCHAR(255),
        passenger_satisfaction DECIMAL(3,1),
        rebooking_success DECIMAL(5,2),
        categorization VARCHAR(100),
        cancellation_avoided BOOLEAN DEFAULT FALSE,
        potential_delay_minutes INTEGER,
        actual_delay_minutes INTEGER,
        delay_reduction_minutes INTEGER,
        disruption_category VARCHAR(50),
        recovery_efficiency DECIMAL(5,2),
        network_impact VARCHAR(20),
        downstream_flights_affected INTEGER,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
      )
    `);

    console.log("Checking existing recovery logs...");
    const existingCount = await client.query("SELECT COUNT(*) FROM recovery_logs");
    console.log(`Found ${existingCount.rows[0].count} existing recovery logs`);

    console.log("Populating recovery logs from existing disruptions...");
    
    // First, get all flight disruptions
    const disruptionsResult = await client.query(`
      SELECT 
        fd.id, fd.flight_number, fd.route, fd.aircraft, fd.disruption_type,
        fd.disruption_reason, fd.severity, fd.passengers, fd.delay_minutes,
        fd.status, fd.recovery_status, fd.categorization, fd.connection_flights,
        fd.created_at, fd.updated_at
      FROM flight_disruptions fd
      WHERE fd.status IN ('Resolved', 'Completed') 
         OR fd.recovery_status IN ('completed', 'resolved')
      ORDER BY fd.created_at DESC
      LIMIT 50
    `);

    console.log(`Found ${disruptionsResult.rows.length} completed disruptions to process`);

    if (disruptionsResult.rows.length === 0) {
      console.log("No completed disruptions found. Creating sample data...");
      
      // Insert sample recovery logs
      const sampleLogs = [
        {
          solution_id: 'SOL-2025-001',
          disruption_id: '260',
          flight_number: 'FZ215',
          route: 'DXB → BOM',
          aircraft: 'B737-800',
          disruption_type: 'Weather',
          disruption_reason: 'Engine overheating at DXB',
          priority: 'High',
          date_created: new Date('2025-01-10T14:30:15Z'),
          date_executed: new Date('2025-01-10T17:32:15Z'),
          date_completed: new Date('2025-01-10T17:32:15Z'),
          duration: '3h 2m',
          status: 'Successful',
          affected_passengers: 197,
          actual_cost: 125000,
          estimated_cost: 130000,
          cost_variance: -3.8,
          otp_impact: 92.5,
          solution_chosen: 'Option A',
          total_options: 3,
          executed_by: 'Sara Ahmed',
          approved_by: 'Operations Manager',
          passenger_satisfaction: 8.2,
          rebooking_success: 94.1,
          categorization: 'Weather',
          cancellation_avoided: true,
          potential_delay_minutes: 155,
          actual_delay_minutes: 155,
          delay_reduction_minutes: 0,
          disruption_category: 'Weather',
          recovery_efficiency: 95.0,
          network_impact: 'None',
          downstream_flights_affected: 0
        },
        {
          solution_id: 'SOL-2025-002',
          disruption_id: '259',
          flight_number: 'FZ181',
          route: 'DXB → COK',
          aircraft: 'B737-800',
          disruption_type: 'Crew',
          disruption_reason: 'Captain duty time breach',
          priority: 'Medium',
          date_created: new Date('2025-01-10T14:25:10Z'),
          date_executed: new Date('2025-01-10T17:21:10Z'),
          date_completed: new Date('2025-01-10T17:21:10Z'),
          duration: '2h 56m',
          status: 'Successful',
          affected_passengers: 189,
          actual_cost: 89000,
          estimated_cost: 92000,
          cost_variance: -3.3,
          otp_impact: 91.9,
          solution_chosen: 'Option B',
          total_options: 4,
          executed_by: 'Ahmed Hassan',
          approved_by: 'Crew Manager',
          passenger_satisfaction: 8.8,
          rebooking_success: 97.1,
          categorization: 'Crew',
          cancellation_avoided: true,
          potential_delay_minutes: 210,
          actual_delay_minutes: 69,
          delay_reduction_minutes: 141,
          disruption_category: 'Crew',
          recovery_efficiency: 88.0,
          network_impact: 'Low',
          downstream_flights_affected: 1
        },
        {
          solution_id: 'SOL-2025-003',
          disruption_id: '258',
          flight_number: 'FZ147',
          route: 'BKT → DXB',
          aircraft: 'B737 MAX 8',
          disruption_type: 'AOG',
          disruption_reason: 'Engine maintenance check required',
          priority: 'Medium',
          date_created: new Date('2025-01-10T13:15:30Z'),
          date_executed: new Date('2025-01-10T17:45:30Z'),
          date_completed: new Date('2025-01-10T17:45:30Z'),
          duration: '4h 30m',
          status: 'Successful',
          affected_passengers: 165,
          actual_cost: 145000,
          estimated_cost: 148000,
          cost_variance: -2.0,
          otp_impact: 91.0,
          solution_chosen: 'Option A',
          total_options: 2,
          executed_by: 'Fatima Al Zahra',
          approved_by: 'Technical Manager',
          passenger_satisfaction: 7.8,
          rebooking_success: 89.2,
          categorization: 'AOG',
          cancellation_avoided: true,
          potential_delay_minutes: 270,
          actual_delay_minutes: 118,
          delay_reduction_minutes: 152,
          disruption_category: 'AOG',
          recovery_efficiency: 92.0,
          network_impact: 'Medium',
          downstream_flights_affected: 2
        }
      ];

      for (const log of sampleLogs) {
        try {
          await client.query(`
            INSERT INTO recovery_logs (
              solution_id, disruption_id, flight_number, route, aircraft, 
              disruption_type, disruption_reason, priority, date_created, 
              date_executed, date_completed, duration, status, affected_passengers,
              actual_cost, estimated_cost, cost_variance, otp_impact, 
              solution_chosen, total_options, executed_by, approved_by,
              passenger_satisfaction, rebooking_success, categorization,
              cancellation_avoided, potential_delay_minutes, actual_delay_minutes,
              delay_reduction_minutes, disruption_category, recovery_efficiency,
              network_impact, downstream_flights_affected
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
              $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
              $29, $30, $31, $32, $33
            ) ON CONFLICT (solution_id) DO NOTHING
          `, [
            log.solution_id, log.disruption_id, log.flight_number, log.route, log.aircraft,
            log.disruption_type, log.disruption_reason, log.priority, log.date_created,
            log.date_executed, log.date_completed, log.duration, log.status, log.affected_passengers,
            log.actual_cost, log.estimated_cost, log.cost_variance, log.otp_impact,
            log.solution_chosen, log.total_options, log.executed_by, log.approved_by,
            log.passenger_satisfaction, log.rebooking_success, log.categorization,
            log.cancellation_avoided, log.potential_delay_minutes, log.actual_delay_minutes,
            log.delay_reduction_minutes, log.disruption_category, log.recovery_efficiency,
            log.network_impact, log.downstream_flights_affected
          ]);
          console.log(`Inserted sample log: ${log.solution_id}`);
        } catch (error) {
          console.log(`Skipped duplicate: ${log.solution_id}`);
        }
      }
    } else {
      // Process existing disruptions
      let insertedCount = 0;
      
      for (const disruption of disruptionsResult.rows) {
        const solutionId = `SOL-${new Date(disruption.created_at).getFullYear()}-${String(disruption.id).padStart(3, '0')}`;
        
        try {
          // Calculate duration
          const startTime = new Date(disruption.created_at);
          const endTime = disruption.updated_at ? new Date(disruption.updated_at) : new Date(Date.now());
          const durationHours = Math.floor((endTime - startTime) / (1000 * 60 * 60));
          const durationMinutes = Math.floor(((endTime - startTime) % (1000 * 60 * 60)) / (1000 * 60));
          const duration = `${durationHours}h ${durationMinutes}m`;

          await client.query(`
            INSERT INTO recovery_logs (
              solution_id, disruption_id, flight_number, route, aircraft, 
              disruption_type, disruption_reason, priority, date_created, 
              date_executed, date_completed, duration, status, affected_passengers,
              actual_cost, estimated_cost, cost_variance, otp_impact, 
              solution_chosen, total_options, executed_by, approved_by,
              passenger_satisfaction, rebooking_success, categorization,
              cancellation_avoided, potential_delay_minutes, actual_delay_minutes,
              delay_reduction_minutes, disruption_category, recovery_efficiency,
              network_impact, downstream_flights_affected
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
              $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
              $29, $30, $31, $32, $33
            ) ON CONFLICT (solution_id) DO NOTHING
          `, [
            solutionId,
            disruption.id.toString(),
            disruption.flight_number || 'N/A',
            disruption.route || 'N/A',
            disruption.aircraft || 'N/A',
            disruption.disruption_type || 'Unknown',
            disruption.disruption_reason || 'N/A',
            disruption.severity || 'Medium',
            disruption.created_at,
            disruption.updated_at || disruption.created_at,
            disruption.updated_at || disruption.created_at,
            duration,
            'Successful',
            disruption.passengers || 180,
            (disruption.delay_minutes || 120) * 150 + (disruption.passengers || 180) * 50, // actual_cost
            (disruption.delay_minutes || 120) * 165 + (disruption.passengers || 180) * 55, // estimated_cost
            -5.0, // cost_variance
            disruption.delay_minutes <= 30 ? 95.0 : disruption.delay_minutes <= 120 ? 88.0 : 82.0, // otp_impact
            'Recovery Option A',
            3, // total_options
            'Operations Team',
            disruption.severity === 'Critical' ? 'Operations Director' : 'Operations Manager',
            disruption.delay_minutes <= 30 ? 8.5 : disruption.delay_minutes <= 120 ? 7.8 : 7.2, // passenger_satisfaction
            disruption.delay_minutes <= 60 ? 95.0 : disruption.delay_minutes <= 180 ? 87.0 : 82.0, // rebooking_success
            disruption.categorization || disruption.disruption_type || 'Other',
            true, // cancellation_avoided
            (disruption.delay_minutes || 120) + 30, // potential_delay_minutes
            disruption.delay_minutes || 120, // actual_delay_minutes
            30, // delay_reduction_minutes
            disruption.disruption_type || 'Other',
            disruption.delay_minutes <= 30 ? 95.0 : disruption.delay_minutes <= 120 ? 88.0 : 82.0, // recovery_efficiency
            (disruption.connection_flights || 0) === 0 ? 'None' : (disruption.connection_flights || 0) <= 2 ? 'Low' : 'Medium', // network_impact
            disruption.connection_flights || 1 // downstream_flights_affected
          ]);
          
          insertedCount++;
        } catch (error) {
          if (!error.message.includes('duplicate key')) {
            console.log(`Error inserting log for disruption ${disruption.id}: ${error.message}`);
          }
        }
      }
      
      console.log(`Inserted ${insertedCount} new recovery log entries from existing disruptions`);
    }

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_recovery_logs_disruption_id ON recovery_logs(disruption_id);
      CREATE INDEX IF NOT EXISTS idx_recovery_logs_flight_number ON recovery_logs(flight_number);
      CREATE INDEX IF NOT EXISTS idx_recovery_logs_status ON recovery_logs(status);
      CREATE INDEX IF NOT EXISTS idx_recovery_logs_priority ON recovery_logs(priority);
      CREATE INDEX IF NOT EXISTS idx_recovery_logs_created_at ON recovery_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_recovery_logs_disruption_category ON recovery_logs(disruption_category);
    `);

    await client.query("COMMIT");
    
    // Check final count
    const finalCount = await client.query("SELECT COUNT(*) FROM recovery_logs");
    console.log(`✅ Recovery logs population completed successfully. Total logs: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error populating recovery logs:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await populateRecoveryLogs();
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { populateRecoveryLogs };
