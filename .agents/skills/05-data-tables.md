# Skill 05 — Data Tables
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Current Dashboard Problems (from screenshot)

- "Overdue Invoices" days badges (318d, 287d, 257d) use red/coral backgrounds that are visually alarming
- Table headers have no background differentiation — blend into rows
- No hover state on table rows
- Rank numbers (#1–5) in Top Service Plans have no special treatment
- Growth deltas (↑1.2%, ↑45.7%) are good but font-size is too small to read quickly

---

## Base Table Component

```jsx
function DataTable({ columns, data, className }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`
                  px-4 py-2.5 text-[11px] font-medium text-slate-400
                  uppercase tracking-[0.06em] whitespace-nowrap
                  ${col.align === 'right' ? 'text-right' : 'text-left'}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-100"
            >
              {columns.map((col, j) => (
                <td
                  key={j}
                  className={`
                    px-4 py-3 text-[13px] text-slate-700
                    ${col.align === 'right' ? 'text-right' : 'text-left'}
                    ${col.mono ? 'tabular-nums font-medium text-slate-900' : ''}
                  `}
                >
                  {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Table 1 — Top Service Plans

```jsx
function TopServicePlansTable({ data }) {
  const columns = [
    {
      key: 'rank',
      header: '#',
      render: (val) => (
        <span className="text-[12px] font-medium text-slate-400 tabular-nums">{val}</span>
      )
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (val) => (
        <span className="text-[13px] font-medium text-slate-800">{val}</span>
      )
    },
    {
      key: 'subscribers',
      header: 'Subscribers',
      align: 'right',
      mono: true,
      render: (val) => (
        <span className="tabular-nums text-[13px] text-slate-700">{val}</span>
      )
    },
    {
      key: 'mrr',
      header: 'MRR',
      align: 'right',
      render: (val) => (
        <span className="tabular-nums text-[13px] font-medium text-slate-900">
          <span className="text-slate-400 text-[11px] mr-0.5">PKR</span>{val}
        </span>
      )
    },
    {
      key: 'growth',
      header: 'Growth',
      align: 'right',
      render: (val) => {
        const isPositive = val >= 0
        return (
          <span className={`
            text-[12px] font-medium tabular-nums
            ${isPositive ? 'text-emerald-600' : 'text-rose-500'}
          `}>
            {isPositive ? '↑' : '↓'} {Math.abs(val).toFixed(1)}%
          </span>
        )
      }
    }
  ]

  return (
    <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-medium text-slate-900">Top Service Plans</h3>
        <button className="text-[11px] text-blue-600 hover:text-blue-700 font-medium">View all</button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

---

## Table 2 — Overdue Invoices

The days-overdue badge is the key design challenge: it must communicate urgency without being visually alarming on every row.

```jsx
function OverdueDaysBadge({ days }) {
  // Severity tiers based on days overdue
  const tier =
    days >= 300 ? 'critical' :
    days >= 200 ? 'high' :
    days >= 100 ? 'medium' : 'low'

  const styles = {
    critical: 'bg-rose-100 text-rose-700 border border-rose-200',
    high:     'bg-orange-50 text-orange-600 border border-orange-200',
    medium:   'bg-amber-50 text-amber-600 border border-amber-200',
    low:      'bg-slate-100 text-slate-500 border border-slate-200',
  }

  return (
    <span className={`
      inline-block text-[11px] font-medium tabular-nums
      px-2 py-0.5 rounded-full whitespace-nowrap
      ${styles[tier]}
    `}>
      {days}d
    </span>
  )
}

function OverdueInvoicesTable({ data, pendingCount }) {
  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (val, row) => (
        <div>
          <p className="text-[13px] font-medium text-slate-800 leading-tight">{val}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{row.username}</p>
        </div>
      )
    },
    {
      key: 'invoice',
      header: 'Invoice',
      render: (val) => (
        <span className="text-[12px] text-slate-500 font-mono">{val}</span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (val) => (
        <span className="text-[13px] font-medium text-slate-900 tabular-nums">
          <span className="text-slate-400 text-[11px] mr-0.5">PKR</span>{val}
        </span>
      )
    },
    {
      key: 'days',
      header: 'Days',
      align: 'right',
      render: (val) => <OverdueDaysBadge days={val} />
    }
  ]

  return (
    <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-[13px] font-medium text-slate-900">Overdue Invoices</h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          {pendingCount} Pending
        </span>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

---

## Sortable Column Header

```jsx
function SortableHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort?.key === sortKey
  const isAsc = currentSort?.dir === 'asc'

  return (
    <th
      className="px-4 py-2.5 text-left cursor-pointer select-none group"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.06em]">
        <span className={isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}>
          {label}
        </span>
        <span className={`text-[10px] ${isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
          {isActive ? (isAsc ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </th>
  )
}
```

---

## Table Loading State (Skeleton)

```jsx
function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-2.5">
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div
                    className="h-3 bg-slate-100 rounded animate-pulse"
                    style={{ width: `${60 + Math.random() * 30}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Table Empty State

```jsx
function TableEmpty({ message = "No data found" }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
        <TableIcon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-[13px] font-medium text-slate-600">{message}</p>
      <p className="text-[12px] text-slate-400 mt-1">Try adjusting your filters or date range</p>
    </div>
  )
}
```

---

## Avatar Cell (Customer with Initials)

```jsx
function CustomerCell({ name, subtitle }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-medium text-blue-800">{initials}</span>
      </div>
      <div>
        <p className="text-[13px] font-medium text-slate-800 leading-tight">{name}</p>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
  )
}
```

---

## Critical Table Rules

1. **Table header background: `bg-slate-50`** with `border-b border-slate-200`. Never transparent header rows.
2. **Header text: `text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]`** — muted, not competing with data.
3. **Row hover: `hover:bg-blue-50/40`** — very subtle blue tint. Never `hover:bg-slate-100` (too harsh).
4. **Row dividers: `border-b border-slate-100`** — one stop lighter than card border. Barely visible.
5. **Numeric columns: always `tabular-nums`** — prevents jitter on number updates.
6. **Amount prefix (PKR): `text-[11px] text-slate-400`** — smaller and muted vs the number itself.
7. **Days overdue: tiered badge** — not a single red for all. Tiered by severity (low/medium/high/critical).
8. **No zebra striping** — hover state provides sufficient row differentiation.
9. **Max 6 columns** in a dashboard table — more requires a dedicated full-page table view.
