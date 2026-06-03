// src/routes/app/agency/reversals.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { RotateCcw } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AgencyReversalsPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  const { data: txns = [], isLoading } = useQuery({
    queryKey: ['agency-txns', tenantId],
    queryFn: () => tenantService.getAgencyTransactions(tenantId),
  })

  const reversals = txns.filter((t) => t.status === 'reversed' || t.status === 'failed')
  const totalReversalValue = reversals.reduce((s, t) => s + t.amount, 0)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Reversals"
          subtitle="Failed and reversed payment transactions requiring action or follow-up"
          actions={
            <div className="flex items-center gap-2 text-xs" style={{ color: accentColor }}>
              <RotateCcw size={13} />
              {reversals.length} items — {formatUGX(totalReversalValue)}
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['PRN', 'Payer', 'Service', 'Channel', 'Amount', 'Reason', 'Status', 'Timestamp', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : reversals.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-muted text-sm">No reversals or failed payments.</td></tr>
              ) : reversals.map((t) => (
                <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.prn}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.payer}</td>
                  <td className="px-4 py-3 text-slate-600">{t.serviceName}</td>
                  <td className="px-4 py-3 text-slate-600">{t.channel}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                  <td className="px-4 py-3 text-muted max-w-[140px] truncate">{t.failureReason ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize',
                      t.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200',
                    )}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{t.timestamp.slice(0, 16)}</td>
                  <td className="px-4 py-3">
                    {t.status === 'failed' && (
                      <button
                        onClick={() => addToast(`Refund initiated for ${t.prn}`, 'success')}
                        className="text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:opacity-90"
                        style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}08` }}
                      >
                        Refund
                      </button>
                    )}
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
