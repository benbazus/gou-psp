import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, Loader2, XCircle, ChevronRight } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatUGX } from '../../../utils/format'
import { mockTreasuryWorkflows } from '../../../data/mockRtgsTreasury'
import type { RTGSTreasuryWorkflow } from '../../../types/rtgs'
import clsx from 'clsx'

const STEP_ICON: Record<string, React.ReactNode> = {
  completed:   <CheckCircle2 size={15} className="text-green-400" />,
  in_progress: <Loader2 size={15} className="text-amber-400 animate-spin" />,
  pending:     <Clock size={15} className="text-slate-500" />,
  failed:      <XCircle size={15} className="text-red-400" />,
}

const STATUS_COLOR: Record<string, string> = {
  settled:      'text-green-400 bg-green-500/15 border-green-500/30',
  processing:   'text-blue-400 bg-blue-500/15 border-blue-500/30',
  queued:       'text-slate-300 bg-slate-700/50 border-slate-600',
  pending_auth: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  failed:       'text-red-400 bg-red-500/15 border-red-500/30',
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high:     'bg-amber-500/20 text-amber-400',
  normal:   'bg-slate-700 text-slate-300',
  low:      'bg-slate-800 text-slate-500',
}

export default function RTGSTreasuryPage() {
  const [selected, setSelected] = useState<RTGSTreasuryWorkflow | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader title="Treasury Transfers" subtitle="Government and treasury RTGS settlement workflows" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-3">
          {mockTreasuryWorkflows.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(wf)}
              className={clsx(
                'bg-slate-900 border rounded-xl p-5 cursor-pointer hover:border-slate-500 transition-colors',
                selected?.id === wf.id ? 'border-amber-500/40' : 'border-slate-700',
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm leading-tight">{wf.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{wf.description}</p>
                </div>
                <ChevronRight size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-amber-400 font-bold text-base">{formatUGX(wf.amount)}</p>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-[10px] font-semibold rounded px-1.5 py-0.5', PRIORITY_COLOR[wf.priority])}>
                    {wf.priority.toUpperCase()}
                  </span>
                  <span className={clsx('text-[10px] font-semibold border rounded px-1.5 py-0.5', STATUS_COLOR[wf.status] ?? 'text-slate-400 bg-slate-700 border-slate-600')}>
                    {wf.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Steps: {wf.steps.filter((s) => s.status === 'completed').length} / {wf.steps.length} completed</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <motion.div
                    className="h-full bg-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(wf.steps.filter((s) => s.status === 'completed').length / wf.steps.length) * 100}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120, delay: i * 0.06 + 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
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
                    <p className="text-white font-bold text-sm">{selected.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selected.reference}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
                </div>

                <div className="space-y-1 text-xs">
                  {([
                    ['Amount',      formatUGX(selected.amount)],
                    ['Originator',  selected.originator],
                    ['Beneficiary', selected.beneficiary],
                    ['Priority',    selected.priority.toUpperCase()],
                    ['Status',      selected.status.replace('_', ' ').toUpperCase()],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} className="flex gap-2 justify-between">
                      <span className="text-slate-500 flex-shrink-0 w-20">{label}</span>
                      <span className="text-slate-200 text-right">{val}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-3">Settlement Timeline</h4>
                  <div className="space-y-0">
                    {selected.steps.map((step, i) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="mt-0.5">{STEP_ICON[step.status]}</div>
                          {i < selected.steps.length - 1 && <div className="w-0.5 h-6 bg-slate-700 mt-1" />}
                        </div>
                        <div className="pb-4 min-w-0 flex-1">
                          <p className={clsx('text-xs font-semibold', {
                            'text-green-400': step.status === 'completed',
                            'text-amber-300': step.status === 'in_progress',
                            'text-slate-500': step.status === 'pending',
                            'text-red-400':   step.status === 'failed',
                          })}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{step.actor}</p>
                          {step.note && <p className="text-[10px] text-slate-400 italic mt-0.5">{step.note}</p>}
                          {step.timestamp && (
                            <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                              {new Date(step.timestamp).toLocaleString('en-UG')}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-xl p-12 text-center">
                <p className="text-slate-400 text-sm">Select a workflow to view its step-by-step timeline.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
