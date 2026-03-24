"use client"

import type React from "react"
import { X, Receipt, Calendar, CreditCard, DollarSign } from "lucide-react"

interface LineItem {
  id: string
  item_type: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

interface PaymentSummary {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  status: string
}

interface InvoiceData {
  id: string
  invoice_number: string
  billing_start_date: string
  billing_end_date: string
  due_date: string
  subtotal: number
  discount_percentage: number
  total_amount: number
  total_paid: number
  remaining: number
  invoice_type: string
  status: string
  notes?: string
  line_items: LineItem[]
  payments: PaymentSummary[]
}

interface Props {
  invoice: InvoiceData
  onClose: () => void
}

export const InvoiceDetailModal: React.FC<Props> = ({ invoice, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="text-[13px] font-medium text-slate-900">Invoice Details</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-0 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Status Banner */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-[0.06em] font-medium">Invoice #{invoice.invoice_number}</p>
              <div className="flex gap-2 text-[11px] text-slate-500 mt-1">
                <span>Issued: {new Date(invoice.billing_start_date).toLocaleDateString()}</span>
                <span>•</span>
                <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-[11px] font-medium border capitalize
              ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                invoice.status === 'unpaid' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {invoice.status}
            </div>
          </div>

          {/* Line Items */}
          <div className="p-6">
            <h4 className="text-[11px] font-medium text-slate-500 mb-4 uppercase tracking-[0.06em]">Usage & Charges</h4>
            <div className="border border-slate-200 rounded-[10px] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left">
                    <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">Description</th>
                    <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500 text-right">Qty</th>
                    <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500 text-right">Rate</th>
                    <th className="py-3 px-4 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.line_items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4 text-slate-800">
                        <div className="font-medium text-[13px]">{item.item_type}</div>
                        <div className="text-[11px] text-slate-500">{item.description}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{item.unit_price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">{item.line_total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-100">
                  <tr>
                    <td colSpan={3} className="py-2 px-4 text-right text-slate-600">Subtotal</td>
                    <td className="py-2 px-4 text-right font-medium">{invoice.subtotal.toFixed(2)}</td>
                  </tr>
                  {invoice.discount_percentage > 0 && (
                     <tr>
                      <td colSpan={3} className="py-2 px-4 text-right text-emerald-600">Discount ({invoice.discount_percentage}%)</td>
                      <td className="py-2 px-4 text-right font-medium text-emerald-600">
                        -{((invoice.subtotal * invoice.discount_percentage) / 100).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-200">
                    <td colSpan={3} className="py-3 px-4 text-right font-semibold text-slate-900">Total Due</td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-700 text-[15px]">
                      PKR {invoice.total_amount.toFixed(0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="px-6 pb-6">
              <h4 className="text-[11px] font-medium text-slate-500 mb-3 uppercase tracking-[0.06em]">Payment History</h4>
              <div className="space-y-2">
                {invoice.payments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-emerald-50 rounded-md border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-emerald-900">Payment via {payment.payment_method}</p>
                        <p className="text-[11px] text-emerald-600">{new Date(payment.payment_date).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-700">PKR {payment.amount.toFixed(0)}</span>
                  </div>
                ))}
                
                 {invoice.remaining > 0 && (
                   <div className="flex justify-between items-center p-3 bg-rose-50 rounded-md border border-rose-200 mt-2">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="text-[12px] font-medium text-rose-900">Remaining Balance</span>
                    </div>
                    <span className="font-bold text-red-700">PKR {invoice.remaining.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {invoice.notes && (
             <div className="px-6 pb-6">
                <h4 className="text-[12px] font-medium text-slate-900 mb-2">Notes</h4>
                <p className="text-[13px] text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-200">{invoice.notes}</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 rounded-md border border-slate-200 text-slate-600 hover:bg-white font-medium text-[12px] transition-colors">
            Close
          </button>
           <button className="h-9 px-4 rounded-md bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
             Download PDF
           </button>
        </div>
      </div>
    </div>
  )
}
