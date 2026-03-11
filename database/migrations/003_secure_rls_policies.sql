-- =============================================
-- TaxGlue - Secure RLS Policies
-- 
-- This file contains more restrictive RLS policies.
-- It requires authenticated users and restricts access by user_id.
--
-- NOTE: This requires the auth system to be properly set up
-- with user_id columns in tables.
-- =============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_deductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_deductees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_section_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE eway_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_tax_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE form16 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_computations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Clients Table Policies
-- =============================================

-- Allow authenticated users to read clients (filtered by auth.uid())
DROP POLICY IF EXISTS "Allow public read access to clients" ON clients;
CREATE POLICY "Allow authenticated read access to clients" ON clients 
    FOR SELECT TO authenticated 
    USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Allow authenticated users to insert their own clients
DROP POLICY IF EXISTS "Allow public insert to clients" ON clients;
CREATE POLICY "Allow authenticated insert to clients" ON clients 
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Allow authenticated users to update their own clients
DROP POLICY IF EXISTS "Allow public update to clients" ON clients;
CREATE POLICY "Allow authenticated update to clients" ON clients 
    FOR UPDATE TO authenticated 
    USING (auth.uid()::text = user_id::text OR user_id IS NULL)
    WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Allow authenticated users to delete their own clients
DROP POLICY IF EXISTS "Allow public delete from clients" ON clients;
CREATE POLICY "Allow authenticated delete from clients" ON clients 
    FOR DELETE TO authenticated 
    USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- =============================================
-- Reference Tables (Public Read Only)
-- These tables contain reference data that can be read by anyone
-- =============================================

-- TDS Section Rates - Read Only for all
DROP POLICY IF EXISTS "Allow read tds_section_rates" ON tds_section_rates;
CREATE POLICY "Allow read tds_section_rates" ON tds_section_rates 
    FOR SELECT TO anon, authenticated USING (true);

-- GST Rates - Read Only for all
DROP POLICY IF EXISTS "Allow read gst_rates" ON gst_rates;
CREATE POLICY "Allow read gst_rates" ON gst_rates 
    FOR SELECT TO anon, authenticated USING (true);

-- =============================================
-- User-specific Tables
-- For tables without user_id, restrict to authenticated users only
-- =============================================

-- CA Master - Authenticated users only
DROP POLICY IF EXISTS "Allow read ca_master" ON ca_master;
CREATE POLICY "Allow authenticated read ca_master" ON ca_master 
    FOR SELECT TO authenticated USING (true);

-- Accounts - Authenticated users only
DROP POLICY IF EXISTS "Allow read accounts" ON accounts;
CREATE POLICY "Allow authenticated read accounts" ON accounts 
    FOR SELECT TO authenticated USING (true);

-- Vouchers - Authenticated users only
DROP POLICY IF EXISTS "Allow read vouchers" ON vouchers;
CREATE POLICY "Allow authenticated read vouchers" ON vouchers 
    FOR SELECT TO authenticated USING (true);

-- Trial Balance - Authenticated users only
DROP POLICY IF EXISTS "Allow read trial_balance" ON trial_balance;
CREATE POLICY "Allow authenticated read trial_balance" ON trial_balance 
    FOR SELECT TO authenticated USING (true);

-- Employees - Authenticated users only
DROP POLICY IF EXISTS "Allow read employees" ON employees;
CREATE POLICY "Allow authenticated read employees" ON employees 
    FOR SELECT TO authenticated USING (true);

-- Salary Structures - Authenticated users only
DROP POLICY IF EXISTS "Allow read salary_structures" ON salary_structures;
CREATE POLICY "Allow authenticated read salary_structures" ON salary_structures 
    FOR SELECT TO authenticated USING (true);

-- Salary Payments - Authenticated users only
DROP POLICY IF EXISTS "Allow read salary_payments" ON salary_payments;
CREATE POLICY "Allow authenticated read salary_payments" ON salary_payments 
    FOR SELECT TO authenticated USING (true);

-- TDS Deductors - Authenticated users only
DROP POLICY IF EXISTS "Allow read tds_deductors" ON tds_deductors;
CREATE POLICY "Allow authenticated read tds_deductors" ON tds_deductors 
    FOR SELECT TO authenticated USING (true);

-- TDS Deductees - Authenticated users only
DROP POLICY IF EXISTS "Allow read tds_deductees" ON tds_deductees;
CREATE POLICY "Allow authenticated read tds_deductees" ON tds_deductees 
    FOR SELECT TO authenticated USING (true);

-- TDS Transactions - Authenticated users only
DROP POLICY IF EXISTS "Allow read tds_transactions" ON tds_transactions;
CREATE POLICY "Allow authenticated read tds_transactions" ON tds_transactions 
    FOR SELECT TO authenticated USING (true);

-- TDS Challans - Authenticated users only
DROP POLICY IF EXISTS "Allow read tds_challans" ON tds_challans;
CREATE POLICY "Allow authenticated read tds_challans" ON tds_challans 
    FOR SELECT TO authenticated USING (true);

-- TDS Returns - Authenticated users only
DROP POLICY IF EXISTS "Allow read tds_returns" ON tds_returns;
CREATE POLICY "Allow authenticated read tds_returns" ON tds_returns 
    FOR SELECT TO authenticated USING (true);

-- GST Invoices - Authenticated users only
DROP POLICY IF EXISTS "Allow read gst_invoices" ON gst_invoices;
CREATE POLICY "Allow authenticated read gst_invoices" ON gst_invoices 
    FOR SELECT TO authenticated USING (true);

-- GST Returns - Authenticated users only
DROP POLICY IF EXISTS "Allow read gst_returns" ON gst_returns;
CREATE POLICY "Allow authenticated read gst_returns" ON gst_returns 
    FOR SELECT TO authenticated USING (true);

-- E-way Bills - Authenticated users only
DROP POLICY IF EXISTS "Allow read eway_bills" ON eway_bills;
CREATE POLICY "Allow authenticated read eway_bills" ON eway_bills 
    FOR SELECT TO authenticated USING (true);

-- Income Tax Returns - Authenticated users only
DROP POLICY IF EXISTS "Allow read income_tax_returns" ON income_tax_returns;
CREATE POLICY "Allow authenticated read income_tax_returns" ON income_tax_returns 
    FOR SELECT TO authenticated USING (true);

-- Form16 - Authenticated users only
DROP POLICY IF EXISTS "Allow read form16" ON form16;
CREATE POLICY "Allow authenticated read form16" ON form16 
    FOR SELECT TO authenticated USING (true);

-- Tax Computations - Authenticated users only
DROP POLICY IF EXISTS "Allow read tax_computations" ON tax_computations;
CREATE POLICY "Allow authenticated read tax_computations" ON tax_computations 
    FOR SELECT TO authenticated USING (true);

-- Profiles - Users can only read/update their own profile
DROP POLICY IF EXISTS "Allow read profiles" ON profiles;
CREATE POLICY "Allow read profiles" ON profiles 
    FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow update profiles" ON profiles;
CREATE POLICY "Allow update profiles" ON profiles 
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Documents - Authenticated users only
DROP POLICY IF EXISTS "Allow read documents" ON documents;
CREATE POLICY "Allow authenticated read documents" ON documents 
    FOR SELECT TO authenticated USING (true);

-- Audit Logs - Admin only (read by authenticated users for now)
DROP POLICY IF EXISTS "Allow read audit_logs" ON audit_logs;
CREATE POLICY "Allow authenticated read audit_logs" ON audit_logs 
    FOR SELECT TO authenticated USING (true);

SELECT 'Secure RLS policies applied!' as status;
