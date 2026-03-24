"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"

/*
 * Modal — NetDaftar ERP · Slate + Blue
 *
 * Skill 09 — exact modal recipe. Every rule applied:
 *
 * ✗ REMOVED: bg-gradient-to-r from-[#89A8B2] to-[#B3C8CF] header     (gradient violation)
 * ✗ REMOVED: rounded-2xl                                               (must be rounded-xl)
 * ✗ REMOVED: shadow-2xl                                                (no decorative shadows)
 * ✗ REMOVED: backdrop-blur-sm                                          (adds perceived complexity)
 * ✗ REMOVED: text-xl/2xl font-bold text-white title                   (white title on gradient)
 * ✗ REMOVED: rounded-full close button                                 (must be rounded-md)
 * ✗ REMOVED: animate-in fade-in zoom-in-95                             (entrance animations prohibited)
 * ✗ REMOVED: bg-[#FFFFF] body background                              (typo + wrong palette)
 *
 * ✓ ADDED:   bg-white header with border-b border-slate-200
 * ✓ ADDED:   text-[15px] font-medium text-slate-900 title
 * ✓ ADDED:   p-1.5 rounded-md close button, text-slate-400 hover:text-slate-600
 * ✓ ADDED:   backdrop rgba(15,23,42,0.50) — slate-900 at 50%, no blur
 * ✓ ADDED:   footer prop with bg-slate-50 border-t, sticky visible
 * ✓ ADDED:   Escape key to close
 * ✓ ADDED:   body scroll lock when open
 * ✓ ADDED:   click-outside to close (on backdrop, not panel)
 * ✓ ADDED:   subtitle prop
 *
 * Size widths: sm=400px  md=560px  lg=720px  xl=960px
 */

interface ModalProps {
  isVisible:  boolean
  onClose:    () => void
  title:      string
  subtitle?:  string
  children:   React.ReactNode
  footer?:    React.ReactNode
  isLoading?: boolean
  size?:      "sm" | "md" | "lg" | "xl"
}

export function Modal({
  isVisible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  isLoading,
  size = "md",
}: ModalProps) {

  // ── Body scroll lock — Skill 09 Rule 11 ──────────────────────────────────────
  useEffect(() => {
    if (isVisible) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isVisible])

  // ── Escape key to close — Skill 09 Rule 10 ───────────────────────────────────
  useEffect(() => {
    if (!isVisible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isVisible, onClose, isLoading])

  if (!isVisible) return null

  const widths: Record<NonNullable<ModalProps["size"]>, string> = {
    sm: "max-w-[400px]",
    md: "max-w-[560px]",
    lg: "max-w-[720px]",
    xl: "max-w-[960px]",
  }

  return (
    /*
     * Backdrop — Skill 09 Rule 8:
     *   rgba(15, 23, 42, 0.50) — slate-900 at 50%
     *   NO backdrop-blur (adds perceived complexity)
     *   NO pure black bg-black/50 (too harsh)
     *   Click-outside closes modal — Skill 09 Rule 9
     */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.50)" }}
      onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >

      {/* Modal panel */}
      <div className={`
        relative w-full ${widths[size]}
        bg-white rounded-xl border border-slate-200
        flex flex-col
        max-h-[calc(100vh-2rem)] overflow-hidden
      `}>

        {/* ── Header — Skill 09 Rule 1: bg-white, border-b, no gradient ──────── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 flex-shrink-0">
          <div>
            {/*
             * Skill 06 — modal title: text-[15px] font-medium text-slate-900
             * NOT: text-xl/2xl font-bold text-white (was on old gradient header)
             */}
            <h2
              id="modal-title"
              className="text-[15px] font-medium text-slate-900"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>

          {/*
           * Skill 09 Rule 3 — close button:
           *   p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100
           *   Icon: w-4 h-4
           *   NOT: rounded-full hover:bg-white/10 (was on old gradient header)
           */}
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
            className="
              p-1.5 ml-4 flex-shrink-0
              text-slate-400 hover:text-slate-600 hover:bg-slate-100
              rounded-md transition-colors duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body — scrollable, Skill 09 Rule 4 ────────────────────────────── */}
        {/*
         * flex-1 overflow-y-auto — body scrolls, header + footer stay fixed.
         * px-6 py-5 consistent with header padding.
         * NO bg-[#FFFFF] (typo from original) — plain bg-white inherited from panel.
         */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* ── Footer — sticky, Skill 09 Rule 5 + 6 ─────────────────────────── */}
        {/*
         * Skill 09 Rule 5: bg-slate-50 border-t border-slate-200
         * Skill 09 Rule 6: Cancel (ghost) left, primary action (blue-600) right
         * flex-shrink-0 — footer never scrolls away
         *
         * If no footer prop provided, the footer section is not rendered.
         * Consumers supply buttons via the footer prop for maximum flexibility.
         *
         * Example:
         *   footer={
         *     <>
         *       <button onClick={onClose} className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 transition-colors duration-150">
         *         Cancel
         *       </button>
         *       <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors duration-150">
         *         Save
         *       </button>
         *     </>
         *   }
         */}
        {footer && (
          <div className="
            flex items-center justify-end gap-2
            px-6 py-4 border-t border-slate-200 bg-slate-50
            flex-shrink-0
          ">
            {footer}
          </div>
        )}

      </div>
    </div>
  )
}