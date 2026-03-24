"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  User,
  AtSign,
  Phone,
  CreditCard,
  Lock,
  UserCog,
  Eye,
  EyeOff,
  Key,
  Check,
  X,
  Loader2,
  ChevronDown,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  FileText,
  Image,
  Users,
} from "lucide-react"
import { debounce } from "lodash"
import axiosInstance from "../../utils/axiosConfig.ts"
import { getToken } from "../../utils/auth.ts"

interface EmployeeFormProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleFileChange?: (name: string, file: File | null) => void
  isEditing: boolean
}

export function EmployeeForm({ formData, handleInputChange, handleFileChange, isEditing }: EmployeeFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle")
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle")
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "none">("none")

  const [previews, setPreviews] = useState<{
    cnic_image?: string
    picture?: string
    utility_bill_image?: string
    reference_cnic_image?: string
  }>({})

  const generatePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*()_+{}[]|:;<>,.?"
    const allChars = lowercase + uppercase + numbers + symbols
    let password = ""
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += symbols.charAt(Math.floor(Math.random() * symbols.length))
    for (let i = 0; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    password = password.split("").sort(() => 0.5 - Math.random()).join("")
    handleInputChange({ target: { name: "password", value: password } } as React.ChangeEvent<HTMLInputElement>)
    checkPasswordStrength(password)
  }

  const verifyUsername = useCallback(
    debounce(async (username: string) => {
      if (!username) { setUsernameStatus("idle"); return }
      setUsernameStatus("loading")
      try {
        const token = getToken()
        const response = await axiosInstance.post("/employees/verify-username", { username }, { headers: { Authorization: `Bearer ${token}` } })
        setUsernameStatus(response.data.available ? "valid" : "invalid")
      } catch {
        setUsernameStatus("invalid")
      }
    }, 300),
    [],
  )

  const verifyEmail = useCallback(
    debounce(async (email: string) => {
      if (!email) { setEmailStatus("idle"); return }
      setEmailStatus("loading")
      try {
        const token = getToken()
        const response = await axiosInstance.post("/employees/verify-email", { email }, { headers: { Authorization: `Bearer ${token}` } })
        setEmailStatus(response.data.available ? "valid" : "invalid")
      } catch {
        setEmailStatus("invalid")
      }
    }, 300),
    [],
  )

  const checkPasswordStrength = (password: string) => {
    if (!password) { setPasswordStrength("none"); return }
    const score = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      password.length >= 8,
    ].filter(Boolean).length
    if (score <= 2) setPasswordStrength("weak")
    else if (score <= 4) setPasswordStrength("medium")
    else setPasswordStrength("strong")
  }

  useEffect(() => {
    if (!isEditing) {
      verifyUsername(formData.username)
      verifyEmail(formData.email)
    }
    if (formData.password) checkPasswordStrength(formData.password)
  }, [formData.username, formData.email, formData.password, isEditing, verifyUsername, verifyEmail])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleInputChange(e)
    if (e.target.name === "username" && !isEditing) verifyUsername(e.target.value)
    else if (e.target.name === "email" && !isEditing) verifyEmail(e.target.value)
    else if (e.target.name === "password") checkPasswordStrength(e.target.value)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      handleFileChange?.(name, file)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => setPreviews((prev) => ({ ...prev, [name]: e.target?.result as string }))
        reader.readAsDataURL(file)
      } else {
        setPreviews((prev) => ({ ...prev, [name]: undefined }))
      }
    }
  }

  /* ── STATUS ICON for username/email validation ── */
  const renderStatusIcon = (status: "idle" | "loading" | "valid" | "invalid") => {
    switch (status) {
      case "loading": return <Loader2 className="animate-spin text-amber-500 w-4 h-4" />
      case "valid":   return <Check className="text-emerald-600 w-4 h-4" />
      case "invalid": return <X className="text-rose-500 w-4 h-4" />
      default:        return null
    }
  }

  /* ── PASSWORD STRENGTH COLOR using system semantic tokens ── */
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":   return "bg-rose-500"
      case "medium": return "bg-amber-500"
      case "strong": return "bg-emerald-500"
      default:       return "bg-slate-200"
    }
  }
  const getStrengthTextColor = () => {
    switch (passwordStrength) {
      case "weak":   return "text-rose-500"
      case "medium": return "text-amber-500"
      case "strong": return "text-emerald-600"
      default:       return "text-slate-400"
    }
  }

  /* ── SHARED INPUT/LABEL CLASSES ── */
  /* Skill 10: h-9, rounded-md, border-slate-200, correct focus ring */
  const inputBase =
    "h-9 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"

  /* Skill 10: text-[11px] font-medium text-slate-600 uppercase tracking */
  const labelClass = "block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]"

  /* ── SECTION HEADER: left-border overline pattern (Skill 10) ── */
  const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">{label}</span>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════
          SECTION: Personal Information
      ═══════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={User} label="Personal Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* First Name */}
          <div className="space-y-1.5">
            <label htmlFor="first_name" className={labelClass}>
              First Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
                placeholder="Enter first name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label htmlFor="last_name" className={labelClass}>
              Last Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
                placeholder="Enter last name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <label htmlFor="contact_number" className={labelClass}>
              Contact Number <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number || ""}
                onChange={handleChange}
                placeholder="03XX-XXXXXXX"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <label htmlFor="emergency_contact" className={labelClass}>
              Emergency Contact <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact || ""}
                onChange={handleChange}
                placeholder="Emergency contact number"
                className={`${inputBase} pl-9`}
                required
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
                onChange={handleChange}
                placeholder="XXXXX-XXXXXXX-X"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Joining Date */}
          <div className="space-y-1.5">
            <label htmlFor="joining_date" className={labelClass}>Joining Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="date"
                id="joining_date"
                name="joining_date"
                value={formData.joining_date || ""}
                onChange={handleChange}
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

        </div>

        {/* House Address — full width */}
        <div className="space-y-1.5 mt-4">
          <label htmlFor="house_address" className={labelClass}>
            House Address <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 pointer-events-none">
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            <textarea
              id="house_address"
              name="house_address"
              value={formData.house_address || ""}
              onChange={handleChange}
              placeholder="Complete house address"
              rows={2}
              className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION: Account & Employment
      ═══════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={UserCog} label="Account & Employment" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className={labelClass}>
              Username <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                placeholder="Enter username"
                className={`${inputBase} pl-9 pr-9 ${
                  usernameStatus === "invalid"
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]"
                    : usernameStatus === "valid"
                    ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/[0.12]"
                    : ""
                }`}
                required
                disabled={isEditing}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {renderStatusIcon(usernameStatus)}
              </div>
            </div>
            {usernameStatus === "invalid" && (
              <p className="text-[11px] text-rose-500">Username is already taken</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`${inputBase} pl-9 pr-9 ${
                  emailStatus === "invalid"
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]"
                    : emailStatus === "valid"
                    ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/[0.12]"
                    : ""
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {renderStatusIcon(emailStatus)}
              </div>
            </div>
            {emailStatus === "invalid" && (
              <p className="text-[11px] text-rose-500">Email is already in use</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className={labelClass}>
              Password {!isEditing && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
                className={`${inputBase} pl-9 pr-20`}
                required={!isEditing}
              />
              {/* Generate + Show/Hide buttons */}
              <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-md transition-colors duration-150"
                  title="Generate Password"
                >
                  <Key className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-md transition-colors duration-150"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password strength bar */}
            {passwordStrength !== "none" && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{
                      width:
                        passwordStrength === "weak" ? "33%" : passwordStrength === "medium" ? "66%" : "100%",
                    }}
                  />
                </div>
                <span className={`text-[11px] font-medium ${getStrengthTextColor()}`}>
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label htmlFor="role" className={labelClass}>
              Role <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCog className="w-4 h-4 text-slate-400" />
              </div>
              {/* Skill 10: native select + appearance-none + ChevronDown overlay */}
              <select
                id="role"
                name="role"
                value={formData.role || ""}
                onChange={handleChange}
                className={`${inputBase} pl-9 pr-9 appearance-none`}
                required
              >
                <option value="">Select Role</option>
                <option value="auditor">Auditor</option>
                <option value="employee">Employee</option>
                <option value="company_owner">Admin</option>
                <option value="recovery_agent">Recovery Agent</option>
                <option value="technician">Technician</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-1.5">
            <label htmlFor="salary" className={labelClass}>
              Monthly Salary (PKR) <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary || ""}
                onChange={handleChange}
                placeholder="e.g., 50000"
                className={`${inputBase} pl-9`}
                required
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Commission per Complaint */}
          <div className="space-y-1.5">
            <label htmlFor="commission_amount_per_complaint" className={labelClass}>
              Commission / Complaint
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="number"
                id="commission_amount_per_complaint"
                name="commission_amount_per_complaint"
                value={formData.commission_amount_per_complaint || ""}
                onChange={handleChange}
                placeholder="e.g., 50"
                className={`${inputBase} pl-9`}
                min="0"
                step="10"
              />
            </div>
            <p className="text-[11px] text-slate-400">Per resolved complaint</p>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION: Reference Person
      ═══════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Users} label="Reference Person" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Reference Name */}
          <div className="space-y-1.5">
            <label htmlFor="reference_name" className={labelClass}>
              Reference Name <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="reference_name"
                name="reference_name"
                value={formData.reference_name || ""}
                onChange={handleChange}
                placeholder="Reference person name"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

          {/* Reference Contact */}
          <div className="space-y-1.5">
            <label htmlFor="reference_contact" className={labelClass}>
              Reference Contact <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="reference_contact"
                name="reference_contact"
                value={formData.reference_contact || ""}
                onChange={handleChange}
                placeholder="Reference contact number"
                className={`${inputBase} pl-9`}
                required
              />
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION: Document Attachments
      ═══════════════════════════════════════════════ */}
      <div>
        <SectionHeader icon={FileText} label="Document Attachments" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* Employee Picture */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              Employee Picture <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input type="file" id="picture" name="picture" accept="image/*" onChange={onFileChange} className="hidden" />
            <label
              htmlFor="picture"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150"
            >
              {previews.picture ? (
                <img src={previews.picture} alt="Preview" className="h-14 w-14 object-cover rounded-md" />
              ) : formData.picture ? (
                <span className="text-[13px] text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> File uploaded
                </span>
              ) : (
                <>
                  <Image className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] text-slate-400">Upload employee photo</span>
                </>
              )}
            </label>
          </div>

          {/* CNIC Image */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              CNIC Attachment <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input type="file" id="cnic_image" name="cnic_image" accept="image/*,.pdf" onChange={onFileChange} className="hidden" />
            <label
              htmlFor="cnic_image"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150"
            >
              {previews.cnic_image ? (
                <img src={previews.cnic_image} alt="Preview" className="h-14 w-14 object-cover rounded-md" />
              ) : formData.cnic_image ? (
                <span className="text-[13px] text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> File uploaded
                </span>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] text-slate-400">Upload CNIC photo/scan</span>
                </>
              )}
            </label>
          </div>

          {/* Utility Bill */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              House Utility Bill <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input type="file" id="utility_bill_image" name="utility_bill_image" accept="image/*,.pdf" onChange={onFileChange} className="hidden" />
            <label
              htmlFor="utility_bill_image"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150"
            >
              {previews.utility_bill_image ? (
                <img src={previews.utility_bill_image} alt="Preview" className="h-14 w-14 object-cover rounded-md" />
              ) : formData.utility_bill_image ? (
                <span className="text-[13px] text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> File uploaded
                </span>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] text-slate-400">Upload utility bill</span>
                </>
              )}
            </label>
          </div>

          {/* Reference CNIC */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              Reference CNIC Attachment <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input type="file" id="reference_cnic_image" name="reference_cnic_image" accept="image/*,.pdf" onChange={onFileChange} className="hidden" />
            <label
              htmlFor="reference_cnic_image"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150"
            >
              {previews.reference_cnic_image ? (
                <img src={previews.reference_cnic_image} alt="Preview" className="h-14 w-14 object-cover rounded-md" />
              ) : formData.reference_cnic_image ? (
                <span className="text-[13px] text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> File uploaded
                </span>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] text-slate-400">Upload reference CNIC</span>
                </>
              )}
            </label>
          </div>

        </div>
      </div>

    </div>
  )
}