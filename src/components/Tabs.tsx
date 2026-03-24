import React, { useState } from "react"

/*
 * Tabs — NetDaftar ERP · Slate + Blue
 *
 * Skill 02 — two tab patterns, both defined:
 *
 * 1. ViewTabs (pill container) — for in-page view switching:
 *    Container: bg-slate-100 rounded-lg p-1 flex gap-1
 *    Active:    bg-white text-slate-900 border border-slate-200 rounded-md
 *    Inactive:  text-slate-500 hover:text-slate-700 rounded-md
 *    Use for: Executive/Ledger switch, chart view toggles, filter modes
 *
 * 2. UnderlineTabs — for page-level section navigation:
 *    Active:    text-blue-600 border-b-2 border-blue-600
 *    Inactive:  text-slate-500 border-b-2 border-transparent hover:text-slate-700
 *    Use for: Dashboard section strips, full-page tab navigation
 *
 * The original Tabs.tsx had:
 *   ✗ bg-blue-500 text-white active state — solid fill tabs, wrong pattern
 *   ✗ bg-gray-200 inactive — 'gray' not in system (only 'slate')
 *   ✗ No tab container styling
 *
 * API is preserved exactly — same props, same children composition.
 * The `variant` prop on TabsList selects which pattern to use.
 */

// ─── Core Tabs State Container ────────────────────────────────────────────────

interface TabsProps {
  defaultValue: string
  className?:   string
  children:     React.ReactNode
}

export function Tabs({ defaultValue, className = "", children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab })
        }
        if (React.isValidElement(child) && child.type === TabsContent) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab })
        }
        return child
      })}
    </div>
  )
}

// ─── Tab List ─────────────────────────────────────────────────────────────────

interface TabsListProps {
  children:    React.ReactNode
  activeTab?:  string
  setActiveTab?: (value: string) => void
  /*
   * variant controls the visual pattern:
   *   "pill" (default) — ViewTabs pill container (for in-page view switching)
   *   "underline"      — Underline tabs (for page-level section navigation)
   */
  variant?:    "pill" | "underline"
}

export function TabsList({
  children,
  activeTab,
  setActiveTab,
  variant = "pill",
}: TabsListProps) {
  const cloned = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === TabsTrigger) {
      return React.cloneElement(child as React.ReactElement<any>, {
        activeTab,
        setActiveTab,
        variant,
      })
    }
    return child
  })

  if (variant === "underline") {
    /*
     * Underline tabs — page-level navigation strip.
     * Tabs sit directly on the bottom border of the container.
     * Scrollable on overflow for 10+ items.
     */
    return (
      <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-full">
          {cloned}
        </div>
      </div>
    )
  }

  /*
   * Pill / ViewTabs (default):
   * Container: bg-slate-100 rounded-lg p-1 flex items-center gap-0.5
   * Matches the pattern used throughout the dashboard (ExecutiveDashboard,
   * FinancialIntelligenceV2, ServiceSupport cockpit bars).
   */
  return (
    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1">
      {cloned}
    </div>
  )
}

// ─── Tab Trigger ──────────────────────────────────────────────────────────────

interface TabsTriggerProps {
  value:        string
  children:     React.ReactNode
  activeTab?:   string
  setActiveTab?: (value: string) => void
  variant?:     "pill" | "underline"
}

export function TabsTrigger({
  value,
  children,
  activeTab,
  setActiveTab,
  variant = "pill",
}: TabsTriggerProps) {
  const isActive = activeTab === value

  if (variant === "underline") {
    /*
     * Skill 02 — underline tab:
     *   Active:   text-blue-600 border-b-2 border-blue-600
     *   Inactive: text-slate-500 border-b-2 border-transparent
     *             hover:text-slate-700 hover:border-slate-300
     */
    return (
      <button
        onClick={() => setActiveTab?.(value)}
        className={`
          flex-shrink-0 px-4 py-2.5
          text-[12px] font-medium whitespace-nowrap
          border-b-2 transition-colors duration-150
          ${isActive
            ? "text-blue-600 border-blue-600"
            : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
          }
        `}
      >
        {children}
      </button>
    )
  }

  /*
   * Skill 02 — ViewTabs pill (default):
   *   Active:   bg-white text-slate-900 border border-slate-200 rounded-[6px]
   *   Inactive: text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-[6px]
   *
   *   NOT: bg-blue-500 text-white (solid fill — wrong pattern for in-page tabs)
   *   NOT: bg-gray-200 (gray not in system)
   */
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`
        px-3 py-1.5 text-[12px] font-medium rounded-[6px]
        transition-colors duration-150 whitespace-nowrap
        ${isActive
          ? "bg-white text-slate-900 border border-slate-200"
          : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
        }
      `}
    >
      {children}
    </button>
  )
}

// ─── Tab Content ──────────────────────────────────────────────────────────────

interface TabsContentProps {
  value:      string
  children:   React.ReactNode
  activeTab?: string
}

export function TabsContent({ value, children, activeTab }: TabsContentProps) {
  if (value !== activeTab) return null
  return <div>{children}</div>
}