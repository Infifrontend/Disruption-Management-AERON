
#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

// Database connection
let connectionString = process.env.DB_URL || 'postgresql://0.0.0.0:5432/aeron_settings';

const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

async function updateExpiredDisruptions() {
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    console.log(`⏰ Cutoff time: ${twentyFourHoursAgo.toISOString()}`);
    console.log('🔍 Checking for disruptions older than 24 hours...');

    // First, check how many disruptions will be affected
    const checkResult = await client.query(
      `SELECT id, flight_number, created_at, status 
       FROM flight_disruptions 
       WHERE created_at < $1 AND status != 'expired'
       ORDER BY created_at DESC`,
      [twentyFourHoursAgo.toISOString()]
    );

    const disruptionsToExpire = checkResult.rows;
    console.log(`📊 Found ${disruptionsToExpire.length} disruptions to mark as expired:`);
    
    if (disruptionsToExpire.length === 0) {
      console.log('✅ No disruptions need to be marked as expired');
      client.release();
      return { success: true, updatedCount: 0 };
    }

    // Show which disruptions will be expired
    disruptionsToExpire.forEach((disruption, index) => {
      const age = Math.round((Date.now() - new Date(disruption.created_at).getTime()) / (1000 * 60 * 60));
      console.log(`  ${index + 1}. ${disruption.flight_number} (${disruption.status}) - ${age}h old`);
    });

    console.log('\n🔄 Updating disruption status to "expired"...');

    // Update disruptions older than 24 hours to 'expired' status
    const updateResult = await client.query(
      `UPDATE flight_disruptions 
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
       WHERE created_at < $1 AND status != 'expired' 
       RETURNING id, flight_number, created_at, status`,
      [twentyFourHoursAgo.toISOString()]
    );

    const updatedCount = updateResult.rows.length;
    console.log(`✅ Successfully updated ${updatedCount} disruptions to expired status`);

    // Show summary of recent disruptions still active
    const activeResult = await client.query(
      `SELECT COUNT(*) as count, status 
       FROM flight_disruptions 
       WHERE created_at >= $1 
       GROUP BY status 
       ORDER BY status`,
      [twentyFourHoursAgo.toISOString()]
    );

    console.log('\n📈 Active disruptions (last 24 hours):');
    activeResult.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });

    client.release();
    return { success: true, updatedCount };

  } catch (error) {
    console.error('❌ Error updating expired disruptions:', error);
    return { success: false, updatedCount: 0 };
  } finally {
    await pool.end();
  }
}

// Run the update function
updateExpiredDisruptions()
  .then(result => {
    if (result.success) {
      console.log(`\n🎉 Update completed successfully! ${result.updatedCount} disruptions marked as expired.`);
      process.exit(0);
    } else {
      console.log('\n💥 Update failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
