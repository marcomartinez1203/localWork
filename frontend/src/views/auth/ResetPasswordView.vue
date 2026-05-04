<template>
  <div class="auth-page">
    <div class="auth-page__side">
      <div class="auth-page__side-content">
        <h2 class="auth-page__side-title">¿Olvidaste tu contraseña?</h2>
        <p class="auth-page__side-desc">No te preocupes, te enviaremos un enlace a tu correo para restablecerla de forma segura.</p>
      </div>
    </div>

    <div class="auth-page__main">
      <div class="auth-card">
        <router-link to="/" class="auth-card__logo">
          <span class="auth-card__logo-icon">LW</span>
          LocalWork
        </router-link>

        <!-- Step 1: Enter email -->
        <div v-if="!isSuccess">
          <div class="auth-card__header">
            <h1 class="auth-card__title">Recuperar contraseña</h1>
            <p class="auth-card__desc">Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
          </div>

          <div class="alert" :class="{ show: errorMessage }" style="margin-bottom: 1rem; color: #ef4444;">{{ errorMessage }}</div>

          <form class="auth-card__form" @submit.prevent="handleReset">
            <div class="form-group">
              <label class="form-label form-label--required">Correo electrónico</label>
              <div class="form-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                <input type="email" class="form-input" v-model="email" required placeholder="tu@correo.com">
              </div>
            </div>
            <div class="auth-card__actions">
              <button type="submit" class="btn btn--primary btn--lg btn--block" :class="{ 'btn--loading': isLoading }" :disabled="isLoading">
                Enviar instrucciones
              </button>
            </div>
          </form>
          <div class="auth-card__footer">
            <router-link to="/login">← Volver a iniciar sesión</router-link>
          </div>
        </div>

        <!-- Step 2: Success message -->
        <div v-else>
          <div style="text-align:center;padding:var(--space-8) 0;">
            <div style="width:72px;height:72px;margin:0 auto var(--space-6);background:var(--color-accent-50);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;font-size:var(--fs-2xl);">✉️</div>
            <h2 style="font-size:var(--fs-xl);margin-bottom:var(--space-3);">¡Correo enviado!</h2>
            <p style="color:var(--color-text-secondary);margin-bottom:var(--space-6);">
              Revisa tu bandeja de entrada en <strong>{{ email }}</strong>. Si no lo ves, revisa la carpeta de spam.
            </p>
            <router-link to="/login" class="btn btn--primary btn--lg btn--block">Volver al login</router-link>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthService from '@/assets/js/services/auth.service'

const email = ref('')
const isSuccess = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleReset = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    await AuthService.resetPassword(email.value.trim())
    isSuccess.value = true
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Error al enviar el correo'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import '@/assets/css/pages/auth.css';

.alert {
  display: none;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
}
.alert.show {
  display: block;
}
</style>
