# Nimiq Pulse — Folder Structure

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Related | [FRONTEND.md](FRONTEND.md) · [CODING_STANDARDS.md](CODING_STANDARDS.md) · [software_architecture.md](software_architecture.md) §6 |

---

## 1. Repository

```
NIMICH PULSE 2/
├── .mcp.json                    # Nimiq Developer Center MCP server
├── Documents/                   # all specification documents
└── nimiq-pulse/                 # the Mini App
```

The backend (API, indexer, database) is a separate deployable. It may live in `pulse-api/` alongside, or in its own repository — the client only ever knows a base URL.

---

## 2. Mini App

```
nimiq-pulse/
├── .agents/skills/mini-apps/    # installed Nimiq skill (reference, not code)
├── public/
│   ├── favicon.svg
│   ├── logo-mark.svg
│   └── logo-horizontal.svg
├── index.html
├── vite.config.ts               # port 5173, host true — required for phone testing
├── tsconfig.json
└── src/
    ├── main.ts
    ├── App.vue                  # shell: router view, tab bar, banner slot
    │
    ├── provider.ts              # ⚠ ONLY file that imports @nimiq/mini-app-sdk
    │
    ├── api/
    │   ├── client.ts            # ⚠ ONLY file that calls fetch
    │   ├── endpoints.ts         # one typed function per route
    │   └── types.ts             # response contracts, mirrors TDD §7
    │
    ├── cache/
    │   └── store.ts             # ⚠ ONLY file that writes to localStorage
    │
    ├── wallet/
    │   ├── session.ts           # login, token, expiry
    │   └── useWallet.ts         # reactive session state
    │
    ├── features/
    │   ├── connect/
    │   │   ├── ConnectView.vue
    │   │   └── NotInPayView.vue
    │   ├── profile/
    │   │   ├── ProfileView.vue
    │   │   ├── PulseRing.vue         # the signature component
    │   │   ├── IdentityCard.vue
    │   │   ├── AchievementGrid.vue
    │   │   ├── AchievementDetailView.vue
    │   │   └── useProfile.ts
    │   ├── discover/
    │   │   ├── DiscoverView.vue
    │   │   ├── AppCard.vue
    │   │   ├── AppDetailView.vue
    │   │   ├── SubmitAppView.vue
    │   │   └── useDiscover.ts
    │   ├── quests/
    │   │   ├── QuestsView.vue
    │   │   ├── QuestRow.vue
    │   │   ├── TipJarSheet.vue
    │   │   └── useQuests.ts
    │   └── reviews/
    │       ├── ReviewsView.vue
    │       ├── ReviewComposerView.vue
    │       ├── ReviewCard.vue
    │       └── useReviews.ts
    │
    ├── ui/                      # presentational only, no app imports
    │   ├── PulseButton.vue
    │   ├── PulseCard.vue
    │   ├── PulseBanner.vue
    │   ├── PulseChip.vue
    │   ├── XpBar.vue
    │   ├── VerifiedBadge.vue
    │   ├── SkeletonBlock.vue
    │   ├── TabBar.vue
    │   └── icons/               # inline SVG components
    │
    ├── lib/
    │   ├── format.ts            # nim(), luna(), address(), relativeTime()
    │   ├── id.ts                # randomUUID with getRandomValues fallback
    │   └── level.ts             # XP → level curve (pure, heavily tested)
    │
    ├── i18n/
    │   └── en.ts                # every user-facing string
    │
    ├── router/
    │   └── index.ts
    │
    └── styles/
        ├── tokens.css           # the design system token block
        ├── reset.css
        └── base.css             # safe areas, typography defaults
```

---

## 3. The three chokepoints

Three files are marked ⚠ because each is the **single** permitted route to a capability. This is what makes the architecture's guarantees enforceable rather than aspirational.

| File | Sole authority over | Guarantees it enforces |
| --- | --- | --- |
| `provider.ts` | `@nimiq/mini-app-sdk` | `ErrorResponse` → thrown error; approval dialogs serialised; SDK swappable in one place |
| `api/client.ts` | `fetch` | Auth header, timeout, retry, uniform error mapping |
| `cache/store.ts` | `localStorage` | One TTL and eviction policy; one place to reason about staleness |

Bypassing any of them silently removes the guarantee. All three are lint-enforced ([CODING_STANDARDS.md](CODING_STANDARDS.md) §6).

---

## 4. Layers and direction

Dependencies point **downward only**.

```
App.vue
   ↓
features/          ← never imports another feature
   ↓
wallet/ · api/ · cache/     ← platform
   ↓
provider.ts · lib/ · i18n/
   ↓
@nimiq/mini-app-sdk

ui/  ← imported by features and App; imports nothing but lib/ and styles
```

| Rule | Consequence if broken |
| --- | --- |
| `features/` never imports `features/` | Tabs stop being independently reviewable; deleting one breaks another |
| `ui/` imports nothing from `features/`, `api/`, `wallet/` | Primitives can't be tested without mounting the app |
| `lib/` imports nothing from the app | Pure functions become untestable |
| Only `provider.ts` imports the SDK | Denial-handling and dialog serialisation are silently lost |

Cross-feature communication goes through `wallet/` reactive state or the API — never a direct import.

---

## 5. Conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Views (routed) | `PascalCase` + `View` | `DiscoverView.vue` |
| Components | `PascalCase` | `AppCard.vue` |
| Shared UI | `Pulse` prefix | `PulseButton.vue` |
| Composables | `use` + camelCase | `useDiscover.ts` |
| Plain modules | camelCase | `format.ts` |
| Types | `PascalCase`, in `api/types.ts` or beside their owner | `FeedItem` |
| Constants | `SCREAMING_SNAKE` | `TIP_JAR_ADDRESS` |

A feature folder owns its views, its components, and its composable. Anything a second feature needs moves to `ui/` or `lib/` — it does not get imported across the boundary.

---

## 6. Where things go

| Adding… | Goes in |
| --- | --- |
| A new screen | `features/<feature>/`, plus a route |
| A component used by 2+ features | `ui/` |
| A pure helper | `lib/` |
| A new API route | `api/endpoints.ts` + a type in `api/types.ts` |
| A user-facing string | `i18n/en.ts` — always |
| A design token | `styles/tokens.css` — never a hard-coded value in a component |
| A new wallet capability | `provider.ts`, wrapped appropriately |
