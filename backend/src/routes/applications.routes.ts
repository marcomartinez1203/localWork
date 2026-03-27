// ============================================
// LocalWork — Applications Routes
// ============================================
import { Router } from 'express';
import { ApplicationsController } from '../controllers/applications.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/',                   authenticate, requireRole('seeker'),   ApplicationsController.apply);
router.get('/mine',                authenticate, requireRole('seeker'),   ApplicationsController.getMyApplications);
router.get('/job/:jobId',          authenticate, requireRole('employer'), ApplicationsController.getForJob);
router.patch('/:id/status',        authenticate, requireRole('employer'), ApplicationsController.updateStatus);
router.delete('/:id',             authenticate, requireRole('seeker'),   ApplicationsController.withdraw);

export default router;
