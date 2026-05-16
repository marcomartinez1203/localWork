// ============================================
// LocalWork — ApplicationsService Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationsService } from '../../services/applications.service';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

import { getGlobalMock } from '../__mocks__/supabase';

describe('ApplicationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalMock()?.builders.clear();
  });

  describe('apply', () => {
    it('Debe crear una postulación', async () => {
      getGlobalMock()!.getBuilder('jobs').setResult({
        data: { id: 'j1', status: 'active', title: 'Dev', company_id: 'c1' }, error: null,
      });
      getGlobalMock()!.getBuilder('applications').setResult({
        data: { id: 'a1', job_id: 'j1', seeker_id: 'u1', status: 'pending' }, error: null,
      });

      const app = await ApplicationsService.apply('u1', 'j1', 'Carta');
      expect(app.status).toBe('pending');
    });

    it('Debe lanzar 400 si el empleo no está activo', async () => {
      getGlobalMock()!.getBuilder('jobs').setResult({
        data: { id: 'j2', status: 'closed' }, error: null,
      });

      await expect(ApplicationsService.apply('u1', 'j2'))
        .rejects.toThrow('Esta oferta no está disponible');
    });

    it('Debe lanzar 409 si ya se postuló', async () => {
      getGlobalMock()!.getBuilder('jobs').setResult({
        data: { id: 'j3', status: 'active', title: 'X', company_id: 'c1' }, error: null,
      });
      getGlobalMock()!.getBuilder('applications').setResult({
        data: null, error: { code: '23505' },
      });

      await expect(ApplicationsService.apply('u1', 'j3'))
        .rejects.toThrow('Ya te postulaste a esta oferta');
    });
  });

  describe('getMyApplications', () => {
    it('Debe listar postulaciones del seeker', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({
        data: [{ id: 'a2', status: 'pending', job: { title: 'Dev', company: { name: 'Corp' } } }],
        error: null, count: 1,
      });

      const result = await ApplicationsService.getMyApplications('u1');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('Debe filtrar por estado', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({
        data: [], error: null, count: 0,
      });

      const result = await ApplicationsService.getMyApplications('u1', 1, 10, 'accepted');
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getForJob', () => {
    it('Debe retornar postulantes si el usuario es dueño', async () => {
      getGlobalMock()!.getBuilder('jobs').setResult({ data: { company_id: 'c1' }, error: null });
      getGlobalMock()!.getBuilder('companies').setResult({ data: { owner_id: 'u1' }, error: null });
      getGlobalMock()!.getBuilder('applications').setResult({
        data: [{ id: 'a3', seeker: { full_name: 'Ana', email: 'a@b.com' } }],
        error: null, count: 1,
      });

      const result = await ApplicationsService.getForJob('j1', 'u1');
      expect(result.data).toHaveLength(1);
    });

    it('Debe lanzar 403 si el usuario no es dueño', async () => {
      getGlobalMock()!.getBuilder('jobs').setResult({ data: { company_id: 'c2' }, error: null });
      getGlobalMock()!.getBuilder('companies').setResult({ data: { owner_id: 'otro' }, error: null });

      await expect(ApplicationsService.getForJob('j1', 'u1'))
        .rejects.toThrow('No tienes acceso');
    });
  });

  describe('updateStatus', () => {
    it('Debe actualizar estado y notificar al seeker', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({ data: { job_id: 'j1', seeker_id: 'u2' }, error: null });
      getGlobalMock()!.getBuilder('jobs').setResult({ data: { company_id: 'c1', title: 'Dev' }, error: null });
      getGlobalMock()!.getBuilder('companies').setResult({ data: { owner_id: 'u1' }, error: null });
      getGlobalMock()!.getBuilder('applications').update.mockReturnValue(getGlobalMock()!.getBuilder('applications'));
      getGlobalMock()!.getBuilder('applications').eq.mockReturnValue(getGlobalMock()!.getBuilder('applications'));
      getGlobalMock()!.getBuilder('applications').select.mockReturnValue(getGlobalMock()!.getBuilder('applications'));
      getGlobalMock()!.getBuilder('applications').setResult({
        data: { id: 'a4', status: 'interview' }, error: null,
      });

      const updated = await ApplicationsService.updateStatus('a4', 'u1', 'interview');
      expect(updated.status).toBe('interview');
    });

    it('Debe lanzar 403 si no es dueño de la empresa', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({ data: { job_id: 'j1', seeker_id: 'u2' }, error: null });
      getGlobalMock()!.getBuilder('jobs').setResult({ data: { company_id: 'c2' }, error: null });
      getGlobalMock()!.getBuilder('companies').setResult({ data: { owner_id: 'otro' }, error: null });

      await expect(ApplicationsService.updateStatus('a5', 'u1', 'accepted'))
        .rejects.toThrow('No tienes permisos');
    });
  });

  describe('withdraw', () => {
    it('Debe retirar una postulación', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({ data: null, error: null });
      await expect(ApplicationsService.withdraw('a6', 'u1')).resolves.toBeUndefined();
    });
  });
});
