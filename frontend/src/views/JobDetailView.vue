<template>
  <div class="container job-detail">
    <router-link to="/home" class="job-detail__back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
      Volver a empleos
    </router-link>

    <div class="job-detail__grid" v-if="isLoading">
      <div class="job-detail__main">
        <div style="display:flex;flex-direction:column;gap:var(--space-4);">
          <div class="skeleton" style="height:32px;width:60%;"></div>
          <div class="skeleton" style="height:18px;width:40%;"></div>
          <div class="skeleton" style="height:200px;"></div>
        </div>
      </div>
      <div class="job-detail__sidebar">
        <div class="skeleton" style="height:260px;border-radius:var(--radius-xl);"></div>
      </div>
    </div>

    <div v-else-if="jobNotFoundError" class="job-detail__grid">
      <div class="job-detail__main">
        <div class="empty-state" style="padding:var(--space-12);">
          <h3 class="empty-state__title">Empleo no encontrado</h3>
          <p class="empty-state__desc">Esta oferta ya no está disponible o fue eliminada.</p>
          <router-link to="/home" class="btn btn--primary" style="margin-top:var(--space-4);">Volver a empleos</router-link>
        </div>
      </div>
    </div>

    <div class="job-detail__grid" v-else-if="job">
      <!-- Main Content -->
      <div class="job-detail__main">
        <div class="job-detail__header">
          <div class="job-detail__logo">{{ initials(job.company_name || '') }}</div>
          <div>
            <h1 class="job-detail__title">{{ job.title }}</h1>
            <p class="job-detail__company">{{ job.company_name }}</p>
            <div class="job-detail__tags">
              <span class="badge" :class="modalityClass[job.modality] || 'badge--neutral'">{{ job.modality }}</span>
              <span class="badge badge--neutral">{{ job.category_name }}</span>
              <span v-if="(job as any).company_verified" class="badge badge--accent">✓ Verificada</span>
            </div>
          </div>
        </div>

        <div class="job-detail__info">
          <div class="job-detail__info-item">
            <div class="job-detail__info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg></div>
            <div class="job-detail__info-text">
              <span class="job-detail__info-label">Ubicación</span>
              <span class="job-detail__info-value">{{ job.location || 'Sin especificar' }}</span>
            </div>
          </div>
          <div class="job-detail__info-item">
            <div class="job-detail__info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"/></svg></div>
            <div class="job-detail__info-text">
              <span class="job-detail__info-label">Modalidad</span>
              <span class="job-detail__info-value">{{ job.modality }}</span>
            </div>
          </div>
          <div class="job-detail__info-item">
            <div class="job-detail__info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg></div>
            <div class="job-detail__info-text">
              <span class="job-detail__info-label">Vacantes</span>
              <span class="job-detail__info-value">{{ job.vacancies }}</span>
            </div>
          </div>
          <div class="job-detail__info-item">
            <div class="job-detail__info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg></div>
            <div class="job-detail__info-text">
              <span class="job-detail__info-label">Publicado</span>
              <span class="job-detail__info-value">{{ timeAgo(job.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="job-detail__section">
          <h2 class="job-detail__section-title">Descripción del cargo</h2>
          <p>{{ job.description }}</p>
        </div>

        <div class="job-detail__section" v-if="job.requirements">
          <h2 class="job-detail__section-title">Requisitos</h2>
          <p>{{ job.requirements }}</p>
        </div>

        <div class="job-detail__section" v-if="job.benefits">
          <h2 class="job-detail__section-title">Beneficios</h2>
          <p>{{ job.benefits }}</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="job-detail__sidebar">
        <div class="job-detail__apply-card">
          <div class="job-detail__salary">{{ salaryText }}</div>
          <p class="job-detail__salary-label">Salario mensual</p>
          
          <button v-if="hasApplied" class="btn btn--secondary btn--lg job-detail__apply-btn" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.75l6 6 9-13.5"/></svg> Ya te postulaste
          </button>
          <button v-else class="btn btn--primary btn--lg job-detail__apply-btn" @click="openApplyModal">
            Postularme ahora
          </button>

          <button v-if="hasApplied && myApplication && CHAT_ENABLED_STATUSES.includes(myApplication.status)" class="btn btn--lg" style="margin-top:var(--space-2);background:#007200;border-color:#007200;color:#fff;" @click="startChatFromJobDetail">
            Enviar mensaje
          </button>

          <div style="display:flex;gap:var(--space-2);margin-top:var(--space-4);">
            <button class="btn btn--outline job-detail__save-btn" @click="toggleSave" style="flex:1;">
              <template v-if="isSaved">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/></svg> Guardado
              </template>
              <template v-else>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/></svg> Guardar empleo
              </template>
            </button>
            <button class="btn btn--ghost" @click="shareJob" title="Compartir oferta" style="flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>
            </button>
          </div>
          <p class="job-detail__posted">{{ (job as any).total_applications || 0 }} personas se han postulado</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Apply Modal -->
  <div class="modal-overlay" :class="{ open: isApplyModalOpen }" @click.self="closeApplyModal">
    <div class="modal">
      <div class="modal__header">
        <h2 class="modal__title">Postularse a esta oferta</h2>
        <button class="modal__close" @click="closeApplyModal" aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <form @submit.prevent="submitApplication">
        <div class="form-group" style="margin-bottom:var(--space-5);">
          <label class="form-label">Carta de presentación (opcional)</label>
          <textarea class="form-textarea" v-model="coverLetter" rows="5" placeholder="Cuéntale al empleador por qué eres ideal para este cargo..."></textarea>
        </div>
        <div class="form-group" style="margin-bottom:var(--space-5);">
          <label class="form-label">Hoja de vida / CV (opcional)</label>
          <input type="file" class="form-input" ref="resumeInput" accept=".pdf,.doc,.docx" style="padding:var(--space-3);">
          <p style="font-size:var(--fs-xs);color:var(--color-text-muted);margin-top:var(--space-1);">PDF o Word, máximo 5 MB</p>
        </div>
        <button type="submit" class="btn btn--primary btn--lg btn--block" :class="{ 'btn--loading': isSubmitting }" :disabled="isSubmitting" style="background:#007200; border-color:#007200; color:#fff;">
          Enviar postulación
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from '@/assets/js/utils/helpers'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JobsService from '@/assets/js/services/jobs.service'
import ApplicationsService from '@/assets/js/services/applications.service'
import ChatService from '@/assets/js/services/chat.service'
import type { Job } from '@/types'

const route = useRoute()
const router = useRouter()
const jobId = (route.params.id as string) || ''

const isLoading = ref(true)
const jobNotFoundError = ref(false)
const job = ref<Job | null>(null)
const myApplication = ref<{ status: string } | null>(null)
const isSaved = ref(false)
const isApplyModalOpen = ref(false)
const isSubmitting = ref(false)

const coverLetter = ref('')
const resumeInput = ref<HTMLInputElement | null>(null)

const CHAT_ENABLED_STATUSES = ['reviewed', 'interview', 'accepted']
const modalityClass = { 'Presencial': 'badge--primary', 'Remoto': 'badge--accent', 'Híbrido': 'badge--warning' }

const initials = (name: string) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??'

const formatCurrency = (val: number) => {
  return '$' + Number(val).toLocaleString('es-CO')
}

const salaryText = computed(() => {
  if (!job.value) return ''
  if (job.value.salary_text) return job.value.salary_text
  if (job.value.salary_min) {
    let t = formatCurrency(job.value.salary_min)
    if (job.value.salary_max) t += ' – ' + formatCurrency(job.value.salary_max)
    return t
  }
  return 'A convenir'
})

const hasApplied = computed(() => !!myApplication.value)

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  if (diffHours < 24) return `Hace ${diffHours} horas`
  const diffDays = Math.round(diffHours / 24)
  return `Hace ${diffDays} días`
}

onMounted(async () => {
  if (!jobId) {
    router.push('/home')
    return
  }

  try {
    job.value = await JobsService.getById(jobId)
    document.title = `${job.value.title} — LocalWork`

    try {
      const savedJobs = await JobsService.getSavedJobs() || []
      isSaved.value = savedJobs.some(j => j.id === job.value!.id)
    } catch { /* silent */ }

    try {
      myApplication.value = await ApplicationsService.getMineForJob(jobId)
    } catch { /* silent */ }

  } catch {
    jobNotFoundError.value = true
  } finally {
    isLoading.value = false
  }
})

const openApplyModal = () => isApplyModalOpen.value = true
const closeApplyModal = () => isApplyModalOpen.value = false

const submitApplication = async () => {
  isSubmitting.value = true
  try {
    const resumeFile = resumeInput.value?.files?.length ? resumeInput.value.files[0] : undefined
    if (resumeFile && resumeFile.size > 5 * 1024 * 1024) {
      showToast('El archivo no puede pesar más de 5 MB', 'error')
      isSubmitting.value = false
      return
    }

    await ApplicationsService.apply(jobId as string, {
      coverLetter: coverLetter.value.trim(),
      resumeFile
    })
    closeApplyModal()
    showToast('¡Postulación enviada con éxito!', 'success')
    myApplication.value = { status: 'pending' }
  } catch {
    showToast('Error al postularse', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const toggleSave = async () => {
  try {
    if (isSaved.value) {
      await JobsService.unsave(jobId)
      isSaved.value = false
    } else {
      await JobsService.save(jobId)
      isSaved.value = true
    }
  } catch (e) {
    showToast('Error al guardar/remover', 'error')
  }
}

const shareJob = async () => {
  const url = window.location.href
  const title = job.value ? job.value.title : 'Oferta de empleo'
  const text = `¡Mira esta oferta en LocalWork! — ${title}`

  if (navigator.share) {
    try { await navigator.share({ title, text, url }) } catch(e){}
  } else {
    try {
      await navigator.clipboard.writeText(url)
      showToast('Enlace copiado al portapapeles', 'success')
    } catch(e) {
      prompt('Copia este enlace:', url)
    }
  }
}

const startChatFromJobDetail = async () => {
  if (!myApplication.value) return
  try {
    const result = await ChatService.startConversation(jobId)
    router.push(`/chat?conversation_id=${result.conversation_id}`)
  } catch {
    showToast('No se pudo abrir el chat', 'error')
  }
}
</script>

<style scoped>
@import '@/assets/css/pages/job-detail.css';
</style>
