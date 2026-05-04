// ============================================
// LocalWork — Ratings Service (TypeScript)
// ============================================
import api from '../config/api';
import type { Rating, RatingSummary } from '@/types';

const RatingsService = {

  async create(payload: { ratedId: string; jobId?: string; score: number; comment?: string }): Promise<Rating> {
    return api.post<Rating>('/ratings', {
      rated_id: payload.ratedId,
      job_id: payload.jobId || null,
      score: payload.score,
      comment: payload.comment || null,
    });
  },

  async getForUser(userId: string, filters: { page?: number; perPage?: number } = {}): Promise<RatingSummary> {
    const { page = 1, perPage = 10 } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return api.get<RatingSummary>(`/ratings/user/${userId}?${params.toString()}`);
  },

  async delete(ratingId: string): Promise<unknown> {
    return api.delete(`/ratings/${ratingId}`);
  },
};

export default RatingsService;
