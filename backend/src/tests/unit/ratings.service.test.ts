// ============================================
// LocalWork — RatingsService Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RatingsService } from '../../services/ratings.service';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

import { getGlobalMock } from '../__mocks__/supabase';

describe('RatingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalMock()?.builders.clear();
  });

  describe('create (general)', () => {
    it('Debe crear una calificación general', async () => {
      getGlobalMock()!.getBuilder('ratings').setResult({
        data: { id: 'r1', score: 5 }, error: null,
      });

      const result = await RatingsService.create('u1', { rated_id: 'u2', score: 5 });
      expect(result).toHaveProperty('score', 5);
    });

    it('Debe lanzar 400 si auto-calificación', async () => {
      await expect(RatingsService.create('u1', { rated_id: 'u1', score: 5 }))
        .rejects.toThrow('No puedes calificarte a ti mismo');
    });

    it('Debe lanzar 400 si score fuera de rango', async () => {
      await expect(RatingsService.create('u1', { rated_id: 'u2', score: 10 }))
        .rejects.toThrow('La calificación debe ser entre 1 y 5');
    });

    it('Debe lanzar 409 si ya calificó', async () => {
      getGlobalMock()!.getBuilder('ratings').setResult({
        data: null, error: { code: '23505' },
      });

      await expect(RatingsService.create('u1', { rated_id: 'u2', score: 4 }))
        .rejects.toThrow('Ya calificaste a esta persona');
    });
  });

  describe('createPostService', () => {
    it('Debe crear calificación post-servicio como seeker', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({
        data: {
          id: 'a1', seeker_id: 'u1', job_id: 'j1', status: 'completed',
          job: { title: 'Dev', company_id: 'c1', company: { owner_id: 'u2', name: 'Corp' } },
        }, error: null,
      });
      getGlobalMock()!.getBuilder('ratings').setResult({
        data: { id: 'r2', score: 5 }, error: null,
      });
      getGlobalMock()!.getBuilder('profiles').setResult({ data: { full_name: 'Ana' }, error: null });

      const result = await RatingsService.createPostService('u1', {
        application_id: 'a1', score: 5, punctuality: 5, quality: 5, communication: 5, would_recommend: true,
      });
      expect(result).toHaveProperty('score', 5);
    });

    it('Debe lanzar 400 si la postulación no está completada', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({
        data: {
          id: 'a2', seeker_id: 'u1', job_id: 'j1', status: 'accepted',
          job: { title: 'Dev', company_id: 'c1', company: { owner_id: 'u2', name: 'Corp' } },
        }, error: null,
      });

      await expect(RatingsService.createPostService('u1', {
        application_id: 'a2', score: 5,
      })).rejects.toThrow('Solo puedes calificar cuando el contrato ha finalizado');
    });

    it('Debe lanzar 403 si el usuario no es parte de la postulación', async () => {
      getGlobalMock()!.getBuilder('applications').setResult({
        data: {
          id: 'a3', seeker_id: 'u1', job_id: 'j1', status: 'completed',
          job: { title: 'Dev', company_id: 'c1', company: { owner_id: 'u2', name: 'Corp' } },
        }, error: null,
      });

      await expect(RatingsService.createPostService('u3', {
        application_id: 'a3', score: 5,
      })).rejects.toThrow('No eres parte de esta postulación');
    });
  });

  describe('getForUser', () => {
    it('Debe retornar calificaciones con desglose', async () => {
      getGlobalMock()!.getBuilder('ratings').setResult({
        data: [{ id: 'r3', score: 5, rater: { full_name: 'Ana' } }],
        error: null, count: 1,
      });
      getGlobalMock()!.supabaseAdmin.rpc
        .mockResolvedValueOnce({ data: 5, error: null }) // avg_rating
        .mockResolvedValueOnce({ data: [{ avg_score: 5, total_ratings: 1, recommend_pct: 100 }], error: null }); // rating_breakdown

      const result = await RatingsService.getForUser('u2');
      expect(result.total).toBe(1);
      expect(result.average).toBe(5);
    });
  });

  describe('delete', () => {
    it('Debe eliminar una calificación propia', async () => {
      getGlobalMock()!.getBuilder('ratings').setResult({ data: null, error: null });
      await expect(RatingsService.delete('r4', 'u1')).resolves.toBeUndefined();
    });
  });
});
