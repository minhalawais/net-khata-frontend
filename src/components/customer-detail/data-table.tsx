import type React from "react"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
  className?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  title?: string
  icon?: React.ReactNode
  onRowClick?: (row: any) => void
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data, title, icon, onRowClick }) => (
  <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 overflow-hidden">
    {title && (
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3">
        <h3 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em] whitespace-nowrap">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, idx) => (
            <tr 
              key={idx} 
              className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 text-[13px] text-slate-700 ${column.className || ""}`}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default DataTable
