import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Server-side Supabase client for API routes.
 * Prefer SUPABASE_SERVICE_ROLE_KEY so reads/writes are not blocked by RLS.
 * Falls back to the publishable key when the service role key is not set.
 */
export const supabaseServer = createClient(
  supabaseUrl,
  serviceRoleKey ?? anonKey,
  serviceRoleKey
    ? { auth: { autoRefreshToken: false, persistSession: false } }
    : undefined
);
