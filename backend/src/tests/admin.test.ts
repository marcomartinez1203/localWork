// ============================================
// LocalWork — Admin Routes Integration Tests
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

describe('Admin API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET /api/admin/stats debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/verifications debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/admin/verifications');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/admin/verifications/:userId debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).patch('/api/admin/verifications/u1').send({ status: 'verified' });
    expect(res.status).toBe(401);
  });
});
