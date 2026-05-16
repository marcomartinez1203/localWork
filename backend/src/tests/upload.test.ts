import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';

let localMock: any;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  const { createMockSupabase } = await import('./__mocks__/supabase');
  localMock = createMockSupabase();
  vi.doMock('../config/supabase', () => ({
    supabaseAdmin: localMock.supabaseAdmin,
    createSupabaseClient: vi.fn(() => localMock.supabaseAdmin),
  }));
});

vi.mock('../config/env', () => ({
  env: { port: 3000, nodeEnv: 'test', supabaseUrl: 'http://localhost:54321', supabaseAnonKey: 'test-anon', supabaseServiceKey: 'test-service', frontendUrl: 'http://localhost:5500', corsOrigins: [], isDev: false, hfApiKey: undefined },
}));

const importApp = async () => { const { default: app } = await import('../app'); return app; };
const authHeader = () => ({ Authorization: 'Bearer valid-token' });
const mockStorage = () => {
  localMock.supabaseAdmin.storage.from.mockReturnValue({
    upload: vi.fn().mockResolvedValue({ data: { path: 'mock' }, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock.supabase.co/mock.png' } }),
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
  });
};

describe('Upload API', () => {
  beforeEach(() => { vi.clearAllMocks(); localMock?.builders.clear(); });

  it('POST /api/upload/avatar con imagen', async () => {
    mockStorage();
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/upload/avatar').set(authHeader()).attach('avatar', Buffer.from('x'), 'pic.jpg');
    expect(res.status).toBe(200);
    expect(res.body.url).toBeTruthy();
  });

  it('POST /api/upload/avatar rechaza no-imagen', async () => {
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/upload/avatar').set(authHeader()).attach('avatar', Buffer.from('x'), 'doc.pdf');
    expect(res.status).toBe(400);
  });

  it('POST /api/upload/resume con PDF', async () => {
    mockStorage();
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/upload/resume').set(authHeader()).attach('resume', Buffer.from('x'), 'cv.pdf');
    expect(res.status).toBe(200);
    expect(res.body.url).toBeTruthy();
  });

  it('POST /api/upload/resume rechaza no-PDF', async () => {
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/upload/resume').set(authHeader()).attach('resume', Buffer.from('x'), 'pic.jpg');
    expect(res.status).toBe(400);
  });

  it('POST /api/upload/company-logo con empresa', async () => {
    mockStorage();
    localMock.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    localMock.getBuilder('companies').setResult({ data: { id: 'c1' }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/upload/company-logo').set(authHeader()).attach('logo', Buffer.from('x'), 'logo.png');
    expect(res.status).toBe(200);
    expect(res.body.url).toBeTruthy();
  });

  it('POST /api/upload/company-logo sin empresa', async () => {
    localMock.getBuilder('profiles').setResult({ data: { role: 'employer' }, error: null });
    localMock.getBuilder('companies').setResult({ data: null, error: { message: 'Not found' } });
    const app = await importApp();
    const res = await request(app).post('/api/upload/company-logo').set(authHeader()).attach('logo', Buffer.from('x'), 'logo.png');
    expect(res.status).toBe(404);
  });

  it('POST /api/upload/identity con PDF', async () => {
    mockStorage();
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });
    const app = await importApp();
    const res = await request(app)
      .post('/api/upload/identity')
      .set(authHeader())
      .field('legalName', 'Juan Perez')
      .field('idNumber', '123456789')
      .attach('document', Buffer.from('x'), 'id.pdf');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending_manual');
  });

  it('POST /api/upload/portfolio agrega imagen', async () => {
    mockStorage();
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker', portfolio_images: ['u1'] }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/upload/portfolio').set(authHeader()).attach('image', Buffer.from('x'), 'work.webp');
    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(2);
  });

  it('POST /api/upload/portfolio rechaza límite 5', async () => {
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker', portfolio_images: ['u1','u2','u3','u4','u5'] }, error: null });
    const app = await importApp();
    const res = await request(app).post('/api/upload/portfolio').set(authHeader()).attach('image', Buffer.from('x'), 'work.webp');
    expect(res.status).toBe(400);
  });

  it('DELETE /api/upload/portfolio elimina imagen', async () => {
    localMock.getBuilder('profiles').setResult({ data: { role: 'seeker', portfolio_images: ['https://x/sup/uploads/pic.jpg'] }, error: null });
    const app = await importApp();
    const res = await request(app).delete('/api/upload/portfolio').set(authHeader()).send({ image_url: 'https://x/sup/uploads/pic.jpg' });
    expect(res.status).toBe(200);
    expect(res.body.images).toEqual([]);
  });
});
