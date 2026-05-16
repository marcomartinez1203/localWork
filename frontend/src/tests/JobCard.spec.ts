import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import JobCard from '../components/JobCard.vue'

const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

describe('JobCard.vue', () => {
  const dummyJob = {
    id: '123-abc',
    title: 'Desarrollador Frontend',
    company_name: 'Tech Solutions',
    modality: 'Remoto',
    location: 'Aguachica, Cesar',
    category_name: 'Tecnología',
    vacancies: 2,
    salary_min: 2000000,
    salary_max: 3000000,
    description: 'Buscamos un desarrollador frontend con experiencia en Vue 3 y TypeScript. ' + 'a'.repeat(100), // > 120 chars
    created_at: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders job title and company', () => {
    const wrapper = mount(JobCard, { props: { job: dummyJob } })
    
    expect(wrapper.find('h3').text()).toBe('Desarrollador Frontend')
    expect(wrapper.find('.job-card__company').text()).toBe('Tech Solutions')
    // Verifica iniciales (TS)
    expect(wrapper.find('.job-card__company-logo').text()).toBe('TS')
  })

  it('formats currency correctly', () => {
    const wrapper = mount(JobCard, { props: { job: dummyJob } })
    
    // Debería formatearse como "$ 2.000.000 - $ 3.000.000" (aprox dependiendo del locale)
    const salaryText = wrapper.find('.job-card__salary').text()
    expect(salaryText).toContain('2.000.000')
    expect(salaryText).toContain('3.000.000')
  })

  it('truncates long descriptions', () => {
    const wrapper = mount(JobCard, { props: { job: dummyJob } })
    
    const descText = wrapper.find('.job-card__description').text()
    expect(descText.length).toBeLessThan(125)
    expect(descText.endsWith('...')).toBe(true)
  })

  it('navigates to job detail on click', async () => {
    const wrapper = mount(JobCard, { props: { job: dummyJob } })
    
    await wrapper.find('.job-card').trigger('click')
    
    expect(mockRouter.push).toHaveBeenCalledWith('/job/123-abc')
  })

  it('handles jobs without company correctly', () => {
    const jobNoCompany = { ...dummyJob, company_name: undefined }
    const wrapper = mount(JobCard, { props: { job: jobNoCompany as any } })
    
    expect(wrapper.find('.job-card__company-logo').text()).toBe('??')
    expect(wrapper.find('.job-card__company').text()).toBe('')
  })
})
