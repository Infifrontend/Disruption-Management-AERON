
-- Bulk Delete Flight Disruptions and Related Data
-- This script deletes multiple disruptions based on various criteria

-- Example 1: Delete all resolved disruptions older than 30 days
BEGIN;

WITH disruptions_to_delete AS (
    SELECT id FROM flight_disruptions 
    WHERE status = 'Resolved' 
    AND created_at < NOW() - INTERVAL '30 days'
)
-- Delete related records first
DELETE FROM rotation_plan_details WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro 
    WHERE ro.disruption_id IN (SELECT id FROM disruptions_to_delete)
);

DELETE FROM cost_analysis_details WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro 
    WHERE ro.disruption_id IN (SELECT id FROM disruptions_to_delete)
);

DELETE FROM timeline_details WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro 
    WHERE ro.disruption_id IN (SELECT id FROM disruptions_to_delete)
);

DELETE FROM resource_details WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro 
    WHERE ro.disruption_id IN (SELECT id FROM disruptions_to_delete)
);

DELETE FROM technical_specifications WHERE recovery_option_id IN (
    SELECT ro.id FROM recovery_options ro 
    WHERE ro.disruption_id IN (SELECT id FROM disruptions_to_delete)
);

DELETE FROM recovery_steps_detailed WHERE disruption_id IN (SELECT id FROM disruptions_to_delete);
DELETE FROM recovery_options_detailed WHERE disruption_id IN (SELECT id FROM disruptions_to_delete);
DELETE FROM recovery_options WHERE disruption_id IN (SELECT id FROM disruptions_to_delete);
DELETE FROM recovery_steps WHERE disruption_id IN (SELECT id FROM disruptions_to_delete);
DELETE FROM crew_disruption_mapping WHERE disruption_id IN (SELECT id FROM disruptions_to_delete);
DELETE FROM hotel_bookings WHERE disruption_id IN (SELECT id FROM disruptions_to_delete);
DELETE FROM pending_recovery_solutions WHERE disruption_id IN (SELECT id FROM disruptions_to_delete);

-- Finally delete the disruptions
DELETE FROM flight_disruptions WHERE id IN (SELECT id FROM disruptions_to_delete);

COMMIT;

-- Example 2: Delete all cancelled flights
-- BEGIN;
-- DELETE FROM rotation_plan_details WHERE recovery_option_id IN (
--     SELECT ro.id FROM recovery_options ro
--     JOIN flight_disruptions fd ON ro.disruption_id = fd.id
--     WHERE fd.status = 'Cancelled'
-- );
-- ... repeat for all related tables ...
-- DELETE FROM flight_disruptions WHERE status = 'Cancelled';
-- COMMIT;

-- Example 3: Delete specific flight number's all disruptions
-- BEGIN;
-- DELETE FROM rotation_plan_details WHERE recovery_option_id IN (
--     SELECT ro.id FROM recovery_options ro
--     JOIN flight_disruptions fd ON ro.disruption_id = fd.id
--     WHERE fd.flight_number = 'FZ203'
-- );
-- ... repeat for all related tables ...
-- DELETE FROM flight_disruptions WHERE flight_number = 'FZ203';
-- COMMIT;
