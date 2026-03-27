// ============================================
// LocalWork — Auth Routes
// ============================================
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register',       AuthController.register);
router.post('/login',          AuthController.login);
router.post('/logout',         authenticate, AuthController.logout);
router.get('/profile',         authenticate, AuthController.getProfile);
router.put('/profile',         authenticate, AuthController.updateProfile);
router.post('/reset-password', AuthController.resetPassword);

export default router;
