// ============================================
// LocalWork — Applications Service (TypeScript)
// ============================================
import api from '../config/api';
import type { Application, ApplicationStatus, ApplicationFilters } from '@/types';

interface ApplicationsListResponse {
  data: Application[];
  total: number;
  page: number;
  per_page: number;
}

const ApplicationsService = {

  async apply(jobId: string, payload: { coverLetter?: string; resumeFile?: File } = {}): Promise<Application> {
    if (payload.resumeFile) {
      const formData = new FormData();
      formData.append('job_id', jobId);
      if (payload.coverLetter) formData.append('cover_letter', payload.coverLetter);
      formData.append('resume', payload.resumeFile);
      return api.upload<Application>(`/applications`, formData);
    }

    return api.post<Application>('/applications', { job_id: jobId, cover_letter: payload.coverLetter });
  },

  async getMyApplications(filters: ApplicationFilters = {}): Promise<ApplicationsListResponse> {
    const { page = 1, perPage = 10, status } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.set('status', status);
    return api.get<ApplicationsListResponse>(`/applications/mine?${params.toString()}`);
  },

  async getForJob(jobId: string, filters: { page?: number; perPage?: number } = {}): Promise<ApplicationsListResponse> {
    const { page = 1, perPage = 20 } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return api.get<ApplicationsListResponse>(`/applications/job/${jobId}?${params.toString()}`);
  },

  async getMineForJob(jobId: string): Promise<Application | null> {
    return api.get<Application | null>(`/applications/job/${jobId}/mine`);
  },

  async updateStatus(applicationId: string, status: ApplicationStatus, notes?: string): Promise<Application> {
    return api.patch<Application>(`/applications/${applicationId}/status`, { status, notes });
  },

  async withdraw(applicationId: string): Promise<unknown> {
    return api.delete(`/applications/${applicationId}`);
  },
};

export default ApplicationsService;
