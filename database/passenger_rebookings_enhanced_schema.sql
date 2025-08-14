
-- Enhanced Passenger Rebookings table with pending recovery solution integration
CREATE TABLE IF NOT EXISTS passenger_rebookings (
  id SERIAL PRIMARY KEY,
  pending_recovery_solution_id INTEGER REFERENCES pending_recovery_solutions(id),
  disruption_id VARCHAR(50) NOT NULL,
  pnr VARCHAR(20) NOT NULL,
  passenger_id VARCHAR(50) NOT NULL,
  passenger_name VARCHAR(255) NOT NULL,
  original_flight VARCHAR(20),
  original_seat VARCHAR(10),
  rebooked_flight VARCHAR(20),
  rebooked_cabin VARCHAR(50) DEFAULT 'Economy',
  rebooked_seat VARCHAR(10),
  rebooking_date TIMESTAMP,
  additional_services JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'Pending',
  total_passengers_in_pnr INTEGER DEFAULT 1,
  rebooking_cost DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Crew Schedule table for hotel mappings
CREATE TABLE IF NOT EXISTS crew_schedule (
  id SERIAL PRIMARY KEY,
  pending_recovery_solution_id INTEGER REFERENCES pending_recovery_solutions(id),
  disruption_id VARCHAR(50) NOT NULL,
  crew_member_id VARCHAR(50) NOT NULL,
  crew_member_name VARCHAR(255) NOT NULL,
  crew_role VARCHAR(100),
  hotel_name VARCHAR(255) NOT NULL,
  hotel_location VARCHAR(255),
  check_in_date TIMESTAMP,
  check_out_date TIMESTAMP,
  room_number VARCHAR(20),
  special_requests TEXT,
  assignment_status VARCHAR(50) DEFAULT 'Assigned',
  total_cost DECIMAL(10,2) DEFAULT 0.00,
  booking_reference VARCHAR(100),
  transport_details JSONB DEFAULT '{}'::jsonb,
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraints
ALTER TABLE passenger_rebookings 
ADD CONSTRAINT IF NOT EXISTS passenger_rebookings_unique 
UNIQUE (disruption_id, pnr, passenger_id);

ALTER TABLE crew_schedule 
ADD CONSTRAINT IF NOT EXISTS crew_schedule_unique 
UNIQUE (disruption_id, crew_member_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_pnr ON passenger_rebookings(pnr);
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_disruption ON passenger_rebookings(disruption_id);
CREATE INDEX IF NOT EXISTS idx_passenger_rebookings_pending_solution ON passenger_rebookings(pending_recovery_solution_id);
CREATE INDEX IF NOT EXISTS idx_crew_schedule_disruption ON crew_schedule(disruption_id);
CREATE INDEX IF NOT EXISTS idx_crew_schedule_pending_solution ON crew_schedule(pending_recovery_solution_id);
