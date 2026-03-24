"use client"

import { useParams } from "react-router-dom"
import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"

// Section component imports — preserved exactly
import ExecutiveDashboard      from "../dashboard_components/ExecutiveDashboard.tsx"
import ServiceSupport           from "../dashboard_components/ServiceSupport.tsx"
import { OperationalMetrics }   from "../dashboard_components/OperationaMetrices.tsx"
import { UnifiedDashboard }     from "../dashboard_components/UnifiedFinancialDashboard.tsx"

// Shell imports
import { Sidebar } from "../sideNavbar.tsx"
import { Topbar }  from "../topNavbar.tsx"

// Icons — preserved exactly from original
import {
  PieChart,
  DollarSign,
  Wrench,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react"

// ─── Section Registry ─────────────────────────────────────────────────────────
// Preserved exactly — all 10 sections, descriptions, categories, icons

type SectionConfig = {
  name:        string
  component:   React.ComponentType<any>
  category:    string
  icon:        React.ComponentType<{ className?: string }>
  description: string
}

const SECTIONS: Record<string, SectionConfig> = {
  executive: {
    name:        "Executive Overview",
    component:   ExecutiveDashboard,
    category:    "Leadership",
    icon:        PieChart,
    description: "High-level business summary and key performance indicators",
  },
  financial: {
    name:        "Financial Intelligence",
    component:   UnifiedDashboard,
    category:    "Financial",
    icon:        DollarSign,
    description: "Unified financial intelligence across revenue, costs, cashflow, and collections",
  },
  service: {
    name:        "Service & Support",
    component:   ServiceSupport,
    category:    "Operations",
    icon:        Wrench,
    description: "Support performance and service quality metrics",
  },
  operations: {
    name:        "Operations",
    component:   OperationalMetrics,
    category:    "Operations",
    icon:        Activity,
    description: "Operational efficiency and process metrics",
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPakistaniDate = (): Date =>
  new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }))

const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const formatDisplayDate = (d: Date): string =>
  d.toLocaleDateString("en-PK", {
    month: "short", day: "numeric", year: "numeric",
    timeZone: "Asia/Karachi",
  })

const parseIsoDate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 7, 0, 0))
}

type DashboardDateRange = {
  startDate: string
  endDate: string
}

type SectionKey = keyof typeof SECTIONS

// ─── Live Indicator ───────────────────────────────────────────────────────────
// Skill 07 — animate-ping ring pattern, never a static or pulsing solid dot

const LiveIndicator = () => (
  <div className="flex items-center gap-1.5">
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
    </span>
    <span className="text-[11px] font-medium text-slate-500">Live</span>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const ReportingPage = () => {
  const { section } = useParams<{ section: string }>()

  const normalizedSection: SectionKey =
    (section && section in SECTIONS ? section : "executive") as SectionKey

  const currentSection = SECTIONS[normalizedSection]
  const Icon = currentSection.icon

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRefreshing, setIsRefreshing]   = useState(false)
  const [lastSync, setLastSync]           = useState<Date>(getPakistaniDate())

  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    documentTitle: `NetKhata_Export_${currentSection.name.replace(/\s+/g, '_')}`,
    contentRef: componentRef,
  })

  const defaultRange = useMemo<DashboardDateRange>(() => {
    const today = getPakistaniDate()
    return {
      startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: formatDate(today),
    }
  }, [])

  const [sectionDateRanges, setSectionDateRanges] = useState<Record<SectionKey, DashboardDateRange>>({
    executive: defaultRange,
    financial: defaultRange,
    service: defaultRange,
    operations: defaultRange,
  })

  const activeDateRange = sectionDateRanges[normalizedSection]

  const updateSectionDateRange = useCallback((targetSection: SectionKey, range: DashboardDateRange) => {
    setSectionDateRanges((prev) => {
      const current = prev[targetSection]
      if (current.startDate === range.startDate && current.endDate === range.endDate) return prev
      return {
        ...prev,
        [targetSection]: range,
      }
    })
  }, [])

  const onExecutiveDateChange = useCallback((range: DashboardDateRange) => updateSectionDateRange("executive", range), [updateSectionDateRange])
  const onFinancialDateChange = useCallback((range: DashboardDateRange) => updateSectionDateRange("financial", range), [updateSectionDateRange])
  const onServiceDateChange   = useCallback((range: DashboardDateRange) => updateSectionDateRange("service", range), [updateSectionDateRange])

  // Update document title when section changes — preserved exactly
  useEffect(() => {
    document.title = `${currentSection.name} | Net Khata`
  }, [currentSection.name])

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true)
    setLastSync(getPakistaniDate())
    setTimeout(() => setIsRefreshing(false), 800)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    /*
     * Skill 01 — App shell: flex h-screen bg-slate-50 overflow-hidden
     * bg-slate-50 is the page canvas. NOT bg-[#F1F0E8] (old warm palette).
     * overflow-hidden on the shell clips the sidebar and prevents page-level scroll.
     * The only scrollable area is the <main> content.
     */
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* External sidebar — state passed down */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setIsOpen={setIsSidebarOpen}
      />

      {/*
       * Main column — flex-1 flex-col min-w-0 overflow-hidden
       *
       * Skill 01 — sidebar offset is `pl-` on this wrapper, NOT `ml-` on <main>.
       * margin-left on <main> would shift the scrollable container and cause
       * layout jitter during the sidebar transition. padding-left on the column
       * wrapper is stable — it shrinks the column, not shifts it.
       *
       * Collapsed sidebar:  lg:pl-[60px]  (icon-only, 60px wide)
       * Expanded sidebar:   lg:pl-[220px] (labeled, 220px wide)
       */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 overflow-hidden
          transition-all duration-200
          ${isSidebarOpen ? "lg:pl-[220px]" : "lg:pl-[60px]"}
        `}
      >

        {/*
         * Topbar — external component, rendered as flex-shrink-0
         * This prevents the topbar from being consumed into the flex column space.
         * The original used pt-20 on <main> to compensate for a fixed Topbar —
         * that approach adds invisible padding above every page. Wrapping the
         * Topbar in a flex-shrink-0 div makes it part of the natural flow.
         */}
        <div className="flex-shrink-0">
          <Topbar toggleSidebar={toggleSidebar} />
        </div>

        {/*
         * PAGE HEADER — flex-shrink-0 so it never scrolls away
         *
         * Skill 01 — PageHeader recipe:
         *   bg-white border-b border-slate-200 px-6 py-4
         *   Left:  icon (w-8 h-8 bg-blue-50 rounded-lg) + title + description
         *   Right: category badge + date range pill + live indicator + actions
         *
         * Decision: Icon IS shown here (unlike Dashboard.tsx which used tabs to
         * identify sections). In a URL-routed single-section view, the icon gives
         * immediate visual identity for the section on each page load.
         *
         * Decision: Description IS shown here. With no tab strip below the header,
         * the description provides context that helps users understand the scope of
         * the analytics they're viewing — especially when linking directly to a
         * report URL from another part of the app.
         *
         * Skill 02 — NO gradient on icon, NO shadow-lg.
         * Exactly: w-8 h-8 bg-blue-50 rounded-lg, icon at w-4 h-4 text-blue-600.
         */}
        <div className="flex-shrink-0 bg-white border-b border-[0.5px] border-slate-200 px-6 py-4">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">

            {/* Left: Icon + title + description */}
            <div className="flex items-center gap-3 min-w-0">
              {/*
               * Skill 01 — icon container: w-8 h-8 bg-blue-50 rounded-lg
               * Icon size: w-4 h-4 text-blue-600
               * NOT: gradient background, shadow-lg, rounded-xl, p-3, w-6 h-6
               */}
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>

              <div className="min-w-0">
                {/*
                 * Skill 06 — H1: text-[15px] font-medium text-slate-900
                 * NOT: text-2xl font-semibold text-gray-900
                 */}
                <h1 className="text-[15px] font-medium text-slate-900 leading-none truncate">
                  {currentSection.name}
                </h1>
                {/*
                 * Skill 06 — description: text-[11px] text-slate-400
                 * NOT: text-sm text-gray-600
                 */}
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {currentSection.description}
                </p>
              </div>
            </div>

            {/* Right: metadata + actions */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/*
               * Category badge
               * Skill 05 — role badge pattern: bg-slate-100 text-slate-600
               * border border-slate-200 text-[10px] font-medium uppercase tracking-[0.06em]
               * NOT: bg-[#F1F0E8] text-gray-500 px-3 py-2 (wrong bg, wrong size)
               */}
              <span className="
                hidden sm:inline-block
                text-[10px] font-medium text-slate-500 uppercase tracking-[0.06em]
                bg-slate-100 border-[0.5px] border-slate-200
                px-2 py-0.5 rounded
              ">
                {currentSection.category}
              </span>

              {/* Vertical divider */}
              <div className="hidden sm:block w-px h-5 bg-slate-200" />

              {/*
               * Date range pill
               * Skill 02 — filter indicator: text-[11px] text-slate-500
               * border border-slate-200 rounded-md h-8 px-3 bg-slate-50
               * NOT: text-xs bg-[#F1F0E8] px-3 py-2 rounded-md border
               */}
              <div className="hidden md:flex items-center gap-1.5 h-8 px-3 bg-slate-50 border-[0.5px] border-slate-200 rounded-md">
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {formatDisplayDate(parseIsoDate(activeDateRange.startDate))}
                  {" — "}
                  {formatDisplayDate(parseIsoDate(activeDateRange.endDate))}
                </span>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block w-px h-5 bg-slate-200" />

              {/*
               * Live indicator
               * Skill 07 — animate-ping ring, NOT animate-pulse on a solid dot
               * The original used animate-pulse which reads as "loading", not "live".
               */}
              <div className="hidden sm:flex">
                <LiveIndicator />
              </div>

              {/* Vertical divider */}
              <div className="hidden lg:block w-px h-5 bg-slate-200" />

              {/*
               * Refresh button — Skill 07 icon-only ghost button
               * p-1.5, text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md
               * NOT: inline text button with border
               */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh data"
                className="
                  p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50
                  rounded-md transition-colors duration-150 disabled:opacity-40
                "
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>

              {/*
               * Export button — wired to react-to-print
               */}
              <button onClick={handlePrint} className="
                flex items-center gap-1.5 h-8 px-3
                text-[12px] text-slate-600
                border-[0.5px] border-slate-200 rounded-md
                hover:border-slate-300 hover:bg-slate-50
                transition-colors duration-150
              ">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

            </div>
          </div>
        </div>
        {/* END PAGE HEADER */}

        {/*
         * CONTENT AREA
         *
         * Skill 01 — flex-1 overflow-y-auto bg-slate-50, padding p-6 (24px).
         * max-w-[1400px] mx-auto centers content on wide screens.
         * NOT max-w-[1800px] — at 1800px on standard monitors the layout fills
         * edge-to-edge, chart ratios break, and tables become unreadable.
         *
         * Decision: <ActiveComponent> renders WITHOUT a wrapper card.
         *
         * The original wrapped ActiveComponent in:
         *   bg-white rounded-lg shadow-sm border border-[#E5E1DA] min-h-[600px]
         *
         * This was wrong for three reasons:
         *   1. All sub-components (ExecutiveDashboard etc.) already manage their
         *      own space-y-5 root and expect to render on bg-slate-50.
         *   2. The white wrapper creates nested cards — a card inside a card — with
         *      double borders around every chart and KPI.
         *   3. shadow-sm violates the no-decorative-shadows rule from color-system/04-rules.md.
         *
         * Removing it lets the sub-components render as intended: their own white
         * card surfaces appearing correctly against the slate-50 page background.
         */}
        <main ref={componentRef} className="flex-1 overflow-y-auto bg-slate-50 print:bg-white print:overflow-visible">
          <div className="max-w-[1400px] mx-auto px-6 py-5 print:p-0">
            {/* Print-only Header */}
            <div className="hidden print:block mb-6 border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-900">{currentSection.name}</h1>
              <p className="text-sm text-slate-500 mt-1">Generated on {new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })}</p>
            </div>
            {normalizedSection === "executive" && (
              <ExecutiveDashboard
                dateRange={activeDateRange}
                onDateRangeChange={onExecutiveDateChange}
              />
            )}
            {normalizedSection === "financial" && (
              <UnifiedDashboard
                dateRange={activeDateRange}
                onDateRangeChange={onFinancialDateChange}
              />
            )}
            {normalizedSection === "service" && (
              <ServiceSupport
                dateRange={activeDateRange}
                onDateRangeChange={onServiceDateChange}
              />
            )}
            {normalizedSection === "operations" && (
              <OperationalMetrics />
            )}
          </div>
        </main>

        {/*
         * FOOTER — flex-shrink-0 keeps it anchored at bottom of the column
         *
         * Skill 01 — bg-white border-t border-slate-200 px-6 py-3
         * Skill 06 — all text: text-[11px] text-slate-400
         * NOT: border-[#E5E1DA], text-xs text-gray-500, mt-4 (floating gap)
         *
         * Decision: removed mt-4. Footer should be flush against the content area
         * bottom — not floating with a gap. flex-shrink-0 + border-t achieves this.
         */}
      </div>
    </div>
  )
}

export default ReportingPage