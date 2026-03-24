"use client"

import type React from "react"
import { Modal } from "../modal.tsx"
import { AlertTriangle } from "lucide-react"

interface ProcessTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ProcessTaskModal: React.FC<ProcessTaskModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const footer = (
    <>
      <button
        onClick={onClose}
        className="h-9 px-4 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150"
      >
        Start Processing
      </button>
    </>
  )

  return (
    <Modal isVisible={isOpen} onClose={onClose} title="Process Recovery Task" size="sm" footer={footer}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-50 border border-amber-200 flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
        </div>
        <p className="text-[13px] text-slate-600 leading-relaxed">
          Are you sure you want to start processing this recovery task? This will change the status to "In Progress".
        </p>
      </div>
    </Modal>
  )
}
