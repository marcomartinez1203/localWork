// ============================================
// LocalWork — Admin Routes
// ============================================
import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas de admin requieren autenticación y rol 'admin'
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Estadísticas globales de la plataforma (solo admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Métricas generales (usuarios, empleos, postulaciones, etc.)
 *       403:
 *         description: Acceso restringido a administradores
 */
router.get('/stats', AdminController.getPlatformStats);

/**
 * @swagger
 * /api/admin/verifications/pending:
 *   get:
 *     summary: Solicitudes de verificación de identidad pendientes (solo admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Lista de usuarios con documentos pendientes de revisión
 */
router.get('/verifications/pending', AdminController.getPendingVerifications);

/**
 * @swagger
 * /api/admin/verifications/{userId}:
 *   patch:
 *     summary: Aprobar o rechazar verificación de identidad (solo admin)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [verified, rejected]
 *     responses:
 *       200:
 *         description: Estado de verificación actualizado. Si es `verified`, el usuario recibe la insignia de confianza (check azul).
 */
router.patch('/verifications/:userId', AdminController.updateVerificationStatus);

export default router;
