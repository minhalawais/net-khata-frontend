"use client"

import { toast } from "../../utils/toast.ts"
import type React from "react"
import { useState, useEffect } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  X,
  Filter,
  FileText,
  MessageSquare,
  ImageIcon,   // Fix: was `Image` — renamed to `ImageIcon` in lucide-react v0.383+
} from "lucide-react"
import HorizontalLogo from "../../assets/net_khata_horizontal.png"

interface Task {
  id: string
  task_type: string
  priority: string
  status: string
  due_date: string | null
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
  in_progress: { color: "text-blue-700", bg: "bg-blue-50 border border-blue-200", icon: ClipboardList },
  completed: { color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-200", icon: CheckCircle },
  cancelled: { color: "text-slate-700", bg: "bg-slate-100 border border-slate-200", icon: X },
}

const priorityConfig: Record<string, { border: string; badge: string }> = {
  low: { border: "border-l-slate-300", badge: "bg-slate-100 text-slate-700 border border-slate-200" },
  medium: { border: "border-l-blue-400", badge: "bg-blue-50 text-blue-700 border border-blue-200" },
  high: { border: "border-l-orange-400", badge: "bg-orange-50 text-orange-700 border border-orange-200" },
  critical: { border: "border-l-rose-500", badge: "bg-rose-50 text-rose-700 border border-rose-200" },
}

const taskTypeLabels: Record<string, string> = {
  installation: "Installation",
  maintenance: "Maintenance",
  complaint: "Complaint",
  recovery: "Recovery",
  inspection: "Inspection",
}

export function PortalTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [updating, setUpdating] = useState(false)
  const [completionForm, setCompletionForm] = useState({
    status: "",
    completion_notes: "",
    completion_proof: "",
  })

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const params = filter !== "all" ? `?status=${filter}` : ""
      const response = await axiosInstance.get(`/employee-portal/tasks${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(response.data)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedTask || !completionForm.status) return
    setUpdating(true)
    try {
      const token = getToken()
      await axiosInstance.put(
        `/employee-portal/tasks/${selectedTask.id}/status`,
        {
          status: completionForm.status,
          completion_notes: completionForm.completion_notes || null,
          completion_proof: completionForm.completion_proof || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success("Task updated successfully!")
      setSelectedTask(null)
      fetchTasks()
      window.dispatchEvent(new Event("refresh-portal-stats"))
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update task")
    } finally {
      setUpdating(false)
    }
  }

  const openTaskModal = (task: Task) => {
    setSelectedTask(task)
    setCompletionForm({
      status: task.status,
      completion_notes: task.completion_notes || "",
      completion_proof: task.completion_proof || "",
    })
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-[10px] animate-pulse" />
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
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">Task Manager</h1>
            <p className="text-[12px] text-slate-500 mt-1.5">Organize, track, and complete your assigned tasks</p>
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
            className={`px-4 py-2 rounded-[6px] text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${filter === status
                ? "bg-white text-blue-600 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 border border-transparent"
              }`}
          >
            {status === "all"
              ? "All Tasks"
              : status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                {tasks.filter((t) => t.status === "pending").length}
              </p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mt-1.5">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50/80 rounded-[10px] text-blue-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                {tasks.filter((t) => t.status === "in_progress").length}
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
                {tasks.filter((t) => t.status === "completed").length}
              </p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mt-1.5">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200/60 rounded-[12px] p-5 shadow-[0_2px_8px_-4px_rgba(244,63,94,0.15)] group relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white rounded-[10px] text-rose-600 shadow-sm transition-transform group-hover:scale-110 duration-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[26px] font-bold text-rose-700 tracking-tight leading-none">
                {tasks.filter((t) => isOverdue(t.due_date) && t.status !== "completed").length}
              </p>
              <p className="text-[11px] font-bold text-rose-600/90 uppercase tracking-[0.06em] mt-1.5">
                Overdue Tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[10px] border border-slate-200">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const status = statusConfig[task.status] || statusConfig.pending
            const priority = priorityConfig[task.priority] || priorityConfig.medium
            const StatusIcon = status.icon
            const overdue = isOverdue(task.due_date) && task.status !== "completed"

            return (
              <div
                key={task.id}
                onClick={() => openTaskModal(task)}
                className={`group bg-white rounded-[10px] border border-slate-200/80 border-l-4 ${priority.border} p-5 cursor-pointer hover:shadow-md hover:border-r-slate-300 hover:border-y-slate-300 transition-all duration-200 relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-0.5 mb-0.5" />
                      {task.status.replace("_", " ")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${priority.badge}`}>
                      {task.priority}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>

                <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight mb-3">
                  {taskTypeLabels[task.task_type] || task.task_type}
                </h3>

                {task.customer_name && (
                  <div className="flex items-center gap-2 text-[13px] text-slate-700 font-medium mb-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{task.customer_name}</span>
                    {task.customer_internet_id && (
                      <span className="text-[11px] text-blue-600 shrink-0">({task.customer_internet_id})</span>
                    )}
                  </div>
                )}

                {task.customer_area && (
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{task.customer_area}</span>
                  </div>
                )}

                {task.due_date && (
                  <div className={`flex items-center gap-2 text-[12px] ${overdue
                      ? "text-rose-600 font-semibold bg-rose-50 border border-rose-100 py-1.5 px-2.5 rounded-md w-fit"
                      : "text-slate-500 font-medium border-t border-slate-100 pt-3 mt-1"
                    }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(task.due_date).toLocaleDateString()}
                      {overdue && " • Overdue"}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">

            {/* Modal Header */}
            <div className={`flex items-center justify-between p-5 border-b ${statusConfig[selectedTask.status]?.bg || "bg-slate-50"} transition-colors duration-300`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border ${statusConfig[selectedTask.status]?.color?.replace("text-", "border-").replace("700", "100")}`}>
                  <ClipboardList className={`w-5 h-5 ${statusConfig[selectedTask.status]?.color}`} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">Task Details</h3>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                    {taskTypeLabels[selectedTask.task_type] || selectedTask.task_type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="h-8 w-8 inline-flex items-center justify-center border border-slate-200/60 rounded-md text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-800 shadow-sm transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-130px)] space-y-4">

              {/* Task Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900">
                    {taskTypeLabels[selectedTask.task_type] || selectedTask.task_type}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${priorityConfig[selectedTask.priority]?.badge}`}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className={`font-medium ${statusConfig[selectedTask.status]?.color}`}>
                      {selectedTask.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className={`font-medium ${isOverdue(selectedTask.due_date) && selectedTask.status !== "completed"
                        ? "text-red-600"
                        : "text-gray-900"
                      }`}>
                      {selectedTask.due_date
                        ? new Date(selectedTask.due_date).toLocaleString()
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium text-gray-900">
                      {selectedTask.created_at
                        ? new Date(selectedTask.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  {selectedTask.completed_at && (
                    <div>
                      <p className="text-gray-500">Completed</p>
                      <p className="font-medium text-green-600">
                        {new Date(selectedTask.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              {selectedTask.customer_name && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{selectedTask.customer_name}</span>
                    </div>
                    {selectedTask.customer_internet_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Internet ID</span>
                        <span className="font-medium text-[#89A8B2]">{selectedTask.customer_internet_id}</span>
                      </div>
                    )}
                    {selectedTask.customer_phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Phone</span>
                        <a
                          href={`tel:${selectedTask.customer_phone}`}
                          className="font-medium text-[#89A8B2] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {selectedTask.customer_phone}
                        </a>
                      </div>
                    )}
                    {selectedTask.customer_area && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area</span>
                        <span className="font-medium">{selectedTask.customer_area}</span>
                      </div>
                    )}
                    {selectedTask.customer_address && (
                      <div>
                        <span className="text-gray-600">Address</span>
                        <p className="font-medium mt-1">{selectedTask.customer_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Task Notes */}
              {selectedTask.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Task Notes
                  </h4>
                  <p className="text-sm text-gray-700">{selectedTask.notes}</p>
                </div>
              )}

              {/* Completion Notes */}
              {selectedTask.completion_notes && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    Completion Notes
                  </h4>
                  <p className="text-sm text-gray-700">{selectedTask.completion_notes}</p>
                </div>
              )}

              {/* Update Form */}
              {selectedTask.status !== "completed" && selectedTask.status !== "cancelled" && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                  <h4 className="font-semibold text-gray-900">Update Task</h4>

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
                          placeholder="Describe what was done..."
                          rows={3}
                          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div>
                        {/* Fix: `Image` was renamed to `ImageIcon` in lucide-react v0.383+ */}
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
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
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-white transition-colors"
              >
                Close
              </button>
              {selectedTask.status !== "completed" && selectedTask.status !== "cancelled" && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Task"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}