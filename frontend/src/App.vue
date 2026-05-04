<template>
  <component :is="layout">
    <!-- router-view ya está dentro de cada layout, por lo que no es necesario aquí. 
         ESPERA: la convención es que el App.vue renderice el layout, y el layout tenga un slot o renderice el router-view.
         Dado que en MainLayout y AuthLayout pusimos un <router-view />, solo necesitamos cargar el layout aquí. -->
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()

// Por defecto usamos MainLayout, a menos que la ruta diga que es 'auth'
const layout = computed(() => {
  if (route.meta.layout === 'auth') return AuthLayout
  return MainLayout
})
</script>
