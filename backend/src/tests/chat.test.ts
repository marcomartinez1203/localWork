// ============================================
// LocalWork — Chat Routes Integration Tests
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

describe('Chat API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET /api/chat/conversations debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/chat/conversations');
    expect(res.status).toBe(401);
  });

  it('POST /api/chat/requests debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).post('/api/chat/requests').send({ target_user_id: 'u2' });
    expect(res.status).toBe(401);
  });

  it('GET /api/chat/conversations/:id/messages debe requerir auth', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/chat/conversations/conv1/messages');
    expect(res.status).toBe(401);
  });
});
