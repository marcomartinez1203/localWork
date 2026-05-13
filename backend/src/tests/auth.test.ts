// ============================================
// LocalWork — Auth Routes Tests
// ============================================
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

beforeAll(() => {
  process.env.SUPABASE_URL = 'http://localhost:54321';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
});

const importApp = async () => {
  const { default: app } = await import('../app');
  return app;
};

describe('Auth API', () => {
  it('Debe rechazar el acceso al perfil sin token', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/auth/profile');
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Token de autenticación requerido');
  });

  it('Debe retornar 400 si se intenta hacer login sin body', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/auth/login').send({});
    
    // Asumiendo que el controlador o Zod atrapan el body vacío
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
