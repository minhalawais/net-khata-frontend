"use client"

import React, { useEffect, useState, useRef } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CRUDPage } from '../../components/crudPage.tsx'
import { ExpenseForm } from '../../components/forms/ExpenseForm.tsx'
import { Modal } from '../../components/modal.tsx'
import { ImageViewerModal, useImageViewer } from '../../components/modals/ImageViewerModal.tsx'
import { getToken } from '../../utils/auth.ts'
import axiosInstance from '../../utils/axiosConfig.ts'
import { toast } from '../../utils/toast.ts'
import { Plus, Trash2, Pencil, Save, X, Eye, FileText } from 'lucide-react'

interface Expense {
  id: string
  expense_type_id: string
  expense_type_name?: string
  employee_id?: string
  employee_payout_category?: string
  description: string
  amount: number
  expense_date: string
  payment_method: string
  vendor_payee: string
  bank_account_id?: string
  is_active: boolean
  created_at?: string
  payment_proof?: string
}

interface ExpenseType {
  id: string; name: string; description: string
  is_employee_payment: boolean; is_active: boolean
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

const ExpenseManagement: React.FC = () => {
  const [showExpenseTypesModal, setShowExpenseTypesModal] = useState(false)
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([])
  const [newExpenseType, setNewExpenseType] = useState({ name: '', description: '', is_employee_payment: false })
  const [editingType, setEditingType] = useState<ExpenseType | null>(null)
  const [editTypeData, setEditTypeData] = useState({ name: '', description: '', is_employee_payment: false })
  const imageViewer = useImageViewer()
  const modalContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = "Expense Management | Net Khata"
    fetchExpenseTypes()
  }, [])

  const fetchExpenseTypes = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get('/expense-types/list', { headers: { Authorization: `Bearer ${token}` } })
      setExpenseTypes(response.data)
    } catch (error) {
      console.error('Failed to fetch expense types', error)
      toast.error('Failed to fetch expense types')
    }
  }

  const handleAddExpenseType = async () => {
    if (!newExpenseType.name.trim()) return
    try {
      const token = getToken()
      await axiosInstance.post('/expense-types/add', newExpenseType, { headers: { Authorization: `Bearer ${token}` } })
      setNewExpenseType({ name: '', description: '', is_employee_payment: false })
      await fetchExpenseTypes()
      toast.success('Expense type added successfully')
    } catch (error: any) {
      console.error('Failed to add expense type', error)
      toast.error(error.response?.data?.message || 'Failed to add expense type')
    }
  }

  const handleEditExpenseType = (type: ExpenseType) => {
    setEditingType(type)
    setEditTypeData({ name: type.name, description: type.description || '', is_employee_payment: type.is_employee_payment || false })
    setTimeout(() => { modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, 100)
  }

  const handleUpdateExpenseType = async () => {
    if (!editingType || !editTypeData.name.trim()) return
    try {
      const token = getToken()
      await axiosInstance.put(`/expense-types/update/${editingType.id}`, editTypeData, { headers: { Authorization: `Bearer ${token}` } })
      setEditingType(null)
      setEditTypeData({ name: '', description: '', is_employee_payment: false })
      await fetchExpenseTypes()
      toast.success('Expense type updated successfully')
    } catch (error: any) {
      console.error('Failed to update expense type', error)
      toast.error(error.response?.data?.message || 'Failed to update expense type')
    }
  }

  const handleCancelEdit = () => {
    setEditingType(null)
    setEditTypeData({ name: '', description: '', is_employee_payment: false })
  }

  const handleDeleteExpenseType = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense type?')) {
      try {
        const token = getToken()
        await axiosInstance.delete(`/expense-types/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        await fetchExpenseTypes()
        toast.success('Expense type deleted successfully')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete expense type')
      }
    }
  }

  const validateExpenseBeforeSubmit = (data: Partial<Expense>) => {
    const selectedType = expenseTypes.find((type) => type.id === data.expense_type_id)
    const isEmployeePayment = Boolean(selectedType?.is_employee_payment)

    if (isEmployeePayment && !data.employee_id) {
      return 'Employee is required for employee payment expenses'
    }

    if (isEmployeePayment && !data.employee_payout_category) {
      return 'Payout category is required for employee payments'
    }

    return null
  }

  const columns = React.useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        header: 'Type',
        accessorKey: 'expense_type_name',
        cell: info => {
          const value = info.getValue<string>()
          if (!value) return <span className="text-slate-400">—</span>
          return (
            /* ── TYPE: amber semantic badge ── */
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
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
        accessorKey: 'expense_date',
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
            /* ── METHOD: semantic badge ── */
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${getMethodStyle(method)}`}>
              {METHOD_LABELS[method] || method}
            </span>
          )
        },
      },
      {
        header: 'Vendor / Payee',
        accessorKey: 'vendor_payee',
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
        cell: (info: any) => {
          const proof = info.getValue() as string
          return proof ? (
            /* ── VIEW PROOF: ghost button ── */
            <button
              onClick={() => imageViewer.openViewer(
                `/expenses/proof-image/${info.row.original.id}`,
                `Expense Proof - ${info.row.original.expense_type_name || 'Expense'}`,
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
      onClick={() => { setShowExpenseTypesModal(false); handleCancelEdit() }}
      className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
    >
      Done
    </button>
  )

  return (
    <>
      <CRUDPage<Expense>
        title="Expense"
        endpoint="expenses"
        columns={columns}
        useFormData={true}
        validateBeforeSubmit={validateExpenseBeforeSubmit}
        FormComponent={(props) => (
          <ExpenseForm {...props} onManageExpenseTypes={() => setShowExpenseTypesModal(true)} />
        )}
      />

      {/* ── MANAGE EXPENSE TYPES MODAL ── */}
      <Modal
        isVisible={showExpenseTypesModal}
        onClose={() => { setShowExpenseTypesModal(false); handleCancelEdit() }}
        title="Manage Expense Types"
        size="md"
        footer={manageTypesFooter}
      >
        <div ref={modalContentRef} className="space-y-5 max-h-[70vh] overflow-y-auto">

          {/* ── ADD / EDIT FORM ── */}
          <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
            {/* Section overline */}
            <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">
                {editingType ? 'Edit Expense Type' : 'Add New Expense Type'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div className="space-y-1.5">
                <label className={labelClass}>Name <span className="text-rose-500 ml-0.5">*</span></label>
                <input
                  type="text"
                  value={editingType ? editTypeData.name : newExpenseType.name}
                  onChange={(e) => editingType
                    ? setEditTypeData(prev => ({ ...prev, name: e.target.value }))
                    : setNewExpenseType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter expense type name"
                  className={inputBase}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className={labelClass}>Description</label>
                <textarea
                  value={editingType ? editTypeData.description : newExpenseType.description}
                  onChange={(e) => editingType
                    ? setEditTypeData(prev => ({ ...prev, description: e.target.value }))
                    : setNewExpenseType(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none resize-none"
                />
              </div>

              {/* Employee Payment checkbox */}
              <div className="flex items-start gap-3 py-1">
                <input
                  type="checkbox"
                  id="is_employee_payment"
                  checked={editingType ? editTypeData.is_employee_payment : newExpenseType.is_employee_payment}
                  onChange={(e) => editingType
                    ? setEditTypeData(prev => ({ ...prev, is_employee_payment: e.target.checked }))
                    : setNewExpenseType(prev => ({ ...prev, is_employee_payment: e.target.checked }))}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/[0.12] cursor-pointer"
                />
                <label htmlFor="is_employee_payment" className="cursor-pointer">
                  <span className="text-[13px] font-medium text-slate-700">Employee Payment Type</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    Check for Salary, Commission, Bonus, etc. to enable employee selection
                  </span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {editingType ? (
                  <>
                    <button onClick={handleUpdateExpenseType} disabled={!editTypeData.name.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                      <Save className="w-4 h-4" /> Update Type
                    </button>
                    <button onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleAddExpenseType} disabled={!newExpenseType.name.trim()}
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
                Existing Expense Types
              </span>
            </div>

            {expenseTypes.length === 0 ? (
              <p className="text-center text-[13px] text-slate-400 py-6">No expense types found</p>
            ) : (
              <div className="space-y-2">
                {expenseTypes.map((type) => (
                  <div key={type.id}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-[10px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-slate-700">{type.name}</span>
                        {type.is_employee_payment && (
                          /* ── EMPLOYEE BADGE: rounded not rounded-full ── */
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium">
                            👤 Employee
                          </span>
                        )}
                      </div>
                      {type.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{type.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      {/* ── EDIT: ghost blue icon ── */}
                      <button onClick={() => handleEditExpenseType(type)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                        title="Edit expense type">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {/* ── DELETE: ghost rose icon ── */}
                      <button onClick={() => handleDeleteExpenseType(type.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150"
                        title="Delete expense type">
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

export default ExpenseManagement