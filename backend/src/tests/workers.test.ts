// ============================================
// LocalWork — Workers Routes Integration Tests
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

describe('Workers API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET /api/workers debe ser público', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/workers');
    expect(res.status).toBe(200);
  });

  it('GET /api/workers/:id debe ser público', async () => {
    const { getGlobalMock } = await import('./__mocks__/supabase');
    getGlobalMock()!.getBuilder('profiles').setResult({
      data: { id: 'u1', full_name: 'Worker', role: 'seeker' }, error: null,
    });
    const app = await importApp();
    const res = await request(app).get('/api/workers/u1');
    expect(res.status).toBe(200);
  });
});
