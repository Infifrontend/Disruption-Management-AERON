
-- Clear Transactional Data Script
-- This script safely removes all transactional data while preserving reference/master data
-- Execute this script to reset the system to a clean state with configuration intact

BEGIN;

-- Disable foreign key checks temporarily for faster truncation
SET session_replication_role = replica;

-- Step 1: Truncate transactional tables in correct order (to handle foreign key dependencies)
TRUNCATE TABLE settings_audit CASCADE;
TRUNCATE TABLE recovery_logs CASCADE;
TRUNCATE TABLE pending_recovery_solutions CASCADE;

-- Step 2: Truncate detailed recovery tables
TRUNCATE TABLE rotation_plan_details CASCADE;
TRUNCATE TABLE cost_analysis_details CASCADE;
TRUNCATE TABLE timeline_details CASCADE;
TRUNCATE TABLE resource_details CASCADE;
TRUNCATE TABLE technical_specifications CASCADE;

-- Step 3: Truncate recovery steps and options
TRUNCATE TABLE recovery_steps_detailed CASCADE;
TRUNCATE TABLE recovery_steps CASCADE;
TRUNCATE TABLE recovery_options_detailed CASCADE;
TRUNCATE TABLE recovery_options CASCADE;

-- Step 4: Truncate passenger and crew operational data
TRUNCATE TABLE passenger_rebookings CASCADE;
TRUNCATE TABLE passengers CASCADE;
TRUNCATE TABLE crew_disruption_mapping CASCADE;
TRUNCATE TABLE crew_hotel_assignments CASCADE;

-- Step 5: Truncate hotel bookings and flight disruptions
TRUNCATE TABLE hotel_bookings CASCADE;
TRUNCATE TABLE flight_disruptions CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Reset auto-increment sequences to start fresh
ALTER SEQUENCE flight_disruptions_id_seq RESTART WITH 1;
ALTER SEQUENCE recovery_options_id_seq RESTART WITH 1;
ALTER SEQUENCE recovery_options_detailed_id_seq RESTART WITH 1;
ALTER SEQUENCE recovery_steps_id_seq RESTART WITH 1;
ALTER SEQUENCE recovery_steps_detailed_id_seq RESTART WITH 1;
ALTER SEQUENCE passengers_id_seq RESTART WITH 1;
ALTER SEQUENCE passenger_rebookings_id_seq RESTART WITH 1;
ALTER SEQUENCE crew_disruption_mapping_id_seq RESTART WITH 1;
ALTER SEQUENCE crew_hotel_assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE hotel_bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE recovery_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE settings_audit_id_seq RESTART WITH 1;
ALTER SEQUENCE rotation_plan_details_id_seq RESTART WITH 1;
ALTER SEQUENCE cost_analysis_details_id_seq RESTART WITH 1;
ALTER SEQUENCE timeline_details_id_seq RESTART WITH 1;
ALTER SEQUENCE resource_details_id_seq RESTART WITH 1;
ALTER SEQUENCE technical_specifications_id_seq RESTART WITH 1;

COMMIT;

-- Verification message
SELECT 'Transactional data cleared successfully using TRUNCATE!' as status;
