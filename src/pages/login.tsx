import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Lock, User, LogIn, Zap, Shield, LineChart, Send, ArrowRight } from "lucide-react"
import NetKhataLogo from "../assets/NetKhataLogo.tsx"
import axiosInstance from "../utils/axiosConfig.ts"

const FEATURES = [
  {
    icon: Shield,
    label: "Role-Based Portals",
    description:
      "One platform, every role. Dedicated dashboards for Company Owners, Technicians, Employees, and Customers.",
  },
  {
    icon: Zap,
    label: "Automated Billing & Collections",
    description:
      "Generate invoices in bulk, track doorstep cash payments in real-time, and auto-assign overdue accounts.",
  },
  {
    icon: LineChart,
    label: "Real-time Financial Analysis",
    description:
      "Get crystal-clear visibility into your cash flow, bank balances, and financial reconciliation instantly.",
  },
  {
    icon: Send,
    label: "Automated Invoicing",
    description:
      "Seamlessly dispatch professional invoices to customers via WhatsApp and email without manual intervention.",
  },
]

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "NetDaftar OS - Secure Login"
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password,
      })

      const data = response.data

      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
      localStorage.setItem("company_id", data.company_id)
      localStorage.setItem("id", data.id)

      if (data.role === "company_owner" || data.role === "super_admin" || data.role === "auditor") {
        navigate("/reporting-analytics")
      } else if (data.role === "employee") {
        navigate("/employee-portal")
      }
    } catch (err: any) {
      console.error("Login failed", err)
      setError("Invalid credentials. Please verify your username and password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* ───────── RIGHT PANEL — Authentication Form (40%) ───────── */}
      <div
        className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 sm:px-10 lg:px-16"
        style={{
          backgroundColor: "#FFFFFF", // Pure stark white for enterprise minimalism
          animation: "loginFadeIn 600ms ease-out both"
        }}
      >
        <div className="w-full max-w-[360px] mx-auto relative">

          {/* Mobile-only logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <NetKhataLogo variant="landscape" style={{ height: "48px" }} />
          </div>

          <div className="mb-10 hidden lg:block">
            <NetKhataLogo variant="icon" style={{ height: "100px" }} />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-semibold tracking-tight" style={{ color: "#0F172A" }}>
              Sign in
            </h2>
            <p className="text-[14px] mt-2" style={{ color: "#64748B" }}>
              Welcome back to NetDaftar OS.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Username Input */}
              <div>
                <label htmlFor="login-username" className="block text-[13px] font-medium mb-2" style={{ color: "#334155" }}>
                  Username
                </label>
                <div className="relative group">
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full px-3.5 py-3 text-[14px] rounded-lg
                             transition-all duration-200 ease-out
                             focus:outline-none focus:ring-0"
                    style={{
                      color: "#0F172A",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#2563EB"
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E2E8F0"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                    placeholder="admin@isp"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="block text-[13px] font-medium" style={{ color: "#334155" }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[13px] font-medium transition-colors duration-150"
                    style={{ color: "#2563EB" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1D4ED8")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2563EB")}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    id="login-password"
                    type={isPasswordVisible ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-3.5 pr-10 py-3 text-[14px] rounded-lg
                             transition-all duration-200 ease-out
                             focus:outline-none focus:ring-0"
                    style={{
                      color: "#0F172A",
                      border: "1px solid #E2E8F0",
                      backgroundColor: "#FFFFFF",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#2563EB"
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E2E8F0"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors duration-200"
                    style={{ color: "#94A3B8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#2563EB")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                className="text-[13px] py-3 flex items-start"
                style={{ color: "#E11D48" }}
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-[14px] font-medium text-white
                       transition-all duration-200 ease-out
                       focus:outline-none focus:ring-2 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              style={{ backgroundColor: "#2563EB" }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#1D4ED8"
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = "#2563EB"
              }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </div>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        </div>
      </div>


      {/* ───────── LEFT PANEL — Brand Showcase (60%) ───────── */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col justify-between p-12 xl:p-16 border-l border-white/[0.05]"
        style={{
          backgroundColor: "#0F172A", // Softened from slate-950 to slate-900 (bg-header)
          backgroundImage: `
            radial-gradient(circle at 15% 40%, rgba(37, 99, 235, 0.08) 0%, transparent 60%),
            radial-gradient(circle, rgba(148,163,184,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 24px 24px",
        }}
      >
        {/* Top — Logo in Badge */}
        <div>
          <div className="inline-block bg-white rounded-xl px-3.5 py-2.5 shadow-sm">
            <NetKhataLogo variant="landscape" style={{ height: "32px" }} />
          </div>
        </div>

        {/* Center — Headline + Structured Feature Grid */}
        <div className="max-w-xl z-10">
          <h1
            className="text-[44px] xl:text-[50px] font-medium leading-[1.1] tracking-tight"
            style={{ color: "#FFFFFF" }}
          >
            ISP Management.
            <br />
            Simplified.
          </h1>
          <p
            className="mt-6 text-[15px] xl:text-[17px] leading-relaxed max-w-lg"
            style={{ color: "#94A3B8" }}
          >
            The complete operating ecosystem to manage billing, customers, network
            infrastructure, and technical operations — all from a single pane of glass.
          </p>

          {/* Feature Grid with Translucent Cards */}
          <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.label}
                  className="flex items-start gap-4 p-4 rounded-[14px] transition-colors duration-200 group"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors duration-200"
                    style={{ backgroundColor: "rgba(37,99,235,0.15)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#60A5FA" }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium leading-snug mb-1.5" style={{ color: "#F8FAFC" }}>
                      {feature.label}
                    </h3>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#64748B" }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Login

