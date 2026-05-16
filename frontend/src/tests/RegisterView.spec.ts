import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterView from '../views/auth/RegisterView.vue'
import AuthService from '../services/auth.service'

vi.mock('../services/auth.service', () => ({
  default: {
    register: vi.fn(),
    isAuthenticated: vi.fn(() => false),
    getPostAuthRoute: vi.fn(() => '/home'),
    getUser: vi.fn(() => ({ id: '1', role: 'seeker' }))
  }
}))

const mockRouter = { push: vi.fn() }
const mockRoute = { query: {} }

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

describe('RegisterView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.query = {}
  })

  it('renders step 1 correctly', () => {
    const wrapper = mount(RegisterView, {
      global: { stubs: ['router-link'] }
    })
    
    expect(wrapper.find('h1').text()).toBe('Crear cuenta')
    expect(wrapper.find('.step-dot.active').exists()).toBe(true)
    expect(wrapper.find('.roles').exists()).toBe(true)
    expect(wrapper.find('#fullName').exists()).toBe(true)
    expect(wrapper.find('#regEmail').exists()).toBe(true)
  })

  it('validates step 1 before proceeding to step 2', async () => {
    const wrapper = mount(RegisterView, {
      global: { stubs: ['router-link'] }
    })
    
    // Intentar ir al paso 2 sin llenar datos
    await wrapper.find('.btn-main').trigger('click')
    
    // Debería mostrar errores y seguir en paso 1
    expect((wrapper.vm as any).roleError).toBe(true)
    expect((wrapper.vm as any).nameError).toBe(true)
    expect((wrapper.vm as any).emailError).toBe(true)
    expect((wrapper.vm as any).step).toBe(1)
    
    // Llenar datos correctamente
    ;(wrapper.vm as any).selectedRole = 'seeker'
    await wrapper.find('#fullName').setValue('Juan Perez')
    await wrapper.find('#regEmail').setValue('juan@test.com')
    await wrapper.find('.btn-main').trigger('click')
    
    // Debería pasar al paso 2
    expect((wrapper.vm as any).step).toBe(2)
  })

  it('shows employer fields when role is employer', async () => {
    const wrapper = mount(RegisterView, {
      global: { stubs: ['router-link'] }
    })
    
    // Forzamos paso 2 como empleador
    ;(wrapper.vm as any).step = 2
    ;(wrapper.vm as any).selectedRole = 'employer'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.intent-box').exists()).toBe(true)
    expect(wrapper.find('#companyName').exists()).toBe(true)
    expect(wrapper.find('#companyNit').exists()).toBe(true)
  })

  it('submits registration successfully', async () => {
    const registerMock = AuthService.register as any
    registerMock.mockResolvedValueOnce({ token: '123', user: { id: '1' } })

    const wrapper = mount(RegisterView, {
      global: { stubs: ['router-link'] }
    })
    
    // Set datos
    ;(wrapper.vm as any).selectedRole = 'seeker'
    ;(wrapper.vm as any).fullName = 'Juan Perez'
    ;(wrapper.vm as any).email = 'juan@test.com'
    ;(wrapper.vm as any).password = 'password123'
    ;(wrapper.vm as any).confirmPassword = 'password123'
    ;(wrapper.vm as any).terms = true
    
    // Forzamos paso 2 y submit
    ;(wrapper.vm as any).step = 2
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(registerMock).toHaveBeenCalledWith({
      fullName: 'Juan Perez',
      email: 'juan@test.com',
      phone: undefined,
      password: 'password123',
      role: 'seeker',
      workType: undefined,
      companyName: undefined,
      companyNit: undefined
    })
  })
})
