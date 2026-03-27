// ============================================
// LocalWork — Applications Service (Frontend)
// ============================================

const ApplicationsService = {

  async apply(jobId, { coverLetter, resumeFile } = {}) {
    if (resumeFile) {
      const formData = new FormData();
      formData.append('job_id', jobId);
      if (coverLetter) formData.append('cover_letter', coverLetter);
      formData.append('resume', resumeFile);
      return api.upload(`/applications`, formData);
    }

    return api.post('/applications', { job_id: jobId, cover_letter: coverLetter });
  },

  async getMyApplications({ page = 1, perPage = 10, status } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (status) params.set('status', status);
    return api.get(`/applications/mine?${params.toString()}`);
  },

  async getForJob(jobId, { page = 1, perPage = 20 } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    return api.get(`/applications/job/${jobId}?${params.toString()}`);
  },

  async updateStatus(applicationId, status, notes) {
    return api.patch(`/applications/${applicationId}/status`, { status, notes });
  },

  async withdraw(applicationId) {
    return api.delete(`/applications/${applicationId}`);
  },
};
