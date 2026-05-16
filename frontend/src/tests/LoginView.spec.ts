import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '../views/auth/LoginView.vue'
import AuthService from '../services/auth.service'

vi.mock('../services/auth.service', () => ({
  default: {
    login: vi.fn(),
    isAuthenticated: vi.fn(() => false),
    getPostAuthRoute: vi.fn(() => '/home')
  }
}))

describe('LoginView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    const wrapper = mount(LoginView, {
      global: {
        stubs: ['router-link']
      }
    })
    
    expect(wrapper.find('h1').text()).toBe('Bienvenido de vuelta')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('shows validation errors on invalid submit', async () => {
    const wrapper = mount(LoginView, {
      global: { stubs: ['router-link'] }
    })
    
    await wrapper.find('form').trigger('submit.prevent')
    
    // Al intentar enviar vacío, las banderas de error deberían activarse
    expect(wrapper.vm.emailError).toBe(true)
    expect(wrapper.vm.pwError).toBe(true)
  })

  it('calls AuthService.login with valid data', async () => {
    const loginMock = AuthService.login as any
    loginMock.mockResolvedValueOnce({ token: '123', user: { id: '1' } })

    const wrapper = mount(LoginView, {
      global: { stubs: ['router-link'] }
    })
    
    await wrapper.find('input[type="email"]').setValue('test@test.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(loginMock).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' })
  })

  it('shows error message on login failure', async () => {
    const loginMock = AuthService.login as any
    loginMock.mockRejectedValueOnce(new Error('Credenciales inválidas'))

    const wrapper = mount(LoginView, {
      global: { stubs: ['router-link'] }
    })
    
    await wrapper.find('input[type="email"]').setValue('test@test.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    // Forzamos la actualización de Vue tras la promesa
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.errorMessage).toBe('Credenciales inválidas')
    expect(wrapper.find('.lw-alert.show').exists()).toBe(true)
    expect(wrapper.find('.lw-alert').text()).toBe('Credenciales inválidas')
  })
})
