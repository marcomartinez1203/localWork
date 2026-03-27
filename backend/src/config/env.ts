// ============================================
// LocalWork — Environment Configuration
// ============================================
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port:                  parseInt(process.env.PORT || '3000', 10),
  nodeEnv:               process.env.NODE_ENV || 'development',
  supabaseUrl:           process.env.SUPABASE_URL!,
  supabaseAnonKey:       process.env.SUPABASE_ANON_KEY!,
  supabaseServiceKey:    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  frontendUrl:           process.env.FRONTEND_URL || 'http://localhost:5500',
  isDev:                 process.env.NODE_ENV !== 'production',
};

// Validar variables requeridas
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Falta la variable de entorno: ${key}`);
    process.exit(1);
  }
}
