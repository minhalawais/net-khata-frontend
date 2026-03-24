# Color System — Rules & Agent Instructions
**NetDaftar ERP · Slate + Blue · Production v1.0**

## Instructions for AI Agents

When generating any UI code (HTML, React, Vue, Tailwind, or any other framework) for the NetDaftar ERP system, you must follow every rule in this document. These rules are non-negotiable and override any default styling tendencies.

---

## The 5 Core Rules

### Rule 1 — One accent color
`--blue-600` (`#2563EB`) is the only interactive accent. Do not introduce teal, purple, orange, or any other accent. The semantic colors (emerald, amber, rose) exist only for status communication — they are never used decoratively or as a second accent.

### Rule 2 — Role tokens only in components
Components must reference role tokens (`--bg-surface`, `--text-primary`, `--accent`, etc.), not scale tokens (`--slate-900`, `--blue-600`) and never raw hex values. The only exception is inside the token definition file itself.

### Rule 3 — Slate for all neutrals
Never use gray, zinc, stone, or any other neutral scale. All grays in this system are Slate — they carry a subtle blue undertone that makes them harmonize with the blue accent. Using a different gray family breaks color temperature cohesion.

### Rule 4 — No gradients, no shadows for decoration
Depth is created through border contrast and background layering, not shadows or gradients. The only permitted shadow is a focus ring: `box-shadow: 0 0 0 3px var(--accent-ring)`. Card elevation is communicated by the white surface against the `--bg-page` background, not drop shadows.

### Rule 5 — Text on colored backgrounds must be same-family dark
When placing text on a colored background (badges, alerts, avatars), always use the darkest stop of that same color family. Never use `--text-primary` (Slate-900) on a colored fill — it will look visually disconnected.

| Fill | Required text color |
|------|-------------------|
| Blue-50/100 fill | Blue-800 or Blue-900 |
| Emerald fill | `--success-bold` #14532D |
| Amber fill | `--warning-bold` #78350F |
| Rose fill | `--danger-bold` #881337 |

---

## Typography Rules

| Use case | Size | Weight | Color token |
|----------|------|--------|-------------|
| Page display heading | 26px | 500 | `--text-primary` |
| H1 — section heading | 20px | 500 | `--text-primary` |
| H2 — subsection | 16px | 500 | `--text-primary` |
| H3 — card heading | 14px | 500 | `--text-primary` |
| Body copy | 13px | 400 | `--text-secondary` |
| Form label | 11px | 500 | `--text-secondary` |
| Caption / timestamp | 11px | 400 | `--text-muted` |
| Overline / section tag | 10px | 500 | `--text-hint` (uppercase + letter-spacing) |
| Link / accent text | 13px | 500 | `--text-accent` |
| Table header | 11px | 500 | `--text-muted` (uppercase) |
| Table cell value | 13px | 400 | `--text-primary` |
| Table cell secondary | 13px | 400 | `--text-muted` |
| Placeholder | — | 400 | `--text-hint` |

**Font weight rule: Use only 400 (regular) and 500 (medium). Never 600, 700, or bold. They appear heavy against this refined palette.**

---

## Spacing & Radius Reference

| Token | Value | Use for |
|-------|-------|---------|
| `--radius-sm` | 4px | Tags, small chips, code spans |
| `--radius-md` | 6px | Buttons, inputs, small cards, dropdowns |
| `--radius-lg` | 10px | Cards, panels, modals, sheet drawers |
| `--radius-xl` | 14px | Large modals, full-page panels |
| `--radius-pill` | 9999px | Status badges, avatar pills, toggle switches |

**Border width rule: Always `0.5px` for borders. Never `1px` — it looks heavy. The exception is focus rings (`box-shadow`) and left-border accents on alert banners (`3px`).**

---

## DO / DON'T Reference

### Colors

| DO | DON'T |
|----|-------|
| Use `--accent` (`#2563EB`) for all interactive elements | Use teal, purple, orange, or any other color as an accent |
| Use semantic colors for status badges only | Use semantic colors decoratively or as chart colors |
| Use Slate grays for all neutral surfaces and text | Mix in zinc, gray, stone, or other neutral scales |
| Use `--blue-50` through `--blue-200` for subtle tints on information states | Use saturated blue on large background areas |
| Use `--sidebar-text-active` (`#93C5FD`) for active nav text in sidebar | Use `--text-accent` (`#2563EB`) inside the dark sidebar — insufficient contrast |

### Borders

| DO | DON'T |
|----|-------|
| Use `0.5px solid var(--border)` for all card and input borders | Use `1px` borders — too heavy |
| Use `border-radius: 0` on single-sided accent borders (left/top only) | Add `border-radius` to a `border-left` — visually broken |
| Increase border to `--border-strong` on hover | Add shadows on hover |

### Backgrounds

| DO | DON'T |
|----|-------|
| Layer: `--bg-page` → `--bg-surface` → elevated content | Use more than 3 background depth levels |
| Use `--bg-subtle` for table alt rows | Alternate row colors using any color other than `--bg-subtle` |
| Keep sidebar strictly `--sidebar-bg` (#020617) | Lighten the sidebar background |

### Charts

| DO | DON'T |
|----|-------|
| Use the Blue scale (50→900) as a sequential ramp | Use multiple accent colors across bars |
| Use `--text-muted` for axis labels | Use `--text-primary` for axis labels — too heavy |
| Use `--border` for grid lines | Use colored grid lines |

---

## Status → Badge Mapping (Quick Reference)

| ERP Status | Badge Recipe |
|-----------|-------------|
| Active / Paid / Online / Connected | success (emerald) |
| Pending / Partial / Due Soon / Processing | warning (amber) |
| Overdue / Suspended / Disconnected / Error | danger (rose) |
| Trial / New / Info / Unassigned | info (blue) |
| Archived / Inactive / Cancelled | neutral (slate) |
| Premium / VIP / Priority | dark (slate-900 bg + white text) |

---

## What Makes This System Look Professional

1. **One accent, not two.** Every multi-accent system looks assembled. One accent looks designed.
2. **Slate, not pure gray.** The blue undertone in Slate means the neutral and accent are from the same color family.
3. **Near-black sidebar.** `#020617` reads as enterprise authority immediately.
4. **0.5px borders.** Hairline borders feel refined. 1px borders feel like a default stylesheet.
5. **No shadows for elevation.** White surface on `--bg-page` creates depth without decorative shadows.
6. **Weight 500, not 700.** Heavy font weights fight the color system. 500 lets the color contrasts do the work.
7. **Sequential chart colors.** Using one scale across a chart reads as intentional data encoding, not arbitrary color assignment.

---

## File Index

| File | Contents |
|------|----------|
| `01-palette.md` | All scale stops (Slate, Blue, Semantic) with hex values and CSS variable block |
| `02-tokens.md` | Role token definitions — what each token means and when to use it |
| `03-components.md` | Exact color recipes for every ERP component type |
| `04-rules.md` | This file — agent instructions, do/don't, typography, spacing |
