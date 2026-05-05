// ============================================
// LocalWork — Ratings Routes
// ============================================
import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { RatingsService } from '../services/ratings.service';
import { AuthenticatedRequest } from '../types';

const router = Router();

// POST /ratings — Create a general rating (from worker directory)
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

// GET /ratings/check/:applicationId — Check if current user has rated this application
router.get('/check/:applicationId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await RatingsService.checkForApplication(req.params.applicationId, req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /ratings/user/:userId — Get ratings for a user (with breakdown)
router.get('/user/:userId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await RatingsService.getForUser(
      req.params.userId,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.per_page as string) || 10
    );
    res.json(result);
  } catch (err) { next(err); }
});

// DELETE /ratings/:id — Delete own rating
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await RatingsService.delete(req.params.id, req.userId!);
    res.json({ message: 'Calificación eliminada' });
  } catch (err) { next(err); }
});

export default router;
