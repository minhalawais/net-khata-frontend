"use client"

import { toast } from "../utils/toast.ts"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Users,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react"
import { Table } from "./table/table.tsx"
import { Modal } from "./modal.tsx"
import { Topbar } from "./topNavbar.tsx"
import { Sidebar } from "./sideNavbar.tsx"
import { getToken } from "../utils/auth.ts"
import axiosInstance from "../utils/axiosConfig.ts"
import { CredentialsModal } from "./modals/CredentialsModal.tsx"

interface CRUDPageProps<T> {
  title: string
  endpoint: string
  columns: ColumnDef<T>[]
  FormComponent: React.ComponentType<{
    formData: Partial<T>
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    handleFileChange?: (name: string, file: File | null) => void
    isEditing: boolean
    validateBeforeSubmit?: (formData: Partial<T>) => string | null
  }>
  onDataChange?: () => void
  validateBeforeSubmit?: (formData: Partial<T>) => string | null
  useFormData?: boolean
}

export function CRUDPage<T extends { id: string; is_active?: boolean }>({
  title,
  endpoint,
  columns,
  FormComponent,
  onDataChange,
  validateBeforeSubmit,
  useFormData = false,
}: CRUDPageProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Partial<T>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [newEmployeeCredentials, setNewEmployeeCredentials] = useState<{
    username: string
    password: string
    email: string
  } | null>(null)
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [fileData, setFileData] = useState<Record<string, File>>({})

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      const response = await axiosInstance.get(`/${endpoint}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(response.data)
      const total = response.data.length
      const active = response.data.filter((item: any) => item.is_active).length
      setStats({ total, active, inactive: total - active })
      if (onDataChange) onDataChange()
    } catch (error) {
      console.error(`Failed to fetch ${title}`, error)
      toast.error(`Failed to fetch ${title}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = getToken()
      await axiosInstance.put(
        `/${endpoint}/update/${id}`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success(`${title} status updated successfully`)
      await fetchData()
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
    setFileData({})
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingItem(null)
    setFormData({})
    setFileData({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateBeforeSubmit) {
      const validationError = validateBeforeSubmit(formData)
      if (validationError) {
        toast.error(validationError)
        return
      }
    }

    setIsLoading(true)

    try {
      const token = getToken()
      let response
      const hasFiles = Object.keys(fileData).length > 0
      let submitData: any = formData
      let requestConfig: any = { headers: { Authorization: `Bearer ${token}` } }

      if (useFormData || hasFiles) {
        const formDataObj = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach((item) => {
                if (typeof item !== "object") formDataObj.append(key, String(item))
              })
            } else if (value instanceof File || value instanceof Blob) {
              formDataObj.append(key, value)
            } else if (typeof value !== "object") {
              formDataObj.append(key, String(value))
            }
          }
        })
        Object.entries(fileData).forEach(([key, file]) => {
          formDataObj.append(key, file)
        })
        submitData = formDataObj
        requestConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      } else {
        requestConfig.headers["Content-Type"] = "application/json"
      }

      if (editingItem) {
        response = await axiosInstance.put(`/${endpoint}/update/${editingItem.id}`, submitData, requestConfig)
        toast.success(`${title} updated successfully`)
      } else {
        response = await axiosInstance.post(`/${endpoint}/add`, submitData, requestConfig)
        toast.success(`${title} added successfully`)
        if (response.data.credentials) {
          setNewEmployeeCredentials(response.data.credentials)
          setShowCredentialsModal(true)
        }
      }
      await fetchData()
      handleCancel()
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Operation failed"
      toast.error(errorMsg)
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
        await fetchData()
      } catch (error) {
        toast.error("Delete operation failed")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      setFileData((prev) => ({ ...prev, [name]: file }))
    } else {
      setFileData((prev) => {
        const newData = { ...prev }
        delete newData[name]
        return newData
      })
    }
  }

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const memoizedColumns = useMemo(() => {
    return [
      ...columns,
      {
        header: "Status",
        accessorKey: "is_active",
        cell: (info: any) => (
          /* ── STATUS BADGE: rounded-md pill, semantic color only on text/bg, no rounded-full ── */
          <button
            onClick={() => handleToggleStatus(info.row.original.id, info.getValue())}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors duration-150 ${
              info.getValue()
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            {info.getValue() ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> Active
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" /> Inactive
              </>
            )}
          </button>
        ),
      },
      {
        header: "Actions",
        cell: (info: any) => (
          /* ── EDIT/DELETE: icon-only ghost buttons, color only on hover ── */
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

  /* ── MODAL FOOTER: passed as prop so it renders in sticky bg-slate-50 border-t footer ── */
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
        form="crud-form"
        disabled={isLoading}
        className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
      >
        {isLoading ? (
          "Processing..."
        ) : editingItem ? (
          <>
            <Check className="w-4 h-4" /> Update {title}
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" /> Create {title}
          </>
        )}
      </button>
    </>
  )

  return (
    /* ── APP SHELL: flex h-screen, bg-slate-100, no pt-20 hack ── */
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setIsOpen={setIsSidebarOpen} />

      {/* ── MAIN COLUMN: pl offset for sidebar, no ml-64 ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${
          isSidebarOpen ? "lg:pl-[260px]" : "lg:pl-[60px]"
        }`}
      >
        {/* ── TOPBAR: flex-shrink-0 in normal flow, no fixed positioning needed ── */}
        <div className="flex-shrink-0">
          <Topbar toggleSidebar={toggleSidebar} />
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

            {/* ── PAGE HEADER CARD: no shadow, rounded-[10px] ── */}
            <div className="bg-white rounded-[10px] border border-slate-200 p-5 mb-5">

              {/* Title row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  {/* ── PAGE ICON: bg-blue-50 w-8 h-8 rounded-lg, icon w-4 h-4 ── */}
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-[15px] font-medium text-slate-900">{title} Management</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Manage your {title.toLowerCase()} records
                    </p>
                  </div>
                </div>

                {/* ── PRIMARY ACTION BUTTON: bg-blue-600, rounded-md, w-4 h-4 icon ── */}
                <button
                  onClick={() => showModal(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 self-start sm:self-center flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add New {title}
                </button>
              </div>

              {/* ── STAT STRIP: 3 identical bg-white cards — Skill 11 rule ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                {/* Total */}
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

                {/* Active */}
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

                {/* Inactive */}
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

              {/* ── BULK ACTIONS BAR: only shown when rows selected ── */}
              {selectedRows.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-blue-700">
                    {selectedRows.length} {title.toLowerCase()}
                    {selectedRows.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkStatusChange(true)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <Check className="w-4 h-4" /> Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange(false)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <X className="w-4 h-4" /> Deactivate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── TABLE SECTION ── */}
            <Table
              data={data}
              columns={memoizedColumns}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              handleToggleStatus={handleToggleStatus}
              isLoading={isLoading}
            />

          </div>
        </main>
      </div>

      {/* ── ADD/EDIT MODAL: form uses id="crud-form" so footer submit button works ── */}
      <Modal
        isVisible={isModalVisible}
        onClose={handleCancel}
        title={editingItem ? `Edit ${title}` : `Add New ${title}`}
        isLoading={isLoading}
        footer={modalFooter}
      >
        <form id="crud-form" onSubmit={handleSubmit}>
          <FormComponent
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            isEditing={!!editingItem}
          />
        </form>
      </Modal>

      {/* ── CREDENTIALS MODAL ── */}
      {newEmployeeCredentials && (
        <CredentialsModal
          isVisible={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
          credentials={newEmployeeCredentials}
        />
      )}
    </div>
  )
}