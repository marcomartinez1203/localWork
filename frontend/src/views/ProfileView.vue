<template>
  <div class="container profile-page" style="max-width:800px;">
    
    <!-- Banner bienvenida freelance -->
    <div v-if="isWelcomeFreelance" style="background:var(--color-primary-50);border:1px solid var(--color-primary-200);border-radius:var(--radius-2xl);padding:var(--space-5) var(--space-6);margin-bottom:var(--space-6);">
      <p style="font-size:var(--fs-base);font-weight:var(--fw-semibold);margin:0 0 var(--space-1);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:4px;"><path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/></svg> ¡Bienvenido a LocalWork!</p>
      <p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin:0;">Completa tu perfil para que las personas puedan encontrarte. Agrega tus habilidades, disponibilidad y una foto.</p>
    </div>

    <!-- Header -->
    <div class="profile-header">
      <div class="profile-avatar" :style="avatarStyle">
        <span v-if="!user.avatar_url">{{ initials }}</span>
        <input type="file" ref="avatarInput" accept="image/jpeg,image/png,image/webp" style="display:none;" @change="handleAvatarUpload">
        <button class="profile-avatar__edit" title="Cambiar foto" @click="avatarInput?.click()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>
        </button>
      </div>
      <div class="profile-header__info">
        <h1>{{ user.full_name || 'Sin nombre' }}</h1>
        <p>{{ user.email }}</p>
        <p v-if="employerCompany?.name" style="font-size:var(--fs-sm);color:var(--color-primary);font-weight:var(--fw-semibold);margin:var(--space-1) 0 0;">
          🏢 {{ employerCompany.name }}
        </p>
        <button type="button" class="btn btn--outline btn--sm" style="margin-top:var(--space-2);" @click="downloadCV" :disabled="isGeneratingCV">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:4px;"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M3 21h18"/></svg>
          {{ isGeneratingCV ? 'Generando...' : 'Descargar mi CV' }}
        </button>
      </div>
    </div>

    <!-- Panel de Analíticas (Dashboard del empleador) -->
    <div v-if="isEmployer" class="profile-card">
      <div class="profile-card__title">
        <span>Panel de Analíticas</span>
      </div>
      <EmployerDashboard />
    </div>

    <!-- Personal Info -->
    <div class="profile-card">
      <div class="profile-card__title">
        <span>{{ isEmployer ? 'Información del empleador' : 'Información personal' }}</span>
        <span class="profile-badge">{{ user.role === 'employer' ? 'empleador' : 'buscador' }}</span>
      </div>
      <form class="profile-form" @submit.prevent="savePersonalInfo">
        <div class="profile-form__row">
          <div class="form-group">
            <label class="form-label">Nombre completo</label>
            <input type="text" class="form-input" v-model="profileForm.full_name" placeholder="Tu nombre">
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input type="tel" class="form-input" v-model="profileForm.phone" placeholder="300 123 4567">
          </div>
        </div>
        <div class="profile-form__row">
          <div class="form-group">
            <label class="form-label">Ubicación / Zona</label>
            <input type="text" class="form-input" v-model="profileForm.location" placeholder="Ej: Centro, Norte...">
          </div>
        </div>
        <div class="form-group">
          <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <label class="form-label">Bio / Acerca de mí</label>
            <button type="button" class="btn btn--outline btn--sm" @click="suggestBioImprovements" :disabled="isSuggestingImprovements" style="border-color:#14b8a6; color:#0f766e;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4M3 5h4"/></svg>
              {{ isSuggestingImprovements ? 'Analizando...' : 'Mejorar con IA' }}
            </button>
          </div>
          <textarea class="form-textarea" v-model="profileForm.bio" rows="4" placeholder="Cuéntanos sobre ti, tu experiencia y lo que buscas..."></textarea>
        </div>
        <button type="submit" class="btn btn--primary btn--lg" :class="{ 'btn--loading': isSavingProfile }" :disabled="isSavingProfile" style="align-self:flex-start;">
          Guardar cambios
        </button>
      </form>
    </div>

    <!-- Perfil del empleador -->
    <div v-if="isEmployer" class="profile-card">
      <div class="profile-card__title">
        <span>Información del contratante</span>
        <span class="profile-badge">empresa</span>
      </div>
      <form class="profile-form" @submit.prevent="saveEmployerInfo">
        <div class="profile-form__row">
          <div class="form-group">
            <label class="form-label">Tipo de contratante</label>
            <select class="form-input" v-model="employerForm.employer_type">
              <option value="company">Empresa</option>
              <option value="independent">Independiente</option>
              <option value="agency">Agencia</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Forma de contratación</label>
            <select class="form-input" v-model="employerForm.hiring_model">
              <option value="direct">Contratación directa</option>
              <option value="projects">Por proyecto</option>
              <option value="mixed">Mixto (directa y proyecto)</option>
            </select>
          </div>
        </div>
        <div class="profile-form__row">
          <div class="form-group">
            <label class="form-label">Nombre comercial</label>
            <input type="text" class="form-input" v-model="employerForm.name" placeholder="Ej: Constructora Aguachica SAS">
          </div>
          <div class="form-group">
            <label class="form-label">NIT</label>
            <input type="text" class="form-input" v-model="employerForm.nit" placeholder="Ej: 900123456-7">
          </div>
        </div>
        <div class="profile-form__row">
          <div class="form-group">
            <label class="form-label">Teléfono de contacto</label>
            <input type="text" class="form-input" v-model="employerForm.phone" placeholder="Ej: 300 111 2233">
          </div>
          <div class="form-group">
            <label class="form-label">Sitio web</label>
            <input type="url" class="form-input" v-model="employerForm.website" placeholder="https://tuempresa.com">
          </div>
        </div>
        <div class="profile-form__row">
          <div class="form-group">
            <label class="form-label">Ciudad / zona</label>
            <input type="text" class="form-input" v-model="employerForm.location" placeholder="Ej: Aguachica, Centro">
          </div>
          <div class="form-group">
            <label class="form-label">Dirección</label>
            <input type="text" class="form-input" v-model="employerForm.address" placeholder="Ej: Calle 5 # 10-20">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Descripción del contratante</label>
          <textarea class="form-textarea" v-model="employerForm.description" rows="4" placeholder="Describe tu empresa o forma de contratación..."></textarea>
        </div>
        <p v-if="!employerCompany?.id" style="font-size:var(--fs-xs);color:var(--color-text-muted);margin-top:calc(-1 * var(--space-2));">
          No encontramos una empresa asociada. Completa este formulario y guarda para crearla.
        </p>
        <button type="submit" class="btn btn--primary btn--lg" :class="{ 'btn--loading': isSavingEmployer }" :disabled="isSavingEmployer" style="align-self:flex-start;">
          {{ employerCompany?.id ? 'Guardar datos del contratante' : 'Crear empresa y guardar' }}
        </button>
      </form>
    </div>

    <template v-if="!isEmployer">
      <!-- Verificación de Identidad -->
      <div class="profile-card">
        <div class="profile-card__title">
          <span>Insignia de Confianza</span>
          <span class="profile-badge" style="border-color:#0284c7;color:#0284c7;background:#e0f2fe;">Seguridad</span>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-4);background:var(--color-bg);padding:var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--color-border-light);">
          <div style="color:#0284c7;background:#e0f2fe;padding:12px;border-radius:50%;">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div style="flex:1;">
            <h4 style="margin:0 0 4px 0;font-size:var(--fs-base);">Identidad verificada</h4>
            <p v-if="user.verification_status === 'verified'" style="margin:0;font-size:var(--fs-sm);color:var(--color-text-muted);">
              ¡Felicidades! Tu identidad ha sido verificada. Tienes la insignia azul.
            </p>
            <p v-else-if="user.verification_status === 'pending'" style="margin:0;font-size:var(--fs-sm);color:#d97706;">
              Tus documentos están en revisión. Te avisaremos pronto.
            </p>
            <p v-else-if="user.verification_status === 'rejected'" style="margin:0;font-size:var(--fs-sm);color:var(--color-danger);">
              No pudimos verificar tu documento. Por favor, intenta de nuevo.
            </p>
            <p v-else style="margin:0;font-size:var(--fs-sm);color:var(--color-text-muted);">
              Sube tu documento de identidad para ganar la insignia azul y generar mayor confianza en los empleadores.
            </p>
          </div>
          <div v-if="user.verification_status !== 'verified' && user.verification_status !== 'pending'">
             <input type="file" ref="idDocInput" accept=".pdf,image/jpeg,image/png" style="display:none;" @change="handleIdentityUpload">
             <button type="button" class="btn btn--primary" @click="idDocInput?.click()" :class="{ 'btn--loading': isUploadingIdentity }">
                Subir documento
             </button>
          </div>
        </div>
      </div>

      <!-- Servicios y habilidades -->
      <div class="profile-card">
        <div class="profile-card__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:6px;"><path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg> 
          Servicios y disponibilidad
        </div>

        <div style="margin-bottom:var(--space-6);padding:var(--space-4);border:1px solid var(--color-border-light);border-radius:var(--radius-lg);background:var(--color-bg);">
          <p style="font-size:var(--fs-sm);font-weight:var(--fw-semibold);margin:0 0 var(--space-2);">¿Ofreces servicios? Publica tu perfil</p>
          <p style="font-size:var(--fs-xs);color:var(--color-text-muted);margin:0 0 var(--space-3);">Si lo publicas, saldrás en la sección de trabajadores para que te contacten.</p>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);flex-wrap:wrap;">
            <span class="profile-badge" style="text-transform:none;letter-spacing:0;">{{ isServicePublic ? 'Publicado' : 'No publicado' }}</span>
            <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
              <button type="button" class="btn btn--ghost btn--sm" @click="toggleServiceVisibility">
                {{ isServiceSectionHidden ? 'Mostrar disponibilidad' : 'Ocultar disponibilidad' }}
              </button>
              <button type="button" class="btn btn--primary btn--sm" :disabled="!canPublishServices" :style="{ opacity: canPublishServices ? 1 : 0.6, cursor: canPublishServices ? 'pointer' : 'not-allowed' }" @click="toggleServicePublishBtn">
                {{ isServicePublic ? 'Ocultar perfil' : 'Publicar perfil' }}
              </button>
            </div>
          </div>
          <p style="font-size:var(--fs-xs);color:var(--color-text-muted);margin:var(--space-3) 0 0;">
            {{ canPublishServices ? 'Puedes publicar u ocultar tu perfil. Guarda cambios para aplicar.' : 'Estás en modo solo búsqueda. Si quieres publicarte, elige "Ofrezco servicios".' }}
          </p>
        </div>

        <div v-show="!isServiceSectionHidden">
          <div class="form-group" style="margin-bottom:var(--space-6);">
            <label class="form-label" style="margin-bottom:var(--space-3);">¿Cómo quieres trabajar?</label>
            <div class="work-type-options">
              <div class="work-type-option">
                <input type="radio" v-model="skillsForm.work_type" value="employee" id="wt_employee">
                <label for="wt_employee"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:8px;"><path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg><span>Busco empleo<br><small style="font-weight:400;color:var(--color-text-muted);">en una empresa</small></span></label>
              </div>
              <div class="work-type-option">
                <input type="radio" v-model="skillsForm.work_type" value="freelance" id="wt_freelance">
                <label for="wt_freelance"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:8px;"><path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg><span>Ofrezco servicios<br><small style="font-weight:400;color:var(--color-text-muted);">de forma independiente</small></span></label>
              </div>
            </div>
          </div>

          <div class="profile-form__row" style="margin-bottom:var(--space-5);">
            <div class="form-group">
              <label class="form-label">Disponibilidad</label>
              <select class="form-input" v-model="skillsForm.availability">
                <option value="">Seleccionar...</option>
                <option value="Tiempo completo">Tiempo completo</option>
                <option value="Medio tiempo">Medio tiempo</option>
                <option value="Fines de semana">Fines de semana</option>
                <option value="Por horas">Por horas</option>
                <option value="Por proyectos">Por proyectos</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tarifa aproximada <small style="color:var(--color-text-muted);">(opcional)</small></label>
              <input class="form-input" v-model="skillsForm.hourly_rate" placeholder="Ej: $50.000/hora, $300.000/día">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Habilidades y oficios</label>
            <p style="font-size:var(--fs-xs);color:var(--color-text-muted);margin-bottom:var(--space-2);">Agrega lo que sabes hacer: albañilería, plomería, electricidad, cocina, etc.</p>
            <div class="skills-input-row">
              <input class="form-input" v-model="newSkill" @keydown.enter.prevent="addSkill" placeholder="Ej: Albañilería, Plomería..." style="flex:1;">
              <button type="button" class="btn btn--primary btn--sm" @click="addSkill">Agregar</button>
            </div>
            <div class="skills-list">
              <span class="skill-tag" v-for="(skill, i) in skillsList" :key="i">
                {{ skill }}
                <button class="skill-tag__remove" @click="removeSkill(i)" title="Eliminar">×</button>
              </span>
            </div>
            <div style="margin-top:var(--space-3);">
              <p style="font-size:var(--fs-xs);color:var(--color-text-muted);margin-bottom:var(--space-2);">Sugerencias:</p>
              <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
                <button v-for="s in suggestedSkills" :key="s" type="button" @click="addSkillByName(s)" style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:2px 10px;font-size:var(--fs-xs);cursor:pointer;transition:all var(--transition-fast);">
                  {{ s }}
                </button>
              </div>
            </div>
          </div>

          <button type="button" class="btn btn--primary btn--lg" :class="{ 'btn--loading': isSavingSkills }" :disabled="isSavingSkills" @click="saveSkillsSection" style="margin-top:var(--space-4);">
            Guardar habilidades
          </button>
        </div>
      </div>

      <!-- Portafolio Visual -->
      <div class="profile-card">
        <div class="profile-card__title">
          <span style="display:flex;align-items:center;gap:6px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            Portafolio de trabajos
          </span>
          <span class="profile-badge" style="text-transform:none;letter-spacing:0;">{{ portfolioImages.length }}/5</span>
        </div>
        <p style="font-size:var(--fs-sm);color:var(--color-text-muted);margin-bottom:var(--space-4);">
          Muestra tus mejores trabajos. Los empleadores verán estas imágenes en tu perfil del directorio.
        </p>
        <div class="portfolio-grid">
          <div
            v-for="(img, i) in portfolioImages"
            :key="i"
            class="portfolio-item"
          >
            <img :src="img" alt="Trabajo previo" loading="lazy">
            <button class="portfolio-item__remove" @click="removePortfolioImage(img)" title="Eliminar imagen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <label
            v-if="portfolioImages.length < 5"
            class="portfolio-add"
            :class="{ 'portfolio-add--loading': isUploadingPortfolio }"
          >
            <input type="file" accept="image/jpeg,image/png,image/webp" style="display:none;" @change="handlePortfolioUpload">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            <span>Agregar</span>
          </label>
        </div>
      </div>

      <!-- Educación -->
      <div class="profile-card">
        <div class="profile-card__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:6px;"><path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/></svg> Educación
          <button class="btn btn--ghost btn--sm" @click="addEducation">+ Agregar</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-4);">
          <div v-for="(edu, i) in educationList" :key="i" style="border:1px solid var(--color-border-light);border-radius:var(--radius-lg);padding:var(--space-5);background:var(--color-bg);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4);">
              <strong style="font-size:var(--fs-sm);">Estudio {{ i + 1 }}</strong>
              <button @click="removeEducation(i)" style="background:none;border:none;color:var(--color-danger);cursor:pointer;font-size:var(--fs-sm);">Eliminar</button>
            </div>
            <div class="profile-form__row" style="margin-bottom:var(--space-3);">
              <div class="form-group">
                <label class="form-label">Institución</label>
                <input class="form-input" v-model="edu.institution" placeholder="Universidad / Colegio...">
              </div>
              <div class="form-group">
                <label class="form-label">Título / Nivel</label>
                <input class="form-input" v-model="edu.degree" placeholder="Ej: Bachiller, Técnico, Profesional...">
              </div>
            </div>
            <div class="profile-form__row">
              <div class="form-group">
                <label class="form-label">Año inicio</label>
                <input class="form-input" type="number" min="1950" max="2099" v-model="edu.year_start" placeholder="2018">
              </div>
              <div class="form-group">
                <label class="form-label">Año fin</label>
                <input class="form-input" type="number" min="1950" max="2099" v-model="edu.year_end" placeholder="2022">
              </div>
            </div>
          </div>
        </div>
        <p v-if="educationList.length === 0" style="font-size:var(--fs-sm);color:var(--color-text-muted);">
          Aún no has agregado estudios. Haz clic en "+ Agregar" para comenzar.
        </p>
      </div>

      <!-- Experiencia laboral -->
      <div class="profile-card">
        <div class="profile-card__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:6px;"><path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"/></svg> Experiencia laboral
          <button class="btn btn--ghost btn--sm" @click="addExperience">+ Agregar</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-4);">
          <div v-for="(exp, i) in experienceList" :key="i" style="border:1px solid var(--color-border-light);border-radius:var(--radius-lg);padding:var(--space-5);background:var(--color-bg);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-4);">
              <strong style="font-size:var(--fs-sm);">Experiencia {{ i + 1 }}</strong>
              <button @click="removeExperience(i)" style="background:none;border:none;color:var(--color-danger);cursor:pointer;font-size:var(--fs-sm);">Eliminar</button>
            </div>
            <div class="profile-form__row" style="margin-bottom:var(--space-3);">
              <div class="form-group">
                <label class="form-label">Empresa</label>
                <input class="form-input" v-model="exp.company" placeholder="Nombre de la empresa...">
              </div>
              <div class="form-group">
                <label class="form-label">Cargo</label>
                <input class="form-input" v-model="exp.position" placeholder="Ej: Vendedor, Operario...">
              </div>
            </div>
            <div class="profile-form__row" style="margin-bottom:var(--space-3);">
              <div class="form-group">
                <label class="form-label">Año inicio</label>
                <input class="form-input" type="number" min="1950" max="2099" v-model="exp.year_start" placeholder="2020">
              </div>
              <div class="form-group">
                <label class="form-label">Año fin</label>
                <input class="form-input" type="number" min="1950" max="2099" v-model="exp.year_end" :disabled="exp.current" placeholder="2023">
              </div>
            </div>
            <label style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--fs-sm);margin-bottom:var(--space-3);">
              <input type="checkbox" v-model="exp.current">
              Trabajo aquí actualmente
            </label>
            <div class="form-group">
              <label class="form-label">Descripción (opcional)</label>
              <textarea class="form-textarea" v-model="exp.description" rows="2" placeholder="Breve descripción de tus funciones..."></textarea>
            </div>
          </div>
        </div>
        <p v-if="experienceList.length === 0" style="font-size:var(--fs-sm);color:var(--color-text-muted);">
          Aún no has agregado experiencia laboral. Haz clic en "+ Agregar" para comenzar.
        </p>
      </div>

      <!-- Empleos Guardados -->
      <div class="profile-card">
        <div class="profile-card__title">♥ Empleos guardados</div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">
          <div v-for="job in savedJobs" :key="job.id" class="job-row" style="cursor:pointer;" @click="router.push(`/job/${job.id}`)">
            <div class="job-row__info">
              <div class="job-row__title">{{ job.title }}</div>
              <p class="job-row__meta">
                <span>{{ job.company_name }}</span>
                <span>{{ job.location }}</span>
                <span>{{ job.modality }}</span>
              </p>
            </div>
            <button class="btn btn--ghost btn--sm" @click.stop="unsaveJob(job.id)" title="Quitar de guardados">✕</button>
          </div>
        </div>
        <p v-if="savedJobs.length === 0" style="font-size:var(--fs-sm);color:var(--color-text-muted);">
          No tienes empleos guardados. Explora ofertas y guarda las que te interesen.
        </p>
      </div>
    </template>

    <!-- Danger Zone -->
    <div class="profile-card" style="border-color:var(--color-danger);">
      <div class="profile-card__title" style="color:var(--color-danger);">Zona de peligro</div>
      <p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:var(--space-4);">
        Al cerrar sesión se eliminará tu token local. Podrás volver a iniciar sesión en cualquier momento.
      </p>
      <button class="btn btn--danger btn--sm" @click="logout">Cerrar sesión</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/config/api'
import AuthService from '@/services/auth.service'
import CompaniesService from '@/services/companies.service'
import JobsService from '@/services/jobs.service'
import AIService from '@/services/ai.service'
import EmployerDashboard from '@/components/EmployerDashboard.vue'
import { showToast } from '@/utils/helpers'
import { generateCV } from '@/utils/pdf-cv'
import type { User, Company, Job } from '@/types'

const router = useRouter()
const route = useRoute()

// State
const user = ref<User | Record<string, unknown>>({})
const isEmployer = ref(false)
const isWelcomeFreelance = ref(false)

// Forms & Sections
const profileForm = ref({ full_name: '', phone: '', location: '', bio: '' })
const isSavingProfile = ref(false)

const employerCompany = ref<Company | null>(null)
const employerForm = ref({ name: '', nit: '', phone: '', website: '', location: '', address: '', description: '', employer_type: 'company', hiring_model: 'direct' })
const isSavingEmployer = ref(false)

const isServiceSectionHidden = ref(false)
const isServicePublic = ref(false)
const skillsForm = ref({ work_type: 'employee', availability: '', hourly_rate: '' })
const skillsList = ref<string[]>([])
const newSkill = ref('')
const suggestedSkills = ['Albañilería','Plomería','Electricidad','Carpintería','Pintura','Soldadura','Cocina','Jardinería','Mecánica','Vigilancia','Costura','Peluquería','Limpieza','Transporte','Contabilidad']
const isSavingSkills = ref(false)

const educationList = ref<any[]>([])
const experienceList = ref<any[]>([])

const savedJobs = ref<Job[]>([])

const avatarInput = ref<HTMLInputElement | null>(null)
const idDocInput = ref<HTMLInputElement | null>(null)
const isUploadingIdentity = ref(false)
const portfolioImages = ref<string[]>([])
const isUploadingPortfolio = ref(false)
const isGeneratingCV = ref(false)

// Computed
const initials = computed(() => {
  const u = user.value as Record<string, unknown>
  const fullName = u.full_name as string | undefined
  return fullName ? fullName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '??'
})
const avatarStyle = computed(() => {
  const u = user.value as Record<string, unknown>
  const avatarUrl = u.avatar_url as string | undefined
  if (avatarUrl) {
    return { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' }
  }
  return {}
})
const canPublishServices = computed(() => skillsForm.value.work_type === 'freelance')

onMounted(async () => {
  const u = AuthService.getUser()
  if (!u) {
    router.push('/login')
    return
  }
  user.value = u
  isEmployer.value = u.role === 'employer'
  isWelcomeFreelance.value = route.query.welcome === 'freelance'

  profileForm.value = {
    full_name: u.full_name || '',
    phone: u.phone || '',
    location: u.location || '',
    bio: u.bio || ''
  }

  if (isEmployer.value) {
    loadEmployerInfo()
  } else {
    loadSeekerInfo()
  }
})

const loadEmployerInfo = async () => {
  try {
    const userId = 'id' in user.value ? (user.value as User).id : ''
    const meta = JSON.parse(localStorage.getItem(`lw_employer_profile_meta_${userId}`) || '{}')
    employerForm.value.employer_type = meta.employer_type || 'company'
    employerForm.value.hiring_model = meta.hiring_model || 'direct'

    const company = await CompaniesService.getMyCompany()
    if (company?.id) {
      employerCompany.value = company
      employerForm.value = { ...employerForm.value, ...company }
    }
  } catch { /* silent */ }
}

const loadSeekerInfo = async () => {
  const u = user.value as User
  skillsList.value = Array.isArray(u.skills) ? [...u.skills] : []
  skillsForm.value.work_type = u.work_type || 'employee'
  skillsForm.value.availability = u.availability || ''
  skillsForm.value.hourly_rate = u.hourly_rate || ''
  isServicePublic.value = !!u.service_public

  const hiddenKey = `lw_service_section_hidden_${u.id}`
  isServiceSectionHidden.value = localStorage.getItem(hiddenKey) === '1'

  educationList.value = Array.isArray(u.education) ? [...u.education] : []
  experienceList.value = Array.isArray(u.experience) ? [...u.experience] : []
  portfolioImages.value = Array.isArray(u.portfolio_images) ? [...u.portfolio_images] : []

  try {
    savedJobs.value = await JobsService.getSavedJobs() || []
  } catch {
    savedJobs.value = []
  }
}

// Actions
const savePersonalInfo = async () => {
  isSavingProfile.value = true
  try {
    const updates: Record<string, unknown> = { ...profileForm.value }
    if (!isEmployer.value) {
      updates.education = educationList.value
      updates.experience = experienceList.value
    }
    await AuthService.updateProfile(updates as Partial<User>)
    if ('full_name' in user.value) {
      (user.value as Record<string, unknown>).full_name = updates.full_name
    }
    showToast('Perfil actualizado correctamente', 'success')
  } catch {
    showToast('Error al guardar', 'error')
  } finally {
    isSavingProfile.value = false
  }
}

const saveEmployerInfo = async () => {
  isSavingEmployer.value = true
  try {
    const userId = 'id' in user.value ? (user.value as User).id : ''
    localStorage.setItem(`lw_employer_profile_meta_${userId}`, JSON.stringify({
      employer_type: employerForm.value.employer_type,
      hiring_model: employerForm.value.hiring_model,
    }))

    if (employerCompany.value?.id) {
      await CompaniesService.update(employerCompany.value.id, employerForm.value)
      showToast('Datos del contratante actualizados', 'success')
    } else {
      const company = await CompaniesService.create(employerForm.value)
      employerCompany.value = company
      showToast('Empresa creada y datos guardados', 'success')
    }
  } catch {
    showToast('Error al guardar empresa', 'error')
  } finally {
    isSavingEmployer.value = false
  }
}

const handleAvatarUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast('La imagen no puede superar 5MB', 'error')
    return
  }
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const result = await api.upload('/upload/avatar', formData)
    const res = result as { url?: string }
    if (res.url) {
      if ('avatar_url' in user.value) {
        (user.value as Record<string, unknown>).avatar_url = res.url
      }
      const lwUser = AuthService.getUser()
      if (lwUser) {
        lwUser.avatar_url = res.url
        localStorage.setItem('lw_user', JSON.stringify(lwUser))
      }
    }
  } catch {
    showToast('Error al subir foto', 'error')
  }
}

const handleIdentityUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast('El documento no puede superar 5MB', 'error')
    return
  }
  isUploadingIdentity.value = true
  try {
    const formData = new FormData()
    formData.append('document', file)
    const result = await api.upload('/upload/identity', formData)
    const res = result as { message?: string, status?: string }
    if (res.status === 'pending') {
      if ('verification_status' in user.value) {
        (user.value as Record<string, unknown>).verification_status = 'pending'
      }
      const lwUser = AuthService.getUser()
      if (lwUser) {
        lwUser.verification_status = 'pending'
        localStorage.setItem('lw_user', JSON.stringify(lwUser))
      }
      showToast('Documento enviado. En revisión.', 'success')
    }
  } catch {
    showToast('Error al subir documento', 'error')
  } finally {
    isUploadingIdentity.value = false
  }
}

// Skills
const toggleServiceVisibility = async () => {
  isServiceSectionHidden.value = !isServiceSectionHidden.value
  const userId = 'id' in user.value ? (user.value as User).id : ''
  localStorage.setItem(`lw_service_section_hidden_${userId}`, isServiceSectionHidden.value ? '1' : '0')
  
  if (isServiceSectionHidden.value && Object.prototype.hasOwnProperty.call(user.value, 'service_public')) {
    isServicePublic.value = false
    try {
      await AuthService.updateProfile({ service_public: false })
    } catch { /* silent */ }
  }
}

// Portfolio
const handlePortfolioUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast('La imagen no puede superar 5MB', 'error')
    return
  }
  if (portfolioImages.value.length >= 5) {
    showToast('Máximo 5 imágenes en el portafolio', 'error')
    return
  }
  isUploadingPortfolio.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const result = await api.upload<{ images: string[] }>('/upload/portfolio', formData)
    if (result.images) {
      portfolioImages.value = result.images
      // Sync to local storage user
      const lwUser = AuthService.getUser()
      if (lwUser) {
        lwUser.portfolio_images = result.images
        localStorage.setItem('lw_user', JSON.stringify(lwUser))
      }
      showToast('Imagen agregada al portafolio', 'success')
    }
  } catch {
    showToast('Error al subir imagen', 'error')
  } finally {
    isUploadingPortfolio.value = false
    // Reset input so same file can be selected again
    ;(e.target as HTMLInputElement).value = ''
  }
}

const removePortfolioImage = async (imageUrl: string) => {
  try {
    const token = localStorage.getItem('lw_token')
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const resp = await fetch(`${apiUrl}/upload/portfolio`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ image_url: imageUrl }),
    })
    const data = await resp.json()
    if (resp.ok && data.images) {
      portfolioImages.value = data.images
      const lwUser = AuthService.getUser()
      if (lwUser) {
        lwUser.portfolio_images = data.images
        localStorage.setItem('lw_user', JSON.stringify(lwUser))
      }
      showToast('Imagen eliminada', 'success')
    } else {
      showToast(data.message || 'Error al eliminar', 'error')
    }
  } catch {
    showToast('Error al eliminar imagen', 'error')
  }
}
const toggleServicePublishBtn = () => {
  if (!canPublishServices.value) return
  isServicePublic.value = !isServicePublic.value
}
const addSkill = () => {
  const val = newSkill.value.trim()
  if (val && !skillsList.value.includes(val)) skillsList.value.push(val)
  newSkill.value = ''
}
const addSkillByName = (name: string) => {
  if (!skillsList.value.includes(name)) skillsList.value.push(name)
}
const removeSkill = (index: number) => {
  skillsList.value.splice(index, 1)
}
const saveSkillsSection = async () => {
  isSavingSkills.value = true
  try {
    const shouldPublish = skillsForm.value.work_type === 'freelance' ? isServicePublic.value : false
    const updatePayload: Record<string, unknown> = {
      skills: skillsList.value,
      work_type: skillsForm.value.work_type,
      availability: skillsForm.value.availability,
      hourly_rate: skillsForm.value.hourly_rate ? Number(skillsForm.value.hourly_rate) : null
    }
    if (Object.prototype.hasOwnProperty.call(user.value, 'service_public')) {
      updatePayload.service_public = shouldPublish
    }
    await AuthService.updateProfile(updatePayload as Partial<User>)
    isServicePublic.value = shouldPublish
    showToast('Habilidades guardadas', 'success')
  } catch {
    showToast('Error al guardar habilidades', 'error')
  } finally {
    isSavingSkills.value = false
  }
}

// Education & Experience
const addEducation = () => educationList.value.push({ institution: '', degree: '', year_start: '', year_end: '' })
const removeEducation = (index: number) => educationList.value.splice(index, 1)
const addExperience = () => experienceList.value.push({ company: '', position: '', year_start: '', year_end: '', current: false, description: '' })
const removeExperience = (index: number) => experienceList.value.splice(index, 1)

// Saved Jobs
const unsaveJob = async (jobId: string) => {
  try {
    await JobsService.unsave(jobId)
    savedJobs.value = savedJobs.value.filter(j => j.id !== jobId)
  } catch {
    showToast('Error al remover empleo guardado', 'error')
  }
}

const logout = () => {
  AuthService.logout()
}

const downloadCV = async () => {
  isGeneratingCV.value = true
  try {
    const u = user.value as Record<string, any>
    await generateCV({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      location: u.location,
      bio: u.bio,
      skills: skillsList.value,
      availability: skillsForm.value.availability,
      hourly_rate: skillsForm.value.hourly_rate,
      education: educationList.value,
      experience: experienceList.value,
      portfolio_images: portfolioImages.value,
      avatar_url: u.avatar_url,
    })
  } catch {
    showToast('Error al generar el CV', 'error')
  } finally {
    isGeneratingCV.value = false
  }
}

// ── AI Generative features ──
const isSuggestingImprovements = ref(false)
const suggestBioImprovements = async () => {
  isSuggestingImprovements.value = true
  try {
    const res = await AIService.suggestProfileImprovements()
    alert("Sugerencias de IA:\n\n" + res)
  } catch {
    showToast('Error al generar sugerencias', 'error')
  } finally {
    isSuggestingImprovements.value = false
  }
}
</script>

<style scoped>
.profile-page { padding-top: var(--space-8); padding-bottom: var(--space-16); }
.profile-header { display: flex; align-items: center; gap: var(--space-6); margin-bottom: var(--space-8); flex-wrap: wrap; }
.profile-avatar { width: 96px; height: 96px; border-radius: var(--radius-full); background: var(--color-primary-50); border: 1px solid var(--color-primary-100); display: flex; align-items: center; justify-content: center; font-size: var(--fs-2xl); font-weight: var(--fw-bold); color: var(--color-primary); flex-shrink: 0; position: relative; }
.profile-avatar__edit { position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; background: var(--color-primary); color: #fff; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 3px solid var(--color-surface); transition: background var(--transition-fast); }
.profile-avatar__edit:hover { background: var(--color-primary-dark); }
.profile-header__info h1 { font-size: var(--fs-2xl); margin-bottom: var(--space-1); letter-spacing: -0.02em; }
.profile-header__info p { color: var(--color-text-secondary); margin: 0; }
.profile-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-2xl); padding: var(--space-8); margin-bottom: var(--space-6); }
.profile-card__title { font-size: var(--fs-lg); margin-bottom: var(--space-6); display: flex; align-items: center; justify-content: space-between; }
.profile-form { display: flex; flex-direction: column; gap: var(--space-5); }
.profile-form__row { display: grid; grid-template-columns: 1fr; gap: var(--space-5); }
@media (min-width: 768px) { .profile-form__row { grid-template-columns: 1fr 1fr; } }
.profile-badge { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-1) var(--space-3); background: var(--color-primary-50); color: var(--color-primary); border: 1px solid var(--color-primary-100); border-radius: var(--radius-full); font-family: var(--font-mono); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
.skill-tag { display: inline-flex; align-items: center; gap: var(--space-1); padding: var(--space-1) var(--space-3); background: var(--color-primary-50); color: var(--color-primary-dark); border-radius: var(--radius-full); font-size: var(--fs-xs); font-weight: var(--fw-medium); }
.skill-tag__remove { background: none; border: none; cursor: pointer; color: var(--color-primary); line-height: 1; padding: 0; font-size: var(--fs-sm); }
.skill-tag__remove:hover { color: var(--color-danger); }
.skills-input-row { display: flex; gap: var(--space-2); }
.skills-list { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-3); min-height: 32px; }
.work-type-options { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.work-type-option { flex: 1; min-width: 120px; }
.work-type-option input[type=radio] { display: none; }
.work-type-option label { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; font-size: var(--fs-sm); text-align: center; transition: all var(--transition-fast); }
.work-type-option label:hover { border-color: var(--color-primary-200); background: var(--color-primary-50); }
.work-type-option input:checked + label { border-color: var(--color-primary); background: var(--color-primary-50); color: var(--color-primary-dark); font-weight: var(--fw-semibold); }
.btn--primary { background: #15803d; border-color: #15803d; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #166534; border-color: #166534; }

.job-row { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-3); transition: all var(--transition); }
.job-row:hover { border-color: var(--color-primary-200); transform: translateY(-1px); }
.job-row__info { flex: 1; min-width: 0; }
.job-row__title { font-family: var(--font-heading); font-size: var(--fs-base); font-weight: var(--fw-semibold); margin-bottom: var(--space-1); }
.job-row__meta { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-muted); margin: 0; display: flex; gap: var(--space-4); flex-wrap: wrap; text-transform: uppercase; letter-spacing: 0.04em; }

@media (max-width: 767px) {
  .profile-page { padding-top: var(--space-5); padding-bottom: var(--space-10); }
  .profile-header { gap: var(--space-4); margin-bottom: var(--space-5); }
  .profile-header__info h1 { font-size: var(--fs-xl); }
  .profile-card { padding: var(--space-5); border-radius: var(--radius-lg); }
  .profile-card__title { font-size: var(--fs-base); margin-bottom: var(--space-4); }
}
@media (max-width: 479px) {
  .profile-avatar { width: 72px; height: 72px; font-size: var(--fs-xl); }
  .work-type-option { min-width: 0; }
  .work-type-option label { padding: var(--space-3) var(--space-2); font-size: var(--fs-xs); }
  .profile-card { padding: var(--space-4); }
}

/* Portfolio Grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}
.portfolio-item {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg);
}
.portfolio-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.portfolio-item:hover img {
  transform: scale(1.05);
}
.portfolio-item__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  border: none;
  border-radius: var(--radius-full);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.portfolio-item:hover .portfolio-item__remove {
  opacity: 1;
}
.portfolio-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  aspect-ratio: 4 / 3;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  transition: all 0.2s ease;
}
.portfolio-add:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-50);
}
.portfolio-add--loading {
  opacity: 0.5;
  pointer-events: none;
}
</style>
