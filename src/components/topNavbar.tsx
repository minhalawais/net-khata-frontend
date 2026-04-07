"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { Menu, Bell, ChevronDown, LogOut, User } from "lucide-react"
import { getToken, removeToken } from "../utils/auth.ts"
import { useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axiosConfig.ts"
import NetKhataLogo from "../assets/NetKhataLogo.tsx"

interface TopbarProps {
  toggleSidebar: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [userData, setUserData]           = useState<any>(null)
  const [imageLoadError, setImageLoadError] = useState(false)
  const dropdownRef                       = useRef<HTMLDivElement>(null)
  const navigate                          = useNavigate()
  const location                          = useLocation()

  useEffect(() => {
    fetchUserData()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const fetchUserData = async () => {
    try {
      const token    = getToken()
      const response = await axiosInstance.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserData(response.data)
      setImageLoadError(false)
    } catch (error) {
      console.error("Failed to fetch user data", error)
    }
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout")
    } catch (error) {
      console.error("Logout API call failed", error)
    } finally {
      removeToken()
      localStorage.clear()
      setIsProfileOpen(false)
      navigate("/login")
    }
  }

  // Build initials from user data
  const initials = userData
    ? `${userData.first_name?.[0] ?? ""}${userData.last_name?.[0] ?? ""}`.toUpperCase()
    : "?"

  const displayName = useMemo(() => {
    const first = userData?.first_name ?? ""
    const last  = userData?.last_name ?? ""
    const name = `${first} ${last}`.trim()
    return name || "User"
  }, [userData])

  const profilePictureUrl = useMemo(() => {
    if (!userData?.picture) return null
    const apiBase = (axiosInstance.defaults.baseURL as string | undefined) || window.location.origin
    const apiUrl = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase
    const path = userData.picture.startsWith("/") ? userData.picture.slice(1) : userData.picture
    return `${apiUrl}/${path}`
  }, [userData])

  const routeLabel = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean)
    if (!segments.length) return "Dashboard"
    const last = segments[segments.length - 1]
    return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }, [location.pathname])

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    /*
     * Skill 01 + 02 — Topbar is NOT fixed.
     * It is a flex-shrink-0 element inside the right-column flex container.
     * Fixed positioning was the cause of pt-20 everywhere. With flex-shrink-0
     * the topbar participates in normal flow — no padding hacks needed.
     *
     * h-14 matches the sidebar logo row height so they align visually.
     * bg-white border-b border-slate-200 — no shadow-sm (no decorative shadows).
     */
    <header className="
      h-14 flex-shrink-0 bg-white border-b border-[0.5px] border-slate-200
      flex items-center justify-between px-5
    ">

      {/* Left: hamburger + persistent logo + route context */}
      <div className="flex items-center gap-3 min-w-0">

        {/*
         * Skill 02 — hamburger: p-1.5 icon-button pattern
         * text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md
         * NOT: p-2 hover:bg-[#EBF5FF] rounded-md text-[#4A5568]
         */}
        <button
          onClick={toggleSidebar}
          className="
            p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100
            rounded-md transition-colors duration-150
          "
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/*
         * Keep brand identity visible at all times.
         * Compact height avoids visual competition with page content.
         */}
        <div className="flex items-center h-7 w-[126px] overflow-hidden flex-shrink-0">
          <NetKhataLogo variant="landscape" className="w-full h-full" />
        </div>

        <div className="hidden lg:block w-px h-5 bg-slate-200" />

        <div className="hidden lg:flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-slate-400">Module</span>
          <span className="text-slate-300">/</span>
          <span className="text-[12px] font-medium text-slate-700 truncate max-w-[220px]">{routeLabel}</span>
        </div>
      </div>

      {/* Right: notification bell + user profile */}
      <div className="flex items-center gap-2">

        {/*
         * Skill 02 — notification bell icon-button:
         * p-1.5 rounded-md, icon w-4 h-4
         * NOT: p-2 rounded-full, h-5 w-5
         *
         * Notification dot: absolute top-1 right-1, w-1.5 h-1.5 bg-rose-500
         */}
        <button
          title="Notifications"
          className="
          relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100
          rounded-md transition-colors duration-150
        "
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {/* Vertical divider */}
        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        {/*
         * User profile trigger
         *
         * Skill 02 — avatar: w-7 h-7 rounded-full bg-blue-100, initials text-[10px]
         * NOT: User icon inside a tinted circle with #3A86FF
         *
         * Name: text-[12px] font-medium text-slate-800
         * Role: text-[10px] text-slate-400
         * NOT: text-sm text-[#2A5C8A] / text-xs text-[#4A5568]/70
         */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="
              flex items-center gap-2 px-2 py-1.5
              text-slate-600 bg-white border border-[0.5px] border-transparent
              hover:bg-slate-100 hover:border-slate-200
              rounded-md transition-colors duration-150
            "
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
          >
            {/* Initials avatar */}
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {profilePictureUrl && !imageLoadError ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImageLoadError(true)}
                />
              ) : (
                <span className="text-[10px] font-medium text-blue-800 leading-none">
                  {initials}
                </span>
              )}
            </div>

            {/* Name + role — hidden on small screens */}
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-medium text-slate-800 leading-none">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                {userData?.role}
              </p>
            </div>

            {/* Chevron */}
            <ChevronDown className={`
              w-3.5 h-3.5 text-slate-400 flex-shrink-0
              transition-transform duration-150
              ${isProfileOpen ? "rotate-180" : ""}
            `} />
          </button>

          {/*
           * Profile dropdown
           *
           * Skill rules:
           * — No shadow-lg. Border only for separation: border border-slate-200
           * — bg-white rounded-[10px] (card radius)
           * — Menu items: text-[12px] text-slate-600 hover:bg-slate-100
           * — Danger item: text-rose-600 hover:bg-rose-50
           * — Divider: h-px bg-slate-100
           * — min-w-[180px] — enough to read the menu
           *
           * z-50 so it sits above page content.
           * right-0 aligns with the right edge of the trigger.
           * top-full mt-1.5 positions below the button with a small gap.
           */}
          {isProfileOpen && (
            <div className="
              absolute right-0 top-full mt-1.5 z-50
              min-w-[220px] bg-white
              rounded-[10px] border border-slate-200
              overflow-hidden
            ">

              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[12px] font-medium text-slate-800 leading-none">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 leading-none">
                  {userData?.email || userData?.role}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <p className="px-4 py-1 text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">Account</p>
                <button
                  onClick={() => { navigate("/profile"); setIsProfileOpen(false) }}
                  className="
                    flex items-center gap-2.5 w-full px-4 py-2.5
                    text-[12px] text-slate-600
                    hover:bg-slate-100 hover:text-slate-900
                    transition-colors duration-150
                  "
                >
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  Your profile
                </button>

              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Logout — danger variant */}
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="
                    flex items-center gap-2.5 w-full px-4 py-2.5
                    text-[12px] text-rose-600
                    hover:bg-rose-50 hover:text-rose-700
                    transition-colors duration-150
                  "
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  Sign out
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  )
}