import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, AlertTriangle, Landmark, TrendingUp,
  Users, UserPlus, UserMinus, MessageSquareWarning,
  RefreshCw, Calendar, ArrowUpRight, ArrowDownRight,
  ChevronDown, BarChart2,
} from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig.ts';
import { Ledger } from './ledger/Ledger.tsx';

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Skill 04 — chart-tokens: single blue scale + slate infrastructure
const CHART = {
  blue700:   '#1D4ED8',
  blue600:   '#2563EB',
  blue500:   '#3B82F6',
  blue400:   '#60A5FA',
  blue300:   '#93C5FD',
  blue200:   '#BFDBFE',
  slate300:  '#CBD5E1',
  grid:      '#E2E8F0',
  axis:      '#64748B',
  axisSoft:  '#475569',
};
const DONUT_COLORS = [
  '#2563EB',
  '#3B82F6',
  '#60A5FA',
  '#93C5FD',
  '#BFDBFE',
  '#CBD5E1',
];

// ─── Types ────────────────────────────────────────────────────────────────────
// (unchanged — all types preserved exactly)

interface KPIData {
  value: number;
  previous: number;
  trend: number;
  is_positive: boolean;
}

interface DashboardData {
  today_pulse: {
    collections_today: number;
    invoices_due_today: number;
    new_connections_today: number;
    complaints_opened_today: number;
  };
  kpis: {
    collections: KPIData;
    outstanding: KPIData;
    net_cash_position: KPIData;
    gross_margin: KPIData;
    arpu: KPIData;
    active_customers: KPIData;
    new_connections: KPIData;
    churned: KPIData;
    open_complaints: KPIData;
  };
  charts: {
    revenue_vs_isp_cost: { month: string; month_short: string; collections: number; isp_cost: number; margin: number }[];
    customer_growth: { month: string; month_short: string; new: number; churned: number; total: number }[];
    collection_rate: { month: string; month_short: string; billed: number; collected: number; rate: number }[];
    revenue_by_isp: { isp: string; revenue: number; percentage: number }[];
    isp_cost_per_subscriber: { isp: string; subscribers: number; total_cost: number; cost_per_subscriber: number }[];
    top_areas: { area: string; revenue: number }[];
    top_plans: { plan: string; price: number; subscribers: number; mrr: number }[];
  };
  tables: {
    overdue_invoices: {
      id: string; invoice_number: string; customer_name: string; internet_id: string;
      amount: number; due_date: string; days_overdue: number; area: string; technician: string;
    }[];
    open_complaints: {
      id: string; ticket_number: string; customer_name: string; area: string;
      assigned_to: string; created_at: string; status: string; sla_breach: boolean;
      response_due_date?: string | null; sla_seconds_remaining?: number | null; sla_state?: 'on_track' | 'due_soon' | 'breached' | 'unknown';
    }[];
  };
  alerts?: {
    sla?: {
      breach_in_3h: number;
      breach_in_6h: number;
      already_breached: number;
    };
  };
  filters: {
    areas: { id: string; name: string }[];
    isps: { id: string; name: string }[];
  };
  period: { start_date: string; end_date: string; chart_granularity?: 'day' | 'month' };
}

type DashboardDateRange = {
  startDate: string;
  endDate: string;
};

type ExecutiveDashboardProps = {
  dateRange?: DashboardDateRange;
  onDateRangeChange?: (range: DashboardDateRange) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
// (unchanged — all helpers preserved exactly)

const getPakistaniDate = (): Date =>
  new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));

const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatCurrency = (value: number): string => {
  if (value >= 1e7) return `₨ ${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `₨ ${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₨ ${(value / 1e3).toFixed(1)}K`;
  return `₨ ${Math.round(value).toLocaleString()}`;
};

const formatNumber = (value: number): string => value.toLocaleString();

const formatYAxis = (v: number): string =>
  v >= 1e7 ? `${(v / 1e7).toFixed(0)}Cr` :
  v >= 1e5 ? `${(v / 1e5).toFixed(0)}L` :
  v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v);

const formatDuration = (seconds: number): string => {
  const absSec = Math.abs(Math.round(seconds || 0));
  const h = Math.floor(absSec / 3600);
  const m = Math.floor((absSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(m, 1)}m`;
};

const getSlaPill = (secondsRemaining?: number | null) => {
  if (secondsRemaining === null || secondsRemaining === undefined) {
    return { label: 'No SLA', className: 'bg-slate-100 text-slate-500 border-[0.5px] border-slate-200' };
  }
  if (secondsRemaining < 0) {
    return {
      label: `Breached ${formatDuration(secondsRemaining)} ago`,
      className: 'bg-rose-100 text-rose-700 border-[0.5px] border-rose-200',
    };
  }
  if (secondsRemaining <= 3 * 3600) {
    return {
      label: `Breaches in ${formatDuration(secondsRemaining)}`,
      className: 'bg-amber-100 text-amber-700 border-[0.5px] border-amber-200',
    };
  }
  return {
    label: `Due in ${formatDuration(secondsRemaining)}`,
    className: 'bg-emerald-50 text-emerald-700 border-[0.5px] border-emerald-200',
  };
};

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
// Skill 04 — custom dark tooltip used on ALL charts

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border-[0.5px] border-slate-700 rounded-lg px-3 py-2">
      {label && <p className="text-[11px] text-slate-400 mb-1.5 font-medium">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: entry.color || entry.fill }} />
            <span className="text-[11px] text-slate-300">{entry.name}</span>
            <span className="text-[11px] font-medium text-white tabular-nums ml-auto pl-4">
              {typeof entry.value === 'number' && entry.value > 999
                ? formatCurrency(entry.value)
                : typeof entry.value === 'number'
                  ? entry.value % 1 !== 0 ? `${entry.value.toFixed(1)}%` : entry.value.toLocaleString()
                  : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
// Skill 03 — exact recipe: icon w-4 h-4, bg-blue-50 always, text-[22px] font-medium
// variant="alert" for churned and open_complaints

interface KPICardProps {
  title: string;
  value: string;
  trend: number;
  isPositive: boolean;
  icon: React.ReactNode;
  variant?: 'default' | 'alert';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, isPositive, icon, variant = 'default' }) => (
  <div className={`
    bg-white rounded-[10px] border-[0.5px] p-5 flex flex-col gap-3
    hover:border-slate-300 transition-colors duration-150
    ${variant === 'alert' ? 'border-rose-200' : 'border-slate-200'}
  `}>
    {/* Top row: icon + delta */}
    <div className="flex items-start justify-between">
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${variant === 'alert' ? 'bg-rose-50' : 'bg-blue-50'}
      `}>
        {/* Skill 03: icon size w-4 h-4 always */}
        <span className={`w-4 h-4 flex items-center justify-center ${variant === 'alert' ? 'text-rose-500' : 'text-blue-600'}`}>
          {icon}
        </span>
      </div>

      {trend !== 0 && (
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isPositive
            ? <ArrowUpRight className="w-3 h-3" />
            : <ArrowDownRight className="w-3 h-3" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>

    {/* Bottom: label + value */}
    {/* Skill 06 — label: text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] */}
    {/* Skill 06 — value: text-[22px] font-medium text-slate-900 tabular-nums */}
    <div>
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1 truncate">
        {title}
      </p>
      <p className="text-[22px] font-medium text-slate-900 leading-none tabular-nums">
        {value}
      </p>
    </div>
  </div>
);

// ─── Section Divider ──────────────────────────────────────────────────────────
// Skill 08 — separates logical sections with a labeled divider

const SectionDivider: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em] pl-2.5 border-l-2 border-slate-300">
    {label}
  </p>
);

// ─── Chart Card ───────────────────────────────────────────────────────────────
// Skill 01 — card with proper header: border-b border-slate-100, title text-slate-900

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, action, children, className = '' }) => (
  <div className={`bg-white border-[0.5px] border-slate-200 rounded-[10px] ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-[0.5px] border-slate-100">
      <div>
        <h3 className="text-[13px] font-medium text-slate-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Select Wrapper ───────────────────────────────────────────────────────────
// Skill 10 — appearance-none + custom chevron on all selects

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
  <div className="relative">
    <select
      className={`
        h-9 pl-3 pr-8 appearance-none text-[12px] text-slate-700 bg-white
        border-[0.5px] border-slate-200 rounded-md
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
);

// ─── Table — Overdue Badge ────────────────────────────────────────────────────
// Skill 05 — tiered severity (low / medium / high / critical) based on days

const OverdueBadge: React.FC<{ days: number }> = ({ days }) => {
  const tier =
    days >= 90 ? 'critical' :
    days >= 30 ? 'high' :
    days >= 14 ? 'medium' : 'low';

  const styles: Record<string, string> = {
    critical: 'bg-rose-100 text-rose-700 border-[0.5px] border-rose-200',
    high:     'bg-amber-100 text-amber-700 border-[0.5px] border-amber-200',
    medium:   'bg-amber-50 text-amber-600 border-[0.5px] border-amber-200',
    low:      'bg-slate-100 text-slate-500 border-[0.5px] border-slate-200',
  };

  return (
    <span className={`inline-block text-[11px] font-medium tabular-nums px-2 py-0.5 rounded-full whitespace-nowrap ${styles[tier]}`}>
      {days}d
    </span>
  );
};

// ─── Table — Status Badge ─────────────────────────────────────────────────────
// Skill 05 — complaint status badge

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    open:        'bg-amber-50 text-amber-700 border-[0.5px] border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-[0.5px] border-blue-200',
    resolved:    'bg-emerald-50 text-emerald-700 border-[0.5px] border-emerald-200',
    closed:      'bg-slate-100 text-slate-500 border-[0.5px] border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.closed}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
      {status.replace('_', ' ')}
    </span>
  );
};

// ─── Table — Avatar Cell ──────────────────────────────────────────────────────
// Skill 05 — initials circle with name-hash color system.
// Assigns one of 5 muted color pairs deterministically from the name so the
// same person always gets the same color, and consecutive rows never all match.

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-slate-100 text-slate-700',
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
] as const;

const getAvatarColor = (name: string): string => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const AvatarCell: React.FC<{ name: string; sub?: string }> = ({ name, sub }) => {
  const initials   = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colorClass = getAvatarColor(name);
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <span className="text-[10px] font-medium">{initials}</span>
      </div>
      <div>
        <p className="text-[13px] font-medium text-slate-800 leading-tight">{name}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
// Skill 07 — shimmer skeletons, never raw spinner on content

const KpiSkeleton: React.FC = () => (
  <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 p-5 animate-pulse flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
      <div className="h-3 w-10 bg-slate-100 rounded" />
    </div>
    <div>
      <div className="h-2.5 w-20 bg-slate-100 rounded mb-2" />
      <div className="h-6 w-28 bg-slate-200 rounded" />
    </div>
  </div>
);

const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 280 }) => (
  <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-[0.5px] border-slate-100 animate-pulse">
      <div className="h-3.5 w-40 bg-slate-200 rounded" />
    </div>
    <div className="p-5 animate-pulse" style={{ height }}>
      <div className="flex items-end justify-around h-full gap-2 pb-6">
        {[55, 70, 48, 82, 65, 90, 72, 85, 60, 78, 91, 68].map((h, i) => (
          <div key={i} className="flex-1 bg-slate-100 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </div>
);

const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => (
  <div className="bg-white rounded-[10px] border-[0.5px] border-slate-200 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-[0.5px] border-slate-100 animate-pulse">
      <div className="h-3.5 w-48 bg-slate-200 rounded" />
    </div>
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-[0.5px] border-slate-200 bg-slate-50 animate-pulse">
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-4 py-2.5">
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="border-b border-[0.5px] border-slate-100 animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="h-3 bg-slate-100 rounded" style={{ width: `${55 + (j * 13) % 35}%` }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Live Indicator ───────────────────────────────────────────────────────────
// Skill 07 — pulsing ring live dot

const LiveIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5">
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
    </span>
    <span className="text-[11px] text-slate-500 font-medium">Live</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ dateRange, onDateRangeChange }) => {
  const [activeTab, setActiveTab] = useState<'executive' | 'ledger'>('executive');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter state — all logic preserved exactly
  const today = getPakistaniDate();
  const defaultStart = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const defaultEnd = formatDate(today);
  const [startDate, setStartDate] = useState(dateRange?.startDate || defaultStart);
  const [endDate, setEndDate] = useState(dateRange?.endDate || defaultEnd);
  const [areaId, setAreaId] = useState('all');
  const [ispId, setIspId] = useState('all');
  const [timeRange, setTimeRange] = useState('mtd');

  useEffect(() => {
    if (!dateRange) return;
    if (dateRange.startDate !== startDate) setStartDate(dateRange.startDate);
    if (dateRange.endDate !== endDate) setEndDate(dateRange.endDate);
  }, [dateRange, startDate, endDate]);

  useEffect(() => {
    onDateRangeChange?.({ startDate, endDate });
  }, [startDate, endDate, onDateRangeChange]);

  // Fetch — preserved exactly
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (areaId !== 'all') params.append('area_id', areaId);
      if (ispId !== 'all') params.append('isp_id', ispId);
      const response = await axiosInstance.get(`/dashboard/executive-advanced?${params.toString()}`);
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, areaId, ispId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 5 minutes — preserved exactly
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 300_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Quick date presets — preserved exactly
  const handleTimeRange = (preset: string) => {
    setTimeRange(preset);
    const t = getPakistaniDate();
    let s = new Date(t);
    let e = new Date(t);
    switch (preset) {
      case 'today':      s = new Date(t); break;
      case 'week':       s = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 7); break;
      case 'mtd':        s = new Date(t.getFullYear(), t.getMonth(), 1); break;
      case 'qtd':        s = new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1); break;
      case 'ytd':        s = new Date(t.getFullYear(), 0, 1); break;
      case 'last_month':
        s = new Date(t.getFullYear(), t.getMonth() - 1, 1);
        e = new Date(t.getFullYear(), t.getMonth(), 0);
        break;
    }
    setStartDate(formatDate(s));
    setEndDate(formatDate(e));
  };

  // ─── Ledger Tab ─────────────────────────────────────────────────────────────

  if (activeTab === 'ledger') {
    return (
      <div className="space-y-5">
        {/* Ledger view switcher — matches unified cockpit style */}
        <div className="bg-white border border-slate-200 rounded-[10px] px-4 py-2.5 flex items-center gap-0.5 w-fit">
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
            <button
              onClick={() => setActiveTab('executive')}
              className="px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors duration-150 text-slate-500 hover:text-slate-700 hover:bg-white/60"
            >
              Executive
            </button>
            <button
              className="px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors duration-150 bg-blue-600 text-white"
            >
              Ledger
            </button>
          </div>
        </div>
        <Ledger
          dateRange={{ startDate, endDate }}
          onDateRangeChange={({ startDate: nextStart, endDate: nextEnd }) => {
            if (nextStart !== startDate) setStartDate(nextStart);
            if (nextEnd !== endDate) setEndDate(nextEnd);
          }}
        />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/*
       * UNIFIED CONTROL COCKPIT — tabs + filters + refresh in ONE row.
       *
       * Before: two stacked rows wasting ~130px:
       *   Row 1: tabs floated right + refresh (60% empty left side)
       *   Row 2: filter card (presets + dates + selects) in separate card below
       *
       * After: single bar, left-to-right reading order:
       *   [Executive|Ledger] | [Today|7d|MTD|QTD|YTD] | 📅 date—date | ISPs▾ | Areas▾ | [↺]
       *
       * Active tab: bg-blue-600 text-white (saturated — one color anchor in the bar).
       * Active preset: bg-white border (existing system pattern, stays neutral).
       * Bar bg: bg-white border — same card surface as rest of dashboard.
       */}
      <div className="bg-white border border-slate-200 rounded-[10px] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">

          {/* Executive / Ledger — primary view switcher with color anchor */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
            <button
              className="px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors duration-150 bg-blue-600 text-white"
            >
              Executive
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className="px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors duration-150 text-slate-500 hover:text-slate-700 hover:bg-white/60"
            >
              Ledger
            </button>
          </div>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

          {/* Time presets */}
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
                className={`
                  px-2.5 py-1.5 text-[11px] font-medium rounded-[6px] transition-colors duration-150
                  ${timeRange === p.key
                    ? 'bg-white text-slate-900 border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

          {/* Date range — compact h-8 inputs */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setTimeRange('custom'); }}
              className="h-8 px-2.5 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            />
            <span className="text-[11px] text-slate-400 flex-shrink-0">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setTimeRange('custom'); }}
              className="h-8 px-2.5 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            />
          </div>

          {/* Vertical divider */}
          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

          {/* ISP + Area dropdowns — h-8 to match date inputs */}
          <div className="flex items-center gap-2">
            <SelectField
              value={ispId}
              onChange={e => setIspId(e.target.value)}
              className="h-8 text-[12px]"
              style={{ minWidth: 110 }}
            >
              <option value="all">All ISPs</option>
              {data?.filters?.isps?.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </SelectField>

            <SelectField
              value={areaId}
              onChange={e => setAreaId(e.target.value)}
              className="h-8 text-[12px]"
              style={{ minWidth: 110 }}
            >
              <option value="all">All Areas</option>
              {data?.filters?.areas?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </SelectField>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Refresh icon button */}
          <button
            onClick={fetchData}
            disabled={loading}
            title="Refresh data"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150 disabled:opacity-40 flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>
      {/* ══ ERROR STATE ══ */}
      {error && (
        <div className="bg-rose-50 border-l-[3px] border-rose-500 px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <p className="text-[13px] text-rose-700">{error}</p>
          <button
            onClick={fetchData}
            className="ml-auto text-[12px] font-medium text-rose-600 hover:text-rose-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ══ LOADING STATE — Skill 07: skeletons, never spinner on content ══ */}
      {loading && !data && (
        <>
          <SectionDivider label="Financial" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
          <SectionDivider label="Business" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><ChartSkeleton height={300} /></div>
            <ChartSkeleton height={300} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <ChartSkeleton key={i} height={260} />)}
          </div>
          <TableSkeleton rows={5} cols={6} />
          <TableSkeleton rows={4} cols={7} />
        </>
      )}

      {/* ══ DASHBOARD CONTENT ══ */}
      {data && (
        <>
          {/* ── TODAY'S PULSE — first-glance metrics for owner morning review ── */}
          <SectionDivider label="Today's pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Today's Collections"
              value={formatCurrency(data.today_pulse.collections_today)}
              trend={0}
              isPositive={true}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <KPICard
              title="Invoices Due Today"
              value={formatNumber(data.today_pulse.invoices_due_today)}
              trend={0}
              isPositive={false}
              icon={<AlertTriangle className="w-4 h-4" />}
              variant={data.today_pulse.invoices_due_today > 0 ? 'alert' : 'default'}
            />
            <KPICard
              title="New Connections Today"
              value={formatNumber(data.today_pulse.new_connections_today)}
              trend={0}
              isPositive={true}
              icon={<UserPlus className="w-4 h-4" />}
            />
            <KPICard
              title="Complaints Opened Today"
              value={formatNumber(data.today_pulse.complaints_opened_today)}
              trend={0}
              isPositive={false}
              icon={<MessageSquareWarning className="w-4 h-4" />}
              variant={data.today_pulse.complaints_opened_today > 0 ? 'alert' : 'default'}
            />
          </div>

          {/* ── KPI ROW 1 — Financial ─────────────────────────────────────────── */}
          {/* Skill 08 — SectionDivider between logical groups */}
          <SectionDivider label="Financial" />

          {/* Skill 03 — gap-4 on KPI grid, not gap-3 */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Total Collections"
              value={formatCurrency(data.kpis.collections.value)}
              trend={data.kpis.collections.trend}
              isPositive={data.kpis.collections.is_positive}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <KPICard
              title="Outstanding Receivables"
              value={formatCurrency(data.kpis.outstanding.value)}
              trend={data.kpis.outstanding.trend}
              isPositive={false}
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <KPICard
              title="Net Cash Position"
              value={formatCurrency(data.kpis.net_cash_position.value)}
              trend={data.kpis.net_cash_position.trend}
              isPositive={data.kpis.net_cash_position.is_positive}
              icon={<Landmark className="w-4 h-4" />}
            />
            <KPICard
              title="Operating Margin"
              value={`${data.kpis.gross_margin.value}%`}
              trend={data.kpis.gross_margin.trend}
              isPositive={data.kpis.gross_margin.is_positive}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <KPICard
              title="ARPU"
              value={formatCurrency(data.kpis.arpu.value)}
              trend={data.kpis.arpu.trend}
              isPositive={data.kpis.arpu.is_positive}
              icon={<BarChart2 className="w-4 h-4" />}
            />
          </div>

          {/* ── KPI ROW 2 — Business ─────────────────────────────────────────── */}
          <SectionDivider label="Business" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Active Customers"
              value={formatNumber(data.kpis.active_customers.value)}
              trend={data.kpis.active_customers.trend}
              isPositive={data.kpis.active_customers.is_positive}
              icon={<Users className="w-4 h-4" />}
            />
            <KPICard
              title="New Connections"
              value={formatNumber(data.kpis.new_connections.value)}
              trend={data.kpis.new_connections.trend}
              isPositive={data.kpis.new_connections.is_positive}
              icon={<UserPlus className="w-4 h-4" />}
            />
            {/* Skill 03 — variant="alert" for churned (up = bad) */}
            <KPICard
              title="Churned"
              value={formatNumber(data.kpis.churned.value)}
              trend={data.kpis.churned.trend}
              isPositive={data.kpis.churned.is_positive}
              icon={<UserMinus className="w-4 h-4" />}
              variant={data.kpis.churned.value > 0 ? 'alert' : 'default'}
            />
            {/* Skill 03 — variant="alert" if complaints > 0 */}
            <KPICard
              title="Open Complaints"
              value={formatNumber(data.kpis.open_complaints.value)}
              trend={data.kpis.open_complaints.trend}
              isPositive={data.kpis.open_complaints.is_positive}
              icon={<MessageSquareWarning className="w-4 h-4" />}
              variant={data.kpis.open_complaints.value > 0 ? 'alert' : 'default'}
            />
          </div>

          {/* ── CHARTS ROW 1 — Revenue vs ISP Cost (2/3) + Customer Growth (1/3) ── */}
          {/* Skill 08 — primary chart gets 2/3 width, companion gets 1/3 */}
          <SectionDivider label="Trends" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Chart 1 — Revenue vs ISP Cost Area Chart (2/3) */}
            {/* Skill 04 — blue-600 primary, blue-300 secondary, area gradients */}
            <ChartCard
              title="Revenue vs ISP cost"
              subtitle="Collection trend against upstream costs for selected period"
              className="lg:col-span-2"
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.charts.revenue_vs_isp_cost} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="gradCollections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.blue600} stopOpacity={0.12} />
                      <stop offset="100%" stopColor={CHART.blue600} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradISPCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.slate300} stopOpacity={0.10} />
                      <stop offset="100%" stopColor={CHART.slate300} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="none" vertical={false} />
                  <XAxis dataKey="month_short" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={formatYAxis} width={44} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 12 }} />
                  {/* Skill 04 — primary series: blue-600 solid; comparison: slate-300 dashed */}
                  <Area type="monotone" dataKey="collections" name="Collections" stroke={CHART.blue600} fill="url(#gradCollections)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: CHART.blue600, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="isp_cost" name="ISP Cost" stroke={CHART.slate300} fill="url(#gradISPCost)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} activeDot={{ r: 3, fill: CHART.slate300 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 2 — Customer Growth ComposedChart (1/3) */}
            {/* Skill 04 — blue-600 bars (new), rose-300 bars (churned), slate-300 line (total) */}
            <ChartCard
              title="Customer growth"
              subtitle="New, churned, and total active"
            >
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={data.charts.customer_growth} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="none" vertical={false} />
                  <XAxis dataKey="month_short" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="count" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} width={28} />
                  <YAxis yAxisId="total" orientation="right" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 12 }} />
                  <Bar yAxisId="count" dataKey="new" name="New" fill={CHART.blue600} radius={[3, 3, 0, 0]} maxBarSize={22} />
                  <Bar yAxisId="count" dataKey="churned" name="Churned" fill={CHART.blue300} radius={[3, 3, 0, 0]} maxBarSize={22} />
                  <Line yAxisId="total" type="monotone" dataKey="total" name="Total Active" stroke={CHART.slate300} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── CHARTS ROW 2 — Three equal-width charts ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Chart 3 — Collection Rate % Bar */}
            {/* Skill 04 — bars below 85% threshold → rose-300, above → blue-600 */}
            <ChartCard
              title="Collection rate"
              subtitle="% of billed amount collected per month"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.charts.collection_rate} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="none" vertical={false} />
                  <XAxis dataKey="month_short" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} width={36} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="rate" name="Collection rate" radius={[4, 4, 0, 0]} maxBarSize={22}>
                    {data.charts.collection_rate.map((entry, i) => (
                      <Cell key={i} fill={entry.rate < 85 ? CHART.blue300 : CHART.blue600} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* 85% threshold legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-blue-600" />
                  <span className="text-[10px] text-slate-500">≥85% target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: CHART.blue300 }} />
                  <span className="text-[10px] text-slate-500">&lt;85% below target</span>
                </div>
              </div>
            </ChartCard>

            {/* Chart 4 — Revenue by ISP Donut */}
            {/* Skill 04 — DONUT_COLORS: blue-600 → blue-200 → slate-300 */}
            <ChartCard
              title="Revenue by ISP"
              subtitle="Customer payment distribution per upstream provider"
            >
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={data.charts.revenue_by_isp}
                      dataKey="revenue"
                      nameKey="isp"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {data.charts.revenue_by_isp.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[15px] font-medium text-slate-900 tabular-nums">
                    {data.charts.revenue_by_isp.length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ISPs</p>
                </div>
              </div>
              {/* Custom legend */}
              <div className="mt-3 space-y-1.5">
                {data.charts.revenue_by_isp.slice(0, 4).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: DONUT_COLORS[i] }} />
                      <span className="text-slate-600 truncate max-w-[100px]">{entry.isp}</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="text-slate-400">{entry.percentage?.toFixed(0)}%</span>
                      <span className="font-medium text-slate-700">{formatCurrency(entry.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Chart 5 — Top Areas Horizontal Bar */}
            {/* Skill 04 — sequential: darkest = highest rank */}
            <ChartCard
              title="Top areas by revenue"
              subtitle="Geographic revenue concentration"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.charts.top_areas}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 4 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="none" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                  <YAxis type="category" dataKey="area" tick={{ fontSize: 11, fill: CHART.axisSoft, fontFamily: 'inherit' }} axisLine={false} tickLine={false} width={68} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[0, 3, 3, 0]} maxBarSize={14}>
                    {data.charts.top_areas.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === 0 ? CHART.blue600 :
                          i === 1 ? CHART.blue500 :
                          i === 2 ? CHART.blue400 :
                          CHART.blue200
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── CHARTS ROW 3 — Top Plans by MRR ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Top plans by MRR"
              subtitle="Monthly recurring revenue per service plan"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.charts.top_plans}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 4 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="none" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                  <YAxis type="category" dataKey="plan" tick={{ fontSize: 11, fill: CHART.axisSoft, fontFamily: 'inherit' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="mrr" name="MRR" fill={CHART.blue600} radius={[0, 3, 3, 0]} maxBarSize={14}>
                    {data.charts.top_plans.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? CHART.blue700 : i === 1 ? CHART.blue600 : i === 2 ? CHART.blue500 : CHART.blue300} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="ISP Cost per Subscriber"
              subtitle="Most expensive upstream providers per active subscriber"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.charts.isp_cost_per_subscriber}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="none" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: CHART.axis, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                  <YAxis type="category" dataKey="isp" tick={{ fontSize: 11, fill: CHART.axisSoft, fontFamily: 'inherit' }} axisLine={false} tickLine={false} width={98} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="cost_per_subscriber" name="Cost / Subscriber" fill={CHART.blue500} radius={[0, 3, 3, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── ACTION TABLES ─────────────────────────────────────────────────── */}
          <SectionDivider label="Action required" />

          {/* TABLE 1 — Critical Overdue Invoices */}
          {/* Skill 05 — full table recipe with skeleton, empty state, tiered badges */}
          <div className="bg-white border-[0.5px] border-slate-200 rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[0.5px] border-slate-100">
              <div>
                <h3 className="text-[13px] font-medium text-slate-900">Critical overdue invoices</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Sorted by amount — highest priority first</p>
              </div>
              {data.tables.overdue_invoices.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-rose-50 text-rose-600 border-[0.5px] border-rose-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {data.tables.overdue_invoices.length} overdue
                </span>
              )}
            </div>

            {data.tables.overdue_invoices.length === 0 ? (
              /* Skill 05 — empty state */
              <div className="py-14 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-[13px] font-medium text-slate-700">No overdue invoices</p>
                <p className="text-[12px] text-slate-400 mt-1">All accounts are current.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Skill 05 — thead: bg-slate-50, text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] */}
                  <thead>
                    <tr className="bg-slate-50 border-b border-[0.5px] border-slate-200">
                      {['Customer', 'Invoice #', 'Amount', 'Overdue', 'Area', 'Technician'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.tables.overdue_invoices.map(inv => (
                      /* Skill 05 — row hover: hover:bg-blue-50/40 */
                      <tr key={inv.id} className="border-b border-[0.5px] border-slate-100 hover:bg-blue-50/40 transition-colors duration-150">
                        {/* Skill 05 — AvatarCell for customer */}
                        <td className="px-4 py-3">
                          <AvatarCell name={inv.customer_name} sub={inv.internet_id} />
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500 font-mono">{inv.invoice_number}</td>
                        {/* Skill 05 — AmountCell: PKR prefix muted, value bold tabular */}
                        <td className="px-4 py-3 text-right">
                          <span className="text-[11px] text-slate-400 mr-0.5">₨</span>
                          <span className="text-[13px] font-medium text-slate-900 tabular-nums">
                            {inv.amount >= 1e3 ? `${(inv.amount / 1e3).toFixed(1)}K` : Math.round(inv.amount).toLocaleString()}
                          </span>
                        </td>
                        {/* Skill 05 — OverdueBadge: tiered by severity */}
                        <td className="px-4 py-3">
                          <OverdueBadge days={inv.days_overdue} />
                        </td>
                        <td className="px-4 py-3 text-[13px] text-slate-600">{inv.area}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-600">{inv.technician || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TABLE 2 — Open Complaints */}
          <div className="bg-white border-[0.5px] border-slate-200 rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[0.5px] border-slate-100">
              <div>
                <h3 className="text-[13px] font-medium text-slate-900">Open complaints</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">SLA-breached rows highlighted — requires immediate attention</p>
                {data.alerts?.sla && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {data.alerts.sla.breach_in_3h} complaints breach SLA in next 3h; {data.alerts.sla.already_breached} already breached.
                  </p>
                )}
              </div>
              {data.tables.open_complaints.filter(c => c.sla_breach).length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-rose-50 text-rose-600 border-[0.5px] border-rose-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {data.tables.open_complaints.filter(c => c.sla_breach).length} SLA breach
                </span>
              )}
            </div>

            {data.tables.open_complaints.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                  <MessageSquareWarning className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-[13px] font-medium text-slate-700">No open complaints</p>
                <p className="text-[12px] text-slate-400 mt-1">All tickets are resolved.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[0.5px] border-slate-200">
                      {['Ticket #', 'Customer', 'Area', 'Assigned to', 'Created', 'Status', 'SLA'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.tables.open_complaints.map(c => (
                      <tr
                        key={c.id}
                        className={`
                          border-b border-[0.5px] border-slate-100 transition-colors duration-150
                          ${c.sla_breach
                            ? 'bg-rose-50/60 hover:bg-rose-50'
                            : 'hover:bg-blue-50/40'
                          }
                        `}
                      >
                        <td className="px-4 py-3 text-[13px] font-medium text-slate-900 font-mono">{c.ticket_number}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-700">{c.customer_name}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-500">{c.area}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-600">{c.assigned_to || '—'}</td>
                        <td className="px-4 py-3 text-[11px] text-slate-400 tabular-nums">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const sla = getSlaPill(c.sla_seconds_remaining);
                            const dueAt = c.response_due_date ? `${c.response_due_date} PKT` : 'N/A';
                            const tooltip = `SLA due at: ${dueAt}`;
                            return (
                              <span
                                title={tooltip}
                                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${sla.className}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
                                {sla.label}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
};

export default ExecutiveDashboard;