<template>
  <div class="container chat-page">
    <div class="chat-shell">
      <aside class="chat-card chat-sidebar">
        <div class="chat-sidebar__header"><h1 class="chat-sidebar__title">Conversaciones</h1></div>
        
        <div id="incomingRequests" style="padding:var(--space-2) var(--space-2) 0;" v-if="incomingRequests.length > 0">
          <div style="border:1px solid var(--color-border-light);border-radius:var(--radius);padding:var(--space-2);display:flex;flex-direction:column;gap:var(--space-2);">
            <p style="margin:0;font-size:12px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.04em;">Solicitudes pendientes</p>
            <div v-for="r in incomingRequests" :key="r.id" style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);">
              <span style="font-size:var(--fs-sm);">{{ r.sender?.full_name }}</span>
              <div style="display:flex;gap:6px;">
                <button class="btn btn--sm" style="padding:4px 8px;background:#007200;border-color:#007200;color:#fff;" @click="respondRequest(r.id, 'accept')">Aceptar</button>
                <button class="btn btn--ghost btn--sm" style="padding:4px 8px;" @click="respondRequest(r.id, 'reject')">Rechazar</button>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-sidebar__list">
          <div v-if="conversations.length === 0" class="chat-empty">Aun no tienes conversaciones activas.</div>
          <article v-for="c in conversations" :key="c.id" class="chat-item" :class="{ active: activeConversationId === c.id }" @click="openConversation(c.id)">
            <div class="chat-item__avatar">
              <img v-if="c.other_user?.avatar_url" :src="c.other_user.avatar_url" alt="">
              <span v-else>{{ initials(c.other_user?.full_name) }}</span>
            </div>
            <div class="chat-item__body">
              <div class="chat-item__top">
                <h3 class="chat-item__name">{{ c.other_user?.full_name }}</h3>
                <span class="chat-item__time">{{ fmtTime(c.last_message_at || c.created_at) }}</span>
              </div>
              <div class="chat-item__bottom">
                <p class="chat-item__last">{{ getLastText(c) }}</p>
                <span v-if="(c.unread_count || 0) > 0" class="chat-item__badge">{{ c.unread_count }}</span>
              </div>
            </div>
          </article>
        </div>
      </aside>

      <section class="chat-card chat-main">
        <header class="chat-main__header">
          <div class="chat-main__user" v-if="activeConversation">
            <div class="chat-item__avatar">
              <img v-if="activeConversation.other_user?.avatar_url" :src="activeConversation.other_user.avatar_url" alt="">
              <span v-else>{{ initials(activeConversation.other_user?.full_name) }}</span>
            </div>
            <div>
              <h2>{{ activeConversation.other_user?.full_name }}</h2>
              <div class="chat-main__meta">
                <template v-if="isOnline">
                  <span class="chat-main__meta-dot"></span><span>En línea</span>
                </template>
                <template v-else>
                  <span>{{ activeConversation.kind === 'application' ? `Oferta: ${activeConversation.application?.job_title || 'Oferta'}` : 'Chat directo' }}</span>
                </template>
              </div>
            </div>
          </div>
          <div class="chat-main__user" v-else>
            <div><h2>Selecciona una conversación</h2></div>
          </div>
          <button class="btn btn--ghost btn--sm" aria-label="Cerrar chat" @click="closeConversation" style="margin-left:auto;padding:var(--space-2);" title="Cerrar chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 18 18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        <div class="chat-main__messages" id="messagesPanel" ref="messagesPanel">
          <div v-if="!activeConversation" class="chat-empty">Selecciona una conversación para comenzar.</div>
          <div v-else-if="messages.length === 0" class="chat-empty">Aun no hay mensajes. Escribe el primero.</div>
          <template v-else>
            <template v-for="(msg, idx) in messages" :key="msg.id">
              <div v-if="showDateSeparator(idx)" class="chat-date-sep">{{ dayLabel(msg.created_at) }}</div>
              <div class="chat-bubble-wrap" :class="{ mine: msg.sender_id === user?.id }">
                <div class="chat-bubble">
                  <p v-if="msg.content" class="chat-bubble__text">{{ msg.content }}</p>
                  <a v-if="msg.attachment_url" class="chat-bubble__attachment" :href="msg.attachment_url" target="_blank" rel="noopener">
                    <span>Adjunto:</span><span>{{ msg.attachment_name || 'archivo' }}</span>
                  </a>
                  <div class="chat-bubble__time">{{ fmtTime(msg.created_at) }}</div>
                </div>
              </div>
            </template>
          </template>
        </div>

        <form class="chat-main__composer" @submit.prevent="sendMessage">
          <input type="file" ref="attachmentInput" style="display:none;" @change="handleFileSelect" />
          <button class="btn btn--ghost btn--sm" type="button" @click="attachmentInput?.click()" :disabled="!activeConversation">Adjuntar</button>
          <div style="flex:1;min-width:0;">
            <div class="chat-attachment-chip" style="display:inline-flex;" v-if="selectedAttachment">
              Adjunto: {{ selectedAttachment.name }}
            </div>
            <textarea class="form-textarea" v-model="messageText" maxlength="500" placeholder="Escribe un mensaje..." :disabled="!activeConversation" @keydown.enter.exact.prevent="sendMessage"></textarea>
          </div>
          <button class="btn btn--primary btn--sm" type="submit" :class="{ 'btn--loading': isSending }" :disabled="!activeConversation || isSending">Enviar</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from '@/utils/helpers'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import ChatService from '@/services/chat.service'
import type { User, ConversationSummary, Message } from '@/types'

interface ConversationItem extends ConversationSummary {
  unread_count?: number
  application?: { job_title?: string }
}

interface ChatRequest {
  id: string
  sender?: { full_name?: string }
}

const route = useRoute()
const router = useRouter()

const user = ref<User | null>(null)
const conversations = ref<ConversationItem[]>([])
const incomingRequests = ref<ChatRequest[]>([])
const activeConversationId = ref<string | null>(null)
const activeConversation = computed(() => conversations.value.find(c => c.id === activeConversationId.value) || null)
const messages = ref<Message[]>([])
const isOnline = ref(false)

const messageText = ref('')
const selectedAttachment = ref<File | null>(null)
const attachmentInput = ref<HTMLInputElement | null>(null)
const isSending = ref(false)
const messagesPanel = ref<HTMLElement | null>(null)

// Supabase Realtime State
let supabaseClient: any = null
let messageChannel: any = null
let presenceChannel: any = null
const knownMessageIds = new Set<string>()

const initRealtime = () => {
  const token = sessionStorage.getItem('lw_token')
  if (!token || !window.supabase) return
  // NOTE: Ensure window.supabase is loaded via index.html or npm
  supabaseClient = window.supabase.createClient(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://local-work-project.vercel.app', import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy', {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}

onMounted(async () => {
  user.value = AuthService.getUser()
  if (!user.value) {
    router.push('/login')
    return
  }

  activeConversationId.value = (route.query.conversation_id as string | undefined) || null

  await loadConversations()
  initRealtime()
  
  if (activeConversationId.value) {
    openConversation(activeConversationId.value)
  }
})

onUnmounted(() => {
  if (messageChannel) supabaseClient?.removeChannel(messageChannel)
  if (presenceChannel) supabaseClient?.removeChannel(presenceChannel)
})

const loadConversations = async () => {
  try {
    const res = await ChatService.listConversations()
    conversations.value = (res as ConversationItem[]) || []
    const inc = await ChatService.getIncomingRequests()
    incomingRequests.value = (inc as ChatRequest[]) || []

    if (!activeConversationId.value && conversations.value.length) {
      activeConversationId.value = conversations.value[0].id
    }
  } catch {
    console.error('Error loading conversations')
  }
}

const openConversation = async (id: string) => {
  activeConversationId.value = id
  if ((route.query.conversation_id as string | undefined) !== id) {
    router.replace({ query: { conversation_id: id } })
  }

  if (!activeConversation.value) return

  try {
    const res = await ChatService.getMessages(id, { page: 1, perPage: 200 })
    messages.value = res.data || []
    messages.value.forEach(m => knownMessageIds.add(m.id))
    scrollToBottom()

    await ChatService.markAsRead(id)
    if (activeConversation.value) {
      activeConversation.value.unread_count = 0
    }
  } catch {
    console.error('Error fetching messages')
  }

  subscribeToMessages(id)
  if (activeConversation.value) {
    subscribeToPresence(activeConversation.value)
  }
}

const closeConversation = () => {
  if (activeConversationId.value) {
    activeConversationId.value = null
    router.replace({ query: {} })
  } else {
    router.push('/home')
  }
}

const sendMessage = async () => {
  if (!activeConversation.value) return
  const txt = messageText.value.trim()
  const file = selectedAttachment.value
  if (!txt && !file) return

  isSending.value = true
  try {
    let payload: { content: string; attachment_url?: string; attachment_name?: string } = { content: txt }
    if (file) {
      const upload = await ChatService.uploadAttachment(file)
      payload = { ...payload, ...upload }
    }
    await ChatService.sendMessage(activeConversation.value.id, payload)
    messageText.value = ''
    selectedAttachment.value = null
    scrollToBottom()
  } catch {
    showToast('No se pudo enviar el mensaje', 'error')
  } finally {
    isSending.value = false
  }
}

const respondRequest = async (id: string, action: 'accept' | 'reject') => {
  try {
    const res = await ChatService.respondRequest(id, action) as { conversation_id?: string }
    if (res.conversation_id) {
      activeConversationId.value = res.conversation_id
      openConversation(res.conversation_id)
    }
    await loadConversations()
  } catch {
    showToast('Error al responder solicitud', 'error')
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  selectedAttachment.value = target.files && target.files[0] ? target.files[0] : null
}

const subscribeToMessages = (conversationId: string) => {
  if (!supabaseClient) return
  if (messageChannel) supabaseClient.removeChannel(messageChannel)
  
  messageChannel = supabaseClient
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, async (payload: { new: Message }) => {
      const msg = payload.new
      if (knownMessageIds.has(msg.id)) return
      knownMessageIds.add(msg.id)

      if (activeConversationId.value === conversationId) {
        const res = await ChatService.getMessages(conversationId, { page: 1, perPage: 200 })
        messages.value = res.data || []
        scrollToBottom()
        if (msg.sender_id !== user.value?.id) {
          await ChatService.markAsRead(conversationId)
        }
      }
      loadConversations()
    })
    .subscribe()
}

const subscribeToPresence = (conversation: ConversationItem) => {
  if (!supabaseClient) return
  if (presenceChannel) supabaseClient.removeChannel(presenceChannel)

  const channelName = `presence:conversation:${conversation.id}`
  presenceChannel = supabaseClient.channel(channelName, { config: { presence: { key: user.value?.id } } })

  presenceChannel.on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    const otherId = conversation.other_user?.id
    isOnline.value = Boolean(state[otherId]?.length)
  }).subscribe(async (status: string) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({ user_id: user.value?.id, at: new Date().toISOString() })
    }
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesPanel.value) {
      messagesPanel.value.scrollTop = messagesPanel.value.scrollHeight
    }
  })
}

// Formatters
const initials = (name?: string) => name ? name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '??'
const fmtTime = (val?: string | null) => val ? new Date(val).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''
const dayKey = (val: string) => { const d = new Date(val); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }
const dayLabel = (val: string) => new Date(val).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' })

const showDateSeparator = (idx: number) => {
  if (idx === 0) return true
  return dayKey(messages.value[idx].created_at) !== dayKey(messages.value[idx-1].created_at)
}
const getLastText = (c: ConversationItem) => {
  if (c.last_message) return c.last_message.content || `Adjunto: ${c.last_message.attachment_name || 'archivo'}`
  return c.kind === 'application' ? `Postulación: ${c.application?.job_title || 'Oferta'}` : 'Chat directo'
}
</script>

<style scoped>
.chat-page { height: calc(100vh - 110px); min-height: 620px; padding: var(--space-4) 0 var(--space-8); }
.chat-shell { height: 100%; display: grid; grid-template-columns: 340px 1fr; gap: var(--space-3); }
.chat-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-2xl); overflow: hidden; }
.chat-sidebar { display: flex; flex-direction: column; }
.chat-sidebar__header { padding: var(--space-4); border-bottom: 1px solid var(--color-border-light); }
.chat-sidebar__title { margin: 0; font-size: var(--fs-lg); }
.chat-sidebar__list { overflow-y: auto; padding: var(--space-2); display: flex; flex-direction: column; gap: var(--space-2); }
.chat-item { border: 1px solid transparent; border-radius: var(--radius-lg); padding: var(--space-3); display: flex; gap: var(--space-3); cursor: pointer; transition: all var(--transition); }
.chat-item:hover { background: var(--color-bg); border-color: var(--color-border-light); }
.chat-item.active { background: var(--color-primary-50); border-color: var(--color-primary-200); }
.chat-item__avatar { width: 42px; height: 42px; border-radius: var(--radius-full); background: var(--color-primary-100); color: var(--color-primary); font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.chat-item__avatar img { width: 100%; height: 100%; object-fit: cover; }
.chat-item__body { min-width: 0; flex: 1; }
.chat-item__top { display: flex; justify-content: space-between; gap: var(--space-2); }
.chat-item__name { margin: 0; font-size: var(--fs-sm); font-weight: var(--fw-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-item__time { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.chat-item__bottom { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2); margin-top: 2px; }
.chat-item__last { margin: 0; font-size: var(--fs-xs); color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-item__badge { min-width: 20px; height: 20px; border-radius: var(--radius-full); background: var(--color-primary); color: #fff; font-family: var(--font-mono); font-size: 11px; display: flex; align-items: center; justify-content: center; padding: 0 6px; }

.chat-main { display: flex; flex-direction: column; height: 100%; }
.chat-main__header { border-bottom: 1px solid var(--color-border-light); padding: var(--space-4); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
.chat-main__user { display: flex; align-items: center; gap: var(--space-3); }
.chat-main__user h2 { margin: 0; font-size: var(--fs-base); }
.chat-main__meta { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; display: flex; align-items: center; gap: var(--space-2); }
.chat-main__meta-dot { width: 7px; height: 7px; border-radius: var(--radius-full); background: #16a34a; }
.chat-main__messages { flex: 1; overflow-y: auto; padding: var(--space-4); background: var(--color-bg); }
.chat-date-sep { text-align: center; font-size: 11px; color: var(--color-text-muted); margin: var(--space-3) 0; text-transform: uppercase; letter-spacing: .05em; }
.chat-bubble-wrap { display: flex; margin-bottom: var(--space-2); }
.chat-bubble-wrap.mine { justify-content: flex-end; }
.chat-bubble { max-width: min(78%, 620px); border-radius: var(--radius-lg); padding: var(--space-2) var(--space-3); background: #1f2937; color: #f9fafb; border: 1px solid transparent; }
.chat-bubble-wrap.mine .chat-bubble { background: #007200; color: #fff; }
.chat-bubble__text { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: var(--fs-sm); }
.chat-bubble__attachment { margin-top: var(--space-2); display: inline-flex; gap: var(--space-2); align-items: center; font-size: var(--fs-xs); color: inherit; text-decoration: underline; }
.chat-bubble__time { margin-top: 2px; font-size: 10px; opacity: .8; text-align: right; font-family: var(--font-mono); }
.chat-main__composer { border-top: 1px solid var(--color-border-light); padding: var(--space-3); display: flex; align-items: flex-end; gap: var(--space-2); }
.chat-main__composer textarea { resize: none; min-height: 42px; max-height: 130px; }
.chat-empty { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); text-align: center; padding: var(--space-8); }
.chat-attachment-chip { font-size: 11px; color: var(--color-text-muted); padding: 2px 8px; border-radius: var(--radius-full); border: 1px dashed var(--color-border); margin-bottom: var(--space-2); }
@media (max-width: 980px) { .chat-shell { grid-template-columns: 1fr; } .chat-page { height: auto; min-height: auto; } .chat-sidebar { max-height: 300px; } }
</style>
