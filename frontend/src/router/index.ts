import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
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
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue')
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  // Hack for AuthService due to circular dependency issues if imported top-level
  const isAuth = !!localStorage.getItem('lw_token')
  const userRaw = localStorage.getItem('lw_user')
  const user = userRaw ? JSON.parse(userRaw) : null

  const publicRoutes = ['login', 'register', 'reset-password', 'index']
  const isPublicRoute = publicRoutes.includes(to.name as string)

  if (isPublicRoute) {
    if (isAuth && to.name !== 'index') {
      const target = user?.role === 'employer' ? '/dashboard' : '/home'
      return next(target)
    }
    return next()
  }

  // Protected route, must be auth
  if (!isAuth) {
    return next('/login')
  }

  // Role guards
  if (to.name === 'admin' && user?.role !== 'admin') {
    return next('/home')
  }

  if (to.name === 'dashboard' && user?.role !== 'employer') {
    return next('/home')
  }

  next()
})

export default router
