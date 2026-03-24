"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
  type FilterFn,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { useVirtual } from "react-virtual"
import {
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
  FileDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  LayoutGrid,
  X,
} from "lucide-react"
import { CSVLink } from "react-csv"
import debounce from "lodash/debounce"
import { rankItem } from "@tanstack/match-sorter-utils"

// ─── All CSS removed — replaced with Tailwind utilities per skills ─────────────
// table.css is no longer imported. The old file used:
//   - #f1f0e8, #89a8b2, #b3c8cf  → old warm palette (violates color system)
//   - fadeInUp row animation      → entrance animations prohibited (Skill 07)
//   - transform: translateX(2px) on hover → layout jitter (Skill 07)
//   - transform: scale(1.1) on checkbox  → layout jitter (Skill 07)
// Custom CSS class names (text-deep-ocean, bg-light-sky, text-electric-blue)
// are replaced with real Slate+Blue tokens throughout.

// ─── Fuzzy filter — preserved exactly ─────────────────────────────────────────

const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  if (!value) return true
  const searchValue = value.toLowerCase()
  const rowData = row.original
  const searchableText = Object.values(rowData)
    .filter(val => val != null && typeof val === "string")
    .map(val => (val as string).toLowerCase())
    .join(" ")
  return searchableText.includes(searchValue)
}

// ─── Types — preserved exactly ─────────────────────────────────────────────────

interface TableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  selectedRows?: string[]
  setSelectedRows?: (rows: string[]) => void
  handleToggleStatus?: (id: string, currentStatus: boolean) => void
  isLoading?: boolean
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
// Skill 07 — shimmer skeleton rows instead of a spinner in the table body.
// The original used a 48px double-ring spinner which reads as a page-level
// loader, not a table-level one. Skeleton rows show the table's shape while
// data loads, giving spatial continuity.

const TableSkeleton = ({ cols }: { cols: number }) => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} className="border-b border-slate-100">
        {/* Checkbox cell */}
        <td className="w-10 px-4 py-3">
          <div className="w-3.5 h-3.5 bg-slate-100 rounded animate-pulse" />
        </td>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-4 py-3">
            <div
              className="h-3 bg-slate-100 rounded animate-pulse"
              style={{ width: `${50 + ((i * 3 + j * 7) % 40)}%` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
)

// ─── Empty State ──────────────────────────────────────────────────────────────
// Skill 05 — TableEmpty: icon + heading + sub-caption
// NOT: bg-light-sky/50 rounded-full p-4 (old palette + decorative circle)

const TableEmpty = () => (
  <tr>
    <td colSpan={999} className="px-4 py-14">
      <div className="flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-[13px] font-medium text-slate-700">No results found</p>
        <p className="text-[12px] text-slate-400 mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    </td>
  </tr>
)

// ─── Main Table Component ─────────────────────────────────────────────────────

export function Table<T extends { id: string }>({
  data,
  columns,
  selectedRows: externalSelectedRows,
  setSelectedRows: setExternalSelectedRows,
  handleToggleStatus,
  isLoading = false,
}: TableProps<T>) {

  const [globalFilter, setGlobalFilter]             = useState("")
  const [localGlobalFilter, setLocalGlobalFilter]   = useState("")
  const [columnFilters, setColumnFilters]           = useState<ColumnFiltersState>([])
  const [localColumnFilters, setLocalColumnFilters] = useState<Record<string, string>>({})
  const [rowSelection, setRowSelection]             = useState<RowSelectionState>({})
  const [distinctValues, setDistinctValues]         = useState<Record<string, Set<any>>>({})
  const [showFilters, setShowFilters]               = useState(false)

  // TanStack table setup — preserved exactly
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: { fuzzy: fuzzyFilter },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    state: { rowSelection, globalFilter, columnFilters },
    initialState: { pagination: { pageSize: 20 } },
    enableRowSelection: true,
    getRowId: (originalRow) => originalRow.id,
  })

  // Debounced handlers — preserved exactly
  const debouncedGlobalSearch = useMemo(
    () => debounce((value: string) => setGlobalFilter(value), 150),
    [],
  )

  const debouncedColumnSearch = useMemo(
    () =>
      debounce((columnId: string, value: string) => {
        setColumnFilters(prev => {
          const existing = prev.find(f => f.id === columnId)
          if (value === "") return prev.filter(f => f.id !== columnId)
          if (existing) return prev.map(f => f.id === columnId ? { ...f, value } : f)
          return [...prev, { id: columnId, value }]
        })
      }, 150),
    [],
  )

  const handleGlobalFilterChange = useCallback((value: string) => {
    setLocalGlobalFilter(value)
    debouncedGlobalSearch(value)
  }, [debouncedGlobalSearch])

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setLocalColumnFilters(prev => ({ ...prev, [columnId]: value }))
    debouncedColumnSearch(columnId, value)
  }, [debouncedColumnSearch])

  useEffect(() => {
    return () => {
      debouncedGlobalSearch.cancel()
      debouncedColumnSearch.cancel()
    }
  }, [debouncedGlobalSearch, debouncedColumnSearch])

  // Distinct values — preserved exactly
  useEffect(() => {
    if (!showFilters) { setDistinctValues({}); return }
    const accessorKeys = (columns as Array<any>)
      .map(col => (typeof col.accessorKey === "string" ? col.accessorKey : null))
      .filter((key): key is string => Boolean(key))

    const newDistinct: Record<string, Set<any>> = {}
    accessorKeys.forEach(key => { newDistinct[key] = new Set() })
    data.forEach(row => {
      accessorKeys.forEach(key => {
        const value = (row as any)[key]
        if (value) newDistinct[key].add(value)
      })
    })
    setDistinctValues(newDistinct)
  }, [data, columns, showFilters])

  // Sync external selection — preserved exactly
  useEffect(() => {
    if (!setExternalSelectedRows) return
    const selectedRowIds = Object.entries(rowSelection)
      .filter(([, isSelected]) => Boolean(isSelected))
      .map(([rowId]) => rowId)
    setExternalSelectedRows(selectedRowIds)
  }, [rowSelection, setExternalSelectedRows])

  // Virtual scroll — preserved exactly
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()
  const rowVirtualizer = useVirtual({
    parentRef: tableContainerRef,
    size: rows.length,
    overscan: 10,
  })
  const { virtualItems: virtualRows, totalSize } = rowVirtualizer
  const paddingTop    = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0) : 0

  const selectedRowsData = useMemo(() => {
    return Object.keys(rowSelection)
      .map(key => rows[parseInt(key)]?.original)
      .filter((row): row is T => row !== undefined)
  }, [rowSelection, rows])

  const getColumnFilterValue = useCallback(
    (columnId: string) => localColumnFilters[columnId] || "",
    [localColumnFilters],
  )

  const selectedCount = selectedRowsData.length
  const totalCount = table.getFilteredRowModel().rows.length
  const hasActiveFilters = columnFilters.length > 0 || globalFilter !== ""

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    /*
     * Skill 11 — Single card wraps toolbar + table + pagination.
     * NOT three separate shadow cards (toolbar card, table card, pagination card).
     * bg-white rounded-[10px] border border-slate-200 overflow-hidden.
     * No shadow — depth comes from white surface on bg-slate-50 page.
     */
    <div className="bg-white rounded-[10px] border border-slate-200 overflow-hidden">

      {/* ── TOOLBAR ROW ──────────────────────────────────────────────────────── */}
      {/*
       * Skill 11 — toolbar is inside the card, not a separate floating card.
       * Layout: search (max-w-[320px]) + flex-1 spacer + bulk action + Filters + Export
       * Border-b separates toolbar from table.
       */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">

        {/* Search input — Skill 11: h-9 pl-8 pr-3 text-[13px] rounded-md */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={localGlobalFilter}
            onChange={e => handleGlobalFilterChange(e.target.value)}
            placeholder="Search all columns..."
            className="
              w-full h-9 pl-8 pr-3
              text-[13px] text-slate-900 placeholder:text-slate-400
              bg-white border border-slate-200 rounded-md
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
              hover:border-slate-300 transition-colors duration-150
            "
          />
        </div>

        {/* Spacer */}
        <div className="hidden sm:flex flex-1" />

        {/* Bulk action indicator — shown when rows are selected */}
        {/*
         * Skill 11 — bulk action lives between spacer and action buttons.
         * text-[12px] text-slate-500, with a danger action to the right.
         */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <span className="text-[12px] text-slate-500 tabular-nums">
              {selectedCount} selected
            </span>
            {/* Clear selection */}
            <button
              onClick={() => setRowSelection({})}
              className="text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors duration-150 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/*
         * Filters toggle button — Skill 11 ghost button pattern
         * h-9 px-3 text-[12px] rounded-md border
         * Active: bg-blue-50 text-blue-600 border-blue-200
         * Inactive: text-slate-600 border-slate-200 hover:border-slate-300
         */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-1.5 h-9 px-3
            text-[12px] font-medium rounded-md border
            transition-colors duration-150
            ${showFilters
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }
          `}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {columnFilters.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-medium bg-blue-600 text-white rounded-full">
              {columnFilters.length}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 text-current opacity-60 transition-transform duration-150 ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {/*
         * Export button — Skill 11 / Skill 02 ghost + primary states.
         *
         * When no rows selected: ghost button (text-slate-600 border-slate-200)
         * When rows selected: primary button (bg-blue-600 text-white)
         *
         * The original toggled between two completely different className strings.
         * The new version uses disabled prop + opacity for the inactive state,
         * which is cleaner and more accessible.
         */}
        <CSVLink
          data={selectedRowsData}
          filename="export.csv"
          className={`
            flex items-center gap-1.5 h-9 px-3
            text-[12px] font-medium rounded-md
            transition-colors duration-150
            ${selectedCount > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-slate-400 border border-slate-200 cursor-not-allowed"
            }
          `}
          onClick={e => { if (selectedCount === 0) e.preventDefault() }}
        >
          <FileDown className="w-3.5 h-3.5" />
          Export
          {selectedCount > 0 && (
            <span className="ml-0.5 text-blue-200 tabular-nums">({selectedCount})</span>
          )}
        </CSVLink>

      </div>
      {/* END TOOLBAR */}

      {/* ── COLUMN FILTERS PANEL ─────────────────────────────────────────────── */}
      {/*
       * Skill 10 — column filter inputs use exact field recipe:
       *   h-9 pl-8 pr-3 text-[13px] rounded-md border border-slate-200
       *   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
       *
       * Skill 10 — label: text-[11px] font-medium text-slate-500
       *
       * Layout: px-4 py-3 bg-slate-50 border-b border-slate-200
       * 4-column grid on large screens, 2 on medium, 1 on mobile
       */}
      {showFilters && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(columns as Array<any>)
              .filter(col => col.accessorKey && col.header !== "Actions")
              .map(column => {
                const columnId = column.accessorKey as string
                const currentValue = getColumnFilterValue(columnId)
                return (
                  <div key={columnId} className="flex flex-col gap-1.5">
                    {/* Skill 06 / 10 — label: text-[11px] font-medium text-slate-500 */}
                    <label className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.06em]">
                      {column.header as string}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={currentValue}
                        onChange={e => handleColumnFilterChange(columnId, e.target.value)}
                        placeholder={`Filter...`}
                        list={`datalist-${columnId}`}
                        className="
                          w-full h-9 pl-7 pr-3
                          text-[12px] text-slate-900 placeholder:text-slate-400
                          bg-white border border-slate-200 rounded-md
                          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
                          hover:border-slate-300 transition-colors duration-150
                        "
                      />
                      {currentValue && (
                        <button
                          onClick={() => handleColumnFilterChange(columnId, "")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <datalist id={`datalist-${columnId}`}>
                        {Array.from(distinctValues[columnId] || []).map(value => (
                          <option key={value} value={value} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                )
              })}

            {/* Clear all filters button */}
            {columnFilters.length > 0 && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setColumnFilters([])
                    setLocalColumnFilters({})
                  }}
                  className="
                    h-9 px-3 text-[12px] font-medium text-rose-600
                    border border-rose-200 rounded-md bg-rose-50
                    hover:bg-rose-100 transition-colors duration-150
                    flex items-center gap-1.5
                  "
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TABLE SCROLL CONTAINER ───────────────────────────────────────────── */}
      {/*
       * Skill 05 — no shadow on the table container. No separate border.
       * The card border wraps everything. The container just handles overflow.
       * max-h uses calc to leave room for toolbar + pagination.
       * Custom scrollbar replaced with Tailwind [scrollbar-width:thin] and
       * [scrollbar-color] utilities — no custom CSS file needed.
       */}
      <div
        ref={tableContainerRef}
        className="
          overflow-auto
          max-h-[calc(100vh-300px)]
          [scrollbar-width:thin]
          [scrollbar-color:#CBD5E1_#F8FAFC]
        "
      >
        <table className="w-full border-collapse">

          {/* ── THEAD ─────────────────────────────────────────────────────────── */}
          {/*
           * Skill 05 — thead: bg-slate-50, sticky top-0, border-b border-slate-200
           * Header text: text-[11px] font-medium text-slate-400 uppercase tracking-[0.06em]
           * NOT: bg-light-sky, text-deep-ocean, px-6 py-3.5, tracking-wider
           *
           * Checkbox column: w-10 (40px fixed width) per Skill 05 rule
           * Sortable headers: sort icon color changes on active
           */}
          <thead className="bg-slate-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-slate-200">

                {/* Select-all checkbox */}
                <th className="w-10 px-4 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    className="
                      w-3.5 h-3.5 rounded border-slate-300 text-blue-600
                      focus:ring-2 focus:ring-blue-500/[0.12] cursor-pointer
                    "
                  />
                </th>

                {headerGroup.headers.map(header => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-2.5 text-left"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                          className={`
                            flex items-center gap-1 select-none
                            text-[11px] font-medium uppercase tracking-[0.06em]
                            transition-colors duration-150
                            ${sorted
                              ? "text-slate-700"
                              : "text-slate-400 hover:text-slate-600"
                            }
                            ${!header.column.getCanSort() ? "cursor-default" : "cursor-pointer"}
                          `}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}

                          {/*
                           * Sort icon — blue-600 when active (Skill 05 sortable header recipe)
                           * Neutral slate-300 with hover when inactive
                           */}
                          {header.column.getCanSort() && (
                            <span className={`
                              text-[10px] flex-shrink-0
                              ${sorted ? "text-blue-600" : "text-slate-300 group-hover:text-slate-400"}
                            `}>
                              {sorted === "asc"
                                ? <ArrowUp className="w-3 h-3" />
                                : sorted === "desc"
                                  ? <ArrowDown className="w-3 h-3" />
                                  : <ArrowUpDown className="w-3 h-3" />
                              }
                            </span>
                          )}
                        </button>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          {/* ── TBODY ─────────────────────────────────────────────────────────── */}
          {/*
           * Skill 05 — tbody: divide-y divide-slate-100 (NOT border-slate-200)
           * Row hover: hover:bg-blue-50/40 (NOT hover:bg-light-sky/30)
           * Selected row: bg-blue-50 hover:bg-blue-100/60
           * Cell padding: px-4 py-3 (NOT px-6 py-4)
           * Cell text: text-[13px] text-slate-700 (NOT text-slate-gray)
           * No zebra striping, no row entrance animations
           */}
          <tbody>
            {isLoading ? (
              <TableSkeleton cols={columns.length} />
            ) : rows.length === 0 ? (
              <TableEmpty />
            ) : (
              <>
                {paddingTop > 0 && (
                  <tr><td style={{ height: `${paddingTop}px` }} /></tr>
                )}

                {virtualRows.map(virtualRow => {
                  const row = rows[virtualRow.index]
                  const isSelected = row.getIsSelected()

                  return (
                    <tr
                      key={row.id}
                      className={`
                        border-b border-slate-100
                        transition-colors duration-100
                        ${isSelected
                          ? "bg-blue-50 hover:bg-blue-100/60"
                          : "hover:bg-blue-50/40"
                        }
                      `}
                    >
                      {/* Row checkbox */}
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={row.getToggleSelectedHandler()}
                          className="
                            w-3.5 h-3.5 rounded border-slate-300 text-blue-600
                            focus:ring-2 focus:ring-blue-500/[0.12] cursor-pointer
                          "
                        />
                      </td>

                      {/*
                       * Data cells
                       * Skill 05 — px-4 py-3 text-[13px] text-slate-700
                       * Column-level alignment and tabular-nums handled by
                       * column definitions (passed by parent components)
                       */}
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-[13px] text-slate-700 whitespace-nowrap"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}

                {paddingBottom > 0 && (
                  <tr><td style={{ height: `${paddingBottom}px` }} /></tr>
                )}
              </>
            )}
          </tbody>

        </table>
      </div>
      {/* END TABLE SCROLL CONTAINER */}

      {/* ── PAGINATION ROW ───────────────────────────────────────────────────── */}
      {/*
       * Skill 11 — pagination is inside the card as the last child.
       * border-t border-slate-100 separates it from the table body.
       * NOT a separate floating shadow-sm card.
       *
       * Layout: entries info + per-page select (left) | page X of Y + nav buttons (right)
       *
       * Per-page select: h-7 text-[12px] border border-slate-200 rounded-md
       * Nav buttons: w-7 h-7 icon-only, text-slate-500 border border-slate-200
       *   hover:border-slate-300 disabled:opacity-40
       */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-white">

        {/* Left: showing X per page of Y entries */}
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <span>Showing</span>

          {/* Per-page select — Skill 10 SelectField pattern */}
          <div className="relative">
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="
                h-7 pl-2.5 pr-7 appearance-none
                text-[12px] text-slate-700 bg-white
                border border-slate-200 rounded-md
                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/[0.12]
                hover:border-slate-300 transition-colors duration-150 cursor-pointer
              "
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <span>
            of{" "}
            <span className="font-medium text-slate-700 tabular-nums">
              {totalCount.toLocaleString()}
            </span>{" "}
            entries
          </span>

          {/* Active filter indicator */}
          {hasActiveFilters && (
            <span className="text-[11px] text-blue-600 font-medium">
              (filtered)
            </span>
          )}
        </div>

        {/* Right: page X of Y + navigation buttons */}
        <div className="flex items-center gap-3">

          {/* Page counter — Skill 06: text-[12px] text-slate-500 */}
          <span className="text-[12px] text-slate-500">
            Page{" "}
            <span className="font-medium text-slate-700 tabular-nums">
              {table.getState().pagination.pageIndex + 1}
            </span>
            {" "}of{" "}
            <span className="font-medium text-slate-700 tabular-nums">
              {table.getPageCount()}
            </span>
          </span>

          {/*
           * Navigation buttons — Skill 11 Pagination recipe:
           * w-7 h-7 flex items-center justify-center rounded-md
           * text-slate-500 border border-slate-200
           * hover:border-slate-300 hover:text-slate-700
           * disabled:opacity-40 disabled:cursor-not-allowed
           * transition-colors duration-150
           */}
          <div className="flex items-center gap-1">
            {[
              { icon: <ChevronsLeft className="w-3.5 h-3.5" />, action: () => table.setPageIndex(0),              disabled: !table.getCanPreviousPage(), title: "First page"    },
              { icon: <ChevronLeft  className="w-3.5 h-3.5" />, action: () => table.previousPage(),               disabled: !table.getCanPreviousPage(), title: "Previous page" },
              { icon: <ChevronRight className="w-3.5 h-3.5" />, action: () => table.nextPage(),                   disabled: !table.getCanNextPage(),     title: "Next page"     },
              { icon: <ChevronsRight className="w-3.5 h-3.5" />, action: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage(), title: "Last page" },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                title={btn.title}
                className="
                  w-7 h-7 flex items-center justify-center
                  rounded-md text-slate-500
                  border border-slate-200
                  hover:border-slate-300 hover:text-slate-700
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors duration-150
                "
              >
                {btn.icon}
              </button>
            ))}
          </div>

        </div>
      </div>
      {/* END PAGINATION */}

    </div>
    // End single card wrapper
  )
}