<script setup lang="ts">
withDefaults(
  defineProps<{ tone?: 'discover' | 'verified' | 'pending' | 'rare' | 'neutral' }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <span :class="['chip', `chip--${tone}`]"><slot /></span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.chip--neutral {
  background: var(--surface-inset);
  color: var(--text-muted);
}
.chip--discover {
  background: color-mix(in srgb, var(--discover) 16%, transparent);
  color: var(--discover);
}
.chip--verified {
  background: color-mix(in srgb, var(--verified) 16%, transparent);
  color: var(--verified);
}
.chip--pending {
  background: color-mix(in srgb, var(--pending) 18%, transparent);
  color: var(--text-muted);
}
.chip--rare {
  background: color-mix(in srgb, var(--rare) 20%, transparent);
  color: #c58cf5;
}
</style>
