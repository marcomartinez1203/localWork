// ============================================
// LocalWork — Companies Service (TypeScript)
// ============================================
import api from '../config/api';
import type { Company } from '@/types';

interface CompaniesListResponse {
  data: Company[];
  total: number;
  page: number;
  per_page: number;
}

const CompaniesService = {

  async getById(companyId: string): Promise<Company> {
    return api.get<Company>(`/companies/${companyId}`);
  },

  async getMyCompany(): Promise<Company> {
    return api.get<Company>('/companies/mine');
  },

  async getAnalytics(): Promise<{ total_jobs: number; total_views: number; total_applications: number; chart_data: { date: string; count: number }[] }> {
    return api.get('/companies/mine/analytics');
  },

  async create(companyData: Partial<Company>): Promise<Company> {
    return api.post<Company>('/companies', companyData);
  },

  async update(companyId: string, updates: Partial<Company>): Promise<Company> {
    return api.put<Company>(`/companies/${companyId}`, updates);
  },

  async uploadLogo(companyId: string, file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return api.upload<{ logo_url: string }>(`/companies/${companyId}/logo`, formData);
  },

  async list(filters: { page?: number; perPage?: number; search?: string } = {}): Promise<CompaniesListResponse> {
    const { page = 1, perPage = 20, search } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (search) params.set('search', search);
    return api.get<CompaniesListResponse>(`/companies?${params.toString()}`);
  },
};

export default CompaniesService;
