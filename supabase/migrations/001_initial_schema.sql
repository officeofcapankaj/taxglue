-- ============================================
-- TaxGlue Complete Database Schema
-- Supabase PostgreSQL Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'client', -- admin, staff, client
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 2. CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  registrations JSONB DEFAULT '{}',
  contact_persons JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own clients
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Index
CREATE INDEX idx_clients_user_id ON clients(user_id);

-- ============================================
-- 3. ACCOUNTS (Chart of Accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage accounts" ON accounts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = accounts.client_id AND c.user_id = auth.uid())
  );

-- Index
CREATE INDEX idx_accounts_client_fy ON accounts(client_id, fy);

-- ============================================
-- 4. VOUCHERS
-- ============================================
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  voucher_no VARCHAR(50) NOT NULL,
  voucher_type VARCHAR(50) NOT NULL, -- journal, payment, receipt, contra, debitnote, creditnote
  narration TEXT,
  lines JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, fy, voucher_no)
);

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage vouchers" ON vouchers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = vouchers.client_id AND c.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_vouchers_client_fy ON vouchers(client_id, fy);
CREATE INDEX idx_vouchers_date ON vouchers(date);

-- ============================================
-- 5. TRIAL BALANCE
-- ============================================
CREATE TABLE IF NOT EXISTS trial_balance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  data JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, fy)
);

-- Enable RLS
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage trial_balance" ON trial_balance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = trial_balance.client_id AND c.user_id = auth.uid())
  );

-- Index
CREATE INDEX idx_trial_balance_client_fy ON trial_balance(client_id, fy);

-- ============================================
-- 6. CA MASTER (Chartered Accountant Details)
-- ============================================
CREATE TABLE IF NOT EXISTS ca_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  father_first_name VARCHAR(100),
  father_middle_name VARCHAR(100),
  father_last_name VARCHAR(100),
  membership_no VARCHAR(50),
  membership_date DATE,
  ca_pan VARCHAR(50),
  firm_pan VARCHAR(50),
  firm_gstin VARCHAR(50),
  firm_name VARCHAR(255),
  firm_reg_no VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  address TEXT,
  pincode VARCHAR(20),
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  phone VARCHAR(50),
  email VARCHAR(255),
  whatsapp VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ca_master ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Anyone can view ca_master" ON ca_master FOR SELECT USING (true);
CREATE POLICY "Users can manage ca_master" ON ca_master
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. TDS DEDUCTORS
-- ============================================
CREATE TABLE IF NOT EXISTS tds_deductors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID,
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

-- Enable RLS
ALTER TABLE tds_deductors ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage tds_deductors" ON tds_deductors
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tds_deductors_tan ON tds_deductors(tan);
CREATE INDEX idx_tds_deductors_fy ON tds_deductors(fy);
CREATE INDEX idx_tds_deductors_user ON tds_deductors(user_id);

-- ============================================
-- 8. TDS DEDUCTEES
-- ============================================
CREATE TABLE IF NOT EXISTS tds_deductees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Enable RLS
ALTER TABLE tds_deductees ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage tds_deductees" ON tds_deductees
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM tds_deductors d WHERE d.id = tds_deductees.deductor_id AND d.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_tds_deductees_pan ON tds_deductees(pan);
CREATE INDEX idx_tds_deductees_deductor ON tds_deductees(deductor_id);

-- ============================================
-- 9. TDS TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS tds_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Enable RLS
ALTER TABLE tds_transactions ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage tds_transactions" ON tds_transactions
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM tds_deductors d WHERE d.id = tds_transactions.deductor_id AND d.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_tds_transactions_deductor ON tds_transactions(deductor_id);
CREATE INDEX idx_tds_transactions_section ON tds_transactions(section);
CREATE INDEX idx_tds_transactions_fy_quarter ON tds_transactions(fy, quarter);

-- ============================================
-- 10. TDS CHALLANS
-- ============================================
CREATE TABLE IF NOT EXISTS tds_challans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Enable RLS
ALTER TABLE tds_challans ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage tds_challans" ON tds_challans
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM tds_deductors d WHERE d.id = tds_challans.deductor_id AND d.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_tds_challans_deductor ON tds_challans(deductor_id);
CREATE INDEX idx_tds_challans_fy ON tds_challans(fy);

-- ============================================
-- 11. TDS RETURNS
-- ============================================
CREATE TABLE IF NOT EXISTS tds_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deductor_id UUID REFERENCES tds_deductors(id) ON DELETE CASCADE,
  form_type VARCHAR(10) DEFAULT '26Q',
  quarter VARCHAR(10) NOT NULL,
  fy VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT',
  total_transactions INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  total_tds DECIMAL(15,2) DEFAULT 0,
  section_summary JSONB DEFAULT '{}',
  file_data TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deductor_id, quarter, fy, form_type)
);

-- Enable RLS
ALTER TABLE tds_returns ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage tds_returns" ON tds_returns
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM tds_deductors d WHERE d.id = tds_returns.deductor_id AND d.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_tds_returns_deductor ON tds_returns(deductor_id);
CREATE INDEX idx_tds_returns_quarter_fy ON tds_returns(quarter, fy);

-- ============================================
-- 12. TDS SECTION RATES (Reference Table)
-- ============================================
CREATE TABLE IF NOT EXISTS tds_section_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  rate DECIMAL(5,2),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tds_section_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Anyone can read tds_section_rates" ON tds_section_rates FOR SELECT USING (true);

-- Seed data
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

-- ============================================
-- 13. GST INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS gst_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE,
  party_name VARCHAR(255),
  gstin VARCHAR(15),
  invoice_type VARCHAR(10) DEFAULT 'B2B',
  place_of_supply VARCHAR(100),
  taxable_value DECIMAL(15,2) DEFAULT 0,
  cgst DECIMAL(15,2) DEFAULT 0,
  sgst DECIMAL(15,2) DEFAULT 0,
  igst DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  fy VARCHAR(20) DEFAULT '2024-25',
  quarter VARCHAR(10) DEFAULT 'Q1',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gst_invoices ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage gst_invoices" ON gst_invoices
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = gst_invoices.client_id AND c.user_id = auth.uid())
  );

-- Index
CREATE INDEX idx_gst_invoices_client_fy ON gst_invoices(client_id, fy);

-- ============================================
-- 14. GST RETURNS
-- ============================================
CREATE TABLE IF NOT EXISTS gst_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  return_type VARCHAR(20) NOT NULL, -- GSTR-1, GSTR-3B, GSTR-4, GSTR-9
  period VARCHAR(20) NOT NULL,
  filing_date DATE,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gst_returns ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage gst_returns" ON gst_returns
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = gst_returns.client_id AND c.user_id = auth.uid())
  );

-- ============================================
-- 15. E-WAY BILLS
-- ============================================
CREATE TABLE IF NOT EXISTS eway_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  eway_bill_number VARCHAR(50),
  date DATE,
  from_name VARCHAR(255),
  from_gstin VARCHAR(15),
  to_name VARCHAR(255),
  to_gstin VARCHAR(15),
  goods_value DECIMAL(15,2) DEFAULT 0,
  transport_mode VARCHAR(50),
  vehicle_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE eway_bills ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage eway_bills" ON eway_bills
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = eway_bills.client_id AND c.user_id = auth.uid())
  );

-- ============================================
-- 16. GST RATES (Reference Table)
-- ============================================
CREATE TABLE IF NOT EXISTS gst_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rate DECIMAL(5,2) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gst_rates ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Anyone can read gst_rates" ON gst_rates FOR SELECT USING (true);

-- Seed data
INSERT INTO gst_rates (rate, name, description) VALUES
  (0, 'Nil Rate', 'Nil rated goods/services'),
  (0.25, 'Lower Rate', 'Lower rate'),
  (3, 'Standard Rate', 'Standard rate'),
  (5, 'Standard Rate', 'Standard rate'),
  (12, 'Standard Rate', 'Standard rate'),
  (18, 'Standard Rate', 'Standard rate'),
  (28, 'Highest Rate', 'Highest rate')
ON CONFLICT (rate) DO NOTHING;

-- ============================================
-- 17. INCOME TAX RETURNS (ITR)
-- ============================================
CREATE TABLE IF NOT EXISTS income_tax_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  itr_type VARCHAR(20) NOT NULL, -- ITR-1, ITR-2, ITR-3, etc.
  assessment_year VARCHAR(10) NOT NULL,
  pan VARCHAR(50),
  taxpayer_name VARCHAR(255),
  gross_income DECIMAL(15,2) DEFAULT 0,
  taxable_income DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING',
  filed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE income_tax_returns ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage income_tax_returns" ON income_tax_returns
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = income_tax_returns.client_id AND c.user_id = auth.uid())
  );

-- ============================================
-- 18. FORM 16
-- ============================================
CREATE TABLE IF NOT EXISTS form16 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  certificate_number VARCHAR(50) NOT NULL,
  fy VARCHAR(20) NOT NULL,
  employee_name VARCHAR(255),
  employee_pan VARCHAR(50),
  employer_name VARCHAR(255),
  employer_tan VARCHAR(50),
  total_salary DECIMAL(15,2) DEFAULT 0,
  tax_deducted DECIMAL(15,2) DEFAULT 0,
  total_income DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE form16 ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage form16" ON form16
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = form16.client_id AND c.user_id = auth.uid())
  );

-- ============================================
-- 19. TAX COMPUTATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS tax_computations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  assessment_year VARCHAR(10) NOT NULL,
  pan VARCHAR(50),
  name VARCHAR(255),
  gross_income DECIMAL(15,2) DEFAULT 0,
  deductions DECIMAL(15,2) DEFAULT 0,
  taxable_income DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tax_computations ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage tax_computations" ON tax_computations
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = tax_computations.client_id AND c.user_id = auth.uid())
  );

-- ============================================
-- 20. DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_path TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage documents" ON documents
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = documents.client_id AND c.user_id = auth.uid())
  );

-- Index
CREATE INDEX idx_documents_client ON documents(client_id);

-- ============================================
-- 21. AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read, users can insert their own
CREATE POLICY "Users can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read audit_logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Index
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- 22. PAYROLL - EMPLOYEES
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
  employment_type VARCHAR(50) DEFAULT 'Permanent',
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

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage employees" ON employees
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM clients c WHERE c.id = employees.client_id AND c.user_id = auth.uid())
  );

-- ============================================
-- 23. PAYROLL - SALARY STRUCTURES
-- ============================================
CREATE TABLE IF NOT EXISTS salary_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  fy VARCHAR(20) NOT NULL,
  effective_from DATE NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL,
  hra DECIMAL(15,2) DEFAULT 0,
  conveyance_allowance DECIMAL(15,2) DEFAULT 0,
  special_allowance DECIMAL(15,2) DEFAULT 0,
  medical_allowance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage salary_structures" ON salary_structures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = salary_structures.client_id AND c.user_id = auth.uid())
  );

-- ============================================
-- 24. PAYROLL - SALARY PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL,
  hra DECIMAL(15,2) DEFAULT 0,
  conveyance DECIMAL(15,2) DEFAULT 0,
  special_allowance DECIMAL(15,2) DEFAULT 0,
  gross_salary DECIMAL(15,2) DEFAULT 0,
  pf_deduction DECIMAL(15,2) DEFAULT 0,
  esic_deduction DECIMAL(15,2) DEFAULT 0,
  pt_deduction DECIMAL(15,2) DEFAULT 0,
  tds_deduction DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  net_salary DECIMAL(15,2) DEFAULT 0,
  payment_date DATE,
  payment_status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage salary_payments" ON salary_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = salary_payments.client_id AND c.user_id = auth.uid())
  );

-- Index
CREATE INDEX idx_salary_payments_employee_month ON salary_payments(employee_id, year, month);

-- ============================================
-- FINAL NOTICE
-- ============================================
RAISE NOTICE 'TaxGlue database schema created successfully!';
