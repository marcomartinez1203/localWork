import api from '../config/api';

const AIService = {
  async generateCoverLetter(jobId: string): Promise<string> {
    const res = await api.post<{ coverLetter: string }>('/ai/cover-letter', { jobId });
    return res.coverLetter;
  },

  async suggestProfileImprovements(): Promise<string> {
    const res = await api.get<{ suggestions: string }>('/ai/profile-improvements');
    return res.suggestions;
  },

  /**
   * Versión streaming: llama al backend con SSE y va entregando el texto
   * conforme llega. Llama onChunk(text) por cada fragmento recibido.
   */
  async suggestProfileImprovementsStream(onChunk: (text: string) => void): Promise<void> {
    const token = localStorage.getItem('lw_token');
    const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';
    const resp = await fetch(`${apiUrl}/ai/profile-improvements/stream`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });

    if (!resp.ok) throw new Error(`Error ${resp.status}`);
    if (!resp.body) throw new Error('No body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Procesar líneas SSE completas
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch { /* ignorar líneas no-JSON */ }
      }
    }
  }
};

export default AIService;
