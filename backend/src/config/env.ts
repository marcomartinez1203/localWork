// ============================================
// LocalWork — Environment Configuration
// ============================================
import dotenv from 'dotenv';

dotenv.config();

const defaultCorsOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export const env = {
  port:                  parseInt(process.env.PORT || '3000', 10),
  nodeEnv:               process.env.NODE_ENV || 'development',
  supabaseUrl:           process.env.SUPABASE_URL!,
  supabaseAnonKey:       process.env.SUPABASE_ANON_KEY!,
  supabaseServiceKey:    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  frontendUrl:           process.env.FRONTEND_URL || 'http://localhost:5500',
  corsOrigins:           process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : defaultCorsOrigins,
  isDev:                 process.env.NODE_ENV !== 'production',
};

// Validar variables requeridas
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
for (const key of required) {
  if (!process.env[key]) {
    if (process.env.NODE_ENV === 'test') {
      console.warn(`⚠️  Falta la variable de entorno: ${key} (modo test)`);
    } else {
      console.error(`❌ Falta la variable de entorno: ${key}`);
      process.exit(1);
    }
  }
}
