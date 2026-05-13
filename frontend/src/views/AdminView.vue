<template>
  <div class="admin-view container">
    <header class="page-header">
      <h1 class="page-title">Panel de Administración</h1>
      <p class="page-subtitle">Gestiona verificaciones y monitorea la plataforma.</p>
    </header>

    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <h3>Empleos Activos</h3>
        <div class="stat-val">{{ stats.active_jobs }}</div>
      </div>
      <div class="stat-card">
        <h3>Empresas Activas</h3>
        <div class="stat-val">{{ stats.active_companies }}</div>
      </div>
      <div class="stat-card">
        <h3>Postulaciones Hoy</h3>
        <div class="stat-val">{{ stats.applications_today }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Buscadores</h3>
        <div class="stat-val">{{ stats.total_seekers }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Empleadores</h3>
        <div class="stat-val">{{ stats.total_employers }}</div>
      </div>
    </div>

    <section class="verifications-section">
      <h2 class="section-title">Verificaciones Pendientes</h2>
      <div v-if="loading" class="loading-state">Cargando...</div>
      <div v-else-if="pendingVerifications.length === 0" class="empty-state">
        No hay verificaciones pendientes en este momento.
      </div>
      <div v-else class="verifications-list">
        <div v-for="v in pendingVerifications" :key="v.id" class="verification-card">
          <div class="v-info">
            <h3 class="v-name">{{ v.full_name }}</h3>
            <span class="v-role">{{ v.role === 'seeker' ? 'Buscador' : 'Empleador' }}</span>
            <p class="v-date">Solicitado: {{ new Date(v.created_at).toLocaleDateString() }}</p>
          </div>
          <div class="v-doc">
            <a v-if="v.identity_document_url" :href="v.identity_document_url" target="_blank" class="btn-outline-primary btn-sm">
              Ver Documento Adjunto
            </a>
            <span v-else class="no-doc">Sin documento</span>
          </div>
          <div class="v-actions">
            <button class="btn-primary btn-sm" @click="updateStatus(v.id, 'verified')">Aprobar</button>
            <button class="btn-outline-danger btn-sm" @click="updateStatus(v.id, 'rejected')">Rechazar</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/config/api'

const stats = ref<any>(null)
const pendingVerifications = ref<any[]>([])
const loading = ref(true)

const loadData = async () => {
  loading.value = true
  try {
    const [statsData, verificationsData] = await Promise.all([
      api.get<any>('/admin/stats'),
      api.get<any[]>('/admin/verifications/pending')
    ])
    stats.value = statsData
    pendingVerifications.value = verificationsData
  } catch (err) {
    console.error('Error cargando admin data', err)
    alert('Error cargando datos de administración')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (userId: string, status: 'verified' | 'rejected') => {
  if (!confirm(`¿Estás seguro de ${status === 'verified' ? 'APROBAR' : 'RECHAZAR'} esta verificación?`)) return
  
  try {
    await api.patch(`/admin/verifications/${userId}`, { status })
    // Remove from list
    pendingVerifications.value = pendingVerifications.value.filter(v => v.id !== userId)
  } catch (err) {
    console.error('Error actualizando estado', err)
    alert('Error al actualizar el estado')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-view {
  padding-bottom: var(--space-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
}

.stat-card h3 {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.stat-val {
  font-size: var(--fs-2xl);
  font-weight: 700;
  color: var(--color-primary);
}

.verifications-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.verifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.verification-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius);
}

.v-info {
  flex: 1;
}

.v-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.v-role {
  font-size: var(--fs-xs);
  background: var(--color-border);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  margin-right: var(--space-2);
}

.v-date {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.v-doc {
  flex: 1;
  text-align: center;
}

.v-actions {
  display: flex;
  gap: var(--space-2);
}

.no-doc {
  color: var(--color-danger);
  font-size: var(--fs-sm);
}

@media (max-width: 640px) {
  .verification-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  .v-doc, .v-actions {
    width: 100%;
    text-align: left;
  }
}
</style>
