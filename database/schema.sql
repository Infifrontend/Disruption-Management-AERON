-- AERON Settings Database Schema
-- This schema supports hierarchical settings with categories, versioning, and audit trails
-- Updated with current schema and sample data for import
-- Includes recovery categorization and detailed recovery options

-- Settings table for storing all configuration parameters
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('boolean', 'number', 'string', 'object', 'array')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
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
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_by VARCHAR(100),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
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

-- Flight Disruptions table with unique constraint for preventing duplicates
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
    connection_flights INTEGER DEFAULT 0,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    disruption_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    disruption_reason TEXT,
    categorization VARCHAR(255),
    category_id INTEGER REFERENCES disruption_categories(id),
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    CONSTRAINT unique_flight_schedule UNIQUE (flight_number, scheduled_departure)
);

-- Disruption Categories table for storing different types of disruptions
CREATE TABLE IF NOT EXISTS disruption_categories (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    priority_level INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    is_active BOOLEAN DEFAULT true
);

-- Recovery Option Templates table for storing categorization-based options
CREATE TABLE IF NOT EXISTS recovery_option_templates (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES disruption_categories(id) ON DELETE CASCADE,
    template_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    default_timeline VARCHAR(100),
    default_confidence INTEGER DEFAULT 80,
    default_impact VARCHAR(20) DEFAULT 'Medium',
    default_status VARCHAR(20) DEFAULT 'available',
    template_data JSONB,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(category_id, template_code)
);

-- Recovery Options table
CREATE TABLE IF NOT EXISTS recovery_options (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER REFERENCES flight_disruptions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cost VARCHAR(100),
    timeline VARCHAR(100),
    confidence INTEGER DEFAULT 0,
    impact TEXT,
    status VARCHAR(50) DEFAULT 'generated',
    priority INTEGER DEFAULT 0,
    advantages JSONB,
    considerations JSONB,
    resource_requirements JSONB,
    cost_breakdown JSONB,
    timeline_details JSONB,
    risk_assessment JSONB,
    technical_specs JSONB,
    metrics JSONB,
    rotation_plan JSONB DEFAULT '{}',
    detailed_cost_analysis JSONB DEFAULT '{}',
    timeline_breakdown JSONB DEFAULT '{}',
    resource_details JSONB DEFAULT '{}',
    risk_details JSONB DEFAULT '{}',
    technical_details JSONB DEFAULT '{}',
    impact_area JSONB DEFAULT '[]',
    impact_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(disruption_id, title)
);

-- Enhanced Recovery Options table with detailed information
CREATE TABLE IF NOT EXISTS recovery_options_detailed (
    id SERIAL PRIMARY KEY,
    option_id VARCHAR(50) UNIQUE NOT NULL,
    disruption_id INTEGER REFERENCES flight_disruptions(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES disruption_categories(id),
    template_id INTEGER REFERENCES recovery_option_templates(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    timeline VARCHAR(100),
    percentage_of_flight_cost DECIMAL(5,2),
    confidence INTEGER DEFAULT 80,
    impact VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'generated',
    priority INTEGER DEFAULT 0,

    -- Cost Analysis
    cost_analysis JSONB,

    -- Timeline Steps
    timeline_steps JSONB,

    -- Resources Required
    resources JSONB,

    -- Risk Assessment
    risk_assessment JSONB,

    -- Technical Details
    technical_details JSONB,

    -- Additional metadata
    advantages JSONB,
    considerations JSONB,

    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Recovery Steps table
CREATE TABLE IF NOT EXISTS recovery_steps (
  id SERIAL PRIMARY KEY,
  disruption_id INTEGER REFERENCES flight_disruptions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  timestamp TEXT,
  system TEXT,
  details TEXT,
  step_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(disruption_id, step_number)
);

-- Recovery Steps Enhanced table
CREATE TABLE IF NOT EXISTS recovery_steps_detailed (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER REFERENCES flight_disruptions(id) ON DELETE CASCADE,
    option_id VARCHAR(50) REFERENCES recovery_options_detailed(option_id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    timestamp_start TIMESTAMPTZ,
    timestamp_end TIMESTAMPTZ,
    system VARCHAR(255),
    step_data JSONB,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    UNIQUE(disruption_id, option_id, step_number)
);

-- Rotation plan details table
CREATE TABLE IF NOT EXISTS rotation_plan_details (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    aircraft_options JSONB DEFAULT '[]',
    crew_data JSONB DEFAULT '[]',
    next_sectors JSONB DEFAULT '[]',
    operational_constraints JSONB DEFAULT '{}',
    cost_breakdown JSONB DEFAULT '{}',
    recommendation JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recovery_option_id)
);

-- Cost analysis details table
CREATE TABLE IF NOT EXISTS cost_analysis_details (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    cost_categories JSONB DEFAULT '[]',
    total_cost DECIMAL(12,2) DEFAULT 0,
    cost_comparison JSONB DEFAULT '{}',
    savings_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recovery_option_id)
);

-- Timeline details table
CREATE TABLE IF NOT EXISTS timeline_details (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    timeline_steps JSONB DEFAULT '[]',
    critical_path JSONB DEFAULT '{}',
    dependencies JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recovery_option_id)
);

-- Resource details table
CREATE TABLE IF NOT EXISTS resource_details (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    personnel_requirements JSONB DEFAULT '[]',
    equipment_requirements JSONB DEFAULT '[]',
    facility_requirements JSONB DEFAULT '[]',
    availability_status JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recovery_option_id)
);

-- Technical specifications table
CREATE TABLE IF NOT EXISTS technical_specifications (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    aircraft_specs JSONB DEFAULT '{}',
    operational_constraints JSONB DEFAULT '{}',
    regulatory_requirements JSONB DEFAULT '[]',
    weather_limitations JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recovery_option_id)
);

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
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
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
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Crew Disruption Mapping table - links crew members to flight disruptions
CREATE TABLE IF NOT EXISTS crew_disruption_mapping (
    id SERIAL PRIMARY KEY,
    disruption_id INTEGER REFERENCES flight_disruptions(id) ON DELETE CASCADE,
    crew_member_id INTEGER REFERENCES crew_members(id) ON DELETE CASCADE,
    disruption_reason TEXT,
    affected_date TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    resolution_status VARCHAR(50) DEFAULT 'Pending',
    replacement_crew_id INTEGER REFERENCES crew_members(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    UNIQUE(disruption_id, crew_member_id)
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
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
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
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
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
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function for recovery categorization timestamp updates
CREATE OR REPLACE FUNCTION update_recovery_timestamp()
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

DROP TRIGGER IF EXISTS update_flight_disruptions_updated_at ON flight_disruptions;
CREATE TRIGGER update_flight_disruptions_updated_at BEFORE UPDATE ON flight_disruptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disruption_categories_timestamp ON disruption_categories;
CREATE TRIGGER update_disruption_categories_timestamp 
    BEFORE UPDATE ON disruption_categories
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

DROP TRIGGER IF EXISTS update_recovery_option_templates_timestamp ON recovery_option_templates;
CREATE TRIGGER update_recovery_option_templates_timestamp 
    BEFORE UPDATE ON recovery_option_templates
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

DROP TRIGGER IF EXISTS update_recovery_options_detailed_timestamp ON recovery_options_detailed;
CREATE TRIGGER update_recovery_options_detailed_timestamp 
    BEFORE UPDATE ON recovery_options_detailed
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

DROP TRIGGER IF EXISTS update_recovery_steps_detailed_timestamp ON recovery_steps_detailed;
CREATE TRIGGER update_recovery_steps_detailed_timestamp 
    BEFORE UPDATE ON recovery_steps_detailed
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);
CREATE INDEX IF NOT EXISTS idx_settings_audit_setting_id ON settings_audit(setting_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_changed_at ON settings_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_custom_rules_priority ON custom_rules(priority);
CREATE INDEX IF NOT EXISTS idx_custom_rules_status ON custom_rules(status);

-- Flight disruption indexes
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_status ON flight_disruptions(status);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_type ON flight_disruptions(disruption_type);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_created ON flight_disruptions(created_at);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_lookup ON flight_disruptions (flight_number, scheduled_departure, status);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_updated ON flight_disruptions (updated_at DESC);

-- Recovery categorization indexes
CREATE INDEX IF NOT EXISTS idx_disruption_categories_code ON disruption_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_recovery_option_templates_category ON recovery_option_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_disruption ON recovery_options_detailed(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_category ON recovery_options_detailed(category_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_option_id ON recovery_options_detailed(option_id);

-- Recovery options and steps indexes
CREATE INDEX IF NOT EXISTS idx_recovery_options_disruption ON recovery_options(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_status ON recovery_options(status);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_disruption ON recovery_steps(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_status ON recovery_steps(status);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_detailed_disruption ON recovery_steps_detailed(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_detailed_option ON recovery_steps_detailed(option_id);

-- Detail tables indexes
CREATE INDEX IF NOT EXISTS idx_rotation_plan_recovery_option ON rotation_plan_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_cost_analysis_recovery_option ON cost_analysis_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_timeline_details_recovery_option ON timeline_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_resource_details_recovery_option ON resource_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_technical_specs_recovery_option ON technical_specifications(recovery_option_id);

-- Other entity indexes
CREATE INDEX IF NOT EXISTS idx_passengers_flight ON passengers(flight_number);
CREATE INDEX IF NOT EXISTS idx_passengers_pnr ON passengers(pnr);
CREATE INDEX IF NOT EXISTS idx_crew_status ON crew_members(status);
CREATE INDEX IF NOT EXISTS idx_crew_employee_id ON crew_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_crew_disruption_mapping_disruption ON crew_disruption_mapping(disruption_id);
CREATE INDEX IF NOT EXISTS idx_crew_disruption_mapping_crew ON crew_disruption_mapping(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_disruption ON hotel_bookings(disruption_id);

-- Insert disruption categories
INSERT INTO disruption_categories (category_code, category_name, description, priority_level) VALUES
('AIRCRAFT_ISSUE', 'Aircraft Issue (e.g., AOG)', 'Technical issues with aircraft requiring maintenance or replacement', 1),
('CREW_ISSUE', 'Crew Issue (e.g., sick report, duty time breach)', 'Issues related to crew availability, duty time, or medical situations', 2),
('ATC_WEATHER', 'ATC/Weather Delay', 'Delays caused by air traffic control restrictions or weather conditions', 3),
('CURFEW_CONGESTION', 'Airport Curfew/Ramp Congestion', 'Issues related to airport operating restrictions or congestion', 4),
('ROTATION_MAINTENANCE', 'Rotation Misalignment or Maintenance Hold', 'Issues with aircraft rotation scheduling or maintenance delays', 5)
ON CONFLICT (category_code) DO NOTHING;

-- Insert recovery option templates for each category
INSERT INTO recovery_option_templates (category_id, template_code, title, description, default_timeline, default_confidence, default_impact, template_data) VALUES
-- Aircraft Issue Templates
((SELECT id FROM disruption_categories WHERE category_code = 'AIRCRAFT_ISSUE'), 'AIRCRAFT_SWAP', 'Aircraft Swap', 'Swap the affected aircraft with an available alternative to maintain schedule integrity', '75 minutes', 95, 'Low', '{"type": "swap", "requires_crew_brief": true}'),
((SELECT id FROM disruption_categories WHERE category_code = 'AIRCRAFT_ISSUE'), 'DELAY_REPAIR', 'Delay for Repair Completion', 'Hold the flight until the technical issue is resolved by maintenance', '3-4 hours', 65, 'High', '{"type": "repair", "requires_maintenance": true}'),
((SELECT id FROM disruption_categories WHERE category_code = 'AIRCRAFT_ISSUE'), 'CANCEL_REBOOK', 'Cancel and Rebook', 'Cancel the flight and rebook affected passengers on alternate flights', '6-8 hours', 90, 'High', '{"type": "cancel", "requires_rebooking": true}'),

-- Crew Issue Templates
((SELECT id FROM disruption_categories WHERE category_code = 'CREW_ISSUE'), 'STANDBY_CREW', 'Assign Standby Crew', 'Activate standby crew to replace affected crew members', '30 minutes', 92, 'Low', '{"type": "crew_swap", "requires_briefing": true}'),
((SELECT id FROM disruption_categories WHERE category_code = 'CREW_ISSUE'), 'DEADHEAD_CREW', 'Position Deadhead Crew', 'Transport qualified crew from another location', '2-3 hours', 85, 'Medium', '{"type": "crew_positioning", "requires_transport": true}'),

-- Weather Templates
((SELECT id FROM disruption_categories WHERE category_code = 'ATC_WEATHER'), 'DELAY_WEATHER', 'Delay for Weather Clearance', 'Wait for weather conditions to improve at destination', '2-3 hours', 90, 'Medium', '{"type": "weather_wait", "monitor_conditions": true}'),
((SELECT id FROM disruption_categories WHERE category_code = 'ATC_WEATHER'), 'REROUTE', 'Reroute to Alternate Airport', 'Divert to alternative airport with better weather conditions', '4-6 hours', 85, 'High', '{"type": "reroute", "requires_ground_transport": true}'),
((SELECT id FROM disruption_categories WHERE category_code = 'ATC_WEATHER'), 'CANCEL_WEATHER', 'Cancel Due to Weather', 'Cancel flight due to severe weather conditions', '1 hour', 100, 'High', '{"type": "cancel_weather", "passenger_accommodation": true}'),

-- Curfew/Congestion Templates
((SELECT id FROM disruption_categories WHERE category_code = 'CURFEW_CONGESTION'), 'EARLY_DEPARTURE', 'Early Departure Swap', 'Swap with earlier flight to beat curfew restrictions', '45 minutes', 92, 'Medium', '{"type": "early_swap", "requires_coordination": true}'),
((SELECT id FROM disruption_categories WHERE category_code = 'CURFEW_CONGESTION'), 'NEXT_DAY', 'Next Day Operation', 'Defer flight to next available slot after curfew', '12-24 hours', 95, 'High', '{"type": "defer", "passenger_overnight": true}'),

-- Rotation/Maintenance Templates
((SELECT id FROM disruption_categories WHERE category_code = 'ROTATION_MAINTENANCE'), 'ROTATION_SWAP', 'Aircraft Rotation Swap', 'Reassign aircraft from another rotation', '90 minutes', 88, 'Medium', '{"type": "rotation_swap", "cascade_effects": true}'),
((SELECT id FROM disruption_categories WHERE category_code = 'ROTATION_MAINTENANCE'), 'MAINTENANCE_DEFER', 'Defer Maintenance Window', 'Postpone non-critical maintenance to later slot', '60 minutes', 80, 'Low', '{"type": "maintenance_defer", "regulatory_check": true}')
ON CONFLICT (category_id, template_code) DO NOTHING;

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
('notificationSettings', 'systemAlerts', 'false', 'boolean', 'Enable system status alerts', 'system'),

-- System Settings
('systemSettings', 'highPerformanceMode', 'false', 'boolean', 'Enable high performance processing for faster calculations', 'system'),
('systemSettings', 'autoSaveSettings', 'true', 'boolean', 'Automatically save changes without manual confirmation', 'system'),
('systemSettings', 'debugMode', 'false', 'boolean', 'Enable debug mode for troubleshooting', 'system'),
('systemSettings', 'cacheEnabled', 'true', 'boolean', 'Enable caching for improved performance', 'system'),
('systemSettings', 'sessionTimeout', '3600', 'number', 'Session timeout in seconds', 'system'),
('systemSettings', 'maxConcurrentUsers', '100', 'number', 'Maximum number of concurrent users', 'system')
ON CONFLICT (category, key) DO NOTHING;

-- Insert sample custom rules
INSERT INTO custom_rules (rule_id, name, description, category, type, priority, overridable, conditions, actions, created_by) VALUES
('RULE-001', 'Weather Contingency Rule', 'Automatic HOTAC booking when weather delay exceeds 4 hours', 'Weather', 'Hard', 1, false, 'Weather delay > 240 minutes', 'Auto-book HOTAC, Notify passengers', 'system'),
('RULE-002', 'VIP Passenger Priority', 'VIP passengers get priority rebooking within 15 minutes', 'Passenger Service', 'Soft', 2, true, 'Passenger.Priority = VIP AND Status = Disrupted', 'Priority rebooking queue, Manager notification', 'system'),
('RULE-003', 'Crew Duty Time Protection', 'Block crew assignments that exceed regulatory limits', 'Crew Management', 'Hard', 1, false, 'CrewMember.DutyTime + FlightTime > RegulatorLimit', 'Block assignment, Find alternative crew', 'system'),
('RULE-004', 'Cost Threshold Override', 'Recovery options exceeding AED 50,000 require approval', 'Financial', 'Soft', 3, true, 'RecoveryOption.Cost > 50000 AED', 'Manager approval required, Document justification', 'system'),
('RULE-005', 'Maintenance Slot Protection', 'Protect scheduled maintenance slots from disruption recovery', 'Maintenance', 'Hard', 2, true, 'Aircraft.MaintenanceScheduled = True', 'Protect slot, Use alternative aircraft', 'system')
ON CONFLICT (rule_id) DO NOTHING;

-- Insert sample flight disruptions
INSERT INTO flight_disruptions (flight_number, route, origin, destination, origin_city, destination_city, aircraft, scheduled_departure, estimated_departure, delay_minutes, passengers, crew, connection_flights, severity, disruption_type, status, disruption_reason, categorization) VALUES
('FZ203', 'DXB → DEL', 'DXB', 'DEL', 'Dubai', 'Delhi', 'B737 MAX 8', '2025-01-10 16:45:00+00', NULL, 0, 195, 6, 2, 'Critical', 'Weather', 'Cancelled', 'Dense fog at DEL causing zero visibility conditions', 'Weather issue (e.g., fog, sandstorm)'),
('FZ215', 'DXB → BOM', 'DXB', 'BOM', 'Dubai', 'Mumbai', 'B737-800', '2025-01-10 15:30:00+00', '2025-01-10 17:30:00+00', 120, 189, 6, 3, 'High', 'Weather', 'Delayed', 'Sandstorm at DXB reducing visibility below minimums', 'Weather issue (e.g., fog, sandstorm)'),
('FZ235', 'KHI → DXB', 'KHI', 'DXB', 'Karachi', 'Dubai', 'B737-800', '2025-01-10 08:30:00+00', '2025-01-10 11:30:00+00', 180, 181, 6, 1, 'High', 'Airport', 'Diverted', 'DXB runway 12L/30R closure due to emergency landing', 'Airport issue (e.g., runway closure, ATC delays)'),
('FZ329', 'DXB → KHI', 'DXB', 'KHI', 'Dubai', 'Karachi', 'B737 MAX 8', '2025-01-10 09:15:00+00', '2025-01-10 13:15:00+00', 240, 168, 6, 2, 'High', 'Technical', 'Delayed', 'Previous aircraft rotation delay due to technical issue', 'Aircraft issue (e.g., AOG)'),
('FZ147', 'IST → DXB', 'IST', 'DXB', 'Istanbul', 'Dubai', 'B737 MAX 8', '2025-01-10 21:15:00+00', '2025-01-10 22:00:00+00', 45, 189, 6, 1, 'Medium', 'Technical', 'Delayed', 'Scheduled engine inspection delay', 'Aircraft issue (e.g., AOG)'),
('FZ181', 'DXB → COK', 'DXB', 'COK', 'Dubai', 'Kochi', 'B737-800', '2025-01-10 14:20:00+00', '2025-01-10 15:50:00+00', 90, 175, 6, 0, 'Medium', 'Crew', 'Delayed', 'Flight crew duty time limitation exceeded', 'Crew issue (e.g., sick report, duty time breach)'),
('FZ567', 'BOM → DXB', 'BOM', 'DXB', 'Mumbai', 'Dubai', 'B737-800', '2025-01-10 11:15:00+00', '2025-01-10 13:45:00+00', 150, 162, 6, 2, 'High', 'Technical', 'Delayed', 'Auxiliary Power Unit malfunction requiring repair', 'Aircraft issue (e.g., AOG)'),
('FZ891', 'DEL → DXB', 'DEL', 'DXB', 'Delhi', 'Dubai', 'B737 MAX 8', '2025-01-10 12:30:00+00', '2025-01-10 14:00:00+00', 90, 188, 6, 1, 'Medium', 'Airport', 'Delayed', 'Air traffic control flow restrictions', 'Airport issue (e.g., runway closure, ATC delays)'),
('FZ432', 'DXB → AMM', 'DXB', 'AMM', 'Dubai', 'Amman', 'B737-800', '2025-01-10 18:45:00+00', NULL, 0, 156, 6, 0, 'Critical', 'Weather', 'Cancelled', 'Severe thunderstorms with lightning activity', 'Weather issue (e.g., fog, sandstorm)'),
('FZ654', 'CAI → DXB', 'CAI', 'DXB', 'Cairo', 'Dubai', 'B737 MAX 8', '2025-01-10 20:30:00+00', '2025-01-10 21:15:00+00', 45, 172, 6, 1, 'Low', 'Technical', 'Delayed', 'Routine pre-flight system check delay', 'Aircraft issue (e.g., AOG)')
ON CONFLICT (flight_number, scheduled_departure) DO NOTHING;

-- Insert sample passengers
INSERT INTO passengers (pnr, name, flight_number, seat_number, ticket_class, loyalty_tier, special_needs, contact_info, rebooking_status) VALUES
('ABC123', 'John Smith', 'FZ203', '12A', 'Business', 'Gold', NULL, '{"email": "john.smith@email.com", "phone": "+971501234567"}', 'Pending'),
('DEF456', 'Sarah Johnson', 'FZ203', '15C', 'Economy', 'Silver', 'Wheelchair assistance', '{"email": "sarah.j@email.com", "phone": "+971507654321"}', 'Confirmed'),
('GHI789', 'Mohammed Ali', 'FZ181', '8B', 'Business', 'Platinum', NULL, '{"email": "m.ali@email.com", "phone": "+971509876543"}', 'Completed'),
('JKL012', 'Emma Watson', 'FZ215', '22F', 'Economy', 'Bronze', 'Vegetarian meal', '{"email": "emma.w@email.com", "phone": "+971502468135"}', 'Pending'),
('MNO345', 'Ahmed Hassan', 'FZ235', '3A', 'Business', 'Gold', NULL, '{"email": "a.hassan@email.com", "phone": "+971503691472"}', 'Urgent')
ON CONFLICT (pnr) DO NOTHING;

-- Insert sample crew members
INSERT INTO crew_members (employee_id, name, role, qualifications, duty_time_remaining, base_location, status, current_flight, contact_info) VALUES
('CREW001', 'Captain Sarah Johnson', 'Captain', '{B737,A320}', 270, 'DXB', 'Available', NULL, '{"phone": "+971555123456", "radio": "CAPT-001"}'),
('CREW002', 'First Officer Mike Chen', 'First Officer', '{B737,A320}', 315, 'DXB', 'Available', NULL, '{"phone": "+971555234567", "radio": "FO-002"}'),
('CREW003', 'Flight Attendant Lisa Park', 'Flight Attendant', '{Safety,Service}', 420, 'DXB', 'On Duty', 'FZ203', '{"phone": "+971555345678"}'),
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
(1, 'ABC123', 'Hilton DXB Airport', '2025-01-15', '2025-01-16', 250.00, 'Booked', 'HIL-123456'),
(1, 'DEF456', 'Hilton DXB Airport', '2025-01-15', '2025-01-16', 250.00, 'Confirmed', 'HIL-123457'),
(3, 'JKL012', 'ITC Grand Central Mumbai', '2025-01-15', '2025-01-16', 180.00, 'Booked', 'ITC-789012')
ON CONFLICT DO NOTHING;

-- Insert sample recovery options
INSERT INTO recovery_options (disruption_id, title, description, cost, timeline, confidence, impact, status, advantages, considerations, metrics) VALUES
(1, 'Aircraft Swap', 'Replace A6-FDB with available A6-FDC', 'AED 25,000', '120 minutes', 95, 'Medium', 'generated', 
 '["Same aircraft type - no passenger impact", "Available immediately", "Maintains 97% of schedule integrity"]'::jsonb, 
 '["Crew briefing required for aircraft change", "Passenger transfer time: 30 minutes"]'::jsonb,
 '{"totalCost": 25000, "otpScore": 95, "aircraftSwaps": 1, "crewViolations": 0, "paxAccommodated": 100, "regulatoryRisk": "Low", "delayMinutes": 120, "confidenceScore": 95, "networkImpact": "Low"}'::jsonb),
(1, 'Delay & Repair', 'Complete hydraulic system check and repair', 'AED 8,500', '180 minutes', 85, 'Medium', 'generated',
 '["Original aircraft maintained", "No aircraft swap complexity"]'::jsonb,
 '["Repair ETA uncertain", "Massive passenger accommodation needed"]'::jsonb,
 '{"totalCost": 8500, "otpScore": 70, "aircraftSwaps": 0, "crewViolations": 0, "paxAccommodated": 85, "regulatoryRisk": "Medium", "delayMinutes": 180, "confidenceScore": 85, "networkImpact": "Medium"}'::jsonb),
(1, 'Cancel & Rebook', 'Cancel flight and rebook passengers on next available flights', 'AED 45,000', '60 minutes', 100, 'High', 'generated',
 '["Stops cascade disruption immediately", "Quick passenger rebooking process"]'::jsonb,
 '["Complete revenue loss for sector", "High passenger compensation costs"]'::jsonb,
 '{"totalCost": 45000, "otpScore": 0, "aircraftSwaps": 0, "crewViolations": 0, "paxAccommodated": 75, "regulatoryRisk": "High", "delayMinutes": 0, "confidenceScore": 100, "networkImpact": "Low"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert sample recovery logs
INSERT INTO recovery_logs (solution_id, disruption_id, flight_number, route, aircraft, disruption_type, disruption_reason, priority, date_created, date_executed, date_completed, status, affected_passengers, actual_cost, estimated_cost, cost_variance, otp_impact, solution_chosen, total_options, executed_by, approved_by, passenger_satisfaction, rebooking_success, categorization, cancellation_avoided, potential_delay_minutes, actual_delay_minutes, delay_reduction_minutes, disruption_category, recovery_efficiency, network_impact, downstream_flights_affected, details) VALUES
('SOL-2025-001', 'DIS-001', 'FZ181', 'DXB → COK', 'A6-FDC', 'Crew issue', 'Captain duty time breach', 'Medium', '2025-01-10 12:30:00+00', '2025-01-10 13:45:00+00', '2025-01-10 15:20:00+00', 'Successful', 175, 45000, 52000, -13.5, -0.5, 'Option A - Standby crew activation', 3, 'crew.manager@flydubai.com', 'ops.supervisor@flydubai.com', 8.8, 98.5, 'Crew issue (e.g., sick report, duty time breach)', true, 720, 29, 691, 'Crew', 95.9, 'Low', 1, '{"crew_swap": true, "delay_avoided": "11.5 hours"}'::jsonb),
('SOL-2025-002', 'DIS-002', 'FZ425', 'DXB → DEL', 'A6-FDH', 'Technical', 'Engine oil pressure warning', 'High', '2025-01-09 08:15:00+00', '2025-01-09 09:30:00+00', '2025-01-09 11:45:00+00', 'Successful', 184, 28500, 35000, -18.6, -0.8, 'Option B - Aircraft substitution', 4, 'tech.supervisor@flydubai.com', 'ops.manager@flydubai.com', 9.1, 97.8, 'Aircraft issue (e.g., AOG)', true, 480, 75, 405, 'Technical', 93.7, 'Medium', 2, '{"aircraft_swap": "A6-FDK", "maintenance": "completed"}'::jsonb)
ON CONFLICT (solution_id) DO NOTHING;

-- Insert sample recovery steps
INSERT INTO recovery_steps (disruption_id, step_number, title, status, timestamp, system, details) VALUES
(1, 1, 'Initial Disruption Assessment', 'Completed', '2025-01-10 12:30:00', 'AERON Core', 'Disruption identified: FZ203 cancelled due to dense fog'),
(1, 2, 'Passenger Rebooking Initiated', 'Completed', '2025-01-10 12:45:00', 'DCS', '195 passengers identified for rebooking'),
(1, 3, 'Alternative Flight Options Generated', 'Completed', '2025-01-10 13:00:00', 'AERON Recovery', 'Found 3 recovery options with 95% confidence'),
(1, 4, 'Crew Reassignment', 'In Progress', '2025-01-10 13:15:00', 'Crew Management', 'Reassigning crew to next available rotation'),
(1, 5, 'HOTAC Booking for Stranded Passengers', 'Pending', '', 'Hotel Management', 'Booking accommodation for 45 passengers'),
(2, 1, 'Weather Assessment', 'Completed', '2025-01-10 15:30:00', 'Weather Service', 'Sandstorm conditions monitored at DXB'),
(2, 2, 'Delay Notification Sent', 'Completed', '2025-01-10 15:45:00', 'Passenger Services', '189 passengers notified of 2-hour delay'),
(2, 3, 'Aircraft Positioning', 'In Progress', '2025-01-10 16:00:00', 'Ground Operations', 'Moving aircraft to sheltered position')
ON CONFLICT DO NOTHING;

-- Insert sample crew disruption mappings
INSERT INTO crew_disruption_mapping (disruption_id, crew_member_id, disruption_reason, resolution_status, notes) VALUES
(1, 1, 'Captain exceeded duty time limits', 'Resolved', 'Replaced with standby captain'),
(1, 3, 'Flight attendant affected by cancelled flight', 'Pending', 'Awaiting reassignment to next rotation'),
(2, 2, 'First officer on affected flight', 'In Progress', 'Monitoring for next assignment')
ON CONFLICT DO NOTHING;

-- Add foreign key constraints for data integrity
ALTER TABLE crew_disruption_mapping
ADD CONSTRAINT fk_disruption_id 
FOREIGN KEY (disruption_id) REFERENCES flight_disruptions(id) ON DELETE CASCADE;

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_flight_number ON flight_disruptions(flight_number);
CREATE INDEX IF NOT EXISTS idx_crew_disruption_mapping_disruption ON crew_disruption_mapping(disruption_id);
CREATE INDEX IF NOT EXISTS idx_crew_disruption_mapping_crew ON crew_disruption_mapping(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_passengers_flight ON passengers(flight_number);
CREATE INDEX IF NOT EXISTS idx_passengers_pnr ON passengers(pnr);
CREATE INDEX IF NOT EXISTS idx_crew_status ON crew_members(status);
CREATE INDEX IF NOT EXISTS idx_crew_employee_id ON crew_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_disruption ON hotel_bookings(disruption_id);

-- Add unique constraints for data consistency
ALTER TABLE rotation_plan_details
ADD CONSTRAINT unique_rotation_plan_option UNIQUE (recovery_option_id);

-- Ensure flight_disruptions table has proper data type for disruption_reason
ALTER TABLE flight_disruptions
ALTER COLUMN disruption_reason TYPE TEXT;

-- Insert sample custom parameters
INSERT INTO custom_parameters (parameter_id, name, category, weight, description, created_by) VALUES
('PARAM-001', 'Weather Risk Factor', 'Weather Analysis', 25, 'Weight for weather conditions in decision making', 'system'),
('PARAM-002', 'Passenger Priority Score', 'Passenger Services', 30, 'Priority scoring for VIP and special needs passengers', 'system'),
('PARAM-003', 'Cost Optimization Factor', 'Financial', 20, 'Weight for cost considerations in recovery options', 'system'),
('PARAM-004', 'Schedule Recovery Efficiency', 'Operations', 25, 'Weight for maintaining schedule integrity', 'system')
ON CONFLICT (parameter_id) DO NOTHING;

-- Create views for commonly used queries
CREATE OR REPLACE VIEW active_disruptions AS
SELECT 
    fd.*,
    COUNT(ro.id) as recovery_options_count,
    COUNT(rs.id) as recovery_steps_count
FROM flight_disruptions fd
LEFT JOIN recovery_options ro ON fd.id = ro.disruption_id
LEFT JOIN recovery_steps rs ON fd.id = rs.disruption_id
WHERE fd.status IN ('Active', 'Delayed', 'Diverted')
GROUP BY fd.id;

CREATE OR REPLACE VIEW disruption_summary AS
SELECT 
    fd.id,
    fd.flight_number,
    fd.route,
    fd.disruption_type,
    fd.severity,
    fd.status,
    fd.passengers,
    fd.delay_minutes,
    COUNT(DISTINCT ro.id) as recovery_options,
    COUNT(DISTINCT p.id) as affected_passengers,
    COUNT(DISTINCT cdm.id) as affected_crew
FROM flight_disruptions fd
LEFT JOIN recovery_options ro ON fd.id = ro.disruption_id
LEFT JOIN passengers p ON fd.flight_number = p.flight_number
LEFT JOIN crew_disruption_mapping cdm ON fd.id = cdm.disruption_id
GROUP BY fd.id;

-- Final message
SELECT 'AERON Database Schema and Sample Data Successfully Updated!' as status;