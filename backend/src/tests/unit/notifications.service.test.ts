// ============================================
// LocalWork — NotificationsService Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from '../../services/notifications.service';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

import { getGlobalMock } from '../__mocks__/supabase';

describe('NotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalMock()?.builders.clear();
  });

  describe('list', () => {
    it('Debe listar notificaciones del usuario', async () => {
      getGlobalMock()!.getBuilder('notifications').setResult({
        data: [{ id: 'n1', title: 'Nueva postulación', read: false }],
        error: null, count: 1,
      });

      const result = await NotificationsService.list('u1');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('Debe filtrar solo no leídas', async () => {
      getGlobalMock()!.getBuilder('notifications').setResult({
        data: [], error: null, count: 0,
      });

      const result = await NotificationsService.list('u1', 1, 20, true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('Debe marcar una notificación como leída', async () => {
      getGlobalMock()!.getBuilder('notifications').setResult({ data: null, error: null });
      await expect(NotificationsService.markAsRead('n1', 'u1')).resolves.toBeUndefined();
    });
  });

  describe('markAllAsRead', () => {
    it('Debe marcar todas como leídas', async () => {
      getGlobalMock()!.getBuilder('notifications').setResult({ data: null, error: null });
      await expect(NotificationsService.markAllAsRead('u1')).resolves.toBeUndefined();
    });
  });

  describe('getUnreadCount', () => {
    it('Debe contar notificaciones no leídas', async () => {
      getGlobalMock()!.getBuilder('notifications').setResult({ data: null, error: null, count: 5 });

      const count = await NotificationsService.getUnreadCount('u1');
      expect(count).toBe(5);
    });
  });

  describe('create', () => {
    it('Debe crear una notificación', async () => {
      getGlobalMock()!.getBuilder('notifications').setResult({ data: null, error: null });
      await expect(NotificationsService.create('u1', 'system', 'Título', 'Mensaje')).resolves.toBeUndefined();
    });
  });

  describe('createBulk', () => {
    it('Debe crear notificaciones en lote', async () => {
      getGlobalMock()!.getBuilder('notifications').setResult({ data: null, error: null });
      await expect(NotificationsService.createBulk([
        { user_id: 'u1', type: 'system', title: 'T1', message: 'M1' },
        { user_id: 'u2', type: 'system', title: 'T2', message: 'M2' },
      ])).resolves.toBeUndefined();
    });

    it('Debe retornar sin error si el array está vacío', async () => {
      await expect(NotificationsService.createBulk([])).resolves.toBeUndefined();
    });
  });
});
