"use client"

import React from "react"
import type { ReactElement } from "react"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-geosearch/dist/geosearch.css"
import {
  MapPin, Phone, Calendar, User, Mail, Hash, Home, Globe, Wifi,
  Router, Box, Tv, Package, DollarSign, Loader, XCircle, CheckCircle2,
  ChevronDown,
} from "lucide-react"
import { FileUploadField } from "./FileUploadField.tsx"

interface CustomerFormProps {
  formData: Partial<Customer>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFileRemove?: (fieldName: string) => void
  isEditing: boolean
  validationErrors?: Record<string, string>
}

interface Customer {
  first_name: string; last_name: string; email: string; internet_id: string
  phone_1: string; phone_2?: string; installation_address: string
  gps_coordinates?: string; cnic: string; area_id: string; sub_zone_id?: string
  service_plan_id: string; service_plan_ids?: string[]; isp_id: string
  technician_id?: string; connection_type: string; internet_connection_type?: string
  wire_length?: string; wire_ownership?: string; router_ownership?: string
  router_id?: string; router_serial_number?: string; patch_cord_ownership?: string
  patch_cord_count?: string; patch_cord_ethernet_ownership?: string
  patch_cord_ethernet_count?: string; splicing_box_ownership?: string
  splicing_box_serial_number?: string; tv_cable_connection_type?: string
  node_count?: string; stb_serial_number?: string; cnic_front_image?: string
  cnic_back_image?: string; agreement_document?: string; discount_amount?: string
  installation_date: string; recharge_date?: string
  connection_commission_amount?: string | number
}

interface Area { id: string; name: string; sub_zones_count?: number }
interface SubZone { id: string; area_id: string; name: string }
interface ServicePlan { id: string; name: string }
interface ISP { id: string; name: string }
interface InventoryItem {
  id: string; name: string; serial_number?: string; is_splitter: boolean
  splitter_number?: string; item_type: string; quantity: number; unit_price?: number
  attributes?: { model?: string; serial_number?: string; type?: string }
}

interface InputFieldProps {
  label: string; name: string; type?: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  placeholder?: string; required?: boolean; className?: string
  options?: { value: string; label: string }[]; icon?: ReactElement
  showInternetIdStatus?: boolean
  internetIdStatus?: { checking: boolean; available: boolean | null; message: string }
  cnicStatus?: { checking: boolean; available: boolean | null; message: string }
  submitErrors?: Record<string, string>; toggleMap?: () => void
  validationErrors?: Record<string, string>
}

/* ═══════════════════════════════════════════
   SHARED STYLE CONSTANTS — Skill 10 recipe
═══════════════════════════════════════════ */
const inputBase =
  "h-9 w-full bg-white border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] transition-colors duration-150 outline-none"

const labelClass = "block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]"

/* ── SECTION HEADER: left-border overline ── */
const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-2 pl-2.5 border-l-2 border-slate-300 mb-4">
    <Icon className="w-4 h-4 text-slate-400" />
    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.08em]">{label}</span>
  </div>
)

/* ═══════════════════════════════════════════
   INPUT FIELD COMPONENT
═══════════════════════════════════════════ */
const InputField = React.memo(
  ({
    label, name, type = "text", value, onChange, placeholder, required = false,
    className = "", options = [], icon, showInternetIdStatus = false,
    internetIdStatus, cnicStatus, submitErrors, toggleMap, validationErrors,
  }: InputFieldProps) => {
    const hasError = !!(submitErrors?.[name] || validationErrors?.[name])
    const errorClass = hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/[0.12]"
      : ""

    return (
      <div className="space-y-1.5">
        <label htmlFor={name} className={labelClass}>
          {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        <div className="relative">
          {type === "select" ? (
            <>
              {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {React.cloneElement(icon, { className: "w-4 h-4 text-slate-400" })}
                </div>
              )}
              <select
                id={name} name={name} value={value || ""} onChange={onChange} required={required}
                className={`${inputBase} ${icon ? "pl-9" : "pl-3"} pr-9 appearance-none ${errorClass} ${className}`}
              >
                <option value="">Select {label}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {/* ── LUCIDE CHEVRON: replaces inline SVG ── */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </>
          ) : name === "gps_coordinates" ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id={name} type={type} name={name} value={value || ""} onChange={onChange}
                placeholder={placeholder} required={required}
                className={`${inputBase} pl-9 pr-10 ${errorClass} ${className}`}
              />
              {/* ── MAP TOGGLE: rounded-md not rounded-full ── */}
              <button
                type="button" onClick={toggleMap}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors duration-150"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
          ) : name === "phone_1" || name === "phone_2" ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id={name} type="tel" name={name} value={value || ""} onChange={onChange}
                placeholder="+92 (xxx)-xxxxxxx" required={required}
                className={`${inputBase} pl-9 ${errorClass} ${className}`}
                onKeyPress={(e) => { if (!/[\d\s()\-+]/.test(e.key)) e.preventDefault() }}
              />
            </div>
          ) : (
            <>
              {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {React.cloneElement(icon, { className: "w-4 h-4 text-slate-400" })}
                </div>
              )}
              <input
                id={name} type={type} name={name} value={value || ""} onChange={onChange}
                placeholder={placeholder} required={required}
                className={`${inputBase} ${icon ? "pl-9" : "pl-3"} pr-9 ${errorClass} ${className}`}
              />
              {/* ── AVAILABILITY STATUS ICONS ── */}
              {((showInternetIdStatus && name === "internet_id") || name === "cnic") && value && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {name === "internet_id" && internetIdStatus?.checking ? (
                    <Loader className="w-4 h-4 animate-spin text-slate-400" />
                  ) : name === "cnic" && cnicStatus?.checking ? (
                    <Loader className="w-4 h-4 animate-spin text-slate-400" />
                  ) : name === "internet_id" && internetIdStatus?.available !== null ? (
                    internetIdStatus?.available
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      : <XCircle className="w-4 h-4 text-rose-500" />
                  ) : name === "cnic" && cnicStatus?.available !== null ? (
                    cnicStatus?.available
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      : <XCircle className="w-4 h-4 text-rose-500" />
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
        {/* ── ERROR MESSAGE ── */}
        {hasError && (
          <p className="text-[11px] text-rose-500 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            {submitErrors?.[name] || validationErrors?.[name]}
          </p>
        )}
      </div>
    )
  },
)
InputField.displayName = "InputField"

/* ═══════════════════════════════════════════
   MAIN FORM COMPONENT
═══════════════════════════════════════════ */
export function CustomerForm({
  formData, handleInputChange, handleFileChange, handleFileRemove,
  isEditing, validationErrors = {},
}: CustomerFormProps) {
  const [areas, setAreas] = useState<Area[]>([])
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([])
  const [isps, setIsps] = useState<ISP[]>([])
  const [employees, setEmployees] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [subZones, setSubZones] = useState<SubZone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [internetIdStatus, setInternetIdStatus] = useState<{ checking: boolean; available: boolean | null; message: string }>
    ({ checking: false, available: null, message: "" })
  const [cnicStatus, setCnicStatus] = useState<{ checking: boolean; available: boolean | null; message: string }>
    ({ checking: false, available: null, message: "" })
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({})
  const mapRef = useRef(null)
  const internetIdCheckTimeout = useRef<NodeJS.Timeout | null>(null)
  const cnicCheckTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken()
      try {
        const [areasRes, plansRes, ispsRes, inventoryRes, employeesRes] = await Promise.all([
          axiosInstance.get("/areas/list", { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get("/service-plans/list", { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get("/isps/list", { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get("/inventory/list", { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get("/employees/list", { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setAreas(areasRes.data)
        setServicePlans(plansRes.data)
        setIsps(ispsRes.data)
        setInventoryItems(inventoryRes.data)
        console.log('Inventory Items:', inventoryRes.data) // Debug log for inventory items
        setEmployees(employeesRes.data)
      } catch (error) {
        console.error("Failed to fetch data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchSubZones = async () => {
      if (!formData.area_id) { setSubZones([]); return }
      const token = getToken()
      try {
        const response = await axiosInstance.get(`/sub-zones/by-area/${formData.area_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSubZones(response.data || [])
      } catch {
        setSubZones([])
      }
    }
    fetchSubZones()
  }, [formData.area_id])

  useEffect(() => {
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setSubmitErrors((prev) => ({ ...prev, ...validationErrors }))
    }
  }, [validationErrors])

  useEffect(() => {
    if (isEditing) {
      let planIds: string[] = []
      if (formData.packages) {
        let packagesData = formData.packages as any
        if (typeof packagesData === "string") {
          try { packagesData = JSON.parse(packagesData) } catch { packagesData = null }
        }
        if (Array.isArray(packagesData) && packagesData.length > 0) {
          planIds = packagesData.map((pkg: any) => pkg.service_plan_id).filter(Boolean)
        }
      }
      if (planIds.length === 0 && formData.service_plan_ids) {
        planIds = Array.isArray(formData.service_plan_ids)
          ? formData.service_plan_ids
          : [formData.service_plan_ids as string]
      }
      if (planIds.length === 0 && formData.service_plan_id) {
        planIds = [formData.service_plan_id as string]
      }
      if (planIds.length > 0 && (!formData.service_plan_ids || (formData.service_plan_ids as string[]).length === 0)) {
        handleInputChange({ target: { name: "service_plan_ids", value: planIds } } as any)
      }
    }
  }, [isEditing, (formData as any).packages])

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (!cleaned) return ""
    const withoutCC = cleaned.startsWith("92") ? cleaned.slice(2) : cleaned
    const limited = withoutCC.slice(0, 10)
    if (limited.length <= 3) return `+92 (${limited}`
    if (limited.length <= 10) return `+92 (${limited.slice(0, 3)})-${limited.slice(3)}`
    return `+92 (${limited.slice(0, 3)})-${limited.slice(3, 10)}`
  }

  const checkInternetIdAvailability = useCallback(
    async (internetId: string) => {
      if (!internetId || internetId.length < 3) {
        setInternetIdStatus({ checking: false, available: null, message: "" }); return
      }
      if (isEditing && formData.internet_id === internetId) {
        setInternetIdStatus({ checking: false, available: true, message: "Current Internet ID" }); return
      }
      setInternetIdStatus((prev) => prev.checking ? prev : { checking: true, available: null, message: "Checking..." })
      if (internetIdCheckTimeout.current) clearTimeout(internetIdCheckTimeout.current)
      internetIdCheckTimeout.current = setTimeout(async () => {
        try {
          const token = getToken()
          const response = await axiosInstance.get(`/customers/check-internet-id/${internetId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setInternetIdStatus({
            checking: false, available: response.data.available,
            message: response.data.available ? "Internet ID is available" : "Internet ID is already taken",
          })
        } catch {
          setInternetIdStatus({ checking: false, available: null, message: "Error checking availability" })
        }
      }, 500)
    },
    [isEditing, formData.internet_id],
  )

  const checkCnicAvailability = useCallback(
    async (cnic: string) => {
      if (!cnic || cnic.length < 13) { setCnicStatus({ checking: false, available: null, message: "" }); return }
      if (isEditing && formData.cnic === cnic) {
        setCnicStatus({ checking: false, available: true, message: "Current CNIC" }); return
      }
      setCnicStatus((prev) => prev.checking ? prev : { checking: true, available: null, message: "Checking CNIC..." })
      if (cnicCheckTimeout.current) clearTimeout(cnicCheckTimeout.current)
      cnicCheckTimeout.current = setTimeout(async () => {
        try {
          const token = getToken()
          const response = await axiosInstance.get(`/customers/check-cnic/${cnic}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setCnicStatus({
            checking: false, available: response.data.available,
            message: response.data.available ? "CNIC is available" : "CNIC is already registered",
          })
        } catch {
          setCnicStatus({ checking: false, available: null, message: "Error checking CNIC availability" })
        }
      }, 500)
    },
    [isEditing, formData.cnic],
  )

  const memoizedHandleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      let formattedValue = value
      if (name === "cnic") formattedValue = value.replace(/\D/g, "").slice(0, 13)
      else if ((name === "phone_1" || name === "phone_2") && value) formattedValue = formatPhoneNumber(value)
      handleInputChange({ target: { name, value: formattedValue } } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)
      if (name === "internet_id") checkInternetIdAvailability(formattedValue)
      if (name === "cnic") checkCnicAvailability(formattedValue)
      if (submitErrors[name]) setSubmitErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
    },
    [handleInputChange, checkInternetIdAvailability, checkCnicAvailability, submitErrors, validationErrors],
  )

  const memoizedHandleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { handleFileChange(e) }, [handleFileChange])
  const toggleMap = useCallback(() => setShowMap((prev) => !prev), [])

  const MapEvents = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        handleInputChange({ target: { name: "gps_coordinates", value: `${lat.toFixed(6)},${lng.toFixed(6)}` } } as any)
        setShowMap(false)
      },
    })
    useEffect(() => {
      if (map) {
        const provider = new OpenStreetMapProvider()
        const searchControl = new GeoSearchControl({
          provider, style: "bar", showMarker: true, showPopup: false,
          autoClose: true, retainZoomLevel: false, animateZoom: true, keepResult: false,
          searchLabel: "Enter address",
        })
        map.addControl(searchControl)
        return () => { map.removeControl(searchControl) }
      }
    }, [map])
    return null
  }

  const inputFieldProps = useMemo(
    () => ({ internetIdStatus, cnicStatus, submitErrors, toggleMap, validationErrors }),
    [internetIdStatus, cnicStatus, submitErrors, toggleMap, validationErrors],
  )

  /* ── LOADING STATE: no gradient, skeleton pattern ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 bg-slate-50 rounded-md">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-[13px] text-slate-400">Loading customer data...</p>
        </div>
      </div>
    )
  }

  return (
    /* ── FORM: no wrapper card, modal provides the surface ── */
    <div className="space-y-8">

      {/* ── GENERAL ERROR BANNER ── */}
      {(submitErrors.general || submitErrors.error) && (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-3 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-rose-600">{submitErrors.general || submitErrors.error}</p>
        </div>
      )}

      {/* ════════════════════════════════════
          SECTION: Basic Information
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={User} label="Basic Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <InputField label="Internet ID" name="internet_id" value={formData.internet_id || ""}
            onChange={memoizedHandleInputChange} placeholder="Enter Internet ID" required
            icon={<Hash />} showInternetIdStatus={true} internetIdStatus={internetIdStatus}
            validationErrors={validationErrors} {...inputFieldProps} />
          <InputField label="First Name" name="first_name" value={formData.first_name || ""}
            onChange={memoizedHandleInputChange} placeholder="Enter first name" required
            icon={<User />} {...inputFieldProps} />
          <InputField label="Last Name" name="last_name" value={formData.last_name || ""}
            onChange={memoizedHandleInputChange} placeholder="Enter last name" required
            icon={<User />} {...inputFieldProps} />
          <InputField label="CNIC Number" name="cnic" value={formData.cnic || ""}
            onChange={memoizedHandleInputChange} placeholder="Enter 13-digit CNIC" required
            icon={<Hash />} showInternetIdStatus={true} internetIdStatus={cnicStatus}
            validationErrors={validationErrors} {...inputFieldProps} />
          <InputField label="Whatsapp Number" name="phone_1" type="tel" value={formData.phone_1 || ""}
            onChange={memoizedHandleInputChange} placeholder="92(xxx)xxx-xxxx" required {...inputFieldProps} />
          <InputField label="Phone 2" name="phone_2" type="tel" value={formData.phone_2 || ""}
            onChange={memoizedHandleInputChange} placeholder="92(xxx)xxx-xxxx" {...inputFieldProps} />
          <InputField label="Email" name="email" type="email" value={formData.email || ""}
            onChange={memoizedHandleInputChange} placeholder="Enter email address" required
            icon={<Mail />} {...inputFieldProps} />
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Location
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={MapPin} label="Location" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <InputField label="Service Area" name="area_id" type="select" value={formData.area_id || ""}
            onChange={memoizedHandleInputChange} required
            options={areas.map((a) => ({ value: a.id, label: a.name }))}
            icon={<MapPin />} {...inputFieldProps} />
          {subZones.length > 0 && (
            <InputField label="Sub-Zone (Optional)" name="sub_zone_id" type="select"
              value={formData.sub_zone_id || ""} onChange={memoizedHandleInputChange}
              options={subZones.map((sz) => ({ value: sz.id, label: sz.name }))}
              icon={<MapPin />} {...inputFieldProps} />
          )}
          <div className="md:col-span-2">
            <InputField label="Installation Address" name="installation_address"
              value={formData.installation_address || ""} onChange={memoizedHandleInputChange}
              placeholder="Enter installation address" required icon={<Home />} {...inputFieldProps} />
          </div>
          <InputField label="GPS Coordinates" name="gps_coordinates"
            value={formData.gps_coordinates || ""} onChange={memoizedHandleInputChange}
            placeholder="Enter GPS coordinates" {...inputFieldProps} />
        </div>

        {showMap && (
          <div className="mt-4 rounded-md overflow-hidden border border-slate-200">
            <MapContainer center={[0, 0]} zoom={2} style={{ height: "400px", width: "100%" }} ref={mapRef}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapEvents />
              {formData.gps_coordinates && (
                <Marker
                  position={formData.gps_coordinates.split(",").map(Number) as [number, number]}
                  icon={new L.Icon({
                    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                    iconSize: [25, 41], iconAnchor: [12, 41],
                  })}
                />
              )}
            </MapContainer>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          SECTION: Service Information
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Wifi} label="Service Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <InputField label="ISP" name="isp_id" type="select" value={formData.isp_id || ""}
            onChange={memoizedHandleInputChange} required
            options={isps.map((isp) => ({ value: isp.id, label: isp.name }))}
            icon={<Globe />} {...inputFieldProps} />
          <InputField label="Assigned Technician" name="technician_id" type="select"
            value={formData.technician_id || ""} onChange={memoizedHandleInputChange}
            options={[
              { value: "", label: "-- Select Technician --" },
              ...employees.map((emp) => ({ value: emp.id, label: `${emp.first_name} ${emp.last_name}` })),
            ]}
            icon={<User />} {...inputFieldProps} />
          <InputField label="Connection Commission (PKR)" name="connection_commission_amount" type="number"
            value={formData.connection_commission_amount?.toString() || ""}
            onChange={memoizedHandleInputChange} placeholder="e.g., 100 per month"
            icon={<DollarSign />} {...inputFieldProps} />
          <InputField label="Connection Type" name="connection_type" type="select"
            value={formData.connection_type || ""} onChange={memoizedHandleInputChange} required
            options={[
              { value: "internet", label: "Internet" },
              { value: "tv_cable", label: "TV Cable" },
              { value: "both", label: "Both" },
            ]}
            icon={<Wifi />} {...inputFieldProps} />
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Internet Connection Details
      ════════════════════════════════════ */}
      {(formData.connection_type === "internet" || formData.connection_type === "both") && (
        <div>
          <SectionHeader icon={Router} label="Internet Connection Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <InputField label="Internet Connection Type" name="internet_connection_type" type="select"
              value={formData.internet_connection_type || ""} onChange={memoizedHandleInputChange} required
              options={[{ value: "wire", label: "Wire" }, { value: "wireless", label: "Wireless" }]}
              icon={<Wifi />} {...inputFieldProps} />
            {formData.internet_connection_type === "wire" && (
              <>
                <InputField label="Wire Length (meters)" name="wire_length" type="number"
                  value={formData.wire_length || ""} onChange={memoizedHandleInputChange}
                  placeholder="Enter wire length" required icon={<Box />} {...inputFieldProps} />
                <InputField label="Wire Ownership" name="wire_ownership" type="select"
                  value={formData.wire_ownership || ""} onChange={memoizedHandleInputChange} required
                  options={[{ value: "company", label: "Company" }, { value: "customer", label: "Customer" }]}
                  icon={<User />} {...inputFieldProps} />
                <InputField label="Router Ownership" name="router_ownership" type="select"
                  value={formData.router_ownership || ""} onChange={memoizedHandleInputChange} required
                  options={[{ value: "company", label: "Company" }, { value: "customer", label: "Customer" }]}
                  icon={<Router />} {...inputFieldProps} />
                {formData.router_ownership === "company" && (
                  <InputField label="Router" name="router_id" type="select"
                    value={formData.router_id || ""} onChange={memoizedHandleInputChange} required
                    options={inventoryItems.filter((i) => i.item_type === "Router")
                      .map((i) => ({
                        value: i.id,
                        label: `${i.item_type} - ${i.attributes?.model || i.name || "Unknown Model"} - ${i.attributes?.serial_number || i.serial_number || "No Serial"}`,
                      }))}
                    icon={<Router />} {...inputFieldProps} />
                )}
                {formData.router_ownership === "customer" && (
                  <InputField label="Router Serial Number" name="router_serial_number"
                    value={formData.router_serial_number || ""} onChange={memoizedHandleInputChange}
                    placeholder="Enter router serial number" required icon={<Hash />} {...inputFieldProps} />
                )}
                <InputField label="Patch Cord Ownership" name="patch_cord_ownership" type="select"
                  value={formData.patch_cord_ownership || ""} onChange={memoizedHandleInputChange} required
                  options={[{ value: "company", label: "Company" }, { value: "customer", label: "Customer" }]}
                  icon={<User />} {...inputFieldProps} />
                {formData.patch_cord_ownership === "company" && (
                  <InputField label="Number of Patch Cords" name="patch_cord_count" type="number"
                    value={formData.patch_cord_count || ""} onChange={memoizedHandleInputChange}
                    placeholder="Enter number of patch cords" required icon={<Hash />} {...inputFieldProps} />
                )}
                <InputField label="Patch Cord Ethernet Ownership" name="patch_cord_ethernet_ownership" type="select"
                  value={formData.patch_cord_ethernet_ownership || ""} onChange={memoizedHandleInputChange} required
                  options={[{ value: "company", label: "Company" }, { value: "customer", label: "Customer" }]}
                  icon={<User />} {...inputFieldProps} />
                {formData.patch_cord_ethernet_ownership === "company" && (
                  <InputField label="Number of Patch Cord Ethernet" name="patch_cord_ethernet_count" type="number"
                    value={formData.patch_cord_ethernet_count || ""} onChange={memoizedHandleInputChange}
                    placeholder="Enter number" required icon={<Hash />} {...inputFieldProps} />
                )}
                <InputField label="Splicing Box Ownership" name="splicing_box_ownership" type="select"
                  value={formData.splicing_box_ownership || ""} onChange={memoizedHandleInputChange} required
                  options={[{ value: "company", label: "Company" }, { value: "customer", label: "Customer" }]}
                  icon={<User />} {...inputFieldProps} />
                {formData.splicing_box_ownership === "company" && (
                  <InputField label="Splicing Box Serial Number" name="splicing_box_serial_number"
                    value={formData.splicing_box_serial_number || ""} onChange={memoizedHandleInputChange}
                    placeholder="Enter splicing box serial number" required icon={<Hash />} {...inputFieldProps} />
                )}
              </>
            )}
            {formData.internet_connection_type === "wireless" && (
              <>
                <InputField label="Ethernet Cable Ownership" name="ethernet_cable_ownership" type="select"
                  value={(formData as any).ethernet_cable_ownership || ""} onChange={memoizedHandleInputChange} required
                  options={[{ value: "company", label: "Company" }, { value: "customer", label: "Customer" }]}
                  icon={<User />} {...inputFieldProps} />
                <InputField label="Ethernet Cable Length (feet)" name="ethernet_cable_length" type="number"
                  value={(formData as any).ethernet_cable_length || ""} onChange={memoizedHandleInputChange}
                  placeholder="Enter ethernet cable length" required icon={<Box />} {...inputFieldProps} />
                <InputField label="Dish Ownership" name="dish_ownership" type="select"
                  value={(formData as any).dish_ownership || ""} onChange={memoizedHandleInputChange} required
                  options={[{ value: "company", label: "Company" }, { value: "customer", label: "Customer" }]}
                  icon={<User />} {...inputFieldProps} />
                {(formData as any).dish_ownership === "company" && (
                  <InputField label="Dish" name="dish_id" type="select"
                    value={(formData as any).dish_id || ""} onChange={memoizedHandleInputChange} required
                    options={inventoryItems.filter((i) => i.item_type === "Dish")
                      .map((i) => ({ value: i.id, label: `${i.name} - ${i.serial_number}` }))}
                    icon={<Package />} {...inputFieldProps} />
                )}
                {(formData as any).dish_ownership === "customer" && (
                  <InputField label="Dish MAC Address" name="dish_mac_address"
                    value={(formData as any).dish_mac_address || ""} onChange={memoizedHandleInputChange}
                    placeholder="Enter dish MAC address" required icon={<Hash />} {...inputFieldProps} />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          SECTION: TV Cable Connection Details
      ════════════════════════════════════ */}
      {(formData.connection_type === "tv_cable" || formData.connection_type === "both") && (
        <div>
          <SectionHeader icon={Tv} label="TV Cable Connection Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <InputField label="TV Cable Connection Type" name="tv_cable_connection_type" type="select"
              value={formData.tv_cable_connection_type || ""} onChange={memoizedHandleInputChange} required
              options={[{ value: "analog", label: "Analog" }, { value: "digital", label: "Digital" }]}
              icon={<Tv />} {...inputFieldProps} />
            {formData.tv_cable_connection_type === "analog" && (
              <InputField label="Number of Nodes" name="node_count" type="number"
                value={formData.node_count || ""} onChange={memoizedHandleInputChange}
                placeholder="Enter number of nodes" required icon={<Hash />} {...inputFieldProps} />
            )}
            {formData.tv_cable_connection_type === "digital" && (
              <>
                <InputField label="Number of Nodes" name="node_count" type="number"
                  value={formData.node_count || ""} onChange={memoizedHandleInputChange}
                  placeholder="Enter number of nodes" required icon={<Hash />} {...inputFieldProps} />
                <InputField label="STB Serial Number" name="stb_serial_number"
                  value={formData.stb_serial_number || ""} onChange={memoizedHandleInputChange}
                  placeholder="Enter STB serial number" required icon={<Hash />} {...inputFieldProps} />
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          SECTION: Billing Information
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={DollarSign} label="Billing Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">

          {/* ── MULTI-PACKAGE SELECTION ── */}
          <div className="md:col-span-2 space-y-1.5">
            <label className={labelClass}>
              Packages <span className="text-rose-500 ml-0.5">*</span>
            </label>

            {/* Selected package chips */}
            {(formData.service_plan_ids || (formData.service_plan_id ? [formData.service_plan_id] : [])).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.service_plan_ids || (formData.service_plan_id ? [formData.service_plan_id] : [])).map((planId: string) => {
                  const plan = servicePlans.find((p) => p.id === planId)
                  return plan ? (
                    /* ── PACKAGE CHIP: blue system pair, rounded-md not rounded-full ── */
                    <div key={planId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-[13px] text-blue-700"
                    >
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>{plan.name}</span>
                      <button type="button"
                        onClick={() => {
                          const currentIds = formData.service_plan_ids || (formData.service_plan_id ? [formData.service_plan_id] : [])
                          const newIds = (currentIds as string[]).filter((id) => id !== planId)
                          handleInputChange({ target: { name: "service_plan_ids", value: newIds } } as any)
                          if (newIds.length > 0) handleInputChange({ target: { name: "service_plan_id", value: newIds[0] } } as any)
                        }}
                        className="text-slate-400 hover:text-rose-500 transition-colors duration-150"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null
                })}
              </div>
            )}

            {/* Add package dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <select
                className={`${inputBase} pl-9 pr-9 appearance-none`}
                value=""
                onChange={(e) => {
                  const selectedId = e.target.value
                  if (selectedId) {
                    const currentIds = formData.service_plan_ids || (formData.service_plan_id ? [formData.service_plan_id] : [])
                    if (!(currentIds as string[]).includes(selectedId)) {
                      const newIds = [...(currentIds as string[]), selectedId]
                      handleInputChange({ target: { name: "service_plan_ids", value: newIds } } as any)
                      handleInputChange({ target: { name: "service_plan_id", value: newIds[0] } } as any)
                    }
                  }
                }}
              >
                <option value="">+ Add Package</option>
                {servicePlans
                  .filter((plan) => {
                    const currentIds = formData.service_plan_ids || (formData.service_plan_id ? [formData.service_plan_id] : [])
                    return !(currentIds as string[]).includes(plan.id)
                  })
                  .map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {(validationErrors?.service_plan_id || validationErrors?.service_plan_ids) && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {validationErrors.service_plan_id || validationErrors.service_plan_ids}
              </p>
            )}
          </div>

          <InputField label="Discount Amount" name="discount_amount" type="number"
            value={formData.discount_amount || ""} onChange={memoizedHandleInputChange}
            placeholder="Enter discount amount" icon={<DollarSign />} {...inputFieldProps} />
          <InputField label="Installation Date" name="installation_date" type="date"
            value={formData.installation_date || ""} onChange={memoizedHandleInputChange} required
            icon={<Calendar />} {...inputFieldProps} />
          <InputField label="Due Date" name="recharge_date" type="date"
            value={formData.recharge_date || ""} onChange={memoizedHandleInputChange}
            icon={<Calendar />} {...inputFieldProps} />
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION: Documents
      ════════════════════════════════════ */}
      <div>
        <SectionHeader icon={Hash} label="Documents" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4">
          <FileUploadField label="CNIC Front Image" name="cnic_front_image"
            onChange={memoizedHandleFileChange} onFileRemove={handleFileRemove}
            currentImage={formData.cnic_front_image ? `/customers/cnic-front-image/${(formData as any).id}` : undefined}
            disabled={false} />
          <FileUploadField label="CNIC Back Image" name="cnic_back_image"
            onChange={memoizedHandleFileChange} onFileRemove={handleFileRemove}
            currentImage={formData.cnic_back_image ? `/customers/cnic-back-image/${(formData as any).id}` : undefined}
            disabled={false} />
          <FileUploadField label="Agreement Document" name="agreement_document"
            onChange={memoizedHandleFileChange} onFileRemove={handleFileRemove}
            currentImage={formData.agreement_document ? `/customers/agreement-document/${(formData as any).id}` : undefined}
            disabled={false} />
        </div>
      </div>

    </div>
  )
}