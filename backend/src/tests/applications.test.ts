// ============================================
// LocalWork — Applications Routes Integration Tests
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

describe('Applications API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST /api/applications debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/applications').send({ job_id: 'j1' });
    expect(res.status).toBe(401);
  });

  it('GET /api/applications/mine debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/applications/mine');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/applications/:id/status debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).patch('/api/applications/a1/status').send({ status: 'accepted' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/applications/:id debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).delete('/api/applications/a1');
    expect(res.status).toBe(401);
  });
});
