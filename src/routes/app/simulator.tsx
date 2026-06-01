import { useState, useCallback } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge, statusVariant } from '../../components/ui/Badge'
import { FlowDiagram, type FlowNode, type NodeState } from '../../features/simulator/FlowDiagram'
import { mockAgencies } from '../../data/mockAgencies'
import { useAppStore } from '../../store/appStore'
import { formatUGX, generateTxnId } from '../../utils/format'
import { Play, RotateCcw } from 'lucide-react'

type Scenario = 'success' | 'failed' | 'timeout' | 'reversal'

const NODE_LABELS = [
  { id: 'citizen',    label: 'Citizen / Business' },
  { id: 'portal',     label: 'Gov Service Portal' },
  { id: 'switch',     label: 'GovPay Switch' },
  { id: 'validation', label: 'Validation Engine' },
  { id: 'routing',    label: 'Routing Engine' },
  { id: 'channel',    label: 'Bank / MoMo / Card' },
  { id: 'confirm',    label: 'Confirmation' },
  { id: 'agency',     label: 'Gov Agency' },
  { id: 'treasury',   label: 'Treasury' },
  { id: 'settlement', label: 'Settlement & Recon' },
]

const SCENARIO_MAX_STEP: Record<Scenario, number> = {
  success: 10, failed: 4, timeout: 5, reversal: 10,
}

const SCENARIO_FINAL_STATE: Record<Scenario, NodeState> = {
  success: 'completed', failed: 'failed', timeout: 'failed', reversal: 'completed',
}

function buildNodes(step: number, scenario: Scenario): FlowNode[] {
  return NODE_LABELS.map((n, i) => {
    if (step < 0 || i > step) return { ...n, state: 'idle' as NodeState }
    if (i < step) {
      if (scenario === 'failed' && i >= 3) return { ...n, state: 'skipped' as NodeState }
      if (scenario === 'timeout' && i >= 4) return { ...n, state: 'skipped' as NodeState }
      return { ...n, state: SCENARIO_FINAL_STATE[scenario] }
    }
    return { ...n, state: i === step ? 'active' : 'idle' as NodeState }
  })
}

export default function SimulatorPage() {
  const addToast = useAppStore((s) => s.addToast)
  const [step, setStep] = useState(-1)
  const [scenario, setScenario] = useState<Scenario>('success')
  const [running, setRunning] = useState(false)
  const [txnId, setTxnId] = useState('')
  const [amount, setAmount] = useState('250000')
  const [payer, setPayer] = useState('Mugisha Robert')
  const [agency, setAgency] = useState(mockAgencies[0].shortName)
  const [channel, setChannel] = useState('MTN Mobile Money')

  const nodes = step >= 0 ? buildNodes(step, scenario) : NODE_LABELS.map((n) => ({ ...n, state: 'idle' as NodeState }))
  const maxStep = SCENARIO_MAX_STEP[scenario]
  const isDone = !running && step >= maxStep

  const simulate = useCallback(async () => {
    if (running) return
    setRunning(true)
    setStep(0)
    const id = generateTxnId()
    setTxnId(id)
    for (let i = 1; i <= maxStep; i++) {
      await new Promise<void>((res) => setTimeout(res, 600))
      setStep(i)
    }
    setRunning(false)
    if (scenario === 'success') addToast(`Transaction ${id} completed successfully`, 'success')
    else if (scenario === 'failed') addToast(`Transaction ${id} failed at validation`, 'error')
    else if (scenario === 'timeout') addToast(`Transaction ${id} timed out — routing engine`, 'warning')
    else addToast(`Transaction ${id} reversed`, 'info')
  }, [running, scenario, maxStep, addToast])

  function reset() {
    setStep(-1)
    setRunning(false)
    setTxnId('')
  }

  const finalState = isDone ? SCENARIO_FINAL_STATE[scenario] : null

  return (
    <div>
      <PageHeader title="Payment Flow Simulator" subtitle="Animate a payment through the GovPay Switch end-to-end" />

      <div className="flex gap-2 mb-5">
        {(['success', 'failed', 'timeout', 'reversal'] as Scenario[]).map((s) => (
          <button
            key={s}
            onClick={() => { setScenario(s); reset() }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${scenario === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted hover:text-slate-800'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-card shadow-card p-6 mb-4 overflow-x-auto">
        <FlowDiagram nodes={nodes} />
      </div>

      {txnId && (
        <div className="bg-card rounded-card shadow-card p-4 mb-4 flex flex-wrap items-center gap-6 text-sm">
          <div><span className="text-muted">ID: </span><span className="font-mono font-medium">{txnId}</span></div>
          <div><span className="text-muted">Amount: </span><span className="font-semibold">{formatUGX(Number(amount))}</span></div>
          <div><span className="text-muted">Payer: </span><span>{payer}</span></div>
          <div><span className="text-muted">Channel: </span><span>{channel}</span></div>
          {isDone && finalState && (
            <div className="ml-auto">
              <Badge variant={statusVariant(finalState)}>{finalState.toUpperCase()}</Badge>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Payer Name</label>
              <input value={payer} onChange={(e) => setPayer(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Amount (UGX)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Agency</label>
              <select value={agency} onChange={(e) => setAgency(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 bg-white">
                {mockAgencies.map((a) => <option key={a.id}>{a.shortName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Payment Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 bg-white">
                {['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Simulate</h3>
          <button
            onClick={simulate}
            disabled={running}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            <Play size={16} />
            {running ? 'Simulating...' : 'Simulate Payment'}
          </button>
          <button onClick={reset}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-border text-muted rounded-xl text-sm hover:text-slate-800 transition-colors">
            <RotateCcw size={14} />
            Reset
          </button>
          <div className="mt-2 text-xs text-muted space-y-1">
            <p><span className="font-medium">Success</span> — all 10 nodes complete</p>
            <p><span className="font-medium">Failed</span> — fails at validation (node 4)</p>
            <p><span className="font-medium">Timeout</span> — hangs at routing engine</p>
            <p><span className="font-medium">Reversal</span> — completes then reverses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
