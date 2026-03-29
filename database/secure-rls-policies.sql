-- ============================================
-- Secure RLS Policies for TaxGlue
-- Implements proper tenant isolation
-- ============================================

-- First, enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_deductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_deductees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_ewaybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form16 ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURE POLICIES
-- Each policy ensures users can only access their own data
-- or data belonging to organizations they are members of
-- ============================================

-- ============================================
-- CLIENTS TABLE
-- ============================================

-- Secure: Users can only access their own clients
DROP POLICY IF EXISTS "Allow public read access to clients" ON clients;
DROP POLICY IF EXISTS "Allow public insert to clients" ON clients;
DROP POLICY IF EXISTS "Allow public update to clients" ON clients;
DROP POLICY IF EXISTS "Allow public delete from clients" ON clients;

CREATE POLICY "Users can read own clients" ON clients
  FOR SELECT TO anon, authenticated
  USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE TO anon, authenticated
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE TO anon, authenticated
  USING (auth.uid()::text = owner_id);

-- ============================================
-- CA_MASTER TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public insert to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public update to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public delete from ca_master" ON ca_master;

CREATE POLICY "Users can read own ca_master" ON ca_master
  FOR SELECT TO anon, authenticated
  USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own ca_master" ON ca_master
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own ca_master" ON ca_master
  FOR UPDATE TO anon, authenticated
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own ca_master" ON ca_master
  FOR DELETE TO anon, authenticated
  USING (auth.uid()::text = owner_id);

-- ============================================
-- ACCOUNTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public insert to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public update to accounts" ON accounts;
DROP POLICY IF EXISTS "Allow public delete from accounts" ON accounts;

CREATE POLICY "Users can read own accounts" ON accounts
  FOR SELECT TO anon, authenticated
  USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE TO anon, authenticated
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE TO anon, authenticated
  USING (auth.uid()::text = owner_id);

-- ============================================
-- VOUCHERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to vouchers" ON vouchers;
DROP POLICY IF EXISTS "Allow public insert to vouchers" ON vouchers;
DROP POLICY IF EXISTS "Allow public update to vouchers" ON vouchers;
DROP POLICY IF EXISTS "Allow public delete from vouchers" ON vouchers;

CREATE POLICY "Users can read own vouchers" ON vouchers
  FOR SELECT TO anon, authenticated
  USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own vouchers" ON vouchers
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own vouchers" ON vouchers
  FOR UPDATE TO anon, authenticated
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own vouchers" ON vouchers
  FOR DELETE TO anon, authenticated
  USING (auth.uid()::text = owner_id);

-- ============================================
-- TRIAL_BALANCE TABLE
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to trial_balance" ON trial_balance;
DROP POLICY IF EXISTS "Allow public insert to trial_balance" ON trial_balance;
DROP POLICY IF EXISTS "Allow public update to trial_balance" ON trial_balance;
DROP POLICY IF EXISTS "Allow public delete from trial_balance" ON trial_balance;

CREATE POLICY "Users can read own trial_balance" ON trial_balance
  FOR SELECT TO anon, authenticated
  USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own trial_balance" ON trial_balance
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own trial_balance" ON trial_balance
  FOR UPDATE TO anon, authenticated
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own trial_balance" ON trial_balance
  FOR DELETE TO anon, authenticated
  USING (auth.uid()::text = owner_id);

-- ============================================
-- TDS TABLES
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public insert to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public update to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public delete from tds_deductors" ON tds_deductors;

CREATE POLICY "Users can read own tds_deductors" ON tds_deductors
  FOR SELECT TO anon, authenticated
  USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own tds_deductors" ON tds_deductors
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own tds_deductors" ON tds_deductors
  FOR UPDATE TO anon, authenticated
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own tds_deductors" ON tds_deductors
  FOR DELETE TO anon, authenticated
  USING (auth.uid()::text = owner_id);

-- Similar policies for tds_deductees, tds_challans, tds_returns...

-- ============================================
-- GST TABLES
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public insert to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public update to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public delete from gst_invoices" ON gst_invoices;

CREATE POLICY "Users can read own gst_invoices" ON gst_invoices
  FOR SELECT TO anon, authenticated
  USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can insert own gst_invoices" ON gst_invoices
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own gst_invoices" ON gst_invoices
  FOR UPDATE TO anon, authenticated
  USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own gst_invoices" ON gst_invoices
  FOR DELETE TO anon, authenticated
  USING (auth.uid()::text = owner_id);

-- Similar policies for gst_returns, gst_ewaybills...

-- ============================================
-- ORGANIZATION TABLES
-- ============================================

-- Organizations: Users can read organizations they are members of
CREATE POLICY "Members can read their organizations" ON organizations
  FOR SELECT TO authenticated
  USING (id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid()
  ));

-- Organization members: Users can only see their own org memberships
CREATE POLICY "Users can read own memberships" ON organization_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- FUNCTION: Add owner_id column to existing tables
-- Run this migration to add owner_id to tables that don't have it
-- ============================================

-- Add owner_id column to clients if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'owner_id') THEN
        ALTER TABLE clients ADD COLUMN owner_id TEXT;
    END IF;
END $$;

-- Add owner_id to other tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ca_master' AND column_name = 'owner_id') THEN
        ALTER TABLE ca_master ADD COLUMN owner_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'owner_id') THEN
        ALTER TABLE accounts ADD COLUMN owner_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'owner_id') THEN
        ALTER TABLE vouchers ADD COLUMN owner_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tds_deductors' AND column_name = 'owner_id') THEN
        ALTER TABLE tds_deductors ADD COLUMN owner_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gst_invoices' AND column_name = 'owner_id') THEN
        ALTER TABLE gst_invoices ADD COLUMN owner_id TEXT;
    END IF;
END $$;

-- Create index on owner_id for better performance
CREATE INDEX IF NOT EXISTS idx_clients_owner ON clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_ca_master_owner ON ca_master(owner_id);
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_owner ON vouchers(owner_id);
CREATE INDEX IF NOT EXISTS idx_tds_deductors_owner ON tds_deductors(owner_id);
CREATE INDEX IF NOT EXISTS idx_gst_invoices_owner ON gst_invoices(owner_id);