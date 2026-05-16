// ============================================
// LocalWork — Health Check Test
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

describe('API Health', () => {
  it('GET / debe responder con info del API', async () => {
    const app = await importApp();
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'LocalWork API');
    expect(res.body).toHaveProperty('status', 'online');
  });

  it('GET /api/health debe responder ok', async () => {
    const app = await importApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'LocalWork API');
    expect(res.body).toHaveProperty('timestamp');
  });
});
