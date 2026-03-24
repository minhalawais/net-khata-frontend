"use client"

import type React from "react"
import { X, Receipt, Hash, CreditCard, Building2, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface BankAccount {
  id: string
  bank_name: string
  account_title: string
  account_number: string
  iban: string
  branch_code: string
}

interface PaymentData {
  id: string
  invoice_id: string
  invoice_number?: string
  amount: number
  payment_date: string
  payment_method: string
  status: string
  transaction_id?: string
  bank_account?: BankAccount
  failure_reason?: string
  payment_proof?: string
}

interface Props {
  payment: PaymentData
  onClose: () => void
}

export const PaymentDetailModal: React.FC<Props> = ({ payment, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="text-[13px] font-medium text-slate-900">Payment Receipt</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Amount Hero */}
          <div className="text-center mb-8">
            <p className="text-[11px] text-slate-500 uppercase tracking-[0.06em] mb-1">Total Amount Paid</p>
            <h2 className="text-[30px] font-semibold text-slate-900">PKR {payment.amount.toLocaleString()}</h2>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium mt-3 border
              ${payment.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                payment.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {payment.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5" /> : 
               payment.status === 'failed' ? <AlertCircle className="w-3.5 h-3.5" /> : 
               <Clock className="w-3.5 h-3.5" />}
              <span className="capitalize">{payment.status}</span>
            </div>
          </div>

          <div className="space-y-4">
             {/* General Info */}
             <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                 <p className="text-[11px] text-slate-500 mb-1 flex items-center gap-1"><Hash className="w-3 h-3"/> Transaction ID</p>
                 <p className="font-mono text-[12px] font-medium text-slate-900 truncate" title={payment.transaction_id}>{payment.transaction_id || '—'}</p>
               </div>
               <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                 <p className="text-[11px] text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Date & Time</p>
                 <p className="text-[12px] font-medium text-slate-900">{new Date(payment.payment_date).toLocaleString()}</p>
               </div>
             </div>

             {/* Invoice Link */}
             <div className="p-4 rounded-md border border-slate-200 bg-slate-50 flex justify-between items-center">
               <div>
                  <p className="text-[11px] text-slate-500">Applied to Invoice</p>
                  <p className="font-medium text-slate-900 text-[13px]">#{payment.invoice_number}</p>
               </div>
                <button className="text-[12px] font-medium text-blue-600 hover:text-blue-700">View Invoice</button>
             </div>

             {/* Bank Details */}
             {payment.bank_account && (
              <div className="border border-slate-200 rounded-[10px] overflow-hidden mt-6">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-[12px] font-medium text-slate-700">Bank Account Details</span>
                 </div>
                 <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                    <span className="text-[12px] text-slate-500">Bank Name</span>
                    <span className="text-[12px] font-medium text-slate-900">{payment.bank_account.bank_name}</span>
                    </div>
                     <div className="flex justify-between">
                    <span className="text-[12px] text-slate-500">Account Title</span>
                    <span className="text-[12px] font-medium text-slate-900">{payment.bank_account.account_title}</span>
                    </div>
                     <div className="flex justify-between">
                    <span className="text-[12px] text-slate-500">Account Number</span>
                    <span className="text-[12px] font-medium font-mono text-slate-900 tracking-wide">{payment.bank_account.account_number}</span>
                    </div>
                 </div>
               </div>
             )}
             
             {/* Proof Image */}
             {payment.payment_proof && (
               <div className="mt-4">
                 <p className="text-[11px] text-slate-500 mb-2 uppercase tracking-[0.06em] font-medium">Payment Proof</p>
                 <div className="rounded-md border border-slate-200 bg-slate-100 h-40 flex items-center justify-center overflow-hidden group relative cursor-pointer">
                    <img src={payment.payment_proof} alt="Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium">View Full Image</span>
                    </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="w-full h-9 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 text-[12px] transition-colors">
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
