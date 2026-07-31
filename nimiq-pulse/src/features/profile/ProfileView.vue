<script setup lang="ts">
import { computed } from 'vue'
import { api } from '../../api/endpoints'
import type { Profile } from '../../api/types'
import { useCachedResource } from '../../cache/useCachedResource'
import { useWallet } from '../../wallet/useWallet'
import PulseRing from '../../ui/PulseRing.vue'
import XpBar from '../../ui/XpBar.vue'
import PulseCard from '../../ui/PulseCard.vue'
import PulseBanner from '../../ui/PulseBanner.vue'
import PulseChip from '../../ui/PulseChip.vue'
import SkeletonBlock from '../../ui/SkeletonBlock.vue'
import ScreenHeader from '../../ui/ScreenHeader.vue'
import { int, nim, relativeTime, shortAddress } from '../../lib/format'
import { t } from '../../i18n/en'

const { address } = useWallet()
const { data, error } = useCachedResource<Profile>(
  `profile:${address.value}`,
  api.profile,
)

const progress = computed(() => {
  const p = data.value
  return p && p.xpForNextLevel > 0 ? p.xpIntoLevel / p.xpForNextLevel : 0
})

const unlocked = computed(() => data.value?.achievements.filter((a) => a.earned) ?? [])
const locked = computed(() => data.value?.achievements.filter((a) => !a.earned) ?? [])
</script>

<template>
  <div class="screen">
    <ScreenHeader :title="t.profile.title" />

    <PulseBanner
      v-if="error && data"
      kind="stale"
      :message="t.banner.stale"
      class="mb"
    />
    <PulseBanner v-else-if="error" kind="error" :message="error.message" class="mb" />

    <!-- Identity card: visible without scrolling at 375px (AC2.5) -->
    <PulseCard earned class="identity">
      <template v-if="data">
        <PulseRing
          :level="data.level"
          :progress="progress"
          :waveform="data.waveform"
          :size="112"
        />
        <div class="identity__meta">
          <p class="identity__level">{{ t.profile.level(data.level) }}</p>
          <p class="identity__addr mono">{{ shortAddress(data.address) }}</p>
          <PulseChip :tone="data.streakDays > 0 ? 'discover' : 'neutral'">
            {{ data.streakDays > 0 ? t.profile.streak(data.streakDays) : t.profile.noStreak }}
          </PulseChip>
        </div>
      </template>
      <template v-else>
        <SkeletonBlock :height="112" width="112px" radius="var(--radius-full)" />
        <div class="identity__meta">
          <SkeletonBlock :height="22" width="96px" />
          <SkeletonBlock :height="14" width="140px" />
        </div>
      </template>
    </PulseCard>

    <div v-if="data" class="xpwrap">
      <XpBar :into="data.xpIntoLevel" :for-next="data.xpForNextLevel" />
    </div>

    <h2 class="section">{{ t.profile.achievements }}</h2>
    <ul class="grid">
      <li v-for="a in unlocked" :key="a.code">
        <PulseCard earned class="ach">
          <span class="ach__dot ach__dot--on" />
          <p class="ach__name">{{ a.name }}</p>
          <p class="ach__meta">{{ a.earnedAt ? relativeTime(a.earnedAt) : '' }}</p>
        </PulseCard>
      </li>
      <!-- Locked tiles state their condition. Hiding it would be a dark pattern. -->
      <li v-for="a in locked" :key="a.code">
        <PulseCard class="ach ach--locked">
          <span class="ach__dot" />
          <p class="ach__name">{{ a.name }}</p>
          <p class="ach__meta">{{ a.condition }}</p>
        </PulseCard>
      </li>
    </ul>

    <h2 class="section">{{ t.profile.activity }}</h2>
    <PulseCard v-if="data && data.activity.length === 0" class="empty">
      <p>{{ t.profile.activityEmpty }}</p>
    </PulseCard>
    <ul v-else class="activity">
      <li v-for="item in data?.activity ?? []" :key="item.txHash">
        <PulseCard class="act">
          <div class="act__main">
            <p class="act__app">{{ item.appName }}</p>
            <p class="act__time">{{ relativeTime(item.timestamp) }}</p>
          </div>
          <div class="act__right">
            <p class="act__value mono">{{ nim(item.valueLuna) }}</p>
            <p class="act__block mono">#{{ int(item.blockHeight) }}</p>
          </div>
        </PulseCard>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.mb {
  margin-bottom: var(--space-3);
}

.identity {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.identity__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-start;
  min-width: 0;
}

.identity__level {
  color: var(--text-primary);
  font-size: 21px;
  font-weight: 800;
}

.identity__addr {
  color: var(--text-muted);
  font-size: 12px;
}

.xpwrap {
  margin-top: var(--space-4);
}

.section {
  margin: var(--space-6) 0 var(--space-3);
  font-size: 13px;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: var(--space-3);
}

.ach {
  height: 100%;
  padding: var(--space-3);
}

.ach--locked {
  opacity: 0.72;
}

.ach__dot {
  display: block;
  width: 10px;
  height: 10px;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-full);
  background: var(--text-disabled);
}

.ach__dot--on {
  background: var(--gradient-progress);
}

.ach__name {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.ach__meta {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.35;
}

.activity {
  display: grid;
  gap: var(--space-2);
}

.act {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.act__app {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.act__time,
.act__block {
  color: var(--text-muted);
  font-size: 11px;
}

.act__right {
  text-align: right;
}

.act__value {
  color: var(--verified);
  font-size: 13px;
  font-weight: 700;
}

.empty p {
  color: var(--text-muted);
  font-size: 13px;
}
</style>
