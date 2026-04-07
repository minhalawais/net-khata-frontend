"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2, Users, UserCircle2, CreditCard, Wallet, PlusCircle, RefreshCw } from "lucide-react"

import axiosInstance from "../utils/axiosConfig.ts"
import { Sidebar } from "../components/sideNavbar.tsx"
import { Topbar } from "../components/topNavbar.tsx"
import { toast } from "../utils/toast.ts"

interface OverviewPayload {
  summary: {
    total_companies: number
    active_companies: number
    total_users: number
    total_customers: number
    active_customers: number
    total_collections: number
    total_expenses: number
    total_extra_income: number
  }
  companies: Array<{
    id: string
    name: string
    email?: string
    contact_number?: string
    is_active: boolean
    users_count: number
    customers_count: number
    invoices_count: number
    created_at?: string
  }>
}

const formatCurrency = (value: number) =>
  `PKR ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value || 0)}`

const SuperAdminOverview: React.FC = () => {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [payload, setPayload] = useState<OverviewPayload | null>(null)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/dashboard/super-admin-overview")
      setPayload(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load super admin overview")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = "Super Admin Overview | Net Khata"
    fetchData()
  }, [])

  const cards = useMemo(() => {
    const s = payload?.summary
    return [
      { label: "Total Companies", value: s?.total_companies ?? 0, icon: Building2, tint: "bg-blue-50 text-blue-700" },
      { label: "Total Users", value: s?.total_users ?? 0, icon: Users, tint: "bg-emerald-50 text-emerald-700" },
      { label: "Total Customers", value: s?.total_customers ?? 0, icon: UserCircle2, tint: "bg-violet-50 text-violet-700" },
      { label: "Collections", value: formatCurrency(s?.total_collections ?? 0), icon: CreditCard, tint: "bg-amber-50 text-amber-700" },
      { label: "Expenses", value: formatCurrency(s?.total_expenses ?? 0), icon: Wallet, tint: "bg-rose-50 text-rose-700" },
    ]
  }, [payload])

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setIsOpen={setIsSidebarOpen} />

      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${
          isSidebarOpen ? "lg:pl-[220px]" : "lg:pl-[60px]"
        }`}
      >
        <div className="flex-shrink-0">
          <Topbar toggleSidebar={toggleSidebar} />
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-100 px-6 py-5">
          <div className="max-w-[1400px] mx-auto space-y-5">
            <div className="bg-white rounded-[10px] border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-[18px] font-semibold text-slate-900">Super Admin Overview</h1>
                  <p className="text-[12px] text-slate-500 mt-1">Cross-company operational and financial snapshot</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/company-management")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                  >
                    <PlusCircle className="w-4 h-4" /> Manage Companies
                  </button>
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors duration-150"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">{card.label}</p>
                      <p className="text-[18px] font-semibold text-slate-900 leading-none mt-2">{card.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.tint}`}>
                      <card.icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-[10px] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-[13px] font-medium text-slate-900">Companies</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Latest registered companies with managed data counts</p>
              </div>

              {!payload?.companies?.length ? (
                <div className="px-5 py-10 text-center text-[13px] text-slate-500">No companies found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {[
                          "Company",
                          "Email",
                          "Contact",
                          "Users",
                          "Customers",
                          "Invoices",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payload.companies.map((company) => (
                        <tr key={company.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors duration-150">
                          <td className="px-4 py-3 text-[13px] font-medium text-slate-700">{company.name}</td>
                          <td className="px-4 py-3 text-[13px] text-slate-600">{company.email || "-"}</td>
                          <td className="px-4 py-3 text-[13px] text-slate-600">{company.contact_number || "-"}</td>
                          <td className="px-4 py-3 text-[13px] text-slate-700 tabular-nums">{company.users_count}</td>
                          <td className="px-4 py-3 text-[13px] text-slate-700 tabular-nums">{company.customers_count}</td>
                          <td className="px-4 py-3 text-[13px] text-slate-700 tabular-nums">{company.invoices_count}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-[0.06em] ${
                                company.is_active
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {company.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/companies/${company.id}`)}
                              className="px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SuperAdminOverview