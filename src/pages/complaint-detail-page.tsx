"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getToken } from "../utils/auth.ts"
import axiosInstance from "../utils/axiosConfig.ts"
import { Sidebar } from "../components/sideNavbar.tsx"
import { Topbar } from "../components/topNavbar.tsx"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Phone,
  Star,
  User,
  ArrowLeft,
  Paperclip,
  Tag,
  Edit,
  Save,
  X,
} from "lucide-react"
import { toast } from "react-toastify"

interface Complaint {
  id: string
  customer_id: string
  customer_name: string
  internet_id: string
  phone_number: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  assigned_to: string | null
  assigned_to_name: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  response_due_date: string | null
  satisfaction_rating: number | null
  resolution_attempts: number
  attachment_path: string | null
  feedback_comments: string | null
  is_active: boolean
  resolution_proof: string | null
  ticket_number: string
  remarks: string | null
}

const ComplaintDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isEditingRemarks, setIsEditingRemarks] = useState(false)
  const [remarks, setRemarks] = useState<string>("")
  const [isSavingRemarks, setIsSavingRemarks] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  useEffect(() => {
    document.title = "Complaint Details"
    const fetchComplaintData = async () => {
      try {
        setLoading(true)
        const token = getToken()
        const response = await axiosInstance.get(`/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setComplaint(response.data)
        setRemarks(response.data.remarks || "")
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch complaint data", error)
        setError("Failed to load complaint details. Please try again later.")
        setLoading(false)
      }
    }

    if (id) {
      fetchComplaintData()
    }
  }, [id])

  useEffect(() => {
    // Focus the textarea when editing mode is enabled
    if (isEditingRemarks && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditingRemarks])

  const handleDownloadAttachment = () => {
    if (complaint?.attachment_path) {
      const token = getToken()
      fetch(`/complaints/attachment/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.style.display = "none"
          a.href = url
          a.download = `complaint_attachment_${complaint.ticket_number}`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => console.error("Error:", error))
    }
  }

  const handleEditRemarks = () => {
    setIsEditingRemarks(true)
  }

  const handleCancelEditRemarks = () => {
    setRemarks(complaint?.remarks || "")
    setIsEditingRemarks(false)
  }

  const handleSaveRemarks = async () => {
    if (!id) return

    try {
      setIsSavingRemarks(true)
      const token = getToken()
      await axiosInstance.put(
        `/complaints/update-remarks/${id}`,
        { remarks },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      // Update the local complaint object with the new remarks
      if (complaint) {
        setComplaint({
          ...complaint,
          remarks,
        })
      }

      setIsEditingRemarks(false)
      toast.success("Remarks updated successfully", {
        style: { background: "#ECFDF3", color: "#047857" },
      })
    } catch (error) {
      console.error("Failed to update remarks", error)
      toast.error("Failed to update remarks", {
        style: { background: "#FFF1F2", color: "#E11D48" },
      })
    } finally {
      setIsSavingRemarks(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "closed":
        return "bg-slate-100 text-slate-600 border-slate-200"
      default:
        return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-[10px] p-6 flex flex-col items-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
          <p className="text-[13px] font-medium text-slate-600">Loading complaint details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md rounded-[10px] bg-white border border-slate-200 p-8">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-14 w-14 text-rose-500" />
          </div>
          <h2 className="mb-3 text-center text-[15px] font-medium text-slate-900">Error</h2>
          <p className="text-center text-[13px] text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/complaints")}
              className="h-9 px-4 rounded-md bg-blue-600 text-white text-[13px] font-medium transition-colors duration-150 hover:bg-blue-700"
            >
              Back to Complaints
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md rounded-[10px] bg-white border border-slate-200 p-8">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-14 w-14 text-amber-500" />
          </div>
          <h2 className="mb-3 text-center text-[15px] font-medium text-slate-900">Complaint Not Found</h2>
          <p className="text-center text-[13px] text-slate-500">
            The complaint you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/complaints")}
              className="h-9 px-4 rounded-md bg-blue-600 text-white text-[13px] font-medium transition-colors duration-150 hover:bg-blue-700"
            >
              Back to Complaints
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-0 sm:p-6 pt-20 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0 lg:ml-20"
          }`}
        >
          <div className="max-w-[1400px] mx-auto space-y-4">
            {/* Header with back button */}
            <div className="bg-white rounded-[10px] border border-slate-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/complaints")}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-colors duration-150"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <div>
                  <h1 className="text-[15px] font-medium text-slate-900">Complaint Details</h1>
                  <p className="text-[11px] text-slate-400 mt-0.5">Detailed view and resolution context</p>
                </div>
              </div>
            </div>

            {/* Ticket info card */}
            <div className="overflow-hidden rounded-[10px] bg-white border border-slate-200">
              <div className="p-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Tag className="h-4 w-4 text-blue-600" />
                    </span>
                    <h2 className="text-[13px] font-medium text-slate-900">Ticket #{complaint.ticket_number}</h2>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium border ${getStatusColor(
                        complaint.status,
                      )}`}
                    >
                      {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Customer Information</h3>
                    <div className="rounded-[10px] bg-slate-50 border border-slate-200 p-4">
                      <div className="mb-3 flex items-start space-x-3">
                        <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Name</p>
                          <p className="text-[13px] text-slate-700">{complaint.customer_name}</p>
                        </div>
                      </div>
                      <div className="mb-3 flex items-start space-x-3">
                        <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Internet ID</p>
                          <p className="text-[13px] text-slate-700">{complaint.internet_id}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Phone Number</p>
                          <p className="text-[13px] text-slate-700">{complaint.phone_number}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Assignment Information</h3>
                    <div className="rounded-[10px] bg-slate-50 border border-slate-200 p-4">
                      <div className="mb-3 flex items-start space-x-3">
                        <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Assigned To</p>
                          <p className="text-[13px] text-slate-700">{complaint.assigned_to_name || "Unassigned"}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Resolution Attempts</p>
                          <p className="text-[13px] text-slate-700 tabular-nums">{complaint.resolution_attempts}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Dates</h3>
                    <div className="rounded-[10px] bg-slate-50 border border-slate-200 p-4">
                      <div className="mb-3 flex items-start space-x-3">
                        <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Created At</p>
                          <p className="text-[13px] text-slate-700 tabular-nums">{new Date(complaint.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mb-3 flex items-start space-x-3">
                        <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Updated At</p>
                          <p className="text-[13px] text-slate-700 tabular-nums">{new Date(complaint.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mb-3 flex items-start space-x-3">
                        <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Response Due Date</p>
                          <p className="text-[13px] text-slate-700 tabular-nums">
                            {complaint.response_due_date
                              ? new Date(complaint.response_due_date).toLocaleString()
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Resolved At</p>
                          <p className="text-[13px] text-slate-700 tabular-nums">
                            {complaint.resolved_at
                              ? new Date(complaint.resolved_at).toLocaleString()
                              : "Not resolved yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Feedback</h3>
                    <div className="rounded-[10px] bg-slate-50 border border-slate-200 p-4">
                      <div className="mb-3 flex items-start space-x-3">
                        <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Satisfaction Rating</p>
                          <div className="flex items-center">
                            {complaint.satisfaction_rating ? (
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < complaint.satisfaction_rating!
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 text-[11px] text-slate-400 tabular-nums">({complaint.satisfaction_rating}/5)</span>
                              </div>
                            ) : (
                              <span className="text-[13px] text-slate-500">Not rated yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Feedback Comments</p>
                          <p className="text-[13px] text-slate-700">{complaint.feedback_comments || "No feedback provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description and remarks */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-[10px] bg-white border border-slate-200">
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-[13px] font-medium text-slate-900">Description</h3>
                </div>
                <div className="p-6">
                  <p className="whitespace-pre-wrap text-[13px] text-slate-700">{complaint.description}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[10px] bg-white border border-slate-200">
                <div className="border-b border-slate-100 bg-slate-50 p-4 flex justify-between items-center">
                  <h3 className="text-[13px] font-medium text-slate-900">Remarks</h3>
                  {!isEditingRemarks ? (
                    <button
                      onClick={handleEditRemarks}
                      className="h-8 px-3 inline-flex items-center rounded-md text-[12px] font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      {remarks ? "Edit" : "Add"} Remarks
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelEditRemarks}
                        className="h-8 px-3 inline-flex items-center rounded-md text-[12px] font-medium border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white transition-colors duration-150"
                        disabled={isSavingRemarks}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRemarks}
                        className="h-8 px-3 inline-flex items-center rounded-md text-[12px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
                        disabled={isSavingRemarks}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        {isSavingRemarks ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {isEditingRemarks ? (
                    <textarea
                      ref={textareaRef}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full min-h-[120px] p-3 border border-slate-200 rounded-md text-[13px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150 resize-none"
                      placeholder="Add your remarks here..."
                      disabled={isSavingRemarks}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-[13px] text-slate-700">{remarks || "No remarks added"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments and resolution proof */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-[10px] bg-white border border-slate-200">
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-[13px] font-medium text-slate-900">Attachment</h3>
                </div>
                <div className="p-6">
                  {complaint.attachment_path ? (
                    <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="h-4 w-4 text-blue-600" />
                        <span className="text-[13px] text-slate-700">Complaint Attachment</span>
                      </div>
                      <button
                        onClick={handleDownloadAttachment}
                        className="h-8 px-3 rounded-md bg-blue-600 text-white text-[12px] font-medium transition-colors duration-150 hover:bg-blue-700"
                      >
                        Download
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 p-8">
                      <p className="text-[13px] text-slate-500">No attachment available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-[10px] bg-white border border-slate-200">
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-[13px] font-medium text-slate-900">Resolution Proof</h3>
                </div>
                <div className="p-6">
                  {complaint.resolution_proof ? (
                    <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-[13px] text-slate-700">Resolution Document</span>
                      </div>
                      <button
                        onClick={() => {
                          const token = getToken()
                          fetch(`/complaints/resolution-proof/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          })
                            .then((response) => response.blob())
                            .then((blob) => {
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement("a")
                              a.style.display = "none"
                              a.href = url
                              a.download = `resolution_proof_${complaint.ticket_number}`
                              document.body.appendChild(a)
                              a.click()
                              window.URL.revokeObjectURL(url)
                            })
                            .catch((error) => console.error("Error:", error))
                        }}
                        className="h-8 px-3 rounded-md bg-blue-600 text-white text-[12px] font-medium transition-colors duration-150 hover:bg-blue-700"
                      >
                        Download
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 p-8">
                      <p className="text-[13px] text-slate-500">No resolution proof available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-end">
              <button
                onClick={() => navigate("/complaints")}
                className="h-9 px-4 rounded-md border border-slate-200 bg-white text-slate-600 text-[13px] font-medium transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
              >
                Back to List
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ComplaintDetailPage

