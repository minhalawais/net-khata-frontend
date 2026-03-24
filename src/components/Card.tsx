import React from "react"

/*
 * Card — NetDaftar ERP · Slate + Blue
 *
 * Skill 01 — card surface:
 *   bg-white rounded-[10px] border border-slate-200
 *   NO shadow-md (no decorative shadows — depth comes from border on bg-slate-100 canvas)
 *   NO rounded-lg (cards are always rounded-[10px])
 *
 * CardTitle — Skill 06:
 *   text-[13px] font-medium text-slate-900
 *   NOT: text-lg font-semibold (too large, too heavy for an ERP card header)
 */

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`bg-white rounded-[10px] border border-slate-200 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  /*
   * Skill 01 — card header: px-5 py-4 border-b border-slate-100
   * Provides visual separation between header and body content.
   */
  return (
    <div className="px-5 py-4 border-b border-slate-100">
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  /*
   * Skill 06 — card title: text-[13px] font-medium text-slate-900
   * NOT: text-lg font-semibold — that scale is reserved for page H1 elements.
   * Card titles are supporting infrastructure, not page headings.
   */
  return (
    <h2 className="text-[13px] font-medium text-slate-900">
      {children}
    </h2>
  )
}

export function CardContent({ children }: { children: React.ReactNode }) {
  /*
   * Skill 01 — card body: px-5 py-4
   * Consistent with the header padding so content lines up visually.
   */
  return (
    <div className="px-5 py-4">
      {children}
    </div>
  )
}