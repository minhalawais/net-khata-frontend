"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import axiosInstance from "../../../utils/axiosConfig.ts"
import { AdvancedFilters } from "../FinancialComponent/AdvancedFilters.tsx"
import LedgerExportMenu from "./LedgerExportMenu.tsx"
import {
  X, Search, ChevronDown, TrendingUp, TrendingDown,
  ArrowUpDown, FileText, Banknote,
} from "lucide-react"

// ─── Types — preserved exactly ────────────────────────────────────────────────

type FilterState = {
  startDate:      string
  endDate:        string
  bankAccount:    string
  paymentMethod:  string
  invoiceStatus:  string
  ispPaymentType: string
  timeRange:      string
}

type BankOption = { id: string; name: string }

type LedgerItem = {
  id:           string
  date:         string
  time?:        string
  type:         "invoice_payment" | "isp_payment" | "expense" | "extra_income" | "refund" | "internal_transfer" | "other"
  reference?:   string
  description?: string
  method?:      string
  bank_account?: string
  amount:       number
  direction:    "credit" | "debit"
  status?:      string
  raw?:         any
}

type LedgerApiResponse = {
  items?:         LedgerItem[]
  bank_accounts?: BankOption[]
}

type UnifiedResponse = {
  bank_accounts?: BankOption[]
  collections?:   any
  isp_payments?:  any
  expenses?:      any
  extra_incomes?: any
  payments?:      any[]
  data?:          any
}

type DashboardDateRange = {
  startDate: string
  endDate: string
}

// ─── Data helpers — preserved exactly ────────────────────────────────────────

function buildParams(filters: FilterState) {
  const params = new URLSearchParams()
  if (filters.startDate)                    params.append("start_date",       filters.startDate)
  if (filters.endDate)                      params.append("end_date",         filters.endDate)
  if (filters.bankAccount !== "all")        params.append("bank_account_id",  filters.bankAccount)
  if (filters.paymentMethod !== "all")      params.append("payment_method",   filters.paymentMethod)
  if (filters.invoiceStatus !== "all")      params.append("invoice_status",   filters.invoiceStatus)
  if (filters.ispPaymentType !== "all")     params.append("isp_payment_type", filters.ispPaymentType)
  return params.toString()
}

function mapLedgerItems(resp: UnifiedResponse | LedgerApiResponse): LedgerItem[] {
  if (Array.isArray((resp as LedgerApiResponse)?.items)) {
    const normalized = ((resp as LedgerApiResponse).items ?? []).slice()
    normalized.sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    return normalized
  }

  const items: LedgerItem[] = []

  const payments =
    (Array.isArray((resp as any)?.payments)                           ? (resp as any)?.payments                           : undefined) ??
    (Array.isArray((resp as any)?.collections?.payments)              ? (resp as any)?.collections?.payments              : undefined) ??
    (Array.isArray((resp as any)?.collections?.list)                  ? (resp as any)?.collections?.list                  : undefined) ??
    []

  payments.forEach((p: any) => {
    const status  = (p?.status ?? "").toString()
    const typeRaw = (p?.payment_type || p?.type || "").toString()
    const isRefund = typeRaw.toLowerCase() === "refund" || status.toLowerCase() === "refunded"
    items.push({
      id:           (p?.id || p?.payment_id || p?.transaction_id || crypto.randomUUID()).toString(),
      date:         new Date(p?.payment_date || p?.date || p?.created_at || Date.now()).toISOString(),
      type:         isRefund ? "refund" : "invoice_payment",
      reference:    (p?.transaction_id || p?.invoice_id || p?.invoice_number || "").toString(),
      description:  (p?.description || p?.note || "").toString(),
      method:       (p?.payment_method || "").toString(),
      bank_account: (p?.bank_account?.name || p?.bank_account_name || p?.bank_account_id || "").toString(),
      amount:       Number(p?.amount) || 0,
      direction:    isRefund ? "debit" : "credit",
      status,
      raw: p,
    })
  })

  const ispItems =
    (Array.isArray((resp as any)?.isp_payments?.items) ? (resp as any)?.isp_payments?.items : undefined) ??
    (Array.isArray((resp as any)?.isp_payments)        ? (resp as any)?.isp_payments        : undefined) ??
    []
  ispItems.forEach((ip: any) => {
    items.push({
      id:           (ip?.id || crypto.randomUUID()).toString(),
      date:         new Date(ip?.payment_date || ip?.date || ip?.created_at || Date.now()).toISOString(),
      type:         "isp_payment",
      reference:    (ip?.reference_number || "").toString(),
      description:  (ip?.description || ip?.payment_type || "").toString(),
      method:       (ip?.payment_method || "").toString(),
      bank_account: (ip?.bank_account?.name || ip?.bank_account_id || "").toString(),
      amount:       Number(ip?.amount) || 0,
      direction:    "debit",
      status:       (ip?.status || "completed").toString(),
      raw: ip,
    })
  })

  const expenseItems =
    (Array.isArray((resp as any)?.expenses?.items) ? (resp as any)?.expenses?.items : undefined) ??
    (Array.isArray((resp as any)?.expenses)        ? (resp as any)?.expenses        : undefined) ??
    []
  expenseItems.forEach((ex: any) => {
    items.push({
      id:           (ex?.id || crypto.randomUUID()).toString(),
      date:         new Date(ex?.expense_date || ex?.date || ex?.created_at || Date.now()).toISOString(),
      type:         "expense",
      reference:    (ex?.vendor_payee || "").toString(),
      description:  (ex?.description || ex?.expense_type?.name || ex?.expense_type || "").toString(),
      method:       (ex?.payment_method || "").toString(),
      bank_account: (ex?.bank_account?.name || ex?.bank_account_id || "").toString(),
      amount:       Number(ex?.amount) || 0,
      direction:    "debit",
      status:       "posted",
      raw: ex,
    })
  })

  const extraItems =
    (Array.isArray((resp as any)?.extra_incomes?.items) ? (resp as any)?.extra_incomes?.items : undefined) ??
    (Array.isArray((resp as any)?.extra_incomes)        ? (resp as any)?.extra_incomes        : undefined) ??
    []
  extraItems.forEach((ei: any) => {
    items.push({
      id:           (ei?.id || crypto.randomUUID()).toString(),
      date:         new Date(ei?.income_date || ei?.date || ei?.created_at || Date.now()).toISOString(),
      type:         "extra_income",
      reference:    (ei?.payer || "").toString(),
      description:  (ei?.description || ei?.income_type?.name || ei?.income_type || "").toString(),
      method:       (ei?.payment_method || "").toString(),
      bank_account: (ei?.bank_account?.name || ei?.bank_account_id || "").toString(),
      amount:       Number(ei?.amount) || 0,
      direction:    "credit",
      status:       "posted",
      raw: ei,
    })
  })

  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""))
  return items
}

// ─── SelectField ──────────────────────────────────────────────────────────────
// Skill 10 — native select + ChevronDown. h-9, rounded-md, blue focus ring.

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }> = ({
  children,
  className = "",
  ...props
}) => (
  <div className="relative">
    <select
      className={`
        h-9 pl-3 pr-8 appearance-none
        text-[12px] font-medium text-slate-700 bg-white
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

// ─── Transaction type badge ───────────────────────────────────────────────────
// Skill 05 badge recipe. invoice_payment → blue-600 (primary accent, not cyan).

const TYPE_BADGE: Record<string, string> = {
  invoice_payment:   "bg-blue-50 text-blue-600 border border-blue-200",
  isp_payment:       "bg-amber-50 text-amber-700 border border-amber-200",
  expense:           "bg-rose-50 text-rose-600 border border-rose-200",
  extra_income:      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  refund:            "bg-slate-100 text-slate-600 border border-slate-200",
  internal_transfer: "bg-violet-50 text-violet-700 border border-violet-200",
  other:             "bg-slate-100 text-slate-600 border border-slate-200",
}

const TypeBadge: React.FC<{ type: LedgerItem["type"] }> = ({ type }) => (
  <span className={`
    inline-block text-[10px] font-medium uppercase tracking-[0.06em]
    px-2 py-0.5 rounded whitespace-nowrap
    ${TYPE_BADGE[type] || TYPE_BADGE.other}
  `}>
    {type.replace(/_/g, " ")}
  </span>
)

// ─── KPI stat card ─────────────────────────────────────────────────────────────
// Skill 03 — label above value, icon right.
// Semantic color on icon container ONLY — card bg is always bg-white (Rule 8).
//   positive → bg-emerald-50 text-emerald-600 icon
//   negative → bg-rose-50 text-rose-600 icon
//   default  → bg-blue-50 text-blue-600 icon
//   neutral  → bg-slate-100 text-slate-600 icon

type KpiVariant = "default" | "positive" | "negative" | "neutral"

const ICON_CLASSES: Record<KpiVariant, string> = {
  default:  "bg-blue-50 text-blue-600",
  positive: "bg-emerald-50 text-emerald-600",
  negative: "bg-rose-50 text-rose-600",
  neutral:  "bg-slate-100 text-slate-600",
}

type LedgerKpiCardProps = {
  label:    string
  value:    string
  subtext?: React.ReactNode
  icon:     React.ReactNode
  variant?: KpiVariant
}

const LedgerKpiCard: React.FC<LedgerKpiCardProps> = ({ label, value, subtext, icon, variant = "default" }) => (
  <div className="bg-white rounded-[10px] border border-slate-200 p-5 hover:border-slate-300 transition-colors duration-150">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        {/* Label — Skill 06 micro */}
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1.5">
          {label}
        </p>
        {/* Value — Skill 06 display */}
        <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">
          {value}
        </p>
        {subtext && (
          <p className="mt-1.5 text-[11px] text-slate-400 tabular-nums">{subtext}</p>
        )}
      </div>
      {/* Icon container — Skill 03: w-8 h-8 rounded-lg */}
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${ICON_CLASSES[variant]}`}>
        {icon}
      </div>
    </div>
  </div>
)

// ─── Detail modal ─────────────────────────────────────────────────────────────
// Skill 09 exact recipe:
//   backdrop: rgba(15,23,42,0.50) — no backdrop-blur ever
//   panel: bg-white rounded-xl border border-slate-200 — no shadow
//   header: bg-white border-b border-slate-200 — NO gradients
//   title: text-[15px] font-medium text-slate-900
//   close: p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100
//   footer: bg-slate-50 border-t border-slate-200 flex-shrink-0

const DetailModal: React.FC<{
  isOpen:   boolean
  onClose:  () => void
  selected: LedgerItem | null
}> = ({ isOpen, onClose, selected }) => {
  // Skill 09 — Escape key closes
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  if (!isOpen || !selected) return null

  const isCredit = selected.direction === "credit"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.50)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel — rounded-xl, border only, no shadow-2xl */}
      <div className="relative w-full max-w-3xl bg-white rounded-xl border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">

        {/* Header — bg-white + border-b. NO gradient. */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-medium text-slate-900">Transaction Details</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(selected.date).toLocaleDateString("en-PK", {
                weekday: "short", year: "numeric", month: "short", day: "numeric",
              })}
            </p>
          </div>
          {/* Close — Skill 09 */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors duration-150 ml-4 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Amount hero — semantic tint on content block, not modal header */}
          <div className={`
            flex items-center justify-between p-4 rounded-[10px] border mb-5
            ${isCredit ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}
          `}>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-[0.06em] mb-1 ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                {isCredit ? "Credit" : "Debit"}
              </p>
              <p className={`text-[28px] font-semibold tabular-nums leading-none ${isCredit ? "text-emerald-700" : "text-rose-700"}`}>
                {isCredit ? "+" : "−"} PKR {Math.round(selected.amount).toLocaleString()}
              </p>
            </div>
            <TypeBadge type={selected.type} />
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {[
              { label: "Type",      value: selected.type.replace(/_/g, " ") },
              { label: "Status",    value: selected.status    || "—"        },
              { label: "Reference", value: selected.reference || "—"        },
              { label: "Method",    value: selected.method    || "—"        },
              { label: "Bank",      value: selected.bank_account || "—"     },
              { label: "Date",      value: new Date(selected.date).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1">
                  {label}
                </p>
                <p className="text-[13px] text-slate-700 capitalize bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  {value}
                </p>
              </div>
            ))}

            {selected.description && (
              <div className="md:col-span-2">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1">
                  Description
                </p>
                <p className="text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  {selected.description}
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1.5">
                Raw data
              </p>
              <pre className="
                text-[11px] p-4 rounded-[10px]
                border border-slate-200 bg-slate-50
                overflow-auto max-h-52 font-mono text-slate-700
                leading-relaxed
              ">
                {JSON.stringify(selected.raw ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer — Skill 09 */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="
              px-4 py-2 text-[13px] font-medium text-slate-700
              border border-slate-200 rounded-md bg-white
              hover:border-slate-300 hover:bg-slate-50
              transition-colors duration-150
            "
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Table skeleton ───────────────────────────────────────────────────────────
// Skill 07 — shimmer rows, not a spinner

const TableSkeleton: React.FC = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {Array.from({ length: 7 }).map((_, j) => (
          <td key={j} className="px-4 py-3">
            <div
              className="h-3 bg-slate-100 rounded animate-pulse"
              style={{ width: `${45 + ((i * 4 + j * 9) % 40)}%` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
)

// ─── Empty state ──────────────────────────────────────────────────────────────
// Skill 05 — bg-slate-100 icon container, no gradient

const TableEmpty: React.FC = () => (
  <tr>
    <td colSpan={7} className="px-4 py-14">
      <div className="flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <FileText className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-[13px] font-medium text-slate-900">No transactions found</p>
        <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or date range.</p>
      </div>
    </td>
  </tr>
)

// ─── Main Ledger Component ────────────────────────────────────────────────────

export const Ledger: React.FC<{
  tabControls?: React.ReactNode
  dateRange?: DashboardDateRange
  onDateRangeChange?: (range: DashboardDateRange) => void
}> = ({ tabControls, dateRange, onDateRangeChange }) => {

  const getPakistaniDate = () => {
    const now = new Date()
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    return new Date(utc + (3600000 * 5))
  }
  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const today        = getPakistaniDate()
  const startOfMonth = formatDate(new Date(today.getFullYear(), today.getMonth(), 1))

  const [filters, setFilters] = useState<FilterState>({
    startDate:      dateRange?.startDate || startOfMonth,
    endDate:        dateRange?.endDate || formatDate(today),
    bankAccount:    "all",
    paymentMethod:  "all",
    invoiceStatus:  "all",
    ispPaymentType: "all",
    timeRange:      "mtd",
  })
  const [search,          setSearch]          = useState("")
  const [directionFilter, setDirectionFilter] = useState<"all" | "credit" | "debit">("all")
  const [detailOpen,      setDetailOpen]      = useState(false)
  const [selected,        setSelected]        = useState<LedgerItem | null>(null)

  useEffect(() => {
    if (!dateRange) return
    setFilters((prev) => {
      if (prev.startDate === dateRange.startDate && prev.endDate === dateRange.endDate) return prev
      return { ...prev, startDate: dateRange.startDate, endDate: dateRange.endDate }
    })
  }, [dateRange])

  useEffect(() => {
    onDateRangeChange?.({ startDate: filters.startDate, endDate: filters.endDate })
  }, [filters.startDate, filters.endDate, onDateRangeChange])

  const key = buildParams(filters)

  const fetcher = async (qs: string) => {
    const headers = {
      Authorization: `Bearer ${typeof window !== "undefined" ? (localStorage.getItem("token") ?? "") : ""}`,
    }
    const response = await axiosInstance.get<LedgerApiResponse>(`/dashboard/ledger?${qs}`, { headers })
    return response.data
  }

  const { data, isLoading, error } = useSWR<UnifiedResponse | LedgerApiResponse>(key, fetcher, {
    revalidateOnFocus: false,
  })

  const bankAccounts: BankOption[] = useMemo(() => {
    if (!data) return []
    const l = data as LedgerApiResponse
    const u = data as UnifiedResponse
    if (Array.isArray(l?.bank_accounts)) return l.bank_accounts
    if (Array.isArray(u?.bank_accounts)) return u.bank_accounts
    if (Array.isArray((data as any)?.bank_accounts)) return (data as any).bank_accounts
    return []
  }, [data])

  const allItems = useMemo(() => mapLedgerItems(data ?? {}), [data])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return allItems.filter(it => {
      const dirOk = directionFilter === "all" || it.direction === directionFilter
      if (!dirOk) return false
      if (!s) return true
      const blob = [it.id, it.type, it.reference, it.description, it.method, it.bank_account, it.status, it.date]
        .filter(Boolean).join(" ").toLowerCase()
      return blob.includes(s)
    })
  }, [allItems, search, directionFilter])

  // Totals — computed from filtered items, no API needed
  const totals = useMemo(() => {
    const credits = filtered.filter(i => i.direction === "credit").reduce((s, i) => s + i.amount, 0)
    const debits  = filtered.filter(i => i.direction === "debit" ).reduce((s, i) => s + i.amount, 0)
    const creditCount = filtered.filter(i => i.direction === "credit").length
    const debitCount  = filtered.filter(i => i.direction === "debit").length
    return { credits, debits, net: credits - debits, count: filtered.length, creditCount, debitCount }
  }, [filtered])

  // Short amount formatter (e.g., 25L, 1.2CR)
  function formatShortAmount(amount: number): string {
    const abs = Math.abs(amount)
    if (abs >= 10000000) {
      // Crore
      return `${(amount / 10000000).toFixed(abs >= 100000000 ? 0 : 1)}CR`
    } else if (abs >= 100000) {
      // Lakh
      return `${(amount / 100000).toFixed(abs >= 1000000 ? 0 : 1)}L`
    } else if (abs >= 1000) {
      // Thousand
      return `${(amount / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`
    }
    return `PKR ${Math.round(amount).toLocaleString()}`
  }

  const onQuickFilter = (timeRange: string) => {
    const t = getPakistaniDate()
    let start = new Date(t)
    switch (timeRange) {
      case "today": start = new Date(t); break
      case "week":  start = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 7); break
      case "mtd":   start = new Date(t.getFullYear(), t.getMonth(), 1); break
      case "qtd":   start = new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1); break
      case "ytd":   start = new Date(t.getFullYear(), 0, 1); break
      case "last_month": {
        const s   = new Date(t.getFullYear(), t.getMonth() - 1, 1)
        const end = new Date(t.getFullYear(), t.getMonth(), 0)
        setFilters(prev => ({ ...prev, timeRange, startDate: formatDate(s), endDate: formatDate(end) }))
        return
      }
    }
    setFilters(prev => ({ ...prev, timeRange, startDate: formatDate(start), endDate: formatDate(getPakistaniDate()) }))
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  // Structure:
  //   1. AdvancedFilters cockpit  ← date presets + bank/method filters + tab switcher
  //   2. Controls toolbar         ← direction select + search + reset
  //   3. Stat strip (4 KPI cards) ← Credits · Debits · Net · Transactions — ABOVE table
  //   4. Table card               ← header + rows, no footer stats
  //
  // Removed from original:
  //   ✕ "Ledger Intelligence" hero card (gradient violation, second header, ~120px waste)
  //   ✕ Decorative absolute blur divs (no blur effects in system)
  //   ✕ MetricTile footer inside table card (moved to stat strip above)
  //   ✕ All cyan-* tokens (not in design system — blue-600 is the single accent)
  //   ✕ rounded-2xl (always rounded-[10px] for cards, rounded-xl for modals)
  //   ✕ Modal header gradient bg-gradient-to-r from-slate-50 to-cyan-50/50

  return (
    <div className="space-y-4">

      {/* ── 1. Filter cockpit ──────────────────────────────────────────────── */}
      <AdvancedFilters
        filters={filters}
        onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
        onQuickFilter={onQuickFilter}
        bankAccounts={bankAccounts}
        leadingContent={tabControls}
      />

      {/* ── 2. Controls toolbar ────────────────────────────────────────────── */}
      {/* Skill 11 — toolbar as bg-white rounded-[10px] border card */}
      <div className="bg-white rounded-[10px] border border-slate-200 px-4 py-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">

          {/* Direction filter */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] whitespace-nowrap">
              Direction
            </span>
            <SelectField
              value={directionFilter}
              onChange={e => setDirectionFilter(e.target.value as "all" | "credit" | "debit")}
              className="w-36"
            >
              <option value="all">All</option>
              <option value="credit">Credits only</option>
              <option value="debit">Debits only</option>
            </SelectField>
          </div>

          <div className="flex-1" />

          {/* Search + conditional reset */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search transaction, reference, method…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="
                  w-full h-9 pl-9 pr-3
                  text-[13px] text-slate-900 placeholder:text-slate-400
                  bg-white border border-slate-200 rounded-md
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
                  hover:border-slate-300 transition-colors duration-150
                "
              />
            </div>

            {(search || directionFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setDirectionFilter("all") }}
                className="
                  h-9 px-3 text-[12px] font-medium text-slate-600
                  border border-slate-200 rounded-md bg-white
                  hover:border-slate-300 hover:bg-slate-50
                  transition-colors duration-150 whitespace-nowrap
                "
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Stat strip ─────────────────────────────────────────────────────
       *
       *  WHY ABOVE THE TABLE:
       *  The original design buried these 4 numbers in the table footer. On a
       *  50+ row ledger the user had to scroll past all transactions to see any
       *  summary. That's backwards — the summary anchors context BEFORE detail.
       *
       *  Skill 03 KPI card rules applied:
       *  - Card bg is always bg-white (Rule 8 — no semantic card backgrounds)
       *  - Semantic color on icon container ONLY
       *  - Label text-[11px] uppercase tracking-[0.06em]
       *  - Value text-[22px] font-semibold tabular-nums
       *  - Subtext text-[11px] text-slate-400
       *
       *  Computed client-side from filtered items — no extra API call needed.
       *  Updates instantly when the user types in search or changes direction.
       */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LedgerKpiCard
          label="Total Credits"
          value={`PKR ${Math.round(totals.credits).toLocaleString()}`}
          subtext={
            <>
              <span className="font-semibold text-blue-600 mr-2">{formatShortAmount(totals.credits)}</span>
              {`${totals.creditCount} credit transaction${totals.creditCount !== 1 ? "s" : ""}`}
            </>
          }
          icon={<TrendingUp className="w-4 h-4" />}
          variant="positive"
        />
        <LedgerKpiCard
          label="Total Debits"
          value={`PKR ${Math.round(totals.debits).toLocaleString()}`}
          subtext={
            <>
              <span className="font-semibold text-rose-600 mr-2">{formatShortAmount(totals.debits)}</span>
              {`${totals.debitCount} debit transaction${totals.debitCount !== 1 ? "s" : ""}`}
            </>
          }
          icon={<TrendingDown className="w-4 h-4" />}
          variant="negative"
        />
        <LedgerKpiCard
          label="Net Position"
          value={`${totals.net < 0 ? "−" : ""}PKR ${Math.abs(Math.round(totals.net)).toLocaleString()}`}
          subtext={
            <>
              <span className={`font-semibold mr-2 ${totals.net >= 0 ? "text-blue-600" : "text-rose-600"}`}>{formatShortAmount(totals.net)}</span>
              {totals.net >= 0 ? "Net positive" : "Net negative"}
            </>
          }
          icon={<Banknote className="w-4 h-4" />}
          variant={totals.net >= 0 ? "default" : "negative"}
        />
        <LedgerKpiCard
          label="Transactions"
          value={totals.count.toLocaleString()}
          subtext={`${filters.startDate} – ${filters.endDate}`}
          icon={<FileText className="w-4 h-4" />}
          variant="neutral"
        />
      </div>

      {/* ── 4. Ledger table card ──────────────────────────────────────────────
       *  Skill 05 — single card: header + table. No footer stats (moved above).
       *  rounded-[10px] border border-slate-200 overflow-hidden. No shadow.
       */}
      <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">

        {/* Card header — Skill 01 icon + H2 title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-[13px] font-medium text-slate-900">Ledger Transactions</h3>
              <p className="text-[11px] text-slate-400">Click any row to view full transaction details.</p>
            </div>
          </div>

          {/* Right section: record count + export */}
          <div className="flex items-center gap-3 md:justify-end">
            <span className="text-[11px] font-medium text-slate-400 tabular-nums whitespace-nowrap">
              {isLoading
                ? "Loading…"
                : error
                  ? "Failed to load"
                  : `${filtered.length.toLocaleString()} records`
              }
            </span>
            <div className="h-5 w-px bg-slate-200" />
            <LedgerExportMenu filters={filters} disabled={isLoading || error !== undefined} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* thead — Skill 05 exact recipe */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { label: "Date",        align: "left"  },
                  { label: "Type",        align: "left"  },
                  { label: "Reference",   align: "left"  },
                  { label: "Description", align: "left"  },
                  { label: "Method",      align: "left"  },
                  { label: "Bank",        align: "left"  },
                  { label: "Amount",      align: "right" },
                ].map(col => (
                  <th
                    key={col.label}
                    className={`
                      px-4 py-2.5 whitespace-nowrap
                      text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]
                      ${col.align === "right" ? "text-right" : "text-left"}
                    `}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* tbody — Skill 05: divide-y divide-slate-100, hover:bg-blue-50/40 */}
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-rose-500">
                    Failed to load ledger data. Please try again.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <TableEmpty />
              ) : (
                filtered.map(row => {
                  const isCredit = row.direction === "credit"
                  return (
                    <tr
                      key={row.id}
                      onClick={() => { setSelected(row); setDetailOpen(true) }}
                      className="cursor-pointer hover:bg-blue-50/40 transition-colors duration-100"
                    >
                      {/* Date — Skill 05: px-4 py-3 text-[13px] tabular-nums */}
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-700 tabular-nums" style={{ minWidth: 148 }}>
                        {new Date(row.date).toLocaleString("en-PK", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>

                      {/* Type badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TypeBadge type={row.type} />
                      </td>

                      {/* Reference — mono, muted */}
                      <td className="px-4 py-3 text-[12px] text-slate-500 font-mono truncate max-w-[140px]">
                        {row.reference || "—"}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-[13px] text-slate-700 truncate max-w-[240px]">
                        {row.description || "—"}
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-700 capitalize">
                        {row.method || "—"}
                      </td>

                      {/* Bank */}
                      <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-700">
                        {row.bank_account || "—"}
                      </td>

                      {/* Amount — emerald credit, rose debit (Skill 05) */}
                      <td className={`
                        px-4 py-3 whitespace-nowrap text-right
                        text-[13px] font-semibold tabular-nums
                        ${isCredit ? "text-emerald-600" : "text-rose-600"}
                      `}>
                        {isCredit ? "+" : "−"} PKR {Math.round(row.amount).toLocaleString()}
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Footer stats removed — stats strip is above the table */}

      </div>

      {/* ── Detail modal ─────────────────────────────────────────────────────── */}
      <DetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        selected={selected}
      />

    </div>
  )
}