
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

    console.log("Populating recovery logs from existing disruptions...");
    
    // Insert data from flight_disruptions into recovery_logs
    const insertQuery = `
      INSERT INTO recovery_logs (
        solution_id, disruption_id, flight_number, route, aircraft, 
        disruption_type, disruption_reason, priority, date_created, 
        date_executed, date_completed, duration, status, affected_passengers,
        actual_cost, estimated_cost, cost_variance, otp_impact, 
        solution_chosen, total_options, executed_by, approved_by,
        passenger_satisfaction, rebooking_success, categorization,
        cancellation_avoided, potential_delay_minutes, actual_delay_minutes,
        delay_reduction_minutes, disruption_category, recovery_efficiency,
        network_impact, downstream_flights_affected, created_at
      )
      SELECT 
        CONCAT('SOL-', EXTRACT(YEAR FROM fd.created_at), '-', LPAD(fd.id::text, 3, '0')) as solution_id,
        fd.id::text as disruption_id,
        fd.flight_number,
        fd.route,
        fd.aircraft,
        fd.disruption_type,
        fd.disruption_reason,
        CASE 
          WHEN fd.severity = 'Critical' THEN 'Critical'
          WHEN fd.severity = 'High' THEN 'High'
          WHEN fd.severity = 'Medium' THEN 'Medium'
          ELSE 'Low'
        END as priority,
        fd.created_at as date_created,
        COALESCE(fd.updated_at, fd.created_at + INTERVAL '2 hours') as date_executed,
        COALESCE(fd.updated_at, fd.created_at + INTERVAL '2 hours') as date_completed,
        CASE 
          WHEN fd.delay_minutes IS NOT NULL THEN 
            CASE 
              WHEN fd.delay_minutes >= 60 THEN 
                FLOOR(fd.delay_minutes / 60) || 'h ' || (fd.delay_minutes % 60) || 'm'
              ELSE 
                fd.delay_minutes || 'm'
            END
          ELSE '2h 30m'
        END as duration,
        CASE 
          WHEN fd.status = 'Resolved' OR fd.recovery_status = 'completed' THEN 'Successful'
          WHEN fd.status = 'Cancelled' THEN 'Failed'
          ELSE 'Successful'
        END as status,
        COALESCE(fd.passengers, 180) as affected_passengers,
        CASE 
          WHEN fd.delay_minutes IS NOT NULL THEN (fd.delay_minutes * 150 + fd.passengers * 50)
          ELSE 95000
        END as actual_cost,
        CASE 
          WHEN fd.delay_minutes IS NOT NULL THEN (fd.delay_minutes * 165 + fd.passengers * 55)
          ELSE 100000
        END as estimated_cost,
        CASE 
          WHEN fd.delay_minutes IS NOT NULL THEN 
            ROUND(((fd.delay_minutes * 150 + fd.passengers * 50) - (fd.delay_minutes * 165 + fd.passengers * 55)) / 
                  NULLIF((fd.delay_minutes * 165 + fd.passengers * 55), 0) * 100, 1)
          ELSE -5.0
        END as cost_variance,
        CASE 
          WHEN fd.delay_minutes <= 15 THEN 95.0
          WHEN fd.delay_minutes <= 60 THEN 90.0
          WHEN fd.delay_minutes <= 120 THEN 85.0
          ELSE 80.0
        END as otp_impact,
        COALESCE(ro.title, 'Recovery Option A') as solution_chosen,
        COALESCE(option_count.total_options, 3) as total_options,
        COALESCE(crew_mapping.executed_by, 'Operations Team') as executed_by,
        CASE 
          WHEN fd.severity = 'Critical' THEN 'Operations Director'
          WHEN fd.severity = 'High' THEN 'Operations Manager'
          ELSE 'Shift Supervisor'
        END as approved_by,
        CASE 
          WHEN fd.delay_minutes <= 30 THEN 8.5
          WHEN fd.delay_minutes <= 120 THEN 7.8
          ELSE 7.2
        END as passenger_satisfaction,
        CASE 
          WHEN fd.delay_minutes <= 60 THEN 95.0
          WHEN fd.delay_minutes <= 180 THEN 87.0
          ELSE 82.0
        END as rebooking_success,
        COALESCE(fd.categorization, fd.disruption_type) as categorization,
        CASE 
          WHEN fd.status = 'Resolved' OR fd.recovery_status = 'completed' THEN true
          WHEN fd.delay_minutes IS NULL OR fd.delay_minutes > 240 THEN true
          ELSE false
        END as cancellation_avoided,
        CASE 
          WHEN fd.delay_minutes IS NOT NULL THEN fd.delay_minutes + 30
          ELSE 180
        END as potential_delay_minutes,
        COALESCE(fd.delay_minutes, 155) as actual_delay_minutes,
        CASE 
          WHEN fd.delay_minutes IS NOT NULL AND fd.delay_minutes > 0 THEN 
            GREATEST(0, (fd.delay_minutes + 30) - fd.delay_minutes)
          ELSE 25
        END as delay_reduction_minutes,
        COALESCE(fd.disruption_type, 'Other') as disruption_category,
        CASE 
          WHEN fd.delay_minutes <= 30 THEN 95.0
          WHEN fd.delay_minutes <= 120 THEN 88.0
          ELSE 82.0
        END as recovery_efficiency,
        CASE 
          WHEN fd.connection_flights = 0 THEN 'None'
          WHEN fd.connection_flights <= 2 THEN 'Low'
          WHEN fd.connection_flights <= 5 THEN 'Medium'
          ELSE 'High'
        END as network_impact,
        COALESCE(fd.connection_flights, 1) as downstream_flights_affected,
        fd.created_at
      FROM flight_disruptions fd
      LEFT JOIN (
        SELECT DISTINCT ON (disruption_id) disruption_id, title, confidence
        FROM recovery_options 
        ORDER BY disruption_id, confidence DESC
      ) ro ON fd.id = ro.disruption_id
      LEFT JOIN (
        SELECT disruption_id, COUNT(*) as total_options
        FROM recovery_options
        GROUP BY disruption_id
      ) option_count ON fd.id = option_count.disruption_id
      LEFT JOIN (
        SELECT DISTINCT disruption_id, 
               COALESCE(notes, 'Operations Team') as executed_by
        FROM crew_disruption_mapping
      ) crew_mapping ON fd.id = crew_mapping.disruption_id
      WHERE NOT EXISTS (
        SELECT 1 FROM recovery_logs rl 
        WHERE rl.disruption_id = fd.id::text
      )
    `;

    const result = await client.query(insertQuery);
    console.log(`Inserted ${result.rowCount} recovery log entries`);

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
    console.log("✅ Recovery logs population completed successfully");
    
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
