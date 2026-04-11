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
  role:         z.enum(['seeker', 'employer']).optional(),
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
      const profile = await AuthService.updateProfile(req.userId!, req.body);
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
