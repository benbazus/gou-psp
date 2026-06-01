import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Activity, TrendingUp, AlertCircle, Clock,
  Users, Zap, DollarSign, CheckCircle,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../components/ui/KPICard'
import { BarChart } from '../../components/charts/BarChart'
import { PieChart } from '../../components/charts/PieChart'
import { TransactionFeed } from '../../features/dashboard/TransactionFeed'
import { AlertStrip } from '../../features/dashboard/AlertStrip'
import { transactionsApi } from '../../services/mockApi'
import { agencyRevenue, channelBreakdown } from '../../data/mockReports'
import { fadeInUp, staggerContainer } from '../../utils/animations'
import { formatUGX, formatPercent } from '../../utils/format'

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: transactionsApi.todayStats,
    refetchInterval: 30_000,
  })

  const agencyBar = agencyRevenue.slice(0, 6).map((a) => ({
    agency: a.agency,
    revenue: Math.round(a.revenue / 1_000_000_000),
  }))

  const channelPie = channelBreakdown.map((c, i) => ({
    name: c.channel,
    value: c.count,
    color: ['#1B3A6B', '#F4B000', '#16A34A', '#D62828', '#64748B'][i],
  }))

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time national payment infrastructure overview"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-success bg-success-light px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            System Operational
          </div>
        }
      />

      <AlertStrip />

      {/* KPI Row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />)
          : isError || !stats
          ? (
            <div className="col-span-4 py-8 text-center text-muted text-sm">
              Unable to load dashboard statistics. Please refresh.
            </div>
          )
          : (
            <>
              <motion.div variants={fadeInUp}>
                <KPICard title="Transactions Today" value={stats.count} subtitle="Payments processed" icon={<Activity size={16} />} accent="primary" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <KPICard title="Total Value" value={formatUGX(stats.totalValue)} subtitle="UGX processed today" icon={<DollarSign size={16} />} accent="accent" animate={false} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <KPICard title="Success Rate" value={formatPercent(stats.successRate)} subtitle="Completed transactions" icon={<CheckCircle size={16} />} accent="success" animate={false} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <KPICard title="Failed Transactions" value={stats.failedCount} subtitle="Require attention" icon={<AlertCircle size={16} />} accent="danger" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <KPICard title="Pending Settlements" value={stats.pendingSettlements} subtitle="Awaiting approval" icon={<Clock size={16} />} accent="warning" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <KPICard title="Active Participants" value={stats.activeParticipants} subtitle="Banks, MNOs & agencies" icon={<Users size={16} />} accent="primary" />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <KPICard title="System Uptime" value={`${stats.uptime}%`} subtitle="Last 30 days" icon={<TrendingUp size={16} />} accent="success" animate={false} />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <KPICard title="Avg Processing" value={`${stats.avgProcessingTime}ms`} subtitle="End-to-end latency" icon={<Zap size={16} />} accent="primary" animate={false} />
              </motion.div>
            </>
          )}
      </motion.div>

      {/* Charts + Feed */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="col-span-1">
          <TransactionFeed />
        </div>
        <div className="col-span-1 bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Channel Breakdown</h3>
          <PieChart data={channelPie} donut />
        </div>
        <div className="col-span-1 bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Agency Collections (UGX B)</h3>
          <BarChart
            data={agencyBar}
            xKey="agency"
            bars={[{ key: 'revenue', color: '#1B3A6B', name: 'Revenue (B UGX)' }]}
          />
        </div>
      </div>
    </div>
  )
}
