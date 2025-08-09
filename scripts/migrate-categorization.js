
const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/aeron_settings",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function migrateCategorization() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting categorization migration...');

    // Begin transaction
    await client.query('BEGIN');

    // Step 1: Add category_id column if it doesn't exist
    console.log('📝 Adding category_id column...');
    await client.query(`
      ALTER TABLE flight_disruptions 
      ADD COLUMN IF NOT EXISTS category_id INTEGER
    `);

    // Step 2: Add foreign key constraint
    console.log('🔗 Adding foreign key constraint...');
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'flight_disruptions_category_id_fkey'
              AND table_name = 'flight_disruptions'
          ) THEN
              ALTER TABLE flight_disruptions 
              ADD CONSTRAINT flight_disruptions_category_id_fkey 
              FOREIGN KEY (category_id) REFERENCES disruption_categories(id);
          END IF;
      END $$;
    `);

    // Step 3: Map existing categorization strings to category IDs
    console.log('🗺️ Mapping categorization strings to category IDs...');
    const updateResult = await client.query(`
      UPDATE flight_disruptions 
      SET category_id = (
          SELECT dc.id 
          FROM disruption_categories dc 
          WHERE dc.category_code = CASE 
              WHEN LOWER(flight_disruptions.categorization) LIKE '%aircraft%' 
                  OR LOWER(flight_disruptions.categorization) LIKE '%aog%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%technical%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%engine%'
              THEN 'AIRCRAFT_ISSUE'
              
              WHEN LOWER(flight_disruptions.categorization) LIKE '%crew%' 
                  OR LOWER(flight_disruptions.categorization) LIKE '%duty time%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%sick%'
              THEN 'CREW_ISSUE'
              
              WHEN LOWER(flight_disruptions.categorization) LIKE '%weather%' 
                  OR LOWER(flight_disruptions.categorization) LIKE '%atc%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%fog%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%storm%'
              THEN 'ATC_WEATHER'
              
              WHEN LOWER(flight_disruptions.categorization) LIKE '%airport%' 
                  OR LOWER(flight_disruptions.categorization) LIKE '%curfew%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%congestion%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%runway%'
              THEN 'CURFEW_CONGESTION'
              
              WHEN LOWER(flight_disruptions.categorization) LIKE '%rotation%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%maintenance%'
                  OR LOWER(flight_disruptions.categorization) LIKE '%schedule%'
              THEN 'ROTATION_MAINTENANCE'
              
              ELSE 'AIRCRAFT_ISSUE'
          END
          LIMIT 1
      )
      WHERE categorization IS NOT NULL 
      AND category_id IS NULL
    `);

    console.log(`✅ Updated ${updateResult.rowCount} records with categorization mapping`);

    // Step 4: Set default category for remaining NULL records
    console.log('🔧 Setting default category for remaining records...');
    const defaultResult = await client.query(`
      UPDATE flight_disruptions 
      SET category_id = (
          SELECT id FROM disruption_categories 
          WHERE category_code = 'AIRCRAFT_ISSUE' 
          LIMIT 1
      )
      WHERE category_id IS NULL
    `);

    console.log(`✅ Set default category for ${defaultResult.rowCount} records`);

    // Step 5: Add index for performance
    console.log('📈 Adding performance index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flight_disruptions_category_id 
      ON flight_disruptions(category_id)
    `);

    // Step 6: Display migration summary
    const summaryResult = await client.query(`
      SELECT 
          dc.category_code,
          dc.category_name,
          COUNT(*) as disruption_count
      FROM flight_disruptions fd
      JOIN disruption_categories dc ON fd.category_id = dc.id
      GROUP BY dc.category_code, dc.category_name
      ORDER BY disruption_count DESC
    `);

    console.log('\n📊 Migration Summary:');
    console.table(summaryResult.rows);

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCategorization()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateCategorization };
