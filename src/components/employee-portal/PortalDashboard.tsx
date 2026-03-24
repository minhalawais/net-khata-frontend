"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  ClipboardList,
  AlertCircle,
  Users,
  Wallet,
  RefreshCw,
  TrendingUp,
  Clock,
  Target,
  Award,
} from "lucide-react"
import HorizontalLogo from "../../assets/net_khata_horizontal.png"

interface DashboardStats {
  pending_tasks: number
  open_complaints: number
  managed_customers: number
  total_managed_customers: number
  current_balance: number
  todays_collections: number
  pending_recoveries: number
  month_earnings: number
}

interface PerformanceMetrics {
  complaint_resolution_rate: number
  avg_resolution_time_hours: number
  task_completion_rate: number
  customer_retention_rate: number
  collection_efficiency: number
  total_complaints_assigned: number
  resolved_complaints: number
  total_tasks_assigned: number
  completed_tasks: number
  active_customers: number
  total_managed_customers: number
}

export function PortalDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = getToken()
      const [statsRes, perfRes] = await Promise.all([
        axiosInstance.get("/employee-portal/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/employee-portal/performance", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      setStats(statsRes.data)
      setPerformance(perfRes.data)
    } catch (error) {
      console.error("Failed to fetch dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-[10px]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-[10px]"></div>
          ))}
        </div>
      </div>
    )
  }

  const kpiCards = [
    {
      label: "Pending Tasks",
      value: stats?.pending_tasks || 0,
      icon: ClipboardList,
      color: "text-blue-600 bg-blue-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "Open Complaints",
      value: stats?.open_complaints || 0,
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "Active Customers",
      value: stats?.managed_customers || 0,
      icon: Users,
      color: "text-emerald-600 bg-emerald-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "Current Balance",
      value: `PKR ${(stats?.current_balance || 0).toLocaleString()}`,
      icon: Wallet,
      color: "text-slate-700 bg-slate-100",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "Today's Collections",
      value: `PKR ${(stats?.todays_collections || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "Pending Recoveries",
      value: stats?.pending_recoveries || 0,
      icon: RefreshCw,
      color: "text-rose-600 bg-rose-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
  ]

  const performanceCards = [
    {
      label: "Task Completion",
      value: `${performance?.task_completion_rate || 0}%`,
      subtext: `${performance?.completed_tasks || 0}/${performance?.total_tasks_assigned || 0} tasks`,
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Complaint Resolution",
      value: `${performance?.complaint_resolution_rate || 0}%`,
      subtext: `${performance?.resolved_complaints || 0}/${performance?.total_complaints_assigned || 0} resolved`,
      icon: Award,
      color: "text-green-600",
    },
    {
      label: "Avg Resolution Time",
      value: `${performance?.avg_resolution_time_hours || 0}h`,
      subtext: "Average time to resolve",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      label: "Customer Retention",
      value: `${performance?.customer_retention_rate || 0}%`,
      subtext: `${performance?.active_customers || 0}/${performance?.total_managed_customers || 0} active`,
      icon: Users,
      color: "text-slate-600",
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={HorizontalLogo} alt="Net Khata Logo" className="h-9 w-auto object-contain" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">Performance Dashboard</h1>
            <p className="text-[12px] text-slate-500 mt-1.5">Overview of your tasks, complaints, and financials</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div
              key={index}
              className={`${kpi.bgColor} rounded-[12px] p-4 hover:border-blue-300 transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between">
                <div className={`${kpi.color} w-8 h-8 rounded-[8px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-4 h-4 text-current" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[20px] font-bold text-slate-900 tracking-tight leading-none mb-1.5">{kpi.value}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.06em]">{kpi.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-4 lg:p-5 shadow-sm">
        <h3 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceCards.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className="text-center p-3.5 bg-slate-50/50 border border-slate-100 rounded-[10px] hover:bg-white hover:shadow-sm transition-all duration-300">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${metric.color} opacity-80`} />
                <p className="text-[18px] font-bold text-slate-900 tracking-tight mb-0.5">{metric.value}</p>
                <p className="text-[11px] font-medium text-slate-700">{metric.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{metric.subtext}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Month Summary - Stunning Widget */}
      <div className="relative overflow-hidden bg-blue-600 text-white border border-blue-700 rounded-[12px] p-5 shadow-sm">
        {/* Dynamic Background Patterns */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-blue-500/20 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-indigo-500/20 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h3 className="text-[12px] font-medium text-blue-100 mb-1.5 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" />
              This Month's Earnings
            </h3>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight">PKR {(stats?.month_earnings || 0).toLocaleString()}</p>
            <p className="text-[11px] text-blue-200 mt-1.5 font-medium">
              Including commissions, bonuses, and salary accruals.
            </p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm self-start md:self-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
