# Color System — Role Tokens
**NetDaftar ERP · Slate + Blue · Production v1.0**

## What Are Role Tokens?

Role tokens map palette values to **functional UI roles**. Components must always use role tokens, never raw scale values like `--slate-900` or `#0F172A` directly. This abstraction makes theming, dark mode, and future rebranding a single-file change.

---

## Background Tokens

| Role Token | Maps To | Hex | When To Use |
|------------|---------|-----|-------------|
| `--bg-page` | `--slate-50` | `#F8FAFC` | The outermost app canvas. Every page sits on this. |
| `--bg-surface` | `#FFFFFF` | `#FFFFFF` | Cards, modal dialogs, dropdown menus, form panels. |
| `--bg-subtle` | `--slate-100` | `#F1F5F9` | Table alternate rows, tag fills, section divider areas, nav group headers. |
| `--bg-sidebar` | `--slate-950` | `#020617` | Navigation sidebar background. Fixed dark. |
| `--bg-header` | `--slate-900` | `#0F172A` | Top bar when using a dark header variant. |
| `--bg-overlay` | `rgba(15,23,42,0.5)` | — | Modal backdrop, drawer overlay. |

---

## Text Tokens

| Role Token | Maps To | Hex | When To Use |
|------------|---------|-----|-------------|
| `--text-primary` | `--slate-900` | `#0F172A` | All headings, data cell values, important labels. |
| `--text-secondary` | `--slate-600` | `#475569` | Body copy, form labels, description text, sidebar nav items (inactive). |
| `--text-muted` | `--slate-500` | `#64748B` | Timestamps, metadata, captions, helper text below inputs. |
| `--text-hint` | `--slate-400` | `#94A3B8` | Input placeholders, disabled field text, empty state descriptions. |
| `--text-inverse` | `#FFFFFF` | `#FFFFFF` | Text on dark backgrounds (sidebar, dark buttons, dark headers). |
| `--text-accent` | `--blue-600` | `#2563EB` | Hyperlinks, active nav labels, "View all" type actions. |
| `--text-accent-sidebar` | `--blue-300` | `#93C5FD` | Active nav item label specifically inside the dark sidebar. |

---

## Border Tokens

| Role Token | Maps To | Hex | When To Use |
|------------|---------|-----|-------------|
| `--border` | `--slate-200` | `#E2E8F0` | Default border on cards, inputs at rest, table borders, dividers. |
| `--border-strong` | `--slate-300` | `#CBD5E1` | Hover border on inputs, emphasis borders, section separators. |
| `--border-accent` | `--blue-600` | `#2563EB` | Focused input border. |
| `--border-danger` | `--danger-text` | `#E11D48` | Validation error border on inputs. |
| `--border-success` | `--success-text` | `#16A34A` | Validated / confirmed input border. |

---

## Interactive / Accent Tokens

| Role Token | Maps To | Hex | When To Use |
|------------|---------|-----|-------------|
| `--accent` | `--blue-600` | `#2563EB` | Primary button background, active nav indicator, checkboxes, toggles. |
| `--accent-hover` | `--blue-700` | `#1D4ED8` | Primary button on hover. |
| `--accent-active` | `--blue-800` | `#1E40AF` | Primary button on press/active. |
| `--accent-subtle` | `--blue-50` | `#EFF6FF` | Secondary/ghost button background, info alert background. |
| `--accent-subtle-border` | `--blue-200` | `#BFDBFE` | Secondary button border, info badge border. |
| `--accent-ring` | `rgba(37,99,235,0.12)` | — | Focus ring box-shadow (`0 0 0 3px var(--accent-ring)`). |

---

## Sidebar-Specific Tokens

The sidebar has its own token set because it sits on a near-black background.

| Role Token | Value | When To Use |
|------------|-------|-------------|
| `--sidebar-bg` | `#020617` | Sidebar background |
| `--sidebar-text` | `#94A3B8` | Inactive nav item text |
| `--sidebar-text-active` | `#93C5FD` | Active nav item text |
| `--sidebar-item-active-bg` | `rgba(37,99,235,0.14)` | Active nav item background pill |
| `--sidebar-section-label` | `#475569` | Section group headers ("MAIN", "NETWORK") |
| `--sidebar-border` | `rgba(255,255,255,0.07)` | Dividers inside the sidebar |
| `--sidebar-badge-bg` | `#1D4ED8` | Notification count badge background |
| `--sidebar-badge-text` | `#DBEAFE` | Notification count badge text |

---

## Full Role Token CSS Block

```css
:root {
  /* ── Backgrounds ── */
  --bg-page:              var(--slate-50);
  --bg-surface:           #FFFFFF;
  --bg-subtle:            var(--slate-100);
  --bg-sidebar:           var(--slate-950);
  --bg-header:            var(--slate-900);
  --bg-overlay:           rgba(15, 23, 42, 0.50);

  /* ── Text ── */
  --text-primary:         var(--slate-900);
  --text-secondary:       var(--slate-600);
  --text-muted:           var(--slate-500);
  --text-hint:            var(--slate-400);
  --text-inverse:         #FFFFFF;
  --text-accent:          var(--blue-600);
  --text-accent-sidebar:  var(--blue-300);

  /* ── Borders ── */
  --border:               var(--slate-200);
  --border-strong:        var(--slate-300);
  --border-accent:        var(--blue-600);
  --border-danger:        var(--danger-text);
  --border-success:       var(--success-text);

  /* ── Interactive ── */
  --accent:               var(--blue-600);
  --accent-hover:         var(--blue-700);
  --accent-active:        var(--blue-800);
  --accent-subtle:        var(--blue-50);
  --accent-subtle-border: var(--blue-200);
  --accent-ring:          rgba(37, 99, 235, 0.12);

  /* ── Sidebar ── */
  --sidebar-bg:               #020617;
  --sidebar-text:             #94A3B8;
  --sidebar-text-active:      #93C5FD;
  --sidebar-item-active-bg:   rgba(37, 99, 235, 0.14);
  --sidebar-section-label:    #475569;
  --sidebar-border:           rgba(255, 255, 255, 0.07);
  --sidebar-badge-bg:         #1D4ED8;
  --sidebar-badge-text:       #DBEAFE;

  /* ── Spacing & Radius ── */
  --radius-sm:   4px;   /* Tags, badges, small chips */
  --radius-md:   6px;   /* Buttons, inputs, small cards */
  --radius-lg:   10px;  /* Cards, panels, modals */
  --radius-xl:   14px;  /* Large modals, drawers */
  --radius-pill: 9999px; /* Status badges, avatar pills */
}
```
