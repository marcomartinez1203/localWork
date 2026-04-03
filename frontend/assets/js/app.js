// ============================================
// LocalWork — Main App Initialization
// ============================================

const App = {

  // ── Inicializar la app en cada página ──
  init() {
    this.initTheme();
    this.setupNavbar();
    this.updateAuthUI();
    this._injectFAB();
    this._interceptLinks();
  },

  // ── Navbar: scroll effect + hamburger ──
  setupNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
      });
    }

    if (hamburgerBtn && mobileMenu) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburgerBtn.classList.toggle('active', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      mobileMenu.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown && !dropdown.contains(e.target) && !e.target.closest('.navbar__avatar')) {
        dropdown.classList.remove('open');
      }
      const notifPreview = document.getElementById('notifPreview');
      if (notifPreview && !notifPreview.contains(e.target) && !e.target.closest('.navbar__notification')) {
        notifPreview.classList.remove('open');
      }
    });
  },

  // ── Actualizar UI según estado de autenticación ──
  updateAuthUI() {
    const user = AuthService.getUser();
    const isAuth = AuthService.isAuthenticated();

    const authButtons = document.querySelector('.navbar__actions');
    if (!authButtons) return;

    if (isAuth && user) {
      const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

      const p = this._pagePrefix();
      const isEmployer = user.role === 'employer';
      const dashLink = isEmployer
        ? `<a href="${p}dashboard.html" class="user-dropdown__item">📊 Dashboard</a>`
        : `<a href="${p}my-applications.html" class="user-dropdown__item">📋 Mis Postulaciones</a>`;

      const avatarContent = user.avatar_url
        ? `<img src="${user.avatar_url}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-full);">`
        : initials;

      const avatarHtml = `
        <div style="position:relative;">
          <button class="navbar__notification" aria-label="Notificaciones" onclick="App.toggleNotifPreview(event)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 003.4 0"/>
            </svg>
            <span class="navbar__notification-badge" id="notifBadge" style="display:none;"></span>
          </button>
          <div class="notif-preview" id="notifPreview"></div>
        </div>
        <div style="position:relative;">
          <div class="navbar__avatar" onclick="App.toggleUserMenu(event)" tabindex="0">${avatarContent}</div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown__header">
              <strong>${user.full_name || 'Usuario'}</strong>
              <span>${user.email || ''}</span>
            </div>
            <div class="user-dropdown__divider"></div>
            <a href="${p}home.html" class="user-dropdown__item">🔍 Explorar empleos</a>
            ${dashLink}
            <a href="${p}notifications.html" class="user-dropdown__item">🔔 Notificaciones</a>
            <a href="${p}profile.html" class="user-dropdown__item">👤 Mi Perfil</a>
            <div class="user-dropdown__divider"></div>
            <button class="user-dropdown__item user-dropdown__item--danger" onclick="AuthService.logout()">🚪 Cerrar sesión</button>
          </div>
        </div>
      `;

      const loginBtn = authButtons.querySelector('a[href*="login"]');
      const registerBtn = authButtons.querySelector('a[href*="register"]');
      if (loginBtn) loginBtn.remove();
      if (registerBtn) registerBtn.remove();

      const existingAvatar = authButtons.querySelector('.navbar__avatar');
      const existingDropdown = document.getElementById('userDropdown');

      if (!existingAvatar) {
        // No avatar at all — inject everything (landing page)
        const hamburger = authButtons.querySelector('.navbar__hamburger');
        if (hamburger) {
          hamburger.insertAdjacentHTML('beforebegin', avatarHtml);
        } else {
          authButtons.insertAdjacentHTML('beforeend', avatarHtml);
        }
      } else if (!existingDropdown) {
        // Avatar exists but no dropdown — wrap it (inner pages)
        existingAvatar.innerHTML = avatarContent;
        existingAvatar.setAttribute('onclick', 'App.toggleUserMenu(event)');

        // Ensure existing notification button uses preview and badge is correct
        const existingNotifBtn = authButtons.querySelector('.navbar__notification');
        if (existingNotifBtn) {
          existingNotifBtn.setAttribute('onclick', 'App.toggleNotifPreview(event)');
        }
        const existingBadge = authButtons.querySelector('.navbar__notification-badge');
        if (existingBadge && !existingBadge.id) {
          existingBadge.id = 'notifBadge';
          existingBadge.style.display = 'none';
        }

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        existingAvatar.parentNode.insertBefore(wrapper, existingAvatar);
        wrapper.appendChild(existingAvatar);

        const dropdownHtml = `
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown__header">
              <strong>${user.full_name || 'Usuario'}</strong>
              <span>${user.email || ''}</span>
            </div>
            <div class="user-dropdown__divider"></div>
            <a href="${p}home.html" class="user-dropdown__item">🔍 Explorar empleos</a>
            ${dashLink}
            <a href="${p}notifications.html" class="user-dropdown__item">🔔 Notificaciones</a>
            <a href="${p}profile.html" class="user-dropdown__item">👤 Mi Perfil</a>
            <div class="user-dropdown__divider"></div>
            <button class="user-dropdown__item user-dropdown__item--danger" onclick="AuthService.logout()">🚪 Cerrar sesión</button>
          </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', dropdownHtml);
      }

      // Inject theme toggle above the logout divider in the dropdown
      this._injectThemeToggle();

      // Check unread notifications
      this.checkNotifications();
    }
  },

  // ── Check unread notifications ──
  async checkNotifications() {
    try {
      if (typeof NotificationsService !== 'undefined') {
        const result = await NotificationsService.getUnreadCount();
        const badge = document.getElementById('notifBadge');
        if (badge && result.count > 0) {
          badge.style.display = '';
        }
      }
    } catch (e) { /* silent */ }
  },

  // ── Path helper: detect if we are inside /pages/ or not ──
  _pagePrefix() {
    return window.location.pathname.includes('/pages/') ? '' : 'pages/';
  },

  // ── Navegación ──
  goTo(page) {
    const prefix = this._pagePrefix();
    const routes = {
      home:          prefix + 'home.html',
      login:         prefix + 'login.html',
      register:      prefix + 'register.html',
      notifications: prefix + 'notifications.html',
      profile:       prefix + 'profile.html',
      dashboard:     prefix + 'dashboard.html',
      applications:  prefix + 'my-applications.html',
      workers:       prefix + 'workers.html',
    };
    this._navigateTo(routes[page] || page);
  },

  _navigateTo(url) {
    document.body.style.transition = 'opacity 100ms ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = url; }, 100);
  },

  _interceptLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      // Only intercept same-origin internal .html links, skip anchors and external
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
      e.preventDefault();
      this._navigateTo(href);
    });
  },

  toggleUserMenu(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
    }
  },

  toggleNotifPreview(e) {
    if (e) e.stopPropagation();
    const preview = document.getElementById('notifPreview');
    if (!preview) return;
    const isOpen = preview.classList.toggle('open');
    if (isOpen && !preview._loaded) {
      this._renderNotifPreview(preview);
    }
  },

  async _renderNotifPreview(container) {
    const ICON_MAP = {
      application_received:       { icon: '📩', cls: 'notif-preview__icon--app' },
      application_status_changed: { icon: '🔔', cls: 'notif-preview__icon--status' },
      new_job_match:              { icon: '⭐', cls: 'notif-preview__icon--match' },
      profile_viewed:             { icon: '👁',  cls: 'notif-preview__icon--status' },
      system:                     { icon: '⚙️', cls: 'notif-preview__icon--system' },
    };

    container.innerHTML = `
      <div class="notif-preview__header">
        <span>Notificaciones</span>
        <button class="notif-preview__mark-all" onclick="App._markAllFromPreview()">Marcar leídas</button>
      </div>
      <div class="notif-preview__list"><div class="notif-preview__empty">Cargando…</div></div>
      <div class="notif-preview__footer">
        <button class="notif-preview__see-all" onclick="App._navigateTo(App._pagePrefix()+'notifications.html')">Ver todas las notificaciones</button>
      </div>`;

    try {
      const result = await NotificationsService.list({ page: 1, perPage: 5 });
      const notifs = result.data || [];
      const list = container.querySelector('.notif-preview__list');

      if (notifs.length === 0) {
        list.innerHTML = `<div class="notif-preview__empty">Sin notificaciones nuevas</div>`;
      } else {
        list.innerHTML = notifs.map(n => {
          const { icon, cls } = ICON_MAP[n.type] || ICON_MAP.system;
          const title = n.title ? n.title.replace(/</g,'&lt;') : '';
          const msg   = n.message ? n.message.replace(/</g,'&lt;') : '';
          return `
            <div class="notif-preview__item ${n.read ? '' : 'notif-preview__item--unread'}"
                 onclick="App._markFromPreview('${n.id}', this)">
              <div class="notif-preview__icon ${cls}">${icon}</div>
              <div class="notif-preview__body">
                <p class="notif-preview__title">${title}</p>
                <p class="notif-preview__msg">${msg}</p>
              </div>
              <span class="notif-preview__time">${typeof timeAgo === 'function' ? timeAgo(n.created_at) : ''}</span>
            </div>`;
        }).join('');
      }
      container._loaded = true;
    } catch (e) {
      container.querySelector('.notif-preview__list').innerHTML =
        `<div class="notif-preview__empty">Error al cargar</div>`;
    }
  },

  async _markFromPreview(id, el) {
    el.classList.remove('notif-preview__item--unread');
    try { await NotificationsService.markAsRead(id); } catch (e) { /* silent */ }
    // Update badge
    const list = document.querySelectorAll('.notif-preview__item--unread');
    const badge = document.getElementById('notifBadge');
    if (badge && list.length === 0) badge.style.display = 'none';
  },

  async _markAllFromPreview() {
    document.querySelectorAll('.notif-preview__item--unread')
      .forEach(el => el.classList.remove('notif-preview__item--unread'));
    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
    try { await NotificationsService.markAllAsRead(); } catch (e) { /* silent */ }
  },

  // ── Dark Mode ──
  initTheme() {
    const saved = localStorage.getItem('lw_theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lw_theme', next);

    // Update toggle icon
    const icon = document.getElementById('themeToggleIcon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';

    // Update FAB title
    const fab = document.getElementById('themeFab');
    if (fab) fab.title = next === 'dark' ? 'Modo claro' : 'Modo oscuro';

    // Update dropdown button text
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      const iconSpan = btn.querySelector('#themeToggleIcon');
      if (iconSpan) iconSpan.textContent = next === 'dark' ? '☀️' : '🌙';
      btn.lastChild.textContent = ` ${next === 'dark' ? 'Modo claro' : 'Modo oscuro'}`;
    }
  },

  _injectThemeToggle() {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown || dropdown.querySelector('#themeToggleBtn')) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const lastDivider = dropdown.querySelectorAll('.user-dropdown__divider');
    const target = lastDivider[lastDivider.length - 1];

    if (target) {
      target.insertAdjacentHTML('beforebegin',
        `<button class="user-dropdown__item" id="themeToggleBtn" onclick="App.toggleTheme()">
          <span id="themeToggleIcon">${isDark ? '☀️' : '🌙'}</span> ${isDark ? 'Modo claro' : 'Modo oscuro'}
        </button>`
      );
    }
  },

  // Show floating toggle when no dropdown exists (landing/auth pages)
  _injectFAB() {
    if (document.getElementById('userDropdown') || document.getElementById('themeFab')) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.body.insertAdjacentHTML('beforeend',
      `<button class="theme-toggle-fab" id="themeFab" onclick="App.toggleTheme()" aria-label="Cambiar tema" title="${isDark ? 'Modo claro' : 'Modo oscuro'}">
        <span id="themeToggleIcon">${isDark ? '☀️' : '🌙'}</span>
      </button>`
    );
  },
};

// Auto-init cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
