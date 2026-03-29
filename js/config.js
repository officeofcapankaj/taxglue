// ============================================
// TaxGlue Configuration
// ============================================
// Supports both online (Supabase) and offline (local JSON) modes

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jgjeuybgideeqcjxvlmn.supabase.co"
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8nwimD4up__9jnxr6RoDpg_8_Gy5w7j"

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Check if running in desktop mode (offline)
export const isDesktop = window.desktop !== undefined;

// API base URL - works offline with local server
export const API_URL = isDesktop 
  ? 'http://localhost:3000/api'
  : '/api';

// Mode detection
export function getMode() {
  // If desktop app, use offline mode
  if (isDesktop || window.location.protocol === 'file:') {
    return 'offline';
  }
  // Check if online
  return navigator.onLine ? 'online' : 'offline';
}
