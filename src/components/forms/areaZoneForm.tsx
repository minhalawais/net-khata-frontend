"use client"

import type React from "react"
import { Map, ClipboardList } from "lucide-react"

interface AreaZoneFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  isEditing: boolean
}

export function AreaZoneForm({ formData, handleInputChange, isEditing }: AreaZoneFormProps) {
  const inputClasses =
    "w-full h-9 pl-9 pr-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"

  const textareaClasses =
    "w-full min-h-[110px] pl-9 pr-3 py-2.5 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none"

  const labelClasses = "block text-[11px] font-medium text-slate-600 mb-1.5"
  const iconClasses = "h-4 w-4 text-slate-400"

  return (
    <div className="space-y-5">
      {/* Area/Zone Name */}
      <div className="space-y-2">
        <label className={labelClasses}>
          Area/Zone Name <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Map className={iconClasses} />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            placeholder="Enter area or zone name"
            className={inputClasses}
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className={labelClasses}>Description</label>
        <div className="relative">
          <div className="absolute top-2.5 left-3 pointer-events-none">
            <ClipboardList className={iconClasses} />
          </div>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            placeholder="Enter area/zone description"
            rows={3}
            className={textareaClasses}
          />
        </div>
      </div>
    </div>
  )
}

export default AreaZoneForm
