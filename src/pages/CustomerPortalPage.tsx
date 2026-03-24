"use client"

import type React from "react"
import { useState } from "react"
import axiosInstance from "../utils/axiosConfig.ts"
import NetKhataLogo from "../assets/NetKhataLogo.tsx"
import SEOHead from "../components/SEOHead.tsx"
import {
  User,
  CreditCard,
  FileText,
  Phone,
  Mail,
  MapPin,
  Wifi,
  Calendar,
  AlertCircle,
  DollarSign,
  Package,
  Search,
  Shield,
  Globe,
  IdCard,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  X,
  Image,
  Receipt,
  Building,
  Hash,
} from "lucide-react"

interface CustomerData {
  customer: {
    id: string
    name: string
    email: string
    internet_id: string
    phone_1: string
    phone_2: string | null
    cnic: string
    installation_address: string
    area: string | null
    sub_zone: string | null
    isp: string | null
    connection_type: string | null
    installation_date: string | null
    is_active: boolean
    recharge_date: string | null
  }
  packages: Array<{
    name: string
    price: number
    speed_mbps: number | null
    start_date: string | null
  }>
  invoices: Array<{
    id: string
    invoice_number: string
    billing_start_date: string | null
    billing_end_date: string | null
    due_date: string | null
    total_amount: number
    status: string
    paid_amount: number
    remaining: number
  }>
  payments: Array<{
    id: string
    amount: number
    payment_date: string | null
    payment_method: string
    status: string
    invoice_id: string | null
    invoice_number: string | null
    transaction_id: string | null
    payment_proof: string | null
    failure_reason: string | null
    bank_account: string | null
    created_at: string | null
  }>
  complaints: Array<{
    id: string
    ticket_number: string
    description: string
    status: string
    created_at: string | null
    resolved_at: string | null
  }>
  summary: {
    total_due: number
    total_paid: number
    invoice_count: number
    payment_count: number
    open_complaints: number
  }
}

type Payment = CustomerData['payments'][0]

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  pending: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  overdue: { bg: "bg-rose-50", text: "text-rose-700", icon: XCircle },
  draft: { bg: "bg-slate-100", text: "text-slate-600", icon: Clock },
  verified: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  open: { bg: "bg-rose-50", text: "text-rose-700", icon: AlertCircle },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  resolved: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
  closed: { bg: "bg-slate-100", text: "text-slate-600", icon: CheckCircle },
  failed: { bg: "bg-rose-50", text: "text-rose-700", icon: XCircle },
}

export default function CustomerPortalPage() {
  const [cnic, setCnic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CustomerData | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const formatCnic = (value: string) => {
    const digits = value.replace(/\D/g, "")
    return digits.slice(0, 13)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (cnic.length !== 13) {
      setError("CNIC must be exactly 13 digits")
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post("/public/customer/lookup", { cnic })
      setData(response.data)
    } catch (err: any) {
      console.error("Lookup error:", err)
      setError(err.response?.data?.error || "Failed to look up customer. Please try again.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setData(null)
    setCnic("")
    setActiveTab("overview")
  }

  const handleViewInvoice = (invoiceId: string) => {
    window.open(`/public/invoice/${invoiceId}`, '_blank')
  }

  // Lookup Form Screen
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <SEOHead
          title="Customer Portal"
          description="Access the Net Khata customer portal to view your invoices, payments, and account status using your CNIC."
          canonical="/customer-portal"
        />
        <div className="max-w-md w-full mx-4">
          {/* Card */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 bg-slate-50">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-[10px] mb-4 border border-blue-200">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <h1 className="text-[18px] font-medium text-slate-900">Customer Portal</h1>
              <p className="text-slate-500 text-[12px] mt-1">View your account details</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 mb-2">
                    CNIC Number
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(formatCnic(e.target.value))}
                      className="w-full pl-10 pr-4 h-11 border border-slate-200 rounded-md text-[15px] font-mono tracking-wide text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="0000000000000"
                      maxLength={13}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 text-right">{cnic.length}/13 digits</p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-700 text-[12px]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || cnic.length !== 13}
                  className="w-full h-11 text-white font-medium text-[13px] rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Looking Up...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      View My Account
                    </>
                  )}
                </button>
              </form>

              {/* Security Note */}
              <div className="mt-6 flex items-start gap-3 p-4 rounded-[10px] border border-slate-200 bg-slate-50">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                <div className="text-[11px] text-slate-500">
                  <p className="font-medium text-slate-700 mb-1">Secure Access</p>
                  <p>Your CNIC is used only for verification purposes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <div className="inline-block scale-90 opacity-80">
              <NetKhataLogo variant="landscape" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Customer Profile Screen
  const customer = data.customer
  const tabs = [
    { id: "overview", name: "Overview", icon: User },
    { id: "invoices", name: "Invoices", icon: FileText },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "complaints", name: "Complaints", icon: AlertCircle },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead
        title={`Portal: ${customer.name}`}
        description={`Customer portal for ${customer.name} - ${customer.internet_id}. View billings and account details.`}
        noIndex={true}
      />
      {/* White Top Navbar with Logo */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-between">
          <div className="h-10 w-48 flex items-center">
            <NetKhataLogo variant="landscape" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">Customer Portal</span>
          </div>
        </div>
      </nav>

      {/* Customer Info Bar */}
      <div className="py-4 px-4">
        <div className="max-w-[1400px] mx-auto bg-white border border-slate-200 rounded-[10px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-md border border-blue-200 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-medium text-[15px] text-slate-900">{customer.name}</h1>
              <p className="text-[11px] text-slate-500">{customer.internet_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-[11px] font-medium border ${customer.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
              {customer.is_active ? "Active" : "Inactive"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 h-9 px-4 text-[12px] border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 pb-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-[0.06em]">Total Due</p>
                <p className={`text-2xl font-bold ${data.summary.total_due > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  PKR {data.summary.total_due.toLocaleString()}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${data.summary.total_due > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                <DollarSign className={`w-5 h-5 ${data.summary.total_due > 0 ? "text-red-500" : "text-emerald-500"}`} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-[0.06em]">Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.invoice_count}</p>
              </div>
              <div className="p-2.5 rounded-md bg-blue-50">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-[0.06em]">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">PKR {data.summary.total_paid.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <CreditCard className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-[0.06em]">Open Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.open_complaints}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${data.summary.open_complaints > 0 ? "bg-amber-50" : "bg-gray-50"}`}>
                <AlertCircle className={`w-5 h-5 ${data.summary.open_complaints > 0 ? "text-amber-500" : "text-gray-400"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-[12px] transition-all whitespace-nowrap ${isActive
                  ? "text-blue-700 bg-blue-50"
                  : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Personal Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Internet ID
                    </span>
                    <span className="font-semibold text-blue-600">{customer.internet_id}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                    <span className="font-medium text-gray-900">{customer.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </span>
                    <span className="font-medium text-gray-900">{customer.phone_1}</span>
                  </div>
                  {customer.phone_2 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone 2
                      </span>
                      <span className="font-medium text-gray-900">{customer.phone_2}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <IdCard className="w-4 h-4" />
                      CNIC
                    </span>
                    <span className="font-medium font-mono text-gray-900">{customer.cnic}</span>
                  </div>
                </div>
              </div>

              {/* Connection Info */}
              <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-blue-600" />
                    Connection Details
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </span>
                    <p className="font-medium text-gray-900">{customer.installation_address}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Area</span>
                    <span className="font-medium text-gray-900">{customer.area}{customer.sub_zone ? ` / ${customer.sub_zone}` : ""}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">ISP</span>
                    <span className="font-medium text-gray-900">{customer.isp || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Connection Type</span>
                    <span className="font-medium text-gray-900 capitalize">{customer.connection_type || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Installation Date
                    </span>
                    <span className="font-medium text-gray-900">{customer.installation_date ? new Date(customer.installation_date).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Active Packages */}
              <div className="lg:col-span-2 bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Active Packages
                  </h3>
                </div>
                <div className="p-6">
                  {data.packages.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No active packages</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.packages.map((pkg, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-md border border-slate-200 bg-slate-50"
                        >
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          <p className="text-2xl font-bold mt-2 text-blue-700">
                            PKR {pkg.price.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">/mo</span>
                          </p>
                          {pkg.speed_mbps && <p className="text-sm text-gray-600 mt-1">{pkg.speed_mbps} Mbps</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Recent Invoices
                </h3>
              </div>
              {data.invoices.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No invoices found</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.invoices.map((invoice) => {
                    const status = statusConfig[invoice.status] || statusConfig.pending
                    const StatusIcon = status.icon
                    return (
                      <div key={invoice.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${status.bg}`}>
                              <StatusIcon className={`w-4 h-4 ${status.text}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                              <p className="text-sm text-gray-500">
                                Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-gray-900">PKR {invoice.total_amount.toLocaleString()}</p>
                              {invoice.remaining > 0 && (
                                <p className="text-sm text-red-600">Due: PKR {invoice.remaining.toLocaleString()}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-[11px] font-medium border border-current/20 ${status.bg} ${status.text}`}>
                              {invoice.status}
                            </span>
                            <button
                              onClick={() => handleViewInvoice(invoice.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Recent Payments
                </h3>
              </div>
              {data.payments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No payments found</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.payments.map((payment) => {
                    const status = statusConfig[payment.status] || statusConfig.pending
                    const StatusIcon = status.icon
                    return (
                      <div
                        key={payment.id}
                        className="p-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${status.bg}`}>
                              <StatusIcon className={`w-4 h-4 ${status.text}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">PKR {payment.amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">
                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "—"}
                                {payment.invoice_number && <span> • {payment.invoice_number}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] text-slate-600 capitalize bg-slate-100 px-3 py-1 rounded-md">{payment.payment_method}</span>
                            <span className={`px-2 py-1 rounded text-[11px] font-medium border border-current/20 ${status.bg} ${status.text}`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "complaints" && (
            <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Complaint History
                </h3>
              </div>
              {data.complaints.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No complaints found</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.complaints.map((complaint) => {
                    const status = statusConfig[complaint.status] || statusConfig.pending
                    const StatusIcon = status.icon
                    return (
                      <div key={complaint.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${status.bg} h-fit`}>
                              <StatusIcon className={`w-4 h-4 ${status.text}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">#{complaint.ticket_number}</p>
                              <p className="text-sm text-gray-700 mt-1 max-w-md">{complaint.description}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Opened: {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : "—"}
                                {complaint.resolved_at && ` • Closed: ${new Date(complaint.resolved_at).toLocaleDateString()}`}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-[11px] font-medium border border-current/20 flex-shrink-0 ${status.bg} ${status.text}`}>
                            {complaint.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h3 className="text-[13px] font-medium text-slate-900">Payment Details</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Amount & Status */}
              <div className="text-center pb-4 border-b border-slate-100">
                <p className="text-[28px] font-semibold text-slate-900">PKR {selectedPayment.amount.toLocaleString()}</p>
                <div className="mt-2">
                  {(() => {
                    const status = statusConfig[selectedPayment.status] || statusConfig.pending
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border border-current/20 ${status.bg} ${status.text}`}>
                        <status.icon className="w-4 h-4" />
                        {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-[12px] text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Payment Date
                  </span>
                  <span className="font-medium text-[12px] text-slate-900">
                    {selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleString() : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-[12px] text-slate-500 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </span>
                  <span className="font-medium text-[12px] text-slate-900 capitalize">{selectedPayment.payment_method}</span>
                </div>

                {selectedPayment.invoice_number && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[12px] text-slate-500 flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Invoice
                    </span>
                    <span className="font-medium text-[12px] text-slate-900">{selectedPayment.invoice_number}</span>
                  </div>
                )}

                {selectedPayment.bank_account && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[12px] text-slate-500 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Bank
                    </span>
                    <span className="font-medium text-[12px] text-slate-900">{selectedPayment.bank_account}</span>
                  </div>
                )}

                {selectedPayment.transaction_id && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-[12px] text-slate-500 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Transaction ID
                    </span>
                    <span className="font-medium font-mono text-[12px] text-slate-900">{selectedPayment.transaction_id}</span>
                  </div>
                )}

                {selectedPayment.failure_reason && (
                  <div className="p-3 bg-rose-50 rounded-md border border-rose-200">
                    <p className="text-[12px] font-medium text-rose-700 mb-1">Failure Reason</p>
                    <p className="text-[12px] text-rose-700">{selectedPayment.failure_reason}</p>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              {selectedPayment.payment_proof && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[12px] font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-600" />
                    Payment Proof
                  </p>
                  <div className="rounded-md overflow-hidden border border-slate-200">
                    <img
                      src={selectedPayment.payment_proof}
                      alt="Payment Proof"
                      className="w-full max-h-64 object-contain bg-slate-50"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.innerHTML = '<p class="p-4 text-center text-slate-500 text-sm">Unable to load image</p>'
                      }}
                    />
                  </div>
                  <a
                    href={selectedPayment.payment_proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-2 text-[12px] font-medium py-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full h-9 font-medium text-[12px] rounded-md transition-colors text-white bg-blue-600 hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
