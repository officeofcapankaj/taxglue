/**
 * TaxGlue - Supabase Configuration
 * 
 * This file centralizes Supabase configuration.
 * 
 * Environment Variables (set in Vercel dashboard):
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * 
 * For local development, create a .env file with:
 * VITE_SUPABASE_URL=your-url
 * VITE_SUPABASE_ANON_KEY=your-key
 */

// Get Supabase URL from environment or use default
const getEnv = (key, fallback) => {
  // Check window.__env__ (set by Vercel)
  if (typeof window !== 'undefined' && window.__env__ && window.__env__[key]) {
    return window.__env__[key];
  }
  // Check global variable
  if (typeof window !== 'undefined' && window[key]) {
    return window[key];
  }
  // Return fallback
  return fallback;
};

const SUPABASE_URL = getEnv('SUPABASE_URL', "https://jgjeuybgideeqcjxvlmn.supabase.co");
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', "sb_publishable_8nwimD4up__9jnxr6RoDpg_8_Gy5w7j");

// Create and expose a single Supabase client globally
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log config in development (remove in production)
if (window.location && window.location.hostname === 'localhost') {
  console.log('TaxGlue: Supabase client initialized');
}
