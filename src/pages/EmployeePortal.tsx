"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getToken } from "../utils/auth.ts"
import axiosInstance from "../utils/axiosConfig.ts"
import {
  LayoutDashboard,
  User,
  ClipboardList,
  AlertCircle,
  Users,
  Wallet,
  Box,
  RefreshCw,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react"

// Components
import { PortalDashboard } from "../components/employee-portal/PortalDashboard.tsx"
import { PortalProfile } from "../components/employee-portal/PortalProfile.tsx"
import { PortalTasks } from "../components/employee-portal/PortalTasks.tsx"
import { PortalComplaints } from "../components/employee-portal/PortalComplaints.tsx"
import { PortalCustomers } from "../components/employee-portal/PortalCustomers.tsx"
import { PortalFinancial } from "../components/employee-portal/PortalFinancial.tsx"
import { PortalInventory } from "../components/employee-portal/PortalInventory.tsx"
import { PortalRecoveries } from "../components/employee-portal/PortalRecoveries.tsx"

interface EmployeeProfile {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  picture: string | null
}

interface DashboardStats {
  pending_tasks: number
  open_complaints: number
  pending_recoveries: number
  // Other fields exist but these are what we map to badges
}

type SectionType = "dashboard" | "profile" | "tasks" | "complaints" | "customers" | "financial" | "inventory" | "recoveries"

const sections = [
  { id: "dashboard" as SectionType, name: "Dashboard", icon: LayoutDashboard },
  { id: "tasks" as SectionType, name: "My Tasks", icon: ClipboardList },
  { id: "complaints" as SectionType, name: "Complaints", icon: AlertCircle },
  { id: "customers" as SectionType, name: "Customers", icon: Users },
  { id: "recoveries" as SectionType, name: "Recoveries", icon: RefreshCw },
  { id: "financial" as SectionType, name: "Financial", icon: Wallet },
  { id: "inventory" as SectionType, name: "Inventory", icon: Box },
  { id: "profile" as SectionType, name: "My Profile", icon: User },
]

export default function EmployeePortal() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SectionType>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [sidebarStats, setSidebarStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileAndStats = async () => {
    try {
      const token = getToken()
      const [profileRes, statsRes] = await Promise.all([
        axiosInstance.get("/employee-portal/profile", { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/employee-portal/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setProfile(profileRes.data)
      setSidebarStats(statsRes.data)
    } catch (error) {
      console.error("Failed to fetch portal data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatsOnly = async () => {
    try {
      const token = getToken()
      const statsRes = await axiosInstance.get("/employee-portal/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      setSidebarStats(statsRes.data)
    } catch (error) {
      console.error("Failed to refresh stats:", error)
    }
  }

  useEffect(() => {
    fetchProfileAndStats()

    const handleRefreshStats = () => {
      fetchStatsOnly()
    }
    window.addEventListener("refresh-portal-stats", handleRefreshStats)

    return () => {
      window.removeEventListener("refresh-portal-stats", handleRefreshStats)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <PortalDashboard />
      case "profile":
        return <PortalProfile onProfileUpdate={fetchProfileAndStats} />
      case "tasks":
        return <PortalTasks />
      case "complaints":
        return <PortalComplaints />
      case "customers":
        return <PortalCustomers />
      case "financial":
        return <PortalFinancial />
      case "inventory":
        return <PortalInventory />
      case "recoveries":
        return <PortalRecoveries />
      default:
        return <PortalDashboard />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-[10px] p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Topbar */}
      <header className="hidden lg:flex bg-white border-b border-slate-200 px-6 py-3 items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[15px] font-medium text-slate-900">Employee Portal</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="text-[12px] text-slate-500">
            {sections.find((s) => s.id === activeSection)?.name}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-slate-500">
            Welcome, <span className="font-medium">{profile?.first_name}</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {profile?.first_name?.charAt(0) || "E"}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md hover:bg-slate-100 transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-[15px] font-medium text-slate-900">Employee Portal</h1>
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-medium text-sm">
          {profile?.first_name?.charAt(0) || "E"}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:top-[57px] lg:h-[calc(100vh-57px)] ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold">
                {profile?.first_name?.charAt(0) || "E"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-900 truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-[11px] text-slate-500 capitalize truncate">{profile?.role?.replace("_", " ")}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              
              let badgeCount: number | null = null
              if (sidebarStats) {
                if (section.id === "tasks") badgeCount = sidebarStats.pending_tasks || 0
                if (section.id === "complaints") badgeCount = sidebarStats.open_complaints || 0
                if (section.id === "recoveries") badgeCount = sidebarStats.pending_recoveries || 0
              }

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id)
                    setIsSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{section.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {badgeCount !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-colors ${
                        isActive
                          ? "bg-blue-200 text-blue-800"
                          : badgeCount > 0
                            ? "bg-rose-100/80 text-rose-600"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}>
                        {badgeCount}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Logout (mobile only, desktop has it in topbar) */}
          <div className="p-3 border-t border-slate-200 lg:hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-[calc(100vh-57px)] bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Section Title */}
            <div className="lg:hidden mb-4">
              <h1 className="text-[18px] font-medium text-slate-900">
                {sections.find((s) => s.id === activeSection)?.name}
              </h1>
            </div>

            {/* Content Area */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

