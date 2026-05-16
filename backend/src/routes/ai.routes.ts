import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/ai/cover-letter:
 *   post:
 *     summary: Generar carta de presentación con IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Carta generada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coverLetter:
 *                   type: string
 */
router.post('/cover-letter', authenticate, requireRole('seeker'), AIController.generateCoverLetter);

/**
 * @swagger
 * /api/ai/profile-improvements:
 *   get:
 *     summary: Sugerir mejoras de perfil con IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sugerencias en Markdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestions:
 *                   type: string
 */
router.get('/profile-improvements', authenticate, AIController.suggestProfileImprovements);

export default router;
