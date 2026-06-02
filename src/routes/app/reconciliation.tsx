import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { PieChart } from '../../components/charts/PieChart'
import { LineChart } from '../../components/charts/LineChart'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatDateTime } from '../../utils/format'
import {
  switchRecords, agencyRecords, bankRecords, treasuryRecords,
  latestReconRun, matchRateTrend,
} from '../../data/mockReconciliation'
import {
  PlayCircle, CheckCircle2, AlertTriangle,
  XCircle, RefreshCw, Search,
  Landmark, Building2, CreditCard, BookOpen,
  TrendingUp, AlertCircle,
} from 'lucide-react'
import type { ReconRecord, ReconExceptionType } from '../../types'
import clsx from 'clsx'

// ─── Run stages ──────────────────────────────────────────────────────────────
const RUN_STAGES = [
  { label: 'Loading Switch Records',      detail: 'Fetching 200 switch-side payment records',       count: latestReconRun.totalSwitch },
  { label: 'Loading Agency Records',      detail: 'Fetching records from URA, NIRA, KCCA, Police',  count: latestReconRun.totalAgency },
  { label: 'Loading Bank / MNO Records',  detail: 'Fetching MTN, Airtel, bank confirmations',       count: latestReconRun.totalBank },
  { label: 'Loading Treasury Records',    detail: 'Fetching BOU consolidated fund entries',          count: latestReconRun.totalTreasury },
  { label: 'Matching Transactions',       detail: 'Running deterministic match algorithm',           count: latestReconRun.matched },
  { label: 'Detecting Exceptions',        detail: 'Classifying unmatched, duplicates, variances',   count: latestReconRun.unmatched + latestReconRun.duplicates },
  { label: 'Generating Report',           detail: 'Writing reconciliation summary & audit log',      count: null },
]

const STAGE_DELAYS = [600, 700, 700, 600, 900, 800, 500]

// ─── Exception badge colours ──────────────────────────────────────────────────
const EX_STYLE: Record<ReconExceptionType, { badge: string; row: string; label: string }> = {
  unmatched:            { badge: 'bg-red-100 text-red-700 border-red-200',       row: 'hover:bg-red-50',     label: 'Unmatched' },
  duplicate:            { badge: 'bg-orange-100 text-orange-700 border-orange-200', row: 'hover:bg-orange-50', label: 'Duplicate' },
  missing_confirmation: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', row: 'hover:bg-yellow-50', label: 'Missing Conf.' },
  overpayment:          { badge: 'bg-purple-100 text-purple-700 border-purple-200', row: 'hover:bg-purple-50', label: 'Overpayment' },
  underpayment:         { badge: 'bg-blue-100 text-blue-700 border-blue-200',      row: 'hover:bg-blue-50',    label: 'Underpayment' },
}

// ─── Animated run overlay ─────────────────────────────────────────────────────
function ReconAnimation({ onClose }: { onClose: (score: number) => void }) {
  const [stage, setStage] = useState(-1)
  const [done, setDone]   = useState(false)
  const ran               = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    let delay = 400
    STAGE_DELAYS.forEach((d, i) => {
      setTimeout(() => setStage(i), delay)
      delay += d
    })
    setTimeout(() => setDone(true), delay + 200)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            done ? 'bg-green-100' : 'bg-primary/10'
          )}>
            {done
              ? <CheckCircle2 size={22} className="text-green-600" />
              : <RefreshCw size={22} className="text-primary animate-spin" />
            }
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">
              {done ? 'Reconciliation Complete' : 'Running Reconciliation…'}
            </div>
            <div className="text-xs text-muted">
              {done ? `Run ID: ${latestReconRun.id}` : 'Processing all record sources'}
            </div>
          </div>
        </div>

        {/* Stage list */}
        <div className="space-y-2 mb-5">
          {RUN_STAGES.map((s, i) => {
            const active  = i === stage && !done
            const past    = i < stage || done
            const waiting = !past && !active

            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: waiting ? 0.4 : 1 }}
                className={clsx(
                  'flex items-center gap-3 p-2.5 rounded-xl border transition-all',
                  past    && 'bg-green-50 border-green-200',
                  active  && 'bg-primary/5 border-primary/30',
                  waiting && 'bg-surface border-transparent',
                )}
              >
                {/* Icon */}
                <div className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0',
                  past    && 'bg-green-500 text-white',
                  active  && 'bg-primary text-white',
                  waiting && 'bg-border text-muted',
                )}>
                  {past ? '✓' : active
                    ? <RefreshCw size={11} className="animate-spin" />
                    : i + 1
                  }
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className={clsx(
                    'text-xs font-semibold leading-tight',
                    past ? 'text-green-700' : active ? 'text-primary' : 'text-muted'
                  )}>{s.label}</div>
                  <div className="text-[10px] text-muted truncate">{s.detail}</div>
                </div>

                {/* Count */}
                {past && s.count !== null && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-bold text-green-600 bg-green-100 rounded-full px-2 py-0.5 flex-shrink-0"
                  >
                    {s.count?.toLocaleString()}
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Score reveal */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4 text-center"
            >
              <div className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Reconciliation Score</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black text-green-700"
              >
                {latestReconRun.matchRate}%
              </motion.div>
              <div className="text-xs text-green-600 mt-1">
                {latestReconRun.matched.toLocaleString()} matched ·{' '}
                {(latestReconRun.unmatched + latestReconRun.duplicates + latestReconRun.missingConfirmations + latestReconRun.overpayments + latestReconRun.underpayments)} exceptions
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {done && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onClose(latestReconRun.matchRate)}
            className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            View Results
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

// ─── Records table ────────────────────────────────────────────────────────────
function RecordsTable({
  records, onSelect, search,
}: {
  records: ReconRecord[]
  onSelect: (r: ReconRecord) => void
  search: string
}) {
  const filtered = search
    ? records.filter((r) =>
        r.transactionId.includes(search) ||
        r.payer.toLowerCase().includes(search.toLowerCase()) ||
        r.agency.toLowerCase().includes(search.toLowerCase())
      )
    : records

  if (filtered.length === 0) {
    return <div className="p-8 text-center text-sm text-muted">No records match the filter.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-surface border-b border-border sticky top-0">
          <tr>
            {['Transaction ID', 'Payer', 'Agency', 'Channel', 'Amount', 'Status', 'Type'].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filtered.slice(0, 60).map((r) => {
            const ex = r.exceptionType ? EX_STYLE[r.exceptionType] : null
            return (
              <tr
                key={r.id}
                onClick={() => r.status !== 'matched' && onSelect(r)}
                className={clsx(
                  'transition-colors',
                  r.status === 'matched'  && 'hover:bg-green-50/50',
                  r.status === 'resolved' && 'hover:bg-slate-50 opacity-60',
                  ex?.row,
                  r.status !== 'matched' && 'cursor-pointer',
                )}
              >
                <td className="px-3 py-2 font-mono text-[11px] text-muted">{r.transactionId}</td>
                <td className="px-3 py-2 font-medium text-slate-800">{r.payer}</td>
                <td className="px-3 py-2 text-slate-600">{r.agency}</td>
                <td className="px-3 py-2 text-muted">{r.channel}</td>
                <td className="px-3 py-2 font-semibold text-slate-800">{formatUGX(r.amount)}</td>
                <td className="px-3 py-2">
                  <span className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                    r.status === 'matched'  && 'bg-green-100 text-green-700 border-green-200',
                    r.status === 'unmatched' && 'bg-red-100 text-red-700 border-red-200',
                    r.status === 'exception' && 'bg-orange-100 text-orange-700 border-orange-200',
                    r.status === 'resolved' && 'bg-slate-100 text-slate-500 border-slate-200',
                  )}>
                    {r.status === 'matched'  && <CheckCircle2 size={9} />}
                    {r.status === 'unmatched' && <XCircle size={9} />}
                    {r.status === 'exception' && <AlertTriangle size={9} />}
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {ex && (
                    <span className={clsx('inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border', ex.badge)}>
                      {ex.label}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {filtered.length > 60 && (
        <div className="px-4 py-2 text-xs text-muted text-center border-t border-border">
          Showing 60 of {filtered.length} records
        </div>
      )}
    </div>
  )
}

// ─── Exception queue ──────────────────────────────────────────────────────────
function ExceptionQueue({ onSelect }: { onSelect: (r: ReconRecord) => void }) {
  const [exTab, setExTab] = useState<ReconExceptionType | 'all'>('all')

  const allExceptions = [
    ...switchRecords, ...agencyRecords, ...bankRecords, ...treasuryRecords,
  ].filter((r) => r.status === 'exception' || r.status === 'unmatched')

  const exCounts: Record<string, number> = {
    unmatched:            latestReconRun.unmatched,
    duplicate:            latestReconRun.duplicates,
    missing_confirmation: latestReconRun.missingConfirmations,
    overpayment:          latestReconRun.overpayments,
    underpayment:         latestReconRun.underpayments,
  }

  const filtered = exTab === 'all'
    ? allExceptions
    : allExceptions.filter((r) => r.exceptionType === exTab)

  const EX_TABS: { val: ReconExceptionType | 'all'; label: string }[] = [
    { val: 'all',                  label: `All (${allExceptions.length})` },
    { val: 'unmatched',            label: `Unmatched (${exCounts.unmatched})` },
    { val: 'duplicate',            label: `Duplicates (${exCounts.duplicate})` },
    { val: 'missing_confirmation', label: `Missing Conf. (${exCounts.missing_confirmation})` },
    { val: 'overpayment',          label: `Overpayments (${exCounts.overpayment})` },
    { val: 'underpayment',         label: `Underpayments (${exCounts.underpayment})` },
  ]

  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      {/* Sub-tabs */}
      <div className="border-b border-border bg-surface px-3 pt-3">
        <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {EX_TABS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setExTab(val)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap',
                exTab === val
                  ? 'text-slate-800 border-primary bg-card'
                  : 'text-muted border-transparent hover:text-slate-600',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Exception rows */}
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No exceptions in this category.</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-surface border-b border-border sticky top-0">
              <tr>
                {['Transaction', 'Payer', 'Agency', 'Source', 'Switch Amt', 'Reported Amt', 'Variance', 'Type', 'Action'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 40).map((r) => {
                const ex = r.exceptionType ? EX_STYLE[r.exceptionType] : null
                return (
                  <tr key={r.id} className={clsx('transition-colors', ex?.row ?? 'hover:bg-surface')}>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted">{r.transactionId}</td>
                    <td className="px-3 py-2 font-medium">{r.payer}</td>
                    <td className="px-3 py-2 text-muted">{r.agency}</td>
                    <td className="px-3 py-2">
                      <span className="capitalize px-1.5 py-0.5 bg-surface border border-border rounded text-[10px]">
                        {r.source}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.switchAmount ? formatUGX(r.switchAmount) : formatUGX(r.amount)}</td>
                    <td className="px-3 py-2">{r.reportedAmount ? formatUGX(r.reportedAmount) : '—'}</td>
                    <td className={clsx('px-3 py-2 font-semibold', r.variance ? (r.exceptionType === 'overpayment' ? 'text-purple-700' : 'text-blue-700') : '')}>
                      {r.variance ? formatUGX(r.variance) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {ex && <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold border', ex.badge)}>{ex.label}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onSelect(r)}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Resolution modal ─────────────────────────────────────────────────────────
const RESOLUTION_ACTIONS = [
  { val: 'accept',   label: 'Accept & Close',        desc: 'Mark as reconciled — variance within tolerance' },
  { val: 'reject',   label: 'Reject & Return',        desc: 'Send back to participant for correction' },
  { val: 'escalate', label: 'Escalate to Compliance', desc: 'Flag for AML/compliance review' },
  { val: 'reverse',  label: 'Initiate Reversal',      desc: 'Trigger payment reversal workflow' },
]

function ResolutionModal({
  record, open, onClose,
}: {
  record: ReconRecord | null
  open: boolean
  onClose: () => void
}) {
  const addToast = useAppStore((s) => s.addToast)
  const [action, setAction] = useState('accept')
  const [note, setNote]     = useState('')

  function save() {
    addToast(`Exception ${action === 'accept' ? 'resolved' : action === 'reject' ? 'rejected' : action === 'escalate' ? 'escalated' : 'reversed'}: ${record?.transactionId}`, 'success')
    setAction('accept')
    setNote('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resolve Exception"
      footer={
        <div className="flex gap-2 w-full">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:bg-surface transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!note.trim()}
            className="ml-auto px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light disabled:opacity-50 transition-colors"
          >
            Save Resolution
          </button>
        </div>
      }
    >
      {record && (
        <div className="space-y-4 text-sm">
          {/* Record summary */}
          <div className="bg-surface rounded-xl p-3 space-y-1.5 text-xs">
            <Row label="Transaction ID" value={record.transactionId} mono />
            <Row label="Payer"          value={record.payer} />
            <Row label="Agency"         value={record.agency} />
            <Row label="Amount"         value={formatUGX(record.amount)} />
            {record.switchAmount && <Row label="Switch Amount"   value={formatUGX(record.switchAmount)} />}
            {record.reportedAmount && <Row label="Reported Amount" value={formatUGX(record.reportedAmount)} />}
            {record.variance && (
              <Row label="Variance" value={formatUGX(record.variance)}
                valueClass={record.exceptionType === 'overpayment' ? 'text-purple-700 font-bold' : 'text-blue-700 font-bold'} />
            )}
          </div>

          {/* Exception type badge */}
          {record.exceptionType && (
            <div className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold',
              EX_STYLE[record.exceptionType].badge)}>
              <AlertTriangle size={12} />
              {EX_STYLE[record.exceptionType].label}
            </div>
          )}

          {/* Resolution action */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Resolution Action</label>
            <div className="space-y-2">
              {RESOLUTION_ACTIONS.map(({ val, label, desc }) => (
                <label
                  key={val}
                  className={clsx(
                    'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                    action === val ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface',
                  )}
                >
                  <input
                    type="radio"
                    name="action"
                    value={val}
                    checked={action === val}
                    onChange={() => setAction(val)}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{label}</div>
                    <div className="text-[11px] text-muted">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
              Resolution Note <span className="text-danger">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
              placeholder="Describe the resolution action taken and supporting evidence…"
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

function Row({ label, value, mono, valueClass }: { label: string; value: string; mono?: boolean; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted">{label}</span>
      <span className={clsx('font-medium text-slate-800', mono && 'font-mono text-[10px]', valueClass)}>{value}</span>
    </div>
  )
}

// ─── KPI chip ─────────────────────────────────────────────────────────────────
function KpiChip({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={clsx('rounded-xl border p-3 flex flex-col gap-0.5', color)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-lg font-black leading-tight">{value}</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReconciliationPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [showAnimation, setShowAnimation] = useState(false)
  const [hasRun, setHasRun]               = useState(true)  // show results on load (from last run)
  const [score, setScore]                 = useState(latestReconRun.matchRate)
  const [search, setSearch]               = useState('')
  const [selectedRecord, setSelectedRecord] = useState<ReconRecord | null>(null)
  const [resolveOpen, setResolveOpen]     = useState(false)

  function handleRunComplete(s: number) {
    setShowAnimation(false)
    setHasRun(true)
    setScore(s)
    addToast(`Reconciliation complete — ${s}% match rate`, 'success')
  }

  function openResolve(r: ReconRecord) {
    setSelectedRecord(r)
    setResolveOpen(true)
  }

  const run = latestReconRun

  const piData = [
    { name: 'Matched',    value: run.matched,                                                                           color: '#16A34A' },
    { name: 'Unmatched',  value: run.unmatched,                                                                         color: '#D62828' },
    { name: 'Duplicate',  value: run.duplicates,                                                                        color: '#D97706' },
    { name: 'Missing',    value: run.missingConfirmations,                                                              color: '#9333EA' },
    { name: 'Over/Under', value: run.overpayments + run.underpayments,                                                  color: '#2563EB' },
  ]

  const RECORD_TABS = [
    { val: 'switch',   label: 'Switch Records',    icon: BookOpen,   records: switchRecords,  count: run.totalSwitch },
    { val: 'agency',   label: 'Agency Records',    icon: Building2,  records: agencyRecords,  count: run.totalAgency },
    { val: 'bank',     label: 'Bank / MNO',        icon: CreditCard, records: bankRecords,    count: run.totalBank },
    { val: 'treasury', label: 'Treasury Records',  icon: Landmark,   records: treasuryRecords, count: run.totalTreasury },
  ]

  return (
    <div>
      {/* Animated overlay */}
      <AnimatePresence>
        {showAnimation && <ReconAnimation onClose={handleRunComplete} />}
      </AnimatePresence>

      <PageHeader
        title="Reconciliation"
        subtitle="Match payment records across switch, agency, bank, and treasury systems"
        actions={
          <button
            onClick={() => setShowAnimation(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            <PlayCircle size={15} />
            Run Reconciliation
          </button>
        }
      />

      {/* ── Summary + chart row ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Score donut */}
        <div className="bg-card rounded-card shadow-card p-4 flex flex-col items-center justify-center">
          <div className="text-xs text-muted uppercase tracking-wide mb-2 font-semibold">Reconciliation Score</div>
          <PieChart data={piData} height={150} donut />
          <div className="text-4xl font-black text-primary mt-2">{score}%</div>
          <div className="text-xs text-muted mt-0.5">
            Last run: {run.completedAt ? formatDateTime(run.completedAt) : '—'}
          </div>
          <div className="text-[10px] text-muted mt-0.5">by {run.triggeredBy}</div>
        </div>

        {/* KPI chips grid */}
        <div className="grid grid-cols-3 gap-2 content-start">
          <KpiChip label="Switch"   value={run.totalSwitch.toLocaleString()}     color="bg-slate-50 border-slate-200 text-slate-700" />
          <KpiChip label="Agency"   value={run.totalAgency.toLocaleString()}     color="bg-purple-50 border-purple-200 text-purple-700" />
          <KpiChip label="Bank"     value={run.totalBank.toLocaleString()}       color="bg-blue-50 border-blue-200 text-blue-700" />
          <KpiChip label="Treasury" value={run.totalTreasury.toLocaleString()}   color="bg-amber-50 border-amber-200 text-amber-700" />
          <KpiChip label="Matched"  value={run.matched.toLocaleString()}         color="bg-green-50 border-green-200 text-green-700" />
          <KpiChip label="Unmatched" value={run.unmatched.toLocaleString()}      color="bg-red-50 border-red-200 text-red-700" />
          <KpiChip label="Duplicates" value={run.duplicates.toLocaleString()}    color="bg-orange-50 border-orange-200 text-orange-700" />
          <KpiChip label="Missing"  value={run.missingConfirmations.toLocaleString()} color="bg-yellow-50 border-yellow-200 text-yellow-700" />
          <KpiChip label="Over/Under" value={(run.overpayments + run.underpayments).toLocaleString()} color="bg-indigo-50 border-indigo-200 text-indigo-700" />
        </div>

        {/* 14-day trend */}
        <div className="bg-card rounded-card shadow-card p-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Match Rate — Last 14 Days</div>
          <LineChart
            data={matchRateTrend}
            xKey="day"
            lines={[
              { key: 'matched',   color: '#16A34A', name: 'Matched %' },
              { key: 'unmatched', color: '#D62828', name: 'Unmatched %' },
              { key: 'exception', color: '#D97706', name: 'Exception %' },
            ]}
            height={175}
          />
        </div>
      </div>

      {/* ── Record source tabs ───────────────────────────────── */}
      {hasRun && (
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" /> Record Sources
          </h2>
          <Tabs.Root defaultValue="switch">
            <div className="flex items-center justify-between mb-2">
              <Tabs.List className="flex gap-1 bg-surface p-1 rounded-lg border border-border w-fit">
                {RECORD_TABS.map(({ val, label, icon: Icon, count }) => (
                  <Tabs.Trigger
                    key={val}
                    value={val}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md text-muted font-medium
                      data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:shadow-sm
                      hover:text-slate-800 transition-all"
                  >
                    <Icon size={12} />
                    {label}
                    <span className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5 font-bold">
                      {count}
                    </span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {/* Search */}
              <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
                <Search size={12} className="text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, payer, agency…"
                  className="text-xs outline-none bg-transparent w-40 placeholder:text-muted"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-muted hover:text-slate-800">
                    <XCircle size={12} />
                  </button>
                )}
              </div>
            </div>

            {RECORD_TABS.map(({ val, records }) => (
              <Tabs.Content key={val} value={val}>
                <div className="bg-card rounded-card shadow-card overflow-hidden max-h-72 overflow-y-auto">
                  <RecordsTable records={records} onSelect={openResolve} search={search} />
                </div>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </div>
      )}

      {/* ── Exception queue ──────────────────────────────────── */}
      {hasRun && (
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-danger" />
            Exception Queue
            <span className="text-xs bg-danger/10 text-danger border border-danger/20 rounded-full px-2 py-0.5 font-bold">
              {run.unmatched + run.duplicates + run.missingConfirmations + run.overpayments + run.underpayments}
            </span>
          </h2>
          <ExceptionQueue onSelect={openResolve} />
        </div>
      )}

      {!hasRun && (
        <div className="py-16 text-center text-muted">
          <PlayCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No reconciliation run yet.</p>
          <p className="text-xs mt-1">Click "Run Reconciliation" to match records across all sources.</p>
        </div>
      )}

      {/* ── Resolution modal ─────────────────────────────────── */}
      <ResolutionModal
        record={selectedRecord}
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
      />
    </div>
  )
}
