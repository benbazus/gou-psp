// src/routes/app/agency/pending.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Clock } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AgencyPendingPage() {
  const { tenantId, accentColor } = usePortalConfig()

  const { data: txns = [], isLoading } = useQuery({
    queryKey: ['agency-txns', tenantId],
    queryFn: () => tenantService.getAgencyTransactions(tenantId),
  })

  const pending = txns.filter((t) => t.status === 'pending')
  const pendingValue = pending.reduce((s, t) => s + t.amount, 0)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Pending Payments"
          subtitle="Payments received but not yet confirmed or matched to a PRN"
          actions={
            <div className="flex items-center gap-2 text-xs" style={{ color: accentColor }}>
              <Clock size={13} />
              {pending.length} pending — {formatUGX(pendingValue)}
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-800">Pending Payment Queue</h3>
          <p className="text-xs text-muted">Sorted by timestamp — oldest first</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['PRN', 'Payer', 'Service', 'Channel', 'Amount', 'Received At', 'Wait Time'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : pending.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted text-sm">No pending payments.</td></tr>
              ) : pending.map((t) => {
                const ageMinutes = Math.floor((Date.now() - new Date(t.timestamp).getTime()) / 60_000)
                const aged = ageMinutes > 30
                return (
                  <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.prn}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.payer}</td>
                    <td className="px-4 py-3 text-slate-600">{t.serviceName}</td>
                    <td className="px-4 py-3 text-slate-600">{t.channel}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(t.amount)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{t.timestamp.slice(0, 16)}</td>
                    <td className={clsx('px-4 py-3 font-medium whitespace-nowrap', aged ? 'text-amber-600' : 'text-slate-600')}>
                      {ageMinutes < 60 ? `${ageMinutes}m` : `${Math.floor(ageMinutes / 60)}h ${ageMinutes % 60}m`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
