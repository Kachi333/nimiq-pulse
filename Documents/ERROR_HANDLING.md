# Nimiq Pulse — Error Handling

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Related | [FRONTEND.md](FRONTEND.md) · [COPY_GUIDE.md](COPY_GUIDE.md) · [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) |

---

## 1. The rule

**No error produces a blank screen, a crash, or an unexplained spinner.** Every failure renders as content plus an explanation plus a way forward.

This is not politeness. Pre-ship checklist item 4 is explicitly *"User rejection is handled gracefully… the app shows a clear, non-alarming message and remains usable."* And in a wallet context, an app that breaks visibly when something goes wrong reads as unsafe.

---

## 2. The trap that defines this document

> **The Nimiq SDK resolves with an error object. It does not reject.**

`listAccounts()`, `sign()`, and every `send*Transaction()` return `Promise<T | ErrorResponse>`. When the call fails **or the user declines the approval dialog**, the promise *fulfils* with `{ error: { type, message } }`.

```ts
// WRONG — a declined payment is read as success
try {
  const txHash = await provider.sendBasicTransaction({ ... })
  markQuestComplete(txHash)          // txHash is actually an ErrorResponse object
} catch { /* never runs */ }

// RIGHT
try {
  const txHash = await withApproval(() => unwrap(provider.sendBasicTransaction({ ... })))
  markQuestPending(txHash)
} catch (e) { showQuestCancelled(toAppError(e)) }
```

Every wallet call goes through `unwrap()`. This is enforced by the rule that only `provider.ts` may import the SDK ([FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) §3), because a single missed `unwrap()` produces a silent, data-corrupting bug rather than a visible failure.

---

## 3. Error taxonomy

```ts
type ErrorKind =
  | 'provider-unavailable'   // not inside Nimiq Pay, or init() timed out
  | 'user-declined'          // declined an approval dialog — NOT a failure
  | 'wallet-busy'            // another approval already open
  | 'no-consensus'           // wallet hasn't synced
  | 'network'                // backend unreachable
  | 'auth-expired'           // 401
  | 'not-eligible'           // 403 with a business reason
  | 'validation'             // 400, field-level
  | 'not-confirmed'          // tx broadcast but not indexed in time
  | 'server'                 // 5xx
  | 'unknown'

interface AppError { kind: ErrorKind; message: string; retryable: boolean }
```

`user-declined` is deliberately its own kind. **A user saying no is a valid outcome, not an error.** It never shows a red banner, never logs as a failure, and never blocks anything.

---

## 4. Presentation

| Surface | Use for | Blocks UI |
| --- | --- | --- |
| **Inline field** | Validation | No |
| **Banner** | Stale data, degraded service, non-confirmation | No |
| **Inline row state** | A quest or item that failed | No |
| **Full screen** | Provider unavailable only | Yes — nothing else works anyway |
| **Toast** | Never used | — |

Toasts are excluded on purpose: they vanish before a user on a phone finishes reading, and they cannot carry a recovery action reliably.

---

## 5. The matrix

| # | Condition | Kind | User sees | Recovery |
| --- | --- | --- | --- | --- |
| 1 | Opened outside Nimiq Pay | `provider-unavailable` | Full screen: "Open this in Nimiq Pay" with the three load steps | Instructions only |
| 2 | `init()` times out (10 s) | `provider-unavailable` | Same, plus "Try again" | Retry |
| 3 | Declined login | `user-declined` | Connect screen: "No problem — connect whenever you're ready." | Button stays; no re-prompt |
| 4 | Declined payment | `user-declined` | Quest row: "Payment cancelled — the quest is still open" | Row returns to Available |
| 5 | Second dialog attempted | `wallet-busy` | "Finish the open confirmation first" | Auto-clears when the first resolves |
| 6 | Consensus not established | `no-consensus` | Payment button disabled + "Nimiq Pay is still syncing" | Re-enables automatically |
| 7 | Backend unreachable, cache present | `network` | Cached content + banner "Couldn't refresh — showing your last synced data" | Auto-retry on next mount; pull to refresh |
| 8 | Backend unreachable, no cache | `network` | Bundled starter content, labelled, + retry | Retry |
| 9 | Session expired | `auth-expired` | Inline "Reconnect" button — **never an automatic dialog** | One tap |
| 10 | Review without payment | `not-eligible` | "Pay this app first to leave a verified review" + Open app | Route forward |
| 11 | Duplicate registry address | `validation` | "This address is already registered to *App name*" | Edit the field |
| 12 | Invalid Nimiq address | `validation` | Live inline: "That doesn't look like a Nimiq address" | Corrected as typed |
| 13 | Tx not indexed in 5 min | `not-confirmed` | "We couldn't confirm that payment yet. It may still land." | Quest stays claimable |
| 14 | Indexer lagging | `network` | Banner "Chain data is catching up" | Informational |
| 15 | 5xx | `server` | "Pulse is having trouble. Try again in a moment." | Retry with backoff |
| 16 | Unexpected render error | `unknown` | Error boundary: the tab's shell + "Something went wrong here" | Tab bar still works |

Rows 3 and 4 are the ones most often got wrong. Neither is styled as an error.

---

## 6. Retry policy

| Kind | Retry | Backoff |
| --- | --- | --- |
| `network`, `server` | Automatic, 3 attempts | 1 s → 2 s → 4 s, ±20% jitter |
| `not-confirmed` | Poll | 2/4/8/16/30 s, capped, 5 min total |
| `auth-expired` | One silent token refresh, then user action | — |
| `user-declined`, `validation`, `not-eligible` | **Never** | — |

Never auto-retry something the user declined. Re-prompting after a "no" is the behaviour of a scam app.

Writes are idempotent server-side (unique constraints, [TDD.md](TDD.md) §6), so a retried claim or review cannot double-apply.

---

## 7. Error boundaries

```
App.vue
 └── onErrorCaptured → render tab shell + inline error, keep tab bar alive
      └── each routed view
           └── each feature section (Profile splits: identity / achievements / activity)
```

Sectioned boundaries mean a failure in the activity list does not take down the identity card. The user keeps their level, XP, and navigation.

The boundary logs and returns `false` to stop propagation. It never renders a stack trace.

---

## 8. Copy rules

Every message answers: **what happened**, and **what now**.

| Do | Don't |
| --- | --- |
| "Couldn't refresh — showing your last synced data" | "Error 500" |
| "Pay this app first to leave a verified review" | "Unauthorized" |
| "Payment cancelled — the quest is still open" | "Transaction failed!" |
| "Nimiq Pay is still syncing" | "No consensus" |
| "That doesn't look like a Nimiq address" | "Invalid input" |

No apologies, no exclamation marks, no emoji, no blame, no jargon. The interface states the situation calmly and points at the next step. Full guidance in [COPY_GUIDE.md](COPY_GUIDE.md).

Server error messages arrive pre-written in the interface voice ([TDD.md](TDD.md) §7.2) and are displayed directly rather than re-worded client-side.

---

## 9. Logging

| Kind | Logged |
| --- | --- |
| `user-declined` | No — a decision, not a fault |
| `validation`, `not-eligible` | No — expected business outcomes |
| `network`, `server`, `unknown` | Yes, with route and error kind |
| Anything containing an address, tx hash, or token | **Never** |

No third-party error service in MVP. Console logging in development; the backend already records what matters for the product metrics.

---

## 10. Test checklist

- [ ] `unwrap()` throws on a resolved `ErrorResponse`, passes success through
- [ ] Declining login shows the calm message, not a red banner
- [ ] Declining payment leaves the quest available and the app fully usable
- [ ] Airplane mode renders cached content plus the stale banner
- [ ] First run with no cache and no network renders bundled starter content
- [ ] Expired session shows Reconnect — no dialog fires on its own
- [ ] Two rapid taps on a payment button raise exactly one dialog
- [ ] A thrown render error leaves the tab bar working
- [ ] No error message contains a stack trace, a status code, or an address
