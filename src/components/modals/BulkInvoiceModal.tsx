"use client"

import { toast } from "../../utils/toast.ts"
import { useState, useEffect } from "react"
import { Calendar, Users, CheckCircle, Loader, AlertCircle, X, FileText } from "lucide-react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"

interface CustomerPreview {
  id: string; name: string; internet_id: string; service_plan_name: string
  service_plan_price: number; discount_amount: number; discount_percentage: number
  total_amount: number; billing_start_date: string; billing_end_date: string
  due_date: string; has_existing_invoice: boolean; existing_invoice_number?: string
}

interface BulkInvoiceModalProps {
  isVisible: boolean; onClose: () => void; onSuccess: () => void
}

export function BulkInvoiceModal({ isVisible, onClose, onSuccess }: BulkInvoiceModalProps) {
  const [step, setStep] = useState<"month" | "preview" | "generating" | "results">("month")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [customers, setCustomers] = useState<CustomerPreview[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generationResult, setGenerationResult] = useState<any>(null)

  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ]

  useEffect(() => { if (isVisible) resetForm() }, [isVisible])

  /* ── ESCAPE + SCROLL LOCK ── */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isVisible) { document.addEventListener("keydown", handleEscape); document.body.style.overflow = "hidden" }
    return () => { document.removeEventListener("keydown", handleEscape); document.body.style.overflow = "unset" }
  }, [isVisible, onClose])

  const resetForm = () => {
    setStep("month"); setSelectedMonth(""); setCustomers([])
    setSelectedCustomers([]); setGenerationResult(null)
  }

  const getMonthPreview = async () => {
    if (!selectedMonth) { toast.error("Please select a month"); return }
    setIsLoading(true)
    try {
      const token = getToken()
      const response = await axiosInstance.post("/invoices/bulk-monthly/preview", { target_month: selectedMonth }, { headers: { Authorization: `Bearer ${token}` } })
      setCustomers(response.data.customers)
      setSelectedCustomers(response.data.customers.filter((c: CustomerPreview) => !c.has_existing_invoice).map((c: CustomerPreview) => c.id))
      setStep("preview")
    } catch {
      toast.error("Failed to load customers for selected month")
    } finally { setIsLoading(false) }
  }

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers((prev) => prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId])
  }

  const toggleSelectAll = () => {
    const selectable = customers.filter((c) => !c.has_existing_invoice)
    setSelectedCustomers(selectedCustomers.length === selectable.length ? [] : selectable.map((c) => c.id))
  }

  const generateInvoices = async () => {
    if (selectedCustomers.length === 0) { toast.error("Please select at least one customer"); return }
    setIsLoading(true); setStep("generating")
    try {
      const token = getToken()
      const response = await axiosInstance.post("/invoices/bulk-monthly/generate",
        { customer_ids: selectedCustomers, target_month: selectedMonth },
        { headers: { Authorization: `Bearer ${token}` } })
      setGenerationResult(response.data); setStep("results")
      if (response.data.total_generated > 0) { toast.success(`Generated ${response.data.total_generated} invoices successfully`); onSuccess() }
      if (response.data.total_failed > 0) toast.warning(`${response.data.total_failed} invoices failed to generate`)
    } catch {
      toast.error("Failed to generate invoices"); setStep("preview")
    } finally { setIsLoading(false) }
  }

  if (!isVisible) return null

  return (
    /* ── BACKDROP: rgba only, no backdrop-blur ── */
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.50)" }}
      onClick={onClose}
    >
      {/* ── PANEL: rounded-xl, border only, no shadow-2xl, no entrance animation ── */}
      <div
        className="bg-white rounded-xl border border-slate-200 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── HEADER: bg-white border-b, no gradient ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-slate-900">Generate Monthly Invoices</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Bulk invoice generation with customer preview</p>
            </div>
          </div>
          {/* ── CLOSE: rounded-md not rounded-full ── */}
          <button onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* STEP: Month Selection */}
          {step === "month" && (
            <div className="space-y-5">
              {/* Info card */}
              <div className="bg-slate-50 rounded-[10px] border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-900 mb-2">Monthly Invoice Generation</p>
                    <ul className="space-y-1.5">
                      {[
                        "Select the month for which you want to generate invoices",
                        "System will auto-deselect customers who already have invoices",
                        "You can manually select/deselect customers as needed",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[13px] text-slate-600">
                          {/* ── BULLET: small slate dot ── */}
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Month grid */}
              <div>
                <p className="text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em] mb-3">Select Month</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {months.map((month) => (
                    <button key={month.value} type="button"
                      onClick={() => setSelectedMonth(month.value)}
                      className={`py-3 px-4 rounded-[10px] border text-center transition-colors duration-150 ${
                        selectedMonth === month.value
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/20"
                      }`}
                    >
                      <Calendar className="w-4 h-4 mx-auto mb-1.5 opacity-60" />
                      <span className="text-[13px] font-medium">{month.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-[15px] font-medium text-slate-900">
                  Preview — {months.find((m) => m.value === selectedMonth)?.label} {new Date().getFullYear()}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
                    {selectedCustomers.length} of {customers.filter((c) => !c.has_existing_invoice).length} selected
                  </span>
                  {/* ── SELECT ALL: ghost button ── */}
                  <button type="button" onClick={toggleSelectAll}
                    className="px-3 py-1.5 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150">
                    {selectedCustomers.length === customers.filter((c) => !c.has_existing_invoice).length ? "Deselect All" : "Select All"}
                  </button>
                </div>
              </div>

              {/* Preview table */}
              <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {["Select", "Customer", "Service Plan", "Amount", "Due Date", "Status"].map((col) => (
                          <th key={col}
                            className="px-4 py-2.5 text-left text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map((customer) => (
                        <tr key={customer.id}
                          className={`transition-colors ${customer.has_existing_invoice ? "bg-amber-50/40" : "hover:bg-blue-50/30"}`}>
                          <td className="px-4 py-3">
                            {!customer.has_existing_invoice && (
                              <input type="checkbox"
                                checked={selectedCustomers.includes(customer.id)}
                                onChange={() => toggleCustomerSelection(customer.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500/[0.12] border-slate-300 rounded cursor-pointer"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[13px] font-medium text-slate-700">{customer.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{customer.internet_id}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[13px] text-slate-700">{customer.service_plan_name}</div>
                            <div className="text-[11px] text-slate-400 tabular-nums">
                              <span className="text-[10px] mr-0.5">PKR</span>
                              {customer.service_plan_price.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[13px] font-medium text-slate-900 tabular-nums">
                              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
                              {customer.total_amount.toFixed(2)}
                            </div>
                            {customer.discount_amount > 0 && (
                              <div className="text-[11px] text-rose-500 tabular-nums">
                                −PKR {customer.discount_amount.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[13px] text-slate-600">
                              {new Date(customer.due_date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {customer.has_existing_invoice ? (
                              /* ── ALREADY GENERATED: amber badge ── */
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                                <FileText className="w-3 h-3" />
                                Already Generated
                              </span>
                            ) : (
                              /* ── READY: emerald badge ── */
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Auto-deselected notice */}
              {customers.filter((c) => c.has_existing_invoice).length > 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[10px] p-4">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-amber-900">Auto-deselected Customers</p>
                    <p className="text-[13px] text-amber-800 mt-0.5">
                      {customers.filter((c) => c.has_existing_invoice).length} customers already have invoices for this month.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: Generating */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <Loader className="w-7 h-7 animate-spin text-blue-600" />
              </div>
              <h3 className="text-[15px] font-medium text-slate-900 mb-1">Generating Invoices</h3>
              <p className="text-[13px] text-slate-400 text-center max-w-md">
                Please wait while we generate invoices for {selectedCustomers.length} customers...
              </p>
            </div>
          )}

          {/* STEP: Results */}
          {step === "results" && generationResult && (
            <div className="space-y-4">
              {/* Result summary banner */}
              <div className={`flex items-start gap-3 rounded-[10px] p-4 border ${
                generationResult.total_failed === 0
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                {generationResult.total_failed === 0
                  ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="text-[13px] font-medium text-slate-900">Generation Complete</p>
                  <p className="text-[13px] text-slate-600 mt-0.5">
                    Successfully generated {generationResult.total_generated} invoices.
                    {generationResult.total_failed > 0 && ` ${generationResult.total_failed} invoices failed.`}
                  </p>
                </div>
              </div>

              {/* Failed invoices */}
              {generationResult.failed?.length > 0 && (
                <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
                  <div className="bg-rose-50 px-5 py-3 border-b border-rose-200">
                    <p className="text-[13px] font-medium text-rose-900">Failed Invoices</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                    {generationResult.failed.map((failed: any, index: number) => (
                      <div key={index} className="bg-rose-50 rounded-md border border-rose-200 px-3 py-2.5">
                        <div className="text-[13px] font-medium text-slate-700">{failed.customer_name}</div>
                        <div className="text-[11px] text-rose-600 mt-0.5">{failed.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated invoices */}
              {generationResult.generated?.length > 0 && (
                <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">
                  <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-200">
                    <p className="text-[13px] font-medium text-emerald-900">Generated Invoices</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                    {generationResult.generated.map((invoice: any, index: number) => (
                      <div key={index} className="bg-emerald-50 rounded-md border border-emerald-200 px-3 py-2.5">
                        <div className="text-[13px] font-medium text-slate-700">{invoice.customer_name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                          Invoice: {invoice.invoice_number} · PKR {invoice.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER: bg-slate-50 border-t ── */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between gap-3 flex-shrink-0">
          {step === "month" && (
            <>
              <button onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                Cancel
              </button>
              <button onClick={getMonthPreview} disabled={!selectedMonth || isLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                {isLoading ? <><Loader className="w-4 h-4 animate-spin" /> Loading...</> : <><Users className="w-4 h-4" /> Continue to Preview</>}
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button onClick={() => setStep("month")}
                className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                Back
              </button>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button onClick={onClose}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                  Cancel
                </button>
                <button onClick={generateInvoices} disabled={selectedCustomers.length === 0 || isLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                  {isLoading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4" /> Generate {selectedCustomers.length} Invoices</>}
                </button>
              </div>
            </>
          )}

          {step === "results" && (
            <div className="flex flex-col-reverse sm:flex-row w-full justify-end gap-2">
              <button onClick={resetForm}
                className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors duration-150">
                Generate More
              </button>
              <button onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-md hover:bg-blue-700 transition-colors duration-150">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}