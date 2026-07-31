<script setup lang="ts">
defineProps<{ kind: 'stale' | 'info' | 'error'; message: string }>()
</script>

<template>
  <!-- Never blocks interaction, never covers content. -->
  <p :class="['banner', `banner--${kind}`]" role="status">{{ message }}</p>
</template>

<style scoped>
.banner {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.4;
}

.banner--stale {
  background: color-mix(in srgb, var(--pending) 14%, transparent);
  color: var(--text-body);
}

.banner--info {
  background: color-mix(in srgb, var(--discover) 14%, transparent);
  color: var(--text-body);
}

.banner--error {
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--danger);
}
</style>
