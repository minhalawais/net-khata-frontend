"use client"
import { useState } from "react"
import FinancialIntelligenceV2 from "./FinancialIntelligenceV2.tsx"
import { Ledger } from "./ledger/Ledger.tsx"

type DashboardDateRange = {
  startDate: string
  endDate: string
}

type UnifiedDashboardProps = {
  dateRange?: DashboardDateRange
  onDateRangeChange?: (range: DashboardDateRange) => void
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ dateRange, onDateRangeChange }) => {
  const [activeTab, setActiveTab] = useState<"analytics" | "ledger">("analytics")

  const tabControls = (
    <>
      <button
        onClick={() => setActiveTab("analytics")}
        className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors duration-150 ${
          activeTab === "analytics"
            ? "bg-blue-600 text-white"
            : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
        }`}
      >
        Financial Dashboard
      </button>
      <button
        onClick={() => setActiveTab("ledger")}
        className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] transition-colors duration-150 ${
          activeTab === "ledger"
            ? "bg-blue-600 text-white"
            : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
        }`}
      >
        Ledger
      </button>
    </>
  )

  return (
    <main className="space-y-5">
      <div className="w-full">
        {activeTab === "analytics" && (
          <FinancialIntelligenceV2
            tabControls={tabControls}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
        )}
        {activeTab === "ledger" && (
          <Ledger
            tabControls={tabControls}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
        )}
      </div>
    </main>
  )
}
