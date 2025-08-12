
-- Recovery Logs table for storing historical recovery data
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
    duration VARCHAR(20),
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
CREATE INDEX IF NOT EXISTS idx_recovery_logs_disruption_id ON recovery_logs(disruption_id);
CREATE INDEX IF NOT EXISTS idx_recovery_logs_flight_number ON recovery_logs(flight_number);
CREATE INDEX IF NOT EXISTS idx_recovery_logs_status ON recovery_logs(status);
CREATE INDEX IF NOT EXISTS idx_recovery_logs_priority ON recovery_logs(priority);
CREATE INDEX IF NOT EXISTS idx_recovery_logs_created_at ON recovery_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_recovery_logs_disruption_category ON recovery_logs(disruption_category);

-- Add comments for documentation
COMMENT ON TABLE recovery_logs IS 'Historical recovery data for completed disruption cases';
COMMENT ON COLUMN recovery_logs.solution_id IS 'Unique identifier for the recovery solution';
COMMENT ON COLUMN recovery_logs.disruption_id IS 'Reference to the original disruption';
COMMENT ON COLUMN recovery_logs.recovery_efficiency IS 'Percentage of delay reduction achieved';
COMMENT ON COLUMN recovery_logs.cancellation_avoided IS 'Whether a potential cancellation was avoided';
