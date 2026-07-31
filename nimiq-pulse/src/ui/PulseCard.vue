<script setup lang="ts">
withDefaults(defineProps<{ earned?: boolean; padded?: boolean }>(), {
  earned: false,
  padded: true,
})
</script>

<template>
  <section class="card" :class="{ 'card--earned': earned, 'card--padded': padded }">
    <slot />
  </section>
</template>

<style scoped>
.card {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

/* The one temperature break in the system: warm for what the user earned. */
.card--earned {
  background: var(--surface-earned);
}

.card--padded {
  padding: var(--space-4);
}
</style>
