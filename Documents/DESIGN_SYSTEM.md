# Nimiq Pulse — Design System

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Baseline viewport | 375 × 667 (iPhone SE) |
| Theme | Dark-first. Light theme is a documented follow-up, not MVP. |
| Related | [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) · [ACCESSIBILITY.md](ACCESSIBILITY.md) |

---

## 1. Provenance

Colours and typefaces are taken from **Nimiq's own `nimiq-css` package** (v1.0.0-beta.162), not invented. The package defines its palette in OKLCH with `light-dark()` pairs; the hex values below are those values converted to sRGB.

Verification: the light-mode conversions resolve to Nimiq's published brand hexes exactly — blue `#0582ca`, orange `#fc8702`, gold `#e9b213`, red `#d94432`. Typefaces come from the package's `fonts.css`.

This matters for the pre-ship checklist item *"brand assets are sourced from the Nimiq Design Kit"*, and it makes Pulse feel native inside Nimiq Pay rather than like a stranger's app.

---

## 2. Colour

### 2.1 Surfaces

Three levels only. More depth than this reads as clutter on a 375 px screen.

| Token | Hex | Use |
| --- | --- | --- |
| `--surface-base` | `#1f2348` | App background (Nimiq `darkblue`) |
| `--surface-raised` | `#272b52` | Cards, sheets, the tab bar |
| `--surface-inset` | `#17182b` | Wells, inputs, code and address blocks (Nimiq `darkerblue`) |
| `--surface-earned` | `#2b2743` | Warm-shifted card behind earned content only |

`--surface-earned` is the one temperature break in the system: cool for network content, subtly warm for what the user earned. It is the quietest possible way to make progress feel different without another accent.

### 2.2 Text

| Token | Hex | Use | Contrast on base |
| --- | --- | --- | --- |
| `--text-primary` | `#ffffff` | Headings, values, key labels | 13.6:1 |
| `--text-body` | `#d1d1d5` | Body copy | 9.6:1 |
| `--text-muted` | `#8b8b95` | Secondary, captions, timestamps | 4.6:1 |
| `--text-disabled` | `#515260` | Disabled only — never for readable content | 1.9:1 |

Everything except `--text-disabled` clears WCAG AA for its size class. `--text-muted` is the floor for real content.

### 2.3 Semantic accents

Each owns exactly one job. See [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) P2 for the rule.

| Token | Hex | Owns |
| --- | --- | --- |
| `--progress-from` | `#ffc43b` | Earned progress, gradient start (Nimiq `gold`) |
| `--progress-to` | `#ff9900` | Earned progress, gradient end (Nimiq `orange`) |
| `--verified` | `#24cca2` | Proof-of-payment, confirmed on-chain (Nimiq `green`) |
| `--discover` | `#0ca6fe` | New, recommended, primary action (Nimiq `blue`) |
| `--rare` | `#8f3fd5` | Achievement rarity, sparingly (Nimiq `purple`) |
| `--danger` | `#ff5c48` | Errors and destructive actions (Nimiq `red`) |
| `--pending` | `#8b8b95` | Confirming, syncing, indeterminate |

```css
--gradient-progress: linear-gradient(135deg, #ffc43b 0%, #ff9900 100%);
```

**This gradient is the only gradient in the product.** It appears on the level ring, the XP bar fill, and the streak indicator. Nowhere else. If it shows up on a button, that is a bug.

### 2.4 Borders and overlays

| Token | Value | Use |
| --- | --- | --- |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Card edges, dividers |
| `--border-strong` | `rgba(255,255,255,0.16)` | Inputs, focus containers |
| `--overlay-scrim` | `rgba(15,17,35,0.72)` | Behind sheets and dialogs |

Tints for status backgrounds are the accent at 12% over the surface — e.g. `color-mix(in srgb, var(--verified) 12%, transparent)`.

---

## 3. Typography

**Mulish** (variable, 200–1000) for all interface text — Nimiq's brand face, so Pulse reads as part of the wallet.
**Fira Mono** for addresses, transaction hashes, and NIM amounts — Nimiq's brand mono. The monospace texture is a deliberate trust signal: it says *this is real chain data*, and it makes addresses scannable.

```
npm i @fontsource-variable/mulish @fontsource/fira-mono
```

Self-hosted, not CDN-loaded: LAN dev runs over plain HTTP and the app must work offline from cache.

### 3.1 Scale

| Token | Size / line-height | Weight | Use |
| --- | --- | --- | --- |
| `--type-display` | 34 / 38 | 800 | XP totals, level number — the one big number per screen |
| `--type-title` | 22 / 28 | 800 | Screen titles |
| `--type-heading` | 17 / 24 | 700 | Card titles, section heads |
| `--type-body` | 15 / 22 | 400 | Body copy |
| `--type-label` | 13 / 18 | 600 | Buttons, tab labels, field labels |
| `--type-caption` | 12 / 16 | 500 | Timestamps, helper text |
| `--type-micro` | 11 / 14 | 700, +0.08em, uppercase | Badge and chip text only |
| `--type-mono` | 13 / 18 | 400, Fira Mono | Addresses, hashes, amounts |

Only **one** `--type-display` element per screen. If two compete, neither reads as the answer to "what am I looking at?"

### 3.2 Rules

- Sentence case everywhere except `--type-micro` chips.
- Numbers use `font-variant-numeric: tabular-nums` so values don't jitter as they animate.
- Addresses truncate as `NQ16 085S…6GKB` — first two groups, ellipsis, last group. Never a raw 36-character string in a list.
- Never below 12 px for anything a user must read.

---

## 4. Spacing and layout

8 px base scale: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`.

| Token | Value |
| --- | --- |
| `--space-screen-x` | 16 px — horizontal screen gutter |
| `--space-card` | 16 px — card padding |
| `--space-card-gap` | 12 px — between stacked cards |
| `--space-section` | 24 px — between sections |
| `--space-tabbar` | 64 px + safe-area-inset-bottom |

Content column is `min(100%, 560px)` centred, so the app is comfortable in a WebView and doesn't stretch awkwardly if opened wider.

**Safe areas are mandatory.** Every screen honours `env(safe-area-inset-*)`; the tab bar adds bottom inset to its own height. Skipping this puts controls under the home indicator on modern phones — an instant "doesn't feel native" failure.

### 4.1 Radius and elevation

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 8 px | Chips, badges, inputs |
| `--radius-md` | 14 px | Cards, buttons |
| `--radius-lg` | 20 px | Sheets, the identity card |
| `--radius-full` | 999 px | Pills, avatars, the ring |

Elevation is expressed with surface level and border, not shadow. Exactly one shadow exists, for elements that float above content:

```css
--shadow-float: 0 8px 24px rgba(10, 12, 30, 0.4);
```

---

## 5. Components

### 5.1 Pulse Ring — the signature

The identity card's level indicator. A `--radius-full` ring with two layers:

- **Ring track** — `--border-subtle`, 6 px.
- **Ring progress** — `--gradient-progress`, 6 px, `stroke-linecap: round`, swept clockwise from 12 o'clock, filled to `xpIntoLevel / xpForLevel`.
- **Interior waveform** — an SVG polyline generated from the wallet's last 30 days of indexed interactions. One vertex per day; amplitude is that day's interaction count, normalised to the window maximum. Stroke `--verified`, 2 px, round joins.
- **Centre** — the level number in `--type-display`.

Sizes: 120 px on the identity card, 40 px in the compact header bar, 24 px as a list glyph (ring only, waveform omitted below 40 px — it becomes noise).

A wallet with no activity renders a flat centre line, not an empty ring. That is a real reading, and it visibly fills in as the user earns.

### 5.2 Buttons

| Variant | Fill | Text | Use |
| --- | --- | --- | --- |
| Primary | `--discover` | `#ffffff` | The one main action per screen |
| Secondary | transparent, `--border-strong` | `--text-primary` | Alternatives |
| Ghost | transparent | `--text-body` | Tertiary, inline |
| Danger | transparent, `--danger` border | `--danger` | Destructive |

Height 48 px (min 44). Radius `--radius-md`. Full width on primary actions in a mobile column. Label is a verb phrase naming the outcome — "Send tip", never "Submit". Pressed state is a 0.97 scale over 100 ms; there is no hover state.

Disabled buttons state **why** in adjacent helper text. A dead control with no explanation is a dead end (P3).

### 5.3 Cards

`--surface-raised`, `--radius-md`, `--space-card` padding, `--border-subtle` hairline. Earned content sits on `--surface-earned`.

### 5.4 XP bar

Track `--surface-inset`, height 8 px, `--radius-full`. Fill `--gradient-progress`, width-animated over 600 ms `cubic-bezier(0.22, 1, 0.36, 1)`. The label above reads `1 240 / 1 500 XP` in `--type-caption` with tabular numerals.

### 5.5 Achievement tile

Square, `--radius-md`. **Unlocked:** `--surface-earned`, full-colour icon, name in `--type-label`, earned date in `--type-caption`, tappable to reveal the source transaction. **Locked:** `--surface-raised`, icon at 30% opacity, and the unlock condition stated in plain words. Never a mystery silhouette (P8).

### 5.6 Verified badge

A `--verified` chip with a check glyph and `--type-micro` text "Verified payer". Tapping opens the transaction that proves it. This badge is the product's trust claim made visible, so it never appears without a real transaction behind it.

### 5.7 Quest row

Left: type icon in a 40 px tinted circle. Centre: title in `--type-label`, reward in `--type-caption`. Right: state.

| State | Right side |
| --- | --- |
| Available | Primary button, or a chevron for navigational quests |
| Confirming | `--pending` pill "Confirming…" with a 2 px indeterminate bar |
| Completed | `--verified` check and `+40 XP` |

### 5.8 App card (Discover)

App icon 48 px · name in `--type-heading` · one-line description in `--type-body`, clamped to one line · a reason chip (`--discover` tint) · distinct-payer count and rating in `--type-caption` · "Open" primary button that fires the deeplink.

The reason chip is load-bearing for credibility: a recommendation with a stated reason is trusted, one without reads as an ad.

### 5.9 Banner

Full-width, `--radius-md`, above content and below the header, dismissible where non-critical.

| Kind | Tint | Example |
| --- | --- | --- |
| Stale | `--pending` | "Couldn't refresh — showing your last synced data" |
| Info | `--discover` | "Chain data is catching up" |
| Error | `--danger` | "We couldn't confirm that payment yet" |

Banners never block interaction and never cover content.

### 5.10 Tab bar

Fixed bottom, `--surface-raised`, top hairline, 64 px + safe-area inset. Four items, each an icon plus a `--type-label`. **Labels are always visible** — icon-only navigation fails "can a new user figure it out without instructions?" Active item is `--discover` with a filled icon; inactive is `--text-muted` with an outline icon.

---

## 6. Motion

| Token | Duration | Easing | Use |
| --- | --- | --- | --- |
| `--motion-fast` | 120 ms | `ease-out` | Press feedback, chips |
| `--motion-base` | 220 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Tab and view transitions |
| `--motion-celebrate` | 600 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | XP fill, achievement entry |

The achievement unlock is the only theatrical moment: the tile scales 0.8 → 1.0 with a fade while the ring pulses once. It fires at most once per event and never loops.

Under `prefers-reduced-motion: reduce`, all durations collapse to 0 and the achievement appears without movement. The information is never carried by motion alone.

---

## 7. Token reference

```css
:root {
  /* surfaces */
  --surface-base: #1f2348;
  --surface-raised: #272b52;
  --surface-inset: #17182b;
  --surface-earned: #2b2743;

  /* text */
  --text-primary: #ffffff;
  --text-body: #d1d1d5;
  --text-muted: #8b8b95;
  --text-disabled: #515260;

  /* semantic accents — one job each */
  --progress-from: #ffc43b;
  --progress-to: #ff9900;
  --gradient-progress: linear-gradient(135deg, #ffc43b 0%, #ff9900 100%);
  --verified: #24cca2;
  --discover: #0ca6fe;
  --rare: #8f3fd5;
  --danger: #ff5c48;
  --pending: #8b8b95;

  /* lines */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --overlay-scrim: rgba(15, 17, 35, 0.72);
  --shadow-float: 0 8px 24px rgba(10, 12, 30, 0.4);

  /* spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;

  /* radius */
  --radius-sm: 8px; --radius-md: 14px; --radius-lg: 20px; --radius-full: 999px;

  /* motion */
  --motion-fast: 120ms;
  --motion-base: 220ms;
  --motion-celebrate: 600ms;

  /* touch */
  --tap-min: 44px;
}
```

---

## 8. Review checklist

Before any UI merges:

- [ ] The gold gradient appears only on earned progress
- [ ] Exactly one `--type-display` element on the screen
- [ ] Every tappable element is ≥44 px
- [ ] No horizontal scroll at 375 px
- [ ] Safe-area insets honoured top and bottom
- [ ] Every state designed: populated, empty, loading-from-cache, stale, error
- [ ] No hover-only affordances
- [ ] `prefers-reduced-motion` respected
- [ ] Text contrast ≥4.5:1 for body, ≥3:1 for large
- [ ] Addresses truncated and set in Fira Mono
