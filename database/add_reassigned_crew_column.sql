
-- Add reassigned_crew column to pending_recovery_solutions table
-- This will store the reassigned crew information from the Passenger Service page

ALTER TABLE pending_recovery_solutions 
ADD COLUMN IF NOT EXISTS reassigned_crew JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN pending_recovery_solutions.reassigned_crew IS 'JSON data containing reassigned crew information from recovery option including default crew reassignments from View Comparison Full Details';

-- Create index for better performance on crew queries
CREATE INDEX IF NOT EXISTS idx_pending_solutions_reassigned_crew ON pending_recovery_solutions USING GIN (reassigned_crew);

-- Also ensure the full_details column can store crew reassignment data
UPDATE pending_recovery_solutions 
SET full_details = COALESCE(full_details, '{}'::jsonb) 
WHERE full_details IS NULL;
