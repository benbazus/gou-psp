import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Play, Pause, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import { useAppStore } from '../../../store/appStore'

const STATUS_STYLE: Record<string, string> = {
  queued:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  settled:    'bg-green-100 text-green-700 border-green-200',
  rejected:   'bg-red-100 text-red-700 border-red-200',
  on_hold:    'bg-slate-100 text-slate-600 border-slate-200',
}

const PRIORITY_STYLE: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  normal: 'bg-slate-100 text-slate-600 border-slate-200',
  low:    'bg-green-50 text-green-700 border-green-200',
}

export default function BankRtgsQueuePage() {
  const { tenantId, tenantName } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data = [], isLoading } = useQuery({
    queryKey: ['bank-queue', tenantId],
    queryFn: () => tenantService.getBankQueue(tenantId),
  })

  const filtered = useMemo(() => {
    return data.filter((e) => {
      const matchSearch =
        !search ||
        e.instructionRef.toLowerCase().includes(search.toLowerCase()) ||
        e.counterparty.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [data, search, statusFilter])

  // KPI derivations
  const queuedCount     = data.filter((e) => e.status === 'queued').length
  const processingCount = data.filter((e) => e.status === 'processing').length
  const settledToday    = data.filter((e) => e.status === 'settled').length
  const slaBreaches     = data.filter((e) => e.elapsedMinutes > e.slaMinutes).length

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="RTGS Queue"
          subtitle={`${tenantName} — Real-time gross settlement queue`}
        />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Queued"
              value={queuedCount}
              subtitle="Awaiting processing"
              accent="warning"
            />
            <KPICard
              title="Processing"
              value={processingCount}
              subtitle="Currently in flight"
              accent="primary"
            />
            <KPICard
              title="Settled Today"
              value={settledToday}
              subtitle="Successfully settled"
              accent="success"
            />
            <KPICard
              title="SLA Breaches"
              value={slaBreaches}
              subtitle="Elapsed beyond SLA"
              accent={slaBreaches > 0 ? 'danger' : 'success'}
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
            placeholder="Search reference or counterparty…"
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
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="settled">Settled</option>
          <option value="rejected">Rejected</option>
          <option value="on_hold">On Hold</option>
        </select>

        <span className="text-sm text-muted ml-auto">
          {isLoading ? '…' : `${filtered.length} instruction${filtered.length !== 1 ? 's' : ''}`}
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
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Priority</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Window</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">SLA</th>
                <th className="px-4 py-2.5 text-center font-medium text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    No queue entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const slaBreached = e.elapsedMinutes > e.slaMinutes
                  const canPrioritise = e.status === 'queued' || e.status === 'on_hold'
                  const canHold = e.status === 'processing'

                  return (
                    <tr
                      key={e.id}
                      className={clsx(
                        'hover:bg-surface/60 transition-colors',
                        slaBreached && 'bg-red-50/60',
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {slaBreached && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                          <span className="font-mono text-[11px] text-slate-700">{e.instructionRef}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(e.amount)}</td>
                      <td className="px-4 py-3 text-slate-700">{e.counterparty}</td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-[10px] font-semibold',
                          e.type === 'credit' ? 'text-green-600' : 'text-red-500',
                        )}>
                          {e.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full border text-[10px] font-bold',
                          PRIORITY_STYLE[e.priority],
                        )}>
                          {e.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full border text-[10px] font-bold',
                          STATUS_STYLE[e.status],
                        )}>
                          {e.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{e.settlementWindow}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={clsx(
                          'font-mono text-[11px] font-semibold',
                          slaBreached ? 'text-red-500' : 'text-slate-600',
                        )}>
                          {e.elapsedMinutes}m / {e.slaMinutes}m
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {canPrioritise && (
                          <button
                            onClick={() => addToast(`Instruction ${e.instructionRef} prioritised`, 'success')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                          >
                            <Play size={10} />
                            Prioritise
                          </button>
                        )}
                        {canHold && (
                          <button
                            onClick={() => addToast(`Instruction ${e.instructionRef} placed on hold`, 'success')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
                          >
                            <Pause size={10} />
                            Hold
                          </button>
                        )}
                        {!canPrioritise && !canHold && (
                          <span className="text-[10px] text-muted">—</span>
                        )}
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
