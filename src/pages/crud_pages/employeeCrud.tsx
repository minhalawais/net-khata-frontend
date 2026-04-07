"use client"

import { toast } from "../../utils/toast.ts"
import type React from "react"
import { useState, useEffect } from "react"
import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CRUDPage } from "../../components/crudPage.tsx"
import { EmployeeForm } from "../../components/forms/employeeForm.tsx"
import { useNavigate } from "react-router-dom"
import { Eye, Key, X, RefreshCw, Copy, Check } from "lucide-react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"

interface Employee {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  contact_number: string
  cnic: string
  current_balance?: number
  emergency_contact?: string
  house_address?: string
  cnic_image?: string
  picture?: string
  utility_bill_image?: string
  joining_date?: string
  salary?: number
  reference_name?: string
  reference_contact?: string
  reference_cnic_image?: string
}

interface CredentialsData {
  id: string
  username: string
  email: string
  has_credentials: boolean
  first_name: string
  last_name: string
}

/* ── ROLE BADGE COLORS: semantic muted pair per role ── */
const ROLE_COLORS: Record<string, string> = {
  super_admin:   "bg-indigo-50 text-indigo-700 border-indigo-200",
  technician:     "bg-blue-50   text-blue-700   border-blue-200",
  employee:       "bg-slate-100 text-slate-600  border-slate-200",
  company_owner:  "bg-violet-50 text-violet-700 border-violet-200",
  auditor:        "bg-amber-50  text-amber-700  border-amber-200",
  recovery_agent: "bg-rose-50   text-rose-600   border-rose-200",
}
const getRoleColor = (role: string) =>
  ROLE_COLORS[role?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"

/* ── AVATAR COLOR HASH: 5 muted pairs, consistent per name ── */
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-slate-100 text-slate-700",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
]
const getAvatarColor = (name: string) => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate()
  const [credentialsModal, setCredentialsModal] = useState<{ isOpen: boolean; employeeId: string | null }>({
    isOpen: false,
    employeeId: null,
  })
  const [credentials, setCredentials] = useState<CredentialsData | null>(null)
  const [credentialsLoading, setCredentialsLoading] = useState(false)
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Employee Management | Net Khata"
  }, [])

  const openCredentialsModal = async (employeeId: string) => {
    setCredentialsModal({ isOpen: true, employeeId })
    setCredentialsLoading(true)
    setNewPassword(null)
    try {
      const token = getToken()
      const response = await axiosInstance.get(`/employees/${employeeId}/credentials`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCredentials(response.data)
      setFormData({
        username: response.data.username || "",
        email: response.data.email || "",
        password: "",
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch credentials")
      setCredentialsModal({ isOpen: false, employeeId: null })
    } finally {
      setCredentialsLoading(false)
    }
  }

  const handleSaveCredentials = async (generatePassword: boolean = false) => {
    if (!credentialsModal.employeeId) return
    setSaving(true)
    try {
      const token = getToken()
      const payload: any = { username: formData.username, email: formData.email }
      if (generatePassword) {
        payload.generate_password = true
      } else if (formData.password) {
        payload.password = formData.password
      }
      const response = await axiosInstance.put(
        `/employees/${credentialsModal.employeeId}/credentials`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Credentials updated successfully!")
      if (response.data.password) {
        setNewPassword(response.data.password)
      } else {
        setCredentialsModal({ isOpen: false, employeeId: null })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update credentials")
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const closeCredentialsModal = () => {
    setCredentialsModal({ isOpen: false, employeeId: null })
    setNewPassword(null)
  }

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        header: "Name",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        cell: (info) => {
          const name = info.getValue() as string
          return (
            /* ── AVATAR CELL with name-hash color ── */
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium ${getAvatarColor(name)}`}
              >
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <span className="text-[13px] text-slate-700 font-medium">{name}</span>
            </div>
          )
        },
      },
      {
        header: "Username",
        accessorKey: "username",
        cell: (info) => (
          <span className="text-[13px] text-slate-600 font-mono">{info.getValue() as string}</span>
        ),
      },
      {
        header: "Contact",
        accessorKey: "contact_number",
      },
      {
        header: "CNIC",
        accessorKey: "cnic",
        cell: (info) => (
          <span className="text-[13px] text-slate-600 font-mono">{info.getValue() as string}</span>
        ),
      },
      {
        header: "Salary",
        accessorKey: "salary",
        cell: (info) => {
          const value = info.getValue()
          if (!value) return <span className="text-slate-400">—</span>
          return (
            /* ── MONETARY VALUE: plain tabular-nums, never colored ── */
            <span className="text-[13px] text-slate-900 font-medium tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {Number(value).toLocaleString()}
            </span>
          )
        },
      },
      {
        header: "Balance",
        accessorKey: "current_balance",
        cell: (info) => {
          const value = info.getValue() as number
          if (value === undefined || value === null) return <span className="text-slate-400">—</span>
          return (
            /* ── BALANCE: plain tabular-nums per Skill 05 Amendment ── */
            <span className="text-[13px] text-slate-900 font-medium tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {Number(value).toLocaleString()}
            </span>
          )
        },
      },
      {
        header: "Role",
        accessorKey: "role",
        cell: (info) => (
          /* ── ROLE BADGE: role-aware semantic color per Skill 05 badge tiers ── */
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-[0.06em] ${getRoleColor(info.getValue() as string)}`}>
            {(info.getValue() as string)?.replace("_", " ")}
          </span>
        ),
      },
      {
        header: "Quick Actions",
        id: "quick_actions",
        cell: (info) => (
          /* ── QUICK ACTION BUTTONS: ghost with label, no gradients, no shadows ── */
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/employees/${info.row.original.id}`)
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
              title="View Profile"
            >
              <Eye className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                openCredentialsModal(info.row.original.id)
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
              title="Manage Credentials"
            >
              <Key className="w-4 h-4" />
              Credentials
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  )

  return (
    <>
      <CRUDPage<Employee>
        title="Employee"
        endpoint="employees"
        columns={columns}
        FormComponent={EmployeeForm}
        useFormData={true}
        validateBeforeSubmit={(formData) => {
          if (!formData.username) return "Username is required"
          if (!formData.first_name || !formData.last_name) return "Name is required"
          if (!formData.contact_number) return "Contact number is required"
          if (!formData.emergency_contact) return "Emergency contact is required"
          if (!formData.cnic) return "CNIC is required"
          if (!formData.house_address) return "House address is required"
          if (!formData.salary) return "Salary is required"
          if (!formData.reference_name) return "Reference name is required"
          if (!formData.reference_contact) return "Reference contact is required"
          if (!formData.role) return "Role is required"
          return null
        }}
      />

      {/* ── CREDENTIALS MODAL ── */}
      {credentialsModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.50)" }}
          onClick={closeCredentialsModal}
        >
          {/* ── PANEL: no shadow, rounded-xl, border only ── */}
          <div
            className="bg-white rounded-xl border border-slate-200 w-full max-w-md flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ── HEADER: white, border-b, no gradient ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-[15px] font-medium text-slate-900">Manage Credentials</h3>
              </div>
              <button
                onClick={closeCredentialsModal}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── BODY: scrollable independently ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {credentialsLoading ? (
                /* ── SKELETON LOADING: preserve layout shape ── */
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                      <div className="h-9 w-full bg-slate-100 rounded-md animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : newPassword ? (
                /* ── GENERATED PASSWORD VIEW ── */
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                    <p className="text-[13px] text-emerald-800 font-medium">
                      New credentials generated successfully!
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Copy these now — the password cannot be viewed again.
                    </p>
                  </div>

                  {/* Username read-only */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
                      Username
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.username}
                        readOnly
                        className="flex-1 h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 cursor-default"
                      />
                      <button
                        onClick={() => copyToClipboard(formData.username, "username")}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors duration-150"
                        title="Copy username"
                      >
                        {copied === "username" ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password read-only */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
                      Generated Password
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPassword}
                        readOnly
                        className="flex-1 h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono cursor-default"
                      />
                      <button
                        onClick={() => copyToClipboard(newPassword, "password")}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors duration-150"
                        title="Copy password"
                      >
                        {copied === "password" ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── EDIT CREDENTIALS FORM ── */
                <div className="space-y-4">
                  {/* Employee name chip */}
                  {credentials && (
                    <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                      <p className="text-[13px] font-medium text-slate-700">
                        {credentials.first_name} {credentials.last_name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Employee account settings</p>
                    </div>
                  )}

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
                      New Password{" "}
                      <span className="text-slate-400 normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave empty to keep current"
                      className="w-full h-9 px-3 text-[13px] bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER: bg-slate-50 border-t, cancel left, primary right ── */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200 rounded-b-xl flex-shrink-0">
              {newPassword ? (
                <button
                  onClick={closeCredentialsModal}
                  className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    onClick={closeCredentialsModal}
                    className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveCredentials(true)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-700 border border-slate-200 bg-white rounded-md hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <RefreshCw className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
                    Generate Password
                  </button>
                  <button
                    onClick={() => handleSaveCredentials(false)}
                    disabled={saving}
                    className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EmployeeManagement