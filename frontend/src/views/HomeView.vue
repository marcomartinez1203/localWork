<template>
  <div class="container home-page">
    <div class="home-layout">
      <!-- Columna Izquierda: Perfil + Navegación -->
      <ProfileSidebar />

      <!-- Columna Central: Feed Principal -->
      <div class="home-center">
        <!-- Search Bar -->
        <div class="search-bar">
          <svg class="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
          </svg>
          <input type="text" class="search-bar__input" v-model="searchQuery" @input="debounceSearch"
                 placeholder="Cargo, empresa o palabra clave..."
                 aria-label="Buscar empleos" autocomplete="off" @keydown.esc="clearSearch">
          <button v-show="searchQuery" type="button" class="search-bar__clear" @click="clearSearch" aria-label="Limpiar búsqueda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <p class="search-bar__hint" v-show="searchHint" v-html="searchHint"></p>

        <!-- Filters -->
        <div class="filters" aria-label="Filtros de búsqueda">
          <div class="filters__row">
            <div class="filters__chips" role="radiogroup" aria-label="Filtrar por categoría">
              <button class="chip" :class="{ active: activeCategory === 'all' }" @click="setCategory('all')">Todos</button>
              <button class="chip" :class="{ active: activeCategory === 'Salud' }" @click="setCategory('Salud')">Salud</button>
              <button class="chip" :class="{ active: activeCategory === 'Tecnología' }" @click="setCategory('Tecnología')">Tecnología</button>
              <button class="chip" :class="{ active: activeCategory === 'Comercio' }" @click="setCategory('Comercio')">Comercio</button>
              <button class="chip" :class="{ active: activeCategory === 'Construcción' }" @click="setCategory('Construcción')">Construcción</button>
              <button class="chip" :class="{ active: activeCategory === 'Educación' }" @click="setCategory('Educación')">Educación</button>
              <button class="chip" :class="{ active: activeCategory === 'Agropecuario' }" @click="setCategory('Agropecuario')">Agro</button>
              <button class="chip" :class="{ active: activeCategory === 'Restaurantes' }" @click="setCategory('Restaurantes')">Restaurantes</button>
              <button class="chip" :class="{ active: activeCategory === 'Transporte' }" @click="setCategory('Transporte')">Transporte</button>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/></svg>
              Recomendados
            </h2>
            <p class="recommended-subtitle">Match semántico</p>
          </div>
          <div class="jobs-list">
            <JobCard v-for="(job, index) in recommendedJobs" :key="'rec-'+job.id" :job="job" :style="`--i:${index}`" class="card-enter recommended-card" />
          </div>
          <hr class="section-divider" />
        </div>

        <!-- Job Cards List -->
        <div v-if="isLoading" class="jobs-list">
          <div v-for="i in 4" :key="i" class="skeleton" style="height: 180px;"></div>
        </div>

        <div v-else-if="jobs.length > 0" class="jobs-list">
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

      <!-- Columna Derecha: Panel intuitivo -->
      <RightSidebar
        @filter-modality="onModalityFilter"
        @filter-sort="onSortFilter"
        @clear-filters="onClearFilters"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import JobsService from '@/services/jobs.service'
import JobCard from '@/components/JobCard.vue'
import ProfileSidebar from '@/components/ProfileSidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import type { User, Job } from '@/types'

const router = useRouter()

const user = ref<User | null>(null)
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

const ITEMS_PER_PAGE = 10
let searchTimeout: ReturnType<typeof setTimeout> | null = null

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

/* ── Right sidebar filter handlers ── */
const onModalityFilter = (modality: string) => {
  activeModality.value = modality
  resetPage()
}

const onSortFilter = (sort: string) => {
  activeSort.value = sort
  resetPage()
}

const onClearFilters = () => {
  activeModality.value = 'all'
  activeSort.value = 'newest'
  activeCategory.value = 'all'
  activeLocation.value = 'all'
  searchQuery.value = ''
  searchHint.value = ''
  resetPage()
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
      searchHint.value = `Buscando: ${words.map(w => `<strong>${w}</strong>`).join(' + ')}`
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

.recommended-card {
  border-left: 3px solid var(--color-primary);
}

.section-divider {
  margin: var(--space-8) 0;
  border: 0;
  border-top: 1px solid var(--color-border);
}
</style>
