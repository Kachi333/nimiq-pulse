<script setup lang="ts">
import { computed } from 'vue'

/**
 * The signature element (DESIGN_PRINCIPLES.md §4).
 *
 * A level ring whose interior carries a waveform generated from this wallet's
 * own last 30 days of indexed activity. Real data, so no two wallets look
 * alike — which is what makes the identity card personal rather than generic.
 */
const props = withDefaults(
  defineProps<{
    level: number
    progress: number // 0..1 through the current level
    waveform?: number[]
    size?: number
  }>(),
  { size: 120, waveform: () => [] },
)

const stroke = computed(() => (props.size >= 80 ? 6 : 3))
const radius = computed(() => props.size / 2 - stroke.value / 2 - 1)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dash = computed(() => circumference.value * Math.max(0, Math.min(1, props.progress)))

/** Below 40px the trace reads as noise, so it is dropped entirely. */
const showWave = computed(() => props.size >= 40)

const wavePath = computed(() => {
  const w = props.waveform
  const inner = radius.value * 1.28 // chord width across the ring interior
  const x0 = props.size / 2 - inner / 2
  const y0 = props.size / 2
  const amp = radius.value * 0.42

  if (!w.length) return `M${x0} ${y0} H${x0 + inner}`

  const max = Math.max(...w, 1)
  const step = inner / Math.max(1, w.length - 1)
  return w
    .map((value, i) => {
      const x = x0 + i * step
      const y = y0 - (value / max) * amp
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <div class="ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size" aria-hidden="true">
      <defs>
        <linearGradient :id="`grad-${size}`" x1="0" y1="0" :x2="size" :y2="size" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="var(--progress-from)" />
          <stop offset="1" stop-color="var(--progress-to)" />
        </linearGradient>
      </defs>

      <circle
        :cx="size / 2" :cy="size / 2" :r="radius"
        fill="none" stroke="var(--border-subtle)" :stroke-width="stroke"
      />
      <circle
        class="ring__progress"
        :cx="size / 2" :cy="size / 2" :r="radius"
        fill="none" :stroke="`url(#grad-${size})`" :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="`${dash} ${circumference}`"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
      <path
        v-if="showWave"
        :d="wavePath"
        fill="none" stroke="var(--verified)" stroke-width="2"
        stroke-linejoin="round" stroke-linecap="round" opacity="0.9"
      />
    </svg>

    <div class="ring__label">
      <span class="sr-only">Level </span>
      <span class="ring__level num" :style="{ fontSize: `${Math.round(size * 0.26)}px` }">{{ level }}</span>
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  flex: none;
}

.ring__progress {
  transition: stroke-dasharray var(--motion-celebrate) cubic-bezier(0.22, 1, 0.36, 1);
}

.ring__label {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  pointer-events: none;
}

.ring__level {
  color: var(--text-primary);
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>
