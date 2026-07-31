<script setup lang="ts">
import { api } from '../../api/endpoints'
import type { ReviewsOverview } from '../../api/types'
import { useCachedResource } from '../../cache/useCachedResource'
import { useWallet } from '../../wallet/useWallet'
import PulseCard from '../../ui/PulseCard.vue'
import PulseButton from '../../ui/PulseButton.vue'
import PulseBanner from '../../ui/PulseBanner.vue'
import ScreenHeader from '../../ui/ScreenHeader.vue'
import { t } from '../../i18n/en'

const { address } = useWallet()
const { data, error } = useCachedResource<ReviewsOverview>(
  `reviews:${address.value}`,
  api.reviewsOverview,
)
</script>

<template>
  <div class="screen">
    <ScreenHeader :title="t.reviews.title" />

    <PulseBanner v-if="error && data" kind="stale" :message="t.banner.stale" class="mb" />
    <PulseBanner v-else-if="error" kind="error" :message="error.message" class="mb" />

    <!-- Action surface first: what you can do beats what you've done. -->
    <h2 class="section">{{ t.reviews.canReview }}</h2>

    <PulseCard v-if="data && data.canReview.length === 0" class="empty">
      <p>{{ t.reviews.emptyCanReview }}</p>
      <RouterLink to="/discover" class="plain">
        <PulseButton variant="secondary" block>{{ t.reviews.goDiscover }}</PulseButton>
      </RouterLink>
    </PulseCard>

    <ul v-else class="list">
      <li v-for="item in data?.canReview ?? []" :key="item.appId">
        <PulseCard class="row">
          <p class="row__name">{{ item.name }}</p>
          <RouterLink :to="`/reviews/compose/${item.appId}`" class="plain">
            <PulseButton>{{ t.reviews.write }}</PulseButton>
          </RouterLink>
        </PulseCard>
      </li>
    </ul>

    <h2 class="section">{{ t.reviews.mine }}</h2>

    <PulseCard v-if="data && data.mine.length === 0" class="empty">
      <p>{{ t.reviews.emptyMine }}</p>
    </PulseCard>

    <ul v-else class="list">
      <li v-for="item in data?.mine ?? []" :key="item.id">
        <PulseCard earned class="mine">
          <div class="mine__top">
            <p class="row__name">{{ item.name }}</p>
            <span class="num stars">{{ '★'.repeat(item.rating) }}</span>
          </div>
          <p v-if="item.body" class="mine__body">{{ item.body }}</p>
          <RouterLink :to="`/reviews/compose/${item.appId}`" class="plain">
            <PulseButton variant="ghost">{{ t.reviews.edit }}</PulseButton>
          </RouterLink>
        </PulseCard>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.mb { margin-bottom: var(--space-3); }
.plain { text-decoration: none; display: block; }

.section {
  margin: var(--space-5) 0 var(--space-3);
  font-size: 13px;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.list { display: grid; gap: var(--space-2); }

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.row__name { color: var(--text-primary); font-weight: 700; font-size: 15px; }

.mine { display: grid; gap: var(--space-2); justify-items: start; }
.mine__top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); width: 100%; }
.mine__body { color: var(--text-body); font-size: 14px; }
.stars { color: var(--progress-to); letter-spacing: 2px; }

.empty p { color: var(--text-muted); font-size: 13px; margin-bottom: var(--space-3); }
</style>
