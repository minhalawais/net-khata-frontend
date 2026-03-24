"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import {
  AlertCircle, Clock, ShieldAlert, Star, Users,
  ListTodo, CheckCircle, AlertTriangle, Ticket,
  RefreshCw, Calendar, ArrowUpRight, ArrowDownRight,
  Download, Wifi, Globe, Package, Truck, Briefcase
} from "lucide-react"
import axiosInstance from "../../utils/axiosConfig.ts"
import { exportToCSV } from "../../utils/exportUtils.ts"

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface KPIData {
  value: number
  previous: number
  trend: number
  is_positive: boolean
}

interface OpenComplaint {
  id: string
  ticket_number: string
  customer_name: string
  area: string | null
  status: string
  created_at: string
  sla_due: string | null
  sla_seconds_remaining: number | null
  assigned_to: string | null
}

interface OperationsDashboardData {
  customer_health: {
    kpis: {
      active_customers: KPIData
      added_mtd: KPIData
      connection_types: Record<string, number>
      customers_per_isp: { isp: string; count: number }[]
    }
    area_distribution: { area: string; area_id: string; count: number }[]
    plan_adoption: { plan: string; subscribers: number; monthly_revenue: number }[]
    churn_by_area: { area: string; total: number; active: number; inactive: number; churned_mtd: number; churn_pct: number }[]
  }
  complaint_sla: {
    kpis: {
      open_today: number
      open_today_previous: number
      open_today_trend: number
      open_today_is_positive: boolean
      avg_resolution_hours: KPIData
      sla_breaches: number
      sla_breaches_previous: number
      sla_breaches_trend: number
      sla_breaches_is_positive: boolean
      avg_satisfaction: KPIData
    }
    complaint_volume: any[]
    complaint_statuses: string[]
    complaints_by_area: { area: string; count: number; rate: number }[]
    technician_complaints: {
      name: string
      assigned: number
      resolved: number
      avg_resolution_hours: number
      avg_csat: number
    }[]
    open_complaints: OpenComplaint[]
  }
  field_tasks: {
    stats: { pending: number; in_progress: number; completed_mtd: number; overdue: number }
    tasks_by_type: { type: string; count: number }[]
    tasks_by_technician: { name: string; completed: number }[]
    overdue_tasks: {
      id: string
      task_type: string
      priority: string
      due_date: string
      days_overdue: number
      status: string
      assigned_to: string
      customer: string | null
    }[]
  }
  inventory: {
    stats: { total_stock: number; customer_deployed: number; employee_assigned: number; low_stock: number }
    inventory_by_type: { type: string; in_stock: number; deployed: number }[]
    recent_assignments: { item_type: string; assigned_to: string; assigned_to_type: string | null; area: string | null; assigned_date: string | null }[]
  }
  technician_performance: {
    name: string
    active_customers: number
    connections_mtd: number
    complaints_assigned: number
    complaints_resolved: number
    avg_satisfaction: number
    commission_earned: number
    pending_balance: number
  }[]
  period: { start_date: string; end_date: string }
}

type DashboardDateRange = {
  startDate: string
  endDate: string
}

type ServiceSupportProps = {
  dateRange?: DashboardDateRange
  onDateRangeChange?: (range: DashboardDateRange) => void
}

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────

const CHART = {
  blue:     '#2563EB',
  emerald:  '#10B981',
  amber:    '#F59E0B',
  rose:     '#EF4444',
  slate:    '#CBD5E1',
  grid:     '#E2E8F0',
  axis:     '#94A3B8',
}

// Semantic colors for complaint status stacks.
// open = amber (needs attention), in_progress = blue (being handled),
// resolved = emerald (done), closed = slate (archived).
// Previously all DONUT_COLORS (all-blue) — stacks were indistinguishable.
const STATUS_COLORS: Record<string, string> = {
  open:        '#F59E0B',
  in_progress: '#2563EB',
  resolved:    '#10B981',
  closed:      '#94A3B8',
}
const getStatusColor = (status: string): string => STATUS_COLORS[status] ?? '#CBD5E1'

// Task type donut — blue scale is fine here (all same data domain)
const DONUT_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#CBD5E1']

// SLA threshold — resolution times beyond this are highlighted
const SLA_THRESHOLD_HOURS = 24

// Format SLA countdown from seconds remaining (negative = breached)
const formatSlaCountdown = (seconds: number | null): { text: string; cls: string } => {
  if (seconds === null) return { text: 'No SLA', cls: 'text-slate-400' }
  if (seconds < 0) {
    const hrs = Math.abs(Math.floor(seconds / 3600))
    return {
      text: `${hrs}h breached`,
      cls: 'text-rose-600 font-medium',
    }
  }
  const hrs  = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs === 0)  return { text: `${mins}m left`,         cls: 'text-rose-500 font-medium' }
  if (hrs < 4)    return { text: `${hrs}h ${mins}m left`, cls: 'text-amber-600 font-medium' }
  return              { text: `${hrs}h left`,             cls: 'text-emerald-600' }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

const getPKT = (): Date => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }))
const fmtDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fmtCurrency = (v: number): string => {
  if (v >= 1e7) return `₨ ${(v / 1e7).toFixed(1)}Cr`
  if (v >= 1e5) return `₨ ${(v / 1e5).toFixed(1)}L`
  if (v >= 1e3) return `₨ ${(v / 1e3).toFixed(1)}K`
  return `₨ ${Math.round(v).toLocaleString()}`
}
const fmtNum = (v: number): string => v.toLocaleString()

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

// Skill 04 — dark tooltip used on all charts
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border-[0.5px] border-slate-700 rounded-lg px-3 py-2">
      {label && <p className="text-[11px] text-slate-400 mb-1.5 font-medium">{label}</p>}
      <div className="space-y-1">
        {payload.map((e: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: e.color || e.fill }} />
            <span className="text-[11px] text-slate-300">{e.name}</span>
            <span className="text-[11px] font-medium text-white tabular-nums ml-auto pl-4">
              {typeof e.value === 'number' && e.value > 999 ? fmtCurrency(e.value) : e.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skill 03 — KPI card: bg-white rounded-[10px], icon w-4 h-4, text-[22px] font-medium
// variant="alert" → rose icon bg, rose border — card bg stays bg-white (never bg-rose-50)
interface KPICardProps {
  title:      string
  value:      string | number
  trend?:     number
  isPositive?: boolean
  icon:       React.ReactNode
  suffix?:    string
  variant?:   'default' | 'alert'
}
const KPICard: React.FC<KPICardProps> = ({
  title, value, trend, isPositive, icon, suffix = '', variant = 'default'
}) => (
  <div className={`
    bg-white rounded-[10px] border p-5 flex flex-col gap-3
    hover:border-slate-300 transition-colors duration-150
    ${variant === 'alert' ? 'border-rose-200' : 'border-slate-200'}
  `}>
    <div className="flex items-start justify-between">
      {/* Skill 03: icon container w-8 h-8 rounded-lg; icon w-4 h-4 */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${variant === 'alert' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
      {trend !== undefined && trend !== 0 && (
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div>
      {/* Skill 06: label text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] */}
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1 truncate">
        {title}
      </p>
      {/* Skill 06: value text-[22px] font-medium text-slate-900 tabular-nums */}
      <p className="text-[22px] font-medium text-slate-900 leading-none tabular-nums">
        {value}{suffix && <span className="text-[13px] font-medium text-slate-400 ml-1">{suffix}</span>}
      </p>
    </div>
  </div>
)

// Skill 01 — card: bg-white rounded-[10px] border border-slate-200
// Skill 06 — title: text-[13px] font-medium text-slate-900 (NOT text-slate-600)
const ChartCard: React.FC<{
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}> = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-[10px] ${className}`}>
    <div className="px-5 py-4 border-b border-slate-100">
      <h3 className="text-[13px] font-medium text-slate-900">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
)

// Skill 08 — compact left-border section overline
const SectionDivider: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em] pl-2.5 border-l-2 border-slate-300">
    {label}
  </p>
)

// Skill 05 — table header row: bg-slate-50 border-b, th text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]
const Th: React.FC<{ children: React.ReactNode; right?: boolean }> = ({ children, right }) => (
  <th className={`px-4 py-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
)

// Status badge for complaint status
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    open:        'bg-amber-50  text-amber-700  border-amber-200',
    in_progress: 'bg-blue-50   text-blue-700   border-blue-200',
    resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed:      'bg-slate-100 text-slate-500  border-slate-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[status] ?? styles.closed}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: getStatusColor(status) }} />
      {status.replace('_', ' ')}
    </span>
  )
}

// Priority badge for tasks
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles: Record<string, string> = {
    critical: 'bg-rose-50   text-rose-700   border-rose-200',
    high:     'bg-amber-50  text-amber-700  border-amber-200',
    medium:   'bg-blue-50   text-blue-700   border-blue-200',
    low:      'bg-slate-100 text-slate-500  border-slate-200',
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase ${styles[priority] ?? styles.low}`}>
      {priority}
    </span>
  )
}

// ─── SKELETON LOADING ────────────────────────────────────────────────────────

const KpiSkeleton = () => (
  <div className="bg-white rounded-[10px] border border-slate-200 p-5 animate-pulse flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
      <div className="h-3 w-10 bg-slate-100 rounded" />
    </div>
    <div>
      <div className="h-2.5 w-24 bg-slate-100 rounded mb-2" />
      <div className="h-6 w-28 bg-slate-200 rounded" />
    </div>
  </div>
)

const ChartSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-[10px] border border-slate-200 overflow-hidden ${className}`}>
    <div className="px-5 py-4 border-b border-slate-100 animate-pulse">
      <div className="h-3.5 w-40 bg-slate-200 rounded" />
    </div>
    <div className="p-5 animate-pulse h-[260px]">
      <div className="flex items-end justify-around h-full gap-2 pb-6">
        {[55, 70, 48, 82, 65, 90, 72, 85, 60, 78, 91, 68].map((h, i) => (
          <div key={i} className="flex-1 bg-slate-100 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </div>
)

const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 animate-pulse">
      <div className="h-3.5 w-48 bg-slate-200 rounded" />
    </div>
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50 animate-pulse">
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-4 py-2.5">
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="border-b border-slate-100 animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="h-3 bg-slate-100 rounded" style={{ width: `${55 + (j * 11) % 35}%` }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ServiceSupport({ dateRange, onDateRangeChange }: ServiceSupportProps) {
  const [data,        setData]        = useState<OperationsDashboardData | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const today = getPKT()
  const defaultStart = fmtDate(new Date(today.getFullYear(), today.getMonth(), 1))
  const defaultEnd = fmtDate(today)
  const [startDate, setStartDate] = useState(dateRange?.startDate || defaultStart)
  const [endDate,   setEndDate]   = useState(dateRange?.endDate || defaultEnd)
  const [timeRange, setTimeRange] = useState('mtd')

  // Ref to track when a state change originates from the parent prop,
  // so we don't notify the parent back (which would create a loop).
  const fromPropRef = useRef(false);
  const onDateRangeChangeRef = useRef(onDateRangeChange);
  onDateRangeChangeRef.current = onDateRangeChange;

  useEffect(() => {
    if (!dateRange) return
    fromPropRef.current = true;
    setStartDate(prev => dateRange.startDate !== prev ? dateRange.startDate : prev)
    setEndDate(prev => dateRange.endDate !== prev ? dateRange.endDate : prev)
  }, [dateRange])

  useEffect(() => {
    if (fromPropRef.current) {
      fromPropRef.current = false;
      return;
    }
    onDateRangeChangeRef.current?.({ startDate, endDate })
  }, [startDate, endDate])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await axiosInstance.get('/dashboard/service-support-advanced', {
        params: { start_date: startDate, end_date: endDate },
      })
      if (r.data.error) throw new Error(r.data.error)
      setData(r.data)
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(fetchData, 300_000)
    return () => clearInterval(id)
  }, [autoRefresh, fetchData])

  const handleTimeRange = (preset: string) => {
    setTimeRange(preset)
    const t = getPKT()
    let s = new Date(t), e = new Date(t)
    switch (preset) {
      case 'today':      s = new Date(t); break
      case 'week':       s = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 7); break
      case 'mtd':        s = new Date(t.getFullYear(), t.getMonth(), 1); break
      case 'qtd':        s = new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1); break
      case 'ytd':        s = new Date(t.getFullYear(), 0, 1); break
      case 'last_month':
        s = new Date(t.getFullYear(), t.getMonth() - 1, 1)
        e = new Date(t.getFullYear(), t.getMonth(), 0)
        break
    }
    setStartDate(fmtDate(s))
    setEndDate(fmtDate(e))
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Unified Cockpit Bar ─────────────────────────────────────────────── */}
      {/* Skill 08: all controls in one 44px row */}
      <div className="bg-white border border-slate-200 rounded-[10px] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">

          {/* Time presets — ViewTabs pill pattern */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week',  label: '7d'    },
              { key: 'mtd',   label: 'MTD'   },
              { key: 'qtd',   label: 'QTD'   },
              { key: 'ytd',   label: 'YTD'   },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => handleTimeRange(p.key)}
                className={`px-2.5 py-1.5 text-[11px] font-medium rounded-[6px] transition-colors duration-150 ${
                  timeRange === p.key
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

          {/* Date range inputs */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="date" value={startDate}
              onChange={e => { setStartDate(e.target.value); setTimeRange('custom') }}
              className="h-8 px-2.5 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            />
            <span className="text-[11px] text-slate-400 flex-shrink-0">to</span>
            <input
              type="date" value={endDate}
              onChange={e => { setEndDate(e.target.value); setTimeRange('custom') }}
              className="h-8 px-2.5 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            />
          </div>

          <div className="flex-1" />

          {/* Refresh button */}
          <button
            onClick={fetchData}
            disabled={loading}
            title="Refresh data"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150 disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>

      {/* ── Loading skeleton ──────────────────────────────────────────────── */}
      {/* Skill 07: skeleton rows, never spinner on content */}
      {loading && !data && (
        <div className="space-y-5">
          <SectionDivider label="Complaint & SLA Performance" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartSkeleton className="lg:col-span-2" />
            <ChartSkeleton />
          </div>
          <TableSkeleton rows={6} cols={5} />
          <TableSkeleton rows={5} cols={6} />
          <SectionDivider label="Field Tasks & Operations" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <TableSkeleton rows={5} cols={5} />
          <SectionDivider label="Technician Performance" />
          <TableSkeleton rows={5} cols={7} />
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────────────── */}
      {error && !data && (
        <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-4 text-[13px] text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
          <button
            onClick={fetchData}
            className="text-[12px] font-medium text-rose-600 hover:text-rose-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Dashboard content ─────────────────────────────────────────────── */}
      {data && (
        <>

          {/* ================================================================ */}
          {/* SECTION A: CUSTOMER & SERVICE HEALTH                             */}
          {/* ================================================================ */}
          <SectionDivider label="Customer & Service Health" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Active Customers" value={fmtNum(data.customer_health.kpis.active_customers.value)} trend={data.customer_health.kpis.active_customers.trend} isPositive={data.customer_health.kpis.active_customers.is_positive} icon={<Users className="w-4 h-4"/>} />
            <KPICard title="Added MTD" value={fmtNum(data.customer_health.kpis.added_mtd.value)} trend={data.customer_health.kpis.added_mtd.trend} isPositive={data.customer_health.kpis.added_mtd.is_positive} icon={<Users className="w-4 h-4"/>} />
            <div className="bg-white border border-slate-200 rounded-[10px] p-4 flex flex-col justify-center">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2 flex items-center justify-between"><span>Connection Types</span><Wifi className="w-3 h-3" /></p>
              <div className="space-y-1">
                {Object.entries(data.customer_health.kpis.connection_types).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center text-[12px]"><span className="text-slate-600 capitalize">{type.replace('_', ' ')}</span><span className="font-medium text-slate-900">{fmtNum(count as number)}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[10px] p-4 flex flex-col justify-center">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2 flex items-center justify-between"><span>Customers per ISP</span><Globe className="w-3 h-3" /></p>
              <div className="space-y-1">
                {data.customer_health.kpis.customers_per_isp.map((isp, i) => (
                  <div key={i} className="flex justify-between items-center text-[12px]"><span className="text-slate-600 truncate">{isp.isp}</span><span className="font-medium text-slate-900">{fmtNum(isp.count)}</span></div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Customer Distribution by Area" className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.customer_health.area_distribution} margin={{ left: 20 }}>
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="area" type="category" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Customers" fill={CHART.blue} radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden flex flex-col h-[280px] lg:col-span-2">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-medium text-slate-900">Churn by Area</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">High-risk zones requiring attention</p>
                </div>
                <button 
                  onClick={() => exportToCSV(data.customer_health.churn_by_area, 'churn_by_area')}
                  className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <Th>Area</Th>
                      <Th right>Total</Th>
                      <Th right>Active</Th>
                      <Th right>Churn MTD</Th>
                      <Th right>Rate %</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.customer_health.churn_by_area.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/40">
                        <td className="px-4 py-2 text-[12px] font-medium text-slate-800">{row.area}</td>
                        <td className="px-4 py-2 text-[12px] text-slate-600 text-right">{fmtNum(row.total)}</td>
                        <td className="px-4 py-2 text-[12px] text-slate-600 text-right">{fmtNum(row.active)}</td>
                        <td className="px-4 py-2 text-[12px] text-rose-600 font-medium text-right">{row.churned_mtd}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded tabular-nums ${row.churn_pct > 5 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-500'}`}>
                            {row.churn_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECTION B: COMPLAINT & SLA PERFORMANCE                           */}
          {/* ================================================================ */}
          <SectionDivider label="Complaint & SLA Performance" />

          {/* KPI strip — 4 cards */}
          {/* Skill 03: icon w-4 h-4 in w-8 h-8 rounded-lg container         */}
          {/* Skill 03 Amendment: card bg always bg-white — never bg-rose-50  */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Open Complaints"
              value={fmtNum(data.complaint_sla.kpis.open_today)}
              trend={data.complaint_sla.kpis.open_today_trend}
              isPositive={data.complaint_sla.kpis.open_today_is_positive}
              icon={<AlertCircle className="w-4 h-4" />}
              variant={data.complaint_sla.kpis.open_today > 0 ? 'alert' : 'default'}
            />
            <KPICard
              title="Avg Resolution Time"
              value={data.complaint_sla.kpis.avg_resolution_hours.value}
              suffix="hrs"
              trend={data.complaint_sla.kpis.avg_resolution_hours.trend}
              isPositive={data.complaint_sla.kpis.avg_resolution_hours.is_positive}
              icon={<Clock className="w-4 h-4" />}
            />
            <KPICard
              title="SLA Breaches"
              value={fmtNum(data.complaint_sla.kpis.sla_breaches)}
              trend={data.complaint_sla.kpis.sla_breaches_trend}
              isPositive={data.complaint_sla.kpis.sla_breaches_is_positive}
              icon={<ShieldAlert className="w-4 h-4" />}
              variant={data.complaint_sla.kpis.sla_breaches > 0 ? 'alert' : 'default'}
            />
            <KPICard
              title="Avg Satisfaction"
              value={data.complaint_sla.kpis.avg_satisfaction.value}
              suffix="/5"
              trend={data.complaint_sla.kpis.avg_satisfaction.trend}
              isPositive={data.complaint_sla.kpis.avg_satisfaction.is_positive}
              icon={<Star className="w-4 h-4" />}
            />
          </div>

          {/* Charts row — Complaint volume (2/3) + By area (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Complaint Volume by Month — semantic status colors                */}
            {/* Fix: was DONUT_COLORS (all-blue shades, indistinguishable).       */}
            {/* Now: open=amber, in_progress=blue, resolved=emerald, closed=slate */}
            <ChartCard
              title="Complaint volume by month"
              subtitle="12-month trend by status"
              className="lg:col-span-2"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.complaint_sla.complaint_volume} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="month_short" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: CHART.axis, paddingTop: 8 }} />
                  {data.complaint_sla.complaint_statuses.map(status => (
                    <Bar
                      key={status}
                      dataKey={status}
                      name={status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      stackId="a"
                      fill={getStatusColor(status)}
                      maxBarSize={28}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Complaints by Area — with normalized rate tooltip */}
            <ChartCard
              title="Complaints by area"
              subtitle="Count (rate % of customers)"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={data.complaint_sla.complaints_by_area}
                  margin={{ top: 0, right: 8, bottom: 0, left: 4 }}
                >
                  <CartesianGrid stroke={CHART.grid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="area" type="category" width={80} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Complaints" fill={CHART.blue} radius={[0, 3, 3, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* Open Complaints Queue — with SLA countdown ────────────────────── */}
          {/* This table is the most actionable view on this dashboard.         */}
          {/* SLA countdown: shows "Breached Xh ago" / "Xh left" per row.      */}
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-[13px] font-medium text-slate-900">Open complaints queue</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sorted by SLA urgency — breached first
                </p>
              </div>
              {data.complaint_sla.kpis.sla_breaches > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {data.complaint_sla.kpis.sla_breaches} SLA breached
                </span>
              )}
            </div>

            {data.complaint_sla.open_complaints.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[13px] font-medium text-slate-700">No open complaints</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All tickets are resolved.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <Th>Ticket</Th>
                      <Th>Customer</Th>
                      <Th>Area</Th>
                      <Th>Status</Th>
                      <Th>Assigned To</Th>
                      <Th>Opened</Th>
                      <Th>SLA</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.complaint_sla.open_complaints.map(c => {
                      const sla = formatSlaCountdown(c.sla_seconds_remaining)
                      const isBreached = c.sla_seconds_remaining !== null && c.sla_seconds_remaining < 0
                      return (
                        <tr
                          key={c.id}
                          className={`border-b border-slate-100 transition-colors duration-100 ${
                            isBreached ? 'bg-rose-50/40 hover:bg-rose-50' : 'hover:bg-blue-50/40'
                          }`}
                        >
                          <td className="px-4 py-2.5 text-[12px] font-mono font-medium text-slate-800">
                            {c.ticket_number}
                          </td>
                          <td className="px-4 py-2.5 text-[12px] text-slate-700">{c.customer_name}</td>
                          <td className="px-4 py-2.5 text-[12px] text-slate-500">{c.area || '—'}</td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-4 py-2.5 text-[12px] text-slate-600">{c.assigned_to || '—'}</td>
                          <td className="px-4 py-2.5 text-[11px] text-slate-400 tabular-nums">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi' }) : '—'}
                          </td>
                          <td className={`px-4 py-2.5 text-[11px] tabular-nums ${sla.cls}`}>
                            {sla.text}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Technician complaint resolution table ─────────────────────────── */}
          {/* Fix: colored column headers → all text-slate-400 (Skill 05)      */}
          {/* Fix: resolution time badge now threshold-colored                  */}
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-[13px] font-medium text-slate-900">Technician complaint performance</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Resolution rate and avg time per technician for the period</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {/* Skill 05: ALL column headers are text-slate-400 — no colored headers */}
                    <Th>Technician</Th>
                    <Th right>Assigned</Th>
                    <Th right>Resolved</Th>
                    <Th right>Resolution Rate</Th>
                    <Th right>Avg Res. Time</Th>
                    <Th right>Avg CSAT</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.complaint_sla.technician_complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-slate-400">
                        No complaint data for the selected period.
                      </td>
                    </tr>
                  ) : data.complaint_sla.technician_complaints.map((tech, i) => {
                    const resRate = tech.assigned > 0 ? ((tech.resolved / tech.assigned) * 100).toFixed(0) : '0'
                    // Fix: threshold coloring on resolution time badge
                    // ≤ SLA_THRESHOLD_HOURS = emerald (on track), > threshold = rose (over SLA)
                    const resTimeCls = tech.avg_resolution_hours === 0
                      ? 'bg-slate-100 text-slate-400'
                      : tech.avg_resolution_hours <= SLA_THRESHOLD_HOURS
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    return (
                      <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                        <td className="px-4 py-2.5 text-[13px] font-medium text-slate-800">{tech.name}</td>
                        <td className="px-4 py-2.5 text-[13px] text-slate-600 tabular-nums text-right">{tech.assigned}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-[13px] font-medium text-emerald-600 tabular-nums">{tech.resolved}</span>
                        </td>
                        <td className="px-4 py-2.5 text-[12px] text-slate-500 tabular-nums text-right">
                          {resRate}%
                        </td>
                        {/* Fix: was grey badge for all values. Now colored by SLA threshold. */}
                        <td className="px-4 py-2.5 text-right">
                          {tech.avg_resolution_hours === 0 ? (
                            <span className="text-[12px] text-slate-400">—</span>
                          ) : (
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded tabular-nums ${resTimeCls}`}>
                              {tech.avg_resolution_hours}h
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="flex items-center justify-end gap-1 text-[12px] font-medium text-amber-600">
                            {tech.avg_csat > 0 ? tech.avg_csat : '—'}
                            {tech.avg_csat > 0 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SECTION C: FIELD TASKS & OPERATIONS                              */}
          {/* ================================================================ */}
          <SectionDivider label="Field Tasks & Operations" />

          {/* Field Task KPI cards                                              */}
          {/* Fix: was centered icon-above-value layout (different from every  */}
          {/* other KPI card). Now uses the standard KPICard component.        */}
          {/* Fix: was w-5 h-5 icons. Now w-4 h-4 per Skill 03.               */}
          {/* Fix: overdue card was bg-rose-50 full background. Now bg-white   */}
          {/* with variant="alert" (rose icon container only).                 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Pending"
              value={fmtNum(data.field_tasks.stats.pending)}
              icon={<ListTodo className="w-4 h-4" />}
            />
            <KPICard
              title="In Progress"
              value={fmtNum(data.field_tasks.stats.in_progress)}
              icon={<Clock className="w-4 h-4" />}
            />
            <KPICard
              title="Completed MTD"
              value={fmtNum(data.field_tasks.stats.completed_mtd)}
              icon={<CheckCircle className="w-4 h-4" />}
            />
            {/* variant="alert" only tints the icon container — card bg stays bg-white */}
            <KPICard
              title="Overdue Tasks"
              value={fmtNum(data.field_tasks.stats.overdue)}
              icon={<AlertTriangle className="w-4 h-4" />}
              variant={data.field_tasks.stats.overdue > 0 ? 'alert' : 'default'}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <ChartCard title="Tasks by type" subtitle="Distribution for period">
              <div className="relative h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: CHART.axis }}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                    />
                    <Pie
                      data={data.field_tasks.tasks_by_type}
                      innerRadius="58%"
                      outerRadius="78%"
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="type"
                      strokeWidth={0}
                    >
                      {data.field_tasks.tasks_by_type.map((_, idx) => (
                        <Cell key={idx} fill={DONUT_COLORS[idx % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Centre label */}
                <div className="absolute inset-0 flex items-center justify-center -translate-x-[18%] pointer-events-none">
                  <div className="text-center">
                    <p className="text-[20px] font-medium text-slate-900 tabular-nums">
                      {data.field_tasks.tasks_by_type.reduce((a, b) => a + b.count, 0)}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em]">Tasks</p>
                  </div>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Completed tasks by technician" subtitle="Period completions">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.field_tasks.tasks_by_technician} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: CHART.axis }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v.split(' ')[0]}
                  />
                  <YAxis tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="completed" name="Completed" fill={CHART.emerald} radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* Overdue Tasks table */}
          {/* Fix: card was border-rose-200 bg-rose-50 header. Now standard    */}
          {/* bg-white border-slate-200 card with alert indicator in header.   */}
          {/* Fix: "Overdue" column header was text-rose-500 → text-slate-400  */}
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-[13px] font-medium text-slate-900">Overdue tasks</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Critical → High → Medium priority, then oldest first</p>
              </div>
              <div className="flex items-center gap-3">
                {data.field_tasks.stats.overdue > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {data.field_tasks.stats.overdue} overdue
                  </span>
                )}
                <button 
                  onClick={() => exportToCSV(data.field_tasks.overdue_tasks, 'overdue_tasks')}
                  className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
            </div>

            {data.field_tasks.overdue_tasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[13px] font-medium text-slate-700">No overdue tasks</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All tasks are on schedule.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <Th>Task</Th>
                      <Th>Priority</Th>
                      <Th>Customer</Th>
                      <Th>Assigned To</Th>
                      <Th>Due Date</Th>
                      {/* Fix: was text-rose-500 — column headers always text-slate-400 */}
                      <Th right>Days Overdue</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.field_tasks.overdue_tasks.map(task => (
                      <tr key={task.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                        <td className="px-4 py-2.5 text-[13px] font-medium text-slate-800 capitalize">
                          {task.task_type.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-2.5">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-4 py-2.5 text-[12px] text-slate-600">{task.customer || '—'}</td>
                        <td className="px-4 py-2.5 text-[12px] text-slate-600">{task.assigned_to}</td>
                        <td className="px-4 py-2.5 text-[11px] text-slate-500 tabular-nums">{task.due_date}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`text-[11px] font-medium tabular-nums px-2 py-0.5 rounded-full ${
                            task.days_overdue >= 7 ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : task.days_overdue >= 3 ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {task.days_overdue}d
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* SECTION E: TECHNICIAN PERFORMANCE & FINANCIALS                   */}
          {/* ================================================================ */}
          <SectionDivider label="Technician Performance & Financials" />

          {/* Technician Performance table */}
          {/* Fix: ALL colored column headers → text-slate-400 (Skill 05/06)  */}
          <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-medium text-slate-900">Technician performance summary</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Active customers, new connections, complaint handling, and financials for the period</p>
              </div>
              <button 
                onClick={() => exportToCSV(data.technician_performance, 'technician_performance')}
                className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
            </div>
            {data.technician_performance.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[13px] font-medium text-slate-700">No technicians found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No active technician accounts exist.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {/* Skill 05/06: All column headers text-slate-400 — no colored headers */}
                      <Th>Technician</Th>
                      <Th right>Active Cust.</Th>
                      <Th right>New MTD</Th>
                      <Th right>Complaints</Th>
                      <Th right>CSAT</Th>
                      <Th right>Commission</Th>
                      <Th right>Bal. Owed</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.technician_performance.map((tech, i) => {
                      const hashColor = ['bg-blue-100 text-blue-800', 'bg-slate-100 text-slate-700', 'bg-emerald-100 text-emerald-800', 'bg-amber-100 text-amber-800', 'bg-rose-100 text-rose-800']
                      const avatarCls = hashColor[tech.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 5]
                      const initials  = tech.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${avatarCls}`}>
                                <span className="text-[10px] font-medium">{initials}</span>
                              </div>
                              <span className="text-[13px] font-medium text-slate-800">{tech.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-[12px] font-medium text-blue-600 tabular-nums">
                              {fmtNum(tech.active_customers)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-[12px] text-slate-600 tabular-nums">
                            {tech.connections_mtd > 0 ? `+${tech.connections_mtd}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-[12px] text-slate-500 tabular-nums">
                            {tech.complaints_assigned}
                            <span className="text-slate-300 mx-1">/</span>
                            <span className="text-emerald-600 font-medium">{tech.complaints_resolved}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {tech.avg_satisfaction > 0 ? (
                              <span className="flex items-center justify-end gap-1 text-[12px] font-medium text-amber-600">
                                {tech.avg_satisfaction}
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              </span>
                            ) : (
                              <span className="text-[12px] text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-[13px] font-medium text-emerald-600 tabular-nums">
                            {fmtCurrency(tech.commission_earned)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-[13px] font-medium tabular-nums ${
                              tech.pending_balance > 0 ? 'text-rose-600'
                              : tech.pending_balance < 0 ? 'text-emerald-600'
                              : 'text-slate-400'
                            }`}>
                              {fmtCurrency(Math.abs(tech.pending_balance))}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  )
}