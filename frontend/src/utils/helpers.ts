// ============================================
// LocalWork — Utility Functions (TypeScript)
// ============================================

/**
 * Tiempo relativo en español
 */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMins === 0) return 'Justo ahora';
      return `Hace ${diffMins} min`;
    }
    return `Hace ${diffHours}h`;
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7)  return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
  return `Hace ${Math.floor(diffDays / 30)} mes(es)`;
}

/**
 * Formatear número como moneda colombiana
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Debounce para búsquedas
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 300): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sanitizar HTML para prevenir XSS
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Mostrar notificación toast
 */
export function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 4000): void {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <span class="toast__message">${escapeHtml(message)}</span>
    <button class="toast__close" onclick="this.parentElement.remove()" aria-label="Cerrar notificación">&times;</button>
  `;

  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.setAttribute('aria-label', 'Notificaciones');
    container.style.cssText = 'position:fixed;top:80px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Obtener parámetros de la URL
 */
export function getUrlParams(): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/**
 * Truncar texto
 */
export function truncate(text: string | null | undefined, maxLength = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '…';
}
