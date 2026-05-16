// ============================================
// LocalWork — Notifications Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { Notification, NotificationType, PaginatedResponse } from '../types';
import webpush from '../utils/web-push';
import { env } from '../config/env';

export class NotificationsService {

  static async list(
    userId: string,
    page = 1,
    perPage = 20,
    unreadOnly = false
  ): Promise<PaginatedResponse<Notification>> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) { logger.error('NotificationsService.list failed', { error }); throw new AppError('Error al obtener notificaciones', 500); }

    return {
      data: (data || []) as Notification[],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) { logger.error('NotificationsService.markAsRead failed', { error }); throw new AppError('Error al marcar como leída', 500); }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) { logger.error('NotificationsService.markAllAsRead failed', { error }); throw new AppError('Error al marcar todas como leídas', 500); }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) { logger.error('NotificationsService.getUnreadCount failed', { error }); throw new AppError('Error al contar notificaciones', 500); }
    return count || 0;
  }

  static async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({ user_id: userId, type, title, message, data: data ?? null });

    if (error) { logger.error('NotificationsService.create failed', { error }); throw new AppError('Error al crear notificación', 500); }
    
    // Disparar push en background
    NotificationsService.sendPushNotification(userId, { title, body: message, type, data }).catch(err => {
      logger.error('Error sending push notification', { error: err });
    });
  }

  static async createBulk(
    notifications: Array<{
      user_id: string;
      type: NotificationType;
      title: string;
      message: string;
      data?: Record<string, unknown>;
    }>
  ): Promise<void> {
    if (notifications.length === 0) return;

    const { error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications.map(n => ({
        user_id: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data ?? null,
      })));

    if (error) { logger.error('NotificationsService.createBulk failed', { error }); }
    // No lanzar error: las notificaciones son no-críticas
    
    // Opcionalmente: Disparar push notif para todas en bulk (aquí solo disparamos si hace falta)
    notifications.forEach(n => {
       NotificationsService.sendPushNotification(n.user_id, { title: n.title, body: n.message, type: n.type, data: n.data }).catch(() => {});
    });
  }

  // Web Push API
  static async subscribe(userId: string, subscription: any): Promise<void> {
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) throw new AppError('Suscripción inválida', 400);

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      }, { onConflict: 'user_id, endpoint' });

    if (error) { logger.error('NotificationsService.subscribe failed', { error }); throw new AppError('Error al guardar suscripción push', 500); }
  }

  static async sendPushNotification(userId: string, payload: any): Promise<void> {
    if (!env.vapidPublicKey || !env.vapidPrivateKey) return;

    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);
      
    if (error || !subs || subs.length === 0) return;

    const payloadString = JSON.stringify({
      notification: {
        title: payload.title,
        body: payload.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        data: {
          url: payload.type === 'chat' ? '/messages' : payload.type === 'application' ? '/dashboard' : '/',
          ...payload.data
        }
      }
    });

    for (const sub of subs) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      try {
        await webpush.sendNotification(pushSubscription, payloadString);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // El usuario ha revocado el permiso o la suscripción expiró, borrar de la bd
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          logger.error('Failed to send push notification', { error: err });
        }
      }
    }
  }
}
