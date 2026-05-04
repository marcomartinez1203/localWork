<template>
  <div class="container apps-page" style="max-width:900px;">
    <div class="apps-header">
      <h1>Mis Postulaciones</h1>
      <p>Revisa el estado de tus postulaciones a ofertas de empleo</p>
    </div>

    <div class="apps-filters">
      <button class="chip" :class="{ active: activeStatus === undefined }" @click="setStatus(undefined)">Todas</button>
      <button class="chip" :class="{ active: activeStatus === 'pending' }" @click="setStatus('pending')">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        Pendientes
      </button>
      <button class="chip" :class="{ active: activeStatus === 'reviewed' }" @click="setStatus('reviewed')">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
        Revisadas
      </button>
      <button class="chip" :class="{ active: activeStatus === 'shortlisted' }" @click="setStatus('shortlisted')">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
        Preseleccionado
      </button>
      <button class="chip" :class="{ active: activeStatus === 'interview' }" @click="setStatus('interview')">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.069-3.769-6.665-6.665l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
        Entrevista
      </button>
      <button class="chip" :class="{ active: activeStatus === 'accepted' }" @click="setStatus('accepted')">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        Aceptadas
      </button>
      <button class="chip" :class="{ active: activeStatus === 'rejected' }" @click="setStatus('rejected')">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        Rechazadas
      </button>
    </div>

    <div v-if="isLoading">
      <div class="skeleton" style="height:80px;margin-bottom:var(--space-3);"></div>
      <div class="skeleton" style="height:80px;margin-bottom:var(--space-3);"></div>
      <div class="skeleton" style="height:80px;"></div>
    </div>

    <div v-else-if="applications.length > 0">
      <div class="app-card" v-for="app in applications" :key="app.id" style="cursor:pointer;" @click="router.push(`/job/${app.job_id}`)">
        <div class="app-card__logo">{{ initials(app.company_name || 'Empresa') }}</div>
        <div class="app-card__info">
          <h3 class="app-card__title">{{ app.job_title || 'Empleo' }}</h3>
          <p class="app-card__company">{{ app.company_name || 'Empresa' }}</p>
        </div>
        <div class="app-card__meta">
          <span class="status-badge" :class="`status-badge--${app.status}`">{{ STATUS_LABELS[app.status] || app.status }}</span>
          <span class="app-card__date">{{ timeAgo(app.created_at) }}</span>
        </div>
        <div class="app-card__actions">
          <button class="btn btn--ghost btn--sm" @click.stop="withdrawApp(app.id)">Retirar</button>
          <button v-if="CHAT_ENABLED_STATUSES.includes(app.status)" class="btn btn--sm" style="background:#007200;border-color:#007200;color:#fff;" @click.stop="startChat(app.id)">
            Mensaje
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
      <h3 class="empty-state__title">Aún no te has postulado</h3>
      <p class="empty-state__desc">Cuando te postules a una oferta, aparecerá aquí.</p>
      <router-link to="/home" class="btn" style="margin-top:var(--space-4); background-color:#15803d; border-color:#15803d; color:#fff;">Explorar empleos</router-link>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button v-for="i in totalPages" :key="i" class="pagination__btn" :class="{ active: i === currentPage }" @click="goToPage(i)">
        {{ i }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from '@/assets/js/utils/helpers'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/assets/js/services/auth.service'
import ApplicationsService from '@/assets/js/services/applications.service'
import ChatService from '@/assets/js/services/chat.service'
import type { Application, ApplicationStatus } from '@/types'

const router = useRouter()

const applications = ref<Application[]>([])
const isLoading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const activeStatus = ref<ApplicationStatus | undefined>(undefined)

const STATUS_LABELS = {
  pending: 'Pendiente', reviewed: 'Revisada', shortlisted: 'Preseleccionado',
  interview: 'Entrevista', accepted: 'Aceptada', rejected: 'Rechazada'
}
const CHAT_ENABLED_STATUSES = ['reviewed', 'interview', 'accepted']

const initials = (name?: string) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??'

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  if (diffHours < 24) return `Hace ${diffHours} horas`
  const diffDays = Math.round(diffHours / 24)
  return `Hace ${diffDays} días`
}

onMounted(() => {
  const user = AuthService.getUser()
  if (!user) {
    router.push('/login')
    return
  }
  if (user.role === 'employer') {
    router.push('/dashboard')
    return
  }
  loadApplications()
})

const loadApplications = async () => {
  isLoading.value = true
  try {
    const res = await ApplicationsService.getMyApplications({
      page: currentPage.value,
      perPage: 10,
      status: activeStatus.value
    })
    applications.value = res.data || []
    totalPages.value = res.total_pages || 1
  } catch (e) {
    applications.value = []
  } finally {
    isLoading.value = false
  }
}

const setStatus = (status?: ApplicationStatus) => {
  activeStatus.value = status
  currentPage.value = 1
  loadApplications()
}

const goToPage = (p: number) => {
  currentPage.value = p
  loadApplications()
}

const withdrawApp = async (id: string) => {
  if (!confirm('¿Seguro que deseas retirar esta postulación?')) return
  try {
    await ApplicationsService.withdraw(id)
    showToast('Postulación retirada', 'success')
    loadApplications()
  } catch {
    showToast('Error al retirar', 'error')
  }
}

const startChat = async (id: string) => {
  try {
    const result = await ChatService.startConversation(id)
    router.push(`/chat?conversation_id=${result.conversation_id}`)
  } catch {
    showToast('No se pudo abrir el chat', 'error')
  }
}
</script>

<style scoped>
.apps-page { padding-top: var(--space-8); padding-bottom: var(--space-16); }
.apps-header { margin-bottom: var(--space-8); }
.apps-header h1 { font-size: var(--fs-2xl); margin-bottom: var(--space-2); letter-spacing: -0.02em; }
.apps-header p { color: var(--color-text-secondary); margin: 0; }
.apps-filters { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap; }
.app-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-2xl); padding: var(--space-5) var(--space-6); display: flex; align-items: center; gap: var(--space-5); transition: all var(--transition); margin-bottom: var(--space-3); }
.app-card:hover { border-color: var(--color-primary-200); transform: translateY(-2px); }
.app-card__logo { width: 48px; height: 48px; border-radius: var(--radius); background: var(--color-primary-50); border: 1px solid var(--color-primary-100); display: flex; align-items: center; justify-content: center; font-size: var(--fs-sm); font-weight: var(--fw-bold); color: var(--color-primary); flex-shrink: 0; }
.app-card__info { flex: 1; min-width: 0; }
.app-card__title { font-family: var(--font-heading); font-size: var(--fs-base); font-weight: var(--fw-semibold); margin-bottom: var(--space-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app-card__company { font-size: var(--fs-sm); color: var(--color-text-muted); margin: 0; }
.app-card__meta { display: flex; align-items: center; gap: var(--space-4); flex-shrink: 0; }
.app-card__date { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.status-badge { padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.status-badge--pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.status-badge--reviewed { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.status-badge--shortlisted { background: var(--color-primary-50); color: var(--color-primary); }
.status-badge--interview { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.status-badge--accepted { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-badge--rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.app-card__actions { flex-shrink: 0; }

@media (max-width: 768px) {
  .app-card { flex-wrap: wrap; padding: var(--space-4); gap: var(--space-3); }
  .app-card__meta { width: 100%; justify-content: space-between; }
  .app-card__actions { width: 100%; }
  .app-card__actions .btn { width: 100%; }
  .apps-page { padding-top: var(--space-5); }
  .apps-header h1 { font-size: var(--fs-xl); }
}
@media (max-width: 479px) {
  .app-card__logo { width: 40px; height: 40px; font-size: var(--fs-xs); }
  .app-card__title { font-size: var(--fs-sm); }
}
</style>
