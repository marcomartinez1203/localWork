// ============================================
// LocalWork — Auth Middleware
// ============================================
import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest, UserRole } from '../types';

/**
 * Verificar token JWT de Supabase
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token de autenticación requerido' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verificar token con Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ message: 'Token inválido o expirado' });
      return;
    }

    // Obtener rol del perfil
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.userId = user.id;
    req.userRole = profile?.role || 'seeker';
    req.accessToken = token;

    next();
  } catch (_err) {
    res.status(500).json({ message: 'Error de autenticación' });
  }
}

/**
 * Verificar que el usuario tenga un rol específico
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({
        message: 'No tienes permisos para realizar esta acción',
      });
      return;
    }
    next();
  };
}

/**
 * Autenticación opcional (no falla si no hay token)
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);

      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        req.userId = user.id;
        req.userRole = profile?.role || 'seeker';
        req.accessToken = token;
      }
    }
  } catch {
    // Silently continue without auth
  }

  next();
}
