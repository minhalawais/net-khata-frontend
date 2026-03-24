"use client"

import type React from "react"
import { useMemo, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CRUDPage } from "../../components/customerCrudPage.tsx"
import { CustomerForm } from "../../components/forms/customerForm.tsx"
import { ImageViewerModal, useImageViewer } from "../../components/modals/ImageViewerModal.tsx"
import axiosInstance from "../../utils/axiosConfig.ts"
import { Eye, FileText } from "lucide-react"

interface Customer {
  id: string
  internet_id: string
  first_name: string
  last_name: string
  email: string
  phone_1: string
  phone_2: string | null
  area: string
  installation_address: string
  service_plan: string
  isp: string
  connection_type: string
  internet_connection_type: string | null
  tv_cable_connection_type: string | null
  installation_date: string | null
  is_active: boolean
  cnic: string
  cnic_front_image: string | null
  cnic_back_image: string | null
  gps_coordinates: string | null
  agreement_document: string | null
}

/* ── AVATAR COLOR HASH: consistent color per customer name ── */
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

const CustomerManagement: React.FC = () => {
  const imageViewer = useImageViewer()

  useEffect(() => {
    document.title = "Net Khata - Customer Management"
  }, [])

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        header: "Internet ID",
        accessorKey: "internet_id",
        cell: (info) => (
          /* ── INTERNET ID: monospace, caption color ── */
          <span className="text-[13px] text-slate-600 font-mono">{info.getValue() as string}</span>
        ),
      },
      {
        header: "Name",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        cell: (info) => {
          const name = info.getValue() as string
          return (
            /* ── AVATAR CELL: name-hash initials ── */
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
        header: "Phone",
        accessorKey: "phone_1",
        cell: (info) => (
          <span className="text-[13px] text-slate-600">{info.getValue() as string}</span>
        ),
      },
      {
        header: "Area",
        accessorKey: "area",
        cell: (info) => (
          <span className="text-[13px] text-slate-600">{info.getValue() as string}</span>
        ),
      },
      {
        header: "Service Plan",
        accessorKey: "service_plan",
        cell: (info) => {
          const planRaw = info.getValue() as string
          if (!planRaw) return <span className="text-[11px] text-slate-400">No Plan</span>

          const plans = planRaw.includes(",")
            ? planRaw.split(",").map((p) => p.trim())
            : [planRaw]

          return (
            /* ── SERVICE PLAN BADGES: single system blue pair ── */
            <div className="flex flex-wrap gap-1">
              {plans.map((plan, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium whitespace-nowrap"
                >
                  {plan}
                </span>
              ))}
            </div>
          )
        },
      },
      {
        header: "CNIC Front",
        accessorKey: "cnic_front_image",
        cell: (info: any) => (
          <div className="flex justify-center">
            {info.getValue() ? (
              /* ── VIEW BUTTON: ghost style, no rounded-full ── */
              <button
                onClick={() =>
                  imageViewer.openViewer(
                    `/customers/cnic-front-image/${info.row.original.id}`,
                    `CNIC Front - ${info.row.original.first_name} ${info.row.original.last_name}`,
                    axiosInstance,
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">No Image</span>
            )}
          </div>
        ),
      },
      {
        header: "CNIC Back",
        accessorKey: "cnic_back_image",
        cell: (info: any) => (
          <div className="flex justify-center">
            {info.getValue() ? (
              <button
                onClick={() =>
                  imageViewer.openViewer(
                    `/customers/cnic-back-image/${info.row.original.id}`,
                    `CNIC Back - ${info.row.original.first_name} ${info.row.original.last_name}`,
                    axiosInstance,
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">No Image</span>
            )}
          </div>
        ),
      },
      {
        header: "Agreement",
        accessorKey: "agreement_document",
        cell: (info: any) => (
          <div className="flex justify-center">
            {info.getValue() ? (
              <button
                onClick={() =>
                  imageViewer.openViewer(
                    `/customers/agreement-document/${info.row.original.id}`,
                    `Agreement - ${info.row.original.first_name} ${info.row.original.last_name}`,
                    axiosInstance,
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
              >
                <FileText className="w-4 h-4" />
                View
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">No Document</span>
            )}
          </div>
        ),
      },
    ],
    [imageViewer],
  )

  return (
    <>
      <CRUDPage<Customer>
        title="Customer"
        endpoint="customers"
        columns={columns}
        FormComponent={CustomerForm}
        supportsBulkAdd={true}
      />
      <ImageViewerModal
        isOpen={imageViewer.isOpen}
        onClose={imageViewer.closeViewer}
        imageUrl={imageViewer.imageUrl}
        title={imageViewer.title}
        isLoading={imageViewer.isLoading}
      />
    </>
  )
}

export default CustomerManagement