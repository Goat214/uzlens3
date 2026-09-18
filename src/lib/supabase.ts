import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True only when both env vars are present. Auth/history features degrade
 * gracefully (guest mode) instead of crashing when Supabase isn't
 * configured yet — e.g. during local dev before `.env` is filled in.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[uzlens] Supabase muhit o‘zgaruvchilari topilmadi. .env.example asosida .env faylini yarating.',
  )
}

// Only the anon (public) key is ever used here — it is safe to ship in the
// client bundle because Row Level Security policies (see
// supabase/schema.sql) restrict every table to the signed-in user's own
// rows. The service_role key must never be used outside of trusted
// server-side environments.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
