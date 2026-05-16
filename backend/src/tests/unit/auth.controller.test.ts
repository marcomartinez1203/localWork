// ============================================
// LocalWork — AuthController Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from '../../controllers/auth.controller';

vi.mock('../../services/auth.service', () => ({
  AuthService: {
    register: vi.fn(() => Promise.resolve({ user: { id: 'u1' }, token: 'tok1' })),
    login: vi.fn(() => Promise.resolve({ user: { id: 'u1' }, token: 'tok1' })),
    getProfile: vi.fn(() => Promise.resolve({ id: 'u1', full_name: 'Ana' })),
    updateProfile: vi.fn(() => Promise.resolve({ id: 'u1', full_name: 'Ana Updated' })),
    resetPassword: vi.fn(() => Promise.resolve()),
  },
}));

describe('AuthController', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockReq = (overrides: any = {}) => ({
    userId: 'u1', body: {}, ...overrides,
  } as any);

  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
  };

  const mockNext = vi.fn();

  it('register debe retornar 201', async () => {
    const req = mockReq({ body: { email: 'a@b.com', password: '12345678', full_name: 'Ana', role: 'seeker' } });
    const res = mockRes();
    await AuthController.register(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'tok1' }));
  });

  it('register debe lanzar 400 si Zod falla', async () => {
    const req = mockReq({ body: { email: 'bad' } });
    const res = mockRes();
    await AuthController.register(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('login debe retornar 200', async () => {
    const req = mockReq({ body: { email: 'a@b.com', password: '12345678' } });
    const res = mockRes();
    await AuthController.login(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'tok1' }));
  });

  it('login debe lanzar 400 si falta password', async () => {
    const req = mockReq({ body: { email: 'a@b.com' } });
    const res = mockRes();
    await AuthController.login(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('logout debe retornar mensaje', async () => {
    const req = mockReq();
    const res = mockRes();
    await AuthController.logout(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it('getProfile debe retornar perfil', async () => {
    const req = mockReq();
    const res = mockRes();
    await AuthController.getProfile(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ full_name: 'Ana' }));
  });

  it('updateProfile debe retornar usuario actualizado', async () => {
    const req = mockReq({ body: { full_name: 'Ana Updated' } });
    const res = mockRes();
    await AuthController.updateProfile(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.any(Object) }));
  });

  it('updateProfile debe lanzar 400 si nombre muy corto', async () => {
    const req = mockReq({ body: { full_name: 'A' } });
    const res = mockRes();
    await AuthController.updateProfile(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('resetPassword debe retornar mensaje', async () => {
    const req = mockReq({ body: { email: 'a@b.com' } });
    const res = mockRes();
    await AuthController.resetPassword(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('correo') }));
  });

  it('resetPassword debe lanzar 400 si email inválido', async () => {
    const req = mockReq({ body: { email: 'bad' } });
    const res = mockRes();
    await AuthController.resetPassword(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});
