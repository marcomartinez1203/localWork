<template>
  <nav class="navbar" id="navbar" aria-label="Navegación principal">
    <div class="navbar__inner">
      <router-link to="/" class="navbar__brand" aria-label="LocalWork — Inicio">
        <span class="navbar__brand-icon" aria-hidden="true">LW</span>
        LocalWork
      </router-link>

      <div class="navbar__links" id="navLinks">
        <router-link to="/home" class="navbar__link">Empleos</router-link>
        <router-link to="/map" class="navbar__link">Mapa</router-link>
        <router-link to="/workers" class="navbar__link">Trabajadores</router-link>
      </div>

      <div class="navbar__actions">
        <!-- Estos botones cambiarán dinámicamente luego según si hay sesión iniciada -->
        <router-link to="/login" class="btn btn--ghost btn--sm">Iniciar Sesión</router-link>
        <router-link to="/register" class="btn btn--ghost btn--sm" style="border: 1.5px solid var(--color-border); color: var(--color-text);">Registrarse</router-link>

        <button class="navbar__hamburger" id="hamburgerBtn"
                aria-label="Abrir menú" aria-expanded="false" aria-controls="mobileMenu"
                @click="toggleMenu" :class="{'is-active': isMenuOpen}">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="navbar__mobile-menu" id="mobileMenu" role="navigation" aria-label="Menú móvil" :class="{'is-active': isMenuOpen}">
      <router-link to="/home" class="navbar__link" @click="isMenuOpen = false">Empleos</router-link>
      <router-link to="/map" class="navbar__link" @click="isMenuOpen = false">Mapa</router-link>
      <router-link to="/workers" class="navbar__link" @click="isMenuOpen = false">Trabajadores</router-link>
      <div style="margin-top: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3);">
        <router-link to="/login" class="btn btn--outline btn--block" @click="isMenuOpen = false">Iniciar Sesión</router-link>
        <router-link to="/register" class="btn btn--primary btn--block" @click="isMenuOpen = false">Registrarse</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>
