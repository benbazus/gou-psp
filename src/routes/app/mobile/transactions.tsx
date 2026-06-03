// src/routes/app/mobile/transactions.tsx
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { MobileTransaction } from '../../../types'

const STATUS_CLS: Record<MobileTransaction['status'], string> = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  failed:    'bg-red-100 text-red-700 border-red-200',
  reversed:  'bg-slate-100 text-slate-600 border-slate-200',
}

const TYPE_LABELS: Record<MobileTransaction['type'], string> = {
  b2c:          'B2C',
  c2b:          'C2B',
  p2p:          'P2P',
  airtime:      'Airtime',
  bill_payment: 'Bill Pay',
}

type TypeFilter = 'all' | MobileTransaction['type']

export default function MobileTransactionsPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const { data: txns = [], isLoading } = useQuery({
    queryKey: ['mob-txns', tenantId],
    queryFn: () => tenantService.getMobileTransactions(tenantId),
  })

  const filtered = typeFilter === 'all' ? txns : txns.filter((t) => t.type === typeFilter)
  const totalValue = filtered.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const types: TypeFilter[] = ['all', 'b2c', 'c2b', 'p2p', 'airtime', 'bill_payment']

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Transactions"
          subtitle="All mobile money transactions — filter by type"
          actions={<div className="text-xs text-muted">Value: <strong className="text-slate-700">{formatUGX(totalValue)}</strong></div>}
        />
      </motion.div>

      {/* Filter chips */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        {types.map((type) => {
          const count = type === 'all' ? txns.length : txns.filter((t) => t.type === type).length
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                typeFilter === type ? 'text-white border-transparent' : 'bg-surface border-border text-muted hover:bg-slate-100',
              )}
              style={typeFilter === type ? { backgroundColor: accentColor } : {}}
            >
              {type === 'all' ? 'All' : TYPE_LABELS[type as MobileTransaction['type']]} ({count})
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
                {['Reference', 'Sender', 'Receiver', 'Type', 'Channel', 'Amount', 'Fee', 'Status', 'Timestamp'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.reference}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.sender}</td>
                  <td className="px-4 py-3 text-slate-700">{t.receiver}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: `${accentColor}15`, color: accentColor }}
                    >
                      {TYPE_LABELS[t.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.channel}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{t.fee > 0 ? formatUGX(t.fee) : '—'}</td>
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
