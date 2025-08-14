
-- Add impact_area and impact_summary fields to recovery_options table
ALTER TABLE recovery_options 
ADD COLUMN IF NOT EXISTS impact_area JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS impact_summary TEXT;

-- Create index for impact_area for better query performance
CREATE INDEX IF NOT EXISTS idx_recovery_options_impact_area ON recovery_options USING GIN (impact_area);

-- Update existing records with default values if needed
UPDATE recovery_options 
SET impact_area = '[]'::jsonb 
WHERE impact_area IS NULL;

UPDATE recovery_options 
SET impact_summary = CONCAT('Recovery analysis for ', title, ': Comprehensive solution addressing operational disruption.')
WHERE impact_summary IS NULL OR impact_summary = '';
