// ============================================
// LocalWork — Chat Service (Frontend)
// ============================================

const ChatService = {
  async startConversation(applicationId) {
    return api.post('/chat/start', { application_id: applicationId });
  },

  async listConversations() {
    return api.get('/chat/conversations');
  },

  async getMessages(conversationId, { page = 1, perPage = 50 } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    return api.get(`/chat/conversations/${conversationId}/messages?${params.toString()}`);
  },

  async sendMessage(conversationId, payload) {
    return api.post(`/chat/conversations/${conversationId}/messages`, payload);
  },

  async markAsRead(conversationId) {
    return api.patch(`/chat/conversations/${conversationId}/read`);
  },

  async getUnreadCount() {
    return api.get('/chat/unread-count');
  },

  async uploadAttachment(file) {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/chat/attachments', formData);
  },
};
