
-- Enhanced Recovery Options Details Schema
-- This extends the existing recovery options with detailed data for tabs

-- Add columns to existing recovery_options table if they don't exist
ALTER TABLE recovery_options 
ADD COLUMN IF NOT EXISTS rotation_plan JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS detailed_cost_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timeline_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resource_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risk_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS technical_details JSONB DEFAULT '{}';

-- Create rotation plan details table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cost analysis details table
CREATE TABLE IF NOT EXISTS cost_analysis_details (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    cost_categories JSONB DEFAULT '[]',
    total_cost DECIMAL(12,2) DEFAULT 0,
    cost_comparison JSONB DEFAULT '{}',
    savings_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timeline details table
CREATE TABLE IF NOT EXISTS timeline_details (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    timeline_steps JSONB DEFAULT '[]',
    critical_path JSONB DEFAULT '{}',
    dependencies JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resource details table
CREATE TABLE IF NOT EXISTS resource_details (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    personnel_requirements JSONB DEFAULT '[]',
    equipment_requirements JSONB DEFAULT '[]',
    facility_requirements JSONB DEFAULT '[]',
    availability_status JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create technical specifications table
CREATE TABLE IF NOT EXISTS technical_specifications (
    id SERIAL PRIMARY KEY,
    recovery_option_id INTEGER REFERENCES recovery_options(id) ON DELETE CASCADE,
    aircraft_specs JSONB DEFAULT '{}',
    operational_constraints JSONB DEFAULT '{}',
    regulatory_requirements JSONB DEFAULT '[]',
    weather_limitations JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraints using DO block to handle IF NOT EXISTS
DO $$ 
BEGIN
    -- Add unique constraint for rotation_plan_details
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_rotation_plan_option'
    ) THEN
        ALTER TABLE rotation_plan_details ADD CONSTRAINT unique_rotation_plan_option UNIQUE (recovery_option_id);
    END IF;

    -- Add unique constraint for cost_analysis_details
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_cost_analysis_option'
    ) THEN
        ALTER TABLE cost_analysis_details ADD CONSTRAINT unique_cost_analysis_option UNIQUE (recovery_option_id);
    END IF;

    -- Add unique constraint for timeline_details
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_timeline_option'
    ) THEN
        ALTER TABLE timeline_details ADD CONSTRAINT unique_timeline_option UNIQUE (recovery_option_id);
    END IF;

    -- Add unique constraint for resource_details
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_resource_option'
    ) THEN
        ALTER TABLE resource_details ADD CONSTRAINT unique_resource_option UNIQUE (recovery_option_id);
    END IF;

    -- Add unique constraint for technical_specifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_technical_option'
    ) THEN
        ALTER TABLE technical_specifications ADD CONSTRAINT unique_technical_option UNIQUE (recovery_option_id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rotation_plan_recovery_option ON rotation_plan_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_cost_analysis_recovery_option ON cost_analysis_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_timeline_details_recovery_option ON timeline_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_resource_details_recovery_option ON resource_details(recovery_option_id);
CREATE INDEX IF NOT EXISTS idx_technical_specs_recovery_option ON technical_specifications(recovery_option_id);
