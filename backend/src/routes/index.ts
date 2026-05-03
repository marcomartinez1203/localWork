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

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LocalWork API',
  });
});

export default router;
