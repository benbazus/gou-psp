import { useQuery } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { PageHeader } from '../../../components/ui/PageHeader'
import { routingApi } from '../../../services/mockApi'
import { useAppStore } from '../../../store/appStore'
import { formatUGX } from '../../../utils/format'
import {
  WifiOff, Play, RotateCcw,
  CheckCircle2, XCircle, ChevronDown, ArrowRight,
  Zap, GitBranch, RefreshCw,
} from 'lucide-react'
import {
  channelDailyVolume,
  txnPriorityLevels, fallbackConfig,
} from '../../../data/mockRouting'
import clsx from 'clsx'
import type { ChannelHealth } from '../../../types'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type ChannelRouteState = 'idle' | 'evaluating' | 'selected' | 'success' | 'failed' | 'skipped'
type Scenario = 'primary_success' | 'fallback' | 'all_failed' | 'reroute'

interface RouteChannel {
  id: string
  label: string
  participant: string
  priority: number
  state: ChannelRouteState
  latency?: number
  note?: string
}

// â”€â”€â”€ Scenario definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SCENARIOS: { id: Scenario; label: string; desc: string; color: string }[] = [
  { id: 'primary_success', label: 'Primary Success',  desc: 'Payment routed via primary channel',          color: 'text-green-700 bg-green-50 border-green-200' },
  { id: 'fallback',        label: 'Fallback',         desc: 'Primary fails â€” routed via backup',           color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { id: 'all_failed',      label: 'All Failed',       desc: 'All channels fail â€” payment abandoned',        color: 'text-danger bg-red-50 border-red-200' },
  { id: 'reroute',         label: 'Reroute',          desc: 'Degraded channel detected and skipped',        color: 'text-purple-700 bg-purple-50 border-purple-200' },
]

const BASE_CHANNELS: Omit<RouteChannel, 'state'>[] = [
  { id: 'mtn',    label: 'MTN Mobile Money', participant: 'MTN Mobile Money Uganda', priority: 1, latency: 78 },
  { id: 'airtel', label: 'Airtel Money',     participant: 'Airtel Money Uganda',     priority: 2, latency: 83 },
  { id: 'stanbic', label: 'Stanbic Bank',   participant: 'Stanbic Bank Uganda',     priority: 3, latency: 92 },
]

function blankChannels(): RouteChannel[] {
  return BASE_CHANNELS.map((c) => ({ ...c, state: 'idle' }))
}

// â”€â”€â”€ Animated Routing Diagram â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATE_NODE: Record<ChannelRouteState, { ring: string; label: string; icon?: React.ElementType }> = {
  idle:       { ring: 'border-border bg-surface text-muted',                         label: 'Idle' },
  evaluating: { ring: 'border-primary bg-primary/5 text-primary',                    label: 'Evaluatingâ€¦' },
  selected:   { ring: 'border-primary bg-primary text-white shadow-lg shadow-primary/30', label: 'Selected' },
  success:    { ring: 'border-green-500 bg-green-500 text-white shadow-green-200',   label: 'Success', icon: CheckCircle2 },
  failed:     { ring: 'border-danger bg-danger text-white shadow-red-200',           label: 'Failed', icon: XCircle },
  skipped:    { ring: 'border-border bg-surface text-muted opacity-40',              label: 'Skipped' },
}

const CONNECTOR_COLOR: Record<ChannelRouteState, string> = {
  idle:       'bg-border',
  evaluating: 'bg-primary',
  selected:   'bg-primary',
  success:    'bg-green-500',
  failed:     'bg-danger',
  skipped:    'bg-border opacity-30',
}

function RoutingDiagram({
  channels, switchState, outcome,
}: {
  channels: RouteChannel[]
  switchState: 'idle' | 'active' | 'done'
  outcome: 'none' | 'success' | 'failed'
}) {
  const successIdx = channels.findIndex((c) => c.state === 'success')

  return (
    <div className="flex flex-col items-center gap-0 w-full select-none">
      {/* Payer */}
      <div className="bg-surface border-2 border-border rounded-2xl px-5 py-3 text-center w-56 z-10">
        <div className="text-xs font-bold text-slate-800">Citizen / Business</div>
        <div className="text-[10px] text-muted">Initiates payment</div>
      </div>

      {/* Connector payer â†’ switch */}
      <AnimatedConnector active={switchState !== 'idle'} state={switchState !== 'idle' ? (outcome === 'success' ? 'success' : 'selected') : 'idle'} />

      {/* GovPay Switch */}
      <motion.div
        animate={switchState === 'active' ? {
          boxShadow: ['0 0 0 0 rgba(27,58,107,0)', '0 0 0 12px rgba(27,58,107,0.15)', '0 0 0 0 rgba(27,58,107,0)'],
        } : {}}
        transition={switchState === 'active' ? { repeat: Infinity, duration: 1.4 } : {}}
        className={clsx(
          'border-2 rounded-2xl px-5 py-3 text-center w-64 transition-all duration-300 z-10',
          switchState === 'idle' ? 'border-border bg-surface text-muted' :
          switchState === 'done' && outcome === 'success' ? 'border-green-500 bg-green-50 text-green-700' :
          switchState === 'done' && outcome === 'failed'  ? 'border-danger bg-red-50 text-danger' :
          'border-primary bg-primary text-white shadow-xl shadow-primary/20',
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-0.5">
          {switchState === 'active' && <RefreshCw size={13} className="animate-spin" />}
          <span className="text-xs font-bold">GovPay Switch</span>
        </div>
        <div className="text-[10px] opacity-70">Routing Engine</div>
      </motion.div>

      {/* Fan-out to 3 channels */}
      <div className="flex gap-3 mt-2 items-start">
        {channels.map((ch, i) => {
          const style = STATE_NODE[ch.state]
          const Icon  = style.icon
          const isActive = ch.state === 'selected' || ch.state === 'evaluating'

          return (
            <div key={ch.id} className="flex flex-col items-center">
              {/* Top connector from switch */}
              <div className="relative h-6 w-0.5 bg-border overflow-hidden rounded-full">
                <AnimatePresence>
                  {ch.state !== 'idle' && ch.state !== 'skipped' && (
                    <motion.div
                      key={ch.state}
                      className={clsx('absolute inset-x-0 top-0 rounded-full', CONNECTOR_COLOR[ch.state])}
                      initial={{ height: '0%' }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.35 }}
                    />
                  )}
                </AnimatePresence>
                {/* Travelling dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 -ml-0.5 rounded-full bg-primary shadow shadow-primary/50"
                      initial={{ top: '-4px', opacity: 0 }}
                      animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Priority badge */}
              <div className="text-[9px] font-bold text-muted mb-1 uppercase tracking-wider">
                {i === 0 ? 'Primary' : i === 1 ? 'Backup' : 'Last Resort'}
              </div>

              {/* Channel node */}
              <motion.div
                animate={isActive ? {
                  scale: [1, 1.04, 1],
                } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
                className={clsx(
                  'border-2 rounded-xl px-4 py-3 text-center w-40 transition-all duration-300',
                  style.ring,
                )}
              >
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  {Icon && <Icon size={13} />}
                  <span className="text-[11px] font-bold leading-tight">{ch.label}</span>
                </div>
                <div className="text-[9px] opacity-70">{ch.note ?? style.label}</div>
                {ch.latency && ch.state !== 'idle' && ch.state !== 'skipped' && (
                  <div className="text-[9px] mt-0.5 font-mono opacity-60">{ch.latency}ms</div>
                )}
              </motion.div>

              {/* Bottom connector to confirmation (only for success) */}
              <div className="relative h-6 w-0.5 bg-border overflow-hidden rounded-full">
                <AnimatePresence>
                  {ch.state === 'success' && (
                    <motion.div
                      className="absolute inset-x-0 top-0 bg-green-500 rounded-full"
                      initial={{ height: '0%' }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>

      {/* Converge to Confirmation */}
      <div className={clsx(
        'border-2 rounded-2xl px-5 py-3 text-center w-56 transition-all duration-500 z-10',
        successIdx >= 0 ? 'border-green-500 bg-green-50 text-green-700 shadow-md' :
        outcome === 'failed' ? 'border-danger bg-red-50 text-danger' :
        'border-border bg-surface text-muted',
      )}>
        {outcome === 'failed' ? (
          <>
            <div className="text-xs font-bold flex items-center justify-center gap-1.5"><XCircle size={13} /> Payment Abandoned</div>
            <div className="text-[10px] opacity-70">All channels failed</div>
          </>
        ) : successIdx >= 0 ? (
          <>
            <div className="text-xs font-bold flex items-center justify-center gap-1.5"><CheckCircle2 size={13} /> Confirmation</div>
            <div className="text-[10px] opacity-70">via {channels[successIdx]?.label}</div>
          </>
        ) : (
          <>
            <div className="text-xs font-bold">Confirmation</div>
            <div className="text-[10px] opacity-70">Awaiting channel response</div>
          </>
        )}
      </div>

      {successIdx >= 0 && (
        <>
          <AnimatedConnector active state="success" />
          <div className="border-2 border-green-500 bg-green-500 text-white rounded-2xl px-5 py-3 text-center w-56 shadow-lg shadow-green-200 z-10">
            <div className="text-xs font-bold">Government Agency</div>
            <div className="text-[10px] opacity-80">PRN marked PAID</div>
          </div>
        </>
      )}
    </div>
  )
}

function AnimatedConnector({ active, state }: { active: boolean; state: ChannelRouteState }) {
  return (
    <div className="relative h-8 w-0.5 bg-border overflow-hidden my-0.5 rounded-full">
      <AnimatePresence>
        {active && (
          <motion.div
            key={state}
            className={clsx('absolute inset-x-0 top-0 rounded-full', CONNECTOR_COLOR[state])}
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (state === 'selected' || state === 'evaluating') && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 -ml-0.5 rounded-full bg-primary shadow shadow-primary/50"
            initial={{ top: '-4px', opacity: 0 }}
            animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// â”€â”€â”€ Channel Health Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HealthGrid() {
  const { data: health = [] } = useQuery({
    queryKey: ['channel-health'],
    queryFn: routingApi.listChannelHealth,
  })

  const statusStyle: Record<ChannelHealth['status'], { dot: string; badge: string }> = {
    healthy:  { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200' },
    degraded: { dot: 'bg-yellow-400 animate-pulse', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    down:     { dot: 'bg-danger animate-pulse',      badge: 'bg-red-100 text-red-700 border-red-200' },
  }

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {health.map((h) => {
        const vol = channelDailyVolume[h.participant]
        const style = statusStyle[h.status]
        const latencyPct = Math.min(100, (h.latency / 500) * 100)

        return (
          <motion.div
            key={h.participant}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              'bg-card rounded-xl border shadow-sm p-4 transition-all',
              h.status === 'down' ? 'border-danger/30' :
              h.status === 'degraded' ? 'border-yellow-300' : 'border-border',
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 leading-tight truncate">{h.participant}</div>
                <div className="text-[10px] text-muted mt-0.5">{h.channel}</div>
              </div>
              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1 ml-2', style.dot)} />
            </div>

            {/* Status badge */}
            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', style.badge)}>
              {h.status}
            </span>

            {/* Latency */}
            {h.status !== 'down' ? (
              <div className="mt-2.5">
                <div className="flex justify-between text-[10px] text-muted mb-1">
                  <span>Latency</span>
                  <span className="font-mono font-semibold text-slate-700">{h.latency}ms</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-border">
                  <motion.div
                    className={clsx('h-full rounded-full', h.latency < 150 ? 'bg-green-500' : h.latency < 300 ? 'bg-yellow-400' : 'bg-danger')}
                    initial={{ width: 0 }}
                    animate={{ width: `${latencyPct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2.5 text-[10px] text-danger font-medium flex items-center gap-1">
                <WifiOff size={11} /> Unreachable
              </div>
            )}

            {/* Uptime */}
            <div className="flex justify-between text-[10px] mt-2">
              <span className="text-muted">Uptime</span>
              <span className={clsx('font-bold font-mono', h.uptime >= 99.5 ? 'text-green-600' : h.uptime >= 95 ? 'text-yellow-600' : 'text-danger')}>
                {h.uptime > 0 ? `${h.uptime}%` : 'N/A'}
              </span>
            </div>

            {/* Daily volume */}
            {vol && vol.count > 0 && (
              <div className="flex justify-between text-[10px] mt-1">
                <span className="text-muted">Today</span>
                <span className="text-slate-700 font-medium">{(vol.count / 1000).toFixed(0)}K txns</span>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// â”€â”€â”€ Routing animation controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SCENARIO_FRAMES: Record<Scenario, { channels: Partial<RouteChannel>[]; delay: number }[]> = {
  primary_success: [
    { channels: [{ id: 'mtn', state: 'evaluating', note: 'Evaluatingâ€¦' }], delay: 600 },
    { channels: [{ id: 'mtn', state: 'selected',   note: 'Selected â€” priority 1' }], delay: 700 },
    { channels: [{ id: 'mtn', state: 'success',    note: 'Confirmed âœ“' }], delay: 0 },
  ],
  fallback: [
    { channels: [{ id: 'mtn',    state: 'evaluating', note: 'Evaluatingâ€¦' }], delay: 600 },
    { channels: [{ id: 'mtn',    state: 'selected',   note: 'Attemptingâ€¦' }], delay: 700 },
    { channels: [{ id: 'mtn',    state: 'failed',     note: 'API timeout 5s' }], delay: 500 },
    { channels: [{ id: 'airtel', state: 'evaluating', note: 'Fallback selected' }], delay: 600 },
    { channels: [{ id: 'airtel', state: 'selected',   note: 'Attemptingâ€¦' }], delay: 700 },
    { channels: [{ id: 'airtel', state: 'success',    note: 'Confirmed âœ“' }], delay: 0 },
  ],
  all_failed: [
    { channels: [{ id: 'mtn',     state: 'evaluating', note: 'Evaluatingâ€¦' }], delay: 500 },
    { channels: [{ id: 'mtn',     state: 'failed',     note: 'Timeout' }], delay: 400 },
    { channels: [{ id: 'airtel',  state: 'evaluating', note: 'Fallbackâ€¦' }], delay: 500 },
    { channels: [{ id: 'airtel',  state: 'failed',     note: 'Error 503' }], delay: 400 },
    { channels: [{ id: 'stanbic', state: 'evaluating', note: 'Last resortâ€¦' }], delay: 500 },
    { channels: [{ id: 'stanbic', state: 'failed',     note: 'No response' }], delay: 0 },
  ],
  reroute: [
    { channels: [{ id: 'mtn',    state: 'evaluating', note: 'Checking healthâ€¦' }], delay: 600 },
    { channels: [{ id: 'mtn',    state: 'skipped',    note: 'DEGRADED â€” skipped' }], delay: 400 },
    { channels: [{ id: 'airtel', state: 'evaluating', note: 'Reroutingâ€¦' }], delay: 600 },
    { channels: [{ id: 'airtel', state: 'selected',   note: 'Healthy â€” selected' }], delay: 700 },
    { channels: [{ id: 'airtel', state: 'success',    note: 'Confirmed âœ“' }], delay: 0 },
  ],
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function RoutingPage() {
  const addToast = useAppStore((s) => s.addToast)

  const [scenario, setScenario]     = useState<Scenario>('primary_success')
  const [channels, setChannels]     = useState<RouteChannel[]>(blankChannels)
  const [switchState, setSwitchState] = useState<'idle' | 'active' | 'done'>('idle')
  const [outcome, setOutcome]       = useState<'none' | 'success' | 'failed'>('none')
  const [running, setRunning]       = useState(false)
  const runRef                      = useRef(false)

  function reset() {
    runRef.current = false
    setRunning(false)
    setChannels(blankChannels())
    setSwitchState('idle')
    setOutcome('none')
  }

  async function runAnimation() {
    if (runRef.current) return
    reset()
    await new Promise<void>((r) => setTimeout(r, 50))
    runRef.current = true
    setRunning(true)
    setSwitchState('active')

    const frames = SCENARIO_FRAMES[scenario]

    for (const frame of frames) {
      if (!runRef.current) break
      setChannels((prev) => {
        const next = prev.map((c) => ({ ...c }))
        for (const patch of frame.channels) {
          const idx = next.findIndex((c) => c.id === patch.id)
          if (idx >= 0) Object.assign(next[idx], patch)
        }
        return next
      })
      if (frame.delay > 0) {
        await new Promise<void>((r) => setTimeout(r, frame.delay))
      }
    }

    if (!runRef.current) return

    const hasSuccess = scenario !== 'all_failed'
    const finalOutcome = hasSuccess ? 'success' : 'failed'
    setOutcome(finalOutcome)
    setSwitchState('done')

    const messages = {
      primary_success: 'Routed via primary channel â€” MTN Mobile Money',
      fallback:        'Primary failed â€” routed via fallback Airtel Money',
      all_failed:      'All channels failed â€” payment abandoned',
      reroute:         'MTN degraded â€” auto-rerouted to Airtel Money',
    }
    addToast(messages[scenario], hasSuccess ? 'success' : 'error')

    runRef.current = false
    setRunning(false)
  }

  const { data: rules = [] } = useQuery({ queryKey: ['routing-rules'], queryFn: routingApi.listRules })

  return (
    <div>
      <PageHeader
        title="Payment Routing"
        subtitle="Channel availability, routing rules, fee schedule, fallback configuration, and transaction priority"
      />

      {/* â”€â”€ Channel health grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <HealthGrid />

      <div className="grid grid-cols-5 gap-4">
        {/* â”€â”€ Routing animation (left, wider) â”€â”€â”€ */}
        <div className="col-span-2">
          <div className="bg-card rounded-card shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <GitBranch size={14} className="text-primary" /> Routing Diagram
              </h3>
              {running && (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Simulating
                </span>
              )}
            </div>

            {/* Scenario selector */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SCENARIOS.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => { setScenario(id); reset() }}
                  className={clsx(
                    'px-2.5 py-1 text-xs rounded-lg border font-medium transition-all',
                    scenario === id ? color : 'bg-surface border-border text-muted hover:text-slate-800',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Diagram */}
            <RoutingDiagram channels={channels} switchState={switchState} outcome={outcome} />

            {/* Controls */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={runAnimation}
                disabled={running}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60"
              >
                {running ? <><RefreshCw size={13} className="animate-spin" />Simulatingâ€¦</> : <><Play size={13} />Simulate Routing</>}
              </button>
              <button
                onClick={reset}
                className="px-3 py-2.5 border border-border rounded-xl text-muted hover:text-slate-800 transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-1">
              {[
                { color: 'bg-primary', label: 'Active route' },
                { color: 'bg-green-500', label: 'Success' },
                { color: 'bg-danger', label: 'Failed' },
                { color: 'bg-border', label: 'Idle / Skipped' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px] text-muted">
                  <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', color)} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* â”€â”€ Right: tabs â”€â”€â”€ */}
        <div className="col-span-3">
          <Tabs.Root defaultValue="rules">
            <Tabs.List className="flex gap-1 bg-surface p-1 rounded-xl border border-border mb-4">
              {[
                { val: 'rules',    label: 'Routing Rules',       icon: <Zap size={12} /> },
                { val: 'fees',     label: 'Fee Schedule',         icon: <ArrowRight size={12} /> },
                { val: 'fallback', label: 'Fallback Config',      icon: <GitBranch size={12} /> },
                { val: 'priority', label: 'Transaction Priority', icon: <ChevronDown size={12} /> },
              ].map(({ val, label, icon }) => (
                <Tabs.Trigger
                  key={val}
                  value={val}
                  className="flex items-center gap-1.5 flex-1 justify-center px-2 py-2 text-xs rounded-lg text-muted font-medium
                    data-[state=active]:bg-card data-[state=active]:text-slate-800 data-[state=active]:shadow-sm
                    hover:text-slate-700 transition-all"
                >
                  {icon}{label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Routing Rules */}
            <Tabs.Content value="rules">
              <div className="bg-card rounded-card shadow-card overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      {['#', 'Channel', 'Participant', 'Min', 'Max', 'Fee', 'Status'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-primary-50 transition-colors">
                        <td className="px-3 py-2.5 font-black text-primary text-sm">#{rule.priority}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{rule.channel}</td>
                        <td className="px-3 py-2.5 text-muted">{rule.participant}</td>
                        <td className="px-3 py-2.5 font-mono">{formatUGX(rule.minAmount)}</td>
                        <td className="px-3 py-2.5 font-mono">{formatUGX(rule.maxAmount)}</td>
                        <td className="px-3 py-2.5 font-semibold text-primary">
                          {rule.feeType === 'flat' ? formatUGX(rule.fee) : `${rule.fee}%`}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={clsx(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            rule.status === 'active'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200',
                          )}>
                            {rule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs.Content>

            {/* Fee Schedule */}
            <Tabs.Content value="fees">
              <div className="bg-card rounded-card shadow-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface">
                  <p className="text-xs font-semibold text-slate-800">Fee calculation example for UGX 500,000 payment</p>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      {['Channel', 'Fee Type', 'Rate', 'Fee on 500K', 'Net to Agency', 'Notes'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { channel: 'MTN Mobile Money', type: 'Percentage', rate: '0.5%',   fee: 2500,  net: 497500, note: 'Capped at UGX 25,000' },
                      { channel: 'Airtel Money',     type: 'Percentage', rate: '0.5%',   fee: 2500,  net: 497500, note: 'Capped at UGX 15,000' },
                      { channel: 'Stanbic Bank',     type: 'Flat',       rate: 'UGX 5K', fee: 5000,  net: 495000, note: 'Per transaction' },
                      { channel: 'Centenary Bank',   type: 'Flat',       rate: 'UGX 4K', fee: 4000,  net: 496000, note: 'Per transaction' },
                      { channel: 'Visa/Mastercard',  type: 'Percentage', rate: '1.5%',   fee: 7500,  net: 492500, note: 'Interchange + acquirer' },
                      { channel: 'USSD',             type: 'Flat',       rate: 'UGX 200',fee: 200,   net: 499800, note: 'Fixed USSD session fee' },
                    ].map((row) => (
                      <tr key={row.channel} className="hover:bg-primary-50 transition-colors">
                        <td className="px-3 py-3 font-semibold text-slate-800">{row.channel}</td>
                        <td className="px-3 py-3 text-muted">{row.type}</td>
                        <td className="px-3 py-3 font-mono text-primary font-bold">{row.rate}</td>
                        <td className="px-3 py-3 font-semibold text-danger">{formatUGX(row.fee)}</td>
                        <td className="px-3 py-3 font-semibold text-green-700">{formatUGX(row.net)}</td>
                        <td className="px-3 py-3 text-muted">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs.Content>

            {/* Fallback Config */}
            <Tabs.Content value="fallback">
              <div className="bg-card rounded-card shadow-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface">
                  <p className="text-xs font-semibold text-slate-800">Fallback routing rules â€” automatic rerouting on channel failure</p>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      {['Primary Channel', 'Fallback 1', 'Fallback 2', 'Trigger Condition'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fallbackConfig.map((row) => (
                      <tr key={row.primary} className="hover:bg-primary-50 transition-colors">
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            {row.primary}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 text-yellow-700">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                            {row.fallback1}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 text-muted">
                            <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                            {row.fallback2}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted">{row.trigger}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs.Content>

            {/* Transaction Priority */}
            <Tabs.Content value="priority">
              <div className="space-y-3">
                {txnPriorityLevels.map((p) => (
                  <div key={p.id} className={clsx('rounded-xl border p-4', p.color)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono">{p.id}</span>
                        <span className="text-sm font-bold">{p.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-white/40 px-2 py-0.5 rounded-full">SLA: {p.sla}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div><span className="opacity-60">Amount: </span><span className="font-semibold">{p.amountThreshold}</span></div>
                      <div className="opacity-60">{p.criteria}</div>
                    </div>
                  </div>
                ))}
                <div className="bg-surface border border-border rounded-xl p-4 text-xs text-muted">
                  <p className="font-semibold text-slate-700 mb-1">How priority works</p>
                  <p>The routing engine evaluates each payment against these tiers before selecting a channel. Higher-priority payments are placed in a dedicated fast-path queue and bypass batch processing lanes. SLA timers trigger alerts to the Operations Center if breached.</p>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  )
}
