
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/aeron_settings',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function deleteFlightDisruption(disruptionId) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`Starting deletion of disruption ID: ${disruptionId}`);
    
    // Step 1: Delete from detail tables
    const detailTables = [
      'rotation_plan_details',
      'cost_analysis_details', 
      'timeline_details',
      'resource_details',
      'technical_specifications'
    ];
    
    for (const table of detailTables) {
      const result = await client.query(`
        DELETE FROM ${table} 
        WHERE recovery_option_id IN (
          SELECT ro.id FROM recovery_options ro
          JOIN flight_disruptions fd ON ro.disruption_id = fd.id
          WHERE fd.id = $1
        )
      `, [disruptionId]);
      console.log(`Deleted ${result.rowCount} records from ${table}`);
    }
    
    // Step 2: Delete from recovery tables
    const recoveryTables = [
      'recovery_steps_detailed',
      'recovery_options_detailed', 
      'recovery_options',
      'recovery_steps'
    ];
    
    for (const table of recoveryTables) {
      const result = await client.query(`
        DELETE FROM ${table} WHERE disruption_id = $1
      `, [disruptionId]);
      console.log(`Deleted ${result.rowCount} records from ${table}`);
    }
    
    // Step 3: Delete from related tables
    const relatedTables = [
      'crew_disruption_mapping',
      'hotel_bookings'
    ];
    
    for (const table of relatedTables) {
      const result = await client.query(`
        DELETE FROM ${table} WHERE disruption_id = $1
      `, [disruptionId]);
      console.log(`Deleted ${result.rowCount} records from ${table}`);
    }
    
    // Step 4: Delete pending solutions if table exists
    try {
      const result = await client.query(`
        DELETE FROM pending_recovery_solutions WHERE disruption_id = $1
      `, [disruptionId]);
      console.log(`Deleted ${result.rowCount} records from pending_recovery_solutions`);
    } catch (error) {
      console.log('Pending recovery solutions table not found, skipping...');
    }
    
    // Step 5: Finally delete the main disruption record
    const mainResult = await client.query(`
      DELETE FROM flight_disruptions WHERE id = $1
    `, [disruptionId]);
    
    if (mainResult.rowCount === 0) {
      throw new Error(`No disruption found with ID: ${disruptionId}`);
    }
    
    await client.query('COMMIT');
    console.log(`Successfully deleted disruption ${disruptionId} and all related data`);
    
    return { success: true, message: `Deleted disruption ${disruptionId}` };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting disruption:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function bulkDeleteDisruptions(criteria) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Build WHERE clause based on criteria
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (criteria.status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(criteria.status);
    }
    
    if (criteria.flightNumber) {
      paramCount++;
      whereClause += ` AND flight_number = $${paramCount}`;
      params.push(criteria.flightNumber);
    }
    
    if (criteria.olderThanDays) {
      paramCount++;
      whereClause += ` AND created_at < NOW() - INTERVAL '${criteria.olderThanDays} days'`;
    }
    
    // Get disruption IDs to delete
    const disruptionsResult = await client.query(`
      SELECT id, flight_number, status FROM flight_disruptions ${whereClause}
    `, params);
    
    const disruptionIds = disruptionsResult.rows.map(row => row.id);
    console.log(`Found ${disruptionIds.length} disruptions to delete:`, 
      disruptionsResult.rows.map(r => `${r.flight_number} (${r.status})`));
    
    if (disruptionIds.length === 0) {
      console.log('No disruptions found matching criteria');
      return { success: true, deleted: 0 };
    }
    
    // Delete related records
    const deleteQueries = [
      `DELETE FROM rotation_plan_details WHERE recovery_option_id IN (
         SELECT ro.id FROM recovery_options ro WHERE ro.disruption_id = ANY($1))`,
      `DELETE FROM cost_analysis_details WHERE recovery_option_id IN (
         SELECT ro.id FROM recovery_options ro WHERE ro.disruption_id = ANY($1))`,
      `DELETE FROM timeline_details WHERE recovery_option_id IN (
         SELECT ro.id FROM recovery_options ro WHERE ro.disruption_id = ANY($1))`,
      `DELETE FROM resource_details WHERE recovery_option_id IN (
         SELECT ro.id FROM recovery_options ro WHERE ro.disruption_id = ANY($1))`,
      `DELETE FROM technical_specifications WHERE recovery_option_id IN (
         SELECT ro.id FROM recovery_options ro WHERE ro.disruption_id = ANY($1))`,
      `DELETE FROM recovery_steps_detailed WHERE disruption_id = ANY($1)`,
      `DELETE FROM recovery_options_detailed WHERE disruption_id = ANY($1)`,
      `DELETE FROM recovery_options WHERE disruption_id = ANY($1)`,
      `DELETE FROM recovery_steps WHERE disruption_id = ANY($1)`,
      `DELETE FROM crew_disruption_mapping WHERE disruption_id = ANY($1)`,
      `DELETE FROM hotel_bookings WHERE disruption_id = ANY($1)`
    ];
    
    for (const query of deleteQueries) {
      const result = await client.query(query, [disruptionIds]);
      console.log(`Deleted ${result.rowCount} related records`);
    }
    
    // Try to delete pending solutions
    try {
      const result = await client.query(
        `DELETE FROM pending_recovery_solutions WHERE disruption_id = ANY($1)`,
        [disruptionIds]
      );
      console.log(`Deleted ${result.rowCount} pending solutions`);
    } catch (error) {
      console.log('Pending solutions table not found, skipping...');
    }
    
    // Finally delete main records
    const mainResult = await client.query(
      `DELETE FROM flight_disruptions WHERE id = ANY($1)`,
      [disruptionIds]
    );
    
    await client.query('COMMIT');
    console.log(`Successfully deleted ${mainResult.rowCount} disruptions and all related data`);
    
    return { success: true, deleted: mainResult.rowCount };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in bulk delete:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Example usage
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args[0] === 'single' && args[1]) {
      // Delete single disruption by ID
      await deleteFlightDisruption(parseInt(args[1]));
    } else if (args[0] === 'bulk') {
      // Bulk delete examples
      if (args[1] === 'resolved') {
        await bulkDeleteDisruptions({ status: 'Resolved', olderThanDays: 30 });
      } else if (args[1] === 'cancelled') {
        await bulkDeleteDisruptions({ status: 'Cancelled' });
      } else if (args[1] === 'flight' && args[2]) {
        await bulkDeleteDisruptions({ flightNumber: args[2] });
      }
      else if (args[1] === 'flight' && args[2]) {
        await bulkDeleteDisruptions({ flightNumber: args[2] });
      }
    } else {
      console.log('Usage:');
      console.log('  node cleanup-disruptions.js single <disruption_id>');
      console.log('  node cleanup-disruptions.js bulk resolved');
      console.log('  node cleanup-disruptions.js bulk cancelled');
      console.log('  node cleanup-disruptions.js bulk flight <flight_number>');
    }
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { deleteFlightDisruption, bulkDeleteDisruptions };
