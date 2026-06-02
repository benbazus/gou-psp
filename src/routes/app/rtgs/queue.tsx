import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, CheckCircle2, XCircle, ArrowUp, Pause, Play } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { SettlementCard } from '../../../features/rtgs/components/SettlementCard'
import { ApprovalChain } from '../../../features/rtgs/components/ApprovalChain'
import { useRtgsStore } from '../../../store/rtgsStore'
import { formatUGX } from '../../../utils/format'
import type { RTGSTransaction, RTGSTransactionStatus } from '../../../types/rtgs'
import clsx from 'clsx'

type QueueTab = 'all' | RTGSTransactionStatus

const TABS: { id: QueueTab; label: string }[] = [
  { id: 'all',           label: 'All' },
  { id: 'high_priority', label: 'High Priority' },
  { id: 'liquidity_wait',label: 'Liquidity Wait' },
  { id: 'pending_auth',  label: 'Pending Auth' },
  { id: 'processing',    label: 'Processing' },
  { id: 'settled',       label: 'Settled' },
  { id: 'failed',        label: 'Failed' },
]

export default function RTGSQueuePage() {
  const { settlementQueue, approveTransaction, rejectTransaction, holdTransaction, releaseTransaction, escalatePriority } = useRtgsStore()
  const [activeTab, setActiveTab] = useState<QueueTab>('all')
  const [selectedTx, setSelectedTx] = useState<RTGSTransaction | null>(null)

  const filtered = activeTab === 'all'
    ? settlementQueue
    : settlementQueue.filter((t) => t.status === activeTab)

  const countFor = (tab: QueueTab) =>
    tab === 'all' ? settlementQueue.length : settlementQueue.filter((t) => t.status === tab).length

  const role = localStorage.getItem('govpay_role') ?? 'RTGS Super Admin'

  function syncSelected(id: string, update: Partial<RTGSTransaction>) {
    setSelectedTx((t) => (t?.id === id ? { ...t, ...update } : t))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settlement Queue" subtitle="Manage and action RTGS settlement instructions" />

      <div className="flex gap-1 flex-wrap bg-slate-900 border border-slate-700 rounded-xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white',
            )}
          >
            {tab.label}
            {countFor(tab.id) > 0 && (
              <span className={clsx('text-[10px] rounded-full px-1.5 py-0.5',
                activeTab === tab.id ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-700 text-slate-400',
              )}>
                {countFor(tab.id)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {filtered.map((tx, i) => (
              <SettlementCard key={tx.id} tx={tx} delay={i * 0.03} onClick={() => setSelectedTx(tx)} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center text-slate-500 text-sm">
              No transactions in this category.
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedTx ? (
              <motion.div
                key={selectedTx.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 sticky top-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-amber-400">{selectedTx.rtgsRef}</p>
                    <p className="text-white font-bold text-lg mt-0.5">{formatUGX(selectedTx.amount)}</p>
                  </div>
                  <button onClick={() => setSelectedTx(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {([
                    ['Sender',   selectedTx.senderBank],
                    ['Receiver', selectedTx.receiverBank],
                    ['Purpose',  selectedTx.purpose],
                    ['Priority', selectedTx.priority.toUpperCase()],
                    ['Window',   selectedTx.settlementWindow],
                    ['Liquidity',selectedTx.liquidityStatus],
                    ['Fees',     formatUGX(selectedTx.fees)],
                    ['Submitted',new Date(selectedTx.submittedAt).toLocaleString('en-UG')],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-slate-500 w-20 flex-shrink-0">{label}</span>
                      <span className="text-slate-200 break-words">{val}</span>
                    </div>
                  ))}
                </div>

                {selectedTx.approvalStatus !== 'not_required' && (
                  <div>
                    <p className="text-xs font-semibold text-slate-300 mb-2">Approval Chain</p>
                    <ApprovalChain steps={[{
                      role: 'Central Bank Settlement Operator',
                      actor: 'M. Nakato (CBU)',
                      status: selectedTx.approvalStatus === 'approved' ? 'approved' : selectedTx.approvalStatus === 'rejected' ? 'rejected' : 'pending',
                      timestamp: selectedTx.approvedBy ? selectedTx.submittedAt : undefined,
                    }]} />
                  </div>
                )}

                {['queued', 'high_priority', 'pending_auth', 'liquidity_wait', 'held'].includes(selectedTx.status) && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-slate-300">Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTx.status !== 'held' && (
                        <button
                          onClick={() => {
                            approveTransaction(selectedTx.id, role)
                            syncSelected(selectedTx.id, { status: 'processing', approvalStatus: 'approved', approvedBy: role })
                          }}
                          className="flex items-center justify-center gap-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg py-2 transition-colors"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          escalatePriority(selectedTx.id)
                          syncSelected(selectedTx.id, { priority: 'critical', status: 'high_priority' })
                        }}
                        className="flex items-center justify-center gap-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg py-2 transition-colors"
                      >
                        <ArrowUp size={12} /> Escalate
                      </button>
                      {selectedTx.status !== 'held' ? (
                        <button
                          onClick={() => {
                            holdTransaction(selectedTx.id)
                            syncSelected(selectedTx.id, { status: 'held' })
                          }}
                          className="flex items-center justify-center gap-1.5 text-xs bg-slate-600/50 hover:bg-slate-600 text-slate-300 border border-slate-500/30 rounded-lg py-2 transition-colors"
                        >
                          <Pause size={12} /> Hold
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            releaseTransaction(selectedTx.id)
                            syncSelected(selectedTx.id, { status: 'queued' })
                          }}
                          className="flex items-center justify-center gap-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg py-2 transition-colors"
                        >
                          <Play size={12} /> Release
                        </button>
                      )}
                      <button
                        onClick={() => {
                          rejectTransaction(selectedTx.id, 'Rejected by operator')
                          syncSelected(selectedTx.id, { status: 'failed', approvalStatus: 'rejected' })
                        }}
                        className="flex items-center justify-center gap-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg py-2 transition-colors"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">Audit Log</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedTx.auditLog.map((entry, i) => (
                      <div key={i} className="text-[10px] border-l border-amber-500/30 pl-2">
                        <p className="text-slate-300 font-semibold">{entry.action}</p>
                        <p className="text-slate-500">{entry.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
                <Eye size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click a transaction to view details and actions.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
