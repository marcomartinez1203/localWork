// ============================================
// LocalWork — Companies Routes
// ============================================
import { Router, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(2, 'El nombre de la empresa es requerido').max(150),
  nit: z.string().max(30).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  website: z.string().url('URL inválida').max(200).nullable().optional().or(z.literal('')),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
});

const updateCompanySchema = companySchema.partial();

const router = Router();

// GET /companies/mine/analytics — obtener analíticas para el dashboard
router.get(
  '/mine/analytics',
  authenticate,
  requireRole('employer'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { JobsService } = await import('../services/jobs.service');
      const data = await JobsService.getEmployerAnalytics(req.userId!);
      if (!data) {
        res.status(404).json({ message: 'No tienes una empresa registrada' });
        return;
      }
      res.json(data);
    } catch (err) { next(err); }
  }
);

// GET /companies/mine — empresa del empleador autenticado
router.get(
  '/mine',
  authenticate,
  requireRole('employer'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select('id, name, nit, description, logo_url, website, phone, address, location, verified')
        .eq('owner_id', req.userId!)
        .single();

      if (error || !data) {
        res.status(404).json({ message: 'No tienes una empresa registrada' });
        return;
      }

      res.json(data);
    } catch (err) { next(err); }
  }
);

// POST /companies — crear empresa para empleador autenticado
router.post(
  '/',
  authenticate,
  requireRole('employer'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = companySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }

      const { data: existing } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('owner_id', req.userId!)
        .maybeSingle();

      if (existing?.id) {
        throw new AppError('Ya tienes una empresa registrada', 409);
      }

      const payload = {
        owner_id: req.userId!,
        ...(parsed.data as any),
      };

      const { data, error } = await supabaseAdmin
        .from('companies')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw new AppError('No se pudo crear la empresa', 400);
      res.status(201).json(data);
    } catch (err) { next(err); }
  }
);

// PUT /companies/:id — actualizar empresa
router.put(
  '/:id',
  authenticate,
  requireRole('employer'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = updateCompanySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }

      const { data, error } = await supabaseAdmin
        .from('companies')
        .update(parsed.data as any)
        .eq('id', req.params.id)
        .eq('owner_id', req.userId!)
        .select()
        .single();

      if (error || !data) throw new AppError('No se pudo actualizar la empresa', 400);
      res.json(data);
    } catch (err) { next(err); }
  }
);

export default router;
