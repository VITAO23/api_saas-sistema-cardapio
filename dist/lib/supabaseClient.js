"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY ?? '';
if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Do not throw at import time; allow the app to start in environments without Supabase configured.
    // Log a clear message for developers.
    console.warn('Supabase not fully configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)');
}
exports.supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
