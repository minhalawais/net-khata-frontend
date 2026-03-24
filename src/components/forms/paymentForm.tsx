"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  FileText, DollarSign, Building, Calendar, CreditCard, Hash,
  User, ChevronDown, MessageSquare, Clock, Upload, Check, Loader,
} from "lucide-react"
import { SearchableSelect } from "../SearchableSelect.tsx"

interface PaymentFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  isEditing: boolean
}

interface Invoice {
  id: string; invoice_number: string; customer_name: string; total_amount: number
  customer_internet_id: string; due_date: string; status: string
  billing_start_date: string; billing_end_date: string
}

interface BankAccount {
  id: string; bank_name: string; account_title: string
  account_number: string; iban?: string
}

const getPakistaniDate = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
const getPakistaniTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: false })

/* ── SHARED STYLE CONSTANTS — Skill 10 recipe ── */
const inputBase =
  "h-9 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"
const labelClass = "block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]"

/* ── SECTION HEADER: left-border overline ── */
const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
    <Icon className="w-4 h-4 text-slate-400" />
    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">{label}</span>
  </div>
)

export function PaymentForm({ formData, handleInputChange, isEditing }: PaymentFormProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false)
  const [proofFileName, setProofFileName] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing) {
      if (!formData.payment_date) {
        handleInputChange({ target: { name: "payment_date", value: getPakistaniDate() } } as React.ChangeEvent<HTMLInputElement>)
      }
      if (!formData.payment_time) {
        handleInputChange({ target: { name: "payment_time", value: getPakistaniTime() } } as React.ChangeEvent<HTMLInputElement>)
      }
      if (!formData.status) {
        handleInputChange({ target: { name: "status", value: "paid" } } as React.ChangeEvent<HTMLInputElement>)
      }
    }
    fetchInvoices()
    fetchEmployees()
    fetchBankAccounts()
  }, [isEditing])

  useEffect(() => {
    if (isEditing && formData.invoice_id && invoices.length > 0) {
      const selectedInvoice = invoices.find((inv) => inv.id === formData.invoice_id)
      if (selectedInvoice && !formData.amount) {
        handleInputChange({ target: { name: "amount", value: selectedInvoice.total_amount.toString() } } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }, [formData.invoice_id, invoices, isEditing])

  const fetchBankAccounts = async () => {
    try {
      setIsLoadingBankAccounts(true)
      const token = getToken()
      const response = await axiosInstance.get("/bank-accounts/list", { headers: { Authorization: `Bearer ${token}` } })
      setBankAccounts(response.data)
    } catch (error) { console.error("Failed to fetch bank accounts", error) }
    finally { setIsLoadingBankAccounts(false) }
  }

  const fetchInvoices = async () => {
    try {
      setIsLoadingInvoices(true)
      const token = getToken()
      const response = await axiosInstance.get("/invoices/list", { headers: { Authorization: `Bearer ${token}` } })
      const filteredInvoices = isEditing
        ? response.data
        : response.data.filter((inv: any) =>
          inv.status === 'pending' || inv.status === 'Pending' ||
          inv.status === 'partially_paid' || inv.status === 'Partially Paid'
        )
      setInvoices(filteredInvoices.map((inv: any) => ({
        id: inv.id, invoice_number: inv.invoice_number, customer_name: inv.customer_name,
        customer_internet_id: inv.customer_internet_id || "N/A", total_amount: inv.total_amount,
        due_date: inv.due_date, status: inv.status,
        billing_end_date: inv.billing_end_date, billing_start_date: inv.billing_start_date,
      })))
    } catch (error) { console.error("Failed to fetch invoices", error) }
    finally { setIsLoadingInvoices(false) }
  }

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true)
      const token = getToken()
      const response = await axiosInstance.get("/employees/list", { headers: { Authorization: `Bearer ${token}` } })
      setEmployees(response.data.map((emp: any) => ({ id: emp.id, name: `${emp.first_name} ${emp.last_name}` })))
    } catch (error) { console.error("Failed to fetch employees", error) }
    finally { setIsLoadingEmployees(false) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      setProofFileName(file.name)
      handleInputChange({ target: { name: "payment_proof", value: file } } as any)
    }
  }

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInvoiceId = e.target.value
    const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId)
    handleInputChange(e)
    if (selectedInvoice && !isEditing) {
      handleInputChange({ target: { name: "amount", value: selectedInvoice.total_amount.toString() } } as any)
    }
  }

  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════
          SECTION: Invoice & Amount
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={FileText} label="Invoice & Amount" />

        <div className="space-y-4">
          {/* Invoice SearchableSelect */}
          <div className="space-y-1.5">
            <label htmlFor="invoice_id" className={labelClass}>
              Invoice <span className="text-rose-500 ml-0.5">*</span>
            </label>
            {isLoadingInvoices ? (
              /* ── LOADING SKELETON ── */
              <div className="h-9 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <SearchableSelect
                options={invoices}
                value={formData.invoice_id || ""}
                onChange={handleInvoiceChange}
                error={errors.invoice_id}
                placeholder="Search and select invoice"
              />
            )}
            {errors.invoice_id && <p className="text-[11px] text-rose-500">{errors.invoice_id}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <label htmlFor="amount" className={labelClass}>
                Amount <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[11px] font-medium text-slate-400">PKR</span>
                </div>
                <input
                  type="number" id="amount" name="amount"
                  value={formData.amount || ""} onChange={handleInputChange}
                  placeholder="Enter amount"
                  className={`${inputBase} pl-10 ${errors.amount ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]" : ""}`}
                  required
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-500">{errors.amount}</p>}
            </div>

            {/* Payment Date */}
            <div className="space-y-1.5">
              <label htmlFor="payment_date" className={labelClass}>
                Payment Date <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="date" id="payment_date" name="payment_date"
                  value={formData.payment_date || ""} onChange={handleInputChange}
                  className={`${inputBase} pl-9 ${errors.payment_date ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]" : ""}`}
                  required
                />
              </div>
              {errors.payment_date && <p className="text-[11px] text-rose-500">{errors.payment_date}</p>}
            </div>

            {/* Payment Time */}
            <div className="space-y-1.5">
              <label htmlFor="payment_time" className={labelClass}>
                Payment Time <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="time" id="payment_time" name="payment_time"
                  value={formData.payment_time || ""} onChange={handleInputChange}
                  className={`${inputBase} pl-9 ${errors.payment_time ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]" : ""}`}
                  required
                />
              </div>
              {errors.payment_time && <p className="text-[11px] text-rose-500">{errors.payment_time}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Payment Details
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={CreditCard} label="Payment Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label htmlFor="payment_method" className={labelClass}>
              Payment Method <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <select
                id="payment_method" name="payment_method"
                value={formData.payment_method || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none ${errors.payment_method ? "border-rose-400" : ""}`}
                required
              >
                <option value="">Select Payment Method</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            {errors.payment_method && <p className="text-[11px] text-rose-500">{errors.payment_method}</p>}
          </div>

          {/* Bank Account — only when bank_transfer */}
          {formData.payment_method === "bank_transfer" && (
            <div className="space-y-1.5">
              <label htmlFor="bank_account_id" className={labelClass}>
                Bank Account <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isLoadingBankAccounts
                    ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                    : <Building className="w-4 h-4 text-slate-400" />}
                </div>
                <select
                  id="bank_account_id" name="bank_account_id"
                  value={formData.bank_account_id || ""} onChange={handleInputChange}
                  className={`${inputBase} pl-9 pr-9 appearance-none ${errors.bank_account_id ? "border-rose-400" : ""}`}
                  disabled={isLoadingBankAccounts}
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank_name} - {account.account_number} ({account.account_title})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              {errors.bank_account_id && <p className="text-[11px] text-rose-500">{errors.bank_account_id}</p>}
            </div>
          )}

          {/* Transaction ID */}
          <div className="space-y-1.5">
            <label htmlFor="transaction_id" className={labelClass}>Transaction ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text" id="transaction_id" name="transaction_id"
                value={formData.transaction_id || ""} onChange={handleInputChange}
                placeholder="Enter transaction ID"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="status" className={labelClass}>
              Status <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <select
                id="status" name="status"
                value={formData.status || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none ${errors.status ? "border-rose-400" : ""}`}
                required
              >
                <option value="">Select Status</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            {errors.status && <p className="text-[11px] text-rose-500">{errors.status}</p>}
          </div>

          {/* Received By */}
          <div className="space-y-1.5">
            <label htmlFor="received_by" className={labelClass}>
              Received By <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoadingEmployees
                  ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                  : <User className="w-4 h-4 text-slate-400" />}
              </div>
              <select
                id="received_by" name="received_by"
                value={formData.received_by || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none ${errors.received_by ? "border-rose-400" : ""}`}
                required disabled={isLoadingEmployees}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            {errors.received_by && <p className="text-[11px] text-rose-500">{errors.received_by}</p>}
          </div>

        </div>

        {/* Failure reason — only when cancelled */}
        {formData.status === "cancelled" && (
          <div className="space-y-1.5 mt-4">
            <label htmlFor="failure_reason" className={labelClass}>Failure Reason</label>
            <div className="relative">
              <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </div>
              <textarea
                id="failure_reason" name="failure_reason"
                value={formData.failure_reason || ""} onChange={handleInputChange}
                placeholder="Enter failure reason" rows={2}
                className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          SECTION: Payment Proof
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Upload} label="Payment Proof" />

        <div className="space-y-1.5">
          <label className={labelClass}>Upload Proof</label>
          <label
            htmlFor="payment_proof"
            className="flex items-center gap-3 w-full py-3 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150"
          >
            {proofFileName || formData.payment_proof ? (
              <>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-700">
                    {proofFileName || "File attached"}
                  </p>
                  <p className="text-[11px] text-slate-400">Click to replace</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[13px] text-slate-500">Click to upload payment proof</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, JPEG, or PDF up to 10MB</p>
                </div>
              </>
            )}
            <input
              id="payment_proof" name="payment_proof" type="file"
              onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf"
              className="sr-only"
            />
          </label>
        </div>
      </div>

    </div>
  )
}