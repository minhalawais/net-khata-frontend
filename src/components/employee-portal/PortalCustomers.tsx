"use client"

import { toast } from "../../utils/toast.ts"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  Users,
  User,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  X,
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  Globe,
  Mail,
  CreditCard,
  Wifi,
  IdCard,
  Home,
  AlertCircle,
  Eye,
} from "lucide-react"
import HorizontalLogo from "../../assets/net_khata_horizontal.png"

interface Customer {
  id: string
  internet_id: string
  first_name: string
  last_name: string
  email: string | null
  phone_1: string | null
  phone_2: string | null
  cnic: string | null
  installation_address: string | null
  area: string | null
  sub_zone: string | null
  isp_name: string | null
  connection_type: string | null
  is_active: boolean
  installation_date: string | null
  total_due: number
}

export function PortalCustomers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [search, activeFilter])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (activeFilter === "active") params.append("is_active", "true")
      if (activeFilter === "inactive") params.append("is_active", "false")
      
      const response = await axiosInstance.get(`/employee-portal/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCustomers(response.data)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  const totalDue = customers.reduce((sum, c) => sum + c.total_due, 0)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-[10px] animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={HorizontalLogo} alt="Net Khata Logo" className="h-9 w-auto object-contain" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">Customer Directory</h1>
            <p className="text-[12px] text-slate-500 mt-1.5">View and manage your assigned customer base</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or internet ID..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-[10px] text-[14px] shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow outline-none"
          />
        </div>
        <div className="flex p-1.5 bg-slate-100/60 rounded-[10px] w-fit border border-slate-200/60 shrink-0">
          {["all", "active", "inactive"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-[6px] text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter
                  ? "bg-white text-blue-600 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 border border-transparent"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-[10px] border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter((c) => c.is_active).length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter((c) => !c.is_active).length}
              </p>
              <p className="text-xs text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                PKR {totalDue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Due</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[10px] border border-slate-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No customers found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`bg-white rounded-[10px] border ${customer.is_active ? "border-slate-200" : "border-slate-300 bg-slate-50"} p-4 cursor-pointer hover:shadow-md transition-all duration-150`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {customer.internet_id}
                  </span>
                  <span className={`px-2 py-1 rounded text-[11px] font-medium border ${customer.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {customer.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {customer.first_name} {customer.last_name}
              </h3>

              {customer.phone_1 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone_1}</span>
                </div>
              )}

              {customer.area && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{customer.area}{customer.sub_zone ? ` / ${customer.sub_zone}` : ""}</span>
                </div>
              )}

              {customer.connection_type && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Wifi className="w-4 h-4" />
                  <span className="capitalize">{customer.connection_type}</span>
                  {customer.isp_name && <span className="text-xs text-blue-600">({customer.isp_name})</span>}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                {customer.installation_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(customer.installation_date).toLocaleDateString()}</span>
                  </div>
                )}
                {customer.total_due > 0 && (
                  <span className="text-sm font-bold text-red-600">
                    Due: PKR {customer.total_due.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[10px] border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-[13px] font-medium text-slate-900">Customer Details</h3>
                  <p className="text-[11px] text-slate-500">{selectedCustomer.internet_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="h-8 w-8 inline-flex items-center justify-center border border-slate-200 rounded-md text-slate-500 hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)] space-y-4">
              {/* Customer Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </h3>
                    <span className={`px-3 py-1 rounded text-xs font-medium border ${selectedCustomer.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {selectedCustomer.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Internet ID
                    </span>
                    <span className="font-bold text-blue-600">{selectedCustomer.internet_id}</span>
                  </div>
                  
                  {selectedCustomer.phone_1 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone 1
                      </span>
                      <a href={`tel:${selectedCustomer.phone_1}`} className="font-medium text-blue-600">
                        {selectedCustomer.phone_1}
                      </a>
                    </div>
                  )}

                  {selectedCustomer.phone_2 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone 2
                      </span>
                      <a href={`tel:${selectedCustomer.phone_2}`} className="font-medium text-blue-600">
                        {selectedCustomer.phone_2}
                      </a>
                    </div>
                  )}
                  
                  {selectedCustomer.email && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </span>
                      <a href={`mailto:${selectedCustomer.email}`} className="font-medium text-blue-600 text-sm truncate max-w-[180px]">
                        {selectedCustomer.email}
                      </a>
                    </div>
                  )}

                  {selectedCustomer.cnic && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <IdCard className="w-4 h-4" />
                        CNIC
                      </span>
                      <span className="font-medium">{selectedCustomer.cnic}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location Details
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedCustomer.area && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area</span>
                      <span className="font-medium">{selectedCustomer.area}</span>
                    </div>
                  )}
                  {selectedCustomer.sub_zone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sub-Zone</span>
                      <span className="font-medium">{selectedCustomer.sub_zone}</span>
                    </div>
                  )}
                  {selectedCustomer.installation_address && (
                    <div>
                      <span className="text-gray-600 flex items-center gap-1 mb-1">
                        <Home className="w-3 h-3" /> Address
                      </span>
                      <p className="font-medium text-gray-900">{selectedCustomer.installation_address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-slate-600" />
                  Connection Details
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedCustomer.connection_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Connection Type</span>
                      <span className="font-medium capitalize">{selectedCustomer.connection_type}</span>
                    </div>
                  )}
                  {selectedCustomer.isp_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ISP</span>
                      <span className="font-medium">{selectedCustomer.isp_name}</span>
                    </div>
                  )}
                  {selectedCustomer.installation_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Installed</span>
                      <span className="font-medium">{new Date(selectedCustomer.installation_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className={`rounded-[12px] p-5 border shadow-sm ${selectedCustomer.total_due > 0 ? "bg-rose-50 border-rose-200 shadow-rose-100" : "bg-emerald-50 border-emerald-200"}`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${selectedCustomer.total_due > 0 ? "text-rose-900" : "text-emerald-900"}`}>
                  <CreditCard className={`w-5 h-5 ${selectedCustomer.total_due > 0 ? "text-red-600" : "text-green-600"}`} />
                  Financial Status
                </h4>
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-medium ${selectedCustomer.total_due > 0 ? "text-rose-700" : "text-emerald-700"}`}>Outstanding Balance</span>
                  <span className={`text-2xl tracking-tight font-bold ${selectedCustomer.total_due > 0 ? "text-red-600" : "text-green-600"}`}>
                    PKR {selectedCustomer.total_due.toLocaleString()}
                  </span>
                </div>
                {selectedCustomer.total_due > 0 && (
                  <div className="mt-3 py-2 px-3 bg-red-100/50 rounded-lg border border-red-200/50 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-red-600 font-medium leading-tight">
                      Attention Needed: Customer has unpaid invoices. Immediate recovery action may be required.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustomer(null)
                      navigate(`/customers/${selectedCustomer.id}`)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Profile
                  </button>
                  {selectedCustomer.phone_1 && (
                    <a
                      href={`tel:${selectedCustomer.phone_1}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  )}
                  {selectedCustomer.phone_1 && (
                    <a
                      href={`https://wa.me/${selectedCustomer.phone_1.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                    >
                      WhatsApp
                    </a>
                  )}
                  {selectedCustomer.email && (
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-slate-200 rounded-md text-sm font-medium hover:bg-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCustomer(null)
                  navigate(`/customers/${selectedCustomer.id}`)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
