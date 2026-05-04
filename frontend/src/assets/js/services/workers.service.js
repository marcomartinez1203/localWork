import api from '../config/api.js';
// ============================================
// LocalWork — Workers Service (Frontend)
// ============================================

const WorkersService = {

  async list({ page = 1, perPage = 12, skill, search, workType } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (skill)    params.set('skill', skill);
    if (search)   params.set('search', search);
    if (workType) params.set('work_type', workType);
    return api.get(`/workers?${params.toString()}`);
  },

  async getOne(id) {
    return api.get(`/workers/${id}`);
  },
};

export default WorkersService;
