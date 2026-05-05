// ============================================
// LocalWork — Ratings Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { NotificationsService } from './notifications.service';

export interface RatingInput {
  rated_id: string;
  job_id?: string;
  score: number;
  comment?: string;
}

export interface PostServiceRatingInput {
  application_id: string;
  score: number;
  punctuality?: number;
  quality?: number;
  communication?: number;
  would_recommend?: boolean;
  comment?: string;
}

export interface RatingWithProfile {
  id: string;
  rater_id: string;
  rated_id: string;
  job_id: string | null;
  application_id: string | null;
  rating_type: string;
  score: number;
  punctuality: number | null;
  quality: number | null;
  communication: number | null;
  would_recommend: boolean | null;
  comment: string | null;
  is_visible: boolean;
  created_at: string;
  rater: { full_name: string; avatar_url: string | null };
}

export interface RatingBreakdown {
  avg_score: number;
  avg_punctuality: number;
  avg_quality: number;
  avg_communication: number;
  total_ratings: number;
  recommend_pct: number;
}

export class RatingsService {

  // ── General rating (existing, from worker directory) ──
  static async create(raterId: string, input: RatingInput): Promise<unknown> {
    if (raterId === input.rated_id) {
      throw new AppError('No puedes calificarte a ti mismo', 400);
    }

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
        rating_type: 'general',
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

  // ── Post-service rating (new, linked to application) ──
  static async createPostService(raterId: string, input: PostServiceRatingInput): Promise<unknown> {
    // 1. Validate score
    if (input.score < 1 || input.score > 5) {
      throw new AppError('La calificación debe ser entre 1 y 5', 400);
    }

    // 2. Get the application with job + company info
    const { data: app, error: appErr } = await supabaseAdmin
      .from('applications')
      .select(`
        id, seeker_id, job_id, status,
        job:jobs!inner(title, company_id,
          company:companies!inner(owner_id, name)
        )
      `)
      .eq('id', input.application_id)
      .single();

    if (appErr || !app) {
      throw new AppError('Postulación no encontrada', 404);
    }

    // 3. Only allow rating for finished applications
    if (!['accepted', 'rejected'].includes(app.status)) {
      throw new AppError('Solo puedes calificar postulaciones finalizadas (aceptadas o rechazadas)', 400);
    }

    // 4. Determine who is being rated
    const job = app.job as unknown as { title: string; company_id: string; company: { owner_id: string; name: string } };
    const employerId = job.company.owner_id;
    const seekerId = app.seeker_id;

    let ratedId: string;
    if (raterId === seekerId) {
      // Seeker is rating the employer
      ratedId = employerId;
    } else if (raterId === employerId) {
      // Employer is rating the seeker
      ratedId = seekerId;
    } else {
      throw new AppError('No eres parte de esta postulación', 403);
    }

    // 5. Can't rate yourself
    if (raterId === ratedId) {
      throw new AppError('No puedes calificarte a ti mismo', 400);
    }

    // 6. Insert rating
    const { data, error } = await supabaseAdmin
      .from('ratings')
      .insert({
        rater_id: raterId,
        rated_id: ratedId,
        job_id: app.job_id,
        application_id: input.application_id,
        rating_type: 'post_service',
        score: input.score,
        punctuality: input.punctuality ?? null,
        quality: input.quality ?? null,
        communication: input.communication ?? null,
        would_recommend: input.would_recommend ?? null,
        comment: input.comment || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('Ya calificaste esta postulación', 409);
      console.error('[RatingsService.createPostService]', error);
      throw new AppError('Error al crear la calificación', 500);
    }

    // 7. Notify the rated user (fire-and-forget)
    const { data: raterProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', raterId)
      .single();

    NotificationsService.create(
      ratedId,
      'new_rating',
      'Nueva calificación recibida',
      `${raterProfile?.full_name ?? 'Alguien'} te calificó con ${input.score} estrella${input.score > 1 ? 's' : ''}.`,
      { rating_id: (data as { id: string }).id, score: input.score }
    ).catch(err => console.error('[RatingsService.createPostService] notification error', err));

    return data;
  }

  // ── Check if user already rated an application ──
  static async checkForApplication(applicationId: string, userId: string): Promise<{ rated: boolean; rating_id?: string }> {
    const { data } = await supabaseAdmin
      .from('ratings')
      .select('id')
      .eq('application_id', applicationId)
      .eq('rater_id', userId)
      .maybeSingle();

    return { rated: !!data, rating_id: data?.id };
  }

  // ── Get ratings for user ──
  static async getForUser(
    userId: string,
    page = 1,
    perPage = 10
  ): Promise<{ data: RatingWithProfile[]; average: number; total: number; breakdown: RatingBreakdown; page: number; per_page: number; total_pages: number }> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count, error } = await supabaseAdmin
      .from('ratings')
      .select(`
        *,
        rater:profiles!ratings_rater_id_fkey(full_name, avatar_url)
      `, { count: 'exact' })
      .eq('rated_id', userId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[RatingsService.getForUser]', error);
      throw new AppError('Error al obtener calificaciones', 500);
    }

    // Get average
    const { data: avgData } = await supabaseAdmin
      .rpc('avg_rating', { p_user_id: userId });

    // Get breakdown
    const { data: breakdownData } = await supabaseAdmin
      .rpc('rating_breakdown', { p_user_id: userId });

    const breakdown: RatingBreakdown = breakdownData?.[0] ?? {
      avg_score: 0,
      avg_punctuality: 0,
      avg_quality: 0,
      avg_communication: 0,
      total_ratings: 0,
      recommend_pct: 0,
    };

    return {
      data: (data || []) as RatingWithProfile[],
      average: avgData ?? 0,
      total: count || 0,
      breakdown,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    };
  }

  // ── Delete rating ──
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
