// ============================================
// LocalWork — Notifications Routes Integration Tests
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

describe('Notifications API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET /api/notifications debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications/unread-count debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/notifications/unread-count');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/notifications/:id/read debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).patch('/api/notifications/n1/read');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/notifications/read-all debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).patch('/api/notifications/read-all');
    expect(res.status).toBe(401);
  });
});
