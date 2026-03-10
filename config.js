// js/config.js

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://jgjeuybgideeqcjxvlmn.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_8nwimD4up__9jnxr6RoDpg_8_Gy5w7j"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
