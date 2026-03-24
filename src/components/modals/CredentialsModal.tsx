"use client"

import { Copy, Check, X, Key } from "lucide-react"
import { useState } from "react"

interface CredentialsModalProps {
  isVisible: boolean
  onClose: () => void
  credentials: {
    username: string
    password: string
    email: string
  }
}

export function CredentialsModal({ isVisible, onClose, credentials }: CredentialsModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  if (!isVisible) return null

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  /* ── READ-ONLY CREDENTIAL ROW ── */
  const CredentialRow = ({
    label,
    value,
    fieldKey,
    mono = false,
  }: {
    label: string
    value: string
    fieldKey: string
    mono?: boolean
  }) => (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium text-slate-600 uppercase tracking-[0.06em]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={value}
          className={`flex-1 h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-md text-slate-700 cursor-default ${
            mono ? "font-mono" : ""
          }`}
        />
        <button
          onClick={() => copyToClipboard(value, fieldKey)}
          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors duration-150 flex-shrink-0"
          title={`Copy ${label.toLowerCase()}`}
        >
          {copied === fieldKey ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )

  return (
    /* ── BACKDROP: rgba only, no backdrop-blur ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.50)" }}
      onClick={onClose}
    >
      {/* ── PANEL: rounded-xl, border only, no shadow ── */}
      <div
        className="bg-white rounded-xl border border-slate-200 w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── HEADER: bg-white, border-b, no gradient ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Key className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-slate-900">Employee Credentials</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Save these before closing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* Warning banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
            <p className="text-[13px] font-medium text-amber-800">
              Copy these credentials now
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              This password will not be visible again after you close this window.
            </p>
          </div>

          {/* Credential rows */}
          <CredentialRow label="Username" value={credentials.username} fieldKey="username" />
          <CredentialRow label="Password" value={credentials.password} fieldKey="password" mono />
          <CredentialRow label="Email" value={credentials.email} fieldKey="email" />

        </div>

        {/* ── FOOTER: bg-slate-50, border-t ── */}
        <div className="flex items-center justify-end px-5 py-3 bg-slate-50 border-t border-slate-200 rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}