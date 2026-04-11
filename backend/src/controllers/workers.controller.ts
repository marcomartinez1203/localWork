// ============================================
// LocalWork — Workers Directory Controller
// ============================================
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';

/** Elimina acentos y normaliza a minúsculas para búsqueda sin diacríticos */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export class WorkersController {

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page    = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 12;
      const skill   = req.query.skill as string | undefined;
      const search  = req.query.search as string | undefined;
      const type    = req.query.work_type as string | undefined;

      const from = (page - 1) * perPage;
      const to   = from + perPage - 1;

      let query = supabaseAdmin
        .from('workers_directory')
        .select('id, full_name, avatar_url, bio, location, skills, work_type, availability, hourly_rate, role', { count: 'exact' })
        .in('work_type', ['freelance', 'both'])
        .range(from, to);

      if (skill) {
        query = query.contains('skills', [skill]);
      }

      if (type && ['freelance', 'both'].includes(type)) {
        query = query.eq('work_type', type);
      }

      if (search) {
        query = query.ilike('search_name', `%${removeAccents(search)}%`);
      }

      const { data, error, count } = await query;
      if (error) throw new AppError('Error al obtener trabajadores', 500);

      res.json({
        data,
        meta: { total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage) },
      });
    } catch (err) { next(err); }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url, bio, location, skills, work_type, availability, hourly_rate, role, education, experience')
        .eq('id', req.params.id)
        .single();

      if (error || !data) throw new AppError('Trabajador no encontrado', 404);
      res.json(data);
    } catch (err) { next(err); }
  }
}
