// ============================================
// LocalWork — Environment Configuration (Zod)
// ============================================
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const defaultCorsOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const envSchema = z.object({
  PORT: z.string().optional().default('3000'),
  NODE_ENV: z.string().optional().default('development'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL es requerida'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY es requerida'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es requerida'),
  FRONTEND_URL: z.string().optional().default('http://localhost:5500'),
  CORS_ORIGINS: z.string().optional(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  - ');

  if (process.env.NODE_ENV === 'test') {
    console.warn(`⚠️  Variables de entorno inválidas (modo test):\n  - ${issues}`);
  } else {
    console.error(`❌ Variables de entorno inválidas:\n  - ${issues}`);
    process.exit(1);
  }
}

const raw = parseResult.success ? parseResult.data : (process.env as Record<string, string>);

export const env = {
  port: parseInt(raw.PORT!, 10),
  nodeEnv: raw.NODE_ENV!,
  supabaseUrl: raw.SUPABASE_URL!,
  supabaseAnonKey: raw.SUPABASE_ANON_KEY!,
  supabaseServiceKey: raw.SUPABASE_SERVICE_ROLE_KEY!,
  frontendUrl: raw.FRONTEND_URL!,
  corsOrigins: raw.CORS_ORIGINS
    ? raw.CORS_ORIGINS.split(',').map((o: string) => o.trim())
    : defaultCorsOrigins,
  isDev: raw.NODE_ENV !== 'production',
};
