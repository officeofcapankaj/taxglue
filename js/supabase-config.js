/**
 * TaxGlue - Supabase Configuration
 *
 * This file centralizes Supabase configuration.
 * All sensitive values MUST be set via environment variables.
 * Do NOT hardcode any credentials in this file.
 *
 * Environment Variables (set in Vercel dashboard):
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 */

// Get Supabase URL from environment
const getEnv = (key, fallback) => {
  // Check window.__env__ (set by Vercel)
  if (typeof window !== 'undefined' && window.__env__ && window.__env__[key]) {
    return window.__env__[key];
  }
  // Check global variable
  if (typeof window !== 'undefined' && window[key]) {
    return window[key];
  }
  // Return fallback for demo mode
  return fallback;
};

// Demo mode fallback values (empty strings - queries will fail gracefully)
const SUPABASE_URL = getEnv('SUPABASE_URL', '');
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', '');

// Create Supabase client (may fail if no credentials - that's ok for demo)
let supabase = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('TaxGlue: Supabase client initialized');
  } else {
    console.log('TaxGlue: Running in demo mode (no Supabase credentials)');
  }
} catch (e) {
  console.log('TaxGlue: Demo mode - Supabase not available');
}
