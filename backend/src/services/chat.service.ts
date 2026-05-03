// ============================================
// LocalWork — Chat Service (Backend)
// ============================================
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest, ChatRequest, Conversation, Message } from '../types';
import { NotificationsService } from './notifications.service';

type StartConversationResult = {
  conversation_id: string;
  created: boolean;
};

type ConversationSummary = {
  id: string;
  application_id: string | null;
  last_message_at: string | null;
  created_at: string;
  kind: 'application' | 'direct';
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message: {
    content: string | null;
    created_at: string;
    sender_id: string;
    attachment_url: string | null;
    attachment_name: string | null;
  } | null;
  unread_count: number;
  application: {
    id: string;
    status: string;
    job_title: string;
  } | null;
};

type SendMessageInput = {
  content?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
};

type RequestSummary = {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  responded_at: string | null;
  conversation_id: string | null;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  target: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
};

export class ChatService {
  private static readonly BLOCKED_WORDS = [
    'hp', 'hpta', 'hijueputa', 'gonorrea', 'marica', 'mk', 'puta', 'puto', 'spam', 'estafa',
  ];

  static async startConversation(
    userId: string,
    userRole: AuthenticatedRequest['userRole'],
    applicationId: string
  ): Promise<StartConversationResult> {
    if (!userRole) throw new AppError('Rol de usuario no identificado', 403);

    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (existing?.id) {
      await this.assertConversationParticipant(existing.id, userId);
      return { conversation_id: existing.id, created: false };
    }

    const { seekerId, employerId } = await this.validateApplicationAccess(userId, userRole, applicationId);

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        application_id: applicationId,
        seeker_id: seekerId,
        employer_id: employerId,
        created_by: userId,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: conflict } = await supabaseAdmin
          .from('conversations')
          .select('id')
          .eq('application_id', applicationId)
          .single();
        if (conflict?.id) {
          await this.assertConversationParticipant(conflict.id, userId);
          return { conversation_id: conflict.id, created: false };
        }
      }
      console.error('[ChatService.startConversation]', error);
      throw new AppError('No se pudo iniciar la conversación', 500);
    }

    return { conversation_id: data.id, created: true };
  }

  static async createDirectRequest(senderId: string, targetId: string): Promise<{
    request_id: string;
    status: 'pending' | 'accepted';
    conversation_id?: string;
  }> {
    if (senderId === targetId) throw new AppError('No puedes enviarte solicitud a ti mismo', 400);

    const { data: target } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', targetId)
      .maybeSingle();
    if (!target) throw new AppError('Usuario no encontrado', 404);

    const existingConversation = await this.findDirectConversation(senderId, targetId);
    if (existingConversation) {
      return { request_id: '', status: 'accepted', conversation_id: existingConversation.id };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: sentCount } = await supabaseAdmin
      .from('chat_requests')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', senderId)
      .gte('created_at', oneHourAgo);
    if ((sentCount || 0) >= 30) {
      throw new AppError('Has alcanzado el límite de solicitudes por hora', 429);
    }

    const { data: pending } = await supabaseAdmin
      .from('chat_requests')
      .select('id, sender_id, target_id, status')
      .or(
        `and(sender_id.eq.${senderId},target_id.eq.${targetId},status.eq.pending),and(sender_id.eq.${targetId},target_id.eq.${senderId},status.eq.pending)`
      )
      .maybeSingle();

    if (pending?.id) {
      if (pending.sender_id === senderId) {
        return { request_id: pending.id, status: 'pending' };
      }
      throw new AppError('Ya tienes una solicitud pendiente de este usuario', 409);
    }

    const { data, error } = await supabaseAdmin
      .from('chat_requests')
      .insert({ sender_id: senderId, target_id: targetId, status: 'pending' })
      .select('id')
      .single();

    if (error) {
      console.error('[ChatService.createDirectRequest]', error);
      throw new AppError('No se pudo crear la solicitud de chat', 500);
    }

    void NotificationsService.create(
      targetId,
      'system',
      'Nueva solicitud de chat',
      'Tienes una nueva solicitud de conversación',
      { kind: 'chat_request', request_id: data.id, sender_id: senderId }
    ).catch(err => console.error('[ChatService.createDirectRequest.notification]', err));

    return { request_id: data.id, status: 'pending' };
  }

  static async respondDirectRequest(
    requestId: string,
    userId: string,
    action: 'accepted' | 'rejected'
  ): Promise<{ request_id: string; status: 'accepted' | 'rejected'; conversation_id?: string }> {
    const { data: request, error } = await supabaseAdmin
      .from('chat_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !request) throw new AppError('Solicitud no encontrada', 404);
    const row = request as ChatRequest;
    if (row.target_id !== userId) throw new AppError('No puedes responder esta solicitud', 403);
    if (row.status !== 'pending') throw new AppError('Esta solicitud ya fue respondida', 400);

    if (action === 'rejected') {
      const { error: updateError } = await supabaseAdmin
        .from('chat_requests')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', requestId);
      if (updateError) throw new AppError('No se pudo rechazar la solicitud', 500);
      return { request_id: requestId, status: 'rejected' };
    }

    const conversation = await this.getOrCreateDirectConversation(row.sender_id, row.target_id, userId);
    const { error: acceptError } = await supabaseAdmin
      .from('chat_requests')
      .update({
        status: 'accepted',
        conversation_id: conversation.id,
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId);
    if (acceptError) throw new AppError('No se pudo aceptar la solicitud', 500);

    return { request_id: requestId, status: 'accepted', conversation_id: conversation.id };
  }

  static async listIncomingRequests(userId: string): Promise<RequestSummary[]> {
    const { data, error } = await supabaseAdmin
      .from('chat_requests')
      .select(`
        id,
        status,
        created_at,
        responded_at,
        conversation_id,
        sender:profiles!chat_requests_sender_id_fkey(id, full_name, avatar_url),
        target:profiles!chat_requests_target_id_fkey(id, full_name, avatar_url)
      `)
      .eq('target_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw new AppError('No se pudieron cargar las solicitudes', 500);

    return (data || []).map((row: any) => ({
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      responded_at: row.responded_at,
      conversation_id: row.conversation_id,
      sender: Array.isArray(row.sender) ? row.sender[0] : row.sender,
      target: Array.isArray(row.target) ? row.target[0] : row.target,
    }));
  }

  static async getRequestStatus(userId: string, targetId: string): Promise<{
    can_message: boolean;
    pending_outgoing: boolean;
    pending_incoming: boolean;
    request_id: string | null;
    conversation_id: string | null;
  }> {
    const conversation = await this.findDirectConversation(userId, targetId);
    if (conversation) {
      return {
        can_message: true,
        pending_outgoing: false,
        pending_incoming: false,
        request_id: null,
        conversation_id: conversation.id,
      };
    }

    const { data } = await supabaseAdmin
      .from('chat_requests')
      .select('id, sender_id, target_id, status')
      .or(
        `and(sender_id.eq.${userId},target_id.eq.${targetId},status.eq.pending),and(sender_id.eq.${targetId},target_id.eq.${userId},status.eq.pending)`
      )
      .maybeSingle();

    if (!data) {
      return {
        can_message: false,
        pending_outgoing: false,
        pending_incoming: false,
        request_id: null,
        conversation_id: null,
      };
    }

    return {
      can_message: false,
      pending_outgoing: data.sender_id === userId,
      pending_incoming: data.target_id === userId,
      request_id: data.id,
      conversation_id: null,
    };
  }

  static async listConversations(userId: string): Promise<ConversationSummary[]> {
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select('id, application_id, seeker_id, employer_id, created_at, last_message_at')
      .or(`seeker_id.eq.${userId},employer_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw new AppError('No se pudieron cargar las conversaciones', 500);
    const rows = (conversations || []) as Array<Conversation>;
    if (!rows.length) return [];

    const conversationIds = rows.map(c => c.id);
    const otherUserIds = rows.map(c => (c.seeker_id === userId ? c.employer_id : c.seeker_id));
    const applicationIds = rows.map(c => c.application_id).filter((id): id is string => Boolean(id));

    const [{ data: messages }, { data: profiles }, { data: apps }, { data: unreadRows }] = await Promise.all([
      supabaseAdmin
        .from('messages')
        .select('conversation_id, content, created_at, sender_id, attachment_url, attachment_name')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', otherUserIds),
      applicationIds.length
        ? supabaseAdmin
          .from('applications')
          .select(`id,status,job:jobs!inner(title)`)
          .in('id', applicationIds)
        : Promise.resolve({ data: [], error: null } as any),
      supabaseAdmin
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .is('read_at', null),
    ]);

    const latestByConversation = new Map<string, ConversationSummary['last_message']>();
    for (const message of messages || []) {
      if (!latestByConversation.has(message.conversation_id)) {
        latestByConversation.set(message.conversation_id, {
          content: message.content,
          created_at: message.created_at,
          sender_id: message.sender_id,
          attachment_url: message.attachment_url,
          attachment_name: message.attachment_name,
        });
      }
    }

    const profileMap = new Map<string, { id: string; full_name: string; avatar_url: string | null }>();
    for (const profile of profiles || []) {
      profileMap.set(profile.id, profile);
    }

    const appMap = new Map<string, { id: string; status: string; job_title: string }>();
    for (const app of apps || []) {
      const row = app as any;
      const jobTitle = Array.isArray(row.job) ? row.job[0]?.title : row.job?.title;
      appMap.set(row.id, { id: row.id, status: row.status, job_title: jobTitle || 'Oferta' });
    }

    const unreadMap = new Map<string, number>();
    for (const unread of unreadRows || []) {
      unreadMap.set(unread.conversation_id, (unreadMap.get(unread.conversation_id) || 0) + 1);
    }

    return rows.map(conversation => {
      const otherId = conversation.seeker_id === userId ? conversation.employer_id : conversation.seeker_id;
      const app = conversation.application_id ? appMap.get(conversation.application_id) || null : null;
      return {
        id: conversation.id,
        application_id: conversation.application_id,
        created_at: conversation.created_at,
        last_message_at: conversation.last_message_at,
        kind: conversation.application_id ? 'application' : 'direct',
        other_user: profileMap.get(otherId) || { id: otherId, full_name: 'Usuario', avatar_url: null },
        last_message: latestByConversation.get(conversation.id) || null,
        unread_count: unreadMap.get(conversation.id) || 0,
        application: app,
      };
    });
  }

  static async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    perPage = 50
  ): Promise<{ data: Message[]; page: number; per_page: number }> {
    await this.assertConversationParticipant(conversationId, userId);
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(from, to);
    if (error) throw new AppError('No se pudieron cargar los mensajes', 500);

    return { data: (data || []) as Message[], page, per_page: perPage };
  }

  static async sendMessage(conversationId: string, userId: string, payload: SendMessageInput): Promise<Message> {
    const conversation = await this.assertConversationParticipant(conversationId, userId);

    const cleanContent = (payload.content || '').trim();
    const hasAttachment = Boolean(payload.attachment_url);
    if (!cleanContent && !hasAttachment) throw new AppError('El mensaje está vacío', 400);
    if (cleanContent.length > 500) throw new AppError('El mensaje no puede superar 500 caracteres', 400);
    if (cleanContent && this.containsBlockedWords(cleanContent)) {
      throw new AppError('Tu mensaje contiene palabras no permitidas', 400);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', userId)
      .gte('created_at', oneHourAgo);
    if ((count || 0) >= 100) {
      throw new AppError('Has alcanzado el límite de 100 mensajes por hora en esta conversación', 429);
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: cleanContent || null,
        attachment_url: payload.attachment_url || null,
        attachment_name: payload.attachment_name || null,
        attachment_type: payload.attachment_type || null,
      })
      .select('*')
      .single();
    if (error) throw new AppError('No se pudo enviar el mensaje', 500);

    const recipientId = conversation.seeker_id === userId ? conversation.employer_id : conversation.seeker_id;
    const preview = cleanContent ? cleanContent.slice(0, 120) : `Adjunto: ${payload.attachment_name || 'archivo'}`;
    void NotificationsService.create(
      recipientId,
      'system',
      'Nuevo mensaje',
      preview,
      { conversation_id: conversationId, application_id: conversation.application_id, kind: 'chat_message' }
    ).catch(err => console.error('[ChatService.sendMessage.notification]', err));

    return data as Message;
  }

  static async markConversationAsRead(conversationId: string, userId: string): Promise<number> {
    await this.assertConversationParticipant(conversationId, userId);
    const { data, error } = await supabaseAdmin
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null)
      .select('id');
    if (error) throw new AppError('No se pudo marcar como leído', 500);
    return (data || []).length;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`seeker_id.eq.${userId},employer_id.eq.${userId}`);
    if (error) throw new AppError('No se pudo contar mensajes no leídos', 500);
    const ids = (conversations || []).map(row => row.id);
    if (!ids.length) return 0;

    const { count, error: countError } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', ids)
      .neq('sender_id', userId)
      .is('read_at', null);
    if (countError) throw new AppError('No se pudo contar mensajes no leídos', 500);
    return count || 0;
  }

  static async uploadAttachment(file: Express.Multer.File, userId: string): Promise<{
    attachment_url: string;
    attachment_name: string;
    attachment_type: string;
  }> {
    const safeName = file.originalname.replace(/[^\w.\-]/g, '_');
    const path = `chat/${userId}/${Date.now()}_${safeName}`;
    const { error } = await supabaseAdmin.storage.from('chat-attachments').upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw new AppError('No se pudo subir el archivo adjunto', 500);
    const { data } = supabaseAdmin.storage.from('chat-attachments').getPublicUrl(path);
    return {
      attachment_url: data.publicUrl,
      attachment_name: file.originalname,
      attachment_type: file.mimetype,
    };
  }

  private static async getOrCreateDirectConversation(
    userA: string,
    userB: string,
    createdBy: string
  ): Promise<Conversation> {
    const existing = await this.findDirectConversation(userA, userB);
    if (existing) return existing;

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        application_id: null,
        seeker_id: userA,
        employer_id: userB,
        created_by: createdBy,
      })
      .select('*')
      .single();
    if (error || !data) throw new AppError('No se pudo crear la conversación directa', 500);
    return data as Conversation;
  }

  private static async findDirectConversation(userA: string, userB: string): Promise<Conversation | null> {
    const { data } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .is('application_id', null)
      .or(`and(seeker_id.eq.${userA},employer_id.eq.${userB}),and(seeker_id.eq.${userB},employer_id.eq.${userA})`)
      .maybeSingle();
    return (data as Conversation | null) || null;
  }

  private static async validateApplicationAccess(
    userId: string,
    userRole: AuthenticatedRequest['userRole'],
    applicationId: string
  ): Promise<{ seekerId: string; employerId: string }> {
    const { data: application } = await supabaseAdmin
      .from('applications')
      .select('id, seeker_id, status, job_id')
      .eq('id', applicationId)
      .single();
    if (!application) throw new AppError('Postulación no encontrada', 404);

    const { data: job } = await supabaseAdmin.from('jobs').select('company_id').eq('id', application.job_id).single();
    if (!job) throw new AppError('Oferta no encontrada', 404);

    const { data: company } = await supabaseAdmin.from('companies').select('owner_id').eq('id', job.company_id).single();
    if (!company) throw new AppError('Empresa no encontrada', 404);

    if (userRole === 'seeker') {
      if (application.seeker_id !== userId) throw new AppError('No puedes iniciar chat para esta postulación', 403);
      if (!['reviewed', 'interview', 'accepted'].includes(application.status)) {
        throw new AppError('El chat no está habilitado para esta postulación', 403);
      }
    } else if (userRole === 'employer') {
      if (company.owner_id !== userId) throw new AppError('No puedes iniciar chat para esta postulación', 403);
      if (application.status === 'pending') {
        throw new AppError('Debes revisar primero la postulación para habilitar el chat', 403);
      }
    } else {
      throw new AppError('No tienes permisos para usar el chat', 403);
    }

    return { seekerId: application.seeker_id, employerId: company.owner_id };
  }

  private static containsBlockedWords(content: string): boolean {
    const normalized = content.toLowerCase();
    return this.BLOCKED_WORDS.some(word => normalized.includes(word));
  }

  private static async assertConversationParticipant(conversationId: string, userId: string): Promise<Conversation> {
    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    if (error || !conversation) throw new AppError('Conversación no encontrada', 404);
    if (conversation.seeker_id !== userId && conversation.employer_id !== userId) {
      throw new AppError('No tienes acceso a esta conversación', 403);
    }
    return conversation as Conversation;
  }
}
