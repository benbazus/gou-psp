import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Download, RotateCcw } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import { useAppStore } from '../../../store/appStore'

const STATUS_STYLE: Record<string, string> = {
  completed:  'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  failed:     'bg-red-100 text-red-700',
  processing: 'bg-blue-100 text-blue-700',
}

const SLA_STYLE: Record<string, string> = {
  compliant: 'bg-green-100 text-green-700',
  warning:   'bg-yellow-100 text-yellow-700',
  breach:    'bg-red-100 text-red-700',
}

export default function BankSettlementPage() {
  const { tenantId, tenantName } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data = [], isLoading } = useQuery({
    queryKey: ['bank-settlements', tenantId],
    queryFn: () => tenantService.getBankSettlements(tenantId),
  })

  const filtered = useMemo(() => {
    return data.filter((s) => {
      const matchSearch =
        !search ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.counterparty.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [data, search, statusFilter])

  // KPI derivations
  const totalNetSettled   = data.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.netAmount, 0)
  const pendingCount      = data.filter((s) => s.status === 'pending' || s.status === 'processing').length
  const failedCount       = data.filter((s) => s.status === 'failed').length
  const totalBatches      = data.length

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Settlement Status"
          subtitle={`${tenantName} — Batch settlement records`}
          actions={
            <button
              onClick={() => addToast('Settlement report exported', 'success')}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download size={14} />
              Export
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
              title="Total Net Settled"
              value={formatUGX(totalNetSettled)}
              subtitle="Completed batches"
              accent="success"
              animate={false}
            />
            <KPICard
              title="Pending / Processing"
              value={pendingCount}
              subtitle="Awaiting completion"
              accent="warning"
            />
            <KPICard
              title="Failed"
              value={failedCount}
              subtitle="Require investigation"
              accent="danger"
            />
            <KPICard
              title="Total Batches"
              value={totalBatches}
              subtitle="All settlement batches"
              accent="primary"
            />
          </>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search batch ID or counterparty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>

        <span className="text-sm text-muted ml-auto">
          {isLoading ? '…' : `${filtered.length} batch${filtered.length !== 1 ? 'es' : ''}`}
        </span>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
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
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Txn Count</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">SLA</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted uppercase tracking-wider">Actions</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted">
                    No settlement batches found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{s.id}</td>
                    <td className="px-4 py-3 text-slate-600">{s.batchDate}</td>
                    <td className="px-4 py-3 text-slate-700">{s.counterparty}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[10px] font-semibold',
                        s.type === 'inbound' ? 'text-green-600' : 'text-orange-500',
                      )}>
                        {s.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(s.grossAmount)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(s.netAmount)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{s.transactionCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        STATUS_STYLE[s.status] ?? 'bg-slate-100 text-slate-600',
                      )}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        SLA_STYLE[s.slaStatus] ?? 'bg-slate-100 text-slate-600',
                      )}>
                        {s.slaStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.status === 'failed' ? (
                        <button
                          onClick={() => addToast(`Retry initiated for batch ${s.id}`, 'success')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        >
                          <RotateCcw size={10} />
                          Retry
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted">—</span>
                      )}
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
