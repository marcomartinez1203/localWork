<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="footer__brand">LocalWork</div>
          <p class="footer__desc">
            Plataforma de empleo local para Aguachica, Cesar, Colombia. 
            Conectamos el talento de nuestra comunidad con las oportunidades que merece.
          </p>
        </div>
        <div>
          <h4 class="footer__heading">Plataforma</h4>
          <router-link to="/home" class="footer__link">Buscar empleos</router-link>
          <router-link to="/register" class="footer__link">Crear cuenta</router-link>
          <router-link to="/login" class="footer__link">Iniciar sesión</router-link>
          <a href="#" class="footer__link">Preguntas frecuentes</a>
        </div>
        <div>
          <h4 class="footer__heading">Contacto</h4>
          <a href="#" class="footer__link">soporte@localwork.co</a>
          <a href="#" class="footer__link">+57 300 000 0000</a>
          <a href="#" class="footer__link">Aguachica, Cesar, Colombia</a>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">&copy; 2026 LocalWork. Todos los derechos reservados.</p>
        <p class="footer__sponsor">Marco Martínez - Kevin Blanco - Cristian Jimenez</p>
      </div>
    </div>
  </footer>
</template>
