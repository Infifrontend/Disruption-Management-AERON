
-- Airports, Airlines, and Airline Hubs Schema
-- This schema supports airport and airline hub management

-- Airports table
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    airline_codes TEXT[],
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    is_active BOOLEAN DEFAULT true
);

-- Airlines table
CREATE TABLE IF NOT EXISTS airlines (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    is_active BOOLEAN DEFAULT true
);

-- Airline Hubs table - links airlines to their hub airports
CREATE TABLE IF NOT EXISTS airline_hubs (
    id SERIAL PRIMARY KEY,
    airline_code VARCHAR(3) NOT NULL,
    airport_code VARCHAR(3) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (airline_code) REFERENCES airlines(code) ON DELETE CASCADE,
    FOREIGN KEY (airport_code) REFERENCES airports(code) ON DELETE CASCADE,
    UNIQUE(airline_code, airport_code)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_airports_code ON airports(code);
CREATE INDEX IF NOT EXISTS idx_airports_country ON airports(country);
CREATE INDEX IF NOT EXISTS idx_airports_airline_codes ON airports USING GIN(airline_codes);
CREATE INDEX IF NOT EXISTS idx_airlines_code ON airlines(code);
CREATE INDEX IF NOT EXISTS idx_airline_hubs_airline_code ON airline_hubs(airline_code);
CREATE INDEX IF NOT EXISTS idx_airline_hubs_airport_code ON airline_hubs(airport_code);
CREATE INDEX IF NOT EXISTS idx_airline_hubs_is_primary ON airline_hubs(is_primary);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_airports_updated_at ON airports;
CREATE TRIGGER update_airports_updated_at BEFORE UPDATE ON airports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_airlines_updated_at ON airlines;
CREATE TRIGGER update_airlines_updated_at BEFORE UPDATE ON airlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_airline_hubs_updated_at ON airline_hubs;
CREATE TRIGGER update_airline_hubs_updated_at BEFORE UPDATE ON airline_hubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO airlines (code, name, country) VALUES
('FZ', 'flydubai', 'United Arab Emirates'),
('QR', 'Qatar Airways', 'Qatar'),
('JU', 'Air Serbia', 'Serbia'),
('IN', 'Infiniti Airways', 'India')
ON CONFLICT (code) DO NOTHING;

INSERT INTO airports (code, name, city, country, latitude, longitude, timezone, airline_codes) VALUES
('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates', 25.2532, 55.3657, 'Asia/Dubai', ARRAY['FZ', 'QR']),
('DOH', 'Hamad International Airport', 'Doha', 'Qatar', 25.2731, 51.6087, 'Asia/Qatar', ARRAY['QR']),
('BEG', 'Belgrade Nikola Tesla Airport', 'Belgrade', 'Serbia', 44.8184, 20.3091, 'Europe/Belgrade', ARRAY['JU']),
('DEL', 'Indira Gandhi International Airport', 'Delhi', 'India', 28.5562, 77.1000, 'Asia/Kolkata', ARRAY['FZ', 'IN']),
('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 19.0896, 72.8656, 'Asia/Kolkata', ARRAY['FZ', 'IN']),
('COK', 'Cochin International Airport', 'Kochi', 'India', 10.1520, 76.4019, 'Asia/Kolkata', ARRAY['FZ', 'IN']),
('KHI', 'Jinnah International Airport', 'Karachi', 'Pakistan', 24.9056, 67.1608, 'Asia/Karachi', ARRAY['FZ']),
('IST', 'Istanbul Airport', 'Istanbul', 'Turkey', 41.2753, 28.7519, 'Europe/Istanbul', ARRAY['FZ', 'QR']),
('CAI', 'Cairo International Airport', 'Cairo', 'Egypt', 30.1219, 31.4056, 'Africa/Cairo', ARRAY['FZ']),
('AMM', 'Queen Alia International Airport', 'Amman', 'Jordan', 31.7226, 35.9930, 'Asia/Amman', ARRAY['FZ']),
('CCJ', 'Kozhikode Airport', 'Calicut', 'India', 11.1368, 75.9553, 'Asia/Kolkata', ARRAY['FZ', 'IN']),
('LHR', 'Heathrow Airport', 'London', 'United Kingdom', 51.4700, -0.4543, 'Europe/London', ARRAY['QR']),
('JFK', 'John F. Kennedy International Airport', 'New York', 'United States', 40.6413, -73.7781, 'America/New_York', ARRAY['QR']),
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', 1.3644, 103.9915, 'Asia/Singapore', ARRAY['QR']),
('DUB', 'Dublin Airport', 'Dublin', 'Ireland', 53.4213, -6.2701, 'Europe/Dublin', ARRAY['QR'])
ON CONFLICT (code) DO NOTHING;

INSERT INTO airline_hubs (airline_code, airport_code, is_primary, description) VALUES
('FZ', 'DXB', true, 'Primary hub and headquarters'),
('QR', 'DOH', true, 'Primary hub and headquarters'),
('JU', 'BEG', true, 'Primary hub and headquarters'),
('IN', 'DEL', true, 'Primary hub'),
('IN', 'BOM', false, 'Secondary hub'),
('IN', 'COK', false, 'Regional hub')
ON CONFLICT (airline_code, airport_code) DO NOTHING;
