<script setup lang="ts">
withDefaults(defineProps<{ height?: number; width?: string; radius?: string }>(), {
  height: 16,
  width: '100%',
  radius: 'var(--radius-sm)',
})
</script>

<template>
  <!-- Matches the final layout's shape, so nothing jumps when data lands. -->
  <span
    class="skeleton"
    :style="{ height: `${height}px`, width, borderRadius: radius }"
    aria-hidden="true"
  />
</template>

<style scoped>
.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--surface-inset) 0%,
    var(--surface-raised) 50%,
    var(--surface-inset) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
