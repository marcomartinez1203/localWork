// ============================================
// LocalWork — Ratings Routes Integration Tests
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

describe('Ratings API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST /api/ratings debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/ratings').send({ rated_id: 'u2', score: 5 });
    expect(res.status).toBe(401);
  });

  it('POST /api/ratings/post-service debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/ratings/post-service').send({ application_id: 'a1', score: 5 });
    expect(res.status).toBe(401);
  });

  it('GET /api/ratings/user/:id debe ser público', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/ratings/user/u1');
    expect(res.status).toBe(200);
  });

  it('DELETE /api/ratings/:id debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).delete('/api/ratings/r1');
    expect(res.status).toBe(401);
  });

  it('POST /api/ratings debe rechazar sin rated_id', async () => {
    const { getGlobalMock } = await import('./__mocks__/supabase');
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });
    const app = await importApp();
    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', 'Bearer mock-token')
      .send({ score: 5 });
    expect(res.status).toBe(400);
  });

  it('POST /api/ratings/post-service debe rechazar sin application_id', async () => {
    const { getGlobalMock } = await import('./__mocks__/supabase');
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });
    const app = await importApp();
    const res = await request(app)
      .post('/api/ratings/post-service')
      .set('Authorization', 'Bearer mock-token')
      .send({ score: 5 });
    expect(res.status).toBe(400);
  });

  it('GET /api/ratings/check/:id debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/ratings/check/a1');
    expect(res.status).toBe(401);
  });
});
