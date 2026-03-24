"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  Globe, DollarSign, Building, Calendar, CreditCard, Hash,
  User, ChevronDown, FileText, Upload, Check, Loader,
  Activity, Wifi, Package,
} from "lucide-react"

interface ISPPaymentFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  isEditing: boolean
}

interface ISP { id: string; name: string }
interface BankAccount {
  id: string; bank_name: string; account_title: string
  account_number: string; iban?: string
}
interface Employee { id: string; name: string }

const getPakistaniDate = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })

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

/* ── FIELD WRAPPER ── */
const Field = ({
  id, label, required = false, error, children,
}: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className={labelClass}>
      {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-rose-500">{error}</p>}
  </div>
)

export function ISPPaymentForm({ formData, handleInputChange, isEditing }: ISPPaymentFormProps) {
  const [isps, setIsps] = useState<ISP[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoadingIsps, setIsLoadingIsps] = useState(false)
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [proofFileName, setProofFileName] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing && !formData.payment_date) {
      handleInputChange({
        target: { name: "payment_date", value: getPakistaniDate() },
      } as React.ChangeEvent<HTMLInputElement>)
    }
    if (!isEditing && !formData.status) {
      handleInputChange({
        target: { name: "status", value: "paid" },
      } as React.ChangeEvent<HTMLInputElement>)
    }
    fetchIsps()
    fetchBankAccounts()
    fetchEmployees()
  }, [isEditing])

  const fetchIsps = async () => {
    try {
      setIsLoadingIsps(true)
      const token = getToken()
      const response = await axiosInstance.get("/isps/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setIsps(response.data)
    } catch (error) { console.error("Failed to fetch ISPs", error) }
    finally { setIsLoadingIsps(false) }
  }

  const fetchBankAccounts = async () => {
    try {
      setIsLoadingBankAccounts(true)
      const token = getToken()
      const response = await axiosInstance.get("/bank-accounts/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBankAccounts(response.data)
    } catch (error) { console.error("Failed to fetch bank accounts", error) }
    finally { setIsLoadingBankAccounts(false) }
  }

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true)
      const token = getToken()
      const response = await axiosInstance.get("/employees/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmployees(response.data.map((emp: any) => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
      })))
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

  const isBandwidthType = formData.payment_type === "bandwidth_usage"
  const isBankTransfer = formData.payment_method === "bank_transfer"

  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════
          SECTION: ISP & Payment Info
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Globe} label="ISP & Payment Info" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* ISP */}
          <Field id="isp_id" label="ISP" required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoadingIsps
                  ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                  : <Globe className="w-4 h-4 text-slate-400" />}
              </div>
              <select
                id="isp_id" name="isp_id"
                value={formData.isp_id || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}
                required disabled={isLoadingIsps}
              >
                <option value="">Select ISP</option>
                {isps.map((isp) => (
                  <option key={isp.id} value={isp.id}>{isp.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </Field>

          {/* Payment Type */}
          <Field id="payment_type" label="Payment Type" required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <select
                id="payment_type" name="payment_type"
                value={formData.payment_type || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}
                required
              >
                <option value="">Select Payment Type</option>
                <option value="monthly_subscription">Monthly Subscription</option>
                <option value="bandwidth_usage">Bandwidth Usage</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </Field>

          {/* Amount */}
          <Field id="amount" label="Amount (PKR)" required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[11px] font-medium text-slate-400">PKR</span>
              </div>
              <input
                type="number" id="amount" name="amount"
                value={formData.amount || ""} onChange={handleInputChange}
                placeholder="Enter amount"
                className={`${inputBase} pl-10`}
                required min="0" step="0.01"
              />
            </div>
          </Field>

          {/* Payment Date */}
          <Field id="payment_date" label="Payment Date" required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="date" id="payment_date" name="payment_date"
                value={formData.payment_date || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </Field>

          {/* Billing Period */}
          <Field id="billing_period" label="Billing Period">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="month" id="billing_period" name="billing_period"
                value={formData.billing_period || ""} onChange={handleInputChange}
                placeholder="e.g., 2024-01"
                className={`${inputBase} pl-9`}
              />
            </div>
          </Field>

          {/* Reference Number */}
          <Field id="reference_number" label="Reference Number">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text" id="reference_number" name="reference_number"
                value={formData.reference_number || ""} onChange={handleInputChange}
                placeholder="Enter reference number"
                className={`${inputBase} pl-9`}
              />
            </div>
          </Field>

        </div>

        {/* Description — full width */}
        <div className="space-y-1.5 mt-4">
          <label htmlFor="description" className={labelClass}>Description</label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <textarea
              id="description" name="description"
              value={formData.description || ""} onChange={handleInputChange}
              placeholder="Enter payment description"
              rows={2}
              className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Bandwidth Details
          (only shown for bandwidth_usage type)
      ════════════════════════════════════ */}
      {isBandwidthType && (
        <div>
          <SectionHeader icon={Activity} label="Bandwidth Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

            {/* Bandwidth Usage (GB) */}
            <Field id="bandwidth_usage_gb" label="Bandwidth Usage (GB)" required>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wifi className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number" id="bandwidth_usage_gb" name="bandwidth_usage_gb"
                  value={formData.bandwidth_usage_gb || ""} onChange={handleInputChange}
                  placeholder="e.g., 500"
                  className={`${inputBase} pl-9`}
                  required min="0" step="0.01"
                />
              </div>
            </Field>

            {/* Rate per GB */}
            <Field id="rate_per_gb" label="Rate per GB (PKR)" required>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[11px] font-medium text-slate-400">PKR</span>
                </div>
                <input
                  type="number" id="rate_per_gb" name="rate_per_gb"
                  value={formData.rate_per_gb || ""} onChange={handleInputChange}
                  placeholder="e.g., 50"
                  className={`${inputBase} pl-10`}
                  required min="0" step="0.01"
                />
              </div>
            </Field>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          SECTION: Payment Method & Processing
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={CreditCard} label="Payment Method & Processing" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Payment Method */}
          <Field id="payment_method" label="Payment Method" required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <select
                id="payment_method" name="payment_method"
                value={formData.payment_method || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}
                required
              >
                <option value="">Select Payment Method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </Field>

          {/* Bank Account — only for bank transfer */}
          {isBankTransfer && (
            <Field id="bank_account_id" label="Bank Account" required>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isLoadingBankAccounts
                    ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                    : <Building className="w-4 h-4 text-slate-400" />}
                </div>
                <select
                  id="bank_account_id" name="bank_account_id"
                  value={formData.bank_account_id || ""} onChange={handleInputChange}
                  className={`${inputBase} pl-9 pr-9 appearance-none`}
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
            </Field>
          )}

          {/* Transaction ID */}
          <Field id="transaction_id" label="Transaction ID">
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
          </Field>

          {/* Status */}
          <Field id="status" label="Status" required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <select
                id="status" name="status"
                value={formData.status || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}
                required
              >
                <option value="">Select Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </Field>

          {/* Processed By */}
          <Field id="processed_by" label="Processed By" required>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoadingEmployees
                  ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                  : <User className="w-4 h-4 text-slate-400" />}
              </div>
              <select
                id="processed_by" name="processed_by"
                value={formData.processed_by || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}
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
          </Field>

        </div>
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