"use client"

import { toast } from "../../utils/toast.ts"
import React from "react"
import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CRUDPage } from "../../components/invoiceCrudPage.tsx"
import { InvoiceForm } from "../../components/forms/invoiceForm.tsx"
import { BulkInvoiceModal } from "../../components/modals/BulkInvoiceModal.tsx"
import { Modal } from "../../components/modal.tsx"
import { PaymentForm } from "../../components/forms/paymentForm.tsx"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import { FileText, Plus } from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  internet_id: string
  customer_name: string
  billing_start_date: string
  billing_end_date: string
  due_date: string
  subtotal: string | number
  discount_percentage: string | number
  total_amount: string | number
  invoice_type: string
  notes: string
  status: string
  is_active: boolean
}

/* ── INVOICE STATUS BADGE COLORS: flat semantic pairs, no gradients ── */
const STATUS_STYLES: Record<string, string> = {
  paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50   text-amber-700   border-amber-200",
  overdue: "bg-rose-50    text-rose-600    border-rose-200",
}
const getStatusStyle = (status: string) =>
  STATUS_STYLES[status?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

/* ── INVOICE TYPE BADGE COLORS ── */
const TYPE_STYLES: Record<string, string> = {
  subscription: "bg-blue-50    text-blue-700   border-blue-200",
  installation: "bg-amber-50   text-amber-700  border-amber-200",
  equipment:    "bg-violet-50  text-violet-700 border-violet-200",
  add_on:       "bg-slate-100  text-slate-600  border-slate-200",
  refund:       "bg-rose-50    text-rose-600   border-rose-200",
  deposit:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance:  "bg-slate-100  text-slate-600  border-slate-200",
}
const getTypeStyle = (type: string) =>
  TYPE_STYLES[type?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

const InvoiceManagement = () => {
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState<any>({})
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  useEffect(() => {
    document.title = "Invoice Management | Net Khata"
  }, [])

  const handleBulkSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setShowBulkModal(false)
  }

  const handlePendingClick = (invoice: any) => {
    setPaymentFormData({ invoice_id: invoice.id, amount: invoice.total_amount, status: "paid" })
    setShowPaymentModal(true)
  }

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPaymentFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPaymentLoading(true)
    try {
      const token = getToken()
      if (paymentFormData.payment_proof instanceof File) {
        const formDataToSend = new FormData()
        Object.keys(paymentFormData).forEach((key) => formDataToSend.append(key, paymentFormData[key]))
        await axiosInstance.post("/payments/add", formDataToSend, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
      } else {
        await axiosInstance.post("/payments/add", paymentFormData, { headers: { Authorization: `Bearer ${token}` } })
      }
      toast.success("Payment added successfully")
      setShowPaymentModal(false)
      setPaymentFormData({})
      setRefreshTrigger(prev => prev + 1)
    } catch {
      toast.error("Failed to add payment")
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setPaymentFormData({})
  }

  const columns = React.useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        header: "Invoice #",
        accessorKey: "invoice_number",
        cell: (info) => (
          /* ── INVOICE NUMBER: monospace ── */
          <span className="text-[13px] text-slate-700 font-mono font-medium">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        header: "Internet ID",
        accessorKey: "internet_id",
        cell: (info) => (
          <span className="text-[13px] text-slate-600 font-mono">{info.getValue<string>()}</span>
        ),
      },
      {
        header: "Billing Start",
        accessorKey: "billing_start_date",
        cell: (info) => (
          <span className="text-[13px] text-slate-600">
            {new Date(info.getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Billing End",
        accessorKey: "billing_end_date",
        cell: (info) => (
          <span className="text-[13px] text-slate-600">
            {new Date(info.getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Due Date",
        accessorKey: "due_date",
        cell: (info) => (
          <span className="text-[13px] text-slate-600">
            {new Date(info.getValue<string>()).toLocaleDateString()}
          </span>
        ),
      },
      {
        header: "Subtotal",
        accessorKey: "subtotal",
        cell: (info) => {
          const value = Number.parseFloat(info.getValue<string | number>() as string)
          if (isNaN(value)) return <span className="text-slate-400">N/A</span>
          return (
            /* ── MONETARY: muted PKR prefix + tabular-nums ── */
            <span className="text-[13px] font-medium text-slate-900 tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {value.toFixed(2)}
            </span>
          )
        },
      },
      {
        header: "Discount %",
        accessorKey: "discount_percentage",
        cell: (info) => {
          const value = Number.parseFloat(info.getValue<string | number>() as string)
          if (isNaN(value)) return <span className="text-slate-400">N/A</span>
          return <span className="text-[13px] text-slate-600 tabular-nums">{value.toFixed(2)}%</span>
        },
      },
      {
        header: "Total Amount",
        accessorKey: "total_amount",
        cell: (info) => {
          const value = Number.parseFloat(info.getValue<string | number>() as string)
          if (isNaN(value)) return <span className="text-slate-400">N/A</span>
          return (
            <span className="text-[13px] font-medium text-slate-900 tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {value.toFixed(2)}
            </span>
          )
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
          const status = info.getValue<string>()
          const invoice = info.row.original
          const isPending = status === "pending"
          return (
            /* ── STATUS BADGE: flat semantic pair, no gradient, no animate-pulse ── */
            <button
              onClick={isPending ? () => handlePendingClick(invoice) : undefined}
              disabled={!isPending}
              className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-[0.06em] transition-colors duration-150 ${getStatusStyle(status)} ${
                isPending ? "cursor-pointer hover:opacity-80" : "cursor-default"
              }`}
              title={isPending ? "Click to add payment" : status}
            >
              {status}
            </button>
          )
        },
      },
    ],
    [],
  )

  /* ── PAYMENT MODAL FOOTER ── */
  const paymentModalFooter = (
    <>
      <button type="button" onClick={handlePaymentCancel}
        className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150">
        Cancel
      </button>
      <button type="submit" form="payment-modal-form" disabled={isPaymentLoading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
        {isPaymentLoading ? "Processing..." : <><Plus className="w-4 h-4" /> Add Payment</>}
      </button>
    </>
  )

  return (
    <>
      <CRUDPage<Invoice>
        title="Invoice"
        endpoint="invoices"
        columns={columns}
        FormComponent={InvoiceForm}
        customHeaderButton={
          /* ── GENERATE MONTHLY INVOICES: emerald primary ── */
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[13px] font-medium rounded-md hover:bg-emerald-700 transition-colors duration-150"
          >
            <FileText className="w-4 h-4" />
            Generate Monthly Invoices
          </button>
        }
        refreshTrigger={refreshTrigger}
      />

      <BulkInvoiceModal
        isVisible={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={handleBulkSuccess}
      />

      {/* ── ADD PAYMENT MODAL ── */}
      <Modal
        isVisible={showPaymentModal}
        onClose={handlePaymentCancel}
        title="Add Payment"
        isLoading={isPaymentLoading}
        footer={paymentModalFooter}
      >
        <form id="payment-modal-form" onSubmit={handlePaymentSubmit}>
          <PaymentForm
            formData={paymentFormData}
            handleInputChange={handlePaymentInputChange}
            isEditing={false}
          />
        </form>
      </Modal>
    </>
  )
}

export default InvoiceManagement