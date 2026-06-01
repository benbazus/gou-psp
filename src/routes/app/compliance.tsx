import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Drawer } from '../../components/ui/Drawer'
import { AreaChart } from '../../components/charts/AreaChart'
import { complianceApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatDateTime } from '../../utils/format'
import { AlertTriangle, ShieldX } from 'lucide-react'
import type { ComplianceAlert, AlertSeverity } from '../../types'
import clsx from 'clsx'

const SEV_COLOR: Record<AlertSeverity, string> = {
  critical: 'border-l-danger bg-danger-light/40',
  high:     'border-l-danger/60 bg-danger-light/20',
  medium:   'border-l-warning bg-warning-light/40',
  low:      'border-l-muted bg-surface',
}

const VELOCITY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  volume: 8000 + Math.floor(Math.random() * 12000),
  threshold: 15000,
}))

export default function CompliancePage() {
  const addToast = useAppStore((s) => s.addToast)
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null)
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all')

  const { data: alerts = [] } = useQuery({ queryKey: ['compliance-alerts'], queryFn: complianceApi.listAlerts })
  const { data: blacklist = [] } = useQuery({ queryKey: ['blacklist'], queryFn: complianceApi.listBlacklist })
  const { data: auditLog = [] } = useQuery({ queryKey: ['audit-log'], queryFn: complianceApi.listAuditLog })

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)

  return (
    <div>
      <PageHeader title="Compliance & Risk" subtitle="AML monitoring, transaction velocity, blacklists, and audit trail" />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="col-span-1 bg-card rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">AML Alerts</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AlertSeverity | 'all')}
              className="text-xs border border-border rounded px-2 py-1 bg-white outline-none"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map((alert) => (
              <button
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={clsx('w-full text-left p-3 rounded-lg border-l-4 text-sm transition-all hover:shadow-md', SEV_COLOR[alert.severity])}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={12} className="text-danger flex-shrink-0" />
                  <span className="font-semibold text-xs uppercase tracking-wide text-danger">{alert.severity}</span>
                  <Badge variant={statusVariant(alert.status)} className="ml-auto">{alert.status}</Badge>
                </div>
                <div className="text-xs font-medium text-slate-800">{alert.type}</div>
                <div className="text-[10px] text-muted mt-0.5 line-clamp-2">{alert.description}</div>
                <div className="text-[10px] text-muted mt-1">{formatDateTime(alert.triggeredAt)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Transaction Velocity — Last 24 Hours</h3>
          <p className="text-xs text-muted mb-3">Red line marks 15,000 transactions/hour threshold</p>
          <AreaChart
            data={VELOCITY_DATA}
            xKey="hour"
            areas={[
              { key: 'volume', color: '#1B3A6B', name: 'Transaction Volume' },
              { key: 'threshold', color: '#D62828', name: 'Threshold' },
            ]}
            height={200}
          />
          <div className="mt-3 flex gap-6 text-xs">
            <div><span className="text-muted">Open Alerts: </span><span className="font-bold text-danger">{alerts.filter((a) => a.status === 'open').length}</span></div>
            <div><span className="text-muted">Investigating: </span><span className="font-bold text-warning">{alerts.filter((a) => a.status === 'investigating').length}</span></div>
            <div><span className="text-muted">Blacklisted: </span><span className="font-bold text-danger">{blacklist.length}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ShieldX size={14} className="text-danger" /> Blacklisted Accounts
          </h3>
          {blacklist.map((b) => (
            <div key={b.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-muted font-mono">{b.accountNumber}</div>
                  <div className="text-xs text-danger mt-0.5">{b.reason}</div>
                </div>
                <Badge variant="danger" className="ml-2 flex-shrink-0">Blocked</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Audit Log</h3>
          {auditLog.map((entry) => (
            <div key={entry.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium">{entry.action.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-muted">{entry.actor} · {entry.role}</div>
                  <div className="text-[10px] text-muted font-mono mt-0.5">{entry.resource}</div>
                </div>
                <div className="text-[10px] text-muted text-right flex-shrink-0 ml-2">{formatDateTime(entry.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Drawer
        open={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.type ?? ''}
        subtitle={selectedAlert ? `Rule: ${selectedAlert.rule}` : ''}
      >
        {selectedAlert && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-2">
              <Badge variant={statusVariant(selectedAlert.severity)}>{selectedAlert.severity.toUpperCase()}</Badge>
              <Badge variant={statusVariant(selectedAlert.status)}>{selectedAlert.status}</Badge>
            </div>
            <div className="bg-danger-light border border-danger/20 rounded-lg p-3 text-danger text-sm">
              {selectedAlert.description}
            </div>
            <div className="space-y-2">
              {selectedAlert.payer && <div className="flex justify-between"><span className="text-muted">Payer</span><span>{selectedAlert.payer}</span></div>}
              {selectedAlert.participant && <div className="flex justify-between"><span className="text-muted">Participant</span><span>{selectedAlert.participant}</span></div>}
              {selectedAlert.transactionId && <div className="flex justify-between"><span className="text-muted">Transaction</span><span className="font-mono text-xs">{selectedAlert.transactionId}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Triggered</span><span>{formatDateTime(selectedAlert.triggeredAt)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Rule</span><span className="font-mono text-xs">{selectedAlert.rule}</span></div>
            </div>
            {selectedAlert.status !== 'resolved' && (
              <button
                onClick={() => { setSelectedAlert(null); addToast('Investigation initiated', 'info') }}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
              >
                Investigate
              </button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
