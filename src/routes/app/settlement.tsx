import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../components/ui/PageHeader'
import { KPICard } from '../../components/ui/KPICard'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ErrorState } from '../../components/ui/ErrorState'
import { Timeline } from '../../components/ui/Timeline'
import { settlementsApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX, formatDate, formatDateTime } from '../../utils/format'
import { staggerContainer, fadeInUp } from '../../utils/animations'
import {
  Download, CheckCircle, XCircle, RotateCcw, Banknote,
  Building2, Landmark, CreditCard, ChevronRight, Clock,
  TrendingUp, AlertTriangle, RefreshCw,
} from 'lucide-react'
import type { SettlementBatch, SettlementAccount } from '../../types'
import clsx from 'clsx'

// ─── Pipeline stages ──────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { label: 'Batch Created',      detail: 'Transactions grouped by participant' },
  { label: 'Validation',         detail: 'Reference & balance integrity checks' },
  { label: 'Netting',            detail: 'Multilateral net position calculated' },
  { label: 'Approval',           detail: 'Treasury Officer sign-off required' },
  { label: 'BOU Debit/Credit',   detail: 'Settlement accounts updated at BOU' },
  { label: 'Complete',           detail: 'Settlement report distributed' },
]

// ─── CSV export ───────────────────────────────────────────────────────────────
function downloadCSV(batches: SettlementBatch[]) {
  const header = 'Batch ID,Date,Participant,Gross Amount (UGX),Net Amount (UGX),Transactions,Status,Approved By,Completed At\n'
  const rows = batches.map((b) =>
    [b.id, b.batchDate, b.participant, b.grossAmount, b.netAmount,
     b.transactionCount, b.status, b.approvedBy ?? '', b.completedAt ?? ''].join(',')
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `settlement-report-${new Date().toISOString().split('T')[0]}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ─── Animated pipeline component ─────────────────────────────────────────────
function AnimatedPipeline({ active }: { active: boolean }) {
  const [stage, setStage] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) { setStage(0); return }
    setStage(0)
    timerRef.current = setInterval(() => {
      setStage((s) => {
        if (s >= PIPELINE_STAGES.length - 1) {
          clearInterval(timerRef.current!)
          return s
        }
        return s + 1
      })
    }, 900)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [active])

  return (
    <div className="space-y-2">
      {PIPELINE_STAGES.map((s, i) => {
        const done    = i < stage
        const current = i === stage && active
        const waiting = i > stage

        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={clsx(
              'flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300',
              done    && 'bg-green-50 border-green-200',
              current && 'bg-primary/5 border-primary/30 shadow-sm',
              waiting && 'bg-surface border-transparent',
            )}
          >
            <div className={clsx(
              'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-300',
              done    && 'bg-green-500 text-white',
              current && 'bg-primary text-white animate-pulse',
              waiting && 'bg-border text-muted',
            )}>
              {done ? '✓' : i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className={clsx(
                'text-xs font-semibold leading-tight',
                done    && 'text-green-700',
                current && 'text-primary',
                waiting && 'text-muted',
              )}>{s.label}</div>
              <div className="text-[10px] text-muted truncate">{s.detail}</div>
            </div>
            {current && (
              <RefreshCw size={12} className="text-primary animate-spin flex-shrink-0" />
            )}
            {done && (
              <span className="text-[10px] text-green-600 font-medium flex-shrink-0">Done</span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Account group ────────────────────────────────────────────────────────────
function AccountGroup({ title, icon: Icon, accounts, iconColor }: {
  title: string
  icon: React.ElementType
  accounts: SettlementAccount[]
  iconColor: string
}) {
  if (accounts.length === 0) return null
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} className={iconColor} />
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{title}</span>
      </div>
      <div className="space-y-1.5">
        {accounts.map((acc) => (
          <div key={acc.accountNumber} className="bg-surface rounded-lg px-3 py-2.5 border border-border">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1 mr-2">
                <div className="text-xs font-medium text-slate-800 truncate">{acc.participant}</div>
                <div className="text-[10px] text-muted font-mono">{acc.accountNumber}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-primary">{formatUGX(acc.balance)}</div>
                {acc.pendingInflow > 0 && (
                  <div className="text-[10px] text-green-600">+{formatUGX(acc.pendingInflow)} in</div>
                )}
                {acc.pendingOutflow > 0 && (
                  <div className="text-[10px] text-red-500">−{formatUGX(acc.pendingOutflow)} out</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Batch row ────────────────────────────────────────────────────────────────
function BatchRow({ batch, onClick }: { batch: SettlementBatch; onClick: () => void }) {
  const isProcessing = batch.status === 'processing'

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="border-b border-border hover:bg-primary-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 font-mono text-xs text-muted">{batch.id}</td>
      <td className="px-4 py-3 text-sm font-medium text-slate-800">{batch.participant}</td>
      <td className="px-4 py-3 text-sm">{formatUGX(batch.grossAmount)}</td>
      <td className="px-4 py-3 text-sm font-semibold text-primary">{formatUGX(batch.netAmount)}</td>
      <td className="px-4 py-3 text-sm">{batch.transactionCount.toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {isProcessing && <RefreshCw size={11} className="text-warning animate-spin" />}
          <Badge variant={statusVariant(batch.status)}>{batch.status}</Badge>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted">{formatDate(batch.batchDate)}</td>
      <td className="px-4 py-3">
        <ChevronRight size={14} className="text-muted" />
      </td>
    </motion.tr>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettlementPage() {
  const addToast           = useAppStore((s) => s.addToast)
  const pushSecurityEvent  = useAppStore((s) => s.pushSecurityEvent)
  const qc                 = useQueryClient()
  const [selectedBatch, setSelectedBatch]   = useState<SettlementBatch | null>(null)
  const [activeTab, setActiveTab]           = useState('all')
  const [rightPanel, setRightPanel]         = useState<'pipeline' | 'accounts' | 'timeline'>('pipeline')
  const [confirmAction, setConfirmAction]   = useState<'approve' | 'reject' | null>(null)

  const { data: batches = [], isLoading, isError } = useQuery({
    queryKey: ['settlement-batches'],
    queryFn: settlementsApi.listBatches,
  })
  const { data: accounts = [] } = useQuery({
    queryKey: ['settlement-accounts'],
    queryFn: settlementsApi.listAccounts,
  })

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id: string) => settlementsApi.approve(id),
    onSuccess: () => {
      addToast('Settlement batch approved and queued for BOU processing', 'success')
      pushSecurityEvent('SETTLEMENT_APPROVED', 'Settlement batch approved', selectedBatch?.id)
      qc.invalidateQueries({ queryKey: ['settlement-batches'] })
      setSelectedBatch(null)
    },
  })
  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => settlementsApi.reject(id),
    onSuccess: () => {
      addToast('Settlement batch rejected — sent back for review', 'error')
      pushSecurityEvent('SETTLEMENT_REJECTED', 'Settlement batch rejected', selectedBatch?.id)
      qc.invalidateQueries({ queryKey: ['settlement-batches'] })
      setSelectedBatch(null)
    },
  })
  const { mutate: rerun } = useMutation({
    mutationFn: (id: string) => settlementsApi.rerun(id),
    onSuccess: () => {
      addToast('Settlement batch requeued for processing', 'info')
      qc.invalidateQueries({ queryKey: ['settlement-batches'] })
      setSelectedBatch(null)
    },
  })

  // Derived stats
  const pending    = batches.filter((b) => b.status === 'pending')
  const processing = batches.filter((b) => b.status === 'processing')
  const completed  = batches.filter((b) => b.status === 'completed')
  const failed     = batches.filter((b) => b.status === 'failed' || b.status === 'rejected')

  const grossTotal   = batches.reduce((s, b) => s + b.grossAmount,  0)
  const netTotal     = batches.reduce((s, b) => s + b.netAmount,    0)
  const pendingValue = pending.reduce((s, b) => s + b.netAmount,   0)

  // Tab filter
  const tabData: Record<string, SettlementBatch[]> = {
    all:        batches,
    pending:    pending,
    processing: processing,
    completed:  completed,
    failed:     failed,
  }
  const filtered = tabData[activeTab] ?? batches

  // Account groups
  const treasuryAccounts = accounts.filter((a) => a.type === 'Treasury')
  const agencyAccounts   = accounts.filter((a) => a.type === 'Agency')
  const bankAccounts     = accounts.filter((a) => a.type === 'Bank')

  // Timeline items from completed batches
  const timelineItems = completed
    .filter((b) => b.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .map((b) => ({
      label: `${b.participant} — ${formatUGX(b.netAmount)}`,
      timestamp: formatDateTime(b.completedAt!),
      description: `${b.transactionCount.toLocaleString()} txns · Approved by ${b.approvedBy}`,
      actor: b.id,
      status: 'done' as const,
    }))

  const hasProcessing = processing.length > 0

  return (
    <div>
      <PageHeader
        title="Settlement"
        subtitle="Batch settlement management, treasury positions, and end-of-day net settlement"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => downloadCSV(batches)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-slate-700 hover:bg-surface transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />

      {/* ── KPI cards ────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-5 gap-3 mb-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <KPICard title="Gross Settlement" value={formatUGX(grossTotal)} accent="primary" animate={false}
            icon={<TrendingUp size={15} />} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Net Position" value={formatUGX(netTotal)} accent="success" animate={false}
            icon={<Banknote size={15} />} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Pending Value" value={formatUGX(pendingValue)} accent="warning" animate={false}
            icon={<Clock size={15} />} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Completed" value={completed.length} accent="success" />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Failed / Rejected" value={failed.length} accent="danger"
            icon={failed.length > 0 ? <AlertTriangle size={15} /> : undefined} />
        </motion.div>
      </motion.div>

      {/* ── Processing banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {hasProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3"
          >
            <RefreshCw size={15} className="text-warning animate-spin flex-shrink-0" />
            <span className="text-sm font-medium text-yellow-800">
              {processing.length} batch{processing.length > 1 ? 'es' : ''} currently processing —
              live progress shown in the Settlement Pipeline panel
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-4">
        {/* ── Left: batch table with tabs ──────────────────────── */}
        <div className="col-span-2">
          <div className="bg-card rounded-card shadow-card overflow-hidden">
            {/* Tab bar */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex border-b border-border bg-surface px-3 pt-3 gap-1">
                {[
                  { val: 'all',        label: 'All',        count: batches.length },
                  { val: 'pending',    label: 'Pending',    count: pending.length },
                  { val: 'processing', label: 'Processing', count: processing.length },
                  { val: 'completed',  label: 'Completed',  count: completed.length },
                  { val: 'failed',     label: 'Failed',     count: failed.length },
                ].map(({ val, label, count }) => (
                  <Tabs.Trigger
                    key={val}
                    value={val}
                    className="relative px-3 py-2 text-xs font-medium text-muted rounded-t-lg transition-colors
                      data-[state=active]:text-slate-800 data-[state=active]:bg-card
                      data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border
                      hover:text-slate-800"
                  >
                    {label}
                    {count > 0 && (
                      <span className={clsx(
                        'ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                        val === 'pending'    && 'bg-yellow-100 text-yellow-700',
                        val === 'processing' && 'bg-blue-100 text-blue-700',
                        val === 'completed'  && 'bg-green-100 text-green-700',
                        val === 'failed'     && 'bg-red-100 text-red-700',
                        val === 'all'        && 'bg-slate-100 text-slate-600',
                      )}>
                        {count}
                      </span>
                    )}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {/* Table */}
              <Tabs.Content value={activeTab} className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-muted text-sm">Loading batches…</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-muted text-sm">No {activeTab} batches</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        {['Batch ID', 'Participant', 'Gross', 'Net', 'Txns', 'Status', 'Date', ''].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <motion.tbody layout>
                      {filtered.map((batch) => (
                        <BatchRow
                          key={batch.id}
                          batch={batch}
                          onClick={() => setSelectedBatch(batch)}
                        />
                      ))}
                    </motion.tbody>
                  </table>
                )}
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>

        {/* ── Right panel: Pipeline / Accounts / Timeline ──────── */}
        <div className="space-y-3">
          {/* Panel switcher */}
          <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border">
            {[
              { val: 'pipeline' as const, label: 'Pipeline' },
              { val: 'accounts' as const, label: 'Accounts' },
              { val: 'timeline' as const, label: 'Timeline' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setRightPanel(val)}
                className={clsx(
                  'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                  rightPanel === val
                    ? 'bg-card text-slate-800 shadow-sm'
                    : 'text-muted hover:text-slate-800',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Settlement Pipeline */}
            {rightPanel === 'pipeline' && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-card rounded-card shadow-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Settlement Pipeline</h3>
                  {hasProcessing && (
                    <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 font-medium">
                      LIVE
                    </span>
                  )}
                </div>
                <AnimatedPipeline active={hasProcessing} />
                {!hasProcessing && (
                  <p className="text-[11px] text-muted mt-3 text-center">
                    No batches currently processing. Pipeline will animate when a batch enters processing state.
                  </p>
                )}
              </motion.div>
            )}

            {/* Account Positions */}
            {rightPanel === 'accounts' && (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-card rounded-card shadow-card p-4 max-h-[600px] overflow-y-auto"
              >
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Settlement Accounts at BOU</h3>

                <AccountGroup
                  title="Treasury"
                  icon={Landmark}
                  accounts={treasuryAccounts}
                  iconColor="text-primary"
                />
                <AccountGroup
                  title="Government Agencies"
                  icon={Building2}
                  accounts={agencyAccounts}
                  iconColor="text-purple-600"
                />
                <AccountGroup
                  title="Banks & Mobile Money"
                  icon={CreditCard}
                  accounts={bankAccounts}
                  iconColor="text-green-600"
                />

                {/* Net totals */}
                <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Total Treasury Balance</span>
                    <span className="font-bold text-primary">{formatUGX(treasuryAccounts.reduce((s, a) => s + a.balance, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Total Agency Balance</span>
                    <span className="font-semibold text-slate-700">{formatUGX(agencyAccounts.reduce((s, a) => s + a.balance, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Total Bank Balance</span>
                    <span className="font-semibold text-slate-700">{formatUGX(bankAccounts.reduce((s, a) => s + a.balance, 0))}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settlement Timeline */}
            {rightPanel === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-card rounded-card shadow-card p-4 max-h-[600px] overflow-y-auto"
              >
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Settlement Timeline</h3>
                {timelineItems.length > 0 ? (
                  <Timeline items={timelineItems} />
                ) : (
                  <p className="text-sm text-muted text-center py-6">
                    No completed settlements yet today.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Batch detail modal ────────────────────────────────────── */}
      <Modal
        open={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        title={selectedBatch?.id ?? ''}
        footer={
          selectedBatch ? (
            <div className="flex gap-2 w-full">
              {(selectedBatch.status === 'pending' || selectedBatch.status === 'approved') && (
                <>
                  <button
                    onClick={() => setConfirmAction('reject')}
                    className="flex items-center gap-1.5 px-3 py-2 border border-danger text-danger rounded-lg text-sm hover:bg-danger-light transition-colors"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => setConfirmAction('approve')}
                    disabled={approving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors ml-auto disabled:opacity-60"
                  >
                    <CheckCircle size={14} /> Approve Settlement
                  </button>
                </>
              )}
              {(selectedBatch.status === 'failed' || selectedBatch.status === 'rejected') && (
                <button
                  onClick={() => rerun(selectedBatch.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors ml-auto"
                >
                  <RotateCcw size={14} /> Re-run Settlement
                </button>
              )}
              {selectedBatch.status === 'completed' && (
                <button
                  onClick={() => { downloadCSV([selectedBatch]); addToast('Settlement file downloaded', 'success') }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm hover:bg-surface transition-colors ml-auto"
                >
                  <Download size={14} /> Download Settlement File
                </button>
              )}
              {selectedBatch.status === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-muted ml-auto">
                  <RefreshCw size={13} className="animate-spin text-primary" />
                  Processing — no actions available
                </div>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedBatch && (
          <div className="space-y-4 text-sm">
            {/* Status + participant */}
            <div className="flex items-center gap-3">
              <Badge variant={statusVariant(selectedBatch.status)} className="text-xs">
                {selectedBatch.status.toUpperCase()}
              </Badge>
              <span className="font-semibold text-slate-800">{selectedBatch.participant}</span>
            </div>

            {/* Amounts grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-xl p-3 border border-border">
                <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Gross Settlement</div>
                <div className="text-base font-bold text-slate-800">{formatUGX(selectedBatch.grossAmount)}</div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Net Settlement</div>
                <div className="text-base font-bold text-primary">{formatUGX(selectedBatch.netAmount)}</div>
              </div>
            </div>

            {/* Fee row */}
            <div className="flex justify-between text-xs border-b border-border pb-3">
              <span className="text-muted">Settlement Fees</span>
              <span className="font-medium text-danger">−{formatUGX(selectedBatch.grossAmount - selectedBatch.netAmount)}</span>
            </div>

            {/* Details */}
            <div className="space-y-2">
              {[
                { label: 'Batch Date',    value: formatDate(selectedBatch.batchDate) },
                { label: 'Transactions', value: selectedBatch.transactionCount.toLocaleString() },
                { label: 'Fee Rate',     value: `${((1 - selectedBatch.netAmount / selectedBatch.grossAmount) * 100).toFixed(3)}%` },
                ...(selectedBatch.approvedBy ? [{ label: 'Approved By', value: selectedBatch.approvedBy }] : []),
                ...(selectedBatch.completedAt ? [{ label: 'Completed At', value: formatDateTime(selectedBatch.completedAt) }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Failure / rejection reason */}
            {selectedBatch.failureReason && (
              <div className="bg-danger-light border border-danger/20 rounded-lg p-3 text-danger text-xs flex gap-2">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                {selectedBatch.failureReason}
              </div>
            )}

            {/* Inline processing pipeline for this batch */}
            {selectedBatch.status === 'processing' && (
              <div>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">Live Processing</p>
                <AnimatedPipeline active={true} />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve confirmation */}
      <ConfirmDialog
        open={confirmAction === 'approve'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => { if (selectedBatch) approve(selectedBatch.id); setConfirmAction(null) }}
        title="Approve Settlement Batch"
        message={`Approve ${selectedBatch?.id} (${selectedBatch ? formatUGX(selectedBatch.netAmount) : ''} net) for ${selectedBatch?.participant}? This will queue the batch for Bank of Uganda processing and cannot be undone.`}
        confirmLabel="Approve Settlement"
        intent="info"
        loading={approving}
      />

      {/* Reject confirmation */}
      <ConfirmDialog
        open={confirmAction === 'reject'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => { if (selectedBatch) reject(selectedBatch.id); setConfirmAction(null) }}
        title="Reject Settlement Batch"
        message={`Reject ${selectedBatch?.id} for ${selectedBatch?.participant}? The batch will be returned to the queue for investigation.`}
        confirmLabel="Reject Batch"
        intent="danger"
      />

      {/* Error state — displayed above table when query fails */}
      {isError && (
        <ErrorState kind="server" message="Failed to load settlement batches. The settlement service may be temporarily unavailable." compact className="mb-4" />
      )}
    </div>
  )
}
