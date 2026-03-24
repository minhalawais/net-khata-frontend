"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Image,
  FileText,
  X,
  Check,
  Upload,
} from "lucide-react"

interface VendorFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleFileChange?: (name: string, file: File | null) => void
  isEditing: boolean
}

export function VendorForm({ formData, handleInputChange, handleFileChange, isEditing }: VendorFormProps) {
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

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

  /* ── FILE CHANGE HANDLER ── */
  const handleLocalFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, files } = e.target
      if (files && files[0]) {
        const file = files[0]
        const url = URL.createObjectURL(file)
        setPreviewUrls((prev) => ({ ...prev, [name]: url }))
        handleFileChange?.(name, file)
      }
    },
    [handleFileChange],
  )

  const removeFile = (fieldName: string) => {
    setPreviewUrls((prev) => {
      const newUrls = { ...prev }
      if (newUrls[fieldName]) URL.revokeObjectURL(newUrls[fieldName])
      delete newUrls[fieldName]
      return newUrls
    })
    handleFileChange?.(fieldName, null)
  }

  /* ── FILE UPLOAD FIELD ── */
  const FileUploadField = ({
    name,
    label,
    accept,
    icon: Icon,
  }: {
    name: string
    label: string
    accept: string
    icon: React.ElementType
  }) => {
    const previewUrl = previewUrls[name] || formData[name]
    const isImage = accept.includes("image")
    const hasFile = Boolean(previewUrl)

    return (
      <div className="space-y-1.5">
        <label className={labelClass}>{label}</label>

        {hasFile ? (
          /* ── PREVIEW STATE: file selected or already uploaded ── */
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md">
            {isImage && previewUrl && (previewUrl.startsWith("blob:") || previewUrl.startsWith("http")) ? (
              <img
                src={previewUrl}
                alt={label}
                className="w-10 h-10 object-cover rounded-md flex-shrink-0 border border-slate-200"
              />
            ) : (
              /* ── NON-IMAGE FILE ICON ── */
              <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                File attached
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click × to remove</p>
            </div>
            {/* ── REMOVE BUTTON: rounded-md not rounded-full, rose semantic ── */}
            <button
              type="button"
              onClick={() => removeFile(name)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150 flex-shrink-0"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* ── EMPTY DROPZONE: dashed border, system tokens ── */
          <label
            htmlFor={`file-${name}`}
            className="flex flex-col items-center justify-center gap-2 w-full py-5 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150"
          >
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-[13px] text-slate-500">
                Click to upload{" "}
                <span className="text-blue-600 font-medium">{label}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isImage ? "PNG, JPG, JPEG" : "PDF, PNG, JPG"} up to 10MB
              </p>
            </div>
            {/* ── HIDDEN FILE INPUT: dropzone label is the click target ── */}
            <input
              type="file"
              id={`file-${name}`}
              name={name}
              onChange={handleLocalFileChange}
              accept={accept}
              className="sr-only"
            />
          </label>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════
          SECTION: Vendor Information
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={User} label="Vendor Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Vendor Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Vendor Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter vendor name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className={labelClass}>
              Phone Number <span className="text-rose-500 ml-0.5">*</span>
            </label>
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
                required
              />
            </div>
          </div>

          {/* Email */}
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
                placeholder="Enter email address"
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          {/* CNIC */}
          <div className="space-y-1.5">
            <label htmlFor="cnic" className={labelClass}>
              CNIC Number <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="cnic"
                name="cnic"
                value={formData.cnic || ""}
                onChange={handleInputChange}
                placeholder="12345-1234567-1"
                className={`${inputBase} pl-9`}
                required
                maxLength={15}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION: Document Attachments
      ══════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Upload} label="Document Attachments" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <FileUploadField
            name="picture"
            label="Vendor Picture"
            accept="image/png,image/jpeg,image/jpg"
            icon={Image}
          />
          <FileUploadField
            name="cnic_front_image"
            label="CNIC Front"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            icon={CreditCard}
          />
          <FileUploadField
            name="cnic_back_image"
            label="CNIC Back"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            icon={CreditCard}
          />
          <FileUploadField
            name="agreement_document"
            label="Agreement Document"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            icon={FileText}
          />
        </div>
      </div>

    </div>
  )
}

export default VendorForm