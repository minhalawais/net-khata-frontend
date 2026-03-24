"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  Calendar, FileText, MessageSquare, ChevronDown, User,
  DollarSign, Tag, Loader, Trash2,
} from "lucide-react"
import { SearchableCustomerSelect } from "../SearchableCustomerSelect.tsx"
import { SearchableInventorySelect } from "../SearchableInventorySelect.tsx"

interface InvoiceFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  isEditing: boolean
}

interface Customer {
  id: string; name: string; internetId: string
  servicePlanPrice: number; discountAmount: number
}

interface InventoryItem {
  id: string; item_type: string; quantity: number
  unit_price: number | null; vendor_name?: string
}

interface SelectedEquipment {
  id: string; item_type: string; quantity: number
  unit_price: number; available: number
}

/* ── SHARED STYLE CONSTANTS — Skill 10 recipe ── */
const inputBase =
  "h-9 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"
const labelClass = "block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]"

/* ── SECTION HEADER: left-border overline (Skill 10) ── */
const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
    <Icon className="w-4 h-4 text-slate-400" />
    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">{label}</span>
  </div>
)

export function InvoiceForm({ formData, handleInputChange, isEditing }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([])
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)

  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ]

  const currentInvoiceType = formData.invoice_type || "subscription"

  useEffect(() => {
    if (!formData.invoice_type) {
      handleInputChange({ target: { name: "invoice_type", value: "subscription" } } as React.ChangeEvent<HTMLInputElement>)
    }
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (formData.customer_id && customers.length > 0 && currentInvoiceType === "subscription") {
      const selectedCustomer = customers.find((c) => c.id === formData.customer_id)
      if (selectedCustomer) updatePrices(selectedCustomer)
    }
  }, [formData.customer_id, customers, currentInvoiceType])

  const fetchCustomers = async () => {
    try {
      setIsLoadingCustomers(true)
      const token = getToken()
      const response = await axiosInstance.get("/customers/list", { headers: { Authorization: `Bearer ${token}` } })
      setCustomers(response.data.map((c: any) => ({
        id: c.id, name: `${c.first_name} ${c.last_name}`,
        internetId: c.internet_id, servicePlanPrice: c.servicePlanPrice || 0, discountAmount: c.discount_amount || 0,
      })))
    } catch (error) { console.error("Failed to fetch customers", error) }
    finally { setIsLoadingCustomers(false) }
  }

  const fetchInventoryItems = async () => {
    try {
      setIsLoadingInventory(true)
      const token = getToken()
      const response = await axiosInstance.get("/inventory/list", { headers: { Authorization: `Bearer ${token}` } })
      setInventoryItems(response.data.filter((item: InventoryItem) => item.quantity > 0))
    } catch (error) { console.error("Failed to fetch inventory items", error) }
    finally { setIsLoadingInventory(false) }
  }

  const updatePrices = (customer: Customer) => {
    if (currentInvoiceType !== "subscription") return
    const subtotal = customer.servicePlanPrice
    const discountAmount = customer.discountAmount
    const discountPercentage = discountAmount > 0 ? (discountAmount / subtotal) * 100 : 0
    const totalAmount = subtotal - discountAmount
    handleInputChange({ target: { name: "subtotal", value: subtotal.toString() } } as React.ChangeEvent<HTMLInputElement>)
    handleInputChange({ target: { name: "discount_amount", value: discountAmount.toString() } } as React.ChangeEvent<HTMLInputElement>)
    handleInputChange({ target: { name: "discount_percentage", value: discountPercentage.toString() } } as React.ChangeEvent<HTMLInputElement>)
    handleInputChange({ target: { name: "total_amount", value: totalAmount.toString() } } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleInvoiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    handleInputChange(e)
    if (currentInvoiceType === "subscription" && newType !== "subscription") {
      ["subtotal", "discount_percentage", "total_amount", "billing_start_date", "billing_end_date"].forEach((field) => {
        handleInputChange({ target: { name: field, value: field === "discount_percentage" ? "0" : "" } } as React.ChangeEvent<HTMLInputElement>)
      })
      handleInputChange({ target: { name: "discount_amount", value: "0" } } as React.ChangeEvent<HTMLInputElement>)
    }
    if (newType === "subscription" && formData.customer_id) {
      const selectedCustomer = customers.find((c) => c.id === formData.customer_id)
      if (selectedCustomer) updatePrices(selectedCustomer)
    }
    if (newType === "equipment") { fetchInventoryItems(); setSelectedEquipment([]) }
  }

  const handleAddEquipment = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId)
    if (!item || selectedEquipment.find(e => e.id === itemId)) return
    const newEquipment = [...selectedEquipment, { id: item.id, item_type: item.item_type, quantity: 1, unit_price: item.unit_price ?? 0, available: item.quantity }]
    setSelectedEquipment(newEquipment)
    updateEquipmentTotals(newEquipment)
  }

  const handleRemoveEquipment = (itemId: string) => {
    const newEquipment = selectedEquipment.filter(e => e.id !== itemId)
    setSelectedEquipment(newEquipment)
    updateEquipmentTotals(newEquipment)
  }

  const handleEquipmentQuantityChange = (itemId: string, quantity: number) => {
    const newEquipment = selectedEquipment.map(e => e.id === itemId ? { ...e, quantity: Math.min(quantity, e.available) } : e)
    setSelectedEquipment(newEquipment)
    updateEquipmentTotals(newEquipment)
  }

  const updateEquipmentTotals = (equipment: SelectedEquipment[]) => {
    const subtotal = equipment.reduce((sum, e) => sum + (e.unit_price * e.quantity), 0)
    handleInputChange({ target: { name: "subtotal", value: subtotal.toString() } } as React.ChangeEvent<HTMLInputElement>)
    handleInputChange({ target: { name: "total_amount", value: subtotal.toString() } } as React.ChangeEvent<HTMLInputElement>)
    handleInputChange({ target: { name: "inventory_items", value: JSON.stringify(equipment.map(e => ({ id: e.id, quantity: e.quantity }))) } } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (currentInvoiceType !== "subscription") return
    const month = e.target.value
    setSelectedMonth(month)
    if (month) {
      const year = new Date().getFullYear()
      const monthNum = Number.parseInt(month)
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0)
      const dueDate = new Date(startDate)
      dueDate.setDate(dueDate.getDate() + 5)
      const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      handleInputChange({ target: { name: "billing_start_date", value: fmt(startDate) } } as React.ChangeEvent<HTMLInputElement>)
      handleInputChange({ target: { name: "billing_end_date", value: fmt(endDate) } } as React.ChangeEvent<HTMLInputElement>)
      handleInputChange({ target: { name: "due_date", value: fmt(dueDate) } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    handleInputChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>)
    if (name === "billing_end_date" && value && currentInvoiceType === "subscription") {
      const endDate = new Date(value)
      const dueDate = new Date(endDate)
      dueDate.setDate(dueDate.getDate() + 5)
      handleInputChange({ target: { name: "due_date", value: dueDate.toISOString().split("T")[0] } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    handleInputChange({ target: { name: "customer_id", value: customerId } } as React.ChangeEvent<HTMLSelectElement>)
    const selectedCustomer = customers.find((c) => c.id === customerId)
    if (selectedCustomer && currentInvoiceType === "subscription") updatePrices(selectedCustomer)
  }

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(e)
    const selectedCustomer = customers.find((c) => c.id === e.target.value)
    if (selectedCustomer && currentInvoiceType === "subscription") updatePrices(selectedCustomer)
  }

  const handleSubtotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      handleInputChange(e)
      handleInputChange({ target: { name: "total_amount", value: "" } } as React.ChangeEvent<HTMLInputElement>)
      return
    }
    const subtotal = Number.parseFloat(value) || 0
    if (subtotal < 0) { alert("Subtotal cannot be less than 0"); return }
    if (currentInvoiceType === "subscription") {
      const discountAmount = Number.parseFloat(formData.discount_amount) || 0
      const adjustedDiscount = Math.min(discountAmount, subtotal)
      const discountPercentage = subtotal > 0 ? (adjustedDiscount / subtotal) * 100 : 0
      const totalAmount = subtotal - adjustedDiscount
      handleInputChange(e)
      if (adjustedDiscount !== discountAmount) handleInputChange({ target: { name: "discount_amount", value: adjustedDiscount.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>)
      handleInputChange({ target: { name: "discount_percentage", value: discountPercentage.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>)
      handleInputChange({ target: { name: "total_amount", value: totalAmount === 0 ? "0.00" : totalAmount.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>)
    } else {
      handleInputChange(e)
      handleInputChange({ target: { name: "total_amount", value: subtotal.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentInvoiceType !== "subscription") return
    const value = e.target.value
    if (value === "") { handleInputChange(e); return }
    const discountAmount = Number.parseFloat(value)
    if (isNaN(discountAmount)) { handleInputChange(e); return }
    if (discountAmount < 0) { alert("Discount amount cannot be less than 0"); return }
    const subtotal = Number.parseFloat(formData.subtotal) || 0
    const adjustedDiscount = Math.min(discountAmount, subtotal)
    const discountPercentage = subtotal > 0 ? (adjustedDiscount / subtotal) * 100 : 0
    const totalAmount = subtotal - adjustedDiscount
    handleInputChange({ target: { name: "discount_amount", value } } as any)
    handleInputChange({ target: { name: "discount_percentage", value: discountPercentage.toString() } } as any)
    handleInputChange({ target: { name: "total_amount", value: totalAmount.toString() } } as any)
  }

  const handleDiscountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (currentInvoiceType !== "subscription") return
    const value = e.target.value
    if (value === "") return
    handleInputChange({ target: { name: "discount_amount", value: Number.parseFloat(value).toFixed(2) } } as any)
  }

  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if ((name === "subtotal" || name === "discount_amount") && value !== "" && (Number.parseFloat(value) || 0) < 0) {
      alert(`${name.replace("_", " ")} cannot be less than 0`); return
    }
    handleInputChange(e)
  }

  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════
          SECTION: Invoice Type
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={FileText} label="Invoice Type" />
        <div className="space-y-1.5">
          <label htmlFor="invoice_type" className={labelClass}>
            Invoice Type <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            {/* ── NATIVE SELECT + appearance-none + ChevronDown ── */}
            <select id="invoice_type" name="invoice_type" value={currentInvoiceType}
              onChange={handleInvoiceTypeChange}
              className={`${inputBase} pl-9 pr-9 appearance-none`} required>
              <option value="subscription">Subscription</option>
              <option value="installation">Installation</option>
              <option value="equipment">Equipment</option>
              <option value="add_on">Add-on</option>
              <option value="refund">Refund</option>
              <option value="deposit">Deposit</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Customer
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={User} label="Customer" />
        <div className="space-y-1.5">
          <label htmlFor="customer_id" className={labelClass}>
            Customer <span className="text-rose-500 ml-0.5">*</span>
          </label>
          {isLoadingCustomers ? (
            /* ── LOADING SKELETON ── */
            <div className="h-9 bg-slate-100 rounded-md animate-pulse" />
          ) : (
            <SearchableCustomerSelect
              customers={customers}
              value={formData.customer_id || ""}
              onChange={handleCustomerChange}
              onCustomerSelect={handleCustomerSelect}
              placeholder="Search and select customer"
            />
          )}
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Dates
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Calendar} label="Dates" />

        {/* Month quick-select (subscription only) */}
        {currentInvoiceType === "subscription" && (
          <div className="space-y-1.5 mb-4">
            <label htmlFor="month" className={labelClass}>
              Select Month <span className="text-slate-400 normal-case tracking-normal">(auto-fills dates)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <select id="month" name="month" value={selectedMonth} onChange={handleMonthChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}>
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        <div className={`grid gap-4 ${currentInvoiceType === "subscription" ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-1"}`}>
          {/* Billing Start + End (subscription only) */}
          {currentInvoiceType === "subscription" && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="billing_start_date" className={labelClass}>
                  Billing Start <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input type="date" id="billing_start_date" name="billing_start_date"
                    value={formData.billing_start_date || ""} onChange={handleDateChange}
                    className={`${inputBase} pl-9`} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="billing_end_date" className={labelClass}>
                  Billing End <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input type="date" id="billing_end_date" name="billing_end_date"
                    value={formData.billing_end_date || ""} onChange={handleDateChange}
                    className={`${inputBase} pl-9`} required />
                </div>
              </div>
            </>
          )}
          {/* Due Date / Invoice Date */}
          <div className="space-y-1.5">
            <label htmlFor="due_date" className={labelClass}>
              {currentInvoiceType === "subscription" ? "Due Date" : "Invoice Date"}{" "}
              <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input type="date" id="due_date" name="due_date"
                value={formData.due_date || ""} onChange={handleDateChange}
                className={`${inputBase} pl-9`} required />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Equipment (equipment type only)
      ════════════════════════════════════ */}
      {currentInvoiceType === "equipment" && (
        <div>
          <SectionHeader icon={Tag} label="Equipment Items" />
          {/* Add item dropdown */}
          <div className="space-y-1.5 mb-4">
            <label className={labelClass}>Add Item</label>
            <SearchableInventorySelect
              items={inventoryItems}
              excludeIds={selectedEquipment.map(e => e.id)}
              onItemSelect={handleAddEquipment}
              isLoading={isLoadingInventory}
              placeholder="Search and select equipment to add..."
            />
          </div>

          {/* Selected items table */}
          {selectedEquipment.length > 0 && (
            <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
              <table className="w-full">
                {/* ── TABLE HEADER: system recipe ── */}
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Item", "Qty", "Unit Price", "Total", ""].map((col) => (
                      <th key={col}
                        className={`px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] ${col === "Qty" || col === "Unit Price" || col === "Total" ? "text-right" : ""}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedEquipment.map(item => (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors duration-100">
                      <td className="px-4 py-3 text-[13px] text-slate-700">{item.item_type}</td>
                      <td className="px-4 py-3 text-right">
                        <input type="number" min="1" max={item.available} value={item.quantity}
                          onChange={(e) => handleEquipmentQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-7 px-2 text-center text-[13px] border border-slate-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] outline-none transition-colors duration-150"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] text-slate-600 tabular-nums">
                          <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
                          {item.unit_price?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[13px] font-medium text-slate-900 tabular-nums">
                          <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
                          {(item.unit_price * item.quantity).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {/* ── REMOVE: ghost rose icon button ── */}
                        <button type="button" onClick={() => handleRemoveEquipment(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors duration-150">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* ── GRAND TOTAL ROW ── */}
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-2.5 text-right text-[13px] font-medium text-slate-600">
                      Grand Total
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[13px] font-semibold text-blue-600 tabular-nums">
                        <span className="text-[11px] text-blue-400 mr-0.5">PKR</span>
                        {selectedEquipment.reduce((sum, e) => sum + (e.unit_price * e.quantity), 0).toLocaleString()}
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {selectedEquipment.length === 0 && !isLoadingInventory && (
            <p className="text-[13px] text-slate-400">No equipment selected. Use the dropdown above to add items.</p>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          SECTION: Billing
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={DollarSign} label="Billing" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">

          {/* Subtotal */}
          <div className="space-y-1.5">
            <label htmlFor="subtotal" className={labelClass}>
              Subtotal <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[11px] font-medium text-slate-400">PKR</span>
              </div>
              <input type="number" id="subtotal" name="subtotal" value={formData.subtotal || ""}
                onChange={handleSubtotalChange} placeholder="Enter subtotal" step="0.01" min="0"
                className={`${inputBase} pl-10`} required />
            </div>
          </div>

          {/* Discount Amount (subscription only) */}
          {currentInvoiceType === "subscription" && (
            <div className="space-y-1.5">
              <label htmlFor="discount_amount" className={labelClass}>Discount Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[11px] font-medium text-slate-400">PKR</span>
                </div>
                <input type="number" id="discount_amount" name="discount_amount"
                  value={formData.discount_amount || ""} onChange={handleDiscountAmountChange}
                  onBlur={handleDiscountBlur} placeholder="Enter discount" step="0.01" min="0"
                  className={`${inputBase} pl-10`} />
              </div>
              {formData.subtotal && (
                <p className="text-[11px] text-slate-400">Max: PKR {Number.parseFloat(formData.subtotal).toFixed(2)}</p>
              )}
            </div>
          )}

          {/* Total Amount (read-only) */}
          <div className="space-y-1.5">
            <label htmlFor="total_amount" className={labelClass}>Total Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[11px] font-medium text-slate-400">PKR</span>
              </div>
              {/* ── READ-ONLY: bg-slate-50, cursor-default ── */}
              <input type="number" id="total_amount" name="total_amount"
                value={formData.total_amount || ""} readOnly placeholder="Calculated automatically"
                step="0.01"
                className="h-9 w-full pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-500 cursor-default outline-none tabular-nums"
                required />
            </div>
            <p className="text-[11px] text-slate-400">
              {currentInvoiceType === "subscription" ? "Subtotal − Discount" : "Same as subtotal"}
            </p>
          </div>
        </div>
      </div>

      {/* Hidden discount percentage for backward compatibility */}
      <input type="hidden" name="discount_percentage" value={formData.discount_percentage || "0"} />

      {/* ════════════════════════════════════
          SECTION: Notes
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={MessageSquare} label="Notes" />
        <div className="space-y-1.5">
          <label htmlFor="notes" className={labelClass}>Additional Notes</label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </div>
            <textarea id="notes" name="notes" value={formData.notes || ""}
              onChange={handleInputChangeWithValidation}
              placeholder="Enter additional notes" rows={3}
              className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
            />
          </div>
        </div>
      </div>

    </div>
  )
}