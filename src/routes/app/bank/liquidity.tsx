import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Droplets, X } from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { AreaChart } from '../../../components/charts/AreaChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer, scaleIn } from '../../../utils/animations'
import { useAppStore } from '../../../store/appStore'

export default function BankLiquidityPage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [modalOpen, setModalOpen] = useState(false)
  const [injectionAmount, setInjectionAmount] = useState('')

  const { data: liq, isLoading } = useQuery({
    queryKey: ['bank-liq', tenantId],
    queryFn: () => tenantService.getBankLiquidity(tenantId),
  })

  const utilPct = Math.min(liq?.utilizationPct ?? 0, 100)
  const barColor =
    utilPct > 85 ? '#ef4444' :
    utilPct > 70 ? '#f59e0b' :
    '#16a34a'

  const total = (liq?.available ?? 0) + (liq?.reserved ?? 0)
  const thresholdPct = total > 0 ? Math.round(((liq?.threshold ?? 0) / total) * 100) : 0

  const intradayData = (liq?.intraday ?? []).map((d) => ({
    hour: d.hour,
    value: Math.round(d.value / 1_000_000_000 * 10) / 10,
  }))

  function handleSubmitInjection() {
    if (!injectionAmount || isNaN(Number(injectionAmount))) {
      addToast('Please enter a valid amount', 'success')
      return
    }
    addToast(`Injection request of UGX ${Number(injectionAmount).toLocaleString()} submitted`, 'success')
    setModalOpen(false)
    setInjectionAmount('')
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Liquidity Position"
          subtitle={`${tenantName} — Real-time RTGS account liquidity`}
          actions={
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              <Droplets size={14} />
              Request Injection
            </button>
          }
        />
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-card rounded-card shadow-card border-t-[3px] border-l-4 border-green-500 border-t-success p-4 flex flex-col gap-1">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Available</span>
              <div className="text-xl font-bold text-slate-800">{formatUGX(liq?.available ?? 0)}</div>
              <span className="text-xs text-muted">Immediately accessible</span>
            </div>
            <div className="bg-card rounded-card shadow-card border-t-[3px] border-l-4 border-green-500 border-t-success p-4 flex flex-col gap-1">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Reserved</span>
              <div className="text-xl font-bold text-slate-800">{formatUGX(liq?.reserved ?? 0)}</div>
              <span className="text-xs text-muted">Committed for settlement</span>
            </div>
            <div className="bg-card rounded-card shadow-card border-t-[3px] border-l-4 border-green-500 border-t-success p-4 flex flex-col gap-1">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Threshold</span>
              <div className="text-xl font-bold text-slate-800">{formatUGX(liq?.threshold ?? 0)}</div>
              <span className="text-xs text-muted">Minimum balance limit</span>
            </div>
            <div className={clsx(
              'bg-card rounded-card shadow-card border-t-[3px] border-l-4 p-4 flex flex-col gap-1',
              (liq?.injectionPending ?? 0) > 0
                ? 'border-amber-400 border-t-warning'
                : 'border-green-500 border-t-success',
            )}>
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Injection Pending</span>
              <div className={clsx(
                'text-xl font-bold',
                (liq?.injectionPending ?? 0) > 0 ? 'text-amber-600' : 'text-slate-800',
              )}>
                {(liq?.injectionPending ?? 0) > 0 ? formatUGX(liq!.injectionPending) : '—'}
              </div>
              <span className="text-xs text-muted">Awaiting central bank</span>
            </div>
          </>
        )}
      </motion.div>

      {/* Utilisation bar */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Utilisation</h3>
            <p className="text-xs text-muted">Proportion of total liquidity currently utilised</p>
          </div>
          <span className="text-lg font-bold" style={{ color: barColor }}>{utilPct}%</span>
        </div>

        <div className="relative h-5 bg-surface rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full rounded-full flex items-center justify-end pr-2"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${utilPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            {utilPct > 12 && (
              <span className="text-[10px] font-bold text-white">{utilPct}%</span>
            )}
          </motion.div>
          {/* threshold marker */}
          {thresholdPct > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-orange-400 opacity-70"
              style={{ left: `${thresholdPct}%` }}
            />
          )}
        </div>

        <div className="flex justify-between text-[10px] text-muted mt-1">
          <span>0%</span>
          <span className="text-orange-400">Threshold {thresholdPct}%</span>
          <span>100%</span>
        </div>

        {liq && (
          <div className="mt-2 text-xs text-muted">
            Last updated: <span className="font-medium text-slate-700">{liq.lastUpdated}</span>
          </div>
        )}
      </motion.div>

      {/* Intraday liquidity trend */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Intraday Liquidity Trend</h3>
        <p className="text-xs text-muted mb-4">Available balance throughout the day — UGX billions</p>
        {isLoading ? (
          <div className="h-48 bg-slate-50 rounded animate-pulse" />
        ) : (
          <AreaChart
            data={intradayData}
            xKey="hour"
            areas={[
              { key: 'value', color: accentColor, name: 'Available (UGX B)' },
            ]}
            height={220}
          />
        )}
      </motion.div>

      {/* Injection Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-card rounded-card shadow-xl w-full max-w-md p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Request Liquidity Injection</h2>
                    <p className="text-xs text-muted mt-0.5">Submit a request to the central bank for additional liquidity</p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 rounded hover:bg-surface transition-colors text-muted"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Injection Amount (UGX)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000000000"
                      value={injectionAmount}
                      onChange={(e) => setInjectionAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    {injectionAmount && !isNaN(Number(injectionAmount)) && Number(injectionAmount) > 0 && (
                      <p className="text-xs text-muted mt-1">
                        = {formatUGX(Number(injectionAmount))}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-surface border border-border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitInjection}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: accentColor }}
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
