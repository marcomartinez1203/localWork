// ============================================
// LocalWork — Admin Controller
// ============================================
import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';

export class AdminController {
  
  // 1. Obtener estadísticas de la plataforma
  static async getPlatformStats(_req: Request, res: Response): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('platform_stats')
      .select('*')
      .single();

    if (error) throw new AppError('Error obteniendo estadísticas', 500, error);
    res.json(data);
  }

  // 2. Listar verificaciones pendientes
  static async getPendingVerifications(_req: Request, res: Response): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, verification_status, identity_document_url, created_at')
      .eq('verification_status', 'pending');

    if (error) throw new AppError('Error obteniendo verificaciones pendientes', 500, error);
    res.json(data);
  }

  // 3. Aprobar/Rechazar verificación
  static async updateVerificationStatus(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { status } = req.body; // 'verified' o 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      throw new AppError('Estado inválido', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ verification_status: status })
      .eq('id', userId)
      .select('id, verification_status')
      .single();

    if (error) throw new AppError('Error actualizando estado de verificación', 500, error);

    // TODO: Enviar notificación al usuario
    res.json({ message: `Usuario marcado como ${status}`, data });
  }
}
