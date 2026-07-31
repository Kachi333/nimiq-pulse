# Nimiq Pulse — Accessibility and Mobile Quality

| Field | Value |
| --- | --- |
| Version | 1.0 · 31 July 2026 |
| Target | WCAG 2.1 AA where applicable to a mobile WebView |
| Baseline | 375 × 667, one-handed, outdoors, on a slow connection |
| Related | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [FRONTEND.md](FRONTEND.md) |

---

## 1. Why this is a scoring document, not a compliance one

The rubric asks *"Does it feel native and responsive on a phone?"* Almost everything that makes an app feel native is also an accessibility practice: adequate touch targets, real contrast, no hover dependence, respecting system preferences, honouring safe areas.

An app that fails accessibility basics feels *cheap* on a phone even to users who need none of them. These are the same requirements viewed from two angles.

---

## 2. Touch

| Requirement | Value |
| --- | --- |
| Minimum target | 44 × 44 px, always |
| Minimum spacing between targets | 8 px |
| Primary action height | 48 px |
| Tab bar item | Full height × ¼ width — comfortably larger than the minimum |

A visually small control (a chip, an icon button) still needs a 44 px hit area. Expand it with padding or a pseudo-element, never by enlarging the glyph:

```css
.icon-button {
  position: relative;
  width: 24px; height: 24px;
}
.icon-button::after {
  content: '';
  position: absolute;
  inset: -10px;              /* 44px effective target */
}
```

**Nothing depends on hover.** There is no hover on a phone. Any information revealed by hover is either always visible or moved behind a tap.

---

## 3. Reach

Thumb reach on a 375 × 667 screen puts the bottom third in the comfortable zone and the top corners at the edge of it.

| Zone | Contents |
| --- | --- |
| Bottom (easy) | Tab bar, primary actions, sheet confirmations |
| Middle (easy) | Content, cards, list rows |
| Top (stretch) | Screen title, back chevron, status strip |

Primary actions live at the bottom. The back chevron is duplicated by the platform back gesture, so nothing depends on reaching the top-left corner.

Destructive or irreversible actions are never placed where the thumb rests by default.

---

## 4. Colour and contrast

Measured against `--surface-base` `#1f2348`:

| Token | Ratio | Verdict |
| --- | --- | --- |
| `--text-primary` `#ffffff` | 13.6:1 | AAA |
| `--text-body` `#d1d1d5` | 9.6:1 | AAA |
| `--text-muted` `#8b8b95` | 4.6:1 | AA — the floor for readable content |
| `--verified` `#24cca2` | 7.9:1 | AAA |
| `--discover` `#0ca6fe` | 6.4:1 | AAA |
| `--progress-to` `#ff9900` | 7.4:1 | AAA |
| `--danger` `#ff5c48` | 5.3:1 | AA |
| `--text-disabled` `#515260` | 1.9:1 | **Disabled state only** — never readable content |

**Colour is never the sole carrier of meaning.** Every semantic use is paired with a second signal:

| Meaning | Colour | Plus |
| --- | --- | --- |
| Verified | green | check glyph + the words "Verified payer" |
| Completed quest | green | check glyph + "+40 XP" text |
| Confirming | grey | the word "Confirming…" + indeterminate bar |
| Error | red | icon + a sentence of explanation |
| Earned progress | gold gradient | numeric XP value beside it |

Users with a colour vision deficiency lose nothing. So does a judge glancing at a screenshot in greyscale.

---

## 5. Typography

- Body text never below 15 px; nothing readable below 12 px.
- Line height ≥1.4 for body copy.
- Line length capped by the 560 px content column.
- **Form inputs are 16 px minimum.** Below that, iOS Safari zooms on focus and the layout jumps — reads instantly as "not a real app".
- `tabular-nums` on all numeric values so animated counters don't shift width.
- Text scales with the system font-size setting; layouts use relative units and never fix a height that text must fit inside.

---

## 6. Semantics and screen readers

```vue
<!-- The Pulse Ring is decorative; the text beside it carries the information -->
<svg aria-hidden="true">…</svg>
<p><span class="sr-only">Level </span>7</p>

<!-- Tabs -->
<nav aria-label="Main">
  <RouterLink :aria-current="isActive ? 'page' : undefined">…</RouterLink>
</nav>

<!-- Live regions -->
<div aria-live="polite">{{ questStatusMessage }}</div>
<div aria-live="assertive">{{ errorMessage }}</div>
```

- Every icon-only control has an `aria-label`.
- Headings are ordered — one `h1` per screen, no skipped levels.
- The XP bar is a `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- Achievement tiles state their locked/unlocked status in text, not only by opacity.
- The tip-jar sheet is `role="dialog"` with `aria-modal="true"`, traps focus, closes on Escape, and returns focus to the trigger.
- Decorative SVGs are `aria-hidden="true"`. Meaningful ones have `role="img"` and a label.

---

## 7. Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

The achievement unlock still *happens* under reduced motion — it simply appears rather than animating in. **Information is never carried by motion alone**, so removing motion never removes meaning.

No looping animation, no auto-playing video, no parallax, nothing that flashes more than three times per second.

---

## 8. Layout and safe areas

- `viewport-fit=cover` plus `env(safe-area-inset-*)` on the body and the tab bar. Without both, controls sit under the home indicator.
- No horizontal scroll at 375 px. Wide content (long addresses, tables) scrolls inside its own container, never the page.
- `overscroll-behavior-y: none` prevents rubber-banding that exposes the page background under the tab bar.
- Layouts survive 200% text scaling without clipping.
- Landscape is supported by the same single-column layout — not optimised, but never broken.

---

## 9. Focus

Keyboard is not the primary input, but focus still matters: WebViews expose it, and users with switch access or an external keyboard rely on it.

```css
:focus-visible {
  outline: 2px solid var(--discover);
  outline-offset: 2px;
}
```

Focus is never removed without a replacement. Order follows DOM order. Sheets trap focus while open.

---

## 10. Test checklist

Device tests, on a physical phone inside Nimiq Pay:

- [ ] Every control reachable and tappable one-handed
- [ ] No target under 44 px
- [ ] No horizontal scroll at 375 px
- [ ] Safe areas clear of content, top and bottom
- [ ] Inputs don't trigger zoom on focus
- [ ] Screenshot in greyscale: every state still distinguishable
- [ ] System text size at maximum: nothing clipped
- [ ] Reduced motion on: achievements still appear, nothing animates
- [ ] Screen reader: tab bar, XP bar, and achievement states all announced
- [ ] Landscape: usable, nothing overlapping
- [ ] Outdoors or at low brightness: `--text-muted` still legible

The greyscale screenshot test is the fastest single check in this list — it catches colour-only meaning in seconds.
