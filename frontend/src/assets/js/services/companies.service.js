import api from '../config/api.js';
// ============================================
// LocalWork — Companies Service (Frontend)
// ============================================

const CompaniesService = {

  async getById(companyId) {
    return api.get(`/companies/${companyId}`);
  },

  async getMyCompany() {
    return api.get('/companies/mine');
  },

  async create(companyData) {
    return api.post('/companies', companyData);
  },

  async update(companyId, updates) {
    return api.put(`/companies/${companyId}`, updates);
  },

  async uploadLogo(companyId, file) {
    const formData = new FormData();
    formData.append('logo', file);
    return api.upload(`/companies/${companyId}/logo`, formData);
  },

  async list({ page = 1, perPage = 20, search } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (search) params.set('search', search);
    return api.get(`/companies?${params.toString()}`);
  },
};

export default CompaniesService;
