"use client"

import React, { useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/crudPage.tsx'
import { BankAccountForm } from '../../components/forms/BankAccountForm.tsx'
import { Hash } from 'lucide-react'

interface BankAccount {
  id: string
  bank_name: string
  account_title: string
  account_number: string
  iban?: string
  branch_code?: string
  initial_balance: number
  branch_address?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

/* ── AVATAR COLOR HASH: consistent per bank name ── */
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

const BankAccountManagement: React.FC = () => {
  useEffect(() => {
    document.title = "Bank Account Management | Net Khata"
  }, [])

  const columns = React.useMemo<ColumnDef<BankAccount>[]>(
    () => [
      {
        header: 'Bank Name',
        accessorKey: 'bank_name',
        cell: info => {
          const name = info.getValue<string>()
          if (!name) return <span className="text-slate-400">—</span>
          return (
            /* ── AVATAR CELL: name-hash initials ── */
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
        header: 'Account Title',
        accessorKey: 'account_title',
        cell: info => (
          <span className="text-[13px] text-slate-600">{info.getValue<string>() || '—'}</span>
        ),
      },
      {
        header: 'Account Number',
        accessorKey: 'account_number',
        cell: info => (
          /* ── ACCOUNT NUMBER: monospace ── */
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-[13px] text-slate-600 font-mono">{info.getValue<string>()}</span>
          </div>
        ),
      },
      {
        header: 'IBAN',
        accessorKey: 'iban',
        cell: info => {
          const value = info.getValue<string>()
          return value
            ? <span className="text-[13px] text-slate-600 font-mono">{value}</span>
            : <span className="text-slate-400">—</span>
        },
      },
      {
        header: 'Initial Balance',
        accessorKey: 'initial_balance',
        cell: info => {
          const value = info.getValue<number>()
          return (
            /* ── MONETARY: muted PKR prefix + tabular-nums ── */
            <span className="text-[13px] font-medium text-slate-900 tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )
        },
      },
      {
        header: 'Branch Code',
        accessorKey: 'branch_code',
        cell: info => {
          const value = info.getValue<string>()
          return value
            ? <span className="text-[13px] text-slate-600 font-mono">{value}</span>
            : <span className="text-slate-400">—</span>
        },
      },
      {
        header: 'Created',
        accessorKey: 'created_at',
        cell: info => {
          const date = info.getValue<string>()
          return date
            ? <span className="text-[13px] text-slate-600">{new Date(date).toLocaleDateString()}</span>
            : <span className="text-slate-400">—</span>
        },
      },
    ],
    [],
  )

  return (
    <CRUDPage<BankAccount>
      title="Bank Account"
      endpoint="bank-accounts"
      columns={columns}
      FormComponent={BankAccountForm}
      validateBeforeSubmit={(formData) => {
        if (!formData.bank_name?.trim()) return "Bank name is required"
        if (!formData.account_title?.trim()) return "Account title is required"
        if (!formData.account_number?.trim()) return "Account number is required"
        return null
      }}
    />
  )
}

export default BankAccountManagement