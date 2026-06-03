// src/routes/app/mobile/dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Smartphone, Droplets, Banknote, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { AreaChart } from '../../../components/charts/AreaChart'
import { PieChart } from '../../../components/charts/PieChart'
import { LineChart } from '../../../components/charts/LineChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function MobileDashboardPage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()

  const { data: txns = [],        isLoading: tLoading } = useQuery({ queryKey: ['mob-txns', tenantId],  queryFn: () => tenantService.getMobileTransactions(tenantId) })
  const { data: float,            isLoading: fLoading } = useQuery({ queryKey: ['mob-float', tenantId], queryFn: () => tenantService.getMobileFloat(tenantId) })
  const { data: settlements = [], isLoading: sLoading } = useQuery({ queryKey: ['mob-set', tenantId],   queryFn: () => tenantService.getMobileSettlements(tenantId) })

  const isLoading = tLoading || fLoading || sLoading

  const totalTxns    = txns.length
  const txnValue     = txns.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const failedTxns   = txns.filter((t) => t.status === 'failed').length
  const pendingSett  = settlements.filter((s) => s.status === 'pending' || s.status === 'processing').reduce((sum, s) => sum + s.netAmount, 0)
  const compliantPct = settlements.length > 0
    ? Math.round((settlements.filter((s) => s.slaStatus === 'compliant').length / settlements.length) * 100)
    : 0

  // Hourly trend
  const now = new Date()
  const hourlyData = Array.from({ length: 10 }, (_, i) => {
    const h = new Date(now.getTime() - (9 - i) * 3_600_000).getHours()
    const hourTxns = txns.filter((t) => new Date(t.timestamp).getHours() === h && t.status === 'completed')
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      value: Math.round(hourTxns.reduce((s, t) => s + t.amount, 0) / 1_000_000),
    }
  })

  // Type breakdown for PieChart
  const byType = txns.reduce((acc, t) => { acc[t.type] = (acc[t.type] ?? 0) + 1; return acc }, {} as Record<string, number>)
  const TYPE_COLORS: Record<string, string> = { b2c: '#06b6d4', c2b: '#0891b2', p2p: '#0e7490', airtime: '#22d3ee', bill_payment: '#67e8f9' }
  const typeData = Object.entries(byType).map(([name, value]) => ({ name: name.toUpperCase(), value, color: TYPE_COLORS[name] ?? '#94a3b8' }))

  // Settlement 7-day trend
  const settleTrend = settlements.slice(0, 7).reverse().map((s, i) => ({
    day: `D-${6 - i}`,
    value: Math.round(s.netAmount / 1_000_000),
  }))

  const floatFormatted = float
    ? `UGX ${Math.round(float.available / 1_000_000_000)}B`
    : '—'

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${tenantName} — Dashboard`}
        subtitle="Transaction volumes, float position and settlement status"
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

      {/* KPIs */}
      <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" animate="visible">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <motion.div variants={fadeInUp}><KPICard title="Transactions Today" value={totalTxns} subtitle="All transaction records" icon={<Activity size={16} />} accent="primary" /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Transaction Value" value={formatUGX(txnValue)} subtitle="Completed payments" icon={<Smartphone size={16} />} accent="success" animate={false} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Float Available" value={floatFormatted} subtitle="Float account balance" icon={<Droplets size={16} />} accent="accent" animate={false} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Pending Settlement" value={formatUGX(pendingSett)} subtitle="In queue or processing" icon={<Banknote size={16} />} accent="warning" animate={false} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Failed Transactions" value={failedTxns} subtitle="Today's failures" icon={<AlertTriangle size={16} />} accent={failedTxns > 5 ? 'danger' : 'muted'} /></motion.div>
            <motion.div variants={fadeInUp}><KPICard title="Settlement SLA" value={`${compliantPct}%`} subtitle="Compliant batches" icon={<CheckCircle2 size={16} />} accent={compliantPct >= 90 ? 'success' : 'warning'} animate={false} /></motion.div>
          </>
        )}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Hourly Transaction Volume</h3>
          <p className="text-xs text-muted mb-3">Last 10 hours — UGX millions</p>
          <AreaChart data={hourlyData} xKey="hour" areas={[{ key: 'value', color: accentColor, name: 'UGX M' }]} height={200} />
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Transaction Type Breakdown</h3>
          <p className="text-xs text-muted mb-3">By transaction type</p>
          <PieChart data={typeData} height={200} />
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">7-Day Settlement Trend</h3>
        <p className="text-xs text-muted mb-3">Net settlement amount — UGX millions</p>
        <LineChart data={settleTrend} xKey="day" lines={[{ key: 'value', color: accentColor, name: 'Net UGX M' }]} height={200} />
      </div>
    </div>
  )
}
