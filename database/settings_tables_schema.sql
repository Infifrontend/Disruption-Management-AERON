
-- Settings tables schema for comprehensive settings management

-- Main settings table (already exists, but ensuring proper structure)
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('boolean', 'number', 'string', 'object')),
    updated_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(category, key)
);

-- Screen settings table for UI visibility configuration
CREATE TABLE IF NOT EXISTS screen_settings (
    id SERIAL PRIMARY KEY,
    screen_id VARCHAR(50) NOT NULL UNIQUE,
    screen_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    required BOOLEAN DEFAULT false,
    updated_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom rules table (enhanced from existing)
CREATE TABLE IF NOT EXISTS custom_rules (
    id SERIAL PRIMARY KEY,
    rule_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Hard', 'Soft')),
    priority INTEGER NOT NULL DEFAULT 3,
    overridable BOOLEAN DEFAULT true,
    conditions TEXT,
    actions TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Custom parameters table for recovery options
CREATE TABLE IF NOT EXISTS custom_parameters (
    id SERIAL PRIMARY KEY,
    parameter_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    weight INTEGER NOT NULL DEFAULT 10,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings audit trail
CREATE TABLE IF NOT EXISTS settings_audit (
    id SERIAL PRIMARY KEY,
    setting_id INTEGER,
    category VARCHAR(100),
    key VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(20) CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE')),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_screen_settings_category ON screen_settings(category);
CREATE INDEX IF NOT EXISTS idx_custom_rules_category ON custom_rules(category);
CREATE INDEX IF NOT EXISTS idx_custom_rules_priority ON custom_rules(priority);
CREATE INDEX IF NOT EXISTS idx_custom_parameters_category ON custom_parameters(category);
CREATE INDEX IF NOT EXISTS idx_settings_audit_setting_id ON settings_audit(setting_id);

-- Insert default screen settings if not exists
INSERT INTO screen_settings (screen_id, screen_name, category, enabled, required) VALUES
    ('dashboard', 'Dashboard', 'main', true, true),
    ('disruption-input', 'Disruption Input', 'operations', true, true),
    ('recovery-options', 'Recovery Options', 'operations', true, true),
    ('detailed-plan', 'Detailed Recovery Plan', 'operations', true, false),
    ('flight-tracking', 'Flight Tracking', 'monitoring', true, false),
    ('prediction-analytics', 'Prediction Analytics', 'prediction', true, false),
    ('prediction-dashboard', 'Prediction Dashboard', 'prediction', true, false),
    ('passenger-services', 'Passenger Services', 'services', true, false),
    ('hotac-management', 'HOTAC Management', 'services', true, false),
    ('fuel-optimization', 'Fuel Optimization', 'analytics', true, false),
    ('aircraft-maintenance', 'Aircraft Maintenance', 'operations', true, false),
    ('comparison-matrix', 'Comparison Matrix', 'analytics', true, false),
    ('past-recovery-logs', 'Past Recovery Logs', 'analytics', true, false),
    ('pending-solutions', 'Pending Solutions', 'operations', true, false),
    ('risk-assessment', 'Risk Assessment', 'analytics', true, false),
    ('reports', 'Reports & Analytics', 'system', true, false),
    ('settings', 'Settings', 'system', true, true)
ON CONFLICT (screen_id) DO NOTHING;
