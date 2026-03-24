"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Package, FileText, Zap, Database, DollarSign, Globe, ChevronDown, Loader } from "lucide-react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"

interface ISP {
  id: string
  name: string
}

interface ServicePlanFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  isEditing: boolean
}

export function ServicePlanForm({ formData, handleInputChange, isEditing }: ServicePlanFormProps) {
  const [isps, setIsps] = useState<ISP[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchIsps = async () => {
      try {
        const token = getToken()
        const response = await axiosInstance.get("/isps/list", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setIsps(response.data)
      } catch (error) {
        console.error("Failed to fetch ISPs", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchIsps()
  }, [])

  /* ── SHARED CLASSES: Skill 10 recipe ── */
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
          SECTION: Plan Details
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Package} label="Plan Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* ISP Selection */}
          <div className="space-y-1.5">
            <label htmlFor="isp_id" className={labelClass}>
              ISP <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoading
                  ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                  : <Globe className="w-4 h-4 text-slate-400" />
                }
              </div>
              {/* Skill 10: native select + appearance-none + ChevronDown ── */}
              <select
                id="isp_id"
                name="isp_id"
                value={formData.isp_id || ""}
                onChange={handleInputChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}
                required
                disabled={isLoading}
              >
                <option value="">-- Select ISP --</option>
                {isps.map((isp) => (
                  <option key={isp.id} value={isp.id}>{isp.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Plan Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Plan Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter plan name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

        </div>

        {/* Description — full width textarea */}
        <div className="space-y-1.5 mt-4">
          <label htmlFor="description" className={labelClass}>Description</label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            {/* ── TEXTAREA: same border/focus/radius tokens as inputs ── */}
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Enter plan description"
              rows={3}
              className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION: Plan Specifications
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Zap} label="Plan Specifications" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">

          {/* Speed (Mbps) */}
          <div className="space-y-1.5">
            <label htmlFor="speed_mbps" className={labelClass}>Speed (Mbps)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Zap className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="number"
                id="speed_mbps"
                name="speed_mbps"
                value={formData.speed_mbps || ""}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                className={`${inputBase} pl-9`}
                min="0"
              />
            </div>
          </div>

          {/* Data Cap (GB) */}
          <div className="space-y-1.5">
            <label htmlFor="data_cap_gb" className={labelClass}>Data Cap (GB)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="number"
                id="data_cap_gb"
                name="data_cap_gb"
                value={formData.data_cap_gb || ""}
                onChange={handleInputChange}
                placeholder="e.g., 500"
                className={`${inputBase} pl-9`}
                min="0"
              />
            </div>
          </div>

          {/* Price (PKR) */}
          <div className="space-y-1.5">
            <label htmlFor="price" className={labelClass}>
              Price (PKR) <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleInputChange}
                placeholder="e.g., 2000"
                className={`${inputBase} pl-9`}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}