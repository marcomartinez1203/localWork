// ============================================
// LocalWork — Realtime Service (Supabase)
// ============================================
// Light wrapper for Supabase Realtime — listens for new jobs
// and notifications without page refresh.
//
// Usage: include supabase-js CDN + this script, then call
//   RealtimeService.init() after user is authenticated.
// ============================================

const SUPABASE_URL  = 'https://bemsnwrwrcllvsmlvksi.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbXNud3J3cmNsbHZzbWx2a3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjY1MDAsImV4cCI6MjA4OTcwMjUwMH0._ykvyz-2y25rWQEWHu6eOlOc6sNog_G9_9zz2d6eCBE';

const RealtimeService = {
  _client: null,
  _channel: null,

  init() {
    if (!window.supabase) {
      console.warn('[RealtimeService] supabase-js not loaded, skipping realtime');
      return;
    }

    const token = localStorage.getItem('lw_token');
    if (!token) return;

    this._client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      realtime: { params: { eventsPerSecond: 2 } },
    });

    this._listenJobs();
    this._listenNotifications();
  },

  _listenJobs() {
    this._client
      .channel('public:jobs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
        const job = payload.new;
        // Show toast for new job
        if (typeof showToast === 'function') {
          showToast(`🆕 Nueva oferta: ${job.title}`, 'success');
        }

        // If on home page, refresh the grid
        if (typeof render === 'function') {
          render();
        }
      })
      .subscribe();
  },

  _listenNotifications() {
    const user = AuthService.getUser();
    if (!user) return;

    this._client
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const notif = payload.new;

        // Show notification badge
        const badge = document.getElementById('notifBadge');
        if (badge) badge.style.display = '';

        // Show toast
        if (typeof showToast === 'function') {
          showToast(`🔔 ${notif.title || 'Nueva notificación'}`, 'info');
        }

        // If on notifications page, reload
        if (typeof loadNotifications === 'function') {
          loadNotifications();
        }
      })
      .subscribe();
  },

  destroy() {
    if (this._client) {
      this._client.removeAllChannels();
    }
  },
};
