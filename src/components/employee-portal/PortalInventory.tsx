"use client"

import { toast } from "../../utils/toast.ts"
import type React from "react"
import { useState, useEffect } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import {
  Box,
  Router,
  Cable,
  HardDrive,
  Calendar,
  CheckCircle,
  ArrowLeftRight,
} from "lucide-react"
import HorizontalLogo from "../../assets/net_khata_horizontal.png"

interface InventoryItem {
  id: string
  item_id: string
  item_type: string | null
  serial_number: string | null
  assigned_at: string | null
  returned_at: string | null
  status: string
}

const itemTypeIcons: Record<string, React.ElementType> = {
  router: Router,
  ont: HardDrive,
  cable: Cable,
}

const statusColors: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-700",
  returned: "bg-gray-100 text-gray-700",
  damaged: "bg-red-100 text-red-700",
}

export function PortalInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get("/employee-portal/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setInventory(response.data)
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-[10px]"></div>
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-[10px]"></div>
        ))}
      </div>
    )
  }

  const assignedItems = inventory.filter((item) => item.status === "assigned")
  const returnedItems = inventory.filter((item) => item.status === "returned")

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={HorizontalLogo} alt="Net Khata Logo" className="h-9 w-auto object-contain" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">Inventory Management</h1>
            <p className="text-[12px] text-slate-500 mt-1.5">Track and manage your assigned hardware equipment</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 text-center shadow-sm hover:border-blue-300 transition-colors">
          <Box className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <p className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">{inventory.length}</p>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mt-1.5">Total Items</p>
        </div>
        <div className="bg-blue-50/80 rounded-[12px] border border-blue-200/60 p-5 text-center shadow-[0_2px_8px_-4px_rgba(59,130,246,0.15)] hover:border-blue-300 transition-colors">
          <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <p className="text-[26px] font-bold text-blue-700 tracking-tight leading-none">{assignedItems.length}</p>
          <p className="text-[11px] font-medium text-blue-600 uppercase tracking-[0.06em] mt-1.5">With Me</p>
        </div>
        <div className="bg-slate-50 rounded-[12px] border border-slate-200/80 p-5 text-center shadow-sm hover:border-slate-300 transition-colors">
          <ArrowLeftRight className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-[26px] font-bold text-slate-700 tracking-tight leading-none">{returnedItems.length}</p>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] mt-1.5">Returned</p>
        </div>
      </div>

      {/* Currently Assigned */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 lg:p-6 shadow-sm">
        <h3 className="text-[14px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <Box className="w-5 h-5 text-blue-600" />
          Currently Assigned
        </h3>

        {assignedItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No items currently assigned</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedItems.map((item) => {
              const Icon = itemTypeIcons[item.item_type?.toLowerCase() || ""] || Box
              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-[10px] shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:border-blue-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  {/* Left Color Accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80"></div>

                  <div className="flex items-center gap-4 pl-2">
                    <div className="p-2.5 bg-blue-50/80 rounded-lg text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900 capitalize tracking-tight">
                        {item.item_type?.replace("_", " ") || "Unknown"}
                      </p>
                      {item.serial_number && (
                        <p className="text-[12px] text-slate-500 font-medium mt-0.5">S/N: {item.serial_number}</p>
                      )}
                      {item.assigned_at && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Assigned: {new Date(item.assigned_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${statusColors[item.status] || statusColors.assigned}`}>
                    {item.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* History */}
      {returnedItems.length > 0 && (
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 lg:p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-slate-400" />
            Returned Items
          </h3>
          <div className="space-y-3">
            {returnedItems.map((item) => {
              const Icon = itemTypeIcons[item.item_type?.toLowerCase() || ""] || Box
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200/60 rounded-[10px] relative overflow-hidden"
                >
                  {/* Left Color Accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>

                  <div className="flex items-center gap-4 pl-2">
                    <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-slate-700 capitalize tracking-tight">
                        {item.item_type?.replace("_", " ") || "Unknown"}
                      </p>
                      {item.serial_number && (
                        <p className="text-[12px] text-slate-500 mt-0.5">S/N: {item.serial_number}</p>
                      )}
                    </div>
                  </div>
                  {item.returned_at && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Returned: {new Date(item.returned_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
