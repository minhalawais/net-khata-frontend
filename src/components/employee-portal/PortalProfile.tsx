"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getToken } from "../../utils/auth.ts"
import axiosInstance from "../../utils/axiosConfig.ts"
import { toast } from "react-toastify"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  Shield,
  Edit3,
  Save,
  X,
  Image,
  FileText,
} from "lucide-react"
import HorizontalLogo from "../../assets/net_khata_horizontal.png"

interface ProfileData {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  contact_number: string
  cnic: string
  role: string
  is_active: boolean
  emergency_contact: string
  house_address: string
  joining_date: string | null
  salary: number
  current_balance: number
  paid_amount: number
  picture: string | null
  cnic_image: string | null
  utility_bill_image: string | null
  reference_name: string | null
  reference_contact: string | null
  reference_cnic_image: string | null
  created_at: string | null
}

interface PortalProfileProps {
  onProfileUpdate?: () => void
}

// Helper to construct full file URL
const getFileUrl = (path: string | null) => {
  if (!path) return "";
  const baseURL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  // Remove leading slash if present in path to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseURL}/${cleanPath}`;
};

export function PortalProfile({ onProfileUpdate }: PortalProfileProps) {
  // ... existing state ...
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    contact_number: "",
    emergency_contact: "",
    house_address: "",
  })
  const [saving, setSaving] = useState(false)

  // ... fetchProfile and handleSave (unchanged) ...
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = getToken()
      const response = await axiosInstance.get("/employee-portal/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile(response.data)
      setEditData({
        contact_number: response.data.contact_number || "",
        emergency_contact: response.data.emergency_contact || "",
        house_address: response.data.house_address || "",
      })
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = getToken()
      await axiosInstance.put("/employee-portal/profile", editData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Profile updated successfully")
      setIsEditing(false)
      fetchProfile()
      onProfileUpdate?.()
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-[10px]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-[10px]"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={HorizontalLogo} alt="Net Khata Logo" className="h-9 w-auto object-contain" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight leading-none">My Profile</h1>
            <p className="text-[12px] text-slate-500 mt-1.5">Manage your personal information and documents</p>
          </div>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] overflow-hidden shadow-sm">
        {/* Abstract Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30"></div>
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mb-10 -mr-10 pointer-events-none"></div>
        </div>
        
        <div className="px-5 pb-5 lg:px-8 lg:pb-8 relative">
          {/* Avatar overlapping the cover */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-blue-50 text-blue-700 flex items-center justify-center text-4xl font-bold overflow-hidden shadow-md shrink-0">
                {profile.picture ? (
                  <img
                    src={getFileUrl(profile.picture)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerText = profile.first_name?.charAt(0) || "E";
                    }}
                  />
                ) : (
                  profile.first_name?.charAt(0) || "E"
                )}
              </div>
              <div className="text-center sm:text-left mb-1 sm:mb-2">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${profile.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {profile.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-blue-600 font-medium text-[14px] capitalize mt-1 tracking-tight">
                  {profile.role?.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Edit Toggle pushed to the right */}
            <div className="flex justify-center sm:justify-end shrink-0 sm:mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200/80 rounded-[8px] text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-[8px] text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200/80 text-slate-700 rounded-[8px] text-[13px] font-medium hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          <p className="text-[13px] text-slate-500 text-center sm:text-left">Username: <span className="font-medium text-slate-700">@{profile.username}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 lg:p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email" value={profile.email} />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={
                isEditing ? (
                  <input
                    type="text"
                    value={editData.contact_number}
                    onChange={(e) => setEditData({ ...editData, contact_number: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  profile.contact_number || "-"
                )
              }
            />
            <InfoRow icon={Shield} label="CNIC" value={profile.cnic || "-"} />
            <InfoRow
              icon={Phone}
              label="Emergency Contact"
              value={
                isEditing ? (
                  <input
                    type="text"
                    value={editData.emergency_contact}
                    onChange={(e) => setEditData({ ...editData, emergency_contact: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  profile.emergency_contact || "-"
                )
              }
            />
            <InfoRow
              icon={MapPin}
              label="Address"
              value={
                isEditing ? (
                  <textarea
                    value={editData.house_address}
                    onChange={(e) => setEditData({ ...editData, house_address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                ) : (
                  profile.house_address || "-"
                )
              }
            />
          </div>
        </div>

        {/* Work Information */}
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 lg:p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Work Information
          </h3>
          <div className="space-y-4">
            <InfoRow
              icon={Calendar}
              label="Joining Date"
              value={profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : "-"}
            />
            <InfoRow
              icon={CreditCard}
              label="Monthly Salary"
              value={`PKR ${profile.salary?.toLocaleString() || 0}`}
            />
            <InfoRow
              icon={CreditCard}
              label="Current Balance"
              value={`PKR ${profile.current_balance?.toLocaleString() || 0}`}
            />
            <InfoRow
              icon={CreditCard}
              label="Total Paid"
              value={`PKR ${profile.paid_amount?.toLocaleString() || 0}`}
            />
          </div>
        </div>

        {/* Reference Information */}
        {(profile.reference_name || profile.reference_contact) && (
          <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 lg:p-6 shadow-sm">
            <h3 className="text-[14px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Reference
            </h3>
            <div className="space-y-4">
              <InfoRow icon={User} label="Name" value={profile.reference_name || "-"} />
              <InfoRow icon={Phone} label="Contact" value={profile.reference_contact || "-"} />
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 lg:p-6 shadow-sm">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Documents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DocumentCard label="CNIC" documentPath={profile.cnic_image} />
            <DocumentCard label="Utility Bill" documentPath={profile.utility_bill_image} />
            <DocumentCard label="Reference CNIC" documentPath={profile.reference_cnic_image} />
            <DocumentCard label="Profile Picture" documentPath={profile.picture} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-500 uppercase tracking-[0.06em]">{label}</p>
        <div className="text-[13px] font-medium text-slate-900">{value}</div>
      </div>
    </div>
  )
}

function DocumentCard({ label, documentPath }: { label: string; documentPath: string | null }) {
  const hasDocument = !!documentPath;
  const fileUrl = getFileUrl(documentPath);

  return (
    <a
      href={hasDocument ? fileUrl : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-4 rounded-[10px] border transition-all duration-300 relative overflow-hidden group ${
        hasDocument
          ? "border-emerald-200/60 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-[0_2px_8px_-4px_rgba(16,185,129,0.3)] cursor-pointer"
          : "border-slate-200/60 bg-slate-50/50 cursor-default"
      }`}
      onClick={(e) => !hasDocument && e.preventDefault()}
    >
      {hasDocument && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${hasDocument ? "bg-emerald-100 text-emerald-600" : "bg-slate-200/50 text-slate-400"}`}>
          <Image className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[13px] font-semibold text-slate-900 block">{label}</span>
          <p className={`text-[11px] mt-0.5 font-medium ${hasDocument ? "text-emerald-600" : "text-slate-500"}`}>
            {hasDocument ? "View Document" : "Not uploaded"}
          </p>
        </div>
      </div>
    </a>
  )
}
