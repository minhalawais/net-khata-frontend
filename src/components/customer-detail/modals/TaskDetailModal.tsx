"use client"

import type React from "react"
import { X, ClipboardList, User, Calendar, Flag, Image, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"

interface Assignee {
  id: string
  name: string
  contact_number: string | null
}

interface TaskData {
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
  assignees: Assignee[]
}

interface Props {
  task: TaskData
  onClose: () => void
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  cancelled: { bg: "bg-gray-100", text: "text-gray-600", icon: XCircle },
}

const priorityConfig: Record<string, { bg: string; text: string }> = {
  low: { bg: "bg-gray-100", text: "text-gray-600" },
  medium: { bg: "bg-blue-50", text: "text-blue-700" },
  high: { bg: "bg-orange-50", text: "text-orange-700" },
  critical: { bg: "bg-red-50", text: "text-red-700" },
}

export const TaskDetailModal: React.FC<Props> = ({ task, onClose }) => {
  const status = statusConfig[task.status] || statusConfig.pending
  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const StatusIcon = status.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <h3 className="text-[13px] font-medium text-slate-900">Task Details</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-[15px] font-medium text-slate-900 capitalize">{task.task_type.replace('_', ' ')}</h4>
              <p className="text-[11px] text-slate-500">{task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-[11px] font-medium ${priority.bg} ${priority.text}`}>{task.priority}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${status.bg} ${status.text}`}>
                <StatusIcon className="w-3 h-3" /> {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[12px] text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Due Date</span>
              <span className="font-medium text-[12px] text-slate-900">{task.due_date ? new Date(task.due_date).toLocaleString() : '—'}</span>
            </div>
            {task.completed_at && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-[12px] text-slate-500 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Completed</span>
                <span className="font-medium text-[12px] text-slate-900">{new Date(task.completed_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Assignees */}
          {task.assignees.length > 0 && (
            <div className="mt-4">
              <p className="text-[12px] font-medium text-slate-700 mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Assigned To</p>
              <div className="space-y-2">
                {task.assignees.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-md border border-slate-200">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-700 bg-blue-50 text-[12px] font-medium">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-900">{a.name}</p>
                      {a.contact_number && <p className="text-[11px] text-slate-500">{a.contact_number}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="mt-4">
              <p className="text-[12px] font-medium text-slate-700 mb-2">Notes</p>
              <p className="text-[12px] text-slate-600 p-3 bg-slate-50 rounded-md border border-slate-200">{task.notes}</p>
            </div>
          )}

          {task.completion_notes && (
            <div className="mt-4">
              <p className="text-[12px] font-medium text-slate-700 mb-2">Completion Notes</p>
              <p className="text-[12px] text-slate-700 p-3 bg-emerald-50 rounded-md border border-emerald-200">{task.completion_notes}</p>
            </div>
          )}

          {/* Proof */}
          {task.completion_proof && (
            <div className="mt-4">
              <p className="text-[12px] font-medium text-slate-700 mb-2 flex items-center gap-2"><Image className="w-4 h-4" /> Completion Proof</p>
              <div className="rounded-md overflow-hidden border border-slate-200 h-32">
                <img src={task.completion_proof} alt="Proof" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="w-full h-9 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 text-[12px] transition-colors">Close</button>
        </div>
      </div>
    </div>
  )
}
