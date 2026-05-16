// ============================================
// LocalWork — Auth Middleware Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth.middleware';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

import { getGlobalMock } from '../__mocks__/supabase';

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalMock()?.builders.clear();
  });

  const mockReq = (overrides: any = {}) => ({ headers: {}, ...overrides } as any);
  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
  };
  const mockNext = vi.fn();

  describe('authenticate', () => {
    it('Debe pasar con token válido', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.getUser.mockResolvedValue({
        data: { user: { id: 'u1', email: 'test@test.com' } }, error: null,
      });
      mock.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });

      const req = mockReq({ headers: { authorization: 'Bearer valid-token' } });
      const res = mockRes();
      await authenticate(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(req.userId).toBe('u1');
      expect(req.userRole).toBe('seeker');
    });

    it('Debe rechazar sin header', async () => {
      const req = mockReq();
      const res = mockRes();
      await authenticate(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Debe rechazar con token inválido', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.getUser.mockResolvedValue({
        data: { user: null }, error: { message: 'Invalid' },
      });

      const req = mockReq({ headers: { authorization: 'Bearer bad' } });
      const res = mockRes();
      await authenticate(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Debe rechazar si no empieza con Bearer', async () => {
      const req = mockReq({ headers: { authorization: 'Basic token' } });
      const res = mockRes();
      await authenticate(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requireRole', () => {
    it('Debe pasar si el rol coincide', () => {
      const req = mockReq({ userRole: 'employer' });
      const res = mockRes();
      requireRole('employer')(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('Debe rechazar si el rol no coincide', () => {
      const req = mockReq({ userRole: 'seeker' });
      const res = mockRes();
      requireRole('employer')(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('Debe rechazar si no hay rol', () => {
      const req = mockReq();
      const res = mockRes();
      requireRole('employer')(req, res, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('optionalAuth', () => {
    it('Debe pasar sin token', async () => {
      const req = mockReq();
      const res = mockRes();
      await optionalAuth(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
    });

    it('Debe poblar req si token válido', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.getUser.mockResolvedValue({
        data: { user: { id: 'u1' } }, error: null,
      });
      mock.getBuilder('profiles').setResult({ data: { role: 'seeker' }, error: null });

      const req = mockReq({ headers: { authorization: 'Bearer tok' } });
      const res = mockRes();
      await optionalAuth(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(req.userId).toBe('u1');
    });

    it('Debe pasar silenciosamente si token inválido', async () => {
      const mock = getGlobalMock()!;
      mock.supabaseAdmin.auth.getUser.mockRejectedValue(new Error('fail'));

      const req = mockReq({ headers: { authorization: 'Bearer bad' } });
      const res = mockRes();
      await optionalAuth(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
