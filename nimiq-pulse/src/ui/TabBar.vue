<script setup lang="ts">
import { t } from '../i18n/en'

/**
 * Labels are always visible. Icon-only navigation fails "can a new user figure
 * it out without instructions?" — there is no universal glyph for "quests".
 */
const tabs = [
  { to: '/profile', label: t.tabs.profile, icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0' },
  { to: '/discover', label: t.tabs.discover, icon: 'M11 4a7 7 0 107 7 7 7 0 00-7-7zm5.5 12.5L21 21' },
  { to: '/quests', label: t.tabs.quests, icon: 'M4 6h16M4 12h16M4 18h10M18.5 17l1.6 1.6 3-3.2' },
  { to: '/reviews', label: t.tabs.reviews, icon: 'M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z' },
]
</script>

<template>
  <nav class="tabbar" aria-label="Main">
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path :d="tab.icon" fill="none" stroke="currentColor" stroke-width="1.9"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--surface-raised);
  border-top: 1px solid var(--border-subtle);
  /* Without the inset, controls sit under the home indicator. */
  padding-bottom: env(safe-area-inset-bottom);
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 60px;
  padding: var(--space-2) 0;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
}

.tab.router-link-active {
  color: var(--discover);
}
</style>
