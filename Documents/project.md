# Nimiq Pulse
### The Home Screen for the Nimiq Mini App Ecosystem
*(Master Submission Document — Narrative + Execution, Built to Clear 8/10 on Every Rubric Category)*

---

## Tagline
**The Home Screen for the Nimiq Mini App Ecosystem.**

## One-Sentence Pitch
*"Nimiq Pulse is the open, on-chain growth layer for every Mini App — the first thing a new wallet installs, and the first thing every new Mini App developer joins, because both need it to be found."*

## Elevator Pitch (30 seconds)
Nimiq Pulse is the growth layer for the entire Nimiq Mini App ecosystem. Instead of every Mini App starting from zero users and every wallet having no reason to explore beyond one app, Pulse creates a shared discovery, identity, reputation, and rewards system powered by real on-chain activity. Users receive personalized Mini App recommendations, complete daily quests, earn XP and achievements, and build a wallet reputation across the ecosystem. Developers gain a free acquisition channel by registering their Mini App, making Pulse the place where users discover apps and developers find users.

---

## Vision
Create the operating system that powers the future of the Nimiq Mini App ecosystem.

Just as:
- Steam powers game discovery
- Apple Game Center powers achievements
- Google Play powers app discovery

**Nimiq Pulse powers discovery, engagement, identity, and growth for every Mini App built on Nimiq Pay.**

## Mission
Make Nimiq Pay the first wallet people open every day — not just to send money, but to discover, engage, and participate in a thriving ecosystem of Mini Apps.

---

## The Problem

The success of any Mini App ecosystem depends on two things:

**Users need reasons to explore.**
Today, users only interact with the Mini Apps they already know. There is no intelligent discovery system, no shared identity, no progression, no ecosystem-wide rewards.

**Developers need users.**
Every new Mini App launches with zero visibility. Developers must build their own distribution from scratch. Without users, developers stop building. Without developers, ecosystems stop growing.

Great Mini Apps exist. But nobody discovers them.

---

## Our Solution

Nimiq's ledger is public. Any Mini App that accepts NIM has a receiving address. Pulse maintains an **open registry** of tagged addresses and reads real wallet history against it — no cooperation needed from other teams, no simulated data.

On top of that real data, Pulse connects every Mini App into one shared ecosystem layer:
- Discovery
- Identity
- Reputation
- Rewards
- Retention
- Developer Growth

Every additional Mini App makes Pulse smarter. Every new Pulse user becomes a potential user for every registered Mini App.

---

## Target Users

**Primary — Nimiq Pay Users**
People who already use Nimiq Pay and want easier ways to discover useful Mini Apps while earning rewards for participating in the ecosystem.

**Primary — Mini App Developers**
Developers launching Mini Apps who need an acquisition channel without spending money on advertising, especially early in the ecosystem's life when discovery is hardest.

---

## Value Proposition

**For Users**
- Discover new Mini Apps effortlessly
- Build a wallet reputation
- Complete daily quests
- Earn XP and achievements
- Unlock ecosystem rewards
- Find trusted Mini Apps through verified reviews

**For Developers**
- Free exposure inside Pulse
- Increased Mini App discovery
- Verified reviews
- Qualified traffic
- Community visibility
- Organic user acquisition

---

## Core Features

### 🚀 Smart Discovery Feed
Personalized Mini App recommendations based on wallet activity and ecosystem trends — computed from real tagged-address co-occurrence in wallet transaction history, not guesses. Instead of searching, users open Pulse and discover what matters.

### 👤 Wallet Identity
Every wallet becomes a persistent profile: XP, level, achievements, activity, reputation, streaks. Identity follows the wallet across every Mini App.

### 🎯 Daily Quests
Ecosystem-wide missions that encourage exploration and NIM usage: try a new Mini App, complete your first payment, leave a verified review, tip a creator, visit today's featured app.

### 🏆 Achievement System
Shared achievements across the ecosystem: Explorer, Early Adopter, Community Builder, Creator Supporter, Merchant Champion.

### ⭐ Verified Reviews
Reviews are only available after proof of real wallet interaction (on-chain payment to the reviewed app's registered address). Creates trusted recommendations, removes fake reviews.

### 📈 Developer Registry
Developers register their Mini App once — a receiving address and app name, submitted in under a minute. Pulse automatically includes it in discovery, recommendations, and ecosystem quests. No expensive marketing required.

---

## Product Flywheel

```
Developer registers Mini App
            ↓
Appears in Discovery Feed
            ↓
Users discover the app
            ↓
Users complete quests
            ↓
Earn XP & Achievements
            ↓
Leave verified reviews
            ↓
Mini App gains visibility
            ↓
More developers register
            ↓
Ecosystem grows
```

Each new developer increases value for users, and each new user increases value for developers — a self-reinforcing loop, not a static app.

---

## Why Nimiq

Pulse only works because Nimiq provides:
- Native wallet identity
- Secure NIM payments
- Public blockchain data
- Wallet signatures
- Mini App framework
- Embedded payment experience

Without Nimiq Pay, Pulse loses its foundation. This isn't a crypto feature bolted onto a generic app — the blockchain is the product.

---

# Execution Layer — How Pulse Clears Every Rubric Category

Everything above is the story. Everything below is what makes the story true and gradable.

## 1. Design & UX — Target 8.5+/10

**Visual design**
One consistent visual language: dark background, a single accent color used *only* for progress elements (XP bar, streak flame, level ring) — making the "growth" feeling visually obvious the instant the app opens. The wallet identity card is the hero of the home screen, always visible, never buried in a settings tab.

**Navigation**
Four bottom tabs, thumb-reachable: **Profile · Discover · Quests · Reviews.** No hidden menus, no hamburger icon.

**Onboarding — under 60 seconds by design**
1. Connect wallet (1 tap, native confirmation).
2. Pulse immediately checks the wallet's existing chain history against the registry — even a first-time wallet with zero prior activity sees a populated screen, not an empty state: a "Starter Mini Apps to try" list and one instantly-completable quest ("Try any app below — get 10 XP").
3. First quest completion → XP bar animates, first achievement pops. That's the "wow" moment, and it happens inside 60 seconds by design.

**Mobile experience**
Every interactive element ≥44px tap target, no reliance on hover states, native-feeling transitions.

## 2. Functionality — Target 8+/10

**Reliability**
Wallet-to-registry matching is cached and indexed, not queried live against the chain on every screen load. First load fetches and caches; subsequent loads are instant, chain re-sync happens quietly in the background.

**Nimiq integration as the core, not a login step**
Every core feature (XP, achievements, discovery, reviews) is derived from actual on-chain payments, and one daily quest always requires a real NIM transaction inside Pulse itself (e.g. a tip jar) — Nimiq Pay usage is structurally guaranteed, not incidental.

**Speed & performance**
Cached-first architecture keeps the app instantly usable even on a weak connection; a lightweight "syncing" indicator (not a blocking spinner) shows when fresh chain data is being pulled in.

**Error handling**
If a chain query fails: show last-known cached state with a small non-blocking banner ("Couldn't refresh — showing your last synced data"), never a crash or blank screen. If a wallet has no history yet: show the starter-apps empty state, never a dead end.

**Completeness — scope discipline**
Ship exactly four features, fully working, nothing half-built:
1. Discovery feed (registry + co-occurrence)
2. Daily quests (incl. one real NIM-transaction quest)
3. Wallet profile (XP, level, streak, achievements)
4. Verified reviews (gated by proof-of-payment)

Everything else (sponsored campaigns, advanced recommendations) is explicitly labeled roadmap, not attempted half-way.

## 3. Usefulness & Originality — Target 8.5+/10

**Problem solved:** Every new Mini App starts at zero users, and every user has no reason to explore beyond the one app they already know. Pulse solves discovery *and* retention for the whole ecosystem at once, using only what already exists on-chain.

**Target audience, named specifically:** early Mini App developers who need a free acquisition channel, and active Nimiq Pay users who want a reason to explore more of the ecosystem.

**Originality:** nothing else in the ecosystem reads the chain to build a cross-app identity and discovery layer. It's a platform idea, not a single-purpose app, and it requires no permission from other teams since it only reads public data.

**Repeat value:** daily quests, streaks, and a growing XP/level system are specifically designed to bring the same wallet back day after day.

**Ecosystem value:** every additional Mini App that gets tagged makes Pulse more useful, and every Pulse user is a potential new user for every tagged app — a two-sided flywheel, not a closed loop.

## 4. Marketing, Distribution & Community — Target 8+/10

**Distribution is inside the product, not bolted on**
Because Pulse is a registry that other developers need to join to be discoverable, onboarding other builders *is* using the core feature — not a separate marketing task. An open "Submit your Mini App" flow inside Pulse lets any hackathon participant add their receiving address and app name in under a minute. Promoting Pulse to other builders is simultaneously recruiting them as users of the core feature.

**Content & storytelling plan (executed during the hackathon, not after)**
- Build-in-public updates every 1–2 days in the hackathon's community channel: one screenshot or short clip per update, one sentence on what changed and why.
- A 60–90 second demo video for submission, opening on the wow-moment first (wallet connects, profile populates instantly with real chain-derived achievements), then explaining the mechanic, then showing the registry/submission flow for other developers.
- A clear story hook for the submission page: *"Every Mini App starts at zero. We built the layer that fixes that — for every app, not just ours — and it only took your wallet's own history to prove it works."*

**Community engagement plan**
- Join hackathon community calls and actively ask other builders: "want your Mini App tagged in Pulse's discovery feed? Send me your receiving address." This is genuine community participation *and* direct registry growth at the same time.
- Comment on and try other teams' submissions — visible, good-faith community presence.

**User acquisition / unique users**
- Share the direct deeplink (`nimiqpay://miniapp?url=...`) in every progress post so people can tap and try it immediately.
- Run a small live incentive during the judging window: "first 20 wallets to complete today's quest get a limited on-chain badge" — cheap to build, and it directly drives unique-wallet count and NIM usage together.

**Submission quality**
Package like an app store listing: one headline sentence, 3–4 phone-mockup screenshots, the demo video, and a short description mirroring the one-sentence pitch at the top of this document.

**NIM usage — structurally guaranteed**
Because one daily quest always requires a real NIM transaction through Pulse's own tip jar, and reviews/achievements require proof-of-payment to tagged apps, NIM movement is a required part of using the app at all — not a bonus feature.

---

## MVP (Hackathon Scope)

✅ **Discovery Feed** — personalized recommendations powered by the open registry
✅ **Wallet Profile** — XP, achievements, levels, activity history
✅ **Daily Quests** — ecosystem challenges, including at least one real NIM transaction
✅ **Verified Reviews** — wallet-verified, gated by proof of payment

---

## Future Roadmap

**Phase 2**
- AI-powered recommendations
- Sponsored discovery campaigns
- Merchant promotions
- Cross-app collections
- Advanced analytics for developers

**Phase 3**
- Open API and SDK for Mini App developers
- Community governance
- Cross-chain support
- Developer insights dashboard
- Ecosystem leaderboards

---

## Business Impact for Nimiq

Pulse directly supports Nimiq's ecosystem goals by:
- Increasing Mini App discovery
- Improving daily active users
- Driving more NIM transactions
- Helping developers acquire users
- Creating repeat engagement through quests and achievements
- Building trust with wallet-verified reviews
- Strengthening network effects as more Mini Apps join

---

## Demo Flow (90 Seconds)

1. Open Nimiq Pulse.
2. Connect a wallet with one tap.
3. Pulse instantly generates a wallet profile from on-chain activity.
4. Show personalized Mini App recommendations.
5. Complete a daily quest with a real NIM transaction.
6. XP bar animates and a new achievement unlocks.
7. Leave a verified review for a Mini App.
8. Register a new Mini App through the developer registry.
9. End on the ecosystem flywheel: one user, one developer, one platform growing together.

---

## Rubric Self-Score (Honest, Target-Based)

| Category | Target Score | Why It Clears 8 |
|---|---|---|
| Design & UX | 8.5/10 | Explicit under-60-second onboarding, populated empty states, consistent visual system, mobile-first nav. |
| Functionality | 8/10 | Cached-first architecture, explicit graceful-failure states, scope disciplined to 4 complete features. |
| Usefulness & Originality | 8.5/10 | Named dual audience, genuinely novel on-chain mechanic, strong repeat-value loop. |
| Marketing & Distribution | 8/10 | Distribution structurally part of the product, concrete content/community plan, live incentive tied to the judging window. |
| **Overall** | **~8.25/10** | Every category backed by a concrete, executable answer — not just intentions. |

---

## Execution Checklist

- [ ] Build the 4 MVP features end-to-end, nothing half-done
- [ ] Seed the registry with 5–10 real addresses before demo day
- [ ] Record the 60–90 second demo video (wow-moment-first structure)
- [ ] Post build-in-public updates every 1–2 days during the hackathon
- [ ] Personally ask at least 5–10 other builders to submit their address to the registry
- [ ] Join at least one community call and speak/participate
- [ ] Ship the "first 20 wallets" live badge incentive before judging opens
- [ ] Package the final submission app-store-style: headline, screenshots, video, description

---

## Closing Statement

Every Mini App starts with the same challenge: no users. Every user faces the same challenge: no easy way to discover what's worth trying. Nimiq Pulse connects both sides with a shared layer for discovery, identity, reputation, and rewards. We didn't build another Mini App — we built the infrastructure that helps every Mini App grow.

---
---

# Part 2 — Nimiq Pulse v2

> Supersedes Part 1 where the two differ. Part 1 is retained for its fuller narrative, vision, and
> feature framing.

# Nimiq Pulse — v2
### The Growth Layer for Every Mini App, Built to Win the Full Rubric

---

## Why This Version Is Different

The first version was a strong *product* idea with a weak *engagement plan bolted on after the fact*. This version restructures the whole concept so that **distribution, community, and storytelling are part of the product mechanic itself** — not a marketing checklist you do separately. Every feature below either drives a rubric score directly or creates a natural reason for real usage, real promotion, and real community activity.

**One-sentence pitch:**
*"Nimiq Pulse is the open, on-chain growth layer for every Mini App — the first thing a new wallet installs, and the first thing every new Mini App developer joins, because both need it to be found."*

---

## 1. The Core Idea (unchanged principle, sharper mechanic)

Nimiq's ledger is public. Any Mini App that accepts NIM has a receiving address. Pulse maintains an **open registry** of tagged addresses and reads real wallet history against it — no cooperation needed from other teams, no simulated data.

On top of that real data, Pulse gives:
- Users a wallet-based profile, achievements, quests, and discovery feed.
- Developers a **free, built-in acquisition channel** the moment they submit their address.

That second half — the developer side — is the part that was missing before, and it's what turns this into something with a genuine distribution loop instead of a static app.

---

## 2. Design & UX — Target: 8.5+/10

**First impression / visual design**
- One consistent visual language: dark background, a single accent color used *only* for progress elements (XP bar, streak flame, level ring) — this makes the "growth" feeling visually obvious the instant the app opens.
- Wallet identity card is the hero of the home screen, always visible, never buried in a settings tab.

**Navigation**
- Four bottom tabs, thumb-reachable: **Profile · Discover · Quests · Reviews.** No hidden menus, no hamburger icon.

**Onboarding — under 60 seconds, explicitly designed for it**
1. Connect wallet (1 tap, native confirmation).
2. Pulse immediately checks the wallet's existing chain history against the registry — even a first-time user with *zero* prior activity sees a populated screen, not an empty state: a "Starter Mini Apps to try" list and one instantly-completable quest ("Try any app below — get 10 XP").
3. First quest completion → XP bar animates, first achievement pops. That's the "wow" moment, and it happens inside 60 seconds by design.

**Mobile experience**
- Every interactive element ≥44px tap target, no reliance on hover states, native-feeling transitions (slide, not full page reload).

---

## 3. Functionality — Target: 8+/10

**Core feature reliability**
- Wallet-to-registry matching is **cached and indexed**, not queried live against the chain on every screen load. First load fetches and caches; subsequent loads are instant, chain re-sync happens quietly in the background.

**Nimiq integration as the core, not a login step**
- Every core feature (XP, achievements, discovery, reviews) is derived from actual on-chain payments, and one **daily quest always requires a real NIM transaction inside Pulse itself** (e.g. the tip jar), so Nimiq Pay usage is structurally guaranteed, not incidental.

**Speed & performance**
- Cached-first architecture means the app is instantly usable even on a weak connection; a lightweight "syncing" indicator (not a blocking spinner) shows when fresh chain data is being pulled in.

**Error handling**
- If a chain query fails: show last-known cached state with a small non-blocking banner ("Couldn't refresh — showing your last synced data"), never a crash or blank screen.
- If a wallet has no history yet: show the starter-apps empty state (see onboarding), never a dead end.

**Completeness — scope discipline**
Ship exactly these four features, fully working, nothing half-built:
1. Discovery feed (registry + co-occurrence)
2. Daily quests (incl. one real NIM-transaction quest)
3. Wallet profile (XP, level, streak, achievements)
4. Verified reviews (gated by proof-of-payment)

Everything else (sponsored campaigns, advanced recommendations) is explicitly labeled "coming next," not attempted half-way.

---

## 4. Usefulness & Originality — Target: 8.5+/10

**Problem solved**
Every new Mini App starts at zero users, and every user has no reason to explore beyond the one app they already know. Pulse solves discovery *and* retention for the whole ecosystem at once — using only what already exists on-chain.

**Target audience — named specifically**
Two audiences, not one vague "everyone":
- **Early Mini App developers** who need a free acquisition channel before they can afford marketing.
- **Active Nimiq Pay users** who already transact and want a reason/reward to explore more of the ecosystem.

**Originality**
Nothing else in the ecosystem reads the chain to build a cross-app identity and discovery layer. It's a platform idea, not a single-purpose app — and it doesn't require anyone's permission to exist, since it only reads public data.

**Repeat value**
Daily quests, streaks, and a growing XP/level system are specifically designed to bring the same wallet back day after day — this is the single strongest "would someone open this more than once" case among typical hackathon submissions.

**Ecosystem value**
Every additional Mini App that gets tagged makes Pulse more useful, and every Pulse user is a potential new user for every tagged app. It's a two-sided flywheel, not a closed loop.

---

## 5. Marketing, Distribution & Community — Target: 8+/10 (this is the new core)

This is the section that was missing entirely before. It's now built into the concept, not just added as a to-do list.

### The distribution mechanic is *inside* the product
Because Pulse is a registry that other developers need to join to be discoverable, **onboarding other builders is part of using the product**, not a separate marketing task:
- An open "Submit your Mini App" flow inside Pulse itself — any hackathon participant can add their receiving address and app name in under a minute.
- This means promoting Pulse *to other builders* is also literally recruiting them as users of the core feature — one action serves both the community-engagement score and the unique-users score.

### Content & storytelling plan (execute during the hackathon, not after)
- **Build-in-public updates** every 1-2 days in the hackathon's community channel: one screenshot or 10-second clip per update, one sentence on what changed and why.
- **60-90 second demo video** for submission: open on the "wow" moment first (wallet connects, profile populates instantly with real chain-derived achievements), then explain the mechanic, then show the registry/submission flow for other developers.
- **One clear story hook** for the submission page: *"Every Mini App starts at zero. We built the layer that fixes that — for every app, not just ours — and it only took your wallet's own history to prove it works."*

### Community engagement plan (concrete actions, not a vague intention)
- Join hackathon community calls and actively ask other builders: "want your Mini App tagged in Pulse's discovery feed? Send me your receiving address." This is simultaneously genuine community participation *and* direct user/registry growth.
- Comment on and try other teams' submissions where relevant — visible, good-faith community presence.

### User acquisition / unique users
- Share the direct deeplink (`nimiqpay://miniapp?url=...`) in every progress post so people can tap and try it immediately, not just look at a screenshot.
- Run a small live incentive during the judging window: **"First 20 wallets to complete today's quest get a limited on-chain badge."** Cheap to build (a counter + flag on the profile), and it directly and honestly drives unique-wallet count and NIM usage at the same time.

### Submission quality
- Package like an app store listing: one headline sentence, 3-4 phone-mockup screenshots (not raw dev screenshots), the demo video, and a short description mirroring the one-sentence pitch at the top of this document.

### NIM usage — structurally guaranteed, not hoped for
Because one daily quest always requires a real NIM transaction through Pulse's own tip jar, and reviews/achievements require proof-of-payment to tagged apps, **NIM movement is a required part of using the app at all** — this isn't a bonus feature, it's load-bearing.

---

## 6. Rubric Self-Score (honest, target-based)

| Category | Target Score | Why it clears 8 |
|---|---|---|
| Design & UX | 8.5/10 | Explicit onboarding-under-60-seconds design, populated empty states, consistent visual system, mobile-first nav. |
| Functionality | 8/10 | Cached-first architecture, explicit graceful-failure states, scope disciplined to 4 complete features. |
| Usefulness & Originality | 8.5/10 | Named dual audience, genuinely novel on-chain mechanic, strong repeat-value loop. |
| Marketing & Distribution | 8/10 | Distribution is structurally part of the product (registry submission = user acquisition), concrete content/community plan, live incentive tied to judging window. |
| **Overall** | **~8.25/10** | Every category has a concrete, executable answer — not just intentions. |

---

## 7. Execution Checklist (do these, don't just plan them)

- [ ] Build the 4 MVP features end-to-end, nothing half-done.
- [ ] Seed the registry with 5-10 real addresses before demo day.
- [ ] Record the 60-90 second demo video (wow-moment-first structure).
- [ ] Post build-in-public updates every 1-2 days during the hackathon.
- [ ] Personally ask at least 5-10 other builders to submit their address to the registry.
- [ ] Join at least one community call and speak/participate.
- [ ] Ship the "first 20 wallets" live badge incentive before judging opens.
- [ ] Package the final submission app-store-style: headline, screenshots, video, description.

---
---

# Appendix — Where the specifications diverge from this brief

Four points where the derived documents deliberately depart from the brief above. Each is flagged here rather than silently applied, so the brief and the specs can be reconciled by decision rather than by accident.

### A. The MVP feature count

This brief lists a **four-feature** MVP (discovery, quests, profile, reviews) and places the Developer Registry outside it — while the entire distribution and community strategy depends on other builders submitting addresses through that registry. Both cannot hold.

[PRD.md](PRD.md) §9.1 recommends pulling the registry into the MVP as F5. It is the cheapest feature in the set — one form, one endpoint, one moderation flag — and without it the Marketing & Distribution score has no product behind it.

### B. "A single accent color"

The brief specifies one accent, used only for progress. The design system keeps that discipline for **progress** — the gold→orange gradient is the only gradient in the product and appears only on earned things — but adds a small semantic set: green for verified-on-chain, blue for discovery, red for danger.

Reason: verified reviews are the product's central trust claim, and a proof-of-payment mark that shares its colour with the XP bar cannot carry that meaning. See [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) P2.

### C. "A limited on-chain badge"

As described, the incentive is "a counter + flag on the profile" — that is a database record, not an on-chain artifact. Describing it as on-chain to judges is an overclaim a technical reviewer will catch, and it costs more credibility than the badge is worth.

[PRD.md](PRD.md) D3 offers two honest options: issue a real transaction, or rename it a verified badge anchored to the qualifying payment.

### D. Registry visibility timing

The brief promises submission "in under a minute" and automatic inclusion in discovery. The architecture adds a moderation gate before feed visibility ([software_architecture.md](software_architecture.md) ADR-6), because one malicious address in the feed would discredit the whole product.

Submission still takes under a minute; visibility follows review, and the confirmation copy says so plainly rather than leaving the developer guessing.

### E. One constraint the brief could not have known

The brief assumes wallet history can be read directly. **It cannot.** The Nimiq provider exposes only `listAccounts`, `sign`, `isConsensusEstablished`, `getBlockNumber`, and the `send*Transaction` family — no transaction history, no balances.

Since reading history against the registry *is* the core mechanic, Pulse requires its own backend with a Nimiq history node behind it. No public RPC endpoint was found working during investigation, so that node is on the critical path and must be started first. See [software_architecture.md](software_architecture.md) ADR-1 and ADR-2.