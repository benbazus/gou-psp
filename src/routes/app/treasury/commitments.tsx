// src/routes/app/treasury/commitments.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PageHeader } from '../../../components/ui/PageHeader'
import { BarChart } from '../../../components/charts/BarChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

const STATUS_CLS = {
  on_track: 'bg-green-100 text-green-700 border-green-200',
  at_risk:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  overrun:  'bg-red-100 text-red-700 border-red-200',
}

export default function TreasuryCommitmentsPage() {
  const { accentColor } = usePortalConfig()

  const { data: commitments = [], isLoading } = useQuery({
    queryKey: ['treasury-commitments'],
    queryFn: () => tenantService.getTreasuryCommitments(),
  })

  const chartData = commitments.map((c) => ({
    ministry: c.ministryLine.replace('Ministry of ', '').slice(0, 14),
    budget: Math.round(c.budgetAllocation / 1_000_000_000),
    actual: Math.round(c.actual / 1_000_000_000),
  }))

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader title="Commitments" subtitle="FY 2025/26 budget commitments vs actuals by vote code" />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Budget vs Actual Spend</h3>
        <p className="text-xs text-muted mb-3">UGX billions — all vote codes</p>
        <BarChart
          data={chartData}
          xKey="ministry"
          bars={[
            { key: 'budget', color: '#94a3b8', name: 'Budget UGX B' },
            { key: 'actual', color: accentColor, name: 'Actual UGX B' },
          ]}
          height={220}
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-800">Vote Code Summary</h3>
          <p className="text-xs text-muted">Allocation, committed, actual, balance and utilisation</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Vote', 'Ministry Line', 'Allocation', 'Committed', 'Actual', 'Balance', 'Util %', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : commitments.map((c) => (
                <tr key={c.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-700">{c.voteCode}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-[160px] truncate">{c.ministryLine}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatUGX(c.budgetAllocation)}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatUGX(c.committed)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(c.actual)}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatUGX(c.balance)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(c.utilizationPct, 100)}%`,
                            background: c.status === 'overrun' ? '#ef4444' : c.status === 'at_risk' ? '#f59e0b' : '#22c55e',
                          }}
                        />
                      </div>
                      <span className="font-semibold">{c.utilizationPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize', STATUS_CLS[c.status])}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
