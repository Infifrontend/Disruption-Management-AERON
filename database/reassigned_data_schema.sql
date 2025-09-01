
-- Schema for storing reassigned crew and flight data per recovery option
-- This table maintains the updated information from View Details popup

CREATE TABLE IF NOT EXISTS recovery_option_reassigned_data (
    id SERIAL PRIMARY KEY,
    option_id VARCHAR(255) UNIQUE NOT NULL,
    crew_data JSONB DEFAULT '{}',
    aircraft_data JSONB DEFAULT '{}',
    flight_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reassigned_data_option_id ON recovery_option_reassigned_data(option_id);
CREATE INDEX IF NOT EXISTS idx_reassigned_data_updated_at ON recovery_option_reassigned_data(updated_at);

-- Comments for documentation
COMMENT ON TABLE recovery_option_reassigned_data IS 'Stores reassigned crew and flight information from View Details popup for each recovery option';
COMMENT ON COLUMN recovery_option_reassigned_data.option_id IS 'Recovery option ID that this reassigned data belongs to';
COMMENT ON COLUMN recovery_option_reassigned_data.crew_data IS 'JSON data containing reassigned crew information including swaps, assignments, and auto-assignments';
COMMENT ON COLUMN recovery_option_reassigned_data.aircraft_data IS 'JSON data containing selected aircraft information and reassignments';
COMMENT ON COLUMN recovery_option_reassigned_data.flight_data IS 'JSON data containing affected flight information and reassignments';
COMMENT ON COLUMN recovery_option_reassigned_data.metadata IS 'Additional metadata including update timestamps, user info, and source information';
