"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Plus, Pencil, Trash2, CheckCircle2, XCircle, LayoutDashboard,
  ChevronRight, DollarSign, FileDown, Clock,
} from "lucide-react"
import { Table } from "./table/PaymentTable.tsx"
import { Modal } from "./modal.tsx"
import { Topbar } from "./topNavbar.tsx"
import { Sidebar } from "./sideNavbar.tsx"
import { getToken } from "../utils/auth.ts"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axiosInstance from "../utils/axiosConfig.ts"

interface CRUDPageProps<T> {
  title: string
  endpoint: string
  columns: ColumnDef<T>[]
  FormComponent: React.ComponentType<{
    formData: Partial<T>
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    isEditing: boolean
    validateBeforeSubmit?: (formData: Partial<T>) => string | null
  }>
  onDataChange?: () => void
  validateBeforeSubmit?: (formData: Partial<T>) => string | null
  refreshTrigger?: number
}

type Summary = { total: number; active: number; pending: number; totalAmount: number }

export function CRUDPage<T extends { id: string; is_active?: boolean }>({
  title, endpoint, columns, FormComponent, onDataChange,
  validateBeforeSubmit, refreshTrigger = 0,
}: CRUDPageProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Partial<T>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [pageCount, setPageCount] = useState<number>(0)
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])
  const [globalSearch, setGlobalSearch] = useState("")
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: string }[]>([])
  const [stats, setStats] = useState<Summary>({ total: 0, active: 0, pending: 0, totalAmount: 0 })

  const sidebarExpanded = isSidebarOpen || isSidebarHovered

  const fetchSummary = useCallback(async () => {
    try {
      const token = getToken()
      const res = await axiosInstance.get(`/${endpoint}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const s = res.data as Summary
      setStats({ total: s.total || 0, active: s.active || 0, pending: s.pending || 0, totalAmount: s.totalAmount || 0 })
    } catch (e) {
      console.warn("Failed to fetch summary", e)
    }
  }, [endpoint, refreshTrigger])

  const fetchPage = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const sort = sorting[0]
      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        sort_by: sort?.id,
        sort_dir: sort?.desc ? "desc" : "asc",
        q: globalSearch || undefined,
      }
      columnFilters.forEach((f) => { if (f.value) params[`filter_${f.id}`] = f.value })
      const res = await axiosInstance.get(`/${endpoint}/page`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
      setData(res.data.items || [])
      const total = res.data.total || 0
      setPageCount(Math.ceil(total / pagination.pageSize))
      if (!stats.total || refreshTrigger > 0) setStats((prev) => ({ ...prev, total }))
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error(`Failed to fetch ${title}`, error)
      toast.error(`Failed to fetch ${title}`)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, title, sorting, globalSearch, columnFilters, pagination, onDataChange, stats.total, refreshTrigger])

  useEffect(() => { fetchSummary() }, [fetchSummary])
  useEffect(() => { fetchPage() }, [fetchPage])

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = getToken()
      await axiosInstance.put(
        `/${endpoint}/update/${id}`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success(`${title} status updated successfully`)
      await fetchPage()
    } catch (error) {
      toast.error(`Failed to update ${title} status`)
    }
  }

  const handleBulkStatusChange = async (newStatus: boolean) => {
    if (selectedRows.length === 0) return
    try {
      setIsLoading(true)
      const token = getToken()
      await Promise.all(
        selectedRows.map((id) =>
          axiosInstance.put(`/${endpoint}/update/${id}`, { is_active: newStatus }, { headers: { Authorization: `Bearer ${token}` } }),
        ),
      )
      toast.success(`${selectedRows.length} ${title.toLowerCase()}${selectedRows.length > 1 ? "s" : ""} ${newStatus ? "activated" : "deactivated"} successfully`)
      await fetchPage()
      setSelectedRows([])
    } catch (error) {
      toast.error(`Failed to update ${title} status`)
    } finally {
      setIsLoading(false)
    }
  }

  const showModal = (item: T | null) => {
    setEditingItem(item)
    setFormData(item || {})
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingItem(null)
    setFormData({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = getToken()
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if ((formData as any)[key] !== undefined && (formData as any)[key] !== null) {
          const value = (formData as any)[key]
          if (key === "payment_proof" && value instanceof File) {
            formDataToSend.append(key, value)
          } else if (key === "is_active") {
            formDataToSend.append(key, typeof value === "string" ? (value.toLowerCase() === "true" ? "true" : "false") : value ? "true" : "false")
          } else {
            formDataToSend.append(key, value.toString())
          }
        }
      })
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      if (editingItem) {
        await axiosInstance.put(`/${endpoint}/update/${editingItem.id}`, formDataToSend, { headers })
        toast.success(`${title} updated successfully`)
      } else {
        await axiosInstance.post(`/${endpoint}/add`, formDataToSend, { headers })
        toast.success(`${title} added successfully`)
      }
      fetchPage()
      handleCancel()
    } catch (error) {
      toast.error("Operation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) {
      try {
        setIsLoading(true)
        const token = getToken()
        await axiosInstance.delete(`/${endpoint}/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        toast.success(`${title} deleted successfully`)
        await fetchPage()
      } catch (error) {
        toast.error("Delete operation failed")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleExport = async () => {
    try {
      const token = getToken()
      const sort = sorting[0]
      const params: Record<string, any> = {
        sort_by: sort?.id, sort_dir: sort?.desc ? "desc" : "asc", q: globalSearch || undefined,
      }
      columnFilters.forEach((f) => { if (f.value) params[`filter_${f.id}`] = f.value })
      const res = await axiosInstance.get(`/${endpoint}/export`, {
        headers: { Authorization: `Bearer ${token}` }, params, responseType: "blob",
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement("a")
      a.href = url; a.download = `${title.toLowerCase()}-export.csv`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error("Export failed")
    }
  }

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const memoizedColumns = useMemo(() => {
    return [
      ...columns,
      {
        header: "Active",
        accessorKey: "is_active",
        cell: (info: any) => (
          /* ── STATUS BADGE: rounded not rounded-full ── */
          <button
            onClick={() => handleToggleStatus(info.row.original.id, info.getValue())}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors duration-150 ${
              info.getValue()
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            {info.getValue()
              ? <><CheckCircle2 className="w-3 h-3" /> Active</>
              : <><XCircle className="w-3 h-3" /> Inactive</>}
          </button>
        ),
      },
      {
        header: "Actions",
        cell: (info: any) => (
          /* ── EDIT/DELETE: icon-only ghost buttons ── */
          <div className="flex items-center gap-1">
            <button
              onClick={() => showModal(info.row.original)}
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(info.row.original.id)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ]
  }, [columns])

  /* ── MODAL FOOTER: sticky bg-slate-50 border-t ── */
  const modalFooter = (
    <>
      <button
        type="button" onClick={handleCancel}
        className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
      >
        Cancel
      </button>
      <button
        type="submit" form="payment-form" disabled={isLoading}
        className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
      >
        {isLoading ? "Processing..." : editingItem
          ? <><Pencil className="w-4 h-4" /> Update {title}</>
          : <><Plus className="w-4 h-4" /> Create {title}</>}
      </button>
    </>
  )

  return (
    /* ── APP SHELL ── */
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-[15px] font-medium text-slate-900">{title} Management</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manage your {title.toLowerCase()} records</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 self-start sm:self-center">
                  {/* ── EXPORT: secondary ghost ── */}
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
                  >
                    <FileDown className="w-4 h-4" /> Export CSV
                  </button>
                  {/* ── ADD NEW: primary ── */}
                  <button
                    onClick={() => showModal(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                  >
                    <Plus className="w-4 h-4" /> Add New {title}
                  </button>
                </div>
              </div>

              {/* ── STAT STRIP: 4 cards, bg-slate-50, distinct icon colors ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Total {title}s</p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">{stats.total}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Active {title}s</p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">{stats.active}</p>
                    </div>
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Pending {title}s</p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">{stats.pending}</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Total Amount</p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">
                        <span className="text-[13px] text-slate-400 mr-0.5">PKR</span>
                        {stats.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BULK ACTIONS ── */}
              {selectedRows.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-blue-700">
                    {selectedRows.length} {title.toLowerCase()}{selectedRows.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleBulkStatusChange(true)} disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                      <CheckCircle2 className="w-4 h-4" /> Activate
                    </button>
                    <button onClick={() => handleBulkStatusChange(false)} disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                      <XCircle className="w-4 h-4" /> Deactivate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── TABLE ── */}
            <Table
              data={data}
              columns={memoizedColumns}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              handleToggleStatus={handleToggleStatus}
              isLoading={isLoading}
              manualPagination={true}
              pageCount={pageCount}
              pagination={pagination}
              onPaginationChange={(p) => setPagination(p)}
              sorting={sorting}
              onSortingChange={(s) => setSorting(s as any)}
              onGlobalFilterChangeExternal={(value) => { setGlobalSearch(value); setPagination((p) => ({ ...p, pageIndex: 0 })) }}
              onColumnFiltersChangeExternal={(filters) => { setColumnFilters(filters as any); setPagination((p) => ({ ...p, pageIndex: 0 })) }}
            />

          </div>
        </main>
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      <Modal
        isVisible={isModalVisible} onClose={handleCancel}
        title={editingItem ? `Edit ${title}` : `Add New ${title}`}
        isLoading={isLoading} footer={modalFooter}
      >
        <form id="payment-form" onSubmit={handleSubmit}>
          <FormComponent formData={formData} handleInputChange={handleInputChange} isEditing={!!editingItem} />
        </form>
      </Modal>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}
        newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
  )
}