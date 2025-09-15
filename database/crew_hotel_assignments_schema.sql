
-- Crew Hotel Assignments table for storing crew accommodation bookings
CREATE TABLE IF NOT EXISTS crew_hotel_assignments (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER NOT NULL REFERENCES flight_disruptions(id) ON DELETE CASCADE,
    crew_member JSONB NOT NULL, -- Array of crew member objects
    hotel_name VARCHAR(255) NOT NULL,
    hotel_location VARCHAR(500),
    check_in_date TIMESTAMPTZ NOT NULL,
    check_out_date TIMESTAMPTZ NOT NULL,
    room_number VARCHAR(50),
    special_requests TEXT,
    assignment_status VARCHAR(50) NOT NULL DEFAULT 'assigned',
    total_cost DECIMAL(10,2),
    booking_reference VARCHAR(100) UNIQUE,
    transport_details JSONB DEFAULT '{}',
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT valid_cost CHECK (total_cost >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crew_hotel_assignments_disruption ON crew_hotel_assignments(disruption_id);
CREATE INDEX IF NOT EXISTS idx_crew_hotel_assignments_booking_ref ON crew_hotel_assignments(booking_reference);
CREATE INDEX IF NOT EXISTS idx_crew_hotel_assignments_status ON crew_hotel_assignments(assignment_status);
CREATE INDEX IF NOT EXISTS idx_crew_hotel_assignments_checkin ON crew_hotel_assignments(check_in_date);
CREATE INDEX IF NOT EXISTS idx_crew_hotel_assignments_created ON crew_hotel_assignments(created_at);

-- Update trigger
DROP TRIGGER IF EXISTS update_crew_hotel_assignments_updated_at ON crew_hotel_assignments;
CREATE TRIGGER update_crew_hotel_assignments_updated_at 
    BEFORE UPDATE ON crew_hotel_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE crew_hotel_assignments IS 'Stores crew hotel assignment information for flight disruptions';
COMMENT ON COLUMN crew_hotel_assignments.crew_member IS 'JSON array containing crew member details (employee_id, name, rank, base, contact_number)';
COMMENT ON COLUMN crew_hotel_assignments.transport_details IS 'JSON object containing pickup/dropoff details, vehicle type, and vendor information';
