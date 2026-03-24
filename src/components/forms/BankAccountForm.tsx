"use client"

import type React from "react"
import { Building, Hash, MapPin, User, CreditCard, ChevronDown } from "lucide-react"

interface BankAccountFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  isEditing: boolean
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

export function BankAccountForm({ formData, handleInputChange, isEditing }: BankAccountFormProps) {
  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════
          SECTION: Account Details
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Building} label="Account Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Bank Name */}
          <div className="space-y-1.5">
            <label htmlFor="bank_name" className={labelClass}>
              Bank Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text" id="bank_name" name="bank_name"
                value={formData.bank_name || ""}
                onChange={handleInputChange}
                placeholder="Enter bank name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Account Title */}
          <div className="space-y-1.5">
            <label htmlFor="account_title" className={labelClass}>
              Account Title <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text" id="account_title" name="account_title"
                value={formData.account_title || ""}
                onChange={handleInputChange}
                placeholder="Enter account title"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <label htmlFor="account_number" className={labelClass}>
              Account Number <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text" id="account_number" name="account_number"
                value={formData.account_number || ""}
                onChange={handleInputChange}
                placeholder="Enter account number"
                className={`${inputBase} pl-9 font-mono`}
                required
              />
            </div>
          </div>

          {/* IBAN */}
          <div className="space-y-1.5">
            <label htmlFor="iban" className={labelClass}>
              IBAN <span className="text-slate-400 normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text" id="iban" name="iban"
                value={formData.iban || ""}
                onChange={handleInputChange}
                placeholder="Enter IBAN"
                className={`${inputBase} pl-9 font-mono`}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION: Balance & Branch
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Hash} label="Balance & Branch" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Initial Balance */}
          <div className="space-y-1.5">
            <label htmlFor="initial_balance" className={labelClass}>Initial Balance</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[11px] font-medium text-slate-400">PKR</span>
              </div>
              <input
                type="number" id="initial_balance" name="initial_balance"
                value={formData.initial_balance ?? "0.00"}
                onChange={handleInputChange}
                placeholder="0.00" step="0.01" min="0"
                className={`${inputBase} pl-10`}
              />
            </div>
          </div>

          {/* Branch Code */}
          <div className="space-y-1.5">
            <label htmlFor="branch_code" className={labelClass}>
              Branch Code <span className="text-slate-400 normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text" id="branch_code" name="branch_code"
                value={formData.branch_code || ""}
                onChange={handleInputChange}
                placeholder="Enter branch code"
                className={`${inputBase} pl-9 font-mono`}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="is_active" className={labelClass}>Status</label>
            <div className="relative">
              {/* ── NATIVE SELECT + appearance-none + ChevronDown (Skill 10) ── */}
              <select
                id="is_active" name="is_active"
                value={formData.is_active === undefined ? "true" : formData.is_active.toString()}
                onChange={handleInputChange}
                className={`${inputBase} pl-3 pr-9 appearance-none`}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

        </div>

        {/* Branch Address — full width textarea */}
        <div className="space-y-1.5 mt-4">
          <label htmlFor="branch_address" className={labelClass}>
            Branch Address <span className="text-slate-400 normal-case tracking-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            {/* ── TEXTAREA: same border/focus/radius tokens as inputs, resize-none ── */}
            <textarea
              id="branch_address" name="branch_address"
              value={formData.branch_address || ""}
              onChange={handleInputChange}
              placeholder="Enter branch address"
              rows={3}
              className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
            />
          </div>
        </div>
      </div>

    </div>
  )
}