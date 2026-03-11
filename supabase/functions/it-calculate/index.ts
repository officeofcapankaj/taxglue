// ============================================
// Supabase Edge Function: Income Tax Calculation
// Calculates income tax based on taxable income
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Income tax slabs for FY 2024-25 (AY 2025-26)
const taxSlabs = {
  individual: [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 1000000, rate: 10 },
    { limit: Infinity, rate: 15 },
  ],
  senior_citizen: [
    { limit: 300000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 1000000, rate: 10 },
    { limit: Infinity, rate: 15 },
  ],
  super_senior_citizen: [
    { limit: 500000, rate: 0 },
    { limit: 1000000, rate: 10 },
    { limit: Infinity, rate: 15 },
  ],
};

function calculateTax(taxableIncome, age = 35) {
  let slabs;
  if (age >= 80) {
    slabs = taxSlabs.super_senior_citizen;
  } else if (age >= 60) {
    slabs = taxSlabs.senior_citizen;
  } else {
    slabs = taxSlabs.individual;
  }

  let tax = 0;
  let previousLimit = 0;

  for (const slab of slabs) {
    if (taxableIncome > previousLimit) {
      const taxableInSlab = Math.min(taxableIncome, slab.limit) - previousLimit;
      tax += (taxableInSlab * slab.rate) / 100;
      previousLimit = slab.limit;
    }
  }

  // Add 4% health & education cess
  const cess = (tax * 4) / 100;
  
  return {
    tax: Math.round(tax * 100) / 100,
    cess: Math.round(cess * 100) / 100,
    total_tax: Math.round((tax + cess) * 100) / 100,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { gross_income, deductions = 0, age = 35, assessment_year = '2024-25' } = await req.json();

    if (!gross_income) {
      return new Response(
        JSON.stringify({ error: "Missing required field: gross_income" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Standard deduction for salary income
    const standardDeduction = 50000;
    
    // Calculate taxable income
    const taxableIncome = Math.max(0, gross_income - deductions - standardDeduction);

    // Calculate tax
    const { tax, cess, total_tax } = calculateTax(taxableIncome, age);

    // Calculate effective tax rate
    const effectiveRate = gross_income > 0 ? (total_tax / gross_income) * 100 : 0;

    return new Response(
      JSON.stringify({
        gross_income,
        deductions: {
          standard_deduction: standardDeduction,
          other_deductions: deductions,
          total_deductions: standardDeduction + deductions,
        },
        taxable_income: taxableIncome,
        tax_breakup: {
          income_tax: tax,
          health_education_cess: cess,
          total_tax: total_tax,
        },
        effective_tax_rate: Math.round(effectiveRate * 100) / 100,
        assessment_year: assessment_year,
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
