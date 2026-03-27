"use client"

import React from "react"
import { X } from "lucide-react"

interface ModalProps {
  isVisible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  isLoading?: boolean
  footer?: React.ReactNode
}

export function Modal({ isVisible, onClose, title, children, isLoading, footer }: ModalProps) {
  if (!isVisible) return null

  return (
    <div
      className="fixed z-50 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-slate-900/45 transition-opacity"
          aria-hidden="true"
          onClick={() => { if (!isLoading) onClose() }}
        />

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal content */}
        <div
          className="inline-block align-bottom bg-white rounded-[12px] text-left overflow-hidden shadow-xl border border-slate-200 transform transition-all sm:my-8 sm:align-middle animate-modal"
          style={{ width: "90%", maxWidth: "1200px" }}
        >
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900" id="modal-title">
              {title}
            </h3>
            <button
              onClick={() => { if (!isLoading) onClose() }}
              className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors rounded-md border border-transparent hover:border-slate-200 hover:bg-white"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar bg-white">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer && (
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
