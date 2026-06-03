// src/routes/app/aggregator/disputes.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { tenantService } from '../../../services/tenantService'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AggregatorDisputesPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  const { data: txns = [], isLoading } = useQuery({
    queryKey: ['agg-txns', tenantId],
    queryFn: () => tenantService.getAggregatorTransactions(tenantId),
  })

  const disputed      = txns.filter((t) => t.status === 'failed' || t.status === 'reversed')
  const failedCount   = disputed.filter((t) => t.status === 'failed').length
  const reversedCount = disputed.filter((t) => t.status === 'reversed').length
  const disputedValue = disputed.reduce((s, t) => s + t.amount, 0)

  const summaryCards = [
    { label: 'Failed Transactions', value: failedCount,             color: '#ef4444' },
    { label: 'Reversals',           value: reversedCount,           color: '#f59e0b' },
    { label: 'Total at Risk',       value: formatUGX(disputedValue), color: '#6366f1' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Disputes"
          subtitle="Failed and reversed transactions requiring action"
          actions={
            disputed.length > 0 ? (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: accentColor }}>
                <AlertTriangle size={13} />
                {disputed.length} items need attention
              </div>
            ) : undefined
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-card shadow-card p-4 border-l-4" style={{ borderColor: color }}>
            <div className="text-[10px] font-medium text-muted uppercase tracking-wide mb-1">{label}</div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Reference', 'Merchant', 'Type', 'Amount', 'Status', 'Failure Reason', 'Timestamp', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                : disputed.length === 0
                  ? <tr><td colSpan={8} className="py-12 text-center text-muted text-sm">No disputes.</td></tr>
                  : disputed.map((t) => (
                      <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.reference}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{t.merchantName}</td>
                        <td className="px-4 py-3 capitalize text-slate-600">{t.type.replace('_', ' ')}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted max-w-[140px] truncate">{t.failureReason ?? '—'}</td>
                        <td className="px-4 py-3 text-muted whitespace-nowrap">{t.timestamp.slice(0, 16)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {t.status === 'failed' && (
                              <button
                                onClick={() => addToast(`Retry queued for ${t.reference}`, 'success')}
                                className="text-[10px] font-medium px-2 py-1 rounded border transition-colors"
                                style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}08` }}
                              >
                                Retry
                              </button>
                            )}
                            <button
                              onClick={() => addToast(`${t.reference} escalated to GovPay`, 'warning')}
                              className="text-[10px] font-medium px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Escalate
                            </button>
                          </div>
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
