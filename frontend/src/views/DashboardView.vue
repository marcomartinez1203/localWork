<template>
  <div class="container dash-page">
    <div class="dash-header">
      <div>
        <h1>Panel de Empleador</h1>
        <p style="color:var(--color-text-secondary);margin:0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:4px;">
            <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
          </svg>
          {{ companyName || 'Gestiona tus ofertas y postulantes' }}
        </p>
      </div>
      <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
        <button class="btn btn--outline btn--sm" @click="openCompanyModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
          </svg> Mi Empresa
        </button>
        <button class="btn btn--primary btn--lg dash-new-offer-btn" @click="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg> Nueva Oferta
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="dash-stats">
      <div class="dash-stat">
        <div class="dash-stat__value">{{ stats.active_jobs || 0 }}</div>
        <div class="dash-stat__label">Ofertas activas</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__value">{{ stats.total_jobs || 0 }}</div>
        <div class="dash-stat__label">Total publicadas</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__value">{{ stats.total_applications || 0 }}</div>
        <div class="dash-stat__label">Postulaciones</div>
      </div>
      <div class="dash-stat">
        <div class="dash-stat__value">{{ stats.total_saves || 0 }}</div>
        <div class="dash-stat__label">Guardados</div>
      </div>
    </div>

    <!-- Job list -->
    <h2 style="font-size:var(--fs-lg);margin-bottom:var(--space-4);">Mis ofertas publicadas</h2>
    
    <div v-if="isLoadingJobs">
      <div class="skeleton" style="height:80px;margin-bottom:var(--space-3);"></div>
      <div class="skeleton" style="height:80px;margin-bottom:var(--space-3);"></div>
    </div>
    
    <div v-else-if="jobs.length > 0">
      <div class="job-row" v-for="job in jobs" :key="job.id">
        <div class="job-row__info">
          <h3 class="job-row__title">{{ job.title }}</h3>
          <p class="job-row__meta">
            <span>{{ job.modality }}</span>
            <span>{{ job.vacancies }} vacante{{ job.vacancies > 1 ? 's' : '' }}</span>
            <span>{{ timeAgo(job.created_at) }}</span>
          </p>
        </div>
        <span class="badge" :class="statusColor(job.status)">{{ statusLabel(job.status) }}</span>
        <div class="job-row__actions">
          <button class="btn btn--ghost btn--sm" @click="viewApplicants(job)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg> Postulantes
          </button>
          <button class="btn btn--ghost btn--sm" @click="editJob(job)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg> Editar
          </button>
          <button class="btn btn--ghost btn--sm" @click="toggleJobStatus(job)">
            <template v-if="job.status === 'active'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.75 5.25v13.5m-7.5-13.5v13.5"/></svg> Pausar
            </template>
            <template v-else>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/></svg> Activar
            </template>
          </button>
          <button class="btn btn--ghost btn--sm" style="color:var(--color-danger);" @click="deleteJob(job.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
          </button>
        </div>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <button class="pagination__btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Ant</button>
        <button v-for="page in totalPages" :key="page" class="pagination__btn" :class="{ active: page === currentPage }" @click="goToPage(page)">
          {{ page }}
        </button>
        <button class="pagination__btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Sig</button>
      </div>
    </div>

    <div v-else class="empty-state" style="display: flex;">
      <h3 class="empty-state__title">No tienes ofertas publicadas</h3>
      <p class="empty-state__desc">Crea tu primera oferta de empleo para empezar a recibir postulantes.</p>
    </div>

  </div>

  <!-- Create Job Modal -->
  <div class="create-modal-overlay" :class="{ open: isJobModalOpen }" @click.self="closeJobModal">
    <div class="create-modal">
      <div class="create-modal__header">
        <h2 class="create-modal__title">{{ editingJobId ? 'Editar oferta de empleo' : 'Nueva oferta de empleo' }}</h2>
        <button class="modal__close" @click="closeJobModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form class="create-form" @submit.prevent="saveJob">
        <div class="form-group">
          <label class="form-label form-label--required">Título del cargo</label>
          <input type="text" class="form-input" v-model="jobForm.title" required placeholder="Ej: Coordinador de Ventas">
        </div>
        <div class="create-form__row">
          <div class="form-group">
            <label class="form-label form-label--required">Categoría</label>
            <select class="form-select" v-model="jobForm.category_id" required>
              <option value="">Seleccionar...</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Modalidad</label>
            <select class="form-select" v-model="jobForm.modality">
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label form-label--required">Descripción</label>
          <textarea class="form-textarea" v-model="jobForm.description" rows="4" required placeholder="Describe el cargo, responsabilidades y el perfil ideal..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Requisitos</label>
          <textarea class="form-textarea" v-model="jobForm.requirements" rows="3" placeholder="Experiencia, estudios, habilidades..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Salario</label>
          <input type="text" class="form-input" v-model="jobForm.salary_text" placeholder="Ej: $1.500.000, A convenir, Según experiencia">
          <span class="form-hint">Texto que verá el candidato</span>
        </div>
        <div class="create-form__row">
          <div class="form-group">
            <label class="form-label">Rango mínimo <span style="color:var(--color-text-muted);font-weight:400;">(opcional)</span></label>
            <input type="number" class="form-input" v-model="jobForm.salary_min" placeholder="1300000" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Rango máximo <span style="color:var(--color-text-muted);font-weight:400;">(opcional)</span></label>
            <input type="number" class="form-input" v-model="jobForm.salary_max" placeholder="2000000" min="0">
          </div>
        </div>
        <div class="create-form__row">
          <div class="form-group">
            <label class="form-label">Barrio / Zona</label>
            <select v-model="jobForm.barrio_id" class="form-select">
              <option value="">Selecciona un barrio</option>
              <option v-for="b in barrios" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Referencia / Dirección</label>
            <input type="text" class="form-input" v-model="jobForm.location" placeholder="Ej: Centro, Norte">
          </div>
        </div>
        <div class="create-form__row">
          <div class="form-group">
            <label class="form-label">Vacantes</label>
            <input type="number" class="form-input" v-model="jobForm.vacancies" min="1">
          </div>
          <div class="form-group" style="visibility:hidden"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de vencimiento <span style="color:var(--color-text-muted);font-weight:400;">(opcional)</span></label>
          <input type="date" class="form-input" v-model="jobForm.expires_at">
        </div>
        <button type="submit" class="btn btn--primary btn--lg btn--block" :class="{ 'btn--loading': isSavingJob }" :disabled="isSavingJob">
          {{ editingJobId ? 'Guardar cambios' : 'Publicar oferta' }}
        </button>
      </form>
    </div>
  </div>

  <!-- Edit Company Modal -->
  <div class="create-modal-overlay" :class="{ open: isCompanyModalOpen }" @click.self="closeCompanyModal">
    <div class="create-modal">
      <div class="create-modal__header">
        <h2 class="create-modal__title">Datos de mi empresa</h2>
        <button class="modal__close" @click="closeCompanyModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form class="create-form" @submit.prevent="saveCompany">
        <div class="form-group">
          <label class="form-label form-label--required">Nombre de la empresa</label>
          <input type="text" class="form-input" v-model="companyForm.name" required placeholder="Ej: Ferretería López">
        </div>
        <div class="create-form__row">
          <div class="form-group">
            <label class="form-label">NIT</label>
            <input type="text" class="form-input" v-model="companyForm.nit" placeholder="900.123.456-7">
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input type="text" class="form-input" v-model="companyForm.phone" placeholder="3001234567">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea class="form-textarea" v-model="companyForm.description" rows="3" placeholder="¿Qué hace tu empresa?"></textarea>
        </div>
        <div class="create-form__row">
          <div class="form-group">
            <label class="form-label">Ubicación / Dirección</label>
            <input type="text" class="form-input" v-model="companyForm.address" placeholder="Calle 5 #10-20">
          </div>
          <div class="form-group">
            <label class="form-label">Sitio web</label>
            <input type="url" class="form-input" v-model="companyForm.website" placeholder="https://...">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Logo de la empresa</label>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <div style="width:48px;height:48px;border-radius:var(--radius);background:var(--color-primary-100);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
              <img v-if="companyForm.logo_url" :src="companyForm.logo_url" alt="Logo" style="width:100%;height:100%;object-fit:cover;">
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
              </svg>
            </div>
            <input type="file" ref="logoInput" class="form-input" accept="image/jpeg,image/png,image/webp" style="padding:var(--space-2);">
          </div>
        </div>
        <button type="submit" class="btn btn--primary btn--lg btn--block" :class="{ 'btn--loading': isSavingCompany }" :disabled="isSavingCompany">
          Guardar cambios
        </button>
      </form>
    </div>
  </div>

  <!-- Applicants Panel Modal -->
  <div class="create-modal-overlay" :class="{ open: isApplicantsModalOpen }" @click.self="closeApplicantsModal">
    <div class="create-modal" style="max-width:720px;">
      <div class="create-modal__header">
        <h2 class="create-modal__title">Postulantes — {{ currentJobTitle }}</h2>
        <button class="modal__close" @click="closeApplicantsModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);max-height:60vh;overflow-y:auto;">
        
        <div v-if="isLoadingApplicants">
          <div class="skeleton" style="height:60px;"></div>
          <div class="skeleton" style="height:60px;margin-top:var(--space-2);"></div>
        </div>

        <p v-else-if="applicants.length === 0" style="text-align:center;color:var(--color-text-muted);padding:var(--space-8);">
          Aún nadie se ha postulado a esta oferta.
        </p>

        <div class="applicant-row" v-for="app in applicants" :key="app.id" v-else>
          <div class="applicant-row__avatar">
            <img v-if="app.seeker_avatar" :src="app.seeker_avatar" alt="Avatar">
            <span v-else>{{ initials(app.seeker_name || '??') }}</span>
          </div>
          <div class="applicant-row__info">
            <p class="applicant-row__name">{{ app.seeker_name || 'Sin nombre' }}</p>
            <p class="applicant-row__email">{{ app.seeker_name }}</p>
            <p v-if="app.cover_letter" class="applicant-row__cover">"{{ app.cover_letter }}"</p>
          </div>
          <div class="applicant-row__actions">
            <select v-model="app.status" @change="changeAppStatus(app)">
              <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
            <button v-if="app.status !== 'pending'" class="btn btn--sm" style="background:#007200;border-color:#007200;color:#fff;" @click="openApplicantChat(app.id)">Mensaje</button>
            <a v-if="app.resume_url" :href="app.resume_url" target="_blank" class="btn btn--ghost btn--sm" style="font-size:var(--fs-xs);">CV</a>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { showToast } from '@/assets/js/utils/helpers'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/assets/js/config/api'
import AuthService from '@/assets/js/services/auth.service'
import JobsService from '@/assets/js/services/jobs.service'
import CompaniesService from '@/assets/js/services/companies.service'
import ApplicationsService from '@/assets/js/services/applications.service'
import ChatService from '@/assets/js/services/chat.service'
import type { Job, Application, Category, Barrio } from '@/types'

const router = useRouter()

const companyName = ref('')
const stats = ref<Record<string, unknown>>({})
const jobs = ref<Job[]>([])
const totalPages = ref(1)
const currentPage = ref(1)
const isLoadingJobs = ref(true)

const categories = ref<Category[]>([])
const barrios = ref<Barrio[]>([])

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', reviewed: 'Revisada', shortlisted: 'Preseleccionado',
  interview: 'Entrevista', accepted: 'Aceptada', rejected: 'Rechazada'
}
const STATUS_COLORS: Record<string, string> = {
  active: 'badge--accent', paused: 'badge--warning', closed: 'badge--danger', draft: 'badge--neutral'
}

const isJobModalOpen = ref(false)
const isSavingJob = ref(false)
const editingJobId = ref<string | null>(null)
const jobForm = ref<Record<string, string | number>>({
  title: '', category_id: '', modality: 'Presencial', description: '', requirements: '',
  salary_text: '', salary_min: '', salary_max: '', barrio_id: '', location: '', vacancies: 1, expires_at: ''
})

const isCompanyModalOpen = ref(false)
const isSavingCompany = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const companyForm = ref<Record<string, string>>({
  id: '', name: '', nit: '', phone: '', description: '', address: '', website: '', logo_url: ''
})

const isApplicantsModalOpen = ref(false)
const isLoadingApplicants = ref(false)
const currentJobTitle = ref('')
const applicants = ref<Application[]>([])

onMounted(async () => {
  const user = AuthService.getUser()
  if (!user || user.role !== 'employer') {
    router.push('/home')
    return
  }

  fetchStatsAndData()
  fetchJobs()
})

const fetchStatsAndData = async () => {
  try {
    const company = await CompaniesService.getMyCompany()
    if (company?.name) companyName.value = company.name
  } catch { /* silent */ }

  try {
    stats.value = await api.get('/jobs/employer-stats')
  } catch { /* silent */ }

  try {
    categories.value = await JobsService.getCategories()
  } catch { /* silent */ }

  try {
    barrios.value = await JobsService.getBarrios()
  } catch { /* silent */ }
}

const fetchJobs = async () => {
  isLoadingJobs.value = true
  try {
    const res = await JobsService.getMyJobs({ page: currentPage.value, perPage: 10 })
    jobs.value = res.data || []
    totalPages.value = (res as unknown as Record<string, number>).total_pages || 1
  } catch (err: unknown) {
    console.error(err)
    jobs.value = []
  } finally {
    isLoadingJobs.value = false
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchJobs()
}

const timeAgo = (dateStr: string) => {
  if (!dateStr) return ''
  const elapsed = new Date().getTime() - new Date(dateStr).getTime()
  if (elapsed < 60000) return 'hace un momento'
  if (elapsed < 3600000) return `hace ${Math.round(elapsed/60000)}m`
  if (elapsed < 86400000) return `hace ${Math.round(elapsed/3600000)}h`
  return `hace ${Math.round(elapsed/86400000)}d`
}
const statusLabel = (st: string) => {
  const lbls: Record<string, string> = { active: 'Activa', paused: 'Pausada', closed: 'Cerrada', draft: 'Borrador' }
  return lbls[st] || st
}
const statusColor = (st: string) => STATUS_COLORS[st] || 'badge--neutral'
const initials = (name: string) => name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()

const toggleJobStatus = async (job: Job) => {
  const newStatus = job.status === 'active' ? 'paused' : 'active'
  try {
    await JobsService.update(job.id, { status: newStatus })
    job.status = newStatus as Job['status']
    showToast(`Oferta ${newStatus === 'active' ? 'activada' : 'pausada'}`, 'success')
  } catch {
    showToast('Error al actualizar oferta', 'error')
  }
}

const deleteJob = async (id: string) => {
  if (!confirm('¿Seguro que deseas eliminar esta oferta?')) return
  try {
    await JobsService.delete(id)
    fetchJobs()
    fetchStatsAndData()
  } catch {
    showToast('Error al eliminar', 'error')
  }
}

const openCreateModal = () => {
  editingJobId.value = null
  jobForm.value = { title: '', category_id: '', modality: 'Presencial', description: '', requirements: '', salary_text: '', salary_min: '', salary_max: '', barrio_id: '', location: '', vacancies: 1, expires_at: '' }
  isJobModalOpen.value = true
}
const closeJobModal = () => { isJobModalOpen.value = false }
const editJob = async (job: Job) => {
  editingJobId.value = job.id
  jobForm.value = { ...(job as unknown as Record<string, string | number>), expires_at: job.expires_at ? job.expires_at.substring(0, 10) : '' }
  isJobModalOpen.value = true
}

const saveJob = async () => {
  isSavingJob.value = true
  try {
    if (editingJobId.value) {
      await JobsService.update(editingJobId.value, jobForm.value)
    } else {
      await JobsService.create(jobForm.value)
    }
    closeJobModal()
    fetchJobs()
    fetchStatsAndData()
  } catch {
    showToast('Error al guardar oferta', 'error')
  } finally {
    isSavingJob.value = false
  }
}

const openCompanyModal = async () => {
  try {
    const company = await CompaniesService.getMyCompany()
    if (company) companyForm.value = { ...(company as unknown as Record<string, string>) }
  } catch { /* silent */ }
  isCompanyModalOpen.value = true
}
const closeCompanyModal = () => { isCompanyModalOpen.value = false }
const saveCompany = async () => {
  if (!companyForm.value.id) return
  isSavingCompany.value = true
  try {
    await CompaniesService.update(companyForm.value.id, companyForm.value)
    if (logoInput.value?.files && logoInput.value.files.length > 0) {
      const formData = new FormData()
      formData.append('logo', logoInput.value.files[0])
      await api.upload('/upload/company-logo', formData)
    }
    closeCompanyModal()
    fetchStatsAndData()
  } catch {
    showToast('Error al guardar empresa', 'error')
  } finally {
    isSavingCompany.value = false
  }
}

const viewApplicants = async (job: Job) => {
  currentJobTitle.value = job.title
  isApplicantsModalOpen.value = true
  isLoadingApplicants.value = true
  try {
    const res = await ApplicationsService.getForJob(job.id)
    applicants.value = res.data || []
  } catch {
    applicants.value = []
  } finally {
    isLoadingApplicants.value = false
  }
}
const closeApplicantsModal = () => { isApplicantsModalOpen.value = false }
const changeAppStatus = async (app: Application) => {
  try {
    await ApplicationsService.updateStatus(app.id, app.status)
  } catch {
    showToast('Error actualizando estado', 'error')
  }
}
const openApplicantChat = async (id: string) => {
  try {
    const res = await ChatService.startConversation(id)
    router.push(`/chat?conversation_id=${res.conversation_id}`)
  } catch {
    showToast('Error al abrir chat', 'error')
  }
}
</script>

<style scoped>
.dash-page { padding-top: var(--space-8); padding-bottom: var(--space-16); }
.dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-8); flex-wrap: wrap; gap: var(--space-4); }
.dash-header h1 { font-size: var(--fs-2xl); letter-spacing: -0.02em; }
.dash-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); margin-bottom: var(--space-8); }
@media (min-width: 768px) { .dash-stats { grid-template-columns: repeat(4, 1fr); } }
.dash-stat { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-2xl); padding: var(--space-5); text-align: center; transition: all var(--transition); }
.dash-stat:hover { transform: translateY(-2px); border-color: var(--color-primary-200); }
.dash-stat__value { font-family: var(--font-mono); font-size: var(--fs-xl); font-weight: 700; color: var(--color-primary); letter-spacing: -0.02em; }
.dash-stat__label { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; }

.job-row { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-2xl); padding: var(--space-5) var(--space-6); display: flex; align-items: center; gap: var(--space-5); margin-bottom: var(--space-3); transition: all var(--transition); }
.job-row:hover { border-color: var(--color-primary-200); transform: translateY(-1px); }
.job-row__info { flex: 1; min-width: 0; }
.job-row__title { font-family: var(--font-heading); font-size: var(--fs-base); font-weight: var(--fw-semibold); margin-bottom: var(--space-1); }
.job-row__meta { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); margin: 0; display: flex; gap: var(--space-4); flex-wrap: wrap; text-transform: uppercase; letter-spacing: 0.04em; }
.job-row__actions { display: flex; gap: var(--space-2); flex-shrink: 0; }

.dash-new-offer-btn { background: #15803d; border-color: #15803d; color: #fff; }
.dash-new-offer-btn:hover:not(:disabled) { background: #166534; border-color: #166534; }

.create-modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: var(--z-modal); align-items: flex-start; justify-content: center; padding: var(--space-8) var(--space-4); overflow-y: auto; }
.create-modal-overlay.open { display: flex; }
.create-modal { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-2xl); padding: var(--space-8); width: 100%; max-width: 640px; animation: scaleIn var(--transition) forwards; }
.create-modal__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); }
.create-modal__title { font-size: var(--fs-xl); }
.create-form { display: flex; flex-direction: column; gap: var(--space-5); }
.create-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

.applicant-row { display:flex; align-items:center; gap:var(--space-4); padding:var(--space-4); background:var(--color-bg); border:1px solid var(--color-border-light); border-radius:var(--radius-xl); transition: all var(--transition); }
.applicant-row:hover { border-color: var(--color-primary-200); }
.applicant-row__avatar { width:44px; height:44px; border-radius:var(--radius-full); background:var(--color-primary-50); border: 1px solid var(--color-primary-100); display:flex; align-items:center; justify-content:center; font-weight:var(--fw-bold); color:var(--color-primary); flex-shrink:0; font-size:var(--fs-sm); overflow:hidden; }
.applicant-row__avatar img { width:100%; height:100%; object-fit:cover; }
.applicant-row__info { flex:1; min-width:0; }
.applicant-row__name { font-weight:var(--fw-semibold); font-size:var(--fs-sm); }
.applicant-row__email { font-family:var(--font-mono); font-size:11px; color:var(--color-text-muted); margin:0; letter-spacing:0.02em; }
.applicant-row__cover { font-size:var(--fs-xs); color:var(--color-text-secondary); margin-top:var(--space-1); font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.applicant-row__actions { display:flex; gap:var(--space-2); flex-shrink:0; flex-wrap:wrap; }
.applicant-row__actions select { font-family:var(--font-mono); font-size:11px; padding:var(--space-1) var(--space-2); border-radius:var(--radius); border:1px solid var(--color-border); background:var(--color-surface); cursor:pointer; text-transform:uppercase; letter-spacing:0.04em; }

@media (max-width: 767px) {
  .dash-page { padding-top: var(--space-5); padding-bottom: var(--space-10); }
  .dash-header { margin-bottom: var(--space-5); }
  .dash-header h1 { font-size: var(--fs-xl); }
  .dash-stats { gap: var(--space-3); margin-bottom: var(--space-5); }
  .job-row { flex-wrap: wrap; padding: var(--space-4); gap: var(--space-3); }
  .job-row__actions { width: 100%; justify-content: flex-end; }
  .create-modal-overlay { align-items: flex-end; padding: 0; }
  .create-modal { border-radius: var(--radius-xl) var(--radius-xl) 0 0; padding: var(--space-6) var(--space-5); max-height: 92dvh; overflow-y: auto; }
  .create-modal__title { font-size: var(--fs-lg); }
}
@media (max-width: 640px) {
  .create-form__row { grid-template-columns: 1fr; }
  .applicant-row { flex-wrap:wrap; }
  .applicant-row__actions { width:100%; }
  .applicant-row__actions select { flex:1; }
}
</style>
