"use client"

import { toast } from "../utils/toast.ts"
import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ComplaintForm } from "../components/forms/complaintForm.tsx"
import { getToken } from "../utils/auth.ts"
import axiosInstance from "../utils/axiosConfig.ts"
import { ArrowLeft, MessageSquare } from "lucide-react"
import HorizontalLogo from "../assets/net_khata_horizontal.png"

const NewComplaintPage: React.FC = () => {
  const [formData, setFormData] = useState({})

  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, attachment: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formDataToSend = new FormData()
    Object.keys(formData).forEach((key) => {
      if (formData[key] != null) {
        if (
          (key === "attachment") &&
          formData[key] instanceof File
        ) {
          formDataToSend.append(key, formData[key], formData[key].name)
        } else {
          formDataToSend.append(key, formData[key])
        }
      }
    })
    try {
      const token = getToken()
      const response = await axiosInstance.post(`/complaints/add`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      toast.success("Complaint added successfully", {
        style: { background: "#D1FAE5", color: "#10B981" },
      })
      navigate(`/complaints/ticket/${response.data.ticket_number}`)
    } catch (error) {
      console.error("Failed to add complaint", error)
      toast.error("Failed to add complaint", {
        style: { background: "#FEE2E2", color: "#EF4444" },
      })
    }
  }

  const handleCustomerSearch = async (searchTerm: string) => {
    try {
      const token = getToken()
      const response = await axiosInstance.get(
        `/complaints/search-customer?search_term=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      return response.data
    } catch (error) {
      console.error("Failed to search customer", error)
      toast.error("Failed to search customer", {
        style: { background: "#FEE2E2", color: "#EF4444" },
      })
      return null
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* App Header & Brand Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={HorizontalLogo} alt="Net Khata Logo" className="h-8 w-auto object-contain" />
          </div>
          <button
            onClick={() => navigate("/complaint-management")}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Complaints</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        {/* Page Title Card */}
        <div className="bg-white border border-slate-200 rounded-[10px] px-6 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50/80 rounded-[10px] flex items-center justify-center border border-blue-100/50">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-[17px] font-semibold text-slate-900 tracking-tight">Add New Complaint</h1>
              <p className="text-[12px] text-slate-500 mt-0.5">Lookup a customer to create and assign a support ticket.</p>
            </div>
          </div>
        </div>

        {/* Main Form Container - Floating glass card aesthetic */}
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <ComplaintForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
            isEditing={false}
            handleCustomerSearch={handleCustomerSearch}
            ticketNumber={null}
          />
        </div>
      </div>
    </main>
  )
}

export default NewComplaintPage
