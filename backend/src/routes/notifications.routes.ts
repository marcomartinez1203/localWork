// ============================================
// LocalWork — Notifications Routes
// ============================================
import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Listar notificaciones del usuario
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Lista de notificaciones (leídas y no leídas)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/', authenticate, NotificationsController.list);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Contador de notificaciones no leídas
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Cantidad de notificaciones pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
router.get('/unread-count', authenticate, NotificationsController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Todas marcadas como leídas
 */
router.patch('/read-all', authenticate, NotificationsController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.patch('/:id/read', authenticate, NotificationsController.markAsRead);

export default router;
