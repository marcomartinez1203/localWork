// ============================================
// LocalWork — Supabase Client (Backend)
// ============================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Cliente con Service Role Key (acceso total, bypassa RLS)
// Usar SOLO en el backend para operaciones administrativas
export const supabaseAdmin: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Cliente con Anon Key (respeta RLS)
// Usar cuando se quiera actuar en nombre del usuario
export function createSupabaseClient(accessToken?: string): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
