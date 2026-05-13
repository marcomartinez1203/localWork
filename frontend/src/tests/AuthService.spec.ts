import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import AuthService from '../services/auth.service'

vi.mock('../config/api', () => ({
  default: { 
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({})
  }
}))

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('debe iniciar sesión vacía correctamente', () => {
    expect(AuthService.isAuthenticated()).toBe(false)
    expect(AuthService.getUser()).toBeNull()
    expect(AuthService.getToken()).toBeNull()
  })

  it('debe leer datos de localStorage si existen', () => {
    const mockUser = { id: '123', email: 'test@local.com', role: 'seeker' }
    localStorage.setItem('lw_token', 'test-token-123')
    localStorage.setItem('lw_user', JSON.stringify(mockUser))

    expect(AuthService.isAuthenticated()).toBe(true)
    expect(AuthService.getToken()).toBe('test-token-123')
    expect(AuthService.getUser()).toEqual(mockUser)
  })

  it('logout() debe limpiar localStorage', async () => {
    localStorage.setItem('lw_token', 'test-token-123')
    localStorage.setItem('lw_user', '{"id":"123"}')
    
    const originalLocation = window.location
    delete (window as any).location
    window.location = { ...originalLocation, href: '' } as any

    await AuthService.logout()

    expect(localStorage.getItem('lw_token')).toBeNull()
    expect(localStorage.getItem('lw_user')).toBeNull()
    
    ;(window as any).location = originalLocation
  })
})
