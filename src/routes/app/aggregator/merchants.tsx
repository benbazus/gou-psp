// src/routes/app/aggregator/merchants.tsx
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { AggregatorMerchant } from '../../../types'

const STATUS_CLS: Record<AggregatorMerchant['status'], string> = {
  active:     'bg-green-100 text-green-700 border-green-200',
  suspended:  'bg-red-100 text-red-700 border-red-200',
  onboarding: 'bg-amber-100 text-amber-700 border-amber-200',
}

const HEALTH_CLS: Record<AggregatorMerchant['apiHealth'], string> = {
  healthy:  'bg-green-100 text-green-700',
  degraded: 'bg-amber-100 text-amber-700',
  down:     'bg-red-100 text-red-700',
}

type StatusFilter = 'all' | AggregatorMerchant['status']

export default function AggregatorMerchantsPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ['agg-merchants', tenantId],
    queryFn: () => tenantService.getAggregatorMerchants(tenantId),
  })

  const filtered = statusFilter === 'all' ? merchants : merchants.filter((m) => m.status === statusFilter)
  const statuses: StatusFilter[] = ['all', 'active', 'onboarding', 'suspended']

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Merchants"
          subtitle="All merchants integrated through this aggregator"
          actions={
            <div className="text-xs text-muted">
              Active Merchants: <span className="font-semibold text-slate-700">{merchants.filter((m) => m.status === 'active').length}</span>
            </div>
          }
        />
      </motion.div>

      {/* Filter chips */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        {statuses.map((s) => {
          const count = s === 'all' ? merchants.length : merchants.filter((m) => m.status === s).length
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
                {['Merchant', 'Category', 'Status', 'Daily Volume', 'Txn Count', 'Settlement Account', 'Joined', 'API'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{m.name}</td>
                      <td className="px-4 py-3 text-slate-600">{m.category}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize', STATUS_CLS[m.status])}>{m.status}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(m.dailyVolume)}</td>
                      <td className="px-4 py-3 text-slate-700">{m.transactionCount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{m.settlementAccount}</td>
                      <td className="px-4 py-3 text-muted">{m.joinedDate}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold capitalize', HEALTH_CLS[m.apiHealth])}>{m.apiHealth}</span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted text-sm">No merchants match this filter.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
