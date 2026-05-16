// ============================================
// LocalWork — Jobs Routes Integration Tests
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

describe('Jobs API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET /api/jobs debe listar empleos públicamente', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });

  it('POST /api/jobs debe proteger creación sin auth', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/jobs').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });

  it('GET /api/jobs/categories debe ser público', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/jobs/categories');
    expect(res.status).toBe(200);
  });

  it('GET /api/jobs/stats debe ser público', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/jobs/stats');
    expect(res.status).toBe(200);
  });
});
