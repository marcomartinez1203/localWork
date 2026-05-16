import { Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';
import { AuthService } from '../services/auth.service';
import { JobsService } from '../services/jobs.service';

export class AIController {
  static async generateCoverLetter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.body;
      if (!jobId) throw new AppError('El jobId es requerido', 400);

      const profile = await AuthService.getProfile(req.userId!);
      if (profile.role !== 'seeker') throw new AppError('Solo trabajadores pueden generar cartas', 403);

      const job = await JobsService.getById(jobId);
      if (!job) throw new AppError('Oferta no encontrada', 404);

      const coverLetter = await AIService.generateCoverLetter(profile, job);
      res.json({ coverLetter });
    } catch (err) { next(err); }
  }

  static async suggestProfileImprovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getProfile(req.userId!);
      const suggestions = await AIService.suggestProfileImprovements(profile);
      res.json({ suggestions });
    } catch (err) { next(err); }
  }
}
