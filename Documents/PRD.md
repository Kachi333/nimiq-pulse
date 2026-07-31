# Nimiq Pulse — Product Requirements Document

| Field | Value |
| --- | --- |
| Product | Nimiq Pulse — the growth layer for the Nimiq Mini App ecosystem |
| Version | 1.0 |
| Date | 31 July 2026 |
| Status | Draft for build |
| Target platform | Nimiq Pay Mini App (mobile WebView) |
| Scope | Hackathon MVP + roadmap |
| Related | [TDD.md](TDD.md) · [software_architecture.md](software_architecture.md) |

---

## 1. Summary

Nimiq Pulse is an open, on-chain growth layer for every Nimiq Mini App. It maintains a public registry of Mini App receiving addresses, reads real wallet transaction history against that registry, and turns the result into discovery, identity, reputation, and rewards.

Users get personalised Mini App recommendations, daily quests, XP, levels, streaks, achievements, and verified reviews. Developers get a free acquisition channel the moment they submit an address.

**One-sentence pitch:** Nimiq Pulse is the open, on-chain growth layer for every Mini App — the first thing a new wallet installs, and the first thing every new Mini App developer joins, because both need it to be found.

---

## 2. Problem

The ecosystem has a two-sided cold-start problem, and each side blocks the other.

**Users have no reason to explore.** They use the one or two Mini Apps they already know. There is no discovery surface, no shared identity, no progression, no ecosystem-wide reward for trying something new.

**Developers have no users.** Every Mini App launches at zero visibility and must build distribution from scratch. Without users, developers stop building. Without developers, the ecosystem stops growing.

Good Mini Apps already exist. Nobody finds them.

### 2.1 Why this is solvable now

Nimiq's ledger is public. Any Mini App that accepts NIM has a receiving address. That means a third party can measure real ecosystem activity **without any cooperation from other teams** — no partnerships, no SDK adoption, no permission. The data needed to solve discovery already exists on-chain; nobody has assembled it.

---

## 3. Vision and mission

**Vision.** The operating system for the Nimiq Mini App ecosystem — what Steam is to game discovery, Game Center is to achievements, and Play Store is to app distribution.

**Mission.** Make Nimiq Pay the first wallet people open every day — not only to send money, but to discover, engage, and participate.

---

## 4. Goals and non-goals

### 4.1 Goals

| # | Goal | Measured by |
| --- | --- | --- |
| G1 | A new wallet reaches its first reward inside 60 seconds | Time from app open to first achievement unlock |
| G2 | Discovery is driven by real on-chain behaviour, never simulated | % of feed entries backed by indexed chain data |
| G3 | Every core feature requires or reflects real NIM activity | NIM transactions originated per active wallet |
| G4 | Developers can join the registry in under a minute | Median time to complete submission |
| G5 | The app is usable on a weak mobile connection | Time to interactive on cached load |
| G6 | Wallets return on more than one day | D1 return rate |

### 4.2 Non-goals for MVP

- Not a wallet. Pulse never holds funds, never touches keys, never replaces Nimiq Pay.
- Not a block explorer. Raw chain browsing is out of scope.
- Not an app store. No hosting, no distribution of app bundles, no approval workflow.
- No sponsored placement, paid ranking, or ad inventory in v1.
- No token, no points-with-monetary-value, no tradeable rewards.
- No cross-chain or EVM support in v1 (Nimiq provider only).

---

## 5. Users

### 5.1 Persona A — Maya, the active Nimiq Pay user

Uses Nimiq Pay a few times a week to send NIM. Has heard Mini Apps exist but has only ever opened one. Curious, mobile-only, low patience for setup.

- **Needs:** a reason to look beyond the app she knows; confidence that a new app is legitimate.
- **Frustrations:** no idea what exists; no way to tell a good Mini App from an abandoned one.
- **Success:** she opens Pulse, sees apps other wallets like hers actually paid, tries one, earns XP.

### 5.2 Persona B — Dev, the early Mini App builder

Shipped a Mini App during or just after a hackathon. Has no marketing budget and no audience. Wants users more than anything.

- **Needs:** distribution that costs nothing and takes minutes.
- **Frustrations:** builds something good, nobody sees it, momentum dies.
- **Success:** submits a receiving address and app name, appears in the feed, sees real wallets arrive.

### 5.3 Stakeholder — the hackathon judge

Not a user, but an evaluator. Needs to see, in 90 seconds, that the product works on real data, is complete rather than half-built, and solves a genuine ecosystem problem. Section 14 maps features to the rubric.

---

## 6. Value proposition

**For users:** effortless discovery · a persistent wallet reputation · daily quests · XP and achievements · trustworthy reviews backed by proof of payment.

**For developers:** free exposure · qualified traffic · verified reviews · organic acquisition · one-minute onboarding.

---

## 7. Product principles

1. **Real data or nothing.** Every number shown traces back to an indexed on-chain event. No mock data ships, not even in the demo.
2. **Never a dead end.** Every screen has a populated state. A brand-new wallet with zero history sees starter apps and a completable quest, not an empty list.
3. **Cached first.** The app opens instantly from cache and refreshes in the background. Freshness never blocks usability.
4. **One approval, one intent.** Native approval dialogs only ever follow a deliberate user action, never a page load, and never in rapid succession.
5. **The chain is the product.** If Nimiq Pay disappeared, Pulse could not exist. Wallet identity, payments, and public history are load-bearing, not decorative.
6. **Earned, not claimed.** Reviews, achievements, and XP require verifiable on-chain evidence.

---

## 8. Information architecture

Four bottom tabs, thumb-reachable, no hidden menus, no hamburger.

```
┌──────────────────────────────────────┐
│  Wallet identity card (always on top │
│  of Profile; compact bar elsewhere)  │
├──────────────────────────────────────┤
│                                      │
│           Active tab content         │
│                                      │
├──────────────────────────────────────┤
│  Profile │ Discover │ Quests │ Reviews │
└──────────────────────────────────────┘
```

| Tab | Job | Primary content |
| --- | --- | --- |
| Profile | "Who am I in this ecosystem?" | Identity card, XP bar, level ring, streak, achievements, activity |
| Discover | "What should I try next?" | Ranked Mini App feed, trending, starter set, app detail |
| Quests | "What can I do today?" | Daily quest list, progress, claim |
| Reviews | "Can I trust this?" | Reviews for apps the wallet has paid; write-review entry point |

Developer registry submission is reachable from Discover (a persistent "Submit your Mini App" entry at the end of the feed) and from any app detail screen.

---

## 9. Feature specifications

Priority: **P0** ships in MVP, **P1** ships if time allows, **P2** is roadmap.

### F1 — Smart Discovery Feed (P0)

Personalised, ranked list of Mini Apps computed from real tagged-address activity.

**Ranking inputs**
1. **Co-occurrence** — apps paid by wallets that also paid the apps this wallet paid.
2. **Trending** — distinct paying wallets per app over a rolling 7-day window.
3. **Novelty** — apps this wallet has never interacted with are boosted.
4. **Starter set** — a curated, manually ordered fallback for wallets with no matched history.

**User stories**
- As Maya, I want to open Discover and immediately see apps worth trying, so I don't have to search.
- As Maya, I want to see *why* an app is recommended, so the suggestion feels credible.
- As Dev, I want my app to appear in the feed once registered, so I get traffic without paying for it.

**Acceptance criteria**
- **AC1.1** Given a wallet with ≥1 matched registry payment, when Discover loads, then the feed shows ranked apps excluding those already used, each with a reason label ("Popular with wallets like yours", "Trending this week", "New this week").
- **AC1.2** Given a wallet with zero matched history, when Discover loads, then the starter set renders with the label "Starter Mini Apps to try" — never an empty list.
- **AC1.3** Given cached feed data exists, when Discover loads, then cached content paints before any network request completes.
- **AC1.4** Given the backend is unreachable, when Discover loads, then cached content renders with a non-blocking banner "Couldn't refresh — showing your last synced data".
- **AC1.5** Each feed entry exposes: app name, one-line description, category, distinct-wallet count, average rating (if ≥3 reviews), and an "Open" action that deeplinks to the app.
- **AC1.6** Feed responses are deterministic for a given wallet and dataset — the same inputs produce the same order.

**Edge cases:** registry app whose address has zero activity (rank last, still visible); app removed from registry (drops from feed, existing reviews retained); fewer than 5 registry entries total (starter set fills the remainder).

---

### F2 — Wallet Identity (P0)

Every wallet becomes a persistent profile that follows it across the ecosystem.

**Components:** address (truncated) · level and level ring · XP bar with progress to next level · current streak · achievement grid · activity list of matched on-chain interactions.

**XP economy (concrete values)**

| Event | XP | Cap |
| --- | --- | --- |
| First-ever payment to a registry app | 50 | Once per app, per wallet |
| Repeat payment to a known app | 5 | Max 15 XP per app per day |
| Daily quest completion | 10–40 (per quest) | Per quest definition |
| Verified review published | 25 | Once per app, per wallet |
| Daily streak day | 5 × min(streak, 7) | Once per calendar day (UTC) |
| Registering a Mini App that gets ≥1 external payer | 100 | Once per app |

**Level curve.** Level *n* requires cumulative `100 × n × (n+1) / 2` XP (L2 at 300, L3 at 600, L5 at 1500, L10 at 5500). Chosen so a first session reliably reaches L2 and the curve visibly slows, giving a long-lived progression without inflation.

**Streak rules.** A streak day counts when the wallet completes ≥1 quest in a UTC day. Missing a day resets to 1 on the next completion. Streak is displayed but never gates content.

**Achievements (MVP set)**

| Achievement | Condition |
| --- | --- |
| First Steps | First matched payment to any registry app |
| Explorer | Paid 3 distinct registry apps |
| Pathfinder | Paid 10 distinct registry apps |
| Early Adopter | Paid an app within 7 days of its registry listing |
| Community Builder | Registered a Mini App that received ≥1 external payment |
| Creator Supporter | Completed the tip-jar quest 5 times |
| Trusted Voice | Published 3 verified reviews |
| Consistent | Reached a 7-day streak |

**Acceptance criteria**
- **AC2.1** Given a connected wallet, when Profile loads, then level, XP, streak, and achievements render from server-computed state, and every XP entry is traceable to a specific on-chain transaction or quest completion.
- **AC2.2** Given a wallet with no history, when Profile loads, then it shows Level 1, 0 XP, and locked achievements with their unlock conditions visible — never a blank screen.
- **AC2.3** Given XP is awarded, when the client receives it, then the XP bar animates and any newly unlocked achievement is presented once, immediately.
- **AC2.4** XP is idempotent: reprocessing the same transaction never awards XP twice.
- **AC2.5** The identity card is visible on Profile at all times without scrolling on a 375 px viewport.

---

### F3 — Daily Quests (P0)

Ecosystem-wide daily missions that drive exploration and real NIM usage.

**Quest types**

| Type | Example | Verification | XP |
| --- | --- | --- | --- |
| `TIP_JAR` | "Send a tip through Pulse" | On-chain payment from wallet to Pulse tip address | 40 |
| `TRY_NEW_APP` | "Pay any Mini App you haven't used" | Indexed payment to a registry address new to this wallet | 30 |
| `FEATURED_APP` | "Visit today's featured app" | Deeplink open event + return, or payment | 10 |
| `WRITE_REVIEW` | "Leave a verified review" | Published review passing proof-of-payment | 25 |
| `STARTER` | "Try any app below" | Any registry payment | 10 |

**Rules**
- Exactly one `TIP_JAR` quest is offered every day. This is what makes NIM usage structurally guaranteed rather than incidental.
- 3–4 quests per day. The quest set rolls over at 00:00 UTC.
- A wallet with zero history is always offered the `STARTER` quest so the first session has a completable action.

**User stories**
- As Maya, I want a short list of things to do today, so I have a reason to open Pulse again tomorrow.
- As Maya, when I complete a quest, I want to see the reward immediately, so the loop feels rewarding.

**Acceptance criteria**
- **AC3.1** Given the Quests tab loads, then today's quests render with per-quest state: available, pending verification, or completed.
- **AC3.2** Given a `TIP_JAR` quest and a user tap, then exactly one approval dialog is raised, and no other approval-requiring call is issued until it resolves.
- **AC3.3** Given the user declines the approval dialog, then the quest returns to available with the message "Payment cancelled — the quest is still open", and the app remains fully usable.
- **AC3.4** Given a payment succeeds but is not yet indexed, then the quest shows "Confirming…" and resolves to completed once indexed, without requiring an app restart.
- **AC3.5** Quest completion is idempotent per wallet per quest per day.
- **AC3.6** A quest is never marked complete on client assertion alone; the server verifies against indexed chain data.

---

### F4 — Verified Reviews (P0)

Reviews gated by proof of a real on-chain payment to the reviewed app's registered address.

**User stories**
- As Maya, I want to read reviews only from wallets that actually paid, so I can trust them.
- As Maya, I want to review an app I used, so I can help others.
- As Dev, I want fake reviews to be impossible, so my rating means something.

**Acceptance criteria**
- **AC4.1** Given a wallet with no indexed payment to app X, when it opens the review composer for X, then writing is blocked with the message "Pay this app first to leave a verified review" — no partial submission path exists.
- **AC4.2** Given a wallet with ≥1 indexed payment to X, then it may publish exactly one review for X, editable but not duplicable.
- **AC4.3** A review carries a 1–5 rating, optional text up to 280 characters, the truncated reviewer address, and a "Verified payer" marker.
- **AC4.4** Server-side verification is authoritative. A client-supplied claim of payment is never trusted.
- **AC4.5** Average rating is displayed only at ≥3 reviews; below that, show the review count alone. This prevents a single review defining an app's reputation.
- **AC4.6** Reviews are immutable in history: edits create a new version, and the displayed timestamp reflects the latest edit.

---

### F5 — Developer Registry (P0 — see §9.1)

Open submission so any developer can list a Mini App in under a minute.

**Submission fields:** app name (required) · receiving Nimiq address (required) · Mini App URL (required) · one-line description (required, ≤100 chars) · category (required, from a fixed list) · contact handle (optional).

**Acceptance criteria**
- **AC5.1** Submission completes in a single screen with ≤6 fields and no account creation beyond the connected wallet.
- **AC5.2** The address is validated for Nimiq format before submission is accepted.
- **AC5.3** A duplicate address is rejected with "This address is already registered to <app name>".
- **AC5.4** A submitted app enters `PENDING` and becomes visible in Discover only after moderation, to keep the feed trustworthy.
- **AC5.5** The submitting wallet is recorded as the owner, enabling the Community Builder achievement and future developer tooling.
- **AC5.6** The submitter sees confirmation and expected review time; they are never left guessing.

#### 9.1 Scope inconsistency flagged

The source brief lists the MVP as **four** features and places the registry outside it, while simultaneously depending on registry submission as the entire distribution and community strategy. Those cannot both hold.

**Recommendation: pull F5 into the MVP.** It is the cheapest feature in the set — one form, one endpoint, one moderation flag — and without it, the marketing plan (recruiting other builders by having them submit addresses) has no product to point at. Section 14 shows the rubric depends on it. The four "user-facing" features remain F1–F4; F5 is the supply side that feeds them.

---

## 10. Onboarding — under 60 seconds by design

| Step | Elapsed | What happens |
| --- | --- | --- |
| 1 | 0–5 s | Pulse opens. Cached or skeleton UI paints immediately. |
| 2 | 5–15 s | "Connect wallet" — one tap, one native approval. The wallet signs a login challenge; the address is derived from the signature, so **only one dialog is needed**, not two. |
| 3 | 15–30 s | Backend matches the wallet's indexed history against the registry and returns a populated profile. A wallet with prior activity sees achievements it already earned. |
| 4 | 30–45 s | A wallet with no history sees "Starter Mini Apps to try" plus the `STARTER` quest — never an empty state. |
| 5 | 45–60 s | First quest completes. XP bar animates, first achievement unlocks. **This is the wow moment.** |

**AC10.1** A first-time wallet with zero on-chain history can reach its first achievement without leaving Pulse and without a second approval dialog beyond login.

---

## 11. Anti-abuse and fairness

XP is derived from payments the user themselves initiates, so the incentive to farm is structural and must be designed against, not patched later.

| Risk | Mechanism | Mitigation |
| --- | --- | --- |
| Self-dealing | User registers their own address, pays it repeatedly, farms XP | First-interaction XP is one-off per app; repeat XP capped at 15/app/day; registry owner wallet earns **no** XP from payments to its own app |
| Sybil wallets | One person, many wallets, farming quests and limited badges | Per-origin device identifier (`requestDeviceIdentifier`) caps limited rewards per device; device ID is pseudonymous and per-origin, so it is not user tracking |
| Fake registry entries | Registering an unrelated or malicious address | Moderation gate before feed visibility (AC5.4); duplicate-address rejection |
| Review manipulation | Paying dust to unlock a review | Minimum payment threshold for review eligibility; one review per wallet per app; rating hidden below 3 reviews |
| Dust spam to inflate app metrics | Many tiny payments to inflate trending | Trending counts **distinct wallets**, not transactions, and applies a minimum amount threshold |

**Privacy commitment.** Pulse reads public chain data only. It stores **only** transactions that match a registry address — never a wallet's full history. This is disclosed in the connect screen before the first approval. No off-chain personal data is collected.

---

## 12. Success metrics

### 12.1 Product KPIs

| Metric | Target | Why |
| --- | --- | --- |
| Time to first achievement | < 60 s (p75) | Proves the onboarding claim |
| Wallets completing ≥1 quest | ≥ 70% of connected wallets | Core loop works |
| NIM transactions originated in Pulse | ≥ 1 per active wallet per active day | NIM usage is load-bearing |
| Registry entries | ≥ 10 before demo | Feed quality depends on supply |
| D1 return rate | ≥ 25% | Repeat value is real |
| Cached time-to-interactive | < 1 s | Weak-connection usability |
| Verified reviews published | ≥ 20 | Trust layer is exercised |

### 12.2 Instrumentation

Each metric maps to a server-side event: `wallet_connected`, `quest_completed`, `xp_awarded`, `review_published`, `app_registered`, `feed_served`, `deeplink_opened`. Client-side timing marks capture time-to-interactive and time-to-first-achievement.

---

## 13. Risks

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | ~~No verified public Nimiq RPC~~ — **resolved 31 Jul 2026.** An embedded `@nimiq/core` light client in the backend reads address history directly, peering with history nodes on its own | ~~High~~ Closed | No external endpoint and no self-hosted node needed; see [software_architecture.md](software_architecture.md) ADR-2 |
| R2 | Empty registry makes the feed worthless | High | Seed 5–10 real addresses before demo; starter set always fills gaps |
| R3 | Indexing lag makes quests feel broken | Medium | "Confirming…" state, optimistic UI, background reconciliation (AC3.4) |
| R4 | Judges cannot verify data is real | Medium | Every profile entry links to its source transaction hash |
| R5 | Backend is a single point of failure in a live demo | Medium | Cached-first client keeps the demo alive; pre-warm cache before demo |
| R6 | Dev server over HTTP on LAN blocks secure-context APIs | Low | Avoid `crypto.randomUUID()`; use documented fallbacks |
| R7 | "On-chain badge" incentive is not actually on-chain | Low | Either issue a real transaction or rename it "verified badge" — do not overclaim to judges |

---

## 14. Rubric traceability

| Rubric category | Target | Features that deliver it | Evidence |
| --- | --- | --- | --- |
| Design & UX | 8.5 | §10 onboarding, §8 four-tab IA, principle 2 (never a dead end), 44 px targets | AC1.2, AC2.2, AC2.5, AC10.1 |
| Functionality | 8.0 | F1–F5 complete; cached-first; explicit failure states | AC1.3, AC1.4, AC3.3, AC3.4 |
| Usefulness & Originality | 8.5 | Two-sided flywheel; on-chain identity layer; named dual audience | §2.1, §5, F1 ranking |
| Marketing & Distribution | 8.0 | F5 registry — recruiting builders *is* using the core feature | §9.1, AC5.1 |

Section 9.1 is the load-bearing argument: without F5 in the MVP, the Marketing & Distribution score has no product behind it.

---

## 15. Release plan

| Phase | Contents | Exit criteria |
| --- | --- | --- |
| M1 — Foundations | Backend skeleton, indexer, registry schema, wallet login via signature | A real wallet logs in; one indexed payment appears |
| M2 — Core loop | F2 profile, F3 quests incl. tip jar, XP engine | A wallet completes a quest and gains XP end to end |
| M3 — Discovery & trust | F1 feed with ranking, F4 verified reviews, F5 submission | All five features work against real data |
| M4 — Harden & ship | Cached-first, error states, pre-ship checklist, seeded registry, demo video | Every checklist item passes on a physical phone |

---

## 16. Open decisions

| # | Question | Needed by | Default if unanswered |
| --- | --- | --- | --- |
| D1 | Mainnet or testnet for the demo? | M1 | Testnet for development, mainnet for the demo, with the registry seeded on both |
| D2 | Who moderates registry submissions, and how fast? | M3 | Single maintainer, best-effort within hours; auto-approve is unacceptable for feed trust |
| D3 | Is the limited badge genuinely on-chain? | M4 | Off-chain badge anchored to a qualifying transaction hash, and described as such |
| D4 | Minimum payment amount for review eligibility | M3 | 1 NIM |
| D5 | Where is the backend hosted, and under what domain? | M1 | Any HTTPS host; the origin must be fixed early because the device identifier is origin-scoped |

---

## 17. Future roadmap

**Phase 2** — AI-assisted recommendations · sponsored discovery · merchant promotions · cross-app collections · developer analytics.

**Phase 3** — public API and SDK · community governance · cross-chain support · developer insights dashboard · ecosystem leaderboards.

Nothing from either phase is started in MVP. Scope discipline is a scoring criterion: four complete features beat eight half-built ones.
