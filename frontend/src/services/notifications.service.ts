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

  async subscribeToPushNotifications(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications are not supported by the browser.');
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // URL base64 to Uint8Array helper
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('VAPID public key not found');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      await api.post('/notifications/subscribe', subscription.toJSON());
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  },
};

export default NotificationsService;
