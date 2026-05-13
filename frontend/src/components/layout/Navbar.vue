<template>
  <nav class="navbar" id="navbar" aria-label="Navegación principal">
    <div class="navbar__inner">
      <router-link to="/" class="navbar__brand" aria-label="LocalWork — Inicio">
        <span class="navbar__brand-icon" aria-hidden="true">LW</span>
        <span class="navbar__brand-text">LocalWork</span>
      </router-link>

      <div class="navbar__links" id="navLinks">
        <router-link to="/home" class="navbar__link" active-class="active" v-if="!isEmployer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          <span class="navbar__link-text">Empleos</span>
        </router-link>
        <router-link to="/map" class="navbar__link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/></svg>
          <span class="navbar__link-text">Mapa</span>
        </router-link>
        <router-link to="/workers" class="navbar__link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
          <span class="navbar__link-text">Trabajadores</span>
        </router-link>

        <router-link v-if="user" :to="isEmployer ? '/dashboard' : '/my-applications'" class="navbar__link" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
          <span class="navbar__link-text">{{ isEmployer ? 'Dashboard' : 'Postulaciones' }}</span>
        </router-link>
      </div>

      <div class="navbar__actions">
        <template v-if="!user">
          <router-link to="/login" class="btn btn--ghost btn--sm">Iniciar Sesión</router-link>
          <router-link to="/register" class="btn btn--outline btn--sm">Registrarse</router-link>
        </template>
        <template v-else>
          <!-- Chat Action -->
          <div class="navbar__action-item">
            <router-link class="navbar__notification" aria-label="Mensajes" to="/chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a8.97 8.97 0 0 1-1.355 4.74A9 9 0 0 1 12 21a8.97 8.97 0 0 1-4.74-1.355L3 21l1.355-4.26A8.97 8.97 0 0 1 3 12a9 9 0 1 1 18 0Z"/>
              </svg>
              <span v-if="unreadChatCount > 0" class="navbar__notification-badge">{{ unreadChatCount > 99 ? '99+' : unreadChatCount }}</span>
            </router-link>
          </div>

          <!-- Notification Action -->
          <div class="navbar__action-item" style="position:relative;">
            <button id="notifToggleBtn" class="navbar__notification" aria-label="Notificaciones" @click="toggleNotifPreview">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 003.4 0"/>
              </svg>
              <span v-if="unreadNotifCount > 0" class="navbar__notification-badge"></span>
            </button>
            <div class="notif-preview" :class="{'open': isNotifOpen}" id="notifPreview">
              <div class="notif-preview__header">
                <span>Notificaciones</span>
                <button class="notif-preview__mark-all" @click="markAllAsRead">Marcar leídas</button>
              </div>
              <div class="notif-preview__list">
                <div v-if="notifications.length === 0" class="notif-preview__empty">Sin notificaciones nuevas</div>
                <div v-for="n in notifications" :key="n.id" class="notif-preview__item" :class="{'notif-preview__item--unread': !n.read}" @click="markAsRead(n)">
                  <div class="notif-preview__icon" :class="getNotifIconClass(n.type)" v-html="getNotifIcon(n.type)"></div>
                  <div class="notif-preview__body">
                    <p class="notif-preview__title">{{ n.title }}</p>
                    <p class="notif-preview__msg">{{ n.message }}</p>
                  </div>
                </div>
              </div>
              <div class="notif-preview__footer">
                <router-link to="/notifications" class="notif-preview__see-all" @click="isNotifOpen = false">Ver todas las notificaciones</router-link>
              </div>
            </div>
          </div>

          <!-- User Avatar & Dropdown -->
          <div style="position:relative;">
            <div class="navbar__avatar" tabindex="0" @click="toggleUserMenu" style="cursor: pointer;">
              <img v-if="user.avatar_url" :src="user.avatar_url" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-full);" />
              <span v-else>{{ initials }}</span>
            </div>

            <div class="user-dropdown" :class="{'open': isUserMenuOpen}" id="userDropdown">
              <div class="user-dropdown__header">
                <strong>{{ user.full_name || 'Usuario' }}</strong>
                <span>{{ user.email || '' }}</span>
              </div>
              <div class="user-dropdown__divider"></div>

              <router-link v-if="!isEmployer" to="/home" class="user-dropdown__item" @click="isUserMenuOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg> Explorar empleos
              </router-link>
              <router-link :to="isEmployer ? '/dashboard' : '/my-applications'" class="user-dropdown__item" @click="isUserMenuOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/></svg>
                {{ isEmployer ? 'Dashboard' : 'Mis Postulaciones' }}
              </router-link>
              <router-link to="/chat" class="user-dropdown__item" @click="isUserMenuOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M21 12a8.97 8.97 0 0 1-1.355 4.74A9 9 0 0 1 12 21a8.97 8.97 0 0 1-4.74-1.355L3 21l1.355-4.26A8.97 8.97 0 0 1 3 12a9 9 0 1 1 18 0Z"/></svg> Chat
              </router-link>
              <router-link to="/notifications" class="user-dropdown__item" @click="isUserMenuOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg> Notificaciones
              </router-link>
              <router-link to="/profile" class="user-dropdown__item" @click="isUserMenuOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg> Mi Perfil
              </router-link>

              <div class="user-dropdown__divider"></div>

              <button class="user-dropdown__item" @click="toggleTheme">
                <span v-html="themeIcon" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"></span> {{ themeLabel }}
              </button>

              <button class="user-dropdown__item user-dropdown__item--danger" @click="logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg> Cerrar Sesión
              </button>
            </div>
          </div>
        </template>

        <button class="navbar__hamburger" id="hamburgerBtn"
                aria-label="Abrir menú" aria-expanded="false" aria-controls="mobileMenu"
                @click="toggleMenu" :class="{'active': isMenuOpen}">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="navbar__mobile-menu" id="mobileMenu" role="navigation" aria-label="Menú móvil" :class="{'open': isMenuOpen}">
      <router-link to="/home" class="navbar__link" active-class="active" @click="isMenuOpen = false">Empleos</router-link>
      <router-link to="/map" class="navbar__link" active-class="active" @click="isMenuOpen = false">Mapa</router-link>
      <router-link to="/workers" class="navbar__link" active-class="active" @click="isMenuOpen = false">Trabajadores</router-link>
      <template v-if="user">
        <router-link :to="isEmployer ? '/dashboard' : '/my-applications'" class="navbar__link" active-class="active" @click="isMenuOpen = false">{{ isEmployer ? 'Dashboard' : 'Mis Postulaciones' }}</router-link>
        <router-link to="/profile" class="navbar__link" active-class="active" @click="isMenuOpen = false">Mi Perfil</router-link>
        <router-link to="/chat" class="navbar__link" active-class="active" @click="isMenuOpen = false">Chat</router-link>
        <router-link to="/notifications" class="navbar__link" active-class="active" @click="isMenuOpen = false">Notificaciones</router-link>
        <button @click="logout" class="btn btn--ghost btn--block" style="color: #ef4444; border-color: #ef4444; margin-top: var(--space-4);">Cerrar Sesión</button>
      </template>
      <div v-else style="margin-top: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3);">
        <router-link to="/login" class="btn btn--outline btn--block" @click="isMenuOpen = false">Iniciar Sesión</router-link>
        <router-link to="/register" class="btn btn--primary btn--block" @click="isMenuOpen = false">Registrarse</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthService from '@/services/auth.service'
import NotificationsService from '@/services/notifications.service'
import ChatService from '@/services/chat.service'
import type { User, Notification } from '@/types'

const router = useRouter()
const route = useRoute()

const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const isNotifOpen = ref(false)
const user = ref<User | null>(null)

const notifications = ref<Notification[]>([])
const unreadNotifCount = ref(0)
const unreadChatCount = ref(0)

const isDarkTheme = ref(document.documentElement.getAttribute('data-theme') !== 'light')

const isEmployer = computed(() => user.value?.role === 'employer')

const initials = computed(() => {
  if (!user.value || !user.value.full_name) return 'U'
  return user.value.full_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
})

const themeIcon = computed(() => {
  return isDarkTheme.value
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>'
})
const themeLabel = computed(() => isDarkTheme.value ? 'Modo claro' : 'Modo oscuro')

const checkAuth = async () => {
  user.value = AuthService.getUser()
  if (user.value) {
    try {
      unreadChatCount.value = await ChatService.getUnreadCount()
      unreadNotifCount.value = await NotificationsService.getUnreadCount()
    } catch { /* silent */ }
  }
}

watch(route, () => {
  checkAuth()
  isMenuOpen.value = false
  isUserMenuOpen.value = false
  isNotifOpen.value = false
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  isNotifOpen.value = false
}

const toggleNotifPreview = async () => {
  isNotifOpen.value = !isNotifOpen.value
  isUserMenuOpen.value = false
  if (isNotifOpen.value) {
    try {
      const res = await NotificationsService.list({ page: 1, perPage: 5 })
      notifications.value = res.data || []
    } catch { /* silent */ }
  }
}

const markAsRead = async (n: Notification) => {
  if (n.read) return
  n.read = true
  unreadNotifCount.value = Math.max(0, unreadNotifCount.value - 1)
  try { await NotificationsService.markAsRead(n.id) } catch { /* silent */ }
}

const markAllAsRead = async () => {
  notifications.value.forEach(n => n.read = true)
  unreadNotifCount.value = 0
  try { await NotificationsService.markAllAsRead() } catch { /* silent */ }
}

const toggleTheme = () => {
  const next = isDarkTheme.value ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('lw_theme', next)
  isDarkTheme.value = next === 'dark'
}

const logout = () => {
  AuthService.logout()
  user.value = null
  isUserMenuOpen.value = false
  router.push('/login')
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const avatar = document.querySelector('.navbar__avatar')
  const dropdown = document.querySelector('.user-dropdown')
  if (isUserMenuOpen.value && (!avatar || !avatar.contains(target)) && (!dropdown || !dropdown.contains(target))) {
    isUserMenuOpen.value = false
  }

  const notifBtn = document.getElementById('notifToggleBtn')
  const notifPreview = document.querySelector('.notif-preview')
  if (isNotifOpen.value && (!notifBtn || !notifBtn.contains(target)) && (!notifPreview || !notifPreview.contains(target))) {
    isNotifOpen.value = false
  }
}

const getNotifIcon = (type: string): string => {
  const map: Record<string, string> = {
    application_received: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>',
    application_status_changed: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>',
    new_job_match: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>',
    profile_viewed: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>'
  }
  return map[type] || '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>'
}

const getNotifIconClass = (type: string): string => {
  const map: Record<string, string> = {
    application_received: 'notif-preview__icon--app',
    application_status_changed: 'notif-preview__icon--status',
    new_job_match: 'notif-preview__icon--match',
    profile_viewed: 'notif-preview__icon--status'
  }
  return map[type] || 'notif-preview__icon--system'
}

onMounted(() => {
  checkAuth()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
