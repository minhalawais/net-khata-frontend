"use client"

import type React from "react"
import {
  Building, Calendar, FileText, User, CreditCard,
  Settings, Clock, Upload, Check, ChevronDown, Loader,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"

interface ExtraIncomeFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleFileChange?: (name: string, file: File | null) => void
  isEditing: boolean
  onManageIncomeTypes?: () => void
}

interface BankAccount {
  id: string; bank_name: string; account_title: string; account_number: string
}

interface ExtraIncomeType {
  id: string; name: string; description: string; is_active: boolean
}

const getPakistaniDate = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
const getPakistaniTime = () =>
  new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: false })

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

export function ExtraIncomeForm({
  formData, handleInputChange, handleFileChange, isEditing, onManageIncomeTypes,
}: ExtraIncomeFormProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [incomeTypes, setIncomeTypes] = useState<ExtraIncomeType[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [proofFileName, setProofFileName] = useState<string | null>(null)

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online', label: 'Online Payment' },
  ]

  const showBankAccountField = formData.payment_method === 'online' || formData.payment_method === 'bank_transfer'

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        const token = getToken()
        const [bankRes, typesRes] = await Promise.all([
          axiosInstance.get('/bank-accounts/list?active_only=true', { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get('/extra-income-types/list', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setBankAccounts(bankRes.data)
        setIncomeTypes(typesRes.data.filter((t: ExtraIncomeType) => t.is_active))
      } catch (error) {
        console.error('Failed to fetch data', error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()

    if (!isEditing) {
      if (!formData.income_date) {
        handleInputChange({ target: { name: "income_date", value: getPakistaniDate() } } as React.ChangeEvent<HTMLInputElement>)
      }
      if (!formData.income_time) {
        handleInputChange({ target: { name: "income_time", value: getPakistaniTime() } } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }, [isEditing])

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFileName(file.name)
      handleFileChange?.('payment_proof', file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setPaymentProofPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setPaymentProofPreview(null)
      }
    }
  }

  return (
    <div className="space-y-6">

      {/* ════════════════════════════════════
          SECTION: Income Classification
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={FileText} label="Income Classification" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Income Type + Manage link */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="income_type_id" className={labelClass}>
                Income Type <span className="text-rose-500 ml-0.5">*</span>
              </label>
              {/* ── MANAGE TYPES: inline text link ── */}
              <button type="button" onClick={onManageIncomeTypes}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors duration-150">
                <Settings className="w-3 h-3" />
                Manage Types
              </button>
            </div>
            <div className="relative">
              <select id="income_type_id" name="income_type_id"
                value={formData.income_type_id || ""} onChange={handleInputChange}
                className={`${inputBase} pl-3 pr-9 appearance-none`} required disabled={isLoadingData}>
                <option value="">Select Income Type</option>
                {incomeTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {isLoadingData
                  ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label htmlFor="amount" className={labelClass}>
              Amount <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[11px] font-medium text-slate-400">PKR</span>
              </div>
              <input type="number" id="amount" name="amount"
                value={formData.amount || ""} onChange={handleInputChange}
                placeholder="0.00" step="0.01" min="0"
                className={`${inputBase} pl-10`} required />
            </div>
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Date & Time
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Calendar} label="Date & Time" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Income Date */}
          <div className="space-y-1.5">
            <label htmlFor="income_date" className={labelClass}>
              Income Date <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input type="date" id="income_date" name="income_date"
                value={formData.income_date || getPakistaniDate()} onChange={handleInputChange}
                className={`${inputBase} pl-9`} required />
            </div>
          </div>

          {/* Income Time */}
          <div className="space-y-1.5">
            <label htmlFor="income_time" className={labelClass}>
              Income Time <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <input type="time" id="income_time" name="income_time"
                value={formData.income_time || getPakistaniTime()} onChange={handleInputChange}
                className={`${inputBase} pl-9`} required />
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
            <label htmlFor="payment_method" className={labelClass}>Payment Method</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <select id="payment_method" name="payment_method"
                value={formData.payment_method || ""} onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}>
                <option value="">Select Payment Method</option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Bank Account — conditional */}
          {showBankAccountField && (
            <div className="space-y-1.5">
              <label htmlFor="bank_account_id" className={labelClass}>
                Bank Account <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="w-4 h-4 text-slate-400" />
                </div>
                <select id="bank_account_id" name="bank_account_id"
                  value={formData.bank_account_id || ""} onChange={handleInputChange}
                  className={`${inputBase} pl-9 pr-9 appearance-none`} required={showBankAccountField}>
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.bank_name} - {account.account_title} (****{account.account_number.slice(-4)})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Required for {formData.payment_method === 'online' ? 'online payments' : 'bank transfers'}
              </p>
            </div>
          )}

          {/* Payer */}
          <div className="space-y-1.5">
            <label htmlFor="payer" className={labelClass}>Payer</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input type="text" id="payer" name="payer"
                value={formData.payer || ""} onChange={handleInputChange}
                placeholder="Enter payer name"
                className={`${inputBase} pl-9`} />
            </div>
          </div>

        </div>

        {/* Description — full width */}
        <div className="space-y-1.5 mt-4">
          <label htmlFor="description" className={labelClass}>Description</label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <textarea id="description" name="description"
              value={formData.description || ""} onChange={handleInputChange}
              placeholder="Enter income description" rows={3}
              className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Payment Proof
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Upload} label="Payment Proof" />

        <div className="space-y-1.5">
          <label className={labelClass}>Upload Proof</label>
          <input type="file" id="payment_proof" name="payment_proof"
            accept="image/*,.pdf" onChange={handleProofChange} className="sr-only" />
          <label htmlFor="payment_proof"
            className="flex items-center gap-3 w-full py-3 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150">
            {paymentProofPreview ? (
              <>
                <img src={paymentProofPreview} alt="Preview"
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-slate-700">{proofFileName || "Image selected"}</p>
                  <p className="text-[11px] text-slate-400">Click to replace</p>
                </div>
              </>
            ) : (proofFileName || formData.payment_proof) ? (
              <>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-700">{proofFileName || "Proof uploaded"}</p>
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
                  <p className="text-[11px] text-slate-400">Image or PDF up to 10MB</p>
                </div>
              </>
            )}
          </label>
        </div>
      </div>

    </div>
  )
}