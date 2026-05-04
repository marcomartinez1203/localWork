import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      // Temporalmente redirige a /login hasta que migremos el home
      redirect: '/login'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/workers',
      name: 'workers',
      component: () => import('../views/WorkersView.vue')
    },
    {
      path: '/job/:id',
      name: 'job-detail',
      component: () => import('../views/JobDetailView.vue')
    },
    {
      path: '/my-applications',
      name: 'my-applications',
      component: () => import('../views/MyApplicationsView.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue')
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { layout: 'auth' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { layout: 'auth' }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      meta: { layout: 'auth' }
    }
  ]
})

export default router
