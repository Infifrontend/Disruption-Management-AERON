
-- User Accounts Table
CREATE TABLE IF NOT EXISTS user_accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('super_admin', 'passenger_manager', 'crew_manager')),
    user_code VARCHAR(10) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO user_accounts (email, password_hash, user_type, user_code, full_name) VALUES
('admin@flydubai.com', '$2b$10$rQ8KgzLQCZZ9QrQ8KgzLQ.', 'super_admin', 'SA001', 'Super Administrator'),
('passenger@flydubai.com', '$2b$10$rQ8KgzLQCZZ9QrQ8KgzLQ.', 'passenger_manager', 'PM001', 'Passenger Manager'),
('crew@flydubai.com', '$2b$10$rQ8KgzLQCZZ9QrQ8KgzLQ.', 'crew_manager', 'CM001', 'Crew Manager')
ON CONFLICT (email) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_code ON user_accounts(user_code);
