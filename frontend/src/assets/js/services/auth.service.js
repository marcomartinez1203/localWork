// ============================================
// LocalWork — Auth Service (Frontend)
// ============================================
import api from '../config/api.js';

const AuthService = {

  async register({ fullName, email, phone, password, role, workType, companyName, companyNit }) {
    const data = await api.post('/auth/register', {
      full_name: fullName,
      email,
      phone,
      password,
      role,
      work_type: workType,
      company_name: companyName,
      company_nit: companyNit,
    });

    if (data.token) {
      sessionStorage.setItem('lw_token', data.token);
      sessionStorage.setItem('lw_user', JSON.stringify(data.user));
    }

    return data;
  },

  async login({ email, password }) {
    const data = await api.post('/auth/login', { email, password });

    if (data.token) {
      sessionStorage.setItem('lw_token', data.token);
      sessionStorage.setItem('lw_user', JSON.stringify(data.user));
    }

    return data;
  },

  async logout() {
    // Limpiar sesión primero — siempre, independiente de si el API responde
    sessionStorage.removeItem('lw_token');
    sessionStorage.removeItem('lw_user');
    try { await api.post('/auth/logout'); } catch (e) { /* silent */ }
    const prefix = (typeof App !== 'undefined') ? App._pagePrefix() : '';
    window.location.href = prefix + 'login.html';
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  async updateProfile(updates) {
    const data = await api.put('/auth/profile', updates);
    const currentUser = this.getUser() || {};
    const nextUser = data.user
      ? { ...currentUser, ...data.user }
      : { ...currentUser, ...updates };
    sessionStorage.setItem('lw_user', JSON.stringify(nextUser));
    return data;
  },

  async resetPassword(email) {
    return api.post('/auth/reset-password', { email });
  },

  // ── Helpers locales ──

  getUser() {
    const stored = sessionStorage.getItem('lw_user');
    return stored ? JSON.parse(stored) : null;
  },

  getToken() {
    return sessionStorage.getItem('lw_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  requireAuth(redirectTo) {
    if (!this.isAuthenticated()) {
      const prefix = (typeof App !== 'undefined') ? App._pagePrefix() : '';
      window.location.href = redirectTo || (prefix + 'login.html');
      return false;
    }
    return true;
  },

  getPostAuthRoute(user = this.getUser()) {
    const prefix = (typeof App !== 'undefined') ? App._pagePrefix() : '';
    if (user?.role === 'employer') {
      return user?.preferred_mode === 'services'
        ? (prefix + 'workers.html')
        : (prefix + 'dashboard.html');
    }
    return user?.preferred_mode === 'services'
      ? (prefix + 'workers.html')
      : (prefix + 'home.html');
  },

  redirectIfAuthenticated(redirectTo) {
    if (this.isAuthenticated()) {
      window.location.href = redirectTo || this.getPostAuthRoute();
      return true;
    }
    return false;
  },
};

export default AuthService;
