"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Building2, Users, UserCircle2, Receipt, CreditCard, Wallet, AlertCircle, CheckSquare, Plus, Pencil, Power } from "lucide-react"

import axiosInstance from "../utils/axiosConfig.ts"
import { Sidebar } from "../components/sideNavbar.tsx"
import { Topbar } from "../components/topNavbar.tsx"
import { Modal } from "../components/modal.tsx"
import { toast } from "../utils/toast.ts"

interface CompanyProfileResponse {
  company: {
    id: string
    name: string
    address?: string
    email?: string
    contact_number?: string
    is_active: boolean
    created_at?: string
  }
  metrics: {
    users_count: number
    active_users_count: number
    customers_count: number
    active_customers_count: number
    invoices_count: number
    unpaid_invoices_count: number
    payments_total: number
    expenses_total: number
    extra_income_total: number
    complaints_open: number
    tasks_open: number
    inventory_items_count: number
    suppliers_count: number
    vendors_count: number
    areas_count: number
    service_plans_count: number
    isps_count: number
    bank_accounts_count: number
  }
  recent: {
    users: Array<{ id: string; name: string; email: string; role: string; is_active: boolean; created_at?: string }>
    customers: Array<{ id: string; name: string; internet_id: string; is_active: boolean; created_at?: string }>
    invoices: Array<{ id: string; invoice_number: string; total_amount: number; status: string; created_at?: string }>
  }
}

interface CompanyUser {
  id: string
  company_id: string | null
  username: string
  email: string
  role: string
  first_name: string
  last_name: string
  contact_number?: string
  cnic?: string
  is_active: boolean
  created_at?: string
}

interface CompanyUserForm {
  username: string
  email: string
  password: string
  role: string
  first_name: string
  last_name: string
  contact_number: string
  cnic: string
  is_active: boolean
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value || 0)

const CompanyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<CompanyProfileResponse | null>(null)
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [isUserModalVisible, setIsUserModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null)
  const [isSavingUser, setIsSavingUser] = useState(false)
  const [userFormData, setUserFormData] = useState<CompanyUserForm>({
    username: "",
    email: "",
    password: "",
    role: "employee",
    first_name: "",
    last_name: "",
    contact_number: "",
    cnic: "",
    is_active: true,
  })

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const resetUserForm = () => {
    setUserFormData({
      username: "",
      email: "",
      password: "",
      role: "employee",
      first_name: "",
      last_name: "",
      contact_number: "",
      cnic: "",
      is_active: true,
    })
  }

  const fetchCompanyUsers = async () => {
    if (!id) return
    const response = await axiosInstance.get(`/companies/${id}/users`)
    setCompanyUsers(response.data || [])
  }

  const openCreateUserModal = () => {
    setEditingUser(null)
    resetUserForm()
    setIsUserModalVisible(true)
  }

  const openEditUserModal = (user: CompanyUser) => {
    setEditingUser(user)
    setUserFormData({
      username: user.username || "",
      email: user.email || "",
      password: "",
      role: user.role || "employee",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      contact_number: user.contact_number || "",
      cnic: user.cnic || "",
      is_active: user.is_active,
    })
    setIsUserModalVisible(true)
  }

  const closeUserModal = () => {
    setIsUserModalVisible(false)
    setEditingUser(null)
    resetUserForm()
  }

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }))
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    if (!userFormData.username.trim()) return toast.error("Username is required")
    if (!userFormData.email.trim()) return toast.error("Email is required")
    if (!userFormData.first_name.trim()) return toast.error("First name is required")
    if (!userFormData.last_name.trim()) return toast.error("Last name is required")
    if (!userFormData.role.trim()) return toast.error("Role is required")
    if (!editingUser && !userFormData.password.trim()) return toast.error("Password is required")

    setIsSavingUser(true)
    try {
      const payload: any = {
        username: userFormData.username.trim(),
        email: userFormData.email.trim(),
        role: userFormData.role,
        first_name: userFormData.first_name.trim(),
        last_name: userFormData.last_name.trim(),
        contact_number: userFormData.contact_number || null,
        cnic: userFormData.cnic || null,
        is_active: userFormData.is_active,
      }

      if (userFormData.password.trim()) {
        payload.password = userFormData.password
      }

      if (editingUser) {
        await axiosInstance.put(`/companies/${id}/users/${editingUser.id}/update`, payload)
        toast.success("Company user updated successfully")
      } else {
        await axiosInstance.post(`/companies/${id}/users/add`, payload)
        toast.success("Company user created successfully")
      }

      closeUserModal()
      await Promise.all([fetchCompanyUsers(), axiosInstance.get(`/companies/${id}/profile`).then((r) => setProfile(r.data))])
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save company user")
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleUserStatusToggle = async (user: CompanyUser) => {
    if (!id) return
    try {
      await axiosInstance.patch(`/companies/${id}/users/${user.id}/status`, { is_active: !user.is_active })
      toast.success("Company user status updated")
      await Promise.all([fetchCompanyUsers(), axiosInstance.get(`/companies/${id}/profile`).then((r) => setProfile(r.data))])
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user status")
    }
  }

  const kpis = useMemo(() => {
    if (!profile) return []
    return [
      { label: "Users", value: profile.metrics.users_count, icon: Users, tint: "bg-blue-50 text-blue-700" },
      { label: "Customers", value: profile.metrics.customers_count, icon: UserCircle2, tint: "bg-emerald-50 text-emerald-700" },
      { label: "Invoices", value: profile.metrics.invoices_count, icon: Receipt, tint: "bg-violet-50 text-violet-700" },
      { label: "Collections", value: `PKR ${formatCurrency(profile.metrics.payments_total)}`, icon: CreditCard, tint: "bg-amber-50 text-amber-700" },
      { label: "Expenses", value: `PKR ${formatCurrency(profile.metrics.expenses_total)}`, icon: Wallet, tint: "bg-rose-50 text-rose-700" },
      { label: "Open Complaints", value: profile.metrics.complaints_open, icon: AlertCircle, tint: "bg-slate-100 text-slate-700" },
      { label: "Open Tasks", value: profile.metrics.tasks_open, icon: CheckSquare, tint: "bg-cyan-50 text-cyan-700" },
    ]
  }, [profile])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const [profileResponse, usersResponse] = await Promise.all([
          axiosInstance.get(`/companies/${id}/profile`),
          axiosInstance.get(`/companies/${id}/users`),
        ])
        setProfile(profileResponse.data)
        setCompanyUsers(usersResponse.data || [])
        document.title = `${profileResponse.data?.company?.name || "Company"} | Company Profile`
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to load company profile")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setIsOpen={setIsSidebarOpen} />

      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${
          isSidebarOpen ? "lg:pl-[260px]" : "lg:pl-[60px]"
        }`}
      >
        <div className="flex-shrink-0">
          <Topbar toggleSidebar={toggleSidebar} />
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-100 px-6 py-5">
          <div className="max-w-[1400px] mx-auto space-y-5">
            <div className="bg-white rounded-[10px] border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-[18px] font-semibold text-slate-900">
                      {isLoading ? "Loading company..." : profile?.company?.name || "Company"}
                    </h1>
                    <p className="text-[12px] text-slate-500 mt-1">
                      {profile?.company?.email || "No email"} {profile?.company?.contact_number ? ` | ${profile.company.contact_number}` : ""}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1">{profile?.company?.address || "No address"}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded border text-[11px] font-medium uppercase tracking-[0.06em] ${
                    profile?.company?.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {profile?.company?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">{kpi.label}</p>
                      <p className="text-[19px] font-semibold text-slate-900 leading-none mt-2">{kpi.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.tint}`}>
                      <kpi.icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-[13px] font-medium text-slate-900">Company Users</h2>
                  <button
                    onClick={openCreateUserModal}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add User
                  </button>
                </div>
                <div className="space-y-2.5">
                  {companyUsers?.length ? (
                    companyUsers.map((user) => (
                      <div key={user.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[13px] font-medium text-slate-700">{`${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed"}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{user.username}</p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-[0.06em] ${
                              user.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{user.role?.replace("_", " ")}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => openEditUserModal(user)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleUserStatusToggle(user)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150"
                          >
                            <Power className="w-3.5 h-3.5" /> {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[12px] text-slate-400">No users available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                <h2 className="text-[13px] font-medium text-slate-900 mb-3">Recent Customers</h2>
                <div className="space-y-2.5">
                  {profile?.recent?.customers?.length ? (
                    profile.recent.customers.map((customer) => (
                      <div key={customer.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                        <p className="text-[13px] font-medium text-slate-700">{customer.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Internet ID: {customer.internet_id}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{customer.is_active ? "Active" : "Inactive"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[12px] text-slate-400">No customers available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                <h2 className="text-[13px] font-medium text-slate-900 mb-3">Recent Invoices</h2>
                <div className="space-y-2.5">
                  {profile?.recent?.invoices?.length ? (
                    profile.recent.invoices.map((invoice) => (
                      <div key={invoice.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                        <p className="text-[13px] font-medium text-slate-700">{invoice.invoice_number}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">PKR {formatCurrency(invoice.total_amount)}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{invoice.status?.replace("_", " ")}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[12px] text-slate-400">No invoices available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal
        isVisible={isUserModalVisible}
        onClose={closeUserModal}
        title={editingUser ? "Edit Company User" : "Add Company User"}
        subtitle={editingUser ? "Update user details and permissions" : "Create a new user under this company"}
        isLoading={isSavingUser}
        footer={
          <>
            <button
              type="button"
              onClick={closeUserModal}
              className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="company-user-form"
              disabled={isSavingUser}
              className="px-4 py-2 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors duration-150"
            >
              {isSavingUser ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </button>
          </>
        }
      >
        <form id="company-user-form" onSubmit={handleSaveUser} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={userFormData.first_name}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={userFormData.last_name}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={userFormData.username}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={userFormData.email}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">Role</label>
              <select
                name="role"
                value={userFormData.role}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              >
                <option value="employee">Employee</option>
                <option value="auditor">Auditor</option>
                <option value="company_owner">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">Status</label>
              <select
                name="is_active"
                value={String(userFormData.is_active)}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">
                Password {editingUser ? "(optional)" : ""}
              </label>
              <input
                type="password"
                name="password"
                value={userFormData.password}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={userFormData.contact_number}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-slate-600 mb-1">CNIC</label>
              <input
                type="text"
                name="cnic"
                value={userFormData.cnic}
                onChange={handleUserInputChange}
                className="w-full px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CompanyProfilePage