<template>
  <div class="container workers-page">
    <div class="workers-header">
      <h1>Directorio de trabajadores</h1>
      <p>Encuentra personas con las habilidades que necesitas — desde albañiles y electricistas hasta profesionales independientes.</p>
    </div>

    <div class="workers-filters">
      <input class="form-input" v-model="searchQuery" @input="debouncedSearch" placeholder="Buscar por nombre...">
      <input class="form-input" v-model="skillQuery" @input="debouncedSearch" placeholder="Habilidad (ej: Plomería)">
      <select class="form-input" v-model="typeFilter" @change="resetPage">
        <option value="">Todos</option>
        <option value="freelance">Solo servicios independientes</option>
        <option value="both">Empleo y servicios</option>
      </select>
    </div>

    <div class="workers-grid" v-if="isLoading">
      <div class="skeleton" v-for="i in 4" :key="i" style="height:280px;border-radius:var(--radius);"></div>
    </div>

    <div class="workers-grid" v-else-if="workers.length > 0">
      <div class="worker-card" v-for="w in workers" :key="w.id" @click="openWorkerModal(w)" style="cursor:pointer;">
        <div class="worker-card__header">
          <div class="worker-card__avatar">
            <img v-if="w.avatar_url" :src="w.avatar_url" alt="">
            <span v-else>{{ initials(w.full_name) }}</span>
          </div>
          <div class="worker-card__info">
            <p class="worker-card__name" style="display:flex;align-items:center;gap:4px;">
              {{ w.full_name || 'Sin nombre' }}
              <svg v-if="w.verification_status === 'verified'" title="Identidad Verificada" width="16" height="16" viewBox="0 0 24 24" fill="#0284c7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </p>
            <p class="worker-card__location" v-if="w.location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.75-5.25-6.75-11.25a6.75 6.75 0 1 1 13.5 0C18.75 15.75 12 21 12 21Z"/><circle cx="12" cy="9.75" r="2.25"/></svg>
              {{ w.location }}
            </p>
            <span v-if="w.work_type && WORK_TYPE_LABEL[w.work_type]" class="worker-badge" :class="WORK_TYPE_LABEL[w.work_type].cls">
              {{ WORK_TYPE_LABEL[w.work_type].label }}
            </span>
          </div>
        </div>
        
        <div class="worker-card__section" v-if="w.bio">
          <p class="worker-card__bio">{{ w.bio }}</p>
        </div>
        
        <div class="worker-card__section worker-card__skills" v-if="w.skills && w.skills.length">
          <span class="worker-card__skill" v-for="s in w.skills.slice(0, 4)" :key="s">{{ s }}</span>
          <span class="worker-card__skill" v-if="w.skills.length > 4">+{{ w.skills.length - 4 }}</span>
        </div>

        <div class="worker-card__portfolio" v-if="w.portfolio_images?.length">
          <img v-for="(img, pi) in w.portfolio_images.slice(0, 3)" :key="pi" :src="img" alt="" loading="lazy">
          <span v-if="w.portfolio_images.length > 3" class="worker-card__portfolio-more">+{{ w.portfolio_images.length - 3 }}</span>
        </div>

        <div class="worker-card__footer" v-if="w.availability || w.hourly_rate">
          <span class="worker-card__meta" v-if="w.availability">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg>
            {{ w.availability }}
          </span>
          <span class="worker-card__meta" v-if="w.hourly_rate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 9.75h19.5m-19.5 4.5h19.5M3.75 6.75h16.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Z"/><circle cx="12" cy="12" r="1.5"/></svg>
            {{ w.hourly_rate }}
          </span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
      <h3 class="empty-state__title">No se encontraron trabajadores</h3>
      <p class="empty-state__desc">Intenta con otra habilidad o ajusta los filtros.</p>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="btn btn--ghost btn--sm" v-if="currentPage > 1" @click="goToPage(currentPage - 1)">← Anterior</button>
      <span style="font-size:var(--fs-sm);color:var(--color-text-muted);">Página {{ currentPage }} de {{ totalPages }}</span>
      <button class="btn btn--ghost btn--sm" v-if="currentPage < totalPages" @click="goToPage(currentPage + 1)">Siguiente →</button>
    </div>
  </div>

  <!-- Worker Detail Modal -->
  <div class="worker-modal-overlay" :class="{ open: isModalOpen }" @click.self="closeWorkerModal">
    <div class="worker-modal" style="position:relative;">
      <button class="worker-modal__close" @click="closeWorkerModal" aria-label="Cerrar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
      
      <div v-if="isLoadingModal">
        <div class="skeleton" style="height:200px;"></div>
      </div>

      <div v-else-if="selectedWorker">
        <div class="worker-modal__header">
          <div class="worker-modal__avatar">
            <img v-if="selectedWorker.avatar_url" :src="selectedWorker.avatar_url" alt="">
            <span v-else>{{ initials(selectedWorker.full_name) }}</span>
          </div>
          <div>
            <h2 style="font-size:var(--fs-xl);margin:0;display:flex;align-items:center;gap:6px;">
              {{ selectedWorker.full_name || 'Sin nombre' }}
              <svg v-if="selectedWorker.verification_status === 'verified'" title="Identidad Verificada" width="20" height="20" viewBox="0 0 24 24" fill="#0284c7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </h2>
            <p v-if="selectedWorker.location" style="font-size:var(--fs-sm);color:var(--color-text-muted);margin:var(--space-1) 0 0;display:flex;align-items:center;gap:var(--space-2);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.75-5.25-6.75-11.25a6.75 6.75 0 1 1 13.5 0C18.75 15.75 12 21 12 21Z"/><circle cx="12" cy="9.75" r="2.25"/></svg>
              {{ selectedWorker.location }}
            </p>
          </div>
        </div>
        
        <p v-if="selectedWorker.bio" style="color:var(--color-text-secondary);margin-bottom:var(--space-4);">{{ selectedWorker.bio }}</p>
        
        <div v-if="selectedWorker.skills?.length" style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-4);">
          <span class="badge badge--neutral" v-for="s in selectedWorker.skills" :key="s">{{ s }}</span>
        </div>

        <!-- Portfolio Gallery (read-only) -->
        <div v-if="selectedWorker.portfolio_images?.length" style="margin-bottom:var(--space-5);">
          <p class="rep-section__title" style="margin-bottom:var(--space-3);">Portafolio</p>
          <div class="portfolio-modal-grid">
            <div
              v-for="(img, i) in selectedWorker.portfolio_images"
              :key="i"
              class="portfolio-modal-item"
              @click="openLightbox(img)"
            >
              <img :src="img" alt="Trabajo previo" loading="lazy">
            </div>
          </div>
        </div>

        <!-- Lightbox -->
        <div v-if="lightboxImage" class="portfolio-lightbox" @click="lightboxImage = null">
          <img :src="lightboxImage" alt="Imagen ampliada">
        </div>
        
        <p v-if="selectedWorker.phone" style="font-size:var(--fs-sm);display:flex;align-items:center;gap:var(--space-2);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 4.5a2.25 2.25 0 0 1 2.25-2.25h2.1c.716 0 1.756.503 1.98 1.184l.87 2.607c.2.6.047 1.26-.396 1.703l-1.287 1.287a15.129 15.129 0 0 0 7.202 7.202l1.287-1.287c.443-.443 1.103-.596 1.703-.396l2.607.87c.681.224 1.184 1.264 1.184 1.98v2.1a2.25 2.25 0 0 1-2.25 2.25h-1.5C9.006 21.75 2.25 14.994 2.25 6V4.5Z"/></svg>
          {{ selectedWorker.phone }}
        </p>
        
        <p v-if="selectedWorker.hourly_rate" style="font-size:var(--fs-sm);display:flex;align-items:center;gap:var(--space-2);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.25 9.75h19.5m-19.5 4.5h19.5M3.75 6.75h16.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Z"/><circle cx="12" cy="12" r="1.5"/></svg>
          {{ selectedWorker.hourly_rate }}
        </p>
        
        <div v-if="!isMe" style="margin-top:var(--space-3);">
          <template v-if="!chatStatus">
            <button class="btn btn--outline btn--sm" @click="requestDirectChat">Enviar mensaje</button>
          </template>
          <template v-else-if="chatStatus.can_message && chatStatus.conversation_id">
            <button class="btn btn--sm" style="background:#007200;border-color:#007200;color:#fff;" @click="router.push(`/chat?conversation_id=${chatStatus.conversation_id}`)">Abrir chat</button>
          </template>
          <template v-else-if="chatStatus.pending_outgoing">
            <button class="btn btn--ghost btn--sm" disabled>Solicitud enviada</button>
          </template>
          <template v-else-if="chatStatus.pending_incoming && chatStatus.request_id">
            <div style="display:flex;gap:var(--space-2);">
              <button class="btn btn--sm" style="background:#007200;border-color:#007200;color:#fff;" @click="respondDirectRequest('accepted')">Aceptar</button>
              <button class="btn btn--ghost btn--sm" @click="respondDirectRequest('rejected')">Rechazar</button>
            </div>
          </template>
          <template v-else>
            <button class="btn btn--outline btn--sm" @click="requestDirectChat">Enviar mensaje</button>
          </template>
        </div>

        <!-- Reputation Breakdown -->
        <div class="rep-section">
          <p class="rep-section__title">Reputación</p>

          <div v-if="ratingsData.total > 0" class="rep-card">
            <div class="rep-card__summary">
              <div class="rep-card__score">
                <span class="rep-card__number">{{ ratingsData.average }}</span>
                <span class="rep-card__stars">{{ '★'.repeat(Math.round(ratingsData.average)) }}{{ '☆'.repeat(5 - Math.round(ratingsData.average)) }}</span>
                <span class="rep-card__count">{{ ratingsData.total }} calificación{{ ratingsData.total > 1 ? 'es' : '' }}</span>
              </div>
              <div v-if="breakdown.recommend_pct > 0" class="rep-card__recommend">
                <span class="rep-card__recommend-pct">{{ breakdown.recommend_pct }}%</span>
                <span class="rep-card__recommend-label">lo recomiendan</span>
              </div>
            </div>

            <div class="rep-bars" v-if="breakdown.avg_punctuality > 0 || breakdown.avg_quality > 0 || breakdown.avg_communication > 0">
              <div class="rep-bar">
                <span class="rep-bar__label">Puntualidad</span>
                <div class="rep-bar__track"><div class="rep-bar__fill" :style="{ width: (breakdown.avg_punctuality / 5 * 100) + '%' }"></div></div>
                <span class="rep-bar__value">{{ breakdown.avg_punctuality }}</span>
              </div>
              <div class="rep-bar">
                <span class="rep-bar__label">Calidad</span>
                <div class="rep-bar__track"><div class="rep-bar__fill" :style="{ width: (breakdown.avg_quality / 5 * 100) + '%' }"></div></div>
                <span class="rep-bar__value">{{ breakdown.avg_quality }}</span>
              </div>
              <div class="rep-bar">
                <span class="rep-bar__label">Comunicación</span>
                <div class="rep-bar__track"><div class="rep-bar__fill" :style="{ width: (breakdown.avg_communication / 5 * 100) + '%' }"></div></div>
                <span class="rep-bar__value">{{ breakdown.avg_communication }}</span>
              </div>
            </div>
          </div>
          <p v-else class="rep-empty">Aún no tiene calificaciones.</p>

          <!-- Individual reviews -->
          <div v-if="ratingsList.length > 0" class="rep-reviews">
            <div class="rep-review" v-for="(r, idx) in ratingsList" :key="idx">
              <div class="rep-review__header">
                <div class="rep-review__avatar">
                  <img v-if="r.rater?.avatar_url" :src="r.rater.avatar_url" alt="">
                  <span v-else>{{ initials(r.rater?.full_name) }}</span>
                </div>
                <div>
                  <strong class="rep-review__name">{{ r.rater?.full_name || 'Anónimo' }}</strong>
                  <span class="rep-review__stars">{{ '★'.repeat(r.score) }}{{ '☆'.repeat(5 - r.score) }}</span>
                </div>
              </div>
              <p v-if="r.comment" class="rep-review__comment">{{ r.comment }}</p>
              <div v-if="r.punctuality || r.quality || r.communication" class="rep-review__tags">
                <span v-if="r.punctuality" class="rep-tag">Puntualidad: {{ r.punctuality }}/5</span>
                <span v-if="r.quality" class="rep-tag">Calidad: {{ r.quality }}/5</span>
                <span v-if="r.communication" class="rep-tag">Comunic.: {{ r.communication }}/5</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isEmployer && !isMe" style="border-top:1px solid var(--color-border-light);padding-top:var(--space-4);margin-top:var(--space-4);">
          <p style="font-weight:var(--fw-semibold);font-size:var(--fs-sm);margin-bottom:var(--space-2);">Calificar trabajador</p>
          <div class="rating-stars">
            <button type="button" v-for="i in 5" :key="i" :class="{ active: i <= selectedScore }" @click="selectedScore = i" :aria-label="'Calificar ' + i + ' estrellas'">
              {{ i <= selectedScore ? '★' : '☆' }}
            </button>
          </div>
          <textarea class="form-textarea" v-model="ratingComment" rows="2" placeholder="Comentario opcional..." style="margin-top:var(--space-2);font-size:var(--fs-sm);"></textarea>
          <button class="btn btn--primary btn--sm" style="margin-top:var(--space-2);" @click="submitRating">Enviar calificación</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from '@/utils/helpers'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import WorkersService from '@/services/workers.service'
import RatingsService from '@/services/ratings.service'
import ChatService from '@/services/chat.service'
import AuthService from '@/services/auth.service'
import type { WorkerProfile, User, Rating } from '@/types'

const router = useRouter()

interface ChatStatus {
  can_message?: boolean
  conversation_id?: string
  pending_outgoing?: boolean
  pending_incoming?: boolean
  request_id?: string
}

const WORK_TYPE_LABEL: Record<string, { label: string; cls: string }> = {
  freelance: { label: 'Servicios independientes', cls: 'worker-badge--freelance' },
  both:      { label: 'Empleo y servicios',       cls: 'worker-badge--both' },
}

// User state
const currentUser = ref<User | null>(null)
const isEmployer = ref<boolean>(false)

// List state
const workers = ref<WorkerProfile[]>([])
const totalPages = ref<number>(1)
const currentPage = ref<number>(1)
const isLoading = ref<boolean>(true)

// Filters
const searchQuery = ref<string>('')
const skillQuery = ref<string>('')
const typeFilter = ref<string>('')
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Modal state
const isModalOpen = ref<boolean>(false)
const isLoadingModal = ref<boolean>(false)
const selectedWorker = ref<WorkerProfile | null>(null)
const chatStatus = ref<ChatStatus | null>(null)
const ratingsData = ref<{ average: number; total: number }>({ average: 0, total: 0 })
const ratingsList = ref<Rating[]>([])
const breakdown = ref<{ avg_punctuality: number; avg_quality: number; avg_communication: number; recommend_pct: number }>({ avg_punctuality: 0, avg_quality: 0, avg_communication: 0, recommend_pct: 0 })
const selectedScore = ref<number>(0)
const ratingComment = ref<string>('')
const lightboxImage = ref<string | null>(null)

onMounted(() => {
  currentUser.value = AuthService.getUser()
  if (currentUser.value) {
    isEmployer.value = currentUser.value.role === 'employer'
  }
  loadWorkers()
})

const initials = (name: string | undefined) => name ? name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '??'

const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => { resetPage() }, 400)
}

const resetPage = () => {
  currentPage.value = 1
  loadWorkers()
}

const goToPage = (p: number) => {
  currentPage.value = p
  loadWorkers()
  window.scrollTo(0, 0)
}

const loadWorkers = async () => {
  isLoading.value = true
  try {
    const res = await WorkersService.list({
      page: currentPage.value,
      perPage: 12,
      search: searchQuery.value || undefined,
      skill: skillQuery.value || undefined,
      workType: typeFilter.value || undefined
    })
    workers.value = res.data || []
    totalPages.value = res.total_pages || Math.ceil((res.total || 0) / 12) || 1
  } catch {
    workers.value = []
  } finally {
    isLoading.value = false
  }
}

// Modal
const isMe = computed(() => currentUser.value && selectedWorker.value && currentUser.value.id === selectedWorker.value.id)

const openWorkerModal = async (w: WorkerProfile) => {
  isModalOpen.value = true
  isLoadingModal.value = true
  selectedScore.value = 0
  ratingComment.value = ''
  
  try {
    const worker = await WorkersService.getOne(w.id)
    selectedWorker.value = worker
    
    const ratings = await RatingsService.getForUser(worker.id)
    ratingsData.value = { average: ratings.average, total: ratings.total ?? ratings.count }
    ratingsList.value = ratings.data || ratings.ratings || []
    if (ratings.breakdown) {
      breakdown.value = ratings.breakdown
    } else {
      breakdown.value = { avg_punctuality: 0, avg_quality: 0, avg_communication: 0, recommend_pct: 0 }
    }

    if (!isMe.value && currentUser.value) {
      try {
        chatStatus.value = await ChatService.getRequestStatus(worker.id) as ChatStatus
      } catch {
        chatStatus.value = null
      }
    }
  } catch {
    selectedWorker.value = null
  } finally {
    isLoadingModal.value = false
  }
}

const closeWorkerModal = () => {
  isModalOpen.value = false
  lightboxImage.value = null
}

const openLightbox = (img: string) => {
  lightboxImage.value = img
}

const submitRating = async () => {
  if (selectedScore.value === 0) {
    showToast('Selecciona una calificación', 'info')
    return
  }
  if (!selectedWorker.value) return
  try {
    await RatingsService.create({
      ratedId: selectedWorker.value.id,
      score: selectedScore.value,
      comment: ratingComment.value.trim()
    })
    showToast('¡Calificación enviada!', 'success')
    // reload modal data
    openWorkerModal(selectedWorker.value)
  } catch {
    showToast('Error al calificar', 'error')
  }
}

// Chat Actions
const requestDirectChat = async () => {
  if (!currentUser.value) {
    router.push('/login')
    return
  }
  if (!selectedWorker.value) return
  try {
    const res = await ChatService.sendRequest(selectedWorker.value.id)
    const chatRes = res as { conversation_id?: string }
    if (chatRes.conversation_id) {
      router.push(`/chat?conversation_id=${chatRes.conversation_id}`)
    } else {
      showToast('Solicitud enviada', 'success')
      openWorkerModal(selectedWorker.value)
    }
  } catch {
    showToast('No se pudo enviar la solicitud', 'error')
  }
}

const respondDirectRequest = async (action: 'accepted' | 'rejected') => {
  const status = chatStatus.value as { request_id?: string } | null
  if (!status?.request_id) return
  try {
    const apiAction = action === 'accepted' ? 'accept' : 'reject'
    const res = await ChatService.respondRequest(status.request_id, apiAction)
    const chatRes = res as { conversation_id?: string }
    if (chatRes.conversation_id) {
      router.push(`/chat?conversation_id=${chatRes.conversation_id}`)
    } else {
      showToast(action === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada', 'success')
      closeWorkerModal()
    }
  } catch {
    showToast('No se pudo responder la solicitud', 'error')
  }
}
</script>

<style scoped>
.workers-page    { padding-top: var(--space-8); padding-bottom: var(--space-16); }
.workers-header  { margin-bottom: var(--space-8); }
.workers-header h1 { font-size: var(--fs-2xl); margin-bottom: var(--space-2); letter-spacing: -0.02em; }
.workers-header p  { color: var(--color-text-secondary); margin: 0; }
.workers-filters { display: flex; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap; }
.workers-filters input, .workers-filters select { flex: 1; min-width: 160px; }
.workers-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-5); }

@media (max-width: 767px) {
  .workers-page { padding-top: var(--space-5); padding-bottom: var(--space-10); }
  .workers-header { margin-bottom: var(--space-5); }
  .workers-header h1 { font-size: var(--fs-xl); }
  .workers-filters { flex-direction: column; gap: var(--space-2); }
  .workers-filters input, .workers-filters select { min-width: 0; width: 100%; }
  .workers-grid { grid-template-columns: 1fr 1fr; gap: var(--space-3); }
}
@media (max-width: 479px) {
  .workers-grid { grid-template-columns: 1fr; }
}

/* Worker card portfolio strip */
.worker-card__portfolio {
  display: flex;
  gap: 4px;
  padding: 0 var(--space-4);
  margin-bottom: var(--space-3);
}
.worker-card__portfolio img {
  width: 48px;
  height: 36px;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--color-border-light);
}
.worker-card__portfolio-more {
  width: 48px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border-light);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

/* Worker detail modal */
.worker-modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:var(--z-modal); align-items:flex-start; justify-content:center; padding:var(--space-8) var(--space-4); overflow-y:auto; }
.worker-modal-overlay.open { display:flex; }
.worker-modal { background:var(--color-surface); border:1px solid var(--color-border-light); border-radius:var(--radius-2xl); padding:var(--space-8); width:100%; max-width:560px; animation:scaleIn var(--transition) forwards; }
.worker-modal__header { display:flex; align-items:center; gap:var(--space-4); margin-bottom:var(--space-6); }
.worker-modal__avatar { width:64px; height:64px; border-radius:var(--radius-full); background:var(--color-primary-50); border:1px solid var(--color-primary-100); color:var(--color-primary); display:flex; align-items:center; justify-content:center; font-weight:var(--fw-bold); font-size:var(--fs-lg); overflow:hidden; flex-shrink:0; }
.worker-modal__avatar img { width:100%; height:100%; object-fit:cover; }
.worker-modal__close { position:absolute; top:var(--space-4); right:var(--space-4); background:none; border:none; color:var(--color-text-muted); cursor:pointer; }
.rating-stars { display:flex; gap:var(--space-1); }
.rating-stars button { background:none; border:none; font-size:var(--fs-xl); cursor:pointer; transition:transform 0.15s; color:var(--color-border); }
.rating-stars button:hover { transform:scale(1.2); }
.rating-stars button.active { color:#f59e0b; }
.rating-item { border-bottom:1px solid var(--color-border-light); padding:var(--space-3) 0; }
.rating-item:last-child { border-bottom:none; }

/* Reputation Section */
.rep-section { margin-top: var(--space-6); border-top: 1px solid var(--color-border-light); padding-top: var(--space-5); }
.rep-section__title { font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin-bottom: var(--space-3); }
.rep-card { background: var(--color-surface-alt); border: 1px solid var(--color-border-light); border-radius: var(--radius-xl); padding: var(--space-4); }
.rep-card__summary { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
.rep-card__score { display: flex; flex-direction: column; }
.rep-card__number { font-family: var(--font-heading); font-size: var(--fs-3xl); font-weight: var(--fw-extrabold); color: var(--color-text); line-height: 1; }
.rep-card__stars { color: #f59e0b; font-size: var(--fs-sm); margin-top: 2px; }
.rep-card__count { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
.rep-card__recommend { text-align: right; }
.rep-card__recommend-pct { font-family: var(--font-heading); font-size: var(--fs-2xl); font-weight: var(--fw-bold); color: var(--color-primary); display: block; line-height: 1; }
.rep-card__recommend-label { font-size: 11px; color: var(--color-text-muted); }
.rep-bars { display: flex; flex-direction: column; gap: var(--space-2); }
.rep-bar { display: flex; align-items: center; gap: var(--space-3); }
.rep-bar__label { font-size: var(--fs-xs); color: var(--color-text-secondary); width: 90px; flex-shrink: 0; }
.rep-bar__track { flex: 1; height: 6px; background: var(--color-border-light); border-radius: var(--radius-full); overflow: hidden; }
.rep-bar__fill { height: 100%; background: var(--color-primary); border-radius: var(--radius-full); transition: width var(--transition); }
.rep-bar__value { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); width: 24px; text-align: right; }
.rep-empty { font-size: var(--fs-sm); color: var(--color-text-muted); }
.rep-reviews { margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.rep-review { border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: var(--space-3); }
.rep-review__header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
.rep-review__avatar { width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--color-primary-50); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; overflow: hidden; flex-shrink: 0; }
.rep-review__avatar img { width: 100%; height: 100%; object-fit: cover; }
.rep-review__name { font-size: var(--fs-sm); font-weight: var(--fw-semibold); display: block; }
.rep-review__stars { color: #f59e0b; font-size: var(--fs-xs); }
.rep-review__comment { font-size: var(--fs-sm); color: var(--color-text-secondary); margin: 0; }
.rep-review__tags { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-2); }
.rep-tag { font-family: var(--font-mono); font-size: 10px; background: var(--color-surface-alt); border: 1px solid var(--color-border-light); padding: 2px 8px; border-radius: var(--radius-full); color: var(--color-text-muted); }

/* Portfolio in modal */
.portfolio-modal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: var(--space-2);
}
.portfolio-modal-item {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.portfolio-modal-item:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.portfolio-modal-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.portfolio-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: calc(var(--z-modal) + 10);
  cursor: zoom-out;
  animation: fadeIn 0.2s ease;
}
.portfolio-lightbox img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: var(--radius-lg);
  object-fit: contain;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
