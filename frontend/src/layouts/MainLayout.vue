<template>
  <div class="main-layout" :class="{ 'no-footer': isChatRoute }">
    <Navbar />

    <main id="main-content">
      <router-view />
    </main>

    <Footer v-if="!isChatRoute" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

const route = useRoute()
const isChatRoute = computed(() => route.path.startsWith('/chat'))
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
#main-content {
  flex: 1;
  padding-top: var(--navbar-height);
}
</style>
