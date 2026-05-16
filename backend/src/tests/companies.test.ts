import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { getGlobalMock } from './__mocks__/supabase';

vi.mock('../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('./__mocks__/supabase');
  return createMockSupabaseModule();
});

vi.mock('../config/env', () => ({
  env: { port: 3000, nodeEnv: 'test', supabaseUrl: 'http://localhost:54321', supabaseAnonKey: 'test-anon', supabaseServiceKey: 'test-service', frontendUrl: 'http://localhost:5500', corsOrigins: [], isDev: false, hfApiKey: undefined },
}));

beforeAll(() => { process.env.NODE_ENV = 'test'; });

const importApp = async () => { const { default: app } = await import('../app'); return app; };
const authHeader = () => ({ Authorization: 'Bearer valid-token' });

describe('Companies API', () => {
  beforeEach(() => { vi.clearAllMocks(); getGlobalMock()?.builders.clear(); });

  it('GET /api/companies/mine debe requerir auth', async () => {
    const app = await importApp();
    expect((await request(app).get('/api/companies/mine')).status).toBe(401);
  });

  it('GET /api/companies/mine debe retornar empresa del empleador', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    getGlobalMock()!.getBuilder('companies').setResult({ data: { id:'c1', name:'Corp', owner_id:'u1' }, error: null });
    const app = await importApp();
    const res = await request(app).get('/api/companies/mine').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Corp');
  });

  it('GET /api/companies/mine 404 si no tiene empresa', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    getGlobalMock()!.getBuilder('companies').setResult({ data: null, error: { message:'Not found' } });
    const app = await importApp();
    const res = await request(app).get('/api/companies/mine').set(authHeader());
    expect(res.status).toBe(404);
  });

  it('GET /api/companies/mine/analytics debe retornar analytics', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    getGlobalMock()!.supabaseAdmin.rpc.mockResolvedValue({ data: { total_jobs:5 }, error: null } as any);
    const app = await importApp();
    const res = await request(app).get('/api/companies/mine/analytics').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.total_jobs).toBe(5);
  });

  it('POST /api/companies debe crear empresa', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    getGlobalMock()!.getBuilder('companies').setResult({ data: null, error: null });
    getGlobalMock()!.getBuilder('companies').insert.mockReturnValue(getGlobalMock()!.getBuilder('companies'));
    getGlobalMock()!.getBuilder('companies').select.mockReturnValue(getGlobalMock()!.getBuilder('companies'));
    getGlobalMock()!.getBuilder('companies').single.mockResolvedValue({ data: { id:'c2', name:'NewCo' }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/companies').set(authHeader()).send({ name:'NewCo' });
    expect(res.status).toBe(201);
  });

  it('POST /api/companies debe rechazar duplicado', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    getGlobalMock()!.getBuilder('companies').setResult({ data: { id:'c1' }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/companies').set(authHeader()).send({ name:'NewCo' });
    expect(res.status).toBe(409);
  });

  it('PUT /api/companies/:id debe actualizar empresa', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    getGlobalMock()!.getBuilder('companies').update.mockReturnValue(getGlobalMock()!.getBuilder('companies'));
    getGlobalMock()!.getBuilder('companies').eq.mockReturnValue(getGlobalMock()!.getBuilder('companies'));
    getGlobalMock()!.getBuilder('companies').select.mockReturnValue(getGlobalMock()!.getBuilder('companies'));
    getGlobalMock()!.getBuilder('companies').single.mockResolvedValue({ data: { id:'c1', name:'Updated' }, error: null });
    const app = await importApp();
    const res = await request(app).put('/api/companies/c1').set(authHeader()).send({ name:'Updated' });
    expect(res.status).toBe(200);
  });
});
