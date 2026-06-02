import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Drawer } from '../../../components/ui/Drawer'
import { Modal } from '../../../components/ui/Modal'
import { AreaChart } from '../../../components/charts/AreaChart'
import { BarChart } from '../../../components/charts/BarChart'
import { complianceApi } from '../../../services/mockApi'
import { useAppStore } from '../../../store/appStore'
import { formatUGX, formatDateTime } from '../../../utils/format'
import {
  mockAmlRules, mockSuspiciousTransactions, mockHighValuePayments,
  mockSlaBreaches, mockFailedSpikes, mockVelocityData,
} from '../../../data/mockCompliance'
import {
  AlertTriangle, ShieldX, Shield, Activity, Zap, Clock,
  FileText, Search, CheckCircle2, XCircle, Eye,
  TrendingUp, AlertCircle,
} from 'lucide-react'
import type { ComplianceAlert, AlertSeverity, SuspiciousTransaction } from '../../../types'
import clsx from 'clsx'

// â”€â”€â”€ Severity helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SEV_BORDER: Record<AlertSeverity, string> = {
  critical: 'border-l-danger bg-danger/5',
  high:     'border-l-danger/60 bg-danger/[0.03]',
  medium:   'border-l-warning bg-warning/5',
  low:      'border-l-border bg-surface',
}
const SEV_BADGE: Record<AlertSeverity, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
}
const STATUS_BADGE: Record<string, string> = {
  open:          'bg-red-100 text-red-700 border-red-200',
  investigating: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  resolved:      'bg-green-100 text-green-700 border-green-200',
  under_review:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  cleared:       'bg-green-100 text-green-700 border-green-200',
  blocked:       'bg-red-100 text-red-700 border-red-200',
  escalated:     'bg-purple-100 text-purple-700 border-purple-200',
  active:        'bg-red-100 text-red-700 border-red-200',
}

function Sev({ s }: { s: AlertSeverity }) {
  return <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase', SEV_BADGE[s])}>{s}</span>
}
function Stat({ s }: { s: string }) {
  return <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', STATUS_BADGE[s] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>{s.replace(/_/g, ' ')}</span>
}

// â”€â”€â”€ KPI strip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KpiStrip({ alerts, blacklist }: { alerts: ComplianceAlert[]; blacklist: { length: number } }) {
  const open        = alerts.filter((a) => a.status === 'open').length
  const critical    = alerts.filter((a) => a.severity === 'critical').length
  const investigating = alerts.filter((a) => a.status === 'investigating').length

  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {[
        { label: 'Open Alerts',      value: open,          color: 'text-danger',  bg: 'bg-red-50 border-red-200',       icon: <AlertTriangle size={14} className="text-danger" /> },
        { label: 'Critical',         value: critical,      color: 'text-red-700', bg: 'bg-red-100 border-red-300',      icon: <AlertCircle size={14} className="text-red-700" /> },
        { label: 'Investigating',    value: investigating, color: 'text-warning', bg: 'bg-yellow-50 border-yellow-200', icon: <Eye size={14} className="text-warning" /> },
        { label: 'Blacklisted',      value: blacklist.length, color: 'text-danger', bg: 'bg-red-50 border-red-200',    icon: <ShieldX size={14} className="text-danger" /> },
        { label: 'SLA Breaches',     value: mockSlaBreaches.filter((s) => s.status === 'active').length, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <Clock size={14} className="text-orange-700" /> },
      ].map(({ label, value, color, bg, icon }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx('rounded-xl border p-3 flex items-center gap-3', bg)}
        >
          <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">{icon}</div>
          <div>
            <div className={clsx('text-xl font-black leading-none', color)}>{value}</div>
            <div className="text-[10px] text-muted font-medium mt-0.5">{label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// â”€â”€â”€ Tab: AML Alerts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AlertsTab() {
  const addToast = useAppStore((s) => s.addToast)
  const { data: alerts = [] } = useQuery({ queryKey: ['compliance-alerts'], queryFn: complianceApi.listAlerts })
  const [selected, setSelected] = useState<ComplianceAlert | null>(null)
  const [filter, setFilter]     = useState<AlertSeverity | 'all'>('all')

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)

  return (
    <div className="space-y-3">
      {/* Severity filter */}
      <div className="flex gap-2">
        {(['all', 'critical', 'high', 'medium'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1.5 text-xs rounded-lg border font-medium transition-all capitalize',
              filter === f ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-muted hover:text-slate-800',
            )}
          >
            {f === 'all' ? `All (${alerts.length})` : `${f} (${alerts.filter((a) => a.severity === f).length})`}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {filtered.map((alert) => (
          <motion.button
            key={alert.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelected(alert)}
            className={clsx(
              'w-full text-left p-4 rounded-xl border-l-4 border border-border transition-all hover:shadow-md',
              SEV_BORDER[alert.severity],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Sev s={alert.severity} />
                  <span className="text-xs font-bold text-slate-800">{alert.type}</span>
                  <Stat s={alert.status} />
                  <span className="text-[10px] font-mono text-muted ml-auto">{alert.rule}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{alert.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted">
                  {alert.payer       && <span>Payer: {alert.payer}</span>}
                  {alert.participant  && <span>Participant: {alert.participant}</span>}
                  {alert.transactionId && <span className="font-mono">{alert.transactionId}</span>}
                  <span className="ml-auto">{formatDateTime(alert.triggeredAt)}</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Alert drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.type ?? ''}
        subtitle={selected ? `Rule: ${selected.rule}` : ''}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-2 flex-wrap">
              <Sev s={selected.severity} />
              <Stat s={selected.status} />
            </div>
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 text-danger text-sm">
              {selected.description}
            </div>
            <div className="space-y-2">
              {selected.payer        && <Row l="Payer"       v={selected.payer} />}
              {selected.participant  && <Row l="Participant" v={selected.participant} />}
              {selected.transactionId && <Row l="Transaction" v={selected.transactionId} mono />}
              <Row l="Triggered" v={formatDateTime(selected.triggeredAt)} />
              <Row l="Rule Code" v={selected.rule} mono />
            </div>
            {selected.status !== 'resolved' && (
              <button
                onClick={() => { setSelected(null); addToast('Investigation initiated â€” case opened', 'info') }}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
              >
                Investigate Alert
              </button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

// â”€â”€â”€ Tab: AML Rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RulesTab() {
  const addToast = useAppStore((s) => s.addToast)

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-surface border-b border-border">
          <tr>
            {['Rule Code', 'Name', 'Threshold', 'Action', 'Severity', 'Triggered Today', 'Status', ''].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockAmlRules.map((rule) => (
            <tr key={rule.id} className="hover:bg-primary-50 transition-colors">
              <td className="px-3 py-3 font-mono text-[11px] text-primary">{rule.code}</td>
              <td className="px-3 py-3">
                <div className="font-semibold text-slate-800">{rule.name}</div>
                <div className="text-[10px] text-muted mt-0.5 max-w-xs">{rule.description}</div>
              </td>
              <td className="px-3 py-3 font-mono text-[11px] text-slate-700">{rule.threshold}</td>
              <td className="px-3 py-3">
                <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize',
                  rule.action === 'block' ? 'bg-red-100 text-red-700 border-red-200' :
                  rule.action === 'flag'  ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                )}>{rule.action}</span>
              </td>
              <td className="px-3 py-3"><Sev s={rule.severity} /></td>
              <td className="px-3 py-3">
                <span className={clsx('font-bold', rule.triggeredToday > 0 ? 'text-danger' : 'text-muted')}>
                  {rule.triggeredToday}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold border',
                  rule.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                )}>{rule.status}</span>
              </td>
              <td className="px-3 py-3">
                <button
                  onClick={() => addToast(`Rule ${rule.code} ${rule.status === 'active' ? 'paused' : 'activated'} (demo)`, 'info')}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  {rule.status === 'active' ? 'Pause' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// â”€â”€â”€ Tab: Suspicious Transactions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SuspiciousTab() {
  const addToast = useAppStore((s) => s.addToast)
  const [selected, setSelected] = useState<SuspiciousTransaction | null>(null)

  return (
    <>
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-surface border-b border-border">
            <tr>
              {['Transaction', 'Payer', 'Amount', 'Channel', 'Risk Score', 'Reason', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockSuspiciousTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-danger/5 cursor-pointer transition-colors" onClick={() => setSelected(t)}>
                <td className="px-3 py-3 font-mono text-[11px] text-muted">{t.transactionId}</td>
                <td className="px-3 py-3 font-semibold text-slate-800">{t.payer}</td>
                <td className="px-3 py-3 font-semibold text-slate-800">{formatUGX(t.amount)}</td>
                <td className="px-3 py-3 text-muted">{t.channel}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden w-12">
                      <div
                        className={clsx('h-full rounded-full', t.riskScore >= 90 ? 'bg-danger' : t.riskScore >= 75 ? 'bg-warning' : 'bg-green-500')}
                        style={{ width: `${t.riskScore}%` }}
                      />
                    </div>
                    <span className={clsx('font-bold text-[11px]', t.riskScore >= 90 ? 'text-danger' : t.riskScore >= 75 ? 'text-warning' : 'text-green-600')}>
                      {t.riskScore}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-muted max-w-xs truncate">{t.reason}</td>
                <td className="px-3 py-3"><Stat s={t.status} /></td>
                <td className="px-3 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); addToast('Case opened for investigation', 'info') }}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Suspicious Transaction â€” ${selected?.transactionId ?? ''}`}
        footer={
          <div className="flex gap-2 w-full">
            <button onClick={() => { addToast('Transaction cleared', 'success'); setSelected(null) }}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
              <CheckCircle2 size={13} /> Clear
            </button>
            <button onClick={() => { addToast('Transaction blocked and escalated to compliance', 'error'); setSelected(null) }}
              className="flex items-center gap-1.5 px-3 py-2 bg-danger text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors ml-auto">
              <XCircle size={13} /> Block & Escalate
            </button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 text-danger text-xs">{selected.reason}</div>
            <div className="space-y-2">
              <Row l="Transaction ID" v={selected.transactionId} mono />
              <Row l="Payer"         v={selected.payer} />
              <Row l="Amount"        v={formatUGX(selected.amount)} />
              <Row l="Channel"       v={selected.channel} />
              <Row l="Risk Score"    v={`${selected.riskScore} / 100`} />
              <Row l="Rule"          v={selected.rule} mono />
              <Row l="Flagged At"    v={formatDateTime(selected.flaggedAt)} />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

// â”€â”€â”€ Tab: Velocity Checks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function VelocityTab() {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-card shadow-card p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Transaction Volume â€” Last 24 Hours</h3>
        <p className="text-xs text-muted mb-3">Red line marks 15,000 transactions/hour threshold. Alerts trigger automatically when exceeded.</p>
        <AreaChart
          data={mockVelocityData}
          xKey="hour"
          areas={[
            { key: 'volume',    color: '#1B3A6B', name: 'Transaction Volume' },
            { key: 'threshold', color: '#D62828', name: 'Alert Threshold' },
          ]}
          height={220}
        />
      </div>

      <div className="bg-card rounded-card shadow-card p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Active Velocity Rules</h3>
        <div className="space-y-2">
          {mockAmlRules.filter((r) => r.code.startsWith('VELOCITY') || r.code.startsWith('FAILED') || r.code.startsWith('MNO')).map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
              <Activity size={14} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800">{rule.name}</div>
                <div className="text-[10px] text-muted font-mono">{rule.threshold}</div>
              </div>
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border',
                rule.triggeredToday > 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'
              )}>
                {rule.triggeredToday > 0 ? `${rule.triggeredToday}Ã— triggered today` : 'No triggers today'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Tab: High-Value Payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HighValueTab() {
  const addToast = useAppStore((s) => s.addToast)

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-800">Payments exceeding UGX 40,000,000</p>
          <p className="text-[10px] text-muted">Rule: HIGHVALUE_GT_40M â€” requires manual clearance above threshold</p>
        </div>
        <span className="text-xs bg-danger/10 text-danger border border-danger/20 rounded-full px-2 py-0.5 font-bold">
          {mockHighValuePayments.filter((h) => h.clearanceStatus === 'manual_review').length} pending review
        </span>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-surface border-b border-border">
          <tr>
            {['Transaction', 'Payer', 'Agency', 'Amount', 'Channel', 'Region', 'Clearance', 'Action'].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockHighValuePayments.map((p) => (
            <tr key={p.id} className={clsx(
              'transition-colors',
              p.clearanceStatus === 'manual_review' ? 'bg-yellow-50/50 hover:bg-yellow-50' :
              p.clearanceStatus === 'blocked'       ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-green-50/30'
            )}>
              <td className="px-3 py-3 font-mono text-[11px] text-muted">{p.transactionId}</td>
              <td className="px-3 py-3 font-semibold text-slate-800">{p.payer}</td>
              <td className="px-3 py-3 text-muted">{p.agency}</td>
              <td className="px-3 py-3 font-bold text-primary">{formatUGX(p.amount)}</td>
              <td className="px-3 py-3 text-muted">{p.channel}</td>
              <td className="px-3 py-3 text-muted">{p.region}</td>
              <td className="px-3 py-3">
                <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold border',
                  p.clearanceStatus === 'auto_cleared'  ? 'bg-green-100 text-green-700 border-green-200' :
                  p.clearanceStatus === 'manual_review' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  'bg-red-100 text-red-700 border-red-200'
                )}>
                  {p.clearanceStatus.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-3 py-3">
                {p.clearanceStatus === 'manual_review' && (
                  <button
                    onClick={() => addToast(`Payment ${p.transactionId} cleared for processing`, 'success')}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    Clear
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// â”€â”€â”€ Tab: Failed Spikes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FailedSpikesTab() {
  const spikes = mockFailedSpikes.filter((s) => s.spikeDetected)

  return (
    <div className="space-y-4">
      {spikes.length > 0 && (
        <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl p-4">
          <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-danger">{spikes.length} failed payment spike{spikes.length > 1 ? 's' : ''} detected today</span>
            <span className="text-muted ml-2">â€” at {spikes.map((s) => s.hour).join(', ')}</span>
          </div>
        </div>
      )}

      <div className="bg-card rounded-card shadow-card p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Failed Transactions per Hour â€” Today</h3>
        <p className="text-xs text-muted mb-3">Orange bars mark hours where failures exceeded the 120/hr alert threshold.</p>
        <BarChart
          data={mockFailedSpikes}
          xKey="hour"
          bars={[{ key: 'failed', color: '#D62828', name: 'Failed Transactions' }]}
          height={220}
        />
      </div>

      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface">
          <p className="text-xs font-semibold text-slate-800">Spike Hours Detail</p>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-surface border-b border-border">
            <tr>
              {['Hour', 'Failed', 'Total', 'Failure Rate', 'Threshold', 'Status'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockFailedSpikes.filter((s) => s.failed > 60).map((s) => (
              <tr key={s.hour} className={clsx('transition-colors', s.spikeDetected ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-surface')}>
                <td className="px-4 py-2.5 font-mono font-bold">{s.hour}</td>
                <td className={clsx('px-4 py-2.5 font-bold', s.spikeDetected ? 'text-danger' : 'text-slate-800')}>{s.failed}</td>
                <td className="px-4 py-2.5 text-muted">{s.total.toLocaleString()}</td>
                <td className={clsx('px-4 py-2.5 font-semibold', s.spikeDetected ? 'text-danger' : 'text-slate-800')}>
                  {((s.failed / s.total) * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-2.5 text-muted">{s.threshold}/hr</td>
                <td className="px-4 py-2.5">
                  {s.spikeDetected
                    ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">Spike</span>
                    : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">Normal</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// â”€â”€â”€ Tab: SLA Breaches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SlaTab() {
  const addToast = useAppStore((s) => s.addToast)

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-800">Participant SLA Breach Monitor</p>
          <span className="text-[10px] bg-danger/10 text-danger border border-danger/20 rounded-full px-2 py-0.5 font-bold">
            {mockSlaBreaches.filter((s) => s.status === 'active').length} active breaches
          </span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-surface border-b border-border">
            <tr>
              {['Participant', 'Type', 'Metric', 'Target', 'Actual', 'Breach Since', 'Severity', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockSlaBreaches.map((b) => (
              <tr key={b.id} className={clsx(
                'transition-colors',
                b.status === 'active' ? 'hover:bg-red-50/30' : 'opacity-60 hover:bg-surface'
              )}>
                <td className="px-3 py-3 font-semibold text-slate-800">{b.participant}</td>
                <td className="px-3 py-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{b.type}</span>
                </td>
                <td className="px-3 py-3 text-muted">{b.metric}</td>
                <td className="px-3 py-3 font-mono text-green-700">{b.target}</td>
                <td className={clsx('px-3 py-3 font-mono font-bold', b.status === 'active' ? 'text-danger' : 'text-muted')}>{b.actual}</td>
                <td className="px-3 py-3 text-muted">{formatDateTime(b.breachSince)}</td>
                <td className="px-3 py-3"><Sev s={b.severity} /></td>
                <td className="px-3 py-3"><Stat s={b.status} /></td>
                <td className="px-3 py-3">
                  {b.status === 'active' && (
                    <button
                      onClick={() => addToast(`SLA breach for ${b.participant} acknowledged`, 'info')}
                      className="text-[11px] text-primary font-semibold hover:underline"
                    >
                      Acknowledge
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// â”€â”€â”€ Tab: Blacklist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BlacklistTab() {
  const addToast  = useAppStore((s) => s.addToast)
  const { data: blacklist = [] } = useQuery({ queryKey: ['blacklist'], queryFn: complianceApi.listBlacklist })
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-800">{blacklist.length} blacklisted entities</p>
          <button
            onClick={() => setAdding(true)}
            className="text-xs bg-danger text-white rounded-lg px-3 py-1.5 font-semibold hover:bg-red-700 transition-colors"
          >
            + Add to Blacklist
          </button>
        </div>
        {blacklist.map((b) => (
          <div key={b.id} className="px-4 py-3 border-b border-border last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <ShieldX size={13} className="text-danger flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{b.name}</span>
                  <span className="font-mono text-[11px] text-muted">{b.accountNumber}</span>
                </div>
                <p className="text-xs text-danger ml-5">{b.reason}</p>
                <p className="text-[10px] text-muted ml-5 mt-0.5">
                  Blacklisted {formatDateTime(b.blacklistedAt)} by {b.addedBy}
                </p>
              </div>
              <button
                onClick={() => addToast(`${b.name} removed from blacklist (demo)`, 'success')}
                className="text-[11px] text-muted hover:text-danger transition-colors flex-shrink-0"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add to Blacklist"
        footer={
          <button onClick={() => { addToast('Account added to blacklist', 'success'); setAdding(false) }}
            className="ml-auto px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
            Add to Blacklist
          </button>
        }
      >
        <div className="space-y-3 text-sm">
          {[
            { label: 'Account Number', placeholder: '0XX-XXXX-XXXX' },
            { label: 'Entity Name',    placeholder: 'Full legal name' },
            { label: 'Reason',         placeholder: 'Reason for blacklistingâ€¦' },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <label className="text-xs text-muted block mb-1">{label}</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" placeholder={placeholder} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

// â”€â”€â”€ Tab: Audit Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AuditLogTab() {
  const { data: auditLog = [] } = useQuery({ queryKey: ['audit-log'], queryFn: complianceApi.listAuditLog })
  const securityEvents = useAppStore((s) => s.securityEvents)
  const [search, setSearch] = useState('')

  const allEntries = [
    ...auditLog.map((l) => ({ ...l, timestamp: new Date(l.timestamp).getTime() })),
    ...securityEvents.map((e) => ({
      id: e.id, actor: e.actor, role: e.role, action: e.type,
      resource: e.resource ?? '', timestamp: e.timestamp, ip: e.ip,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  const filtered = search
    ? allEntries.filter((e) =>
        e.actor.toLowerCase().includes(search.toLowerCase()) ||
        e.action.includes(search.toUpperCase()) ||
        e.resource.toLowerCase().includes(search.toLowerCase())
      )
    : allEntries

  const actionColor = (action: string) => {
    if (action.includes('FAIL') || action.includes('DENIED') || action.includes('BLOCK')) return 'text-danger'
    if (action.includes('LOGIN') || action.includes('MFA') || action.includes('APPROVED')) return 'text-green-600'
    if (action.includes('SUSPEND') || action.includes('BLACKLIST')) return 'text-orange-600'
    return 'text-primary'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 w-64">
        <Search size={13} className="text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actor, action, resourceâ€¦"
          className="text-xs outline-none bg-transparent flex-1"
        />
      </div>

      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-surface border-b border-border">
            <tr>
              {['Timestamp', 'Actor', 'Role', 'Action', 'Resource', 'IP Address'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.slice(0, 50).map((entry) => (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-primary-50 transition-colors"
              >
                <td className="px-3 py-2.5 font-mono text-[11px] text-muted whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleString('en-UG', { dateStyle: 'short', timeStyle: 'medium' })}
                </td>
                <td className="px-3 py-2.5 font-semibold text-slate-800">{entry.actor}</td>
                <td className="px-3 py-2.5 text-muted">{entry.role}</td>
                <td className={clsx('px-3 py-2.5 font-mono font-semibold', actionColor(entry.action))}>
                  {entry.action.replace(/_/g, ' ')}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-muted">{entry.resource}</td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-muted">{entry.ip}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <div className="px-4 py-2 text-xs text-muted text-center border-t border-border">
            Showing 50 of {filtered.length} entries
          </div>
        )}
      </div>
    </div>
  )
}

// â”€â”€â”€ Shared row helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Row({ l, v, mono }: { l: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted">{l}</span>
      <span className={clsx('font-medium text-slate-800', mono && 'font-mono text-xs')}>{v}</span>
    </div>
  )
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CompliancePage() {
  const { data: alerts    = [] } = useQuery({ queryKey: ['compliance-alerts'], queryFn: complianceApi.listAlerts })
  const { data: blacklist = [] } = useQuery({ queryKey: ['blacklist'],         queryFn: complianceApi.listBlacklist })

  const TABS = [
    { val: 'alerts',      label: 'AML Alerts',       icon: <AlertTriangle size={13} />,  badge: alerts.filter((a) => a.status === 'open').length },
    { val: 'rules',       label: 'AML Rules',         icon: <Shield size={13} />,          badge: null },
    { val: 'suspicious',  label: 'Suspicious Txns',   icon: <Eye size={13} />,             badge: mockSuspiciousTransactions.filter((t) => t.status === 'under_review').length },
    { val: 'velocity',    label: 'Velocity Checks',   icon: <Activity size={13} />,        badge: null },
    { val: 'highvalue',   label: 'High-Value',        icon: <TrendingUp size={13} />,      badge: mockHighValuePayments.filter((h) => h.clearanceStatus === 'manual_review').length },
    { val: 'spikes',      label: 'Failed Spikes',     icon: <Zap size={13} />,             badge: mockFailedSpikes.filter((s) => s.spikeDetected).length },
    { val: 'sla',         label: 'SLA Breaches',      icon: <Clock size={13} />,           badge: mockSlaBreaches.filter((s) => s.status === 'active').length },
    { val: 'blacklist',   label: 'Blacklist',         icon: <ShieldX size={13} />,         badge: null },
    { val: 'audit',       label: 'Audit Log',         icon: <FileText size={13} />,        badge: null },
  ]

  return (
    <div>
      <PageHeader
        title="Compliance & Risk"
        subtitle="AML rules, transaction monitoring, SLA breaches, high-value clearance, and full audit trail"
      />

      <KpiStrip alerts={alerts} blacklist={blacklist} />

      <Tabs.Root defaultValue="alerts">
        <Tabs.List className="flex gap-0.5 bg-surface p-1 rounded-xl mb-5 border border-border flex-wrap">
          {TABS.map(({ val, label, icon, badge }) => (
            <Tabs.Trigger
              key={val}
              value={val}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg text-muted font-medium
                data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:shadow-sm
                hover:text-slate-700 transition-all whitespace-nowrap"
            >
              {icon}
              {label}
              {badge !== null && badge !== undefined && badge > 0 && (
                <span className="ml-0.5 bg-danger text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {badge}
                </span>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <AnimatePresence mode="wait">
          <Tabs.Content value="alerts">    <AlertsTab /></Tabs.Content>
          <Tabs.Content value="rules">     <RulesTab /></Tabs.Content>
          <Tabs.Content value="suspicious"><SuspiciousTab /></Tabs.Content>
          <Tabs.Content value="velocity">  <VelocityTab /></Tabs.Content>
          <Tabs.Content value="highvalue"> <HighValueTab /></Tabs.Content>
          <Tabs.Content value="spikes">    <FailedSpikesTab /></Tabs.Content>
          <Tabs.Content value="sla">       <SlaTab /></Tabs.Content>
          <Tabs.Content value="blacklist"> <BlacklistTab /></Tabs.Content>
          <Tabs.Content value="audit">     <AuditLogTab /></Tabs.Content>
        </AnimatePresence>
      </Tabs.Root>
    </div>
  )
}
