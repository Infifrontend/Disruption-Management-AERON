
-- Add selected_aircraft column to pending_recovery_solutions table
-- This will store the alternate aircraft information selected in the Passenger Service page

ALTER TABLE pending_recovery_solutions 
ADD COLUMN IF NOT EXISTS selected_aircraft JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN pending_recovery_solutions.selected_aircraft IS 'JSON data containing selected aircraft information from recovery option';

-- Create index for better performance on aircraft queries
CREATE INDEX IF NOT EXISTS idx_pending_solutions_selected_aircraft ON pending_recovery_solutions USING GIN (selected_aircraft);
