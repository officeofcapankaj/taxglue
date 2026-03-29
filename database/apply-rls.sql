-- Quick RLS Fix for Demo Mode
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/jgjeuybgideeqcjxvlmn/sql

-- CLIENTS TABLE
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to clients" ON clients;
DROP POLICY IF EXISTS "Allow public insert to clients" ON clients;
DROP POLICY IF EXISTS "Allow public update to clients" ON clients;
DROP POLICY IF EXISTS "Allow public delete from clients" ON clients;
CREATE POLICY "Allow anonymous read" ON clients FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON clients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON clients FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON clients FOR DELETE TO anon;

-- CA_MASTER TABLE
ALTER TABLE ca_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public insert to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public update to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public delete from ca_master" ON ca_master;
CREATE POLICY "Allow anonymous read" ON ca_master FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON ca_master FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON ca_master FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON ca_master FOR DELETE TO anon;

-- TDS_DEDUCTORS TABLE
ALTER TABLE tds_deductors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public insert to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public update to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public delete from tds_deductors" ON tds_deductors;
CREATE POLICY "Allow anonymous read" ON tds_deductors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON tds_deductors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON tds_deductors FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON tds_deductors FOR DELETE TO anon;

-- GST_INVOICES TABLE
ALTER TABLE gst_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public insert to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public update to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public delete from gst_invoices" ON gst_invoices;
CREATE POLICY "Allow anonymous read" ON gst_invoices FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON gst_invoices FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON gst_invoices FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON gst_invoices FOR DELETE TO anon;

-- ACCOUNTS TABLE
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public insert to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public update to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public delete from accounts" ON accounts;
CREATE POLICY "Allow anonymous read" ON accounts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON accounts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON accounts FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON accounts FOR DELETE TO anon;

-- VOUCHERS TABLE
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to vouchers" ON vouchers;
DROP POLICY IF EXISTS "Allow public insert to vouchers" ON vouchers;
DROP POLICY IF EXISTS "Allow public update to vouchers" ON vouchers;
DROP POLICY IF EXISTS "Allow public delete from vouchers" ON vouchers;
CREATE POLICY "Allow anonymous read" ON vouchers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON vouchers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON vouchers FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON vouchers FOR DELETE TO anon;

-- TRIAL_BALANCE TABLE
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to trial_balance" ON trial_balance;
DROP POLICY IF EXISTS "Allow public insert to trial_balance" ON trial_balance;
DROP POLICY IF EXISTS "Allow public update to trial_balance" ON trial_balance;
DROP POLICY IF EXISTS "Allow public delete from trial_balance" ON trial_balance;
CREATE POLICY "Allow anonymous read" ON trial_balance FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON trial_balance FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON trial_balance FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON trial_balance FOR DELETE TO anon;

-- ITR_FORMS TABLE
ALTER TABLE itr_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to itr_forms" ON itr_forms;
DROP POLICY IF EXISTS "Allow public insert to itr_forms" ON itr_forms;
DROP POLICY IF EXISTS "Allow public update to itr_forms" ON itr_forms;
DROP POLICY IF EXISTS "Allow public delete from itr_forms" ON itr_forms;
CREATE POLICY "Allow anonymous read" ON itr_forms FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON itr_forms FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON itr_forms FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON itr_forms FOR DELETE TO anon;

-- FORM16 TABLE
ALTER TABLE form16 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to form16" ON form16;
DROP POLICY IF EXISTS "Allow public insert to form16" ON form16;
DROP POLICY IF EXISTS "Allow public update to form16" ON form16;
DROP POLICY IF EXISTS "Allow public delete from form16" ON form16;
CREATE POLICY "Allow anonymous read" ON form16 FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON form16 FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON form16 FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON form16 FOR DELETE TO anon;

-- TDS_CHALLANS TABLE
ALTER TABLE tds_challans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to tds_challans" ON tds_challans;
DROP POLICY IF EXISTS "Allow public insert to tds_challans" ON tds_challans;
DROP POLICY IF EXISTS "Allow public update to tds_challans" ON tds_challans;
DROP POLICY IF EXISTS "Allow public delete from tds_challans" ON tds_challans;
CREATE POLICY "Allow anonymous read" ON tds_challans FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON tds_challans FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON tds_challans FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON tds_challans FOR DELETE TO anon;