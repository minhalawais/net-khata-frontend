"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Users, AlertCircle, ClipboardList } from "lucide-react"
import { SearchableSelect } from "../SearchableSelect.tsx"
import axiosInstance from "../../utils/axiosConfig.ts"
import { getToken } from "../../utils/auth.ts"

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_internet_id: string
  total_amount: number
  due_date: string
  status: string
  billing_start_date: string
  billing_end_date: string
}

interface Employee {
  id: string
  first_name: string
  last_name: string
}

interface RecoveryTaskFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  isEditing: boolean
}

export function RecoveryTaskForm({
  formData,
  handleInputChange,
  isEditing,
}: RecoveryTaskFormProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)

  useEffect(() => {
    fetchInvoices()
    fetchEmployees()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoadingInvoices(true)
      const token = getToken()
      const response = await axiosInstance.get("/invoices/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Filter to show only pending/partially paid invoices for new recovery tasks
      const filteredInvoices = isEditing
        ? response.data
        : response.data.filter((invoice: any) =>
          invoice.status === 'pending' || invoice.status === 'Pending' || 
          invoice.status === 'partially_paid' || invoice.status === 'Partially Paid'
        )

      setInvoices(
        filteredInvoices.map((invoice: any) => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name,
          customer_internet_id: invoice.customer_internet_id || "N/A",
          total_amount: invoice.total_amount,
          due_date: invoice.due_date,
          status: invoice.status,
          billing_end_date: invoice.billing_end_date,
          billing_start_date: invoice.billing_start_date,
        }))
      )
    } catch (error) {
      console.error("Failed to fetch invoices", error)
    } finally {
      setIsLoadingInvoices(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get("/employees/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmployees(response.data)
    } catch (error) {
      console.error("Failed to fetch employees", error)
    }
  }

  const selectClasses = "w-full h-9 pl-9 pr-9 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
  const textareaClasses = "w-full px-3 py-2.5 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 hover:border-slate-300 transition-colors duration-150"
  const labelClasses = "block text-[11px] font-medium text-slate-600 mb-1.5"
  const iconClasses = "h-4 w-4 text-slate-400"

  return (
    <div className="space-y-6">
      {/* Invoice Selection with SearchableSelect */}
      <div className="space-y-2">
        <label className={labelClasses}>Invoice <span className="text-rose-500 ml-0.5">*</span></label>
        {isLoadingInvoices ? (
          <div className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-700">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              <span className="ml-2 text-[12px] text-slate-500">Loading invoices...</span>
            </div>
          </div>
        ) : (
          <SearchableSelect
            options={invoices}
            value={formData.invoice_id || ""}
            onChange={handleInputChange}
            placeholder="Search and select invoice for recovery"
          />
        )}
      </div>

      {/* Employee Assignment */}
      <div className="space-y-2">
        <label className={labelClasses}>Assign To <span className="text-rose-500 ml-0.5">*</span></label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users className={iconClasses} />
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <select
            name="assigned_to"
            value={formData.assigned_to || ""}
            onChange={handleInputChange}
            className={selectClasses}
            required
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className={labelClasses}>Status <span className="text-rose-500 ml-0.5">*</span></label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AlertCircle className={iconClasses} />
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <select
            name="status"
            value={formData.status || "pending"}
            onChange={handleInputChange}
            className={selectClasses}
            required
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className={labelClasses}>Notes</label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <ClipboardList className={iconClasses} />
          </div>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleInputChange}
            placeholder="Enter any relevant notes for the recovery task..."
            rows={4}
            className={`${textareaClasses} pl-9 resize-none min-h-[120px]`}
          />
        </div>
      </div>
    </div>
  )
}

export default RecoveryTaskForm
