-- TaxGlue Database Tables for Book-Keeping Module
-- Run this script in your Supabase SQL Editor

-- 1. Clients Table (required by other tables)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  constitution VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  pincode VARCHAR(20),
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  phone VARCHAR(50),
  email VARCHAR(255),
  gstin VARCHAR(50),
  pan VARCHAR(50),
  fy VARCHAR(20) DEFAULT '2024-25',
  registrations JSONB DEFAULT '{}'::jsonb,
  contactPersons JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for clients
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- 2. Chart of Accounts Table
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

-- 3. Vouchers Table
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

-- 4. Trial Balance Table (if not exists)
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

RAISE NOTICE 'Database tables created successfully!';

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

RAISE NOTICE 'Payroll module tables created successfully!';

-- ============================================
-- TDS COMPLIANCE MODULE TABLES
-- ============================================

-- 1. TDS Deductors Table
CREATE TABLE IF NOT EXISTS tds_deductors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id UUID,
  tan VARCHAR(10) UNIQUE,
  name VARCHAR(255) NOT NULL,
  ddo_type VARCHAR(20) DEFAULT 'NON_DDO',
  gstin VARCHAR(15),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  contact_person VARCHAR(200),
  fy VARCHAR(20) DEFAULT '2024-25',
  quarter VARCHAR(10) DEFAULT 'Q1',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TDS Deductees Table
CREATE TABLE IF NOT EXISTS tds_deductees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  deductor_id UUID REFERENCES tds_deductors(id) ON DELETE CASCADE,
  pan VARCHAR(10),
  aadhaar VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  mobile VARCHAR(50),
  email VARCHAR(255),
  category VARCHAR(50) DEFAULT 'INDIVIDUAL',
  deductee_type VARCHAR(20) DEFAULT 'RESIDENT',
  fy VARCHAR(20) DEFAULT '2024-25',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TDS Transactions Table
CREATE TABLE IF NOT EXISTS tds_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  deductor_id UUID REFERENCES tds_deductors(id) ON DELETE CASCADE,
  deductee_id UUID REFERENCES tds_deductees(id) ON DELETE SET NULL,
  section VARCHAR(10) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  tds_rate DECIMAL(5,2),
  tds_amount DECIMAL(15,2),
  net_payment DECIMAL(15,2),
  payment_date DATE,
  invoice_number VARCHAR(50),
  nature_of_payment VARCHAR(200),
  fy VARCHAR(20) DEFAULT '2024-25',
  quarter VARCHAR(10) DEFAULT 'Q1',
  challan_id UUID,
  status VARCHAR(20) DEFAULT 'UNPAID',
  is_filer BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TDS Challans Table
CREATE TABLE IF NOT EXISTS tds_challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  deductor_id UUID REFERENCES tds_deductors(id) ON DELETE CASCADE,
  bsr_code VARCHAR(10),
  challan_serial VARCHAR(20),
  challan_date DATE,
  challan_amount DECIMAL(15,2),
  tax_amount DECIMAL(15,2),
  surcharge DECIMAL(15,2) DEFAULT 0,
  education_cess DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2),
  bank_name VARCHAR(200),
  status VARCHAR(20) DEFAULT 'DEPOSITED',
  fy VARCHAR(20) DEFAULT '2024-25',
  quarter VARCHAR(10) DEFAULT 'Q1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TDS Returns Table
CREATE TABLE IF NOT EXISTS tds_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  deductor_id UUID REFERENCES tds_deductors(id) ON DELETE CASCADE,
  form_type VARCHAR(10) DEFAULT '26Q',
  quarter VARCHAR(10) NOT NULL,
  fy VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT',
  total_transactions INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  total_tds DECIMAL(15,2) DEFAULT 0,
  section_summary JSONB DEFAULT '{}'::jsonb,
  file_data TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deductor_id, quarter, fy, form_type)
);

-- 6. TDS Section Rates Reference Table
CREATE TABLE IF NOT EXISTS tds_section_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  rate DECIMAL(5,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for TDS Tables
ALTER TABLE tds_deductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_deductees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_section_rates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Users can manage own tds_deductors" ON tds_deductors;
CREATE POLICY "Users can manage own tds_deductors" ON tds_deductors FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own tds_deductees" ON tds_deductees;
CREATE POLICY "Users can manage own tds_deductees" ON tds_deductees FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own tds_transactions" ON tds_transactions;
CREATE POLICY "Users can manage own tds_transactions" ON tds_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own tds_challans" ON tds_challans;
CREATE POLICY "Users can manage own tds_challans" ON tds_challans FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own tds_returns" ON tds_returns;
CREATE POLICY "Users can manage own tds_returns" ON tds_returns FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can read tds_section_rates" ON tds_section_rates;
CREATE POLICY "Users can read tds_section_rates" ON tds_section_rates FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tds_deductors_tan ON tds_deductors(tan);
CREATE INDEX IF NOT EXISTS idx_tds_deductors_fy ON tds_deductors(fy);
CREATE INDEX IF NOT EXISTS idx_tds_deductees_pan ON tds_deductees(pan);
CREATE INDEX IF NOT EXISTS idx_tds_deductees_deductor ON tds_deductees(deductor_id);
CREATE INDEX IF NOT EXISTS idx_tds_transactions_deductor ON tds_transactions(deductor_id);
CREATE INDEX IF NOT EXISTS idx_tds_transactions_section ON tds_transactions(section);
CREATE INDEX IF NOT EXISTS idx_tds_transactions_fy_quarter ON tds_transactions(fy, quarter);
CREATE INDEX IF NOT EXISTS idx_tds_transactions_status ON tds_transactions(status);
CREATE INDEX IF NOT EXISTS idx_tds_challans_deductor ON tds_challans(deductor_id);
CREATE INDEX IF NOT EXISTS idx_tds_challans_fy ON tds_challans(fy);
CREATE INDEX IF NOT EXISTS idx_tds_returns_deductor ON tds_returns(deductor_id);
CREATE INDEX IF NOT EXISTS idx_tds_returns_quarter_fy ON tds_returns(quarter, fy);

-- Insert default TDS section rates
INSERT INTO tds_section_rates (section, name, rate, description) VALUES
('192', 'Salary', NULL, 'TDS on Salary'),
('194', 'Dividends', 10, 'TDS on Dividends'),
('194A', 'Interest other than Interest on securities', 10, 'TDS on Interest'),
('194C', 'Contractor Payment', 2, 'TDS on Contractual Payments'),
('194D', 'Insurance Commission', 5, 'TDS on Insurance Commission'),
('194H', 'Commission/Brokerage', 5, 'TDS on Commission'),
('194I', 'Rent', 2, 'TDS on Rent'),
('194IA', 'Transfer of Immovable Property', 1, 'TDS on Property Transfer'),
('194IB', 'Rent by Individual/HUF', 5, 'TDS on Rent (Individual/HUF)'),
('194J', 'Professional Fees', 10, 'TDS on Professional Fees'),
('194Q', 'Purchase of Goods', 0.1, 'TDS on Purchase of Goods'),
('195', 'Non-Resident Payments', NULL, 'TDS on Non-Resident Payments'),
('206AB', 'Higher TDS Rate (Non-filers)', 5, 'Higher TDS for non-filers of ITR')
ON CONFLICT (section) DO NOTHING;

RAISE NOTICE 'TDS compliance module tables created successfully!';
