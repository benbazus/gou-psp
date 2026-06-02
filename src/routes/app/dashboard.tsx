import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, TrendingUp, AlertCircle, Clock,
  Users, Zap, DollarSign, CheckCircle,
  Banknote, Shield, Wifi, Database, Server, RefreshCw,
  Timer,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../components/ui/KPICard'
import { ErrorState } from '../../components/ui/ErrorState'
import { BarChart } from '../../components/charts/BarChart'
import { PieChart } from '../../components/charts/PieChart'
import { TransactionFeed } from '../../features/dashboard/TransactionFeed'
import { AlertStrip } from '../../features/dashboard/AlertStrip'
import { transactionsApi } from '../../services/mockApi'
import { agencyRevenue, channelBreakdown } from '../../data/mockReports'
import { mockSettlementBatches, mockSettlementAccounts } from '../../data/mockSettlements'
import { fadeInUp, staggerContainer } from '../../utils/animations'
import { formatUGX } from '../../utils/format'
import { useAppStore } from '../../store/appStore'
import clsx from 'clsx'

// ─── Settlement countdown ─────────────────────────────────────────────────────
function useSettlementCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    function calc() {
      const now  = new Date()
      const eod  = new Date()
      eod.setHours(23, 0, 0, 0)
      if (eod <= now) eod.setDate(eod.getDate() + 1)
      setSecondsLeft(Math.max(0, Math.floor((eod.getTime() - now.getTime()) / 1000)))
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  const s = secondsLeft % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── System component health ──────────────────────────────────────────────────
const COMPONENTS = [
  { name: 'API Gateway',         status: 'operational' as const, latency: '12ms',  icon: Wifi },
  { name: 'Transaction Switch',  status: 'operational' as const, latency: '8ms',   icon: RefreshCw },
  { name: 'Risk Engine',         status: 'operational' as const, latency: '44ms',  icon: Shield },
  { name: 'Settlement Engine',   status: 'operational' as const, latency: '21ms',  icon: Banknote },
  { name: 'PostgreSQL',          status: 'operational' as const, latency: '3ms',   icon: Database },
  { name: 'Apache Kafka',        status: 'degraded' as const,    latency: '180ms', icon: Server },
]

const STATUS_DOT: Record<string, string> = {
  operational: 'bg-green-500',
  degraded:    'bg-yellow-400 animate-pulse',
  down:        'bg-danger animate-pulse',
}

function SystemHealth() {
  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">System Components</h3>
        <span className="flex items-center gap-1.5 text-xs text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          5/6 Operational
        </span>
      </div>
      <div className="space-y-2">
        {COMPONENTS.map(({ name, status, latency, icon: Icon }) => (
          <div key={name} className="flex items-center gap-2.5">
            <Icon size={13} className="text-muted flex-shrink-0" />
            <span className="text-xs text-slate-700 flex-1">{name}</span>
            <span className="text-[10px] font-mono text-muted">{latency}</span>
            <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[status])} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Treasury settlement status ───────────────────────────────────────────────
function TreasuryStatus() {
  const countdown = useSettlementCountdown()

  const pending    = mockSettlementBatches.filter((b) => b.status === 'pending').length
  const processing = mockSettlementBatches.filter((b) => b.status === 'processing').length
  const completed  = mockSettlementBatches.filter((b) => b.status === 'completed').length
  const failed     = mockSettlementBatches.filter((b) => b.status === 'failed' || b.status === 'rejected').length

  const treasury    = mockSettlementAccounts.find((a) => a.type === 'Treasury')
  const totalGross  = mockSettlementBatches.reduce((s, b) => s + b.grossAmount, 0)
  const totalNet    = mockSettlementBatches.reduce((s, b) => s + b.netAmount,   0)

  const doneCount   = completed
  const totalCount  = mockSettlementBatches.length
  const progress    = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

  return (
    <div className="bg-card rounded-card shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Treasury Settlement Status</h3>
          <p className="text-xs text-muted">End-of-day settlement window — 23:00 EAT cutoff</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
          <Timer size={14} className="text-primary" />
          <span className="font-mono text-sm font-bold text-primary">{countdown}</span>
          <span className="text-xs text-muted">to cutoff</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Pending',    value: pending,    color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Processing', value: processing, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Completed',  value: completed,  color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Failed',     value: failed,     color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className={clsx('rounded-xl border p-3 text-center', color)}>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-xs font-medium opacity-80 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>Settlement progress</span>
          <span>{doneCount} / {totalCount} batches settled</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Positions + treasury row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Gross Settlement</div>
          <div className="text-sm font-bold text-slate-800">{formatUGX(totalGross)}</div>
        </div>
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Net Position</div>
          <div className="text-sm font-bold text-primary">{formatUGX(totalNet)}</div>
        </div>
        {treasury && (
          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Treasury Balance</div>
            <div className="text-sm font-bold text-green-700">{formatUGX(treasury.balance)}</div>
            {treasury.pendingInflow > 0 && (
              <div className="text-[10px] text-green-600 mt-0.5">+{formatUGX(treasury.pendingInflow)} inflow</div>
            )}
          </div>
        )}
      </div>

      {/* Latest batches */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Recent Batches</div>
        <div className="space-y-1.5">
          {mockSettlementBatches.slice(0, 4).map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs">
              <span className="font-mono text-muted text-[11px]">{b.id}</span>
              <span className="text-slate-700 font-medium">{b.participant}</span>
              <span className="text-primary font-semibold">{formatUGX(b.netAmount)}</span>
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                b.status === 'completed'  && 'bg-green-100 text-green-700 border-green-200',
                b.status === 'pending'    && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                b.status === 'processing' && 'bg-blue-100 text-blue-700 border-blue-200',
                b.status === 'failed'     && 'bg-red-100 text-red-700 border-red-200',
              )}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Live ticker row (increments with store) ──────────────────────────────────
function LiveKpiRow({ stats }: { stats: { count: number; totalValue: number; successRate: number; failedCount: number; pendingSettlements: number; activeParticipants: number; uptime: number; avgProcessingTime: number } }) {
  const liveTransactions = useAppStore((s) => s.liveTransactions)
  const [baseCount]      = useState(stats.count)
  const [baseFailed]     = useState(stats.failedCount)
  const [baseValue]      = useState(stats.totalValue)

  // Live delta: each completed live txn adds to total, failed ones add to failedCount
  const liveCompleted = liveTransactions.filter((t) => t.status === 'completed').length
  const liveFailed    = liveTransactions.filter((t) => t.status === 'failed').length
  const liveValue     = liveTransactions.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amount, 0)

  const liveCount    = baseCount + liveCompleted
  const totalFailed  = baseFailed + liveFailed
  const totalValue   = baseValue + liveValue
  const successRate  = (liveCount / (liveCount + totalFailed)) * 100

  return (
    <>
      <motion.div variants={fadeInUp}>
        <KPICard
          title="Transactions Today"
          value={liveCount}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              +{liveCompleted} live
            </span>
          }
          icon={<Activity size={16} />}
          accent="primary"
        />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <KPICard title="Total Value" value={formatUGX(totalValue)} subtitle="UGX processed today" icon={<DollarSign size={16} />} accent="accent" animate={false} />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <KPICard title="Success Rate" value={`${successRate.toFixed(1)}%`} subtitle="Completed transactions" icon={<CheckCircle size={16} />} accent="success" animate={false} />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <KPICard
          title="Failed Transactions"
          value={totalFailed}
          subtitle={liveFailed > 0 ? `+${liveFailed} since load` : 'Require attention'}
          icon={<AlertCircle size={16} />}
          accent="danger"
        />
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
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
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
    name:  c.channel,
    value: c.count,
    color: ['#1B3A6B', '#F4B000', '#16A34A', '#D62828', '#64748B'][i],
  }))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time national payment infrastructure overview"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-success bg-success-light px-3 py-1.5 rounded-full border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            System Operational
          </div>
        }
      />

      <AlertStrip />

      {/* ── KPI row ─────────────────────────────────────────── */}
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
            <div className="col-span-4">
              <ErrorState kind="network" message="Unable to load dashboard statistics. Check your connection and try again." compact onRetry={() => window.location.reload()} />
            </div>
          )
          : <LiveKpiRow stats={stats} />
        }
      </motion.div>

      {/* ── Charts + feed row ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <TransactionFeed />

        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Payment Channel Breakdown</h3>
          <p className="text-xs text-muted mb-3">Transaction count by channel today</p>
          <PieChart data={channelPie} donut />
          <div className="mt-3 space-y-1.5">
            {channelBreakdown.map((c, i) => (
              <div key={c.channel} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: channelPie[i]?.color }} />
                <span className="text-slate-700 flex-1 truncate">{c.channel}</span>
                <span className="font-semibold text-slate-800">{(c.count / 1000).toFixed(0)}K</span>
                <span className="text-muted">{formatUGX(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Agency Collections</h3>
          <p className="text-xs text-muted mb-3">UGX billions collected this month</p>
          <BarChart
            data={agencyBar}
            xKey="agency"
            bars={[{ key: 'revenue', color: '#1B3A6B', name: 'Revenue (B UGX)' }]}
          />
        </div>
      </div>

      {/* ── Treasury settlement + system health ─────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <TreasuryStatus />
        </div>
        <SystemHealth />
      </div>
    </div>
  )
}
