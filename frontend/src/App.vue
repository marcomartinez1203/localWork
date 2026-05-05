<template>
  <component v-if="ready" :is="layout">
  </component>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import type { Component } from 'vue'

const route = useRoute()
const router = useRouter()
const ready = ref(false)

router.isReady().then(async () => {
  ready.value = true
  await nextTick()
  document.getElementById('app')?.classList.add('app-ready')
})

const layout = computed<Component>(() => {
  if (route.meta.layout === 'auth') return AuthLayout
  return MainLayout
})
</script>
