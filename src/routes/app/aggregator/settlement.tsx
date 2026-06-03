// src/routes/app/aggregator/settlement.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { AggregatorSettlement } from '../../../types'

const STATUS_CLS: Record<AggregatorSettlement['status'], string> = {
  completed:  'bg-green-100 text-green-700 border-green-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
  failed:     'bg-red-100 text-red-700 border-red-200',
}

const SLA_CLS: Record<AggregatorSettlement['slaStatus'], string> = {
  compliant: 'bg-green-100 text-green-700',
  warning:   'bg-amber-100 text-amber-700',
  breach:    'bg-red-100 text-red-700',
}

export default function AggregatorSettlementPage() {
  const { tenantId } = usePortalConfig()

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ['agg-settlements', tenantId],
    queryFn: () => tenantService.getAggregatorSettlements(tenantId),
  })

  const completed = settlements.filter((s) => s.status === 'completed')
  const totalGross = completed.reduce((sum, s) => sum + s.grossAmount, 0)
  const totalNet   = completed.reduce((sum, s) => sum + s.netAmount, 0)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Settlement"
          subtitle="Merchant settlement batches"
          actions={
            <div className="text-xs text-muted">
              Total settled: <span className="font-semibold text-slate-800">{formatUGX(totalGross)}</span>
              {' · '}Net: <span className="font-semibold text-slate-800">{formatUGX(totalNet)}</span>
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Batch Ref', 'Merchant', 'Date', 'Gross', 'Net', 'Fee', 'Count', 'Status', 'SLA', 'Settled At'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 10 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{s.batchRef}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{s.merchantName}</td>
                      <td className="px-4 py-3 text-muted">{s.batchDate}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(s.grossAmount)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(s.netAmount)}</td>
                      <td className="px-4 py-3 text-muted">{formatUGX(s.fee)}</td>
                      <td className="px-4 py-3 text-slate-700">{s.transactionCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_CLS[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${SLA_CLS[s.slaStatus]}`}>{s.slaStatus}</span>
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{s.settledAt?.slice(0, 16) ?? '—'}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
