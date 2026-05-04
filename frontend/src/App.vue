<template>
  <component :is="layout">
    <!-- router-view ya está dentro de cada layout, por lo que no es necesario aquí. 
         ESPERA: la convención es que el App.vue renderice el layout, y el layout tenga un slot o renderice el router-view.
         Dado que en MainLayout y AuthLayout pusimos un <router-view />, solo necesitamos cargar el layout aquí. -->
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import type { Component } from 'vue'

const route = useRoute()

const layout = computed<Component>(() => {
  if (route.meta.layout === 'auth') return AuthLayout
  return MainLayout
})
</script>
