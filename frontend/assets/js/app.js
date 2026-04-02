// ============================================
// LocalWork — Main App Initialization
// ============================================

const App = {

  // ── Inicializar la app en cada página ──
  init() {
    this.setupNavbar();
    this.updateAuthUI();
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

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('userDropdown');
      if (dropdown && !dropdown.contains(e.target) && !e.target.closest('.navbar__avatar')) {
        dropdown.classList.remove('open');
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

      const isEmployer = user.role === 'employer';
      const dashLink = isEmployer
        ? '<a href="dashboard.html" class="user-dropdown__item">📊 Dashboard</a>'
        : '<a href="my-applications.html" class="user-dropdown__item">📋 Mis Postulaciones</a>';

      const avatarHtml = `
        <button class="navbar__notification" aria-label="Notificaciones" onclick="App.goTo('notifications')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 003.4 0"/>
          </svg>
          <span class="navbar__notification-badge" id="notifBadge" style="display:none;"></span>
        </button>
        <div style="position:relative;">
          <div class="navbar__avatar" onclick="App.toggleUserMenu(event)" tabindex="0">${initials}</div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown__header">
              <strong>${user.full_name || 'Usuario'}</strong>
              <span>${user.email || ''}</span>
            </div>
            <div class="user-dropdown__divider"></div>
            <a href="home.html" class="user-dropdown__item">🔍 Explorar empleos</a>
            ${dashLink}
            <a href="notifications.html" class="user-dropdown__item">🔔 Notificaciones</a>
            <a href="profile.html" class="user-dropdown__item">👤 Mi Perfil</a>
            <div class="user-dropdown__divider"></div>
            <button class="user-dropdown__item user-dropdown__item--danger" onclick="AuthService.logout()">🚪 Cerrar sesión</button>
          </div>
        </div>
      `;

      const loginBtn = authButtons.querySelector('a[href*="login"]');
      const registerBtn = authButtons.querySelector('a[href*="register"]');
      if (loginBtn) loginBtn.remove();
      if (registerBtn) registerBtn.remove();

      if (!authButtons.querySelector('.navbar__avatar')) {
        const hamburger = authButtons.querySelector('.navbar__hamburger');
        if (hamburger) {
          hamburger.insertAdjacentHTML('beforebegin', avatarHtml);
        } else {
          authButtons.insertAdjacentHTML('beforeend', avatarHtml);
        }
      }

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

  // ── Navegación ──
  goTo(page) {
    const routes = {
      home:          'home.html',
      login:         'login.html',
      register:      'register.html',
      notifications: 'notifications.html',
      profile:       'profile.html',
      dashboard:     'dashboard.html',
      applications:  'my-applications.html',
    };
    window.location.href = routes[page] || page;
  },

  toggleUserMenu(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
    }
  },
};

// Auto-init cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
