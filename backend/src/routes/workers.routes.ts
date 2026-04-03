// ============================================
// LocalWork — Workers Directory Routes
// ============================================
import { Router } from 'express';
import { WorkersController } from '../controllers/workers.controller';

const router = Router();

router.get('/',    WorkersController.list);
router.get('/:id', WorkersController.getOne);

export default router;
