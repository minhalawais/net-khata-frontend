"use client"

import { toast } from "../../utils/toast.ts"
import React, { useMemo, useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, CheckCircle2, XCircle, Search } from "lucide-react"
import { Table } from "../../components/table/table.tsx"
import { Modal } from "../../components/modal.tsx"
import { Topbar } from "../../components/topNavbar.tsx"
import { Sidebar } from "../../components/sideNavbar.tsx"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"

interface SubZone {
  id: string
  area_id: string
  area_name: string
  name: string
  description: string
  is_active: boolean
}

interface Area {
  id: string
  name: string
}

const SubZoneManagement: React.FC = () => {
  const { areaId } = useParams<{ areaId: string }>()
  const navigate = useNavigate()
  const isScopedMode = Boolean(areaId)

  const [subZones, setSubZones] = useState<SubZone[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [area, setArea] = useState<Area | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<SubZone | null>(null)
  const [formData, setFormData] = useState<Partial<SubZone>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [areaSearch, setAreaSearch] = useState("")
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false)

  useEffect(() => {
    document.title = isScopedMode ? "Sub-Zones by Area | Net Khata" : "Sub-Zone Management | Net Khata"
    fetchData()
  }, [areaId])

  const filteredAreas = useMemo(() => {
    const query = areaSearch.trim().toLowerCase()
    if (!query) return areas.slice(0, 8)
    return areas.filter((a) => a.name.toLowerCase().includes(query)).slice(0, 8)
  }, [areas, areaSearch])

  const fetchData = async () => {
    setIsLoading(true)
    const token = getToken()
    try {
      const areasResponse = await axiosInstance.get("/areas/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allAreas: Area[] = areasResponse.data || []
      setAreas(allAreas)

      if (isScopedMode && areaId) {
        const subZonesResponse = await axiosInstance.get(`/sub-zones/by-area/${areaId}?include_inactive=true`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const foundArea = allAreas.find((a) => a.id === areaId) || null
        setArea(foundArea)
        setSubZones(
          (subZonesResponse.data || []).map((sz: any) => ({
            ...sz,
            area_name: foundArea?.name || "Unknown",
          })),
        )
      } else {
        const subZonesResponse = await axiosInstance.get("/sub-zones/list", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setArea(null)
        setSubZones(subZonesResponse.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
      toast.error("Failed to fetch sub-zones")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getToken()
    const selectedAreaId = isScopedMode ? areaId : formData.area_id

    if (!formData.name?.trim()) {
      toast.error("Sub-zone name is required")
      return
    }

    if (!selectedAreaId) {
      toast.error("Please select an area")
      return
    }

    setIsLoading(true)

    try {
      if (editingItem) {
        await axiosInstance.put(`/sub-zones/update/${editingItem.id}`, {
          ...formData,
          area_id: selectedAreaId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Sub-zone updated successfully")
      } else {
        await axiosInstance.post("/sub-zones/add", { ...formData, area_id: selectedAreaId }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Sub-zone added successfully")
      }
      setIsModalVisible(false)
      setEditingItem(null)
      setFormData({})
      setAreaSearch("")
      setShowAreaSuggestions(false)
      fetchData()
    } catch (error) {
      console.error("Failed to save sub-zone", error)
      toast.error("Failed to save sub-zone")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-zone?")) return

    const token = getToken()
    try {
      await axiosInstance.delete(`/sub-zones/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Sub-zone deleted successfully")
      fetchData()
    } catch (error) {
      console.error("Failed to delete sub-zone", error)
      toast.error("Failed to delete sub-zone")
    }
  }

  const openCreateModal = () => {
    setEditingItem(null)
    if (isScopedMode && areaId) {
      setFormData({ area_id: areaId })
      setAreaSearch(area?.name || "")
    } else {
      setFormData({})
      setAreaSearch("")
    }
    setIsModalVisible(true)
  }

  const openEditModal = (item: SubZone) => {
    setEditingItem(item)
    setFormData(item)
    if (!isScopedMode) {
      setAreaSearch(item.area_name || "")
    }
    setIsModalVisible(true)
  }

  const columns = useMemo<ColumnDef<SubZone>[]>(
    () => {
      const baseColumns: ColumnDef<SubZone>[] = [
        {
          header: "Name",
          accessorKey: "name",
          cell: (info) => <span className="text-[13px] font-medium text-slate-800">{info.getValue() as string}</span>,
        },
      ]

      if (!isScopedMode) {
        baseColumns.push({
          header: "Area",
          accessorKey: "area_name",
          cell: (info) => <span className="text-[13px] text-slate-700">{(info.getValue() as string) || "Unknown"}</span>,
        })
      }

      baseColumns.push(
        {
          header: "Description",
          accessorKey: "description",
          cell: (info) => (
            <div className="max-w-xs overflow-hidden overflow-ellipsis whitespace-nowrap text-[13px] text-slate-500" title={info.getValue() as string}>
              {(info.getValue() as string) || "No description"}
            </div>
          ),
        },
        {
          header: "Status",
          accessorKey: "is_active",
          cell: (info) => (
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${info.getValue() ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
              {info.getValue() ? "Active" : "Inactive"}
            </span>
          ),
        },
        {
          header: "Actions",
          cell: (info) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(info.row.original)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(info.row.original.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors duration-150"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ),
        },
      )

      return baseColumns
    },
    [isScopedMode, openEditModal]
  );

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const totalSubZones = subZones.length
  const activeSubZones = subZones.filter((item) => item.is_active).length
  const inactiveSubZones = totalSubZones - activeSubZones

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-0 sm:p-6 pt-20 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0 lg:ml-20"}`}>
          <div className="max-w-[1400px] mx-auto space-y-4">
            <div className="bg-white rounded-[10px] border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  {isScopedMode && (
                    <button
                      onClick={() => navigate("/area-zone-management")}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-colors duration-150"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <div>
                    <h1 className="text-[15px] font-medium text-slate-900 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </span>
                      {isScopedMode ? `Sub-Zones for ${area?.name || "Loading..."}` : "Sub-Zone Management"}
                    </h1>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isScopedMode ? "Manage sub-zones within this area" : "Manage sub-zones across all areas"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={openCreateModal}
                  className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 inline-flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add Sub-Zone
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-[10px] border border-slate-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1">Total Sub-Zones</p>
                  <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">{totalSubZones}</p>
                </div>
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4.5 h-4.5 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-[10px] border border-slate-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1">Active</p>
                  <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">{activeSubZones}</p>
                </div>
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4.5 h-4.5 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-[10px] border border-slate-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em] mb-1">Inactive</p>
                  <p className="text-[22px] font-semibold text-slate-900 tabular-nums leading-none">{inactiveSubZones}</p>
                </div>
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <XCircle className="w-4.5 h-4.5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[10px] border border-slate-200 p-4">
              <Table
                data={subZones}
                columns={columns}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>

      <Modal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false)
          setEditingItem(null)
          setFormData({})
          setAreaSearch("")
          setShowAreaSuggestions(false)
        }}
        title={editingItem ? "Edit Sub-Zone" : "Add Sub-Zone"}
        isLoading={isLoading}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isScopedMode && (
            <div className="relative">
              <label className="block text-[11px] font-medium text-slate-600 mb-1.5">Area * (searchable)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={areaSearch}
                  onChange={(e) => {
                    setAreaSearch(e.target.value)
                    setFormData((prev) => ({ ...prev, area_id: "" }))
                    setShowAreaSuggestions(true)
                  }}
                  onFocus={() => setShowAreaSuggestions(true)}
                  placeholder="Search area by name"
                  className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
                />
              </div>
              {showAreaSuggestions && (
                <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-md max-h-44 overflow-y-auto">
                  {filteredAreas.length ? (
                    filteredAreas.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, area_id: a.id }))
                          setAreaSearch(a.name)
                          setShowAreaSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-blue-50 transition-colors duration-100"
                      >
                        {a.name}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-[12px] text-slate-400">No matching areas</p>
                  )}
                </div>
              )}
              {!formData.area_id && <p className="text-[11px] text-rose-500 mt-1">Please select an area from the list</p>}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Sub-Zone Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter sub-zone name"
                className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-md bg-white text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalVisible(false)
                setEditingItem(null)
                setFormData({})
                setAreaSearch("")
                setShowAreaSuggestions(false)
              }}
              className="h-9 px-4 text-[13px] font-medium border border-slate-200 text-slate-600 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-9 px-4 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors duration-150 flex items-center gap-2"
            >
              {isLoading ? "Saving..." : editingItem ? "Update Sub-Zone" : "Add Sub-Zone"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SubZoneManagement
