// ============================================
// LocalWork — Notifications Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { Notification, PaginatedResponse } from '../types';

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
    if (error) throw new AppError('Error al obtener notificaciones', 500);

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

    if (error) throw new AppError('Error al marcar como leída', 500);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw new AppError('Error al marcar todas como leídas', 500);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw new AppError('Error al contar notificaciones', 500);
    return count || 0;
  }
}
