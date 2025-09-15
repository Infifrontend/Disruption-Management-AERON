
-- Aircraft Swap Information table for tracking swap details during passenger services
CREATE TABLE IF NOT EXISTS aircraft_swaps (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER REFERENCES flight_disruptions(id) ON DELETE CASCADE,
    original_aircraft VARCHAR(20) NOT NULL,
    replacement_aircraft VARCHAR(20) NOT NULL,
    swap_reason TEXT,
    swap_initiated_by VARCHAR(100),
    swap_status VARCHAR(50) DEFAULT 'pending' CHECK (swap_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    estimated_swap_time INTEGER, -- in minutes
    actual_swap_time INTEGER, -- in minutes
    cost_impact DECIMAL(10,2),
    passenger_impact_count INTEGER DEFAULT 0,
    crew_reassignment_required BOOLEAN DEFAULT false,
    maintenance_approval_required BOOLEAN DEFAULT false,
    ground_ops_coordination TEXT,
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,
    swap_details JSONB, -- For storing additional swap-specific data
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_aircraft_swaps_disruption_id ON aircraft_swaps(disruption_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_swaps_status ON aircraft_swaps(swap_status);
CREATE INDEX IF NOT EXISTS idx_aircraft_swaps_approval ON aircraft_swaps(approval_status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_aircraft_swaps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata';
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aircraft_swaps_updated_at_trigger
    BEFORE UPDATE ON aircraft_swaps
    FOR EACH ROW
    EXECUTE FUNCTION update_aircraft_swaps_updated_at();
