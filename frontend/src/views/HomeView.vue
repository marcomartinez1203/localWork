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
    </div>

    <!-- Filters -->
    <div class="filters" aria-label="Filtros de búsqueda">
      <div class="filters__row">
        <div class="filters__chips">
          <button class="chip" :class="{ active: activeCategory === 'all' }" @click="setCategory('all')">Todos</button>
          <button class="chip" :class="{ active: activeCategory === 'Salud' }" @click="setCategory('Salud')">Salud</button>
          <button class="chip" :class="{ active: activeCategory === 'Tecnología' }" @click="setCategory('Tecnología')">Tecnología</button>
          <button class="chip" :class="{ active: activeCategory === 'Comercio' }" @click="setCategory('Comercio')">Comercio</button>
          <button class="chip" :class="{ active: activeCategory === 'Construcción' }" @click="setCategory('Construcción')">Construcción</button>
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/assets/js/services/auth.service.js'
import JobsService from '@/assets/js/services/jobs.service.js'
import JobCard from '@/components/JobCard.vue'

const router = useRouter()

// State
const user = ref(null)
const stats = ref({})
const jobs = ref([])
const totalJobs = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const isLoading = ref(true)

// Filters
const activeCategory = ref('all')
const activeModality = ref('all')
const activeLocation = ref('all')
const activeSort = ref('newest')
const searchQuery = ref('')
const searchHint = ref('')

const ITEMS_PER_PAGE = 9
let searchTimeout = null

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

  fetchJobs()
})

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

const setCategory = (category) => {
  activeCategory.value = category
  resetPage()
}

const resetPage = () => {
  currentPage.value = 1
  fetchJobs()
}

const goToPage = (page) => {
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
</style>
