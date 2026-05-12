// ============================================
// LocalWork — Workers Directory Controller
// ============================================
import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { removeAccents } from '../utils/string';
import { AuthenticatedRequest } from '../types';
import { NotificationsService } from '../services/notifications.service';

export class WorkersController {

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page    = parseInt(req.query.page as string) || 1;
      const perPage = Math.min(parseInt(req.query.per_page as string) || 12, 50);
      const skill   = req.query.skill as string | undefined;
      const search  = req.query.search as string | undefined;
      const type    = req.query.work_type as string | undefined;

      const from = (page - 1) * perPage;
      const to   = from + perPage - 1;

      const buildQuery = (withServicePublicFilter: boolean) => {
        let query = supabaseAdmin
          .from('workers_directory')
          .select('id, full_name, avatar_url, bio, location, skills, work_type, availability, hourly_rate, role, verification_status, portfolio_images', { count: 'exact' })
          .in('work_type', ['freelance', 'both'])
          .range(from, to);

        if (withServicePublicFilter) {
          query = query.eq('service_public', true);
        }

        if (skill) {
          query = query.contains('skills', [skill]);
        }

        if (type && ['freelance', 'both'].includes(type)) {
          query = query.eq('work_type', type);
        }

        if (search) {
          const sanitized = removeAccents(search.replace(/[%_(),.]/g, '').trim());
          if (sanitized) {
            query = query.ilike('search_name', `%${sanitized}%`);
          }
        }
        return query;
      };

      let { data, error, count } = await buildQuery(true);

      // Compatibilidad temporal: si aún no existe service_public en la vista, degradar filtro.
      if (error && (error as { code?: string }).code === '42703') {
        ({ data, error, count } = await buildQuery(false));
      }

      if (error) { console.error('[WorkersController.list]', error); throw new AppError('Error al obtener trabajadores', 500); }

      res.json({
        data,
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      });
    } catch (err) { next(err); }
  }

  static async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url, bio, location, skills, work_type, availability, hourly_rate, role, education, experience, verification_status, portfolio_images')
        .eq('id', req.params.id)
        .single();

      if (error) { console.error('[WorkersController.getOne]', error); throw new AppError('Trabajador no encontrado', 404); }
      if (!data) throw new AppError('Trabajador no encontrado', 404);

      // Notificar al trabajador si un empleador autenticado visita su perfil
      if (req.userId && req.userRole === 'employer' && data.id !== req.userId) {
        NotificationsService.create(
          data.id,
          'profile_viewed',
          'Alguien vio tu perfil',
          'Un empleador ha visitado tu perfil.'
        ).catch(err => console.error('[WorkersController.getOne] profile_viewed error', err));
      }

      res.json(data);
    } catch (err) { next(err); }
  }
}
