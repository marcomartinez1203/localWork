<template>
  <div class="auth-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg); /* O el color de fondo definido en main.css */
}
</style>
