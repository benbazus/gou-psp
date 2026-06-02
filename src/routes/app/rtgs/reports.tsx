import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Filter } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { BarChart } from '../../../components/charts/BarChart'
import { AreaChart } from '../../../components/charts/AreaChart'
import { PieChart } from '../../../components/charts/PieChart'
import { useAppStore } from '../../../store/appStore'
import { formatUGX } from '../../../utils/format'
import { staggerContainer, fadeInUp } from '../../../utils/animations'
import {
  mockSettlementVolumeChart, mockBankSettlementRanking, mockIntradayLiquidityChart,
} from '../../../data/mockRtgs'
import { mockLiquidityPositions } from '../../../data/mockRtgsLiquidity'
import clsx from 'clsx'

const REPORTS = [
  { id: 'settlement_summary',    label: 'Daily Settlement Summary',      desc: 'Complete daily RTGS settlement activity' },
  { id: 'bank_ranking',          label: 'Bank Settlement Ranking',        desc: 'Ranked performance by settled value' },
  { id: 'treasury_summary',      label: 'Treasury Disbursement Summary',  desc: 'Government and treasury settlement activity' },
  { id: 'liquidity',             label: 'Liquidity Utilisation Report',   desc: 'Intraday liquidity positions and utilization' },
  { id: 'failed',                label: 'Failed Settlement Report',       desc: 'Failed, rejected, and timed-out instructions' },
  { id: 'queue_performance',     label: 'Queue Performance Report',       desc: 'Queue depth, processing times, window analysis' },
  { id: 'compliance_exception',  label: 'Compliance Exception Report',    desc: 'AML flags, compliance holds, and FATF alerts' },
  { id: 'audit_trail',           label: 'Audit Trail Report',             desc: 'Full immutable operator audit log' },
]

const EXCEPTION_TYPE_CHART = [
  { name: 'Insufficient Liquidity', value: 28 },
  { name: 'Compliance Flag',        value: 12 },
  { name: 'Settlement Timeout',     value: 18 },
  { name: 'Invalid Beneficiary',    value: 9 },
  { name: 'Treasury Mismatch',      value: 6 },
  { name: 'Duplicate Instruction',  value: 4 },
]

export default function RTGSReportsPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [activeReport, setActiveReport] = useState('settlement_summary')
  const [dateFrom, setDateFrom] = useState('2026-06-01')
  const [dateTo, setDateTo]     = useState('2026-06-02')
  const [bankFilter, setBankFilter] = useState('all')

  function handleExport(format: 'csv' | 'pdf') {
    const reportLabel = REPORTS.find((r) => r.id === activeReport)?.label ?? activeReport
    addToast(`Exporting ${reportLabel} as ${format.toUpperCase()}…`, 'info')
    setTimeout(() => addToast('Export ready — check your downloads folder (demo)', 'success'), 1200)
  }

  const BANKS = ['all', 'Stanbic Bank', 'Centenary Bank', 'DFCU Bank', 'Equity Bank', 'Absa Bank', 'Bank of Africa', 'Housing Finance']

  return (
    <div className="space-y-6">
      <PageHeader title="RTGS Reports" subtitle="Settlement reporting, analytics, and audit exports" />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-1">
          {REPORTS.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={clsx(
                'w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors',
                activeReport === r.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800',
              )}
            >
              <p className="font-semibold">{r.label}</p>
              <p className="opacity-60 mt-0.5 leading-tight">{r.desc}</p>
            </button>
          ))}
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-3">
            <Filter size={14} className="text-slate-400 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500" />
            </div>
            <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500">
              {BANKS.map((b) => <option key={b} value={b}>{b === 'all' ? 'All Banks' : b}</option>)}
            </select>
            <div className="ml-auto flex gap-2">
              <button onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors">
                <Download size={12} /> CSV
              </button>
              <button onClick={() => handleExport('pdf')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs transition-colors">
                <Download size={12} /> PDF
              </button>
            </div>
          </div>

          <motion.div key={activeReport} variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            {activeReport === 'settlement_summary' && (
              <>
                <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Daily Settlement Volume (UGX Billions)</h3>
                  <BarChart
                    data={mockSettlementVolumeChart.map((d) => ({ ...d, value: Math.round(d.value / 1_000_000_000) }))}
                    xKey="date" bars={[{ key: 'value', color: '#f59e0b', name: 'UGX Billions' }]} height={220}
                  />
                </motion.div>
                <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Date</span><span className="text-right">Volume (UGX)</span><span className="text-right">Count</span><span className="text-right">Success Rate</span>
                  </div>
                  {mockSettlementVolumeChart.map((row) => (
                    <div key={row.date} className="grid grid-cols-4 px-4 py-2.5 border-b border-slate-800 last:border-b-0 text-xs">
                      <span className="text-slate-300">{row.date}</span>
                      <span className="text-right text-white font-mono">{row.value > 0 ? formatUGX(row.value) : '—'}</span>
                      <span className="text-right text-slate-400">{row.count > 0 ? row.count : '—'}</span>
                      <span className={clsx('text-right font-semibold', row.count > 0 ? 'text-green-400' : 'text-slate-600')}>
                        {row.count > 0 ? '97.2%' : '—'}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </>
            )}

            {activeReport === 'bank_ranking' && (
              <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[40px_180px_1fr_80px_80px] px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>#</span><span>Bank</span><span>Settled Value</span><span className="text-right">Count</span><span className="text-right">Success %</span>
                </div>
                {mockBankSettlementRanking.map((b, i) => (
                  <div key={b.bank} className="grid grid-cols-[40px_180px_1fr_80px_80px] px-4 py-3 border-b border-slate-800 last:border-b-0 items-center text-xs">
                    <span className="text-slate-500">#{i + 1}</span>
                    <span className="text-white font-semibold">{b.bank}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 max-w-[160px]">
                        <motion.div className="h-full bg-amber-400 rounded-full" initial={{ width: 0 }}
                          animate={{ width: `${(b.settled / 15_000_000_000) * 100}%` }} transition={{ delay: i * 0.05 }} />
                      </div>
                      <span className="text-slate-300 font-mono">{formatUGX(b.settled)}</span>
                    </div>
                    <span className="text-right text-slate-300">{b.count}</span>
                    <span className={clsx('text-right font-bold', b.successRate >= 97 ? 'text-green-400' : b.successRate >= 92 ? 'text-amber-400' : 'text-red-400')}>
                      {b.successRate}%
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeReport === 'liquidity' && (
              <>
                <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Intraday Liquidity Utilisation (%)</h3>
                  <AreaChart data={mockIntradayLiquidityChart} xKey="time"
                    areas={[{ key: 'utilization', color: '#f59e0b', name: 'Utilisation %' }]} height={200} />
                </motion.div>
                <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[160px_1fr_1fr_1fr_80px] px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Bank</span><span className="text-right">Available</span><span className="text-right">Intraday</span><span className="text-right">Collateral</span><span className="text-right">Util %</span>
                  </div>
                  {mockLiquidityPositions.map((p) => (
                    <div key={p.bankId} className="grid grid-cols-[160px_1fr_1fr_1fr_80px] px-4 py-2.5 border-b border-slate-800 last:border-b-0 text-xs items-center">
                      <span className="text-white font-semibold">{p.bankShort}</span>
                      <span className="text-right text-slate-300 font-mono">{(p.availableLiquidity / 1_000_000_000).toFixed(1)}B</span>
                      <span className="text-right text-slate-300 font-mono">{(p.intradayLiquidity / 1_000_000_000).toFixed(1)}B</span>
                      <span className="text-right text-slate-300 font-mono">{(p.pledgedCollateral / 1_000_000_000).toFixed(1)}B</span>
                      <span className={clsx('text-right font-bold', p.riskLevel === 'low' ? 'text-green-400' : p.riskLevel === 'medium' ? 'text-amber-400' : p.riskLevel === 'high' ? 'text-orange-400' : 'text-red-400')}>
                        {p.utilizationPct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </motion.div>
              </>
            )}

            {activeReport === 'compliance_exception' && (
              <>
                <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Exception Types Distribution</h3>
                  <PieChart data={EXCEPTION_TYPE_CHART} nameKey="name" valueKey="value" height={220} />
                </motion.div>
                <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_100px_60px_80px] px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Exception Type</span><span className="text-center">Severity</span><span className="text-right">Count</span><span className="text-right">% Total</span>
                  </div>
                  {EXCEPTION_TYPE_CHART.map((row) => {
                    const total = EXCEPTION_TYPE_CHART.reduce((s, r) => s + r.value, 0)
                    return (
                      <div key={row.name} className="grid grid-cols-[1fr_100px_60px_80px] px-4 py-2.5 border-b border-slate-800 last:border-b-0 text-xs items-center">
                        <span className="text-slate-200">{row.name}</span>
                        <span className="text-center text-amber-400 text-[10px]">HIGH</span>
                        <span className="text-right text-slate-300">{row.value}</span>
                        <span className="text-right text-slate-400">{((row.value / total) * 100).toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </motion.div>
              </>
            )}

            {!['settlement_summary', 'bank_ranking', 'liquidity', 'compliance_exception'].includes(activeReport) && (
              <motion.div variants={fadeInUp} className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
                <p className="text-slate-300 font-semibold text-sm">{REPORTS.find((r) => r.id === activeReport)?.label}</p>
                <p className="text-slate-500 text-xs mt-1">Report generated for {dateFrom} to {dateTo}. Use Export buttons above to download.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
