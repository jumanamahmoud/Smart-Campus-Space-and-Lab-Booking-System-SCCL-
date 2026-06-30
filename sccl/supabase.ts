import { createClient } from '@supabase/supabase-js';

// Replace these two strings with your EXACT Supabase URL and Anon Key.
// Make sure to keep the quote marks around them!
const supabaseUrl = "https://qjdtnhrkhxwekvsfnbcz.supabase.co";
const supabaseAnonKey = "sb_publishable_5sUQX3b2RlkxqHw7Ru2OpA_HpeIaieg";

// We have completely removed the 'if' statement that was crashing your app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

