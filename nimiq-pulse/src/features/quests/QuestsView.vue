<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { api } from '../../api/endpoints'
import type { Quest, QuestsToday } from '../../api/types'
import { useCachedResource } from '../../cache/useCachedResource'
import { useWallet } from '../../wallet/useWallet'
import { ProviderError, providerState, sendPayment } from '../../provider'
import { invalidate } from '../../cache/store'
import PulseCard from '../../ui/PulseCard.vue'
import PulseButton from '../../ui/PulseButton.vue'
import PulseChip from '../../ui/PulseChip.vue'
import PulseBanner from '../../ui/PulseBanner.vue'
import ScreenHeader from '../../ui/ScreenHeader.vue'
import TipJarSheet from './TipJarSheet.vue'
import { t } from '../../i18n/en'

const { address } = useWallet()
const utcDate = new Date().toISOString().slice(0, 10)
const { data, refresh, error } = useCachedResource<QuestsToday>(
  `quests:${address.value}:${utcDate}`,
  api.questsToday,
  2 * 60_000,
)

const sheetOpen = ref(false)
const activeQuest = ref<Quest | null>(null)
const notice = ref<{ kind: 'stale' | 'info' | 'error'; message: string } | null>(null)

let pollTimer: number | null = null
let pollDelay = 2000

function stopPolling() {
  if (pollTimer !== null) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  pollDelay = 2000
}

/** Backoff 2→4→8→16→30s, capped, always with a stop condition. */
function pollUntilConfirmed(startedAt = Date.now()) {
  stopPolling()
  pollTimer = window.setTimeout(async () => {
    await refresh()
    const stillPending = data.value?.quests.some((q) => q.state === 'confirming')
    if (!stillPending) return stopPolling()
    if (Date.now() - startedAt > 5 * 60_000) {
      notice.value = { kind: 'error', message: t.quests.unconfirmed }
      return stopPolling()
    }
    pollDelay = Math.min(pollDelay * 2, 30_000)
    pollUntilConfirmed(startedAt)
  }, pollDelay)
}

onUnmounted(stopPolling)

function onQuestAction(quest: Quest) {
  notice.value = null
  if (quest.type === 'TIP_JAR') {
    activeQuest.value = quest
    sheetOpen.value = true
    return
  }
  void claim(quest, undefined)
}

async function claim(quest: Quest, txHash?: string) {
  try {
    const result = await api.claimQuest(quest.id, txHash)
    invalidate(`profile:${address.value}`)
    await refresh()
    if (result.state === 'CONFIRMING') pollUntilConfirmed()
  } catch (e) {
    notice.value = { kind: 'error', message: e instanceof Error ? e.message : 'Something went wrong.' }
  }
}

/** One approval dialog, raised only by the sheet's confirm tap. */
async function onSendTip(amountLuna: number) {
  const quest = activeQuest.value
  if (!quest?.payTo) return
  try {
    const txHash = await sendPayment(quest.payTo, amountLuna)
    sheetOpen.value = false
    await claim(quest, txHash)
  } catch (e) {
    sheetOpen.value = false
    // A declined dialog is a decision, not an error — calm copy, quest stays open.
    notice.value =
      e instanceof ProviderError && e.kind !== 'provider-unavailable'
        ? { kind: 'stale', message: t.quests.cancelled }
        : { kind: 'error', message: e instanceof Error ? e.message : 'Something went wrong.' }
  }
}
</script>

<template>
  <div class="screen">
    <ScreenHeader :title="t.quests.title" />

    <PulseBanner v-if="notice" :kind="notice.kind" :message="notice.message" class="mb" />
    <PulseBanner v-else-if="error && data" kind="stale" :message="t.banner.stale" class="mb" />

    <ul class="list">
      <li v-for="quest in data?.quests ?? []" :key="quest.id">
        <PulseCard :earned="quest.state === 'completed'" class="quest">
          <div class="quest__main">
            <p class="quest__title">{{ quest.title }}</p>
            <p class="quest__desc">{{ quest.description }}</p>
          </div>

          <div class="quest__right">
            <PulseChip v-if="quest.state === 'completed'" tone="verified">
              {{ t.quests.reward(quest.xpReward) }}
            </PulseChip>
            <PulseChip v-else-if="quest.state === 'confirming'" tone="pending">
              {{ t.quests.confirming }}
            </PulseChip>
            <PulseButton
              v-else
              :disabled="quest.type === 'TIP_JAR' && providerState.consensus === false"
              :hint="quest.type === 'TIP_JAR' && providerState.consensus === false ? t.quests.noConsensus : undefined"
              @click="onQuestAction(quest)"
            >
              {{ quest.type === 'TIP_JAR' ? t.quests.sendTip : t.quests.open }}
            </PulseButton>
          </div>
        </PulseCard>
      </li>
    </ul>

    <TipJarSheet v-if="sheetOpen" @confirm="onSendTip" @cancel="sheetOpen = false" />
  </div>
</template>

<style scoped>
.mb { margin-bottom: var(--space-3); }
.list { display: grid; gap: var(--space-3); }

.quest {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.quest__title { color: var(--text-primary); font-size: 15px; font-weight: 700; }
.quest__desc { margin-top: 2px; color: var(--text-muted); font-size: 12.5px; }
.quest__right { flex: none; }
</style>
