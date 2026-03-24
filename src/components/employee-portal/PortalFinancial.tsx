"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import { toast } from "react-toastify"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  ArrowDownRight,
  Clock,
  ArrowUpRight,
} from "lucide-react"
import HorizontalLogo from "../../assets/net_khata_horizontal.png"

interface FinancialData {
  current_balance: number
  total_paid: number
  total_earned: number
  month_earnings: number
  salary: number
  breakdown: Record<string, number>
  ledger: LedgerEntry[]
}

interface LedgerEntry {
  id: string
  transaction_type: string
  amount: number
  description: string | null
  created_at: string | null
}

const transactionTypeLabels: Record<string, string> = {
  connection_commission: "Connection Commission",
  complaint_commission: "Complaint Commission",
  salary_accrual: "Salary",
  payout: "Payout",
  adjustment: "Adjustment",
}

const transactionTypeColors: Record<string, string> = {
  connection_commission: "text-green-600 bg-green-50",
  complaint_commission: "text-blue-600 bg-blue-50",
  salary_accrual: "text-purple-600 bg-purple-50",
  payout: "text-red-600 bg-red-50",
  adjustment: "text-orange-600 bg-orange-50",
}

export function PortalFinancial() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancial()
  }, [])

  const fetchFinancial = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get("/employee-portal/financial", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(response.data)
    } catch (error) {
      console.error("Failed to fetch financial:", error)
      toast.error("Failed to load financial data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load financial data</p>
      </div>
    )
  }

  const summaryCards = [
    {
      label: "Current Balance",
      value: data.current_balance,
      icon: Wallet,
      color: "text-blue-600 bg-blue-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "This Month",
      value: data.month_earnings,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "Total Earned",
      value: data.total_earned,
      icon: DollarSign,
      color: "text-slate-700 bg-slate-100",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
    {
      label: "Total Paid",
      value: data.total_paid,
      icon: CreditCard,
      color: "text-blue-600 bg-blue-100/50",
      bgColor: "bg-white border border-slate-200/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]",
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={HorizontalLogo} alt="Net Khata Logo" className="h-9 w-auto object-contain" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">Financial Overview</h1>
            <p className="text-[12px] text-slate-500 mt-1.5">Track your earnings, collections, and salary details</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-[12px] p-5 hover:border-blue-300 transition-all duration-300 group`}
            >
              <div className={`${card.color} w-10 h-10 rounded-[10px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-current" />
              </div>
              <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none mb-1.5">
                PKR {card.value.toLocaleString()}
              </p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Salary Info - Premium Widget */}
      <div className="relative overflow-hidden bg-blue-600 text-white border border-blue-700 rounded-[12px] p-6 lg:p-8 shadow-md">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-blue-500/20 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-indigo-500/20 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[13px] font-medium text-blue-100 uppercase tracking-[0.06em] mb-2 text-shadow-sm">Monthly Base Salary</p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">PKR {data.salary.toLocaleString()}</p>
          </div>
          <div className="w-14 h-14 rounded-[12px] bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.2)] transition-transform hover:scale-105 duration-300 self-start md:self-center">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {Object.keys(data.breakdown).length > 0 && (
        <div className="bg-white rounded-[10px] border border-slate-200 p-4 lg:p-6">
          <h3 className="text-[13px] font-medium text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Earnings Breakdown
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.breakdown).map(([type, amount]) => (
              <div key={type} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <p className="text-[11px] text-slate-500 capitalize">
                  {transactionTypeLabels[type] || type.replace("_", " ")}
                </p>
                <p className={`text-lg font-bold ${amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                  PKR {Math.abs(amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger */}
      <div className="bg-white rounded-[10px] border border-slate-200 p-4 lg:p-6">
        <h3 className="text-[13px] font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Transaction History
        </h3>
        
        {data.ledger.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {data.ledger.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${transactionTypeColors[entry.transaction_type] || "bg-gray-100 text-gray-600"}`}>
                    {entry.amount >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-slate-900">
                      {transactionTypeLabels[entry.transaction_type] || entry.transaction_type}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {entry.description || "No description"}
                    </p>
                    {entry.created_at && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <p className={`text-sm font-bold ${entry.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {entry.amount >= 0 ? "+" : ""}PKR {entry.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
