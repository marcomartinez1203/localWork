// ============================================
// LocalWork — NotificationsController Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsController } from '../../controllers/notifications.controller';

vi.mock('../../services/notifications.service', () => ({
  NotificationsService: {
    list: vi.fn(() => Promise.resolve({ data: [], total: 0, page: 1, per_page: 20, total_pages: 0 })),
    markAsRead: vi.fn(() => Promise.resolve()),
    markAllAsRead: vi.fn(() => Promise.resolve()),
    getUnreadCount: vi.fn(() => Promise.resolve(5)),
  },
}));

describe('NotificationsController', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockReq = (overrides: any = {}) => ({
    userId: 'u1', query: {}, params: {}, ...overrides,
  } as any);

  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
  };

  const mockNext = vi.fn();

  it('list debe retornar notificaciones', async () => {
    const req = mockReq();
    const res = mockRes();
    await NotificationsController.list(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 0 }));
  });

  it('markAsRead debe retornar mensaje', async () => {
    const req = mockReq({ params: { id: 'n1' } });
    const res = mockRes();
    await NotificationsController.markAsRead(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it('markAllAsRead debe retornar mensaje', async () => {
    const req = mockReq();
    const res = mockRes();
    await NotificationsController.markAllAsRead(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it('getUnreadCount debe retornar count', async () => {
    const req = mockReq();
    const res = mockRes();
    await NotificationsController.getUnreadCount(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith({ count: 5 });
  });
});
