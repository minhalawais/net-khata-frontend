"use client"

import React, { useMemo, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { Building2, Mail, Phone, Eye } from "lucide-react"

import { CRUDPage } from "../../components/crudPage.tsx"
import { CompanyForm } from "../../components/forms/companyForm.tsx"

interface Company {
  id: string
  name: string
  address: string
  contact_number: string
  email: string
  is_active: boolean
  users_count: number
  customers_count: number
}

const CompanyManagement: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Company Management | Net Khata"
  }, [])

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        header: "Company",
        accessorKey: "name",
        cell: (info) => {
          const name = info.getValue() as string
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-medium text-slate-700">{name}</span>
            </div>
          )
        },
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: (info) => {
          const value = info.getValue() as string
          if (!value) return <span className="text-slate-400">-</span>
          return (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-[13px] text-slate-600">{value}</span>
            </div>
          )
        },
      },
      {
        header: "Contact",
        accessorKey: "contact_number",
        cell: (info) => {
          const value = info.getValue() as string
          if (!value) return <span className="text-slate-400">-</span>
          return (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-[13px] text-slate-600">{value}</span>
            </div>
          )
        },
      },
      {
        header: "Users",
        accessorKey: "users_count",
        cell: (info) => <span className="text-[13px] text-slate-700 tabular-nums">{info.getValue() as number}</span>,
      },
      {
        header: "Customers",
        accessorKey: "customers_count",
        cell: (info) => <span className="text-[13px] text-slate-700 tabular-nums">{info.getValue() as number}</span>,
      },
      {
        header: "Quick Actions",
        id: "quick_actions",
        cell: (info) => (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/companies/${info.row.original.id}`)
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
          >
            <Eye className="w-4 h-4" /> Profile
          </button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <CRUDPage<Company>
      title="Company"
      endpoint="companies"
      columns={columns}
      FormComponent={CompanyForm}
      validateBeforeSubmit={(formData) => {
        if (!formData.name?.toString().trim()) return "Company name is required"
        return null
      }}
    />
  )
}

export default CompanyManagement