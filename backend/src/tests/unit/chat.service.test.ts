import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService } from '../../services/chat.service';
import { getGlobalMock } from '../__mocks__/supabase';

vi.mock('../../config/supabase', async () => {
  const { createMockSupabaseModule } = await import('../__mocks__/supabase');
  return createMockSupabaseModule();
});

describe('ChatService', () => {
  beforeEach(() => { vi.clearAllMocks(); getGlobalMock()?.builders.clear(); });

  const mockProfile = (role: string) => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { role }, error: null });
  };

  it('sendMessage ok', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('messages').count.mockResolvedValue({ count:0, error:null, data:null });
    getGlobalMock()!.getBuilder('messages').setResult({ data: { id:'m1', content:'Hola' }, error: null });
    const msg = await ChatService.sendMessage('c1','u1',{ content:'Hola' });
    expect(msg.content).toBe('Hola');
  });

  it('sendMessage 400 vacío', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    await expect(ChatService.sendMessage('c1','u1',{ content:'   ' })).rejects.toThrow('El mensaje está vacío');
  });

  it('sendMessage 400 palabra bloqueada', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    await expect(ChatService.sendMessage('c1','u1',{ content:'spam' })).rejects.toThrow('palabras no permitidas');
  });

  it('sendMessage 403 no participante', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u3', employer_id:'u4' }, error: null });
    await expect(ChatService.sendMessage('c1','u1',{ content:'Hola' })).rejects.toThrow('No tienes acceso');
  });

  it('getMessages ok', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('messages').setResult({ data: [{ id:'m1', content:'Hi' }], error: null });
    const r = await ChatService.getMessages('c1','u1');
    expect(r.data).toHaveLength(1);
  });

  it('markConversationAsRead', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('messages').setResult({ data: [{ id:'m1' },{ id:'m2' }], error: null });
    expect(await ChatService.markConversationAsRead('c1','u1')).toBe(2);
  });

  it('createDirectRequest auto-solicitud 400', async () => {
    await expect(ChatService.createDirectRequest('u1','u1')).rejects.toThrow('No puedes enviarte solicitud a ti mismo');
  });

  it('createDirectRequest 404 target', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: null, error: null });
    await expect(ChatService.createDirectRequest('u1','u99')).rejects.toThrow('Usuario no encontrado');
  });

  it('createDirectRequest conversación existente', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1' }, error: null });
    const r = await ChatService.createDirectRequest('u1','u2');
    expect(r.status).toBe('accepted');
    expect(r.conversation_id).toBe('c1');
  });

  it('createDirectRequest límite 30/hora', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('conversations').setResult({ data: null, error: null });
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: null, error: null, count: 30 });
    await expect(ChatService.createDirectRequest('u1','u2')).rejects.toThrow('límite de solicitudes por hora');
  });

  it('createDirectRequest solicitud pendiente entrante', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('conversations').setResult({ data: null, error: null });
    getGlobalMock()!.getBuilder('chat_requests').count.mockResolvedValue({ count:0, error:null, data:null });
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: { id:'r1', sender_id:'u2', target_id:'u1', status:'pending' }, error: null });
    await expect(ChatService.createDirectRequest('u1','u2')).rejects.toThrow('Ya tienes una solicitud pendiente de este usuario');
  });

  it('createDirectRequest crear nueva', async () => {
    getGlobalMock()!.getBuilder('profiles').setResult({ data: { id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('conversations').setResult({ data: null, error: null });
    getGlobalMock()!.getBuilder('chat_requests').count.mockResolvedValue({ count:0, error:null, data:null });
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: null, error: null });
    getGlobalMock()!.getBuilder('chat_requests').insert.mockReturnValue(getGlobalMock()!.getBuilder('chat_requests'));
    getGlobalMock()!.getBuilder('chat_requests').select.mockReturnValue(getGlobalMock()!.getBuilder('chat_requests'));
    getGlobalMock()!.getBuilder('chat_requests').single.mockResolvedValue({ data: { id:'r2' }, error: null });
    const r = await ChatService.createDirectRequest('u1','u2');
    expect(r.status).toBe('pending');
  });

  it('respondDirectRequest rechazar', async () => {
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: { id:'req1', sender_id:'u1', target_id:'u2', status:'pending' }, error: null });
    getGlobalMock()!.getBuilder('chat_requests').update.mockReturnValue(getGlobalMock()!.getBuilder('chat_requests'));
    getGlobalMock()!.getBuilder('chat_requests').eq.mockReturnValue(getGlobalMock()!.getBuilder('chat_requests'));
    const r = await ChatService.respondDirectRequest('req1','u2','rejected');
    expect(r.status).toBe('rejected');
  });

  it('respondDirectRequest aceptar', async () => {
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: { id:'req1', sender_id:'u1', target_id:'u2', status:'pending' }, error: null });
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('chat_requests').update.mockReturnValue(getGlobalMock()!.getBuilder('chat_requests'));
    getGlobalMock()!.getBuilder('chat_requests').eq.mockReturnValue(getGlobalMock()!.getBuilder('chat_requests'));
    const r = await ChatService.respondDirectRequest('req1','u2','accepted');
    expect(r.status).toBe('accepted');
    expect(r.conversation_id).toBe('c1');
  });

  it('respondDirectRequest 404', async () => {
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: null, error: { message:'Not found' } });
    await expect(ChatService.respondDirectRequest('r99','u2','accepted')).rejects.toThrow('Solicitud no encontrada');
  });

  it('respondDirectRequest 403 no es target', async () => {
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: { id:'r1', sender_id:'u1', target_id:'u2', status:'pending' }, error: null });
    await expect(ChatService.respondDirectRequest('r1','u3','accepted')).rejects.toThrow('No puedes responder esta solicitud');
  });

  it('respondDirectRequest 400 ya respondida', async () => {
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: { id:'r1', sender_id:'u1', target_id:'u2', status:'accepted' }, error: null });
    await expect(ChatService.respondDirectRequest('r1','u2','accepted')).rejects.toThrow('ya fue respondida');
  });

  it('listIncomingRequests', async () => {
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: [{ id:'r1', status:'pending', sender:{ id:'u1', full_name:'Ana' } }], error: null });
    const r = await ChatService.listIncomingRequests('u2');
    expect(r).toHaveLength(1);
  });

  it('getRequestStatus puede mensajear', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1' }, error: null });
    const r = await ChatService.getRequestStatus('u1','u2');
    expect(r.can_message).toBe(true);
  });

  it('getRequestStatus pending_outgoing', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: null, error: null });
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: { id:'r1', sender_id:'u1', target_id:'u2', status:'pending' }, error: null });
    const r = await ChatService.getRequestStatus('u1','u2');
    expect(r.pending_outgoing).toBe(true);
  });

  it('getRequestStatus pending_incoming', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: null, error: null });
    getGlobalMock()!.getBuilder('chat_requests').setResult({ data: { id:'r1', sender_id:'u2', target_id:'u1', status:'pending' }, error: null });
    const r = await ChatService.getRequestStatus('u1','u2');
    expect(r.pending_incoming).toBe(true);
  });

  it('getUnreadCount 0 sin conversaciones', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: [], error: null });
    expect(await ChatService.getUnreadCount('u1')).toBe(0);
  });

  it('getUnreadCount con mensajes no leídos', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: [{ id:'c1' }], error: null });
    getGlobalMock()!.getBuilder('messages').setResult({ data: null, error: null, count: 3 });
    expect(await ChatService.getUnreadCount('u1')).toBe(3);
  });

  it('listConversations vacío', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: [], error: null });
    const r = await ChatService.listConversations('u1');
    expect(r).toEqual([]);
  });

  it('listConversations con datos', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: [{ id:'c1', application_id:null, seeker_id:'u1', employer_id:'u2', created_at:'2024-01-01', last_message_at:'2024-01-02' }], error: null });
    getGlobalMock()!.getBuilder('messages').setResult({ data: [], error: null });
    getGlobalMock()!.getBuilder('profiles').setResult({ data: [{ id:'u2', full_name:'Ana', avatar_url:null }], error: null });
    const r = await ChatService.listConversations('u1');
    expect(r).toHaveLength(1);
    expect(r[0].other_user.full_name).toBe('Ana');
  });

  it('uploadAttachment ok', async () => {
    const file = { originalname:'doc.pdf', mimetype:'application/pdf', buffer: Buffer.from('x') } as any;
    const r = await ChatService.uploadAttachment(file,'u1');
    expect(r.attachment_name).toBe('doc.pdf');
    expect(r.attachment_type).toBe('application/pdf');
    expect(r.attachment_url).toBeTruthy();
  });

  it('startConversation conversación existente', async () => {
    getGlobalMock()!.getBuilder('conversations').setResult({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    getGlobalMock()!.getBuilder('conversations').select.mockReturnValue(getGlobalMock()!.getBuilder('conversations'));
    getGlobalMock()!.getBuilder('conversations').eq.mockReturnValue(getGlobalMock()!.getBuilder('conversations'));
    getGlobalMock()!.getBuilder('conversations').maybeSingle.mockResolvedValue({ data: { id:'c1', seeker_id:'u1', employer_id:'u2' }, error: null });
    const r = await ChatService.startConversation('u1','seeker','app1');
    expect(r.conversation_id).toBe('c1');
    expect(r.created).toBe(false);
  });

  it('startConversation sin rol 403', async () => {
    await expect(ChatService.startConversation('u1', undefined as any,'app1')).rejects.toThrow('Rol de usuario no identificado');
  });
});
