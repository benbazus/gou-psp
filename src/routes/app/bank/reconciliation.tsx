import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import { useAppStore } from '../../../store/appStore'

type ReconStatus = 'matched' | 'exception' | 'pending'

const RECON_STYLE: Record<ReconStatus, string> = {
  matched:   'bg-green-100 text-green-700',
  exception: 'bg-red-100 text-red-700',
  pending:   'bg-yellow-100 text-yellow-700',
}

// Deterministic small variance per batch id (zero or small UGX amount)
function getVariance(batchId: string, status: string): number {
  if (status === 'failed') return 0
  if (status !== 'completed') return 0
  // Use hash of id to decide: ~80% are zero variance, ~20% have a small discrepancy
  const hash = batchId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  if (hash % 5 !== 0) return 0
  return (hash % 9 + 1) * 1_000 // 1k–9k UGX variance
}

const LAST_RUN = '2026-06-02 07:45'

export default function BankReconciliationPage() {
  const { tenantId, tenantName } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [isRunning, setIsRunning] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: ['bank-settlements', tenantId],
    queryFn: () => tenantService.getBankSettlements(tenantId),
  })

  const records = useMemo(() => {
    return data.map((s) => {
      const variance = getVariance(s.id, s.status)
      const bankRecord = s.netAmount + variance
      const reconStatus: ReconStatus =
        s.status === 'failed'
          ? 'exception'
          : s.status === 'completed' && variance === 0
          ? 'matched'
          : s.status === 'completed' && variance > 0
          ? 'exception'
          : 'pending'
      return { ...s, variance, bankRecord, reconStatus }
    })
  }, [data])

  const matchedCount   = records.filter((r) => r.reconStatus === 'matched').length
  const unmatchedCount = records.filter((r) => r.reconStatus === 'exception').length
  const pendingCount   = records.filter((r) => r.reconStatus === 'pending').length
  const matchRate      = records.length > 0
    ? ((matchedCount / records.length) * 100).toFixed(1)
    : '0.0'

  function handleRunRecon() {
    setIsRunning(true)
    addToast('Reconciliation run started…', 'info')
    setTimeout(() => {
      setIsRunning(false)
      addToast('Reconciliation completed successfully', 'success')
    }, 1500)
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Reconciliation"
          subtitle={`${tenantName} — Settlement batch reconciliation`}
          actions={
            <button
              onClick={handleRunRecon}
              disabled={isRunning}
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors',
                isRunning
                  ? 'bg-primary/60 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90',
              )}
            >
              <RefreshCw size={14} className={clsx(isRunning && 'animate-spin')} />
              {isRunning ? 'Running…' : 'Run Reconciliation'}
            </button>
          }
        />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Match Rate"
              value={`${matchRate}%`}
              subtitle="Batches fully reconciled"
              accent={parseFloat(matchRate) >= 90 ? 'success' : 'warning'}
              animate={false}
              icon={<CheckCircle size={16} />}
            />
            <KPICard
              title="Matched"
              value={matchedCount}
              subtitle="Zero variance, completed"
              accent="success"
              icon={<CheckCircle size={16} />}
            />
            <KPICard
              title="Unmatched"
              value={unmatchedCount}
              subtitle="Exceptions / failures"
              accent="danger"
              icon={<AlertCircle size={16} />}
            />
            <KPICard
              title="Pending"
              value={pendingCount}
              subtitle="Processing or awaiting"
              accent="warning"
              icon={<AlertCircle size={16} />}
            />
          </>
        )}
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Reconciliation Records</span>
          <span className="text-xs text-muted">Last run: <span className="font-mono">{LAST_RUN}</span></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Batch ID</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Date</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Counterparty</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Gross</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Net</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">GovPay Record</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Bank Record</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Variance</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Recon Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted">
                    No reconciliation records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className={clsx(
                      'hover:bg-surface/60 transition-colors',
                      r.reconStatus === 'exception' && 'bg-red-50/40',
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{r.id}</td>
                    <td className="px-4 py-3 text-slate-600">{r.batchDate}</td>
                    <td className="px-4 py-3 text-slate-700">{r.counterparty}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[10px] font-semibold',
                        r.type === 'inbound' ? 'text-green-600' : 'text-orange-500',
                      )}>
                        {r.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(r.grossAmount)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(r.netAmount)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatUGX(r.netAmount)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatUGX(r.bankRecord)}</td>
                    <td className="px-4 py-3 text-right">
                      {r.variance === 0 ? (
                        <span className="text-green-600 font-semibold">—</span>
                      ) : (
                        <span className="text-red-600 font-semibold">{formatUGX(r.variance)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        RECON_STYLE[r.reconStatus],
                      )}>
                        {r.reconStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
