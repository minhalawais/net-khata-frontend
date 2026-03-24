"use client"

import type React from "react"
import { useState } from "react"
import { Download, Upload, AlertCircle, CheckCircle, X, FileText, Loader } from "lucide-react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import { toast } from "react-toastify"

interface BulkAddModalProps {
  isVisible: boolean
  onClose: () => void
  endpoint: string
  entityName: string
  onSuccess: () => void
}

interface ValidationResult {
  success: boolean
  totalRecords: number
  successCount: number
  failedCount: number
  errors: Array<{
    row: number
    errors: string[]
  }>
}

export function BulkAddModal({ isVisible, onClose, endpoint, entityName, onSuccess }: BulkAddModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [step, setStep] = useState<"initial" | "uploading" | "validation" | "complete">("initial")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      // Check if file is CSV or Excel
      if (
        selectedFile.type === "text/csv" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(selectedFile)
        setValidationResult(null)
        setStep("initial")
      } else {
        toast.error("Please select a CSV or Excel file", {
          style: { background: "#FEE2E2", color: "#EF4444" },
        })
      }
    }
  }

  const downloadTemplate = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get(`/${endpoint}/template`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${entityName.toLowerCase()}_template.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success(`${entityName} template downloaded successfully`, {
        style: { background: "#D1FAE5", color: "#10B981" },
      })
    } catch (error) {
      console.error("Failed to download template", error)
      toast.error("Failed to download template", {
        style: { background: "#FEE2E2", color: "#EF4444" },
      })
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setIsUploading(true)
    setStep("uploading")
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = getToken()
      const response = await axiosInstance.post(`/${endpoint}/bulk-add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setUploadProgress(percentCompleted)
        },
      })

      setValidationResult(response.data)
      setStep(response.data.success ? "complete" : "validation")

      if (response.data.success) {
        toast.success(
          `Successfully added ${response.data.successCount} out of ${response.data.totalRecords} ${entityName.toLowerCase()}s`,
          {
            style: { background: "#D1FAE5", color: "#10B981" },
          },
        )
        onSuccess()
      } else {
        toast.warning(
          `Added ${response.data.successCount} out of ${response.data.totalRecords} ${entityName.toLowerCase()}s with ${
            response.data.failedCount
          } errors`,
          {
            style: { background: "#FEF3C7", color: "#D97706" },
          },
        )
      }
    } catch (error) {
      console.error("Failed to upload file", error)
      toast.error("Failed to upload file", {
        style: { background: "#FEE2E2", color: "#EF4444" },
      })
      setStep("initial")
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setValidationResult(null)
    setUploadProgress(0)
    setStep("initial")
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-semibold text-slate-900">Bulk Add {entityName}s</h2>
          <button
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center border border-slate-200 rounded-md text-slate-500 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "initial" && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-[10px] p-4 border border-blue-200">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-slate-900">Important Instructions</h3>
                    <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc pl-5">
                      <li>Download the template file to see the required format</li>
                      <li>Fill in the customer data according to the template</li>
                      <li>Required fields must not be empty</li>
                      <li>Upload the completed file to add multiple customers at once</li>
                      <li>The system will validate your data before adding customers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-[10px] p-6 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <Download className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Download Template</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Get a CSV template with all required fields and examples
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" /> Download Template
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-[10px] p-6 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload File</h3>
                    <p className="text-sm text-slate-500 mb-4">Upload your completed CSV or Excel file</p>
                    <div className="w-full">
                      <label className="flex flex-col items-center px-4 py-2 bg-white text-blue-600 rounded-md border border-blue-600 cursor-pointer hover:bg-blue-50 transition-colors">
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          {file ? file.name : "Choose file"}
                        </span>
                        <input type="file" className="hidden" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between bg-slate-50 p-4 rounded-[10px] border border-slate-200">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-slate-900">{file.name}</span>
                    <span className="ml-2 text-xs text-slate-500">({(file.size / 1024).toFixed(2)} KB)</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={resetForm} className="p-1 text-slate-500 hover:text-rose-600 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "uploading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Uploading and Processing</h3>
              <p className="text-sm text-slate-500 mb-6">Please wait while we process your file...</p>
              <div className="w-full max-w-md bg-slate-100 rounded-full h-4 mb-2">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">{uploadProgress}% Complete</p>
            </div>
          )}

          {step === "validation" && validationResult && (
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-[10px] p-4 border border-amber-200">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800">Validation Results</h3>
                    <p className="mt-1 text-sm text-amber-700">
                      {validationResult.successCount} out of {validationResult.totalRecords} records were successfully
                      added. {validationResult.failedCount} records had errors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-[10px] overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="font-medium text-slate-900">Error Details</h3>
                </div>
                <div className="max-h-64 overflow-y-auto p-4">
                  {validationResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="mb-4 last:mb-0 bg-rose-50 p-3 rounded-md border border-rose-200"
                    >
                      <h4 className="font-medium text-slate-900 mb-1">
                        Row {error.row + 1} {/* Adding 1 to account for 0-based index */}
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                        {error.errors.map((err, i) => (
                          <li key={i} className="text-rose-700">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "complete" && validationResult && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Successful!</h3>
              <p className="text-center text-slate-500 mb-6">
                Successfully added {validationResult.successCount} out of {validationResult.totalRecords}{" "}
                {entityName.toLowerCase()}s to the system.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "initial" && (
          <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={uploadFile}
              disabled={!file || isUploading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" /> Processing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" /> Upload and Process
                </>
              )}
            </button>
          </div>
        )}

        {step === "validation" && (
          <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
            >
              Upload Another File
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
