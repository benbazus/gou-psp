import { motion } from 'framer-motion'
import {
  TrendingUp, Clock, CheckCircle2, XCircle, ListOrdered,
  Timer, Gauge, Building2, Vault, Wifi, DollarSign,
} from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { RTGSKPICard } from '../../../features/rtgs/components/RTGSKPICard'
import { LiveSettlementFeed } from '../../../features/rtgs/components/LiveSettlementFeed'
import { BarChart } from '../../../components/charts/BarChart'
import { AreaChart } from '../../../components/charts/AreaChart'
import { staggerContainer } from '../../../utils/animations'
import { formatUGX } from '../../../utils/format'
import {
  rtgsKpi, mockBankSettlementRanking, mockSettlementVolumeChart, mockIntradayLiquidityChart,
} from '../../../data/mockRtgs'
import clsx from 'clsx'

const EXCEPTION_ALERTS = [
  { text: 'CRITICAL: Compliance flag on RTGS/2026/06/02/034 (UGX 6.8B) — AML screening', color: 'red' },
  { text: 'HIGH: DFCU Bank liquidity at 82.5% — approaching warning threshold', color: 'amber' },
  { text: 'HIGH: Settlement timeout on RTGS/2026/06/02/010 — CBU auth SLA breached', color: 'amber' },
]

export default function RTGSDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="RTGS Command Center"
        subtitle="High-Value Settlement Operations — Bank of Uganda National RTGS"
      />

      <div className="space-y-1.5">
        {EXCEPTION_ALERTS.map((a, i) => (
          <div
            key={i}
            className={clsx(
              'px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 border',
              a.color === 'red'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300',
            )}
          >
            <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', a.color === 'red' ? 'bg-red-400 animate-pulse' : 'bg-amber-400')} />
            {a.text}
          </div>
        ))}
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
      >
        <RTGSKPICard label="Total RTGS Value"       value={formatUGX(rtgsKpi.totalValueToday)}          sub="Today"           icon={TrendingUp}  accent="green"  delay={0} />
        <RTGSKPICard label="Total Transactions"     value={String(rtgsKpi.totalTransactions)}            sub="Today"           icon={ListOrdered}             delay={0.04} />
        <RTGSKPICard label="Pending Instructions"   value={String(rtgsKpi.pendingInstructions)}          sub="In queue"        icon={Clock}       accent="amber"  delay={0.08} />
        <RTGSKPICard label="Settled"                value={String(rtgsKpi.settledTransactions)}          sub="Finalized"       icon={CheckCircle2} accent="green" delay={0.12} />
        <RTGSKPICard label="Failed / Rejected"      value={String(rtgsKpi.failedTransactions)}           sub="Require action"  icon={XCircle}     accent="red"    delay={0.16} />
        <RTGSKPICard label="Queue Depth"            value={String(rtgsKpi.queueDepth)}                   sub="Waiting"         icon={ListOrdered} accent="amber"  delay={0.20} />
        <RTGSKPICard label="Avg Settlement Time"    value={`${rtgsKpi.avgSettlementTimeSecs}s`}          sub="Per transaction" icon={Timer}                       delay={0.24} />
        <RTGSKPICard label="Liquidity Utilisation"  value={`${rtgsKpi.liquidityUtilizationPct}%`}        sub="System-wide"     icon={Gauge}       accent={rtgsKpi.liquidityUtilizationPct > 80 ? 'red' : rtgsKpi.liquidityUtilizationPct > 65 ? 'amber' : 'green'} delay={0.28} />
        <RTGSKPICard label="Active Banks"           value={String(rtgsKpi.activeBanks)}                  sub="Participating"   icon={Building2}   accent="green"  delay={0.32} />
        <RTGSKPICard label="Treasury Transfers"     value={formatUGX(rtgsKpi.treasuryTransferValue)}     sub="Today"           icon={Vault}                       delay={0.36} />
        <RTGSKPICard label="System Uptime"          value={`${rtgsKpi.systemUptimePct}%`}                sub="Last 30 days"    icon={Wifi}        accent="green"  delay={0.40} />
        <RTGSKPICard label="Net Position"           value={formatUGX(rtgsKpi.netPosition)}               sub="BoU consolidated" icon={DollarSign} accent="green"  delay={0.44} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Settlement Volume — Last 7 Days (UGX Billions)</h3>
          <BarChart
            data={mockSettlementVolumeChart.map((d) => ({ ...d, value: Math.round(d.value / 1_000_000_000) }))}
            xKey="date"
            bars={[{ key: 'value', color: '#f59e0b', name: 'UGX Billions' }]}
            height={200}
          />
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">System Liquidity Utilisation — Intraday (%)</h3>
          <AreaChart
            data={mockIntradayLiquidityChart}
            xKey="time"
            areas={[{ key: 'utilization', color: '#6366f1', name: 'Utilisation %' }]}
            height={200}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Bank Settlement Performance — Today</h3>
          <div className="space-y-3">
            {mockBankSettlementRanking.map((b, i) => (
              <div key={b.bank} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-4 text-right flex-shrink-0">#{i + 1}</span>
                <span className="text-xs text-slate-300 w-28 truncate flex-shrink-0">{b.bank}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.settled / 15_000_000_000) * 100}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120, delay: i * 0.05 }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-20 text-right flex-shrink-0">
                  {(b.settled / 1_000_000_000).toFixed(1)}B UGX
                </span>
                <span className={clsx('text-xs w-12 text-right flex-shrink-0',
                  b.successRate >= 97 ? 'text-green-400' : b.successRate >= 92 ? 'text-amber-400' : 'text-red-400',
                )}>
                  {b.successRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Live Settlement Event Stream</h3>
          <LiveSettlementFeed />
        </div>
      </div>
    </div>
  )
}
