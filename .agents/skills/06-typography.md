# Skill 06 — Typography Applied to ERP Dashboards
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Current Dashboard Problems (from screenshot)

- KPI labels like "TOTAL COLLECTIONS" use ALL CAPS at a font size too large — visually loud
- Section headings ("Executive Dashboard", "Revenue vs Collection Trend") are too large relative to data
- No consistent type scale — sizes appear arbitrary
- Delta values (↑7.7%, ↓8808.6%) compete with the primary metric value for attention

---

## The Type Scale (7 levels only)

Use exactly these combinations. Never deviate.

| Level | Tailwind | Size | Weight | Color token | Use case |
|-------|---------|------|--------|-------------|----------|
| Display | `text-[22px] font-semibold` | 22px | 600 | `text-slate-900` | KPI metric values |
| H1 | `text-[15px] font-medium` | 15px | 500 | `text-slate-900` | Page title |
| H2 | `text-[13px] font-medium` | 13px | 500 | `text-slate-900` | Card/section titles |
| Body | `text-[13px]` | 13px | 400 | `text-slate-700` | Table data, descriptions |
| Label | `text-[11px] font-medium` | 11px | 500 | `text-slate-500` | Form labels, column headers |
| Caption | `text-[11px]` | 11px | 400 | `text-slate-400` | Timestamps, helper text, subtitles |
| Micro | `text-[10px] font-medium` | 10px | 500 | `text-slate-400` | Overlines, section group labels |

---

## Tailwind Font Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.06em' }],
      }
    }
  }
}
```

---

## Typography Applied Per Component

### Page Header Title
```jsx
<h1 className="text-[15px] font-medium text-slate-900 leading-none">
  Executive Overview
</h1>
<p className="text-[11px] text-slate-400 mt-1">
  High-level business summary and key performance indicators
</p>
```

### Dashboard Section Title (inside card header)
```jsx
<h3 className="text-[13px] font-medium text-slate-900">
  Revenue vs Collection Trend
</h3>
```

### KPI Card — 3-tier hierarchy
```jsx
<div className="flex flex-col gap-3">
  {/* Tier 1: Metric label — smallest, muted, top */}
  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
    Total Collections
  </p>

  {/* Tier 2: Value — largest, boldest, most prominent */}
  <p className="text-[22px] font-semibold text-slate-900 leading-none tabular-nums">
    <span className="text-[13px] font-medium text-slate-400 mr-1">PKR</span>
    449K
  </p>

  {/* Tier 3: Delta — small, colored, bottom */}
  <p className="text-[11px] font-medium text-emerald-600">
    ↑ 7.7% vs last period
  </p>
</div>
```

### Table Column Header
```jsx
<th className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] px-4 py-2.5">
  Customer
</th>
```

### Table Body Cell — Primary data
```jsx
<td className="text-[13px] text-slate-800 px-4 py-3">
  Malik Nazir Hussain Awan
</td>
```

### Table Body Cell — Secondary data (muted)
```jsx
<td className="text-[13px] text-slate-400 px-4 py-3 tabular-nums">
  INV-2025-0409
</td>
```

### Table Body Cell — Numeric (PKR amount)
```jsx
<td className="text-right px-4 py-3">
  <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
  <span className="text-[13px] font-medium text-slate-900 tabular-nums">9K</span>
</td>
```

### Section Group Overline (above a KPI row)
```jsx
<p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">
  Financial Metrics
</p>
```

### Sidebar Nav Item Label
```jsx
<span className="text-[12px] font-medium">Dashboard</span>
```

### Chart Axis Label (set via Recharts tick prop)
```js
tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' }}
```

### Badge / Status Pill Text
```jsx
<span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  Active
</span>
```

### Card Action Link ("View all")
```jsx
<button className="text-[11px] font-medium text-blue-600 hover:text-blue-700">
  View all
</button>
```

### Timestamp / Last updated
```jsx
<p className="text-[11px] text-slate-400">
  Last sync: 3:19:24 AM
</p>
```

---

## Number Formatting Rules

These apply to every numeric value in the dashboard:

| Value type | Format | Example |
|-----------|--------|---------|
| PKR amounts (large) | Abbreviated with suffix | `PKR 449K`, `PKR 1.7M` |
| PKR amounts (exact) | Comma separated | `PKR 9,000` |
| Percentages | One decimal | `36.9%` |
| Counts | Comma separated | `2,847` |
| Days overdue | Integer + "d" | `318d` |
| Growth deltas | One decimal + % | `↑ 4.2%` |
| Hours | Integer | `0 hrs` |

```js
// Number formatting utility
export function formatCurrency(value, currency = 'PKR') {
  if (value >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `${currency} ${(value / 1_000).toFixed(0)}K`
  return `${currency} ${value.toLocaleString()}`
}

export function formatDelta(value, decimals = 1) {
  const abs = Math.abs(value).toFixed(decimals)
  return value >= 0 ? `↑ ${abs}%` : `↓ ${abs}%`
}

export function formatCount(value) {
  return value.toLocaleString()
}
```

---

## Font Loading (Geist Sans — recommended for ERP)

Geist is clean, designed for data-dense interfaces, and reads well at small sizes. Better than Inter for ERP because it has slightly tighter letter-spacing at small sizes.

```html
<!-- In index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
```

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      }
    }
  }
}
```

---

## Typography Anti-patterns

| Don't | Do instead |
|-------|-----------|
| `font-bold` (700) in dashboards | `font-semibold` (600) for values, `font-medium` (500) for everything else |
| `text-sm` (14px) for table cells | `text-[13px]` — 1px makes a difference in dense tables |
| `text-xs` (12px) for column headers | `text-[11px] uppercase tracking-[0.06em]` |
| `text-lg` (18px) for card titles | `text-[13px] font-medium` |
| ALL CAPS without `tracking-[0.06em]` | Uppercase labels always need letter-spacing |
| `text-gray-*` classes | Always `text-slate-*` — keeps tonal consistency |
| Different font weights per developer | Agree: 400 body, 500 labels/nav/titles, 600 KPI values only |
| Raw numbers without `tabular-nums` | Always `tabular-nums` on numeric cells |
