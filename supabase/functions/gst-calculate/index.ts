// ============================================
// Supabase Edge Function: GST Calculation
// Calculates GST for invoices
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { taxable_value, gst_rate, place_of_supply, invoice_type = 'B2B' } = await req.json();

    if (!taxable_value || !gst_rate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: taxable_value, gst_rate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine if IGST applies (inter-state)
    // For simplicity, assume same state = intra-state (CGST + SGST)
    const isInterState = place_of_supply && place_of_supply !== 'Same State';
    
    const totalGst = (taxable_value * gst_rate) / 100;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = totalGst;
    } else {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    }

    const total = taxable_value + totalGst;

    return new Response(
      JSON.stringify({
        taxable_value,
        gst_rate,
        invoice_type,
        is_inter_state: isInterState,
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100,
        igst: Math.round(igst * 100) / 100,
        total_gst: Math.round(totalGst * 100) / 100,
        total: Math.round(total * 100) / 100,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
