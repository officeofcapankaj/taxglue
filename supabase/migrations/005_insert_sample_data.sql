-- Insert sample clients data
INSERT INTO clients (name, constitution, pan, gstin, phone, email, address, city, district, state, country) VALUES
('Singla Steel Corporation', 'Sole Proprietorship', 'ABPFS1234C', '03ABPFS1234C1Z5', '9876543210', 'info@singlasteel.com', '123 Steel Chowk', 'Delhi', 'North Delhi', 'Delhi', 'India'),
('Rana Industries', 'Partnership Firm', 'AABCU1234E', '03AABCU1234E1Z6', '9876543211', 'contact@ranaindustries.com', '45 Industrial Area', 'Mumbai', 'Mumbai', 'Maharashtra', 'India'),
('Sharma Traders', 'Sole Proprietorship', 'BBFPS5678D', '03BBFPS5678C1Z4', '9876543212', 'sharma@sharmatraders.com', '78 Market Road', 'Pune', 'Pune', 'Maharashtra', 'India'),
('Gupta Construction', 'Private Limited Company', 'AACCG9012H', '03AACCG9012H1Z8', '9876543213', 'info@guptaconstruction.com', '156 Builders Colony', 'Bangalore', 'Bangalore Urban', 'Karnataka', 'India'),
('Aggarwal Textiles', 'LLP', 'CCFFI3456K', '06CCFFI3456K1Z1', '9876543214', 'agg@aggartextiles.com', '89 Textile Market', 'Gurgaon', 'Gurgaon', 'Haryana', 'India'),
('Jain Logistics', 'Sole Proprietorship', 'DDGGH7890L', '06DDGGH7890L1Z2', '9876543215', 'jain@jainlogistics.com', '234 Transport Nagar', 'Gwalior', 'Gwalior', 'Madhya Pradesh', 'India'),
('Patel Electronics', 'Private Limited Company', 'AADDJ1234M', '24AADDJ1234M1Z5', '9876543216', 'patel@patelelectronics.com', '567 Electronics Market', 'Ahmedabad', 'Ahmedabad', 'Gujarat', 'India'),
('Reddy & Co', 'Partnership Firm', 'AAEEK5678N', '36AAEEK5678N1Z4', '9876543217', 'reddy@reddyco.com', '345 Business Park', 'Hyderabad', 'Hyderabad', 'Telangana', 'India'),
('Kumar Medical Stores', 'Sole Proprietorship', 'BBFFL9012P', '10BBFFL9012P1Z3', '9876543218', 'kumar@kumarmedical.com', '78 Medical Street', 'Bangalore', 'Bangalore Urban', 'Karnataka', 'India'),
('Chowdhury Consultants', 'LLP', 'CCGGM3456Q', '19CCGGM3456Q1Z2', '9876543219', 'chowdhury@consultants.com', '123 Consulting Plaza', 'Kolkata', 'Kolkata', 'West Bengal', 'India');

-- Insert sample account groups
INSERT INTO account_groups (name, nature, parent_id) VALUES
('Primary', 'Assets', NULL),
('Secondary', 'Liabilities', NULL),
('Income', 'Income', NULL),
('Expense', 'Expense', NULL),
('Capital', 'Liabilities', NULL);

-- Insert sample ledgers
INSERT INTO ledgers (name, group_id, opening_balance, nature) VALUES
('Cash', 1, 50000, 'Debit'),
('Bank Account', 1, 100000, 'Debit'),
('Sundry Debtors', 1, 0, 'Debit'),
('Sundry Creditors', 2, 0, 'Credit'),
('Capital Account', 4, 100000, 'Credit'),
('Sales Account', 3, 0, 'Credit'),
('Purchase Account', 1, 0, 'Debit'),
('Rent Expense', 4, 0, 'Debit'),
('Salary Expense', 4, 0, 'Debit'),
('Office Expenses', 4, 0, 'Debit');

-- Insert sample stock groups
INSERT INTO stock_groups (name, parent_id) VALUES
('Raw Material', NULL),
('Finished Goods', NULL),
('Trading Goods', NULL),
('Packing Material', NULL);

-- Insert sample stock items
INSERT INTO stock_items (name, code, category, unit, opening_qty, rate) VALUES
('Steel Rods', 'STL001', 'Raw Material', 'KG', 1000, 50),
('Steel Sheets', 'STL002', 'Raw Material', 'KG', 500, 80),
('Cotton Fabric', 'COT001', 'Trading Goods', 'MTR', 2000, 120),
('Electronic Chips', 'ELC001', 'Trading Goods', 'PCS', 5000, 25),
('Medicine Box', 'MED001', 'Finished Goods', 'BOX', 100, 150);

-- Insert sample stock godowns
INSERT INTO godowns (name, address) VALUES
('Main Warehouse', '123 Warehouse Area, Delhi'),
('Godown A', '45 Storage Complex, Mumbai'),
('Godown B', '78 Logistics Park, Bangalore');

-- Insert sample states
INSERT INTO states (name, code) VALUES
('Delhi', 'DL'),
('Maharashtra', 'MH'),
('Karnataka', 'KA'),
('Tamil Nadu', 'TN'),
('Uttar Pradesh', 'UP'),
('Gujarat', 'GJ'),
('West Bengal', 'WB'),
('Telangana', 'TG'),
('Madhya Pradesh', 'MP'),
('Haryana', 'HR');

-- Insert sample countries
INSERT INTO countries (name, code) VALUES
('India', 'IN'),
('USA', 'US'),
('United Kingdom', 'UK'),
('UAE', 'AE'),
('Singapore', 'SG');

-- Insert sample voucher types
INSERT INTO voucher_types (name, prefix, is_active) VALUES
('Sale', 'SAL', true),
('Sale Return', 'SR', true),
('Purchase', 'PUR', true),
('Purchase Return', 'PR', true),
('Journal Voucher', 'JV', true),
('Payment Voucher', 'PV', true),
('Receipt Voucher', 'RV', true),
('Contra Voucher', 'CV', true);