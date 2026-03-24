"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { CSVLink } from "react-csv"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import {
  Plus, Pencil, Trash2, Check, CheckCircle2, XCircle,
  LayoutDashboard, ChevronRight, FileText, Eye, Share2,
} from "lucide-react"
import { Table } from "./table/invoiceTable.tsx"
import { Modal } from "./modal.tsx"
import { Topbar } from "./topNavbar.tsx"
import { Sidebar } from "./sideNavbar.tsx"
import { UnifiedPaymentModal } from "./modals/UnifiedPaymentModal.tsx"
import { getToken } from "../utils/auth.ts"
import { toast } from "react-toastify"
import axiosInstance from "../utils/axiosConfig.ts"

interface CRUDPageProps<T> {
  title: string
  endpoint: string
  columns: ColumnDef<T>[]
  FormComponent: React.ComponentType<{
    formData: Partial<T>
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    isEditing: boolean
  }>
  customHeaderButton?: React.ReactNode
  refreshTrigger?: number
}

/* ── AMOUNT FORMATTER: PKR K/M abbreviation ── */
const formatAmount = (val: number) => {
  if (val >= 1_000_000) return `PKR ${(val / 1_000_000).toFixed(2)}M`
  if (val >= 1_000) return `PKR ${(val / 1_000).toFixed(1)}k`
  return `PKR ${Math.round(val).toLocaleString()}`
}

export function CRUDPage<T extends { id: string }>({
  title, endpoint, columns, FormComponent, customHeaderButton, refreshTrigger,
}: CRUDPageProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Partial<T>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, total_amount: 0, paid: 0, paid_amount: 0, pending: 0, pending_amount: 0 })
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState<string>("")
  const [loadingViewId, setLoadingViewId] = useState<string | null>(null)
  const [loadingShareId, setLoadingShareId] = useState<string | null>(null)
  const [isUnifiedPaymentModalVisible, setIsUnifiedPaymentModalVisible] = useState(false)

  const sidebarExpanded = isSidebarOpen || isSidebarHovered

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [refreshTrigger, pageIndex, pageSize, JSON.stringify(sorting), search])

  const buildSortQuery = (s: SortingState) => s.map((x) => `${x.id}:${x.desc ? "desc" : "asc"}`).join(",")

  const fetchStats = async () => {
    try {
      const token = getToken()
      const res = await axiosInstance.get(`/${endpoint}/summary`, { headers: { Authorization: `Bearer ${token}` } })
      setStats({
        total: res.data.total ?? 0, total_amount: res.data.total_amount ?? 0,
        paid: res.data.paid ?? 0, paid_amount: res.data.paid_amount ?? 0,
        pending: res.data.pending ?? 0, pending_amount: res.data.pending_amount ?? 0,
      })
    } catch {
      setStats((prev) => ({
        ...prev,
        total: totalCount || prev.total,
        paid: data.filter((item: any) => item.status === "paid").length,
        pending: data.filter((item: any) => item.status === "pending").length,
      }))
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const res = await axiosInstance.get(`/${endpoint}/page`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageIndex + 1, page_size: pageSize, sort: buildSortQuery(sorting), q: search || undefined },
      })
      const items = res.data.items ?? []
      setData(items)
      setTotalCount(Number(res.data.total ?? items.length))
    } catch {
      try {
        const token = getToken()
        const response = await axiosInstance.get(`/${endpoint}/list`, { headers: { Authorization: `Bearer ${token}` } })
        const all = response.data ?? []
        setTotalCount(all.length)
        setData(all.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize))
      } catch (error) {
        toast.error(`Failed to fetch ${title}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const showModal = (item: T | null) => {
    setEditingItem(item); setFormData(item || {}); setIsModalVisible(true)
  }
  const handleCancel = () => {
    setIsModalVisible(false); setEditingItem(null); setFormData({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true)
    try {
      const token = getToken()
      if (editingItem) {
        await axiosInstance.put(`/${endpoint}/update/${editingItem.id}`, formData, { headers: { Authorization: `Bearer ${token}` } })
        toast.success(`${title} updated successfully`)
      } else {
        await axiosInstance.post(`/${endpoint}/add`, formData, { headers: { Authorization: `Bearer ${token}` } })
        toast.success(`${title} added successfully`)
      }
      await fetchData(); await fetchStats(); handleCancel()
    } catch {
      toast.error("Operation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) return
    try {
      setIsLoading(true)
      const token = getToken()
      await axiosInstance.delete(`/${endpoint}/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success(`${title} deleted successfully`)
      await fetchData(); await fetchStats()
    } catch {
      toast.error("Delete operation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const handleViewInvoice = async (invoice: any) => {
    setLoadingViewId(invoice.id)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 50000))
    try {
      await Promise.race([
        (async () => {
          const token = getToken()
          await axiosInstance.get(`/${endpoint}/${invoice.id}`, { headers: { Authorization: `Bearer ${token}` }, timeout: 50000 })
          window.open(`/${endpoint}/${invoice.id}`, "_blank")
        })(),
        timeoutPromise,
      ])
      toast.success("Invoice opened successfully")
    } catch (error: any) {
      toast.error(error.message === 'timeout' ? "Request timeout. Please try again." : "Failed to load invoice. Please try again.")
    } finally {
      setLoadingViewId(null)
    }
  }

  const handleWhatsAppShare = async (invoice: any) => {
    setLoadingShareId(invoice.id)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 50000))
    try {
      await Promise.race([
        (async () => {
          const phoneNumber1 = invoice.customer_phone || invoice.phone_1
          const phoneNumber2 = invoice.phone_2
          if (!phoneNumber1 && !phoneNumber2) throw new Error("Customer phone number not available")
          let phone = (phoneNumber1 || phoneNumber2).replace(/\D/g, "")
          if (phone.startsWith("00")) phone = phone.substring(2)
          if (phone.startsWith("+92")) phone = phone.substring(1)
          else if (!phone.startsWith("92")) {
            if (phone.startsWith("0")) phone = "92" + phone.substring(1)
            else if (phone.startsWith("3")) phone = "92" + phone
          }
          const token = getToken()
          await axiosInstance.get(`/${endpoint}/${invoice.id}`, { headers: { Authorization: `Bearer ${token}` }, timeout: 50000 })
          const publicInvoiceUrl = `${window.location.origin}/public/invoice/${invoice.id}`
          const message = `Hello ${invoice.customer_name},\n\nYour invoice #${invoice.invoice_number} is now available.\n\n📋 Invoice Details:\n• Amount: PKR ${Number.parseFloat(invoice.total_amount).toFixed(2)}\n• Due Date: ${new Date(invoice.due_date).toLocaleDateString()}\n• Status: ${invoice.status}\n\n📄 View your complete invoice here:\n${publicInvoiceUrl}\n\nPlease review your invoice and make the payment if pending.\n\nThank you for choosing Net Khata Communications!`
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank")
        })(),
        timeoutPromise,
      ])
      toast.success("Invoice shared via WhatsApp")
    } catch (error: any) {
      if (error.message === 'timeout') toast.error("Request timeout. Please try again.")
      else if (error.message === "Customer phone number not available") toast.error("Customer phone number not available")
      else if (error?.response?.status === 404) toast.error("Invoice not found or not accessible")
      else toast.error("Failed to share invoice. Please try again.")
    } finally {
      setLoadingShareId(null)
    }
  }

  /* ── MODAL FOOTER ── */
  const modalFooter = (
    <>
      <button type="button" onClick={handleCancel}
        className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150">
        Cancel
      </button>
      <button type="submit" form="invoice-form" disabled={isLoading}
        className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2">
        {isLoading ? "Processing..." : editingItem
          ? <><Check className="w-4 h-4" /> Update {title}</>
          : <><Plus className="w-4 h-4" /> Create {title}</>}
      </button>
    </>
  )

  const memoizedColumns = useMemo(() => {
    return [
      ...columns,
      {
        header: "View",
        cell: (info: any) => {
          const invoice = info.row.original
          const loading = loadingViewId === invoice.id
          return (
            /* ── VIEW INVOICE: ghost button with label ── */
            <button
              onClick={() => handleViewInvoice(invoice)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <Eye className="w-4 h-4" />
              {loading ? "Loading..." : "View"}
            </button>
          )
        },
      },
      {
        header: "Share",
        cell: (info: any) => {
          const invoice = info.row.original
          const loading = loadingShareId === invoice.id
          const hasPhone = !!(invoice.customer_phone || invoice.phone_1 || invoice.phone_2)
          return (
            /* ── SHARE: ghost button, emerald on hover ── */
            <button
              onClick={() => handleWhatsAppShare(invoice)}
              disabled={loading || !hasPhone}
              title={!hasPhone ? "Phone number not available" : "Share via WhatsApp"}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium border rounded-md transition-colors duration-150 ${
                !hasPhone
                  ? "text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                  : loading
                  ? "text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
                  : "text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
              }`}
            >
              <Share2 className="w-4 h-4" />
              {loading ? "Loading..." : "Share"}
            </button>
          )
        },
      },
      {
        header: "Actions",
        cell: (info: any) => (
          /* ── EDIT/DELETE: icon-only ghost buttons ── */
          <div className="flex items-center gap-1">
            <button onClick={() => showModal(info.row.original)}
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(info.row.original.id)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ]
  }, [columns, loadingViewId, loadingShareId])

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setIsOpen={setIsSidebarOpen} onHoverChange={setIsSidebarHovered} />

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${sidebarExpanded ? "lg:pl-[260px]" : "lg:pl-[60px]"}`}>
        <div className="flex-shrink-0">
          <Topbar toggleSidebar={toggleSidebar} sidebarExpanded={sidebarExpanded} />
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-100 px-6 py-5">
          <div className="max-w-[1400px] mx-auto">

            {/* ── BREADCRUMB ── */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600 font-medium">{title} Management</span>
            </div>

            {/* ── PAGE HEADER CARD ── */}
            <div className="bg-white rounded-[10px] border border-slate-200 p-5 mb-5">

              {/* Title + Actions row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-[15px] font-medium text-slate-900">{title} Management</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manage your {title.toLowerCase()} records</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 self-start sm:self-center">
                  {/* ── EXPORT: secondary ghost ── */}
                  <CSVLink data={data} filename={`${title.toLowerCase()}.csv`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150">
                    <FileText className="w-4 h-4" /> Export CSV
                  </CSVLink>
                  {/* ── CUSTOM HEADER BUTTON (e.g. Generate Monthly Invoices) ── */}
                  {customHeaderButton}
                  {/* ── ADD PAYMENT: secondary ghost ── */}
                  <button onClick={() => setIsUnifiedPaymentModalVisible(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150">
                    <Plus className="w-4 h-4" /> Add Payment
                  </button>
                  {/* ── PRIMARY ACTION ── */}
                  <button onClick={() => showModal(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition-colors duration-150">
                    <Plus className="w-4 h-4" /> Add New {title}
                  </button>
                </div>
              </div>

              {/* ── STAT STRIP: bg-slate-50, distinct icon colors, amount sub-line ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total */}
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Total {title}s</p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">{stats.total}</p>
                      <p className="text-[11px] text-slate-400 mt-1 tabular-nums">{formatAmount(stats.total_amount)}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                {/* Paid */}
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Paid {title}s</p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">{stats.paid}</p>
                      <p className="text-[11px] text-slate-400 mt-1 tabular-nums">{formatAmount(stats.paid_amount)}</p>
                    </div>
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
                {/* Pending */}
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Pending {title}s</p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">{stats.pending}</p>
                      <p className="text-[11px] text-slate-400 mt-1 tabular-nums">{formatAmount(stats.pending_amount)}</p>
                    </div>
                    <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TABLE ── */}
            <Table
              data={data} columns={memoizedColumns} selectedRows={selectedRows}
              setSelectedRows={setSelectedRows} isLoading={isLoading}
              serverMode={true} totalCount={totalCount} pageIndex={pageIndex}
              pageSize={pageSize} onPageChange={setPageIndex} onPageSizeChange={setPageSize}
              sorting={sorting} onSortingChange={setSorting} onGlobalSearch={setSearch}
            />

          </div>
        </main>
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      <Modal isVisible={isModalVisible} onClose={handleCancel}
        title={editingItem ? `Edit ${title}` : `Add New ${title}`}
        isLoading={isLoading} footer={modalFooter}>
        <form id="invoice-form" onSubmit={handleSubmit}>
          <FormComponent formData={formData} handleInputChange={handleInputChange} isEditing={!!editingItem} />
        </form>
      </Modal>

      {/* ── UNIFIED PAYMENT MODAL ── */}
      <UnifiedPaymentModal
        isOpen={isUnifiedPaymentModalVisible}
        onClose={() => setIsUnifiedPaymentModalVisible(false)}
        onPaymentAdded={() => { fetchData(); fetchStats() }}
      />
    </div>
  )
}