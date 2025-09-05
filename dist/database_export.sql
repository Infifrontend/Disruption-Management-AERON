
-- AERON Database Complete Export
-- Generated on: $(date)
-- This file contains the complete schema and data for the AERON database

-- Create database if not exists (PostgreSQL syntax)
-- Note: Uncomment the following lines if creating a new database
-- CREATE DATABASE aeron_db;
-- \c aeron_db;

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS settings_audit CASCADE;
DROP TABLE IF EXISTS recovery_logs CASCADE;
DROP TABLE IF EXISTS hotel_bookings CASCADE;
DROP TABLE IF EXISTS crew_disruption_mapping CASCADE;
DROP TABLE IF EXISTS technical_specifications CASCADE;
DROP TABLE IF EXISTS resource_details CASCADE;
DROP TABLE IF EXISTS timeline_details CASCADE;
DROP TABLE IF EXISTS cost_analysis_details CASCADE;
DROP TABLE IF EXISTS rotation_plan_details CASCADE;
DROP TABLE IF EXISTS recovery_steps_detailed CASCADE;
DROP TABLE IF EXISTS recovery_steps CASCADE;
DROP TABLE IF EXISTS recovery_options_detailed CASCADE;
DROP TABLE IF EXISTS recovery_options CASCADE;
DROP TABLE IF EXISTS recovery_option_templates CASCADE;
DROP TABLE IF EXISTS disruption_categories CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS aircraft CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;
DROP TABLE IF EXISTS flight_disruptions CASCADE;
DROP TABLE IF EXISTS custom_parameters CASCADE;
DROP TABLE IF EXISTS custom_rules CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Create all tables with complete schema
-- Settings table for storing all configuration parameters
CREATE TABLE settings (
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
CREATE TABLE settings_audit (
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
CREATE TABLE custom_rules (
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
CREATE TABLE custom_parameters (
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

-- Disruption Categories table for storing different types of disruptions
CREATE TABLE disruption_categories (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    priority_level INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    is_active BOOLEAN DEFAULT true
);

-- Flight Disruptions table with unique constraint for preventing duplicates
CREATE TABLE flight_disruptions (
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
    recovery_status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    CONSTRAINT unique_flight_schedule UNIQUE (flight_number, scheduled_departure)
);

-- Recovery Option Templates table for storing categorization-based options
CREATE TABLE recovery_option_templates (
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
CREATE TABLE recovery_options (
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
CREATE TABLE recovery_options_detailed (
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
    cost_analysis JSONB,
    timeline_steps JSONB,
    resources JSONB,
    risk_assessment JSONB,
    technical_details JSONB,
    advantages JSONB,
    considerations JSONB,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Recovery Steps table
CREATE TABLE recovery_steps (
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
CREATE TABLE recovery_steps_detailed (
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
CREATE TABLE rotation_plan_details (
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
CREATE TABLE cost_analysis_details (
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
CREATE TABLE timeline_details (
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
CREATE TABLE resource_details (
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
CREATE TABLE technical_specifications (
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
CREATE TABLE passengers (
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
CREATE TABLE crew_members (
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
CREATE TABLE crew_disruption_mapping (
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
CREATE TABLE aircraft (
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
CREATE TABLE hotel_bookings (
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
CREATE TABLE recovery_logs (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);
CREATE INDEX IF NOT EXISTS idx_settings_audit_setting_id ON settings_audit(setting_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_changed_at ON settings_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_custom_rules_priority ON custom_rules(priority);
CREATE INDEX IF NOT EXISTS idx_custom_rules_status ON custom_rules(status);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_status ON flight_disruptions(status);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_type ON flight_disruptions(disruption_type);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_created ON flight_disruptions(created_at);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_lookup ON flight_disruptions (flight_number, scheduled_departure, status);
CREATE INDEX IF NOT EXISTS idx_flight_disruptions_updated ON flight_disruptions (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_disruption_categories_code ON disruption_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_recovery_option_templates_category ON recovery_option_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_disruption ON recovery_options_detailed(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_category ON recovery_options_detailed(category_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_option_id ON recovery_options_detailed(option_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_disruption ON recovery_options(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_status ON recovery_options(status);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_disruption ON recovery_steps(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_status ON recovery_steps(status);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_detailed_disruption ON recovery_steps_detailed(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_detailed_option ON recovery_steps_detailed(option_id);
CREATE INDEX IF NOT EXISTS idx_rotation_plan_recovery_option ON rotation_plan_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_cost_analysis_recovery_option ON cost_analysis_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_timeline_details_recovery_option ON timeline_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_resource_details_recovery_option ON resource_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_technical_specs_recovery_option ON technical_specifications(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_passengers_flight ON passengers(flight_number);
CREATE INDEX IF NOT EXISTS idx_passengers_pnr ON passengers(pnr);
CREATE INDEX IF NOT EXISTS idx_crew_status ON crew_members(status);
CREATE INDEX IF NOT EXISTS idx_crew_employee_id ON crew_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_crew_disruption_mapping_disruption ON crew_disruption_mapping(disruption_id);
CREATE INDEX IF NOT EXISTS idx_crew_disruption_mapping_crew ON crew_disruption_mapping(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_disruption ON hotel_bookings(disruption_id);

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

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_rules_updated_at BEFORE UPDATE ON custom_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_disruptions_updated_at BEFORE UPDATE ON flight_disruptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disruption_categories_timestamp 
    BEFORE UPDATE ON disruption_categories
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

CREATE TRIGGER update_recovery_option_templates_timestamp 
    BEFORE UPDATE ON recovery_option_templates
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

CREATE TRIGGER update_recovery_options_detailed_timestamp 
    BEFORE UPDATE ON recovery_options_detailed
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

CREATE TRIGGER update_recovery_steps_detailed_timestamp 
    BEFORE UPDATE ON recovery_steps_detailed
    FOR EACH ROW EXECUTE FUNCTION update_recovery_timestamp();

-- Create trigger for audit trail
CREATE TRIGGER settings_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON settings
    FOR EACH ROW EXECUTE FUNCTION create_settings_audit();

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

-- Note: To populate this database with actual data from your current database,
-- you would need to run a script to export data and then import it here.
-- This file provides the complete schema structure for the AERON database.

-- Final message
SELECT 'AERON Database Export Complete - Schema Created Successfully!' as status;
