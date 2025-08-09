
-- Categorization Replacement Queries
-- These queries help replace the old categorization string field with proper foreign key references

-- Query 1: Show current categorization mapping
SELECT 
    fd.categorization,
    COUNT(*) as count,
    dc.category_code,
    dc.category_name
FROM flight_disruptions fd
LEFT JOIN disruption_categories dc ON fd.category_id = dc.id
GROUP BY fd.categorization, dc.category_code, dc.category_name
ORDER BY count DESC;

-- Query 2: Update categorization to use foreign keys (main replacement query)
WITH categorization_mapping AS (
    SELECT 
        fd.id,
        fd.categorization,
        CASE 
            -- Aircraft Issues
            WHEN LOWER(fd.categorization) LIKE '%aircraft%' 
                OR LOWER(fd.categorization) LIKE '%aog%'
                OR LOWER(fd.categorization) LIKE '%technical%'
                OR LOWER(fd.categorization) LIKE '%maintenance%'
                OR LOWER(fd.categorization) LIKE '%engine%'
                OR LOWER(fd.categorization) LIKE '%mechanical%'
            THEN 'AIRCRAFT_ISSUE'
            
            -- Crew Issues  
            WHEN LOWER(fd.categorization) LIKE '%crew%' 
                OR LOWER(fd.categorization) LIKE '%duty time%'
                OR LOWER(fd.categorization) LIKE '%sick%'
                OR LOWER(fd.categorization) LIKE '%pilot%'
                OR LOWER(fd.categorization) LIKE '%attendant%'
            THEN 'CREW_ISSUE'
            
            -- Weather/ATC
            WHEN LOWER(fd.categorization) LIKE '%weather%' 
                OR LOWER(fd.categorization) LIKE '%atc%'
                OR LOWER(fd.categorization) LIKE '%fog%'
                OR LOWER(fd.categorization) LIKE '%storm%'
                OR LOWER(fd.categorization) LIKE '%wind%'
                OR LOWER(fd.categorization) LIKE '%visibility%'
            THEN 'ATC_WEATHER'
            
            -- Airport/Curfew/Congestion
            WHEN LOWER(fd.categorization) LIKE '%airport%' 
                OR LOWER(fd.categorization) LIKE '%curfew%'
                OR LOWER(fd.categorization) LIKE '%congestion%'
                OR LOWER(fd.categorization) LIKE '%runway%'
                OR LOWER(fd.categorization) LIKE '%gate%'
                OR LOWER(fd.categorization) LIKE '%slot%'
            THEN 'CURFEW_CONGESTION'
            
            -- Rotation/Maintenance
            WHEN LOWER(fd.categorization) LIKE '%rotation%'
                OR LOWER(fd.categorization) LIKE '%schedule%'
                OR LOWER(fd.categorization) LIKE '%fleet%'
            THEN 'ROTATION_MAINTENANCE'
            
            -- Default fallback
            ELSE 'AIRCRAFT_ISSUE'
        END as mapped_category_code
    FROM flight_disruptions fd
    WHERE fd.categorization IS NOT NULL
)
UPDATE flight_disruptions 
SET category_id = (
    SELECT dc.id 
    FROM disruption_categories dc 
    WHERE dc.category_code = categorization_mapping.mapped_category_code
)
FROM categorization_mapping
WHERE flight_disruptions.id = categorization_mapping.id;

-- Query 3: Verify the replacement worked correctly
SELECT 
    dc.category_code,
    dc.category_name,
    COUNT(*) as disruption_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM flight_disruptions fd
JOIN disruption_categories dc ON fd.category_id = dc.id
GROUP BY dc.category_code, dc.category_name
ORDER BY disruption_count DESC;

-- Query 4: Show disruptions that couldn't be categorized
SELECT 
    fd.id,
    fd.flight_number,
    fd.categorization,
    fd.disruption_type,
    fd.disruption_reason
FROM flight_disruptions fd
WHERE fd.category_id IS NULL
AND fd.categorization IS NOT NULL
LIMIT 20;

-- Query 5: Update all NULL category_id records to default category
UPDATE flight_disruptions 
SET category_id = (
    SELECT id FROM disruption_categories 
    WHERE category_code = 'AIRCRAFT_ISSUE' 
    LIMIT 1
)
WHERE category_id IS NULL;

-- Query 6: Final validation - show sample of updated records
SELECT 
    fd.id,
    fd.flight_number,
    fd.categorization as old_categorization,
    dc.category_code as new_category_code,
    dc.category_name as new_category_name,
    fd.disruption_type,
    fd.status
FROM flight_disruptions fd
JOIN disruption_categories dc ON fd.category_id = dc.id
ORDER BY fd.created_at DESC
LIMIT 20;

-- Query 7: Performance check - ensure indexes are working
EXPLAIN ANALYZE 
SELECT COUNT(*) 
FROM flight_disruptions fd
JOIN disruption_categories dc ON fd.category_id = dc.id
WHERE dc.category_code = 'AIRCRAFT_ISSUE';
