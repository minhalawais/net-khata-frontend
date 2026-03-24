# Skill 03 — KPI Metric Cards
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Current Dashboard Problems (from screenshot)

- Each card has a colored square icon (green, orange, blue, purple, red) — 5+ colors fighting simultaneously
- Icon color has no relationship to the card's semantic meaning
- Delta badges are too prominent — compete with the metric value
- "TOTAL COLLECTIONS", "OUTSTANDING AMOUNT" etc. labels are ALL CAPS — makes them feel loud
- No clear visual hierarchy: icon, label, value, delta all have similar weight

---

## The Redesigned KPI Card System

### Two card variants only:

| Variant | When to use |
|---------|------------|
| `default` | All standard metrics (collections, customers, uptime) |
| `alert` | Metrics that need immediate attention (overdue, complaints) |

**The icon background is always `bg-blue-50` with a `text-blue-600` icon, regardless of the metric. The semantic meaning is communicated through the delta color and optional alert variant — not 8 different icon colors.**

---

## Default KPI Card

```jsx
function KpiCard({
  icon,
  label,
  value,
  delta,           // e.g. "+4.2%"
  deltaDirection,  // "up" | "down" | "neutral"
  deltaPositive,   // true if up is good (e.g. revenue), false if up is bad (e.g. complaints)
  prefix,          // e.g. "PKR"
  suffix,          // e.g. "%"
  variant = "default",  // "default" | "alert"
}) {

  const isPositive = deltaDirection === "up" ? deltaPositive : !deltaPositive
  const deltaColor = deltaDirection === "neutral"
    ? "text-slate-400"
    : isPositive ? "text-emerald-600" : "text-rose-500"

  const deltaIcon = deltaDirection === "up"
    ? "↑"
    : deltaDirection === "down" ? "↓" : "—"

  return (
    <div className={`
      bg-white rounded-[10px] border p-5 flex flex-col gap-3
      hover:border-slate-300 transition-colors duration-150
      ${variant === "alert" ? "border-rose-200 bg-rose-50/30" : "border-slate-200"}
    `}>
      {/* Top row: icon + delta */}
      <div className="flex items-start justify-between">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          ${variant === "alert" ? "bg-rose-50" : "bg-blue-50"}
        `}>
          <span className={`w-4 h-4 ${variant === "alert" ? "text-rose-500" : "text-blue-600"}`}>
            {icon}
          </span>
        </div>

        {delta && (
          <div className={`flex items-center gap-0.5 text-[11px] font-medium ${deltaColor}`}>
            <span>{deltaIcon}</span>
            <span>{delta}</span>
          </div>
        )}
      </div>

      {/* Bottom: label + value */}
      <div>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mb-1">
          {label}
        </p>
        <p className="text-[22px] font-semibold text-slate-900 leading-none tabular-nums">
          {prefix && <span className="text-[13px] font-medium text-slate-500 mr-0.5">{prefix}</span>}
          {value}
          {suffix && <span className="text-[13px] font-medium text-slate-500 ml-0.5">{suffix}</span>}
        </p>
      </div>
    </div>
  )
}
```

---

## Usage Examples (matching your dashboard)

```jsx
{/* Row 1 — Financial */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard
    icon={<CurrencyIcon />}
    label="Total Collections"
    value="449K"
    prefix="PKR"
    delta="7.7%"
    deltaDirection="down"
    deltaPositive={false}  // down in collections = bad
  />
  <KpiCard
    icon={<ClockIcon />}
    label="Outstanding Amount"
    value="1.7M"
    prefix="PKR"
    delta="8808.6%"
    deltaDirection="down"
    deltaPositive={true}  // down in outstanding = good
  />
  <KpiCard
    icon={<TrendingUpIcon />}
    label="Net Cash Flow"
    value="211K"
    prefix="PKR"
    delta="122.9%"
    deltaDirection="up"
    deltaPositive={true}
  />
  <KpiCard
    icon={<PercentIcon />}
    label="Collection Efficiency"
    value="36.9"
    suffix="%"
    delta="8808.6%"
    deltaDirection="down"
    deltaPositive={false}
  />
</div>

{/* Row 2 — Customers */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard icon={<UsersIcon />}       label="Active Customers" value="642"  delta="1.1%"   deltaDirection="up"      deltaPositive={true} />
  <KpiCard icon={<UserPlusIcon />}    label="New Customers"    value="7"    delta="600.0%"  deltaDirection="up"      deltaPositive={true} />
  <KpiCard icon={<UserMinusIcon />}   label="Churned"          value="7"    delta="30.0%"  deltaDirection="down"    deltaPositive={false} variant="alert" />
  <KpiCard icon={<TrendingUpIcon />}  label="Growth Rate"      value="0.0"  suffix="%"     deltaDirection="neutral" deltaPositive={true} />
</div>

{/* Row 3 — Operations */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard icon={<AlertIcon />}       label="Open Complaints"  value="0"    deltaDirection="neutral" variant="default" />
  <KpiCard icon={<ClockIcon />}       label="Avg Resolution"   value="0"    suffix=" hrs"  deltaDirection="neutral" />
  <KpiCard icon={<CurrencyIcon />}    label="ARPU"             value="2K"   prefix="PKR"   delta="1.1%"  deltaDirection="down" deltaPositive={false} />
  <KpiCard icon={<PercentIcon />}     label="Gross Margin"     value="53.2" suffix="%"     delta="60.1%" deltaDirection="up"   deltaPositive={true} />
</div>
```

---

## KPI Card Grouping with Section Labels

Group rows with a section label above them for context:

```jsx
function KpiSection({ label, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.08em]">{label}</p>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </div>
  )
}

// Usage
<KpiSection label="Financial">
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">...</div>
</KpiSection>

<KpiSection label="Customers">
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">...</div>
</KpiSection>
```

---

## Compact KPI Strip (alternate layout)

When you need all KPIs visible above the fold in one row:

```jsx
function KpiStrip({ metrics }) {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200 grid grid-cols-4 divide-x divide-slate-100">
      {metrics.map((m, i) => (
        <div key={i} className="px-5 py-4 flex flex-col gap-1">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em]">{m.label}</p>
          <p className="text-[20px] font-semibold text-slate-900 tabular-nums leading-none">{m.value}</p>
          <p className={`text-[11px] font-medium ${m.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {m.delta}
          </p>
        </div>
      ))}
    </div>
  )
}
```

---

## Icon Assignment Rules

Use a single icon library (Heroicons recommended for Tailwind projects). Assign icons by category — never by color.

| Metric category | Icon |
|----------------|------|
| Revenue / Money | `BanknotesIcon` |
| Outstanding / Debt | `ExclamationCircleIcon` |
| Cash flow | `ArrowsRightLeftIcon` |
| Efficiency / Ratio | `ChartBarIcon` |
| Customers (active) | `UsersIcon` |
| New customers | `UserPlusIcon` |
| Churned | `UserMinusIcon` |
| Growth rate | `TrendingUpIcon` |
| Complaints | `ChatBubbleLeftIcon` |
| Resolution time | `ClockIcon` |
| ARPU | `CurrencyDollarIcon` |
| Margin / Percent | `ReceiptPercentIcon` |

---

## Critical KPI Card Rules

1. **One icon color system: `bg-blue-50` + `text-blue-600`** for all icons. Exception: `variant="alert"` cards use `bg-rose-50` + `text-rose-500`.
2. **Value font is `text-[22px] font-semibold`** with `tabular-nums` class for number alignment.
3. **Label is sentence-case or abbreviated UPPERCASE** — if uppercase, max 3 words, `tracking-[0.06em]`.
4. **Delta text is `text-[11px] font-medium`** — never larger. It's supporting information, not the headline.
5. **No card drop shadows.** Border + white surface against `bg-slate-50` creates sufficient depth.
6. **Hover state: `hover:border-slate-300`** — subtle interaction feedback without animation.
7. **`tabular-nums` on all numeric values** — prevents layout shift when numbers change.
