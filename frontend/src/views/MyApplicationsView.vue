<template>
  <div class="container apps-page">
    <!-- Header -->
    <div class="apps-header">
      <h1>Mis Postulaciones</h1>
      <p>Seguimiento de tus postulaciones y su estado actual</p>
    </div>

    <!-- Stats Cards -->
    <div class="apps-stats">
      <div class="apps-stat-card apps-stat-card--total">
        <span class="apps-stat-card__value">{{ stats.total }}</span>
        <span class="apps-stat-card__label">Total</span>
      </div>
      <div class="apps-stat-card apps-stat-card--pending">
        <span class="apps-stat-card__value">{{ stats.pending }}</span>
        <span class="apps-stat-card__label">Pendientes</span>
      </div>
      <div class="apps-stat-card apps-stat-card--interview">
        <span class="apps-stat-card__value">{{ stats.interview }}</span>
        <span class="apps-stat-card__label">En entrevista</span>
      </div>
      <div class="apps-stat-card apps-stat-card--accepted">
        <span class="apps-stat-card__value">{{ stats.accepted }}</span>
        <span class="apps-stat-card__label">Contratado</span>
      </div>
      <div class="apps-stat-card apps-stat-card--completed">
        <span class="apps-stat-card__value">{{ stats.completed }}</span>
        <span class="apps-stat-card__label">Finalizados</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="apps-filters">
      <button class="chip" :class="{ active: activeStatus === undefined }" @click="setStatus(undefined)">Todas</button>
      <button class="chip" :class="{ active: activeStatus === 'pending' }" @click="setStatus('pending')">Pendientes</button>
      <button class="chip" :class="{ active: activeStatus === 'reviewed' }" @click="setStatus('reviewed')">Revisadas</button>
      <button class="chip" :class="{ active: activeStatus === 'interview' }" @click="setStatus('interview')">Entrevista</button>
      <button class="chip" :class="{ active: activeStatus === 'accepted' }" @click="setStatus('accepted')">Contratado</button>
      <button class="chip" :class="{ active: activeStatus === 'rejected' }" @click="setStatus('rejected')">Rechazadas</button>
      <button class="chip" :class="{ active: activeStatus === 'completed' }" @click="setStatus('completed')">Finalizados</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading">
      <div class="skeleton" style="height: 140px; margin-bottom: var(--space-4);"></div>
      <div class="skeleton" style="height: 140px; margin-bottom: var(--space-4);"></div>
      <div class="skeleton" style="height: 140px;"></div>
    </div>

    <!-- Applications List -->
    <div v-else-if="applications.length > 0" class="apps-list">
      <div
        v-for="app in applications"
        :key="app.id"
        class="app-card"
        @click="router.push(`/job/${app.job_id}`)"
      >
        <!-- Header: Logo + Info -->
        <div class="app-card__header">
          <div class="app-card__logo">{{ initials(app.company_name || 'Empresa') }}</div>
          <div class="app-card__info">
            <h3 class="app-card__title">{{ app.job_title || 'Empleo' }}</h3>
            <p class="app-card__company">{{ app.company_name || 'Empresa' }}</p>
          </div>
          <div class="app-card__status-badge">
            <span class="status-badge" :class="`status-badge--${app.status}`">{{ STATUS_LABELS[app.status] || app.status }}</span>
            <span class="app-card__date">{{ timeAgo(app.created_at) }}</span>
          </div>
        </div>

        <!-- Pipeline Progress -->
        <div class="app-card__pipeline">
          <div
            v-for="(step, idx) in PIPELINE_STEPS"
            :key="step.key"
            class="pipeline-step"
            :class="{
              'pipeline-step--done': pipelineIndex(app.status) >= idx,
              'pipeline-step--current': pipelineIndex(app.status) === idx,
              'pipeline-step--rejected': app.status === 'rejected' && idx <= pipelineIndex(app.status)
            }"
          >
            <div class="pipeline-step__dot"></div>
            <span class="pipeline-step__label">{{ step.label }}</span>
          </div>
        </div>

        <!-- Footer: Actions -->
        <div class="app-card__footer">
          <div class="app-card__actions">
            <button
              v-if="CHAT_ENABLED_STATUSES.includes(app.status)"
              class="action-btn action-btn--chat"
              @click.stop="startChat(app.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8.97 8.97 0 0 1-1.355 4.74A9 9 0 0 1 12 21a8.97 8.97 0 0 1-4.74-1.355L3 21l1.355-4.26A8.97 8.97 0 0 1 3 12a9 9 0 1 1 18 0Z"/></svg>
              Chat
            </button>
            <button
              v-if="isRatable(app) && !ratedApps.has(app.id)"
              class="action-btn action-btn--rate"
              @click.stop="openRatingModal(app)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>
              Calificar
            </button>
            <span v-if="ratedApps.has(app.id)" class="rated-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
              Calificado
            </span>
          </div>
          <button class="action-btn action-btn--withdraw" @click.stop="withdrawApp(app.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            Retirar
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
      <h3 class="empty-state__title">Aún no te has postulado</h3>
      <p class="empty-state__desc">Cuando te postules a una oferta, aparecerá aquí con su seguimiento.</p>
      <router-link to="/home" class="btn btn--primary" style="margin-top: var(--space-4);">Explorar empleos</router-link>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="pagination__btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
      </button>
      <button v-for="i in totalPages" :key="i" class="pagination__btn" :class="{ active: i === currentPage }" @click="goToPage(i)">
        {{ i }}
      </button>
      <button class="pagination__btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
      </button>
    </div>

    <!-- Rating Modal -->
    <RatingModal
      v-model="isRatingModalOpen"
      :application-id="ratingAppId"
      :target-name="ratingTargetName"
      @rated="onRated"
    />
  </div>
</template>

<script setup lang="ts">
import { showToast } from '@/utils/helpers'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import ApplicationsService from '@/services/applications.service'
import ChatService from '@/services/chat.service'
import RatingsService from '@/services/ratings.service'
import RatingModal from '@/components/RatingModal.vue'
import type { Application, ApplicationStatus } from '@/types'

const router = useRouter()

const applications = ref<Application[]>([])
const isLoading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const activeStatus = ref<ApplicationStatus | undefined>(undefined)

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', reviewed: 'Revisada', shortlisted: 'Preseleccionado',
  interview: 'Entrevista', accepted: 'Contratado', rejected: 'Rechazada', completed: 'Finalizado'
}
const CHAT_ENABLED_STATUSES = ['reviewed', 'interview', 'accepted']

const PIPELINE_STEPS = [
  { key: 'pending', label: 'Postulado' },
  { key: 'reviewed', label: 'Revisado' },
  { key: 'interview', label: 'Entrevista' },
  { key: 'accepted', label: 'Contratado' },
]

const PIPELINE_ORDER = ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'completed']

const pipelineIndex = (status: string) => {
  const idx = PIPELINE_ORDER.indexOf(status)
  return idx >= 0 ? idx : -1
}

const initials = (name?: string) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??'

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  if (diffHours < 24) return `Hace ${diffHours} horas`
  const diffDays = Math.round(diffHours / 24)
  return `Hace ${diffDays} días`
}

const stats = computed(() => {
  const s = { total: applications.value.length, pending: 0, interview: 0, accepted: 0, completed: 0 }
  applications.value.forEach(a => {
    if (a.status === 'pending') s.pending++
    if (a.status === 'interview') s.interview++
    if (a.status === 'accepted') s.accepted++
    if (a.status === 'completed') s.completed++
  })
  return s
})

onMounted(() => {
  const user = AuthService.getUser()
  if (!user) { router.push('/login'); return }
  if (user.role === 'employer') { router.push('/dashboard'); return }
  loadApplications()
})

const loadApplications = async () => {
  isLoading.value = true
  try {
    const res = await ApplicationsService.getMyApplications({
      page: currentPage.value, perPage: 10, status: activeStatus.value
    })
    applications.value = res.data || []
    totalPages.value = res.total_pages || 1
    await checkRatings()
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

// ── Rating system ──
const ratedApps = ref<Set<string>>(new Set())
const isRatingModalOpen = ref(false)
const ratingAppId = ref('')
const ratingTargetName = ref('')

const isRatable = (app: Application) => app.status === 'completed'

const checkRatings = async () => {
  const ratableApps = applications.value.filter(isRatable)
  const results = await Promise.allSettled(
    ratableApps.map(app => RatingsService.checkForApplication(app.id))
  )
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.rated) {
      ratedApps.value.add(ratableApps[i].id)
    }
  })
}

const openRatingModal = (app: Application) => {
  ratingAppId.value = app.id
  ratingTargetName.value = app.company_name || 'la empresa'
  isRatingModalOpen.value = true
}

const onRated = () => {
  ratedApps.value.add(ratingAppId.value)
}
</script>

<style scoped>
.apps-page {
  max-width: 900px;
  margin-inline: auto;
  padding-top: var(--space-8);
  padding-bottom: var(--space-16);
}

.apps-header {
  margin-bottom: var(--space-8);
}

.apps-header h1 {
  font-size: var(--fs-2xl);
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
}

.apps-header p {
  color: var(--color-text-secondary);
  margin: 0;
}

/* ── Stats Cards ── */
.apps-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

@media (min-width: 640px) {
  .apps-stats {
    grid-template-columns: repeat(5, 1fr);
  }
}

.apps-stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
  transition: border-color var(--transition-fast);
}

.apps-stat-card:hover {
  border-color: var(--color-border-light);
}

.apps-stat-card__value {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  margin-bottom: var(--space-1);
}

.apps-stat-card__label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.apps-stat-card--total .apps-stat-card__value { color: var(--color-text); }
.apps-stat-card--pending .apps-stat-card__value { color: var(--color-warning); }
.apps-stat-card--interview .apps-stat-card__value { color: #8b5cf6; }
.apps-stat-card--accepted .apps-stat-card__value { color: var(--color-primary); }
.apps-stat-card--completed .apps-stat-card__value { color: var(--color-text-muted); }

/* ── Filters ── */
.apps-filters {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

/* ── App Cards ── */
.apps-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.app-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: border-color var(--transition-fast);
  cursor: pointer;
}

.app-card:hover {
  border-color: var(--color-border-light);
}

/* Header */
.app-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.app-card__logo {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: var(--color-primary);
  flex-shrink: 0;
}

.app-card__info {
  flex: 1;
  min-width: 0;
}

.app-card__title {
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  margin: 0 0 var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
  transition: color var(--transition-fast);
}

.app-card:hover .app-card__title {
  color: var(--color-primary-light);
}

.app-card__company {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.app-card__status-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.app-card__date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Status badges */
.status-badge {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-badge--pending { background: rgba(245, 158, 11, 0.08); color: var(--color-warning); border: 1px solid rgba(245, 158, 11, 0.15); }
.status-badge--reviewed { background: rgba(59, 130, 246, 0.08); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.15); }
.status-badge--shortlisted { background: var(--color-primary-50); color: var(--color-primary); border: 1px solid var(--color-primary-100); }
.status-badge--interview { background: rgba(139, 92, 246, 0.08); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.15); }
.status-badge--accepted { background: rgba(16, 185, 129, 0.08); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.15); }
.status-badge--rejected { background: rgba(239, 68, 68, 0.08); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.15); }
.status-badge--completed { background: var(--color-primary-50); color: var(--color-primary); border: 1px solid var(--color-primary-100); }

/* Pipeline */
.app-card__pipeline {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: var(--space-5);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.pipeline-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  position: relative;
}

.pipeline-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 6px;
  left: calc(50% + 10px);
  width: calc(100% - 20px);
  height: 2px;
  background: var(--color-border);
}

.pipeline-step--done:not(:last-child)::after {
  background: var(--color-primary);
}

.pipeline-step--rejected:not(:last-child)::after {
  background: var(--color-danger);
}

.pipeline-step__dot {
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  position: relative;
  z-index: 1;
}

.pipeline-step--done .pipeline-step__dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.pipeline-step--current .pipeline-step__dot {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-50);
}

.pipeline-step--rejected .pipeline-step__dot {
  background: var(--color-danger);
  border-color: var(--color-danger);
}

.pipeline-step__label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: center;
}

.pipeline-step--done .pipeline-step__label,
.pipeline-step--current .pipeline-step__label {
  color: var(--color-text);
  font-weight: 600;
}

.pipeline-step--rejected .pipeline-step__label {
  color: var(--color-danger);
  font-weight: 600;
}

/* Footer */
.app-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.app-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
}

.action-btn:hover {
  border-color: var(--color-border-light);
  color: var(--color-text);
}

.action-btn--chat {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.action-btn--chat:hover {
  background: var(--color-primary-dark);
}

.action-btn--rate {
  background: rgba(245, 158, 11, 0.08);
  color: var(--color-warning);
  border-color: rgba(245, 158, 11, 0.2);
}

.action-btn--rate:hover {
  background: rgba(245, 158, 11, 0.15);
}

.action-btn--withdraw {
  background: transparent;
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.action-btn--withdraw:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.rated-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--color-primary);
  font-weight: 600;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-8);
}

.pagination__btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding-inline: var(--space-3);
}

.pagination__btn:hover:not(:disabled) {
  border-color: var(--color-border-light);
  color: var(--color-text);
  background: var(--color-surface-alt);
}

.pagination__btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .app-card__header {
    flex-wrap: wrap;
  }

  .app-card__status-badge {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin-top: var(--space-2);
  }

  .app-card__pipeline {
    padding: var(--space-2);
  }

  .pipeline-step__label {
    font-size: 9px;
  }

  .app-card__footer {
    flex-wrap: wrap;
  }

  .action-btn {
    font-size: var(--fs-xs);
  }

  .apps-page {
    padding-top: var(--space-5);
  }

  .apps-header h1 {
    font-size: var(--fs-xl);
  }
}

@media (max-width: 479px) {
  .apps-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .app-card__logo {
    width: 40px;
    height: 40px;
    font-size: var(--fs-xs);
  }

  .app-card__title {
    font-size: var(--fs-base);
  }

  .pipeline-step__dot {
    width: 10px;
    height: 10px;
  }

  .pipeline-step:not(:last-child)::after {
    top: 4px;
  }
}
</style>
