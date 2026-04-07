"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Users,
  FileText,
  CreditCard,
  AlertCircle,
  Package,
  Truck,
  BarChart,
  Map,
  UserCheck,
  MessageSquare,
  CheckSquare,
  LogOut,
  Search,
  Clipboard,
  Banknote,
  Receipt,
  Network,
  DollarSign,
  TrendingUp,
  X,
  ChevronDown,
  PieChart,
  Activity,
  Settings,
  Layers,
  Briefcase,
  Wallet,
  Wrench,
  MapPin,
  Store,
  Shield,
  Building2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { removeToken } from "../utils/auth.ts"
import axiosInstance from "../utils/axiosConfig.ts"
import NetKhataLogo from "../assets/NetKhataLogo.tsx"

// ─── Persistent state keys — preserved exactly ────────────────────────────────
const SIDEBAR_OPEN_DROPDOWNS_KEY  = "sidebar_open_dropdowns"
const SIDEBAR_SCROLL_POSITION_KEY = "sidebar_scroll_position"

// ─── Menu registry — preserved exactly ───────────────────────────────────────
// All 8 groups, all sub-items, all paths, all icons — no content changes.
// Descriptions removed from render only (still in data for future use).

export const menuItems = [
  {
    title: "Reporting & Analytics",
    icon: BarChart,
    description: "Comprehensive business intelligence",
    allowedRoles: ["company_owner", "auditor"],
    isDropdown: true,
    subItems: [
      { title: "Executive Overview",    description: "High-level business summary",     path: "/reporting/executive",   icon: PieChart   },
      { title: "Financial Intelligence", description: "Revenue, costs, cashflow & collections", path: "/reporting/financial", icon: DollarSign },
      { title: "Service & Support",     description: "Support performance metrics",      path: "/reporting/service",     icon: Wrench     },
      { title: "Operations",            description: "Operational efficiency",           path: "/reporting/operations",  icon: Activity   },
    ],
  },
  {
    title: "Vendor & Employee",
    icon: Briefcase,
    description: "Vendors, employees & suppliers",
    isDropdown: true,
    subItems: [
      { title: "Employee Management", description: "Manage staff records",       path: "/employee-management",  icon: Users    },
      { title: "Vendor Management",   description: "Manage vendor profiles",     path: "/vendor-management",    icon: Store    },
      { title: "Supplier Management", description: "Supplier relationships",     path: "/supplier-management",  icon: Truck    },
      { title: "ISP Management",      description: "ISP company details",        path: "/isp-management",       icon: Network  },
    ],
  },
  {
    title: "Customer Management",
    icon: Users,
    description: "Customers & service plans",
    isDropdown: true,
    subItems: [
      { title: "Customer Management",      description: "Customer relationships",  path: "/customer-management",       icon: Users    },
      { title: "Service Plan Management",  description: "Manage service plans",    path: "/service-plan-management",   icon: FileText },
    ],
  },
  {
    title: "Payments",
    icon: DollarSign,
    description: "Payments, billing & finances",
    isDropdown: true,
    subItems: [
      { title: "Payment Management",  description: "Track customer payments",  path: "/payment-management",      icon: CreditCard  },
      { title: "ISP Payments",        description: "ISP payment tracking",     path: "/isp-payment-management",  icon: Network     },
      { title: "Billing & Invoices",  description: "Invoice management",       path: "/billing-invoices",        icon: Receipt     },
      { title: "Bank Accounts",       description: "Bank account management",  path: "/bank-management",         icon: Banknote    },
      { title: "Expense Management",  description: "Track expenses",           path: "/expense-management",      icon: DollarSign  },
      { title: "Extra Income",        description: "Additional income sources", path: "/extra-income-management", icon: TrendingUp  },
    ],
  },
  {
    title: "Complaint Management",
    icon: AlertCircle,
    description: "Complaints, tasks & recovery",
    isDropdown: true,
    subItems: [
      { title: "Complaint Management",  description: "Resolve customer issues", path: "/complaint-management",       icon: AlertCircle },
      { title: "Task Management",       description: "Organize tasks",          path: "/task-management",            icon: CheckSquare },
      { title: "Recovery Tasks",        description: "Recovery tracking",       path: "/recovery-task-management",   icon: UserCheck   },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    description: "Stock & equipment tracking",
    isDropdown: true,
    subItems: [
      { title: "Inventory Management", description: "Stock management", path: "/inventory-management", icon: Package },
    ],
  },
  {
    title: "Area Management",
    icon: Map,
    description: "Areas & sub-zones",
    isDropdown: true,
    subItems: [
      { title: "Area / Zone Management", description: "Manage main areas",  path: "/area-zone-management", icon: Map    },
      { title: "Sub-Zones",              description: "Manage sub-zones",   path: "/sub-zones-management",  icon: Layers },
    ],
  },
  {
    title: "Company Control",
    icon: Building2,
    description: "Company and tenant management",
    isDropdown: true,
    allowedRoles: ["super_admin"],
    subItems: [
      { title: "Overview", description: "Platform-wide overview", path: "/super-admin/overview", icon: PieChart },
      { title: "Company Management", description: "Manage companies", path: "/company-management", icon: Building2 },
    ],
  },
  {
    title: "Admin",
    icon: Shield,
    description: "Messaging, logs & settings",
    isDropdown: true,
    subItems: [
      { title: "Messaging",          description: "Internal messaging",   path: "/message-management",  icon: MessageSquare },
      { title: "WhatsApp Queue",     description: "Message queue",        path: "/whatsapp/queue",       icon: MessageSquare },
      { title: "Bulk Sender",        description: "Send bulk messages",   path: "/whatsapp/bulk-sender", icon: MessageSquare },
      { title: "WhatsApp Settings",  description: "Configure WhatsApp",   path: "/whatsapp/settings",    icon: Settings      },
      { title: "Logs Management",    description: "View system logs",     path: "/logs-management",      icon: Clipboard     },
    ],
  },
]

// ─── Types — preserved exactly ────────────────────────────────────────────────

interface SidebarProps {
  isOpen:        boolean
  toggleSidebar: () => void
  setIsOpen?:    React.Dispatch<React.SetStateAction<boolean>>
}

// ─── Sidebar Component ────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, setIsOpen }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole] = useState<string>(() => localStorage.getItem("role") || "")
  const location  = useLocation()
  const navigate  = useNavigate()
  const navRef    = useRef<HTMLElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)

  // Persistent open dropdowns — logic preserved exactly
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_OPEN_DROPDOWNS_KEY)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  // Persist open dropdowns — logic preserved exactly
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_OPEN_DROPDOWNS_KEY, JSON.stringify(openDropdowns)) }
    catch (e) { console.error("Failed to save sidebar state:", e) }
  }, [openDropdowns])

  // Scroll position persistence — logic preserved exactly
  const saveScrollPosition = useCallback(() => {
    if (navRef.current) {
      const position = navRef.current.scrollTop
      try { localStorage.setItem(SIDEBAR_SCROLL_POSITION_KEY, position.toString()) }
      catch (e) { console.error("Failed to save scroll position:", e) }
    }
  }, [])

  // Mobile detection — logic preserved exactly
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Click-outside close on mobile — logic preserved exactly
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && setIsOpen) {
        const sidebar = document.getElementById("sidebar")
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile, isOpen, setIsOpen])

  // Filter logic — preserved exactly
  const roleFilteredItems = menuItems.filter((item: any) => {
    if (userRole === "super_admin") {
      return !!item.allowedRoles?.includes("super_admin")
    }
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true
    return item.allowedRoles.includes(userRole)
  })

  const filteredMenuItems = roleFilteredItems.filter(item => {
    if (item.title.toLowerCase().includes(searchQuery.toLowerCase())) return true
    if (item.subItems?.some(sub => sub.title.toLowerCase().includes(searchQuery.toLowerCase()))) return true
    return false
  })

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout")
      removeToken()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const toggleDropdown = (title: string) => {
    setOpenDropdowns(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  const handleLinkClick = () => {
    if (isMobile && setIsOpen) setIsOpen(false)
    saveScrollPosition()
  }

  const isDropdownActive = (item: typeof menuItems[0]) =>
    item.subItems?.some(sub => location.pathname === sub.path)

  /*
   * shouldExpand logic — preserved exactly:
   * Mobile: expands only when isOpen=true (explicit toggle)
   * Desktop: expands when isOpen OR when hovered
   */
  const shouldExpand = isMobile ? isOpen : (isOpen || isHovered)

  // Restore saved scroll position when the sidebar becomes expanded/open.
  // This ensures the nav stays at the previous scroll location after navigation.
  useEffect(() => {
    if (!shouldExpand) return
    try {
      const raw = localStorage.getItem(SIDEBAR_SCROLL_POSITION_KEY)
      const pos = raw ? parseInt(raw, 10) : 0
      if (!isNaN(pos) && navRef.current) {
        // Apply on next animation frame so DOM/layout is ready.
        requestAnimationFrame(() => { if (navRef.current) navRef.current.scrollTop = pos })
      }
    } catch (e) {
      /* ignore */
    }
  }, [shouldExpand])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/*
       * Mobile overlay
       * Skill 07 — no backdrop-blur (no blur effects in system)
       * bg-black/50 only. Full screen (inset-0), not just below topbar.
       */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      {/*
       * SIDEBAR SHELL
       *
       * Skill 02 — bg-[#020617] (slate-950) dark background. NOT:
       *   — bg-gradient-to-b from-white to-slate-50 (gradient violation)
       *   — bg-white (wrong — sidebar must be dark)
       *
       * Position: fixed top-0 left-0 h-screen — full height from top.
       * The logo row (h-14) aligns with the Topbar (also h-14) visually.
       * NOT top-14 h-[calc(100vh-3.5rem)] — that was compensating for old fixed topbar.
       *
      * Width: w-[220px] expanded, w-[60px] collapsed (NOT w-72/w-20)
      * 220px aligns with page shell offsets and keeps labels readable.
       *
       * No shadow-xl — no decorative shadows.
       * border-r border-white/[0.06] — subtle right border on dark bg.
       *
       * transition-all duration-200 — Skill 07: max duration-200 for UI transitions.
       */}
      <aside
        id="sidebar"
        className={`
          fixed top-0 left-0 h-screen
          bg-[#020617]
          border-r border-white/[0.06]
          flex flex-col
          transition-all duration-200 ease-in-out
          overflow-hidden
          ${shouldExpand ? "w-[220px]" : "w-[60px]"}
          ${isMobile ? "z-50" : "z-30"}
          ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
        `}
        onMouseEnter={() => { if (!isMobile) setIsHovered(true)  }}
        onMouseLeave={() => { if (!isMobile) { setIsHovered(false); saveScrollPosition() } }}
      >

        {/*
         * LOGO ROW
         *
         * Skill 02 — h-14 to align with Topbar.
         * border-b border-white/[0.06] — divides logo from nav.
         * px-4 padding.
         *
         * Collapsed: shows "N" initial in blue-400.
         * Expanded: shows full NetKhataLogo.
         */}
        <div className="flex items-center h-14 px-4 border-b border-white/[0.06] flex-shrink-0">
          {shouldExpand ? (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <NetKhataLogo variant="landscape" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              {/* Collapsed state — single letter monogram */}
              <span className="text-blue-400 font-semibold text-[14px]">N</span>
            </div>
          )}

          {/* Mobile close button */}
          {isMobile && isOpen && (
            <button
              onClick={() => setIsOpen && setIsOpen(false)}
              className="
                ml-auto p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]
                rounded-md transition-colors duration-150
              "
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/*
         * SEARCH BAR — shown only when expanded
         *
         * Skill 10 — input: h-9 rounded-md
         * Background on dark sidebar: bg-white/[0.06] border border-white/[0.08]
         * Text: text-slate-200, placeholder: text-slate-500
         * Focus ring: focus:ring-blue-500/[0.25] focus:border-blue-500/[0.50]
         * NOT: bg-white rounded-xl shadow-sm
         */}
        {shouldExpand && (
          <div className="px-3 py-3 border-b border-white/[0.06] flex-shrink-0 space-y-2">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-[0.08em] px-0.5">Navigation</p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="
                  w-full h-9 pl-8 pr-3
                  bg-white/[0.06] border border-white/[0.08]
                  text-[12px] text-slate-200 placeholder:text-slate-500
                  rounded-md
                  focus:outline-none focus:border-blue-500/[0.50] focus:ring-1 focus:ring-blue-500/[0.25]
                  transition-colors duration-150
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/*
         * NAV — flex-1 overflow-y-auto
         *
         * Scrollbar: thin, dark-themed (white/12% thumb, transparent track)
         * py-2 px-2 spacing
         * space-y-0.5 between items
         */}
        <nav
          ref={navRef}
          onScroll={saveScrollPosition}
          className="flex-1 overflow-y-auto py-3 px-2 sidebar-nav"
        >
          {filteredMenuItems.map((item, index) => {
            const isActive       = isDropdownActive(item)
            const isDropdownOpen = openDropdowns.includes(item.title)
            const Icon           = item.icon

            return (
              <div key={index} className="mb-1">

                {/*
                 * GROUP HEADER BUTTON
                 *
                 * Skill 02 — exact states:
                 *
                 * Active (any sub-item matches current path):
                 *   bg-blue-600/[0.14] text-blue-300
                 *   + absolute left-0 w-0.5 h-4 bg-blue-400 rounded-r indicator
                 *
                 * Open but not active:
                 *   bg-white/[0.04] text-slate-200
                 *
                 * Default:
                 *   text-slate-400 hover:bg-white/[0.04] hover:text-slate-200
                 *
                 * NOT: bg-gradient-to-r from-blue-600 to-blue-500 (gradient)
                 * NOT: text-white (too bright, no separation from active tint)
                 * NOT: shadow-lg shadow-blue-500/25 (shadow violation)
                 *
                 * Icon: w-4 h-4 (NOT h-5 w-5)
                 * Text: text-[12px] font-medium (NOT text-sm font-semibold)
                 * NO description text shown
                 * NO icon wrapper with gradient bg
                 */}
                <button
                  onClick={() => shouldExpand && toggleDropdown(item.title)}
                  className={`
                    relative flex items-center w-full
                    px-3 py-2 rounded-md
                    transition-colors duration-150
                    group
                    ${shouldExpand ? "" : "justify-center"}
                    ${isActive
                      ? "bg-blue-600/[0.14] text-blue-300"
                      : isDropdownOpen
                        ? "bg-white/[0.04] text-slate-200"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    }
                  `}
                >
                  {/* Left edge active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-400 rounded-r" />
                  )}

                  {/*
                   * Icon — w-4 h-4, flex-shrink-0
                   * Active: text-blue-400
                   * Default: text-slate-500 group-hover:text-slate-300
                   */}
                  <span className={`
                    w-4 h-4 flex-shrink-0 flex items-center justify-center
                    ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}
                  `}>
                    <Icon className="w-4 h-4" />
                  </span>

                  {/* Label + chevron — only when expanded */}
                  {shouldExpand && (
                    <>
                      <span className={`
                        flex-1 ml-2.5 text-[12px] font-medium truncate text-left
                        ${isActive ? "text-blue-300" : ""}
                      `}>
                        {item.title}
                      </span>

                      {/* Chevron — rotates when dropdown is open */}
                      <ChevronDown className={`
                        w-3.5 h-3.5 flex-shrink-0 ml-1
                        transition-transform duration-150
                        ${isActive ? "text-blue-400" : "text-slate-600"}
                        ${isDropdownOpen ? "rotate-180" : ""}
                      `} />
                    </>
                  )}

                  {/* Tooltip — collapsed desktop only */}
                  {!shouldExpand && !isMobile && (
                    <div className="
                      absolute left-full ml-2 px-2.5 py-1.5
                      bg-slate-800 text-slate-100 text-[11px] font-medium
                      rounded-md whitespace-nowrap
                      opacity-0 group-hover:opacity-100
                      pointer-events-none transition-opacity duration-150 z-50
                    ">
                      {item.title}
                    </div>
                  )}
                </button>

                {/*
                 * SUB-ITEMS — shown when expanded + dropdown open
                 *
                 * Layout: ml-4 pl-2 border-l border-white/[0.06] space-y-0.5
                 * This creates the indented tree structure.
                 *
                 * Sub-item active:
                 *   bg-blue-600/[0.14] text-blue-300
                 *   + left edge indicator (absolute left-0)
                 *
                 * Sub-item default:
                 *   text-slate-400 hover:bg-white/[0.04] hover:text-slate-200
                 *
                 * NOT: border-l-2 border-blue-500 -ml-[2px] pl-[14px] (hacky negative margin)
                 * NOT: animate-pulse dot on active item (Skill 07: only LiveIndicator can loop)
                 *
                 * Icon: w-3.5 h-3.5 (slightly smaller than group icon)
                 * Text: text-[12px] font-medium
                 * NO description text
                 */}
                {shouldExpand && isDropdownOpen && item.subItems && (
                  <div className="mt-1 ml-4 pl-2 border-l border-white/[0.06] space-y-0.5">
                    {item.subItems
                      .filter(sub =>
                        !searchQuery ||
                        sub.title.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((subItem, subIndex) => {
                        const SubIcon   = subItem.icon
                        const isSubActive = location.pathname === subItem.path

                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            onClick={handleLinkClick}
                            className={`
                              relative flex items-center gap-2
                              px-2.5 py-1.5 rounded-md
                              transition-colors duration-150 group
                              ${isSubActive
                                ? "bg-blue-600/[0.14] text-blue-300"
                                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                              }
                            `}
                          >
                            {/* Left edge indicator for active sub-item */}
                            {isSubActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-blue-400 rounded-r" />
                            )}

                            {/* Sub-icon — w-3.5 h-3.5 */}
                            <SubIcon className={`
                              w-3.5 h-3.5 flex-shrink-0
                              ${isSubActive
                                ? "text-blue-400"
                                : "text-slate-600 group-hover:text-slate-400"
                              }
                            `} />

                            {/* Sub-label */}
                            <span className="text-[12px] font-medium truncate">
                              {subItem.title}
                            </span>
                          </Link>
                        )
                      })}
                  </div>
                )}

              </div>
            )
          })}
        </nav>

        {/*
         * FOOTER — logout button
         *
         * Skill 02 — border-t border-white/[0.06] p-3
         * Logout: text-slate-400 hover:text-rose-400 hover:bg-white/[0.04]
         * NOT: hover:bg-red-50 hover:text-red-600 (those are light-mode semantic colors)
         * On dark bg, hover:bg-white/[0.04] keeps the subtle tint system consistent.
         * rounded-md (NOT rounded-xl)
         */}
        <div className={`
          flex-shrink-0 border-t border-white/[0.06] p-3
          ${!shouldExpand ? "flex flex-col items-center" : ""}
        `}>
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={`
                mb-2 rounded-md transition-colors duration-150
                text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]
                ${shouldExpand ? "w-full px-3 py-2 flex items-center justify-center" : "p-2"}
              `}
              title={shouldExpand ? "Collapse sidebar" : "Expand sidebar"}
            >
              {shouldExpand ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={handleLogout}
            className={`
              relative flex items-center rounded-md
              transition-colors duration-150 group
              text-slate-400 hover:text-rose-400 hover:bg-white/[0.04]
              ${shouldExpand ? "w-full px-3 py-2 gap-2.5" : "p-2"}
            `}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />

            {shouldExpand && (
              <span className="text-[12px] font-medium">Sign out</span>
            )}

            {/* Tooltip for collapsed state */}
            {!shouldExpand && !isMobile && (
              <div className="
                absolute left-full ml-2 px-2.5 py-1.5
                bg-slate-800 text-slate-100 text-[11px] font-medium
                rounded-md whitespace-nowrap
                opacity-0 group-hover:opacity-100
                pointer-events-none transition-opacity duration-150 z-50
              ">
                Sign out
              </div>
            )}
          </button>
        </div>

      </aside>

      {/*
       * Scrollbar styles — inline because they apply only to .sidebar-nav.
       * Dark-appropriate colors: white/12% thumb on transparent track.
       * 4px width — thin enough to not intrude.
       * The original used slate-200 colors which are light-mode colors —
       * on the dark sidebar these would look jarring.
       */}
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.20);
        }
      `}</style>
    </>
  )
}