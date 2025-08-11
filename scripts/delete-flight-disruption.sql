
-- Delete Flight Disruption and Related Data
-- This script safely deletes a flight disruption and all its related records
-- Replace the WHERE conditions with your specific criteria

-- Usage Examples:
-- 1. Delete by disruption ID: WHERE fd.id = 123
-- 2. Delete by flight number and date: WHERE fd.flight_number = 'FZ203' AND DATE(fd.scheduled_departure) = '2025-01-10'
-- 3. Delete all disruptions for a specific flight: WHERE fd.flight_number = 'FZ203'
-- 4. Delete by status: WHERE fd.status = 'Resolved'

BEGIN;

-- Step 1: Delete from detail tables that reference recovery_options
DELETE FROM rotation_plan_details 
WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro
    JOIN flight_disruptions fd ON ro.disruption_id = fd.id
    WHERE fd.id = $1  -- Replace with your condition
);

DELETE FROM cost_analysis_details 
WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro
    JOIN flight_disruptions fd ON ro.disruption_id = fd.id
    WHERE fd.id = $1  -- Replace with your condition
);

DELETE FROM timeline_details 
WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro
    JOIN flight_disruptions fd ON ro.disruption_id = fd.id
    WHERE fd.id = $1  -- Replace with your condition
);

DELETE FROM resource_details 
WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro
    JOIN flight_disruptions fd ON ro.disruption_id = fd.id
    WHERE fd.id = $1  -- Replace with your condition
);

DELETE FROM technical_specifications 
WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro
    JOIN flight_disruptions fd ON ro.disruption_id = fd.id
    WHERE fd.id = $1  -- Replace with your condition
);

-- Step 2: Delete from recovery_steps_detailed
DELETE FROM recovery_steps_detailed 
WHERE disruption_id IN (
    SELECT id FROM flight_disruptions 
    WHERE id = $1  -- Replace with your condition
);

-- Step 3: Delete from recovery_options_detailed
DELETE FROM recovery_options_detailed 
WHERE disruption_id IN (
    SELECT id FROM flight_disruptions 
    WHERE id = $1  -- Replace with your condition
);

-- Step 4: Delete from recovery_options
DELETE FROM recovery_options 
WHERE disruption_id IN (
    SELECT id FROM flight_disruptions 
    WHERE id = $1  -- Replace with your condition
);

-- Step 5: Delete from recovery_steps
DELETE FROM recovery_steps 
WHERE disruption_id IN (
    SELECT id FROM flight_disruptions 
    WHERE id = $1  -- Replace with your condition
);

-- Step 6: Delete from crew_disruption_mapping
DELETE FROM crew_disruption_mapping 
WHERE disruption_id IN (
    SELECT id FROM flight_disruptions 
    WHERE id = $1  -- Replace with your condition
);

-- Step 7: Delete from hotel_bookings
DELETE FROM hotel_bookings 
WHERE disruption_id IN (
    SELECT id FROM flight_disruptions 
    WHERE id = $1  -- Replace with your condition
);

-- Step 8: Delete from pending_recovery_solutions (if exists)
DELETE FROM pending_recovery_solutions 
WHERE disruption_id IN (
    SELECT id FROM flight_disruptions 
    WHERE id = $1  -- Replace with your condition
);

-- Step 9: Finally, delete from flight_disruptions
DELETE FROM flight_disruptions 
WHERE id = $1;  -- Replace with your condition

COMMIT;

-- Verification query to check if deletion was successful
SELECT COUNT(*) as remaining_records FROM flight_disruptions WHERE id = $1;
