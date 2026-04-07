"use client"

import { toast } from "../utils/toast.ts"
import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { CSVLink } from "react-csv"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileDown,
  LayoutDashboard,
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
  Upload,
} from "lucide-react"
import { Table } from "./table/table.tsx"
import { Modal } from "./customerModal.tsx"
import { Topbar } from "./topNavbar.tsx"
import { Sidebar } from "./sideNavbar.tsx"
import { getToken } from "../utils/auth.ts"
import axiosInstance from "../utils/axiosConfig.ts"
import { EnhancedBulkAddModal } from "./modals/EnhancedBulkAddModal.tsx"

interface CRUDPageProps<T> {
  title: string
  endpoint: string
  columns: ColumnDef<T>[]
  FormComponent: React.ComponentType<{
    formData: Partial<T>
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleFileRemove?: (fieldName: string) => void
    isEditing: boolean
    validateBeforeSubmit?: (formData: Partial<T>) => string | null
    supportsBulkAdd?: boolean
    validationErrors?: Record<string, string>
    loadingStates?: Record<string, boolean>
    setLoadingStates?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  }>
  onDataChange?: () => void
  validateBeforeSubmit?: (formData: Partial<T>) => string | null
  supportsBulkAdd?: boolean
}

export function CRUDPage<T extends { id: string; is_active?: boolean }>({
  title,
  endpoint,
  columns,
  FormComponent,
  onDataChange,
  validateBeforeSubmit,
  supportsBulkAdd = false,
}: CRUDPageProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Partial<T>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isBulkAddModalVisible, setIsBulkAddModalVisible] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    cnic_front_image: false,
    cnic_back_image: false,
    agreement_document: false,
  })

  const sidebarExpanded = isSidebarOpen || isSidebarHovered

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize, searchQuery, columnFilters])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(columnFilters).filter(([, value]) => value && value.trim() !== ""),
      )

      const response = await axiosInstance.get(`/${endpoint}/list`, {
        params: {
          paginate: true,
          page: currentPage,
          page_size: pageSize,
          search: searchQuery,
          ...(Object.keys(activeFilters).length > 0
            ? { filters: JSON.stringify(activeFilters) }
            : {}),
        },
      })
      const payload = response.data
      const rows = Array.isArray(payload) ? payload : payload.items || []
      setData(rows)
      setSelectedRows([])

      let active = 0
      for (const item of rows) {
        if ((item as any).is_active) active += 1
      }
      const total = Array.isArray(payload) ? rows.length : payload.total || rows.length
      const resolvedTotalPages = Array.isArray(payload)
        ? Math.max(1, Math.ceil((rows.length || 1) / pageSize))
        : Math.max(1, payload.total_pages || Math.ceil((total || 1) / pageSize))

      if (!Array.isArray(payload) && currentPage > resolvedTotalPages) {
        setCurrentPage(resolvedTotalPages)
        return
      }
      setTotalPages(resolvedTotalPages)
      setStats({
        total: Array.isArray(payload) ? total : payload.overall_total ?? total,
        active: Array.isArray(payload) ? active : payload.overall_active ?? payload.total_active ?? active,
        inactive: Array.isArray(payload)
          ? Math.max(rows.length - active, 0)
          : payload.overall_inactive
            ?? payload.total_inactive
            ?? Math.max((payload.total ?? rows.length) - (payload.total_active ?? active), 0),
      })
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error(`Failed to fetch ${title}`, error)
      toast.error(`Failed to fetch ${title}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkStatusChange = async (newStatus: boolean) => {
    if (selectedRows.length === 0) return
    try {
      setIsLoading(true)
      const token = getToken()
      await Promise.all(
        selectedRows.map((id) =>
          axiosInstance.put(
            `/${endpoint}/update/${id}`,
            { is_active: newStatus },
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ),
      )
      toast.success(
        `${selectedRows.length} ${title.toLowerCase()}${selectedRows.length > 1 ? "s" : ""} ${newStatus ? "activated" : "deactivated"} successfully`,
      )
      await fetchData()
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
    setValidationErrors({})
    setLoadingStates({ cnic_front_image: false, cnic_back_image: false, agreement_document: false })
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingItem(null)
    setFormData({})
    setValidationErrors({})
    setLoadingStates({ cnic_front_image: false, cnic_back_image: false, agreement_document: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setValidationErrors({})

    try {
      const token = getToken()
      const formDataToSend = new FormData()

      Object.keys(formData).forEach((key) => {
        const value = (formData as Record<string, any>)[key]
        if (value != null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (item != null && item !== "") formDataToSend.append(key, item)
            })
          } else if (["cnic_front_image", "cnic_back_image", "agreement_document"].includes(key)) {
            formDataToSend.append(key, value)
          } else {
            formDataToSend.append(key, value)
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
      fetchData()
      handleCancel()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors)
        toast.error("Please fix the validation errors")
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.data?.error) {
        const err = error.response.data.error
        toast.error(typeof err === "string" ? err : err.message || "Operation failed")
      } else {
        toast.error("Operation failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) {
      try {
        setIsLoading(true)
        const token = getToken()
        await axiosInstance.delete(`/${endpoint}/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success(`${title} deleted successfully`)
        fetchData()
      } catch (error) {
        toast.error("Delete operation failed")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsLoading(true)
      const token = getToken()
      await axiosInstance.patch(
        `/${endpoint}/toggle-status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success(`${title} status updated successfully`)
      fetchData()
    } catch (error) {
      toast.error(`Failed to update ${title} status`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    if (value) {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    }
  }

  const handleFileRemove = useCallback((fieldName: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: "" }))
  }, [])

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const memoizedColumns = useMemo(() => {
    return [
      ...columns,
      {
        header: "View",
        id: "view",
        cell: (info: any) => (
          /* ── VIEW PROFILE: ghost button with label ── */
          <button
            onClick={() => (window.location.href = `/customers/${info.row.original.id}`)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
            Profile
          </button>
        ),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: (info: any) => (
          /* ── STATUS BADGE: rounded not rounded-full ── */
          <button
            onClick={() => handleToggleStatus(info.row.original.id, info.getValue())}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors duration-150 ${
              info.getValue()
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            {info.getValue() ? (
              <><CheckCircle2 className="w-3 h-3" /> Active</>
            ) : (
              <><XCircle className="w-3 h-3" /> Inactive</>
            )}
          </button>
        ),
      },
      {
        header: "Actions",
        id: "actions",
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
        type="button"
        onClick={handleCancel}
        className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="customer-form"
        disabled={isLoading}
        className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
      >
        {isLoading ? "Processing..." : editingItem ? (
          <><Pencil className="w-4 h-4" /> Update {title}</>
        ) : (
          <><Plus className="w-4 h-4" /> Create {title}</>
        )}
      </button>
    </>
  )

  return (
    /* ── APP SHELL: bg-slate-100, no pt-20 hack ── */
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        setIsOpen={setIsSidebarOpen}
        onHoverChange={setIsSidebarHovered}
      />

      {/* ── COLUMN: pl offset for sidebar ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${
          sidebarExpanded ? "lg:pl-[260px]" : "lg:pl-[60px]"
        }`}
      >
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
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-[15px] font-medium text-slate-900">{title} Management</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manage your {title.toLowerCase()} records</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  {/* ── BULK ADD: secondary ghost ── */}
                  {supportsBulkAdd && (
                    <button
                      onClick={() => setIsBulkAddModalVisible(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
                    >
                      <Upload className="w-4 h-4" /> Bulk Add
                    </button>
                  )}
                  {/* ── EXPORT CSV: secondary ghost ── */}
                  <CSVLink
                    data={data}
                    filename={`${title.toLowerCase()}.csv`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
                  >
                    <FileDown className="w-4 h-4" /> Export CSV
                  </CSVLink>
                  {/* ── PRIMARY ACTION ── */}
                  <button
                    onClick={() => showModal(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                  >
                    <Plus className="w-4 h-4" /> Add New {title}
                  </button>
                </div>
              </div>

              {/* ── STAT STRIP: bg-slate-50, distinct icon colors ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                        Total {title}s
                      </p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">
                        {stats.total}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                        Active {title}s
                      </p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">
                        {stats.active}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                        Inactive {title}s
                      </p>
                      <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none mt-1.5">
                        {stats.inactive}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BULK ACTIONS BAR ── */}
              {selectedRows.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-blue-700">
                    {selectedRows.length} {title.toLowerCase()}{selectedRows.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkStatusChange(true)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange(false)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                    >
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
              pageIndex={Math.max(currentPage - 1, 0)}
              pageSize={pageSize}
              pageCount={Math.max(totalPages, 1)}
              totalRows={stats.total}
              onPageChange={(pageIndex) => setCurrentPage(pageIndex + 1)}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
              globalSearchValue={searchQuery}
              onGlobalSearchChange={(value) => {
                setSearchQuery(value)
                setCurrentPage(1)
              }}
              columnFilterValues={columnFilters}
              onColumnFiltersChange={(filters) => {
                setColumnFilters(filters)
                setCurrentPage(1)
              }}
            />

          </div>
        </main>
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      <Modal
        isVisible={isModalVisible}
        onClose={handleCancel}
        title={editingItem ? `Edit ${title}` : `Add New ${title}`}
        isLoading={isLoading}
        footer={modalFooter}
      >
        <form id="customer-form" onSubmit={handleSubmit}>
          <FormComponent
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            handleFileRemove={handleFileRemove}
            isEditing={!!editingItem}
            validationErrors={validationErrors}
            loadingStates={loadingStates}
            setLoadingStates={setLoadingStates}
          />
        </form>
      </Modal>

      <EnhancedBulkAddModal
        isVisible={isBulkAddModalVisible}
        onClose={() => setIsBulkAddModalVisible(false)}
        endpoint={endpoint}
        entityName={title}
        onSuccess={fetchData}
      />

    </div>
  )
}