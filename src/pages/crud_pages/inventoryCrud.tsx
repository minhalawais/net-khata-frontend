import type React from "react"
import { useMemo, useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CRUDPage } from "../../components/crudPage.tsx"
import { InventoryForm } from "../../components/forms/inventoryForm.tsx"
import { InventoryTransactionsModal } from "../../components/modals/InventoryTransactionsModal.tsx"
import { InventoryAssignmentsModal } from "../../components/modals/InventoryAssignmentsModal.tsx"
import axiosInstance from "../../utils/axiosConfig.ts"
import { getToken } from "../../utils/auth.ts"

interface InventoryItem {
  id: string
  item_type: string
  quantity: number
  vendor: string
  vendor_name: string
  unit_price?: number
  is_active: boolean
  company_id: string
  attributes: any
  created_at?: string
  updated_at?: string
}

const InventoryManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = getToken()
        const response = await axiosInstance.get("/suppliers/list", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuppliers(response.data)
      } catch (error) {
        console.error("Failed to fetch suppliers", error)
      }
      document.title = "Inventory Management | Net Khata"
    }

    fetchSuppliers()
  }, [])

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        header: "Item Type",
        accessorKey: "item_type",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium">
            {row.original.item_type}
          </span>
        ),
      },
      {
        header: "Details",
        cell: ({ row }) => {
          const item = row.original
          const attributes = item.attributes || {}

          const wrap = (lines: string[]) => (
            <div className="space-y-0.5">
              {lines.map((line, idx) => (
                <p key={idx} className={`${idx === 0 ? "text-[13px] text-slate-700" : "text-[11px] text-slate-400"}`}>
                  {line}
                </p>
              ))}
            </div>
          )

          switch (item.item_type) {
            case "Fiber Cable":
              return <span className="text-[13px] text-slate-700">Fiber Cable</span>
            case "EtherNet Cable":
              return wrap([`Type: ${attributes.type || "N/A"}`])
            case "Splitters":
              return <span className="text-[13px] text-slate-700">Splitter</span>
            case "ONT":
            case "ONU":
            case "Router":
            case "STB":
              return wrap([
                `Serial: ${attributes.serial_number || "N/A"}`,
                `Type: ${attributes.type || "N/A"}`,
                `Model: ${attributes.model || "N/A"}`,
              ])
            case "Fibe OPTIC Patch Cord":
            case "Ethernet Patch Cord":
              return wrap([`Type: ${attributes.type || "N/A"}`])
            case "Switches":
              return wrap([`Type: ${attributes.type || "N/A"}`])
            case "Node":
              return wrap([`Type: ${attributes.type || "N/A"}`])
            case "Dish":
              return wrap([
                `MAC: ${attributes.mac_address || "N/A"}`,
                `Type: ${attributes.type || "N/A"}`,
              ])
            case "Adopter":
              return wrap([
                `Volt: ${attributes.volt || "N/A"}`,
                `Amp: ${attributes.amp || "N/A"}`,
              ])
            case "Cable Ties":
              return wrap([
                `Type: ${attributes.type || "N/A"}`,
                `Model: ${attributes.model || "N/A"}`,
              ])
            case "Others":
              return <span className="text-[13px] text-slate-700">Other Item</span>
            default:
              return <span className="text-[11px] text-slate-400">N/A</span>
          }
        },
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        cell: ({ row }) => <span className="text-[13px] text-slate-700 tabular-nums">{row.original.quantity}</span>,
      },
      {
        header: "Vendor",
        accessorKey: "vendor_name",
        cell: ({ row }) => <span className="text-[13px] text-slate-600">{row.original.vendor_name || "N/A"}</span>,
      },
      {
        header: "Unit Price",
        accessorKey: "unit_price",
        cell: ({ row }) =>
          row.original.unit_price ? (
            <span className="text-[13px] font-medium text-slate-900 tabular-nums">
              <span className="text-[11px] text-slate-400 mr-0.5">PKR</span>
              {row.original.unit_price.toFixed(2)}
            </span>
          ) : (
            <span className="text-slate-400">N/A</span>
          ),
      },
      {
        header: "Transactions",
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedItemId(row.original.id);
              setShowTransactionsModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
          >
            View Transactions
          </button>
        ),
      },
      {
        header: "Assignments",
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedItemId(row.original.id);
              setShowAssignmentsModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors duration-150"
          >
            View Assignments
          </button>
        ),
      },
    ],
    [],
  )

  const validateBeforeSubmit = (formData: Partial<InventoryItem>) => {
    if (!formData.item_type) {
      return "Item type is required"
    }
    if (!formData.vendor) {
      return "Vendor is required"
    }
    if (formData.quantity == null || formData.quantity < 1) {
      return "Quantity must be at least 1"
    }

    // Validate type-specific required fields
    const attributes = formData.attributes || {}

    if (formData.item_type === 'EtherNet Cable' && !attributes.type) {
      return "Cable type is required"
    }

    if (['ONT', 'ONU', 'Router', 'STB'].includes(formData.item_type || '')) {
      if (!attributes.serial_number) {
        return "Serial number is required"
      }
    }

    if (formData.item_type === 'Dish' && !attributes.mac_address) {
      return "MAC address is required"
    }

    return null
  }

  return (
    <>
      <CRUDPage<InventoryItem>
        title="Inventory"
        endpoint="inventory"
        columns={columns}
        FormComponent={(props) => <InventoryForm {...props} suppliers={suppliers} />}
        validateBeforeSubmit={validateBeforeSubmit}
      />
      {showTransactionsModal && (
        <InventoryTransactionsModal
          isVisible={showTransactionsModal}
          onClose={() => setShowTransactionsModal(false)}
          inventoryItemId={selectedItemId!}
        />
      )}
      {showAssignmentsModal && (
        <InventoryAssignmentsModal
          isVisible={showAssignmentsModal}
          onClose={() => setShowAssignmentsModal(false)}
          inventoryItemId={selectedItemId!}
        />
      )}
    </>
  )
}

export default InventoryManagement
