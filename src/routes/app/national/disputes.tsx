import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Drawer } from '../../../components/ui/Drawer'
import { Modal } from '../../../components/ui/Modal'
import { useAppStore } from '../../../store/appStore'
import { formatUGX, formatDateTime } from '../../../utils/format'
import { mockDisputes, type DisputeEx, type DisputeEvidence } from '../../../data/mockDisputes'
import {
  Clock, CheckCircle2, XCircle, ArrowUpCircle, FileText,
  Upload, Eye, Download, AlertTriangle,
  RotateCcw, ShieldCheck, Users, Banknote, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

// ─── Process flow stages (spec) ───────────────────────────────────────────────
const FLOW_STAGES = [
  { key: 'Dispute Raised',       label: 'Raised',      icon: AlertTriangle },
  { key: 'Investigation',        label: 'Investigation', icon: Eye },
  { key: 'Participant Response', label: 'Response',     icon: Users },
  { key: 'Approval',             label: 'Approval',     icon: ShieldCheck },
  { key: 'Refund / Reversal',    label: 'Refund',       icon: Banknote },
  { key: 'Closure',              label: 'Closed',       icon: CheckCircle2 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  failed_debit:      'Failed Debit',
  duplicate_payment: 'Duplicate',
  incorrect_amount:  'Wrong Amount',
  no_confirmation:   'No Confirmation',
}
const TYPE_COLOR: Record<string, string> = {
  failed_debit:      'bg-red-100 text-red-700 border-red-200',
  duplicate_payment: 'bg-orange-100 text-orange-700 border-orange-200',
  incorrect_amount:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  no_confirmation:   'bg-blue-100 text-blue-700 border-blue-200',
}
const STATUS_COLOR: Record<string, string> = {
  open:                 'bg-red-100 text-red-700 border-red-200',
  investigating:        'bg-yellow-100 text-yellow-700 border-yellow-200',
  participant_response: 'bg-blue-100 text-blue-700 border-blue-200',
  approved:             'bg-green-100 text-green-700 border-green-200',
  rejected:             'bg-slate-100 text-slate-600 border-slate-200',
  closed:               'bg-slate-100 text-slate-500 border-slate-200',
}
const REVERSAL_COLOR: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  completed:  'bg-green-100 text-green-700 border-green-200',
  failed:     'bg-red-100 text-red-700 border-red-200',
}
const FILE_ICON_COLOR: Record<string, string> = {
  PDF:  'bg-red-100 text-red-600',
  PNG:  'bg-blue-100 text-blue-600',
  JPEG: 'bg-green-100 text-green-600',
  CSV:  'bg-orange-100 text-orange-600',
}

// ─── SLA Timer ────────────────────────────────────────────────────────────────
function SLATimer({ dueAt, compact }: { dueAt: string; compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(dueAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('OVERDUE'); return }
      const days  = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins  = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [dueAt])

  const overdue = timeLeft === 'OVERDUE'
  return (
    <div className={clsx('flex items-center gap-1 font-mono font-bold',
      overdue ? 'text-danger' : 'text-warning',
      compact ? 'text-[11px]' : 'text-xs',
    )}>
      <Clock size={compact ? 11 : 13} className={overdue ? 'animate-pulse' : ''} />
      {timeLeft}
    </div>
  )
}

// ─── Visual process flow ──────────────────────────────────────────────────────
function ProcessFlow({ dispute }: { dispute: DisputeEx }) {
  const completedStages = new Set(dispute.timeline.map((t) => t.stage))
  const currentStageIdx = FLOW_STAGES.reduce((last, stage, i) => completedStages.has(stage.key) ? i : last, -1)

  return (
    <div className="flex items-center gap-0 w-full">
      {FLOW_STAGES.map(({ key, label, icon: Icon }, i) => {
        const done    = completedStages.has(key)
        const current = i === currentStageIdx + 1 && dispute.status !== 'closed' && dispute.status !== 'approved'
        const closed  = dispute.status === 'closed' || (dispute.status === 'approved' && key === 'Closure')

        return (
          <div key={key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={current ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  done || closed ? 'bg-green-500 border-green-500' :
                  current        ? 'bg-primary border-primary shadow-md shadow-primary/30' :
                  'bg-surface border-border',
                )}
              >
                {done || closed
                  ? <CheckCircle2 size={14} className="text-white" />
                  : <Icon size={13} className={current ? 'text-white' : 'text-muted'} />
                }
              </motion.div>
              <span className={clsx(
                'text-[9px] mt-1 font-medium text-center leading-tight max-w-[44px]',
                done || closed ? 'text-green-600' : current ? 'text-primary' : 'text-muted',
              )}>
                {label}
              </span>
            </div>
            {i < FLOW_STAGES.length - 1 && (
              <div className={clsx('flex-1 h-0.5 mx-0.5 mb-3 rounded-full transition-colors',
                completedStages.has(FLOW_STAGES[i + 1]?.key ?? '') || closed ? 'bg-green-400' :
                i < currentStageIdx ? 'bg-green-400' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Evidence panel ───────────────────────────────────────────────────────────
function EvidencePanel({ evidence }: { evidence: DisputeEvidence[] }) {
  const addToast = useAppStore((s) => s.addToast)
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          Evidence Attachments ({evidence.length})
        </span>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          <Upload size={11} /> Upload
        </button>
      </div>

      {evidence.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-xl p-4 text-center text-xs text-muted">
          No evidence uploaded. Click Upload to attach documents.
        </div>
      ) : (
        <div className="space-y-2">
          {evidence.map((f) => (
            <div key={f.id} className="flex items-center gap-3 bg-surface rounded-xl border border-border px-3 py-2.5">
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0', FILE_ICON_COLOR[f.type])}>
                {f.type}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-800 truncate">{f.name}</div>
                <div className="text-[10px] text-muted">{f.size} · {f.uploadedBy} · {formatDateTime(f.uploadedAt)}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => addToast(`Viewing ${f.name} (demo)`, 'info')}
                  className="p-1.5 text-muted hover:text-primary rounded transition-colors" title="View">
                  <Eye size={13} />
                </button>
                <button onClick={() => addToast(`Downloading ${f.name} (demo)`, 'info')}
                  className="p-1.5 text-muted hover:text-primary rounded transition-colors" title="Download">
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Evidence"
        footer={
          <button
            onClick={() => { addToast('Evidence uploaded successfully', 'success'); setUploadOpen(false) }}
            className="ml-auto px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            Upload
          </button>
        }
      >
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors bg-primary/5"
            onClick={() => addToast('File selected (demo)', 'info')}
          >
            <Upload size={28} className="text-primary/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Click to select a file</p>
            <p className="text-xs text-muted mt-1">PDF, PNG, JPEG, CSV - max 10 MB</p>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Evidence Description</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
              placeholder="Describe what this document shows..." />
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Dispute drawer ───────────────────────────────────────────────────────────
function DisputeDetail({ dispute, onClose, onAction }: {
  dispute: DisputeEx
  onClose: () => void
  onAction: (action: 'approve' | 'reject' | 'escalate') => void
}) {
  const [rejectNote, setRejectNote]   = useState('')
  const [confirmOpen, setConfirmOpen] = useState<'approve' | 'reject' | null>(null)

  const canAct = !['closed', 'approved', 'rejected'].includes(dispute.status)

  return (
    <Drawer
      open
      onClose={onClose}
      title={dispute.id}
      subtitle={`${TYPE_LABELS[dispute.type]} · ${dispute.channel} · ${dispute.agency}`}
    >
      <div className="space-y-5">
        {/* Status + reversal row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={clsx('text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize', STATUS_COLOR[dispute.status])}>
            {dispute.status.replace(/_/g, ' ')}
          </span>
          <span className={clsx('text-[11px] font-bold px-2.5 py-1 rounded-full border', TYPE_COLOR[dispute.type])}>
            {TYPE_LABELS[dispute.type]}
          </span>
          {dispute.reversalStatus && (
            <span className={clsx('text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1',
              REVERSAL_COLOR[dispute.reversalStatus])}>
              <RotateCcw size={10} />
              Reversal: {dispute.reversalStatus}
            </span>
          )}
        </div>

        {/* Process flow */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">Resolution Progress</p>
          <ProcessFlow dispute={dispute} />
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface rounded-xl border border-border p-3">
            <div className="text-[10px] text-muted mb-0.5">Disputed Amount</div>
            <div className="text-base font-black text-primary">{formatUGX(dispute.amount)}</div>
          </div>
          {dispute.refundAmount ? (
            <div className="bg-green-50 rounded-xl border border-green-200 p-3">
              <div className="text-[10px] text-muted mb-0.5">Refund Amount</div>
              <div className="text-base font-black text-green-700">{formatUGX(dispute.refundAmount)}</div>
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border p-3">
              <div className="text-[10px] text-muted mb-0.5">SLA Deadline</div>
              <SLATimer dueAt={dispute.slaDueAt} />
            </div>
          )}
          <div className="bg-surface rounded-xl border border-border p-3 col-span-2">
            <div className="text-[10px] text-muted mb-0.5">Transaction</div>
            <div className="font-mono text-xs font-semibold text-slate-700">{dispute.transactionId}</div>
          </div>
          {dispute.reversalRef && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-3 col-span-2">
              <div className="text-[10px] text-muted mb-0.5">Reversal Reference</div>
              <div className="font-mono text-xs font-semibold text-purple-700">{dispute.reversalRef}</div>
            </div>
          )}
        </div>

        {/* Participant note */}
        {dispute.participantNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
            <div className="font-semibold mb-1 flex items-center gap-1.5">
              <Users size={11} /> Participant Response
            </div>
            {dispute.participantNote}
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Resolution Timeline</p>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {dispute.timeline.map((entry, i) => (
              <div key={i} className="relative mb-4 last:mb-0">
                <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 bg-green-500 border-green-500" />
                <div className="text-[10px] text-muted">{formatDateTime(entry.timestamp)}</div>
                <div className="text-xs font-semibold text-slate-800">{entry.stage}</div>
                <div className="text-[10px] text-muted">{entry.actor}</div>
                {entry.note && <div className="text-xs text-slate-600 mt-0.5 bg-surface rounded-lg p-2 border border-border">{entry.note}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <EvidencePanel evidence={dispute.evidence ?? []} />

        {/* Actions */}
        {canAct && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <button
              onClick={() => setConfirmOpen('approve')}
              className="flex items-center justify-center gap-2 py-2.5 bg-success text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 size={14} /> Approve Refund
            </button>
            <button
              onClick={() => setConfirmOpen('reject')}
              className="flex items-center justify-center gap-2 py-2.5 border border-danger text-danger rounded-xl text-sm hover:bg-danger-light transition-colors"
            >
              <XCircle size={14} /> Reject Dispute
            </button>
            <button
              onClick={() => onAction('escalate')}
              className="flex items-center justify-center gap-2 py-2.5 border border-border text-muted rounded-xl text-sm hover:text-slate-800 transition-colors"
            >
              <ArrowUpCircle size={14} /> Escalate to Compliance
            </button>
          </div>
        )}
      </div>

      {/* Approve confirmation */}
      <Modal
        open={confirmOpen === 'approve'}
        onClose={() => setConfirmOpen(null)}
        title="Approve Refund"
        footer={
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setConfirmOpen(null)}
              className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:bg-surface transition-colors">
              Cancel
            </button>
            <button onClick={() => { onAction('approve'); setConfirmOpen(null) }}
              className="px-4 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              Confirm Approval
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-800 text-xs">
            Approving this dispute will initiate a refund of <strong>{formatUGX(dispute.refundAmount ?? dispute.amount)}</strong> to the payer via the original channel.
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-muted">Payer</span><span>{dispute.payer}</span></div>
            <div className="flex justify-between"><span className="text-muted">Refund amount</span><span className="font-bold text-green-700">{formatUGX(dispute.refundAmount ?? dispute.amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Channel</span><span>{dispute.channel}</span></div>
          </div>
        </div>
      </Modal>

      {/* Reject confirmation */}
      <Modal
        open={confirmOpen === 'reject'}
        onClose={() => setConfirmOpen(null)}
        title="Reject Dispute"
        footer={
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setConfirmOpen(null)}
              className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:bg-surface transition-colors">
              Cancel
            </button>
            <button onClick={() => { onAction('reject'); setConfirmOpen(null) }}
              className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
              Confirm Rejection
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs text-muted block mb-1">Rejection Reason *</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
              placeholder="Explain why this dispute is being rejected..."
            />
          </div>
        </div>
      </Modal>
    </Drawer>
  )
}

// ─── KPI strip ────────────────────────────────────────────────────────────────
function KpiStrip({ disputes }: { disputes: DisputeEx[] }) {
  const open        = disputes.filter((d) => d.status === 'open').length
  const overdue     = disputes.filter((d) => new Date(d.slaDueAt) < new Date() && d.status !== 'closed').length
  const refundsPending = disputes.filter((d) => d.refundAmount && d.status !== 'closed').length
  const totalValue  = disputes.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {[
        { label: 'Open Disputes',    value: open,         icon: <AlertTriangle size={16} />, color: 'bg-red-50 border-red-200 text-danger' },
        { label: 'Overdue SLA',      value: overdue,      icon: <Clock size={16} />,         color: 'bg-orange-50 border-orange-200 text-orange-700' },
        { label: 'Refunds Pending',  value: refundsPending, icon: <Banknote size={16} />,    color: 'bg-green-50 border-green-200 text-green-700' },
        { label: 'Total in Dispute', value: formatUGX(totalValue), icon: <FileText size={16} />, color: 'bg-surface border-border text-primary' },
      ].map(({ label, value, icon, color }) => (
        <motion.div key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className={clsx('rounded-xl border p-4 flex items-center gap-3', color)}>
          <div className="opacity-70">{icon}</div>
          <div>
            <div className="text-xl font-black">{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Dispute row ──────────────────────────────────────────────────────────────
function DisputeRow({ d, onClick }: { d: DisputeEx; onClick: () => void }) {
  const overdue = new Date(d.slaDueAt) < new Date() && d.status !== 'closed'

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={clsx(
        'border-b border-border cursor-pointer transition-colors group',
        overdue           ? 'bg-red-50/30 hover:bg-red-50' :
        d.status === 'closed' ? 'opacity-60 hover:bg-surface' :
        'hover:bg-primary-50',
      )}
    >
      <td className="px-4 py-3 font-mono text-xs text-muted">{d.id}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted">{d.transactionId}</td>
      <td className="px-4 py-3 text-sm font-medium text-slate-800">{d.payer}</td>
      <td className="px-4 py-3">
        <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full border', TYPE_COLOR[d.type])}>
          {TYPE_LABELS[d.type]}
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-primary text-sm">{formatUGX(d.amount)}</td>
      <td className="px-4 py-3">
        {d.refundAmount
          ? <span className="text-xs font-semibold text-green-700">{formatUGX(d.refundAmount)}</span>
          : <span className="text-xs text-muted">•</span>
        }
      </td>
      <td className="px-4 py-3">
        <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize', STATUS_COLOR[d.status])}>
          {d.status.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="px-4 py-3">
        {d.reversalStatus ? (
          <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit',
            REVERSAL_COLOR[d.reversalStatus])}>
            <RotateCcw size={9} /> {d.reversalStatus}
          </span>
        ) : <span className="text-xs text-muted">•</span>}
      </td>
      <td className="px-4 py-3">
        {d.status !== 'closed' ? <SLATimer dueAt={d.slaDueAt} compact /> : <span className="text-xs text-muted">•</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {d.evidence.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-1.5 py-0.5 font-bold">
              {d.evidence.length} files
            </span>
          )}
          <ChevronRight size={14} className="text-muted group-hover:text-primary transition-colors" />
        </div>
      </td>
    </motion.tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
type TypeFilter = 'all' | 'failed_debit' | 'duplicate_payment' | 'incorrect_amount' | 'no_confirmation'
type StatusFilter = 'all' | 'open' | 'investigating' | 'participant_response' | 'approved' | 'closed'

export default function DisputesPage() {
  const addToast = useAppStore((s) => s.addToast)

  const [selected, setSelected]         = useState<DisputeEx | null>(null)
  const [typeFilter, setTypeFilter]     = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [disputes, setDisputes]         = useState<DisputeEx[]>(mockDisputes)

  function handleAction(action: 'approve' | 'reject' | 'escalate') {
    if (!selected) return
    const newStatus =
      action === 'approve'  ? 'approved' :
      action === 'reject'   ? 'rejected' :
      'investigating'

    setDisputes((prev) => prev.map((d) =>
      d.id !== selected.id ? d : {
        ...d,
        status: newStatus,
        reversalStatus: action === 'approve' ? 'processing' : d.reversalStatus,
        timeline: [
          ...d.timeline,
          {
            stage: action === 'approve' ? 'Approval' : action === 'reject' ? 'Closure' : 'Investigation',
            actor: 'Current User',
            timestamp: new Date().toISOString(),
            note: action === 'approve' ? 'Refund approved - reversal initiated' :
                  action === 'reject'  ? 'Dispute rejected by support officer' :
                  'Escalated to compliance team for review',
          },
        ],
      }
    ))

    addToast(
      action === 'approve'  ? `Dispute ${selected.id} approved - refund processing` :
      action === 'reject'   ? `Dispute ${selected.id} rejected`  :
      `Dispute ${selected.id} escalated to compliance`,
      action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning',
    )
    setSelected(null)
  }

  const filtered = disputes.filter((d) => {
    const matchType   = typeFilter   === 'all' || d.type   === typeFilter
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchType && matchStatus
  })

  const TYPE_TABS: { val: TypeFilter; label: string }[] = [
    { val: 'all',               label: `All (${disputes.length})` },
    { val: 'failed_debit',      label: `Failed Debit (${disputes.filter((d) => d.type === 'failed_debit').length})` },
    { val: 'duplicate_payment', label: `Duplicate (${disputes.filter((d) => d.type === 'duplicate_payment').length})` },
    { val: 'incorrect_amount',  label: `Wrong Amount (${disputes.filter((d) => d.type === 'incorrect_amount').length})` },
    { val: 'no_confirmation',   label: `No Confirmation (${disputes.filter((d) => d.type === 'no_confirmation').length})` },
  ]

  return (
    <div>
      <PageHeader
        title="Disputes & Refunds"
        subtitle="Payment dispute resolution, refund management, and reversal tracking"
      />

      <KpiStrip disputes={disputes} />

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Type tabs */}
        <div className="flex gap-1 bg-surface p-1 rounded-xl border border-border flex-wrap">
          {TYPE_TABS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={clsx(
                'px-3 py-1.5 text-xs rounded-lg font-medium transition-all',
                typeFilter === val ? 'bg-card text-slate-800 shadow-sm' : 'text-muted hover:text-slate-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="border border-border rounded-xl px-3 py-2 text-xs outline-none bg-white text-muted focus:border-primary/50"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="participant_response">Participant Response</option>
          <option value="approved">Approved</option>
          <option value="closed">Closed</option>
        </select>

        <span className="text-xs text-muted ml-auto">{filtered.length} disputes</span>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                {['Dispute ID', 'Transaction', 'Payer', 'Type', 'Amount', 'Refund', 'Status', 'Reversal', 'SLA', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <AnimatePresence mode="popLayout">
              <motion.tbody layout>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted">
                      No disputes match the current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <DisputeRow key={d.id} d={d} onClick={() => setSelected(d)} />
                  ))
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </div>

      {/* ── Dispute detail drawer ──────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <DisputeDetail
            dispute={selected}
            onClose={() => setSelected(null)}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
