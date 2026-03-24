import type React from "react"
import { DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface BillingSummaryProps {
  totalPaid: number
  outstandingBalance: number
  averageMonthly: number
  paymentReliability: number
}

export const BillingSummary: React.FC<BillingSummaryProps> = ({
  totalPaid,
  outstandingBalance,
  averageMonthly,
  paymentReliability,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="bg-white rounded-[10px] p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">Total Paid</p>
        <span className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 inline-flex items-center justify-center"><DollarSign className="w-4 h-4" /></span>
      </div>
      <p className="text-[20px] font-semibold text-slate-900">PKR {totalPaid.toFixed(0)}</p>
    </div>

    <div className="bg-white rounded-[10px] p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">Outstanding</p>
        <span className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 inline-flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></span>
      </div>
      <p className="text-[20px] font-semibold text-slate-900">PKR {outstandingBalance.toFixed(0)}</p>
    </div>

    <div className="bg-white rounded-[10px] p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">Avg Monthly</p>
        <span className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 inline-flex items-center justify-center"><Clock className="w-4 h-4" /></span>
      </div>
      <p className="text-[20px] font-semibold text-slate-900">PKR {averageMonthly.toFixed(0)}</p>
    </div>

    <div className="bg-white rounded-[10px] p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">Reliability</p>
        <span className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 inline-flex items-center justify-center"><CheckCircle className="w-4 h-4" /></span>
      </div>
      <p className="text-[20px] font-semibold text-slate-900">{paymentReliability.toFixed(0)}%</p>
    </div>
  </div>
)

export default BillingSummary
