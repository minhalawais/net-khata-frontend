"use client"

import type React from "react"
import { Modal } from "../modal.tsx"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ProcessComplaintModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export const ProcessComplaintModal: React.FC<ProcessComplaintModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  return (
    <Modal isVisible={isOpen} onClose={onClose} title="Process Complaint" size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 border border-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-medium text-slate-900 mb-1.5">Confirm Processing</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Are you sure you want to process this complaint? This will change the status to "In Progress" and notify
              the customer of the update.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-9 px-4 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Process Complaint
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
