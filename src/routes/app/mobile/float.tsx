// src/routes/app/mobile/float.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Droplets, X } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICardSkeleton } from '../../../components/ui/KPICard'
import { AreaChart } from '../../../components/charts/AreaChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { useAppStore } from '../../../store/appStore'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer, scaleIn } from '../../../utils/animations'
import clsx from 'clsx'

export default function MobileFloatPage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()
  const addToast = useAppStore((s) => s.addToast)
  const [modalOpen, setModalOpen] = useState(false)
  const [requestAmount, setRequestAmount] = useState('')

  const { data: float, isLoading } = useQuery({
    queryKey: ['mob-float', tenantId],
    queryFn: () => tenantService.getMobileFloat(tenantId),
  })

  const utilPct = Math.min(float?.utilizationPct ?? 0, 100)
  const barColor = utilPct > 85 ? '#ef4444' : utilPct > 70 ? '#f59e0b' : '#16a34a'

  const total = (float?.available ?? 0) + (float?.reserved ?? 0)
  const thresholdPct = total > 0 ? Math.round(((float?.threshold ?? 0) / total) * 100) : 0

  const intradayData = (float?.intraday ?? []).map((d) => ({
    hour: d.hour,
    value: Math.round(d.value / 1_000_000_000 * 10) / 10,
  }))

  function handleSubmit() {
    if (!requestAmount || isNaN(Number(requestAmount)) || Number(requestAmount) <= 0) {
      addToast('Enter a valid amount', 'error')
      return
    }
    addToast(`Float top-up request of ${formatUGX(Number(requestAmount))} submitted`, 'success')
    setModalOpen(false)
    setRequestAmount('')
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Float Management"
          subtitle={`${tenantName} — real-time float account position`}
          actions={
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              <Droplets size={14} />
              Request Top-Up
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
            {[
              { label: 'Available Float', value: formatUGX(float?.available ?? 0), cls: 'border-green-500' },
              { label: 'Reserved',        value: formatUGX(float?.reserved ?? 0),  cls: 'border-blue-400' },
              { label: 'Threshold',       value: formatUGX(float?.threshold ?? 0), cls: 'border-orange-400' },
              { label: 'Utilisation',     value: `${utilPct}%`,                     cls: utilPct > 85 ? 'border-red-500' : 'border-green-500' },
            ].map(({ label, value, cls }) => (
              <div key={label} className={clsx('bg-card rounded-card shadow-card border-l-4 p-4 flex flex-col gap-1', cls)}>
                <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
                <div className="text-xl font-bold text-slate-800">{value}</div>
              </div>
            ))}
          </>
        )}
      </motion.div>

      {/* Utilisation bar */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Float Utilisation</h3>
            <p className="text-xs text-muted">Proportion currently utilised</p>
          </div>
          <span className="text-lg font-bold" style={{ color: barColor }}>{utilPct}%</span>
        </div>
        <div className="relative h-5 bg-surface rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${utilPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          {thresholdPct > 0 && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-orange-400 opacity-70" style={{ left: `${thresholdPct}%` }} />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-muted mt-1">
          <span>0%</span>
          <span className="text-orange-400">Threshold {thresholdPct}%</span>
          <span>100%</span>
        </div>
        {float && <div className="mt-2 text-xs text-muted">Last updated: <span className="font-medium text-slate-700">{float.lastUpdated}</span></div>}
      </motion.div>

      {/* Intraday chart */}
      <motion.div variants={fadeInUp} className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Intraday Float Trend</h3>
        <p className="text-xs text-muted mb-4">Available balance throughout the day — UGX billions</p>
        {isLoading ? (
          <div className="h-48 bg-slate-50 rounded animate-pulse" />
        ) : (
          <AreaChart
            data={intradayData}
            xKey="hour"
            areas={[{ key: 'value', color: accentColor, name: 'Float (UGX B)' }]}
            height={220}
          />
        )}
      </motion.div>

      {/* Top-up modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} />
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-card shadow-xl w-full max-w-md p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Request Float Top-Up</h2>
                    <p className="text-xs text-muted mt-0.5">Submit a request to the Bank of Uganda for additional float</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-surface transition-colors text-muted">
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Top-Up Amount (UGX)</label>
                    <input
                      type="number"
                      placeholder="e.g. 10000000000"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    {requestAmount && !isNaN(Number(requestAmount)) && Number(requestAmount) > 0 && (
                      <p className="text-xs text-muted mt-1">= {formatUGX(Number(requestAmount))}</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-surface border border-border rounded-lg hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: accentColor }}>
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
