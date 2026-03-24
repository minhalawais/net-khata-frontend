"use client"

import { useState, useEffect } from "react"
import { X, Download, Loader, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface ImageViewerModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  title: string
  isLoading?: boolean
}

export function ImageViewerModal({
  isOpen, onClose, imageUrl, title, isLoading = false,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isOpen) { setZoom(1); setRotation(0) }
  }, [isOpen])

  /* ── ESCAPE KEY + BODY SCROLL LOCK ── */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `${title.replace(/\s+/g, "_")}_${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  return (
    /* ── BACKDROP: rgba only, no backdrop-blur ── */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
      onClick={onClose}
    >
      {/* ── PANEL: rounded-xl, no shadow, no gradient ── */}
      <div
        className="relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER: flat slate-900, no gradient ── */}
        <div className="bg-slate-900 rounded-t-xl px-5 py-3 flex items-center justify-between border-b border-white/[0.06] flex-shrink-0">
          <h3 className="text-[15px] font-medium text-white truncate pr-4">{title}</h3>

          <div className="flex items-center gap-1">
            {/* Zoom Out */}
            <button onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-150"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[13px] text-slate-400 min-w-[46px] text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            {/* Zoom In */}
            <button onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-150"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Rotate */}
            <button onClick={handleRotate}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-150"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* ── DOWNLOAD: flat emerald, no gradient, no shadow ── */}
            <button
              onClick={handleDownload}
              disabled={!imageUrl || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[13px] font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Close */}
            <button onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-150"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div
          className="flex-1 bg-slate-950 rounded-b-xl p-6 min-h-[400px] max-h-[calc(90vh-60px)] flex items-center justify-center"
          style={{ overflow: zoom > 1 ? "auto" : "hidden" }}
        >
          {isLoading ? (
            /* ── LOADING: rounded-xl icon container, not rounded-full ── */
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                <Loader className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <p className="text-[13px] text-slate-400">Loading...</p>
            </div>
          ) : imageUrl ? (
            <div
              className="relative flex items-center justify-center w-full h-full"
              style={{ overflow: zoom > 1 ? "auto" : "visible" }}
            >
              <img
                src={imageUrl}
                alt={title}
                className="rounded-lg transition-transform duration-200 ease-out"
                style={{
                  maxWidth: zoom === 1 ? "100%" : "none",
                  maxHeight: zoom === 1 ? "calc(90vh - 120px)" : "none",
                  objectFit: "contain",
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          ) : (
            /* ── ERROR STATE: rounded-xl not rounded-full ── */
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                <X className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-[13px] text-slate-400">Failed to load image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── HOOK: unchanged logic, same API ── */
export function useImageViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const openViewer = async (fetchUrl: string, documentTitle: string, axiosInstance: any) => {
    setTitle(documentTitle)
    setIsOpen(true)
    setIsLoading(true)
    setImageUrl(null)
    try {
      const response = await axiosInstance.get(fetchUrl, { responseType: "blob" })
      setImageUrl(URL.createObjectURL(response.data))
    } catch (error) {
      console.error("Error loading image:", error)
      setImageUrl(null)
    } finally {
      setIsLoading(false)
    }
  }

  const closeViewer = () => {
    setIsOpen(false)
    if (imageUrl) setTimeout(() => URL.revokeObjectURL(imageUrl), 100)
  }

  return { isOpen, imageUrl, title, isLoading, openViewer, closeViewer }
}