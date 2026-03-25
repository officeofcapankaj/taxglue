-- ============================================
-- Add Account Groups and Stock Items Tables
-- ============================================

-- Account Groups Table
CREATE TABLE IF NOT EXISTS account_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  nature VARCHAR(50),
  parent_id UUID REFERENCES account_groups(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;

-- Policy for account_groups
CREATE POLICY "Users can manage account_groups" ON account_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients WHERE id = account_groups.client_id AND user_id = auth.uid())
    OR auth.uid() IN (SELECT user_id FROM clients)
  );

-- Stock Items Table
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  fy VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  category VARCHAR(100),
  unit VARCHAR(50),
  opening_qty DECIMAL(15,2) DEFAULT 0,
  rate DECIMAL(15,2) DEFAULT 0,
  hsn_code VARCHAR(20),
  gst_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

-- Policy for stock_items
CREATE POLICY "Users can manage stock_items" ON stock_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients WHERE id = stock_items.client_id AND user_id = auth.uid())
    OR auth.uid() IN (SELECT user_id FROM clients)
  );

-- Add group_id to accounts table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE accounts ADD COLUMN group_id UUID REFERENCES account_groups(id);
  END IF;
END $$;