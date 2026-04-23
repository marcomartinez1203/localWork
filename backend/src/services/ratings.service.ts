// ============================================
// LocalWork — Ratings Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';

export interface RatingInput {
  rated_id: string;
  job_id?: string;
  score: number;
  comment?: string;
}

export interface RatingWithProfile {
  id: string;
  rater_id: string;
  rated_id: string;
  job_id: string | null;
  score: number;
  comment: string | null;
  created_at: string;
  rater: { full_name: string; avatar_url: string | null };
}

export class RatingsService {

  static async create(raterId: string, input: RatingInput): Promise<unknown> {
    // Cannot rate yourself
    if (raterId === input.rated_id) {
      throw new AppError('No puedes calificarte a ti mismo', 400);
    }

    // Validate score range
    if (input.score < 1 || input.score > 5) {
      throw new AppError('La calificación debe ser entre 1 y 5', 400);
    }

    const { data, error } = await supabaseAdmin
      .from('ratings')
      .insert({
        rater_id: raterId,
        rated_id: input.rated_id,
        job_id: input.job_id || null,
        score: input.score,
        comment: input.comment || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('Ya calificaste a esta persona', 409);
      if (error.code === '23503') throw new AppError('Usuario no encontrado', 404);
      console.error('[RatingsService.create]', error);
      throw new AppError('Error al crear la calificación', 500);
    }

    return data;
  }

  static async getForUser(
    userId: string,
    page = 1,
    perPage = 10
  ): Promise<{ data: RatingWithProfile[]; average: number; total: number; page: number; per_page: number; total_pages: number }> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        *,
        rater:profiles!ratings_rater_id_fkey(full_name, avatar_url)
      `, { count: 'exact' })
      .eq('rated_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[RatingsService.getForUser]', error);
      throw new AppError('Error al obtener calificaciones', 500);
    }

    // Calculate average
    const { data: avgData } = await supabaseAdmin
      .rpc('avg_rating', { p_user_id: userId });

    return {
      data: (data || []) as RatingWithProfile[],
      average: avgData ?? 0,
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  static async delete(ratingId: string, raterId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('ratings')
      .delete()
      .eq('id', ratingId)
      .eq('rater_id', raterId);

    if (error) {
      console.error('[RatingsService.delete]', error);
      throw new AppError('Error al eliminar la calificación', 500);
    }
  }
}
