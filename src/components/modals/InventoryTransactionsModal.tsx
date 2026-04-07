"use client"

import { toast } from "../../utils/toast.ts"
import type React from "react"
import { useState, useEffect } from "react"
import { Modal } from "../modal.tsx"
import axiosInstance from "../../utils/axiosConfig.ts"
import { getToken } from "../../utils/auth.ts"
import { Plus, Minus } from "lucide-react"

interface InventoryTransaction {
  id: string
  inventory_item_name: string
  transaction_type: string
  performed_by: string
  performed_at: string
  notes: string
  quantity: number
}

interface InventoryTransactionsModalProps {
  isVisible: boolean
  onClose: () => void
  inventoryItemId: string
}

export const InventoryTransactionsModal: React.FC<InventoryTransactionsModalProps> = ({
  isVisible,
  onClose,
  inventoryItemId,
}) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [newTransaction, setNewTransaction] = useState({
    transaction_type: "",
    notes: "",
    quantity: 1,
  })

  useEffect(() => {
    if (isVisible) {
      fetchTransactions()
    }
  }, [isVisible])

  const fetchTransactions = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get(
        `/inventory/transactions?inventory_item_id=${inventoryItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setTransactions(response.data)
    } catch (error) {
      console.error("Failed to fetch inventory transactions", error)
      toast.error("Failed to fetch inventory transactions")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewTransaction((prev) => ({ ...prev, [name]: name === "quantity" ? Number.parseInt(value) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = getToken()
      await axiosInstance.post(
        "/inventory/transactions/add",
        {
          inventory_item_id: inventoryItemId,
          transaction_type: newTransaction.transaction_type,
          quantity: newTransaction.quantity,
          notes: newTransaction.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Transaction added successfully")
      fetchTransactions()
      setNewTransaction({ transaction_type: "", notes: "", quantity: 1 })
    } catch (error) {
      console.error("Failed to add inventory transaction", error)
      toast.error("Failed to add inventory transaction")
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "add":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "remove":
        return "bg-rose-50 text-rose-600 border-rose-200"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200"
    }
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "add":
        return <Plus className="h-3 w-3" />
      case "remove":
        return <Minus className="h-3 w-3" />
      default:
        return null
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
    <Modal isVisible={isVisible} onClose={onClose} title="Inventory Transactions" footer={footer}>
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-[10px] p-4">
        <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Add New Transaction</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Transaction Type</label>
            <select
              name="transaction_type"
              value={newTransaction.transaction_type}
              onChange={handleInputChange}
              className="w-full h-9 px-3 rounded-md border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
              required
            >
              <option value="">Select type</option>
              <option value="add">
                Add
              </option>
              <option value="remove">
                Remove
              </option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={newTransaction.quantity}
              onChange={handleInputChange}
              className="w-full h-9 px-3 rounded-md border border-slate-200 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Notes</label>
            <textarea
              name="notes"
              value={newTransaction.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 rounded-md border border-slate-200 text-[13px] text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none"
              rows={3}
              placeholder="Enter transaction notes"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center h-9 px-4 text-[13px] font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150"
          >
            Add Transaction
          </button>
        </form>
      </div>
      <div>
        <h3 className="text-[13px] font-medium mb-3 text-slate-900">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Type
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Performed By
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Date
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Quantity
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-100">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 inline-flex items-center text-[10px] font-medium rounded border ${getTransactionTypeColor(
                        transaction.transaction_type,
                      )}`}
                    >
                      {getTransactionTypeIcon(transaction.transaction_type)}
                      <span className="ml-1">{transaction.transaction_type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-700">{transaction.performed_by}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-600 tabular-nums">
                    {new Date(transaction.performed_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] text-slate-600 tabular-nums">{transaction.quantity}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600">{transaction.notes}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-slate-400">
                    No transactions found
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
