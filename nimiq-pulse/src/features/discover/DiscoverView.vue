<script setup lang="ts">
import { api } from '../../api/endpoints'
import type { Feed } from '../../api/types'
import { useCachedResource } from '../../cache/useCachedResource'
import { useWallet } from '../../wallet/useWallet'
import PulseCard from '../../ui/PulseCard.vue'
import PulseChip from '../../ui/PulseChip.vue'
import PulseBanner from '../../ui/PulseBanner.vue'
import PulseButton from '../../ui/PulseButton.vue'
import SkeletonBlock from '../../ui/SkeletonBlock.vue'
import ScreenHeader from '../../ui/ScreenHeader.vue'
import { t } from '../../i18n/en'

const { address } = useWallet()
const { data, error } = useCachedResource<Feed>(`discover:${address.value}`, api.discover)

function open(deeplink: string) {
  window.location.href = deeplink
}
</script>

<template>
  <div class="screen">
    <ScreenHeader :title="t.discover.title" />

    <PulseBanner v-if="error && data" kind="stale" :message="t.banner.stale" class="mb" />
    <PulseBanner v-else-if="error" kind="error" :message="error.message" class="mb" />

    <!-- A wallet with no matched history sees the starter set, never an empty list. -->
    <p v-if="data" class="lead">
      {{ data.isStarterSet ? t.discover.starterLabel : t.discover.forYou }}
    </p>

    <ul v-if="data" class="feed">
      <li v-for="item in data.items" :key="item.appId">
        <PulseCard class="app">
          <div class="app__head">
            <div class="app__id">
              <h2>{{ item.name }}</h2>
              <p class="app__desc">{{ item.description }}</p>
            </div>
          </div>

          <!-- A recommendation with a stated reason is trusted; one without reads as an ad. -->
          <PulseChip tone="discover">{{ t.discover.reason[item.reason] }}</PulseChip>

          <div class="app__stats">
            <span>{{ t.discover.payers(item.distinctPayers) }}</span>
            <span v-if="item.avgRating !== null" class="num">★ {{ item.avgRating }}</span>
            <span v-else-if="item.reviewCount > 0">{{ t.discover.reviewCount(item.reviewCount) }}</span>
            <span v-else>{{ t.discover.noReviews }}</span>
          </div>

          <div class="app__actions">
            <RouterLink :to="`/discover/app/${item.appId}`" class="app__more">Details</RouterLink>
            <PulseButton @click="open(item.deeplink)">{{ t.discover.open }}</PulseButton>
          </div>
        </PulseCard>
      </li>
    </ul>

    <ul v-else class="feed">
      <li v-for="n in 3" :key="n">
        <PulseCard class="app">
          <SkeletonBlock :height="20" width="60%" />
          <SkeletonBlock :height="14" width="90%" />
          <SkeletonBlock :height="14" width="40%" />
        </PulseCard>
      </li>
    </ul>

    <!-- The distribution mechanic: every user is a potential developer. -->
    <PulseCard class="submit">
      <h2>{{ t.discover.submitCta }}</h2>
      <p>{{ t.discover.submitBlurb }}</p>
      <RouterLink to="/discover/submit">
        <PulseButton variant="secondary" block>{{ t.discover.submitCta }}</PulseButton>
      </RouterLink>
    </PulseCard>
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: var(--space-3);
}

.lead {
  margin-bottom: var(--space-3);
  color: var(--text-muted);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
}

.feed {
  display: grid;
  gap: var(--space-3);
}

.app {
  display: grid;
  gap: var(--space-3);
  justify-items: start;
}

.app h2 {
  font-size: 17px;
}

.app__desc {
  margin-top: 3px;
  color: var(--text-body);
  font-size: 13.5px;
}

.app__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  color: var(--text-muted);
  font-size: 12px;
}

.app__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
}

.app__more {
  min-height: var(--tap-min);
  display: inline-flex;
  align-items: center;
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: none;
}

.submit {
  margin-top: var(--space-6);
  display: grid;
  gap: var(--space-3);
}

.submit h2 {
  font-size: 16px;
}

.submit p {
  color: var(--text-muted);
  font-size: 13px;
}

.submit a {
  text-decoration: none;
}
</style>
