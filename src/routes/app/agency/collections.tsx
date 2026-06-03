// src/routes/app/agency/collections.tsx
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { AgencyTransaction } from '../../../types'

const STATUS_CLS: Record<AgencyTransaction['status'], string> = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  failed:    'bg-red-100 text-red-700 border-red-200',
  reversed:  'bg-slate-100 text-slate-600 border-slate-200',
}

type StatusFilter = 'all' | AgencyTransaction['status']

export default function AgencyCollectionsPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { data: txns = [], isLoading } = useQuery({
    queryKey: ['agency-txns', tenantId],
    queryFn: () => tenantService.getAgencyTransactions(tenantId),
  })

  const filtered = statusFilter === 'all' ? txns : txns.filter((t) => t.status === statusFilter)
  const totalValue = filtered.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const statuses: StatusFilter[] = ['all', 'completed', 'pending', 'failed', 'reversed']

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Collections"
          subtitle="All payment transactions received through GovPay"
          actions={
            <div className="text-xs text-muted">
              Total Collected: <span className="font-semibold text-slate-700">{formatUGX(totalValue)}</span>
            </div>
          }
        />
      </motion.div>

      {/* Filter chips */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        {statuses.map((s) => {
          const count = s === 'all' ? txns.length : txns.filter((t) => t.status === s).length
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors capitalize',
                statusFilter === s ? 'text-white border-transparent' : 'bg-surface border-border text-muted hover:bg-slate-100',
              )}
              style={statusFilter === s ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
            >
              {s === 'all' ? 'All' : s} ({count})
            </button>
          )
        })}
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['PRN', 'Payer', 'Service', 'Channel', 'Amount', 'Status', 'Timestamp'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.prn}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.payer}</td>
                  <td className="px-4 py-3 text-slate-600">{t.serviceName}</td>
                  <td className="px-4 py-3 text-slate-600">{t.channel}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize', STATUS_CLS[t.status])}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{t.timestamp.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted text-sm">No transactions match this filter.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
