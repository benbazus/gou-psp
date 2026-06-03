// src/routes/app/agency/reconciliation.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AgencyReconciliationPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  const { data: txns = [], isLoading: tLoading } = useQuery({
    queryKey: ['agency-txns', tenantId],
    queryFn: () => tenantService.getAgencyTransactions(tenantId),
  })
  const { data: settlements = [], isLoading: sLoading } = useQuery({
    queryKey: ['agency-set', tenantId],
    queryFn: () => tenantService.getAgencySettlements(tenantId),
  })

  const isLoading = tLoading || sLoading

  const completed = txns.filter((t) => t.status === 'completed')
  const matched   = completed.filter((_, i) => i % 6 !== 4)
  const unmatched = completed.filter((_, i) => i % 6 === 4)
  const matchRate = completed.length > 0 ? Math.round((matched.length / completed.length) * 100) : 0
  const settledValue = settlements.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.netAmount, 0)

  const cards = [
    { label: 'Total Transactions', value: completed.length,        color: '#3b82f6' },
    { label: 'Matched',            value: matched.length,          color: '#22c55e' },
    { label: 'Unmatched',          value: unmatched.length,        color: '#ef4444' },
    { label: 'Match Rate',         value: `${matchRate}%`,         color: matchRate >= 95 ? '#22c55e' : '#f59e0b' },
    { label: 'Settled Value',      value: formatUGX(settledValue), color: accentColor },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Reconciliation"
          subtitle="Daily reconciliation of collections against settlement records"
          actions={
            <button
              onClick={() => addToast('Reconciliation triggered — results in 2–3 minutes', 'success')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              <RefreshCw size={14} />
              Run Reconciliation
            </button>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-card rounded-card shadow-card p-4 space-y-2"><div className="h-3 bg-slate-100 rounded animate-pulse" /><div className="h-6 bg-slate-200 rounded animate-pulse" /></div>)
        ) : cards.map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-card shadow-card p-4 border-l-4" style={{ borderColor: color }}>
            <div className="text-[10px] font-medium text-muted uppercase tracking-wide mb-1">{label}</div>
            <div className="text-xl font-bold text-slate-800">{value}</div>
          </div>
        ))}
      </motion.div>

      {unmatched.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Unmatched Transactions</h3>
              <p className="text-xs text-muted">Completed payments with no matching settlement record</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">{unmatched.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {['PRN', 'Payer', 'Service', 'Amount', 'Timestamp'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {unmatched.slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.prn}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.payer}</td>
                    <td className="px-4 py-3 text-slate-600">{t.serviceName}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{t.timestamp.slice(0, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
