// ============================================
// LocalWork — Jobs Controller
// ============================================
import { Response, NextFunction } from 'express';
import { JobsService } from '../services/jobs.service';
import { AuthenticatedRequest } from '../types';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';

export class JobsController {

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobsService.list({
        page: parseInt(req.query.page as string) || 1,
        per_page: parseInt(req.query.per_page as string) || 9,
        category: req.query.category as string,
        modality: req.query.modality as any,
        location: req.query.location as string,
        sort: req.query.sort as any,
        search: req.query.search as string,
      });
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getNearbyJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobsService.getNearbyJobs({
        lat: parseFloat(req.query.lat as string),
        lng: parseFloat(req.query.lng as string),
        radius: parseInt(req.query.radius as string) || 5000,
        category: req.query.category as string,
        modality: req.query.modality as any,
        barrio_id: req.query.barrio_id as string,
      });
      res.json(result);
    } catch (err) { next(err); }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobsService.getById(req.params.id);
      res.json(job);
    } catch (err) { next(err); }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Obtener empresa del usuario
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('owner_id', req.userId!)
        .single();

      if (!company) throw new AppError('No tienes una empresa registrada', 400);

      const job = await JobsService.create(company.id, req.body);
      res.status(201).json(job);
    } catch (err) { next(err); }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobsService.update(req.params.id, req.userId!, req.body);
      res.json(job);
    } catch (err) { next(err); }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await JobsService.delete(req.params.id, req.userId!);
      res.json({ message: 'Oferta eliminada' });
    } catch (err) { next(err); }
  }

  static async getMyJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobsService.getByCompanyOwner(req.userId!, {
        page: parseInt(req.query.page as string) || 1,
        per_page: parseInt(req.query.per_page as string) || 10,
        status: req.query.status as any,
      });
      res.json(result);
    } catch (err) { next(err); }
  }

  static async saveJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await JobsService.saveJob(req.userId!, req.params.id);
      res.json({ message: 'Empleo guardado' });
    } catch (err) { next(err); }
  }

  static async unsaveJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await JobsService.unsaveJob(req.userId!, req.params.id);
      res.json({ message: 'Empleo removido de guardados' });
    } catch (err) { next(err); }
  }

  static async getSavedJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const jobs = await JobsService.getSavedJobs(req.userId!);
      res.json({ data: jobs });
    } catch (err) { next(err); }
  }

  static async getCategories(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const categories = await JobsService.getCategories();
      res.json({ data: categories });
    } catch (err) { next(err); }
  }

  static async getBarrios(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const barrios = await JobsService.getBarrios();
      res.json({ data: barrios });
    } catch (err) { next(err); }
  }

  static async getEmployerStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await JobsService.getEmployerStats(req.userId!);
      res.json(stats);
    } catch (err) { next(err); }
  }

  static async getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await JobsService.getStats();
      res.json(stats);
    } catch (err) { next(err); }
  }
}
