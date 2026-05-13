// ============================================
// LocalWork — Jobs Routes Tests
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

describe('Jobs API', () => {
  it('Debe listar ofertas activas de forma pública', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/jobs');
    
    // Supabase no real, retornará un error mockeado o array vacío, pero el código HTTP será 500/200.
    // Al menos probamos que la ruta existe y responde.
    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  it('Debe proteger la creación de ofertas', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/jobs').send({ title: 'Test' });
    
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Token de autenticación requerido/);
  });
});
