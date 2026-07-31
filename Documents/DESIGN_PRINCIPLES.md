# Nimiq Pulse — Design Principles

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Applies to | All UI decisions in the Mini App |
| Related | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [BRAND_AND_LOGO.md](BRAND_AND_LOGO.md) · [COPY_GUIDE.md](COPY_GUIDE.md) |

---

## 1. The design brief in one line

Pulse must look like **infrastructure you can trust with a wallet**, while feeling like **something you want to open tomorrow**. Those two pull in opposite directions, and every decision here is about holding both.

---

## 2. On the reference screenshot

The visual reference supplied for this project is a Bitcoin lottery site: dark chrome, mascot character, competing neon gradients, coin-shower illustrations, jackpot framing, live chat rail.

**What we take from it:** the gamified energy is right. Progress that is visible at a glance, reward moments that feel like moments, badge and achievement chips, a character-led identity, and colour used to make "you are growing" obvious the second the app opens. Pulse is an XP-and-quests product; it should not look like a spreadsheet.

**What we reject, and why:** the rubric's first question is *"Does the Mini App look professional and trustworthy at first glance?"* Pulse runs **inside a payments wallet**, one tap from the user's real money, and asks them to sign a message before doing anything. A casino aesthetic is the single fastest way to fail that question — in a wallet context it reads as *scam*, not as *fun*. It would also clash with the host app it is embedded in.

Concretely, we do not ship: neon glow on every surface, more than one gradient family, coin/treasure imagery, jackpot or odds language, a chat rail, or a signup wall. Slot-machine visual grammar is off the table permanently.

**The resolution:** get the energy from *motion, progression, and celebration* rather than from *chrome*. A calm dark surface with one disciplined warm gradient reserved for earned progress reads as both trustworthy and alive. Excitement lives in the moment XP lands, not in the wallpaper.

---

## 3. Principles

### P1 — Trust is the first frame

The first screen must answer "is this legitimate?" before it answers anything else. That is bought with restraint: generous spacing, a single accent doing one job, real data with verifiable provenance, and no claim the product cannot back.

**In practice:** every number links to its source. Achievements show the transaction that earned them. The connect screen states what Pulse reads and what it stores, before the first approval — not in a footer.

### P2 — Colour carries meaning, never decoration

The palette is a semantic system, not a mood board. Each hue owns exactly one job, and nothing borrows another's colour for emphasis.

| Colour | Owns | Never used for |
| --- | --- | --- |
| Gold → orange gradient | **Earned progress** — XP, level ring, streak | Buttons, links, headings, backgrounds |
| Green | **Verified on-chain** — proof-of-payment marks, confirmed states | Generic success, decoration |
| Blue | **Discovery** — new, recommended, primary actions | Progress, verification |
| Purple | **Achievement rarity** — sparingly | Anything routine |
| Red | **Danger and failure** only | Emphasis, urgency marketing |

This is what makes the "growth" feeling legible: when warm gold appears **only** on things the user earned, the eye learns the rule within one session and the reward moment lands harder.

### P3 — Never a dead end

Every screen has a designed populated state. A wallet with zero history is not an edge case to handle — it is the **most important** state in the product, because it is the state every judge and every new user sees first.

No empty list ships. No blank screen ships. A failure renders as content plus explanation, never as absence.

### P4 — Instant, then fresh

The UI paints from cache immediately and upgrades in the background. Freshness never gates rendering. Loading is communicated by a small inline pill, never a blocking spinner, never a full-screen overlay.

A user on a bad connection in a demo room must still see a working app.

### P5 — One approval, one intent

A native approval dialog is the most expensive thing the UI can spend. It interrupts, it demands a decision, and too many in a row reads as suspicious. Every dialog follows a deliberate tap on a control whose label says exactly what will happen. Never on page load. Never two in a row.

This is why login derives the address from the signature instead of calling `listAccounts()` first: one dialog, not two.

### P6 — The thumb is the cursor

Designed for one-handed use on a 375 px screen. Primary navigation sits at the bottom. Tap targets are ≥44 px. Nothing depends on hover. Nothing scrolls horizontally. Destructive or irreversible actions are never placed where a thumb rests.

### P7 — Motion explains, then celebrates

Two kinds of motion, and nothing else:
- **Explanatory** — transitions that show where something came from (a tab slide, a card expanding into detail). Fast, 150–250 ms.
- **Celebratory** — the XP bar filling and an achievement arriving. This one is allowed to be theatrical, because it is the product's payoff and it happens rarely.

Ambient motion, looping animation, and decorative parallax do not ship. `prefers-reduced-motion` removes the celebration's movement while keeping its meaning.

### P8 — Earned, not claimed

Visual weight follows evidence. A verified reviewer gets a mark; an unverified one cannot exist. A locked achievement shows its unlock condition rather than a mystery silhouette, because hiding requirements is a dark pattern and Pulse's whole pitch is transparency.

---

## 4. The signature element

Every product should have one thing people remember. For Pulse it is the **Pulse Ring**.

The wallet identity card's level indicator is not a plain progress circle. It is a ring whose interior carries a waveform generated from that wallet's own recent on-chain activity — a real trace, not decoration. Level fills the ring; the wallet's history draws the line inside it.

This works because:
- It is derived from the subject. On-chain activity *is* the product.
- It is unique per wallet, so the identity card is genuinely personal — no two look alike.
- It is honest. The waveform is real indexed data, satisfying P1 and the "real data or nothing" product principle.
- It scales down to the app icon, so the logo and the core UI primitive are the same idea.

Boldness is spent here. Everything around it stays quiet.

---

## 5. What "professional and trustworthy" means concretely

The rubric asks four questions. Here is what each one demands of the design, and where it is answered.

| Rubric question | Design commitment | Where |
| --- | --- | --- |
| Professional and trustworthy at first glance? | One accent family, disciplined spacing, real data with provenance, no casino signals, disclosure before the first approval | P1, P2, §2 |
| Colours, typography, layout clean and consistent? | Nimiq's own palette and typefaces (Mulish, Fira Mono), an 8 px spacing scale, three surface levels, one radius scale | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| Can a new user figure it out without instructions? | Four labelled bottom tabs, no hidden menus, verbs on every button, no jargon in primary copy | [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), [COPY_GUIDE.md](COPY_GUIDE.md) |
| Does it feel native and responsive on a phone? | Bottom nav, safe-area insets, 44 px targets, 375 px baseline, native-feeling transitions, no horizontal scroll | P6, [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| Zero to using it in under 60 seconds? | One approval to log in, populated first screen even with no history, an immediately completable starter quest | [USER_FLOWS.md](USER_FLOWS.md) §2 |

---

## 6. Anti-patterns

Rejected on sight in review:

- A second gradient family, or the gold gradient on anything not earned
- A loading spinner that blocks content the cache already has
- An empty state that says "Nothing here yet" without an action
- An approval dialog raised without a preceding tap
- A modal that cannot be dismissed, or a signup wall
- Copy that sells ("Amazing rewards await!") instead of telling ("Send a tip — earn 40 XP")
- Mystery achievements with hidden conditions
- Hover-dependent affordances
- Any element under 44 px that is meant to be tapped
- Mock or placeholder data in any build
