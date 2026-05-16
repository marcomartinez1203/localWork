import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString() },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock de vue-router globalmente para no inyectarlo en cada test
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
}

config.global.mocks = {
  $router: mockRouter,
  $route: { path: '/' }
}

// Limpiar mocks después de cada test
afterEach(() => {
  vi.clearAllMocks()
})
