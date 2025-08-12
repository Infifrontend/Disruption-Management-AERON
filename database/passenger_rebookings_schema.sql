
-- Passenger Rebookings table for storing rebooking information
CREATE TABLE IF NOT EXISTS passenger_rebookings (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER NOT NULL REFERENCES flight_disruptions(id) ON DELETE CASCADE,
    pnr VARCHAR(10) NOT NULL,
    passenger_id VARCHAR(50) NOT NULL,
    passenger_name VARCHAR(255) NOT NULL,
    original_flight VARCHAR(10) NOT NULL,
    original_seat VARCHAR(10),
    rebooked_flight VARCHAR(10) NOT NULL,
    rebooked_cabin VARCHAR(50) NOT NULL,
    rebooked_seat VARCHAR(10),
    rebooking_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    additional_services JSONB DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    total_passengers_in_pnr INTEGER DEFAULT 1,
    rebooking_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    CONSTRAINT unique_passenger_disruption UNIQUE(disruption_id, passenger_id, pnr)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_disruption ON passenger_rebookings(disruption_id);
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_pnr ON passenger_rebookings(pnr);
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_original_flight ON passenger_rebookings(original_flight);
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_rebooked_flight ON passenger_rebookings(rebooked_flight);
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_status ON passenger_rebookings(status);
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_created ON passenger_rebookings(created_at);

-- Update trigger
DROP TRIGGER IF EXISTS update_passenger_rebookings_updated_at ON passenger_rebookings;
CREATE TRIGGER update_passenger_rebookings_updated_at 
    BEFORE UPDATE ON passenger_rebookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE passenger_rebookings IS 'Stores passenger rebooking information for flight disruptions';
