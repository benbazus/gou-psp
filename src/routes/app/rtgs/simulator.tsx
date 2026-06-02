import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Play, RotateCcw, ChevronRight, GitCompareArrows } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { RTGSFlowNode } from '../../../features/rtgs/components/RTGSFlowNode'
import { ManualVsDigitalComparison } from '../../../features/rtgs/components/ManualVsDigitalComparison'
import { useRtgsStore } from '../../../store/rtgsStore'
import { formatUGX } from '../../../utils/format'
import type { SimulatorScenario, RTGSSimulatorNode } from '../../../types/rtgs'
import clsx from 'clsx'

const SCENARIOS: { id: SimulatorScenario; label: string; color: string; desc: string }[] = [
  { id: 'successful_settlement',  label: 'Successful Settlement',  color: 'green',  desc: 'All checks pass; settlement executes and finalises' },
  { id: 'insufficient_liquidity', label: 'Insufficient Liquidity', color: 'orange', desc: 'Sender liquidity check fails; instruction held in queue' },
  { id: 'queued_settlement',      label: 'Queued Settlement',      color: 'blue',   desc: 'Valid instruction placed in next settlement window' },
  { id: 'rejected_settlement',    label: 'Rejected Settlement',    color: 'red',    desc: 'Validation failure returns instruction to sender' },
  { id: 'timeout',                label: 'Settlement Timeout',     color: 'amber',  desc: 'CBU authorization SLA breached; instruction fails' },
  { id: 'manual_override',        label: 'Manual Override',        color: 'purple', desc: 'Operator manually overrides stalled authorization' },
  { id: 'reversal',               label: 'Settlement Reversal',    color: 'pink',   desc: 'Settled transaction reversed by CBU instruction' },
]

const SCENARIO_BANKS = [
  { sender: 'Ministry of Finance, Planning and Economic Development', receiver: 'Stanbic Bank Uganda',  amount: 4_500_000_000 },
  { sender: 'Uganda Revenue Authority',                               receiver: 'Bank of Uganda',       amount: 2_100_000_000 },
  { sender: 'DFCU Bank',                                              receiver: 'Centenary Bank',       amount: 850_000_000 },
  { sender: 'National Social Security Fund',                          receiver: 'Equity Bank Uganda',   amount: 3_200_000_000 },
]

const COLOR_BTN: Record<string, string> = {
  green:  'border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20',
  orange: 'border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20',
  blue:   'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20',
  red:    'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  amber:  'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
  purple: 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20',
  pink:   'border-pink-500/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20',
}

const DEFAULT_NODES: RTGSSimulatorNode[] = [
  { id: 'originator',    label: 'Originating Institution',     description: 'Government Agency / Treasury / Bank submits instruction', state: 'idle' },
  { id: 'capture',       label: 'RTGS Instruction Capture',    description: 'Instruction received and parsed', state: 'idle' },
  { id: 'validation',    label: 'Validation Engine',           description: 'Format, limits, account checks', state: 'idle' },
  { id: 'compliance',    label: 'Compliance Screening',        description: 'AML / sanctions / FATF checks', state: 'idle' },
  { id: 'liquidity',     label: 'Liquidity Check',             description: 'Sender intraday position verified', state: 'idle' },
  { id: 'queue',         label: 'Settlement Queue',            description: 'Instruction queued for next window', state: 'idle' },
  { id: 'authorization', label: 'Central Bank Authorization',  description: 'CBU operator final approval', state: 'idle' },
  { id: 'execution',     label: 'Settlement Execution',        description: 'Debit sender, credit receiver', state: 'idle' },
  { id: 'confirmation',  label: 'Receiving Bank Confirmation', description: 'Receiver bank acknowledges credit', state: 'idle' },
  { id: 'ledger',        label: 'Treasury Ledger Update',      description: 'IFMS / accounting system updated', state: 'idle' },
]

type TabId = 'simulator' | 'comparison'

export default function RTGSSimulatorPage() {
  const { simulatorRun, startSimulation, advanceSimulatorStep, resetSimulator } = useRtgsStore()
  const [activeTab, setActiveTab]           = useState<TabId>('simulator')
  const [selectedScenario, setSelectedScenario] = useState<SimulatorScenario>('successful_settlement')
  const [selectedBankIdx, setSelectedBankIdx]   = useState(0)

  const bank = SCENARIO_BANKS[selectedBankIdx]

  const displayNodes = simulatorRun?.nodes ?? DEFAULT_NODES

  return (
    <div className="space-y-6">
      <PageHeader
        title="RTGS Flow Simulator"
        subtitle="Simulate and visualise real RTGS settlement scenarios step-by-step"
        icon={Cpu}
      />

      <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1 w-fit">
        {([
          { id: 'simulator'  as TabId, label: 'Flow Simulator',    icon: Cpu },
          { id: 'comparison' as TabId, label: 'Manual vs Digital',  icon: GitCompareArrows },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'comparison' ? (
          <motion.div key="comparison" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ManualVsDigitalComparison />
          </motion.div>
        ) : (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Controls */}
            <div className="xl:col-span-1 space-y-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Select Scenario</h3>
                <div className="space-y-2">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedScenario(s.id); resetSimulator() }}
                      className={clsx(
                        'w-full text-left p-3 rounded-lg border text-xs transition-colors',
                        COLOR_BTN[s.color],
                        selectedScenario === s.id ? 'ring-1 ring-white/20' : '',
                      )}
                    >
                      <div className="font-semibold">{s.label}</div>
                      <div className="opacity-70 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">Transaction</h3>
                {SCENARIO_BANKS.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedBankIdx(i)}
                    className={clsx(
                      'w-full text-left p-2.5 rounded-lg border text-xs transition-colors',
                      selectedBankIdx === i
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white',
                    )}
                  >
                    <p className="font-semibold truncate">{b.sender.split(',')[0]}</p>
                    <p className="opacity-70">→ {b.receiver.split(' ').slice(0, 2).join(' ')}</p>
                    <p className="text-amber-400 font-mono mt-0.5">{formatUGX(b.amount)}</p>
                  </button>
                ))}

                <div className="flex gap-2 pt-1">
                  {!simulatorRun || simulatorRun.status === 'idle' ? (
                    <button
                      onClick={() => startSimulation(selectedScenario, bank.sender, bank.receiver, bank.amount)}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-2.5 rounded-lg transition-colors"
                    >
                      <Play size={14} /> Start
                    </button>
                  ) : simulatorRun.status === 'running' ? (
                    <button
                      onClick={advanceSimulatorStep}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
                    >
                      <ChevronRight size={14} /> Next Step
                    </button>
                  ) : null}
                  {simulatorRun && (
                    <button
                      onClick={resetSimulator}
                      className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Flow diagram */}
            <div className="xl:col-span-1 bg-slate-900 border border-slate-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Settlement Flow</h3>
              <div>
                {displayNodes.map((node, i) => (
                  <RTGSFlowNode
                    key={node.id}
                    label={node.label}
                    description={node.description}
                    state={node.state}
                    isLast={i === displayNodes.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Status panel */}
            <div className="xl:col-span-1 space-y-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Transaction Status</h3>
                {simulatorRun ? (
                  <div className="space-y-2.5">
                    {[
                      ['RTGS Reference', simulatorRun.rtgsRef],
                      ['Amount',         formatUGX(simulatorRun.amount)],
                      ['Sender',         simulatorRun.senderBank.split(',')[0]],
                      ['Receiver',       simulatorRun.receiverBank],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-xs gap-2">
                        <span className="text-slate-400 flex-shrink-0">{label}</span>
                        <span className="text-white text-right truncate max-w-[160px]">{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Status</span>
                      <span className={clsx('font-semibold', {
                        'text-green-400': simulatorRun.status === 'completed',
                        'text-red-400':   simulatorRun.status === 'failed',
                        'text-amber-400': simulatorRun.status === 'running',
                      })}>
                        {simulatorRun.status.toUpperCase()}
                      </span>
                    </div>
                    {simulatorRun.finalOutcome && (
                      <div className={clsx('mt-2 p-3 rounded-lg text-xs border',
                        simulatorRun.status === 'completed'
                          ? 'bg-green-500/10 border-green-500/30 text-green-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300',
                      )}>
                        {simulatorRun.finalOutcome}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Select a scenario and click Start.</p>
                )}
              </div>

              {simulatorRun && simulatorRun.auditLog.length > 0 && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Audit Trail</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {simulatorRun.auditLog.map((entry, i) => (
                      <div key={i} className="text-xs border-l-2 border-amber-500/40 pl-2">
                        <p className="text-slate-300 font-medium">{entry.action}</p>
                        <p className="text-slate-500">{entry.detail}</p>
                        <p className="text-slate-600 font-mono">
                          {new Date(entry.timestamp).toLocaleTimeString('en-UG')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
