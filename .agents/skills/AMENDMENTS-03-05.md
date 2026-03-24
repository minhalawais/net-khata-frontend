# Skill Modifications — CRUD Page Updates
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Overview

After auditing the Employee Management CRUD page and the Add New Employee modal, two existing skills need targeted amendments. These additions supplement — they do not replace — the original skill content.

---

## Amendment to Skill 03 — KPI Cards

### Add: "Stat Strip" variant for CRUD/list pages

The full KPI card with delta, trend indicator, and icon is for **dashboards only**.

CRUD pages (Employee Management, Customer Management, Billing etc.) use a **Stat Strip** — a simpler, compact variant. See Skill 11 for the full `StatStrip` component.

**Key differences:**

| | Dashboard KPI Card | CRUD Stat Strip |
|--|-------------------|----------------|
| Delta/trend | Yes | No |
| Background on icon | `bg-blue-50` | `bg-blue-50` (same) |
| Card color variants | `default` + `alert` | All identical — no color variants |
| Semantic coloring | `variant="alert"` for critical | Never — value communicates urgency |
| Layout | Standalone card in 4-col grid | Compact card in 3-col grid |
| Value size | `text-[22px] font-semibold` | `text-[22px] font-semibold` (same) |

**Rule: If the metric doesn't have a meaningful delta to show, use the Stat Strip — not the KPI Card.**

### Color rule addition for KPI Cards

Add this to the existing "Critical KPI Card Rules":

> **Rule 8: Never use semantic background colors (green-tint, red-tint) on stat cards.** A card with `bg-green-50` background implies the entire card is a success state, not just that the value is positive. All stat cards use `bg-white` regardless of the metric's semantic meaning. Let the value and badge communicate status — not the card background.

---

## Amendment to Skill 05 — Data Tables

### Add: Table action buttons section

The original Skill 05 covers the base table component and status badges. It is missing recipes for:

1. **Quick action buttons** — inline buttons within a table cell (Profile, Credentials)
2. **Row edit/delete buttons** — the rightmost "Actions" column
3. **Role badges** — categorical pill within a cell
4. **Monetary value cells** — amount formatting without semantic coloring
5. **Checkbox select column**

All of these are now fully defined in **Skill 11 — CRUD Page Layout** under these sections:
- `QuickActions` component
- `RowActions` component
- `RoleBadge` component
- `AmountCell` component
- `Checkbox Select Column`

**When building a CRUD table, use Skill 05 for the base DataTable shell and Skill 11 for the cell-level components.**

### Color rule addition for Data Tables

Add this to the existing "Critical Table Rules":

> **Rule 10: Monetary values (`AmountCell`) are always `text-slate-900 font-medium tabular-nums`.** Never `text-emerald-600` or any other color for a data value. Color on a data cell implies status — if the salary is green, users assume it's "paid". If the balance is green, users assume it's "positive/credited". Use plain slate for all raw data values.

> **Rule 11: Role/Category cells use a badge, never plain uppercase text.** Plain uppercase text has no containment — it blends with surrounding text at a glance. A `RoleBadge` with `bg-slate-100 text-slate-600` creates instant scannability.

> **Rule 12: The "Actions" column (edit/delete) uses icon-only ghost buttons.** No solid colored squares. `p-1.5` icon button with `hover:bg-{color}-50 hover:text-{color}-600`. The icon communicates the action; color appears only on hover.

> **Rule 13: Quick action buttons in a dedicated column follow a 2-button max rule.** Profile (slate ghost) + one primary action (blue ghost). Never orange, never 3+ buttons in a single table cell.

---

## Summary: What to Feed Your Agent Per Task

| Task | Skills to feed |
|------|---------------|
| Building a dashboard page | 00-index + 01 + 03 + 04 + 08 + color-system |
| Building a CRUD list page | 00-index + 05 + 06 + 11 + color-system |
| Building a modal form | 00-index + 09 + 10 + 06 + color-system |
| Building sidebar/nav | 00-index + 02 + color-system |
| Adding charts | 04 + color-system |
| Adding micro-interactions | 07 |
| Any component | 04-rules (color) + 06 (typography) always |

---

## Complete Skill File Index (Updated)

| # | File | Category | Status |
|---|------|----------|--------|
| 00 | `00-index.md` | Master index | Update with new skills |
| 01 | `01-layout-grid-spacing.md` | Dashboard | Unchanged |
| 02 | `02-sidebar-navigation.md` | Navigation | Unchanged |
| 03 | `03-kpi-cards.md` | Dashboard | + Amendment above |
| 04 | `04-charts-recharts.md` | Charts | Unchanged |
| 05 | `05-data-tables.md` | Tables | + Amendment above |
| 06 | `06-typography.md` | Typography | Unchanged |
| 07 | `07-micro-interactions.md` | Interaction | Unchanged |
| 08 | `08-dashboard-composition.md` | Dashboard | Unchanged |
| **09** | **`09-modal-dialogs.md`** | **CRUD / Forms** | **NEW** |
| **10** | **`10-forms-fields.md`** | **CRUD / Forms** | **NEW** |
| **11** | **`11-crud-page-layout.md`** | **CRUD** | **NEW** |
| — | `color-system/01-palette.md` | Color | Unchanged |
| — | `color-system/02-tokens.md` | Color | Unchanged |
| — | `color-system/03-components.md` | Color | Unchanged |
| — | `color-system/04-rules.md` | Color | Unchanged |
