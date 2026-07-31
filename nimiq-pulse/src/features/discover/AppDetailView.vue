<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../../api/endpoints'
import type { AppDetail, Review } from '../../api/types'
import PulseCard from '../../ui/PulseCard.vue'
import PulseButton from '../../ui/PulseButton.vue'
import PulseBanner from '../../ui/PulseBanner.vue'
import VerifiedBadge from '../../ui/VerifiedBadge.vue'
import ScreenHeader from '../../ui/ScreenHeader.vue'
import { relativeTime, shortAddress } from '../../lib/format'
import { t } from '../../i18n/en'

const route = useRoute()
const appId = route.params.id as string

const app = ref<AppDetail | null>(null)
const reviews = ref<Review[]>([])
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const [detail, list] = await Promise.all([api.app(appId), api.reviewsForApp(appId)])
    app.value = detail
    reviews.value = list.reviews
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong.'
  }
})

function openApp() {
  if (app.value) window.location.href = app.value.deeplink
}
</script>

<template>
  <div class="screen">
    <ScreenHeader :title="app?.name ?? ' '" back />

    <PulseBanner v-if="error" kind="error" :message="error" class="mb" />

    <template v-if="app">
      <PulseCard class="hero">
        <p class="hero__desc">{{ app.description }}</p>
        <p class="hero__addr mono">{{ shortAddress(app.address) }}</p>
        <div class="hero__stats">
          <span>{{ t.discover.payers(app.distinctPayers) }}</span>
          <span v-if="app.avgRating !== null" class="num">★ {{ app.avgRating }}</span>
          <span v-else>{{ t.discover.noReviews }}</span>
        </div>
        <PulseButton block @click="openApp">{{ t.discover.open }}</PulseButton>
      </PulseCard>

      <!-- The gate is a route forward, never a locked door. -->
      <PulseCard v-if="!app.canReview" class="gate">
        <p>{{ t.reviews.gate }}</p>
      </PulseCard>
      <RouterLink v-else :to="`/reviews/compose/${app.appId}`" class="plain">
        <PulseButton variant="secondary" block>{{ t.reviews.write }}</PulseButton>
      </RouterLink>

      <h2 class="section">{{ t.reviews.title }}</h2>
      <PulseCard v-if="reviews.length === 0" class="gate">
        <p>{{ t.discover.noReviews }}</p>
      </PulseCard>
      <ul v-else class="list">
        <li v-for="r in reviews" :key="r.id">
          <PulseCard class="rev">
            <div class="rev__top">
              <span class="num rev__stars">{{ '★'.repeat(r.rating) }}<span class="rev__dim">{{ '★'.repeat(5 - r.rating) }}</span></span>
              <VerifiedBadge />
            </div>
            <p v-if="r.body" class="rev__body">{{ r.body }}</p>
            <p class="rev__meta mono">{{ shortAddress(r.address) }} · {{ relativeTime(r.updatedAt) }}</p>
          </PulseCard>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.mb { margin-bottom: var(--space-3); }
.plain { text-decoration: none; display: block; margin-top: var(--space-3); }

.hero { display: grid; gap: var(--space-3); }
.hero__desc { color: var(--text-body); }
.hero__addr { color: var(--text-muted); font-size: 12px; }
.hero__stats { display: flex; gap: var(--space-4); color: var(--text-muted); font-size: 12px; }

.gate { margin-top: var(--space-3); }
.gate p { color: var(--text-muted); font-size: 13px; }

.section {
  margin: var(--space-6) 0 var(--space-3);
  font-size: 13px;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.list { display: grid; gap: var(--space-2); }
.rev { display: grid; gap: var(--space-2); }
.rev__top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.rev__stars { color: var(--progress-to); font-size: 14px; letter-spacing: 2px; }
.rev__dim { color: var(--text-disabled); }
.rev__body { color: var(--text-body); font-size: 14px; }
.rev__meta { color: var(--text-muted); font-size: 11px; }
</style>
