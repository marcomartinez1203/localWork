// ============================================
// LocalWork — Route Index
// ============================================
import { Router } from 'express';
import authRoutes from './auth.routes';
import jobsRoutes from './jobs.routes';
import applicationsRoutes from './applications.routes';
import notificationsRoutes from './notifications.routes';
import uploadRoutes from './upload.routes';
import workersRoutes from './workers.routes';
import companiesRoutes from './companies.routes';
import ratingsRoutes from './ratings.routes';
import chatRoutes from './chat.routes';
import adminRoutes from './admin.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth',          authRoutes);
router.use('/jobs',          jobsRoutes);
router.use('/applications',  applicationsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/upload',        uploadRoutes);
router.use('/workers',       workersRoutes);
router.use('/companies',     companiesRoutes);
router.use('/ratings',       ratingsRoutes);
router.use('/chat',          chatRoutes);
router.use('/admin',         adminRoutes);
router.use('/ai',            aiRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica el estado de salud del API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                 service:
 *                   type: string
 */
// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LocalWork API',
  });
});

export default router;
