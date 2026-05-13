// ============================================
// LocalWork — Auth Service (TypeScript)
// ============================================
import api from '../config/api';
import type { User } from '@/types';

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  workType?: string;
  companyName?: string;
  companyNit?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const AuthService = {

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/register', {
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: payload.role,
      work_type: payload.workType,
      company_name: payload.companyName,
      company_nit: payload.companyNit,
    });

    if (data.token) {
      localStorage.setItem('lw_token', data.token);
      localStorage.setItem('lw_user', JSON.stringify(data.user));
    }

    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login', payload);

    if (data.token) {
      localStorage.setItem('lw_token', data.token);
      localStorage.setItem('lw_user', JSON.stringify(data.user));
    }

    return data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('lw_token');
    localStorage.removeItem('lw_user');
    try { await api.post('/auth/logout'); } catch { /* silent */ }
    window.location.href = '/login';
  },

  async getProfile(): Promise<{ user: User }> {
    return api.get<{ user: User }>('/auth/profile');
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const data = await api.put<{ user: User }>('/auth/profile', updates);
    const currentUser = this.getUser() || {};
    const nextUser = data.user
      ? { ...currentUser, ...data.user }
      : { ...currentUser, ...updates };
    localStorage.setItem('lw_user', JSON.stringify(nextUser));
    return data;
  },

  async resetPassword(email: string): Promise<unknown> {
    return api.post('/auth/reset-password', { email });
  },

  getUser(): User | null {
    const stored = localStorage.getItem('lw_user');
    return stored ? (JSON.parse(stored) as User) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('lw_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  requireAuth(redirectTo?: string): boolean {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo || '/login';
      return false;
    }
    return true;
  },

  getPostAuthRoute(user?: User | null): string {
    if (!user) user = AuthService.getUser();
    if (!user) return '/home';
    if (user.role === 'employer') {
      return user.preferred_mode === 'services' ? '/workers' : '/dashboard';
    }
    return user.preferred_mode === 'services' ? '/workers' : '/home';
  },

  redirectIfAuthenticated(redirectTo?: string): boolean {
    if (this.isAuthenticated()) {
      window.location.href = redirectTo || this.getPostAuthRoute();
      return true;
    }
    return false;
  },
};

export default AuthService;
