// src/routes/app/treasury/dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowUpRight, CheckSquare, Clock, DollarSign, Building2, TrendingUp } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { BarChart } from '../../../components/charts/BarChart'
import { LineChart } from '../../../components/charts/LineChart'
import { PieChart } from '../../../components/charts/PieChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { formatUGX } from '../../../utils/format'
import { fadeInUp, staggerContainer } from '../../../utils/animations'

export default function TreasuryDashboardPage() {
  const { accentColor, tenantName } = usePortalConfig()

  const { data: disbursements = [], isLoading: dLoading } = useQuery({
    queryKey: ['treasury-disbursements'],
    queryFn: () => tenantService.getTreasuryDisbursements(),
  })
  const { data: accounts = [], isLoading: aLoading } = useQuery({
    queryKey: ['treasury-accounts'],
    queryFn: () => tenantService.getTreasuryAccounts(),
  })
  const { data: commitments = [], isLoading: cLoading } = useQuery({
    queryKey: ['treasury-commitments'],
    queryFn: () => tenantService.getTreasuryCommitments(),
  })
  const { data: fundEntries = [], isLoading: fLoading } = useQuery({
    queryKey: ['treasury-fund'],
    queryFn: () => tenantService.getTreasuryConsolidatedFund(),
  })

  const isLoading = dLoading || aLoading || cLoading || fLoading

  // KPI derivations
  const pendingApprovals = disbursements.filter((d) => d.status === 'pending_approval').length
  const completedToday   = disbursements.filter((d) => d.status === 'completed')
  const disbValueToday   = completedToday.reduce((s, d) => s + d.amount, 0)
  const ugxAccounts      = accounts.filter((a) => a.currency === 'UGX')
  const consolidatedBal  = ugxAccounts.reduce((s, a) => s + a.availableBalance, 0)
  const avgUtilisation   = commitments.length > 0
    ? Math.round(commitments.reduce((s, c) => s + c.utilizationPct, 0) / commitments.length)
    : 0

  // Charts
  const fundTrend = fundEntries.slice(-7).map((e) => ({
    date: e.date.slice(5),
    balance: Math.round(e.closingBalance / 1_000_000_000_000 * 100) / 100,
  }))

  const disbByMinistry = disbursements
    .filter((d) => d.status === 'completed')
    .reduce((acc, d) => {
      const short = d.ministryLine.replace('Ministry of ', '').slice(0, 12)
      acc[short] = (acc[short] ?? 0) + d.amount
      return acc
    }, {} as Record<string, number>)
  const disbBarData = Object.entries(disbByMinistry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([ministry, amount]) => ({ ministry, amount: Math.round(amount / 1_000_000_000) }))

  const statusBreakdown = [
    { name: 'Completed',        value: disbursements.filter((d) => d.status === 'completed').length,        color: '#22c55e' },
    { name: 'Processing',       value: disbursements.filter((d) => d.status === 'processing').length,       color: '#3b82f6' },
    { name: 'Pending Approval', value: disbursements.filter((d) => d.status === 'pending_approval').length, color: '#f59e0b' },
    { name: 'Approved',         value: disbursements.filter((d) => d.status === 'approved').length,         color: '#a855f7' },
    { name: 'Rejected',         value: disbursements.filter((d) => d.status === 'rejected').length,         color: '#ef4444' },
  ].filter((s) => s.value > 0)

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${tenantName} — Dashboard`}
        subtitle="Consolidated fund position, disbursements and commitments"
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
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        variants={staggerContainer} initial="hidden" animate="visible"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <motion.div variants={fadeInUp}>
              <KPICard title="Consolidated Fund" value={formatUGX(consolidatedBal)} subtitle="Available UGX balance" icon={<DollarSign size={16} />} accent="primary" animate={false} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Disbursements Today" value={completedToday.length} subtitle="Completed payments" icon={<ArrowUpRight size={16} />} accent="success" />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Disbursement Value" value={formatUGX(disbValueToday)} subtitle="Total today" icon={<TrendingUp size={16} />} accent="accent" animate={false} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Pending Approvals" value={pendingApprovals} subtitle="Awaiting authorisation" icon={<Clock size={16} />} accent={pendingApprovals > 5 ? 'warning' : 'muted'} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Budget Utilisation" value={`${avgUtilisation}%`} subtitle="Avg across vote codes" icon={<CheckSquare size={16} />} accent={avgUtilisation > 85 ? 'danger' : 'success'} animate={false} />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard title="Treasury Accounts" value={accounts.length} subtitle="Active accounts" icon={<Building2 size={16} />} accent="muted" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Consolidated Fund — 7-Day Trend</h3>
          <p className="text-xs text-muted mb-3">Closing balance — UGX trillions</p>
          <LineChart
            data={fundTrend}
            xKey="date"
            lines={[{ key: 'balance', color: accentColor, name: 'Balance (UGX T)' }]}
            height={200}
          />
        </div>
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Disbursement Status</h3>
          <p className="text-xs text-muted mb-3">Breakdown by current status</p>
          <PieChart data={statusBreakdown} height={200} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="bg-card rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Completed Disbursements by Ministry</h3>
        <p className="text-xs text-muted mb-3">Top 6 ministry lines — UGX billions</p>
        <BarChart
          data={disbBarData}
          xKey="ministry"
          bars={[{ key: 'amount', color: accentColor, name: 'UGX B' }]}
          height={220}
        />
      </div>
    </div>
  )
}
