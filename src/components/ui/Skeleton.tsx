import clsx from 'clsx'

interface Props {
  className?: string
}

export function Skeleton({ className }: Props) {
  return <div className={clsx('animate-pulse bg-slate-200 rounded', className)} />
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}
