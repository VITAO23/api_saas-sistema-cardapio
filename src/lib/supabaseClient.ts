import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY ?? '';

let supabaseClient = null;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Do not throw at import time; allow the app to start in environments without Supabase configured.
  // Log a clear message for developers.
  console.warn('Supabase not fully configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)');
} else {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
}

export const supabase = supabaseClient;
