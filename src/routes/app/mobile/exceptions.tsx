// src/routes/app/mobile/exceptions.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function MobileExceptionsPage() {
  const { tenantId, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  const { data: txns = [], isLoading } = useQuery({
    queryKey: ['mob-txns', tenantId],
    queryFn: () => tenantService.getMobileTransactions(tenantId),
  })

  const failed = txns.filter((t) => t.status === 'failed')
  const failedValue = failed.reduce((s, t) => s + t.amount, 0)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Exceptions"
          subtitle="Failed and rejected mobile money transactions"
          actions={
            <div className="flex items-center gap-2 text-xs" style={{ color: accentColor }}>
              {failed.length} failed — {formatUGX(failedValue)}
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Reference', 'Sender', 'Type', 'Channel', 'Amount', 'Failure Reason', 'Timestamp', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : failed.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-muted text-sm">No failed transactions.</td></tr>
              ) : failed.map((t) => (
                <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.reference}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{t.sender}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${accentColor}15`, color: accentColor }}>
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.channel}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                  <td className="px-4 py-3 text-muted max-w-[160px] truncate">{t.failureReason ?? '—'}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{t.timestamp.slice(0, 16)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => addToast(`Retry queued for ${t.reference}`, 'success')}
                      className="text-[10px] font-medium px-2 py-1 rounded border transition-colors"
                      style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}08` }}
                    >
                      Retry
                    </button>
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
