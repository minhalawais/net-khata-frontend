"use client"

import type React from "react"
import { X, MessageSquare, AlertTriangle, CheckCircle, Clock, User, Calendar, Paperclip, Star } from "lucide-react"

interface AssignedUser {
  id: string
  name: string
  contact_number: string | null
}

interface ComplaintData {
  id: string
  ticket_number: string
  description: string
  status: string
  created_at: string
  updated_at: string | null
  resolved_at: string | null
  response_due_date: string | null
  assigned_user: AssignedUser | null
  satisfaction_rating: number | null
  resolution_attempts: number
  attachment_path: string | null
  resolution_proof: string | null
  remarks: string | null
  feedback_comments: string | null
}

interface Props {
  complaint: ComplaintData
  onClose: () => void
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  open: { bg: "bg-rose-50", text: "text-rose-700", icon: AlertTriangle },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  resolved: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  closed: { bg: "bg-slate-100", text: "text-slate-600", icon: CheckCircle },
}

export const ComplaintDetailModal: React.FC<Props> = ({ complaint, onClose }) => {
  const status = statusConfig[complaint.status] || statusConfig.open
  const StatusIcon = status.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-[13px] font-medium text-slate-900">Complaint Ticket</h3>
              <p className="text-[11px] text-slate-500 font-mono">#{complaint.ticket_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-0 md:flex">
           {/* Sidebar Info - Left on Desktop, Top on Mobile */}
           <div className="w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-5 space-y-6">
              {/* Status Section */}
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-medium tracking-[0.06em] mb-2">Current Status</p>
                <div className={`flex items-center gap-2 p-3 rounded-md border ${status.bg} ${status.text} border-current/20`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-semibold capitalize">{complaint.status.replace('_', ' ')}</span>
                </div>
              </div>

               {/* Timeline */}
              <div>
                 <p className="text-[11px] text-slate-500 uppercase font-medium tracking-[0.06em] mb-2">Timeline</p>
                 <div className="space-y-3 relative before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200">
                    <div className="relative pl-6">
                        <span className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                        <p className="text-[11px] text-slate-500">Created</p>
                        <p className="text-[12px] font-medium text-slate-900">{new Date(complaint.created_at).toLocaleString()}</p>
                    </div>
                    {complaint.resolved_at && (
                      <div className="relative pl-6">
                         <span className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                         <p className="text-[11px] text-slate-500">Resolved</p>
                         <p className="text-[12px] font-medium text-slate-900">{new Date(complaint.resolved_at).toLocaleString()}</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Assignments */}
              <div>
                 <p className="text-[11px] text-slate-500 uppercase font-medium tracking-[0.06em] mb-2">Assigned To</p>
                 {complaint.assigned_user ? (
                   <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold">
                        {complaint.assigned_user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-slate-900">{complaint.assigned_user.name}</p>
                        <p className="text-[11px] text-slate-500">{complaint.assigned_user.contact_number || 'No contact info'}</p>
                      </div>
                   </div>
                 ) : (
                    <div className="text-[12px] text-slate-500 italic">Unassigned</div>
                 )}
              </div>
           </div>

           {/* Main Content */}
           <div className="w-full md:w-2/3 p-6 space-y-6">
              {/* Description */}
              <div>
                 <h4 className="text-[11px] font-medium text-slate-500 mb-2 uppercase tracking-[0.06em]">Issue Description</h4>
                 <div className="bg-white p-4 rounded-[10px] border border-slate-200 shadow-sm text-[13px] text-slate-700 leading-relaxed">
                   {complaint.description}
                 </div>
              </div>

              {/* Attachments */}
              {complaint.attachment_path && (
                <div>
                   <h4 className="text-[11px] font-medium text-slate-500 mb-2 uppercase tracking-[0.06em] flex items-center gap-2"><Paperclip className="w-4 h-4"/> Attachments</h4>
                   <div 
                     className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md max-w-xs cursor-pointer hover:bg-blue-100 transition-colors"
                     onClick={() => window.open(complaint.attachment_path!, '_blank')}
                   >
                     <div className="w-10 h-10 bg-blue-200 rounded flex items-center justify-center text-blue-700 font-bold text-xs">IMG</div>
                     <div>
                       <p className="text-sm font-medium text-blue-900 truncate">Attachment</p>
                       <p className="text-xs text-blue-600">Click to view</p>
                     </div>
                   </div>
                </div>
              )}

              {/* Resolution Info */}
              {complaint.status === 'resolved' && (
                 <div className="bg-emerald-50 rounded-[10px] p-5 border border-emerald-200">
                   <h4 className="text-[12px] font-medium text-emerald-900 mb-3 flex items-center gap-2">
                     <CheckCircle className="w-5 h-5" /> Resolution Details
                   </h4>
                   <div className="space-y-4">
                      {complaint.remarks && (
                        <div>
                          <p className="text-[11px] text-emerald-700 uppercase font-medium mb-1">Remarks</p>
                          <p className="text-[12px] text-emerald-900">{complaint.remarks}</p>
                        </div>
                      )}
                      {complaint.satisfaction_rating && (
                         <div>
                           <p className="text-[11px] text-emerald-700 uppercase font-medium mb-1">Customer Rating</p>
                            <div className="flex gap-1">
                               {[1,2,3,4,5].map(star => (
                                 <Star key={star} className={`w-4 h-4 ${star <= complaint.satisfaction_rating! ? 'fill-emerald-500 text-emerald-500' : 'text-gray-300'}`} />
                               ))}
                            </div>
                         </div>
                      )}
                      {complaint.resolution_proof && (
                         <div>
                           <p className="text-[11px] text-emerald-700 uppercase font-medium mb-2">Completion Proof</p>
                           <img src={complaint.resolution_proof} alt="Resolution" className="w-32 h-32 object-cover rounded-lg border border-emerald-200" />
                         </div>
                      )}
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="h-9 px-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 text-[12px] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
