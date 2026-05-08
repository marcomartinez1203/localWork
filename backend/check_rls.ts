import { supabaseAdmin } from './src/config/supabase';

async function checkRLS() {
  const { data, error } = await supabaseAdmin.rpc('get_rls_status' as any);
  if (error) {
    console.log('Cannot run RPC. Trying raw query via rest interface if possible?');
    // Supabase JS client doesn't support raw queries directly.
  }
}

checkRLS();
