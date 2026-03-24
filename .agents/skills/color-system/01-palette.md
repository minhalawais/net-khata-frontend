# Color System — Palette Reference
**NetDaftar ERP · Slate + Blue · Production v1.0**

## Design Philosophy

This system uses **two scales and one accent**:
- **Slate** — the neutral base. Blue-tinted grays so every surface quietly harmonizes with the accent.
- **Blue-600** — the single interactive accent. One color for all CTAs, focus states, links, and active elements.
- **Semantic colors** (emerald, amber, rose) — status only. Never decorative.

**Rule: Never use more than one accent color in any single view. Semantic colors are not accent colors.**

---

## Scale 1 — Slate (Neutral Base)

All grays carry a subtle blue undertone. This is intentional — it creates visual cohesion with the Blue accent.

| Token | Hex | Usage |
|-------|-----|-------|
| `--slate-50` | `#F8FAFC` | Page canvas background |
| `--slate-100` | `#F1F5F9` | Subtle fills, table alt rows, tag backgrounds |
| `--slate-200` | `#E2E8F0` | Default borders, dividers, input borders |
| `--slate-300` | `#CBD5E1` | Strong borders, hover borders |
| `--slate-400` | `#94A3B8` | Placeholder text, disabled text, hint text |
| `--slate-500` | `#64748B` | Muted text, timestamps, metadata, captions |
| `--slate-600` | `#475569` | Secondary text, form labels, body copy |
| `--slate-700` | `#334155` | — (available, use sparingly) |
| `--slate-800` | `#1E293B` | — (available, use sparingly) |
| `--slate-900` | `#0F172A` | Primary text, headings, data values |
| `--slate-950` | `#020617` | Sidebar background, near-black surfaces |

---

## Scale 2 — Blue (Primary Accent)

Used exclusively for interactive elements. Blue-600 is the canonical accent value.

| Token | Hex | Usage |
|-------|-----|-------|
| `--blue-50` | `#EFF6FF` | Ghost button fill, info alert background |
| `--blue-100` | `#DBEAFE` | Info badge fill, avatar background |
| `--blue-200` | `#BFDBFE` | Info badge border, chart bars (low) |
| `--blue-300` | `#93C5FD` | Chart bars (mid-low) |
| `--blue-400` | `#60A5FA` | Chart bars (mid) |
| `--blue-500` | `#3B82F6` | Chart bars (mid-high) |
| `--blue-600` | `#2563EB` | **PRIMARY ACCENT** — buttons, active nav, links, focus borders |
| `--blue-700` | `#1D4ED8` | Button hover state |
| `--blue-800` | `#1E40AF` | Button active/pressed, dark text on blue-100 |
| `--blue-900` | `#1E3A8A` | Darkest blue, badge text on blue-100 |

---

## Scale 3 — Semantic Success (Emerald)

| Token | Hex | Usage |
|-------|-----|-------|
| `--success-bg` | `#F0FDF4` | Success alert fill, "Paid" badge background |
| `--success-border` | `#DCFCE7` | Success badge border |
| `--success-text` | `#16A34A` | Success badge text, positive delta text |
| `--success-bold` | `#14532D` | Success icon, indicator dot |

---

## Scale 4 — Semantic Warning (Amber)

| Token | Hex | Usage |
|-------|-----|-------|
| `--warning-bg` | `#FFFBEB` | Warning alert fill, "Pending" badge background |
| `--warning-border` | `#FEF3C7` | Warning badge border |
| `--warning-text` | `#D97706` | Warning badge text |
| `--warning-bold` | `#78350F` | Warning icon, indicator dot |

---

## Scale 5 — Semantic Danger (Rose)

| Token | Hex | Usage |
|-------|-----|-------|
| `--danger-bg` | `#FFF1F2` | Danger alert fill, "Overdue" badge background |
| `--danger-border` | `#FFE4E6` | Danger badge border |
| `--danger-text` | `#E11D48` | Danger badge text, error state text |
| `--danger-bold` | `#881337` | Danger icon, indicator dot |

---

## Full CSS Variable Block

Copy this into your project's root stylesheet. All components must reference these variables — never raw hex values.

```css
:root {
  /* ── Slate scale ── */
  --slate-50:  #F8FAFC;
  --slate-100: #F1F5F9;
  --slate-200: #E2E8F0;
  --slate-300: #CBD5E1;
  --slate-400: #94A3B8;
  --slate-500: #64748B;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1E293B;
  --slate-900: #0F172A;
  --slate-950: #020617;

  /* ── Blue scale ── */
  --blue-50:  #EFF6FF;
  --blue-100: #DBEAFE;
  --blue-200: #BFDBFE;
  --blue-300: #93C5FD;
  --blue-400: #60A5FA;
  --blue-500: #3B82F6;
  --blue-600: #2563EB;
  --blue-700: #1D4ED8;
  --blue-800: #1E40AF;
  --blue-900: #1E3A8A;

  /* ── Semantic — success ── */
  --success-bg:     #F0FDF4;
  --success-border: #DCFCE7;
  --success-text:   #16A34A;
  --success-bold:   #14532D;

  /* ── Semantic — warning ── */
  --warning-bg:     #FFFBEB;
  --warning-border: #FEF3C7;
  --warning-text:   #D97706;
  --warning-bold:   #78350F;

  /* ── Semantic — danger ── */
  --danger-bg:      #FFF1F2;
  --danger-border:  #FFE4E6;
  --danger-text:    #E11D48;
  --danger-bold:    #881337;
}
```
