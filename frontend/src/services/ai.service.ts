import api from '../config/api';

const AIService = {
  async generateCoverLetter(jobId: string): Promise<string> {
    const res = await api.post<{ coverLetter: string }>('/ai/cover-letter', { jobId });
    return res.coverLetter;
  },

  async suggestProfileImprovements(): Promise<string> {
    const res = await api.get<{ suggestions: string }>('/ai/profile-improvements');
    return res.suggestions;
  }
};

export default AIService;
