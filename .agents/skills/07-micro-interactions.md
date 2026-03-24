# Skill 07 — Micro-interactions, Loading & Transitions
**NetDaftar ERP · React + Tailwind · Slate + Blue**

## Philosophy

ERP users stare at dashboards for hours. The goal is not animation for delight — it is **feedback for confidence**. Every interaction should acknowledge the user's action within 100ms. Loading states should communicate "working" not "broken."

**Rule: Use animation to reduce perceived wait time and confirm state changes. Never use animation decoratively.**

---

## Transition Primitives (Tailwind classes to always use)

```jsx
// Standard transition for color/border changes (hover states)
className="transition-colors duration-150"

// Standard transition for opacity (show/hide)
className="transition-opacity duration-150"

// Standard transition for transform (collapse, expand)
className="transition-all duration-200"

// Sidebar collapse
className="transition-all duration-200 ease-in-out"
```

**Never use `duration-300` or longer for UI feedback — it feels sluggish in data-dense apps.**

---

## Hover States Per Component

### KPI Card hover
```jsx
<div className="bg-white rounded-[10px] border border-slate-200 p-5
                hover:border-slate-300 transition-colors duration-150 cursor-default">
```

### Table row hover
```jsx
<tr className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
```

### Sidebar nav item hover (inactive)
```jsx
<a className="... hover:bg-white/[0.04] hover:text-slate-200 transition-colors duration-150">
```

### Button hover
```jsx
{/* Primary */}
<button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-150">

{/* Ghost */}
<button className="border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150">
```

### Icon button hover
```jsx
<button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100
                   rounded-md transition-colors duration-150">
```

---

## Loading States

### Full card skeleton
```jsx
function CardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200 p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-3.5 w-32 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
      {/* Content lines */}
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-4/6" />
      </div>
    </div>
  )
}
```

### KPI card skeleton
```jsx
function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
        <div className="h-3 w-10 bg-slate-100 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-20 bg-slate-100 rounded" />
        <div className="h-6 w-28 bg-slate-200 rounded" />
      </div>
    </div>
  )
}
```

### Chart skeleton
```jsx
function ChartSkeleton({ height = 220 }) {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 animate-pulse">
        <div className="h-3.5 w-40 bg-slate-200 rounded" />
        <div className="h-6 w-20 bg-slate-100 rounded" />
      </div>
      <div className="p-5 animate-pulse" style={{ height }}>
        {/* Fake bars */}
        <div className="flex items-end justify-around h-full gap-2 pb-6">
          {[40, 65, 55, 80, 70, 90, 75, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-slate-100 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Spinners

### Inline spinner (inside button)
```jsx
function Spinner({ size = 'sm' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5' }
  return (
    <svg className={`${sizes[size]} animate-spin text-current`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

{/* Button with loading state */}
<button
  disabled={isLoading}
  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md
             text-[13px] font-medium disabled:opacity-60 transition-opacity"
>
  {isLoading && <Spinner />}
  {isLoading ? 'Exporting...' : 'Export'}
</button>
```

### Page-level refresh indicator
```jsx
{isRefreshing && (
  <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50">
    <div className="flex items-center gap-2 bg-slate-900 text-white text-[12px] font-medium
                    px-3 py-1.5 rounded-full shadow-lg">
      <Spinner />
      Refreshing data...
    </div>
  </div>
)}
```

---

## Live Indicator (replacing the current green dot)

```jsx
function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      <span className="text-[11px] text-slate-500 font-medium">Live</span>
    </div>
  )
}
```

---

## Number Counter Animation (KPI values)

When KPI values update, animate the number changing:

```jsx
import { useEffect, useRef, useState } from 'react'

function AnimatedNumber({ value, duration = 600, formatter = (v) => v }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef(0)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const start = startRef.current
    const end = value

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)  // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
      else {
        startRef.current = end
        startTimeRef.current = null
      }
    }

    requestAnimationFrame(step)
  }, [value, duration])

  return <span>{formatter(display)}</span>
}

// Usage in KPI card
<AnimatedNumber value={449000} formatter={(v) => `${(v/1000).toFixed(0)}K`} />
```

---

## Toast Notifications

```jsx
// Simple toast for export success, refresh, errors
function Toast({ message, type = 'success', onClose }) {
  const styles = {
    success: 'bg-slate-900 text-white',
    error:   'bg-rose-600 text-white',
    info:    'bg-blue-600 text-white',
  }

  return (
    <div className={`
      fixed bottom-5 right-5 z-50
      flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
      text-[13px] font-medium
      animate-in slide-in-from-bottom-2 fade-in duration-200
      ${styles[type]}
    `}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1">✕</button>
    </div>
  )
}
```

---

## Sidebar Collapse Animation

```jsx
// The sidebar width should animate, not jump
<aside className={`
  flex flex-col h-screen bg-[#020617] border-r border-white/[0.06]
  transition-all duration-200 ease-in-out overflow-hidden flex-shrink-0
  ${collapsed ? 'w-[60px]' : 'w-[220px]'}
`}>

{/* Labels fade out when collapsing */}
{!collapsed && (
  <span className="flex-1 truncate opacity-100 transition-opacity duration-150">
    {label}
  </span>
)}
```

---

## Data Refresh Pattern

```jsx
// Show subtle data age — don't force refresh
function DataAgeIndicator({ lastSync }) {
  const [age, setAge] = useState('')

  useEffect(() => {
    const update = () => {
      const seconds = Math.floor((Date.now() - lastSync) / 1000)
      if (seconds < 60)  setAge('just now')
      else if (seconds < 3600) setAge(`${Math.floor(seconds / 60)}m ago`)
      else setAge(new Date(lastSync).toLocaleTimeString())
    }
    update()
    const interval = setInterval(update, 30_000)
    return () => clearInterval(interval)
  }, [lastSync])

  return (
    <span className="text-[11px] text-slate-400">Last sync: {age}</span>
  )
}
```

---

## Critical Animation Rules

1. **Max `duration-200` for all UI transitions.** Longer feels like lag, not polish.
2. **`animate-pulse` for skeletons only.** Never use pulse on live content.
3. **No entrance animations on page load.** They delay the user from seeing data.
4. **Counter animations max `600ms`.** Longer feels like a demo, not a tool.
5. **`transition-colors duration-150` on every interactive element.** No raw state jumps.
6. **The live indicator (`animate-ping`) is the only looping animation allowed.** No rotating spinners on idle content.
7. **Disabled buttons use `opacity-60`, not `cursor-not-allowed` only.** Both are needed.
