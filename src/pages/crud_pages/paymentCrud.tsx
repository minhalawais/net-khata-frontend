"use client"

import React, { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/paymentCrudPage.tsx'
import { PaymentForm } from '../../components/forms/paymentForm.tsx'
import { ImageViewerModal, useImageViewer } from '../../components/modals/ImageViewerModal.tsx'
import { PaymentVerificationModal } from '../../components/modals/PaymentVerificationModal.tsx'
import axiosInstance from '../../utils/axiosConfig.ts'
import { Eye } from 'lucide-react'

interface Payment {
  id: string
  invoice_id: string
  invoice_number: string
  customer_name: string
  amount: number
  payment_date: string
  payment_method: string
  transaction_id: string
  status: string
  failure_reason?: string
  payment_proof: string
  received_by: string
  is_active: boolean
  bank_account_id?: string
  bank_account_details?: string
}

/* ── PAYMENT STATUS COLORS: flat semantic pairs, no gradients ── */
const STATUS_STYLES: Record<string, string> = {
  paid:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:  "bg-amber-50   text-amber-700   border-amber-200",
  failed:   "bg-rose-50    text-rose-600    border-rose-200",
  overdue:  "bg-rose-50    text-rose-600    border-rose-200",
  refunded: "bg-slate-100  text-slate-600   border-slate-200",
}
const getStatusStyle = (status: string) =>
  STATUS_STYLES[status?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

/* ── PAYMENT METHOD BADGE COLORS ── */
const METHOD_STYLES: Record<string, string> = {
  cash:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  bank_transfer: "bg-blue-50    text-blue-700   border-blue-200",
  credit_card:   "bg-violet-50  text-violet-700 border-violet-200",
  debit_card:    "bg-slate-100  text-slate-600  border-slate-200",
}
const getMethodStyle = (method: string) =>
  METHOD_STYLES[method?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

const PaymentManagement: React.FC = () => {
  const imageViewer = useImageViewer()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)

  const handleVerificationComplete = () => {
    setRefreshTrigger(prev => prev + 1)
    setSelectedPayment(null)
  }

  const handleStatusClick = (payment: Payment) => {
    if (payment.status === 'pending') {
      setSelectedPayment(payment)
      setIsVerificationModalOpen(true)
    }
  }

  useEffect(() => {
    document.title = "Net Khata - Payment Management"
  }, [])

  const columns = React.useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        header: 'Invoice',
        accessorKey: 'invoice_number',
        cell: info => (
          /* ── INVOICE + CUSTOMER: stacked cell ── */
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-slate-700 font-mono">
              {info.getValue<string>()}
            </span>
            <span className="text-[11px] text-slate-400">
              {info.row.original.customer_name}
            </span>
          </div>
        ),
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: info => (
          /* ── AMOUNT: muted PKR prefix + tabular-nums ── */
          <span className="text-[13px] font-medium text-slate-900 tabular-nums">
            <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
            {info.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'payment_date',
        cell: info => (
          <span className="text-[13px] text-slate-600">{info.getValue<string>()}</span>
        ),
      },
      {
        header: 'Method',
        accessorKey: 'payment_method',
        cell: info => {
          const method = info.getValue<string>()
          if (!method) return <span className="text-slate-400">—</span>
          return (
            /* ── METHOD BADGE: semantic color per method ── */
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
        header: 'Status',
        accessorKey: 'status',
        cell: (info: any) => {
          const status = info.getValue() as string
          const isPending = status === 'pending'
          return (
            /* ── STATUS BADGE: flat semantic pairs, no gradient, no animate-pulse ── */
            <button
              onClick={isPending ? () => handleStatusClick(info.row.original) : undefined}
              disabled={!isPending}
              className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ${getStatusStyle(status)} ${
                isPending ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
              }`}
              title={isPending ? "Click to verify payment" : status}
            >
              {status === 'pending' ? 'Pending Validation' : status}
            </button>
          )
        },
      },
      {
        header: 'Received By',
        accessorKey: 'received_by',
        cell: info => (
          <span className="text-[13px] text-slate-600">{info.getValue<string>() || '—'}</span>
        ),
      },
      {
        header: 'Proof',
        accessorKey: 'payment_proof',
        cell: (info: any) => {
          const paymentProof = info.getValue()
          if (!paymentProof) return <span className="text-[11px] text-slate-400">No Image</span>
          return (
            /* ── VIEW PROOF: ghost button, no rounded-full, no old palette ── */
            <button
              onClick={() => imageViewer.openViewer(
                `/payments/proof-image/${info.row.original.id}`,
                `Payment Proof - ${info.row.original.invoice_number}`,
                axiosInstance,
              )}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
            >
              <Eye className="w-4 h-4" />
              View Proof
            </button>
          )
        },
      },
    ],
    [imageViewer],
  )

  return (
    <>
      <CRUDPage<Payment>
        title="Payment"
        endpoint="payments"
        columns={columns}
        FormComponent={PaymentForm}
        refreshTrigger={refreshTrigger}
      />
      <ImageViewerModal
        isOpen={imageViewer.isOpen}
        onClose={imageViewer.closeViewer}
        imageUrl={imageViewer.imageUrl}
        title={imageViewer.title}
        isLoading={imageViewer.isLoading}
      />
      {selectedPayment && (
        <PaymentVerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          payment={selectedPayment}
          onVerify={handleVerificationComplete}
        />
      )}
    </>
  )
}

export default PaymentManagement