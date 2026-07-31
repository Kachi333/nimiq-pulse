# Nimiq Pulse — Brand and Logo

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Assets | `nimiq-pulse/public/logo-mark.svg` · `logo-horizontal.svg` · `favicon.svg` |
| Related | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) |

---

## 1. The idea

The mark is the product's core primitive, not a decoration applied on top of it.

**A ring with a pulse trace through it.** The ring is earned progress — the same gold-to-orange gradient that fills the level ring in the identity card. The trace is real on-chain activity — the same waveform that renders inside every wallet's Pulse Ring.

So the logo *is* the UI. A user who has seen their own identity card recognises the app icon instantly, and the icon explains the product before a word is read: **a signal, and growth around it.**

This also solves the mascot question. The reference material used a fox character; Pulse does not need one, because the user's own wallet ring is the character. It is personal, unique to them, and generated from truth rather than drawn.

---

## 2. Assets

| File | Size | Use |
| --- | --- | --- |
| `logo-mark.svg` | 64 × 64 | App icon, avatars, tight spaces, anywhere under 120 px wide |
| `logo-horizontal.svg` | 232 × 64 | Headers, the connect screen, README, submission materials |
| `favicon.svg` | 64 × 64 | Browser tab; includes its own `#1f2348` rounded-square backplate |

The mark and horizontal versions draw the trace with `currentColor`, so they adapt to their context:

```html
<img src="/logo-mark.svg" alt="Nimiq Pulse" width="40" height="40">

<!-- inline, colour-adaptive -->
<span style="color: var(--text-primary)"><!-- inlined SVG --></span>
```

On dark surfaces the trace is white. On light surfaces set `color: #1f2348`. The gold ring is fixed in both, because it is a brand constant.

---

## 3. Construction

```
64 × 64 viewBox

Ring       circle  cx 32  cy 32  r 25   stroke-width 4
                   gradient #ffc43b → #ff9900
                   dasharray 139 18, rotated −96°
                   → an ~89% arc with a gap at the top

Trace      M12 32 h9 l4 -10 l5 21 l5 -16 l4 5 h11
                   stroke-width 3.5, round caps and joins, currentColor
```

The ring gap is deliberate. A closed circle reads as static and finished; an open arc reads as *in progress*, which is the entire product. It also gives the mark an orientation so it never looks like a generic loading spinner.

---

## 4. Usage rules

**Do**
- Keep clear space of at least 25% of the mark's width on all sides.
- Scale below 40 px using `logo-mark.svg` — its proportions are tuned for it.
- Use `favicon.svg` when a background is required.
- Pair with the wordmark set in Mulish 800.

**Don't**
- Recolour the ring. Gold-to-orange is the brand constant.
- Apply the ring gradient to anything else in the UI (see [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) P2).
- Add glow, bevel, drop shadow, or outline.
- Rotate, skew, or stretch. The gap sits at the top; that is fixed.
- Place on a busy photographic background without the `favicon.svg` backplate.
- Set the wordmark in any face other than Mulish.

---

## 5. Naming

**"Nimiq Pulse"** on first mention in any surface. **"Pulse"** thereafter, including in-app. The wordmark shows "Pulse" alone because it always appears in a Nimiq Pay context, where the Nimiq prefix is redundant.

Never "NimiqPulse", "NIMIQ PULSE", or "nimiq pulse".

---

## 6. Relationship to Nimiq's own brand

Pulse is a third-party Mini App, not a Nimiq product. The distinction has to stay visible.

- Pulse uses Nimiq's **palette and typefaces** so it feels native inside the wallet.
- Pulse does **not** use the Nimiq hexagon, the Nimiq wordmark, or any Nimiq logo lockup in its own branding — that would imply endorsement.
- Where a Nimiq logo is genuinely needed (crediting the chain, linking to docs), it comes from the [Nimiq Design Kit](https://nimiq.dev/raw/design-kit/index.md) unmodified, per pre-ship checklist item 9.

The design kit offers the hexagon (colour and mono) and horizontal lockups (colour, white, mono); the hexagon is the correct choice for icon-sized credits.

---

## 7. Tone

Pulse sounds like **a well-built instrument, not a carnival**.

| Trait | Sounds like | Not like |
| --- | --- | --- |
| Direct | "Send a tip — earn 40 XP" | "Unlock amazing rewards!" |
| Evidenced | "Verified payer" with a linked transaction | "Trusted user ⭐" |
| Calm | "Couldn't refresh — showing your last synced data" | "Oops! Something went wrong 😬" |
| Plain | "Pay this app first to leave a review" | "Complete on-chain verification to unlock UGC" |

Full guidance in [COPY_GUIDE.md](COPY_GUIDE.md).
