"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Download, Upload, AlertCircle, CheckCircle, X, FileText, Loader,
  Edit3, Save, RotateCcw, ChevronLeft, ChevronRight, FileSpreadsheet,
  Database, Settings, AlertTriangle, XCircle,
} from "lucide-react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import { toast } from "react-toastify"

interface EnhancedBulkAddModalProps {
  isVisible: boolean; onClose: () => void; endpoint: string
  entityName: string; onSuccess: () => void
}
interface ValidationResult {
  success: boolean; totalRecords: number; successCount: number; failedCount: number
  validRows: Array<Record<string, any>>
  errors: Array<{ row: number; errors: string[]; fieldErrors: Record<string, string>; data: Record<string, any> }>
}
interface DropdownData {
  areas: Array<{ id: string; name: string }>
  servicePlans: Array<{ id: string; name: string }>
  isps: Array<{ id: string; name: string }>
}

/* ── SHARED CLASSES ── */
const inputBase =
  "w-full px-2 py-1 text-[12px] border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/[0.12] focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400"
const inputError =
  "border-rose-400 focus:ring-rose-500/[0.12] focus:border-rose-500"

export function EnhancedBulkAddModal({
  isVisible, onClose, endpoint, entityName, onSuccess,
}: EnhancedBulkAddModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [step, setStep] = useState<"initial" | "uploading" | "validation" | "processing" | "complete">("initial")
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set())
  const [editedData, setEditedData] = useState<Record<number, Record<string, any>>>({})
  const [dropdownData, setDropdownData] = useState<DropdownData>({ areas: [], servicePlans: [], isps: [] })
  const [showValidRowsOnly, setShowValidRowsOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isVisible) fetchDropdownData()
  }, [isVisible])

  const fetchDropdownData = async () => {
    try {
      const token = getToken()
      const res = await axiosInstance.get("/customers/reference-data", { headers: { Authorization: `Bearer ${token}` } })
      const payload = typeof res.data === "string" ? JSON.parse(res.data) : res.data
      setDropdownData({ areas: payload.areas || [], servicePlans: payload.servicePlans || [], isps: payload.isps || [] })
    } catch (error) { console.error("Failed to fetch dropdown data:", error) }
  }

  const getFieldErrors = (rowIndex: number, field: string): string[] => {
    if (showValidRowsOnly) return []
    const errorRow = validationResult?.errors.find((e) => e.row === rowIndex)
    if (!errorRow?.fieldErrors) return []
    const fieldError = errorRow.fieldErrors[field]
    return fieldError ? [fieldError] : []
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      const validTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile); setValidationResult(null); setStep("initial")
        setEditingRows(new Set()); setEditedData({}); setCurrentPage(1)
      } else {
        toast.error("Please select a CSV or Excel file")
      }
    }
  }

  const downloadTemplate = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get(`/${endpoint}/template`, {
        headers: { Authorization: `Bearer ${token}` }, responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url; link.setAttribute("download", `${entityName.toLowerCase()}_template.xlsx`)
      document.body.appendChild(link); link.click(); link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${entityName} template downloaded successfully`)
    } catch (error) {
      toast.error("Failed to download template")
    }
  }

  const validateFile = async () => {
    if (!file) return
    setIsUploading(true); setStep("uploading"); setUploadProgress(0)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const token = getToken()
      const response = await axiosInstance.post(`/${endpoint}/validate-bulk`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1)))
        },
      })
      const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data
      setValidationResult(responseData); setStep("validation")
      if (responseData.failedCount > 0) {
        toast.warning(`Validation complete: ${responseData.successCount} valid, ${responseData.failedCount} errors found`)
      } else {
        toast.success(`All ${responseData.totalRecords} records are valid and ready for import`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to validate file")
      setStep("initial")
    } finally {
      setIsUploading(false)
    }
  }

  const processValidatedData = async () => {
    if (!validationResult) return
    setIsProcessing(true); setStep("processing")
    try {
      const token = getToken()
      const validRowsToProcess = validationResult.validRows.map((row, index) =>
        editedData[index] ? { ...row, ...editedData[index] } : row,
      )
      const response = await axiosInstance.post(
        `/${endpoint}/bulk-add`,
        { validatedData: validRowsToProcess },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      )
      const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data
      setValidationResult(responseData); setStep("complete")
      toast.success(`Successfully processed ${responseData.successCount} out of ${validRowsToProcess.length} ${entityName.toLowerCase()}s`)
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process validated data")
      setStep("validation")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditRow = (rowIndex: number) => {
    const newSet = new Set(editingRows)
    newSet.has(rowIndex) ? newSet.delete(rowIndex) : newSet.add(rowIndex)
    setEditingRows(newSet)
  }

  const handleFieldChange = (rowIndex: number, field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [rowIndex]: { ...prev[rowIndex], [field]: value } }))
  }

  const validateRowClientSide = (rowData: Record<string, any>): string[] => {
    const errors: string[] = []
    const required = ["internet_id","first_name","last_name","email","phone_1","area_id","installation_address","service_plan_id","isp_id","connection_type","cnic","installation_date"]
    required.forEach((f) => { if (!rowData[f] || String(rowData[f]).trim() === "") errors.push(`Missing required field: ${f}`) })
    if (rowData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(rowData.email)) errors.push("Invalid email format")
    const validatePhone = (label: string, value?: string) => {
      if (!value) return
      const digits = String(value).replace(/\D/g, "")
      const normalized = digits.startsWith("92") ? digits : `92${digits}`
      if (normalized.length < 10 || normalized.length > 13) errors.push(`Invalid phone number format for ${label}`)
    }
    validatePhone("phone_1", rowData.phone_1)
    if (rowData.phone_2) validatePhone("phone_2", rowData.phone_2)
    if (rowData.cnic && String(rowData.cnic).replace(/\D/g, "").length !== 13) errors.push("CNIC must be exactly 13 digits")
    if (rowData.installation_date && !/^\d{4}-\d{2}-\d{2}$/.test(String(rowData.installation_date))) errors.push("installation_date must be in YYYY-MM-DD format")
    if (rowData.connection_type && !["internet","tv_cable","both"].includes(String(rowData.connection_type).toLowerCase())) errors.push("connection_type must be one of: internet, tv_cable, both")
    const isIdIn = (id: string, list: Array<{ id: string }>) => !!list.find((x) => x.id === id)
    if (rowData.area_id && !isIdIn(rowData.area_id, dropdownData.areas)) errors.push("Invalid area_id selection")
    if (rowData.service_plan_id && !isIdIn(rowData.service_plan_id, dropdownData.servicePlans)) errors.push("Invalid service_plan_id selection")
    if (rowData.isp_id && !isIdIn(rowData.isp_id, dropdownData.isps)) errors.push("Invalid isp_id selection")
    return errors
  }

  const updateValidationResultAfterEdit = (rowIndex: number, rowData: Record<string, any>, isValid: boolean, errors: string[] = [], fieldErrors: Record<string, string> = {}) => {
    if (!validationResult) return
    setValidationResult((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev))
      if (isValid) {
        const errorIndex = next.errors.findIndex((e: any) => e.row === rowIndex)
        if (errorIndex !== -1) {
          const [movedRow] = next.errors.splice(errorIndex, 1)
          next.validRows.push({ ...movedRow.data, ...rowData })
          next.successCount += 1; next.failedCount -= 1
        }
      } else {
        const errorIndex = next.errors.findIndex((e: any) => e.row === rowIndex)
        if (errorIndex !== -1) {
          next.errors[errorIndex] = { ...next.errors[errorIndex], errors, fieldErrors, data: { ...next.errors[errorIndex].data, ...rowData } }
        } else {
          const validIndex = next.validRows.findIndex((_: any, i: number) => i === rowIndex)
          if (validIndex !== -1) {
            next.validRows.splice(validIndex, 1)
            next.errors.push({ row: rowIndex, errors, fieldErrors, data: rowData })
            next.successCount -= 1; next.failedCount += 1
          }
        }
      }
      return next
    })
  }

  const saveRowChanges = async (rowIndex: number) => {
    if (!validationResult) return
    const errorRow = validationResult.errors.find((e) => e.row === rowIndex)
    if (!errorRow) return
    const completeRowData = { ...errorRow.data, ...editedData[rowIndex] }
    const clientErrors = validateRowClientSide(completeRowData)
    if (clientErrors.length === 0) {
      setIsUploading(true)
      try {
        const token = getToken()
        const formData = new FormData()
        formData.append("file", new Blob([JSON.stringify([completeRowData])], { type: "application/json" }))
        const response = await axiosInstance.post(`/${endpoint}/validate-bulk`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        })
        const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data
        if (responseData.successCount === 1) {
          updateValidationResultAfterEdit(rowIndex, completeRowData, true)
          toast.success("Row validation passed")
        } else {
          const rowErrors = responseData.errors.find((e: any) => e.row === 0)
          if (rowErrors?.fieldErrors) {
            updateValidationResultAfterEdit(rowIndex, completeRowData, false, Object.values(rowErrors.fieldErrors) as string[], rowErrors.fieldErrors)
          } else {
            updateValidationResultAfterEdit(rowIndex, completeRowData, false, rowErrors?.errors || [])
          }
          toast.warning("Row still has validation errors")
        }
        setIsUploading(false)
      } catch {
        toast.error("Failed to save changes"); setIsUploading(false)
      }
    } else {
      updateValidationResultAfterEdit(rowIndex, completeRowData, false, clientErrors)
      toast.warning("Please fix validation errors")
    }
  }

  const resetRowChanges = (rowIndex: number) => {
    setEditedData((prev) => { const n = { ...prev }; delete n[rowIndex]; return n })
    setEditingRows((prev) => { const n = new Set(prev); n.delete(rowIndex); return n })
  }

  const resetForm = () => {
    setFile(null); setValidationResult(null); setUploadProgress(0); setStep("initial")
    setEditingRows(new Set()); setEditedData({}); setCurrentPage(1); setShowValidRowsOnly(false)
  }

  /* ── EDITABLE FIELD RENDERERS ── */
  const renderDropdownField = (rowIndex: number, field: string, value: string, options: Array<{ id: string; name: string }>, label: string) => {
    const isEditing = editingRows.has(rowIndex)
    const currentValue = editedData[rowIndex]?.[field] || value
    const fieldErrors = getFieldErrors(rowIndex, field)
    if (!isEditing) {
      const option = options.find((o) => o.id === currentValue)
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] text-slate-700">{option?.name || currentValue || "—"}</span>
          {fieldErrors.length > 0 && (
            <div className="flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-rose-500">{fieldErrors[0]}</span>
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-0.5">
        <select value={currentValue} onChange={(e) => handleFieldChange(rowIndex, field, e.target.value)}
          className={`${inputBase} ${fieldErrors.length > 0 ? inputError : ""}`}>
          <option value="">Select {label}</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        {fieldErrors.length > 0 && (
          <div className="flex items-start gap-1">
            <AlertCircle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
            <span className="text-[11px] text-rose-500">{fieldErrors[0]}</span>
          </div>
        )}
      </div>
    )
  }

  const renderEditableField = (rowIndex: number, field: string, value: string, type = "text", label = "") => {
    const isEditing = editingRows.has(rowIndex)
    const currentValue = editedData[rowIndex]?.[field] || value
    const fieldErrors = getFieldErrors(rowIndex, field)
    const selectOptions: Record<string, { value: string; label: string }[]> = {
      connection_type: [{ value: "internet", label: "Internet" }, { value: "tv_cable", label: "TV Cable" }, { value: "both", label: "Both" }],
      internet_connection_type: [{ value: "wire", label: "Wire" }, { value: "wireless", label: "Wireless" }],
      tv_cable_connection_type: [{ value: "analog", label: "Analog" }, { value: "digital", label: "Digital" }],
    }
    if (!isEditing) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] text-slate-700 break-words">{currentValue || "—"}</span>
          {fieldErrors.length > 0 && (
            <div className="flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-rose-500 leading-tight">{fieldErrors[0]}</span>
            </div>
          )}
        </div>
      )
    }
    if (selectOptions[field]) {
      return (
        <div className="flex flex-col gap-0.5">
          <select value={currentValue} onChange={(e) => handleFieldChange(rowIndex, field, e.target.value)}
            className={`${inputBase} ${fieldErrors.length > 0 ? inputError : ""}`}>
            <option value="">Select...</option>
            {selectOptions[field].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {fieldErrors.length > 0 && (
            <div className="flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-rose-500">{fieldErrors[0]}</span>
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-0.5">
        <input type={type} value={currentValue} onChange={(e) => handleFieldChange(rowIndex, field, e.target.value)}
          className={`${inputBase} ${fieldErrors.length > 0 ? inputError : ""}`} placeholder={label} />
        {fieldErrors.length > 0 && (
          <div className="flex items-start gap-1">
            <AlertCircle className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
            <span className="text-[11px] text-rose-500">{fieldErrors[0]}</span>
          </div>
        )}
      </div>
    )
  }

  const getDisplayData = () => {
    if (!validationResult) return []
    if (showValidRowsOnly) {
      return validationResult.validRows.map((row, i) => ({ ...row, _isValid: true, _originalIndex: i, _displayIndex: i + 1 }))
    }
    return validationResult.errors.map((errorItem, i) => ({
      ...errorItem.data, _isValid: false, _originalIndex: errorItem.row,
      _displayIndex: errorItem.row + 1, _errors: errorItem.errors,
    }))
  }

  const displayRows = getDisplayData()
  const totalPages = Math.ceil(displayRows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentRows = displayRows.slice(startIndex, endIndex)

  if (!isVisible) return null

  /* ── STEP INDICATOR CONFIG ── */
  const steps = [
    { num: 1, label: "Upload File", active: step === "initial", completed: step !== "initial" },
    { num: 2, label: "Validate & Edit", active: step === "validation", completed: step === "processing" || step === "complete" },
    { num: 3, label: "Process Data", active: step === "processing", completed: step === "complete" },
    { num: 4, label: "Complete", active: step === "complete", completed: false },
  ]

  return (
    /* ── BACKDROP: rgba only, no backdrop-blur ── */
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.50)" }}
      onClick={onClose}
    >
      {/* ── PANEL: rounded-xl, border only, no shadow-2xl, no gradient ── */}
      <div
        className="bg-white rounded-xl border border-slate-200 w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── HEADER: white, border-b, no gradient ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-slate-900">Enhanced Bulk Import</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Advanced {entityName} import with validation & editing</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP INDICATOR: system tokens ── */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {steps.map((item, idx) => (
              <div key={item.num} className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors duration-150 ${
                  item.active ? "bg-blue-600 text-white"
                    : item.completed ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  {item.completed ? <CheckCircle className="w-4 h-4" /> : item.num}
                </div>
                <span className={`text-[12px] font-medium whitespace-nowrap ${
                  item.active ? "text-blue-600" : item.completed ? "text-emerald-700" : "text-slate-400"
                }`}>{item.label}</span>
                {idx < 3 && <div className="w-6 h-px bg-slate-200 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* STEP: Initial */}
          {step === "initial" && (
            <div className="p-6 overflow-y-auto">
              <div className="space-y-5">

                {/* Features info card */}
                <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[13px] font-medium text-slate-900 mb-2">Advanced Import Features</h3>
                      <ul className="space-y-1.5">
                        {[
                          "Dynamic Excel template with real-time dropdowns",
                          "Comprehensive validation with inline error display",
                          "Edit invalid rows directly in the interface",
                          "Real-time stats and batch processing",
                        ].map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-[13px] text-slate-600">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Download + Upload cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Download Template */}
                  <div className="bg-white rounded-[10px] border border-slate-200 p-5 hover:border-blue-200 transition-colors duration-150">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-[13px] font-medium text-slate-900 mb-1">Download Template</h3>
                      <p className="text-[11px] text-slate-400 mb-4">Get an Excel template with dropdowns and validation</p>
                      <button onClick={downloadTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition-colors duration-150">
                        <Download className="w-4 h-4" /> Download Template
                      </button>
                    </div>
                  </div>

                  {/* Upload File */}
                  <div className="bg-white rounded-[10px] border border-slate-200 p-5 hover:border-blue-200 transition-colors duration-150">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-slate-600" />
                      </div>
                      <h3 className="text-[13px] font-medium text-slate-900 mb-1">Upload & Validate</h3>
                      <p className="text-[11px] text-slate-400 mb-4">Upload your filled template for validation</p>
                      <label className="flex flex-col items-center gap-2 w-full py-4 px-4 border border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors duration-150">
                        {file ? (
                          <>
                            <FileText className="w-6 h-6 text-emerald-600" />
                            <span className="text-[13px] text-slate-700 font-medium">{file.name}</span>
                            <span className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(2)} KB</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-[13px] text-slate-500">Click to select file</span>
                            <span className="text-[11px] text-slate-400">CSV, XLS, XLSX</span>
                          </>
                        )}
                        <input type="file" className="sr-only" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Uploading */}
          {step === "uploading" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <Loader className="w-7 h-7 animate-spin text-blue-600" />
              </div>
              <h3 className="text-[15px] font-medium text-slate-900 mb-1">Validating Your Data</h3>
              <p className="text-[13px] text-slate-400 mb-8 text-center max-w-md">
                Analyzing your file and validating all customer data...
              </p>
              <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-[13px] text-slate-400 tabular-nums">{uploadProgress}% Complete</p>
            </div>
          )}

          {/* STEP: Validation */}
          {step === "validation" && validationResult && (
            <div className="flex-1 overflow-hidden flex flex-col">

              {/* Validation stat strip */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Total Records</p>
                        <p className="text-[22px] font-semibold text-slate-900 tabular-nums mt-1">{validationResult.totalRecords}</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Valid Records</p>
                        <p className="text-[22px] font-semibold text-slate-900 tabular-nums mt-1">{validationResult.successCount}</p>
                      </div>
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-[10px] border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">Errors Found</p>
                        <p className="text-[22px] font-semibold text-slate-900 tabular-nums mt-1">{validationResult.failedCount}</p>
                      </div>
                      <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* View toggle */}
              <div className="px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowValidRowsOnly(false); setCurrentPage(1) }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors duration-150 ${
                      !showValidRowsOnly ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Error Rows ({validationResult.failedCount})
                  </button>
                  <button
                    onClick={() => { setShowValidRowsOnly(true); setCurrentPage(1) }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors duration-150 ${
                      showValidRowsOnly ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Valid Rows ({validationResult.successCount})
                  </button>
                </div>
                <span className="text-[13px] text-slate-400">
                  {showValidRowsOnly ? "Review valid rows" : "Fix errors to proceed"}
                </span>
              </div>

              {/* Data table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-800 text-white sticky top-0 z-10">
                    <tr>
                      {["Row","Internet ID","First Name","Last Name","Email","Phone 1","Phone 2","Area","Address","Service Plan","ISP","Connection","Internet Type","TV Type","Install Date","CNIC","GPS","Actions"].map((col, i) => (
                        <th key={col}
                          className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.06em] whitespace-nowrap min-w-[${i === 0 ? "70" : i === 8 ? "180" : i === 17 ? "100" : "120"}px] ${i === 17 ? "sticky right-0 bg-slate-800" : ""}`}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {currentRows.map((row) => {
                      const actualRowIndex = row._originalIndex
                      const isRowEditing = editingRows.has(actualRowIndex)
                      const hasErrors = !row._isValid
                      return (
                        <tr key={actualRowIndex}
                          className={`transition-colors ${
                            isRowEditing ? "bg-blue-50/50 border-l-2 border-blue-400"
                              : hasErrors ? "bg-rose-50/40"
                              : "hover:bg-blue-50/20"
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-medium text-slate-700">{row._displayIndex}</span>
                              {hasErrors && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "internet_id", row.internet_id || "", "text", "Internet ID")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "first_name", row.first_name || "", "text", "First Name")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "last_name", row.last_name || "", "text", "Last Name")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "email", row.email || "", "email", "Email")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "phone_1", row.phone_1 || "", "tel", "Phone 1")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "phone_2", row.phone_2 || "", "tel", "Phone 2")}</td>
                          <td className="px-3 py-2.5">{renderDropdownField(actualRowIndex, "area_id", row.area_id || "", dropdownData.areas, "Area")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "installation_address", row.installation_address || "", "text", "Address")}</td>
                          <td className="px-3 py-2.5">{renderDropdownField(actualRowIndex, "service_plan_id", row.service_plan_id || "", dropdownData.servicePlans, "Plan")}</td>
                          <td className="px-3 py-2.5">{renderDropdownField(actualRowIndex, "isp_id", row.isp_id || "", dropdownData.isps, "ISP")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "connection_type", row.connection_type || "")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "internet_connection_type", row.internet_connection_type || "")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "tv_cable_connection_type", row.tv_cable_connection_type || "")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "installation_date", row.installation_date || "", "date")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "cnic", row.cnic || "", "text", "CNIC")}</td>
                          <td className="px-3 py-2.5">{renderEditableField(actualRowIndex, "gps_coordinates", row.gps_coordinates || "", "text", "GPS")}</td>
                          <td className="px-3 py-2.5 sticky right-0 bg-white">
                            <div className="flex items-center gap-1 justify-end">
                              {isRowEditing ? (
                                <>
                                  <button onClick={() => saveRowChanges(actualRowIndex)}
                                    className="p-1.5 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors duration-150" title="Save">
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => resetRowChanges(actualRowIndex)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors duration-150" title="Cancel">
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => handleEditRow(actualRowIndex)}
                                  disabled={row._isValid}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150" title="Edit row">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {displayRows.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      {showValidRowsOnly
                        ? <CheckCircle className="w-6 h-6 text-slate-400" />
                        : <AlertCircle className="w-6 h-6 text-slate-400" />}
                    </div>
                    <p className="text-[15px] font-medium text-slate-700 mb-1">
                      {showValidRowsOnly ? "No Valid Rows Found" : "No Error Rows"}
                    </p>
                    <p className="text-[13px] text-slate-400">
                      {showValidRowsOnly
                        ? "All rows contain validation errors. Switch to Error Rows to fix them."
                        : "All rows are valid and ready for processing!"}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0">
                  <span className="text-[13px] text-slate-400">
                    Showing {startIndex + 1}–{Math.min(endIndex, displayRows.length)} of {displayRows.length} rows
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md hover:bg-slate-100 transition-colors duration-150">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1
                      if (totalPages > 5) {
                        if (currentPage <= 3) pageNum = i + 1
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                        else pageNum = currentPage - 2 + i
                      }
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-md text-[12px] font-medium transition-colors duration-150 ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}>
                          {pageNum}
                        </button>
                      )
                    })}
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md hover:bg-slate-100 transition-colors duration-150">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: Processing */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <Loader className="w-7 h-7 animate-spin text-blue-600" />
              </div>
              <h3 className="text-[15px] font-medium text-slate-900 mb-1">Processing Validated Data</h3>
              <p className="text-[13px] text-slate-400 text-center max-w-md">
                Saving validated customer records to the database...
              </p>
            </div>
          )}

          {/* STEP: Complete */}
          {step === "complete" && validationResult && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-[15px] font-medium text-slate-900 mb-1">Import Completed Successfully!</h3>
              <p className="text-center text-[13px] text-slate-400 mb-8 max-w-md">
                Successfully processed {validationResult.successCount} out of {validationResult.totalRecords}{" "}
                {entityName.toLowerCase()}s.
              </p>
              <div className="flex gap-3">
                <button onClick={resetForm}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150">
                  Import Another File
                </button>
                <button onClick={onClose}
                  className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between gap-3 flex-shrink-0">
          {step === "initial" && (
            <>
              <button onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                Cancel
              </button>
              <button onClick={validateFile} disabled={!file || isUploading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                {isUploading ? <><Loader className="w-4 h-4 animate-spin" /> Validating...</> : <><Upload className="w-4 h-4" /> Validate & Review</>}
              </button>
            </>
          )}

          {step === "validation" && (
            <>
              <div className="flex items-center gap-2">
                {validationResult && validationResult.failedCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-[13px] text-amber-700">
                      Fix {validationResult.failedCount} error{validationResult.failedCount !== 1 ? "s" : ""} to proceed
                    </span>
                  </div>
                )}
                {validationResult && validationResult.successCount > 0 && validationResult.failedCount === 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-[13px] text-emerald-700">All records validated successfully!</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={resetForm}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                  Start Over
                </button>
                <button onClick={onClose}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                  Cancel
                </button>
                <button onClick={processValidatedData}
                  disabled={isProcessing || !validationResult || validationResult.successCount === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[13px] font-medium rounded-md hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                  {isProcessing ? <><Loader className="w-4 h-4 animate-spin" /> Processing...</> : (
                    <><Database className="w-4 h-4" /> Process {validationResult?.successCount || 0} Record{validationResult && validationResult.successCount !== 1 ? "s" : ""}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}