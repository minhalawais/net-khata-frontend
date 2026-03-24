# Skill 02 — Sidebar & Top Navigation
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Current Dashboard Problems (from screenshot)

- Sidebar is icon-only with no labels — works but loses context at a glance
- Active state is a solid blue square — too abrupt
- No section grouping labels
- Top bar mixes too many visual weights

---

## Sidebar Component

### Structure
```jsx
function Sidebar({ collapsed = false }) {
  return (
    <aside className={`
      flex flex-col h-screen bg-[#020617] border-r border-white/[0.06]
      transition-all duration-200
      ${collapsed ? 'w-[60px]' : 'w-[220px]'}
    `}>
      {/* Logo */}
      <SidebarLogo collapsed={collapsed} />

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        <SidebarSection label="Main" collapsed={collapsed}>
          <SidebarItem href="/dashboard"  icon={<ChartBarIcon />} label="Dashboard"  />
          <SidebarItem href="/billing"    icon={<CurrencyIcon />} label="Billing" badge={3} />
          <SidebarItem href="/customers"  icon={<UsersIcon />}    label="Customers"  />
        </SidebarSection>

        <SidebarSection label="Network" collapsed={collapsed}>
          <SidebarItem href="/mikrotik"   icon={<ServerIcon />}   label="MikroTik"   />
          <SidebarItem href="/field-ops"  icon={<MapPinIcon />}   label="Field Ops"  />
          <SidebarItem href="/monitoring" icon={<ActivityIcon />} label="Monitoring" />
        </SidebarSection>

        <SidebarSection label="Reports" collapsed={collapsed}>
          <SidebarItem href="/reports"    icon={<BarChartIcon />} label="Reports"    />
          <SidebarItem href="/analytics"  icon={<TrendingIcon />} label="Analytics"  />
        </SidebarSection>
      </nav>

      {/* Footer */}
      <SidebarFooter collapsed={collapsed} />
    </aside>
  )
}
```

---

## Sidebar Logo

```jsx
function SidebarLogo({ collapsed }) {
  return (
    <div className="flex items-center h-14 px-4 border-b border-white/[0.06] flex-shrink-0">
      {collapsed ? (
        <span className="text-blue-400 font-semibold text-sm">N</span>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-white font-medium text-[14px]">Net</span>
          <span className="text-blue-400 font-medium text-[14px]">Daftar</span>
        </div>
      )}
    </div>
  )
}
```

---

## Sidebar Section Label

```jsx
function SidebarSection({ label, collapsed, children }) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="text-[10px] font-medium text-slate-600 uppercase tracking-[0.08em] px-3 mb-1.5">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}
```

---

## Sidebar Nav Item

This is the most important component. The active state uses a subtle blue tint — not a solid block.

```jsx
function SidebarItem({ href, icon, label, badge, collapsed }) {
  const { pathname } = useLocation()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      to={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium
        transition-colors duration-150 relative group
        ${isActive
          ? 'bg-blue-600/[0.14] text-blue-300'
          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
        }
      `}
    >
      {/* Active indicator — left edge */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-400 rounded-r" />
      )}

      {/* Icon */}
      <span className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </span>

      {/* Label */}
      {!collapsed && (
        <span className="flex-1 truncate">{label}</span>
      )}

      {/* Badge */}
      {!collapsed && badge && (
        <span className="bg-blue-700 text-blue-100 text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="
          absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-100 text-xs
          rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100
          pointer-events-none transition-opacity duration-150 z-50
        ">
          {label}
        </div>
      )}
    </Link>
  )
}
```

---

## Sidebar Footer (User + Collapse Toggle)

```jsx
function SidebarFooter({ collapsed, onToggle }) {
  return (
    <div className="border-t border-white/[0.06] p-3 space-y-2">
      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center p-2 text-slate-500
                   hover:text-slate-300 hover:bg-white/[0.04] rounded-md
                   transition-colors duration-150"
      >
        {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
      </button>
    </div>
  )
}
```

---

## Top Header Bar

```jsx
function TopBar() {
  return (
    <header className="
      h-14 flex-shrink-0 bg-white border-b border-slate-200
      flex items-center justify-between px-5
    ">
      {/* Left: breadcrumb or page context */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Executive</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-medium text-slate-700">Overview</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Date range pill */}
        <button className="
          flex items-center gap-1.5 text-xs text-slate-600
          border border-slate-200 rounded-md px-3 py-1.5
          hover:border-slate-300 transition-colors
        ">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
          1/1/2026 – 3/19/2026
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500">Live</span>
        </div>

        {/* Notification bell */}
        <button className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
          <BellIcon className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-[10px] font-medium text-blue-800">MB</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-800 leading-none">Muhammad Bilal</p>
            <p className="text-[10px] text-slate-400 mt-0.5">company_owner</p>
          </div>
        </div>
      </div>
    </header>
  )
}
```

---

## Tab / View Switcher (Executive Summary | Ledger)

```jsx
function ViewTabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150
            ${active === tab.id
              ? 'bg-white text-slate-800 border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Header Action Buttons (Filters, Refresh, Export)

```jsx
{/* Filter button */}
<button className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-1.5 hover:border-slate-300">
  <FilterIcon className="w-3.5 h-3.5" />
  Filters
</button>

{/* Refresh button */}
<button className="p-1.5 text-slate-500 border border-slate-200 rounded-md hover:border-slate-300 hover:text-slate-700">
  <RefreshIcon className="w-3.5 h-3.5" />
</button>

{/* Export button — PRIMARY */}
<button className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 rounded-md px-3 py-1.5 hover:bg-blue-700 transition-colors">
  <DownloadIcon className="w-3.5 h-3.5" />
  Export
</button>
```

---

## Critical Sidebar Rules

1. **Never use a solid color block as the active state.** Use `bg-blue-600/[0.14]` (14% opacity) with a left edge indicator.
2. **Section labels must be `text-[10px] uppercase tracking-[0.08em]` in `text-slate-600`.** Never larger, never a different color.
3. **Icon size is exactly `w-4 h-4` (16px).** Never `w-5 h-5` — it makes items feel heavy.
4. **Sidebar background is `#020617` (slate-950).** Never lighten it — contrast is the point.
5. **Collapsed sidebar shows icon + tooltip only.** Never show partial labels.
6. **Nav item font-size is `text-[12px]`.** Never `text-sm` (14px) — too large for sidebar items.
