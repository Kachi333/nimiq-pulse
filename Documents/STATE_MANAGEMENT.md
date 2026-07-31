# Nimiq Pulse — State Management

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Approach | Vue reactivity + composables. No Pinia, no Vuex. |
| Related | [FRONTEND.md](FRONTEND.md) · [ERROR_HANDLING.md](ERROR_HANDLING.md) |

---

## 1. Why no store library

Pulse has very little client state, because **the server owns the truth**. XP, levels, quest completion, review eligibility, and feed rank are all computed server-side from indexed chain data ([software_architecture.md](software_architecture.md) A1). The client renders what it is told; it never derives a reward.

What remains is: a session, some cached server responses, and transient UI state. Three composables cover it. A store library here would add a bundle cost and an indirection layer for state that has no cross-cutting mutations.

**Revisit if** two features ever need to write to the same client-owned entity. That does not happen in the MVP.

---

## 2. The four kinds of state

| Kind | Owner | Lives | Survives reload |
| --- | --- | --- | --- |
| **Server state** | Backend | `cache/store.ts` + composables | Yes, as cache |
| **Session** | Backend, held client-side | `wallet/session.ts` | Yes, `localStorage` |
| **UI state** | Component | `ref` in `setup()` | No |
| **Ephemeral wallet state** | `provider.ts` | Module scope | No |

The most common design error would be treating server state as client state — optimistically writing XP locally, for example. Don't. The rule: **if the server computes it, the client caches it and never edits it.**

---

## 3. `useCachedResource` — the core primitive

Every server read goes through one stale-while-revalidate composable.

```ts
export function useCachedResource<T>(key: string, fetcher: () => Promise<T>, ttlMs = 5 * 60_000) {
  const cached = cacheRead<T>(key)                     // synchronous — paints immediately
  const data = ref<T | null>(cached?.data ?? null)
  const isStale = ref(cached ? Date.now() - cached.fetchedAt > ttlMs : false)
  const isRefreshing = ref(false)
  const error = ref<AppError | null>(null)

  async function refresh() {
    isRefreshing.value = true
    try {
      const fresh = await fetcher()
      data.value = fresh
      cacheWrite(key, fresh)
      isStale.value = false
      error.value = null
    } catch (e) {
      error.value = toAppError(e)                      // cached data is NOT cleared
    } finally {
      isRefreshing.value = false
    }
  }

  onMounted(refresh)
  return { data, isStale, isRefreshing, error, refresh }
}
```

Three properties matter, and each maps to a product requirement:

1. **The cache read is synchronous**, so the first paint has content. This is what makes "instant" true (PRD AC1.3).
2. **A failed refresh never clears `data`**, so a network error degrades to staleness rather than emptiness (PRD AC1.4).
3. **`error` and `data` coexist**, so the view can show content *and* a banner at once.

### 3.1 Cache keys and TTLs

| Key | TTL | Notes |
| --- | --- | --- |
| `profile:<address>` | 5 min | Address-scoped so wallet switches don't collide |
| `discover:<address>` | 5 min | Rank is per-wallet |
| `quests:<address>:<utcDate>` | 2 min | Date-scoped; rolls over at 00:00 UTC automatically |
| `app:<id>` | 15 min | Detail changes rarely |
| `reviews:<appId>` | 5 min | |
| `registry` | 60 min | Public, wallet-independent |

Keys are address-scoped by construction. Clearing on logout is then a prefix sweep, and a stale profile from a previous wallet can never render.

---

## 4. Session

```ts
// wallet/session.ts
interface Session { token: string; address: string; expiresAt: number }
```

Stored in `localStorage` under `pulse:session`. Restored synchronously at boot so the router knows immediately whether to show Connect or Profile — no auth flicker.

| Transition | Trigger | Effect |
| --- | --- | --- |
| none → active | `POST /auth/verify` succeeds | Persist session, prefetch profile |
| active → expired | 401, or `expiresAt` passed | Clear token, keep cache, show inline "Reconnect" |
| active → none | Explicit disconnect | Clear session **and** all `pulse:*` cache keys |

**On expiry the app never raises an approval dialog by itself.** It shows a Reconnect button and waits for a tap. An unprompted dialog on open is the single most trust-destroying thing this app could do ([DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) P5).

Cache is deliberately kept on expiry: the user still sees their profile while reconnecting, which keeps P3 (never a dead end) true during the one moment it would be easiest to break.

---

## 5. Provider state

Held at module scope in `provider.ts`, never in a component:

```ts
let provider: NimiqProvider | null = null      // memoised init()
let approvalInFlight: Promise<unknown> | null  // the approval mutex
```

Exposed to the UI as read-only reactive flags:

```ts
export const providerState = readonly(reactive({
  status: 'idle' as 'idle' | 'connecting' | 'ready' | 'unavailable',
  consensus: null as boolean | null,
  blockNumber: null as number | null,
}))
```

Components read these to disable payment actions while consensus is not established. They cannot mutate them — the mutex only works if there is exactly one owner.

---

## 6. Quest confirmation — the one piece of real client state machinery

A tip payment is broadcast, but XP only lands once the indexer confirms. That gap needs client-side tracking.

```ts
type QuestUiState = 'available' | 'awaiting-approval' | 'confirming' | 'completed' | 'unconfirmed'
```

```ts
const pending = ref<{ questId: string; txHash: string; startedAt: number } | null>(null)
```

- `pending` is persisted to `localStorage`, so backgrounding the app or leaving for another Mini App does not lose the confirmation.
- While `pending` is set, `useQuests` polls `/quests/today` with backoff: 2 s → 4 s → 8 s → 16 s → 30 s cap.
- Polling stops on unmount, on completion, and after 5 minutes (→ `unconfirmed`).
- On completion, `pending` clears and newly unlocked achievements are surfaced once.

**The client never marks a quest complete.** It only asks whether the server has. A forged local state changes nothing, which is exactly the point.

---

## 7. Cross-feature communication

Features never import each other. They coordinate through two channels:

1. **Session state** — `useWallet()` is the shared reactive source for address and auth.
2. **Cache invalidation by key** — after a review publishes, `useReviews` invalidates `profile:<address>`; the Profile tab refreshes from cache-miss on next mount. No event bus, no direct call.

```ts
// after a successful write
invalidate(`profile:${address}`)
invalidate(`quests:${address}:${utcDate()}`)
```

An event bus was considered and rejected: it creates invisible coupling that breaks the "features are independently deletable" property.

---

## 8. Achievement presentation

Newly unlocked achievements arrive inside a profile or quest response. To present each exactly once (PRD AC2.3):

```ts
// localStorage: pulse:seen-achievements:<address> → string[]
const unseen = response.achievements.filter(a => !seen.includes(a.code))
```

Server-authoritative, client-remembered. Reinstalling shows them again — an acceptable trade for not adding a server-side "seen" table.

---

## 9. Rules

1. Server-computed values are cached, never edited client-side.
2. A failed refresh never clears cached data.
3. Cache keys are address-scoped.
4. UI state stays in the component unless a second component needs it.
5. Only `cache/store.ts` touches `localStorage`.
6. Session restores synchronously at boot — no auth flicker.
7. No approval dialog is raised by a state transition, only by a tap.
8. Polling always has a stop condition and a maximum duration.
