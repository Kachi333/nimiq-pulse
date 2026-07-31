<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../api/endpoints'
import { ApiError } from '../../api/client'
import { invalidate } from '../../cache/store'
import { useWallet } from '../../wallet/useWallet'
import PulseCard from '../../ui/PulseCard.vue'
import PulseButton from '../../ui/PulseButton.vue'
import PulseBanner from '../../ui/PulseBanner.vue'
import ScreenHeader from '../../ui/ScreenHeader.vue'
import { t } from '../../i18n/en'

const route = useRoute()
const router = useRouter()
const { address } = useWallet()
const appId = route.params.appId as string

const appName = ref('')
const eligible = ref<boolean | null>(null)
const rating = ref(0)
const body = ref('')
const publishing = ref(false)
const error = ref<string | null>(null)

const remaining = computed(() => 280 - body.value.length)

onMounted(async () => {
  try {
    const detail = await api.app(appId)
    appName.value = detail.name
    eligible.value = detail.canReview
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong.'
    eligible.value = false
  }
})

async function publish() {
  publishing.value = true
  error.value = null
  try {
    await api.publishReview(appId, rating.value, body.value.trim() || undefined)
    invalidate(`reviews:${address.value}`)
    invalidate(`profile:${address.value}`)
    router.replace('/reviews')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Couldn’t publish right now.'
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="screen">
    <ScreenHeader :title="appName || t.reviews.write" back />

    <PulseBanner v-if="error" kind="error" :message="error" class="mb" />

    <!-- Blocked state includes the way forward, never just a locked door. -->
    <PulseCard v-if="eligible === false" class="gate">
      <p>{{ t.reviews.gate }}</p>
      <RouterLink :to="`/discover/app/${appId}`" class="plain">
        <PulseButton variant="secondary" block>{{ t.discover.open }}</PulseButton>
      </RouterLink>
    </PulseCard>

    <PulseCard v-else-if="eligible" class="form">
      <div class="stars" role="radiogroup" aria-label="Rating">
        <button
          v-for="n in 5"
          :key="n"
          class="star"
          :class="{ 'star--on': n <= rating }"
          role="radio"
          :aria-checked="n === rating"
          :aria-label="`${n} star${n === 1 ? '' : 's'}`"
          @click="rating = n"
        >
          ★
        </button>
      </div>

      <label>
        <textarea
          v-model="body"
          maxlength="280"
          rows="4"
          :placeholder="t.reviews.placeholder"
        />
        <p class="count num">{{ t.reviews.remaining(remaining) }}</p>
      </label>

      <PulseButton block :disabled="rating === 0 || publishing" @click="publish">
        {{ publishing ? t.reviews.publishing : t.reviews.publish }}
      </PulseButton>
    </PulseCard>
  </div>
</template>

<style scoped>
.mb { margin-bottom: var(--space-3); }
.plain { text-decoration: none; display: block; margin-top: var(--space-3); }

.form { display: grid; gap: var(--space-4); }
.gate p { color: var(--text-muted); font-size: 13px; }

.stars { display: flex; gap: var(--space-1); }

.star {
  width: var(--tap-min);
  height: var(--tap-min);
  border: 0;
  background: transparent;
  color: var(--text-disabled);
  font-size: 30px;
  line-height: 1;
}

.star--on { color: var(--progress-to); }

textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-inset);
  color: var(--text-primary);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
}

.count { margin-top: var(--space-2); color: var(--text-muted); font-size: 12px; }
</style>
