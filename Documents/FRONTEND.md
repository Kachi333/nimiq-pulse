# Nimiq Pulse — Frontend Guide

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Stack | Vue 3.5 · TypeScript · Vite 8 · `@nimiq/mini-app-sdk` 0.1.0 |
| Related | [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) · [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) · [CODING_STANDARDS.md](CODING_STANDARDS.md) |

---

## 1. Current state of the repo

Already in place at `nimiq-pulse/`:

- Vue 3 + TS scaffold, `vue-tsc` clean, production build passing
- `vite.config.ts` with `port: 5173, host: true` (required — the phone loads the app over LAN)
- `@nimiq/mini-app-sdk` installed
- `src/provider.ts` with `unwrap()`, `isErrorResponse()`, `message()`
- `src/App.vue` — a provider connection check, to be replaced by the shell
- Logo assets in `public/`

Still to add: fonts, design tokens, router, the four features, cache layer, API client.

---

## 2. Dependencies to add

```sh
npm i @fontsource-variable/mulish @fontsource/fira-mono vue-router
```

That is the whole list. Deliberately absent:

| Not installed | Why |
| --- | --- |
| `viem` / `ethers` | Nimiq provider only. No EVM in v1. |
| Pinia / Vuex | Three composables cover the state. See [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md). |
| A UI kit (Vuetify, PrimeVue…) | Ships desktop assumptions and megabytes; the design system is ~10 components. |
| An icon library | A handful of inline SVGs beats a font or a 200-icon package. |
| Tailwind | The token set is small and semantic; utility classes would obscure the "gold only on earned" rule. |

Bundle budget is 150 kB gzipped. Every addition is measured against it.

---

## 3. Bootstrap order

`src/main.ts` runs in this order, and the order matters:

1. Import fonts and `styles/` — tokens must exist before first paint.
2. Read `window.nimiqPay?.language` **synchronously**. It is injected before page scripts and is static for the session; reading it later is fine but reading it here keeps i18n setup in one place.
3. Create the router.
4. Mount. **Nothing wallet-related happens yet.**
5. The Connect screen calls `init()` only when the user taps Connect.

**`init()` is never called at module scope.** Provider initialisation on load, before any user intent, is how apps end up raising dialogs unprompted. The app must render and be readable before it touches the wallet.

---

## 4. The provider boundary

`src/provider.ts` is the **only** file permitted to import `@nimiq/mini-app-sdk`. It is enforced by lint rule (see [CODING_STANDARDS.md](CODING_STANDARDS.md) §6) because two whole bug classes depend on it.

```ts
import { getHostLanguage, init, requestDeviceIdentifier } from '@nimiq/mini-app-sdk'
import type { ErrorResponse, NimiqProvider } from '@nimiq/mini-app-sdk'

let provider: NimiqProvider | null = null
let approvalInFlight: Promise<unknown> | null = null

export async function connect(timeout = 10_000): Promise<NimiqProvider> {
  provider ??= await init({ timeout })
  return provider
}

export function isErrorResponse(v: unknown): v is ErrorResponse {
  return typeof v === 'object' && v !== null && 'error' in v
    && typeof (v as ErrorResponse).error?.message === 'string'
}

/** The SDK RESOLVES with ErrorResponse on failure and on user denial. Rethrow. */
export async function unwrap<T>(call: Promise<T | ErrorResponse>): Promise<T> {
  const result = await call
  if (isErrorResponse(result)) throw new ProviderError(result.error.message, result.error.type)
  return result as T
}

/** Serialises approval dialogs — the platform forbids concurrent ones. */
export async function withApproval<T>(fn: () => Promise<T>): Promise<T> {
  if (approvalInFlight) throw new ProviderError('Another confirmation is already open', 'BUSY')
  const run = fn()
  approvalInFlight = run
  try { return await run } finally { approvalInFlight = null }
}
```

Read-only calls (`isConsensusEstablished`, `getBlockNumber`) skip the mutex and may be batched:

```ts
const [consensus, height] = await Promise.all([
  p.isConsensusEstablished(),
  p.getBlockNumber(),
])
```

Approval-requiring calls always compose both wrappers:

```ts
const txHash = await withApproval(() => unwrap(p.sendBasicTransaction({
  recipient: TIP_JAR_ADDRESS,
  value: nimToLuna(amount),   // 1 NIM = 100 000 Luna
})))
```

---

## 5. Rendering rules

**Paint first, fetch second.** Every view reads cache synchronously in `setup()` and renders. The network request runs after mount and upgrades what is on screen.

```ts
const { data, isStale, isRefreshing, error } = useCachedResource('discover', fetchDiscover)
```

Four render states, all designed, none optional:

| State | Render |
| --- | --- |
| Cached (fresh or stale) | Content, plus a syncing pill while revalidating |
| No cache, loading | Skeleton matching the final layout's shape — not a spinner |
| No cache, error | Static starter content plus an explanation |
| Cached, refresh failed | Cached content plus the stale banner |

There is no state in which the user sees nothing.

---

## 6. Mobile and WebView

```css
body {
  padding:
    env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
  overscroll-behavior-y: none;   /* no rubber-band under the tab bar */
  -webkit-tap-highlight-color: transparent;
}
```

- `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">` — already set. `viewport-fit=cover` is what makes safe-area insets resolve to real values.
- The tab bar adds `env(safe-area-inset-bottom)` to its own height.
- Inputs use `font-size: 16px` minimum; below that iOS zooms on focus and the layout breaks.
- No `position: fixed` inputs — the WebView keyboard moves them unpredictably.
- No hover-dependent behaviour anywhere.

### 6.1 Secure context

LAN dev is plain HTTP, so `crypto.randomUUID()` may be unavailable **on the phone even though it works on desktop localhost**. All ID generation goes through `src/lib/id.ts` with a `crypto.getRandomValues()` fallback. Anything else requiring a secure context must be feature-detected before use.

---

## 7. Localisation

```ts
import { getHostLanguage } from '@nimiq/mini-app-sdk'   // via provider.ts
const lang = getHostLanguage() ?? 'en'
```

Use this, never `navigator.language` — the device locale can differ from the language the user chose in Nimiq Pay. The value is static for the session.

MVP ships English only, but all user-facing strings live in `src/i18n/en.ts` from day one so adding a locale is a file, not a refactor. Hard-coded strings in templates are a review failure.

---

## 8. Performance

| Budget | Target | How |
| --- | --- | --- |
| JS, gzipped | < 150 kB | No UI kit, no icon library, route-level code splitting |
| TTI, warm cache | < 1 s | Synchronous cache read, no blocking fetch |
| TTI, cold | < 3 s on 3G | Small bundle, self-hosted subset fonts |
| Fonts | < 60 kB | Variable Mulish, Latin subset only; Fira Mono 400 only |

- Route-level `defineAsyncComponent` for Discover, Quests, Reviews. Profile is in the initial chunk — it is the landing tab.
- `font-display: swap`, with the fallback metrics-matched to avoid layout shift.
- Images: app icons lazy-load with explicit `width`/`height` to reserve space.
- Long lists (activity, reviews) cap at 50 rows with "Show more" rather than virtualising — simpler, and the data sets are small.

---

## 9. Testing

| Layer | Tool | What |
| --- | --- | --- |
| Unit | Vitest | `unwrap()`, level curve, address truncation, cache TTL, `id()` fallback |
| Component | Vitest + Testing Library | Each component's five states render without a provider present |
| Manual, on device | Nimiq Pay | The full matrix in [TDD.md](TDD.md) §13.3 |

**`unwrap()` is the highest-value test in the suite.** Assert that a resolved `ErrorResponse` throws and that a success value passes through unchanged — the entire denial-handling path depends on that one function behaving correctly.

Desktop browsers cannot exercise the provider at all, so device testing is not optional. The app must also be *developable* on desktop: with no provider, the shell renders and every non-wallet surface stays inspectable.

---

## 10. Definition of done for a feature

- [ ] All five states rendered: populated, empty, loading, stale, error
- [ ] No SDK import outside `provider.ts`
- [ ] No bare `fetch` outside `api/client.ts`
- [ ] Every approval call wrapped in `withApproval(unwrap(…))`
- [ ] Every string sourced from `i18n/en.ts`
- [ ] Tap targets ≥44 px, verified at 375 px
- [ ] No horizontal scroll at 375 px
- [ ] `prefers-reduced-motion` respected
- [ ] `vue-tsc` clean, unit tests pass
- [ ] Exercised on a physical phone inside Nimiq Pay
