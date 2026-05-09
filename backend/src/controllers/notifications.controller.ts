// ============================================
// LocalWork — Notifications Controller
// ============================================
import { Response, NextFunction } from 'express';
import { NotificationsService } from '../services/notifications.service';
import { AuthenticatedRequest } from '../types';

export class NotificationsController {

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await NotificationsService.list(
        req.userId!,
        parseInt(req.query.page as string) || 1,
        Math.min(parseInt(req.query.per_page as string) || 20, 50),
        req.query.unread === 'true'
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAsRead(req.params.id, req.userId!);
      res.json({ message: 'Notificación marcada como leída' });
    } catch (err) { next(err); }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAllAsRead(req.userId!);
      res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (err) { next(err); }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await NotificationsService.getUnreadCount(req.userId!);
      res.json({ count });
    } catch (err) { next(err); }
  }
}
