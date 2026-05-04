<template>
  <div class="login-page">
    <div class="lw-glow"></div>
    <div class="lw-grid"></div>

    <div class="lw-wrap">
      <div class="lw-card">

        <router-link to="/" class="lw-brand">
          <div class="lw-brand__icon">LW</div>
          <span class="lw-brand__name">LocalWork</span>
        </router-link>

        <div class="lw-hd">
          <h1>Bienvenido de vuelta</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <div class="lw-alert" :class="{ show: errorMessage }">{{ errorMessage }}</div>

        <form class="lw-form" @submit.prevent="handleLogin" novalidate>

          <div class="lw-field">
            <label for="email" class="lw-label">Correo electrónico</label>
            <div class="lw-iw">
              <input type="email" id="email" class="lw-inp" :class="{ err: emailError }" v-model="email" placeholder="tu@correo.com" required autocomplete="email" @input="validateEmail">
              <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
            </div>
            <span class="ferr" :class="{ show: emailError }">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>
              Correo inválido
            </span>
          </div>

          <div class="lw-field">
            <label for="password" class="lw-label">Contraseña</label>
            <div class="lw-iw">
              <input :type="showPassword ? 'text' : 'password'" id="password" class="lw-inp" :class="{ err: pwError }" v-model="password" placeholder="••••••••" required minlength="8" autocomplete="current-password" @input="validatePw">
              <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
              <button type="button" class="pw-btn" aria-label="Mostrar contraseña" @click="showPassword = !showPassword">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
              </button>
            </div>
            <span class="ferr" :class="{ show: pwError }">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>
              Mínimo 8 caracteres
            </span>
          </div>

          <div class="lw-meta">
            <label class="lw-chk"><input type="checkbox" v-model="remember"><span>Recordarme</span></label>
            <router-link to="/reset-password" class="lw-fgt">¿Olvidaste tu contraseña?</router-link>
          </div>

          <button type="submit" class="lw-btn" :class="{ loading: isLoading }" :disabled="isLoading">
            <span class="spinner"></span>
            <span>Iniciar Sesión</span>
          </button>
        </form>

        <div class="lw-sep">o</div>
        <div class="lw-foot">¿No tienes cuenta? <router-link to="/register">Regístrate gratis</router-link></div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/assets/js/services/auth.service'

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)

const emailError = ref(false)
const pwError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

const vEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const validateEmail = () => {
  if (vEmail(email.value)) emailError.value = false
}

const validatePw = () => {
  if (password.value.length >= 8) pwError.value = false
}

onMounted(() => {
  if (AuthService.isAuthenticated()) {
    const route = AuthService.getPostAuthRoute().replace('.html', '').replace('home', '')
    router.push(route || '/home')
  }
})

const handleLogin = async () => {
  errorMessage.value = ''
  let ok = true

  if (!vEmail(email.value)) { emailError.value = true; ok = false } else { emailError.value = false }
  if (password.value.length < 8) { pwError.value = true; ok = false } else { pwError.value = false }

  if (!ok) return

  isLoading.value = true
  try {
    await AuthService.login({ email: email.value, password: password.value })
    const routeHtml = AuthService.getPostAuthRoute()
    const route = routeHtml.split('/').pop()?.replace('.html', '') ?? 'home'
    router.push('/' + route)
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Credenciales incorrectas'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #1e1e1e;
  color: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  width: 100%;
}

/* Resto de estilos extraídos del original */
.lw-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.lw-glow::before {
  content: '';
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(22,163,74,.12) 0%, transparent 60%);
  top: -140px; left: -120px;
  animation: drift 20s ease-in-out infinite alternate;
}
.lw-glow::after {
  content: '';
  position: absolute;
  width: 380px; height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(100,120,150,.18) 0%, transparent 60%);
  bottom: -80px; right: -60px;
  animation: drift 25s ease-in-out infinite alternate-reverse;
}
@keyframes drift {
  from { transform: translate(0,0); }
  to   { transform: translate(35px, 25px); }
}

.lw-grid {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
  background-size: 44px 44px;
}

.lw-wrap {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  padding: 20px 16px;
  animation: slideUp .5s cubic-bezier(.16,1,.3,1) both;
}
@keyframes slideUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}

.lw-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow: 0 8px 40px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.06) inset;
}

.lw-brand {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; margin-bottom: 28px;
}
.lw-brand__icon {
  width: 34px; height: 34px;
  background: #16a34a;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800;
  font-family: var(--font-heading,'Sora',sans-serif);
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(22,163,74,.35);
  flex-shrink: 0;
}
.lw-brand__name {
  font-family: var(--font-heading,'Sora',sans-serif);
  font-size: 17px; font-weight: 700;
  color: #e8e8e8;
}

.lw-hd { margin-bottom: 22px; }
.lw-hd h1 {
  font-family: var(--font-heading,'Sora',sans-serif);
  font-size: 22px; font-weight: 800;
  color: #f0f0f0;
  letter-spacing: -.03em; margin-bottom: 4px; line-height: 1.2;
}
.lw-hd p { font-size: 13px; color: #888; }

.lw-alert {
  display: none;
  background: rgba(239,68,68,.08);
  border: 1px solid rgba(239,68,68,.2);
  border-radius: 8px;
  padding: 10px 12px; font-size: 13px; color: #ef4444;
  margin-bottom: 14px;
}
.lw-alert.show { display:block; animation:shake .4s; }
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}

.lw-form { display:flex; flex-direction:column; gap:16px; }
.lw-field { display:flex; flex-direction:column; gap:6px; }
.lw-label {
  font-size: 12px; font-weight: 500;
  color: #888;
  text-transform: uppercase; letter-spacing: .05em;
}
.lw-iw { position: relative; }
.lw-iw .ico {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: #555; pointer-events: none; transition: color .2s;
}
.lw-inp {
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 8px;
  padding: 11px 12px 11px 38px;
  font-size: 14px; font-family: inherit;
  color: #e8e8e8;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.lw-inp::placeholder { color: rgba(255,255,255,.2); }
.lw-inp:focus {
  border-color: #16a34a;
  background: rgba(22,163,74,.08);
  box-shadow: 0 0 0 3px rgba(22,163,74,.18);
}
.lw-inp.err {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,.12);
}
.pw-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: #555; padding: 4px;
  display: flex; align-items: center; transition: color .2s;
}
.pw-btn:hover { color: #ccc; }
.ferr {
  display: none; align-items: center; gap: 5px;
  font-size: 11px; color: #ef4444;
}
.ferr.show { display: flex; }

.lw-meta {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 13px;
}
.lw-chk {
  display: flex; align-items: center; gap: 7px;
  color: #888; cursor: pointer; user-select: none;
}
.lw-chk input { accent-color: #16a34a; width: 14px; height: 14px; cursor: pointer; }
.lw-fgt { color: #888; text-decoration: none; font-size: 13px; transition: color .2s; }
.lw-fgt:hover { color: #16a34a; }

.lw-btn {
  width: 100%; padding: 12px;
  background: #16a34a;
  border: none; border-radius: 8px;
  color: #fff; font-size: 14px; font-weight: 600; font-family: inherit;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 16px rgba(22,163,74,.3);
}
.lw-btn:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(22,163,74,.4);
}
.lw-btn:active { transform: scale(.98); }
.lw-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
.spinner {
  display: none; width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .65s linear infinite;
}
.lw-btn.loading .spinner { display: block; }
@keyframes spin { to { transform: rotate(360deg); } }

.lw-sep {
  display: flex; align-items: center; gap: 12px;
  font-size: 11px; color: rgba(30,36,48,.4);
  margin: 18px 0 14px;
}
.lw-sep::before,.lw-sep::after { content:''; flex:1; height:1px; background: rgba(255,255,255,.08); }
.lw-foot { text-align:center; font-size:13px; color:#888; }
.lw-foot a { color:#16a34a; text-decoration:none; font-weight:600; }
.lw-foot a:hover { text-decoration:underline; }
</style>
