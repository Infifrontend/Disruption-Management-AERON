
-- Add passenger_rebooking column to pending_recovery_solutions table
-- This will store the passenger rebooking information from the recovery option

ALTER TABLE pending_recovery_solutions 
ADD COLUMN IF NOT EXISTS passenger_rebooking JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN pending_recovery_solutions.passenger_rebooking IS 'JSON data containing passenger rebooking information from recovery option';

-- Create index for better performance on passenger queries
CREATE INDEX IF NOT EXISTS idx_pending_solutions_passenger_rebooking ON pending_recovery_solutions USING GIN (passenger_rebooking);
