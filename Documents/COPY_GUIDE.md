# Nimiq Pulse — Copy Guide

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Source of truth | `src/i18n/en.ts` — every user-facing string lives there |
| Related | [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) · [ERROR_HANDLING.md](ERROR_HANDLING.md) · [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) §7 |

---

## 1. Why copy is a trust surface here

Pulse asks a user to sign a message inside their wallet within fifteen seconds of opening. Language is most of what they have to judge us on at that moment.

Overselling reads as a scam. Vagueness reads as evasion. Jargon reads as indifference. **Plain, specific, calm language is the cheapest trust the product can buy** — and the fastest to lose.

---

## 2. Voice

Pulse sounds like a well-built instrument: precise, quiet, and useful. It does not hype, apologise, or perform enthusiasm.

| We are | We are not |
| --- | --- |
| Direct | Salesy |
| Specific | Vague |
| Calm | Alarmed or chirpy |
| Plain | Technical for its own sake |
| Honest about limits | Confident about things we can't prove |

**No emoji in interface copy.** No exclamation marks. Sentence case everywhere except badge chips.

---

## 3. Rules

### 3.1 Buttons name their outcome

A button says what happens when it is pressed, and the confirmation echoes it.

| Do | Don't |
| --- | --- |
| Send tip → "Tip sent" | Submit → "Success!" |
| Connect wallet | Get started |
| Publish review | Save |
| Submit app | Apply now |
| Open app | Go |

The same action keeps the same verb through the whole flow. That consistency is what lets a new user navigate without instructions.

### 3.2 Say the number

Specific beats impressive.

| Do | Don't |
| --- | --- |
| "Send a tip — earn 40 XP" | "Earn rewards!" |
| "Paid by 42 wallets" | "Popular" |
| "Reviewed by 7 verified payers" | "Highly rated" |
| "Usually within a few hours" | "Soon" |
| "280 characters left" | "Keep it short" |

### 3.3 Empty states offer a route

An empty state is an instruction, never a report of absence.

| Screen | Copy |
| --- | --- |
| No history yet | "Starter Mini Apps to try" + a completable quest |
| No reviewable apps | "Pay a Mini App to unlock reviews" + link to Discover |
| No achievements | Locked tiles showing their unlock conditions |
| Empty activity | "Payments to listed apps will appear here" |

Never "Nothing here yet", never "No data", never a shrug illustration.

### 3.4 Errors say what happened and what now

Two clauses, no apology, no blame. See [ERROR_HANDLING.md](ERROR_HANDLING.md) §8.

| Do | Don't |
| --- | --- |
| "Couldn't refresh — showing your last synced data" | "Oops! Something went wrong 😬" |
| "Payment cancelled — the quest is still open" | "Transaction failed!" |
| "Pay this app first to leave a verified review" | "Unauthorized" |
| "That doesn't look like a Nimiq address" | "Invalid input" |
| "Nimiq Pay is still syncing" | "Consensus not established" |

A declined approval is **not** an error. "No problem — connect whenever you're ready" is the whole message.

### 3.5 Never claim what we can't prove

The product's pitch is verifiable truth. Copy must not undercut it.

| Do | Don't |
| --- | --- |
| "Verified payer" (with the transaction linked) | "Trusted user" |
| "Popular with wallets like yours" | "Recommended for you" (no stated reason) |
| "We review new apps before they appear" | "Instantly listed" |
| "Off-chain badge, anchored to your qualifying payment" | "On-chain badge" (if it isn't one) |

That last row matters for judging: describing a database flag as on-chain is the kind of overclaim a technical reviewer will catch, and it costs more credibility than the badge is worth.

### 3.6 Disclose before you ask

The Connect screen states what Pulse reads and stores **above** the button, in plain words:

> Pulse reads your public payment history to find Mini Apps you'll like. It only stores payments to listed apps.

Not in a footer. Not behind a link. Not after the dialog.

---

## 4. Vocabulary

One word per concept, forever. See [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) §7 for the full table.

**app** · **interaction** · **XP** · **quest** · **verified payer** · **submit** · **connect wallet**

Words we never use in the interface: *dApp, blockchain, ledger, hash, nonce, consensus (except in "Nimiq Pay is still syncing"), gamification, leverage, seamless, unlock amazing.*

"Transaction" appears only where a user taps to see the actual on-chain record — the one place the technical word is the honest one.

---

## 5. Numbers and units

| Thing | Format | Example |
| --- | --- | --- |
| NIM | Thin-space thousands, up to 2 decimals, unit after | `1 250.50 NIM` |
| XP | Integer, thin-space thousands | `1 240 XP` |
| Progress | Current of total | `1 240 / 1 500 XP` |
| Address | First two groups, ellipsis, last group | `NQ16 085S…6GKB` |
| Recent time | Relative under 7 days | `2 hours ago` |
| Older time | Absolute | `24 Jul 2026` |
| Counts | Never abbreviate below 10 000 | `42 wallets`, `12.4k wallets` |

Luna never appears in the interface. It is an internal unit; users see NIM.

---

## 6. Core strings

| Key | String |
| --- | --- |
| `connect.title` | Your wallet, across every Mini App |
| `connect.body` | Pulse finds Mini Apps worth trying, based on what wallets like yours actually pay for. |
| `connect.disclosure` | Pulse reads your public payment history to find Mini Apps you'll like. It only stores payments to listed apps. |
| `connect.cta` | Connect wallet |
| `connect.declined` | No problem — connect whenever you're ready. |
| `notInPay.title` | Open this in Nimiq Pay |
| `notInPay.body` | Pulse works with your wallet, so it needs to be opened from inside Nimiq Pay. |
| `profile.level` | Level {n} |
| `profile.xpProgress` | {current} / {total} XP |
| `profile.streak` | {n}-day streak |
| `profile.activityEmpty` | Payments to listed apps will appear here. |
| `discover.starterLabel` | Starter Mini Apps to try |
| `discover.reason.similar` | Popular with wallets like yours |
| `discover.reason.trending` | Trending this week |
| `discover.reason.new` | New this week |
| `discover.submitCta` | Submit your Mini App |
| `quests.title` | Today's quests |
| `quests.confirming` | Confirming… |
| `quests.cancelled` | Payment cancelled — the quest is still open. |
| `quests.unconfirmed` | We couldn't confirm that payment yet. It may still land. |
| `reviews.gate` | Pay this app first to leave a verified review. |
| `reviews.verified` | Verified payer |
| `submit.confirmation` | Submitted. We review new apps before they appear in Discover, usually within a few hours. You'll earn the Community Builder achievement once someone pays your app. |
| `banner.stale` | Couldn't refresh — showing your last synced data. |
| `banner.indexing` | Chain data is catching up. |
| `session.expired` | Reconnect to keep earning. |

---

## 7. Localisation

Copy is written for translation from day one, even though MVP ships English only.

- Interpolate values, never concatenate sentences: `"Level {n}"`, not `"Level " + n`.
- No sentence built from fragments in code — word order differs by language.
- Allow 35% expansion in layout; German and Finnish will use it.
- Language comes from `window.nimiqPay.language`, never `navigator.language` — the device locale can differ from the user's Nimiq Pay setting.

---

## 8. Checklist

- [ ] Every string in `i18n/en.ts`, none hard-coded in a template
- [ ] Buttons named for their outcome; confirmations echo the verb
- [ ] No emoji, no exclamation marks, sentence case
- [ ] Every empty state offers an action
- [ ] Every error states what happened and what now
- [ ] Declined approvals are not styled or worded as errors
- [ ] No claim the product cannot demonstrate
- [ ] Disclosure sits above the Connect button
- [ ] One word per concept, matching §4
