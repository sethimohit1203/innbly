import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient() throws synchronously on a missing/invalid URL, which would
// crash the entire app at module load if these env vars aren't set — not
// just the one page that needs Supabase. Guard it so the rest of the site
// keeps working regardless; only the host-submission form fails, with a
// clear error, if this is null.
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null

if (!supabase) {
  console.warn('Supabase env vars missing — host submissions will fail until VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are set.')
}
