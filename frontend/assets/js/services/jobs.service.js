// ============================================
// LocalWork — Jobs Service (Frontend)
// ============================================

const JobsService = {

  async list({ page = 1, perPage = 9, category, modality, location, sort, search } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('per_page', perPage);
    if (category && category !== 'all') params.set('category', category);
    if (modality && modality !== 'all') params.set('modality', modality);
    if (location && location !== 'all') params.set('location', location);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);

    return api.get(`/jobs?${params.toString()}`);
  },

  async getById(jobId) {
    return api.get(`/jobs/${jobId}`);
  },

  async create(jobData) {
    return api.post('/jobs', jobData);
  },

  async update(jobId, updates) {
    return api.put(`/jobs/${jobId}`, updates);
  },

  async delete(jobId) {
    return api.delete(`/jobs/${jobId}`);
  },

  // ── Empleos del empleador actual ──
  async getMyJobs({ page = 1, perPage = 10, status } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (status) params.set('status', status);
    return api.get(`/jobs/mine?${params.toString()}`);
  },

  // ── Guardar / quitar de favoritos ──
  async save(jobId) {
    return api.post(`/jobs/${jobId}/save`);
  },

  async unsave(jobId) {
    return api.delete(`/jobs/${jobId}/save`);
  },

  async getSavedJobs() {
    return api.get('/jobs/saved');
  },

  // ── Categorías ──
  async getCategories() {
    return api.get('/jobs/categories');
  },

  // ── Estadísticas ──
  async getStats() {
    return api.get('/jobs/stats');
  },
};
