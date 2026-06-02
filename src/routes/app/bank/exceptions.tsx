import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, UserCheck, ArrowUpCircle } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import { useAppStore } from '../../../store/appStore'

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border border-red-300',
  high:     'bg-orange-100 text-orange-700 border border-orange-300',
  medium:   'bg-yellow-100 text-yellow-700',
}

const STATUS_STYLE: Record<string, string> = {
  open:          'bg-red-100 text-red-700',
  investigating: 'bg-blue-100 text-blue-700',
  resolved:      'bg-green-100 text-green-700',
  escalated:     'bg-purple-100 text-purple-700',
}

export default function BankExceptionsPage() {
  const { tenantId, tenantName } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data = [], isLoading } = useQuery({
    queryKey: ['bank-exceptions', tenantId],
    queryFn: () => tenantService.getBankExceptions(tenantId),
  })

  const filtered = useMemo(() => {
    return data.filter((e) => {
      const matchSearch =
        !search ||
        e.instructionRef.toLowerCase().includes(search.toLowerCase()) ||
        e.counterparty.toLowerCase().includes(search.toLowerCase()) ||
        e.reason.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [data, search, statusFilter])

  const openCount          = data.filter((e) => e.status === 'open').length
  const investigatingCount = data.filter((e) => e.status === 'investigating').length
  const escalatedCount     = data.filter((e) => e.status === 'escalated').length
  const resolvedCount      = data.filter((e) => e.status === 'resolved').length

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Exceptions"
          subtitle={`${tenantName} — Active exception management`}
        />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Open"
              value={openCount}
              subtitle="Require immediate action"
              accent="danger"
            />
            <KPICard
              title="Investigating"
              value={investigatingCount}
              subtitle="Under active review"
              accent="primary"
            />
            <KPICard
              title="Escalated"
              value={escalatedCount}
              subtitle="Raised to senior level"
              accent="warning"
            />
            <KPICard
              title="Resolved"
              value={resolvedCount}
              subtitle="Closed exceptions"
              accent="success"
            />
          </>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search reference, counterparty, reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>

        <span className="text-sm text-muted ml-auto">
          {isLoading ? '…' : `${filtered.length} exception${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Instruction Ref</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Counterparty</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Reason</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Severity</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Raised</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">SLA Due</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-muted">
                    No exceptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const canAssign   = e.status === 'open'
                  const canEscalate = e.status === 'open' || e.status === 'investigating'

                  return (
                    <tr key={e.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{e.instructionRef}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(e.amount)}</td>
                      <td className="px-4 py-3 text-slate-700">{e.counterparty}</td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">{e.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                        <span className="truncate block" title={e.reason}>{e.reason}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold',
                          SEVERITY_STYLE[e.severity],
                        )}>
                          {e.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold',
                          STATUS_STYLE[e.status] ?? 'bg-slate-100 text-slate-600',
                        )}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">{e.raisedAt}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">{e.slaDue}</td>
                      <td className="px-4 py-3 text-slate-600">{e.assignedTo ?? <span className="text-muted italic">Unassigned</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {canAssign && (
                            <button
                              onClick={() => addToast(`Exception ${e.id} assigned`, 'success')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                            >
                              <UserCheck size={10} />
                              Assign
                            </button>
                          )}
                          {canEscalate && (
                            <button
                              onClick={() => addToast(`Exception ${e.id} escalated`, 'info')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                            >
                              <ArrowUpCircle size={10} />
                              Escalate
                            </button>
                          )}
                          {!canAssign && !canEscalate && (
                            <span className="text-[10px] text-muted">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
