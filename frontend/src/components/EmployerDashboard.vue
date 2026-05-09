<template>
  <div class="employer-dashboard">
    <!-- Cargando -->
    <div v-if="loading" class="dashboard-loading">
      <div class="spinner"></div>
      <span>Cargando analíticas...</span>
    </div>

    <div v-else-if="error" class="dashboard-error">
      <p>{{ error }}</p>
    </div>

    <template v-else>
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
          </div>
          <div>
            <h3 class="stat-title">Ofertas Publicadas</h3>
            <p class="stat-value">{{ analytics?.total_jobs || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #007200; background: rgba(0,114,0,0.1);">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h3 class="stat-title">Vistas Recibidas</h3>
            <p class="stat-value">{{ analytics?.total_views || 0 }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="color: #0ea5e9; background: rgba(14,165,233,0.1);">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </div>
          <div>
            <h3 class="stat-title">Postulantes</h3>
            <p class="stat-value">{{ analytics?.total_applications || 0 }}</p>
          </div>
        </div>
        <div class="stat-card stat-card--highlight">
          <div class="stat-icon" style="color: #f59e0b; background: rgba(245,158,11,0.1);">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg>
          </div>
          <div>
            <h3 class="stat-title">Conversión</h3>
            <p class="stat-value">{{ conversionRate }}%</p>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">Evolución de Postulaciones (Últimos 7 días)</h3>
        <div class="chart-wrapper">
          <Line v-if="hasChartData" :data="chartData" :options="chartOptions" />
          <div v-else class="chart-empty">No hay suficientes datos recientes.</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CompaniesService from '@/services/companies.service'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

interface AnalyticsData {
  total_jobs: number;
  total_views: number;
  total_applications: number;
  chart_data: { date: string; count: number }[];
}

const loading = ref(true)
const error = ref('')
const analytics = ref<AnalyticsData | null>(null)

const conversionRate = computed(() => {
  if (!analytics.value || analytics.value.total_views === 0) return 0
  return ((analytics.value.total_applications / analytics.value.total_views) * 100).toFixed(1)
})

const hasChartData = computed(() => {
  return analytics.value?.chart_data?.some(d => d.count > 0) || false
})

const chartData = computed(() => {
  const data = analytics.value?.chart_data || []
  return {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Postulaciones',
        data: data.map(d => d.count),
        borderColor: '#007200',
        backgroundColor: 'rgba(0, 114, 0, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#007200',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.3 // Curva suave
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#161616',
      titleFont: { family: 'Inter', size: 13, weight: 'bold' as const },
      bodyFont: { family: 'Inter', size: 14 },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: { family: 'Inter', size: 12 }
      },
      grid: {
        color: 'rgba(0,0,0,0.05)',
        drawBorder: false,
      },
      border: { display: false }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: { family: 'Inter', size: 12 }
      },
      border: { display: false }
    }
  }
}

onMounted(async () => {
  try {
    const data = await CompaniesService.getAnalytics()
    analytics.value = data
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.message || 'Error al cargar las analíticas'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.employer-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.dashboard-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--color-text-muted);
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-2xl);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.dashboard-error {
  padding: var(--space-4);
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: var(--radius-lg);
  text-align: center;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: transform var(--transition), box-shadow var(--transition);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -6px rgba(0,0,0,0.06);
}

.stat-card--highlight {
  border-color: rgba(245,158,11,0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-title {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  font-weight: var(--fw-medium);
  margin: 0 0 4px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-heading);
  margin: 0;
  line-height: 1;
  font-family: var(--font-mono);
}

.chart-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-5) var(--space-6);
}

.chart-title {
  margin: 0 0 var(--space-5) 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: var(--color-heading);
}

.chart-wrapper {
  height: 320px;
  width: 100%;
  position: relative;
}

.chart-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
}
</style>
