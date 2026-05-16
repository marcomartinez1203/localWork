// ============================================
// LocalWork — Ratings Routes
// ============================================
import { Router, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { RatingsService } from '../services/ratings.service';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Rate limit dedicado para endpoints públicos de ratings (anti-scraping)
const publicRatingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Demasiadas solicitudes de calificaciones, intenta más tarde' },
});

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Crear calificación general (desde directorio de trabajadores)
 *     tags: [Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rated_id, score]
 *             properties:
 *               rated_id:
 *                 type: string
 *                 format: uuid
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Calificación registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       403:
 *         description: No puedes calificarte a ti mismo
 */
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { rated_id, job_id, score, comment } = req.body;

    if (!rated_id || !score) {
      res.status(400).json({ message: 'rated_id y score son requeridos' });
      return;
    }

    const rating = await RatingsService.create(req.userId!, {
      rated_id,
      job_id,
      score: parseInt(score),
      comment,
    });

    res.status(201).json(rating);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/ratings/post-service:
 *   post:
 *     summary: Crear calificación post-servicio (vinculada a contrato completado)
 *     tags: [Ratings]
 *     description: Solo disponible cuando la postulación tiene estado `completed`. Permite calificación bidireccional con desglose por subcategorías.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [application_id, score]
 *             properties:
 *               application_id:
 *                 type: string
 *                 format: uuid
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               punctuality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               quality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               communication:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               would_recommend:
 *                 type: boolean
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Calificación post-servicio creada
 *       403:
 *         description: Contrato no completado o ya calificado
 */
// POST /ratings/post-service — Create a post-service rating (linked to application)
router.post('/post-service', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { application_id, score, punctuality, quality, communication, would_recommend, comment } = req.body;

    if (!application_id || !score) {
      res.status(400).json({ message: 'application_id y score son requeridos' });
      return;
    }

    const rating = await RatingsService.createPostService(req.userId!, {
      application_id,
      score: parseInt(score),
      punctuality: punctuality ? parseInt(punctuality) : undefined,
      quality: quality ? parseInt(quality) : undefined,
      communication: communication ? parseInt(communication) : undefined,
      would_recommend,
      comment,
    });

    res.status(201).json(rating);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/ratings/check/{applicationId}:
 *   get:
 *     summary: Verificar si ya califiqué esta postulación
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Estado de calificación para esta postulación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rated: { type: boolean }
 *                 rating: { $ref: '#/components/schemas/Rating', nullable: true }
 */
// GET /ratings/check/:applicationId — Check if current user has rated this application
router.get('/check/:applicationId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await RatingsService.checkForApplication(req.params.applicationId, req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/ratings/user/{userId}:
 *   get:
 *     summary: Calificaciones y reputación de un usuario
 *     tags: [Ratings]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: per_page
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: Promedio general, desglose por categorías, % de recomendación y lista de reviews
 */
// GET /ratings/user/:userId — Get ratings for a user (with breakdown)
router.get('/user/:userId', publicRatingsLimiter, optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await RatingsService.getForUser(
      req.params.userId,
      parseInt(req.query.page as string) || 1,
      Math.min(parseInt(req.query.per_page as string) || 10, 50)
    );
    res.json(result);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/ratings/{id}:
 *   delete:
 *     summary: Eliminar calificación propia
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Calificación eliminada
 *       403:
 *         description: No eres el autor de esta calificación
 */
// DELETE /ratings/:id — Delete own rating
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await RatingsService.delete(req.params.id, req.userId!);
    res.json({ message: 'Calificación eliminada' });
  } catch (err) { next(err); }
});

export default router;

