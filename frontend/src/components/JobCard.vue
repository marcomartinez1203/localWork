<template>
  <article class="job-card" tabindex="0" role="link" :aria-label="'Ver oferta: ' + job.title" @click="goToDetail">
    <div class="job-card__header">
      <div class="job-card__company-logo" aria-hidden="true">{{ companyInitial }}</div>
      <div class="job-card__title-group">
        <h3 class="job-card__title">{{ job.title }}</h3>
        <p class="job-card__company">{{ job.company_name || '' }}</p>
      </div>
      <span class="badge" :class="modalityClass">{{ job.modality }}</span>
    </div>

    <div class="job-card__body">
      <p class="job-card__description">{{ truncatedDescription }}</p>
      <div class="job-card__meta">
        <span class="job-card__meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          {{ job.location || 'Sin especificar' }}
        </span>
        <span class="job-card__meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
          </svg>
          {{ job.category_name || '' }}
        </span>
        <span v-if="job.vacancies > 1" class="job-card__meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>
          </svg>
          {{ job.vacancies }} vacantes
        </span>
      </div>
    </div>

    <div class="job-card__footer">
      <span class="job-card__salary">{{ salaryDisplay }}</span>
      <span class="job-card__date">{{ timeAgoComputed }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Job } from '@/types'

const props = defineProps<{
  job: Job
}>()

const router = useRouter()

const goToDetail = () => {
  router.push(`/job/${props.job.id}`)
}

const companyInitial = computed(() => {
  return props.job.company_name
    ? props.job.company_name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : '??'
})

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
}

const salaryDisplay = computed(() => {
  return props.job.salary_text || 
         (props.job.salary_min ? formatCurrency(props.job.salary_min) + (props.job.salary_max ? ' – ' + formatCurrency(props.job.salary_max) : '') : 'A convenir')
})

const truncatedDescription = computed(() => {
  if (!props.job.description) return ''
  return props.job.description.length > 120 
    ? props.job.description.substring(0, 120) + '...'
    : props.job.description
})

const modalityClass = computed(() => {
  const classes: Record<string, string> = {
    'Presencial': 'badge--primary',
    'Remoto': 'badge--accent',
    'Híbrido': 'badge--warning',
  }
  return classes[props.job.modality] || 'badge--neutral'
})

const timeAgoComputed = computed(() => {
  if (!props.job.created_at) return ''
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = new Date().getTime() - new Date(props.job.created_at).getTime();

  if (elapsed < msPerMinute) { return 'hace un momento'; }
  else if (elapsed < msPerHour) { return 'hace ' + Math.round(elapsed/msPerMinute) + ' minutos'; }
  else if (elapsed < msPerDay ) { return 'hace ' + Math.round(elapsed/msPerHour ) + ' horas'; }
  else if (elapsed < msPerMonth) { return 'hace ' + Math.round(elapsed/msPerDay) + ' días'; }
  else if (elapsed < msPerYear) { return 'hace ' + Math.round(elapsed/msPerMonth) + ' meses'; }
  else { return 'hace ' + Math.round(elapsed/msPerYear ) + ' años'; }
})
</script>
