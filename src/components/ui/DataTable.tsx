import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import clsx from 'clsx'
import { TableRowSkeleton } from './Skeleton'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  loading?: boolean
  onRowClick?: (row: T) => void
  emptyMessage?: string
  skeletonRows?: number
}

type SortDir = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, unknown>>({
  columns, data, keyField, loading, onRowClick, emptyMessage = 'No records found', skeletonRows = 6,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function handleSort(key: string) {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return }
    if (sortDir === 'asc') { setSortDir('desc'); return }
    setSortKey(null); setSortDir(null)
  }

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide',
                    col.sortable && 'cursor-pointer hover:text-slate-700 select-none',
                    col.width
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      sortKey === String(col.key)
                        ? sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                        : <ChevronsUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={columns.length} />
            ))}
            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading && sorted.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'hover:bg-primary-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(row) : String(row[String(col.key)] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
