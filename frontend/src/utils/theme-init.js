// Aplica el tema antes del primer render para evitar flash en modo oscuro
(function () {
  var t = localStorage.getItem('lw_theme');
  if (t) {
    document.documentElement.setAttribute('data-theme', t);
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}());

// Hace visible el body una vez el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  requestAnimationFrame(function () {
    document.body.classList.add('page-loaded');
  });
});
