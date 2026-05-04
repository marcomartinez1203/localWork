// ============================================
// LocalWork — Notifications Service (Frontend)
// ============================================

import api from '../config/api.js'

const NotificationsService = {

  async list({ page = 1, perPage = 20, unreadOnly = false } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (unreadOnly) params.set('unread', 'true');
    return api.get(`/notifications?${params.toString()}`);
  },

  async markAsRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead() {
    return api.patch('/notifications/read-all');
  },

  async getUnreadCount() {
    return api.get('/notifications/unread-count');
  },
};

export default NotificationsService;
