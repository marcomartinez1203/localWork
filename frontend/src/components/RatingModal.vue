<template>
  <div class="rating-overlay" :class="{ open: modelValue }" @click.self="close">
    <div class="rating-modal">
      <div class="rating-modal__header">
        <h2 class="rating-modal__title">Calificar a {{ targetName }}</h2>
        <button class="modal__close" @click="close" aria-label="Cerrar modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <form @submit.prevent="submit" class="rating-form">
        <!-- General score -->
        <div class="rating-section">
          <label class="rating-label">Puntuación general</label>
          <div class="stars-row">
            <button v-for="s in 5" :key="s" type="button" class="star-btn" :class="{ active: score >= s }" @click="score = s">
              <svg width="28" height="28" viewBox="0 0 24 24" :fill="score >= s ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Sub-categories -->
        <div class="rating-section">
          <label class="rating-label">Puntualidad</label>
          <div class="stars-row stars-row--sm">
            <button v-for="s in 5" :key="'p'+s" type="button" class="star-btn star-btn--sm" :class="{ active: punctuality >= s }" @click="punctuality = s">
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="punctuality >= s ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="rating-section">
          <label class="rating-label">Calidad de trabajo</label>
          <div class="stars-row stars-row--sm">
            <button v-for="s in 5" :key="'q'+s" type="button" class="star-btn star-btn--sm" :class="{ active: quality >= s }" @click="quality = s">
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="quality >= s ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="rating-section">
          <label class="rating-label">Comunicación</label>
          <div class="stars-row stars-row--sm">
            <button v-for="s in 5" :key="'c'+s" type="button" class="star-btn star-btn--sm" :class="{ active: communication >= s }" @click="communication = s">
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="communication >= s ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Recommend toggle -->
        <div class="rating-section">
          <label class="rating-label">¿Lo recomendarías?</label>
          <div class="recommend-toggle">
            <button type="button" class="recommend-btn" :class="{ active: wouldRecommend === true }" @click="wouldRecommend = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m7.348-7.25H5.25A2.25 2.25 0 0 0 3 10.5v6.75A2.25 2.25 0 0 0 5.25 19.5h1.654c.535 0 .99.398 1.068.927.159 1.06.81 2.046 1.764 2.63a3.076 3.076 0 0 0 1.614.446c.597 0 1.107-.21 1.517-.571.34-.299.556-.706.615-1.147.08-.6.527-1.035 1.068-1.035h2.452"/></svg>
              Sí
            </button>
            <button type="button" class="recommend-btn recommend-btn--no" :class="{ active: wouldRecommend === false }" @click="wouldRecommend = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 2.25 12c0-2.848.992-5.464 2.649-7.521C5.287 3.997 5.886 3.75 6.504 3.75h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.5a2.25 2.25 0 0 0 2.25 2.25.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.5-.634 1.226-1.08 2.032-1.08h.384m-10.253 0H4.372"/></svg>
              No
            </button>
          </div>
        </div>

        <!-- Comment -->
        <div class="rating-section">
          <label class="rating-label">Comentario <span style="font-weight:400;color:var(--color-text-muted);">(opcional)</span></label>
          <textarea v-model="comment" class="form-textarea" rows="3" placeholder="Comparte tu experiencia..."></textarea>
        </div>

        <button type="submit" class="btn btn--primary btn--lg btn--block" :class="{ 'btn--loading': isSubmitting }" :disabled="isSubmitting || score === 0">
          Enviar calificación
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import RatingsService from '@/services/ratings.service'
import { showToast } from '@/utils/helpers'

const props = defineProps<{
  modelValue: boolean
  applicationId: string
  targetName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'rated'): void
}>()

const score = ref(0)
const punctuality = ref(0)
const quality = ref(0)
const communication = ref(0)
const wouldRecommend = ref<boolean | null>(null)
const comment = ref('')
const isSubmitting = ref(false)

// Reset form when modal opens
watch(() => props.modelValue, (open) => {
  if (open) {
    score.value = 0
    punctuality.value = 0
    quality.value = 0
    communication.value = 0
    wouldRecommend.value = null
    comment.value = ''
  }
})

const close = () => emit('update:modelValue', false)

const submit = async () => {
  if (score.value === 0) return
  isSubmitting.value = true
  try {
    await RatingsService.createPostService({
      applicationId: props.applicationId,
      score: score.value,
      punctuality: punctuality.value || undefined,
      quality: quality.value || undefined,
      communication: communication.value || undefined,
      wouldRecommend: wouldRecommend.value ?? undefined,
      comment: comment.value || undefined,
    })
    showToast('¡Calificación enviada!', 'success')
    emit('rated')
    close()
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : 'Error al enviar calificación', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.rating-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  z-index: var(--z-modal); align-items: center; justify-content: center;
  padding: var(--space-4);
}
.rating-overlay.open { display: flex; }

.rating-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  width: 100%; max-width: 480px;
  animation: scaleIn var(--transition) forwards;
  max-height: 90dvh; overflow-y: auto;
}
.rating-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-6);
}
.rating-modal__title { font-size: var(--fs-xl); }

.rating-form { display: flex; flex-direction: column; gap: var(--space-5); }
.rating-section { display: flex; flex-direction: column; gap: var(--space-2); }
.rating-label {
  font-family: var(--font-mono); font-size: 11px; font-weight: 500;
  color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em;
}

.stars-row { display: flex; gap: var(--space-1); }
.star-btn {
  color: var(--color-border); cursor: pointer; padding: 2px;
  transition: color var(--transition-fast), transform var(--transition-fast);
  background: none; border: none;
}
.star-btn:hover { transform: scale(1.15); }
.star-btn.active { color: #f59e0b; }
.star-btn--sm { padding: 1px; }

.recommend-toggle { display: flex; gap: var(--space-2); }
.recommend-btn {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border-light); border-radius: var(--radius-lg);
  font-size: var(--fs-sm); font-weight: var(--fw-medium);
  color: var(--color-text-secondary); cursor: pointer;
  transition: all var(--transition-fast); background: none;
}
.recommend-btn:hover { border-color: var(--color-primary-200); }
.recommend-btn.active { background: rgba(22,163,74,0.08); border-color: var(--color-primary); color: var(--color-primary); }
.recommend-btn--no.active { background: rgba(239,68,68,0.08); border-color: #ef4444; color: #ef4444; }

@media (max-width: 640px) {
  .rating-overlay { align-items: flex-end; padding: 0; }
  .rating-modal { border-radius: var(--radius-2xl) var(--radius-2xl) 0 0; padding: var(--space-6) var(--space-5); max-width: 100%; }
  .rating-modal__title { font-size: var(--fs-lg); }
}
</style>
