import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICardSkeleton } from '../../../components/ui/KPICard'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

const STATUS_STYLE: Record<string, string> = {
  completed:  'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  failed:     'bg-red-100 text-red-700',
  processing: 'bg-blue-100 text-blue-700',
}

export default function BankIncomingPage() {
  const { tenantId, tenantName } = usePortalConfig()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data = [], isLoading } = useQuery({
    queryKey: ['bank-txns-incoming', tenantId],
    queryFn: () => tenantService.getBankTransactions(tenantId, 'incoming'),
  })

  const filtered = useMemo(() => {
    return data.filter((t) => {
      const matchSearch =
        !search ||
        t.payer.toLowerCase().includes(search.toLowerCase()) ||
        t.reference.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [data, search, statusFilter])

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Incoming Transactions"
          subtitle={`${tenantName} — Inbound transaction records`}
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search payer or reference…"
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
          {isLoading ? '…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Reference</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Payer</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Channel</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Region</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Time</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Processing (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{t.reference}</td>
                    <td className="px-4 py-3 text-slate-700">{t.payer}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{t.channel}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        STATUS_STYLE[t.status] ?? 'bg-slate-100 text-slate-600',
                      )}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.region}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.timestamp}</td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-600">{t.processingTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Skeleton for KPI area when loading */}
      {isLoading && (
        <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </motion.div>
      )}
    </motion.div>
  )
}
