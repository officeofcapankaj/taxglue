-- Organization Tables for Multi-Tenant System
-- Migration: 006_organization_tables.sql

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organizations
DROP POLICY IF EXISTS "Users can view own organizations" ON organizations;
CREATE POLICY "Users can view own organizations" ON organizations
  FOR ALL USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_organizations_owner_user_id ON organizations(owner_user_id);

-- 2. Organization Members Table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  status VARCHAR(20) DEFAULT 'active',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
CREATE POLICY "Users can view organization members" ON organization_members
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);

-- 3. Organization Invitations Table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending',
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can manage own invitations" ON organization_invitations;
CREATE POLICY "Users can manage own invitations" ON organization_invitations
  FOR ALL USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);

-- 4. Roles Table (Pre-defined system roles)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can manage roles" ON roles;
CREATE POLICY "Users can manage roles" ON roles
  FOR ALL USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON roles(organization_id);

RAISE NOTICE 'Organization tables created successfully!';

-- Insert default system roles
INSERT INTO roles (name, description, is_system_role, permissions) VALUES
('Owner', 'Full access to all features', true, 
  '{"clients": "change", "accounts": "change", "vouchers": "change", "payroll": "change", "reports": "change", "settings": "change"}'::jsonb),
('Accountant', 'Can manage clients, accounts, vouchers, payroll', true,
  '{"clients": "change", "accounts": "change", "vouchers": "change", "payroll": "change", "reports": "view", "settings": "view"}'::jsonb),
('Auditor', 'Read-only access to all data', true,
  '{"clients": "view", "accounts": "view", "vouchers": "view", "payroll": "view", "reports": "view", "settings": "none"}'::jsonb),
('Consultant', 'Read-only access to reports only', true,
  '{"clients": "view", "accounts": "view", "vouchers": "view", "payroll": "none", "reports": "view", "settings": "none"}'::jsonb)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Default roles inserted successfully!';