// ============================================
// LocalWork — API Configuration (TypeScript)
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || '';
export const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

interface ApiOptions {
  headers?: Record<string, string>;
  body?: unknown;
  method?: string;
}

async function apiFetch<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = sessionStorage.getItem('lw_token');

  const config: RequestInit = {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    config.body = JSON.stringify(body);
  }

  if (body instanceof FormData) {
    const hdrs = config.headers as Record<string, string>;
    delete hdrs['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const isAuthEndpoint =
    endpoint.startsWith('/auth/login') ||
    endpoint.startsWith('/auth/register') ||
    endpoint.startsWith('/auth/reset-password');

  if (response.status === 401 && !isAuthEndpoint) {
    sessionStorage.removeItem('lw_token');
    sessionStorage.removeItem('lw_user');
    window.location.href = '/login';
    return new Promise(() => {}); // never resolves — page is navigating
  }

  const data = await response.json() as T & { message?: string };

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || 'Error en la petición');
  }

  return data;
}

const api = {
  get:    <T = unknown>(endpoint: string)                       => apiFetch<T>(endpoint, { method: 'GET' }),
  post:   <T = unknown>(endpoint: string, body?: unknown)       => apiFetch<T>(endpoint, { method: 'POST', body }),
  put:    <T = unknown>(endpoint: string, body?: unknown)       => apiFetch<T>(endpoint, { method: 'PUT', body }),
  patch:  <T = unknown>(endpoint: string, body?: unknown)       => apiFetch<T>(endpoint, { method: 'PATCH', body }),
  delete: <T = unknown>(endpoint: string)                       => apiFetch<T>(endpoint, { method: 'DELETE' }),
  upload: <T = unknown>(endpoint: string, formData: FormData)   => apiFetch<T>(endpoint, { method: 'POST', body: formData }),
};

export default api;
