-- Migration: 008_update_rls_policies.sql
-- Update RLS policies for organization-based access

-- Drop old user-based policies and create organization-based policies

-- ======================
-- CLIENTS
-- ======================
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );

-- ======================
-- ACCOUNTS
-- ======================
DROP POLICY IF EXISTS "Users can manage own accounts" ON accounts;
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );

-- ======================
-- VOUCHERS
-- ======================
DROP POLICY IF EXISTS "Users can manage own vouchers" ON vouchers;
CREATE POLICY "Users can manage own vouchers" ON vouchers
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );

-- ======================
-- TRIAL BALANCE
-- ======================
DROP POLICY IF EXISTS "Users can manage own trial_balance" ON trial_balance;
CREATE POLICY "Users can manage own trial_balance" ON trial_balance
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );

-- ======================
-- EMPLOYEES
-- ======================
DROP POLICY IF EXISTS "Users can manage own employees" ON employees;
CREATE POLICY "Users can manage own employees" ON employees
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );

-- ======================
-- SALARY STRUCTURES
-- ======================
DROP POLICY IF EXISTS "Users can manage own salary_structures" ON salary_structures;
CREATE POLICY "Users can manage own salary_structures" ON salary_structures
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );

-- ======================
-- SALARY PAYMENTS
-- ======================
DROP POLICY IF EXISTS "Users can manage own salary_payments" ON salary_payments;
CREATE POLICY "Users can manage own salary_payments" ON salary_payments
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id 
      FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
  );

-- ======================
-- PAYROLL SETTINGS (only if table exists)
-- ======================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_settings') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own payroll_settings" ON payroll_settings';
    EXECUTE 'CREATE POLICY "Users can manage own payroll_settings" ON payroll_settings
      FOR ALL USING (
        organization_id IN (
          SELECT om.organization_id 
          FROM organization_members om 
          WHERE om.user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- RAISE NOTICE 'RLS policies updated for organization-based access successfully!';