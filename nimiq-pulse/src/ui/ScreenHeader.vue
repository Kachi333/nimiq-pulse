<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ title: string; back?: boolean }>()
const router = useRouter()
</script>

<template>
  <header class="head">
    <button v-if="back" class="head__back" aria-label="Back" @click="router.back()">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <h1>{{ title }}</h1>
    <div class="head__slot"><slot name="action" /></div>
  </header>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) 0 var(--space-3);
}

h1 {
  flex: 1;
  font-size: 22px;
}

.head__back {
  display: grid;
  place-content: center;
  width: var(--tap-min);
  height: var(--tap-min);
  margin-left: calc(var(--space-3) * -1);
  border: 0;
  background: transparent;
  color: var(--text-primary);
}

.head__slot {
  flex: none;
}
</style>
