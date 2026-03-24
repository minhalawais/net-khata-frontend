"use client"

import type React from "react"
import { useState } from "react"
import { Modal } from "../modal.tsx"
import { Upload } from "lucide-react"

interface ResolveComplaintModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { notes: string; resolutionProof: File | null }) => void
}

export const ResolveComplaintModal: React.FC<ResolveComplaintModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [notes, setNotes] = useState("")
  const [resolutionProof, setResolutionProof] = useState<File | null>(null)

  const handleConfirm = () => {
    onConfirm({ notes, resolutionProof })
    setNotes("")
    setResolutionProof(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResolutionProof(e.target.files[0])
    }
  }

  return (
    <Modal isVisible={isOpen} onClose={onClose} title="Resolve Complaint">
      <div className="mt-6 space-y-4">
        <label htmlFor="resolution-notes" className="block text-[11px] font-medium text-slate-600">
          Resolution Notes
        </label>
        <div className="relative">
          <textarea
            id="resolution-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12] hover:border-slate-300 transition-colors duration-150 resize-none placeholder:text-slate-400"
            placeholder="Enter the resolution details..."
          />
          <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-400">{notes.length}/500</div>
        </div>
        <p className="text-[11px] text-slate-500">Please provide detailed notes about how the complaint was resolved.</p>

        <div className="mt-4">
          <label htmlFor="resolution-proof" className="block text-[11px] font-medium text-slate-600">
            Resolution Proof
          </label>
          <div className="mt-2 flex items-center">
            <label
              htmlFor="resolution-proof"
              className="inline-flex items-center justify-center h-9 px-3 border border-slate-200 rounded-md cursor-pointer bg-white text-[12px] text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150"
            >
              <Upload className="h-4 w-4 mr-2 text-blue-600" />
              <span>{resolutionProof ? resolutionProof.name : "Choose file"}</span>
              <input type="file" id="resolution-proof" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          {resolutionProof && <p className="mt-2 text-[11px] text-emerald-600">File selected: {resolutionProof.name}</p>}
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="h-9 px-4 text-[13px] font-medium bg-white text-slate-600 border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!notes.trim()}
          className="h-9 px-4 text-[13px] font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Resolve Complaint
        </button>
      </div>
    </Modal>
  )
}
