// src/routes/app/treasury/disbursements.tsx
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { TreasuryDisbursement } from '../../../types'

const STATUS_CLS: Record<TreasuryDisbursement['status'], string> = {
  pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved:         'bg-blue-100 text-blue-700 border-blue-200',
  processing:       'bg-indigo-100 text-indigo-700 border-indigo-200',
  completed:        'bg-green-100 text-green-700 border-green-200',
  rejected:         'bg-red-100 text-red-700 border-red-200',
}

const STATUS_LABELS: Record<TreasuryDisbursement['status'], string> = {
  pending_approval: 'Pending Approval',
  approved:  'Approved',
  processing: 'Processing',
  completed:  'Completed',
  rejected:   'Rejected',
}

const PRIORITY_CLS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  normal: 'bg-slate-100 text-slate-600 border-slate-200',
  low:    'bg-green-50 text-green-700 border-green-200',
}

type StatusFilter = 'all' | TreasuryDisbursement['status']

export default function TreasuryDisbursementsPage() {
  const { accentColor } = usePortalConfig()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const { data: disbursements = [], isLoading } = useQuery({
    queryKey: ['treasury-disbursements'],
    queryFn: () => tenantService.getTreasuryDisbursements(),
  })

  const filtered = statusFilter === 'all'
    ? disbursements
    : disbursements.filter((d) => d.status === statusFilter)

  const totalValue = filtered.reduce((s, d) => s + d.amount, 0)

  const statuses: StatusFilter[] = ['all', 'pending_approval', 'approved', 'processing', 'completed', 'rejected']

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Disbursements"
          subtitle="All payment orders — filter by status to view pending approvals or completed payments"
        />
      </motion.div>

      {/* Filter chips */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
        {statuses.map((s) => {
          const count = s === 'all' ? disbursements.length : disbursements.filter((d) => d.status === s).length
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                statusFilter === s
                  ? 'text-white border-transparent'
                  : 'bg-surface border-border text-muted hover:bg-slate-100',
              )}
              style={statusFilter === s ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s as TreasuryDisbursement['status']]} ({count})
            </button>
          )
        })}
        <div className="ml-auto text-xs text-muted self-center">
          Total: <span className="font-semibold text-slate-700">{formatUGX(totalValue)}</span>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                {['Reference', 'Payee', 'Vote Code', 'Ministry Line', 'Amount', 'Priority', 'Status', 'Requested'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((d) => (
                <tr key={d.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{d.reference}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[160px] truncate">{d.payee}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{d.voteCode}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate">{d.ministryLine.replace('Ministry of ', '')}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{formatUGX(d.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-bold', PRIORITY_CLS[d.priority])}>
                      {d.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-bold', STATUS_CLS[d.status])}>
                      {STATUS_LABELS[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{d.requestedAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted text-sm">No disbursements match this filter.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
