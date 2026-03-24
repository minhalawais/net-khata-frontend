"use client"

import type React from "react"
import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import HorizontalLogo from "../assets/net_khata_horizontal.png"

const TicketDisplayPage: React.FC = () => {
  const { ticketNumber } = useParams<{ ticketNumber: string }>()

  useEffect(() => {
    document.title = `Ticket ${ticketNumber} - Net Khata`
  }, [ticketNumber])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      
      {/* Ticket Container */}
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500">
        
        {/* Ticket Top Half */}
        <div className="bg-white rounded-t-[16px] p-8 relative shadow-sm border border-b-0 border-slate-200/80">
          
          {/* Brand Logo */}
          <div className="flex justify-center mb-8">
            <img src={HorizontalLogo} alt="Net Khata Logo" className="h-8 w-auto object-contain opacity-80" />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Complaint Received
            </h1>
            <p className="text-[13px] text-slate-500 max-w-[280px]">
              We've successfully logged your request and our support team will review it shortly.
            </p>
          </div>
          
          {/* Ticket Notches (Decorative) */}
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200/80" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200/80" />
        </div>

        {/* Ticket Divider */}
        <div className="relative h-0 bg-white border-x border-slate-200/80">
          <div className="absolute inset-x-8 -top-px border-t-[2px] border-dashed border-slate-200" />
        </div>

        {/* Ticket Bottom Half */}
        <div className="bg-white rounded-b-[16px] p-8 relative shadow-sm border border-t-0 border-slate-200/80">
          <p className="text-[11px] font-medium text-slate-400 text-center uppercase tracking-wider mb-2">
            Your Ticket Number
          </p>
          <div className="bg-slate-50 border border-slate-100/50 text-slate-900 text-[28px] font-bold py-4 px-6 rounded-[12px] text-center mb-8 tracking-widest shadow-inner">
            {ticketNumber}
          </div>
          
          <div className="text-center">
            <Link
              to="/complaint-management"
              className="inline-flex items-center justify-center w-full gap-2 h-11 px-6 border border-slate-200/80 rounded-[10px] text-[13px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Complaints
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TicketDisplayPage
