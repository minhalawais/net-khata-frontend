"use client"

import React, { useEffect, useState, useRef } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/crudPage.tsx'
import { ExtraIncomeForm } from '../../components/forms/ExtraIncomeForm.tsx'
import { Modal } from '../../components/modal.tsx'
import { getToken } from '../../utils/auth.ts'
import axiosInstance from '../../utils/axiosConfig.ts'
import { toast } from '../../utils/toast.ts'
import { ImageViewerModal, useImageViewer } from '../../components/modals/ImageViewerModal.tsx'
import { Plus, Trash2, Pencil, Save, X, Eye, FileText } from 'lucide-react'

interface ExtraIncome {
  id: string
  income_type_id: string
  income_type_name?: string
  description: string
  amount: number
  income_date: string
  payment_method: string
  payer: string
  bank_account_id?: string
  is_active: boolean
  created_at?: string
  payment_proof?: string
}

interface IncomeType {
  id: string; name: string; description: string; is_active: boolean
}

/* ── PAYMENT METHOD BADGE COLORS ── */
const METHOD_STYLES: Record<string, string> = {
  cash:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  bank_transfer: "bg-blue-50    text-blue-700   border-blue-200",
  online:        "bg-violet-50  text-violet-700 border-violet-200",
}
const getMethodStyle = (method: string) =>
  METHOD_STYLES[method?.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200"
const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank Transfer', online: 'Online',
}

/* ── SHARED MODAL STYLE CONSTANTS ── */
const inputBase =
  "h-9 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"
const labelClass = "block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]"

const ExtraIncomeManagement: React.FC = () => {
  const [showIncomeTypesModal, setShowIncomeTypesModal] = useState(false)
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>([])
  const [newIncomeType, setNewIncomeType] = useState({ name: '', description: '' })
  const [editingType, setEditingType] = useState<IncomeType | null>(null)
  const [editTypeData, setEditTypeData] = useState({ name: '', description: '' })
  const imageViewer = useImageViewer()
  const modalContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = "Extra Income Management | Net Khata"
    fetchIncomeTypes()
  }, [])

  const fetchIncomeTypes = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get('/extra-income-types/list', { headers: { Authorization: `Bearer ${token}` } })
      setIncomeTypes(response.data)
    } catch (error) {
      console.error('Failed to fetch income types', error)
      toast.error('Failed to fetch income types')
    }
  }

  const handleAddIncomeType = async () => {
    if (!newIncomeType.name.trim()) return
    try {
      const token = getToken()
      await axiosInstance.post('/extra-income-types/add', newIncomeType, { headers: { Authorization: `Bearer ${token}` } })
      setNewIncomeType({ name: '', description: '' })
      await fetchIncomeTypes()
      toast.success('Income type added successfully')
    } catch (error: any) {
      console.error('Failed to add income type', error)
      toast.error(error.response?.data?.message || 'Failed to add income type')
    }
  }

  const handleEditIncomeType = (type: IncomeType) => {
    setEditingType(type)
    setEditTypeData({ name: type.name, description: type.description || '' })
    setTimeout(() => { modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, 100)
  }

  const handleUpdateIncomeType = async () => {
    if (!editingType || !editTypeData.name.trim()) return
    try {
      const token = getToken()
      await axiosInstance.put(`/extra-income-types/update/${editingType.id}`, editTypeData, { headers: { Authorization: `Bearer ${token}` } })
      setEditingType(null)
      setEditTypeData({ name: '', description: '' })
      await fetchIncomeTypes()
      toast.success('Income type updated successfully')
    } catch (error: any) {
      console.error('Failed to update income type', error)
      toast.error(error.response?.data?.message || 'Failed to update income type')
    }
  }

  const handleCancelEdit = () => {
    setEditingType(null)
    setEditTypeData({ name: '', description: '' })
  }

  const handleDeleteIncomeType = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this income type?')) {
      try {
        const token = getToken()
        await axiosInstance.delete(`/extra-income-types/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        await fetchIncomeTypes()
        toast.success('Income type deleted successfully')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete income type')
      }
    }
  }

  const columns = React.useMemo<ColumnDef<ExtraIncome>[]>(
    () => [
      {
        header: 'Type',
        accessorKey: 'income_type_name',
        cell: info => {
          const value = info.getValue<string>()
          if (!value) return <span className="text-slate-400">—</span>
          return (
            /* ── TYPE: emerald semantic badge (income = positive) ── */
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
              {value}
            </span>
          )
        },
      },
      {
        header: 'Amount',
        accessorKey: 'amount',
        cell: info => (
          /* ── AMOUNT: muted PKR prefix + tabular-nums ── */
          <span className="text-[13px] font-medium text-slate-900 tabular-nums">
            <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
            {(info.getValue() as number)?.toLocaleString() || '0.00'}
          </span>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'income_date',
        cell: info => {
          const date = info.getValue<string>()
          return date
            ? <span className="text-[13px] text-slate-600">{new Date(date).toLocaleDateString()}</span>
            : <span className="text-slate-400">—</span>
        },
      },
      {
        header: 'Method',
        accessorKey: 'payment_method',
        cell: info => {
          const method = info.getValue<string>()
          if (!method) return <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">Cash</span>
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${getMethodStyle(method)}`}>
              {METHOD_LABELS[method] || method}
            </span>
          )
        },
      },
      {
        header: 'Payer',
        accessorKey: 'payer',
        cell: info => {
          const value = info.getValue<string>()
          return value
            ? <span className="text-[13px] text-slate-600">{value}</span>
            : <span className="text-slate-400">—</span>
        },
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: info => {
          const value = info.getValue<string>()
          return value
            ? <span className="text-[13px] text-slate-600 line-clamp-1">{value}</span>
            : <span className="text-slate-400">—</span>
        },
      },
      {
        header: 'Created',
        accessorKey: 'created_at',
        cell: info => {
          const date = info.getValue<string>()
          return date
            ? <span className="text-[13px] text-slate-600">{new Date(date).toLocaleDateString()}</span>
            : <span className="text-slate-400">—</span>
        },
      },
      {
        header: 'Proof',
        accessorKey: 'payment_proof',
        cell: info => {
          const proof = info.getValue<string>()
          return proof ? (
            /* ── VIEW PROOF: ghost button ── */
            <button
              onClick={() => imageViewer.openViewer(
                `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/${proof}`,
                `Income Proof - ${info.row.original.income_type_name || 'Income'}`,
                axiosInstance,
              )}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">—</span>
          )
        },
      },
    ],
    [imageViewer],
  )

  /* ── MANAGE TYPES MODAL FOOTER ── */
  const manageTypesFooter = (
    <button
      type="button"
      onClick={() => { setShowIncomeTypesModal(false); handleCancelEdit() }}
      className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
    >
      Done
    </button>
  )

  return (
    <>
      <CRUDPage<ExtraIncome>
        title="Extra Income"
        endpoint="extra-incomes"
        columns={columns}
        useFormData={true}
        FormComponent={(props) => (
          <ExtraIncomeForm {...props} onManageIncomeTypes={() => setShowIncomeTypesModal(true)} />
        )}
      />

      {/* ── MANAGE INCOME TYPES MODAL ── */}
      <Modal
        isVisible={showIncomeTypesModal}
        onClose={() => { setShowIncomeTypesModal(false); handleCancelEdit() }}
        title="Manage Income Types"
        size="md"
        footer={manageTypesFooter}
      >
        <div ref={modalContentRef} className="space-y-5 max-h-[70vh] overflow-y-auto">

          {/* ── ADD / EDIT FORM ── */}
          <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
            <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">
                {editingType ? 'Edit Income Type' : 'Add New Income Type'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div className="space-y-1.5">
                <label className={labelClass}>Name <span className="text-rose-500 ml-0.5">*</span></label>
                <input
                  type="text"
                  value={editingType ? editTypeData.name : newIncomeType.name}
                  onChange={(e) => editingType
                    ? setEditTypeData(prev => ({ ...prev, name: e.target.value }))
                    : setNewIncomeType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter income type name"
                  className={inputBase}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className={labelClass}>Description</label>
                <textarea
                  value={editingType ? editTypeData.description : newIncomeType.description}
                  onChange={(e) => editingType
                    ? setEditTypeData(prev => ({ ...prev, description: e.target.value }))
                    : setNewIncomeType(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {editingType ? (
                  <>
                    <button onClick={handleUpdateIncomeType} disabled={!editTypeData.name.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                      <Save className="w-4 h-4" /> Update Type
                    </button>
                    <button onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleAddIncomeType} disabled={!newIncomeType.name.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                    <Plus className="w-4 h-4" /> Add Type
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── EXISTING TYPES LIST ── */}
          <div>
            <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-3">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">
                Existing Income Types
              </span>
            </div>

            {incomeTypes.length === 0 ? (
              <p className="text-center text-[13px] text-slate-400 py-6">No income types found</p>
            ) : (
              <div className="space-y-2">
                {incomeTypes.map((type) => (
                  <div key={type.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-[10px]">
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-slate-700">{type.name}</span>
                      {type.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{type.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button onClick={() => handleEditIncomeType(type)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                        title="Edit income type">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteIncomeType(type.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150"
                        title="Delete income type">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ImageViewerModal
        isOpen={imageViewer.isOpen} onClose={imageViewer.closeViewer}
        imageUrl={imageViewer.imageUrl} title={imageViewer.title} isLoading={imageViewer.isLoading}
      />
    </>
  )
}

export default ExtraIncomeManagement