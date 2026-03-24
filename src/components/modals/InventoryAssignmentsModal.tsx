"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal } from "../modal.tsx"
import axiosInstance from "../../utils/axiosConfig.ts"
import { getToken } from "../../utils/auth.ts"
import { toast } from "react-toastify"

interface InventoryAssignment {
  id: string
  inventory_item_id: string
  inventory_item_type: string
  assigned_to_customer: string | null
  assigned_to_employee: string | null
  assigned_at: string
  returned_at: string | null
  status: string
}

interface InventoryAssignmentsModalProps {
  isVisible: boolean
  onClose: () => void
  inventoryItemId: string
}

export const InventoryAssignmentsModal: React.FC<InventoryAssignmentsModalProps> = ({
  isVisible,
  onClose,
  inventoryItemId,
}) => {
  const [assignments, setAssignments] = useState<InventoryAssignment[]>([])
  const [newAssignment, setNewAssignment] = useState({
    assigned_to_customer_id: "",
    assigned_to_employee_id: "",
  })
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (isVisible) {
      fetchAssignments()
      fetchCustomers()
      fetchEmployees()
    }
  }, [isVisible])

  const fetchAssignments = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get(
        `/inventory/assignments?inventory_item_id=${inventoryItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setAssignments(response.data)
    } catch (error) {
      console.error("Failed to fetch inventory assignments", error)
      toast.error("Failed to fetch inventory assignments")
    }
  }

  const fetchCustomers = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get("/customers/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCustomers(
        response.data.map((customer: any) => ({
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
        })),
      )
    } catch (error) {
      console.error("Failed to fetch customers", error)
      toast.error("Failed to fetch customers")
    }
  }

  const fetchEmployees = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get("/employees/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmployees(
        response.data.map((employee: any) => ({
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
        })),
      )
    } catch (error) {
      console.error("Failed to fetch employees", error)
      toast.error("Failed to fetch employees")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewAssignment((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = getToken()
      const assignmentData = {
        inventory_item_id: inventoryItemId,
        assigned_to_customer_id: newAssignment.assigned_to_customer_id || null,
        assigned_to_employee_id: newAssignment.assigned_to_employee_id || null,
      }
      await axiosInstance.post(
        "/inventory/assignments/add",
        assignmentData,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Assignment added successfully")
      fetchAssignments()
      setNewAssignment({ assigned_to_customer_id: "", assigned_to_employee_id: "" })
    } catch (error) {
      console.error("Failed to add inventory assignment", error)
      toast.error("Failed to add inventory assignment")
    }
  }

  const handleReturn = async (assignmentId: string) => {
    try {
      const token = getToken()
      await axiosInstance.put(
        `/inventory/assignments/return/${assignmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      toast.success("Item returned successfully")
      fetchAssignments()
    } catch (error) {
      console.error("Failed to return inventory item", error)
      toast.error("Failed to return inventory item")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "returned":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200"
    }
  }

  const footer = (
    <button
      type="button"
      onClick={onClose}
      className="h-9 px-4 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
    >
      Done
    </button>
  )

  return (
    <Modal isVisible={isVisible} onClose={onClose} title="Inventory Assignments" footer={footer}>
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-[10px] p-4">
        <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Add New Assignment</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Assign to Customer</label>
            <select
              name="assigned_to_customer_id"
              value={newAssignment.assigned_to_customer_id}
              onChange={handleInputChange}
              className="w-full h-9 px-3 rounded-md border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Assign to Employee</label>
            <select
              name="assigned_to_employee_id"
              value={newAssignment.assigned_to_employee_id}
              onChange={handleInputChange}
              className="w-full h-9 px-3 rounded-md border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex justify-center h-9 px-4 text-[13px] font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150"
          >
            Add Assignment
          </button>
        </form>
      </div>
      <div>
        <h3 className="text-[13px] font-medium mb-3 text-slate-900">Assignment History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Assigned To
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Assigned At
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Returned At
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-700">
                    {assignment.assigned_to_customer || assignment.assigned_to_employee}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-600 tabular-nums">
                    {new Date(assignment.assigned_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-600 tabular-nums">
                    {assignment.returned_at ? new Date(assignment.returned_at).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded border ${getStatusColor(
                        assignment.status,
                      )}`}
                    >
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[13px]">
                    {assignment.status === "assigned" && (
                      <button
                        onClick={() => handleReturn(assignment.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-slate-400">
                    No assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}
