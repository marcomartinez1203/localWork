<template>
  <aside class="home-sidebar-right">
    <div class="home-sidebar-right__inner">

      <!-- 1. Tu Progreso -->
      <div class="sidebar-section">
        <div class="sidebar-section__header">
          <h3 class="sidebar-section__title">Tu progreso</h3>
          <router-link to="/profile" class="sidebar-section__action">Editar</router-link>
        </div>

        <div class="progress-block">
          <div class="progress-block__top">
            <span class="progress-block__label">Perfil completado</span>
            <span class="progress-block__value">{{ profileCompletion }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar__fill" :style="{ width: profileCompletion + '%' }"></div>
          </div>
        </div>

        <div class="quick-stats-row">
          <div class="quick-stat-mini">
            <span class="quick-stat-mini__value">{{ myStats.applications }}</span>
            <span class="quick-stat-mini__label">Postulaciones</span>
          </div>
          <div class="quick-stat-mini">
            <span class="quick-stat-mini__value">{{ myStats.saved }}</span>
            <span class="quick-stat-mini__label">Guardados</span>
          </div>
          <div class="quick-stat-mini">
            <span class="quick-stat-mini__value">{{ myStats.notifications }}</span>
            <span class="quick-stat-mini__label">Nuevas</span>
          </div>
        </div>
      </div>

      <!-- 2. Filtros Rápidos -->
      <div class="sidebar-section">
        <div class="sidebar-section__header">
          <h3 class="sidebar-section__title">Filtrar rápido</h3>
          <button v-if="hasActiveFilters" class="sidebar-section__action" @click="clearFilters">Limpiar</button>
        </div>

        <div class="filter-group">
          <span class="filter-group__label">Modalidad</span>
          <div class="filter-chips">
            <button
              v-for="m in modalities"
              :key="m.value"
              class="filter-chip"
              :class="{ active: activeModality === m.value }"
              @click="toggleModality(m.value)"
            >
              {{ m.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-group__label">Ordenar por</span>
          <div class="filter-chips">
            <button
              v-for="s in sortOptions"
              :key="s.value"
              class="filter-chip"
              :class="{ active: activeSort === s.value }"
              @click="toggleSort(s.value)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Empleos urgentes -->
      <div class="sidebar-section">
        <div class="sidebar-section__header">
          <h3 class="sidebar-section__title">Urgentes</h3>
          <span class="sidebar-section__badge" v-if="urgentJobs.length > 0">{{ urgentJobs.length }}</span>
        </div>

        <div v-if="urgentJobs.length > 0" class="urgent-list">
          <div
            v-for="job in urgentJobs.slice(0, 4)"
            :key="job.id"
            class="urgent-item"
            @click="goToJob(job.id)"
          >
            <div class="urgent-item__dot" :class="urgencyClass(job)"></div>
            <div class="urgent-item__body">
              <p class="urgent-item__title">{{ job.title }}</p>
              <p class="urgent-item__meta">{{ job.company_name }} · {{ timeLeft(job) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="sidebar-empty">
          No hay ofertas urgentes por ahora.
        </div>
      </div>

      <!-- 4. Empresas verificadas -->
      <div class="sidebar-section">
        <h3 class="sidebar-section__title">Empresas verificadas</h3>
        <div v-if="verifiedCompanies.length > 0" class="company-grid">
          <div
            v-for="c in verifiedCompanies.slice(0, 6)"
            :key="c.id"
            class="company-pill"
            @click="goToCompany(c.id)"
          >
            <div class="company-pill__logo">{{ getInitials(c.name) }}</div>
            <span class="company-pill__name">{{ c.name }}</span>
            <svg class="company-pill__badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"/></svg>
          </div>
        </div>
        <div v-else class="sidebar-empty">
          No hay empresas verificadas disponibles.
        </div>
      </div>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import JobsService from '@/services/jobs.service'
import ApplicationsService from '@/services/applications.service'
import NotificationsService from '@/services/notifications.service'
import type { Job } from '@/types'

const router = useRouter()

const emit = defineEmits<{
  (e: 'filter-modality', modality: string): void
  (e: 'filter-sort', sort: string): void
  (e: 'clear-filters'): void
}>()

/* ── User & Stats ── */
const user = computed(() => AuthService.getUser())

const profileCompletion = computed(() => {
  const u = user.value
  if (!u) return 0
  const fields = [
    !!u.avatar_url, !!u.full_name, !!u.phone, !!u.bio,
    !!u.location, !!(u.skills && u.skills.length > 0),
    !!(u.education && u.education.length > 0),
    !!(u.experience && u.experience.length > 0),
    !!u.resume_url
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
})

const myStats = ref({ applications: 0, saved: 0, notifications: 0 })

/* ── Filters ── */
const activeModality = ref('all')
const activeSort = ref('newest')

const modalities = [
  { label: 'Todos', value: 'all' },
  { label: 'Presencial', value: 'Presencial' },
  { label: 'Remoto', value: 'Remoto' },
  { label: 'Híbrido', value: 'Híbrido' },
]

const sortOptions = [
  { label: 'Recientes', value: 'newest' },
  { label: 'Mejor pago', value: 'salary-desc' },
  { label: 'Menor pago', value: 'salary-asc' },
]

const hasActiveFilters = computed(() => activeModality.value !== 'all' || activeSort.value !== 'newest')

const toggleModality = (value: string) => {
  activeModality.value = value
  emit('filter-modality', value)
}

const toggleSort = (value: string) => {
  activeSort.value = value
  emit('filter-sort', value)
}

const clearFilters = () => {
  activeModality.value = 'all'
  activeSort.value = 'newest'
  emit('clear-filters')
}

/* ── Jobs data ── */
const urgentJobs = ref<Job[]>([])
const verifiedCompanies = ref<Array<{ id: string; name: string }>>([])

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

const goToJob = (id: string) => router.push(`/job/${id}`)
const goToCompany = (_id: string) => router.push('/home')

const timeLeft = (job: Job): string => {
  if (!job.expires_at) return 'Publicado recientemente'
  const days = Math.ceil((new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Cierra hoy'
  if (days === 1) return 'Cierra mañana'
  return `${days} días restantes`
}

const urgencyClass = (job: Job): string => {
  if (!job.expires_at) return 'urgent-item__dot--low'
  const days = Math.ceil((new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 1) return 'urgent-item__dot--critical'
  if (days <= 3) return 'urgent-item__dot--high'
  return 'urgent-item__dot--low'
}

onMounted(async () => {
  try {
    const [apps, saved, notifs, jobsRes] = await Promise.all([
      ApplicationsService.getMyApplications({ page: 1, perPage: 1 }),
      JobsService.getSavedJobs(),
      NotificationsService.getUnreadCount(),
      JobsService.list({ page: 1, perPage: 20, sort: 'newest' })
    ])

    myStats.value = {
      applications: apps.total || 0,
      saved: Array.isArray(saved) ? saved.length : 0,
      notifications: notifs || 0
    }

    const allJobs = jobsRes.data || []
    urgentJobs.value = allJobs
      .filter(j => j.expires_at || j.created_at)
      .sort((a, b) => {
        const aDate = a.expires_at ? new Date(a.expires_at).getTime() : new Date(a.created_at!).getTime()
        const bDate = b.expires_at ? new Date(b.expires_at).getTime() : new Date(b.created_at!).getTime()
        return aDate - bDate
      })

    const map = new Map<string, string>()
    allJobs.forEach(j => {
      if (j.company_id && j.company_name && !map.has(j.company_id)) {
        map.set(j.company_id, j.company_name)
      }
    })
    verifiedCompanies.value = Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  } catch {
    // silent
  }
})
</script>

<style scoped>
/* ── Sidebar Section ── */
.sidebar-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.sidebar-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.sidebar-section__title {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sidebar-section__action {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.sidebar-section__action:hover {
  text-decoration: underline;
}

.sidebar-section__badge {
  font-size: 11px;
  font-weight: var(--fw-bold);
  font-family: var(--font-mono);
  color: var(--color-danger);
  background: rgba(239,68,68,0.10);
  border: 1px solid rgba(239,68,68,0.20);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

/* ── Progress block ── */
.progress-block {
  margin-bottom: var(--space-5);
}

.progress-block__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.progress-block__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

.progress-block__value {
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: var(--color-primary);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
}

/* ── Quick stats row ── */
.quick-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.quick-stat-mini {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-2);
  text-align: center;
  transition: border-color var(--transition-fast);
}

.quick-stat-mini:hover {
  border-color: var(--color-border-light);
}

.quick-stat-mini__value {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  margin-bottom: 4px;
}

.quick-stat-mini__label {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--font-mono);
}

/* ── Filter groups ── */
.filter-group {
  margin-bottom: var(--space-5);
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group__label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-chip {
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
}

.filter-chip:hover {
  border-color: var(--color-border-light);
  color: var(--color-text);
}

.filter-chip.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* ── Urgent list ── */
.urgent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.urgent-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
  padding: var(--space-3);
  border-radius: var(--radius);
  transition: background var(--transition-fast);
}

.urgent-item:hover {
  background: var(--color-surface-alt);
}

.urgent-item__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  margin-top: 6px;
  flex-shrink: 0;
}

.urgent-item__dot--critical { background: var(--color-danger); }
.urgent-item__dot--high     { background: var(--color-warning); }
.urgent-item__dot--low      { background: var(--color-text-muted); }

.urgent-item__body {
  flex: 1;
  min-width: 0;
}

.urgent-item__title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-text);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.urgent-item__meta {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  margin: 0;
}

/* ── Company grid ── */
.company-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.company-pill {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.company-pill:hover {
  border-color: var(--color-border-light);
}

.company-pill__logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--fw-bold);
  color: var(--color-primary);
  flex-shrink: 0;
}

.company-pill__name {
  flex: 1;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-pill__badge {
  color: var(--color-primary);
  flex-shrink: 0;
}

/* ── Empty state ── */
.sidebar-empty {
  padding: var(--space-5) 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}
</style>
