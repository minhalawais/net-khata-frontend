"use client"

import React, { useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/crudPage.tsx'
import { ISPPaymentForm } from '../../components/forms/ISPPaymentForm.tsx'
import { ImageViewerModal, useImageViewer } from '../../components/modals/ImageViewerModal.tsx'
import axiosInstance from '../../utils/axiosConfig.ts'
import { Eye } from 'lucide-react'

interface ISPPayment {
  id: string
  isp_id: string
  isp_name: string
  bank_account_id: string
  bank_account_details: string
  payment_type: string
  reference_number?: string
  description: string
  amount: number
  payment_date: string
  billing_period: string
  bandwidth_usage_gb?: number
  rate_per_gb?: number
  payment_method: string
  transaction_id?: string
  status: string
  payment_proof: string
  processed_by: string
  processor_name: string
  is_active: boolean
  created_at: string
}

/* ── PAYMENT TYPE LABELS ── */
const PAYMENT_TYPE_LABELS: Record<string, string> = {
  monthly_subscription: 'Monthly Subscription',
  bandwidth_usage: 'Bandwidth Usage',
  infrastructure: 'Infrastructure',
  other: 'Other',
}

/* ── STATUS BADGE COLORS: flat semantic pairs ── */
const STATUS_STYLES: Record<string, string> = {
  paid:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:  "bg-amber-50   text-amber-700   border-amber-200",
  failed:   "bg-rose-50    text-rose-600    border-rose-200",
  refunded: "bg-slate-100  text-slate-600   border-slate-200",
}
const getStatusStyle = (status: string) =>
  STATUS_STYLES[status?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

/* ── PAYMENT TYPE BADGE COLORS ── */
const TYPE_STYLES: Record<string, string> = {
  monthly_subscription: "bg-blue-50    text-blue-700   border-blue-200",
  bandwidth_usage:      "bg-amber-50   text-amber-700  border-amber-200",
  infrastructure:       "bg-violet-50  text-violet-700 border-violet-200",
  other:                "bg-slate-100  text-slate-600  border-slate-200",
}
const getTypeStyle = (type: string) =>
  TYPE_STYLES[type?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

/* ── PAYMENT METHOD BADGE COLORS ── */
const METHOD_STYLES: Record<string, string> = {
  cash:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  bank_transfer: "bg-blue-50    text-blue-700   border-blue-200",
  credit_card:   "bg-violet-50  text-violet-700 border-violet-200",
  debit_card:    "bg-slate-100  text-slate-600  border-slate-200",
}
const getMethodStyle = (method: string) =>
  METHOD_STYLES[method?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

const ISPPaymentManagement: React.FC = () => {
  const imageViewer = useImageViewer()

  useEffect(() => {
    document.title = "Net Khata - ISP Payment Management"
  }, [])

  const columns = React.useMemo<ColumnDef<ISPPayment>[]>(
    () => [
      {
        header: 'ISP',
        accessorKey: 'isp_name',
        cell: info => {
          const name = info.getValue<string>()
          if (!name) return <span className="text-slate-400">—</span>
          return (
            /* ── ISP: blue semantic badge ── */
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium">
              {name}
            </span>
          )
        },
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: info => (
          /* ── AMOUNT: muted PKR prefix + tabular-nums ── */
          <span className="text-[13px] font-medium text-slate-900 tabular-nums">
            <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
            {info.getValue<number>().toLocaleString()}
          </span>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'payment_date',
        cell: info => (
          <span className="text-[13px] text-slate-600">
            {new Date(info.getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: 'Billing Period',
        accessorKey: 'billing_period',
        cell: info => (
          <span className="text-[13px] text-slate-600">{info.getValue<string>() || '—'}</span>
        ),
      },
      {
        header: 'Type',
        accessorKey: 'payment_type',
        cell: info => {
          const type = info.getValue<string>()
          if (!type) return <span className="text-slate-400">—</span>
          return (
            /* ── PAYMENT TYPE: semantic badge per type ── */
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium whitespace-nowrap ${getTypeStyle(type)}`}>
              {PAYMENT_TYPE_LABELS[type] || type}
            </span>
          )
        },
      },
      {
        header: 'Method',
        accessorKey: 'payment_method',
        cell: info => {
          const method = info.getValue<string>()
          if (!method) return <span className="text-slate-400">—</span>
          return (
            /* ── PAYMENT METHOD: semantic badge per method ── */
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-[0.06em] ${getMethodStyle(method)}`}>
              {method.replace('_', ' ')}
            </span>
          )
        },
      },
      {
        header: 'Bank Account',
        accessorKey: 'bank_account_details',
        cell: info => {
          const value = info.getValue<string>()
          return value
            ? <span className="text-[13px] text-slate-600">{value}</span>
            : <span className="text-slate-400">—</span>
        },
      },
      {
        header: 'Processed By',
        accessorKey: 'processor_name',
        cell: info => (
          <span className="text-[13px] text-slate-600">{info.getValue<string>() || '—'}</span>
        ),
      },
      {
        header: 'Proof',
        accessorKey: 'payment_proof',
        cell: (info: any) => (
          info.getValue() ? (
            /* ── VIEW PROOF: ghost button, no rounded-full, no old palette ── */
            <button
              onClick={() => imageViewer.openViewer(
                `/isp-payments/proof-image/${info.row.original.id}`,
                `ISP Payment Proof - ${info.row.original.isp_name}`,
                axiosInstance,
              )}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
            >
              <Eye className="w-4 h-4" />
              View Proof
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">No proof</span>
          )
        ),
      },
    ],
    [imageViewer],
  )

  return (
    <>
      <CRUDPage<ISPPayment>
        title="ISP Payment"
        endpoint="isp-payments"
        columns={columns}
        FormComponent={ISPPaymentForm}
        validateBeforeSubmit={(formData) => {
          if (!formData.isp_id) return "ISP is required"
          if (!formData.amount) return "Amount is required"
          if (!formData.payment_date) return "Payment date is required"
          if (!formData.payment_type) return "Payment type is required"
          if (!formData.payment_method) return "Payment method is required"
          if (!formData.status) return "Status is required"
          return null
        }}
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

export default ISPPaymentManagement