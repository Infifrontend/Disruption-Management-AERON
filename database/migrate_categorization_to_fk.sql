
-- Migration script to add foreign key relationship and update categorization data
-- This script will:
-- 1. Add the category_id column as foreign key
-- 2. Update existing records to map categorization strings to category IDs
-- 3. Optionally remove the old categorization column

-- Step 1: Add the category_id column if it doesn't exist
ALTER TABLE flight_disruptions 
ADD COLUMN IF NOT EXISTS category_id INTEGER;

-- Step 2: Add foreign key constraint if it doesn't exist
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

-- Step 3: Update existing records to map categorization to category_id
UPDATE flight_disruptions 
SET category_id = (
    SELECT dc.id 
    FROM disruption_categories dc 
    WHERE dc.category_name = flight_disruptions.categorization
    OR dc.category_code = CASE 
        WHEN flight_disruptions.categorization LIKE '%Aircraft%' OR flight_disruptions.categorization LIKE '%AOG%' THEN 'AIRCRAFT_ISSUE'
        WHEN flight_disruptions.categorization LIKE '%Crew%' OR flight_disruptions.categorization LIKE '%duty time%' OR flight_disruptions.categorization LIKE '%sick%' THEN 'CREW_ISSUE'
        WHEN flight_disruptions.categorization LIKE '%Weather%' OR flight_disruptions.categorization LIKE '%ATC%' THEN 'ATC_WEATHER'
        WHEN flight_disruptions.categorization LIKE '%Curfew%' OR flight_disruptions.categorization LIKE '%Congestion%' OR flight_disruptions.categorization LIKE '%Airport%' THEN 'CURFEW_CONGESTION'
        WHEN flight_disruptions.categorization LIKE '%Rotation%' OR flight_disruptions.categorization LIKE '%Maintenance%' THEN 'ROTATION_MAINTENANCE'
        ELSE 'AIRCRAFT_ISSUE' -- Default fallback
    END
    LIMIT 1
)
WHERE categorization IS NOT NULL 
AND category_id IS NULL;

-- Step 4: Set default category for records without categorization
UPDATE flight_disruptions 
SET category_id = (
    SELECT id FROM disruption_categories 
    WHERE category_code = 'AIRCRAFT_ISSUE' 
    LIMIT 1
)
WHERE category_id IS NULL;

-- Step 5: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_category_id 
ON flight_disruptions(category_id);

-- Step 6: Verify the migration
SELECT 
    fd.id,
    fd.flight_number,
    fd.categorization,
    dc.category_code,
    dc.category_name
FROM flight_disruptions fd
LEFT JOIN disruption_categories dc ON fd.category_id = dc.id
WHERE fd.categorization IS NOT NULL
ORDER BY fd.id DESC
LIMIT 10;

-- Display summary
SELECT 
    'Migration Summary' as status,
    COUNT(*) as total_disruptions,
    COUNT(category_id) as categorized_disruptions,
    COUNT(*) - COUNT(category_id) as uncategorized_disruptions
FROM flight_disruptions;
