# /barber-sample — copy + spacing pass

## Context

The mobile pricing pop-up on `/barber-sample` is functional but feels
crowded and verbose. The user wants:

- The redundant `A Sample` modal-header label gone so the actual
  headline can sit at the top of the modal.
- The headline trimmed to a single line of copy.
- Two of the four "What you get" items removed (the SEO/Google-ready
  one and the Custom-domain one), so the list reads as the two facts
  that actually matter (custom build + we maintain it).
- The "How it works" steps rewritten to be shorter and clearer.
- A small overall type-scale reduction plus more left/right indent so
  the text doesn't visually touch the modal's gold border.

All changes are confined to **one file**:
`components/BarberSamplePage.tsx` (single-file React component with an
inline `<style>` block — no other files reference these strings or
classes).

No pricing, no Stripe wiring, no iframe / sandbox behaviour changes.

## Changes

### 1. Drop the modal-header label, keep only the close button

`components/BarberSamplePage.tsx`, around line 326–329 — the mobile
expanded modal has a header bar with `<span className="bsp-mobile-header-text">A Sample</span>`
plus the `×` close button. Remove the `<span>` entirely; leave the
close button. In the matching CSS (around line 204–219, the
`@media (max-width: 720px)` block), shrink header padding so the
empty header is a thin sliver:

- `.bsp-card.expanded .bsp-mobile-header` padding `14px 22px` →
  `10px 14px`, justify-content `space-between` → `flex-end` so the
  `×` floats to the right.
- `.bsp-card.expanded .bsp-mobile-header-text` rule can be deleted
  (no longer rendered).

This pulls the title closer to the top of the modal, satisfying
"move up the headline more."

### 2. Shorten the title

`components/BarberSamplePage.tsx` line 331–333:

```jsx
<h2 className="bsp-title">
  This is a sample site. <em>Yours can be done in 24 hours.</em>
</h2>
```

becomes

```jsx
<h2 className="bsp-title">
  <em>Yours can be done in 24 hours.</em>
</h2>
```

The whole headline becomes the italic gold serif phrase the user
quoted. Sub-line stays as-is.

### 3. Trim BENEFITS to two items

`components/BarberSamplePage.tsx` line 23–28. Drop `Mobile + SEO ready`
and `Custom domain`. Final list:

```ts
const BENEFITS = [
  { title: 'Fully custom', desc: 'Your branding, photos, logo, booking link — not a template.' },
  { title: 'We maintain it', desc: 'Need a change? Email us. We handle it.' },
];
```

(The `icon` field is already unused by the JSX — current rendering
uses `<span className="bsp-bullet-rule" />` not the emoji — so we can
safely drop the `icon` key while we're touching this constant.)

### 4. Rewrite STEPS to the user's three lines

`components/BarberSamplePage.tsx` line 30–34:

```ts
const STEPS = [
  { n: '01', title: 'Choose your plan',         desc: 'Single page or multi-page.' },
  { n: '02', title: 'Tell us about your business', desc: 'Send your Google Business profile or Facebook page.' },
  { n: '03', title: 'We deliver',               desc: 'Your site goes live in 24–48 hours.' },
];
```

Existing JSX (lines 400–411) already renders these via the `bsp-list`
+ `bsp-bullet-num` pattern, so no JSX changes required.

### 5. Smaller type + roomier left/right indent

In the `<style>` block:

| Selector | Now | New |
| --- | --- | --- |
| `.bsp-title` | `font-size: 22px` | `font-size: 19px` |
| `.bsp-sub` | `font-size: 12px` | `font-size: 11.5px` |
| `.bsp-list-eyebrow` | `font-size: 9px` | unchanged |
| `.bsp-bullet-body strong` | `font-size: 11.5px` | `font-size: 11px` |
| `.bsp-bullet-body span` | `font-size: 10.5px` | `font-size: 10px` |
| `.bsp-tier-name` | `font-size: 15px` | `font-size: 14px` |
| `.bsp-tier-desc` | `font-size: 10.5px` | `font-size: 10px` |
| `.bsp-tier-price` | `font-size: 22px` | `font-size: 20px` |
| `.bsp-toggle button` | `font-size: 10.5px` | `font-size: 10px` |
| `.bsp-card.expanded .bsp-card-body` padding | `22px 26px 28px` | `22px 30px 28px` |
| `.bsp-card` (desktop) padding | `26px 26px 22px` | `26px 30px 22px` |

Side padding bumped from 26 → 30 so list bullets and tier-card edges
clearly inset from the gold modal border. Type sizes drop by ~1–2 px
across the board so the smaller content still reads comfortably with
the new indent.

## Files to modify

- `components/BarberSamplePage.tsx` — single file, both the JSX edits
  (header label, title, BENEFITS, STEPS) and the CSS edits (padding,
  font sizes) live here.

## Out of scope (do NOT change)

- Stripe `source: 'barberFiveMonth'` and the `$5` / `$10` pricing in
  `PRICING` — already correct from the previous commit.
- Iframe layout (`position: absolute; inset: 0` fullscreen) and its
  `sandbox` attribute — already correct.
- Desktop sticky right-side card layout (no mobile-header in the
  desktop variant; only padding bump applies).
- Mobile bottom ribbon (`.bsp-mobile-bar`) copy and styling — user
  did not ask to change it.

## Verification

1. `npx tsc --noEmit` — no new TypeScript errors (one pre-existing
   `import.meta.env` error is fine).
2. Manual mobile check on `/barber-sample` after Vercel preview:
   - The thin modal header has only the `×` close button, no text.
   - Modal headline reads exactly: *Yours can be done in 24 hours.*
     (italic gold).
   - "What you get" shows exactly two bullets: Fully custom · We
     maintain it.
   - "How it works" shows the three new step lines verbatim.
   - Pricing toggle and tier rows still show $5 / $36 (single) and
     $10 / $72 (multi), recommended badge on multi.
   - Text on every line is visibly inset from the gold border (no
     longer touching the edge).
3. Tap each tier — Stripe embedded checkout opens with the matching
   `barberFiveMonth` price (already verified previously).

## Commit

One commit, one file:
`copy(/barber-sample): drop A Sample header, trim title, prune lists, indent`
