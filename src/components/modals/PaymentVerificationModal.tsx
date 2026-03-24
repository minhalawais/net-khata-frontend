"use client"

import React, { useState, useEffect } from 'react'
import { X, Check, XCircle, CreditCard, Hash, FileText, AlertCircle, Loader2, Download } from 'lucide-react'
import axiosInstance from '../../utils/axiosConfig.ts'
import { toast } from 'react-toastify'

interface PaymentVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  payment: any
  onVerify: () => void
}

/* ── SHARED STYLE CONSTANTS ── */
const labelClass = "block text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]"

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen, onClose, payment, onVerify,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [imageError, setImageError] = useState(false)

  /* ── FETCH PROOF IMAGE with auth ── */
  useEffect(() => {
    if (isOpen && payment?.payment_proof) {
      setIsLoadingImage(true)
      setImageError(false)
      axiosInstance.get(`/payments/proof-image/${payment.id}`, { responseType: 'blob' })
        .then((response) => { setProofImageUrl(URL.createObjectURL(response.data)) })
        .catch((error) => { console.error('Failed to load payment proof:', error); setImageError(true) })
        .finally(() => setIsLoadingImage(false))
    }
    return () => { if (proofImageUrl) URL.revokeObjectURL(proofImageUrl) }
  }, [isOpen, payment?.id, payment?.payment_proof])

  /* ── ESCAPE + SCROLL LOCK ── */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset' }
  }, [isOpen, onClose])

  if (!isOpen || !payment) return null

  const handleAction = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !showRejectInput) { setShowRejectInput(true); return }
    if (action === 'reject' && !rejectReason.trim()) { toast.error("Please enter a reason for rejection"); return }
    try {
      setIsSubmitting(true)
      await axiosInstance.post(`/payments/verify/${payment.id}`, {
        action, notes: action === 'reject' ? rejectReason : null,
      })
      toast.success(`Payment ${action}ed successfully`)
      onVerify()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} payment`)
    } finally {
      setIsSubmitting(false); setShowRejectInput(false); setRejectReason('')
    }
  }

  const handleDownloadProof = async () => {
    try {
      const response = await axiosInstance.get(`/payments/proof-image/${payment.id}`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url; a.download = `payment-proof-${payment.invoice_number}.jpg`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download payment proof')
    }
  }

  return (
    /* ── BACKDROP: rgba only, no backdrop-blur ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.50)" }}
      onClick={onClose}
    >
      {/* ── PANEL: rounded-xl, border only, no shadow-2xl ── */}
      <div
        className="bg-white rounded-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── HEADER: bg-white border-b, no bg-gray-50, no gradient ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-slate-900">Verify Payment</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Review transaction details and proof</p>
            </div>
          </div>
          {/* ── CLOSE: rounded-md not rounded-full ── */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: Transaction + Payment details */}
            <div className="space-y-4">
              {/* Transaction Details card */}
              <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-3">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Transaction Details</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={labelClass}>Invoice #</span>
                    <span className="text-[13px] font-medium text-slate-900 font-mono">{payment.invoice_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelClass}>Amount</span>
                    {/* ── AMOUNT: prominent but using system scale ── */}
                    <span className="text-[22px] font-semibold text-slate-900 tabular-nums">
                      <span className="text-[13px] text-slate-400 mr-0.5">PKR</span>
                      {payment.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelClass}>Date</span>
                    <span className="text-[13px] text-slate-700">{payment.payment_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={labelClass}>Customer</span>
                    <span className="text-[13px] font-medium text-slate-900">{payment.customer_name}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info card */}
              <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-3">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Payment Info</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={labelClass}>Method</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium uppercase tracking-[0.06em]">
                      {payment.payment_method}
                    </span>
                  </div>
                  {payment.transaction_id && (
                    <div className="flex items-center justify-between">
                      <span className={labelClass}>Transaction ID</span>
                      <span className="text-[13px] font-mono text-slate-700">{payment.transaction_id}</span>
                    </div>
                  )}
                  {payment.bank_account_details && (
                    <div className="flex flex-col gap-0.5">
                      <span className={labelClass}>Bank Account</span>
                      <span className="text-[13px] text-slate-700 text-right">{payment.bank_account_details}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Proof image */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Payment Proof</span>
              </div>
              {/* ── PROOF CONTAINER: border not border-2, no dashed heavy ── */}
              <div className="flex-1 bg-slate-50 rounded-[10px] border border-dashed border-slate-200 flex items-center justify-center overflow-hidden min-h-[280px] relative">
                {payment.payment_proof ? (
                  isLoadingImage ? (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
                      <span className="text-[13px]">Loading proof...</span>
                    </div>
                  ) : imageError ? (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <AlertCircle className="w-7 h-7 opacity-40" />
                      <span className="text-[13px]">Image not available</span>
                    </div>
                  ) : proofImageUrl ? (
                    <>
                      <img
                        src={proofImageUrl} alt="Payment Proof"
                        className="max-w-full max-h-full object-contain"
                      />
                      {/* ── DOWNLOAD OVERLAY: rounded-md not rounded-full ── */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={handleDownloadProof}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/75 text-white text-[12px] font-medium rounded-md hover:bg-slate-900 transition-colors duration-150"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </>
                  ) : null
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <AlertCircle className="w-7 h-7 opacity-40" />
                    <span className="text-[13px]">No proof attached</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rejection reason input */}
          {showRejectInput && (
            <div className="mt-5 space-y-1.5">
              <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
                Rejection Reason <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please explain why this payment is being rejected..."
                rows={3}
                autoFocus
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* ── FOOTER: bg-slate-50 border-t ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200 rounded-b-xl flex-shrink-0">
          {showRejectInput ? (
            <>
              <button
                onClick={() => setShowRejectInput(false)} disabled={isSubmitting}
                className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={!rejectReason.trim() || isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-[13px] font-medium rounded-md hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleAction('reject')} disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-rose-600 border border-rose-200 rounded-md hover:bg-rose-50 transition-colors duration-150"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => handleAction('approve')} disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[13px] font-medium rounded-md hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <Check className="w-4 h-4" /> Approve Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}