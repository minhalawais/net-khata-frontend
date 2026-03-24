# Skill 08 — Dashboard Composition & Visual Hierarchy
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## The Hierarchy Problem in Your Current Dashboard

Looking at the screenshot, everything competes for attention equally:
- 12 KPI cards, 5 charts, 2 tables — all the same visual weight
- No clear "most important thing on this page"
- No breathing room between logical groups

Professional ERP dashboards (SAP, Salesforce, Datadog) use a strict hierarchy:
**1 hero metric → 3–4 supporting KPIs → 2 primary charts → detail tables**

---

## Visual Weight System

Every element on the dashboard has a weight level. Never have two "heavy" elements next to each other.

| Weight | What it means | Example |
|--------|--------------|---------|
| Heavy | The thing you look at first | Hero KPI, primary chart |
| Medium | Supporting context | Secondary KPIs, secondary chart |
| Light | Detail on demand | Tables, metadata, captions |
| Ghost | Infrastructure | Dividers, axis labels, timestamps |

---

## Executive Dashboard — Recommended Layout

```
┌──────────────────────────────────────────────────────┐
│  Page Header (title, date range, export)             │
├──────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐ │
│  │  KPI Strip: 4 financial metrics in one row      │ │  ← Medium weight
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │  KPI Strip: 4 customer metrics in one row       │ │  ← Medium weight
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────┐  ┌───────────────────┐  │
│  │ Revenue Collection     │  │ Customer Growth   │  │  ← Heavy (2/3 + 1/3)
│  │ Area chart (2/3 width) │  │ Bar+line (1/3)    │  │
│  └────────────────────────┘  └───────────────────┘  │
│                                                      │
│  ┌──────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ Payment  │  │ Top Areas       │  │ Rev vs Cost│  │  ← Medium (1/3 each)
│  │ Methods  │  │ Horiz bar       │  │ Grouped bar│  │
│  └──────────┘  └─────────────────┘  └────────────┘  │
│                                                      │
│  ┌────────────────────────┐  ┌───────────────────┐  │
│  │ Top Service Plans      │  │ Overdue Invoices  │  │  ← Light (50/50)
│  │ Table                  │  │ Table             │  │
│  └────────────────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## React Implementation

```jsx
function ExecutiveDashboard() {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ── Row 1: Financial KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Collections"  value="449K"  prefix="PKR" delta="-7.7%"   deltaPositive={false} icon={<BanknotesIcon />} />
          <KpiCard label="Outstanding Amount" value="1.7M"  prefix="PKR" delta="-8808%"  deltaPositive={true}  icon={<ReceiptIcon />} />
          <KpiCard label="Net Cash Flow"      value="211K"  prefix="PKR" delta="+122.9%" deltaPositive={true}  icon={<TrendingUpIcon />} />
          <KpiCard label="Collection Efficiency" value="36.9" suffix="%" delta="-8808%"  deltaPositive={false} icon={<PercentIcon />} />
        </div>

        {/* ── Row 2: Customer KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Active Customers" value="642"  delta="+1.1%"   deltaPositive={true}  icon={<UsersIcon />} />
          <KpiCard label="New Customers"    value="7"    delta="+600%"   deltaPositive={true}  icon={<UserPlusIcon />} />
          <KpiCard label="Churned"          value="7"    delta="-30%"    deltaPositive={false} icon={<UserMinusIcon />} variant="alert" />
          <KpiCard label="Growth Rate"      value="0.0"  suffix="%"                             icon={<ChartBarIcon />} />
        </div>

        {/* ── Row 3: Primary charts (2/3 + 1/3) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartCard title="Revenue vs Collection Trend" subtitle="Expected vs actual">
              <RevenueCollectionChart data={revenueData} />
            </ChartCard>
          </div>
          <ChartCard title="Customer Growth" subtitle="New, churned, total active">
            <CustomerGrowthChart data={customerData} />
          </ChartCard>
        </div>

        {/* ── Row 4: Secondary charts (1/3 each) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Payment Methods">
            <PaymentMethodsChart data={paymentData} />
          </ChartCard>
          <ChartCard title="Top Areas by Revenue">
            <TopAreasChart data={areasData} />
          </ChartCard>
          <ChartCard title="ISP Revenue vs Cost">
            <RevenueVsCostChart data={ispData} />
          </ChartCard>
        </div>

        {/* ── Row 5: Tables (50/50) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopServicePlansTable data={plansData} />
          <OverdueInvoicesTable data={overdueData} pendingCount={20} />
        </div>

      </div>
    </main>
  )
}
```

---

## Section Dividers (optional — adds breathing room)

When two logical sections need more separation than `space-y-5` alone:

```jsx
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-slate-200" />
      {label && (
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em] px-1">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

// Usage between KPI rows and charts
<SectionDivider label="Trend Analysis" />
```

---

## Color as Priority Signal

Use the blue accent as an attention signal — only where it matters:

```jsx
// ✅ Do: accent the one number that matters most on the page
<p className="text-[22px] font-semibold text-blue-700 tabular-nums">1.7M</p>
<p className="text-[11px] text-slate-400">Outstanding — requires action</p>

// ✅ Do: primary chart line in blue, comparison in slate
stroke="#2563EB"  // collected
stroke="#94A3B8"  // expected

// ❌ Don't: use blue on section headings
<h3 className="text-[13px] font-medium text-blue-600">Revenue Trend</h3>  // Wrong

// ❌ Don't: use multiple saturated colors in the KPI grid
// (green icon, orange icon, purple icon, red icon = visual noise)
```

---

## Information Density — The Goldilocks Rule

| Too sparse | Just right | Too dense |
|-----------|-----------|----------|
| Cards with only 1–2 lines of content | Card header + 1 chart/table | 3+ data points inside one card |
| Empty space between every card | `space-y-5` between rows | Cards touching each other |
| 4 KPIs on a page | 8–12 KPIs grouped in rows | 20+ KPIs ungrouped |
| No secondary data | Delta + trend indicator | Sparkline + delta + trend + tooltip |

---

## Page Title vs Dashboard Title

Your current dashboard has both "Executive Overview" (page header) and "Executive Dashboard" (card header). This is redundant. Choose one level:

```jsx
// Option A: Page header only (recommended for ERP)
// The page header IS the title. Remove the "Executive Dashboard" card header.
// Charts and tables have their own card headers.

// Option B: Module card with its own title
// Only if the page contains MULTIPLE dashboard modules
// (e.g., a page that has Financial Dashboard + HR Dashboard side by side)
```

---

## Empty Dashboard State

```jsx
function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <ChartBarIcon className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-[15px] font-medium text-slate-800 mb-2">No data for this period</h2>
      <p className="text-[13px] text-slate-400 text-center max-w-xs mb-5">
        Adjust the date range or check if data has been synced from your MikroTik devices.
      </p>
      <button className="flex items-center gap-2 text-[13px] font-medium text-white bg-blue-600
                         rounded-md px-4 py-2 hover:bg-blue-700 transition-colors">
        <RefreshIcon className="w-4 h-4" />
        Sync now
      </button>
    </div>
  )
}
```

---

## Critical Composition Rules

1. **Never more than 3 visual weight levels on one screen.** Heavy + Medium + Light. If everything is medium, nothing stands out.
2. **Charts in the top 60% of the page, tables in the bottom 40%.** Users scan charts first, drill into tables second.
3. **Group related KPIs together.** Financial metrics in one row, customer metrics in another. Never interleave.
4. **The primary chart should be 2/3 width minimum.** Never equal-split all charts — the most important one deserves more space.
5. **`space-y-5` between rows, `gap-4` within a row.** This creates grouping through proximity.
6. **Page max-width: `max-w-[1400px] mx-auto`.** Prevents ultra-wide layouts from becoming unreadable.
7. **No more than 3 cards per row on secondary charts.** 4+ creates cards too narrow to read.
