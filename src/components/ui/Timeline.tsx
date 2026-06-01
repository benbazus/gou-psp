import clsx from 'clsx'

export interface TimelineItem {
  label: string
  timestamp: string
  description?: string
  actor?: string
  status?: 'done' | 'active' | 'pending'
}

interface Props {
  items: TimelineItem[]
}

export function Timeline({ items }: Props) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
      {items.map((item, i) => (
        <div key={i} className="relative mb-5 last:mb-0">
          <div className={clsx(
            'absolute -left-4 top-1 w-3 h-3 rounded-full border-2',
            item.status === 'done'   && 'bg-success border-success',
            item.status === 'active' && 'bg-primary border-primary',
            (!item.status || item.status === 'pending') && 'bg-surface border-border',
          )} />
          <div className="text-xs text-muted mb-0.5">{item.timestamp}</div>
          <div className="text-sm font-medium text-slate-800">{item.label}</div>
          {item.actor && <div className="text-xs text-muted">{item.actor}</div>}
          {item.description && <div className="text-xs text-slate-600 mt-1">{item.description}</div>}
        </div>
      ))}
    </div>
  )
}
