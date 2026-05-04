// ============================================
// LocalWork — Notifications Service (TypeScript)
// ============================================
import api from '../config/api';
import type { Notification } from '@/types';

interface NotificationsListResponse {
  data: Notification[];
  total: number;
  page: number;
  per_page: number;
}

interface UnreadCountResponse {
  count: number;
}

const NotificationsService = {

  async list(filters: { page?: number; perPage?: number; unreadOnly?: boolean } = {}): Promise<NotificationsListResponse> {
    const { page = 1, perPage = 20, unreadOnly = false } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (unreadOnly) params.set('unread', 'true');
    return api.get<NotificationsListResponse>(`/notifications?${params.toString()}`);
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    return api.patch<Notification>(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<unknown> {
    return api.patch('/notifications/read-all');
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<UnreadCountResponse | { count: number }>('/notifications/unread-count');
    return (res as UnreadCountResponse).count ?? 0;
  },
};

export default NotificationsService;
