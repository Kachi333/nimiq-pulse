<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { api } from '../../api/endpoints'
import { ApiError } from '../../api/client'
import { invalidate } from '../../cache/store'
import { useWallet } from '../../wallet/useWallet'
import PulseCard from '../../ui/PulseCard.vue'
import PulseButton from '../../ui/PulseButton.vue'
import PulseBanner from '../../ui/PulseBanner.vue'
import ScreenHeader from '../../ui/ScreenHeader.vue'
import { t } from '../../i18n/en'

const { address } = useWallet()

const form = reactive({ name: '', address: '', url: '', description: '', category: 'utility' })
const submitting = ref(false)
const submitted = ref(false)
const error = ref<string | null>(null)

const CATEGORIES = ['utility', 'social', 'games', 'finance', 'shopping', 'other']

/** Validated as typed, not on submit. */
const addressLooksValid = computed(() => {
  const v = form.address.replace(/\s/g, '').toUpperCase()
  return v.length === 0 || /^NQ[0-9A-Z]{34}$/.test(v)
})

const complete = computed(
  () =>
    form.name.trim() &&
    form.address.trim() &&
    form.url.trim() &&
    form.description.trim() &&
    addressLooksValid.value,
)

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await api.submitApp({ ...form })
    invalidate(`discover:${address.value}`)
    submitted.value = true
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Couldn’t submit right now.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="screen">
    <ScreenHeader :title="t.submit.title" back />

    <PulseCard v-if="submitted" class="done">
      <p>{{ t.submit.confirmation }}</p>
      <RouterLink to="/discover" class="plain">
        <PulseButton block>{{ t.submit.back }}</PulseButton>
      </RouterLink>
    </PulseCard>

    <template v-else>
      <PulseBanner v-if="error" kind="error" :message="error" class="mb" />

      <PulseCard class="form">
        <label>
          <span>{{ t.submit.name }}</span>
          <input v-model="form.name" type="text" maxlength="60" />
        </label>

        <label>
          <span>{{ t.submit.address }}</span>
          <input v-model="form.address" class="mono" type="text" placeholder="NQ.. .. .." />
          <p v-if="!addressLooksValid" class="err">{{ t.submit.badAddress }}</p>
        </label>

        <label>
          <span>{{ t.submit.url }}</span>
          <input v-model="form.url" type="url" placeholder="https://" inputmode="url" />
        </label>

        <label>
          <span>{{ t.submit.description }}</span>
          <input v-model="form.description" type="text" maxlength="100" />
        </label>

        <label>
          <span>{{ t.submit.category }}</span>
          <select v-model="form.category">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <PulseButton block :disabled="!complete || submitting" @click="submit">
          {{ submitting ? t.submit.submitting : t.submit.submit }}
        </PulseButton>
      </PulseCard>
    </template>
  </div>
</template>

<style scoped>
.mb { margin-bottom: var(--space-3); }
.plain { text-decoration: none; display: block; margin-top: var(--space-4); }

.form { display: grid; gap: var(--space-4); }

label { display: grid; gap: var(--space-2); }

label > span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

input,
select {
  width: 100%;
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-inset);
  color: var(--text-primary);
  /* 16px minimum: anything smaller makes iOS zoom on focus. */
  font-size: 16px;
  font-family: inherit;
}

.err { color: var(--danger); font-size: 12px; }

.done p { color: var(--text-body); }
</style>
