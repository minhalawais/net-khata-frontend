"use client"

import React, { useMemo, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/crudPage.tsx'
import { ServicePlanForm } from '../../components/forms/servicePlanForm.tsx'
import { Zap, Database } from 'lucide-react'

interface ServicePlan {
  id: string
  name: string
  description: string
  speed_mbps: number
  data_cap_gb: number
  price: number
  is_active: boolean
  isp_id: string | null
  isp_name: string | null
}

/* ── AVATAR COLOR HASH: consistent per plan name ── */
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-slate-100 text-slate-700",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-violet-100 text-violet-800",
]
const getAvatarColor = (name: string) => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

const ServicePlanManagement: React.FC = () => {
  useEffect(() => {
    document.title = "Net Khata - Service Plan Management"
  }, [])

  const columns = useMemo<ColumnDef<ServicePlan>[]>(
    () => [
      {
        header: 'ISP',
        accessorKey: 'isp_name',
        cell: info => {
          const value = info.getValue<string>()
          if (!value) return (
            /* ── UNASSIGNED: muted slate badge ── */
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-medium">
              Unassigned
            </span>
          )
          return (
            /* ── ISP NAME: blue semantic badge ── */
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium">
              {value}
            </span>
          )
        },
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: info => {
          const name = info.getValue<string>()
          return (
            /* ── PLAN AVATAR CELL ── */
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium ${getAvatarColor(name)}`}>
                {getInitials(name)}
              </div>
              <span className="text-[13px] font-medium text-slate-700">{name}</span>
            </div>
          )
        },
      },
      {
        header: 'Speed',
        accessorKey: 'speed_mbps',
        cell: info => {
          const value = info.getValue<number>()
          if (!value && value !== 0) return <span className="text-slate-400">—</span>
          return (
            /* ── SPEED: value + muted unit badge ── */
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-slate-900 tabular-nums">{value}</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em]">Mbps</span>
            </div>
          )
        },
      },
      {
        header: 'Data Cap',
        accessorKey: 'data_cap_gb',
        cell: info => {
          const value = info.getValue<number>()
          if (!value && value !== 0) return <span className="text-slate-400">—</span>
          return (
            /* ── DATA CAP: value + muted unit badge ── */
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-[13px] font-medium text-slate-900 tabular-nums">{value}</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em]">GB</span>
            </div>
          )
        },
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: info => {
          const value = info.getValue<number>()
          if (value === undefined || value === null) return <span className="text-slate-400">—</span>
          return (
            /* ── PRICE: muted PKR prefix + tabular-nums value ── */
            <span className="text-[13px] text-slate-900 font-medium tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )
        },
      },
    ],
    [],
  )

  return (
    <CRUDPage<ServicePlan>
      title="Service Plan"
      endpoint="service-plans"
      columns={columns}
      FormComponent={ServicePlanForm}
      validateBeforeSubmit={(formData) => {
        if (!formData.isp_id) return "ISP is required"
        if (!formData.name?.trim()) return "Plan name is required"
        if (!formData.price) return "Price is required"
        return null
      }}
    />
  )
}

export default ServicePlanManagement