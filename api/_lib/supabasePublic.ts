import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/** Server-side Supabase client using the anon key — same trust level as the
 * client-side one (RLS enforces access, not secrecy of this key), just
 * usable from api/ code that needs to read public data (e.g. approved
 * listings) without round-tripping through the browser. Never use this for
 * anything that needs elevated access — that's supabaseAdmin.ts. */
export function getSupabasePublic(): SupabaseClient | null {
  if (cached) return cached
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  cached = createClient(url, anonKey)
  return cached
}
