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

      // Cerrar al hacer clic en un link
      mobileMenu.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  },

  // ── Actualizar UI según estado de autenticación ──
  updateAuthUI() {
    const user = AuthService.getUser();
    const isAuth = AuthService.isAuthenticated();

    // Actualizar los botones de auth en el navbar (si existen)
    const authButtons = document.querySelector('.navbar__actions');
    if (!authButtons) return;

    // Si el usuario está autenticado, mostrar avatar
    if (isAuth && user) {
      const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

      const avatarHtml = `
        <button class="navbar__notification" aria-label="Notificaciones" onclick="App.goTo('notifications')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 003.4 0"/>
          </svg>
          <span class="navbar__notification-badge" id="notifBadge" style="display:none;"></span>
        </button>
        <div class="navbar__avatar" onclick="App.toggleUserMenu()" tabindex="0">${initials}</div>
      `;

      // Reemplazar botones Login/Registrar por avatar
      const loginBtn = authButtons.querySelector('a[href*="login"]');
      const registerBtn = authButtons.querySelector('a[href*="register"]');
      if (loginBtn) loginBtn.remove();
      if (registerBtn) registerBtn.remove();

      // Solo insertar si no existe ya el avatar
      if (!authButtons.querySelector('.navbar__avatar')) {
        const hamburger = authButtons.querySelector('.navbar__hamburger');
        if (hamburger) {
          hamburger.insertAdjacentHTML('beforebegin', avatarHtml);
        } else {
          authButtons.insertAdjacentHTML('beforeend', avatarHtml);
        }
      }
    }
  },

  // ── Navegación ──
  goTo(page) {
    const routes = {
      home:          '/frontend/pages/home.html',
      login:         '/frontend/pages/login.html',
      register:      '/frontend/pages/register.html',
      notifications: '/frontend/pages/notifications.html',
      profile:       '/frontend/pages/profile.html',
    };
    window.location.href = routes[page] || page;
  },

  toggleUserMenu() {
    // Placeholder para futuro dropdown menu
    if (confirm('¿Deseas cerrar sesión?')) {
      AuthService.logout();
    }
  },
};

// Auto-init cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
