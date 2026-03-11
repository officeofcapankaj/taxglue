// ============================================
// Supabase Edge Function: TDS Calculation
// Calculates TDS amount based on section and income
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

    const { section, amount, is_filer = true } = await req.json();

    if (!section || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: section, amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get TDS rate from database
    const { data: rateData, error: rateError } = await supabase
      .from("tds_section_rates")
      .select("rate, name")
      .eq("section", section)
      .single();

    if (rateError || !rateData) {
      return new Response(
        JSON.stringify({ error: "Invalid section or section not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate TDS amount
    let tdsRate = rateData.rate;
    
    // Handle variable rate sections (like salary under Section 192)
    if (tdsRate === null) {
      tdsRate = 10; // Default 10% for salary
    }

    // Apply higher rate for non-filers under Section 206AB
    if (!is_filer && tdsRate > 0) {
      tdsRate = Math.max(tdsRate * 2, 5);
    }

    const tdsAmount = (amount * tdsRate) / 100;
    const netPayment = amount - tdsAmount;

    return new Response(
      JSON.stringify({
        section,
        section_name: rateData.name,
        amount,
        tds_rate: tdsRate,
        tds_amount: Math.round(tdsAmount * 100) / 100,
        net_payment: Math.round(netPayment * 100) / 100,
        is_filer,
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
