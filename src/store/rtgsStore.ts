// src/store/rtgsStore.ts
import { create } from 'zustand'
import type {
  RTGSTransaction, LiquidityPosition, RTGSException,
  SimulatorScenario, RTGSSimulatorRun, RTGSSimulatorNode, SimulatorNodeState,
} from '../types/rtgs'
import { mockSettlementQueue } from '../data/mockRtgs'
import { mockLiquidityPositions } from '../data/mockRtgsLiquidity'
import { mockRtgsExceptions } from '../data/mockRtgsExceptions'
import { useAppStore } from './appStore'

const SIMULATOR_NODES: RTGSSimulatorNode[] = [
  { id: 'originator',    label: 'Originating Institution',     description: 'Government Agency / Treasury / Bank submits instruction', state: 'idle' },
  { id: 'capture',       label: 'RTGS Instruction Capture',    description: 'Instruction received and parsed', state: 'idle' },
  { id: 'validation',    label: 'Validation Engine',           description: 'Format, limits, account checks', state: 'idle' },
  { id: 'compliance',    label: 'Compliance Screening',        description: 'AML / sanctions / FATF checks', state: 'idle' },
  { id: 'liquidity',     label: 'Liquidity Check',             description: 'Sender intraday position verified', state: 'idle' },
  { id: 'queue',         label: 'Settlement Queue',            description: 'Instruction queued for next window', state: 'idle' },
  { id: 'authorization', label: 'Central Bank Authorization',  description: 'CBU operator final approval', state: 'idle' },
  { id: 'execution',     label: 'Settlement Execution',        description: 'Debit sender, credit receiver', state: 'idle' },
  { id: 'confirmation',  label: 'Receiving Bank Confirmation', description: 'Receiver bank acknowledges credit', state: 'idle' },
  { id: 'ledger',        label: 'Treasury Ledger Update',      description: 'IFMS / accounting system updated', state: 'idle' },
]

type StepUpdate = { nodeId: string; state: Exclude<SimulatorNodeState, 'idle' | 'active'> }

const SCENARIO_STEPS: Record<SimulatorScenario, StepUpdate[][]> = {
  successful_settlement: SIMULATOR_NODES.map((n) => [{ nodeId: n.id, state: 'completed' }]),
  insufficient_liquidity: [
    [{ nodeId: 'originator', state: 'completed' }],
    [{ nodeId: 'capture', state: 'completed' }],
    [{ nodeId: 'validation', state: 'completed' }],
    [{ nodeId: 'compliance', state: 'completed' }],
    [{ nodeId: 'liquidity', state: 'failed' }],
    [{ nodeId: 'queue', state: 'skipped' }],
    [{ nodeId: 'authorization', state: 'skipped' }],
    [{ nodeId: 'execution', state: 'skipped' }],
    [{ nodeId: 'confirmation', state: 'skipped' }],
    [{ nodeId: 'ledger', state: 'skipped' }],
  ],
  queued_settlement: [
    [{ nodeId: 'originator', state: 'completed' }],
    [{ nodeId: 'capture', state: 'completed' }],
    [{ nodeId: 'validation', state: 'completed' }],
    [{ nodeId: 'compliance', state: 'completed' }],
    [{ nodeId: 'liquidity', state: 'completed' }],
    [{ nodeId: 'queue', state: 'waiting' }],
    [{ nodeId: 'authorization', state: 'completed' }],
    [{ nodeId: 'execution', state: 'completed' }],
    [{ nodeId: 'confirmation', state: 'completed' }],
    [{ nodeId: 'ledger', state: 'completed' }],
  ],
  rejected_settlement: [
    [{ nodeId: 'originator', state: 'completed' }],
    [{ nodeId: 'capture', state: 'completed' }],
    [{ nodeId: 'validation', state: 'failed' }],
    [{ nodeId: 'compliance', state: 'skipped' }],
    [{ nodeId: 'liquidity', state: 'skipped' }],
    [{ nodeId: 'queue', state: 'skipped' }],
    [{ nodeId: 'authorization', state: 'skipped' }],
    [{ nodeId: 'execution', state: 'skipped' }],
    [{ nodeId: 'confirmation', state: 'skipped' }],
    [{ nodeId: 'ledger', state: 'skipped' }],
  ],
  timeout: [
    [{ nodeId: 'originator', state: 'completed' }],
    [{ nodeId: 'capture', state: 'completed' }],
    [{ nodeId: 'validation', state: 'completed' }],
    [{ nodeId: 'compliance', state: 'completed' }],
    [{ nodeId: 'liquidity', state: 'completed' }],
    [{ nodeId: 'queue', state: 'completed' }],
    [{ nodeId: 'authorization', state: 'failed' }],
    [{ nodeId: 'execution', state: 'skipped' }],
    [{ nodeId: 'confirmation', state: 'skipped' }],
    [{ nodeId: 'ledger', state: 'skipped' }],
  ],
  manual_override: [
    [{ nodeId: 'originator', state: 'completed' }],
    [{ nodeId: 'capture', state: 'completed' }],
    [{ nodeId: 'validation', state: 'completed' }],
    [{ nodeId: 'compliance', state: 'completed' }],
    [{ nodeId: 'liquidity', state: 'completed' }],
    [{ nodeId: 'queue', state: 'completed' }],
    [{ nodeId: 'authorization', state: 'overridden' }],
    [{ nodeId: 'execution', state: 'completed' }],
    [{ nodeId: 'confirmation', state: 'completed' }],
    [{ nodeId: 'ledger', state: 'completed' }],
  ],
  reversal: SIMULATOR_NODES.map((n) => [{ nodeId: n.id, state: 'completed' }]),
}

interface RTGSState {
  settlementQueue: RTGSTransaction[]
  liquidityPositions: LiquidityPosition[]
  exceptions: RTGSException[]
  simulatorRun: RTGSSimulatorRun | null

  approveTransaction: (id: string, approver: string) => void
  rejectTransaction: (id: string, reason: string) => void
  holdTransaction: (id: string) => void
  releaseTransaction: (id: string) => void
  escalatePriority: (id: string) => void
  injectLiquidity: (bankId: string, amount: number) => void
  toggleWatchlist: (bankId: string) => void
  startSimulation: (scenario: SimulatorScenario, senderBank: string, receiverBank: string, amount: number) => void
  advanceSimulatorStep: () => void
  resetSimulator: () => void
  assignException: (id: string, officer: string) => void
  escalateException: (id: string) => void
  closeException: (id: string) => void
}

export const useRtgsStore = create<RTGSState>((set, get) => ({
  settlementQueue: mockSettlementQueue,
  liquidityPositions: mockLiquidityPositions,
  exceptions: mockRtgsExceptions,
  simulatorRun: null,

  approveTransaction: (id, approver) => {
    set((s) => ({
      settlementQueue: s.settlementQueue.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'processing' as const,
              approvalStatus: 'approved' as const,
              approvedBy: approver,
              auditLog: [...t.auditLog, { timestamp: new Date().toISOString(), actor: approver, action: 'APPROVED', detail: 'Approved by operator' }],
            }
          : t
      ),
    }))
    useAppStore.getState().addToast('Transaction approved and sent to settlement', 'success')
  },

  rejectTransaction: (id, reason) => {
    set((s) => ({
      settlementQueue: s.settlementQueue.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'failed' as const,
              approvalStatus: 'rejected' as const,
              failureReason: reason,
              auditLog: [...t.auditLog, { timestamp: new Date().toISOString(), actor: 'Operator', action: 'REJECTED', detail: reason }],
            }
          : t
      ),
    }))
    useAppStore.getState().addToast('Transaction rejected', 'error')
  },

  holdTransaction: (id) => {
    set((s) => ({
      settlementQueue: s.settlementQueue.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'held' as const,
              auditLog: [...t.auditLog, { timestamp: new Date().toISOString(), actor: 'Operator', action: 'HELD', detail: 'Placed on hold pending review' }],
            }
          : t
      ),
    }))
    useAppStore.getState().addToast('Transaction placed on hold', 'warning')
  },

  releaseTransaction: (id) => {
    set((s) => ({
      settlementQueue: s.settlementQueue.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'queued' as const,
              auditLog: [...t.auditLog, { timestamp: new Date().toISOString(), actor: 'Operator', action: 'RELEASED', detail: 'Hold released – returned to queue' }],
            }
          : t
      ),
    }))
    useAppStore.getState().addToast('Transaction released to queue', 'success')
  },

  escalatePriority: (id) => {
    set((s) => ({
      settlementQueue: s.settlementQueue.map((t) =>
        t.id === id
          ? {
              ...t,
              priority: 'critical' as const,
              status: 'high_priority' as const,
              auditLog: [...t.auditLog, { timestamp: new Date().toISOString(), actor: 'Operator', action: 'PRIORITY_ESCALATED', detail: 'Priority elevated to CRITICAL' }],
            }
          : t
      ),
    }))
    useAppStore.getState().addToast('Priority escalated to CRITICAL', 'warning')
  },

  injectLiquidity: (bankId, amount) => {
    set((s) => ({
      liquidityPositions: s.liquidityPositions.map((p) => {
        if (p.bankId !== bankId) return p
        const newUtilization = Math.max(0, p.utilizationPct - (amount / p.openingBalance) * 100)
        return {
          ...p,
          intradayLiquidity: p.intradayLiquidity + amount,
          availableLiquidity: p.availableLiquidity + amount,
          utilizationPct: newUtilization,
          riskLevel: newUtilization < 70 ? 'low' : newUtilization < 80 ? 'medium' : newUtilization < 90 ? 'high' : 'critical',
        } as LiquidityPosition
      }),
    }))
    useAppStore.getState().addToast('Liquidity injection confirmed', 'success')
  },

  toggleWatchlist: (bankId) => {
    const bank = get().liquidityPositions.find((p) => p.bankId === bankId)
    set((s) => ({
      liquidityPositions: s.liquidityPositions.map((p) =>
        p.bankId === bankId ? { ...p, onWatchlist: !p.onWatchlist } : p
      ),
    }))
    useAppStore.getState().addToast(
      bank?.onWatchlist ? 'Bank removed from watchlist' : 'Bank added to watchlist',
      'info'
    )
  },

  startSimulation: (scenario, senderBank, receiverBank, amount) => {
    const refNum = Math.floor(Math.random() * 900 + 100)
    set({
      simulatorRun: {
        scenario,
        currentStep: -1,
        nodes: SIMULATOR_NODES.map((n) => ({ ...n, state: 'idle' })),
        rtgsRef: `RTGS/2026/06/02/SIM${refNum}`,
        amount,
        senderBank,
        receiverBank,
        status: 'running',
        auditLog: [{ timestamp: new Date().toISOString(), actor: 'Simulator', action: 'STARTED', detail: `Scenario: ${scenario}` }],
      },
    })
  },

  advanceSimulatorStep: () => {
    const run = get().simulatorRun
    if (!run || run.status !== 'running') return

    const nextStep = run.currentStep + 1
    const stepsForScenario = SCENARIO_STEPS[run.scenario]

    if (nextStep >= stepsForScenario.length) {
      const allNodeStates = get().simulatorRun?.nodes.map((n) => n.state) ?? []
      const hasFailed = allNodeStates.some((s) => s === 'failed')
      const isWaiting = allNodeStates.some((s) => s === 'waiting')
      set((s) => ({
        simulatorRun: s.simulatorRun
          ? {
              ...s.simulatorRun,
              status: hasFailed ? 'failed' : 'completed',
              finalOutcome: hasFailed
                ? 'Settlement failed. Instruction returned to sender.'
                : isWaiting
                ? 'Settlement queued – awaiting next settlement window.'
                : 'Settlement executed. Final.',
              auditLog: [
                ...(s.simulatorRun?.auditLog ?? []),
                { timestamp: new Date().toISOString(), actor: 'Simulator', action: 'COMPLETED', detail: hasFailed ? 'Flow ended with failure' : 'Flow completed successfully' },
              ],
            }
          : null,
      }))
      return
    }

    const stepUpdates = stepsForScenario[nextStep]
    set((s) => {
      if (!s.simulatorRun) return {}
      const updatedNodes = s.simulatorRun.nodes.map((node) => {
        const update = stepUpdates.find((u) => u.nodeId === node.id)
        return update ? { ...node, state: update.state as SimulatorNodeState } : node
      })
      const activeNodeLabel = updatedNodes.find((n) => stepUpdates.some((u) => u.nodeId === n.id))?.label ?? ''
      return {
        simulatorRun: {
          ...s.simulatorRun,
          currentStep: nextStep,
          nodes: updatedNodes,
          auditLog: [
            ...s.simulatorRun.auditLog,
            { timestamp: new Date().toISOString(), actor: 'Simulator', action: 'STEP', detail: `Step ${nextStep + 1}: ${activeNodeLabel}` },
          ],
        },
      }
    })
  },

  resetSimulator: () => set({ simulatorRun: null }),

  assignException: (id, officer) => {
    set((s) => ({
      exceptions: s.exceptions.map((e) =>
        e.id === id
          ? {
              ...e,
              assignedTo: officer,
              status: 'investigating' as const,
              auditLog: [...e.auditLog, { timestamp: new Date().toISOString(), actor: 'Operator', action: 'ASSIGNED', detail: `Assigned to ${officer}` }],
            }
          : e
      ),
    }))
    useAppStore.getState().addToast(`Exception assigned to ${officer}`, 'success')
  },

  escalateException: (id) => {
    set((s) => ({
      exceptions: s.exceptions.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'escalated' as const,
              auditLog: [...e.auditLog, { timestamp: new Date().toISOString(), actor: 'Operator', action: 'ESCALATED', detail: 'Escalated to Senior Settlement Officer' }],
            }
          : e
      ),
    }))
    useAppStore.getState().addToast('Exception escalated', 'warning')
  },

  closeException: (id) => {
    set((s) => ({
      exceptions: s.exceptions.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'closed' as const,
              auditLog: [...e.auditLog, { timestamp: new Date().toISOString(), actor: 'Operator', action: 'CLOSED', detail: 'Exception resolved and closed' }],
            }
          : e
      ),
    }))
    useAppStore.getState().addToast('Exception closed', 'success')
  },
}))
