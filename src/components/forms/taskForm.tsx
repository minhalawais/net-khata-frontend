"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar, AlertCircle, Tag, Clock, Users } from "lucide-react"
import axiosInstance from "../../utils/axiosConfig.ts"
import { getToken } from "../../utils/auth.ts"
import { SearchableCustomerSelect } from "../SearchableCustomerSelect.tsx"

interface Employee {
  id: string
  first_name: string
  last_name: string
}

interface Customer {
  id: string
  name: string
  internetId: string
}

interface TaskFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  isEditing: boolean
}

export function TaskForm({ formData, handleInputChange, isEditing }: TaskFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken()
      
      // Fetch employees
      try {
        const response = await axiosInstance.get('/employees/list', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setEmployees(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Failed to fetch employees', error)
      }

      // Fetch customers
      try {
        setIsLoadingCustomers(true)
        const response = await axiosInstance.get('/customers/list', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCustomers(
          response.data.map((customer: any) => ({
            id: customer.id,
            name: `${customer.first_name} ${customer.last_name}`,
            internetId: customer.internet_id,
          }))
        )
      } catch (error) {
        console.error('Failed to fetch customers', error)
      } finally {
        setIsLoadingCustomers(false)
      }
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    // Initialize selected employees from formData
    if (formData.assigned_to) {
      const assignedTo = Array.isArray(formData.assigned_to) 
        ? formData.assigned_to 
        : [formData.assigned_to].filter(Boolean)
      setSelectedEmployees(assignedTo)
    }
  }, [formData.assigned_to])

  const handleCustomerSelect = (customerId: string) => {
    handleInputChange({
      target: {
        name: "customer_id",
        value: customerId,
      },
    } as React.ChangeEvent<HTMLSelectElement>)
  }

  const handleEmployeeToggle = (employeeId: string) => {
    const newSelection = selectedEmployees.includes(employeeId)
      ? selectedEmployees.filter(id => id !== employeeId)
      : [...selectedEmployees, employeeId]
    
    setSelectedEmployees(newSelection)
    
    // Trigger form data update
    const syntheticEvent = {
      target: { name: 'assigned_to', value: newSelection }
    } as unknown as React.ChangeEvent<HTMLInputElement>
    handleInputChange(syntheticEvent)
  }

  const inputClasses = "w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
  const iconInputClasses = "w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
  const selectClasses = "w-full h-9 pl-9 pr-9 rounded-md border border-slate-200 bg-white text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 appearance-none"
  const labelClasses = "block text-[11px] font-medium text-slate-600 mb-1.5"
  const iconClasses = "h-4 w-4 text-slate-400"

  return (
    <div className="space-y-6">
      {/* Task Type */}
      <div>
        <label className={labelClasses}>Task Type <span className="text-rose-500 ml-0.5">*</span></label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className={iconClasses} />
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <select
            name="task_type"
            value={formData.task_type || ""}
            onChange={handleInputChange}
            required
            className={selectClasses}
          >
            <option value="">Select Type</option>
            <option value="installation">Installation</option>
            <option value="maintenance">Maintenance</option>
            <option value="complaint">Complaint</option>
            <option value="recovery">Recovery</option>
          </select>
        </div>
      </div>

      {/* Customer Search (Optional) */}
      <div>
        <label className={labelClasses}>Customer (Optional)</label>
        {isLoadingCustomers ? (
          <div className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-slate-700">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-2 text-[12px] text-slate-500">Loading customers...</span>
            </div>
          </div>
        ) : (
          <SearchableCustomerSelect
            customers={customers}
            value={formData.customer_id || ""}
            onChange={(e) => handleInputChange(e)}
            onCustomerSelect={handleCustomerSelect}
            placeholder="Search and select customer (optional)"
          />
        )}
      </div>

      {/* Priority and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Priority <span className="text-rose-500 ml-0.5">*</span></label>
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
              name="priority"
              value={formData.priority || "medium"}
              onChange={handleInputChange}
              required
              className={selectClasses}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Due Date & Time <span className="text-rose-500 ml-0.5">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className={iconClasses} />
            </div>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date ? formData.due_date.slice(0, 16) : ""}
              onChange={handleInputChange}
              required
              className={iconInputClasses}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className={labelClasses}>Status <span className="text-rose-500 ml-0.5">*</span></label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Clock className={iconClasses} />
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
            required
            className={selectClasses}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Assign To (Multiple Employees) */}
      <div>
        <label className={labelClasses}>Assign To (Select Multiple) <span className="text-rose-500 ml-0.5">*</span></label>
        <div className="border border-slate-200 rounded-md p-3 bg-white max-h-52 overflow-y-auto">
          {employees.length === 0 ? (
            <p className="text-[12px] text-slate-500">Loading employees...</p>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <label
                  key={employee.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border transition-colors duration-150 ${
                    selectedEmployees.includes(employee.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-transparent hover:bg-blue-50/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => handleEmployeeToggle(employee.id)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/[0.12]"
                  />
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-[13px] text-slate-700">
                    {employee.first_name} {employee.last_name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedEmployees.length > 0 && (
          <p className="text-[11px] text-slate-400 mt-1.5">
            {selectedEmployees.length} employee(s) selected
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className={labelClasses}>Notes</label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleInputChange}
          placeholder="Enter any additional notes..."
          rows={4}
          className="w-full px-3 py-2.5 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-md placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none"
        />
      </div>
    </div>
  )
}

export default TaskForm
