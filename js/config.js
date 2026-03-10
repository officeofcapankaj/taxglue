// js/config.js
// NOTE: Replace these with environment variables in production
// e.g., import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env.js"

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jgjeuybgideeqcjxvlmn.supabase.co"
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8nwimD4up__9jnxr6RoDpg_8_Gy5w7j"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
