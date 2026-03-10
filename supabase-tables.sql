-- TaxGlue Database Tables for Book-Keeping Module
-- Run this script in your Supabase SQL Editor

-- 1. Chart of Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  code VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  nature VARCHAR(50) NOT NULL, -- Assets, Liabilities, Income, Expense
  account_type VARCHAR(50), -- Direct, Indirect, Capital, Revenue
  opening_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, fy, name)
);

-- 2. Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  voucher_no VARCHAR(50) NOT NULL,
  voucher_type VARCHAR(50) NOT NULL, -- journal, payment, receipt, contra, debitnote, creditnote
  narration TEXT,
  lines JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, fy, voucher_no)
);

-- 3. Trial Balance Table (if not exists)
CREATE TABLE IF NOT EXISTS trial_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, fy)
);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;

-- Create policies for accounts
DROP POLICY IF EXISTS "Users can manage own accounts" ON accounts;
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (true);

-- Create policies for vouchers
DROP POLICY IF EXISTS "Users can manage own vouchers" ON vouchers;
CREATE POLICY "Users can manage own vouchers" ON vouchers
  FOR ALL USING (true);

-- Create policies for trial_balance
DROP POLICY IF EXISTS "Users can manage own trial_balance" ON trial_balance;
CREATE POLICY "Users can manage own trial_balance" ON trial_balance
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_client_fy ON accounts(client_id, fy);
CREATE INDEX IF NOT EXISTS idx_vouchers_client_fy ON vouchers(client_id, fy);
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date);
CREATE INDEX IF NOT EXISTS idx_trial_balance_client_fy ON trial_balance(client_id, fy);

-- Insert default Chart of Accounts (optional - can be customized per client)
-- These will be copied when a new client is created
INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '001',
  'Capital Account',
  'Liabilities',
  'Capital',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '002',
  'Cash in Hand',
  'Assets',
  'Direct',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '003',
  'Cash at Bank',
  'Assets',
  'Direct',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '004',
  'Sundry Debtors',
  'Assets',
  'Direct',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '005',
  'Sundry Creditors',
  'Liabilities',
  'Direct',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '006',
  'Sales',
  'Income',
  'Revenue',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '007',
  'Purchase',
  'Expense',
  'Direct',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '008',
  'Salaries',
  'Expense',
  'Direct',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '009',
  'Rent',
  'Expense',
  'Indirect',
  0
FROM clients
ON CONFLICT DO NOTHING;

INSERT INTO accounts (client_id, fy, code, name, nature, account_type, opening_balance)
SELECT 
  id,
  '2024-25',
  '010',
  'Interest Received',
  'Income',
  'Revenue',
  0
FROM clients
ON CONFLICT DO NOTHING;

PRINT 'Database tables created successfully!';
