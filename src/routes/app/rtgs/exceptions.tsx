import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowUp, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { SlaTimer } from '../../../features/rtgs/components/SlaTimer'
import { formatUGX } from '../../../utils/format'
import { useRtgsStore } from '../../../store/rtgsStore'
import type { RTGSException } from '../../../types/rtgs'
import clsx from 'clsx'

const SEVERITY_CONFIG: Record<string, { ring: string; badge: string; dot: string }> = {
  critical: { ring: 'border-red-500/40',    badge: 'bg-red-500/20 text-red-400 border-red-500/30',       dot: 'bg-red-500 animate-pulse' },
  high:     { ring: 'border-orange-500/40', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-500' },
  medium:   { ring: 'border-amber-500/40',  badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',  dot: 'bg-amber-400' },
  low:      { ring: 'border-slate-600',     badge: 'bg-slate-700 text-slate-400 border-slate-600',         dot: 'bg-slate-500' },
}

const STATUS_BADGE: Record<string, string> = {
  open:          'bg-red-500/20 text-red-300 border-red-500/30',
  investigating: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  escalated:     'bg-orange-500/20 text-orange-300 border-orange-500/30',
  resolved:      'bg-green-500/20 text-green-300 border-green-500/30',
  closed:        'bg-slate-700 text-slate-400 border-slate-600',
}

const EXCEPTION_LABELS: Record<string, string> = {
  insufficient_liquidity:  'Insufficient Liquidity',
  duplicate_instruction:   'Duplicate Instruction',
  invalid_beneficiary:     'Invalid Beneficiary',
  invalid_account:         'Invalid Account',
  compliance_flag:         'Compliance Flag',
  settlement_timeout:      'Settlement Timeout',
  rejected_authorization:  'Rejected Authorization',
  failed_confirmation:     'Failed Confirmation',
  treasury_mismatch:       'Treasury Mismatch',
  reversal_request:        'Reversal Request',
}

const OFFICERS = [
  'P. Nabukenya – Liquidity Manager',
  'M. Nakato – CBU Settlement Operator',
  'J. Ochieng – Bank RTGS Operator',
  'R. Mugisha – Compliance Officer',
  'A. Ssebunya – Senior Settlement Officer',
]

export default function RTGSExceptionsPage() {
  const { exceptions, assignException, escalateException, closeException } = useRtgsStore()
  const [selected, setSelected] = useState<RTGSException | null>(null)
  const [severityFilter, setSeverityFilter] = useState('all')

  const filtered = severityFilter === 'all'
    ? exceptions
    : exceptions.filter((e) => e.severity === severityFilter)

  const openCount = exceptions.filter(
    (e) => e.status === 'open' || e.status === 'investigating' || e.status === 'escalated'
  ).length

  function syncSelected(id: string, update: Partial<RTGSException>) {
    setSelected((ex) => (ex?.id === id ? { ...ex, ...update } : ex))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="RTGS Exceptions"
        subtitle={`${openCount} active exception${openCount !== 1 ? 's' : ''} require attention`}
      />

      <div className="flex gap-1">
        {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize',
              severityFilter === s
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white',
            )}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-3">
          {filtered.map((exc, i) => {
            const cfg = SEVERITY_CONFIG[exc.severity]
            return (
              <motion.div
                key={exc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(exc)}
                className={clsx(
                  'bg-slate-900 border rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors',
                  selected?.id === exc.id ? 'border-amber-500/40' : cfg.ring,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{EXCEPTION_LABELS[exc.type]}</p>
                      <p className="text-[10px] font-mono text-slate-500">{exc.transactionRef}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={clsx('text-[10px] font-bold border rounded px-1.5 py-0.5', cfg.badge)}>
                      {exc.severity.toUpperCase()}
                    </span>
                    <span className={clsx('text-[10px] font-semibold border rounded px-1.5 py-0.5', STATUS_BADGE[exc.status])}>
                      {exc.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[60%]">
                    {formatUGX(exc.amount)} · {exc.senderBank.split(' ')[0]} → {exc.receiverBank.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-3">
                    {exc.assignedTo && (
                      <span className="text-slate-500 truncate max-w-[120px]">{exc.assignedTo.split(' – ')[0]}</span>
                    )}
                    <SlaTimer deadline={exc.slaDeadline} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 sticky top-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{EXCEPTION_LABELS[selected.type]}</p>
                    <p className="text-[10px] font-mono text-amber-400 mt-0.5">{selected.transactionRef}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {([
                    ['Amount',   formatUGX(selected.amount)],
                    ['Sender',   selected.senderBank],
                    ['Receiver', selected.receiverBank],
                    ['Raised',   new Date(selected.raisedAt).toLocaleString('en-UG')],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} className="flex gap-2 justify-between">
                      <span className="text-slate-500 flex-shrink-0 w-16">{label}</span>
                      <span className="text-slate-200 text-right">{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">SLA</span>
                    <SlaTimer deadline={selected.slaDeadline} />
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Root Cause</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{selected.rootCause}</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Recommended Action</p>
                  <p className="text-xs text-amber-200/80 leading-relaxed">{selected.recommendedAction}</p>
                </div>

                {['open', 'investigating', 'escalated'].includes(selected.status) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Actions</p>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignException(selected.id, e.target.value)
                          syncSelected(selected.id, { assignedTo: e.target.value, status: 'investigating' })
                          e.target.value = ''
                        }
                      }}
                      defaultValue=""
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="" disabled>Assign to officer…</option>
                      {OFFICERS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          escalateException(selected.id)
                          syncSelected(selected.id, { status: 'escalated' })
                        }}
                        className="flex items-center justify-center gap-1.5 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 rounded-lg py-2 transition-colors"
                      >
                        <ArrowUp size={11} /> Escalate
                      </button>
                      <button
                        onClick={() => {
                          closeException(selected.id)
                          syncSelected(selected.id, { status: 'closed' })
                        }}
                        className="flex items-center justify-center gap-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg py-2 transition-colors"
                      >
                        <CheckCircle2 size={11} /> Close
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">Audit Log</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selected.auditLog.map((entry, i) => (
                      <div key={i} className="text-[10px] border-l border-amber-500/30 pl-2">
                        <p className="text-slate-300 font-semibold">{entry.action}</p>
                        <p className="text-slate-500">{entry.detail}</p>
                        <p className="text-slate-600 font-mono">{new Date(entry.timestamp).toLocaleString('en-UG')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
                <AlertTriangle size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Select an exception to view root cause and take action.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
