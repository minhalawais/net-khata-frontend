"use client"

import type React from "react"
import { useEffect, useState, Fragment, useCallback } from "react"
import { Combobox, Transition } from "@headlessui/react"
import { Search, Check, Paperclip, User, X, Loader2, ChevronDown, MapPin, Phone, Globe } from 'lucide-react'
import axiosInstance from "../../utils/axiosConfig.ts"
import { getToken } from "../../utils/auth.ts"

interface ComplaintFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit?: (e: React.FormEvent) => void
  isEditing: boolean
  handleCustomerSearch?: (searchTerm: string) => Promise<any>
  ticketNumber?: string | null
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  internet_id: string
  phone_1: string
  phone_2: string | null
  installation_address: string
  gps_coordinates: string | null
}

interface Employee {
  id: string
  first_name: string
  last_name: string
}

export function ComplaintForm({
  formData,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  isEditing,
  handleCustomerSearch,
  ticketNumber,
}: ComplaintFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [employeeQuery, setEmployeeQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [customerFound, setCustomerFound] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = getToken()
      try {
        const response = await axiosInstance.get("/employees/list", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setEmployees(response.data)
      } catch (error) {
        console.error("Failed to fetch employees", error)
      }
    }
    fetchEmployees()
  }, [])

  const handleCustomerSearchChange = async (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    setCustomerSearchTerm(numericValue)
    if (numericValue.length >= 3) {
      setIsSearching(true)
      setCustomerFound(null)
      const customer = await handleCustomerSearch(numericValue)
      setIsSearching(false)
      if (customer) {
        setSelectedCustomer(customer)
        setCustomerFound(true)
        handleInputChange({
          target: { name: "customer_id", value: customer.id },
        } as React.ChangeEvent<HTMLInputElement>)
      } else {
        setSelectedCustomer(null)
        setCustomerFound(false)
      }
    } else {
      setSelectedCustomer(null)
      setCustomerFound(null)
    }
  }

  const handleEmployeeChange = (employee: Employee | null) => {
    setSelectedEmployee(employee)
    handleInputChange({
      target: { name: "assigned_to", value: employee?.id || "" },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const memoizedHandleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (handleFileChange) handleFileChange(e)
    },
    [handleFileChange],
  )

  const filteredEmployees =
    employeeQuery === ""
      ? employees
      : employees.filter((employee) => {
          const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase()
          return (
            fullName.includes(employeeQuery.toLowerCase()) ||
            employee.id.toLowerCase().includes(employeeQuery.toLowerCase())
          )
        })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {ticketNumber && (
        <div className="bg-emerald-50 border-l-[3px] border-emerald-500 px-4 py-3 rounded-r-md">
          <p className="text-[13px] font-medium text-emerald-700 flex items-center">
            <Check className="h-4 w-4 mr-2" /> Ticket Number: {ticketNumber}
          </p>
        </div>
      )}

      {/* Search Customer Section */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">
          Search User by Phone # or Internet ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={customerSearchTerm}
            onChange={(e) => handleCustomerSearchChange(e.target.value)}
            placeholder="Enter Phone # or Internet ID..."
            className="w-full h-9 pl-9 pr-9 text-[13px] text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isSearching && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
            {!isSearching && customerFound === true && <Check className="h-4 w-4 text-emerald-600" />}
            {!isSearching && customerFound === false && <X className="h-4 w-4 text-rose-600" />}
          </div>
        </div>
        <p className="text-[11px] text-slate-400">When the user searches, the form below will auto-fill.</p>
      </div>

      {/* Customer Details Display - Premium Grid Design */}
      {selectedCustomer && (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-[10px] p-1 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 rounded-[8px] overflow-hidden">
            {/* User Name */}
            <div className="bg-white p-3.5 flex items-start gap-3 border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">User Name</p>
                <p className="text-[13px] font-semibold text-slate-900 mt-0.5">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
              </div>
            </div>

            {/* Internet ID */}
            <div className="bg-white p-3.5 flex items-start gap-3 border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Internet ID</p>
                <p className="text-[13px] font-medium text-slate-800 mt-0.5">{selectedCustomer.internet_id}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white p-3.5 flex items-start gap-3 border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Phone Number</p>
                <p className="text-[13px] font-medium text-slate-800 mt-0.5">{selectedCustomer.phone_1}</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white p-3.5 flex items-start gap-3 border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">Installation Address</p>
                <p className="text-[13px] font-medium text-slate-800 mt-0.5 truncate max-w-[200px]" title={selectedCustomer.installation_address}>{selectedCustomer.installation_address}</p>
              </div>
            </div>
            
            {/* GPS Coordinates */}
            {selectedCustomer.gps_coordinates && (
              <div className="bg-white p-3.5 flex items-start gap-3 sm:col-span-2 border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">GPS Coordinates</p>
                  <p className="text-[13px] font-medium text-slate-800 mt-0.5">{selectedCustomer.gps_coordinates}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complaint Details */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-[11px] font-medium text-slate-600">
          Complaint Details
        </label>
        <div className="relative">
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            placeholder="Add details here...."
            className="w-full px-3 py-2.5 min-h-[120px] border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none"
            required
          />
        </div>
      </div>

      {/* Attachment Section */}
      <div className="space-y-2">
        <label htmlFor="attachment" className="block text-[11px] font-medium text-slate-600">
          ATTACHMENT (IF ANY)
        </label>
        <div className="group relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 bg-slate-50/50 hover:bg-blue-50/30 transition-all duration-200">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <Paperclip className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-[13px] font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
            <p className="text-[11px] text-slate-500 mb-4">SVG, PNG, JPG or PDF (max. 10MB)</p>
            
            <div className="relative">
              <input
                id="attachment"
                name="attachment"
                type="file"
                onChange={memoizedHandleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".svg,.png,.jpg,.jpeg,.pdf"
              />
              <span className="inline-flex items-center h-8 px-4 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md shadow-sm group-hover:border-blue-300 transition-colors pointer-events-none">
                Select file
              </span>
            </div>
          </div>
        </div>
        {formData.attachment_path && (
          <div className="mt-2">
            <a
              href={`/complaints/attachment/${formData.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150"
            >
              <Paperclip className="mr-2 h-4 w-4" />
              View current attachment
            </a>
          </div>
        )}
      </div>

      {/* Assign To Employee Dropdown */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-slate-600">Assign To</label>
        <p className="text-[11px] text-slate-400 mb-1">Drop Down (Show all employee's name here)</p>
        <Combobox value={selectedEmployee} onChange={handleEmployeeChange}>
          <div className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <Combobox.Input
                className="w-full h-9 pl-9 pr-9 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
                displayValue={(employee: Employee | null) =>
                  employee ? `${employee.first_name} ${employee.last_name}` : ""
                }
                onChange={(event) => setEmployeeQuery(event.target.value)}
                placeholder="Select an employee..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setEmployeeQuery("")}
            >
              <Combobox.Options className="absolute z-10 mt-2 w-full overflow-auto rounded-md bg-white py-2 border border-slate-200 focus:outline-none max-h-60">
                {filteredEmployees?.length === 0 && employeeQuery !== "" ? (
                  <div className="px-4 py-3 text-[12px] text-slate-500 italic">No employees found</div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <Combobox.Option
                      key={employee.id}
                      value={employee}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-3 px-4 ${
                          active ? "bg-blue-50 text-blue-700" : "text-slate-700"
                        }`
                      }
                    >
                      {({ selected, active }) => (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-3">
                              {employee.first_name[0]}
                            </div>
                            <div>
                              <div className="text-[13px] font-medium">
                                {employee.first_name} {employee.last_name}
                              </div>
                            </div>
                          </div>
                          {selected && <Check className={`h-4 w-4 ${active ? "text-blue-700" : "text-slate-700"}`} />}
                        </div>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-5 border-t border-slate-100 mt-6">
        <button
          type="submit"
          className="inline-flex items-center gap-2 h-10 px-6 border border-transparent rounded-[8px] text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Check className="w-4 h-4" />
          {isEditing ? "Update Complaint" : "Create Ticket"}
        </button>
      </div>
    </form>
  )
}
