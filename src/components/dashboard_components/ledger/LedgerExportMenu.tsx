"use client"

import React, { useState } from "react"
import { ChevronDown, Download, FileText, File, FileJson } from "lucide-react"

type FilterState = {
  startDate: string
  endDate: string
  bankAccount: string
  paymentMethod: string
  invoiceStatus: string
  ispPaymentType: string
  timeRange: string
}

type ExportMenuProps = {
  filters: FilterState
  disabled?: boolean
}

const ExportMenu: React.FC<ExportMenuProps> = ({ filters, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  // Build query params from filters
  const buildExportParams = () => {
    const params = new URLSearchParams()
    if (filters.startDate) params.append("start_date", filters.startDate)
    if (filters.endDate) params.append("end_date", filters.endDate)
    if (filters.bankAccount !== "all") params.append("bank_account_id", filters.bankAccount)
    if (filters.paymentMethod !== "all") params.append("payment_method", filters.paymentMethod)
    if (filters.invoiceStatus !== "all") params.append("invoice_status", filters.invoiceStatus)
    if (filters.ispPaymentType !== "all") params.append("isp_payment_type", filters.ispPaymentType)
    return params.toString()
  }

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    setIsExporting(true)
    setExportFormat(format)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const params = buildExportParams()
      
      // Get API base URL (same as axiosInstance)
      const baseURL = process.env.REACT_APP_API_BASE_URL || 
        (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")
      const url = `${baseURL}/dashboard/ledger/export?format=${format}&${params}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`)
      }

      // Get filename from content-disposition header if available
      const contentDisposition = response.headers.get("content-disposition")
      let filename = `Ledger-Statement-${format.toUpperCase()}.${format === "xlsx" ? "xlsx" : format}`
      
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/['"]/g, "")
      }

      // Create blob and download
      const blob = await response.blob()
      const link = document.createElement("a")
      const href = URL.createObjectURL(blob)
      link.href = href
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(href)

      setIsOpen(false)

      // Show success toast (if you have a toast system)
      console.log(`Successfully exported ledger as ${format.toUpperCase()}`)
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error)
      // Show error toast
      alert(`Failed to export ledger: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const exportOptions = [
    {
      format: "csv" as const,
      label: "Export as CSV",
      description: "Universal spreadsheet format",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      format: "xlsx" as const,
      label: "Export as Excel",
      description: "Formatted spreadsheet with styles",
      icon: <File className="w-4 h-4" />,
    },
    {
      format: "pdf" as const,
      label: "Export as PDF",
      description: "Professional statement format",
      icon: <FileJson className="w-4 h-4" />,
    },
  ]

  return (
    <div className="relative">
      {/* Export button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={`
          flex items-center gap-2
          h-9 px-3.5 py-2
          text-[13px] font-medium
          rounded-md border
          transition-all duration-150
          ${
            disabled
              ? "text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed"
              : isExporting
                ? "text-blue-600 border-blue-300 bg-blue-50"
                : "text-blue-600 border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
          }
        `}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isExporting ? "Exporting…" : "Export"}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-[10px] border border-slate-200 shadow-lg z-50 overflow-hidden">
          {/* Menu header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
              Choose Format
            </p>
          </div>

          {/* Menu items */}
          <div className="divide-y divide-slate-100">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={isExporting}
                className={`
                  w-full flex items-start gap-3 px-4 py-3
                  text-left transition-colors duration-150
                  ${
                    isExporting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-slate-50 active:bg-slate-100"
                  }
                `}
              >
                <div className="pt-0.5 text-slate-400 flex-shrink-0">
                  {exportFormat === option.format && isExporting ? (
                    <div className="animate-spin">
                      <Download className="w-4 h-4" />
                    </div>
                  ) : (
                    option.icon
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-900">
                    {option.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Menu footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] text-slate-400">
              Respects all active filters and date range
            </p>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ExportMenu
