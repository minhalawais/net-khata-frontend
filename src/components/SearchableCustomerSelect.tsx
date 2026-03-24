import { useState, useMemo } from "react"
import { Search, Users, Hash, ChevronDown, X } from "lucide-react"

/*
 * SearchableCustomerSelect — NetDaftar ERP · Slate + Blue
 *
 * All old custom tokens replaced with system tokens:
 *   text-deep-ocean      → text-slate-900
 *   bg-light-sky/30      → bg-white  (inputs are bg-white, not tinted)
 *   text-electric-blue   → text-blue-600
 *   text-slate-gray      → text-slate-500
 *   border-slate-gray/20 → border-slate-200
 *   border-coral-red     → border-rose-500
 *   bg-electric-blue/10  → bg-blue-50
 *   hover:bg-light-sky   → hover:bg-blue-50/40
 *
 * Skill 10 — trigger: h-9 rounded-md, icon w-4 h-4 (not h-5 w-5)
 * Skill 09 / 10 — dropdown: border border-slate-200 rounded-md, no shadow-lg
 * Skill 05 — column labels: text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em]
 * Skill 02 — active option: bg-blue-50 border border-blue-200 (not shadow-sm)
 */

interface Customer {
  id:         string
  name:       string
  internetId: string
}

interface SearchableCustomerSelectProps {
  customers:        Customer[]
  value:            string
  onChange:         (e: React.ChangeEvent<HTMLSelectElement>) => void
  onCustomerSelect?: (customerId: string) => void
  error?:           string
  placeholder?:     string
}

export function SearchableCustomerSelect({
  customers,
  value,
  onChange,
  onCustomerSelect,
  error,
  placeholder = "Search and select customer",
}: SearchableCustomerSelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen,     setIsOpen]     = useState(false)

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers
    const q = searchTerm.toLowerCase()
    return customers.filter(c =>
      (c.name?.toLowerCase()       || "").includes(q) ||
      (c.internetId?.toLowerCase() || "").includes(q) ||
      (c.id?.toLowerCase()         || "").includes(q)
    )
  }, [customers, searchTerm])

  const selectedCustomer = customers.find(c => c.id === value)

  const handleSelect = (customerId: string) => {
    if (onCustomerSelect) {
      onCustomerSelect(customerId)
    } else {
      onChange({
        target: { name: "customer_id", value: customerId },
      } as React.ChangeEvent<HTMLSelectElement>)
    }
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="relative">

      {/* ── Trigger ──────────────────────────────────────────────────────────── */}
      {/*
       * Skill 10 — trigger input:
       *   h-9 (36px), rounded-md, border border-slate-200
       *   bg-white (not bg-light-sky/30)
       *   focus equivalent: border-blue-500 ring-2 ring-blue-500/[0.12]
       *   Error: border-rose-500 (not border-coral-red)
       */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-9 pl-8 pr-8
          flex items-center text-left
          text-[13px] bg-white
          border rounded-md
          transition-colors duration-150 cursor-pointer
          ${error
            ? "border-rose-500 focus:ring-rose-500/[0.12]"
            : "border-slate-200 hover:border-slate-300"
          }
          ${isOpen ? "border-blue-500 ring-2 ring-blue-500/[0.12]" : ""}
        `}
      >
        {/* Left icon — w-4 h-4 per Skill 02, NOT h-5 w-5 */}
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Users className="w-4 h-4 text-slate-400" />
        </span>

        {selectedCustomer ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Name */}
            <span className="text-[13px] font-medium text-slate-900 truncate">
              {selectedCustomer.name}
            </span>
            {/* Internet ID pill */}
            <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded flex-shrink-0">
              <Hash className="w-3 h-3" />
              {selectedCustomer.internetId}
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-slate-400">{placeholder}</span>
        )}

        {/* Right: clear (when selected) or chevron */}
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
          {selectedCustomer ? (
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
      {/*
       * No shadow-lg (no decorative shadows).
       * border border-slate-200 provides the separation.
       * rounded-md (same as trigger).
       * max-h-72 with overflow-y-auto.
       */}
      {isOpen && (
        <>
          {/* Click-outside overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md max-h-72 overflow-hidden flex flex-col">

            {/* Search input — sticky at top */}
            <div className="p-2.5 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, internet ID, or customer ID…"
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

            {/* Options list */}
            <div className="overflow-y-auto flex-1 p-1.5">
              {filteredCustomers.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center">
                  {/* Skill 05 — empty state: icon + heading + caption */}
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[12px] font-medium text-slate-600">No customers found</p>
                  {searchTerm && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No results for &ldquo;{searchTerm}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                filteredCustomers.map(customer => {
                  const isSelected = value === customer.id
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleSelect(customer.id)}
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

                        {/* Customer name + ID */}
                        <div className="flex-1 min-w-[140px]">
                          {/* Skill 05 — column label: text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] */}
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">
                            Customer
                          </p>
                          <p className="text-[13px] font-medium text-slate-800">
                            {customer.name}
                          </p>
                        </div>

                        {/* Internet ID */}
                        <div className="min-w-[100px]">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">
                            Internet ID
                          </p>
                          {/* Skill 05 — blue for primary identifier */}
                          <p className="text-[12px] font-medium text-blue-600">
                            {customer.internetId}
                          </p>
                        </div>

                        {/* Customer ID — muted, font-mono */}
                        <div className="min-w-[80px]">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-0.5">
                            ID
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {customer.id.slice(0, 8)}…
                          </p>
                        </div>

                      </div>
                    </button>
                  )
                })
              )}
            </div>

          </div>
        </>
      )}

      {/* Error message — Skill 10 */}
      {error && (
        <p className="text-[11px] text-rose-600 mt-1">{error}</p>
      )}

    </div>
  )
}