// src/routes/app/agency/dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Coins, AlertTriangle, Banknote, CheckCircle2, Clock, Activity } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { AreaChart } from '../../../components/charts/AreaChart'
import { BarChart } from '../../../components/charts/BarChart'
import { PieChart } from '../../../components/charts/PieChart'
import { LineChart } from '../../../components/charts/LineChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function AgencyDashboardPage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()

  const { data: txns = [],       isLoading: tLoading } = useQuery({ queryKey: ['agency-txns', tenantId],  queryFn: () => tenantService.getAgencyTransactions(tenantId) })
  const { data: settlements = [], isLoading: sLoading } = useQuery({ queryKey: ['agency-set', tenantId],  queryFn: () => tenantService.getAgencySettlements(tenantId) })
  const { data: exceptions = [],  isLoading: eLoading } = useQuery({ queryKey: ['agency-exc', tenantId],  queryFn: () => tenantService.getAgencyExceptions(tenantId) })

  const isLoading = tLoading || sLoading || eLoading

  const totalCollections = txns.length
  const collectionValue  = txns.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const openExceptions   = exceptions.filter((e) => e.status === 'open' || e.status === 'resolving').length
  const latestSettlement = settlements[0]
  const settlementValue  = latestSettlement?.netAmount ?? 0
  const completedSettlements = settlements.filter((s) => s.status === 'completed').length
  const matchRate = settlements.length > 0 ? Math.round((completedSettlements / settlements.length) * 100) : 0

  // Hourly collection trend (last 10 hours)
  const now = new Date()
  const hourlyData = Array.from({ length: 10 }, (_, i) => {
    const h = new Date(now.getTime() - (9 - i) * 3_600_000).getHours()
    const label = `${String(h).padStart(2, '0')}:00`
    const hourTxns = txns.filter((t) => new Date(t.timestamp).getHours() === h && t.status === 'completed')
    return { hour: label, value: Math.round(hourTxns.reduce((s, t) => s + t.amount, 0) / 1_000_000) }
  })

  // Collections by service
  const bySvc = txns.filter((t) => t.status === 'completed').reduce((acc, t) => {
    acc[t.serviceName] = (acc[t.serviceName] ?? 0) + t.amount
    return acc
  }, {} as Record<string, number>)
  const serviceData = Object.entries(bySvc)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([service, amount]) => ({ service, amount: Math.round(amount / 1_000_000) }))

  // Channel breakdown for PieChart
  const byChannel = txns.reduce((acc, t) => {
    acc[t.channel] = (acc[t.channel] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const channelData = Object.entries(byChannel).map(([name, value], i) => ({
    name, value,
    color: ['#f97316', '#fb923c', '#fdba74', '#94a3b8', '#cbd5e1'][i % 5],
  }))

  // 7-day trend from settlements
  const settleTrend = settlements.slice(0, 7).reverse().map((s, i) => ({
    day: `D-${6 - i}`,
    value: Math.round(s.netAmount / 1_000_000),
  }))

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${tenantName} — Dashboard`}
        subtitle="Collections, settlement status and exception overview"
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
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <motion.div variants={fadeInUp}><KPICard title="Total Collections" value={totalCollections} subtitle="All payment records" icon={<Activity size={16} />} accent="primary" /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Collection Value" value={formatUGX(collectionValue)} subtitle="Completed payments" icon={<Coins size={16} />} accent="success" animate={false} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Open Exceptions" value={openExceptions} subtitle="Require resolution" icon={<AlertTriangle size={16} />} accent={openExceptions > 2 ? 'danger' : 'muted'} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Settlement Value" value={formatUGX(settlementValue)} subtitle="Latest batch net" icon={<Banknote size={16} />} accent="accent" animate={false} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Match Rate" value={`${matchRate}%`} subtitle="Completed vs total batches" icon={<CheckCircle2 size={16} />} accent={matchRate >= 90 ? 'success' : 'warning'} animate={false} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Pending Payments" value={txns.filter((t) => t.status === 'pending').length} subtitle="Awaiting confirmation" icon={<Clock size={16} />} accent="warning" /></motion.div>
          </>
        )}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Hourly Collection Volume</h3>
          <p className="text-xs text-muted mb-3">Last 10 hours — UGX millions</p>
          <AreaChart data={hourlyData} xKey="hour" areas={[{ key: 'value', color: accentColor, name: 'UGX M' }]} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Collections by Service</h3>
          <p className="text-xs text-muted mb-3">Top 5 services — UGX millions</p>
          <BarChart data={serviceData} xKey="service" bars={[{ key: 'amount', color: accentColor, name: 'UGX M' }]} height={200} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Channel Breakdown</h3>
          <p className="text-xs text-muted mb-3">Transaction count by channel</p>
          <PieChart data={channelData} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">7-Day Settlement Trend</h3>
          <p className="text-xs text-muted mb-3">Net settlement amount — UGX millions</p>
          <LineChart data={settleTrend} xKey="day" lines={[{ key: 'value', color: accentColor, name: 'Net UGX M' }]} height={200} />
        </div>
      </div>
    </div>
  )
}
