<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="modelValue"
        class="confirm-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`confirm-title-${uid}`"
        @click.self="cancel"
      >
        <div class="confirm-box">
          <div class="confirm-box__icon" :class="`confirm-box__icon--${variant}`" aria-hidden="true">
            <svg v-if="variant === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"/>
            </svg>
          </div>
          <h3 class="confirm-box__title" :id="`confirm-title-${uid}`">{{ title }}</h3>
          <p class="confirm-box__message">{{ message }}</p>
          <div class="confirm-box__actions">
            <button class="btn btn--ghost" @click="cancel" :disabled="loading">{{ cancelLabel }}</button>
            <button
              class="btn"
              :class="[variant === 'danger' ? 'btn--danger' : 'btn--primary', { 'btn--loading': loading }]"
              @click="confirm"
              :disabled="loading"
            >{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}>(), {
  title: '¿Estás seguro?',
  message: 'Esta acción no se puede deshacer.',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const uid = Math.random().toString(36).slice(2, 8)

const cancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.confirm-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.confirm-box__icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-box__icon--danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.confirm-box__icon--warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.confirm-box__icon--info {
  background: var(--color-primary-50);
  color: var(--color-primary);
}

.confirm-box__title {
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  margin: 0;
  color: var(--color-text);
}

.confirm-box__message {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.confirm-box__actions {
  display: flex;
  gap: var(--space-3);
  width: 100%;
  margin-top: var(--space-2);
}

.confirm-box__actions .btn {
  flex: 1;
}

.btn--danger {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
}

/* Transition */
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.15s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-fade-enter-active .confirm-box,
.confirm-fade-leave-active .confirm-box {
  transition: transform 0.15s ease;
}

.confirm-fade-enter-from .confirm-box {
  transform: scale(0.95) translateY(8px);
}

.confirm-fade-leave-to .confirm-box {
  transform: scale(0.95) translateY(8px);
}
</style>
