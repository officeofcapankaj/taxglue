-- TaxGlue Supabase RLS Policies
-- Run this in Supabase SQL Editor to enable database access

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ca_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trial_balance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CLIENTS TABLE POLICIES
-- ============================================

-- Allow anyone to read clients
CREATE POLICY "Allow public read access to clients"
ON clients FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to insert clients
CREATE POLICY "Allow public insert to clients"
ON clients FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to update clients
CREATE POLICY "Allow public update to clients"
ON clients FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow anyone to delete clients
CREATE POLICY "Allow public delete from clients"
ON clients FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================
-- CA_MASTER TABLE POLICIES  
-- ============================================

CREATE POLICY "Allow public read access to ca_master"
ON ca_master FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert to ca_master"
ON ca_master FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update to ca_master"
ON ca_master FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete from ca_master"
ON ca_master FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================
-- ACCOUNTS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow public read access to accounts"
ON accounts FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert to accounts"
ON accounts FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update to accounts"
ON accounts FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete from accounts"
ON accounts FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================
-- VOUCHERS TABLE POLICIES
-- ============================================

CREATE POLICY "Allow public read access to vouchers"
ON vouchers FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert to vouchers"
ON vouchers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update to vouchers"
ON vouchers FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete from vouchers"
ON vouchers FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================
-- TRIAL_BALANCE TABLE POLICIES
-- ============================================

CREATE POLICY "Allow public read access to trial_balance"
ON trial_balance FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert to trial_balance"
ON trial_balance FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update to trial_balance"
ON trial_balance FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete from trial_balance"
ON trial_balance FOR DELETE
TO anon, authenticated
USING (true);

-- Verify policies created
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
