# Nimiq Pulse — Coding Standards

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Stack | Vue 3.5 (`<script setup>`) · TypeScript strict · Vite |
| Related | [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) · [FRONTEND.md](FRONTEND.md) |

---

## 1. Non-negotiables

Six rules. Breaking any of them is a review-blocking defect, not a style preference, because each one protects a guarantee that cannot be recovered elsewhere.

| # | Rule | What breaks without it |
| --- | --- | --- |
| 1 | Only `provider.ts` imports `@nimiq/mini-app-sdk` | Denial-handling and approval serialisation are silently lost |
| 2 | Only `api/client.ts` calls `fetch` | Auth, timeouts, and error mapping become inconsistent |
| 3 | Only `cache/store.ts` touches `localStorage` | Staleness becomes unreasonable about |
| 4 | Every user-facing string comes from `i18n/en.ts` | Localisation becomes a refactor |
| 5 | Every colour, space, and radius comes from a token | The "gold only on earned" rule erodes |
| 6 | No `v-html`, anywhere | XSS via review text |

---

## 2. TypeScript

```jsonc
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true,
  "noFallthroughCasesInSwitch": true
}
```

- **No `any`.** Use `unknown` and narrow. If a third-party type is wrong, write a local type and comment why.
- **No non-null assertions (`!`).** Narrow explicitly. The one exception is after a guard clause that has already thrown.
- **Prefer `type` over `interface`** except for object shapes that may be extended.
- **Discriminated unions over optional-field soup:**

```ts
// bad
type QuestState = { completed?: boolean; confirming?: boolean; txHash?: string }

// good
type QuestState =
  | { kind: 'available' }
  | { kind: 'confirming'; txHash: string }
  | { kind: 'completed'; xpAwarded: number }
```

- **Function signatures are explicit** at module boundaries. Inference is fine inside a function body.

---

## 3. Vue

Always `<script setup lang="ts">`. Block order: `<script>`, `<template>`, `<style scoped>`.

```vue
<script setup lang="ts">
// 1. type-only imports
// 2. framework imports
// 3. internal imports (platform → lib → ui)
// 4. props / emits
// 5. reactive state
// 6. computed
// 7. functions
// 8. lifecycle
</script>
```

- `defineProps<T>()` with a type parameter, never the runtime object form.
- `defineEmits<{ (e: 'publish', rating: number): void }>()`.
- **Props are read-only.** Never mutate a prop; emit instead.
- `<style scoped>` always. Global styles only in `styles/`.
- `v-for` always has a stable `:key` — never the array index for anything reorderable.
- Never `v-if` and `v-for` on the same element.

### 3.1 Components

- One component per file. If a file exceeds ~200 lines, it is doing two jobs.
- Logic beyond simple derivation moves to a composable.
- `ui/` components take props and emit events. They never import `api/`, `wallet/`, or `cache/`.

### 3.2 Composables

- Named `useX`, returning a plain object of refs and functions.
- Every composable that starts something (poll, listener, timer) stops it in `onUnmounted`. No exceptions — a leaked poll on a phone is a battery bug.

---

## 4. Wallet calls

Every approval-requiring call composes both wrappers, in this order:

```ts
const txHash = await withApproval(() => unwrap(provider.sendBasicTransaction({
  recipient: TIP_JAR_ADDRESS,
  value: nimToLuna(amount),
})))
```

Read-only calls skip the mutex and may be batched:

```ts
const [consensus, height] = await Promise.all([
  provider.isConsensusEstablished(),
  provider.getBlockNumber(),
])
```

**Never** call an approval-requiring method without `withApproval`. **Never** call any `T | ErrorResponse` method without `unwrap`.

---

## 5. Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Boolean | `is` / `has` / `can` | `isRefreshing`, `canReview` |
| Async function | verb phrase | `publishReview()`, not `reviewHandler()` |
| Event handler | `on` + event | `onSendTip` |
| Emitted event | past tense | `published`, `dismissed` |
| Luna amounts | suffix `Luna` | `valueLuna` |
| NIM amounts | suffix `Nim` | `amountNim` |

**The Luna/NIM suffix is mandatory.** 1 NIM = 100 000 Luna, and an unsuffixed `value` crossing a boundary is a five-order-of-magnitude bug waiting to happen. Only `lib/format.ts` converts between them.

---

## 6. Lint enforcement

The chokepoint rules are machine-checked, because convention alone will not hold them:

```jsonc
// eslint.config.js — no-restricted-imports
{
  "patterns": [
    { "group": ["@nimiq/mini-app-sdk"], "message": "Import from provider.ts instead." }
  ]
}
```

with an override permitting the import in `src/provider.ts` only. Equivalent restrictions block bare `fetch` outside `api/client.ts` and `localStorage` outside `cache/store.ts`, and `vue/no-v-html` is set to `error`.

CI runs: `vue-tsc --noEmit`, `eslint`, `vitest run`, `vite build`. All four must pass.

---

## 7. Comments

Comment **why**, never **what**. The code says what.

```ts
// bad
// loop over the quests
for (const q of quests) { … }

// good
// The SDK resolves with ErrorResponse instead of rejecting, so a declined
// dialog arrives as a fulfilled promise. Rethrow it so callers can use catch.
if (isErrorResponse(result)) throw new ProviderError(result.error.message)
```

Comment density should match the surrounding file. Every non-obvious platform behaviour — the double macro-block event, the resolved-error contract, the origin-scoped device ID — gets a comment where it is relied on, because the next reader will not have this context.

No commented-out code. No `TODO` without an owner and a reason.

---

## 8. Formatting

Prettier, defaults except: no semicolons, single quotes, trailing commas, 100-char width, 2-space indent. Not negotiated in review — the formatter decides.

---

## 9. Git

```
feat(quests): add tip jar sheet
fix(provider): rethrow ErrorResponse from sendBasicTransaction
docs(design): add Pulse Ring spec
```

Scopes match feature folders. Present tense, imperative, lower case.

Branches: `feat/…`, `fix/…`, `docs/…`, `chore/…`.

---

## 10. Review checklist

- [ ] No SDK import outside `provider.ts`; no bare `fetch`; no direct `localStorage`
- [ ] Approval calls wrapped in `withApproval(unwrap(…))`
- [ ] No `any`, no `!`, no `v-html`
- [ ] Strings from `i18n/en.ts`; colours and spacing from tokens
- [ ] Luna/NIM suffixes present at every boundary
- [ ] Listeners, timers, and polls cleaned up in `onUnmounted`
- [ ] All five UI states rendered
- [ ] Tap targets ≥44 px; no horizontal scroll at 375 px
- [ ] `vue-tsc`, eslint, tests, and build all pass
