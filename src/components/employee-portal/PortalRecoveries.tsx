"use client"

import { toast } from "../../utils/toast.ts"
import type React from "react"
import { useState, useEffect } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  RefreshCw,
  Clock,
  CheckCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  X,
  Filter,
  FileText,
  MessageSquare,
  Image,
  Receipt,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import HorizontalLogo from "../../assets/net_khata_horizontal.png"

interface Recovery {
  id: string
  invoice_id: string
  invoice_number: string | null
  invoice_due_date: string | null
  amount: number
  paid_amount: number
  remaining_amount: number
  status: string
  notes: string | null
  completion_notes: string | null
  completion_proof: string | null
  created_at: string | null
  completed_at: string | null
  customer_id: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  customer_area: string | null
  customer_internet_id: string | null
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pending: { color: "text-amber-700", bg: "bg-amber-50 border border-amber-200", icon: Clock },
  in_progress: { color: "text-blue-700", bg: "bg-blue-50 border border-blue-200", icon: RefreshCw },
  completed: { color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200", icon: CheckCircle },
  cancelled: { color: "text-slate-700", bg: "bg-slate-100 border border-slate-200", icon: X },
}

export function PortalRecoveries() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [selectedRecovery, setSelectedRecovery] = useState<Recovery | null>(null)
  const [updating, setUpdating] = useState(false)
  const [completionForm, setCompletionForm] = useState({
    status: "",
    completion_notes: "",
    completion_proof: "",
  })

  useEffect(() => {
    fetchRecoveries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const fetchRecoveries = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const params = filter !== "all" ? `?status=${filter}` : ""
      const response = await axiosInstance.get(`/employee-portal/recoveries${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRecoveries(response.data)
    } catch (error) {
      console.error("Failed to fetch recoveries:", error)
      toast.error("Failed to load recoveries")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedRecovery || !completionForm.status) return
    setUpdating(true)
    try {
      const token = getToken()
      await axiosInstance.put(
        `/employee-portal/recoveries/${selectedRecovery.id}/status`,
        {
          status: completionForm.status,
          completion_notes: completionForm.completion_notes || null,
          completion_proof: completionForm.completion_proof || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success("Recovery updated successfully!")
      setSelectedRecovery(null)
      fetchRecoveries()
      window.dispatchEvent(new Event("refresh-portal-stats"))
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update recovery")
    } finally {
      setUpdating(false)
    }
  }

  const openRecoveryModal = (recovery: Recovery) => {
    setSelectedRecovery(recovery)
    setCompletionForm({
      status: recovery.status,
      completion_notes: recovery.completion_notes || "",
      completion_proof: recovery.completion_proof || "",
    })
  }

  const totalPending = recoveries.filter((r) => r.status === "pending" || r.status === "in_progress")
    .reduce((sum, r) => sum + r.remaining_amount, 0)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-[10px] animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={HorizontalLogo} alt="Net Khata Logo" className="h-9 w-auto object-contain" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">Financial Recoveries</h1>
            <p className="text-[12px] text-slate-500 mt-1.5">Manage pending collections and overdue invoices</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 p-1.5 bg-slate-100/60 rounded-[10px] w-fit border border-slate-200/60">
        <div className="pl-3 pr-2 border-r border-slate-200/80 py-1.5 flex-shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
        </div>
        {["all", "pending", "in_progress", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-[6px] text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
              filter === status
                ? "bg-white text-blue-600 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 border border-transparent"
            }`}
          >
            {status === "all" ? "All Recoveries" : status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50/80 rounded-[10px] text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                {recoveries.filter((r) => r.status === "pending").length}
              </p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mt-1.5">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50/80 rounded-[10px] text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                {recoveries.filter((r) => r.status === "in_progress").length}
              </p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mt-1.5">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50/80 rounded-[10px] text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                {recoveries.filter((r) => r.status === "completed").length}
              </p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mt-1.5">Completed</p>
            </div>
          </div>
        </div>
        {/* Urgent 'To Recover' Box */}
        <div className="bg-rose-50/80 border border-rose-200/60 rounded-[12px] p-5 shadow-[0_2px_8px_-4px_rgba(244,63,94,0.15)] group relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white rounded-[10px] text-rose-600 shadow-sm transition-transform group-hover:scale-110 duration-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-rose-700 tracking-tight leading-none">
                PKR {totalPending.toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-rose-600/90 uppercase tracking-[0.06em] mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                To Recover
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recoveries Grid */}
      {recoveries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[10px] border border-slate-200">
          <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recovery tasks found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recoveries.map((recovery) => {
            const status = statusConfig[recovery.status] || statusConfig.pending
            const StatusIcon = status.icon
            const isOverdue = recovery.invoice_due_date && new Date(recovery.invoice_due_date) < new Date()

            return (
              <div
                key={recovery.id}
                onClick={() => openRecoveryModal(recovery)}
                className={`group bg-white rounded-[10px] border ${isOverdue && recovery.status !== "completed" ? "border-rose-200" : "border-slate-200/80"} p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-500" />
                      {recovery.invoice_number || "N/A"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-0.5 mb-0.5" />
                      {recovery.status.replace("_", " ")}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* Amount Display */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-[8px] p-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-slate-500 font-medium">Total</span>
                    <span className="text-[13px] font-semibold text-slate-900">PKR {recovery.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-slate-200/60">
                    <span className="text-[12px] text-slate-500 font-medium">Remaining</span>
                    <span className={`text-[13px] font-bold ${recovery.remaining_amount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      PKR {recovery.remaining_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {recovery.customer_name && (
                  <div className="flex items-center gap-2 text-[13px] text-slate-700 font-medium mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{recovery.customer_name}</span>
                    {recovery.customer_internet_id && (
                      <span className="text-[11px] text-blue-600 shrink-0">({recovery.customer_internet_id})</span>
                    )}
                  </div>
                )}

                {recovery.customer_area && (
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{recovery.customer_area}</span>
                  </div>
                )}

                {isOverdue && recovery.status !== "completed" && (
                  <div className="flex items-center gap-2 text-[12px] text-rose-600 font-semibold mt-3 bg-rose-50 border border-rose-100 py-1.5 px-2.5 rounded-md w-fit">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overdue Payment
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-5 border-b ${statusConfig[selectedRecovery.status]?.bg || 'bg-slate-50'} ${statusConfig[selectedRecovery.status]?.color?.replace('text-', 'border-').replace('700', '200') || 'border-slate-100'} transition-colors duration-300`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border ${statusConfig[selectedRecovery.status]?.color?.replace('text-', 'border-').replace('700', '100')}`}>
                  <RefreshCw className={`w-5 h-5 ${statusConfig[selectedRecovery.status]?.color}`} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">Recovery Details</h3>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Invoice #{selectedRecovery.invoice_number}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecovery(null)}
                className="h-8 w-8 inline-flex items-center justify-center border border-slate-200/60 rounded-md text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-800 shadow-sm transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-130px)] space-y-4">
              {/* Invoice Amount Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusConfig[selectedRecovery.status]?.bg} ${statusConfig[selectedRecovery.status]?.color}`}>
                    {selectedRecovery.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">PKR {selectedRecovery.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid</p>
                    <p className="text-lg font-bold text-green-600">PKR {selectedRecovery.paid_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className={`text-lg font-bold ${selectedRecovery.remaining_amount > 0 ? "text-red-600" : "text-green-600"}`}>
                      PKR {selectedRecovery.remaining_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-sm">
                  {selectedRecovery.invoice_due_date && (
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className={`font-medium ${new Date(selectedRecovery.invoice_due_date) < new Date() && selectedRecovery.status !== "completed" ? "text-red-600" : "text-gray-900"}`}>
                        {new Date(selectedRecovery.invoice_due_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Assigned</p>
                    <p className="font-medium text-gray-900">
                      {selectedRecovery.created_at ? new Date(selectedRecovery.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  {selectedRecovery.completed_at && (
                    <div>
                      <p className="text-gray-500">Completed</p>
                      <p className="font-medium text-green-600">
                        {new Date(selectedRecovery.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              {selectedRecovery.customer_name && (
                <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{selectedRecovery.customer_name}</span>
                    </div>
                    {selectedRecovery.customer_internet_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Internet ID</span>
                        <span className="font-medium text-blue-600">{selectedRecovery.customer_internet_id}</span>
                      </div>
                    )}
                    {selectedRecovery.customer_phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phone</span>
                        <a href={`tel:${selectedRecovery.customer_phone}`} className="font-medium text-blue-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedRecovery.customer_phone}
                        </a>
                      </div>
                    )}
                    {selectedRecovery.customer_area && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area</span>
                        <span className="font-medium">{selectedRecovery.customer_area}</span>
                      </div>
                    )}
                    {selectedRecovery.customer_address && (
                      <div>
                        <span className="text-gray-600">Address</span>
                        <p className="font-medium mt-1">{selectedRecovery.customer_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRecovery.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700">{selectedRecovery.notes}</p>
                </div>
              )}

              {/* Completion Notes (if completed) */}
              {selectedRecovery.completion_notes && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    Completion Notes
                  </h4>
                  <p className="text-sm text-gray-700">{selectedRecovery.completion_notes}</p>
                </div>
              )}

              {/* Update Form (if not completed) */}
              {selectedRecovery.status !== "completed" && selectedRecovery.status !== "cancelled" && (
                <div className="bg-white border border-slate-200 rounded-[10px] p-4 space-y-4">
                  <h4 className="font-semibold text-gray-900">Update Recovery</h4>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={completionForm.status}
                      onChange={(e) => setCompletionForm({ ...completionForm, status: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {completionForm.status === "completed" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Completion Notes
                        </label>
                        <textarea
                          value={completionForm.completion_notes}
                          onChange={(e) => setCompletionForm({ ...completionForm, completion_notes: e.target.value })}
                          placeholder="Describe how the recovery was completed..."
                          rows={3}
                          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Proof URL (optional)
                        </label>
                        <input
                          type="text"
                          value={completionForm.completion_proof}
                          onChange={(e) => setCompletionForm({ ...completionForm, completion_proof: e.target.value })}
                          placeholder="https://..."
                          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedRecovery(null)}
                className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-white transition-colors"
              >
                Close
              </button>
              {selectedRecovery.status !== "completed" && selectedRecovery.status !== "cancelled" && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Recovery"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
