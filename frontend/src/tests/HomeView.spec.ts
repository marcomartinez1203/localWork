import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../views/HomeView.vue'
import AuthService from '../services/auth.service'
import JobsService from '../services/jobs.service'

// Mocks
vi.mock('../services/auth.service', () => ({
  default: {
    isAuthenticated: vi.fn(() => true),
    getUser: vi.fn(() => ({ id: '1', role: 'seeker' }))
  }
}))

vi.mock('../services/jobs.service', () => ({
  default: {
    list: vi.fn(),
    getRecommended: vi.fn()
  }
}))

const mockRouter = {
  push: vi.fn()
}
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

// Mock de componentes hijos
vi.mock('../components/ProfileSidebar.vue', () => ({
  default: { name: 'ProfileSidebar', template: '<div>ProfileSidebar</div>' }
}))
vi.mock('../components/RightSidebar.vue', () => ({
  default: { name: 'RightSidebar', template: '<div>RightSidebar</div>' }
}))
vi.mock('../components/JobCard.vue', () => ({
  default: { name: 'JobCard', template: '<div class="mock-job-card"></div>', props: ['job'] }
}))

describe('HomeView.vue', () => {
  const mockJobsResponse = {
    data: [{ id: '1', title: 'Job 1' }, { id: '2', title: 'Job 2' }],
    total: 2,
    total_pages: 1,
    page: 1,
    per_page: 10
  }

  const mockRecommended = [
    { id: '3', title: 'Rec Job 1' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(JobsService.list as any).mockResolvedValue(mockJobsResponse)
    ;(JobsService.getRecommended as any).mockResolvedValue(mockRecommended)
  })

  it('redirects to login if not authenticated', async () => {
    ;(AuthService.isAuthenticated as any).mockReturnValueOnce(false)
    
    mount(HomeView)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('fetches and displays jobs and recommendations on mount', async () => {
    const wrapper = mount(HomeView)
    
    // Wait for async setup
    await wrapper.vm.$nextTick() // for setup
    await new Promise(r => setTimeout(r, 0)) // clear microtask queue
    await wrapper.vm.$nextTick() // for re-render
    
    expect(JobsService.list).toHaveBeenCalled()
    expect(JobsService.getRecommended).toHaveBeenCalled()
    
    // Verificar que se renderizan las cards
    const jobCards = wrapper.findAll('.mock-job-card')
    // 2 normales + 1 recomendado = 3 (asumiendo que muestra ambas listas)
    expect(jobCards.length).toBe(3)
    
    // Verificar título de recomendados
    expect(wrapper.text()).toContain('Recomendados')
  })

  it('updates category filter and refetches', async () => {
    const wrapper = mount(HomeView)
    await new Promise(r => setTimeout(r, 0))
    
    // Click on Technology category
    const techChip = wrapper.findAll('.chip').find(c => c.text() === 'Tecnología')
    await techChip?.trigger('click')
    
    expect(wrapper.vm.activeCategory).toBe('Tecnología')
    
    // Debería llamar de nuevo a list() con la categoría
    expect(JobsService.list).toHaveBeenLastCalledWith(expect.objectContaining({
      category: 'Tecnología',
      page: 1
    }))
  })

  it('hides recommendations when searching', async () => {
    const wrapper = mount(HomeView)
    await new Promise(r => setTimeout(r, 0))
    
    expect(wrapper.find('.recommended-section').exists()).toBe(true)
    
    wrapper.vm.searchQuery = 'Test'
    await wrapper.vm.$nextTick()
    
    // Al haber búsqueda, la sección de IA se oculta
    expect(wrapper.find('.recommended-section').exists()).toBe(false)
  })
})
