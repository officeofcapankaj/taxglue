-- Migration: 007_add_organization_id.sql
-- Add organization_id to existing tables and migrate data

-- 1. Add organization_id column to clients table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'organization_id') THEN
    ALTER TABLE clients ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- 2. Add organization_id column to accounts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'organization_id') THEN
    ALTER TABLE accounts ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- 3. Add organization_id column to vouchers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vouchers' AND column_name = 'organization_id') THEN
    ALTER TABLE vouchers ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- 4. Add organization_id column to trial_balance table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trial_balance' AND column_name = 'organization_id') THEN
    ALTER TABLE trial_balance ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- 5. Add organization_id column to employees table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'organization_id') THEN
    ALTER TABLE employees ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- 6. Add organization_id column to salary_structures table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_structures' AND column_name = 'organization_id') THEN
    ALTER TABLE salary_structures ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- 7. Add organization_id column to salary_payments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salary_payments' AND column_name = 'organization_id') THEN
    ALTER TABLE salary_payments ADD COLUMN organization_id UUID;
  END IF;
END $$;

-- 8. Add organization_id column to payroll_settings table (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_settings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_settings' AND column_name = 'organization_id') THEN
      ALTER TABLE payroll_settings ADD COLUMN organization_id UUID;
    END IF;
  END IF;
END $$;

-- Create indexes for organization_id on all tables (conditional)
CREATE INDEX IF NOT EXISTS idx_clients_organization_id ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_organization_id ON accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_organization_id ON vouchers(organization_id);
CREATE INDEX IF NOT EXISTS idx_trial_balance_organization_id ON trial_balance(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_salary_structures_organization_id ON salary_structures(organization_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_organization_id ON salary_payments(organization_id);

-- Conditional index and update for payroll_settings
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_settings') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_payroll_settings_organization_id ON payroll_settings(organization_id)';
    
    UPDATE payroll_settings ps
    SET organization_id = c.organization_id
    FROM clients c
    WHERE ps.client_id = c.id
    AND ps.organization_id IS NULL;
  END IF;
END $$;

-- Migration: Create organizations for existing users and update data
-- This runs only once for existing data

-- Create organization for each unique user in clients table (if not already done)
INSERT INTO organizations (name, owner_user_id, subscription_plan, status)
SELECT 
  COALESCE(c.name, 'Default Organization') || ' Organization',
  c.user_id,
  'free',
  'active'
FROM clients c
WHERE c.user_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM organizations o WHERE o.owner_user_id = c.user_id)
GROUP BY c.user_id, c.name
ON CONFLICT DO NOTHING;

-- Update clients with organization_id
UPDATE clients c
SET organization_id = o.id
FROM organizations o
WHERE o.owner_user_id = c.user_id
AND c.organization_id IS NULL;

-- Update accounts with organization_id (via client)
UPDATE accounts a
SET organization_id = c.organization_id
FROM clients c
WHERE a.client_id = c.id
AND a.organization_id IS NULL;

-- Update vouchers with organization_id (via client)
UPDATE vouchers v
SET organization_id = c.organization_id
FROM clients c
WHERE v.client_id = c.id
AND v.organization_id IS NULL;

-- Update trial_balance with organization_id (via client)
UPDATE trial_balance tb
SET organization_id = c.organization_id
FROM clients c
WHERE tb.client_id = c.id
AND tb.organization_id IS NULL;

-- Update employees with organization_id (via client)
UPDATE employees e
SET organization_id = c.organization_id
FROM clients c
WHERE e.client_id = c.id
AND e.organization_id IS NULL;

-- Update salary_structures with organization_id (via employee -> client)
UPDATE salary_structures ss
SET organization_id = e.organization_id
FROM employees e
WHERE ss.employee_id = e.id
AND ss.organization_id IS NULL;

-- Update salary_payments with organization_id (via employee -> client)
UPDATE salary_payments sp
SET organization_id = e.organization_id
FROM employees e
WHERE sp.employee_id = e.id
AND sp.organization_id IS NULL;

-- Update payroll_settings with organization_id (via client) - only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_settings') THEN
    UPDATE payroll_settings ps
    SET organization_id = c.organization_id
    FROM clients c
    WHERE ps.client_id = c.id
    AND ps.organization_id IS NULL;
  END IF;
END $$;

-- RAISE NOTICE 'Organization migration completed successfully!';