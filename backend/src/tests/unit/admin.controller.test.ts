// ============================================
// LocalWork — AdminController Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminController } from '../../controllers/admin.controller';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

import { getGlobalMock } from '../__mocks__/supabase';

describe('AdminController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalMock()?.builders.clear();
  });

  it('getPlatformStats debe retornar estadísticas', async () => {
    getGlobalMock()!.getBuilder('platform_stats').setResult({
      data: { total_jobs: 10, total_users: 5 }, error: null,
    });

    const req = {} as any;
    const res = { json: vi.fn() } as any;
    await AdminController.getPlatformStats(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total_jobs: 10 }));
  });

  it('getPendingVerifications debe listar pendientes', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({
      data: [{ id: 'u1', verification_status: 'pending' }], error: null,
    });

    const req = {} as any;
    const res = { json: vi.fn() } as any;
    await AdminController.getPendingVerifications(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  it('updateVerificationStatus debe actualizar estado', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({
      data: { id: 'u1', verification_status: 'verified' }, error: null,
    });

    const req = { params: { userId: 'u1' }, body: { status: 'verified' } } as any;
    const res = { json: vi.fn() } as any;
    await AdminController.updateVerificationStatus(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Usuario marcado como verified' }));
  });

  it('updateVerificationStatus debe lanzar 400 si estado inválido', async () => {
    const req = { params: { userId: 'u1' }, body: { status: 'invalid' } } as any;
    const res = { json: vi.fn() } as any;
    await expect(AdminController.updateVerificationStatus(req, res)).rejects.toThrow('Estado inválido');
  });
});
