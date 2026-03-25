-- Create master data tables for bookkeeping
-- These tables support the Masters tab in bookkeeping module

-- Create voucher_types table
CREATE TABLE IF NOT EXISTS voucher_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  prefix VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stock_groups table
CREATE TABLE IF NOT EXISTS stock_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES stock_groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create godowns table
CREATE TABLE IF NOT EXISTS godowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create states table
CREATE TABLE IF NOT EXISTS states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE voucher_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE godowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for anon key)
CREATE POLICY "Allow public access voucher_types" ON voucher_types FOR SELECT USING (true);
CREATE POLICY "Allow public access stock_groups" ON stock_groups FOR SELECT USING (true);
CREATE POLICY "Allow public access godowns" ON godowns FOR SELECT USING (true);
CREATE POLICY "Allow public access states" ON states FOR SELECT USING (true);
CREATE POLICY "Allow public access countries" ON countries FOR SELECT USING (true);

-- Insert sample data for voucher_types
INSERT INTO voucher_types (name, prefix, is_active) VALUES
  ('Sale', 'SAL', true),
  ('Sale Return', 'SR', true),
  ('Purchase', 'PUR', true),
  ('Purchase Return', 'PR', true),
  ('Debit Note against Sale', 'DNS', true),
  ('Credit Note against Sale', 'CNS', true),
  ('Debit Note against Purchase', 'DNP', true),
  ('Credit Note against Purchase', 'CNP', true),
  ('Journal Voucher (JV)', 'JV', true),
  ('Payment Voucher (PV)', 'PV', true),
  ('Receipt Voucher (RV)', 'RV', true),
  ('Contra Voucher (CV)', 'CV', true)
ON CONFLICT DO NOTHING;

-- Insert sample data for stock_groups
INSERT INTO stock_groups (name) VALUES
  ('Raw Material'),
  ('Finished Goods'),
  ('Trading Goods'),
  ('Packing Material')
ON CONFLICT DO NOTHING;

-- Insert sample data for godowns
INSERT INTO godowns (name, address) VALUES
  ('Main Warehouse', '123 Warehouse Area'),
  ('Godown A', '45 Storage Complex'),
  ('Godown B', '78 Logistics Park')
ON CONFLICT DO NOTHING;

-- Insert sample data for states (India)
INSERT INTO states (name, code) VALUES
  ('Delhi', 'DL'),
  ('Maharashtra', 'MH'),
  ('Karnataka', 'KA'),
  ('Tamil Nadu', 'TN'),
  ('Uttar Pradesh', 'UP'),
  ('Gujarat', 'GJ'),
  ('West Bengal', 'WB'),
  ('Telangana', 'TG'),
  ('Madhya Pradesh', 'MP'),
  ('Haryana', 'HR'),
  ('Rajasthan', 'RJ'),
  ('Punjab', 'PB'),
  ('Kerela', 'KL'),
  (' Bihar', 'BR'),
  ('Odisha', 'OD')
ON CONFLICT DO NOTHING;

-- Insert sample data for countries
INSERT INTO countries (name, code) VALUES
  ('India', 'IN'),
  ('USA', 'US'),
  ('United Kingdom', 'UK'),
  ('UAE', 'AE'),
  ('Singapore', 'SG'),
  ('Australia', 'AU'),
  ('Canada', 'CA'),
  ('Germany', 'DE')
ON CONFLICT DO NOTHING;