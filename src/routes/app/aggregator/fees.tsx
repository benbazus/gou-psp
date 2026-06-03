// src/routes/app/aggregator/fees.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { PageHeader } from '../../../components/ui/PageHeader'
import { BarChart } from '../../../components/charts/BarChart'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AggregatorFeesPage() {
  const { tenantId, accentColor } = usePortalConfig()

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ['agg-fees', tenantId],
    queryFn: () => tenantService.getAggregatorFees(tenantId),
  })
  const { data: txns = [] } = useQuery({
    queryKey: ['agg-txns', tenantId],
    queryFn: () => tenantService.getAggregatorTransactions(tenantId),
  })

  const revenueByType = txns
    .filter((t) => t.status === 'completed')
    .reduce<Record<string, number>>((acc, t) => {
      const key = t.type.replace('_', ' ')
      acc[key] = (acc[key] ?? 0) + t.fee
      return acc
    }, {})
  const revenueData = Object.entries(revenueByType).map(([name, revenue]) => ({ name, revenue: Math.round(revenue / 1000) }))

  const categories = [...new Set(fees.map((f) => f.merchantCategory))]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Fees & Revenue" subtitle="Fee schedules and earned revenue breakdown" />
      </motion.div>

      {revenueData.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Revenue by Transaction Type</h3>
          <p className="text-xs text-muted mb-3">Earned fee income — UGX thousands</p>
          <BarChart data={revenueData} xKey="name" bars={[{ key: 'revenue', color: accentColor, name: 'UGX K' }]} height={180} />
        </motion.div>
      )}

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-800">Fee Schedule</h3>
          <p className="text-xs text-muted">Applied fees by merchant category and transaction type</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Merchant Category', 'Transaction Type', 'Fee Type', 'Fee Value', 'Min Fee', 'Max Fee'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : categories.flatMap((cat) => {
                    const catFees = fees.filter((f) => f.merchantCategory === cat)
                    return catFees.map((f, i) => (
                      <tr key={f.id} className="hover:bg-surface/60 transition-colors">
                        {i === 0 && (
                          <td className="px-4 py-3 font-semibold text-slate-800 align-top" rowSpan={catFees.length}>
                            {cat}
                          </td>
                        )}
                        <td className="px-4 py-3 capitalize text-slate-700">{f.transactionType.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-muted capitalize">{f.feeType}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {f.feeType === 'percentage' ? `${f.feeValue}%` : formatUGX(f.feeValue)}
                        </td>
                        <td className="px-4 py-3 text-muted">{f.minFee != null ? formatUGX(f.minFee) : '—'}</td>
                        <td className="px-4 py-3 text-muted">{f.maxFee != null ? formatUGX(f.maxFee) : '—'}</td>
                      </tr>
                    ))
                  })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
