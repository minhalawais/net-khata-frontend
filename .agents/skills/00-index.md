# ERP Dashboard Skills — Master Index
**NetDaftar ERP · React + Tailwind · Slate + Blue · Production v1.0**

## How to Use These Files

Feed these files to your agent **in order** before generating any dashboard component. Each file is self-contained but they build on each other.

---

## File Index

| # | File | What it covers | Feed when... |
|---|------|---------------|-------------|
| 01 | `01-layout-grid-spacing.md` | App shell, grid system, spacing scale, card wrapper | Building any page layout |
| 02 | `02-sidebar-navigation.md` | Sidebar, top bar, nav items, tabs, action buttons | Building navigation |
| 03 | `03-kpi-cards.md` | KPI card variants, icon rules, delta formatting, grouping | Building metric cards |
| 04 | `04-charts-recharts.md` | All 5 chart types, color tokens, tooltip, chart card wrapper | Building any chart |
| 05 | `05-data-tables.md` | Table component, overdue badges, sorting, skeletons | Building tables |
| 06 | `06-typography.md` | Type scale, font config, number formatting utilities | Any text-heavy component |
| 07 | `07-micro-interactions.md` | Hover states, loading skeletons, spinners, live indicator | Adding interactivity |
| 08 | `08-dashboard-composition.md` | Visual hierarchy, page layout, section order | Composing full dashboard pages |

Also feed the color system files (in `/color-system/`):
- `01-palette.md` — All hex values
- `02-tokens.md` — Role tokens
- `03-components.md` — Component color recipes
- `04-rules.md` — Agent rules

---

## Recommended Agent Prompt Pattern

```
You are building components for the NetDaftar ISP ERP system using React and Tailwind CSS.

Follow the design system defined in these files exactly:
- color-system/01-palette.md
- color-system/02-tokens.md
- color-system/03-components.md
- color-system/04-rules.md
- erp-dashboard-skills/01-layout-grid-spacing.md
- erp-dashboard-skills/[relevant skill file]

Rules:
1. Use only Tailwind classes — no inline style unless absolutely required by a library (e.g. Recharts width/height).
2. Never use raw hex values in JSX — use CSS variables from the color system or Tailwind's slate/blue classes.
3. Follow the exact type scale from 06-typography.md.
4. All charts use Recharts with the exact color tokens from 04-charts-recharts.md.
5. All spacing uses the scale from 01-layout-grid-spacing.md.
```

---

## What Each Skill Fixes (vs Current Dashboard)

| Current problem | Fixed by |
|----------------|---------|
| 8 different icon colors on KPI cards | Skill 03 — one icon color system |
| Green charts (off-brand) | Skill 04 — Slate+Blue chart tokens |
| Mixed font sizes and weights | Skill 06 — strict type scale |
| No visual hierarchy between sections | Skill 08 — composition rules |
| Active sidebar item = solid blue block | Skill 02 — subtle tint + left edge indicator |
| Red "318d" badges (alarming) | Skill 05 — tiered severity badges |
| No hover states | Skill 07 — micro-interactions |
| Cards cramped together | Skill 01 — spacing system |
| No loading states | Skill 07 — skeleton components |

---

## Tailwind Classes Quick Reference

```
Layout:      flex h-screen overflow-hidden
Sidebar:     bg-[#020617] w-[220px]
Page bg:     bg-slate-50
Card:        bg-white rounded-[10px] border border-slate-200
Card header: px-5 py-4 border-b border-slate-100
Card body:   p-5
KPI value:   text-[22px] font-semibold text-slate-900 tabular-nums
KPI label:   text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]
KPI delta+:  text-[11px] font-medium text-emerald-600
KPI delta-:  text-[11px] font-medium text-rose-500
H2:          text-[13px] font-medium text-slate-900
Body:        text-[13px] text-slate-700
Caption:     text-[11px] text-slate-400
Overline:    text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]
Table th:    text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] px-4 py-2.5 bg-slate-50
Table td:    text-[13px] text-slate-700 px-4 py-3
Row hover:   hover:bg-blue-50/40 transition-colors duration-100
Button:      bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-md
Gap rows:    space-y-5
Gap cards:   gap-4
Transition:  transition-colors duration-150
```

---

## Component Dependency Tree

```
App
├── Sidebar               → Skill 02
├── TopBar                → Skill 02
└── Page
    ├── PageHeader        → Skill 01 + 06
    └── Content (p-6)
        ├── KpiRow        → Skill 03 + 06
        │   └── KpiCard
        ├── ChartRow      → Skill 04 + 01
        │   ├── ChartCard
        │   └── [Chart component]
        └── TableRow      → Skill 05 + 01
            └── DataTable
                ├── SortableHeader
                ├── CustomerCell
                ├── BadgeCell
                └── DeltaCell
```

---

## Do Not Use List

These are the most common mistakes when building ERP dashboards with AI agents. Check every generated component against this list:

- [ ] No `drop-shadow` or `shadow-*` classes on cards
- [ ] No `text-green-*` in charts (use emerald for status, blue for data)
- [ ] No `font-bold` (700 weight) anywhere — only 400, 500, 600
- [ ] No `text-sm` (14px) for table cells — use `text-[13px]`
- [ ] No multiple accent colors (no teal + blue + orange together)
- [ ] No `gray-*` classes — only `slate-*`
- [ ] No inline `style={{ color: '#...' }}` unless in Recharts
- [ ] No `duration-300` or longer transitions
- [ ] No solid active state backgrounds on sidebar items
- [ ] No KPI icon with 8 different colors
- [ ] No ALL CAPS labels without `tracking-[0.06em]`
- [ ] No numeric cells without `tabular-nums`
- [ ] No charts without the custom `<ChartTooltip />` component
- [ ] No cards without `rounded-[10px]`
- [ ] No page content without `max-w-[1400px] mx-auto`
