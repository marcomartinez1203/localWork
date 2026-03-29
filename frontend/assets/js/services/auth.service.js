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
      localStorage.setItem('lw_token', data.token);
      localStorage.setItem('lw_user', JSON.stringify(data.user));
    }

    return data;
  },

  async login({ email, password }) {
    const data = await api.post('/auth/login', { email, password });

    if (data.token) {
      localStorage.setItem('lw_token', data.token);
      localStorage.setItem('lw_user', JSON.stringify(data.user));
    }

    return data;
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('lw_token');
    localStorage.removeItem('lw_user');
    window.location.href = 'login.html';
  },

  async getProfile() {
    return api.get('/auth/profile');
  },

  async updateProfile(updates) {
    const data = await api.put('/auth/profile', updates);
    if (data.user) {
      localStorage.setItem('lw_user', JSON.stringify(data.user));
    }
    return data;
  },

  async resetPassword(email) {
    return api.post('/auth/reset-password', { email });
  },

  // ── Helpers locales ──

  getUser() {
    const stored = localStorage.getItem('lw_user');
    return stored ? JSON.parse(stored) : null;
  },

  getToken() {
    return localStorage.getItem('lw_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  requireAuth(redirectTo = 'login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  redirectIfAuthenticated(redirectTo = 'home.html') {
    if (this.isAuthenticated()) {
      window.location.href = redirectTo;
      return true;
    }
    return false;
  },
};
