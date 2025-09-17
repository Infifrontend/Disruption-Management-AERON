
-- Add reassigned_crew column to pending_recovery_solutions table
-- This will store the reassigned crew information from the Passenger Service page

ALTER TABLE pending_recovery_solutions 
ADD COLUMN IF NOT EXISTS reassigned_crew JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN pending_recovery_solutions.reassigned_crew IS 'JSON data containing reassigned crew information from recovery option';

-- Create index for better performance on crew queries
CREATE INDEX IF NOT EXISTS idx_pending_solutions_reassigned_crew ON pending_recovery_solutions USING GIN (reassigned_crew);
