# Skill 01 — Layout, Grid & Spacing System
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Current Dashboard Problems (from screenshot analysis)

- KPI cards have no breathing room — they feel cramped
- No consistent vertical rhythm between sections
- Page content starts too close to the page header
- Charts and tables have inconsistent internal padding

---

## The Core Layout Structure

Every dashboard page uses exactly this three-layer shell:

```
App Shell
├── Sidebar (fixed, 220px wide, bg-slate-950)
├── Main Area (flex-1, flex-col)
│   ├── Top Header Bar (fixed, h-14, bg-white, border-b)
│   ├── Page Header (bg-white, border-b, px-6 py-4)
│   └── Page Content (flex-1, bg-slate-50, overflow-y-auto, p-6)
│       └── Content Grid (max-w-[1400px], mx-auto)
```

```jsx
// App shell wrapper
<div className="flex h-screen bg-slate-50 overflow-hidden">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
    <TopBar />
    <PageHeader />
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Page sections go here */}
      </div>
    </main>
  </div>
</div>
```

---

## Grid System

### KPI Cards — 4 columns
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard />
  <KpiCard />
  <KpiCard />
  <KpiCard />
</div>
```

### Chart Row — 2 equal columns
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <ChartCard />
  <ChartCard />
</div>
```

### Chart Row — 3 columns (1 narrow + 1 wide + 1 narrow)
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <ChartCard />                           {/* 1/3 */}
  <div className="lg:col-span-2">         {/* 2/3 */}
    <ChartCard />
  </div>
</div>
```

### Bottom Row — Table + Table (split)
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <TableCard title="Top Service Plans" />
  <TableCard title="Overdue Invoices" />
</div>
```

### Full-width section
```jsx
<div className="w-full">
  <ChartCard />
</div>
```

---

## Spacing Scale (Tailwind tokens to always use)

| Purpose | Tailwind class | px value |
|---------|---------------|----------|
| Gap between page sections | `space-y-6` or `gap-6` | 24px |
| Gap between cards in a grid | `gap-4` | 16px |
| Card internal padding | `p-5` | 20px |
| Card header padding (tighter) | `px-5 py-4` | 20px / 16px |
| Table cell padding | `px-4 py-3` | 16px / 12px |
| Table header padding | `px-4 py-2.5` | 16px / 10px |
| Input padding | `px-3 py-2` | 12px / 8px |
| Button padding | `px-4 py-2` | 16px / 8px |
| Sidebar item padding | `px-3 py-2` | 12px / 8px |
| KPI card internal | `p-5` | 20px |
| Badge padding | `px-2 py-0.5` | 8px / 2px |

**Rule: Never use arbitrary values like `p-[13px]`. Always use the Tailwind scale. If it doesn't fit, go up or down one step.**

---

## Vertical Rhythm

Each dashboard section follows this rhythm:

```
Page content top padding:     p-6  (24px)
Between section groups:       space-y-6 (24px)
Between cards in a group:     gap-4 (16px)
Inside a card top-to-content: py-4 then content (16px then content)
Inside a card content-to-bottom: pb-5 (20px)
```

---

## Page Header Component

```jsx
function PageHeader({ icon, title, description, actions }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          {icon}  {/* icon in blue-600 */}
        </div>
        <div>
          <h1 className="text-[15px] font-medium text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}  {/* date range, filters, export button */}
      </div>
    </div>
  )
}
```

---

## Section Card Wrapper

Every chart, table, and content block goes in this wrapper:

```jsx
function Card({ title, subtitle, action, children, className }) {
  return (
    <div className={`bg-white rounded-[10px] border border-slate-200 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-[13px] font-medium text-slate-900">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}
```

---

## Tailwind Config — Custom Values to Add

Add to `tailwind.config.js` for this system:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        slate: { /* already in Tailwind — no changes needed */ },
        blue:  { /* already in Tailwind — no changes needed */ },
      },
      borderRadius: {
        'card': '10px',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      maxWidth: {
        'dashboard': '1400px',
      }
    }
  }
}
```

---

## Responsive Breakpoints

| Breakpoint | Sidebar behavior | Grid columns |
|-----------|-----------------|-------------|
| `< lg` (< 1024px) | Collapsible (icon-only or hidden) | 1 col |
| `lg` (1024px) | 220px fixed | 2 col (charts), 2 col (KPI) |
| `xl` (1280px) | 220px fixed | 4 col (KPI), 2/3 split (charts) |
| `2xl` (1536px) | 220px fixed | Full layout, max-w-[1400px] centered |

---

## Anti-patterns to Avoid

| Don't | Do instead |
|-------|-----------|
| `p-[13px]` | `p-3` or `p-4` |
| Nested grids without gap | Always `gap-4` or `gap-6` |
| Full-bleed tables without card wrapper | Always wrap in Card component |
| Different card border-radius per component | Always `rounded-[10px]` |
| Sections with no top-level `space-y-6` | Always use `space-y-6` on the page root |
| Cards touching the page edge on mobile | Always `p-4` or `p-6` on the page container |
