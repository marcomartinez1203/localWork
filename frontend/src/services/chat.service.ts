// ============================================
// LocalWork — Chat Service (TypeScript)
// ============================================
import api from '../config/api';
import type { ConversationSummary, Message } from '@/types';

interface StartConversationResult {
  conversation_id: string;
  created: boolean;
}

interface MessagesResponse {
  data: Message[];
  total: number;
  page: number;
  per_page: number;
}

interface UnreadCountResponse {
  count: number;
}

const ChatService = {
  async startConversation(applicationId: string): Promise<StartConversationResult> {
    return api.post<StartConversationResult>('/chat/start', { application_id: applicationId });
  },

  async sendRequest(targetUserId: string): Promise<unknown> {
    return api.post('/chat/requests', { target_user_id: targetUserId });
  },

  async getIncomingRequests(): Promise<unknown[]> {
    return api.get<unknown[]>('/chat/requests/incoming');
  },

  async respondRequest(requestId: string, action: 'accept' | 'reject'): Promise<unknown> {
    return api.patch(`/chat/requests/${requestId}/respond`, { action });
  },

  async getRequestStatus(targetUserId: string): Promise<unknown> {
    return api.get(`/chat/requests/status/${targetUserId}`);
  },

  async listConversations(): Promise<ConversationSummary[]> {
    return api.get<ConversationSummary[]>('/chat/conversations');
  },

  async getMessages(conversationId: string, filters: { page?: number; perPage?: number } = {}): Promise<MessagesResponse> {
    const { page = 1, perPage = 50 } = filters;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return api.get<MessagesResponse>(`/chat/conversations/${conversationId}/messages?${params.toString()}`);
  },

  async sendMessage(conversationId: string, payload: { content?: string; attachment_url?: string; attachment_name?: string }): Promise<Message> {
    return api.post<Message>(`/chat/conversations/${conversationId}/messages`, payload);
  },

  async markAsRead(conversationId: string): Promise<unknown> {
    return api.patch(`/chat/conversations/${conversationId}/read`);
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<UnreadCountResponse | { count: number }>('/chat/unread-count');
    return (res as UnreadCountResponse).count ?? 0;
  },

  async uploadAttachment(file: File): Promise<{ url: string; name: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<{ url: string; name: string }>('/chat/attachments', formData);
  },
};

export default ChatService;
