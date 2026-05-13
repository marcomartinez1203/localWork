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

router.get('/stats', AdminController.getPlatformStats);
router.get('/verifications/pending', AdminController.getPendingVerifications);
router.patch('/verifications/:userId', AdminController.updateVerificationStatus);

export default router;
