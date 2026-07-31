<script setup lang="ts">
import PulseChip from './PulseChip.vue'
import { t } from '../i18n/en'
</script>

<template>
  <!-- Colour is never the only signal: the check and the words carry it too. -->
  <PulseChip tone="verified">
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2 6.2l2.6 2.6L10 3.4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    {{ t.reviews.verified }}
  </PulseChip>
</template>
