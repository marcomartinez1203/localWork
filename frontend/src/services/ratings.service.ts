// ============================================
// LocalWork — Ratings Service (TypeScript)
// ============================================
import api from '../config/api';
import type { Rating, RatingSummary } from '@/types';

export interface PostServiceRatingPayload {
  applicationId: string;
  score: number;
  punctuality?: number;
  quality?: number;
  communication?: number;
  wouldRecommend?: boolean;
  comment?: string;
}

const RatingsService = {

  // General rating (from worker directory)
  async create(payload: { ratedId: string; jobId?: string; score: number; comment?: string }): Promise<Rating> {
    return api.post<Rating>('/ratings', {
      rated_id: payload.ratedId,
      job_id: payload.jobId || null,
      score: payload.score,
      comment: payload.comment || null,
    });
  },

  // Post-service rating (linked to application)
  async createPostService(payload: PostServiceRatingPayload): Promise<Rating> {
    return api.post<Rating>('/ratings/post-service', {
      application_id: payload.applicationId,
      score: payload.score,
      punctuality: payload.punctuality,
      quality: payload.quality,
      communication: payload.communication,
      would_recommend: payload.wouldRecommend,
      comment: payload.comment || null,
    });
  },

  // Check if current user has rated an application
  async checkForApplication(applicationId: string): Promise<{ rated: boolean; rating_id?: string }> {
    return api.get<{ rated: boolean; rating_id?: string }>(`/ratings/check/${applicationId}`);
  },

  // Get ratings for a user (with breakdown)
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
