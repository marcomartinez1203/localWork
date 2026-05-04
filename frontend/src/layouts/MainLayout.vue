<template>
  <div class="main-layout">
    <Navbar />
    
    <main id="main-content">
      <router-view />
    </main>
    
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
#main-content {
  flex: 1; /* Para que el footer se quede abajo si la página es muy corta */
}
</style>
