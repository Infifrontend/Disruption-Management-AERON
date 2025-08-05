
-- Add unique constraint to prevent duplicate flight disruptions
-- This will prevent the same flight with the same scheduled departure from being inserted twice

-- First, remove any existing duplicates (keeping the most recent one)
DELETE FROM flight_disruptions 
WHERE id NOT IN (
    SELECT DISTINCT ON (flight_number, scheduled_departure) id
    FROM flight_disruptions 
    ORDER BY flight_number, scheduled_departure, updated_at DESC
);

-- Add the unique constraint
ALTER TABLE flight_disruptions 
ADD CONSTRAINT unique_flight_schedule 
UNIQUE (flight_number, scheduled_departure);

-- Add an index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_lookup 
ON flight_disruptions (flight_number, scheduled_departure, status);

-- Add an index for the updated_at column for better sync performance
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_updated 
ON flight_disruptions (updated_at DESC);
