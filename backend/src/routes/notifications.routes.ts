// ============================================
// LocalWork — Notifications Routes
// ============================================
import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/',                authenticate, NotificationsController.list);
router.get('/unread-count',    authenticate, NotificationsController.getUnreadCount);
router.patch('/read-all',      authenticate, NotificationsController.markAllAsRead);
router.patch('/:id/read',      authenticate, NotificationsController.markAsRead);

export default router;
