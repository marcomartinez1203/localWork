// ============================================
// LocalWork — Jobs Routes
// ============================================
import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Públicas
router.get('/categories',      JobsController.getCategories);
router.get('/barrios',         JobsController.getBarrios);
router.get('/nearby',          JobsController.getNearby);
router.get('/employer-stats',  authenticate, requireRole('employer'), JobsController.getEmployerStats);
router.get('/stats',           JobsController.getStats);
router.get('/',           JobsController.list);
router.get('/saved',      authenticate, JobsController.getSavedJobs);
router.get('/mine',       authenticate, requireRole('employer'), JobsController.getMyJobs);
router.get('/:id',        JobsController.getById);

// Protegidas (empleador)
router.post('/',          authenticate, requireRole('employer'), JobsController.create);
router.put('/:id',        authenticate, requireRole('employer'), JobsController.update);
router.delete('/:id',     authenticate, requireRole('employer'), JobsController.delete);

// Favoritos (buscador)
router.post('/:id/save',   authenticate, JobsController.saveJob);
router.delete('/:id/save', authenticate, JobsController.unsaveJob);

export default router;
