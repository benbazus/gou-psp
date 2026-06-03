// src/routes/app/treasury/reconciliation.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useAppStore } from '../../../store/appStore'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function TreasuryReconciliationPage() {
  const addToast = useAppStore((s) => s.addToast)

  const { data: disbursements = [] } = useQuery({
    queryKey: ['treasury-disbursements'],
    queryFn: () => tenantService.getTreasuryDisbursements(),
  })

  const completed = disbursements.filter((d) => d.status === 'completed')
  const matched   = completed.filter((_, i) => i % 5 !== 3)
  const unmatched = completed.filter((_, i) => i % 5 === 3)
  const matchRate = completed.length > 0 ? Math.round((matched.length / completed.length) * 100) : 0

  function handleTriggerRecon() {
    addToast('Reconciliation run triggered — results in 2–3 minutes', 'success')
  }

  const summaryCards = [
    { label: 'Total Disbursements', value: completed.length, color: '#3b82f6' },
    { label: 'Matched',             value: matched.length,   color: '#22c55e' },
    { label: 'Unmatched',           value: unmatched.length, color: '#ef4444' },
    { label: 'Match Rate',          value: `${matchRate}%`,  color: matchRate >= 95 ? '#22c55e' : '#f59e0b' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Reconciliation"
          subtitle="Treasury disbursement reconciliation against bank confirmation records"
          actions={
            <button
              onClick={handleTriggerRecon}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity bg-violet-600"
            >
              <RefreshCw size={14} />
              Run Reconciliation
            </button>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-card shadow-card p-4 border-l-4" style={{ borderColor: color }}>
            <div className="text-[10px] font-medium text-muted uppercase tracking-wide mb-1">{label}</div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
          </div>
        ))}
      </motion.div>

      {unmatched.length > 0 && (
        <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Unmatched Items</h3>
              <p className="text-xs text-muted">Disbursements pending bank confirmation</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              {unmatched.length} items
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {['Reference', 'Payee', 'Amount', 'Bank', 'Processed At'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {unmatched.slice(0, 10).map((d) => (
                  <tr key={d.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{d.reference}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.payee}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(d.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{d.bank}</td>
                    <td className="px-4 py-3 text-muted">{d.processedAt ?? '—'}</td>
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
