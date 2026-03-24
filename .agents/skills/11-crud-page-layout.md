# Skill 11 — CRUD Page Layout (List Pages)
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Audit: What Is Wrong Right Now

Looking at the Employee Management list page:

| Element | Problem | Fix |
|---------|---------|-----|
| Stat cards: 3 different bg colors | White / green-tint / red-tint = decorative semantics | All stats same `bg-slate-50` surface. Status communicated by value + badge only |
| Stat card icons | 3 different icon colors (teal, green-circle, red-circle) | Single icon color: `bg-blue-50 text-blue-600` for all |
| "Credentials" button | Orange — completely off-brand | `bg-slate-700 text-white` quick action buttons |
| Balance column in green | Green text on data value = semantic collision | `text-slate-900 font-medium tabular-nums` — plain |
| Role column | Raw ALL CAPS text — no badge | Proper role badge: `bg-slate-100 text-slate-600` pill |
| Edit button | Solid blue square `[■]` | Icon-only ghost button |
| Delete button | Solid red square `[■]` | Icon-only ghost button in danger variant |
| Search bar | Decent but needs refinement | Defined recipe below |
| Pagination | Too minimal | Full pagination component |

---

## CRUD Page Shell

```jsx
function CrudPage({ title, subtitle, icon, primaryAction, stats, toolbar, children, pagination }) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-[1400px] mx-auto flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="w-4 h-4 text-blue-600">{icon}</span>
            </div>
            <div>
              <h1 className="text-[15px] font-medium text-slate-900">{title}</h1>
              <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
          {primaryAction}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-4">
        {/* Stat strip */}
        {stats && <StatStrip stats={stats} />}

        {/* Search / filter toolbar */}
        {toolbar && (
          <div className="bg-white rounded-[10px] border border-slate-200 px-4 py-3">
            {toolbar}
          </div>
        )}

        {/* Main table card */}
        <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
          {children}
        </div>

        {/* Pagination */}
        {pagination}
      </div>
    </main>
  )
}
```

---

## Stat Strip (replaces the 3-colored KPI cards)

The CRUD page "Total / Active / Inactive" stats use a strip layout — not the full dashboard KPI card. No deltas, no icons, same background for all.

```jsx
function StatStrip({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-[10px] border border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1">
              {stat.label}
            </p>
            <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">
              {stat.value}
            </p>
          </div>
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="w-4.5 h-4.5 text-blue-600">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

{/* Usage */}
<StatStrip stats={[
  { label: 'Total employees',    value: 11, icon: <UsersIcon /> },
  { label: 'Active employees',   value: 11, icon: <CheckCircleIcon /> },
  { label: 'Inactive employees', value: 0,  icon: <XCircleIcon /> },
]} />
```

**Rule: All 3 stat cards have identical styling. `bg-white`, `text-blue-600` icon, `text-slate-900` value. The "0 inactive" communicates absence through its value — not through a red card background.**

---

## Primary Action Button (+ Add New Employee)

```jsx
<button
  onClick={() => setAddOpen(true)}
  className="
    flex items-center gap-1.5
    px-4 py-2 text-[13px] font-medium text-white
    bg-blue-600 hover:bg-blue-700
    rounded-md transition-colors duration-150 flex-shrink-0
  "
>
  <PlusIcon className="w-4 h-4" />
  Add new employee
</button>
```

---

## Search & Filter Toolbar

```jsx
function CrudToolbar({ onSearch, onFilter, onExport, selectedCount }) {
  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-[320px]">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="search"
          placeholder="Search all columns..."
          onChange={(e) => onSearch(e.target.value)}
          className="
            w-full h-9 pl-8 pr-3
            text-[13px] text-slate-900 placeholder:text-slate-400
            bg-white border border-slate-200 rounded-md
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
            hover:border-slate-300 transition-colors duration-150
          "
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bulk action (when rows selected) */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
          <span className="text-[12px] text-slate-500">{selectedCount} selected</span>
          <button className="text-[12px] font-medium text-rose-600 hover:text-rose-700">
            Delete selected
          </button>
        </div>
      )}

      {/* Filters */}
      <button className="flex items-center gap-1.5 h-9 px-3 text-[12px] text-slate-600
                         border border-slate-200 rounded-md hover:border-slate-300
                         transition-colors duration-150">
        <AdjustmentsIcon className="w-3.5 h-3.5" />
        Filters
        <ChevronDownIcon className="w-3 h-3 text-slate-400" />
      </button>

      {/* Export */}
      <button className="flex items-center gap-1.5 h-9 px-3 text-[12px] text-slate-600
                         border border-slate-200 rounded-md hover:border-slate-300
                         transition-colors duration-150">
        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
        Export
      </button>
    </div>
  )
}
```

---

## Table Action Buttons (Quick Actions + Row Actions)

### Quick Action buttons (Profile, Credentials)

Replace the current gray + orange with two ghost-style buttons:

```jsx
function QuickActions({ onProfile, onCredentials }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onProfile}
        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium
                   text-slate-600 bg-slate-100 rounded-md
                   hover:bg-slate-200 hover:text-slate-800
                   transition-colors duration-150"
      >
        <EyeIcon className="w-3 h-3" />
        Profile
      </button>
      <button
        onClick={onCredentials}
        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium
                   text-blue-600 bg-blue-50 rounded-md
                   hover:bg-blue-100 hover:text-blue-700
                   transition-colors duration-150"
      >
        <KeyIcon className="w-3 h-3" />
        Credentials
      </button>
    </div>
  )
}
```

### Row Actions (Edit, Delete) — icon-only

Replace solid blue/red squares with icon-only ghost buttons:

```jsx
function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50
                   rounded-md transition-colors duration-150"
        title="Edit"
      >
        <PencilSquareIcon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50
                   rounded-md transition-colors duration-150"
        title="Delete"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
```

---

## Role Badge

Replace raw ALL CAPS text with a proper badge:

```jsx
const ROLE_STYLES = {
  technician: 'bg-blue-50 text-blue-700 border-blue-200',
  employee:   'bg-slate-100 text-slate-600 border-slate-200',
  admin:      'bg-slate-800 text-slate-100 border-slate-700',
}

function RoleBadge({ role }) {
  const style = ROLE_STYLES[role.toLowerCase()] || ROLE_STYLES.employee
  return (
    <span className={`
      inline-block text-[10px] font-medium uppercase tracking-[0.06em]
      px-2 py-0.5 rounded border ${style}
    `}>
      {role}
    </span>
  )
}
```

---

## Balance / Salary Column

Remove green text — it implies success status. Use plain monospace:

```jsx
function AmountCell({ amount, currency = 'PKR' }) {
  return (
    <span className="text-[13px] text-slate-900 font-medium tabular-nums">
      <span className="text-[11px] text-slate-400 mr-0.5">{currency}</span>
      {Number(amount).toLocaleString()}
    </span>
  )
}
```

---

## Checkbox Select Column

```jsx
{/* Header checkbox */}
<th className="w-10 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
  <input
    type="checkbox"
    checked={allSelected}
    onChange={onSelectAll}
    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600
               focus:ring-2 focus:ring-blue-500/[0.12] cursor-pointer"
  />
</th>

{/* Row checkbox */}
<td className="w-10 px-4 py-3 border-b border-slate-100">
  <input
    type="checkbox"
    checked={isSelected}
    onChange={() => onSelect(row.id)}
    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600
               focus:ring-2 focus:ring-blue-500/[0.12] cursor-pointer"
  />
</td>
```

---

## Pagination

```jsx
function Pagination({ page, totalPages, perPage, totalEntries, onPageChange, onPerPageChange }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-white rounded-b-[10px]">
      {/* Left: entries info + per page */}
      <div className="flex items-center gap-2 text-[12px] text-slate-500">
        <span>Showing</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="h-7 px-2 text-[12px] border border-slate-200 rounded-md
                     focus:outline-none focus:border-blue-500 bg-white text-slate-700"
        >
          {[10, 20, 50, 100].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>of <span className="font-medium text-slate-700">{totalEntries}</span> entries</span>
      </div>

      {/* Right: page controls */}
      <div className="flex items-center gap-1">
        <span className="text-[12px] text-slate-500 mr-2">
          Page <span className="font-medium text-slate-700">{page}</span> of{' '}
          <span className="font-medium text-slate-700">{totalPages}</span>
        </span>
        {[
          { icon: <ChevronDoubleLeftIcon />,  action: () => onPageChange(1),           disabled: page === 1 },
          { icon: <ChevronLeftIcon />,         action: () => onPageChange(page - 1),    disabled: page === 1 },
          { icon: <ChevronRightIcon />,        action: () => onPageChange(page + 1),    disabled: page === totalPages },
          { icon: <ChevronDoubleRightIcon />,  action: () => onPageChange(totalPages),  disabled: page === totalPages },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            disabled={btn.disabled}
            className="w-7 h-7 flex items-center justify-center rounded-md
                       text-slate-500 border border-slate-200
                       hover:border-slate-300 hover:text-slate-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors duration-150"
          >
            <span className="w-3.5 h-3.5">{btn.icon}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## Full Employee Table Column Recipe

```jsx
const columns = [
  { key: 'select',        header: null,             width: 'w-10',  render: (_, row) => <RowCheckbox row={row} /> },
  { key: 'name',          header: 'Name',            render: (_, row) => <NameCell name={row.name} /> },
  { key: 'username',      header: 'Username',        render: (val) => <span className="text-[13px] text-slate-500 font-mono">{val}</span> },
  { key: 'contact',       header: 'Contact',         render: (val) => <span className="text-[13px] text-slate-700 tabular-nums">{val}</span> },
  { key: 'cnic',          header: 'CNIC',            render: (val) => <span className="text-[12px] text-slate-500 font-mono tabular-nums">{val}</span> },
  { key: 'salary',        header: 'Salary',          align: 'right', render: (val) => <AmountCell amount={val} /> },
  { key: 'balance',       header: 'Balance',         align: 'right', render: (val) => <AmountCell amount={val} /> },
  { key: 'role',          header: 'Role',            render: (val) => <RoleBadge role={val} /> },
  { key: 'quickActions',  header: 'Quick actions',   render: (_, row) => <QuickActions row={row} /> },
  { key: 'status',        header: 'Status',          render: (val) => <StatusBadge status={val} /> },
  { key: 'actions',       header: null,              render: (_, row) => <RowActions row={row} /> },
]
```

---

## Critical CRUD Page Rules

1. **Stat strip cards are all identical** — same background, same icon color. Value and label communicate meaning.
2. **No orange anywhere.** "Credentials" button is `bg-blue-50 text-blue-600`. Profile is `bg-slate-100 text-slate-600`.
3. **Row action buttons are icon-only ghosts** — no solid colored squares.
4. **Balance/Salary in plain `text-slate-900`** — never green. Green means "paid/success", not "this is a number".
5. **Role is a badge** — not raw uppercase text.
6. **Table lives inside a card** (`bg-white rounded-[10px] border border-slate-200`).
7. **Toolbar is inside its own card** above the table — not floating.
8. **Pagination is inside the table card**, as the last child with `border-t`.
9. **Search input max-width: `max-w-[320px]`** — never full-width, it looks empty.
10. **`flex-shrink-0` on the primary action button** — prevents it from wrapping on smaller screens.
