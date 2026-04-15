// ============================================
// LocalWork — Workers Directory Routes
// ============================================
import { Router } from 'express';
import { WorkersController } from '../controllers/workers.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',    WorkersController.list);
router.get('/:id', optionalAuth, WorkersController.getOne);

export default router;
