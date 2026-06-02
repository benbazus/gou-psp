import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ApprovalChain } from '../../../features/rtgs/components/ApprovalChain'
import { formatUGX } from '../../../utils/format'
import { mockInterbankTransfers } from '../../../data/mockRtgs'
import type { InterbankTransfer } from '../../../types/rtgs'
import clsx from 'clsx'

const STATUS_COLOR: Record<string, string> = {
  settled:        'text-green-400 bg-green-500/20 border-green-500/30',
  processing:     'text-blue-400 bg-blue-500/20 border-blue-500/30',
  liquidity_wait: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  pending_auth:   'text-amber-400 bg-amber-500/20 border-amber-500/30',
  failed:         'text-red-400 bg-red-500/20 border-red-500/30',
}

export default function RTGSInterbankPage() {
  const [selected, setSelected] = useState<InterbankTransfer | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader title="Interbank Transfers" subtitle="High-value bank-to-bank RTGS settlement records" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Recent Interbank Transfers</h3>
          {mockInterbankTransfers.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(t)}
              className={clsx(
                'bg-slate-900 border rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors',
                selected?.id === t.id ? 'border-amber-500/40' : 'border-slate-700',
              )}
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                <span className="text-white font-semibold truncate max-w-[100px]">{t.senderBank.split(' ')[0]}</span>
                <ArrowRight size={10} className="text-amber-400 flex-shrink-0" />
                <span className="text-white font-semibold truncate max-w-[100px]">{t.receiverBank.split(' ')[0]}</span>
              </div>
              <p className="text-white font-bold text-base">{formatUGX(t.amount)}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-slate-500">{t.rtgsRef}</span>
                <span className={clsx('text-[10px] border rounded px-1.5 py-0.5 font-semibold', STATUS_COLOR[t.status] ?? 'text-slate-400 bg-slate-700 border-slate-600')}>
                  {t.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="xl:col-span-2">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Settlement Flow</h3>
                  <div className="flex items-center gap-4">
                    {[
                      { label: selected.senderBank.split(' ').slice(0, 2).join(' '), sub: 'Sender Bank', color: 'border-amber-500 bg-amber-500/20 text-amber-300' },
                      null,
                      { label: 'RTGS Engine', sub: 'Bank of Uganda', color: 'border-blue-500 bg-blue-500/20 text-blue-300' },
                      null,
                      { label: selected.receiverBank.split(' ').slice(0, 2).join(' '), sub: 'Receiver Bank', color: selected.status === 'settled' ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-slate-600 bg-slate-800 text-slate-400' },
                    ].map((item, i) =>
                      item === null ? (
                        <div key={i} className="flex-1 flex items-center justify-center">
                          <motion.div
                            className="h-0.5 w-full"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            style={{ background: 'linear-gradient(90deg, #f59e0b44, #f59e0b, #f59e0b44)', transformOrigin: 'left' }}
                          />
                        </div>
                      ) : (
                        <div key={i} className={clsx('border-2 rounded-xl p-3 text-center min-w-[120px]', item.color)}>
                          <p className="text-xs font-bold">{item.label}</p>
                          <p className="text-[10px] opacity-70 mt-0.5">{item.sub}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300">Transaction Details</h4>
                    {([
                      ['Reference',       selected.rtgsRef],
                      ['Amount',          formatUGX(selected.amount)],
                      ['Purpose',         selected.purpose],
                      ['Fees',            formatUGX(selected.fees)],
                      ['Liquidity Impact',formatUGX(selected.liquidityImpact)],
                      ['Submitted',       new Date(selected.submittedAt).toLocaleString('en-UG')],
                      ...(selected.settledAt ? [['Settled', new Date(selected.settledAt).toLocaleString('en-UG')] as [string, string]] : []),
                    ] as [string, string][]).map(([label, val]) => (
                      <div key={label} className="flex justify-between text-xs gap-2">
                        <span className="text-slate-500 flex-shrink-0">{label}</span>
                        <span className="text-slate-200 text-right break-all">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300">Approval Chain</h4>
                    <ApprovalChain steps={selected.approvalChain} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">Audit Trail</h4>
                  <div className="space-y-1.5">
                    {selected.auditLog.map((entry, i) => (
                      <div key={i} className="text-[10px] border-l-2 border-amber-500/30 pl-2">
                        <p className="text-slate-300 font-semibold">{entry.action} — <span className="font-normal text-slate-400">{entry.actor}</span></p>
                        <p className="text-slate-500">{entry.detail}</p>
                        <p className="text-slate-600 font-mono">{new Date(entry.timestamp).toLocaleString('en-UG')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-xl p-12 text-center">
                <ArrowRight size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Select a transfer to view flow diagram, details, and audit trail.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
