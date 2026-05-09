// ============================================
// LocalWork — Auth Controller
// ============================================
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';

const registerSchema = z.object({
  email:        z.string().email('Correo inválido'),
  password:     z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  full_name:    z.string().min(2, 'El nombre es requerido').max(100),
  role:         z.enum(['seeker', 'employer']).default('seeker'),
  work_type:    z.enum(['employee', 'freelance', 'both']).optional(),
  phone:        z.string().max(20).optional(),
  company_name: z.string().max(150).optional(),
  company_nit:  z.string().max(30).optional(),
});

const loginSchema = z.object({
  email:    z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Correo inválido'),
});

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  phone: z.string().max(20).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  skills: z.array(z.string()).max(20).optional(),
  work_type: z.enum(['employee', 'freelance', 'both']).nullable().optional(),
  service_public: z.boolean().optional(),
  availability: z.string().max(50).nullable().optional(),
  hourly_rate: z.number().nonnegative('La tarifa no puede ser negativa').nullable().optional(),
  education: z.array(z.any()).optional(),
  experience: z.array(z.any()).optional(),
});

export class AuthController {

  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const result = await AuthService.register(parsed.data);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const result = await AuthService.login(parsed.data);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async logout(_req: AuthenticatedRequest, res: Response) {
    res.json({ message: 'Sesión cerrada exitosamente' });
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getProfile(req.userId!);
      res.json(profile);
    } catch (err) { next(err); }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      
      const profile = await AuthService.updateProfile(req.userId!, parsed.data as any);
      res.json({ user: profile });
    } catch (err) { next(err); }
  }

  static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      await AuthService.resetPassword(parsed.data.email);
      res.json({ message: 'Se envió un correo para restablecer tu contraseña' });
    } catch (err) { next(err); }
  }
}
