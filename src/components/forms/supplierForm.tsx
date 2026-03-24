"use client"

import type React from "react"
import { Building2, User, Mail, Phone, MapPin } from "lucide-react"

interface SupplierFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  isEditing: boolean
}

export function SupplierForm({ formData, handleInputChange, isEditing }: SupplierFormProps) {

  /* ── SHARED CLASSES: Skill 10 recipe ── */
  /* h-9, rounded-md, border-slate-200, correct focus ring, hover:border-slate-300 */
  const inputBase =
    "h-9 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"

  /* Skill 10: text-[11px] font-medium text-slate-600 uppercase tracking */
  const labelClass = "block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]"

  /* ── SECTION HEADER: left-border overline (Skill 10) ── */
  const SectionHeader = ({
    icon: Icon,
    label,
  }: {
    icon: React.ElementType
    label: string
  }) => (
    <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">
        {label}
      </span>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════
          SECTION: Supplier Details
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Building2} label="Supplier Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Supplier Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Supplier Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-1.5">
            <label htmlFor="contact_person" className={labelClass}>
              Contact Person
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                value={formData.contact_person || ""}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>
              Email <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION: Location
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={MapPin} label="Location" />

        {/* Address — full width textarea */}
        <div className="space-y-1.5">
          <label htmlFor="address" className={labelClass}>Address</label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            {/* ── TEXTAREA: same border/focus/radius tokens as inputs, no h-9 ── */}
            <textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              placeholder="Enter complete address"
              rows={3}
              className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
            />
          </div>
        </div>
      </div>

    </div>
  )
}

export default SupplierForm