// ============================================
// LocalWork — Auth Routes Integration Tests
// ============================================
import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('./__mocks__/supabase');
  return createMockSupabaseModule();
});

vi.mock('../config/env', () => ({
  env: {
    port: 3000, nodeEnv: 'test',
    supabaseUrl: 'http://localhost:54321', supabaseAnonKey: 'test-anon',
    supabaseServiceKey: 'test-service', frontendUrl: 'http://localhost:5500',
    corsOrigins: [], isDev: false, hfApiKey: undefined,
  },
}));

beforeAll(() => { process.env.NODE_ENV = 'test'; });

const importApp = async () => {
  const { default: app } = await import('../app');
  return app;
};

describe('Auth API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST /api/auth/register debe registrar seeker', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/auth/register').send({
      email: 'seeker@test.com', password: 'password123', full_name: 'Test Seeker', role: 'seeker',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/register debe rechazar email inválido', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/auth/register').send({
      email: 'no-es-email', password: 'password123', full_name: 'Test', role: 'seeker',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login debe iniciar sesión', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@test.com', password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login debe rechazar body vacío', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/auth/profile debe rechazar sin token', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('PUT /api/auth/profile debe rechazar sin token', async () => {
    const app = await importApp();
    const res = await request(app).put('/api/auth/profile').send({ full_name: 'X' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/reset-password debe rechazar email inválido', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/auth/reset-password').send({ email: 'bad' });
    expect(res.status).toBe(400);
  });
});
