// src/routes/app/agency/settlement.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { AgencySettlement } from '../../../types'

const STATUS_CLS: Record<AgencySettlement['status'], string> = {
  completed:  'bg-green-100 text-green-700 border-green-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  failed:     'bg-red-100 text-red-700 border-red-200',
}

const SLA_CLS: Record<AgencySettlement['slaStatus'], string> = {
  compliant: 'text-green-600',
  warning:   'text-amber-600',
  breach:    'text-red-600',
}

export default function AgencySettlementPage() {
  const { tenantId, accentColor } = usePortalConfig()

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ['agency-set', tenantId],
    queryFn: () => tenantService.getAgencySettlements(tenantId),
  })

  const totalSettled = settlements.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.netAmount, 0)
  const compliantPct = settlements.length > 0
    ? Math.round((settlements.filter((s) => s.slaStatus === 'compliant').length / settlements.length) * 100)
    : 0

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Settlement"
          subtitle="Daily settlement batches for this agency"
          actions={
            <div className="flex gap-3 text-xs text-muted">
              <span>Settled: <strong className="text-slate-700">{formatUGX(totalSettled)}</strong></span>
              <span style={{ color: accentColor }}>SLA: <strong>{compliantPct}%</strong></span>
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Batch Ref', 'Date', 'Gross Amount', 'Fee', 'Net Amount', 'Transactions', 'Status', 'SLA', 'Settled At'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : settlements.map((s) => (
                <tr key={s.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{s.batchRef}</td>
                  <td className="px-4 py-3 text-slate-700">{s.batchDate}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatUGX(s.grossAmount)}</td>
                  <td className="px-4 py-3 text-red-600 whitespace-nowrap">-{formatUGX(s.fee)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(s.netAmount)}</td>
                  <td className="px-4 py-3 text-slate-700">{s.transactionCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize', STATUS_CLS[s.status])}>
                      {s.status}
                    </span>
                  </td>
                  <td className={clsx('px-4 py-3 text-[11px] font-semibold capitalize', SLA_CLS[s.slaStatus])}>
                    {s.slaStatus}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{s.settledAt ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
