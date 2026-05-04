<template>
  <div class="register-page">
    <div class="lw-bg"></div>
    <div class="lw-grid"></div>

    <div class="wrap">
      <div class="card">

        <router-link to="/" class="brand">
          <div class="brand-icon">LW</div>
          <span class="brand-name">LocalWork</span>
        </router-link>

        <div class="hd">
          <h1>Crear cuenta</h1>
          <p>{{ step === 1 ? 'Elige tu rol y completa tus datos' : 'Configura tu contraseña' }}</p>
        </div>

        <div class="steps">
          <div class="step-dot" :class="{ active: step === 1, done: step === 2 }"></div>
          <div class="step-dot" :class="{ active: step === 2 }"></div>
        </div>

        <div class="alert" :class="{ show: errorMessage }">{{ errorMessage }}</div>

        <form @submit.prevent="handleRegister" novalidate>

          <!-- STEP 1 -->
          <div v-show="step === 1" class="form" :class="{ 'step-enter': step === 1 }">
            <div class="field">
              <span class="lbl">Tipo de cuenta *</span>
              <div class="roles">
                <div class="role-opt" :class="{ active: selectedRole === 'seeker' }" @click="selectRole('seeker', 'both')">
                  <span class="role-opt__emoji">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                    </svg>
                  </span>
                  <div>
                    <div class="role-opt__title">Buscar empleo o servicios</div>
                    <div class="role-opt__desc">Encuentra trabajo o puedes ofrecer tus servicios</div>
                  </div>
                </div>
                <div class="role-opt" :class="{ active: selectedRole === 'employer' }" @click="selectRole('employer', 'employee')">
                  <span class="role-opt__emoji">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"/>
                    </svg>
                  </span>
                  <div>
                    <div class="role-opt__title">Empleador</div>
                    <div class="role-opt__desc">Publica ofertas y contrata personal</div>
                  </div>
                </div>
              </div>
              <span class="ferr" :class="{ show: roleError }"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>Selecciona un tipo de cuenta</span>
            </div>

            <div class="field">
              <label for="fullName" class="lbl">Nombre completo *</label>
              <div class="iw">
                <input type="text" id="fullName" class="inp no-icon" :class="{ err: nameError }" v-model="fullName" placeholder="Ej: Juan Pérez" required autocomplete="name" @input="validateName">
              </div>
              <span class="ferr" :class="{ show: nameError }"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>El nombre es obligatorio</span>
            </div>

            <div class="field">
              <label for="regEmail" class="lbl">Correo electrónico *</label>
              <div class="iw">
                <input type="email" id="regEmail" class="inp" :class="{ err: emailError }" v-model="email" placeholder="tu@correo.com" required autocomplete="email" @input="validateEmail">
                <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
              </div>
              <span class="ferr" :class="{ show: emailError }"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>Correo inválido</span>
            </div>

            <div class="field">
              <label for="regPhone" class="lbl">Teléfono</label>
              <div class="iw"><input type="tel" id="regPhone" class="inp no-icon" v-model="phone" placeholder="300 000 0000" autocomplete="tel"></div>
            </div>

            <div class="btn-row">
              <button type="button" class="btn-main" @click="nextStep">
                Continuar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
              </button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div v-show="step === 2" class="form step-enter">

            <div v-if="selectedRole === 'employer'">
              <div class="field intent-box">
                <span class="lbl">¿Qué necesitas primero? *</span>
                <div class="intent-options">
                  <label class="intent-opt">
                    <input type="radio" v-model="employerIntent" value="jobs">
                    <div><strong>Publicar empleos</strong><br><span>Quiero contratar personal para vacantes</span></div>
                  </label>
                  <label class="intent-opt">
                    <input type="radio" v-model="employerIntent" value="services">
                    <div><strong>Buscar servicios</strong><br><span>Quiero encontrar trabajadores para servicios</span></div>
                  </label>
                </div>
              </div>
              <div class="field" style="margin-bottom:14px">
                <label for="companyName" class="lbl">Nombre de la empresa *</label>
                <div class="iw"><input type="text" id="companyName" class="inp no-icon" v-model="companyName" placeholder="Ej: Comercializadora XYZ"></div>
              </div>
              <div class="field" style="margin-bottom:14px">
                <label for="companyNit" class="lbl">NIT</label>
                <div class="iw"><input type="text" id="companyNit" class="inp no-icon" v-model="companyNit" placeholder="000.000.000-0"></div>
              </div>
            </div>

            <div class="field">
              <label for="regPassword" class="lbl">Contraseña *</label>
              <div class="iw">
                <input :type="showPassword ? 'text' : 'password'" id="regPassword" class="inp" :class="{ err: pwError }" v-model="password" placeholder="Mínimo 8 caracteres" required minlength="8" autocomplete="new-password" @input="validatePw">
                <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                <button type="button" class="pw-btn" @click="showPassword = !showPassword" aria-label="Mostrar contraseña">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                </button>
              </div>
              <span class="hint">Usa letras, números y caracteres especiales</span>
              <span class="ferr" :class="{ show: pwError }"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>Mínimo 8 caracteres</span>
            </div>

            <div class="field">
              <label for="regConfirm" class="lbl">Confirmar contraseña *</label>
              <div class="iw">
                <input type="password" id="regConfirm" class="inp" :class="{ err: confirmError }" v-model="confirmPassword" placeholder="Repite tu contraseña" required autocomplete="new-password" @input="validateConfirm">
                <svg class="ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
              </div>
              <span class="ferr" :class="{ show: confirmError }"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/></svg>Las contraseñas no coinciden</span>
            </div>

            <div class="terms">
              <input type="checkbox" v-model="terms" id="terms">
              <label for="terms">Acepto los <a href="#">Términos de Servicio</a> y la <a href="#">Política de Privacidad</a> de LocalWork.</label>
            </div>

            <div class="btn-row">
              <button type="button" class="btn-back" @click="step = 1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
                Atrás
              </button>
              <button type="submit" class="btn-main" :class="{ loading: isLoading }" :disabled="isLoading">
                <span class="spinner"></span>
                <span>Crear Cuenta</span>
              </button>
            </div>
          </div>

        </form>

        <div class="sep">o</div>
        <div class="foot">¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link></div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthService from '@/assets/js/services/auth.service.js'

const router = useRouter()
const route = useRoute()

// Step control
const step = ref(1)

// Form data
const selectedRole = ref(null)
const selectedWorkType = ref(null)
const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const terms = ref(false)

const employerIntent = ref('jobs')
const companyName = ref('')
const companyNit = ref('')

// Errors & State
const roleError = ref(false)
const nameError = ref(false)
const emailError = ref(false)
const pwError = ref(false)
const confirmError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const vEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const selectRole = (role, wt) => {
  selectedRole.value = role
  selectedWorkType.value = wt
  roleError.value = false
}

const validateName = () => {
  if (fullName.value.trim()) nameError.value = false
}
const validateEmail = () => {
  if (vEmail(email.value)) emailError.value = false
}
const validatePw = () => {
  if (password.value.length >= 8) pwError.value = false
}
const validateConfirm = () => {
  if (confirmPassword.value === password.value) confirmError.value = false
}

onMounted(() => {
  if (AuthService.isAuthenticated()) {
    const routeName = AuthService.getPostAuthRoute().split('/').pop().replace('.html', '')
    router.push('/' + (routeName || 'home'))
  }
  if (route.query.role === 'employer') {
    selectRole('employer', 'employee')
  }
})

const nextStep = () => {
  let ok = true
  if (!selectedRole.value) { roleError.value = true; ok = false }
  if (!fullName.value.trim()) { nameError.value = true; ok = false }
  if (!vEmail(email.value)) { emailError.value = true; ok = false }
  if (!ok) return
  step.value = 2
}

const handleRegister = async () => {
  let ok = true
  if (password.value.length < 8) { pwError.value = true; ok = false }
  if (confirmPassword.value !== password.value) { confirmError.value = true; ok = false }
  if (!terms.value) { ok = false; errorMessage.value = 'Debes aceptar los términos y condiciones' }
  if (!ok) return

  errorMessage.value = ''
  isLoading.value = true

  try {
    await AuthService.register({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || undefined,
      password: password.value,
      role: selectedRole.value,
      workType: selectedWorkType.value || undefined,
      companyName: selectedRole.value === 'employer' ? companyName.value.trim() : undefined,
      companyNit: selectedRole.value === 'employer' ? companyNit.value.trim() : undefined,
    })

    const registeredUser = AuthService.getUser()
    if (registeredUser) {
      registeredUser.preferred_mode = selectedRole.value === 'employer' ? employerIntent.value : 'jobs'
      sessionStorage.setItem('lw_user', JSON.stringify(registeredUser))
    }

    if (selectedRole.value === 'employer') {
      router.push(employerIntent.value === 'services' ? '/workers' : '/dashboard')
    } else {
      router.push('/home')
    }
  } catch (err) {
    errorMessage.value = err.message || 'Error al crear la cuenta'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #1e1e1e;
  font-family: var(--font-body, 'Inter', sans-serif);
  color: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px 16px;
  width: 100%;
}

.lw-bg { position:absolute; inset:0; pointer-events:none; z-index:0; }
.lw-bg::before { content:''; position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(22,163,74,.09) 0%,transparent 65%); top:-140px; left:-120px; animation:drift 20s ease-in-out infinite alternate; }
.lw-bg::after { content:''; position:absolute; width:340px; height:340px; border-radius:50%; background:radial-gradient(circle,rgba(22,163,74,.05) 0%,transparent 65%); bottom:-80px; right:-60px; animation:drift 25s ease-in-out infinite alternate-reverse; }
.lw-grid { position:absolute; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px); background-size:44px 44px; }
@keyframes drift { from { transform:translate(0,0); } to { transform:translate(35px,25px); } }

.wrap { position:relative; z-index:1; width:100%; max-width:460px; animation:up .5s cubic-bezier(.16,1,.3,1) both; }
@keyframes up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
.card { background:rgba(255,255,255,.05); backdrop-filter:blur(20px) saturate(140%); -webkit-backdrop-filter:blur(20px) saturate(140%); border:1px solid rgba(255,255,255,.09); border-radius:16px; padding:32px 28px; box-shadow:0 8px 40px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.06) inset; }

.brand { display:flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:24px; }
.brand-icon { width:34px; height:34px; background:#16a34a; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-family:var(--font-heading,'Sora',sans-serif); font-size:13px; box-shadow:0 4px 12px rgba(22,163,74,.35); flex-shrink:0; }
.brand-name { font-family:var(--font-heading,'Sora',sans-serif); font-size:17px; font-weight:700; color:#e8e8e8; }

.hd { margin-bottom:20px; }
.hd h1 { font-family:var(--font-heading,'Sora',sans-serif); font-size:21px; font-weight:800; color:#f0f0f0; letter-spacing:-.03em; margin-bottom:4px; }
.hd p { font-size:13px; color:#888; }

.steps { display:flex; gap:6px; margin-bottom:20px; }
.step-dot { height:3px; flex:1; border-radius:99px; background:rgba(255,255,255,.1); transition:background .3s; }
.step-dot.active { background:#16a34a; }
.step-dot.done { background:#15803d; }

.alert { display:none; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2); border-radius:8px; padding:10px 12px; font-size:13px; color:#ef4444; margin-bottom:14px; }
.alert.show { display:block; animation:shake .4s; }
@keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }

.form { display:flex; flex-direction:column; gap:14px; }
.field { display:flex; flex-direction:column; gap:5px; }
.lbl { font-size:11px; font-weight:500; color:#888; text-transform:uppercase; letter-spacing:.05em; }
.iw { position:relative; }
.iw .ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#555; pointer-events:none; transition:color .2s; }
.inp { width:100%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10); border-radius:8px; padding:11px 12px 11px 38px; font-size:14px; font-family:inherit; color:#e8e8e8; outline:none; transition:border-color .2s,box-shadow .2s,background .2s; }
.inp.no-icon { padding-left:12px; }
.inp::placeholder { color:rgba(255,255,255,.2); }
.inp:focus { border-color:#16a34a; background:rgba(22,163,74,.08); box-shadow:0 0 0 3px rgba(22,163,74,.18); }
.inp.err { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.12); }
.hint { font-size:11px; color:#666; }
.ferr { display:none; align-items:center; gap:5px; font-size:11px; color:#ef4444; }
.ferr.show { display:flex; }
.pw-btn { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#555; padding:4px; display:flex; align-items:center; transition:color .2s; }
.pw-btn:hover { color:#ccc; }

.roles { display:flex; flex-direction:column; gap:8px; }
.role-opt { display:flex; align-items:center; gap:12px; padding:12px 14px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; cursor:pointer; transition:border-color .2s,background .2s; user-select:none; }
.role-opt:hover { background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.14); }
.role-opt.active { border-color:#16a34a; background:rgba(22,163,74,.08); }
.role-opt__emoji { font-size:20px; flex-shrink:0; }
.role-opt__title { font-size:13px; font-weight:600; color:#e8e8e8; margin-bottom:2px; }
.role-opt__desc { font-size:11px; color:#888; }
.intent-box { margin:0 0 14px; }
.intent-options { display:flex; flex-direction:column; gap:8px; }
.intent-opt { display:flex; align-items:center; gap:10px; padding:11px 12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; cursor:pointer; transition:border-color .2s,background .2s; user-select:none; }
.intent-opt:hover { background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.14); }
.intent-opt input { accent-color:#16a34a; }
.intent-opt strong { font-size:13px; color:#e8e8e8; }
.intent-opt span { font-size:11px; color:#888; }

.terms { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:#888; }
.terms input { accent-color:#16a34a; margin-top:2px; flex-shrink:0; cursor:pointer; }
.terms a { color:#16a34a; text-decoration:none; }
.terms a:hover { text-decoration:underline; }

.btn-row { display:flex; gap:10px; }
.btn-back { padding:11px 16px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:8px; color:#888; font-size:14px; font-family:inherit; cursor:pointer; display:flex; align-items:center; gap:6px; transition:background .2s,color .2s; white-space:nowrap; }
.btn-back:hover { background:rgba(255,255,255,.1); color:#e8e8e8; }
.btn-main { flex:1; padding:12px; background:#16a34a; border:none; border-radius:8px; color:#fff; font-size:14px; font-weight:600; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background .2s,transform .15s,box-shadow .2s; box-shadow:0 4px 16px rgba(22,163,74,.3); }
.btn-main:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); box-shadow:0 8px 22px rgba(22,163,74,.4); }
.btn-main:active { transform:scale(.98); }
.btn-main:disabled { opacity:.55; cursor:not-allowed; transform:none; }
.spinner { display:none; width:15px; height:15px; border:2px solid rgba(255,255,255,.25); border-top-color:#fff; border-radius:50%; animation:spin .65s linear infinite; }
.btn-main.loading .spinner { display:block; }
@keyframes spin { to { transform:rotate(360deg); } }

.sep { display:flex; align-items:center; gap:12px; font-size:11px; color:rgba(255,255,255,.2); margin:16px 0 12px; }
.sep::before,.sep::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.08); }
.foot { text-align:center; font-size:13px; color:#888; }
.foot a { color:#16a34a; text-decoration:none; font-weight:600; }
.foot a:hover { text-decoration:underline; }

.step-enter { animation:stepIn .3s cubic-bezier(.16,1,.3,1); }
@keyframes stepIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
</style>
