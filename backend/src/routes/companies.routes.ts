// ============================================
// LocalWork — Companies Routes
// ============================================
import { Router, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

const router = Router();

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
      const name = (req.body?.name || '').toString().trim();
      if (!name) {
        throw new AppError('El nombre de la empresa es requerido', 400);
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
        name,
        nit: req.body?.nit || null,
        description: req.body?.description || null,
        website: req.body?.website || null,
        phone: req.body?.phone || null,
        address: req.body?.address || null,
        location: req.body?.location || null,
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
      const allowed = ['name', 'nit', 'description', 'website', 'phone', 'address', 'location'];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in req.body) updates[key] = req.body[key];
      }

      const { data, error } = await supabaseAdmin
        .from('companies')
        .update(updates)
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
