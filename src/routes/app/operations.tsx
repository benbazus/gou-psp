import { PageHeader } from '../../components/ui/PageHeader'
import { AreaChart } from '../../components/charts/AreaChart'
import { Badge } from '../../components/ui/Badge'
import { useAppStore } from '../../store/appStore'
import { AnimatePresence, motion } from 'framer-motion'
import { timeAgo } from '../../utils/format'
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

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
  { name: 'Message Queue',      status: 'healthy',  latency: 15  },
  { name: 'Audit Logger',       status: 'healthy',  latency: 22  },
  { name: 'Webhook Dispatcher', status: 'healthy',  latency: 48  },
]

// Approximate Uganda region positions within a 300x360 viewBox
const REGIONS = [
  { name: 'Kampala',     x: 148, y: 210, volume: 18400 },
  { name: 'Wakiso',      x: 138, y: 222, volume: 9200  },
  { name: 'Mukono',      x: 165, y: 208, volume: 4100  },
  { name: 'Jinja',       x: 190, y: 195, volume: 3200  },
  { name: 'Mbarara',     x: 118, y: 285, volume: 2800  },
  { name: 'Gulu',        x: 148, y: 100, volume: 1900  },
  { name: 'Mbale',       x: 215, y: 168, volume: 2100  },
  { name: 'Arua',        x: 82,  y: 88,  volume: 1100  },
  { name: 'Fort Portal', x: 88,  y: 210, volume: 1400  },
  { name: 'Masaka',      x: 128, y: 265, volume: 1700  },
]

const SUCCESS_FAILURE_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  success: 18000 + Math.floor(Math.random() * 4000),
  failed: 200 + Math.floor(Math.random() * 600),
}))

const INCIDENTS = [
  { id: 'INC-001', description: 'DFCU Bank API timeout — 89 transactions queued', severity: 'high',   at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'INC-002', description: 'Notification service degraded — latency 280ms',  severity: 'medium', at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'INC-003', description: 'Settlement batch DFCU failed — retry initiated',  severity: 'high',   at: new Date(Date.now() - 18 * 3600000).toISOString() },
]

const maxVol = Math.max(...REGIONS.map((r) => r.volume))

type CompStatus = 'healthy' | 'degraded' | 'down'

function healthColor(status: CompStatus) {
  return status === 'healthy' ? 'text-success' : status === 'degraded' ? 'text-warning' : 'text-danger'
}

export default function OperationsPage() {
  const liveTransactions = useAppStore((s) => s.liveTransactions)
  const healthyCnt = SYSTEM_COMPONENTS.filter((c) => c.status === 'healthy').length
  const degradedCnt = SYSTEM_COMPONENTS.filter((c) => c.status === 'degraded').length

  return (
    <div>
      <PageHeader
        title="Real-time Operations Center"
        subtitle="Live system health, regional activity, and incident monitoring"
        actions={
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {healthyCnt} Healthy
            </span>
            {degradedCnt > 0 && (
              <span className="flex items-center gap-1.5 text-warning">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                {degradedCnt} Degraded
              </span>
            )}
          </div>
        }
      />

      {/* System component health grid */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {SYSTEM_COMPONENTS.map((comp) => {
          const status = comp.status as CompStatus
          return (
            <div key={comp.name} className="bg-card rounded-lg shadow-card p-3 flex items-center gap-2">
              {status === 'down'
                ? <WifiOff size={13} className={healthColor(status)} />
                : <Wifi size={13} className={healthColor(status)} />}
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-800 truncate">{comp.name}</div>
                <div className={`text-[10px] ${healthColor(status)}`}>{comp.latency}ms</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Uganda map */}
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Regional Activity</h3>
          <div className="relative" style={{ paddingBottom: '120%' }}>
            <svg viewBox="0 0 300 360" className="absolute inset-0 w-full h-full" fill="none">
              {/* Simplified Uganda outline */}
              <path
                d="M80,70 L100,50 L140,45 L180,55 L220,60 L240,90 L235,130 L240,160 L230,200 L220,240 L200,280 L170,310 L140,320 L110,305 L90,280 L75,250 L65,210 L70,170 L75,130 L72,100 Z"
                stroke="#E2E8F0" strokeWidth="2" fill="#F5F7FA"
              />
              {/* Lake Victoria approximation */}
              <ellipse cx="180" cy="285" rx="28" ry="18" fill="#DBEAFE" opacity="0.6" />
              {REGIONS.map((r) => {
                const radius = 4 + (r.volume / maxVol) * 14
                return (
                  <g key={r.name}>
                    <motion.circle
                      cx={r.x} cy={r.y} r={radius}
                      fill="#1B3A6B" fillOpacity={0.15}
                      animate={{ r: [radius, radius + 4, radius] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                    />
                    <circle cx={r.x} cy={r.y} r={radius / 2} fill="#1B3A6B" fillOpacity={0.7} />
                    <text x={r.x} y={r.y - radius - 3} textAnchor="middle" fontSize="7" fill="#64748B">
                      {r.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Live stream */}
        <div className="bg-card rounded-card shadow-card p-4 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-800">Live Transaction Stream</h3>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            <AnimatePresence mode="popLayout" initial={false}>
              {liveTransactions.slice(0, 12).map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between text-xs py-1 border-b border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={clsx(
                      'w-1.5 h-1.5 rounded-full flex-shrink-0',
                      tx.status === 'completed' ? 'bg-success' :
                      tx.status === 'failed' ? 'bg-danger' : 'bg-warning'
                    )} />
                    <span className="font-mono truncate">{tx.id}</span>
                  </div>
                  <span className="text-muted flex-shrink-0 ml-2">{timeAgo(tx.timestamp)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Queue + incidents */}
        <div className="space-y-4">
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Queue Depths</h3>
            {[
              { label: 'Payment Processing', value: 1247, max: 5000 },
              { label: 'Settlement Queue',   value: 892,  max: 2000 },
              { label: 'Webhook Dispatch',   value: 341,  max: 1000 },
            ].map((q) => (
              <div key={q.label} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{q.label}</span>
                  <span className="font-medium">{q.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(q.value / q.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-warning" /> Incidents
            </h3>
            {INCIDENTS.map((inc) => (
              <div key={inc.id} className="text-xs py-2 border-b border-border last:border-0">
                <div className="flex items-start gap-1.5">
                  <Badge variant={inc.severity === 'high' ? 'danger' : 'warning'} className="flex-shrink-0 mt-0.5">
                    {inc.severity}
                  </Badge>
                  <span className="text-slate-700">{inc.description}</span>
                </div>
                <div className="text-muted mt-0.5">{timeAgo(inc.at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success/failure chart */}
      <div className="bg-card rounded-card shadow-card p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">24-Hour Success vs Failure Volume</h3>
        <AreaChart
          data={SUCCESS_FAILURE_DATA}
          xKey="hour"
          areas={[
            { key: 'success', color: '#16A34A', name: 'Success' },
            { key: 'failed',  color: '#D62828', name: 'Failed' },
          ]}
          height={180}
        />
      </div>
    </div>
  )
}
