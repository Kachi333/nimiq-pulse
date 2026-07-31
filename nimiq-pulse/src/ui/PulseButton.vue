<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    disabled?: boolean
    block?: boolean
    /** Stated next to a disabled control — a dead button with no reason is a dead end. */
    hint?: string
  }>(),
  { variant: 'primary', disabled: false, block: false },
)
defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <div class="wrap" :class="{ 'wrap--block': block }">
    <button
      :class="['btn', `btn--${variant}`, { 'btn--block': block }]"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <slot />
    </button>
    <p v-if="hint && disabled" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.wrap--block {
  width: 100%;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 48px;
  padding: 0 var(--space-5);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 700;
  transition: transform var(--motion-fast) ease-out, opacity var(--motion-fast) ease-out;
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn--block {
  width: 100%;
}

.btn--primary {
  background: var(--discover);
  color: #fff;
}

.btn--secondary {
  background: transparent;
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.btn--ghost {
  background: transparent;
  color: var(--text-body);
  min-height: var(--tap-min);
}

.btn--danger {
  background: transparent;
  border-color: var(--danger);
  color: var(--danger);
}

.btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.hint {
  margin-top: var(--space-2);
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}
</style>
