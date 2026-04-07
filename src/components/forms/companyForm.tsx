"use client"

import type React from "react"
import { Building2, Mail, Phone, MapPin } from "lucide-react"

interface CompanyFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  isEditing: boolean
}

export function CompanyForm({ formData, handleInputChange }: CompanyFormProps) {
  const inputBase =
    "h-9 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"

  const labelClass = "block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]"

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Company Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Company Name <span className="text-rose-500 ml-0.5">*</span>
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
                placeholder="Enter company name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>Email</label>
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
                placeholder="Enter company email"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact_number" className={labelClass}>Contact Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number || ""}
                onChange={handleInputChange}
                placeholder="Enter contact number"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="address" className={labelClass}>Address</label>
            <div className="relative">
              <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder="Enter company address"
                rows={3}
                className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyForm