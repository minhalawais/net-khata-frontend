"use client"

import type React from "react"
import { useState } from "react"
import { Modal } from "../modal.tsx"

interface CompleteTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { notes: string }) => void
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [notes, setNotes] = useState("")

  const handleConfirm = () => {
    onConfirm({ notes })
    setNotes("")
  }

  const footer = (
    <>
      <button
        onClick={onClose}
        className="h-9 px-4 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-150"
      >
        Cancel
      </button>
      <button
        onClick={handleConfirm}
        disabled={!notes.trim()}
        className="h-9 px-4 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
      >
        Complete Recovery Task
      </button>
    </>
  )

  return (
    <Modal isVisible={isOpen} onClose={onClose} title="Complete Recovery Task" footer={footer}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-slate-700">
            Please provide any final notes or comments about the recovery task completion.
          </p>
          <p className="text-[11px] text-slate-500">
            Include any important details about the recovery process or any follow-up actions required.
          </p>
        </div>

        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter completion notes..."
            rows={4}
            className="w-full px-3 py-2.5 text-[13px] border border-slate-200 rounded-md placeholder:text-slate-400 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none"
          />
          <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-400">{notes.length}/500</div>
        </div>
      </div>
    </Modal>
  )
}
