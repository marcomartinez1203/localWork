// ============================================
// LocalWork — API Configuration
// ============================================

// Si estamos en Vercel, usamos ruta relativa para evitar CORS y problemas de caché
// Si estamos en local (Live Server), usamos el localhost:3000
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api' 
  : '/api';

// Supabase public config (anon key — safe for frontend, protected by RLS)
const SUPABASE_URL  = 'https://bemsnwrwrcllvsmlvksi.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbXNud3J3cmNsbHZzbWx2a3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjY1MDAsImV4cCI6MjA4OTcwMjUwMH0._ykvyz-2y25rWQEWHu6eOlOc6sNog_G9_9zz2d6eCBE';

/**
 * Fetch wrapper con autenticación automática
 */
async function apiFetch(endpoint, options = {}) {
  const token = sessionStorage.getItem('lw_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Si el body es un objeto, convertirlo a JSON
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Si es FormData, no enviar Content-Type (el navegador lo pone con boundary)
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Si el token expiró, redirigir al login
  if (response.status === 401) {
    sessionStorage.removeItem('lw_token');
    sessionStorage.removeItem('lw_user');
    const prefix = (typeof App !== 'undefined') ? App._pagePrefix() : '';
    window.location.href = prefix + 'login.html';
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
}

/**
 * Métodos HTTP simplificados
 */
const api = {
  get:    (endpoint)        => apiFetch(endpoint, { method: 'GET' }),
  post:   (endpoint, body)  => apiFetch(endpoint, { method: 'POST', body }),
  put:    (endpoint, body)  => apiFetch(endpoint, { method: 'PUT', body }),
  patch:  (endpoint, body)  => apiFetch(endpoint, { method: 'PATCH', body }),
  delete: (endpoint)        => apiFetch(endpoint, { method: 'DELETE' }),

  // Para subir archivos
  upload: (endpoint, formData) => apiFetch(endpoint, {
    method: 'POST',
    body: formData,
  }),
};
