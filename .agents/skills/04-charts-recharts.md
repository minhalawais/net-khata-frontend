# Skill 04 — Charts (Recharts)
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Current Dashboard Problems (from screenshot)

- Revenue trend chart uses green tones — off-brand
- Customer growth chart uses red/green bars — semantic collision (green = new, red = churned — accidentally looks like success/danger)
- Donut chart has 3 mismatched colors (teal, yellow, green)
- Chart backgrounds and grid lines are too prominent
- No chart tooltip styling — uses browser default

---

## Install

```bash
npm install recharts
```

---

## Design Tokens for Charts (always use these values)

```js
// chart-tokens.js — import this in every chart component
export const CHART = {
  // Blues — sequential data (single series or same-meaning bars)
  blue: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',   // primary bar / line color
    700: '#1D4ED8',
  },

  // Multi-series colors (use ONLY when you have 2–3 distinct data series)
  series: {
    primary:   '#2563EB',  // blue-600   — main metric
    secondary: '#93C5FD',  // blue-300   — comparison / secondary
    success:   '#16A34A',  // emerald-600 — positive category (new customers)
    danger:    '#E11D48',  // rose-600    — negative category (churned)
    neutral:   '#94A3B8',  // slate-400   — neutral / total / baseline
  },

  // Chart infrastructure
  grid:        '#F1F5F9',  // slate-100 — gridlines
  axis:        '#94A3B8',  // slate-400 — axis labels
  tooltip: {
    bg:        '#0F172A',  // slate-900
    text:      '#F8FAFC',  // slate-50
    border:    'transparent',
  },
}
```

---

## Recharts Global Defaults

Wrap your app or chart section with this config:

```jsx
// In each chart, set these props consistently:
const CHART_DEFAULTS = {
  margin: { top: 4, right: 4, bottom: 0, left: 0 },
}

const AXIS_STYLE = {
  tick: { fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' },
  axisLine: false,
  tickLine: false,
}

const GRID_STYLE = {
  stroke: '#F1F5F9',
  strokeDasharray: 'none',
  vertical: false,  // horizontal gridlines only — cleaner
}
```

---

## Chart 1 — Area Chart (Revenue vs Collection Trend)

```jsx
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

function RevenueCollectionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2563EB" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="slateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#94A3B8" stopOpacity={0.10} />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#F1F5F9" strokeDasharray="none" vertical={false} />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
          width={40}
        />

        <Tooltip content={<ChartTooltip />} />

        <Legend
          iconType="line"
          iconSize={12}
          wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 12 }}
        />

        {/* Expected — shown as dashed line, no fill */}
        <Area
          type="monotone"
          dataKey="expected"
          name="Expected"
          stroke="#94A3B8"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="url(#slateGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#94A3B8' }}
        />

        {/* Collected — solid line with fill */}
        <Area
          type="monotone"
          dataKey="collected"
          name="Collected"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#blueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

---

## Chart 2 — Grouped Bar + Line (Customer Growth)

```jsx
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

function CustomerGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="#F1F5F9" strokeDasharray="none" vertical={false} />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          yAxisId="count"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false} tickLine={false}
          width={30}
        />
        <YAxis
          yAxisId="total"
          orientation="right"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false} tickLine={false}
          width={36}
        />

        <Tooltip content={<ChartTooltip />} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 12 }}
        />

        {/* New customers — primary blue bars */}
        <Bar
          yAxisId="count"
          dataKey="new"
          name="New"
          fill="#2563EB"
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
        />

        {/* Churned — rose bars */}
        <Bar
          yAxisId="count"
          dataKey="churned"
          name="Churned"
          fill="#FDA4AF"   /* rose-300 — deliberately lighter, not alarming */
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
        />

        {/* Total active — slate line */}
        <Line
          yAxisId="total"
          type="monotone"
          dataKey="totalActive"
          name="Total Active"
          stroke="#94A3B8"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
```

---

## Chart 3 — Donut Chart (Payment Methods)

```jsx
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

// Payment method colors — 4 max, blue-family + one contrast
const PAYMENT_COLORS = ['#2563EB', '#60A5FA', '#BFDBFE', '#94A3B8']

function PaymentMethodsChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[18px] font-semibold text-slate-900 tabular-nums">{total.toLocaleString()}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Total</p>
      </div>

      {/* Legend below */}
      <div className="mt-3 space-y-1.5">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: PAYMENT_COLORS[i] }} />
              <span className="text-slate-600">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2 tabular-nums">
              <span className="text-slate-400">{((entry.value / total) * 100).toFixed(0)}%</span>
              <span className="font-medium text-slate-700">{entry.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Chart 4 — Horizontal Bar (Top Areas by Revenue)

```jsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'

function TopAreasChart({ data }) {
  // Sort descending
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue)
  const max = sorted[0]?.revenue || 1

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 0, right: 8, bottom: 0, left: 60 }}
      >
        <CartesianGrid stroke="#F1F5F9" strokeDasharray="none" horizontal={false} />

        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
        />
        <YAxis
          type="category"
          dataKey="area"
          tick={{ fontSize: 11, fill: '#475569' }}
          axisLine={false} tickLine={false}
          width={56}
        />

        <Tooltip content={<ChartTooltip horizontal />} />

        <Bar dataKey="revenue" radius={[0, 3, 3, 0]} maxBarSize={14}>
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={i === 0 ? '#2563EB' : i === 1 ? '#3B82F6' : i === 2 ? '#60A5FA' : '#BFDBFE'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## Chart 5 — Grouped Bar (Revenue vs Cost)

```jsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function RevenueVsCostChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="#F1F5F9" strokeDasharray="none" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
               tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="square" iconSize={8}
                wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 12 }} />

        <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={32} />
        <Bar dataKey="cost"    name="Cost"    fill="#FDA4AF" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## Custom Tooltip Component (use on ALL charts)

```jsx
function ChartTooltip({ active, payload, label, horizontal }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
      {label && (
        <p className="text-[11px] text-slate-400 mb-1.5 font-medium">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: entry.color || entry.fill }}
            />
            <span className="text-[11px] text-slate-300">{entry.name}</span>
            <span className="text-[11px] font-medium text-white tabular-nums ml-auto pl-4">
              {typeof entry.value === 'number'
                ? entry.value > 999
                  ? `${(entry.value / 1000).toFixed(1)}K`
                  : entry.value.toLocaleString()
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Chart Card Wrapper

Every chart should be wrapped in this:

```jsx
function ChartCard({ title, subtitle, action, height = 220, children }) {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-[13px] font-medium text-slate-900">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

// Usage
<ChartCard
  title="Revenue vs Collection Trend"
  subtitle="Expected vs actual collections over time"
  action={<PeriodSelector />}
>
  <RevenueCollectionChart data={data} />
</ChartCard>
```

---

## Chart Color Rules

| Chart type | Color rule |
|-----------|-----------|
| Single series (bar, line, area) | Always `#2563EB` (blue-600) |
| Sequential bar chart (ranked) | Blue-600 → Blue-500 → Blue-400 → Blue-200 (darkest = highest) |
| Two series comparison | Blue-600 (primary) + Slate-400 (secondary/expected) |
| Positive vs negative bars | Blue-600 (positive) + Rose-300 `#FDA4AF` (negative — light, not alarming) |
| Revenue vs Cost | Blue-600 (revenue) + Rose-300 (cost) |
| Donut / Pie | Blue-600, Blue-400, Blue-200, Slate-300 |

**Never use green in charts (it collides with success status semantics). Never use more than 3 colors in a single chart.**
