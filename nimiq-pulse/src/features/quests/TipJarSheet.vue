<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import PulseButton from '../../ui/PulseButton.vue'
import { nimToLuna } from '../../lib/format'
import { t } from '../../i18n/en'

const emit = defineEmits<{ (e: 'confirm', amountLuna: number): void; (e: 'cancel'): void }>()

const PRESETS = [1, 5, 20]
const amount = ref(5)
const sending = ref(false)

function confirm() {
  sending.value = true
  emit('confirm', nimToLuna(amount.value))
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('cancel')
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="scrim" @click.self="emit('cancel')">
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Send a tip">
      <h2>{{ t.tip.title }}</h2>
      <p class="sheet__body">{{ t.tip.body }}</p>

      <div class="presets">
        <button
          v-for="p in PRESETS"
          :key="p"
          :class="['preset', { 'preset--on': amount === p }]"
          @click="amount = p"
        >
          {{ p }} NIM
        </button>
      </div>

      <label class="custom">
        <span>{{ t.tip.amount }}</span>
        <input v-model.number="amount" type="number" min="1" step="1" inputmode="numeric" />
      </label>

      <PulseButton block :disabled="sending || amount < 1" @click="confirm">
        {{ sending ? t.tip.sending : `${t.tip.send} · ${amount} NIM` }}
      </PulseButton>
      <PulseButton variant="ghost" block :disabled="sending" @click="emit('cancel')">
        {{ t.tip.cancel }}
      </PulseButton>
    </div>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  background: var(--overlay-scrim);
}

.sheet {
  width: 100%;
  display: grid;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-4);
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--space-5));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background: var(--surface-raised);
  box-shadow: var(--shadow-float);
}

h2 { font-size: 19px; }
.sheet__body { color: var(--text-muted); font-size: 13px; }

.presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); }

.preset {
  min-height: var(--tap-min);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-body);
  font-weight: 700;
}

.preset--on {
  border-color: var(--discover);
  color: var(--discover);
  background: color-mix(in srgb, var(--discover) 12%, transparent);
}

.custom { display: grid; gap: var(--space-2); }

.custom span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

input {
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-inset);
  color: var(--text-primary);
  font-size: 16px;
  font-family: inherit;
}
</style>
