import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { routingApi } from '../../services/mockApi'
import { useAppStore } from '../../store/appStore'
import { formatUGX } from '../../utils/format'
import { ArrowDown, Wifi, WifiOff } from 'lucide-react'
import clsx from 'clsx'
import type { RoutingRule, ChannelHealth } from '../../types'

type RouteState = 'idle' | 'primary' | 'fallback' | 'failed' | 'success'

const ROUTE_COLORS: Record<RouteState, string> = {
  idle:     'bg-surface border-border text-muted',
  primary:  'bg-primary border-primary text-white animate-pulse',
  fallback: 'bg-warning-light border-warning text-warning',
  failed:   'bg-danger-light border-danger text-danger',
  success:  'bg-success-light border-success text-success',
}

export default function RoutingPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [routeState, setRouteState] = useState<RouteState>('idle')
  const [testAmount, setTestAmount] = useState('500000')
  const [testChannel, setTestChannel] = useState('MTN Mobile Money')

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['routing-rules'],
    queryFn: routingApi.listRules,
  })
  const { data: health = [] } = useQuery({
    queryKey: ['channel-health'],
    queryFn: routingApi.listChannelHealth,
  })

  const { mutate: testRoute, isPending: testing } = useMutation({
    mutationFn: () => routingApi.testRoute(Number(testAmount), testChannel),
    onMutate: () => setRouteState('primary'),
    onSuccess: (result) => {
      setRouteState(result.success ? 'success' : result.fallback ? 'fallback' : 'failed')
      if (result.success) addToast('Route successful via primary channel', 'success')
      else if (result.fallback) addToast('Primary failed — routed via fallback', 'warning')
      else addToast('All routes failed', 'error')
    },
  })

  const healthColor = (status: ChannelHealth['status']) =>
    status === 'healthy' ? 'text-success' : status === 'degraded' ? 'text-warning' : 'text-danger'

  const routeNodes = [
    { label: 'Payer', sub: 'Initiates payment' },
    { label: 'GovPay Switch', sub: 'Route decision' },
    { label: testChannel, sub: routeState === 'idle' ? 'Waiting' : routeState === 'success' ? 'Confirmed' : routeState === 'failed' ? 'Failed' : 'Processing...' },
    { label: 'Government Agency', sub: 'Receives confirmation' },
  ]

  return (
    <div>
      <PageHeader title="Payment Routing" subtitle="Channel availability, routing rules, and fallback configuration" />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Routing Rules</h3>
          <DataTable<RoutingRule & Record<string, unknown>>
            columns={[
              { key: 'priority', header: 'Priority', sortable: true, width: 'w-16',
                render: (r) => <span className="text-xs font-bold text-primary">#{r.priority as number}</span> },
              { key: 'channel', header: 'Channel', sortable: true },
              { key: 'participant', header: 'Participant' },
              { key: 'fee', header: 'Fee',
                render: (r) => r.feeType === 'flat' ? formatUGX(r.fee as number) : `${r.fee as number}%` },
              { key: 'status', header: 'Status',
                render: (r) => <Badge variant={statusVariant(r.status as string)}>{r.status as string}</Badge> },
            ]}
            data={rules as (RoutingRule & Record<string, unknown>)[]}
            keyField="id"
            loading={rulesLoading}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Route Visualizer</h3>
            <div className="flex flex-col items-center gap-1 mb-4">
              {routeNodes.map((node, i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div className={clsx(
                    'w-full text-center px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-500',
                    i === 2 ? ROUTE_COLORS[routeState] : 'bg-surface border-border text-slate-700'
                  )}>
                    <div className="font-semibold">{node.label}</div>
                    <div className="text-[10px] opacity-70">{node.sub}</div>
                  </div>
                  {i < routeNodes.length - 1 && <ArrowDown size={14} className="text-muted my-1" />}
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Amount (UGX)</label>
                <input type="number" value={testAmount} onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Channel</label>
                <select value={testChannel} onChange={(e) => { setTestChannel(e.target.value); setRouteState('idle') }}
                  className="w-full border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 bg-white">
                  {['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'DFCU Bank'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => testRoute()} disabled={testing}
              className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-60">
              {testing ? 'Testing...' : 'Test Route'}
            </button>
          </div>

          <div className="bg-card rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Channel Health</h3>
            <div className="space-y-2">
              {health.map((h) => (
                <div key={h.participant} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    {h.status === 'down'
                      ? <WifiOff size={13} className={healthColor(h.status)} />
                      : <Wifi size={13} className={healthColor(h.status)} />}
                    <span className="text-xs font-medium">{h.participant.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${healthColor(h.status)}`}>{h.status}</div>
                    {h.status !== 'down' && <div className="text-[10px] text-muted">{h.latency}ms</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
