# Nimiq Pulse — Information Architecture

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Related | [USER_FLOWS.md](USER_FLOWS.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [PRD.md](PRD.md) §8 |

---

## 1. Structure

Flat and shallow. Four destinations, one level of detail beneath each. Nothing is more than two taps from anywhere.

```
Pulse
├── Connect                     (pre-auth, replaced by Profile once signed in)
│
├── Profile        [tab 1]
│   ├── Identity card (Pulse Ring, level, XP, streak)
│   ├── Achievements → Achievement detail (source transaction)
│   └── Activity    → Interaction detail (source transaction)
│
├── Discover       [tab 2]
│   ├── Feed (ranked) / Starter set
│   ├── App detail → Reviews for app · Open app (deeplink)
│   └── Submit your Mini App → Submission confirmation
│
├── Quests         [tab 3]
│   ├── Today's quests
│   └── Tip jar sheet (amount → approval → confirming)
│
└── Reviews        [tab 4]
    ├── Reviews you can write (apps you've paid)
    ├── Reviews you've written
    └── Review composer
```

---

## 2. Why four tabs, in this order

Order is left to right by frequency of intended use, with the identity anchor first because it is the product's promise.

| # | Tab | The question it answers | Why here |
| --- | --- | --- | --- |
| 1 | Profile | "Who am I in this ecosystem?" | The landing tab. It is the wow moment on first run and the reward surface on every return. |
| 2 | Discover | "What should I try next?" | The core value for users and the delivery mechanism for developers. |
| 3 | Quests | "What can I do today?" | The reason to come back tomorrow. |
| 4 | Reviews | "Can I trust this?" | Lowest frequency; it is a contribution surface more than a consumption one. |

**Labels are always visible.** Icon-only tab bars fail the "can a new user figure it out without instructions?" test — icons for "quests" and "discover" have no universal form.

**No hamburger, no hidden menu, no settings tab.** There is nothing to configure: identity is the wallet, language comes from `window.nimiqPay.language`, and theme follows the design system. Anything that would live in settings is either not needed or belongs inline.

---

## 3. Persistent chrome

| Region | Contents | Present on |
| --- | --- | --- |
| Status strip | Compact Pulse Ring (40 px), level, XP to next level | Discover, Quests, Reviews |
| Screen header | Title, contextual action | All tabs |
| Banner slot | Stale / info / error banners | All screens, directly under the header |
| Tab bar | Four labelled destinations | All authenticated screens |

The identity card is full-size only on Profile. Elsewhere it compresses into the status strip so progress stays visible without stealing the screen — satisfying PRD AC2.5 ("identity card visible without scrolling") while leaving room for content on the other tabs.

---

## 4. Screen inventory

| Screen | Route | Auth | Primary action |
| --- | --- | --- | --- |
| Connect | `/connect` | no | Connect wallet |
| Not in Nimiq Pay | `/connect` (fallback) | no | — (instructions only) |
| Profile | `/profile` | yes | Open an achievement |
| Achievement detail | `/profile/achievement/:code` | yes | View source transaction |
| Discover feed | `/discover` | yes | Open an app |
| App detail | `/discover/app/:id` | yes | Open app · Write review |
| Submit Mini App | `/discover/submit` | yes | Submit |
| Submission confirmed | `/discover/submit/done` | yes | Back to feed |
| Quests | `/quests` | yes | Complete a quest |
| Tip jar sheet | `/quests/tip` (modal) | yes | Send tip |
| Reviews | `/reviews` | yes | Write a review |
| Review composer | `/reviews/compose/:appId` | yes | Publish |

Twelve screens. Every one has a designed populated state, a stale state, and an error state — see [ERROR_HANDLING.md](ERROR_HANDLING.md).

---

## 5. Content hierarchy per tab

### Profile
1. Pulse Ring with level (the one `--type-display` element)
2. XP bar and progress to next level
3. Streak
4. Achievements grid — unlocked first, then locked with visible conditions
5. Recent activity, newest first, each row linking to its transaction

Rationale: identity before achievement before history. A new wallet still sees all four sections, populated with a flat ring, 0 XP, locked achievements showing how to unlock them, and an activity section explaining what will appear there.

### Discover
1. Reason-labelled ranked feed (or starter set, labelled "Starter Mini Apps to try")
2. "Submit your Mini App" entry, persistent at the end of the feed

The submission entry lives at the end rather than in a menu because it is the distribution mechanic: every user is a potential developer, and every developer scrolls the feed first.

### Quests
1. Today's quests, `TIP_JAR` always present
2. Completed quests collapse to the bottom, dimmed, retaining their reward label

### Reviews
1. Apps you can review (paid, not yet reviewed) — the action surface, so it goes first
2. Reviews you've written, editable

Empty case: a wallet that has paid nothing sees "Pay a Mini App to unlock reviews" with a link into Discover — a route forward, not a dead end.

---

## 6. Navigation rules

- Tab switches preserve scroll position and in-progress state.
- Detail screens push; the back affordance is a header chevron *and* the platform back gesture.
- The tip jar is a bottom sheet, not a route push — it is a transient decision, and a sheet keeps the quest list visible behind it.
- Deeplinking out to another Mini App leaves Pulse. On return the app restores from cache with no re-login and no re-approval.
- No route requires more than two taps from any other route.

---

## 7. Terminology

One word per concept, everywhere, forever.

| Concept | Word | Never |
| --- | --- | --- |
| A listed Mini App | **app** | dApp, project, listing, product |
| An on-chain payment Pulse indexed | **interaction** | tx, transfer, event |
| Points earned | **XP** | points, score, credits |
| A daily mission | **quest** | task, mission, challenge, bounty |
| Proof a reviewer paid | **verified payer** | validated, certified, trusted |
| Adding an app to Pulse | **submit** | register, list, apply |
| Signing in | **connect wallet** | login, sign in, authenticate |

Button labels match the screen they lead to and the confirmation they produce: "Send tip" → "Tip sent". Consistency here is what lets a new user navigate without instructions.
