import type React from "react"

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "failed" | "resolved" | "open" | "paid"
  size?: "sm" | "md" | "lg"
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const statusConfig = {
    active: { tone: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Active" },
    inactive: { tone: "bg-rose-50 text-rose-700 border-rose-200", text: "Inactive" },
    pending: { tone: "bg-amber-50 text-amber-700 border-amber-200", text: "Pending" },
    completed: { tone: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Completed" },
    failed: { tone: "bg-rose-50 text-rose-700 border-rose-200", text: "Failed" },
    resolved: { tone: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Resolved" },
    open: { tone: "bg-blue-50 text-blue-700 border-blue-200", text: "Open" },
    paid: { tone: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Paid" },
  }

  const config = statusConfig[status] || { tone: "bg-slate-100 text-slate-600 border-slate-200", text: status }
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2 py-1 text-[11px]",
    lg: "px-3 py-1 text-[12px]",
  }

  return (
    <span className={`${config.tone} border font-medium rounded ${sizeClasses[size]} inline-block leading-none`}>
      {config.text}
    </span>
  )
}

export default StatusBadge
