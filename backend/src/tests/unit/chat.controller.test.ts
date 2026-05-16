// ============================================
// LocalWork — ChatController Unit Tests
// ============================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatController } from '../../controllers/chat.controller';

vi.mock('../../services/chat.service', () => ({
  ChatService: {
    startConversation: vi.fn(() => Promise.resolve({ conversation_id: 'c1', created: true })),
    listConversations: vi.fn(() => Promise.resolve([])),
    createDirectRequest: vi.fn(() => Promise.resolve({ request_id: 'r1', status: 'pending' })),
    listIncomingRequests: vi.fn(() => Promise.resolve([])),
    respondDirectRequest: vi.fn(() => Promise.resolve({ request_id: 'r1', status: 'accepted' })),
    getRequestStatus: vi.fn(() => Promise.resolve({ can_message: true, pending_outgoing: false, pending_incoming: false, request_id: null, conversation_id: 'c1' })),
    getMessages: vi.fn(() => Promise.resolve({ data: [], page: 1, per_page: 50 })),
    sendMessage: vi.fn(() => Promise.resolve({ id: 'm1', content: 'Hola' })),
    markConversationAsRead: vi.fn(() => Promise.resolve(0)),
    getUnreadCount: vi.fn(() => Promise.resolve(3)),
    uploadAttachment: vi.fn(() => Promise.resolve({ attachment_url: 'url', attachment_name: 'file.pdf', attachment_type: 'application/pdf' })),
  },
}));

describe('ChatController', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockReq = (overrides: any = {}) => ({
    userId: 'u1', userRole: 'seeker', body: {}, params: {}, query: {}, ...overrides,
  } as any);

  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
  };

  const mockNext = vi.fn();

  it('startConversation debe retornar 201 si se creó', async () => {
    const req = mockReq({ body: { application_id: 'a1' } });
    const res = mockRes();
    await ChatController.startConversation(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('startConversation debe retornar 200 si ya existía', async () => {
    const { ChatService } = await import('../../services/chat.service');
    vi.mocked(ChatService.startConversation).mockResolvedValueOnce({ conversation_id: 'c1', created: false });
    const req = mockReq({ body: { application_id: 'a1' } });
    const res = mockRes();
    await ChatController.startConversation(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('startConversation debe lanzar 400 sin application_id', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await ChatController.startConversation(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('listConversations debe retornar lista', async () => {
    const req = mockReq();
    const res = mockRes();
    await ChatController.listConversations(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('createDirectRequest debe retornar 201', async () => {
    const req = mockReq({ body: { target_user_id: 'u2' } });
    const res = mockRes();
    await ChatController.createDirectRequest(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('createDirectRequest debe lanzar 400 sin target_user_id', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await ChatController.createDirectRequest(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('listIncomingRequests debe retornar lista', async () => {
    const req = mockReq();
    const res = mockRes();
    await ChatController.listIncomingRequests(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('respondDirectRequest debe retornar resultado', async () => {
    const req = mockReq({ params: { requestId: 'r1' }, body: { action: 'accepted' } });
    const res = mockRes();
    await ChatController.respondDirectRequest(req, res, mockNext);
    expect(res.json).toHaveBeenCalled();
  });

  it('respondDirectRequest debe lanzar 400 con acción inválida', async () => {
    const req = mockReq({ params: { requestId: 'r1' }, body: { action: 'cancel' } });
    const res = mockRes();
    await ChatController.respondDirectRequest(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('getRequestStatus debe retornar estado', async () => {
    const req = mockReq({ params: { targetUserId: 'u2' } });
    const res = mockRes();
    await ChatController.getRequestStatus(req, res, mockNext);
    expect(res.json).toHaveBeenCalled();
  });

  it('getMessages debe retornar mensajes', async () => {
    const req = mockReq({ params: { conversationId: 'c1' } });
    const res = mockRes();
    await ChatController.getMessages(req, res, mockNext);
    expect(res.json).toHaveBeenCalled();
  });

  it('sendMessage debe retornar mensaje enviado', async () => {
    const req = mockReq({ params: { conversationId: 'c1' }, body: { content: 'Hola' } });
    const res = mockRes();
    await ChatController.sendMessage(req, res, mockNext);
    expect(res.json).toHaveBeenCalled();
  });

  it('markConversationAsRead debe retornar count', async () => {
    const req = mockReq({ params: { conversationId: 'c1' } });
    const res = mockRes();
    await ChatController.markConversationAsRead(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith({ updated: 0 });
  });

  it('getUnreadCount debe retornar count', async () => {
    const req = mockReq();
    const res = mockRes();
    await ChatController.getUnreadCount(req, res, mockNext);
    expect(res.json).toHaveBeenCalledWith({ count: 3 });
  });

  it('uploadAttachment debe retornar datos del archivo', async () => {
    const req = mockReq({ file: { originalname: 'doc.pdf', mimetype: 'application/pdf', buffer: Buffer.from('') } });
    const res = mockRes();
    await ChatController.uploadAttachment(req, res, mockNext);
    expect(res.json).toHaveBeenCalled();
  });
});
