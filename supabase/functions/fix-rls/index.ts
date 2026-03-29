// Edge function to fix RLS policies for demo mode
// This function runs with elevated privileges and can modify RLS policies

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const RLS_SQL = `
-- CLIENTS TABLE
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
DROP POLICY IF EXISTS "Allow public read access to clients" ON clients;
DROP POLICY IF EXISTS "Allow public insert to clients" ON clients;
DROP POLICY IF EXISTS "Allow public update to clients" ON clients;
DROP POLICY IF EXISTS "Allow public delete from clients" ON clients;
CREATE POLICY "anon_read_clients" ON clients FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE TO anon;

-- CA_MASTER TABLE
ALTER TABLE ca_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own ca_master" ON ca_master;
DROP POLICY IF EXISTS "Users can insert own ca_master" ON ca_master;
DROP POLICY IF EXISTS "Users can update own ca_master" ON ca_master;
DROP POLICY IF EXISTS "Users can delete own ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public read access to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public insert to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public update to ca_master" ON ca_master;
DROP POLICY IF EXISTS "Allow public delete from ca_master" ON ca_master;
CREATE POLICY "anon_read_ca_master" ON ca_master FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_ca_master" ON ca_master FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_ca_master" ON ca_master FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_ca_master" ON ca_master FOR DELETE TO anon;

-- TDS_DEDUCTORS TABLE
ALTER TABLE tds_deductors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public insert to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public update to tds_deductors" ON tds_deductors;
DROP POLICY IF EXISTS "Allow public delete from tds_deductors" ON tds_deductors;
CREATE POLICY "anon_read_tds_deductors" ON tds_deductors FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_tds_deductors" ON tds_deductors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_tds_deductors" ON tds_deductors FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_tds_deductors" ON tds_deductors FOR DELETE TO anon;

-- GST_INVOICES TABLE
ALTER TABLE gst_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public insert to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public update to gst_invoices" ON gst_invoices;
DROP POLICY IF EXISTS "Allow public delete from gst_invoices" ON gst_invoices;
CREATE POLICY "anon_read_gst_invoices" ON gst_invoices FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_gst_invoices" ON gst_invoices FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_gst_invoices" ON gst_invoices FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_gst_invoices" ON gst_invoices FOR DELETE TO anon;
`

Deno.serve(async (req: Request) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Execute SQL via Supabase Management API
    const response = await fetch(`${SUPABASE_URL}/v1/projects/taxglue/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: RLS_SQL })
    })

    if (!response.ok) {
      const error = await response.text()
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to apply RLS policies',
        details: error 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'RLS policies applied successfully for demo mode' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})