import { Drawer } from '../ui/Drawer'
import { Badge, statusVariant } from '../ui/Badge'
import { useAppStore } from '../../store/appStore'
import { mockAlerts } from '../../data/mockCompliance'
import { formatUGX, timeAgo, formatDateTime } from '../../utils/format'
import { AlertTriangle, ArrowRightLeft } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: Props) {
  const liveTransactions = useAppStore((s) => s.liveTransactions)
  const markRead = useAppStore((s) => s.markNotificationsRead)

  function handleClose() {
    markRead()
    onClose()
  }

  const openAlerts = mockAlerts.filter((a) => a.status !== 'resolved')
  const recentTx = liveTransactions.slice(0, 8)

  return (
    <Drawer open={open} onClose={handleClose} title="Notifications" subtitle={`${openAlerts.length} alerts · ${recentTx.length} recent transactions`} width={420}>
      {/* AML Alerts section */}
      {openAlerts.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-danger" />
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Active Alerts</h3>
          </div>
          <div className="space-y-2">
            {openAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' || alert.severity === 'high'
                  ? 'border-l-danger bg-danger-light/40'
                  : 'border-l-warning bg-warning-light/40'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800">{alert.type}</span>
                  <Badge variant={alert.severity === 'critical' || alert.severity === 'high' ? 'danger' : 'warning'}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{alert.description}</p>
                <p className="text-[10px] text-muted mt-1">{formatDateTime(alert.triggeredAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live transactions section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ArrowRightLeft size={14} className="text-primary" />
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Recent Transactions</h3>
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse ml-auto" />
        </div>
        <div className="space-y-2">
          {recentTx.map((tx) => (
            <div key={tx.id} className="flex items-start justify-between py-2 border-b border-border last:border-0">
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-800 font-mono truncate">{tx.id}</div>
                <div className="text-[10px] text-muted">{tx.payer} · {tx.agency}</div>
              </div>
              <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                <span className="text-xs font-semibold text-primary">{formatUGX(tx.amount)}</span>
                <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                <span className="text-[10px] text-muted">{timeAgo(tx.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  )
}
