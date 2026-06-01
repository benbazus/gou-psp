import { Drawer } from './Drawer'
import { Badge, statusVariant } from './Badge'
import { Timeline, type TimelineItem } from './Timeline'
import { formatUGX, formatDateTime } from '../../utils/format'
import type { Transaction } from '../../types'

interface Props {
  transaction: Transaction | null
  onClose: () => void
}

function buildTimeline(tx: Transaction): TimelineItem[] {
  const base: TimelineItem[] = [
    { label: 'Payment Initiated', timestamp: formatDateTime(tx.timestamp), status: 'done' as const, description: `${tx.payer} via ${tx.channel}` },
    { label: 'Validation', timestamp: formatDateTime(new Date(new Date(tx.timestamp).getTime() + 50).toISOString()), status: 'done' as const, description: 'PRN validated, amount confirmed' },
    { label: 'Routing', timestamp: formatDateTime(new Date(new Date(tx.timestamp).getTime() + 80).toISOString()), status: 'done' as const, description: `Routed via ${tx.channel}` },
  ]

  if (tx.status === 'completed') {
    base.push(
      { label: 'Channel Confirmed', timestamp: formatDateTime(new Date(new Date(tx.timestamp).getTime() + tx.processingTime - 50).toISOString()), status: 'done' as const, description: 'Bank/MNO confirmation received' },
      { label: 'Agency Notified', timestamp: formatDateTime(new Date(new Date(tx.timestamp).getTime() + tx.processingTime).toISOString()), status: 'done' as const, description: `${tx.agency} collection confirmed` }
    )
  } else if (tx.status === 'failed') {
    base.push(
      { label: 'Channel Error', timestamp: formatDateTime(new Date(new Date(tx.timestamp).getTime() + tx.processingTime).toISOString()), status: 'done' as const, description: tx.failureReason ?? 'Payment failed at channel' }
    )
  } else if (tx.status === 'pending') {
    base.push(
      { label: 'Awaiting Channel', timestamp: 'In progress', status: 'active' as const, description: 'Waiting for bank/MNO response' }
    )
  }

  return base
}

export function TransactionDrawer({ transaction, onClose }: Props) {
  if (!transaction) return null

  const timeline = buildTimeline(transaction)

  return (
    <Drawer
      open
      onClose={onClose}
      title={transaction.id}
      subtitle={`${transaction.channel} · ${transaction.agency}`}
      width={440}
    >
      <div className="space-y-5">
        {/* Status banner */}
        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
          <div>
            <div className="text-xs text-muted">Amount</div>
            <div className="text-xl font-bold text-primary">{formatUGX(transaction.amount)}</div>
          </div>
          <Badge variant={statusVariant(transaction.status)} className="text-sm px-3 py-1">
            {transaction.status.toUpperCase()}
          </Badge>
        </div>

        {/* Fields */}
        <div className="space-y-2 text-sm">
          {[
            { label: 'Payer',           value: transaction.payer },
            { label: 'Agency',          value: transaction.agency },
            { label: 'Service',         value: transaction.service },
            { label: 'Channel',         value: transaction.channel },
            { label: 'Region',          value: transaction.region },
            { label: 'PRN',             value: transaction.prn, mono: true },
            { label: 'Processing Time', value: `${transaction.processingTime}ms` },
            { label: 'Timestamp',       value: formatDateTime(transaction.timestamp) },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-muted">{label}</span>
              <span className={`font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
            </div>
          ))}
          {transaction.failureReason && (
            <div className="bg-danger-light border border-danger/20 rounded-lg p-3 text-danger text-xs">
              {transaction.failureReason}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Payment Journey</div>
          <Timeline items={timeline} />
        </div>
      </div>
    </Drawer>
  )
}
