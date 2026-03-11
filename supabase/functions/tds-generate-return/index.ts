// ============================================
// Supabase Edge Function: Generate TDS Return
// Generates TDS return data for a specific quarter and FY
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

    const { deductor_id, quarter, fy, form_type = '26Q' } = await req.json();

    if (!deductor_id || !quarter || !fy) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: deductor_id, quarter, fy" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all transactions for the deductor
    const { data: transactions, error: txError } = await supabase
      .from("tds_transactions")
      .select("*")
      .eq("deductor_id", deductor_id)
      .eq("quarter", quarter)
      .eq("fy", fy);

    if (txError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch transactions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate summary by section
    const sectionSummary: Record<string, { amount: number; tds: number; count: number }> = {};
    let totalAmount = 0;
    let totalTds = 0;

    for (const tx of transactions || []) {
      if (!sectionSummary[tx.section]) {
        sectionSummary[tx.section] = { amount: 0, tds: 0, count: 0 };
      }
      sectionSummary[tx.section].amount += Number(tx.amount) || 0;
      sectionSummary[tx.section].tds += Number(tx.tds_amount) || 0;
      sectionSummary[tx.section].count += 1;
      totalAmount += Number(tx.amount) || 0;
      totalTds += Number(tx.tds_amount) || 0;
    }

    // Get deductor info
    const { data: deductor } = await supabase
      .from("tds_deductors")
      .select("*")
      .eq("id", deductor_id)
      .single();

    // Create return record
    const { data: tdsReturn, error: returnError } = await supabase
      .from("tds_returns")
      .upsert({
        deductor_id,
        quarter,
        fy,
        form_type,
        status: "GENERATED",
        total_transactions: transactions?.length || 0,
        total_amount: totalAmount,
        total_tds: totalTds,
        section_summary: sectionSummary,
        generated_at: new Date().toISOString(),
      }, { onConflict: "deductor_id,quarter,fy,form_type" })
      .select()
      .single();

    if (returnError) {
      return new Response(
        JSON.stringify({ error: "Failed to create return" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        return: tdsReturn,
        deductor,
        summary: {
          total_transactions: transactions?.length || 0,
          total_amount: totalAmount,
          total_tds: totalTds,
          section_breakdown: sectionSummary,
        },
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
