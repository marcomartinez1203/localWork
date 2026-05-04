// ============================================
// LocalWork — HelloWorld Component Test
// ============================================
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../components/HelloWorld.vue'

describe('HelloWorld', () => {
  it('renderiza el mensaje recibido por props', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hola LocalWork' }
    })
    expect(wrapper.find('h1').text()).toBe('Hola LocalWork')
  })

  it('tiene la clase green en el h1', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Test' }
    })
    expect(wrapper.find('h1').classes()).toContain('green')
  })
})
