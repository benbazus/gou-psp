// src/routes/app/treasury/approvals.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import type { TreasuryApproval } from '../../../types'

const PRIORITY_CLS: Record<TreasuryApproval['priority'], string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  normal: 'bg-slate-100 text-slate-600 border-slate-200',
  low:    'bg-green-50 text-green-700 border-green-200',
}

export default function TreasuryApprovalsPage() {
  const { accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['treasury-approvals'],
    queryFn: () => tenantService.getTreasuryApprovals(),
  })

  const totalPending   = approvals.length
  const totalValue     = approvals.reduce((s, a) => s + a.amount, 0)
  const urgentCount    = approvals.filter((a) => a.priority === 'urgent').length

  function handleApprove(id: string, reference: string) {
    addToast(`Payment order ${reference} approved`, 'success')
  }

  function handleReject(id: string, reference: string) {
    addToast(`Payment order ${reference} rejected`, 'error')
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Approval Queue"
          subtitle="Payment orders awaiting Treasury Approver authorisation"
          actions={
            <div className="flex items-center gap-2 text-xs text-muted">
              <Clock size={13} />
              {totalPending} pending — {formatUGX(totalValue)} total value
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 font-bold">
                  {urgentCount} urgent
                </span>
              )}
            </div>
          }
        />
      </motion.div>

      <motion.div variants={fadeInUp} className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-card shadow-card p-5 space-y-2">
              <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-48 bg-slate-50 rounded animate-pulse" />
            </div>
          ))
        ) : approvals.length === 0 ? (
          <div className="bg-card rounded-card shadow-card p-12 text-center">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-green-400" />
            <p className="text-sm font-medium text-slate-700">No pending approvals</p>
            <p className="text-xs text-muted mt-1">All payment orders have been processed.</p>
          </div>
        ) : (
          approvals.map((a) => (
            <motion.div
              key={a.id}
              variants={fadeInUp}
              className="bg-card rounded-card shadow-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-slate-500">{a.reference}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full border text-[10px] font-bold', PRIORITY_CLS[a.priority])}>
                      {a.priority}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-0.5">{a.payee}</div>
                  <div className="text-xs text-muted">{a.ministryLine} — Vote {a.voteCode}</div>
                  <div className="text-xs text-muted mt-1">{a.description}</div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-muted">
                    <span>Requested by <span className="font-medium text-slate-700">{a.requestedBy}</span></span>
                    <span>{a.requestedAt.slice(0, 10)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-lg font-bold text-slate-800">{formatUGX(a.amount)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(a.id, a.reference)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(a.id, a.reference)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: accentColor }}
                    >
                      <CheckCircle2 size={12} />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
