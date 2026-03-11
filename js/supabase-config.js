/**
 * TaxGlue - Supabase Configuration
 *
 * This file centralizes Supabase configuration.
 * All sensitive values MUST be set via environment variables.
 * Do NOT hardcode any credentials in this file.
 *
 * Environment Variables (set in Vercel dashboard):
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 *
 * For local development, create a .env file with:
 * VITE_SUPABASE_URL=your-url
 * VITE_SUPABASE_ANON_KEY=your-key
 */

// Get Supabase URL from environment - MUST be set via env var
const getEnv = (key, fallback) => {
  // Check window.__env__ (set by Vercel)
  if (typeof window !== 'undefined' && window.__env__ && window.__env__[key]) {
    return window.__env__[key];
  }
  // Check global variable
  if (typeof window !== 'undefined' && window[key]) {
    return window[key];
  }
  // Return fallback (should only be used for local dev)
  return fallback;
};

// Validate required environment variables
const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('TaxGlue Error: Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

// Create and expose a single Supabase client globally
const supabase = window.supabase.createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Log config in development (remove in production)
if (window.location && window.location.hostname === 'localhost') {
  console.log('TaxGlue: Supabase client initialized');
}
