
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

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Trigger for audit trail
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
('nlpSettings', 'language', 'english', 'string', 'Primary language for NLP processing', 'system'),
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

-- Insert sample custom rules
INSERT INTO custom_rules (rule_id, name, description, category, type, priority, overridable, conditions, actions, created_by) VALUES
('RULE-001', 'Weather Contingency Rule', 'Automatic HOTAC booking when weather delay exceeds 4 hours', 'Weather', 'Hard', 1, false, 'Weather delay > 240 minutes', 'Auto-book HOTAC, Notify passengers', 'system'),
('RULE-002', 'VIP Passenger Priority', 'VIP passengers get priority rebooking within 15 minutes', 'Passenger Service', 'Soft', 2, true, 'Passenger.Priority = VIP AND Status = Disrupted', 'Priority rebooking queue, Manager notification', 'system'),
('RULE-003', 'Crew Duty Time Protection', 'Block crew assignments that exceed regulatory limits', 'Crew Management', 'Hard', 1, false, 'CrewMember.DutyTime + FlightTime > RegulatorLimit', 'Block assignment, Find alternative crew', 'system'),
('RULE-004', 'Cost Threshold Override', 'Recovery options exceeding AED 50,000 require approval', 'Financial', 'Soft', 3, true, 'RecoveryOption.Cost > 50000 AED', 'Manager approval required, Document justification', 'system'),
('RULE-005', 'Maintenance Slot Protection', 'Protect scheduled maintenance slots from disruption recovery', 'Maintenance', 'Hard', 2, true, 'Aircraft.MaintenanceScheduled = True', 'Protect slot, Use alternative aircraft', 'system')

ON CONFLICT (rule_id) DO NOTHING;
