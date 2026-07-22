import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Server-only Supabase client using the service_role key, which bypasses
 * row-level security entirely. Never import this from src/ (client code) —
 * it must only run inside Vercel serverless functions, gated behind
 * verifyAdminSession(). The service_role key lives in
 * process.env.SUPABASE_SERVICE_ROLE_KEY (no VITE_ prefix) so it is never
 * bundled into client JS. */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Supabase admin client is not configured (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)')
  }
  return createClient(url, serviceKey)
}
