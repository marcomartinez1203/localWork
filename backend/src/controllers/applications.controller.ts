// ============================================
// LocalWork — Applications Controller
// ============================================
import { Response, NextFunction } from 'express';
import { ApplicationsService } from '../services/applications.service';
import { AuthenticatedRequest } from '../types';
import { supabaseAdmin } from '../config/supabase';

export class ApplicationsController {

  static async apply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let resumeUrl: string | undefined = req.body.resume_url;

      if (req.file) {
        const ext = req.file.originalname.split('.').pop();
        const path = `resumes/${req.userId}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('uploads')
          .upload(path, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseAdmin.storage
          .from('uploads')
          .getPublicUrl(path);

        resumeUrl = urlData.publicUrl;
      }

      const application = await ApplicationsService.apply(
        req.userId!,
        req.body.job_id,
        req.body.cover_letter,
        resumeUrl
      );
      res.status(201).json(application);
    } catch (err) { next(err); }
  }

  static async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ApplicationsService.getMyApplications(
        req.userId!,
        parseInt(req.query.page as string) || 1,
        Math.min(parseInt(req.query.per_page as string) || 10, 50),
        req.query.status as any
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getForJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ApplicationsService.getForJob(
        req.params.jobId,
        req.userId!,
        parseInt(req.query.page as string) || 1,
        Math.min(parseInt(req.query.per_page as string) || 20, 50)
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getMineForJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationsService.getMineForJob(req.userId!, req.params.jobId);
      res.json(application || null);
    } catch (err) { next(err); }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationsService.updateStatus(
        req.params.id,
        req.userId!,
        req.body.status,
        req.body.notes
      );
      res.json(application);
    } catch (err) { next(err); }
  }

  static async withdraw(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await ApplicationsService.withdraw(req.params.id, req.userId!);
      res.json({ message: 'Postulación retirada' });
    } catch (err) { next(err); }
  }
}
