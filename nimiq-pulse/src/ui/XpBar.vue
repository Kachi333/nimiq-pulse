<script setup lang="ts">
import { computed } from 'vue'
import { int } from '../lib/format'
import { t } from '../i18n/en'

const props = defineProps<{ into: number; forNext: number }>()

// Clamped at both ends: a bad value should render an empty bar, never a full one.
const pct = computed(() =>
  props.forNext > 0 ? Math.max(0, Math.min(100, (props.into / props.forNext) * 100)) : 0,
)
</script>

<template>
  <div class="xp">
    <p class="xp__label num">{{ t.profile.xpProgress(int(into), int(forNext)) }}</p>
    <div
      class="xp__track"
      role="progressbar"
      :aria-valuenow="into"
      :aria-valuemin="0"
      :aria-valuemax="forNext"
    >
      <span class="xp__fill" :style="{ width: `${pct}%` }" />
    </div>
  </div>
</template>

<style scoped>
.xp__label {
  margin-bottom: var(--space-2);
  color: var(--text-muted);
  font-size: 12px;
}

.xp__track {
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  overflow: hidden;
}

.xp__fill {
  display: block;
  height: 100%;
  /* The only gradient in the product, and only ever on earned progress. */
  background: var(--gradient-progress);
  transition: width var(--motion-celebrate) cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
