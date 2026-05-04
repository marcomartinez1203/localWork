// ============================================
// LocalWork — Realtime Service (Supabase)
// ============================================
// Light wrapper for Supabase Realtime — listens for new jobs
// and notifications without page refresh.
//
// Requires: api.js (provides SUPABASE_URL, SUPABASE_ANON)
//           supabase-js CDN
//           auth.service.js
// ============================================

const RealtimeService = {
  _client: null,
  _channel: null,

  init() {
    if (!window.supabase) {
      console.warn('[RealtimeService] supabase-js not loaded, skipping realtime');
      return;
    }

    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON === 'undefined') {
      console.warn('[RealtimeService] SUPABASE_URL/SUPABASE_ANON not defined, load api.js first');
      return;
    }

    // Use sessionStorage — same source as api.js and auth.service.js
    const token = sessionStorage.getItem('lw_token');
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
