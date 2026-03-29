-- ============================================
-- TaxGlue Consolidated Database Schema
-- Single source of truth for all tables
-- Version: 1.0.0
-- ============================================

-- ============================================
-- CORE TABLES
-- ============================================

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT, -- User ID from auth.users
    organization_id UUID REFERENCES organizations(id),
    constitution TEXT,
    name TEXT NOT NULL,
    address TEXT,
    pincode TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    phone TEXT,
    email TEXT,
    registrations JSONB DEFAULT '{}',
    contactPersons JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CA MASTER TABLE
CREATE TABLE IF NOT EXISTS ca_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    father_first_name TEXT,
    father_middle_name TEXT,
    father_last_name TEXT,
    membership_no TEXT,
    membership_date TEXT,
    ca_pan TEXT,
    firm_pan TEXT,
    firm_gstin TEXT,
    firm_name TEXT,
    firm_reg_no TEXT,
    status TEXT DEFAULT 'Active',
    address TEXT,
    pincode TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    phone TEXT,
    email TEXT,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    code TEXT,
    name TEXT NOT NULL,
    nature TEXT, -- Assets, Liability, Income, Expense
    type TEXT, -- Direct, Indirect, Capital
    opening_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    voucher_no TEXT,
    voucher_type TEXT,
    date DATE,
    narration TEXT,
    amount DECIMAL(15,2),
    debit_account_id UUID REFERENCES accounts(id),
    credit_account_id UUID REFERENCES accounts(id),
    lines JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRIAL BALANCE TABLE
CREATE TABLE IF NOT EXISTS trial_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    as_on_date DATE,
    account_name TEXT,
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TDS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS tds_deductors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    name TEXT NOT NULL,
    tan TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tds_deductees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    deductor_id UUID REFERENCES tds_deductors(id),
    name TEXT NOT NULL,
    pan TEXT,
    tan TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    tds_deducted DECIMAL(15,2) DEFAULT 0,
    tds_deposited DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tds_challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    bsr_code TEXT,
    chalan_no TEXT,
    chalan_date DATE,
    tax_deposited DECIMAL(15,2) DEFAULT 0,
    interest DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tds_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    quarter TEXT,
    return_type TEXT,
    total_amount DECIMAL(15,2) DEFAULT 0,
    tds_deducted DECIMAL(15,2) DEFAULT 0,
    tds_paid DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    due_date DATE,
    filed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- GST TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS gst_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    quarter TEXT,
    invoice_no TEXT,
    invoice_date DATE,
    invoice_value DECIMAL(15,2) DEFAULT 0,
    customer_name TEXT,
    customer_gstin TEXT,
    place_of_supply TEXT,
    reverse_charge TEXT DEFAULT 'N',
    rate DECIMAL(5,2) DEFAULT 0,
    taxable_value DECIMAL(15,2) DEFAULT 0,
    cgst DECIMAL(15,2) DEFAULT 0,
    sgst DECIMAL(15,2) DEFAULT 0,
    igst DECIMAL(15,2) DEFAULT 0,
    cess DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    period TEXT,
    return_type TEXT,
    gstr_1 JSONB,
    gstr_3b JSONB,
    total_liability DECIMAL(15,2) DEFAULT 0,
    input_credit DECIMAL(15,2) DEFAULT 0,
    net_liability DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    due_date DATE,
    filed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_ewaybills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    ewaybill_no TEXT,
    date DATE,
    from_place TEXT,
    to_place TEXT,
    distance INTEGER,
    goods_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hsn_code TEXT,
    description TEXT,
    rate DECIMAL(5,2) DEFAULT 0,
    cgst_rate DECIMAL(5,2) DEFAULT 0,
    sgst_rate DECIMAL(5,2) DEFAULT 0,
    igst_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INCOME TAX TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS itr_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    assessment_year TEXT,
    itr_type TEXT,
    form_type TEXT,
    pan TEXT,
    taxpayer_name TEXT,
    gross_income DECIMAL(15,2) DEFAULT 0,
    deductions DECIMAL(15,2) DEFAULT 0,
    taxable_income DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    filed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form16 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT,
    organization_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    fy TEXT,
    certificate_no TEXT,
    employer_name TEXT,
    employer_tan TEXT,
    employee_name TEXT,
    employee_pan TEXT,
    employee_designation TEXT,
    period_from DATE,
    period_to DATE,
    salary DECIMAL(15,2) DEFAULT 0,
    allowance DECIMAL(15,2) DEFAULT 0,
    deductions DECIMAL(15,2) DEFAULT 0,
    tax_deducted DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ORGANIZATION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_user_id TEXT,
    subscription_plan TEXT DEFAULT 'Free',
    status TEXT DEFAULT 'Active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id TEXT,
    role TEXT DEFAULT 'Member',
    status TEXT DEFAULT 'Active',
    invited_by TEXT,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Member',
    status TEXT DEFAULT 'PENDING',
    invited_by TEXT,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS organization_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    role_name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES organization_roles(id),
    module TEXT NOT NULL,
    permission_type TEXT NOT NULL,
    is_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_owner ON clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_client ON accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_client ON vouchers(client_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date);
CREATE INDEX IF NOT EXISTS idx_tds_deductors_client ON tds_deductors(client_id);
CREATE INDEX IF NOT EXISTS idx_gst_invoices_client ON gst_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_itr_forms_client ON itr_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);