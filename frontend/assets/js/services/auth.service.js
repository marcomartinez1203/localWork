// ============================================
// LocalWork — Auth Service (Frontend)
// ============================================

const AuthService = {

  async register({ fullName, email, phone, password, role, companyName, companyNit }) {
    const data = await api.post('/auth/register', {
      full_name: fullName,
      email,
      phone,
      password,
      role,
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
    if (data.user) {
      sessionStorage.setItem('lw_user', JSON.stringify(data.user));
    }
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

  redirectIfAuthenticated(redirectTo) {
    if (this.isAuthenticated()) {
      const prefix = (typeof App !== 'undefined') ? App._pagePrefix() : '';
      window.location.href = redirectTo || (prefix + 'home.html');
      return true;
    }
    return false;
  },
};
