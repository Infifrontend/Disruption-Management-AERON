
-- Recovery Categorization and Options Schema
-- This schema supports dynamic categorization of disruptions and their associated recovery options

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

-- Enhanced Recovery Options table with detailed information
DROP TABLE IF EXISTS recovery_options_detailed CASCADE;
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

-- Recovery Steps Enhanced table
DROP TABLE IF EXISTS recovery_steps_detailed CASCADE;
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_disruption_categories_code ON disruption_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_recovery_option_templates_category ON recovery_option_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_disruption ON recovery_options_detailed(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_category ON recovery_options_detailed(category_id);
CREATE INDEX IF NOT EXISTS idx_recovery_options_detailed_option_id ON recovery_options_detailed(option_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_detailed_disruption ON recovery_steps_detailed(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_detailed_option ON recovery_steps_detailed(option_id);

-- Trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_recovery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
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
