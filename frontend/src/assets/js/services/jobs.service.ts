// ============================================
// LocalWork — Jobs Service (TypeScript)
// ============================================
import api from '../config/api';
import type { Job, JobFilters, NearbyFilters, Category, Barrio } from '@/types';

interface JobsListResponse {
  data: Job[];
  total: number;
  page: number;
  per_page: number;
}

const JobsService = {

  async list(filters: JobFilters = {}): Promise<JobsListResponse> {
    const { page = 1, perPage = 9, category, modality, location, sort, search } = filters;
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (category && category !== 'all') params.set('category', category);
    if (modality && modality !== 'all') params.set('modality', modality);
    if (location && location !== 'all') params.set('location', location);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);

    return api.get<JobsListResponse>(`/jobs?${params.toString()}`);
  },

  async getById(jobId: string): Promise<Job> {
    return api.get<Job>(`/jobs/${jobId}`);
  },

  async getNearby(filters: NearbyFilters): Promise<Job[]> {
    const params = new URLSearchParams();
    if (filters.lat) params.append('lat', String(filters.lat));
    if (filters.lng) params.append('lng', String(filters.lng));
    if (filters.radius) params.append('radius', String(filters.radius));
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.modality && filters.modality !== 'all') params.append('modality', filters.modality);
    if (filters.barrio_id && filters.barrio_id !== 'all') params.append('barrio_id', filters.barrio_id);

    return api.get<Job[]>(`/jobs/nearby?${params.toString()}`);
  },

  async create(jobData: Partial<Job>): Promise<Job> {
    return api.post<Job>('/jobs', jobData);
  },

  async update(jobId: string, updates: Partial<Job>): Promise<Job> {
    return api.put<Job>(`/jobs/${jobId}`, updates);
  },

  async delete(jobId: string): Promise<unknown> {
    return api.delete(`/jobs/${jobId}`);
  },

  async getMyJobs(filters: { page?: number; perPage?: number; status?: string } = {}): Promise<JobsListResponse> {
    const { page = 1, perPage = 10, status } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set('status', status);
    return api.get<JobsListResponse>(`/jobs/mine?${params.toString()}`);
  },

  async save(jobId: string): Promise<unknown> {
    return api.post(`/jobs/${jobId}/save`);
  },

  async unsave(jobId: string): Promise<unknown> {
    return api.delete(`/jobs/${jobId}/save`);
  },

  async getSavedJobs(): Promise<Job[]> {
    const result = await api.get<Job[] | { data?: Job[]; items?: Job[]; saved?: Job[] }>('/jobs/saved');
    if (Array.isArray(result)) return result;
    if (Array.isArray((result as { data?: Job[] }).data)) return (result as { data: Job[] }).data;
    if (Array.isArray((result as { items?: Job[] }).items)) return (result as { items: Job[] }).items;
    if (Array.isArray((result as { saved?: Job[] }).saved)) return (result as { saved: Job[] }).saved;
    return [];
  },

  async getCategories(): Promise<Category[]> {
    return api.get<Category[]>('/jobs/categories');
  },

  async getBarrios(): Promise<Barrio[]> {
    return api.get<Barrio[]>('/jobs/barrios');
  },

  async getStats(): Promise<Record<string, unknown>> {
    return api.get('/jobs/stats');
  },
};

export default JobsService;
