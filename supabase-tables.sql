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

-- ============================================
-- PAYROLL MODULE TABLES
-- ============================================

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  employee_code VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(50),
  aadhaar_number VARCHAR(50),
  pan_number VARCHAR(50),
  uan_number VARCHAR(50),
  esic_number VARCHAR(50),
  department VARCHAR(100),
  designation VARCHAR(100),
  date_of_joining DATE NOT NULL,
  employment_type VARCHAR(50) DEFAULT 'Permanent', -- Permanent, Contract, Part-time
  pf_applicable BOOLEAN DEFAULT true,
  esic_applicable BOOLEAN DEFAULT false,
  pt_applicable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  bank_name VARCHAR(200),
  bank_account_no VARCHAR(50),
  bank_ifsc_code VARCHAR(20),
  address TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, fy, employee_code)
);

-- 2. Salary Structure Table
CREATE TABLE IF NOT EXISTS salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  effective_from DATE NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL,
  hra DECIMAL(15,2) DEFAULT 0,
  conveyance_allowance DECIMAL(15,2) DEFAULT 0,
  special_allowance DECIMAL(15,2) DEFAULT 0,
  medical_allowance DECIMAL(15,2) DEFAULT 0,
  other_allowance DECIMAL(15,2) DEFAULT 0,
  provident_fund DECIMAL(15,2) DEFAULT 0,
  esic DECIMAL(15,2) DEFAULT 0,
  professional_tax DECIMAL(15,2) DEFAULT 0,
  tds DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Salary Payments Table
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  month VARCHAR(20) NOT NULL, -- e.g., 'April 2024'
  year INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  working_days INTEGER DEFAULT 0,
  loss_of_pay_days INTEGER DEFAULT 0,
  overtime_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Earnings
  basic_salary DECIMAL(15,2) DEFAULT 0,
  hra DECIMAL(15,2) DEFAULT 0,
  conveyance_allowance DECIMAL(15,2) DEFAULT 0,
  special_allowance DECIMAL(15,2) DEFAULT 0,
  medical_allowance DECIMAL(15,2) DEFAULT 0,
  other_allowance DECIMAL(15,2) DEFAULT 0,
  overtime_amount DECIMAL(15,2) DEFAULT 0,
  bonus DECIMAL(15,2) DEFAULT 0,
  total_earnings DECIMAL(15,2) DEFAULT 0,
  
  -- Deductions
  provident_fund DECIMAL(15,2) DEFAULT 0,
  esic DECIMAL(15,2) DEFAULT 0,
  professional_tax DECIMAL(15,2) DEFAULT 0,
  tds DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  
  net_salary DECIMAL(15,2) DEFAULT 0,
  payment_mode VARCHAR(50), -- Bank Transfer, Cash, Cheque
  payment_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processed, Paid
  utr_number VARCHAR(50),
  narration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, employee_id, month, year)
);

-- 4. Payroll Settings Table
CREATE TABLE IF NOT EXISTS payroll_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  
  -- PF Settings
  pf_employer_contribution DECIMAL(5,2) DEFAULT 12, -- Percentage
  pf_employee_contribution DECIMAL(5,2) DEFAULT 12,
  pf_wage_limit DECIMAL(15,2) DEFAULT 15000,
  
  -- ESIC Settings
  esic_employer_contribution DECIMAL(5,2) DEFAULT 3.25,
  esic_employee_contribution DECIMAL(5,2) DEFAULT 1.75,
  esic_wage_limit DECIMAL(15,2) DEFAULT 21000,
  
  -- Professional Tax
  pt_state VARCHAR(100) DEFAULT 'Maharashtra',
  pt_limit DECIMAL(15,2) DEFAULT 7500,
  pt_amount DECIMAL(15,2) DEFAULT 200,
  
  -- TDS Settings
  tds_slab JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, fy)
);

-- Enable Row Level Security for Payroll Tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Users can manage own employees" ON employees;
CREATE POLICY "Users can manage own employees" ON employees FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own salary_structures" ON salary_structures;
CREATE POLICY "Users can manage own salary_structures" ON salary_structures FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own salary_payments" ON salary_payments;
CREATE POLICY "Users can manage own salary_payments" ON salary_payments FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own payroll_settings" ON payroll_settings;
CREATE POLICY "Users can manage own payroll_settings" ON payroll_settings FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_client_fy ON employees(client_id, fy);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_salary_structures_employee ON salary_structures(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee_month ON salary_payments(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_salary_payments_status ON salary_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payroll_settings_client_fy ON payroll_settings(client_id, fy);

PRINT 'Payroll module tables created successfully!';
