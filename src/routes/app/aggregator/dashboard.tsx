// src/routes/app/aggregator/dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ShoppingBag, Users, TrendingUp, Activity, Banknote } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard } from '../../../components/ui/KPICard'
import { AreaChart } from '../../../components/charts/AreaChart'
import { BarChart } from '../../../components/charts/BarChart'
import { PieChart } from '../../../components/charts/PieChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AggregatorDashboardPage() {
  const { tenantId, accentColor } = usePortalConfig()

  const { data: txns = [] } = useQuery({
    queryKey: ['agg-txns', tenantId],
    queryFn: () => tenantService.getAggregatorTransactions(tenantId),
  })
  const { data: merchants = [] } = useQuery({
    queryKey: ['agg-merchants', tenantId],
    queryFn: () => tenantService.getAggregatorMerchants(tenantId),
  })
  const { data: settlements = [] } = useQuery({
    queryKey: ['agg-settlements', tenantId],
    queryFn: () => tenantService.getAggregatorSettlements(tenantId),
  })

  const completed         = txns.filter((t) => t.status === 'completed')
  const totalVolume       = completed.reduce((s, t) => s + t.amount, 0)
  const totalFees         = completed.reduce((s, t) => s + t.fee, 0)
  const activeMerchants   = merchants.filter((m) => m.status === 'active').length
  const pendingSettlements = settlements.filter((s) => s.status === 'pending' || s.status === 'processing').length

  // 7-day volume trend
  const volumeData = Array.from({ length: 7 }, (_, i) => ({
    day: `D-${6 - i}`,
    value: Math.round(txns.filter((_, ti) => ti % 7 === i).reduce((s, t) => s + t.amount, 0) / 1_000_000),
  }))

  // Top 5 merchants by daily volume
  const topMerchants = [...merchants]
    .sort((a, b) => b.dailyVolume - a.dailyVolume)
    .slice(0, 5)
    .map((m) => ({ name: m.name.split(' ')[0], value: Math.round(m.dailyVolume / 1_000_000) }))

  // Transaction type breakdown
  const typeCounts = txns.reduce<Record<string, number>>((acc, t) => {
    const label = t.type.replace('_', ' ')
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})
  const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b']
  const pieData = Object.entries(typeCounts).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle="Aggregator platform overview — volume, merchants, and settlement health"
        actions={
          <div
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
            style={{ background: `${accentColor}12`, borderColor: `${accentColor}30`, color: accentColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
            Live
          </div>
        }
      />

      {/* KPI Grid */}
      <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={fadeInUp}>
          <KPICard title="Total Merchants" value={merchants.length} subtitle="All registered merchants" icon={<ShoppingBag size={16} />} accent="primary" />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Active Merchants" value={activeMerchants} subtitle="Currently transacting" icon={<Users size={16} />} accent="success" />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Today's Volume" value={formatUGX(totalVolume)} subtitle="Completed payments" icon={<TrendingUp size={16} />} accent="accent" animate={false} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Transactions Today" value={completed.length} subtitle="Successful completions" icon={<Activity size={16} />} accent="warning" />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Gross Revenue (Fees)" value={formatUGX(totalFees)} subtitle="Aggregator fee income" icon={<Banknote size={16} />} accent="muted" animate={false} />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <KPICard title="Pending Settlements" value={pendingSettlements} subtitle="Pending or processing" icon={<Banknote size={16} />} accent={pendingSettlements > 5 ? 'danger' : 'muted'} />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">7-Day Volume Trend</h3>
          <p className="text-xs text-muted mb-3">Transaction volume — UGX millions</p>
          <AreaChart data={volumeData} xKey="day" areas={[{ key: 'value', color: accentColor, name: 'UGX M' }]} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Top 5 Merchants by Volume</h3>
          <p className="text-xs text-muted mb-3">Daily volume — UGX millions</p>
          <BarChart data={topMerchants} xKey="name" bars={[{ key: 'value', color: accentColor, name: 'UGX M' }]} height={200} />
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card p-5 max-w-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Transaction Type Breakdown</h3>
        <p className="text-xs text-muted mb-3">Count by payment channel type</p>
        <PieChart data={pieData} height={220} />
      </div>
    </div>
  )
}
