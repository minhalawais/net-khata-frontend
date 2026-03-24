import type React from "react"

interface KPICardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  trend?: {
    direction: "up" | "down"
    percentage: number
  }
  subtext?: string
}

export const KPICard: React.FC<KPICardProps> = ({ icon, label, value, color, trend, subtext }) => (
  <div className="bg-white rounded-[10px] p-4 border border-slate-200 shadow-sm transition-colors duration-150 hover:border-slate-300">
    <div className="flex items-center justify-between mb-3">
      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.06em]">{label}</p>
      <div className={`${color} p-2 rounded-md`}>{icon}</div>
    </div>
    <div className="flex items-baseline justify-between">
      <p className="text-[22px] font-semibold text-slate-900">{value}</p>
      {trend && (
        <span className={`text-[11px] font-medium ${trend.direction === "up" ? "text-emerald-600" : "text-rose-600"}`}>
          {trend.direction === "up" ? "↑" : "↓"} {trend.percentage}%
        </span>
      )}
    </div>
    {subtext && <p className="text-[11px] text-slate-500 mt-2">{subtext}</p>}
  </div>
)

export default KPICard
