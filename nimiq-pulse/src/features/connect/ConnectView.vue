<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PulseButton from '../../ui/PulseButton.vue'
import { useWallet } from '../../wallet/useWallet'
import { t } from '../../i18n/en'

const router = useRouter()
const { state, connect } = useWallet()

/** A declined dialog is a decision, not an error — it never shows red. */
const declined = computed(() => state.error?.kind === 'user-declined')
const unavailable = computed(() => state.error?.kind === 'provider-unavailable')

const label = computed(() => {
  if (state.phase === 'awaiting-approval') return t.connect.awaitingApproval
  if (state.phase === 'reaching') return t.connect.reaching
  return t.connect.cta
})

async function onConnect() {
  if (await connect()) router.replace('/profile')
}
</script>

<template>
  <main class="connect">
    <div class="connect__brand">
      <img src="/logo-mark.svg" width="72" height="72" alt="" class="connect__mark" />
      <h1>{{ t.connect.title }}</h1>
      <p class="connect__body">{{ t.connect.body }}</p>
    </div>

    <div class="connect__action">
      <!-- Disclosure sits ABOVE the button, before the dialog appears. -->
      <p class="connect__disclosure">{{ t.connect.disclosure }}</p>

      <PulseButton block :disabled="state.connecting" @click="onConnect">
        {{ label }}
      </PulseButton>

      <p v-if="declined" class="connect__note">{{ t.connect.declined }}</p>

      <div v-else-if="unavailable" class="connect__note connect__note--block">
        <strong>{{ t.notInPay.title }}</strong>
        <p>{{ t.notInPay.body }}</p>
        <ol>
          <li v-for="(step, i) in t.notInPay.steps" :key="i">{{ step }}</li>
        </ol>
      </div>

      <p v-else-if="state.error" class="connect__note connect__note--error">
        {{ state.error.message }}
      </p>
    </div>
  </main>
</template>

<style scoped>
.connect {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100dvh;
  padding: var(--space-8) var(--space-4) var(--space-6);
  padding-top: calc(env(safe-area-inset-top) + var(--space-8));
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--space-6));
}

.connect__brand {
  margin-top: 8vh;
  color: var(--text-primary);
}

.connect__mark {
  margin-bottom: var(--space-6);
}

h1 {
  font-size: 30px;
  line-height: 1.15;
  max-width: 14ch;
}

.connect__body {
  margin-top: var(--space-3);
  max-width: 34ch;
  color: var(--text-body);
}

.connect__disclosure {
  margin-bottom: var(--space-4);
  color: var(--text-muted);
  font-size: 12.5px;
  line-height: 1.5;
}

.connect__note {
  margin-top: var(--space-4);
  color: var(--text-muted);
  font-size: 13px;
}

.connect__note--error {
  color: var(--danger);
}

.connect__note--block {
  padding: var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-body);
}

.connect__note--block strong {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.connect__note--block ol {
  margin-top: var(--space-3);
  padding-left: var(--space-5);
  list-style: decimal;
  color: var(--text-muted);
}

.connect__note--block li + li {
  margin-top: var(--space-1);
}
</style>
