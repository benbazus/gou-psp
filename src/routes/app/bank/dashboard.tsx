import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle,
  XCircle, Droplets, Building2, CheckCircle2, Layers,
  Activity,
} from 'lucide-react'
import clsx from 'clsx'

import { PageHeader } from '../../../components/ui/PageHeader'
import { KPICard, KPICardSkeleton } from '../../../components/ui/KPICard'
import { AreaChart } from '../../../components/charts/AreaChart'
import { LineChart } from '../../../components/charts/LineChart'
import { BarChart } from '../../../components/charts/BarChart'
import { usePortalConfig } from '../../../contexts/portalConfig'
import { tenantService } from '../../../services/tenantService'
import { fadeInUp, staggerContainer } from '../../../utils/animations'
import { formatUGX } from '../../../utils/format'

// ─── Data hook ───────────────────────────────────────────────────────────────
function useBankDashboard(tenantId: string) {
  const txns        = useQuery({ queryKey: ['bank-txns', tenantId],  queryFn: () => tenantService.getBankTransactions(tenantId) })
  const liquidity   = useQuery({ queryKey: ['bank-liq', tenantId],   queryFn: () => tenantService.getBankLiquidity(tenantId) })
  const queue       = useQuery({ queryKey: ['bank-queue', tenantId], queryFn: () => tenantService.getBankQueue(tenantId) })
  const settlements = useQuery({ queryKey: ['bank-set', tenantId],   queryFn: () => tenantService.getBankSettlements(tenantId) })
  const exceptions  = useQuery({ queryKey: ['bank-exc', tenantId],   queryFn: () => tenantService.getBankExceptions(tenantId) })
  return { txns, liquidity, queue, settlements, exceptions }
}

// ─── Derived KPI values ──────────────────────────────────────────────────────
function useKpis(tenantId: string) {
  const { txns, liquidity, queue, settlements, exceptions } = useBankDashboard(tenantId)

  const txnList   = txns.data        ?? []
  const liq       = liquidity.data
  const queueList = queue.data       ?? []
  const setList   = settlements.data ?? []
  const excList   = exceptions.data  ?? []

  const totalTxns  = txnList.length
  const incomingVal = txnList.filter((t) => t.direction === 'incoming').reduce((s, t) => s + t.amount, 0)
  const outgoingVal = txnList.filter((t) => t.direction === 'outgoing').reduce((s, t) => s + t.amount, 0)

  const pendingQueue   = queueList.filter((q) => q.status === 'queued' || q.status === 'processing').length
  const failedSett     = setList.filter((s) => s.status === 'failed').length
  const liquidityAvail = liq?.available ?? 0

  const compliantSett = setList.filter((s) => s.slaStatus === 'compliant').length
  const slaCompliance = setList.length > 0 ? Math.round((compliantSett / setList.length) * 100) : 0

  const openExceptions = excList.filter((e) => e.status === 'open' || e.status === 'escalated').length

  const isLoading = txns.isLoading || liquidity.isLoading || queue.isLoading || settlements.isLoading || exceptions.isLoading

  return {
    totalTxns, incomingVal, outgoingVal,
    pendingQueue, failedSett, liquidityAvail,
    slaCompliance, openExceptions,
    isLoading, liq, txnList, queueList, setList,
  }
}

// ─── Chart data builders ─────────────────────────────────────────────────────
function buildHourlyVolume(txnList: { direction: string; amount: number; timestamp: string }[]) {
  const now = new Date()
  return Array.from({ length: 10 }, (_, i) => {
    const h = new Date(now.getTime() - (9 - i) * 3_600_000).getHours()
    const label = `${String(h).padStart(2, '0')}:00`
    const hourTxns = txnList.filter((t) => {
      const ts = new Date(t.timestamp)
      return ts.getHours() === h
    })
    return {
      hour: label,
      incoming: Math.round(hourTxns.filter((t) => t.direction === 'incoming').reduce((s, t) => s + t.amount, 0) / 1_000_000),
      outgoing: Math.round(hourTxns.filter((t) => t.direction === 'outgoing').reduce((s, t) => s + t.amount, 0) / 1_000_000),
    }
  })
}

function buildSettlementTrend(setList: { batchDate: string; netAmount: number }[]) {
  const map = new Map<string, number>()
  for (const s of setList) {
    map.set(s.batchDate, (map.get(s.batchDate) ?? 0) + s.netAmount)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, net]) => ({
      date: date.slice(5), // MM-DD
      net: Math.round(net / 1_000_000),
    }))
}

// ─── Status / priority badge helpers ─────────────────────────────────────────
const QUEUE_STATUS_CLS: Record<string, string> = {
  queued:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  settled:    'bg-green-100 text-green-700 border-green-200',
  rejected:   'bg-red-100 text-red-700 border-red-200',
  on_hold:    'bg-slate-100 text-slate-600 border-slate-200',
}

const PRIORITY_CLS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  normal: 'bg-slate-100 text-slate-600 border-slate-200',
  low:    'bg-green-50 text-green-700 border-green-200',
}

// ─── Liquidity utilisation panel ─────────────────────────────────────────────
interface LiquidityPanelProps {
  available: number
  reserved: number
  injectionPending: number
  utilizationPct: number
  threshold: number
  accentColor: string
}

function LiquidityPanel({ available, reserved, injectionPending, utilizationPct, threshold, accentColor }: LiquidityPanelProps) {
  const utilPct = Math.min(utilizationPct, 100)
  const barColor =
    utilPct > 85 ? '#ef4444' :
    utilPct > 70 ? '#f59e0b' :
    '#16a34a'

  const total = available + reserved
  const thresholdPct = total > 0 ? Math.round((threshold / total) * 100) : 0

  return (
    <div className="bg-card rounded-card shadow-card p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Liquidity Utilisation</h3>
        <p className="text-xs text-muted">Real-time RTGS account position</p>
      </div>

      {/* Main bar */}
      <div>
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>Utilised</span>
          <span className="font-semibold" style={{ color: barColor }}>{utilPct}%</span>
        </div>
        <div className="relative h-4 bg-surface rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${utilPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          {/* threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-orange-400 opacity-60"
            style={{ left: `${thresholdPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted mt-0.5">
          <span>0%</span>
          <span className="text-orange-400">Threshold {thresholdPct}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Available</div>
          <div className="text-sm font-bold text-green-700">{formatUGX(available)}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Reserved</div>
          <div className="text-sm font-bold text-blue-700">{formatUGX(reserved)}</div>
        </div>
        <div
          className="rounded-xl p-3 border"
          style={{ background: `${accentColor}10`, borderColor: `${accentColor}30` }}
        >
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Inj. Pending</div>
          <div className="text-sm font-bold" style={{ color: accentColor }}>
            {injectionPending > 0 ? formatUGX(injectionPending) : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Queue table ─────────────────────────────────────────────────────────────
interface QueueTableProps {
  entries: {
    id: string
    instructionRef: string
    amount: number
    counterparty: string
    type: 'credit' | 'debit'
    priority: 'urgent' | 'normal' | 'low'
    status: 'queued' | 'processing' | 'settled' | 'rejected' | 'on_hold'
    elapsedMinutes: number
    slaMinutes: number
  }[]
}

function QueueTable({ entries }: QueueTableProps) {
  return (
    <div className="bg-card rounded-card shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-slate-800">RTGS Queue — Recent Instructions</h3>
        <p className="text-xs text-muted">Last 8 queue entries</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Reference</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Counterparty</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Type</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Priority</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted uppercase tracking-wider">SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => {
              const slaBreached = e.elapsedMinutes > e.slaMinutes
              return (
                <tr key={e.id} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-700">{e.instructionRef}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatUGX(e.amount)}</td>
                  <td className="px-4 py-3 text-slate-700">{e.counterparty}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'inline-flex items-center gap-1 text-[10px] font-semibold',
                      e.type === 'credit' ? 'text-green-600' : 'text-red-500',
                    )}>
                      {e.type === 'credit'
                        ? <ArrowDownLeft size={11} />
                        : <ArrowUpRight size={11} />
                      }
                      {e.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full border text-[10px] font-bold',
                      PRIORITY_CLS[e.priority],
                    )}>
                      {e.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full border text-[10px] font-bold',
                      QUEUE_STATUS_CLS[e.status],
                    )}>
                      {e.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={clsx(
                      'font-mono text-[11px] font-semibold',
                      slaBreached ? 'text-red-500' : 'text-slate-600',
                    )}>
                      {e.elapsedMinutes}m / {e.slaMinutes}m
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function BankDashboardPage() {
  const { tenantId, tenantName, accentColor } = usePortalConfig()
  const {
    totalTxns, incomingVal, outgoingVal,
    pendingQueue, failedSett, liquidityAvail,
    slaCompliance, openExceptions,
    isLoading, liq, txnList, queueList, setList,
  } = useKpis(tenantId)

  // Chart data (derived inline, always-fresh)
  const hourlyData    = buildHourlyVolume(txnList)
  const settleTrend   = buildSettlementTrend(setList)
  const inOutBarData  = [
    { direction: 'Incoming', value: Math.round(incomingVal / 1_000_000) },
    { direction: 'Outgoing', value: Math.round(outgoingVal / 1_000_000) },
  ]
  const queueSlice = queueList.slice(0, 8)

  const liquidityFormatted = (() => {
    const b = liquidityAvail / 1_000_000_000
    return b >= 1 ? `UGX ${b.toFixed(1)}B` : `UGX ${Math.round(liquidityAvail / 1_000_000)}M`
  })()

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${tenantName} — Bank Dashboard`}
        subtitle="Real-time settlement, liquidity, and transaction overview"
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

      {/* ── KPI Grid (9 cards) ─────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : (
          <>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Transactions Today"
                value={totalTxns}
                subtitle="All bank transactions"
                icon={<Activity size={16} />}
                accent="primary"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Incoming Settlement"
                value={formatUGX(incomingVal)}
                subtitle="Sum of incoming transactions"
                icon={<ArrowDownLeft size={16} />}
                accent="success"
                animate={false}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Outgoing Settlement"
                value={formatUGX(outgoingVal)}
                subtitle="Sum of outgoing transactions"
                icon={<ArrowUpRight size={16} />}
                accent="accent"
                animate={false}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Pending Queue"
                value={pendingQueue}
                subtitle="Queued or processing"
                icon={<Clock size={16} />}
                accent="warning"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Failed Settlements"
                value={failedSett}
                subtitle="Require investigation"
                icon={<XCircle size={16} />}
                accent="danger"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Liquidity Available"
                value={liquidityFormatted}
                subtitle="RTGS account balance"
                icon={<Droplets size={16} />}
                accent="primary"
                animate={false}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Treasury Payments"
                value={0}
                subtitle="Government payments today"
                icon={<Building2 size={16} />}
                accent="muted"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Settlement SLA"
                value={`${slaCompliance}%`}
                subtitle="Compliant vs total batches"
                icon={<CheckCircle2 size={16} />}
                accent="success"
                animate={false}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Open Exceptions"
                value={openExceptions}
                subtitle="Open or escalated"
                icon={<AlertTriangle size={16} />}
                accent="danger"
              />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* ── Charts row 1 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Hourly Transaction Volume</h3>
          <p className="text-xs text-muted mb-3">Last 10 hours — UGX millions</p>
          <AreaChart
            data={hourlyData}
            xKey="hour"
            areas={[
              { key: 'incoming', color: '#16a34a', name: 'Incoming UGX M' },
              { key: 'outgoing', color: '#dc2626', name: 'Outgoing UGX M' },
            ]}
            height={200}
          />
        </div>

        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">7-Day Settlement Trend</h3>
          <p className="text-xs text-muted mb-3">Net settlement amount — UGX millions</p>
          <LineChart
            data={settleTrend}
            xKey="date"
            lines={[
              { key: 'net', color: accentColor, name: 'Net Amount UGX M' },
            ]}
            height={200}
          />
        </div>
      </div>

      {/* ── Charts row 2 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Incoming vs Outgoing</h3>
          <p className="text-xs text-muted mb-3">Total transaction value today — UGX millions</p>
          <BarChart
            data={inOutBarData}
            xKey="direction"
            bars={[
              { key: 'value', color: accentColor, name: 'UGX M' },
            ]}
            height={220}
          />
        </div>

        <LiquidityPanel
          available={liq?.available ?? 0}
          reserved={liq?.reserved ?? 0}
          injectionPending={liq?.injectionPending ?? 0}
          utilizationPct={liq?.utilizationPct ?? 0}
          threshold={liq?.threshold ?? 0}
          accentColor={accentColor}
        />
      </div>

      {/* ── Queue table ────────────────────────────────────────────────────── */}
      {!isLoading && queueSlice.length > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <QueueTable entries={queueSlice} />
        </motion.div>
      )}

      {/* Skeleton placeholder while loading */}
      {isLoading && (
        <div className="bg-card rounded-card shadow-card p-5 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-muted" />
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-3 flex-1 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
