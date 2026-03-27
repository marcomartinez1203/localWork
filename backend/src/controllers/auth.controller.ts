// ============================================
// LocalWork — Auth Controller
// ============================================
import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

export class AuthController {

  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
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
      await AuthService.resetPassword(req.body.email);
      res.json({ message: 'Se envió un correo para restablecer tu contraseña' });
    } catch (err) { next(err); }
  }
}
