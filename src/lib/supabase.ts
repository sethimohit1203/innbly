import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('Supabase env vars missing — host submissions will fail until VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are set.')
}

export const supabase = createClient(url ?? '', anonKey ?? '')
