<script setup lang="ts">
import { computed, onErrorCaptured, ref } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './ui/TabBar.vue'
import PulseBanner from './ui/PulseBanner.vue'
import PulseButton from './ui/PulseButton.vue'
import { useWallet } from './wallet/useWallet'
import { t } from './i18n/en'

const route = useRoute()
const { isSignedIn } = useWallet()

const bare = computed(() => route.meta.bare === true)
const renderError = ref<string | null>(null)

/**
 * Boundary keeps the tab bar alive when a view throws — the user never loses
 * navigation, only the section that failed.
 */
onErrorCaptured((error) => {
  renderError.value = error instanceof Error ? error.message : 'Something went wrong here.'
  return false
})
</script>

<template>
  <div class="shell" :class="{ 'shell--bare': bare }">
    <main class="shell__content">
      <div v-if="renderError" class="shell__error">
        <PulseBanner kind="error" message="Something went wrong here." />
        <PulseButton variant="secondary" @click="renderError = null">
          {{ t.common.retry }}
        </PulseButton>
      </div>
      <RouterView v-else v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>

    <TabBar v-if="isSignedIn && !bare" />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100dvh;
}

.shell__content {
  max-width: 560px;
  margin: 0 auto;
}

/* Screens carry their own gutters; the shell only reserves safe areas. */
.shell:not(.shell--bare) .shell__content {
  padding: 0 var(--space-4);
  padding-top: env(safe-area-inset-top);
  /* Clear of the fixed tab bar plus the home indicator. */
  padding-bottom: calc(72px + env(safe-area-inset-bottom) + var(--space-6));
}

.shell__error {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-6) 0;
}
</style>
