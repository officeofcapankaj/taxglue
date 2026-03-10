// Shared Supabase configuration
// Include this script in all HTML pages to use the same Supabase client

const SUPABASE_URL = "https://jgjeuybgideeqcjxvlmn.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_8nwimD4up__9jnxr6RoDpg_8_Gy5w7j"

// Create and expose a single Supabase client globally
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Log config loaded (remove in production)
console.log('Supabase client initialized')
