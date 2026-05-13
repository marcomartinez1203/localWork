<template>
  <aside class="home-sidebar-left">
    <div class="home-sidebar-left__inner">

      <!-- 1. Tarjeta de Perfil -->
      <div class="profile-card">
        <div class="profile-card__cover"></div>
        <div class="profile-card__body">
          <div class="profile-card__avatar">
            <img v-if="user?.avatar_url" :src="user.avatar_url" :alt="user.full_name" />
            <span v-else>{{ initials }}</span>
          </div>

          <p class="profile-card__name">
            {{ user?.full_name || 'Usuario' }}
            <span v-if="isVerified" class="verified-badge" title="Identidad verificada">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"/></svg>
            </span>
          </p>

          <p v-if="user?.bio" class="profile-card__bio">{{ truncatedBio }}</p>
          <p v-else class="profile-card__bio profile-card__bio--empty">Completa tu biografía para destacar</p>

          <div v-if="user?.location" class="profile-card__location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            {{ user.location }}
          </div>

          <router-link to="/profile" class="profile-card__btn">Ver perfil completo</router-link>
        </div>
      </div>

      <!-- 2. Mi Actividad -->
      <div class="panel">
        <h3 class="panel__title">Mi actividad</h3>
        <div class="activity-grid">
          <router-link to="/my-applications" class="activity-cell">
            <span class="activity-cell__value">{{ stats.applications }}</span>
            <span class="activity-cell__label">Postulaciones</span>
          </router-link>
          <div class="activity-cell">
            <span class="activity-cell__value">{{ stats.saved }}</span>
            <span class="activity-cell__label">Guardados</span>
          </div>
          <div class="activity-cell">
            <span class="activity-cell__value">{{ stats.views }}</span>
            <span class="activity-cell__label">Vistas perfil</span>
          </div>
        </div>
      </div>

      <!-- 3. Guardados rápidos -->
      <div v-if="savedJobs.length > 0" class="panel">
        <div class="panel__header">
          <h3 class="panel__title">Guardados</h3>
          <router-link to="/home" class="panel__link">Ver todos</router-link>
        </div>
        <div class="saved-list">
          <div
            v-for="job in savedJobs.slice(0, 3)"
            :key="job.id"
            class="saved-item"
            @click="goToJob(job.id)"
          >
            <div class="saved-item__logo">{{ getInitials(job.company_name) }}</div>
            <div class="saved-item__body">
              <p class="saved-item__title">{{ job.title }}</p>
              <p class="saved-item__meta">{{ job.company_name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Completar perfil -->
      <div v-if="profileCompletion < 100" class="panel panel--accent">
        <h3 class="panel__title">Completa tu perfil</h3>
        <div class="checklist">
          <div class="checklist__item" :class="{ done: !!user?.avatar_url }">
            <svg v-if="user?.avatar_url" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            <div v-else class="checklist__circle"></div>
            <span>Foto de perfil</span>
          </div>
          <div class="checklist__item" :class="{ done: !!user?.bio }">
            <svg v-if="user?.bio" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            <div v-else class="checklist__circle"></div>
            <span>Biografía</span>
          </div>
          <div class="checklist__item" :class="{ done: !!user?.resume_url }">
            <svg v-if="user?.resume_url" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            <div v-else class="checklist__circle"></div>
            <span>Subir CV</span>
          </div>
          <div class="checklist__item" :class="{ done: !!(user?.skills && user.skills.length > 0) }">
            <svg v-if="user?.skills && user.skills.length > 0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            <div v-else class="checklist__circle"></div>
            <span>Habilidades</span>
          </div>
        </div>
        <router-link to="/profile" class="panel__btn">Completar ahora</router-link>
      </div>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import ApplicationsService from '@/services/applications.service'
import JobsService from '@/services/jobs.service'
import type { User, Job } from '@/types'

const router = useRouter()
const user = computed<User | null>(() => AuthService.getUser())

const stats = ref({ applications: 0, saved: 0, views: 0 })
const savedJobs = ref<Job[]>([])

const initials = computed(() => {
  if (!user.value || !user.value.full_name) return 'U'
  return user.value.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const truncatedBio = computed(() => {
  const bio = user.value?.bio
  if (!bio) return ''
  return bio.length > 55 ? bio.slice(0, 55) + '…' : bio
})

const isVerified = computed(() => user.value?.verification_status === 'verified')

const profileCompletion = computed(() => {
  const u = user.value
  if (!u) return 0
  const fields = [
    !!u.avatar_url, !!u.full_name, !!u.phone, !!u.bio,
    !!u.location, !!(u.skills && u.skills.length > 0),
    !!(u.education && u.education.length > 0),
    !!(u.experience && u.experience.length > 0),
    !!u.resume_url
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
})

const getInitials = (name?: string) => {
  if (!name) return '??'
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

const goToJob = (id: string) => router.push(`/job/${id}`)

onMounted(async () => {
  try {
    const [apps, saved] = await Promise.all([
      ApplicationsService.getMyApplications({ page: 1, perPage: 1 }),
      JobsService.getSavedJobs()
    ])
    stats.value = {
      applications: apps.total || 0,
      saved: Array.isArray(saved) ? saved.length : 0,
      views: 0
    }
    savedJobs.value = Array.isArray(saved) ? saved.slice(0, 3) : []
  } catch {
    // silent
  }
})
</script>

<style scoped>
/* ── Profile Card ── */
.profile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.profile-card__cover {
  height: 56px;
  background: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border);
}

.profile-card__body {
  padding: var(--space-4);
  text-align: center;
}

.profile-card__avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--color-surface-alt);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--color-primary);
  margin: -52px auto var(--space-3);
  overflow: hidden;
}

.profile-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-card__name {
  font-family: var(--font-heading);
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

.verified-badge {
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
}

.profile-card__bio {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  line-height: 1.4;
  padding: 0 var(--space-2);
}

.profile-card__bio--empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.profile-card__location {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  font-family: var(--font-mono);
}

.profile-card__location svg {
  color: var(--color-text-muted);
}

.profile-card__btn {
  display: inline-flex;
  padding: var(--space-2) var(--space-5);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
}

.profile-card__btn:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* ── Panel ── */
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.panel--accent {
  border-color: var(--color-primary-100);
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.panel__title {
  font-family: var(--font-heading);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.panel__link {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  text-decoration: none;
}

.panel__link:hover {
  text-decoration: underline;
}

.panel__btn {
  display: block;
  width: 100%;
  text-align: center;
  padding: var(--space-3);
  margin-top: var(--space-3);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--radius);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.panel__btn:hover {
  background: var(--color-primary-dark);
}

/* ── Activity Grid ── */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.activity-cell {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-2);
  text-align: center;
  text-decoration: none;
  transition: border-color var(--transition-fast);
}

.activity-cell:hover {
  border-color: var(--color-border-light);
}

.activity-cell__value {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.activity-cell__label {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--font-mono);
}

/* ── Saved List ── */
.saved-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.saved-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.saved-item:hover {
  background: var(--color-surface-alt);
}

.saved-item__logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--fw-bold);
  color: var(--color-primary);
  flex-shrink: 0;
}

.saved-item__body {
  flex: 1;
  min-width: 0;
}

.saved-item__title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saved-item__meta {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  margin: 0;
}

/* ── Checklist ── */
.checklist {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.checklist__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

.checklist__item.done {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.checklist__circle {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  flex-shrink: 0;
}
</style>
