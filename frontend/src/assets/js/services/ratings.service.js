import api from '../config/api.js';
// ============================================
// LocalWork — Ratings Service (Frontend)
// ============================================

const RatingsService = {

  async create({ ratedId, jobId, score, comment }) {
    return api.post('/ratings', {
      rated_id: ratedId,
      job_id: jobId || null,
      score,
      comment: comment || null,
    });
  },

  async getForUser(userId, { page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    return api.get(`/ratings/user/${userId}?${params.toString()}`);
  },

  async delete(ratingId) {
    return api.delete(`/ratings/${ratingId}`);
  },
};

export default RatingsService;
