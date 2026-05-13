<template>
  <div class="container home-page">
    
    <!-- Page Header -->
    <div class="home-header">
      <p class="home-header__greeting">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:6px;">
          <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>
        </svg> Hola{{ firstName ? ', ' + firstName : '' }}
      </p>
      <h1 class="home-header__title">Encuentra tu próximo empleo</h1>

      <!-- Search Bar -->
      <div class="search-bar">
        <svg class="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
        </svg>
        <input type="text" class="search-bar__input" v-model="searchQuery" @input="debounceSearch"
               placeholder="Ej: vendedor centro, electricista, restaurante..."
               aria-label="Buscar empleos" autocomplete="off" @keydown.esc="clearSearch">
        <button v-show="searchQuery" type="button" class="search-bar__clear" @click="clearSearch" aria-label="Limpiar búsqueda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <p class="search-bar__hint" v-show="searchHint" v-html="searchHint"></p>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats" aria-label="Estadísticas rápidas">
      <div class="quick-stat">
        <div class="quick-stat__icon quick-stat__icon--blue" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"/>
          </svg>
        </div>
        <div>
          <span class="quick-stat__value">{{ stats.active_jobs || '—' }}</span>
          <span class="quick-stat__label">Ofertas activas</span>
        </div>
      </div>
      <!-- Las demás estadísticas pueden ser estáticas como en el original o cargadas del backend si las tiene -->
      <div class="quick-stat">
        <div class="quick-stat__icon quick-stat__icon--green" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>
          </svg>
        </div>
        <div>
          <span class="quick-stat__value">45</span>
          <span class="quick-stat__label">Empresas</span>
        </div>
      </div>
      <div class="quick-stat">
        <div class="quick-stat__icon quick-stat__icon--orange" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/>
          </svg>
        </div>
        <div>
          <span class="quick-stat__value">320</span>
          <span class="quick-stat__label">Postulaciones hoy</span>
        </div>
      </div>
      <div class="quick-stat">
        <div class="quick-stat__icon quick-stat__icon--purple" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
        </div>
        <div>
          <span class="quick-stat__value">89%</span>
          <span class="quick-stat__label">Tasa de respuesta</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters" aria-label="Filtros de búsqueda">
      <div class="filters__row">
        <div class="filters__chips" role="radiogroup" aria-label="Filtrar por categoría">
          <button class="chip" :class="{ active: activeCategory === 'all' }" @click="setCategory('all')">Todos</button>
          <button class="chip" :class="{ active: activeCategory === 'Salud' }" @click="setCategory('Salud')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg> Salud
          </button>
          <button class="chip" :class="{ active: activeCategory === 'Tecnología' }" @click="setCategory('Tecnología')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"/></svg> Tecnología
          </button>
          <button class="chip" :class="{ active: activeCategory === 'Comercio' }" @click="setCategory('Comercio')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg> Comercio
          </button>
          <button class="chip" :class="{ active: activeCategory === 'Construcción' }" @click="setCategory('Construcción')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg> Construcción
          </button>
          <button class="chip" :class="{ active: activeCategory === 'Educación' }" @click="setCategory('Educación')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/></svg> Educación
          </button>
          <button class="chip" :class="{ active: activeCategory === 'Agropecuario' }" @click="setCategory('Agropecuario')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg> Agropecuario
          </button>
          <button class="chip" :class="{ active: activeCategory === 'Restaurantes' }" @click="setCategory('Restaurantes')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/><path d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"/></svg> Restaurantes
          </button>
          <button class="chip" :class="{ active: activeCategory === 'Transporte' }" @click="setCategory('Transporte')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg> Transporte
          </button>
        </div>
      </div>
      <div class="filters__row">
        <div class="filters__selects">
          <select class="filters__select" v-model="activeModality" @change="resetPage">
            <option value="all">Todas las modalidades</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
          </select>
          <select class="filters__select" v-model="activeLocation" @change="resetPage">
            <option value="all">Todas las zonas</option>
            <option value="Centro">Centro</option>
            <option value="Norte">Zona Norte</option>
            <option value="Sur">Zona Sur</option>
          </select>
          <select class="filters__select" v-model="activeSort" @change="resetPage">
            <option value="newest">Más recientes</option>
            <option value="salary-desc">Mayor salario</option>
            <option value="salary-asc">Menor salario</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Info -->
    <div class="results-info">
      <p class="results-info__count" v-html="resultsText"></p>
    </div>

    <!-- Recommended Jobs (AI) -->
    <div v-if="recommendedJobs.length > 0 && !searchQuery" class="recommended-section">
      <div class="recommended-header">
        <h2 class="recommended-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/></svg>
          Recomendados para ti
        </h2>
        <p class="recommended-subtitle">Match semántico basado en tu perfil</p>
      </div>
      <div class="recommended-grid">
        <JobCard v-for="(job, index) in recommendedJobs" :key="'rec-'+job.id" :job="job" :style="`--i:${index}`" class="card-enter recommended-card" />
      </div>
      <hr class="section-divider" />
    </div>

    <!-- Job Cards Grid -->
    <div v-if="isLoading" class="jobs-grid">
      <div v-for="i in 3" :key="i" class="skeleton" style="height:280px;border-radius:var(--radius-lg);"></div>
    </div>
    
    <div v-else-if="jobs.length > 0" class="jobs-grid">
      <JobCard v-for="(job, index) in jobs" :key="job.id" :job="job" :style="`--i:${index}`" class="card-enter" />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
        <path d="M8 11h6"/>
      </svg>
      <h3 class="empty-state__title">No se encontraron ofertas</h3>
      <p class="empty-state__desc">Intenta ajustar los filtros o cambia la búsqueda para encontrar lo que buscas.</p>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="pagination__btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
      </button>
      <button v-for="page in totalPages" :key="page" class="pagination__btn" :class="{ active: page === currentPage }" @click="goToPage(page)">
        {{ page }}
      </button>
      <button class="pagination__btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import JobsService from '@/services/jobs.service'
import JobCard from '@/components/JobCard.vue'
import type { User, Job } from '@/types'

const router = useRouter()

const user = ref<User | null>(null)
const stats = ref<Record<string, unknown>>({})
const jobs = ref<Job[]>([])
const recommendedJobs = ref<Job[]>([])
const totalJobs = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const isLoading = ref(true)

const activeCategory = ref('all')
const activeModality = ref('all')
const activeLocation = ref('all')
const activeSort = ref('newest')
const searchQuery = ref('')
const searchHint = ref('')

const ITEMS_PER_PAGE = 9
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const firstName = computed(() => {
  return user.value && user.value.full_name ? user.value.full_name.split(' ')[0] : ''
})

const resultsText = computed(() => {
  if (jobs.value.length === 0) return 'Mostrando <strong>0</strong> ofertas'
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return `Mostrando <strong>${start + 1}–${Math.min(start + ITEMS_PER_PAGE, totalJobs.value)}</strong> de <strong>${totalJobs.value}</strong> ofertas`
})

onMounted(async () => {
  if (!AuthService.isAuthenticated()) {
    router.push('/login')
    return
  }

  user.value = AuthService.getUser()
  if (user.value?.role === 'employer') {
    router.push(user.value.preferred_mode === 'services' ? '/workers' : '/dashboard')
    return
  }

  try {
    stats.value = await JobsService.getStats()
  } catch (e) {
    console.warn('Stats error:', e)
  }

  fetchRecommended()
  fetchJobs()
})

const fetchRecommended = async () => {
  try {
    recommendedJobs.value = await JobsService.getRecommended()
  } catch (err) {
    console.error('Error loading recommendations:', err)
  }
}

const fetchJobs = async () => {
  isLoading.value = true
  try {
    const result = await JobsService.list({
      page: currentPage.value,
      perPage: ITEMS_PER_PAGE,
      category: activeCategory.value !== 'all' ? activeCategory.value : undefined,
      modality: activeModality.value !== 'all' ? activeModality.value : undefined,
      location: activeLocation.value !== 'all' ? activeLocation.value : undefined,
      sort: activeSort.value,
      search: searchQuery.value || undefined,
    })
    
    jobs.value = result.data || []
    totalJobs.value = result.total || 0
    totalPages.value = result.total_pages || 1
  } catch (err) {
    console.error('Error loading jobs:', err)
    jobs.value = []
  } finally {
    isLoading.value = false
  }
}

const setCategory = (category: string) => {
  activeCategory.value = category
  resetPage()
}

const resetPage = () => {
  currentPage.value = 1
  fetchJobs()
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchJobs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value && searchQuery.value.includes(' ')) {
      const words = searchQuery.value.split(/\s+/).filter(w => w.length >= 2)
      searchHint.value = `🔎 Buscando: ${words.map(w => `<strong>${w}</strong>`).join(' + ')}`
    } else {
      searchHint.value = ''
    }
    resetPage()
  }, 400)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchHint.value = ''
  resetPage()
}
</script>

<style scoped>
@import '@/assets/css/pages/home.css';

.recommended-section {
  margin-bottom: var(--space-8);
}
.recommended-header {
  margin-bottom: var(--space-4);
}
.recommended-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}
.recommended-subtitle {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}
.recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
.recommended-card {
  border: 2px solid var(--color-primary-light);
  box-shadow: 0 8px 24px rgba(0, 114, 0, 0.08);
}
.section-divider {
  margin-top: var(--space-8);
  border: 0;
  border-top: 1px solid var(--color-border);
}
</style>
