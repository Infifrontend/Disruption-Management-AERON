-- AERON Settings Database Schema
-- This schema supports hierarchical settings with categories, versioning, and audit trails

-- Settings table for storing all configuration parameters
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('boolean', 'number', 'string', 'object', 'array')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT 'system',
    is_active BOOLEAN DEFAULT true,
    UNIQUE(category, key)
);

-- Settings audit log for tracking changes
CREATE TABLE IF NOT EXISTS settings_audit (
    id SERIAL PRIMARY KEY,
    setting_id INTEGER REFERENCES settings(id),
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE')),
    changed_by VARCHAR(100) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

-- Custom rules table for business rules management
CREATE TABLE IF NOT EXISTS custom_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Hard', 'Soft')),
    priority INTEGER NOT NULL DEFAULT 3,
    overridable BOOLEAN DEFAULT true,
    conditions TEXT,
    actions TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom parameters table for recovery configuration
CREATE TABLE IF NOT EXISTS custom_parameters (
    id SERIAL PRIMARY KEY,
    parameter_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    weight INTEGER NOT NULL DEFAULT 10,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);
CREATE INDEX IF NOT EXISTS idx_settings_audit_setting_id ON settings_audit(setting_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_changed_at ON settings_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_custom_rules_priority ON custom_rules(priority);
CREATE INDEX IF NOT EXISTS idx_custom_rules_status ON custom_rules(status);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates (drop if exists first)
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_rules_updated_at ON custom_rules;
CREATE TRIGGER update_custom_rules_updated_at BEFORE UPDATE ON custom_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit trail
CREATE OR REPLACE FUNCTION create_settings_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO settings_audit (setting_id, category, key, old_value, new_value, change_type, changed_by, reason)
        VALUES (NEW.id, NEW.category, NEW.key, NULL, to_jsonb(NEW.value), 'CREATE', NEW.updated_by, 'Setting created');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO settings_audit (setting_id, category, key, old_value, new_value, change_type, changed_by, reason)
        VALUES (NEW.id, NEW.category, NEW.key, to_jsonb(OLD.value), to_jsonb(NEW.value), 'UPDATE', NEW.updated_by, 'Setting updated');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO settings_audit (setting_id, category, key, old_value, new_value, change_type, changed_by, reason)
        VALUES (OLD.id, OLD.category, OLD.key, to_jsonb(OLD.value), NULL, 'DELETE', OLD.updated_by, 'Setting deleted');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for audit trail (drop if exists first)
DROP TRIGGER IF EXISTS settings_audit_trigger ON settings;
CREATE TRIGGER settings_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON settings
    FOR EACH ROW EXECUTE FUNCTION create_settings_audit();

-- Insert default settings
INSERT INTO settings (category, key, value, type, description, updated_by) VALUES
-- Operational Rules
('operationalRules', 'maxDelayThreshold', '180', 'number', 'Maximum delay threshold in minutes before triggering recovery actions', 'system'),
('operationalRules', 'minConnectionTime', '45', 'number', 'Minimum connection time in minutes for passenger transfers', 'system'),
('operationalRules', 'maxOverbooking', '105', 'number', 'Maximum overbooking percentage allowed', 'system'),
('operationalRules', 'priorityRebookingTime', '15', 'number', 'Time window in minutes for priority passenger rebooking', 'system'),
('operationalRules', 'hotacTriggerDelay', '240', 'number', 'Delay threshold in minutes to trigger HOTAC booking', 'system'),

-- Recovery Constraints
('recoveryConstraints', 'maxAircraftSwaps', '3', 'number', 'Maximum number of aircraft swaps allowed in recovery plan', 'system'),
('recoveryConstraints', 'crewDutyTimeLimits', 'true', 'boolean', 'Enforce crew duty time regulatory limits', 'system'),
('recoveryConstraints', 'maintenanceSlotProtection', 'true', 'boolean', 'Protect scheduled maintenance slots from disruption', 'system'),
('recoveryConstraints', 'slotCoordinationRequired', 'false', 'boolean', 'Require slot coordination approval for changes', 'system'),
('recoveryConstraints', 'curfewCompliance', 'true', 'boolean', 'Ensure compliance with airport curfew restrictions', 'system'),

-- Automation Settings
('automationSettings', 'autoApproveThreshold', '95', 'number', 'Confidence threshold percentage for automatic approval', 'system'),
('automationSettings', 'requireManagerApproval', 'false', 'boolean', 'Require manager approval for recovery actions', 'system'),
('automationSettings', 'enablePredictiveActions', 'true', 'boolean', 'Enable predictive recovery actions', 'system'),
('automationSettings', 'autoNotifyPassengers', 'true', 'boolean', 'Automatically notify passengers of changes', 'system'),
('automationSettings', 'autoBookHotac', 'false', 'boolean', 'Automatically book hotel accommodation when needed', 'system'),

-- Passenger Prioritization
('passengerPrioritization', 'loyaltyTier', '25', 'number', 'Weight percentage for loyalty tier in passenger prioritization', 'system'),
('passengerPrioritization', 'ticketClass', '20', 'number', 'Weight percentage for ticket class in passenger prioritization', 'system'),
('passengerPrioritization', 'specialNeeds', '30', 'number', 'Weight percentage for special needs in passenger prioritization', 'system'),
('passengerPrioritization', 'groupSize', '15', 'number', 'Weight percentage for group size in passenger prioritization', 'system'),
('passengerPrioritization', 'connectionRisk', '10', 'number', 'Weight percentage for connection risk in passenger prioritization', 'system'),

-- Recovery Options Ranking
('recoveryOptionsRanking', 'costWeight', '30', 'number', 'Weight percentage for cost in recovery options ranking', 'system'),
('recoveryOptionsRanking', 'timeWeight', '25', 'number', 'Weight percentage for time in recovery options ranking', 'system'),
('recoveryOptionsRanking', 'passengerImpactWeight', '20', 'number', 'Weight percentage for passenger impact in recovery options ranking', 'system'),
('recoveryOptionsRanking', 'operationalComplexityWeight', '15', 'number', 'Weight percentage for operational complexity in recovery options ranking', 'system'),
('recoveryOptionsRanking', 'reputationWeight', '10', 'number', 'Weight percentage for reputation impact in recovery options ranking', 'system'),

-- Aircraft Selection Criteria
('aircraftSelectionCriteria', 'maintenanceStatus', '25', 'number', 'Weight percentage for maintenance status in aircraft selection', 'system'),
('aircraftSelectionCriteria', 'fuelEfficiency', '20', 'number', 'Weight percentage for fuel efficiency in aircraft selection', 'system'),
('aircraftSelectionCriteria', 'routeSuitability', '20', 'number', 'Weight percentage for route suitability in aircraft selection', 'system'),
('aircraftSelectionCriteria', 'passengerCapacity', '15', 'number', 'Weight percentage for passenger capacity in aircraft selection', 'system'),
('aircraftSelectionCriteria', 'availabilityWindow', '20', 'number', 'Weight percentage for availability window in aircraft selection', 'system'),

-- Crew Assignment Criteria
('crewAssignmentCriteria', 'dutyTimeRemaining', '30', 'number', 'Weight percentage for duty time remaining in crew assignment', 'system'),
('crewAssignmentCriteria', 'qualifications', '25', 'number', 'Weight percentage for qualifications in crew assignment', 'system'),
('crewAssignmentCriteria', 'baseLocation', '20', 'number', 'Weight percentage for base location in crew assignment', 'system'),
('crewAssignmentCriteria', 'restRequirements', '15', 'number', 'Weight percentage for rest requirements in crew assignment', 'system'),
('crewAssignmentCriteria', 'languageSkills', '10', 'number', 'Weight percentage for language skills in crew assignment', 'system'),

-- Flight Prioritization
('flightPrioritization', 'airlinePreference', '20', 'number', 'Weight percentage for airline preference in flight prioritization', 'system'),
('flightPrioritization', 'onTimePerformance', '25', 'number', 'Weight percentage for on-time performance in flight prioritization', 'system'),
('flightPrioritization', 'aircraftType', '15', 'number', 'Weight percentage for aircraft type in flight prioritization', 'system'),
('flightPrioritization', 'departureTime', '20', 'number', 'Weight percentage for departure time in flight prioritization', 'system'),
('flightPrioritization', 'connectionBuffer', '20', 'number', 'Weight percentage for connection buffer in flight prioritization', 'system'),

-- Flight Scoring
('flightScoring', 'baseScore', '70', 'number', 'Base score for flight suitability calculation', 'system'),
('flightScoring', 'priorityBonus', '15', 'number', 'Bonus points for VIP/Premium passengers', 'system'),
('flightScoring', 'airlineBonus', '10', 'number', 'Bonus points for flydubai flights', 'system'),
('flightScoring', 'specialReqBonus', '8', 'number', 'Bonus points for accommodating special requirements', 'system'),
('flightScoring', 'loyaltyBonus', '8', 'number', 'Bonus points based on loyalty tier', 'system'),
('flightScoring', 'groupBonus', '5', 'number', 'Bonus points for keeping groups together', 'system'),

-- Passenger Scoring
('passengerScoring', 'vipWeight', '40', 'number', 'Weight percentage for VIP status in passenger scoring', 'system'),
('passengerScoring', 'loyaltyWeight', '25', 'number', 'Weight percentage for loyalty tier in passenger scoring', 'system'),
('passengerScoring', 'specialNeedsWeight', '20', 'number', 'Weight percentage for special needs in passenger scoring', 'system'),
('passengerScoring', 'revenueWeight', '15', 'number', 'Weight percentage for ticket revenue in passenger scoring', 'system'),

-- NLP Settings
('nlpSettings', 'enabled', 'true', 'boolean', 'Enable natural language processing for user inputs', 'system'),
('nlpSettings', 'language', '"english"', 'string', 'Primary language for NLP processing', 'system'),
('nlpSettings', 'confidence', '85', 'number', 'Minimum confidence threshold for NLP interpretations', 'system'),
('nlpSettings', 'autoApply', 'false', 'boolean', 'Automatically apply high-confidence NLP interpretations', 'system'),

-- Notification Settings
('notificationSettings', 'email', 'true', 'boolean', 'Enable email notifications', 'system'),
('notificationSettings', 'sms', 'false', 'boolean', 'Enable SMS notifications', 'system'),
('notificationSettings', 'push', 'true', 'boolean', 'Enable push notifications', 'system'),
('notificationSettings', 'desktop', 'true', 'boolean', 'Enable desktop notifications', 'system'),
('notificationSettings', 'recoveryAlerts', 'true', 'boolean', 'Enable recovery plan alerts', 'system'),
('notificationSettings', 'passengerUpdates', 'true', 'boolean', 'Enable passenger service updates', 'system'),
('notificationSettings', 'systemAlerts', 'false', 'boolean', 'Enable system status alerts', 'system')
ON CONFLICT (category, key) DO NOTHING;

-- Drop existing constraint if it exists
DO $$
BEGIN
    -- Drop the problematic status check constraint
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'flight_disruptions_status_check' 
               AND table_name = 'flight_disruptions') THEN
        ALTER TABLE flight_disruptions DROP CONSTRAINT flight_disruptions_status_check;
    END IF;
END $$;

-- Flight Disruptions table
CREATE TABLE IF NOT EXISTS flight_disruptions (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL,
    route VARCHAR(50) NOT NULL,
    origin VARCHAR(3) NOT NULL,
    destination VARCHAR(3) NOT NULL,
    origin_city VARCHAR(100),
    destination_city VARCHAR(100),
    aircraft VARCHAR(50) NOT NULL,
    scheduled_departure TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_departure TIMESTAMP WITH TIME ZONE,
    delay_minutes INTEGER DEFAULT 0,
    passengers INTEGER NOT NULL,
    crew INTEGER NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    disruption_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    disruption_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist (for existing databases)
DO $$
BEGIN
    -- Add origin column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_disruptions' AND column_name = 'origin') THEN
        ALTER TABLE flight_disruptions ADD COLUMN origin VARCHAR(3);
        UPDATE flight_disruptions SET origin = 'DXB' WHERE origin IS NULL;
    END IF;

    -- Add destination column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_disruptions' AND column_name = 'destination') THEN
        ALTER TABLE flight_disruptions ADD COLUMN destination VARCHAR(3);
        UPDATE flight_disruptions SET destination = 'BOM' WHERE destination IS NULL;
    END IF;

    -- Add origin_city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_disruptions' AND column_name = 'origin_city') THEN
        ALTER TABLE flight_disruptions ADD COLUMN origin_city VARCHAR(100);
    END IF;

    -- Add destination_city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_disruptions' AND column_name = 'destination_city') THEN
        ALTER TABLE flight_disruptions ADD COLUMN destination_city VARCHAR(100);
    END IF;

    -- Add connection_flights column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_disruptions' AND column_name = 'connection_flights') THEN
        ALTER TABLE flight_disruptions ADD COLUMN connection_flights INTEGER DEFAULT 0;
    END IF;
END $$;

-- Recovery Options table
CREATE TABLE IF NOT EXISTS recovery_options (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER REFERENCES flight_disruptions(id),
    option_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cost VARCHAR(50),
    timeline VARCHAR(100),
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    impact VARCHAR(255),
    status VARCHAR(50) DEFAULT 'generated',
    priority INTEGER DEFAULT 0,
    advantages TEXT[],
    considerations TEXT[],
    resource_requirements JSONB,
    cost_breakdown JSONB,
    timeline_details JSONB,
    risk_assessment JSONB,
    technical_specs JSONB,
    metrics JSONB,
    rotation_plan JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add status column if it doesn't exist (for existing databases)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recovery_options' AND column_name = 'status') THEN
        ALTER TABLE recovery_options ADD COLUMN status VARCHAR(50) DEFAULT 'generated';
    END IF;
END $$;

-- Passengers table
CREATE TABLE IF NOT EXISTS passengers (
    id SERIAL PRIMARY KEY,
    pnr VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    flight_number VARCHAR(10) NOT NULL,
    seat_number VARCHAR(10),
    ticket_class VARCHAR(20) NOT NULL,
    loyalty_tier VARCHAR(20) DEFAULT 'Bronze',
    special_needs TEXT,
    contact_info JSONB,
    rebooking_status VARCHAR(50),
    new_flight_number VARCHAR(10),
    new_seat_number VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crew Members table
CREATE TABLE IF NOT EXISTS crew_members (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    qualifications TEXT[],
    duty_time_remaining INTEGER NOT NULL,
    base_location VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Available', 'On Duty', 'Rest', 'Unavailable')),
    current_flight VARCHAR(10),
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
    id SERIAL PRIMARY KEY,
    registration VARCHAR(20) UNIQUE NOT NULL,
    aircraft_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Available', 'In Use', 'Maintenance', 'Out of Service')),
    location VARCHAR(50) NOT NULL,
    maintenance_status VARCHAR(20) NOT NULL CHECK (maintenance_status IN ('Operational', 'Due', 'In Progress')),
    fuel_level DECIMAL(5,2),
    next_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotel Bookings table
CREATE TABLE IF NOT EXISTS hotel_bookings (
  id SERIAL PRIMARY KEY,
  disruption_id INTEGER REFERENCES flight_disruptions(id),
  passenger_pnr VARCHAR(10),
  hotel_name VARCHAR(255),
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'Pending',
  booking_reference VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recovery Logs table for historical data
CREATE TABLE IF NOT EXISTS recovery_logs (
    id SERIAL PRIMARY KEY,
    solution_id VARCHAR(50) UNIQUE NOT NULL,
    disruption_id VARCHAR(50) NOT NULL,
    flight_number VARCHAR(10) NOT NULL,
    route VARCHAR(50) NOT NULL,
    aircraft VARCHAR(50) NOT NULL,
    disruption_type VARCHAR(50) NOT NULL,
    disruption_reason TEXT,
    priority VARCHAR(20) NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE NOT NULL,
    date_executed TIMESTAMP WITH TIME ZONE,
    date_completed TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    status VARCHAR(20) NOT NULL,
    affected_passengers INTEGER,
    actual_cost DECIMAL(12,2),
    estimated_cost DECIMAL(12,2),
    cost_variance DECIMAL(5,2),
    otp_impact DECIMAL(5,2),
    solution_chosen TEXT,
    total_options INTEGER,
    executed_by VARCHAR(255),
    approved_by VARCHAR(255),
    passenger_satisfaction DECIMAL(3,1),
    rebooking_success DECIMAL(5,2),
    categorization VARCHAR(100),
    cancellation_avoided BOOLEAN DEFAULT FALSE,
    potential_delay_minutes INTEGER,
    actual_delay_minutes INTEGER,
    delay_reduction_minutes INTEGER,
    disruption_category VARCHAR(50),
    recovery_efficiency DECIMAL(5,2),
    network_impact VARCHAR(20),
    downstream_flights_affected INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_status ON flight_disruptions(status);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_type ON flight_disruptions(disruption_type);
CREATE INDEX IF NOT EXISTS idx_passengers_flight ON passengers(flight_number);
CREATE INDEX IF NOT EXISTS idx_passengers_pnr ON passengers(pnr);
CREATE INDEX IF NOT EXISTS idx_crew_status ON crew_members(status);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_recovery_options_disruption ON recovery_options(disruption_id);

-- Recovery Steps table
CREATE TABLE IF NOT EXISTS recovery_steps (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER REFERENCES flight_disruptions(id),
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    timestamp VARCHAR(50),
    system VARCHAR(100),
    details TEXT,
    step_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_created ON flight_disruptions(created_at);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_disruption ON hotel_bookings(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_disruption ON recovery_steps(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_status ON recovery_options(status);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_status ON recovery_steps(status);

-- Insert sample custom rules
INSERT INTO custom_rules (rule_id, name, description, category, type, priority, overridable, conditions, actions, created_by) VALUES
('RULE-001', 'Weather Contingency Rule', 'Automatic HOTAC booking when weather delay exceeds 4 hours', 'Weather', 'Hard', 1, false, 'Weather delay > 240 minutes', 'Auto-book HOTAC, Notify passengers', 'system'),
('RULE-002', 'VIP Passenger Priority', 'VIP passengers get priority rebooking within 15 minutes', 'Passenger Service', 'Soft', 2, true, 'Passenger.Priority = VIP AND Status = Disrupted', 'Priority rebooking queue, Manager notification', 'system'),
('RULE-003', 'Crew Duty Time Protection', 'Block crew assignments that exceed regulatory limits', 'Crew Management', 'Hard', 1, false, 'CrewMember.DutyTime + FlightTime > RegulatorLimit', 'Block assignment, Find alternative crew', 'system'),
('RULE-004', 'Cost Threshold Override', 'Recovery options exceeding AED 50,000 require approval', 'Financial', 'Soft', 3, true, 'RecoveryOption.Cost > 50000 AED', 'Manager approval required, Document justification', 'system'),
('RULE-005', 'Maintenance Slot Protection', 'Protect scheduled maintenance slots from disruption recovery', 'Maintenance', 'Hard', 2, true, 'Aircraft.MaintenanceScheduled = True', 'Protect slot, Use alternative aircraft', 'system')
ON CONFLICT (rule_id) DO NOTHING;

-- Insert sample flight disruptions
INSERT INTO flight_disruptions (flight_number, route, origin, destination, origin_city, destination_city, aircraft, scheduled_departure, estimated_departure, delay_minutes, passengers, crew, severity, disruption_type, status, disruption_reason) VALUES
('FZ203', 'DXB → DEL', 'DXB', 'DEL', 'Dubai', 'Delhi', 'B737 MAX 8', '2025-01-10 16:45:00+00', NULL, 0, 195, 6, 'Critical', 'Weather', 'Cancelled', 'Dense fog at DEL causing zero visibility conditions'),
('FZ215', 'DXB → BOM', 'DXB', 'BOM', 'Dubai', 'Mumbai', 'B737-800', '2025-01-10 15:30:00+00', '2025-01-10 17:30:00+00', 120, 189, 6, 'High', 'Weather', 'Delayed', 'Sandstorm at DXB reducing visibility below minimums'),
('FZ235', 'KHI → DXB', 'KHI', 'DXB', 'Karachi', 'Dubai', 'B737-800', '2025-01-10 08:30:00+00', '2025-01-10 11:30:00+00', 180, 181, 6, 'High', 'Airport', 'Diverted', 'DXB runway 12L/30R closure due to emergency landing'),
('FZ329', 'DXB → KHI', 'DXB', 'KHI', 'Dubai', 'Karachi', 'B737 MAX 8', '2025-01-10 09:15:00+00', '2025-01-10 13:15:00+00', 240, 168, 6, 'High', 'Technical', 'Delayed', 'Previous aircraft rotation delay due to technical issue'),
('FZ147', 'IST → DXB', 'IST', 'DXB', 'Istanbul', 'Dubai', 'B737 MAX 8', '2025-01-10 21:15:00+00', '2025-01-10 22:00:00+00', 45, 189, 6, 'Medium', 'Technical', 'Delayed', 'Scheduled engine inspection delay'),
('FZ181', 'DXB → COK', 'DXB', 'COK', 'Dubai', 'Kochi', 'B737-800', '2025-01-10 14:20:00+00', '2025-01-10 15:50:00+00', 90, 175, 6, 'Medium', 'Crew', 'Delayed', 'Flight crew duty time limitation exceeded'),
('FZ567', 'BOM → DXB', 'BOM', 'DXB', 'Mumbai', 'Dubai', 'B737-800', '2025-01-10 11:15:00+00', '2025-01-10 13:45:00+00', 150, 162, 6, 'High', 'Technical', 'Delayed', 'Auxiliary Power Unit malfunction requiring repair'),
('FZ891', 'DEL → DXB', 'DEL', 'DXB', 'Delhi', 'Dubai', 'B737 MAX 8', '2025-01-10 12:30:00+00', '2025-01-10 14:00:00+00', 90, 188, 6, 'Medium', 'Airport', 'Delayed', 'Air traffic control flow restrictions'),
('FZ432', 'DXB → AMM', 'DXB', 'AMM', 'Dubai', 'Amman', 'B737-800', '2025-01-10 18:45:00+00', NULL, 0, 156, 6, 'Critical', 'Weather', 'Cancelled', 'Severe thunderstorms with lightning activity'),
('FZ654', 'CAI → DXB', 'CAI', 'DXB', 'Cairo', 'Dubai', 'B737 MAX 8', '2025-01-10 20:30:00+00', '2025-01-10 21:15:00+00', 45, 172, 6, 'Low', 'Technical', 'Delayed', 'Routine pre-flight system check delay'),
('FZ123', 'DXB → LHR', 'DXB', 'LHR', 'Dubai', 'London', 'B737 MAX 8', '2025-01-10 10:15:00+00', '2025-01-10 12:45:00+00', 150, 189, 6, 'High', 'Weather', 'Delayed', 'London Heathrow fog delays affecting arrivals'),
('FZ456', 'FRA → DXB', 'FRA', 'DXB', 'Frankfurt', 'Dubai', 'B737-800', '2025-01-10 13:20:00+00', NULL, 0, 164, 6, 'Critical', 'Technical', 'Cancelled', 'Aircraft grounded due to hydraulic system failure'),
('FZ789', 'DXB → JFK', 'DXB', 'JFK', 'Dubai', 'New York', 'B737 MAX 8', '2025-01-10 19:30:00+00', '2025-01-10 20:15:00+00', 45, 195, 6, 'Low', 'Crew', 'Delayed', 'Cabin crew replacement due to medical issue'),
('FZ321', 'SIN → DXB', 'SIN', 'DXB', 'Singapore', 'Dubai', 'B737-800', '2025-01-10 17:00:00+00', '2025-01-10 18:30:00+00', 90, 171, 6, 'Medium', 'Airport', 'Delayed', 'Singapore Changi ground handling delays'),
('FZ987', 'DXB → ICN', 'DXB', 'ICN', 'Dubai', 'Seoul', 'B737 MAX 8', '2025-01-10 22:45:00+00', NULL, 0, 186, 6, 'High', 'Weather', 'Cancelled', 'Seoul Incheon airport closure due to heavy snow')
ON CONFLICT DO NOTHING;

-- Insert sample passengers
INSERT INTO passengers (pnr, name, flight_number, seat_number, ticket_class, loyalty_tier, special_needs, contact_info, rebooking_status) VALUES
('ABC123', 'John Smith', 'FZ123', '12A', 'Business', 'Gold', NULL, '{"email": "john.smith@email.com", "phone": "+971501234567"}', 'Pending'),
('DEF456', 'Sarah Johnson', 'FZ123', '15C', 'Economy', 'Silver', 'Wheelchair assistance', '{"email": "sarah.j@email.com", "phone": "+971507654321"}', 'Confirmed'),
('GHI789', 'Mohammed Ali', 'FZ181', '8B', 'Business', 'Platinum', NULL, '{"email": "m.ali@email.com", "phone": "+971509876543"}', 'Completed'),
('JKL012', 'Emma Watson', 'FZ205', '22F', 'Economy', 'Bronze', 'Vegetarian meal', '{"email": "emma.w@email.com", "phone": "+971502468135"}', 'Pending'),
('MNO345', 'Ahmed Hassan', 'FZ67', '3A', 'Business', 'Gold', NULL, '{"email": "a.hassan@email.com", "phone": "+971503691472"}', 'Urgent')
ON CONFLICT (pnr) DO NOTHING;

-- Insert sample crew members
INSERT INTO crew_members (employee_id, name, role, qualifications, duty_time_remaining, base_location, status, current_flight, contact_info) VALUES
('CREW001', 'Captain Sarah Johnson', 'Captain', '{B737,A320}', 270, 'DXB', 'Available', NULL, '{"phone": "+971555123456", "radio": "CAPT-001"}'),
('CREW002', 'First Officer Mike Chen', 'First Officer', '{B737,A320}', 315, 'DXB', 'Available', NULL, '{"phone": "+971555234567", "radio": "FO-002"}'),
('CREW003', 'Flight Attendant Lisa Park', 'Flight Attendant', '{Safety,Service}', 420, 'DXB', 'On Duty', 'FZ123', '{"phone": "+971555345678"}'),
('CREW004', 'Captain Ahmed Al-Rashid', 'Captain', '{B737,A320,A380}', 180, 'DXB', 'Rest', NULL, '{"phone": "+971555456789", "radio": "CAPT-004"}'),
('CREW005', 'Senior Flight Attendant Maria Rodriguez', 'Senior Flight Attendant', '{Safety,Service,Training}', 360, 'DXB', 'Available', NULL, '{"phone": "+971555567890"}')
ON CONFLICT (employee_id) DO NOTHING;

-- Insert sample aircraft
INSERT INTO aircraft (registration, aircraft_type, status, location, maintenance_status, fuel_level, next_maintenance) VALUES
('A6-FDB', 'Boeing 737-800', 'Maintenance', 'DXB Gate B12', 'In Progress', 45.5, '2025-01-20'),
('A6-FDC', 'Boeing 737-800', 'Available', 'DXB Gate C15', 'Operational', 89.2, '2025-02-15'),
('A6-FDE', 'Boeing 737 MAX 8', 'In Use', 'BOM Terminal 2', 'Operational', 67.8, '2025-01-25'),
('A6-FDF', 'Boeing 737-800', 'Out of Service', 'DXB Maintenance Hangar', 'In Progress', 0.0, '2025-01-16'),
('A6-FDG', 'Boeing 737 MAX 8', 'Available', 'DXB Gate A08', 'Operational', 92.5, '2025-02-10')
ON CONFLICT (registration) DO NOTHING;

-- Insert sample hotel bookings
INSERT INTO hotel_bookings (disruption_id, passenger_pnr, hotel_name, check_in, check_out, cost, status, booking_reference) VALUES
(1, 'ABC123', 'Hilton JFK Airport', '2025-01-15', '2025-01-16', 250.00, 'Booked', 'HIL-123456'),
(1, 'DEF456', 'Hilton JFK Airport', '2025-01-15', '2025-01-16', 250.00, 'Confirmed', 'HIL-123457'),
(3, 'JKL012', 'ITC Grand Central Mumbai', '2025-01-15', '2025-01-16', 180.00, 'Booked', 'ITC-789012')
ON CONFLICT DO NOTHING;

-- Insert sample recovery options
INSERT INTO recovery_options (disruption_id, option_name, description, cost, duration_minutes, confidence, passenger_impact, details) VALUES
(1, 'Aircraft Swap', 'Replace A6-FDB with available A6-FDC', 25000.00, 120, 95.5, 158, '{"aircraft": "A6-FDC", "gate": "C15", "crew_required": false}'),
(1, 'Delay & Repair', 'Complete hydraulic system check and repair', 8500.00, 180, 85.2, 158, '{"repair_time": "3 hours", "parts_available": true}'),
(1, 'Cancel & Rebook', 'Cancel flight and rebook passengers on next available flights', 45000.00, 60, 100.0, 158, '{"next_flights": ["FZ125", "EK201"], "compensation": 400}'),
(4, 'Emergency Aircraft', 'Deploy backup aircraft A6-FDG', 35000.00, 90, 92.0, 162, '{"aircraft": "A6-FDG", "crew_ready": true, "slots_available": true}')
ON CONFLICT DO NOTHING;

-- Insert sample recovery logs
INSERT INTO recovery_logs (solution_id, disruption_id, flight_number, route, aircraft, disruption_type, disruption_reason, priority, date_created, date_executed, date_completed, status, affected_passengers, actual_cost, estimated_cost, cost_variance, otp_impact, solution_chosen, total_options, executed_by, approved_by, passenger_satisfaction, rebooking_success, categorization, cancellation_avoided, potential_delay_minutes, actual_delay_minutes, delay_reduction_minutes, disruption_category, recovery_efficiency, network_impact, downstream_flights_affected, details) VALUES
('SOL-2025-001', 'DIS-001', 'FZ181', 'DXB → COK', 'A6-FDC', 'Crew issue', 'Captain duty time breach', 'Medium', '2025-01-10 12:30:00+00', '2025-01-10 13:45:00+00', '2025-01-10 15:20:00+00', 'Successful', 175, 45000, 52000, -13.5, -0.5, 'Option A - Standby crew activation', 3, 'crew.manager@flydubai.com', 'ops.supervisor@flydubai.com', 8.8, 98.5, 'Crew issue (e.g., sick report, duty time breach)', true, 720, 29, 691, 'Crew', 95.9, 'Low', 1, '{"crew_swap": true, "delay_avoided": "11.5 hours"}'),
('SOL-2025-002', 'DIS-002', 'FZ425', 'DXB → DEL', 'A6-FDH', 'Technical', 'Engine oil pressure warning', 'High', '2025-01-09 08:15:00+00', '2025-01-09 09:30:00+00', '2025-01-09 11:45:00+00', 'Successful', 184, 28500, 35000, -18.6, -0.8, 'Option B - Aircraft substitution', 4, 'tech.supervisor@flydubai.com', 'ops.manager@flydubai.com', 9.1, 97.8, 'Aircraft issue (e.g., AOG)', true, 480, 75, 405, 'Technical', 93.7, 'Medium', 2, '{"aircraft_swap": "A6-FDK", "maintenance": "completed"}')
ON CONFLICT (solution_id) DO NOTHING;