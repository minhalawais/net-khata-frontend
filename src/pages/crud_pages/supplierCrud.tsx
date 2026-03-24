"use client"

import React, { useMemo, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/crudPage.tsx'
import { SupplierForm } from '../../components/forms/supplierForm.tsx'
import { Mail, Phone, MapPin, Building2 } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  is_active: boolean
}

/* ── AVATAR COLOR HASH: consistent color per supplier name ── */
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
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const SupplierManagement: React.FC = () => {
  useEffect(() => {
    document.title = "Net Khata - Supplier Management"
  }, [])

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: info => {
          const name = info.getValue() as string
          return (
            /* ── AVATAR CELL: name-hash initials + supplier name ── */
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium ${getAvatarColor(name)}`}
              >
                {getInitials(name)}
              </div>
              <span className="text-[13px] font-medium text-slate-700">{name}</span>
            </div>
          )
        },
      },
      {
        header: 'Contact Person',
        accessorKey: 'contact_person',
        cell: info => {
          const value = info.getValue() as string
          if (!value) return <span className="text-slate-400">—</span>
          return (
            <span className="text-[13px] text-slate-600">{value}</span>
          )
        },
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: info => {
          const value = info.getValue() as string
          if (!value) return <span className="text-slate-400">—</span>
          return (
            /* ── ICON IN CELL: w-4 h-4, muted slate-400 ── */
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">{value}</span>
            </div>
          )
        },
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: info => {
          const value = info.getValue() as string
          if (!value) return <span className="text-slate-400">—</span>
          return (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-[13px] text-slate-600">{value}</span>
            </div>
          )
        },
      },
      {
        header: 'Address',
        accessorKey: 'address',
        cell: info => {
          const value = info.getValue() as string
          if (!value) return <span className="text-slate-400">—</span>
          return (
            /* ── ADDRESS CELL: truncated with tooltip, correct Tailwind utility ── */
            <div className="flex items-start gap-2 max-w-[220px]">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span
                className="text-[13px] text-slate-600 truncate"
                title={value}
              >
                {value}
              </span>
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <CRUDPage<Supplier>
      title="Supplier"
      endpoint="suppliers"
      columns={columns}
      FormComponent={SupplierForm}
      validateBeforeSubmit={(formData) => {
        if (!formData.name?.trim()) return "Supplier name is required"
        if (!formData.email?.trim()) return "Email is required"
        return null
      }}
    />
  )
}

export default SupplierManagement