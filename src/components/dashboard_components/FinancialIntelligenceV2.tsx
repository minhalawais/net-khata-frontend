"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Banknote,
  CircleDollarSign,
  Landmark,
  LineChart as LineChartIcon,
  Percent,
  PieChart as PieChartIcon,
  TrendingUp,
  Wallet,
  Download,
} from "lucide-react"
import axiosInstance from "../../utils/axiosConfig.ts"
import { exportToCSV } from "../../utils/exportUtils.ts"
import { AdvancedFilters } from "./FinancialComponent/AdvancedFilters.tsx"

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterState = {
  startDate: string
  endDate: string
  bankAccount: string
  paymentMethod: string
  invoiceStatus: string
  ispPaymentType: string
  timeRange: string
}

type BankOption = { id: string; name: string }

type DashboardDateRange = {
  startDate: string
  endDate: string
}

type V2Response = {
  schema_version: string
  generated_at: string
  data: FinancialPayload
}

type FinancialPayload = {
  pl_summary: {
    // ── New first-class KPI fields (promoted from gross_revenue.breakdown) ──
    total_collections: { value: number; previous: number; trend: number; is_positive: boolean }
    extra_income:      { value: number; previous: number; trend: number; is_positive: boolean }
    // ── Existing fields ─────────────────────────────────────────────────────
    gross_revenue: { value: number; trend: number; is_positive: boolean }
    total_costs: { value: number; trend: number; is_positive: boolean }
    net_profit: { value: number; trend: number; is_positive: boolean; margin_pct: number }
    invoice_to_cash_conversion: { value: number; invoiced: number; collected: number; status: string; target_pct: number }
    salary_pct_of_revenue: {
      value: number
      salary_cost: number
      revenue: number
      status: string
      benchmark_range: { min: number; max: number }
    }
    cash_in_bank: { value: number; per_account: { name: string; balance: number }[]; as_of?: string; as_of_datetime?: string }
  }
  revenue_breakdown: {
    revenue_sources: Array<Record<string, string | number>>
    stacks: { payment_methods: string[]; income_types: string[] }
    invoice_vs_collection: Array<{ month: string; month_short: string; invoiced: number; collected: number; gap: number }>
    net_profit_margin_trend_12m: Array<{ month: string; month_short: string; revenue: number; net_profit: number; margin_pct: number }>
  }
  cost_intelligence: {
    isp_cost_donut: Array<{ isp: string; amount: number; percentage: number; by_type: Record<string, number> }>
    expense_by_type: Array<{ type: string; amount: number }>
    monthly_cost_trend: Array<{ month: string; month_short: string; isp_payments: number; expenses: number; total: number }>
    isp_cost_per_subscriber_trend_12m: Array<{
      month: string
      month_short: string
      isp_total_cost: number
      active_subscribers: number
      cost_per_subscriber: number
    }>
  }
  collections_aging: {
    aging_table: Array<{ bucket: string; count: number; amount: number; percentage: number }>
    total_outstanding: number
    top_overdue_customers: Array<{
      customer_name: string
      internet_id: string
      area: string
      technician: string
      invoice_count: number
      total_outstanding: number
      oldest_due_date: string | null
      days_overdue: number
    }>
    recovery: {
      pending: number
      in_progress: number
      completed_mtd: number
      agents: Array<{ name: string; total: number; completed: number; pending: number; in_progress: number; completion_rate: number }>
    }
  }
  bank_positions: {
    accounts: Array<{ id: string; name: string; account_number: string; balance: number; total_in: number; total_out: number; net_movement: number }>
    bank_table: Array<{
      bank_name: string
      account_number: string
      collections: number
      extra_income: number
      isp_payments: number
      expenses: number
      net_flow: number
      initial_balance: number
      current_balance: number
    }>
    cash_payments: { collections: number; extra_income: number; isp_payments: number; expenses: number; net_flow: number }
    payment_method_donut: Array<{ method: string; amount: number; percentage: number }>
    cash_flow_bridge: {
      scope: string
      opening_balance: number
      collections_in: number
      extra_income_in: number
      isp_payments_out: number
      operating_expenses_out: number
      salary_commission_out: number
      closing_balance: number
      calculated_closing_balance: number
      reconciliation_delta: number
    }
  }
  employee_financial: {
    stats: {
      salary_accrued: number
      salary_paid: number
      commission_earned: number
      commission_paid?: number
      outstanding_balance: number
    }
    employees: Array<{
      name: string
      role: string
      salary: number
      commission_earned: number
      paid_this_period: number
      salary_paid_this_period?: number
      commission_paid_this_period?: number
      total_paid: number
      balance_owed: number
    }>
  }
}

// ─── Section navigation type ──────────────────────────────────────────────────

type Section = "revenue" | "costs" | "banking" | "collections" | "payroll"

const SECTIONS: { key: Section; label: string }[] = [
  { key: "revenue",     label: "Revenue & P&L" },
  { key: "costs",       label: "Costs"          },
  { key: "banking",     label: "Banking"        },
  { key: "collections", label: "Collections"    },
  { key: "payroll",     label: "Payroll"        },
]

// ─── Design tokens ────────────────────────────────────────────────────────────

const CHART_COLORS        = ["#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#CBD5E1", "#94A3B8"]
const PAYMENT_STACK_COLORS = ["#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"]
const INCOME_STACK_COLORS  = ["#047857", "#059669", "#10B981", "#34D399", "#6EE7B7"]
const GRID_COLOR           = "#F1F5F9"
const AXIS_TICK            = { fontSize: 11, fill: "#94A3B8" }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPakistaniDate = (): Date =>
  new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }))

const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const formatCurrency = (value: number): string => {
  const v = Number(value || 0)
  if (v >= 1e7) return `PKR ${(v / 1e7).toFixed(1)}Cr`
  if (v >= 1e5) return `PKR ${(v / 1e5).toFixed(1)}L`
  if (v >= 1e3) return `PKR ${(v / 1e3).toFixed(1)}K`
  return `PKR ${Math.round(v).toLocaleString()}`
}

const formatAxis = (value: number): string => {
  const v = Number(value || 0)
  if (v >= 1e7) return `${(v / 1e7).toFixed(0)}Cr`
  if (v >= 1e5) return `${(v / 1e5).toFixed(0)}L`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${Math.round(v)}`
}

const formatPercent = (value: number): string => `${Number(value || 0).toFixed(1)}%`

// ─── Tooltips ─────────────────────────────────────────────────────────────────

const ChartTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border-[0.5px] border-slate-700 rounded-lg px-3 py-2">
      {label && <p className="text-[11px] text-slate-400 mb-1.5 font-medium">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: entry.color || entry.fill }} />
            <span className="text-[11px] text-slate-300">{entry.name}</span>
            <span className="text-[11px] font-medium text-white tabular-nums ml-auto pl-4">
              {formatCurrency(Number(entry.value || 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PercentTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border-[0.5px] border-slate-700 rounded-lg px-3 py-2">
      {label && <p className="text-[11px] text-slate-400 mb-1.5 font-medium">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: entry.color || entry.fill }} />
            <span className="text-[11px] text-slate-300">{entry.name}</span>
            <span className="text-[11px] font-medium text-white tabular-nums ml-auto pl-4">
              {formatPercent(Number(entry.value || 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const KpiCard: React.FC<{
  title: string
  value: string
  sub?: string
  positive?: boolean
  trend?: number
  icon?: React.ReactNode
}> = ({ title, value, sub, positive, trend, icon }) => (
  <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 p-5 hover:border-slate-300 transition-colors duration-150">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          {icon || <BarChart3 className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] truncate">{title}</p>
          <p className="mt-1 text-[22px] font-medium text-slate-900 leading-none tabular-nums">{value}</p>
        </div>
      </div>
      {typeof trend === "number" && (
        <span className={`text-[11px] font-medium flex-shrink-0 ${positive ? "text-emerald-600" : "text-rose-500"}`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
        </span>
      )}
    </div>
    {sub && <p className="mt-2 text-[11px] text-slate-400">{sub}</p>}
  </div>
)

const SectionCard: React.FC<{
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}> = ({ title, subtitle, action, children }) => (
  <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 overflow-hidden">
    <div className="px-5 py-4 border-b-[0.5px] border-slate-100 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-[13px] font-medium text-slate-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
)

const TableHeader: React.FC<{ cols: string[] }> = ({ cols }) => (
  <thead>
    <tr className="bg-slate-50 border-b border-[0.5px] border-slate-200">
      {cols.map((h) => (
        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] whitespace-nowrap">
          {h}
        </th>
      ))}
    </tr>
  </thead>
)

const OverdueBadge: React.FC<{ days: number }> = ({ days }) => {
  const tier = days >= 180 ? "critical" : days >= 91 ? "high" : days >= 31 ? "medium" : "low"
  const styles: Record<string, string> = {
    critical: "bg-rose-100 text-rose-700 border-[0.5px] border-rose-200",
    high:     "bg-orange-50 text-orange-700 border-[0.5px] border-orange-200",
    medium:   "bg-amber-50 text-amber-700 border-[0.5px] border-amber-200",
    low:      "bg-slate-100 text-slate-500 border-[0.5px] border-slate-200",
  }
  return (
    <span className={`inline-block text-[11px] font-medium tabular-nums px-2 py-0.5 rounded-full whitespace-nowrap ${styles[tier]}`}>
      {days}d
    </span>
  )
}

// ─── Section navigation bar ───────────────────────────────────────────────────
// Skill 02 — ViewTabs pill: bg-slate-100 container, active = bg-white + border

const SectionNav: React.FC<{
  active: Section
  onChange: (s: Section) => void
}> = ({ active, onChange }) => (
  <div className="bg-white border border-slate-200 rounded-[10px] px-4 py-2.5">
    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1 w-fit overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`
            px-3 py-1.5 text-[12px] font-medium rounded-[6px]
            transition-colors duration-150 whitespace-nowrap flex-shrink-0
            ${active === key
              ? "bg-white text-slate-900 border border-slate-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
)

// ─── Section components ───────────────────────────────────────────────────────
// Each receives only the data slice it needs.
// No logic, no state — pure render functions.

// ── Revenue & P&L ─────────────────────────────────────────────────────────────

const RevenueSection: React.FC<{
  data: FinancialPayload
  paymentStackKeys: string[]
  incomeStackKeys: string[]
}> = ({ data, paymentStackKeys, incomeStackKeys }) => (
  <div className="space-y-6">

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <SectionCard title="Revenue sources (stacked monthly)" subtitle="Customer payments by method + extra income by type">
        <div className="p-5">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.revenue_breakdown.revenue_sources} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="month_short" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} tickFormatter={formatAxis} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 8 }} />
              {paymentStackKeys.map((k, i) => (
                <Bar key={k} dataKey={k} name={k.replace("payment_", "Pay: ")} stackId="rev" fill={PAYMENT_STACK_COLORS[i % PAYMENT_STACK_COLORS.length]} maxBarSize={28} />
              ))}
              {incomeStackKeys.map((k, i) => (
                <Bar key={k} dataKey={k} name={k.replace("income_", "Inc: ")} stackId="rev" fill={INCOME_STACK_COLORS[i % INCOME_STACK_COLORS.length]} maxBarSize={28} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Invoice generation vs collection" subtitle="Gap indicates uncollected revenue">
        <div className="p-0">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.revenue_breakdown.invoice_vs_collection} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="month_short" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} tickFormatter={formatAxis} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 8 }} />
              <Line type="monotone" dataKey="invoiced"  name="Invoiced"  stroke="#1D4ED8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="collected" name="Collected" stroke="#94A3B8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

    </div>

    <SectionCard title="Net Profit Margin Trend (12M)" subtitle="Tracks whether profitability is improving or declining month-over-month">
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.revenue_breakdown.net_profit_margin_trend_12m} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="month_short" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} tickFormatter={(v) => `${Number(v).toFixed(0)}%`} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<PercentTooltip />} />
            <Line type="monotone" dataKey="margin_pct" name="Net Margin" stroke="#047857" strokeWidth={2.25} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>

  </div>
)

// ── Costs ─────────────────────────────────────────────────────────────────────

const CostsSection: React.FC<{ data: FinancialPayload }> = ({ data }) => (
  <div className="space-y-6">

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <SectionCard title="ISP cost breakdown" subtitle="Cost contribution by ISP">
        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.cost_intelligence.isp_cost_donut} dataKey="amount" nameKey="isp" cx="50%" cy="50%" innerRadius={54} outerRadius={88}>
                {data.cost_intelligence.isp_cost_donut.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {data.cost_intelligence.isp_cost_donut.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.cost_intelligence.isp_cost_donut.map((item, i) => (
                <div key={`${item.isp}-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[11px] text-slate-700 truncate">{item.isp}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 tabular-nums ml-3">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Expense breakdown" subtitle="Operational spend by expense type">
        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.cost_intelligence.expense_by_type.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 4 }}>
              <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} tickFormatter={formatAxis} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" width={90} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="amount" name="Amount" fill="#2563EB" radius={[0, 3, 3, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Monthly cost trend" subtitle="ISP payments + expenses (stacked)">
        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.cost_intelligence.monthly_cost_trend} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="month_short" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} tickFormatter={formatAxis} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748B", paddingTop: 8 }} />
              <Area dataKey="isp_payments" name="ISP Payments" type="monotone" stackId="cost" stroke="#2563EB" fill="#93C5FD" />
              <Area dataKey="expenses"     name="Expenses"     type="monotone" stackId="cost" stroke="#1D4ED8" fill="#3B82F6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

    </div>

    <SectionCard title="ISP Cost per Subscriber Trend" subtitle="Procurement efficiency trend based on billed active subscribers">
      <div className="p-5">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.cost_intelligence.isp_cost_per_subscriber_trend_12m} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="month_short" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} tickFormatter={formatAxis} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="cost_per_subscriber" name="Cost / Subscriber" stroke="#1D4ED8" strokeWidth={2.25} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>

  </div>
)

// ── Banking ───────────────────────────────────────────────────────────────────

const BankingSection: React.FC<{ data: FinancialPayload }> = ({ data }) => (
  <div className="space-y-6">

    {/* Per-account balance cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.bank_positions.accounts.map((acc) => (
        <div key={acc.id} className="bg-white rounded-[10px] border-[0.5px] border-slate-200 p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] truncate">{acc.name}</p>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[20px] font-medium text-slate-900 tabular-nums leading-none">{formatCurrency(acc.balance)}</p>
          <div className="mt-3 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between"><span>In</span><span className="tabular-nums">{formatCurrency(acc.total_in)}</span></div>
            <div className="flex items-center justify-between"><span>Out</span><span className="tabular-nums">{formatCurrency(acc.total_out)}</span></div>
            <div className="flex items-center justify-between"><span>Net</span><span className="tabular-nums">{formatCurrency(acc.net_movement)}</span></div>
          </div>
        </div>
      ))}
    </div>

    {/*
     * Payment method donut + Cash Flow Bridge side-by-side.
     * Previously each was full-width, stacked — combined they were ~700px.
     * Side-by-side they are ~440px — saves ~260px on the Banking tab.
     */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <SectionCard title="Payment method distribution" subtitle="Channel dependency and intake mix">
        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.bank_positions.payment_method_donut} dataKey="amount" nameKey="method" innerRadius={52} outerRadius={82}>
                {data.bank_positions.payment_method_donut.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {data.bank_positions.payment_method_donut.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.bank_positions.payment_method_donut.map((item, i) => (
                <div key={`${item.method}-${i}`} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[11px] text-slate-700 truncate">{item.method}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 tabular-nums ml-3">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Cash Flow Bridge" subtitle="Opening + inflows − outflows = closing (bank accounts scope)">
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-[12px] text-slate-600">Opening Balance</span>
              <span className="text-[12px] font-medium text-slate-800 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.opening_balance)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="text-[12px] text-emerald-700">+ Collections</span>
              <span className="text-[12px] font-medium text-emerald-700 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.collections_in)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="text-[12px] text-emerald-700">+ Extra Income</span>
              <span className="text-[12px] font-medium text-emerald-700 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.extra_income_in)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
              <span className="text-[12px] text-rose-700">&#8722; ISP Payments</span>
              <span className="text-[12px] font-medium text-rose-700 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.isp_payments_out)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
              <span className="text-[12px] text-rose-700">&#8722; Operating Expenses</span>
              <span className="text-[12px] font-medium text-rose-700 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.operating_expenses_out)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
              <span className="text-[12px] text-rose-700">&#8722; Salary &amp; Commission</span>
              <span className="text-[12px] font-medium text-rose-700 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.salary_commission_out)}</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5">
              <span className="text-[12px] text-blue-700 font-medium">Calculated Closing</span>
              <span className="text-[12px] font-semibold text-blue-700 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.calculated_closing_balance)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-slate-300 bg-slate-100 px-3 py-2.5">
              <span className="text-[12px] text-slate-700 font-medium">Actual Closing</span>
              <span className="text-[12px] font-semibold text-slate-800 tabular-nums">{formatCurrency(data.bank_positions.cash_flow_bridge.closing_balance)}</span>
            </div>
          </div>
        </div>
      </SectionCard>

    </div>

    {/* Full bank & cash performance table */}
    <SectionCard
      title="Bank & Cash Performance"
      subtitle="Account, Collections, Extra Income, ISP Payments, Expenses, Net Flow, Initial Balance, Current Balance"
      action={
        <button 
          onClick={() => {
            const formattedCash = {
              bank_name: 'Cash Payments',
              account_number: '-',
              collections: data.bank_positions.cash_payments.collections,
              extra_income: data.bank_positions.cash_payments.extra_income,
              isp_payments: data.bank_positions.cash_payments.isp_payments,
              expenses: data.bank_positions.cash_payments.expenses,
              net_flow: data.bank_positions.cash_payments.net_flow,
              initial_balance: 0,
              current_balance: 0
            };
            exportToCSV([formattedCash, ...data.bank_positions.bank_table], 'bank_and_cash_performance')
          }}
          className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <Download className="w-3 h-3" />
          CSV
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHeader cols={["Account", "Collections", "Extra Income", "ISP Payments", "Expenses", "Net Flow", "Initial Balance", "Current Balance"]} />
          <tbody>
            <tr className="border-b border-[0.5px] border-slate-100 bg-blue-50/40 hover:bg-blue-50 transition-colors duration-100">
              <td className="px-4 py-2.5 text-[13px] text-slate-700">Cash Payments</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(data.bank_positions.cash_payments.collections)}</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(data.bank_positions.cash_payments.extra_income)}</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(data.bank_positions.cash_payments.isp_payments)}</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(data.bank_positions.cash_payments.expenses)}</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-700 tabular-nums">{formatCurrency(data.bank_positions.cash_payments.net_flow)}</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-400">-</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-400">-</td>
            </tr>
            {data.bank_positions.bank_table.map((row) => (
              <tr key={`${row.bank_name}-${row.account_number}`} className="border-b border-[0.5px] border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                <td className="px-4 py-2.5 text-[13px] text-slate-700">{row.bank_name} - {row.account_number}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(row.collections)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(row.extra_income)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(row.isp_payments)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(row.expenses)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-700 tabular-nums">{formatCurrency(row.net_flow)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(row.initial_balance)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-700 tabular-nums">{formatCurrency(row.current_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>

  </div>
)

// ── Collections ───────────────────────────────────────────────────────────────

const CollectionsSection: React.FC<{ data: FinancialPayload }> = ({ data }) => (
  <div className="space-y-6">

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <SectionCard
        title="Aging analysis"
        subtitle="Outstanding split by overdue buckets"
        action={<span className="text-[12px] font-medium text-slate-700 tabular-nums">{formatCurrency(data.collections_aging.total_outstanding)}</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <TableHeader cols={["Bucket", "Invoices", "Amount", "% Out."]} />
            <tbody>
              {data.collections_aging.aging_table.map((row) => (
                <tr key={row.bucket} className="border-b border-[0.5px] border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                  <td className="px-4 py-3 text-[13px] text-slate-700">{row.bucket}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600 tabular-nums">{row.count}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-700 tabular-nums">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600 tabular-nums">{row.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Recovery performance" subtitle="Task status and agent completion rates">
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <KpiCard title="Pending"       value={`${data.collections_aging.recovery.pending}`}       icon={<PieChartIcon  className="w-4 h-4" />} />
            <KpiCard title="In Progress"   value={`${data.collections_aging.recovery.in_progress}`}   icon={<ArrowUpDown   className="w-4 h-4" />} />
            <KpiCard title="Completed MTD" value={`${data.collections_aging.recovery.completed_mtd}`} icon={<LineChartIcon className="w-4 h-4" />} />
          </div>
          <div className="overflow-x-auto border-[0.5px] border-slate-200 rounded-md">
            <table className="w-full border-collapse">
              <TableHeader cols={["Agent", "Tasks", "Completed", "Rate"]} />
              <tbody>
                {data.collections_aging.recovery.agents.slice(0, 8).map((a) => (
                  <tr key={a.name} className="border-b border-[0.5px] border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                    <td className="px-4 py-2.5 text-[13px] text-slate-700">{a.name}</td>
                    <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{a.total}</td>
                    <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{a.completed}</td>
                    <td className="px-4 py-2.5 text-[13px] text-slate-700 tabular-nums">{a.completion_rate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

    </div>

    <SectionCard 
      title="Top overdue customers" 
      subtitle="Priority list for collections team"
      action={
        <button 
          onClick={() => exportToCSV(data.collections_aging.top_overdue_customers, 'top_overdue_customers')}
          className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <Download className="w-3 h-3" />
          CSV
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHeader cols={["Customer", "Internet ID", "Area", "Technician", "Invoices", "Outstanding", "Oldest Due", "Days"]} />
          <tbody>
            {data.collections_aging.top_overdue_customers.slice(0, 20).map((row) => (
              <tr key={`${row.internet_id}-${row.oldest_due_date || "none"}`} className="border-b border-[0.5px] border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                <td className="px-4 py-2.5 text-[13px] text-slate-700">{row.customer_name}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600">{row.internet_id}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600">{row.area}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600">{row.technician}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{row.invoice_count}</td>
                <td className="px-4 py-2.5 text-[13px] text-rose-600 tabular-nums">{formatCurrency(row.total_outstanding)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{row.oldest_due_date || "-"}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-700 tabular-nums"><OverdueBadge days={row.days_overdue} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>

  </div>
)

// ── Payroll ───────────────────────────────────────────────────────────────────

const PayrollSection: React.FC<{ data: FinancialPayload }> = ({ data }) => (
  <div className="space-y-6">

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="Salary Accrued"      value={formatCurrency(data.employee_financial.stats.salary_accrued)}      icon={<Wallet           className="w-4 h-4" />} />
      <KpiCard title="Salary Paid"         value={formatCurrency(data.employee_financial.stats.salary_paid)}         icon={<ArrowUpDown      className="w-4 h-4" />} />
      <KpiCard title="Commission Earned"   value={formatCurrency(data.employee_financial.stats.commission_earned)}   icon={<CircleDollarSign className="w-4 h-4" />} />
      <KpiCard title="Outstanding Balance" value={formatCurrency(data.employee_financial.stats.outstanding_balance)} icon={<PieChartIcon     className="w-4 h-4" />} />
    </div>

    <SectionCard title="Per-employee financial breakdown" subtitle="Salary, commission, payouts, and balance owed">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHeader cols={["Name", "Role", "Monthly Salary", "Commission Earned", "Paid (Period)", "Total Paid", "Balance Owed"]} />
          <tbody>
            {data.employee_financial.employees.map((e) => (
              <tr key={`${e.name}-${e.role}`} className="border-b border-[0.5px] border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                <td className="px-4 py-2.5 text-[13px] text-slate-700">{e.name}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 capitalize">{e.role.replace(/_/g, " ")}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(e.salary)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(e.commission_earned)}</td>
                <td
                  className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums"
                  title={`Salary: ${formatCurrency(e.salary_paid_this_period || 0)} | Commission: ${formatCurrency(e.commission_paid_this_period || 0)}`}
                >
                  {formatCurrency(e.paid_this_period)}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums">{formatCurrency(e.total_paid)}</td>
                <td className="px-4 py-2.5 text-[13px] text-slate-700 tabular-nums">{formatCurrency(e.balance_owed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>

  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

const FinancialIntelligenceV2: React.FC<{
  tabControls?: React.ReactNode
  dateRange?: DashboardDateRange
  onDateRangeChange?: (range: DashboardDateRange) => void
}> = ({ tabControls, dateRange, onDateRangeChange }) => {
  const today = getPakistaniDate()
  const defaultStart = formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
  const defaultEnd = formatDate(today)

  const [filters, setFilters] = useState<FilterState>({
    startDate:     dateRange?.startDate || defaultStart,
    endDate:       dateRange?.endDate || defaultEnd,
    bankAccount:   "all",
    paymentMethod: "all",
    invoiceStatus: "all",
    ispPaymentType:"all",
    timeRange:     "mtd",
  })
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string>("")
  const [response,      setResponse]      = useState<V2Response | null>(null)
  const [activeSection, setActiveSection] = useState<Section>("revenue")

  // Ref to track when a state change originates from the parent prop,
  // so we don't notify the parent back (which would create a loop).
  const fromPropRef = useRef(false);
  const onDateRangeChangeRef = useRef(onDateRangeChange);
  onDateRangeChangeRef.current = onDateRangeChange;

  useEffect(() => {
    if (!dateRange) return
    fromPropRef.current = true;
    setFilters((prev) => {
      if (prev.startDate === dateRange.startDate && prev.endDate === dateRange.endDate) return prev
      return {
        ...prev,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }
    })
  }, [dateRange])

  useEffect(() => {
    if (fromPropRef.current) {
      fromPropRef.current = false;
      return;
    }
    onDateRangeChangeRef.current?.({ startDate: filters.startDate, endDate: filters.endDate })
  }, [filters.startDate, filters.endDate])

  const bankOptions = useMemo<BankOption[]>(() => {
    const accounts = response?.data?.bank_positions?.accounts ?? []
    return accounts.map((a) => ({ id: a.id, name: `${a.name} - ${a.account_number}` }))
  }, [response])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (filters.startDate)                params.append("start_date",      filters.startDate)
      if (filters.endDate)                  params.append("end_date",        filters.endDate)
      if (filters.bankAccount   !== "all")  params.append("bank_account_id", filters.bankAccount)
      if (filters.paymentMethod !== "all")  params.append("payment_method",  filters.paymentMethod)
      if (filters.invoiceStatus !== "all")  params.append("invoice_status",  filters.invoiceStatus)
      if (filters.ispPaymentType !== "all") params.append("isp_payment_type", filters.ispPaymentType)
      params.append("time_range", filters.timeRange)

      const r = await axiosInstance.get<V2Response>(
        `/dashboard/financial-intelligence?${params.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }, timeout: 30000 }
      )
      setResponse(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load financial intelligence dashboard")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const onQuickFilter = (timeRange: string) => {
    const t = getPakistaniDate()
    let start = new Date(t), end = new Date(t)
    switch (timeRange) {
      case "today":      start = new Date(t); break
      case "week":       start = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 7); break
      case "mtd":        start = new Date(t.getFullYear(), t.getMonth(), 1); break
      case "qtd":        start = new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1); break
      case "ytd":        start = new Date(t.getFullYear(), 0, 1); break
      case "last_month":
        start = new Date(t.getFullYear(), t.getMonth() - 1, 1)
        end   = new Date(t.getFullYear(), t.getMonth(), 0)
        break
    }
    setFilters((p) => ({ ...p, timeRange, startDate: formatDate(start), endDate: formatDate(end) }))
  }

  const data = response?.data

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6" role="status" aria-label="Loading financial intelligence data">
        <div className="bg-white rounded-[10px] border border-slate-200 p-2.5 animate-pulse h-[44px]" />
        {/* 8 KPI cards — 4+4 layout mirrors live render */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[10px] border-[0.5px] border-slate-200 p-5 animate-pulse h-[110px]" />
          ))}
        </div>
        <div className="bg-white rounded-[10px] border border-slate-200 p-2.5 animate-pulse h-[44px]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 p-5 animate-pulse h-[360px]" />
          <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 p-5 animate-pulse h-[360px]" />
        </div>
        <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 p-5 animate-pulse h-[320px]" />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-rose-50 border-l-[3px] border-rose-500 px-5 py-4 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
        <p className="text-[13px] text-rose-700">{error}</p>
        <button
          onClick={fetchData}
          className="ml-auto h-8 px-3 text-[12px] font-medium text-rose-700 bg-rose-100 border-[0.5px] border-rose-200 rounded-md hover:bg-rose-200 transition-colors duration-150"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const paymentStackKeys = (data.revenue_breakdown.stacks.payment_methods || []).map((m) => `payment_${m}`)
  const incomeStackKeys  = (data.revenue_breakdown.stacks.income_types     || []).map((t) => `income_${t}`)

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* 1. Cockpit filter bar — always visible */}
      <AdvancedFilters
        filters={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onQuickFilter={onQuickFilter}
        bankAccounts={bankOptions}
        leadingContent={tabControls}
        compact={true}
        onRefresh={fetchData}
        isRefreshing={loading}
      />

      {/* 2. P&L KPI strip — always visible on every tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Total Revenue */}
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(data.pl_summary.gross_revenue.value)}
          trend={data.pl_summary.gross_revenue.trend}
          positive={data.pl_summary.gross_revenue.is_positive}
          icon={<CircleDollarSign className="w-4 h-4" />}
        />

        {/* 2. Total Collection */}
        <KpiCard
          title="Total Collection"
          value={formatCurrency(data.pl_summary.total_collections.value)}
          trend={data.pl_summary.total_collections.trend}
          positive={data.pl_summary.total_collections.is_positive}
          sub={`vs ${formatCurrency(data.pl_summary.total_collections.previous)} prev period`}
          icon={<Banknote className="w-4 h-4" />}
        />

        {/* 3. Extra Income */}
        <KpiCard
          title="Extra Income"
          value={formatCurrency(data.pl_summary.extra_income.value)}
          trend={data.pl_summary.extra_income.trend}
          positive={data.pl_summary.extra_income.is_positive}
          sub={`vs ${formatCurrency(data.pl_summary.extra_income.previous)} prev period`}
          icon={<TrendingUp className="w-4 h-4" />}
        />

        {/* 4. Total Cost */}
        <KpiCard
          title="Total Cost"
          value={formatCurrency(data.pl_summary.total_costs.value)}
          trend={data.pl_summary.total_costs.trend}
          positive={data.pl_summary.total_costs.is_positive}
          icon={<ArrowUpDown className="w-4 h-4" />}
        />

        {/* 5. Net Profit */}
        <KpiCard
          title="Net Profit"
          value={formatCurrency(data.pl_summary.net_profit.value)}
          trend={data.pl_summary.net_profit.trend}
          positive={data.pl_summary.net_profit.is_positive}
          sub={`Margin ${data.pl_summary.net_profit.margin_pct.toFixed(1)}%`}
          icon={<LineChartIcon className="w-4 h-4" />}
        />

        {/* 6. Cash in Bank */}
        <KpiCard
          title="Cash in Bank"
          value={formatCurrency(data.pl_summary.cash_in_bank.value)}
          sub={`Live \u2022 ${data.pl_summary.cash_in_bank.per_account.length} accounts`}
          icon={<Wallet className="w-4 h-4" />}
        />

        {/* 7. Invoice to Cash */}
        <KpiCard
          title="Invoice to Cash"
          value={formatPercent(data.pl_summary.invoice_to_cash_conversion.value)}
          sub={`Collected ${formatCurrency(data.pl_summary.invoice_to_cash_conversion.collected)} / Invoiced ${formatCurrency(data.pl_summary.invoice_to_cash_conversion.invoiced)}`}
          positive={data.pl_summary.invoice_to_cash_conversion.value >= data.pl_summary.invoice_to_cash_conversion.target_pct}
          icon={<Percent className="w-4 h-4" />}
        />

        {/* 8. Salary % of Revenue */}
        <KpiCard
          title="Salary % of Revenue"
          value={formatPercent(data.pl_summary.salary_pct_of_revenue.value)}
          sub={`Benchmark ${data.pl_summary.salary_pct_of_revenue.benchmark_range.min}\u2013${data.pl_summary.salary_pct_of_revenue.benchmark_range.max}%`}
          positive={data.pl_summary.salary_pct_of_revenue.value <= data.pl_summary.salary_pct_of_revenue.benchmark_range.max}
          icon={<ArrowUpDown className="w-4 h-4" />}
        />

      </div>

      {/* 3. Section navigation — ViewTabs pill pattern */}
      <SectionNav active={activeSection} onChange={setActiveSection} />

      {/* 4. Active section content — only active section mounts */}
      {activeSection === "revenue" && (
        <RevenueSection data={data} paymentStackKeys={paymentStackKeys} incomeStackKeys={incomeStackKeys} />
      )}
      {activeSection === "costs" && (
        <CostsSection data={data} />
      )}
      {activeSection === "banking" && (
        <BankingSection data={data} />
      )}
      {activeSection === "collections" && (
        <CollectionsSection data={data} />
      )}
      {activeSection === "payroll" && (
        <PayrollSection data={data} />
      )}

    </div>
  )
}

export default FinancialIntelligenceV2