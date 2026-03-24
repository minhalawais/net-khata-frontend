"use client"

import type React from "react"
import { Modal } from "../modal.tsx"
import { CheckCircle2, AlertTriangle } from "lucide-react"

interface ProcessTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export const ProcessTaskModal: React.FC<ProcessTaskModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="h-9 px-4 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Start Processing
          </>
        )}
      </button>
    </>
  )

  return (
    <Modal isVisible={isOpen} onClose={onClose} title="Process Task" size="sm" footer={footer}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-[13px] font-medium text-slate-900 mb-1">Confirm Action</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Are you sure you want to start processing this task? This will change the status to "In Progress" and
              cannot be undone immediately.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
