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
      this._syncRoleNavbarItem(user);
      const exploreLink = isEmployer
        ? ''
        : `<a href="${p}home.html" class="user-dropdown__item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg> Explorar empleos</a>`;
      const dashLink = isEmployer
        ? `<a href="${p}dashboard.html" class="user-dropdown__item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/></svg> Dashboard</a>`
        : `<a href="${p}my-applications.html" class="user-dropdown__item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/></svg> Mis Postulaciones</a>`;

      const avatarContent = user.avatar_url
        ? `<img src="${user.avatar_url}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-full);">`
        : initials;

      const avatarHtml = `
        <div class="navbar__action-item">
          <button class="navbar__notification" aria-label="Notificaciones" onclick="App.toggleNotifPreview(event)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 003.4 0"/>
            </svg>
            <span class="navbar__notification-badge" id="notifBadge" style="display:none;"></span>
          </button>
          <div class="notif-preview" id="notifPreview"></div>
        </div>
        <div>
          <div class="navbar__avatar" onclick="App.toggleUserMenu(event)" tabindex="0">${avatarContent}</div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown__header">
              <strong>${user.full_name || 'Usuario'}</strong>
              <span>${user.email || ''}</span>
            </div>
            <div class="user-dropdown__divider"></div>
            ${exploreLink}
            ${dashLink}
            <a href="${p}notifications.html" class="user-dropdown__item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg> Notificaciones</a>
            <a href="${p}profile.html" class="user-dropdown__item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg> Mi Perfil</a>
            <div class="user-dropdown__divider"></div>
            <button class="user-dropdown__item user-dropdown__item--danger" onclick="AuthService.logout()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg> Cerrar sesión</button>
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
        wrapper.className = 'navbar__action-item';
        existingAvatar.parentNode.insertBefore(wrapper, existingAvatar);
        wrapper.appendChild(existingAvatar);

        const dropdownHtml = `
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown__header">
              <strong>${user.full_name || 'Usuario'}</strong>
              <span>${user.email || ''}</span>
            </div>
            <div class="user-dropdown__divider"></div>
            ${exploreLink}
            ${dashLink}
            <a href="${p}notifications.html" class="user-dropdown__item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg> Notificaciones</a>
            <a href="${p}profile.html" class="user-dropdown__item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg> Mi Perfil</a>
            <div class="user-dropdown__divider"></div>
            <button class="user-dropdown__item user-dropdown__item--danger" onclick="AuthService.logout()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg> Cerrar sesión</button>
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

  _syncRoleNavbarItem(user) {
    const p = this._pagePrefix();
    const isEmployer = user?.role === 'employer';
    const targetHref = isEmployer ? `${p}dashboard.html` : `${p}my-applications.html`;
    const targetLabel = isEmployer ? 'Dashboard' : 'Mis Postulaciones';
    const currentPath = window.location.pathname.toLowerCase();
    const activeFile = isEmployer ? 'dashboard.html' : 'my-applications.html';

    const roleLinks = document.querySelectorAll(
      '.navbar__link[href*="my-applications.html"], .navbar__link[href*="dashboard.html"]'
    );

    roleLinks.forEach((link) => {
      link.setAttribute('href', targetHref);

      const textEl = link.querySelector('.navbar__link-text');
      if (textEl) {
        textEl.textContent = targetLabel;
      } else {
        const plain = link.textContent.trim();
        if (plain === 'Dashboard' || plain === 'Mis Postulaciones') {
          link.textContent = targetLabel;
        }
      }

      const isActive = currentPath.endsWith(activeFile);
      link.classList.toggle('active', isActive);
    });

    const jobsLinks = document.querySelectorAll('.navbar__link[href*="home.html"]');
    jobsLinks.forEach((link) => {
      link.style.display = isEmployer ? 'none' : '';
    });

    const workersLinks = document.querySelectorAll('.navbar__link[href*="workers.html"]');
    workersLinks.forEach((link) => {
      link.style.display = isEmployer ? 'none' : '';
    });
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
      application_received:       { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>', cls: 'notif-preview__icon--app' },
      application_status_changed: { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg>', cls: 'notif-preview__icon--status' },
      new_job_match:              { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>', cls: 'notif-preview__icon--match' },
      profile_viewed:             { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>',  cls: 'notif-preview__icon--status' },
      system:                     { icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>', cls: 'notif-preview__icon--system' },
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
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lw_theme', next);

    // Update toggle icon
    const icon = document.getElementById('themeToggleIcon');
    if (icon) icon.innerHTML = next === 'dark' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>';

    // Update FAB title
    const fab = document.getElementById('themeFab');
    if (fab) fab.title = next === 'dark' ? 'Modo claro' : 'Modo oscuro';

    // Update dropdown button text
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      const iconSpan = btn.querySelector('#themeToggleIcon');
      if (iconSpan) iconSpan.innerHTML = next === 'dark' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>';
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
          <span id="themeToggleIcon">${isDark ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>'}</span> ${isDark ? 'Modo claro' : 'Modo oscuro'}
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
        <span id="themeToggleIcon">${isDark ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:8px;"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>'}</span>
      </button>`
    );
  },
};

// Auto-init cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
