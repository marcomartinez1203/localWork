// ============================================
// LocalWork — Workers Service (TypeScript)
// ============================================
import api from '../config/api';
import type { WorkerProfile, WorkerFilters } from '@/types';

interface WorkersListResponse {
  data: WorkerProfile[];
  total: number;
  page: number;
  per_page: number;
  total_pages?: number;
}

const WorkersService = {

  async list(filters: WorkerFilters = {}): Promise<WorkersListResponse> {
    const { page = 1, perPage = 12, skill, search, workType } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (skill)    params.set('skill', skill);
    if (search)   params.set('search', search);
    if (workType) params.set('work_type', workType);
    return api.get<WorkersListResponse>(`/workers?${params.toString()}`);
  },

  async getOne(id: string): Promise<WorkerProfile> {
    return api.get<WorkerProfile>(`/workers/${id}`);
  },
};

export default WorkersService;
