import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../../components/ui/PageHeader'
import { FlowDiagram, type FlowNode, type NodeState } from '../../features/simulator/FlowDiagram'
import { mockAgencies } from '../../data/mockAgencies'
import { useAppStore } from '../../store/appStore'
import { formatUGX, generateTxnId } from '../../utils/format'
import {
  Play, RotateCcw, CheckCircle2, XCircle, Clock,
  RefreshCw, ArrowLeftRight, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

type Scenario = 'success' | 'failed' | 'timeout' | 'retry' | 'reversal'

interface LogEntry {
  step: number
  label: string
  message: string
  state: NodeState
  ts: string
}

// ─── Node metadata ────────────────────────────────────────────────────────────
const NODES_META = [
  { id: 'citizen',    label: 'Citizen / Business',      baseDesc: 'Initiating payment request' },
  { id: 'portal',     label: 'Gov Service Portal',      baseDesc: 'Validating service reference' },
  { id: 'switch',     label: 'GovPay Switch',           baseDesc: 'Assigning transaction ID' },
  { id: 'validation', label: 'Validation Engine',       baseDesc: 'Checking PRN & limits' },
  { id: 'routing',    label: 'Routing Engine',          baseDesc: 'Selecting payment channel' },
  { id: 'channel',    label: 'Bank / MoMo / Card',      baseDesc: 'Processing debit instruction' },
  { id: 'confirm',    label: 'Confirmation',            baseDesc: 'Awaiting processor response' },
  { id: 'agency',     label: 'Government Agency',       baseDesc: 'Notifying collecting agency' },
  { id: 'treasury',   label: 'Treasury',                baseDesc: 'Crediting collection account' },
  { id: 'settlement', label: 'Settlement & Recon',      baseDesc: 'Creating ledger entry' },
]

// ─── Per-scenario step sequences ──────────────────────────────────────────────
// Each entry: { nodeIndex, state, description, logMsg, delay }
interface StepDef {
  nodeIndex: number
  state: NodeState
  description: string
  logMsg: string
  delay: number
}

function buildSequence(
  scenario: Scenario,
  txnId: string,
  payer: string,
  amount: number,
  channel: string,
  agency: string,
  prn: string,
): StepDef[][] {
  // Each outer array = one "frame" (set of node states at once).
  // We return the full state snapshot per frame.
  // Inner array = state for each node in that frame.
  const SPEED = 650 // ms per step

  const step = (nodeIndex: number, state: NodeState, description: string, logMsg: string, delay = SPEED): StepDef => ({
    nodeIndex, state, description, logMsg, delay,
  })

  if (scenario === 'success') {
    return [
      [step(0, 'active',     `Payment of ${formatUGX(amount)} initiated`,         `${payer} initiates payment — PRN ${prn} · ${formatUGX(amount)} to ${agency}`)],
      [step(0, 'completed',  `Payment initiated`,                                  `PRN ${prn} generated — citizen payment request received`),
       step(1, 'active',     `Validating service: ${agency}`,                      `Gov Service Portal validates ${agency} service reference`)],
      [step(1, 'completed',  `Service validated ✓`,                                `Service reference validated — amount ${formatUGX(amount)} confirmed`),
       step(2, 'active',     `Assigning TXN ID: ${txnId}`,                         `GovPay Switch assigned transaction ID ${txnId}`)],
      [step(2, 'completed',  `${txnId} assigned`,                                  `Transaction ${txnId} registered in switch — idempotency key stored`),
       step(3, 'active',     `Verifying PRN & daily limits`,                        `Validation Engine: PRN check, balance, daily limit, blacklist screening`)],
      [step(3, 'completed',  `Validation passed ✓`,                                `PRN valid, payer not blacklisted, within daily limit (UGX 5M)`),
       step(4, 'active',     `Selecting optimal route…`,                            `Routing Engine: ${channel} selected — latency 44ms, 99.2% uptime`)],
      [step(4, 'completed',  `Routed to ${channel}`,                               `Primary route: ${channel} — fee rate 0.5% — estimated 2s`),
       step(5, 'active',     `Debiting ${payer} via ${channel}`,                   `Debit instruction sent to ${channel} API — awaiting response`)],
      [step(5, 'completed',  `Debit confirmed by ${channel}`,                      `${channel} confirmed debit — ref: ${channel.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 99999)}`),
       step(6, 'active',     `Confirmation received`,                              `Switch received SUCCESS confirmation — marking transaction CONFIRMED`)],
      [step(6, 'completed',  `Transaction confirmed`,                              `Transaction ${txnId} status: COMPLETED — receipt generated`),
       step(7, 'active',     `Notifying ${agency}`,                                `Agency notification: ${agency} collection account credited — PRN marked PAID`)],
      [step(7, 'completed',  `${agency} notified ✓`,                              `${agency} acknowledged payment — collection record updated`),
       step(8, 'active',     `Crediting treasury account`,                         `BOU treasury collection account BOU-TREAS-001-${agency.slice(0, 3)} credited`)],
      [step(8, 'completed',  `Treasury credited ${formatUGX(amount)}`,            `Net amount ${formatUGX(Math.round(amount * 0.995))} credited after fees`),
       step(9, 'active',     `Creating settlement entry`,                          `Settlement ledger entry LEDG-${txnId.slice(-6)} created for EOD batch`)],
      [step(9, 'completed',  `Settlement ledger entry created`,                   `Batch BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001 updated`)],
    ]
  }

  if (scenario === 'failed') {
    return [
      [step(0, 'active',     `Payment initiated`,                                  `${payer} initiates payment — PRN ${prn} · ${formatUGX(amount)} to ${agency}`)],
      [step(0, 'completed',  `Initiated`,                                          `PRN ${prn} received by switch`),
       step(1, 'active',     `Validating service`,                                 `Gov Service Portal checking ${agency} reference`)],
      [step(1, 'completed',  `Portal validated`,                                   `Service reference valid`),
       step(2, 'active',     `Assigning TXN ID`,                                   `Switch assigns ${txnId}`)],
      [step(2, 'completed',  `${txnId} assigned`,                                  `Transaction registered`),
       step(3, 'active',     `Running validation checks`,                           `Checking PRN, balance, limits, blacklist…`)],
      [step(3, 'failed',     `FAILED — Validation Error`,                          `BLOCKED: ${payer} — account velocity limit exceeded (47 txns in 2h). Rule: VELOCITY_PAYER_2H_GT_40`),
       step(4, 'skipped',    `Skipped`,                                            `Not reached — transaction blocked at validation`),
       step(5, 'skipped',    `Skipped`,                                            ``),
       step(6, 'skipped',    `Skipped`,                                            ``),
       step(7, 'skipped',    `Skipped`,                                            ``),
       step(8, 'skipped',    `Skipped`,                                            ``),
       step(9, 'skipped',    `Skipped`,                                            ``)],
    ]
  }

  if (scenario === 'timeout') {
    return [
      [step(0, 'active',     `Payment initiated`,                                  `${payer} initiates payment — PRN ${prn}`)],
      [step(0, 'completed',  `Initiated`,                                          `Request received`),
       step(1, 'active',     `Validating`,                                         `Portal validates service`)],
      [step(1, 'completed',  `Validated`,                                          `Reference OK`),
       step(2, 'active',     `Assigning TXN ID`,                                   `Switch assigns ${txnId}`)],
      [step(2, 'completed',  `${txnId} assigned`,                                  `Transaction registered`),
       step(3, 'active',     `Validation running`,                                  `PRN and limit checks…`)],
      [step(3, 'completed',  `Validation passed`,                                  `All checks passed`),
       step(4, 'active',     `Routing — selecting channel…`,                        `Routing Engine querying ${channel} health check…`, 1200)],
      [step(4, 'failed',     `TIMEOUT — Routing Engine`,                           `TIMEOUT: ${channel} health check did not respond within 30s. Fallback channels exhausted. Transaction ABANDONED.`),
       step(5, 'skipped',    `Skipped`,                                            ``),
       step(6, 'skipped',    `Skipped`,                                            ``),
       step(7, 'skipped',    `Skipped`,                                            ``),
       step(8, 'skipped',    `Skipped`,                                            ``),
       step(9, 'skipped',    `Skipped`,                                            ``)],
    ]
  }

  if (scenario === 'retry') {
    return [
      [step(0, 'active',     `Payment initiated`,                                  `${payer} initiates — PRN ${prn} · ${formatUGX(amount)} to ${agency}`)],
      [step(0, 'completed',  `Initiated`,                                          `PRN received`),
       step(1, 'active',     `Validating`,                                         `Portal validates`)],
      [step(1, 'completed',  `Validated`,                                          `Reference OK`),
       step(2, 'active',     `Assigning TXN ID`,                                   `Switch assigns ${txnId}`)],
      [step(2, 'completed',  `${txnId} assigned`,                                  `Registered`),
       step(3, 'active',     `Validation running`,                                  `PRN and limits…`)],
      [step(3, 'completed',  `Validation passed`,                                  `All checks passed`),
       step(4, 'active',     `Routing`,                                             `${channel} selected`)],
      [step(4, 'completed',  `Route: ${channel}`,                                  `Primary route confirmed`),
       step(5, 'active',     `Sending debit instruction (attempt 1/3)`,            `Debit instruction sent to ${channel}…`, 800)],
      // Retry frame
      [step(5, 'retrying',   `RETRY 1/3 — ${channel} timed out`,                  `RETRY 1/3: ${channel} API timeout (5s). Retrying in 2s…`, 1400)],
      [step(5, 'active',     `Attempt 2/3 — resending`,                            `Retry 2 sent to ${channel}…`, 800)],
      [step(5, 'completed',  `Debit confirmed on retry`,                           `${channel} responded SUCCESS on attempt 2/3 — ref confirmed`),
       step(6, 'active',     `Confirmation received`,                              `Marking CONFIRMED`)],
      [step(6, 'completed',  `Confirmed`,                                          `Transaction ${txnId} COMPLETED`),
       step(7, 'active',     `Notifying ${agency}`,                                `Agency notified`)],
      [step(7, 'completed',  `${agency} notified`,                                 `PRN marked PAID`),
       step(8, 'active',     `Crediting treasury`,                                 `BOU account credited`)],
      [step(8, 'completed',  `Treasury credited`,                                  `Net ${formatUGX(Math.round(amount * 0.995))} after fees`),
       step(9, 'active',     `Settlement entry`,                                   `Ledger entry created`)],
      [step(9, 'completed',  `Complete — recovered via retry`,                     `Settlement batch updated`)],
    ]
  }

  // Reversal
  return [
    [step(0, 'active',     `Payment initiated`,                                  `${payer} — PRN ${prn}`)],
    [step(0, 'completed',  `Initiated`,                                          `Received`),
     step(1, 'active',     `Validating`,                                         `Portal validates`)],
    [step(1, 'completed',  `Validated`,                                          `OK`),
     step(2, 'active',     `${txnId} assigned`,                                  `Registered`)],
    [step(2, 'completed',  `Assigned`,                                           `Switch registered`),
     step(3, 'active',     `Validation`,                                          `Checks…`)],
    [step(3, 'completed',  `Passed`,                                             `OK`),
     step(4, 'active',     `Routing`,                                             `${channel} selected`)],
    [step(4, 'completed',  `Routed`,                                             `${channel} primary`),
     step(5, 'active',     `Processing`,                                          `Debit sent`)],
    [step(5, 'completed',  `Debit confirmed`,                                    `${channel} SUCCESS`),
     step(6, 'active',     `Confirming`,                                          `Marking confirmed`)],
    [step(6, 'completed',  `Confirmed`,                                          `COMPLETED`),
     step(7, 'active',     `Agency notified`,                                    `${agency} notified`)],
    [step(7, 'completed',  `${agency} notified`,                                 `PRN PAID`),
     step(8, 'active',     `Treasury credited`,                                  `BOU credited`)],
    [step(8, 'completed',  `Treasury credited`,                                  `Done`),
     step(9, 'active',     `Settlement entry`,                                   `Ledger created`)],
    [step(9, 'completed',  `Settlement complete`,                                `Batch updated`)],
    // Now reversal kicks in
    [step(9, 'reversing',  `REVERSAL — Reversal request received`,               `⚠ Citizen disputed payment — reversal initiated by ${agency}`)],
    [step(9, 'reversing',  `Reversing settlement entry`,                         `Settlement ledger entry REVERSED — net position adjusted`),
     step(8, 'reversing',  `Reversing treasury credit`,                          `Treasury account debited — funds returned to switch float`)],
    [step(7, 'reversing',  `Reversing agency notification`,                      `${agency} notified — PRN marked REVERSED`),
     step(6, 'reversing',  `Issuing reversal confirmation`,                      `Reversal confirmation dispatched to ${payer}`)],
    [step(5, 'reversing',  `Reversing channel debit`,                            `Credit instruction sent to ${channel} — ${payer} wallet refund initiated`),
     step(4, 'reversing',  `Routing reversal`,                                   `Reversal routed via original channel`)],
    [step(3, 'reversing',  `Reversal validated`,                                 `Reversal request validated — within 24h reversal window`),
     step(2, 'reversing',  `Reversal TXN created`,                               `REV-${txnId} registered in switch`)],
    [step(2, 'completed',  `Reversal complete`,                                  `Original TXN ${txnId} marked REVERSED`),
     step(1, 'completed',  `Portal updated`,                                     `Service portal status updated to REVERSED`),
     step(0, 'completed',  `Refund issued to ${payer}`,                          `Citizen refund: ${formatUGX(amount)} returned via ${channel}`)],
  ]
}

// ─── Scenario tab config ──────────────────────────────────────────────────────
const SCENARIOS: { id: Scenario; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: 'success',  label: 'Success',   desc: 'All 10 nodes complete',               icon: CheckCircle2,    color: 'text-green-700 bg-green-50 border-green-200' },
  { id: 'failed',   label: 'Failed',    desc: 'Blocked at validation (AML rule)',     icon: XCircle,         color: 'text-danger bg-red-50 border-red-200' },
  { id: 'timeout',  label: 'Timeout',   desc: 'Routing engine does not respond',      icon: Clock,           color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { id: 'retry',    label: 'Retry',     desc: 'Channel fails → retries → succeeds',  icon: RefreshCw,       color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { id: 'reversal', label: 'Reversal',  desc: 'Completes then reverses end-to-end',  icon: ArrowLeftRight,  color: 'text-purple-700 bg-purple-50 border-purple-200' },
]

const FINAL_TOAST: Record<Scenario, { msg: string; variant: 'success' | 'error' | 'warning' | 'info' }> = {
  success:  { msg: 'Transaction completed successfully',                       variant: 'success' },
  failed:   { msg: 'Transaction blocked — AML velocity rule triggered',        variant: 'error' },
  timeout:  { msg: 'Transaction abandoned — routing engine timeout',           variant: 'warning' },
  retry:    { msg: 'Transaction completed via retry (attempt 2/3)',            variant: 'success' },
  reversal: { msg: 'Transaction reversed — full refund issued to citizen',    variant: 'info' },
}

// ─── Blank node states ────────────────────────────────────────────────────────
function blankNodes(): FlowNode[] {
  return NODES_META.map((n) => ({ ...n, description: n.baseDesc, state: 'idle' as NodeState }))
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const addToast = useAppStore((s) => s.addToast)

  const [nodes, setNodes]       = useState<FlowNode[]>(blankNodes)
  const [scenario, setScenario] = useState<Scenario>('success')
  const [running, setRunning]   = useState(false)
  const [done, setDone]         = useState(false)
  const [txnId, setTxnId]       = useState('')
  const [log, setLog]           = useState<LogEntry[]>([])

  // Inputs
  const [payer,   setPayer]   = useState('Mugisha Robert')
  const [amount,  setAmount]  = useState('250000')
  const [agency,  setAgency]  = useState(mockAgencies[0].shortName)
  const [channel, setChannel] = useState('MTN Mobile Money')

  const runningRef = useRef(false)

  function reset() {
    runningRef.current = false
    setRunning(false)
    setDone(false)
    setTxnId('')
    setLog([])
    setNodes(blankNodes())
  }

  async function simulate() {
    if (runningRef.current) return
    reset()
    await new Promise<void>((r) => setTimeout(r, 80))

    runningRef.current = true
    setRunning(true)
    setDone(false)
    setLog([])

    const id  = generateTxnId()
    const prn = `PRN${Date.now().toString().slice(-8)}`
    setTxnId(id)

    const sequence = buildSequence(scenario, id, payer, Number(amount), channel, agency, prn)

    for (const frame of sequence) {
      if (!runningRef.current) break

      // Apply the frame: start from current nodes, merge new states
      setNodes((prev) => {
        const next = prev.map((n) => ({ ...n }))
        for (const s of frame) {
          if (next[s.nodeIndex]) {
            next[s.nodeIndex].state       = s.state
            next[s.nodeIndex].description = s.description
          }
        }
        return next
      })

      // Log only the primary (first) step in the frame if it has a message
      const primary = frame[0]
      if (primary.logMsg) {
        const now = new Date().toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLog((l) => [{
          step:    primary.nodeIndex + 1,
          label:   NODES_META[primary.nodeIndex]?.label ?? '',
          message: primary.logMsg,
          state:   primary.state,
          ts:      now,
        }, ...l])
      }

      const delay = frame.reduce((max, s) => Math.max(max, s.delay), 650)
      await new Promise<void>((r) => setTimeout(r, delay))
    }

    if (runningRef.current) {
      const toast = FINAL_TOAST[scenario]
      addToast(`${id} — ${toast.msg}`, toast.variant)
      setDone(true)
    }
    runningRef.current = false
    setRunning(false)
  }

  const finalState = done
    ? ({ success: 'COMPLETED', failed: 'BLOCKED', timeout: 'ABANDONED', retry: 'COMPLETED (retry)', reversal: 'REVERSED' })[scenario]
    : null

  return (
    <div>
      <PageHeader
        title="Payment Flow Simulator"
        subtitle="Animate a payment through all 10 nodes of the GovPay Switch"
      />

      {/* Scenario selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {SCENARIOS.map(({ id, label, desc, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => { setScenario(id); reset() }}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
              scenario === id
                ? color + ' shadow-sm'
                : 'bg-card border-border text-muted hover:text-slate-800 hover:border-slate-300',
            )}
          >
            <Icon size={13} />
            <span className="font-semibold">{label}</span>
            <span className="hidden sm:inline opacity-60">— {desc}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* ── Flow diagram (left, wider) ─── */}
        <div className="col-span-2">
          <div className="bg-card rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Payment Flow</h3>
              {running && (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Simulating…
                </span>
              )}
              {done && (
                <span className={clsx(
                  'text-xs font-bold px-2.5 py-1 rounded-full border',
                  scenario === 'success' || scenario === 'retry' ? 'bg-green-100 text-green-700 border-green-200' :
                  scenario === 'reversal' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  'bg-red-100 text-red-700 border-red-200',
                )}>
                  {finalState}
                </span>
              )}
            </div>
            <FlowDiagram nodes={nodes} />
          </div>
        </div>

        {/* ── Right column ─── */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Transaction info bar */}
          <AnimatePresence>
            {txnId && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-card shadow-card px-5 py-3 flex flex-wrap items-center gap-4 text-xs border-l-4 border-l-primary"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-muted">TXN ID</span>
                  <span className="font-mono font-bold text-primary">{txnId}</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div><span className="text-muted">Amount: </span><span className="font-bold text-slate-800">{formatUGX(Number(amount))}</span></div>
                <div className="h-3 w-px bg-border" />
                <div><span className="text-muted">Payer: </span><span className="font-medium">{payer}</span></div>
                <div className="h-3 w-px bg-border" />
                <div><span className="text-muted">Channel: </span><span className="font-medium">{channel}</span></div>
                <div className="h-3 w-px bg-border" />
                <div><span className="text-muted">Agency: </span><span className="font-medium">{agency}</span></div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment details form */}
            <div className="bg-card rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <Field label="Payer Name">
                  <input value={payer} onChange={(e) => setPayer(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </Field>
                <Field label="Amount (UGX)">
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </Field>
                <Field label="Government Agency">
                  <select value={agency} onChange={(e) => setAgency(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 bg-white">
                    {mockAgencies.map((a) => <option key={a.id}>{a.shortName}</option>)}
                  </select>
                </Field>
                <Field label="Payment Channel">
                  <select value={channel} onChange={(e) => setChannel(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 bg-white">
                    {['MTN Mobile Money', 'Airtel Money', 'Bank Transfer', 'Visa/Mastercard', 'USSD'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={simulate}
                  disabled={running}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-60"
                >
                  {running
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Simulating…</>
                    : <><Play size={15} />Simulate Payment</>
                  }
                </button>
                <button onClick={reset}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-border text-muted rounded-xl text-sm hover:text-slate-800 transition-colors">
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* Scenario legend */}
              <div className="mt-4 pt-3 border-t border-border space-y-1">
                {SCENARIOS.map(({ id, label, desc, icon: Icon }) => (
                  <div key={id} className={clsx('flex items-center gap-2 text-xs', scenario === id ? 'text-slate-800 font-medium' : 'text-muted')}>
                    <Icon size={11} className="flex-shrink-0" />
                    <span className="font-semibold">{label}:</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live event log */}
            <div className="bg-card rounded-card shadow-card p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Event Log</h3>
                {running && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                {log.length > 0 && <span className="text-xs text-muted ml-auto">{log.length} events</span>}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-72 min-h-32">
                {log.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <Play size={20} className="text-muted/40 mb-2" />
                    <p className="text-xs text-muted">Click "Simulate Payment" to start</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {log.map((entry, i) => (
                      <motion.div
                        key={`${entry.ts}-${i}`}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={clsx(
                          'flex gap-2.5 p-2 rounded-lg border text-xs',
                          entry.state === 'completed' && 'bg-green-50 border-green-100',
                          entry.state === 'failed'    && 'bg-red-50 border-red-100',
                          entry.state === 'retrying'  && 'bg-orange-50 border-orange-100',
                          entry.state === 'reversing' && 'bg-purple-50 border-purple-100',
                          entry.state === 'active'    && 'bg-primary/5 border-primary/10',
                          entry.state === 'skipped'   && 'bg-surface border-border opacity-50',
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <ChevronRight size={11} className={clsx(
                            entry.state === 'completed' && 'text-green-500',
                            entry.state === 'failed'    && 'text-danger',
                            entry.state === 'retrying'  && 'text-orange-500',
                            entry.state === 'reversing' && 'text-purple-500',
                            entry.state === 'active'    && 'text-primary',
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[11px] text-slate-700 mb-0.5">
                            Step {entry.step} — {entry.label}
                          </div>
                          <div className="text-muted leading-relaxed">{entry.message}</div>
                        </div>
                        <div className="font-mono text-[10px] text-muted/60 flex-shrink-0">{entry.ts}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted mb-1 block">{label}</label>
      {children}
    </div>
  )
}
