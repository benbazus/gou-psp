import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../../components/ui/PageHeader'
import { AreaChart } from '../../../components/charts/AreaChart'
import { LineChart } from '../../../components/charts/LineChart'
import { useAppStore } from '../../../store/appStore'
import { formatUGX, timeAgo } from '../../../utils/format'
import {
  Wifi, WifiOff, AlertTriangle, CheckCircle2, Activity,
  Zap, Users, Clock, RefreshCw,
} from 'lucide-react'
import clsx from 'clsx'
import { TransactionDrawer } from '../../../components/ui/TransactionDrawer'
import { mockChannelHealth } from '../../../data/mockRouting'
import { mockParticipants } from '../../../data/mockParticipants'
import type { Transaction } from '../../../types'

// ─── Static data ──────────────────────────────────────────────────────────────
const SYSTEM_COMPONENTS = [
  { name: 'Payment Gateway',    status: 'healthy',  latency: 42  },
  { name: 'Routing Engine',     status: 'healthy',  latency: 18  },
  { name: 'Validation Engine',  status: 'healthy',  latency: 23  },
  { name: 'Settlement Engine',  status: 'healthy',  latency: 31  },
  { name: 'Reconciliation',     status: 'healthy',  latency: 55  },
  { name: 'Notification Svc',   status: 'degraded', latency: 280 },
  { name: 'Database (Primary)', status: 'healthy',  latency: 8   },
  { name: 'Database (Replica)', status: 'healthy',  latency: 12  },
  { name: 'Cache Layer',        status: 'healthy',  latency: 3   },
  { name: 'Message Queue',      status: 'degraded', latency: 180 },
  { name: 'Audit Logger',       status: 'healthy',  latency: 22  },
  { name: 'Webhook Dispatcher', status: 'healthy',  latency: 48  },
]

const REGIONS = [
  { name: 'Kampala',     x: 148, y: 210, volume: 18400 },
  { name: 'Wakiso',      x: 136, y: 224, volume: 9200  },
  { name: 'Mukono',      x: 166, y: 206, volume: 4100  },
  { name: 'Jinja',       x: 191, y: 193, volume: 3200  },
  { name: 'Mbarara',     x: 116, y: 285, volume: 2800  },
  { name: 'Gulu',        x: 148, y: 98,  volume: 1900  },
  { name: 'Mbale',       x: 216, y: 166, volume: 2100  },
  { name: 'Arua',        x: 80,  y: 86,  volume: 1100  },
  { name: 'Fort Portal', x: 86,  y: 208, volume: 1400  },
  { name: 'Masaka',      x: 126, y: 263, volume: 1700  },
]
const MAX_VOL = Math.max(...REGIONS.map((r) => r.volume))

const SUCCESS_FAILURE_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour:    `${String(i).padStart(2, '0')}:00`,
  success: 18000 + Math.floor(Math.random() * 4000),
  failed:  i === 9 || i === 10 ? 800 + Math.floor(Math.random() * 400) : 200 + Math.floor(Math.random() * 300),
}))

const LATENCY_DATA = Array.from({ length: 20 }, (_, i) => ({
  t:   `${String(i * 3).padStart(2, '0')}m`,
  p50: 180 + Math.floor(Math.random() * 60),
  p95: 380 + Math.floor(Math.random() * 120),
  p99: 820 + Math.floor(Math.random() * 300),
}))

const INCIDENTS = [
  { id: 'INC-001', description: 'DFCU Bank API timeout - 89 transactions in retry queue', severity: 'high',   at: new Date(Date.now() - 5 * 3600000).toISOString(),  status: 'open' },
  { id: 'INC-002', description: 'Notification service degraded - avg latency 280ms',      severity: 'medium', at: new Date(Date.now() - 2 * 3600000).toISOString(),  status: 'investigating' },
  { id: 'INC-003', description: 'Message Queue consumer lag >1000 messages',              severity: 'medium', at: new Date(Date.now() - 45 * 60000).toISOString(),  status: 'open' },
  { id: 'INC-004', description: 'Settlement batch DFCU-2026-0601-003 failed',             severity: 'high',   at: new Date(Date.now() - 18 * 3600000).toISOString(), status: 'resolved' },
]

const QUEUES = [
  { label: 'Payment Processing', value: 1247, max: 5000, color: 'bg-primary' },
  { label: 'Settlement Queue',   value: 892,  max: 2000, color: 'bg-primary' },
  { label: 'Webhook Dispatch',   value: 341,  max: 1000, color: 'bg-primary' },
  { label: 'Risk Assessment',    value: 88,   max: 500,  color: 'bg-green-500' },
  { label: 'Notification Queue', value: 2140, max: 3000, color: 'bg-warning' },
]

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_DOT: Record<string, string> = {
  healthy:  'bg-green-500',
  degraded: 'bg-yellow-400 animate-pulse',
  down:     'bg-danger animate-pulse',
}
const STATUS_TEXT: Record<string, string> = {
  healthy:  'text-green-600',
  degraded: 'text-yellow-600',
  down:     'text-danger',
}
const INC_BADGE: Record<string, string> = {
  high:   'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:    'bg-slate-100 text-slate-600 border-slate-200',
}

// ─── Live KPI strip ───────────────────────────────────────────────────────────
function LiveKpis() {
  const liveTransactions = useAppStore((s) => s.liveTransactions)
  const [tick, setTick]  = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000)
    return () => clearInterval(id)
  }, [])

  const recentCount = liveTransactions.filter(
    (tx) => Date.now() - new Date(tx.timestamp).getTime() < 60000
  ).length
  const tps         = (recentCount / 60).toFixed(1)
  const successRate = liveTransactions.length
    ? ((liveTransactions.filter((t) => t.status === 'completed').length / liveTransactions.length) * 100).toFixed(1)
    : '98.4'
  const avgLatency  = liveTransactions.length
    ? Math.round(liveTransactions.reduce((s, t) => s + t.processingTime, 0) / liveTransactions.length)
    : 342

  const healthy = SYSTEM_COMPONENTS.filter((c) => c.status === 'healthy').length

  return (
    <div className="grid grid-cols-5 gap-3 mb-5" data-tick={tick}>
      {[
        { label: 'Live TPS',         value: tps,                  unit: '/s',  color: 'text-primary',    bg: 'bg-primary/5 border-primary/20',   icon: <Zap size={15} className="text-primary" /> },
        { label: 'Success Rate',      value: successRate,          unit: '%',   color: 'text-green-700',  bg: 'bg-green-50 border-green-200',      icon: <CheckCircle2 size={15} className="text-green-600" /> },
        { label: 'Avg Latency',       value: String(avgLatency),   unit: 'ms',  color: 'text-slate-800',  bg: 'bg-surface border-border',          icon: <Clock size={15} className="text-muted" /> },
        { label: 'Healthy Services',  value: `${healthy}/${SYSTEM_COMPONENTS.length}`, unit: '', color: healthy === SYSTEM_COMPONENTS.length ? 'text-green-700' : 'text-yellow-700', bg: healthy === SYSTEM_COMPONENTS.length ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200', icon: <Activity size={15} className={healthy === SYSTEM_COMPONENTS.length ? 'text-green-600' : 'text-yellow-600'} /> },
        { label: 'Active Participants', value: String(mockParticipants.filter((p) => p.status === 'active').length), unit: '', color: 'text-primary', bg: 'bg-primary/5 border-primary/20', icon: <Users size={15} className="text-primary" /> },
      ].map(({ label, value, unit, color, bg, icon }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx('rounded-xl border p-3 flex items-center gap-3', bg)}
        >
          <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">{icon}</div>
          <div>
            <div className={clsx('text-xl font-black leading-none', color)}>
              {value}<span className="text-xs font-medium opacity-60 ml-0.5">{unit}</span>
            </div>
            <div className="text-[10px] text-muted mt-0.5">{label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Uganda map ───────────────────────────────────────────────────────────────
function UgandaMap() {
  const [hovered, setHovered] = useState<string | null>(null)
  const hoveredRegion = REGIONS.find((r) => r.name === hovered)

  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800">Regional Transaction Activity</h3>
        <span className="flex items-center gap-1 text-[10px] text-success font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
        </span>
      </div>

      <div className="relative" style={{ paddingBottom: '118%' }}>
        <svg viewBox="0 0 300 360" className="absolute inset-0 w-full h-full" fill="none">
          {/* Uganda silhouette */}
          <path
            d="M80,70 L100,50 L140,45 L180,55 L220,60 L240,90 L235,130 L240,160 L230,200 L220,240 L200,280 L170,310 L140,320 L110,305 L90,280 L75,250 L65,210 L70,170 L75,130 L72,100 Z"
            stroke="#CBD5E1" strokeWidth="1.5" fill="#F1F5F9"
          />
          {/* Lake Victoria */}
          <ellipse cx="182" cy="283" rx="26" ry="16" fill="#BFDBFE" opacity="0.7" stroke="#93C5FD" strokeWidth="1" />
          <text x="182" y="287" textAnchor="middle" fontSize="5.5" fill="#3B82F6" fontWeight="600">Lake Victoria</text>

          {REGIONS.map((r) => {
            const radius = 5 + (r.volume / MAX_VOL) * 16
            const isHov  = hovered === r.name
            return (
              <g key={r.name}
                onMouseEnter={() => setHovered(r.name)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring */}
                <motion.circle
                  cx={r.x} cy={r.y} r={radius + 3}
                  fill={isHov ? '#1B3A6B' : '#1B3A6B'}
                  fillOpacity={isHov ? 0.25 : 0.12}
                  animate={{ r: [radius + 2, radius + 8, radius + 2] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: (r.x * 0.01) % 2 }}
                />
                {/* Core dot */}
                <circle
                  cx={r.x} cy={r.y} r={isHov ? radius * 0.65 : radius * 0.5}
                  fill={isHov ? '#1B3A6B' : '#1B3A6B'}
                  fillOpacity={isHov ? 1 : 0.75}
                  style={{ transition: 'r 0.2s' }}
                />
                {/* Label */}
                <text x={r.x} y={r.y - radius - 4} textAnchor="middle" fontSize="6.5" fill="#475569" fontWeight="600">
                  {r.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredRegion && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs rounded-xl px-3 py-2 shadow-xl pointer-events-none">
            <div className="font-bold">{hoveredRegion.name}</div>
            <div className="text-white/80">{hoveredRegion.volume.toLocaleString()} txns today</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted mt-1 border-t border-border pt-2">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary/70 block" /> High volume</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/40 block" /> Lower volume</div>
        <div className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-blue-300 block" /> Lake</div>
      </div>
    </div>
  )
}

// ─── Transaction stream ───────────────────────────────────────────────────────
function TransactionStream() {
  const liveTransactions = useAppStore((s) => s.liveTransactions)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  return (
    <>
      <div className="bg-card rounded-card shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-800">Live Transaction Stream</h3>
          <span className="text-[10px] text-muted ml-auto">{liveTransactions.length} buffered</span>
        </div>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          <AnimatePresence mode="popLayout" initial={false}>
            {liveTransactions.slice(0, 18).map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedTx(tx)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors border border-transparent hover:border-primary/10"
              >
                <div className={clsx('w-2 h-2 rounded-full flex-shrink-0',
                  tx.status === 'completed' ? 'bg-green-500' :
                  tx.status === 'failed'    ? 'bg-danger animate-pulse' : 'bg-yellow-400'
                )} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted truncate">{tx.id}</span>
                    <span className="text-[10px] text-slate-700 font-medium flex-shrink-0">{tx.channel.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted">
                    <span>{tx.payer.split(' ')[0]}</span>
                    <span>→</span>
                    <span>{tx.agency}</span>
                    <span className="font-semibold text-primary ml-auto">{formatUGX(tx.amount)}</span>
                  </div>
                </div>
                <div className={clsx('flex-shrink-0 text-[10px] font-mono',
                  tx.status === 'completed' ? 'text-green-600' :
                  tx.status === 'failed'    ? 'text-danger' : 'text-yellow-600'
                )}>
                  {tx.processingTime}ms
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {liveTransactions.length === 0 && (
            <div className="py-8 text-center text-muted text-xs">
              <RefreshCw size={20} className="mx-auto mb-2 opacity-30 animate-spin" />
              Waiting for live transactions...
            </div>
          )}
        </div>
      </div>
      <TransactionDrawer transaction={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  )
}

// ─── Channel health monitor ───────────────────────────────────────────────────
function ChannelHealthMonitor() {
  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Wifi size={14} className="text-primary" /> Channel Health Monitor
      </h3>
      <div className="space-y-2">
        {mockChannelHealth.map((ch) => {
          const pct = Math.min(100, (ch.latency / 500) * 100)
          return (
            <div key={ch.participant} className="flex items-center gap-2">
              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[ch.status])} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="font-medium text-slate-800 truncate">{ch.participant.split(' ').slice(0, 2).join(' ')}</span>
                  <span className={clsx('font-mono flex-shrink-0 ml-1', ch.status === 'down' ? 'text-danger' : 'text-muted')}>
                    {ch.status === 'down' ? 'DOWN' : `${ch.latency}ms`}
                  </span>
                </div>
                {ch.status !== 'down' ? (
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-border">
                    <motion.div
                      className={clsx('h-full rounded-full',
                        ch.latency < 150 ? 'bg-green-500' : ch.latency < 300 ? 'bg-yellow-400' : 'bg-danger'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                ) : (
                  <div className="h-1.5 bg-red-100 rounded-full border border-red-200" />
                )}
              </div>
              <span className={clsx('text-[10px] font-semibold flex-shrink-0',
                ch.status === 'healthy'  ? 'text-green-600' :
                ch.status === 'degraded' ? 'text-yellow-600' : 'text-danger'
              )}>
                {ch.uptime > 0 ? `${ch.uptime}%` : '0%'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Participant health monitor ───────────────────────────────────────────────
function ParticipantHealthMonitor() {
  const active = mockParticipants.filter((p) => p.status === 'active' || p.status === 'onboarding')

  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <Users size={14} className="text-primary" /> Participant Health
        <span className="text-[10px] text-muted ml-auto">{active.length} connected</span>
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {active.slice(0, 12).map((p) => {
          const latPct = Math.min(100, (p.apiLatency / 400) * 100)
          return (
            <div key={p.id} className={clsx('rounded-xl border p-2.5 text-xs',
              p.apiHealth === 'healthy'  ? 'bg-surface border-border' :
              p.apiHealth === 'degraded' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            )}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[p.apiHealth])} />
                <span className="font-semibold text-slate-800 truncate leading-tight">{p.shortName}</span>
              </div>
              <div className="text-[10px] text-muted mb-1">{p.type.split(' ')[0]}</div>
              {p.apiHealth !== 'down' ? (
                <>
                  <div className="h-1 bg-white rounded-full overflow-hidden border border-border">
                    <div
                      className={clsx('h-full rounded-full transition-all',
                        p.apiLatency < 150 ? 'bg-green-500' : p.apiLatency < 300 ? 'bg-yellow-400' : 'bg-danger'
                      )}
                      style={{ width: `${latPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-muted mt-0.5">{p.apiLatency}ms</div>
                </>
              ) : (
                <div className="text-[10px] font-bold text-danger">OFFLINE</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Processing latency ───────────────────────────────────────────────────────
function ProcessingLatency() {
  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-0.5 flex items-center gap-2">
        <Clock size={14} className="text-primary" /> Processing Latency
      </h3>
      <p className="text-xs text-muted mb-3">P50 / P95 / P99 - last 60 minutes</p>
      <LineChart
        data={LATENCY_DATA}
        xKey="t"
        lines={[
          { key: 'p50', color: '#16A34A', name: 'P50' },
          { key: 'p95', color: '#D97706', name: 'P95' },
          { key: 'p99', color: '#D62828', name: 'P99' },
        ]}
        height={140}
      />
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: 'P50',  value: `${LATENCY_DATA[LATENCY_DATA.length - 1].p50}ms`, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'P95',  value: `${LATENCY_DATA[LATENCY_DATA.length - 1].p95}ms`, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'P99',  value: `${LATENCY_DATA[LATENCY_DATA.length - 1].p99}ms`, color: 'text-danger', bg: 'bg-red-50 border-red-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={clsx('rounded-xl border p-2 text-center', bg)}>
            <div className={clsx('text-sm font-black', color)}>{value}</div>
            <div className="text-[10px] text-muted">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Queue depths ─────────────────────────────────────────────────────────────
function QueueDepths() {
  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Queue Depths</h3>
      <div className="space-y-3">
        {QUEUES.map((q) => {
          const pct = (q.value / q.max) * 100
          const warn = pct > 70
          return (
            <div key={q.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">{q.label}</span>
                <span className={clsx('font-mono font-bold', warn ? 'text-warning' : 'text-slate-700')}>
                  {q.value.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-border">
                <motion.div
                  className={clsx('h-full rounded-full', warn ? 'bg-warning' : q.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Incidents ────────────────────────────────────────────────────────────────
function IncidentPanel() {
  const addToast = useAppStore((s) => s.addToast)
  const [incidents, setIncidents] = useState(INCIDENTS)

  function acknowledge(id: string) {
    setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, status: 'resolved' } : i))
    addToast(`Incident ${id} acknowledged`, 'info')
  }

  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
        <AlertTriangle size={13} className="text-warning" /> Incidents
        <span className="ml-auto text-[10px] bg-danger/10 text-danger border border-danger/20 rounded-full px-2 py-0.5 font-bold">
          {incidents.filter((i) => i.status !== 'resolved').length} open
        </span>
      </h3>
      <div className="space-y-2">
        {incidents.map((inc) => (
          <div key={inc.id} className={clsx(
            'rounded-xl border p-3 text-xs transition-all',
            inc.status === 'resolved' ? 'opacity-50 bg-surface border-border' :
            inc.severity === 'high'   ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
          )}>
            <div className="flex items-start gap-2">
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5', INC_BADGE[inc.severity])}>
                {inc.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 leading-snug">{inc.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted">{timeAgo(inc.at)}</span>
                  <span className="text-muted">·</span>
                  <span className={clsx('font-semibold',
                    inc.status === 'resolved' ? 'text-green-600' :
                    inc.status === 'investigating' ? 'text-yellow-600' : 'text-danger'
                  )}>{inc.status}</span>
                </div>
              </div>
              {inc.status !== 'resolved' && (
                <button
                  onClick={() => acknowledge(inc.id)}
                  className="text-[11px] text-primary font-semibold hover:underline flex-shrink-0"
                >
                  Ack
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── System component health ──────────────────────────────────────────────────
function SystemComponents() {
  const healthy  = SYSTEM_COMPONENTS.filter((c) => c.status === 'healthy').length
  const degraded = SYSTEM_COMPONENTS.filter((c) => c.status === 'degraded').length

  return (
    <div className="bg-card rounded-card shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">System Components</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500" />{healthy} Healthy</span>
          {degraded > 0 && <span className="flex items-center gap-1.5 text-yellow-600"><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />{degraded} Degraded</span>}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SYSTEM_COMPONENTS.map((comp) => (
          <div key={comp.name} className={clsx(
            'rounded-xl border p-2.5 flex items-center gap-2 transition-all',
            comp.status === 'healthy'  ? 'bg-surface border-border' :
            comp.status === 'degraded' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          )}>
            {comp.status === 'down'
              ? <WifiOff size={12} className={STATUS_TEXT[comp.status]} />
              : <Wifi size={12} className={STATUS_TEXT[comp.status]} />
            }
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-800 truncate leading-tight">{comp.name}</div>
              <div className={clsx('text-[10px] font-mono', STATUS_TEXT[comp.status])}>{comp.latency}ms</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OperationsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Real-time Operations Center"
        subtitle="Live system health, regional activity, channel status, and incident monitoring"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-success bg-success/10 border border-success/20 rounded-full px-3 py-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            All Systems Monitored
          </div>
        }
      />

      {/* ── Live KPI strip ──────────────────────────────────── */}
      <LiveKpis />

      {/* ── Row 1: Map | Stream | Channel Health ────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <UgandaMap />
        <TransactionStream />
        <div className="space-y-4">
          <ChannelHealthMonitor />
          <IncidentPanel />
        </div>
      </div>

      {/* ── Row 2: Success/Failure | Latency | Queue ─────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">24-Hour Success vs Failure Volume</h3>
          <AreaChart
            data={SUCCESS_FAILURE_DATA}
            xKey="hour"
            areas={[
              { key: 'success', color: '#16A34A', name: 'Successful' },
              { key: 'failed',  color: '#D62828', name: 'Failed' },
            ]}
            height={180}
          />
        </div>
        <div className="space-y-4">
          <ProcessingLatency />
          <QueueDepths />
        </div>
      </div>

      {/* ── Row 3: Participant Health ─────────────────────────── */}
      <ParticipantHealthMonitor />

      {/* ── Row 4: System Components ─────────────────────────── */}
      <SystemComponents />
    </div>
  )
}
