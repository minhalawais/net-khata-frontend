"use client"

import React, { useMemo, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/crudPage.tsx'
import { VendorForm } from '../../components/forms/vendorForm.tsx'
import { Phone, Mail, CreditCard, Files } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  phone: string
  email: string
  cnic: string
  picture: string
  cnic_front_image: string
  cnic_back_image: string
  agreement_document: string
  is_active: boolean
  created_at: string
}

/* ── AVATAR COLOR HASH: consistent color per vendor name ── */
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

const VendorManagement: React.FC = () => {
  useEffect(() => {
    document.title = "Vendor Management | Net Khata"
  }, [])

  const columns = useMemo<ColumnDef<Vendor>[]>(
    () => [
      {
        header: 'Vendor',
        accessorKey: 'name',
        cell: info => {
          const name = info.getValue() as string
          const vendor = info.row.original
          return (
            /* ── AVATAR CELL: photo if exists, else name-hash initials circle ── */
            <div className="flex items-center gap-2.5">
              {vendor.picture ? (
                <img
                  src={`/vendors/file/${vendor.id}/picture`}
                  alt={name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    // Show sibling initials div on error
                    const sibling = target.nextElementSibling as HTMLElement
                    if (sibling) sibling.style.display = 'flex'
                  }}
                />
              ) : null}
              {/* Initials fallback — always rendered, hidden when photo loads OK */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium ${getAvatarColor(name)} ${vendor.picture ? 'hidden' : ''}`}
              >
                {getInitials(name)}
              </div>
              <span className="text-[13px] font-medium text-slate-700">{name}</span>
            </div>
          )
        },
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: info => (
          /* ── ICON IN CELL: w-4 h-4, muted color, text uses body scale ── */
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-[13px]">{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: info => {
          const value = info.getValue() as string
          return (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-[13px]">{value || <span className="text-slate-400">—</span>}</span>
            </div>
          )
        },
      },
      {
        header: 'CNIC',
        accessorKey: 'cnic',
        cell: info => (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-[13px] text-slate-600 font-mono">{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        header: 'Documents',
        cell: info => {
          const vendor = info.row.original
          const docCount = [
            vendor.cnic_front_image,
            vendor.cnic_back_image,
            vendor.agreement_document,
          ].filter(Boolean).length
          const hasDocuments = docCount > 0

          return hasDocuments ? (
            /* ── DOCUMENT BADGE: emerald semantic pair, system scale ── */
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
              <Files className="w-3 h-3" />
              {docCount} {docCount === 1 ? 'file' : 'files'}
            </span>
          ) : (
            /* ── NO DOCS BADGE: slate muted ── */
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium">
              No files
            </span>
          )
        },
      },
      {
        header: 'Created',
        accessorKey: 'created_at',
        cell: info => (
          /* ── DATE: caption scale, muted color ── */
          <span className="text-[13px] text-slate-400">
            {new Date(info.getValue() as string).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <CRUDPage<Vendor>
      title="Vendor"
      endpoint="vendors"
      columns={columns}
      FormComponent={VendorForm}
      useFormData={true}
      validateBeforeSubmit={(formData) => {
        if (!formData.name?.trim()) return "Vendor name is required"
        if (!formData.phone?.trim()) return "Phone number is required"
        if (!formData.cnic?.trim()) return "CNIC is required"
        return null
      }}
    />
  )
}

export default VendorManagement