// src/routes/app/aggregator/transactions.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { AggregatorTransaction } from '../../../types'

const STATUS_CLS: Record<AggregatorTransaction['status'], string> = {
  completed: 'text-green-700 bg-green-100',
  pending:   'text-amber-700 bg-amber-100',
  failed:    'text-red-700 bg-red-100',
  reversed:  'text-slate-600 bg-slate-100',
}

export default function AggregatorTransactionsPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const [typeFilter, setTypeFilter] = useState<AggregatorTransaction['type'] | 'all'>('all')

  const { data: txns = [], isLoading } = useQuery({
    queryKey: ['agg-txns', tenantId],
    queryFn: () => tenantService.getAggregatorTransactions(tenantId),
  })

  const filtered = typeFilter === 'all' ? txns : txns.filter((t) => t.type === typeFilter)
  const types: Array<AggregatorTransaction['type'] | 'all'> = ['all', 'card', 'mobile_money', 'bank_transfer', 'ussd']

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Transactions" subtitle="All transactions routed through this aggregator" />
      </motion.div>

      <motion.div variants={fadeInUp} className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize"
            style={typeFilter === t ? { backgroundColor: accentColor, color: '#fff', borderColor: accentColor } : { borderColor: '#e2e8f0', color: '#64748b' }}
          >
            {t === 'all' ? `All (${txns.length})` : t.replace('_', ' ')}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Reference', 'Merchant', 'Type', 'Channel', 'Amount', 'Fee', 'Status', 'Timestamp'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.reference}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{t.merchantName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize" style={{ background: `${accentColor}15`, color: accentColor }}>
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{t.channel}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                      <td className="px-4 py-3 text-muted">{formatUGX(t.fee)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_CLS[t.status]}`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{t.timestamp.slice(0, 16)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
