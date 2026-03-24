"use client"

import type React from "react"
import { Filter, Calendar, Landmark, Plus, ChevronDown } from "lucide-react"

// ─── framer-motion REMOVED ────────────────────────────────────────────────────
// Was: motion.div / motion.button with entrance animations + whileHover scale.
// Skill 07: no entrance animations on load, no transform on interactive elements.
// All transitions are now Tailwind transition-colors duration-150 only.

// ─── Old COLORS object REMOVED ───────────────────────────────────────────────
// Was: #89A8B2, #B3C8CF, #E5E1DA, #F1F0E8 — old warm palette.
// All tokens now use Slate + Blue system.

// ─── Types — preserved exactly ────────────────────────────────────────────────

interface FilterState {
  startDate:      string
  endDate:        string
  bankAccount:    string
  paymentMethod:  string
  invoiceStatus:  string
  ispPaymentType?: string
  timeRange:      string
}

interface BankOption {
  id:   string
  name: string
}

interface AdvancedFiltersProps {
  filters:             FilterState
  onFilterChange:      (key: keyof FilterState, value: string) => void
  onQuickFilter:       (timeRange: string) => void
  bankAccounts?:       BankOption[]
  onOpenPaymentModal?: () => void
  leadingContent?:     React.ReactNode
  /*
   * compact=true — renders a single unified cockpit bar instead of the
   * full card with section headers. Use inside dashboards where the shell
   * page header already owns the title/description.
   * compact=false (default) — full card with header, for standalone filter pages.
   */
  compact?:            boolean
  onRefresh?:          () => void
  isRefreshing?:       boolean
}

// ─── SelectField ──────────────────────────────────────────────────────────────
// Skill 10 — native select + ChevronDown, appearance-none, h-9, system focus ring

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className="relative">
    <select
      className={`
        w-full h-9 pl-3 pr-8 appearance-none
        text-[12px] text-slate-700 bg-white
        border border-slate-200 rounded-md
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
        hover:border-slate-300 transition-colors duration-150 cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
  </div>
)

// ─── DateInput ────────────────────────────────────────────────────────────────
// Skill 10 — date input with leading CalendarIcon

const DateInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...props }) => (
  <div className="relative">
    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    <input
      type="date"
      className={`
        w-full h-9 pl-8 pr-3
        text-[12px] text-slate-700 bg-white
        border border-slate-200 rounded-md
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
        hover:border-slate-300 transition-colors duration-150
        ${className}
      `}
      {...props}
    />
  </div>
)

// ─── AdvancedFilters Component ────────────────────────────────────────────────

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onQuickFilter,
  bankAccounts = [],
  onOpenPaymentModal,
  leadingContent,
  compact = false,
}) => {

  const quickFilters = [
    { key: "today",      label: "Today"         },
    { key: "week",       label: "Last 7 days"   },
    { key: "mtd",        label: "Month to date" },
    { key: "qtd",        label: "Quarter"       },
    { key: "ytd",        label: "Year to date"  },
    { key: "last_month", label: "Last month"    },
  ]

  const paymentMethods = [
    { value: "all",           label: "All methods"    },
    { value: "cash",          label: "Cash"           },
    { value: "online",        label: "Online transfer" },
    { value: "bank_transfer", label: "Bank transfer"  },
    { value: "credit_card",   label: "Credit card"    },
  ]

  const invoiceStatuses = [
    { value: "all",            label: "All invoices"  },
    { value: "pending",        label: "Pending"       },
    { value: "partially_paid", label: "Partially paid"},
    { value: "paid",           label: "Paid"          },
    { value: "overdue",        label: "Overdue"       },
    { value: "cancelled",      label: "Cancelled"     },
    { value: "refunded",       label: "Refunded"      },
  ]

  const ispPaymentTypes = [
    { value: "all",                  label: "All ISP types"         },
    { value: "monthly_subscription", label: "Monthly subscription"  },
    { value: "bandwidth_usage",      label: "Bandwidth usage"       },
    { value: "infrastructure",       label: "Infrastructure"        },
    { value: "other",                label: "Other"                 },
  ]

  // ─── COMPACT MODE ───────────────────────────────────────────────────────────
  // Single inline cockpit bar — all controls in one row.
  // Used by dashboards where the shell already owns the page title.
  // Before: ~200px (card header + quick periods label + presets row + fields row)
  // After:  ~44px  (one bar, left-to-right: presets | dates | bank | method | type | ↺)

  if (compact) {
    return (
      <div className="bg-white border border-slate-200 rounded-[10px] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">

          {leadingContent && (
            <>
              <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
                {leadingContent}
              </div>
              <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
            </>
          )}

          {/* Quick time presets */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
            {[
              { key: "today",      label: "Today" },
              { key: "week",       label: "7d"    },
              { key: "mtd",        label: "MTD"   },
              { key: "qtd",        label: "QTD"   },
              { key: "ytd",        label: "YTD"   },
              { key: "last_month", label: "Last"  },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => onQuickFilter(p.key)}
                className={`
                  px-2.5 py-1.5 text-[11px] font-medium rounded-[6px] transition-colors duration-150
                  ${filters.timeRange === p.key
                    ? "bg-white text-slate-900 border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

          {/* Date range — compact h-8 */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={filters.startDate}
              onChange={e => onFilterChange("startDate", e.target.value)}
              className="h-8 px-2.5 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            />
            <span className="text-[11px] text-slate-400 flex-shrink-0">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => onFilterChange("endDate", e.target.value)}
              className="h-8 px-2.5 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            />
          </div>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

          {/* Bank account */}
          {bankAccounts.length > 0 && (
            <div className="relative">
              <select
                value={filters.bankAccount}
                onChange={e => onFilterChange("bankAccount", e.target.value)}
                className="h-8 pl-3 pr-7 appearance-none text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-colors duration-150 cursor-pointer"
                style={{ width: 150 }}
              >
                <option value="all">All banks</option>
                {bankAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
              <Landmark className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Payment method */}
          <div className="relative">
            <select
              value={filters.paymentMethod}
              onChange={e => onFilterChange("paymentMethod", e.target.value)}
              className="h-8 pl-3 pr-7 appearance-none text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-colors duration-150 cursor-pointer"
              style={{ minWidth: 100 }}
            >
              <option value="all">All methods</option>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="credit_card">Credit card</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* ISP payment type */}
          <div className="relative">
            <select
              value={filters.ispPaymentType || "all"}
              onChange={e => onFilterChange("ispPaymentType", e.target.value)}
              className="h-8 pl-3 pr-7 appearance-none text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-colors duration-150 cursor-pointer"
              style={{ minWidth: 130 }}
            >
              {ispPaymentTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Invoice status */}
          <div className="relative">
            <select
              value={filters.invoiceStatus}
              onChange={e => onFilterChange("invoiceStatus", e.target.value)}
              className="h-8 pl-3 pr-7 appearance-none text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 hover:border-slate-300 transition-colors duration-150 cursor-pointer"
              style={{ minWidth: 120 }}
            >
              {invoiceStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add transaction */}
          {onOpenPaymentModal && (
            <button
              onClick={onOpenPaymentModal}
              className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}

        </div>
      </div>
    )
  }

  // ─── FULL MODE (default) ──────────────────────────────────────────────────────
  return (
    /*
     * Skill 01 — card wrapper: bg-white rounded-[10px] border border-slate-200
     * No shadow (no decorative shadows rule).
     * No rounded-2xl (cards are rounded-[10px]).
     * mb-4 creates spacing before the controls toolbar below.
     */
    <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">

      {/* Card header — Skill 01 card header pattern */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/*
           * Skill 01 — icon container: w-8 h-8 bg-blue-50 rounded-lg
           * Icon: w-4 h-4 text-blue-600
           * NOT: bg-[#89A8B2]/10 shadow-sm w-10 h-10
           */}
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Filter className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            {/* Skill 06 — H2: text-[13px] font-medium text-slate-900 */}
            <h3 className="text-[13px] font-medium text-slate-900">Advanced filters</h3>
            {/* Skill 06 — caption: text-[11px] text-slate-400 */}
            <p className="text-[11px] text-slate-400 mt-0.5">Refine your data view with custom filters</p>
          </div>
        </div>

        {onOpenPaymentModal && (
          /*
           * Skill 02 — primary button: bg-blue-600 hover:bg-blue-700
           * text-[12px] font-medium text-white, h-8 px-3 rounded-md
           * NOT: bg-[#89A8B2] rounded-lg px-4 py-2 shadow-sm
           */
          <button
            onClick={onOpenPaymentModal}
            className="
              flex items-center gap-1.5 h-8 px-3
              text-[12px] font-medium text-white
              bg-blue-600 hover:bg-blue-700
              rounded-md transition-colors duration-150
            "
          >
            <Plus className="w-3.5 h-3.5" />
            Add transaction
          </button>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">

        {leadingContent && (
          <div className="flex items-center">
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
              {leadingContent}
            </div>
          </div>
        )}

        {/* Quick time period buttons */}
        <div>
          {/*
           * Skill 06 — field label: text-[11px] font-medium text-slate-500
           * uppercase tracking-[0.06em]
           * NOT: text-sm font-semibold text-[#1F2937]
           */}
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Quick periods
          </label>

          {/*
           * Skill 02 — ViewTabs pattern for quick filter pills:
           * Container: bg-slate-100 rounded-lg p-1 flex gap-1
           * Active:   bg-white text-slate-900 border border-slate-200 rounded-md
           * Inactive: text-slate-500 hover:text-slate-700 rounded-md
           *
           * NOT: whileHover={{ scale: 1.05 }} (transform prohibited, Skill 07)
           * NOT: style={{ backgroundColor: COLORS.primary }} (old palette)
           */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 rounded-lg p-1">
            {quickFilters.map(filter => (
              <button
                key={filter.key}
                onClick={() => onQuickFilter(filter.key)}
                className={`
                  px-3 py-1.5 text-[11px] font-medium rounded-md
                  transition-colors duration-150 whitespace-nowrap
                  ${filters.timeRange === filter.key
                    ? "bg-white text-slate-900 border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

          {/* Bank account */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] flex items-center gap-1">
              <Landmark className="w-3 h-3" />
              Bank account
            </label>
            <SelectField
              value={filters.bankAccount}
              onChange={e => onFilterChange("bankAccount", e.target.value)}
            >
              <option value="all">All accounts</option>
              {bankAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </SelectField>
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">
              Start date
            </label>
            <DateInput
              value={filters.startDate}
              onChange={e => onFilterChange("startDate", e.target.value)}
            />
          </div>

          {/* End date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">
              End date
            </label>
            <DateInput
              value={filters.endDate}
              onChange={e => onFilterChange("endDate", e.target.value)}
            />
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">
              Payment method
            </label>
            <SelectField
              value={filters.paymentMethod}
              onChange={e => onFilterChange("paymentMethod", e.target.value)}
            >
              {paymentMethods.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </SelectField>
          </div>

          {/* Invoice status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">
              Invoice status
            </label>
            <SelectField
              value={filters.invoiceStatus}
              onChange={e => onFilterChange("invoiceStatus", e.target.value)}
            >
              {invoiceStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </SelectField>
          </div>

          {/* ISP payment type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">
              ISP payment type
            </label>
            <SelectField
              value={filters.ispPaymentType || "all"}
              onChange={e => onFilterChange("ispPaymentType", e.target.value)}
            >
              {ispPaymentTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </SelectField>
          </div>

        </div>
      </div>
    </div>
  )
}