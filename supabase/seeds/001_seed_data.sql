-- ============================================
-- TaxGlue Seed Data
-- Run this to populate initial reference data
-- ============================================

-- ============================================
-- TDS Section Rates
-- ============================================
INSERT INTO tds_section_rates (section, name, rate, description, is_active) VALUES
  ('192', 'Salary', NULL, 'TDS on Salary', true),
  ('194', 'Dividends', 10, 'TDS on Dividends', true),
  ('194A', 'Interest other than Interest on securities', 10, 'TDS on Interest', true),
  ('194C', 'Contractor Payment', 2, 'TDS on Contractual Payments', true),
  ('194D', 'Insurance Commission', 5, 'TDS on Insurance Commission', true),
  ('194H', 'Commission/Brokerage', 5, 'TDS on Commission', true),
  ('194I', 'Rent', 2, 'TDS on Rent', true),
  ('194IA', 'Transfer of Immovable Property', 1, 'TDS on Property Transfer', true),
  ('194IB', 'Rent by Individual/HUF', 5, 'TDS on Rent (Individual/HUF)', true),
  ('194J', 'Professional Fees', 10, 'TDS on Professional Fees', true),
  ('194Q', 'Purchase of Goods', 0.1, 'TDS on Purchase of Goods', true),
  ('195', 'Non-Resident Payments', NULL, 'TDS on Non-Resident Payments', true),
  ('206AB', 'Higher TDS Rate (Non-filers)', 5, 'Higher TDS for non-filers of ITR', true)
ON CONFLICT (section) DO NOTHING;

-- ============================================
-- GST Rates
-- ============================================
INSERT INTO gst_rates (rate, name, description, is_active) VALUES
  (0, 'Nil Rate', 'Nil rated goods/services', true),
  (0.1, 'Merchant Export', 'Merchant export', true),
  (0.25, 'Lower Rate', 'Lower rate', true),
  (3, 'Standard Rate', 'Standard rate', true),
  (5, 'Standard Rate', 'Standard rate', true),
  (12, 'Standard Rate', 'Standard rate', true),
  (18, 'Standard Rate', 'Standard rate', true),
  (28, 'Highest Rate', 'Highest rate', true)
ON CONFLICT (rate) DO NOTHING;

-- ============================================
-- Sample Chart of Accounts (for reference)
-- ============================================
-- These will be created per client
-- INSERT INTO accounts_template (code, name, nature, account_type) VALUES
--   ('001', 'Capital Account', 'Liabilities', 'Capital'),
--   ('002', 'Cash in Hand', 'Assets', 'Direct'),
--   ('003', 'Cash at Bank', 'Assets', 'Direct'),
--   ('004', 'Sundry Debtors', 'Assets', 'Direct'),
--   ('005', 'Sundry Creditors', 'Liabilities', 'Direct'),
--   ('006', 'Sales', 'Income', 'Revenue'),
--   ('007', 'Purchase', 'Expense', 'Direct'),
--   ('008', 'Salaries', 'Expense', 'Direct'),
--   ('009', 'Rent', 'Expense', 'Indirect'),
--   ('010', 'Interest Received', 'Income', 'Revenue'),
--   ('011', 'Discount Received', 'Income', 'Revenue'),
--   ('012', 'Discount Allowed', 'Expense', 'Revenue'),
--   ('013', 'Bank Charges', 'Expense', 'Indirect'),
--   ('014', 'Telephone Expenses', 'Expense', 'Indirect'),
--   ('015', 'Electricity Expenses', 'Expense', 'Indirect'),
--   ('016', 'Printing & Stationery', 'Expense', 'Indirect'),
--   ('017', 'Travelling Expenses', 'Expense', 'Indirect'),
--   ('018', 'Professional Fees', 'Expense', 'Indirect'),
--   ('019', 'Insurance Premium', 'Expense', 'Indirect'),
--   ('020', 'Depreciation', 'Expense', 'Indirect');

RAISE NOTICE 'Seed data inserted successfully!';
