import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Droplets, AlertTriangle, Gauge } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { LiquidityBar } from '../../../features/rtgs/components/LiquidityBar'
import { AreaChart } from '../../../components/charts/AreaChart'
import { useRtgsStore } from '../../../store/rtgsStore'
import { formatUGX } from '../../../utils/format'
import type { LiquidityPosition } from '../../../types/rtgs'
import clsx from 'clsx'

const RISK_BADGE: Record<string, string> = {
  low:      'bg-green-500/20 text-green-400 border-green-500/30',
  medium:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function RTGSLiquidityPage() {
  const { liquidityPositions, injectLiquidity, toggleWatchlist } = useRtgsStore()
  const [selected, setSelected] = useState<LiquidityPosition | null>(null)
  const [showInjectModal, setShowInjectModal] = useState(false)
  const [injectTarget, setInjectTarget] = useState<string | null>(null)
  const [injectAmount, setInjectAmount] = useState('')

  const alerts = liquidityPositions.filter((p) => p.utilizationPct > p.warningThreshold)

  function handleInject() {
    if (!injectTarget) return
    const amt = parseFloat(injectAmount) * 1_000_000_000
    if (!isNaN(amt) && amt > 0) {
      injectLiquidity(injectTarget, amt)
      setShowInjectModal(false)
      setInjectAmount('')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Liquidity Monitor" subtitle="Real-time intraday liquidity positions for RTGS participants" />

      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((p) => (
            <div key={p.bankId} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs">
              <AlertTriangle size={13} className="flex-shrink-0" />
              <span>
                <strong>{p.bankName}</strong> — Liquidity utilisation at{' '}
                <strong>{p.utilizationPct.toFixed(1)}%</strong>, exceeding {p.warningThreshold}% warning threshold
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-3">
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[180px_1fr_80px_80px_80px] gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Bank</span>
              <span>Liquidity Bar</span>
              <span className="text-right">Available</span>
              <span className="text-right">Utilised</span>
              <span className="text-right">Risk</span>
            </div>
            {liquidityPositions.map((pos, i) => (
              <motion.div
                key={pos.bankId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(pos)}
                className={clsx(
                  'grid grid-cols-[180px_1fr_80px_80px_80px] gap-2 items-center px-4 py-3 cursor-pointer hover:bg-slate-800/60 transition-colors border-b border-slate-800 last:border-b-0',
                  selected?.bankId === pos.bankId && 'bg-slate-800/80',
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{pos.bankShort}</p>
                  {pos.onWatchlist && (
                    <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded px-1">WATCHLIST</span>
                  )}
                </div>
                <LiquidityBar pct={pos.utilizationPct} riskLevel={pos.riskLevel} height={10} />
                <p className="text-xs text-slate-300 text-right">{(pos.availableLiquidity / 1_000_000_000).toFixed(1)}B</p>
                <p className={clsx('text-xs font-bold text-right', {
                  'text-green-400':  pos.riskLevel === 'low',
                  'text-amber-400':  pos.riskLevel === 'medium',
                  'text-orange-400': pos.riskLevel === 'high',
                  'text-red-400':    pos.riskLevel === 'critical',
                })}>
                  {pos.utilizationPct.toFixed(1)}%
                </p>
                <div className="flex justify-end">
                  <span className={clsx('text-[10px] border rounded px-1.5 py-0.5 font-semibold', RISK_BADGE[pos.riskLevel])}>
                    {pos.riskLevel.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Liquidity Utilisation by Bank (%)</h3>
            <AreaChart
              data={liquidityPositions.map((p) => ({ name: p.bankShort, utilization: p.utilizationPct }))}
              xKey="name"
              areas={[{ key: 'utilization', color: '#f59e0b', name: 'Utilisation %' }]}
              height={200}
            />
          </div>
        </div>

        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.bankId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 sticky top-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-bold">{selected.bankName}</p>
                    <span className={clsx('text-[10px] border rounded px-1.5 py-0.5 font-semibold mt-1 inline-block', RISK_BADGE[selected.riskLevel])}>
                      {selected.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
                </div>

                <div className="space-y-2 text-xs">
                  {([
                    ['Opening Balance',    formatUGX(selected.openingBalance)],
                    ['Available Liquidity',formatUGX(selected.availableLiquidity)],
                    ['Intraday Facility',  formatUGX(selected.intradayLiquidity)],
                    ['Pledged Collateral', formatUGX(selected.pledgedCollateral)],
                    ['Queued Outgoing',    formatUGX(selected.queuedOutgoing)],
                    ['Settled Outgoing',   formatUGX(selected.settledOutgoing)],
                    ['Settled Incoming',   formatUGX(selected.settledIncoming)],
                    ['Warning Threshold',  `${selected.warningThreshold}%`],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-slate-500 flex-shrink-0">{label}</span>
                      <span className="text-slate-200 text-right">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => { setInjectTarget(selected.bankId); setShowInjectModal(true) }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg py-2.5 text-sm font-medium transition-colors"
                  >
                    <Droplets size={14} /> Inject Liquidity
                  </button>
                  <button
                    onClick={() => toggleWatchlist(selected.bankId)}
                    className={clsx(
                      'w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors border',
                      selected.onWatchlist
                        ? 'bg-slate-600/50 hover:bg-slate-600 text-slate-300 border-slate-500/30'
                        : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/30',
                    )}
                  >
                    <Eye size={14} /> {selected.onWatchlist ? 'Remove from Watchlist' : 'Place on Watchlist'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
                <Gauge size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click a bank row to view its full liquidity position.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showInjectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-white font-bold text-lg">Inject Liquidity</h3>
              <p className="text-xs text-slate-400">
                Bank: <strong className="text-slate-200">{liquidityPositions.find((p) => p.bankId === injectTarget)?.bankName}</strong>
              </p>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Amount (UGX Billions)</label>
                <input
                  type="number"
                  value={injectAmount}
                  onChange={(e) => setInjectAmount(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowInjectModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2.5 text-sm transition-colors">Cancel</button>
                <button onClick={handleInject} className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg py-2.5 text-sm transition-colors">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
