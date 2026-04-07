"use client"

import type React from "react"
import { useMemo, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CRUDPage } from "../../components/complaintCrudPage.tsx"
import { ComplaintForm } from "../../components/forms/complaintForm.tsx"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axiosConfig.ts"
import { toast } from "../../utils/toast.ts"

interface Complaint {
  id: string
  customer_name: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  assigned_to_name: string
  created_at: string
  response_due_date: string | null
  is_active: boolean
  remarks: string
  attachment_path: string | null
}

const ComplaintManagement: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Complaint Management | Net Khata"
  }, [])

  const columns = useMemo<ColumnDef<Complaint>[]>(
    () => [
      {
        header: "Ticket #",
        accessorKey: "ticket_number",
      },
      {
        header: "Internet ID",
        accessorKey: "internet_id",
      },
      {
        header: "Customer",
        accessorKey: "customer_name",
      },
      {
        header: "Phone No",
        accessorKey: "phone_number",
      },
      {
        header: "Description",
        accessorKey: "description",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border 
            ${info.getValue() === "open"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : info.getValue() === "in_progress"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : info.getValue() === "resolved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
          >
            {info.getValue() as string}
          </span>
        ),
      },
      {
        header: "Assigned To",
        accessorKey: "assigned_to_name",
      },
      {
        header: "Created At",
        accessorKey: "created_at",
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
      },
      {
        header: "Due Date",
        accessorKey: "response_due_date",
        cell: (info) => (info.getValue() ? new Date(info.getValue() as string).toLocaleString() : "N/A"),
      },
      {
        header: "Remarks",
        accessorKey: "remarks",
        cell: (info) => (
          <span className="truncate max-w-xs text-[13px] text-slate-600" title={info.getValue() as string}>
            {info.getValue() as string}
          </span>
        ),
      },
      {
        header: "Attachment",
        accessorKey: "attachment_path",
        cell: (info: any) => (
          <button
            onClick={async () => {
              if (info.getValue()) {
                try {
                  const response = await axiosInstance.get(
                    `/complaints/attachment/${info.row.original.id}`,
                    { responseType: "blob" } // 👈 important for files
                  );

                  const url = window.URL.createObjectURL(response.data);
                  const a = document.createElement("a");
                  a.style.display = "none";
                  a.href = url;
                  a.target = "_blank";
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error("Error fetching attachment:", error);
                  toast.error("Failed to fetch attachment");
                }
              }
            }}
            className="h-8 px-3 text-[12px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-150"
            disabled={!info.getValue()}
          >
            {info.getValue() ? "View Attachment" : "No Attachment"}
          </button>

        ),
      },
    ],
    [],
  )

  const handleAddNew = () => {
    navigate("/complaints/new")
  }

  return (
    <CRUDPage<Complaint>
      title="Complaint"
      endpoint="complaints"
      columns={columns}
      FormComponent={ComplaintForm}
      onAddNew={handleAddNew}
    />
  )
}

export default ComplaintManagement

