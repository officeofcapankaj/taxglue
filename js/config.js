// ============================================
// TaxGlue Configuration
// ============================================
// Supports both online (Supabase) and offline (local JSON) modes

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

// Get configuration from environment variables
// In production on Vercel, set these as environment variables:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const ENV_URL = import.meta.env.VITE_SUPABASE_URL
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Default credentials (for local development only)
// In production, use environment variables
const DEFAULT_URL = "https://jgjeuybgideeqcjxvlmn.supabase.co"
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnamV1eWJnaWRlZXFjanh2bG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjIxNDAsImV4cCI6MjA4ODY5ODE0MH0.etglAIrYa5r67QuS7qKMR-lYodu_jxeJaozwKESuiD0"

// Use environment variables if set, otherwise use defaults
const SUPABASE_URL = ENV_URL || DEFAULT_URL
const SUPABASE_ANON_KEY = ENV_KEY || DEFAULT_KEY

// Show warning in production if env vars not set
if (!ENV_URL || !ENV_KEY) {
  console.warn('Using default credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production.')
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Check if running in desktop mode (offline)
export const isDesktop = typeof window !== 'undefined' && window.desktop !== undefined;

// API base URL - works offline with local server
export const API_URL = isDesktop 
  ? 'http://localhost:3000/api'
  : '/api';

// Mode detection
export function getMode() {
  // If desktop app, use offline mode
  if (isDesktop || (typeof window !== 'undefined' && window.location.protocol === 'file:')) {
    return 'offline';
  }
  // Check if online
  return typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
}
