import { useState, useMemo } from "react"
import { Search, FileText, User, Hash, Calendar, ChevronDown, X } from "lucide-react"

/*
 * SearchableSelect (Invoice) — NetDaftar ERP · Slate + Blue
 *
 * Same token corrections as SearchableCustomerSelect:
 *   text-deep-ocean      → text-slate-900
 *   bg-light-sky/30      → bg-white
 *   text-electric-blue   → text-blue-600
 *   text-slate-gray      → text-slate-500
 *   border-slate-gray/20 → border-slate-200
 *   border-coral-red     → border-rose-500
 *   text-emerald-green   → text-emerald-600
 *   bg-electric-blue/10  → bg-blue-50
 *   shadow-lg / shadow-sm → removed
 *
 * Skill 10 — h-9 trigger, rounded-md, border border-slate-200
 * Skill 05 — column labels: text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em]
 * Skill 02 — active option: bg-blue-50 border border-blue-200
 */

interface SearchableSelectProps {
  options:     any[]
  value:       string
  onChange:    (e: React.ChangeEvent<HTMLSelectElement>) => void
  error?:      string
  placeholder?: string
}

// Format date range helper — preserved exactly
const formatDateRange = (startDate: string, endDate: string): string => {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d)
  return `${fmt(new Date(startDate))} – ${fmt(new Date(endDate))}`
}

export function SearchableSelect({
  options,
  value,
  onChange,
  error,
  placeholder = "Search and select invoice",
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen,     setIsOpen]     = useState(false)

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    const q = searchTerm.toLowerCase()
    return options.filter(o =>
      o.customer_name.toLowerCase().includes(q)           ||
      o.customer_internet_id.toLowerCase().includes(q)    ||
      o.invoice_number.toLowerCase().includes(q)
    )
  }, [options, searchTerm])

  const selectedInvoice = options.find(o => o.id === value)

  const handleSelect = (invoiceId: string) => {
    onChange({
      target: { name: "invoice_id", value: invoiceId },
    } as React.ChangeEvent<HTMLSelectElement>)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="relative">

      {/* ── Trigger ──────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full min-h-[36px] pl-8 pr-8 py-1.5
          flex items-center text-left
          text-[13px] bg-white
          border rounded-md
          transition-colors duration-150 cursor-pointer
          ${error
            ? "border-rose-500"
            : "border-slate-200 hover:border-slate-300"
          }
          ${isOpen ? "border-blue-500 ring-2 ring-blue-500/[0.12]" : ""}
        `}
      >
        {/* Left icon */}
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <FileText className="w-4 h-4 text-slate-400" />
        </span>

        {selectedInvoice ? (
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0 py-0.5">
            {/* Invoice number */}
            <span className="text-[11px] font-medium text-slate-900 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex-shrink-0">
              {selectedInvoice.invoice_number}
            </span>
            {/* Customer */}
            <span className="flex items-center gap-1 text-[12px] text-slate-700 truncate">
              <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
              {selectedInvoice.customer_name}
            </span>
            {/* Internet ID */}
            <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 flex-shrink-0">
              <Hash className="w-3 h-3" />
              {selectedInvoice.customer_internet_id}
            </span>
            {/* Amount */}
            <span className="ml-auto text-[12px] font-medium text-emerald-600 tabular-nums flex-shrink-0">
              PKR {parseFloat(selectedInvoice.total_amount).toFixed(0)}
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-slate-400">{placeholder}</span>
        )}

        {/* Right: clear or chevron */}
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
          {selectedInvoice ? (
            <button
              type="button"
              className="pointer-events-auto p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors duration-150"
              onClick={e => { e.stopPropagation(); handleSelect("") }}
              aria-label="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
          )}
        </span>
      </button>

      {/* ── Dropdown ─────────────────────────────────────────────────────────── */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md max-h-80 overflow-hidden flex flex-col">

            {/* Search */}
            <div className="p-2.5 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by customer name, internet ID, or invoice number…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                  className="
                    w-full h-8 pl-8 pr-3
                    text-[12px] text-slate-900 placeholder:text-slate-400
                    bg-white border border-slate-200 rounded-md
                    focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
                    hover:border-slate-300 transition-colors duration-150
                  "
                />
              </div>
            </div>

            {/* Options */}
            <div className="overflow-y-auto flex-1 p-1.5">
              {filteredOptions.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[12px] font-medium text-slate-600">No invoices found</p>
                  {searchTerm && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No results for &ldquo;{searchTerm}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                filteredOptions.map(invoice => {
                  const isSelected = value === invoice.id
                  return (
                    <button
                      key={invoice.id}
                      type="button"
                      onClick={() => handleSelect(invoice.id)}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-md mb-0.5
                        transition-colors duration-100 cursor-pointer
                        ${isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-blue-50/40 border border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 flex-wrap">

                        {/* Invoice number */}
                        <div className="flex-shrink-0">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">
                            Invoice
                          </p>
                          <p className="text-[12px] font-medium text-slate-900 font-mono">
                            {invoice.invoice_number}
                          </p>
                        </div>

                        {/* Customer info */}
                        <div className="flex-1 min-w-[120px]">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">
                            Customer
                          </p>
                          <p className="text-[13px] font-medium text-slate-800 truncate max-w-[140px]">
                            {invoice.customer_name}
                          </p>
                          <p className="text-[11px] font-medium text-blue-600 mt-0.5">
                            {invoice.customer_internet_id}
                          </p>
                        </div>

                        {/* Billing period */}
                        {invoice.billing_start_date && invoice.billing_end_date && (
                          <div className="min-w-[100px]">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">
                              Period
                            </p>
                            <p className="text-[12px] text-slate-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              {formatDateRange(invoice.billing_start_date, invoice.billing_end_date)}
                            </p>
                          </div>
                        )}

                        {/* Amount */}
                        <div className="ml-auto text-right flex-shrink-0">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">
                            Amount
                          </p>
                          {/* Skill 05 — emerald for positive financial value */}
                          <p className="text-[13px] font-medium text-emerald-600 tabular-nums">
                            PKR {parseFloat(invoice.total_amount).toFixed(0)}
                          </p>
                        </div>

                      </div>

                      {/* Due date — below the grid row */}
                      {invoice.due_date && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(invoice.due_date).toLocaleDateString("en-PK")}
                          </span>
                        </div>
                      )}

                    </button>
                  )
                })
              )}
            </div>

          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <p className="text-[11px] text-rose-600 mt-1">{error}</p>
      )}

    </div>
  )
}