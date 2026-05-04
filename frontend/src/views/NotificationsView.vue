<template>
  <div class="container notif-page" style="max-width:800px;">
    <div class="notif-header">
      <h1>Notificaciones</h1>
      <button class="btn btn--ghost btn--sm" @click="markAllRead">
        Marcar todas como leídas
      </button>
    </div>

    <div class="notif-list" v-if="isLoading">
      <div class="skeleton" style="height:72px;"></div>
      <div class="skeleton" style="height:72px;"></div>
      <div class="skeleton" style="height:72px;"></div>
    </div>

    <div class="notif-list" v-else-if="notifications.length > 0">
      <div class="notif-item" v-for="n in notifications" :key="n.id" :class="{ 'notif-item--unread': !n.read }" @click="markRead(n)">
        <div class="notif-item__icon" :class="(ICON_MAP[n.type] || ICON_MAP.system).cls" v-html="(ICON_MAP[n.type] || ICON_MAP.system).icon"></div>
        <div class="notif-item__content">
          <p class="notif-item__title">{{ n.title }}</p>
          <p class="notif-item__message">{{ n.message }}</p>
        </div>
        <span class="notif-item__time">{{ timeAgo(n.created_at) }}</span>
        <span class="notif-item__dot"></span>
      </div>
    </div>

    <div class="empty-state" v-else>
      <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 003.4 0"/>
      </svg>
      <h3 class="empty-state__title">Sin notificaciones</h3>
      <p class="empty-state__desc">Cuando haya actividad en tus postulaciones o nuevas ofertas, te avisaremos aquí.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from '@/assets/js/utils/helpers'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/assets/js/services/auth.service'
import NotificationsService from '@/assets/js/services/notifications.service'
import type { Notification } from '@/types'

const router = useRouter()
const notifications = ref<Notification[]>([])
const isLoading = ref(true)
const currentPage = ref(1)

const ICON_MAP = {
  application_received:       { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>', cls: 'notif-item__icon--app' },
  application_status_changed: { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>', cls: 'notif-item__icon--status' },
  new_job_match:              { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>', cls: 'notif-item__icon--match' },
  profile_viewed:             { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>', cls: 'notif-item__icon--status' },
  system:                     { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>', cls: 'notif-item__icon--system' },
}

const timeAgo = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  if (diffHours < 24) return `Hace ${diffHours} horas`
  const diffDays = Math.round(diffHours / 24)
  return `Hace ${diffDays} días`
}

onMounted(() => {
  if (!AuthService.getUser()) {
    router.push('/login')
    return
  }
  loadNotifications()
})

const loadNotifications = async () => {
  isLoading.value = true
  try {
    const res = await NotificationsService.list({ page: currentPage.value, perPage: 20 })
    notifications.value = res.data || []
  } catch (e) {
    notifications.value = []
  } finally {
    isLoading.value = false
  }
}

const markRead = async (n: Notification) => {
  if (n.read) return
  try {
    await NotificationsService.markAsRead(n.id)
    n.read = true
  } catch { /* silent */ }
}

const markAllRead = async () => {
  try {
    await NotificationsService.markAllAsRead()
    notifications.value.forEach(n => n.read = true)
    showToast('Todas marcadas como leídas', 'success')
  } catch (e) {
    showToast('Error al marcar todas como leídas', 'error')
  }
}
</script>

<style scoped>
.notif-page { padding-top: var(--space-8); padding-bottom: var(--space-16); }
.notif-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-3); }
.notif-header h1 { font-size: var(--fs-2xl); letter-spacing: -0.02em; }
.notif-list { display: flex; flex-direction: column; gap: var(--space-2); }
.notif-item { display: flex; align-items: flex-start; gap: var(--space-4); padding: var(--space-4) var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-xl); transition: all var(--transition); cursor: pointer; }
.notif-item:hover { border-color: var(--color-primary-200); transform: translateY(-1px); }
.notif-item--unread { background: var(--color-primary-50); border-color: var(--color-primary-200); }
.notif-item--unread .notif-item__dot { display: block; }
.notif-item__icon { width: 40px; height: 40px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: var(--fs-md); flex-shrink: 0; }
.notif-item__icon--app { background: rgba(59,130,246,0.08); color: #3b82f6; }
.notif-item__icon--status { background: rgba(139,92,246,0.08); color: #8b5cf6; }
.notif-item__icon--match { background: var(--color-primary-50); color: var(--color-primary); }
.notif-item__icon--system { background: var(--color-bg); color: var(--color-text-muted); }
.notif-item__content { flex: 1; min-width: 0; }
.notif-item__title { font-size: var(--fs-sm); font-weight: var(--fw-semibold); margin-bottom: var(--space-1); }
.notif-item__message { font-size: var(--fs-sm); color: var(--color-text-secondary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif-item__time { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); flex-shrink: 0; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.04em; }
.notif-item__dot { display: none; width: 8px; height: 8px; background: var(--color-primary); border-radius: var(--radius-full); flex-shrink: 0; margin-top: var(--space-2); }
</style>
